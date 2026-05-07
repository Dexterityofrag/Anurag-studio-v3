import { db } from '@/lib/db'
import { siteContent } from '@/lib/db/schema'
import { inArray } from 'drizzle-orm'
import IntroPanelsEditor from '@/components/admin/IntroPanelsEditor'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const INTRO_DEFAULTS = [
  { key: 'intro_panels.panel1.body', value: 'I design for those who crave experiences that are unforgettable', groupName: 'intro_panels', description: 'Panel 1 statement text' },
  { key: 'intro_panels.panel1.em',   value: 'unforgettable', groupName: 'intro_panels', description: 'Panel 1 emphasized word' },
  { key: 'intro_panels.panel1.sub',  value: 'Experience Design', groupName: 'intro_panels', description: 'Panel 1 subtitle label' },
  { key: 'intro_panels.panel2.body', value: "I don't just deliver design. I deliver outcomes", groupName: 'intro_panels', description: 'Panel 2 statement text' },
  { key: 'intro_panels.panel2.em',   value: 'outcomes', groupName: 'intro_panels', description: 'Panel 2 emphasized word' },
  { key: 'intro_panels.panel2.sub',  value: 'Strategy-first thinking', groupName: 'intro_panels', description: 'Panel 2 subtitle label' },
  { key: 'intro_panels.panel3.body', value: 'Every pixel is a decision. Every decision is intentional', groupName: 'intro_panels', description: 'Panel 3 statement text' },
  { key: 'intro_panels.panel3.em',   value: 'intentional', groupName: 'intro_panels', description: 'Panel 3 emphasized word' },
  { key: 'intro_panels.panel3.sub',  value: 'Craft + precision', groupName: 'intro_panels', description: 'Panel 3 subtitle label' },
  { key: 'about_teaser.tagline', value: 'Systems that scale. Typography that respects the reader.\nInteractions that feel inevitable.', groupName: 'about_teaser', description: 'About teaser tagline on home page' },
]

export default async function AdminIntroPage() {
  await db
    .insert(siteContent)
    .values(INTRO_DEFAULTS.map(d => ({ ...d, contentType: 'text', updatedAt: new Date() })))
    .onConflictDoNothing()
    .catch(() => null)

  const keys = INTRO_DEFAULTS.map(d => d.key)
  const rows = await db
    .select({ key: siteContent.key, value: siteContent.value })
    .from(siteContent)
    .where(inArray(siteContent.key, keys))
    .catch(() => [] as { key: string; value: string | null }[])

  return <IntroPanelsEditor rows={rows} />
}
