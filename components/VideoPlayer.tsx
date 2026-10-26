"use client";

import { useState } from "react";
import { Play } from "lucide-react";

export type VideoSource = { type: "youtube"; id: string } | { type: "file"; src: string; mime?: string };

/**
 * Video player for CMS videos.
 * - YouTube: click-to-load facade, then the privacy-enhanced youtube-nocookie.com embed.
 *   No third-party requests are made before the visitor presses play.
 * - Uploaded file / external URL: native <video> that only loads metadata until played.
 */
export function VideoPlayer({ source, title, playLabel, poster }: { source: VideoSource; title: string; playLabel: string; poster?: string }) {
  const [playing, setPlaying] = useState(false);

  if (source.type === "file") {
    return (
      <video className="aspect-video w-full rounded-[1.75rem] bg-plum-900" controls preload="metadata" poster={poster} aria-label={title}>
        <source src={source.src} type={source.mime} />
      </video>
    );
  }

  if (playing) {
    return (
      <iframe
        className="aspect-video w-full rounded-[1.75rem]"
        src={`https://www.youtube-nocookie.com/embed/${source.id}?autoplay=1&rel=0`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

  const thumb = poster ?? `https://i.ytimg.com/vi/${source.id}/hqdefault.jpg`;
  return (
    <button type="button" onClick={() => setPlaying(true)} className="group relative block aspect-video w-full overflow-hidden rounded-[1.75rem] bg-plum-900" aria-label={`${playLabel}: ${title}`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- remote poster, static export */}
      <img src={thumb} alt="" loading="lazy" className="size-full object-cover opacity-85 transition-transform duration-700 group-hover:scale-105" />
      <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-plum-950/70 to-transparent" />
      <span className="absolute inset-0 grid place-items-center">
        <span className="grid size-18 place-items-center rounded-full bg-crimson text-white shadow-glow-crimson transition-transform duration-500 group-hover:scale-110">
          <Play className="size-7 translate-x-0.5 fill-current" aria-hidden="true" />
        </span>
      </span>
    </button>
  );
}
