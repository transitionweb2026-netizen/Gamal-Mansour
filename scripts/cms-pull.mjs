// Pulls the PUBLISHED content from Supabase into content/published.json before `next build`,
// so the static export contains the latest published CMS content.
//
//   npm run cms:pull          (also runs automatically as the first step of `npm run build`)
//
// Uses only the public/publishable key and the read-only `cms_public_snapshot()` function:
// drafts and private settings are never fetched. No service-role key is needed or used.
//
// CMS_PULL=auto     (default) pull when Supabase is configured; fail the build if the pull fails
// CMS_PULL=required fail when Supabase is not configured
// CMS_PULL=off      skip; build from bundled content (+ any existing content/published.json)
import fs from "node:fs";
import path from "node:path";
import { assertPublicSupabaseKeys } from "./supabase-key-guard.mjs";

for (const file of [".env.local", ".env"]) {
  try {
    if (fs.existsSync(file)) process.loadEnvFile(file);
  } catch {
    /* older Node: rely on the real environment */
  }
}

try {
  assertPublicSupabaseKeys();
} catch (err) {
  console.error(`cms:pull — ${err.message}`);
  process.exit(1);
}

const mode = (process.env.CMS_PULL || "auto").toLowerCase();
const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/+$/, "");
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const bucketDefault = process.env.NEXT_PUBLIC_CMS_MEDIA_BUCKET || "cms-media";
const out = path.resolve("content", "published.json");

if (mode === "off") {
  console.log("cms:pull — skipped (CMS_PULL=off). Building from bundled content.");
  process.exit(0);
}

if (!url || !key) {
  if (mode === "required") {
    console.error("cms:pull — CMS_PULL=required but NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY are not set.");
    process.exit(1);
  }
  console.log("cms:pull — Supabase is not configured; building from bundled content (content/*.ts + content/published.json).");
  process.exit(0);
}

try {
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
    m.url = `${url}/storage/v1/object/public/${m.bucket || bucketDefault}/${encoded}`;
  }

  const initialized = Object.values(snapshot.collections || {}).some((c) => c.initialized);
  // Keep the file (and its timestamp) when the published content is unchanged, so the tracked
  // file only changes when someone actually published something.
  const withoutTime = (s) => JSON.stringify({ ...s, generatedAt: null });
  let previous = null;
  try {
    previous = JSON.parse(fs.readFileSync(out, "utf8"));
  } catch {
    // No previous pull.
  }
  const unchanged = previous && withoutTime(previous) === withoutTime(snapshot);
  if (!unchanged) fs.writeFileSync(out, `${JSON.stringify(snapshot, null, 2)}\n`);
  const counts = Object.fromEntries(Object.entries(snapshot.collections || {}).map(([k, v]) => [k, v.items.length]));
  console.log(
    `cms:pull — ${unchanged ? `published content unchanged since ${previous.generatedAt}; kept` : `wrote content/published.json (generated ${snapshot.generatedAt})`}.` +
      ` Pages: ${Object.keys(snapshot.pages).length}, global sections: ${Object.keys(snapshot.global || {}).length},` +
      ` media: ${Object.keys(snapshot.media || {}).length}, items: ${JSON.stringify(counts)}`,
  );
  if (!initialized) {
    console.warn("cms:pull — WARNING: the CMS has no imported content yet. Open the dashboard › System › Import website content.");
  }
} catch (err) {
  console.error(`cms:pull — FAILED to fetch published content from ${url}: ${err.message}`);
  console.error("The build is stopped so an outdated site is not deployed by mistake. Set CMS_PULL=off to build from bundled content.");
  process.exit(1);
}
