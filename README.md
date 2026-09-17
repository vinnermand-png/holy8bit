# HOLY8BIT

HOLY8BIT is a Next.js App Router site for Scripture and biblical stories through cinematic pixel art.

## Stack

- Next.js 14.2.35
- React 18.3.1
- TypeScript 5.6.2 (strict)
- Tailwind CSS 3.4.13 with project-specific CSS tokens

## Development

```bash
npm install
npm run dev
npm run lint
npm run typecheck
npm run build
npm run start
```

## Structure

- `app/`: App Router pages, metadata, robots, sitemap, and global styles
- `components/`: shared header, footer, foundation pages, and artwork renderer
- `content/home.ts`: typed homepage themes, stories, Scripture features, and archive slots
- `content/wallpapers.ts`: typed curated wallpaper collection; currently empty until final artwork exists
- `content/films.ts`: typed film collections and film entries
- `public/images/`: optimized web artwork assets, organized by `home`, `scripture`, `stories`, and `gallery`

## Routes

Real routes currently available: `/`, `/scripture`, `/stories`, `/films`, `/films/genesis`, `/films/genesis/in-the-beginning`, `/gallery`, `/wallpapers`, and `/about`. Individual Scripture, story, gallery, and wallpaper detail routes are intentionally not created until real content exists.

## Films

HOLY8BIT Films is a Scripture-rooted cinematic archive. The first collection is `/films/genesis` and its first real production entry is `/films/genesis/in-the-beginning`. Film content is controlled in `content/films.ts`.

The current development preview is stored at `public/films/genesis/in-the-beginning/in-the-beginning-preview.mp4`. When a newer production cut exists, export an H.264 MP4 with the same filename and replace the file. The film page uses native HTML5 video with controls, `playsInline`, `preload="metadata"`, and no autoplay. A future poster can be added at `public/films/genesis/in-the-beginning/poster.webp` and assigned through `posterSrc` in the film content entry.

The `/films` and `/films/genesis` archive routes are included in the sitemap. The unfinished detail preview route is intentionally not included in the sitemap until the film is ready for public discovery.

## Artwork Workflow

1. Export sensible-resolution WebP or AVIF artwork; keep raw masters outside public delivery when appropriate.
2. Add the web asset under the relevant `public/images/` directory.
3. Update the matching typed item in `content/home.ts` with its `image`, `alt`, and destination.
4. Set `focalPosition` and optional `mobileFocalPosition` when the crop needs adjustment.
5. Render it through `components/Artwork.tsx`; it supports `next/image`, responsive sizes, `object-fit: cover`, priority, and the temporary fallback.
6. Verify desktop and mobile crops, then run lint, typecheck, and build.

The current homepage uses abstract development placeholders. They are deliberately not final biblical artwork and can be replaced without changing layout structure.

## Wallpapers

The `/wallpapers` route is a Scripture-connected foundation page. The curated collection is controlled in `content/wallpapers.ts` and is intentionally empty until approved artwork exists.

Use this asset convention for future wallpaper entries:

- `public/images/wallpapers/previews/`: optimized WebP/AVIF website previews
- `public/images/wallpapers/desktop/`: high-quality desktop download files
- `public/images/wallpapers/mobile/`: high-quality mobile download files

Preview assets are for fast responsive page rendering. Download assets are separate and should prioritize visual quality. A wallpaper entry connects back to Scripture through `scriptureHref` and can use different desktop/mobile files and focal positions.

Future wallpaper workflow:

1. Finish a Scripture-rooted HOLY8BIT artwork.
2. Create desktop and mobile wallpaper exports.
3. Create an optimized website preview.
4. Add each asset to the appropriate wallpapers directory.
5. Add the typed entry to `content/wallpapers.ts` with meaningful alt text and Scripture connection.
6. Set focal positions if desktop and mobile crops differ.
7. Verify both responsive crops and download links.
8. Run lint, typecheck, and build.

## SEO

Site-wide metadata is in `app/layout.tsx`. Route metadata is colocated with each foundation page. `app/robots.ts` and `app/sitemap.ts` expose only the real public routes, using `https://holy8bit.com` as the canonical domain. The favicon is a temporary minimal icon pending an approved final brand asset.
