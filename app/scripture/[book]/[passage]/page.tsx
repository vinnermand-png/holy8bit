import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "../../../../components/Header";
import ListenButton from "../../../../components/ListenButton";
import ListenControl from "../../../../components/ListenControl";
import PassageActions from "../../../../components/PassageActions";
import PassageNavigation from "../../../../components/PassageNavigation";
import PassageTabs from "../../../../components/PassageTabs";
import RelatedScripture from "../../../../components/RelatedScripture";
import ScripturePassageHero from "../../../../components/ScripturePassageHero";
import ScriptureReading from "../../../../components/ScriptureReading";
import ScriptureWorkMedia from "../../../../components/ScriptureWorkMedia";
import SiteFooter from "../../../../components/SiteFooter";
import WallpaperRenditions from "../../../../components/WallpaperRenditions";
import { getScriptureArtwork } from "../../../../content/scriptureArtwork";
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

/**
 * The locked Scripture detail layout:
 *
 *   HERO -> ARTWORK + SCRIPTURE READING -> ACTIONS -> PREVIOUS / NEXT
 *        -> RELATED PASSAGES -> REFERENCE BAND -> FOOTER
 *
 * A Scripture Work owns exactly one animated artwork, rendered exactly once, inside
 * the artwork column. READ is the primary experience; LISTEN TO SCRIPTURE sits below
 * the text as part of it - there is no tab system. The closing band is a quiet
 * Scripture reference, never a repeated artwork.
 */
export default async function PassagePage({ params }: Props) {
  const data = await getPassageScripture(params.book, params.passage);
  if (!data) notFound();

  const { work, book, previous, next, related, wallpapers } = data;
  const reference = formatWorkReference(work);
  const artwork = getScriptureArtwork(work.passageKey);

  // One lookup feeds the hero quote, the READ section and the closing band, so they
  // cannot disagree.
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
        <ScripturePassageHero
          bookName={book.name}
          bookSlug={book.slug}
          reference={reference}
          title={work.title}
          description={work.description}
          heroArt={artwork.hero ?? null}
          heroPortraitArt={artwork.heroPortrait ?? null}
          coverArt={work.coverPath}
          heroVerse={heroVerse}
          chapterStart={work.passage.chapter_start}
        />

        {/* 02 - ARTWORK + SCRIPTURE READING. One animated artwork beside one clean reading section. */}
        <section className="passage-work" aria-label={`Scripture Work — ${reference}`}>
          <div className="wrap passage-body-grid">
            <figure className="passage-stage">
              <ScriptureWorkMedia work={work} sizes="(max-width: 800px) 320px, 400px" priority preload="metadata" />
              <figcaption className="visually-hidden">Artwork for {reference}</figcaption>
            </figure>

            <div className="passage-panel">
              <PassageTabs />
              <ScriptureReading work={work} text={text} />
              <div className="passage-listen">
                <ListenButton src={audio.status === "ready" ? audio.url : null} label="Listen to Scripture" />
                <ListenControl work={work} />
              </div>
              <PassageActions title={`${reference} — ${work.title}`} />
              <PassageNavigation previous={previousWork} next={nextWork} bookName={book.name} />
            </div>
          </div>

          <div className="wrap">
            <WallpaperRenditions wallpapers={wallpapers} reference={reference} />
          </div>
        </section>

        {/* 03 - Related passages, in canonical order, understated and editorial. */}
        <RelatedScripture works={relatedWorks} bookName={book.name} bookSlug={book.slug} />

        {/* 04 - The closing band: a quiet Scripture reference, never a repeated artwork. */}
        <section className="passage-reference-band" aria-label={`Scripture reference — ${reference}`}>
          <div className="wrap">
            <p className="passage-reference-text">{reference.toUpperCase()}</p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
