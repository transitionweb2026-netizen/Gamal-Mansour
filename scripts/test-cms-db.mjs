// CMS database tests — runs the real migration + seed in PGlite (PostgreSQL compiled to WASM)
// with small stand-ins for Supabase's `auth` and `storage` schemas, then verifies RLS,
// grants, publishing, revisions, media protection and the public snapshot as each role.
//
//   npm run test:db
//
// The stand-ins mirror Supabase: roles anon/authenticated, auth.uid() from the JWT `sub`
// claim, and storage.objects with RLS enabled and full table grants (as on Supabase).
import { PGlite } from "@electric-sql/pglite";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(".");
const migrationsDir = path.join(root, "supabase", "migrations");
const migrations = fs.readdirSync(migrationsDir).filter((f) => f.endsWith(".sql")).sort();
const seed = fs.readFileSync(path.join(root, "supabase", "seed.sql"), "utf8");

const ADMIN = "00000000-0000-4000-8000-000000000001";
const EDITOR = "00000000-0000-4000-8000-000000000002";
const STRANGER = "00000000-0000-4000-8000-000000000003";

const db = new PGlite();
const results = [];
let failures = 0;

function record(name, ok, detail = "") {
  results.push(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  — ${detail}` : ""}`);
  if (!ok) failures++;
}

async function as(role, userId, fn) {
  await db.exec(`reset role; select set_config('request.jwt.claim.sub', '${userId ?? ""}', false);`);
  if (role) await db.exec(`set role ${role};`);
  try {
    return await fn();
  } finally {
    await db.exec(`reset role; select set_config('request.jwt.claim.sub', '', false);`);
  }
}

async function expectError(name, fn, pattern) {
  try {
    await fn();
    record(name, false, "expected an error but the operation succeeded");
  } catch (e) {
    const ok = !pattern || pattern.test(e.message);
    record(name, ok, ok ? e.message.split("\n")[0].slice(0, 110) : `unexpected error: ${e.message}`);
  }
}

const q = async (sql, params) => (await db.query(sql, params)).rows;

// ------------------------------------------------------------ Supabase stand-ins
await db.exec(`
  create role anon nologin;
  create role authenticated nologin;
  create role service_role nologin bypassrls;
  create schema auth;
  create table auth.users (id uuid primary key, email text unique, last_sign_in_at timestamptz);
  create function auth.uid() returns uuid language sql stable
    as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  grant usage on schema auth to anon, authenticated;
  grant execute on function auth.uid() to anon, authenticated;
  create schema storage;
  create table storage.buckets (id text primary key, name text not null, public boolean default false, file_size_limit bigint, allowed_mime_types text[]);
  create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text references storage.buckets (id), name text, owner uuid default auth.uid());
  alter table storage.objects enable row level security;
  grant usage on schema storage to anon, authenticated;
  grant all on storage.objects to anon, authenticated;
  grant usage on schema public to anon, authenticated;
  insert into auth.users (id, email) values
    ('${ADMIN}', 'admin@example.com'), ('${EDITOR}', 'editor@example.com'), ('${STRANGER}', 'someone@example.com');
`);

// ------------------------------------------------------------ migration + seed
for (const m of migrations) {
  await db.exec(fs.readFileSync(path.join(migrationsDir, m), "utf8"));
  // Re-applying must be harmless (idempotent migration).
  await db.exec(fs.readFileSync(path.join(migrationsDir, m), "utf8"));
}
record(`migrations apply twice cleanly (${migrations.join(", ")})`, true);

const tables = ["cms_pages", "cms_sections", "cms_settings", "cms_services", "cms_articles", "cms_videos", "cms_reviews", "cms_faqs"];
await db.exec(seed);
const countsAfterFirst = await q(`select ${tables.map((t) => `(select count(*) from public.${t}) as ${t}`).join(", ")}`);
await db.exec(seed);
const countsAfterSecond = await q(`select ${tables.map((t) => `(select count(*) from public.${t}) as ${t}`).join(", ")}`);
record("seed is idempotent (no duplicates on re-run)", JSON.stringify(countsAfterFirst) === JSON.stringify(countsAfterSecond), JSON.stringify(countsAfterSecond[0]));

