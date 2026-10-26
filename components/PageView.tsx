import type { ComponentType } from "react";
import { Hero } from "@/components/home/Hero";
import { PracticeStrip } from "@/components/home/PracticeStrip";
import { DoctorIntro } from "@/components/home/DoctorIntro";
import { ServicesBento } from "@/components/home/ServicesBento";
import { CareJourney } from "@/components/home/CareJourney";
import { WhyChoose } from "@/components/home/WhyChoose";
import { LibraryPreview } from "@/components/home/LibraryPreview";
import { AppointmentCta } from "@/components/AppointmentCta";
import { EmergencyNotice } from "@/components/EmergencyNotice";
import { AboutBio, AboutCredentials, AboutExpect, AboutHero, AboutPractice, AboutPrinciples } from "@/components/sections/about";
import { ServicesDraftNote, ServicesHero, ServicesIndex, ServicesList } from "@/components/sections/services";
import { ArticlesAll, ArticlesFeatured, ArticlesHero } from "@/components/sections/articles";
import { VideosFeatured, VideosHero, VideosPlanned, VideosPublished } from "@/components/sections/videos";
import { HomeTestimonials, PatientsFaq, PatientsHero, PatientsReviews } from "@/components/sections/patients";
import { ContactChannels, ContactComposer, ContactHero, ContactLocation, ContactSteps } from "@/components/sections/contact";
import type { SectionProps } from "@/components/sections/types";
import { localize } from "@/lib/cms/core";
import type { PageId } from "@/lib/cms/registry";
import { getSite } from "@/lib/content/store";
import type { Locale } from "@/lib/i18n";

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- each renderer types its own content
type Renderer = ComponentType<SectionProps<any>>;

/** Section type (from lib/cms/registry.ts) → presentational component. */
const renderers: Record<string, Renderer> = {
  "home.hero": Hero,
  "home.strip": PracticeStrip,
  "home.intro": DoctorIntro,
  "home.services": ServicesBento,
  "home.journey": CareJourney,
  "home.why": WhyChoose,
  "home.testimonials": HomeTestimonials,
  "home.library": LibraryPreview,
  "about.hero": AboutHero,
  "about.bio": AboutBio,
  "about.credentials": AboutCredentials,
  "about.principles": AboutPrinciples,
  "about.expect": AboutExpect,
  "about.practice": AboutPractice,
  "services.hero": ServicesHero,
  "services.index": ServicesIndex,
  "services.draftNote": ServicesDraftNote,
  "services.list": ServicesList,
  "articles.hero": ArticlesHero,
  "articles.featured": ArticlesFeatured,
  "articles.all": ArticlesAll,
  "videos.hero": VideosHero,
  "videos.featured": VideosFeatured,
  "videos.published": VideosPublished,
  "videos.planned": VideosPlanned,
  "patients.hero": PatientsHero,
  "patients.reviews": PatientsReviews,
  "patients.faq": PatientsFaq,
  "contact.hero": ContactHero,
  "contact.channels": ContactChannels,
  "contact.steps": ContactSteps,
  "contact.composer": ContactComposer,
  "contact.location": ContactLocation,
  "ref.cta": AppointmentCta,
  "ref.emergency": ({ lang, sectionId }) => <EmergencyNotice lang={lang} sectionId={sectionId} />,
};

export function hasRenderer(type: string): boolean {
  return type in renderers;
}

/** Renders a page's visible sections in their saved order. */
export function PageView({ id, lang }: { id: PageId; lang: Locale }) {
  const site = getSite();
  const sections = site.pages[id].sections.filter((s) => s.visible);
  return (
    <>
      {sections.map((s, i) => {
        const type = s.ref ? `ref.${s.ref}` : s.type;
        const Render = renderers[type];
        if (!Render) return null;
        const content = s.ref ? site.global[s.ref] : s.content;
        return <Render key={s.key} lang={lang} c={localize(content, lang)} sectionId={s.key} nextId={sections[i + 1]?.key} />;
      })}
    </>
  );
}
