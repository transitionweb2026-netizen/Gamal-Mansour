/**
 * Generates the CMS content inventory from the registry, the dashboard field schema and the
 * content the website currently shows.
 *   npm run cms:inventory
 *
 * Writes docs/cms-content-inventory.md (for people) and docs/cms-content-inventory.json
 * (machine-readable: one entry per editable field). Do not edit either file by hand.
 */
import fs from "node:fs";
import path from "node:path";
import { seoTemplate } from "@/content/defaults";
import { settingsDefaults } from "@/content/site";
import { collectionFields, deriveFields, flattenFields, type Field, type FieldKind } from "@/lib/cms/admin/fields";
import { contactSettingsKeys, siteSettingsKeys } from "@/lib/cms/admin/settings-groups";
import { isLText } from "@/lib/cms/core";
import { collectionKeys, collectionRegistry, globalRegistry, globalUsage, pageRegistry, settingsItemTemplates } from "@/lib/cms/registry";
import { getSite } from "@/lib/content/store";

type Area = "page-section" | "shared-section" | "page-seo" | "settings" | "collection";

type Entry = {
  area: Area;
  page: string | null;
  route: string | null;
  section: string | null;
  sectionKey: string | null;
  component: string;
  field: string;
  label: string;
  type: FieldKind;
  localized: boolean;
  /** Current value; list-item fields give one value per item. */
  value: unknown;
  dashboard: string;
};

const site = getSite();
const entries: Entry[] = [];

/** Values at a field path ("steps[].title") relative to a document. */
function valueAt(doc: unknown, fieldPath: string): unknown {
  const parts = fieldPath.split(".");
  let current: unknown[] = [doc];
  let many = false;
  for (const part of parts) {
    const list = part.endsWith("[]");
    const key = list ? part.slice(0, -2) : part;
    current = current.flatMap((v) => {
      const next = v && typeof v === "object" ? (v as Record<string, unknown>)[key] : undefined;
      return list ? (Array.isArray(next) ? next : []) : [next];
    });
    if (list) many = true;
  }
  return many ? current : current[0];
}

function addDoc(base: Omit<Entry, "field" | "label" | "type" | "localized" | "value">, fields: Field[], doc: unknown, strip = "") {
  for (const f of flattenFields(fields)) {
    if (f.kind === "list" && (f.fields || f.item)) continue; // the list's items are listed instead
    const rel = strip && f.path.startsWith(`${strip}.`) ? f.path.slice(strip.length + 1) : f.path;
    entries.push({ ...base, field: f.path, label: f.label, type: f.kind, localized: f.localized, value: valueAt(doc, rel) });
  }
}

/* ------------------------------------------------------------ collect */

const pageUrl = (route: string) => (route.includes("[") ? `/{ar|en}/${route.replace("[slug]", "{slug}")}/` : `/{ar|en}/${route ? `${route}/` : ""}`);

for (const p of pageRegistry) {
  const route = pageUrl(p.route);
  const state = site.pages[p.id];
  for (const s of p.sections) {
    if (s.ref) continue;
    const content = state.sections.find((x) => x.key === s.key)?.content ?? {};
    addDoc(
      { area: "page-section", page: p.label, route, section: s.label, sectionKey: s.key, component: s.component, dashboard: `/admin/pages/edit/?id=${p.id}&section=${s.key}` },
      deriveFields(s.default ?? {}, s.itemTemplates),
      content,
    );
  }
  if (!p.template) {
    addDoc(
      { area: "page-seo", page: p.label, route, section: "SEO & social sharing", sectionKey: null, component: "lib/seo.ts", dashboard: `/admin/pages/edit/?id=${p.id}&tab=seo` },
      deriveFields(seoTemplate, {}, "seo"),
      state.seo,
      "seo",
    );
  }
}

for (const g of globalRegistry) {
  addDoc(
    { area: "shared-section", page: null, route: null, section: g.label, sectionKey: g.key, component: g.component, dashboard: `/admin/global/?key=${g.key}` },
    deriveFields(g.default, g.itemTemplates),
    site.global[g.key],
  );
}

