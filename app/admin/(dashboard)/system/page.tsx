"use client";

import { useState } from "react";
import { CheckCircle2, CircleDashed, Download, Rocket, Upload, XCircle } from "lucide-react";
import { useCms } from "@/components/admin/CmsProvider";
import { useLoad } from "@/components/admin/useLoad";
import { Btn, Card, Modal, Notice, PageHeader, Spinner, timeAgo } from "@/components/admin/ui";
import { cmsConfig } from "@/lib/cms/admin/config";
import { latestPublishedAt, loadAll, rebuildNeeded } from "@/lib/cms/admin/load";
import { LocalAdapter } from "@/lib/cms/admin/local-adapter";
import type { ImportReport } from "@/lib/cms/admin/types";
import { getSite } from "@/lib/content/store";
import { downloadJson } from "@/lib/cms/admin/download";

type Check = { label: string; state: "ok" | "fail" | "na"; detail: string };

function CheckRow({ c }: { c: Check }) {
  const Icon = c.state === "ok" ? CheckCircle2 : c.state === "fail" ? XCircle : CircleDashed;
  return (
    <li className="flex gap-3 py-2.5">
      <Icon className={`mt-0.5 size-5 shrink-0 ${c.state === "ok" ? "text-emerald-600" : c.state === "fail" ? "text-crimson" : "text-slate-400"}`} aria-hidden="true" />
      <div>
        <p className="font-semibold text-plum-800">
          {c.label} <span className="sr-only">— {c.state === "ok" ? "OK" : c.state === "fail" ? "problem" : "not applicable"}</span>
        </p>
        <p className="text-sm text-ink-700">{c.detail}</p>
      </div>
    </li>
  );
}

