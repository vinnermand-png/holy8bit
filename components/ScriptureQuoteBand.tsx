import Image from "next/image";
import type { StaticImageData } from "next/image";
import type { ScriptureTextResult } from "../lib/bible/text";
import { formatWorkReference } from "../lib/bible/reference";
import type { PublicScriptureWork } from "../lib/scripture/queries";

type ScriptureQuoteBandProps = {
  work: PublicScriptureWork;
  text: ScriptureTextResult;
  /**
   * Artwork behind the band. Only a dedicated static quote plate belongs here - the
   * work's animated media is never used as a backdrop, so bands without a plate fall
   * back to the flat Sacred Black field.
   */
  art?: StaticImageData | null;
};

/**
 * The full-bleed quote band that closes every approved layout. The words are always the
 * passage's own Scripture from the configured translation - never a paraphrase - and while no
 * translation is licensed the band states that condition instead of inventing a verse.
 */
export default function ScriptureQuoteBand({ work, text, art }: ScriptureQuoteBandProps) {
  const reference = formatWorkReference(work);
  const verse = text.status === "available" ? text.verses[0] : null;
  const verseReference = verse ? `${work.book.name} ${work.passage.chapter_start}:${verse.verse}` : reference;

  return (
    <section className={`quote-band${art ? "" : " quote-band--plain"}`} aria-label={`Scripture quote — ${verseReference}`}>
      {art && (
        <div className="quote-band-art" aria-hidden="true">
          <Image src={art} alt="" fill sizes="100vw" />
        </div>
      )}
      <div className="wrap quote-band-inner">
        {verse ? (
          <>
            <blockquote>“{verse.text}”</blockquote>
            <p className="reference">{verseReference.toUpperCase()}</p>
          </>
        ) : (
          <>
            <p className="quote-band-pending">{reference.toUpperCase()}</p>
            <p className="quote-band-note">Scripture text awaits an approved translation</p>
          </>
        )}
      </div>
    </section>
  );
}
