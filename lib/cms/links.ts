import { localePath, type Locale } from "@/lib/i18n";

/**
 * Link values stored in the CMS:
 * - "/contact" or "/articles/my-slug"  → internal page, localized automatically (/ar/contact/)
 * - "/contact#form"                    → internal page with anchor
 * - "#section"                         → anchor on the current page
 * - "https://…", "mailto:…", "tel:…"   → used as-is
 */
export function resolveHref(href: string, lang: Locale): string {
  const value = href.trim();
  if (!value) return localePath(lang);
  if (/^(https?:|mailto:|tel:|#)/i.test(value)) return value;
  if (value.startsWith("/")) {
    if (/^\/(ar|en)(\/|$)/.test(value)) return value;
    const [path, hash] = value.split("#");
    return `${localePath(lang, path)}${hash ? `#${hash}` : ""}`;
  }
  return localePath(lang, value);
}

export function isExternalHref(href: string): boolean {
  return /^(https?:|mailto:|tel:)/i.test(href.trim());
}

/** Validation used by the dashboard before saving a link field. Returns an error message or null. */
export function validateHref(href: string, { allowEmpty = false } = {}): string | null {
  const v = href.trim();
  if (!v) return allowEmpty ? null : "A destination is required.";
  if (/^\s*javascript:/i.test(v) || /^data:/i.test(v)) return "Script and data links are not allowed.";
  if (v.startsWith("/") || v.startsWith("#")) return /\s/.test(v) ? "Internal paths cannot contain spaces." : null;
  if (/^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(v)) return null;
  if (/^tel:\+?[\d\s()-]{5,}$/i.test(v)) return null;
  try {
    const u = new URL(v);
    return u.protocol === "https:" || u.protocol === "http:" ? null : "Use https://, /internal-path, mailto: or tel: links.";
  } catch {
    return "Enter a full URL (https://…), an internal path starting with /, mailto: or tel:.";
  }
}
