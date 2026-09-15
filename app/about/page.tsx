import type { Metadata } from "next";
import FoundationPage from "../../components/FoundationPage";

export const metadata: Metadata = { title: "About HOLY8BIT", description: "Learn why HOLY8BIT explores Scripture and biblical stories through cinematic pixel art.", alternates: { canonical: "/about" } };

export default function AboutPage() {
  return <FoundationPage eyebrow="ABOUT HOLY8BIT" title="PIXEL IS THE MEDIUM. CHRIST IS THE CENTER." description="HOLY8BIT explores Scripture and biblical stories through cinematic pixel art. Every scene begins with Scripture. Pixel art is the medium, not the message. The purpose is not to replace the biblical text, but to create visual entry points that invite people deeper into Scripture and point toward Christ."><a className="button" href="/">RETURN TO HOME <span aria-hidden="true">→</span></a></FoundationPage>;
}
