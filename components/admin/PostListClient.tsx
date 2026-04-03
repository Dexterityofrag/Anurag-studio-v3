'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2 } from 'lucide-react'
import { deletePost } from '@/app/actions/posts'
import type { BlogPost } from '@/lib/types'

/* ────────────────────────────────────────────────────────────── */
/*  Styles                                                        */
/* ────────────────────────────────────────────────────────────── */

const css = /* css */ `
.ptl__card {
  background: #141414;
  border: 1px solid #262626;
  overflow: hidden;
}
.ptl__table {
  width: 100%;
  border-collapse: collapse;
}
.ptl__table th {
  font-family: var(--font-mono);
  font-size: 10px;
  color: #8A8A8A;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  text-align: left;
  padding: 10px 16px;
  font-weight: 500;
}
.ptl__table td {
  padding: 10px 16px;
  font-family: var(--font-body);
  font-size: 13px;
  color: #FAFAFA;
  border-top: 1px solid #1A1A1A;
  vertical-align: middle;
}
.ptl__table tr:hover td { background: rgba(255,255,255,0.02); }

.ptl__badge {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.04em;
  padding: 3px 10px;
  border-radius: 999px;
}
.ptl__badge--pub { background: rgba(255,77,0,0.1); color: #FF4D00; }
.ptl__badge--draft { background: rgba(138,138,138,0.1); color: #8A8A8A; }

.ptl__tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}
.ptl__tag {
  font-family: var(--font-mono);
  font-size: 10px;
  color: #8A8A8A;
  padding: 2px 6px;
  background: #1A1A1A;
  border-radius: 3px;
}

.ptl__actions {
  display: flex;
  align-items: center;
  gap: 4px;
}
.ptl__icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: none;
  border: none;
  color: #8A8A8A;
  cursor: pointer;
  transition: color 0.2s ease;
  border-radius: 4px;
}
.ptl__icon-btn:hover { color: #FAFAFA; background: #1A1A1A; }
.ptl__icon-btn--del:hover { color: #FF4444; }
.ptl__icon-btn svg { width: 14px; height: 14px; }

.ptl__edit {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  color: #8A8A8A;
  transition: color 0.2s ease;
  border-radius: 4px;
}
.ptl__edit:hover { color: #FF4D00; background: #1A1A1A; }
.ptl__edit svg { width: 14px; height: 14px; }

.ptl__empty {
  padding: 32px;
  text-align: center;
  font-family: var(--font-mono);
  font-size: 13px;
  color: #555;
}

/* Confirm dialog */
.ptl__overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ptl__dialog {
  background: #141414;
  border: 1px solid #262626;
  padding: 24px;
  max-width: 400px;
  width: 90%;
}
.ptl__dialog-title {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 16px;
  color: #FAFAFA;
  margin-bottom: 8px;
}
.ptl__dialog-text {
  font-family: var(--font-body);
  font-size: 13px;
  color: #8A8A8A;
  margin-bottom: 20px;
  line-height: 1.5;
}
.ptl__dialog-btns {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}
.ptl__dialog-btn {
  padding: 8px 16px;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 13px;
  border: none;
  cursor: pointer;
  transition: opacity 0.2s ease;
}
.ptl__dialog-btn:hover { opacity: 0.8; }
.ptl__dialog-btn--cancel { background: #1A1A1A; color: #FAFAFA; }
.ptl__dialog-btn--delete { background: #FF4444; color: #FAFAFA; }
`

/* ────────────────────────────────────────────────────────────── */
/*  Helpers                                                       */
/* ────────────────────────────────────────────────────────────── */

function fmtDate(d: Date | null | undefined): string {
    if (!d) return '-'
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(new Date(d))
}

/* ────────────────────────────────────────────────────────────── */
/*  Component                                                     */
/* ────────────────────────────────────────────────────────────── */

export default function PostListClient({ posts }: { posts: BlogPost[] }) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [deleteTarget, setDeleteTarget] = useState<BlogPost | null>(null)

    const handleDelete = () => {
        if (!deleteTarget) return
        startTransition(async () => {
            await deletePost(deleteTarget.id)
            setDeleteTarget(null)
            router.refresh()
        })
    }

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: css }} />

            <div className="ptl__card">
                {posts.length > 0 ? (
                    <table className="ptl__table">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Status</th>
                                <th>Tags</th>
                                <th>Published</th>
                                <th>Read</th>
                                <th style={{ width: 80 }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {posts.map((p) => (
                                <tr key={p.id}>
                                    <td>{p.title}</td>
                                    <td>
                                        <span
                                            className={`ptl__badge ${p.isPublished ? 'ptl__badge--pub' : 'ptl__badge--draft'}`}
                                        >
                                            {p.isPublished ? 'Published' : 'Draft'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="ptl__tags">
                                            {p.tags?.slice(0, 3).map((t) => (
                                                <span key={t} className="ptl__tag">{t}</span>
                                            ))}
                                        </div>
                                    </td>
                                    <td style={{ color: '#8A8A8A', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                                        {fmtDate(p.publishedAt)}
                                    </td>
                                    <td style={{ color: '#8A8A8A', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                                        {p.readingTimeMinutes ?? 5}m
                                    </td>
                                    <td>
                                        <div className="ptl__actions">
                                            <Link href={`/x/admin/posts/${p.id}`} className="ptl__edit">
                                                <Pencil />
                                            </Link>
                                            <button
                                                className="ptl__icon-btn ptl__icon-btn--del"
                                                onClick={() => setDeleteTarget(p)}
                                                aria-label="Delete"
                                            >
                                                <Trash2 />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="ptl__empty">No posts yet. Write your first one!</p>
                )}
            </div>

            {/* Delete confirm dialog */}
            {deleteTarget && (
                <div className="ptl__overlay" onClick={() => setDeleteTarget(null)}>
                    <div className="ptl__dialog" onClick={(e) => e.stopPropagation()}>
                        <p className="ptl__dialog-title">Delete Post</p>
                        <p className="ptl__dialog-text">
                            Are you sure you want to delete &ldquo;{deleteTarget.title}&rdquo;? This
                            action cannot be undone.
                        </p>
                        <div className="ptl__dialog-btns">
                            <button
                                className="ptl__dialog-btn ptl__dialog-btn--cancel"
                                onClick={() => setDeleteTarget(null)}
                            >
                                Cancel
                            </button>
                            <button
                                className="ptl__dialog-btn ptl__dialog-btn--delete"
                                onClick={handleDelete}
                                disabled={isPending}
                            >
                                {isPending ? 'Deleting…' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
