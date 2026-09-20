import Image from "next/image";
import { formatWorkReference } from "../lib/bible/reference";
import type { PublicScriptureWork } from "../lib/scripture/queries";

type ScriptureWorkMediaProps = {
  work: PublicScriptureWork;
  /** Layout width hint for the optimizer. */
  sizes: string;
  /** Poster images and above-the-fold artwork only. */
  priority?: boolean;
  /** Grids keep media idle; the passage stage can read metadata. */
  preload?: "none" | "metadata";
};

export default function ScriptureWorkMedia({ work, sizes, priority = false, preload = "none" }: ScriptureWorkMediaProps) {
  const reference = formatWorkReference(work);

  if (!work.mediaPath) {
    return (
      <div className="scripture-work-media scripture-work-media-pending">
        <p className="eyebrow">{reference}</p>
        <span>Media for this Scripture Work is not published yet.</span>
      </div>
    );
  }

  if (work.mediaType === "video") {
    return (
      <video
        className="scripture-work-media"
        controls
        playsInline
        preload={preload}
        poster={work.coverPath ?? undefined}
        aria-label={`${reference} — ${work.title}`}
      >
        <source src={work.mediaPath} />
        <p>This Scripture Work video cannot be played in your browser.</p>
      </video>
    );
  }

  return (
    <Image
      className="scripture-work-media"
      src={work.mediaPath}
      alt={`${reference} — ${work.title}`}
      fill
      sizes={sizes}
      priority={priority}
      unoptimized={work.mediaType === "gif"}
      style={{ objectFit: "cover" }}
    />
  );
}
