import { getImageProps } from "next/image";
import type { StaticImageData } from "next/image";

type ArtDirectedArtProps = {
  desktop: StaticImageData;
  mobile: StaticImageData;
  desktopSizes: string;
  mobileSizes: string;
  /** Empty for decorative plates: the adjacent copy already carries the meaning. */
  alt?: string;
  className?: string;
  /**
   * Marks the plate as the largest above-the-fold artwork. Only the source the
   * viewport actually matches is fetched, so one `<picture>` can be eager at
   * both breakpoints without downloading two plates.
   */
  eager?: boolean;
};

/**
 * One artwork, two compositions.
 *
 * The approved masters ship a wide plate and a portrait plate for the hero and
 * the journey, so those sections use `next/image`'s art-direction API rather
 * than cropping a wide plate into a narrow viewport. Both sources keep their own
 * `sizes` and srcset, the browser picks one, and the wide plate stays the
 * fallback for anything that does not evaluate the media queries.
 */
export default function ArtDirectedArt({
  desktop,
  mobile,
  desktopSizes,
  mobileSizes,
  alt = "",
  className,
  eager = false
}: ArtDirectedArtProps) {
  const { props: { srcSet: mobileSrcSet } } = getImageProps({
    src: mobile,
    alt,
    sizes: mobileSizes,
    quality: 88
  });
  const { props: { srcSet: desktopSrcSet, ...desktopProps } } = getImageProps({
    src: desktop,
    alt,
    sizes: desktopSizes,
    quality: 88,
    loading: eager ? "eager" : "lazy",
    fetchPriority: eager ? "high" : "auto"
  });

  return (
    <picture className={className}>
      <source media="(max-width: 800px)" srcSet={mobileSrcSet} sizes={mobileSizes} />
      <source media="(min-width: 801px)" srcSet={desktopSrcSet} sizes={desktopSizes} />
      <img {...desktopProps} alt={alt} />
    </picture>
  );
}
