import type { SiteSettings } from "@/content/site";

/**
 * The site settings document is edited on two dashboard screens. Together they must cover every
 * key of `settingsDefaults` (checked by `npm run cms:verify`).
 */
export const contactSettingsKeys: (keyof SiteSettings)[] = ["contact", "phonePlaceholder", "social", "locations"];
export const siteSettingsKeys: (keyof SiteSettings)[] = ["brand", "brandShort", "doctor", "specialty", "portrait", "portraitAlt", "portraitCaption", "logo", "logoMark", "seo"];
