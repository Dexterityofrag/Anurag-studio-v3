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

interface HeroEditorProps {
  rows: ContentRow[]
}

/* ────────────────────────────────────────────────────────────── */
/*  Field metadata - drives the rich UI                          */
/* ────────────────────────────────────────────────────────────── */

const FIELD_META: Record<string, {
  label: string
  hint: string
  preview?: string
  multiLine?: boolean
}> = {
  'hero.eyebrow': {
    label: 'Eyebrow Text',
    hint: 'Displayed above the name in DM Mono with ultra-wide letter-spacing. Keep it short and uppercase.',
    preview: 'NAVIGATING THE UNKNOWN, PIXEL BY PIXEL.',
  },
  'hero.subtitle': {
    label: 'Tagline',
    hint: 'Displayed below the name in Space Grotesk at 42% white opacity.',
    preview: 'Precision structure, bold creative vision.',
  },
  'hero.badge': {
    label: 'Status Badge',
    hint: 'Short status label (e.g. "Available for work").',
    preview: 'Available for work',
  },
}

/* ────────────────────────────────────────────────────────────── */
/*  CSS                                                           */
/* ────────────────────────────────────────────────────────────── */

const css = /* css */ `
.he__wrap {
  width: 100%;
  max-width: 960px;
  box-sizing: border-box;
}
.he__title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(1.5rem, 3vw, 2rem);
  color: #FAFAFA;
  margin-bottom: 8px;
}
.he__subtitle {
  font-family: var(--font-mono);
  font-size: 12px;
  color: #555;
  letter-spacing: 0.04em;
  margin-bottom: clamp(1.5rem, 3vw, 2.5rem);
}

/* Preview card */
.he__preview {
  background: #000;
  border: 1px solid #262626;
  border-radius: 4px;
  padding: 32px;
  margin-bottom: 32px;
  position: relative;
  overflow: hidden;
  min-height: 160px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  box-sizing: border-box;
  /* Dot grid */
  background-image: radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px);
  background-size: 24px 24px;
}
.he__preview-eyebrow {
  font-family: 'DM Mono', monospace;
  font-size: 10px;
  color: rgba(255,255,255,0.4);
  letter-spacing: 0.35em;
  text-transform: uppercase;
  text-align: center;
}
.he__preview-name {
  font-family: 'Space Grotesk', sans-serif;
  font-size: clamp(2rem, 5vw, 4rem);
  font-weight: 700;
  letter-spacing: -0.04em;
  text-transform: uppercase;
  color: #f0f0f0;
  line-height: 0.85;
  text-align: center;
}
.he__preview-sub {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 15px;
  color: rgba(255,255,255,0.42);
  text-align: center;
}
.he__preview-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  font-family: 'DM Mono', monospace;
  font-size: 10px;
  color: #0A0A0A;
  background: #00FF94;
  padding: 3px 10px;
  border-radius: 999px;
  font-weight: 600;
  letter-spacing: 0.04em;
}
.he__preview-label {
  position: absolute;
  top: 12px;
  left: 12px;
  font-family: 'DM Mono', monospace;
  font-size: 10px;
  color: #555;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

/* Form */
.he__card {
  background: #141414;
  border: 1px solid #262626;
  margin-bottom: 12px;
  width: 100%;
  box-sizing: border-box;
}
.he__card-header {
  padding: 14px 20px;
  border-bottom: 1px solid #1A1A1A;
  display: flex;
  align-items: center;
  gap: 10px;
}
.he__card-label {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 14px;
  color: #FAFAFA;
}
.he__card-key {
  font-family: var(--font-mono);
  font-size: 10px;
  color: #555;
  letter-spacing: 0.06em;
  margin-left: auto;
}
.he__card-body { padding: 16px 20px; }
.he__hint {
  font-family: var(--font-mono);
  font-size: 11px;
  color: #555;
  margin-bottom: 10px;
  line-height: 1.5;
}
.he__input {
  width: 100%;
  background: #1A1A1A;
  border: 1px solid #262626;
  padding: 10px 14px;
  font-family: var(--font-body);
  font-size: 14px;
  color: #FAFAFA;
  outline: none;
  transition: border-color 0.2s ease;
  resize: none;
  border-radius: 0;
}
.he__input:focus { border-color: #00FF94; }

/* Actions bar */
.he__actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 24px;
}
.he__save-btn {
  padding: 10px 28px;
  background: #00FF94;
  color: #0A0A0A;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 13px;
  border: none;
  cursor: pointer;
  transition: opacity 0.2s ease;
  border-radius: 0;
}
.he__save-btn:hover:not(:disabled) { opacity: 0.88; }
.he__save-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.he__saved {
  font-family: var(--font-mono);
  font-size: 12px;
  color: #00FF94;
}
.he__err {
  font-family: var(--font-mono);
  font-size: 12px;
  color: #FF4444;
}
`

