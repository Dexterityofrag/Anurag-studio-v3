import { eq, and, desc } from 'drizzle-orm'
import { db } from '@/lib/db'
import { blogPosts } from '@/lib/db/schema'
import type { BlogPost } from '@/lib/types'

// ─── FETCH POSTS ─────────────────────────────────────────────────
export async function fetchPosts(
    options?: { tag?: string; limit?: number }
): Promise<BlogPost[]> {
    const rows = await db
        .select()
        .from(blogPosts)
        .where(eq(blogPosts.isPublished, true))
        .orderBy(desc(blogPosts.publishedAt))
        .limit(options?.limit ?? 100)

    if (options?.tag) {
        return rows.filter((p) => p.tags?.includes(options.tag!))
    }

    return rows
}

// ─── FETCH POST BY SLUG ─────────────────────────────────────────
export async function fetchPostBySlug(
    slug: string
): Promise<BlogPost | null> {
    const [post] = await db
        .select()
        .from(blogPosts)
        .where(and(eq(blogPosts.slug, slug), eq(blogPosts.isPublished, true)))
        .limit(1)

    return post ?? null
}
