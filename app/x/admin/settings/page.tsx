import { db } from '@/lib/db'
import { siteContent } from '@/lib/db/schema'
import { eq, or } from 'drizzle-orm'
import SettingsEditor from '@/components/admin/SettingsEditor'
import CredentialsEditor from '@/components/admin/CredentialsEditor'
import { upsertContentKeys, getAdminEmail } from '@/app/actions/admin'

const DEFAULTS = [
    { key: 'hero.eyebrow', value: 'NAVIGATING THE UNKNOWN, PIXEL BY PIXEL.', groupName: 'hero', contentType: 'text', description: 'Eyebrow text above name' },
    { key: 'hero.subtitle', value: 'Precision structure, bold creative vision.', groupName: 'hero', contentType: 'text', description: 'Tagline below name' },
    { key: 'hero.badge', value: 'Available for work', groupName: 'hero', contentType: 'text', description: 'Availability badge label' },
    { key: 'settings.accentColor', value: '#00FF94', groupName: 'settings', contentType: 'text', description: 'Brand accent color hex' },
    { key: 'contact_cta.heading', value: "Let's Talk.", groupName: 'contact_cta', contentType: 'text', description: 'Contact CTA heading' },
    { key: 'contact_cta.email', value: 'hello@anurag.studio', groupName: 'contact_cta', contentType: 'text', description: 'Contact CTA email' },
]
export const dynamic = 'force-dynamic'
export const revalidate = 0
export default async function AdminSettingsPage() {
    try {
        await db
            .insert(siteContent)
            .values(DEFAULTS.map((d) => ({ ...d, updatedAt: new Date() })))
            .onConflictDoNothing()
    } catch { /* DB not connected in preview — graceful skip */ }

    const [rows, adminEmail] = await Promise.all([
        db
            .select()
            .from(siteContent)
            .where(or(eq(siteContent.groupName, 'settings'), eq(siteContent.groupName, 'contact_cta')))
            .catch(() => []),
        getAdminEmail(),
    ])

    const map: Record<string, string> = {}
    for (const r of rows) map[r.key] = r.value ?? ''

    return (
        <>
            <SettingsEditor settings={map} />
            <div style={{ marginTop: '32px' }}>
                <CredentialsEditor currentEmail={adminEmail} />
            </div>
        </>
    )
}

// Re-export for use in other server actions that need to seed on demand
export { upsertContentKeys }
