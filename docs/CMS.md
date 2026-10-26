# Hybrid Hearts CMS — setup and editing guide

The website stays a **fully static export**. Content is edited in a dashboard at **`/admin`**, stored in
**Supabase**, and built into the static pages. Publishing in the dashboard does not rewrite HTML that is
already deployed. The site shows published changes after the **next build**, which a build hook can trigger
from the dashboard.

```
 /admin (dashboard, static)  ──save / publish──▶  Supabase (Postgres + Storage + Auth, RLS)
                                                        │
 npm run build  ◀── cms:pull reads PUBLISHED content ───┘   (cms_public_snapshot(), publishable key)
      │
      ▼
 ./out — static HTML/CSS/JS/images (any static host)
```

- **Drafts never reach the website.** The build reads published content only, through the read-only
  database function `cms_public_snapshot()`.
- **Nothing is lost if Supabase is unavailable.** The bundled content in `/content` is the fallback, and
  `npm run build` stops instead of deploying an outdated site when a configured Supabase project can't be
  reached (see `CMS_PULL` below).

Related documents:

- [`cms-content-inventory.md`](./cms-content-inventory.md): every editable field, where it appears on the
  site and where to edit it.
- [`cms-security.md`](./cms-security.md): the security model and how it was verified.
- [`cms-coverage.md`](./cms-coverage.md): what is editable, what was tested, and what is not editable.

---

## 1. Two modes

| | **Supabase mode** (production) | **Local sandbox** (no Supabase configured) |
| --- | --- | --- |
| Turned on by | `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` at build time | Leaving them empty |
| Sign-in | Supabase Auth (email + password) | None |
| Where edits are stored | The Supabase database | This browser only (`localStorage`), labelled on every screen |
| Uploads | Supabase Storage (`cms-media` bucket) | Not available; the bundled photos can be used |
| Getting content onto the site | `npm run build` pulls it automatically | System › **Download published.json** → save as `content/published.json` → build |

The local sandbox is for trying the dashboard and for offline drafting. It is not a production database.

---

## 2. One-time setup (Supabase mode)

### 2.1 Create the project and copy two values