const rlsOff = await q(`select relname from pg_class where relnamespace = 'public'::regnamespace and relkind = 'r' and relname like 'cms_%' and not relrowsecurity`);
record("RLS enabled on every cms_* table", rlsOff.length === 0, rlsOff.map((r) => r.relname).join(", "));

// bootstrap: only the owner can create the first admin
await expectError("anon cannot run cms_bootstrap_admin", () => as("anon", null, () => q(`select public.cms_bootstrap_admin('admin@example.com')`)), /permission denied/);
await expectError("signed-in user cannot run cms_bootstrap_admin", () => as("authenticated", STRANGER, () => q(`select public.cms_bootstrap_admin('someone@example.com')`)), /permission denied/);
await q(`select public.cms_bootstrap_admin('admin@example.com')`);
record("project owner can bootstrap the first admin", (await q(`select role from public.cms_profiles where user_id = '${ADMIN}'`))[0]?.role === "admin");

// ------------------------------------------------------------ anonymous visitors
for (const t of [...tables, "cms_media", "cms_private_settings", "cms_revisions", "cms_profiles"]) {
  await expectError(`anon cannot read ${t}`, () => as("anon", null, () => q(`select * from public.${t} limit 1`)), /permission denied/);
}
await expectError("anon cannot insert content", () => as("anon", null, () => q(`insert into public.cms_services (slug, draft) values ('hack', '{}')`)), /permission denied/);
await expectError("anon cannot update content", () => as("anon", null, () => q(`update public.cms_sections set draft = '{}'`)), /permission denied/);
await expectError("anon cannot call cms_publish", () => as("anon", null, () => q(`select public.cms_publish('cms_settings', 'site')`)), /permission denied/);
await expectError("anon cannot upload to cms-media", () => as("anon", null, () => q(`insert into storage.objects (bucket_id, name) values ('cms-media', 'x.png')`)), /row-level security/);

const snap0 = (await as("anon", null, () => q(`select public.cms_public_snapshot() as s`)))[0].s;
record("anon can read the published snapshot", Boolean(snap0?.pages?.home?.sections?.hero?.content));
record("snapshot contains all 7 public pages", Object.keys(snap0.pages).length === 8 && !("global" in snap0.pages), Object.keys(snap0.pages).join(","));
record("snapshot contains global sections", Object.keys(snap0.global).length === 8, Object.keys(snap0.global).join(","));
record("snapshot collections are initialized", ["services", "articles", "videos", "reviews", "faqs"].every((k) => snap0.collections[k].initialized), JSON.stringify(Object.fromEntries(Object.entries(snap0.collections).map(([k, v]) => [k, v.items.length]))));
const health = (await as("anon", null, () => q(`select public.cms_health() as h`)))[0].h;
record("anon cms_health reports schema without privileges", health.schemaVersion === 1 && health.isEditor === false && health.signedIn === false);

// ------------------------------------------------------------ signed-in, not an editor
const strangerRows = await as("authenticated", STRANGER, () => q(`select count(*)::int as n from public.cms_sections`));
record("signed-in non-editor sees no CMS rows", strangerRows[0].n === 0);
await expectError("signed-in non-editor cannot insert", () => as("authenticated", STRANGER, () => q(`insert into public.cms_services (slug, draft) values ('hack', '{}')`)), /row-level security/);
const strangerUpdate = await as("authenticated", STRANGER, () => q(`update public.cms_sections set draft = '{"x":1}' returning id`));
record("signed-in non-editor updates affect 0 rows", strangerUpdate.length === 0);
await expectError("signed-in non-editor cannot publish", () => as("authenticated", STRANGER, () => q(`select public.cms_publish('cms_settings', 'site')`)), /permission/);
await expectError("signed-in non-editor cannot upload media", () => as("authenticated", STRANGER, () => q(`insert into storage.objects (bucket_id, name) values ('cms-media', 'x.png')`)), /row-level security/);
await expectError("signed-in non-editor cannot grant roles", () => as("authenticated", STRANGER, () => q(`select public.cms_set_role('someone@example.com', 'admin')`)), /administrators/);

