import { collectionRegistry } from "@/lib/cms/registry";
import type { ItemRecord, Json, RevisionRecord } from "@/lib/cms/admin/types";

function titleOf(doc: Json | null | undefined): { en: string; ar: string } {
  const d = (doc ?? {}) as Record<string, unknown>;
  const t = (d.title ?? d.question ?? d.quote) as { en?: string; ar?: string } | undefined;
  return { en: t?.en?.trim() || "", ar: t?.ar?.trim() || "" };
}

/** Display title of a collection item (title, question or quote) in both languages. */
export function itemTitle(item: ItemRecord): { en: string; ar: string } {
  return titleOf(item.draft);
}

const collectionOf = (r: RevisionRecord) => Object.values(collectionRegistry).find((c) => c.table === r.entityType);

/** Readable name of a revision's record: collection items by their title rather than their id. */
export function revisionTitle(r: RevisionRecord): string {
  if (r.entityType === "cms_settings") return "Site settings";
  if (!collectionOf(r)) return r.entityLabel || r.entityId;
  const t = titleOf(r.snapshot.draft ?? r.snapshot.published);
  return t.en || t.ar || r.entityLabel || r.entityId;
}

/** `revisionTitle` with the item type, for lists that mix record types. */
export function revisionLabel(r: RevisionRecord): string {
  const def = collectionOf(r);
  return def ? `${def.singular} › ${revisionTitle(r)}` : revisionTitle(r);
}
