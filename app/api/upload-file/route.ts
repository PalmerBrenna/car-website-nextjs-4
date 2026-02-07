import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

    const buffer = Buffer.from(await file.arrayBuffer());

    // 🔹 Extragem extensia
    const ext = file.name.split(".").pop() || "pdf";

    // 🔹 Generăm nume unic
    const filename = `${Date.now()}.${ext}`;

    const relativePath = path.join("uploads", carId, section, filename);
    const outputPath = path.join(process.cwd(), "public", relativePath);

    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, buffer);

    const publicUrl = `/${relativePath.replace(/\\/g, "/")}`;

    console.log("📄 Uploaded file:", publicUrl);

    return NextResponse.json({ url: publicUrl });
  } catch (error: any) {
    console.error("❌ upload-file error:", error);
    return NextResponse.json(
      { error: error.message || "Upload failed" },
      { status: 500 }
    );
  }
}
