import Image from "next/image";
import type { StaticImageData } from "next/image";
import ScriptureWorkMedia from "../ScriptureWorkMedia";
import type { PublicScriptureWork } from "../../lib/scripture/queries";

export type HomeFeaturedCard = {
  key: string;
  reference: string;
  title: string;
  status: string;
  /** Published works link to their passage; unpublished ones never do. */
  href?: string;
  work?: PublicScriptureWork;
  art?: StaticImageData;
};

/**
 * One card in the featured row.
 *
 * A published work renders through the archive's own media component, so the
 * homepage can never drift from the archive in how it presents a work. A work
 * that is not published yet renders its approved plate instead, and because no
 * passage page exists for it, the card is not a link.
 */
export default function HomeFeaturedCardView({ card }: { card: HomeFeaturedCard }) {
  const body = (
    <>
      <div className="scripture-work-media-frame">
        {card.work ? (
          <ScriptureWorkMedia work={card.work} sizes="(max-width: 800px) 45vw, 22vw" />
        ) : card.art ? (
          <Image className="scripture-work-media" src={card.art} alt="" fill sizes="(max-width: 800px) 45vw, 22vw" />
        ) : null}
      </div>
      <p className="eyebrow">{card.reference}</p>
      <h3 className="scripture-display-title home-card-title">{card.title}</h3>
      <p className={`home-card-status${card.href ? "" : " is-pending"}`}>{card.status}</p>
    </>
  );

  if (!card.href) {
    return (
      <article className="home-card">
        <div className="home-card-inner">{body}</div>
      </article>
    );
  }

  return (
    <article className="home-card">
      <a className="home-card-inner home-card-link" href={card.href}>
        {body}
      </a>
    </article>
  );
}
