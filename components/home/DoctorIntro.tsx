import { HeartHandshake } from "lucide-react";
import { ButtonLink } from "@/components/Button";
import { PortraitFrame } from "@/components/PortraitFrame";
import { SectionHeading } from "@/components/SectionHeading";
import { home } from "@/content/home";
import { site } from "@/content/site";
import { localePath, type Locale } from "@/lib/i18n";

export function DoctorIntro({ lang }: { lang: Locale }) {
  const t = home[lang].intro;
  return (
    <section aria-labelledby="intro-title" className="surface-lilac section-y relative isolate overflow-hidden">
      <div aria-hidden="true" className="absolute -top-40 -end-40 -z-10 size-[34rem] rounded-full bg-[radial-gradient(closest-side,rgb(220_0_56/0.16),transparent)]" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 grain opacity-[0.22]" />
      <div className="shell grid items-center gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div className="reveal relative">
          <PortraitFrame lang={lang} caption={t.frameCaption} idSuffix="home" />
          <figure className="glass glass-edge absolute -top-8 end-0 max-w-[17rem] rounded-3xl p-5 shadow-lift sm:-end-6 lg:-end-10">
            <figcaption className="flex items-center gap-2 text-xs font-semibold text-crimson-600">
              <HeartHandshake className="size-4" aria-hidden="true" />
              {t.quoteLabel}
            </figcaption>
            <p className="mt-2 text-[0.98rem] font-semibold text-plum-800">{t.quote}</p>
          </figure>
        </div>

        <div className="pt-6 lg:pt-0">
          <SectionHeading id="intro-title" eyebrow={t.eyebrow} title={t.title} />
          <div className="reveal mt-6 space-y-4 text-[1.06rem] text-ink-700 [--reveal-delay:120ms]">
            {t.paragraphs.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </div>
          <div className="reveal mt-9 flex flex-wrap items-center gap-6 [--reveal-delay:200ms]">
            <ButtonLink href={localePath(lang, "about")} variant="plum">
              {t.cta}
            </ButtonLink>
            <p className="font-[family-name:var(--font-heading)] text-2xl font-bold text-brand-gradient">{site.doctor[lang]}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
