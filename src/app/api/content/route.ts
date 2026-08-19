import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Vercel serverless environments provide a writable /tmp directory.
const tmpFilePath = "/tmp/content.json";
const originalFilePath = path.join(process.cwd(), "src/data/content.json");

// Upstash Redis / Vercel KV REST API Helpers
async function getKVContent() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) return null;

  try {
    const res = await fetch(`${url.replace(/\/$/, "")}/get/impano_cms_content`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.result) {
        return typeof data.result === "string" ? JSON.parse(data.result) : data.result;
      }
    }
  } catch (err) {
    console.warn("KV fetch error:", err);
  }
  return null;
}

async function setKVContent(data: any) {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) return false;

  try {
    const res = await fetch(`${url.replace(/\/$/, "")}/set/impano_cms_content`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(JSON.stringify(data)),
    });

    return res.ok;
  } catch (err) {
    console.warn("KV save error:", err);
    return false;
  }
}

async function getContentFilePath() {
  try {
    await fs.access(tmpFilePath);
    return tmpFilePath;
  } catch {
    return originalFilePath;
  }
}

// Get the current expected passcode from database or environment fallback
async function getExpectedPasscode() {
  let expectedPasscode = process.env.ADMIN_PASSCODE || "admin123";

  // Check KV first
  const kvData = await getKVContent();
  if (kvData && kvData.passcode) {
    return kvData.passcode;
  }

  try {
    const filePath = await getContentFilePath();
    const fileContent = await fs.readFile(filePath, "utf8");
    const dbContent = JSON.parse(fileContent);
    if (dbContent.passcode) {
      expectedPasscode = dbContent.passcode;
    }
  } catch {
    // Fall back to environment variable
  }
  return expectedPasscode;
}

export async function GET() {
  const headers = { "Cache-Control": "no-store, max-age=0, must-revalidate" };
  try {
    // 1. Try Cloud KV Database first
    const kvData = await getKVContent();
    if (kvData) {
      delete kvData.passcode;
      return NextResponse.json(kvData, { headers });
    }

    // 2. Fall back to local file system
    const filePath = await getContentFilePath();
    const fileContent = await fs.readFile(filePath, "utf8");
    const data = JSON.parse(fileContent);
    
    // SECURITY: Delete passcode before sending data publicly to visitors
    delete data.passcode;
    
    return NextResponse.json(data, { headers });
  } catch (error) {
    return NextResponse.json({ error: "Failed to read content database." }, { status: 500, headers });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Auth Check: Validate against database passcode or env fallback
    const passcode = request.headers.get("Authorization");
    const expectedPasscode = await getExpectedPasscode();
    
    if (passcode !== expectedPasscode) {
      return NextResponse.json(
        { error: "Unauthorized access. Invalid passcode." },
        { status: 401 }
      );
    }

    if (body.dryRun) {
      return NextResponse.json({ success: true, verified: true });
    }

    if (!body.passcode) {
      body.passcode = expectedPasscode;
    }

    const contentJson = JSON.stringify(body, null, 2);

    // 1. Save to Cloud KV Database (Permanent across Vercel / serverless deployments)
    const kvSaved = await setKVContent(body);

    // 2. Write to local file path when available
    try {
      await fs.writeFile(originalFilePath, contentJson, "utf8");
      try { await fs.writeFile(tmpFilePath, contentJson, "utf8"); } catch {}
      return NextResponse.json({ success: true, kvSaved });
    } catch (writeErr) {
      // Fallback for read-only serverless filesystems (e.g., Vercel)
      try {
        await fs.writeFile(tmpFilePath, contentJson, "utf8");
        return NextResponse.json({ success: true, kvSaved, warning: "Saved to temporary server cache" });
      } catch (tmpErr: any) {
        if (kvSaved) {
          return NextResponse.json({ success: true, kvSaved: true });
        }
        return NextResponse.json({ error: "Failed to save content: " + tmpErr.message }, { status: 500 });
      }
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


