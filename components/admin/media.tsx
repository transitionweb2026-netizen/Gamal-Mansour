"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Film, Search, UploadCloud } from "lucide-react";
import { useCms } from "@/components/admin/CmsProvider";
import { Btn, EmptyState, Modal, Notice, formatBytes } from "@/components/admin/ui";
import type { FieldEnv } from "@/components/admin/FieldEditor";
import type { Option } from "@/lib/cms/admin/fields";
import type { MediaItem } from "@/lib/cms/admin/types";
import { allowedImageTypes, allowedVideoTypes, cmsConfig } from "@/lib/cms/admin/config";
import { photos } from "@/lib/photos";
import { resolveMedia as resolveRef, staticAssets, type CmsMediaRecord } from "@/lib/cms/media";
import type { Issue } from "@/lib/cms/admin/validate";

/** Photos and files bundled with the website (always available, not deletable). */
export const bundledMedia = [
  ...Object.keys(photos).map((name) => ({ ref: `local:${name}`, name, kind: "image" as const, src: `/images/${name}-640.webp`, width: photos[name as keyof typeof photos].width, height: photos[name as keyof typeof photos].height })),
  ...Object.entries(staticAssets).map(([path, a]) => ({ ref: `static:${path}`, name: a.label, kind: "image" as const, src: path, width: a.width, height: a.height })),
];

/* ------------------------------------------------------------ uploads */

export type UploadJob = { id: string; name: string; progress: number; status: "uploading" | "done" | "error"; error?: string };

/** Uploads files one by one with per-file progress and honest per-file results. */
export function useUploader(onUploaded: (m: MediaItem) => void) {
  const { adapter, toast, bump } = useCms();
  const [jobs, setJobs] = useState<UploadJob[]>([]);
  const upload = useCallback(
    async (files: FileList | File[]) => {
      for (const file of Array.from(files)) {
        const id = `${file.name}-${Date.now()}-${Math.random()}`;
        setJobs((j) => [{ id, name: file.name, progress: 0, status: "uploading" }, ...j]);
        try {
          const m = await adapter.uploadMedia(file, (p) => setJobs((j) => j.map((x) => (x.id === id ? { ...x, progress: p } : x))));
          setJobs((j) => j.map((x) => (x.id === id ? { ...x, progress: 1, status: "done" } : x)));
          onUploaded(m);
          toast("success", `Uploaded ${file.name} to Supabase Storage.`);
        } catch (e) {
          const message = (e as Error).message;
          setJobs((j) => j.map((x) => (x.id === id ? { ...x, status: "error", error: message } : x)));
          toast("error", message);
        }
      }
      bump();
    },
    [adapter, toast, bump, onUploaded],
  );
  return { jobs, upload, clear: () => setJobs((j) => j.filter((x) => x.status === "uploading")) };
}

