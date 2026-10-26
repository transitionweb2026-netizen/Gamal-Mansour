/**
 * CMS registry — the single description of what is editable and where it renders.
 * Used by the public site (section order/visibility), the dashboard (forms, page editor),
 * the importer/seed (initial records) and the content-inventory generator.
 */
import * as D from "@/content/defaults";
import { credentialItemTemplate } from "@/content/defaults";
import { locationTemplate } from "@/content/site";
import type { ItemTemplates } from "@/lib/cms/conform";

export type PageId = "home" | "about" | "services" | "articles" | "article" | "videos" | "patients" | "contact";
export type GlobalKey = "navigation" | "header" | "footer" | "contactPanel" | "emergency" | "cta" | "ui" | "notFound";
export type CollectionKey = "services" | "articles" | "videos" | "reviews" | "faqs";

export type SectionDef = {
  key: string;
  label: string;
  description: string;
  /** Renderer id used by the public page view. */
  type: string;
  /** Source file of the presentational component (for the content inventory). */
  component: string;
  /** Required sections cannot be hidden from the dashboard. */
  required?: boolean;
  /** Shared global section rendered here (edited once, under Global content). */
  ref?: GlobalKey;
  default?: object;
  itemTemplates?: ItemTemplates;
  /** Collections whose items this section displays. */
  collections?: CollectionKey[];
};

export type PageDef = {
  id: PageId;
  /** Locale-less route ("" = home). Templates use a pattern. */
  route: string;
  label: string;
  description: string;
  /** Template pages (article detail) have no SEO of their own; each article has SEO fields. */
  template?: boolean;
  /** The SEO title is used verbatim instead of through the title template. */
  absoluteTitle?: boolean;
  sections: SectionDef[];
};

const ctaRef: SectionDef = {
  key: "cta",
  label: "Appointment call-to-action",
  description: "Crimson booking band with the contact panel. Shared by most pages.",
  type: "ref",
  component: "components/AppointmentCta.tsx",
  ref: "cta",
};
const emergencyRef: SectionDef = {
  key: "emergency",
  label: "Emergency notice",
  description: "What to do in an emergency. Shared with the footer and article pages.",
  type: "ref",
  component: "components/EmergencyNotice.tsx",
  ref: "emergency",
};