In [supabase.com](https://supabase.com), create a project (or choose an existing one). Then open
**Project Settings › API Keys** (or the **Connect** dialog) and copy:

- **Project URL**, e.g. `https://abcdefghijklmnop.supabase.co`
- **Publishable key**: starts with `sb_publishable_…`. Older projects can use the legacy **anon** key instead.

> Never use the **secret** / **service_role** key anywhere in this project. The website and dashboard
> don't need it. The build refuses to run if one is put in a `NEXT_PUBLIC_*` variable.

### 2.2 Apply the database migration

The migration creates:

- the tables and Row Level Security policies
- the publish/restore functions and the revision history
- the `cms-media` Storage bucket and its policies

It is safe to run more than once. Choose one of these methods:

- **SQL Editor:** open `supabase/migrations/20261025120000_cms_schema.sql`, paste the whole file into
  **SQL Editor › New query**, and run it.
- **Supabase CLI:**
  ```bash
  npx supabase login
  npx supabase link --project-ref <your-project-ref>
  npx supabase db push
  ```

### 2.3 Create the first administrator

1. Go to **Authentication › Users › Add user › Create new user**. Enter the administrator's email and a
   temporary password, and tick **Auto Confirm User**.
2. Go to **SQL Editor** and run:
   ```sql
   select public.cms_bootstrap_admin('admin@example.com');
   ```
   It cannot be called with the publishable key or by signed-in users. Only the project owner (SQL
   Editor) or the all-powerful service-role key can run it.

### 2.4 Authentication settings

- **Authentication › Sign In / Providers › Email:** turn **off** "Allow new users to sign up".
  - A self-registered account would have no CMS role and could not see or change anything. Turning sign-up
    off still keeps the user list clean.
- **Authentication › URL Configuration:**
  - **Site URL:** the production address, e.g. `https://www.example.com`.
  - **Redirect URLs:** add `https://www.example.com/admin/reset-password/`, and
    `http://localhost:3000/admin/reset-password/` for local development.
- **Authentication › Email Templates** (recommended). These links work in any browser and on any device:
  - **Invite user:**
    `<a href="{{ .SiteURL }}/admin/reset-password/?token_hash={{ .TokenHash }}&type=invite">Set your password</a>`
  - **Reset password:**
    `<a href="{{ .SiteURL }}/admin/reset-password/?token_hash={{ .TokenHash }}&type=recovery">Choose a new password</a>`

  If you keep Supabase's default templates, password-reset links only work in the same browser that
  requested them.

### 2.5 Configure and build the website

Set the variables from [`.env.example`](../.env.example):

- **Locally:** copy it to `.env.local` and fill it in.
- **On your host:** add the same names in its environment settings for the build step.

Then build:

```bash
npm run build      # cms:pull → next build → ./out
```

### 2.6 Import the website content

Sign in at `/admin/login/`, open **System status**, and press **Import website content**. This copies:

- every page and section
- the settings
- all services, articles and FAQs

as they appear on the site today. It only creates missing records and never overwrites edits.

Alternatively, run `supabase/seed.sql` in the SQL Editor. It holds the same content, generated by
`npm run cms:seed-sql`, and is equally idempotent.

System status should now show every check in green.

### 2.7 Optional: rebuild from the dashboard

Most static hosts (Netlify, Vercel, Cloudflare Pages) offer a **build hook** URL. Paste it in
**Site settings › Website build hook**. Then **System status › Trigger website rebuild** starts a new build
after publishing.

- The hook URL is stored in `cms_private_settings`. Signed-in editors and admins can read it; visitors
  cannot, and it is never part of the website.
- Hosts don't report build progress back to the browser. Check the host's deploy log.

---

## 3. People and roles

| Role | Can |
| --- | --- |
| **Administrator** | Everything an editor can, plus manage users (Users page) |
| **Editor** | Edit, publish, unpublish, reorder, upload and replace media, restore revisions, import content |
| Signed-in account without a role | Nothing: sees a "no access" message |

**To add someone:**

1. Create their account in **Supabase › Authentication › Users**: either **Add user** (auto-confirm), or
   **Invite user** if you set up the invite template in 2.4.
2. In the dashboard, go to **Users** and give them a role.

The last administrator cannot be removed or demoted.

People can change their password with **Forgot password** on the sign-in page.

---

## 4. Editing workflow

1. **Edit** a page section, a shared section, settings or a collection item. Unsaved edits are marked, and
   leaving the page asks first.
2. **Save draft**:
   - Stored in Supabase but not on the website.
   - If someone else saved the same record meanwhile, you get a conflict message instead of silently
     overwriting their work.
3. **Preview draft** renders the real website components with your saved drafts plus the unsaved edits in
   the form:
   - Arabic or English
   - desktop, tablet or mobile width
   - only for signed-in editors
4. **Publish** the section, item or settings. **Publish page** publishes all of a page's sections, its
   order and visibility, and its SEO together.
5. **Rebuild** the website: run the build hook, or `npm run build` and deploy. The Overview and System
   status screens say when published content differs from what the current build shows.

You can also:

- **Reorder and hide sections:** drag, use ↑ ↓, or the eye icon in Pages › *page*. Required sections
  (e.g. the hero) can't be hidden. Layout changes go live with **Publish page**.
- **Discard unpublished changes:** go back to the published version.
- **Unpublish:** remove an article, service, video, review or FAQ from the site but keep it as a draft.
- **Revision history:** every create, save, publish and delete is recorded. **Restore** brings back an
  older version as a draft.

**Patient reviews:** publish only the patient's own words, with their written consent. The dashboard
and the database both refuse to publish a review whose consent box is not ticked.

**Validation:**

- Links accept `/internal-path`, `#anchor`, `https://…`, `mailto:` and `tel:`. `javascript:` and
  `data:` are rejected.
- Phone numbers must be in international format and email addresses must be valid.
- Slugs must be lowercase and unique.
- Text-length guidance and missing alt text are shown as suggestions; they don't block saving.

---

## 5. Media library

- **Upload** by drag-and-drop or by choosing files:
  - Images: JPEG, PNG, WebP, AVIF, GIF, up to 10 MB. SVG is not accepted.
  - Videos: MP4, WebM, up to 50 MB.
  - Files over 6 MB upload in resumable chunks with a progress bar.
  - Failed uploads leave no orphan files.
- **Pick** media in any image or video field, from the uploads or the photos bundled with the site.
- **Replace file** swaps the file behind a media item, so every page using it shows the new file after the
  next build.
- **Delete** only works for files that nothing uses. The dashboard lists where a file is used, and the
  database blocks deleting a file that is still referenced.
- The limits come from `NEXT_PUBLIC_CMS_MAX_IMAGE_MB` / `NEXT_PUBLIC_CMS_MAX_VIDEO_MB`. The bucket allows
  at most 50 MB per file (the Supabase Free plan maximum); raise both on paid plans.

---

## 6. Publishing to the live site

`npm run build` runs `scripts/cms-pull.mjs` first. It writes the published content to
`content/published.json`, which is merged over the bundled defaults. Its behaviour depends on `CMS_PULL`:

| `CMS_PULL` | Behaviour |
| --- | --- |
| `auto` (default) | Pull when Supabase is configured. If the pull fails, the build stops, so an outdated site is never deployed by mistake. |
| `required` | Also fail when Supabase is not configured (for CI). |
| `off` | Skip the pull; build from `/content` plus any existing `content/published.json`. |

Published media are linked from Supabase Storage's public URLs. Bundled photos stay in `public/images`.

---

## 7. Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server; the dashboard is at `http://localhost:3000/admin/` |
| `npm run build` | `cms:pull` → static export to `./out` |
| `npm run preview` | Serve `./out` like a static host (`http://localhost:4173`) |
| `npm run check` | Lint, type-check, database tests, CMS checks, build |
| `npm run test:db` | Runs the migration + seed in an in-memory Postgres (PGlite) and checks RLS, roles, publishing, revisions, consent and media rules (69 checks) |
| `npm run cms:verify` | Content integrity: renderers, field coverage, validation, links, import round-trip, seed freshness, no hardcoded public text |
| `npm run cms:inventory` | Regenerates `docs/cms-content-inventory.{md,json}` |
| `npm run cms:seed-sql` | Regenerates `supabase/seed.sql` from the current content |
| `npm run cms:pull` | Pulls published content only |

---

## 8. Troubleshooting

| Message | Fix |
| --- | --- |
| "The CMS database is not set up" | Apply the migration (2.2). |
| "No content imported yet" | System status › Import website content (2.6). |
| "You don't have permission…" / "no access" | An administrator must give the account a role (Users page, or `cms_bootstrap_admin` for the first admin). |
| "This link is invalid or has expired" | Request a new link from the sign-in page. For links that work across browsers, set up the email templates in 2.4. |
| Build stops at `cms:pull — FAILED…` | Check the project URL/key and that the migration is applied, or build from bundled content with `CMS_PULL=off`. |
| Build stops with "must be the publishable (or legacy anon) key" | A secret key was put in a public variable. Remove it and rotate that key in Supabase. |
| Published changes don't show on the site | Rebuild and redeploy; System status shows whether the build is current. |

---

## 9. Where things live

| Path | Purpose |
| --- | --- |
| `content/*.ts`, `content/defaults.ts` | Bundled default content (fallback and import source) |
| `content/published.json` | Published content pulled at build time (`{}` = use the defaults) |
| `lib/cms/registry.ts` | Pages, sections, shared sections and collections: the single map of what is editable |
| `lib/cms/site.ts` | Merges published content over the defaults (`buildSite`) |
| `lib/cms/admin/*` | Dashboard logic: Supabase and local adapters, field schema, validation, uploads |
| `components/PageView.tsx`, `components/sections/*` | Section renderers used by the website and the draft preview |
| `app/admin/**`, `components/admin/**` | Dashboard screens |
| `supabase/migrations/`, `supabase/seed.sql` | Database schema/security and the initial content |
| `scripts/` | `cms-pull`, `cms-verify`, `cms-inventory`, `cms-seed-sql`, `test-cms-db`, key guard |
