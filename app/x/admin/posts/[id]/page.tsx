import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { blogPosts } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import PostEditor from '@/components/admin/PostEditor'

type PageArgs = { params: Promise<{ id: string }> }
export const dynamic = 'force-dynamic'
export const revalidate = 0
export default async function AdminPostEditorPage({ params }: PageArgs) {
    const { id } = await params

    if (id === 'new') {
        return <PostEditor post={null} />
    }

    const [post] = await db
        .select()
        .from(blogPosts)
        .where(eq(blogPosts.id, id))
        .limit(1)

    if (!post) notFound()

    return <PostEditor post={post} />
}
