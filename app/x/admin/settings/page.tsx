import { db } from '@/lib/db'
import { siteContent } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import SettingsEditor from '@/components/admin/SettingsEditor'
import { upsertContentKeys } from '@/app/actions/admin'

// ─── Default settings keys ────────────────────────────────────
// Run as a top-level module-scope async (Next.js server component)
// This is a one-time seed — upsertContentKeys is idempotent.
const DEFAULTS = [
    { key: 'hero.eyebrow',        value: 'NAVIGATING THE UNKNOWN, PIXEL BY PIXEL.', groupName: 'hero',     contentType: 'text', description: 'Eyebrow text above name' },
    { key: 'hero.subtitle',       value: 'Precision structure, bold creative vision.', groupName: 'hero',  contentType: 'text', description: 'Tagline below name' },
    { key: 'hero.badge',          value: 'Available for work',                       groupName: 'hero',    contentType: 'text', description: 'Availability badge label' },
    { key: 'settings.accentColor', value: '#00FF94',                                 groupName: 'settings', contentType: 'text', description: 'Brand accent color hex' },
]

export default async function AdminSettingsPage() {
    // Seed defaults without revalidatePath (safe inside server component fetch flow)
    try {
        await db
            .insert(siteContent)
            .values(DEFAULTS.map((d) => ({ ...d, updatedAt: new Date() })))
            .onConflictDoNothing()
    } catch { /* DB not connected in preview — graceful skip */ }

    const rows = await db
        .select()
        .from(siteContent)
        .where(eq(siteContent.groupName, 'settings'))
        .catch(() => [])

    const map: Record<string, string> = {}
    for (const r of rows) map[r.key] = r.value ?? ''

    return <SettingsEditor settings={map} />
}

// Re-export for use in other server actions that need to seed on demand
export { upsertContentKeys }
