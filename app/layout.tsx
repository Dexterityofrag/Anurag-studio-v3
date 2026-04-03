import type { Metadata } from "next";
import { Space_Grotesk, DM_Sans, JetBrains_Mono } from "next/font/google";
import LenisProvider from "@/components/providers/LenisProvider";
import CustomCursor from "@/components/CustomCursor";
import Preloader from "@/components/Preloader";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import MeshGradientBg from "@/components/MeshGradientBg";
import GrainCanvas from "@/components/GrainCanvas";
import PageTransition from "@/components/PageTransition";
import TouchDetect from "@/components/TouchDetect";
import { db } from "@/lib/db";
import { siteContent } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import "./globals.css";

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
    default: 'Anurag | Designer & Developer',
    template: '%s | Anurag',
  },
  description:
    'Portfolio of Anurag: crafting cinematic digital experiences. UI/UX design, brand identity, and creative development.',
  metadataBase: new URL('https://anurag.studio'),
  openGraph: {
    siteName: 'anurag.studio',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
};

// Cache accent color for 1 hour — no need for it to block every page render
async function getAccentColor(): Promise<string> {
  try {
    const row = await db
      .select({ value: siteContent.value })
      .from(siteContent)
      .where(eq(siteContent.key, 'settings.accentColor'))
      .limit(1)
    return row[0]?.value ?? '#00FF94'
  } catch {
    return '#00FF94'
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Non-critical: accent color fetch — fallback is #00FF94 (already in globals.css :root)
  // Using Promise.race so it never blocks more than 400ms
  const accentColor = await Promise.race([
    getAccentColor(),
    new Promise<string>((resolve) => setTimeout(() => resolve('#00FF94'), 400)),
  ])

  const dynamicCss = `:root { --accent: ${accentColor}; --color-accent: ${accentColor}; }`

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Dynamic theme from admin settings */}
        <style dangerouslySetInnerHTML={{ __html: dynamicCss }} />
      </head>
      <body className={`${spaceGrotesk.variable} ${dmSans.variable} ${jetbrainsMono.variable} antialiased`}>
        {/* Global animated mesh gradient - position:fixed, z:0 */}
        <MeshGradientBg />
        {/* Live procedural grain - position:fixed, z:8000, mix-blend-mode:overlay */}
        <GrainCanvas />
        {/* All page content sits above the mesh (z:1) */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <TouchDetect />
          <CustomCursor />
          <Preloader />
          <PageTransition />
          <Nav />
          <LenisProvider>
            {children}
            <Footer />
          </LenisProvider>
        </div>
      </body>
    </html>
  );
}