export function UploadZone({ onFiles, accept, disabled, multiple = true }: { onFiles: (files: FileList) => void; accept: string; disabled?: boolean; multiple?: boolean }) {
  const input = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        if (!disabled && e.dataTransfer.files.length) onFiles(e.dataTransfer.files);
      }}
      className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-8 text-center transition-colors ${
        over ? "border-crimson bg-crimson-50" : "border-plum-700/20 bg-white/60"
      } ${disabled ? "opacity-60" : ""}`}
    >
      <UploadCloud className="size-8 text-crimson" aria-hidden="true" />
      <p className="mt-2 font-semibold text-plum-800">Drop files here or</p>
      <Btn className="mt-2" variant="plum" size="sm" disabled={disabled} onClick={() => input.current?.click()}>
        Choose files
      </Btn>
      <p className="mt-3 text-xs text-ink-500">
        Images: JPEG, PNG, WebP, AVIF, GIF — up to {cmsConfig.maxImageMB} MB. Videos: MP4, WebM — up to {cmsConfig.maxVideoMB} MB (large files resume if interrupted).
      </p>
      <input ref={input} type="file" accept={accept} multiple={multiple} className="sr-only" tabIndex={-1} onChange={(e) => e.target.files?.length && onFiles(e.target.files)} />
    </div>
  );
}

export function UploadJobs({ jobs }: { jobs: UploadJob[] }) {
  if (!jobs.length) return null;
  return (
    <ul className="space-y-2" aria-label="Uploads">
      {jobs.map((j) => (
        <li key={j.id} className="rounded-xl bg-white p-3 text-sm ring-1 ring-plum-700/10">
          <div className="flex items-center justify-between gap-3">
            <span className="truncate font-medium">{j.name}</span>
            <span className={j.status === "error" ? "text-crimson-700" : j.status === "done" ? "text-emerald-700" : "text-ink-500"}>
              {j.status === "uploading" ? `${Math.round(j.progress * 100)}%` : j.status === "done" ? "Uploaded" : "Failed"}
            </span>
          </div>
          {j.status === "uploading" ? (
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-plum-100" role="progressbar" aria-valuenow={Math.round(j.progress * 100)} aria-valuemin={0} aria-valuemax={100} aria-label={`Uploading ${j.name}`}>
              <div className="h-full rounded-full bg-[linear-gradient(90deg,var(--color-crimson),var(--color-plum))] transition-[width]" style={{ width: `${j.progress * 100}%` }} />
            </div>
          ) : null}
          {j.error ? <p className="mt-1 text-xs text-crimson-700">{j.error}</p> : null}
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------ picker */

function MediaPicker({ kind, current, media, onPick, onClose, onUploaded }: { kind: "image" | "video"; current: string; media: MediaItem[]; onPick: (ref: string) => void; onClose: () => void; onUploaded: (m: MediaItem) => void }) {
  const { adapter } = useCms();
  const canUpload = adapter.canUpload();
  const [tab, setTab] = useState<"uploaded" | "bundled">(canUpload ? "uploaded" : "bundled");
  const [q, setQ] = useState("");
  const { jobs, upload } = useUploader(onUploaded);
  const uploaded = media.filter((m) => m.kind === kind && (!q || m.originalName.toLowerCase().includes(q.toLowerCase())));
  const bundled = bundledMedia.filter((m) => m.kind === kind && (!q || m.name.toLowerCase().includes(q.toLowerCase())));

  return (
    <Modal open onClose={onClose} title={kind === "image" ? "Choose an image" : "Choose a video"} size="xl">
      <div className="flex flex-wrap items-center gap-3">
        <div role="tablist" aria-label="Media source" className="inline-flex rounded-xl bg-plum-50 p-1">
          {(["uploaded", "bundled"] as const).map((t) => (
            <button key={t} role="tab" type="button" aria-selected={tab === t} onClick={() => setTab(t)} className={`rounded-lg px-3.5 py-1.5 text-sm font-semibold ${tab === t ? "bg-white text-plum-800 shadow-sm" : "text-plum-600"}`}>
              {t === "uploaded" ? "Uploaded files" : "Bundled with the site"}
            </button>
          ))}
        </div>
        <label className="relative ms-auto">
          <span className="sr-only">Search files</span>
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-ink-500" aria-hidden="true" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="rounded-xl bg-white py-2 ps-9 pe-3 text-sm ring-1 ring-plum-700/15 focus:ring-2 focus:ring-crimson focus:outline-none" />
        </label>
      </div>

      {tab === "uploaded" ? (
        <div className="mt-4 space-y-4">
          {canUpload ? (
            <>
              <UploadZone onFiles={upload} accept={(kind === "image" ? allowedImageTypes : allowedVideoTypes).join(",")} />
              <UploadJobs jobs={jobs} />
            </>
          ) : (
            <Notice tone="info">Uploading needs the dashboard to be connected to Supabase. You can choose from the photos bundled with the site.</Notice>
          )}
          {uploaded.length ? (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {uploaded.map((m) => (
                <li key={m.id}>
                  <button type="button" onClick={() => onPick(`cms:${m.id}`)} aria-pressed={current === `cms:${m.id}`} className={`group block w-full overflow-hidden rounded-xl bg-white text-start ring-2 ${current === `cms:${m.id}` ? "ring-crimson" : "ring-transparent hover:ring-plum-300"}`}>
                    <span className="grid aspect-[4/3] place-items-center overflow-hidden bg-plum-50">
                      {m.kind === "image" ? (
                        // eslint-disable-next-line @next/next/no-img-element -- dashboard thumbnail
                        <img src={m.url} alt="" loading="lazy" className="size-full object-cover" />
                      ) : (
                        <Film className="size-8 text-plum-500" aria-hidden="true" />
                      )}
                    </span>
                    <span className="block truncate px-2.5 py-2 text-xs font-medium">{m.originalName}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : canUpload ? (
            <EmptyState title={`No uploaded ${kind}s yet`}>Upload one above, or choose from the files bundled with the site.</EmptyState>
          ) : null}
        </div>
      ) : (
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {bundled.map((m) => (
            <li key={m.ref}>
              <button type="button" onClick={() => onPick(m.ref)} aria-pressed={current === m.ref} className={`block w-full overflow-hidden rounded-xl bg-white text-start ring-2 ${current === m.ref ? "ring-crimson" : "ring-transparent hover:ring-plum-300"}`}>
                <span className="block aspect-[4/3] overflow-hidden bg-plum-50">
                  {/* eslint-disable-next-line @next/next/no-img-element -- dashboard thumbnail */}
                  <img src={m.src} alt="" loading="lazy" className="size-full object-cover" />
                </span>
                <span className="block truncate px-2.5 py-2 text-xs font-medium" dir="ltr">
                  {m.name}
                </span>
              </button>
            </li>
          ))}
          {!bundled.length ? <li className="text-sm text-ink-500">No bundled {kind}s.</li> : null}
        </ul>
      )}
    </Modal>
  );
}

/* ------------------------------------------------------------ field environment */

/**
 * Everything form fields need: option lists (services, articles, FAQ groups), media resolution
 * and the media picker. Returns the environment plus the picker element to render.
 */
export function useFieldEnv(issues: Issue[], extraOptions?: Partial<FieldEnv["options"]>) {
  const { adapter, revision } = useCms();
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [mediaLoaded, setMediaLoaded] = useState(false);
  const [options, setOptions] = useState<FieldEnv["options"]>({ services: [], articles: [], faqCategories: [] });
  const [picker, setPicker] = useState<{ kind: "image" | "video"; current: string; resolve: (ref: string | null) => void } | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const [m, services, articles, faqSections] = await Promise.all([
        adapter.listMedia().catch(() => [] as MediaItem[]),
        adapter.listItems("services").catch(() => []),
        adapter.listItems("articles").catch(() => []),
        adapter.listSections("patients").catch(() => []),
      ]);
      if (!alive) return;
      const title = (d: Record<string, unknown>, fallback: string) => {
        const t = d.title as { en?: string; ar?: string } | undefined;
        return t?.en || t?.ar || fallback;
      };
      const faq = faqSections.find((s) => s.key === "faq");
      const cats = ((faq?.draft.categories as Array<{ id: string; title: { en: string; ar: string } }>) ?? []).map((c): Option => ({ value: c.id, label: c.title?.en || c.id }));
      setMedia(m);
      setMediaLoaded(true);
      setOptions({
        services: services.filter((s) => s.slug).map((s) => ({ value: s.slug!, label: title(s.draft, s.slug!) })),
        articles: articles.filter((a) => a.slug).map((a) => ({ value: a.slug!, label: title(a.draft, a.slug!) })),
        faqCategories: cats,
      });
    })();
    return () => {
      alive = false;
    };
  }, [adapter, revision]);

  const table = useMemo<Record<string, CmsMediaRecord>>(() => Object.fromEntries(media.map((m) => [m.id, m])), [media]);

  const env: FieldEnv = {
    options: { ...options, ...extraOptions },
    issues,
    resolveMedia: (ref) => {
      const r = resolveRef(ref, table);
      if (!r) return null;
      const name = ref.startsWith("cms:") ? table[ref.slice(4)]?.originalName : bundledMedia.find((b) => b.ref === ref)?.name;
      return { ...r, src: ref.startsWith("local:") ? `/images/${ref.slice(6)}-640.webp` : r.src, name };
    },
    pickMedia: (kind, current) => new Promise((resolve) => setPicker({ kind, current, resolve })),
  };

  const pickerElement = picker ? (
    <MediaPicker
      kind={picker.kind}
      current={picker.current}
      media={media}
      onUploaded={(m) => setMedia((list) => [m, ...list])}
      onPick={(ref) => {
        picker.resolve(ref);
        setPicker(null);
      }}
      onClose={() => {
        picker.resolve(null);
        setPicker(null);
      }}
    />
  ) : null;

  // Until the media list has loaded, uploaded references can't be checked — don't report them missing.
  const mediaExists = (ref: string) => !ref || Boolean(resolveRef(ref, table)) || (ref.startsWith("cms:") && !mediaLoaded);
  return { env, pickerElement, media, mediaExists };
}

export { formatBytes };
