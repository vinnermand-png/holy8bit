import Image from "next/image";
import { formatWorkReference, passagePath } from "../lib/bible/reference";
import type { PublicScriptureWork } from "../lib/scripture/queries";

type RelatedScriptureProps = {
  works: PublicScriptureWork[];
  bookName: string;
  bookSlug: string;
};

/** Only artwork that exists is shown; the designed empty texture stands in otherwise. */
function thumbnail(work: PublicScriptureWork): string | null {
  if (work.coverPath) return work.coverPath;
  return work.mediaType === "image" && work.mediaPath ? work.mediaPath : null;
}

/** Same-book published works in canonical order. Nothing here is hand-maintained. */
export default function RelatedScripture({ works, bookName, bookSlug }: RelatedScriptureProps) {
  return (
    <section className="related-band" aria-labelledby="related-title">
      <div className="wrap">
        <div className="related-head">
          <p className="eyebrow" id="related-title">
            Related passages
          </p>
          <a className="text-link" href={`/scripture/${bookSlug}`}>
            VIEW MORE IN {bookName.toUpperCase()} <span aria-hidden="true">→</span>
          </a>
        </div>
        {works.length > 0 ? (
          <div className="related-grid">
            {works.slice(0, 3).map((work) => {
              const art = thumbnail(work);
              return (
                <a className="related-card" href={passagePath(work)} key={work.id}>
                  <span className="related-thumb">
                    {art ? <Image src={art} alt="" fill sizes="104px" /> : <span className="related-thumb-empty" aria-hidden="true" />}
                  </span>
                  <span className="related-copy">
                    <span className="related-reference">{formatWorkReference(work)}</span>
                    <strong className="related-title scripture-display-title">{work.title}</strong>
                  </span>
                  <span className="related-play" aria-hidden="true">
                    <svg viewBox="0 0 12 12" width="12" height="12" focusable="false">
                      <path d="M3.4 1.8 10 6l-6.6 4.2z" fill="currentColor" />
                    </svg>
                  </span>
                </a>
              );
            })}
          </div>
        ) : (
          <p className="related-empty">
            {bookName} has no other visualized passages yet. A work published anywhere in this book appears here
            automatically, in biblical order.
          </p>
        )}
      </div>
    </section>
  );
}
