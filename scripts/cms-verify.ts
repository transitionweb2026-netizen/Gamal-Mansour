/**
 * CMS integrity checks — part of `npm run check`.
 *   npm run cms:verify
 *
 *  1. Every section type in the registry has a renderer (and every renderer is used).
 *  2. Bundled defaults are valid stored content (they conform to their own templates).
 *  3. Field coverage: every value in the website content has a dashboard field; the two
 *     settings screens together cover every settings key.
 *  4. The website content passes the dashboard's own validation (links, media, formats).
 *  5. Internal links point at pages that exist.
 *  6. Import round-trip: seeding the CMS from the site and publishing it rebuilds the same site.
 *  7. supabase/seed.sql is up to date with the content.
 *  8. No hardcoded visitor-facing text in public components (documented exceptions only).
 */
import fs from "node:fs";
import path from "node:path";
import { seoTemplate } from "@/content/defaults";
import { settingsDefaults } from "@/content/site";
import { collectionFields, deriveFields, flattenFields, type Field } from "@/lib/cms/admin/fields";
import { seedDb } from "@/lib/cms/admin/local-adapter";
import { contactSettingsKeys, siteSettingsKeys } from "@/lib/cms/admin/settings-groups";
import { snapshotFromRecords } from "@/lib/cms/admin/snapshot";
import type { MediaItem } from "@/lib/cms/admin/types";
import { validateDoc, validateItem } from "@/lib/cms/admin/validate";
import { conform, type ItemTemplates } from "@/lib/cms/conform";
import { isLText, sameJson } from "@/lib/cms/core";
import { isPhotoName, parseMediaRef, staticAssets } from "@/lib/cms/media";
import { collectionKeys, collectionRegistry, globalRegistry, pageRegistry, settingsItemTemplates } from "@/lib/cms/registry";
import { buildSeedSql } from "@/lib/cms/seed-sql";
import { buildSite, contentFingerprint } from "@/lib/cms/site";
import { getSite } from "@/lib/content/store";

type Doc = { where: string; fields: Field[]; value: Record<string, unknown>; base: string; itemTemplates: ItemTemplates; collection?: string };

const site = getSite();
const results: Array<{ name: string; problems: string[]; note?: string }> = [];
const check = (name: string, problems: string[], note?: string) => results.push({ name, problems, note });

/* ------------------------------------------------------- documents to check */

const settingsTemplates = Object.fromEntries(Object.entries(settingsItemTemplates).map(([k, v]) => [`settings.${k}`, v]));
const docs: Doc[] = [];
for (const p of pageRegistry) {
  if (!p.template) docs.push({ where: `${p.id} › SEO`, fields: deriveFields(seoTemplate, {}, "seo"), value: site.pages[p.id].seo as Record<string, unknown>, base: "seo", itemTemplates: {} });
  for (const s of p.sections) {
    if (s.ref) continue;
    const content = site.pages[p.id].sections.find((x) => x.key === s.key)?.content ?? {};
    docs.push({ where: `${p.id} › ${s.label}`, fields: deriveFields(s.default ?? {}, s.itemTemplates), value: content, base: "", itemTemplates: s.itemTemplates ?? {} });
  }
}
for (const g of globalRegistry) {
  docs.push({ where: `global › ${g.label}`, fields: deriveFields(g.default, g.itemTemplates), value: site.global[g.key] as Record<string, unknown>, base: "", itemTemplates: g.itemTemplates ?? {} });
}
const settingsKeys = [...contactSettingsKeys, ...siteSettingsKeys] as string[];
docs.push({
  where: "Site settings",
  fields: deriveFields(settingsDefaults, settingsTemplates, "settings").filter((f) => settingsKeys.includes(f.key)),
  value: site.settings as unknown as Record<string, unknown>,
  base: "settings",
  itemTemplates: settingsTemplates,
});
for (const key of collectionKeys) {
  for (const item of site.collections[key]) {
    docs.push({ where: `${key} › ${item.slug}`, fields: collectionFields(key, collectionRegistry[key].template), value: item.content as Record<string, unknown>, base: "", itemTemplates: {}, collection: key });
  }
}