// ------------------------------------------------------------ admin manages users
await as("authenticated", ADMIN, () => q(`select public.cms_set_role('editor@example.com', 'editor', 'Editor')`));
record("admin can grant the editor role", (await q(`select role from public.cms_profiles where user_id = '${EDITOR}'`))[0]?.role === "editor");
await expectError("editor cannot manage users", () => as("authenticated", EDITOR, () => q(`select public.cms_set_role('someone@example.com', 'admin')`)), /administrators/);
await expectError("last admin cannot be removed", () => as("authenticated", ADMIN, () => q(`select public.cms_remove_user('${ADMIN}')`)), /last administrator/);
await expectError("granting a role needs an existing auth account", () => as("authenticated", ADMIN, () => q(`select public.cms_set_role('nobody@example.com', 'editor')`)), /No Supabase account/);
const editorSeesProfiles = await as("authenticated", EDITOR, () => q(`select user_id from public.cms_profiles`));
record("editor sees only their own profile", editorSeesProfiles.length === 1 && editorSeesProfiles[0].user_id === EDITOR);

// ------------------------------------------------------------ editing workflow
const hero = (await as("authenticated", EDITOR, () => q(`select id, version, draft from public.cms_sections where page_id = 'home' and key = 'hero'`)))[0];
const newDraft = { ...hero.draft, headlineLead: { ar: "عنوان تجريبي", en: "Test headline" } };
const saved = await as("authenticated", EDITOR, () =>
  q(`update public.cms_sections set draft = $1 where id = $2 and version = $3 returning version, updated_by`, [JSON.stringify(newDraft), hero.id, hero.version]),
);
record("editor saves a heading draft (version increments, attributed)", saved[0]?.version === hero.version + 1 && saved[0]?.updated_by === EDITOR);
const stale = await as("authenticated", EDITOR, () => q(`update public.cms_sections set draft = $1 where id = $2 and version = $3 returning id`, [JSON.stringify(hero.draft), hero.id, hero.version]));
record("stale version update is rejected (concurrent edit protection)", stale.length === 0);

const snapDraft = (await as("anon", null, () => q(`select public.cms_public_snapshot() as s`)))[0].s;
record("draft does NOT leak into the public snapshot", snapDraft.pages.home.sections.hero.content.headlineLead.en !== "Test headline");

await as("authenticated", EDITOR, () => q(`select public.cms_publish('cms_sections', $1)`, [hero.id]));
const snapPub = (await as("anon", null, () => q(`select public.cms_public_snapshot() as s`)))[0].s;
record("published heading appears in the snapshot", snapPub.pages.home.sections.hero.content.headlineLead.en === "Test headline");

const revs = await as("authenticated", EDITOR, () => q(`select action from public.cms_revisions where entity_id = $1 order by id`, [hero.id]));
record("revisions recorded for create/save/publish", ["create", "save", "publish"].every((a) => revs.some((r) => r.action === a)), revs.map((r) => r.action).join(" → "));
await expectError("revisions are read-only for editors", () => as("authenticated", EDITOR, () => q(`delete from public.cms_revisions`)), /permission denied/);

// restore the original heading from the first revision, then publish
const firstRev = (await as("authenticated", EDITOR, () => q(`select id from public.cms_revisions where entity_id = $1 and action = 'create'`, [hero.id])))[0];
await as("authenticated", EDITOR, () => q(`select public.cms_restore_revision($1)`, [firstRev.id]));
const restored = (await as("authenticated", EDITOR, () => q(`select draft from public.cms_sections where id = $1`, [hero.id])))[0];
record("restoring a revision brings back the original draft", restored.draft.headlineLead.en === hero.draft.headlineLead.en);
await as("authenticated", EDITOR, () => q(`select public.cms_discard_draft('cms_sections', $1)`, [hero.id]));
const discarded = (await as("authenticated", EDITOR, () => q(`select draft, published from public.cms_sections where id = $1`, [hero.id])))[0];
record("discarding a draft reverts to the published content", JSON.stringify(discarded.draft) === JSON.stringify(discarded.published));

