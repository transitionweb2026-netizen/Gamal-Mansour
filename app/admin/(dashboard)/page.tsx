"use client";

import Link from "next/link";
import { BookOpen, Clapperboard, FileStack, Images, ListChecks, MessageSquareQuote, Stethoscope } from "lucide-react";
import { useCms } from "@/components/admin/CmsProvider";
import { useLoad } from "@/components/admin/useLoad";
import { Card, Notice, PageHeader, Spinner, StatusPill, Tag, formatBytes, timeAgo } from "@/components/admin/ui";
import { latestPublishedAt, loadAll, rebuildNeeded } from "@/lib/cms/admin/load";
import { docStatus, sectionStatus } from "@/lib/cms/admin/snapshot";
import { itemTitle, revisionLabel } from "@/lib/cms/admin/items";
import { collectionRegistry, getPageDef, pageRegistry, type CollectionKey } from "@/lib/cms/registry";
import { getSite } from "@/lib/content/store";

const icons: Record<CollectionKey, React.ComponentType<{ className?: string }>> = {
  services: Stethoscope,
  articles: BookOpen,
  videos: Clapperboard,
  reviews: MessageSquareQuote,
  faqs: ListChecks,
};

export default function OverviewPage() {
  const { adapter, health, session } = useCms();
  const { data, error, loading } = useLoad(
    async () => ({ set: await loadAll(adapter), revisions: await adapter.listRevisions({ limit: 8 }), outdated: await rebuildNeeded(adapter) }),
    [adapter],
  );
  const build = getSite().meta;

  const set = data?.set;
  const lastPublish = set ? latestPublishedAt(set) : null;
  const changedSections = set ? set.sections.filter((s) => sectionStatus(s) !== "published") : [];
  const changedSeo = set ? set.pages.filter((p) => !p.isTemplate && docStatus(p) !== "published") : [];
  const changedItems = set ? (Object.values(set.items).flat().filter((i) => i.published && docStatus(i) === "changed") ?? []) : [];
  const settingsChanged = set?.settings ? docStatus(set.settings) !== "published" : false;
  const pendingTotal = changedSections.length + changedSeo.length + changedItems.length + (settingsChanged ? 1 : 0);

  return (
    <>
      <PageHeader title={`Welcome${session?.email && adapter.mode === "supabase" ? `, ${session.email.split("@")[0]}` : ""}`} description="The current state of the website content. All numbers are live." />

      {adapter.mode === "supabase" && health && !health.schemaVersion ? (
        <Notice tone="error" className="mb-5" title="The CMS database is not set up">
          Apply the migration in <code>supabase/migrations</code> to this Supabase project, then reload. See <Link className="font-semibold underline" href="/admin/system/">System status</Link>.
        </Notice>
      ) : null}
      {adapter.mode === "supabase" && health?.schemaVersion && !health.initialized ? (
        <Notice tone="warning" className="mb-5" title="No content imported yet">
          The database is ready but empty. <Link className="font-semibold underline" href="/admin/system/">Import the website content</Link> to start editing.
        </Notice>
      ) : null}
      {data?.outdated ? (
        <Notice tone="warning" className="mb-5" title="Published changes are waiting for a site rebuild">
          The published content (latest publish {timeAgo(lastPublish)}) differs from what this build of the website shows. <Link className="font-semibold underline" href="/admin/system/">How to rebuild</Link>
        </Notice>
      ) : null}
      {error ? <Notice tone="error" title="Couldn't load the content">{error}</Notice> : null}
      {loading && !data ? <Spinner /> : null}

      {set ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Card>
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-plum-50 text-plum-600">
                  <FileStack className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-2xl font-bold text-plum-800 tabular-nums">{pageRegistry.filter((p) => !p.template).length}</p>
                  <p className="text-sm text-ink-500">Pages · {set.sections.filter((s) => s.pageId !== "global").length} sections</p>
                </div>
              </div>
              <Link href="/admin/pages/" className="mt-3 inline-block text-sm font-semibold text-crimson-600">
                Edit pages →
              </Link>
            </Card>
            <Card>
              <p className="text-sm font-semibold text-ink-500">Unpublished changes</p>
              <p className="mt-1 text-2xl font-bold text-plum-800 tabular-nums">{pendingTotal}</p>
              <p className="text-sm text-ink-500">saved but not yet published</p>
            </Card>
            <Card>
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-crimson-50 text-crimson-600">
                  <Images className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-2xl font-bold text-plum-800 tabular-nums">{adapter.canUpload() ? set.media.length : "—"}</p>
                  <p className="text-sm text-ink-500">{adapter.canUpload() ? `Uploaded files · ${formatBytes(set.media.reduce((n, m) => n + m.size, 0))}` : "Uploads need Supabase"}</p>
                </div>
              </div>
              <Link href="/admin/media/" className="mt-3 inline-block text-sm font-semibold text-crimson-600">
                Media library →
              </Link>
            </Card>
            <Card>
              <p className="text-sm font-semibold text-ink-500">Last publish</p>
              <p className="mt-1 text-lg font-bold text-plum-800">{lastPublish ? timeAgo(lastPublish) : "Never"}</p>
              <p className="text-sm text-ink-500">Live build: {build.source === "supabase" ? `Supabase content, ${timeAgo(build.generatedAt)}` : build.source === "local-export" ? "exported file" : "bundled defaults"}</p>
            </Card>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {(Object.keys(collectionRegistry) as CollectionKey[]).map((k) => {
              const items = set.items[k] ?? [];
              const Icon = icons[k];
              const published = items.filter((i) => i.published && i.visible).length;
              const drafts = items.filter((i) => !i.published).length;
              const changed = items.filter((i) => i.published && docStatus(i) === "changed").length;
              return (
                <Card key={k} className="p-4 sm:p-5">
                  <Link href={`/admin/collection/?type=${k}`} className="flex items-center gap-2 font-semibold text-plum-800 hover:text-crimson-600">
                    <Icon className="size-4 text-crimson" aria-hidden="true" /> {collectionRegistry[k].label}
                  </Link>
                  <p className="mt-2 text-2xl font-bold text-plum-800 tabular-nums">{items.length}</p>
                  <p className="text-xs text-ink-500">
                    {published} published · {changed} changed · {drafts} draft{drafts === 1 ? "" : "s"}
                    {items.some((i) => !i.visible) ? ` · ${items.filter((i) => !i.visible).length} hidden` : ""}
                  </p>
                </Card>
              );
            })}
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <Card>
              <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold text-plum-800">Waiting to be published</h2>
              {pendingTotal ? (
                <ul className="mt-3 divide-y divide-plum-700/8 text-sm">
                  {settingsChanged ? (
                    <li className="flex items-center justify-between py-2">
                      <Link href="/admin/settings/" className="font-medium hover:text-crimson-600">Site settings</Link>
                      <StatusPill status="changed" />
                    </li>
                  ) : null}
                  {changedSeo.map((p) => (
                    <li key={p.id} className="flex items-center justify-between py-2">
                      <Link href={`/admin/pages/edit/?id=${p.id}&tab=seo`} className="font-medium hover:text-crimson-600">
                        {getPageDef(p.id)?.label ?? p.label} › SEO
                      </Link>
                      <StatusPill status={docStatus(p)} />
                    </li>
                  ))}
                  {changedSections.map((s) => (
                    <li key={s.id} className="flex items-center justify-between gap-3 py-2">
                      <Link href={s.pageId === "global" ? `/admin/global/?key=${s.key}` : `/admin/pages/edit/?id=${s.pageId}&section=${s.key}`} className="font-medium hover:text-crimson-600">
                        {s.pageId === "global" ? "Global" : (getPageDef(s.pageId)?.label ?? s.pageId)} › {s.label}
                      </Link>
                      <StatusPill status={sectionStatus(s)} />
                    </li>
                  ))}
                  {changedItems.map((i) => (
                    <li key={i.id} className="flex items-center justify-between gap-3 py-2">
                      <Link href={`/admin/collection/edit/?type=${i.collection}&id=${i.id}`} className="font-medium hover:text-crimson-600">
                        {collectionRegistry[i.collection].singular} › {itemTitle(i).en || i.slug}
                      </Link>
                      <StatusPill status="changed" />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-ink-700">Everything saved has been published.</p>
              )}
            </Card>
            <Card>
              <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold text-plum-800">Recent activity</h2>
              {data?.revisions.length ? (
                <ul className="mt-3 divide-y divide-plum-700/8 text-sm">
                  {data.revisions.map((r) => (
                    <li key={r.id} className="flex items-center gap-3 py-2">
                      <Tag tone={r.action === "delete" || r.action === "unpublish" ? "crimson" : "plum"}>{r.action}</Tag>
                      <span className="min-w-0 flex-1 truncate">{revisionLabel(r)}</span>
                      <span className="shrink-0 text-xs text-ink-500">{timeAgo(r.createdAt)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-ink-700">No activity yet.</p>
              )}
              <Link href="/admin/revisions/" className="mt-3 inline-block text-sm font-semibold text-crimson-600">
                Full history →
              </Link>
            </Card>
          </div>
        </>
      ) : null}
    </>
  );
}
