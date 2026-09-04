import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { fetchProjectBySlug, fetchProjects } from '@/lib/data/projects'
import ProjectDetail from '@/components/work/ProjectDetail'

// Re-validate cached pages every 60s so admin-uploaded images appear quickly
export const revalidate = 60
// Allow slugs not pre-built at deploy time to be rendered on-demand
export const dynamicParams = true

/* ────────────────────────────────────────────────────────────── */
/*  Static params (all published slugs)                           */
/* ────────────────────────────────────────────────────────────── */

export async function generateStaticParams() {
    const projects = await fetchProjects().catch(() => [])
    return projects.map((p) => ({ slug: p.slug }))
}

/* ────────────────────────────────────────────────────────────── */
/*  Metadata                                                      */
/* ────────────────────────────────────────────────────────────── */

type MetaArgs = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: MetaArgs): Promise<Metadata> {
    const { slug } = await params
    const project = await fetchProjectBySlug(slug).catch(() => null)
    if (!project) return { title: 'Project Not Found' }

    return {
        title: project.title,
        description:
            project.tagline ??
            `${project.title}, a project by Anurag. ${project.tags?.join(', ') ?? ''}`,
        openGraph: {
            title: `${project.title} | Anurag`,
            description: project.tagline ?? `A project by Anurag.`,
            images: project.coverUrl ? [project.coverUrl] : [],
            type: 'article',
        },
        twitter: {
            card: 'summary_large_image',
            title: `${project.title} | Anurag`,
            description: project.tagline ?? undefined,
            images: project.coverUrl ? [project.coverUrl] : [],
        },
    }
}

/* ────────────────────────────────────────────────────────────── */
/*  Page                                                          */
/* ────────────────────────────────────────────────────────────── */

type PageArgs = { params: Promise<{ slug: string }> }

export default async function ProjectPage({ params }: PageArgs) {
    const { slug } = await params
    const [project, all] = await Promise.all([
        fetchProjectBySlug(slug).catch(() => null),
        fetchProjects().catch(() => []),
    ])

    if (!project) notFound()

    // The hero counter reads "03 / 07". It comes from the published set in
    // display order, the same order /work lists them in, so the number a
    // visitor sees here matches the position they clicked from.
    const at = all.findIndex((p) => p.slug === slug)
    const position =
        at >= 0 && all.length > 1 ? { index: at + 1, total: all.length } : undefined

    // Both neighbours come off that same ordered list, and both wrap, so the
    // last project offers the first as next and the first offers the last as
    // previous. Nobody reaches the end of a case study and finds one way out.
    //
    // This replaces fetchAdjacentProjects, which queried for the neighbours
    // separately and sorted the "previous" side ascending — so it returned the
    // first project in the set rather than the one immediately before, on
    // every case study except the second.
    const adjacent =
        at >= 0 && all.length > 1
            ? {
                  prev: all[(at - 1 + all.length) % all.length],
                  next: all[(at + 1) % all.length],
              }
            : { prev: null, next: null }

    return <ProjectDetail project={project} adjacent={adjacent} position={position} />

}
