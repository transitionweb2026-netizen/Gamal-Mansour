"use client";

import Link from "next/link";
import { useCms } from "@/components/admin/CmsProvider";
import { useLoad } from "@/components/admin/useLoad";
import { BtnLink, Card, Notice, PageHeader, Spinner, StatusPill, Tag } from "@/components/admin/ui";
import { pageRegistry } from "@/lib/cms/registry";
import { docStatus } from "@/lib/cms/admin/snapshot";

function Len({ text, max }: { text: string; max: number }) {
  if (!text) return <span className="text-xs font-semibold text-crimson-700">Missing</span>;
  const tone = text.length > max ? "text-amber-700 font-semibold" : "text-emerald-700";
  return <span className={`text-xs tabular-nums ${tone}`}>{text.length}/{max}</span>;
}

export default function SeoOverviewPage() {
  const { adapter } = useCms();
  const { data, error, loading } = useLoad(async () => ({ pages: await adapter.listPages(), articles: await adapter.listItems("articles") }), [adapter]);

  return (
    <>
      <PageHeader
        title="SEO & metadata"
        description="Search titles, descriptions and social-sharing details for every page, in both languages. Aim for titles up to ~60 characters and descriptions up to ~160."
        crumbs={[{ label: "Dashboard", href: "/admin/" }, { label: "SEO & metadata" }]}
        actions={<BtnLink variant="outline" href="/admin/settings/">Default SEO settings</BtnLink>}
      />
      <Notice tone="info" className="mb-5">
        The site is prerendered, so search engines see exactly the published metadata in each page&apos;s HTML after the next build. Article SEO is edited inside each article.
      </Notice>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {loading && !data ? <Spinner /> : null}
      {data ? (
        <Card className="p-0 sm:p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[52rem] text-sm">
              <thead>
                <tr className="border-b border-plum-700/10 text-xs font-semibold tracking-wide text-ink-500 uppercase">
                  <th scope="col" className="px-5 py-3 text-start">Page</th>
                  <th scope="col" className="px-3 py-3 text-start">Title (EN / AR)</th>
                  <th scope="col" className="px-3 py-3 text-start">Description</th>
                  <th scope="col" className="px-3 py-3 text-start">Status</th>
                  <th scope="col" className="px-5 py-3"><span className="sr-only">Edit</span></th>
                </tr>
              </thead>
              <tbody>
                {pageRegistry
                  .filter((p) => !p.template)
                  .map((def) => {
                    const rec = data.pages.find((p) => p.id === def.id);
                    const seo = (rec?.draft ?? {}) as { title?: { en: string; ar: string }; description?: { en: string; ar: string }; noindex?: boolean; ogImage?: string };
                    return (
                      <tr key={def.id} className="border-b border-plum-700/6 align-top last:border-0">
                        <td className="px-5 py-3.5 font-semibold text-plum-800">
                          {def.label}
                          <span className="block text-xs font-normal text-ink-500" dir="ltr">
                            /{def.route}
                          </span>
                        </td>
                        <td className="max-w-xs px-3 py-3.5">
                          <p className="truncate">{seo.title?.en || "—"}</p>
                          <Len text={seo.title?.en ?? ""} max={60} />
                          <p className="mt-1 truncate" dir="rtl" lang="ar">
                            {seo.title?.ar || "—"}
                          </p>
                          <Len text={seo.title?.ar ?? ""} max={60} />
                        </td>
                        <td className="px-3 py-3.5">
                          EN <Len text={seo.description?.en ?? ""} max={160} /> · AR <Len text={seo.description?.ar ?? ""} max={160} />
                          <div className="mt-1 flex gap-1.5">
                            {seo.noindex ? <Tag tone="crimson">noindex</Tag> : null}
                            {seo.ogImage ? <Tag>Own share image</Tag> : null}
                          </div>
                        </td>
                        <td className="px-3 py-3.5">{rec ? <StatusPill status={docStatus(rec)} /> : <Tag tone="crimson">Not imported</Tag>}</td>
                        <td className="px-5 py-3.5 text-end">
                          <BtnLink size="sm" variant="plum" href={`/admin/pages/edit/?id=${def.id}&tab=seo`}>
                            Edit SEO
                          </BtnLink>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
          <div className="border-t border-plum-700/10 px-5 py-3.5 text-sm text-ink-700">
            Articles with their own SEO title: {data.articles.filter((a) => ((a.draft.seo as { title?: { en?: string } })?.title?.en ?? "").trim()).length} of {data.articles.length}.{" "}
            <Link href="/admin/collection/?type=articles" className="font-semibold text-plum-700 underline">
              Manage articles
            </Link>
          </div>
        </Card>
      ) : null}
    </>
  );
}
