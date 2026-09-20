import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "../../../../components/Header";
import ListenButton from "../../../../components/ListenButton";
import ListenControl from "../../../../components/ListenControl";
import PassageActions from "../../../../components/PassageActions";
import PassageNavigation from "../../../../components/PassageNavigation";
import PassageTabs from "../../../../components/PassageTabs";
import RelatedScripture from "../../../../components/RelatedScripture";
import ScriptureQuoteBand from "../../../../components/ScriptureQuoteBand";
import ScriptureReading from "../../../../components/ScriptureReading";
import ScriptureWorkMedia from "../../../../components/ScriptureWorkMedia";
import SiteFooter from "../../../../components/SiteFooter";
import WallpaperRenditions from "../../../../components/WallpaperRenditions";
import { getScriptureText } from "../../../../lib/bible/text";
import { formatWorkReference, passagePath } from "../../../../lib/bible/reference";
import { resolveScriptureAudio } from "../../../../lib/scripture/audio";
import { getPassageScripture, resolvePublicWork } from "../../../../lib/scripture/queries";

type Props = { params: { book: string; passage: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getPassageScripture(params.book, params.passage);
  if (!data) return { title: "The Scripture Archive", alternates: { canonical: "/scripture" } };
  const reference = formatWorkReference(data.work);
  return {
    title: `${reference} — ${data.work.title}`,
    description: data.work.description ?? `HOLY8BIT Scripture Work for ${reference}.`,
    alternates: { canonical: passagePath(data.work) }
  };
}

export default async function PassagePage({ params }: Props) {
  const data = await getPassageScripture(params.book, params.passage);
  if (!data) notFound();

  const { work, book, previous, next, related, wallpapers } = data;
  const reference = formatWorkReference(work);
  const art = work.coverPath ?? work.mediaPath;

  // One lookup feeds the tab label, the READ panel and the quote band, so they cannot disagree.
  const text = await getScriptureText({
    passageKey: work.passageKey,
    bookName: book.name,
    ...work.passage
  });
  const audio = resolveScriptureAudio(work);
  const heroVerse = text.status === "available" ? text.verses[0] : null;

  // Neighbours and related works arrive canonically ordered but unsigned; resolve only these.
  const [previousWork, nextWork, relatedWorks] = await Promise.all([
    previous ? resolvePublicWork(previous) : Promise.resolve(null),
    next ? resolvePublicWork(next) : Promise.resolve(null),
    Promise.all(related.map(resolvePublicWork))
  ]);

  return (
    <div className="scripture-passage-page">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <Header />
      <main id="main-content" className="passage-main">
        <section className="passage-hero" aria-labelledby="passage-title">
          {art && (
            <div className="passage-hero-art" aria-hidden="true">
              <Image src={art} alt="" fill sizes="100vw" priority />
            </div>
          )}
          <div className="wrap passage-hero-inner">
            <div className="passage-hero-copy">
              <nav className="passage-breadcrumb" aria-label="Breadcrumb">
                <a href="/scripture">Scripture</a>
                <span aria-hidden="true">›</span>
                <a href={`/scripture/${book.slug}`}>{book.name}</a>
                <span aria-hidden="true">›</span>
                <span aria-current="page">{reference}</span>
              </nav>
              <h1 className="passage-display scripture-display-title" id="passage-title">
                {reference}
              </h1>
              <p className="passage-subtitle scripture-display-title">{work.title}</p>
              {work.description && <p className="passage-lede">{work.description}</p>}
            </div>
            <aside className="passage-hero-quote">
              {heroVerse ? (
                <>
                  <blockquote className="passage-quote">“{heroVerse.text}”</blockquote>
                  <p className="passage-quote-reference">
                    {book.name} {work.passage.chapter_start}:{heroVerse.verse}
                  </p>
                </>
              ) : (
                <>
                  <p className="passage-quote-pending">{reference}</p>
                  <p className="passage-quote-reference">Scripture text awaits an approved translation</p>
                </>
              )}
            </aside>
          </div>
        </section>

        <div className="wrap passage-body-grid">
          <figure className="passage-stage">
            <ScriptureWorkMedia work={work} sizes="(max-width: 800px) 100vw, 460px" priority preload="metadata" />
            <figcaption className="visually-hidden">Artwork for {reference}</figcaption>
          </figure>

          <div className="passage-panel">
            <PassageTabs
              translation={text.status === "available" ? text.translation : "NOT CONFIGURED"}
              read={<ScriptureReading work={work} text={text} />}
              listen={<ListenControl work={work} />}
              watch={
                <div className="passage-watch">
                  <ScriptureWorkMedia work={work} sizes="(max-width: 800px) 100vw, 560px" preload="metadata" />
                </div>
              }
            />
            {/* The primary LISTEN action sits in the panel footer, so it stays reachable from every tab. */}
            <ListenButton src={audio.status === "ready" ? audio.url : null} label="Listen to Scripture" />
            <PassageActions title={`${reference} — ${work.title}`} />
            <PassageNavigation previous={previousWork} next={nextWork} bookName={book.name} />
          </div>
        </div>

        <RelatedScripture works={relatedWorks} bookName={book.name} bookSlug={book.slug} />

        <div className="wrap">
          <WallpaperRenditions wallpapers={wallpapers} reference={reference} />
        </div>

        <ScriptureQuoteBand work={work} text={text} art={art} />
      </main>
      <SiteFooter />
    </div>
  );
}
