import { BrandIcon } from "@/components/icons";
import { site } from "@/content/site";

type Props = {
  label: string;
  comingSoon: string;
  tone?: "dark" | "light";
  size?: "sm" | "md";
  className?: string;
};

/**
 * Social profile icons. Profiles without a confirmed URL render as non-interactive placeholders
 * (same visual, no link) so no invented account is ever linked.
 */
export function SocialLinks({ label, comingSoon, tone = "dark", size = "md", className = "" }: Props) {
  const box = size === "sm" ? "size-9" : "size-10 sm:size-11";
  const glyph = size === "sm" ? "size-4" : "size-[1.15rem]";
  const skin =
    tone === "dark"
      ? "text-white/90 bg-white/[0.08] ring-1 ring-inset ring-white/15"
      : "text-plum-700 bg-white/60 ring-1 ring-inset ring-plum-700/10";
  const hover =
    tone === "dark"
      ? "hover:-translate-y-0.5 hover:bg-crimson hover:text-white hover:ring-crimson/60 hover:shadow-glow-crimson"
      : "hover:-translate-y-0.5 hover:bg-crimson hover:text-white hover:shadow-glow-crimson";

  return (
    <ul aria-label={label} className={`flex items-center gap-1.5 ${className}`}>
      {site.social.map((s) => (
        <li key={s.id}>
          {s.url ? (
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              className={`grid ${box} place-items-center rounded-full transition-all duration-300 ease-[var(--ease-spring)] ${skin} ${hover}`}
            >
              <BrandIcon name={s.id} className={glyph} />
            </a>
          ) : (
            <span
              role="img"
              aria-label={`${s.label} — ${comingSoon}`}
              title={`${s.label} — ${comingSoon}`}
              className={`grid ${box} place-items-center rounded-full ${skin}`}
            >
              <BrandIcon name={s.id} className={`${glyph} opacity-80`} />
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
