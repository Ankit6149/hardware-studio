import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://hardware-studio.vercel.app'),
  title: {
    default: 'Hardware Studio — Connected Hardware Engineering Workspace',
    template: '%s · Hardware Studio',
  },
  description:
    'An experimental, local-first workspace exploring how product requirements, mechanical design, electronics, PCB, firmware, validation, and releases can share one connected product graph.',
  keywords: [
    'hardware design',
    'electronics design',
    'PCB design',
    'firmware',
    'mechanical design',
    'product development',
    'local-first engineering',
    'MCP',
  ],
  authors: [{ name: 'Ankit Bhardwaj', url: 'https://github.com/Ankit6149' }],
  creator: 'Ankit Bhardwaj',
  openGraph: {
    title: 'Hardware Studio — Design the whole product',
    description:
      'A connected workspace for product requirements, mechanical design, electronics, PCB, firmware, validation, and release workflows. Currently under active development.',
    type: 'website',
    siteName: 'Hardware Studio',
    url: '/',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hardware Studio — Design the whole product',
    description:
      'A connected workspace for the complete hardware lifecycle—currently an early development foundation.',
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
