import type { ScriptureArchiveBook } from "../lib/scripture/queries";

/**
 * Canonical book index. Order comes from `bible_books.canonical_order`; counts are the
 * number of published Scripture Works in the book. Books without published work stay quiet.
 */
export default function ScriptureBookList({ books }: { books: ScriptureArchiveBook[] }) {
  return (
    <div className="bible-book-list">
      {books.map((book) => {
        const hasWorks = book.visualizedPassages > 0;
        const countLabel = `${book.visualizedPassages} visualized passage${book.visualizedPassages === 1 ? "" : "s"}`;
        return (
          <a
            className={`bible-book-row${hasWorks ? " has-work" : ""}`}
            href={`/scripture/${book.slug}`}
            key={book.slug}
            aria-label={`${book.name} — ${hasWorks ? countLabel : "no visualized passages yet"}`}
          >
            <span className="bible-book-name">{book.name}</span>
            {hasWorks && <small className="bible-book-count">{countLabel}</small>}
            <strong aria-hidden="true">{hasWorks ? book.visualizedPassages : "—"}</strong>
          </a>
        );
      })}
    </div>
  );
}
