"use client";

import { useState, type ReactNode } from "react";

type TabId = "read" | "listen" | "watch";

/**
 * The approved passage panel: READ / LISTEN / WATCH switch the panel body, while the
 * Scripture text, audio and artwork themselves are rendered on the server and passed in as
 * slots. Nothing here fabricates content - an unavailable layer shows its own designed state.
 */
export default function PassageTabs({
  read,
  listen,
  watch,
  translation
}: {
  read: ReactNode;
  listen: ReactNode;
  watch: ReactNode;
  translation: string;
}) {
  const [active, setActive] = useState<TabId>("read");

  const tabs: { id: TabId; label: string; icon: ReactNode }[] = [
    {
      id: "read",
      label: "Read",
      icon: (
        <svg viewBox="0 0 20 16" width="17" height="14" aria-hidden="true" focusable="false">
          <path d="M10 2.6C8.3 1.3 6.2.8 3.6.8c-.6 0-1.2 0-1.6.1v12.4c.4-.1 1-.1 1.6-.1 2.6 0 4.7.5 6.4 1.8 1.7-1.3 3.8-1.8 6.4-1.8.6 0 1.2 0 1.6.1V.9c-.4-.1-1-.1-1.6-.1-2.6 0-4.7.5-6.4 1.8Z" fill="none" stroke="currentColor" strokeWidth="1.3" />
          <path d="M10 2.6v12.4" stroke="currentColor" strokeWidth="1.3" />
        </svg>
      )
    },
    {
      id: "listen",
      label: "Listen",
      icon: (
        <svg viewBox="0 0 18 18" width="16" height="16" aria-hidden="true" focusable="false">
          <path d="M2.4 12V8.6a6.6 6.6 0 0 1 13.2 0V12" fill="none" stroke="currentColor" strokeWidth="1.4" />
          <rect x="1" y="10.4" width="3.6" height="6.2" rx="1.4" fill="none" stroke="currentColor" strokeWidth="1.3" />
          <rect x="13.4" y="10.4" width="3.6" height="6.2" rx="1.4" fill="none" stroke="currentColor" strokeWidth="1.3" />
        </svg>
      )
    },
    {
      id: "watch",
      label: "Watch",
      icon: (
        <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true" focusable="false">
          <circle cx="8" cy="8" r="6.9" fill="none" stroke="currentColor" strokeWidth="1.3" />
          <path d="M6.4 4.9 11.2 8l-4.8 3.1z" fill="currentColor" />
        </svg>
      )
    }
  ];

  return (
    <div className="passage-panel-inner">
      <div className="passage-tabs" role="tablist" aria-label="Passage views">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className="passage-tab"
            type="button"
            role="tab"
            id={`passage-tab-${tab.id}`}
            aria-selected={active === tab.id}
            aria-controls={`passage-panel-${tab.id}`}
            onClick={() => setActive(tab.id)}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
        <p className="passage-translation" title="Scripture text translation">
          {translation}
        </p>
      </div>

      {tabs.map((tab) => (
        <div
          key={tab.id}
          className="passage-panel-body"
          role="tabpanel"
          id={`passage-panel-${tab.id}`}
          aria-labelledby={`passage-tab-${tab.id}`}
          hidden={active !== tab.id}
        >
          {tab.id === "read" ? read : tab.id === "listen" ? listen : watch}
        </div>
      ))}
    </div>
  );
}
