"use client";

import { useState } from "react";
import { History, RotateCcw } from "lucide-react";
import { useCms } from "@/components/admin/CmsProvider";
import { summarize } from "@/components/admin/PageEditor";
import { useLoad } from "@/components/admin/useLoad";
import { Btn, Card, EmptyState, Notice, PageHeader, Spinner, Tag, timeAgo } from "@/components/admin/ui";
import { revisionTitle } from "@/lib/cms/admin/items";
import type { RevisionRecord } from "@/lib/cms/admin/types";

const typeLabels: Record<string, string> = {
  cms_sections: "Section",
  cms_pages: "Page SEO",
  cms_settings: "Settings",
  cms_services: "Service",
  cms_articles: "Article",
  cms_videos: "Video",
  cms_reviews: "Review",
  cms_faqs: "FAQ",
};

const actionTone: Record<RevisionRecord["action"], "plum" | "crimson" | "slate"> = {
  create: "plum",
  save: "slate",
  publish: "plum",
  unpublish: "crimson",
  layout: "slate",
  restore: "plum",
  discard: "crimson",
  delete: "crimson",
};

export default function RevisionsPage() {
  const { adapter, toast, confirm, bump } = useCms();
  const [type, setType] = useState("");
  const { data, error, loading } = useLoad(() => adapter.listRevisions({ entityType: type || undefined, limit: 200 }), [adapter, type]);
  const [open, setOpen] = useState<string | null>(null);

  const restore = async (r: RevisionRecord) => {
    const ok = await confirm({
      title: "Restore this version?",
      body: "Its content becomes the current draft. Nothing changes on the website until you publish it.",
      confirmLabel: "Restore as draft",
    });
    if (!ok) return;
    try {
      await adapter.restoreRevision(r.id);
      toast("success", "Restored as a draft. Review and publish it to apply it.");
      bump();
    } catch (e) {
      toast("error", `Not restored: ${(e as Error).message}`);
    }
  };

  return (
    <>
      <PageHeader
        title="Revision history"
        description="Every save, publish, layout change and deletion is recorded. Restore any earlier version as a draft."
        crumbs={[{ label: "Dashboard", href: "/admin/" }, { label: "Revision history" }]}
        actions={
          <label className="text-sm">
            <span className="sr-only">Filter by type</span>
            <select value={type} onChange={(e) => setType(e.target.value)} className="rounded-xl bg-white px-3 py-2 ring-1 ring-plum-700/15">
              <option value="">All content</option>
              {Object.entries(typeLabels).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </label>
        }
      />
      {error ? <Notice tone="error">{error}</Notice> : null}
      {loading && !data ? <Spinner /> : null}
      {data && !data.length ? <EmptyState icon={<History className="size-6" />} title="No revisions yet">Changes appear here as soon as content is saved or published.</EmptyState> : null}
      {data?.length ? (
        <Card className="p-0 sm:p-0">
          <ul className="divide-y divide-plum-700/8">
            {data.map((r) => {
              const restorable = r.action !== "delete" && r.snapshot.draft && typeof r.snapshot.draft === "object" && Object.keys(r.snapshot.draft).length > 0;
              return (
                <li key={r.id} className="px-4 py-3 sm:px-5">
                  <div className="flex flex-wrap items-center gap-3">
                    <Tag tone={actionTone[r.action]}>{r.action}</Tag>
                    <span className="text-xs font-semibold text-ink-500">{typeLabels[r.entityType] ?? r.entityType}</span>
                    <button type="button" onClick={() => setOpen(open === r.id ? null : r.id)} aria-expanded={open === r.id} className="min-w-0 flex-1 truncate text-start text-sm font-semibold text-plum-800 hover:text-crimson-600">
                      {revisionTitle(r)}
                    </button>
                    <span className="text-xs text-ink-500">{timeAgo(r.createdAt)}</span>
                    {restorable ? (
                      <Btn size="sm" variant="ghost" onClick={() => restore(r)}>
                        <RotateCcw className="size-3.5" aria-hidden="true" /> Restore
                      </Btn>
                    ) : null}
                  </div>
                  {open === r.id ? (
                    <div className="mt-3 rounded-xl bg-plum-50/60 p-3 text-sm">
                      <p className="text-ink-700">{summarize(r.snapshot.draft) || "No text content."}</p>
                      <details className="mt-2">
                        <summary className="text-xs font-semibold text-plum-700">Show stored data</summary>
                        <pre className="mt-2 max-h-72 overflow-auto rounded-lg bg-white p-3 text-xs" dir="ltr">
                          {JSON.stringify(r.snapshot, null, 2)}
                        </pre>
                      </details>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </Card>
      ) : null}
    </>
  );
}
