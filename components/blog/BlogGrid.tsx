'use client'

import { useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import AnimatedHeading from '@/components/AnimatedHeading'
import { useStaggerReveal } from '@/hooks/useStaggerReveal'
import type { BlogPost } from '@/lib/types'

/* ────────────────────────────────────────────────────────────── */
/*  Props                                                         */
/* ────────────────────────────────────────────────────────────── */

interface BlogGridProps {
  posts: BlogPost[]
  tags: string[]
}

/* ────────────────────────────────────────────────────────────── */
/*  Helpers                                                       */
/* ────────────────────────────────────────────────────────────── */

function fmtDate(d: Date | null | undefined): string {
  if (!d) return ''
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(d))
}

/* ────────────────────────────────────────────────────────────── */
/*  Styles                                                        */
/* ────────────────────────────────────────────────────────────── */

const css = /* css */ `
.blog-page {
  min-height: 100dvh;
  padding: var(--nav-h, 72px) var(--page-px) clamp(4rem, 8vh, 8rem);
}

/* ─── HEADER ─────────────────────────────────────────────────── */
.blog-page__header {
  padding-top: clamp(3rem, 6vw, 6rem);
  padding-bottom: clamp(2rem, 4vw, 3rem);
}
.blog-page__title-row {
  display: flex;
  align-items: baseline;
  gap: clamp(12px, 2vw, 24px);
  flex-wrap: wrap;
}
.blog-page__title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(6rem, 15vw, 14rem);
  line-height: 0.85;
  color: var(--text);
  letter-spacing: -0.04em;
}
.blog-page__count {
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.06em;
  padding: 6px 14px;
  border-radius: 999px;
  background: var(--accent);
  color: var(--bg);
  white-space: nowrap;
  align-self: center;
}

/* ─── DIVIDER ────────────────────────────────────────────────── */
.blog-page__divider {
  width: 100%;
  height: 1px;
  background: var(--border);
  margin-bottom: clamp(1.5rem, 3vw, 2.5rem);
}

/* ─── FILTER PILLS ───────────────────────────────────────────── */
.blog-filters {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: clamp(2rem, 4vw, 3.5rem);
}
.blog-filters__pill {
  position: relative;
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.04em;
  padding: 8px 18px;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  background: transparent;
  color: var(--muted);
  transition: color 0.25s ease;
  z-index: 1;
}
.blog-filters__pill:hover { color: var(--text); }
.blog-filters__pill--active { color: var(--bg); }
.blog-filters__pill-bg {
  position: absolute;
  inset: 0;
  border-radius: 999px;
  background: var(--accent);
  z-index: -1;
}
.blog-filters__pill:not(.blog-filters__pill--active)::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 999px;
  background: var(--surface-2);
  z-index: -1;
  transition: background 0.25s ease;
}
.blog-filters__pill:not(.blog-filters__pill--active):hover::before {
  background: var(--border);
}

/* ─── CARD GRID ──────────────────────────────────────────────── */
.blog-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: clamp(1.5rem, 3vw, 2.5rem) clamp(2rem, 5vw, 5rem);
}

/* ─── POST CARD ──────────────────────────────────────────────── */

.bpost {
  --rx: 0deg;
  --ry: 0deg;
  --mx: 50%;
  --my: 50%;
  --glow: 0;

  position: relative;
  display: flex;
  flex-direction: column;
  text-decoration: none;
  color: var(--text);
  border-bottom: 1px solid rgba(255,255,255,0.06);
  padding-bottom: clamp(1.5rem, 3vw, 2.5rem);
  transform: perspective(900px) rotateX(var(--rx)) rotateY(var(--ry));
  transition: transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
  will-change: transform;
  transform-origin: center bottom;
}

/* Cursor glow spotlight */
.bpost::after {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: 10px;
  background: radial-gradient(
    circle at var(--mx) var(--my),
    rgba(0, 255, 148, 0.09) 0%,
    transparent 60%
  );
  opacity: var(--glow);
  transition: opacity 0.35s ease;
  pointer-events: none;
  z-index: 0;
}

.bpost__cover {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: var(--surface);
  overflow: hidden;
  border-radius: 6px;
  margin-bottom: 18px;
  flex-shrink: 0;
  z-index: 1;
}
.bpost__cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.55s cubic-bezier(0.22, 1, 0.36, 1),
              filter 0.55s ease;
}
.bpost:hover .bpost__cover-img {
  transform: scale(1.05);
  filter: brightness(1.1) saturate(1.08);
}

.bpost__tag {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--accent);
  margin-bottom: 8px;
  position: relative;
  z-index: 1;
}

.bpost__body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  position: relative;
  z-index: 1;
}
.bpost__title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(1.05rem, 1.5vw, 1.3rem);
  line-height: 1.28;
  letter-spacing: -0.02em;
  color: var(--text);
  position: relative;
  width: fit-content;
}
/* Underline draw */
.bpost__title::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0%;
  height: 1px;
  background: var(--accent, #00FF94);
  transition: width 0.45s cubic-bezier(0.22, 1, 0.36, 1);
}
.bpost:hover .bpost__title::after { width: 100%; }

.bpost__excerpt {
  font-family: var(--font-body);
  font-size: 14px;
  color: rgba(255,255,255,0.5);
  line-height: 1.65;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.bpost__meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: rgba(255,255,255,0.3);
  margin-top: 6px;
  letter-spacing: 0.04em;
}
.bpost__meta-dot {
  width: 2px;
  height: 2px;
  border-radius: 50%;
  background: currentColor;
}
.bpost__external-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.25);
  margin-left: auto;
}
.bpost__external-badge svg {
  width: 9px; height: 9px;
  opacity: 0.5;
}

/* ─── EMPTY STATE ────────────────────────────────────────────── */
.blog-grid__empty {
  grid-column: 1 / -1;
  text-align: center;
  padding: clamp(4rem, 8vh, 8rem) 0;
  font-family: var(--font-mono);
  font-size: 14px;
  color: var(--muted-2, #555);
}

/* ─── RESPONSIVE ─────────────────────────────────────────────── */
@media (max-width: 640px) {
  .blog-grid { grid-template-columns: 1fr; }
}
`

