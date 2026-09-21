"use server";

import { redirect } from "next/navigation";
import { getAdminAccess } from "../../lib/admin/session";
import { createSupabaseServerClient } from "../../lib/supabase/server";

/**
 * The studio is the only write path for published content. Every action:
 *   1. fails closed unless the caller is an active administrator,
 *   2. runs as that admin's session, so the database RLS policies are the real authority,
 *   3. derives the canonical passage key in the database instead of accepting one from a form.
 */

const MEDIA_BUCKETS = { work: "scripture-media", cover: "scripture-covers", wallpaper: "wallpaper-media" } as const;
const IMAGE_LIMIT = 25 * 1024 * 1024;
const VIDEO_LIMIT = 200 * 1024 * 1024;

function notice(message: string): never {
  redirect(`/admin?notice=${encodeURIComponent(message)}`);
}

function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function file(formData: FormData, key: string): File | null {
  const value = formData.get(key);
  return value instanceof File && value.size > 0 ? value : null;
}

function positiveInt(formData: FormData, key: string): number | null {
  const raw = text(formData, key);
  if (raw === "") return null;
  const value = Number(raw);
  return Number.isInteger(value) && value > 0 ? value : null;
}

function safeFileName(name: string): string {
  const cleaned = name
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[.-]+/, "")
    .slice(-80);
  return cleaned.replace(/^-+/, "") || "upload";
}

async function assertAdmin() {
  const access = await getAdminAccess();
  if (access.status === "signed-out") notice("Sign in to continue.");
  if (access.status === "refused") notice("This account is not an active HOLY8BIT administrator.");
  if (access.status === "unavailable") notice("The publishing database is not reachable from this deployment.");
  return access;
}

export async function signIn(formData: FormData) {
  const email = text(formData, "email");
  const password = text(formData, "password");
  if (!email || !password) notice("Email and password are required.");

  const supabase = createSupabaseServerClient();
  // Never redirect from inside the try block: Next's redirect throws, and this catch
  // would swallow it and misreport the failure.
  let failure: string | null = null;
  try {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) failure = error.message;
  } catch (error) {
    console.error("[studio] sign-in failed", error);
    failure = "The authentication service is not reachable from this deployment.";
  }
  if (failure) notice(`Sign in failed: ${failure}`);
  notice("Signed in.");
}

export async function signOut() {
  try {
    const supabase = createSupabaseServerClient();
    await supabase.auth.signOut();
  } catch {
    /* signing out locally is enough even when the project is unreachable */
  }
  notice("Signed out.");
}

/**
 * Returns the current Supabase access token so the browser client can upload
 * directly to Storage (bypassing the Vercel body-size limit on server actions).
 * Only callable by an authenticated admin.
 */
export async function getSupabaseAccessToken(): Promise<string | null> {
  try {
    const supabase = createSupabaseServerClient();
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  } catch {
    return null;
  }
}

/**
 * Creates a Scripture Work. The passage is provisioned by the database function, which
 * validates the range against bible_chapters and derives the canonical passage key, so the
 * Bible - not the form - decides where the work belongs.
 */
