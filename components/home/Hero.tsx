import { ArrowDown, CalendarHeart, HeartPulse } from "lucide-react";
import { Photo } from "@/components/Photo";
import { ButtonLink } from "@/components/Button";
import { ContactPanel } from "@/components/ContactPanel";
import { EcgLine } from "@/components/EcgLine";
import { home } from "@/content/home";
import { site } from "@/content/site";
import { localePath, type Locale } from "@/lib/i18n";

/**
 * Full-bleed photographic hero. The monochrome photo is toned into a plum → rose duotone with
 * blend layers, then a directional plum gradient secures text contrast on the text side.
 * The photo is mirrored per direction so the surgical team always sits opposite the copy.
 */
export function Hero({ lang }: { lang: Locale }) {
  const t = home[lang].hero;

  return (
    <section
      data-surface="dark"
      aria-labelledby="hero-title"
      className="relative isolate flex min-h-[max(42rem,min(100svh,64rem))] overflow-hidden bg-plum-950 text-white"
    >
      {/* Photographic cover — edge to edge. Blend layers live in the same stacking context as the
          photo so they tone it (a z-indexed wrapper would isolate them and paint flat colour). */}
      <div className="absolute inset-0 -z-20 overflow-hidden">
        <div className="parallax-hero absolute inset-0 origin-top">
          <Photo
            name="hero-team"
            alt={t.imageAlt}
            sizes="100vw"
            priority
            className="size-full object-cover object-[46%_38%] grayscale contrast-[1.15] brightness-[1.15] ltr:-scale-x-100"
          />
        </div>
        <div aria-hidden="true" className="absolute inset-0 bg-[#2a0042] mix-blend-lighten" />
        <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(115deg,#ff9fbb_0%,#f3a0d6_45%,#c3a0ff_100%)] mix-blend-multiply" />
        <div
          aria-hidden="true"
          className="absolute inset-0 mix-blend-screen rtl:bg-[radial-gradient(45%_55%_at_14%_12%,rgb(255_40_100/0.5),transparent_70%)] ltr:bg-[radial-gradient(45%_55%_at_86%_12%,rgb(255_40_100/0.5),transparent_70%)]"
        />
        <div aria-hidden="true" className="absolute inset-0 grain opacity-35 mix-blend-overlay" />
      </div>

      {/* Atmosphere + readability */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        {/* Mobile: bottom-up gradient behind stacked copy */}
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgb(20_0_33/0.96)_0%,rgb(31_0_51/0.74)_40%,rgb(31_0_51/0.12)_70%,rgb(20_0_33/0.3)_100%)] md:hidden" />
        {/* Desktop: side gradient on the text side (start) */}
        <div className="absolute inset-0 hidden md:block ltr:bg-[linear-gradient(90deg,rgb(20_0_33/0.95)_0%,rgb(31_0_51/0.84)_34%,rgb(44_0_71/0.35)_62%,rgb(44_0_71/0.05)_100%)] rtl:bg-[linear-gradient(270deg,rgb(20_0_33/0.95)_0%,rgb(31_0_51/0.84)_34%,rgb(44_0_71/0.35)_62%,rgb(44_0_71/0.05)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-plum-950/80 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-plum-950/70 to-transparent" />
        {/* Crimson bloom behind the copy */}
        <div className="absolute -bottom-48 -start-40 h-[42rem] w-[52rem] rounded-full bg-[radial-gradient(closest-side,rgb(220_0_56/0.42),transparent)]" />
        <div className="absolute inset-0 dots-light opacity-[0.14] [mask-image:linear-gradient(to_bottom,transparent,black_45%,transparent)]" />
      </div>

      {/* Heartbeat trace on the photographic side only, clear of the copy */}
      <EcgLine
        gradientId="hero-ecg"
        delay={700}
        strokeWidth={2}
        className="pointer-events-none absolute end-0 top-[30%] -z-10 hidden h-28 w-[52%] opacity-80 md:block"
      />

      <div className="shell relative flex w-full flex-col justify-end pt-28 pb-8 sm:pb-10 lg:pb-12">
        <div className="max-w-[50rem]">
          <p className="glass-dark glass-edge-dark inline-flex animate-rise items-center gap-2.5 rounded-full py-1.5 ps-1.5 pe-4 text-[0.86rem] font-semibold text-white [animation-delay:60ms]">
            <span className="grid size-7 place-items-center rounded-full bg-crimson shadow-glow-crimson">
              <HeartPulse className="size-4" aria-hidden="true" />
            </span>
            {t.badge}
          </p>

          <h1 id="hero-title" className="mt-5 font-bold">
            <span className="block animate-rise text-[clamp(1.05rem,1.7vw,1.25rem)] font-semibold text-white/85 [animation-delay:140ms]">
              {site.doctor[lang]} <span className="text-crimson-300">—</span> {site.specialty[lang]}
            </span>
            <span className="mt-3 block animate-rise text-[clamp(2.3rem,5.1vw,4.4rem)] leading-[1.08] [animation-delay:220ms] rtl:leading-[1.38]">
              {t.headlineLead}
            </span>
            <span className="block animate-rise pb-1 text-[clamp(2.3rem,5.1vw,4.4rem)] leading-[1.12] [animation-delay:320ms] rtl:leading-[1.42]">
              <span className="text-glow-gradient">{t.headlineAccent}</span>
            </span>
          </h1>

          <p className="mt-5 max-w-xl animate-rise text-[clamp(1.02rem,1.3vw,1.15rem)] text-white/85 [animation-delay:420ms]">{t.lead}</p>

          <div className="mt-7 flex animate-rise flex-wrap gap-3 [animation-delay:520ms]">
            <ButtonLink href={localePath(lang, "contact")} icon={<CalendarHeart className="size-[1.1rem]" aria-hidden="true" />}>
              {t.primary}
            </ButtonLink>
            <ButtonLink href={localePath(lang, "services")} variant="outline-light">
              {t.secondary}
            </ButtonLink>
          </div>
        </div>

        <div className="mt-9 flex animate-rise flex-col gap-6 [animation-delay:640ms] sm:flex-row sm:items-end sm:justify-between lg:mt-11">
          <ContactPanel lang={lang} />

          <div className="hidden items-end gap-4 lg:flex">
            <div className="glass-dark glass-edge-dark flex items-center gap-3 rounded-[1.6rem] p-2.5 pe-5 motion-safe:animate-float">
              <span className="grid size-14 place-items-center rounded-2xl bg-[linear-gradient(140deg,#fff,var(--color-blush))]">
                {/* eslint-disable-next-line @next/next/no-img-element -- static export */}
                <img src="/brand/mark.png" width={512} height={473} alt="" className="h-9 w-auto" />
              </span>
              <span className="leading-tight">
                <span className="block text-[0.95rem] font-bold" lang="en" dir="ltr">
                  {t.cardTitle}
                </span>
                <span className="block text-sm text-white/75">{t.cardText}</span>
              </span>
            </div>
            <a
              href="#practice-info"
              className="group grid size-14 place-items-center rounded-full border border-white/25 text-white/85 transition-colors hover:border-white/60 hover:text-white"
              aria-label={t.scroll}
            >
              <ArrowDown className="size-5 transition-transform duration-500 group-hover:translate-y-1" aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
