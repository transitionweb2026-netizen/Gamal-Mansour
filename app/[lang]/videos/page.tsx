import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookOpen, Clapperboard, Play } from "lucide-react";
import { hasLocale, localePath } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";
import { plannedTopics, videos, videosPage } from "@/content/videos";
import { PageHero } from "@/components/PageHero";
import { Photo } from "@/components/Photo";
import { ButtonLink } from "@/components/Button";
import { SectionHeading } from "@/components/SectionHeading";
import { VideoPlayer } from "@/components/VideoPlayer";
import { EcgLine } from "@/components/EcgLine";
import { AppointmentCta } from "@/components/AppointmentCta";

export async function generateMetadata({ params }: PageProps<"/[lang]/videos">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = videosPage[lang].meta;
  return pageMetadata({ lang, path: "videos", title: t.title, description: t.description });
}

export default async function VideosPage({ params }: PageProps<"/[lang]/videos">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = videosPage[lang];

  return (
    <>
      <PageHero
        lang={lang}
        variant="editorial"
        eyebrow={t.hero.eyebrow}
        title={t.hero.title}
        lead={t.hero.lead}
        crumbs={[{ label: t.hero.eyebrow }]}
        photo="ecg-screen"
        photoAlt={t.featured.imageAlt}
      />

      {videos.length > 0 ? (
        <section aria-labelledby="published-title" className="surface-blush section-y">
          <div className="shell">
            <SectionHeading id="published-title" eyebrow={t.published.eyebrow} title={t.published.title} />
            <ul className="mt-12 grid gap-6 md:grid-cols-2">
              {videos.map((v) => (
                <li key={v.youtubeId} className="reveal glass glass-edge rounded-[2.25rem] p-3">
                  <VideoPlayer
                    youtubeId={v.youtubeId}
                    title={v.title[lang]}
                    playLabel={t.published.play}
                    poster={v.poster ? `/images/${v.poster}-1080.webp` : undefined}
                  />
                  <div className="p-5">
                    <p className="eyebrow text-crimson-600">{v.topic[lang]}</p>
                    <h3 className="mt-2 text-xl font-bold text-plum-800">{v.title[lang]}</h3>
                    <p className="mt-2 text-ink-700">{v.description[lang]}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : (
        <section aria-labelledby="featured-video-title" className="surface-blush relative isolate overflow-hidden py-16 sm:py-24">
          <div className="shell">
            <div
              data-surface="dark"
              className="reveal surface-plum relative isolate grid overflow-hidden rounded-[2.5rem] shadow-lift lg:grid-cols-[1.2fr_1fr]"
            >
              <div className="relative aspect-video lg:aspect-auto lg:min-h-[24rem]">
                <Photo name="ecg-monitor" alt={t.featured.imageAlt} sizes="(min-width: 1024px) 60vw, 100vw" className="absolute inset-0 size-full object-cover opacity-80" />
                <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(120deg,rgb(220_0_56/0.35),rgb(60_0_96/0.6))] mix-blend-multiply" />
                <div aria-hidden="true" className="absolute inset-0 grid place-items-center">
                  <span className="relative grid size-20 place-items-center rounded-full bg-white/15 ring-1 ring-white/40 backdrop-blur-md">
                    <span className="absolute inset-0 rounded-full bg-crimson/40 motion-safe:animate-pulse-ring" />
                    <Play className="relative size-8 translate-x-0.5 fill-white text-white" />
                  </span>
                </div>
              </div>
              <div className="relative p-8 sm:p-12">
                <div aria-hidden="true" className="absolute inset-0 -z-10 dots-light opacity-15" />
                <span className="inline-flex items-center gap-2 rounded-full bg-crimson px-3.5 py-1.5 text-xs font-bold text-white">
                  <Clapperboard className="size-4" aria-hidden="true" />
                  {t.featured.badge}
                </span>
                <h2 id="featured-video-title" className="mt-5 text-[clamp(1.6rem,3vw,2.3rem)] font-bold text-white">
                  {t.featured.title}
                </h2>
                <p className="mt-4 text-plum-100/85">{t.featured.text}</p>
                <ButtonLink
                  href={localePath(lang, "articles")}
                  variant="light"
                  size="md"
                  className="mt-8"
                  icon={<BookOpen className="size-4" aria-hidden="true" />}
                >
                  {t.featured.cta}
                </ButtonLink>
                <EcgLine gradientId="video-ecg" animate={false} className="pointer-events-none absolute inset-x-0 bottom-6 -z-10 h-12 w-full opacity-40" />
              </div>
            </div>
          </div>
        </section>
      )}

      <section aria-labelledby="planned-title" className="surface-lilac section-y relative isolate overflow-hidden">
        <div aria-hidden="true" className="absolute inset-0 -z-10 dots opacity-25 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
        <div className="shell">
          <SectionHeading id="planned-title" eyebrow={t.planned.eyebrow} title={t.planned.title} />
          <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {plannedTopics.map((topic, i) => (
              <li
                key={topic.title.en}
                className="reveal glass glass-edge group relative overflow-hidden rounded-[2rem]"
                style={{ "--reveal-delay": `${(i % 3) * 90}ms` } as React.CSSProperties}
              >
                <div className="relative aspect-video overflow-hidden">
                  <Photo
                    name={topic.image}
                    alt=""
                    sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
                    className="size-full object-cover grayscale-[0.4] transition-transform duration-700 group-hover:scale-105"
                  />
                  <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(140deg,rgb(220_0_56/0.45),rgb(60_0_96/0.7))] mix-blend-multiply" />
                  <span className="glass-dark absolute end-4 top-4 rounded-full px-3 py-1 text-xs font-bold text-white">{t.planned.badge}</span>
                  <span aria-hidden="true" className="absolute inset-0 grid place-items-center">
                    <span className="grid size-14 place-items-center rounded-full bg-white/20 ring-1 ring-white/40 backdrop-blur-sm">
                      <Play className="size-6 translate-x-0.5 fill-white/90 text-white/90" />
                    </span>
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="text-[1.1rem] font-bold text-plum-800">{topic.title[lang]}</h3>
                  <p className="mt-2 text-[0.96rem] text-ink-700">{topic.text[lang]}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <AppointmentCta lang={lang} />
    </>
  );
}
