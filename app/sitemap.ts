import type { MetadataRoute } from "next";
import { localeInfo, localePath, locales } from "@/lib/i18n";
import { absoluteUrl } from "@/lib/seo";
import { articles } from "@/content/articles";

export const dynamic = "force-static";

const staticPaths = ["", "about", "services", "articles", "videos", "patients", "contact"];

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [...staticPaths, ...articles.map((a) => `articles/${a.slug}`)];
  const lastModified = new Date();

  return paths.flatMap((path) =>
    locales.map((lang) => ({
      url: absoluteUrl(localePath(lang, path)),
      lastModified,
      changeFrequency: path === "" ? "monthly" : "yearly",
      priority: path === "" ? 1 : path.startsWith("articles/") ? 0.6 : 0.8,
      alternates: {
        languages: Object.fromEntries(locales.map((l) => [localeInfo[l].hreflang, absoluteUrl(localePath(l, path))])),
      },
    })),
  );
}
