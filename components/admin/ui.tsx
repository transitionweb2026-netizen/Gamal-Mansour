"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { AlertTriangle, CheckCircle2, Info, Loader2, X, XCircle } from "lucide-react";
import type { Status } from "@/lib/cms/admin/types";

/* ------------------------------------------------------------------ Button */

type BtnVariant = "primary" | "plum" | "outline" | "ghost" | "danger" | "soft";

const btnBase =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-[background-color,box-shadow,color,transform] duration-200 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-crimson";
const btnVariants: Record<BtnVariant, string> = {
  primary: "bg-[linear-gradient(120deg,var(--color-crimson),#b8004c)] text-white shadow-[0_8px_20px_-10px_rgb(220_0_56/0.8)] hover:brightness-110 active:scale-[0.98]",
  plum: "bg-plum-700 text-white shadow-[0_8px_20px_-12px_rgb(60_0_96/0.8)] hover:bg-plum-600 active:scale-[0.98]",
  outline: "bg-white text-plum-800 ring-1 ring-inset ring-plum-700/15 hover:bg-plum-50 hover:ring-plum-700/30",
  ghost: "text-plum-700 hover:bg-plum-700/8",
  danger: "bg-white text-crimson-700 ring-1 ring-inset ring-crimson/30 hover:bg-crimson-50",
  soft: "bg-crimson-50 text-crimson-700 hover:bg-crimson-100",
};
const btnSizes = { sm: "min-h-9 px-3 text-sm", md: "min-h-10.5 px-4 text-[0.92rem]" };

