import { HeartHandshake } from "lucide-react";
import { ButtonLink } from "@/components/Button";
import { PortraitFrame } from "@/components/PortraitFrame";
import { SectionHeading } from "@/components/SectionHeading";
import type { SectionProps } from "@/components/sections/types";
import type { homeIntro } from "@/content/defaults";
import { settingsFor } from "@/lib/content/access";
import { resolveHref } from "@/lib/cms/links";

export function DoctorIntro({ lang, c, sectionId }: SectionProps<typeof homeIntro>) {
  const s = settingsFor(lang);
  return (
    <section id={sectionId} aria-labelledby={`${sectionId}-title`} className="surface-lilac section-y relative isolate overflow-hidden">
      <div aria-hidden="true" className="absolute -top-40 -end-40 -z-10 size-[34rem] rounded-full bg-[radial-gradient(closest-side,rgb(220_0_56/0.16),transparent)]" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 grain opacity-[0.22]" />
      <div className="shell grid items-center gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div className="reveal relative">
          <PortraitFrame lang={lang} idSuffix={sectionId} />
          {c.quote ? (
            <figure className="glass glass-edge absolute -top-8 end-0 max-w-[17rem] rounded-3xl p-5 shadow-lift sm:-end-6 lg:-end-10">
              <figcaption className="flex items-center gap-2 text-xs font-semibold text-crimson-600">
                <HeartHandshake className="size-4" aria-hidden="true" />
                {c.quoteLabel}
              </figcaption>
              <p className="mt-2 text-[0.98rem] font-semibold text-plum-800">{c.quote}</p>
            </figure>
          ) : null}
        </div>

        <div className="pt-6 lg:pt-0">
          <SectionHeading id={`${sectionId}-title`} eyebrow={c.eyebrow} title={c.title} />
          <div className="reveal mt-6 space-y-4 text-[1.06rem] text-ink-700 [--reveal-delay:120ms]">
            {c.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <div className="reveal mt-9 flex flex-wrap items-center gap-6 [--reveal-delay:200ms]">
            {c.cta ? (
              <ButtonLink href={resolveHref(c.ctaHref, lang)} variant="plum">
                {c.cta}
              </ButtonLink>
            ) : null}
            <p className="font-[family-name:var(--font-heading)] text-2xl font-bold text-brand-gradient">{s.doctor}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
