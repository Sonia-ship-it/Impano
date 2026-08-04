import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

// Vercel serverless environments provide a writable /tmp directory.
const tmpFilePath = "/tmp/content.json";
const originalFilePath = path.join(process.cwd(), "src/data/content.json");

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
  try {
    const filePath = await getContentFilePath();
    const fileContent = await fs.readFile(filePath, "utf8");
    const data = JSON.parse(fileContent);
    
    // SECURITY: Delete passcode before sending data publicly to visitors
    delete data.passcode;
    
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Failed to read content database." }, { status: 500 });
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

    // Determine safe output path
    const isVercel = process.env.VERCEL === "1" || process.env.NODE_ENV === "production";
    const targetPath = isVercel ? tmpFilePath : originalFilePath;

    // Preserving the passcode inside the file if the admin dashboard did not send a new one
    if (!body.passcode) {
      body.passcode = expectedPasscode;
    }

    await fs.writeFile(targetPath, JSON.stringify(body, null, 2), "utf8");
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
