import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { home } from "@/content/home";
import { Hero } from "@/components/home/Hero";
import { PracticeStrip } from "@/components/home/PracticeStrip";
import { DoctorIntro } from "@/components/home/DoctorIntro";
import { ServicesBento } from "@/components/home/ServicesBento";
import { CareJourney } from "@/components/home/CareJourney";
import { WhyChoose } from "@/components/home/WhyChoose";
import { LibraryPreview } from "@/components/home/LibraryPreview";
import { Testimonials } from "@/components/Testimonials";
import { AppointmentCta } from "@/components/AppointmentCta";

export async function generateMetadata({ params }: PageProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = home[lang].meta;
  return pageMetadata({ lang, path: "", absoluteTitle: t.title, description: t.description });
}

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  return (
    <>
      <Hero lang={lang} />
      <PracticeStrip lang={lang} />
      <DoctorIntro lang={lang} />
      <ServicesBento lang={lang} />
      <CareJourney lang={lang} />
      <WhyChoose lang={lang} />
      <Testimonials lang={lang} />
      <LibraryPreview lang={lang} />
      <AppointmentCta lang={lang} />
    </>
  );
}
