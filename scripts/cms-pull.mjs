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
import { loadCmsEnv, pullPublished } from "./cms-pull-core.mjs";

let config;
try {
  config = loadCmsEnv();
} catch (err) {
  console.error(`cms:pull — ${err.message}`);
  process.exit(1);
}

const mode = (process.env.CMS_PULL || "auto").toLowerCase();

if (mode === "off") {
  console.log("cms:pull — skipped (CMS_PULL=off). Building from bundled content.");
  process.exit(0);
}

if (!config.url || !config.key) {
  if (mode === "required") {
    console.error("cms:pull — CMS_PULL=required but NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY are not set.");
    process.exit(1);
  }
  console.log("cms:pull — Supabase is not configured; building from bundled content (content/*.ts + content/published.json).");
  process.exit(0);
}

try {
  const { snapshot, changed, previousGeneratedAt } = await pullPublished(config);
  const counts = Object.fromEntries(Object.entries(snapshot.collections || {}).map(([k, v]) => [k, v.items.length]));
  console.log(
    `cms:pull — ${changed ? `wrote content/published.json (generated ${snapshot.generatedAt})` : `published content unchanged since ${previousGeneratedAt}; kept`}.` +
      ` Pages: ${Object.keys(snapshot.pages).length}, global sections: ${Object.keys(snapshot.global || {}).length},` +
      ` media: ${Object.keys(snapshot.media || {}).length}, items: ${JSON.stringify(counts)}`,
  );
  if (!Object.values(snapshot.collections || {}).some((c) => c.initialized)) {
    console.warn("cms:pull — WARNING: the CMS has no imported content yet. Open the dashboard › System › Import website content.");
  }
} catch (err) {
  console.error(`cms:pull — FAILED to fetch published content from ${config.url}: ${err.message}`);
  console.error("The build is stopped so an outdated site is not deployed by mistake. Set CMS_PULL=off to build from bundled content.");
  process.exit(1);
}
