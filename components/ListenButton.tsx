"use client";

import { useEffect, useRef, useState } from "react";

function PlayMark({ paused }: { paused: boolean }) {
  return (
    <span className="listen-button-mark" aria-hidden="true">
      {paused ? (
        <svg viewBox="0 0 12 12" width="12" height="12" focusable="false">
          <path d="M3.2 1.6 10 6l-6.8 4.4z" fill="currentColor" />
        </svg>
      ) : (
        <svg viewBox="0 0 12 12" width="12" height="12" focusable="false">
          <rect x="3" y="2" width="2.2" height="8" fill="currentColor" />
          <rect x="6.8" y="2" width="2.2" height="8" fill="currentColor" />
        </svg>
      )}
    </span>
  );
}

/**
 * The full-width LISTEN action from the approved layout. It only becomes a control when an
 * authorized recording resolves; otherwise it renders the designed inert state. The duration
 * is read from the real recording, never typed in by hand.
 */
export default function ListenButton({ src, label }: { src: string | null; label: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState<string | null>(null);

  useEffect(() => {
    const element = audioRef.current;
    if (!element) return;
    const onMeta = () => {
      if (!Number.isFinite(element.duration)) return;
      const minutes = Math.floor(element.duration / 60);
      const seconds = Math.round(element.duration % 60)
        .toString()
        .padStart(2, "0");
      setDuration(`${minutes}:${seconds}`);
    };
    const onEnd = () => setPlaying(false);
    element.addEventListener("loadedmetadata", onMeta);
    element.addEventListener("ended", onEnd);
    return () => {
      element.removeEventListener("loadedmetadata", onMeta);
      element.removeEventListener("ended", onEnd);
    };
  }, [src]);

  if (!src) {
    return (
      <p className="listen-button is-unavailable" role="note">
        <PlayMark paused />
        <span>{label}</span>
        <span className="listen-button-state">NO AUTHORIZED RECORDING</span>
      </p>
    );
  }

  return (
    <div className="listen-button-row">
      <button
        className="listen-button"
        type="button"
        aria-pressed={playing}
        onClick={() => {
          const element = audioRef.current;
          if (!element) return;
          if (playing) {
            element.pause();
            setPlaying(false);
            return;
          }
          void element.play();
          setPlaying(true);
        }}
      >
        <PlayMark paused={!playing} />
        <span>{playing ? "Pause Scripture" : label}</span>
        {duration && <span className="listen-button-duration">{duration}</span>}
      </button>
      <audio ref={audioRef} className="visually-hidden" src={src} preload="metadata" />
    </div>
  );
}
