import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { fetchPostBySlug, fetchPosts } from '@/lib/data/posts'
import PostDetail from '@/components/blog/PostDetail'
import ReadingProgress from '@/components/ReadingProgress'

/* ────────────────────────────────────────────────────────────── */
/*  Static params                                                 */
/* ────────────────────────────────────────────────────────────── */

export async function generateStaticParams() {
    const posts = await fetchPosts().catch(() => [])
    return posts.map((p) => ({ slug: p.slug }))
}

/* ────────────────────────────────────────────────────────────── */
/*  Metadata                                                      */
/* ────────────────────────────────────────────────────────────── */

type MetaArgs = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: MetaArgs): Promise<Metadata> {
    const { slug } = await params
    const post = await fetchPostBySlug(slug).catch(() => null)
    if (!post) return { title: 'Post Not Found' }

    const title = post.metaTitle ?? `${post.title} | Anurag`
    const description =
        post.metaDescription ?? post.excerpt ?? `${post.title}, a blog post by Anurag.`

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images: post.coverUrl ? [post.coverUrl] : [],
            type: 'article',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: post.coverUrl ? [post.coverUrl] : [],
        },
    }
}

/* ────────────────────────────────────────────────────────────── */
/*  Page                                                          */
/* ────────────────────────────────────────────────────────────── */

type PageArgs = { params: Promise<{ slug: string }> }

export default async function BlogPostPage({ params }: PageArgs) {
    const { slug } = await params

    // Fetch current post + all posts (for prev/next)
    const [post, allPosts] = await Promise.all([
        fetchPostBySlug(slug).catch(() => null),
        fetchPosts().catch(() => []),
    ])

    if (!post) notFound()

    // If it's an external post (e.g. Medium), redirect directly
    if (post.externalUrl) redirect(post.externalUrl)

    // Compute adjacent posts (ordered by publishedAt DESC)
    const currentIdx = allPosts.findIndex((p) => p.slug === slug)
    const prev = currentIdx < allPosts.length - 1 ? allPosts[currentIdx + 1] : null
    const next = currentIdx > 0 ? allPosts[currentIdx - 1] : null

    return (
        <>
            <ReadingProgress />
            <PostDetail
                post={post}
                adjacent={{ prev, next }}
            />
        </>
    )
}
