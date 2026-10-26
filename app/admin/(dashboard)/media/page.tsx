"use client";

import { useMemo, useRef, useState } from "react";
import { Copy, Film, Grid2x2, List, RefreshCw, Search, Trash2 } from "lucide-react";
import { useCms } from "@/components/admin/CmsProvider";
import { bundledMedia, UploadJobs, UploadZone, useUploader } from "@/components/admin/media";
import { useLoad } from "@/components/admin/useLoad";
import { Btn, Card, EmptyState, Modal, Notice, PageHeader, Spinner, Tag, formatBytes, timeAgo } from "@/components/admin/ui";
import { allowedImageTypes, allowedVideoTypes } from "@/lib/cms/admin/config";
import { collectionKeys } from "@/lib/cms/registry";
import type { MediaItem } from "@/lib/cms/admin/types";

const PAGE = 24;

function useBundledUsage() {
  const { adapter } = useCms();
  return useLoad(async () => {
    const [sections, settings, ...lists] = await Promise.all([adapter.listSections(), adapter.getSettings(), ...collectionKeys.map((k) => adapter.listItems(k))]);
    const docs: Array<{ label: string; text: string }> = [
      ...sections.map((s) => ({ label: `${s.pageId === "global" ? "Global" : s.pageId} › ${s.label}`, text: JSON.stringify([s.draft, s.published]) })),
      ...(settings ? [{ label: "Site settings", text: JSON.stringify([settings.draft, settings.published]) }] : []),
      ...lists.flatMap((items, i) => items.map((it) => ({ label: `${collectionKeys[i]} › ${it.slug ?? it.id.slice(0, 8)}`, text: JSON.stringify([it.draft, it.published]) }))),
    ];
    return (ref: string) => docs.filter((d) => d.text.includes(`"${ref}"`)).map((d) => d.label);
  }, [adapter]);
}

