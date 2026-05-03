import LenisProvider from "@/components/providers/LenisProvider";
import CustomCursor from "@/components/CustomCursor";
import Preloader from "@/components/Preloader";
import Nav from "@/components/Nav";
import ReadingProgress from "@/components/ReadingProgress";
import Footer from "@/components/Footer";
import MeshGradientBg from "@/components/MeshGradientBg";
import GrainCanvas from "@/components/GrainCanvas";
import PageTransition from "@/components/PageTransition";
import TouchDetect from "@/components/TouchDetect";
import { db } from "@/lib/db";
import { siteContent } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

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

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Non-critical: accent color fetch — fallback is #00FF94 (already in globals.css :root)
  // Using Promise.race so it never blocks more than 400ms
  const accentColor = await Promise.race([
    getAccentColor(),
    new Promise<string>((resolve) => setTimeout(() => resolve('#00FF94'), 400)),
  ]);

  const dynamicCss = `:root { --accent: ${accentColor}; --color-accent: ${accentColor}; }`;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: dynamicCss }} />
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
        <ReadingProgress />
        <LenisProvider>
          {children}
          <Footer />
        </LenisProvider>
      </div>
    </>
  );
}
