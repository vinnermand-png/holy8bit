import React from "react";
import type { Metadata } from "next";
import { createScriptureWork, createWallpaper, setWallpaperStatus, setWorkStatus, signIn, signOut, deleteScriptureWork, deleteWallpaper } from "./actions";
import { getAdminAccess, getStudioData } from "../../lib/admin/session";
import { formatPassageReference } from "../../lib/bible/reference";
import { isScriptureAudioConfigured } from "../../lib/scripture/audio";
import { getScriptureDataSourceState } from "../../lib/scripture/queries";
import { isScriptureTextConfigured } from "../../lib/bible/text";

export const metadata: Metadata = { title: "Studio", robots: { index: false, follow: false } };

type Props = { searchParams: { notice?: string } };

export const dynamic = "force-dynamic";


function DeleteButton({ action, label, itemName }: { action: any; label: string; itemName: string }) {
  const [showConfirm, setShowConfirm] = React.useState(false);
  
  if (showConfirm) {
    return (
      <span className="delete-confirm">
        <span className="delete-confirm-text">ER DU SIKKER?</span>
        <form action={action} style={{ display: 'inline' }}>
          <button type="submit" className="studio-button-quiet delete-yes">JA</button>
        </form>
        <button type="button" className="studio-button-quiet delete-no" onClick={() => setShowConfirm(false)}>NEJ</button>
      </span>
    );
  }
  
  return (
    <button type="button" className="studio-button-quiet delete-trigger" onClick={() => setShowConfirm(true)}>
      {label}
    </button>
  );
}

function Notice({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p className="studio-notice" role="status">
      {message}
    </p>
  );
}

