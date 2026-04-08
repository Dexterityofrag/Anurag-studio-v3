import type { MetadataRoute } from 'next'
import { fetchProjects } from '@/lib/data/projects'
import { fetchPosts } from '@/lib/data/posts'

export const dynamic = 'force-dynamic'

const BASE = 'https://anurag.studio'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
        { url: BASE, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
        { url: `${BASE}/work`, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
        { url: `${BASE}/about`, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
        { url: `${BASE}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
        { url: `${BASE}/contact`, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    ]

    // Published projects
    const projects = await fetchProjects()
    const projectPages: MetadataRoute.Sitemap = projects.map((p) => ({
        url: `${BASE}/work/${p.slug}`,
        lastModified: p.updatedAt ?? p.createdAt ?? new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
    }))

    // Published posts
    const posts = await fetchPosts()
    const postPages: MetadataRoute.Sitemap = posts.map((p) => ({
        url: `${BASE}/blog/${p.slug}`,
        lastModified: p.updatedAt ?? p.publishedAt ?? new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
    }))

    return [...staticPages, ...projectPages, ...postPages]
}
