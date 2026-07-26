import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Hardware Studio by System Alpha",
    template: "%s · Hardware Studio",
  },
  description:
    "An experimental, local-first workspace exploring how product requirements, mechanical design, electronics, PCB, firmware, validation, and releases can share one connected product graph.",
  keywords: [
    "hardware design",
    "electronics design",
    "PCB",
    "firmware",
    "mechanical design",
    "product development",
    "MCP",
    "System Alpha",
  ],
  authors: [{ name: "System Alpha" }],
  creator: "System Alpha",
  openGraph: {
    title: "Hardware Studio by System Alpha",
    description:
      "Design the whole product, not disconnected files. An ambitious engineering workspace under active development.",
    type: "website",
    siteName: "Hardware Studio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hardware Studio by System Alpha",
    description:
      "A connected workspace for the complete hardware lifecycle—currently an early development foundation.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="min-h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
