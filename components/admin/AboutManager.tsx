'use client'

import { useState, useTransition, useActionState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import { saveAboutEntry, deleteAboutEntry, type AboutFormState } from '@/app/actions/admin'
import type { AboutMetadata } from '@/lib/db/schema'

/* ────────────────────────────────────────────────────────────── */
/*  Types                                                         */
/* ────────────────────────────────────────────────────────────── */

type AboutEntry = {
    id: string
    section: string
    title: string | null
    content: string | null
    metadata: AboutMetadata | null
    displayOrder: number | null
}

interface Props {
    entries: AboutEntry[]
}

const TABS = ['bio', 'skill', 'experience', 'education'] as const
type Tab = (typeof TABS)[number]
const TAB_LABELS: Record<Tab, string> = {
    bio: 'Bio',
    skill: 'Skills',
    experience: 'Experience',
    education: 'Education',
}

/* ────────────────────────────────────────────────────────────── */
/*  Styles                                                        */
/* ────────────────────────────────────────────────────────────── */

const css = /* css */ `
.am__title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(1.5rem, 3vw, 2rem);
  color: #FAFAFA;
  margin-bottom: clamp(1rem, 2vw, 1.5rem);
}

/* Tabs */
.am__tabs {
  display: flex;
  gap: 0;
  border-bottom: 1px solid #262626;
  margin-bottom: 20px;
}
.am__tab {
  padding: 10px 20px;
  font-family: var(--font-mono);
  font-size: 12px;
  color: #8A8A8A;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: color 0.2s ease, border-color 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
.am__tab:hover { color: #FAFAFA; }
.am__tab--active {
  color: #FF4D00;
  border-bottom-color: #FF4D00;
}

.am__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.am__add-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #FF4D00;
  color: #0A0A0A;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 12px;
  border: none;
  cursor: pointer;
  transition: opacity 0.2s ease;
}
.am__add-btn:hover { opacity: 0.9; }
.am__add-btn svg { width: 14px; height: 14px; }

/* Entry cards */
.am__card {
  background: #141414;
  border: 1px solid #262626;
  padding: 16px 20px;
  margin-bottom: 10px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}
.am__card-content { flex: 1; }
.am__card-title {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 15px;
  color: #FAFAFA;
  margin-bottom: 4px;
}
.am__card-text {
  font-family: var(--font-body);
  font-size: 13px;
  color: #8A8A8A;
  line-height: 1.5;
  margin-bottom: 6px;
}
.am__card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.am__card-meta-item {
  font-family: var(--font-mono);
  font-size: 10px;
  color: #555;
  background: #1A1A1A;
  padding: 2px 8px;
  border-radius: 3px;
}

.am__proficiency-bar {
  width: 100%;
  max-width: 200px;
  height: 4px;
  background: #262626;
  border-radius: 2px;
  overflow: hidden;
  margin-top: 4px;
}
.am__proficiency-fill {
  height: 100%;
  background: #FF4D00;
  border-radius: 2px;
}

.am__card-actions { display: flex; gap: 4px; flex-shrink: 0; }
.am__icon-btn {
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
.am__icon-btn:hover { color: #FAFAFA; background: #1A1A1A; }
.am__icon-btn--del:hover { color: #FF4444; }
.am__icon-btn svg { width: 14px; height: 14px; }

/* Modal */
.am__overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
}
.am__modal {
  background: #141414;
  border: 1px solid #262626;
  padding: 24px;
  width: 90%;
  max-width: 500px;
  max-height: 85vh;
  overflow-y: auto;
}
.am__modal-title {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 16px;
  color: #FAFAFA;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.am__group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
}
.am__label {
  font-family: var(--font-mono);
  font-size: 11px;
  color: #8A8A8A;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.am__input {
  width: 100%;
  background: #1A1A1A;
  border: 1px solid #262626;
  padding: 8px 12px;
  font-family: var(--font-body);
  font-size: 13px;
  color: #FAFAFA;
  outline: none;
  border-radius: 0;
  transition: border-color 0.25s ease;
}
.am__input:focus { border-color: #FF4D00; }
.am__textarea { resize: vertical; min-height: 80px; }

.am__slider-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.am__slider {
  -webkit-appearance: none;
  flex: 1;
  height: 4px;
  background: #262626;
  outline: none;
  border-radius: 2px;
}
.am__slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px; height: 16px;
  border-radius: 50%;
  background: #FF4D00;
  cursor: pointer;
}
.am__slider-val {
  font-family: var(--font-mono);
  font-size: 13px;
  color: #FF4D00;
  min-width: 36px;
  text-align: right;
}

.am__row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

.am__submit {
  width: 100%;
  padding: 12px;
  background: #FF4D00;
  color: #0A0A0A;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 13px;
  border: none;
  cursor: pointer;
  transition: opacity 0.2s ease;
  margin-top: 4px;
}
.am__submit:hover:not(:disabled) { opacity: 0.9; }
.am__submit:disabled { opacity: 0.5; cursor: not-allowed; }

.am__empty {
  text-align: center;
  padding: 32px;
  font-family: var(--font-mono);
  font-size: 13px;
  color: #555;
}

@media (max-width: 640px) { .am__row { grid-template-columns: 1fr; } }
`

/* ────────────────────────────────────────────────────────────── */
/*  Component                                                     */
/* ────────────────────────────────────────────────────────────── */

export default function AboutManager({ entries }: Props) {
    const router = useRouter()
    const [tab, setTab] = useState<Tab>('bio')
    const [isPending, startTransition] = useTransition()
    const [editing, setEditing] = useState<AboutEntry | 'new' | null>(null)

    const filtered = entries.filter((e) => e.section === tab)

    const handleDelete = (id: string) => {
        startTransition(async () => {
            await deleteAboutEntry(id)
            router.refresh()
        })
    }

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: css }} />

            <h1 className="am__title">About Info</h1>

            {/* Tabs */}
            <div className="am__tabs">
                {TABS.map((t) => (
                    <button
                        key={t}
                        className={`am__tab${tab === t ? ' am__tab--active' : ''}`}
                        onClick={() => setTab(t)}
                    >
                        {TAB_LABELS[t]}
                    </button>
                ))}
            </div>

            <div className="am__header">
                <span />
                <button className="am__add-btn" onClick={() => setEditing('new')}>
                    <Plus /> Add Entry
                </button>
            </div>

            {/* Entry list */}
            {filtered.length > 0 ? (
                filtered.map((entry) => {
                    const meta = entry.metadata
                    return (
                        <div key={entry.id} className="am__card">
                            <div className="am__card-content">
                                {entry.title && <p className="am__card-title">{entry.title}</p>}
                                {entry.content && <p className="am__card-text">{entry.content}</p>}
                                <div className="am__card-meta">
                                    {meta?.company && <span className="am__card-meta-item">{meta.company}</span>}
                                    {meta?.location && <span className="am__card-meta-item">{meta.location}</span>}
                                    {meta?.start_date && (
                                        <span className="am__card-meta-item">
                                            {meta.start_date}{meta.end_date ? ` to ${meta.end_date}` : ''}
                                        </span>
                                    )}
                                    {meta?.tags?.map((t) => <span key={t} className="am__card-meta-item">{t}</span>)}
                                </div>
                                {tab === 'skill' && meta?.proficiency != null && (
                                    <div className="am__proficiency-bar">
                                        <div className="am__proficiency-fill" style={{ width: `${meta.proficiency}%` }} />
                                    </div>
                                )}
                            </div>
                            <div className="am__card-actions">
                                <button className="am__icon-btn" onClick={() => setEditing(entry)}>
                                    <Pencil />
                                </button>
                                <button className="am__icon-btn am__icon-btn--del" onClick={() => handleDelete(entry.id)}>
                                    <Trash2 />
                                </button>
                            </div>
                        </div>
                    )
                })
            ) : (
                <div className="am__empty">No entries for this section yet.</div>
            )}

            {/* Edit / Add modal */}
            {editing !== null && (
                <EntryModal
                    section={tab}
                    entry={editing === 'new' ? null : editing}
                    onClose={() => setEditing(null)}
                    onSaved={() => {
                        setEditing(null)
                        router.refresh()
                    }}
                />
            )}
        </>
    )
}

