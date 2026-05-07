'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { Project } from '@/lib/types'

/* ────────────────────────────────────────────────────────────── */
/*  Props                                                         */
/* ────────────────────────────────────────────────────────────── */

interface WorkPreviewProps {
  projects: Project[]
  videoUrl?: string
}

/* ────────────────────────────────────────────────────────────── */
/*  Styles                                                        */
/* ────────────────────────────────────────────────────────────── */

const css = /* css */ `
/* ─── SECTION ─────────────────────────────────────────────────── */
.fw-section {
  position: relative;
  padding-bottom: clamp(80px, 12vh, 140px);
}

/* ─── SECTION HEADER ─────────────────────────────────────────── */
.fw-header {
  padding: clamp(2rem, 4vh, 3.5rem) var(--gutter, 40px) clamp(1.5rem, 3vh, 2rem);
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 24px;
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

/* ─── VIDEO ZONE ─────────────────────────────────────────────── */
.fw-video-zone {
  padding: 0 var(--gutter, 40px);
  margin-bottom: clamp(40px, 6vh, 80px);
}
.fw-video-frame {
  position: relative;
  width: 100%;
  height: clamp(300px, 56vh, 680px);
  background: #070707;
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.07);
  overflow: hidden;
  box-shadow:
    0 2px 8px rgba(0,0,0,0.25),
    0 24px 80px rgba(0,0,0,0.55);
}
.fw-video-frame video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.fw-video-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
}
.fw-video-placeholder__icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.03);
  display: flex;
  align-items: center;
  justify-content: center;
}
.fw-video-placeholder__icon svg {
  width: 22px;
  height: 22px;
  fill: rgba(255,255,255,0.18);
  margin-left: 3px;
}
.fw-video-placeholder__text {
  font-family: var(--font-mono, "JetBrains Mono", monospace);
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.18);
}
/* scanlines + vignette overlay */
.fw-video-overlay {
  position: absolute;
  inset: 0;
  background:
    repeating-linear-gradient(
      to bottom,
      transparent 0px, transparent 2px,
      rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px
    ),
    radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.45) 100%);
  pointer-events: none;
  z-index: 2;
}
/* corner brackets */
.fw-video-corners { position: absolute; inset: 18px; z-index: 3; pointer-events: none; }
.fw-video-corners span { position: absolute; width: 24px; height: 24px; }
.fw-vc-tl { top:0; left:0; border-top:1px solid rgba(255,255,255,0.14); border-left:1px solid rgba(255,255,255,0.14); }
.fw-vc-tr { top:0; right:0; border-top:1px solid rgba(255,255,255,0.14); border-right:1px solid rgba(255,255,255,0.14); }
.fw-vc-bl { bottom:0; left:0; border-bottom:1px solid rgba(255,255,255,0.14); border-left:1px solid rgba(255,255,255,0.14); }
.fw-vc-br { bottom:0; right:0; border-bottom:1px solid rgba(255,255,255,0.14); border-right:1px solid rgba(255,255,255,0.14); }
/* live indicator */
.fw-video-badge {
  position: absolute;
  top: 18px;
  left: 22px;
  z-index: 4;
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-mono, "JetBrains Mono", monospace);
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.35);
  background: rgba(0,0,0,0.4);
  backdrop-filter: blur(8px);
  padding: 5px 12px 5px 8px;
  border-radius: 100px;
  border: 1px solid rgba(255,255,255,0.08);
}
.fw-video-badge__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent, #00FF94);
  animation: fw-badge-pulse 2.2s ease infinite;
  flex-shrink: 0;
}
@keyframes fw-badge-pulse {
  0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(0,255,148,0.4); }
  50%       { opacity: 0.7; box-shadow: 0 0 0 4px rgba(0,255,148,0); }
}

/* ─── PROJECT STRIP ──────────────────────────────────────────── */
.fw-strip {
  position: relative;
}
.fw-strip__scroll {
  display: flex;
  gap: 16px;
  padding: 0 var(--gutter, 40px);
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.fw-strip__scroll::-webkit-scrollbar { display: none; }

/* fade edge */
.fw-strip__scroll::after {
  content: '';
  flex-shrink: 0;
  width: clamp(16px, var(--gutter, 40px), 40px);
}

/* ─── STRIP CARD ─────────────────────────────────────────────── */
.fw-strip-card {
  flex-shrink: 0;
  width: clamp(240px, 28vw, 320px);
  height: clamp(280px, 34vh, 380px);
  scroll-snap-align: start;
  border-radius: 12px;
  overflow: hidden;
  background: #0a0a0a;
  border: 1px solid rgba(255,255,255,0.06);
  position: relative;
  text-decoration: none;
  color: inherit;
  display: block;
  cursor: none;
  opacity: 0;
  transform: translateY(24px);
  transition: border-color 0.35s ease;
}
.fw-strip-card--revealed {
  opacity: 1;
  transform: translateY(0);
  transition:
    opacity 0.55s ease,
    transform 0.55s cubic-bezier(0.22, 1, 0.36, 1),
    border-color 0.35s ease;
}
.fw-strip-card:hover { border-color: rgba(255,255,255,0.14); }
.fw-strip-card__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}
.fw-strip-card:hover .fw-strip-card__img { transform: scale(1.06); }
.fw-strip-card__gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(0,0,0,0.92) 0%,
    rgba(0,0,0,0.45) 40%,
    rgba(0,0,0,0.05) 70%,
    transparent 100%
  );
  z-index: 1;
}
.fw-strip-card__scanlines {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    to bottom,
    transparent 0px, transparent 2px,
    rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px
  );
  z-index: 2;
  pointer-events: none;
}
.fw-strip-card__placeholder {
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
.fw-strip-card__content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 18px 20px;
  z-index: 3;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.fw-strip-card__company {
  font-family: var(--font-mono, "JetBrains Mono", monospace);
  font-size: 9px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.4);
}
.fw-strip-card__title {
  font-family: var(--font-display, "Space Grotesk", sans-serif);
  font-size: clamp(0.95rem, 1.6vw, 1.2rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  color: #fff;
  line-height: 1.2;
}
.fw-strip-card__cta {
  font-family: var(--font-mono, "JetBrains Mono", monospace);
  font-size: 9px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.3);
  margin-top: 2px;
  transition: color 0.25s ease;
}
.fw-strip-card:hover .fw-strip-card__cta { color: var(--accent, #00FF94); }

/* ─── STRIP FOOTER ───────────────────────────────────────────── */
.fw-strip-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: clamp(20px, 3vh, 32px) var(--gutter, 40px) 0;
  gap: 16px;
}
.fw-strip-footer__label {
  font-family: var(--font-mono, "JetBrains Mono", monospace);
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.25);
}
.fw-view-all {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-mono, "JetBrains Mono", monospace);
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-fg, #f0f0f0);
  text-decoration: none;
  border: 1px solid rgba(255,255,255,0.12);
  padding: 9px 22px;
  border-radius: 100px;
  transition: border-color 0.3s ease, color 0.3s ease, gap 0.3s ease;
  cursor: none;
}
.fw-view-all:hover {
  border-color: var(--accent, #00FF94);
  color: var(--accent, #00FF94);
  gap: 14px;
}

/* ─── RESPONSIVE ─────────────────────────────────────────────── */
@media (max-width: 768px) {
  .fw-video-zone { padding: 0 20px; }
  .fw-strip__scroll { padding: 0 20px; }
  .fw-strip-footer { padding-left: 20px; padding-right: 20px; }
  .fw-header { padding-left: 20px; padding-right: 20px; flex-direction: column; gap: 6px; }
}
@media (prefers-reduced-motion: reduce) {
  .fw-strip-card, .fw-strip-card__img { transition: none !important; }
}
`

