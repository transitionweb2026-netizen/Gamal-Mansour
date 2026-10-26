import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { PageView } from "@/components/PageView";

// Content, section order and visibility come from the CMS (lib/cms/registry.ts › "services").
export async function generateMetadata({ params }: PageProps<"/[lang]/services">): Promise<Metadata> {
  const { lang } = await params;
  return hasLocale(lang) ? pageMetadata("services", lang) : {};
}

export default async function Page({ params }: PageProps<"/[lang]/services">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  return <PageView id="services" lang={lang} />;
}
