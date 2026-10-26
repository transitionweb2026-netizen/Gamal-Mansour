import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/Logo";
import { SocialLinks } from "@/components/SocialLinks";
import { BrandIcon } from "@/components/icons";
import { EcgLine } from "@/components/EcgLine";
import { EmergencyNotice } from "@/components/EmergencyNotice";
import { contactInfo, globalFor, settingsFor } from "@/lib/content/access";
import { logoAsset } from "@/lib/content/brand";
import { localePath, type Locale } from "@/lib/i18n";

export function SiteFooter({ lang }: { lang: Locale }) {
  const t = globalFor("footer", lang);
  const panel = globalFor("contactPanel", lang);
  const nav = globalFor("navigation", lang).items.filter((n) => n.visible);
  const s = settingsFor(lang);
  const contact = contactInfo();
  const wa = contact.whatsapp();
  const hasContact = Boolean(contact.tel || wa || contact.mail || s.locations.length);
  const year = new Date().getFullYear();

  return (
    <footer data-surface="dark" className="surface-plum relative isolate overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 dots-light opacity-25 [mask-image:linear-gradient(to_bottom,black,transparent_70%)]" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 grain opacity-30 mix-blend-soft-light" />
      <EcgLine gradientId="footer-ecg" animate={false} className="pointer-events-none absolute inset-x-0 top-10 -z-10 h-16 w-full opacity-30" />

      <div className="shell pt-20 pb-10">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr_1fr] lg:gap-16">
          <div>
            <div className="inline-flex rounded-3xl bg-[linear-gradient(140deg,#fff_0%,var(--color-blush)_60%,var(--color-lilac)_100%)] p-4 shadow-[0_20px_50px_-24px_rgb(0_0_0/0.6)]">
              <Logo href={localePath(lang)} label={`${s.brand} — ${s.doctor}`} logo={logoAsset()} className="h-14 w-auto" />
            </div>
            <p className="mt-7 max-w-sm text-[1.02rem] text-plum-100/85">{t.tagline}</p>
            <p className="mt-6 text-sm font-semibold text-white">{s.doctor}</p>
            <p className="text-sm text-plum-200/80">{s.specialty}</p>
          </div>

          <nav aria-label={t.navLabel}>
            <h2 className="eyebrow text-crimson-200">{t.exploreTitle}</h2>
            <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-1 lg:grid-cols-1">
              {nav.map((item) => (
                <li key={item.key}>
                  <Link href={localePath(lang, item.path)} className="inline-flex min-h-10 items-center text-plum-100/85 transition-colors hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="eyebrow text-crimson-200">{t.contactTitle}</h2>
            <ul className="mt-5 space-y-3 text-plum-100/90">
              <li className="flex items-center gap-3">
                <Phone className="size-4 shrink-0 text-crimson-300" aria-hidden="true" />
                {contact.tel ? (
                  <a href={contact.tel} dir="ltr" className="font-semibold tabular-nums hover:text-white">
                    {contact.phoneDisplay}
                  </a>
                ) : (
                  <span>
                    <span dir="ltr" className="font-semibold tabular-nums">{contact.phoneDisplay}</span>
                    <span className="block text-xs text-plum-200/70">{panel.phoneComingSoon}</span>
                  </span>
                )}
              </li>
              {wa ? (
                <li className="flex items-center gap-3">
                  <BrandIcon name="whatsapp" className="size-4 shrink-0 text-crimson-300" />
                  <a href={wa} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                    {panel.whatsapp}
                  </a>
                </li>
              ) : null}
              {contact.mail ? (
                <li className="flex items-center gap-3">
                  <Mail className="size-4 shrink-0 text-crimson-300" aria-hidden="true" />
                  <a href={contact.mail} dir="ltr" className="hover:text-white">
                    {contact.email}
                  </a>
                </li>
              ) : null}
              {s.locations.map((loc, i) => (
                <li key={i} className="flex items-start gap-3">
                  <MapPin className="mt-1 size-4 shrink-0 text-crimson-300" aria-hidden="true" />
                  <span>{loc.address}</span>
                </li>
              ))}
              {!hasContact ? <li className="text-sm text-plum-200/75">{t.contactDetailsSoon}</li> : null}
            </ul>

            <h2 className="eyebrow mt-9 text-crimson-200">{t.followTitle}</h2>
            <SocialLinks label={panel.socialLabel} comingSoon={panel.socialComingSoon} size="sm" className="mt-4" />
          </div>
        </div>

        <div className="mt-14">
          <EmergencyNotice lang={lang} variant="dark" />
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-8 text-sm text-plum-200/75 md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {s.brand} — {s.doctor}. {t.rights}
          </p>
          <p className="max-w-xl md:text-end">
            {t.medicalDisclaimer} {t.photoCredit}
          </p>
        </div>
      </div>
    </footer>
  );
}
