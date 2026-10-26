"use client";

import { createContext, useContext, useId } from "react";
import { ArrowDown, ArrowUp, Film, ImageIcon, Plus, Trash2 } from "lucide-react";
import type { Field, Option } from "@/lib/cms/admin/fields";
import type { Issue } from "@/lib/cms/admin/validate";
import { isLText, type LText } from "@/lib/cms/core";
import { validateHref } from "@/lib/cms/links";
import { Btn } from "@/components/admin/ui";
import type { ResolvedMedia } from "@/lib/cms/media";

/* ------------------------------------------------------------- context */

export type FieldEnv = {
  options: { services: Option[]; articles: Option[]; faqCategories: Option[] };
  resolveMedia: (ref: string) => (ResolvedMedia & { name?: string }) | null;
  pickMedia: (kind: "image" | "video", current: string) => Promise<string | null>;
  issues: Issue[];
};

const EnvContext = createContext<FieldEnv | null>(null);
export const FieldEnvProvider = EnvContext.Provider;
function useEnv(): FieldEnv {
  const env = useContext(EnvContext);
  if (!env) throw new Error("FieldEditor needs a FieldEnvProvider");
  return env;
}

const INTERNAL_ROUTES = ["/", "/about", "/services", "/articles", "/videos", "/patients", "/contact"];

const inputCls =
  "block w-full rounded-xl border-0 bg-white px-3.5 py-2.5 text-[0.95rem] text-ink ring-1 ring-inset ring-plum-700/15 placeholder:text-ink-500/60 focus:ring-2 focus:ring-crimson focus:outline-none read-only:bg-plum-50/60 read-only:text-ink-500";

/* ------------------------------------------------------------- values */

/** Empty value for a field (used when adding list items). */
export function emptyValue(f: Field): unknown {
  if (f.localized) return { ar: "", en: "" };
  switch (f.kind) {
    case "boolean":
      return false;
    case "number":
      return f.min ?? 0;
    case "list":
    case "multiselect":
      return [];
    case "select":
      return f.options?.[0]?.value ?? "";
    case "group":
      return Object.fromEntries((f.fields ?? []).map((c) => [c.key, emptyValue(c)]));
    default:
      return "";
  }
}

function itemTitle(fields: Field[] | undefined, item: unknown, index: number, fallback: string): string {
  const obj = (item ?? {}) as Record<string, unknown>;
  for (const k of ["title", "question", "heading", "label", "name", "quote"]) {
    const v = obj[k];
    if (isLText(v) && (v.en || v.ar)) return (v.en || v.ar).slice(0, 80);
    if (typeof v === "string" && v) return v.slice(0, 80);
  }
  const first = fields?.find((f) => f.localized);
  const v = first ? obj[first.key] : null;
  if (isLText(v) && (v.en || v.ar)) return (v.en || v.ar).slice(0, 80);
  return `${fallback} ${index + 1}`;
}

/* ------------------------------------------------------------- pieces */

function Counter({ text, max }: { text: string; max?: number }) {
  if (!max) return null;
  const over = text.length > max;
  return <span className={`text-xs tabular-nums ${over ? "font-semibold text-amber-700" : "text-ink-500"}`}>{text.length}/{max}</span>;
}

function FieldLabel({ f, htmlFor, extra }: { f: Field; htmlFor?: string; extra?: React.ReactNode }) {
  return (
    <div className="mb-1.5 flex flex-wrap items-end justify-between gap-2">
      <label htmlFor={htmlFor} className="text-sm font-semibold text-plum-800">
        {f.label}
        {f.required ? <span className="text-crimson"> *</span> : null}
      </label>
      {extra}
    </div>
  );
}

function Help({ f, id }: { f: Field; id: string }) {
  return f.help ? (
    <p id={id} className="mt-1.5 text-xs text-ink-500">
      {f.help}
    </p>
  ) : null;
}

function FieldIssues({ path }: { path: string }) {
  const { issues } = useEnv();
  const mine = issues.filter((i) => i.path === path);
  if (!mine.length) return null;
  return (
    <ul className="mt-1.5 space-y-0.5">
      {mine.map((i, n) => (
        <li key={n} className={`text-xs font-medium ${i.severity === "error" ? "text-crimson-700" : "text-amber-700"}`}>
          {i.message}
        </li>
      ))}
    </ul>
  );
}

