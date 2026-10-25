import { EcgLine } from "@/components/EcgLine";
import { site } from "@/content/site";
import type { Locale } from "@/lib/i18n";

/**
 * Portrait slot for Dr. Gamal Mansour. Shows the official portrait once `site.portrait` is set;
 * until then it renders a branded artwork panel — never a stock photo of a stand-in person.
 */
export function PortraitFrame({ lang, caption, idSuffix }: { lang: Locale; caption: string; idSuffix: string }) {
  const portrait = site.portrait;

  return (
    <div className="relative mx-auto w-full max-w-[30rem]">
      {/* Offset brand plates behind the frame */}
      <div aria-hidden="true" className="absolute inset-0 translate-x-4 translate-y-5 rotate-[3deg] rounded-[2.75rem] bg-[linear-gradient(140deg,var(--color-crimson),var(--color-plum))] opacity-90 rtl:-translate-x-4 rtl:-rotate-[3deg]" />
      <div aria-hidden="true" className="absolute -inset-3 -z-10 rounded-[3.25rem] hatch opacity-60" />

      <figure className="relative aspect-[4/5] overflow-hidden rounded-[2.75rem] shadow-lift">
        {portrait ? (
          // eslint-disable-next-line @next/next/no-img-element -- static export
          <img src={portrait.src} width={portrait.width} height={portrait.height} alt={site.doctor[lang]} className="size-full object-cover" loading="lazy" />
        ) : (
          <div className="surface-plum relative size-full">
            <div aria-hidden="true" className="absolute inset-0 dots-light opacity-30" />
            <div aria-hidden="true" className="absolute inset-0 grain opacity-40 mix-blend-soft-light" />
            {/* Concentric rings */}
            <div aria-hidden="true" className="absolute inset-0 grid place-items-center">
              {[88, 68, 48].map((s, i) => (
                <span
                  key={s}
                  className="absolute rounded-full border border-white/12"
                  style={{ width: `${s}%`, aspectRatio: "1", opacity: 0.4 + i * 0.2 }}
                />
              ))}
              <span className="absolute size-[30%] rounded-full bg-crimson/40 motion-safe:animate-pulse-ring" />
            </div>
            <div className="absolute inset-0 grid place-items-center">
              <span className="grid aspect-square w-[44%] place-items-center rounded-full bg-[linear-gradient(140deg,#fff,var(--color-blush)_60%,var(--color-lilac))] shadow-[0_30px_60px_-20px_rgb(0_0_0/0.6)]">
                {/* eslint-disable-next-line @next/next/no-img-element -- static export */}
                <img src="/brand/mark.png" width={512} height={473} alt="" className="w-[64%]" loading="lazy" />
              </span>
            </div>
            <EcgLine gradientId={`portrait-ecg-${idSuffix}`} animate={false} className="absolute inset-x-0 top-[68%] h-14 w-full opacity-80" />
          </div>
        )}
        <figcaption className="glass-dark glass-edge-dark absolute inset-x-4 bottom-4 rounded-2xl px-5 py-3.5 text-white">
          <span className="block font-[family-name:var(--font-heading)] text-lg font-bold">{site.doctor[lang]}</span>
          <span className="block text-sm text-white/75" lang="en" dir="ltr">
            {caption}
          </span>
        </figcaption>
      </figure>
    </div>
  );
}
