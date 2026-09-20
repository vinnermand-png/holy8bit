import { cache } from "react";
import { bibleBooks, type BibleBook } from "../../content/bible";
import { normalizePassageSegment, passageSegment, type PassageCoordinates } from "../bible/reference";
import { createSupabaseAdminClient } from "../supabase/admin";
import { createSupabasePublicClient } from "../supabase/public";

export type PassageRecord = PassageCoordinates & {
  passage_key: string;
  book_id: number;
};

export type ScriptureWorkRecord = {
  id: string;
  passageKey: string;
  title: string;
  description: string | null;
  mediaType: "video" | "image" | "gif";
  /** Storage path (or absolute URL) exactly as stored; never signed here. */
  rawMediaPath: string;
  rawCoverPath: string | null;
  book: BibleBook;
  passage: PassageRecord;
};

/** A Scripture Work with public delivery URLs resolved for rendering. */
export type PublicScriptureWork = ScriptureWorkRecord & {
  /** Signed or absolute URL, or "" when media could not be delivered. */
  mediaPath: string;
  coverPath: string | null;
};

export type ScriptureDataSourceState = "supabase" | "unconfigured" | "unavailable";

export type ScriptureArchiveBook = BibleBook & { visualizedPassages: number };

export type ScriptureArchive = {
  books: ScriptureArchiveBook[];
  testamentBookCounts: { old: number; new: number };
  /** Distinct published passages across the whole archive. */
  visualizedPassages: number;
  dataSource: ScriptureDataSourceState;
};

export type BookScripture = {
  book: BibleBook;
  works: PublicScriptureWork[];
  visualizedPassages: number;
};

export type PassageScripture = {
  work: PublicScriptureWork;
  book: BibleBook;
  previous: ScriptureWorkRecord | null;
  next: ScriptureWorkRecord | null;
  related: ScriptureWorkRecord[];
  wallpapers: PublicWallpaper[];
};

/** A downloadable rendition of a published Scripture Work's artwork. */
export type WallpaperRecord = {
  id: string;
  label: string;
  widthPx: number;
  heightPx: number;
  storagePath: string;
  fileName: string | null;
  sortOrder: number;
  publishedAt: string | null;
  work: ScriptureWorkRecord;
};

export type PublicWallpaper = WallpaperRecord & {
  /** Signed preview URL, or null when the rendition cannot be delivered. */
  previewPath: string | null;
};

export type WallpaperArchive = {
  groups: { work: ScriptureWorkRecord; renditions: WallpaperRecord[] }[];
  wallpaperCount: number;
  visualizedPassages: number;
  dataSource: ScriptureDataSourceState;
};

export type ScriptureJourney = {
  works: ScriptureWorkRecord[];
  visualizedPassages: number;
  dataSource: ScriptureDataSourceState;
};

/**
 * Canonical ordering: book canonical order -> chapter -> verse.
 * Never upload, creation, title, or id order.
 */
export function compareScriptureOrder(
  a: { book: Pick<BibleBook, "canonicalOrder">; passage: PassageCoordinates },
  b: { book: Pick<BibleBook, "canonicalOrder">; passage: PassageCoordinates }
): number {
  return (
    a.book.canonicalOrder - b.book.canonicalOrder ||
    a.passage.chapter_start - b.passage.chapter_start ||
    (a.passage.verse_start ?? 0) - (b.passage.verse_start ?? 0) ||
    a.passage.chapter_end - b.passage.chapter_end ||
    (a.passage.verse_end ?? 0) - (b.passage.verse_end ?? 0)
  );
}

function distinctPassages(works: { passageKey: string }[]): number {
  return new Set(works.map((work) => work.passageKey)).size;
}

/**
 * Bible structure. Source of truth is `bible_books` (canonical_order included);
 * the transitional structural index in `content/bible.ts` is used only while the
 * publishing database is unreachable, and only because it carries the same 66-book
 * structure. Passage counts never fall back: they always reflect published works.
 */
export const getBibleBooks = cache(async (): Promise<BibleBook[]> => {
  const supabase = createSupabasePublicClient();
  if (!supabase) return bibleBooks;
  try {
    const { data, error } = await supabase
      .from("bible_books")
      .select("id, name, slug, testament, canonical_order, chapter_count")
      .order("canonical_order", { ascending: true });
    if (error || !data || data.length !== bibleBooks.length) return bibleBooks;
    if (new Set(data.map((book) => book.canonical_order)).size !== bibleBooks.length) return bibleBooks;
    return data
      .map((book) => ({
        id: book.id,
        name: book.name,
        slug: book.slug,
        testament: book.testament,
        canonicalOrder: book.canonical_order,
        chapterCount: book.chapter_count
      }))
      .sort((a, b) => a.canonicalOrder - b.canonicalOrder);
  } catch {
    return bibleBooks;
  }
});

type WallpaperBucket = "scripture-media" | "scripture-covers" | "wallpaper-media";

