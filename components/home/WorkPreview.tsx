'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { Project } from '@/lib/types'

/* ────────────────────────────────────────────────────────────── */
/*  Props                                                         */
/* ────────────────────────────────────────────────────────────── */

interface WorkPreviewProps {
  projects: Project[]
}

/* ────────────────────────────────────────────────────────────── */
/*  Default metrics (shown when project has none in DB)          */
/* ────────────────────────────────────────────────────────────── */

const DEFAULT_METRICS = [
  { val: '100%', lbl: 'On Time' },
  { val: '↑ 2×', lbl: 'Engagement' },
]

/* ────────────────────────────────────────────────────────────── */
/*  Styles                                                        */
/* ────────────────────────────────────────────────────────────── */

const css = /* css */ `
/* ─── SECTION HEADER ─────────────────────────────────────────── */
.fw-section {
  position: relative;
}
.fw-header {
  position: sticky;
  top: 0;
  z-index: 10;
  padding: clamp(2rem,4vh,3.5rem) var(--gutter, 40px) clamp(1.5rem,3vh,2.5rem);
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 24px;
  pointer-events: none;
}
.fw-header__title {
  font-family: var(--font-display, "Space Grotesk", sans-serif);
  font-size: clamp(2.5rem, 5.5vw, 5rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  text-transform: uppercase;
  color: var(--color-fg, #f0f0f0);
  line-height: 1;
  display: flex;
  align-items: baseline;
  gap: 0.3em;
}
.fw-header__title em {
  font-style: normal;
  color: transparent;
  -webkit-text-stroke: 1.5px rgba(255,255,255,0.55);
}
.fw-header__count {
  font-family: var(--font-mono, "JetBrains Mono", monospace);
  font-size: 12px;
  color: var(--color-muted, rgba(240,240,240,0.35));
  white-space: nowrap;
  flex-shrink: 0;
  letter-spacing: 0.06em;
}

/* ─── CARD DECK ──────────────────────────────────────────────── */
.fw-deck {
  position: relative;
  padding-bottom: 20vh;
  margin-top: -1px;
}

/* ─── CARD WRAPPER (sticky slot) ────────────────────────────── */
.fw-card-wrapper {
  position: sticky;
  top: 0;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  perspective: 1200px;
}

/* ─── CARD ───────────────────────────────────────────────────── */
.fw-card {
  width: min(92vw, 1360px);
  height: min(85vh, 780px);
  background: #0a0a0a;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 4px 12px rgba(0,0,0,0.2), 0 24px 60px rgba(0,0,0,0.4);
  display: grid;
  grid-template-columns: 42% 58%;
  overflow: hidden;
  position: relative;
  will-change: transform;
  cursor: none;
  transform-style: preserve-3d;
  transition: border-color 0.4s ease, box-shadow 0.4s ease;
  text-decoration: none;
  color: inherit;
}
.fw-card:hover {
  border-color: rgba(0, 255, 148, 0.18);
  box-shadow:
    0 4px 12px rgba(0,0,0,0.2),
    0 24px 60px rgba(0,0,0,0.4),
    0 0 0 1px rgba(0,255,148,0.08),
    0 0 60px rgba(0,255,148,0.04);
}
.fw-card:hover .fw-card__visual {
  background: #080808;
}
.fw-card:hover .fw-card__company {
  color: rgba(0,255,148,0.9);
}

/* ─── LEFT PANEL ────────────────────────────────────────────── */
.fw-card__content {
  padding: clamp(32px, 5vw, 64px);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-right: 1px solid rgba(255, 255, 255, 0.06);
  gap: 24px;
  overflow: hidden;
}
.fw-card__top { display: flex; flex-direction: column; gap: 16px; }
.fw-card__company {
  font-family: var(--font-mono, "JetBrains Mono", monospace);
  font-size: 11px;
  color: var(--accent, #00FF94);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.fw-card__company::before {
  content: '';
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent, #00FF94);
  flex-shrink: 0;
}
.fw-card__title {
  font-family: var(--font-display, "Space Grotesk", sans-serif);
  font-size: clamp(1.6rem, 2.8vw, 2.6rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  color: var(--color-fg, #f0f0f0);
  line-height: 1.1;
}
.fw-card__vision {
  font-family: var(--font-body, "DM Sans", sans-serif);
  font-size: 16px;
  color: rgba(255, 255, 255, 0.55);
  line-height: 1.65;
}

.fw-card__bottom { display: flex; flex-direction: column; gap: 24px; }

/* Metrics row */
.fw-card__metrics {
  display: flex;
  flex-direction: row;
  gap: 36px;
}
.fw-metric { display: flex; flex-direction: column; gap: 4px; }
.fw-metric__val {
  font-family: var(--font-display, "Space Grotesk", sans-serif);
  font-size: clamp(1.6rem, 2.5vw, 2.4rem);
  font-weight: 700;
  color: var(--color-fg, #f0f0f0);
  line-height: 1;
}
.fw-metric__lbl {
  font-family: var(--font-mono, "JetBrains Mono", monospace);
  font-size: 11px;
  color: var(--color-muted, rgba(240,240,240,0.5));
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

/* CTA */
.fw-card__cta {
  font-family: var(--font-mono, "JetBrains Mono", monospace);
  font-size: 12px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-muted, rgba(240,240,240,0.5));
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  width: fit-content;
  transition: color 0.3s ease, gap 0.3s ease;
}
.fw-card__cta:hover {
  color: var(--accent, #00FF94);
  gap: 10px;
}

/* ─── RIGHT PANEL (visual) ───────────────────────────────────── */
.fw-card__visual {
  position: relative;
  background: #060606;
  overflow: hidden;
}

/* Cinema frame */
.fw-cinema-frame {
  position: absolute;
  inset: 20px;
  border-radius: 8px;
  overflow: hidden;
}
.fw-cinema-frame::before {
  content: '';
  position: absolute;
  inset: 0;
  border: 1px solid rgba(255, 255, 255, 0.04);
  border-radius: 8px;
  z-index: 2;
  pointer-events: none;
}
.fw-cinema-frame::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%);
  z-index: 2;
  pointer-events: none;
}
.fw-cinema-scanlines {
  position: absolute;
  inset: 0;
  z-index: 3;
  pointer-events: none;
  background: repeating-linear-gradient(
    to bottom,
    transparent 0px, transparent 2px,
    rgba(0, 0, 0, 0.03) 2px, rgba(0, 0, 0, 0.03) 4px
  );
}

/* Parallax image */
.fw-cinema-img {
  position: absolute;
  width: 180%;
  height: 140%;
  top: -10%;
  left: -10%;
  object-fit: cover;
  will-change: transform;
  display: block;
}

/* Placeholder when no image */
.fw-cinema-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-mono, "JetBrains Mono", monospace);
  font-size: 11px;
  letter-spacing: 0.08em;
  color: rgba(255,255,255,0.1);
  text-transform: uppercase;
}

/* Corner L-brackets */
.fw-cinema-corners {
  position: absolute;
  inset: 20px;
  z-index: 4;
  pointer-events: none;
}
.fw-cinema-corners span {
  position: absolute;
  width: 24px;
  height: 24px;
}
.fw-corner-tl { top: 0; left: 0; border-top: 1px solid rgba(255,255,255,0.12); border-left: 1px solid rgba(255,255,255,0.12); }
.fw-corner-tr { top: 0; right: 0; border-top: 1px solid rgba(255,255,255,0.12); border-right: 1px solid rgba(255,255,255,0.12); }
.fw-corner-bl { bottom: 0; left: 0; border-bottom: 1px solid rgba(255,255,255,0.12); border-left: 1px solid rgba(255,255,255,0.12); }
.fw-corner-br { bottom: 0; right: 0; border-bottom: 1px solid rgba(255,255,255,0.12); border-right: 1px solid rgba(255,255,255,0.12); }

/* ─── PROGRESS PIPS ─────────────────────────────────────────── */
.fw-progress {
  position: fixed;
  right: 32px;
  top: 50%;
  transform: translateY(-50%);
  z-index: var(--z-float, 50);
  display: flex;
  flex-direction: column;
  gap: 12px;
  opacity: 0;
  transition: opacity 0.4s ease;
}
.fw-progress.visible { opacity: 1; }
.fw-pip {
  width: 2px;
  height: 32px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 1px;
  transition: background 0.3s ease, height 0.3s ease;
}
.fw-pip--active {
  background: var(--accent, #00FF94);
  height: 48px;
}

/* ─── RESPONSIVE ─────────────────────────────────────────────── */
@media (max-width: 900px) {
  .fw-card { grid-template-columns: 1fr; grid-template-rows: auto 1fr; height: auto; min-height: min(85vh, 640px); }
  .fw-card__content { border-right: none; border-bottom: 1px solid rgba(255,255,255,0.06); }
  .fw-card__visual { min-height: 260px; }
  .fw-progress { display: none; }
}
@media (max-width: 600px) {
  .fw-header { flex-direction: column; gap: 8px; }
}
`

