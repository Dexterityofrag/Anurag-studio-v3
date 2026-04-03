import { eq, asc } from 'drizzle-orm'
import { db } from '@/lib/db'
import { aboutInfo } from '@/lib/db/schema'
import type { AboutInfo, AboutSection } from '@/lib/types'

// ─── FETCH ABOUT SECTION ─────────────────────────────────────────
export async function fetchAboutSection(
    section: AboutSection
): Promise<AboutInfo[]> {
    return db
        .select()
        .from(aboutInfo)
        .where(eq(aboutInfo.section, section))
        .orderBy(asc(aboutInfo.displayOrder))
}
