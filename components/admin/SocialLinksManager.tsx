'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2, Plus, X, Check } from 'lucide-react'
import { saveSocialLink, deleteSocialLink, type SocialFormState } from '@/app/actions/admin'

/* ────────────────────────────────────────────────────────────── */
/*  Types                                                         */
/* ────────────────────────────────────────────────────────────── */

type SocialLink = {
    id: string
    platform: string
    url: string
    iconName: string | null
    displayOrder: number | null
    isVisible: boolean | null
}

interface Props {
    links: SocialLink[]
}

/* ────────────────────────────────────────────────────────────── */
/*  Styles                                                        */
/* ────────────────────────────────────────────────────────────── */

const css = /* css */ `
.sl__title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(1.5rem, 3vw, 2rem);
  color: #FAFAFA;
  margin-bottom: clamp(1.5rem, 3vw, 2rem);
}
.sl__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.sl__add-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #00FF94;
  color: #0A0A0A;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 12px;
  border: none;
  cursor: pointer;
  transition: opacity 0.2s ease;
}
.sl__add-btn:hover { opacity: 0.9; }
.sl__add-btn svg { width: 14px; height: 14px; }

.sl__card {
  background: #141414;
  border: 1px solid #262626;
  overflow: hidden;
}
.sl__table {
  width: 100%;
  border-collapse: collapse;
}
.sl__table th {
  font-family: var(--font-mono);
  font-size: 10px;
  color: #8A8A8A;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  text-align: left;
  padding: 10px 16px;
  font-weight: 500;
}
.sl__table td {
  padding: 10px 16px;
  font-family: var(--font-body);
  font-size: 13px;
  color: #FAFAFA;
  border-top: 1px solid #1A1A1A;
  vertical-align: middle;
}
.sl__table tr:hover td { background: rgba(255,255,255,0.02); }

.sl__input {
  width: 100%;
  background: #1A1A1A;
  border: 1px solid #262626;
  padding: 6px 10px;
  font-family: var(--font-body);
  font-size: 13px;
  color: #FAFAFA;
  outline: none;
  transition: border-color 0.25s ease;
  border-radius: 0;
}
.sl__input:focus { border-color: #00FF94; }
.sl__input--small { max-width: 80px; }

.sl__toggle {
  position: relative;
  width: 36px;
  height: 20px;
  background: #262626;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s ease;
}
.sl__toggle--on { background: #00FF94; }
.sl__toggle__knob {
  position: absolute;
  top: 2px; left: 2px;
  width: 16px; height: 16px;
  border-radius: 50%;
  background: #FAFAFA;
  transition: transform 0.2s ease;
}
.sl__toggle--on .sl__toggle__knob { transform: translateX(16px); }

.sl__actions { display: flex; gap: 4px; }
.sl__icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px; height: 28px;
  background: none;
  border: none;
  color: #8A8A8A;
  cursor: pointer;
  border-radius: 4px;
  transition: color 0.2s ease;
}
.sl__icon-btn:hover { color: #FAFAFA; background: #1A1A1A; }
.sl__icon-btn--save:hover { color: #00FF94; }
.sl__icon-btn--del:hover { color: #FF4444; }
.sl__icon-btn svg { width: 14px; height: 14px; }

.sl__empty {
  padding: 32px;
  text-align: center;
  font-family: var(--font-mono);
  font-size: 13px;
  color: #555;
}
`

/* ────────────────────────────────────────────────────────────── */
/*  Component                                                     */
/* ────────────────────────────────────────────────────────────── */

type EditRow = {
    id: string | null
    platform: string
    url: string
    iconName: string
    displayOrder: string
    isVisible: boolean
}

const EMPTY_ROW: EditRow = {
    id: null,
    platform: '',
    url: '',
    iconName: '',
    displayOrder: '0',
    isVisible: true,
}