export function Btn({
  variant = "outline",
  size = "md",
  loading = false,
  className = "",
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant; size?: "sm" | "md"; loading?: boolean }) {
  return (
    <button type="button" {...rest} disabled={rest.disabled || loading} aria-busy={loading || undefined} className={`${btnBase} ${btnVariants[variant]} ${btnSizes[size]} ${className}`}>
      {loading ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
      {children}
    </button>
  );
}

export function BtnLink({ href, variant = "outline", size = "md", className = "", children, external }: { href: string; variant?: BtnVariant; size?: "sm" | "md"; className?: string; children: React.ReactNode; external?: boolean }) {
  const cls = `${btnBase} ${btnVariants[variant]} ${btnSizes[size]} ${className}`;
  return external ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
      {children}
    </a>
  ) : (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}

/* -------------------------------------------------------------------- Card */

export function Card({ children, className = "", as: Tag = "section", ...rest }: { children: React.ReactNode; className?: string; as?: "section" | "div" | "article" } & React.HTMLAttributes<HTMLElement>) {
  return (
    <Tag {...rest} className={`rounded-2xl bg-white/80 p-5 shadow-[0_1px_0_rgb(255_255_255),0_12px_32px_-22px_rgb(60_0_96/0.45)] ring-1 ring-plum-700/8 backdrop-blur-sm sm:p-6 ${className}`}>
      {children}
    </Tag>
  );
}

export function PageHeader({ title, description, actions, crumbs }: { title: string; description?: React.ReactNode; actions?: React.ReactNode; crumbs?: Array<{ label: string; href?: string }> }) {
  return (
    <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        {crumbs?.length ? (
          <nav aria-label="Breadcrumb" className="mb-2">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm text-ink-500">
              {crumbs.map((c, i) => (
                <li key={i} className="flex items-center gap-1.5">
                  {c.href ? (
                    <Link href={c.href} className="hover:text-crimson-600">
                      {c.label}
                    </Link>
                  ) : (
                    <span aria-current="page" className="font-medium text-plum-700">
                      {c.label}
                    </span>
                  )}
                  {i < crumbs.length - 1 ? <span aria-hidden="true">/</span> : null}
                </li>
              ))}
            </ol>
          </nav>
        ) : null}
        <h1 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-plum-800 sm:text-[1.7rem]">{title}</h1>
        {description ? <p className="mt-1.5 max-w-3xl text-[0.95rem] text-ink-700">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}

/* ------------------------------------------------------------------ Status */

const statusStyles: Record<Status, string> = {
  published: "bg-emerald-50 text-emerald-800 ring-emerald-600/20",
  changed: "bg-amber-50 text-amber-800 ring-amber-600/25",
  draft: "bg-plum-50 text-plum-700 ring-plum-700/15",
  hidden: "bg-slate-100 text-slate-700 ring-slate-500/20",
};
const statusText: Record<Status, string> = { published: "Published", changed: "Unpublished changes", draft: "Draft", hidden: "Hidden" };

export function StatusPill({ status, className = "" }: { status: Status; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${statusStyles[status]} ${className}`}>
      <span aria-hidden="true" className={`size-1.5 rounded-full ${status === "published" ? "bg-emerald-500" : status === "changed" ? "bg-amber-500" : status === "hidden" ? "bg-slate-400" : "bg-plum-400"}`} />
      {statusText[status]}
    </span>
  );
}

export function Tag({ children, tone = "plum" }: { children: React.ReactNode; tone?: "plum" | "crimson" | "slate" }) {
  const t = tone === "crimson" ? "bg-crimson-50 text-crimson-700" : tone === "slate" ? "bg-slate-100 text-slate-700" : "bg-plum-50 text-plum-700";
  return <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${t}`}>{children}</span>;
}

/* ------------------------------------------------------------------ Notice */

export function Notice({ tone = "info", title, children, className = "" }: { tone?: "info" | "warning" | "error" | "success"; title?: string; children?: React.ReactNode; className?: string }) {
  const styles = {
    info: "bg-plum-50/80 text-plum-800 ring-plum-700/15",
    warning: "bg-amber-50 text-amber-900 ring-amber-600/25",
    error: "bg-crimson-50 text-crimson-800 ring-crimson/25",
    success: "bg-emerald-50 text-emerald-900 ring-emerald-600/20",
  }[tone];
  const Icon = { info: Info, warning: AlertTriangle, error: XCircle, success: CheckCircle2 }[tone];
  return (
    <div role={tone === "error" ? "alert" : "status"} className={`flex gap-3 rounded-xl p-3.5 text-sm ring-1 ring-inset ${styles} ${className}`}>
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <div className="min-w-0">
        {title ? <p className="font-semibold">{title}</p> : null}
        {children ? <div className={title ? "mt-0.5" : ""}>{children}</div> : null}
      </div>
    </div>
  );
}

export function Spinner({ label = "Loading…" }: { label?: string }) {
  return (
    <div role="status" className="flex items-center gap-2.5 py-10 text-sm text-ink-500">
      <Loader2 className="size-5 animate-spin text-crimson" aria-hidden="true" />
      {label}
    </div>
  );
}

export function EmptyState({ icon, title, children, action }: { icon?: React.ReactNode; title: string; children?: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-plum-700/20 bg-white/50 px-6 py-12 text-center">
      {icon ? <div className="mb-3 grid size-12 place-items-center rounded-2xl bg-plum-50 text-plum-600">{icon}</div> : null}
      <p className="font-semibold text-plum-800">{title}</p>
      {children ? <div className="mt-1 max-w-md text-sm text-ink-700">{children}</div> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

/* ------------------------------------------------------------------- Modal */

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "md" | "lg" | "xl";
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  const width = size === "xl" ? "max-w-6xl" : size === "lg" ? "max-w-3xl" : "max-w-lg";
  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === e.currentTarget && onClose()}
      aria-label={title}
      className={`m-auto w-[calc(100%-2rem)] ${width} rounded-2xl bg-white p-0 text-ink shadow-[0_40px_80px_-30px_rgb(31_0_51/0.6)] backdrop:bg-plum-950/50 backdrop:backdrop-blur-[2px]`}
    >
      {open ? (
        <div className="flex max-h-[85dvh] flex-col">
          <div className="flex items-center justify-between gap-4 border-b border-plum-700/10 px-5 py-4">
            <h2 className="font-[family-name:var(--font-heading)] text-lg font-bold text-plum-800">{title}</h2>
            <button type="button" onClick={onClose} aria-label="Close" className="grid size-9 place-items-center rounded-lg text-plum-700 hover:bg-plum-50">
              <X className="size-5" aria-hidden="true" />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
          {footer ? <div className="flex flex-wrap justify-end gap-2 border-t border-plum-700/10 px-5 py-3.5">{footer}</div> : null}
        </div>
      ) : null}
    </dialog>
  );
}

/* -------------------------------------------------------------- formatting */

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

export function timeAgo(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  const s = Math.round((Date.now() - d.getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  if (s < 86400) return `${Math.round(s / 3600)} h ago`;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