const settingsTemplates = Object.fromEntries(Object.entries(settingsItemTemplates).map(([k, v]) => [`settings.${k}`, v]));
const settingsFields = deriveFields(settingsDefaults, settingsTemplates, "settings");
for (const [screen, keys, url] of [
  ["Contact & social", contactSettingsKeys as string[], "/admin/contact/"],
  ["Site settings", siteSettingsKeys as string[], "/admin/settings/"],
] as const) {
  addDoc(
    { area: "settings", page: null, route: null, section: screen, sectionKey: null, component: "lib/content/access.ts (used site-wide)", dashboard: url },
    settingsFields.filter((f) => keys.includes(f.key)),
    site.settings,
    "settings",
  );
}

for (const key of collectionKeys) {
  const def = collectionRegistry[key];
  const items = site.collections[key];
  for (const f of flattenFields(collectionFields(key, def.template))) {
    if (f.kind === "list" && (f.fields || f.item)) continue;
    // One value per item.
    entries.push({ area: "collection", page: null, route: null, section: def.label, sectionKey: key, component: def.appearsIn.join("; "), field: f.path, label: f.label, type: f.kind, localized: f.localized, value: items.map((i) => valueAt(i.content, f.path)), dashboard: `/admin/collection/?type=${key}` });
  }
}

/* ------------------------------------------------------------ markdown */

const MAX = 70;
function short(v: unknown): string {
  const text = typeof v === "string" ? v : JSON.stringify(v);
  const one = (text ?? "").replace(/\s+/g, " ").trim();
  return (one.length > MAX ? `${one.slice(0, MAX - 1)}…` : one).replace(/\|/g, "\\|") || "—";
}
function shown(v: unknown, lang: "en" | "ar" | null): string {
  if (Array.isArray(v)) {
    if (!v.length) return "(empty list)";
    const first = shown(v[0], lang);
    return v.length > 1 ? `${first} (+${v.length - 1} more)` : first;
  }
  if (isLText(v)) return short(lang ? v[lang] : v.en);
  if (lang === "ar") return "";
  if (v === "") return "(empty)";
  return short(v);
}
const typeLabel = (e: Entry) => `${e.type}${e.localized ? " · AR/EN" : ""}`;
function fieldTable(rows: Entry[]): string[] {
  return [
    "| Field | Label | Type | Current value (EN / shared) | Current value (AR) |",
    "| --- | --- | --- | --- | --- |",
    ...rows.map((e) => `| \`${e.field}\` | ${e.label} | ${typeLabel(e)} | ${shown(e.value, e.localized ? "en" : null)} | ${e.localized ? shown(e.value, "ar") : ""} |`),
  ];
}

const md: string[] = [];
const count = (area: Area) => entries.filter((e) => e.area === area).length;
const itemCount = collectionKeys.reduce((n, k) => n + site.collections[k].length, 0);

