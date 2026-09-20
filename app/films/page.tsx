import type { Metadata } from "next";
import Header from "../../components/Header";
import SiteFooter from "../../components/SiteFooter";
import { films } from "../../content/films";

export const metadata: Metadata = {
  title: "Films — Scripture in Motion",
  description: "Explore HOLY8BIT cinematic pixel films rooted in Scripture.",
  alternates: { canonical: "/films" }
};

export default function FilmsPage() {
  return <div className="foundation-page films-page"><a className="skip-link" href="#main-content">Skip to content</a><Header /><main id="main-content" className="foundation-main"><div className="wrap films-inner"><p className="eyebrow">HOLY8BIT FILMS</p><h1>THE FILMS</h1><p className="foundation-copy films-lede">Scripture in motion.</p><p className="films-supporting">Cinematic pixel films rooted in the biblical text.</p><section className="collection-feature" aria-labelledby="film-index-title"><div className="collection-feature-inner"><div><p className="eyebrow">PUBLISHED FILMS</p><h2 id="film-index-title">CINEMA ROOTED IN SCRIPTURE.</h2><p className="collection-description">Films will appear here automatically when published and connected to a canonical Bible passage.</p>{films.map((film) => <a className="button" href={`/films/${film.slug}`} key={film.slug}>{film.title} <span aria-hidden="true">→</span></a>)}</div><div className="collection-art-placeholder" aria-hidden="true" /></div></section></div></main><SiteFooter /></div>;
}
