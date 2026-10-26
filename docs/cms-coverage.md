# CMS coverage report

**Date:** 2026-10-26. **Modes tested:** local sandbox, and the hosted Supabase project
`gkztouqwweuksiyweaei` (live results in [`cms-security.md`](./cms-security.md) §8).

The full field-by-field map is in
[`cms-content-inventory.md`](./cms-content-inventory.md) / [`.json`](./cms-content-inventory.json)
(regenerate with `npm run cms:inventory`).

## Summary

| | |
| --- | --- |
| Pages | 8 (7 public pages and the article page template), 45 sections |
| Shared sections | 8: navigation, header, footer, social/phone panel, emergency notice, booking band, interface labels, 404 page |
| Collections | 5: services (6), articles (6), videos (0), patient reviews (0), FAQ (9) |
| Editable field definitions | 370, of which 285 are bilingual (Arabic + English), 28 image/video fields and 21 link/button destinations |
| Section layout | Every page's section order is editable; every section except the required hero can be hidden |
| Hardcoded visitor-facing text in public code | None (checked automatically; two documented exceptions below) |

## Requested scope → where it is controlled

| Requested | Covered by |
| --- | --- |
| Every heading and paragraph | Page sections, shared sections and collection items (all text is bilingual) |
| Every short text, label, badge, caption, disclaimer | Same. Small UI labels (breadcrumbs, reading time, review badge, menu/accessibility labels) are under Global content › Interface labels and Header. |
| Every button label, destination and action | Button label and destination fields per section (internal page, anchor, `https`, `mailto:`, `tel:`). Contact actions (call, WhatsApp, email, booking) follow Contact & social. |
| Every image and its metadata | Image fields with alt text (and focal point where the photo is cropped). Media library: alt text, caption, replace-everywhere, usage list, guarded delete. |
| Every video, thumbnail, source URL, description | Videos collection: YouTube ID, uploaded file or external `https` URL; thumbnail, title, description, topic, duration. Videos page sections for the headings and planned topics. |
| Every section and its content | Pages › *page*: content, order and visibility; publish per section or per page |
| Navigation labels and footer items | Global content › Navigation menu (labels, show/hide per item) and Footer |
| Contact details and social links | Contact & social: phone, WhatsApp, email, booking URL, social profiles, clinic locations. One place updates the header, hero panel, footer, contact page and structured data. |
| Articles and article metadata | Articles collection: URL slug, title, excerpt, category, publication date, reading time, author, medical-review flag, image and alt text, key points, sections (heading, paragraphs, bullets), per-article SEO (title, description, share image). Related articles are chosen automatically by category. |
| Services | Services collection: icon, image, title, summary, body, points, related articles, confirmation flag; anchor slug |
| Testimonials | Patient reviews collection with mandatory consent (enforced by the database) |
| FAQ | FAQ collection (question, answer paragraphs, group); groups edited on the FAQ section |
| SEO metadata | Every page: title, description, social share title/description/image, canonical, noindex. Site-wide title template and default share image. |
| Popups, modals, banners, floating elements, overlays | Mobile menu labels (Header), emergency banner (shared), services availability note, hero floating card, "Why" photo chips, social/phone glass panel, booking band, 404 page. The site has no other popups. |
| Everything else found in the project | Language gateway and 404 text, structured-data names (from settings), web-manifest names, WhatsApp message composer labels, empty states (no reviews, videos in preparation) |

## Verification

| Check | Result |
| --- | --- |
| `npm run cms:verify`: renderers, component files, defaults, **field coverage (74 documents)**, validation, cross-references, internal links, **import → publish → build reproduces the site**, `seed.sql` freshness, **no hardcoded public text** | 10/10 pass. Two checks were mutation-tested: a stale `seed.sql` and an injected hardcoded string are both caught. |
| `npm run test:db`: migration, seed idempotency, RLS, roles, publishing, revisions, consent, media rules (PGlite) | 69/69 pass |
| Dashboard end-to-end in a real browser, local mode (headless Chrome against the static export) | 26/26 pass (list below) |
| Published content → static site round-trip | Exported `published.json` was built into the site. The new headline, section order, hidden section and `tel:` link (Arabic and English) appeared; the unpublished preview edit did not. |
| Email sign-in links (supabase-js against a local Auth mock) | 5/5 pass |
| **Live, hosted Supabase project:** sign-in, import, access control for visitors and role-less accounts, draft/stale-save/discard/publish workflow, media upload (single and resumable), replace and delete, build pull | All pass; content left exactly as imported |
| Live build vs bundled content | The site built from the CMS is identical to the bundled content |
| Public site unchanged by the CMS refactor | Pixel comparison against pre-refactor captures: identical apart from image-loading timing and one intended +24px spacing fix on Contact |

Dashboard end-to-end checks:

- **Overview and lists**
  - the overview loads with live counts
  - local mode is labelled
  - no false "rebuild needed" on a fresh sandbox
  - the pages list is complete
  - sections appear in their real order with their real names
- **Editing and validation**
  - a `javascript:` link blocks saving
  - unsaved edits are flagged, and leaving asks for confirmation
  - "Save draft" reports where it saved, and the status changes to "Unpublished changes"
  - publishing reports honestly
  - an invalid email is rejected
  - a review cannot be published without consent; the draft review is deleted
- **Preview**
  - shows the published edit in the real hero
  - shows unsaved form edits live
- **Layout and settings**
  - reorder and hide, then "Publish page" applies them
  - the contact phone is saved and published
- **Media, history and export**
  - the media library lists bundled photos with their usage
  - revision history records the edits
  - System detects that published content differs from the build
  - `published.json` export contains the published edit and not the unpublished one
  - no runtime errors

Bugs found and fixed by these tests:

- a hydration mismatch in the dashboard shell
- notifications covering the save bar
- the media library crashing when loading usage data
- FAQ positions numbered per group instead of across the collection
- a false "rebuild needed" warning
- FAQ group being a free-text field (now a select of the defined groups)
- missing-alt-text suggestions not shown
- invitation links rejected by the PKCE client

## Not editable, by design

Listed with reasons in the inventory, "Not editable in the CMS":

- **Language names** in the switcher (fixed endonyms)
- **Brand colours, typography and visual effects** (the design system)
- **Decorative icons and illustrations** (each service's icon *choice* is editable)
- **Page addresses and section keys** (article and service slugs are editable)
- **Generated files:** robots, sitemap, manifest structure
- **The dashboard's own interface text**

## Not yet verified

Real Supabase Auth **emails** (password reset, invitations). They need the Site URL, redirect URLs and
email templates set in the Supabase dashboard first (docs/CMS.md 2.4). Link handling itself was tested
against a mock.
