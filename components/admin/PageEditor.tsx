"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Eye, EyeOff, GripVertical, Globe2, Lock, Send } from "lucide-react";
import { useCms } from "@/components/admin/CmsProvider";
import { DocEditor } from "@/components/admin/DocEditor";
import { usePreview } from "@/components/admin/Preview";
import { useLoad } from "@/components/admin/useLoad";
import { Btn, BtnLink, Card, Notice, PageHeader, Spinner, StatusPill, Tag } from "@/components/admin/ui";
import { deriveFields } from "@/lib/cms/admin/fields";
import { docStatus, sectionStatus } from "@/lib/cms/admin/snapshot";
import type { Json, SectionRecord } from "@/lib/cms/admin/types";
import { isLText } from "@/lib/cms/core";
import { getGlobalDef, getPageDef, globalUsage, type GlobalKey } from "@/lib/cms/registry";
import * as D from "@/content/defaults";

/** First meaningful text in a document — used as the one-line section summary. */
export function summarize(doc: unknown): string {
  const seen: string[] = [];
  const walk = (v: unknown) => {
    if (seen.length) return;
    if (isLText(v)) {
      const t = (v.en || v.ar).trim();
      if (t) seen.push(t);
      return;
    }
    if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === "object") Object.values(v).forEach(walk);
  };
  walk(doc);
  return seen[0]?.slice(0, 110) ?? "";
}

