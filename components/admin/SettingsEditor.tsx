"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useCms } from "@/components/admin/CmsProvider";
import { DocEditor } from "@/components/admin/DocEditor";
import { usePreview } from "@/components/admin/Preview";
import { useLoad } from "@/components/admin/useLoad";
import { Card, Notice, PageHeader, Spinner } from "@/components/admin/ui";
import { deriveFields } from "@/lib/cms/admin/fields";
import { docStatus } from "@/lib/cms/admin/snapshot";
import { settingsItemTemplates } from "@/lib/cms/registry";
import { settingsDefaults } from "@/content/site";

/** Edits a subset of the site settings document; the rest of the document is preserved. */
export function SettingsEditor({ title, description, keys, crumb, children }: { title: string; description: string; keys: string[]; crumb: string; children?: React.ReactNode }) {
  const { adapter, bump } = useCms();
  const { data, error, loading } = useLoad(() => adapter.getSettings(), [adapter]);
  const preview = usePreview("page=home");
  const fields = useMemo(() => {
    const templates = Object.fromEntries(Object.entries(settingsItemTemplates).map(([k, v]) => [`settings.${k}`, v]));
    return deriveFields(settingsDefaults, templates, "settings").filter((f) => keys.includes(f.key));
  }, [keys]);

  return (
    <>
      <PageHeader title={title} description={description} crumbs={[{ label: "Dashboard", href: "/admin/" }, { label: crumb }]} actions={preview.button} />
      {error ? <Notice tone="error">{error}</Notice> : null}
      {loading && !data ? <Spinner /> : null}
      {!loading && !data && !error ? (
        <Notice tone="warning">
          Settings are not in the CMS yet. Run <Link href="/admin/system/" className="font-semibold underline">System › Import website content</Link>.
        </Notice>
      ) : null}
      {children}
      {data ? (
        <Card>
          <DocEditor
            dirtyKey={`settings-${crumb}`}
            fields={fields}
            record={data}
            status={docStatus(data)}
            onSave={async (draft, version) => {
              await adapter.saveSettings(draft, version);
              bump();
            }}
            onPublish={async () => {
              await adapter.publish("cms_settings", "site");
              bump();
            }}
            onDiscard={async () => {
              await adapter.discardDraft("cms_settings", "site");
              bump();
            }}
            onDraftChange={(draft) => preview.post({ kind: "settings", draft })}
          />
        </Card>
      ) : null}
      {preview.panel}
    </>
  );
}
