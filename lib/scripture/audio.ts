import "server-only";
import type { PassageCoordinates } from "../bible/reference";

/**
 * Scripture audio data layer contract.
 *
 * HOLY8BIT never ships placeholder or unlicensed Scripture recordings. Audio is
 * resolved only through an authorized provider; while no provider is registered the
 * Listen experience stays in its designed unavailable state.
 *
 * A legally authorized recording source is wired in once, server-side:
 *
 *   configureScriptureAudioProvider({
 *     id: "approved-audio-provider",
 *     translation: "WEB",
 *     attribution: "Read by ... - licensed for HOLY8BIT",
 *     resolve: (work) => signedAudioUrlFor(work.passageKey)
 *   });
 */

export type ScriptureAudioTarget = {
  passageKey: string;
  title: string;
  book: { slug: string; name: string };
  passage: PassageCoordinates;
};

export type ScriptureAudioProvider = {
  id: string;
  /** Translation identifier of the recording, e.g. "WEB". */
  translation: string;
  /** Licensing/attribution line shown beside the control. */
  attribution: string;
  /** Returns a playable URL for the passage, or null when no authorized recording exists. */
  resolve: (work: ScriptureAudioTarget) => string | null;
};

export type ScriptureAudioAvailability =
  | { status: "unavailable"; reason: "provider-not-configured" | "recording-not-available" }
  | { status: "ready"; url: string; translation: string; attribution: string };

let provider: ScriptureAudioProvider | null = null;

export function configureScriptureAudioProvider(nextProvider: ScriptureAudioProvider | null): void {
  provider = nextProvider;
}

export function isScriptureAudioConfigured(): boolean {
  return provider !== null;
}

export function resolveScriptureAudio(work: ScriptureAudioTarget): ScriptureAudioAvailability {
  if (!provider) return { status: "unavailable", reason: "provider-not-configured" };
  try {
    const url = provider.resolve(work);
    if (!url) return { status: "unavailable", reason: "recording-not-available" };
    return { status: "ready", url, translation: provider.translation, attribution: provider.attribution };
  } catch {
    return { status: "unavailable", reason: "recording-not-available" };
  }
}
