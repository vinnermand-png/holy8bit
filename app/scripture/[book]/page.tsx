import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "../../../components/Header";
import ScriptureWorkCard from "../../../components/ScriptureWorkCard";
import SiteFooter from "../../../components/SiteFooter";
import { bookDisplayTitle } from "../../../lib/bible/reference";
import { getBookScripture } from "../../../lib/scripture/queries";

type Props = { params: { book: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getBookScripture(params.book);
  if (!data) return { title: "The Scripture Archive", alternates: { canonical: "/scripture" } };
  const title = bookDisplayTitle(data.book);
  return {
    title,
    description: `Published HOLY8BIT Scripture Works from ${data.book.name}, ordered by the Bible.`,
    alternates: { canonical: `/scripture/${data.book.slug}` }
  };
}

export default async function BookPage({ params }: Props) {
  const data = await getBookScripture(params.book);
  if (!data) notFound();

  const { book, works, visualizedPassages } = data;
  const passageLabel = visualizedPassages === 1 ? "VISUALIZED PASSAGE" : "VISUALIZED PASSAGES";

  return (
    <div className="foundation-page scripture-book-page">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <Header />
      <main id="main-content" className="foundation-main">
        <div className="wrap scripture-book-inner">
          <p className="eyebrow">{book.testament === "old" ? "OLD TESTAMENT" : "NEW TESTAMENT"}</p>
          <h1 className="scripture-display-title">{bookDisplayTitle(book)}</h1>
          <p className="archive-summary">
            {visualizedPassages} {passageLabel}
          </p>
          {works.length > 0 ? (
            <div className="scripture-work-grid">
              {works.map((work, index) => (
                <ScriptureWorkCard work={work} key={work.id} priority={index === 0} />
              ))}
            </div>
          ) : (
            <div className="archive-empty-note">
              <p>No published Scripture Works from {book.name} yet.</p>
              <p>
                This archive holds only visualized passages. Nothing is listed until a work from this book is
                published.
              </p>
            </div>
          )}
          <div className="scripture-book-actions">
            <a className="text-link" href="/scripture">
              ← BACK TO THE SCRIPTURE ARCHIVE
            </a>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
