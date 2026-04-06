'use client'

import { useRef, useEffect, useState } from 'react'
import Link from 'next/link'

/* ────────────────────────────────────────────────────────────── */
/*  Data                                                          */
/* ────────────────────────────────────────────────────────────── */

const EMAIL = 'hello@anurag.studio'

const SOCIALS = [
  { label: 'LinkedIn',  href: 'https://linkedin.com/in/anuragadhikari' },
  { label: 'GitHub',    href: 'https://github.com/anuragadhikari' },
  { label: 'Dribbble',  href: 'https://dribbble.com/anuragadhikari' },
  { label: 'WhatsApp',  href: 'https://wa.me/917980105391' },
]

const MARQUEE_WORDS = [
  'DESIGN', 'DEVELOP', 'DELIVER', 'BRAND IDENTITY',
  'UI / UX', 'CREATIVE CODE', 'STRATEGY', 'OPEN FOR WORK',
  'PRODUCT DESIGN', 'MOTION', 'SYSTEMS THINKING', 'BUILD',
]

const STATEMENT_WORDS = [
  { text: "LET'S", outline: false, accent: false },
  { text: 'BUILD',      outline: true,  accent: false },
  { text: 'SOMETHING',  outline: false, accent: false },
  { text: 'GREAT.',     outline: false, accent: true, link: '/contact' },
]

/* ────────────────────────────────────────────────────────────── */
/*  Styles                                                        */
/* ────────────────────────────────────────────────────────────── */

