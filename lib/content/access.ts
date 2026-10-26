import { localize, fill, type Localize } from "@/lib/cms/core";
import { mediaUrl, resolveMedia, type MediaRef, type ResolvedMedia } from "@/lib/cms/media";
import type { GlobalKey, PageId } from "@/lib/cms/registry";
import type { GlobalContent, SectionInstance } from "@/lib/cms/site";
import { getSite } from "@/lib/content/store";
import { SITE_URL } from "@/content/site";
import type { Locale } from "@/lib/i18n";

/* Read helpers for public components. Everything goes through the store — components never
   import content modules directly, so the dashboard preview can render drafts with them. */

export function settingsFor(lang: Locale) {
  return localize(getSite().settings, lang);
}

export function globalFor<K extends GlobalKey>(key: K, lang: Locale): Localize<GlobalContent[K]> {
  return localize(getSite().global[key], lang);
}

export function pageState(id: PageId) {
  return getSite().pages[id];
}

export function visibleSections(id: PageId): SectionInstance[] {
  return getSite().pages[id].sections.filter((s) => s.visible);
}

/** Localized content of a page section (falls back to the global section for shared refs). */
export function sectionFor<T>(id: PageId, key: string, lang: Locale): Localize<T> {
  const s = getSite().pages[id].sections.find((x) => x.key === key);
  const content = s?.ref ? getSite().global[s.ref] : s?.content;
  return localize((content ?? {}) as T, lang);
}

export function isSectionVisible(id: PageId, key: string): boolean {
  return Boolean(getSite().pages[id].sections.find((s) => s.key === key)?.visible);
}

export function media(ref: MediaRef | undefined | null): ResolvedMedia | null {
  return ref ? resolveMedia(ref, getSite().media) : null;
}

export function absoluteUrl(path: string): string {
  return /^https?:/i.test(path) ? path : `${SITE_URL}${path}`;
}

/** Absolute URL for a media reference (Open Graph, JSON-LD). */
export function mediaAbsoluteUrl(ref: MediaRef | undefined | null): string | null {
  if (!ref) return null;
  const url = mediaUrl(ref, getSite().media);
  return url ? absoluteUrl(url) : null;
}

/** Localized, visible items of a collection in display order. */
export function itemsFor<K extends keyof ReturnType<typeof getSite>["collections"]>(key: K, lang: Locale) {
  type Item = ReturnType<typeof getSite>["collections"][K][number];
  return (getSite().collections[key] as Item[])
    .filter((i) => i.visible)
    .map((i) => ({ id: i.id, slug: i.slug, ...localize(i.content as Item["content"], lang) }) as { id: string; slug: string } & Localize<Item["content"]>);
}

export function minutesRead(n: number, lang: Locale): string {
  return fill(globalFor("ui", lang).minutesRead, { n });
}

/* ---------------------------------------------------------------- Contact */

export function contactInfo() {
  const c = getSite().settings.contact;
  const phone = c.phone.trim();
  const whatsapp = c.whatsapp.replace(/\D/g, "");
  const email = c.email.trim();
  return {
    tel: phone ? `tel:${phone.replace(/[^\d+]/g, "")}` : null,
    phoneDisplay: phone ? formatPhone(phone) : getSite().settings.phonePlaceholder,
    whatsappNumber: whatsapp || null,
    whatsapp: (message?: string) =>
      whatsapp ? `https://wa.me/${whatsapp}${message ? `?text=${encodeURIComponent(message)}` : ""}` : null,
    mail: email ? `mailto:${email}` : null,
    email: email || null,
    bookingUrl: webUrl(c.bookingUrl),
  };
}

/** A web address safe to link to, or null. Defence in depth: the dashboard already rejects other schemes. */
function webUrl(value: string): string | null {
  const v = value.trim();
  return /^https?:\/\/\S+$/i.test(v) ? v : null;
}

function formatPhone(p: string): string {
  const digits = p.replace(/[^\d+]/g, "");
  const m = digits.match(/^(\+\d{2})(\d{2,3})(\d{3})(\d{3,4})$/);
  return m ? `${m[1]} ${m[2]} ${m[3]} ${m[4]}` : digits;
}

export function socialLinks() {
  return getSite().settings.social.map((s) => ({ ...s, url: webUrl(s.url) }));
}
