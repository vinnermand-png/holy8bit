import { formatWorkReference } from "../lib/bible/reference";
import type { ScriptureTextResult } from "../lib/bible/text";
import type { PublicScriptureWork } from "../lib/scripture/queries";

const UNAVAILABLE_COPY: Record<Extract<ScriptureTextResult, { status: "unavailable" }>["reason"], string> = {
  "translation-not-configured":
    "Scripture text awaits an approved translation. The passage structure is in place — the text appears here once a licensed translation is configured.",
  "passage-not-in-translation": "This passage is not present in the configured translation yet.",
  "source-unreachable": "The Scripture text source is temporarily unavailable."
};

/**
 * The READ panel of the approved passage layout: the verse list itself, numbers hanging to
 * the left, no rules between verses. The result is resolved by the page so the translation
 * label in the tab strip and the text here can never disagree.
 */
export default function ScriptureReading({ work, text }: { work: PublicScriptureWork; text: ScriptureTextResult }) {
  const reference = formatWorkReference(work);

  if (text.status === "available") {
    return (
      <>
        <ol className="scripture-text" aria-label={`${reference} — ${text.translation}`}>
          {text.verses.map((verse) => (
            <li key={verse.verse}>
              <span className="verse-number" aria-hidden="true">
                {verse.verse}
              </span>
              <span className="verse-text">{verse.text}</span>
            </li>
          ))}
        </ol>
        <p className="scripture-text-source">
          {text.translation} · {text.attribution}
        </p>
      </>
    );
  }

  return (
    <div className="scripture-text-unavailable">
      <p>{UNAVAILABLE_COPY[text.reason]}</p>
    </div>
  );
}
