import type { Metadata } from "next";
import FoundationPage from "../../components/FoundationPage";

export const metadata: Metadata = { title: "The Archive", description: "A growing collection of cinematic pixel artwork rooted in Scripture.", alternates: { canonical: "/gallery" } };

export default function GalleryPage() {
  return <FoundationPage eyebrow="THE HOLY8BIT ARCHIVE" title="THE ARCHIVE" description="A growing collection of cinematic pixel artwork rooted in Scripture."><a className="button" href="/">RETURN TO HOME <span aria-hidden="true">→</span></a></FoundationPage>;
}
