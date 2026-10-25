import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static HTML export: `next build` writes a self-contained site to ./out
  output: "export",
  // Emit /about/index.html so conventional static hosts resolve clean URLs without rewrites.
  trailingSlash: true,
  // The default image optimizer needs a server; images are pre-sized WebP files in /public/images.
  images: { unoptimized: true },
  reactStrictMode: true,
  experimental: {
    // Root layout lives under app/[lang], so unmatched URLs need a standalone 404 document.
    globalNotFound: true,
  },
  turbopack: {
    // Pin the workspace root to this project (a stray lockfile exists in a parent folder).
    root: process.cwd(),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
