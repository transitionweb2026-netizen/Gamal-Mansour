import type { Metadata } from "next";
import { localize } from "@/lib/cms/core";
import { getPageDef, type PageId } from "@/lib/cms/registry";
import { absoluteUrl, mediaAbsoluteUrl, settingsFor } from "@/lib/content/access";
import { getSite } from "@/lib/content/store";
import { localeInfo, localePath, locales, otherLocale, type Locale } from "@/lib/i18n";

/** hreflang alternates for a route that exists in every locale. */
export function languageAlternates(path: string) {
  const languages: Record<string, string> = {};
  for (const l of locales) languages[localeInfo[l].hreflang] = absoluteUrl(localePath(l, path));
  languages["x-default"] = absoluteUrl(localePath("ar", path));
  return languages;
}

/** Safe JSON-LD serialisation (escapes `<` to prevent script injection). */
export function jsonLd(data: unknown) {
  return { __html: JSON.stringify(data).replace(/</g, "\\u003c") };
}

function withTemplate(title: string, lang: Locale): string {
  const template = settingsFor(lang).seo.titleTemplate;
  return template.includes("%s") ? template.replace("%s", title) : `${title} | ${template}`;
}

function validCanonical(url: string): string | null {
  try {
    const u = new URL(url.trim());
    return u.protocol === "https:" || u.protocol === "http:" ? u.toString() : null;
  } catch {
    return null;
  }
}

type BuildArgs = {
  lang: Locale;
  path: string;
  title: string;
  absoluteTitle?: boolean;
  description: string;
  ogTitle?: string;
  ogDescription?: string;
  image?: string | null;
  type?: "website" | "article";
  publishedTime?: string;
  noindex?: boolean;
  canonical?: string;
};

function buildMetadata(a: BuildArgs): Metadata {
  const s = settingsFor(a.lang);
  const fullTitle = a.absoluteTitle ? a.title : withTemplate(a.title, a.lang);
  const description = a.description || s.seo.defaultDescription;
  const url = absoluteUrl(localePath(a.lang, a.path));
  const image = a.image ?? mediaAbsoluteUrl(getSite().settings.seo.ogImage);
  const canonical = (a.canonical && validCanonical(a.canonical)) || url;
  return {
    title: a.absoluteTitle ? { absolute: fullTitle } : a.title,
    description,
    alternates: { canonical, languages: languageAlternates(a.path) },
    ...(a.noindex ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      type: a.type ?? "website",
      url,
      title: a.ogTitle || fullTitle,
      description: a.ogDescription || description,
      siteName: s.brand,
      locale: localeInfo[a.lang].ogLocale,
      alternateLocale: [localeInfo[otherLocale(a.lang)].ogLocale],
      ...(image ? { images: [{ url: image, alt: s.brand }] } : {}),
      ...(a.publishedTime ? { publishedTime: a.publishedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: a.ogTitle || fullTitle,
      description: a.ogDescription || description,
      ...(image ? { images: [image] } : {}),
    },
  };
}

/** Metadata for a CMS page from its SEO fields (Dashboard › SEO). */
export function pageMetadata(id: PageId, lang: Locale): Metadata {
  const def = getPageDef(id);
  const seo = localize(getSite().pages[id].seo, lang);
  return buildMetadata({
    lang,
    path: def?.route ?? "",
    title: seo.title,
    absoluteTitle: def?.absoluteTitle,
    description: seo.description,
    ogTitle: seo.ogTitle,
    ogDescription: seo.ogDescription,
    image: seo.ogImage ? mediaAbsoluteUrl(seo.ogImage) : null,
    noindex: seo.noindex,
    canonical: seo.canonical,
  });
}

/** Metadata for an article page: article SEO fields, falling back to its title, excerpt and cover. */
export function articleMetadata(slug: string, lang: Locale): Metadata {
  const item = getSite().collections.articles.find((a) => a.slug === slug);
  if (!item) return {};
  const a = localize(item.content, lang);
  return buildMetadata({
    lang,
    path: `articles/${slug}`,
    title: a.seo.title || a.title,
    description: a.seo.description || a.excerpt,
    image: mediaAbsoluteUrl(a.seo.ogImage || a.image),
    type: "article",
    publishedTime: a.published || undefined,
  });
}

export function isNoindex(id: PageId): boolean {
  return Boolean(getSite().pages[id]?.seo.noindex);
}
