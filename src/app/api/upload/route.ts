import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import fs from "fs/promises";
import path from "path";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY || "429138998788435";
    const apiSecret = process.env.CLOUDINARY_API_SECRET || "y2F6NLVW0Ku3NzbVGZEIbF8MK8o";

    // If Cloudinary is configured with cloud_name, upload directly to Cloudinary
    if (cloudName) {
      try {
        const base64Data = buffer.toString("base64");
        const mimeType = file.type || "image/png";
        const dataUri = `data:${mimeType};base64,${base64Data}`;

        const uploadResult = await cloudinary.uploader.upload(dataUri, {
          folder: "irobospati",
          resource_type: "auto",
        });

        return NextResponse.json({
          success: true,
          url: uploadResult.secure_url,
          public_id: uploadResult.public_id,
          provider: "cloudinary"
        });
      } catch (cloudinaryError: any) {
        console.error("Cloudinary upload failed, falling back to disk:", cloudinaryError?.message || cloudinaryError);
        return NextResponse.json({
          error: `Cloudinary upload error: ${cloudinaryError?.message || "Failed to upload to Cloudinary"}`
        }, { status: 500 });
      }
    }

    // Fallback: Local / /tmp disk storage if CLOUDINARY_CLOUD_NAME is not set
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filename = `${timestamp}_${safeName}`;

    const isVercel = process.env.VERCEL === "1" || process.env.NODE_ENV === "production";
    const targetDir = isVercel ? "/tmp" : path.join(process.cwd(), "public/images");

    await fs.mkdir(targetDir, { recursive: true });
    const filePath = path.join(targetDir, filename);
    await fs.writeFile(filePath, buffer);

    return NextResponse.json({
      success: true,
      url: `/api/images/${filename}`,
      provider: "local",
      warning: "CLOUDINARY_CLOUD_NAME is missing in .env.local. File stored locally."
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
