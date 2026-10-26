import { CalendarHeart } from "lucide-react";
import { ButtonLink } from "@/components/Button";
import { ContactPanel } from "@/components/ContactPanel";
import { EcgLine } from "@/components/EcgLine";
import { Photo } from "@/components/Photo";
import type { SectionProps } from "@/components/sections/types";
import type { gCta } from "@/content/defaults";
import { resolveHref } from "@/lib/cms/links";

/** Crimson → plum statement band closing most pages (Global content › Appointment call-to-action). */
export function AppointmentCta({ lang, c, sectionId }: SectionProps<typeof gCta>) {
  return (
    <section id={sectionId} aria-labelledby={`${sectionId}-title`} className="surface-pearl px-2.5 py-16 sm:px-5 sm:py-24">
      <div data-surface="dark" className="reveal surface-ember relative isolate mx-auto max-w-[86rem] overflow-hidden rounded-[2.5rem] sm:rounded-[3rem]">
        {/* Photo blends (luminosity) straight into the ember gradient and fades out towards the copy */}
        <div
          aria-hidden="true"
          className="absolute inset-y-0 end-0 -z-10 hidden w-[50%] opacity-50 mix-blend-luminosity md:block ltr:[mask-image:linear-gradient(to_left,black_35%,transparent)] rtl:[mask-image:linear-gradient(to_right,black_35%,transparent)]"
        >
          <Photo media={c.image} alt="" sizes="(min-width: 768px) 50vw, 0px" className="size-full object-cover object-[50%_30%] brightness-[0.8] contrast-[1.1]" />
        </div>
        <div aria-hidden="true" className="absolute inset-0 -z-10 dots-light opacity-20 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 grain opacity-30 mix-blend-overlay" />
        <EcgLine gradientId={`${sectionId}-ecg`} animate={false} from="#ffd0dc" to="#e4ccff" className="absolute inset-x-0 bottom-8 -z-10 h-16 w-full opacity-40" />

        <div className="relative max-w-2xl px-6 py-14 sm:px-12 sm:py-20 lg:px-16">
          <p className="eyebrow inline-flex items-center gap-3 text-white/85">
            <span aria-hidden="true" className="h-px w-8 bg-current" />
            {c.eyebrow}
          </p>
          <h2 id={`${sectionId}-title`} className="mt-4 text-[clamp(1.9rem,4.4vw,3.2rem)] font-bold text-white">
            {c.title}
          </h2>
          <p className="mt-5 max-w-xl text-[1.08rem] text-white/85">{c.text}</p>
          {c.primary ? (
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href={resolveHref(c.primaryHref, lang)} variant="light" icon={<CalendarHeart className="size-[1.1rem]" aria-hidden="true" />}>
                {c.primary}
              </ButtonLink>
            </div>
          ) : null}
          <ContactPanel lang={lang} className="mt-8" />
        </div>
      </div>
    </section>
  );
}
