"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import { useCms } from "@/components/admin/CmsProvider";
import { useLoad } from "@/components/admin/useLoad";
import { Btn, Card, Notice, PageHeader, Spinner, Tag, timeAgo } from "@/components/admin/ui";

export default function UsersPage() {
  const { adapter, session, toast, confirm, bump } = useCms();
  const isAdmin = session?.role === "admin" && adapter.mode === "supabase";
  const { data, error, loading } = useLoad(() => (isAdmin ? adapter.listUsers() : Promise.resolve([])), [adapter, isAdmin]);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"editor" | "admin">("editor");
  const [busy, setBusy] = useState(false);

  if (!isAdmin) {
    return (
      <>
        <PageHeader title="Users & access" crumbs={[{ label: "Dashboard", href: "/admin/" }, { label: "Users & access" }]} />
        <Notice tone="info">{adapter.mode === "supabase" ? "Only administrators can manage users." : "User management needs the dashboard to be connected to Supabase."}</Notice>
      </>
    );
  }

  const grant = async (targetEmail: string, targetRole: "admin" | "editor", displayName = "") => {
    setBusy(true);
    try {
      await adapter.setRole(targetEmail, targetRole, displayName);
      toast("success", `${targetEmail} is now ${targetRole === "admin" ? "an administrator" : "an editor"}.`);
      setEmail("");
      setName("");
      bump();
    } catch (e) {
      toast("error", (e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Users & access"
        description="Editors can edit and publish content and media. Administrators can also manage who has access."
        crumbs={[{ label: "Dashboard", href: "/admin/" }, { label: "Users & access" }]}
      />
      <Notice tone="info" className="mb-5" title="Adding someone">
        1) Invite the person in your Supabase project (Authentication › Users › Invite). 2) Once their account exists, give it a role below. Accounts without a role cannot read or change anything.
      </Notice>
      <Card className="mb-6">
        <form
          className="grid gap-3 md:grid-cols-[1.4fr_1fr_auto_auto] md:items-end"
          onSubmit={(e) => {
            e.preventDefault();
            void grant(email, role, name);
          }}
        >
          <label className="text-sm font-semibold text-plum-800">
            Email
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5 block w-full rounded-xl bg-white px-3.5 py-2.5 font-normal ring-1 ring-inset ring-plum-700/15 focus:ring-2 focus:ring-crimson focus:outline-none" />
          </label>
          <label className="text-sm font-semibold text-plum-800">
            Display name (optional)
            <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5 block w-full rounded-xl bg-white px-3.5 py-2.5 font-normal ring-1 ring-inset ring-plum-700/15 focus:ring-2 focus:ring-crimson focus:outline-none" />
          </label>
          <label className="text-sm font-semibold text-plum-800">
            Role
            <select value={role} onChange={(e) => setRole(e.target.value as "editor" | "admin")} className="mt-1.5 block rounded-xl bg-white px-3 py-2.5 font-normal ring-1 ring-inset ring-plum-700/15">
              <option value="editor">Editor</option>
              <option value="admin">Administrator</option>
            </select>
          </label>
          <Btn type="submit" variant="primary" loading={busy}>
            <UserPlus className="size-4" aria-hidden="true" /> Give access
          </Btn>
        </form>
      </Card>
      {error ? <Notice tone="error">{error}</Notice> : null}
      {loading && !data ? <Spinner /> : null}
      {data ? (
        <Card className="p-0 sm:p-0">
          <ul className="divide-y divide-plum-700/8">
            {data.map((u) => (
              <li key={u.userId} className="flex flex-wrap items-center gap-3 px-5 py-3">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-plum-800">
                    {u.displayName || u.email} {u.userId === session?.userId ? <Tag>You</Tag> : null}
                  </p>
                  <p className="text-xs text-ink-500">
                    {u.email} · last sign-in {timeAgo(u.lastSignInAt)}
                  </p>
                </div>
                <select
                  aria-label={`Role for ${u.email}`}
                  value={u.role}
                  onChange={(e) => grant(u.email, e.target.value as "admin" | "editor")}
                  className="rounded-xl bg-white px-3 py-2 text-sm ring-1 ring-plum-700/15"
                >
                  <option value="editor">Editor</option>
                  <option value="admin">Administrator</option>
                </select>
                <Btn
                  size="sm"
                  variant="danger"
                  onClick={async () => {
                    const ok = await confirm({ title: "Remove access?", body: `${u.email} will no longer be able to use the dashboard. Their Supabase account itself is not deleted.`, confirmLabel: "Remove access", danger: true });
                    if (!ok) return;
                    try {
                      await adapter.removeUser(u.userId);
                      toast("success", "Access removed.");
                      bump();
                    } catch (e) {
                      toast("error", (e as Error).message);
                    }
                  }}
                >
                  Remove
                </Btn>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </>
  );
}