// layout: reorder + hide, published together
const homeSections = await as("authenticated", EDITOR, () => q(`select id, key from public.cms_sections where page_id = 'home' order by position`));
const reordered = [...homeSections];
const journeyIdx = reordered.findIndex((s) => s.key === "journey");
const [journey] = reordered.splice(journeyIdx, 1);
reordered.splice(1, 0, journey);
await as("authenticated", EDITOR, () => q(`select public.cms_reorder('cms_sections', $1::uuid[])`, [reordered.map((s) => s.id)]));
await as("authenticated", EDITOR, () => q(`update public.cms_sections set visible = false where page_id = 'home' and key = 'why'`));
await expectError("required sections cannot be hidden", () => as("authenticated", EDITOR, () => q(`update public.cms_sections set visible = false where page_id = 'home' and key = 'hero'`)), /cms_sections_required_visible/);
const snapBeforeLayout = (await as("anon", null, () => q(`select public.cms_public_snapshot() as s`)))[0].s;
record("unpublished layout changes stay out of the snapshot", snapBeforeLayout.pages.home.sections.journey.position !== 1 && snapBeforeLayout.pages.home.sections.why.visible === true);
const changed = (await as("authenticated", EDITOR, () => q(`select public.cms_publish_page('home') as n`)))[0].n;
const snapLayout = (await as("anon", null, () => q(`select public.cms_public_snapshot() as s`)))[0].s;
record("publishing the page applies order and visibility", snapLayout.pages.home.sections.journey.position === 1 && snapLayout.pages.home.sections.why.visible === false, `${changed} sections published`);

// collections: unpublish an article
const art = (await as("authenticated", EDITOR, () => q(`select id, slug from public.cms_articles order by position limit 1`)))[0];
await as("authenticated", EDITOR, () => q(`select public.cms_unpublish('cms_articles', $1)`, [art.id]));
const snapArt = (await as("anon", null, () => q(`select public.cms_public_snapshot() as s`)))[0].s;
record("unpublished article is removed from the snapshot", !snapArt.collections.articles.items.some((i) => i.slug === art.slug) && snapArt.collections.articles.initialized);
await as("authenticated", EDITOR, () => q(`select public.cms_publish('cms_articles', $1)`, [art.id]));

// hidden items stay out of the snapshot
await as("authenticated", EDITOR, () => q(`update public.cms_services set visible = false where slug = 'aortic-disease'`));
const snapHidden = (await as("anon", null, () => q(`select public.cms_public_snapshot() as s`)))[0].s;
record("hidden services are excluded from the snapshot", !snapHidden.collections.services.items.some((i) => i.slug === "aortic-disease"));

// reviews need consent
const rev = (await as("authenticated", EDITOR, () =>
  q(`insert into public.cms_reviews (draft) values ($1) returning id, consent_confirmed`, [JSON.stringify({ quote: { ar: "شكرا", en: "Thank you" }, consent: false })]),
))[0];
record("review consent column mirrors the draft", rev.consent_confirmed === false);
await expectError("a review without patient consent cannot be published", () => as("authenticated", EDITOR, () => q(`select public.cms_publish('cms_reviews', $1)`, [rev.id])), /cms_reviews_consent_required/);
await as("authenticated", EDITOR, () => q(`update public.cms_reviews set draft = draft || '{"consent": true}' where id = $1`, [rev.id]));
await as("authenticated", EDITOR, () => q(`select public.cms_publish('cms_reviews', $1)`, [rev.id]));
const snapRev = (await as("anon", null, () => q(`select public.cms_public_snapshot() as s`)))[0].s;
record("a consented, published review appears in the snapshot", snapRev.collections.reviews.items.length === 1);

