import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import "../globals.css";
import { fontVariables } from "@/lib/fonts";
import { hasLocale, localeInfo, locales } from "@/lib/i18n";
import { jsonLd } from "@/lib/seo";
import { absoluteUrl, contactInfo, globalFor, mediaAbsoluteUrl, settingsFor, socialLinks } from "@/lib/content/access";
import { headerProps } from "@/lib/content/layout-props";
import { getSite } from "@/lib/content/store";
import { SITE_URL } from "@/content/site";
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
  const s = settingsFor(lang);
  return {
    metadataBase: new URL(SITE_URL),
    title: { template: s.seo.titleTemplate, default: `${s.doctor} | ${s.brand}` },
    description: s.seo.defaultDescription,
    applicationName: s.brand,
    creator: s.brand,
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
  const header = globalFor("header", lang);
  const panel = globalFor("contactPanel", lang);

  // Only verified facts are published as structured data.
  const contact = contactInfo();
  const sameAs = socialLinks().flatMap((x) => (x.url ? [x.url] : []));
  const logoUrl = mediaAbsoluteUrl(getSite().settings.logo);
  const organization = {
    "@context": "https://schema.org",
    "@type": "MedicalOrganization",
    name: getSite().settings.brand.en,
    alternateName: [getSite().settings.brand.ar, getSite().settings.brandShort.en],
    url: absoluteUrl("/"),
    ...(logoUrl ? { logo: logoUrl } : {}),
    medicalSpecialty: "https://schema.org/Cardiovascular",
    ...(contact.tel ? { telephone: getSite().settings.contact.phone } : {}),
    ...(contact.email ? { email: contact.email } : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };

  return (
    <html lang={lang} dir={localeInfo[lang].dir} className={fontVariables}>
      <body>
        <a
          href="#main"
          className="sr-only z-[100] rounded-full bg-plum-700 px-5 py-3 font-semibold text-white focus:not-sr-only focus:fixed focus:top-3 focus:start-3"
        >
          {header.skipToContent}
        </a>
        <SiteHeader
          {...headerProps(lang)}
          menuFooter={<SocialLinks tone="light" label={panel.socialLabel} comingSoon={panel.socialComingSoon} className="mt-2 justify-center" />}
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