const css = /* css */ `
/* ─── ROOT ───────────────────────────────────────────────────── */
.site-footer {
  position: relative;
  overflow: hidden;
  border-top: 1px solid rgba(255,255,255,0.06);
}

/* ─── GHOST WATERMARK ────────────────────────────────────────── */
.ft-ghost {
  position: absolute;
  bottom: -0.08em;
  right: -0.03em;
  font-family: var(--font-display, 'Space Grotesk', sans-serif);
  font-size: clamp(10rem, 25vw, 22rem);
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 1;
  color: transparent;
  -webkit-text-stroke: 1px rgba(255,255,255,0.04);
  pointer-events: none;
  user-select: none;
  white-space: nowrap;
  z-index: 0;
}

/* ─── TOP SECTION ─────────────────────────────────────────────── */
.ft-top {
  position: relative;
  z-index: 1;
  padding: clamp(80px, 12vw, 140px) clamp(24px, 6vw, 80px) 0;
  max-width: 1600px;
  margin: 0 auto;
}

/* STATEMENT */
.ft-statement {
  display: flex;
  flex-direction: column;
}
.ft-statement-word {
  display: block;
  font-family: var(--font-display, 'Space Grotesk', sans-serif);
  font-size: clamp(4rem, 10.5vw, 10.5rem);
  font-weight: 700;
  letter-spacing: -0.035em;
  line-height: 1;
  color: var(--color-fg, #FAFAFA);
  text-decoration: none;
  cursor: none;
  transform: translateY(105%);
  opacity: 0;
  transition:
    transform 0.9s cubic-bezier(0.22, 1, 0.36, 1),
    opacity   0.9s ease,
    color     0.3s ease,
    -webkit-text-stroke 0.3s ease;
  will-change: transform, opacity;
}
.ft-statement-word--outline {
  color: transparent;
  -webkit-text-stroke: 1.5px rgba(255,255,255,0.38);
}
.ft-statement-word--outline.ft-statement-word--visible:hover {
  color: transparent;
  -webkit-text-stroke-color: rgba(255,255,255,0.65);
}
.ft-statement-word--accent {
  color: var(--accent, #00FF94);
  position: relative;
}
.ft-statement-word--accent::after {
  content: '';
  position: absolute;
  bottom: 0.05em;
  left: 0;
  width: 0;
  height: 3px;
  background: var(--accent, #00FF94);
  transition: width 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.2s;
}
.ft-statement-word--accent.ft-statement-word--visible::after {
  width: 100%;
}
.ft-statement-word--accent:hover {
  opacity: 0.8;
}
.ft-statement-word--visible {
  transform: translateY(0);
  opacity: 1;
}

/* Overflow clip per word */
.ft-statement-clip {
  overflow: hidden;
  display: block;
}

/* ─── AVAILABILITY PILL ─────────────────────────────────────── */
.ft-avail {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: clamp(32px, 4vw, 48px);
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.4);
  border: 1px solid rgba(255,255,255,0.08);
  padding: 7px 16px;
  border-radius: 999px;
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 0.7s ease 0.8s, transform 0.7s cubic-bezier(0.22,1,0.36,1) 0.8s;
}
.ft-avail.ft-avail--visible {
  opacity: 1;
  transform: translateY(0);
}
.ft-avail-dot {
  width: 7px; height: 7px;
  background: var(--accent, #00FF94);
  border-radius: 50%;
  animation: ft-pulse 2.2s ease infinite;
  flex-shrink: 0;
}
@keyframes ft-pulse {
  0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(0,255,148,0.4); }
  50% { opacity: 0.7; box-shadow: 0 0 0 5px rgba(0,255,148,0); }
}

/* ─── DIVIDER ─────────────────────────────────────────────────── */
.ft-divider {
  position: relative;
  z-index: 1;
  width: 0;
  height: 1px;
  background: linear-gradient(90deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.04) 100%);
  margin: clamp(48px, 7vw, 80px) clamp(24px, 6vw, 80px) 0;
  transition: width 1.4s cubic-bezier(0.22, 1, 0.36, 1) 0.3s;
}
.ft-divider--visible { width: calc(100% - clamp(48px, 12vw, 160px)); }

/* ─── MARQUEE ─────────────────────────────────────────────────── */
.ft-marquee-wrap {
  position: relative;
  z-index: 1;
  overflow: hidden;
  width: 100%;
  padding: clamp(14px, 2vw, 22px) 0;
  border-top: 1px solid rgba(255,255,255,0.04);
  border-bottom: 1px solid rgba(255,255,255,0.04);
  margin: clamp(28px, 4.5vw, 56px) 0;
}
.ft-marquee-track {
  display: flex;
  width: max-content;
  animation: ft-marquee 30s linear infinite;
}
.ft-marquee-wrap:hover .ft-marquee-track {
  animation-play-state: paused;
}
@keyframes ft-marquee {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
.ft-marquee-chunk {
  display: flex;
  align-items: center;
  gap: 0;
}
.ft-marquee-word {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: clamp(10px, 1.1vw, 13px);
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.2);
  white-space: nowrap;
  padding: 0 clamp(16px, 2.5vw, 32px);
  transition: color 0.3s ease;
}
.ft-marquee-sep {
  color: var(--accent, #00FF94);
  font-size: 6px;
  line-height: 1;
  flex-shrink: 0;
  opacity: 0.7;
}

/* ─── BOTTOM ROW ─────────────────────────────────────────────── */
.ft-bottom-row {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 0 clamp(24px, 6vw, 80px) clamp(32px, 6vw, 72px);
  max-width: 1600px;
  margin: 0 auto;
  gap: 48px;
}

/* Email */
.ft-email-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.ft-email-label {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 10px;
  letter-spacing: 0.14em;
  color: rgba(255,255,255,0.2);
  text-transform: uppercase;
}
.ft-email-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.ft-email-link {
  font-family: var(--font-display, 'Space Grotesk', sans-serif);
  font-size: clamp(0.95rem, 1.8vw, 1.4rem);
  font-weight: 500;
  letter-spacing: -0.01em;
  color: var(--color-fg, #FAFAFA);
  text-decoration: none;
  transition: color 0.25s ease;
}
.ft-email-link:hover { color: var(--accent, #00FF94); }
.ft-copy-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px; height: 30px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 50%;
  cursor: none;
  color: rgba(255,255,255,0.35);
  font-size: 13px;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  transition: all 0.25s ease;
  flex-shrink: 0;
}
.ft-copy-btn:hover {
  background: var(--accent, #00FF94);
  border-color: var(--accent, #00FF94);
  color: #000;
  transform: scale(1.1);
}
.ft-copy-btn--done {
  background: var(--accent, #00FF94) !important;
  border-color: var(--accent, #00FF94) !important;
  color: #000 !important;
}

/* Socials */
.ft-socials-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-end;
}
.ft-socials-label {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 10px;
  letter-spacing: 0.14em;
  color: rgba(255,255,255,0.2);
  text-transform: uppercase;
}
.ft-socials-row {
  display: flex;
  gap: 0;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 4px;
  overflow: hidden;
}
.ft-social-btn {
  font-family: var(--font-display, 'Space Grotesk', sans-serif);
  font-size: clamp(11px, 1.1vw, 13px);
  font-weight: 600;
  letter-spacing: 0.04em;
  color: rgba(255,255,255,0.35);
  text-decoration: none;
  padding: clamp(8px, 1.2vw, 10px) clamp(12px, 2vw, 20px);
  border-right: 1px solid rgba(255,255,255,0.08);
  cursor: none;
  position: relative;
  overflow: hidden;
  transition: color 0.25s ease;
}
.ft-social-btn:last-child { border-right: none; }
.ft-social-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--accent, #00FF94);
  transform: translateY(100%);
  transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}
.ft-social-btn:hover { color: #000; }
.ft-social-btn:hover::before { transform: translateY(0); }
.ft-social-btn span { position: relative; z-index: 1; }

/* ─── BOTTOM BAR ─────────────────────────────────────────────── */
.ft-bar {
  position: relative;
  z-index: 1;
  border-top: 1px solid rgba(255,255,255,0.05);
  padding: 18px clamp(24px, 6vw, 80px);
  max-width: 1600px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 11px;
  color: rgba(255,255,255,0.16);
  letter-spacing: 0.05em;
}
.ft-bar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}
.ft-bar-accent {
  color: var(--accent, #00FF94);
  opacity: 0.6;
}

/* ─── TOAST ──────────────────────────────────────────────────── */
.ft-toast {
  position: fixed;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%) translateY(14px);
  background: rgba(0, 255, 148, 0.08);
  color: var(--accent, #00FF94);
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 11px;
  letter-spacing: 0.12em;
  padding: 9px 22px;
  border-radius: 999px;
  border: 1px solid rgba(0,255,148,0.2);
  pointer-events: none;
  opacity: 0;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition: opacity 0.3s ease, transform 0.3s ease;
  z-index: 9000;
  white-space: nowrap;
  text-transform: uppercase;
}
.ft-toast--visible {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

/* ─── MOBILE ─────────────────────────────────────────────────── */
@media (max-width: 768px) {
  .ft-bottom-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 28px;
  }
  .ft-socials-block { align-items: flex-start; }
  .ft-socials-row { flex-wrap: wrap; }
  .ft-bar {
    flex-direction: column;
    gap: 8px;
    text-align: center;
  }
}
@media (prefers-reduced-motion: reduce) {
  .ft-statement-word { transition: none; }
  .ft-marquee-track { animation: none; }
  .ft-avail-dot { animation: none; }
}
`

