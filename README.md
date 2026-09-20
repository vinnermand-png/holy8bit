# HOLY8BIT

HOLY8BIT is a Next.js App Router site for Scripture Works and cinematic Films rooted in the Bible.

## Stack

- Next.js 14.2.35
- React 18.3.1
- TypeScript 5.6.2 (strict)
- Tailwind CSS 3.4.13 with project-specific CSS tokens
- Supabase clients and migration tooling prepared locally

## Development

```bash
npm install
npm run dev
npm run lint
npm run typecheck
npm run build
npm run start
```

Generate the structural Bible seed:

```bash
npm run generate:bible-seed
```

## Public Routes

- `/`
- `/scripture`
- `/scripture/[book]`
- `/scripture/[book]/[passage]`
- `/scripture/journey`
- `/wallpapers`
- `/wallpapers/download/[rendition]` (published-only download)
- `/films`
- `/films/[slug]`
- `/about`

The former Stories, Gallery, and Wallpapers *presentational* routes were removed in the legacy cleanup. Wallpapers now exist as real, database-backed content: a rendition of a published Scripture Work. The Genesis nested Film URLs are retained only as redirects to the canonical `/films/[slug]` route.

## Studio

`/admin` is the internal publishing surface (noindex, absent from every navigation). It signs in with Supabase Auth and is limited to rows in `admin_users`; the database RLS policies, not the UI, decide what an account may do. From the studio an administrator can:

1. provision a canonical passage - the book/chapter/verse range is validated against `bible_chapters` and the passage key is derived by the database (`ensure_bible_passage`),
2. create a Scripture Work with real artwork uploaded to `scripture-media` (plus an optional poster in `scripture-covers`),
3. publish or return it to draft, and
4. attach downloadable wallpaper renditions from `wallpaper-media`.

A published Scripture Work then appears automatically in the archive, its book page, its passage page, the journey, and - with a published rendition - the wallpaper experience. No public page is edited to publish anything.

## Content Architecture

The two core published work types are:

- Scripture Work: a visualized Bible passage
- Film: a larger cinematic production linked to a Bible passage

The Bible is the structural backbone:

```text
BIBLE BOOK
  -> PASSAGE
      -> SCRIPTURE WORK
      -> FILM
```

Public Scripture reads go through `lib/scripture/queries.ts`. It is the only source of
Scripture content: there is no local JSON work list, no hardcoded book counts, and no
hand-maintained previous/next or related-content mapping. Ordering is always canonical
(book `canonical_order` -> chapter -> verse), never upload, creation, or title order.

Published visibility is enforced by RLS plus an explicit `status = published` filter, so
drafts cannot appear in archive counts, book pages, passage pages, journey, home, or sitemap.

`lib/supabase/public.ts` is a cookie-free anonymous client used for public reads so the
public routes never depend on a user session, and responses are not cached so a newly
published work appears immediately.

`content/bible.ts` is currently an immutable transitional UI fallback for the 66-book structure. It is used only while `bible_books` is unreachable, and it mirrors the seed exactly (book names, slugs, canonical order, chapter counts). Passage counts never fall back to it: they are always derived from published works. The long-term source is Supabase `bible_books` and `bible_chapters`.

### Passage URLs and references

Passage URLs use the canonical passage key with `:` separators expressed as `-`:
`john:1:1-9` is published at `/scripture/john/1-1-9`. Lookups match the canonical
segment of each published work, so no passage relationship is stored by hand and
`/scripture/john/1:1-9` resolves to the same page. Every human-readable reference
(`John 1:1–9`, `Genesis 1:1–2:3`, `John 1:5`, `Genesis 1`) is derived by
`lib/bible/reference.ts` from the stored passage coordinates, never assembled inside a page.

## Supabase Infrastructure

Supabase migrations and structural seed files are in `supabase/`. The local clients are in `lib/supabase/`.

The migration defines:

- `bible_books`
- `bible_chapters`
- `bible_passages`
- `admin_users`
- `scripture_works`
- `films`
- validation triggers, indexes, RLS, and private Storage buckets

The structural seed contains 66 books, 1,189 chapters, and the 66 canonical book slugs used by the public routes, using the Free.Bible WEB coordinate reference. It does not import Bible text. A translation and license decision is required before importing full Scripture text.

Scripture text and audio ship as contracts with no placeholder content: `lib/bible/text.ts` (READ) and `lib/scripture/audio.ts` (LISTEN). Each registers a licensed provider once available; until then the public experience renders an explicit unavailable state rather than invented Scripture or unlicensed audio.

The service secret is server-only and must never be committed or imported by Client Components. `.env.local` is ignored by Git.

A second migration, `20260919000200_holy8bit_publishing.sql`, adds what the public pages need in order to be reachable with real content: the `ensure_bible_passage` function (the only supported way to create a passage, so a canonical key is never written by hand), the `scripture_wallpapers` table with its publication guard and RLS, and the private `wallpaper-media` bucket.

### Current publishing state

`supabase db push` has not been run against the configured development project yet: it reports every table missing (`PGRST205`) and lists no storage buckets, so the public Scripture routes fall back to the structural 66-book index and no passage page can resolve. Applying the two migrations and the structural seed is the single step that turns the empty archive into the real one; nothing in the app needs to change for that.

## Wallpapers

A wallpaper is never its own content model. `scripture_wallpapers` rows point at a Scripture Work, so a rendition inherits the passage, the canonical order, and the visibility of the work it renders; the database refuses to publish a wallpaper whose work is still a draft (`validate_wallpaper_publication`). Media lives in the private `wallpaper-media` bucket and is delivered only through short-lived server-signed URLs.

- `/wallpapers` lists published renditions grouped by the work they render, in canonical Bible order. It deliberately loads no artwork, so the index stays light and reads as an archive rather than an image gallery.
- `/wallpapers/download/[rendition]` re-checks the published state on every request and redirects to a freshly signed URL with a download disposition, so no long-lived media URL is ever exposed or cached.
- The passage page ends with the WALLPAPER section, where the artwork a visitor is already looking at can be taken away in the rendition that fits their screen. This does not disturb the approved mobile order above.

Wallpapers are optional: with none published, the passage page and the archive render nothing extra rather than an empty shell.

## Films

Film content is currently represented locally in `content/films.ts` until Supabase publishing is available. The existing Genesis preview is preserved at:

```text
public/films/genesis/in-the-beginning/in-the-beginning-preview.mp4
```

Its canonical public route is `/films/in-the-beginning`. The old nested Genesis URLs redirect for compatibility. The preview has not been migrated or marked as published in Supabase.

## Artwork

`components/Artwork.tsx` supports optimized `next/image` assets, responsive sizing, aspect-ratio containers, and focal positioning. Final artwork can replace temporary placeholders without changing the approved visual system.

## Legacy Migration Notes

The former Stories, Gallery, and Wallpapers implementations were presentational/static foundation content, not canonical database content, and they stay removed. Wallpapers returned in this phase as a real content type: renditions attached to published Scripture Works, never a standalone gallery. Existing local media is preserved; ambiguous legacy works still require an explicit Scripture Work decision before migration.
