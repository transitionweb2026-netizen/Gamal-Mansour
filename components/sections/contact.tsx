import { CalendarCheck2, CircleCheck, Clock, Info, Mail, MapPin, Navigation, Phone } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { SectionHeading } from "@/components/SectionHeading";
import { ContactPanel } from "@/components/ContactPanel";
import { BrandIcon } from "@/components/icons";
import { IconTile } from "@/components/ServiceIcon";
import { WhatsAppComposer } from "@/components/WhatsAppComposer";
import type { SectionProps } from "@/components/sections/types";
import type { contactChannels, contactComposer, contactHero, contactLocation, contactSteps } from "@/content/defaults";
import { contactInfo, settingsFor } from "@/lib/content/access";

export function ContactHero({ lang, c, sectionId }: SectionProps<typeof contactHero>) {
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
    >
      <ContactPanel lang={lang} />
    </PageHero>
  );
}

/** Contact channel cards. Details come from Settings › Contact & Social; missing ones show "coming soon". */
export function ContactChannels({ c, sectionId }: SectionProps<typeof contactChannels>) {
  const info = contactInfo();
  const wa = info.whatsapp();
  const channels = [
    { key: "phone", icon: <Phone className="size-6" aria-hidden="true" />, copy: c.phone, href: info.tel, detail: info.tel ? info.phoneDisplay : null, ltr: true },
    { key: "whatsapp", icon: <BrandIcon name="whatsapp" className="size-6" />, copy: c.whatsapp, href: wa, detail: null, ltr: false },
    { key: "email", icon: <Mail className="size-6" aria-hidden="true" />, copy: c.email, href: info.mail, detail: info.email, ltr: true },
    { key: "booking", icon: <CalendarCheck2 className="size-6" aria-hidden="true" />, copy: c.booking, href: info.bookingUrl, detail: null, ltr: false },
  ];
  const anyChannel = channels.some((ch) => ch.href);

  return (
    <section id={sectionId} aria-labelledby={`${sectionId}-title`} className="surface-blush section-y relative isolate overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0 -z-10 dots opacity-25 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <div className="shell">
        <SectionHeading id={`${sectionId}-title`} eyebrow={c.eyebrow} title={c.title} />
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
                        {c.pending}
                      </span>
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
        {!anyChannel && c.pendingNote ? (
          <p className="reveal mt-6 flex items-start gap-3 text-sm text-ink-700">
            <Info className="mt-0.5 size-4 shrink-0 text-plum-500" aria-hidden="true" />
            {c.pendingNote}
          </p>
        ) : null}
      </div>
    </section>
  );
}

export function ContactSteps({ c, sectionId }: SectionProps<typeof contactSteps>) {
  return (
    <section id={sectionId} data-surface="dark" aria-labelledby={`${sectionId}-title`} className="surface-plum section-y relative isolate overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0 -z-10 dots-light opacity-15" />
      <div className="shell grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
        <div>
          <SectionHeading id={`${sectionId}-title`} eyebrow={c.eyebrow} title={c.title} tone="dark" />
          <ol className="relative mt-10 space-y-4 before:absolute before:inset-y-6 before:start-[1.6rem] before:w-px before:bg-gradient-to-b before:from-crimson before:to-plum-400/30">
            {c.items.map((step, i) => (
              <li key={i} className="reveal relative flex gap-5" style={{ "--reveal-delay": `${i * 90}ms` } as React.CSSProperties}>
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
        {c.checklist.items.length ? (
          <div className="reveal glass-dark glass-edge-dark self-start rounded-[2rem] p-7 sm:p-8 lg:mt-24">
            <h3 className="text-xl font-bold text-white">{c.checklist.title}</h3>
            <ul className="mt-5 space-y-3.5">
              {c.checklist.items.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-plum-100/90">
                  <CircleCheck className="mt-1 size-4 shrink-0 text-crimson-300" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function ContactComposer({ c, sectionId }: SectionProps<typeof contactComposer>) {
  return (
    <section id={sectionId} aria-labelledby={`${sectionId}-title`} className="surface-dawn section-y relative isolate overflow-hidden">
      <div aria-hidden="true" className="absolute -top-40 -end-40 -z-10 size-[36rem] rounded-full bg-[radial-gradient(closest-side,rgb(220_0_56/0.14),transparent)]" />
      <div className="shell grid gap-12 lg:grid-cols-[1fr_1.3fr] lg:gap-16">
        <SectionHeading id={`${sectionId}-title`} eyebrow={c.eyebrow} title={c.title} lead={c.text} />
        <div className="reveal glass glass-edge rounded-[2.25rem] p-6 sm:p-9">
          <WhatsAppComposer number={contactInfo().whatsappNumber} copy={c} />
        </div>
      </div>
    </section>
  );
}

export function ContactLocation({ lang, c, sectionId }: SectionProps<typeof contactLocation>) {
  const locations = settingsFor(lang).locations.filter((l) => l.address);
  return (
    <section id={sectionId} aria-labelledby={`${sectionId}-title`} className="surface-lilac section-y relative isolate overflow-hidden">
      <div className="shell">
        <SectionHeading id={`${sectionId}-title`} eyebrow={c.eyebrow} title={c.title} />
        {locations.length ? (
          <ul className="mt-10 grid gap-5 md:grid-cols-2">
            {locations.map((loc, i) => (
              <li key={i} className="reveal glass glass-edge rounded-[2rem] p-7">
                {loc.name ? <h3 className="text-lg font-bold text-plum-800">{loc.name}</h3> : null}
                <p className="mt-3 flex gap-3 text-ink-700">
                  <MapPin className="mt-1 size-4 shrink-0 text-crimson" aria-hidden="true" />
                  {loc.address}
                </p>
                {loc.hours ? (
                  <p className="mt-3 flex gap-3 text-ink-700">
                    <Clock className="mt-1 size-4 shrink-0 text-crimson" aria-hidden="true" />
                    <span>
                      <span className="sr-only">{c.hours}: </span>
                      {loc.hours}
                    </span>
                  </p>
                ) : null}
                {/^https:\/\//i.test(loc.mapUrl) ? (
                  <a href={loc.mapUrl} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex items-center gap-2 font-semibold text-crimson-600 hover:underline">
                    <Navigation className="size-4" aria-hidden="true" />
                    {c.directions}
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
            <p className="text-[1.05rem] text-ink-700">{c.pending}</p>
          </div>
        )}
      </div>
    </section>
  );
}
