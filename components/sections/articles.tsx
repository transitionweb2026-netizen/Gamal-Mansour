import Link from "next/link";
import { ArrowUpRight, Clock3 } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { Photo } from "@/components/Photo";
import { ArticleCard } from "@/components/ArticleCard";
import { SectionHeading } from "@/components/SectionHeading";
import type { SectionProps } from "@/components/sections/types";
import type { articlesAll, articlesFeatured, articlesHero } from "@/content/defaults";
import { globalFor, isSectionVisible, itemsFor, minutesRead } from "@/lib/content/access";
import { formatDate, localePath } from "@/lib/i18n";

export function ArticlesHero({ lang, c, sectionId }: SectionProps<typeof articlesHero>) {
  return (
    <PageHero
      lang={lang}
      sectionId={sectionId}
      variant="editorial"
      eyebrow={c.eyebrow}
      title={c.title}
      lead={c.lead}
      crumbs={[{ label: c.eyebrow }]}
      image={c.image}
      imageAlt={c.imageAlt}
      focus={c.imageFocus}
    />
  );
}

export function ArticlesFeatured({ lang, c, sectionId }: SectionProps<typeof articlesFeatured>) {
  const [featured] = itemsFor("articles", lang);
  if (!featured) return null;
  const ui = globalFor("ui", lang);
  return (
    <section id={sectionId} aria-labelledby={`${sectionId}-title`} className="surface-blush relative isolate overflow-hidden py-16 sm:py-20">
      <div className="shell">
        <p id={`${sectionId}-title`} className="eyebrow reveal text-crimson-600">
          {c.label}
        </p>
        <article className="group reveal glass glass-edge sheen relative mt-6 grid overflow-hidden rounded-[2.5rem] transition-shadow duration-500 hover:shadow-lift lg:grid-cols-[1.15fr_1fr]">
          <div className="relative aspect-[16/10] overflow-hidden bg-plum-100 lg:aspect-auto lg:min-h-[26rem]">
            <Photo
              media={featured.image}
              alt={featured.imageAlt}
              sizes="(min-width: 1024px) 55vw, 100vw"
              className="absolute inset-0 size-full object-cover transition-transform duration-[1.4s] ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
            />
            <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(160deg,rgb(220_0_56/0.25),transparent_50%,rgb(60_0_96/0.45))] mix-blend-multiply" />
          </div>
          <div className="flex flex-col justify-center p-8 sm:p-12">
            <span className="w-fit rounded-full bg-crimson/10 px-3.5 py-1 text-xs font-bold text-crimson-600">{featured.category}</span>
            <h2 className="mt-5 text-[clamp(1.6rem,3vw,2.4rem)] font-bold text-plum-800">
              <Link href={localePath(lang, `articles/${featured.slug}`)} className="after:absolute after:inset-0 focus-visible:outline-none">
                {featured.title}
              </Link>
            </h2>
            <p className="mt-4 text-[1.06rem] text-ink-700">{featured.excerpt}</p>
            <p className="mt-6 flex flex-wrap items-center gap-3 text-sm text-ink-500">
              {featured.published ? (
                <>
                  <time dateTime={featured.published}>{formatDate(featured.published, lang)}</time>
                  <span aria-hidden="true" className="size-1 rounded-full bg-crimson/60" />
                </>
              ) : null}
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="size-3.5" aria-hidden="true" />
                {minutesRead(featured.readingMinutes, lang)}
              </span>
            </p>
            <span aria-hidden="true" className="mt-8 inline-flex items-center gap-2 font-semibold text-crimson-600">
              {ui.readArticle}
              <ArrowUpRight className="size-4 rtl:-scale-x-100" />
            </span>
          </div>
        </article>
      </div>
    </section>
  );
}

const topicKey = (label: string) => label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "topic";

/** Remaining articles with a zero-JS topic filter (radio inputs + :has()). */
export function ArticlesAll({ lang, c, sectionId }: SectionProps<typeof articlesAll>) {
  const all = itemsFor("articles", lang);
  // The first article is presented by the "Featured article" section when that section is shown.
  const rest = isSectionVisible("articles", "featured") ? all.slice(1) : all;
  if (!rest.length) return null;
  const english = itemsFor("articles", "en");
  const keyOf = (id: string) => topicKey(english.find((a) => a.id === id)?.category ?? id);
  const topics = Array.from(new Map(rest.map((a) => [keyOf(a.id), a.category])).entries());
  const scope = `topic-filter-${sectionId}`;
  const filterCss = topics
    .map(([key]) => `.${scope}:has(input[value="${key}"]:checked) [data-topic]:not([data-topic="${key}"]){display:none}`)
    .join("");

  return (
    <section id={sectionId} aria-labelledby={`${sectionId}-title`} className="surface-lilac section-y relative isolate overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0 -z-10 dots opacity-25 [mask-image:linear-gradient(to_bottom,black,transparent_50%)]" />
      <div className={`shell ${scope}`}>
        <style>{filterCss}</style>
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <SectionHeading id={`${sectionId}-title`} title={c.title} />
          {topics.length > 1 ? (
            <fieldset className="reveal">
              <legend className="sr-only">{c.filterLabel}</legend>
              <div className="flex flex-wrap gap-2">
                {[["all", c.allTopics] as const, ...topics].map(([key, label]) => (
                  <label key={key} className="cursor-pointer">
                    <input type="radio" name={`${scope}-topic`} value={key} defaultChecked={key === "all"} className="peer sr-only" />
                    <span className="inline-flex min-h-11 items-center rounded-full bg-white/60 px-4 text-sm font-semibold text-plum-700 ring-1 ring-inset ring-plum-700/10 transition-colors peer-checked:bg-plum-700 peer-checked:text-white peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-crimson hover:bg-white">
                      {label}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          ) : null}
        </div>
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((a) => (
            <li key={a.id} data-topic={keyOf(a.id)} className="reveal">
              <ArticleCard article={a} lang={lang} className="h-full" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