/* -------------------------------------------------------- 1. renderers */

{
  const source = fs.readFileSync(path.resolve("components", "PageView.tsx"), "utf8");
  const renderers = new Set([...source.matchAll(/^\s*"([\w.]+)":/gm)].map((m) => m[1]));
  const needed = new Set(pageRegistry.filter((p) => p.id !== "article").flatMap((p) => p.sections.map((s) => (s.ref ? `ref.${s.ref}` : s.type))));
  const problems = [
    ...[...needed].filter((t) => !renderers.has(t)).map((t) => `no renderer for section type "${t}"`),
    ...[...renderers].filter((t) => !needed.has(t)).map((t) => `renderer "${t}" is not used by any page`),
  ];
  check("Every section type has a renderer", problems, `${needed.size} section types (the article page renders through ArticleView)`);

  const files = [...pageRegistry.flatMap((p) => p.sections.map((s) => s.component)), ...globalRegistry.map((g) => g.component)].flatMap((c) => c.split(", "));
  const missing = [...new Set(files)].filter((f) => !fs.existsSync(path.resolve(f)));
  check("Registry component files exist", missing.map((f) => `missing ${f}`), `${new Set(files).size} files`);
}

/* ---------------------------------------------------- 2. defaults conform */

{
  const problems: string[] = [];
  const same = (where: string, value: unknown, template: unknown, opts = {}) => {
    if (!sameJson(conform(value, template, opts), value)) problems.push(`${where}: default does not round-trip through conform()`);
  };
  for (const p of pageRegistry) for (const s of p.sections) if (!s.ref) same(`${p.id}.${s.key}`, s.default ?? {}, s.default ?? {}, { itemTemplates: s.itemTemplates });
  for (const g of globalRegistry) same(`global.${g.key}`, g.default, g.default, { itemTemplates: g.itemTemplates });
  same("settings", settingsDefaults, settingsDefaults, { itemTemplates: settingsItemTemplates });
  for (const key of collectionKeys) {
    const template = collectionRegistry[key].template;
    for (const item of site.collections[key]) same(`${key}.${item.slug}`, item.content, template, { emptyLists: true });
  }
  for (const p of pageRegistry) {
    if (!p.sections.every((s) => s.ref ? globalRegistry.some((g) => g.key === s.ref) : s.default)) problems.push(`${p.id}: a section has no default content or an unknown shared reference`);
  }
  check("Bundled defaults are valid stored content", problems);
}

/* ---------------------------------------------------- 3. field coverage */

function leaves(v: unknown, at: string, templates: ItemTemplates): string[] {
  if (isLText(v) || v === null || typeof v !== "object") return [at];
  if (Array.isArray(v)) {
    const items = v.length ? v : templates[at] !== undefined ? [templates[at]] : [];
    const inner = items.flatMap((item) => (item !== null && typeof item === "object" && !isLText(item) ? leaves(item, `${at}[]`, templates) : [`${at}[]`]));
    return [at, ...new Set(inner)];
  }
  return Object.entries(v).flatMap(([k, x]) => leaves(x, at ? `${at}.${k}` : k, templates));
}

