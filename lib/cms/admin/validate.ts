import { isLText } from "@/lib/cms/core";
import { validateHref } from "@/lib/cms/links";
import type { Field } from "@/lib/cms/admin/fields";

export type Issue = { path: string; label: string; message: string; severity: "error" | "warning" };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const E164 = /^\+[1-9]\d{6,14}$/;
const DIGITS = /^[1-9]\d{6,14}$/;
const FOCUS = /^\d{1,3}% \d{1,3}%$/;
export const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/**
 * Validates a document against its fields. Errors block saving; warnings (length guidance,
 * missing alt text) are shown but do not block.
 */
export function validateDoc(fields: Field[], value: Record<string, unknown>, ctx: { mediaExists?: (ref: string) => boolean } = {}, trail = ""): Issue[] {
  const issues: Issue[] = [];
  for (const f of fields) {
    const v = value?.[f.key];
    const where = trail ? `${trail} › ${f.label}` : f.label;
    issues.push(...validateField(f, v, where, ctx));
  }
  return issues;
}

function validateField(f: Field, v: unknown, where: string, ctx: { mediaExists?: (ref: string) => boolean }): Issue[] {
  const out: Issue[] = [];
  const err = (message: string) => out.push({ path: f.path, label: where, message, severity: "error" });
  const warn = (message: string) => out.push({ path: f.path, label: where, message, severity: "warning" });

  if (f.kind === "group") return validateDoc(f.fields ?? [], (v ?? {}) as Record<string, unknown>, ctx, where);

  if (f.kind === "list") {
    const list = Array.isArray(v) ? v : [];
    list.forEach((item, i) => {
      const itemWhere = `${where} ${i + 1}`;
      if (f.fields) out.push(...validateDoc(f.fields, (item ?? {}) as Record<string, unknown>, ctx, itemWhere));
      else if (f.item) out.push(...validateField(f.item, item, itemWhere, ctx));
    });
    return out;
  }

  if (f.localized && isLText(v)) {
    for (const lang of ["ar", "en"] as const) {
      const text = v[lang];
      const name = lang === "ar" ? "Arabic" : "English";
      if (f.required && !text.trim()) err(`${name} text is required.`);
      if (f.max && text.length > f.max) warn(`${name} text is ${text.length} characters; about ${f.max} or fewer fits the layout best.`);
      if (/<\s*script/i.test(text)) err(`${name} text cannot contain scripts.`);
    }
    if (v.ar.trim() && !v.en.trim()) warn("English text is empty.");
    if (v.en.trim() && !v.ar.trim()) warn("Arabic text is empty.");
    if (/Alt$/.test(f.key) && !v.ar.trim() && !v.en.trim()) warn("Add a short description of the image for screen readers.");
    return out;
  }

  if (typeof v === "string") {
    const text = v.trim();
    if (f.kind === "url") {
      const message = validateHref(text, { allowEmpty: !f.required });
      if (message) err(message);
    } else if (f.kind === "media") {
      if (text && ctx.mediaExists && !ctx.mediaExists(text)) err("The selected file no longer exists. Choose another.");
    } else if (f.kind === "date") {
      if (text && Number.isNaN(Date.parse(text))) err("Enter a valid date.");
    } else if (f.key === "email" && text && !EMAIL.test(text)) err("Enter a valid email address.");
    else if (f.key === "phone" && text && !E164.test(text.replace(/[\s()-]/g, ""))) err("Use international format, e.g. +201234567890.");
    else if (f.key === "whatsapp" && text && !DIGITS.test(text.replace(/\D/g, ""))) err("Use digits in international format, e.g. 201234567890.");
    else if (f.key === "imageFocus" && text && !FOCUS.test(text)) err("Use two percentages, e.g. 50% 40%.");
    else if (f.key === "youtubeId" && text && !/^[\w-]{6,20}$/.test(text)) err("Enter only the video ID, not the full link.");
    else if (f.key === "id" && f.path.includes("categories") && !SLUG.test(text)) err("Use lowercase letters, numbers and dashes.");
    if (f.required && !text) err("Required.");
    if (f.max && text.length > f.max) warn(`${text.length} characters; about ${f.max} or fewer fits best.`);
  }

  if (f.kind === "number" && typeof v === "number") {
    if (f.min !== undefined && v < f.min) err(`Must be at least ${f.min}.`);
    if (f.maxValue !== undefined && v > f.maxValue) err(`Must be at most ${f.maxValue}.`);
  }
  return out;
}

export function validateSlug(slug: string, taken: string[]): string | null {
  if (!slug) return "A slug is required.";
  if (!SLUG.test(slug)) return "Use lowercase letters, numbers and single dashes (e.g. heart-valve-repair).";
  if (taken.includes(slug)) return "Another item already uses this slug.";
  return null;
}

/** Extra rules for collection items. */
export function validateItem(collection: string, doc: Record<string, unknown>): Issue[] {
  const issues: Issue[] = [];
  const title = doc.title as { ar?: string; en?: string } | undefined;
  if (["services", "articles", "videos"].includes(collection) && title && (!title.ar?.trim() || !title.en?.trim())) {
    issues.push({ path: "title", label: "Title", message: "A title is required in both languages.", severity: "error" });
  }
  if (collection === "faqs") {
    const q = doc.question as { ar?: string; en?: string } | undefined;
    if (!q?.ar?.trim() || !q?.en?.trim()) issues.push({ path: "question", label: "Question", message: "The question is required in both languages.", severity: "error" });
  }
  if (collection === "reviews") {
    const quote = doc.quote as { ar?: string; en?: string } | undefined;
    if (!quote?.ar?.trim() && !quote?.en?.trim()) issues.push({ path: "quote", label: "Quote", message: "Enter the patient's words.", severity: "error" });
  }
  if (collection === "videos") {
    const type = doc.sourceType;
    if (type === "youtube" && !String(doc.youtubeId ?? "").trim()) issues.push({ path: "youtubeId", label: "YouTube video ID", message: "Required for a YouTube video.", severity: "warning" });
    if (type === "file" && !String(doc.file ?? "").trim()) issues.push({ path: "file", label: "Video file", message: "Choose or upload a video file.", severity: "warning" });
    if (type === "url" && !/^https:\/\//i.test(String(doc.url ?? ""))) issues.push({ path: "url", label: "URL", message: "Enter an https:// video URL.", severity: "warning" });
  }
  return issues;
}

/** Publish-time rules (stricter than saving a draft). */
export function publishBlockers(collection: string, doc: Record<string, unknown>): string[] {
  const blockers: string[] = [];
  if (collection === "reviews" && doc.consent !== true) blockers.push("Confirm the patient's written consent before publishing a review.");
  return blockers;
}
