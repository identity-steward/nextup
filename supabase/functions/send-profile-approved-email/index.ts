import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { sendEmail } from "../_shared/email.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface AthleteRecord {
  id: string;
  auth_user_id: string | null;
  managed_by_parent_id: string | null;
  first_name: string;
  sport: string;
  slug: string;
  profile_status: string;
}

interface WebhookPayload {
  type: "UPDATE";
  table: string;
  record: AthleteRecord;
  old_record: AthleteRecord;
  schema: string;
}

function buildApprovedEmail(
  firstName: string,
  sport: string,
  slug: string,
  appUrl: string,
): { subject: string; html: string } {
  const subject = `${firstName}'s profile is now live on NextUp`;
  const profileUrl = `${appUrl}/athletes/${slug}`;
  const dashboardUrl = `${appUrl}/dashboard`;
  const contactUrl = `${appUrl}/contact`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#f5f4f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f4f0;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" style="max-width:580px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:#1a1f3a;padding:32px 40px;text-align:center;">
              <p style="margin:0;font-size:22px;font-weight:800;color:#c5a572;letter-spacing:0.5px;">
                NextUp Network
              </p>
              <p style="margin:6px 0 0;font-size:13px;color:#9ca3d4;letter-spacing:1px;text-transform:uppercase;">
                Athlete Development Platform
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">

              <!-- Approval confirmation -->
              <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#1a1f3a;line-height:1.3;">
                ${firstName} is officially on the network.
              </h1>
              <p style="margin:0 0 6px;font-size:13px;color:#c5a572;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">
                ${sport}
              </p>
              <p style="margin:0 0 28px;font-size:15px;color:#374151;line-height:1.7;">
                ${firstName}'s profile has been reviewed and approved by our team. It's live on NextUp Network
                right now — visible to coaches, supporters, and brand partners in our community.
                This is the start of something real.
              </p>

              <!-- Primary CTA: View profile -->
              <p style="margin:0 0 28px;">
                <a href="${profileUrl}" style="display:inline-block;background:#c5a572;color:#1a1f3a;text-decoration:none;font-weight:800;padding:14px 32px;border-radius:10px;font-size:15px;">
                  View ${firstName}'s Profile
                </a>
              </p>

              <!-- Action block -->
              <div style="background:#f8f7f4;border-radius:12px;padding:24px 28px;margin-bottom:28px;">
                <p style="margin:0 0 16px;font-size:14px;font-weight:700;color:#1a1f3a;text-transform:uppercase;letter-spacing:0.5px;">
                  Make the most of it
                </p>

                <!-- Upload media -->
                <table cellpadding="0" cellspacing="0" style="margin-bottom:14px;width:100%;">
                  <tr>
                    <td style="width:28px;vertical-align:top;padding-top:2px;">
                      <div style="width:20px;height:20px;background:#1a1f3a;border-radius:50%;text-align:center;line-height:20px;">
                        <span style="color:#c5a572;font-size:11px;font-weight:900;">1</span>
                      </div>
                    </td>
                    <td>
                      <p style="margin:0;font-size:15px;font-weight:700;color:#1a1f3a;">Upload a photo or highlight video</p>
                      <p style="margin:2px 0 0;font-size:13px;color:#6b7280;line-height:1.5;">
                        Profiles with media get significantly more views. Head to your dashboard to add one now.
                      </p>
                    </td>
                  </tr>
                </table>

                <!-- Share profile -->
                <table cellpadding="0" cellspacing="0" style="margin-bottom:14px;width:100%;">
                  <tr>
                    <td style="width:28px;vertical-align:top;padding-top:2px;">
                      <div style="width:20px;height:20px;background:#1a1f3a;border-radius:50%;text-align:center;line-height:20px;">
                        <span style="color:#c5a572;font-size:11px;font-weight:900;">2</span>
                      </div>
                    </td>
                    <td>
                      <p style="margin:0;font-size:15px;font-weight:700;color:#1a1f3a;">Share the profile link</p>
                      <p style="margin:2px 0 0;font-size:13px;color:#6b7280;line-height:1.5;">
                        Send it to coaches, teammates, family, and anyone in ${firstName}'s corner.
                        Every share expands the reach.
                      </p>
                    </td>
                  </tr>
                </table>

                <!-- Supporters -->
                <table cellpadding="0" cellspacing="0" style="width:100%;">
                  <tr>
                    <td style="width:28px;vertical-align:top;padding-top:2px;">
                      <div style="width:20px;height:20px;background:#1a1f3a;border-radius:50%;text-align:center;line-height:20px;">
                        <span style="color:#c5a572;font-size:11px;font-weight:900;">3</span>
                      </div>
                    </td>
                    <td>
                      <p style="margin:0;font-size:15px;font-weight:700;color:#1a1f3a;">Grow your support team</p>
                      <p style="margin:2px 0 0;font-size:13px;color:#6b7280;line-height:1.5;">
                        Invite people to support ${firstName} this season. Every supporter helps cover
                        tournament fees, gear, and travel — so ${firstName} can focus on the game.
                      </p>
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Dashboard CTA -->
              <p style="margin:0 0 8px;font-size:15px;color:#374151;line-height:1.6;">
                Your dashboard is where you manage ${firstName}'s profile, track activity, and upload new content.
              </p>
              <p style="margin:0 0 32px;">
                <a href="${dashboardUrl}" style="display:inline-block;background:#1a1f3a;color:#ffffff;text-decoration:none;font-weight:700;padding:12px 28px;border-radius:10px;font-size:15px;">
                  Go to Dashboard
                </a>
              </p>

              <hr style="border:none;border-top:1px solid #e5e7eb;margin:0 0 24px;" />

              <!-- Support/contact footer -->
              <p style="margin:0;font-size:14px;color:#6b7280;line-height:1.6;">
                Have questions or want to learn about premium features?
                <a href="${contactUrl}" style="color:#c5a572;font-weight:600;text-decoration:none;">Reach out to our team</a>
                — we're here to help ${firstName} get the most out of NextUp.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8f7f4;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">
                NextUp Network &mdash; Memphis, TN
              </p>
              <p style="margin:4px 0 0;font-size:12px;color:#9ca3af;">
                You're receiving this because ${firstName}'s profile was approved on NextUp Network.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();

  return { subject, html };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const payload: WebhookPayload = await req.json();

    // Only handle athletes UPDATE events
    if (payload.type !== "UPDATE" || payload.table !== "athletes") {
      return new Response(JSON.stringify({ skipped: true, reason: "not an athletes UPDATE" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { record, old_record } = payload;

    // Guard: only fire when status genuinely transitions TO active.
    // Skips: hidden, rejected, unchanged saves, active→active re-saves.
    const statusChanged = old_record.profile_status !== record.profile_status;
    const isNowActive = record.profile_status === "active";
    const wasNotAlreadyActive = old_record.profile_status !== "active";

    if (!statusChanged || !isNowActive || !wasNotAlreadyActive) {
      return new Response(
        JSON.stringify({
          skipped: true,
          reason: `status transition ${old_record.profile_status} → ${record.profile_status} does not require notification`,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Resolve recipient user ID: athlete-owned first, parent-managed fallback
    const recipientUserId = record.auth_user_id ?? record.managed_by_parent_id;

    if (!recipientUserId) {
      console.warn(`Athlete ${record.id} has no auth_user_id or managed_by_parent_id — skipping`);
      return new Response(
        JSON.stringify({ skipped: true, reason: "no resolvable recipient user id" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Look up the user's email via the service role client (bypasses RLS)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(
      recipientUserId,
    );

    if (userError || !userData?.user?.email) {
      console.error("Failed to fetch user email:", userError?.message);
      return new Response(
        JSON.stringify({ error: "Could not resolve recipient email" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const recipientEmail = userData.user.email;
    const appUrl = Deno.env.get("APP_URL") ?? "https://nextupnetwork.com";

    const { subject, html } = buildApprovedEmail(
      record.first_name,
      record.sport,
      record.slug,
      appUrl,
    );

    await sendEmail({ to: recipientEmail, subject, html });

    console.log(
      `Profile approved email sent to ${recipientEmail} for athlete ${record.id} (${old_record.profile_status} → active)`,
    );

    return new Response(JSON.stringify({ sent: true, to: recipientEmail }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("send-profile-approved-email error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
