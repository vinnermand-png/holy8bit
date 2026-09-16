import Artwork from "./Artwork";
import type { Wallpaper } from "../content/wallpapers";

export default function WallpaperCard({ wallpaper }: { wallpaper: Wallpaper }) {
  return <article className="wallpaper-card">
    <Artwork className="wallpaper-preview" image={wallpaper.previewImage} alt={wallpaper.alt} focalPosition={wallpaper.focalPosition} mobileFocalPosition={wallpaper.mobileFocalPosition} />
    <div className="wallpaper-card-copy"><p className="eyebrow">{wallpaper.reference}</p><h2>{wallpaper.title}</h2>{wallpaper.description && <p>{wallpaper.description}</p>}<div className="wallpaper-formats">
      {wallpaper.desktop && <a className="text-link" href={wallpaper.desktop.src} download aria-label={`Download ${wallpaper.title} desktop wallpaper`}>DESKTOP {wallpaper.desktop.width} × {wallpaper.desktop.height} <span aria-hidden="true">↓</span></a>}
      {wallpaper.mobile && <a className="text-link" href={wallpaper.mobile.src} download aria-label={`Download ${wallpaper.title} mobile wallpaper`}>MOBILE {wallpaper.mobile.width} × {wallpaper.mobile.height} <span aria-hidden="true">↓</span></a>}
    </div><a className="text-link" href={wallpaper.scriptureHref}>EXPLORE SCRIPTURE <span aria-hidden="true">→</span></a></div>
  </article>;
}
