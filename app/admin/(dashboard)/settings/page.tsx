"use client";

import { useEffect, useState } from "react";
import { SettingsEditor } from "@/components/admin/SettingsEditor";
import { useCms } from "@/components/admin/CmsProvider";
import { Btn, Card, Notice } from "@/components/admin/ui";
import { cmsConfig } from "@/lib/cms/admin/config";
import { validateHref } from "@/lib/cms/links";
import { siteSettingsKeys } from "@/lib/cms/admin/settings-groups";

function DeployHook() {
  const { adapter, toast } = useCms();
  const [url, setUrl] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    adapter
      .getPrivateSetting("deploy_hook_url")
      .then((v) => setUrl(typeof v === "string" ? v : ""))
      .catch(() => undefined)
      .finally(() => setLoaded(true));
  }, [adapter]);

  const problem = url ? validateHref(url) : null;
  return (
    <Card className="mb-6">
      <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold text-plum-800">Website build hook (optional)</h2>
      <p className="mt-1 text-sm text-ink-700">
        The public site is static: published changes appear after the site is rebuilt. If your host offers a <em>build/deploy hook</em> URL (Netlify, Vercel, Cloudflare Pages…), save it here to trigger a rebuild from the dashboard. It is stored privately and never included in the website.
      </p>
      <div className="mt-4 flex flex-wrap items-end gap-3">
        <label className="min-w-0 flex-1">
          <span className="mb-1.5 block text-sm font-semibold text-plum-800">Build hook URL</span>
          <input dir="ltr" value={url} disabled={!loaded} onChange={(e) => setUrl(e.target.value)} placeholder="https://api.netlify.com/build_hooks/…" className="block w-full rounded-xl bg-white px-3.5 py-2.5 ring-1 ring-inset ring-plum-700/15 focus:ring-2 focus:ring-crimson focus:outline-none" />
        </label>
        <Btn
          variant="plum"
          loading={busy}
          disabled={!loaded || Boolean(problem)}
          onClick={async () => {
            setBusy(true);
            try {
              await adapter.setPrivateSetting("deploy_hook_url", url.trim());
              toast("success", adapter.mode === "supabase" ? "Build hook saved to Supabase." : "Build hook saved in this browser only.");
            } catch (e) {
              toast("error", (e as Error).message);
            } finally {
              setBusy(false);
            }
          }}
        >
          Save
        </Btn>
      </div>
      {problem ? <p className="mt-1.5 text-xs font-medium text-crimson-700">{problem}</p> : null}
    </Card>
  );
}

export default function SiteSettingsPage() {
  return (
    <SettingsEditor
      title="Site settings"
      crumb="Site settings"
      description="Practice and doctor names, the official portrait and logo, and default search/social settings used by every page."
      keys={siteSettingsKeys}
    >
      <Notice tone="info" className="mb-5" title="Website address">
        Canonical URLs and the sitemap use the build setting <code dir="ltr">NEXT_PUBLIC_SITE_URL</code> (currently <span dir="ltr">{cmsConfig.siteUrl || "not set — https://hybrid-hearts.example"}</span>). Brand colours are part of the design system and intentionally not editable here.
      </Notice>
      <DeployHook />
    </SettingsEditor>
  );
}
