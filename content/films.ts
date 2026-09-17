export type FilmStatus = "IN PRODUCTION" | "RELEASED";

export type Film = {
  number: string;
  slug: string;
  title: string;
  reference: string;
  collectionSlug: string;
  status: FilmStatus;
  videoSrc: string;
  posterSrc?: string;
  openingQuote: string;
  openingReference: string;
  description: string;
};

export type FilmCollection = {
  slug: string;
  book: string;
  title: string;
  reference: string;
  description: string;
  films: Film[];
};

export const films: Film[] = [
  {
    number: "001",
    slug: "in-the-beginning",
    title: "IN THE BEGINNING",
    reference: "Genesis 1:1–2:3",
    collectionSlug: "genesis",
    status: "IN PRODUCTION",
    videoSrc: "/films/genesis/in-the-beginning/in-the-beginning-preview.mp4",
    openingQuote: "In the beginning God created the heavens and the earth.",
    openingReference: "Genesis 1:1",
    description: "IN THE BEGINNING visualizes the opening creation account of Genesis through cinematic pixel art."
  }
];

export const filmCollections: FilmCollection[] = [
  {
    slug: "genesis",
    book: "THE BOOK OF GENESIS",
    title: "THE BEGINNING",
    reference: "GENESIS 1–50",
    description: "The opening book of Scripture — creation, humanity, covenant and the beginnings of the biblical story.",
    films
  }
];

export function getFilmCollection(slug: string) {
  return filmCollections.find((collection) => collection.slug === slug);
}

export function getFilm(slug: string) {
  return films.find((film) => film.slug === slug);
}
