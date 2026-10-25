import Link from "next/link";
import { CalendarHeart, HeartPulse, MapPin, Stethoscope } from "lucide-react";
import { home } from "@/content/home";
import { site } from "@/content/site";
import { localePath, type Locale } from "@/lib/i18n";

/** Key practice facts — only verified details; unconfirmed ones point to the contact page. */
export function PracticeStrip({ lang }: { lang: Locale }) {
  const t = home[lang].strip;
  const loc = site.locations[0];
  const items = [
    { icon: Stethoscope, label: t.specialty, value: site.specialty[lang] },
    { icon: HeartPulse, label: t.practice, value: site.brandShort[lang] },
    { icon: CalendarHeart, label: t.booking, value: t.bookingValue },
    {
      icon: MapPin,
      label: t.location,
      value: loc ? loc.address[lang] : t.locationPending,
      href: loc ? undefined : localePath(lang, "contact"),
    },
  ];

  return (
    <section id="practice-info" aria-label={t.label} className="surface-blush relative isolate overflow-hidden py-10 sm:py-14">
      <div aria-hidden="true" className="absolute inset-0 -z-10 dots opacity-40 [mask-image:radial-gradient(70%_100%_at_50%_0%,black,transparent)]" />
      <div className="shell">
        <ul className="reveal glass glass-edge grid grid-cols-1 gap-1 rounded-[2rem] p-2 min-[480px]:grid-cols-2 lg:grid-cols-4 lg:rounded-full">
          {items.map((item, i) => {
            const Icon = item.icon;
            const body = (
              <>
                <span
                  className={`grid size-12 shrink-0 place-items-center rounded-full text-white ${
                    i % 2 === 0
                      ? "bg-[linear-gradient(140deg,var(--color-crimson),#a3005a)] shadow-glow-crimson"
                      : "bg-[linear-gradient(140deg,#55107f,var(--color-plum))] shadow-glow-plum"
                  }`}
                >
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <span className="min-w-0 leading-snug">
                  <span className="block text-[0.8rem] font-semibold text-crimson-600">{item.label}</span>
                  <span className="mt-0.5 block font-bold text-plum-800">{item.value}</span>
                </span>
              </>
            );
            return (
              <li key={item.label} className="relative">
                {i > 0 ? (
                  <span aria-hidden="true" className="absolute inset-y-4 start-0 hidden w-px bg-gradient-to-b from-transparent via-plum-700/20 to-transparent lg:block" />
                ) : null}
                {item.href ? (
                  <Link href={item.href} className="flex items-center gap-3.5 rounded-full p-3 transition-colors hover:bg-white/50">
                    {body}
                  </Link>
                ) : (
                  <div className="flex items-center gap-3.5 p-3">{body}</div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