// media: usage + delete protection + snapshot inclusion
const media = (await as("authenticated", EDITOR, () =>
  q(`insert into public.cms_media (path, kind, mime_type, size_bytes, width, height, original_name) values ('images/test.webp', 'image', 'image/webp', 1234, 800, 600, 'test.webp') returning id`),
))[0];
await expectError("media kind/MIME mismatch is rejected", () => as("authenticated", EDITOR, () => q(`insert into public.cms_media (path, kind, mime_type, size_bytes, original_name) values ('images/x.svg', 'image', 'image/svg+xml', 1, 'x.svg')`)), /cms_media_kind_mime/);
const whySection = (await as("authenticated", EDITOR, () => q(`select id, draft from public.cms_sections where page_id = 'home' and key = 'why'`)))[0];
await as("authenticated", EDITOR, () => q(`update public.cms_sections set draft = $1 where id = $2`, [JSON.stringify({ ...whySection.draft, image: `cms:${media.id}` }), whySection.id]));
const usage = await as("authenticated", EDITOR, () => q(`select * from public.cms_media_usage($1)`, [media.id]));
record("media usage finds the section using a file", usage.length === 1 && usage[0].in_draft === true && usage[0].in_published === false, usage.map((u) => u.label).join(", "));
const strangerUsage = await as("authenticated", STRANGER, () => q(`select * from public.cms_media_usage($1)`, [media.id]).catch(() => []));
record("media usage reveals nothing to non-editors", strangerUsage.length === 0);
await expectError("media still referenced cannot be deleted", () => as("authenticated", EDITOR, () => q(`delete from public.cms_media where id = $1`, [media.id])), /still used/);
const snapNoMedia = (await as("anon", null, () => q(`select public.cms_public_snapshot() as s`)))[0].s;
record("media only referenced by drafts is not in the snapshot", !(media.id in snapNoMedia.media));
await as("authenticated", EDITOR, () => q(`select public.cms_publish('cms_sections', $1)`, [whySection.id]));
const snapMedia = (await as("anon", null, () => q(`select public.cms_public_snapshot() as s`)))[0].s;
record("published media metadata is in the snapshot", snapMedia.media[media.id]?.path === "images/test.webp");
await as("authenticated", EDITOR, () => q(`update public.cms_sections set draft = $1 where id = $2`, [JSON.stringify(whySection.draft), whySection.id]));
await as("authenticated", EDITOR, () => q(`select public.cms_publish('cms_sections', $1)`, [whySection.id]));
await as("authenticated", EDITOR, () => q(`delete from public.cms_media where id = $1`, [media.id]));
record("unused media can be deleted", (await q(`select count(*)::int as n from public.cms_media where id = '${media.id}'`))[0].n === 0);

// storage policies for editors
await as("authenticated", EDITOR, () => q(`insert into storage.objects (bucket_id, name) values ('cms-media', 'images/ok.webp')`));
record("editor can upload to cms-media", (await q(`select count(*)::int as n from storage.objects where name = 'images/ok.webp'`))[0].n === 1);
await expectError("editor cannot write to other buckets", () => as("authenticated", EDITOR, () => q(`insert into storage.objects (bucket_id, name) values ('other', 'x.png')`)), /row-level security|foreign key/);
const bucket = (await q(`select public, file_size_limit, allowed_mime_types from storage.buckets where id = 'cms-media'`))[0];
record("cms-media bucket is public with size and type limits", bucket.public === true && Number(bucket.file_size_limit) === 52428800 && !bucket.allowed_mime_types.includes("image/svg+xml"));

// private settings stay private
await as("authenticated", EDITOR, () => q(`insert into public.cms_private_settings (key, value) values ('deploy_hook_url', '"https://example.com/hook"')`));
const snapPrivate = JSON.stringify((await as("anon", null, () => q(`select public.cms_public_snapshot() as s`)))[0].s);
record("private settings never appear in the snapshot", !snapPrivate.includes("example.com/hook"));

// an intentionally emptied collection stays empty (it must not fall back to the bundled defaults)
await as("authenticated", EDITOR, () => q(`delete from public.cms_faqs`));
const snapEmpty = (await as("anon", null, () => q(`select public.cms_public_snapshot() as s`)))[0].s;
record("an emptied collection stays empty on the site", snapEmpty.collections.faqs.initialized === true && snapEmpty.collections.faqs.items.length === 0);
const deletions = await as("authenticated", EDITOR, () => q(`select count(*)::int as n from public.cms_revisions where entity_type = 'cms_faqs' and action = 'delete'`));
record("deletions are kept in revision history", deletions[0].n === 9, `${deletions[0].n} delete revisions`);

// structural validation
await expectError("non-object drafts are rejected", () => as("authenticated", EDITOR, () => q(`update public.cms_settings set draft = '"oops"'`)), /check constraint/);
await expectError("invalid slugs are rejected", () => as("authenticated", EDITOR, () => q(`insert into public.cms_articles (slug, draft) values ('Bad Slug!', '{}')`)), /check constraint/);

console.log(results.join("\n"));
console.log(`\n${results.length - failures}/${results.length} checks passed`);
process.exit(failures ? 1 : 0);
