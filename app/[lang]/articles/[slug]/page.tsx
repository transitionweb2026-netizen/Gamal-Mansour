import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "@/lib/i18n";
import { articleMetadata } from "@/lib/seo";
import { getSite } from "@/lib/content/store";
import { ArticleView } from "@/components/sections/article";

export const dynamicParams = false;

/** One static page per visible article (Dashboard › Articles), in both languages. */
export function generateStaticParams() {
  return getSite()
    .collections.articles.filter((a) => a.visible)
    .map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/articles/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  return hasLocale(lang) ? articleMetadata(slug, lang) : {};
}

export default async function ArticlePage({ params }: PageProps<"/[lang]/articles/[slug]">) {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) notFound();
  const view = ArticleView({ slug, lang });
  if (!view) notFound();
  return view;
}
