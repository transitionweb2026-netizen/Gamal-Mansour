/**
 * Supabase adapter — the real CMS backend. Every call runs as the signed-in user with the
 * publishable key; permissions are enforced in the database by Row Level Security
 * (supabase/migrations). Nothing here can bypass those rules.
 */
import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import { collectionKeys, collectionRegistry, type CollectionKey } from "@/lib/cms/registry";
import { seedItems, seedPages, seedSections, seedSettings } from "@/lib/cms/seed-data";
import type { PublishedSnapshot } from "@/lib/cms/site";
import { cmsConfig } from "@/lib/cms/admin/config";
import { getSupabase, urlSessionReady } from "@/lib/cms/admin/supabase-client";
import { publicUrl, readMediaInfo, storagePathFor, uploadObject, validateUpload } from "@/lib/cms/admin/upload";
import { ConflictError } from "@/lib/cms/admin/local-adapter";
import type {
  CmsAdapter,
  ContentTable,
  Health,
  ImportReport,
  ItemRecord,
  Json,
  MediaItem,
  PageRecord,
  RevisionRecord,
  SectionRecord,
  SessionInfo,
  SettingsRecord,
  UserRecord,
} from "@/lib/cms/admin/types";

type Row = Record<string, unknown>;

const friendlyConstraint: Record<string, string> = {
  cms_reviews_consent_required: "A review can only be published with the patient's confirmed consent.",
  cms_sections_required_visible: "This section is required and cannot be hidden.",
  cms_media_kind_mime: "This file type is not allowed.",
};

/** Turns database/API errors into clear, honest messages. */
export function cmsError(e: PostgrestError | Error | { message: string; code?: string } | null, fallback = "The operation failed."): Error {
  if (!e) return new Error(fallback);
  const code = "code" in e ? e.code : undefined;
  const msg = e.message || fallback;
  const constraint = Object.keys(friendlyConstraint).find((k) => msg.includes(k));
  if (constraint) return new Error(friendlyConstraint[constraint]);
  if (code === "42501" || /permission denied|row-level security/i.test(msg)) return new Error("You don't have permission to do this. Ask an administrator to give your account CMS access.");
  if (code === "23505") return new Error(/slug/.test(msg) ? "Another item already uses this slug." : "This record already exists.");
  if (code === "23514") return new Error(`The database rejected the value (${msg}).`);
  if (code === "PGRST202") return new Error("The CMS database functions are missing — apply the migration in supabase/migrations.");
  if (code === "42P01" || /relation .* does not exist/i.test(msg)) return new Error("The CMS tables are missing — apply the migration in supabase/migrations.");
  if (/Failed to fetch|NetworkError|fetch failed/i.test(msg)) return new Error("Couldn't reach Supabase. Check your internet connection and the project URL.");
  return new Error(msg);
}

const toPage = (r: Row): PageRecord => ({
  id: String(r.id),
  route: String(r.route ?? ""),
  label: String(r.label),
  sort: Number(r.sort ?? 0),
  isTemplate: Boolean(r.is_template),
  draft: (r.draft ?? {}) as Json,
  published: (r.published ?? null) as Json | null,
  version: Number(r.version),
  updatedAt: String(r.updated_at),
  updatedBy: (r.updated_by as string) ?? null,
  publishedAt: (r.published_at as string) ?? null,
});

const toSection = (r: Row): SectionRecord => ({
  id: String(r.id),
  pageId: String(r.page_id),
  key: String(r.key),
  label: String(r.label),
  sectionType: String(r.section_type),
  refKey: (r.ref_key as string) ?? null,
  required: Boolean(r.required),
  position: Number(r.position),
  visible: Boolean(r.visible),
  draft: (r.draft ?? {}) as Json,
  published: (r.published ?? null) as Json | null,
  publishedPosition: r.published_position === null || r.published_position === undefined ? null : Number(r.published_position),
  publishedVisible: r.published_visible === null || r.published_visible === undefined ? null : Boolean(r.published_visible),
  version: Number(r.version),
  updatedAt: String(r.updated_at),
  updatedBy: (r.updated_by as string) ?? null,
  publishedAt: (r.published_at as string) ?? null,
});

