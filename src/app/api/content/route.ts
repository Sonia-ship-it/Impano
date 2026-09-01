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
        let parsed = data.result;
        // Recursively unwrap stringified JSON in case of nested encoding
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
    console.warn("KV fetch error:", err);
  }
  return null;
}

async function setKVContent(data: any) {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) return false;

  try {
    const payload = typeof data === "string" ? data : JSON.stringify(data);
    const res = await fetch(`${url.replace(/\/$/, "")}/set/impano_cms_content`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
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
      console.log("[Impano CMS API] GET: Successfully retrieved content from Upstash KV Cloud Database.");
      delete kvData.passcode;

      if (Array.isArray(kvData.team)) {
        const hasNtwali = kvData.team.some((m: any) => 
          m.name?.toLowerCase().includes("ntwali") || m.name?.toLowerCase().includes("andersen")
        );
        if (!hasNtwali) {
          kvData.team.push({
            name: "NTWALI ANDERSEN Moise",
            role: "Camera Operator",
            bio: "Expert visual technician dedicated to precise framing, fluid camera movements, and capturing stunning cinematography on set.",
            image: "/images/ntwali.jpg"
          });
          // Update KV database in background to persist
          setKVContent(kvData).catch(() => {});
        }
      }

      return NextResponse.json({ ...kvData, _meta: { storageType: "kv", kvConnected: true } }, { headers });
    }

    console.warn("[Impano CMS API] GET WARNING: Upstash KV unconfigured or unavailable. Checking local file system fallbacks.");

    // 2. Fall back to local file system
    const filePath = await getContentFilePath();
    const isTmp = filePath === tmpFilePath;
    const fileContent = await fs.readFile(filePath, "utf8");
    const data = JSON.parse(fileContent);
    
    // SECURITY: Delete passcode before sending data publicly to visitors
    delete data.passcode;
    
    return NextResponse.json({
      ...data,
      _meta: {
        storageType: isTmp ? "tmp" : "local",
        kvConnected: false,
        warning: isTmp ? "Loaded from temporary server cache (/tmp)" : "Loaded from local git source file"
      }
    }, { headers });
  } catch (error) {
    console.error("[Impano CMS API] GET ERROR: Failed to read content database:", error);
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
      console.warn("[Impano CMS API] POST Unauthorized access attempt.");
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

    // Remove any transient _meta properties before storing
    delete body._meta;

    const contentJson = JSON.stringify(body, null, 2);

    // 1. Save to Cloud KV Database (Permanent across Vercel / serverless deployments)
    const kvSaved = await setKVContent(body);

    if (kvSaved) {
      console.log("[Impano CMS API] POST: Content PERMANENTLY saved to Upstash KV Cloud Database.");
    } else {
      console.warn("[Impano CMS API] POST WARNING: Failed to save to Upstash KV. Ensure KV_REST_API_URL and KV_REST_API_TOKEN are configured in Vercel project settings!");
    }

    // 2. Write to local file path when available
    try {
      await fs.writeFile(originalFilePath, contentJson, "utf8");
      try { await fs.writeFile(tmpFilePath, contentJson, "utf8"); } catch {}
      return NextResponse.json({ success: true, kvSaved, storageType: kvSaved ? "kv" : "local" });
    } catch (writeErr) {
      // Fallback for read-only serverless filesystems (e.g., Vercel)
      try {
        await fs.writeFile(tmpFilePath, contentJson, "utf8");
        return NextResponse.json({
          success: true,
          kvSaved,
          storageType: kvSaved ? "kv" : "tmp",
          warning: kvSaved ? undefined : "Saved only to temporary server cache. Missing KV_REST_API_URL on Vercel."
        });
      } catch (tmpErr: any) {
        if (kvSaved) {
          return NextResponse.json({ success: true, kvSaved: true, storageType: "kv" });
        }
        return NextResponse.json({ error: "Failed to save content: " + tmpErr.message }, { status: 500 });
      }
    }
  } catch (error: any) {
    console.error("[Impano CMS API] POST ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


