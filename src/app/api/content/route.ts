import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

// Vercel serverless environments provide a writable /tmp directory.
const tmpFilePath = "/tmp/content.json";
const originalFilePath = path.join(process.cwd(), "src/data/content.json");

async function getContentFilePath() {
  try {
    // If content has been updated in this container, read from /tmp
    await fs.access(tmpFilePath);
    return tmpFilePath;
  } catch {
    // Fall back to original bundled data file
    return originalFilePath;
  }
}

export async function GET() {
  try {
    const filePath = await getContentFilePath();
    const fileContent = await fs.readFile(filePath, "utf8");
    return NextResponse.json(JSON.parse(fileContent));
  } catch (error) {
    return NextResponse.json({ error: "Failed to read content database." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Auth Check: Validate administrative access
    const passcode = request.headers.get("Authorization");
    const adminPasscode = process.env.ADMIN_PASSCODE || "admin123";
    
    if (passcode !== adminPasscode) {
      return NextResponse.json(
        { error: "Unauthorized access. Invalid passcode." },
        { status: 401 }
      );
    }

    if (body.dryRun) {
      return NextResponse.json({ success: true, verified: true });
    }

    // Determine safe output path
    // Write to /tmp on Vercel deployment, write to project source in local development.
    const isVercel = process.env.VERCEL === "1" || process.env.NODE_ENV === "production";
    const targetPath = isVercel ? tmpFilePath : originalFilePath;

    await fs.writeFile(targetPath, JSON.stringify(body, null, 2), "utf8");
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
