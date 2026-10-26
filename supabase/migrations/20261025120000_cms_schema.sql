-- =============================================================================
--  Hybrid Hearts CMS — schema, security and storage                    v1
-- =============================================================================
--  Apply to a fresh Supabase project with:  supabase db push   (or paste into
--  Dashboard › SQL Editor). Safe to re-run: every statement is idempotent.
--
--  Security model
--  - All cms_* tables have Row Level Security enabled and NO anonymous access.
--  - Signed-in users can only read/write CMS data if they have a row in
--    cms_profiles with role 'admin' or 'editor' (see cms_is_editor()).
--  - The public website never reads the tables. At build time it calls
--    cms_public_snapshot(), a read-only function that returns PUBLISHED content
--    only — drafts are never exposed.
--  - Media files live in the public Storage bucket `cms-media`; only editors can
--    upload, replace or delete them.
-- =============================================================================

-- ---------------------------------------------------------------- helpers ----

create or replace function public.cms_touch()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  new.updated_by := auth.uid();
  if tg_op = 'UPDATE' then
    new.version := old.version + 1;
  end if;
  return new;
end;
$$;

-- ---------------------------------------------------------------- profiles ---

create table if not exists public.cms_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  display_name text not null default '',
  role text not null check (role in ('admin', 'editor')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.cms_profiles is 'Users allowed to use the CMS dashboard. Admins can also manage other users.';

-- SECURITY DEFINER so RLS policies can call them without recursing into cms_profiles' own RLS.
create or replace function public.cms_is_editor()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.cms_profiles p
    where p.user_id = auth.uid() and p.role in ('admin', 'editor')
  );
$$;

create or replace function public.cms_is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.cms_profiles p
    where p.user_id = auth.uid() and p.role = 'admin'
  );
$$;

-- ------------------------------------------------------------------ pages ----
-- One row per public page (+ 'global' for shared content). draft/published hold SEO metadata.

create table if not exists public.cms_pages (
  id text primary key check (id ~ '^[a-z][a-z0-9-]*$'),
  route text not null default '',
  label text not null,
  sort integer not null default 0,
  is_template boolean not null default false,
  draft jsonb not null default '{}'::jsonb check (jsonb_typeof(draft) = 'object' and octet_length(draft::text) < 200000),
  published jsonb check (published is null or jsonb_typeof(published) = 'object'),
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null,
  published_at timestamptz,
  published_by uuid references auth.users (id) on delete set null
);

comment on column public.cms_pages.draft is 'SEO metadata being edited (title, description, Open Graph, noindex, canonical).';
comment on column public.cms_pages.published is 'SEO metadata used by the next site build.';

-- --------------------------------------------------------------- sections ----

create table if not exists public.cms_sections (
  id uuid primary key default gen_random_uuid(),
  page_id text not null references public.cms_pages (id) on delete cascade,
  key text not null check (key ~ '^[a-zA-Z][a-zA-Z0-9-]*$'),
  label text not null,
  section_type text not null,
  ref_key text,
  required boolean not null default false,
  position integer not null default 0,
  visible boolean not null default true,
  draft jsonb not null default '{}'::jsonb check (jsonb_typeof(draft) = 'object' and octet_length(draft::text) < 500000),
  published jsonb check (published is null or jsonb_typeof(published) = 'object'),
  published_position integer,
  published_visible boolean,
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null,
  published_at timestamptz,
  published_by uuid references auth.users (id) on delete set null,
  unique (page_id, key),
  constraint cms_sections_required_visible check (not required or visible)
);

create index if not exists cms_sections_page_position_idx on public.cms_sections (page_id, position);

-- --------------------------------------------------------------- settings ----

create table if not exists public.cms_settings (
  id text primary key default 'site' check (id = 'site'),
  draft jsonb not null default '{}'::jsonb check (jsonb_typeof(draft) = 'object' and octet_length(draft::text) < 200000),
  published jsonb check (published is null or jsonb_typeof(published) = 'object'),
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null,
  published_at timestamptz,
  published_by uuid references auth.users (id) on delete set null
);

-- Dashboard-only configuration (e.g. a deploy hook URL). Never part of the public snapshot.
create table if not exists public.cms_private_settings (
  key text primary key check (key ~ '^[a-z][a-z0-9_]*$'),
  value jsonb not null,
  version integer not null default 1,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);

-- ------------------------------------------------------------------ media ----

