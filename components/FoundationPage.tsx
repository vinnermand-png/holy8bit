import Header from "./Header";
import SiteFooter from "./SiteFooter";

export default function FoundationPage({ eyebrow, title, description, children }: { eyebrow: string; title: string; description: string; children?: React.ReactNode }) {
  return <div className="foundation-page"><a className="skip-link" href="#main-content">Skip to content</a><Header /><main id="main-content" className="foundation-main"><div className="wrap foundation-inner"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="foundation-copy">{description}</p>{children || <a className="button" href="/">RETURN HOME <span aria-hidden="true">→</span></a>}</div></main><SiteFooter /></div>;
}
