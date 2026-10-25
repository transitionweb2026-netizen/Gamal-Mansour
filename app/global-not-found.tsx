import type { Metadata } from "next";
import "./globals.css";
import { fontVariables } from "@/lib/fonts";
import { EcgLine } from "@/components/EcgLine";

export const metadata: Metadata = {
  title: "الصفحة غير موجودة | Page not found",
  robots: { index: false, follow: true },
};

export default function GlobalNotFound() {
  return (
    <html lang="ar" dir="rtl" className={fontVariables}>
      <body>
        <main className="surface-plum relative isolate grid min-h-dvh place-items-center overflow-hidden px-5 py-16 text-center">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 dots-light opacity-20" />
          <EcgLine gradientId="nf-ecg" className="pointer-events-none absolute inset-x-0 top-1/2 -z-10 h-24 w-full -translate-y-1/2 opacity-40" />
          <div className="glass-dark glass-edge-dark w-full max-w-xl rounded-[2.25rem] px-6 py-10 sm:px-10">
            <div className="mx-auto inline-flex rounded-2xl bg-[linear-gradient(140deg,#fff,var(--color-blush))] p-3">
              {/* eslint-disable-next-line @next/next/no-img-element -- static export */}
              <img src="/brand/logo.png" width={1444} height={675} alt="Hybrid Hearts Cardiac Surgery" className="h-12 w-auto" />
            </div>
            <p className="mt-8 font-[family-name:var(--font-alexandria)] text-7xl font-bold text-glow-gradient">404</p>
            <h1 className="mt-4 text-2xl font-bold text-white">الصفحة غير موجودة</h1>
            <p className="mt-2 text-plum-100/80">ربما نُقلت الصفحة أو تغيّر عنوانها.</p>
            <div lang="en" dir="ltr">
              <h2 className="mt-6 text-xl font-semibold text-white">Page not found</h2>
              <p className="mt-1 text-plum-100/80">The page may have moved or its address may have changed.</p>
            </div>
            {/* Plain links on purpose: this page renders outside the app's layouts and router. */}
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- standalone 404 document */}
              <a href="/ar/" hrefLang="ar" className="inline-flex min-h-12 items-center rounded-full bg-crimson px-6 font-semibold text-white">
                الرئيسية
              </a>
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- standalone 404 document */}
              <a href="/en/" hrefLang="en" lang="en" className="inline-flex min-h-12 items-center rounded-full bg-white px-6 font-semibold text-plum-800">
                English home
              </a>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
