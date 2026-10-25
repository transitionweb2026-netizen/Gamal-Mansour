"use client";

import { useId, useState } from "react";
import { Send } from "lucide-react";
import { BrandIcon } from "@/components/icons";

type Copy = {
  name: string;
  namePlaceholder: string;
  reason: string;
  reasons: string[];
  preferred: string;
  preferredPlaceholder: string;
  note: string;
  notePlaceholder: string;
  submit: string;
  unavailable: string;
  greeting: string;
  labels: { name: string; reason: string; preferred: string; note: string };
};

/**
 * Builds a booking message and opens it in WhatsApp (wa.me) on the visitor's device.
 * Nothing is sent to or stored on any server — there is no backend.
 */
export function WhatsAppComposer({ number, copy }: { number: string | null; copy: Copy }) {
  const id = useId();
  const [name, setName] = useState("");
  const [reason, setReason] = useState(copy.reasons[0] ?? "");
  const [preferred, setPreferred] = useState("");
  const [note, setNote] = useState("");
  const disabled = !number;

  const message = [
    copy.greeting,
    `${copy.labels.name}: ${name.trim()}`,
    `${copy.labels.reason}: ${reason}`,
    preferred.trim() ? `${copy.labels.preferred}: ${preferred.trim()}` : "",
    note.trim() ? `${copy.labels.note}: ${note.trim()}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const field =
    "mt-2 block w-full rounded-2xl border border-plum-700/15 bg-white/80 px-4 py-3 text-ink placeholder:text-ink-500/70 transition-[border-color,box-shadow] focus:border-crimson focus:shadow-[0_0_0_4px_rgb(220_0_56/0.12)] focus:outline-none disabled:cursor-not-allowed disabled:opacity-60";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!number) return;
        const url = `https://wa.me/${number.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
        window.open(url, "_blank", "noopener,noreferrer");
      }}
      className="space-y-5"
    >
      <fieldset disabled={disabled} className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor={`${id}-name`} className="text-sm font-semibold text-plum-800">
            {copy.name}
          </label>
          <input
            id={`${id}-name`}
            required
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={copy.namePlaceholder}
            className={field}
          />
        </div>
        <div>
          <label htmlFor={`${id}-reason`} className="text-sm font-semibold text-plum-800">
            {copy.reason}
          </label>
          <select id={`${id}-reason`} value={reason} onChange={(e) => setReason(e.target.value)} className={field}>
            {copy.reasons.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor={`${id}-preferred`} className="text-sm font-semibold text-plum-800">
            {copy.preferred}
          </label>
          <input
            id={`${id}-preferred`}
            value={preferred}
            onChange={(e) => setPreferred(e.target.value)}
            placeholder={copy.preferredPlaceholder}
            className={field}
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor={`${id}-note`} className="text-sm font-semibold text-plum-800">
            {copy.note}
          </label>
          <textarea
            id={`${id}-note`}
            rows={3}
            maxLength={400}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={copy.notePlaceholder}
            className={`${field} resize-y`}
          />
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={disabled}
        className="inline-flex min-h-13 items-center gap-2.5 rounded-full bg-[linear-gradient(120deg,var(--color-crimson),#a3005a)] px-7 font-semibold text-white shadow-glow-crimson transition-transform duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0"
      >
        <BrandIcon name="whatsapp" className="size-5" />
        {copy.submit}
        <Send className="size-4 rtl:-scale-x-100" aria-hidden="true" />
      </button>
      {disabled ? (
        <p role="note" className="text-sm text-ink-500">
          {copy.unavailable}
        </p>
      ) : null}
    </form>
  );
}
