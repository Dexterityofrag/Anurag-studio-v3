'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useScrambleText } from '@/hooks/useScrambleText'
import {
  X,
  Instagram,
  Linkedin,
  Github,
} from 'lucide-react'

const BehanceIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M7.799 5.698c.589 0 1.12.051 1.606.156.484.103.9.27 1.25.507.347.236.617.546.81.928.19.38.285.853.285 1.411 0 .602-.138 1.104-.41 1.507-.274.4-.674.728-1.207.984.72.211 1.26.576 1.605 1.1.348.524.52 1.158.52 1.897 0 .6-.113 1.12-.343 1.552-.23.436-.544.794-.941 1.07a4.03 4.03 0 01-1.362.616 6.067 6.067 0 01-1.57.198H2V5.698h5.799zm-.352 4.43c.48 0 .878-.114 1.192-.345.312-.23.463-.609.463-1.133 0-.291-.053-.528-.156-.717a1.172 1.172 0 00-.427-.45 1.733 1.733 0 00-.614-.231 3.818 3.818 0 00-.72-.066H4.65v2.942h2.797zm.155 4.646c.267 0 .521-.026.764-.078.24-.052.45-.143.634-.273.182-.13.329-.305.44-.528.108-.22.164-.501.164-.842 0-.663-.188-1.137-.562-1.42-.374-.287-.87-.43-1.487-.43H4.65v3.571h2.952zm8.562-.387c.36.35.88.525 1.555.525.484 0 .9-.121 1.25-.367.347-.243.56-.5.638-.771h2.272c-.363 1.127-.92 1.934-1.67 2.42-.75.485-1.657.73-2.725.73-.741 0-1.41-.12-2.005-.358a4.27 4.27 0 01-1.512-1.023 4.584 4.584 0 01-.957-1.585 5.813 5.813 0 01-.335-2.01c0-.698.115-1.35.345-1.951a4.66 4.66 0 012.5-2.637 4.89 4.89 0 011.964-.384c.803 0 1.5.156 2.09.467.588.311 1.072.725 1.456 1.244.383.519.66 1.108.827 1.77.168.664.23 1.355.187 2.07h-6.777c0 .697.227 1.36.587 1.71zM18.443 9.18c-.289-.316-.786-.489-1.379-.489-.387 0-.71.066-.967.197a1.981 1.981 0 00-.613.483 1.7 1.7 0 00-.325.59 2.63 2.63 0 00-.117.52h4.199c-.06-.648-.289-1.095-.578-1.3h-.22zm-3.648-5.12h5.258v1.275h-5.258V4.061z"/>
  </svg>
)

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
  { icon: Instagram, href: 'https://instagram.com/lightlyricist', label: 'Instagram' },
  { icon: Linkedin, href: 'https://www.linkedin.com/in/dexterityofrag', label: 'LinkedIn' },
  { icon: Github, href: 'https://github.com/Dexterityofrag', label: 'GitHub' },
  { icon: BehanceIcon, href: 'https://www.behance.net/anuragadhikari5', label: 'Behance' },
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
  background: rgba(255, 77, 0, 0.08);
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
