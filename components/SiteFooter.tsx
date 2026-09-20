import { siteMotto, siteSocial } from "../content/site";

function CrossMark() {
  return (
    <svg className="brand-cross" viewBox="0 0 12 18" width="12" height="18" aria-hidden="true" focusable="false">
      <rect x="4.5" y="0" width="3" height="18" fill="currentColor" />
      <rect x="0" y="5" width="12" height="3" fill="currentColor" />
    </svg>
  );
}

function SocialMark({ id }: { id: "youtube" | "instagram" }) {
  if (id === "youtube") {
    return (
      <svg viewBox="0 0 22 16" width="20" height="15" aria-hidden="true" focusable="false">
        <rect x="0.8" y="0.8" width="20.4" height="14.4" rx="4" fill="none" stroke="currentColor" strokeWidth="1.4" />
        <path d="M9 5.2 14 8l-5 2.8z" fill="currentColor" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 20 20" width="17" height="17" aria-hidden="true" focusable="false">
      <rect x="1" y="1" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="10" cy="10" r="4.1" fill="none" stroke="currentColor" strokeWidth="1.4" />
      <circle cx="15.1" cy="4.9" r="1.15" fill="currentColor" />
    </svg>
  );
}

const NAV = [
  { href: "/scripture", label: "Scripture" },
  { href: "/films", label: "Films" },
  { href: "/about", label: "About" }
];

export default function SiteFooter() {
  const social = siteSocial.filter((entry): entry is typeof entry & { url: string } => entry.url !== null);

  return (
    <footer className="footer">
      <div className="wrap footer-inner">
        <a className="brand" href="/" aria-label="HOLY8BIT home">
          <CrossMark />
          <span className="logo">HOLY8BIT</span>
        </a>
        <nav className="footer-nav" aria-label="Footer navigation">
          {NAV.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>
        <div className="footer-side">
          {social.map((entry) => (
            <a
              key={entry.id}
              className="footer-social"
              href={entry.url}
              aria-label={`HOLY8BIT on ${entry.label}`}
              rel="noreferrer"
              target="_blank"
            >
              <SocialMark id={entry.id} />
            </a>
          ))}
          <span className="footer-rule" aria-hidden="true" />
          <p className="footer-motto">{siteMotto}</p>
        </div>
      </div>
    </footer>
  );
}
