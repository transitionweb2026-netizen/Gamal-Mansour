/**
 * Initial CMS records built from the content the website currently shows: the bundled defaults
 * merged with content/published.json (see lib/content/store.ts). Shared by
 * `npm run cms:seed-sql` (supabase/seed.sql), the dashboard's "Import website content" action
 * and the local sandbox, so all three always import exactly the same data.
 *
 * Everything is imported as already published: it is what the live site shows today.
 */
import { clone } from "@/lib/cms/core";
import { collectionKeys, collectionRegistry, globalRegistry, pageRegistry, type CollectionKey } from "@/lib/cms/registry";
import type { SiteContent } from "@/lib/cms/site";
import { getSite } from "@/lib/content/store";

export const GLOBAL_PAGE_ID = "global";

export type SeedPage = { id: string; route: string; label: string; sort: number; is_template: boolean; draft: object; published: object };
export type SeedSection = {
  page_id: string;
  key: string;
  label: string;
  section_type: string;
  ref_key: string | null;
  required: boolean;
  position: number;
  visible: boolean;
  draft: object;
  published: object;
  published_position: number;
  published_visible: boolean;
};
export type SeedItem = {
  import_key: string;
  slug: string | null;
  position: number;
  visible: boolean;
  draft: object;
  published: object;
  consent_confirmed?: boolean;
  category?: string;
};

export function seedPages(site: SiteContent = getSite()): SeedPage[] {
  const pages: SeedPage[] = pageRegistry.map((p, i) => {
    const seo = p.template ? {} : clone(site.pages[p.id].seo);
    return { id: p.id, route: p.route, label: p.label, sort: i, is_template: Boolean(p.template), draft: seo, published: seo };
  });
  pages.push({ id: GLOBAL_PAGE_ID, route: "", label: "Global content", sort: 100, is_template: true, draft: {}, published: {} });
  return pages;
}

export function seedSections(site: SiteContent = getSite()): SeedSection[] {
  const pageSections = pageRegistry.flatMap((p) => {
    const current = site.pages[p.id].sections;
    return p.sections.map((s) => {
      const live = current.find((x) => x.key === s.key);
      const position = Math.max(0, current.findIndex((x) => x.key === s.key));
      const content = s.ref ? {} : clone(live?.content ?? s.default ?? {});
      const visible = s.required ? true : (live?.visible ?? true);
      return {
        page_id: p.id,
        key: s.key,
        label: s.label,
        section_type: s.ref ? "ref" : s.type,
        ref_key: s.ref ?? null,
        required: Boolean(s.required),
        position,
        visible,
        draft: content,
        published: content,
        published_position: position,
        published_visible: visible,
      };
    });
  });
  const globals = globalRegistry.map((g, i) => {
    const content = clone(site.global[g.key]);
    return {
      page_id: GLOBAL_PAGE_ID,
      key: g.key,
      label: g.label,
      section_type: `global.${g.key}`,
      ref_key: null,
      required: true,
      position: i,
      visible: true,
      draft: content,
      published: content,
      published_position: i,
      published_visible: true,
    };
  });
  return [...pageSections, ...globals];
}

export function seedSettings(site: SiteContent = getSite()) {
  return { id: "site", draft: clone(site.settings), published: clone(site.settings) };
}

export function seedItems(key: CollectionKey, site: SiteContent = getSite()): SeedItem[] {
  const slugged = collectionRegistry[key].slugged;
  return site.collections[key].map((item) => {
    const content = clone(item.content) as Record<string, unknown>;
    const row: SeedItem = {
      import_key: item.id,
      slug: slugged ? item.slug : null,
      position: item.position,
      visible: item.visible,
      draft: content,
      published: content,
    };
    if (key === "reviews") row.consent_confirmed = content.consent === true;
    if (key === "faqs") row.category = String(content.category);
    return row;
  });
}

export function seedSummary(site: SiteContent = getSite()) {
  return {
    pages: seedPages(site).length,
    sections: seedSections(site).length,
    settings: 1,
    ...Object.fromEntries(collectionKeys.map((k) => [k, seedItems(k, site).length])),
  };
}