create table if not exists public.cms_media (
  id uuid primary key default gen_random_uuid(),
  bucket text not null default 'cms-media' check (bucket = 'cms-media'),
  path text not null unique check (path !~ '(^/|\.\.|\\)' and length(path) between 3 and 300),
  kind text not null check (kind in ('image', 'video')),
  mime_type text not null,
  size_bytes bigint not null check (size_bytes >= 0),
  width integer check (width is null or width > 0),
  height integer check (height is null or height > 0),
  duration_seconds numeric check (duration_seconds is null or duration_seconds >= 0),
  original_name text not null,
  alt jsonb not null default '{"ar": "", "en": ""}'::jsonb check (jsonb_typeof(alt) = 'object'),
  caption jsonb not null default '{"ar": "", "en": ""}'::jsonb check (jsonb_typeof(caption) = 'object'),
  version integer not null default 1,
  created_at timestamptz not null default now(),
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null,
  constraint cms_media_kind_mime check (
    (kind = 'image' and mime_type in ('image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'))
    or (kind = 'video' and mime_type in ('video/mp4', 'video/webm'))
  )
);

create index if not exists cms_media_created_idx on public.cms_media (created_at desc);

-- ------------------------------------------------------------ collections ----
-- Same shape for every collection: identity/ordering columns + draft/published JSON documents.

create table if not exists public.cms_services (
  id uuid primary key default gen_random_uuid(),
  import_key text unique,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  position integer not null default 0,
  visible boolean not null default true,
  draft jsonb not null default '{}'::jsonb check (jsonb_typeof(draft) = 'object' and octet_length(draft::text) < 200000),
  published jsonb check (published is null or jsonb_typeof(published) = 'object'),
  version integer not null default 1,
  created_at timestamptz not null default now(),
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null,
  published_at timestamptz,
  published_by uuid references auth.users (id) on delete set null
);

create table if not exists public.cms_articles (
  id uuid primary key default gen_random_uuid(),
  import_key text unique,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  position integer not null default 0,
  visible boolean not null default true,
  draft jsonb not null default '{}'::jsonb check (jsonb_typeof(draft) = 'object' and octet_length(draft::text) < 500000),
  published jsonb check (published is null or jsonb_typeof(published) = 'object'),
  version integer not null default 1,
  created_at timestamptz not null default now(),
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null,
  published_at timestamptz,
  published_by uuid references auth.users (id) on delete set null
);

create table if not exists public.cms_videos (
  id uuid primary key default gen_random_uuid(),
  import_key text unique,
  slug text unique check (slug is null or slug ~ '^[A-Za-z0-9_-]+$'),
  position integer not null default 0,
  visible boolean not null default true,
  draft jsonb not null default '{}'::jsonb check (jsonb_typeof(draft) = 'object' and octet_length(draft::text) < 100000),
  published jsonb check (published is null or jsonb_typeof(published) = 'object'),
  version integer not null default 1,
  created_at timestamptz not null default now(),
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null,
  published_at timestamptz,
  published_by uuid references auth.users (id) on delete set null
);

create table if not exists public.cms_reviews (
  id uuid primary key default gen_random_uuid(),
  import_key text unique,
  slug text unique,
  position integer not null default 0,
  visible boolean not null default true,
  -- Mirrors draft.consent. A review can only be published with the patient's confirmed consent.
  consent_confirmed boolean not null default false,
  draft jsonb not null default '{}'::jsonb check (jsonb_typeof(draft) = 'object' and octet_length(draft::text) < 50000),
  published jsonb check (published is null or jsonb_typeof(published) = 'object'),
  version integer not null default 1,
  created_at timestamptz not null default now(),
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null,
  published_at timestamptz,
  published_by uuid references auth.users (id) on delete set null,
  constraint cms_reviews_consent_required check (
    published is null or (consent_confirmed and coalesce((published ->> 'consent')::boolean, false))
  )
);

create table if not exists public.cms_faqs (
  id uuid primary key default gen_random_uuid(),
  import_key text unique,
  slug text unique,
  category text not null default 'appointments' check (category ~ '^[a-z0-9-]+$'),
  position integer not null default 0,
  visible boolean not null default true,
  draft jsonb not null default '{}'::jsonb check (jsonb_typeof(draft) = 'object' and octet_length(draft::text) < 50000),
  published jsonb check (published is null or jsonb_typeof(published) = 'object'),
  version integer not null default 1,
  created_at timestamptz not null default now(),
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null,
  published_at timestamptz,
  published_by uuid references auth.users (id) on delete set null
);

