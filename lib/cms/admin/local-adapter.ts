/**
 * LOCAL SANDBOX adapter — used when Supabase is not configured.
 *
 * Starts from the content the website currently shows and keeps edits in this browser only
 * (localStorage), clearly labelled in the UI. It is a rehearsal space and an offline editor:
 * published content can be exported as content/published.json and built into the site.
 * It is never presented as connected to Supabase, and it cannot upload files.
 */
import { clone, sameJson } from "@/lib/cms/core";
import { collectionKeys, collectionRegistry, type CollectionKey } from "@/lib/cms/registry";
import { seedItems, seedPages, seedSections, seedSettings } from "@/lib/cms/seed-data";
import { snapshotFromRecords } from "@/lib/cms/admin/snapshot";
import type {
  CmsAdapter,
  ContentTable,
  ImportReport,
  ItemRecord,
  Json,
  MediaItem,
  PageRecord,
  RevisionRecord,
  SectionRecord,
  SettingsRecord,
} from "@/lib/cms/admin/types";

const STORAGE_KEY = "hh-cms-local-sandbox-v1";

type AnyRecord = PageRecord | SectionRecord | SettingsRecord | ItemRecord;
const MAX_REVISIONS = 400;

type Db = {
  pages: PageRecord[];
  sections: SectionRecord[];
  settings: SettingsRecord | null;
  items: Record<CollectionKey, ItemRecord[]>;
  revisions: RevisionRecord[];
  private: Record<string, unknown>;
  nextRevision: number;
};

const now = () => new Date().toISOString();
const uid = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `id-${Date.now()}-${Math.random().toString(16).slice(2)}`);

export class ConflictError extends Error {
  constructor(what: string) {
    super(`${what} was changed elsewhere since you opened it. Reload to see the latest version, then reapply your edit.`);
    this.name = "ConflictError";
  }
}

/** A fresh sandbox database holding the website's current content (also used by `npm run cms:verify`). */
export function seedDb(): Db {
  const t = now();
  const pages: PageRecord[] = seedPages().map((p) => ({
    id: p.id,
    route: p.route,
    label: p.label,
    sort: p.sort,
    isTemplate: p.is_template,
    draft: p.draft as Json,
    published: p.published as Json,
    version: 1,
    updatedAt: t,
    updatedBy: null,
    publishedAt: t,
  }));
  const sections: SectionRecord[] = seedSections().map((s) => ({
    id: uid(),
    pageId: s.page_id,
    key: s.key,
    label: s.label,
    sectionType: s.section_type,
    refKey: s.ref_key,
    required: s.required,
    position: s.position,
    visible: s.visible,
    draft: s.draft as Json,
    published: s.published as Json,
    publishedPosition: s.published_position,
    publishedVisible: s.published_visible,
    version: 1,
    updatedAt: t,
    updatedBy: null,
    publishedAt: t,
  }));
  const st = seedSettings();
  const items = Object.fromEntries(
    collectionKeys.map((key) => [
      key,
      seedItems(key).map((i) => ({
        id: uid(),
        collection: key,
        importKey: i.import_key,
        slug: i.slug,
        position: i.position,
        visible: i.visible,
        draft: i.draft as Json,
        published: i.published as Json,
        version: 1,
        createdAt: t,
        updatedAt: t,
        updatedBy: null,
        publishedAt: t,
      })),
    ]),
  ) as Record<CollectionKey, ItemRecord[]>;
  return {
    pages,
    sections,
    settings: { id: "site", draft: st.draft as Json, published: st.published as Json, version: 1, updatedAt: t, updatedBy: null, publishedAt: t },
    items,
    revisions: [],
    private: {},
    nextRevision: 1,
  };
}

export class LocalAdapter implements CmsAdapter {
  readonly mode = "local" as const;
  private db: Db;
  /** False when the browser refuses storage (private mode, quota): edits then last for this tab only. */
  persistent = true;

  constructor() {
    this.db = this.load();
  }

