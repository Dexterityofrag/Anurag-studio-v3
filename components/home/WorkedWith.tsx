'use client'

import { useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

/* ────────────────────────────────────────────────────────────── */
/*  Types                                                          */
/* ────────────────────────────────────────────────────────────── */

export interface PartnerRow {
  id: string
  name: string
  sector: string
  link: string
  external: boolean | null
  comingSoon: boolean | null
  previewImageUrl?: string | null
  displayOrder: number | null
}

/* ────────────────────────────────────────────────────────────── */
/*  Styles                                                         */
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
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.8s ease, transform 0.8s cubic-bezier(0.22,1,0.36,1);
}
.ww__hdr.ww--in {
  opacity: 1;
  transform: translateY(0);
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
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
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
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 10px;
  text-transform: uppercase;
  color: rgba(255,255,255,0.25);
  letter-spacing: 0.1em;
  border-bottom: 1px solid rgba(255,255,255,0.04);
}

/* ─── ROW ENTRANCE ────────────────────────────────────────────── */
.ww__cols,
.ww-row {
  opacity: 0;
  transform: translateX(-18px);
  transition:
    opacity 0.75s cubic-bezier(0.22,1,0.36,1),
    transform 0.75s cubic-bezier(0.22,1,0.36,1),
    background 0.35s ease;
}
.ww__cols.ww--in,
.ww-row.ww--in {
  opacity: 1;
  transform: translateX(0);
}

/* ─── ROW BASE ───────────────────────────────────────────────── */
.ww-row {
  border-top: 1px solid rgba(255,255,255,0.06);
  cursor: none;
  overflow: hidden;
  position: relative;
  display: block;
  text-decoration: none;
  color: inherit;
}
.ww-row:hover { background: rgba(255,255,255,0.01); }

.ww-row__visible {
  display: grid;
  grid-template-columns: 1fr 260px;
  padding: clamp(1.5rem,3.5vh,2.5rem) 0;
  align-items: center;
  position: relative;
  z-index: 1;
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
  color: var(--accent, #00FF94);
  -webkit-text-stroke: 1px transparent;
  transform: translateX(12px);
}

.ww-row__sector {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 11px;
  color: rgba(255,255,255,0.35);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  text-align: right;
  transition: color 0.3s ease;
}
.ww-row:hover .ww-row__sector { color: rgba(255,255,255,0.6); }

/* ─── COMING SOON OVERLAY (row) ──────────────────────────────── */
.ww-row--cs .ww-row__name {
  -webkit-text-stroke: 1px rgba(255,255,255,0.14);
}
.ww-cs-overlay {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 clamp(16px, 3vw, 32px);
  background: linear-gradient(
    90deg,
    rgba(0,255,148,0.04) 0%,
    rgba(0,255,148,0.02) 60%,
    transparent 100%
  );
  opacity: 0;
  transform: translateY(101%);
  transition: transform 0.45s cubic-bezier(0.22,1,0.36,1), opacity 0s 0.45s;
  border-top: 1px solid rgba(0,255,148,0.12);
  border-bottom: 1px solid rgba(0,255,148,0.06);
  pointer-events: none;
}
.ww-row--cs:hover .ww-cs-overlay {
  transform: translateY(0);
  opacity: 1;
  transition: transform 0.45s cubic-bezier(0.22,1,0.36,1), opacity 0s;
}

.ww-cs-text {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: clamp(11px, 1.2vw, 13px);
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--accent, #00FF94);
  animation: ww-glitch 4s ease infinite;
}
@keyframes ww-glitch {
  0%, 90%, 100% { opacity: 1; transform: none; }
  92% { opacity: 0.8; transform: translateX(2px); clip-path: inset(20% 0 60% 0); }
  94% { opacity: 1; transform: translateX(-2px); clip-path: inset(60% 0 10% 0); }
  96% { opacity: 0.9; transform: none; clip-path: none; }
}

.ww-cs-badge {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(0,255,148,0.5);
  border: 1px solid rgba(0,255,148,0.2);
  padding: 4px 12px;
  border-radius: 999px;
}

/* ─── EXTERNAL LINK INDICATOR ────────────────────────────────── */
.ww-row__arrow {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translate(8px, -50%) scale(0.8);
  opacity: 0;
  font-size: clamp(1.5rem, 3vw, 2.5rem);
  color: var(--accent, #00FF94);
  font-family: var(--font-display, 'Space Grotesk', sans-serif);
  font-weight: 300;
  transition: opacity 0.3s ease, transform 0.35s cubic-bezier(0.22,1,0.36,1);
  z-index: 3;
  pointer-events: none;
  line-height: 1;
}
.ww-row:hover .ww-row__arrow {
  opacity: 1;
  transform: translate(0, -50%) scale(1);
}

/* ─── FLOATING PREVIEW CARD ──────────────────────────────────── */
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
  background: #0a0a0a;
  border: 1px solid rgba(255,255,255,0.08);
}

/* Image preview */
.ww-float__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* ─── SEXY COMING SOON CARD ──────────────────────────────────── */
.ww-float__cs {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: #080808;
  overflow: hidden;
}

/* Noise texture */
.ww-float__cs::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
  opacity: 0.35;
  pointer-events: none;
}

