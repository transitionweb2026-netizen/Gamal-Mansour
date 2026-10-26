"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Trash2 } from "lucide-react";
import { useCms } from "@/components/admin/CmsProvider";
import { DocEditor } from "@/components/admin/DocEditor";
import { usePreview } from "@/components/admin/Preview";
import { useLoad } from "@/components/admin/useLoad";
import { Btn, Card, Notice, PageHeader, Spinner } from "@/components/admin/ui";
import { itemTitle } from "@/lib/cms/admin/items";
import { collectionRegistry, type CollectionKey } from "@/lib/cms/registry";
import { collectionFields } from "@/lib/cms/admin/fields";
import { docStatus } from "@/lib/cms/admin/snapshot";
import { publishBlockers, validateItem, validateSlug, type Issue } from "@/lib/cms/admin/validate";
import type { Json } from "@/lib/cms/admin/types";

const previewPage: Record<CollectionKey, string> = { services: "services", articles: "article", videos: "videos", reviews: "patients", faqs: "patients" };

function ItemEditor() {
  const params = useSearchParams();
  const type = (params?.get("type") ?? "services") as CollectionKey;
  const id = params?.get("id") ?? "";
  const def = collectionRegistry[type] ?? collectionRegistry.services;
  const router = useRouter();
  const { adapter, toast, confirm, bump } = useCms();
  const { data, error, loading } = useLoad(() => adapter.listItems(def.key), [adapter, def.key]);
  const item = data?.find((i) => i.id === id) ?? null;
  const [slug, setSlug] = useState<string | null>(null);
  const currentSlug = slug ?? item?.slug ?? "";
  const takenSlugs = (data ?? []).filter((i) => i.id !== id).map((i) => i.slug ?? "");
  const fields = collectionFields(def.key, def.template);
  const preview = usePreview(`page=${previewPage[def.key]}${def.key === "articles" && item?.slug ? `&slug=${item.slug}` : ""}`);

  const extraIssues = (draft: Json): Issue[] => {
    const issues = validateItem(def.key, draft);
    if (def.slugged) {
      const problem = validateSlug(currentSlug, takenSlugs);
      if (problem) issues.push({ path: "slug", label: def.slugLabel, message: problem, severity: "error" });
    }
    return issues;
  };

  if (error) return <Notice tone="error">{error}</Notice>;
  if (loading && !data) return <Spinner />;
  if (!item) {
    return (
      <Notice tone="warning" title="Not found">
        This {def.singular.toLowerCase()} no longer exists. It may have been deleted.
      </Notice>
    );
  }

  const t = itemTitle(item);
  const slugChanged = def.slugged && currentSlug !== (item.slug ?? "");

  return (
    <>
      <PageHeader
        title={t.en || t.ar || `Untitled ${def.singular.toLowerCase()}`}
        crumbs={[{ label: "Dashboard", href: "/admin/" }, { label: def.label, href: `/admin/collection/?type=${def.key}` }, { label: "Edit" }]}
        actions={
          <>
            {preview.button}
            <Btn
              variant="danger"
              onClick={async () => {
                const ok = await confirm({ title: `Delete this ${def.singular.toLowerCase()}?`, body: "It will be deleted permanently. A copy remains in Revision history.", confirmLabel: "Delete", danger: true });
                if (!ok) return;
                try {
                  await adapter.deleteItem(def.key, item.id);
                  toast("success", "Deleted.");
                  bump();
                  router.push(`/admin/collection/?type=${def.key}`);
                } catch (e) {
                  toast("error", `Not deleted: ${(e as Error).message}`);
                }
              }}
            >
              <Trash2 className="size-4" aria-hidden="true" /> Delete
            </Btn>
          </>
        }
      />
      {def.key === "reviews" ? (
        <Notice tone="warning" className="mb-5" title="Consent is required">
          Only publish the patient&apos;s own words, with their written consent. The website and the database both refuse to publish a review without the consent box ticked.
        </Notice>
      ) : null}
      {def.key === "articles" ? (
        <Notice tone="info" className="mb-5">
          Each published article gets its own page in Arabic and English (<span dir="ltr">/ar/articles/{currentSlug || "slug"}/</span>) on the next site build.
        </Notice>
      ) : null}
      <Card>
        <DocEditor
          key={item.id}
          dirtyKey={`item-${item.id}`}
          fields={fields}
          record={item}
          status={docStatus(item)}
          extraDirty={slugChanged}
          extraIssues={extraIssues}
          publishBlockers={(draft) => publishBlockers(def.key, draft)}
          onSave={async (draft, version) => {
            await adapter.saveItem(def.key, item.id, { draft, ...(def.slugged ? { slug: currentSlug } : {}) }, version);
            setSlug(null);
            bump();
          }}
          onPublish={async () => {
            await adapter.publish(`cms_${def.key}`, item.id);
            bump();
          }}
          onUnpublish={async () => {
            await adapter.unpublish(`cms_${def.key}`, item.id);
            bump();
          }}
          onDiscard={async () => {
            await adapter.discardDraft(`cms_${def.key}`, item.id);
            bump();
          }}
          onDraftChange={(draft) => preview.post({ kind: "item", collection: def.key, id: item.id, draft })}
        >
          {def.slugged ? (
            <div className="rounded-xl bg-plum-50/60 p-4 ring-1 ring-plum-700/10">
              <label htmlFor="slug" className="text-sm font-semibold text-plum-800">
                {def.slugLabel}
              </label>
              <input
                id="slug"
                dir="ltr"
                value={currentSlug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                className="mt-1.5 block w-full rounded-xl bg-white px-3.5 py-2.5 ring-1 ring-inset ring-plum-700/15 focus:ring-2 focus:ring-crimson focus:outline-none"
              />
              {item.published && slugChanged ? <p className="mt-1.5 text-xs font-medium text-amber-700">Changing the slug changes the public address; links to the old address will stop working.</p> : null}
            </div>
          ) : null}
        </DocEditor>
      </Card>
      {preview.panel}
    </>
  );
}

export default function CollectionItemPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <ItemEditor />
    </Suspense>
  );
}
