import { BookOpen, Clapperboard, Play } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { Photo } from "@/components/Photo";
import { ButtonLink } from "@/components/Button";
import { SectionHeading } from "@/components/SectionHeading";
import { VideoPlayer } from "@/components/VideoPlayer";
import { EcgLine } from "@/components/EcgLine";
import type { SectionProps } from "@/components/sections/types";
import type { videosFeatured, videosHero, videosPlanned, videosPublished } from "@/content/defaults";
import { itemsFor, media } from "@/lib/content/access";
import { resolveHref } from "@/lib/cms/links";
import type { Locale } from "@/lib/i18n";

/** Published videos that have a playable source. */
export function playableVideos(lang: Locale) {
  return itemsFor("videos", lang)
    .map((v) => {
      const thumb = media(v.thumbnail);
      const file = v.sourceType === "file" ? media(v.file) : null;
      const source =
        v.sourceType === "youtube" && /^[\w-]{6,20}$/.test(v.youtubeId.trim())
          ? ({ type: "youtube", id: v.youtubeId.trim() } as const)
          : v.sourceType === "file" && file?.kind === "video"
            ? ({ type: "file", src: file.src, mime: file.mime } as const)
            : v.sourceType === "url" && /^https:\/\//i.test(v.url.trim())
              ? ({ type: "file", src: v.url.trim(), mime: undefined } as const)
              : null;
      return source ? { ...v, source, poster: thumb?.kind === "image" ? thumb.src : undefined } : null;
    })
    .filter((v) => v !== null);
}

export function VideosHero({ lang, c, sectionId }: SectionProps<typeof videosHero>) {
  return (
    <PageHero
      lang={lang}
      sectionId={sectionId}
      variant="editorial"
      eyebrow={c.eyebrow}
      title={c.title}
      lead={c.lead}
      crumbs={[{ label: c.eyebrow }]}
      image={c.image}
      imageAlt={c.imageAlt}
      focus={c.imageFocus}
    />
  );
}

/** "Coming soon" feature — shown only while no playable videos are published. */
export function VideosFeatured({ lang, c, sectionId }: SectionProps<typeof videosFeatured>) {
  if (playableVideos(lang).length > 0) return null;
  return (
    <section id={sectionId} aria-labelledby={`${sectionId}-title`} className="surface-blush relative isolate overflow-hidden py-16 sm:py-24">
      <div className="shell">
        <div data-surface="dark" className="reveal surface-plum relative isolate grid overflow-hidden rounded-[2.5rem] shadow-lift lg:grid-cols-[1.2fr_1fr]">
          <div className="relative aspect-video lg:aspect-auto lg:min-h-[24rem]">
            <Photo media={c.image} alt={c.imageAlt} sizes="(min-width: 1024px) 60vw, 100vw" className="absolute inset-0 size-full object-cover opacity-80" />
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
            {c.badge ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-crimson px-3.5 py-1.5 text-xs font-bold text-white">
                <Clapperboard className="size-4" aria-hidden="true" />
                {c.badge}
              </span>
            ) : null}
            <h2 id={`${sectionId}-title`} className="mt-5 text-[clamp(1.6rem,3vw,2.3rem)] font-bold text-white">
              {c.title}
            </h2>
            <p className="mt-4 text-plum-100/85">{c.text}</p>
            {c.cta ? (
              <ButtonLink href={resolveHref(c.ctaHref, lang)} variant="light" size="md" className="mt-8" icon={<BookOpen className="size-4" aria-hidden="true" />}>
                {c.cta}
              </ButtonLink>
            ) : null}
            <EcgLine gradientId={`${sectionId}-ecg`} animate={false} className="pointer-events-none absolute inset-x-0 bottom-6 -z-10 h-12 w-full opacity-40" />
          </div>
        </div>
      </div>
    </section>
  );
}

export function VideosPublished({ lang, c, sectionId }: SectionProps<typeof videosPublished>) {
  const videos = playableVideos(lang);
  if (!videos.length) return null;
  return (
    <section id={sectionId} aria-labelledby={`${sectionId}-title`} className="surface-blush section-y">
      <div className="shell">
        <SectionHeading id={`${sectionId}-title`} eyebrow={c.eyebrow} title={c.title} />
        <ul className="mt-12 grid gap-6 md:grid-cols-2">
          {videos.map((v) => (
            <li key={v.id} className="reveal glass glass-edge rounded-[2.25rem] p-3">
              <VideoPlayer source={v.source} title={v.title} playLabel={c.play} poster={v.poster} />
              <div className="p-5">
                {v.topic ? <p className="eyebrow text-crimson-600">{v.topic}</p> : null}
                <h3 className="mt-2 text-xl font-bold text-plum-800">{v.title}</h3>
                {v.description ? <p className="mt-2 text-ink-700">{v.description}</p> : null}
                {v.durationLabel ? <p className="mt-2 text-sm text-ink-500">{v.durationLabel}</p> : null}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function VideosPlanned({ c, sectionId }: SectionProps<typeof videosPlanned>) {
  if (!c.topics.length) return null;
  return (
    <section id={sectionId} aria-labelledby={`${sectionId}-title`} className="surface-lilac section-y relative isolate overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0 -z-10 dots opacity-25 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      <div className="shell">
        <SectionHeading id={`${sectionId}-title`} eyebrow={c.eyebrow} title={c.title} />
        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {c.topics.map((topic, i) => (
            <li key={i} className="reveal glass glass-edge group relative overflow-hidden rounded-[2rem]" style={{ "--reveal-delay": `${(i % 3) * 90}ms` } as React.CSSProperties}>
              <div className="relative aspect-video overflow-hidden bg-plum-800">
                <Photo
                  media={topic.image}
                  alt=""
                  sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
                  className="size-full object-cover grayscale-[0.4] transition-transform duration-700 group-hover:scale-105"
                />
                <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(140deg,rgb(220_0_56/0.45),rgb(60_0_96/0.7))] mix-blend-multiply" />
                {c.badge ? <span className="glass-dark absolute end-4 top-4 rounded-full px-3 py-1 text-xs font-bold text-white">{c.badge}</span> : null}
                <span aria-hidden="true" className="absolute inset-0 grid place-items-center">
                  <span className="grid size-14 place-items-center rounded-full bg-white/20 ring-1 ring-white/40 backdrop-blur-sm">
                    <Play className="size-6 translate-x-0.5 fill-white/90 text-white/90" />
                  </span>
                </span>
              </div>
              <div className="p-6">
                <h3 className="text-[1.1rem] font-bold text-plum-800">{topic.title}</h3>
                <p className="mt-2 text-[0.96rem] text-ink-700">{topic.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
