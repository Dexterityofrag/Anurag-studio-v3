'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { partners } from '@/lib/db/schema'
import { eq, asc } from 'drizzle-orm'
import { requireAdmin } from '@/lib/auth-guard'
import { makeObjectPublic } from '@/lib/storage/spaces'

/**
 * Extract the Spaces object key from a CDN URL.
 * e.g. "https://bucket.region.cdn.digitaloceanspaces.com/partners/file.png"
 *   → "partners/file.png"
 */
function extractKeyFromUrl(url: string): string | null {
  try {
    const u = new URL(url)
    // Remove leading slash
    return u.pathname.startsWith('/') ? u.pathname.slice(1) : u.pathname
  } catch {
    return null
  }
}

/**
 * Fix ACL on an existing partner image — makes it publicly readable.
 */
export async function fixPartnerImageAcl(
  imageUrl: string
): Promise<{ error?: string }> {
  try {
    await requireAdmin()
    const key = extractKeyFromUrl(imageUrl)
    if (!key) return { error: 'Invalid image URL.' }
    await makeObjectPublic(key)
    revalidatePath('/')
    revalidatePath('/x/admin/partners')
    return {}
  } catch (err) {
    console.error('fixPartnerImageAcl error:', err)
    return { error: 'Failed to fix image ACL.' }
  }
}

/* ── Seed defaults if table is empty ─────────────────────────── */
const DEFAULT_PARTNERS = [
  { name: 'EVOLUSIS',  sector: 'AI / SAAS PLATFORM',      link: 'https://evolusis.com',  external: true,  comingSoon: false, previewImageUrl: null as string | null, displayOrder: 0 },
  { name: 'LOCALGO',   sector: 'LOCAL SERVICES / APP',     link: '/coming-soon',           external: false, comingSoon: true,  previewImageUrl: null as string | null, displayOrder: 1 },
  { name: 'BOGAMES',   sector: 'GAMING / ENTERTAINMENT',   link: '/coming-soon',           external: false, comingSoon: true,  previewImageUrl: null as string | null, displayOrder: 2 },
  { name: 'FREELANCE', sector: 'PRODUCT DESIGN / UI',      link: '/coming-soon',           external: false, comingSoon: true,  previewImageUrl: null as string | null, displayOrder: 3 },
]

export async function getPartners() {
  try {
    const rows = await db
      .select()
      .from(partners)
      .where(eq(partners.isVisible, true))
      .orderBy(asc(partners.displayOrder))

    if (rows.length === 0) {
      // Seed defaults on first run
      await db.insert(partners).values(DEFAULT_PARTNERS).onConflictDoNothing()
      return DEFAULT_PARTNERS.map((p, i) => ({ ...p, id: String(i), isVisible: true, createdAt: new Date(), updatedAt: new Date() }))
    }
    return rows
  } catch {
    // DB not available — return static fallback
    return DEFAULT_PARTNERS.map((p, i) => ({ ...p, id: String(i), isVisible: true, createdAt: new Date(), updatedAt: new Date() }))
  }
}

export async function updatePartnerPreview(
  id: string,
  previewImageUrl: string | null
): Promise<{ error?: string }> {
  try {
    await requireAdmin()
    await db
      .update(partners)
      .set({ previewImageUrl, updatedAt: new Date() })
      .where(eq(partners.id, id))
    revalidatePath('/')
    return {}
  } catch (err) {
    console.error('updatePartnerPreview error:', err)
    return { error: 'Failed to update.' }
  }
}

export async function updatePartner(
  id: string,
  data: Partial<{
    name: string
    sector: string
    link: string
    external: boolean
    comingSoon: boolean
    previewImageUrl: string | null
    displayOrder: number
    isVisible: boolean
  }>
): Promise<{ error?: string }> {
  try {
    await requireAdmin()
    await db
      .update(partners)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(partners.id, id))
    revalidatePath('/')
    revalidatePath('/x/admin/partners')
    return {}
  } catch (err) {
    console.error('updatePartner error:', err)
    return { error: 'Failed to update.' }
  }
}

export async function getAllPartnersAdmin() {
  try {
    await requireAdmin()
    return await db
      .select()
      .from(partners)
      .orderBy(asc(partners.displayOrder))
  } catch {
    return DEFAULT_PARTNERS.map((p, i) => ({ ...p, id: String(i), isVisible: true, createdAt: new Date(), updatedAt: new Date() }))
  }
}

export async function createPartner(data: {
  name: string
  sector: string
  link: string
  external: boolean
  comingSoon: boolean
  displayOrder: number
}): Promise<{ error?: string }> {
  try {
    await requireAdmin()
    await db.insert(partners).values({
      ...data,
      previewImageUrl: null,
      isVisible: true,
    })
    revalidatePath('/')
    revalidatePath('/x/admin/partners')
    return {}
  } catch (err) {
    console.error('createPartner error:', err)
    return { error: 'Failed to create partner.' }
  }
}

export async function deletePartner(id: string): Promise<{ error?: string }> {
  try {
    await requireAdmin()
    await db.delete(partners).where(eq(partners.id, id))
    revalidatePath('/')
    revalidatePath('/x/admin/partners')
    return {}
  } catch (err) {
    console.error('deletePartner error:', err)
    return { error: 'Failed to delete partner.' }
  }
}
