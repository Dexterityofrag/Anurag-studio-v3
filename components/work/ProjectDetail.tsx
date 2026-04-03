'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react'
import TiptapRenderer from '@/components/TiptapRenderer'
import type { Project, ProjectWithTestimonials } from '@/lib/types'
import type { ImageItem } from '@/lib/db/schema'

interface ProjectDetailProps {
  project: ProjectWithTestimonials
  adjacent: { prev: Project | null; next: Project | null }
}

const css = /* css */ `
/* ─── READING PROGRESS ──────────────────────────────────────── */
.pd-prog {
  position: fixed; top: 0; left: 0; right: 0;
  height: 2px; z-index: 200; pointer-events: none;
}
.pd-prog__bar {
  height: 100%; width: 0%;
  background: var(--accent, #C8FF00);
  transition: width 0.05s linear;
  transform-origin: left;
}

/* ─── HERO ──────────────────────────────────────────────────── */
.pd-hero {
  position: relative;
  width: 100%;
  height: 100dvh;
  min-height: 600px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}
.pd-hero__bg {
  position: absolute; inset: 0; z-index: 0;
}
.pd-hero__bg-img {
  width: 100%; height: 100%;
  object-fit: cover; object-position: center top;
  filter: brightness(0.45) saturate(0.8);
  transform: scale(1.04);
  transition: transform 14s ease, filter 1s ease;
  will-change: transform;
}
.pd-hero__bg-img--loaded {
  transform: scale(1);
  filter: brightness(0.38) saturate(0.75);
}
.pd-hero__overlay {
  position: absolute; inset: 0; z-index: 1;
  background: linear-gradient(
    to bottom,
    rgba(6,6,6,0.12) 0%,
    rgba(6,6,6,0.04) 30%,
    rgba(6,6,6,0.55) 65%,
    rgba(6,6,6,0.96) 100%
  );
}
.pd-hero__back {
  position: absolute; top: clamp(1.5rem,3vw,2.5rem); left: var(--page-px, 40px);
  z-index: 5;
  display: inline-flex; align-items: center; gap: 8px;
  font-family: var(--font-mono); font-size: 11px;
  color: rgba(255,255,255,0.45); text-decoration: none;
  letter-spacing: 0.08em; text-transform: uppercase;
  transition: color 0.2s;
}
.pd-hero__back:hover { color: #fff; }
.pd-hero__back svg { width: 14px; height: 14px; }
.pd-hero__content {
  position: relative; z-index: 2;
  padding: 0 var(--page-px, clamp(1.5rem,5vw,4rem)) clamp(3rem,6vh,5rem);
}
.pd-hero__category {
  font-family: var(--font-mono); font-size: 11px;
  color: rgba(255,255,255,0.45); letter-spacing: 0.12em;
  text-transform: uppercase; margin-bottom: clamp(1rem,2vh,1.5rem);
  display: flex; align-items: center; gap: 10px;
}
.pd-hero__dot {
  width: 4px; height: 4px; border-radius: 50%;
  background: var(--accent, #C8FF00); display: inline-block; flex-shrink: 0;
}
.pd-hero__title {
  font-family: var(--font-display); font-weight: 700;
  font-size: clamp(3.5rem, 9vw, 9rem);
  line-height: 0.88; letter-spacing: -0.04em;
  color: #fff; margin: 0 0 clamp(1.2rem,2.5vh,2rem);
  max-width: 18ch;
}
.pd-hero__tagline {
  font-family: var(--font-body); font-size: clamp(1rem,1.4vw,1.15rem);
  color: rgba(255,255,255,0.5); line-height: 1.65; max-width: 52ch;
}

/* ─── BODY LAYOUT ─────────────────────────────────────────────── */
.pd-body {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 0;
  padding: 0 var(--page-px, clamp(1.5rem,5vw,4rem));
  align-items: start;
  max-width: 1400px;
  margin: 0 auto;
}

/* ─── LEFT SIDEBAR ────────────────────────────────────────────── */
.pd-sidebar {
  position: sticky;
  top: clamp(4rem,8vh,6rem);
  padding: clamp(4rem,8vh,6rem) clamp(2rem,4vw,4rem) clamp(4rem,8vh,6rem) 0;
  border-right: 1px solid rgba(255,255,255,0.06);
}
.pd-meta-item { margin-bottom: clamp(1.5rem,3vh,2.5rem); }
.pd-meta-item:last-of-type { margin-bottom: 0; }
.pd-meta__label {
  font-family: var(--font-mono); font-size: 9px;
  color: rgba(255,255,255,0.28); letter-spacing: 0.14em;
  text-transform: uppercase; margin-bottom: 6px;
}
.pd-meta__value {
  font-family: var(--font-body); font-size: 14px;
  color: rgba(255,255,255,0.82); line-height: 1.5;
}
.pd-meta__tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
.pd-meta__tag {
  font-family: var(--font-mono); font-size: 9px;
  color: rgba(255,255,255,0.38); letter-spacing: 0.06em; text-transform: uppercase;
  padding: 3px 8px; border: 1px solid rgba(255,255,255,0.1);
}
.pd-sidebar-cta {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 16px;
  background: var(--accent, #C8FF00);
  color: #0a0a0a; text-decoration: none;
  font-family: var(--font-display); font-weight: 700;
  font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase;
  margin-top: clamp(2rem,4vh,3rem);
  transition: opacity 0.2s ease;
}
.pd-sidebar-cta:hover { opacity: 0.88; }
.pd-sidebar-cta svg { width: 14px; height: 14px; flex-shrink: 0; transition: transform 0.25s ease; }
.pd-sidebar-cta:hover svg { transform: translate(2px,-2px); }
.pd-sidebar-cta--disabled {
  background: rgba(255,255,255,0.05);
  color: rgba(255,255,255,0.18);
  pointer-events: none;
}

/* ─── RIGHT MAIN CONTENT ──────────────────────────────────────── */
.pd-main {
  padding: clamp(4rem,8vh,6rem) 0 clamp(4rem,8vh,6rem) clamp(2.5rem,5vw,5rem);
}
.pd-main .tiptap-content h1,
.pd-main .tiptap-content h2 {
  font-family: var(--font-display); font-weight: 700;
  font-size: clamp(1.5rem,2.5vw,2.2rem);
  letter-spacing: -0.025em; color: var(--text, #FAFAFA);
  margin: clamp(2.5rem,5vh,4rem) 0 clamp(0.8rem,1.5vh,1.2rem);
  line-height: 1.1;
}
.pd-main .tiptap-content h1:first-child,
.pd-main .tiptap-content h2:first-child { margin-top: 0; }
.pd-main .tiptap-content h3 {
  font-family: var(--font-display); font-weight: 600;
  font-size: clamp(1.1rem,1.8vw,1.5rem);
  letter-spacing: -0.015em; color: var(--text, #FAFAFA);
  margin: clamp(2rem,4vh,3rem) 0 0.75rem;
}
.pd-main .tiptap-content p {
  font-family: var(--font-body); font-size: clamp(1rem,1.3vw,1.1rem);
  color: rgba(255,255,255,0.6); line-height: 1.85;
  margin-bottom: 1.4em; max-width: 68ch;
}
.pd-main .tiptap-content ul,
.pd-main .tiptap-content ol { padding-left: 1.5rem; margin-bottom: 1.4em; }
.pd-main .tiptap-content li {
  font-family: var(--font-body); font-size: clamp(1rem,1.3vw,1.1rem);
  color: rgba(255,255,255,0.6); line-height: 1.8; margin-bottom: 0.4em;
}
.pd-plain {
  font-family: var(--font-body); font-size: clamp(1rem,1.3vw,1.1rem);
  color: rgba(255,255,255,0.6); line-height: 1.85; max-width: 68ch;
}

/* ─── FEATURED IMAGE ──────────────────────────────────────────── */
.pd-featured {
  padding: 0 var(--page-px, clamp(1.5rem,5vw,4rem)) clamp(4rem,8vh,6rem);
  max-width: 1400px; margin: 0 auto;
}
.pd-featured__inner { position: relative; overflow: hidden; background: #111; }
.pd-featured__img {
  width: 100%; height: auto; display: block;
  transform: scale(1.02);
  transition: transform 0.8s cubic-bezier(0.22,1,0.36,1);
}
.pd-featured__inner:hover .pd-featured__img { transform: scale(1); }

/* ─── PREV / NEXT ─────────────────────────────────────────────── */
.pd-nav { display: grid; grid-template-columns: 1fr 1fr; border-top: 1px solid rgba(255,255,255,0.06); }
.pd-nav__link {
  display: flex; align-items: center; gap: 20px;
  padding: clamp(2rem,4vw,3.5rem) var(--page-px, 40px);
  text-decoration: none; color: var(--text, #fff);
  transition: background 0.3s ease; position: relative; overflow: hidden;
}
.pd-nav__link::before {
  content: ''; position: absolute; inset: 0;
  background: var(--accent, #C8FF00); opacity: 0; transition: opacity 0.3s ease;
}
.pd-nav__link:hover::before { opacity: 0.03; }
.pd-nav__link--next { justify-content: flex-end; text-align: right; border-left: 1px solid rgba(255,255,255,0.06); }
.pd-nav__dir { font-family: var(--font-mono); font-size: 9px; color: rgba(255,255,255,0.28); text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 6px; }
.pd-nav__title { font-family: var(--font-display); font-weight: 600; font-size: clamp(0.9rem,1.6vw,1.2rem); color: rgba(255,255,255,0.3); transition: color 0.3s ease; position: relative; z-index: 1; }
.pd-nav__link:hover .pd-nav__title { color: var(--text, #fff); }
.pd-nav__arrow { color: rgba(255,255,255,0.22); opacity: 0; transition: opacity 0.3s, transform 0.3s; position: relative; z-index: 1; flex-shrink: 0; }
.pd-nav__link:hover .pd-nav__arrow { opacity: 1; }
.pd-nav__link--prev:hover .pd-nav__arrow { transform: translateX(-4px); }
.pd-nav__link--next:hover .pd-nav__arrow { transform: translateX(4px); }
.pd-nav__placeholder { padding: clamp(2rem,4vw,3.5rem) var(--page-px, 40px); }

/* ─── RESPONSIVE ──────────────────────────────────────────────── */
@media (max-width: 900px) {
  .pd-body { grid-template-columns: 1fr; }
  .pd-sidebar {
    position: static; border-right: none;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    padding: 3rem 0;
    display: grid; grid-template-columns: repeat(auto-fill, minmax(160px,1fr)); gap: 1.5rem;
  }
  .pd-sidebar-cta { grid-column: 1/-1; }
  .pd-main { padding-left: 0; }
}
@media (max-width: 640px) {
  .pd-hero__title { font-size: clamp(2.8rem,10vw,5rem); }
  .pd-nav { grid-template-columns: 1fr; }
  .pd-nav__link--next { border-left: none; border-top: 1px solid rgba(255,255,255,0.06); justify-content: flex-start; text-align: left; }
}
`

