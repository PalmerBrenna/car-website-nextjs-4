import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  return NextResponse.json({
    logs: [
      "ℹ️ Local filesystem conversion is disabled.",
      "✅ All new uploads are stored in Cloudinary under car-website-nextjs-1/.",
    ],
  });
}
