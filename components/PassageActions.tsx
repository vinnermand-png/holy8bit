"use client";

import { useEffect, useState } from "react";

const SAVE_KEY = "holy8bit:saved-passages";

type SavedEntry = { url: string; title: string; savedAt: string };

function readSaved(): SavedEntry[] {
  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((entry) => entry && typeof entry.url === "string") : [];
  } catch {
    return [];
  }
}

function writeSaved(entries: SavedEntry[]) {
  try {
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(entries));
  } catch {
    /* a blocked storage quota must never break the page */
  }
}

/**
 * SAVE / SHARE / COPY LINK from the approved layout. SAVE is a real device-local reading
 * list (there is no public account system), SHARE uses the platform share sheet when the
 * browser offers one, and COPY LINK always falls back to the clipboard.
 */
export default function PassageActions({ title }: { title: string }) {
  const [saved, setSaved] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const url = window.location.pathname;
    setSaved(readSaved().some((entry) => entry.url === url));
  }, []);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(null), 2600);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const toggleSave = () => {
    const url = window.location.pathname;
    const entries = readSaved();
    if (entries.some((entry) => entry.url === url)) {
      writeSaved(entries.filter((entry) => entry.url !== url));
      setSaved(false);
      setNotice("Removed from saved passages");
      return;
    }
    writeSaved([...entries, { url, title, savedAt: new Date().toISOString() }]);
    setSaved(true);
    setNotice("Saved to this device");
  };

  const copyLink = async () => {
    const absolute = `${window.location.origin}${window.location.pathname}`;
    try {
      await navigator.clipboard.writeText(absolute);
      setNotice("Link copied");
    } catch {
      setNotice("Copy the link from your address bar");
    }
  };

  const share = async () => {
    const absolute = `${window.location.origin}${window.location.pathname}`;
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, url: absolute });
        return;
      } catch {
        return;
      }
    }
    await copyLink();
  };

  return (
    <div className="passage-actions">
      <button className="passage-action" type="button" onClick={toggleSave} aria-pressed={saved}>
        <svg viewBox="0 0 16 18" width="15" height="17" aria-hidden="true" focusable="false">
          <path d="M2 1.2h12v15.6L8 12.6 2 16.8z" fill="none" stroke="currentColor" strokeWidth="1.4" />
        </svg>
        Save
      </button>
      <button className="passage-action" type="button" onClick={share}>
        <svg viewBox="0 0 18 18" width="16" height="16" aria-hidden="true" focusable="false">
          <path d="M9 1.4v10.2" stroke="currentColor" strokeWidth="1.4" />
          <path d="M5.4 5 9 1.4 12.6 5" fill="none" stroke="currentColor" strokeWidth="1.4" />
          <path d="M2.6 10.2v5.4a1 1 0 0 0 1 1h10.8a1 1 0 0 0 1-1v-5.4" fill="none" stroke="currentColor" strokeWidth="1.4" />
        </svg>
        Share
      </button>
      <button className="passage-action" type="button" onClick={copyLink}>
        <svg viewBox="0 0 18 18" width="16" height="16" aria-hidden="true" focusable="false">
          <path d="M7.4 10.6a3.2 3.2 0 0 0 4.6 0l3.2-3.2a3.2 3.2 0 0 0-4.6-4.6l-1 1" fill="none" stroke="currentColor" strokeWidth="1.4" />
          <path d="M10.6 7.4a3.2 3.2 0 0 0-4.6 0l-3.2 3.2a3.2 3.2 0 0 0 4.6 4.6l1-1" fill="none" stroke="currentColor" strokeWidth="1.4" />
        </svg>
        Copy link
      </button>
      <p className="passage-action-notice" role="status" aria-live="polite">
        {notice}
      </p>
    </div>
  );
}
