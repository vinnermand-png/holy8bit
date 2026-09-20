import "server-only";
import type { PassageCoordinates } from "./reference";

/**
 * Scripture text data layer contract.
 *
 * Bible structure and Bible text are separate concerns. The reference seed stores
 * coordinates only, and no translation has been licensed into the public app yet,
 * so this module deliberately ships the contract without any text of its own:
 * nothing here fabricates, approximates, or caches Scripture text.
 *
 * A licensed translation is wired in by registering a provider once, server-side:
 *
 *   configureScriptureTextProvider({
 *     id: "approved-translation-provider",
 *     translation: "WEB",
 *     attribution: "World English Bible (public domain)",
 *     load: (passage) => providerClient.verses(passage) // full verses for the range
 *   });
 *
 * Until then `getScriptureText` reports an explicit development state and the
 * reading component renders its designed unavailable state instead of fake verses.
 */

export type ScriptureTextVerse = {
  verse: number;
  text: string;
};

export type ScriptureTextRequest = PassageCoordinates & {
  passageKey: string;
  bookName: string;
};

export type ScriptureTextProvider = {
  id: string;
  /** Translation identifier, e.g. "WEB". */
  translation: string;
  /** Licensing/attribution line shown with the text. */
  attribution: string;
  /** Returns every verse in the requested range, or null when the range is not in the translation. */
  load: (request: ScriptureTextRequest) => Promise<ScriptureTextVerse[] | null>;
};

export type ScriptureTextResult =
  | { status: "available"; translation: string; attribution: string; verses: ScriptureTextVerse[] }
  | { status: "unavailable"; reason: "translation-not-configured" | "passage-not-in-translation" | "source-unreachable" };

let provider: ScriptureTextProvider | null = null;

export function configureScriptureTextProvider(nextProvider: ScriptureTextProvider | null): void {
  provider = nextProvider;
}

export function isScriptureTextConfigured(): boolean {
  return provider !== null;
}

export async function getScriptureText(request: ScriptureTextRequest): Promise<ScriptureTextResult> {
  if (!provider) return { status: "unavailable", reason: "translation-not-configured" };
  try {
    const verses = await provider.load(request);
    if (!verses || verses.length === 0) return { status: "unavailable", reason: "passage-not-in-translation" };
    return { status: "available", translation: provider.translation, attribution: provider.attribution, verses };
  } catch {
    return { status: "unavailable", reason: "source-unreachable" };
  }
}
