import { NextResponse } from "next/server";
import { uploadToCloudinary } from "@/lib/cloudinary";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-_]/g, "");

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const carId = formData.get("carId") as string;
    const section = (formData.get("section") as string) || "files";

    if (!file || !carId) {
      return NextResponse.json(
        { error: "Missing file or carId" },
        { status: 400 }
      );
    }

    const uploaded = await uploadToCloudinary({
      file,
      folder: `car-website-nextjs-2/cars/${carId}/${slugify(section) || "files"}`,
      // Use image resource type for PDFs so Cloudinary serves a viewable URL
      resourceType: "image",
      tags: ["car-website-nextjs-2", "cars", carId, "files"],
    });

    return NextResponse.json({
      url: uploaded.secure_url,
      secure_url: uploaded.secure_url,
      public_id: uploaded.public_id,
      resource_type: uploaded.resource_type,
    });
  } catch (error: any) {
    console.error("❌ upload-file error:", error);
    return NextResponse.json(
      { error: error.message || "Upload failed" },
      { status: 500 }
    );
  }
}
