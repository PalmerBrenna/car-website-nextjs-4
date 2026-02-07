import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { filePath } = await req.json();

    if (!filePath) {
      return NextResponse.json({ error: "Missing filePath" }, { status: 400 });
    }

    if (!filePath.includes("/uploads/")) {
      return NextResponse.json(
        { error: "Invalid filePath (not local uploads)" },
        { status: 400 }
      );
    }

    const relativePath = filePath.split("/uploads/")[1];
    const absolutePath = path.join(
      process.cwd(),
      "public",
      "uploads",
      relativePath
    );

    await fs.unlink(absolutePath);

    console.log("🗑️ Deleted file:", absolutePath);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE FILE ERROR:", err);
    return NextResponse.json({ error: "Failed to delete file" }, { status: 500 });
  }
}
