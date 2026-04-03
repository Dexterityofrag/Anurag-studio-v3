'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { Project } from '@/lib/types'

/* ────────────────────────────────────────────────────────────── */
/*  Props                                                         */
/* ────────────────────────────────────────────────────────────── */

interface WorkGridProps {
  projects: Project[]
  tags: string[]
}

/* ────────────────────────────────────────────────────────────── */
/*  Default metrics                                               */
/* ────────────────────────────────────────────────────────────── */

const DEFAULT_METRICS = [
  { val: '100%', lbl: 'On Time' },
  { val: '↑ 2×', lbl: 'Engagement' },
]

/* ────────────────────────────────────────────────────────────── */
/*  Styles                                                        */
/* ────────────────────────────────────────────────────────────── */

const css = /* css */ `
/* ─── PAGE HERO ───────────────────────────────────────────────── */
.work-hero {
  max-width: var(--max-width, 1440px);
  padding: 180px var(--gutter, 40px) 60px;
  margin: 0 auto;
}
.work-hero__mask { overflow: hidden; display: block; }
.work-hero__line {
  display: block;
  font-family: var(--font-display, "Space Grotesk", sans-serif);
  font-size: clamp(4rem, 8vw, 9rem);
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 0.85;
  text-transform: uppercase;
  color: var(--color-fg, #f0f0f0);
  transform: translateY(120%);
  will-change: transform;
}
.work-hero__sub {
  font-family: var(--font-mono, "DM Mono", monospace);
  font-size: 14px;
  color: var(--color-muted, rgba(240,240,240,0.5));
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-top: 24px;
}

/* ─── TAG FILTER ──────────────────────────────────────────────── */
.work-filter-wrap {
  max-width: var(--max-width, 1440px);
  margin: 0 auto;
  padding: 0 var(--gutter, 40px);
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 48px;
}
.filter-chip {
  font-family: var(--font-mono, "DM Mono", monospace);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 6px 16px;
  border-radius: 100px;
  border: 1px solid rgba(255,255,255,0.06);
  background: transparent;
  color: var(--color-muted, rgba(240,240,240,0.5));
  cursor: none;
  transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
}
.filter-chip:hover:not(.filter-chip--active) {
  border-color: var(--color-fg, #f0f0f0);
  color: var(--color-fg, #f0f0f0);
}
.filter-chip--active {
  background: var(--accent, #E4FE9A);
  color: var(--color-bg, #050505);
  border-color: var(--accent, #E4FE9A);
}

/* ─── CARD STACK ─────────────────────────────────────────────── */
.work-stack {
  display: flex;
  flex-direction: column;
  gap: 40px;
  max-width: var(--max-width, 1440px);
  margin: 0 auto;
  padding: 0 var(--gutter, 40px) 160px;
}

/* Individual card wrapper (for scroll reveal) */
.work-card-wrap {
  opacity: 0;
  transform: translateY(60px);
  will-change: opacity, transform;
}

/* ─── CINEMA CARD (matches fw-card from WorkPreview) ────────── */
.work-card {
  width: 100%;
  height: clamp(480px, 70vh, 680px);
  background: #0a0a0a;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.06);
  box-shadow: 0 4px 12px rgba(0,0,0,0.2), 0 24px 60px rgba(0,0,0,0.4);
  display: grid;
  grid-template-columns: 42% 58%;
  overflow: hidden;
  position: relative;
  cursor: none;
  transition: box-shadow 0.4s ease;
}
.work-card:hover {
  box-shadow: 0 8px 24px rgba(0,0,0,0.3), 0 40px 80px rgba(0,0,0,0.5);
}

/* Left content panel */
.work-card__content {
  padding: clamp(28px, 4vw, 56px);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-right: 1px solid rgba(255,255,255,0.06);
  gap: 20px;
  overflow: hidden;
}
.work-card__top { display: flex; flex-direction: column; gap: 14px; }
.work-card__company {
  font-family: var(--font-mono, "DM Mono", monospace);
  font-size: 12px;
  color: var(--color-muted, rgba(240,240,240,0.5));
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.work-card__title {
  font-family: var(--font-display, "Space Grotesk", sans-serif);
  font-size: clamp(1.5rem, 2.4vw, 2.4rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  color: var(--color-fg, #f0f0f0);
  line-height: 1.1;
}
.work-card__vision {
  font-family: var(--font-body, "DM Sans", sans-serif);
  font-size: 15px;
  color: rgba(255,255,255,0.5);
  line-height: 1.65;
}
.work-card__tags {
  display: flex; flex-wrap: wrap; gap: 6px;
}
.work-card__tag {
  font-family: var(--font-mono, "DM Mono", monospace);
  font-size: 10px; letter-spacing: 0.06em; text-transform: uppercase;
  padding: 3px 8px; border-radius: 100px;
  border: 1px solid rgba(255,255,255,0.1);
  color: var(--color-muted, rgba(240,240,240,0.5));
}
.work-card__bottom { display: flex; flex-direction: column; gap: 20px; }
.work-card__metrics { display: flex; gap: 32px; }
.wc-metric { display: flex; flex-direction: column; gap: 4px; }
.wc-metric__val {
  font-family: var(--font-display, "Space Grotesk", sans-serif);
  font-size: clamp(1.4rem, 2vw, 2rem);
  font-weight: 700; color: var(--color-fg, #f0f0f0); line-height: 1;
}
.wc-metric__lbl {
  font-family: var(--font-mono, "DM Mono", monospace);
  font-size: 10px; color: var(--color-muted, rgba(240,240,240,0.5));
  letter-spacing: 0.06em; text-transform: uppercase;
}
.work-card__cta {
  font-family: var(--font-mono, "DM Mono", monospace);
  font-size: 12px; letter-spacing: 0.06em; text-transform: uppercase;
  color: var(--color-muted, rgba(240,240,240,0.5));
  text-decoration: none; display: inline-flex; align-items: center;
  gap: 6px; width: fit-content;
  transition: color 0.3s ease, gap 0.3s ease;
}
.work-card__cta:hover { color: var(--accent, #E4FE9A); gap: 10px; }

/* Right visual panel */
.work-card__visual {
  position: relative; background: #060606; overflow: hidden;
}
.wc-cinema-frame {
  position: absolute; inset: 20px; border-radius: 8px; overflow: hidden;
}
.wc-cinema-frame::before {
  content: ''; position: absolute; inset: 0;
  border: 1px solid rgba(255,255,255,0.04); border-radius: 8px;
  z-index: 2; pointer-events: none;
}
.wc-cinema-frame::after {
  content: ''; position: absolute; inset: 0;
  background: radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.55) 100%);
  z-index: 2; pointer-events: none;
}
.wc-scanlines {
  position: absolute; inset: 0; z-index: 3; pointer-events: none;
  background: repeating-linear-gradient(
    to bottom,
    transparent 0px, transparent 2px,
    rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px
  );
}
.wc-cinema-img {
  position: absolute; width: 110%; height: 110%;
  top: -5%; left: -5%; object-fit: cover; display: block;
}
.wc-placeholder {
  position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
  font-family: var(--font-mono, "DM Mono", monospace); font-size: 11px;
  letter-spacing: 0.08em; text-transform: uppercase; color: rgba(255,255,255,0.1);
}
.wc-corners { position: absolute; inset: 20px; z-index: 4; pointer-events: none; }
.wc-corners span { position: absolute; width: 24px; height: 24px; }
.wc-corner-tl { top:0; left:0; border-top:1px solid rgba(255,255,255,0.12); border-left:1px solid rgba(255,255,255,0.12); }
.wc-corner-tr { top:0; right:0; border-top:1px solid rgba(255,255,255,0.12); border-right:1px solid rgba(255,255,255,0.12); }
.wc-corner-bl { bottom:0; left:0; border-bottom:1px solid rgba(255,255,255,0.12); border-left:1px solid rgba(255,255,255,0.12); }
.wc-corner-br { bottom:0; right:0; border-bottom:1px solid rgba(255,255,255,0.12); border-right:1px solid rgba(255,255,255,0.12); }

/* ─── SKELETON ────────────────────────────────────────────────── */
@keyframes skeleton-shimmer {
  from { background-position: -400px 0; }
  to   { background-position:  400px 0; }
}
.skeleton-bar {
  border-radius: 4px;
  background: linear-gradient(
    90deg,
    rgba(255,255,255,0.04) 25%,
    rgba(255,255,255,0.08) 50%,
    rgba(255,255,255,0.04) 75%
  );
  background-size: 800px 100%;
  animation: skeleton-shimmer 1.6s ease-in-out infinite;
}
.work-card--skeleton .work-card__visual { background: #0e0e0e; }
.work-card--skeleton { pointer-events: none; }

/* ─── EMPTY ───────────────────────────────────────────────────── */
.work-stack__empty {
  text-align: center; padding: 80px 0;
  font-family: var(--font-mono, "DM Mono", monospace);
  font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase;
  color: var(--color-muted, rgba(240,240,240,0.5));
}

/* ─── RESPONSIVE ─────────────────────────────────────────────── */
@media (max-width: 900px) {
  .work-card {
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
    height: auto;
    min-height: clamp(480px, 80vh, 640px);
  }
  .work-card__content { border-right: none; border-bottom: 1px solid rgba(255,255,255,0.06); }
  .work-card__visual { min-height: 240px; }
}
@media (max-width: 600px) {
  .work-hero { padding-top: 120px; }
  .work-filter-wrap { padding-left: 20px; padding-right: 20px; }
  .work-stack { padding-left: 20px; padding-right: 20px; }
}
`

