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

async function getSettings(): Promise<{ accentColor: string; cvUrl: string }> {
  try {
    const rows = await db
      .select({ key: siteContent.key, value: siteContent.value })
      .from(siteContent)
      .where(eq(siteContent.groupName, 'settings'))
    const map: Record<string, string> = {}
    for (const r of rows) map[r.key] = r.value ?? ''
    return {
      accentColor: map['settings.accentColor'] ?? '#00FF94',
      cvUrl: map['settings.cvUrl'] ?? '',
    }
  } catch {
    return { accentColor: '#00FF94', cvUrl: '' }
  }
}

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { accentColor, cvUrl } = await Promise.race([
    getSettings(),
    new Promise<{ accentColor: string; cvUrl: string }>((resolve) =>
      setTimeout(() => resolve({ accentColor: '#00FF94', cvUrl: '' }), 2000)
    ),
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
        <Nav cvUrl={cvUrl} />
        <ReadingProgress />
        <LenisProvider>
          {children}
          <Footer cvUrl={cvUrl} />
        </LenisProvider>
      </div>
    </>
  );
}