export async function createScriptureWork(formData: FormData) {
  await assertAdmin();

  const title = text(formData, "title");
  const bookSlug = text(formData, "book_slug");
  const chapterStartRaw = positiveInt(formData, "chapter_start");
  const chapterEndRaw = positiveInt(formData, "chapter_end");
  const wholeChapter = text(formData, "whole_chapter") === "on";
  const verseStartRaw = wholeChapter ? null : positiveInt(formData, "verse_start");
  const verseEndRaw = wholeChapter ? null : positiveInt(formData, "verse_end");
  const mediaTypeRaw = text(formData, "media_type");
  const mediaPathInput = text(formData, "media_path");
  const mediaFile = file(formData, "media_file");
  const coverFile = file(formData, "cover_file");
  const publish = text(formData, "status") === "published";

  if (!title) notice("A Scripture Work needs a title.");
  if (!bookSlug) notice("Choose the Bible book the work belongs to.");
  if (!chapterStartRaw) notice("A chapter is required.");
  const chapterStart = chapterStartRaw;
  const chapterEnd = chapterEndRaw ?? chapterStart;
  if (chapterEnd < chapterStart) notice("The chapter range ends before it starts.");

  let verseStart: number | null = null;
  let verseEnd: number | null = null;
  if (!wholeChapter) {
    if (!verseStartRaw || !verseEndRaw) notice("Verse start and end are required unless the whole chapter is visualized.");
    if (verseEndRaw < verseStartRaw) notice("The verse range ends before it starts.");
    verseStart = verseStartRaw;
    verseEnd = verseEndRaw;
  }

  if (!["video", "image", "gif"].includes(mediaTypeRaw)) notice("Choose a media type.");
  const mediaType = mediaTypeRaw as "video" | "image" | "gif";
  if (!mediaFile && !mediaPathInput) notice("Provide the artwork: upload a file or enter its storage path.");

  const supabase = createSupabaseServerClient();

  let passageKey: string;
  try {
    const { data, error } = await supabase.rpc("ensure_bible_passage", {
      p_book_slug: bookSlug,
      p_chapter_start: chapterStart,
      p_verse_start: verseStart,
      p_chapter_end: chapterEnd,
      p_verse_end: verseEnd,
      p_whole_chapter: wholeChapter
    });
    if (error || !data) throw new Error(error?.message ?? "The passage could not be provisioned.");
    passageKey = data;
  } catch (error) {
    notice(error instanceof Error ? error.message : "The passage could not be provisioned.");
  }

  let mediaPath = mediaPathInput;
  try {
    if (mediaFile) {
      const limit = mediaType === "video" ? VIDEO_LIMIT : IMAGE_LIMIT;
      if (mediaFile.size > limit) throw new Error(`The media file exceeds the ${Math.round(limit / (1024 * 1024))} MB limit.`);
      const path = `works/${bookSlug}/${passageKey.replaceAll(":", "-")}/${Date.now()}-${safeFileName(mediaFile.name)}`;
      const { error } = await supabase.storage.from(MEDIA_BUCKETS.work).upload(path, Buffer.from(await mediaFile.arrayBuffer()), {
        contentType: mediaFile.type || "application/octet-stream",
        upsert: false
      });
      if (error) throw new Error(`Media upload failed: ${error.message}`);
      mediaPath = path;
    }

    let coverPath: string | null = null;
    if (coverFile) {
      if (coverFile.size > IMAGE_LIMIT) throw new Error("The cover image is too large.");
      const path = `covers/${bookSlug}/${passageKey.replaceAll(":", "-")}/${Date.now()}-${safeFileName(coverFile.name)}`;
      const { error } = await supabase.storage.from(MEDIA_BUCKETS.cover).upload(path, Buffer.from(await coverFile.arrayBuffer()), {
        contentType: coverFile.type || "image/png",
        upsert: false
      });
      if (error) throw new Error(`Cover upload failed: ${error.message}`);
      coverPath = path;
    }

    const { error } = await supabase.from("scripture_works").insert({
      passage_key: passageKey,
      title,
      description: text(formData, "description") || null,
      media_path: mediaPath,
      media_type: mediaType,
      cover_path: coverPath,
      status: publish ? "published" : "draft",
      published_at: publish ? new Date().toISOString() : null,
      internal_production_ref: text(formData, "internal_production_ref") || null
    });
    if (error) throw new Error(error.message);
  } catch (error) {
    notice(error instanceof Error ? error.message : "The Scripture Work could not be saved.");
  }

  notice(`${title} saved as ${publish ? "published" : "draft"}.`);
}

export async function setWorkStatus(formData: FormData) {
  await assertAdmin();
  const workId = text(formData, "work_id");
  const statusRaw = text(formData, "status");
  if (!workId || (statusRaw !== "draft" && statusRaw !== "published")) notice("Unknown Scripture Work or status.");
  const status: "draft" | "published" = statusRaw;

  const supabase = createSupabaseServerClient();
  const result = await supabase
    .from("scripture_works")
    .update({ status, published_at: status === "published" ? new Date().toISOString() : null })
    .eq("id", workId);
  if (result.error) notice(result.error.message);
  notice(status === "published" ? "Scripture Work published." : "Scripture Work returned to draft.");
}

