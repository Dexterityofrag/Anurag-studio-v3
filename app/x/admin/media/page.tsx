import { db } from '@/lib/db'
import { media } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'
import MediaLibrary from '@/components/admin/MediaLibrary'

export default async function AdminMediaPage() {
    const files = await db
        .select()
        .from(media)
        .orderBy(desc(media.createdAt))

    return <MediaLibrary files={files} />
}