async function resolveMediaUrl(bucket: WallpaperBucket, path: string): Promise<string | null> {
  if (/^https?:\/\//.test(path)) return path;
  try {
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin.storage.from(bucket).createSignedUrl(path, 60 * 60);
    return error ? null : data.signedUrl;
  } catch {
    return null;
  }
}

type PublishedWorksLoad = { state: ScriptureDataSourceState; works: ScriptureWorkRecord[] };

/** Published Scripture Works only, canonically ordered. Drafts are never returned. */
const loadPublishedWorks = cache(async (): Promise<PublishedWorksLoad> => {
  const supabase = createSupabasePublicClient();
  if (!supabase) return { state: "unconfigured", works: [] };
  try {
    const { data: works, error: worksError } = await supabase
      .from("scripture_works")
      .select("id, passage_key, title, description, media_path, media_type, cover_path")
      .eq("status", "published");
    if (worksError) return { state: "unavailable", works: [] };
    if (!works || works.length === 0) return { state: "supabase", works: [] };

    const { data: passages, error: passagesError } = await supabase
      .from("bible_passages")
      .select("passage_key, book_id, chapter_start, verse_start, chapter_end, verse_end, whole_chapter")
      .in("passage_key", works.map((work) => work.passage_key));
    if (passagesError || !passages || passages.length === 0) return { state: "unavailable", works: [] };

    const books = await getBibleBooks();
    const passageMap = new Map(passages.map((passage) => [passage.passage_key, passage as PassageRecord]));
    const bookMap = new Map(books.map((book) => [book.id, book]));

    const records = works
      .flatMap((work): ScriptureWorkRecord[] => {
        const passage = passageMap.get(work.passage_key);
        const book = passage ? bookMap.get(passage.book_id) : undefined;
        if (!passage || !book) return [];
        return [
          {
            id: work.id,
            passageKey: work.passage_key,
            title: work.title,
            description: work.description,
            mediaType: work.media_type,
            rawMediaPath: work.media_path,
            rawCoverPath: work.cover_path,
            book,
            passage
          }
        ];
      })
      .sort(compareScriptureOrder);

    return { state: "supabase", works: records };
  } catch {
    return { state: "unavailable", works: [] };
  }
});

async function withPublicMedia(work: ScriptureWorkRecord): Promise<PublicScriptureWork> {
  const [mediaPath, coverPath] = await Promise.all([
    resolveMediaUrl("scripture-media", work.rawMediaPath),
    work.rawCoverPath ? resolveMediaUrl("scripture-covers", work.rawCoverPath) : Promise.resolve(null)
  ]);
  return { ...work, mediaPath: mediaPath ?? "", coverPath };
}

/** Resolve delivery URLs for exactly the works a page renders. */
async function withPublicMediaFor(works: ScriptureWorkRecord[]): Promise<PublicScriptureWork[]> {
  return Promise.all(works.map(withPublicMedia));
}

/**
 * Delivery URLs for a single related work. Neighbours and related works come back from the
 * canonical-order query unsigned, so a page maps only the few it actually renders instead of
 * signing the whole archive.
 */
export const resolvePublicWork = cache((work: ScriptureWorkRecord): Promise<PublicScriptureWork> => withPublicMedia(work));

export async function getScriptureDataSourceState(): Promise<ScriptureDataSourceState> {
  return (await loadPublishedWorks()).state;
}

export const getScriptureArchive = cache(async (): Promise<ScriptureArchive> => {
  const [books, load] = await Promise.all([getBibleBooks(), loadPublishedWorks()]);
  const passagesPerBook = new Map<number, Set<string>>();
  for (const work of load.works) {
    const existing = passagesPerBook.get(work.book.id);
    if (existing) existing.add(work.passageKey);
    else passagesPerBook.set(work.book.id, new Set([work.passageKey]));
  }
  return {
    books: books.map((book) => ({ ...book, visualizedPassages: passagesPerBook.get(book.id)?.size ?? 0 })),
    testamentBookCounts: {
      old: books.filter((book) => book.testament === "old").length,
      new: books.filter((book) => book.testament === "new").length
    },
    visualizedPassages: distinctPassages(load.works),
    dataSource: load.state
  };
});

export const getBookScripture = cache(async (bookSlug: string): Promise<BookScripture | null> => {
  const [books, load] = await Promise.all([getBibleBooks(), loadPublishedWorks()]);
  const book = books.find((candidate) => candidate.slug === bookSlug);
  if (!book) return null;
  const bookWorks = load.works.filter((work) => work.book.id === book.id);
  return { book, works: await withPublicMediaFor(bookWorks), visualizedPassages: distinctPassages(bookWorks) };
});

/**
 * Passage lookup for `/scripture/[book]/[passage]`. The URL segment is matched against
 * the canonical segment of each published work, so no passage relationship and no
 * reference string is ever maintained by hand. Neighbors follow canonical Bible order
 * across the whole published archive.
 */
export const getPassageScripture = cache(
  async (bookSlug: string, passage: string): Promise<PassageScripture | null> => {
    const [books, load] = await Promise.all([getBibleBooks(), loadPublishedWorks()]);
    const book = books.find((candidate) => candidate.slug === bookSlug);
    if (!book) return null;

    const requested = normalizePassageSegment(passage);
    const index = load.works.findIndex(
      (work) =>
        work.book.slug === book.slug &&
        normalizePassageSegment(passageSegment(work.passageKey, work.book.slug)) === requested
    );
    if (index === -1) return null;

    const work = load.works[index];
    return {
      work: await withPublicMedia(work),
      book: work.book,
      previous: load.works[index - 1] ?? null,
      next: load.works[index + 1] ?? null,
      related: load.works.filter((candidate) => candidate.book.id === book.id && candidate.id !== work.id),
      wallpapers: await getWorkWallpapers(work.id)
    };
  }
);

/** Journey is a view over published works in canonical order, never its own record set. */
export const getScriptureJourney = cache(async (): Promise<ScriptureJourney> => {
  const load = await loadPublishedWorks();
  return { works: load.works, visualizedPassages: distinctPassages(load.works), dataSource: load.state };
});

/**
 * Published wallpaper renditions, attached to the published works they render.
 * A rendition is public only when both it and its Scripture Work are published;
 * RLS enforces that, and the work lookup below re-checks it in the query layer.
 */
const loadPublishedWallpapers = cache(async (): Promise<{ state: ScriptureDataSourceState; wallpapers: WallpaperRecord[] }> => {
  const supabase = createSupabasePublicClient();
  if (!supabase) return { state: "unconfigured", wallpapers: [] };
  try {
    const { data, error } = await supabase
      .from("scripture_wallpapers")
      .select("id, work_id, label, width_px, height_px, storage_path, file_name, sort_order, published_at")
      .eq("status", "published");
    if (error) return { state: "unavailable", wallpapers: [] };
    if (!data || data.length === 0) return { state: "supabase", wallpapers: [] };

    const load = await loadPublishedWorks();
    const workMap = new Map(load.works.map((work) => [work.id, work]));
    const wallpapers = data
      .flatMap((row): WallpaperRecord[] => {
        const work = workMap.get(row.work_id);
        if (!work) return [];
        return [{
          id: row.id,
          label: row.label,
          widthPx: row.width_px,
          heightPx: row.height_px,
          storagePath: row.storage_path,
          fileName: row.file_name,
          sortOrder: row.sort_order,
          publishedAt: row.published_at,
          work
        }];
      })
      .sort(
        (a, b) =>
          compareScriptureOrder(a.work, b.work) ||
          a.sortOrder - b.sortOrder ||
          b.heightPx - a.heightPx ||
          a.label.localeCompare(b.label)
      );
    return { state: "supabase", wallpapers };
  } catch {
    return { state: "unavailable", wallpapers: [] };
  }
});

/** Renditions for one work with preview URLs resolved. Used on the passage page. */
export const getWorkWallpapers = cache(async (workId: string): Promise<PublicWallpaper[]> => {
  const { wallpapers } = await loadPublishedWallpapers();
  const forWork = wallpapers.filter((wallpaper) => wallpaper.work.id === workId);
  return Promise.all(
    forWork.map(async (wallpaper) => ({
      ...wallpaper,
      previewPath: await resolveMediaUrl("wallpaper-media", wallpaper.storagePath)
    }))
  );
});

/**
 * Wallpaper archive: a view over published renditions, grouped by the work they render
 * and ordered by the Bible. No image delivery happens here - only the passage page and
 * the download route resolve media, so the index stays light.
 */
export const getWallpaperArchive = cache(async (): Promise<WallpaperArchive> => {
  const { state, wallpapers } = await loadPublishedWallpapers();
  const groupMap = new Map<string, { work: ScriptureWorkRecord; renditions: WallpaperRecord[] }>();
  for (const wallpaper of wallpapers) {
    const existing = groupMap.get(wallpaper.work.id);
    if (existing) existing.renditions.push(wallpaper);
    else groupMap.set(wallpaper.work.id, { work: wallpaper.work, renditions: [wallpaper] });
  }
  const groups = Array.from(groupMap.values()).sort((a, b) => compareScriptureOrder(a.work, b.work));
  return {
    groups,
    wallpaperCount: wallpapers.length,
    visualizedPassages: distinctPassages(wallpapers.map((wallpaper) => ({ passageKey: wallpaper.work.passageKey }))),
    dataSource: state
  };
});

/** Published-only lookup for the download route handler (no preview URL needed). */
export const getDownloadableWallpaper = cache(async (id: string): Promise<WallpaperRecord | null> => {
  const { wallpapers } = await loadPublishedWallpapers();
  return wallpapers.find((wallpaper) => wallpaper.id === id) ?? null;
});
