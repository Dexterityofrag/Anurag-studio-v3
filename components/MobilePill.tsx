'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { CV_URL } from '@/lib/constants'

const css = /* css */ `
.mpill {
  display: none;
}

@media (max-width: 768px) {
  .mpill {
    display: flex;
    position: fixed;
    bottom: calc(env(safe-area-inset-bottom, 0px) + 16px);
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
    transition:
      transform 520ms cubic-bezier(0.34, 1.4, 0.64, 1),
      left 520ms cubic-bezier(0.34, 1.4, 0.64, 1),
      right 520ms cubic-bezier(0.34, 1.4, 0.64, 1),
      padding 380ms cubic-bezier(0.22, 1, 0.36, 1),
      box-shadow 380ms ease,
      opacity 260ms ease;
  }

  .mpill--expanded {
    left: 50%;
    right: auto;
    transform: translateX(-50%);
    animation: mpill-in 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.2s both;
    box-shadow:
      0 12px 36px rgba(0, 0, 0, 0.45),
      0 2px 8px rgba(0, 0, 0, 0.25),
      inset 0 1px 0 rgba(255, 255, 255, 0.08);
  }

  .mpill--collapsed,
  .mpill--hidden {
    left: auto;
    right: 16px;
    padding: 6px;
    gap: 0;
    box-shadow:
      0 12px 28px rgba(0, 0, 0, 0.5),
      0 4px 14px rgba(0, 255, 148, 0.18),
      inset 0 1px 0 rgba(255, 255, 255, 0.08);
  }

  .mpill--collapsed {
    transform: translateY(0);
    opacity: 1;
  }

  .mpill--hidden {
    transform: translateY(calc(100% + env(safe-area-inset-bottom, 0px) + 32px));
    opacity: 0;
    pointer-events: none;
  }
}

@keyframes mpill-in {
  from { opacity: 0; transform: translate(-50%, 24px); }
  to   { opacity: 1; transform: translate(-50%, 0); }
}

.mpill__items {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  overflow: hidden;
  max-width: 600px;
  opacity: 1;
  margin-left: 2px;
  transition:
    max-width 520ms cubic-bezier(0.34, 1.4, 0.64, 1),
    opacity 260ms ease,
    margin-left 420ms cubic-bezier(0.22, 1, 0.36, 1);
}

.mpill--collapsed .mpill__items,
.mpill--hidden .mpill__items {
  max-width: 0;
  opacity: 0;
  pointer-events: none;
  margin-left: 0;
}

/* Stagger items in on expand */
.mpill--expanded .mpill__items > * {
  animation: mpill-item-in 0.5s cubic-bezier(0.22, 1, 0.36, 1) backwards;
}
.mpill--expanded .mpill__items > *:nth-child(1) { animation-delay: 0.06s; }
.mpill--expanded .mpill__items > *:nth-child(2) { animation-delay: 0.11s; }
.mpill--expanded .mpill__items > *:nth-child(3) { animation-delay: 0.16s; }
.mpill--expanded .mpill__items > *:nth-child(4) { animation-delay: 0.21s; }
.mpill--expanded .mpill__items > *:nth-child(5) { animation-delay: 0.26s; }

@keyframes mpill-item-in {
  from { opacity: 0; transform: translateY(10px) scale(0.78); filter: blur(4px); }
  to   { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
}

/* ───────────────── Toggle: liquid-glass capsule with accent glow ───────────────── */
.mpill__toggle {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  padding: 0;
  border: none;
  border-radius: 999px;
  background:
    radial-gradient(circle at 50% 130%, rgba(0, 255, 148, 0.45), rgba(0, 255, 148, 0) 62%),
    radial-gradient(circle at 50% -20%, rgba(255, 255, 255, 0.22), rgba(255, 255, 255, 0) 58%),
    linear-gradient(160deg, rgba(255, 255, 255, 0.14), rgba(255, 255, 255, 0.04));
  color: #eafff5;
  cursor: pointer;
  flex-shrink: 0;
  overflow: hidden;
  isolation: isolate;
  -webkit-tap-highlight-color: transparent;
  transition:
    transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1),
    color 0.3s ease;
}

/* Accent gradient ring */
.mpill__toggle::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px;
  background: conic-gradient(
    from 140deg,
    rgba(0, 255, 148, 0.85),
    rgba(0, 255, 148, 0.05) 28%,
    rgba(255, 255, 255, 0.35) 55%,
    rgba(0, 255, 148, 0.05) 78%,
    rgba(0, 255, 148, 0.85) 100%
  );
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
          mask-composite: exclude;
  pointer-events: none;
  animation: mpill-ring-spin 8s linear infinite;
}

/* Top glossy highlight */
.mpill__toggle::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 50%;
  width: 22px;
  height: 8px;
  transform: translateX(-50%);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.55), rgba(255, 255, 255, 0));
  border-radius: 999px;
  filter: blur(1.5px);
  pointer-events: none;
  z-index: 1;
}

@keyframes mpill-ring-spin {
  to { transform: rotate(360deg); }
}

/* Breathing accent glow only when collapsed (draws attention) */
.mpill--collapsed .mpill__toggle {
  animation: mpill-toggle-breathe 2.6s ease-in-out infinite;
}

@keyframes mpill-toggle-breathe {
  0%, 100% {
    box-shadow:
      0 0 0 0 rgba(0, 255, 148, 0.55),
      0 4px 14px rgba(0, 255, 148, 0.25),
      inset 0 1px 0 rgba(255, 255, 255, 0.18);
  }
  50% {
    box-shadow:
      0 0 0 9px rgba(0, 255, 148, 0),
      0 6px 20px rgba(0, 255, 148, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.25);
  }
}

.mpill__toggle:hover {
  color: #ffffff;
  transform: scale(1.06);
}

.mpill__toggle:active {
  transform: scale(0.92);
  transition-duration: 120ms;
}

/* Custom morphing icon: 3 dots ↔ chevron */
.mpill__toggle-icon {
  position: relative;
  width: 22px;
  height: 22px;
  display: block;
  fill: none;
  stroke: currentColor;
  stroke-width: 2.2;
  stroke-linecap: round;
  stroke-linejoin: round;
  z-index: 2;
  transition: transform 0.55s cubic-bezier(0.34, 1.56, 0.64, 1);
  filter: drop-shadow(0 0 4px rgba(0, 255, 148, 0.45));
}

.mpill__toggle-icon-path {
  transition:
    d 0.55s cubic-bezier(0.34, 1.56, 0.64, 1),
    stroke-dashoffset 0.55s cubic-bezier(0.22, 1, 0.36, 1);
}

/* Dot positions when collapsed → arrow shape when expanded via path animation */
.mpill__dot {
  fill: currentColor;
  stroke: none;
  transition:
    cx 0.55s cubic-bezier(0.34, 1.56, 0.64, 1),
    cy 0.55s cubic-bezier(0.34, 1.56, 0.64, 1),
    r 0.4s ease,
    opacity 0.3s ease;
}

/* Collapsed: three horizontal dots (•••) */
.mpill--collapsed .mpill__dot--1 { cx: 5; cy: 12; r: 1.7; opacity: 1; }
.mpill--collapsed .mpill__dot--2 { cx: 12; cy: 12; r: 1.7; opacity: 1; }
.mpill--collapsed .mpill__dot--3 { cx: 19; cy: 12; r: 1.7; opacity: 1; }
.mpill--hidden .mpill__dot--1 { cx: 5; cy: 12; r: 1.7; opacity: 1; }
.mpill--hidden .mpill__dot--2 { cx: 12; cy: 12; r: 1.7; opacity: 1; }
.mpill--hidden .mpill__dot--3 { cx: 19; cy: 12; r: 1.7; opacity: 1; }

/* Expanded: dots collapse into the center, fade out — chevron path takes over */
.mpill--expanded .mpill__dot--1 { cx: 12; cy: 12; r: 0; opacity: 0; }
.mpill--expanded .mpill__dot--2 { cx: 12; cy: 12; r: 0; opacity: 0; }
.mpill--expanded .mpill__dot--3 { cx: 12; cy: 12; r: 0; opacity: 0; }

/* Chevron path: shown only when expanded */
.mpill__chevron {
  stroke-dasharray: 22;
  stroke-dashoffset: 22;
  transition: stroke-dashoffset 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}

.mpill--expanded .mpill__chevron {
  stroke-dashoffset: 0;
  transition-delay: 0.18s;
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
  white-space: nowrap;
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
  .mpill,
  .mpill__items,
  .mpill__items > *,
  .mpill__toggle,
  .mpill__toggle::before,
  .mpill__toggle-icon,
  .mpill__dot,
  .mpill__chevron {
    transition: none !important;
    animation: none !important;
  }
  .mpill--expanded .mpill__chevron { stroke-dashoffset: 0; }
}
`

