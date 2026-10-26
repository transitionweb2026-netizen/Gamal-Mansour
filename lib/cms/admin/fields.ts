/**
 * Form schema for the dashboard.
 *
 * Fields are DERIVED from each document's default content, so every value that exists in the
 * website content automatically gets an editor (complete coverage by construction). The tables
 * below only refine labels, help text, input types and character guidance.
 */
import { isLText } from "@/lib/cms/core";
import type { ItemTemplates } from "@/lib/cms/conform";
import type { CollectionKey } from "@/lib/cms/registry";
import { serviceIconOptions } from "@/components/ServiceIcon";

export type FieldKind =
  | "text"
  | "textarea"
  | "url"
  | "media"
  | "boolean"
  | "number"
  | "select"
  | "multiselect"
  | "date"
  | "list"
  | "group";

export type Option = { value: string; label: string };

export type Field = {
  key: string;
  /** Dotted path from the document root; list items appear as `[]` (e.g. "steps[].title"). */
  path: string;
  label: string;
  kind: FieldKind;
  /** Localized text has separate Arabic and English values. */
  localized: boolean;
  help?: string;
  /** Character guidance (soft limit shown as a counter). */
  max?: number;
  rows?: number;
  required?: boolean;
  readOnly?: boolean;
  mediaType?: "image" | "video";
  options?: Option[];
  optionsFrom?: "services" | "articles" | "faqCategories";
  inputMode?: "email" | "tel" | "numeric" | "url";
  ltr?: boolean;
  min?: number;
  maxValue?: number;
  /** Children of a group, or the item fields of a list of objects. */
  fields?: Field[];
  /** Item definition of a list of single values. */
  item?: Field;
  itemLabel?: string;
};

type Refine = Partial<Omit<Field, "key" | "path" | "fields" | "item">>;

/* ------------------------------------------------------------ refinements */

