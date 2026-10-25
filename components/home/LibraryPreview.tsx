import { ArticleCard } from "@/components/ArticleCard";
import { ButtonLink } from "@/components/Button";
import { SectionHeading } from "@/components/SectionHeading";
import { articles } from "@/content/articles";
import { home } from "@/content/home";
import { localePath, type Locale } from "@/lib/i18n";

export function LibraryPreview({ lang }: { lang: Locale }) {
  const t = home[lang].library;
  const [lead, ...others] = articles;
  const side = others.slice(0, 3);
  if (!lead) return null;

  return (
    <section aria-labelledby="library-title" className="surface-lilac section-y relative isolate overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0 -z-10 dots opacity-25 [mask-image:radial-gradient(60%_60%_at_100%_0%,black,transparent)]" />
      <div className="shell">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading id="library-title" eyebrow={t.eyebrow} title={t.title} lead={t.lead} />
          <ButtonLink href={localePath(lang, "articles")} variant="secondary" size="md" className="reveal self-start md:self-auto">
            {t.cta}
          </ButtonLink>
        </div>
        <div className="mt-12 grid gap-5 lg:grid-cols-[1.25fr_1fr]">
          <ArticleCard article={lead} lang={lang} variant="feature" className="reveal" />
          <div className="flex flex-col gap-4">
            {side.map((a) => (
              <ArticleCard key={a.slug} article={a} lang={lang} variant="compact" className="reveal" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