create index if not exists cms_services_position_idx on public.cms_services (position);
create index if not exists cms_articles_position_idx on public.cms_articles (position);
create index if not exists cms_videos_position_idx on public.cms_videos (position);
create index if not exists cms_reviews_position_idx on public.cms_reviews (position);
create index if not exists cms_faqs_category_position_idx on public.cms_faqs (category, position);

-- Keep the review consent / FAQ category columns in sync with the draft document.
create or replace function public.cms_sync_columns()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_table_name = 'cms_reviews' then
    new.consent_confirmed := coalesce((new.draft ->> 'consent')::boolean, false);
  elsif tg_table_name = 'cms_faqs' and coalesce(new.draft ->> 'category', '') ~ '^[a-z0-9-]+$' then
    new.category := new.draft ->> 'category';
  end if;
  return new;
end;
$$;

-- -------------------------------------------------------------- revisions ----

create table if not exists public.cms_revisions (
  id bigint generated always as identity primary key,
  entity_type text not null,
  entity_id text not null,
  entity_label text not null default '',
  action text not null check (action in ('create', 'save', 'publish', 'unpublish', 'layout', 'restore', 'discard', 'delete')),
  snapshot jsonb not null,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null
);

create index if not exists cms_revisions_entity_idx on public.cms_revisions (entity_type, entity_id, created_at desc);
create index if not exists cms_revisions_created_idx on public.cms_revisions (created_at desc);

-- Records a revision whenever content, publication state or layout changes.
create or replace function public.cms_record_revision()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_row jsonb;
  v_old jsonb;
  v_action text;
begin
  if tg_op = 'DELETE' then
    v_row := to_jsonb(old);
    v_action := 'delete';
  elsif tg_op = 'INSERT' then
    v_row := to_jsonb(new);
    v_action := 'create';
  else
    v_row := to_jsonb(new);
    v_old := to_jsonb(old);
    if (v_row -> 'published') is distinct from (v_old -> 'published') then
      v_action := case when v_row -> 'published' is null or jsonb_typeof(v_row -> 'published') = 'null' then 'unpublish' else 'publish' end;
    elsif (v_row -> 'draft') is distinct from (v_old -> 'draft') then
      v_action := coalesce(nullif(current_setting('cms.action', true), ''), 'save');
    elsif (v_row -> 'position') is distinct from (v_old -> 'position')
       or (v_row -> 'visible') is distinct from (v_old -> 'visible') then
      v_action := 'layout';
    else
      return null;
    end if;
  end if;

  insert into public.cms_revisions (entity_type, entity_id, entity_label, action, snapshot, created_by)
  values (
    tg_table_name,
    v_row ->> 'id',
    coalesce(v_row ->> 'slug', case when v_row ? 'page_id' then (v_row ->> 'page_id') || ' › ' || (v_row ->> 'label') end, v_row ->> 'label', v_row ->> 'id'),
    v_action,
    jsonb_build_object(
      'draft', v_row -> 'draft',
      'published', v_row -> 'published',
      'position', v_row -> 'position',
      'visible', v_row -> 'visible',
      'version', v_row -> 'version'
    ),
    auth.uid()
  );
  return null;
end;
$$;

-- ---------------------------------------------------------------- triggers ---

do $$
declare
  t text;
begin
  foreach t in array array['cms_pages', 'cms_sections', 'cms_settings', 'cms_private_settings', 'cms_media',
                           'cms_services', 'cms_articles', 'cms_videos', 'cms_reviews', 'cms_faqs']
  loop
    execute format('drop trigger if exists cms_touch on public.%I', t);
    execute format('create trigger cms_touch before update on public.%I for each row execute function public.cms_touch()', t);
  end loop;

  foreach t in array array['cms_pages', 'cms_sections', 'cms_settings', 'cms_services', 'cms_articles', 'cms_videos', 'cms_reviews', 'cms_faqs']
  loop
    execute format('drop trigger if exists cms_revision on public.%I', t);
    execute format('create trigger cms_revision after insert or update or delete on public.%I for each row execute function public.cms_record_revision()', t);
  end loop;

  foreach t in array array['cms_reviews', 'cms_faqs']
  loop
    execute format('drop trigger if exists cms_sync on public.%I', t);
    execute format('create trigger cms_sync before insert or update on public.%I for each row execute function public.cms_sync_columns()', t);
  end loop;
end;
$$;

-- -------------------------------------------------------- media protection ---

