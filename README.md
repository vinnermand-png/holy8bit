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
- `public/images/`: optimized web artwork assets, organized by `home`, `scripture`, `stories`, and `gallery`

## Routes

Real routes currently available: `/`, `/scripture`, `/stories`, `/gallery`, and `/about`. Individual Scripture, story, and gallery detail routes are intentionally not created until real content exists.

## Artwork Workflow

1. Export sensible-resolution WebP or AVIF artwork; keep raw masters outside public delivery when appropriate.
2. Add the web asset under the relevant `public/images/` directory.
3. Update the matching typed item in `content/home.ts` with its `image`, `alt`, and destination.
4. Set `focalPosition` and optional `mobileFocalPosition` when the crop needs adjustment.
5. Render it through `components/Artwork.tsx`; it supports `next/image`, responsive sizes, `object-fit: cover`, priority, and the temporary fallback.
6. Verify desktop and mobile crops, then run lint, typecheck, and build.

The current homepage uses abstract development placeholders. They are deliberately not final biblical artwork and can be replaced without changing layout structure.

## SEO

Site-wide metadata is in `app/layout.tsx`. Route metadata is colocated with each foundation page. `app/robots.ts` and `app/sitemap.ts` expose only the real public routes, using `https://holy8bit.com` as the canonical domain. The favicon is a temporary minimal icon pending an approved final brand asset.