const byKey: Record<string, Refine> = {
  eyebrow: { label: "Eyebrow", help: "Small label above the title.", max: 40 },
  title: { label: "Title", max: 90 },
  subtitle: { label: "Subtitle", max: 80 },
  lead: { label: "Introduction", kind: "textarea", max: 260 },
  text: { label: "Text", kind: "textarea" },
  label: { label: "Label", max: 60 },
  badge: { label: "Badge", max: 40 },
  note: { label: "Note", kind: "textarea" },
  cta: { label: "Button label", max: 32, help: "Leave empty to hide the button." },
  ctaHref: { label: "Button destination", kind: "url", required: true },
  primary: { label: "Primary button label", max: 32, help: "Leave empty to hide the button." },
  primaryHref: { label: "Primary button destination", kind: "url", required: true },
  secondary: { label: "Secondary button label", max: 32, help: "Leave empty to hide the button." },
  secondaryHref: { label: "Secondary button destination", kind: "url", required: true },
  askHref: { label: "Button destination", kind: "url", required: true },
  bookHref: { label: "Booking button destination", kind: "url", required: true },
  href: { label: "Button destination", kind: "url", required: true },
  image: { label: "Image", kind: "media", mediaType: "image" },
  imageAlt: { label: "Image description (alt text)", help: "Describes the photo for screen readers and search engines.", max: 140 },
  imageFocus: { label: "Image focal point", help: "Which part stays visible when the photo is cropped — horizontal% vertical%, e.g. 50% 40%.", ltr: true },
  thumbnail: { label: "Thumbnail image", kind: "media", mediaType: "image" },
  photo: { label: "Photo", kind: "media", mediaType: "image", help: "Only with the person's permission." },
  portrait: { label: "Official portrait", kind: "media", mediaType: "image", help: "Leave empty to show the branded artwork frame. Never use a photo of someone else." },
  logo: { label: "Logo", kind: "media", mediaType: "image", help: "The official logo. Keep its proportions." },
  logoMark: { label: "Logo heart mark", kind: "media", mediaType: "image" },
  file: { label: "Video file", kind: "media", mediaType: "video" },
  ogImage: { label: "Social share image", kind: "media", mediaType: "image", help: "Shown when the page is shared (1200 × 630 recommended). Empty = site default." },
  paragraphs: { label: "Paragraphs", itemLabel: "Paragraph" },
  body: { label: "Body paragraphs", itemLabel: "Paragraph" },
  points: { label: "Bullet points", itemLabel: "Point" },
  bullets: { label: "Bullet points", itemLabel: "Point" },
  takeaways: { label: "Key points", itemLabel: "Key point" },
  steps: { label: "Steps", itemLabel: "Step" },
  items: { label: "Items", itemLabel: "Item" },
  reasons: { label: "Reasons", itemLabel: "Reason" },
  topics: { label: "Topics", itemLabel: "Topic" },
  quote: { label: "Quote", kind: "textarea", max: 160 },
  quoteLabel: { label: "Quote label", max: 40 },
  quoteCaption: { label: "Quote caption", max: 60 },
  headlineLead: { label: "Headline — first line", max: 40 },
  headlineAccent: { label: "Headline — highlighted line", max: 40 },
  scroll: { label: "Scroll button label", help: "Read by screen readers only." },
  cardTitle: { label: "Floating card — title", max: 30 },
  cardText: { label: "Floating card — text", max: 30 },
  chip1: { label: "Floating label 1", max: 30 },
  chip2: { label: "Floating label 2", max: 30 },
  featuredTag: { label: "Featured card tag", max: 30 },
  featuredSlug: { label: "Featured service", kind: "select", optionsFrom: "services", help: "Shown as the large photo card here and highlighted on the Services page." },
  bring: { label: "Companion note", kind: "textarea" },
  emptyTitle: { label: "Title when there are no reviews" },
  emptyText: { label: "Text when there are no reviews", kind: "textarea" },
  shareTitle: { label: "“Share your experience” title" },
  shareText: { label: "“Share your experience” text", kind: "textarea" },
  shareCta: { label: "“Share your experience” button" },
  categories: { label: "Question groups", itemLabel: "Group", help: "Questions are assigned to a group under FAQ." },
  minutesRead: { label: "Reading time", help: "{n} is replaced by the number of minutes." },
  titleTemplate: { label: "Page title template", help: "%s is replaced by the page's own title.", max: 60 },
  defaultDescription: { label: "Default description", kind: "textarea", max: 160 },
  description: { label: "Description", kind: "textarea", max: 160 },
  ogTitle: { label: "Social share title", help: "Empty = same as the page title.", max: 70 },
  ogDescription: { label: "Social share description", kind: "textarea", help: "Empty = same as the description.", max: 200 },
  canonical: { label: "Canonical URL", kind: "url", help: "Only if this page's content is published at another address. Usually empty.", ltr: true },
  noindex: { label: "Hide from search engines (noindex)" },
  visible: { label: "Show in menu" },
  icon: { label: "Icon", kind: "select", options: [...serviceIconOptions] },
  verified: { label: "Confirmed by the practice", help: "Turn on once Dr. Mansour confirms this service is offered and the wording is approved." },
  short: { label: "Short description", kind: "textarea", max: 200 },
  related: { label: "Related articles", kind: "multiselect", optionsFrom: "articles" },
  category: { label: "Category", max: 40 },
  published: { label: "Publication date", kind: "date" },
  readingMinutes: { label: "Reading time (minutes)", min: 1, maxValue: 90 },
  medicallyReviewed: { label: "Medically reviewed by Dr. Mansour", help: "Turn on only after the article has been reviewed." },
  author: { label: "Author", help: "Only a verified attribution. Leave empty otherwise." },
  excerpt: { label: "Excerpt", kind: "textarea", max: 240 },
  sections: { label: "Article sections", itemLabel: "Section" },
  heading: { label: "Heading", max: 90 },
  sourceType: {
    label: "Video source",
    kind: "select",
    options: [
      { value: "youtube", label: "YouTube video" },
      { value: "file", label: "Uploaded video file" },
      { value: "url", label: "External video URL (https)" },
    ],
  },
  youtubeId: { label: "YouTube video ID", help: "The part after watch?v= in the YouTube link, e.g. dQw4w9WgXcQ.", ltr: true },
  url: { label: "URL", kind: "url", ltr: true },
  topic: { label: "Topic", max: 40 },
  durationLabel: { label: "Duration label", help: "e.g. 4:30", ltr: true },
  attribution: { label: "Attribution", help: "Name or initials exactly as the patient agreed." },
  context: { label: "Context", help: "Optional, e.g. procedure and year — only with consent." },
  source: { label: "Source", help: "Where the review was given, e.g. Google review.", ltr: true },
  consent: { label: "Patient gave written consent to publish", help: "Required. Reviews without consent can never be published." },
  question: { label: "Question" },
  answer: { label: "Answer paragraphs", itemLabel: "Paragraph" },
  phone: { label: "Phone number", help: "International format, e.g. +201234567890. Empty = “coming soon” placeholder.", inputMode: "tel", ltr: true },
  whatsapp: { label: "WhatsApp number", help: "Digits in international format, e.g. 201234567890. Empty hides WhatsApp.", inputMode: "tel", ltr: true },
  email: { label: "Email address", inputMode: "email", ltr: true },
  bookingUrl: { label: "Online booking page", kind: "url", help: "Optional appointment-platform link.", ltr: true },
  phonePlaceholder: { label: "Phone placeholder", help: "Shown while no phone number is set.", ltr: true },
  social: { label: "Social profiles", itemLabel: "Profile" },
  platform: {
    label: "Platform",
    kind: "select",
    options: [
      { value: "facebook", label: "Facebook" },
      { value: "instagram", label: "Instagram" },
      { value: "youtube", label: "YouTube" },
      { value: "tiktok", label: "TikTok" },
      { value: "x", label: "X (Twitter)" },
    ],
  },
  locations: { label: "Clinic locations", itemLabel: "Location" },
  address: { label: "Address", kind: "textarea" },
  mapUrl: { label: "Map link", kind: "url", help: "Google Maps share link (https).", ltr: true },
  hours: { label: "Opening hours", kind: "textarea" },
  name: { label: "Name" },
  brand: { label: "Practice name" },
  brandShort: { label: "Short practice name" },
  doctor: { label: "Doctor's name" },
  specialty: { label: "Specialty" },
  portraitAlt: { label: "Portrait description (alt text)" },
  portraitCaption: { label: "Portrait caption" },
  credentials: { label: "Qualifications & memberships", itemLabel: "Qualification" },
  experience: { label: "Professional experience", itemLabel: "Position" },
  detail: { label: "Detail" },
  credentialsTitle: { label: "Qualifications heading" },
  experienceTitle: { label: "Experience heading" },
  checklist: { label: "“What to bring” checklist" },
  pending: { label: "“Coming soon” label" },
  pendingNote: { label: "Note while no contact details are set", kind: "textarea" },
  play: { label: "Play button label (screen readers)" },
  involves: { label: "“What it involves” heading" },
  ask: { label: "Button label", max: 32 },
  greeting: { label: "Message greeting", help: "First line of the WhatsApp message." },
  submit: { label: "Send button label" },
  unavailable: { label: "Note while WhatsApp is not configured", kind: "textarea" },
  homeLabel: { label: "Home link label" },
  key: { label: "Menu id", readOnly: true, ltr: true },
  path: { label: "Page", readOnly: true, ltr: true, help: "Fixed page address." },
  id: { label: "Group id", help: "Lowercase letters, numbers and dashes. FAQ questions refer to this id.", ltr: true },
};