md.push(
  "# CMS content inventory",
  "",
  "Generated by `npm run cms:inventory` from `lib/cms/registry.ts`, the dashboard field schema (`lib/cms/admin/fields.ts`) and the content the website currently shows. **Do not edit by hand.** The machine-readable version is [`cms-content-inventory.json`](./cms-content-inventory.json) (one entry per editable field, with full current values).",
  "",
  "Coverage is enforced by `npm run cms:verify` (part of `npm run check`): every value in the website content must have a dashboard field, every section type must have a renderer, and public components may not contain hardcoded visitor-facing text.",
  "",
  "## Summary",
  "",
  "| | Count |",
  "| --- | --- |",
  `| Pages (incl. the article page template) | ${pageRegistry.length} |`,
  `| Page sections (reorderable; optional ones can be hidden) | ${pageRegistry.reduce((n, p) => n + p.sections.length, 0)} |`,
  `| Shared sections (edited once, shown on several pages) | ${globalRegistry.length} |`,
  `| Collections | ${collectionKeys.length} (${collectionKeys.map((k) => `${site.collections[k].length} ${k}`).join(", ")}) |`,
  `| Editable fields — page sections | ${count("page-section")} |`,
  `| Editable fields — page SEO | ${count("page-seo")} |`,
  `| Editable fields — shared sections | ${count("shared-section")} |`,
  `| Editable fields — site settings | ${count("settings")} |`,
  `| Editable fields — per collection item | ${count("collection")} (× ${itemCount} items) |`,
  `| Bilingual (Arabic + English) fields | ${entries.filter((e) => e.localized).length} |`,
  `| Image / video fields | ${entries.filter((e) => e.type === "media").length} |`,
  `| Link / button destination fields | ${entries.filter((e) => e.type === "url").length} |`,
  "",
  "## Where each kind of content is edited",
  "",
  "| Content | Dashboard location |",
  "| --- | --- |",
  "| Page text, images, buttons and their destinations, lists | Pages › *page* › *section* |",
  "| Section order and visibility | Pages › *page* (drag, ↑ ↓, eye icon) — applied with **Publish page** |",
  "| Page titles, descriptions, social share images, noindex | Pages › *page* › SEO tab, or SEO & metadata |",
  "| Menu, header, footer, social/phone panel, emergency notice, booking band, interface labels, 404 page | Global content |",
  "| Phone, WhatsApp, email, booking link, social profiles, clinic locations | Contact & social |",
  "| Practice name, doctor, portrait, logo, title template, default share image | Site settings |",
  "| Services, articles, videos, patient reviews, FAQ | Collections |",
  "| Uploaded images and videos (upload, replace everywhere, delete when unused) | Media library |",
  "",
);

md.push("## Pages", "");
for (const p of pageRegistry) {
  const state = site.pages[p.id];
  md.push(
    `### ${p.label}`,
    "",
    `${p.description} Public address: \`${pageUrl(p.route)}\`${p.template ? " (one page per published article)" : ""}. Dashboard: \`/admin/pages/edit/?id=${p.id}\`.`,
    "",
    "| # | Section | Key | Type | Component | Hideable | Shown now | Dashboard |",
    "| --- | --- | --- | --- | --- | --- | --- | --- |",
    ...state.sections.map((s, i) => {
      const def = p.sections.find((d) => d.key === s.key)!;
      const where = s.ref ? `\`/admin/global/?key=${s.ref}\` (shared)` : `\`/admin/pages/edit/?id=${p.id}&section=${s.key}\``;
      return `| ${i + 1} | ${s.label} | \`${s.key}\` | ${s.ref ? `shared: ${s.ref}` : s.type} | \`${def.component}\` | ${s.required ? "no (required)" : "yes"} | ${s.visible ? "yes" : "hidden"} | ${where} |`;
    }),
    "",
  );
  for (const s of p.sections) {
    if (s.ref) continue;
    const rows = entries.filter((e) => e.area === "page-section" && e.page === p.label && e.sectionKey === s.key);
    md.push(`#### ${p.label} › ${s.label}`, "", `${s.description}${s.collections ? ` Displays items from: ${s.collections.join(", ")}.` : ""}`, "", ...fieldTable(rows), "");
  }
  const seo = entries.filter((e) => e.area === "page-seo" && e.page === p.label);
  if (seo.length) md.push(`#### ${p.label} › SEO & social sharing`, "", ...fieldTable(seo), "");
}

md.push("## Shared sections (Global content)", "", "Edited once; every page that shows them updates together.", "");
for (const g of globalRegistry) {
  const rows = entries.filter((e) => e.area === "shared-section" && e.sectionKey === g.key);
  md.push(`### ${g.label}`, "", `${g.description} Used on: ${globalUsage(g.key).join(", ") || "—"}. Component: \`${g.component}\`. Dashboard: \`/admin/global/?key=${g.key}\`.`, "", ...fieldTable(rows), "");
}