-- Where a media file is referenced ("cms:<uuid>" inside any draft or published document).
-- SECURITY INVOKER: row level security limits it to editors (others simply get no rows).
create or replace function public.cms_media_usage(p_media_id uuid)
returns table (entity_type text, entity_id text, label text, in_draft boolean, in_published boolean)
language sql
stable
set search_path = ''
as $$
  with needle as (select '"cms:' || p_media_id::text || '"' as n),
  docs as (
    select 'cms_pages' as entity_type, p.id as entity_id, p.label as label, p.draft::text as d, coalesce(p.published::text, '') as pub from public.cms_pages p
    union all select 'cms_sections', s.id::text, s.page_id || ' › ' || s.label, s.draft::text, coalesce(s.published::text, '') from public.cms_sections s
    union all select 'cms_settings', st.id, 'Site settings', st.draft::text, coalesce(st.published::text, '') from public.cms_settings st
    union all select 'cms_services', x.id::text, x.slug, x.draft::text, coalesce(x.published::text, '') from public.cms_services x
    union all select 'cms_articles', x.id::text, x.slug, x.draft::text, coalesce(x.published::text, '') from public.cms_articles x
    union all select 'cms_videos', x.id::text, coalesce(x.slug, x.id::text), x.draft::text, coalesce(x.published::text, '') from public.cms_videos x
    union all select 'cms_reviews', x.id::text, coalesce(x.slug, x.id::text), x.draft::text, coalesce(x.published::text, '') from public.cms_reviews x
    union all select 'cms_faqs', x.id::text, coalesce(x.slug, x.id::text), x.draft::text, coalesce(x.published::text, '') from public.cms_faqs x
  )
  select docs.entity_type, docs.entity_id, docs.label,
         position(needle.n in docs.d) > 0, position(needle.n in docs.pub) > 0
  from docs, needle
  where position(needle.n in docs.d) > 0 or position(needle.n in docs.pub) > 0;
$$;

-- Blocks deleting a media record that is still referenced anywhere (server-side safety net).
create or replace function public.cms_media_guard()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_needle text := '"cms:' || old.id::text || '"';
  v_used boolean;
begin
  select exists (
    select 1 from (
      select draft::text || coalesce(published::text, '') as t from public.cms_pages
      union all select draft::text || coalesce(published::text, '') from public.cms_sections
      union all select draft::text || coalesce(published::text, '') from public.cms_settings
      union all select draft::text || coalesce(published::text, '') from public.cms_services
      union all select draft::text || coalesce(published::text, '') from public.cms_articles
      union all select draft::text || coalesce(published::text, '') from public.cms_videos
      union all select draft::text || coalesce(published::text, '') from public.cms_reviews
      union all select draft::text || coalesce(published::text, '') from public.cms_faqs
    ) docs where position(v_needle in docs.t) > 0
  ) into v_used;
  if v_used then
    raise exception 'This file is still used on the website. Replace it everywhere before deleting it.'
      using errcode = '23503';
  end if;
  return old;
end;
$$;

drop trigger if exists cms_media_guard on public.cms_media;
create trigger cms_media_guard before delete on public.cms_media for each row execute function public.cms_media_guard();

-- ------------------------------------------------------- publishing actions ---

create or replace function public.cms_assert_editor()
returns void
language plpgsql
stable
set search_path = ''
as $$
begin
  if not public.cms_is_editor() then
    raise exception 'You do not have permission to edit the CMS.' using errcode = '42501';
  end if;
end;
$$;

create or replace function public.cms_check_table(p_table text)
returns void
language plpgsql
immutable
set search_path = ''
as $$
begin
  if p_table not in ('cms_pages', 'cms_sections', 'cms_settings', 'cms_services', 'cms_articles', 'cms_videos', 'cms_reviews', 'cms_faqs') then
    raise exception 'Unknown CMS table: %', p_table using errcode = '22023';
  end if;
end;
$$;

-- Copies the draft (and, for sections, the order/visibility) to the published state.
create or replace function public.cms_publish(p_table text, p_id text)
returns jsonb
language plpgsql
set search_path = ''
as $$
declare
  v_row jsonb;
