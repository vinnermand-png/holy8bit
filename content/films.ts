export type FilmStatus = "IN PRODUCTION" | "RELEASED";

export type Film = {
  number: string;
  slug: string;
  title: string;
  reference: string;
  status: FilmStatus;
  videoSrc: string;
  posterSrc?: string;
  openingQuote: string;
  openingReference: string;
  description: string;
};

export const films: Film[] = [
  {
    number: "001",
    slug: "in-the-beginning",
    title: "IN THE BEGINNING",
    reference: "Genesis 1:1–2:3",
    status: "IN PRODUCTION",
    videoSrc: "/films/genesis/in-the-beginning/in-the-beginning-preview.mp4",
    openingQuote: "In the beginning God created the heavens and the earth.",
    openingReference: "Genesis 1:1",
    description: "IN THE BEGINNING visualizes the opening creation account of Genesis through cinematic pixel art."
  }
];

export function getFilm(slug: string) {
  return films.find((film) => film.slug === slug);
}
