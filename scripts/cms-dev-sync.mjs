// Keeps the development server in step with the CMS. Started from next.config.ts in the
// development phase, so it runs however the dev server is launched (`npm run dev`, `next dev`, an
// editor's debugger) — and an already-running server picks it up when it restarts for a config change.
//
// When Supabase is configured, published content is pulled right away and then checked every
// CMS_DEV_POLL_SECONDS (default 5). Whenever something new is published, the updated
// content/published.json makes the open pages refresh by themselves. Network problems are reported
// once and never stop the dev server.
import { loadCmsEnv, pullPublished } from "./cms-pull-core.mjs";

export function startCmsDevSync() {
  // next.config can be evaluated more than once in the same server process.
  if (globalThis.__cmsDevSync) return;
  globalThis.__cmsDevSync = true;

  const config = loadCmsEnv();
  if (!config.url || !config.key || (process.env.CMS_PULL || "auto").toLowerCase() === "off") {
    console.log("cms — Supabase not configured (or CMS_PULL=off): showing bundled content.");
    return;
  }
  const seconds = Math.max(2, Number(process.env.CMS_DEV_POLL_SECONDS) || 5);
  let first = true;
  let failing = false;
  let busy = false;

  async function sync() {
    if (busy) return; // a slow request is still running
    busy = true;
    try {
      const { changed } = await pullPublished(config);
      if (failing) console.log("cms — connection to Supabase restored.");
      failing = false;
      if (first) console.log(`cms — ${changed ? "pulled" : "up to date with"} published content; checking for new publishes every ${seconds}s.`);
      else if (changed) console.log("cms — new published content pulled; open pages refresh automatically.");
      first = false;
    } catch (err) {
      if (!failing) console.warn(`cms — could not fetch published content (${err.message}). Showing the last pulled content; retrying.`);
      failing = true;
    } finally {
      busy = false;
    }
  }

  sync();
  setInterval(sync, seconds * 1000).unref();
}
