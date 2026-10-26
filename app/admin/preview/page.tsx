"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useCms } from "@/components/admin/CmsProvider";
import { Notice, Spinner } from "@/components/admin/ui";
import { PREVIEW_MESSAGE, type PreviewPatch } from "@/components/admin/Preview";
import { PageView } from "@/components/PageView";
import { ArticleView } from "@/components/sections/article";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SocialLinks } from "@/components/SocialLinks";
import { snapshotFromRecords, type RecordSet } from "@/lib/cms/admin/snapshot";
import { buildSite } from "@/lib/cms/site";
import { collectionKeys, getPageDef, type CollectionKey, type PageId } from "@/lib/cms/registry";
import { setPreviewSite } from "@/lib/content/store";
import { globalFor } from "@/lib/content/access";
import { headerProps } from "@/lib/content/layout-props";
import { hasLocale, localeInfo, type Locale } from "@/lib/i18n";

function applyPatch(set: RecordSet, patch: PreviewPatch): RecordSet {
  switch (patch.kind) {
    case "section":
      return { ...set, sections: set.sections.map((s) => (s.id === patch.id ? { ...s, draft: patch.draft } : s)) };
    case "seo":
      return { ...set, pages: set.pages.map((p) => (p.id === patch.pageId ? { ...p, draft: patch.draft } : p)) };
    case "settings":
      return set.settings ? { ...set, settings: { ...set.settings, draft: patch.draft } } : set;
    case "item": {
      const key = patch.collection as CollectionKey;
      return { ...set, items: { ...set.items, [key]: (set.items[key] ?? []).map((i) => (i.id === patch.id ? { ...i, draft: patch.draft } : i)) } };
    }
  }
}

function PreviewInner() {
  const params = useSearchParams();
  const { adapter, auth } = useCms();
  const pageParam = params?.get("page") ?? "home";
  const langParam = params?.get("lang") ?? "ar";
  const slug = params?.get("slug");
  const lang: Locale = hasLocale(langParam) ? langParam : "ar";
  const [records, setRecords] = useState<RecordSet | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [patch, setPatch] = useState<PreviewPatch | null>(null);

  useEffect(() => {
    if (auth !== "ready") return;
    let alive = true;
    (async () => {
      try {
        const [pages, sections, settings, media, ...lists] = await Promise.all([
          adapter.listPages(),
          adapter.listSections(),
          adapter.getSettings(),
          adapter.listMedia().catch(() => []),
          ...collectionKeys.map((k) => adapter.listItems(k)),
        ]);
        if (!alive) return;
        setRecords({ pages, sections, settings, media, items: Object.fromEntries(collectionKeys.map((k, i) => [k, lists[i]])) as RecordSet["items"] });
      } catch (e) {
        if (alive) setError((e as Error).message);
      }
    })();
    return () => {
      alive = false;
    };
  }, [adapter, auth]);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || e.data?.type !== PREVIEW_MESSAGE) return;
      setPatch(e.data.patch as PreviewPatch);
    };
    window.addEventListener("message", onMessage);
    window.parent?.postMessage({ type: `${PREVIEW_MESSAGE}-ready` }, window.location.origin);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const site = useMemo(() => {
    if (!records) return null;
    const set = patch ? applyPatch(records, patch) : records;
    return { ...buildSite(snapshotFromRecords(set, { draft: true })), meta: { source: "preview" as const, generatedAt: null } };
  }, [records, patch]);

  if (auth === "loading") return <Spinner label="Loading preview…" />;
  if (auth !== "ready") return <div className="p-6"><Notice tone="warning">Sign in to the dashboard to preview drafts.</Notice></div>;
  if (error) return <div className="p-6"><Notice tone="error" title="Preview unavailable">{error}</Notice></div>;
  if (!site) return <Spinner label="Loading draft content…" />;

  // The preview renders the real website components from draft content.
  setPreviewSite(site);
  const def = getPageDef(pageParam);
  const pageId = (def ? def.id : "home") as PageId;
  const articleSlug = pageId === "article" ? (slug ?? site.collections.articles.find((a) => a.visible)?.slug ?? "") : null;
  const panel = globalFor("contactPanel", lang);

  return (
    <div lang={lang} dir={localeInfo[lang].dir} className="relative">
      <div className="pointer-events-none fixed start-3 bottom-3 z-[80] rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-plum-950 shadow-lg">Draft preview — not published</div>
      <SiteHeader {...headerProps(lang)} menuFooter={<SocialLinks tone="light" label={panel.socialLabel} comingSoon={panel.socialComingSoon} className="mt-2 justify-center" />} />
      <main>{articleSlug !== null ? (ArticleView({ slug: articleSlug, lang }) ?? <div className="p-24 text-center">No article to preview.</div>) : <PageView id={pageId} lang={lang} />}</main>
      <SiteFooter lang={lang} />
    </div>
  );
}

export default function PreviewPage() {
  return (
    <Suspense fallback={<Spinner label="Loading preview…" />}>
      <PreviewInner />
    </Suspense>
  );
}