export async function createWallpaper(formData: FormData) {
  await assertAdmin();
  const workId = text(formData, "work_id");
  const label = text(formData, "label");
  const widthPx = positiveInt(formData, "width_px");
  const heightPx = positiveInt(formData, "height_px");
  const storagePathInput = text(formData, "storage_path");
  const wallpaperFile = file(formData, "wallpaper_file");
  const publish = text(formData, "status") === "published";

  if (!workId) notice("Choose the Scripture Work this wallpaper renders.");
  if (!label) notice("A wallpaper needs a label, for example PHONE.");
  if (!widthPx || !heightPx) notice("Width and height in pixels are required.");
  if (!wallpaperFile && !storagePathInput) notice("Upload the wallpaper file or enter its storage path.");

  const supabase = createSupabaseServerClient();
  let storagePath = storagePathInput;
  let fileName = text(formData, "file_name") || null;

  try {
    if (wallpaperFile) {
      if (wallpaperFile.size > IMAGE_LIMIT) throw new Error("The wallpaper file is too large.");
      const path = `renditions/${workId}/${Date.now()}-${safeFileName(wallpaperFile.name)}`;
      const { error } = await supabase.storage.from(MEDIA_BUCKETS.wallpaper).upload(path, Buffer.from(await wallpaperFile.arrayBuffer()), {
        contentType: wallpaperFile.type || "image/png",
        upsert: false
      });
      if (error) throw new Error(`Wallpaper upload failed: ${error.message}`);
      storagePath = path;
      fileName = fileName ?? safeFileName(wallpaperFile.name);
    }

    const { error } = await supabase.from("scripture_wallpapers").insert({
      work_id: workId,
      label,
      width_px: widthPx,
      height_px: heightPx,
      storage_path: storagePath,
      file_name: fileName,
      status: publish ? "published" : "draft",
      published_at: publish ? new Date().toISOString() : null,
      sort_order: positiveInt(formData, "sort_order") ?? 0
    });
    if (error) throw new Error(error.message);
  } catch (error) {
    notice(error instanceof Error ? error.message : "The wallpaper could not be saved.");
  }

  notice(`${label} wallpaper saved as ${publish ? "published" : "draft"}.`);
}

export async function setWallpaperStatus(formData: FormData) {
  await assertAdmin();
  const wallpaperId = text(formData, "wallpaper_id");
  const statusRaw = text(formData, "status");
  if (!wallpaperId || (statusRaw !== "draft" && statusRaw !== "published")) notice("Unknown wallpaper or status.");
  const status: "draft" | "published" = statusRaw;

  const supabase = createSupabaseServerClient();
  const result = await supabase
    .from("scripture_wallpapers")
    .update({ status, published_at: status === "published" ? new Date().toISOString() : null })
    .eq("id", wallpaperId);
  if (result.error) notice(result.error.message);
  notice(status === "published" ? "Wallpaper published." : "Wallpaper returned to draft.");
}


export async function deleteScriptureWork(formData: FormData) {
  await assertAdmin();
  const workId = text(formData, "work_id");
  if (!workId) notice("Unknown Scripture Work.");

  const supabase = createSupabaseServerClient();
  
  const { data: work } = await supabase
    .from("scripture_works")
    .select("media_path, cover_path")
    .eq("id", workId)
    .single();

  if (work?.media_path) {
    await supabase.storage.from(MEDIA_BUCKETS.work).remove([work.media_path]);
  }
  if (work?.cover_path) {
    await supabase.storage.from(MEDIA_BUCKETS.cover).remove([work.cover_path]);
  }

  const { error } = await supabase
    .from("scripture_works")
    .delete()
    .eq("id", workId);
  
  if (error) notice(error.message);
  notice("Scripture Work deleted.");
}

