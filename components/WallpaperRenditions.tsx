import Image from "next/image";
import type { PublicWallpaper } from "../lib/scripture/queries";
import { wallpaperAspectRatio, wallpaperDimensionsLabel, wallpaperDownloadPath } from "../lib/scripture/wallpapers";

/**
 * WALLPAPER is discovered from the artwork itself: the renditions of the published
 * Scripture Work shown on this page. Nothing is listed that is not published.
 */
export default function WallpaperRenditions({ wallpapers, reference }: { wallpapers: PublicWallpaper[]; reference: string }) {
  if (wallpapers.length === 0) return null;
  return (
    <section className="wallpaper-section" aria-labelledby="wallpaper-title">
      <p className="eyebrow" id="wallpaper-title">
        Wallpaper
      </p>
      <p className="wallpaper-intro">Take {reference} with you. The published artwork, rendered for your screen.</p>
      <ul className="wallpaper-list">
        {wallpapers.map((wallpaper) => {
          const landscape = wallpaperAspectRatio(wallpaper.widthPx, wallpaper.heightPx) > 1;
          return (
            <li key={wallpaper.id}>
              <a className="wallpaper-row has-thumb" href={wallpaperDownloadPath(wallpaper.id)}>
                <span className={`wallpaper-thumb${landscape ? " is-landscape" : ""}`} aria-hidden="true">
                  {wallpaper.previewPath ? (
                    <Image src={wallpaper.previewPath} alt="" fill sizes="120px" style={{ objectFit: "cover" }} />
                  ) : (
                    <span className="wallpaper-thumb-empty" />
                  )}
                </span>
                <span className="wallpaper-copy">
                  <span className="wallpaper-label scripture-display-title">{wallpaper.label}</span>
                  <small className="wallpaper-size">{wallpaperDimensionsLabel(wallpaper.widthPx, wallpaper.heightPx)}</small>
                </span>
                <span className="wallpaper-action">
                  DOWNLOAD <span aria-hidden="true">↓</span>
                </span>
              </a>
            </li>
          );
        })}
      </ul>
      <p className="wallpaper-note">
        <a className="text-link" href="/wallpapers">
          ALL WALLPAPERS <span aria-hidden="true">→</span>
        </a>
      </p>
    </section>
  );
}
