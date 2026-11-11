import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface NotificationRequest {
  source_table: string;
  source_record_id: string;
  parent_name: string;
  youth_first_name: string;
  parent_email: string;
  submission_date: string;
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

  try {
    const body: NotificationRequest = await req.json();

    if (!body.source_table || !body.parent_name || !body.youth_first_name) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const fromEmail = Deno.env.get("FROM_EMAIL");
    const adminEmail = Deno.env.get("ADMIN_NOTIFY_EMAIL");
    const appUrl = Deno.env.get("APP_URL") || Deno.env.get("SUPABASE_URL") || "";

    if (!resendApiKey || !fromEmail || !adminEmail) {
      console.error("Missing email configuration: RESEND_API_KEY, FROM_EMAIL, or ADMIN_NOTIFY_EMAIL");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const sourceLabel = body.source_table === "athlete_signups"
      ? "Athlete Profile Signup"
      : body.source_table === "parent_intake"
      ? "Parent Intake Submission"
      : "New Submission";

    const adminLink = appUrl
      ? `${appUrl.replace(/\/$/, "")}/admin/${body.source_table === "athlete_signups" ? "athletes" : "intake"}`
      : "Check the admin dashboard";

    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <div style="background: #1a1f3a; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
          <h1 style="color: #c5a572; font-size: 20px; margin: 0 0 8px 0;">NextUp — New ${sourceLabel}</h1>
          <p style="color: #a0a8c0; font-size: 14px; margin: 0;">A new submission has been received and requires review.</p>
        </div>
        <div style="background: #f8fafc; border-radius: 12px; padding: 24px; border: 1px solid #e2e8f0;">
          <table style="width: 100%; font-size: 14px; color: #1e293b;">
            <tr><td style="padding: 8px 0; font-weight: 600; width: 140px;">Submission Type:</td><td style="padding: 8px 0;">${sourceLabel}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: 600;">Parent / Guardian:</td><td style="padding: 8px 0;">${body.parent_name}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: 600;">Youth First Name:</td><td style="padding: 8px 0;">${body.youth_first_name}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: 600;">Submitted:</td><td style="padding: 8px 0;">${new Date(body.submission_date).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}</td></tr>
          </table>
          <div style="margin-top: 24px;">
            <a href="${adminLink}" style="display: inline-block; background: #2563eb; color: #ffffff; text-decoration: none; font-weight: 600; padding: 12px 24px; border-radius: 8px; font-size: 14px;">Review in Admin Dashboard</a>
          </div>
        </div>
        <p style="color: #94a3b8; font-size: 12px; margin-top: 24px;">This is an automated notification from NextUp Network. No sensitive youth details are included in this email.</p>
      </div>
    `;

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: adminEmail,
        subject: `NextUp — New ${sourceLabel}: ${body.youth_first_name}`,
        html: emailHtml,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error("Resend API error:", emailResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to send notification email" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = await emailResponse.json();
    console.log("Admin notification sent successfully:", result.id);

    return new Response(
      JSON.stringify({ success: true, messageId: result.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("send-admin-notification error:", err.message);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
