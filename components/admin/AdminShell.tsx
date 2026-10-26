"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import {
  Activity,
  BookOpen,
  Clapperboard,
  Cog,
  FileStack,
  Globe2,
  History,
  Images,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  MessageSquareQuote,
  Phone,
  SearchCheck,
  Stethoscope,
  Users,
  X,
} from "lucide-react";
import { CmsProvider, useCms } from "@/components/admin/CmsProvider";
import { Btn, Notice, Spinner } from "@/components/admin/ui";
import { cmsConfig } from "@/lib/cms/admin/config";

type NavItem = { href: string; label: string; icon: React.ComponentType<{ className?: string }>; match?: (path: string, type: string | null) => boolean; adminOnly?: boolean; supabaseOnly?: boolean };

const nav: Array<{ group: string | null; items: NavItem[] }> = [
  { group: null, items: [{ href: "/admin/", label: "Overview", icon: LayoutDashboard }] },
  {
    group: "Website",
    items: [
      { href: "/admin/pages/", label: "Pages", icon: FileStack },
      { href: "/admin/global/", label: "Global content", icon: Globe2 },
      { href: "/admin/seo/", label: "SEO & metadata", icon: SearchCheck },
      { href: "/admin/media/", label: "Media library", icon: Images },
    ],
  },
  {
    group: "Collections",
    items: [
      { href: "/admin/collection/?type=services", label: "Services", icon: Stethoscope, match: (p, t) => p.startsWith("/admin/collection") && t === "services" },
      { href: "/admin/collection/?type=articles", label: "Articles", icon: BookOpen, match: (p, t) => p.startsWith("/admin/collection") && t === "articles" },
      { href: "/admin/collection/?type=videos", label: "Videos", icon: Clapperboard, match: (p, t) => p.startsWith("/admin/collection") && t === "videos" },
      { href: "/admin/collection/?type=reviews", label: "Patient reviews", icon: MessageSquareQuote, match: (p, t) => p.startsWith("/admin/collection") && t === "reviews" },
      { href: "/admin/collection/?type=faqs", label: "FAQ", icon: ListChecks, match: (p, t) => p.startsWith("/admin/collection") && t === "faqs" },
    ],
  },
  {
    group: "Practice",
    items: [
      { href: "/admin/contact/", label: "Contact & social", icon: Phone },
      { href: "/admin/settings/", label: "Site settings", icon: Cog },
    ],
  },
  {
    group: "Administration",
    items: [
      { href: "/admin/revisions/", label: "Revision history", icon: History },
      { href: "/admin/users/", label: "Users & access", icon: Users, adminOnly: true, supabaseOnly: true },
      { href: "/admin/system/", label: "System status", icon: Activity },
    ],
  },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname() ?? "/admin/";
  const type = useSearchParams()?.get("type") ?? null;
  const router = useRouter();
  const { session, isDirty, confirm, setDirty } = useCms();
  const norm = pathname.endsWith("/") ? pathname : `${pathname}/`;

  const go = async (e: React.MouseEvent, href: string) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    if (isDirty()) {
      const ok = await confirm({ title: "Leave without saving?", body: "You have unsaved changes on this page. They will be lost if you leave now.", confirmLabel: "Leave page", danger: true });
      if (!ok) return;
      setDirty("*", false);
    }
    onNavigate?.();
    router.push(href);
  };

  return (
    <nav aria-label="Dashboard" className="flex flex-col gap-5">
      {nav.map((g, gi) => {
        const items = g.items.filter((i) => (!i.adminOnly || session?.role === "admin") && (!i.supabaseOnly || cmsConfig.mode === "supabase"));
        if (!items.length) return null;
        return (
          <div key={gi}>
            {g.group ? <p className="mb-1.5 px-3 text-[0.68rem] font-bold tracking-[0.16em] text-plum-200/70 uppercase">{g.group}</p> : null}
            <ul className="flex flex-col gap-0.5">
              {items.map((item) => {
                const active = item.match ? item.match(norm, type) : item.href === "/admin/" ? norm === "/admin/" : norm.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={(e) => go(e, item.href)}
                      aria-current={active ? "page" : undefined}
                      className={`relative flex min-h-10 items-center gap-3 rounded-xl px-3 text-[0.92rem] font-medium transition-colors ${
                        active ? "bg-white/12 text-white" : "text-plum-100/80 hover:bg-white/7 hover:text-white"
                      }`}
                    >
                      {active ? <span aria-hidden="true" className="absolute inset-y-2 start-0 w-1 rounded-full bg-crimson" /> : null}
                      <Icon className="size-[1.05rem] shrink-0" aria-hidden="true" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col bg-[radial-gradient(120%_60%_at_0%_0%,rgb(220_0_56/0.28),transparent_60%),linear-gradient(180deg,var(--color-plum-800),var(--color-plum-950))] px-3 py-5 text-white">
      <Link href="/admin/" className="mb-6 flex items-center gap-3 rounded-xl px-2">
        <span className="grid size-11 place-items-center rounded-xl bg-[linear-gradient(140deg,#fff,var(--color-blush))]">
          {/* eslint-disable-next-line @next/next/no-img-element -- static export */}
          <img src="/brand/mark.png" width={512} height={473} alt="" className="h-7 w-auto" />
        </span>
        <span className="leading-tight">
          <span className="block font-[family-name:var(--font-heading)] font-bold">Hybrid Hearts</span>
          <span className="block text-xs text-plum-200/80">Content dashboard</span>
        </span>
      </Link>
      <div className="min-h-0 flex-1 overflow-y-auto pe-1">
        <Suspense fallback={null}>
          <NavLinks onNavigate={onNavigate} />
        </Suspense>
      </div>
      <a href="/ar/" target="_blank" rel="noopener noreferrer" className="mt-4 rounded-xl px-3 py-2 text-xs text-plum-200/80 hover:text-white">
        Open the live website ↗
      </a>
    </div>
  );
}

function ModeBadge() {
  const { health } = useCms();
  if (cmsConfig.mode === "local") return <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-900">Local sandbox</span>;
  if (!health) return <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">Checking…</span>;
  if (!health.reachable) return <span className="rounded-full bg-crimson-50 px-2.5 py-1 text-xs font-semibold text-crimson-700">Supabase unreachable</span>;
  if (!health.schemaVersion) return <span className="rounded-full bg-crimson-50 px-2.5 py-1 text-xs font-semibold text-crimson-700">Migration not applied</span>;
  return <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">Connected to Supabase</span>;
}

function Gate({ children }: { children: React.ReactNode }) {
  const { auth, session, adapter, health } = useCms();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (auth === "signed-out") router.replace(`/admin/login/?next=${encodeURIComponent(pathname ?? "/admin/")}`);
  }, [auth, router, pathname]);

  if (auth === "loading" || auth === "signed-out") return <Spinner label="Checking your session…" />;
  if (auth === "no-access") {
    return (
      <div className="mx-auto max-w-lg py-16">
        <Notice tone="warning" title="Your account doesn't have CMS access yet">
          You are signed in as <strong>{session?.email}</strong>, but this account has no editor or administrator role. Ask an administrator to add you under Users &amp; access.
          {health && !health.schemaVersion ? <> The database migration also appears to be missing.</> : null}
        </Notice>
        <Btn className="mt-4" onClick={async () => { await adapter.signOut(); router.replace("/admin/login/"); }}>
          <LogOut className="size-4" aria-hidden="true" /> Sign out
        </Btn>
      </div>
    );
  }
  return <>{children}</>;
}

function TopBar({ onMenu }: { onMenu: () => void }) {
  const { session, adapter, confirm, isDirty } = useCms();
  const router = useRouter();
  return (
    <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-plum-700/8 bg-[#fbf5f9]/85 px-4 py-2.5 backdrop-blur-md sm:px-6">
      <button type="button" onClick={onMenu} aria-label="Open navigation" className="grid size-10 place-items-center rounded-xl text-plum-700 hover:bg-plum-700/8 lg:hidden">
        <Menu className="size-5" aria-hidden="true" />
      </button>
      <ModeBadge />
      <div className="ms-auto flex items-center gap-2">
        {session ? (
          <span className="hidden text-sm text-ink-700 sm:inline">
            {session.email} {session.role ? <span className="text-ink-500">· {session.role}</span> : null}
          </span>
        ) : null}
        {cmsConfig.mode === "supabase" && session ? (
          <Btn
            size="sm"
            variant="ghost"
            onClick={async () => {
              if (isDirty() && !(await confirm({ title: "Sign out with unsaved changes?", body: "Unsaved edits will be lost.", confirmLabel: "Sign out", danger: true }))) return;
              await adapter.signOut();
              router.replace("/admin/login/");
            }}
          >
            <LogOut className="size-4" aria-hidden="true" /> Sign out
          </Btn>
        ) : null}
      </div>
    </div>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const drawer = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = drawer.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <div className="min-h-dvh bg-[radial-gradient(70%_50%_at_100%_0%,rgb(220_0_56/0.07),transparent_70%),radial-gradient(60%_50%_at_0%_100%,rgb(60_0_96/0.08),transparent_70%),linear-gradient(170deg,#fcf6f9,#f4eef8)] lg:grid lg:grid-cols-[16.5rem_minmax(0,1fr)]">
      <a href="#admin-main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:start-2 focus:z-[70] focus:rounded-lg focus:bg-plum-700 focus:px-4 focus:py-2 focus:text-white">
        Skip to content
      </a>
      <aside className="sticky top-0 hidden h-dvh lg:block">
        <Sidebar />
      </aside>
      <dialog ref={drawer} onClose={() => setOpen(false)} aria-label="Navigation" className="m-0 h-dvh max-h-none w-72 max-w-[85vw] bg-transparent p-0 backdrop:bg-plum-950/50 lg:hidden">
        <div className="relative h-full">
          <button type="button" onClick={() => setOpen(false)} aria-label="Close navigation" className="absolute end-3 top-4 z-10 grid size-9 place-items-center rounded-lg text-white hover:bg-white/10">
            <X className="size-5" aria-hidden="true" />
          </button>
          <Sidebar onNavigate={() => setOpen(false)} />
        </div>
      </dialog>
      <div className="min-w-0">
        <TopBar onMenu={() => setOpen(true)} />
        {cmsConfig.mode === "local" ? (
          <div className="border-b border-amber-300/60 bg-amber-50 px-4 py-2.5 text-sm text-amber-950 sm:px-6">
            <strong>Local sandbox:</strong> Supabase is not configured. Edits are stored in this browser only and are not sent to any server.
            Publish here and use <Link className="font-semibold underline" href="/admin/system/">System › Export published content</Link> to build them into the site.
          </div>
        ) : null}
        <main id="admin-main" tabIndex={-1} className="px-4 py-6 outline-none sm:px-6 lg:px-8">
          <Gate>{children}</Gate>
        </main>
      </div>
    </div>
  );
}

/** Dashboard frame: sidebar, top bar and the authentication gate (needs <CmsProvider> above). */
export function DashboardShell({ children }: { children: React.ReactNode }) {
  return <Shell>{children}</Shell>;
}

export { CmsProvider };
