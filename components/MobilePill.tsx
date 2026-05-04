'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CV_URL } from '@/lib/constants'

const css = /* css */ `
.mpill {
  display: none;
}

@media (max-width: 768px) {
  .mpill {
    display: flex;
    position: fixed;
    left: 50%;
    bottom: calc(env(safe-area-inset-bottom, 0px) + 16px);
    transform: translateX(-50%);
    z-index: var(--z-mobile-pill, 480);
    align-items: center;
    gap: 2px;
    padding: 6px;
    border-radius: 999px;
    background: rgba(18, 18, 18, 0.55);
    -webkit-backdrop-filter: blur(22px) saturate(180%);
    backdrop-filter: blur(22px) saturate(180%);
    border: 1px solid rgba(255, 255, 255, 0.12);
    box-shadow:
      0 12px 36px rgba(0, 0, 0, 0.45),
      0 2px 8px rgba(0, 0, 0, 0.25),
      inset 0 1px 0 rgba(255, 255, 255, 0.08);
    font-family: var(--font-display, "Space Grotesk", sans-serif);
    will-change: transform;
    animation: mpill-in 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.2s both;
  }
}

@keyframes mpill-in {
  from { opacity: 0; transform: translate(-50%, 24px); }
  to   { opacity: 1; transform: translate(-50%, 0); }
}

.mpill__item {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  min-height: 44px;
  padding: 0 14px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  text-decoration: none;
  color: rgba(240, 240, 240, 0.72);
  cursor: pointer;
  transition: color 0.25s ease, background 0.25s ease;
}

.mpill__item:hover {
  color: rgba(240, 240, 240, 1);
}

.mpill__item.is-active {
  color: var(--color-accent, #00FF94);
  background: rgba(0, 255, 148, 0.12);
}

.mpill__item--home {
  padding: 0;
  width: 44px;
}

.mpill__home-icon {
  width: 16px;
  height: 16px;
  display: block;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.6;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.mpill__item--cv {
  background: rgba(0, 255, 148, 0.14);
  color: var(--color-accent, #00FF94);
  margin-left: 4px;
}

.mpill__item--cv:hover {
  background: rgba(0, 255, 148, 0.22);
  color: var(--color-accent, #00FF94);
}

@media (prefers-reduced-motion: reduce) {
  .mpill { animation: none; }
}
`

const LINKS = [
  { label: 'Work', href: '/work' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

export default function MobilePill() {
  const pathname = usePathname()

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/')

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <nav className="mpill" aria-label="Mobile navigation">
        <Link
          href="/"
          aria-label="Home"
          className={`mpill__item mpill__item--home${isActive('/') ? ' is-active' : ''}`}
        >
          <svg className="mpill__home-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 11.5 12 4l9 7.5" />
            <path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" />
          </svg>
        </Link>

        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`mpill__item${isActive(l.href) ? ' is-active' : ''}`}
          >
            {l.label}
          </Link>
        ))}

        <a
          href={CV_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mpill__item mpill__item--cv"
          aria-label="Download CV"
        >
          CV
        </a>
      </nav>
    </>
  )
}
