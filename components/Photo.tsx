import { media } from "@/lib/content/access";
import type { MediaRef } from "@/lib/cms/media";

type PhotoProps = {
  /** Media reference from content (local:, static: or cms:). */
  media: MediaRef;
  alt: string;
  /** Responsive `sizes` attribute describing the rendered width. */
  sizes: string;
  className?: string;
  /** Above-the-fold images load eagerly with high priority. */
  priority?: boolean;
  style?: React.CSSProperties;
};

/**
 * Responsive photo for any media reference. Bundled photos get pre-generated WebP widths, intrinsic
 * dimensions and a blur backdrop; uploaded CMS images use their Storage URL and stored dimensions.
 * Renders nothing when the reference is empty or unknown.
 */
export function Photo({ media: ref, alt, sizes, className, priority = false, style }: PhotoProps) {
  const m = media(ref);
  if (!m || m.kind !== "image") return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- static export with pre-sized assets
    <img
      src={m.src}
      srcSet={m.srcSet}
      sizes={m.srcSet ? sizes : undefined}
      width={m.width}
      height={m.height}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding={priority ? "sync" : "async"}
      className={className}
      style={{
        ...(m.blur ? { backgroundImage: `url(${m.blur})`, backgroundSize: "cover", backgroundPosition: "center" } : {}),
        ...style,
      }}
    />
  );
}
