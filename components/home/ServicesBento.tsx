import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ButtonLink } from "@/components/Button";
import { Photo } from "@/components/Photo";
import { SectionHeading } from "@/components/SectionHeading";
import { IconTile, ServiceIcon } from "@/components/ServiceIcon";
import type { SectionProps } from "@/components/sections/types";
import type { homeServices } from "@/content/defaults";
import { itemsFor } from "@/lib/content/access";
import { resolveHref } from "@/lib/cms/links";
import { localePath } from "@/lib/i18n";

/** Bento layout: one photographic feature card + glass cards (never a uniform grid). */
export function ServicesBento({ lang, c, sectionId }: SectionProps<typeof homeServices>) {
  const services = itemsFor("services", lang);
  if (!services.length) return null;
  const featured = services.find((s) => s.slug === c.featuredSlug) ?? services[0];
  const rest = services.filter((s) => s !== featured);
  const serviceHref = (slug: string) => `${localePath(lang, "services")}#${slug}`;

  return (
    <section id={sectionId} aria-labelledby={`${sectionId}-title`} className="surface-blush section-y relative isolate overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0 -z-10 dots opacity-30 [mask-image:linear-gradient(to_bottom,black,transparent_60%)]" />
      <div aria-hidden="true" className="absolute -bottom-52 -start-40 -z-10 size-[40rem] rounded-full bg-[radial-gradient(closest-side,rgb(60_0_96/0.14),transparent)]" />
      <div className="shell">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading id={`${sectionId}-title`} eyebrow={c.eyebrow} title={c.title} lead={c.lead} />
          {c.cta ? (
            <ButtonLink href={resolveHref(c.ctaHref, lang)} variant="secondary" size="md" className="reveal self-start md:self-auto">
              {c.cta}
            </ButtonLink>
          ) : null}
        </div>

        <ul className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          <li className="reveal md:col-span-2 lg:row-span-2">
            <article data-surface="dark" className="group relative isolate flex h-full min-h-[26rem] overflow-hidden rounded-[2.25rem] bg-plum-900 text-white shadow-lift">
              <Photo
                media={featured.image}
                alt={featured.imageAlt}
                sizes="(min-width: 1024px) 66vw, 100vw"
                className="absolute inset-0 -z-20 size-full object-cover transition-transform duration-[1.6s] ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
              />
              <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgb(20_0_33/0.95)_8%,rgb(44_0_71/0.6)_50%,rgb(220_0_56/0.15)_100%)]" />
              <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(135deg,rgb(220_0_56/0.35),transparent_45%)] mix-blend-screen" />
              <div className="mt-auto flex flex-col p-7 sm:p-10">
                <h3 className="max-w-lg text-[clamp(1.6rem,3vw,2.4rem)] font-bold">
                  <Link href={serviceHref(featured.slug)} className="after:absolute after:inset-0 focus-visible:outline-none">
                    {featured.title}
                  </Link>
                </h3>
                <p className="mt-3 max-w-lg text-white/85">{featured.short}</p>
                <span aria-hidden="true" className="mt-7 grid size-12 place-items-center rounded-full bg-white text-plum-800 transition-transform duration-500 group-hover:rotate-45 rtl:group-hover:-rotate-45">
                  <ArrowUpRight className="size-5 rtl:-scale-x-100" />
                </span>
              </div>
            </article>
          </li>

          {rest.map((s, i) => (
            <li key={s.id} className="reveal md:last:col-span-2 lg:last:col-span-1" style={{ "--reveal-delay": `${(i % 3) * 90}ms` } as React.CSSProperties}>
              <article className="group glass glass-edge sheen relative flex h-full flex-col rounded-[2rem] p-6 transition-[transform,box-shadow] duration-500 hover:-translate-y-1.5 hover:shadow-lift sm:p-7">
                <div className="flex items-start justify-between gap-4">
                  <IconTile tone={i % 2 === 0 ? "crimson" : "plum"}>
                    <ServiceIcon name={s.icon} />
                  </IconTile>
                  <span aria-hidden="true" className="font-[family-name:var(--font-heading)] text-sm font-bold text-plum-300 tabular-nums">
                    {String(i + 2).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="mt-6 text-[1.18rem] font-bold text-plum-800">
                  <Link href={serviceHref(s.slug)} className="after:absolute after:inset-0 after:rounded-[2rem] focus-visible:outline-none">
                    {s.title}
                  </Link>
                </h3>
                <p className="mt-2.5 line-clamp-3 text-[0.97rem] text-ink-700">{s.short}</p>
                <span aria-hidden="true" className="mt-auto inline-flex pt-5 text-crimson-600">
                  <ArrowUpRight className="size-5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5" />
                </span>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
