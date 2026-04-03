import { eq, and, asc } from 'drizzle-orm'
import { db } from '@/lib/db'
import { aboutInfo, testimonials, projects } from '@/lib/db/schema'
import type { AboutInfo, AboutSection, Testimonial } from '@/lib/types'

// ─── FETCH ABOUT SECTION ─────────────────────────────────────────
export async function fetchAboutSection(
    section: AboutSection
): Promise<AboutInfo[]> {
    return db
        .select()
        .from(aboutInfo)
        .where(eq(aboutInfo.section, section))
        .orderBy(asc(aboutInfo.displayOrder))
}

// ─── FETCH TESTIMONIALS (with project relation) ─────────────────
export async function fetchTestimonials(): Promise<
    (Testimonial & { project: { title: string; slug: string } | null })[]
> {
    const rows = await db
        .select({
            id: testimonials.id,
            authorName: testimonials.authorName,
            authorRole: testimonials.authorRole,
            authorAvatarUrl: testimonials.authorAvatarUrl,
            quote: testimonials.quote,
            projectId: testimonials.projectId,
            isVisible: testimonials.isVisible,
            displayOrder: testimonials.displayOrder,
            projectTitle: projects.title,
            projectSlug: projects.slug,
        })
        .from(testimonials)
        .leftJoin(projects, eq(testimonials.projectId, projects.id))
        .where(eq(testimonials.isVisible, true))
        .orderBy(asc(testimonials.displayOrder))

    return rows.map((row) => ({
        id: row.id,
        authorName: row.authorName,
        authorRole: row.authorRole,
        authorAvatarUrl: row.authorAvatarUrl,
        quote: row.quote,
        projectId: row.projectId,
        isVisible: row.isVisible,
        displayOrder: row.displayOrder,
        project:
            row.projectTitle && row.projectSlug
                ? { title: row.projectTitle, slug: row.projectSlug }
                : null,
    }))
}