begin
  perform public.cms_assert_editor();
  perform public.cms_check_table(p_table);
  if p_table = 'cms_sections' then
    update public.cms_sections
       set published = draft, published_position = position, published_visible = visible,
           published_at = now(), published_by = auth.uid()
     where id::text = p_id
    returning to_jsonb(cms_sections.*) into v_row;
  else
    execute format(
      'update public.%I set published = draft, published_at = now(), published_by = auth.uid() where id::text = $1 returning to_jsonb(%I.*)',
      p_table, p_table)
      using p_id into v_row;
  end if;
  if v_row is null then
    raise exception 'Record not found or not editable.' using errcode = 'P0002';
  end if;
  return v_row;
end;
$$;

-- Publishes a page's SEO and every section on it in one transaction.
create or replace function public.cms_publish_page(p_page_id text)
returns integer
language plpgsql
set search_path = ''
as $$
declare
  v_count integer;
begin
  perform public.cms_assert_editor();
  update public.cms_pages
     set published = draft, published_at = now(), published_by = auth.uid()
   where id = p_page_id;
  if not found then
    raise exception 'Page not found.' using errcode = 'P0002';
  end if;
  update public.cms_sections
     set published = draft, published_position = position, published_visible = visible,
         published_at = now(), published_by = auth.uid()
   where page_id = p_page_id
     and (published is distinct from draft or published_position is distinct from position or published_visible is distinct from visible);
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

-- Removes a collection item from the public site (its draft is kept).
create or replace function public.cms_unpublish(p_table text, p_id text)
returns jsonb
language plpgsql
set search_path = ''
as $$
declare
  v_row jsonb;
begin
  perform public.cms_assert_editor();
  perform public.cms_check_table(p_table);
  if p_table not in ('cms_services', 'cms_articles', 'cms_videos', 'cms_reviews', 'cms_faqs') then
    raise exception 'Only collection items can be unpublished. Hide a section instead.' using errcode = '22023';
  end if;
  execute format(
    'update public.%I set published = null, published_at = null, published_by = null where id::text = $1 returning to_jsonb(%I.*)',
    p_table, p_table)
    using p_id into v_row;
  if v_row is null then
    raise exception 'Record not found or not editable.' using errcode = 'P0002';
  end if;
  return v_row;
end;
$$;

-- Throws away unpublished edits: draft := published.
create or replace function public.cms_discard_draft(p_table text, p_id text)
returns jsonb
language plpgsql
set search_path = ''
as $$
declare
  v_row jsonb;
begin
  perform public.cms_assert_editor();
  perform public.cms_check_table(p_table);
  perform set_config('cms.action', 'discard', true);
  if p_table = 'cms_sections' then
    update public.cms_sections
       set draft = published, position = coalesce(published_position, position), visible = coalesce(published_visible, visible)
     where id::text = p_id and published is not null
    returning to_jsonb(cms_sections.*) into v_row;
  else
    execute format('update public.%I set draft = published where id::text = $1 and published is not null returning to_jsonb(%I.*)', p_table, p_table)
      using p_id into v_row;
  end if;
  if v_row is null then
    raise exception 'Nothing published to revert to.' using errcode = 'P0002';
  end if;
  return v_row;
end;
$$;

-- Sets positions from an ordered list of ids (sections of one page, or a collection).
create or replace function public.cms_reorder(p_table text, p_ids uuid[])
returns integer
language plpgsql
set search_path = ''
as $$
declare
  v_count integer := 0;
  i integer;
begin
  perform public.cms_assert_editor();
  perform public.cms_check_table(p_table);
  if p_table in ('cms_pages', 'cms_settings') then
    raise exception 'This table has no order.' using errcode = '22023';
  end if;
  for i in 1 .. coalesce(array_length(p_ids, 1), 0) loop
    execute format('update public.%I set position = $1 where id = $2 and position is distinct from $1', p_table)
      using i - 1, p_ids[i];
    v_count := v_count + 1;
  end loop;
  return v_count;
end;
$$;

-- Restores a revision's draft into the record (it still has to be published).
create or replace function public.cms_restore_revision(p_revision_id bigint)
returns jsonb
language plpgsql
set search_path = ''
as $$
declare
  v_rev public.cms_revisions;
  v_row jsonb;
begin
  perform public.cms_assert_editor();
  select * into v_rev from public.cms_revisions where id = p_revision_id;
  if v_rev.id is null then
    raise exception 'Revision not found.' using errcode = 'P0002';
  end if;
  perform public.cms_check_table(v_rev.entity_type);
  if jsonb_typeof(v_rev.snapshot -> 'draft') <> 'object' then
    raise exception 'This revision has no restorable content.' using errcode = '22023';
  end if;
  perform set_config('cms.action', 'restore', true);
  execute format('update public.%I set draft = $1 where id::text = $2 returning to_jsonb(%I.*)', v_rev.entity_type, v_rev.entity_type)
    using v_rev.snapshot -> 'draft', v_rev.entity_id into v_row;
  if v_row is null then
    raise exception 'The record for this revision no longer exists.' using errcode = 'P0002';
  end if;
  return v_row;
