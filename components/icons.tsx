import { siFacebook, siInstagram, siTiktok, siWhatsapp, siX, siYoutube } from "simple-icons";
import type { SocialPlatform } from "@/content/site";

const brandPaths: Record<SocialPlatform | "whatsapp", string> = {
  facebook: siFacebook.path,
  instagram: siInstagram.path,
  youtube: siYoutube.path,
  tiktok: siTiktok.path,
  x: siX.path,
  whatsapp: siWhatsapp.path,
};

export function BrandIcon({ name, className }: { name: SocialPlatform | "whatsapp"; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" className={className}>
      <path d={brandPaths[name]} />
    </svg>
  );
}
