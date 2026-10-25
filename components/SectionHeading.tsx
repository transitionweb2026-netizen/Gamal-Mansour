type Props = {
  eyebrow?: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  align?: "start" | "center";
  tone?: "light" | "dark";
  as?: "h1" | "h2";
  id?: string;
  className?: string;
};

/** Eyebrow + heading + lead. `tone="dark"` is for deep plum / photographic surfaces. */
export function SectionHeading({ eyebrow, title, lead, align = "start", tone = "light", as: Tag = "h2", id, className = "" }: Props) {
  const center = align === "center";
  return (
    <div className={`reveal ${center ? "mx-auto max-w-3xl text-center" : "max-w-2xl"} ${className}`}>
      {eyebrow ? (
        <p
          className={`eyebrow mb-4 inline-flex items-center gap-3 ${center ? "justify-center" : ""} ${
            tone === "dark" ? "text-crimson-200" : "text-crimson-600"
          }`}
        >
          <span aria-hidden="true" className="h-px w-8 bg-current opacity-70" />
          {eyebrow}
        </p>
      ) : null}
      <Tag
        id={id}
        className={`text-[clamp(1.85rem,4.2vw,3.1rem)] font-bold ${tone === "dark" ? "text-white" : "text-plum-800"}`}
      >
        {title}
      </Tag>
      {lead ? (
        <p className={`mt-5 text-[1.075rem] ${tone === "dark" ? "text-plum-100/85" : "text-ink-700"}`}>{lead}</p>
      ) : null}
    </div>
  );
}
