"use client";

import { useState } from "react";
import Link from "next/link";
import { useCms } from "@/components/admin/CmsProvider";
import { Btn, Notice, Spinner } from "@/components/admin/ui";

/** Landing page for Supabase password-reset and invitation links: set a new password. */
export default function ResetPasswordPage() {
  const { adapter, auth, session } = useCms();
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  return (
    <main className="grid min-h-dvh place-items-center bg-[linear-gradient(170deg,#fcf6f9,#f2ebf7)] px-4 py-10">
      <div className="w-full max-w-md rounded-3xl bg-white/90 p-7 shadow-[0_40px_80px_-40px_rgb(31_0_51/0.5)] ring-1 ring-plum-700/10 sm:p-9">
        <h1 className="font-[family-name:var(--font-heading)] text-xl font-bold text-plum-800">Set a new password</h1>
        {adapter.mode === "local" ? (
          <Notice tone="warning" className="mt-4">
            Passwords are managed by Supabase, which is not configured for this build.
          </Notice>
        ) : auth === "loading" ? (
          <Spinner label="Checking your link…" />
        ) : !session ? (
          <Notice tone="error" className="mt-4" title="This link is invalid or has expired">
            Request a new link from the <Link href="/admin/login/" className="font-semibold underline">sign-in page</Link>.
          </Notice>
        ) : done ? (
          <div className="mt-4 space-y-4">
            <Notice tone="success">Your password has been updated.</Notice>
            <Link href="/admin/" className="inline-flex min-h-11 items-center rounded-xl bg-plum-700 px-4 font-semibold text-white">
              Go to the dashboard
            </Link>
          </div>
        ) : (
          <form
            className="mt-5 space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              setError(null);
              if (password.length < 10) return setError("Use at least 10 characters.");
              if (password !== confirmPw) return setError("The two passwords don't match.");
              setBusy(true);
              try {
                await adapter.updatePassword(password);
                setDone(true);
              } catch (err) {
                setError((err as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            <p className="text-sm text-ink-700">Signed in as {session.email}.</p>
            {error ? <Notice tone="error">{error}</Notice> : null}
            <div>
              <label htmlFor="pw" className="mb-1.5 block text-sm font-semibold text-plum-800">
                New password
              </label>
              <input id="pw" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className="block w-full rounded-xl bg-white px-3.5 py-2.5 ring-1 ring-inset ring-plum-700/15 focus:ring-2 focus:ring-crimson focus:outline-none" />
            </div>
            <div>
              <label htmlFor="pw2" className="mb-1.5 block text-sm font-semibold text-plum-800">
                Repeat new password
              </label>
              <input id="pw2" type="password" autoComplete="new-password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} className="block w-full rounded-xl bg-white px-3.5 py-2.5 ring-1 ring-inset ring-plum-700/15 focus:ring-2 focus:ring-crimson focus:outline-none" />
            </div>
            <Btn type="submit" variant="primary" loading={busy} className="w-full">
              Save new password
            </Btn>
          </form>
        )}
      </div>
    </main>
  );
}
