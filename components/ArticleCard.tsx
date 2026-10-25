import Link from "next/link";
import { ArrowUpRight, Clock3 } from "lucide-react";
import { Photo } from "@/components/Photo";
import { common } from "@/content/common";
import type { Article } from "@/content/articles";
import { formatDate, localePath, type Locale } from "@/lib/i18n";

type Variant = "feature" | "standard" | "compact";

/** Article teaser. The whole card is one link; the title is the accessible name. */
export function ArticleCard({ article, lang, variant = "standard", headingLevel = 3, className = "" }: {
  article: Article;
  lang: Locale;
  variant?: Variant;
  headingLevel?: 2 | 3;
  className?: string;
}) {
  const t = common[lang];
  const H = headingLevel === 2 ? "h2" : "h3";
  const href = localePath(lang, `articles/${article.slug}`);

  if (variant === "compact") {
    return (
      <article className={`group glass glass-edge sheen relative flex gap-4 rounded-[1.75rem] p-3 transition-transform duration-500 hover:-translate-y-1 ${className}`}>
        <div className="relative aspect-square w-28 shrink-0 overflow-hidden rounded-[1.25rem] sm:w-36">
          <Photo name={article.image} alt="" sizes="144px" className="size-full object-cover transition-transform duration-700 group-hover:scale-105" />
        </div>
        <div className="flex min-w-0 flex-col justify-center py-1 pe-2">
          <p className="eyebrow text-crimson-600">{article.category[lang]}</p>
          <H className="mt-1.5 text-[1.05rem] font-bold text-plum-800">
            <Link href={href} className="after:absolute after:inset-0 after:rounded-[1.75rem] focus-visible:outline-none">
              {article.title[lang]}
            </Link>
          </H>
          <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-ink-500">
            <Clock3 className="size-3.5" aria-hidden="true" />
            {t.minutesRead(article.readingMinutes)}
          </p>
        </div>
      </article>
    );
  }

  const feature = variant === "feature";
  return (
    <article
      className={`group glass glass-edge sheen relative flex flex-col overflow-hidden rounded-[2rem] transition-[transform,box-shadow] duration-500 hover:-translate-y-1.5 hover:shadow-lift has-[a:focus-visible]:outline-3 has-[a:focus-visible]:outline-crimson ${className}`}
    >
      <div className={`relative overflow-hidden ${feature ? "aspect-[16/10] lg:aspect-[16/9]" : "aspect-[16/10]"}`}>
        <Photo
          name={article.image}
          alt={article.imageAlt[lang]}
          sizes={feature ? "(min-width: 1024px) 720px, 100vw" : "(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"}
          className="size-full object-cover transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-plum-900/45 via-transparent to-transparent" />
        <span className="glass-dark absolute start-4 top-4 rounded-full px-3.5 py-1.5 text-xs font-semibold text-white">{article.category[lang]}</span>
      </div>
      <div className={`flex flex-1 flex-col ${feature ? "p-7 sm:p-8" : "p-6"}`}>
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-500">
          <time dateTime={article.published}>{formatDate(article.published, lang)}</time>
          <span aria-hidden="true" className="size-1 rounded-full bg-crimson/60" />
          <span className="inline-flex items-center gap-1.5">
            <Clock3 className="size-3.5" aria-hidden="true" />
            {t.minutesRead(article.readingMinutes)}
          </span>
        </p>
        <H className={`mt-3 font-bold text-plum-800 ${feature ? "text-[clamp(1.4rem,2.4vw,1.9rem)]" : "text-[1.2rem]"}`}>
          <Link href={href} className="after:absolute after:inset-0 after:rounded-[2rem] focus-visible:outline-none">
            {article.title[lang]}
          </Link>
        </H>
        <p className={`mt-3 text-ink-700 ${feature ? "text-[1.05rem]" : "line-clamp-3 text-[0.98rem]"}`}>{article.excerpt[lang]}</p>
        <span aria-hidden="true" className="mt-auto inline-flex items-center gap-2 pt-6 font-semibold text-crimson-600">
          {t.readArticle}
          <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5" />
        </span>
      </div>
    </article>
  );
}