function MediaDetails({ item, onClose, onChanged }: { item: MediaItem; onClose: () => void; onChanged: (m: MediaItem | null) => void }) {
  const { adapter, toast, confirm, bump } = useCms();
  const [alt, setAlt] = useState(item.alt);
  const [caption, setCaption] = useState(item.caption);
  const [busy, setBusy] = useState<null | "save" | "replace" | "delete">(null);
  const [progress, setProgress] = useState(0);
  const fileInput = useRef<HTMLInputElement>(null);
  const usage = useLoad(() => adapter.mediaUsage(item.id), [adapter, item.id]);
  const used = (usage.data?.length ?? 0) > 0;
  const dirty = JSON.stringify(alt) !== JSON.stringify(item.alt) || JSON.stringify(caption) !== JSON.stringify(item.caption);
  const box = "block w-full rounded-xl bg-white px-3 py-2 text-sm ring-1 ring-inset ring-plum-700/15 focus:ring-2 focus:ring-crimson focus:outline-none";

  return (
    <Modal
      open
      onClose={onClose}
      title={item.originalName}
      size="lg"
      footer={
        <>
          <Btn
            variant="danger"
            disabled={used || usage.loading || Boolean(busy)}
            loading={busy === "delete"}
            title={used ? "Used on the website — replace it there first" : undefined}
            onClick={async () => {
              const ok = await confirm({ title: "Delete this file?", body: "The file is removed from Supabase Storage permanently.", confirmLabel: "Delete file", danger: true });
              if (!ok) return;
              setBusy("delete");
              try {
                await adapter.deleteMedia(item.id);
                toast("success", "File deleted from the library and Storage.");
                onChanged(null);
                bump();
              } catch (e) {
                toast("error", `Not deleted: ${(e as Error).message}`);
              } finally {
                setBusy(null);
              }
            }}
          >
            <Trash2 className="size-4" aria-hidden="true" /> Delete
          </Btn>
          <Btn variant="outline" loading={busy === "replace"} disabled={Boolean(busy)} onClick={() => fileInput.current?.click()}>
            <RefreshCw className="size-4" aria-hidden="true" /> Replace file{busy === "replace" ? ` ${Math.round(progress * 100)}%` : ""}
          </Btn>
          <Btn
            variant="plum"
            disabled={!dirty || Boolean(busy)}
            loading={busy === "save"}
            onClick={async () => {
              setBusy("save");
              try {
                const m = await adapter.updateMedia(item.id, { alt, caption }, item.version);
                toast("success", "File details saved to Supabase.");
                onChanged(m);
              } catch (e) {
                toast("error", `Not saved: ${(e as Error).message}`);
              } finally {
                setBusy(null);
              }
            }}
          >
            Save details
          </Btn>
          <input
            ref={fileInput}
            type="file"
            className="sr-only"
            tabIndex={-1}
            accept={(item.kind === "image" ? allowedImageTypes : allowedVideoTypes).join(",")}
            onChange={async (e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (!file) return;
              const ok = await confirm({ title: "Replace this file everywhere?", body: `Every page that uses “${item.originalName}” will show “${file.name}” after the next build. The current file is deleted once the new one is in place.`, confirmLabel: "Replace" });
              if (!ok) return;
              setBusy("replace");
              try {
                const m = await adapter.replaceMediaFile(item.id, file, setProgress);
                toast("success", "File replaced. Pages using it will show the new file after the next build.");
                onChanged(m);
                bump();
              } catch (err) {
                toast("error", `Not replaced — the previous file is unchanged. ${(err as Error).message}`);
              } finally {
                setBusy(null);
              }
            }}
          />
        </>
      }
    >
      <div className="grid gap-5 md:grid-cols-[1fr_1.1fr]">
        <div className="overflow-hidden rounded-xl bg-plum-50 ring-1 ring-plum-700/10">
          {item.kind === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element -- dashboard preview
            <img src={item.url} alt={item.alt.en || ""} className="max-h-80 w-full object-contain" />
          ) : (
            <video src={item.url} controls preload="metadata" className="max-h-80 w-full" />
          )}
        </div>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
          <dt className="text-ink-500">Type</dt>
          <dd>{item.mime}</dd>
          <dt className="text-ink-500">Size</dt>
          <dd>{formatBytes(item.size)}</dd>
          {item.width ? (
            <>
              <dt className="text-ink-500">Dimensions</dt>
              <dd>
                {item.width} × {item.height}
              </dd>
            </>
          ) : null}
          {item.duration ? (
            <>
              <dt className="text-ink-500">Duration</dt>
              <dd>{item.duration}s</dd>
            </>
          ) : null}
          <dt className="text-ink-500">Uploaded</dt>
          <dd>{timeAgo(item.createdAt)}</dd>
          <dt className="text-ink-500">Public URL</dt>
          <dd className="flex min-w-0 items-center gap-2">
            <span className="truncate" dir="ltr">
              {item.url}
            </span>
            <button type="button" aria-label="Copy URL" onClick={() => navigator.clipboard?.writeText(item.url).then(() => toast("success", "URL copied."))} className="shrink-0 text-plum-600 hover:text-crimson-600">
              <Copy className="size-4" aria-hidden="true" />
            </button>
          </dd>
        </dl>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {(["ar", "en"] as const).map((lang) => (
          <div key={lang} className="space-y-2">
            <label className="block text-sm font-semibold text-plum-800">
              Alt text — {lang === "ar" ? "Arabic" : "English"}
              <input dir={lang === "ar" ? "rtl" : "ltr"} lang={lang} value={alt[lang]} onChange={(e) => setAlt({ ...alt, [lang]: e.target.value })} className={`mt-1 ${box}`} />
            </label>
            <label className="block text-sm font-semibold text-plum-800">
              Caption — {lang === "ar" ? "Arabic" : "English"}
              <input dir={lang === "ar" ? "rtl" : "ltr"} lang={lang} value={caption[lang]} onChange={(e) => setCaption({ ...caption, [lang]: e.target.value })} className={`mt-1 ${box}`} />
            </label>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-ink-500">Each place that shows an image also has its own description field; this is the library default for reference.</p>

      <h3 className="mt-6 text-sm font-bold text-plum-800">Where it is used</h3>
      {usage.loading ? <Spinner label="Checking usage…" /> : usage.data?.length ? (
        <ul className="mt-2 space-y-1 text-sm">
          {usage.data.map((u, i) => (
            <li key={i} className="flex flex-wrap items-center gap-2">
              <span>{u.label}</span>
              {u.inPublished ? <Tag>Published</Tag> : null}
              {u.inDraft ? <Tag tone="slate">Draft</Tag> : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-ink-700">Not used anywhere — it can be deleted safely.</p>
      )}
    </Modal>
  );
}

export default function MediaLibraryPage() {
  const { adapter } = useCms();
  const canUpload = adapter.canUpload();
  const { data, error, loading, setData } = useLoad(() => adapter.listMedia(), [adapter]);
  const bundledUsage = useBundledUsage();
  const [view, setView] = useState<"grid" | "list">("grid");
  const [q, setQ] = useState("");
  const [kind, setKind] = useState<"all" | "image" | "video">("all");
  const [limit, setLimit] = useState(PAGE);
  const [selected, setSelected] = useState<MediaItem | null>(null);
  const { jobs, upload } = useUploader((m) => setData((list) => [m, ...(list ?? [])]));

  const filtered = useMemo(
    () => (data ?? []).filter((m) => (kind === "all" || m.kind === kind) && (!q || m.originalName.toLowerCase().includes(q.toLowerCase()) || m.alt.en.toLowerCase().includes(q.toLowerCase()))),
    [data, kind, q],
  );
  const totalSize = (data ?? []).reduce((s, m) => s + m.size, 0);

  return (
    <>
      <PageHeader
        title="Media library"
        description="Images and videos used on the website. Uploads go to Supabase Storage; choose them in any image or video field."
        crumbs={[{ label: "Dashboard", href: "/admin/" }, { label: "Media library" }]}
      />
      {!canUpload ? <Notice tone="info" className="mb-5" title="Uploads need Supabase">The local sandbox can&apos;t store files. The photos bundled with the site are listed below and can be used in any image field.</Notice> : null}

      {canUpload ? (
        <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_22rem]">
          <UploadZone onFiles={upload} accept={[...allowedImageTypes, ...allowedVideoTypes].join(",")} />
          <UploadJobs jobs={jobs} />
        </div>
      ) : null}

      {canUpload ? (
        <Card className="mb-8">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <h2 className="me-auto font-[family-name:var(--font-heading)] text-lg font-bold text-plum-800">
              Uploaded files <span className="text-sm font-normal text-ink-500">({data?.length ?? 0} · {formatBytes(totalSize)})</span>
            </h2>
            <label className="relative">
              <span className="sr-only">Search files</span>
              <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-ink-500" aria-hidden="true" />
              <input value={q} onChange={(e) => { setQ(e.target.value); setLimit(PAGE); }} placeholder="Search…" className="rounded-xl bg-white py-2 ps-9 pe-3 text-sm ring-1 ring-plum-700/15 focus:ring-2 focus:ring-crimson focus:outline-none" />
            </label>
            <label>
              <span className="sr-only">File type</span>
              <select value={kind} onChange={(e) => { setKind(e.target.value as typeof kind); setLimit(PAGE); }} className="rounded-xl bg-white px-3 py-2 text-sm ring-1 ring-plum-700/15">
                <option value="all">All types</option>
                <option value="image">Images</option>
                <option value="video">Videos</option>
              </select>
            </label>
            <div className="inline-flex rounded-xl bg-plum-50 p-1" role="group" aria-label="View">
              <button type="button" aria-pressed={view === "grid"} aria-label="Grid view" onClick={() => setView("grid")} className={`grid size-8 place-items-center rounded-lg ${view === "grid" ? "bg-white shadow-sm" : ""}`}>
                <Grid2x2 className="size-4" aria-hidden="true" />
              </button>
              <button type="button" aria-pressed={view === "list"} aria-label="List view" onClick={() => setView("list")} className={`grid size-8 place-items-center rounded-lg ${view === "list" ? "bg-white shadow-sm" : ""}`}>
                <List className="size-4" aria-hidden="true" />
              </button>
            </div>
          </div>
          {error ? <Notice tone="error">{error}</Notice> : null}
          {loading && !data ? <Spinner /> : null}
          {data && !filtered.length ? <EmptyState title={data.length ? "No files match" : "No uploaded files yet"}>{data.length ? "Try another search." : "Drop images or videos above to upload them."}</EmptyState> : null}
          {view === "grid" ? (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
              {filtered.slice(0, limit).map((m) => (
                <li key={m.id}>
                  <button type="button" onClick={() => setSelected(m)} className="group block w-full overflow-hidden rounded-xl bg-white text-start ring-1 ring-plum-700/10 hover:ring-crimson/50">
                    <span className="grid aspect-[4/3] place-items-center overflow-hidden bg-plum-50">
                      {m.kind === "image" ? (
                        // eslint-disable-next-line @next/next/no-img-element -- dashboard thumbnail
                        <img src={m.url} alt="" loading="lazy" className="size-full object-cover" />
                      ) : (
                        <Film className="size-8 text-plum-500" aria-hidden="true" />
                      )}
                    </span>
                    <span className="block truncate px-2.5 pt-2 text-xs font-semibold">{m.originalName}</span>
                    <span className="block px-2.5 pb-2 text-xs text-ink-500">{formatBytes(m.size)}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <ul className="divide-y divide-plum-700/8">
              {filtered.slice(0, limit).map((m) => (
                <li key={m.id}>
                  <button type="button" onClick={() => setSelected(m)} className="flex w-full items-center gap-3 py-2.5 text-start hover:bg-plum-50/60">
                    <span className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-lg bg-plum-50">
                      {m.kind === "image" ? (
                        // eslint-disable-next-line @next/next/no-img-element -- dashboard thumbnail
                        <img src={m.url} alt="" loading="lazy" className="size-full object-cover" />
                      ) : (
                        <Film className="size-5 text-plum-500" aria-hidden="true" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{m.originalName}</span>
                      <span className="block text-xs text-ink-500">
                        {m.mime} · {formatBytes(m.size)}
                        {m.width ? ` · ${m.width}×${m.height}` : ""} · {timeAgo(m.createdAt)}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {filtered.length > limit ? (
            <Btn className="mt-4" onClick={() => setLimit((l) => l + PAGE)}>
              Show more ({filtered.length - limit} remaining)
            </Btn>
          ) : null}
        </Card>
      ) : null}

      <Card>
        <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold text-plum-800">Bundled with the website</h2>
        <p className="mt-1 mb-4 text-sm text-ink-700">Optimised photos and brand files built into the site. They can be used anywhere and can&apos;t be deleted here; to replace one on a page, choose a different image in that field.</p>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {bundledMedia.map((b) => {
            const where = bundledUsage.data?.(b.ref) ?? [];
            return (
              <li key={b.ref} className="flex gap-3 rounded-xl bg-white p-2.5 ring-1 ring-plum-700/10">
                {/* eslint-disable-next-line @next/next/no-img-element -- dashboard thumbnail */}
                <img src={b.src} alt="" loading="lazy" className="size-16 shrink-0 rounded-lg object-cover" />
                <div className="min-w-0 text-sm">
                  <p className="truncate font-semibold" dir="ltr">
                    {b.name}
                  </p>
                  <p className="text-xs text-ink-500">
                    {b.width} × {b.height}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-ink-700">{bundledUsage.loading ? "Checking…" : where.length ? `Used in: ${where.join(", ")}` : "Not used"}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </Card>

      {selected ? (
        <MediaDetails
          item={selected}
          onClose={() => setSelected(null)}
          onChanged={(m) => {
            setData((list) => (m ? (list ?? []).map((x) => (x.id === m.id ? m : x)) : (list ?? []).filter((x) => x.id !== selected.id)));
            setSelected(m);
          }}
        />
      ) : null}
    </>
  );
}
