import { ClipboardList, HeartHandshake, MessagesSquare, Sprout } from "lucide-react";
import { EcgLine } from "@/components/EcgLine";
import { SectionHeading } from "@/components/SectionHeading";
import { home } from "@/content/home";
import type { Locale } from "@/lib/i18n";

const icons = [ClipboardList, MessagesSquare, HeartHandshake, Sprout];

/** Deep plum feature section: four-stage care journey joined by an ECG trace. */
export function CareJourney({ lang }: { lang: Locale }) {
  const t = home[lang].journey;
  return (
    <section data-surface="dark" aria-labelledby="journey-title" className="surface-plum section-y relative isolate overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0 -z-10 dots-light opacity-[0.16]" />
      <div aria-hidden="true" className="absolute inset-0 -z-10 grain opacity-30 mix-blend-soft-light" />
      <div className="shell">
        <SectionHeading id="journey-title" eyebrow={t.eyebrow} title={t.title} lead={t.lead} align="center" tone="dark" />

        <div className="relative mt-16">
          <EcgLine
            gradientId="journey-ecg"
            animate={false}
            className="pointer-events-none absolute inset-x-0 top-10 hidden h-16 w-full opacity-60 lg:block"
          />
          <ol className="relative grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {t.steps.map((step, i) => {
              const Icon = icons[i];
              return (
                <li
                  key={step.title}
                  className="reveal glass-dark glass-edge-dark relative rounded-[2rem] p-7 transition-transform duration-500 hover:-translate-y-1.5"
                  style={{ "--reveal-delay": `${i * 110}ms` } as React.CSSProperties}
                >
                  <div className="flex items-center justify-between">
                    <span className="grid size-14 place-items-center rounded-2xl bg-[linear-gradient(140deg,var(--color-crimson),#a3005a)] shadow-glow-crimson">
                      <Icon className="size-6" aria-hidden="true" />
                    </span>
                    <span aria-hidden="true" className="font-[family-name:var(--font-heading)] text-5xl font-bold text-white/10 tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="mt-7 text-xl font-bold text-white">{step.title}</h3>
                  <p className="mt-2.5 text-plum-100/80">{step.text}</p>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
