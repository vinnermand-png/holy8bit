import type { Metadata } from "next";
import Header from "../../components/Header";
import SiteFooter from "../../components/SiteFooter";
import { formatWorkReference, passagePath } from "../../lib/bible/reference";
import { getWallpaperArchive } from "../../lib/scripture/queries";
import { wallpaperDimensionsLabel, wallpaperDownloadPath } from "../../lib/scripture/wallpapers";

export const metadata: Metadata = {
  title: "Wallpapers from Scripture",
  description: "Download HOLY8BIT artwork as wallpapers. Every wallpaper is a published Scripture Work, kept in canonical Bible order.",
  alternates: { canonical: "/wallpapers" }
};

export default async function WallpaperArchivePage() {
  const archive = await getWallpaperArchive();
  const wallpaperLabel = archive.wallpaperCount === 1 ? "WALLPAPER" : "WALLPAPERS";
  const passageLabel = archive.visualizedPassages === 1 ? "VISUALIZED PASSAGE" : "VISUALIZED PASSAGES";

  return (
    <div className="foundation-page wallpaper-page">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <Header />
      <main id="main-content" className="archive-main">
        <section className="archive-hero" aria-labelledby="wallpaper-archive-title">
          <div className="wrap archive-hero-inner">
            <p className="eyebrow">HOLY8BIT · WALLPAPERS</p>
            <h1 className="scripture-display-title" id="wallpaper-archive-title">
              Wallpapers from Scripture
            </h1>
            <p className="foundation-copy">
              Every wallpaper is a passage that has been visualized. Choose the rendition that fits your screen and take
              the artwork of the Word with you.
            </p>
            <p className="archive-summary">
              {archive.wallpaperCount} {wallpaperLabel} · {archive.visualizedPassages} {passageLabel}
            </p>
            {archive.dataSource !== "supabase" && (
              <p className="archive-source-note">PUBLISHING SOURCE NOT YET CONNECTED · NO DRAFT WORK IS EVER SHOWN</p>
            )}
            <div className="archive-hero-actions">
              <a className="text-link" href="/scripture">
                THE SCRIPTURE ARCHIVE <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </section>
        <div className="wrap wallpaper-inner">
          {archive.groups.length > 0 ? (
            archive.groups.map((group) => {
              const reference = formatWorkReference(group.work);
              const headingId = `wallpaper-work-${group.work.id}`;
              return (
                <section className="wallpaper-group" key={group.work.id} aria-labelledby={headingId}>
                  <p className="eyebrow">{reference}</p>
                  <h2 className="scripture-display-title" id={headingId}>
                    <a href={passagePath(group.work)}>{group.work.title}</a>
                  </h2>
                  <ul className="wallpaper-list">
                    {group.renditions.map((rendition) => (
                      <li key={rendition.id}>
                        <a className="wallpaper-row" href={wallpaperDownloadPath(rendition.id)}>
                          <span className="wallpaper-copy">
                            <span className="wallpaper-label scripture-display-title">{rendition.label}</span>
                            <small className="wallpaper-size">{wallpaperDimensionsLabel(rendition.widthPx, rendition.heightPx)}</small>
                          </span>
                          <span className="wallpaper-action">
                            DOWNLOAD <span aria-hidden="true">↓</span>
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })
          ) : (
            <div className="archive-empty-note">
              <p>No wallpapers are published yet.</p>
              <p>
                Wallpapers appear here automatically once a Scripture Work is published with a downloadable rendition.
                Nothing is listed before that.
              </p>
              <p className="wallpaper-note">
                <a className="text-link" href="/scripture">
                  ENTER THE SCRIPTURE ARCHIVE <span aria-hidden="true">→</span>
                </a>
              </p>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
