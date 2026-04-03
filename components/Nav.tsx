'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

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
/* Mobile links: staggered slide-in */
.mob-menu.on .mob-menu__link {
  animation: mob-link-in 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
}
.mob-menu.on .mob-menu__link:nth-child(1) { animation-delay: 0.08s; }
.mob-menu.on .mob-menu__link:nth-child(2) { animation-delay: 0.16s; }
.mob-menu.on .mob-menu__link:nth-child(3) { animation-delay: 0.24s; }
@keyframes mob-link-in {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}
/* Mobile link: accent underline on hover */
.mob-menu__link {
  position: relative;
}
.mob-menu__link::after {
  content: '';
  position: absolute;
  bottom: -4px; left: 0;
  width: 0%; height: 2px;
  background: var(--color-accent, #00FF94);
  transition: width 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}
.mob-menu__link:hover { opacity: 1; }
.mob-menu__link:hover::after { width: 100%; }
@media (max-width: 768px) {
  .hdr__nav { display: none; }
}

/* ─── RIGHT: MOBILE HAMBURGER ────────────────────────────────── */
.hdr__burger {
  display: none;
  align-items: center;
  gap: 10px;
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 0;
}
@media (max-width: 768px) {
  .hdr__burger { display: flex; }
}
.hdr__burger-text {
  font-family: var(--font-mono, "JetBrains Mono", monospace);
  font-size: 12px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  min-width: 40px;
  text-align: right;
}
.hdr__burger-icon {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 28px;
  height: 20px;
}
.hdr__burger-icon span {
  display: block;
  height: 2px;
  background: currentColor;
  border-radius: 1px;
  transition: transform 0.3s ease, opacity 0.3s ease;
  transform-origin: center;
}
.hdr__burger--open .hdr__burger-icon span:nth-child(1) {
  transform: translateY(9px) rotate(45deg);
}
.hdr__burger--open .hdr__burger-icon span:nth-child(2) {
  opacity: 0;
}
.hdr__burger--open .hdr__burger-icon span:nth-child(3) {
  transform: translateY(-9px) rotate(-45deg);
}

/* ─── MOBILE MENU OVERLAY ────────────────────────────────────── */
.mob-menu {
  position: fixed;
  inset: 0;
  z-index: var(--z-mobile-menu, 490);
  background: var(--color-bg, #050505);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 40px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}
.mob-menu.on {
  opacity: 1;
  pointer-events: auto;
}
.mob-menu__link {
  font-family: var(--font-display, "Space Grotesk", sans-serif);
  font-size: clamp(2rem, 8vw, 3.5rem);
  font-weight: 700;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  text-decoration: none;
  color: var(--color-fg, #f0f0f0);
  transition: opacity 0.2s ease;
}
.mob-menu__link:hover {
  opacity: 0.6;
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
  const [open, setOpen] = useState(false)

  // Live clock - only rendered client-side to avoid hydration mismatch
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

  // Lock body scroll while mobile menu is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const closeMenu = () => setOpen(false)

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

        {/* RIGHT - mobile hamburger */}
        <button
          className={`hdr__burger${open ? ' hdr__burger--open' : ''}`}
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          <span className="hdr__burger-text">{open ? 'CLOSE' : 'MENU'}</span>
          <span className="hdr__burger-icon" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
        </button>
      </header>

      {/* ── Mobile menu overlay ──────────────────────────────── */}
      <div
        className={`mob-menu${open ? ' on' : ''}`}
        aria-hidden={!open}
        role="dialog"
        aria-label="Mobile navigation"
      >
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="mob-menu__link"
            onClick={closeMenu}
          >
            {l.label}
          </Link>
        ))}
      </div>
    </>
  )
}