  private load(): Db {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as Db;
    } catch {
      this.persistent = false;
    }
    const db = seedDb();
    this.save(db);
    return db;
  }

  private save(db: Db = this.db) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
      this.persistent = true;
    } catch {
      this.persistent = false;
    }
  }

  /** Discards every local edit and starts again from the website's current content. */
  reset() {
    this.db = seedDb();
    this.save();
  }

  private revise(entityType: string, entityId: string, label: string, action: RevisionRecord["action"], rec: { draft?: Json | null; published?: Json | null; position?: number; visible?: boolean; version?: number } | AnyRecord) {
    this.db.revisions.unshift({
      id: String(this.db.nextRevision++),
      entityType,
      entityId,
      entityLabel: label,
      action,
      snapshot: clone({
        draft: rec.draft ?? null,
        published: rec.published ?? null,
        position: "position" in rec ? (rec.position ?? null) : null,
        visible: "visible" in rec ? (rec.visible ?? null) : null,
        version: rec.version,
      }),
      createdAt: now(),
      createdBy: "local",
    });
    this.db.revisions.length = Math.min(this.db.revisions.length, MAX_REVISIONS);
  }

  // ---------------------------------------------------------------- session
  async getSession() {
    return { userId: "local", email: "Local sandbox", role: "admin" as const };
  }
  async signIn(): Promise<never> {
    throw new Error("Sign-in is only available when the dashboard is connected to Supabase.");
  }
  async signOut() {}
  async sendPasswordReset(): Promise<never> {
    throw new Error("Password reset needs Supabase.");
  }
  async updatePassword(): Promise<never> {
    throw new Error("Password changes need Supabase.");
  }
  onAuthChange() {
    return () => {};
  }
  async health() {
    return { reachable: false, schemaVersion: null, initialized: true, signedIn: false, isEditor: true, isAdmin: true, error: "Local sandbox — Supabase is not configured." };
  }
  async checkStorage() {
    return { ok: false, detail: "Uploads need Supabase Storage. The local sandbox can only use the photos bundled with the site." };
  }

  // ---------------------------------------------------------------- pages & sections
  async listPages() {
    return clone([...this.db.pages].sort((a, b) => a.sort - b.sort));
  }
  async listSections(pageId?: string) {
    return clone(this.db.sections.filter((s) => !pageId || s.pageId === pageId).sort((a, b) => a.position - b.position));
  }
  async saveSection(id: string, patch: { draft?: Json; visible?: boolean }, expectedVersion: number) {
    const s = this.db.sections.find((x) => x.id === id);
    if (!s) throw new Error("Section not found.");
    if (s.version !== expectedVersion) throw new ConflictError(`“${s.label}”`);
    if (patch.visible === false && s.required) throw new Error("This section is required and cannot be hidden.");
    const draftChanged = patch.draft !== undefined && !sameJson(patch.draft, s.draft);
    const visibleChanged = patch.visible !== undefined && patch.visible !== s.visible;
    if (patch.draft !== undefined) s.draft = clone(patch.draft);
    if (patch.visible !== undefined) s.visible = patch.visible;
    s.version++;
    s.updatedAt = now();
    s.updatedBy = "local";
    if (draftChanged) this.revise("cms_sections", s.id, `${s.pageId} › ${s.label}`, "save", s);
    else if (visibleChanged) this.revise("cms_sections", s.id, `${s.pageId} › ${s.label}`, "layout", s);
    this.save();
    return clone(s);
  }
  async reorderSections(pageId: string, orderedIds: string[]) {
    orderedIds.forEach((id, i) => {
      const s = this.db.sections.find((x) => x.id === id && x.pageId === pageId);
      if (s && s.position !== i) {
        s.position = i;
        s.version++;
        s.updatedAt = now();
        this.revise("cms_sections", s.id, `${s.pageId} › ${s.label}`, "layout", s);
      }
    });
    this.save();
  }
  async savePageSeo(pageId: string, draft: Json, expectedVersion: number) {
    const p = this.db.pages.find((x) => x.id === pageId);
    if (!p) throw new Error("Page not found.");
    if (p.version !== expectedVersion) throw new ConflictError(`SEO for “${p.label}”`);
    p.draft = clone(draft);
    p.version++;
    p.updatedAt = now();
    this.revise("cms_pages", p.id, p.label, "save", p);
    this.save();
    return clone(p);
  }
  async publishPage(pageId: string) {
    const p = this.db.pages.find((x) => x.id === pageId);
    if (!p) throw new Error("Page not found.");
    this.publishRecord("cms_pages", p);
    let n = 0;
    for (const s of this.db.sections.filter((x) => x.pageId === pageId)) {
      if (!sameJson(s.draft, s.published) || s.position !== s.publishedPosition || s.visible !== s.publishedVisible) {
        this.publishRecord("cms_sections", s);
        n++;
      }
    }
    this.save();
    return n;
  }

  // ---------------------------------------------------------------- settings
  async getSettings() {
    return clone(this.db.settings);
  }
  async saveSettings(draft: Json, expectedVersion: number) {
    const s = this.db.settings;
    if (!s) throw new Error("Settings are missing. Use System › Import website content.");
    if (s.version !== expectedVersion) throw new ConflictError("Site settings");
    s.draft = clone(draft);
    s.version++;
    s.updatedAt = now();
    this.revise("cms_settings", "site", "Site settings", "save", s);
    this.save();
    return clone(s);
  }

  // ---------------------------------------------------------------- collections
  async listItems(collection: CollectionKey) {
    return clone([...this.db.items[collection]].sort((a, b) => a.position - b.position));
  }
  async createItem(collection: CollectionKey, input: { slug: string | null; draft: Json; position: number }) {
    if (input.slug && this.db.items[collection].some((i) => i.slug === input.slug)) throw new Error("Another item already uses this slug.");
    const t = now();
    const item: ItemRecord = {
      id: uid(),
      collection,
      importKey: null,
      slug: input.slug,
      position: input.position,
      visible: true,
      draft: clone(input.draft),
      published: null,
      version: 1,
      createdAt: t,
      updatedAt: t,
      updatedBy: "local",
      publishedAt: null,
    };
    this.db.items[collection].push(item);
    this.revise(`cms_${collection}`, item.id, item.slug ?? item.id, "create", item);
    this.save();
    return clone(item);
  }
  async saveItem(collection: CollectionKey, id: string, patch: { draft?: Json; slug?: string | null; visible?: boolean }, expectedVersion: number) {
    const item = this.db.items[collection].find((i) => i.id === id);
    if (!item) throw new Error("Item not found.");
    if (item.version !== expectedVersion) throw new ConflictError(`This ${collectionRegistry[collection].singular.toLowerCase()}`);
    if (patch.slug && this.db.items[collection].some((i) => i.id !== id && i.slug === patch.slug)) throw new Error("Another item already uses this slug.");
    const draftChanged = patch.draft !== undefined && !sameJson(patch.draft, item.draft);
    if (patch.draft !== undefined) item.draft = clone(patch.draft);
    if (patch.slug !== undefined) item.slug = patch.slug;
    if (patch.visible !== undefined) item.visible = patch.visible;
    item.version++;
    item.updatedAt = now();
    this.revise(`cms_${collection}`, item.id, item.slug ?? item.id, draftChanged ? "save" : "layout", item);
    this.save();
    return clone(item);
  }
  async deleteItem(collection: CollectionKey, id: string) {
    const item = this.db.items[collection].find((i) => i.id === id);
    if (!item) return;
    this.db.items[collection] = this.db.items[collection].filter((i) => i.id !== id);
    this.revise(`cms_${collection}`, item.id, item.slug ?? item.id, "delete", item);
    this.save();
  }
  async reorderItems(collection: CollectionKey, orderedIds: string[]) {
    orderedIds.forEach((id, i) => {
      const item = this.db.items[collection].find((x) => x.id === id);
      if (item && item.position !== i) {
        item.position = i;
        item.version++;
        this.revise(`cms_${collection}`, item.id, item.slug ?? item.id, "layout", item);
      }
    });
    this.save();
  }

  // ---------------------------------------------------------------- publishing
  private find(table: ContentTable, id: string): AnyRecord | null {
    if (table === "cms_pages") return this.db.pages.find((p) => p.id === id) ?? null;
    if (table === "cms_sections") return this.db.sections.find((s) => s.id === id) ?? null;
    if (table === "cms_settings") return this.db.settings;
    const key = table.replace("cms_", "") as CollectionKey;
    return this.db.items[key]?.find((i) => i.id === id) ?? null;
  }
  private labelOf(rec: AnyRecord): string {
    return "label" in rec ? rec.label : "slug" in rec && rec.slug ? rec.slug : rec.id;
  }
  private publishRecord(table: ContentTable, rec: AnyRecord) {
    if (table === "cms_reviews" && rec.draft.consent !== true) throw new Error("A review can only be published with the patient's confirmed consent.");
    rec.published = clone(rec.draft);
    if ("publishedPosition" in rec) {
      rec.publishedPosition = rec.position;
      rec.publishedVisible = rec.visible;
    }
    rec.publishedAt = now();
    rec.version++;
    this.revise(table, rec.id, this.labelOf(rec), "publish", rec);
  }
  async publish(table: ContentTable, id: string) {
    const rec = this.find(table, id);
    if (!rec) throw new Error("Record not found.");
    this.publishRecord(table, rec as never);
    this.save();
  }
  async unpublish(table: ContentTable, id: string) {
    if (!table.startsWith("cms_") || ["cms_pages", "cms_sections", "cms_settings"].includes(table)) {
      throw new Error("Only collection items can be unpublished. Hide a section instead.");
    }
    const rec = this.find(table, id);
    if (!rec) throw new Error("Record not found.");
    rec.published = null;
    rec.publishedAt = null;
    rec.version++;
    this.revise(table, id, this.labelOf(rec), "unpublish", rec);
    this.save();
  }
  async discardDraft(table: ContentTable, id: string) {
    const rec = this.find(table, id);
    if (!rec || !rec.published) throw new Error("Nothing published to revert to.");
    rec.draft = clone(rec.published);
    if ("publishedPosition" in rec) {
      rec.position = rec.publishedPosition ?? rec.position;
      rec.visible = rec.publishedVisible ?? rec.visible;
    }
    rec.version++;
    this.revise(table, id, this.labelOf(rec), "discard", rec);
    this.save();
  }

  // ---------------------------------------------------------------- media
  canUpload() {
    return false;
  }
  async listMedia(): Promise<MediaItem[]> {
    return [];
  }
  async uploadMedia(): Promise<never> {
    throw new Error("Uploading needs Supabase Storage. Connect the dashboard to Supabase (see System).");
  }
  async replaceMediaFile(): Promise<never> {
    throw new Error("Uploading needs Supabase Storage.");
  }
  async updateMedia(): Promise<never> {
    throw new Error("Media metadata needs Supabase.");
  }
  async deleteMedia() {
    throw new Error("Media needs Supabase.");
  }
  async mediaUsage() {
    return [];
  }

  // ---------------------------------------------------------------- history
  async listRevisions(filter: { entityType?: string; entityId?: string; limit?: number } = {}) {
    return clone(
      this.db.revisions
        .filter((r) => (!filter.entityType || r.entityType === filter.entityType) && (!filter.entityId || r.entityId === filter.entityId))
        .slice(0, filter.limit ?? 100),
    );
  }
  async restoreRevision(id: string) {
    const rev = this.db.revisions.find((r) => r.id === id);
    if (!rev?.snapshot.draft) throw new Error("This revision has no restorable content.");
    const rec = this.find(rev.entityType as ContentTable, rev.entityId);
    if (!rec) throw new Error("The record for this revision no longer exists.");
    rec.draft = clone(rev.snapshot.draft);
    rec.version++;
    this.revise(rev.entityType, rev.entityId, rev.entityLabel, "restore", rec);
    this.save();
  }

  // ---------------------------------------------------------------- private settings / users
  async getPrivateSetting(key: string) {
    return this.db.private[key] ?? null;
  }
  async setPrivateSetting(key: string, value: unknown) {
    this.db.private[key] = value;
    this.save();
  }
  async listUsers() {
    return [];
  }
  async setRole(): Promise<never> {
    throw new Error("User management needs Supabase.");
  }
  async removeUser(): Promise<never> {
    throw new Error("User management needs Supabase.");
  }

  // ---------------------------------------------------------------- import / export
  async importWebsiteContent(): Promise<ImportReport> {
    const fresh = seedDb();
    const created: Record<string, number> = {};
    const skipped: Record<string, number> = {};
    for (const p of fresh.pages) {
      if (this.db.pages.some((x) => x.id === p.id)) skipped.pages = (skipped.pages ?? 0) + 1;
      else {
        this.db.pages.push(p);
        created.pages = (created.pages ?? 0) + 1;
      }
    }
    for (const s of fresh.sections) {
      if (this.db.sections.some((x) => x.pageId === s.pageId && x.key === s.key)) skipped.sections = (skipped.sections ?? 0) + 1;
      else {
        this.db.sections.push(s);
        created.sections = (created.sections ?? 0) + 1;
      }
    }
    if (this.db.settings) skipped.settings = 1;
    else {
      this.db.settings = fresh.settings;
      created.settings = 1;
    }
    for (const key of collectionKeys) {
      for (const item of fresh.items[key]) {
        const exists = this.db.items[key].some((x) => x.importKey === item.importKey || (item.slug && x.slug === item.slug));
        if (exists) skipped[key] = (skipped[key] ?? 0) + 1;
        else {
          this.db.items[key].push(item);
          created[key] = (created[key] ?? 0) + 1;
        }
      }
    }
    this.save();
    return { created, skipped, errors: [] };
  }

  async publishedSnapshot() {
    return snapshotFromRecords(
      { pages: this.db.pages, sections: this.db.sections, settings: this.db.settings, items: this.db.items, media: [] },
      { draft: false, source: "local-export" },
    );
  }

  /** Draft snapshot for the preview. */
  async draftSnapshot() {
    return snapshotFromRecords(
      { pages: this.db.pages, sections: this.db.sections, settings: this.db.settings, items: this.db.items, media: [] },
      { draft: true },
    );
  }
}
