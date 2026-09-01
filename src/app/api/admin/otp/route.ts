import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Vercel serverless /tmp fallback path
const tmpOtpFilePath = "/tmp/admin_otp.json";
const originalFilePath = path.join(process.cwd(), "src/data/content.json");

// Upstash Redis / Vercel KV REST API Helpers
async function getKVContent(key = "impano_cms_content") {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) return null;

  try {
    const res = await fetch(`${url.replace(/\/$/, "")}/get/${key}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.result) {
        let parsed = data.result;
        while (typeof parsed === "string") {
          try {
            parsed = JSON.parse(parsed);
          } catch {
            break;
          }
        }
        if (typeof parsed === "object" && parsed !== null) {
          return parsed;
        }
      }
    }
  } catch (err) {
    console.warn("[OTP API] KV fetch error:", err);
  }
  return null;
}

async function setKVContent(key: string, data: any) {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) return false;

  try {
    const payload = typeof data === "string" ? data : JSON.stringify(data);
    const res = await fetch(`${url.replace(/\/$/, "")}/set/${key}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    return res.ok;
  } catch (err) {
    console.warn("[OTP API] KV save error:", err);
    return false;
  }
}

// In-memory fallback
let memoryOtpStore: { code: string; expiresAt: number; passcode: string } | null = null;

async function saveOTP(otpData: { code: string; expiresAt: number; passcode: string }) {
  memoryOtpStore = otpData;
  await setKVContent("impano_admin_2fa_otp", otpData);
  try {
    await fs.writeFile(tmpOtpFilePath, JSON.stringify(otpData), "utf8");
  } catch {}
}

async function getStoredOTP(): Promise<{ code: string; expiresAt: number; passcode: string } | null> {
  const kvOtp = await getKVContent("impano_admin_2fa_otp");
  if (kvOtp && kvOtp.code) {
    return kvOtp;
  }
  if (memoryOtpStore) {
    return memoryOtpStore;
  }
  try {
    const fileContent = await fs.readFile(tmpOtpFilePath, "utf8");
    return JSON.parse(fileContent);
  } catch {
    return null;
  }
}

async function clearStoredOTP() {
  memoryOtpStore = null;
  await setKVContent("impano_admin_2fa_otp", { code: "", expiresAt: 0, passcode: "" });
  try {
    await fs.unlink(tmpOtpFilePath);
  } catch {}
}