/* ────────────────────────────────────────────────────────────── */
/*  Individual card                                               */
/* ────────────────────────────────────────────────────────────── */

function WorkCard({ project, index }: { project: Project; index: number }) {
  const wrapperRef  = useRef<HTMLDivElement>(null)
  const cardRef     = useRef<HTMLAnchorElement>(null)
  const imgRef      = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const wrapper = wrapperRef.current
    const card    = cardRef.current
    const img     = imgRef.current
    if (!wrapper || !card) return

    // Magnetic 3D tilt on mouse move
    const onMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width  - 0.5
      const y = (e.clientY - rect.top)  / rect.height - 0.5
      gsap.to(card, {
        rotateY:  x * 5,
        rotateX: -y * 3,
        duration: 0.5,
        ease: 'power2.out',
        overwrite: true,
      })
    }
    const onLeave = () => {
      gsap.to(card, { rotateY: 0, rotateX: 0, duration: 0.7, ease: 'elastic.out(1,0.6)', overwrite: true })
    }
    card.addEventListener('mousemove', onMove)
    card.addEventListener('mouseleave', onLeave)

    // Card scale-in as it enters its sticky slot
    // Cards always stay opacity:1 — sticky stacking handles visibility
    const cardST = ScrollTrigger.create({
      trigger: wrapper,
      start: 'top bottom',
      end: 'top top',
      scrub: true,
      animation: gsap.fromTo(card,
        { scale: 0.92, yPercent: 4 },
        { scale: 1, yPercent: 0, ease: 'none' }
      ),
    })

    // Image parallax within card's viewport
    let imgST: ScrollTrigger | undefined
    if (img) {
      imgST = ScrollTrigger.create({
        trigger: wrapper,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
        animation: gsap.fromTo(img,
          { y: '0%' },
          { y: '-12%', ease: 'none' }
        ),
      })
    }

    return () => {
      card.removeEventListener('mousemove', onMove)
      card.removeEventListener('mouseleave', onLeave)
      cardST.kill()
      imgST?.kill()
    }
  }, [])

  const coverSrc = project.coverUrl ?? project.thumbnailUrl
  const company  = [project.client, project.year].filter(Boolean).join(' · ')
  const vision   = project.tagline ?? 'A carefully crafted digital experience built for impact.'
  const metrics  = DEFAULT_METRICS

  return (
    <div ref={wrapperRef} className="fw-card-wrapper">
      <Link href={`/work/${project.slug}`} ref={cardRef} className="fw-card" data-cursor="View">

        {/* ── Left: content ──────────────────────────────── */}
        <div className="fw-card__content">
          <div className="fw-card__top">
            {company && (
              <p className="fw-card__company">{company}</p>
            )}
            <h3 className="fw-card__title">{project.title}</h3>
            <p className="fw-card__vision">{vision}</p>
          </div>

          <div className="fw-card__bottom">
            <dl className="fw-card__metrics">
              {metrics.map((m, i) => (
                <div key={i} className="fw-metric">
                  <dt className="fw-metric__val">{m.val}</dt>
                  <dd className="fw-metric__lbl">{m.lbl}</dd>
                </div>
              ))}
            </dl>

            <span className="fw-card__cta">
              VIEW CASE STUDY →
            </span>
          </div>
        </div>

        {/* ── Right: visual ──────────────────────────────── */}
        <div className="fw-card__visual">
          <div className="fw-cinema-frame">
            {coverSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                ref={imgRef}
                src={coverSrc}
                alt={project.title}
                className="fw-cinema-img"
                draggable={false}
              />
            ) : (
              <div className="fw-cinema-placeholder">
                {project.title}
              </div>
            )}
            <div className="fw-cinema-scanlines" aria-hidden="true" />
          </div>

          {/* Corner brackets */}
          <div className="fw-cinema-corners" aria-hidden="true">
            <span className="fw-corner-tl" />
            <span className="fw-corner-tr" />
            <span className="fw-corner-bl" />
            <span className="fw-corner-br" />
          </div>
        </div>

      </Link>
    </div>
  )
}

