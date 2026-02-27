import { NextResponse } from "next/server";
import crypto from "crypto";

const stripWrappingQuotes = (value: string) =>
  value.replace(/^['"]+|['"]+$/g, "").trim();

const extractCloudName = (input?: string | null) => {
  if (!input) return null;

  const value = stripWrappingQuotes(input);
  if (!value) return null;

  if (value.startsWith("cloudinary://")) {
    try {
      return new URL(value).hostname || null;
    } catch {
      return null;
    }
  }

  if (value.includes("api.cloudinary.com/v1_1/")) {
    const match = value.match(/\/v1_1\/([^/]+)/);
    return match?.[1] || null;
  }

  if (value.includes("res.cloudinary.com/")) {
    const match = value.match(/res\.cloudinary\.com\/([^/]+)/);
    return match?.[1] || null;
  }

  return value;
};

const getCloudinaryConfig = () => {
  const cloudName =
    extractCloudName(process.env.CLOUDINARY_CLOUD_NAME) ||
    extractCloudName(process.env.CLOUD_NAME) ||
    extractCloudName(process.env.CLOUDINARY_URL);

  const apiKey =
    stripWrappingQuotes(process.env.CLOUDINARY_API_KEY || "") ||
    (process.env.CLOUDINARY_URL?.match(/^cloudinary:\/\/([^:]+):/)?.[1] ?? "");

  const apiSecret =
    stripWrappingQuotes(process.env.CLOUDINARY_API_SECRET || "") ||
    (process.env.CLOUDINARY_URL?.match(/^cloudinary:\/\/[^:]+:([^@]+)@/)?.[1] ?? "");

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Missing Cloudinary env vars");
  }

  return { cloudName, apiKey, apiSecret };
};

const buildSignature = (
  params: Record<string, string | number | boolean>,
  apiSecret: string
) => {
  const stringToSign = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  return crypto.createHash("sha1").update(`${stringToSign}${apiSecret}`).digest("hex");
};


const buildPdfPreviewImageUrl = ({
  cloudName,
  publicId,
  page = 1,
}: {
  cloudName: string;
  publicId: string;
  page?: number;
}) => {
  const encodedPublicId = publicId
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return `https://res.cloudinary.com/${cloudName}/image/upload/pg_${page},f_jpg/${encodedPublicId}.jpg`;
};

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const publicId = searchParams.get("publicId");
    const format = (searchParams.get("format") || "pdf").toLowerCase();
    const page = Number(searchParams.get("page") || "1") || 1;
    const fallbackUrl = searchParams.get("src");

    if (!publicId) {
      if (fallbackUrl) return NextResponse.redirect(fallbackUrl);
      return NextResponse.json({ error: "Missing publicId" }, { status: 400 });
    }

    const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
    const timestamp = Math.floor(Date.now() / 1000);

    const signable = {
      attachment: false,
      format,
      public_id: publicId,
      timestamp,
      type: "upload",
    };

    const signature = buildSignature(signable, apiSecret);

    const formData = new FormData();
    formData.append("public_id", publicId);
    formData.append("format", format);
    formData.append("type", "upload");
    formData.append("attachment", "false");
    formData.append("timestamp", String(timestamp));
    formData.append("api_key", apiKey);
    formData.append("signature", signature);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/download`,
      {
        method: "POST",
        body: formData,
      }
    );

    const payload = await response.json().catch(() => null);
    const signedUrl = payload?.url as string | undefined;

    if (response.ok && signedUrl) {
      return NextResponse.redirect(signedUrl);
    }

    // If PDF delivery is blocked by account policy, fallback to first-page JPG preview.
    const previewUrl = buildPdfPreviewImageUrl({
      cloudName,
      publicId,
      page,
    });

    if (format === "pdf") {
      return NextResponse.redirect(previewUrl);
    }

    if (fallbackUrl) {
      return NextResponse.redirect(fallbackUrl);
    }

    return NextResponse.json(
      { error: payload?.error?.message || "Could not generate file URL" },
      { status: 502 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to resolve file URL" },
      { status: 500 }
    );
  }
}
