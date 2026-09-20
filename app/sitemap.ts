import type { MetadataRoute } from "next";
import { passagePath } from "../lib/bible/reference";
import { getBibleBooks, getScriptureJourney } from "../lib/scripture/queries";

const BASE_URL = "https://holy8bit.com";

/**
 * Structure routes come from `bible_books`; passage routes come from published
 * Scripture Works only, so drafts can never be advertised to crawlers.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [books, journey] = await Promise.all([getBibleBooks(), getScriptureJourney()]);

  const paths = [
    "/",
    "/scripture",
    "/scripture/journey",
    "/wallpapers",
    "/films",
    "/films/in-the-beginning",
    "/about",
    ...books.map((book) => `/scripture/${book.slug}`),
    ...journey.works.map((work) => passagePath(work))
  ];

  return Array.from(new Set(paths)).map((path) => ({ url: `${BASE_URL}${path}` }));
}
