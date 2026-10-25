import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

type Variant = "primary" | "secondary" | "light" | "outline-light" | "plum";
type Size = "md" | "lg";

const base =
  "group/btn relative inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-full font-semibold whitespace-nowrap transition-[transform,box-shadow,background-color,color] duration-300 ease-[var(--ease-out-expo)] active:scale-[0.98] disabled:pointer-events-none";

const sizes: Record<Size, string> = {
  md: "min-h-11 px-5 text-[0.95rem]",
  lg: "min-h-13 px-7 text-base",
};

const variants: Record<Variant, string> = {
  // Crimson → deep crimson gradient with a soft glow
  primary:
    "bg-[linear-gradient(120deg,var(--color-crimson)_0%,#c8004a_55%,#a3005a_100%)] text-white shadow-glow-crimson hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-12px_rgb(220_0_56/0.7)]",
  // Plum glass outline for light surfaces
  secondary:
    "glass glass-edge text-plum-700 hover:-translate-y-0.5 hover:text-crimson-600",
  // Solid plum
  plum: "bg-[linear-gradient(120deg,var(--color-plum)_0%,#55107f_100%)] text-white shadow-glow-plum hover:-translate-y-0.5",
  // For dark/photographic surfaces
  light: "bg-white text-plum-800 shadow-[0_14px_34px_-14px_rgb(0_0_0/0.55)] hover:-translate-y-0.5 hover:text-crimson-600",
  "outline-light": "glass-dark glass-edge-dark text-white hover:-translate-y-0.5",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
  icon?: React.ReactNode | false;
};

/** Internal or external link styled as a button. External links open in a new tab. */
export function ButtonLink({
  href,
  variant = "primary",
  size = "lg",
  className = "",
  children,
  icon,
  external,
  ...rest
}: CommonProps & { href: string; external?: boolean } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  const cls = `${base} ${sizes[size]} ${variants[variant]} ${className}`;
  const iconNode =
    icon === false ? null : (
      <span className="relative inline-flex size-5 items-center justify-center transition-transform duration-300 group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover/btn:-translate-x-0.5">
        {icon ?? <ArrowUpRight className="size-[1.1rem]" aria-hidden="true" />}
      </span>
    );
  const isExternal = external ?? /^(https?:|tel:|mailto:)/.test(href);
  if (isExternal) {
    const newTab = /^https?:/.test(href);
    return (
      <a href={href} className={cls} {...(newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})} {...rest}>
        <span className="relative">{children}</span>
        {iconNode}
      </a>
    );
  }
  return (
    <Link href={href} className={cls} {...rest}>
      <span className="relative">{children}</span>
      {iconNode}
    </Link>
  );
}

/** Non-link visual used when a contact channel is not yet configured. */
export function ButtonPlaceholder({
  variant = "secondary",
  size = "lg",
  className = "",
  children,
  icon,
}: CommonProps) {
  return (
    <span aria-disabled="true" className={`${base} ${sizes[size]} ${variants[variant]} cursor-not-allowed opacity-70 ${className}`}>
      {icon ? <span className="inline-flex size-5 items-center justify-center">{icon}</span> : null}
      <span className="relative">{children}</span>
    </span>
  );
}
