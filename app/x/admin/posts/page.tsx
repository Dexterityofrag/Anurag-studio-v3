import Link from 'next/link'
import { db } from '@/lib/db'
import { blogPosts } from '@/lib/db/schema'
import { desc } from 'drizzle-orm'
import PostListClient from '@/components/admin/PostListClient'

const css = `
.abp__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: clamp(1.5rem, 3vw, 2rem);
  flex-wrap: wrap;
  gap: 12px;
}
.abp__title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(1.5rem, 3vw, 2rem);
  color: #FAFAFA;
}
.abp__new-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  background: #FF4D00;
  color: #0A0A0A;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 13px;
  text-decoration: none;
  letter-spacing: 0.04em;
  transition: opacity 0.2s ease;
}
.abp__new-btn:hover { opacity: 0.9; }
`

export default async function AdminPostsPage() {
    const allPosts = await db
        .select()
        .from(blogPosts)
        .orderBy(desc(blogPosts.createdAt))

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: css }} />

            <div className="abp__header">
                <h1 className="abp__title">Blog Posts</h1>
                <Link href="/x/admin/posts/new" className="abp__new-btn">
                    + New Post
                </Link>
            </div>

            <PostListClient posts={allPosts} />
        </>
    )
}
