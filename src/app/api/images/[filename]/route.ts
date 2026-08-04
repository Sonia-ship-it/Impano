import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ filename: string }> | { filename: string } }
) {
  try {
    const resolvedParams = "then" in params ? await params : params;
    const filename = resolvedParams.filename;
    
    const tmpFilePath = path.join("/tmp", filename);
    const publicFilePath = path.join(process.cwd(), "public/images", filename);
    
    let targetPath = "";
    
    // Check `/tmp` first (where dynamic uploads live on serverless)
    try {
      await fs.access(tmpFilePath);
      targetPath = tmpFilePath;
    } catch {
      // Fall back to pre-bundled public/images folder
      try {
        await fs.access(publicFilePath);
        targetPath = publicFilePath;
      } catch {
        return new Response("Image asset not found.", { status: 404 });
      }
    }

    const imageBuffer = await fs.readFile(targetPath);
    
    // Determine content type based on extension
    let contentType = "image/png";
    const ext = path.extname(filename).toLowerCase();
    if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
    else if (ext === ".gif") contentType = "image/gif";
    else if (ext === ".webp") contentType = "image/webp";
    else if (ext === ".svg") contentType = "image/svg+xml";

    return new Response(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error: any) {
    return new Response("Internal server error.", { status: 500 });
  }
}
