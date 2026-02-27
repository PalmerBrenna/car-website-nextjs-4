import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const carId = searchParams.get("id");

    if (!carId) {
      return NextResponse.json({ error: "Missing carId" }, { status: 400 });
    }

    if (!adminDb) {
      return NextResponse.json({
        success: true,
        moved: false,
        reason: "Firestore admin is not configured",
      });
    }

    const carRef = adminDb.collection("cars").doc(carId);
    const snap = await carRef.get();

    if (!snap.exists) {
      return NextResponse.json({ error: "Car not found" }, { status: 404 });
    }

    await carRef.update({
      moved: true,
      movedAt: Date.now(),
      migrationNote: "Cloudinary storage in use. No filesystem move needed.",
    });

    return NextResponse.json({
      success: true,
      moved: true,
      carId,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Migration failed" },
      { status: 500 }
    );
  }
}
