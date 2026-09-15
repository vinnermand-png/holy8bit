import type { Metadata } from "next";
import FoundationPage from "../../components/FoundationPage";

export const metadata: Metadata = { title: "Biblical Stories", description: "Explore biblical moments and stories through Scripture and cinematic pixel art.", alternates: { canonical: "/stories" } };

export default function StoriesPage() {
  return <FoundationPage eyebrow="BIBLICAL STORIES" title="STORIES FROM SCRIPTURE" description="Explore biblical moments and stories through Scripture and cinematic pixel art."><a className="button" href="/">RETURN TO HOME <span aria-hidden="true">→</span></a></FoundationPage>;
}
