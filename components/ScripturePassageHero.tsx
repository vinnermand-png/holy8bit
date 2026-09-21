import Image from "next/image";
import type { StaticImageData } from "next/image";
import ArtDirectedArt from "./home/ArtDirectedArt";

type HeroVerse = { verse: number; text: string };

type ScripturePassageHeroProps = {
  bookName: string;
  bookSlug: string;
  reference: string;
  title: string;
  description: string | null;
  /** Dedicated static plate registered for this passage. */
  heroArt: StaticImageData | null;
  /** Optional portrait counterpart, used only when the wide plate also exists. */
  heroPortraitArt: StaticImageData | null;
  /** The work's static cover still, used only when no dedicated plate is registered. */
  coverArt: string | null;
  /** First verse of the passage when a translation is available; never fabricated. */
  heroVerse: HeroVerse | null;
  chapterStart: number;
};

/**
 * 01 - The passage hero.
 *
 * The hero is a still, cinematic field. It never renders the work's animated
 * artwork: a registered static plate wins, a published cover still is the only
 * fallback, and a passage with neither keeps the approved dark editorial field.
 * Breadcrumb, reference, title, description and the optional Scripture quote keep
 * the same hierarchy in every case.
 */
export default function ScripturePassageHero({
  bookName,
  bookSlug,
  reference,
  title,
  description,
  heroArt,
  heroPortraitArt,
  coverArt,
  heroVerse,
  chapterStart
}: ScripturePassageHeroProps) {
  const artDirected = heroArt && heroPortraitArt ? { desktop: heroArt, mobile: heroPortraitArt } : null;

  return (
    <section className={`passage-hero${heroArt || coverArt ? "" : " passage-hero--plain"}`} aria-labelledby="passage-title">
      {artDirected ? (
        <div className="passage-hero-art" aria-hidden="true">
          <ArtDirectedArt desktop={artDirected.desktop} mobile={artDirected.mobile} desktopSizes="100vw" mobileSizes="100vw" eager />
        </div>
      ) : heroArt ? (
        <div className="passage-hero-art" aria-hidden="true">
          <Image src={heroArt} alt="" fill sizes="100vw" priority />
        </div>
      ) : coverArt ? (
        <div className="passage-hero-art" aria-hidden="true">
          <Image src={coverArt} alt="" fill sizes="100vw" priority />
        </div>
      ) : null}

      <div className="wrap passage-hero-inner">
        <div className="passage-hero-copy">
          <nav className="passage-breadcrumb" aria-label="Breadcrumb">
            <a href="/scripture">Scripture</a>
            <span aria-hidden="true">›</span>
            <a href={`/scripture/${bookSlug}`}>{bookName}</a>
            <span aria-hidden="true">›</span>
            <span aria-current="page">{reference}</span>
          </nav>
          <h1 className="passage-display scripture-display-title" id="passage-title">
            {reference}
          </h1>
          <p className="passage-subtitle scripture-display-title">{title}</p>
          {description && <p className="passage-lede">{description}</p>}
        </div>

        <aside className="passage-hero-quote">
          {heroVerse ? (
            <>
              <blockquote className="passage-quote">“{heroVerse.text}”</blockquote>
              <p className="passage-quote-reference">
                {bookName} {chapterStart}:{heroVerse.verse}
              </p>
            </>
          ) : (
            <>
              <p className="passage-quote-pending">{reference}</p>
              <p className="passage-quote-reference">Awaiting an approved translation</p>
            </>
          )}
        </aside>
      </div>
    </section>
  );
}