/** Exact-path refinements where the same key needs a different meaning. */
const byPath: Record<string, Refine> = {
  "seo.title": { label: "SEO title", max: 60 },
  "seo.description": { label: "SEO description", kind: "textarea", max: 160 },
  "items[].label": { label: "Menu label", max: 24 },
  "items[].visible": { label: "Show in menu" },
  "steps[].title": { label: "Step title", max: 50 },
  "steps[].text": { label: "Step text", kind: "textarea" },
  "reasons[].title": { label: "Title", max: 50 },
  "reasons[].text": { label: "Text", kind: "textarea" },
  "items[].title": { label: "Title", max: 60 },
  "items[].text": { label: "Text", kind: "textarea" },
  "topics[].title": { label: "Topic title" },
  "topics[].text": { label: "Topic description", kind: "textarea" },
  "topics[].image": { label: "Topic image", kind: "media", mediaType: "image" },
  "categories[].title": { label: "Group title" },
  "checklist.items": { label: "Checklist items", itemLabel: "Item" },
  "checklist.title": { label: "Checklist title" },
  reasons: { label: "Reasons", itemLabel: "Reason" },
  "labels.name": { label: "Message label — name" },
  "labels.reason": { label: "Message label — reason" },
  "labels.preferred": { label: "Message label — preferred days" },
  "labels.note": { label: "Message label — notes" },
  "phone.title": { label: "Phone card — title" },
  "phone.text": { label: "Phone card — text" },
  "phone.action": { label: "Phone card — action" },
  "whatsapp.title": { label: "WhatsApp card — title" },
  "whatsapp.text": { label: "WhatsApp card — text" },
  "whatsapp.action": { label: "WhatsApp card — action" },
  "email.title": { label: "Email card — title" },
  "email.text": { label: "Email card — text" },
  "email.action": { label: "Email card — action" },
  "booking.title": { label: "Booking card — title" },
  "booking.text": { label: "Booking card — text" },
  "booking.action": { label: "Booking card — action" },
  // Site settings are derived with the "settings" prefix (see SettingsEditor).
  "settings.seo.ogImage": { label: "Default social share image", kind: "media", mediaType: "image", help: "Used by every page without its own share image (1200 × 630 recommended)." },
  "settings.seo.titleTemplate": { label: "Page title template", help: "%s is replaced by each page's title.", max: 60 },
  "settings.social[].label": { label: "Display name", ltr: true },
  "settings.social[].url": { label: "Profile URL", kind: "url", help: "Full https:// link. Empty = icon shown as “coming soon”.", ltr: true },
};

