"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { KeyRound, LogIn } from "lucide-react";
import { useCms } from "@/components/admin/CmsProvider";
import { Btn, Notice } from "@/components/admin/ui";
import { cmsConfig } from "@/lib/cms/admin/config";

const inputCls = "block w-full rounded-xl bg-white px-3.5 py-2.5 ring-1 ring-inset ring-plum-700/15 focus:ring-2 focus:ring-crimson focus:outline-none";

function LoginForm() {
  const { adapter, auth, refreshSession } = useCms();
  const router = useRouter();
  const next = useSearchParams()?.get("next") || "/admin/";
  const safeNext = next.startsWith("/admin") ? next : "/admin/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => {
    if (cmsConfig.mode === "supabase" && auth === "ready") router.replace(safeNext);
  }, [auth, router, safeNext]);

  if (cmsConfig.mode === "local") {
    return (
      <div className="space-y-4">
        <Notice tone="warning" title="Supabase is not configured">
          Sign-in uses Supabase Auth, which is not set up for this build. You can explore and edit in the <strong>local sandbox</strong> — changes stay in this browser and nothing is sent to a server.
        </Notice>
        <Link href="/admin/" className="inline-flex min-h-11 items-center rounded-xl bg-plum-700 px-4 font-semibold text-white hover:bg-plum-600">
          Open the local sandbox
        </Link>
      </div>
    );
  }

  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError(null);
        try {
          const s = await adapter.signIn(email, password);
          await refreshSession();
          router.replace(s.role ? safeNext : "/admin/");
        } catch (err) {
          setError((err as Error).message);
        } finally {
          setBusy(false);
        }
      }}
    >
      {error ? <Notice tone="error">{error}</Notice> : null}
      {resetSent ? <Notice tone="success">If an account exists for {email}, a password-reset link is on its way.</Notice> : null}
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-plum-800">
          Email
        </label>
        <input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
      </div>
      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-plum-800">
          Password
        </label>
        <input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} />
      </div>
      <Btn type="submit" variant="primary" loading={busy} className="w-full">
        <LogIn className="size-4" aria-hidden="true" /> Sign in
      </Btn>
      <button
        type="button"
        className="inline-flex items-center gap-2 text-sm font-semibold text-plum-700 hover:text-crimson-600"
        onClick={async () => {
          if (!email) {
            setError("Enter your email address first, then choose “Forgot password”.");
            return;
          }
          setError(null);
          try {
            await adapter.sendPasswordReset(email, `${window.location.origin}/admin/reset-password/`);
            setResetSent(true);
          } catch (err) {
            setError((err as Error).message);
          }
        }}
      >
        <KeyRound className="size-4" aria-hidden="true" /> Forgot password
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="grid min-h-dvh place-items-center bg-[radial-gradient(80%_60%_at_100%_0%,rgb(220_0_56/0.12),transparent_70%),radial-gradient(70%_60%_at_0%_100%,rgb(60_0_96/0.14),transparent_70%),linear-gradient(170deg,#fcf6f9,#f2ebf7)] px-4 py-10">
      <div className="w-full max-w-md rounded-3xl bg-white/85 p-7 shadow-[0_40px_80px_-40px_rgb(31_0_51/0.5)] ring-1 ring-plum-700/10 backdrop-blur sm:p-9">
        <div className="mb-7 flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-2xl bg-[linear-gradient(140deg,#fff,var(--color-blush))] ring-1 ring-plum-700/10">
            {/* eslint-disable-next-line @next/next/no-img-element -- static export */}
            <img src="/brand/mark.png" width={512} height={473} alt="" className="h-8 w-auto" />
          </span>
          <div>
            <h1 className="font-[family-name:var(--font-heading)] text-xl font-bold text-plum-800">Hybrid Hearts CMS</h1>
            <p className="text-sm text-ink-500">Sign in to manage the website</p>
          </div>
        </div>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
