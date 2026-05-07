'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { upsertContentKeys } from '@/app/actions/admin'

const css = /* css */ `
.apse__head {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(1.5rem, 3vw, 2rem);
  color: #FAFAFA;
  margin-bottom: 8px;
}
.apse__sub {
  font-family: var(--font-mono);
  font-size: 12px;
  color: #555;
  letter-spacing: 0.04em;
  margin-bottom: clamp(1.5rem, 3vw, 2.5rem);
}
.apse__divider {
  height: 1px;
  background: #1A1A1A;
  margin: 32px 0;
}
.apse__section-head {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 15px;
  color: #FAFAFA;
  margin: 0 0 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #1A1A1A;
}
.apse__card {
  background: #141414;
  border: 1px solid #262626;
  padding: 20px;
  margin-bottom: 12px;
}
.apse__card-label {
  font-family: var(--font-mono);
  font-size: 10px;
  color: #00FF94;
  letter-spacing: 0.1em;
  margin-bottom: 14px;
}
.apse__row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
@media (max-width: 640px) { .apse__row { grid-template-columns: 1fr; } }
.apse__field { display: flex; flex-direction: column; gap: 5px; margin-bottom: 12px; }
.apse__field:last-child { margin-bottom: 0; }
.apse__label {
  font-family: var(--font-mono);
  font-size: 10px;
  color: #8A8A8A;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.apse__hint { font-size: 10px; color: #444; }
.apse__input {
  width: 100%;
  background: #1A1A1A;
  border: 1px solid #262626;
  padding: 8px 12px;
  font-family: var(--font-body);
  font-size: 13px;
  color: #FAFAFA;
  outline: none;
  border-radius: 0;
  transition: border-color 0.2s ease;
  box-sizing: border-box;
}
.apse__input:focus { border-color: #00FF94; }
.apse__textarea { resize: vertical; min-height: 90px; }
.apse__actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 24px;
}
.apse__save-btn {
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
.apse__save-btn:hover:not(:disabled) { opacity: 0.88; }
.apse__save-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.apse__saved { font-family: var(--font-mono); font-size: 12px; color: #00FF94; }
.apse__err   { font-family: var(--font-mono); font-size: 12px; color: #FF4444; }
`

type Row = { key: string; value: string | null }

