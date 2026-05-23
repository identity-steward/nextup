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
  auth_user_id: string;
  first_name: string;
  sport: string;
  slug: string;
  profile_status: string;
}

interface WebhookPayload {
  type: "INSERT";
  table: string;
  record: AthleteRecord;
  schema: string;
}

function buildWelcomeEmail(
  firstName: string,
  sport: string,
  slug: string,
  isActive: boolean,
  appUrl: string,
): { subject: string; html: string } {
  const dashboardUrl = `${appUrl}/dashboard`;
  const profileUrl = `${appUrl}/athletes/${slug}`;
  const contactUrl = `${appUrl}/contact`;

  const subject = isActive
    ? `${firstName}'s profile is now live on NextUp`
    : `${firstName}'s profile has been submitted to NextUp`;

  const statusHeading = isActive
    ? `You're live — ${firstName}'s profile is on the network.`
    : `We've got ${firstName}'s profile. Our team is reviewing it now.`;

  const statusBody = isActive
    ? `
      <p style="margin:0 0 16px;">
        ${firstName}'s athlete profile is live on NextUp Network right now. Anyone with the link can
        view the profile, and our team can start connecting ${firstName} with visibility opportunities.
      </p>
      <p style="margin:0 0 24px;">
        <a href="${profileUrl}" style="display:inline-block;background:#c5a572;color:#1a1f3a;text-decoration:none;font-weight:700;padding:12px 28px;border-radius:10px;font-size:15px;">
          View ${firstName}'s Profile
        </a>
      </p>
    `
    : `
      <p style="margin:0 0 16px;">
        We typically review new profiles within 48 hours. Once approved, ${firstName}'s profile goes
        live on the NextUp Network and becomes visible to our community of coaches, supporters, and
        brand partners.
      </p>
      <p style="margin:0 0 16px;">
        You'll get another email the moment it's approved — no need to check back manually.
      </p>
    `;

  const nextStepsItems = isActive
    ? [
        "Share the profile link with family, coaches, and supporters.",
        "Head to your dashboard to upload photos or a highlight video.",
        "Explore supporter tiers to grow the team behind " + firstName + ".",
      ]
    : [
        "Keep an eye on your inbox — we'll email you when the profile is approved.",
        "While you wait, you can log into your dashboard to add a highlight video or photos.",
        "Share the profile link early — supporters can already view it once it's approved.",
      ];

  const nextStepsHtml = nextStepsItems
    .map(
      (item) =>
        `<li style="margin-bottom:10px;color:#374151;font-size:15px;line-height:1.6;">${item}</li>`,
    )
    .join("");

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
              <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#1a1f3a;line-height:1.3;">
                ${statusHeading}
              </h1>
              <p style="margin:0 0 24px;font-size:13px;color:#c5a572;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">
                ${sport}
              </p>

              ${statusBody}

              <!-- What's next -->
              <div style="background:#f8f7f4;border-radius:12px;padding:24px 28px;margin-bottom:28px;">
                <p style="margin:0 0 14px;font-size:14px;font-weight:700;color:#1a1f3a;text-transform:uppercase;letter-spacing:0.5px;">
                  What's next
                </p>
                <ul style="margin:0;padding-left:20px;">
                  ${nextStepsHtml}
                </ul>
              </div>

              <!-- Dashboard CTA -->
              <p style="margin:0 0 8px;font-size:15px;color:#374151;">
                Your dashboard is where you manage ${firstName}'s profile, upload media, and track activity.
              </p>
              <p style="margin:0 0 32px;">
                <a href="${dashboardUrl}" style="display:inline-block;background:#1a1f3a;color:#ffffff;text-decoration:none;font-weight:700;padding:12px 28px;border-radius:10px;font-size:15px;">
                  Go to Dashboard
                </a>
              </p>

              <hr style="border:none;border-top:1px solid #e5e7eb;margin:0 0 24px;" />

              <p style="margin:0;font-size:14px;color:#6b7280;line-height:1.6;">
                Questions? We're here.
                <a href="${contactUrl}" style="color:#c5a572;font-weight:600;text-decoration:none;">Contact our team</a>
                and we'll get back to you quickly.
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
                You're receiving this because an account was created for ${firstName} on NextUp Network.
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

    if (payload.type !== "INSERT" || payload.table !== "athletes") {
      return new Response(JSON.stringify({ skipped: true }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const athlete = payload.record;

    if (!athlete.auth_user_id) {
      return new Response(JSON.stringify({ skipped: true, reason: "no auth_user_id" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Look up the user's email via the service role client (bypasses RLS)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(
      athlete.auth_user_id,
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
    const isActive = athlete.profile_status === "active";

    const { subject, html } = buildWelcomeEmail(
      athlete.first_name,
      athlete.sport,
      athlete.slug,
      isActive,
      appUrl,
    );

    await sendEmail({ to: recipientEmail, subject, html });

    console.log(`Welcome email sent to ${recipientEmail} for athlete ${athlete.id}`);

    return new Response(JSON.stringify({ sent: true, to: recipientEmail }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("send-welcome-email error:", err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
