import Link from "next/link";
import { localePath, type Locale } from "@/lib/i18n";
import { site } from "@/content/site";

/** Official logo artwork (trimmed of padding only — proportions untouched: 1444 × 675). */
export function Logo({ lang, className = "h-11 w-auto", priority = false }: { lang: Locale; className?: string; priority?: boolean }) {
  return (
    <Link href={localePath(lang)} className="inline-flex shrink-0 items-center rounded-xl" aria-label={`${site.brand[lang]} — ${site.doctor[lang]}`}>
      <picture>
        <source type="image/webp" srcSet="/brand/logo-480.webp 480w, /brand/logo-960.webp 960w" sizes="200px" />
        <img
          src="/brand/logo.png"
          width={1444}
          height={675}
          alt=""
          className={className}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
        />
      </picture>
    </Link>
  );
}
