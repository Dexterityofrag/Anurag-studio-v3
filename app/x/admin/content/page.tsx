import { db } from '@/lib/db'
import { siteContent } from '@/lib/db/schema'
import { asc } from 'drizzle-orm'
import ContentEditor from '@/components/admin/ContentEditor'
import { seedDefaultContent } from '@/app/actions/admin'

export default async function AdminContentPage() {
    let rows = await db
        .select()
        .from(siteContent)
        .orderBy(asc(siteContent.groupName), asc(siteContent.key))

    // Auto-seed defaults if table is empty
    if (rows.length === 0) {
        await seedDefaultContent()
        rows = await db
            .select()
            .from(siteContent)
            .orderBy(asc(siteContent.groupName), asc(siteContent.key))
    }

    // Group by groupName
    const grouped: Record<string, typeof rows> = {}
    for (const row of rows) {
        const g = row.groupName ?? 'other'
        if (!grouped[g]) grouped[g] = []
        grouped[g].push(row)
    }

    return <ContentEditor groups={grouped} />
}
