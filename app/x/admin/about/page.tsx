import { db } from '@/lib/db'
import { aboutInfo, siteContent } from '@/lib/db/schema'
import { asc, inArray } from 'drizzle-orm'
import AboutManager from '@/components/admin/AboutManager'
import AboutPageSectionsEditor from '@/components/admin/AboutPageSectionsEditor'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const ABOUT_PAGE_DEFAULTS = [
  { key: 'about_page.offscreen.title',       value: 'Gaming\n& Music',                                groupName: 'about_page', description: 'Off-Screen section title' },
  { key: 'about_page.offscreen.body',        value: "Off screen, I'm deeply into gaming and music. Games inspire the way I think about immersion, flow, interaction, and world-building, while music shapes my sense of rhythm, emotion, and atmosphere in design. Both constantly influence how I create experiences that feel alive, intentional, and memorable.", groupName: 'about_page', description: 'Off-Screen section body' },
  { key: 'about_page.philosophy1.index',     value: '03 / THE DRIVE',                                 groupName: 'about_page', description: 'Philosophy 1 index label' },
  { key: 'about_page.philosophy1.title',     value: 'Always',                                         groupName: 'about_page', description: 'Philosophy 1 title' },
  { key: 'about_page.philosophy1.subtitle',  value: 'The Best',                                       groupName: 'about_page', description: 'Philosophy 1 subtitle' },
  { key: 'about_page.philosophy1.body',      value: "I set a simple standard for myself: be the best in the room, in the craft, in the work. Not through obsession with perfection, but through genuine care for every detail. Whether it's a micro-interaction or a full product ecosystem, I treat every pixel as a decision, and every decision as intentional. The drive to improve never stops.", groupName: 'about_page', description: 'Philosophy 1 body' },
  { key: 'about_page.philosophy2.index',     value: '04 / THE VISION',                                groupName: 'about_page', description: 'Philosophy 2 index label' },
  { key: 'about_page.philosophy2.title',     value: 'Design',                                         groupName: 'about_page', description: 'Philosophy 2 title' },
  { key: 'about_page.philosophy2.subtitle',  value: 'Beyond Screen',                                  groupName: 'about_page', description: 'Philosophy 2 subtitle' },
  { key: 'about_page.philosophy2.body',      value: "Jony Ive didn't just design products; he shaped how a generation thinks about objects, simplicity, and intention. That level of impact is what drives me. I want to build things that go beyond interfaces: experiences that shape how people feel, think, and move through the world. Design as culture. Design as legacy.", groupName: 'about_page', description: 'Philosophy 2 body' },
  { key: 'about_page.foundation1.num',       value: '01',                                             groupName: 'about_page', description: 'Foundation 1 number' },
  { key: 'about_page.foundation1.title',     value: 'Outcome-Driven',                                 groupName: 'about_page', description: 'Foundation 1 title' },
  { key: 'about_page.foundation1.body',      value: "Design that ships and converts. Every decision is anchored in real impact, not just aesthetics. If it doesn't move the needle, it doesn't belong on the canvas.", groupName: 'about_page', description: 'Foundation 1 body' },
  { key: 'about_page.foundation2.num',       value: '02',                                             groupName: 'about_page', description: 'Foundation 2 number' },
  { key: 'about_page.foundation2.title',     value: 'Systems Thinking',                               groupName: 'about_page', description: 'Foundation 2 title' },
  { key: 'about_page.foundation2.body',      value: "Scalable, not one-off. I build components, flows, and logic that flex without breaking. Good design isn't a single screen; it's a language that works at every scale.", groupName: 'about_page', description: 'Foundation 2 body' },
  { key: 'about_page.foundation3.num',       value: '03',                                             groupName: 'about_page', description: 'Foundation 3 number' },
  { key: 'about_page.foundation3.title',     value: 'AI-Assisted',                                   groupName: 'about_page', description: 'Foundation 3 title' },
  { key: 'about_page.foundation3.body',      value: "Leveraging Claude, ChatGPT, and Gemini as creative co-pilots for research, copy, rapid prototyping, and code. AI amplifies craft; it doesn't replace it.", groupName: 'about_page', description: 'Foundation 3 body' },
]

export default async function AdminAboutPage() {
  const [entries] = await Promise.all([
    db.select().from(aboutInfo).orderBy(asc(aboutInfo.displayOrder)),
    db.insert(siteContent)
      .values(ABOUT_PAGE_DEFAULTS.map(d => ({ ...d, contentType: 'text', updatedAt: new Date() })))
      .onConflictDoNothing()
      .catch(() => null),
  ])

  const keys = ABOUT_PAGE_DEFAULTS.map(d => d.key)
  const sectionRows = await db
    .select({ key: siteContent.key, value: siteContent.value })
    .from(siteContent)
    .where(inArray(siteContent.key, keys))
    .catch(() => [] as { key: string; value: string | null }[])

  return (
    <>
      <AboutManager entries={entries} />
      <AboutPageSectionsEditor rows={sectionRows} />
    </>
  )
}
