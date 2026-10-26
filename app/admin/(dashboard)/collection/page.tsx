"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowDown, ArrowUp, Eye, EyeOff, PenSquare, Plus, Trash2 } from "lucide-react";
import { useCms } from "@/components/admin/CmsProvider";
import { useLoad } from "@/components/admin/useLoad";
import { Btn, BtnLink, Card, EmptyState, Modal, Notice, PageHeader, Spinner, StatusPill, Tag, timeAgo } from "@/components/admin/ui";
import { collectionRegistry, type CollectionKey } from "@/lib/cms/registry";
import { docStatus } from "@/lib/cms/admin/snapshot";
import { newItem } from "@/lib/cms/conform";
import { validateSlug } from "@/lib/cms/admin/validate";
import type { ItemRecord, Json } from "@/lib/cms/admin/types";
import { itemTitle } from "@/lib/cms/admin/items";

function CollectionList() {
  const type = (useSearchParams()?.get("type") ?? "services") as CollectionKey;
  const def = collectionRegistry[type] ?? collectionRegistry.services;
  const router = useRouter();
  const { adapter, toast, confirm, bump } = useCms();
  const { data, error, loading } = useLoad(() => adapter.listItems(def.key), [adapter, def.key]);
  const [creating, setCreating] = useState(false);
  const [slug, setSlug] = useState("");
  const [busy, setBusy] = useState(false);
  const items = data ?? [];

  const create = async () => {
    const problem = def.slugged ? validateSlug(slug, items.map((i) => i.slug ?? "")) : null;
    if (problem) return toast("error", problem);
    setBusy(true);
    try {
      const draft = newItem(def.template) as Json;
      if (def.key === "articles") (draft as Record<string, unknown>).published = new Date().toISOString().slice(0, 10);
      const rec = await adapter.createItem(def.key, { slug: def.slugged ? slug : null, draft, position: items.length });
      bump();
      router.push(`/admin/collection/edit/?type=${def.key}&id=${rec.id}`);
    } catch (e) {
      toast("error", `Not created: ${(e as Error).message}`);
    } finally {
      setBusy(false);
    }
  };

  const move = async (i: number, d: number) => {
    const next = [...items];
    const [x] = next.splice(i, 1);
    next.splice(i + d, 0, x);
    try {
      await adapter.reorderItems(def.key, next.map((n) => n.id));
      toast("success", "Order saved. It applies on the website after the next build.");
      bump();
    } catch (e) {
      toast("error", (e as Error).message);
    }
  };

  const toggle = async (item: ItemRecord) => {
    try {
      await adapter.saveItem(def.key, item.id, { visible: !item.visible }, item.version);
      toast("success", item.visible ? "Hidden from the website (after the next build)." : "Shown on the website (after the next build).");
      bump();
    } catch (e) {
      toast("error", (e as Error).message);
    }
  };

  const remove = async (item: ItemRecord) => {
    const t = itemTitle(item);
    const ok = await confirm({
      title: `Delete this ${def.singular.toLowerCase()}?`,
      body: <>“{t.en || t.ar || item.slug || "Untitled"}” will be deleted permanently. A copy remains in Revision history.</>,
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) return;
    try {
      await adapter.deleteItem(def.key, item.id);
      toast("success", "Deleted.");
      bump();
    } catch (e) {
      toast("error", `Not deleted: ${(e as Error).message}`);
    }
  };

  return (
    <>
      <PageHeader
        title={def.label}
        description={def.description}
        crumbs={[{ label: "Dashboard", href: "/admin/" }, { label: def.label }]}
        actions={
          <Btn variant="primary" onClick={() => (def.slugged ? setCreating(true) : create())} loading={busy && !creating}>
            <Plus className="size-4" aria-hidden="true" /> New {def.singular.toLowerCase()}
          </Btn>
        }
      />
      <p className="-mt-3 mb-5 text-sm text-ink-500">Shown on: {def.appearsIn.join(" · ")}</p>
      {def.key === "reviews" ? (
        <Notice tone="warning" className="mb-5" title="Genuine reviews only">
          Publish only real patient words, with the patient&apos;s written consent, without editing their meaning. Never create sample or invented reviews — the database refuses to publish a review without confirmed consent.
        </Notice>
      ) : null}
      {error ? <Notice tone="error">{error}</Notice> : null}
      {loading && !data ? <Spinner /> : null}
      {data && !items.length ? (
        <EmptyState title={`No ${def.label.toLowerCase()} yet`} action={<Btn variant="plum" onClick={() => (def.slugged ? setCreating(true) : create())}>Add the first one</Btn>}>
          {def.key === "videos" ? "Until a video is published, the Videos page shows the “in preparation” feature and planned topics." : def.key === "reviews" ? "Until a consented review is published, the site shows an honest “coming soon” message." : null}
        </EmptyState>
      ) : null}
      {items.length ? (
        <Card className="p-0 sm:p-0">
          <ul>
            {items.map((item, i) => {
              const t = itemTitle(item);
              const st = docStatus(item);
              return (
                <li key={item.id} className="flex flex-wrap items-center gap-3 border-b border-plum-700/6 px-4 py-3 last:border-0 sm:flex-nowrap sm:px-5">
                  <span className="w-6 text-xs font-bold text-plum-400 tabular-nums">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <Link href={`/admin/collection/edit/?type=${def.key}&id=${item.id}`} className="block truncate font-semibold text-plum-800 hover:text-crimson-600">
                      {t.en || t.ar || "Untitled"}
                    </Link>
                    <p className="truncate text-sm text-ink-500" dir="rtl" lang="ar">
                      {t.ar}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                      <StatusPill status={st} />
                      {!item.visible ? <Tag tone="slate">Hidden</Tag> : null}
                      {item.slug && def.slugged ? <Tag>{item.slug}</Tag> : null}
                      {def.key === "faqs" ? <Tag>{String((item.draft as Record<string, unknown>).category ?? "")}</Tag> : null}
                      {def.key === "reviews" && !(item.draft as Record<string, unknown>).consent ? <Tag tone="crimson">No consent recorded</Tag> : null}
                      <span className="text-xs text-ink-500">Updated {timeAgo(item.updatedAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up" className="grid size-8 place-items-center rounded-lg text-plum-600 hover:bg-plum-50 disabled:opacity-30">
                      <ArrowUp className="size-4" aria-hidden="true" />
                    </button>
                    <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label="Move down" className="grid size-8 place-items-center rounded-lg text-plum-600 hover:bg-plum-50 disabled:opacity-30">
                      <ArrowDown className="size-4" aria-hidden="true" />
                    </button>
                    <button type="button" onClick={() => toggle(item)} aria-label={item.visible ? "Hide from website" : "Show on website"} title={item.visible ? "Hide" : "Show"} className="grid size-8 place-items-center rounded-lg text-plum-600 hover:bg-plum-50">
                      {item.visible ? <Eye className="size-4" aria-hidden="true" /> : <EyeOff className="size-4" aria-hidden="true" />}
                    </button>
                    <BtnLink size="sm" variant="plum" href={`/admin/collection/edit/?type=${def.key}&id=${item.id}`}>
                      <PenSquare className="size-3.5" aria-hidden="true" /> Edit
                    </BtnLink>
                    <button type="button" onClick={() => remove(item)} aria-label="Delete" className="grid size-8 place-items-center rounded-lg text-crimson-700 hover:bg-crimson-50">
                      <Trash2 className="size-4" aria-hidden="true" />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      ) : null}

      <Modal
        open={creating}
        onClose={() => setCreating(false)}
        title={`New ${def.singular.toLowerCase()}`}
        footer={
          <>
            <Btn onClick={() => setCreating(false)}>Cancel</Btn>
            <Btn variant="primary" onClick={create} loading={busy}>
              Create draft
            </Btn>
          </>
        }
      >
        <label htmlFor="new-slug" className="mb-1.5 block text-sm font-semibold text-plum-800">
          {def.slugLabel}
        </label>
        <input
          id="new-slug"
          dir="ltr"
          value={slug}
          onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
          placeholder="e.g. heart-valve-repair"
          className="block w-full rounded-xl bg-white px-3.5 py-2.5 ring-1 ring-inset ring-plum-700/15 focus:ring-2 focus:ring-crimson focus:outline-none"
        />
        <p className="mt-2 text-xs text-ink-500">Lowercase letters, numbers and dashes. It is created as an unpublished draft.</p>
      </Modal>
    </>
  );
}

export default function CollectionPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <CollectionList />
    </Suspense>
  );
}
