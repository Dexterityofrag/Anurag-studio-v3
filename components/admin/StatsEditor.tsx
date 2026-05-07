'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { upsertContentKeys } from '@/app/actions/admin'

const css = /* css */ `
.ste__title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(1.5rem, 3vw, 2rem);
  color: #FAFAFA;
  margin-bottom: 8px;
}
.ste__subtitle {
  font-family: var(--font-mono);
  font-size: 12px;
  color: #555;
  letter-spacing: 0.04em;
  margin-bottom: clamp(1.5rem, 3vw, 2.5rem);
}
.ste__section-head {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 15px;
  color: #FAFAFA;
  margin: 24px 0 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #1A1A1A;
}
.ste__section-head:first-of-type { margin-top: 0; }
.ste__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}
.ste__stat-card {
  background: #141414;
  border: 1px solid #262626;
  padding: 16px;
}
.ste__stat-num {
  font-family: var(--font-mono);
  font-size: 10px;
  color: #00FF94;
  letter-spacing: 0.1em;
  margin-bottom: 12px;
}
.ste__field { display: flex; flex-direction: column; gap: 5px; margin-bottom: 10px; }
.ste__field:last-child { margin-bottom: 0; }
.ste__label {
  font-family: var(--font-mono);
  font-size: 10px;
  color: #8A8A8A;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.ste__hint { font-size: 10px; color: #444; }
.ste__input {
  width: 100%;
  background: #1A1A1A;
  border: 1px solid #262626;
  padding: 8px 12px;
  font-family: var(--font-body);
  font-size: 13px;
  color: #FAFAFA;
  outline: none;
  transition: border-color 0.2s ease;
  border-radius: 0;
  box-sizing: border-box;
}
.ste__input:focus { border-color: #00FF94; }
.ste__preview-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}
.ste__preview-chip {
  background: #0D0D0D;
  border: 1px solid #1A1A1A;
  padding: 12px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 80px;
}
.ste__preview-val {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 20px;
  color: #FAFAFA;
}
.ste__preview-lbl {
  font-family: var(--font-mono);
  font-size: 9px;
  color: #555;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  text-align: center;
}
.ste__actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 24px;
}
.ste__save-btn {
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
.ste__save-btn:hover:not(:disabled) { opacity: 0.88; }
.ste__save-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.ste__saved { font-family: var(--font-mono); font-size: 12px; color: #00FF94; }
.ste__err   { font-family: var(--font-mono); font-size: 12px; color: #FF4444; }
`

const HOME_DEFAULTS = [
  { display: '1.5+', label: 'Years Experience' },
  { display: '5+',   label: 'Projects Shipped'  },
  { display: '100%', label: 'On-Time Delivery'  },
  { display: '5+',   label: 'Happy Clients'     },
]

const ABOUT_DEFAULTS = [
  { display: '1.5+', label: 'Years Experience' },
  { display: '4+',   label: 'Projects Shipped'  },
  { display: '3',    label: 'Certifications'    },
]

type Row = { key: string; value: string | null }

