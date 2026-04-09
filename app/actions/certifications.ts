'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { certifications } from '@/lib/db/schema'
import { eq, asc } from 'drizzle-orm'
import { requireAdmin } from '@/lib/auth-guard'

/* ── Seed defaults if table is empty ─────────────────────────── */
const DEFAULT_CERTS = [
  { name: 'Google UX Design Certificate', issuer: 'Google', logoUrl: null as string | null, verifyUrl: null as string | null, displayOrder: 0 },
  { name: 'Adobe Certified Professional in Illustrator', issuer: 'Adobe', logoUrl: null as string | null, verifyUrl: null as string | null, displayOrder: 1 },
  { name: 'Adobe Certified Professional in Premiere Pro', issuer: 'Adobe', logoUrl: null as string | null, verifyUrl: null as string | null, displayOrder: 2 },
]

export async function getCertifications() {
  try {
    const rows = await db
      .select()
      .from(certifications)
      .where(eq(certifications.isVisible, true))
      .orderBy(asc(certifications.displayOrder))

    if (rows.length === 0) {
      await db.insert(certifications).values(DEFAULT_CERTS).onConflictDoNothing()
      return DEFAULT_CERTS.map((c, i) => ({ ...c, id: String(i), isVisible: true, createdAt: new Date(), updatedAt: new Date() }))
    }
    return rows
  } catch {
    return DEFAULT_CERTS.map((c, i) => ({ ...c, id: String(i), isVisible: true, createdAt: new Date(), updatedAt: new Date() }))
  }
}

export async function getAllCertificationsAdmin() {
  try {
    await requireAdmin()
    return await db
      .select()
      .from(certifications)
      .orderBy(asc(certifications.displayOrder))
  } catch {
    return DEFAULT_CERTS.map((c, i) => ({ ...c, id: String(i), isVisible: true, createdAt: new Date(), updatedAt: new Date() }))
  }
}

export async function updateCertification(
  id: string,
  data: Partial<{
    name: string
    issuer: string
    logoUrl: string | null
    verifyUrl: string | null
    displayOrder: number
    isVisible: boolean
  }>
): Promise<{ error?: string }> {
  try {
    await requireAdmin()
    await db
      .update(certifications)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(certifications.id, id))
    revalidatePath('/')
    revalidatePath('/about')
    revalidatePath('/x/admin/certifications')
    return {}
  } catch (err) {
    console.error('updateCertification error:', err)
    return { error: 'Failed to update.' }
  }
}

export async function createCertification(data: {
  name: string
  issuer: string
  displayOrder: number
}): Promise<{ error?: string }> {
  try {
    await requireAdmin()
    await db.insert(certifications).values({
      ...data,
      logoUrl: null,
      verifyUrl: null,
      isVisible: true,
    })
    revalidatePath('/')
    revalidatePath('/about')
    revalidatePath('/x/admin/certifications')
    return {}
  } catch (err) {
    console.error('createCertification error:', err)
    return { error: 'Failed to create certification.' }
  }
}

export async function deleteCertification(id: string): Promise<{ error?: string }> {
  try {
    await requireAdmin()
    await db.delete(certifications).where(eq(certifications.id, id))
    revalidatePath('/')
    revalidatePath('/about')
    revalidatePath('/x/admin/certifications')
    return {}
  } catch (err) {
    console.error('deleteCertification error:', err)
    return { error: 'Failed to delete certification.' }
  }
}
