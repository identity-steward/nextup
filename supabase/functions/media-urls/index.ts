import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface MediaRow {
  id: string;
  athlete_id: string;
  storage_path: string;
  bucket: string;
  status: string;
  consent_status: string;
  usage_scope: string;
  uploader_id: string;
}

interface AthleteRow {
  id: string;
  profile_status: string;
  auth_user_id: string | null;
  created_by_user_id: string | null;
  managed_by_parent_id: string | null;
}

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
    const body = await req.json();
    const mediaUploadIds: string[] = body.mediaUploadIds;

    if (!Array.isArray(mediaUploadIds) || mediaUploadIds.length === 0) {
      return new Response(JSON.stringify({ urls: {} }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Determine caller identity from Authorization header (independently verified)
    const authHeader = req.headers.get("Authorization");
    let callerUserId: string | null = null;
    let callerRole: string | null = null;

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      if (token.length === 0) {
        return new Response(JSON.stringify({ error: "Invalid credentials" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      try {
        const { data: userData, error: jwtError } = await adminClient.auth.getUser(token);
        if (jwtError || !userData.user) {
          return new Response(JSON.stringify({ error: "Invalid credentials" }), {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        callerUserId = userData.user.id;
        callerRole = (userData.user.app_metadata?.role as string) ?? null;
      } catch {
        return new Response(JSON.stringify({ error: "Invalid credentials" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Fetch all requested media records using service role (bypasses RLS)
    const { data: mediaRows, error: mediaError } = await adminClient
      .from("media_uploads")
      .select("id, athlete_id, storage_path, bucket, status, consent_status, usage_scope, uploader_id")
      .in("id", mediaUploadIds);

    if (mediaError) {
      return new Response(JSON.stringify({ error: "Database error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!mediaRows || mediaRows.length === 0) {
      const emptyResult: Record<string, null> = {};
      for (const id of mediaUploadIds) {
        emptyResult[id] = null;
      }
      return new Response(JSON.stringify({ urls: emptyResult }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch linked athletes
    const athleteIds = [...new Set(mediaRows.map((m: MediaRow) => m.athlete_id))];
    const { data: athleteRows } = await adminClient
      .from("athletes")
      .select("id, profile_status, auth_user_id, created_by_user_id, managed_by_parent_id")
      .in("id", athleteIds);

    const athleteMap = new Map<string, AthleteRow>();
    for (const a of (athleteRows ?? []) as AthleteRow[]) {
      athleteMap.set(a.id, a);
    }

    // For anonymous access, we need consent + authority verification
    // Batch-fetch consents for all athletes with media
    const athleteIdsForConsent = athleteIds.filter((aid: string) => {
      const a = athleteMap.get(aid);
      return a && a.profile_status === "active";
    });

    // publicationMap[athleteId] = true when all conditions met:
    //   1. Accepted consent with can_use_name_image_likeness by the same user who holds
    //      verified authority_to_act for that athlete's household and subject person
    //   2. Authority is verified_by_qualified_authority, not disputed, not expired
    //   3. Authority subject_person_id matches the athlete's person
    const publicationMap = new Map<string, boolean>();

    if (athleteIdsForConsent.length > 0) {
      // Fetch person records for active athletes (auth_user_id -> persons)
      const personAuthIds: string[] = [];
      for (const aid of athleteIdsForConsent) {
        const a = athleteMap.get(aid);
        if (a?.auth_user_id) personAuthIds.push(a.auth_user_id);
      }

      if (personAuthIds.length > 0) {
        const { data: personRows } = await adminClient
          .from("persons")
          .select("id, auth_user_id")
          .in("auth_user_id", personAuthIds);

        const authUserToPersonId = new Map<string, string>();
        for (const p of (personRows ?? []) as Array<{ id: string; auth_user_id: string }>) {
          authUserToPersonId.set(p.auth_user_id, p.id);
        }

        const personIds = [...authUserToPersonId.values()];
        if (personIds.length > 0) {
          // Fetch household memberships for these persons
          const { data: householdRows } = await adminClient
            .from("household_memberships")
            .select("person_id, household_id")
            .in("person_id", personIds);

          const personToHouseholds = new Map<string, string[]>();
          for (const h of (householdRows ?? []) as Array<{ person_id: string; household_id: string }>) {
            if (!personToHouseholds.has(h.person_id)) personToHouseholds.set(h.person_id, []);
            personToHouseholds.get(h.person_id)!.push(h.household_id);
          }

          const householdIds = [...new Set([...personToHouseholds.values()].flat())];

          if (householdIds.length > 0) {
            // Fetch verified, non-disputed, non-expired authority_to_act records
            // with actor_user_id populated (the authority holder)
            const { data: authorityRows } = await adminClient
              .from("authority_to_act")
              .select("household_id, subject_person_id, actor_user_id, verification_status, disputed, expires_at")
              .in("household_id", householdIds)
              .eq("verification_status", "verified_by_qualified_authority")
              .eq("disputed", false);

            // Filter out expired records (expires_at in the past)
            const now = new Date();
            const validAuthorityRows = (authorityRows ?? []).filter(
              (a: { expires_at: string | null; household_id: string; subject_person_id: string; actor_user_id: string | null }) =>
                a.actor_user_id !== null &&
                (a.expires_at === null || new Date(a.expires_at) >= now)
            );

            // Fetch consents for these athletes — include user_id to bind to authority holder
            const { data: consentRows } = await adminClient
              .from("consents")
              .select("athlete_id, user_id, consent_status, can_use_name_image_likeness")
              .in("athlete_id", athleteIdsForConsent)
              .eq("consent_status", "accepted")
              .eq("can_use_name_image_likeness", true);

            // Build: athlete_id -> Set of consent giver user_ids
            const consentGiversByAthlete = new Map<string, Set<string>>();
            for (const c of (consentRows ?? []) as Array<{
              athlete_id: string;
              user_id: string;
              consent_status: string;
              can_use_name_image_likeness: boolean;
            }>) {
              if (!consentGiversByAthlete.has(c.athlete_id)) consentGiversByAthlete.set(c.athlete_id, new Set());
              consentGiversByAthlete.get(c.athlete_id)!.add(c.user_id);
            }

            // For each athlete, check if any consent giver matches a verified authority actor
            // for the same household and subject person
            for (const aid of athleteIdsForConsent) {
              const a = athleteMap.get(aid);
              if (!a?.auth_user_id) continue;
              const personId = authUserToPersonId.get(a.auth_user_id);
              if (!personId) continue;
              const households = personToHouseholds.get(personId);
              if (!households) continue;

              const givers = consentGiversByAthlete.get(aid);
              if (!givers || givers.size === 0) continue;

              const hasBinding = validAuthorityRows.some(
                (ata: { household_id: string; subject_person_id: string; actor_user_id: string }) =>
                  households.includes(ata.household_id) &&
                  ata.subject_person_id === personId &&
                  givers.has(ata.actor_user_id)
              );

              if (hasBinding) publicationMap.set(aid, true);
            }
          }
        }
      }
    }

    // For navigator access, fetch active navigator_assignments for the caller
    let navigatorHouseholds = new Set<string>();
    if (callerUserId && callerRole !== "admin") {
      const { data: navAssignments } = await adminClient
        .from("navigator_assignments")
        .select("household_id")
        .eq("navigator_user_id", callerUserId)
        .eq("assignment_status", "active");

      navigatorHouseholds = new Set((navAssignments ?? []).map((n: { household_id: string }) => n.household_id));
    }

    // Process each media record
    const urls: Record<string, string | null> = {};

    for (const media of mediaRows as MediaRow[]) {
      const athlete = athleteMap.get(media.athlete_id);
      let authorized = false;
      let authorizationBasis = "denied";

      if (!athlete) {
        urls[media.id] = null;
        continue;
      }

      if (callerRole === "admin") {
        // Admin sees everything
        authorized = true;
        authorizationBasis = "admin";
      } else if (callerUserId) {
        // Check if caller is the athlete's owner
        const isOwner =
          athlete.auth_user_id === callerUserId ||
          athlete.created_by_user_id === callerUserId ||
          athlete.managed_by_parent_id === callerUserId;

        if (isOwner) {
          // Owner sees all their media including pending
          authorized = true;
          authorizationBasis = "owner";
        } else if (navigatorHouseholds.size > 0) {
          // Check if caller is a navigator for this athlete's household
          const { data: personRow } = await adminClient
            .from("persons")
            .select("id")
            .eq("auth_user_id", athlete.auth_user_id)
            .maybeSingle();

          if (personRow) {
            const { data: householdMember } = await adminClient
              .from("household_memberships")
              .select("household_id")
              .eq("person_id", (personRow as { id: string }).id)
              .maybeSingle();

            if (householdMember && navigatorHouseholds.has((householdMember as { household_id: string }).household_id)) {
              // Navigator sees approved + pending (not revoked)
              if (media.status === "approved" || media.status === "pending") {
                if (media.consent_status !== "revoked") {
                  authorized = true;
                  authorizationBasis = "navigator";
                }
              }
            }
          }
        }

        // If not owner or navigator, fall through to anonymous rules
        if (!authorized) {
          if (
            media.status === "approved" &&
            media.consent_status === "signed" &&
            (media.usage_scope === "platform" || media.usage_scope === "public") &&
            athlete.profile_status === "active" &&
            publicationMap.get(media.athlete_id) === true
          ) {
            authorized = true;
            authorizationBasis = "authenticated_public";
          }
        }
      } else {
        // Anonymous caller — strictest rules
        if (
          media.status === "approved" &&
          media.consent_status === "signed" &&
          (media.usage_scope === "platform" || media.usage_scope === "public") &&
          athlete.profile_status === "active" &&
          publicationMap.get(media.athlete_id) === true
        ) {
          authorized = true;
          authorizationBasis = "anonymous_public";
        }
      }

      if (!authorized) {
        urls[media.id] = null;
        continue;
      }

      // Create signed URL (5 minutes = 300 seconds)
      try {
        const { data: signedUrlData, error: signedUrlError } = await adminClient.storage
          .from(media.bucket)
          .createSignedUrl(media.storage_path, 300);

        if (signedUrlError || !signedUrlData?.signedUrl) {
          urls[media.id] = null;
        } else {
          urls[media.id] = signedUrlData.signedUrl;
        }
      } catch {
        urls[media.id] = null;
      }

      // Log issuance (best-effort, don't fail if logging fails)
      try {
        await adminClient.from("media_signed_url_log").insert({
          media_upload_id: media.id,
          caller_user_id: callerUserId,
          authorization_basis: authorizationBasis,
          expires_at: new Date(Date.now() + 300 * 1000).toISOString(),
        });
      } catch {
        // Logging is best-effort
      }
    }

    return new Response(JSON.stringify({ urls }), {
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
