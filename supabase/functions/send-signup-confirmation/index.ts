const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ConfirmationRequest {
  parent_email: string;
  parent_name: string;
  youth_first_name: string;
  submission_type: string;
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
    const body: ConfirmationRequest = await req.json();

    if (!body.parent_email || !body.youth_first_name) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const fromEmail = Deno.env.get("FROM_EMAIL");

    if (!resendApiKey || !fromEmail) {
      console.error("Missing email configuration: RESEND_API_KEY or FROM_EMAIL");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const submissionLabel = body.submission_type === "athlete_signup"
      ? "profile submission"
      : "intake submission";

    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <div style="background: #1a1f3a; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
          <h1 style="color: #c5a572; font-size: 24px; margin: 0 0 8px 0;">We received your submission</h1>
          <p style="color: #a0a8c0; font-size: 14px; margin: 0;">NextUp Network — Confirmation</p>
        </div>
        <div style="background: #f8fafc; border-radius: 12px; padding: 24px; border: 1px solid #e2e8f0;">
          <p style="font-size: 16px; color: #1e293b; margin: 0 0 16px 0;">Hello${body.parent_name ? ` ${body.parent_name.split(" ")[0]}` : ""},</p>
          <p style="font-size: 15px; color: #475569; line-height: 1.6; margin: 0 0 16px 0;">
            Thank you for sharing information about <strong>${body.youth_first_name}</strong> with NextUp.
            We have received your ${submissionLabel} submitted on
            <strong>${new Date(body.submission_date).toLocaleDateString("en-US", { dateStyle: "long" })}</strong>.
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

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: body.parent_email,
        subject: `NextUp — We received your submission for ${body.youth_first_name}`,
        html: emailHtml,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error("Resend API error:", emailResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to send confirmation email" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result = await emailResponse.json();
    console.log("Confirmation email sent successfully:", result.id);

    return new Response(
      JSON.stringify({ success: true, messageId: result.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("send-signup-confirmation error:", err.message);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
