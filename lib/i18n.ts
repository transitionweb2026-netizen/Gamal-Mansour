export const locales = ["ar", "en"] as const;
export type Locale = (typeof locales)[number];

/** Arabic is the default presentation language. */
export const defaultLocale: Locale = "ar";

/** A value provided in every supported language. */
export type L10n<T = string> = Record<Locale, T>;

export function hasLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export const localeInfo = {
  ar: { label: "العربية", short: "ع", dir: "rtl", ogLocale: "ar_EG", hreflang: "ar" },
  en: { label: "English", short: "EN", dir: "ltr", ogLocale: "en_US", hreflang: "en" },
} as const satisfies Record<Locale, { label: string; short: string; dir: "rtl" | "ltr"; ogLocale: string; hreflang: string }>;

export function otherLocale(lang: Locale): Locale {
  return lang === "ar" ? "en" : "ar";
}

/**
 * Builds an internal, locale-prefixed path with a trailing slash (matches `trailingSlash: true`).
 * localePath("ar") -> "/ar/", localePath("en", "/articles/x") -> "/en/articles/x/"
 */
export function localePath(lang: Locale, path = ""): string {
  const clean = path.replace(/^\/+|\/+$/g, "");
  return clean ? `/${lang}/${clean}/` : `/${lang}/`;
}

/** Replaces the locale segment of a pathname, keeping the rest of the route. */
export function switchLocalePath(pathname: string, target: Locale): string {
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length && hasLocale(parts[0])) parts.shift();
  return localePath(target, parts.join("/"));
}

export function formatDate(iso: string, lang: Locale): string {
  return new Intl.DateTimeFormat(lang === "ar" ? "ar-EG" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    numberingSystem: "latn",
  }).format(new Date(iso));
}
