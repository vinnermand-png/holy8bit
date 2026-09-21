import "server-only";
import { createSupabaseServerClient } from "../supabase/server";
import type { BibleBook } from "../../content/bible";
import { getBibleBooks, type PassageRecord } from "../scripture/queries";

export type AdminIdentity = {
  userId: string;
  email: string | null;
  role: "owner" | "admin";
};

export type AdminAccess =
  | { status: "admin"; identity: AdminIdentity }
  | { status: "signed-out" }
  | { status: "refused"; email: string | null }
  | { status: "unavailable" };

/**
 * Resolves the studio identity. Access is not decided here - the `admin_users` row and
 * the database RLS policies are the authority; this only reports what they already allow.
 */
export async function getAdminAccess(): Promise<AdminAccess> {
  try {
    const supabase = createSupabaseServerClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) return { status: "signed-out" };

    const { data: adminRow, error: adminError } = await supabase
      .from("admin_users")
      .select("role, is_active")
      .eq("user_id", userData.user.id)
      .maybeSingle();

    if (adminError) return { status: "unavailable" };
    if (!adminRow || !adminRow.is_active) return { status: "refused", email: userData.user.email ?? null };

    return {
      status: "admin",
      identity: { userId: userData.user.id, email: userData.user.email ?? null, role: adminRow.role }
    };
  } catch {
    return { status: "unavailable" };
  }
}

export type StudioWork = {
  id: string;
  title: string;
  passageKey: string;
  bookName: string;
  bookSlug: string;
  mediaType: "video" | "image" | "gif";
  mediaPath: string;
  coverPath: string | null;
  mediaPreviewUrl: string | null;
  coverPreviewUrl: string | null;
  status: "draft" | "published";
  publishedAt: string | null;
  description: string | null;
  passage: PassageRecord;
  wallpaperCount: number;
};

export type StudioWallpaper = {
  id: string;
  workId: string;
  label: string;
  widthPx: number;
  heightPx: number;
  storagePath: string;
  status: "draft" | "published";
};

export type StudioData = {
  books: BibleBook[];
  works: StudioWork[];
  wallpapers: StudioWallpaper[];
};

/** Studio reads run as the signed-in admin, so RLS - not this code - decides what is visible. */
export async function getStudioData(): Promise<StudioData> {
  const books = await getBibleBooks();
  const supabase = createSupabaseServerClient();

  const [worksResult, passagesResult, wallpapersResult] = await Promise.all([
    supabase.from("scripture_works").select("id, passage_key, title, description, cover_path, media_path, media_type, status, published_at").order("created_at", { ascending: false }),
    supabase.from("bible_passages").select("passage_key, book_id, chapter_start, verse_start, chapter_end, verse_end, whole_chapter"),
    supabase.from("scripture_wallpapers").select("id, work_id, label, width_px, height_px, storage_path, status, sort_order")
  ]);

  const bookMap = new Map(books.map((book) => [book.id, book]));
  const passageMap = new Map((passagesResult.data ?? []).map((passage) => [passage.passage_key, passage as PassageRecord]));
  const wallpapers = (wallpapersResult.data ?? []).map((row) => ({
    id: row.id,
    workId: row.work_id,
    label: row.label,
    widthPx: row.width_px,
    heightPx: row.height_px,
    storagePath: row.storage_path,
    status: row.status
  }));

  // Sign storage URLs for preview
  async function signUrl(bucket: string, path: string | null): Promise<string | null> {
    if (!path) return null;
    if (/^https?:\/\//.test(path)) return path;
    try {
      const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 60 * 60);
      return error ? null : data.signedUrl;
    } catch {
      return null;
    }
  }

  const works = await Promise.all(
    (worksResult.data ?? []).flatMap(async (work): Promise<StudioWork | null> => {
      const passage = passageMap.get(work.passage_key);
      const book = passage ? bookMap.get(passage.book_id) : undefined;
      if (!passage || !book) return null;
      const [mediaPreviewUrl, coverPreviewUrl] = await Promise.all([
        signUrl("scripture-media", work.media_path),
        signUrl("scripture-covers", work.cover_path)
      ]);
      return {
        id: work.id,
        title: work.title,
        passageKey: work.passage_key,
        bookName: book.name,
        bookSlug: book.slug,
        mediaType: work.media_type,
        mediaPath: work.media_path,
        coverPath: work.cover_path,
        mediaPreviewUrl,
        coverPreviewUrl,
        status: work.status,
        publishedAt: work.published_at,
        description: work.description,
        passage,
        wallpaperCount: wallpapers.filter((wallpaper) => wallpaper.workId === work.id).length
      };
    })
  ).then((items) => items.filter((item): item is StudioWork => item !== null));

  return { books, works, wallpapers };
}
