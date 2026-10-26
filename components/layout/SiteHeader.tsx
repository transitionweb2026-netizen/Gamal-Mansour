"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CalendarHeart, Menu, X } from "lucide-react";
import { Logo, type LogoAsset } from "@/components/Logo";
import { LanguageSwitch } from "@/components/layout/LanguageSwitch";
import { localePath, type Locale } from "@/lib/i18n";

export type HeaderItem = { key: string; href: string; label: string };

type Labels = {
  mainNav: string;
  menu: string;
  openMenu: string;
  closeMenu: string;
  bookAppointment: string;
  switchLanguage: string;
};

const trim = (p: string) => (p.length > 1 ? p.replace(/\/+$/, "") : p);

/** Client component: receives everything as props so no site content enters the browser bundle. */
export function SiteHeader({
  lang,
  items,
  labels,
  logo,
  logoLabel,
  bookHref,
  menuFooter,
}: {
  lang: Locale;
  items: HeaderItem[];
  labels: Labels;
  logo: LogoAsset;
  logoLabel: string;
  bookHref: string;
  /** Server-rendered extras for the mobile menu (contact panel, social). */
  menuFooter?: React.ReactNode;
}) {
  const pathname = trim(usePathname() || `/${lang}`);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the menu after navigating.
  useEffect(() => {
    dialogRef.current?.close();
  }, [pathname]);

  const isActive = (href: string) => {
    const target = trim(href);
    return target === trim(localePath(lang)) ? pathname === target : pathname === target || pathname.startsWith(`${target}/`);
  };

  const contactHref = bookHref;
  const homeHref = localePath(lang);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 px-2.5 pt-2.5 sm:px-5 sm:pt-4">
      <div
        className={`glass glass-edge pointer-events-auto mx-auto flex max-w-[86rem] items-center gap-3 rounded-full ps-4 pe-2 transition-[padding,box-shadow,background-color] duration-500 ease-[var(--ease-out-expo)] sm:ps-6 ${
          scrolled ? "py-1.5 shadow-lift" : "py-2 sm:py-2.5"
        }`}
      >
        <Logo href={homeHref} label={logoLabel} logo={logo} priority className={`w-auto transition-[height] duration-500 ${scrolled ? "h-10" : "h-11 sm:h-12"}`} />

        <nav aria-label={labels.mainNav} className="ms-auto hidden xl:block">
          <ul className="flex items-center gap-0.5">
            {items.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.key}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`relative inline-flex min-h-11 items-center rounded-full px-3.5 text-[0.93rem] font-medium transition-colors duration-300 ${
                      active
                        ? "bg-white/75 text-plum-800 shadow-[inset_0_0_0_1px_rgb(60_0_96/0.08)]"
                        : "text-ink-700 hover:bg-white/45 hover:text-crimson-600"
                    }`}
                  >
                    {item.label}
                    {active ? (
                      <span aria-hidden="true" className="absolute inset-x-4 -bottom-px h-0.5 rounded-full bg-gradient-to-r from-crimson to-plum" />
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="ms-auto flex items-center gap-1.5 sm:gap-2 xl:ms-2">
          <LanguageSwitch lang={lang} label={labels.switchLanguage} />
          <Link
            href={contactHref}
            className="hidden min-h-11 items-center gap-2 rounded-full bg-[linear-gradient(120deg,var(--color-crimson),#a3005a)] px-5 text-[0.93rem] font-semibold text-white shadow-glow-crimson transition-transform duration-300 hover:-translate-y-0.5 sm:inline-flex"
          >
            <CalendarHeart className="size-4" aria-hidden="true" />
            {labels.bookAppointment}
          </Link>
          <button
            ref={triggerRef}
            type="button"
            onClick={() => {
              dialogRef.current?.showModal();
              setOpen(true);
            }}
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-label={labels.openMenu}
            className="grid size-11 place-items-center rounded-full bg-plum-700 text-white transition-colors hover:bg-crimson xl:hidden"
          >
            <Menu className="size-5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <dialog
        ref={dialogRef}
        aria-label={labels.menu}
        onClose={() => {
          setOpen(false);
          triggerRef.current?.focus();
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) dialogRef.current?.close();
        }}
        className="pointer-events-auto fixed inset-0 m-0 h-dvh max-h-none w-full max-w-none bg-transparent p-0 opacity-0 transition-[opacity,display,overlay] duration-300 transition-discrete backdrop:bg-plum-950/45 backdrop:backdrop-blur-[3px] open:opacity-100 starting:open:opacity-0 xl:hidden"
      >
        <div className="surface-dawn ms-auto flex h-full w-full max-w-md flex-col overflow-y-auto shadow-lift transition-transform duration-500 ease-[var(--ease-out-expo)] in-open:translate-x-0 starting:in-open:translate-x-8 rtl:starting:in-open:-translate-x-8">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 grain opacity-[0.18]" />
          <div className="relative flex items-center justify-between gap-3 px-5 pt-5">
            <Logo href={homeHref} label={logoLabel} logo={logo} className="h-11 w-auto" />
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              aria-label={labels.closeMenu}
              className="grid size-11 place-items-center rounded-full bg-plum-700 text-white transition-colors hover:bg-crimson"
              autoFocus
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>

          <nav aria-label={labels.mainNav} className="relative mt-8 px-5">
            <ul className="flex flex-col gap-1">
              {items.map((item, i) => {
                const active = isActive(item.href);
                return (
                  <li key={item.key}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      onClick={() => dialogRef.current?.close()}
                      className={`group flex min-h-14 items-center justify-between rounded-2xl px-4 text-xl font-semibold transition-colors ${
                        active ? "glass glass-edge text-crimson-600" : "text-plum-800 hover:bg-white/50"
                      }`}
                    >
                      <span className="flex items-center gap-4">
                        <span aria-hidden="true" className="w-6 text-sm font-medium text-plum-400 tabular-nums">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        {item.label}
                      </span>
                      <span
                        aria-hidden="true"
                        className={`h-2 w-2 rounded-full bg-gradient-to-br from-crimson to-plum transition-opacity ${active ? "opacity-100" : "opacity-0 group-hover:opacity-60"}`}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="relative mt-auto flex flex-col gap-3 px-5 pt-8 pb-8">
            <Link
              href={contactHref}
              onClick={() => dialogRef.current?.close()}
              className="flex min-h-13 items-center justify-center gap-2 rounded-full bg-[linear-gradient(120deg,var(--color-crimson),#a3005a)] px-6 font-semibold text-white shadow-glow-crimson"
            >
              <CalendarHeart className="size-5" aria-hidden="true" />
              {labels.bookAppointment}
            </Link>
            <LanguageSwitch lang={lang} label={labels.switchLanguage} variant="wide" />
            {menuFooter}
          </div>
        </div>
      </dialog>
    </header>
  );
}