export default function SystemPage() {
  const { adapter, health, session, toast, confirm, bump, refreshSession } = useCms();
  const status = useLoad(async () => {
    const storage = adapter.mode === "supabase" ? await adapter.checkStorage() : null;
    const records = await loadAll(adapter).catch(() => null);
    const hook = await adapter.getPrivateSetting("deploy_hook_url").catch(() => null);
    return { storage, records, outdated: await rebuildNeeded(adapter), hook: typeof hook === "string" ? hook : "" };
  }, [adapter]);
  const [report, setReport] = useState<ImportReport | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const build = getSite().meta;
  const supa = adapter.mode === "supabase";

  const checks: Check[] = supa
    ? [
        { label: "Supabase project", state: "ok", detail: `${new URL(cmsConfig.supabaseUrl).host} · ${cmsConfig.keyKind} key (public, protected by RLS)` },
        { label: "Database reachable", state: health?.reachable ? "ok" : "fail", detail: health?.reachable ? "The project responded." : (health?.error ?? "No response.") },
        { label: "CMS migration applied", state: health?.schemaVersion ? "ok" : "fail", detail: health?.schemaVersion ? `Schema version ${health.schemaVersion}.` : "Apply supabase/migrations to this project (see README › CMS setup)." },
        { label: "Signed in with CMS access", state: session?.role ? "ok" : "fail", detail: session ? `${session.email} · ${session.role ?? "no role"}` : "Not signed in." },
        { label: "Website content imported", state: health?.initialized ? "ok" : "fail", detail: health?.initialized ? "The CMS contains the website content." : "Run “Import website content” below." },
        { label: "Media storage", state: status.data?.storage?.ok ? "ok" : status.loading ? "na" : "fail", detail: status.data?.storage?.detail ?? "Checking…" },
      ]
    : [
        { label: "Supabase project", state: "fail", detail: "Not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY and rebuild the site." },
        { label: "Local sandbox", state: "ok", detail: `Editing works in this browser${(adapter as LocalAdapter).persistent ? " (saved in local storage)" : " — storage is blocked, edits last only for this tab"}.` },
        { label: "Uploads & users", state: "na", detail: "Available once connected to Supabase." },
      ];

  const lastPublish = status.data?.records ? latestPublishedAt(status.data.records) : null;

  return (
    <>
      <PageHeader title="System status" description="Connection, configuration and publishing state — checked live." crumbs={[{ label: "Dashboard", href: "/admin/" }, { label: "System status" }]} />
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold text-plum-800">Connection</h2>
          <ul className="mt-2 divide-y divide-plum-700/8">{checks.map((c) => <CheckRow key={c.label} c={c} />)}</ul>
          <Btn className="mt-3" size="sm" onClick={() => { void refreshSession(); status.reload(); }}>
            Re-check
          </Btn>
        </Card>

        <Card>
          <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold text-plum-800">Website build</h2>
          <p className="mt-2 text-sm text-ink-700">
            This dashboard and the public pages were built from{" "}
            <strong>{build.source === "supabase" ? "content published in Supabase" : build.source === "local-export" ? "an exported content file" : "the bundled default content"}</strong>
            {build.generatedAt ? <> (content as of {new Date(build.generatedAt).toLocaleString("en-GB")})</> : null}.
          </p>
          <p className="mt-2 text-sm text-ink-700">Latest publish in the CMS: {lastPublish ? `${new Date(lastPublish).toLocaleString("en-GB")} (${timeAgo(lastPublish)})` : status.loading ? "checking…" : "nothing published yet"}.</p>
          {status.data?.outdated ? (
            <Notice tone="warning" className="mt-3" title="Rebuild needed">
              The published content differs from what this build shows. Rebuild and redeploy the site to show it (docs/CMS.md › Publishing workflow).
            </Notice>
          ) : status.data?.outdated === false ? (
            <Notice tone="success" className="mt-3">This build shows exactly the content that is published.</Notice>
          ) : null}
          {status.data?.hook ? (
            <Btn
              className="mt-3"
              variant="plum"
              loading={busy === "hook"}
              onClick={async () => {
                setBusy("hook");
                try {
                  // Build hooks don't allow reading the response cross-origin; the request is still delivered.
                  await fetch(status.data!.hook, { method: "POST", mode: "no-cors" });
                  toast("success", "Build requested. Your host doesn't report back to the browser — check its deploy log for progress.");
                } catch (e) {
                  toast("error", `Build request failed: ${(e as Error).message}`);
                } finally {
                  setBusy(null);
                }
              }}
            >
              <Rocket className="size-4" aria-hidden="true" /> Trigger website rebuild
            </Btn>
          ) : (
            <p className="mt-3 text-xs text-ink-500">Tip: add your host&apos;s build-hook URL in Site settings to trigger rebuilds from here.</p>
          )}
        </Card>

        <Card>
          <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold text-plum-800">Import website content</h2>
          <p className="mt-1 text-sm text-ink-700">
            Copies the website&apos;s current pages, sections, settings, services, articles, videos, reviews and FAQs into the CMS. Only missing records are created — anything that already exists is never overwritten.
          </p>
          <Btn
            className="mt-4"
            variant="primary"
            loading={busy === "import"}
            onClick={async () => {
              setBusy("import");
              try {
                const r = await adapter.importWebsiteContent();
                setReport(r);
                bump();
                void refreshSession();
                status.reload();
              } catch (e) {
                toast("error", `Import failed: ${(e as Error).message}`);
              } finally {
                setBusy(null);
              }
            }}
          >
            <Upload className="size-4" aria-hidden="true" /> Import website content
          </Btn>
        </Card>

        <Card>
          <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold text-plum-800">Export published content</h2>
          <p className="mt-1 text-sm text-ink-700">
            Downloads <code>published.json</code> — the published content in the format the site build reads. {supa ? "Useful as a backup." : "Place it at content/published.json and run npm run build to publish sandbox edits to the site."}
          </p>
          <Btn
            className="mt-4"
            variant="plum"
            loading={busy === "export"}
            onClick={async () => {
              setBusy("export");
              try {
                downloadJson("published.json", await adapter.publishedSnapshot());
                toast("success", "published.json downloaded.");
              } catch (e) {
                toast("error", `Export failed: ${(e as Error).message}`);
              } finally {
                setBusy(null);
              }
            }}
          >
            <Download className="size-4" aria-hidden="true" /> Download published.json
          </Btn>
          {!supa ? (
            <Btn
              className="mt-4 ms-2"
              variant="danger"
              onClick={async () => {
                const ok = await confirm({ title: "Reset the local sandbox?", body: "All edits stored in this browser are discarded and the sandbox starts again from the website's current content.", confirmLabel: "Reset sandbox", danger: true });
                if (!ok) return;
                (adapter as LocalAdapter).reset();
                toast("success", "Sandbox reset.");
                bump();
              }}
            >
              Reset sandbox
            </Btn>
          ) : null}
        </Card>

        <Card className="xl:col-span-2">
          <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold text-plum-800">Configuration</h2>
          <p className="mt-1 text-sm text-ink-700">Public build-time settings (never secrets). Change them in your build environment and rebuild.</p>
          <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[auto_1fr]">
            <dt className="font-mono text-xs text-plum-700">NEXT_PUBLIC_SUPABASE_URL</dt>
            <dd>{cmsConfig.supabaseUrl ? "set" : "not set"}</dd>
            <dt className="font-mono text-xs text-plum-700">NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</dt>
            <dd>{cmsConfig.supabaseKey ? `set (${cmsConfig.keyKind})` : "not set"}</dd>
            <dt className="font-mono text-xs text-plum-700">NEXT_PUBLIC_SITE_URL</dt>
            <dd dir="ltr">{cmsConfig.siteUrl || "not set (uses https://hybrid-hearts.example)"}</dd>
            <dt className="font-mono text-xs text-plum-700">NEXT_PUBLIC_CMS_MEDIA_BUCKET</dt>
            <dd>{cmsConfig.bucket}</dd>
            <dt className="font-mono text-xs text-plum-700">Upload limits</dt>
            <dd>Images {cmsConfig.maxImageMB} MB · videos {cmsConfig.maxVideoMB} MB (bucket limit 50 MB by default)</dd>
          </dl>
          <p className="mt-3 text-xs text-ink-500">No service-role key is used anywhere in the dashboard or the site.</p>
        </Card>
      </div>

      {status.loading && !status.data ? <Spinner /> : null}

      <Modal open={Boolean(report)} onClose={() => setReport(null)} title="Import finished" footer={<Btn variant="plum" onClick={() => setReport(null)}>Close</Btn>}>
        {report ? (
          <div className="space-y-3 text-sm">
            {report.errors.length ? (
              <Notice tone="error" title="Some records could not be imported">
                <ul className="list-disc ps-4">{report.errors.map((e, i) => <li key={i}>{e}</li>)}</ul>
              </Notice>
            ) : (
              <Notice tone="success">Import completed {supa ? "in Supabase" : "in the local sandbox"}.</Notice>
            )}
            <table className="w-full">
              <thead>
                <tr className="text-start text-xs text-ink-500">
                  <th className="py-1 text-start">Content</th>
                  <th className="py-1 text-start">Created</th>
                  <th className="py-1 text-start">Already present (kept)</th>
                </tr>
              </thead>
              <tbody>
                {Array.from(new Set([...Object.keys(report.created), ...Object.keys(report.skipped)])).map((k) => (
                  <tr key={k} className="border-t border-plum-700/8">
                    <td className="py-1.5 capitalize">{k}</td>
                    <td className="py-1.5">{report.created[k] ?? 0}</td>
                    <td className="py-1.5">{report.skipped[k] ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </Modal>
    </>
  );
}
