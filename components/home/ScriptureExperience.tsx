import ListenButton from "../ListenButton";
import ScriptureReading from "../ScriptureReading";
import { pendingRecordingNote, pendingTranslationDetail } from "../../content/homepage";
import { formatWorkReference, passagePath } from "../../lib/bible/reference";
import type { ScriptureTextResult } from "../../lib/bible/text";
import type { ScriptureAudioAvailability } from "../../lib/scripture/audio";
import type { PublicScriptureWork } from "../../lib/scripture/queries";

type ScriptureExperienceProps = {
  work: PublicScriptureWork | null;
  text: ScriptureTextResult | null;
  audio: ScriptureAudioAvailability | null;
};

/**
 * 05 - Watch, listen, read.
 *
 * Three modes of one Scripture Work, and each one reports the condition it is
 * actually in. LISTEN and READ render the passage page's own components, so the
 * homepage can never claim audio or text the passage page does not have; WATCH
 * links to the work itself rather than downloading its media a second time.
 */
export default function ScriptureExperience({ work, text, audio }: ScriptureExperienceProps) {
  return (
    <section className="home-experience" aria-labelledby="home-experience-title">
      <div className="wrap">
        <div className="home-section-head">
          <div>
            <p className="eyebrow">THE SCRIPTURE EXPERIENCE</p>
            <h2 id="home-experience-title">WATCH · LISTEN · READ</h2>
          </div>
          <p className="home-count">THREE WAYS INTO ONE PASSAGE</p>
        </div>

        <div className="home-mode-grid">
          <article className="home-mode">
            <p className="eyebrow">WATCH</p>
            <h3 className="home-mode-title">SCRIPTURE IN MOTION</h3>
            {work ? (
              <>
                <p className="home-mode-state">AVAILABLE</p>
                <p className="home-mode-note">
                  {formatWorkReference(work)} — {work.title}
                </p>
                <a className="text-link" href={passagePath(work)}>
                  VIEW THE SCRIPTURE WORK <span aria-hidden="true">→</span>
                </a>
              </>
            ) : (
              <>
                <p className="home-mode-state">AWAITING THE FIRST PUBLISHED WORK</p>
                <p className="home-mode-note">
                  Visual Scripture Works appear here as soon as one is published to the archive.
                </p>
              </>
            )}
          </article>

          <article className="home-mode">
            <p className="eyebrow">LISTEN</p>
            <h3 className="home-mode-title">HEAR THE WORD</h3>
            <ListenButton src={audio?.status === "ready" ? audio.url : null} label="LISTEN TO SCRIPTURE" />
            <p className="home-mode-note">
              {audio?.status === "ready" ? `${audio.translation} · ${audio.attribution}` : pendingRecordingNote}
            </p>
          </article>

          <article className="home-mode">
            <p className="eyebrow">READ</p>
            <h3 className="home-mode-title">THE TEXT ITSELF</h3>
            {work && text ? (
              <ScriptureReading work={work} text={text} />
            ) : (
              <>
                <p className="home-mode-state">TEXT LAYER PENDING</p>
                <p className="home-mode-note">{pendingTranslationDetail}</p>
              </>
            )}
          </article>
        </div>
      </div>
    </section>
  );
}
