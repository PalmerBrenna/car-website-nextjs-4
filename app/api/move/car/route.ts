import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { adminDb } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const carId = searchParams.get("id");

    if (!carId)
      return NextResponse.json({ error: "Missing carId" }, { status: 400 });

    const snap = await adminDb.collection("cars").doc(carId).get();
    if (!snap.exists)
      return NextResponse.json({ error: "Car not found" }, { status: 404 });

    const carData = snap.data();
    const schema = carData?.schemaData || {};
    const tempId = carData?.tempId;

    const carName =
      schema?.General?.Title ||
      (schema?.General?.Make + " " + schema?.General?.Model) ||
      "Unnamed Car";

    if (!tempId)
      return NextResponse.json({
        error: "This car does not have tempId → cannot match local folder",
      });

    const localFolder = path.join(
      process.cwd(),
      "public",
      "uploads",
      tempId.toString()
    );

    if (!fs.existsSync(localFolder)) {
      return NextResponse.json({
        message: "Local folder not found",
        expectedFolder: localFolder,
        carId,
        tempId,
        carName,
      });
    }

    const log: string[] = [];
    const targetFolder = path.join(
      process.cwd(),
      "public",
      "uploads",
      carId
    );

    if (fs.existsSync(targetFolder)) {
      fs.rmSync(targetFolder, { recursive: true, force: true });
    }

    fs.mkdirSync(path.dirname(targetFolder), { recursive: true });
    fs.renameSync(localFolder, targetFolder);

    const oldPrefix = `/uploads/${tempId}/`;
    const newPrefix = `/uploads/${carId}/`;

    function updateLinks(obj: any) {
      for (const key in obj) {
        if (typeof obj[key] === "string") {
          if (obj[key].includes(oldPrefix)) {
            obj[key] = obj[key].replace(oldPrefix, newPrefix);
          }
        } else if (typeof obj[key] === "object") {
          updateLinks(obj[key]);
        }
      }
    }

    updateLinks(schema);

    log.push(`Moved folder: ${localFolder} → ${targetFolder}`);

    await adminDb.collection("cars").doc(carId).update({
      schemaData: schema,
      moved: true,        // <-- ADĂUGAT
      movedAt: Date.now() // <-- OPTIONAL
    });

    return NextResponse.json({
      success: true,
      moved: true,
      localFolder: targetFolder,
      carId,
      tempId,
      carName,
      log,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Migration failed" },
      { status: 500 }
    );
  }
}
