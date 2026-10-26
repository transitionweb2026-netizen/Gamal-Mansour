import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";
import { EcgLine } from "@/components/EcgLine";
import { Photo } from "@/components/Photo";
import type { MediaRef } from "@/lib/cms/media";
import type { Locale } from "@/lib/i18n";

type Props = {
  lang: Locale;
  sectionId?: string;
  eyebrow: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  crumbs: Crumb[];
  image: MediaRef;
  imageAlt: string;
  /** "immersive" = full-bleed duotone photo; "editorial" = bright tinted panel with a framed photo. */
  variant?: "immersive" | "editorial";
  /** CSS object-position for the photo. */
  focus?: string;
  /** Mirror the photo in LTR so its subject stays opposite the copy. */
  mirror?: boolean;
  children?: React.ReactNode;
};

export function PageHero({ lang, sectionId, eyebrow, title, lead, crumbs, image, imageAlt, variant = "immersive", focus = "50% 50%", mirror = false, children }: Props) {
  if (variant === "editorial") {
    return (
      <section id={sectionId} aria-labelledby="page-title" className="surface-dawn relative isolate overflow-hidden pt-32 pb-16 sm:pt-36 lg:pb-24">
        <div aria-hidden="true" className="absolute inset-0 -z-10 dots opacity-30 [mask-image:radial-gradient(70%_80%_at_80%_20%,black,transparent)]" />
        <div aria-hidden="true" className="absolute -top-40 -end-24 -z-10 size-[38rem] rounded-full bg-[radial-gradient(closest-side,rgb(220_0_56/0.18),transparent)]" />
        <div aria-hidden="true" className="absolute -bottom-56 -start-32 -z-10 size-[40rem] rounded-full bg-[radial-gradient(closest-side,rgb(60_0_96/0.16),transparent)]" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 grain opacity-20" />
        <div className="shell grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <div>
            <div className="animate-fade">
              <Breadcrumbs lang={lang} items={crumbs} tone="light" />
            </div>
            <p className="eyebrow mt-8 inline-flex animate-rise items-center gap-3 text-crimson-600 [animation-delay:80ms]">
              <span aria-hidden="true" className="h-px w-8 bg-current" />
              {eyebrow}
            </p>
            <h1 id="page-title" className="mt-4 animate-rise text-[clamp(2.2rem,5vw,3.9rem)] font-bold text-plum-800 [animation-delay:160ms]">
              {title}
            </h1>
            {lead ? <p className="mt-5 max-w-xl animate-rise text-[1.12rem] text-ink-700 [animation-delay:240ms]">{lead}</p> : null}
            {children ? <div className="mt-8 animate-rise [animation-delay:320ms]">{children}</div> : null}
          </div>
          <div className="relative mx-auto w-full max-w-md animate-rise [animation-delay:200ms] lg:max-w-none">
            <div aria-hidden="true" className="absolute inset-0 translate-x-3 translate-y-4 rotate-[2.5deg] rounded-[2.5rem] bg-[linear-gradient(140deg,var(--color-crimson),var(--color-plum))] rtl:-translate-x-3 rtl:-rotate-[2.5deg]" />
            <div className="relative aspect-[5/4] overflow-hidden rounded-[2.5rem] bg-plum-900 shadow-lift">
              <Photo media={image} alt={imageAlt} sizes="(min-width: 1024px) 40vw, 90vw" priority className="size-full object-cover" style={{ objectPosition: focus }} />
              <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(160deg,rgb(220_0_56/0.18),transparent_50%,rgb(60_0_96/0.4))] mix-blend-multiply" />
            </div>
            <EcgLine gradientId="page-hero-ecg" from="#dc0038" to="#3c0060" className="pointer-events-none absolute -bottom-8 -start-10 h-16 w-[70%] opacity-80" delay={500} />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id={sectionId}
      data-surface="dark"
      aria-labelledby="page-title"
      className="relative isolate flex min-h-[clamp(32rem,70svh,44rem)] overflow-hidden bg-plum-950 text-white"
    >
      <div className="absolute inset-0 -z-20 overflow-hidden">
        <div className="parallax-hero absolute inset-0 origin-top [--hero-scale:1.06]">
          <Photo
            media={image}
            alt={imageAlt}
            sizes="100vw"
            priority
            className={`size-full object-cover grayscale contrast-[1.15] ${mirror ? "ltr:-scale-x-100" : ""}`}
            style={{ objectPosition: focus }}
          />
        </div>
        <div aria-hidden="true" className="absolute inset-0 bg-[#2a0042] mix-blend-lighten" />
        <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(115deg,#ff9fbb_0%,#f3a0d6_45%,#c3a0ff_100%)] mix-blend-multiply" />
        <div aria-hidden="true" className="absolute inset-0 grain opacity-35 mix-blend-overlay" />
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgb(20_0_33/0.96)_0%,rgb(31_0_51/0.78)_45%,rgb(31_0_51/0.35)_100%)]" />
        <div className="absolute inset-0 hidden md:block ltr:bg-[linear-gradient(90deg,rgb(20_0_33/0.85)_0%,rgb(31_0_51/0.45)_45%,transparent_80%)] rtl:bg-[linear-gradient(270deg,rgb(20_0_33/0.85)_0%,rgb(31_0_51/0.45)_45%,transparent_80%)]" />
        <div className="absolute -bottom-56 -start-40 h-[36rem] w-[46rem] rounded-full bg-[radial-gradient(closest-side,rgb(220_0_56/0.4),transparent)]" />
        <div className="absolute inset-0 dots-light opacity-[0.12] [mask-image:linear-gradient(to_bottom,transparent,black_50%,transparent)]" />
      </div>
      <EcgLine gradientId="page-hero-ecg" delay={500} className="pointer-events-none absolute end-0 top-[34%] -z-10 hidden h-24 w-1/2 opacity-70 md:block" />

      <div className="shell relative flex w-full flex-col justify-end pt-32 pb-12 sm:pb-16">
        <div className="animate-fade">
          <Breadcrumbs lang={lang} items={crumbs} />
        </div>
        <p className="eyebrow mt-8 inline-flex animate-rise items-center gap-3 text-crimson-200 [animation-delay:80ms]">
          <span aria-hidden="true" className="h-px w-8 bg-current" />
          {eyebrow}
        </p>
        <h1 id="page-title" className="mt-4 max-w-3xl animate-rise text-[clamp(2.3rem,5.4vw,4.2rem)] font-bold [animation-delay:160ms]">
          {title}
        </h1>
        {lead ? <p className="mt-5 max-w-2xl animate-rise text-[1.12rem] text-white/85 [animation-delay:240ms]">{lead}</p> : null}
        {children ? <div className="mt-8 animate-rise [animation-delay:320ms]">{children}</div> : null}
      </div>
    </section>
  );
}
