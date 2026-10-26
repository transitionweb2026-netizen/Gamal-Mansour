"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { RotateCcw, Save, Send, Undo2 } from "lucide-react";
import { useCms } from "@/components/admin/CmsProvider";
import { FieldEditor, FieldEnvProvider } from "@/components/admin/FieldEditor";
import { useFieldEnv } from "@/components/admin/media";
import { Btn, Notice, StatusPill, timeAgo } from "@/components/admin/ui";
import { clone, sameJson } from "@/lib/cms/core";
import type { Field } from "@/lib/cms/admin/fields";
import type { Json, Status } from "@/lib/cms/admin/types";
import { validateDoc, type Issue } from "@/lib/cms/admin/validate";

export type DocRecord = { draft: Json; published: Json | null; version: number; updatedAt: string; publishedAt: string | null };

type Props = {
  dirtyKey: string;
  fields: Field[];
  record: DocRecord;
  status: Status;
  /** Persist the draft; must throw on failure. */
  onSave: (draft: Json, version: number) => Promise<void>;
  onPublish?: () => Promise<void>;
  onDiscard?: () => Promise<void>;
  onUnpublish?: () => Promise<void>;
  extraIssues?: (draft: Json) => Issue[];
  publishBlockers?: (draft: Json) => string[];
  /** Called on every edit (live preview). */
  onDraftChange?: (draft: Json) => void;
  /** Extra controls rendered above the fields (e.g. slug, visibility). */
  children?: React.ReactNode;
  /** Extra unsaved state from `children` (e.g. a changed slug). */
  extraDirty?: boolean;
  publishLabel?: string;
};

