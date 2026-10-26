import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { PageView } from "@/components/PageView";

// Content, section order and visibility come from the CMS (lib/cms/registry.ts › "videos").
export async function generateMetadata({ params }: PageProps<"/[lang]/videos">): Promise<Metadata> {
  const { lang } = await params;
  return hasLocale(lang) ? pageMetadata("videos", lang) : {};
}

export default async function Page({ params }: PageProps<"/[lang]/videos">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  return <PageView id="videos" lang={lang} />;
}
