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

// In-memory fallback in case of single node lifecycle
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

    // 1. ACTION: SEND / RESEND OTP
    if (action === "send" || action === "resend") {
      if (!passcode || passcode !== expectedPasscode) {
        return NextResponse.json(
          { error: "Incorrect admin passcode. Access denied." },
          { status: 401 }
        );
      }

      // Generate secure 6-digit OTP
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

      await saveOTP({ code: generatedOtp, expiresAt, passcode });

      const resendApiKey = process.env.RESEND_API_KEY;

      if (!resendApiKey) {
        console.warn("[2FA OTP API] Resend API key missing in environment. Using dev console code:", generatedOtp);
        return NextResponse.json({
          success: true,
          message: `2FA security code generated (Resend API key unconfigured; Dev Code: ${generatedOtp})`,
          emailHint: targetEmail,
          devCode: generatedOtp,
        });
      }

      // Send email via Resend
      const emailRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: "Impano Security <onboarding@resend.dev>",
          to: targetEmail,
          subject: `🔐 ${generatedOtp} is your Impano Admin Verification Code`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 540px; margin: 0 auto; background-color: #0d0c0c; color: #ffffff; border-radius: 16px; border: 1px solid rgba(255, 173, 17, 0.25); overflow: hidden; padding: 0;">
              <div style="background: linear-gradient(135deg, #181717 0%, #0d0c0c 100%); padding: 30px; text-align: center; border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
                <h1 style="color: #ffad11; margin: 0 0 6px; font-size: 24px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase;">Impano Entertainment</h1>
                <p style="color: #999999; margin: 0; font-size: 13px; letter-spacing: 0.15em; text-transform: uppercase;">Two-Factor Authentication (2FA)</p>
              </div>

              <div style="padding: 35px 30px; text-align: center;">
                <p style="color: #e0e0e0; font-size: 15px; margin: 0 0 25px; line-height: 1.6;">
                  You requested an administrative login to the <strong>Impano CMS Dashboard</strong>. Use the 6-digit one-time passcode below to verify your session:
                </p>

                <div style="background: rgba(255, 173, 17, 0.08); border: 1.5px dashed #ffad11; border-radius: 12px; padding: 20px; display: inline-block; margin: 0 auto 25px; letter-spacing: 0.35em; font-size: 38px; font-weight: 900; color: #ffad11; font-family: monospace;">
                  ${generatedOtp}
                </div>

                <p style="color: #888888; font-size: 13px; margin: 0 0 10px;">
                  ⏳ This security code is valid for <strong>10 minutes</strong>.
                </p>
                <p style="color: #666666; font-size: 12px; margin: 0;">
                  If you did not request this login, please ignore this message or change your admin passcode immediately.
                </p>
              </div>

              <div style="background-color: #080707; padding: 18px 30px; border-top: 1px solid rgba(255, 255, 255, 0.06); text-align: center; font-size: 11px; color: #555555;">
                Protected by Impano Security Core &bull; Kigali, Rwanda
              </div>
            </div>
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
        message: `Security code sent to ${targetEmail}`,
        emailHint: targetEmail,
      });
    }

    // 2. ACTION: VERIFY OTP
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

      if (Date.now() > stored.expiresAt) {
        await clearStoredOTP();
        return NextResponse.json(
          { error: "Verification code has expired. Please request a new code." },
          { status: 400 }
        );
      }

      if (stored.code.trim() !== otp.trim()) {
        return NextResponse.json(
          { error: "Incorrect verification code. Please check your email and try again." },
          { status: 400 }
        );
      }

      // Valid OTP: Clear stored OTP and grant access
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