const toSettings = (r: Row): SettingsRecord => ({
  id: "site",
  draft: (r.draft ?? {}) as Json,
  published: (r.published ?? null) as Json | null,
  version: Number(r.version),
  updatedAt: String(r.updated_at),
  updatedBy: (r.updated_by as string) ?? null,
  publishedAt: (r.published_at as string) ?? null,
});

const toItem = (collection: CollectionKey, r: Row): ItemRecord => ({
  id: String(r.id),
  collection,
  importKey: (r.import_key as string) ?? null,
  slug: (r.slug as string) ?? null,
  position: Number(r.position),
  visible: Boolean(r.visible),
  draft: (r.draft ?? {}) as Json,
  published: (r.published ?? null) as Json | null,
  version: Number(r.version),
  createdAt: String(r.created_at),
  updatedAt: String(r.updated_at),
  updatedBy: (r.updated_by as string) ?? null,
  publishedAt: (r.published_at as string) ?? null,
});

const toMedia = (r: Row): MediaItem => ({
  id: String(r.id),
  path: String(r.path),
  url: publicUrl(String(r.path), String(r.bucket ?? cmsConfig.bucket)),
  kind: r.kind === "video" ? "video" : "image",
  mime: String(r.mime_type),
  size: Number(r.size_bytes),
  width: r.width === null ? null : Number(r.width),
  height: r.height === null ? null : Number(r.height),
  duration: r.duration_seconds === null ? null : Number(r.duration_seconds),
  originalName: String(r.original_name),
  alt: (r.alt ?? { ar: "", en: "" }) as { ar: string; en: string },
  caption: (r.caption ?? { ar: "", en: "" }) as { ar: string; en: string },
  createdAt: String(r.created_at),
  version: Number(r.version),
});

const toRevision = (r: Row): RevisionRecord => ({
  id: String(r.id),
  entityType: String(r.entity_type),
  entityId: String(r.entity_id),
  entityLabel: String(r.entity_label ?? ""),
  action: r.action as RevisionRecord["action"],
  snapshot: (r.snapshot ?? {}) as RevisionRecord["snapshot"],
  createdAt: String(r.created_at),
  createdBy: (r.created_by as string) ?? null,
});

const table = (c: CollectionKey) => collectionRegistry[c].table;

export class SupabaseAdapter implements CmsAdapter {
  readonly mode = "supabase" as const;
  private sb: SupabaseClient = getSupabase();

  private async accessToken(): Promise<string> {
    const { data } = await this.sb.auth.getSession();
    if (!data.session) throw new Error("Your session has expired. Sign in again.");
    return data.session.access_token;
  }

