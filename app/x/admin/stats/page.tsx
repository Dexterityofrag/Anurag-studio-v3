import { db } from '@/lib/db'
import { siteContent } from '@/lib/db/schema'
import { inArray } from 'drizzle-orm'
import StatsEditor from '@/components/admin/StatsEditor'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const STATS_DEFAULTS = [
  // Home stats
  { key: 'home_stats.item1.display', value: '1.5+', groupName: 'home_stats', description: 'Home stat 1 value' },
  { key: 'home_stats.item1.label',   value: 'Years Experience', groupName: 'home_stats', description: 'Home stat 1 label' },
  { key: 'home_stats.item2.display', value: '5+',   groupName: 'home_stats', description: 'Home stat 2 value' },
  { key: 'home_stats.item2.label',   value: 'Projects Shipped', groupName: 'home_stats', description: 'Home stat 2 label' },
  { key: 'home_stats.item3.display', value: '100%', groupName: 'home_stats', description: 'Home stat 3 value' },
  { key: 'home_stats.item3.label',   value: 'On-Time Delivery', groupName: 'home_stats', description: 'Home stat 3 label' },
  { key: 'home_stats.item4.display', value: '5+',   groupName: 'home_stats', description: 'Home stat 4 value' },
  { key: 'home_stats.item4.label',   value: 'Happy Clients',    groupName: 'home_stats', description: 'Home stat 4 label' },
  // About stats
  { key: 'about_stats.item1.display', value: '1.5+', groupName: 'about_stats', description: 'About stat 1 value' },
  { key: 'about_stats.item1.label',   value: 'Years Experience', groupName: 'about_stats', description: 'About stat 1 label' },
  { key: 'about_stats.item2.display', value: '4+',   groupName: 'about_stats', description: 'About stat 2 value' },
  { key: 'about_stats.item2.label',   value: 'Projects Shipped', groupName: 'about_stats', description: 'About stat 2 label' },
  { key: 'about_stats.item3.display', value: '3',    groupName: 'about_stats', description: 'About stat 3 value' },
  { key: 'about_stats.item3.label',   value: 'Certifications',  groupName: 'about_stats', description: 'About stat 3 label' },
]

export default async function AdminStatsPage() {
  await db
    .insert(siteContent)
    .values(STATS_DEFAULTS.map(d => ({ ...d, contentType: 'text', updatedAt: new Date() })))
    .onConflictDoNothing()
    .catch(() => null)

  const keys = STATS_DEFAULTS.map(d => d.key)
  const rows = await db
    .select({ key: siteContent.key, value: siteContent.value })
    .from(siteContent)
    .where(inArray(siteContent.key, keys))
    .catch(() => [] as { key: string; value: string | null }[])

  return <StatsEditor rows={rows} />
}
