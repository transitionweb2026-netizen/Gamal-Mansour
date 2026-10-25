import { site } from "@/content/site";

// Sends English-preferring browsers to /en/ and everyone else to the Arabic default.
const chooseLanguage = `(function(){try{var l=(navigator.languages&&navigator.languages.length?navigator.languages:[navigator.language||""]);var p="/ar/";for(var i=0;i<l.length;i++){var c=String(l[i]).toLowerCase();if(c.indexOf("ar")===0){p="/ar/";break}if(c.indexOf("en")===0){p="/en/";break}}location.replace(p)}catch(e){location.replace("/ar/")}})();`;

export default function LanguageGateway() {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: chooseLanguage }} />
      <meta httpEquiv="refresh" content="1; url=/ar/" />
      <main className="surface-plum grid min-h-dvh place-items-center px-6 text-center">
        <div className="glass-dark glass-edge-dark w-full max-w-md rounded-[2rem] p-8">
          <div className="mx-auto inline-flex rounded-2xl bg-[linear-gradient(140deg,#fff,var(--color-blush))] p-3">
            {/* eslint-disable-next-line @next/next/no-img-element -- static export */}
            <img src="/brand/logo.png" width={1444} height={675} alt={site.brand.en} className="h-14 w-auto" />
          </div>
          <p className="mt-6 text-plum-100/85">{site.doctor.ar} · {site.doctor.en}</p>
          {/* Plain links on purpose: /ar/ and /en/ use a different root layout, so a full document load is required. */}
          <div className="mt-6 flex justify-center gap-3">
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- crosses root layouts */}
            <a href="/ar/" hrefLang="ar" lang="ar" className="min-h-12 rounded-full bg-crimson px-6 py-3 font-semibold text-white">
              العربية
            </a>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- crosses root layouts */}
            <a href="/en/" hrefLang="en" lang="en" className="min-h-12 rounded-full bg-white px-6 py-3 font-semibold text-plum-800">
              English
            </a>
          </div>
        </div>
      </main>
    </>
  );
}
