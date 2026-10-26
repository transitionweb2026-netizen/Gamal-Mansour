import type { MetadataRoute } from "next";
import { localeInfo, localePath, locales } from "@/lib/i18n";
import { absoluteUrl } from "@/lib/content/access";
import { getSite } from "@/lib/content/store";
import { pageRegistry } from "@/lib/cms/registry";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const site = getSite();
  const pagePaths = pageRegistry.filter((p) => !p.template && !site.pages[p.id].seo.noindex).map((p) => p.route);
  const articlePaths = site.collections.articles.filter((a) => a.visible).map((a) => `articles/${a.slug}`);
  const lastModified = site.meta.generatedAt ? new Date(site.meta.generatedAt) : new Date();

  return [...pagePaths, ...articlePaths].flatMap((path) =>
    locales.map((lang) => ({
      url: absoluteUrl(localePath(lang, path)),
      lastModified,
      changeFrequency: path === "" ? ("monthly" as const) : ("yearly" as const),
      priority: path === "" ? 1 : path.startsWith("articles/") ? 0.6 : 0.8,
      alternates: {
        languages: Object.fromEntries(locales.map((l) => [localeInfo[l].hreflang, absoluteUrl(localePath(l, path))])),
      },
    })),
  );
}
