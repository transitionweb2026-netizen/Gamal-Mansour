import { Alexandria, IBM_Plex_Sans_Arabic, Plus_Jakarta_Sans } from "next/font/google";

// Fonts are downloaded at build time and self-hosted in the static export (no runtime requests to Google).

/** Display face for headings in both scripts. */
export const alexandria = Alexandria({
  subsets: ["arabic", "latin"],
  variable: "--font-alexandria",
  display: "swap",
});

/** Arabic body text. Latin characters fall through to Plus Jakarta Sans. */
export const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "600", "700"],
  variable: "--font-plex-arabic",
  display: "swap",
});

/** English body text. */
export const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const fontVariables = `${alexandria.variable} ${plexArabic.variable} ${jakarta.variable}`;
