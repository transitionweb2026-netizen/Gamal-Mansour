"use client";

import Link from "next/link";
import { ExternalLink, FileStack, PenSquare } from "lucide-react";
import { useCms } from "@/components/admin/CmsProvider";
import { useLoad } from "@/components/admin/useLoad";
import { BtnLink, Card, EmptyState, Notice, PageHeader, Spinner, StatusPill, Tag, timeAgo } from "@/components/admin/ui";
import { pageRegistry } from "@/lib/cms/registry";
import { docStatus, sectionStatus } from "@/lib/cms/admin/snapshot";

export default function PagesListPage() {
  const { adapter } = useCms();
  const { data, error, loading } = useLoad(async () => ({ pages: await adapter.listPages(), sections: await adapter.listSections() }), [adapter]);

  return (
    <>
      <PageHeader
        title="Website pages"
        description="Every public page, with its sections in the order they appear. Open a page to edit its content, order, visibility and SEO."
        crumbs={[{ label: "Dashboard", href: "/admin/" }, { label: "Pages" }]}
      />
      {error ? <Notice tone="error" title="Couldn't load pages">{error}</Notice> : null}
      {loading && !data ? <Spinner /> : null}
      {data ? (
        <Card className="p-0 sm:p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[46rem] text-sm">
              <thead>
                <tr className="border-b border-plum-700/10 text-start text-xs font-semibold tracking-wide text-ink-500 uppercase">
                  <th scope="col" className="px-5 py-3 text-start">Page</th>
                  <th scope="col" className="px-3 py-3 text-start">URLs</th>
                  <th scope="col" className="px-3 py-3 text-start">Sections</th>
                  <th scope="col" className="px-3 py-3 text-start">Status</th>
                  <th scope="col" className="px-3 py-3 text-start">Last change</th>
                  <th scope="col" className="px-5 py-3 text-end"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {pageRegistry.map((def) => {
                  const rec = data.pages.find((p) => p.id === def.id);
                  const secs = data.sections.filter((s) => s.pageId === def.id);
                  const changed = secs.filter((s) => sectionStatus(s) !== "published").length + (rec && !def.template && docStatus(rec) !== "published" ? 1 : 0);
                  const missing = def.sections.filter((s) => !secs.some((x) => x.key === s.key)).length;
                  const last = [rec?.updatedAt, ...secs.map((s) => s.updatedAt)].filter(Boolean).sort().pop();
                  const route = def.template ? "articles/…" : def.route;
                  return (
                    <tr key={def.id} className="border-b border-plum-700/6 last:border-0 hover:bg-plum-50/40">
                      <td className="px-5 py-3.5">
                        <Link href={`/admin/pages/edit/?id=${def.id}`} className="font-semibold text-plum-800 hover:text-crimson-600">
                          {def.label}
                        </Link>
                        <p className="text-xs text-ink-500">{def.description}</p>
                      </td>
                      <td className="px-3 py-3.5 text-xs" dir="ltr">
                        <span className="block">/ar/{route}</span>
                        <span className="block text-ink-500">/en/{route}</span>
                      </td>
                      <td className="px-3 py-3.5">{def.sections.length}</td>
                      <td className="px-3 py-3.5">
                        {!rec ? <Tag tone="crimson">Not imported</Tag> : missing ? <Tag tone="crimson">{missing} not imported</Tag> : changed ? <StatusPill status="changed" /> : <StatusPill status="published" />}
                        {rec && changed ? <span className="ms-2 text-xs text-ink-500">{changed} item{changed > 1 ? "s" : ""}</span> : null}
                      </td>
                      <td className="px-3 py-3.5 text-ink-700">{timeAgo(last)}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex justify-end gap-2">
                          {!def.template ? (
                            <BtnLink size="sm" variant="ghost" href={`/ar/${def.route ? `${def.route}/` : ""}`} external>
                              <ExternalLink className="size-3.5" aria-hidden="true" /> Live
                            </BtnLink>
                          ) : null}
                          <BtnLink size="sm" variant="plum" href={`/admin/pages/edit/?id=${def.id}`}>
                            <PenSquare className="size-3.5" aria-hidden="true" /> Edit
                          </BtnLink>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ) : null}
      {data && !data.pages.length ? (
        <div className="mt-6">
          <EmptyState icon={<FileStack className="size-6" />} title="No pages in the CMS yet" action={<BtnLink variant="primary" href="/admin/system/">Import website content</BtnLink>}>
            The database is set up but empty. Import the website&apos;s current content to start editing.
          </EmptyState>
        </div>
      ) : null}
    </>
  );
}