/** Collection-specific refinements, where a key means something different than elsewhere. */
const byCollection: Partial<Record<CollectionKey, Record<string, Refine>>> = {
  faqs: { category: { label: "Question group", kind: "select", optionsFrom: "faqCategories", help: "The groups are defined under Pages › Reviews & FAQ › FAQ." } },
};

/* ------------------------------------------------------------ derivation */

function humanize(key: string): string {
  const words = key.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/[_-]+/g, " ").toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function looksLikeMedia(value: string): boolean {
  return /^(local|static|cms):/.test(value);
}

function refine(key: string, path: string): Refine {
  return { ...(byKey[key] ?? {}), ...(byPath[path] ?? {}) };
}

/**
 * Derives the editable fields of a document from its template (the default content).
 * `itemTemplates` describes lists whose default is empty (keyed by path, e.g. "credentials").
 */
export function deriveFields(template: object, itemTemplates: ItemTemplates = {}, basePath = ""): Field[] {
  return Object.entries(template).map(([key, value]) => deriveField(key, value, basePath ? `${basePath}.${key}` : key, itemTemplates));
}

function deriveField(key: string, value: unknown, path: string, itemTemplates: ItemTemplates): Field {
  const r = refine(key, path);
  const base = { key, path, label: r.label ?? humanize(key) };

  if (isLText(value)) {
    const longest = Math.max(value.ar.length, value.en.length);
    const kind = r.kind === "textarea" || longest > 90 ? "textarea" : r.kind === "url" ? "url" : "text";
    return { ...base, ...r, kind, localized: true, rows: kind === "textarea" ? Math.min(8, Math.max(3, Math.ceil(longest / 70))) : undefined } as Field;
  }
  if (typeof value === "boolean") return { ...base, ...r, kind: "boolean", localized: false } as Field;
  if (typeof value === "number") return { ...base, ...r, kind: "number", localized: false } as Field;
  if (typeof value === "string") {
    const kind: FieldKind = r.kind ?? (looksLikeMedia(value) ? "media" : /href$|url$/i.test(key) ? "url" : "text");
    return { ...base, ...r, kind, localized: false, mediaType: kind === "media" ? (r.mediaType ?? "image") : undefined, ltr: r.ltr ?? kind !== "text" } as Field;
  }
  if (Array.isArray(value)) {
    const itemTemplate = value.length ? value[0] : itemTemplates[path];
    const itemPath = `${path}[]`;
    if (itemTemplate === undefined || typeof itemTemplate === "string") {
      if (r.kind === "multiselect") return { ...base, ...r, kind: "multiselect", localized: false } as Field;
      return {
        ...base,
        ...r,
        kind: "list",
        localized: false,
        item: { key: "value", path: itemPath, label: r.itemLabel ?? "Item", kind: "text", localized: false, ltr: true },
      } as Field;
    }
    if (isLText(itemTemplate)) {
      const longest = Math.max(...(value as Array<{ ar: string; en: string }>).map((v) => Math.max(v.ar.length, v.en.length)), 0);
      return {
        ...base,
        ...r,
        kind: "list",
        localized: false,
        item: {
          key: "value",
          path: itemPath,
          label: r.itemLabel ?? "Item",
          kind: longest > 80 || ["paragraphs", "body", "answer"].includes(key) ? "textarea" : "text",
          localized: true,
          rows: 4,
        },
      } as Field;
    }
    return {
      ...base,
      ...r,
      kind: "list",
      localized: false,
      fields: deriveFields(itemTemplate as object, itemTemplates, itemPath),
    } as Field;
  }
  if (value && typeof value === "object") {
    return { ...base, ...r, kind: "group", localized: false, fields: deriveFields(value as object, itemTemplates, path) } as Field;
  }
  return { ...base, ...r, kind: "text", localized: false } as Field;
}

/** Fields of a collection item. */
export function collectionFields(key: CollectionKey, template: object): Field[] {
  const overrides = byCollection[key] ?? {};
  return deriveFields(template).map((f) => (overrides[f.path] ? ({ ...f, ...overrides[f.path] } as Field) : f));
}

/** Every leaf path of a field tree (used by the content inventory and coverage checks). */
export function flattenFields(fields: Field[]): Field[] {
  return fields.flatMap((f) => {
    if (f.kind === "group") return flattenFields(f.fields ?? []);
    if (f.kind === "list") return f.fields ? [f, ...flattenFields(f.fields)] : [f, ...(f.item ? [f.item] : [])];
    return [f];
  });
}
