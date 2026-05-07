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
  font-family: var(--font-mono, "JetBrains Mono", monospace);
  font-size: 14px;
  color: var(--color-muted, rgba(240,240,240,0.5));
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-top: 24px;
}

/* ─── FILTER DROPDOWN ─────────────────────────────────────────── */
.work-filter-wrap {
  max-width: var(--max-width, 1440px);
  margin: 0 auto 40px;
  padding: 0 var(--gutter, 40px);
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
}
.filter-trigger {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px 10px 16px;
  border-radius: 100px;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(20,20,20,0.6);
  -webkit-backdrop-filter: blur(14px) saturate(160%);
  backdrop-filter: blur(14px) saturate(160%);
  color: var(--color-fg, #f0f0f0);
  font-family: var(--font-mono, "JetBrains Mono", monospace);
  font-size: 12px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
  transition: border-color 0.2s ease, background 0.2s ease;
}
.filter-trigger:hover { border-color: rgba(255,255,255,0.22); }
.filter-trigger__label { color: var(--color-muted, rgba(240,240,240,0.5)); }
.filter-trigger__value {
  color: var(--color-fg, #f0f0f0);
  font-weight: 600;
}
.filter-trigger__value.is-set { color: var(--accent, #00FF94); }
.filter-trigger__chev {
  width: 10px; height: 10px;
  border-right: 1.5px solid currentColor;
  border-bottom: 1.5px solid currentColor;
  transform: rotate(45deg) translateY(-1px);
  transition: transform 0.25s ease;
  margin-left: 2px;
  opacity: 0.7;
}
.filter-trigger.is-open .filter-trigger__chev {
  transform: rotate(225deg) translateY(-1px);
}
.filter-clear {
  background: none;
  border: none;
  padding: 6px 10px;
  color: var(--color-muted, rgba(240,240,240,0.5));
  font-family: var(--font-mono, "JetBrains Mono", monospace);
  font-size: 11px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
  transition: color 0.2s ease;
}
.filter-clear:hover { color: var(--color-fg, #f0f0f0); }

.filter-popover {
  position: absolute;
  top: calc(100% + 8px);
  left: var(--gutter, 40px);
  z-index: 50;
  min-width: 240px;
  max-width: min(360px, calc(100vw - var(--gutter, 40px) * 2));
  padding: 10px;
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(14,14,14,0.85);
  -webkit-backdrop-filter: blur(22px) saturate(180%);
  backdrop-filter: blur(22px) saturate(180%);
  box-shadow:
    0 16px 48px rgba(0,0,0,0.55),
    inset 0 1px 0 rgba(255,255,255,0.05);
  display: flex;
  flex-direction: column;
  gap: 2px;
  max-height: min(60vh, 420px);
  overflow-y: auto;
  opacity: 0;
  transform: translateY(-6px);
  pointer-events: none;
  transition: opacity 0.18s ease, transform 0.18s ease;
}
.filter-popover.is-open {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}
.filter-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  background: transparent;
  border: none;
  color: rgba(240,240,240,0.75);
  font-family: var(--font-mono, "JetBrains Mono", monospace);
  font-size: 12px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s ease, color 0.15s ease;
}
.filter-option:hover { background: rgba(255,255,255,0.05); color: var(--color-fg, #f0f0f0); }
.filter-option__dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: rgba(255,255,255,0.15);
  flex-shrink: 0;
}
.filter-option.is-active { color: var(--accent, #00FF94); }
.filter-option.is-active .filter-option__dot {
  background: var(--accent, #00FF94);
  box-shadow: 0 0 8px rgba(0,255,148,0.6);
}
.filter-option__count {
  margin-left: auto;
  color: rgba(255,255,255,0.3);
  font-size: 10px;
}

@media (max-width: 600px) {
  .filter-popover { left: 20px; right: 20px; max-width: none; }
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
/* CSS-only reveal used on mobile/touch instead of GSAP */
.work-card-wrap--visible {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 0.6s ease, transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}

/* ─── CINEMA CARD (matches fw-card from WorkPreview) ────────── */
.work-card-link {
  display: block;
  text-decoration: none;
  color: inherit;
}
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
  transition: box-shadow 0.4s ease, transform 0.4s ease;
}
.work-card-link:hover .work-card {
  box-shadow: 0 8px 24px rgba(0,0,0,0.3), 0 40px 80px rgba(0,0,0,0.5);
}
.work-card-link:active .work-card { transform: scale(0.995); }

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
  font-family: var(--font-mono, "JetBrains Mono", monospace);
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
  font-family: var(--font-mono, "JetBrains Mono", monospace);
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
  font-family: var(--font-mono, "JetBrains Mono", monospace);
  font-size: 10px; color: var(--color-muted, rgba(240,240,240,0.5));
  letter-spacing: 0.06em; text-transform: uppercase;
}
.work-card__cta {
  font-family: var(--font-mono, "JetBrains Mono", monospace);
  font-size: 12px; letter-spacing: 0.06em; text-transform: uppercase;
  color: var(--color-muted, rgba(240,240,240,0.5));
  display: inline-flex; align-items: center;
  gap: 6px; width: fit-content;
  transition: color 0.3s ease, gap 0.3s ease;
}
.work-card-link:hover .work-card__cta { color: var(--accent, #00FF94); gap: 10px; }

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
  font-family: var(--font-mono, "JetBrains Mono", monospace); font-size: 11px;
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
  font-family: var(--font-mono, "JetBrains Mono", monospace);
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

    // On mobile/touch use CSS transitions + IntersectionObserver (lighter than GSAP)
    const isMobile = window.innerWidth < 768 || window.matchMedia('(hover: none)').matches

    if (isMobile) {
      const rect = el.getBoundingClientRect()
      if (rect.top < window.innerHeight * 0.95) {
        el.classList.add('work-card-wrap--visible')
        return
      }
      const io = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) { el.classList.add('work-card-wrap--visible'); io.disconnect() } },
        { threshold: 0.1 }
      )
      io.observe(el)
      return () => io.disconnect()
    }

    // Desktop: GSAP for polished animation
    const reveal = () => gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.7,
      ease: 'power3.out',
    })

    const rect = el.getBoundingClientRect()
    if (rect.top < window.innerHeight * 0.95) {
      reveal()
      return
    }

    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: reveal,
    })
    return () => st.kill()
  }, [])

  const coverSrc = project.coverUrl ?? project.thumbnailUrl
  const company  = [project.client, project.year].filter(Boolean).join(' · ')

  return (
    <div ref={wrapRef} className="work-card-wrap">
      <Link href={`/work/${project.slug}`} className="work-card-link" aria-label={`View case study: ${project.title}`}>
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
              <span className="work-card__cta">VIEW CASE STUDY →</span>
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
      </Link>
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
/*  Filter dropdown                                               */
/* ────────────────────────────────────────────────────────────── */

function FilterDropdown({
  tags,
  counts,
  activeTag,
  onSelect,
  totalCount,
}: {
  tags: string[]
  counts: Record<string, number>
  activeTag: string | null
  onSelect: (tag: string | null) => void
  totalCount: number
}) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  // Close on outside click and Esc
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const pick = (tag: string | null) => {
    onSelect(tag)
    setOpen(false)
  }

  return (
    <div ref={wrapRef} className="work-filter-wrap" role="group" aria-label="Filter by tag">
      <button
        type="button"
        className={`filter-trigger${open ? ' is-open' : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="filter-trigger__label">Filter</span>
        <span className={`filter-trigger__value${activeTag ? ' is-set' : ''}`}>
          {activeTag ?? 'All'}
        </span>
        <span className="filter-trigger__chev" aria-hidden="true" />
      </button>

      {activeTag && (
        <button type="button" className="filter-clear" onClick={() => onSelect(null)}>
          Clear
        </button>
      )}

      <div className={`filter-popover${open ? ' is-open' : ''}`} role="listbox">
        <button
          type="button"
          className={`filter-option${activeTag === null ? ' is-active' : ''}`}
          onClick={() => pick(null)}
          role="option"
          aria-selected={activeTag === null}
        >
          <span className="filter-option__dot" />
          <span>All</span>
          <span className="filter-option__count">{totalCount}</span>
        </button>
        {tags.map(tag => (
          <button
            type="button"
            key={tag}
            className={`filter-option${activeTag === tag ? ' is-active' : ''}`}
            onClick={() => pick(tag)}
            role="option"
            aria-selected={activeTag === tag}
          >
            <span className="filter-option__dot" />
            <span>{tag}</span>
            <span className="filter-option__count">{counts[tag] ?? 0}</span>
          </button>
        ))}
      </div>
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

  // Tag → project count, for the dropdown badges
  const counts: Record<string, number> = {}
  for (const p of projects) {
    for (const t of p.tags ?? []) counts[t] = (counts[t] ?? 0) + 1
  }

  // Recompute ScrollTrigger positions when the visible card list changes,
  // otherwise cards that shifted upward keep their stale trigger offsets
  // and never fire — which is what made filtering "look broken".
  useEffect(() => {
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 50)
    return () => window.clearTimeout(id)
  }, [activeTag])

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />

      {/* Hero */}
      <WorkHero count={filtered.length} />

      {/* Tag filter (dropdown) */}
      {tags.length > 0 && (
        <FilterDropdown
          tags={tags}
          counts={counts}
          activeTag={activeTag}
          onSelect={setActiveTag}
          totalCount={projects.length}
        />
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
