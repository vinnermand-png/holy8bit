import type { Metadata } from "next";
import Header from "../../components/Header";
import SiteFooter from "../../components/SiteFooter";
import WallpaperCard from "../../components/WallpaperCard";
import { wallpapers } from "../../content/wallpapers";

export const metadata: Metadata = {
  title: "Free Christian Pixel Art Wallpapers",
  description: "Download free HOLY8BIT desktop and mobile wallpapers inspired by Scripture and created through cinematic pixel art.",
  alternates: { canonical: "/wallpapers" }
};

export default function WallpapersPage() {
  return <div className="foundation-page wallpapers-page"><a className="skip-link" href="#main-content">Skip to content</a><Header /><main id="main-content" className="foundation-main"><div className="wrap wallpapers-inner"><p className="eyebrow">HOLY8BIT WALLPAPERS</p><h1>SCRIPTURE FOR YOUR SCREEN.</h1><p className="foundation-copy">Download selected HOLY8BIT artwork as free desktop and mobile wallpapers — each rooted in Scripture.</p>{wallpapers.length > 0 ? <section className="wallpaper-collection" aria-labelledby="collection-title"><div className="section-top"><div><p className="eyebrow">THE COLLECTION</p><h2 className="section-heading" id="collection-title">CARRY THE WORD WITH YOU.</h2></div></div><div className="wallpaper-grid">{wallpapers.filter((wallpaper) => wallpaper.published !== false).map((wallpaper) => <WallpaperCard key={wallpaper.id} wallpaper={wallpaper} />)}</div><p className="usage-note">Free for personal use.</p></section> : <section className="wallpapers-empty" aria-labelledby="collection-title"><p className="eyebrow">THE COLLECTION IS GROWING.</p><h2 id="collection-title">SELECTED ARTWORK, ROOTED IN SCRIPTURE.</h2><p>Selected HOLY8BIT artwork will be made available here as free desktop and mobile wallpapers.</p><div className="foundation-actions"><a className="button" href="/gallery">EXPLORE THE GALLERY <span aria-hidden="true">→</span></a><a className="text-link" href="/scripture">EXPLORE SCRIPTURE <span aria-hidden="true">→</span></a></div></section>}</div></main><SiteFooter /></div>;
}