/* Scanlines */
.ww-float__cs::after {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0,0,0,0.18) 2px,
    rgba(0,0,0,0.18) 4px
  );
  pointer-events: none;
}

/* Corner brackets */
.ww-float__cs-bracket {
  position: absolute;
  width: 18px;
  height: 18px;
  border-color: rgba(0,255,148,0.3);
  border-style: solid;
}
.ww-float__cs-bracket--tl { top: 14px; left: 14px; border-width: 1px 0 0 1px; }
.ww-float__cs-bracket--tr { top: 14px; right: 14px; border-width: 1px 1px 0 0; }
.ww-float__cs-bracket--bl { bottom: 14px; left: 14px; border-width: 0 0 1px 1px; }
.ww-float__cs-bracket--br { bottom: 14px; right: 14px; border-width: 0 1px 1px 0; }

/* Horizontal accent line */
.ww-float__cs-line {
  position: absolute;
  left: 14px;
  right: 14px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(0,255,148,0.15), transparent);
}
.ww-float__cs-line--t { top: 40%; }
.ww-float__cs-line--b { bottom: 40%; }

.ww-float__cs-label {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 9px;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: rgba(0,255,148,0.35);
  position: relative;
  z-index: 1;
}

.ww-float__cs-title {
  font-family: var(--font-display, 'Space Grotesk', sans-serif);
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.02em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.12);
  -webkit-text-stroke: 0.5px rgba(255,255,255,0.18);
  position: relative;
  z-index: 1;
  animation: cs-flicker 6s ease-in-out infinite;
}

@keyframes cs-flicker {
  0%, 88%, 100%  { opacity: 1; }
  90%            { opacity: 0.6; }
  91%            { opacity: 1; }
  93%            { opacity: 0.7; }
  94%            { opacity: 1; }
}

.ww-float__cs-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: rgba(0,255,148,0.5);
  position: relative;
  z-index: 1;
  animation: cs-pulse 2s ease-in-out infinite;
}
@keyframes cs-pulse {
  0%, 100% { opacity: 0.5; transform: scale(1); box-shadow: 0 0 0 0 rgba(0,255,148,0.4); }
  50%       { opacity: 1; transform: scale(1.3); box-shadow: 0 0 0 4px rgba(0,255,148,0); }
}

