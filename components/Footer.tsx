'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import Link from 'next/link'

/* ────────────────────────────────────────────────────────────── */
/*  Data                                                          */
/* ────────────────────────────────────────────────────────────── */

const EMAIL = 'hello@anurag.studio'

const SOCIALS = [
  { label: 'LinkedIn',  href: 'https://www.linkedin.com/in/dexterityofrag' },
  { label: 'Instagram', href: 'https://instagram.com/lightlyricist' },
  { label: 'GitHub',    href: 'https://github.com/Dexterityofrag' },
  { label: 'Behance',   href: 'https://www.behance.net/anuragadhikari5' },
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

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

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

/* ─── GHOST WATERMARK (neon, flickering) ─────────────────────── */
.ft-ghost {
  position: absolute;
  bottom: -0.08em;
  right: -0.03em;
  font-family: var(--font-display, 'Space Grotesk', sans-serif);
  font-size: clamp(10rem, 25vw, 22rem);
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 1;
  pointer-events: none;
  user-select: none;
  white-space: nowrap;
  z-index: 0;
  display: flex;
}
.ft-ghost-letter {
  display: inline-block;
  color: transparent;
  -webkit-text-stroke: 1.4px rgba(0, 255, 148, 0.315);
  text-shadow:
    0 0 4px rgba(0, 255, 148, 0.26),
    0 0 14px rgba(0, 255, 148, 0.165),
    0 0 34px rgba(0, 255, 148, 0.105);
  will-change: opacity, text-shadow, -webkit-text-stroke-color;
  transform: translateZ(0);
  /* steps(1) => every transition between keyframes snaps, no interpolation */
  animation-timing-function: steps(1, end);
}
/* Snap-only flicker: bracket each "dead" dip with "on" keyframes at +/-0.01% */
@keyframes ft-ghost-flicker-a {
  0%,   39.79%, 40.01%, 40.39%, 40.61%, 82.29%, 82.71%, 100% {
    opacity: 1;
    -webkit-text-stroke-color: rgba(0,255,148,0.315);
    text-shadow: 0 0 4px rgba(0,255,148,0.26), 0 0 14px rgba(0,255,148,0.165), 0 0 34px rgba(0,255,148,0.105);
  }
  39.8%, 40% {
    opacity: 0.18;
    -webkit-text-stroke-color: rgba(0,255,148,0.06);
    text-shadow: none;
  }
  40.4%, 40.6% {
    opacity: 0.25;
    -webkit-text-stroke-color: rgba(0,255,148,0.06);
    text-shadow: none;
  }
  82.3%, 82.7% {
    opacity: 0.12;
    -webkit-text-stroke-color: rgba(0,255,148,0.045);
    text-shadow: none;
  }
}
@keyframes ft-ghost-flicker-b {
  0%,   18.29%, 18.71%, 19.09%, 19.51%, 63.29%, 63.91%, 100% {
    opacity: 1;
    -webkit-text-stroke-color: rgba(0,255,148,0.315);
    text-shadow: 0 0 4px rgba(0,255,148,0.26), 0 0 14px rgba(0,255,148,0.165), 0 0 34px rgba(0,255,148,0.105);
  }
  18.3%, 18.7% {
    opacity: 0.2;
    -webkit-text-stroke-color: rgba(0,255,148,0.06);
    text-shadow: none;
  }
  19.1%, 19.5% {
    opacity: 0.3;
    text-shadow: none;
  }
  63.3%, 63.9% {
    opacity: 0.1;
    -webkit-text-stroke-color: rgba(0,255,148,0.04);
    text-shadow: none;
  }
}
@keyframes ft-ghost-flicker-c {
  0%,   8.19%, 8.51%, 49.39%, 49.71%, 49.99%, 50.31%, 90.99%, 91.41%, 100% {
    opacity: 1;
    -webkit-text-stroke-color: rgba(0,255,148,0.315);
    text-shadow: 0 0 4px rgba(0,255,148,0.26), 0 0 14px rgba(0,255,148,0.165), 0 0 34px rgba(0,255,148,0.105);
  }
  8.2%, 8.5% {
    opacity: 0.15;
    -webkit-text-stroke-color: rgba(0,255,148,0.05);
    text-shadow: none;
  }
  49.4%, 49.7% {
    opacity: 0.22;
    text-shadow: none;
  }
  50%, 50.3% {
    opacity: 0.15;
    text-shadow: none;
  }
  91%, 91.4% {
    opacity: 0.3;
    text-shadow: none;
  }
}
/* A–N–U–R–A–G : each letter gets its own rhythm via duration + negative delay.
   steps(1, end) keeps every transition snap-instant (no fade). */
.ft-ghost-letter:nth-child(1) { animation: ft-ghost-flicker-a 7.1s steps(1, end) infinite;  animation-delay: 0s;    }
.ft-ghost-letter:nth-child(2) { animation: ft-ghost-flicker-b 5.3s steps(1, end) infinite;  animation-delay: -2.1s; }
.ft-ghost-letter:nth-child(3) { animation: ft-ghost-flicker-c 6.7s steps(1, end) infinite;  animation-delay: -0.8s; }
.ft-ghost-letter:nth-child(4) { animation: ft-ghost-flicker-b 5.9s steps(1, end) infinite;  animation-delay: -3.4s; }
.ft-ghost-letter:nth-child(5) { animation: ft-ghost-flicker-a 8.3s steps(1, end) infinite;  animation-delay: -1.2s; }
.ft-ghost-letter:nth-child(6) { animation: ft-ghost-flicker-c 4.9s steps(1, end) infinite;  animation-delay: -4.5s; }

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

/* Flip chars */
.ft-flip-char {
  display: inline-block;
  transition: color 0.08s ease;
}
.ft-flip-char--flipping {
  color: rgba(0, 255, 148, 0.6);
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
  .ft-ghost-letter { animation: none; }
}
`

/* ────────────────────────────────────────────────────────────── */
/*  A-Z flip helper                                               */
/* ────────────────────────────────────────────────────────────── */

function flipCharsInElement(
  el: HTMLElement,
  text: string,
  totalDuration = 1200,
  staggerPerChar = 35,
) {
  const chars = text.split('')
  // Build char spans
  el.innerHTML = ''
  const charEls: HTMLSpanElement[] = []
  chars.forEach((ch) => {
    const span = document.createElement('span')
    span.className = 'ft-flip-char ft-flip-char--flipping'
    span.style.display = 'inline-block'
    if (ch === ' ' || ch === '\u00A0') {
      span.innerHTML = '&nbsp;'
      span.classList.remove('ft-flip-char--flipping')
      el.appendChild(span)
      charEls.push(span)
      return
    }
    span.textContent = ALPHABET[Math.floor(Math.random() * 26)]
    el.appendChild(span)
    charEls.push(span)
  })

  // Animate
  chars.forEach((finalChar, i) => {
    if (finalChar === ' ' || finalChar === '\u00A0') return
    // Special chars (', ., ↗) should just appear
    if (!ALPHABET.includes(finalChar.toUpperCase())) {
      charEls[i].textContent = finalChar
      charEls[i].classList.remove('ft-flip-char--flipping')
      return
    }
    const charDuration = totalDuration - i * staggerPerChar
    const flipInterval = 45
    const flipCount = Math.max(Math.floor(charDuration / flipInterval), 3)
    let tick = 0

    const interval = setInterval(() => {
      tick++
      if (tick >= flipCount) {
        clearInterval(interval)
        charEls[i].textContent = finalChar
        charEls[i].classList.remove('ft-flip-char--flipping')
        return
      }
      charEls[i].textContent = ALPHABET[Math.floor(Math.random() * 26)]
    }, flipInterval)
  })
}

/* ────────────────────────────────────────────────────────────── */
/*  Component                                                     */
/* ────────────────────────────────────────────────────────────── */

export default function Footer() {
  const [copied, setCopied] = useState(false)
  const statementRef  = useRef<HTMLDivElement>(null)
  const dividerRef    = useRef<HTMLDivElement>(null)
  const availRef      = useRef<HTMLDivElement>(null)
  const wordRefs      = useRef<(HTMLElement | null)[]>([])
  const hasFlipped    = useRef(false)

  const triggerFlip = useCallback(() => {
    if (hasFlipped.current) return
    hasFlipped.current = true

    // Only flip the "BUILD" word (index 1)
    const buildIndex = 1
    const el = wordRefs.current[buildIndex]
    if (!el) return

    const w = STATEMENT_WORDS[buildIndex]
    const displayText = w.link ? w.text + '\u00A0↗' : w.text

    setTimeout(() => {
      flipCharsInElement(el, displayText, 1200, 35)
    }, buildIndex * 180 + 400)
  }, [])

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
          triggerFlip()
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
  }, [triggerFlip])

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
        <div className="ft-ghost" aria-hidden="true">
          {'ANURAG'.split('').map((ch, i) => (
            <span key={i} className="ft-ghost-letter">{ch}</span>
          ))}
        </div>

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
