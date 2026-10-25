import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarHeart, Clock3, ListChecks, ShieldAlert } from "lucide-react";
import { formatDate, hasLocale, localePath } from "@/lib/i18n";
import { absoluteUrl, jsonLd, pageMetadata } from "@/lib/seo";
import { articles, getArticle } from "@/content/articles";
import { pages } from "@/content/pages";
import { common } from "@/content/common";
import { site } from "@/content/site";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Photo } from "@/components/Photo";
import { ArticleCard } from "@/components/ArticleCard";
import { ButtonLink } from "@/components/Button";
import { EcgLine } from "@/components/EcgLine";

export const dynamicParams = false;

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/articles/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  const article = getArticle(slug);
  if (!hasLocale(lang) || !article) return {};
  const largest = `/images/${article.image}-1080.webp`;
  return pageMetadata({
    lang,
    path: `articles/${slug}`,
    title: article.title[lang],
    description: article.excerpt[lang],
    type: "article",
    publishedTime: article.published,
    image: largest,
  });
}

export default async function ArticlePage({ params }: PageProps<"/[lang]/articles/[slug]">) {
  const { lang, slug } = await params;
  const article = getArticle(slug);
  if (!hasLocale(lang) || !article) notFound();
  const t = pages[lang].articles;
  const c = common[lang];
  const sections = article.sections[lang];
  const anchor = (i: number) => `section-${i + 1}`;

  const related = [
    ...articles.filter((a) => a.slug !== slug && a.category.en === article.category.en),
    ...articles.filter((a) => a.slug !== slug && a.category.en !== article.category.en),
  ].slice(0, 3);

  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title[lang],
    description: article.excerpt[lang],
    inLanguage: lang,
    datePublished: article.published,
    image: absoluteUrl(`/images/${article.image}-1080.webp`),
    mainEntityOfPage: absoluteUrl(localePath(lang, `articles/${slug}`)),
    publisher: { "@type": "Organization", name: site.brand.en, logo: { "@type": "ImageObject", url: absoluteUrl("/brand/logo.png") } },
  };

  return (
    <>
      <article aria-labelledby="article-title">
        <header className="surface-dawn relative isolate overflow-hidden pt-32 pb-12 sm:pt-36">
          <div aria-hidden="true" className="absolute inset-0 -z-10 dots opacity-25 [mask-image:radial-gradient(60%_70%_at_50%_0%,black,transparent)]" />
          <div aria-hidden="true" className="absolute -top-40 -end-24 -z-10 size-[36rem] rounded-full bg-[radial-gradient(closest-side,rgb(220_0_56/0.16),transparent)]" />
          <div className="shell">
            <div className="max-w-4xl">
              <div className="animate-fade">
                <Breadcrumbs lang={lang} tone="light" items={[{ label: t.hero.eyebrow, path: "articles" }, { label: article.title[lang] }]} />
              </div>
              <span className="mt-8 inline-flex animate-rise rounded-full bg-crimson/10 px-3.5 py-1 text-xs font-bold text-crimson-600 [animation-delay:60ms]">
                {article.category[lang]}
              </span>
              <h1 id="article-title" className="mt-4 animate-rise text-[clamp(2rem,4.6vw,3.6rem)] font-bold text-plum-800 [animation-delay:120ms]">
                {article.title[lang]}
              </h1>
              <p className="mt-5 max-w-2xl animate-rise text-[1.15rem] text-ink-700 [animation-delay:180ms]">{article.excerpt[lang]}</p>
              <p className="mt-6 flex animate-rise flex-wrap items-center gap-3 text-sm text-ink-500 [animation-delay:240ms]">
                <span>
                  {t.published} <time dateTime={article.published}>{formatDate(article.published, lang)}</time>
                </span>
                <span aria-hidden="true" className="size-1 rounded-full bg-crimson/60" />
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 className="size-3.5" aria-hidden="true" />
                  {c.minutesRead(article.readingMinutes)}
                </span>
              </p>
            </div>
            <div className="relative mt-10 animate-rise [animation-delay:300ms]">
              <div className="relative aspect-[16/9] overflow-hidden rounded-[2.5rem] shadow-lift sm:aspect-[21/9]">
                <Photo name={article.image} alt={article.imageAlt[lang]} sizes="(min-width: 1344px) 1280px, 100vw" priority className="size-full object-cover saturate-[0.7]" />
                <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(160deg,var(--color-crimson),var(--color-plum))] opacity-25 mix-blend-color" />
                <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(160deg,rgb(220_0_56/0.2),transparent_50%,rgb(60_0_96/0.4))] mix-blend-multiply" />
              </div>
              <EcgLine gradientId="article-ecg" from="#dc0038" to="#3c0060" animate={false} className="pointer-events-none absolute -bottom-7 end-6 h-14 w-1/2 opacity-80" />
            </div>
          </div>
        </header>

        <div className="surface-pearl relative isolate pt-14 pb-20">
          <div className="shell grid gap-12 lg:grid-cols-[minmax(0,1fr)_21rem] lg:gap-16">
            <div className="max-w-prose">
              <div className="prose-heart">
                {sections.map((s, i) => (
                  <section key={s.heading} aria-labelledby={anchor(i)} className="scroll-mt-28">
                    <h2 id={anchor(i)}>{s.heading}</h2>
                    {s.paragraphs.map((p) => (
                      <p key={p.slice(0, 32)}>{p}</p>
                    ))}
                    {s.bullets ? (
                      <ul>
                        {s.bullets.map((b) => (
                          <li key={b}>{b}</li>
                        ))}
                      </ul>
                    ) : null}
                  </section>
                ))}
              </div>

              <aside aria-label={t.disclaimerTitle} className="mt-12 flex gap-4 rounded-[1.75rem] border border-crimson/20 bg-crimson-50 p-6">
                <ShieldAlert className="mt-0.5 size-6 shrink-0 text-crimson" aria-hidden="true" />
                <div>
                  <p className="font-bold text-plum-800">{t.disclaimerTitle}</p>
                  <p className="mt-1 text-[0.97rem] text-ink-700">{t.disclaimer}</p>
                  <p className="mt-2 text-[0.97rem] text-ink-700">{c.emergencyText}</p>
                </div>
              </aside>
            </div>

            <aside className="lg:sticky lg:top-28 lg:self-start">
              <div className="glass glass-edge rounded-[2rem] p-6">
                <h2 className="flex items-center gap-2.5 text-sm font-bold text-plum-800">
                  <ListChecks className="size-5 text-crimson" aria-hidden="true" />
                  {t.takeaways}
                </h2>
                <ul className="mt-4 space-y-3">
                  {article.takeaways[lang].map((k) => (
                    <li key={k} className="flex gap-2.5 text-[0.95rem] text-ink-700">
                      <span aria-hidden="true" className="mt-2.5 size-1.5 shrink-0 rounded-full bg-crimson" />
                      {k}
                    </li>
                  ))}
                </ul>
              </div>

              <nav aria-label={t.onThisPage} className="mt-5 rounded-[2rem] border border-plum-700/10 bg-white/50 p-6">
                <h2 className="text-sm font-bold text-plum-800">{t.onThisPage}</h2>
                <ol className="mt-3 space-y-1">
                  {sections.map((s, i) => (
                    <li key={s.heading}>
                      <a href={`#${anchor(i)}`} className="flex min-h-9 items-center gap-2.5 text-[0.93rem] text-ink-700 transition-colors hover:text-crimson-600">
                        <span className="text-xs font-bold text-plum-300 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                        {s.heading}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>

              <div data-surface="dark" className="surface-ember mt-5 rounded-[2rem] p-6">
                <p className="font-bold">{t.questionsTitle}</p>
                <p className="mt-1.5 text-sm text-white/85">{t.questionsText}</p>
                <ButtonLink
                  href={localePath(lang, "contact")}
                  variant="light"
                  size="md"
                  className="mt-5"
                  icon={<CalendarHeart className="size-4" aria-hidden="true" />}
                >
                  {c.bookAppointment}
                </ButtonLink>
              </div>
            </aside>
          </div>
        </div>
      </article>

      <section aria-labelledby="related-title" className="surface-lilac section-y">
        <div className="shell">
          <h2 id="related-title" className="reveal text-[clamp(1.6rem,3vw,2.3rem)] font-bold text-plum-800">
            {t.relatedTitle}
          </h2>
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((a) => (
              <li key={a.slug} className="reveal">
                <ArticleCard article={a} lang={lang} className="h-full" />
              </li>
            ))}
          </ul>
          <ButtonLink href={localePath(lang, "articles")} variant="secondary" size="md" className="reveal mt-10">
            {c.backToLibrary}
          </ButtonLink>
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(schema)} />
    </>
  );
}
