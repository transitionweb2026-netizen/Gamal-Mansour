import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarCheck, HeartHandshake, MessageSquareHeart, ShieldCheck, Siren } from "lucide-react";
import { hasLocale, localePath } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { patients, testimonials } from "@/content/patients";
import { common } from "@/content/common";
import { mailHref, whatsappHref } from "@/content/site";
import { PageHero } from "@/components/PageHero";
import { SectionHeading } from "@/components/SectionHeading";
import { FaqAccordion } from "@/components/FaqAccordion";
import { ButtonLink } from "@/components/Button";
import { Testimonials } from "@/components/Testimonials";
import { AppointmentCta } from "@/components/AppointmentCta";

export async function generateMetadata({ params }: PageProps<"/[lang]/patients">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = patients[lang].meta;
  return pageMetadata({ lang, path: "patients", title: t.title, description: t.description });
}

const groupIcons = [CalendarCheck, HeartHandshake, ShieldCheck];

export default async function PatientsPage({ params }: PageProps<"/[lang]/patients">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = patients[lang];
  const c = common[lang];
  const shareHref = whatsappHref() ?? mailHref() ?? localePath(lang, "contact");

  return (
    <>
      <PageHero
        lang={lang}
        variant="editorial"
        eyebrow={t.hero.eyebrow}
        title={t.hero.title}
        lead={t.hero.lead}
        crumbs={[{ label: t.hero.eyebrow }]}
        photo="stethoscope-heart-light"
        photoAlt={lang === "ar" ? "سمّاعة طبية وقلب أحمر على سطح فاتح" : "A stethoscope and a red heart on a light surface"}
      />

      {/* Reviews: genuine, consented testimonials only */}
      {testimonials.length > 0 ? (
        <Testimonials lang={lang} />
      ) : (
        <section aria-labelledby="reviews-title" className="surface-blush relative isolate overflow-hidden py-16 sm:py-24">
          <div className="shell grid items-stretch gap-5 lg:grid-cols-[1.4fr_1fr]">
            <div className="reveal glass glass-edge relative overflow-hidden rounded-[2.5rem] p-8 sm:p-12">
              <div aria-hidden="true" className="absolute -end-16 -top-16 size-64 rounded-full bg-[radial-gradient(closest-side,rgb(220_0_56/0.18),transparent)]" />
              <p className="eyebrow text-crimson-600">{t.reviews.eyebrow}</p>
              <h2 id="reviews-title" className="mt-3 text-[clamp(1.6rem,3vw,2.3rem)] font-bold text-plum-800">
                {t.reviews.emptyTitle}
              </h2>
              <p className="mt-4 max-w-xl text-[1.05rem] text-ink-700">{t.reviews.emptyText}</p>
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
                <h2 className="mt-6 text-2xl font-bold">{t.reviews.shareTitle}</h2>
                <p className="mt-3 text-white/85">{t.reviews.shareText}</p>
              </div>
              <ButtonLink href={shareHref} variant="light" size="md" className="mt-8 self-start">
                {t.reviews.shareCta}
              </ButtonLink>
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section aria-labelledby="faq-title" className="surface-lilac section-y relative isolate overflow-hidden">
        <div aria-hidden="true" className="absolute inset-0 -z-10 dots opacity-25 [mask-image:linear-gradient(to_bottom,black,transparent_40%)]" />
        <div className="shell">
          <SectionHeading id="faq-title" eyebrow={t.faq.eyebrow} title={t.faq.title} lead={t.faq.lead} />
          <div className="mt-12 grid gap-10 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-14">
            <nav aria-label={t.faq.eyebrow} className="lg:sticky lg:top-28 lg:self-start">
              <ul className="flex flex-wrap gap-2 lg:flex-col">
                {t.groups.map((g, i) => {
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
              {t.groups.map((g) => (
                <div key={g.id} id={`faq-${g.id}`} className="scroll-mt-28">
                  <h3 className="reveal mb-5 text-xl font-bold text-plum-800">{g.title}</h3>
                  <FaqAccordion items={g.items} idPrefix={`faq-${g.id}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Emergency notice */}
      <section aria-label={c.emergencyTitle} className="surface-pearl pt-16">
        <div className="shell">
          <div className="reveal flex flex-col gap-4 rounded-[2rem] border-2 border-crimson/25 bg-crimson-50 p-6 sm:flex-row sm:items-center sm:p-8">
            <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-crimson text-white shadow-glow-crimson">
              <Siren className="size-7" aria-hidden="true" />
            </span>
            <div>
              <p className="text-lg font-bold text-crimson-700">{c.emergencyTitle}</p>
              <p className="mt-1 text-ink-700">{c.emergencyText}</p>
            </div>
          </div>
        </div>
      </section>

      <AppointmentCta lang={lang} />
    </>
  );
}