  // ---------------------------------------------------------------- session
  async getSession(): Promise<SessionInfo | null> {
    await urlSessionReady();
    const { data } = await this.sb.auth.getSession();
    const user = data.session?.user;
    if (!user) return null;
    const { data: profile } = await this.sb.from("cms_profiles").select("role").eq("user_id", user.id).maybeSingle();
    return { userId: user.id, email: user.email ?? "", role: (profile?.role as "admin" | "editor") ?? null };
  }
  async signIn(email: string, password: string) {
    const { error } = await this.sb.auth.signInWithPassword({ email: email.trim(), password });
    if (error) throw new Error(/invalid login/i.test(error.message) ? "Email or password is incorrect." : error.message);
    const session = await this.getSession();
    if (!session) throw new Error("Sign-in did not complete. Try again.");
    return session;
  }
  async signOut() {
    await this.sb.auth.signOut();
  }
  async sendPasswordReset(email: string, redirectTo: string) {
    const { error } = await this.sb.auth.resetPasswordForEmail(email.trim(), { redirectTo });
    if (error) throw cmsError(error);
  }
  async updatePassword(password: string) {
    const { error } = await this.sb.auth.updateUser({ password });
    if (error) throw cmsError(error);
  }
  onAuthChange(cb: () => void) {
    const { data } = this.sb.auth.onAuthStateChange(() => cb());
    return () => data.subscription.unsubscribe();
  }
  async health(): Promise<Health> {
    try {
      const { data, error } = await this.sb.rpc("cms_health");
      if (error) {
        const e = cmsError(error);
        return { reachable: !/reach Supabase/.test(e.message), schemaVersion: null, initialized: false, signedIn: false, isEditor: false, isAdmin: false, error: e.message };
      }
      const h = data as Record<string, unknown>;
      return {
        reachable: true,
        schemaVersion: Number(h.schemaVersion) || null,
        initialized: Boolean(h.initialized),
        signedIn: Boolean(h.signedIn),
        isEditor: Boolean(h.isEditor),
        isAdmin: Boolean(h.isAdmin),
      };
    } catch (e) {
      return { reachable: false, schemaVersion: null, initialized: false, signedIn: false, isEditor: false, isAdmin: false, error: cmsError(e as Error).message };
    }
  }
  async checkStorage() {
    const { error } = await this.sb.storage.from(cmsConfig.bucket).list("", { limit: 1 });
    if (error) return { ok: false, detail: /not found/i.test(error.message) ? `Bucket “${cmsConfig.bucket}” not found — apply the migration.` : error.message };
    return { ok: true, detail: `Bucket “${cmsConfig.bucket}” is reachable and you can list files.` };
  }

  // ---------------------------------------------------------------- pages & sections
  async listPages() {
    const { data, error } = await this.sb.from("cms_pages").select("*").order("sort");
    if (error) throw cmsError(error);
    return (data ?? []).map(toPage);
  }
  async listSections(pageId?: string) {
    let q = this.sb.from("cms_sections").select("*").order("position");
    if (pageId) q = q.eq("page_id", pageId);
    const { data, error } = await q;
    if (error) throw cmsError(error);
    return (data ?? []).map(toSection);
  }
  async saveSection(id: string, patch: { draft?: Json; visible?: boolean }, expectedVersion: number) {
    const { data, error } = await this.sb.from("cms_sections").update(patch).eq("id", id).eq("version", expectedVersion).select("*").maybeSingle();
    if (error) throw cmsError(error);
    if (!data) throw new ConflictError("This section");
    return toSection(data);
  }
  async reorderSections(_pageId: string, orderedIds: string[]) {
    const { error } = await this.sb.rpc("cms_reorder", { p_table: "cms_sections", p_ids: orderedIds });
    if (error) throw cmsError(error);
  }
  async savePageSeo(pageId: string, draft: Json, expectedVersion: number) {
    const { data, error } = await this.sb.from("cms_pages").update({ draft }).eq("id", pageId).eq("version", expectedVersion).select("*").maybeSingle();
    if (error) throw cmsError(error);
    if (!data) throw new ConflictError("This page's SEO");
    return toPage(data);
  }
  async publishPage(pageId: string) {
    const { data, error } = await this.sb.rpc("cms_publish_page", { p_page_id: pageId });
    if (error) throw cmsError(error);
    return Number(data ?? 0);
  }

  // ---------------------------------------------------------------- settings
  async getSettings() {
    const { data, error } = await this.sb.from("cms_settings").select("*").eq("id", "site").maybeSingle();
    if (error) throw cmsError(error);
    return data ? toSettings(data) : null;
  }
  async saveSettings(draft: Json, expectedVersion: number) {
    const { data, error } = await this.sb.from("cms_settings").update({ draft }).eq("id", "site").eq("version", expectedVersion).select("*").maybeSingle();
    if (error) throw cmsError(error);
    if (!data) throw new ConflictError("Site settings");
    return toSettings(data);
  }

