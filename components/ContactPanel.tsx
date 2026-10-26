import { Phone } from "lucide-react";
import { SocialLinks } from "@/components/SocialLinks";
import { contactInfo, globalFor } from "@/lib/content/access";
import type { Locale } from "@/lib/i18n";

/**
 * Floating Liquid Glass panel: social icons | separator | phone — one horizontal line.
 * Below 440px the same capsule stacks into two rows with a horizontal divider so nothing clips.
 */
export function ContactPanel({ lang, className = "" }: { lang: Locale; className?: string }) {
  const t = globalFor("contactPanel", lang);
  const contact = contactInfo();
  const tel = contact.tel;

  const phoneInner = (
    <>
      <span className="relative grid size-11 shrink-0 place-items-center rounded-full bg-[linear-gradient(135deg,var(--color-crimson),#a3005a)] text-white shadow-glow-crimson">
        <span aria-hidden="true" className="absolute inset-0 rounded-full bg-crimson/60 motion-safe:animate-pulse-ring" />
        <Phone className="relative size-[1.15rem]" aria-hidden="true" />
      </span>
      <span className="flex min-w-0 flex-col leading-tight">
        <span className="text-[0.72rem] font-medium text-white/70">{tel ? t.phoneLabel : t.phoneComingSoon}</span>
        <span dir="ltr" className="mt-1 text-[1.02rem] font-bold tracking-wide whitespace-nowrap text-white tabular-nums">
          {contact.phoneDisplay}
        </span>
      </span>
    </>
  );

  return (
    <div
      className={`glass-dark glass-edge-dark inline-flex w-full max-w-full flex-col items-stretch rounded-[1.6rem] p-2 min-[440px]:w-auto min-[440px]:flex-row min-[440px]:items-center min-[440px]:rounded-full ${className}`}
    >
      <SocialLinks label={t.socialLabel} comingSoon={t.socialComingSoon} className="justify-center px-1 min-[440px]:justify-start" />

      {/* Mandatory separator: vertical on the horizontal layout, horizontal when stacked */}
      <span
        aria-hidden="true"
        className="mx-3 my-2 h-px bg-gradient-to-r from-transparent via-white/45 to-transparent min-[440px]:mx-3.5 min-[440px]:my-0 min-[440px]:h-9 min-[440px]:w-px min-[440px]:bg-gradient-to-b"
      />

      {tel ? (
        <a
          href={tel}
          className="group flex items-center justify-center gap-3 rounded-full py-0.5 ps-1 pe-4 transition-colors hover:bg-white/[0.07] min-[440px]:justify-start"
          aria-label={`${t.callUs}: ${contact.phoneDisplay}`}
        >
          {phoneInner}
        </a>
      ) : (
        <div className="flex items-center justify-center gap-3 py-0.5 ps-1 pe-4 min-[440px]:justify-start">{phoneInner}</div>
      )}
    </div>
  );
}
