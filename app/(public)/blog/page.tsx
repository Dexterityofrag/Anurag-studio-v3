// Re-validate cached page every 60s so admin updates appear quickly
export const revalidate = 60

import type { Metadata } from 'next'
import { fetchPosts } from '@/lib/data/posts'
import BlogGrid from '@/components/blog/BlogGrid'

export const metadata: Metadata = {
    title: 'Blog',
    description:
        'Thoughts on design, development, and the creative process by Anurag.',
    openGraph: {
        title: 'Blog | Anurag',
        description: 'Thoughts on design, development, and the creative process.',
    },
    twitter: { card: 'summary_large_image' },
}

export default async function BlogPage() {
    const posts = await fetchPosts().catch(() => [])

    // Extract unique tags
    const tagSet = new Set<string>()
    for (const p of posts) {
        if (p.tags) {
            for (const t of p.tags) {
                if (t) tagSet.add(t)
            }
        }
    }
    const tags = Array.from(tagSet).sort()

    return <BlogGrid posts={posts} tags={tags} />
}