end;
$$;

-- ------------------------------------------------------------ public read ----

-- Everything the public site needs, PUBLISHED content only. Called by `npm run cms:pull`
-- at build time with the publishable (anon) key. Drafts, hidden items, unconsented reviews
-- and private settings are never included.
create or replace function public.cms_public_snapshot()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  with
  -- Collections count as initialized once the content import has run (it always creates the
  -- settings record). An intentionally emptied collection then stays empty on the site.
  state as (select exists (select 1 from public.cms_settings where id = 'site') as initialized),
  published_docs as (
    select published::text as t from public.cms_pages where published is not null
    union all select published::text from public.cms_sections where published is not null
    union all select published::text from public.cms_settings where published is not null
    union all select published::text from public.cms_services where published is not null and visible
    union all select published::text from public.cms_articles where published is not null and visible
    union all select published::text from public.cms_videos where published is not null and visible
    union all select published::text from public.cms_reviews where published is not null and visible and consent_confirmed
    union all select published::text from public.cms_faqs where published is not null and visible
  ),
  used_media as (
    select m.* from public.cms_media m
    where exists (select 1 from published_docs d where position('"cms:' || m.id::text || '"' in d.t) > 0)
  )
  select jsonb_build_object(
    'version', 1,
    'source', 'supabase',
    'generatedAt', now(),
    'settings', (select s.published from public.cms_settings s where s.id = 'site'),
    'pages', coalesce((
      select jsonb_object_agg(p.id, jsonb_build_object(
        'seo', p.published,
        'sections', coalesce((
          select jsonb_object_agg(s.key, jsonb_build_object(
            'position', s.published_position,
            'visible', s.published_visible,
            'content', s.published))
          from public.cms_sections s
          where s.page_id = p.id and s.published is not null
        ), '{}'::jsonb)))
      from public.cms_pages p
      where p.id <> 'global'
    ), '{}'::jsonb),
    'global', coalesce((
      select jsonb_object_agg(s.key, s.published)
      from public.cms_sections s
      where s.page_id = 'global' and s.published is not null
    ), '{}'::jsonb),
    'collections', jsonb_build_object(
      'services', jsonb_build_object(
        'initialized', (select initialized from state),
        'items', coalesce((select jsonb_agg(jsonb_build_object('id', x.id, 'slug', x.slug, 'position', x.position, 'visible', x.visible, 'content', x.published) order by x.position, x.created_at)
                           from public.cms_services x where x.published is not null and x.visible), '[]'::jsonb)),
      'articles', jsonb_build_object(
        'initialized', (select initialized from state),
        'items', coalesce((select jsonb_agg(jsonb_build_object('id', x.id, 'slug', x.slug, 'position', x.position, 'visible', x.visible, 'content', x.published) order by x.position, x.created_at)
                           from public.cms_articles x where x.published is not null and x.visible), '[]'::jsonb)),
      'videos', jsonb_build_object(
        'initialized', (select initialized from state),
        'items', coalesce((select jsonb_agg(jsonb_build_object('id', x.id, 'slug', x.slug, 'position', x.position, 'visible', x.visible, 'content', x.published) order by x.position, x.created_at)
                           from public.cms_videos x where x.published is not null and x.visible), '[]'::jsonb)),
      'reviews', jsonb_build_object(
        'initialized', (select initialized from state),
        'items', coalesce((select jsonb_agg(jsonb_build_object('id', x.id, 'slug', x.slug, 'position', x.position, 'visible', x.visible, 'content', x.published) order by x.position, x.created_at)
                           from public.cms_reviews x where x.published is not null and x.visible and x.consent_confirmed), '[]'::jsonb)),
      'faqs', jsonb_build_object(
        'initialized', (select initialized from state),
        'items', coalesce((select jsonb_agg(jsonb_build_object('id', x.id, 'slug', x.slug, 'position', x.position, 'visible', x.visible, 'content', x.published) order by x.category, x.position, x.created_at)
                           from public.cms_faqs x where x.published is not null and x.visible), '[]'::jsonb))
    ),
    'media', coalesce((
      select jsonb_object_agg(m.id, jsonb_build_object(
        'id', m.id, 'bucket', m.bucket, 'path', m.path, 'kind', m.kind, 'mime', m.mime_type, 'size', m.size_bytes,
        'width', m.width, 'height', m.height, 'duration', m.duration_seconds, 'originalName', m.original_name,
        'alt', m.alt, 'caption', m.caption))
      from used_media m
    ), '{}'::jsonb)
  );
