import published from "@/content/published.json";
import { buildSite, type PublishedSnapshot, type SiteContent } from "@/lib/cms/site";

/**
 * The content the site renders.
 *
 * At build time this is the bundled defaults merged with `content/published.json`, which
 * `npm run cms:pull` fills with the content published in Supabase (or which the dashboard can
 * export in local mode). Pages are prerendered from it — the static HTML contains real content.
 *
 * The dashboard's preview swaps in draft content with `setPreviewSite` (browser only, never
 * during the public build).
 */
let current: SiteContent = buildSite(published as PublishedSnapshot);

export function getSite(): SiteContent {
  return current;
}

export function setPreviewSite(site: SiteContent): void {
  current = site;
}
