/**
 * CMS default documents
 * ---------------------
 * The real website content, reshaped into CMS documents. These values:
 *   1. seed the Supabase CMS (dashboard "Import website content" / supabase/seed.sql),
 *   2. populate the dashboard in local mode, and
 *   3. are the build fallback for anything the CMS has not published.
 *
 * Text is authored per language in the content modules (home.ts, about.ts, …) and zipped here
 * into `{ ar, en }` leaves. Shared values (images, link destinations, options) are added with
 * `withShared` — these were previously hard-coded inside components.
 */
import { zip, zipList, withShared, emptyLText } from "@/lib/cms/core";
import { navigation, globalText } from "@/content/common";
import { home } from "@/content/home";
import { about, credentials as credentialSource, experience as experienceSource } from "@/content/about";
import { pages } from "@/content/pages";
import { patients, testimonials as testimonialSource } from "@/content/patients";
import { contact } from "@/content/contact";
import { videosPage, plannedTopics as plannedSource, videos as videoSource } from "@/content/videos";
import { services as serviceSource } from "@/content/services";
import { articles as articleSource } from "@/content/articles";

const H = zip(home.ar, home.en, "home");
const A = zip(about.ar, about.en, "about");
const P = zip(pages.ar, pages.en, "pages");
const PT = zip(patients.ar, patients.en, "patients");
const C = zip(contact.ar, contact.en, "contact");
const V = zip(videosPage.ar, videosPage.en, "videos");
const G = zip(globalText.ar, globalText.en, "global");

/* ----------------------------------------------------------------- SEO */

export const seoTemplate = {
  title: emptyLText(),
  description: emptyLText(),
  ogTitle: emptyLText(),
  ogDescription: emptyLText(),
  ogImage: "",
  canonical: "",
  noindex: false,
};
export type SeoDoc = typeof seoTemplate;

function seo(meta: { title: { ar: string; en: string }; description: { ar: string; en: string } }): SeoDoc {
  return { ...seoTemplate, title: meta.title, description: meta.description, ogTitle: emptyLText(), ogDescription: emptyLText() };
}

export const pageSeo = {
  home: seo(H.meta),
  about: seo(A.meta),
  services: seo(P.services.meta),
  articles: seo(P.articles.meta),
  videos: seo(V.meta),
  patients: seo(PT.meta),
  contact: seo(C.meta),
};

/* ------------------------------------------------------- Global sections */

export const gNavigation = {
  items: navigation.map((n) => ({ key: n.key as string, path: n.path, label: n.label, visible: true })),
};
export const gHeader = withShared(G.header, { bookHref: "/contact" });
export const gFooter = G.footer;
export const gContactPanel = G.contactPanel;
export const gEmergency = G.emergency;
export const gCta = withShared(P.cta, { image: "local:stethoscope-burgundy", primaryHref: "/contact" });
export const gUi = G.ui;
export const gNotFound = G.notFound;

/* ----------------------------------------------------------- Home page */

export const homeHero = withShared(H.hero, {
  image: "local:hero-team",
  primaryHref: "/contact",
  secondaryHref: "/services",
});
export const homeStrip = H.strip;
export const homeIntro = withShared(H.intro, { ctaHref: "/about" });
export const homeServices = withShared(H.services, { featuredSlug: "hybrid-procedures", ctaHref: "/services" });
export const homeJourney = H.journey;
export const homeWhy = withShared(H.why, { image: "local:surgical-team" });
export const homeTestimonials = { eyebrow: PT.reviews.eyebrow, title: PT.reviews.title };
export const homeLibrary = withShared(H.library, { ctaHref: "/articles" });

/* ---------------------------------------------------------- About page */

export const aboutHero = withShared(A.hero, { image: "local:or-monochrome", imageFocus: "50% 45%" });
export const aboutBio = A.bio;
export const credentialItemTemplate = { title: emptyLText(), detail: emptyLText() };
export const aboutCredentials = {
  credentialsTitle: A.credentialsTitle,
  experienceTitle: A.experienceTitle,
  credentials: credentialSource.map((c) => ({ title: c.title, detail: c.detail })),
  experience: experienceSource.map((c) => ({ title: c.title, detail: c.detail })),
};
export const aboutPrinciples = A.principles;
export const aboutExpect = A.expect;
export const aboutPractice = A.practice;

/* ------------------------------------------------------- Services page */

export const servicesHero = withShared(P.services.hero, { image: "local:hybrid-cathlab", imageFocus: "50% 55%" });
export const servicesIndex = P.services.index;
export const servicesDraftNote = P.services.draftNote;
export const servicesList = withShared(P.services.list, { askHref: "/contact" });

/* ------------------------------------------------- Heart Library pages */

export const articlesHero = withShared(P.articles.hero, { image: "local:heart-model", imageFocus: "50% 40%" });
export const articlesFeatured = P.articles.featured;
export const articlesAll = P.articles.all;
export const articleHeader = P.article.header;
export const articleBody = P.article.body;
export const articleAskBox = withShared(P.article.askBox, { href: "/contact" });
export const articleRelated = P.article.related;

/* ---------------------------------------------------------- Videos page */

export const videosHero = withShared(V.hero, { image: "local:ecg-screen", imageFocus: "50% 50%" });
export const videosFeatured = withShared(V.featured, { image: "local:ecg-monitor", ctaHref: "/articles" });
export const videosPublished = V.published;
export const videosPlanned = withShared(V.planned, {
  topics: plannedSource.map((t) => ({ title: t.title, text: t.text, image: `local:${t.image}` })),
});

