import { Geist, Geist_Mono } from "next/font/google";
import type { Metadata } from "next";
import "leaflet/dist/leaflet.css";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://internet-mood-map.vercel.app"),
  title: "Internet Mood Map",
  description:
    "A real-time inspired global mood intelligence dashboard that visualizes emotional signals across the internet.",
  icons: {
    icon: "/mood-icon.svg",
  },
  openGraph: {
    title: "Internet Mood Map",
    description:
      "Explore global internet mood through interactive maps, live-style signals, mood spikes, and regional explanations.",
    url: "https://internet-mood-map.vercel.app",
    siteName: "Internet Mood Map",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
