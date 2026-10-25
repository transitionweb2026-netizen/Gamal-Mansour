import type { Metadata, Viewport } from "next";
import "../globals.css";
import { fontVariables } from "@/lib/fonts";
import { site } from "@/content/site";
import { languageAlternates } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: `${site.doctor.ar} | ${site.doctor.en} — ${site.brand.en}`,
  description: "د. جمال منصور — جراحة القلب | Dr. Gamal Mansour — Cardiac Surgery. Hybrid Hearts.",
  alternates: { languages: languageAlternates("") },
  robots: { index: false, follow: true },
};

export const viewport: Viewport = { themeColor: "#3c0060", width: "device-width", initialScale: 1 };

/** Root "/" only chooses a language; all content lives under /ar/ and /en/. */
export default function RootRedirectLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={fontVariables}>
      <body>{children}</body>
    </html>
  );
}
