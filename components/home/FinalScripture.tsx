import Image from "next/image";
import { homeArtwork, pendingTranslationNote } from "../../content/homepage";

/**
 * 08 - Final Scripture moment.
 *
 * The closing plate keeps its brightest mass in the centre, so the copy sits in
 * its dark left column and the band reads as one last breath before the footer.
 * As with the interlude, the reference is shown and the text is not: no licensed
 * translation is configured, and HOLY8BIT does not paraphrase Scripture.
 */
export default function FinalScripture() {
  return (
    <section className="home-final" aria-labelledby="home-final-title">
      <div className="home-final-media" aria-hidden="true">
        <Image src={homeArtwork.isaiah40} alt="" fill sizes="100vw" />
      </div>
      <div className="wrap home-final-copy">
        <p className="eyebrow">RETURN TO THE WORD</p>
        <h2 className="home-final-reference" id="home-final-title">
          ISAIAH 40:8
        </h2>
        <p className="home-final-pending">{pendingTranslationNote}</p>
        <a className="text-link" href="/scripture">
          ENTER THE SCRIPTURE ARCHIVE <span aria-hidden="true">→</span>
        </a>
      </div>
    </section>
  );
}
