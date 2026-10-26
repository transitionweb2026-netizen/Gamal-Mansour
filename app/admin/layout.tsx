import type { Metadata, Viewport } from "next";
import "../globals.css";
import { fontVariables } from "@/lib/fonts";
import { CmsProvider } from "@/components/admin/CmsProvider";

export const metadata: Metadata = {
  title: { template: "%s · Hybrid Hearts CMS", default: "Hybrid Hearts CMS" },
  robots: { index: false, follow: false, nocache: true },
};

export const viewport: Viewport = { themeColor: "#3c0060", width: "device-width", initialScale: 1 };

/** Root layout of the content dashboard (a client-side app on top of Supabase). */
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" className={fontVariables}>
      <body className="bg-[#fbf5f9]">
        <CmsProvider>{children}</CmsProvider>
      </body>
    </html>
  );
}