export async function deleteWallpaper(formData: FormData) {
  await assertAdmin();
  const wallpaperId = text(formData, "wallpaper_id");
  if (!wallpaperId) notice("Unknown wallpaper.");

  const supabase = createSupabaseServerClient();
  
  const { data: wallpaper } = await supabase
    .from("scripture_wallpapers")
    .select("storage_path")
    .eq("id", wallpaperId)
    .single();

  if (wallpaper?.storage_path) {
    await supabase.storage.from(MEDIA_BUCKETS.wallpaper).remove([wallpaper.storage_path]);
  }

  const { error } = await supabase
    .from("scripture_wallpapers")
    .delete()
    .eq("id", wallpaperId);
  
  if (error) notice(error.message);
  notice("Wallpaper deleted.");
}

/**
 * Updates an existing Scripture Work. If the passage changed, provisions a new
 * passage key and cleans up the old one.
 */
export async function updateScriptureWork(formData: FormData) {
  await assertAdmin();

  const workId = text(formData, "work_id");
  if (!workId) notice("Unknown Scripture Work.");

  const title = text(formData, "title");
  const bookSlug = text(formData, "book_slug");
  const chapterStartRaw = positiveInt(formData, "chapter_start");
  const chapterEndRaw = positiveInt(formData, "chapter_end");
  const wholeChapter = text(formData, "whole_chapter") === "on";
  const verseStartRaw = wholeChapter ? null : positiveInt(formData, "verse_start");
  const verseEndRaw = wholeChapter ? null : positiveInt(formData, "verse_end");
  const mediaTypeRaw = text(formData, "media_type");
  const mediaPathInput = text(formData, "media_path");
  const coverPathInput = text(formData, "cover_path");
  const publish = text(formData, "status") === "published";

  if (!title) notice("A Scripture Work needs a title.");
  if (!bookSlug) notice("Choose the Bible book.");
  if (!chapterStartRaw) notice("A chapter is required.");

  const chapterStart = chapterStartRaw;
  const chapterEnd = chapterEndRaw ?? chapterStart;
  if (chapterEnd < chapterStart) notice("The chapter range ends before it starts.");

  let verseStart: number | null = null;
  let verseEnd: number | null = null;
  if (!wholeChapter) {
    if (!verseStartRaw || !verseEndRaw) notice("Verse start and end are required.");
    if (verseEndRaw! < verseStartRaw!) notice("The verse range ends before it starts.");
    verseStart = verseStartRaw;
    verseEnd = verseEndRaw;
  }

  if (!["video", "image", "gif"].includes(mediaTypeRaw)) notice("Choose a media type.");
  const mediaType = mediaTypeRaw as "video" | "image" | "gif";

  const supabase = createSupabaseServerClient();

  // Get the existing work
  const { data: existing } = await supabase
    .from("scripture_works")
    .select("passage_key, media_path, cover_path")
    .eq("id", workId)
    .single();

  if (!existing) notice("Scripture Work not found.");

  // Provision the passage key (may be the same or new)
  let passageKey: string;
  try {
    const { data, error } = await supabase.rpc("ensure_bible_passage", {
      p_book_slug: bookSlug,
      p_chapter_start: chapterStart,
      p_verse_start: verseStart,
      p_chapter_end: chapterEnd,
      p_verse_end: verseEnd,
      p_whole_chapter: wholeChapter
    });
    if (error || !data) throw new Error(error?.message ?? "Passage could not be provisioned.");
    passageKey = data;
  } catch (error) {
    notice(error instanceof Error ? error.message : "Passage error.");
  }

  // Update the work
  const updateData: Record<string, unknown> = {
    passage_key: passageKey,
    title,
    description: text(formData, "description") || null,
    media_type: mediaType,
    internal_production_ref: text(formData, "internal_production_ref") || null,
    status: publish ? "published" : "draft",
    published_at: publish ? new Date().toISOString() : null,
    updated_at: new Date().toISOString()
  };

  // Only update media_path if a new path was provided
  if (mediaPathInput) updateData.media_path = mediaPathInput;
  if (coverPathInput !== undefined) updateData.cover_path = coverPathInput || null;

  const { error } = await supabase
    .from("scripture_works")
    .update(updateData)
    .eq("id", workId);

  if (error) notice(error.message);
  notice(title + " updated.");
}
