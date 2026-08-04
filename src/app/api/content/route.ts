import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const dataFilePath = path.join(process.cwd(), "src/data/content.json");

export async function GET() {
  try {
    const fileContent = await fs.readFile(dataFilePath, "utf8");
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

    await fs.writeFile(dataFilePath, JSON.stringify(body, null, 2), "utf8");
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
