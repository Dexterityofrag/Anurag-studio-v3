'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { blogPosts } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { slugify, readingTime } from '@/lib/utils'

/* ────────────────────────────────────────────────────────────── */
/*  Types                                                         */
/* ────────────────────────────────────────────────────────────── */

export type PostFormState = {
    success?: boolean
    error?: string
    id?: string
} | null

/* ────────────────────────────────────────────────────────────── */
/*  Save / Upsert                                                */
/* ────────────────────────────────────────────────────────────── */

export async function savePost(
    _prev: PostFormState,
    formData: FormData
): Promise<PostFormState> {
    try {
        const id = formData.get('id')?.toString() || null
        const title = formData.get('title')?.toString().trim() ?? ''
        const slug = formData.get('slug')?.toString().trim() || slugify(title)
        const excerpt = formData.get('excerpt')?.toString().trim() || null
        const contentRaw = formData.get('content')?.toString() || null
        const contentHtml = formData.get('contentHtml')?.toString() || ''
        const externalUrl = formData.get('externalUrl')?.toString().trim() || null
        const coverUrl = formData.get('coverUrl')?.toString() || null
        const tagsRaw = formData.get('tags')?.toString().trim() || ''
        const isPublished = formData.get('isPublished') === 'true'
        const publishedAtRaw = formData.get('publishedAt')?.toString() || ''
        const readingOverride = formData.get('readingTimeMinutes')?.toString() || ''
        const metaTitle = formData.get('metaTitle')?.toString().trim() || null
        const metaDescription = formData.get('metaDescription')?.toString().trim() || null

        if (!title) return { error: 'Title is required.' }
        if (!slug) return { error: 'Slug is required.' }

        const tags = tagsRaw.split(',').map((t) => t.trim()).filter(Boolean)
        const content = contentRaw ? JSON.parse(contentRaw) : null
        const readingTimeMinutes = readingOverride
            ? parseInt(readingOverride, 10) || 5
            : readingTime(contentHtml)

        let publishedAt: Date | null = null
        if (publishedAtRaw) {
            publishedAt = new Date(publishedAtRaw)
        } else if (isPublished) {
            publishedAt = new Date()
        }

        const data = {
            title, slug, excerpt, content, contentHtml, externalUrl,
            coverUrl, tags, isPublished, publishedAt, readingTimeMinutes,
            metaTitle, metaDescription, updatedAt: new Date(),
        }

        if (id) {
            await db.update(blogPosts).set(data).where(eq(blogPosts.id, id))
        } else {
            const [row] = await db.insert(blogPosts).values({ ...data }).returning({ id: blogPosts.id })
            revalidatePath('/x/admin/posts')
            revalidatePath('/blog')
            revalidatePath('/')
            return { success: true, id: row.id }
        }

        revalidatePath('/x/admin/posts')
        revalidatePath('/blog')
        revalidatePath(`/blog/${slug}`)
        revalidatePath('/')
        return { success: true, id }
    } catch (err) {
        console.error('savePost error:', err)
        return { error: 'Failed to save post.' }
    }
}

/* ────────────────────────────────────────────────────────────── */
/*  Delete                                                        */
/* ────────────────────────────────────────────────────────────── */

export async function deletePost(id: string): Promise<{ error?: string }> {
    try {
        await db.delete(blogPosts).where(eq(blogPosts.id, id))
        revalidatePath('/x/admin/posts')
        revalidatePath('/blog')
        revalidatePath('/')
        return {}
    } catch (err) {
        console.error('deletePost error:', err)
        return { error: 'Failed to delete post.' }
    }
}
