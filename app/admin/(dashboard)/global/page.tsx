"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCms } from "@/components/admin/CmsProvider";
import { DocEditor } from "@/components/admin/DocEditor";
import { summarize } from "@/components/admin/PageEditor";
import { usePreview } from "@/components/admin/Preview";
import { useLoad } from "@/components/admin/useLoad";
import { Card, Notice, PageHeader, Spinner, StatusPill } from "@/components/admin/ui";
import { deriveFields } from "@/lib/cms/admin/fields";
import { sectionStatus } from "@/lib/cms/admin/snapshot";
import { globalRegistry, globalUsage } from "@/lib/cms/registry";

function GlobalContent() {
  const key = useSearchParams()?.get("key") ?? globalRegistry[0].key;
  const router = useRouter();
  const { adapter, bump, isDirty, confirm, setDirty } = useCms();
  const { data, error, loading } = useLoad(() => adapter.listSections("global"), [adapter]);
  const def = globalRegistry.find((g) => g.key === key) ?? globalRegistry[0];
  const record = data?.find((s) => s.key === def.key);
  // Shared content (header, footer, call-to-action…) is visible on the home page preview.
  const preview = usePreview("page=home");

  const select = async (k: string) => {
    if (isDirty()) {
      if (!(await confirm({ title: "Leave without saving?", body: "Unsaved changes will be lost.", confirmLabel: "Discard and continue", danger: true }))) return;
      setDirty("*", false);
    }
    router.push(`/admin/global/?key=${k}`);
  };

  return (
    <>
      <PageHeader
        title="Global content"
        description="Content shared by many pages. Each item is edited once here and updates everywhere it appears."
        crumbs={[{ label: "Dashboard", href: "/admin/" }, { label: "Global content" }]}
        actions={preview.button}
      />
      {error ? <Notice tone="error">{error}</Notice> : null}
      {loading && !data ? <Spinner /> : null}
      {data ? (
        <div className="grid gap-6 xl:grid-cols-[20rem_minmax(0,1fr)]">
          <Card className="self-start p-3 sm:p-3">
            <ul className="space-y-1">
              {globalRegistry.map((g) => {
                const rec = data.find((s) => s.key === g.key);
                const active = g.key === def.key;
                return (
                  <li key={g.key}>
                    <button type="button" onClick={() => select(g.key)} aria-current={active ? "true" : undefined} className={`w-full rounded-xl px-3 py-2.5 text-start ${active ? "bg-plum-50 ring-1 ring-crimson/40" : "hover:bg-plum-50/60"}`}>
                      <span className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-plum-800">{g.label}</span>
                        {rec ? sectionStatus(rec) !== "published" ? <StatusPill status={sectionStatus(rec)} /> : null : <span className="text-xs font-semibold text-crimson-700">Not imported</span>}
                      </span>
                      <span className="mt-0.5 line-clamp-1 block text-xs text-ink-500">{rec ? summarize(rec.draft) : g.description}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </Card>
          <Card>
            <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold text-plum-800">{def.label}</h2>
            <p className="mt-1 text-sm text-ink-700">{def.description}</p>
            <p className="mt-3 text-sm">
              <span className="font-semibold text-plum-800">Appears on: </span>
              <span className="text-ink-700">{globalUsage(def.key).join(" · ")}</span>
            </p>
            {!record ? (
              <Notice tone="warning" className="mt-4">
                Not in the CMS yet. Run <Link href="/admin/system/" className="font-semibold underline">System › Import website content</Link>.
              </Notice>
            ) : (
              <div className="mt-5">
                <DocEditor
                  key={record.id}
                  dirtyKey={`global-${record.id}`}
                  fields={deriveFields(def.default, def.itemTemplates)}
                  record={record}
                  status={sectionStatus(record)}
                  onSave={async (draft, version) => {
                    await adapter.saveSection(record.id, { draft }, version);
                    bump();
                  }}
                  onPublish={async () => {
                    await adapter.publish("cms_sections", record.id);
                    bump();
                  }}
                  onDiscard={async () => {
                    await adapter.discardDraft("cms_sections", record.id);
                    bump();
                  }}
                  onDraftChange={(draft) => preview.post({ kind: "section", id: record.id, draft })}
                />
              </div>
            )}
          </Card>
        </div>
      ) : null}
      {preview.panel}
    </>
  );
}

export default function GlobalContentPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <GlobalContent />
    </Suspense>
  );
}
