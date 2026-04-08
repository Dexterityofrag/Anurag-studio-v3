'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { siteContent, socialLinks, aboutInfo, adminCredentials } from '@/lib/db/schema'
import { eq, asc } from 'drizzle-orm'
import type { AboutMetadata } from '@/lib/db/schema'
import { requireAdmin } from '@/lib/auth-guard'
import bcrypt from 'bcryptjs'

/* ═════════════════════════════════════════════════════════════ */
/*  SITE CONTENT                                                  */
/* ═════════════════════════════════════════════════════════════ */

export async function saveContentGroup(
    entries: { id: string; value: string }[]
): Promise<{ error?: string }> {
    try {
        await requireAdmin()
        await Promise.all(
            entries.map((e) =>
                db
                    .update(siteContent)
                    .set({ value: e.value, updatedAt: new Date() })
                    .where(eq(siteContent.id, e.id))
            )
        )
        revalidatePath('/')
        revalidatePath('/about')
        return {}
    } catch (err) {
        console.error('saveContentGroup error:', err)
        return { error: 'Failed to save.' }
    }
}

/* ─── Upsert by key (used for settings and seeding) ───────── */
export async function upsertContentKeys(
    entries: {
        key: string
        value: string
        groupName: string
        contentType?: string
        description?: string
    }[]
): Promise<{ error?: string }> {
    try {
        await requireAdmin()
        await Promise.all(
            entries.map((e) =>
                db
                    .insert(siteContent)
                    .values({
                        key: e.key,
                        value: e.value,
                        groupName: e.groupName,
                        contentType: e.contentType ?? 'text',
                        description: e.description ?? null,
                        updatedAt: new Date(),
                    })
                    .onConflictDoUpdate({
                        target: siteContent.key,
                        set: { value: e.value, updatedAt: new Date() },
                    })
            )
        )
        revalidatePath('/')
        revalidatePath('/x/admin/content')
        revalidatePath('/x/admin/settings')
        return {}
    } catch (err) {
        console.error('upsertContentKeys error:', err)
        return { error: 'Failed to save.' }
    }
}

/* ─── Seed defaults (safe to call multiple times) ─────────── */
export async function seedDefaultContent(): Promise<{ error?: string }> {
    const defaults = [
        { key: 'hero.eyebrow', value: 'NAVIGATING THE UNKNOWN, PIXEL BY PIXEL.', contentType: 'text', groupName: 'hero', description: 'Eyebrow text above main name (mono, wide-tracked)' },
        { key: 'hero.subtitle', value: 'Precision structure, bold creative vision.', contentType: 'text', groupName: 'hero', description: 'Tagline below main name' },
        { key: 'hero.badge', value: 'Available for work', contentType: 'text', groupName: 'hero', description: 'Status badge label' },
        { key: 'settings.accentColor', value: '#00FF94', contentType: 'text', groupName: 'settings', description: 'Brand accent color (hex, e.g. #00FF94)' },
    ]
    try {
        await db
            .insert(siteContent)
            .values(defaults.map((d) => ({ ...d, updatedAt: new Date() })))
            .onConflictDoNothing()
        return {}
    } catch (err) {
        console.error('seedDefaultContent error:', err)
        return { error: 'Failed to seed.' }
    }
}

/* ═════════════════════════════════════════════════════════════ */
/*  SOCIAL LINKS                                                  */
/* ═════════════════════════════════════════════════════════════ */

export type SocialFormState = { success?: boolean; error?: string } | null

export async function saveSocialLink(
    _prev: SocialFormState,
    formData: FormData
): Promise<SocialFormState> {
    try {
        await requireAdmin()
        const id = formData.get('id')?.toString() || null
        const platform = formData.get('platform')?.toString().trim() ?? ''
        const url = formData.get('url')?.toString().trim() ?? ''
        const iconName = formData.get('iconName')?.toString().trim() || null
        const displayOrder =
            parseInt(formData.get('displayOrder')?.toString() ?? '0', 10) || 0
        const isVisible = formData.get('isVisible') === 'true'

        if (!platform || !url)
            return { error: 'Platform and URL are required.' }

        const data = { platform, url, iconName, displayOrder, isVisible }

        if (id) {
            await db.update(socialLinks).set(data).where(eq(socialLinks.id, id))
        } else {
            await db.insert(socialLinks).values(data)
        }
        revalidatePath('/x/admin/social')
        return { success: true }
    } catch (err) {
        console.error('saveSocialLink error:', err)
        return { error: 'Failed to save.' }
    }
}

export async function deleteSocialLink(id: string): Promise<{ error?: string }> {
    try {
        await requireAdmin()
        await db.delete(socialLinks).where(eq(socialLinks.id, id))
        revalidatePath('/x/admin/social')
        return {}
    } catch (err) {
        console.error('deleteSocialLink error:', err)
        return { error: 'Failed to delete.' }
    }
}

