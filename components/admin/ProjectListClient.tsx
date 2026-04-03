'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ChevronUp, ChevronDown, Pencil, Trash2 } from 'lucide-react'
import { deleteProject, updateDisplayOrder } from '@/app/actions/projects'
import type { Project } from '@/lib/types'

/* ────────────────────────────────────────────────────────────── */
/*  Styles                                                        */
/* ────────────────────────────────────────────────────────────── */

const css = /* css */ `
.pl__card {
  background: #141414;
  border: 1px solid #262626;
  overflow: hidden;
}
.pl__table {
  width: 100%;
  border-collapse: collapse;
}
.pl__table th {
  font-family: var(--font-mono);
  font-size: 10px;
  color: #8A8A8A;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  text-align: left;
  padding: 10px 16px;
  font-weight: 500;
}
.pl__table td {
  padding: 10px 16px;
  font-family: var(--font-body);
  font-size: 13px;
  color: #FAFAFA;
  border-top: 1px solid #1A1A1A;
  vertical-align: middle;
}
.pl__table tr:hover td { background: rgba(255,255,255,0.02); }

.pl__thumb {
  width: 30px;
  height: 30px;
  object-fit: cover;
  background: #1A1A1A;
  flex-shrink: 0;
}

.pl__badge {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.04em;
  padding: 3px 10px;
  border-radius: 999px;
}
.pl__badge--pub { background: rgba(200,255,0,0.1); color: #C8FF00; }
.pl__badge--draft { background: rgba(138,138,138,0.1); color: #8A8A8A; }

.pl__actions {
  display: flex;
  align-items: center;
  gap: 4px;
}
.pl__icon-btn {
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
.pl__icon-btn:hover { color: #FAFAFA; background: #1A1A1A; }
.pl__icon-btn--del:hover { color: #FF4444; }
.pl__icon-btn svg { width: 14px; height: 14px; }

.pl__edit {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  color: #8A8A8A;
  transition: color 0.2s ease;
  border-radius: 4px;
}
.pl__edit:hover { color: #C8FF00; background: #1A1A1A; }
.pl__edit svg { width: 14px; height: 14px; }

.pl__empty {
  padding: 32px;
  text-align: center;
  font-family: var(--font-mono);
  font-size: 13px;
  color: #555;
}

/* Confirm dialog */
.pl__overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
}
.pl__dialog {
  background: #141414;
  border: 1px solid #262626;
  padding: 24px;
  max-width: 400px;
  width: 90%;
}
.pl__dialog-title {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 16px;
  color: #FAFAFA;
  margin-bottom: 8px;
}
.pl__dialog-text {
  font-family: var(--font-body);
  font-size: 13px;
  color: #8A8A8A;
  margin-bottom: 20px;
  line-height: 1.5;
}
.pl__dialog-btns {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}
.pl__dialog-btn {
  padding: 8px 16px;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 13px;
  border: none;
  cursor: pointer;
  transition: opacity 0.2s ease;
}
.pl__dialog-btn:hover { opacity: 0.8; }
.pl__dialog-btn--cancel {
  background: #1A1A1A;
  color: #FAFAFA;
}
.pl__dialog-btn--delete {
  background: #FF4444;
  color: #FAFAFA;
}
`

/* ────────────────────────────────────────────────────────────── */
/*  Component                                                     */
/* ────────────────────────────────────────────────────────────── */

export default function ProjectListClient({
    projects: initial,
}: {
    projects: Project[]
}) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [deleteTarget, setDeleteTarget] = useState<Project | null>(null)

    const handleDelete = () => {
        if (!deleteTarget) return
        startTransition(async () => {
            await deleteProject(deleteTarget.id)
            setDeleteTarget(null)
            router.refresh()
        })
    }

    const handleReorder = (id: string, currentOrder: number | null, dir: 'up' | 'down') => {
        const newOrder = (currentOrder ?? 0) + (dir === 'up' ? -1 : 1)
        startTransition(async () => {
            await updateDisplayOrder(id, newOrder)
            router.refresh()
        })
    }

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: css }} />

            <div className="pl__card">
                {initial.length > 0 ? (
                    <table className="pl__table">
                        <thead>
                            <tr>
                                <th style={{ width: 46 }}></th>
                                <th>Title</th>
                                <th>Status</th>
                                <th>Client</th>
                                <th>Year</th>
                                <th>Order</th>
                                <th style={{ width: 120 }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {initial.map((p) => (
                                <tr key={p.id}>
                                    <td>
                                        {p.thumbnailUrl ? (
                                            <Image
                                                src={p.thumbnailUrl}
                                                alt=""
                                                width={30}
                                                height={30}
                                                className="pl__thumb"
                                            />
                                        ) : (
                                            <div className="pl__thumb" />
                                        )}
                                    </td>
                                    <td>{p.title}</td>
                                    <td>
                                        <span
                                            className={`pl__badge ${p.isPublished ? 'pl__badge--pub' : 'pl__badge--draft'}`}
                                        >
                                            {p.isPublished ? 'Published' : 'Draft'}
                                        </span>
                                    </td>
                                    <td style={{ color: '#8A8A8A' }}>{p.client ?? '-'}</td>
                                    <td style={{ color: '#8A8A8A', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                                        {p.year ?? '-'}
                                    </td>
                                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                                        {p.displayOrder ?? 0}
                                    </td>
                                    <td>
                                        <div className="pl__actions">
                                            <button
                                                className="pl__icon-btn"
                                                onClick={() => handleReorder(p.id, p.displayOrder, 'up')}
                                                disabled={isPending}
                                                aria-label="Move up"
                                            >
                                                <ChevronUp />
                                            </button>
                                            <button
                                                className="pl__icon-btn"
                                                onClick={() => handleReorder(p.id, p.displayOrder, 'down')}
                                                disabled={isPending}
                                                aria-label="Move down"
                                            >
                                                <ChevronDown />
                                            </button>
                                            <Link href={`/x/admin/projects/${p.id}`} className="pl__edit">
                                                <Pencil />
                                            </Link>
                                            <button
                                                className="pl__icon-btn pl__icon-btn--del"
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
                    <p className="pl__empty">No projects yet. Create your first one!</p>
                )}
            </div>

            {/* Delete confirm dialog */}
            {deleteTarget && (
                <div className="pl__overlay" onClick={() => setDeleteTarget(null)}>
                    <div className="pl__dialog" onClick={(e) => e.stopPropagation()}>
                        <p className="pl__dialog-title">Delete Project</p>
                        <p className="pl__dialog-text">
                            Are you sure you want to delete &ldquo;{deleteTarget.title}&rdquo;? This
                            action cannot be undone.
                        </p>
                        <div className="pl__dialog-btns">
                            <button
                                className="pl__dialog-btn pl__dialog-btn--cancel"
                                onClick={() => setDeleteTarget(null)}
                            >
                                Cancel
                            </button>
                            <button
                                className="pl__dialog-btn pl__dialog-btn--delete"
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
