import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { absoluteUrl, globalFor } from "@/lib/content/access";
import { jsonLd } from "@/lib/seo";
import { localePath, type Locale } from "@/lib/i18n";

export type Crumb = { label: string; path?: string };

/** Visible breadcrumb trail + BreadcrumbList structured data. Last crumb is the current page. */
export function Breadcrumbs({ lang, items, tone = "dark" }: { lang: Locale; items: Crumb[]; tone?: "dark" | "light" }) {
  const t = globalFor("ui", lang);
  const all: Crumb[] = [{ label: t.breadcrumbHome, path: "" }, ...items];
  const Sep = lang === "ar" ? ChevronLeft : ChevronRight;
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: all.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      ...(c.path !== undefined ? { item: absoluteUrl(localePath(lang, c.path)) } : {}),
    })),
  };
  const linkCls = tone === "dark" ? "text-white/75 hover:text-white" : "text-ink-500 hover:text-crimson-600";
  const currentCls = tone === "dark" ? "text-white" : "text-plum-800";

  return (
    <nav aria-label={t.breadcrumbLabel}>
      <ol className="flex flex-wrap items-center gap-1.5 text-sm">
        {all.map((c, i) => {
          const last = i === all.length - 1;
          return (
            <li key={`${c.label}-${i}`} className="flex items-center gap-1.5">
              {last || c.path === undefined ? (
                <span aria-current={last ? "page" : undefined} className={`font-semibold ${currentCls}`}>
                  {c.label}
                </span>
              ) : (
                <Link href={localePath(lang, c.path)} className={`transition-colors ${linkCls}`}>
                  {c.label}
                </Link>
              )}
              {!last ? <Sep className={`size-3.5 ${tone === "dark" ? "text-white/45" : "text-plum-300"}`} aria-hidden="true" /> : null}
            </li>
          );
        })}
      </ol>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(data)} />
    </nav>
  );
}