/* ═════════════════════════════════════════════════════════════ */
/*  ABOUT INFO                                                    */
/* ═════════════════════════════════════════════════════════════ */

export type AboutFormState = { success?: boolean; error?: string } | null

export async function saveAboutEntry(
    _prev: AboutFormState,
    formData: FormData
): Promise<AboutFormState> {
    try {
        await requireAdmin()
        const id = formData.get('id')?.toString() || null
        const section = formData.get('section')?.toString().trim() ?? ''
        const title = formData.get('title')?.toString().trim() || null
        const content = formData.get('content')?.toString().trim() || null
        const displayOrder =
            parseInt(formData.get('displayOrder')?.toString() ?? '0', 10) || 0

        if (!section) return { error: 'Section is required.' }

        // Build metadata from form fields
        const metadata: AboutMetadata = {}
        const company = formData.get('meta_company')?.toString().trim()
        const startDate = formData.get('meta_start_date')?.toString().trim()
        const endDate = formData.get('meta_end_date')?.toString().trim()
        const location = formData.get('meta_location')?.toString().trim()
        const tagsRaw = formData.get('meta_tags')?.toString().trim()
        const proficiency = formData.get('meta_proficiency')?.toString()

        if (company) metadata.company = company
        if (startDate) metadata.start_date = startDate
        if (endDate) metadata.end_date = endDate
        if (location) metadata.location = location
        if (tagsRaw) metadata.tags = tagsRaw.split(',').map((s) => s.trim()).filter(Boolean)
        if (proficiency) metadata.proficiency = parseInt(proficiency, 10) || 0

        const data = { section, title, content, metadata, displayOrder }

        if (id) {
            await db.update(aboutInfo).set(data).where(eq(aboutInfo.id, id))
        } else {
            await db.insert(aboutInfo).values(data)
        }
        revalidatePath('/x/admin/about')
        revalidatePath('/about')
        return { success: true }
    } catch (err) {
        console.error('saveAboutEntry error:', err)
        return { error: 'Failed to save.' }
    }
}

export async function deleteAboutEntry(id: string): Promise<{ error?: string }> {
    try {
        await requireAdmin()
        await db.delete(aboutInfo).where(eq(aboutInfo.id, id))
        revalidatePath('/x/admin/about')
        revalidatePath('/about')
        return {}
    } catch (err) {
        console.error('deleteAboutEntry error:', err)
        return { error: 'Failed to delete.' }
    }
}

/* ═════════════════════════════════════════════════════════════ */
/*  ADMIN CREDENTIALS                                             */
/* ═════════════════════════════════════════════════════════════ */

export async function updateAdminCredentials(data: {
    currentPassword: string
    newEmail: string
    newPassword?: string // optional — only update if provided
}): Promise<{ error?: string; success?: boolean }> {
    try {
        await requireAdmin()

        const { currentPassword, newEmail, newPassword } = data

        if (!currentPassword || !newEmail?.trim()) {
            return { error: 'Current password and new email are required.' }
        }

        // ── Verify current password against DB first, then env ──
        let verified = false

        const [dbCred] = await db
            .select()
            .from(adminCredentials)
            .limit(1)
            .catch(() => [] as any[])

        if (dbCred) {
            verified = await bcrypt.compare(currentPassword, dbCred.passwordHash)
        } else {
            // Fallback: verify against env vars
            const envHash = process.env.ADMIN_PASSWORD_HASH
            if (envHash) {
                verified = await bcrypt.compare(currentPassword, envHash)
            }
        }

        if (!verified) {
            return { error: 'Current password is incorrect.' }
        }

        // ── Build update / insert payload ────────────────────────
        const passwordHash = newPassword?.trim()
            ? await bcrypt.hash(newPassword.trim(), 12)
            : dbCred?.passwordHash ?? (await bcrypt.hash(currentPassword, 12))

        if (dbCred) {
            await db
                .update(adminCredentials)
                .set({
                    email: newEmail.trim(),
                    passwordHash,
                    updatedAt: new Date(),
                })
                .where(eq(adminCredentials.id, dbCred.id))
        } else {
            await db.insert(adminCredentials).values({
                email: newEmail.trim(),
                passwordHash,
            })
        }

        return { success: true }
    } catch (err) {
        console.error('updateAdminCredentials error:', err)
        return { error: 'Failed to update credentials.' }
    }
}

/** Fetch the current admin email (for pre-filling the form) */
export async function getAdminEmail(): Promise<string> {
    try {
        const [dbCred] = await db
            .select({ email: adminCredentials.email })
            .from(adminCredentials)
            .limit(1)
        if (dbCred) return dbCred.email
    } catch { /* fallback */ }
    return process.env.ADMIN_EMAIL ?? ''
}
