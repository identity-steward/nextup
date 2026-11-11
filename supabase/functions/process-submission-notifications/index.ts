import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ProcessRequest {
  source_table: string;
  source_record_id: string;
  notification_type: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const fromEmail = Deno.env.get("FROM_EMAIL");
  const adminEmail = Deno.env.get("ADMIN_NOTIFY_EMAIL");
  const appUrl = Deno.env.get("APP_URL") || "";

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  try {
    const body: ProcessRequest = await req.json();

    if (!body.source_table || !body.source_record_id || !body.notification_type) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: source_table, source_record_id, notification_type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!["athlete_signups", "parent_intake"].includes(body.source_table)) {
      return new Response(
        JSON.stringify({ error: "Invalid source_table" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!["admin_notification", "parent_confirmation"].includes(body.notification_type)) {
      return new Response(
        JSON.stringify({ error: "Invalid notification_type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!resendApiKey || !fromEmail) {
      console.error("Missing email configuration: RESEND_API_KEY or FROM_EMAIL");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (body.notification_type === "admin_notification" && !adminEmail) {
      console.error("Missing ADMIN_NOTIFY_EMAIL secret");
      return new Response(
        JSON.stringify({ error: "Admin notification email not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Duplicate prevention: skip if this notification was already sent successfully
    const { data: existingLog } = await adminClient
      .from("notification_log")
      .select("id, status")
      .eq("source_table", body.source_table)
      .eq("source_record_id", body.source_record_id)
      .eq("notification_type", body.notification_type)
      .eq("status", "sent")
      .maybeSingle();

    if (existingLog) {
      return new Response(
        JSON.stringify({ success: true, message: "Notification already sent", duplicate: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch the actual record from the database — never trust browser-supplied details
    const { data: record, error: recordError } = await adminClient
      .from(body.source_table)
      .select("parent_first_name, parent_last_name, parent_email, athlete_first_name, created_at")
      .eq("id", body.source_record_id)
      .maybeSingle();

    if (recordError || !record) {
      console.error("Failed to fetch record:", recordError?.message);
      return new Response(
        JSON.stringify({ error: "Record not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Rate limiting for parent_confirmation: max 3 per email per 24h
    if (body.notification_type === "parent_confirmation") {
      const { count } = await adminClient
        .from("notification_log")
        .select("id", { count: "exact", head: true })
        .eq("notification_type", "parent_confirmation")
        .eq("recipient_email", record.parent_email)
        .eq("status", "sent")
        .gt("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if ((count ?? 0) >= 3) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded for this email address" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Insert or update the notification_log entry as "pending"
    const { data: logEntry } = await adminClient
      .from("notification_log")
      .upsert(
        {
          source_table: body.source_table,
          source_record_id: body.source_record_id,
          notification_type: body.notification_type,
          recipient_email: body.notification_type === "parent_confirmation" ? record.parent_email : adminEmail,
          status: "pending",
          attempt_count: 1,
        },
        { onConflict: "source_table,source_record_id,notification_type" }
      )
      .select("id")
      .maybeSingle();

    const logId = logEntry?.id;

    // Build email content based on notification type
    let emailTo: string;
    let emailSubject: string;
    let emailHtml: string;

    const parentName = `${record.parent_first_name} ${record.parent_last_name}`;
    const youthFirstName = record.athlete_first_name;
    const submissionDate = new Date(record.created_at).toLocaleDateString("en-US", { dateStyle: "long" });
    const sourceLabel = body.source_table === "athlete_signups" ? "profile submission" : "intake submission";

    if (body.notification_type === "admin_notification") {
      emailTo = adminEmail!;
      const adminSourceLabel = body.source_table === "athlete_signups" ? "Athlete Profile Signup" : "Parent Intake Submission";
      const adminLink = appUrl
        ? `${appUrl.replace(/\/$/, "")}/admin/${body.source_table === "athlete_signups" ? "athletes" : "intake"}`
        : "Check the admin dashboard";

      emailSubject = `NextUp — New ${adminSourceLabel}: ${youthFirstName}`;
      emailHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <div style="background: #1a1f3a; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <h1 style="color: #c5a572; font-size: 20px; margin: 0 0 8px 0;">NextUp — New ${adminSourceLabel}</h1>
            <p style="color: #a0a8c0; font-size: 14px; margin: 0;">A new submission has been received and requires review.</p>
          </div>
          <div style="background: #f8fafc; border-radius: 12px; padding: 24px; border: 1px solid #e2e8f0;">
            <table style="width: 100%; font-size: 14px; color: #1e293b;">
              <tr><td style="padding: 8px 0; font-weight: 600; width: 140px;">Submission Type:</td><td style="padding: 8px 0;">${adminSourceLabel}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: 600;">Parent / Guardian:</td><td style="padding: 8px 0;">${parentName}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: 600;">Youth First Name:</td><td style="padding: 8px 0;">${youthFirstName}</td></tr>
              <tr><td style="padding: 8px 0; font-weight: 600;">Submitted:</td><td style="padding: 8px 0;">${submissionDate}</td></tr>
            </table>
            <div style="margin-top: 24px;">
              <a href="${adminLink}" style="display: inline-block; background: #2563eb; color: #ffffff; text-decoration: none; font-weight: 600; padding: 12px 24px; border-radius: 8px; font-size: 14px;">Review in Admin Dashboard</a>
            </div>
          </div>
          <p style="color: #94a3b8; font-size: 12px; margin-top: 24px;">This is an automated notification from NextUp Network. No sensitive youth details are included in this email.</p>
        </div>
      `;
    } else {
      emailTo = record.parent_email;
      emailSubject = `NextUp — We received your submission for ${youthFirstName}`;
      emailHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <div style="background: #1a1f3a; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
            <h1 style="color: #c5a572; font-size: 24px; margin: 0 0 8px 0;">We received your submission</h1>
            <p style="color: #a0a8c0; font-size: 14px; margin: 0;">NextUp Network — Confirmation</p>
          </div>
          <div style="background: #f8fafc; border-radius: 12px; padding: 24px; border: 1px solid #e2e8f0;">
            <p style="font-size: 16px; color: #1e293b; margin: 0 0 16px 0;">Hello ${record.parent_first_name},</p>
            <p style="font-size: 15px; color: #475569; line-height: 1.6; margin: 0 0 16px 0;">
              Thank you for sharing information about <strong>${youthFirstName}</strong> with NextUp.
              We have received your ${sourceLabel} submitted on <strong>${submissionDate}</strong>.
            </p>
            <p style="font-size: 15px; color: #475569; line-height: 1.6; margin: 0 0 16px 0;">
              Our team will review the submission and reach out to you using the contact information you provided.
              We look forward to connecting with you and exploring how NextUp can support the journey.
            </p>
            <p style="font-size: 15px; color: #475569; line-height: 1.6; margin: 0;">
              If you have any questions in the meantime, feel free to reach out to us at
              <a href="mailto:info@NextUpMemphis.com" style="color: #2563eb;">info@NextUpMemphis.com</a>.
            </p>
          </div>
          <p style="color: #94a3b8; font-size: 12px; margin-top: 24px; text-align: center;">
            NextUp Network — Making young people's journeys visible.<br/>
            This is an automated confirmation. Please do not reply to this email.
          </p>
        </div>
      `;
    }

    // Send the email via Resend
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: emailTo,
        subject: emailSubject,
        html: emailHtml,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      const errorStatus = emailResponse.status;
      console.error("Resend API error:", errorStatus, errorText);

      // Update the notification log with the actual failure
      if (logId) {
        await adminClient
          .from("notification_log")
          .update({
            status: "failed",
            error_message: `Resend ${errorStatus}: ${errorText.substring(0, 500)}`,
          })
          .eq("id", logId);
      }

      // Return the actual error with credentials redacted
      const redactedError = errorText
        .replace(/sk_[a-zA-Z0-9_]+/g, "[REDACTED]")
        .replace(/Bearer [^\s]+/g, "Bearer [REDACTED]")
        .substring(0, 300);

      return new Response(
        JSON.stringify({
          error: "Email provider rejected the request",
          provider_status: errorStatus,
          provider_error: redactedError,
        }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = await emailResponse.json();

    // Update the notification log with success
    if (logId) {
      await adminClient
        .from("notification_log")
        .update({
          status: "sent",
          sent_at: new Date().toISOString(),
        })
        .eq("id", logId);
    }

    console.log(`${body.notification_type} sent successfully:`, result.id);

    return new Response(
      JSON.stringify({ success: true, messageId: result.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("process-submission-notifications error:", err.message);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
