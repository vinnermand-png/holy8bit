import { resolveScriptureAudio, type ScriptureAudioTarget } from "../lib/scripture/audio";

/**
 * The audio element for a passage. HOLY8BIT never ships placeholder or unlicensed
 * Scripture recordings, so when no authorized recording resolves, ListenButton renders
 * the designed inert state and this control is not used.
 */
export default function ListenControl({ work }: { work: ScriptureAudioTarget }) {
  const audio = resolveScriptureAudio(work);

  if (audio.status !== "ready") return null;

  return (
    <audio className="listen-audio" controls preload="none" src={audio.url} aria-label="Listen to this passage">
      <track kind="captions" />
    </audio>
  );
}