function LocalizedInput({ f, value, onChange }: { f: Field; value: LText; onChange: (v: LText) => void }) {
  const id = useId();
  const multiline = f.kind === "textarea";
  const box = (lang: "ar" | "en") => {
    const props = {
      id: `${id}-${lang}`,
      value: value[lang],
      dir: lang === "ar" ? ("rtl" as const) : ("ltr" as const),
      lang,
      readOnly: f.readOnly,
      "aria-describedby": f.help ? `${id}-help` : undefined,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange({ ...value, [lang]: e.target.value }),
      className: `${inputCls} ${lang === "ar" ? "font-[family-name:var(--font-plex-arabic)] text-[1rem]" : ""}`,
    };
    return (
      <div>
        <div className="mb-1 flex items-center justify-between">
          <label htmlFor={`${id}-${lang}`} className="text-xs font-semibold text-ink-500">
            {lang === "ar" ? "العربية · Arabic" : "English"}
          </label>
          <Counter text={value[lang]} max={f.max} />
        </div>
        {multiline ? <textarea rows={f.rows ?? 3} {...props} /> : <input type="text" {...props} />}
      </div>
    );
  };
  return (
    <div>
      <p className="mb-1.5 text-sm font-semibold text-plum-800">
        {f.label}
        {f.required ? <span className="text-crimson"> *</span> : null}
      </p>
      <div className="grid gap-3 md:grid-cols-2">
        {box("ar")}
        {box("en")}
      </div>
      <Help f={f} id={`${id}-help`} />
      <FieldIssues path={f.path} />
    </div>
  );
}

