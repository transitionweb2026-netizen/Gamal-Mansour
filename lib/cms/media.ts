import { photos, type PhotoName } from "@/lib/photos";
import type { LText } from "@/lib/cms/core";

/**
 * Media references stored in content (never raw URLs scattered across components):
 *   local:<photo>   bundled responsive photo (public/images/<photo>-<width>.webp, see lib/photos.ts)
 *   static:<path>   bundled file in /public, e.g. static:/brand/logo.png
 *   cms:<uuid>      file uploaded through the dashboard to Supabase Storage (row in cms_media)
 *   ""              no media
 */
export type MediaRef = string;

export type CmsMediaRecord = {
  id: string;
  path: string;
  /** Public URL of the object in Supabase Storage. */
  url: string;
  kind: "image" | "video";
  mime: string;
  size: number;
  width: number | null;
  height: number | null;
  duration: number | null;
  originalName: string;
  alt: LText;
  caption: LText;
  createdAt?: string;
};

export type ResolvedMedia = {
  ref: MediaRef;
  kind: "image" | "video";
  src: string;
  srcSet?: string;
  width?: number;
  height?: number;
  blur?: string;
  mime?: string;
};

/** Bundled static assets that can be referenced (with intrinsic sizes for layout stability). */
export const staticAssets: Record<string, { width: number; height: number; label: string; mime: string }> = {
  "/brand/logo.png": { width: 1444, height: 675, label: "Official logo", mime: "image/png" },
  "/brand/mark.png": { width: 512, height: 473, label: "Logo heart mark", mime: "image/png" },
  "/og/og-default.jpg": { width: 1200, height: 630, label: "Default social share image", mime: "image/jpeg" },
};

export function parseMediaRef(ref: MediaRef): { scheme: "local" | "static" | "cms"; value: string } | null {
  const m = /^(local|static|cms):(.+)$/.exec(ref.trim());
  return m ? { scheme: m[1] as "local" | "static" | "cms", value: m[2] } : null;
}

export function isPhotoName(name: string): name is PhotoName {
  return name in photos;
}

/**
 * Resolves a media reference. `cmsMedia` is the table of uploaded media known to the current
 * content source (published snapshot at build time, live records in the dashboard).
 */
export function resolveMedia(ref: MediaRef, cmsMedia: Record<string, CmsMediaRecord>): ResolvedMedia | null {
  const parsed = parseMediaRef(ref);
  if (!parsed) return null;
  if (parsed.scheme === "local") {
    if (!isPhotoName(parsed.value)) return null;
    const p = photos[parsed.value];
    return {
      ref,
      kind: "image",
      src: `/images/${parsed.value}-${p.widths[Math.min(1, p.widths.length - 1)]}.webp`,
      srcSet: p.widths.map((w) => `/images/${parsed.value}-${w}.webp ${w}w`).join(", "),
      width: p.width,
      height: p.height,
      blur: p.blur,
      mime: "image/webp",
    };
  }
  if (parsed.scheme === "static") {
    const s = staticAssets[parsed.value];
    return { ref, kind: "image", src: parsed.value, width: s?.width, height: s?.height, mime: s?.mime };
  }
  const rec = cmsMedia[parsed.value];
  if (!rec) return null;
  return {
    ref,
    kind: rec.kind,
    src: rec.url,
    width: rec.width ?? undefined,
    height: rec.height ?? undefined,
    mime: rec.mime,
  };
}

/** Largest single URL for a reference — used for Open Graph images and posters. */
export function mediaUrl(ref: MediaRef, cmsMedia: Record<string, CmsMediaRecord>, preferWidth = 1080): string | null {
  const parsed = parseMediaRef(ref);
  if (parsed?.scheme === "local" && isPhotoName(parsed.value)) {
    const widths = photos[parsed.value].widths;
    const w = widths.find((x) => x >= preferWidth) ?? widths[widths.length - 1];
    return `/images/${parsed.value}-${w}.webp`;
  }
  return resolveMedia(ref, cmsMedia)?.src ?? null;
}
