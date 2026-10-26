import { BadgeCheck, Quote } from "lucide-react";
import { Photo } from "@/components/Photo";
import { SectionHeading } from "@/components/SectionHeading";
import { globalFor, itemsFor } from "@/lib/content/access";
import type { Locale } from "@/lib/i18n";

/** Genuine reviews only: published, visible and with patient consent confirmed. */
export function publishedReviews(lang: Locale) {
  return itemsFor("reviews", lang).filter((r) => r.consent && r.quote.trim());
}

/** Renders consented testimonials. Returns nothing while none exist. */
export function Testimonials({
  lang,
  sectionId,
  eyebrow,
  title,
}: {
  lang: Locale;
  sectionId?: string;
  eyebrow?: string;
  title?: string;
}) {
  const reviews = publishedReviews(lang);
  if (reviews.length === 0) return null;
  const ui = globalFor("ui", lang);
  const headingId = `${sectionId ?? "testimonials"}-title`;

  return (
    <section id={sectionId} aria-labelledby={title ? headingId : undefined} className="surface-blush section-y relative isolate overflow-hidden">
      <div className="shell">
        {title ? <SectionHeading id={headingId} eyebrow={eyebrow} title={title} align="center" /> : null}
        <ul className="mt-12 columns-1 gap-5 md:columns-2 lg:columns-3">
          {reviews.map((item) => (
            <li key={item.id} className="reveal mb-5 break-inside-avoid">
              <figure className="glass glass-edge rounded-[2rem] p-7">
                <Quote className="size-7 text-crimson rtl:-scale-x-100" aria-hidden="true" />
                <blockquote className="mt-4 text-[1.05rem] text-ink-700">{item.quote}</blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-plum-700/10 pt-4">
                  {item.photo ? (
                    <span className="size-11 shrink-0 overflow-hidden rounded-full">
                      <Photo media={item.photo} alt="" sizes="44px" className="size-full object-cover" />
                    </span>
                  ) : null}
                  <span>
                    <span className="block font-bold text-plum-800">{item.attribution}</span>
                    {item.context ? <span className="block text-sm text-ink-500">{item.context}</span> : null}
                    <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-crimson-600">
                      <BadgeCheck className="size-4" aria-hidden="true" />
                      {ui.reviewVerified}
                      {item.source ? ` · ${item.source}` : ""}
                    </span>
                  </span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
