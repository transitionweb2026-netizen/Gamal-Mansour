import type { Locale } from "@/lib/i18n";

/**
 * Content tree conventions
 * ------------------------
 * Every CMS document is a plain JSON tree. Text that differs per language is stored as a
 * localized leaf `{ ar, en }`. Everything else (media references, links, flags, numbers,
 * list order) is shared between languages. Lists are shared: each item holds its own
 * localized leaves, so both languages always have the same items in the same order.
 */

export type LText = { ar: string; en: string };

export function isLText(v: unknown): v is LText {
  if (!v || typeof v !== "object" || Array.isArray(v)) return false;
  const keys = Object.keys(v);
  return keys.length === 2 && typeof (v as LText).ar === "string" && typeof (v as LText).en === "string";
}

/** Type produced by zipping two parallel per-language objects into one localized tree. */
export type Zip<T> = T extends string
  ? LText
  : T extends readonly (infer U)[]
    ? Zip<U>[]
    : T extends object
      ? { -readonly [K in keyof T]: Zip<T[K]> }
      : T;

/** Type of a localized tree once a single language has been selected. */
export type Localize<T> = T extends LText
  ? string
  : T extends readonly (infer U)[]
    ? Localize<U>[]
    : T extends object
      ? { [K in keyof T]: Localize<T[K]> }
      : T;

/**
 * Zips parallel Arabic and English objects into one tree with `{ ar, en }` leaves.
 * Throws at build time if the two languages drift apart structurally.
 */
export function zip<T>(ar: T, en: T, path = "root"): Zip<T> {
  if (typeof ar === "string") {
    if (typeof en !== "string") throw new Error(`zip: ${path} is text in Arabic but not in English`);
    return { ar, en } as Zip<T>;
  }
  if (Array.isArray(ar)) {
    if (!Array.isArray(en) || en.length !== ar.length) {
      throw new Error(`zip: ${path} has ${ar.length} Arabic items but ${Array.isArray(en) ? en.length : "no"} English items`);
    }
    return ar.map((item, i) => zip(item, (en as unknown[])[i], `${path}[${i}]`)) as Zip<T>;
  }
  if (ar && typeof ar === "object") {
    const out: Record<string, unknown> = {};
    const keys = new Set([...Object.keys(ar), ...Object.keys(en as object)]);
    for (const k of keys) {
      if (!(k in (ar as object)) || !(k in (en as object))) throw new Error(`zip: ${path}.${k} is missing in one language`);
      out[k] = zip((ar as Record<string, unknown>)[k], (en as Record<string, unknown>)[k], `${path}.${k}`);
    }
    return out as Zip<T>;
  }
  if (ar !== en) throw new Error(`zip: ${path} differs between languages (${String(ar)} / ${String(en)})`);
  return ar as Zip<T>;
}

/** Selects one language from a localized tree. */
export function localize<T>(value: T, lang: Locale): Localize<T> {
  if (isLText(value)) return value[lang] as Localize<T>;
  if (Array.isArray(value)) return value.map((v) => localize(v, lang)) as Localize<T>;
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) out[k] = localize(v, lang);
    return out as Localize<T>;
  }
  return value as Localize<T>;
}

export function withShared<T extends object, S extends object>(text: T, shared: S): T & S {
  return { ...text, ...shared };
}

/** Converts `{ ar: string[], en: string[] }` into a shared list of localized items. */
export function zipList(v: { ar: readonly string[]; en: readonly string[] }, path = "list"): LText[] {
  return zip(v.ar as string[], v.en as string[], path);
}

/** Fills `{name}` placeholders in an editable template string. */
export function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
}

export const emptyLText = (): LText => ({ ar: "", en: "" });

/** Deep clone for plain JSON data. */
export function clone<T>(v: T): T {
  return v === undefined ? v : (JSON.parse(JSON.stringify(v)) as T);
}

/** Stable JSON comparison for change detection. */
export function sameJson(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}
