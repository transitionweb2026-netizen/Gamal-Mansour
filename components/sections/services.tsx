import Link from "next/link";
import { BookOpen, CircleCheck, Info } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { Photo } from "@/components/Photo";
import { ButtonLink } from "@/components/Button";
import { IconTile, ServiceIcon } from "@/components/ServiceIcon";
import type { SectionProps } from "@/components/sections/types";
import type { homeServices, servicesDraftNote, servicesHero, servicesIndex, servicesList } from "@/content/defaults";
import { itemsFor, sectionFor } from "@/lib/content/access";
import { resolveHref } from "@/lib/cms/links";
import { localePath } from "@/lib/i18n";

export function ServicesHero({ lang, c, sectionId }: SectionProps<typeof servicesHero>) {
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

/** Sticky row of anchor links to each published service. */
export function ServicesIndex({ lang, c, sectionId }: SectionProps<typeof servicesIndex>) {
  const services = itemsFor("services", lang);
  if (!services.length) return null;
  return (
    <nav id={sectionId} aria-label={c.label} className="surface-pearl sticky top-[4.6rem] z-30 border-b border-plum-700/5 py-3 sm:top-[5.2rem]">
      <div className="shell">
        <ul className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
          {services.map((s) => (
            <li key={s.id} className="shrink-0">
              <a
                href={`#${s.slug}`}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-white/70 px-4 text-sm font-semibold text-plum-700 ring-1 ring-inset ring-plum-700/10 transition-colors hover:bg-crimson hover:text-white"
              >
                <ServiceIcon name={s.icon} className="size-4" />
                {s.title}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

/** Shown while any published service is not marked as verified by the practice. */
export function ServicesDraftNote({ lang, c, sectionId }: SectionProps<typeof servicesDraftNote>) {
  const anyUnverified = itemsFor("services", lang).some((s) => !s.verified);
  if (!anyUnverified || !c.text) return null;
  return (
    <div id={sectionId} className="surface-pearl pt-8">
      <p className="shell flex items-start gap-3 text-sm text-ink-700">
        <Info className="mt-0.5 size-4 shrink-0 text-plum-500" aria-hidden="true" />
        {c.text}
      </p>
    </div>
  );
}

const surfaces = ["surface-blush", "surface-lilac", "surface-pearl"];

/** One anchored section per published service, alternating layouts; the hybrid service is the dark feature. */
export function ServicesList({ lang, c }: SectionProps<typeof servicesList>) {
  const services = itemsFor("services", lang);
  const articles = itemsFor("articles", lang);
  // The featured service (Home › Services overview › Featured service) is also highlighted here.
  const featuredSlug = sectionFor<typeof homeServices>("home", "services", lang).featuredSlug;

  return (
    <>
      {services.map((s, i) => {
        const dark = s.slug === featuredSlug;
        const flip = i % 2 === 1;
        const related = s.related.map((slug) => articles.find((a) => a.slug === slug)).filter((a) => a !== undefined);
        return (
          <section
            key={s.id}
            id={s.slug}
            aria-labelledby={`${s.slug}-title`}
            data-surface={dark ? "dark" : undefined}
            className={`relative isolate scroll-mt-40 overflow-hidden py-16 sm:py-24 ${dark ? "surface-plum" : surfaces[i % surfaces.length]}`}
          >
            <div aria-hidden="true" className={`absolute inset-0 -z-10 ${dark ? "dots-light opacity-15" : "grain opacity-15"}`} />
            <div className="shell grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
              <div className={`reveal relative ${flip ? "lg:order-2" : ""}`}>
                <div
                  aria-hidden="true"
                  className={`absolute -inset-3 -z-10 rounded-[3rem] ${dark ? "bg-[linear-gradient(140deg,var(--color-crimson),transparent_60%)] opacity-50" : "hatch opacity-60"}`}
                />
                <div className="relative aspect-[4/3] overflow-hidden rounded-[2.5rem] bg-plum-100 shadow-lift">
                  <Photo media={s.image} alt={s.imageAlt} sizes="(min-width: 1024px) 45vw, 100vw" className="size-full object-cover saturate-[0.75]" />
                  <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(160deg,var(--color-crimson),var(--color-plum))] opacity-25 mix-blend-color" />
                  <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-plum-900/40 to-transparent" />
                  <span className="glass-dark absolute start-5 top-5 rounded-full px-4 py-1.5 font-[family-name:var(--font-heading)] text-sm font-bold text-white tabular-nums">
                    {String(i + 1).padStart(2, "0")} / {String(services.length).padStart(2, "0")}
                  </span>
                </div>
              </div>

              <div className={flip ? "lg:order-1" : ""}>
                <div className="reveal flex items-center gap-4">
                  <IconTile tone={i % 2 === 0 ? "crimson" : "plum"}>
                    <ServiceIcon name={s.icon} />
                  </IconTile>
                </div>
                <h2 id={`${s.slug}-title`} className={`reveal mt-5 text-[clamp(1.7rem,3.4vw,2.6rem)] font-bold ${dark ? "text-white" : "text-plum-800"}`}>
                  {s.title}
                </h2>
                <p className={`reveal mt-4 text-[1.12rem] font-semibold ${dark ? "text-crimson-200" : "text-crimson-600"}`}>{s.short}</p>
                <div className={`reveal mt-4 space-y-3 ${dark ? "text-plum-100/85" : "text-ink-700"}`}>
                  {s.body.map((p, n) => (
                    <p key={n}>{p}</p>
                  ))}
                </div>

                {s.points.length ? (
                  <div className={`reveal mt-7 rounded-[1.75rem] p-6 ${dark ? "glass-dark glass-edge-dark" : "glass glass-edge"}`}>
                    <h3 className={`text-sm font-bold ${dark ? "text-white" : "text-plum-800"}`}>{c.involves}</h3>
                    <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                      {s.points.map((pt, n) => (
                        <li key={n} className={`flex items-start gap-2.5 text-[0.97rem] ${dark ? "text-plum-100/90" : "text-ink-700"}`}>
                          <CircleCheck className={`mt-1 size-4 shrink-0 ${dark ? "text-crimson-300" : "text-crimson"}`} aria-hidden="true" />
                          {pt}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <div className="reveal mt-7 flex flex-wrap items-center gap-x-6 gap-y-4">
                  {c.ask ? (
                    <ButtonLink href={resolveHref(c.askHref, lang)} variant={dark ? "light" : "primary"} size="md">
                      {c.ask}
                    </ButtonLink>
                  ) : null}
                  {related.length ? (
                    <div className="flex flex-col gap-1">
                      <span className={`text-xs font-semibold ${dark ? "text-plum-200" : "text-ink-500"}`}>{c.related}</span>
                      {related.map((a) => (
                        <Link
                          key={a.id}
                          href={localePath(lang, `articles/${a.slug}`)}
                          className={`inline-flex items-center gap-2 text-sm font-semibold underline-offset-4 hover:underline ${dark ? "text-white" : "text-plum-700"}`}
                        >
                          <BookOpen className="size-4 shrink-0" aria-hidden="true" />
                          {a.title}
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </section>
        );
      })}
    </>
  );
}
