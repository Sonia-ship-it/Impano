import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { name, email, projectType, budget, message } = await request.json();

    const resendApiKey = process.env.RESEND_API_KEY;
    const toEmail = process.env.CONTACT_TO_EMAIL || "uwasesonia43@gmail.com";

    if (!resendApiKey) {
      return NextResponse.json(
        { error: "Email service not configured (Missing API Key)." },
        { status: 500 }
      );
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "onboarding@resend.dev",
        to: toEmail,
        subject: `New Message from ${name} - Impano Contact`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #222; background-color: #0f0f0f; color: #ffffff; border-radius: 12px;">
            <h2 style="color: #ffad11; border-bottom: 1.5px solid #ffad11; padding-bottom: 12px; margin-top: 0; font-size: 20px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">New Contact Form Message</h2>
            <p style="margin: 15px 0;"><strong style="color: #ffad11;">Name:</strong> ${name}</p>
            <p style="margin: 15px 0;"><strong style="color: #ffad11;">Email:</strong> ${email}</p>
            <p style="margin: 15px 0;"><strong style="color: #ffad11;">Project Type:</strong> ${projectType}</p>
            <p style="margin: 15px 0;"><strong style="color: #ffad11;">Budget Range:</strong> ${budget || "Not specified"}</p>
            <div style="margin-top: 25px; padding: 20px; background-color: #1a1a1a; border-radius: 8px; border-left: 4px solid #ffad11;">
              <p style="margin: 0; font-weight: bold; color: #ffad11;">Message:</p>
              <p style="margin-top: 10px; line-height: 1.6; color: #e0e0e0; white-space: pre-wrap;">${message}</p>
            </div>
            <div style="margin-top: 30px; border-top: 1px solid #222; padding-top: 15px; font-size: 11px; color: #555; text-align: center;">
              Sent via Impano Entertainment Form System
            </div>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.message || "Failed to send email via Resend." },
        { status: response.status }
      );
    }

    const result = await response.json();
    return NextResponse.json({ success: true, id: result.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