  // ---------------------------------------------------------------- collections
  async listItems(collection: CollectionKey) {
    const { data, error } = await this.sb.from(table(collection)).select("*").order("position").order("created_at");
    if (error) throw cmsError(error);
    return (data ?? []).map((r) => toItem(collection, r));
  }
  async createItem(collection: CollectionKey, input: { slug: string | null; draft: Json; position: number }) {
    const row: Row = { draft: input.draft, position: input.position };
    if (input.slug) row.slug = input.slug;
    const { data, error } = await this.sb.from(table(collection)).insert(row).select("*").single();
    if (error) throw cmsError(error);
    return toItem(collection, data);
  }
  async saveItem(collection: CollectionKey, id: string, patch: { draft?: Json; slug?: string | null; visible?: boolean }, expectedVersion: number) {
    const { data, error } = await this.sb.from(table(collection)).update(patch).eq("id", id).eq("version", expectedVersion).select("*").maybeSingle();
    if (error) throw cmsError(error);
    if (!data) throw new ConflictError(`This ${collectionRegistry[collection].singular.toLowerCase()}`);
    return toItem(collection, data);
  }
  async deleteItem(collection: CollectionKey, id: string) {
    const { error, count } = await this.sb.from(table(collection)).delete({ count: "exact" }).eq("id", id);
    if (error) throw cmsError(error);
    if (count === 0) throw new Error("Nothing was deleted — the item no longer exists or you lack permission.");
  }
  async reorderItems(collection: CollectionKey, orderedIds: string[]) {
    const { error } = await this.sb.rpc("cms_reorder", { p_table: table(collection), p_ids: orderedIds });
    if (error) throw cmsError(error);
  }

  // ---------------------------------------------------------------- publishing
  async publish(t: ContentTable, id: string) {
    const { error } = await this.sb.rpc("cms_publish", { p_table: t, p_id: id });
    if (error) throw cmsError(error);
  }
  async unpublish(t: ContentTable, id: string) {
    const { error } = await this.sb.rpc("cms_unpublish", { p_table: t, p_id: id });
    if (error) throw cmsError(error);
  }
  async discardDraft(t: ContentTable, id: string) {
    const { error } = await this.sb.rpc("cms_discard_draft", { p_table: t, p_id: id });
    if (error) throw cmsError(error);
  }