async function getExpectedPasscode() {
  let expectedPasscode = process.env.ADMIN_PASSCODE || "admin123";
  const kvData = await getKVContent("impano_cms_content");
  if (kvData && kvData.passcode) {
    return kvData.passcode;
  }
  try {
    const fileContent = await fs.readFile(originalFilePath, "utf8");
    const dbContent = JSON.parse(fileContent);
    if (dbContent.passcode) {
      expectedPasscode = dbContent.passcode;
    }
  } catch {}
  return expectedPasscode;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, passcode, otp } = body;
    const expectedPasscode = await getExpectedPasscode();

    const targetEmail = "uwasesonia43@gmail.com";

    // 1. ACTION: SEND / RESEND OTP (1 Minute Expiration)
    if (action === "send" || action === "resend") {
      if (!passcode || passcode !== expectedPasscode) {
        return NextResponse.json(
          { error: "Incorrect admin passcode. Access denied." },
          { status: 401 }
        );
      }

      // Generate secure 6-digit numeric OTP
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      // STRICT: Valid for only 1 minute (60,000 ms)
      const expiresAt = Date.now() + 60 * 1000;

      await saveOTP({ code: generatedOtp, expiresAt, passcode });

      const resendApiKey = process.env.RESEND_API_KEY;

      if (!resendApiKey) {
        console.warn("[2FA OTP API] Resend API key missing in environment. Using dev code:", generatedOtp);
        return NextResponse.json({
          success: true,
          message: "2FA security code generated.",
          devCode: generatedOtp,
        });
      }

      // Send email via Resend with Outfit typography & dark gold theme
      const emailRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: "Impano Security <onboarding@resend.dev>",
          to: targetEmail,
          subject: "Your Impano Admin Verification Code",
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <style>
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');
              </style>
            </head>
            <body style="margin: 0; padding: 20px; background-color: #080707; font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
              <div style="max-width: 520px; margin: 20px auto; background-color: #0d0c0c; color: #ffffff; border-radius: 16px; border: 1px solid rgba(255, 173, 17, 0.28); overflow: hidden; box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8);">
                
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #181717 0%, #0d0c0c 100%); padding: 32px 25px 24px; text-align: center; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
                  <span style="display: inline-block; font-size: 11px; font-weight: 800; letter-spacing: 0.22em; text-transform: uppercase; color: #ffad11; background: rgba(255, 173, 17, 0.1); border: 1px solid rgba(255, 173, 17, 0.3); padding: 4px 14px; border-radius: 100px; margin-bottom: 14px;">
                    TWO-FACTOR SECURITY
                  </span>
                  <h1 style="color: #ffffff; margin: 0 0 6px; font-size: 22px; font-weight: 800; letter-spacing: -0.01em; font-family: 'Outfit', sans-serif;">
                    Your Impano Admin Verification Code
                  </h1>
                </div>

                <!-- Body -->
                <div style="padding: 35px 30px; text-align: center;">
                  <p style="color: #cfcece; font-size: 15px; margin: 0 0 25px; line-height: 1.6; font-weight: 400;">
                    Please use the following 6-digit one-time passcode to complete your administrator login:
                  </p>

                  <!-- 6-digit Code Box -->
                  <div style="background: rgba(255, 173, 17, 0.08); border: 1.5px dashed #ffad11; border-radius: 12px; padding: 18px 24px; display: inline-block; margin: 0 auto 25px; letter-spacing: 0.35em; font-size: 38px; font-weight: 900; color: #ffad11; font-family: 'Outfit', monospace;">
                    ${generatedOtp}
                  </div>

                  <div style="background: rgba(255, 77, 77, 0.08); border: 1px solid rgba(255, 77, 77, 0.2); border-radius: 8px; padding: 10px 15px; margin: 0 auto 20px; max-width: 380px;">
                    <p style="color: #ff8888; font-size: 13px; margin: 0; font-weight: 600;">
                      ⏳ Valid for only 1 minute (60 seconds)
                    </p>
                  </div>

                  <p style="color: #777777; font-size: 12px; margin: 0; line-height: 1.5;">
                    If you did not initiate this login request, please disregard this email or update your administrative passcode immediately.
                  </p>
                </div>

                <!-- Footer -->
                <div style="background-color: #060505; padding: 16px 25px; border-top: 1px solid rgba(255, 255, 255, 0.05); text-align: center; font-size: 11px; color: #555555; letter-spacing: 0.05em;">
                  Impano Entertainment &bull; Studio CMS Portal &bull; Kigali, Rwanda
                </div>
              </div>
            </body>
            </html>
          `,
        }),
      });

      if (!emailRes.ok) {
        const emailErr = await emailRes.json();
        console.error("[2FA OTP API] Resend email send failed:", emailErr);
        return NextResponse.json(
          { error: emailErr.message || "Failed to dispatch verification code to email." },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Verification code dispatched to email.",
      });
    }

    // 2. ACTION: VERIFY OTP (Strict 1-Minute Expiry Check)
    if (action === "verify") {
      if (!passcode || passcode !== expectedPasscode) {
        return NextResponse.json(
          { error: "Invalid admin passcode." },
          { status: 401 }
        );
      }

      if (!otp || typeof otp !== "string" || otp.trim().length !== 6) {
        return NextResponse.json(
          { error: "Please enter a valid 6-digit verification code." },
          { status: 400 }
        );
      }

      const stored = await getStoredOTP();

      if (!stored || !stored.code) {
        return NextResponse.json(
          { error: "No active verification code found. Please request a new one." },
          { status: 400 }
        );
      }

      // STRICT EXPIRY CHECK: If expired, immediately clear and reject
      if (Date.now() > stored.expiresAt) {
        await clearStoredOTP();
        return NextResponse.json(
          { error: "This verification code has expired (exceeded 1 minute limit). Please click Resend Code." },
          { status: 400 }
        );
      }

      if (stored.code.trim() !== otp.trim()) {
        return NextResponse.json(
          { error: "Incorrect verification code. Please check your email and try again." },
          { status: 400 }
        );
      }

      // Valid OTP: Clear stored OTP so it cannot be reused, and grant access
      await clearStoredOTP();

      return NextResponse.json({
        success: true,
        verified: true,
        message: "2FA Verification successful. Access granted.",
      });
    }

    return NextResponse.json(
      { error: "Invalid action specified." },
      { status: 400 }
    );
  } catch (err: any) {
    console.error("[2FA OTP API] Exception:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
