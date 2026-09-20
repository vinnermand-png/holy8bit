import { formatWorkReference, passagePath } from "../lib/bible/reference";
import type { PublicScriptureWork } from "../lib/scripture/queries";
import ScriptureWorkMedia from "./ScriptureWorkMedia";

type ScriptureWorkCardProps = {
  work: PublicScriptureWork;
  /** First card in the grid can be the above-the-fold artwork. */
  priority?: boolean;
};

export default function ScriptureWorkCard({ work, priority = false }: ScriptureWorkCardProps) {
  return (
    <article className="scripture-work-card">
      <a className="scripture-work-card-link" href={passagePath(work)}>
        <div className="scripture-work-media-frame">
          <ScriptureWorkMedia work={work} sizes="(max-width: 800px) 45vw, 30vw" priority={priority} />
        </div>
        <p className="eyebrow">{formatWorkReference(work)}</p>
        <h2 className="scripture-display-title">{work.title}</h2>
      </a>
    </article>
  );
}