/* ────────────────────────────────────────────────────────────── */
/*  Strip card with staggered reveal                              */
/* ────────────────────────────────────────────────────────────── */

function StripCard({ project, index }: { project: Project; index: number }) {
  const cardRef = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    const el = cardRef.current
    if (!el) return

    const isMobile = window.matchMedia('(hover: none)').matches

    const reveal = () => el.classList.add('fw-strip-card--revealed')

    const delay = index * 80
    const rect = el.getBoundingClientRect()
    if (rect.left < window.innerWidth * 1.2) {
      setTimeout(reveal, delay)
      return
    }

    if (isMobile) {
      const io = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) { setTimeout(reveal, delay); io.disconnect() } },
        { threshold: 0.05 }
      )
      io.observe(el)
      return () => io.disconnect()
    }

    const st = ScrollTrigger.create({
      trigger: el,
      start: 'left 110%',
      horizontal: false,
      once: true,
      onEnter: () => setTimeout(reveal, delay),
    })
    return () => st.kill()
  }, [index])

  const coverSrc = project.coverUrl ?? project.thumbnailUrl
  const company  = [project.client, project.year].filter(Boolean).join(' · ')

  return (
    <Link
      ref={cardRef}
      href={`/work/${project.slug}`}
      className="fw-strip-card"
      data-cursor="View"
      aria-label={`View case study: ${project.title}`}
    >
      {coverSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={coverSrc} alt={project.title} className="fw-strip-card__img" draggable={false} />
      ) : (
        <div className="fw-strip-card__placeholder">{project.title}</div>
      )}
      <div className="fw-strip-card__gradient" />
      <div className="fw-strip-card__scanlines" aria-hidden="true" />
      <div className="fw-strip-card__content">
        {company && <p className="fw-strip-card__company">{company}</p>}
        <h3 className="fw-strip-card__title">{project.title}</h3>
        <span className="fw-strip-card__cta">View Case Study →</span>
      </div>
    </Link>
  )
}

