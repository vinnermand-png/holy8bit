import type { BibleBook } from "../../content/bible";

/**
 * Passage coordinates as stored in `bible_passages`. The database trigger already
 * guarantees these coordinates and the canonical `passage_key` agree, so every
 * human-readable reference is derived from the coordinates rather than from string parsing.
 */
export type PassageCoordinates = {
  chapter_start: number;
  verse_start: number | null;
  chapter_end: number;
  verse_end: number | null;
  whole_chapter: boolean;
};

type BookIdentity = Pick<BibleBook, "name" | "slug">;

const GOSPEL_SLUGS = new Set(["matthew", "mark", "luke", "john"]);

/** Canonical display title for a book, e.g. "The Gospel of John". */
export function bookDisplayTitle(book: BookIdentity): string {
  return GOSPEL_SLUGS.has(book.slug) ? `The Gospel of ${book.name}` : book.name;
}

/** Canonical Bible reference, e.g. "John 1:1–9", "John 1:5", "Genesis 1", "Genesis 1:1–2:3". */
export function formatPassageReference(bookName: string, passage: PassageCoordinates): string {
  const { chapter_start, verse_start, chapter_end, verse_end, whole_chapter } = passage;
  if (whole_chapter || verse_start === null || verse_end === null) return `${bookName} ${chapter_start}`;
  if (chapter_start !== chapter_end) return `${bookName} ${chapter_start}:${verse_start}–${chapter_end}:${verse_end}`;
  if (verse_start === verse_end) return `${bookName} ${chapter_start}:${verse_start}`;
  return `${bookName} ${chapter_start}:${verse_start}–${verse_end}`;
}

type WorkIdentity = { book: BookIdentity; passage: PassageCoordinates };

/** Canonical Bible reference for a Scripture Work or Film. */
export function formatWorkReference(work: WorkIdentity): string {
  return formatPassageReference(work.book.name, work.passage);
}

/**
 * Public URL segment for a passage: the canonical passage key minus the book prefix,
 * with ":" separators expressed as "-" so links read `/scripture/john/1-1-9`.
 */
export function passageSegment(passageKey: string, bookSlug: string): string {
  const prefix = `${bookSlug}:`;
  const remainder = passageKey.startsWith(prefix) ? passageKey.slice(prefix.length) : passageKey;
  return remainder.replaceAll(":", "-");
}

/**
 * Tolerant comparison form so `/scripture/john/1-1-9`, `/scripture/john/1:1-9`, and the
 * percent-encoded segment Next.js hands to the route all resolve to the same passage.
 */
export function normalizePassageSegment(segment: string): string {
  let decoded = segment;
  try {
    decoded = decodeURIComponent(segment);
  } catch {
    /* malformed escape: compare the raw segment instead of throwing */
  }
  return decoded.trim().toLowerCase().replaceAll(":", "-").replace(/-+/g, "-").replace(/^-+|-+$/g, "");
}

/** Canonical public path for a Scripture Work. */
export function passagePath(work: { passageKey: string; book: BookIdentity }): string {
  return `/scripture/${work.book.slug}/${passageSegment(work.passageKey, work.book.slug)}`;
}
