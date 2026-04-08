import { db } from '@/lib/db'
import { aboutInfo } from '@/lib/db/schema'
import { asc } from 'drizzle-orm'
import AboutManager from '@/components/admin/AboutManager'
export const dynamic = 'force-dynamic'
export const revalidate = 0
export default async function AdminAboutPage() {
    const entries = await db
        .select()
        .from(aboutInfo)
        .orderBy(asc(aboutInfo.displayOrder))

    return <AboutManager entries={entries} />
}
