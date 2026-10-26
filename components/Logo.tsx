import Link from "next/link";

export type LogoAsset = { src: string; width?: number; height?: number; webp?: boolean };

/**
 * Official logo artwork. Pure presentational component (props only) so it can be used inside the
 * client-side header without pulling site content into the browser bundle.
 */
export function Logo({
  href,
  label,
  logo,
  className = "h-11 w-auto",
  priority = false,
}: {
  href: string;
  label: string;
  logo: LogoAsset;
  className?: string;
  priority?: boolean;
}) {
  return (
    <Link href={href} className="inline-flex shrink-0 items-center rounded-xl" aria-label={label}>
      <picture>
        {logo.webp ? (
          <source type="image/webp" srcSet="/brand/logo-480.webp 480w, /brand/logo-960.webp 960w" sizes="200px" />
        ) : null}
        <img
          src={logo.src}
          width={logo.width}
          height={logo.height}
          alt=""
          className={className}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
        />
      </picture>
    </Link>
  );
}
