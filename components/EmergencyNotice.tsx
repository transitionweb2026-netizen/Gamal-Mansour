import { Siren } from "lucide-react";
import { globalFor } from "@/lib/content/access";
import type { Locale } from "@/lib/i18n";

/**
 * Emergency guidance (Global content › Emergency notice).
 * - "band": page section on a pearl surface (Reviews & FAQ, Contact)
 * - "dark": glass card used inside the footer
 */
export function EmergencyNotice({ lang, variant = "band", sectionId }: { lang: Locale; variant?: "band" | "dark"; sectionId?: string }) {
  const t = globalFor("emergency", lang);

  if (variant === "dark") {
    return (
      <div className="glass-dark glass-edge-dark flex flex-col gap-3 rounded-3xl p-5 sm:flex-row sm:items-start sm:gap-4 sm:p-6">
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-crimson text-white">
          <Siren className="size-5" aria-hidden="true" />
        </span>
        <div>
          <p className="font-semibold text-white">{t.title}</p>
          <p className="mt-1 text-sm text-plum-100/85">{t.text}</p>
        </div>
      </div>
    );
  }

  return (
    <section id={sectionId} aria-label={t.title} className="surface-pearl pt-16">
      <div className="shell">
        <div className="reveal flex flex-col gap-4 rounded-[2rem] border-2 border-crimson/25 bg-crimson-50 p-6 sm:flex-row sm:items-center sm:p-8">
          <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-crimson text-white shadow-glow-crimson">
            <Siren className="size-7" aria-hidden="true" />
          </span>
          <div>
            <p className="text-lg font-bold text-crimson-700">{t.title}</p>
            <p className="mt-1 text-ink-700">{t.text}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
