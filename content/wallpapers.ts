export type WallpaperFormat = {
  src: string;
  width: number;
  height: number;
};

export type Wallpaper = {
  id: string;
  slug: string;
  title: string;
  reference: string;
  description?: string;
  previewImage: string;
  alt: string;
  scriptureHref: string;
  desktop?: WallpaperFormat;
  mobile?: WallpaperFormat;
  focalPosition?: string;
  mobileFocalPosition?: string;
  published?: boolean;
};

// Final wallpaper artwork is intentionally not published yet.
export const wallpapers: Wallpaper[] = [];
