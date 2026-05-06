import type { Metadata, Viewport } from "next";
import { Space_Grotesk, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const personSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Person",
      "@id": "https://anurag.studio/#person",
      "name": "Anurag Adhikari",
      "url": "https://anurag.studio",
      "jobTitle": "Designer & Developer",
      "description": "Product designer crafting thoughtful digital experiences through strategy, systems, and storytelling.",
      "image": "https://anurag.studio/portrait.jpg",
      "sameAs": [
        "https://linkedin.com/in/dexterityofrag",
        "https://github.com/Dexterityofrag"
      ]
    },
    {
      "@type": "WebSite",
      "@id": "https://anurag.studio/#website",
      "url": "https://anurag.studio",
      "name": "Anurag Adhikari",
      "description": "Portfolio of Anurag Adhikari — Designer & Developer",
      "publisher": { "@id": "https://anurag.studio/#person" }
    }
  ]
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#060606",
};

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: 'Anurag Adhikari | Designer & Developer',
    template: '%s | Anurag Adhikari',
  },
  description:
    'Portfolio of Anurag Adhikari: crafting cinematic digital experiences. UI/UX design, brand identity, and creative development.',
  metadataBase: new URL('https://anurag.studio'),
  authors: [{ name: 'Anurag Adhikari', url: 'https://anurag.studio' }],
  creator: 'Anurag Adhikari',
  openGraph: {
    siteName: 'anurag.studio',
    type: 'website',
    locale: 'en_US',
    images: [{ url: '/portrait.jpg', alt: 'Anurag Adhikari — Designer & Developer' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/portrait.jpg'],
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="me" href="https://linkedin.com/in/dexterityofrag" />
        <link rel="me" href="https://github.com/Dexterityofrag" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
      </head>
      <body className={`${spaceGrotesk.variable} ${dmSans.variable} ${jetbrainsMono.variable} antialiased`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
