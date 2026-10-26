import { ArticleCard } from "@/components/ArticleCard";
import { ButtonLink } from "@/components/Button";
import { SectionHeading } from "@/components/SectionHeading";
import type { SectionProps } from "@/components/sections/types";
import type { homeLibrary } from "@/content/defaults";
import { itemsFor } from "@/lib/content/access";
import { resolveHref } from "@/lib/cms/links";

export function LibraryPreview({ lang, c, sectionId }: SectionProps<typeof homeLibrary>) {
  const [lead, ...others] = itemsFor("articles", lang);
  if (!lead) return null;
  const side = others.slice(0, 3);

  return (
    <section id={sectionId} aria-labelledby={`${sectionId}-title`} className="surface-lilac section-y relative isolate overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0 -z-10 dots opacity-25 [mask-image:radial-gradient(60%_60%_at_100%_0%,black,transparent)]" />
      <div className="shell">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading id={`${sectionId}-title`} eyebrow={c.eyebrow} title={c.title} lead={c.lead} />
          {c.cta ? (
            <ButtonLink href={resolveHref(c.ctaHref, lang)} variant="secondary" size="md" className="reveal self-start md:self-auto">
              {c.cta}
            </ButtonLink>
          ) : null}
        </div>
        <div className={`mt-12 grid gap-5 ${side.length ? "lg:grid-cols-[1.25fr_1fr]" : ""}`}>
          <ArticleCard article={lead} lang={lang} variant="feature" className="reveal" />
          {side.length ? (
            <div className="flex flex-col gap-4">
              {side.map((a) => (
                <ArticleCard key={a.id} article={a} lang={lang} variant="compact" className="reveal" />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
