import { formatWorkReference } from "../lib/bible/reference";
import { resolveScriptureAudio, type ScriptureAudioTarget } from "../lib/scripture/audio";

/**
 * The LISTEN panel of the approved passage layout. HOLY8BIT never ships placeholder or
 * unlicensed Scripture recordings, so without an authorized provider the panel states the
 * designed unavailable condition rather than simulating playback. The primary LISTEN action
 * lives in the panel footer, outside this tab, exactly as the layout specifies.
 */
export default function ListenControl({ work }: { work: ScriptureAudioTarget }) {
  const audio = resolveScriptureAudio(work);
  const reference = formatWorkReference(work);

  if (audio.status === "ready") {
    return (
      <div className="listen-state is-ready">
        <p className="listen-state-line">
          {audio.translation} · {audio.attribution}
        </p>
        <audio className="listen-audio" controls preload="none" src={audio.url} aria-label={`Listen to ${reference}`} />
      </div>
    );
  }

  return (
    <div className="listen-state is-unavailable">
      <p className="listen-state-line">Audio recording not yet available</p>
      <p className="listen-state-note">
        An authorized Scripture recording for {reference} will appear here once configured.
      </p>
    </div>
  );
}
