import { eq, and, asc, gt, lt } from 'drizzle-orm'
import { db } from '@/lib/db'
import { projects, testimonials } from '@/lib/db/schema'
import type { Project, ProjectWithTestimonials } from '@/lib/types'

// ─── FETCH PROJECTS ──────────────────────────────────────────────
export async function fetchProjects(
    options?: { featured?: boolean; tag?: string }
): Promise<Project[]> {
    const conditions = [eq(projects.isPublished, true)]

    if (options?.featured) {
        conditions.push(eq(projects.isFeatured, true))
    }

    let rows = await db
        .select()
        .from(projects)
        .where(and(...conditions))
        .orderBy(asc(projects.displayOrder))

    // If requesting featured but none exist, fall back to all published
    if (options?.featured && rows.length === 0) {
        rows = await db
            .select()
            .from(projects)
            .where(eq(projects.isPublished, true))
            .orderBy(asc(projects.displayOrder))
    }

    if (options?.tag) {
        return rows.filter((p) => p.tags?.includes(options.tag!))
    }

    return rows
}

// ─── FETCH PROJECT BY SLUG (with testimonials) ──────────────────
export async function fetchProjectBySlug(
    slug: string
): Promise<ProjectWithTestimonials | null> {
    const [project] = await db
        .select()
        .from(projects)
        .where(and(eq(projects.slug, slug), eq(projects.isPublished, true)))
        .limit(1)

    if (!project) return null

    const projectTestimonials = await db
        .select()
        .from(testimonials)
        .where(
            and(
                eq(testimonials.projectId, project.id),
                eq(testimonials.isVisible, true)
            )
        )
        .orderBy(asc(testimonials.displayOrder))

    return { ...project, testimonials: projectTestimonials }
}

// ─── FETCH ADJACENT PROJECTS (prev / next navigation) ───────────
export async function fetchAdjacentProjects(
    slug: string
): Promise<{ prev: Project | null; next: Project | null }> {
    const [current] = await db
        .select()
        .from(projects)
        .where(and(eq(projects.slug, slug), eq(projects.isPublished, true)))
        .limit(1)

    if (!current) return { prev: null, next: null }

    const order = current.displayOrder ?? 0

    const [prev] = await db
        .select()
        .from(projects)
        .where(
            and(
                eq(projects.isPublished, true),
                lt(projects.displayOrder, order)
            )
        )
        .orderBy(asc(projects.displayOrder))
        .limit(1)

    const [next] = await db
        .select()
        .from(projects)
        .where(
            and(
                eq(projects.isPublished, true),
                gt(projects.displayOrder, order)
            )
        )
        .orderBy(asc(projects.displayOrder))
        .limit(1)

    return { prev: prev ?? null, next: next ?? null }
}
