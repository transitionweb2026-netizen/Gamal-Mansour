import { Plus } from "lucide-react";

export type FaqEntry = { q: string; a: string[] };

/** Native <details> accordion: keyboard and screen-reader accessible with no JavaScript. */
export function FaqAccordion({ items, idPrefix }: { items: FaqEntry[]; idPrefix: string }) {
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <details
          key={i}
          id={`${idPrefix}-${i + 1}`}
          className="accordion group glass glass-edge reveal rounded-[1.6rem] transition-shadow duration-300 open:shadow-lift"
        >
          <summary className="flex min-h-16 list-none items-center justify-between gap-4 rounded-[1.6rem] px-6 py-4 text-start text-[1.05rem] font-bold text-plum-800 transition-colors hover:text-crimson-600">
            <span>{item.q}</span>
            <span
              aria-hidden="true"
              className="grid size-9 shrink-0 place-items-center rounded-full bg-plum-700/8 text-plum-700 transition-[transform,background-color,color] duration-500 ease-[var(--ease-spring)] group-open:rotate-45 group-open:bg-crimson group-open:text-white"
            >
              <Plus className="size-4" />
            </span>
          </summary>
          <div className="space-y-3 px-6 pb-6 text-ink-700">
            {item.a.map((p, n) => (
              <p key={n}>{p}</p>
            ))}
          </div>
        </details>
      ))}
    </div>
  );
}
