import { isLText, type LText } from "@/lib/cms/core";

/** Item templates for lists whose default value is empty, keyed by path (list items use `[]`). */
export type ItemTemplates = Record<string, unknown>;

type Options = {
  /** When a list is missing or invalid: fall back to `[]` instead of the template's list. */
  emptyLists?: boolean;
  itemTemplates?: ItemTemplates;
};

/**
 * Makes any stored value safe to render by shaping it like a template.
 *
 * - Keys that exist in the template are kept; unknown keys are dropped.
 * - Values of the wrong type fall back to the template value.
 * - Lists keep the stored items; each item is shaped like the list's item template and
 *   missing item fields become empty (never the template's sample text).
 *
 * Used when building the public site from published data and when validating drafts in the
 * dashboard, so malformed database content can never break a page.
 */
export function conform<T>(value: unknown, template: T, opts: Options = {}, path = ""): T {
  if (isLText(template)) {
    const v = value as Partial<LText> | undefined;
    return {
      ar: typeof v?.ar === "string" ? v.ar : template.ar,
      en: typeof v?.en === "string" ? v.en : template.en,
    } as T;
  }
  if (typeof template === "string") return (typeof value === "string" ? value : template) as T;
  if (typeof template === "number") return (typeof value === "number" && Number.isFinite(value) ? value : template) as T;
  if (typeof template === "boolean") return (typeof value === "boolean" ? value : template) as T;
  if (Array.isArray(template)) {
    if (!Array.isArray(value)) return (opts.emptyLists ? [] : template) as T;
    const itemTemplate = template.length ? template[0] : opts.itemTemplates?.[path];
    if (itemTemplate === undefined) return value.filter((x) => typeof x === "string") as T;
    const blank = emptyLike(itemTemplate);
    return value.map((item) => conform(item, blank, { ...opts, emptyLists: true }, `${path}[]`)) as T;
  }
  if (template && typeof template === "object") {
    const out: Record<string, unknown> = {};
    const v = (value && typeof value === "object" && !Array.isArray(value) ? value : {}) as Record<string, unknown>;
    for (const [k, t] of Object.entries(template)) {
      out[k] = conform(v[k], t, opts, path ? `${path}.${k}` : k);
    }
    return out as T;
  }
  return template;
}

/**
 * Same shape as `template` with every value emptied. Non-empty lists keep one emptied item so
 * nested lists still know the shape of their items.
 */
export function emptyLike<T>(template: T): T {
  if (isLText(template)) return { ar: "", en: "" } as T;
  if (typeof template === "string") return "" as T;
  if (typeof template === "number") return 0 as T;
  if (typeof template === "boolean") return false as T;
  if (Array.isArray(template)) return (template.length ? [emptyLike(template[0])] : []) as T;
  if (template && typeof template === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, t] of Object.entries(template)) out[k] = emptyLike(t);
    return out as T;
  }
  return template;
}

/** A fresh, empty item for a list (used by the dashboard's "Add item"). */
export function newItem<T>(itemTemplate: T): T {
  const blank = emptyLike(itemTemplate);
  return stripTemplateItems(blank);
}

function stripTemplateItems<T>(v: T): T {
  if (Array.isArray(v)) return [] as T;
  if (v && typeof v === "object" && !isLText(v)) {
    const out: Record<string, unknown> = {};
    for (const [k, x] of Object.entries(v)) out[k] = stripTemplateItems(x);
    return out as T;
  }
  return v;
}
