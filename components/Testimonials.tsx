import { BadgeCheck, Quote } from "lucide-react";
import { SectionHeading } from "@/components/SectionHeading";
import { patients, testimonials } from "@/content/patients";
import type { Locale } from "@/lib/i18n";

/** Renders genuine, consented testimonials only. Returns nothing while none exist. */
export function Testimonials({ lang, withHeading = true }: { lang: Locale; withHeading?: boolean }) {
  if (testimonials.length === 0) return null;
  const t = patients[lang].reviews;

  return (
    <section aria-labelledby={withHeading ? "testimonials-title" : undefined} className="surface-blush section-y relative isolate overflow-hidden">
      <div className="shell">
        {withHeading ? <SectionHeading id="testimonials-title" eyebrow={t.eyebrow} title={t.title} align="center" /> : null}
        <ul className="mt-12 columns-1 gap-5 md:columns-2 lg:columns-3">
          {testimonials.map((item, i) => (
            <li key={i} className="reveal mb-5 break-inside-avoid">
              <figure className="glass glass-edge rounded-[2rem] p-7">
                <Quote className="size-7 text-crimson rtl:-scale-x-100" aria-hidden="true" />
                <blockquote className="mt-4 text-[1.05rem] text-ink-700">{item.quote[lang]}</blockquote>
                <figcaption className="mt-6 border-t border-plum-700/10 pt-4">
                  <span className="block font-bold text-plum-800">{item.attribution[lang]}</span>
                  {item.context ? <span className="block text-sm text-ink-500">{item.context[lang]}</span> : null}
                  <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-crimson-600">
                    <BadgeCheck className="size-4" aria-hidden="true" />
                    {t.verified}
                    {item.source ? ` · ${item.source}` : ""}
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
