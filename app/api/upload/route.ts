import { NextResponse } from "next/server";
import sharp from "sharp";
import { uploadToCloudinary } from "@/lib/cloudinary";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const sectionFolderMap: Record<string, string> = {
  exterior: "exterior",
  interior: "interior",
  motor: "engine",
  engine: "engine",
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "");

const toWebpFile = async (file: File) => {
  const inputBuffer = Buffer.from(await file.arrayBuffer());
  const webpBuffer = await sharp(inputBuffer)
    .rotate()
    .resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();

  const fileName = `${file.name.replace(/\.[^.]+$/, "") || "image"}.webp`;
  return new File([webpBuffer], fileName, { type: "image/webp" });
};

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const carId = formData.get("carId") as string;
    const section = formData.get("section") as string;

    if (!file || !carId || !section) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const normalizedSection = slugify(section);
    const sectionFolder = sectionFolderMap[normalizedSection] || normalizedSection;
    const webpFile = await toWebpFile(file);

    const uploaded = await uploadToCloudinary({
      file: webpFile,
      folder: `car-website-nextjs-2/cars/${carId}/${sectionFolder}`,
      resourceType: "image",
      tags: ["car-website-nextjs-2", "cars", carId, sectionFolder],
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