export const pageRegistry: PageDef[] = [
  {
    id: "home",
    route: "",
    label: "Home",
    description: "Landing page with the full-width photographic hero.",
    absoluteTitle: true,
    sections: [
      { key: "hero", label: "Hero", description: "Full-width cover photo, headline, buttons and the social/phone panel.", type: "home.hero", component: "components/home/Hero.tsx", required: true, default: D.homeHero },
      { key: "strip", label: "Practice information strip", description: "Specialty, practice, booking and location facts under the hero.", type: "home.strip", component: "components/home/PracticeStrip.tsx", default: D.homeStrip },
      { key: "intro", label: "Doctor introduction", description: "Portrait frame, principle card and introduction text.", type: "home.intro", component: "components/home/DoctorIntro.tsx", default: D.homeIntro },
      { key: "services", label: "Services overview", description: "Bento grid of services with one featured photo card.", type: "home.services", component: "components/home/ServicesBento.tsx", default: D.homeServices, collections: ["services"] },
      { key: "journey", label: "Care journey", description: "Four-step philosophy of care on the deep plum band.", type: "home.journey", component: "components/home/CareJourney.tsx", default: D.homeJourney },
      { key: "why", label: "Why Hybrid Hearts", description: "Photo with floating chips and four commitments.", type: "home.why", component: "components/home/WhyChoose.tsx", default: D.homeWhy },
      { key: "testimonials", label: "Patient reviews", description: "Shown only when published, consented reviews exist.", type: "home.testimonials", component: "components/Testimonials.tsx", default: D.homeTestimonials, collections: ["reviews"] },
      { key: "library", label: "Heart Library preview", description: "Featured article and three recent articles.", type: "home.library", component: "components/home/LibraryPreview.tsx", default: D.homeLibrary, collections: ["articles"] },
      ctaRef,
    ],
  },
  {
    id: "about",
    route: "about",
    label: "About the doctor",
    description: "Biography, principles of care and the first consultation.",
    sections: [
      { key: "hero", label: "Page hero", description: "Full-width duotone photo with the doctor's name.", type: "about.hero", component: "components/sections/about.tsx", required: true, default: D.aboutHero },
      { key: "bio", label: "Biography", description: "Biography text next to the portrait frame.", type: "about.bio", component: "components/sections/about.tsx", default: D.aboutBio },
      {
        key: "credentials",
        label: "Qualifications & experience",
        description: "Verified qualifications and experience. Hidden on the site while both lists are empty.",
        type: "about.credentials",
        component: "components/sections/about.tsx",
        default: D.aboutCredentials,
        itemTemplates: { credentials: credentialItemTemplate, experience: credentialItemTemplate },
      },
      { key: "principles", label: "Principles of care", description: "Three principles and the practice principle quote.", type: "about.principles", component: "components/sections/about.tsx", default: D.aboutPrinciples },
      { key: "expect", label: "First consultation", description: "What to expect before, during and after the first visit.", type: "about.expect", component: "components/sections/about.tsx", default: D.aboutExpect },
      { key: "practice", label: "Practice identity", description: "Logo card describing Hybrid Hearts.", type: "about.practice", component: "components/sections/about.tsx", default: D.aboutPractice },
      ctaRef,
    ],
  },
  {
    id: "services",
    route: "services",
    label: "Services",
    description: "All service areas with anchored sections.",
    sections: [
      { key: "hero", label: "Page hero", description: "Full-width duotone photo, title and introduction.", type: "services.hero", component: "components/sections/services.tsx", required: true, default: D.servicesHero },
      { key: "index", label: "Service index bar", description: "Sticky row of links to each service.", type: "services.index", component: "components/sections/services.tsx", default: D.servicesIndex, collections: ["services"] },
      { key: "draftNote", label: "Availability note", description: "Shown while any service is not marked as verified.", type: "services.draftNote", component: "components/sections/services.tsx", default: D.servicesDraftNote },
      { key: "list", label: "Service sections", description: "One section per published service (content edited under Services).", type: "services.list", component: "components/sections/services.tsx", required: true, default: D.servicesList, collections: ["services", "articles"] },
      ctaRef,
    ],
  },
  {
    id: "articles",
    route: "articles",
    label: "Heart Library",
    description: "Article index with a featured article and topic filter.",
    sections: [
      { key: "hero", label: "Page hero", description: "Editorial header with a framed photo.", type: "articles.hero", component: "components/sections/articles.tsx", required: true, default: D.articlesHero },
      { key: "featured", label: "Featured article", description: "The first article, presented large.", type: "articles.featured", component: "components/sections/articles.tsx", default: D.articlesFeatured, collections: ["articles"] },
      { key: "all", label: "All articles", description: "Grid of the remaining articles with the topic filter.", type: "articles.all", component: "components/sections/articles.tsx", required: true, default: D.articlesAll, collections: ["articles"] },
      ctaRef,
    ],
  },
  {
    id: "article",
    route: "articles/[slug]",
    label: "Article page template",
    description: "Labels shared by every article page. Article text and SEO are edited under Articles.",
    template: true,
    sections: [
      { key: "header", label: "Article header", description: "Category, title, date and cover photo.", type: "article.header", component: "components/sections/article.tsx", required: true, default: D.articleHeader },
      { key: "body", label: "Article body & side panel", description: "Article sections, key points, contents list and disclaimer.", type: "article.body", component: "components/sections/article.tsx", required: true, default: D.articleBody },
      { key: "askBox", label: "Questions box", description: "Crimson box in the side panel that links to booking.", type: "article.askBox", component: "components/sections/article.tsx", default: D.articleAskBox },
      { key: "related", label: "Related articles", description: "Three related articles and the link back to the library.", type: "article.related", component: "components/sections/article.tsx", default: D.articleRelated, collections: ["articles"] },
    ],
  },
  {
    id: "videos",
    route: "videos",
    label: "Videos",
    description: "Educational video library.",
    sections: [
      { key: "hero", label: "Page hero", description: "Editorial header with a framed photo.", type: "videos.hero", component: "components/sections/videos.tsx", required: true, default: D.videosHero },
      { key: "featured", label: "“Coming soon” feature", description: "Shown while no videos are published.", type: "videos.featured", component: "components/sections/videos.tsx", default: D.videosFeatured },
      { key: "published", label: "Published videos", description: "Grid of published videos (edited under Videos).", type: "videos.published", component: "components/sections/videos.tsx", default: D.videosPublished, collections: ["videos"] },
      { key: "planned", label: "Planned topics", description: "Upcoming video topics with images.", type: "videos.planned", component: "components/sections/videos.tsx", default: D.videosPlanned },
      ctaRef,
    ],
  },
  {
    id: "patients",
    route: "patients",
    label: "Reviews & FAQ",
    description: "Patient reviews and frequently asked questions.",
    sections: [
      { key: "hero", label: "Page hero", description: "Editorial header with a framed photo.", type: "patients.hero", component: "components/sections/patients.tsx", required: true, default: D.patientsHero },
      { key: "reviews", label: "Patient reviews", description: "Published reviews, or the honest empty state.", type: "patients.reviews", component: "components/sections/patients.tsx", default: D.patientsReviews, collections: ["reviews"] },
      { key: "faq", label: "FAQ", description: "Question groups (questions edited under FAQ).", type: "patients.faq", component: "components/sections/patients.tsx", default: D.patientsFaq, collections: ["faqs"] },
      emergencyRef,
      ctaRef,
    ],
  },
  {
    id: "contact",
    route: "contact",
    label: "Contact & appointments",
    description: "Contact channels, booking steps, WhatsApp composer and location.",
    sections: [
      { key: "hero", label: "Page hero", description: "Full-width duotone photo with the contact panel.", type: "contact.hero", component: "components/sections/contact.tsx", required: true, default: D.contactHero },
      { key: "channels", label: "Contact channels", description: "Phone, WhatsApp, email and booking cards (details from Contact & Social).", type: "contact.channels", component: "components/sections/contact.tsx", default: D.contactChannels },
      { key: "steps", label: "How to book", description: "Booking steps and the “what to bring” checklist.", type: "contact.steps", component: "components/sections/contact.tsx", default: D.contactSteps },
      { key: "composer", label: "WhatsApp message composer", description: "Form that prepares a booking message in WhatsApp.", type: "contact.composer", component: "components/WhatsAppComposer.tsx", default: D.contactComposer },
      { key: "location", label: "Address & hours", description: "Clinic locations (details from Contact & Social).", type: "contact.location", component: "components/sections/contact.tsx", default: D.contactLocation },
      emergencyRef,
    ],
  },
];

