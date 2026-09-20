/**
 * Wallpaper presentation helpers. A wallpaper is a rendition of a published
 * Scripture Work's artwork, so everything here keeps the work as the source of truth.
 */

export type WallpaperOrientation = "portrait" | "landscape" | "square";

export function wallpaperOrientation(widthPx: number, heightPx: number): WallpaperOrientation {
  if (widthPx === heightPx) return "square";
  return widthPx > heightPx ? "landscape" : "portrait";
}

/** Human label for a rendition, e.g. "1440 × 3120 · PORTRAIT". */
export function wallpaperDimensionsLabel(widthPx: number, heightPx: number): string {
  return `${widthPx} × ${heightPx} · ${wallpaperOrientation(widthPx, heightPx).toUpperCase()}`;
}

/** Public download path; the route re-signs a fresh, published-only URL per request. */
export function wallpaperDownloadPath(renditionId: string): string {
  return `/wallpapers/download/${renditionId}`;
}

/** Preview aspect ratio bounded so a stray value can never distort a layout. */
export function wallpaperAspectRatio(widthPx: number, heightPx: number): number {
  if (!widthPx || !heightPx) return 9 / 16;
  return Math.min(Math.max(widthPx / heightPx, 0.3), 3);
}