/* ────────────────────────────────────────────────────────────── */
/*  Progress pips                                                 */
/* ────────────────────────────────────────────────────────────── */

function ProgressPips({
  count,
  deckRef,
}: {
  count: number
  deckRef: React.RefObject<HTMLDivElement | null>
}) {
  const pipsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const deck = deckRef.current
    const pips = pipsRef.current
    if (!deck || !pips || count === 0) return

    const pipEls = Array.from(pips.querySelectorAll<HTMLElement>('.fw-pip'))

    const st = ScrollTrigger.create({
      trigger: deck,
      start: 'top center',
      end: 'bottom center',
      onEnter: () => pips.classList.add('visible'),
      onLeave: () => pips.classList.remove('visible'),
      onEnterBack: () => pips.classList.add('visible'),
      onLeaveBack: () => pips.classList.remove('visible'),
      onUpdate(self) {
        const activeIdx = Math.round(self.progress * (count - 1))
        pipEls.forEach((el, i) => {
          el.classList.toggle('fw-pip--active', i === activeIdx)
        })
      },
    })

    return () => st.kill()
  }, [count, deckRef])

  return (
    <div ref={pipsRef} className="fw-progress" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="fw-pip" />
      ))}
    </div>
  )
}

/* ────────────────────────────────────────────────────────────── */
/*  Main component                                                */
/* ────────────────────────────────────────────────────────────── */

export default function WorkPreview({ projects }: WorkPreviewProps) {
  const deckRef = useRef<HTMLDivElement>(null)

  if (projects.length === 0) return null

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <div className="fw-section" id="work-preview">
        {/* Sticky section header */}
        <div className="fw-header">
          <h2 className="fw-header__title">
            SELECTED <em>WORK</em>
          </h2>
          <span className="fw-header__count">
            {String(projects.length).padStart(2, '0')} PROJECTS
          </span>
        </div>

        {/* Progress pips (fixed right side) */}
        <ProgressPips count={projects.length} deckRef={deckRef} />

        {/* Card deck */}
        <div ref={deckRef} className="fw-deck">
          {projects.map((project, i) => (
            <WorkCard key={project.id} project={project} index={i} />
          ))}
        </div>
      </div>
    </>
  )
}