/* ────────────────────────────────────────────────────────────── */
/*  Blog Card (tilt + spotlight)                                  */
/* ────────────────────────────────────────────────────────────── */

function BlogCard({ post }: { post: BlogPost }) {
  const ref = useRef<HTMLAnchorElement>(null)

  const onMove = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const cx = r.left + r.width / 2
    const cy = r.top + r.height / 2
    const rx = ((e.clientY - cy) / r.height) * -7
    const ry = ((e.clientX - cx) / r.width) * 7
    const mx = ((e.clientX - r.left) / r.width) * 100
    const my = ((e.clientY - r.top) / r.height) * 100
    el.style.setProperty('--rx', `${rx}deg`)
    el.style.setProperty('--ry', `${ry}deg`)
    el.style.setProperty('--mx', `${mx}%`)
    el.style.setProperty('--my', `${my}%`)
    el.style.setProperty('--glow', '1')
  }, [])

  const onLeave = useCallback(() => {
    const el = ref.current
    if (!el) return
    el.style.setProperty('--rx', '0deg')
    el.style.setProperty('--ry', '0deg')
    el.style.setProperty('--glow', '0')
  }, [])

  return (
    <Link
      ref={ref}
      href={post.externalUrl ?? `/blog/${post.slug}`}
      className="bpost"
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      {...(post.externalUrl ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      <div className="bpost__cover">
        {post.coverUrl ? (
          <Image
            src={post.coverUrl}
            alt={post.title}
            fill
            sizes="(max-width:640px) 100vw, 50vw"
            className="bpost__cover-img"
          />
        ) : null}
      </div>
      <div className="bpost__body">
        {post.tags?.[0] && (
          <span className="bpost__tag">{post.tags[0]}</span>
        )}
        <h2 className="bpost__title">{post.title}</h2>
        {post.excerpt && (
          <p className="bpost__excerpt">{post.excerpt}</p>
        )}
        <div className="bpost__meta">
          <time>{fmtDate(post.publishedAt)}</time>
          <span className="bpost__meta-dot" aria-hidden="true" />
          <span>{post.readingTimeMinutes ?? 5} min read</span>
          {post.externalUrl && (
            <span className="bpost__external-badge">
              <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M5 2H2v8h8V7M7 1h4v4M11 1L6 6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Medium
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

/* ────────────────────────────────────────────────────────────── */
/*  Component                                                     */
/* ────────────────────────────────────────────────────────────── */

export default function BlogGrid({ posts, tags }: BlogGridProps) {
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  useStaggerReveal(gridRef, { selector: '.bpost' })

  const filtered = activeTag
    ? posts.filter((p) => p.tags?.includes(activeTag))
    : posts

  const allTags = ['All', ...tags]

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <div className="blog-page">
        {/* Header */}
        <header className="blog-page__header">
          <div className="blog-page__title-row">
            <AnimatedHeading text="BLOG" tag="h1" className="blog-page__title page-title" />
            <span className="blog-page__count">
              #{filtered.length} ARTICLE{filtered.length !== 1 ? 'S' : ''}
            </span>
          </div>
        </header>

        <div className="blog-page__divider" />

        {/* Filter pills */}
        <div className="blog-filters" role="tablist">
          {allTags.map((tag) => {
            const isActive =
              tag === 'All' ? activeTag === null : activeTag === tag
            return (
              <button
                key={tag}
                className={`blog-filters__pill${isActive ? ' blog-filters__pill--active' : ''}`}
                onClick={() => setActiveTag(tag === 'All' ? null : tag)}
                role="tab"
                aria-selected={isActive}
              >
                {isActive && (
                  <motion.span
                    className="blog-filters__pill-bg"
                    layoutId="active-blog-filter"
                    transition={{
                      type: 'spring',
                      stiffness: 380,
                      damping: 30,
                    }}
                  />
                )}
                {tag}
              </button>
            )
          })}
        </div>

        {/* Post grid */}
        <div className="blog-grid" ref={gridRef}>
          {filtered.length > 0 ? (
            filtered.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))
          ) : (
            <p className="blog-grid__empty">
              No articles found for this tag.
            </p>
          )}
        </div>
      </div>
    </>
  )
}
