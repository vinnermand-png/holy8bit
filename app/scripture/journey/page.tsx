import type { Metadata } from "next";
import Header from "../../../components/Header";
import JourneyList from "../../../components/JourneyList";
import SiteFooter from "../../../components/SiteFooter";
import { getScriptureJourney } from "../../../lib/scripture/queries";

export const metadata: Metadata = {
  title: "Journey Through Scripture",
  description: "A canonical Genesis to Revelation journey through the Scripture passages visualized by HOLY8BIT.",
  alternates: { canonical: "/scripture/journey" }
};

export default async function JourneyPage() {
  const journey = await getScriptureJourney();
  const passageLabel = journey.visualizedPassages === 1 ? "VISUALIZED PASSAGE" : "VISUALIZED PASSAGES";

  return (
    <div className="foundation-page scripture-journey-page">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <Header />
      <main id="main-content" className="foundation-main">
        <div className="wrap foundation-inner">
          <p className="eyebrow">JOURNEY THROUGH SCRIPTURE</p>
          <h1 className="scripture-display-title">One Story. One Savior.</h1>
          <p className="foundation-copy">
            Journey follows published Scripture Works in canonical Bible order, from Genesis to Revelation, so a newly
            published work always lands exactly where the Bible places it.
          </p>
          <p className="archive-summary">
            {journey.visualizedPassages} {passageLabel} ON THE JOURNEY
          </p>
          {journey.works.length > 0 ? (
            <JourneyList works={journey.works} />
          ) : (
            <div className="archive-empty-note">
              <p>No Scripture Works are published yet.</p>
              <p>The journey fills in automatically as works are published, without any sequence to maintain.</p>
            </div>
          )}
          <div className="foundation-actions">
            <a className="button" href="/scripture">
              EXPLORE THE SCRIPTURE ARCHIVE <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