/* ────────────────────────────────────────────────────────────── */
/*  Main component                                                */
/* ────────────────────────────────────────────────────────────── */

export default function WorkPreview({ projects, videoUrl }: WorkPreviewProps) {
  const sectionRef = useRef<HTMLDivElement>(null)

  // Reveal the section header
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          gsap.fromTo(
            el.querySelector('.fw-header__title'),
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
          )
          io.disconnect()
        }
      },
      { threshold: 0.15 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  if (projects.length === 0) return null

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <div ref={sectionRef} className="fw-section" id="work-preview">

        {/* ── Section header ───────────────────────────────── */}
        <div className="fw-header">
          <h2 className="fw-header__title" style={{ opacity: 0 }}>
            SELECTED <em>WORK</em>
          </h2>
          <span className="fw-header__count">
            {String(projects.length).padStart(2, '0')} PROJECTS
          </span>
        </div>

        {/* ── Zone A: Cinematic video reel ─────────────────── */}
        <div className="fw-video-zone">
          <div className="fw-video-frame">
            {videoUrl ? (
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
            ) : (
              <div className="fw-video-placeholder">
                <div className="fw-video-placeholder__icon">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                <p className="fw-video-placeholder__text">Showreel Coming Soon</p>
              </div>
            )}
            <div className="fw-video-overlay" />
            {videoUrl && (
              <div className="fw-video-badge">
                <span className="fw-video-badge__dot" />
                Showreel
              </div>
            )}
            <div className="fw-video-corners" aria-hidden="true">
              <span className="fw-vc-tl" /><span className="fw-vc-tr" />
              <span className="fw-vc-bl" /><span className="fw-vc-br" />
            </div>
          </div>
        </div>

        {/* ── Zone B: Horizontal project strip ─────────────── */}
        <div className="fw-strip">
          <div className="fw-strip__scroll" role="list">
            {projects.map((project, i) => (
              <StripCard key={project.id} project={project} index={i} />
            ))}
          </div>

          <div className="fw-strip-footer">
            <span className="fw-strip-footer__label">Featured projects</span>
            <Link href="/work" className="fw-view-all" data-cursor="">
              View All Work →
            </Link>
          </div>
        </div>

      </div>
    </>
  )
}
