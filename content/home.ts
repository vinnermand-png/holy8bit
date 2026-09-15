export type ArtworkSlot = {
  id?: string;
  title: string;
  reference: string;
  image: string;
  alt: string;
  href: string;
  focalPosition?: string;
  art: string;
};

export const themes = [
  { name: "FAITH", art: "art-faith" },
  { name: "FEAR", art: "art-fear" },
  { name: "HOPE", art: "art-hope" },
  { name: "PRAYER", art: "art-prayer" },
  { name: "GRACE", art: "art-grace" },
  { name: "STRENGTH", art: "art-strength" },
  { name: "FORGIVENESS", art: "art-forgiveness" },
  { name: "REST", art: "art-rest" }
] as const;

export const stories = [
  { title: "THE EXODUS", reference: "Exodus 1–15", art: "art-fear", href: "/stories" },
  { title: "DAVID AND GOLIATH", reference: "1 Samuel 17", art: "art-forgiveness", href: "/stories" },
  { title: "JESUS CALMS THE STORM", reference: "Mark 4:35–41", art: "art-fear", href: "/stories" }
] as const;

export const featuredScripture = { title: "The light shines in the darkness, and the darkness has not overcome it.", reference: "John 1:5", href: "/scripture" } as const;
export const cinematicScripture = { title: "TAKE COURAGE. IT IS I. DO NOT BE AFRAID.", reference: "Matthew 14:27", href: "/stories" } as const;

export const archive: ArtworkSlot[] = [
  { title: "THE LIGHT OF THE WORLD", reference: "John 8:12", image: "/images/home/light-of-the-world.avif", alt: "Artwork slot for The Light of the World", href: "/gallery/the-light-of-the-world", art: "art-faith" },
  { title: "THE SECRET PLACE", reference: "Matthew 6:6", image: "/images/home/the-secret-place.avif", alt: "Artwork slot for The Secret Place", href: "/gallery/the-secret-place", art: "art-prayer" },
  { title: "THE GARDEN", reference: "Psalm 23", image: "/images/home/the-garden.avif", alt: "Artwork slot for The Garden", href: "/gallery/the-garden", art: "art-rest" },
  { title: "THE GOOD SHEPHERD", reference: "John 10:11", image: "/images/home/the-good-shepherd.avif", alt: "Artwork slot for The Good Shepherd", href: "/gallery/the-good-shepherd", art: "art-hope" },
  { title: "THE PROMISED LAND", reference: "Joshua 1:9", image: "/images/home/the-promised-land.avif", alt: "Artwork slot for The Promised Land", href: "/gallery/the-promised-land", art: "art-strength" },
  { title: "THE CROSS", reference: "Luke 23:33", image: "/images/home/the-cross.avif", alt: "Artwork slot for The Cross", href: "/gallery/the-cross", art: "art-grace" }
];
