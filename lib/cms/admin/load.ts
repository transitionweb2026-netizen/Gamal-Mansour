import { collectionKeys } from "@/lib/cms/registry";
import { buildSite, contentFingerprint } from "@/lib/cms/site";
import { getSite } from "@/lib/content/store";
import type { RecordSet } from "@/lib/cms/admin/snapshot";
import type { CmsAdapter } from "@/lib/cms/admin/types";

/** Loads every CMS record (used by the overview, system status and preview). */
export async function loadAll(adapter: CmsAdapter): Promise<RecordSet> {
  const [pages, sections, settings, media, ...lists] = await Promise.all([
    adapter.listPages(),
    adapter.listSections(),
    adapter.getSettings(),
    adapter.listMedia().catch(() => []),
    ...collectionKeys.map((k) => adapter.listItems(k)),
  ]);
  return { pages, sections, settings, media, items: Object.fromEntries(collectionKeys.map((k, i) => [k, lists[i]])) as RecordSet["items"] };
}

/** Most recent publish time across all content, or null if nothing was published. */
export function latestPublishedAt(set: RecordSet): string | null {
  const times = [
    ...set.pages.map((p) => p.publishedAt),
    ...set.sections.map((s) => s.publishedAt),
    set.settings?.publishedAt ?? null,
    ...Object.values(set.items).flat().map((i) => i.publishedAt),
  ].filter((t): t is string => Boolean(t));
  return times.sort().pop() ?? null;
}

/**
 * Whether the published CMS content differs from the content this copy of the website was built
 * with (the dashboard ships in the same static export as the public pages). Null when unknown.
 */
export async function rebuildNeeded(adapter: CmsAdapter): Promise<boolean | null> {
  try {
    return contentFingerprint(buildSite(await adapter.publishedSnapshot())) !== contentFingerprint(getSite());
  } catch {
    return null;
  }
}
