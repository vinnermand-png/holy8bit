import type { StaticImageData } from "next/image";

/**
 * Home artwork manifest.
 *
 * Every plate below is one of the approved masters in
 * `home/artwork/masters/home`, imported statically so Next owns the sizing,
 * hashing and optimisation instead of this module duplicating a copy under
 * `public/`. Aspect ratios are recorded because the section that consumes a
 * plate has to match it - the masters are portrait 9:16 for cards and 1672x941
 * or wider for bands.
 *
 * Two masters are named against their composition and are imported under their
 * orientation instead (see the aliases below): the file suffixed `-desktop` is
 * the portrait plate and the file suffixed `-mobile` is the wide plate.
 */
import homeHeroDesktop from "../home/artwork/masters/home/home-hero-desktop-master.png";
import homeHeroMobile from "../home/artwork/masters/home/home-hero-mobile.png";
import homeIsaiah40 from "../home/artwork/masters/home/home-isaiah40-8.png";
import homeMission from "../home/artwork/masters/home/home-mission.png";
import homePsalm119 from "../home/artwork/masters/home/home-psalm119-105.png";
import homeJourneyWidePlate from "../home/artwork/masters/home/home-journey-mobile.png";
import homeJourneyTallPlate from "../home/artwork/masters/home/home-journey-desktop.png";
import homeFilmPoster from "../home/artwork/masters/home/home-film-001-poster.png";
import homeCardExodus from "../home/artwork/masters/home/home-exodus-3-1-6.png";
import homeCardPsalm23 from "../home/artwork/masters/home/home-psalm23.png";
import homeCardMatthew from "../home/artwork/masters/home/home-matthew14-25-33.png";

export const homeArtwork: Record<string, StaticImageData> = {
  /** 1672x941 - cinematic band, focal mass top-right, near-black left column. */
  heroDesktop: homeHeroDesktop,
  /** 941x1672 - portrait hero, dark lower band for the copy. */
  heroMobile: homeHeroMobile,
  /** 1942x809 - wide interlude plate, dark left column. */
  psalm119: homePsalm119,
  /** 1672x940 - wide journey plate (file suffixed `-mobile`). */
  journeyWide: homeJourneyWidePlate,
  /** 941x1672 - portrait journey plate (file suffixed `-desktop`). */
  journeyTall: homeJourneyTallPlate,
  /** 1672x941 - mission plate, readable behind a scrim. */
  mission: homeMission,
  /** 1672x941 - closing plate, dark left column. */
  isaiah40: homeIsaiah40,
  /** 941x1672 - film poster. */
  filmPoster: homeFilmPoster,
  /** 941x1672 - featured card, 9:16. */
  cardExodus: homeCardExodus,
  /** 941x1672 - featured card, 9:16. */
  cardPsalm23: homeCardPsalm23,
  /** 1672x941 - landscape, so a 9:16 card crops to its centre. */
  cardMatthew: homeCardMatthew
};

export const homeHero = {
  eyebrow: "HOLY8BIT",
  titleLines: ["THE GOSPEL,", "PIXEL BY PIXEL."],
  lede: "A cinematic journey through Scripture, brought to life through pixel art.",
  primary: { href: "/scripture", label: "EXPLORE SCRIPTURE" },
  secondary: { href: "/films", label: "WATCH FILMS" }
} as const;

/**
 * Scripture Works that are named on the homepage but are not published yet.
 * They carry approved artwork and a real status, and they are never links:
 * a passage page exists only for a published record, so linking one of these
 * would produce the 404 the archive is built to avoid. Their copy is a work
 * title, never Scripture text.
 */
export const homeUpcomingWorks = [
  { reference: "EXODUS 3:1–6", title: "THE BURNING BUSH", art: "cardExodus" },
  { reference: "PSALM 23", title: "THE LORD IS MY SHEPHERD", art: "cardPsalm23" },
  { reference: "MATTHEW 14:25–33", title: "JESUS WALKS ON WATER", art: "cardMatthew" }
] as const;

/** The front of the archive holds four cards. Published works fill it first. */
export const homeFeaturedSlots = 4;

export const homeUpcomingStatus = "IN PRODUCTION";
export const homePublishedStatus = "PUBLISHED";

/**
 * The single approved wording for the text layer's absence, shared by every
 * surface that would otherwise have to show Scripture. Uppercased by CSS.
 */
export const pendingTranslationNote = "Scripture text awaits an approved translation";
export const pendingTranslationDetail =
  "HOLY8BIT serves Scripture text only from a licensed translation. The passage structure is in place; the text layer activates once an approved translation is configured.";
export const pendingRecordingNote = "No authorized recording is configured for this passage yet.";
