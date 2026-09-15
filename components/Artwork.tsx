import Image from "next/image";

type ArtworkProps = { className?: string; image?: string; alt?: string; focalPosition?: string; mobileFocalPosition?: string; priority?: boolean; children?: React.ReactNode };

export default function Artwork({ className = "", image, alt = "", focalPosition = "center", mobileFocalPosition, priority = false, children }: ArtworkProps) {
  return <div className={`art ${className}${image ? " has-image" : ""}`} style={{ "--focal-position": focalPosition, "--mobile-focal-position": mobileFocalPosition || focalPosition } as React.CSSProperties} aria-hidden={!image}>
    {image && <Image src={image} alt={alt} fill sizes="(max-width: 800px) 100vw, 66vw" priority={priority} style={{ objectFit: "cover", objectPosition: "var(--focal-position)" }} />}
    {children}
  </div>;
}
