import type { Metadata } from "next";
import FoundationPage from "../../components/FoundationPage";

export const metadata: Metadata = { title: "Explore Scripture", description: "Explore Scripture through themes, passages and visual interpretations rooted in the biblical text.", alternates: { canonical: "/scripture" } };

export default function ScripturePage() {
  return <FoundationPage eyebrow="SCRIPTURE" title="EXPLORE SCRIPTURE" description="Explore Scripture through themes, passages and visual interpretations rooted in the biblical text."><a className="button" href="/">RETURN TO HOME <span aria-hidden="true">→</span></a></FoundationPage>;
}
