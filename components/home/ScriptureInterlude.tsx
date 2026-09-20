import Image from "next/image";
import { homeArtwork, pendingTranslationNote } from "../../content/homepage";

/**
 * 03 - Scripture interlude.
 *
 * The plate's left column is the darkest part of the artwork, so the reference
 * sits there over the artwork's own light rather than over a flattened overlay.
 * No verse is shown: HOLY8BIT has no licensed translation yet, so the band
 * states that condition in the approved wording instead of inventing Scripture.
 */
export default function ScriptureInterlude() {
  return (
    <section className="home-interlude" aria-labelledby="home-interlude-title">
      <div className="home-interlude-media" aria-hidden="true">
        <Image src={homeArtwork.psalm119} alt="" fill sizes="100vw" />
      </div>
      <div className="wrap home-interlude-copy">
        <p className="eyebrow">SCRIPTURE INTERLUDE</p>
        <h2 className="home-interlude-reference" id="home-interlude-title">
          PSALM 119:105
        </h2>
        <p className="home-interlude-pending">{pendingTranslationNote}</p>
      </div>
    </section>
  );
}