const LINKS = [
  { label: 'Work', href: '/work' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
]

type PillState = 'expanded' | 'collapsed' | 'hidden'

const TOP_THRESHOLD = 40
const HIDE_THRESHOLD = 320
const SCROLL_DELTA = 4

export default function MobilePill({ cvUrl }: { cvUrl?: string }) {
  const pathname = usePathname()
  const [state, setState] = useState<PillState>('expanded')
  const userExpandedRef = useRef(false)
  const lastYRef = useRef(0)
  const tickingRef = useRef(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    lastYRef.current = window.scrollY

    const update = () => {
      tickingRef.current = false
      const y = window.scrollY
      const dy = y - lastYRef.current
      lastYRef.current = y

      setState((prev) => {
        if (y < TOP_THRESHOLD) {
          userExpandedRef.current = false
          return 'expanded'
        }

        if (dy > SCROLL_DELTA) {
          userExpandedRef.current = false
          return y > HIDE_THRESHOLD ? 'hidden' : 'collapsed'
        }

        if (dy < -SCROLL_DELTA) {
          if (userExpandedRef.current) return 'expanded'
          return 'collapsed'
        }

        return prev
      })
    }

    const onScroll = () => {
      if (tickingRef.current) return
      tickingRef.current = true
      window.requestAnimationFrame(update)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const toggle = () => {
    setState((prev) => {
      if (prev === 'expanded') {
        userExpandedRef.current = false
        return 'collapsed'
      }
      userExpandedRef.current = true
      return 'expanded'
    })
  }

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/')

  const toggleLabel = state === 'expanded' ? 'Collapse navigation' : 'Open navigation'

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <nav className={`mpill mpill--${state}`} aria-label="Mobile navigation">
        <button
          type="button"
          className="mpill__toggle"
          onClick={toggle}
          aria-label={toggleLabel}
          aria-expanded={state === 'expanded'}
        >
          <svg className="mpill__toggle-icon" viewBox="0 0 24 24" aria-hidden="true">
            <circle className="mpill__dot mpill__dot--1" cx="5" cy="12" r="1.7" />
            <circle className="mpill__dot mpill__dot--2" cx="12" cy="12" r="1.7" />
            <circle className="mpill__dot mpill__dot--3" cx="19" cy="12" r="1.7" />
            <path className="mpill__chevron" d="M7 14l5-5 5 5" />
          </svg>
        </button>

        <div className="mpill__items" aria-hidden={state !== 'expanded'}>
          <Link
            href="/"
            aria-label="Home"
            tabIndex={state === 'expanded' ? 0 : -1}
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
              tabIndex={state === 'expanded' ? 0 : -1}
              className={`mpill__item${isActive(l.href) ? ' is-active' : ''}`}
            >
              {l.label}
            </Link>
          ))}

          <a
            href={cvUrl || CV_URL}
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={state === 'expanded' ? 0 : -1}
            className="mpill__item mpill__item--cv"
            aria-label="Download CV"
          >
            CV
          </a>
        </div>
      </nav>
    </>
  )
}
