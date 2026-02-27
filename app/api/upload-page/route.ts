import { NextResponse } from "next/server";
import sharp from "sharp";
import { uploadToCloudinary } from "@/lib/cloudinary";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const toWebpFile = async (file: File) => {
  const inputBuffer = Buffer.from(await file.arrayBuffer());
  const webpBuffer = await sharp(inputBuffer)
    .rotate()
    .resize({ width: 2000, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();

  const fileName = `${file.name.replace(/\.[^.]+$/, "") || "image"}.webp`;
  return new File([webpBuffer], fileName, { type: "image/webp" });
};

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const folderType = (formData.get("folderType") as string) || "pages";

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const targetFolder = folderType === "main" ? "main" : "pages";
    const webpFile = await toWebpFile(file);

    const uploaded = await uploadToCloudinary({
      file: webpFile,
      folder: `car-website-nextjs-1/${targetFolder}`,
      resourceType: "image",
      tags: ["car-website-nextjs-1", targetFolder],
    });

    return NextResponse.json({
      url: uploaded.secure_url,
      secure_url: uploaded.secure_url,
      public_id: uploaded.public_id,
      resource_type: uploaded.resource_type,
      format: uploaded.format,
    });
  } catch (err: any) {
    console.error("❌ Upload error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
