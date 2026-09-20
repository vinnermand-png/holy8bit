"use client";

import { useState } from "react";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/scripture", label: "Scripture" },
  { href: "/films", label: "Films" },
  { href: "/about", label: "About" }
];

function CrossMark() {
  return (
    <svg className="brand-cross" viewBox="0 0 12 18" width="12" height="18" aria-hidden="true" focusable="false">
      <rect x="4.5" y="0" width="3" height="18" fill="currentColor" />
      <rect x="0" y="5" width="12" height="3" fill="currentColor" />
    </svg>
  );
}

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const close = () => {
    setOpen(false);
    setSearchOpen(false);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") close(); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className={`header${open ? " menu-open" : ""}${searchOpen ? " search-open" : ""}`}>
      <div className="wrap header-inner">
        <a className="brand" href="/" aria-label="HOLY8BIT home" onClick={close}>
          <CrossMark />
          <span className="logo">HOLY8BIT</span>
        </a>

        <nav className="nav" aria-label="Primary navigation">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href} className={isActive(link.href) ? "is-active" : undefined} aria-current={isActive(link.href) ? "page" : undefined}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="header-side">
          <button
            className="header-search"
            type="button"
            aria-label="Search the Scripture archive"
            aria-expanded={searchOpen}
            aria-controls="site-search"
            onClick={() => { setSearchOpen(!searchOpen); setOpen(false); }}
          >
            <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" focusable="false">
              <circle cx="8.5" cy="8.5" r="6" fill="none" stroke="currentColor" strokeWidth="1.6" />
              <line x1="13" y1="13" x2="18" y2="18" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          </button>
          <span className="header-rule" aria-hidden="true" />
          <p className="header-motto">
            <span>Pixel is the medium.</span>
            <span>Christ is the center.</span>
          </p>
          <button className="menu" type="button" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => { setOpen(!open); setSearchOpen(false); }}>
            <span aria-hidden="true">{open ? "×" : "☰"}</span>
          </button>
        </div>
      </div>

      {searchOpen && (
        <div className="header-search-panel" id="site-search">
          <form className="wrap header-search-form" action="/scripture" method="get" role="search">
            <label className="visually-hidden" htmlFor="site-search-input">
              Search the Scripture archive by book
            </label>
            <input id="site-search-input" name="q" type="search" placeholder="Search the archive by book — John, Exodus, Psalms…" autoFocus />
            <button className="button" type="submit">
              SEARCH <span aria-hidden="true">→</span>
            </button>
          </form>
        </div>
      )}

      <nav className="mobile-nav md:hidden" id="mobile-navigation" aria-label="Mobile navigation" aria-hidden={!open}>
        {LINKS.map((link) => (
          <a key={link.href} href={link.href} className={isActive(link.href) ? "is-active" : undefined} onClick={close}>
            {link.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
