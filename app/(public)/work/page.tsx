import type { Metadata } from 'next'
import { fetchProjects } from '@/lib/data/projects'
import WorkGrid from '@/components/work/WorkGrid'

// Re-validate cached pages every 60s so admin updates appear quickly
export const revalidate = 60

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

    // ── Canonical-case + trailing-S collapse ──────────────────────
    // Merges variants like "DESIGN SYSTEM" / "Design Systems" / "design system"
    // into a single filter chip using the first-seen casing as canonical.
    const canonicalDisplay = new Map<string, string>()    // canonicalKey → display text
    const aliasToCanonical = new Map<string, string>()    // anyLower → canonicalKey

    const canonicalize = (raw: string): string => {
        const trimmed = raw.trim()
        if (!trimmed) return ''
        const lower = trimmed.toLowerCase()
        const cached = aliasToCanonical.get(lower)
        if (cached) return canonicalDisplay.get(cached)!
        // Singular form (drop trailing 's') → match plural to existing singular
        const singular = lower.endsWith('s') ? lower.slice(0, -1) : lower
        const existing = canonicalDisplay.get(singular)
        if (existing) {
            aliasToCanonical.set(lower, singular)
            return existing
        }
        // First time seeing this concept — register and return as-is
        canonicalDisplay.set(singular, trimmed)
        aliasToCanonical.set(lower, singular)
        return trimmed
    }

    const normalizedProjects = projects.map(p => ({
        ...p,
        tags: (p.tags ?? []).map(canonicalize).filter(Boolean),
    }))

    const tags = Array.from(
        new Set(normalizedProjects.flatMap(p => p.tags ?? []))
    ).sort()

    return <WorkGrid projects={normalizedProjects} tags={tags} />
}