export type GlobalDef = {
  key: GlobalKey;
  label: string;
  description: string;
  component: string;
  default: object;
  itemTemplates?: ItemTemplates;
  /** Where it appears, for the "Used on" list (page sections that reference it are added automatically). */
  appearsIn: string[];
};

export const globalRegistry: GlobalDef[] = [
  { key: "navigation", label: "Navigation menu", description: "Menu labels in the header, mobile menu and footer.", component: "components/layout/SiteHeader.tsx", default: D.gNavigation, appearsIn: ["Header (every page)", "Mobile menu", "Footer"] },
  { key: "header", label: "Header", description: "Booking button, menu labels and accessibility labels.", component: "components/layout/SiteHeader.tsx", default: D.gHeader, appearsIn: ["Header (every page)", "Mobile menu"] },
  { key: "footer", label: "Footer", description: "Tagline, column titles, disclaimer and copyright line.", component: "components/layout/SiteFooter.tsx", default: D.gFooter, appearsIn: ["Footer (every page)"] },
  { key: "contactPanel", label: "Social & phone panel", description: "Labels of the glass panel with social icons and the phone number.", component: "components/ContactPanel.tsx", default: D.gContactPanel, appearsIn: ["Home hero", "Contact hero", "Appointment call-to-action", "Footer"] },
  { key: "emergency", label: "Emergency notice", description: "Emergency guidance.", component: "components/EmergencyNotice.tsx", default: D.gEmergency, appearsIn: ["Footer (every page)", "Article pages"] },
  { key: "cta", label: "Appointment call-to-action", description: "Crimson booking band near the end of most pages.", component: "components/AppointmentCta.tsx", default: D.gCta, appearsIn: [] },
  { key: "ui", label: "Interface labels", description: "Small labels used across the site (breadcrumbs, reading time, review badge).", component: "components/Breadcrumbs.tsx, components/ArticleCard.tsx, components/Testimonials.tsx", default: D.gUi, appearsIn: ["Breadcrumbs (inner pages)", "Article cards", "Review cards"] },
  { key: "notFound", label: "404 page", description: "Bilingual “page not found” page.", component: "app/global-not-found.tsx", default: D.gNotFound, appearsIn: ["Unknown URLs (404.html)"] },
];

