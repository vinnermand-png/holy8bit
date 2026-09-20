import { mkdir, writeFile } from "node:fs/promises";

const sourceBase = "https://free.bible/bible";
const booksUrl = `${sourceBase}/books.json`;
const nameOverrides = new Map([["Song of Solomon", "Song of Songs"]]);

const sql = (value) => `'${String(value).replaceAll("'", "''")}'`;

// Slugs are derived from the canonical display name so the public route segments
// stay identical to the structural index used by the public app.
const slugify = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const response = await fetch(booksUrl);
if (!response.ok) throw new Error(`Unable to fetch ${booksUrl}: ${response.status}`);
const source = await response.json();
const books = source.books.filter((book) => book.order <= 66).sort((a, b) => a.order - b.order);

if (books.length !== 66) throw new Error(`Expected 66 books, received ${books.length}`);

const bookRows = books.map((book) => {
  const name = nameOverrides.get(book.names.en.name) || book.names.en.name;
  const testament = book.order <= 39 ? "old" : "new";
  return `(${book.order}, ${sql(name)}, ${sql(slugify(name))}, ${sql(testament)}, ${book.order}, ${book.chapters})`;
});

if (new Set(books.map((book) => slugify(nameOverrides.get(book.names.en.name) || book.names.en.name))).size !== 66) {
  throw new Error("Expected 66 unique book slugs");
}

const chapterRows = [];
for (const book of books) {
  for (let chapter = 1; chapter <= book.chapters; chapter += 1) {
    const chapterUrl = `${sourceBase}/web/${book.id}/${chapter}.json`;
    const chapterResponse = await fetch(chapterUrl);
    if (!chapterResponse.ok) throw new Error(`Unable to fetch ${chapterUrl}: ${chapterResponse.status}`);
    const chapterData = await chapterResponse.json();
    const verses = (chapterData.verses || []).map((verse) => Number(verse.v)).filter(Number.isFinite);
    const verseCount = Math.max(...verses);
    if (!verseCount) throw new Error(`No verse coordinates found for ${book.id} ${chapter}`);
    chapterRows.push(`(${book.order}, ${chapter}, ${verseCount})`);
  }
}

const output = `-- Generated from ${booksUrl} and ${sourceBase}/web/{book}/{chapter}.json\n-- Structural reference only; no Scripture text is imported.\n-- Reference edition: Free.Bible WEB coordinate data.\n\nbegin;\n\ninsert into public.bible_books (id, name, slug, testament, canonical_order, chapter_count) values\n${bookRows.join(",\n")}\non conflict (id) do update set name = excluded.name, slug = excluded.slug, testament = excluded.testament, canonical_order = excluded.canonical_order, chapter_count = excluded.chapter_count;\n\ninsert into public.bible_chapters (book_id, chapter_number, verse_count) values\n${chapterRows.join(",\n")}\non conflict (book_id, chapter_number) do update set verse_count = excluded.verse_count;\n\ncommit;\n`;

await mkdir("supabase/seed", { recursive: true });
await writeFile("supabase/seed/bible-reference.sql", output, "utf8");
console.log(`Generated ${books.length} books and ${chapterRows.length} chapters from Free.Bible reference data.`);
