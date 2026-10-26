import * as tus from "tus-js-client";
import { allowedImageTypes, allowedVideoTypes, cmsConfig, extensionsFor } from "@/lib/cms/admin/config";

export type MediaInfo = { kind: "image" | "video"; width: number | null; height: number | null; duration: number | null };

/** Checks type, extension/MIME consistency and size limits. Returns an error message or null. */
export function validateUpload(file: File): string | null {
  const isImage = allowedImageTypes.includes(file.type);
  const isVideo = allowedVideoTypes.includes(file.type);
  if (!isImage && !isVideo) {
    return `“${file.name}” is not a supported file. Images: JPEG, PNG, WebP, AVIF, GIF. Videos: MP4, WebM.`;
  }
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!extensionsFor[file.type]?.includes(ext)) {
    return `The extension .${ext} does not match the file type (${file.type}). Rename or re-export the file.`;
  }
  const limitMB = isImage ? cmsConfig.maxImageMB : cmsConfig.maxVideoMB;
  if (file.size > limitMB * 1024 * 1024) {
    return `“${file.name}” is ${(file.size / 1024 / 1024).toFixed(1)} MB. The limit for ${isImage ? "images" : "videos"} is ${limitMB} MB.`;
  }
  if (file.size === 0) return "The file is empty.";
  return null;
}

/** Reads intrinsic dimensions (and duration for video) in the browser before uploading. */
export async function readMediaInfo(file: File): Promise<MediaInfo> {
  if (allowedImageTypes.includes(file.type)) {
    try {
      const bmp = await createImageBitmap(file);
      const info = { kind: "image" as const, width: bmp.width, height: bmp.height, duration: null };
      bmp.close();
      return info;
    } catch {
      throw new Error(`“${file.name}” could not be read as an image. It may be damaged.`);
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const meta = await new Promise<MediaInfo>((resolve, reject) => {
      const v = document.createElement("video");
      v.preload = "metadata";
      v.onloadedmetadata = () =>
        resolve({ kind: "video", width: v.videoWidth || null, height: v.videoHeight || null, duration: Number.isFinite(v.duration) ? Math.round(v.duration * 10) / 10 : null });
      v.onerror = () => reject(new Error(`“${file.name}” could not be read as a video in this browser.`));
      v.src = url;
    });
    return meta;
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Storage path: <kind>s/<yyyy>/<mm>/<uuid>.<ext> (original filename is kept in the database). */
export function storagePathFor(file: File, kind: "image" | "video"): string {
  const d = new Date();
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  return `${kind}s/${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${crypto.randomUUID()}.${ext}`;
}

/**
 * Uploads to Supabase Storage with progress. Files above the resumable threshold use the TUS
 * protocol (6 MB chunks, retried on network errors); smaller files use one request.
 */
export async function uploadObject(file: File, path: string, accessToken: string, onProgress?: (fraction: number) => void): Promise<void> {
  const { supabaseUrl, supabaseKey, bucket, resumableThresholdMB } = cmsConfig;
  if (file.size > resumableThresholdMB * 1024 * 1024) {
    await new Promise<void>((resolve, reject) => {
      const upload = new tus.Upload(file, {
        endpoint: `${supabaseUrl}/storage/v1/upload/resumable`,
        retryDelays: [0, 3000, 5000, 10000, 20000],
        headers: { authorization: `Bearer ${accessToken}`, apikey: supabaseKey, "x-upsert": "false" },
        uploadDataDuringCreation: true,
        removeFingerprintOnSuccess: true,
        chunkSize: 6 * 1024 * 1024, // Supabase requires exactly 6 MB chunks
        metadata: { bucketName: bucket, objectName: path, contentType: file.type, cacheControl: "31536000" },
        onError: (e) => reject(new Error(`Upload failed: ${e.message}`)),
        onProgress: (sent, total) => onProgress?.(total ? sent / total : 0),
        onSuccess: () => resolve(),
      });
      upload.findPreviousUploads().then((previous) => {
        if (previous.length) upload.resumeFromPreviousUpload(previous[0]);
        upload.start();
      });
    });
    return;
  }

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const encoded = path.split("/").map(encodeURIComponent).join("/");
    xhr.open("POST", `${supabaseUrl}/storage/v1/object/${bucket}/${encoded}`);
    xhr.setRequestHeader("authorization", `Bearer ${accessToken}`);
    xhr.setRequestHeader("apikey", supabaseKey);
    xhr.setRequestHeader("content-type", file.type);
    xhr.setRequestHeader("cache-control", "max-age=31536000");
    xhr.setRequestHeader("x-upsert", "false");
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress?.(e.loaded / e.total);
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) return resolve();
      let message = xhr.responseText;
      try {
        message = JSON.parse(xhr.responseText).message ?? message;
      } catch {
        /* keep raw text */
      }
      reject(new Error(`Upload failed (${xhr.status}): ${message}`));
    };
    xhr.onerror = () => reject(new Error("Upload failed: network error."));
    xhr.send(file);
  });
  onProgress?.(1);
}

export function publicUrl(path: string, bucket = cmsConfig.bucket): string {
  return `${cmsConfig.supabaseUrl}/storage/v1/object/public/${bucket}/${path.split("/").map(encodeURIComponent).join("/")}`;
}
