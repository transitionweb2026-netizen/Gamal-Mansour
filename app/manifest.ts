import type { MetadataRoute } from "next";
import { getSite } from "@/lib/content/store";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  const s = getSite().settings;
  return {
    name: `${s.brand.en} — ${s.doctor.en}`,
    short_name: s.brandShort.en,
    description: s.seo.defaultDescription.en,
    start_url: "/ar/",
    display: "standalone",
    background_color: "#fcf5f8",
    theme_color: "#3c0060",
    lang: "ar",
    dir: "rtl",
    icons: [
      { src: "/brand/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/brand/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
