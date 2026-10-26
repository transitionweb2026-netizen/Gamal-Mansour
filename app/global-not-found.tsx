import type { Metadata } from "next";
import "./globals.css";
import { fontVariables } from "@/lib/fonts";
import { EcgLine } from "@/components/EcgLine";
import { getSite } from "@/lib/content/store";
import { logoAsset } from "@/lib/content/brand";

export function generateMetadata(): Metadata {
  const t = getSite().global.notFound.title;
  return { title: `${t.ar} | ${t.en}`, robots: { index: false, follow: true } };
}

/** Bilingual 404 (Global content › 404 page). Shows both languages at once. */
export default function GlobalNotFound() {
  const t = getSite().global.notFound;
  const logo = logoAsset();
  return (
    <html lang="ar" dir="rtl" className={fontVariables}>
      <body>
        <main className="surface-plum relative isolate grid min-h-dvh place-items-center overflow-hidden px-5 py-16 text-center">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 dots-light opacity-20" />
          <EcgLine gradientId="nf-ecg" className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 h-24 w-full -translate-y-1/2 opacity-40" />
          <div className="glass-dark glass-edge-dark w-full max-w-xl rounded-[2.25rem] px-6 py-10 sm:px-10">
            <div className="mx-auto inline-flex rounded-2xl bg-[linear-gradient(140deg,#fff,var(--color-blush))] p-3">
              {/* eslint-disable-next-line @next/next/no-img-element -- static export */}
              <img src={logo.src} width={logo.width} height={logo.height} alt={getSite().settings.brand.en} className="h-12 w-auto" />
            </div>
            <p className="mt-8 font-[family-name:var(--font-alexandria)] text-7xl font-bold text-glow-gradient">404</p>
            <h1 className="mt-4 text-2xl font-bold text-white">{t.title.ar}</h1>
            <p className="mt-2 text-plum-100/80">{t.text.ar}</p>
            <div lang="en" dir="ltr">
              <h2 className="mt-6 text-xl font-semibold text-white">{t.title.en}</h2>
              <p className="mt-1 text-plum-100/80">{t.text.en}</p>
            </div>
            {/* Plain links on purpose: this page renders outside the app's layouts and router. */}
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- standalone 404 document */}
              <a href="/ar/" hrefLang="ar" className="inline-flex min-h-12 items-center rounded-full bg-crimson px-6 font-semibold text-white">
                {t.homeLabel.ar}
              </a>
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- standalone 404 document */}
              <a href="/en/" hrefLang="en" lang="en" className="inline-flex min-h-12 items-center rounded-full bg-white px-6 font-semibold text-plum-800">
                {t.homeLabel.en}
              </a>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
