import crypto from "crypto";

type ResourceType = "image" | "raw" | "video";

const stripWrappingQuotes = (value: string) =>
  value.replace(/^['"]+|['"]+$/g, "").trim();

const extractCloudName = (input?: string | null) => {
  if (!input) return null;

  const value = stripWrappingQuotes(input);
  if (!value) return null;

  // cloudinary://<api_key>:<api_secret>@<cloud_name>
  if (value.startsWith("cloudinary://")) {
    try {
      return new URL(value).hostname || null;
    } catch {
      return null;
    }
  }

  // https://api.cloudinary.com/v1_1/<cloud_name>/image/upload
  if (value.includes("api.cloudinary.com/v1_1/")) {
    const match = value.match(/\/v1_1\/([^/]+)/);
    return match?.[1] || null;
  }

  // https://res.cloudinary.com/<cloud_name>/image/upload/...
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
    throw new Error(
      "Cloudinary env vars missing. Required: CLOUDINARY_CLOUD_NAME (or CLOUD_NAME/CLOUDINARY_URL), CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET"
    );
  }

  return { cloudName, apiKey, apiSecret };
};

export type CloudinaryUploadResult = {
  secure_url: string;
  public_id: string;
  resource_type: string;
  format?: string;
  bytes?: number;
};

const buildSignature = (
  params: Record<string, string | number>,
  apiSecret: string
) => {
  const stringToSign = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  return crypto.createHash("sha1").update(`${stringToSign}${apiSecret}`).digest("hex");
};

export const uploadToCloudinary = async ({
  file,
  folder,
  resourceType = "image",
  publicId,
  tags,
}: {
  file: File;
  folder: string;
  resourceType?: ResourceType;
  publicId?: string;
  tags?: string[];
}): Promise<CloudinaryUploadResult> => {
  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
  const timestamp = Math.floor(Date.now() / 1000);

  const signable: Record<string, string | number> = {
    folder,
    timestamp,
  };

  if (publicId) signable.public_id = publicId;
  if (tags?.length) signable.tags = tags.join(",");

  const signature = buildSignature(signable, apiSecret);

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("timestamp", String(timestamp));
  formData.append("folder", folder);
  formData.append("signature", signature);

  if (publicId) formData.append("public_id", publicId);
  if (tags?.length) formData.append("tags", tags.join(","));

  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;
  const response = await fetch(endpoint, {
    method: "POST",
    body: formData,
  });

  const payload = await response.json();

  if (!response.ok) {
    const errorMessage = payload?.error?.message || "Cloudinary upload failed";
    throw new Error(`${errorMessage} (cloud_name=${cloudName})`);
  }

  return payload as CloudinaryUploadResult;
};

export const deleteCloudinaryAsset = async ({
  publicId,
  resourceType = "image",
}: {
  publicId: string;
  resourceType?: ResourceType;
}) => {
  const { cloudName, apiKey, apiSecret } = getCloudinaryConfig();
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = buildSignature({ public_id: publicId, timestamp }, apiSecret);

  const formData = new FormData();
  formData.append("public_id", publicId);
  formData.append("api_key", apiKey);
  formData.append("timestamp", String(timestamp));
  formData.append("signature", signature);

  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/destroy`;
  const response = await fetch(endpoint, {
    method: "POST",
    body: formData,
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload?.error?.message || "Cloudinary delete failed");
  }

  return payload;
};

export const extractCloudinaryPublicId = (value?: string | null) => {
  if (!value || typeof value !== "string") return null;

  const fromPublicId = value.match(/([\w/-]+)$/)?.[1];
  if (value.startsWith("car-website-nextjs-1/") && fromPublicId) {
    return fromPublicId;
  }

  try {
    const parsed = new URL(value);
    if (!parsed.hostname.includes("res.cloudinary.com")) return null;

    const pathPart = parsed.pathname;
    const uploadMarker = "/upload/";
    const idx = pathPart.indexOf(uploadMarker);
    if (idx === -1) return null;

    const afterUpload = pathPart.slice(idx + uploadMarker.length);
    const segments = afterUpload.split("/").filter(Boolean);

    const versionIndex = segments.findIndex((segment) => /^v\d+$/.test(segment));
    const relevant = versionIndex >= 0 ? segments.slice(versionIndex + 1) : segments;

    if (relevant.length === 0) return null;

    const joined = relevant.join("/");
    return joined.replace(/\.[a-zA-Z0-9]+$/, "");
  } catch {
    return null;
  }
};
