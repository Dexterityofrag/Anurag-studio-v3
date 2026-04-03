import { db } from '@/lib/db'
import { socialLinks } from '@/lib/db/schema'
import { asc } from 'drizzle-orm'
import SocialLinksManager from '@/components/admin/SocialLinksManager'

export default async function AdminSocialPage() {
    const links = await db
        .select()
        .from(socialLinks)
        .orderBy(asc(socialLinks.displayOrder))

    return <SocialLinksManager links={links} />
}
