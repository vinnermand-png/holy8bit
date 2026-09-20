import Image from "next/image";
import { formatWorkReference, passagePath } from "../lib/bible/reference";
import type { PublicScriptureWork } from "../lib/scripture/queries";

type PassageNavigationProps = {
  previous: PublicScriptureWork | null;
  next: PublicScriptureWork | null;
  bookName: string;
};

/** A thumbnail is shown only when a work actually has artwork sized for the slot. */
function thumbnail(work: PublicScriptureWork): string | null {
  if (work.coverPath) return work.coverPath;
  return work.mediaType === "image" && work.mediaPath ? work.mediaPath : null;
}

/**
 * Neighbours are computed from canonical Bible order over published works; drafts are never
 * reachable. A missing neighbour keeps the approved frame and says so, exactly as the design
 * specifies, instead of collapsing the row.
 */
export default function PassageNavigation({ previous, next, bookName }: PassageNavigationProps) {
  return (
    <nav className="passage-navigation" aria-label="Passage navigation">
      <div className="passage-nav-side is-previous">
        {previous ? (
          <a className="passage-nav-link" href={passagePath(previous)} rel="prev">
            <span className="passage-nav-chevron" aria-hidden="true">
              ‹
            </span>
            {thumbnail(previous) && (
              <span className="passage-nav-thumb">
                <Image src={thumbnail(previous) as string} alt="" fill sizes="54px" />
              </span>
            )}
            <span className="passage-nav-copy">
              <span className="passage-nav-label">Previous passage</span>
              <span className="passage-nav-reference">{formatWorkReference(previous)}</span>
              <small>{previous.title}</small>
            </span>
          </a>
        ) : (
          <span className="passage-nav-link is-empty">
            <span className="passage-nav-chevron" aria-hidden="true">
              ‹
            </span>
            <span className="passage-nav-copy">
              <span className="passage-nav-label">Previous passage</span>
              <span className="passage-nav-empty">No previous passage in {bookName}</span>
            </span>
          </span>
        )}
      </div>
      <div className="passage-nav-side is-next">
        {next ? (
          <a className="passage-nav-link" href={passagePath(next)} rel="next">
            <span className="passage-nav-copy">
              <span className="passage-nav-label">Next passage</span>
              <span className="passage-nav-reference">{formatWorkReference(next)}</span>
              <small>{next.title}</small>
            </span>
            {thumbnail(next) && (
              <span className="passage-nav-thumb">
                <Image src={thumbnail(next) as string} alt="" fill sizes="54px" />
              </span>
            )}
            <span className="passage-nav-chevron" aria-hidden="true">
              ›
            </span>
          </a>
        ) : (
          <span className="passage-nav-link is-empty">
            <span className="passage-nav-copy">
              <span className="passage-nav-label">Next passage</span>
              <span className="passage-nav-empty">No next passage in {bookName}</span>
            </span>
            <span className="passage-nav-chevron" aria-hidden="true">
              ›
            </span>
          </span>
        )}
      </div>
    </nav>
  );
}
