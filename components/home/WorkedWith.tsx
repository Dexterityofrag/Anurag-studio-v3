'use client'

import { useRef, useEffect } from 'react'

/* ────────────────────────────────────────────────────────────── */
/*  Client data                                                   */
/* ────────────────────────────────────────────────────────────── */

const clients = [
  { name: 'EVOLUSIS',  sector: 'AI / SAAS PLATFORM' },
  { name: 'LOCALGO',   sector: 'LOCAL SERVICES / APP' },
  { name: 'BOGAMES',   sector: 'GAMING / ENTERTAINMENT' },
  { name: 'FREELANCE', sector: 'PRODUCT DESIGN / UI' },
]

/* ────────────────────────────────────────────────────────────── */
/*  Styles                                                        */
/* ────────────────────────────────────────────────────────────── */

const css = `
.ww {
  padding: clamp(6rem,12vh,10rem) var(--page-px, clamp(1.5rem,5vw,6rem));
  overflow: hidden;
  max-width: 100%;
  box-sizing: border-box;
}

.ww__hdr {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding-bottom: clamp(1.5rem,3vh,2.5rem);
  border-bottom: 1px solid rgba(255,255,255,0.08);
  margin-bottom: 0;
}
.ww__title {
  font-family: var(--font-display, 'Space Grotesk', sans-serif);
  font-size: clamp(2.5rem, 5.5vw, 5rem);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: -0.03em;
  color: var(--text, #FAFAFA);
  margin: 0;
  line-height: 1;
  display: flex;
  align-items: baseline;
  gap: 0.3em;
}
.ww__title em {
  font-style: normal;
  color: transparent;
  -webkit-text-stroke: 1.5px rgba(255,255,255,0.55);
}
.ww__meta {
  font-family: var(--font-mono, 'DM Mono', monospace);
  font-size: 11px;
  color: rgba(255,255,255,0.35);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  text-align: right;
}

.ww__cols {
  display: grid;
  grid-template-columns: 1fr 260px;
  padding: 14px 0;
  font-family: var(--font-mono, 'DM Mono', monospace);
  font-size: 10px;
  text-transform: uppercase;
  color: rgba(255,255,255,0.25);
  letter-spacing: 0.1em;
  border-bottom: 1px solid rgba(255,255,255,0.04);
}

.ww-row {
  border-top: 1px solid rgba(255,255,255,0.06);
  cursor: default;
  overflow: hidden;
}
.ww-row__visible {
  display: grid;
  grid-template-columns: 1fr 260px;
  padding: clamp(1.5rem,3.5vh,2.5rem) 0;
  align-items: center;
}

.ww-row__name {
  font-family: var(--font-display, 'Space Grotesk', sans-serif);
  font-size: clamp(2.2rem, 5vw, 5rem);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: -0.025em;
  line-height: 1;
  display: inline-block;
  color: transparent;
  -webkit-text-stroke: 1px rgba(255,255,255,0.22);
  transition:
    color 0.35s cubic-bezier(0.22,1,0.36,1),
    -webkit-text-stroke 0.35s cubic-bezier(0.22,1,0.36,1),
    transform 0.35s cubic-bezier(0.22,1,0.36,1);
}
.ww-row:hover .ww-row__name {
  color: var(--accent, #C8FF00);
  -webkit-text-stroke: 1px transparent;
  transform: translateX(12px);
}

.ww-row__sector {
  font-family: var(--font-mono, 'DM Mono', monospace);
  font-size: 11px;
  color: rgba(255,255,255,0.35);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  text-align: right;
  transition: color 0.3s ease;
}
.ww-row:hover .ww-row__sector {
  color: rgba(255,255,255,0.6);
}

.ww-float {
  position: fixed;
  top: 0; left: 0;
  width: 380px;
  aspect-ratio: 16 / 9;
  border-radius: 6px;
  opacity: 0;
  z-index: 50;
  pointer-events: none;
  transition: opacity 0.25s ease;
  overflow: hidden;
  will-change: transform, opacity;
  background: linear-gradient(135deg, #111 0%, #1a1a1a 100%);
  border: 1px solid rgba(255,255,255,0.06);
}
.ww-float__inner {
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-mono, 'DM Mono', monospace);
  font-size: 10px; text-transform: uppercase;
  letter-spacing: 0.12em; color: rgba(255,255,255,0.2);
}

@media (max-width: 768px) {
  .ww__cols { display: none; }
  .ww-row__visible { grid-template-columns: 1fr; padding: 1.5rem 0; }
  .ww-row__sector { display: none; }
  .ww-float { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  .ww-row__name { transition: none; }
}
`

/* ────────────────────────────────────────────────────────────── */
/*  Component                                                     */
/* ────────────────────────────────────────────────────────────── */

export default function WorkedWith() {
  const floatRef   = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const float   = floatRef.current
    const section = sectionRef.current
    if (!float || !section) return

    let raf = 0
    let tx = 0, ty = 0
    let cx = 0, cy = 0

    const onMove = (e: MouseEvent) => { cx = e.clientX; cy = e.clientY }
    window.addEventListener('mousemove', onMove, { passive: true })

    const tick = () => {
      tx += (cx - tx) * 0.12
      ty += (cy - ty) * 0.12
      float.style.transform = `translate(${tx + 28}px, ${ty - 90}px)`
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    const rows = section.querySelectorAll<HTMLElement>('.ww-row')
    rows.forEach(row => {
      row.addEventListener('mouseenter', () => { float.style.opacity = '1' })
      row.addEventListener('mouseleave', () => { float.style.opacity = '0' })
    })

    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <section className="ww" ref={sectionRef} id="worked-with">
        <div className="ww__hdr">
          <h2 className="ww__title">
            WORKED <em>WITH</em>
          </h2>
          <span className="ww__meta">Selected Clients &amp; Partners</span>
        </div>

        <div className="ww__cols">
          <span>Partner</span>
          <span style={{ textAlign: 'right' }}>Sector</span>
        </div>

        {clients.map((client) => (
          <div className="ww-row" key={client.name}>
            <div className="ww-row__visible">
              <span className="ww-row__name">{client.name}</span>
              <span className="ww-row__sector">{client.sector}</span>
            </div>
          </div>
        ))}
      </section>

      <div className="ww-float" ref={floatRef} aria-hidden="true">
        <div className="ww-float__inner">Project</div>
      </div>
    </>
  )
}
