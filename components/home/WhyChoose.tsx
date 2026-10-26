import { Ear, FileText, HeartHandshake, Link2, ShieldCheck, Users } from "lucide-react";
import { Photo } from "@/components/Photo";
import { SectionHeading } from "@/components/SectionHeading";
import { IconTile } from "@/components/ServiceIcon";
import type { SectionProps } from "@/components/sections/types";
import type { homeWhy } from "@/content/defaults";

const icons = [Ear, FileText, Link2, HeartHandshake];

export function WhyChoose({ c, sectionId }: SectionProps<typeof homeWhy>) {
  return (
    <section id={sectionId} aria-labelledby={`${sectionId}-title`} className="surface-dawn section-y relative isolate overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0 -z-10 grain opacity-20" />
      <div className="shell grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
        <div className="reveal relative order-2 lg:order-1">
          <div aria-hidden="true" className="absolute -inset-4 -z-10 rounded-[3rem] hatch opacity-70" />
          <div className="relative aspect-[5/6] overflow-hidden rounded-[2.75rem] bg-plum-100 shadow-lift sm:aspect-[4/3] lg:aspect-[5/6]">
            <Photo media={c.image} alt={c.imageAlt} sizes="(min-width: 1024px) 45vw, 100vw" className="size-full object-cover object-[60%_50%] saturate-[0.55]" />
            {/* Shift clinical colours into the brand range, then deepen the edges */}
            <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(160deg,var(--color-crimson),var(--color-plum))] opacity-45 mix-blend-color" />
            <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(160deg,rgb(220_0_56/0.22),transparent_45%,rgb(60_0_96/0.5))] mix-blend-multiply" />
          </div>
          {c.chip1 ? (
            <div className="glass glass-edge absolute -top-5 start-5 flex items-center gap-3 rounded-2xl py-2.5 ps-2.5 pe-4 shadow-lift motion-safe:animate-float sm:start-8">
              <IconTile className="size-10 rounded-xl">
                <ShieldCheck className="size-5" aria-hidden="true" />
              </IconTile>
              <span className="text-sm font-bold text-plum-800">{c.chip1}</span>
            </div>
          ) : null}
          {c.chip2 ? (
            <div className="glass glass-edge absolute -bottom-6 end-5 flex items-center gap-3 rounded-2xl py-2.5 ps-2.5 pe-4 shadow-lift sm:end-8 [animation-delay:-3s] motion-safe:animate-float">
              <IconTile tone="plum" className="size-10 rounded-xl">
                <Users className="size-5" aria-hidden="true" />
              </IconTile>
              <span className="text-sm font-bold text-plum-800">{c.chip2}</span>
            </div>
          ) : null}
        </div>

        <div className="order-1 lg:order-2">
          <SectionHeading id={`${sectionId}-title`} eyebrow={c.eyebrow} title={c.title} lead={c.lead} />
          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {c.reasons.map((r, i) => {
              const Icon = icons[i % icons.length];
              return (
                <li
                  key={i}
                  className="reveal rounded-[1.75rem] border border-white/70 bg-white/45 p-6 transition-colors duration-300 hover:bg-white/70"
                  style={{ "--reveal-delay": `${i * 90}ms` } as React.CSSProperties}
                >
                  <IconTile tone={i % 2 === 0 ? "crimson" : "plum"} className="size-11 rounded-xl">
                    <Icon className="size-5" aria-hidden="true" />
                  </IconTile>
                  <h3 className="mt-4 text-[1.1rem] font-bold text-plum-800">{r.title}</h3>
                  <p className="mt-1.5 text-[0.97rem] text-ink-700">{r.text}</p>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
