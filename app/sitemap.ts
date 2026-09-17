import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", "/scripture", "/stories", "/films", "/films/genesis", "/gallery", "/wallpapers", "/about"].map((path) => ({ url: `https://holy8bit.com${path}`, lastModified: new Date() }));
}
