import Header from "../components/Header";
import SiteFooter from "../components/SiteFooter";
import FeaturedFilm from "../components/home/FeaturedFilm";
import FeaturedScripture from "../components/home/FeaturedScripture";
import FinalScripture from "../components/home/FinalScripture";
import HomeHero from "../components/home/HomeHero";
import JourneySection from "../components/home/JourneySection";
import MissionSection from "../components/home/MissionSection";
import ScriptureExperience from "../components/home/ScriptureExperience";
import ScriptureInterlude from "../components/home/ScriptureInterlude";
import { films } from "../content/films";
import { homeFeaturedSlots } from "../content/homepage";
import { getScriptureText } from "../lib/bible/text";
import { resolveScriptureAudio } from "../lib/scripture/audio";
import { getScriptureJourney, resolvePublicWork } from "../lib/scripture/queries";

/**
 * The entrance to the archive.
 *
 * Order is the approved one: hero, featured Scripture, interlude, featured film,
 * watch/listen/read, journey, mission, closing word. Everything printed on the
 * page is either the approved design copy or a value read from the publishing
 * database, and the sections that would need Scripture text or an authorized
 * recording report their real condition instead of filling the gap.
 */
export default async function Home() {
  const journey = await getScriptureJourney();

  /** Only the plates the featured row renders are resolved to delivery URLs. */
  const featuredWorks = await Promise.all(
    journey.works.slice(0, homeFeaturedSlots).map((work) => resolvePublicWork(work))
  );
  const leadWork = featuredWorks[0] ?? null;
  const leadRecord = journey.works[0] ?? null;

  const scriptureText = leadRecord
    ? await getScriptureText({
        passageKey: leadRecord.passageKey,
        bookName: leadRecord.book.name,
        ...leadRecord.passage
      })
    : null;

  const scriptureAudio = leadRecord
    ? resolveScriptureAudio({
        passageKey: leadRecord.passageKey,
        title: leadRecord.title,
        book: { slug: leadRecord.book.slug, name: leadRecord.book.name },
        passage: leadRecord.passage
      })
    : null;

  const featuredFilm = films[0];

  return (
    <div className="home" id="top">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <Header />
      <main id="main-content">
        <HomeHero />
        <FeaturedScripture works={featuredWorks} />
        <ScriptureInterlude />
        {featuredFilm && <FeaturedFilm film={featuredFilm} />}
        <ScriptureExperience work={leadWork} text={scriptureText} audio={scriptureAudio} />
        <JourneySection works={journey.works} visualizedPassages={journey.visualizedPassages} />
        <MissionSection />
        <FinalScripture />
      </main>
      <SiteFooter />
    </div>
  );
}
