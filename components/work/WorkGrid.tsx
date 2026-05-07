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
  videoUrl?: string
}

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

/* ─── VIDEO BANNER ────────────────────────────────────────────── */
.wg-video-banner {
  max-width: var(--max-width, 1440px);
  margin: 0 auto 56px;
  padding: 0 var(--gutter, 40px);
}
.wg-video-frame {
  position: relative;
  width: 100%;
  height: clamp(280px, 42vh, 520px);
  background: #0a0a0a;
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,0.07);
  overflow: hidden;
  box-shadow: 0 24px 80px rgba(0,0,0,0.5);
}
.wg-video-frame video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.wg-video-overlay {
  position: absolute;
  inset: 0;
  background:
    repeating-linear-gradient(to bottom, transparent 0px, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px),
    radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%);
  pointer-events: none;
  z-index: 2;
}
.wg-video-label {
  position: absolute;
  top: 16px;
  left: 20px;
  z-index: 3;
  font-family: var(--font-mono, "JetBrains Mono", monospace);
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.35);
  display: flex;
  align-items: center;
  gap: 8px;
}
.wg-video-label::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent, #00FF94);
  animation: wg-pulse 2s ease infinite;
}
@keyframes wg-pulse {
  0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(0,255,148,0.4); }
  50%       { opacity: 0.7; box-shadow: 0 0 0 4px rgba(0,255,148,0); }
}
.wg-video-corners { position: absolute; inset: 16px; z-index: 3; pointer-events: none; }
.wg-video-corners span { position: absolute; width: 22px; height: 22px; }
.wg-vc-tl { top:0; left:0; border-top:1px solid rgba(255,255,255,0.14); border-left:1px solid rgba(255,255,255,0.14); }
.wg-vc-tr { top:0; right:0; border-top:1px solid rgba(255,255,255,0.14); border-right:1px solid rgba(255,255,255,0.14); }
.wg-vc-bl { bottom:0; left:0; border-bottom:1px solid rgba(255,255,255,0.14); border-left:1px solid rgba(255,255,255,0.14); }
.wg-vc-br { bottom:0; right:0; border-bottom:1px solid rgba(255,255,255,0.14); border-right:1px solid rgba(255,255,255,0.14); }

/* ─── MASONRY GALLERY ─────────────────────────────────────────── */
.wg-gallery {
  max-width: var(--max-width, 1440px);
  margin: 0 auto;
  padding: 0 var(--gutter, 40px) 160px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* scroll reveal */
.wg-reveal {
  opacity: 0;
  transform: translateY(48px);
  will-change: opacity, transform;
}
.wg-reveal--visible {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 0.65s ease, transform 0.65s cubic-bezier(0.22, 1, 0.36, 1);
}

/* ─── FULL-WIDTH HERO ROW ─────────────────────────────────────── */
.wg-large {
  position: relative;
  width: 100%;
  height: clamp(360px, 52vh, 600px);
  border-radius: 14px;
  overflow: hidden;
  background: #0a0a0a;
  border: 1px solid rgba(255,255,255,0.06);
  text-decoration: none;
  color: inherit;
  display: block;
  cursor: none;
}
.wg-large__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
}
.wg-large:hover .wg-large__img { transform: scale(1.04); }
.wg-large__gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(0,0,0,0.9) 0%,
    rgba(0,0,0,0.4) 40%,
    rgba(0,0,0,0.08) 70%,
    transparent 100%
  );
  z-index: 1;
}
.wg-large__scanlines {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    to bottom,
    transparent 0px, transparent 2px,
    rgba(0,0,0,0.035) 2px, rgba(0,0,0,0.035) 4px
  );
  z-index: 2;
  pointer-events: none;
}
.wg-large__placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-mono, "JetBrains Mono", monospace);
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.08);
}
.wg-large__content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: clamp(24px, 4vw, 48px);
  z-index: 3;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
}
.wg-large__info { display: flex; flex-direction: column; gap: 8px; }
.wg-large__company {
  font-family: var(--font-mono, "JetBrains Mono", monospace);
  font-size: 11px;
  color: rgba(255,255,255,0.45);
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.wg-large__title {
  font-family: var(--font-display, "Space Grotesk", sans-serif);
  font-size: clamp(1.6rem, 3.2vw, 3rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  color: #fff;
  line-height: 1.1;
}
.wg-large__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 4px;
}
.wg-large__tag {
  font-family: var(--font-mono, "JetBrains Mono", monospace);
  font-size: 9px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 3px 8px;
  border-radius: 100px;
  border: 1px solid rgba(255,255,255,0.16);
  color: rgba(255,255,255,0.5);
  background: rgba(0,0,0,0.3);
  backdrop-filter: blur(4px);
}
.wg-large__cta {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-mono, "JetBrains Mono", monospace);
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--accent, #00FF94);
  border: 1px solid rgba(0,255,148,0.3);
  padding: 8px 18px;
  border-radius: 100px;
  background: rgba(0,0,0,0.4);
  backdrop-filter: blur(8px);
  transition: background 0.3s ease, border-color 0.3s ease, gap 0.3s ease;
}
.wg-large:hover .wg-large__cta {
  background: rgba(0,255,148,0.12);
  border-color: rgba(0,255,148,0.55);
  gap: 12px;
}
/* corner brackets */
.wg-large__corners { position: absolute; inset: 16px; z-index: 4; pointer-events: none; }
.wg-large__corners span { position: absolute; width: 22px; height: 22px; }
.wg-lc-tl { top:0; left:0; border-top:1px solid rgba(255,255,255,0.14); border-left:1px solid rgba(255,255,255,0.14); }
.wg-lc-tr { top:0; right:0; border-top:1px solid rgba(255,255,255,0.14); border-right:1px solid rgba(255,255,255,0.14); }
.wg-lc-bl { bottom:0; left:0; border-bottom:1px solid rgba(255,255,255,0.14); border-left:1px solid rgba(255,255,255,0.14); }
.wg-lc-br { bottom:0; right:0; border-bottom:1px solid rgba(255,255,255,0.14); border-right:1px solid rgba(255,255,255,0.14); }

