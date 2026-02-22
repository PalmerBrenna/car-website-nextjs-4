// app/api/delete-car/route.ts
import { NextResponse } from "next/server";
import path from "path";
import { promises as fs } from "fs";
import { adminDb } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type DeleteCarBody = {
  filesToDelete?: string[];
};

const filterFilesToDelete = (files: unknown): string[] =>
  Array.isArray(files) ? files.filter((file): file is string => typeof file === "string") : [];

const buildFilesToDeleteFromSchema = (schemaData: Record<string, any>) => {
  const files: string[] = [];

  for (const section of Object.values(schemaData)) {
    if (!section || typeof section !== "object") continue;

    if (Array.isArray(section.images)) {
      section.images.forEach((img: any) => {
        if (img?.src) files.push(img.src);
      });
    }

    if (Array.isArray(section.files)) {
      section.files.forEach((file: any) => {
        if (file?.src) files.push(file.src);
      });
    }
  }

  return files;
};

const getUploadRelativePath = (value: string) => {
  if (!value.includes("/uploads/")) return null;

  const relativePath = value.split("/uploads/")[1]?.split("?")[0]?.split("#")[0];
  if (!relativePath) return null;

  return relativePath.replace(/^\/+/, "");
};

const deleteLocalUploads = async (carId: string, filesToDelete: string[]) => {
  const foldersToRemove = new Set<string>([carId]);

  for (const url of filesToDelete) {
    try {
      const relativePath = getUploadRelativePath(url);
      if (!relativePath) {
        continue;
      }

      const folderName = relativePath.split("/")[0];
      if (folderName && folderName !== "pages") {
        foldersToRemove.add(folderName);
      }

      const absolutePath = path.join(process.cwd(), "public", "uploads", relativePath);

      await fs.unlink(absolutePath);
      console.log("🗑️ Deleted:", absolutePath);
    } catch (err) {
      console.error("⚠️ Failed to delete:", url, err);
    }
  }

  for (const folderName of foldersToRemove) {
    const folderPath = path.join(process.cwd(), "public", "uploads", folderName);
    await fs.rm(folderPath, { recursive: true, force: true });
  }
};

const isFirestoreAdminUnauthenticatedError = (error: unknown) => {
  if (!error || typeof error !== "object") return false;

  const firestoreError = error as { code?: number | string; message?: string };
  const message = String(firestoreError.message || "").toUpperCase();

  return (
    firestoreError.code === 16 ||
    firestoreError.code === "16" ||
    message.includes("UNAUTHENTICATED") ||
    message.includes("INVALID AUTHENTICATION CREDENTIALS")
  );
};

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const carId = searchParams.get("id");
    const body = (await req.json().catch(() => null)) as DeleteCarBody | null;
    const bodyFiles = filterFilesToDelete(body?.filesToDelete);

    if (!carId) {
      return NextResponse.json({ error: "Missing carId" }, { status: 400 });
    }

    if (!adminDb) {
      if (bodyFiles.length === 0) {
        return NextResponse.json(
          {
            error:
              "Firestore admin client not configured and no files provided for deletion",
          },
          { status: 500 }
        );
      }

      await deleteLocalUploads(carId, bodyFiles);
      return NextResponse.json({ success: true, firestoreDeleted: false });
    }

    // 🔹 Citește documentul Firestore
    const carRef = adminDb.collection("cars").doc(carId);
    let snap;

    try {
      snap = await carRef.get();
    } catch (error) {
      if (!isFirestoreAdminUnauthenticatedError(error)) {
        throw error;
      }

      console.warn("⚠️ Firestore admin auth failed. Falling back to client-side doc deletion.");
      await deleteLocalUploads(carId, bodyFiles);
      return NextResponse.json({ success: true, firestoreDeleted: false });
    }

    if (!snap.exists) {
      return NextResponse.json({ error: "Car not found" }, { status: 404 });
    }

    const carData = snap.data();
    const schemaData = carData?.schemaData || {};
    const schemaFiles = buildFilesToDeleteFromSchema(schemaData);
    const filesToDelete = Array.from(new Set([...schemaFiles, ...bodyFiles]));

    // 🔥 Ștergem toate fișierele locale din /public/uploads
    await deleteLocalUploads(carId, filesToDelete);

    // 🔹 Ștergem documentul Firestore
    await carRef.delete();
    console.log("✅ Firestore doc deleted:", carId);

    return NextResponse.json({ success: true, firestoreDeleted: true });
  } catch (err: any) {
    console.error("❌ Delete error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