export default function SocialLinksManager({ links }: Props) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editRow, setEditRow] = useState<EditRow>(EMPTY_ROW)
    const [adding, setAdding] = useState(false)

    const startEdit = (link: SocialLink) => {
        setAdding(false)
        setEditingId(link.id)
        setEditRow({
            id: link.id,
            platform: link.platform,
            url: link.url,
            iconName: link.iconName ?? '',
            displayOrder: String(link.displayOrder ?? 0),
            isVisible: link.isVisible ?? true,
        })
    }

    const startAdd = () => {
        setEditingId(null)
        setEditRow({ ...EMPTY_ROW })
        setAdding(true)
    }

    const cancelEdit = () => {
        setEditingId(null)
        setAdding(false)
    }

    const handleSave = () => {
        const fd = new FormData()
        if (editRow.id) fd.set('id', editRow.id)
        fd.set('platform', editRow.platform)
        fd.set('url', editRow.url)
        fd.set('iconName', editRow.iconName)
        fd.set('displayOrder', editRow.displayOrder)
        fd.set('isVisible', String(editRow.isVisible))

        startTransition(async () => {
            await saveSocialLink(null, fd)
            cancelEdit()
            router.refresh()
        })
    }

    const handleDelete = (id: string) => {
        startTransition(async () => {
            await deleteSocialLink(id)
            router.refresh()
        })
    }

    const editInput = (field: keyof EditRow, value: string | boolean) =>
        setEditRow((r) => ({ ...r, [field]: value }))

    const renderRow = (isEditing: boolean, row: EditRow, link?: SocialLink) => (
        <tr key={row.id ?? 'new'}>
            <td>
                {isEditing ? (
                    <input className="sl__input" value={row.platform} onChange={(e) => editInput('platform', e.target.value)} placeholder="Twitter" />
                ) : link?.platform}
            </td>
            <td>
                {isEditing ? (
                    <input className="sl__input" value={row.url} onChange={(e) => editInput('url', e.target.value)} placeholder="https://..." />
                ) : (
                    <span style={{ color: '#8A8A8A', fontSize: 12, fontFamily: 'var(--font-mono)' }}>{link?.url}</span>
                )}
            </td>
            <td>
                {isEditing ? (
                    <input className="sl__input" value={row.iconName} onChange={(e) => editInput('iconName', e.target.value)} placeholder="twitter" />
                ) : link?.iconName ?? '-'}
            </td>
            <td>
                {isEditing ? (
                    <input className="sl__input sl__input--small" type="number" value={row.displayOrder} onChange={(e) => editInput('displayOrder', e.target.value)} />
                ) : link?.displayOrder ?? 0}
            </td>
            <td>
                {isEditing ? (
                    <button className={`sl__toggle${row.isVisible ? ' sl__toggle--on' : ''}`} onClick={() => editInput('isVisible', !row.isVisible)} type="button">
                        <span className="sl__toggle__knob" />
                    </button>
                ) : (
                    <span style={{ color: link?.isVisible ? '#00FF94' : '#8A8A8A', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
                        {link?.isVisible ? 'Yes' : 'No'}
                    </span>
                )}
            </td>
            <td>
                <div className="sl__actions">
                    {isEditing ? (
                        <>
                            <button className="sl__icon-btn sl__icon-btn--save" onClick={handleSave} disabled={isPending}><Check /></button>
                            <button className="sl__icon-btn" onClick={cancelEdit}><X /></button>
                        </>
                    ) : (
                        <>
                            <button className="sl__icon-btn" onClick={() => link && startEdit(link)}><Pencil /></button>
                            <button className="sl__icon-btn sl__icon-btn--del" onClick={() => link && handleDelete(link.id)}><Trash2 /></button>
                        </>
                    )}
                </div>
            </td>
        </tr>
    )

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: css }} />

            <div className="sl__header">
                <h1 className="sl__title">Social Links</h1>
                <button className="sl__add-btn" onClick={startAdd}>
                    <Plus /> Add Link
                </button>
            </div>

            <div className="sl__card">
                <table className="sl__table">
                    <thead>
                        <tr>
                            <th>Platform</th>
                            <th>URL</th>
                            <th>Icon</th>
                            <th>Order</th>
                            <th>Visible</th>
                            <th style={{ width: 80 }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {adding && renderRow(true, editRow)}
                        {links.map((l) =>
                            editingId === l.id
                                ? renderRow(true, editRow, l)
                                : renderRow(false, EMPTY_ROW, l)
                        )}
                        {links.length === 0 && !adding && (
                            <tr>
                                <td colSpan={6} className="sl__empty">
                                    No social links yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </>
    )
}