export default function StatsEditor({ rows }: { rows: Row[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [err, setErr] = useState('')

  const get = (key: string) => rows.find(r => r.key === key)?.value ?? ''

  const [homeStats, setHomeStats] = useState(
    [1, 2, 3, 4].map(n => ({
      display: get(`home_stats.item${n}.display`) || HOME_DEFAULTS[n - 1].display,
      label:   get(`home_stats.item${n}.label`)   || HOME_DEFAULTS[n - 1].label,
    }))
  )

  const [aboutStats, setAboutStats] = useState(
    [1, 2, 3].map(n => ({
      display: get(`about_stats.item${n}.display`) || ABOUT_DEFAULTS[n - 1].display,
      label:   get(`about_stats.item${n}.label`)   || ABOUT_DEFAULTS[n - 1].label,
    }))
  )

  const updateHome  = (i: number, f: 'display'|'label', v: string) =>
    setHomeStats(prev => prev.map((s, j) => j === i ? { ...s, [f]: v } : s))
  const updateAbout = (i: number, f: 'display'|'label', v: string) =>
    setAboutStats(prev => prev.map((s, j) => j === i ? { ...s, [f]: v } : s))

  const handleSave = () => {
    const entries = [
      ...homeStats.flatMap((s, i) => [
        { key: `home_stats.item${i + 1}.display`, value: s.display, groupName: 'home_stats', description: `Home stat ${i + 1} value` },
        { key: `home_stats.item${i + 1}.label`,   value: s.label,   groupName: 'home_stats', description: `Home stat ${i + 1} label` },
      ]),
      ...aboutStats.flatMap((s, i) => [
        { key: `about_stats.item${i + 1}.display`, value: s.display, groupName: 'about_stats', description: `About stat ${i + 1} value` },
        { key: `about_stats.item${i + 1}.label`,   value: s.label,   groupName: 'about_stats', description: `About stat ${i + 1} label` },
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

      <h1 className="ste__title">Stats</h1>
      <p className="ste__subtitle">KEY METRICS · CHANGES REFLECT ON HOME + ABOUT PAGES AFTER SAVE</p>

      {/* Home stats */}
      <p className="ste__section-head">Home Page Stats (4 items)</p>
      <div className="ste__preview-row">
        {homeStats.map((s, i) => (
          <div key={i} className="ste__preview-chip">
            <span className="ste__preview-val">{s.display || '—'}</span>
            <span className="ste__preview-lbl">{s.label || '—'}</span>
          </div>
        ))}
      </div>
      <div className="ste__grid">
        {homeStats.map((s, i) => (
          <div key={i} className="ste__stat-card">
            <p className="ste__stat-num">STAT 0{i + 1}</p>
            <div className="ste__field">
              <label className="ste__label">Value</label>
              <span className="ste__hint">Include suffix, e.g. "1.5+" or "100%"</span>
              <input className="ste__input" value={s.display} onChange={e => updateHome(i, 'display', e.target.value)} placeholder="e.g. 1.5+" />
            </div>
            <div className="ste__field">
              <label className="ste__label">Label</label>
              <input className="ste__input" value={s.label} onChange={e => updateHome(i, 'label', e.target.value)} placeholder="e.g. Years Experience" />
            </div>
          </div>
        ))}
      </div>

      {/* About stats */}
      <p className="ste__section-head">About Page Stats (3 items)</p>
      <div className="ste__preview-row">
        {aboutStats.map((s, i) => (
          <div key={i} className="ste__preview-chip">
            <span className="ste__preview-val">{s.display || '—'}</span>
            <span className="ste__preview-lbl">{s.label || '—'}</span>
          </div>
        ))}
      </div>
      <div className="ste__grid">
        {aboutStats.map((s, i) => (
          <div key={i} className="ste__stat-card">
            <p className="ste__stat-num">STAT 0{i + 1}</p>
            <div className="ste__field">
              <label className="ste__label">Value</label>
              <span className="ste__hint">Include suffix, e.g. "4+" or "3"</span>
              <input className="ste__input" value={s.display} onChange={e => updateAbout(i, 'display', e.target.value)} placeholder="e.g. 4+" />
            </div>
            <div className="ste__field">
              <label className="ste__label">Label</label>
              <input className="ste__input" value={s.label} onChange={e => updateAbout(i, 'label', e.target.value)} placeholder="e.g. Projects Shipped" />
            </div>
          </div>
        ))}
      </div>

      <div className="ste__actions">
        <button className="ste__save-btn" onClick={handleSave} disabled={isPending}>
          {isPending ? 'Saving…' : 'Save Stats'}
        </button>
        {saved && <span className="ste__saved">✓ Saved. Pages updated.</span>}
        {err   && <span className="ste__err">{err}</span>}
      </div>
    </>
  )
}
