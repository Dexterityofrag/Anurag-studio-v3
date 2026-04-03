import { eq, asc } from 'drizzle-orm'
import { db } from '@/lib/db'
import { socialLinks } from '@/lib/db/schema'
import type { SocialLink } from '@/lib/types'

// ─── FETCH SOCIAL LINKS ─────────────────────────────────────────
export async function fetchSocialLinks(): Promise<SocialLink[]> {
    return db
        .select()
        .from(socialLinks)
        .where(eq(socialLinks.isVisible, true))
        .orderBy(asc(socialLinks.displayOrder))
}
