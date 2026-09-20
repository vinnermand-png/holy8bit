-- HOLY8BIT publishing workflow.
-- Adds the two things the public pages need and the core schema could not express:
--   1. a canonical way to create a passage row, so a creator never hand-writes a passage key
--   2. wallpaper renditions of a published Scripture Work, with their own storage bucket
-- This migration is additive; the core schema stays untouched.

-- ---------------------------------------------------------------------------
-- Passage provisioning
-- The core trigger requires passage_key to match the canonical boundaries exactly.
-- This function is the single supported way to create a passage, so an admin
-- chooses book / chapter / verse and the database derives the canonical key.
-- ---------------------------------------------------------------------------
create or replace function public.ensure_bible_passage(
  p_book_slug text,
  p_chapter_start smallint,
  p_verse_start smallint,
  p_chapter_end smallint,
  p_verse_end smallint,
  p_whole_chapter boolean default false
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  book_slug text;
  passage_key text;
begin
  if not public.is_holy8bit_admin() then
    raise exception 'Administrator access required';
  end if;

  select slug into book_slug from public.bible_books where slug = p_book_slug;
  if book_slug is null then
    raise exception 'Unknown Bible book: %', p_book_slug;
  end if;

  if p_whole_chapter then
    passage_key := format('%s:%s', book_slug, p_chapter_start);
  elsif p_chapter_start = p_chapter_end and p_verse_start = p_verse_end then
    passage_key := format('%s:%s:%s', book_slug, p_chapter_start, p_verse_start);
  elsif p_chapter_start = p_chapter_end then
    passage_key := format('%s:%s:%s-%s', book_slug, p_chapter_start, p_verse_start, p_verse_end);
  else
    passage_key := format('%s:%s:%s-%s:%s', book_slug, p_chapter_start, p_verse_start, p_chapter_end, p_verse_end);
  end if;

  insert into public.bible_passages (
    passage_key, book_id, chapter_start, verse_start, chapter_end, verse_end, whole_chapter
  )
  select passage_key, b.id, p_chapter_start,
         case when p_whole_chapter then null else p_verse_start end,
         p_chapter_end,
         case when p_whole_chapter then null else p_verse_end end,
         p_whole_chapter
  from public.bible_books b
  where b.slug = book_slug
  on conflict (passage_key) do nothing;

  return passage_key;
end;
$$;

revoke all on function public.ensure_bible_passage(text, smallint, smallint, smallint, smallint, boolean) from public;
grant execute on function public.ensure_bible_passage(text, smallint, smallint, smallint, smallint, boolean) to authenticated;

-- ---------------------------------------------------------------------------
-- Wallpaper renditions
-- A wallpaper is never its own content model: it is a rendition of a published
-- Scripture Work's artwork, so it inherits the passage and the Bible keeps the order.
-- ---------------------------------------------------------------------------
create table public.scripture_wallpapers (
  id uuid primary key default gen_random_uuid(),
  work_id uuid not null references public.scripture_works(id) on delete cascade,
  label text not null,
  width_px integer not null,
  height_px integer not null,
  storage_path text not null,
  file_name text,
  status public.work_status not null default 'draft',
  published_at timestamptz,
  sort_order smallint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint scripture_wallpapers_label_check check (char_length(trim(label)) between 1 and 120),
  constraint scripture_wallpapers_dimensions_check check (width_px > 0 and height_px > 0),
  constraint scripture_wallpapers_storage_path_check check (char_length(trim(storage_path)) > 0),
  constraint scripture_wallpapers_published_at_check check (status = 'draft' or published_at is not null),
  constraint scripture_wallpapers_work_label_unique unique (work_id, label)
);

create index scripture_wallpapers_work_index on public.scripture_wallpapers(work_id, sort_order);
create index scripture_wallpapers_status_index on public.scripture_wallpapers(status);
create index scripture_wallpapers_published_index on public.scripture_wallpapers(status) where status = 'published';

create trigger scripture_wallpapers_updated_at before update on public.scripture_wallpapers
for each row execute function public.set_updated_at();

-- A wallpaper may only be published together with the work it renders.
create or replace function public.validate_wallpaper_publication()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  work_status public.work_status;
begin
  select status into work_status from public.scripture_works where id = new.work_id;
  if work_status is null then
    raise exception 'Unknown Scripture Work';
  end if;
  if new.status = 'published' and work_status <> 'published' then
    raise exception 'A wallpaper cannot be published before its Scripture Work is published';
  end if;
  return new;
end;
$$;

create trigger validate_wallpaper_publication_before_write
before insert or update on public.scripture_wallpapers
for each row execute function public.validate_wallpaper_publication();

alter table public.scripture_wallpapers enable row level security;

-- Public visibility mirrors Scripture Works: published wallpaper from a published work.
create policy wallpaper_public_read on public.scripture_wallpapers
for select to anon, authenticated using (
  status = 'published'
  and exists (
    select 1 from public.scripture_works w
    where w.id = scripture_wallpapers.work_id and w.status = 'published'
  )
);
create policy wallpaper_admin_read on public.scripture_wallpapers
for select to authenticated using (public.is_holy8bit_admin());
create policy wallpaper_admin_insert on public.scripture_wallpapers
for insert to authenticated with check (public.is_holy8bit_admin());
create policy wallpaper_admin_update on public.scripture_wallpapers
for update to authenticated using (public.is_holy8bit_admin()) with check (public.is_holy8bit_admin());
create policy wallpaper_admin_delete on public.scripture_wallpapers
for delete to authenticated using (public.is_holy8bit_admin());

-- ---------------------------------------------------------------------------
-- Wallpaper storage
-- Private bucket; public delivery is through server-generated signed URLs only.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('wallpaper-media', 'wallpaper-media', false)
on conflict (id) do update set public = excluded.public;

create policy admin_upload_wallpaper_media on storage.objects
for insert to authenticated with check (
  bucket_id = 'wallpaper-media' and public.is_holy8bit_admin()
);
create policy admin_update_wallpaper_media on storage.objects
for update to authenticated using (public.is_holy8bit_admin()) with check (public.is_holy8bit_admin());
create policy admin_delete_wallpaper_media on storage.objects
for delete to authenticated using (public.is_holy8bit_admin());
