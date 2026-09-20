export type BibleBook = {
  id: number;
  name: string;
  slug: string;
  testament: "old" | "new";
  canonicalOrder: number;
  chapterCount: number;
};

// Transitional immutable UI fallback until public Supabase queries are available.
export const bibleBooks: BibleBook[] = [
  ["Genesis", "genesis", 50], ["Exodus", "exodus", 40], ["Leviticus", "leviticus", 27], ["Numbers", "numbers", 36], ["Deuteronomy", "deuteronomy", 34], ["Joshua", "joshua", 24], ["Judges", "judges", 21], ["Ruth", "ruth", 4], ["1 Samuel", "1-samuel", 31], ["2 Samuel", "2-samuel", 24], ["1 Kings", "1-kings", 22], ["2 Kings", "2-kings", 25], ["1 Chronicles", "1-chronicles", 29], ["2 Chronicles", "2-chronicles", 36], ["Ezra", "ezra", 10], ["Nehemiah", "nehemiah", 13], ["Esther", "esther", 10], ["Job", "job", 42], ["Psalms", "psalms", 150], ["Proverbs", "proverbs", 31], ["Ecclesiastes", "ecclesiastes", 12], ["Song of Songs", "song-of-songs", 8], ["Isaiah", "isaiah", 66], ["Jeremiah", "jeremiah", 52], ["Lamentations", "lamentations", 5], ["Ezekiel", "ezekiel", 48], ["Daniel", "daniel", 12], ["Hosea", "hosea", 14], ["Joel", "joel", 3], ["Amos", "amos", 9], ["Obadiah", "obadiah", 1], ["Jonah", "jonah", 4], ["Micah", "micah", 7], ["Nahum", "nahum", 3], ["Habakkuk", "habakkuk", 3], ["Zephaniah", "zephaniah", 3], ["Haggai", "haggai", 2], ["Zechariah", "zechariah", 14], ["Malachi", "malachi", 4],
  ["Matthew", "matthew", 28], ["Mark", "mark", 16], ["Luke", "luke", 24], ["John", "john", 21], ["Acts", "acts", 28], ["Romans", "romans", 16], ["1 Corinthians", "1-corinthians", 16], ["2 Corinthians", "2-corinthians", 13], ["Galatians", "galatians", 6], ["Ephesians", "ephesians", 6], ["Philippians", "philippians", 4], ["Colossians", "colossians", 4], ["1 Thessalonians", "1-thessalonians", 5], ["2 Thessalonians", "2-thessalonians", 3], ["1 Timothy", "1-timothy", 6], ["2 Timothy", "2-timothy", 4], ["Titus", "titus", 3], ["Philemon", "philemon", 1], ["Hebrews", "hebrews", 13], ["James", "james", 5], ["1 Peter", "1-peter", 5], ["2 Peter", "2-peter", 3], ["1 John", "1-john", 5], ["2 John", "2-john", 1], ["3 John", "3-john", 1], ["Jude", "jude", 1], ["Revelation", "revelation", 22]
].map(([name, slug, chapterCount], index) => ({ id: index + 1, name, slug, testament: index < 39 ? "old" : "new", canonicalOrder: index + 1, chapterCount } as BibleBook));

export function getBibleBook(slug: string) {
  return bibleBooks.find((book) => book.slug === slug);
}
