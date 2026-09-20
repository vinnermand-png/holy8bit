/**
 * Canonical site-level links.
 *
 * A channel is rendered in the footer only once its real URL is configured, so the
 * approved footer never ships a dead or guessed destination. Add the HOLY8BIT YouTube
 * channel URL here and its mark appears automatically.
 */
export type SocialLink = {
  id: "youtube" | "instagram";
  label: string;
  url: string | null;
};

export const siteSocial: SocialLink[] = [
  { id: "youtube", label: "YouTube", url: null },
  { id: "instagram", label: "Instagram", url: "https://instagram.com/holy8bit" }
];

export const siteMotto = "For His glory.";