export default function AboutPageSectionsEditor({ rows }: { rows: Row[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [err, setErr] = useState('')

  const get = (key: string) => rows.find(r => r.key === key)?.value ?? ''

  /* ── Off-screen ───────────────────────────────────────────── */
  const [osTitle, setOsTitle] = useState(get('about_page.offscreen.title'))
  const [osBody, setOsBody] = useState(get('about_page.offscreen.body'))

  /* ── Philosophy ───────────────────────────────────────────── */
  const [phil, setPhil] = useState([1, 2].map(n => ({
    index:    get(`about_page.philosophy${n}.index`),
    title:    get(`about_page.philosophy${n}.title`),
    subtitle: get(`about_page.philosophy${n}.subtitle`),
    body:     get(`about_page.philosophy${n}.body`),
  })))

  const updatePhil = (i: number, f: keyof (typeof phil)[0], v: string) =>
    setPhil(prev => prev.map((p, j) => j === i ? { ...p, [f]: v } : p))

  /* ── Foundations ──────────────────────────────────────────── */
  const [found, setFound] = useState([1, 2, 3].map(n => ({
    num:   get(`about_page.foundation${n}.num`),
    title: get(`about_page.foundation${n}.title`),
    body:  get(`about_page.foundation${n}.body`),
  })))

  const updateFound = (i: number, f: keyof (typeof found)[0], v: string) =>
    setFound(prev => prev.map((p, j) => j === i ? { ...p, [f]: v } : p))

  const handleSave = () => {
    const entries = [
      { key: 'about_page.offscreen.title', value: osTitle, groupName: 'about_page', description: 'Off-Screen section title (use \\n for line break)' },
      { key: 'about_page.offscreen.body',  value: osBody,  groupName: 'about_page', description: 'Off-Screen section body text' },
      ...phil.flatMap((p, i) => [
        { key: `about_page.philosophy${i + 1}.index`,    value: p.index,    groupName: 'about_page', description: `Philosophy ${i+1} index label` },
        { key: `about_page.philosophy${i + 1}.title`,    value: p.title,    groupName: 'about_page', description: `Philosophy ${i+1} title` },
        { key: `about_page.philosophy${i + 1}.subtitle`, value: p.subtitle, groupName: 'about_page', description: `Philosophy ${i+1} subtitle` },
        { key: `about_page.philosophy${i + 1}.body`,     value: p.body,     groupName: 'about_page', description: `Philosophy ${i+1} body` },
      ]),
      ...found.flatMap((f, i) => [
        { key: `about_page.foundation${i + 1}.num`,   value: f.num,   groupName: 'about_page', description: `Foundation ${i+1} number` },
        { key: `about_page.foundation${i + 1}.title`, value: f.title, groupName: 'about_page', description: `Foundation ${i+1} title` },
        { key: `about_page.foundation${i + 1}.body`,  value: f.body,  groupName: 'about_page', description: `Foundation ${i+1} body` },
      ]),
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
      <div className="apse__divider" />
      <h2 className="apse__head">About Page Sections</h2>
      <p className="apse__sub">OFF-SCREEN · PHILOSOPHY · CORE FOUNDATIONS · CHANGES REFLECT ON /ABOUT AFTER SAVE</p>

      {/* ── Off-Screen ── */}
      <p className="apse__section-head">Off-Screen Section</p>
      <div className="apse__card">
        <p className="apse__card-label">02 / THE OFF-SCREEN</p>
        <div className="apse__field">
          <label className="apse__label">Title</label>
          <span className="apse__hint">Use \n to split into two lines</span>
          <input className="apse__input" value={osTitle} onChange={e => setOsTitle(e.target.value)} placeholder="Gaming\n& Music" />
        </div>
        <div className="apse__field">
          <label className="apse__label">Body Text</label>
          <textarea className="apse__input apse__textarea" value={osBody} onChange={e => setOsBody(e.target.value)} placeholder="Off screen, I'm deeply into..." rows={4} />
        </div>
      </div>

      {/* ── Philosophy ── */}
      <p className="apse__section-head">Philosophy Blocks (2)</p>
      {phil.map((p, i) => (
        <div key={i} className="apse__card">
          <p className="apse__card-label">PHILOSOPHY {i + 1}</p>
          <div className="apse__row">
            <div className="apse__field">
              <label className="apse__label">Index Label</label>
              <input className="apse__input" value={p.index} onChange={e => updatePhil(i, 'index', e.target.value)} placeholder="03 / THE DRIVE" />
            </div>
          </div>
          <div className="apse__row">
            <div className="apse__field">
              <label className="apse__label">Title (solid)</label>
              <input className="apse__input" value={p.title} onChange={e => updatePhil(i, 'title', e.target.value)} placeholder="Always" />
            </div>
            <div className="apse__field">
              <label className="apse__label">Subtitle (outline)</label>
              <input className="apse__input" value={p.subtitle} onChange={e => updatePhil(i, 'subtitle', e.target.value)} placeholder="The Best" />
            </div>
          </div>
          <div className="apse__field">
            <label className="apse__label">Body</label>
            <textarea className="apse__input apse__textarea" value={p.body} onChange={e => updatePhil(i, 'body', e.target.value)} rows={4} />
          </div>
        </div>
      ))}

      {/* ── Foundations ── */}
      <p className="apse__section-head">Core Foundations (3)</p>
      {found.map((f, i) => (
        <div key={i} className="apse__card">
          <p className="apse__card-label">FOUNDATION {i + 1}</p>
          <div className="apse__row">
            <div className="apse__field">
              <label className="apse__label">Number</label>
              <input className="apse__input" value={f.num} onChange={e => updateFound(i, 'num', e.target.value)} placeholder={`0${i + 1}`} />
            </div>
            <div className="apse__field">
              <label className="apse__label">Title</label>
              <input className="apse__input" value={f.title} onChange={e => updateFound(i, 'title', e.target.value)} placeholder="Outcome-Driven" />
            </div>
          </div>
          <div className="apse__field">
            <label className="apse__label">Body</label>
            <textarea className="apse__input apse__textarea" value={f.body} onChange={e => updateFound(i, 'body', e.target.value)} rows={3} />
          </div>
        </div>
      ))}

      <div className="apse__actions">
        <button className="apse__save-btn" onClick={handleSave} disabled={isPending}>
          {isPending ? 'Saving…' : 'Save Sections'}
        </button>
        {saved && <span className="apse__saved">✓ Saved. /about updated.</span>}
        {err   && <span className="apse__err">{err}</span>}
      </div>
    </>
  )
}
