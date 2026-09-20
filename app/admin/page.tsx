import type { Metadata } from "next";
import { createScriptureWork, setWorkStatus, signIn, signOut, deleteScriptureWork, updateScriptureWork } from "./actions";
import DeleteConfirmButton from "../../components/DeleteConfirmButton";
import { getAdminAccess, getStudioData } from "../../lib/admin/session";
import { getScriptureDataSourceState } from "../../lib/scripture/queries";

export const metadata: Metadata = { title: "Studio", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

function Notice({ message }: { message: string | null }) {
  if (!message) return null;
  return <p className="studio-notice" role="status">{message}</p>;
}

export default async function StudioPage({ searchParams }: { searchParams: { notice?: string; edit?: string; view?: string } }) {
  const [access, dataSource] = await Promise.all([getAdminAccess(), getScriptureDataSourceState()]);
  const notice = typeof searchParams.notice === "string" ? searchParams.notice : null;
  const editId = typeof searchParams.edit === "string" ? searchParams.edit : null;
  const view = typeof searchParams.view === "string" ? searchParams.view : "list";

  if (access.status !== "admin") {
    return (
      <div className="foundation-page studio-page">
        <main className="studio-main">
          <div className="wrap studio-inner">
            <p className="eyebrow">HOLY8BIT — STUDIO</p>
            <h1 className="scripture-display-title">Studio</h1>
            <Notice message={notice} />
            {access.status === "signed-out" && (
              <>
                <p className="studio-copy">Sign in to access the publishing studio.</p>
                <form className="studio-form studio-form-narrow" action={signIn}>
                  <label className="studio-field"><span className="eyebrow">EMAIL</span><input name="email" type="email" autoComplete="email" required /></label>
                  <label className="studio-field"><span className="eyebrow">PASSWORD</span><input name="password" type="password" autoComplete="current-password" required /></label>
                  <button className="button" type="submit">SIGN IN</button>
                </form>
              </>
            )}
            <div className="studio-status">
              <p className="eyebrow">PUBLISHING SOURCE</p>
              <p className="studio-status-line">{dataSource === "supabase" ? "CONNECTED" : "NOT CONFIGURED"}</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const data = await getStudioData();
  const publishedWorks = data.works.filter((w) => w.status === "published");

  /* ── EDIT VIEW ─────────────────────────────────── */
  if (editId) {
    const work = data.works.find((w) => w.id === editId);
    if (!work) {
      return (
        <div className="foundation-page studio-page">
          <main className="studio-main">
            <div className="wrap studio-inner">
              <p className="studio-copy">Work not found.</p>
              <a className="text-link" href="/admin">BACK</a>
            </div>
          </main>
        </div>
      );
    }
    return (
      <div className="foundation-page studio-page">
        <main className="studio-main">
          <div className="wrap studio-inner">
            <div className="studio-header-row">
              <div>
                <p className="eyebrow">EDIT SCRIPTURE</p>
                <h1 className="scripture-display-title">{work.title}</h1>
              </div>
              <a className="text-link" href="/admin">BACK TO LIST</a>
            </div>
            <Notice message={notice} />
            <WorkForm books={data.books} work={work} />
          </div>
        </main>
      </div>
    );
  }

  /* ── NEW VIEW ──────────────────────────────────── */
  if (view === "new") {
    return (
      <div className="foundation-page studio-page">
        <main className="studio-main">
          <div className="wrap studio-inner">
            <div className="studio-header-row">
              <div>
                <p className="eyebrow">NEW SCRIPTURE</p>
                <h1 className="scripture-display-title">Create</h1>
              </div>
              <a className="text-link" href="/admin">BACK TO LIST</a>
            </div>
            <Notice message={notice} />
            <WorkForm books={data.books} />
          </div>
        </main>
      </div>
    );
  }

  /* ── LIST VIEW ─────────────────────────────────── */
  return (
    <div className="foundation-page studio-page">
      <main className="studio-main">
        <div className="wrap studio-inner">
          <p className="eyebrow">HOLY8BIT — STUDIO</p>
          <h1 className="scripture-display-title">Studio</h1>
          <Notice message={notice} />
          <div className="studio-header-row">
            <p className="studio-copy">Signed in as {access.identity.email} — {access.identity.role.toUpperCase()}</p>
            <form action={signOut}>
              <button className="studio-button-quiet" type="submit">SIGN OUT</button>
            </form>
          </div>

          <section className="studio-section">
            <div className="studio-header-row">
              <p className="eyebrow">SCRIPTURE WORKS — {data.works.length}</p>
              <a className="button" href="/admin?view=new">+ NEW SCRIPTURE</a>
            </div>
            {data.works.length === 0 ? (
              <p className="studio-copy">No works yet. Create your first Scripture Work.</p>
            ) : (
              <ul className="studio-list">
                {data.works.map((w) => (
                  <li key={w.id}>
                    <span className="studio-list-main">
                      <strong>{w.title}</strong>
                      <small>{w.bookName} {w.passage.chapter_start}:{w.passage.verse_start ?? "–"}{w.passage.verse_end ? "-" + w.passage.verse_end : ""} — {w.mediaType.toUpperCase()}</small>
                    </span>
                    <span className={`studio-badge${w.status === "published" ? " is-live" : ""}`}>{w.status.toUpperCase()}</span>
                    <a className="studio-button-quiet" href={"/admin?edit=" + w.id}>EDIT</a>
                    <form action={setWorkStatus} style={{ display: "inline" }}>
                      <input name="work_id" type="hidden" value={w.id} />
                      <input name="status" type="hidden" value={w.status === "published" ? "draft" : "published"} />
                      <button className="studio-button-quiet" type="submit">{w.status === "published" ? "UNPUBLISH" : "PUBLISH"}</button>
                    </form>
                    <form action={deleteScriptureWork} style={{ display: "inline" }}>
                      <input name="work_id" type="hidden" value={w.id} />
                      <DeleteConfirmButton label="DELETE" />
                    </form>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="studio-section">
            <p className="eyebrow">SYSTEM</p>
            <ul className="studio-status-list">
              <li><span>SOURCE</span><strong>{dataSource === "supabase" ? "CONNECTED" : "NOT CONFIGURED"}</strong></li>
              <li><span>BOOKS</span><strong>{data.books.length}</strong></li>
              <li><span>WORKS</span><strong>{publishedWorks.length} PUBLISHED — {data.works.length - publishedWorks.length} DRAFT</strong></li>
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}

/* ── WORK FORM (shared create/edit) ──────────────── */

function WorkForm({
  books,
  work,
}: {
  books: Array<{ id: number; name: string; slug: string; testament: string; chapterCount: number }>;
  work?: {
    id: string;
    title: string;
    bookSlug: string;
    passage: {
      chapter_start: number;
      verse_start: number | null;
      chapter_end: number;
      verse_end: number | null;
      whole_chapter: boolean;
    };
    description: string | null;
    mediaType: string;
    mediaPath: string;
    coverPath: string | null;
    status: string;
  };
}) {
  const isEdit = !!work;
  const action = isEdit ? updateScriptureWork : createScriptureWork;

  return (
    <form className="studio-form" action={action}>
      {isEdit && <input type="hidden" name="work_id" value={work.id} />}

      <div className="studio-grid">
        <label className="studio-field">
          <span className="eyebrow">BOOK *</span>
          <select name="book_slug" defaultValue={work?.bookSlug || "john"} required>
            {books.map((b) => (
              <option key={b.slug} value={b.slug}>{b.name}</option>
            ))}
          </select>
        </label>
        <label className="studio-field">
          <span className="eyebrow">CHAPTER *</span>
          <input name="chapter_start" type="number" min={1} defaultValue={work?.passage.chapter_start || 1} required />
        </label>
        <label className="studio-field">
          <span className="eyebrow">VERSE START</span>
          <input name="verse_start" type="number" min={1} defaultValue={work?.passage.verse_start || ""} />
        </label>
        <label className="studio-field">
          <span className="eyebrow">VERSE END</span>
          <input name="verse_end" type="number" min={1} defaultValue={work?.passage.verse_end || ""} />
        </label>
      </div>

      <label className="studio-check">
        <input name="whole_chapter" type="checkbox" defaultChecked={work?.passage.whole_chapter || false} />
        <span>WHOLE CHAPTER</span>
      </label>

      <label className="studio-field">
        <span className="eyebrow">TITLE *</span>
        <input name="title" type="text" maxLength={200} defaultValue={work?.title || ""} required />
      </label>

      <label className="studio-field">
        <span className="eyebrow">DESCRIPTION</span>
        <textarea name="description" rows={3} maxLength={600} defaultValue={work?.description || ""} />
      </label>

      <div className="studio-grid">
        <label className="studio-field">
          <span className="eyebrow">MEDIA TYPE *</span>
          <select name="media_type" defaultValue={work?.mediaType || "image"}>
            <option value="image">IMAGE</option>
            <option value="gif">GIF</option>
            <option value="video">VIDEO</option>
          </select>
        </label>
        <label className="studio-field">
          <span className="eyebrow">INTERNAL REF</span>
          <input name="internal_production_ref" type="text" maxLength={80} defaultValue="" />
        </label>
      </div>

      <label className="studio-field">
        <span className="eyebrow">STORAGE PATH</span>
        <input
          name="media_path"
          type="text"
          defaultValue={work?.mediaPath || ""}
          placeholder="works/john/john-1-4-5/filename.gif"
        />
        <small className="studio-help">Full path in Supabase Storage (including filename)</small>
      </label>

      <label className="studio-field">
        <span className="eyebrow">COVER PATH (optional)</span>
        <input name="cover_path" type="text" defaultValue={work?.coverPath || ""} placeholder="Optional cover image path" />
      </label>

      <label className="studio-check">
        <input name="status" type="checkbox" value="published" defaultChecked={work?.status === "published"} />
        <span>PUBLISH</span>
      </label>

      {isEdit && (
        <div className="studio-current-media">
          <p className="eyebrow">CURRENT MEDIA</p>
          <p className="studio-copy">{work?.mediaPath || "None"}</p>
        </div>
      )}

      <div className="studio-form-actions">
        <button className="button" type="submit">{isEdit ? "UPDATE SCRIPTURE" : "SAVE SCRIPTURE WORK"}</button>
        {!isEdit && <p className="studio-help">Save as draft first, then edit to upload media and publish.</p>}
      </div>
    </form>
  );
}