/* ────────────────────────────────────────────────────────────── */
/*  Single card                                                   */
/* ────────────────────────────────────────────────────────────── */

function WorkCard({ project }: { project: Project }) {
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter() {
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power3.out',
        })
      },
    })
    return () => st.kill()
  }, [])

  const coverSrc = project.coverUrl ?? project.thumbnailUrl
  const company  = [project.client, project.year].filter(Boolean).join(' · ')

  return (
    <div ref={wrapRef} className="work-card-wrap">
      <div className="work-card" data-cursor="View">
        {/* Left */}
        <div className="work-card__content">
          <div className="work-card__top">
            {company && <p className="work-card__company">{company}</p>}
            <h2 className="work-card__title">{project.title}</h2>
            <p className="work-card__vision">
              {project.tagline ?? 'A carefully crafted digital experience built for impact.'}
            </p>
            {(project.tags ?? []).length > 0 && (
              <div className="work-card__tags">
                {(project.tags ?? []).slice(0, 4).map(tag => (
                  <span key={tag} className="work-card__tag">{tag}</span>
                ))}
              </div>
            )}
          </div>
          <div className="work-card__bottom">
            <dl className="work-card__metrics">
              {DEFAULT_METRICS.map((m, i) => (
                <div key={i} className="wc-metric">
                  <dt className="wc-metric__val">{m.val}</dt>
                  <dd className="wc-metric__lbl">{m.lbl}</dd>
                </div>
              ))}
            </dl>
            <Link href={`/work/${project.slug}`} className="work-card__cta">
              VIEW CASE STUDY →
            </Link>
          </div>
        </div>

        {/* Right */}
        <div className="work-card__visual">
          <div className="wc-cinema-frame">
            {coverSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={coverSrc} alt={project.title} className="wc-cinema-img" draggable={false} />
            ) : (
              <div className="wc-placeholder">{project.title}</div>
            )}
            <div className="wc-scanlines" aria-hidden="true" />
          </div>
          <div className="wc-corners" aria-hidden="true">
            <span className="wc-corner-tl" />
            <span className="wc-corner-tr" />
            <span className="wc-corner-bl" />
            <span className="wc-corner-br" />
          </div>
        </div>
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────────────────────── */
/*  Hero heading with mask reveal                                 */
/* ────────────────────────────────────────────────────────────── */