/* ────────────────────────────────────────────────────────────── */
/*  Component                                                     */
/* ────────────────────────────────────────────────────────────── */

export default function HeroEditor({ rows }: HeroEditorProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(rows.map((r) => [r.id, r.value ?? '']))
  )
  const [saved, setSaved] = useState(false)
  const [err, setErr] = useState('')

  // Build id → key map for lookup
  const rowByKey = Object.fromEntries(rows.map((r) => [r.key, r]))

  const getVal = (key: string) => {
    const row = rowByKey[key]
    if (!row) return ''
    return values[row.id] ?? ''
  }
  const setVal = (key: string, val: string) => {
    const row = rowByKey[key]
    if (!row) return
    setValues((v) => ({ ...v, [row.id]: val }))
  }

  const handleSave = () => {
    const entries = rows.map((r) => ({ id: r.id, value: values[r.id] ?? '' }))
    startTransition(async () => {
      const res = await saveContentGroup(entries)
      if (res.error) {
        setErr(res.error)
      } else {
        setSaved(true)
        setErr('')
        setTimeout(() => setSaved(false), 2500)
        router.refresh()
      }
    })
  }

  const eyebrow = getVal('hero.eyebrow')
  const subtitle = getVal('hero.subtitle')
  const badge    = getVal('hero.badge')

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <div className="he__wrap">
      <h1 className="he__title">Hero Section</h1>
      <p className="he__subtitle">LIVE PREVIEW · CHANGES REFLECT ON HOME PAGE AFTER SAVE</p>

      {/* Live preview card */}
      <div className="he__preview">
        <span className="he__preview-label">PREVIEW</span>
        {badge && <span className="he__preview-badge">{badge}</span>}
        <p className="he__preview-eyebrow">{eyebrow || 'EYEBROW TEXT'}</p>
        <p className="he__preview-name">ANURAG<br />ADHIKARI</p>
        <p className="he__preview-sub">{subtitle || 'Tagline goes here.'}</p>
      </div>

      {/* Field cards */}
      {(['hero.eyebrow', 'hero.subtitle', 'hero.badge'] as const).map((key) => {
        const meta = FIELD_META[key]
        const row  = rowByKey[key]
        if (!meta || !row) return null
        return (
          <div key={key} className="he__card">
            <div className="he__card-header">
              <span className="he__card-label">{meta.label}</span>
              <span className="he__card-key">{key}</span>
            </div>
            <div className="he__card-body">
              <p className="he__hint">{meta.hint}</p>
              <input
                className="he__input"
                value={getVal(key)}
                onChange={(e) => setVal(key, e.target.value)}
                placeholder={meta.preview}
              />
            </div>
          </div>
        )
      })}

      {/* Save */}
      <div className="he__actions">
        <button className="he__save-btn" onClick={handleSave} disabled={isPending}>
          {isPending ? 'Saving…' : 'Save Hero'}
        </button>
        {saved && <span className="he__saved">✓ Saved. Home page updated.</span>}
        {err   && <span className="he__err">{err}</span>}
      </div>
      </div>
    </>
  )
}
