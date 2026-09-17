"use client";

import { useState } from "react";
import { useEffect } from "react";

export default function Header() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") close(); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return <header className={`header${open ? " menu-open" : ""}`}>
    <div className="wrap header-inner">
      <a className="logo" href="/" aria-label="HOLY8BIT home" onClick={close}>HOLY8BIT</a>
      <nav className="nav" aria-label="Primary navigation"><a href="/scripture">Scripture</a><a href="/stories">Stories</a><a href="/films">Films</a><a href="/gallery">Gallery</a><a href="/wallpapers">Wallpapers</a><a href="/about">About</a></nav>
      <a className="button header-cta" href="/scripture">EXPLORE <span aria-hidden="true">→</span></a>
      <button className="menu" type="button" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(!open)}><span aria-hidden="true">{open ? "×" : "☰"}</span></button>
    </div>
    <nav className="mobile-nav md:hidden" id="mobile-navigation" aria-label="Mobile navigation" aria-hidden={!open}>
      <a href="/scripture" onClick={close}>Scripture</a><a href="/stories" onClick={close}>Stories</a><a href="/films" onClick={close}>Films</a><a href="/gallery" onClick={close}>Gallery</a><a href="/wallpapers" onClick={close}>Wallpapers</a><a href="/about" onClick={close}>About</a>
    </nav>
  </header>;
}
