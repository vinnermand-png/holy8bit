"use client";

import { useState } from "react";
import MediaUploader from "./MediaUploader";
import { createScriptureWork, updateScriptureWork } from "../../app/admin/actions";

type BookOption = { id: number; name: string; slug: string; testament: string; chapterCount: number };

type WorkData = {
  id: string;
  title: string;
  passageKey: string;
  bookSlug: string;
  passage: {
    chapter_start: number;
    verse_start: number | null;
    chapter_end: number;
    verse_end: number | null;
    whole_chapter: boolean;
  };
  description: string | null;
  mediaType: string;
  mediaPath: string;
  coverPath: string | null;
  mediaPreviewUrl: string | null;
  coverPreviewUrl: string | null;
  status: string;
};

function refPreview(bookSlug: string, chapter: string, verseStart: string, verseEnd: string): string {
  const bookName = bookSlug.charAt(0).toUpperCase() + bookSlug.slice(1);
  if (!chapter) return "";
  if (!verseStart) return `${bookName} ${chapter}`;
  if (!verseEnd || verseStart === verseEnd) return `${bookName} ${chapter}:${verseStart}`;
  return `${bookName} ${chapter}:${verseStart}–${verseEnd}`;
}

export default function WorkForm({
  books,
  work,
  accessToken,
}: {
  books: BookOption[];
  work?: WorkData;
  accessToken?: string | null;
}) {
  const isEdit = !!work;

  const [bookSlug, setBookSlug] = useState(work?.bookSlug || "john");
  const [chapter, setChapter] = useState(String(work?.passage.chapter_start || ""));
  const [verseStart, setVerseStart] = useState(String(work?.passage.verse_start || ""));
  const [verseEnd, setVerseEnd] = useState(String(work?.passage.verse_end || ""));
  const [mediaType, setMediaType] = useState(work?.mediaType || "image");
  const [mediaPath, setMediaPath] = useState(work?.mediaPath || "");
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState(work?.mediaPreviewUrl || "");
  const [coverPath, setCoverPath] = useState(work?.coverPath || "");
  const [coverPreviewUrl, setCoverPreviewUrl] = useState(work?.coverPreviewUrl || "");
  const [wholeChapter, setWholeChapter] = useState(work?.passage.whole_chapter || false);
  const [publish, setPublish] = useState(work?.status === "published");

  const reference = refPreview(bookSlug, chapter, verseStart, verseEnd);

  function acceptForType(): string {
    if (mediaType === "video") return "video/mp4,video/webm,video/quicktime";
    if (mediaType === "gif") return "image/gif";
    return "image/png,image/jpeg,image/webp";
  }

  function storagePathForUpload(): string {
    const passagePart = `${bookSlug}-${chapter}-${verseStart || "0"}-${verseEnd || "0"}`;
    return `works/${passagePart}`;
  }

  return (
    <form className="studio-form" action={isEdit ? updateScriptureWork : createScriptureWork}>
      {isEdit && <input type="hidden" name="work_id" value={work.id} />}

      {/* Reference preview */}
      {reference && (
        <div className="studio-ref-preview">
          <span className="eyebrow">PREVIEW</span>
          <p className="studio-ref-text">{reference}</p>
        </div>
      )}

      <div className="studio-grid">
        <label className="studio-field">
          <span className="eyebrow">BOOK *</span>
          <select name="book_slug" value={bookSlug} onChange={(e) => setBookSlug(e.target.value)} required>
            {books.map((b) => (
              <option key={b.slug} value={b.slug}>{b.name}</option>
            ))}
          </select>
        </label>
        <label className="studio-field">
          <span className="eyebrow">CHAPTER *</span>
          <input name="chapter_start" type="number" min={1} value={chapter} onChange={(e) => setChapter(e.target.value)} required />
        </label>
        <label className="studio-field">
          <span className="eyebrow">VERSE START</span>
          <input name="verse_start" type="number" min={1} value={verseStart} onChange={(e) => setVerseStart(e.target.value)} />
        </label>
        <label className="studio-field">
          <span className="eyebrow">VERSE END</span>
          <input name="verse_end" type="number" min={1} value={verseEnd} onChange={(e) => setVerseEnd(e.target.value)} />
        </label>
      </div>

      <label className="studio-check">
        <input name="whole_chapter" type="checkbox" checked={wholeChapter} onChange={(e) => setWholeChapter(e.target.checked)} />
        <span>WHOLE CHAPTER</span>
      </label>

      <label className="studio-field">
        <span className="eyebrow">TITLE *</span>
        <input name="title" type="text" maxLength={200} defaultValue={work?.title || ""} required />
      </label>

      <label className="studio-field">
        <span className="eyebrow">DESCRIPTION</span>
        <textarea name="description" rows={3} maxLength={600} defaultValue={work?.description || ""} />
      </label>

      <div className="studio-grid">
        <label className="studio-field">
          <span className="eyebrow">MEDIA TYPE *</span>
          <select name="media_type" value={mediaType} onChange={(e) => setMediaType(e.target.value)}>
            <option value="image">IMAGE</option>
            <option value="gif">GIF</option>
            <option value="video">VIDEO</option>
          </select>
        </label>
        <label className="studio-field">
          <span className="eyebrow">INTERNAL REF</span>
          <input name="internal_production_ref" type="text" maxLength={80} defaultValue="" />
        </label>
      </div>

      {/* Media upload — replaces manual path entry */}
      <MediaUploader
        bucket="scripture-media"
        accept={acceptForType()}
        label={`ARTWORK / ${mediaType.toUpperCase()} *`}
        currentPath={mediaPath || null}
        currentPreview={mediaPreviewUrl || null}
        uploadPrefix={storagePathForUpload()}
        accessToken={accessToken}
        onUploaded={(path, previewUrl) => {
          setMediaPath(path);
          setMediaPreviewUrl(previewUrl);
        }}
        onRemove={() => {
          setMediaPath("");
          setMediaPreviewUrl("");
        }}
      />
      <input type="hidden" name="media_path" value={mediaPath} />

      {/* Cover upload — replaces manual path entry */}
      <MediaUploader
        bucket="scripture-covers"
        accept="image/png,image/jpeg,image/webp"
        label="COVER ARTWORK (optional)"
        currentPath={coverPath || null}
        currentPreview={coverPreviewUrl || null}
        uploadPrefix={`covers/${bookSlug}-${chapter || "0"}-${verseStart || "0"}-${verseEnd || "0"}`}
        accessToken={accessToken}
        onUploaded={(path, previewUrl) => {
          setCoverPath(path);
          setCoverPreviewUrl(previewUrl);
        }}
        onRemove={() => {
          setCoverPath("");
          setCoverPreviewUrl("");
        }}
      />
      <input type="hidden" name="cover_path" value={coverPath} />

      <label className="studio-check">
        <input name="status" type="checkbox" checked={publish} onChange={(e) => setPublish(e.target.checked)} />
        <span>PUBLISH</span>
      </label>

      <div className="studio-form-actions">
        <button className="button" type="submit" disabled={!mediaPath && !isEdit}>
          {isEdit ? "UPDATE SCRIPTURE" : "SAVE SCRIPTURE WORK"}
        </button>
        {isEdit && (
          <a className="text-link" href={`/scripture/${work.bookSlug}/${work.passageKey.replace(/:/g, "-")}`} target="_blank" rel="noreferrer">
            VIEW PUBLIC PAGE →
          </a>
        )}
      </div>

      {!isEdit && !mediaPath && (
        <p className="studio-help">Upload artwork to save. The file uploads directly to Supabase — no size limit.</p>
      )}
    </form>
  );
}
