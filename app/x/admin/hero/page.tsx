import { db } from '@/lib/db'
import { siteContent } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import HeroEditor from '@/components/admin/HeroEditor'

/* ─── Seed hero keys if not yet in DB ──────────────────────── */
const HERO_KEYS = [
  {
    key: 'hero.eyebrow',
    value: 'NAVIGATING THE UNKNOWN, PIXEL BY PIXEL.',
    groupName: 'hero',
    contentType: 'text',
    description: 'Eyebrow text above the name (mono, wide tracking)',
  },
  {
    key: 'hero.subtitle',
    value: 'Precision structure, bold creative vision.',
    groupName: 'hero',
    contentType: 'text',
    description: 'Tagline below the name',
  },
  {
    key: 'hero.badge',
    value: 'Available for work',
    groupName: 'hero',
    contentType: 'text',
    description: 'Status badge label',
  },
]

export default async function AdminHeroPage() {
  // Seed hero keys directly via DB (no revalidatePath - safe during render)
  await Promise.all(
    HERO_KEYS.map((k) =>
      db
        .insert(siteContent)
        .values({ key: k.key, value: k.value, groupName: k.groupName, contentType: k.contentType, description: k.description, updatedAt: new Date() })
        .onConflictDoNothing()
    )
  ).catch(() => null)

  // Fetch fresh after upsert
  const rows = await db
    .select()
    .from(siteContent)
    .where(eq(siteContent.groupName, 'hero'))

  return <HeroEditor rows={rows} />
}
