create extension if not exists pgcrypto;

create type public.bible_testament as enum ('old', 'new');
create type public.work_status as enum ('draft', 'published');
create type public.scripture_media_type as enum ('video', 'image', 'gif');

create table public.bible_books (
  id smallint primary key,
  name text not null,
  slug text not null unique,
  testament public.bible_testament not null,
  canonical_order smallint not null unique,
  chapter_count smallint not null,
  created_at timestamptz not null default now(),
  constraint bible_books_order_check check (canonical_order between 1 and 66),
  constraint bible_books_chapter_count_check check (chapter_count > 0)
);

create table public.bible_chapters (
  book_id smallint not null references public.bible_books(id),
  chapter_number smallint not null,
  verse_count smallint not null,
  primary key (book_id, chapter_number),
  constraint bible_chapters_number_check check (chapter_number > 0),
  constraint bible_chapters_verse_count_check check (verse_count > 0)
);

create table public.bible_passages (
  passage_key text primary key,
  book_id smallint not null references public.bible_books(id),
  chapter_start smallint not null,
  verse_start smallint,
  chapter_end smallint not null,
  verse_end smallint,
  whole_chapter boolean not null default false,
  created_at timestamptz not null default now(),
  constraint bible_passages_chapter_start_check check (chapter_start >= 1),
  constraint bible_passages_chapter_order_check check (chapter_end >= chapter_start),
  constraint bible_passages_verse_pair_check check (
    (verse_start is null and verse_end is null)
    or (verse_start is not null and verse_end is not null)
  ),
  constraint bible_passages_whole_chapter_check check (
    (whole_chapter and chapter_start = chapter_end and verse_start is null and verse_end is null)
    or (not whole_chapter and verse_start is not null and verse_end is not null)
  ),
  constraint bible_passages_same_chapter_order_check check (
    chapter_start <> chapter_end or whole_chapter or verse_end >= verse_start
  )
);

create table public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'owner',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint admin_users_role_check check (role in ('owner', 'admin'))
);

create table public.scripture_works (
  id uuid primary key default gen_random_uuid(),
  passage_key text not null references public.bible_passages(passage_key),
  title text not null,
  description text,
  cover_path text,
  media_path text not null,
  media_type public.scripture_media_type not null,
  status public.work_status not null default 'draft',
  featured boolean not null default false,
  internal_production_ref text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint scripture_works_title_check check (char_length(trim(title)) between 1 and 200),
  constraint scripture_works_published_at_check check (status = 'draft' or published_at is not null)
);

create table public.films (
  id uuid primary key default gen_random_uuid(),
  passage_key text not null references public.bible_passages(passage_key),
  slug text not null unique,
  title text not null,
  description text,
  cover_path text,
  film_path text not null,
  status public.work_status not null default 'draft',
  featured boolean not null default false,
  internal_production_ref text,
  duration_seconds integer,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint films_title_check check (char_length(trim(title)) between 1 and 200),
  constraint films_slug_check check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  constraint films_duration_check check (duration_seconds is null or duration_seconds > 0),
  constraint films_published_at_check check (status = 'draft' or published_at is not null)
);

create or replace function public.is_holy8bit_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_users
    where user_id = auth.uid() and is_active = true
  );
$$;

revoke all on function public.is_holy8bit_admin() from public;
grant execute on function public.is_holy8bit_admin() to authenticated;

create or replace function public.validate_bible_passage()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  book_slug text;
  start_verse_count smallint;
  end_verse_count smallint;
  expected_key text;
  chapter_total integer;
begin
  select slug into book_slug from public.bible_books where id = new.book_id;
  if book_slug is null then raise exception 'Unknown Bible book'; end if;

  if new.whole_chapter then
    expected_key := format('%s:%s', book_slug, new.chapter_start);
  elsif new.chapter_start = new.chapter_end and new.verse_start = new.verse_end then
    expected_key := format('%s:%s:%s', book_slug, new.chapter_start, new.verse_start);
  elsif new.chapter_start = new.chapter_end then
    expected_key := format('%s:%s:%s-%s', book_slug, new.chapter_start, new.verse_start, new.verse_end);
  else
    expected_key := format('%s:%s:%s-%s:%s', book_slug, new.chapter_start, new.verse_start, new.chapter_end, new.verse_end);
  end if;

  if new.passage_key <> expected_key then
    raise exception 'passage_key does not match canonical passage boundaries';
  end if;

  select verse_count into start_verse_count from public.bible_chapters
    where book_id = new.book_id and chapter_number = new.chapter_start;
  if start_verse_count is null then raise exception 'Invalid starting chapter'; end if;

  select count(*) into chapter_total from public.bible_chapters
    where book_id = new.book_id and chapter_number between new.chapter_start and new.chapter_end;
  if chapter_total <> new.chapter_end - new.chapter_start + 1 then
    raise exception 'Passage references a missing chapter';
  end if;

  if not new.whole_chapter then
    if new.verse_start < 1 or new.verse_start > start_verse_count then
      raise exception 'Invalid starting verse';
    end if;
    select verse_count into end_verse_count from public.bible_chapters
      where book_id = new.book_id and chapter_number = new.chapter_end;
    if new.verse_end < 1 or new.verse_end > end_verse_count then
      raise exception 'Invalid ending verse';
    end if;
  end if;
  return new;
