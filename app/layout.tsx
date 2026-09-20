import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://holy8bit.com"),
  title: { default: "HOLY8BIT — Scripture Through Cinematic Pixel Art", template: "%s | HOLY8BIT" },
  description: "Explore Scripture and cinematic films through pixel art. HOLY8BIT creates visual journeys rooted in the Bible and centered on Christ.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "HOLY8BIT — Scripture Through Cinematic Pixel Art",
    description: "Explore Scripture and cinematic films through pixel art. HOLY8BIT creates visual journeys rooted in the Bible and centered on Christ.",
    url: "https://holy8bit.com",
    siteName: "HOLY8BIT",
    type: "website"
  },
  twitter: { card: "summary_large_image", title: "HOLY8BIT — Scripture Through Cinematic Pixel Art", description: "Explore Scripture and cinematic films through pixel art." },
  icons: { icon: "/icon.svg" }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
