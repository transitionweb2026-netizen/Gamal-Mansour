import type { Metadata, Viewport } from "next";
import "../globals.css";
import { fontVariables } from "@/lib/fonts";
import { languageAlternates } from "@/lib/seo";
import { getSite } from "@/lib/content/store";
import { SITE_URL } from "@/content/site";

export function generateMetadata(): Metadata {
  const s = getSite().settings;
  return {
    metadataBase: new URL(SITE_URL),
    title: `${s.doctor.ar} | ${s.doctor.en} — ${s.brand.en}`,
    description: `${s.seo.defaultDescription.ar} | ${s.seo.defaultDescription.en}`,
    alternates: { languages: languageAlternates("") },
    robots: { index: false, follow: true },
  };
}

export const viewport: Viewport = { themeColor: "#3c0060", width: "device-width", initialScale: 1 };

/** Root "/" only chooses a language; all content lives under /ar/ and /en/. */
export default function RootRedirectLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={fontVariables}>
      <body>{children}</body>
    </html>
  );
}
