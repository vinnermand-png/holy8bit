import { formatWorkReference, passagePath } from "../lib/bible/reference";
import type { ScriptureWorkRecord } from "../lib/scripture/queries";

/** Genesis -> Revelation over published Scripture Works. A new published work slots in automatically. */
export default function JourneyList({ works }: { works: ScriptureWorkRecord[] }) {
  return (
    <ol className="journey-list">
      {works.map((work, index) => (
        <li className="journey-row" key={work.id}>
          <a href={passagePath(work)}>
            <span className="journey-index" aria-hidden="true">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="journey-copy">
              <span className="journey-reference">{formatWorkReference(work)}</span>
              <strong className="journey-title scripture-display-title">{work.title}</strong>
              <small className="journey-testament">{work.book.testament === "old" ? "OLD TESTAMENT" : "NEW TESTAMENT"}</small>
            </span>
            <span className="journey-arrow" aria-hidden="true">
              →
            </span>
          </a>
        </li>
      ))}
    </ol>
  );
}