/* ────────────────────────────────────────────────────────────── */
/*  Entry Modal                                                   */
/* ────────────────────────────────────────────────────────────── */

function EntryModal({
    section,
    entry,
    onClose,
    onSaved,
}: {
    section: Tab
    entry: AboutEntry | null
    onClose: () => void
    onSaved: () => void
}) {
    const meta = entry?.metadata
    const [title, setTitle] = useState(entry?.title ?? '')
    const [content, setContent] = useState(entry?.content ?? '')
    const [displayOrder, setDisplayOrder] = useState(String(entry?.displayOrder ?? 0))
    const [company, setCompany] = useState(meta?.company ?? '')
    const [startDate, setStartDate] = useState(meta?.start_date ?? '')
    const [endDate, setEndDate] = useState(meta?.end_date ?? '')
    const [location, setLocation] = useState(meta?.location ?? '')
    const [tags, setTags] = useState(meta?.tags?.join(', ') ?? '')
    const [proficiency, setProficiency] = useState(meta?.proficiency ?? 50)

    const actionWrapper = useCallback(
        async (_prev: AboutFormState, formData: FormData): Promise<AboutFormState> => {
            const result = await saveAboutEntry(_prev, formData)
            if (result?.success) onSaved()
            return result
        },
        [onSaved]
    )

    const [state, formAction, isPending] = useActionState<AboutFormState, FormData>(
        actionWrapper,
        null
    )

    const isExpOrEdu = section === 'experience' || section === 'education'
    const isSkill = section === 'skill'

    return (
        <div className="am__overlay" onClick={onClose}>
            <div className="am__modal" onClick={(e) => e.stopPropagation()}>
                <div className="am__modal-title">
                    <span>{entry ? 'Edit' : 'Add'} {TAB_LABELS[section]} Entry</span>
                    <button className="am__icon-btn" onClick={onClose}><X /></button>
                </div>

                <form action={formAction}>
                    {entry?.id && <input type="hidden" name="id" value={entry.id} />}
                    <input type="hidden" name="section" value={section} />

                    <div className="am__group">
                        <label className="am__label">Title</label>
                        <input name="title" className="am__input" value={title} onChange={(e) => setTitle(e.target.value)} />
                    </div>

                    <div className="am__group">
                        <label className="am__label">Content</label>
                        <textarea name="content" className="am__input am__textarea" value={content} onChange={(e) => setContent(e.target.value)} rows={3} />
                    </div>

                    <div className="am__group">
                        <label className="am__label">Display Order</label>
                        <input name="displayOrder" type="number" className="am__input" value={displayOrder} onChange={(e) => setDisplayOrder(e.target.value)} />
                    </div>

                    {/* Experience / Education metadata */}
                    {isExpOrEdu && (
                        <>
                            <div className="am__group">
                                <label className="am__label">Company / Institution</label>
                                <input name="meta_company" className="am__input" value={company} onChange={(e) => setCompany(e.target.value)} />
                            </div>
                            <div className="am__row">
                                <div className="am__group">
                                    <label className="am__label">Start Date</label>
                                    <input name="meta_start_date" className="am__input" value={startDate} onChange={(e) => setStartDate(e.target.value)} placeholder="2022" />
                                </div>
                                <div className="am__group">
                                    <label className="am__label">End Date</label>
                                    <input name="meta_end_date" className="am__input" value={endDate} onChange={(e) => setEndDate(e.target.value)} placeholder="Present" />
                                </div>
                            </div>
                            <div className="am__group">
                                <label className="am__label">Location</label>
                                <input name="meta_location" className="am__input" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Remote" />
                            </div>
                        </>
                    )}

                    {/* Skill metadata */}
                    {isSkill && (
                        <>
                            <div className="am__group">
                                <label className="am__label">Category Tags</label>
                                <input name="meta_tags" className="am__input" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Design, Development" />
                            </div>
                            <div className="am__group">
                                <label className="am__label">Proficiency</label>
                                <input type="hidden" name="meta_proficiency" value={proficiency} />
                                <div className="am__slider-row">
                                    <input
                                        type="range"
                                        className="am__slider"
                                        min={0}
                                        max={100}
                                        value={proficiency}
                                        onChange={(e) => setProficiency(parseInt(e.target.value, 10))}
                                    />
                                    <span className="am__slider-val">{proficiency}%</span>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Bio - tags */}
                    {section === 'bio' && (
                        <div className="am__group">
                            <label className="am__label">Tags (comma-separated)</label>
                            <input name="meta_tags" className="am__input" value={tags} onChange={(e) => setTags(e.target.value)} />
                        </div>
                    )}

                    <button type="submit" className="am__submit" disabled={isPending}>
                        {isPending ? 'Saving…' : 'Save'}
                    </button>
                    {state?.error && (
                        <p style={{ color: '#FF4444', fontFamily: 'var(--font-mono)', fontSize: 12, marginTop: 8 }}>
                            {state.error}
                        </p>
                    )}
                </form>
            </div>
        </div>
    )
}
