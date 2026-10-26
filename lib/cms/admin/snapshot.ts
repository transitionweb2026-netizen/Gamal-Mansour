import { sameJson } from "@/lib/cms/core";
import { collectionKeys, type CollectionKey } from "@/lib/cms/registry";
import type { PublishedSnapshot } from "@/lib/cms/site";
import type { ItemRecord, MediaItem, PageRecord, SectionRecord, SettingsRecord, Status } from "@/lib/cms/admin/types";

export type RecordSet = {
  pages: PageRecord[];
  sections: SectionRecord[];
  settings: SettingsRecord | null;
  items: Record<CollectionKey, ItemRecord[]>;
  media: MediaItem[];
};

/**
 * Builds the snapshot the public site consumes from CMS records.
 * - `draft: false` mirrors `cms_public_snapshot()` (published content only) — used for local exports.
 * - `draft: true`  uses drafts and unpublished layout — used only by the signed-in preview.
 * Same rules as the database: hidden items and reviews without consent are never included.
 */
export function snapshotFromRecords(data: RecordSet, opts: { draft: boolean; source?: PublishedSnapshot["source"] }): PublishedSnapshot {
  const { draft } = opts;
  const pages: NonNullable<PublishedSnapshot["pages"]> = {};
  for (const p of data.pages) {
    if (p.id === "global") continue;
    const sections: Record<string, { position?: number; visible?: boolean; content?: unknown }> = {};
    for (const s of data.sections.filter((x) => x.pageId === p.id)) {
      const content = draft ? s.draft : s.published;
      if (!content) continue;
      sections[s.key] = {
        position: (draft ? s.position : s.publishedPosition) ?? s.position,
        visible: (draft ? s.visible : s.publishedVisible) ?? s.visible,
        content,
      };
    }
    pages[p.id] = { seo: (draft ? p.draft : p.published) ?? undefined, sections };
  }

  const global: Record<string, unknown> = {};
  for (const s of data.sections.filter((x) => x.pageId === "global")) {
    const content = draft ? s.draft : s.published;
    if (content) global[s.key] = content;
  }

  const initialized = Boolean(data.settings);
  const collections: NonNullable<PublishedSnapshot["collections"]> = {};
  for (const key of collectionKeys) {
    const items = (data.items[key] ?? [])
      .filter((i) => i.visible && (draft ? true : i.published !== null))
      .filter((i) => key !== "reviews" || Boolean((draft ? i.draft : i.published)?.consent))
      .sort((a, b) => a.position - b.position)
      .map((i) => ({ id: i.id, slug: i.slug, position: i.position, visible: i.visible, content: draft ? i.draft : i.published }));
    collections[key] = { initialized, items };
  }

  const media = Object.fromEntries(data.media.map((m) => [m.id, m]));

  return {
    version: 1,
    source: opts.source ?? "local-export",
    generatedAt: new Date().toISOString(),
    settings: (draft ? data.settings?.draft : data.settings?.published) ?? undefined,
    pages,
    global,
    collections,
    media,
  };
}

/* ------------------------------------------------------------------ status */

export function sectionStatus(s: SectionRecord): Status {
  if (!s.published) return "draft";
  const changed = !sameJson(s.draft, s.published) || s.position !== s.publishedPosition || s.visible !== s.publishedVisible;
  return changed ? "changed" : "published";
}

export function docStatus(r: { draft: unknown; published: unknown | null }): Status {
  if (!r.published) return "draft";
  return sameJson(r.draft, r.published) ? "published" : "changed";
}

export const statusLabel: Record<Status, string> = {
  published: "Published",
  changed: "Unpublished changes",
  draft: "Draft — not on the site",
  hidden: "Hidden",
};
