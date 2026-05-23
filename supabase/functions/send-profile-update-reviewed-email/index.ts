import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { sendEmail } from "../_shared/email.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ProfileUpdateRecord {
  id: string;
  athlete_slug: string;
  submitted_by_name: string;
  submitted_by_role: string;
  submitted_by_email: string;
  status: string;
  admin_notes: string | null;
  reviewed_at: string | null;
}

interface WebhookPayload {
  type: "UPDATE";
  table: string;
  record: ProfileUpdateRecord;
  old_record: ProfileUpdateRecord;
  schema: string;
}

function buildApprovedEmail(
  athleteSlug: string,
  submitterName: string,
  appUrl: string,
): { subject: string; html: string } {
  const subject = `Your update for ${athleteSlug} has been approved`;
  const profileUrl = `${appUrl}/athletes/${athleteSlug}`;
  const dashboardUrl = `${appUrl}/dashboard`;

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
              <p style="margin:0;font-size:22px;font-weight:800;color:#c5a572;letter-spacing:0.5px;">NextUp Network</p>
              <p style="margin:6px 0 0;font-size:13px;color:#9ca3d4;letter-spacing:1px;text-transform:uppercase;">Athlete Development Platform</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">

              <!-- Confirmation -->
              <h1 style="margin:0 0 12px;font-size:24px;font-weight:800;color:#1a1f3a;line-height:1.3;">
                Your changes are live.
              </h1>
              <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.7;">
                Hi ${submitterName}, the profile update you submitted for
                <strong style="color:#1a1f3a;">${athleteSlug}</strong>
                has been reviewed and approved by our team. The profile now reflects your changes.
              </p>

              <!-- View profile CTA -->
              <p style="margin:0 0 14px;">
                <a href="${profileUrl}" style="display:inline-block;background:#c5a572;color:#1a1f3a;text-decoration:none;font-weight:800;padding:14px 32px;border-radius:10px;font-size:15px;">
                  View Updated Profile
                </a>
              </p>

              <!-- Dashboard CTA -->
              <p style="margin:0 0 32px;">
                <a href="${dashboardUrl}" style="display:inline-block;background:#1a1f3a;color:#ffffff;text-decoration:none;font-weight:700;padding:12px 28px;border-radius:10px;font-size:14px;">
                  Go to Dashboard
                </a>
              </p>

              <hr style="border:none;border-top:1px solid #e5e7eb;margin:0 0 24px;" />

              <p style="margin:0;font-size:14px;color:#6b7280;line-height:1.6;">
                Have more changes to submit?
                <a href="${dashboardUrl}" style="color:#c5a572;font-weight:600;text-decoration:none;">Head to your dashboard</a>
                and submit a new request anytime.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8f7f4;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">NextUp Network &mdash; Memphis, TN</p>
              <p style="margin:4px 0 0;font-size:12px;color:#9ca3af;">
                You're receiving this because you submitted a profile update request on NextUp Network.
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

function buildRejectedEmail(
  athleteSlug: string,
  submitterName: string,
  adminNotes: string | null,
  appUrl: string,
): { subject: string; html: string } {
  const subject = `Update request for ${athleteSlug} — not applied`;
  const dashboardUrl = `${appUrl}/dashboard`;
  const contactUrl = `${appUrl}/contact`;

  const adminNotesBlock = adminNotes
    ? `
              <!-- Admin notes -->
              <div style="background:#fef9f0;border:1px solid #f5d78e;border-radius:12px;padding:20px 24px;margin-bottom:28px;">
                <p style="margin:0 0 8px;font-size:12px;font-weight:700;color:#92711a;text-transform:uppercase;letter-spacing:0.5px;">Notes from our team</p>
                <p style="margin:0;font-size:14px;color:#374151;line-height:1.6;">${adminNotes}</p>
              </div>`
    : "";

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
              <p style="margin:0;font-size:22px;font-weight:800;color:#c5a572;letter-spacing:0.5px;">NextUp Network</p>
              <p style="margin:6px 0 0;font-size:13px;color:#9ca3d4;letter-spacing:1px;text-transform:uppercase;">Athlete Development Platform</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">

              <!-- Heading -->
              <h1 style="margin:0 0 12px;font-size:24px;font-weight:800;color:#1a1f3a;line-height:1.3;">
                We couldn't apply those changes.
              </h1>
              <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.7;">
                Hi ${submitterName}, the profile update you submitted for
                <strong style="color:#1a1f3a;">${athleteSlug}</strong>
                was reviewed by our team but we weren't able to apply it this time.
                This isn't permanent — you can submit a revised request from your dashboard.
              </p>
              ${adminNotesBlock}

              <!-- Submit new request CTA -->
              <p style="margin:0 0 32px;">
                <a href="${dashboardUrl}" style="display:inline-block;background:#1a1f3a;color:#ffffff;text-decoration:none;font-weight:800;padding:14px 32px;border-radius:10px;font-size:15px;">
                  Submit a New Request
                </a>
              </p>

              <hr style="border:none;border-top:1px solid #e5e7eb;margin:0 0 24px;" />

              <p style="margin:0;font-size:14px;color:#6b7280;line-height:1.6;">
                Not sure what happened?
                <a href="${contactUrl}" style="color:#c5a572;font-weight:600;text-decoration:none;">Reach out to our team</a>
                and we'll help sort it out.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8f7f4;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">NextUp Network &mdash; Memphis, TN</p>
              <p style="margin:4px 0 0;font-size:12px;color:#9ca3af;">
                You're receiving this because you submitted a profile update request on NextUp Network.
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

    // Only handle profile_update_requests UPDATE events
    if (payload.type !== "UPDATE" || payload.table !== "profile_update_requests") {
      return new Response(
        JSON.stringify({ skipped: true, reason: "not a profile_update_requests UPDATE" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { record, old_record } = payload;

    // Guard: only fire when transitioning FROM pending TO approved or rejected.
    // Skips: admin_notes-only edits, re-saves of already-reviewed rows, any other transition.
    const wasПending = old_record.status === "pending";
    const isDecided = record.status === "approved" || record.status === "rejected";

    if (!wasПending || !isDecided) {
      return new Response(
        JSON.stringify({
          skipped: true,
          reason: `status transition ${old_record.status} → ${record.status} does not require notification`,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const recipientEmail = record.submitted_by_email;

    if (!recipientEmail) {
      console.warn(`Request ${record.id} has no submitted_by_email — skipping`);
      return new Response(
        JSON.stringify({ skipped: true, reason: "no recipient email" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const appUrl = Deno.env.get("APP_URL") ?? "https://nextupnetwork.com";

    const { subject, html } = record.status === "approved"
      ? buildApprovedEmail(record.athlete_slug, record.submitted_by_name, appUrl)
      : buildRejectedEmail(
          record.athlete_slug,
          record.submitted_by_name,
          record.admin_notes,
          appUrl,
        );

    await sendEmail({ to: recipientEmail, subject, html });

    console.log(
      `Profile update ${record.status} email sent to ${recipientEmail} for request ${record.id} (athlete: ${record.athlete_slug})`,
    );

    return new Response(
      JSON.stringify({ sent: true, to: recipientEmail, decision: record.status }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("send-profile-update-reviewed-email error:", err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
