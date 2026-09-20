import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "../../../components/Header";
import SiteFooter from "../../../components/SiteFooter";
import { getFilm } from "../../../content/films";

type Props = { params: { slug: string } };

export function generateMetadata({ params }: Props): Metadata {
  const film = getFilm(params.slug);
  if (!film) return { title: "Film Archive" };
  return { title: `${film.title} — ${film.reference}`, description: film.description, alternates: { canonical: `/films/${film.slug}` } };
}

export default function FilmPage({ params }: Props) {
  const film = getFilm(params.slug);
  if (!film) notFound();
  const videoFile = path.join(process.cwd(), "public", film.videoSrc.replace(/^\//, ""));
  const hasVideo = fs.existsSync(videoFile);
  return <div className="film-detail-page"><a className="skip-link" href="#main-content">Skip to content</a><Header /><main id="main-content"><section className="film-intro"><div className="wrap film-intro-inner"><p className="eyebrow">{film.reference}</p><h1>{film.title}</h1><div className="film-meta"><span>HOLY8BIT FILM · {film.number}</span><span>{film.status}</span></div></div></section><section className="film-stage-section" aria-label="Film preview"><div className="film-stage-wrap">{hasVideo ? <video className="film-stage" controls playsInline preload="metadata" poster={film.posterSrc}><source src={film.videoSrc} type="video/mp4" /><p>FILM PREVIEW IN PRODUCTION. Your browser does not support HTML5 video.</p></video> : <div className="film-unavailable"><p className="eyebrow">FILM PREVIEW IN PRODUCTION</p><p>The current preview is temporarily unavailable.</p></div>}</div></section><section className="film-context"><div className="wrap film-context-inner"><div className="opening-scripture"><p className="eyebrow">FROM SCRIPTURE</p><p className="film-reference">{film.reference}</p><blockquote>“{film.openingQuote}”</blockquote><p className="reference">{film.openingReference}</p></div><div className="film-about"><p className="eyebrow">ABOUT THIS FILM</p><p>{film.description} The film follows the order of the biblical text.</p></div></div></section><nav className="film-end-nav wrap" aria-label="Film navigation"><a className="text-link" href="/films">BACK TO FILMS <span aria-hidden="true">→</span></a><a className="text-link" href="/scripture">EXPLORE SCRIPTURE <span aria-hidden="true">→</span></a></nav></main><SiteFooter /></div>;
}
