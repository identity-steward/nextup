import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  try {
    // Verify admin JWT independently
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: authError } = await adminClient.auth.getUser(token);

    if (authError || !userData.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const callerRole = (userData.user.app_metadata?.role as string) ?? null;
    if (callerRole !== "admin") {
      return new Response(JSON.stringify({ error: "Forbidden — admin only" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { mediaUploadId, action } = body as { mediaUploadId: string; action: "quarantine" | "restore" };

    if (!mediaUploadId || !action) {
      return new Response(JSON.stringify({ error: "mediaUploadId and action required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch media record
    const { data: media, error: fetchError } = await adminClient
      .from("media_uploads")
      .select("id, storage_path, bucket, consent_status")
      .eq("id", mediaUploadId)
      .maybeSingle();

    if (fetchError || !media) {
      return new Response(JSON.stringify({ error: "Media record not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const mediaData = media as { id: string; storage_path: string; bucket: string; consent_status: string };
    const originalPath = mediaData.storage_path;
    const originalBucket = mediaData.bucket;
    const quarantineBucket = "media-quarantine";
    const quarantinePath = `${mediaData.id}/${originalPath.split("/").pop()}`;

    if (action === "quarantine") {
      // Step 1: Download the original file
      const { data: fileData, error: downloadError } = await adminClient.storage
        .from(originalBucket)
        .download(originalPath);

      if (downloadError || !fileData) {
        await logAudit(adminClient, mediaUploadId, "quarantine_download_failed", userData.user.id, originalPath, quarantinePath);
        return new Response(JSON.stringify({ error: "Failed to download file for quarantine" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Step 2: Upload to quarantine bucket
      const { error: uploadError } = await adminClient.storage
        .from(quarantineBucket)
        .upload(quarantinePath, fileData, { upsert: true });

      if (uploadError) {
        await logAudit(adminClient, mediaUploadId, "quarantine_upload_failed", userData.user.id, originalPath, quarantinePath);
        return new Response(JSON.stringify({ error: "Failed to upload to quarantine" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Step 3: Delete original
      const { error: deleteError } = await adminClient.storage
        .from(originalBucket)
        .remove([originalPath]);

      if (deleteError) {
        // File is quarantined but original still exists — access is already cut off via consent_status='revoked'
        await logAudit(adminClient, mediaUploadId, "quarantine_delete_failed", userData.user.id, originalPath, quarantinePath);
        return new Response(JSON.stringify({ error: "Quarantined but original deletion failed — retry needed", quarantined: true }), {
          status: 207,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Step 4: Update storage_path in database
      const { error: updateError } = await adminClient
        .from("media_uploads")
        .update({ storage_path: `${quarantineBucket}/${quarantinePath}` })
        .eq("id", mediaUploadId);

      if (updateError) {
        await logAudit(adminClient, mediaUploadId, "quarantine_path_update_failed", userData.user.id, originalPath, quarantinePath);
        return new Response(JSON.stringify({ error: "Quarantined but path update failed — retry needed", quarantined: true }), {
          status: 207,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      await logAudit(adminClient, mediaUploadId, "quarantined", userData.user.id, originalPath, quarantinePath);
      return new Response(JSON.stringify({ success: true, action: "quarantined", quarantinePath }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "restore") {
      // Reverse: download from quarantine, upload to original bucket, delete from quarantine
      const { data: fileData, error: downloadError } = await adminClient.storage
        .from(quarantineBucket)
        .download(quarantinePath);

      if (downloadError || !fileData) {
        return new Response(JSON.stringify({ error: "Failed to download from quarantine" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { error: uploadError } = await adminClient.storage
        .from(originalBucket)
        .upload(originalPath, fileData, { upsert: true });

      if (uploadError) {
        return new Response(JSON.stringify({ error: "Failed to restore to original bucket" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      await adminClient.storage.from(quarantineBucket).remove([quarantinePath]);

      await adminClient
        .from("media_uploads")
        .update({ storage_path: originalPath })
        .eq("id", mediaUploadId);

      await logAudit(adminClient, mediaUploadId, "restored", userData.user.id, originalPath, quarantinePath);
      return new Response(JSON.stringify({ success: true, action: "restored", originalPath }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function logAudit(
  client: ReturnType<typeof createClient>,
  mediaUploadId: string,
  reason: string,
  changedBy: string,
  originalPath: string,
  quarantinePath: string,
) {
  try {
    await client.from("media_consent_audit").insert({
      media_upload_id: mediaUploadId,
      reason,
      changed_by_user_id: changedBy,
      original_storage_path: originalPath,
      quarantine_storage_path: quarantinePath,
    });
  } catch {
    // Best-effort logging
  }
}
