import * as D from "@/content/defaults";
import { settingsDefaults, type SiteSettings } from "@/content/site";
import { conform } from "@/lib/cms/conform";
import type { CmsMediaRecord } from "@/lib/cms/media";
import {
  collectionKeys,
  collectionRegistry,
  globalRegistry,
  pageRegistry,
  settingsItemTemplates,
  type CollectionKey,
  type GlobalKey,
  type PageId,
} from "@/lib/cms/registry";

export type SectionInstance = {
  key: string;
  type: string;
  label: string;
  ref?: GlobalKey;
  required: boolean;
  visible: boolean;
  /** Section content; null for shared (ref) sections. */
  content: Record<string, unknown> | null;
};

export type PageState = { id: PageId; seo: D.SeoDoc; sections: SectionInstance[] };

export type GlobalContent = {
  navigation: typeof D.gNavigation;
  header: typeof D.gHeader;
  footer: typeof D.gFooter;
  contactPanel: typeof D.gContactPanel;
  emergency: typeof D.gEmergency;
  cta: typeof D.gCta;
  ui: typeof D.gUi;
  notFound: typeof D.gNotFound;
};

export type Collections = {
  services: D.CollectionItem<D.ServiceDoc>[];
  articles: D.CollectionItem<D.ArticleDoc>[];
  videos: D.CollectionItem<D.VideoDoc>[];
  reviews: D.CollectionItem<D.ReviewDoc>[];
  faqs: D.CollectionItem<D.FaqDoc>[];
};

export type SiteContent = {
  settings: SiteSettings;
  global: GlobalContent;
  pages: Record<PageId, PageState>;
  collections: Collections;
  media: Record<string, CmsMediaRecord>;
  meta: { source: "defaults" | "supabase" | "local-export" | "preview"; generatedAt: string | null };
};

/** Published content as produced by `cms_public_snapshot()` or the dashboard's local export. */
export type PublishedSnapshot = {
  version?: number;
  source?: "supabase" | "local-export";
  generatedAt?: string;
  settings?: unknown;
  global?: Partial<Record<string, unknown>>;
  pages?: Partial<
    Record<string, { seo?: unknown; sections?: Partial<Record<string, { position?: number; visible?: boolean; content?: unknown }>> }>
  >;
  collections?: Partial<
    Record<
      string,
      {
        /** True once the collection has been imported/created in the CMS (even if it has 0 published items). */
        initialized?: boolean;
        items?: Array<{ id: string; slug?: string | null; position?: number; visible?: boolean; content?: unknown }>;
      }
    >
  >;
  media?: Record<string, CmsMediaRecord>;
};

const defaultCollections: Collections = {
  services: D.defaultServices,
  articles: D.defaultArticles,
  videos: D.defaultVideos,
  reviews: D.defaultReviews,
  faqs: D.defaultFaqs,
};

/** Merges a published snapshot over the bundled defaults. Pass nothing for pure defaults. */
export function buildSite(snapshot?: PublishedSnapshot | null): SiteContent {
  const snap = snapshot && typeof snapshot === "object" ? snapshot : {};

  const settings = conform(snap.settings, settingsDefaults, { itemTemplates: settingsItemTemplates });

  const global = Object.fromEntries(
    globalRegistry.map((g) => [g.key, conform(snap.global?.[g.key], g.default, { itemTemplates: g.itemTemplates })]),
  ) as GlobalContent;

  const pages = Object.fromEntries(
    pageRegistry.map((p) => {
      const stored = snap.pages?.[p.id];
      const sections = p.sections
        .map((s, index) => {
          const st = stored?.sections?.[s.key];
          return {
            order: typeof st?.position === "number" ? st.position : 1000 + index,
            index,
            section: {
              key: s.key,
              type: s.type,
              label: s.label,
              ref: s.ref,
              required: Boolean(s.required),
              visible: s.required ? true : typeof st?.visible === "boolean" ? st.visible : true,
              content: s.ref ? null : (conform(st?.content, s.default ?? {}, { itemTemplates: s.itemTemplates }) as Record<string, unknown>),
            } satisfies SectionInstance,
          };
        })
        .sort((a, b) => a.order - b.order || a.index - b.index)
        .map((x) => x.section);
      const seoDefault = (D.pageSeo as Record<string, D.SeoDoc>)[p.id] ?? D.seoTemplate;
      return [p.id, { id: p.id, seo: conform(stored?.seo, seoDefault), sections }];
    }),
  ) as Record<PageId, PageState>;

  const collections = Object.fromEntries(
    collectionKeys.map((key) => {
      const c = snap.collections?.[key];
      if (!c?.initialized) return [key, defaultCollections[key]];
      const template = collectionRegistry[key].template;
      const items = (c.items ?? [])
        .map((i, n) => ({
          id: String(i.id),
          slug: i.slug ?? String(i.id),
          position: typeof i.position === "number" ? i.position : n,
          visible: i.visible !== false,
          content: conform(i.content, template, { emptyLists: true }),
        }))
        .sort((a, b) => a.position - b.position);
      return [key, items];
    }),
  ) as Collections;

  return {
    settings,
    global,
    pages,
    collections,
    media: snap.media ?? {},
    meta: {
      source: snap.source ?? "defaults",
      generatedAt: snap.generatedAt ?? null,
    },
  };
}

/**
 * Everything that affects the rendered pages, without build metadata or storage ids (item ids
 * are only used as React keys). Equal fingerprints mean a rebuild would produce the same site.
 */
export function contentFingerprint(site: SiteContent): string {
  const collections = Object.fromEntries(
    collectionKeys.map((key) => [
      key,
      site.collections[key].map((i) => ({ slug: collectionRegistry[key].slugged ? i.slug : null, position: i.position, visible: i.visible, content: i.content })),
    ]),
  );
  return JSON.stringify({ ...site, collections, meta: null });
}

export type { CollectionKey };
