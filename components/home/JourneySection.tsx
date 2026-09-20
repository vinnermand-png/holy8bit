import ArtDirectedArt from "./ArtDirectedArt";
import JourneyList from "../JourneyList";
import { homeArtwork } from "../../content/homepage";
import type { ScriptureWorkRecord } from "../../lib/scripture/queries";

/**
 * 06 - Journey through Scripture.
 *
 * The plate is the wide master on desktop and the dedicated portrait master on
 * narrow viewports, never one cropped into the other. The timeline underneath is
 * the archive's own canonical-order list, so it shows exactly the published
 * works that exist - no era has to be invented to fill the sequence.
 */
export default function JourneySection({
  works,
  visualizedPassages
}: {
  works: ScriptureWorkRecord[];
  visualizedPassages: number;
}) {
  const countLabel =
    visualizedPassages === 1 ? "VISUALIZED PASSAGE ON THE JOURNEY" : "VISUALIZED PASSAGES ON THE JOURNEY";

  return (
    <section className="home-journey" aria-labelledby="home-journey-title">
      <div className="home-journey-plate">
        <div className="home-journey-plate-media" aria-hidden="true">
          <ArtDirectedArt
            desktop={homeArtwork.journeyWide}
            mobile={homeArtwork.journeyTall}
            desktopSizes="100vw"
            mobileSizes="100vw"
          />
        </div>
        <div className="wrap home-journey-copy">
          <p className="eyebrow">JOURNEY THROUGH SCRIPTURE</p>
          <h2 id="home-journey-title">ONE STORY. ONE SAVIOR.</h2>
          <p className="home-journey-sub">A JOURNEY FROM CREATION TO REDEMPTION.</p>
          <p className="home-journey-lede">
            Explore the visualized passages in their biblical order. From Genesis to Revelation — one story, one
            Savior, brought to life in cinematic pixel art.
          </p>
          <p className="home-count">
            {visualizedPassages} {countLabel}
          </p>
        </div>
      </div>

      <div className="wrap home-journey-list">
        {works.length > 0 ? (
          <JourneyList works={works} />
        ) : (
          <p className="home-empty-note">
            No Scripture Works are published yet. The journey fills in automatically as works are published, without
            any sequence to maintain.
          </p>
        )}
        <a className="text-link" href="/scripture/journey">
          ENTER THE FULL JOURNEY <span aria-hidden="true">→</span>
        </a>
      </div>
    </section>
  );
}
