import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Award, Briefcase, Ear, Handshake, Info, Lightbulb, Quote, Users } from "lucide-react";
import { hasLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { about, credentials, experience } from "@/content/about";
import { home } from "@/content/home";
import { site } from "@/content/site";
import { PageHero } from "@/components/PageHero";
import { PortraitFrame } from "@/components/PortraitFrame";
import { SectionHeading } from "@/components/SectionHeading";
import { IconTile } from "@/components/ServiceIcon";
import { AppointmentCta } from "@/components/AppointmentCta";

export async function generateMetadata({ params }: PageProps<"/[lang]/about">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = about[lang].meta;
  return pageMetadata({ lang, path: "about", title: t.title, description: t.description });
}

const principleIcons = [Ear, Lightbulb, Handshake];

export default async function AboutPage({ params }: PageProps<"/[lang]/about">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = about[lang];

  const credentialBlocks = [
    { title: t.credentialsTitle, items: credentials, icon: Award },
    { title: t.experienceTitle, items: experience, icon: Briefcase },
  ].filter((b) => b.items.length > 0);

  return (
    <>
      <PageHero
        lang={lang}
        eyebrow={t.hero.eyebrow}
        title={t.hero.title}
        lead={t.hero.lead}
        crumbs={[{ label: t.hero.eyebrow }]}
        photo="or-monochrome"
        photoAlt={t.hero.imageAlt}
        focus="50% 45%"
        mirror
      >
        <span className="glass-dark glass-edge-dark inline-flex rounded-full px-5 py-2.5 text-sm font-semibold">{t.hero.subtitle}</span>
      </PageHero>

      {/* Biography */}
      <section aria-labelledby="bio-title" className="surface-blush section-y relative isolate overflow-hidden">
        <div aria-hidden="true" className="absolute inset-0 -z-10 grain opacity-20" />
        <div aria-hidden="true" className="absolute -top-32 -start-32 -z-10 size-[30rem] rounded-full bg-[radial-gradient(closest-side,rgb(60_0_96/0.14),transparent)]" />
        <div className="shell grid items-center gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
          <div>
            <SectionHeading id="bio-title" eyebrow={t.bio.eyebrow} title={t.bio.title} />
            <div className="reveal mt-6 space-y-5 text-[1.08rem] text-ink-700">
              {t.bio.paragraphs.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </div>
            {credentialBlocks.length === 0 ? (
              <p className="reveal mt-8 flex gap-3 rounded-2xl border border-plum-700/10 bg-white/50 p-4 text-sm text-ink-700">
                <Info className="mt-0.5 size-4 shrink-0 text-plum-500" aria-hidden="true" />
                {t.bio.note}
              </p>
            ) : null}
          </div>
          <div className="reveal">
            <PortraitFrame lang={lang} caption={home[lang].intro.frameCaption} idSuffix="about" />
          </div>
        </div>
      </section>

      {/* Verified credentials (only rendered when supplied) */}
      {credentialBlocks.length > 0 ? (
        <section aria-label={t.credentialsTitle} className="surface-lilac section-y">
          <div className="shell grid gap-6 md:grid-cols-2">
            {credentialBlocks.map((block) => {
              const Icon = block.icon;
              return (
                <div key={block.title} className="reveal glass glass-edge rounded-[2rem] p-7">
                  <div className="flex items-center gap-4">
                    <IconTile>
                      <Icon className="size-6" aria-hidden="true" />
                    </IconTile>
                    <h2 className="text-xl font-bold text-plum-800">{block.title}</h2>
                  </div>
                  <ul className="mt-6 space-y-4">
                    {block.items.map((item) => (
                      <li key={item.title.en} className="border-s-2 border-crimson/40 ps-4">
                        <p className="font-semibold text-plum-800">{item.title[lang]}</p>
                        <p className="text-sm text-ink-500">{item.detail[lang]}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {/* Principles */}
      <section data-surface="dark" aria-labelledby="principles-title" className="surface-plum section-y relative isolate overflow-hidden">
        <div aria-hidden="true" className="absolute inset-0 -z-10 dots-light opacity-15" />
        <div className="shell">
          <SectionHeading id="principles-title" eyebrow={t.principles.eyebrow} title={t.principles.title} tone="dark" align="center" />
          <ul className="mt-14 grid gap-5 md:grid-cols-3">
            {t.principles.items.map((item, i) => {
              const Icon = principleIcons[i];
              return (
                <li
                  key={item.title}
                  className="reveal glass-dark glass-edge-dark rounded-[2rem] p-8"
                  style={{ "--reveal-delay": `${i * 110}ms` } as React.CSSProperties}
                >
                  <span className="grid size-14 place-items-center rounded-2xl bg-[linear-gradient(140deg,var(--color-crimson),#a3005a)] shadow-glow-crimson">
                    <Icon className="size-6" aria-hidden="true" />
                  </span>
                  <h3 className="mt-6 text-xl font-bold">{item.title}</h3>
                  <p className="mt-2.5 text-plum-100/80">{item.text}</p>
                </li>
              );
            })}
          </ul>
          <figure className="reveal mx-auto mt-16 max-w-3xl text-center">
            <Quote className="mx-auto size-10 text-crimson-300 rtl:-scale-x-100" aria-hidden="true" />
            <blockquote className="mt-5 text-[clamp(1.4rem,3vw,2.1rem)] font-bold leading-snug text-glow-gradient font-[family-name:var(--font-heading)]">
              {t.principles.quote}
            </blockquote>
            <figcaption className="mt-4 text-plum-100/75">{t.principles.quoteCaption}</figcaption>
          </figure>
        </div>
      </section>

      {/* First consultation */}
      <section aria-labelledby="expect-title" className="surface-dawn section-y relative isolate overflow-hidden">
        <div aria-hidden="true" className="absolute inset-0 -z-10 dots opacity-25 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
        <div className="shell">
          <SectionHeading id="expect-title" eyebrow={t.expect.eyebrow} title={t.expect.title} lead={t.expect.lead} />
          <ol className="relative mt-12 grid gap-5 lg:grid-cols-3">
            {t.expect.steps.map((step, i) => (
              <li
                key={step.title}
                className="reveal glass glass-edge relative rounded-[2rem] p-7 pt-16"
                style={{ "--reveal-delay": `${i * 110}ms` } as React.CSSProperties}
              >
                <span
                  aria-hidden="true"
                  className="absolute top-6 start-7 font-[family-name:var(--font-heading)] text-sm font-bold text-crimson-600 tabular-nums"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span aria-hidden="true" className="absolute top-8 start-16 end-7 h-px bg-gradient-to-r from-crimson/50 to-plum/10 rtl:bg-gradient-to-l" />
                <h3 className="text-xl font-bold text-plum-800">{step.title}</h3>
                <p className="mt-2.5 text-ink-700">{step.text}</p>
              </li>
            ))}
          </ol>
          <p className="reveal mt-8 flex items-start gap-4 rounded-[1.75rem] bg-plum-700 p-6 text-white shadow-glow-plum sm:items-center">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-white/15">
              <Users className="size-5" aria-hidden="true" />
            </span>
            {t.expect.bring}
          </p>
        </div>
      </section>

      {/* Practice identity */}
      <section aria-labelledby="practice-title" className="surface-lilac relative isolate overflow-hidden py-16 sm:py-20">
        <div className="shell">
          <div className="reveal glass glass-edge flex flex-col items-start gap-8 rounded-[2.5rem] p-8 sm:p-10 md:flex-row md:items-center">
            <div className="shrink-0 rounded-3xl bg-[linear-gradient(140deg,#fff,var(--color-blush))] p-5 shadow-glass">
              {/* eslint-disable-next-line @next/next/no-img-element -- static export */}
              <img src="/brand/logo.png" width={1444} height={675} alt={site.brand[lang]} className="h-20 w-auto" loading="lazy" />
            </div>
            <div>
              <p className="eyebrow text-crimson-600">{t.practice.eyebrow}</p>
              <h2 id="practice-title" className="mt-2 text-2xl font-bold text-plum-800">
                {t.practice.title}
              </h2>
              <p className="mt-3 max-w-2xl text-ink-700">{t.practice.text}</p>
            </div>
          </div>
        </div>
      </section>

      <AppointmentCta lang={lang} />
    </>
  );
}
