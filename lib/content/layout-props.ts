import { resolveHref } from "@/lib/cms/links";
import { globalFor, settingsFor } from "@/lib/content/access";
import { logoAsset } from "@/lib/content/brand";
import { localePath, type Locale } from "@/lib/i18n";

/** Props for <SiteHeader>, shared by the public layout and the dashboard preview. */
export function headerProps(lang: Locale) {
  const header = globalFor("header", lang);
  const s = settingsFor(lang);
  const items = globalFor("navigation", lang)
    .items.filter((n) => n.visible)
    .map((n) => ({ key: n.key, href: localePath(lang, n.path), label: n.label }));
  return {
    lang,
    items,
    logo: logoAsset(),
    logoLabel: `${s.brand} — ${s.doctor}`,
    bookHref: resolveHref(header.bookHref, lang),
    labels: {
      mainNav: header.mainNav,
      menu: header.menu,
      openMenu: header.openMenu,
      closeMenu: header.closeMenu,
      bookAppointment: header.bookAppointment,
      switchLanguage: header.switchLanguage,
    },
  };
}
