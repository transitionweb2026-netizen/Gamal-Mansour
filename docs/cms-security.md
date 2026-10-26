# CMS security model and verification report

**Status (2026-10-26):** connected to the hosted Supabase project `gkztouqwweuksiyweaei` and verified live
(§8). The same rules were also tested in depth by applying the migration to an in-memory PostgreSQL 18
(PGlite) with stand-in `auth` and `storage` schemas (`npm run test:db`, 69 checks).

Some Auth settings must still be changed in the Supabase dashboard (§8): public sign-up is currently enabled,
and the redirect URLs and email templates are not yet set up.

---

## 1. Secrets and keys

| Requirement | How it is met | Verified by |
| --- | --- | --- |
| No service-role or secret key in client code, public variables, bundles, static JSON, committed `.env` files or logs | The code never reads such a key. The browser uses only `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (or the legacy anon key). The build reads published content with that same public key through a read-only function. | Source search: the only mentions are comments, the guard itself and a stub role inside the test harness. |
| A secret key can't be shipped by mistake | `scripts/supabase-key-guard.mjs` rejects `sb_secret_…` keys and any JWT whose role isn't `anon`. It runs in `next.config.ts` (fails `next dev` and `next build`) and in `cms-pull`. | Tested with a fake `service_role` JWT and an `sb_secret_` key: both stop the build. Publishable and anon keys pass. |
| No committed secrets | `.env*` is git-ignored except `.env.example`, which holds no values. | `.gitignore` |
| Key confined to the dashboard | supabase-js and the configured key are only in dashboard chunks. | A Supabase-mode build: the key appears in one chunk, referenced only by the 16 `/admin` pages. No public page references it. |
| First administrator can't be created with the public key | `cms_bootstrap_admin()` has no `EXECUTE` grant for visitors or signed-in users. Only the project owner (SQL Editor) or the service-role key can run it; the service-role key bypasses all security anyway. | `test:db`, and live: anon gets "permission denied for function cms_bootstrap_admin". |

## 2. Authentication

- **Method:** Supabase Auth with email and password (PKCE flow). Sessions are stored in the browser under
  `hh-cms-auth` and refresh automatically.
- **Sign-up:** public sign-up should be turned **off** (docs/CMS.md 2.4). Even with it on, a new account
  has **no role** and therefore no access (see §3).
- **Email links:**
  - Password-reset and invitation links land on `/admin/reset-password/`.
  - Both credential shapes are accepted: `?token_hash=…&type=…`, checked with `verifyOtp`, and Supabase's
    default `#access_token=…`, checked with `setSession`. Supabase validates both server-side.
  - Credentials are removed from the address bar immediately.
  - Verified with the real supabase-js against a local mock of the Auth endpoints: valid invite links,
    valid recovery links and fragment links sign in; expired links show "invalid or expired"; no
    credentials stay in the URL. **Not yet verified against Supabase's real Auth service.**
- **Dashboard gate:** every dashboard route checks the session and the CMS role. This is for usability
  only. The real enforcement is in the database (§3), because `/admin` is static files anyone can download.

## 3. Authorization: Row Level Security

All 12 `cms_*` tables have RLS enabled, and the default Supabase grants to `anon`/`authenticated` are
revoked first.

`FORCE ROW LEVEL SECURITY` is deliberately **not** used. The table owner is used only by reviewed
`SECURITY DEFINER` functions, which need owner access: the public snapshot, the revision trigger and the
media guard. Each of those functions has `set search_path = ''`.

| Actor | Content tables (pages, sections, settings, collections, media, private settings) | Profiles | Revisions | Public snapshot | Storage `cms-media` |
| --- | --- | --- | --- | --- | --- |
| Visitor (`anon`) | No access (permission denied) | No access | No access | Read, published only | Read files by URL; cannot list or upload |
| Signed in, no role | Sees 0 rows; writes rejected | Own row only | None | Read | Cannot upload |
| **Editor** | Read and write | Own row only | Read only | Read | Upload, replace, delete in `cms-media` only |
| **Administrator** | Read and write | All; managed through `cms_set_role` / `cms_remove_user` | Read only | Read | Same as editor |

**Function permissions:**

- Workflow functions (publish, unpublish, discard, reorder, restore, media usage) re-check
  `cms_is_editor()`.
- User-management functions require `cms_is_admin()`.
- The last administrator can't be removed or demoted.
- `cms_public_snapshot()` and `cms_health()` are the only functions visitors can call.
  `cms_health()` reveals no data.

**What the public snapshot contains:**

- published content only (drafts never)
- visible items only
- reviews only with patient consent
- only the media that published content references
- never the private settings (deploy hook)

Verified by `npm run test:db` (69 checks, all passing), including:

- anon is denied every table, cannot insert, update, publish or upload, and can read the snapshot
- non-editors see nothing, cannot write, cannot publish, upload or grant roles
- editors cannot manage users
- drafts don't leak into the snapshot
- unpublished layout changes stay out of the snapshot
- stale versions are rejected
- revisions are read-only
- referenced media can't be deleted
- media in drafts is not exposed
- uploads to other buckets are rejected
- private settings never appear in the snapshot

## 4. Data integrity

