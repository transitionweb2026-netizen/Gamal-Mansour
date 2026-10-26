"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { CheckCircle2, X, XCircle } from "lucide-react";
import { cmsConfig } from "@/lib/cms/admin/config";
import { LocalAdapter } from "@/lib/cms/admin/local-adapter";
import { SupabaseAdapter } from "@/lib/cms/admin/supabase-adapter";
import type { CmsAdapter, Health, SessionInfo } from "@/lib/cms/admin/types";
import { Btn, Modal } from "@/components/admin/ui";

type Toast = { id: number; tone: "success" | "error"; text: string };
type ConfirmOptions = { title: string; body: React.ReactNode; confirmLabel?: string; danger?: boolean };

export type AuthState = "loading" | "signed-out" | "no-access" | "ready";

type Ctx = {
  adapter: CmsAdapter;
  session: SessionInfo | null;
  auth: AuthState;
  health: Health | null;
  refreshSession: () => Promise<void>;
  toast: (tone: Toast["tone"], text: string) => void;
  confirm: (opts: ConfirmOptions) => Promise<boolean>;
  /** Registers unsaved changes so navigation can warn before discarding them. */
  setDirty: (key: string, dirty: boolean) => void;
  isDirty: () => boolean;
  /** Bumped after mutations so lists can reload. */
  revision: number;
  bump: () => void;
};

const CmsContext = createContext<Ctx | null>(null);

export function useCms(): Ctx {
  const ctx = useContext(CmsContext);
  if (!ctx) throw new Error("useCms must be used inside <CmsProvider>");
  return ctx;
}

let sharedAdapter: CmsAdapter | null = null;
function getAdapter(): CmsAdapter {
  sharedAdapter ??= cmsConfig.mode === "supabase" ? new SupabaseAdapter() : new LocalAdapter();
  return sharedAdapter;
}

const noSubscribe = () => () => {};

export function CmsProvider({ children }: { children: React.ReactNode }) {
  // The adapter needs browser APIs. Hydrate with the server's empty markup, then render on the client.
  const isClient = useSyncExternalStore(noSubscribe, () => true, () => false);
  const adapter = isClient ? getAdapter() : null;
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [auth, setAuth] = useState<AuthState>("loading");
  const [health, setHealth] = useState<Health | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmState, setConfirmState] = useState<(ConfirmOptions & { resolve: (v: boolean) => void }) | null>(null);
  const [revision, setRevision] = useState(0);
  // Keys of editors with unsaved changes (a stable mutable set; changes need no re-render).
  const [dirty] = useState(() => new Set<string>());

  const refreshSession = useCallback(async () => {
    if (!adapter) return;
    const [s, h] = await Promise.all([adapter.getSession().catch(() => null), adapter.health()]);
    setSession(s);
    setHealth(h);
    setAuth(!s ? "signed-out" : s.role ? "ready" : "no-access");
  }, [adapter]);

  useEffect(() => {
    if (!adapter) return;
    // Initial session check, then follow sign-in/sign-out events.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loads external auth state
    void refreshSession();
    return adapter.onAuthChange(() => void refreshSession());
  }, [adapter, refreshSession]);

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty.size) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const toast = useCallback((tone: Toast["tone"], text: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t.slice(-2), { id, tone, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), tone === "error" ? 9000 : 4500);
  }, []);

  const confirm = useCallback((opts: ConfirmOptions) => new Promise<boolean>((resolve) => setConfirmState({ ...opts, resolve })), []);

  const value = useMemo<Ctx | null>(
    () =>
      adapter
        ? {
            adapter,
            session,
            auth,
            health,
            refreshSession,
            toast,
            confirm,
            setDirty: (key, isDirty) => {
              if (key === "*" && !isDirty) dirty.clear();
              else if (isDirty) dirty.add(key);
              else dirty.delete(key);
            },
            isDirty: () => dirty.size > 0,
            revision,
            bump: () => setRevision((r) => r + 1),
          }
        : null,
    [adapter, session, auth, health, refreshSession, toast, confirm, revision, dirty],
  );

  if (!value) return null;

  const closeConfirm = (result: boolean) => {
    confirmState?.resolve(result);
    setConfirmState(null);
  };

  return (
    <CmsContext.Provider value={value}>
      {children}
      {/* Raised above the sticky save/publish bar and clear of the page-header actions. */}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-32 z-[60] flex flex-col-reverse items-center gap-2 px-4 sm:bottom-24 sm:items-end">
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.tone === "error" ? "alert" : "status"}
            className={`pointer-events-auto flex max-w-lg items-start gap-3 rounded-xl px-4 py-3 text-sm font-medium shadow-[0_20px_40px_-20px_rgb(31_0_51/0.6)] ring-1 ${
              t.tone === "success" ? "bg-white text-emerald-900 ring-emerald-600/20" : "bg-white text-crimson-800 ring-crimson/30"
            }`}
          >
            {t.tone === "success" ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-hidden="true" /> : <XCircle className="mt-0.5 size-4 shrink-0 text-crimson" aria-hidden="true" />}
            <span className="flex-1">{t.text}</span>
            <button type="button" aria-label="Dismiss" onClick={() => setToasts((x) => x.filter((y) => y.id !== t.id))} className="text-ink-500 hover:text-ink">
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
      <Modal
        open={Boolean(confirmState)}
        onClose={() => closeConfirm(false)}
        title={confirmState?.title ?? ""}
        footer={
          <>
            <Btn onClick={() => closeConfirm(false)}>Cancel</Btn>
            <Btn variant={confirmState?.danger ? "primary" : "plum"} onClick={() => closeConfirm(true)} autoFocus>
              {confirmState?.confirmLabel ?? "Confirm"}
            </Btn>
          </>
        }
      >
        <div className="text-[0.95rem] text-ink-700">{confirmState?.body}</div>
      </Modal>
    </CmsContext.Provider>
  );
}
