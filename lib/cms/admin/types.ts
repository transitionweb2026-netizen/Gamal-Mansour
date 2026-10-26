import type { CmsMediaRecord } from "@/lib/cms/media";
import type { CollectionKey } from "@/lib/cms/registry";
import type { PublishedSnapshot } from "@/lib/cms/site";

export type Json = Record<string, unknown>;

export type RecordBase = {
  id: string;
  version: number;
  updatedAt: string;
  updatedBy: string | null;
  publishedAt: string | null;
};

export type PageRecord = RecordBase & {
  route: string;
  label: string;
  sort: number;
  isTemplate: boolean;
  /** SEO metadata */
  draft: Json;
  published: Json | null;
};

export type SectionRecord = RecordBase & {
  pageId: string;
  key: string;
  label: string;
  sectionType: string;
  refKey: string | null;
  required: boolean;
  position: number;
  visible: boolean;
  draft: Json;
  published: Json | null;
  publishedPosition: number | null;
  publishedVisible: boolean | null;
};

export type SettingsRecord = RecordBase & { draft: Json; published: Json | null };

export type ItemRecord = RecordBase & {
  collection: CollectionKey;
  importKey: string | null;
  slug: string | null;
  position: number;
  visible: boolean;
  draft: Json;
  published: Json | null;
  createdAt: string;
};

export type MediaItem = CmsMediaRecord & { version: number; createdAt: string };

export type RevisionRecord = {
  id: string;
  entityType: string;
  entityId: string;
  entityLabel: string;
  action: "create" | "save" | "publish" | "unpublish" | "layout" | "restore" | "discard" | "delete";
  snapshot: { draft?: Json | null; published?: Json | null; position?: number | null; visible?: boolean | null; version?: number };
  createdAt: string;
  createdBy: string | null;
};

export type UserRecord = { userId: string; email: string; displayName: string; role: "admin" | "editor"; createdAt: string; lastSignInAt: string | null };

export type SessionInfo = { userId: string; email: string; role: "admin" | "editor" | null };

export type Health = {
  reachable: boolean;
  schemaVersion: number | null;
  initialized: boolean;
  signedIn: boolean;
  isEditor: boolean;
  isAdmin: boolean;
  error?: string;
};

export type StorageCheck = { ok: boolean; detail: string };

export type ImportReport = {
  created: Record<string, number>;
  skipped: Record<string, number>;
  errors: string[];
};

/** Tables a publish/discard/unpublish action applies to. */
export type ContentTable = "cms_pages" | "cms_sections" | "cms_settings" | `cms_${CollectionKey}`;

export type Status = "published" | "changed" | "draft" | "hidden";

export interface CmsAdapter {
  readonly mode: "supabase" | "local";

  // Session
  getSession(): Promise<SessionInfo | null>;
  signIn(email: string, password: string): Promise<SessionInfo>;
  signOut(): Promise<void>;
  sendPasswordReset(email: string, redirectTo: string): Promise<void>;
  updatePassword(password: string): Promise<void>;
  onAuthChange(cb: () => void): () => void;
  health(): Promise<Health>;
  checkStorage(): Promise<StorageCheck>;

  // Pages & sections
  listPages(): Promise<PageRecord[]>;
  listSections(pageId?: string): Promise<SectionRecord[]>;
  saveSection(id: string, patch: { draft?: Json; visible?: boolean }, expectedVersion: number): Promise<SectionRecord>;
  reorderSections(pageId: string, orderedIds: string[]): Promise<void>;
  savePageSeo(pageId: string, draft: Json, expectedVersion: number): Promise<PageRecord>;
  publishPage(pageId: string): Promise<number>;

  // Settings
  getSettings(): Promise<SettingsRecord | null>;
  saveSettings(draft: Json, expectedVersion: number): Promise<SettingsRecord>;

  // Collections
  listItems(collection: CollectionKey): Promise<ItemRecord[]>;
  createItem(collection: CollectionKey, input: { slug: string | null; draft: Json; position: number }): Promise<ItemRecord>;
  saveItem(collection: CollectionKey, id: string, patch: { draft?: Json; slug?: string | null; visible?: boolean }, expectedVersion: number): Promise<ItemRecord>;
  deleteItem(collection: CollectionKey, id: string): Promise<void>;
  reorderItems(collection: CollectionKey, orderedIds: string[]): Promise<void>;

  // Publishing
  publish(table: ContentTable, id: string): Promise<void>;
  unpublish(table: ContentTable, id: string): Promise<void>;
  discardDraft(table: ContentTable, id: string): Promise<void>;

  // Media
  canUpload(): boolean;
  listMedia(): Promise<MediaItem[]>;
  uploadMedia(file: File, onProgress?: (fraction: number) => void): Promise<MediaItem>;
  replaceMediaFile(id: string, file: File, onProgress?: (fraction: number) => void): Promise<MediaItem>;
  updateMedia(id: string, patch: { alt?: { ar: string; en: string }; caption?: { ar: string; en: string } }, expectedVersion: number): Promise<MediaItem>;
  deleteMedia(id: string): Promise<void>;
  mediaUsage(id: string): Promise<Array<{ entityType: string; entityId: string; label: string; inDraft: boolean; inPublished: boolean }>>;

  // History
  listRevisions(filter?: { entityType?: string; entityId?: string; limit?: number }): Promise<RevisionRecord[]>;
  restoreRevision(id: string): Promise<void>;

  // Private settings (dashboard only)
  getPrivateSetting(key: string): Promise<unknown>;
  setPrivateSetting(key: string, value: unknown): Promise<void>;

  // Users
  listUsers(): Promise<UserRecord[]>;
  setRole(email: string, role: "admin" | "editor", displayName: string): Promise<void>;
  removeUser(userId: string): Promise<void>;

  // Import / export
  importWebsiteContent(): Promise<ImportReport>;
  publishedSnapshot(): Promise<PublishedSnapshot>;
}