| Rule | Enforced by |
| --- | --- |
| Concurrent edits don't silently overwrite each other | `version` column. Updates must match the version the editor loaded, otherwise "changed elsewhere". |
| Full history | The revision trigger records every create, save, publish and delete. Restore creates a new draft. |
| A review needs written consent before publishing | Check constraint `cms_reviews_consent_required`, plus a dashboard publish blocker |
| Required sections can't be hidden | Check constraint `cms_sections_required_visible`, plus a disabled control |
| A file in use can't be deleted | `cms_media_guard` trigger, plus a disabled button showing where the file is used |
| Media type must match the file | Check constraint `cms_media_kind_mime`. The bucket MIME allowlist excludes SVG (scriptable). |
| Slugs are lowercase and unique | Check constraints and unique indexes |
| Documents are JSON objects | Check constraints. `conform()` also drops unknown keys and repairs types when building the site. |

## 5. Content safety (XSS)

- **No CMS HTML is rendered.** All CMS text is plain text that React escapes. Article bodies are lists of
  paragraphs, not HTML.
- **JSON-LD:** structured data built from CMS content is serialized with `<` escaped, so a title cannot
  close the `<script>` tag (`lib/seo.ts`).
- **Links:**
  - The dashboard rejects `javascript:` and `data:` links (`validateHref`).
  - On the public site, content links pass through `resolveHref`. Unknown schemes become harmless relative
    paths.
  - Booking and social URLs must be `http(s)` (`webUrl` in `lib/content/access.ts`); map links must be
    `https`; phone links are reduced to digits.
  - This also protects against values written directly through the API.
- **Video:**
  - YouTube plays through a click-to-load `youtube-nocookie.com` embed, and the video ID is validated.
  - Uploaded videos play in a `<video>` element.
- **Draft preview:**
  - Shown only to signed-in editors, in an iframe on the same origin.
  - Messages are accepted only from the same origin and with the expected message type.
- **Search engines:** the dashboard is `noindex` and `/admin/` is disallowed in `robots.txt`.

## 6. Static export and infrastructure

- No API routes, Server Actions or server rendering at runtime. The site and the dashboard are static
  files; all dynamic behaviour runs in the browser against Supabase, under RLS.
- The build fails rather than deploying stale content when a configured Supabase project can't be read
  (`CMS_PULL=auto`).
- Storage paths are random (`images/<yyyy>/<mm>/<uuid>.<ext>`), and the original filename is kept only in
  the database.

## 7. Residual risks and recommendations

1. **Public bucket.** Anyone who knows a file's URL can download it, including files used only in drafts or
   not yet used. Paths are unguessable UUIDs, but don't upload confidential material.
2. **Session storage.** Sessions live in browser storage. An XSS on the website's origin could read them.
   Mitigations already in place: no HTML rendering and validated links. Also recommended: a
   Content-Security-Policy header at the host.
3. **Account security.** In Supabase Auth, consider:
   - multi-factor authentication for administrators
   - leaked-password protection (paid plans)
   - a CAPTCHA on sign-in
   - a minimum password length of at least 10 characters (the reset form already requires 10)
4. **Editors are trusted publishers.** RLS limits *who* can publish. The accuracy of medical content, and
   having consent for reviews, remain editorial responsibilities.
5. **Deploy hook URL** is readable by editors and administrators (not visitors). If it leaks, the worst
   case is extra builds. Regenerate it at the host if needed.

## 8. Live verification on the hosted project (2026-10-26)

The migration was applied in the SQL Editor. Everything else ran against the live project. It was left with
exactly the imported content, no test files and no test accounts.

**Setup**
- [x] Migration applied. System status shows six green checks: project, database, migration, signed-in
  admin, content imported, media storage.
- [x] Administrator account created (confirmed) and given the CMS admin role. Password sign-in works.
- [x] **Import website content** run from the dashboard: 9 pages, 53 sections, settings, 6 services,
  6 articles, 9 FAQs.

**Building from the CMS**
- [x] `npm run build` pulled the published content (8 pages, 8 shared sections, all items).
- [x] The resulting site content is identical to the bundled content it replaced.
- [x] The dashboard reports the build as current.

**Visitors (publishable key)**
- [x] Every CMS table and the bootstrap function are denied.
- [x] Storage uploads are refused by the security policy, and listing returns nothing.
- [x] The public snapshot works and contains no private settings.

**Signed-in account without a role** (temporary, deleted afterwards)
- [x] Sees 0 rows; inserts are refused by RLS; updates change 0 rows.
- [x] Cannot publish, cannot grant itself a role, cannot upload, cannot read private settings.

**Admin workflow**
- [x] A draft save increments the version, and a stale save is rejected.
- [x] The draft is absent from the public snapshot until published.
- [x] Discard restores the published content, and publish works.
- [x] Revision history records each change.

**Media, through the dashboard**
- [x] A small PNG uploaded in a single request; a 6.4 MB PNG used resumable (TUS) upload.
- [x] Both were publicly reachable, with their dimensions recorded.
- [x] **Replace file** kept the media item, served the new file and removed the old one from Storage.
- [x] Deleting removed both the record and the Storage file.

**Still to do in the Supabase dashboard**
- [ ] Turn off public sign-up (Authentication › Sign In / Providers › Email). It is currently **on**.
  Self-registered accounts get no access (verified above), but should not be possible.
- [ ] Set the Site URL and the redirect URL `…/admin/reset-password/` once the production domain is known.
- [ ] Set up the email templates (docs/CMS.md 2.4), then send a test password reset.
- [ ] The service-role key and the database password were shared in a chat message, so treat them as
  exposed:
  - Under **Project Settings › API Keys**, disable the **legacy** API keys (anon + service_role). The website
    uses only the publishable key, so nothing depends on them.
  - **Reset the database password** (Project Settings › Database).
  - Give the administrator account a **different password** from the database password (sign-in page ›
    Forgot password, or Authentication › Users).
