import { Award, Briefcase, Ear, Handshake, Info, Lightbulb, Quote, Users } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { PortraitFrame } from "@/components/PortraitFrame";
import { SectionHeading } from "@/components/SectionHeading";
import { IconTile } from "@/components/ServiceIcon";
import type { SectionProps } from "@/components/sections/types";
import type { aboutBio, aboutCredentials, aboutExpect, aboutHero, aboutPractice, aboutPrinciples } from "@/content/defaults";
import { sectionFor, settingsFor } from "@/lib/content/access";
import { logoAsset } from "@/lib/content/brand";

export function AboutHero({ lang, c, sectionId }: SectionProps<typeof aboutHero>) {
  return (
    <PageHero
      lang={lang}
      sectionId={sectionId}
      eyebrow={c.eyebrow}
      title={c.title}
      lead={c.lead}
      crumbs={[{ label: c.eyebrow }]}
      image={c.image}
      imageAlt={c.imageAlt}
      focus={c.imageFocus}
      mirror
    />
  );
}

function hasCredentials(lang: SectionProps<unknown>["lang"]) {
  const cred = sectionFor<typeof aboutCredentials>("about", "credentials", lang);
  return cred.credentials.some((x) => x.title) || cred.experience.some((x) => x.title);
}

export function AboutBio({ lang, c, sectionId }: SectionProps<typeof aboutBio>) {
  return (
    <section id={sectionId} aria-labelledby={`${sectionId}-title`} className="surface-blush section-y relative isolate overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0 -z-10 grain opacity-20" />
      <div aria-hidden="true" className="absolute -top-32 -start-32 -z-10 size-[30rem] rounded-full bg-[radial-gradient(closest-side,rgb(60_0_96/0.14),transparent)]" />
      <div className="shell grid items-center gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
        <div>
          <SectionHeading id={`${sectionId}-title`} eyebrow={c.eyebrow} title={c.title} />
          <div className="reveal mt-6 space-y-5 text-[1.08rem] text-ink-700">
            {c.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          {!hasCredentials(lang) && c.note ? (
            <p className="reveal mt-8 flex gap-3 rounded-2xl border border-plum-700/10 bg-white/50 p-4 text-sm text-ink-700">
              <Info className="mt-0.5 size-4 shrink-0 text-plum-500" aria-hidden="true" />
              {c.note}
            </p>
          ) : null}
        </div>
        <div className="reveal">
          <PortraitFrame lang={lang} idSuffix={sectionId} />
        </div>
      </div>
    </section>
  );
}

/** Verified qualifications and experience. Renders nothing while both lists are empty. */
export function AboutCredentials({ c, sectionId }: SectionProps<typeof aboutCredentials>) {
  const blocks = [
    { title: c.credentialsTitle, items: c.credentials.filter((x) => x.title), icon: Award },
    { title: c.experienceTitle, items: c.experience.filter((x) => x.title), icon: Briefcase },
  ].filter((b) => b.items.length > 0);
  if (!blocks.length) return null;

  return (
    <section id={sectionId} aria-label={blocks.map((b) => b.title).join(" · ")} className="surface-lilac section-y">
      <div className="shell grid gap-6 md:grid-cols-2">
        {blocks.map((block) => {
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
                {block.items.map((item, i) => (
                  <li key={i} className="border-s-2 border-crimson/40 ps-4">
                    <p className="font-semibold text-plum-800">{item.title}</p>
                    {item.detail ? <p className="text-sm text-ink-500">{item.detail}</p> : null}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}

const principleIcons = [Ear, Lightbulb, Handshake];

export function AboutPrinciples({ c, sectionId }: SectionProps<typeof aboutPrinciples>) {
  return (
    <section id={sectionId} data-surface="dark" aria-labelledby={`${sectionId}-title`} className="surface-plum section-y relative isolate overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0 -z-10 dots-light opacity-15" />
      <div className="shell">
        <SectionHeading id={`${sectionId}-title`} eyebrow={c.eyebrow} title={c.title} tone="dark" align="center" />
        <ul className="mt-14 grid gap-5 md:grid-cols-3">
          {c.items.map((item, i) => {
            const Icon = principleIcons[i % principleIcons.length];
            return (
              <li key={i} className="reveal glass-dark glass-edge-dark rounded-[2rem] p-8" style={{ "--reveal-delay": `${i * 110}ms` } as React.CSSProperties}>
                <span className="grid size-14 place-items-center rounded-2xl bg-[linear-gradient(140deg,var(--color-crimson),#a3005a)] shadow-glow-crimson">
                  <Icon className="size-6" aria-hidden="true" />
                </span>
                <h3 className="mt-6 text-xl font-bold">{item.title}</h3>
                <p className="mt-2.5 text-plum-100/80">{item.text}</p>
              </li>
            );
          })}
        </ul>
        {c.quote ? (
          <figure className="reveal mx-auto mt-16 max-w-3xl text-center">
            <Quote className="mx-auto size-10 text-crimson-300 rtl:-scale-x-100" aria-hidden="true" />
            <blockquote className="mt-5 font-[family-name:var(--font-heading)] text-[clamp(1.4rem,3vw,2.1rem)] leading-snug font-bold text-glow-gradient">
              {c.quote}
            </blockquote>
            {c.quoteCaption ? <figcaption className="mt-4 text-plum-100/75">{c.quoteCaption}</figcaption> : null}
          </figure>
        ) : null}
      </div>
    </section>
  );
}

export function AboutExpect({ c, sectionId }: SectionProps<typeof aboutExpect>) {
  return (
    <section id={sectionId} aria-labelledby={`${sectionId}-title`} className="surface-dawn section-y relative isolate overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0 -z-10 dots opacity-25 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <div className="shell">
        <SectionHeading id={`${sectionId}-title`} eyebrow={c.eyebrow} title={c.title} lead={c.lead} />
        <ol className="relative mt-12 grid gap-5 lg:grid-cols-3">
          {c.steps.map((step, i) => (
            <li key={i} className="reveal glass glass-edge relative rounded-[2rem] p-7 pt-16" style={{ "--reveal-delay": `${i * 110}ms` } as React.CSSProperties}>
              <span aria-hidden="true" className="absolute top-6 start-7 font-[family-name:var(--font-heading)] text-sm font-bold text-crimson-600 tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span aria-hidden="true" className="absolute top-8 start-16 end-7 h-px bg-gradient-to-r from-crimson/50 to-plum/10 rtl:bg-gradient-to-l" />
              <h3 className="text-xl font-bold text-plum-800">{step.title}</h3>
              <p className="mt-2.5 text-ink-700">{step.text}</p>
            </li>
          ))}
        </ol>
        {c.bring ? (
          <p className="reveal mt-8 flex items-start gap-4 rounded-[1.75rem] bg-plum-700 p-6 text-white shadow-glow-plum sm:items-center">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-white/15">
              <Users className="size-5" aria-hidden="true" />
            </span>
            {c.bring}
          </p>
        ) : null}
      </div>
    </section>
  );
}

export function AboutPractice({ lang, c, sectionId }: SectionProps<typeof aboutPractice>) {
  const s = settingsFor(lang);
  const logo = logoAsset();
  return (
    <section id={sectionId} aria-labelledby={`${sectionId}-title`} className="surface-lilac relative isolate overflow-hidden py-16 sm:py-20">
      <div className="shell">
        <div className="reveal glass glass-edge flex flex-col items-start gap-8 rounded-[2.5rem] p-8 sm:p-10 md:flex-row md:items-center">
          <div className="shrink-0 rounded-3xl bg-[linear-gradient(140deg,#fff,var(--color-blush))] p-5 shadow-glass">
            {/* eslint-disable-next-line @next/next/no-img-element -- static export */}
            <img src={logo.src} width={logo.width} height={logo.height} alt={s.brand} className="h-20 w-auto" loading="lazy" />
          </div>
          <div>
            <p className="eyebrow text-crimson-600">{c.eyebrow}</p>
            <h2 id={`${sectionId}-title`} className="mt-2 text-2xl font-bold text-plum-800">
              {c.title}
            </h2>
            <p className="mt-3 max-w-2xl text-ink-700">{c.text}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