/* -------------------------------------------------------- Patients page */

export const patientsHero = withShared(PT.hero, { image: "local:stethoscope-heart-light", imageFocus: "50% 50%" });
export const patientsReviews = PT.reviews;
// Group ids are shared identifiers (not translated), so they come from the source, not the zipped tree.
const faqGroupIds = patients.ar.groups.map((g) => g.id);

export const patientsFaq = withShared(PT.faq, {
  categories: PT.groups.map((g, i) => ({ id: faqGroupIds[i], title: g.title })),
});

/* --------------------------------------------------------- Contact page */

export const contactHero = withShared(C.hero, { image: "local:stethoscope-burgundy", imageFocus: "50% 35%" });
export const contactChannels = C.channels;
export const contactSteps = withShared(C.steps, { checklist: C.checklist });
export const contactComposer = C.composer;
export const contactLocation = C.location;

/* ---------------------------------------------------------- Collections */

export const serviceTemplate = {
  icon: "stethoscope",
  image: "",
  imageAlt: emptyLText(),
  verified: false,
  title: emptyLText(),
  short: emptyLText(),
  body: [emptyLText()],
  points: [emptyLText()],
  related: [""],
};
export type ServiceDoc = typeof serviceTemplate;

export const articleTemplate = {
  image: "",
  imageAlt: emptyLText(),
  category: emptyLText(),
  published: "",
  readingMinutes: 5,
  medicallyReviewed: false,
  author: emptyLText(),
  title: emptyLText(),
  excerpt: emptyLText(),
  takeaways: [emptyLText()],
  sections: [{ heading: emptyLText(), paragraphs: [emptyLText()], bullets: [emptyLText()] }],
  seo: { title: emptyLText(), description: emptyLText(), ogImage: "" },
};
export type ArticleDoc = typeof articleTemplate;

export const videoTemplate = {
  sourceType: "youtube",
  youtubeId: "",
  file: "",
  url: "",
  thumbnail: "",
  title: emptyLText(),
  description: emptyLText(),
  topic: emptyLText(),
  durationLabel: "",
};
export type VideoDoc = typeof videoTemplate;

export const reviewTemplate = {
  quote: emptyLText(),
  attribution: emptyLText(),
  context: emptyLText(),
  source: "",
  photo: "",
  consent: false,
};
export type ReviewDoc = typeof reviewTemplate;

export const faqTemplate = { category: "appointments", question: emptyLText(), answer: [emptyLText()] };
export type FaqDoc = typeof faqTemplate;

export type CollectionItem<T> = { id: string; slug: string; position: number; visible: boolean; content: T };

export const defaultServices: CollectionItem<ServiceDoc>[] = serviceSource.map((s, i) => ({
  id: `service-${s.slug}`,
  slug: s.slug,
  position: i,
  visible: true,
  content: {
    icon: s.icon,
    image: `local:${s.image}`,
    imageAlt: s.imageAlt,
    verified: s.status === "confirmed",
    title: s.title,
    short: s.short,
    body: zipList(s.body, `${s.slug}.body`),
    points: zipList(s.points, `${s.slug}.points`),
    related: [...s.related],
  },
}));

export const defaultArticles: CollectionItem<ArticleDoc>[] = articleSource.map((a, i) => ({
  id: `article-${a.slug}`,
  slug: a.slug,
  position: i,
  visible: true,
  content: {
    image: `local:${a.image}`,
    imageAlt: a.imageAlt,
    category: a.category,
    published: a.published,
    readingMinutes: a.readingMinutes,
    medicallyReviewed: a.reviewStatus === "reviewed",
    author: emptyLText(),
    title: a.title,
    excerpt: a.excerpt,
    takeaways: zipList(a.takeaways, `${a.slug}.takeaways`),
    sections: zip(a.sections.ar, a.sections.en, `${a.slug}.sections`).map((s) => ({
      heading: s.heading,
      paragraphs: s.paragraphs,
      bullets: s.bullets ?? [],
    })),
    seo: { title: emptyLText(), description: emptyLText(), ogImage: "" },
  },
}));

export const defaultVideos: CollectionItem<VideoDoc>[] = videoSource.map((v, i) => ({
  id: `video-${v.youtubeId}`,
  slug: v.youtubeId,
  position: i,
  visible: true,
  content: {
    ...videoTemplate,
    youtubeId: v.youtubeId,
    title: v.title,
    description: v.description,
    topic: v.topic,
    thumbnail: v.poster ? `local:${v.poster}` : "",
    durationLabel: v.durationLabel ?? "",
  },
}));

export const defaultReviews: CollectionItem<ReviewDoc>[] = testimonialSource.map((t, i) => ({
  id: `review-${i + 1}`,
  slug: `review-${i + 1}`,
  position: i,
  visible: true,
  content: {
    quote: t.quote,
    attribution: t.attribution,
    context: t.context ?? emptyLText(),
    source: t.source ?? "",
    photo: "",
    consent: true,
  },
}));

// Positions run across the whole collection (one ordered list, displayed grouped by category).
export const defaultFaqs: CollectionItem<FaqDoc>[] = PT.groups
  .flatMap((g, gi) =>
    g.items.map((item, i) => ({
      id: `faq-${faqGroupIds[gi]}-${i + 1}`,
      slug: `faq-${faqGroupIds[gi]}-${i + 1}`,
      visible: true,
      content: { category: faqGroupIds[gi], question: item.q, answer: item.a },
    })),
  )
  .map((item, position) => ({ ...item, position }));
