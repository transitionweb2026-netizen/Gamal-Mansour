import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarCheck2, CircleCheck, Clock, Info, Mail, MapPin, Navigation, Phone, Siren } from "lucide-react";
import { hasLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { contact } from "@/content/contact";
import { common } from "@/content/common";
import { mailHref, phoneDisplay, site, telHref, whatsappHref } from "@/content/site";
import { PageHero } from "@/components/PageHero";
import { SectionHeading } from "@/components/SectionHeading";
import { ContactPanel } from "@/components/ContactPanel";
import { BrandIcon } from "@/components/icons";
import { IconTile } from "@/components/ServiceIcon";
import { WhatsAppComposer } from "@/components/WhatsAppComposer";

export async function generateMetadata({ params }: PageProps<"/[lang]/contact">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = contact[lang].meta;
  return pageMetadata({ lang, path: "contact", title: t.title, description: t.description });
}

export default async function ContactPage({ params }: PageProps<"/[lang]/contact">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = contact[lang];
  const c = common[lang];

  const tel = telHref();
  const wa = whatsappHref();
  const mail = mailHref();
  const booking = site.contact.bookingUrl;

  const channels = [
    { key: "phone", icon: <Phone className="size-6" aria-hidden="true" />, copy: t.channels.phone, href: tel, detail: phoneDisplay(), ltr: true },
    { key: "whatsapp", icon: <BrandIcon name="whatsapp" className="size-6" />, copy: t.channels.whatsapp, href: wa, detail: null, ltr: false },
    { key: "email", icon: <Mail className="size-6" aria-hidden="true" />, copy: t.channels.email, href: mail, detail: site.contact.email, ltr: true },
    { key: "booking", icon: <CalendarCheck2 className="size-6" aria-hidden="true" />, copy: t.channels.booking, href: booking, detail: null, ltr: false },
  ];
  const anyChannel = channels.some((ch) => ch.href);

  return (
    <>
      <PageHero
        lang={lang}
        eyebrow={t.hero.eyebrow}
        title={t.hero.title}
        lead={t.hero.lead}
        crumbs={[{ label: t.hero.eyebrow }]}
        photo="stethoscope-burgundy"
        photoAlt={t.hero.imageAlt}
        focus="50% 35%"
      >
        <ContactPanel lang={lang} />
      </PageHero>

      {/* Channels */}
      <section aria-labelledby="channels-title" className="surface-blush section-y relative isolate overflow-hidden">
        <div aria-hidden="true" className="absolute inset-0 -z-10 dots opacity-25 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
        <div className="shell">
          <SectionHeading id="channels-title" eyebrow={t.channels.eyebrow} title={t.channels.title} />
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {channels.map((ch, i) => {
              const external = ch.href?.startsWith("http");
              return (
                <li key={ch.key} className="reveal" style={{ "--reveal-delay": `${i * 80}ms` } as React.CSSProperties}>
                  <div className={`glass glass-edge relative flex h-full flex-col rounded-[2rem] p-7 ${ch.href ? "sheen transition-transform duration-500 hover:-translate-y-1.5" : ""}`}>
                    <IconTile tone={i % 2 === 0 ? "crimson" : "plum"}>{ch.icon}</IconTile>
                    <h3 className="mt-6 text-lg font-bold text-plum-800">{ch.copy.title}</h3>
                    <p className="mt-1.5 text-[0.95rem] text-ink-700">{ch.copy.text}</p>
                    {ch.href ? (
                      <a
                        href={ch.href}
                        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                        className="mt-auto pt-6 font-semibold text-crimson-600 after:absolute after:inset-0 after:rounded-[2rem]"
                      >
                        {ch.detail ? (
                          <span dir={ch.ltr ? "ltr" : undefined} className="block text-plum-800 tabular-nums">
                            {ch.detail}
                          </span>
                        ) : null}
                        {ch.copy.action}
                      </a>
                    ) : (
                      <p className="mt-auto pt-6 text-sm font-semibold text-ink-500">
                        <span className="inline-flex items-center gap-2 rounded-full bg-plum-700/8 px-3 py-1">
                          <Clock className="size-3.5" aria-hidden="true" />
                          {t.channels.pending}
                        </span>
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
          {!anyChannel ? (
            <p className="reveal mt-6 flex items-start gap-3 text-sm text-ink-700">
              <Info className="mt-0.5 size-4 shrink-0 text-plum-500" aria-hidden="true" />
              {t.channels.pendingNote}
            </p>
          ) : null}
        </div>
      </section>

      {/* How to book + what to bring */}
      <section data-surface="dark" aria-labelledby="steps-title" className="surface-plum section-y relative isolate overflow-hidden">
        <div aria-hidden="true" className="absolute inset-0 -z-10 dots-light opacity-15" />
        <div className="shell grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
          <div>
            <SectionHeading id="steps-title" eyebrow={t.steps.eyebrow} title={t.steps.title} tone="dark" />
            <ol className="relative mt-10 space-y-4 before:absolute before:inset-y-6 before:start-[1.6rem] before:w-px before:bg-gradient-to-b before:from-crimson before:to-plum-400/30">
              {t.steps.items.map((step, i) => (
                <li key={step.title} className="reveal relative flex gap-5" style={{ "--reveal-delay": `${i * 90}ms` } as React.CSSProperties}>
                  <span className="relative z-10 grid size-13 shrink-0 place-items-center rounded-2xl bg-[linear-gradient(140deg,var(--color-crimson),#a3005a)] font-[family-name:var(--font-heading)] font-bold shadow-glow-crimson tabular-nums">
                    {i + 1}
                  </span>
                  <div className="glass-dark glass-edge-dark flex-1 rounded-[1.6rem] p-5">
                    <h3 className="font-bold text-white">{step.title}</h3>
                    <p className="mt-1 text-plum-100/80">{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div className="reveal glass-dark glass-edge-dark self-start rounded-[2rem] p-7 sm:p-8 lg:mt-24">
            <h3 className="text-xl font-bold text-white">{t.checklist.title}</h3>
            <ul className="mt-5 space-y-3.5">
              {t.checklist.items.map((item) => (
                <li key={item} className="flex items-start gap-3 text-plum-100/90">
                  <CircleCheck className="mt-1 size-4 shrink-0 text-crimson-300" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* WhatsApp composer */}
      <section aria-labelledby="composer-title" className="surface-dawn section-y relative isolate overflow-hidden">
        <div aria-hidden="true" className="absolute -top-40 -end-40 -z-10 size-[36rem] rounded-full bg-[radial-gradient(closest-side,rgb(220_0_56/0.14),transparent)]" />
        <div className="shell grid gap-12 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
          <SectionHeading id="composer-title" eyebrow={t.composer.eyebrow} title={t.composer.title} lead={t.composer.text} />
          <div className="reveal glass glass-edge rounded-[2.25rem] p-6 sm:p-9">
            <WhatsAppComposer number={site.contact.whatsapp} copy={t.composer} />
          </div>
        </div>
      </section>

      {/* Location */}
      <section aria-labelledby="location-title" className="surface-lilac section-y relative isolate overflow-hidden">
        <div className="shell">
          <SectionHeading id="location-title" eyebrow={t.location.eyebrow} title={t.location.title} />
          {site.locations.length ? (
            <ul className="mt-10 grid gap-5 md:grid-cols-2">
              {site.locations.map((loc) => (
                <li key={loc.address.en} className="reveal glass glass-edge rounded-[2rem] p-7">
                  <h3 className="text-lg font-bold text-plum-800">{loc.name[lang]}</h3>
                  <p className="mt-3 flex gap-3 text-ink-700">
                    <MapPin className="mt-1 size-4 shrink-0 text-crimson" aria-hidden="true" />
                    {loc.address[lang]}
                  </p>
                  {loc.hours ? (
                    <p className="mt-3 flex gap-3 text-ink-700">
                      <Clock className="mt-1 size-4 shrink-0 text-crimson" aria-hidden="true" />
                      <span>
                        <span className="sr-only">{t.location.hours}: </span>
                        {loc.hours[lang]}
                      </span>
                    </p>
                  ) : null}
                  {loc.mapUrl ? (
                    <a href={loc.mapUrl} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-2 font-semibold text-crimson-600 hover:underline">
                      <Navigation className="size-4" aria-hidden="true" />
                      {t.location.directions}
                    </a>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <div className="reveal mt-10 flex flex-col items-start gap-5 rounded-[2rem] border border-dashed border-plum-700/25 bg-white/40 p-8 sm:flex-row sm:items-center">
              <IconTile tone="plum">
                <MapPin className="size-6" aria-hidden="true" />
              </IconTile>
              <p className="text-[1.05rem] text-ink-700">{t.location.pending}</p>
            </div>
          )}

          <div className="reveal mt-10 flex flex-col gap-4 rounded-[2rem] border-2 border-crimson/25 bg-crimson-50 p-6 sm:flex-row sm:items-center sm:p-8">
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
    </>
  );
}