export default function ProjectDetail({ project, adjacent }: ProjectDetailProps) {
  const [scrollPct, setScrollPct] = useState(0)
  const [imgLoaded, setImgLoaded]  = useState(false)
  const images = (project.images ?? []) as ImageItem[]
  const featuredImg = images[1] ?? images[0] ?? null
  const category = project.tags?.slice(0, 2).join(', ') ?? 'Project'

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight
      if (h > 0) setScrollPct((window.scrollY / h) * 100)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />

      {/* Progress */}
      <div className="pd-prog" aria-hidden="true">
        <div className="pd-prog__bar" style={{ width: `${scrollPct}%` }} />
      </div>

      {/* ── HERO ── */}
      <section className="pd-hero">
        <div className="pd-hero__bg">
          {project.coverUrl && (
            <Image
              src={project.coverUrl}
              alt={project.title}
              fill priority sizes="100vw"
              className={`pd-hero__bg-img${imgLoaded ? ' pd-hero__bg-img--loaded' : ''}`}
              onLoad={() => setImgLoaded(true)}
            />
          )}
          <div className="pd-hero__overlay" />
        </div>

        <Link href="/work" className="pd-hero__back">
          <ArrowLeft /> Back
        </Link>

        <div className="pd-hero__content">
          <div className="pd-hero__category">
            <span className="pd-hero__dot" aria-hidden="true" />
            {category}
            {project.year && (
              <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '10px' }}>
                · {project.year}
              </span>
            )}
          </div>
          <h1 className="pd-hero__title">{project.title}</h1>
          {project.tagline && (
            <p className="pd-hero__tagline">{project.tagline}</p>
          )}
        </div>
      </section>

      {/* ── BODY ── */}
      <div className="pd-body">

        {/* Left sidebar */}
        <aside className="pd-sidebar">
          {project.role && (
            <div className="pd-meta-item">
              <p className="pd-meta__label">Role</p>
              <p className="pd-meta__value">{project.role}</p>
            </div>
          )}
          {project.client && (
            <div className="pd-meta-item">
              <p className="pd-meta__label">Client</p>
              <p className="pd-meta__value">{project.client}</p>
            </div>
          )}
          {project.year && (
            <div className="pd-meta-item">
              <p className="pd-meta__label">Year</p>
              <p className="pd-meta__value">{project.year}</p>
            </div>
          )}
          {project.tags && project.tags.length > 0 && (
            <div className="pd-meta-item">
              <p className="pd-meta__label">Services</p>
              <div className="pd-meta__tags">
                {project.tags.map((t) => (
                  <span key={t} className="pd-meta__tag">{t}</span>
                ))}
              </div>
            </div>
          )}

          {project.externalUrl ? (
            <a href={project.externalUrl} target="_blank" rel="noopener noreferrer" className="pd-sidebar-cta">
              View Live Project <ArrowUpRight />
            </a>
          ) : (
            <div className="pd-sidebar-cta pd-sidebar-cta--disabled">
              Coming Soon <ArrowUpRight />
            </div>
          )}
        </aside>

        {/* Right content */}
        <main className="pd-main">
          {project.descriptionHtml ? (
            <TiptapRenderer html={project.descriptionHtml} />
          ) : project.tagline ? (
            <p className="pd-plain">{project.tagline}</p>
          ) : null}
        </main>
      </div>

      {/* ── FEATURED IMAGE ── */}
      {featuredImg && (
        <section className="pd-featured">
          <div className="pd-featured__inner">
            <Image
              src={featuredImg.url}
              alt={featuredImg.alt || project.title}
              width={1600} height={900}
              sizes="(max-width:768px) 100vw, calc(100vw - 2*var(--page-px, 40px))"
              className="pd-featured__img"
            />
          </div>
        </section>
      )}

      {/* ── PREV / NEXT ── */}
      <nav className="pd-nav" aria-label="Project navigation">
        {adjacent.prev ? (
          <Link href={`/work/${adjacent.prev.slug}`} className="pd-nav__link pd-nav__link--prev">
            <ArrowLeft className="pd-nav__arrow" size={20} />
            <div>
              <p className="pd-nav__dir">Previous</p>
              <p className="pd-nav__title">{adjacent.prev.title}</p>
            </div>
          </Link>
        ) : <div className="pd-nav__placeholder" />}

        {adjacent.next ? (
          <Link href={`/work/${adjacent.next.slug}`} className="pd-nav__link pd-nav__link--next">
            <div>
              <p className="pd-nav__dir">Next</p>
              <p className="pd-nav__title">{adjacent.next.title}</p>
            </div>
            <ArrowRight className="pd-nav__arrow" size={20} />
          </Link>
        ) : <div className="pd-nav__placeholder" />}
      </nav>
    </>
  )
}
