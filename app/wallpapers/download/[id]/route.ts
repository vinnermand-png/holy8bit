import { NextResponse } from "next/server";
import { passageSegment } from "../../../../lib/bible/reference";
import { getDownloadableWallpaper } from "../../../../lib/scripture/queries";
import { createSupabaseAdminClient } from "../../../../lib/supabase/admin";

/**
 * Wallpaper download. The rendition is looked up through the public, published-only
 * query layer, then a short-lived signed URL is minted server-side with a download
 * disposition. Drafts and unpublished works are unreachable here by construction.
 */
export const dynamic = "force-dynamic";

function safeFileName(candidate: string | null, fallback: string): string {
  const base = (candidate ?? "").trim() || fallback;
  const cleaned = base
    .replace(/[\\/:*?"<>|\u0000-\u001f]/g, "-")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[.-]+/, "")
    .slice(0, 120);
  return cleaned.length > 0 ? cleaned : fallback;
}

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const wallpaper = await getDownloadableWallpaper(params.id);
  if (!wallpaper) return new NextResponse("Wallpaper not found", { status: 404, headers: { "cache-control": "no-store" } });

  if (/^https?:\/\//.test(wallpaper.storagePath)) {
    return NextResponse.redirect(wallpaper.storagePath, { status: 302, headers: { "cache-control": "private, no-store" } });
  }

  const fallbackName = `${wallpaper.work.book.slug}-${passageSegment(wallpaper.work.passageKey, wallpaper.work.book.slug)}-${wallpaper.widthPx}x${wallpaper.heightPx}.png`;
  const fileName = safeFileName(wallpaper.fileName, fallbackName);

  try {
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin.storage.from("wallpaper-media").createSignedUrl(wallpaper.storagePath, 60 * 10, { download: fileName });
    if (error || !data?.signedUrl) {
      return new NextResponse("Wallpaper file is not available", { status: 404, headers: { "cache-control": "no-store" } });
    }
    return NextResponse.redirect(data.signedUrl, { status: 302, headers: { "cache-control": "private, no-store" } });
  } catch {
    return new NextResponse("Wallpaper delivery is not configured", { status: 503, headers: { "cache-control": "no-store" } });
  }
}