md.push("## Site settings", "");
for (const screen of ["Contact & social", "Site settings"]) {
  const rows = entries.filter((e) => e.area === "settings" && e.section === screen);
  md.push(`### ${screen}`, "", `Dashboard: \`${rows[0]?.dashboard}\`.`, "", ...fieldTable(rows), "");
}

md.push("## Collections", "");
for (const key of collectionKeys) {
  const def = collectionRegistry[key];
  const items = site.collections[key];
  const rows = entries.filter((e) => e.area === "collection" && e.sectionKey === key);
  md.push(
    `### ${def.label}`,
    "",
    `${def.description} Shown on: ${def.appearsIn.join(", ")}. Database table: \`${def.table}\`. Dashboard: \`/admin/collection/?type=${key}\`.`,
    "",
    items.length
      ? ["| # | " + (def.slugged ? "Slug" : "Id") + " | Title / question (EN) | Visible |", "| --- | --- | --- | --- |", ...items.map((i, n) => {
          const c = i.content as Record<string, unknown>;
          const title = (c.title ?? c.question ?? c.quote) as { en?: string } | undefined;
          return `| ${n + 1} | \`${i.slug}\` | ${short(title?.en ?? "")} | ${i.visible ? "yes" : "no"} |`;
        })].join("\n")
      : "_No items yet._",
    "",
    "Fields of each item (values: first item, then how many more):",
    "",
    ...fieldTable(rows),
    "",
  );
}

md.push(
  "## Not editable in the CMS (by design)",
  "",
  "| What | Where | Why |",
  "| --- | --- | --- |",
  "| Language names in the language switcher (العربية / English) | `lib/i18n.ts` | Fixed endonyms — each language is always named in itself. |",
  "| Brand colours (#DC0038 crimson, #3C0060 plum), typography, spacing, Liquid Glass effects | `app/globals.css` | Design system, not content. Changing them is a design change. |",
  "| Decorative icons, the ECG line and heart illustrations | `components/**` | Decorative artwork (each service's *icon choice* is editable). |",
  "| Page addresses (`/ar/…`, `/en/…`, `/about`, …) and section keys | `lib/cms/registry.ts` | Structural: fixed by the static export. Article URLs and service anchors use editable slugs. |",
  "| Structured-data types, robots.txt, sitemap.xml, web manifest | `app/**`, `lib/seo.ts` | Generated from the content above (names, contact details, published articles). |",
  "| Dashboard interface text | `app/admin/**`, `components/admin/**` | The editing tool itself, not website content. |",
  "",
  "The emergency number appears inside the editable emergency text (Global content › Emergency notice); it has no separate field.",
  "",
);

/* ------------------------------------------------------------ write */

const docs = path.resolve("docs");
fs.mkdirSync(docs, { recursive: true });
fs.writeFileSync(path.join(docs, "cms-content-inventory.md"), `${md.join("\n")}\n`);
fs.writeFileSync(
  path.join(docs, "cms-content-inventory.json"),
  `${JSON.stringify(
    {
      generatedBy: "npm run cms:inventory",
      pages: pageRegistry.map((p) => ({
        id: p.id,
        label: p.label,
        route: pageUrl(p.route),
        template: Boolean(p.template),
        sections: site.pages[p.id].sections.map((s, i) => ({ position: i, key: s.key, label: s.label, type: s.ref ? `ref.${s.ref}` : s.type, required: s.required, visible: s.visible, component: p.sections.find((d) => d.key === s.key)!.component })),
      })),
      sharedSections: globalRegistry.map((g) => ({ key: g.key, label: g.label, component: g.component, usedOn: globalUsage(g.key) })),
      collections: collectionKeys.map((k) => ({ key: k, label: collectionRegistry[k].label, table: collectionRegistry[k].table, items: site.collections[k].map((i) => ({ slug: i.slug, position: i.position, visible: i.visible })) })),
      fields: entries,
    },
    null,
    2,
  )}\n`,
);
console.log(`cms:inventory — ${entries.length} editable fields → docs/cms-content-inventory.md, docs/cms-content-inventory.json`);