let fieldCount = 0;
{
  const problems: string[] = [];
  for (const d of docs) {
    const flat = flattenFields(d.fields);
    const covered = new Set(flat.flatMap((f) => (f.kind === "multiselect" ? [f.path, `${f.path}[]`] : [f.path])));
    const value = d.base ? { [d.base]: d.value } : d.value;
    const paths = d.base === "settings" ? leaves(value, "", d.itemTemplates).filter((p) => settingsKeys.includes(p.split(/[.[]/)[1])) : leaves(value, "", d.itemTemplates);
    for (const p of new Set(paths)) if (!covered.has(p)) problems.push(`${d.where}: "${p}" has no dashboard field`);
    fieldCount += flat.filter((f) => f.kind !== "list").length;
  }
  const allSettings = Object.keys(settingsDefaults);
  for (const k of allSettings) if (!settingsKeys.includes(k)) problems.push(`settings key "${k}" is on neither settings screen`);
  const overlap = contactSettingsKeys.filter((k) => (siteSettingsKeys as string[]).includes(k));
  if (overlap.length) problems.push(`settings keys on both screens: ${overlap.join(", ")}`);
  check("Every content value has a dashboard field", problems, `${docs.length} documents, ${fieldCount} editable fields`);
}

/* ---------------------------------------------------- 4. validation */

function mediaExists(ref: string): boolean {
  const parsed = parseMediaRef(ref);
  if (!parsed) return false;
  if (parsed.scheme === "local") return isPhotoName(parsed.value);
  if (parsed.scheme === "static") return parsed.value in staticAssets && fs.existsSync(path.resolve("public", `.${parsed.value}`));
  return parsed.value in site.media;
}

{
  const problems: string[] = [];
  for (const d of docs) {
    // Same call as the editor: field keys index the document itself (the base only prefixes paths).
    const issues = [...validateDoc(d.fields, d.value, { mediaExists }), ...(d.collection ? validateItem(d.collection, d.value) : [])];
    for (const e of issues.filter((i) => i.severity === "error")) problems.push(`${d.where} › ${e.label}: ${e.message}`);
  }
  check("Website content passes dashboard validation", problems);
}

{
  const problems: string[] = [];
  const serviceSlugs = site.collections.services.map((s) => s.slug);
  const articleSlugs = site.collections.articles.map((a) => a.slug);
  const faqSection = site.pages.patients.sections.find((s) => s.key === "faq")?.content as { categories?: Array<{ id: string }> } | null;
  const groups = (faqSection?.categories ?? []).map((c) => c.id);
  const featured = (site.pages.home.sections.find((s) => s.key === "services")?.content as { featuredSlug?: string } | null)?.featuredSlug;
  if (featured && !serviceSlugs.includes(featured)) problems.push(`home › Services overview: featured service "${featured}" does not exist`);
  for (const a of site.collections.articles) {
    for (const r of (a.content as { related?: string[] }).related ?? []) if (!articleSlugs.includes(r)) problems.push(`articles › ${a.slug}: related article "${r}" does not exist`);
  }
  for (const f of site.collections.faqs) {
    const category = (f.content as { category?: string }).category ?? "";
    if (!groups.includes(category)) problems.push(`faqs › ${f.slug}: group "${category}" is not defined on the FAQ section`);
  }
  check("References between content items resolve", problems, `${groups.length} FAQ groups, ${serviceSlugs.length} services, ${articleSlugs.length} articles`);
}

/* ---------------------------------------------------- 5. internal links */

function collectLinks(fields: Field[], value: Record<string, unknown>, where: string, out: Array<{ where: string; href: string }>) {
  for (const f of fields) {
    const v = value?.[f.key];
    if (f.kind === "group") collectLinks(f.fields ?? [], (v ?? {}) as Record<string, unknown>, `${where}.${f.key}`, out);
    else if (f.kind === "list" && Array.isArray(v)) {
      v.forEach((item, i) => {
        if (f.fields) collectLinks(f.fields, item as Record<string, unknown>, `${where}.${f.key}[${i}]`, out);
        else if (f.item?.kind === "url" && typeof item === "string") out.push({ where: `${where}.${f.key}[${i}]`, href: item });
      });
    } else if (f.kind === "url" && typeof v === "string") out.push({ where: `${where}.${f.key}`, href: v });
    else if (f.key === "path" && typeof v === "string") out.push({ where: `${where}.${f.key}`, href: `/${v}` });
  }
}

{
  const routes = new Set(pageRegistry.filter((p) => !p.template).map((p) => `/${p.route}`.replace(/\/$/, "") || "/"));
  for (const a of site.collections.articles) if (a.visible) routes.add(`/articles/${a.slug}`);
  const links: Array<{ where: string; href: string }> = [];
  for (const d of docs) collectLinks(d.fields, d.value, d.where, links);
  const problems: string[] = [];
  for (const l of links) {
    const href = l.href.trim();
    if (!href.startsWith("/")) continue;
    const route = href.split("#")[0].replace(/\/$/, "") || "/";
    if (!routes.has(route)) problems.push(`${l.where}: "${href}" is not a page on this site`);
  }
  check("Internal links point at existing pages", problems, `${links.length} links checked`);
}

/* ---------------------------------------------------- 6. import round-trip */

{
  const db = seedDb();
  const media = Object.values(site.media) as MediaItem[];
  const rebuilt = buildSite(snapshotFromRecords({ ...db, media }, { draft: false }));
  const problems = contentFingerprint(rebuilt) === contentFingerprint(site) ? [] : ["publishing the imported content would change the website (see lib/cms/seed-data.ts)"];
  const counts = `${db.pages.length} pages, ${db.sections.length} sections, ${collectionKeys.map((k) => `${db.items[k].length} ${k}`).join(", ")}`;
  check("Import → publish → build reproduces the current website", problems, counts);
}

/* ---------------------------------------------------- 7. seed.sql */

{
  const file = path.resolve("supabase", "seed.sql");
  const current = fs.existsSync(file) ? fs.readFileSync(file, "utf8").replace(/\r\n/g, "\n") : "";
  check("supabase/seed.sql is up to date", current === buildSeedSql() ? [] : ["out of date — run `npm run cms:seed-sql`"]);
}

/* ---------------------------------------------------- 8. hardcoded text */

/** Deliberate exceptions, documented in docs/cms-content-inventory.md. */
const textExceptions: Record<string, string> = {
  "lib/i18n.ts": "Language names in the language switcher (العربية / English) are fixed endonyms.",
  "components/ServiceIcon.tsx": "Icon option names shown only in the dashboard's icon picker.",
};

function sourceFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return e.name === "admin" ? [] : sourceFiles(p);
    return /\.tsx?$/.test(e.name) ? [p] : [];
  });
}