export type CollectionDef = {
  key: CollectionKey;
  label: string;
  singular: string;
  table: string;
  description: string;
  template: object;
  /** Collections with public URLs or anchors need a unique slug. */
  slugged: boolean;
  slugLabel: string;
  appearsIn: string[];
};

export const collectionRegistry: Record<CollectionKey, CollectionDef> = {
  services: { key: "services", label: "Services", singular: "Service", table: "cms_services", description: "Service areas shown on the home page and the Services page.", template: D.serviceTemplate, slugged: true, slugLabel: "Anchor id (used in /services#id)", appearsIn: ["Home › Services overview", "Services page"] },
  articles: { key: "articles", label: "Articles", singular: "Article", table: "cms_articles", description: "Heart Library articles. Each published article gets its own page in both languages.", template: D.articleTemplate, slugged: true, slugLabel: "URL slug (/articles/slug)", appearsIn: ["Home › Heart Library preview", "Heart Library", "Article pages"] },
  videos: { key: "videos", label: "Videos", singular: "Video", table: "cms_videos", description: "Educational videos (YouTube, uploaded file or external URL).", template: D.videoTemplate, slugged: false, slugLabel: "", appearsIn: ["Videos page"] },
  reviews: { key: "reviews", label: "Patient reviews", singular: "Review", table: "cms_reviews", description: "Genuine patient reviews published with written consent.", template: D.reviewTemplate, slugged: false, slugLabel: "", appearsIn: ["Home › Patient reviews", "Reviews & FAQ page"] },
  faqs: { key: "faqs", label: "FAQ", singular: "Question", table: "cms_faqs", description: "Frequently asked questions, grouped by category.", template: D.faqTemplate, slugged: false, slugLabel: "", appearsIn: ["Reviews & FAQ page"] },
};

export const collectionKeys = Object.keys(collectionRegistry) as CollectionKey[];

export const settingsItemTemplates: ItemTemplates = { locations: locationTemplate };

export function getPageDef(id: string): PageDef | undefined {
  return pageRegistry.find((p) => p.id === id);
}

export function getGlobalDef(key: string): GlobalDef | undefined {
  return globalRegistry.find((g) => g.key === key);
}

/** Pages whose section list references a global section. */
export function globalUsage(key: GlobalKey): string[] {
  const refs = pageRegistry.flatMap((p) => p.sections.filter((s) => s.ref === key).map(() => p.label));
  return [...(getGlobalDef(key)?.appearsIn ?? []), ...refs];
}
