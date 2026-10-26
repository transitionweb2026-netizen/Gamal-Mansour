import { BrandIcon } from "@/components/icons";
import { socialLinks } from "@/lib/content/access";
import type { SocialPlatform } from "@/content/site";

type Props = {
  label: string;
  comingSoon: string;
  tone?: "dark" | "light";
  size?: "sm" | "md";
  className?: string;
};

const known: SocialPlatform[] = ["facebook", "instagram", "youtube", "tiktok", "x"];

/**
 * Social profile icons (Settings › Contact & Social). Profiles without a confirmed URL render as
 * non-interactive placeholders, so no invented account is ever linked.
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
  const links = socialLinks().filter((s) => known.includes(s.platform));
  if (!links.length) return null;

  return (
    <ul aria-label={label} className={`flex items-center gap-1.5 ${className}`}>
      {links.map((s) => (
        <li key={s.platform}>
          {s.url ? (
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={s.label}
              className={`grid ${box} place-items-center rounded-full transition-all duration-300 ease-[var(--ease-spring)] ${skin} ${hover}`}
            >
              <BrandIcon name={s.platform} className={glyph} />
            </a>
          ) : (
            <span
              role="img"
              aria-label={`${s.label} — ${comingSoon}`}
              title={`${s.label} — ${comingSoon}`}
              className={`grid ${box} place-items-center rounded-full ${skin}`}
            >
              <BrandIcon name={s.platform} className={`${glyph} opacity-80`} />
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