export default async function StudioPage({ searchParams }: Props) {
  const [access, dataSource] = await Promise.all([getAdminAccess(), getScriptureDataSourceState()]);
  const notice = typeof searchParams.notice === "string" ? searchParams.notice : null;

  if (access.status !== "admin") {
    return (
      <div className="foundation-page studio-page">
        <main className="studio-main">
          <div className="wrap studio-inner">
            <p className="eyebrow">HOLY8BIT · STUDIO</p>
            <h1 className="scripture-display-title">Studio</h1>
            <Notice message={notice} />
            {access.status === "signed-out" && (
              <>
                <p className="studio-copy">
                  The studio publishes Scripture Works and wallpapers. Access is limited to active HOLY8BIT
                  administrators; the database refuses every other account.
                </p>
                <form className="studio-form studio-form-narrow" action={signIn}>
                  <label className="studio-field">
                    <span className="eyebrow">EMAIL</span>
                    <input name="email" type="email" autoComplete="email" required />
                  </label>
                  <label className="studio-field">
                    <span className="eyebrow">PASSWORD</span>
                    <input name="password" type="password" autoComplete="current-password" required />
                  </label>
                  <button className="button" type="submit">
                    SIGN IN
                  </button>
                </form>
              </>
            )}
            {access.status === "refused" && (
              <p className="studio-copy">
                {access.email ?? "This account"} is signed in but is not an active HOLY8BIT administrator. Ask an owner
                to add it to <code>admin_users</code>, or sign in with an administrator account.
              </p>
            )}
            {access.status === "unavailable" && (
              <p className="studio-copy">
                The studio could not reach its publishing database. Apply the migrations in <code>supabase/</code> and
                confirm the environment variables before publishing.
              </p>
            )}
            <div className="studio-status">
              <p className="eyebrow">PUBLISHING SOURCE</p>
              <p className="studio-status-line">
                {dataSource === "supabase"
                  ? "CONNECTED"
                  : dataSource === "unconfigured"
                    ? "NOT CONFIGURED · SUPABASE ENVIRONMENT VARIABLES ARE MISSING"
                    : "UNREACHABLE · THE PROJECT HAS NO TABLES OR CANNOT BE REACHED"}
              </p>
            </div>
            <p className="studio-note">
              <a className="text-link" href="/">
                BACK TO THE SITE <span aria-hidden="true">→</span>
              </a>
            </p>
          </div>
        </main>
      </div>
    );
  }

  const data = await getStudioData();
  const publishedWorks = data.works.filter((work) => work.status === "published");
  const publishedWallpapers = data.wallpapers.filter((wallpaper) => wallpaper.status === "published");

  return (
    <div className="foundation-page studio-page">
      <main className="studio-main">
        <div className="wrap studio-inner">
          <p className="eyebrow">HOLY8BIT · STUDIO</p>
          <h1 className="scripture-display-title">Studio</h1>
          <Notice message={notice} />
          <p className="studio-copy">
            Signed in as {access.identity.email ?? access.identity.userId} · {access.identity.role.toUpperCase()}
          </p>
          <form action={signOut}>
            <button className="studio-button-quiet" type="submit">
              SIGN OUT
            </button>
          </form>

          <section className="studio-section" aria-labelledby="studio-status-title">
            <p className="eyebrow" id="studio-status-title">
              SYSTEM
            </p>
            <ul className="studio-status-list">
              <li>
                <span>PUBLISHING SOURCE</span>
                <strong>{dataSource === "supabase" ? "CONNECTED" : dataSource === "unconfigured" ? "NOT CONFIGURED" : "UNREACHABLE"}</strong>
              </li>
              <li>
                <span>BIBLE STRUCTURE</span>
                <strong>{data.books.length} BOOKS</strong>
              </li>
              <li>
                <span>SCRIPTURE WORKS</span>
                <strong>
                  {publishedWorks.length} PUBLISHED · {data.works.length - publishedWorks.length} DRAFT
                </strong>
              </li>
              <li>
                <span>WALLPAPERS</span>
                <strong>
                  {publishedWallpapers.length} PUBLISHED · {data.wallpapers.length - publishedWallpapers.length} DRAFT
                </strong>
              </li>
              <li>
                <span>SCRIPTURE TEXT</span>
                <strong>{isScriptureTextConfigured() ? "CONFIGURED" : "TRANSLATION NOT CONFIGURED"}</strong>
              </li>
              <li>
                <span>SCRIPTURE AUDIO</span>
                <strong>{isScriptureAudioConfigured() ? "CONFIGURED" : "LICENSED SOURCE NOT CONFIGURED"}</strong>
              </li>
            </ul>
          </section>

          <section className="studio-section" aria-labelledby="studio-work-title">
            <p className="eyebrow" id="studio-work-title">
              PUBLISH A SCRIPTURE WORK
            </p>
            <form className="studio-form" action={createScriptureWork}>
              <label className="studio-field">
                <span className="eyebrow">TITLE</span>
                <input name="title" type="text" maxLength={200} required />
              </label>
              <label className="studio-field">
                <span className="eyebrow">BIBLE BOOK</span>
                <select name="book_slug" defaultValue="john" required>
                  {data.books.map((book) => (
                    <option value={book.slug} key={book.slug}>
                      {book.name}
                    </option>
                  ))}
                </select>
              </label>
              <div className="studio-grid">
                <label className="studio-field">
                  <span className="eyebrow">CHAPTER</span>
                  <input name="chapter_start" type="number" min={1} required />
                </label>
                <label className="studio-field">
                  <span className="eyebrow">CHAPTER END</span>
                  <input name="chapter_end" type="number" min={1} placeholder="same as start" />
                </label>
                <label className="studio-field">
                  <span className="eyebrow">VERSE START</span>
                  <input name="verse_start" type="number" min={1} />
                </label>
                <label className="studio-field">
                  <span className="eyebrow">VERSE END</span>
                  <input name="verse_end" type="number" min={1} />
                </label>
              </div>
              <label className="studio-check">
                <input name="whole_chapter" type="checkbox" /> WHOLE CHAPTER (leave verses empty)
              </label>
              <label className="studio-field">
                <span className="eyebrow">DESCRIPTION</span>
                <textarea name="description" rows={3} maxLength={600} />
              </label>
              <div className="studio-grid">
                <label className="studio-field">
                  <span className="eyebrow">MEDIA TYPE</span>
                  <select name="media_type" defaultValue="video">
                    <option value="video">VIDEO</option>
                    <option value="image">IMAGE</option>
                    <option value="gif">GIF</option>
                  </select>
                </label>
                <label className="studio-field">
                  <span className="eyebrow">INTERNAL PRODUCTION REF</span>
                  <input name="internal_production_ref" type="text" maxLength={80} />
                </label>
              </div>
              <label className="studio-field">
                <span className="eyebrow">ARTWORK FILE</span>
                <input name="media_file" type="file" accept="video/*,image/*" />
              </label>
              <label className="studio-field">
                <span className="eyebrow">OR EXISTING STORAGE PATH</span>
                <input name="media_path" type="text" placeholder="works/john/1-1-9/artwork.mp4" />
              </label>
              <label className="studio-field">
                <span className="eyebrow">COVER / POSTER IMAGE</span>
                <input name="cover_file" type="file" accept="image/*" />
              </label>
              <label className="studio-check">
                <input name="status" type="checkbox" value="published" /> PUBLISH IMMEDIATELY
              </label>
              <button className="button" type="submit">
                SAVE SCRIPTURE WORK
              </button>
            </form>
          </section>

          <section className="studio-section" aria-labelledby="studio-library-title">
            <p className="eyebrow" id="studio-library-title">
              SCRIPTURE WORKS
            </p>
            {data.works.length === 0 ? (
              <p className="studio-copy">No Scripture Works exist yet. The first published work fills the archive automatically.</p>
            ) : (
              <ul className="studio-list">
                {data.works.map((work) => (
                  <li key={work.id}>
                    <span className="studio-list-main">
                      <strong>{work.title}</strong>
                      <small>
                        {formatPassageReference(work.bookName, work.passage)} · {work.mediaType.toUpperCase()} ·{" "}
                        {work.wallpaperCount} WALLPAPER{work.wallpaperCount === 1 ? "" : "S"}
                      </small>
                    </span>
                    <span className={`studio-badge${work.status === "published" ? " is-live" : ""}`}>{work.status.toUpperCase()}</span>
                    <form action={setWorkStatus}>
                      <input name="work_id" type="hidden" value={work.id} />
                      <input name="status" type="hidden" value={work.status === "published" ? "draft" : "published"} />
                      <button className="studio-button-quiet" type="submit">
                        {work.status === "published" ? "UNPUBLISH" : "PUBLISH"}
                      </button>
                    </form>
                    <form action={deleteScriptureWork}>
                      <input name="work_id" type="hidden" value={work.id} />
                      <DeleteButton action={deleteScriptureWork} label="DELETE" itemName={work.title} />
                    </form>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="studio-section" aria-labelledby="studio-wallpaper-title">
            <p className="eyebrow" id="studio-wallpaper-title">
              ATTACH A WALLPAPER
            </p>
            {data.works.length === 0 ? (
              <p className="studio-copy">A wallpaper renders a published Scripture Work, so publish a work first.</p>
            ) : (
              <form className="studio-form" action={createWallpaper}>
                <label className="studio-field">
                  <span className="eyebrow">SCRIPTURE WORK</span>
                  <select name="work_id" required>
                    {data.works.map((work) => (
                      <option value={work.id} key={work.id}>
                        {formatPassageReference(work.bookName, work.passage)} · {work.title} ({work.status})
                      </option>
                    ))}
                  </select>
                </label>
                <div className="studio-grid">
                  <label className="studio-field">
                    <span className="eyebrow">LABEL</span>
                    <input name="label" type="text" placeholder="PHONE" maxLength={120} required />
                  </label>
                  <label className="studio-field">
                    <span className="eyebrow">SORT ORDER</span>
                    <input name="sort_order" type="number" min={0} defaultValue={0} />
                  </label>
                  <label className="studio-field">
                    <span className="eyebrow">WIDTH (PX)</span>
                    <input name="width_px" type="number" min={1} required />
                  </label>
                  <label className="studio-field">
                    <span className="eyebrow">HEIGHT (PX)</span>
                    <input name="height_px" type="number" min={1} required />
                  </label>
                </div>
                <label className="studio-field">
                  <span className="eyebrow">WALLPAPER FILE</span>
                  <input name="wallpaper_file" type="file" accept="image/*" />
                </label>
                <label className="studio-field">
                  <span className="eyebrow">OR EXISTING STORAGE PATH</span>
                  <input name="storage_path" type="text" placeholder="renditions/…/phone.png" />
                </label>
                <label className="studio-field">
                  <span className="eyebrow">DOWNLOAD FILE NAME</span>
                  <input name="file_name" type="text" placeholder="holy8bit-john-1-1-9-phone.png" />
                </label>
                <label className="studio-check">
                  <input name="status" type="checkbox" value="published" /> PUBLISH IMMEDIATELY
                </label>
                <button className="button" type="submit">
                  SAVE WALLPAPER
                </button>
              </form>
            )}
          </section>

          {data.wallpapers.length > 0 && (
            <section className="studio-section" aria-labelledby="studio-wallpaper-list-title">
              <p className="eyebrow" id="studio-wallpaper-list-title">
                WALLPAPER RENDITIONS
              </p>
              <ul className="studio-list">
                {data.wallpapers.map((wallpaper) => (
                  <li key={wallpaper.id}>
                    <span className="studio-list-main">
                      <strong>{wallpaper.label}</strong>
                      <small>
                        {wallpaper.widthPx} × {wallpaper.heightPx} · {wallpaper.storagePath}
                      </small>
                    </span>
                    <span className={`studio-badge${wallpaper.status === "published" ? " is-live" : ""}`}>{wallpaper.status.toUpperCase()}</span>
                    <form action={setWallpaperStatus}>
                      <input name="wallpaper_id" type="hidden" value={wallpaper.id} />
                      <input name="status" type="hidden" value={wallpaper.status === "published" ? "draft" : "published"} />
                      <button className="studio-button-quiet" type="submit">
                        {wallpaper.status === "published" ? "UNPUBLISH" : "PUBLISH"}
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