  // ---------------------------------------------------------------- media
  canUpload() {
    return true;
  }
  async listMedia() {
    const { data, error } = await this.sb.from("cms_media").select("*").order("created_at", { ascending: false });
    if (error) throw cmsError(error);
    return (data ?? []).map(toMedia);
  }
  async uploadMedia(file: File, onProgress?: (fraction: number) => void) {
    const problem = validateUpload(file);
    if (problem) throw new Error(problem);
    const info = await readMediaInfo(file);
    const path = storagePathFor(file, info.kind);
    await uploadObject(file, path, await this.accessToken(), onProgress);
    const { data, error } = await this.sb
      .from("cms_media")
      .insert({
        path,
        kind: info.kind,
        mime_type: file.type,
        size_bytes: file.size,
        width: info.width,
        height: info.height,
        duration_seconds: info.duration,
        original_name: file.name.slice(0, 200),
      })
      .select("*")
      .single();
    if (error) {
      // Don't leave an orphaned file behind when the record could not be created.
      await this.sb.storage.from(cmsConfig.bucket).remove([path]);
      throw cmsError(error, "The file uploaded but could not be registered; it was removed again.");
    }
    return toMedia(data);
  }
  /** Replaces the file behind a media record: every page using it shows the new file. */
  async replaceMediaFile(id: string, file: File, onProgress?: (fraction: number) => void) {
    const problem = validateUpload(file);
    if (problem) throw new Error(problem);
    const { data: current, error: readError } = await this.sb.from("cms_media").select("*").eq("id", id).single();
    if (readError) throw cmsError(readError);
    const info = await readMediaInfo(file);
    if (info.kind !== current.kind) throw new Error(`Replace a ${current.kind} with another ${current.kind}.`);
    const path = storagePathFor(file, info.kind);
    await uploadObject(file, path, await this.accessToken(), onProgress);
    const { data, error } = await this.sb
      .from("cms_media")
      .update({ path, mime_type: file.type, size_bytes: file.size, width: info.width, height: info.height, duration_seconds: info.duration, original_name: file.name.slice(0, 200) })
      .eq("id", id)
      .eq("version", current.version)
      .select("*")
      .maybeSingle();
    if (error || !data) {
      await this.sb.storage.from(cmsConfig.bucket).remove([path]);
      if (error) throw cmsError(error);
      throw new ConflictError("This file");
    }
    // The previous file is no longer referenced by the record; remove it (best effort).
    await this.sb.storage.from(cmsConfig.bucket).remove([String(current.path)]);
    return toMedia(data);
  }
  async updateMedia(id: string, patch: { alt?: { ar: string; en: string }; caption?: { ar: string; en: string } }, expectedVersion: number) {
    const { data, error } = await this.sb.from("cms_media").update(patch).eq("id", id).eq("version", expectedVersion).select("*").maybeSingle();
    if (error) throw cmsError(error);
    if (!data) throw new ConflictError("This file's details");
    return toMedia(data);
  }
  async deleteMedia(id: string) {
    const usage = await this.mediaUsage(id);
    if (usage.length) throw new Error(`This file is still used in ${usage.length} place(s). Replace it there first.`);
    const { data: rec, error: readError } = await this.sb.from("cms_media").select("path").eq("id", id).single();
    if (readError) throw cmsError(readError);
    // The database re-checks usage in a trigger before deleting the record.
    const { error } = await this.sb.from("cms_media").delete().eq("id", id);
    if (error) throw cmsError(error);
    const { error: storageError } = await this.sb.storage.from(cmsConfig.bucket).remove([String(rec.path)]);
    if (storageError) throw new Error(`The file was removed from the library, but deleting it from Storage failed: ${storageError.message}`);
  }
  async mediaUsage(id: string) {
    const { data, error } = await this.sb.rpc("cms_media_usage", { p_media_id: id });
    if (error) throw cmsError(error);
    return ((data ?? []) as Row[]).map((r) => ({
      entityType: String(r.entity_type),
      entityId: String(r.entity_id),
      label: String(r.label ?? ""),
      inDraft: Boolean(r.in_draft),
      inPublished: Boolean(r.in_published),
    }));
  }

  // ---------------------------------------------------------------- history
  async listRevisions(filter: { entityType?: string; entityId?: string; limit?: number } = {}) {
    let q = this.sb.from("cms_revisions").select("*").order("created_at", { ascending: false }).limit(filter.limit ?? 100);
    if (filter.entityType) q = q.eq("entity_type", filter.entityType);
    if (filter.entityId) q = q.eq("entity_id", filter.entityId);
    const { data, error } = await q;
    if (error) throw cmsError(error);
    return (data ?? []).map(toRevision);
  }
  async restoreRevision(id: string) {
    const { error } = await this.sb.rpc("cms_restore_revision", { p_revision_id: Number(id) });
    if (error) throw cmsError(error);
  }

  // ---------------------------------------------------------------- private settings
  async getPrivateSetting(key: string) {
    const { data, error } = await this.sb.from("cms_private_settings").select("value").eq("key", key).maybeSingle();
    if (error) throw cmsError(error);
    return data?.value ?? null;
  }
  async setPrivateSetting(key: string, value: unknown) {
    const { error } = await this.sb.from("cms_private_settings").upsert({ key, value }, { onConflict: "key" });
    if (error) throw cmsError(error);
  }

