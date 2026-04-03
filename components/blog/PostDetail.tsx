'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import TiptapRenderer from '@/components/TiptapRenderer'
import type { BlogPost } from '@/lib/types'

/* ────────────────────────────────────────────────────────────── */
/*  Props                                                         */
/* ────────────────────────────────────────────────────────────── */

interface PostDetailProps {
    post: BlogPost
    adjacent: { prev: BlogPost | null; next: BlogPost | null }
}

/* ────────────────────────────────────────────────────────────── */
/*  Helpers                                                       */
/* ────────────────────────────────────────────────────────────── */

function fmtDate(d: Date | null | undefined): string {
    if (!d) return ''
    return new Intl.DateTimeFormat('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    }).format(new Date(d))
}

/* ────────────────────────────────────────────────────────────── */
/*  Styles                                                        */
/* ────────────────────────────────────────────────────────────── */

const css = /* css */ `
/* ─── PROGRESS BAR ───────────────────────────────────────────── */
.bp-progress {
  position: fixed;
  top: 0; left: 0; right: 0;
  height: 3px;
  z-index: 60;
  pointer-events: none;
}
.bp-progress__bar {
  height: 100%;
  width: 0%;
  background: var(--accent);
  transition: width 0.05s linear;
}

/* ─── BACK TO BLOG (sticky) ─────────────────────────────────── */
.bp-back {
  position: fixed;
  top: calc(var(--nav-h, 72px) + 12px);
  left: var(--page-px);
  z-index: 55;
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--muted);
  text-decoration: none;
  letter-spacing: 0.04em;
  opacity: 0;
  transform: translateY(-8px);
  transition: opacity 0.3s ease, transform 0.3s ease, color 0.2s ease;
  pointer-events: none;
}
.bp-back--visible {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}
.bp-back:hover { color: var(--text); }
.bp-back svg { width: 14px; height: 14px; }

/* ─── COVER ──────────────────────────────────────────────────── */
.bp-cover {
  position: relative;
  height: 60vh;
  overflow: hidden;
}
.bp-cover__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.bp-cover__placeholder {
  position: absolute;
  inset: 0;
  background: var(--surface);
}
.bp-cover__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    var(--bg) 0%,
    rgba(10, 10, 10, 0.5) 40%,
    rgba(10, 10, 10, 0.2) 100%
  );
  z-index: 1;
}
.bp-cover__content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: clamp(2rem, 4vw, 3.5rem) var(--page-px);
  z-index: 2;
}
.bp-cover__top {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}
.bp-cover__tag {
  font-family: var(--font-mono);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 4px 12px;
  border-radius: 999px;
  background: var(--accent);
  color: var(--bg);
}
.bp-cover__date {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--muted);
  letter-spacing: 0.04em;
}
.bp-cover__title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(3rem, 7vw, 6rem);
  line-height: 0.95;
  color: var(--text);
  letter-spacing: -0.03em;
  margin-bottom: 12px;
  max-width: 18ch;
}
.bp-cover__read {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--muted);
  letter-spacing: 0.04em;
}

/* ─── BODY ───────────────────────────────────────────────────── */
.bp-body {
  max-width: 720px;
  margin-inline: auto;
  padding: clamp(3rem, 6vw, 5rem) var(--page-px);
}

/* ─── TAGS ROW ───────────────────────────────────────────────── */
.bp-tags {
  max-width: 720px;
  margin-inline: auto;
  padding: 0 var(--page-px) clamp(3rem, 6vw, 5rem);
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  border-top: 1px solid var(--border);
  padding-top: clamp(1.5rem, 3vw, 2rem);
}
.bp-tags__label {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--muted-2, #555);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-right: 4px;
}
.bp-tags__pill {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--muted);
  letter-spacing: 0.04em;
  padding: 4px 12px;
  border: 1px solid var(--border);
  border-radius: 999px;
  text-decoration: none;
  transition: border-color 0.2s ease, color 0.2s ease;
}
.bp-tags__pill:hover {
  border-color: var(--muted-2, #555);
  color: var(--text);
}

/* ─── PREV / NEXT ────────────────────────────────────────────── */
.bp-nav {
  display: grid;
  grid-template-columns: 1fr 1fr;
  border-top: 1px solid var(--border);
}
.bp-nav__link {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: clamp(2rem, 4vw, 3rem) var(--page-px);
  text-decoration: none;
  color: var(--text);
  transition: background 0.3s ease;
}
.bp-nav__link:hover { background: rgba(255, 255, 255, 0.02); }
.bp-nav__link--next {
  justify-content: flex-end;
  text-align: right;
  border-left: 1px solid var(--border);
}
.bp-nav__dir {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--muted-2, #555);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 4px;
}
.bp-nav__title {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: clamp(1rem, 2vw, 1.35rem);
  color: var(--text);
  opacity: 0.4;
  transition: opacity 0.3s ease;
}
.bp-nav__link:hover .bp-nav__title { opacity: 1; }
.bp-nav__arrow {
  color: var(--muted);
  opacity: 0;
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.bp-nav__link:hover .bp-nav__arrow { opacity: 1; }
.bp-nav__link--prev:hover .bp-nav__arrow { transform: translateX(-4px); }
.bp-nav__link--next:hover .bp-nav__arrow { transform: translateX(4px); }
.bp-nav__placeholder { padding: clamp(2rem, 4vw, 3rem) var(--page-px); }

@media (max-width: 768px) {
  .bp-nav { grid-template-columns: 1fr; }
  .bp-nav__link--next {
    border-left: none;
    border-top: 1px solid var(--border);
    justify-content: flex-start;
    text-align: left;
  }
}
`

/* ────────────────────────────────────────────────────────────── */
/*  Component                                                     */
/* ────────────────────────────────────────────────────────────── */

export default function PostDetail({ post, adjacent }: PostDetailProps) {
    const [scrollPct, setScrollPct] = useState(0)
    const [showBack, setShowBack] = useState(false)

    useEffect(() => {
        const onScroll = () => {
            const h = document.documentElement.scrollHeight - window.innerHeight
            if (h > 0) setScrollPct((window.scrollY / h) * 100)
            // Show "Back to Blog" after scrolling past cover (60vh)
            setShowBack(window.scrollY > window.innerHeight * 0.6)
        }
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: css }} />

            {/* Reading progress */}
            <div className="bp-progress" aria-hidden="true">
                <div className="bp-progress__bar" style={{ width: `${scrollPct}%` }} />
            </div>

            {/* Back to Blog */}
            <Link
                href="/blog"
                className={`bp-back${showBack ? ' bp-back--visible' : ''}`}
            >
                <ArrowLeft /> Back to Blog
            </Link>

            {/* 1 - Cover */}
            <section className="bp-cover">
                {post.coverUrl ? (
                    <Image
                        src={post.coverUrl}
                        alt={post.title}
                        fill
                        priority
                        sizes="100vw"
                        className="bp-cover__img"
                    />
                ) : (
                    <div className="bp-cover__placeholder" />
                )}
                <div className="bp-cover__overlay" />
                <div className="bp-cover__content">
                    <div className="bp-cover__top">
                        {post.tags?.[0] && (
                            <span className="bp-cover__tag">{post.tags[0]}</span>
                        )}
                        <time className="bp-cover__date">{fmtDate(post.publishedAt)}</time>
                    </div>
                    <h1 className="bp-cover__title">{post.title}</h1>
                    <span className="bp-cover__read">
                        {post.readingTimeMinutes ?? 5} min read
                    </span>
                </div>
            </section>

            {/* 2 - Body */}
            <article className="bp-body">
                {post.contentHtml ? (
                    <TiptapRenderer html={post.contentHtml} />
                ) : (
                    post.excerpt && (
                        <p style={{ color: 'var(--muted)', fontSize: '1.1rem', lineHeight: 1.7 }}>
                            {post.excerpt}
                        </p>
                    )
                )}
            </article>

            {/* 3 - Tags row */}
            {post.tags && post.tags.length > 0 && (
                <div className="bp-tags">
                    <span className="bp-tags__label">Filed under:</span>
                    {post.tags.map((t) => (
                        <Link key={t} href={`/blog?tag=${t}`} className="bp-tags__pill">
                            {t}
                        </Link>
                    ))}
                </div>
            )}

            {/* 4 - Prev / Next */}
            <nav className="bp-nav" aria-label="Post navigation">
                {adjacent.prev ? (
                    <Link
                        href={`/blog/${adjacent.prev.slug}`}
                        className="bp-nav__link bp-nav__link--prev"
                    >
                        <ArrowLeft className="bp-nav__arrow" size={20} />
                        <div>
                            <p className="bp-nav__dir">Previous</p>
                            <p className="bp-nav__title">{adjacent.prev.title}</p>
                        </div>
                    </Link>
                ) : (
                    <div className="bp-nav__placeholder" />
                )}
                {adjacent.next ? (
                    <Link
                        href={`/blog/${adjacent.next.slug}`}
                        className="bp-nav__link bp-nav__link--next"
                    >
                        <div>
                            <p className="bp-nav__dir">Next</p>
                            <p className="bp-nav__title">{adjacent.next.title}</p>
                        </div>
                        <ArrowRight className="bp-nav__arrow" size={20} />
                    </Link>
                ) : (
                    <div className="bp-nav__placeholder" />
                )}
            </nav>
        </>
    )
}
