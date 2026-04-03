'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useScrambleText } from '@/hooks/useScrambleText'
import {
  X,
  Twitter,
  Instagram,
  Linkedin,
  Github,
  Dribbble,
} from 'lucide-react'

/* ────────────────────────────────────────────────────────────── */
/*  Data                                                          */
/* ────────────────────────────────────────────────────────────── */

const LINKS = [
  { label: 'WORK', href: '/work' },
  { label: 'ABOUT', href: '/about' },
  { label: 'BLOG', href: '/blog' },
  { label: 'CONTACT', href: '/contact' },
]

const SOCIALS = [
  { icon: Twitter, href: 'https://x.com', label: 'Twitter' },
  { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
  { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
  { icon: Github, href: 'https://github.com', label: 'GitHub' },
  { icon: Dribbble, href: 'https://dribbble.com', label: 'Dribbble' },
]

/* ────────────────────────────────────────────────────────────── */
/*  Styles                                                        */
/* ────────────────────────────────────────────────────────────── */

const css = /* css */ `
.menu-page {
  position: relative;
  min-height: 100dvh;
  background: var(--bg);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* ─── ORBS ───────────────────────────────────────────────────── */
.menu-page__orbs {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}
.menu-page__orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(120px);
}
.menu-page__orb--lime {
  width: 700px;
  height: 700px;
  background: rgba(200, 255, 0, 0.08);
  top: -10%;
  right: -5%;
}
.menu-page__orb--purple {
  width: 600px;
  height: 600px;
  background: rgba(123, 47, 190, 0.08);
  top: 30%;
  left: -8%;
}
.menu-page__orb--cyan {
  width: 500px;
  height: 500px;
  background: rgba(0, 212, 255, 0.06);
  bottom: -5%;
  right: 5%;
}

/* ─── TOP BAR ────────────────────────────────────────────────── */
.menu-top {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--nav-h, 72px);
  padding-inline: var(--page-px);
}

/* Logo (same style as Nav) */
.menu-top__logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: var(--text);
}
.menu-top__diamond {
  width: 8px;
  height: 8px;
  background: var(--accent);
  transform: rotate(45deg);
  transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
  flex-shrink: 0;
}
.menu-top__logo:hover .menu-top__diamond {
  transform: rotate(405deg);
}
.menu-top__wordmark {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 18px;
  letter-spacing: 0.08em;
  line-height: 1;
}

/* Clock */
.menu-top__clock {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--muted);
  letter-spacing: 0.04em;
  user-select: none;
}
.menu-top__clock-colon {
  animation: menu-blink 1s step-end infinite;
}
@keyframes menu-blink {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0; }
}
@media (max-width: 768px) {
  .menu-top__clock { display: none; }
}

/* Close button */
.menu-top__close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: none;
  border: 1px solid var(--border);
  border-radius: 50%;
  color: var(--text);
  cursor: pointer;
  transition: border-color 0.3s ease, transform 0.3s ease;
}
.menu-top__close:hover {
  border-color: var(--muted);
  transform: scale(1.1);
}
.menu-top__close svg {
  width: 18px;
  height: 18px;
}

/* ─── MAIN NAV LINKS ─────────────────────────────────────────── */
.menu-nav {
  position: relative;
  z-index: 2;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-inline: var(--page-px);
  gap: 0;
}
.menu-nav__item {
  display: flex;
  align-items: baseline;
  gap: clamp(12px, 2vw, 24px);
  padding: clamp(12px, 2vw, 20px) 0;
  border-bottom: 1px solid var(--border);
  text-decoration: none;
  color: var(--text);
  position: relative;
  overflow: hidden;
  transition: color 0.3s ease;
}
.menu-nav__item:first-child {
  border-top: 1px solid var(--border);
}

/* Index number */
.menu-nav__idx {
  font-family: var(--font-mono);
  font-size: clamp(11px, 1.2vw, 14px);
  color: var(--muted);
  min-width: 2.5ch;
  transition: color 0.3s ease;
}

/* Label */
.menu-nav__label {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: clamp(3rem, 8vw, 7rem);
  line-height: 1.1;
  letter-spacing: -0.02em;
  position: relative;
  display: inline-block;
}
.menu-nav__label::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0.05em;
  width: 0;
  height: 3px;
  background: var(--accent);
  transition: width 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}
.menu-nav__item:hover .menu-nav__label::after {
  width: 100%;
}

/* Arrow */
.menu-nav__arrow {
  font-family: var(--font-display);
  font-size: clamp(1.5rem, 4vw, 3rem);
  color: var(--accent);
  opacity: 0;
  transform: translateX(-12px);
  transition: opacity 0.3s ease, transform 0.3s ease;
  margin-left: auto;
  align-self: center;
}
.menu-nav__item:hover .menu-nav__arrow {
  opacity: 1;
  transform: translateX(0);
}
.menu-nav__item:hover .menu-nav__idx {
  color: var(--accent);
}

/* ─── BOTTOM ─────────────────────────────────────────────────── */
.menu-bottom {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px var(--page-px) clamp(24px, 4vw, 40px);
}

/* Social icons row */
.menu-bottom__socials {
  display: flex;
  align-items: center;
  gap: 16px;
}
.menu-bottom__social {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  color: var(--muted);
  text-decoration: none;
  transition: color 0.3s ease, transform 0.3s ease;
}
.menu-bottom__social:hover {
  color: var(--text);
  transform: scale(1.2);
}
.menu-bottom__social svg {
  width: 18px;
  height: 18px;
}

/* Location + time */
.menu-bottom__meta {
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--muted);
  text-align: right;
  letter-spacing: 0.02em;
}

@media (max-width: 480px) {
  .menu-bottom {
    flex-direction: column-reverse;
    gap: 20px;
    align-items: flex-start;
  }
  .menu-bottom__meta {
    text-align: left;
  }
}
`

/* ────────────────────────────────────────────────────────────── */
/*  Scramble link                                                 */
/* ────────────────────────────────────────────────────────────── */

function ScrambleLink({ href, label, idx }: { href: string; label: string; idx: number }) {
  const [hovered, setHovered] = useState(false)
  const display = useScrambleText(label, hovered)

  return (
    <Link
      href={href}
      className="menu-nav__item"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span className="menu-nav__idx">
        {String(idx + 1).padStart(2, '0')}
      </span>
      <span className="menu-nav__label">{display}</span>
      <span className="menu-nav__arrow" aria-hidden="true">
        →
      </span>
    </Link>
  )
}

/* ────────────────────────────────────────────────────────────── */
/*  Component                                                     */
/* ────────────────────────────────────────────────────────────── */

export default function MenuPage() {
  const router = useRouter()
  const [time, setTime] = useState<string | null>(null)

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

  const [hours, minutes] = (time ?? '00:00').split(':')

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <div className="menu-page">
        {/* ── Atmospheric orbs ──────────────────────────────── */}
        <div className="menu-page__orbs" aria-hidden="true">
          <div className="menu-page__orb menu-page__orb--lime" />
          <div className="menu-page__orb menu-page__orb--purple" />
          <div className="menu-page__orb menu-page__orb--cyan" />
        </div>

        {/* ── Top bar ──────────────────────────────────────── */}
        <header className="menu-top">
          <Link href="/" className="menu-top__logo" aria-label="Home">
            <span className="menu-top__diamond" aria-hidden="true" />
            <span className="menu-top__wordmark">ANURAG</span>
          </Link>

          {time && (
            <span className="menu-top__clock" aria-hidden="true">
              {hours}
              <span className="menu-top__clock-colon">:</span>
              {minutes}
            </span>
          )}

          <button
            className="menu-top__close"
            onClick={() => router.back()}
            aria-label="Close menu"
          >
            <X />
          </button>
        </header>

        {/* ── Navigation links ─────────────────────────────── */}
        <nav className="menu-nav" aria-label="Main menu">
          {LINKS.map((link, i) => (
            <ScrambleLink
              key={link.href}
              href={link.href}
              label={link.label}
              idx={i}
            />
          ))}
        </nav>

        {/* ── Bottom ───────────────────────────────────────── */}
        <div className="menu-bottom">
          <div className="menu-bottom__socials">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="menu-bottom__social"
                aria-label={s.label}
              >
                <s.icon />
              </a>
            ))}
          </div>
          <div className="menu-bottom__meta">
            Mumbai, India · UTC+5:30
          </div>
        </div>
      </div>
    </>
  )
}
