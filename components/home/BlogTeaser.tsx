'use client'

import { useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { BlogPost } from '@/lib/types'

/* ────────────────────────────────────────────────────────────── */
/*  Styles                                                        */
/* ────────────────────────────────────────────────────────────── */

const css = /* css */ `
.blog-teaser {
  padding: clamp(5rem, 10vh, 8rem) var(--page-px);
}

/* Header */
.blog-teaser__header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: clamp(2rem, 4vw, 3.5rem);
}
.blog-teaser__label {
  display: flex;
  align-items: baseline;
  gap: 12px;
}
.blog-teaser__num {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--muted);
  letter-spacing: 0.04em;
}
.blog-teaser__title {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.12em;
}
.blog-teaser__all {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--accent);
  text-decoration: none;
  letter-spacing: 0.06em;
  transition: opacity 0.3s ease;
}
.blog-teaser__all:hover { opacity: 0.7; }

/* Grid */
.blog-teaser__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

/* ─── Card ───────────────────────────────────────────────────── */
.bcard {
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
  background: var(--surface);
  border-radius: 12px;
  transform: perspective(900px) rotateX(var(--rx)) rotateY(var(--ry));
  transition: transform 0.55s cubic-bezier(0.22, 1, 0.36, 1),
              box-shadow 0.55s ease;
  will-change: transform;
  transform-origin: center bottom;
}
.bcard:hover {
  box-shadow: 0 24px 60px rgba(0,0,0,0.45);
}

/* Cursor glow spotlight */
.bcard::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 12px;
  background: radial-gradient(
    circle at var(--mx) var(--my),
    rgba(255, 77, 0, 0.09) 0%,
    transparent 60%
  );
  opacity: var(--glow);
  transition: opacity 0.35s ease;
  pointer-events: none;
  z-index: 5;
}

/* Cover */
.bcard__cover {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: var(--surface-2);
  overflow: hidden;
  border-radius: 12px 12px 0 0;
  z-index: 1;
}
.bcard__cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.55s cubic-bezier(0.22, 1, 0.36, 1),
              filter 0.55s ease;
}
.bcard:hover .bcard__cover-img {
  transform: scale(1.05);
  filter: brightness(1.1) saturate(1.08);
}

/* Body */
.bcard__body {
  padding: clamp(16px, 2vw, 24px);
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
  position: relative;
  z-index: 1;
}

/* Tag */
.bcard__tag {
  align-self: flex-start;
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 3px 10px;
  border: 1px solid rgba(255, 77, 0, 0.2);
  border-radius: 999px;
}

/* Title + underline draw */
.bcard__title {
  font-family: var(--font-display);
  font-weight: 500;
  font-size: clamp(1rem, 1.6vw, 1.25rem);
  line-height: 1.3;
  position: relative;
  width: fit-content;
}
.bcard__title::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 0%;
  height: 1px;
  background: var(--accent, #FF4D00);
  transition: width 0.45s cubic-bezier(0.22, 1, 0.36, 1);
}
.bcard:hover .bcard__title::after { width: 100%; }

.bcard__excerpt {
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--muted);
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.bcard__date {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--muted-2, #555);
  margin-top: auto;
  padding-top: 8px;
}

/* Placeholder */
.blog-teaser__empty {
  grid-column: 1 / -1;
  text-align: center;
  padding: 4rem 0;
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--muted-2, #555);
}

@media (max-width: 768px) {
  .blog-teaser__grid {
    grid-template-columns: 1fr;
    display: flex;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    padding-bottom: 8px;
    gap: 24px;
  }
  .blog-teaser__grid::-webkit-scrollbar { display: none; }
  .bcard {
    min-width: 85vw;
    scroll-snap-align: start;
    flex-shrink: 0;
  }
}
`

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
/*  Card (tilt + spotlight)                                       */
/* ────────────────────────────────────────────────────────────── */

function BCard({ post }: { post: BlogPost }) {
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
      className="bcard"
      data-cursor="Read"
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      target={post.externalUrl ? '_blank' : undefined}
      rel={post.externalUrl ? 'noopener noreferrer' : undefined}
    >
      <div className="bcard__cover">
        {post.coverUrl ? (
          <Image
            src={post.coverUrl}
            alt={post.title}
            fill
            sizes="(max-width:768px) 85vw, 33vw"
            className="bcard__cover-img"
          />
        ) : null}
      </div>
      <div className="bcard__body">
        {post.tags?.[0] && (
          <span className="bcard__tag">{post.tags[0]}</span>
        )}
        <h3 className="bcard__title">{post.title}</h3>
        {post.excerpt && (
          <p className="bcard__excerpt">{post.excerpt}</p>
        )}
        <time className="bcard__date">{fmtDate(post.publishedAt)}</time>
      </div>
    </Link>
  )
}

/* ────────────────────────────────────────────────────────────── */
/*  Component                                                     */
/* ────────────────────────────────────────────────────────────── */

export default function BlogTeaser({ posts }: { posts: BlogPost[] }) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <section className="blog-teaser" id="blog-teaser">
        <div className="blog-teaser__header">
          <div className="blog-teaser__label">
            <span className="blog-teaser__num">03</span>
            <span className="blog-teaser__title">Latest Writing</span>
          </div>
          <Link href="/blog" className="blog-teaser__all">
            (ALL POSTS →)
          </Link>
        </div>

        <div className="blog-teaser__grid">
          {posts.length > 0
            ? posts.map((post) => <BCard key={post.id} post={post} />)
            : <p className="blog-teaser__empty">Posts coming soon</p>
          }
        </div>
      </section>
    </>
  )
}