$$;

-- Lets the dashboard check the database is set up before anyone signs in.
create or replace function public.cms_health()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'schemaVersion', 1,
    'serverTime', now(),
    'initialized', exists (select 1 from public.cms_sections),
    'signedIn', auth.uid() is not null,
    'isEditor', public.cms_is_editor(),
    'isAdmin', public.cms_is_admin()
  );
$$;

-- -------------------------------------------------------- user management ----

create or replace function public.cms_list_users()
returns table (user_id uuid, email text, display_name text, role text, created_at timestamptz, last_sign_in_at timestamptz)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.cms_is_admin() then
    raise exception 'Only administrators can manage users.' using errcode = '42501';
  end if;
  return query
    select p.user_id, p.email, p.display_name, p.role, p.created_at, u.last_sign_in_at
    from public.cms_profiles p
    left join auth.users u on u.id = p.user_id
    order by p.created_at;
end;
$$;

-- Grants CMS access to an existing Supabase Auth user (invite them in Supabase › Authentication first).
create or replace function public.cms_set_role(p_email text, p_role text, p_display_name text default '')
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid;
begin
  if not public.cms_is_admin() then
    raise exception 'Only administrators can manage users.' using errcode = '42501';
  end if;
  if p_role not in ('admin', 'editor') then
    raise exception 'Role must be admin or editor.' using errcode = '22023';
  end if;
  select u.id into v_user from auth.users u where lower(u.email) = lower(trim(p_email));
  if v_user is null then
    raise exception 'No Supabase account uses %. Invite the person in Supabase › Authentication › Users first.', p_email using errcode = 'P0002';
  end if;
  if v_user = auth.uid() and p_role <> 'admin' and (select count(*) from public.cms_profiles where role = 'admin') <= 1 then
    raise exception 'You are the only administrator; add another administrator first.' using errcode = '22023';
  end if;
  insert into public.cms_profiles (user_id, email, display_name, role)
  values (v_user, lower(trim(p_email)), coalesce(p_display_name, ''), p_role)
  on conflict (user_id) do update set role = excluded.role, display_name = case when excluded.display_name <> '' then excluded.display_name else public.cms_profiles.display_name end, updated_at = now();
  return v_user;
end;
$$;

