import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";
import { deleteCloudinaryAsset, extractCloudinaryPublicId } from "@/lib/cloudinary";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type DeleteCarBody = {
  filesToDelete?: string[];
};

type CloudinaryAsset = {
  publicId: string;
  resourceType: "image" | "raw";
};

const filterFilesToDelete = (files: unknown): string[] =>
  Array.isArray(files) ? files.filter((file): file is string => typeof file === "string") : [];

const buildAssetsToDeleteFromSchema = (schemaData: Record<string, any>) => {
  const assets: CloudinaryAsset[] = [];

  for (const section of Object.values(schemaData)) {
    if (!section || typeof section !== "object") continue;

    if (Array.isArray(section.images)) {
      section.images.forEach((img: any) => {
        const publicId = img?.public_id || extractCloudinaryPublicId(img?.src);
        if (publicId) assets.push({ publicId, resourceType: "image" });
      });
    }

    if (Array.isArray(section.files)) {
      section.files.forEach((file: any) => {
        const publicId = file?.public_id || extractCloudinaryPublicId(file?.src);
        if (publicId) {
          const resourceType = file?.resource_type === "raw" ? "raw" : "image";
          assets.push({ publicId, resourceType });
        }
      });
    }
  }

  return assets;
};

const parseBodyAssets = (values: string[]): CloudinaryAsset[] =>
  values
    .map((value) => extractCloudinaryPublicId(value))
    .filter((publicId): publicId is string => Boolean(publicId))
    .map((publicId) => ({ publicId, resourceType: "image" }));

const deleteCloudinaryAssets = async (assets: CloudinaryAsset[]) => {
  const uniqueAssets = Array.from(
    new Map(assets.map((asset) => [`${asset.resourceType}:${asset.publicId}`, asset])).values()
  );

  for (const asset of uniqueAssets) {
    try {
      await deleteCloudinaryAsset({
        publicId: asset.publicId,
        resourceType: asset.resourceType,
      });
    } catch (error) {
      console.error("⚠️ Failed to delete Cloudinary asset", asset.publicId, error);
    }
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
      await deleteCloudinaryAssets(parseBodyAssets(bodyFiles));
      return NextResponse.json({ success: true, firestoreDeleted: false });
    }

    const carRef = adminDb.collection("cars").doc(carId);
    let snap;

    try {
      snap = await carRef.get();
    } catch (error) {
      if (!isFirestoreAdminUnauthenticatedError(error)) {
        throw error;
      }

      console.warn("⚠️ Firestore admin auth failed. Falling back to request payload deletion.");
      await deleteCloudinaryAssets(parseBodyAssets(bodyFiles));
      return NextResponse.json({ success: true, firestoreDeleted: false });
    }

    if (!snap.exists) {
      return NextResponse.json({ error: "Car not found" }, { status: 404 });
    }

    const carData = snap.data();
    const schemaData = carData?.schemaData || {};
    const schemaAssets = buildAssetsToDeleteFromSchema(schemaData);
    const bodyAssets = parseBodyAssets(bodyFiles);

    await deleteCloudinaryAssets([...schemaAssets, ...bodyAssets]);
    await carRef.delete();

    return NextResponse.json({ success: true, firestoreDeleted: true });
  } catch (err: any) {
    console.error("❌ Delete error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