/* ─── SPLIT ROW (2 cards side by side) ───────────────────────── */
.wg-split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

/* ─── SMALL CARD (in split row) ──────────────────────────────── */
.wg-small {
  position: relative;
  border-radius: 14px;
  overflow: hidden;
  background: #0a0a0a;
  border: 1px solid rgba(255,255,255,0.06);
  text-decoration: none;
  color: inherit;
  display: flex;
  flex-direction: column;
  cursor: none;
  min-height: clamp(380px, 50vh, 520px);
  transition: border-color 0.35s ease;
}
.wg-small:hover { border-color: rgba(255,255,255,0.12); }
.wg-small__img-wrap {
  position: relative;
  flex: 1;
  min-height: 220px;
  overflow: hidden;
  background: #060606;
}
.wg-small__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.65s cubic-bezier(0.22, 1, 0.36, 1);
}
.wg-small:hover .wg-small__img { transform: scale(1.05); }
.wg-small__img-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.65) 100%);
  z-index: 1;
}
.wg-small__scanlines {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    to bottom,
    transparent 0px, transparent 2px,
    rgba(0,0,0,0.035) 2px, rgba(0,0,0,0.035) 4px
  );
  z-index: 2;
  pointer-events: none;
}
.wg-small__placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-mono, "JetBrains Mono", monospace);
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.08);
}
.wg-small__content {
  padding: clamp(18px, 3vw, 32px);
  display: flex;
  flex-direction: column;
  gap: 10px;
  border-top: 1px solid rgba(255,255,255,0.05);
  background: #0a0a0a;
  flex-shrink: 0;
}
.wg-small__company {
  font-family: var(--font-mono, "JetBrains Mono", monospace);
  font-size: 10px;
  color: rgba(255,255,255,0.4);
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.wg-small__title {
  font-family: var(--font-display, "Space Grotesk", sans-serif);
  font-size: clamp(1.1rem, 2vw, 1.6rem);
  font-weight: 700;
  letter-spacing: -0.025em;
  color: var(--color-fg, #f0f0f0);
  line-height: 1.2;
}
.wg-small__tagline {
  font-family: var(--font-body, "DM Sans", sans-serif);
  font-size: 13px;
  color: rgba(255,255,255,0.4);
  line-height: 1.55;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.wg-small__cta {
  font-family: var(--font-mono, "JetBrains Mono", monospace);
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.35);
  margin-top: 4px;
  transition: color 0.25s ease;
}
.wg-small:hover .wg-small__cta { color: var(--accent, #00FF94); }

/* corner brackets for small card */
.wg-small__corners { position: absolute; inset: 12px; z-index: 4; pointer-events: none; }
.wg-small__corners span { position: absolute; width: 16px; height: 16px; }
.wg-sc-tl { top:0; left:0; border-top:1px solid rgba(255,255,255,0.1); border-left:1px solid rgba(255,255,255,0.1); }
.wg-sc-tr { top:0; right:0; border-top:1px solid rgba(255,255,255,0.1); border-right:1px solid rgba(255,255,255,0.1); }
.wg-sc-bl { bottom:0; left:0; border-bottom:1px solid rgba(255,255,255,0.1); border-left:1px solid rgba(255,255,255,0.1); }
.wg-sc-br { bottom:0; right:0; border-bottom:1px solid rgba(255,255,255,0.1); border-right:1px solid rgba(255,255,255,0.1); }

/* ─── EMPTY ───────────────────────────────────────────────────── */
.wg-empty {
  text-align: center; padding: 80px 0;
  font-family: var(--font-mono, "JetBrains Mono", monospace);
  font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase;
  color: var(--color-muted, rgba(240,240,240,0.5));
}

/* ─── RESPONSIVE ─────────────────────────────────────────────── */
@media (max-width: 768px) {
  .wg-split { grid-template-columns: 1fr; }
  .wg-large__content { flex-direction: column; align-items: flex-start; }
  .wg-large__cta { display: none; }
}
@media (max-width: 600px) {
  .work-hero { padding-top: 120px; }
  .work-filter-wrap { padding-left: 20px; padding-right: 20px; }
  .wg-gallery { padding-left: 20px; padding-right: 20px; gap: 14px; }
  .wg-video-banner { padding-left: 20px; padding-right: 20px; }
}

@media (prefers-reduced-motion: reduce) {
  .wg-large__img, .wg-small__img { transition: none; }
}
`

/* ────────────────────────────────────────────────────────────── */
/*  Scroll-reveal hook                                            */
/* ────────────────────────────────────────────────────────────── */

function useReveal(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current
    if (!el) return

    const isMobile = window.innerWidth < 768 || window.matchMedia('(hover: none)').matches

    const revealCss = () => el.classList.add('wg-reveal--visible')

    const rect = el.getBoundingClientRect()
    if (rect.top < window.innerHeight * 0.95) {
      revealCss()
      return
    }

    if (isMobile) {
      const io = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) { revealCss(); io.disconnect() } },
        { threshold: 0.08 }
      )
      io.observe(el)
      return () => io.disconnect()
    }

    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: () => gsap.to(el, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }),
    })
    return () => st.kill()
  }, [ref])
}

/* ────────────────────────────────────────────────────────────── */
/*  Large card (full-width hero row)                              */
/* ────────────────────────────────────────────────────────────── */

function LargeCard({ project }: { project: Project }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  useReveal(wrapRef)

  const coverSrc = project.coverUrl ?? project.thumbnailUrl
  const company  = [project.client, project.year].filter(Boolean).join(' · ')

  return (
    <div ref={wrapRef} className="wg-reveal">
      <Link href={`/work/${project.slug}`} className="wg-large" data-cursor="View" aria-label={`View case study: ${project.title}`}>
        {coverSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverSrc} alt={project.title} className="wg-large__img" draggable={false} />
        ) : (
          <div className="wg-large__placeholder">{project.title}</div>
        )}
        <div className="wg-large__gradient" />
        <div className="wg-large__scanlines" aria-hidden="true" />

        <div className="wg-large__content">
          <div className="wg-large__info">
            {company && <p className="wg-large__company">{company}</p>}
            <h2 className="wg-large__title">{project.title}</h2>
            {(project.tags ?? []).length > 0 && (
              <div className="wg-large__tags">
                {(project.tags ?? []).slice(0, 3).map(tag => (
                  <span key={tag} className="wg-large__tag">{tag}</span>
                ))}
              </div>
            )}
          </div>
          <span className="wg-large__cta">View Case Study →</span>
        </div>

        <div className="wg-large__corners" aria-hidden="true">
          <span className="wg-lc-tl" /><span className="wg-lc-tr" />
          <span className="wg-lc-bl" /><span className="wg-lc-br" />
        </div>
      </Link>
    </div>
  )
}

/* ────────────────────────────────────────────────────────────── */
/*  Small card (used in split pair row)                           */
/* ────────────────────────────────────────────────────────────── */

function SmallCard({ project }: { project: Project }) {
  const coverSrc = project.coverUrl ?? project.thumbnailUrl
  const company  = [project.client, project.year].filter(Boolean).join(' · ')

  return (
    <Link href={`/work/${project.slug}`} className="wg-small" data-cursor="View" aria-label={`View case study: ${project.title}`}>
      <div className="wg-small__img-wrap">
        {coverSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverSrc} alt={project.title} className="wg-small__img" draggable={false} />
        ) : (
          <div className="wg-small__placeholder">{project.title}</div>
        )}
        <div className="wg-small__img-overlay" />
        <div className="wg-small__scanlines" aria-hidden="true" />
      </div>

      <div className="wg-small__content">
        {company && <p className="wg-small__company">{company}</p>}
        <h2 className="wg-small__title">{project.title}</h2>
        {project.tagline && <p className="wg-small__tagline">{project.tagline}</p>}
        <span className="wg-small__cta">View Case Study →</span>
      </div>

      <div className="wg-small__corners" aria-hidden="true">
        <span className="wg-sc-tl" /><span className="wg-sc-tr" />
        <span className="wg-sc-bl" /><span className="wg-sc-br" />
      </div>
    </Link>
  )
}

/* ────────────────────────────────────────────────────────────── */
/*  Split pair row (2 small cards)                                */
/* ────────────────────────────────────────────────────────────── */

function SplitRow({ projects }: { projects: Project[] }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  useReveal(wrapRef)

  return (
    <div ref={wrapRef} className="wg-reveal">
      <div className="wg-split">
        {projects.map(p => <SmallCard key={p.id} project={p} />)}
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────────────────────── */
/*  Video banner                                                  */
/* ────────────────────────────────────────────────────────────── */

function VideoBanner({ videoUrl }: { videoUrl: string }) {
  return (
    <div className="wg-video-banner">
      <div className="wg-video-frame">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        >
          <source src={videoUrl} type="video/mp4" />
        </video>
        <div className="wg-video-overlay" />
        <span className="wg-video-label">Showreel</span>
        <div className="wg-video-corners" aria-hidden="true">
          <span className="wg-vc-tl" /><span className="wg-vc-tr" />
          <span className="wg-vc-bl" /><span className="wg-vc-br" />
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

export default function WorkGrid({ projects, tags, videoUrl }: WorkGridProps) {
  const [activeTag, setActiveTag] = useState<string | null>(null)

  const filtered = activeTag
    ? projects.filter(p => p.tags?.includes(activeTag))
    : projects

  const counts: Record<string, number> = {}
  for (const p of projects) {
    for (const t of p.tags ?? []) counts[t] = (counts[t] ?? 0) + 1
  }

  useEffect(() => {
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 50)
    return () => window.clearTimeout(id)
  }, [activeTag])

  // Build alternating rows: large → split(2) → large → split(2) ...
  const rows: Array<{ type: 'large'; project: Project } | { type: 'split'; projects: Project[] }> = []
  let i = 0
  while (i < filtered.length) {
    rows.push({ type: 'large', project: filtered[i] })
    i++
    if (i < filtered.length) {
      const pair = filtered.slice(i, i + 2)
      if (pair.length === 1) {
        rows.push({ type: 'large', project: pair[0] })
      } else {
        rows.push({ type: 'split', projects: pair })
      }
      i += pair.length
    }
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <WorkHero count={filtered.length} />

      {tags.length > 0 && (
        <FilterDropdown
          tags={tags}
          counts={counts}
          activeTag={activeTag}
          onSelect={setActiveTag}
          totalCount={projects.length}
        />
      )}

      {videoUrl && <VideoBanner videoUrl={videoUrl} />}

      <div className="wg-gallery">
        {filtered.length > 0 ? (
          rows.map((row, idx) =>
            row.type === 'large'
              ? <LargeCard key={`large-${row.project.id}`} project={row.project} />
              : <SplitRow key={`split-${idx}`} projects={row.projects} />
          )
        ) : (
          <p className="wg-empty">No projects found for this filter.</p>
        )}
      </div>
    </>
  )
}
