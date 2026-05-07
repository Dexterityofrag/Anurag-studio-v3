'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { upsertContentKeys } from '@/app/actions/admin'

const css = /* css */ `
.ipe__title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(1.5rem, 3vw, 2rem);
  color: #FAFAFA;
  margin-bottom: 8px;
}
.ipe__subtitle {
  font-family: var(--font-mono);
  font-size: 12px;
  color: #555;
  letter-spacing: 0.04em;
  margin-bottom: clamp(1.5rem, 3vw, 2.5rem);
}
.ipe__panel-card {
  background: #141414;
  border: 1px solid #262626;
  margin-bottom: 16px;
}
.ipe__panel-header {
  padding: 14px 20px;
  border-bottom: 1px solid #1A1A1A;
  display: flex;
  align-items: center;
  gap: 12px;
}
.ipe__panel-num {
  font-family: var(--font-mono);
  font-size: 11px;
  color: #00FF94;
  letter-spacing: 0.1em;
}
.ipe__panel-title {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 14px;
  color: #FAFAFA;
}
.ipe__panel-body { padding: 20px; display: flex; flex-direction: column; gap: 16px; }
.ipe__field { display: flex; flex-direction: column; gap: 6px; }
.ipe__label {
  font-family: var(--font-mono);
  font-size: 11px;
  color: #8A8A8A;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.ipe__hint { font-size: 10px; color: #555; margin-top: 2px; }
.ipe__input,
.ipe__textarea {
  width: 100%;
  background: #1A1A1A;
  border: 1px solid #262626;
  padding: 10px 14px;
  font-family: var(--font-body);
  font-size: 14px;
  color: #FAFAFA;
  outline: none;
  transition: border-color 0.2s ease;
  resize: vertical;
  border-radius: 0;
  box-sizing: border-box;
}
.ipe__input:focus,
.ipe__textarea:focus { border-color: #00FF94; }
.ipe__preview {
  background: #0D0D0D;
  border: 1px solid #1A1A1A;
  padding: 16px 20px;
  font-family: var(--font-display);
  font-size: 14px;
  color: rgba(240,237,232,0.7);
  line-height: 1.5;
}
.ipe__preview em { color: #00FF94; font-style: normal; }
.ipe__preview-label {
  font-family: var(--font-mono);
  font-size: 10px;
  color: #555;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 8px;
}
.ipe__actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 24px;
}
.ipe__save-btn {
  padding: 10px 28px;
  background: #00FF94;
  color: #0A0A0A;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 13px;
  border: none;
  cursor: pointer;
  transition: opacity 0.2s ease;
}
.ipe__save-btn:hover:not(:disabled) { opacity: 0.88; }
.ipe__save-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.ipe__saved { font-family: var(--font-mono); font-size: 12px; color: #00FF94; }
.ipe__err   { font-family: var(--font-mono); font-size: 12px; color: #FF4444; }
`

const PANEL_DEFAULTS = [
  { body: 'I design for those who crave experiences that are unforgettable', em: 'unforgettable', sub: 'Experience Design' },
  { body: "I don't just deliver design. I deliver outcomes", em: 'outcomes', sub: 'Strategy-first thinking' },
  { body: 'Every pixel is a decision. Every decision is intentional', em: 'intentional', sub: 'Craft + precision' },
]

const DEFAULT_TAGLINE = 'Systems that scale. Typography that respects the reader.\nInteractions that feel inevitable.'

type Row = { key: string; value: string | null }

