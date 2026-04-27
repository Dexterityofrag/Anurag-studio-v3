import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
    fetchProjectBySlug,
    fetchAdjacentProjects,
    fetchProjects,
} from '@/lib/data/projects'
import ProjectDetail from '@/components/work/ProjectDetail'
import ReadingProgress from '@/components/ReadingProgress'

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
    const [project, adjacent] = await Promise.all([
        fetchProjectBySlug(slug).catch(() => null),
        fetchAdjacentProjects(slug).catch(() => ({ prev: null, next: null })),
    ])

    if (!project) notFound()

    return (
        <>
            <ReadingProgress />
            <ProjectDetail project={project} adjacent={adjacent} />
        </>
    )
}
