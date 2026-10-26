import { CalendarCheck, HeartHandshake, MessageSquareHeart, ShieldCheck } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { SectionHeading } from "@/components/SectionHeading";
import { FaqAccordion } from "@/components/FaqAccordion";
import { ButtonLink } from "@/components/Button";
import { Testimonials, publishedReviews } from "@/components/Testimonials";
import type { SectionProps } from "@/components/sections/types";
import type { homeTestimonials, patientsFaq, patientsHero, patientsReviews } from "@/content/defaults";
import { contactInfo, itemsFor } from "@/lib/content/access";
import { localePath } from "@/lib/i18n";

export function PatientsHero({ lang, c, sectionId }: SectionProps<typeof patientsHero>) {
  return (
    <PageHero
      lang={lang}
      sectionId={sectionId}
      variant="editorial"
      eyebrow={c.eyebrow}
      title={c.title}
      lead={c.lead}
      crumbs={[{ label: c.eyebrow }]}
      image={c.image}
      imageAlt={c.imageAlt}
      focus={c.imageFocus}
    />
  );
}

/** Home page reviews section: renders only when consented reviews are published. */
export function HomeTestimonials({ lang, c, sectionId }: SectionProps<typeof homeTestimonials>) {
  return <Testimonials lang={lang} sectionId={sectionId} eyebrow={c.eyebrow} title={c.title} />;
}

/** Reviews: genuine, consented testimonials only — otherwise an honest empty state. */
export function PatientsReviews({ lang, c, sectionId }: SectionProps<typeof patientsReviews>) {
  if (publishedReviews(lang).length > 0) {
    return <Testimonials lang={lang} sectionId={sectionId} eyebrow={c.eyebrow} title={c.title} />;
  }
  const contact = contactInfo();
  const shareHref = contact.whatsapp() ?? contact.mail ?? localePath(lang, "contact");

  return (
    <section id={sectionId} aria-labelledby={`${sectionId}-title`} className="surface-blush relative isolate overflow-hidden py-16 sm:py-24">
      <div className="shell grid items-stretch gap-5 lg:grid-cols-[1.4fr_1fr]">
        <div className="reveal glass glass-edge relative overflow-hidden rounded-[2.5rem] p-8 sm:p-12">
          <div aria-hidden="true" className="absolute -end-16 -top-16 size-64 rounded-full bg-[radial-gradient(closest-side,rgb(220_0_56/0.18),transparent)]" />
          <p className="eyebrow text-crimson-600">{c.eyebrow}</p>
          <h2 id={`${sectionId}-title`} className="mt-3 text-[clamp(1.6rem,3vw,2.3rem)] font-bold text-plum-800">
            {c.emptyTitle}
          </h2>
          <p className="mt-4 max-w-xl text-[1.05rem] text-ink-700">{c.emptyText}</p>
          <div aria-hidden="true" className="mt-8 flex gap-2">
            {[0, 1, 2].map((i) => (
              <span key={i} className="h-24 flex-1 rounded-2xl border border-dashed border-plum-700/20 bg-white/30" />
            ))}
          </div>
        </div>
        <div data-surface="dark" className="reveal surface-ember flex flex-col justify-between rounded-[2.5rem] p-8 sm:p-10">
          <div>
            <span className="grid size-14 place-items-center rounded-2xl bg-white/15">
              <MessageSquareHeart className="size-7" aria-hidden="true" />
            </span>
            <h2 className="mt-6 text-2xl font-bold">{c.shareTitle}</h2>
            <p className="mt-3 text-white/85">{c.shareText}</p>
          </div>
          {c.shareCta ? (
            <ButtonLink href={shareHref} variant="light" size="md" className="mt-8 self-start">
              {c.shareCta}
            </ButtonLink>
          ) : null}
        </div>
      </div>
    </section>
  );
}

const groupIcons = [CalendarCheck, HeartHandshake, ShieldCheck];

/** FAQ grouped by category (categories here; questions under Dashboard › FAQ). */
export function PatientsFaq({ lang, c, sectionId }: SectionProps<typeof patientsFaq>) {
  const faqs = itemsFor("faqs", lang).filter((f) => f.question.trim());
  const groups = c.categories
    .map((cat) => ({ ...cat, items: faqs.filter((f) => f.category === cat.id).map((f) => ({ q: f.question, a: f.answer.filter(Boolean) })) }))
    .filter((g) => g.items.length > 0);
  if (!groups.length) return null;

  return (
    <section id={sectionId} aria-labelledby={`${sectionId}-title`} className="surface-lilac section-y relative isolate overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0 -z-10 dots opacity-25 [mask-image:linear-gradient(to_bottom,black,transparent_40%)]" />
      <div className="shell">
        <SectionHeading id={`${sectionId}-title`} eyebrow={c.eyebrow} title={c.title} lead={c.lead} />
        <div className="mt-12 grid gap-10 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-14">
          <nav aria-label={c.eyebrow} className="lg:sticky lg:top-28 lg:self-start">
            <ul className="flex flex-wrap gap-2 lg:flex-col">
              {groups.map((g, i) => {
                const Icon = groupIcons[i % groupIcons.length];
                return (
                  <li key={g.id}>
                    <a
                      href={`#faq-${g.id}`}
                      className="flex min-h-12 items-center gap-3 rounded-2xl bg-white/55 px-4 text-sm font-semibold text-plum-700 ring-1 ring-inset ring-plum-700/10 transition-colors hover:bg-white hover:text-crimson-600"
                    >
                      <Icon className="size-4 text-crimson" aria-hidden="true" />
                      {g.title}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="space-y-12">
            {groups.map((g) => (
              <div key={g.id} id={`faq-${g.id}`} className="scroll-mt-28">
                <h3 className="reveal mb-5 text-xl font-bold text-plum-800">{g.title}</h3>
                <FaqAccordion items={g.items} idPrefix={`faq-${g.id}`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
