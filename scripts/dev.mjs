// `npm run dev`: the Next.js dev server, kept in sync with the CMS.
//
// When Supabase is configured, published content is pulled before the server starts and then
// checked every CMS_DEV_POLL_SECONDS (default 5). Whenever something new is published, the
// updated content/published.json makes the open page refresh by itself. Network problems are
// reported but never stop the dev server.
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { loadCmsEnv, pullPublished } from "./cms-pull-core.mjs";

const config = loadCmsEnv();
const enabled = Boolean(config.url && config.key) && (process.env.CMS_PULL || "auto").toLowerCase() !== "off";
const seconds = Math.max(2, Number(process.env.CMS_DEV_POLL_SECONDS) || 5);
let failing = false;

async function sync(first = false) {
  try {
    const { changed } = await pullPublished(config);
    if (failing) console.log("cms — connection to Supabase restored.");
    failing = false;
    if (changed && !first) console.log("cms — new published content pulled; open pages refresh automatically.");
    if (first) console.log(`cms — ${changed ? "pulled" : "up to date with"} published content; checking for new publishes every ${seconds}s.`);
  } catch (err) {
    if (!failing) console.warn(`cms — could not fetch published content (${err.message}). Showing the last pulled content; retrying.`);
    failing = true;
  }
}

if (enabled) await sync(true);
else console.log("cms — Supabase not configured (or CMS_PULL=off): showing bundled content.");

const next = createRequire(import.meta.url).resolve("next/dist/bin/next");
const child = spawn(process.execPath, [next, "dev", ...process.argv.slice(2)], { stdio: "inherit" });
const timer = enabled ? setInterval(sync, seconds * 1000) : null;
child.on("exit", (code, signal) => {
  if (timer) clearInterval(timer);
  process.exit(signal ? 1 : (code ?? 0));
});
for (const sig of ["SIGINT", "SIGTERM"]) process.on(sig, () => child.kill(sig));
