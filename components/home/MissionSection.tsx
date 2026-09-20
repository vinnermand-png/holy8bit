import Image from "next/image";
import { homeArtwork } from "../../content/homepage";

/**
 * 07 - Mission.
 *
 * The mission plate is the darkest plate in the set, and it is deepened by a
 * scrim so centred text sits on Sacred Black rather than on artwork details.
 * Three tenets, one link: the section states the doctrine and then gets out of
 * the way instead of becoming a marketing page.
 */
export default function MissionSection() {
  return (
    <section className="home-mission" aria-labelledby="home-mission-title">
      <div className="home-mission-media" aria-hidden="true">
        <Image src={homeArtwork.mission} alt="" fill sizes="100vw" />
      </div>
      <div className="wrap home-mission-copy">
        <p className="eyebrow">OUR MISSION</p>
        <h2 id="home-mission-title">SCRIPTURE IS THE STRUCTURE.</h2>
        <p className="home-mission-lede">
          HOLY8BIT explores Scripture through cinematic pixel art. Every scene begins with the Word, created not to
          replace Scripture, but to invite you deeper into it.
        </p>
        <ul className="home-tenets">
          <li>SCRIPTURE FIRST</li>
          <li>PIXEL IS THE MEDIUM</li>
          <li>CHRIST IS THE CENTER</li>
        </ul>
        <a className="button" href="/about">
          ABOUT HOLY8BIT <span aria-hidden="true">→</span>
        </a>
      </div>
    </section>
  );
}
