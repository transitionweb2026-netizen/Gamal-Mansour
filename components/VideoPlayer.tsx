"use client";

import { useState } from "react";
import { Play } from "lucide-react";

/**
 * Click-to-load YouTube facade: shows a poster until the visitor chooses to play, then loads the
 * privacy-enhanced (youtube-nocookie) embed. No third-party requests are made before that.
 */
export function VideoPlayer({ youtubeId, title, playLabel, poster }: { youtubeId: string; title: string; playLabel: string; poster?: string }) {
  const [playing, setPlaying] = useState(false);
  const thumb = poster ?? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;

  if (playing) {
    return (
      <iframe
        className="aspect-video w-full rounded-[1.75rem]"
        src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      className="group relative block aspect-video w-full overflow-hidden rounded-[1.75rem] bg-plum-900"
      aria-label={`${playLabel}: ${title}`}
    >
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
