import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "../../../components/Header";
import SiteFooter from "../../../components/SiteFooter";
import { getFilmCollection } from "../../../content/films";

export const metadata: Metadata = {
  title: "Genesis Films — The Beginning",
  description: "Explore the book of Genesis through HOLY8BIT cinematic pixel films rooted in Scripture.",
  alternates: { canonical: "/films/genesis" }
};

export default function GenesisFilmsPage() {
  const collection = getFilmCollection("genesis");
  if (!collection) notFound();

  return <div className="foundation-page genesis-page"><a className="skip-link" href="#main-content">Skip to content</a><Header /><main id="main-content" className="foundation-main"><div className="wrap genesis-inner"><p className="eyebrow">{collection.book}</p><h1>{collection.title}</h1><p className="collection-reference">{collection.reference}</p><p className="foundation-copy">{collection.description}</p><section className="film-index" aria-labelledby="film-index-title"><p className="eyebrow">FILMS</p><h2 id="film-index-title">THE BEGINNING</h2>{collection.films.map((film) => <a className="film-index-entry" href={`/films/${collection.slug}/${film.slug}`} key={film.slug}><span className="film-number">{film.number}</span><span className="film-index-copy"><strong>{film.title}</strong><small>{film.reference}</small></span><span className="film-status">{film.status}</span><span className="film-arrow" aria-hidden="true">→</span></a>)}</section></div></main><SiteFooter /></div>;
}
