import type { StaticImageData } from "next/image";

/**
 * Dedicated static plates for the Scripture detail page.
 *
 * A Scripture Work ships one primary *animated* artwork (the GIF or the video), and
 * that media belongs to exactly one place on the page: the Scripture Work stage.
 * The hero and the closing cinematic quote are deliberately separate, still
 * compositions so the animated artwork is never repeated, cropped into a band, or
 * used as a backdrop.
 *
 * Plates are keyed by the canonical `passage_key` the database itself uses
 * (e.g. `"john:1:4-5"`), so an entry can never drift from the record it decorates.
 * They are imported statically from the masters directory so Next owns sizing,
 * hashing and optimisation - the same convention as `content/homepage.ts`.
 *
 * Registering a passage is a one-line change, and a passage without an entry keeps
 * the approved dark editorial field instead of borrowing artwork it does not own:
 *
 *   import johnHero from "../home/artwork/masters/scripture/john-1-4-5-hero.png";
 *   import johnHeroPortrait from "../home/artwork/masters/scripture/john-1-4-5-hero-portrait.png";
 *   import johnQuote from "../home/artwork/masters/scripture/john-1-4-5-quote.png";
 *
 *   "john:1:4-5": { hero: johnHero, heroPortrait: johnHeroPortrait, quote: johnQuote }
 */
export type ScriptureArtwork = {
  /** Wide cinematic plate behind the hero copy. */
  hero?: StaticImageData;
  /**
   * Portrait counterpart for narrow viewports. When present with `hero`, the hero
   * is art-directed rather than cropping the wide plate into a tall viewport.
   */
  heroPortrait?: StaticImageData;
  /** Full-bleed plate behind the closing quote. Never the work's animated media. */
  quote?: StaticImageData;
};

/** One entry per passage that has been given bespoke static plates. */
export const scriptureArtwork: Record<string, ScriptureArtwork> = {};

/** Never throws and never invents a plate: an unregistered passage returns an empty set. */
export function getScriptureArtwork(passageKey: string): ScriptureArtwork {
  return scriptureArtwork[passageKey] ?? {};
}
