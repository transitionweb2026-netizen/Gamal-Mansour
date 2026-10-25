import { Activity, ClipboardCheck, Combine, HeartPulse, Stethoscope, Waypoints } from "lucide-react";
import type { ServiceIconName } from "@/content/services";

const map = {
  stethoscope: Stethoscope,
  "heart-pulse": HeartPulse,
  activity: Activity,
  combine: Combine,
  waypoints: Waypoints,
  "clipboard-check": ClipboardCheck,
} satisfies Record<ServiceIconName, React.ComponentType<{ className?: string }>>;

export function ServiceIcon({ name, className = "size-6" }: { name: ServiceIconName; className?: string }) {
  const Icon = map[name];
  return <Icon className={className} aria-hidden="true" />;
}

/** Gradient icon tile used across cards. */
export function IconTile({
  children,
  tone = "crimson",
  className = "",
}: {
  children: React.ReactNode;
  tone?: "crimson" | "plum" | "glass";
  className?: string;
}) {
  const skin =
    tone === "crimson"
      ? "bg-[linear-gradient(140deg,var(--color-crimson),#a3005a)] text-white shadow-glow-crimson"
      : tone === "plum"
        ? "bg-[linear-gradient(140deg,#55107f,var(--color-plum))] text-white shadow-glow-plum"
        : "bg-white/70 text-crimson-600 ring-1 ring-inset ring-white";
  return <span className={`relative grid size-13 shrink-0 place-items-center rounded-2xl ${skin} ${className}`}>{children}</span>;
}
