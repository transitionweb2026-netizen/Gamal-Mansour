import type { LogoAsset } from "@/components/Logo";
import { media } from "@/lib/content/access";
import { getSite } from "@/lib/content/store";

const DEFAULT_LOGO = "static:/brand/logo.png";

/** Logo asset for <Logo>, resolved from Settings (the official artwork unless replaced). */
export function logoAsset(): LogoAsset {
  const ref = getSite().settings.logo || DEFAULT_LOGO;
  const m = media(ref) ?? media(DEFAULT_LOGO)!;
  return { src: m.src, width: m.width, height: m.height, webp: ref === DEFAULT_LOGO };
}

export function logoMarkSrc(): string {
  return media(getSite().settings.logoMark)?.src ?? "/brand/mark.png";
}
