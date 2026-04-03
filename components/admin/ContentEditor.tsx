'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { saveContentGroup } from '@/app/actions/admin'

/* ────────────────────────────────────────────────────────────── */
/*  Types                                                         */
/* ────────────────────────────────────────────────────────────── */

type ContentRow = {
    id: string
    key: string
    value: string | null
    contentType: string | null
    groupName: string | null
    description: string | null
    updatedAt: Date | null
}

interface ContentEditorProps {
    groups: Record<string, ContentRow[]>
}

/* ────────────────────────────────────────────────────────────── */
/*  Styles                                                        */
/* ────────────────────────────────────────────────────────────── */

const css = /* css */ `
.ce__title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(1.5rem, 3vw, 2rem);
  color: #FAFAFA;
  margin-bottom: clamp(1.5rem, 3vw, 2rem);
}
.ce__group {
  background: #141414;
  border: 1px solid #262626;
  margin-bottom: 16px;
}
.ce__group-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  border-bottom: 1px solid #1A1A1A;
}
.ce__group-name {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 15px;
  color: #FAFAFA;
  text-transform: capitalize;
}
.ce__save-btn {
  padding: 6px 16px;
  background: #FF4D00;
  color: #0A0A0A;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 12px;
  border: none;
  cursor: pointer;
  transition: opacity 0.2s ease;
}
.ce__save-btn:hover:not(:disabled) { opacity: 0.9; }
.ce__save-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.ce__saved {
  font-family: var(--font-mono);
  font-size: 11px;
  color: #FF4D00;
  margin-right: 8px;
}

.ce__rows {
  padding: 0 20px;
}
.ce__row {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 16px;
  align-items: start;
  padding: 14px 0;
  border-bottom: 1px solid #1A1A1A;
}
.ce__row:last-child { border-bottom: none; }

.ce__key {
  font-family: var(--font-mono);
  font-size: 12px;
  color: #8A8A8A;
  letter-spacing: 0.02em;
  padding-top: 8px;
  word-break: break-all;
}
.ce__key-desc {
  font-size: 10px;
  color: #555;
  margin-top: 4px;
}
.ce__type {
  display: inline-block;
  font-size: 9px;
  color: #555;
  background: #1A1A1A;
  padding: 1px 6px;
  border-radius: 3px;
  margin-top: 4px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.ce__input {
  width: 100%;
  background: #1A1A1A;
  border: 1px solid #262626;
  padding: 8px 12px;
  font-family: var(--font-body);
  font-size: 13px;
  color: #FAFAFA;
  outline: none;
  transition: border-color 0.25s ease;
  border-radius: 0;
}
.ce__input:focus { border-color: #FF4D00; }
.ce__textarea {
  resize: vertical;
  min-height: 80px;
}

.ce__url-preview {
  font-family: var(--font-mono);
  font-size: 11px;
  color: #FF4D00;
  text-decoration: underline;
  margin-top: 4px;
  display: block;
  word-break: break-all;
}

.ce__empty {
  padding: 32px;
  text-align: center;
  font-family: var(--font-mono);
  font-size: 13px;
  color: #555;
}

@media (max-width: 640px) {
  .ce__row { grid-template-columns: 1fr; }
}
`

/* ────────────────────────────────────────────────────────────── */
/*  Component                                                     */
/* ────────────────────────────────────────────────────────────── */

export default function ContentEditor({ groups }: ContentEditorProps) {
    const router = useRouter()
    const groupNames = Object.keys(groups)

    if (groupNames.length === 0) {
        return (
            <>
                <style dangerouslySetInnerHTML={{ __html: css }} />
                <h1 className="ce__title">Site Content</h1>
                <div className="ce__empty">No content entries found.</div>
            </>
        )
    }

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: css }} />
            <h1 className="ce__title">Site Content</h1>
            {groupNames.map((g) => (
                <GroupSection key={g} name={g} rows={groups[g]} onSaved={() => router.refresh()} />
            ))}
        </>
    )
}

/* ────────────────────────────────────────────────────────────── */
/*  Group section                                                 */
/* ────────────────────────────────────────────────────────────── */

function GroupSection({
    name,
    rows,
    onSaved,
}: {
    name: string
    rows: ContentRow[]
    onSaved: () => void
}) {
    const [isPending, startTransition] = useTransition()
    const [values, setValues] = useState<Record<string, string>>(
        Object.fromEntries(rows.map((r) => [r.id, r.value ?? '']))
    )
    const [saved, setSaved] = useState(false)

    const handleSave = () => {
        const entries = rows.map((r) => ({ id: r.id, value: values[r.id] ?? '' }))
        startTransition(async () => {
            await saveContentGroup(entries)
            setSaved(true)
            setTimeout(() => setSaved(false), 2000)
            onSaved()
        })
    }

    return (
        <div className="ce__group">
            <div className="ce__group-header">
                <span className="ce__group-name">{name}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {saved && <span className="ce__saved">Saved ✓</span>}
                    <button
                        className="ce__save-btn"
                        onClick={handleSave}
                        disabled={isPending}
                    >
                        {isPending ? 'Saving…' : 'Save All'}
                    </button>
                </div>
            </div>
            <div className="ce__rows">
                {rows.map((r) => (
                    <div key={r.id} className="ce__row">
                        <div className="ce__key">
                            {r.key}
                            {r.description && <div className="ce__key-desc">{r.description}</div>}
                            <div className="ce__type">{r.contentType ?? 'text'}</div>
                        </div>
                        <div>
                            {r.contentType === 'html' ? (
                                <textarea
                                    className="ce__input ce__textarea"
                                    value={values[r.id] ?? ''}
                                    onChange={(e) =>
                                        setValues((v) => ({ ...v, [r.id]: e.target.value }))
                                    }
                                />
                            ) : (
                                <input
                                    className="ce__input"
                                    value={values[r.id] ?? ''}
                                    onChange={(e) =>
                                        setValues((v) => ({ ...v, [r.id]: e.target.value }))
                                    }
                                />
                            )}
                            {r.contentType === 'url' && values[r.id] && (
                                <a
                                    href={values[r.id]}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="ce__url-preview"
                                >
                                    {values[r.id]}
                                </a>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
