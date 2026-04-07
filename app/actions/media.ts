'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { media } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { deleteObject } from '@/lib/storage/spaces'
import { requireAdmin } from '@/lib/auth-guard'

export async function saveMediaRecord(data: {
    filename: string
    storagePath: string
    url: string
    mimeType: string
    folder: string
    width?: number
    height?: number
}): Promise<{ id: string } | { error: string }> {
    try {
        await requireAdmin()
        const [row] = await db
            .insert(media)
            .values({
                filename: data.filename,
                storagePath: data.storagePath,
                url: data.url,
                mimeType: data.mimeType,
                folder: data.folder,
                width: data.width,
                height: data.height,
            })
            .returning({ id: media.id })
        revalidatePath('/x/admin/media')
        return { id: row.id }
    } catch (err) {
        console.error('saveMediaRecord error:', err)
        return { error: 'Failed to save media record.' }
    }
}

export async function updateMediaAlt(
    id: string,
    altText: string
): Promise<{ error?: string }> {
    try {
        await requireAdmin()
        await db.update(media).set({ altText }).where(eq(media.id, id))
        revalidatePath('/x/admin/media')
        return {}
    } catch (err) {
        console.error('updateMediaAlt error:', err)
        return { error: 'Failed to update.' }
    }
}

export async function deleteMedia(id: string): Promise<{ error?: string }> {
    try {
        await requireAdmin()
        // Get the storage path
        const [row] = await db
            .select({ storagePath: media.storagePath })
            .from(media)
            .where(eq(media.id, id))
            .limit(1)

        if (row?.storagePath) {
            await deleteObject(row.storagePath)
        }

        await db.delete(media).where(eq(media.id, id))
        revalidatePath('/x/admin/media')
        return {}
    } catch (err) {
        console.error('deleteMedia error:', err)
        return { error: 'Failed to delete.' }
    }
}
