/**
 * ============================================================================
 *  SITE SETTINGS — default values (editable in the dashboard: Settings,
 *  Contact & Social). These seed the CMS and are the fallback when the CMS has
 *  no published value.
 * ============================================================================
 *
 *  Empty strings are PLACEHOLDERS for facts that have not been verified.
 *  The website hides or softens elements whose data is missing and never dials
 *  or links to an invented number or profile.
 */

export type SocialPlatform = "facebook" | "instagram" | "youtube" | "tiktok" | "x";

export const settingsDefaults = {
  /** Verified from the supplied logo. */
  brand: { ar: "هايبرد هارتس لجراحة القلب", en: "Hybrid Hearts Cardiac Surgery" },
  brandShort: { ar: "هايبرد هارتس", en: "Hybrid Hearts" },
  doctor: { ar: "د. جمال منصور", en: "Dr. Gamal Mansour" },
  specialty: { ar: "جراحة القلب", en: "Cardiac Surgery" },

  /** Official portrait (media reference). Empty → branded artwork frame is shown instead. */
  portrait: "",
  portraitAlt: { ar: "د. جمال منصور", en: "Dr. Gamal Mansour" },
  portraitCaption: { ar: "Hybrid Hearts — Cardiac Surgery", en: "Hybrid Hearts — Cardiac Surgery" },

  /** Official logo artwork and the heart mark cut from it. */
  logo: "static:/brand/logo.png",
  logoMark: "static:/brand/mark.png",

  contact: {
    /** E.164 phone number, e.g. "+201234567890". */
    phone: "",
    /** WhatsApp number in international format, e.g. "201234567890". */
    whatsapp: "",
    email: "",
    /** External booking page (appointment platform), optional. */
    bookingUrl: "",
  },
  /** Shown instead of an unconfirmed phone number. */
  phonePlaceholder: "+20 1•• ••• ••••",

  social: [
    { platform: "facebook" as SocialPlatform, label: "Facebook", url: "" },
    { platform: "instagram" as SocialPlatform, label: "Instagram", url: "" },
    { platform: "youtube" as SocialPlatform, label: "YouTube", url: "" },
    { platform: "tiktok" as SocialPlatform, label: "TikTok", url: "" },
  ],

  /** Clinic locations. Empty until the address is confirmed. */
  locations: [] as Array<{
    name: { ar: string; en: string };
    address: { ar: string; en: string };
    mapUrl: string;
    hours: { ar: string; en: string };
  }>,

  seo: {
    /** `%s` is replaced with the page title. */
    titleTemplate: { ar: "%s | د. جمال منصور", en: "%s | Dr. Gamal Mansour" },
    defaultDescription: {
      ar: "د. جمال منصور — جراحة القلب. هايبرد هارتس.",
      en: "Dr. Gamal Mansour — Cardiac Surgery. Hybrid Hearts.",
    },
    ogImage: "static:/og/og-default.jpg",
  },
};

export type SiteSettings = typeof settingsDefaults;

export const locationTemplate = {
  name: { ar: "", en: "" },
  address: { ar: "", en: "" },
  mapUrl: "",
  hours: { ar: "", en: "" },
};

/**
 * Production origin used for canonical URLs, hreflang, Open Graph and the sitemap.
 * Set NEXT_PUBLIC_SITE_URL at build time. The fallback uses the reserved `.example` domain.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://hybrid-hearts.example").replace(/\/+$/, "");
