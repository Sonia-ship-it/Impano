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
    const base64Data = buffer.toString("base64");
    const mimeType = file.type || "image/png";
    const dataUri = `data:${mimeType};base64,${base64Data}`;

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dztttzycr";
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET || process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "dztttzycr";

    // Attempt Cloudinary upload
    if (cloudName) {
      try {
        let uploadResult;
        try {
          // Try unsigned upload with preset first
          uploadResult = await cloudinary.uploader.unsigned_upload(dataUri, uploadPreset);
        } catch (presetError) {
          // Fallback to standard signed upload
          uploadResult = await cloudinary.uploader.upload(dataUri, {
            folder: "impano",
            resource_type: "auto",
          });
        }

        if (uploadResult && uploadResult.secure_url) {
          return NextResponse.json({
            success: true,
            url: uploadResult.secure_url,
            public_id: uploadResult.public_id,
            provider: "cloudinary"
          });
        }
      } catch (cloudinaryError: any) {
        console.warn("Cloudinary upload failed, engaging fallback storage:", cloudinaryError?.message || cloudinaryError);
      }
    }

    // Fallback strategy:
    // On local disk (non-Vercel dev server), write to public/images for persistence
    const isVercel = process.env.VERCEL === "1" || process.env.NODE_ENV === "production";
    
    if (!isVercel) {
      try {
        const timestamp = Date.now();
        const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
        const filename = `${timestamp}_${safeName}`;
        const targetDir = path.join(process.cwd(), "public/images");
        
        await fs.mkdir(targetDir, { recursive: true });
        const filePath = path.join(targetDir, filename);
        await fs.writeFile(filePath, buffer);

        return NextResponse.json({
          success: true,
          url: `/images/${filename}`,
          provider: "local",
        });
      } catch (localFsError) {
        console.warn("Local file system write failed, falling back to Data URI:", localFsError);
      }
    }

    // Serverless / Production fallback: Return Data URI so image survives ephemeral container recycles
    return NextResponse.json({
      success: true,
      url: dataUri,
      provider: "data-uri",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Upload processing error" }, { status: 500 });
  }
}

