import Link from "next/link";
import { Mail, MapPin, Phone, Siren } from "lucide-react";
import { Logo } from "@/components/Logo";
import { SocialLinks } from "@/components/SocialLinks";
import { BrandIcon } from "@/components/icons";
import { EcgLine } from "@/components/EcgLine";
import { common, navigation } from "@/content/common";
import { mailHref, phoneDisplay, site, telHref, whatsappHref } from "@/content/site";
import { localePath, type Locale } from "@/lib/i18n";

export function SiteFooter({ lang }: { lang: Locale }) {
  const t = common[lang];
  const tel = telHref();
  const wa = whatsappHref();
  const mail = mailHref();
  const hasContact = Boolean(tel || wa || mail || site.locations.length);
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
              <Logo lang={lang} className="h-14 w-auto" />
            </div>
            <p className="mt-7 max-w-sm text-[1.02rem] text-plum-100/85">{t.footerTagline}</p>
            <p className="mt-6 text-sm font-semibold text-white">{site.doctor[lang]}</p>
            <p className="text-sm text-plum-200/80">{site.specialty[lang]}</p>
          </div>

          <nav aria-label={t.footerNav}>
            <h2 className="eyebrow text-crimson-200">{t.footerExplore}</h2>
            <ul className="mt-5 grid grid-cols-2 gap-x-6 gap-y-1 lg:grid-cols-1">
              {navigation.map((item) => (
                <li key={item.key}>
                  <Link
                    href={localePath(lang, item.path)}
                    className="inline-flex min-h-10 items-center text-plum-100/85 transition-colors hover:text-white"
                  >
                    {item.label[lang]}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="eyebrow text-crimson-200">{t.footerContact}</h2>
            <ul className="mt-5 space-y-3 text-plum-100/90">
              <li className="flex items-center gap-3">
                <Phone className="size-4 shrink-0 text-crimson-300" aria-hidden="true" />
                {tel ? (
                  <a href={tel} dir="ltr" className="font-semibold tabular-nums hover:text-white">
                    {phoneDisplay()}
                  </a>
                ) : (
                  <span>
                    <span dir="ltr" className="font-semibold tabular-nums">{phoneDisplay()}</span>
                    <span className="block text-xs text-plum-200/70">{t.phoneComingSoon}</span>
                  </span>
                )}
              </li>
              {wa ? (
                <li className="flex items-center gap-3">
                  <BrandIcon name="whatsapp" className="size-4 shrink-0 text-crimson-300" />
                  <a href={wa} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                    {t.whatsapp}
                  </a>
                </li>
              ) : null}
              {mail ? (
                <li className="flex items-center gap-3">
                  <Mail className="size-4 shrink-0 text-crimson-300" aria-hidden="true" />
                  <a href={mail} dir="ltr" className="hover:text-white">
                    {site.contact.email}
                  </a>
                </li>
              ) : null}
              {site.locations.map((loc) => (
                <li key={loc.address.en} className="flex items-start gap-3">
                  <MapPin className="mt-1 size-4 shrink-0 text-crimson-300" aria-hidden="true" />
                  <span>{loc.address[lang]}</span>
                </li>
              ))}
              {!hasContact ? <li className="text-sm text-plum-200/75">{t.contactDetailsSoon}</li> : null}
            </ul>

            <h2 className="eyebrow mt-9 text-crimson-200">{t.footerFollow}</h2>
            <SocialLinks label={t.socialLabel} comingSoon={t.socialComingSoon} size="sm" className="mt-4" />
          </div>
        </div>

        <div className="glass-dark glass-edge-dark mt-14 flex flex-col gap-3 rounded-3xl p-5 sm:flex-row sm:items-start sm:gap-4 sm:p-6">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-crimson text-white">
            <Siren className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="font-semibold text-white">{t.emergencyTitle}</p>
            <p className="mt-1 text-sm text-plum-100/85">{t.emergencyText}</p>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-8 text-sm text-plum-200/75 md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {site.brand[lang]} — {site.doctor[lang]}. {t.rights}
          </p>
          <p className="max-w-xl md:text-end">
            {t.medicalDisclaimer} {t.photoCredit}
          </p>
        </div>
      </div>
    </footer>
  );
}