create or replace function public.cms_remove_user(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.cms_is_admin() then
    raise exception 'Only administrators can manage users.' using errcode = '42501';
  end if;
  if (select role from public.cms_profiles where user_id = p_user_id) = 'admin'
     and (select count(*) from public.cms_profiles where role = 'admin') <= 1 then
    raise exception 'The last administrator cannot be removed.' using errcode = '22023';
  end if;
  delete from public.cms_profiles where user_id = p_user_id;
end;
$$;

-- One-time setup: run in the SQL Editor (as the project owner) to make the first administrator.
--   select public.cms_bootstrap_admin('you@example.com');
create or replace function public.cms_bootstrap_admin(p_email text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid;
begin
  select u.id into v_user from auth.users u where lower(u.email) = lower(trim(p_email));
  if v_user is null then
    raise exception 'No Supabase account uses %. Create or invite the user in Authentication › Users first.', p_email;
  end if;
  insert into public.cms_profiles (user_id, email, role)
  values (v_user, lower(trim(p_email)), 'admin')
  on conflict (user_id) do update set role = 'admin', updated_at = now();
  return v_user;
end;
$$;

-- ---------------------------------------------------------------- RLS ----

do $$
declare
  t text;
begin
  foreach t in array array['cms_profiles', 'cms_pages', 'cms_sections', 'cms_settings', 'cms_private_settings', 'cms_media',
                           'cms_services', 'cms_articles', 'cms_videos', 'cms_reviews', 'cms_faqs', 'cms_revisions']
  loop
    -- Not FORCE: the table owner (used only by the SECURITY DEFINER functions above, e.g. the
    -- published snapshot and the revision trigger) must still be able to read/write.
    execute format('alter table public.%I enable row level security', t);
    -- Supabase grants new tables to anon/authenticated by default; remove that first.
    execute format('revoke all on table public.%I from anon, authenticated, public', t);
  end loop;

  -- Content tables: editors (and admins) can read and write; nobody else can see them.
  foreach t in array array['cms_pages', 'cms_sections', 'cms_settings', 'cms_private_settings', 'cms_media',
                           'cms_services', 'cms_articles', 'cms_videos', 'cms_reviews', 'cms_faqs']
  loop
    execute format('grant select, insert, update, delete on table public.%I to authenticated', t);
    execute format('drop policy if exists cms_editors_all on public.%I', t);
    execute format(
      'create policy cms_editors_all on public.%I for all to authenticated using (public.cms_is_editor()) with check (public.cms_is_editor())', t);
  end loop;
end;
$$;

-- Profiles: users see their own row; admins see everyone. Writes only through cms_set_role / cms_remove_user.
grant select on table public.cms_profiles to authenticated;
drop policy if exists cms_profiles_read on public.cms_profiles;
create policy cms_profiles_read on public.cms_profiles for select to authenticated
  using (user_id = auth.uid() or public.cms_is_admin());

-- Revisions: read-only history for editors (rows are written by the revision trigger).
grant select on table public.cms_revisions to authenticated;
drop policy if exists cms_revisions_read on public.cms_revisions;
create policy cms_revisions_read on public.cms_revisions for select to authenticated
  using (public.cms_is_editor());

-- ------------------------------------------------------- function grants ----

do $$
declare
  f text;
begin
  -- Revoke the default PUBLIC execute on everything this migration defines…
  foreach f in array array[
    'cms_touch()', 'cms_sync_columns()', 'cms_record_revision()', 'cms_media_guard()',
    'cms_is_editor()', 'cms_is_admin()', 'cms_assert_editor()', 'cms_check_table(text)',
    'cms_media_usage(uuid)', 'cms_publish(text, text)', 'cms_publish_page(text)', 'cms_unpublish(text, text)',
    'cms_discard_draft(text, text)', 'cms_reorder(text, uuid[])', 'cms_restore_revision(bigint)',
    'cms_public_snapshot()', 'cms_health()', 'cms_list_users()', 'cms_set_role(text, text, text)',
    'cms_remove_user(uuid)', 'cms_bootstrap_admin(text)']
  loop
    execute format('revoke all on function public.%s from public, anon, authenticated', f);
  end loop;

  -- …then grant only what each role needs.
  foreach f in array array[
    'cms_is_editor()', 'cms_is_admin()', 'cms_assert_editor()', 'cms_check_table(text)',
    'cms_media_usage(uuid)', 'cms_publish(text, text)', 'cms_publish_page(text)', 'cms_unpublish(text, text)',
    'cms_discard_draft(text, text)', 'cms_reorder(text, uuid[])', 'cms_restore_revision(bigint)',
    'cms_list_users()', 'cms_set_role(text, text, text)', 'cms_remove_user(uuid)']
  loop
    execute format('grant execute on function public.%s to authenticated', f);
  end loop;

  execute 'grant execute on function public.cms_public_snapshot() to anon, authenticated';
  execute 'grant execute on function public.cms_health() to anon, authenticated';
  -- cms_bootstrap_admin: no grants — only the project owner (SQL Editor) can run it.
end;
$$;

-- ---------------------------------------------------------------- storage ----

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'cms-media', 'cms-media', true,
  52428800, -- 50 MB per file (Supabase Free plan maximum). Raise on paid plans together with NEXT_PUBLIC_CMS_MAX_VIDEO_MB.
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif', 'video/mp4', 'video/webm']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Public bucket: anyone can download files by URL. Listing, uploading, replacing and deleting are editors-only.
drop policy if exists cms_media_editors_select on storage.objects;
create policy cms_media_editors_select on storage.objects for select to authenticated
  using (bucket_id = 'cms-media' and public.cms_is_editor());

drop policy if exists cms_media_editors_insert on storage.objects;
create policy cms_media_editors_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'cms-media' and public.cms_is_editor());

drop policy if exists cms_media_editors_update on storage.objects;
create policy cms_media_editors_update on storage.objects for update to authenticated
  using (bucket_id = 'cms-media' and public.cms_is_editor())
  with check (bucket_id = 'cms-media' and public.cms_is_editor());

drop policy if exists cms_media_editors_delete on storage.objects;
create policy cms_media_editors_delete on storage.objects for delete to authenticated
  using (bucket_id = 'cms-media' and public.cms_is_editor());
