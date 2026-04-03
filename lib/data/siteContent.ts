import { eq } from 'drizzle-orm'
import { db } from '@/lib/db'
import { siteContent } from '@/lib/db/schema'
import type { SiteContentMap } from '@/lib/types'

// ─── FETCH SINGLE SITE CONTENT VALUE ─────────────────────────────
export async function fetchSiteContent(
    key: string
): Promise<string | null> {
    const [row] = await db
        .select()
        .from(siteContent)
        .where(eq(siteContent.key, key))
        .limit(1)

    return row?.value ?? null
}

// ─── FETCH SITE CONTENT GROUP ────────────────────────────────────
export async function fetchSiteContentGroup(
    group: string
): Promise<SiteContentMap> {
    const rows = await db
        .select()
        .from(siteContent)
        .where(eq(siteContent.groupName, group))

    const map: SiteContentMap = {}
    for (const row of rows) {
        // Strip the group prefix from the key (e.g. "hero.title" → "title")
        const shortKey = row.key.startsWith(`${group}.`)
            ? row.key.slice(group.length + 1)
            : row.key
        map[shortKey] = row.value ?? ''
    }

    return map
}