function WorkHero({ count }: { count: number }) {
  const lineRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = lineRef.current
    if (!el) return
    gsap.to(el, {
      translateY: '0%',
      duration: 1.0,
      ease: 'power4.out',
      delay: 0.1,
    })
  }, [])

  return (
    <div className="work-hero">
      <h1>
        <span className="work-hero__mask">
          <span ref={lineRef} className="work-hero__line">WORK</span>
        </span>
      </h1>
      <p className="work-hero__sub">
        {count} CASE {count === 1 ? 'STUDY' : 'STUDIES'} · SELECTED PROJECTS
      </p>
    </div>
  )
}

/* ────────────────────────────────────────────────────────────── */
/*  Main component                                                */
/* ────────────────────────────────────────────────────────────── */

export default function WorkGrid({ projects, tags }: WorkGridProps) {
  const [activeTag, setActiveTag] = useState<string | null>(null)

  const filtered = activeTag
    ? projects.filter(p => p.tags?.includes(activeTag))
    : projects

  const allTags = ['All', ...tags]

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />

      {/* Hero */}
      <WorkHero count={filtered.length} />

      {/* Tag filter */}
      {tags.length > 0 && (
        <div className="work-filter-wrap" role="group" aria-label="Filter by tag">
          {allTags.map(tag => {
            const isActive = tag === 'All' ? activeTag === null : activeTag === tag
            return (
              <button
                key={tag}
                className={`filter-chip${isActive ? ' filter-chip--active' : ''}`}
                onClick={() => setActiveTag(tag === 'All' ? null : tag)}
                aria-pressed={isActive}
              >
                {tag}
              </button>
            )
          })}
        </div>
      )}

      {/* Card stack */}
      <div className="work-stack">
        {filtered.length > 0 ? (
          filtered.map(project => (
            <WorkCard key={project.id} project={project} />
          ))
        ) : (
          <p className="work-stack__empty">No projects found for this filter.</p>
        )}
      </div>
    </>
  )
}