{
  const problems: string[] = [];
  const files = [...sourceFiles("components"), ...sourceFiles("app"), ...sourceFiles(path.join("lib", "content")), path.join("lib", "seo.ts"), path.join("lib", "i18n.ts")];
  for (const file of files) {
    const rel = file.split(path.sep).join("/");
    if (rel in textExceptions) continue;
    const jsx = file.endsWith(".tsx");
    fs.readFileSync(file, "utf8")
      .split("\n")
      .forEach((line, i) => {
        if (/^\s*(\/\/|\*|\/\*)/.test(line)) return;
        const found = [
          ...(/[؀-ۿ]/.test(line) ? ["Arabic text"] : []),
          // Text between JSX tags (skipping type signatures such as `): Promise<Metadata>`).
          ...(jsx ? [...line.matchAll(/>([^<>{}]*[A-Za-z][^<>{}]*)</g)].map((m) => m[1].trim()).filter((t) => t && !/^[()\]]/.test(t) && !/^[\w.]+$/.test(t) && !/[=&|;]/.test(t)) : []),
          ...[...line.matchAll(/\b(?:aria-label|alt|title|placeholder)="([^"]*[A-Za-z][^"]*)"/g)].map((m) => m[0]),
          ...[...line.matchAll(/["'`]([A-Z][a-z]+(?: [a-zA-Z]+)+)["'`]/g)].map((m) => m[1]),
        ];
        for (const f of found) problems.push(`${rel}:${i + 1}: ${f}`);
      });
  }
  check("No hardcoded visitor-facing text in public code", problems, `${files.length} files scanned; ${Object.keys(textExceptions).length} documented exceptions`);
}

/* ---------------------------------------------------- report */

let failed = 0;
for (const r of results) {
  const ok = r.problems.length === 0;
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${r.name}${r.note ? `  (${r.note})` : ""}`);
  for (const p of r.problems.slice(0, 25)) console.log(`      - ${p}`);
  if (r.problems.length > 25) console.log(`      … ${r.problems.length - 25} more`);
}
console.log(failed ? `\ncms:verify — ${failed} check(s) failed.` : `\ncms:verify — all ${results.length} checks passed.`);
process.exit(failed ? 1 : 0);
