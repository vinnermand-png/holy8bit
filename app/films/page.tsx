import type { Metadata } from "next";
import Header from "../../components/Header";
import SiteFooter from "../../components/SiteFooter";
import { filmCollections } from "../../content/films";

export const metadata: Metadata = {
  title: "Films — Scripture in Motion",
  description: "Explore HOLY8BIT cinematic pixel films rooted in Scripture.",
  alternates: { canonical: "/films" }
};

export default function FilmsPage() {
  return <div className="foundation-page films-page"><a className="skip-link" href="#main-content">Skip to content</a><Header /><main id="main-content" className="foundation-main"><div className="wrap films-inner"><p className="eyebrow">HOLY8BIT FILMS</p><h1>THE FILMS</h1><p className="foundation-copy films-lede">Scripture in motion.</p><p className="films-supporting">Cinematic pixel films rooted in the biblical text.</p><section className="collection-feature" aria-labelledby="genesis-title">{filmCollections.map((collection) => <div className="collection-feature-inner" key={collection.slug}><div><p className="eyebrow">{collection.book}</p><h2 id="genesis-title">{collection.title}</h2><p className="collection-reference">{collection.reference}</p><p className="collection-description">{collection.description}</p><a className="button" href={`/films/${collection.slug}`}>ENTER GENESIS <span aria-hidden="true">→</span></a></div><div className="collection-art-placeholder" aria-hidden="true" /></div>)}</section></div></main><SiteFooter /></div>;
}
