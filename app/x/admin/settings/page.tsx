import { db } from '@/lib/db'
import { siteContent } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { seedDefaultContent } from '@/app/actions/admin'
import SettingsEditor from '@/components/admin/SettingsEditor'

export default async function AdminSettingsPage() {
    // Ensure settings keys exist
    await seedDefaultContent()

    const rows = await db
        .select()
        .from(siteContent)
        .where(eq(siteContent.groupName, 'settings'))

    const map: Record<string, string> = {}
    for (const r of rows) map[r.key] = r.value ?? ''

    return <SettingsEditor settings={map} />
}
