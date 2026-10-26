"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Eye, Monitor, Smartphone, Tablet, X } from "lucide-react";
import { Btn } from "@/components/admin/ui";

export type PreviewPatch =
  | { kind: "section"; id: string; draft: Record<string, unknown> }
  | { kind: "seo"; pageId: string; draft: Record<string, unknown> }
  | { kind: "item"; collection: string; id: string; draft: Record<string, unknown> }
  | { kind: "settings"; draft: Record<string, unknown> };

export const PREVIEW_MESSAGE = "hh-cms-preview";

const widths = { desktop: "100%", tablet: "834px", mobile: "390px" } as const;

/**
 * Draft preview in an isolated iframe (/admin/preview/). The editor streams unsaved edits to it
 * with postMessage (same origin only), so the preview reflects the form before saving.
 */
export function usePreview(path: string) {
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState<"ar" | "en">("ar");
  const [device, setDevice] = useState<keyof typeof widths>("desktop");
  const frame = useRef<HTMLIFrameElement>(null);
  const pending = useRef<PreviewPatch | null>(null);

  const post = useCallback((patch: PreviewPatch) => {
    pending.current = patch;
    frame.current?.contentWindow?.postMessage({ type: PREVIEW_MESSAGE, patch }, window.location.origin);
  }, []);

  useEffect(() => {
    const onReady = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || e.data?.type !== `${PREVIEW_MESSAGE}-ready`) return;
      if (pending.current) frame.current?.contentWindow?.postMessage({ type: PREVIEW_MESSAGE, patch: pending.current }, window.location.origin);
    };
    window.addEventListener("message", onReady);
    return () => window.removeEventListener("message", onReady);
  }, []);

  const src = `/admin/preview/?${path}${path ? "&" : ""}lang=${lang}`;

  const button = (
    <Btn variant="outline" onClick={() => setOpen(true)}>
      <Eye className="size-4" aria-hidden="true" /> Preview draft
    </Btn>
  );

  const panel = open ? (
    <div role="dialog" aria-modal="true" aria-label="Draft preview" className="fixed inset-0 z-50 flex flex-col bg-plum-950/70 backdrop-blur-sm">
      <div className="flex flex-wrap items-center gap-2 bg-plum-900 px-4 py-2.5 text-white">
        <span className="me-2 rounded-full bg-amber-400 px-2.5 py-0.5 text-xs font-bold text-plum-950">DRAFT PREVIEW</span>
        <div className="inline-flex rounded-lg bg-white/10 p-0.5" role="group" aria-label="Language">
          {(["ar", "en"] as const).map((l) => (
            <button key={l} type="button" aria-pressed={lang === l} onClick={() => setLang(l)} className={`rounded-md px-3 py-1 text-sm font-semibold ${lang === l ? "bg-white text-plum-900" : "text-white/80"}`}>
              {l === "ar" ? "العربية" : "English"}
            </button>
          ))}
        </div>
        <div className="inline-flex rounded-lg bg-white/10 p-0.5" role="group" aria-label="Device width">
          {(
            [
              ["desktop", Monitor],
              ["tablet", Tablet],
              ["mobile", Smartphone],
            ] as const
          ).map(([d, Icon]) => (
            <button key={d} type="button" aria-pressed={device === d} aria-label={d} onClick={() => setDevice(d)} className={`grid size-8 place-items-center rounded-md ${device === d ? "bg-white text-plum-900" : "text-white/80"}`}>
              <Icon className="size-4" aria-hidden="true" />
            </button>
          ))}
        </div>
        <span className="hidden text-xs text-white/70 md:inline">Shows saved drafts plus unsaved edits from this form. Not visible to visitors.</span>
        <button type="button" onClick={() => setOpen(false)} aria-label="Close preview" className="ms-auto grid size-9 place-items-center rounded-lg hover:bg-white/10">
          <X className="size-5" aria-hidden="true" />
        </button>
      </div>
      <div className="flex min-h-0 flex-1 justify-center overflow-auto p-3">
        <iframe ref={frame} key={src} src={src} title="Draft preview" className="h-full rounded-xl bg-white shadow-2xl" style={{ width: widths[device], maxWidth: "100%" }} />
      </div>
    </div>
  ) : null;

  return { button, panel, post };
}
