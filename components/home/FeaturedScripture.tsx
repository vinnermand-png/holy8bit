import HomeFeaturedCardView, { type HomeFeaturedCard } from "./HomeFeaturedCardView";
import { homeArtwork, homeFeaturedSlots, homePublishedStatus, homeUpcomingStatus, homeUpcomingWorks } from "../../content/homepage";
import { formatWorkReference, passagePath } from "../../lib/bible/reference";
import type { PublicScriptureWork } from "../../lib/scripture/queries";

/**
 * 02 - Featured Scripture.
 *
 * The row is database-aware: every published Scripture Work fills a slot in
 * canonical order, and only the leftover slots are carried by a work that is
 * named on the homepage but not published yet - which is why those cards show a
 * status and no link. Publishing more works pushes the unpublished cards out
 * without anyone editing this section.
 */
export default function FeaturedScripture({ works }: { works: PublicScriptureWork[] }) {
  const published = works.slice(0, homeFeaturedSlots);
  const remaining = Math.max(0, homeFeaturedSlots - published.length);

  const cards: HomeFeaturedCard[] = [
    ...published.map((work) => ({
      key: work.id,
      reference: formatWorkReference(work),
      title: work.title,
      status: homePublishedStatus,
      href: passagePath(work),
      work
    })),
    ...homeUpcomingWorks.slice(0, remaining).map((entry) => ({
      key: entry.reference,
      reference: entry.reference,
      title: entry.title,
      status: homeUpcomingStatus,
      art: homeArtwork[entry.art]
    }))
  ];

  const countLabel = works.length === 1 ? "PUBLISHED SCRIPTURE WORK" : "PUBLISHED SCRIPTURE WORKS";

  return (
    <section className="home-featured" aria-labelledby="home-featured-title">
      <div className="wrap">
        <div className="home-section-head">
          <div>
            <p className="eyebrow">FEATURED SCRIPTURE</p>
            <h2 id="home-featured-title">THE WORD, PRESERVED IN PIXELS.</h2>
          </div>
          <div className="home-section-aside">
            <p className="home-count">
              {works.length} {countLabel}
            </p>
            <a className="text-link" href="/scripture">
              ENTER THE ARCHIVE <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>

        <div className="home-card-grid">
          {cards.map((card) => (
            <HomeFeaturedCardView card={card} key={card.key} />
          ))}
        </div>

        {works.length === 0 && (
          <p className="home-empty-note">
            No Scripture Works are published yet. The archive fills in canonical Bible order the moment one is.
          </p>
        )}
      </div>
    </section>
  );
}