/* ────────────────────────────────────────────────────────────── */
/*  Component                                                     */
/* ────────────────────────────────────────────────────────────── */

export default function Footer() {
  const [copied, setCopied] = useState(false)
  const statementRef  = useRef<HTMLDivElement>(null)
  const dividerRef    = useRef<HTMLDivElement>(null)
  const availRef      = useRef<HTMLDivElement>(null)
  const wordRefs      = useRef<(HTMLElement | null)[]>([])

  /* Intersection-triggered entrance */
  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return
        const el = entry.target

        if (el === statementRef.current) {
          wordRefs.current.forEach((w, i) => {
            if (!w) return
            w.style.transitionDelay = `${i * 0.09}s`
            w.classList.add('ft-statement-word--visible')
          })
          availRef.current?.classList.add('ft-avail--visible')
        }
        if (el === dividerRef.current) {
          dividerRef.current.classList.add('ft-divider--visible')
        }
        io.unobserve(el)
      })
    }, { threshold: 0.2, rootMargin: '0px 0px -60px 0px' })

    if (statementRef.current) io.observe(statementRef.current)
    if (dividerRef.current)   io.observe(dividerRef.current)

    return () => io.disconnect()
  }, [])

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = EMAIL
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2200)
  }

  /* Duplicate marquee for seamless loop */
  const marqueeItems = [...MARQUEE_WORDS, ...MARQUEE_WORDS]

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <footer className="site-footer" role="contentinfo">

        {/* Ghost watermark */}
        <div className="ft-ghost" aria-hidden="true">ANURAG</div>

        {/* ── Statement CTA ────────────────────────────────────── */}
        <div className="ft-top">
          <div className="ft-statement" ref={statementRef}>
            {STATEMENT_WORDS.map((w, i) => (
              <span key={w.text} className="ft-statement-clip">
                {w.link ? (
                  <Link
                    href={w.link}
                    ref={el => { wordRefs.current[i] = el }}
                    className={`ft-statement-word${w.accent ? ' ft-statement-word--accent' : ''}`}
                  >
                    {w.text}&nbsp;↗
                  </Link>
                ) : (
                  <span
                    ref={el => { wordRefs.current[i] = el }}
                    className={`ft-statement-word${w.outline ? ' ft-statement-word--outline' : ''}`}
                  >
                    {w.text}
                  </span>
                )}
              </span>
            ))}
          </div>

          {/* Availability pill */}
          <div className="ft-avail" ref={availRef}>
            <span className="ft-avail-dot" aria-hidden="true" />
            Available for new projects
          </div>
        </div>

        {/* ── Animated divider ─────────────────────────────────── */}
        <div className="ft-divider" ref={dividerRef} aria-hidden="true" />

        {/* ── Marquee ──────────────────────────────────────────── */}
        <div className="ft-marquee-wrap" aria-hidden="true">
          <div className="ft-marquee-track">
            {marqueeItems.map((word, i) => (
              <span key={i} className="ft-marquee-chunk">
                <span className="ft-marquee-word">{word}</span>
                <span className="ft-marquee-sep">◆</span>
              </span>
            ))}
          </div>
        </div>

        {/* ── Bottom row ───────────────────────────────────────── */}
        <div className="ft-bottom-row">
          {/* Email */}
          <div className="ft-email-block">
            <span className="ft-email-label">Say hello</span>
            <div className="ft-email-row">
              <a href={`mailto:${EMAIL}`} className="ft-email-link">
                {EMAIL}
              </a>
              <button
                className={`ft-copy-btn${copied ? ' ft-copy-btn--done' : ''}`}
                onClick={copyEmail}
                aria-label="Copy email address"
              >
                {copied ? '✓' : '⎘'}
              </button>
            </div>
          </div>

          {/* Socials */}
          <div className="ft-socials-block">
            <span className="ft-socials-label">Find me on</span>
            <div className="ft-socials-row">
              {SOCIALS.map(s => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ft-social-btn"
                  aria-label={s.label}
                >
                  <span>{s.label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* ── Bottom bar ───────────────────────────────────────── */}
        <div className="ft-bar">
          <span>© 2026 Anurag Adhikari. All rights reserved.</span>
          <div className="ft-bar-right">
            <span>DESIGNED &amp; BUILT BY ANURAG</span>
            <span className="ft-bar-accent">✦</span>
          </div>
        </div>
      </footer>

      {/* Copied toast */}
      <div
        className={`ft-toast${copied ? ' ft-toast--visible' : ''}`}
        aria-live="polite"
      >
        EMAIL COPIED ✓
      </div>
    </>
  )
}
