'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import MobilePill from './MobilePill'

/* ────────────────────────────────────────────────────────────── */
/*  Styles                                                        */
/* ────────────────────────────────────────────────────────────── */

const css = /* css */ `
/* ─── HEADER ─────────────────────────────────────────────────── */
.hdr {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: var(--z-header, 500);
  padding: 24px var(--gutter, 40px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  mix-blend-mode: difference;
  transition: opacity 0.5s;
  color: var(--color-fg, #f0f0f0);
}

/* ─── LEFT: NAME ─────────────────────────────────────────────── */
.hdr__name {
  font-family: var(--font-display, "Space Grotesk", sans-serif);
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  text-decoration: none;
  color: inherit;
}

/* ─── CENTER: CLOCK ───────────────────────────────────────────── */
.hdr__clock {
  font-family: var(--font-mono, "JetBrains Mono", monospace);
  font-size: 11px;
  color: var(--color-muted, rgba(240,240,240,0.5));
  letter-spacing: 0.04em;
  user-select: none;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}
@media (max-width: 768px) {
  .hdr__clock { display: none; }
}

/* ─── RIGHT: DESKTOP NAV ─────────────────────────────────────── */
.hdr__nav {
  display: flex;
  align-items: center;
  gap: 28px;
}
.hdr__link {
  font-family: var(--font-display, "Space Grotesk", sans-serif);
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  text-decoration: none;
  color: var(--color-muted, rgba(240,240,240,0.5));
  cursor: none;
  position: relative;
  transition: color 0.3s ease;
}
/* Sliding underline */
.hdr__link::after {
  content: '';
  position: absolute;
  bottom: -3px;
  left: 0;
  width: 0%;
  height: 1px;
  background: currentColor;
  transition: width 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}
.hdr__link:hover {
  color: var(--color-fg, #f0f0f0);
}
.hdr__link:hover::after {
  width: 100%;
}
/* Logo hover: subtle scale pulse */
.hdr__name {
  transition: opacity 0.25s ease;
}
.hdr__name:hover {
  opacity: 0.7;
}
@media (max-width: 768px) {
  .hdr__nav { display: none; }
}
`

/* ────────────────────────────────────────────────────────────── */
/*  Data                                                          */
/* ────────────────────────────────────────────────────────────── */

const LINKS = [
  { label: 'Work',    href: '/work' },
  { label: 'About',   href: '/about' },
  { label: 'Contact', href: '/contact' },
]

/* ────────────────────────────────────────────────────────────── */
/*  Component                                                     */
/* ────────────────────────────────────────────────────────────── */

export default function Nav() {
  const [time, setTime] = useState<string | null>(null)

  // Live clock
  useEffect(() => {
    const fmt = () => {
      const d = new Date()
      return (
        d.getHours().toString().padStart(2, '0') +
        ':' +
        d.getMinutes().toString().padStart(2, '0')
      )
    }
    setTime(fmt())
    const id = setInterval(() => setTime(fmt()), 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />

      {/* ── Header bar ──────────────────────────────────────── */}
      <header className="hdr" role="banner">
        {/* LEFT */}
        <Link href="/" className="hdr__name" aria-label="Anurag, Home">
          ANURAG
        </Link>

        {/* CENTER - clock (desktop only, client-only) */}
        {time && (
          <span className="hdr__clock" aria-hidden="true">
            {time}
          </span>
        )}

        {/* RIGHT - desktop links */}
        <nav className="hdr__nav" aria-label="Main navigation">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="hdr__link">
              {l.label}
            </Link>
          ))}
        </nav>
      </header>

      {/* ── Mobile liquid-glass pill (≤768px) ───────────────── */}
      <MobilePill />
    </>
  )
}
