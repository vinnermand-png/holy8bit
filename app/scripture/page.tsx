import type { Metadata } from "next";
import Header from "../../components/Header";
import ScriptureBookList from "../../components/ScriptureBookList";
import SiteFooter from "../../components/SiteFooter";
import { getScriptureArchive } from "../../lib/scripture/queries";

export const metadata: Metadata = {
  title: "The Scripture Archive",
  description:
    "Explore the 66 books of the Bible and the Scripture passages visualized by HOLY8BIT in cinematic pixel art.",
  alternates: { canonical: "/scripture" }
};

type Props = { searchParams?: { q?: string | string[] } };

export default async function ScriptureArchivePage({ searchParams }: Props) {
  const archive = await getScriptureArchive();
  const rawQuery = searchParams?.q;
  const query = (Array.isArray(rawQuery) ? rawQuery[0] : rawQuery ?? "").trim();
  const needle = query.toLowerCase();
  // The header search filters the canonical 66-book structure; it never invents books.
  const visibleBooks = needle
    ? archive.books.filter(
        (book) => book.name.toLowerCase().includes(needle) || book.slug.replaceAll("-", " ").includes(needle)
      )
    : archive.books;
  const oldTestament = visibleBooks.filter((book) => book.testament === "old");
  const newTestament = visibleBooks.filter((book) => book.testament === "new");
  const passageLabel = archive.visualizedPassages === 1 ? "VISUALIZED PASSAGE" : "VISUALIZED PASSAGES";

  return (
    <div className="foundation-page scripture-archive-page">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <Header />
      <main id="main-content" className="archive-main">
        <section className="archive-hero" aria-labelledby="archive-title">
          <div className="wrap archive-hero-inner">
            <p className="eyebrow">HOLY8BIT · SCRIPTURE</p>
            <h1 className="scripture-display-title" id="archive-title">
              The Scripture Archive
            </h1>
            <p className="foundation-copy">
              The Bible is the structure. HOLY8BIT visualizes its passages one work at a time, and the archive places
              every published work where the Bible says it belongs.
            </p>
            <p className="archive-summary">
              {archive.books.length} BOOKS · {archive.visualizedPassages} {passageLabel}
            </p>
            {needle && (
              <p className="archive-search-note">
                <span>
                  SEARCH “{query}” · {visibleBooks.length} {visibleBooks.length === 1 ? "BOOK" : "BOOKS"}
                </span>
                <a className="text-link" href="/scripture">
                  CLEAR SEARCH
                </a>
              </p>
            )}
            {archive.dataSource !== "supabase" && (
              <p className="archive-source-note">
                PUBLISHING SOURCE NOT YET CONNECTED · CANONICAL BIBLE STRUCTURE ONLY · NO DRAFT WORK IS EVER SHOWN
              </p>
            )}
            <div className="archive-hero-actions">
              <a className="text-link" href="/scripture/journey">
                JOURNEY THROUGH SCRIPTURE <span aria-hidden="true">→</span>
              </a>
              <a className="text-link" href="/wallpapers">
                WALLPAPERS <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </section>
        <div className="wrap scripture-archive-inner">
          {visibleBooks.length === 0 && (
            <div className="archive-empty-note">
              <p>No book in the archive matches “{query}”.</p>
              <p>The archive always holds all 66 books; search matches Bible book names only.</p>
            </div>
          )}
          {oldTestament.length > 0 && (
            <section className="bible-testament" aria-labelledby="old-testament-title">
              <p className="eyebrow">OLD TESTAMENT · {oldTestament.length} BOOKS</p>
              <h2 className="scripture-display-title" id="old-testament-title">
                The First Covenant
              </h2>
              <ScriptureBookList books={oldTestament} />
            </section>
          )}
          {newTestament.length > 0 && (
            <section className="bible-testament" aria-labelledby="new-testament-title">
              <p className="eyebrow">NEW TESTAMENT · {newTestament.length} BOOKS</p>
              <h2 className="scripture-display-title" id="new-testament-title">
                The New Covenant
              </h2>
              <ScriptureBookList books={newTestament} />
            </section>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