/** Shared edit → save draft → publish workflow with validation and honest feedback. */
export function DocEditor({ dirtyKey, fields, record, status, onSave, onPublish, onDiscard, onUnpublish, extraIssues, publishBlockers, onDraftChange, children, extraDirty = false, publishLabel = "Publish" }: Props) {
  const { adapter, toast, confirm, setDirty } = useCms();
  const [draft, setDraft] = useState<Json>(() => clone(record.draft));
  const [busy, setBusy] = useState<null | "save" | "publish" | "discard" | "unpublish">(null);
  const [showIssues, setShowIssues] = useState(false);
  const baseline = useRef(record);

  // Adopt the stored draft when a different record (or a newer version) arrives and nothing is pending.
  useEffect(() => {
    if (baseline.current !== record) {
      const pending = !sameJson(draft, baseline.current.draft);
      baseline.current = record;
      if (!pending) {
        setDraft(clone(record.draft));
      }
    }
  }, [record, draft]);

  const dirty = !sameJson(draft, record.draft) || extraDirty;
  useEffect(() => {
    setDirty(dirtyKey, dirty);
    return () => setDirty(dirtyKey, false);
  }, [dirty, dirtyKey, setDirty]);

  const { env, pickerElement, mediaExists } = useFieldEnv([]);
  const issues = useMemo(() => [...validateDoc(fields, draft, { mediaExists }), ...(extraIssues?.(draft) ?? [])], [fields, draft, mediaExists, extraIssues]);
  const errors = issues.filter((i) => i.severity === "error");
  const warnings = issues.filter((i) => i.severity === "warning");
  const where = adapter.mode === "supabase" ? "to Supabase" : "in this browser only (local sandbox)";

  const change = (next: Json) => {
    setDraft(next);
    onDraftChange?.(next);
  };

  const save = async (): Promise<boolean> => {
    setShowIssues(true);
    if (errors.length) {
      toast("error", `Not saved: fix ${errors.length} problem${errors.length > 1 ? "s" : ""} first.`);
      return false;
    }
    setBusy("save");
    try {
      await onSave(draft, record.version);
      toast("success", `Draft saved ${where}. Not yet visible on the website.`);
      return true;
    } catch (e) {
      toast("error", `Not saved: ${(e as Error).message}`);
      return false;
    } finally {
      setBusy(null);
    }
  };

  const publish = async () => {
    if (!onPublish) return;
    const blockers = publishBlockers?.(draft) ?? [];
    if (blockers.length) {
      toast("error", blockers.join(" "));
      return;
    }
    if (dirty && !(await save())) return;
    setBusy("publish");
    try {
      await onPublish();
      toast("success", adapter.mode === "supabase" ? "Published. The live website updates on its next build." : "Published in the local sandbox. Export it from System to build it into the site.");
    } catch (e) {
      toast("error", `Not published: ${(e as Error).message}`);
    } finally {
      setBusy(null);
    }
  };

  const discard = async () => {
    if (!onDiscard) return;
    const ok = await confirm({ title: "Discard unpublished changes?", body: "The saved draft goes back to the currently published version. This cannot be undone (but stays in Revision history).", confirmLabel: "Discard changes", danger: true });
    if (!ok) return;
    setBusy("discard");
    try {
      await onDiscard();
      toast("success", "Unpublished changes discarded.");
    } catch (e) {
      toast("error", (e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const unpublish = async () => {
    if (!onUnpublish) return;
    const ok = await confirm({ title: "Remove from the website?", body: "It will disappear from the site on the next build. The content stays here as a draft.", confirmLabel: "Unpublish", danger: true });
    if (!ok) return;
    setBusy("unpublish");
    try {
      await onUnpublish();
      toast("success", "Unpublished. It will be removed on the next site build.");
    } catch (e) {
      toast("error", (e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <FieldEnvProvider value={{ ...env, issues: showIssues ? issues : issues.filter((i) => i.severity === "warning" || i.message.includes("Script")) }}>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-ink-500">
        <StatusPill status={dirty ? "changed" : status} />
        <span>Saved {timeAgo(record.updatedAt)}</span>
        <span>Published {record.publishedAt ? timeAgo(record.publishedAt) : "never"}</span>
        {dirty ? <span className="font-semibold text-amber-700">Unsaved edits</span> : null}
      </div>

      {showIssues && errors.length ? (
        <Notice tone="error" title={`${errors.length} problem${errors.length > 1 ? "s" : ""} to fix before saving`} className="mt-4">
          <ul className="list-disc ps-4">
            {errors.slice(0, 8).map((e, i) => (
              <li key={i}>
                {e.label}: {e.message}
              </li>
            ))}
          </ul>
        </Notice>
      ) : null}

      {children ? <div className="mt-5">{children}</div> : null}

      <div className="mt-5 space-y-6">
        {fields.map((f) => (
          <FieldEditor key={f.key} field={f} value={draft[f.key]} onChange={(v) => change({ ...draft, [f.key]: v })} />
        ))}
      </div>

      {warnings.length ? (
        <details className="mt-6 rounded-xl bg-amber-50/70 p-3 text-sm text-amber-900 ring-1 ring-amber-600/20">
          <summary className="font-semibold">{warnings.length} suggestion{warnings.length > 1 ? "s" : ""} (not blocking)</summary>
          <ul className="mt-2 list-disc space-y-0.5 ps-5">
            {warnings.slice(0, 20).map((w, i) => (
              <li key={i}>
                {w.label}: {w.message}
              </li>
            ))}
          </ul>
        </details>
      ) : null}

      <div className="sticky bottom-0 z-20 -mx-5 mt-8 flex flex-wrap items-center gap-2 border-t border-plum-700/10 bg-white/90 px-5 py-3 backdrop-blur-md sm:-mx-6 sm:px-6">
        <Btn variant="plum" onClick={save} loading={busy === "save"} disabled={!dirty || Boolean(busy)}>
          <Save className="size-4" aria-hidden="true" /> Save draft
        </Btn>
        {onPublish ? (
          <Btn variant="primary" onClick={publish} loading={busy === "publish"} disabled={Boolean(busy) || (!dirty && status === "published")}>
            <Send className="size-4" aria-hidden="true" /> {dirty ? `Save & ${publishLabel.toLowerCase()}` : publishLabel}
          </Btn>
        ) : null}
        {dirty ? (
          <Btn variant="ghost" onClick={() => change(clone(record.draft))} disabled={Boolean(busy)}>
            <Undo2 className="size-4" aria-hidden="true" /> Undo unsaved edits
          </Btn>
        ) : null}
        <span className="ms-auto" />
        {onDiscard && status === "changed" && !dirty ? (
          <Btn variant="ghost" onClick={discard} loading={busy === "discard"} disabled={Boolean(busy)}>
            <RotateCcw className="size-4" aria-hidden="true" /> Discard unpublished changes
          </Btn>
        ) : null}
        {onUnpublish && record.published ? (
          <Btn variant="danger" onClick={unpublish} loading={busy === "unpublish"} disabled={Boolean(busy)}>
            Unpublish
          </Btn>
        ) : null}
      </div>
      {pickerElement}
    </FieldEnvProvider>
  );
}
