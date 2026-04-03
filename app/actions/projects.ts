'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { projects } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { slugify } from '@/lib/utils'

/* ────────────────────────────────────────────────────────────── */
/*  Types                                                         */
/* ────────────────────────────────────────────────────────────── */

export type ProjectFormState = {
    success?: boolean
    error?: string
    id?: string
} | null

/* ────────────────────────────────────────────────────────────── */
/*  Save / Upsert                                                */
/* ────────────────────────────────────────────────────────────── */

export async function saveProject(
    _prev: ProjectFormState,
    formData: FormData
): Promise<ProjectFormState> {
    try {
        const id = formData.get('id')?.toString() || null
        const title = formData.get('title')?.toString().trim() ?? ''
        const slug = formData.get('slug')?.toString().trim() || slugify(title)
        const tagline = formData.get('tagline')?.toString().trim() || null
        const descriptionRaw = formData.get('description')?.toString() || null
        const thumbnailUrl = formData.get('thumbnailUrl')?.toString() || null
        const coverUrl = formData.get('coverUrl')?.toString() || null
        const tagsRaw = formData.get('tags')?.toString().trim() || ''
        const client = formData.get('client')?.toString().trim() || null
        const role = formData.get('role')?.toString().trim() || null
        const yearStr = formData.get('year')?.toString() || ''
        const externalUrl = formData.get('externalUrl')?.toString().trim() || null
        const isFeatured = formData.get('isFeatured') === 'true'
        const isPublished = formData.get('isPublished') === 'true'
        const displayOrder = parseInt(formData.get('displayOrder')?.toString() ?? '0', 10) || 0

        if (!title) return { error: 'Title is required.' }
        if (!slug) return { error: 'Slug is required.' }

        const tags = tagsRaw.split(',').map((t) => t.trim()).filter(Boolean)
        const description = descriptionRaw ? JSON.parse(descriptionRaw) : null
        const descriptionHtml = formData.get('descriptionHtml')?.toString() || ''
        const year = yearStr ? parseInt(yearStr, 10) || null : null

        const data = {
            title, slug, tagline, description, descriptionHtml,
            thumbnailUrl, coverUrl, tags, client, role, year,
            externalUrl, isFeatured, isPublished, displayOrder,
            updatedAt: new Date(),
        }

        if (id) {
            await db.update(projects).set(data).where(eq(projects.id, id))
        } else {
            const [row] = await db.insert(projects).values({ ...data }).returning({ id: projects.id })
            revalidatePath('/x/admin/projects')
            revalidatePath('/work')
            revalidatePath('/')
            return { success: true, id: row.id }
        }

        revalidatePath('/x/admin/projects')
        revalidatePath('/work')
        revalidatePath(`/work/${slug}`)
        revalidatePath('/')
        return { success: true, id }
    } catch (err) {
        console.error('saveProject error:', err)
        return { error: 'Failed to save project.' }
    }
}

/* ────────────────────────────────────────────────────────────── */
/*  Delete                                                        */
/* ────────────────────────────────────────────────────────────── */

export async function deleteProject(id: string): Promise<{ error?: string }> {
    try {
        await db.delete(projects).where(eq(projects.id, id))
        revalidatePath('/x/admin/projects')
        revalidatePath('/work')
        revalidatePath('/')
        return {}
    } catch (err) {
        console.error('deleteProject error:', err)
        return { error: 'Failed to delete project.' }
    }
}

/* ────────────────────────────────────────────────────────────── */
/*  Reorder                                                       */
/* ────────────────────────────────────────────────────────────── */

export async function updateDisplayOrder(id: string, newOrder: number): Promise<void> {
    await db.update(projects).set({ displayOrder: newOrder, updatedAt: new Date() }).where(eq(projects.id, id))
    revalidatePath('/x/admin/projects')
    revalidatePath('/work')
}