export default function IntroPanelsEditor({ rows }: { rows: Row[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [err, setErr] = useState('')

  const get = (key: string) => rows.find(r => r.key === key)?.value ?? ''

  const [panels, setPanels] = useState(
    [1, 2, 3].map(n => ({
      body: get(`intro_panels.panel${n}.body`) || PANEL_DEFAULTS[n - 1].body,
      em:   get(`intro_panels.panel${n}.em`)   || PANEL_DEFAULTS[n - 1].em,
      sub:  get(`intro_panels.panel${n}.sub`)  || PANEL_DEFAULTS[n - 1].sub,
    }))
  )
  const [tagline, setTagline] = useState(get('about_teaser.tagline') || DEFAULT_TAGLINE)

  const update = (i: number, field: 'body' | 'em' | 'sub', val: string) =>
    setPanels(prev => prev.map((p, j) => j === i ? { ...p, [field]: val } : p))

  const handleSave = () => {
    const entries = [
      ...panels.flatMap((p, i) => [
        { key: `intro_panels.panel${i + 1}.body`, value: p.body, groupName: 'intro_panels', description: `Panel ${i + 1} statement text` },
        { key: `intro_panels.panel${i + 1}.em`,   value: p.em,   groupName: 'intro_panels', description: `Panel ${i + 1} emphasized word` },
        { key: `intro_panels.panel${i + 1}.sub`,  value: p.sub,  groupName: 'intro_panels', description: `Panel ${i + 1} subtitle label` },
      ]),
      { key: 'about_teaser.tagline', value: tagline, groupName: 'about_teaser', description: 'About teaser tagline on home page' },
    ]
    startTransition(async () => {
      const res = await upsertContentKeys(entries)
      if (res.error) { setErr(res.error) }
      else { setSaved(true); setErr(''); setTimeout(() => setSaved(false), 2500); router.refresh() }
    })
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <h1 className="ipe__title">Intro Panels</h1>
      <p className="ipe__subtitle">3 FULL-SCREEN SCROLL PANELS · CHANGES REFLECT ON HOME PAGE AFTER SAVE</p>

      {panels.map((p, i) => (
        <div key={i} className="ipe__panel-card">
          <div className="ipe__panel-header">
            <span className="ipe__panel-num">0{i + 1}</span>
            <span className="ipe__panel-title">Panel {i + 1}</span>
          </div>
          <div className="ipe__panel-body">
            <div className="ipe__field">
              <label className="ipe__label">Statement (body text)</label>
              <span className="ipe__hint">The full sentence shown during scroll. Write it plain — the emphasis word below gets highlighted in accent colour.</span>
              <textarea
                className="ipe__textarea"
                rows={3}
                value={p.body}
                onChange={e => update(i, 'body', e.target.value)}
              />
            </div>
            <div className="ipe__field">
              <label className="ipe__label">Emphasis word</label>
              <span className="ipe__hint">Must be an exact substring of the body text above. It will appear in green.</span>
              <input
                className="ipe__input"
                value={p.em}
                onChange={e => update(i, 'em', e.target.value)}
                placeholder="e.g. unforgettable"
              />
            </div>
            <div className="ipe__field">
              <label className="ipe__label">Subtitle / label</label>
              <span className="ipe__hint">Short tag shown below the statement (e.g. "Experience Design").</span>
              <input
                className="ipe__input"
                value={p.sub}
                onChange={e => update(i, 'sub', e.target.value)}
                placeholder="e.g. Experience Design"
              />
            </div>
            {/* Live preview */}
            <div className="ipe__field">
              <div className="ipe__preview-label">Preview</div>
              <div className="ipe__preview">
                {p.body && p.em && p.body.includes(p.em)
                  ? <span dangerouslySetInnerHTML={{ __html: p.body.replace(p.em, `<em>${p.em}</em>`) }} />
                  : <span>{p.body}</span>
                }
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* About Teaser tagline */}
      <div className="ipe__panel-card">
        <div className="ipe__panel-header">
          <span className="ipe__panel-num">—</span>
          <span className="ipe__panel-title">About Teaser Tagline</span>
        </div>
        <div className="ipe__panel-body">
          <div className="ipe__field">
            <label className="ipe__label">Tagline</label>
            <span className="ipe__hint">Shown in the About Teaser section on the home page. Use \n to split into multiple lines.</span>
            <textarea
              className="ipe__textarea"
              rows={3}
              value={tagline}
              onChange={e => setTagline(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="ipe__actions">
        <button className="ipe__save-btn" onClick={handleSave} disabled={isPending}>
          {isPending ? 'Saving…' : 'Save'}
        </button>
        {saved && <span className="ipe__saved">✓ Saved. Home page updated.</span>}
        {err   && <span className="ipe__err">{err}</span>}
      </div>
    </>
  )
}
