import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Clock3 } from "lucide-react";
import { formatDate, hasLocale, localePath } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { pages } from "@/content/pages";
import { articles } from "@/content/articles";
import { common } from "@/content/common";
import { PageHero } from "@/components/PageHero";
import { Photo } from "@/components/Photo";
import { ArticleCard } from "@/components/ArticleCard";
import { SectionHeading } from "@/components/SectionHeading";
import { AppointmentCta } from "@/components/AppointmentCta";

export async function generateMetadata({ params }: PageProps<"/[lang]/articles">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = pages[lang].articles.meta;
  return pageMetadata({ lang, path: "articles", title: t.title, description: t.description });
}

const topicKey = (label: string) => label.toLowerCase().replace(/[^a-z0-9]+/g, "-");

export default async function ArticlesPage({ params }: PageProps<"/[lang]/articles">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = pages[lang].articles;
  const c = common[lang];
  const [featured, ...rest] = articles;

  const topics = Array.from(new Map(rest.map((a) => [topicKey(a.category.en), a.category[lang]])).entries());
  // Zero-JS topic filter: radio inputs + :has(). Without :has() support every article stays visible.
  const filterCss = topics
    .map(([key]) => `.topic-filter:has(input[value="${key}"]:checked) [data-topic]:not([data-topic="${key}"]){display:none}`)
    .join("");

  return (
    <>
      <PageHero
        lang={lang}
        variant="editorial"
        eyebrow={t.hero.eyebrow}
        title={t.hero.title}
        lead={t.hero.lead}
        crumbs={[{ label: t.hero.eyebrow }]}
        photo="heart-model"
        photoAlt={lang === "ar" ? "مجسّم تشريحي للقلب" : "An anatomical heart model"}
        focus="50% 40%"
      />

      {featured ? (
        <section aria-labelledby="featured-title" className="surface-blush relative isolate overflow-hidden py-16 sm:py-20">
          <div className="shell">
            <p id="featured-title" className="eyebrow reveal text-crimson-600">
              {t.featured}
            </p>
            <article className="group reveal glass glass-edge sheen relative mt-6 grid overflow-hidden rounded-[2.5rem] transition-shadow duration-500 hover:shadow-lift lg:grid-cols-[1.15fr_1fr]">
              <div className="relative aspect-[16/10] overflow-hidden lg:aspect-auto lg:min-h-[26rem]">
                <Photo
                  name={featured.image}
                  alt={featured.imageAlt[lang]}
                  sizes="(min-width: 1024px) 55vw, 100vw"
                  className="absolute inset-0 size-full object-cover transition-transform duration-[1.4s] ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
                />
                <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(160deg,rgb(220_0_56/0.25),transparent_50%,rgb(60_0_96/0.45))] mix-blend-multiply" />
              </div>
              <div className="flex flex-col justify-center p-8 sm:p-12">
                <span className="w-fit rounded-full bg-crimson/10 px-3.5 py-1 text-xs font-bold text-crimson-600">{featured.category[lang]}</span>
                <h2 className="mt-5 text-[clamp(1.6rem,3vw,2.4rem)] font-bold text-plum-800">
                  <Link href={localePath(lang, `articles/${featured.slug}`)} className="after:absolute after:inset-0 focus-visible:outline-none">
                    {featured.title[lang]}
                  </Link>
                </h2>
                <p className="mt-4 text-[1.06rem] text-ink-700">{featured.excerpt[lang]}</p>
                <p className="mt-6 flex flex-wrap items-center gap-3 text-sm text-ink-500">
                  <time dateTime={featured.published}>{formatDate(featured.published, lang)}</time>
                  <span aria-hidden="true" className="size-1 rounded-full bg-crimson/60" />
                  <span className="inline-flex items-center gap-1.5">
                    <Clock3 className="size-3.5" aria-hidden="true" />
                    {c.minutesRead(featured.readingMinutes)}
                  </span>
                </p>
                <span aria-hidden="true" className="mt-8 inline-flex items-center gap-2 font-semibold text-crimson-600">
                  {c.readArticle}
                  <ArrowUpRight className="size-4 rtl:-scale-x-100" />
                </span>
              </div>
            </article>
          </div>
        </section>
      ) : null}

      <section aria-labelledby="all-title" className="surface-lilac section-y relative isolate overflow-hidden">
        <div aria-hidden="true" className="absolute inset-0 -z-10 dots opacity-25 [mask-image:linear-gradient(to_bottom,black,transparent_50%)]" />
        <div className="shell topic-filter">
          <style>{filterCss}</style>
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <SectionHeading id="all-title" title={t.all} />
            <fieldset className="reveal">
              <legend className="sr-only">{t.filterLabel}</legend>
              <div className="flex flex-wrap gap-2">
                {[["all", t.allTopics] as const, ...topics].map(([key, label]) => (
                  <label key={key} className="cursor-pointer">
                    <input type="radio" name="topic" value={key} defaultChecked={key === "all"} className="peer sr-only" />
                    <span className="inline-flex min-h-11 items-center rounded-full bg-white/60 px-4 text-sm font-semibold text-plum-700 ring-1 ring-inset ring-plum-700/10 transition-colors peer-checked:bg-plum-700 peer-checked:text-white peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-crimson hover:bg-white">
                      {label}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((a) => (
              <li key={a.slug} data-topic={topicKey(a.category.en)} className="reveal">
                <ArticleCard article={a} lang={lang} className="h-full" />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <AppointmentCta lang={lang} />
    </>
  );
}
