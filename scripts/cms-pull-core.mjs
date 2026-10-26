// Shared by scripts/cms-pull.mjs (build) and scripts/cms-dev-sync.mjs (development sync).
// Reads PUBLISHED content through the read-only `cms_public_snapshot()` function with the
// public/publishable key. Drafts and private settings are never fetched.
import fs from "node:fs";
import path from "node:path";
import { assertPublicSupabaseKeys } from "./supabase-key-guard.mjs";

export const publishedFile = path.resolve("content", "published.json");

/** Loads .env.local / .env (like Next.js does) and refuses privileged keys in public variables. */
export function loadCmsEnv() {
  for (const file of [".env.local", ".env"]) {
    try {
      if (fs.existsSync(file)) process.loadEnvFile(file);
    } catch {
      /* older Node: rely on the real environment */
    }
  }
  assertPublicSupabaseKeys();
  return {
    url: (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/+$/, ""),
    key: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    bucket: process.env.NEXT_PUBLIC_CMS_MEDIA_BUCKET || "cms-media",
  };
}

/**
 * Fetches the published snapshot and writes content/published.json — only when the published
 * content changed, so the file (and its timestamp) stay put otherwise. Throws on failure.
 */
export async function pullPublished({ url, key, bucket }) {
  const res = await fetch(`${url}/rest/v1/rpc/cms_public_snapshot`, {
    method: "POST",
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", Accept: "application/json" },
    body: "{}",
    signal: AbortSignal.timeout(30000),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${text.slice(0, 300)}`);
  const snapshot = JSON.parse(text);
  if (!snapshot || snapshot.version !== 1 || typeof snapshot.pages !== "object") {
    throw new Error("Unexpected response — has the CMS migration been applied? (supabase/migrations)");
  }

  // Resolve Storage object paths to public URLs (bucket is public; see migration).
  for (const m of Object.values(snapshot.media || {})) {
    const encoded = String(m.path).split("/").map(encodeURIComponent).join("/");
    m.url = `${url}/storage/v1/object/public/${m.bucket || bucket}/${encoded}`;
  }

  const withoutTime = (s) => JSON.stringify({ ...s, generatedAt: null });
  let previous = null;
  try {
    previous = JSON.parse(fs.readFileSync(publishedFile, "utf8"));
  } catch {
    // No previous pull.
  }
  const changed = !previous || withoutTime(previous) !== withoutTime(snapshot);
  if (changed) fs.writeFileSync(publishedFile, `${JSON.stringify(snapshot, null, 2)}\n`);
  return { snapshot, changed, previousGeneratedAt: previous?.generatedAt ?? null };
}
