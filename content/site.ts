/**
 * ============================================================================
 *  SITE CONFIGURATION — the single place for real-world practice details.
 * ============================================================================
 *
 *  Anything set to `null` below is a PLACEHOLDER that has not been verified.
 *  The website hides or softens elements whose data is missing, and never
 *  dials or links to an invented number or profile.
 *
 *  To go live, replace the nulls with verified details and rebuild.
 *  See README.md → "Content still to confirm".
 */

import type { L10n } from "@/lib/i18n";

export type SocialId = "facebook" | "instagram" | "youtube" | "tiktok" | "x";

export type SocialLink = {
  id: SocialId;
  label: string;
  /** Full profile URL. `null` = not yet provided (icon renders as a non-interactive placeholder). */
  url: string | null;
};

export const site = {
  /**
   * Production origin used for canonical URLs, hreflang, Open Graph and the sitemap.
   * Set NEXT_PUBLIC_SITE_URL at build time (e.g. https://www.example-clinic.com).
   * The fallback uses the reserved `.example` domain so a missing value is obvious.
   */
  url: (process.env.NEXT_PUBLIC_SITE_URL || "https://hybrid-hearts.example").replace(/\/+$/, ""),

  brand: {
    ar: "هايبرد هارتس لجراحة القلب",
    en: "Hybrid Hearts Cardiac Surgery",
  } satisfies L10n,

  brandShort: {
    ar: "هايبرد هارتس",
    en: "Hybrid Hearts",
  } satisfies L10n,

  doctor: {
    ar: "د. جمال منصور",
    en: "Dr. Gamal Mansour",
  } satisfies L10n,

  /** Verified from the supplied logo: the practice focus is cardiac surgery. */
  specialty: {
    ar: "جراحة القلب",
    en: "Cardiac Surgery",
  } satisfies L10n,

  /**
   * Official portrait of Dr. Gamal Mansour. Place the file in /public/images and set the path,
   * e.g. "/images/dr-gamal-mansour.webp". While null, a branded artwork frame is shown instead.
   */
  portrait: null as null | { src: string; width: number; height: number },

  contact: {
    /** E.164 phone number, e.g. "+201234567890". PLACEHOLDER until provided. */
    phone: null as string | null,
    /** WhatsApp number in international format without "+", e.g. "201234567890". PLACEHOLDER. */
    whatsapp: null as string | null,
    /** Public email address. PLACEHOLDER. */
    email: null as string | null,
    /** External booking page (e.g. an appointment platform profile). Optional. */
    bookingUrl: null as string | null,
  },

  /** Clinic locations. Leave empty until the address is confirmed. */
  locations: [] as Array<{
    name: L10n;
    address: L10n;
    mapUrl: string | null;
    hours: L10n | null;
  }>,

  social: [
    { id: "facebook", label: "Facebook", url: null },
    { id: "instagram", label: "Instagram", url: null },
    { id: "youtube", label: "YouTube", url: null },
    { id: "tiktok", label: "TikTok", url: null },
  ] satisfies SocialLink[] as SocialLink[],
};

/** What visitors see in place of an unconfirmed phone number. */
export const phonePlaceholder = "+20 1•• ••• ••••";

export function telHref(): string | null {
  return site.contact.phone ? `tel:${site.contact.phone.replace(/[^\d+]/g, "")}` : null;
}

export function whatsappHref(message?: string): string | null {
  if (!site.contact.whatsapp) return null;
  const base = `https://wa.me/${site.contact.whatsapp.replace(/\D/g, "")}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function mailHref(): string | null {
  return site.contact.email ? `mailto:${site.contact.email}` : null;
}

/** Human-readable phone, grouped for legibility. Falls back to the visible placeholder. */
export function phoneDisplay(): string {
  const p = site.contact.phone;
  if (!p) return phonePlaceholder;
  const digits = p.replace(/[^\d+]/g, "");
  const m = digits.match(/^(\+\d{2})(\d{2,3})(\d{3})(\d{3,4})$/);
  return m ? `${m[1]} ${m[2]} ${m[3]} ${m[4]}` : digits;
}

export const isPlaceholder = {
  phone: () => !site.contact.phone,
  whatsapp: () => !site.contact.whatsapp,
  email: () => !site.contact.email,
};