  // ---------------------------------------------------------------- users
  async listUsers(): Promise<UserRecord[]> {
    const { data, error } = await this.sb.rpc("cms_list_users");
    if (error) throw cmsError(error);
    return ((data ?? []) as Row[]).map((r) => ({
      userId: String(r.user_id),
      email: String(r.email),
      displayName: String(r.display_name ?? ""),
      role: r.role as "admin" | "editor",
      createdAt: String(r.created_at),
      lastSignInAt: (r.last_sign_in_at as string) ?? null,
    }));
  }
  async setRole(email: string, role: "admin" | "editor", displayName: string) {
    const { error } = await this.sb.rpc("cms_set_role", { p_email: email, p_role: role, p_display_name: displayName });
    if (error) throw cmsError(error);
  }
  async removeUser(userId: string) {
    const { error } = await this.sb.rpc("cms_remove_user", { p_user_id: userId });
    if (error) throw cmsError(error);
  }

  // ---------------------------------------------------------------- import / export
  /**
   * Imports the website's current content. Only MISSING records are created; anything that
   * already exists (including content edited in the dashboard) is left untouched.
   */
  async importWebsiteContent(): Promise<ImportReport> {
    const report: ImportReport = { created: {}, skipped: {}, errors: [] };
    const bump = (bucket: Record<string, number>, key: string, n = 1) => (bucket[key] = (bucket[key] ?? 0) + n);

    const pages = seedPages();
    const existingPages = new Set((await this.listPages()).map((p) => p.id));
    const newPages = pages.filter((p) => !existingPages.has(p.id));
    bump(report.skipped, "pages", pages.length - newPages.length);
    if (newPages.length) {
      const { error } = await this.sb.from("cms_pages").insert(newPages.map((p) => ({ ...p, published_at: new Date().toISOString() })));
      if (error) report.errors.push(`Pages: ${cmsError(error).message}`);
      else bump(report.created, "pages", newPages.length);
    }

    const sections = seedSections();
    const existingSections = new Set((await this.listSections()).map((s) => `${s.pageId}/${s.key}`));
    const newSections = sections.filter((s) => !existingSections.has(`${s.page_id}/${s.key}`));
    bump(report.skipped, "sections", sections.length - newSections.length);
    if (newSections.length) {
      const { error } = await this.sb.from("cms_sections").insert(newSections.map((s) => ({ ...s, published_at: new Date().toISOString() })));
      if (error) report.errors.push(`Sections: ${cmsError(error).message}`);
      else bump(report.created, "sections", newSections.length);
    }

    if (await this.getSettings()) bump(report.skipped, "settings");
    else {
      const s = seedSettings();
      const { error } = await this.sb.from("cms_settings").insert({ ...s, published_at: new Date().toISOString() });
      if (error) report.errors.push(`Settings: ${cmsError(error).message}`);
      else bump(report.created, "settings");
    }

    for (const key of collectionKeys) {
      const existing = await this.listItems(key);
      const keys = new Set(existing.map((i) => i.importKey));
      const slugs = new Set(existing.map((i) => i.slug).filter(Boolean));
      const rows = seedItems(key).filter((i) => !keys.has(i.import_key) && !(i.slug && slugs.has(i.slug)));
      bump(report.skipped, key, seedItems(key).length - rows.length);
      if (!rows.length) continue;
      const { error } = await this.sb.from(table(key)).insert(rows.map((r) => ({ ...r, published_at: new Date().toISOString() })));
      if (error) report.errors.push(`${collectionRegistry[key].label}: ${cmsError(error).message}`);
      else bump(report.created, key, rows.length);
    }
    return report;
  }

  async publishedSnapshot(): Promise<PublishedSnapshot> {
    const { data, error } = await this.sb.rpc("cms_public_snapshot");
    if (error) throw cmsError(error);
    const snap = data as PublishedSnapshot & { media?: Record<string, { path: string; bucket?: string; url?: string }> };
    for (const m of Object.values(snap.media ?? {})) m.url = publicUrl(m.path, m.bucket);
    return snap;
  }
}
