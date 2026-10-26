/**
 * Dashboard configuration from public build-time environment variables.
 * Only the publishable (anon) key is ever used in the browser — never a service-role key.
 */
const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/+$/, "");
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const mb = (v: string | undefined, fallback: number) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

export const cmsConfig = {
  supabaseUrl: url,
  supabaseKey: key,
  /** "supabase" only when both values are present; otherwise the local sandbox. */
  mode: (url && key ? "supabase" : "local") as "supabase" | "local",
  bucket: process.env.NEXT_PUBLIC_CMS_MEDIA_BUCKET || "cms-media",
  maxImageMB: mb(process.env.NEXT_PUBLIC_CMS_MAX_IMAGE_MB, 10),
  maxVideoMB: mb(process.env.NEXT_PUBLIC_CMS_MAX_VIDEO_MB, 50),
  /** Files larger than this use resumable (TUS) uploads. */
  resumableThresholdMB: 6,
  siteUrl: (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/+$/, ""),
  keyKind: key.startsWith("sb_publishable_") ? "publishable" : key ? "anon (legacy JWT)" : "none",
};

export const allowedImageTypes = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];
export const allowedVideoTypes = ["video/mp4", "video/webm"];

export const extensionsFor: Record<string, string[]> = {
  "image/jpeg": ["jpg", "jpeg"],
  "image/png": ["png"],
  "image/webp": ["webp"],
  "image/avif": ["avif"],
  "image/gif": ["gif"],
  "video/mp4": ["mp4", "m4v"],
  "video/webm": ["webm"],
};
