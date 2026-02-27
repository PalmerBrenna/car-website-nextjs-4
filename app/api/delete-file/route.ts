import { NextResponse } from "next/server";
import { deleteCloudinaryAsset } from "@/lib/cloudinary";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { publicId, resourceType } = await req.json();

    if (!publicId || typeof publicId !== "string") {
      return NextResponse.json({ error: "Missing publicId" }, { status: 400 });
    }

    await deleteCloudinaryAsset({
      publicId,
      resourceType: resourceType === "raw" ? "raw" : "image",
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE FILE ERROR:", err);
    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
  }
}
