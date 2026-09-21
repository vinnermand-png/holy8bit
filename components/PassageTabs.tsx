/**
 * The locked Scripture layout has no tab system - READ is the primary experience and
 * LISTEN TO SCRIPTURE sits below the text as part of it. This component renders only
 * the READ header; the tab strip it once provided has been retired.
 */
export default function PassageTabs() {
  return <p className="passage-read-header eyebrow">Read</p>;
}
