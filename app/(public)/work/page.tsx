import type { Metadata } from 'next'
import { fetchProjects } from '@/lib/data/projects'
import WorkGrid from '@/components/work/WorkGrid'

export const metadata: Metadata = {
    title: 'Work',
    description:
        'Selected projects by Anurag: UI/UX design, brand identity, creative development, and cinematic digital experiences.',
    openGraph: {
        title: 'Work | Anurag',
        description: 'Portfolio of selected projects by Anurag.',
    },
    twitter: { card: 'summary_large_image' },
}

export default async function WorkPage() {
    const projects = await fetchProjects().catch(() => [])

    // Extract unique tags from all projects
    const tagSet = new Set<string>()
    for (const p of projects) {
        if (p.tags) {
            for (const t of p.tags) {
                if (t) tagSet.add(t)
            }
        }
    }
    const tags = Array.from(tagSet).sort()

    return <WorkGrid projects={projects} tags={tags} />
}
