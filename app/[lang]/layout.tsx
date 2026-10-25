import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import "../globals.css";
import { fontVariables } from "@/lib/fonts";
import { hasLocale, localeInfo, localePath, locales } from "@/lib/i18n";
import { jsonLd } from "@/lib/seo";
import { common, navigation } from "@/content/common";
import { site, telHref } from "@/content/site";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { MotionObserver } from "@/components/MotionObserver";
import { SocialLinks } from "@/components/SocialLinks";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  return {
    metadataBase: new URL(site.url),
    title: {
      template: `%s | ${site.doctor[lang]}`,
      default: `${site.doctor[lang]} | ${site.brand[lang]}`,
    },
    applicationName: site.brand[lang],
    creator: site.brand[lang],
    formatDetection: { telephone: false, email: false, address: false },
    robots: { index: true, follow: true },
    manifest: "/manifest.webmanifest",
  };
}

export const viewport: Viewport = {
  themeColor: "#3c0060",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export default async function LangLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = common[lang];

  const items = navigation.map((n) => ({ key: n.key, href: localePath(lang, n.path), label: n.label[lang] }));

  // Only verified facts are published as structured data.
  const tel = telHref();
  const organization = {
    "@context": "https://schema.org",
    "@type": "MedicalOrganization",
    name: site.brand.en,
    alternateName: [site.brand.ar, "Hybrid Hearts"],
    url: `${site.url}/`,
    logo: `${site.url}/brand/logo.png`,
    medicalSpecialty: "https://schema.org/Cardiovascular",
    ...(tel ? { telephone: site.contact.phone } : {}),
    ...(site.social.some((s) => s.url) ? { sameAs: site.social.flatMap((s) => (s.url ? [s.url] : [])) } : {}),
  };

  return (
    <html lang={lang} dir={localeInfo[lang].dir} className={fontVariables}>
      <body>
        <a
          href="#main"
          className="sr-only z-[100] rounded-full bg-plum-700 px-5 py-3 font-semibold text-white focus:not-sr-only focus:fixed focus:top-3 focus:start-3"
        >
          {t.skipToContent}
        </a>
        <SiteHeader
          lang={lang}
          items={items}
          labels={{
            mainNav: t.mainNav,
            menu: t.menu,
            openMenu: t.openMenu,
            closeMenu: t.closeMenu,
            bookAppointment: t.bookAppointment,
            bookShort: t.bookShort,
            switchLanguage: t.switchLanguage,
          }}
          menuFooter={
            <SocialLinks tone="light" label={t.socialLabel} comingSoon={t.socialComingSoon} className="mt-2 justify-center" />
          }
        />
        <main id="main" tabIndex={-1} className="outline-none">
          {children}
        </main>
        <SiteFooter lang={lang} />
        <MotionObserver />
        <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(organization)} />
      </body>
    </html>
  );
}