@media (max-width: 768px) {
  .ww__cols { display: none; }
  .ww-row__visible { grid-template-columns: 1fr; padding: 1.5rem 0; }
  .ww-row__sector { display: none; }
  .ww-float { display: none; }
  .ww-cs-badge { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  .ww-row__name { transition: none; }
  .ww-cs-text { animation: none; }
  .ww-float__cs-title { animation: none; }
  .ww-float__cs-dot { animation: none; }
}
`

/* ────────────────────────────────────────────────────────────── */
/*  Component                                                      */
/* ────────────────────────────────────────────────────────────── */

interface Props {
  partners?: PartnerRow[]
}

// Fallback if no DB data
const FALLBACK_PARTNERS: PartnerRow[] = [
  { id: '1', name: 'EVOLUSIS',  sector: 'AI / SAAS PLATFORM',    link: 'https://evolusis.com', external: true,  comingSoon: false, previewImageUrl: null, displayOrder: 0 },
  { id: '2', name: 'LOCALGO',   sector: 'LOCAL SERVICES / APP',   link: '/coming-soon',          external: false, comingSoon: true,  previewImageUrl: null, displayOrder: 1 },
  { id: '3', name: 'BOGAMES',   sector: 'GAMING / ENTERTAINMENT', link: '/coming-soon',          external: false, comingSoon: true,  previewImageUrl: null, displayOrder: 2 },
  { id: '4', name: 'FREELANCE', sector: 'PRODUCT DESIGN / UI',    link: '/coming-soon',          external: false, comingSoon: true,  previewImageUrl: null, displayOrder: 3 },
]

export default function WorkedWith({ partners = FALLBACK_PARTNERS }: Props) {
  const floatRef   = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)

  // Which partner is currently hovered (for showing right preview)
  const activePartnerRef = useRef<PartnerRow | null>(null)

  /* Entrance animation */
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const targets = [
      section.querySelector('.ww__hdr'),
      section.querySelector('.ww__cols'),
      ...Array.from(section.querySelectorAll('.ww-row')),
    ].filter(Boolean) as Element[]

    const io = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return
      targets.forEach((el, i) => {
        const delay = i * 80
        setTimeout(() => el.classList.add('ww--in'), delay)
      })
      io.disconnect()
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' })

    io.observe(section)
    return () => io.disconnect()
  }, [])

  /* Float card + mouse tracking */
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
    rows.forEach((row, i) => {
      row.addEventListener('mouseenter', () => {
        activePartnerRef.current = partners[i] ?? null
        updateFloatContent(float, partners[i])
        float.style.opacity = '1'
      })
      row.addEventListener('mouseleave', () => {
        float.style.opacity = '0'
      })
    })

    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partners])

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

        {partners.map((client) => {
          const rowClass = `ww-row${client.comingSoon ? ' ww-row--cs' : ''}`
          const isExternal = client.external ?? false
          const inner = (
            <>
              <div className="ww-row__visible">
                <span className="ww-row__name">{client.name}</span>
                <span className="ww-row__sector">{client.sector}</span>
              </div>
              {!client.comingSoon && isExternal && (
                <span className="ww-row__arrow" aria-hidden="true">↗</span>
              )}
              {client.comingSoon && (
                <div className="ww-cs-overlay" aria-hidden="true">
                  <span className="ww-cs-text">Coming Soon</span>
                  <span className="ww-cs-badge">In Progress</span>
                </div>
              )}
            </>
          )

          return isExternal ? (
            <a
              key={client.id}
              href={client.link}
              target="_blank"
              rel="noopener noreferrer"
              className={rowClass}
            >
              {inner}
            </a>
          ) : (
            <Link
              key={client.id}
              href={client.link}
              className={rowClass}
            >
              {inner}
            </Link>
          )
        })}
      </section>

      {/* Floating preview — content swapped via JS */}
      <div className="ww-float" ref={floatRef} aria-hidden="true">
        <ComingSoonCard />
      </div>
    </>
  )
}

/* ── Coming Soon card (rendered server-side, shown/hidden by JS) ─ */
function ComingSoonCard() {
  return (
    <div className="ww-float__cs">
      <span className="ww-float__cs-bracket ww-float__cs-bracket--tl" />
      <span className="ww-float__cs-bracket ww-float__cs-bracket--tr" />
      <span className="ww-float__cs-bracket ww-float__cs-bracket--bl" />
      <span className="ww-float__cs-bracket ww-float__cs-bracket--br" />
      <div className="ww-float__cs-line ww-float__cs-line--t" />
      <div className="ww-float__cs-line ww-float__cs-line--b" />
      <span className="ww-float__cs-label">Preview</span>
      <span className="ww-float__cs-title">Coming Soon</span>
      <span className="ww-float__cs-dot" />
    </div>
  )
}

/* ── Swap float card content on hover ──────────────────────────── */
function updateFloatContent(float: HTMLDivElement, partner: PartnerRow | undefined) {
  if (!partner) return

  if (partner.previewImageUrl) {
    float.innerHTML = `<img class="ww-float__img" src="${partner.previewImageUrl}" alt="${partner.name} preview" loading="lazy" />`
  } else {
    // Render the coming-soon card markup
    float.innerHTML = `
      <div class="ww-float__cs">
        <span class="ww-float__cs-bracket ww-float__cs-bracket--tl"></span>
        <span class="ww-float__cs-bracket ww-float__cs-bracket--tr"></span>
        <span class="ww-float__cs-bracket ww-float__cs-bracket--bl"></span>
        <span class="ww-float__cs-bracket ww-float__cs-bracket--br"></span>
        <div class="ww-float__cs-line ww-float__cs-line--t"></div>
        <div class="ww-float__cs-line ww-float__cs-line--b"></div>
        <span class="ww-float__cs-label">Preview</span>
        <span class="ww-float__cs-title">Coming Soon</span>
        <span class="ww-float__cs-dot"></span>
      </div>
    `
  }
}
