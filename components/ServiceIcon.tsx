import { Activity, ClipboardCheck, Combine, HeartPulse, Stethoscope, Waypoints } from "lucide-react";

/** Icons a service can use (selectable in the dashboard). */
export const serviceIconOptions = [
  { value: "stethoscope", label: "Stethoscope" },
  { value: "heart-pulse", label: "Heart pulse" },
  { value: "activity", label: "Activity / ECG" },
  { value: "combine", label: "Combined / hybrid" },
  { value: "waypoints", label: "Pathway" },
  { value: "clipboard-check", label: "Checklist" },
] as const;

const map: Record<string, React.ComponentType<{ className?: string }>> = {
  stethoscope: Stethoscope,
  "heart-pulse": HeartPulse,
  activity: Activity,
  combine: Combine,
  waypoints: Waypoints,
  "clipboard-check": ClipboardCheck,
};

export function ServiceIcon({ name, className = "size-6" }: { name: string; className?: string }) {
  const Icon = map[name] ?? Stethoscope;
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
