import type { Metadata } from "next";
import { localeInfo, localePath, locales, otherLocale, type Locale } from "@/lib/i18n";
import { site } from "@/content/site";

export const absoluteUrl = (path: string) => `${site.url}${path}`;

/** hreflang alternates for a route that exists in every locale. */
export function languageAlternates(path: string) {
  const languages: Record<string, string> = {};
  for (const l of locales) languages[localeInfo[l].hreflang] = absoluteUrl(localePath(l, path));
  languages["x-default"] = absoluteUrl(localePath("ar", path));
  return languages;
}

/**
 * Page metadata with canonical URL, hreflang alternates, Open Graph and Twitter cards.
 * `path` is locale-less, e.g. "" for home or "articles/my-slug".
 */
export function pageMetadata({
  lang,
  path,
  title,
  description,
  image = "/og/og-default.jpg",
  type = "website",
  publishedTime,
  absoluteTitle,
}: {
  lang: Locale;
  path: string;
  title?: string;
  /** Full title used verbatim (no template), e.g. for the home page. */
  absoluteTitle?: string;
  description: string;
  image?: string;
  type?: "website" | "article";
  publishedTime?: string;
}): Metadata {
  const url = absoluteUrl(localePath(lang, path));
  const fullTitle = absoluteTitle ?? (title ? `${title} | ${site.doctor[lang]}` : `${site.doctor[lang]} | ${site.brand[lang]}`);
  return {
    title: title && !absoluteTitle ? title : { absolute: fullTitle },
    description,
    alternates: { canonical: url, languages: languageAlternates(path) },
    openGraph: {
      type,
      url,
      title: fullTitle,
      description,
      siteName: site.brand[lang],
      locale: localeInfo[lang].ogLocale,
      alternateLocale: [localeInfo[otherLocale(lang)].ogLocale],
      images: [{ url: image, width: 1200, height: 630, alt: site.brand[lang] }],
      ...(publishedTime ? { publishedTime } : {}),
    },
    twitter: { card: "summary_large_image", title: fullTitle, description, images: [image] },
  };
}

/** Safe JSON-LD serialisation (escapes `<` to prevent script injection). */
export function jsonLd(data: unknown) {
  return { __html: JSON.stringify(data).replace(/</g, "\\u003c") };
}
