import { photos, type PhotoName } from "@/lib/photos";

type PhotoProps = {
  name: PhotoName;
  alt: string;
  /** Responsive `sizes` attribute describing the rendered width. */
  sizes: string;
  className?: string;
  /** Above-the-fold images load eagerly with high priority. */
  priority?: boolean;
  style?: React.CSSProperties;
};

/**
 * Static responsive photo: pre-generated WebP widths, intrinsic dimensions to prevent layout shift,
 * and a tiny inlined blur as the loading backdrop. No image server required.
 */
export function Photo({ name, alt, sizes, className, priority = false, style }: PhotoProps) {
  const p = photos[name];
  const srcSet = p.widths.map((w) => `/images/${name}-${w}.webp ${w}w`).join(", ");
  const fallback = `/images/${name}-${p.widths[Math.min(1, p.widths.length - 1)]}.webp`;
  return (
    // eslint-disable-next-line @next/next/no-img-element -- static export with pre-sized assets
    <img
      src={fallback}
      srcSet={srcSet}
      sizes={sizes}
      width={p.width}
      height={p.height}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding={priority ? "sync" : "async"}
      className={className}
      style={{
        backgroundImage: `url(${p.blur})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        ...style,
      }}
    />
  );
}
