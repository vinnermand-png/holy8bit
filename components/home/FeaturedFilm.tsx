import Image from "next/image";
import { homeArtwork } from "../../content/homepage";
import type { Film } from "../../content/films";

/**
 * 04 - Featured film.
 *
 * The poster is the approved plate, not a frame grabbed from the 15.8 second
 * preview, and everything printed beside it - title, reference, status,
 * description - comes from the film record so the homepage cannot state a
 * runtime or a status the film itself does not have. When films move to the
 * publishing database this section changes source, not shape.
 */
export default function FeaturedFilm({ film }: { film: Film }) {
  return (
    <section className="home-film" aria-labelledby="home-film-title">
      <div className="wrap home-film-grid">
        <div className="home-film-poster">
          <Image
            className="scripture-work-media"
            src={homeArtwork.filmPoster}
            alt=""
            fill
            sizes="(max-width: 800px) 60vw, 34vw"
          />
        </div>
        <div className="home-film-copy">
          <p className="eyebrow">FEATURED FILM</p>
          <h2 className="scripture-display-title home-film-title" id="home-film-title">
            {film.title}
          </h2>
          <p className="home-film-reference">{film.reference}</p>
          <p className="home-film-status">{film.status}</p>
          <p className="home-film-description">{film.description}</p>
          <a className="button" href={`/films/${film.slug}`}>
            WATCH FILM <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
