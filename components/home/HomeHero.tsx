import ArtDirectedArt from "./ArtDirectedArt";
import { homeArtwork, homeHero } from "../../content/homepage";

/**
 * 01 - Cinematic hero.
 *
 * The approved plate carries its own composition: the focal mass sits high on
 * the right and the left column is near-black, so the copy lives in that safe
 * area inside the ordinary `.wrap` and the scrim only deepens what the artwork
 * already does. Portrait viewports swap to the dedicated portrait plate and the
 * copy moves into its dark lower band instead of a cropped wide plate.
 */
export default function HomeHero() {
  return (
    <section className="home-hero" aria-labelledby="home-hero-title">
      <div className="home-hero-media" aria-hidden="true">
        <ArtDirectedArt
          desktop={homeArtwork.heroDesktop}
          mobile={homeArtwork.heroMobile}
          desktopSizes="(min-width: 1440px) 1440px, 100vw"
          mobileSizes="100vw"
          eager
        />
      </div>

      <div className="wrap home-hero-copy">
        <p className="eyebrow">{homeHero.eyebrow}</p>
        <h1 id="home-hero-title">
          {homeHero.titleLines.map((line, index) => (
            <span className="home-hero-line" key={line}>
              {index > 0 && <br />}
              {line}
            </span>
          ))}
        </h1>
        <p className="home-hero-lede">{homeHero.lede}</p>
        <div className="home-hero-actions">
          <a className="button" href={homeHero.primary.href}>
            {homeHero.primary.label} <span aria-hidden="true">→</span>
          </a>
          <a className="text-link" href={homeHero.secondary.href}>
            {homeHero.secondary.label} <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