end;
$$;

create trigger validate_bible_passage_before_write
before insert or update on public.bible_passages
for each row execute function public.validate_bible_passage();

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger scripture_works_updated_at before update on public.scripture_works
for each row execute function public.set_updated_at();

create trigger films_updated_at before update on public.films
for each row execute function public.set_updated_at();

create index bible_chapters_book_index on public.bible_chapters(book_id);
create index bible_passages_book_order_index on public.bible_passages(book_id, chapter_start, verse_start, chapter_end, verse_end);
create index scripture_published_passage_index on public.scripture_works(passage_key) where status = 'published';
create index scripture_status_index on public.scripture_works(status);
create index scripture_featured_index on public.scripture_works(featured) where status = 'published';
create index films_published_passage_index on public.films(passage_key) where status = 'published';
create index films_status_index on public.films(status);
create index films_featured_index on public.films(featured) where status = 'published';

alter table public.bible_books enable row level security;
alter table public.bible_chapters enable row level security;
alter table public.bible_passages enable row level security;
alter table public.admin_users enable row level security;
alter table public.scripture_works enable row level security;
alter table public.films enable row level security;

create policy bible_books_public_read on public.bible_books for select to anon, authenticated using (true);
create policy bible_chapters_public_read on public.bible_chapters for select to anon, authenticated using (true);
create policy bible_passages_public_read on public.bible_passages for select to anon, authenticated using (
  exists (select 1 from public.scripture_works sw where sw.passage_key = bible_passages.passage_key and sw.status = 'published')
  or exists (select 1 from public.films f where f.passage_key = bible_passages.passage_key and f.status = 'published')
);
create policy bible_passages_admin_read on public.bible_passages for select to authenticated using (public.is_holy8bit_admin());

create policy admin_users_self_read on public.admin_users for select to authenticated using (user_id = auth.uid());
create policy scripture_public_read on public.scripture_works for select to anon, authenticated using (status = 'published');
create policy scripture_admin_read on public.scripture_works for select to authenticated using (public.is_holy8bit_admin());
create policy scripture_admin_insert on public.scripture_works for insert to authenticated with check (public.is_holy8bit_admin());
create policy scripture_admin_update on public.scripture_works for update to authenticated using (public.is_holy8bit_admin()) with check (public.is_holy8bit_admin());
create policy scripture_admin_delete on public.scripture_works for delete to authenticated using (public.is_holy8bit_admin());

create policy films_public_read on public.films for select to anon, authenticated using (status = 'published');
create policy films_admin_read on public.films for select to authenticated using (public.is_holy8bit_admin());
create policy films_admin_insert on public.films for insert to authenticated with check (public.is_holy8bit_admin());
create policy films_admin_update on public.films for update to authenticated using (public.is_holy8bit_admin()) with check (public.is_holy8bit_admin());
create policy films_admin_delete on public.films for delete to authenticated using (public.is_holy8bit_admin());

insert into storage.buckets (id, name, public)
values
  ('scripture-media', 'scripture-media', false),
  ('scripture-covers', 'scripture-covers', false),
  ('film-media', 'film-media', false),
  ('film-covers', 'film-covers', false)
on conflict (id) do update set public = excluded.public;

create policy admin_upload_holy8bit_media on storage.objects
for insert to authenticated with check (
  bucket_id in ('scripture-media', 'scripture-covers', 'film-media', 'film-covers')
  and public.is_holy8bit_admin()
);
create policy admin_update_holy8bit_media on storage.objects
for update to authenticated using (public.is_holy8bit_admin()) with check (public.is_holy8bit_admin());
create policy admin_delete_holy8bit_media on storage.objects
for delete to authenticated using (public.is_holy8bit_admin());