export function PageEditor() {
  const params = useSearchParams();
  const pageId = params?.get("id") ?? "home";
  const tab = params?.get("tab") === "seo" ? "seo" : "content";
  const sectionKey = params?.get("section");
  const router = useRouter();
  const { adapter, toast, bump, isDirty, confirm, setDirty } = useCms();
  const def = getPageDef(pageId);
  const { data, error, loading, reload } = useLoad(
    async () => ({ page: (await adapter.listPages()).find((p) => p.id === pageId) ?? null, sections: await adapter.listSections(pageId) }),
    [adapter, pageId],
  );
  const [dragId, setDragId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const preview = usePreview(`page=${pageId}`);

  const sections = useMemo(() => [...(data?.sections ?? [])].sort((a, b) => a.position - b.position), [data]);
  const selected = sections.find((s) => s.key === sectionKey) ?? sections[0];
  const selectedDef = def?.sections.find((s) => s.key === selected?.key);
  const missing = def?.sections.filter((s) => !sections.some((x) => x.key === s.key)) ?? [];
  const unknown = sections.filter((s) => !def?.sections.some((d) => d.key === s.key));
  const pendingCount = sections.filter((s) => sectionStatus(s) !== "published").length + (data?.page && !def?.template && docStatus(data.page) !== "published" ? 1 : 0);

  const navigate = async (query: string) => {
    if (isDirty()) {
      const ok = await confirm({ title: "Leave without saving?", body: "You have unsaved changes in this section.", confirmLabel: "Discard and continue", danger: true });
      if (!ok) return;
      setDirty("*", false);
    }
    router.push(`/admin/pages/edit/?id=${pageId}${query}`);
  };

  const applyOrder = async (ordered: SectionRecord[]) => {
    setBusy(true);
    try {
      await adapter.reorderSections(pageId, ordered.map((s) => s.id));
      toast("success", "New order saved as a draft. Publish the page to apply it on the website.");
      bump();
    } catch (e) {
      toast("error", `Order not saved: ${(e as Error).message}`);
      reload();
    } finally {
      setBusy(false);
    }
  };

  const move = (index: number, delta: number) => {
    const next = [...sections];
    const [x] = next.splice(index, 1);
    next.splice(index + delta, 0, x);
    void applyOrder(next);
  };

  const toggleVisible = async (s: SectionRecord) => {
    if (s.required) return;
    setBusy(true);
    try {
      await adapter.saveSection(s.id, { visible: !s.visible }, s.version);
      toast("success", `“${s.label}” will be ${s.visible ? "hidden" : "shown"} once you publish the page.`);
      bump();
    } catch (e) {
      toast("error", (e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const publishPage = async () => {
    setBusy(true);
    try {
      const n = await adapter.publishPage(pageId);
      toast("success", `Published ${def?.label}: ${n} section${n === 1 ? "" : "s"} updated. The live site updates on its next build.`);
      bump();
    } catch (e) {
      toast("error", `Not published: ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  };

  if (!def) return <Notice tone="error">Unknown page “{pageId}”.</Notice>;

  return (
    <>
      <PageHeader
        title={def.label}
        description={def.description}
        crumbs={[{ label: "Dashboard", href: "/admin/" }, { label: "Pages", href: "/admin/pages/" }, { label: def.label }]}
        actions={
          <>
            {!def.template ? (
              <BtnLink variant="ghost" href={`/ar/${def.route ? `${def.route}/` : ""}`} external>
                View live
              </BtnLink>
            ) : null}
            {preview.button}
            <Btn variant="primary" onClick={publishPage} loading={busy} disabled={!pendingCount}>
              <Send className="size-4" aria-hidden="true" /> Publish page{pendingCount ? ` (${pendingCount})` : ""}
            </Btn>
          </>
        }
      />
      {error ? <Notice tone="error" title="Couldn't load this page">{error}</Notice> : null}
      {missing.length ? (
        <Notice tone="warning" className="mb-4" title={`${missing.length} section${missing.length > 1 ? "s are" : " is"} not in the CMS yet`}>
          {missing.map((m) => m.label).join(", ")}. Run <Link className="font-semibold underline" href="/admin/system/">System › Import website content</Link> — existing content is never overwritten.
        </Notice>
      ) : null}
      {unknown.length ? (
        <Notice tone="info" className="mb-4">
          {unknown.length} stored section{unknown.length > 1 ? "s" : ""} ({unknown.map((u) => u.key).join(", ")}) {unknown.length > 1 ? "are" : "is"} not used by the current website code and won&apos;t render.
        </Notice>
      ) : null}
      {loading && !data ? <Spinner /> : null}

      {data ? (
        <div className="grid gap-6 xl:grid-cols-[22rem_minmax(0,1fr)]">
          <Card className="self-start p-3 sm:p-4 xl:sticky xl:top-20">
            <div className="mb-2 flex items-center justify-between px-1">
              <h2 className="text-sm font-bold text-plum-800">Sections on this page</h2>
              <span className="text-xs text-ink-500">top → bottom</span>
            </div>
            {def.template ? <p className="mb-2 px-1 text-xs text-ink-500">This is a template: its layout is fixed. Hide optional parts with the eye icon.</p> : null}
            <ol className="space-y-1.5" aria-label="Sections in display order">
              {sections.map((s, i) => {
                const sDef = def.sections.find((d) => d.key === s.key);
                const isSel = selected?.id === s.id;
                const st = sectionStatus(s);
                return (
                  <li
                    key={s.id}
                    draggable={!def.template && !busy}
                    onDragStart={() => setDragId(s.id)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => {
                      if (!dragId || dragId === s.id) return;
                      const next = sections.filter((x) => x.id !== dragId);
                      next.splice(i, 0, sections.find((x) => x.id === dragId)!);
                      setDragId(null);
                      void applyOrder(next);
                    }}
                    className={`group rounded-xl ring-1 transition-colors ${isSel ? "bg-plum-50 ring-crimson/40" : "bg-white ring-plum-700/8 hover:ring-plum-700/20"} ${!s.visible ? "opacity-70" : ""}`}
                  >
                    <div className="flex items-start gap-2 p-2.5">
                      {!def.template ? <GripVertical className="mt-1 size-4 shrink-0 cursor-grab text-plum-300" aria-hidden="true" /> : null}
                      <button type="button" onClick={() => navigate(`&section=${s.key}`)} aria-current={isSel ? "true" : undefined} className="min-w-0 flex-1 text-start">
                        <span className="flex items-center gap-2">
                          <span className="text-xs font-bold text-plum-400 tabular-nums">{i + 1}</span>
                          <span className="truncate text-sm font-semibold text-plum-800">{sDef?.label ?? s.label}</span>
                        </span>
                        <span className="mt-1 flex flex-wrap items-center gap-1.5">
                          {s.refKey ? <Tag>Shared</Tag> : null}
                          {s.required ? <Tag tone="slate">Required</Tag> : null}
                          {!s.visible ? <Tag tone="slate">Hidden</Tag> : null}
                          {st !== "published" ? <StatusPill status={st} /> : null}
                        </span>
                        {!s.refKey ? <span className="mt-1 line-clamp-1 block text-xs text-ink-500">{summarize(s.draft)}</span> : null}
                      </button>
                      <div className="flex shrink-0 flex-col items-center gap-0.5">
                        <button type="button" onClick={() => toggleVisible(s)} disabled={s.required || busy} aria-label={s.required ? `${s.label} is required` : s.visible ? `Hide ${s.label}` : `Show ${s.label}`} title={s.required ? "Required section" : s.visible ? "Hide section" : "Show section"} className="grid size-8 place-items-center rounded-lg text-plum-600 hover:bg-plum-100 disabled:opacity-40">
                          {s.required ? <Lock className="size-4" aria-hidden="true" /> : s.visible ? <Eye className="size-4" aria-hidden="true" /> : <EyeOff className="size-4" aria-hidden="true" />}
                        </button>
                        {!def.template ? (
                          <span className="flex">
                            <button type="button" disabled={i === 0 || busy} onClick={() => move(i, -1)} aria-label={`Move ${s.label} up`} className="grid size-7 place-items-center rounded-md text-plum-600 hover:bg-plum-100 disabled:opacity-30">
                              <ArrowUp className="size-3.5" aria-hidden="true" />
                            </button>
                            <button type="button" disabled={i === sections.length - 1 || busy} onClick={() => move(i, 1)} aria-label={`Move ${s.label} down`} className="grid size-7 place-items-center rounded-md text-plum-600 hover:bg-plum-100 disabled:opacity-30">
                              <ArrowDown className="size-3.5" aria-hidden="true" />
                            </button>
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
            {!def.template ? (
              <div className="mt-3 border-t border-plum-700/8 pt-3">
                <button type="button" onClick={() => navigate("&tab=seo")} aria-current={tab === "seo" ? "true" : undefined} className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold ${tab === "seo" ? "bg-plum-50 text-crimson-600" : "text-plum-700 hover:bg-plum-50"}`}>
                  SEO & social sharing
                  {data.page ? <StatusPill status={docStatus(data.page)} /> : null}
                </button>
              </div>
            ) : null}
          </Card>

          <Card>
            {tab === "seo" && data.page && !def.template ? (
              <>
                <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold text-plum-800">SEO & social sharing</h2>
                <p className="mt-1 mb-4 text-sm text-ink-700">How this page appears in search results and when shared. Arabic and English are separate pages with their own text.</p>
                <DocEditor
                  key={`seo-${pageId}`}
                  dirtyKey={`seo-${pageId}`}
                  fields={deriveFields(D.seoTemplate, {}, "seo")}
                  record={data.page}
                  status={docStatus(data.page)}
                  onSave={async (draft: Json, version) => {
                    await adapter.savePageSeo(pageId, draft, version);
                    bump();
                  }}
                  onPublish={async () => {
                    await adapter.publish("cms_pages", pageId);
                    bump();
                  }}
                  onDiscard={async () => {
                    await adapter.discardDraft("cms_pages", pageId);
                    bump();
                  }}
                  onDraftChange={(draft) => preview.post({ kind: "seo", pageId, draft })}
                />
              </>
            ) : selected?.refKey ? (
              <SharedSectionCard refKey={selected.refKey as GlobalKey} label={selectedDef?.label ?? selected.label} />
            ) : selected && selectedDef ? (
              <>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold text-plum-800">{selectedDef.label}</h2>
                    <p className="mt-1 text-sm text-ink-700">{selectedDef.description}</p>
                  </div>
                  <Tag tone="slate">{selectedDef.type}</Tag>
                </div>
                {selectedDef.collections?.length ? (
                  <Notice tone="info" className="mt-4">
                    The items shown in this section are edited under{" "}
                    {selectedDef.collections.map((c, n) => (
                      <span key={c}>
                        {n ? " and " : ""}
                        <Link className="font-semibold underline" href={`/admin/collection/?type=${c}`}>
                          {c === "faqs" ? "FAQ" : c.charAt(0).toUpperCase() + c.slice(1)}
                        </Link>
                      </span>
                    ))}
                    . Here you edit this section&apos;s own headings and labels.
                  </Notice>
                ) : null}
                <div className="mt-4">
                  <DocEditor
                    key={selected.id}
                    dirtyKey={`section-${selected.id}`}
                    fields={deriveFields(selectedDef.default ?? {}, selectedDef.itemTemplates)}
                    record={selected}
                    status={sectionStatus(selected)}
                    onSave={async (draft, version) => {
                      await adapter.saveSection(selected.id, { draft }, version);
                      bump();
                    }}
                    onPublish={async () => {
                      await adapter.publish("cms_sections", selected.id);
                      bump();
                    }}
                    onDiscard={async () => {
                      await adapter.discardDraft("cms_sections", selected.id);
                      bump();
                    }}
                    onDraftChange={(draft) => preview.post({ kind: "section", id: selected.id, draft })}
                    publishLabel="Publish section"
                  />
                </div>
              </>
            ) : (
              <p className="text-sm text-ink-500">Select a section.</p>
            )}
          </Card>
        </div>
      ) : null}
      {preview.panel}
    </>
  );
}

function SharedSectionCard({ refKey, label }: { refKey: GlobalKey; label: string }) {
  const g = getGlobalDef(refKey);
  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-xl bg-plum-50 text-plum-600">
          <Globe2 className="size-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold text-plum-800">{label}</h2>
          <p className="text-sm text-ink-700">Shared section — one version is used everywhere it appears.</p>
        </div>
      </div>
      <p className="mt-4 text-sm text-ink-700">{g?.description}</p>
      <p className="mt-4 text-sm font-semibold text-plum-800">Used on</p>
      <ul className="mt-1 list-disc ps-5 text-sm text-ink-700">
        {globalUsage(refKey).map((u, i) => (
          <li key={i}>{u}</li>
        ))}
      </ul>
      <p className="mt-4 text-sm text-ink-700">On this page you can move it or hide it. Its text and image are edited once, in Global content.</p>
      <BtnLink className="mt-4" variant="plum" href={`/admin/global/?key=${refKey}`}>
        Edit shared content
      </BtnLink>
    </div>
  );
}
