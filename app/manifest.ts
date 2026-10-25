import type { MetadataRoute } from "next";
import { site } from "@/content/site";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${site.brand.en} — ${site.doctor.en}`,
    short_name: site.brandShort.en,
    description: "Dr. Gamal Mansour — Cardiac Surgery. Hybrid Hearts.",
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
