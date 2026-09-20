-- Fix: saving a Scripture Work from the studio failed with
--   ERROR 42702: column reference "passage_key" is ambiguous
--     DETAIL: It could refer to either a PL/pgSQL variable or a table column.
--
-- The bug lived inside public.ensure_bible_passage() from 20260919000200: the
-- function declared local variables named exactly like columns of the table it
-- writes to (passage_key, book_slug). PL/pgSQL resolves an unqualified name
-- against the local variable *and* the target relation of the INSERT, and the
-- ON CONFLICT (passage_key) inference clause - where the target table's columns
-- are in scope - is where the parser refuses to choose.
--
-- This migration is additive: it only replaces that one function body. No table,
-- column, constraint, policy, bucket or grant changes. The fix is to stop relying
-- on name resolution at all: the locals are now prefixed with v_ (so they can
-- never shadow a column) and every column reference in the statement is qualified
-- with its table alias.
--
-- Safe to re-run (create or replace), and required on any project that already
-- applied 20260919000200.

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
  v_book_slug text;
  v_passage_key text;
begin
  if not public.is_holy8bit_admin() then
    raise exception 'Administrator access required';
  end if;

  select b.slug into v_book_slug from public.bible_books b where b.slug = p_book_slug;
  if v_book_slug is null then
    raise exception 'Unknown Bible book: %', p_book_slug;
  end if;

  if p_whole_chapter then
    v_passage_key := format('%s:%s', v_book_slug, p_chapter_start);
  elsif p_chapter_start = p_chapter_end and p_verse_start = p_verse_end then
    v_passage_key := format('%s:%s:%s', v_book_slug, p_chapter_start, p_verse_start);
  elsif p_chapter_start = p_chapter_end then
    v_passage_key := format('%s:%s:%s-%s', v_book_slug, p_chapter_start, p_verse_start, p_verse_end);
  else
    v_passage_key := format('%s:%s:%s-%s:%s', v_book_slug, p_chapter_start, p_verse_start, p_chapter_end, p_verse_end);
  end if;

  insert into public.bible_passages (
    passage_key, book_id, chapter_start, verse_start, chapter_end, verse_end, whole_chapter
  )
  select v_passage_key, b.id, p_chapter_start,
         case when p_whole_chapter then null else p_verse_start end,
         p_chapter_end,
         case when p_whole_chapter then null else p_verse_end end,
         p_whole_chapter
  from public.bible_books b
  where b.slug = v_book_slug
  on conflict (passage_key) do nothing;

  return v_passage_key;
end;
$$;

revoke all on function public.ensure_bible_passage(text, smallint, smallint, smallint, smallint, boolean) from public;
grant execute on function public.ensure_bible_passage(text, smallint, smallint, smallint, smallint, boolean) to authenticated;