function MediaInput({ f, value, onChange }: { f: Field; value: string; onChange: (v: string) => void }) {
  const { resolveMedia, pickMedia } = useEnv();
  const id = useId();
  const m = value ? resolveMedia(value) : null;
  const kind = f.mediaType ?? "image";
  return (
    <div>
      <FieldLabel f={f} />
      <div className="flex flex-wrap items-center gap-4 rounded-xl bg-white p-3 ring-1 ring-inset ring-plum-700/15">
        <div className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-lg bg-plum-50 ring-1 ring-plum-700/10">
          {m?.kind === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element -- dashboard preview
            <img src={m.src} alt="" className="size-full object-cover" />
          ) : m?.kind === "video" ? (
            <Film className="size-7 text-plum-500" aria-hidden="true" />
          ) : (
            <ImageIcon className="size-7 text-plum-300" aria-hidden="true" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-ink" dir="ltr">
            {m ? (m.name ?? value) : value ? `Missing: ${value}` : `No ${kind} selected`}
          </p>
          {m?.width ? (
            <p className="text-xs text-ink-500">
              {m.width} × {m.height}
            </p>
          ) : null}
          <div className="mt-2 flex flex-wrap gap-2">
            <Btn
              size="sm"
              variant="plum"
              aria-describedby={f.help ? `${id}-help` : undefined}
              onClick={async () => {
                const ref = await pickMedia(kind, value);
                if (ref !== null) onChange(ref);
              }}
            >
              {value ? `Replace ${kind}` : `Choose ${kind}`}
            </Btn>
            {value ? (
              <Btn size="sm" variant="ghost" onClick={() => onChange("")}>
                Remove
              </Btn>
            ) : null}
          </div>
        </div>
      </div>
      <Help f={f} id={`${id}-help`} />
      <FieldIssues path={f.path} />
    </div>
  );
}

function ListEditor({ f, value, onChange }: { f: Field; value: unknown[]; onChange: (v: unknown[]) => void }) {
  const move = (i: number, d: number) => {
    const next = [...value];
    const [x] = next.splice(i, 1);
    next.splice(i + d, 0, x);
    onChange(next);
  };
  const remove = (i: number) => onChange(value.filter((_, n) => n !== i));
  const add = () => onChange([...value, f.fields ? Object.fromEntries(f.fields.map((c) => [c.key, emptyValue(c)])) : f.item ? emptyValue(f.item) : ""]);
  const noun = f.itemLabel ?? "Item";

  return (
    <fieldset className="rounded-xl bg-plum-50/50 p-3 ring-1 ring-inset ring-plum-700/10 sm:p-4">
      <legend className="sr-only">{f.label}</legend>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-plum-800">
          {f.label} <span className="font-normal text-ink-500">({value.length})</span>
        </p>
      </div>
      {f.help ? <p className="-mt-2 mb-3 text-xs text-ink-500">{f.help}</p> : null}
      <ol className="space-y-2.5">
        {value.map((item, i) => {
          // preventDefault stops clicks on these buttons from also toggling the surrounding <details>.
          const controls = (
            <div className="flex shrink-0 items-center gap-1" onClick={(e) => e.preventDefault()}>
              <button type="button" disabled={i === 0} onClick={() => move(i, -1)} aria-label={`Move ${noun.toLowerCase()} ${i + 1} up`} className="grid size-8 place-items-center rounded-lg text-plum-700 hover:bg-white disabled:opacity-30">
                <ArrowUp className="size-4" aria-hidden="true" />
              </button>
              <button type="button" disabled={i === value.length - 1} onClick={() => move(i, 1)} aria-label={`Move ${noun.toLowerCase()} ${i + 1} down`} className="grid size-8 place-items-center rounded-lg text-plum-700 hover:bg-white disabled:opacity-30">
                <ArrowDown className="size-4" aria-hidden="true" />
              </button>
              <button type="button" onClick={() => remove(i)} aria-label={`Remove ${noun.toLowerCase()} ${i + 1}`} className="grid size-8 place-items-center rounded-lg text-crimson-700 hover:bg-crimson-50">
                <Trash2 className="size-4" aria-hidden="true" />
              </button>
            </div>
          );
          if (f.fields) {
            return (
              <li key={i}>
                <details className="group rounded-xl bg-white ring-1 ring-plum-700/10" open={value.length <= 3}>
                  <summary className="flex min-h-12 list-none items-center gap-3 px-3.5 py-2">
                    <span className="grid size-6 place-items-center rounded-md bg-plum-50 text-xs font-bold text-plum-600 tabular-nums">{i + 1}</span>
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold text-plum-800">{itemTitle(f.fields, item, i, noun)}</span>
                    {controls}
                  </summary>
                  <div className="space-y-4 border-t border-plum-700/8 p-3.5">
                    {f.fields.map((c) => (
                      <FieldEditor
                        key={c.key}
                        field={c}
                        value={(item as Record<string, unknown>)?.[c.key]}
                        onChange={(v) => onChange(value.map((x, n) => (n === i ? { ...(x as object), [c.key]: v } : x)))}
                      />
                    ))}
                  </div>
                </details>
              </li>
            );
          }
          return (
            <li key={i} className="flex items-start gap-2 rounded-xl bg-white p-2.5 ring-1 ring-plum-700/10">
              <span className="mt-2 grid size-6 shrink-0 place-items-center rounded-md bg-plum-50 text-xs font-bold text-plum-600 tabular-nums">{i + 1}</span>
              <div className="min-w-0 flex-1">
                {f.item ? <FieldEditor field={{ ...f.item, label: `${noun} ${i + 1}` }} value={item} onChange={(v) => onChange(value.map((x, n) => (n === i ? v : x)))} compact /> : null}
              </div>
              {controls}
            </li>
          );
        })}
      </ol>
      <Btn size="sm" className="mt-3" onClick={add}>
        <Plus className="size-4" aria-hidden="true" /> Add {noun.toLowerCase()}
      </Btn>
    </fieldset>
  );
}

/* ------------------------------------------------------------- main */

export function FieldEditor({ field: f, value, onChange, compact = false }: { field: Field; value: unknown; onChange: (v: unknown) => void; compact?: boolean }) {
  const env = useEnv();
  const id = useId();

  if (f.kind === "group") {
    const obj = (value ?? {}) as Record<string, unknown>;
    return (
      <fieldset className="rounded-xl p-0">
        <legend className="mb-3 text-sm font-bold tracking-wide text-plum-600 uppercase">{f.label}</legend>
        <div className="space-y-5 border-s-2 border-plum-700/10 ps-4">
          {(f.fields ?? []).map((c) => (
            <FieldEditor key={c.key} field={c} value={obj[c.key]} onChange={(v) => onChange({ ...obj, [c.key]: v })} />
          ))}
        </div>
      </fieldset>
    );
  }

  if (f.kind === "list") return <ListEditor f={f} value={Array.isArray(value) ? value : []} onChange={onChange} />;

  if (f.localized) {
    const v = isLText(value) ? value : { ar: "", en: "" };
    return compact ? (
      <div className="grid gap-2 md:grid-cols-2">
        {(["ar", "en"] as const).map((lang) => {
          const props = {
            "aria-label": `${f.label} — ${lang === "ar" ? "Arabic" : "English"}`,
            value: v[lang],
            dir: lang === "ar" ? ("rtl" as const) : ("ltr" as const),
            lang,
            onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange({ ...v, [lang]: e.target.value }),
            className: `${inputCls} ${lang === "ar" ? "font-[family-name:var(--font-plex-arabic)]" : ""}`,
          };
          return f.kind === "textarea" ? <textarea key={lang} rows={f.rows ?? 3} {...props} /> : <input key={lang} type="text" {...props} />;
        })}
      </div>
    ) : (
      <LocalizedInput f={f} value={v} onChange={onChange} />
    );
  }

  if (f.kind === "media") return <MediaInput f={f} value={typeof value === "string" ? value : ""} onChange={onChange} />;

  if (f.kind === "boolean") {
    return (
      <div>
        <label className="flex cursor-pointer items-start gap-3">
          <span className="relative mt-0.5 inline-flex">
            <input type="checkbox" className="peer sr-only" checked={value === true} onChange={(e) => onChange(e.target.checked)} aria-describedby={f.help ? `${id}-help` : undefined} />
            <span className="h-6 w-11 rounded-full bg-plum-200 transition-colors peer-checked:bg-crimson peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-crimson" />
            <span className="absolute top-0.5 start-0.5 size-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5 rtl:peer-checked:-translate-x-5" />
          </span>
          <span className="text-sm font-semibold text-plum-800">{f.label}</span>
        </label>
        <Help f={f} id={`${id}-help`} />
        <FieldIssues path={f.path} />
      </div>
    );
  }

  if (f.kind === "select" || f.kind === "multiselect") {
    const options = f.optionsFrom ? env.options[f.optionsFrom] : (f.options ?? []);
    if (f.kind === "multiselect") {
      const selected = Array.isArray(value) ? (value as string[]) : [];
      return (
        <fieldset>
          <legend className="mb-1.5 text-sm font-semibold text-plum-800">{f.label}</legend>
          <div className="grid gap-1.5 rounded-xl bg-white p-3 ring-1 ring-inset ring-plum-700/15 sm:grid-cols-2">
            {options.map((o) => (
              <label key={o.value} className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm hover:bg-plum-50">
                <input
                  type="checkbox"
                  className="size-4 accent-[var(--color-crimson)]"
                  checked={selected.includes(o.value)}
                  onChange={(e) => onChange(e.target.checked ? [...selected, o.value] : selected.filter((x) => x !== o.value))}
                />
                {o.label}
              </label>
            ))}
            {!options.length ? <p className="text-sm text-ink-500">Nothing to choose from yet.</p> : null}
          </div>
          {f.help ? <p className="mt-1.5 text-xs text-ink-500">{f.help}</p> : null}
        </fieldset>
      );
    }
    const current = typeof value === "string" ? value : "";
    const known = options.some((o) => o.value === current);
    return (
      <div>
        <FieldLabel f={f} htmlFor={id} />
        <select id={id} value={current} onChange={(e) => onChange(e.target.value)} className={inputCls} aria-describedby={f.help ? `${id}-help` : undefined}>
          {!known ? <option value={current}>{current ? `${current} (not available)` : "— Choose —"}</option> : null}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <Help f={f} id={`${id}-help`} />
        <FieldIssues path={f.path} />
      </div>
    );
  }

  if (f.kind === "number") {
    return (
      <div>
        <FieldLabel f={f} htmlFor={id} />
        <input
          id={id}
          type="number"
          min={f.min}
          max={f.maxValue}
          value={typeof value === "number" ? value : 0}
          onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
          className={`${inputCls} max-w-40`}
        />
        <Help f={f} id={`${id}-help`} />
        <FieldIssues path={f.path} />
      </div>
    );
  }

  const text = typeof value === "string" ? value : "";

  if (f.kind === "url") {
    const problem = text ? validateHref(text, { allowEmpty: !f.required }) : null;
    return (
      <div>
        <FieldLabel f={f} htmlFor={id} extra={<span className="text-xs text-ink-500">/page, https://…, mailto:, tel:</span>} />
        <input id={id} type="text" dir="ltr" list={`${id}-routes`} value={text} placeholder="/contact" onChange={(e) => onChange(e.target.value)} className={inputCls} aria-invalid={Boolean(problem)} aria-describedby={f.help ? `${id}-help` : undefined} />
        <datalist id={`${id}-routes`}>
          {INTERNAL_ROUTES.map((r) => (
            <option key={r} value={r} />
          ))}
        </datalist>
        {problem ? <p className="mt-1.5 text-xs font-medium text-crimson-700">{problem}</p> : null}
        <Help f={f} id={`${id}-help`} />
        <FieldIssues path={f.path} />
      </div>
    );
  }

  return (
    <div>
      <FieldLabel f={f} htmlFor={id} extra={<Counter text={text} max={f.max} />} />
      {f.kind === "textarea" ? (
        <textarea id={id} rows={f.rows ?? 3} value={text} readOnly={f.readOnly} onChange={(e) => onChange(e.target.value)} className={inputCls} dir={f.ltr ? "ltr" : undefined} />
      ) : (
        <input
          id={id}
          type={f.kind === "date" ? "date" : "text"}
          inputMode={f.inputMode}
          value={f.kind === "date" ? text.slice(0, 10) : text}
          readOnly={f.readOnly}
          dir={f.ltr ? "ltr" : undefined}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputCls} ${f.kind === "date" ? "max-w-52" : ""}`}
          aria-describedby={f.help ? `${id}-help` : undefined}
        />
      )}
      <Help f={f} id={`${id}-help`} />
      <FieldIssues path={f.path} />
    </div>
  );
}
