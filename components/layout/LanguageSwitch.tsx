"use client";

import { usePathname } from "next/navigation";
import { Languages } from "lucide-react";
import { localeInfo, otherLocale, switchLocalePath, type Locale } from "@/lib/i18n";

/**
 * Links to the same page in the other language. Every route exists in both locales
 * (articles share slugs), so the target always resolves. Full page load so <html lang/dir> swap cleanly.
 */
export function LanguageSwitch({ lang, label, variant = "chip" }: { lang: Locale; label: string; variant?: "chip" | "wide" }) {
  const pathname = usePathname() || `/${lang}/`;
  const target = otherLocale(lang);
  const info = localeInfo[target];

  if (variant === "wide") {
    return (
      <a
        href={switchLocalePath(pathname, target)}
        hrefLang={info.hreflang}
        lang={info.hreflang}
        className="glass glass-edge flex min-h-12 items-center justify-center gap-2.5 rounded-full px-5 font-semibold text-plum-700 transition-colors hover:text-crimson-600"
      >
        <Languages className="size-5" aria-hidden="true" />
        {info.label}
      </a>
    );
  }

  return (
    <a
      href={switchLocalePath(pathname, target)}
      hrefLang={info.hreflang}
      lang={info.hreflang}
      aria-label={label}
      title={label}
      className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-white/55 px-3 text-sm font-bold text-plum-700 ring-1 ring-inset ring-plum-700/10 transition-all hover:bg-white hover:text-crimson-600"
    >
      <Languages className="size-4" aria-hidden="true" />
      <span className="hidden sm:inline">{info.label}</span>
      <span className="sm:hidden">{info.short}</span>
    </a>
  );
}
