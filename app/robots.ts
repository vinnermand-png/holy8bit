import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/wallpapers/download/"] },
    sitemap: "https://holy8bit.com/sitemap.xml"
  };
}
