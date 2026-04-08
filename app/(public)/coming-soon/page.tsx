'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

/* ────────────────────────────────────────────────────────────── */
/*  Text scramble hook                                            */
/* ────────────────────────────────────────────────────────────── */

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&!?'

function useScramble(target: string, startDelay = 400) {
  const [display, setDisplay] = useState(() => target.replace(/\S/g, () => CHARS[Math.floor(Math.random() * CHARS.length)]))

  useEffect(() => {
    let frame = 0
    let iter  = 0
    let interval: ReturnType<typeof setInterval>

    const timer = setTimeout(() => {
      interval = setInterval(() => {
        setDisplay(
          target.split('').map((ch, i) => {
            if (ch === ' ') return ' '
            if (i < iter)  return ch
            return CHARS[Math.floor(Math.random() * CHARS.length)]
          }).join('')
        )
        iter += 0.4
        frame++
        if (iter > target.replace(/ /g, '').length + 2) clearInterval(interval)
      }, 55)
    }, startDelay)

    return () => { clearTimeout(timer); clearInterval(interval) }
  }, [target, startDelay])

  return display
}

/* ────────────────────────────────────────────────────────────── */
/*  Styles                                                        */
/* ────────────────────────────────────────────────────────────── */

const css = /* css */ `
/* ─── ROOT ───────────────────────────────────────────────────── */
.cs-page {
  position: relative;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #060606;
  padding: var(--nav-h, 72px) clamp(24px, 5vw, 80px) 60px;
}

/* ─── SVG ORBITAL BG ─────────────────────────────────────────── */
.cs-orbits {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  opacity: 0;
  animation: cs-orbits-in 1.6s ease 0.3s forwards;
}
@keyframes cs-orbits-in {
  to { opacity: 1; }
}
.cs-orbit-ring {
  fill: none;
  stroke: rgba(255,255,255,0.04);
  stroke-width: 1;
}
.cs-orbit-sat {
  fill: var(--accent, #00FF94);
  r: 3;
  filter: blur(0.5px);
  opacity: 0.7;
}

/* ─── CORNER HUD ─────────────────────────────────────────────── */
.cs-corner {
  position: absolute;
  width: 28px; height: 28px;
  border-color: rgba(255,255,255,0.12);
  border-style: solid;
}
.cs-corner--tl { top: 32px; left: 32px; border-width: 1px 0 0 1px; }
.cs-corner--tr { top: 32px; right: 32px; border-width: 1px 1px 0 0; }
.cs-corner--bl { bottom: 32px; left: 32px; border-width: 0 0 1px 1px; }
.cs-corner--br { bottom: 32px; right: 32px; border-width: 0 1px 1px 0; }

/* ─── TOP LABEL ──────────────────────────────────────────────── */
.cs-top-label {
  position: absolute;
  top: clamp(24px, 4vw, 40px);
  left: 50%;
  transform: translateX(-50%);
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 11px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.2);
  white-space: nowrap;
  z-index: 2;
  opacity: 0;
  animation: cs-fade-up 0.7s ease 0.2s forwards;
}

/* ─── CENTER CONTENT ─────────────────────────────────────────── */
.cs-center {
  position: relative;
  z-index: 2;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(24px, 4vw, 40px);
}

/* Status pill */
.cs-status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.4);
  border: 1px solid rgba(255,255,255,0.1);
  padding: 7px 16px 7px 12px;
  border-radius: 999px;
  opacity: 0;
  animation: cs-fade-up 0.7s ease 0.5s forwards;
}
.cs-status-dot {
  width: 7px; height: 7px;
  background: var(--accent, #00FF94);
  border-radius: 50%;
  animation: cs-dot-pulse 2s ease infinite;
}
@keyframes cs-dot-pulse {
  0%,100% { box-shadow: 0 0 0 0 rgba(0,255,148,0.5); }
  50% { box-shadow: 0 0 0 5px rgba(0,255,148,0); }
}

/* Main heading */
.cs-heading {
  font-family: var(--font-display, 'Space Grotesk', sans-serif);
  font-size: clamp(3.5rem, 12vw, 10rem);
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 0.92;
  margin: 0;
  opacity: 0;
  animation: cs-fade-up 0.9s cubic-bezier(0.22,1,0.36,1) 0.6s forwards;
}
.cs-heading-line1 {
  display: block;
  color: var(--color-fg, #FAFAFA);
}
.cs-heading-line2 {
  display: block;
  color: transparent;
  -webkit-text-stroke: 1.5px rgba(255,255,255,0.3);
  position: relative;
}
.cs-heading-line2::after {
  content: attr(data-text);
  position: absolute;
  inset: 0;
  color: var(--accent, #00FF94);
  -webkit-text-stroke: 0;
  clip-path: inset(0 100% 0 0);
  animation: cs-reveal 1.2s cubic-bezier(0.22,1,0.36,1) 1.4s forwards;
}
@keyframes cs-reveal {
  to { clip-path: inset(0 0% 0 0); }
}

/* Description */
.cs-desc {
  font-family: var(--font-body, 'DM Sans', sans-serif);
  font-size: clamp(0.9rem, 1.5vw, 1.1rem);
  color: rgba(255,255,255,0.35);
  line-height: 1.65;
  max-width: 480px;
  opacity: 0;
  animation: cs-fade-up 0.7s ease 1s forwards;
}

/* Progress bar */
.cs-progress-wrap {
  width: clamp(200px, 40vw, 360px);
  opacity: 0;
  animation: cs-fade-up 0.7s ease 1.1s forwards;
}
.cs-progress-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 10px;
  letter-spacing: 0.1em;
  color: rgba(255,255,255,0.25);
  text-transform: uppercase;
}
.cs-progress-bar {
  width: 100%;
  height: 2px;
  background: rgba(255,255,255,0.06);
  border-radius: 999px;
  overflow: hidden;
}
.cs-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent, #00FF94), rgba(0,255,148,0.4));
  border-radius: 999px;
  width: 0;
  animation: cs-progress 2.5s cubic-bezier(0.22,1,0.36,1) 1.4s forwards;
}
@keyframes cs-progress {
  to { width: 68%; }
}

/* ─── BACK LINK ──────────────────────────────────────────────── */
.cs-back {
  position: absolute;
  bottom: clamp(24px, 4vw, 40px);
  left: clamp(24px, 5vw, 80px);
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.3);
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 2;
  cursor: none;
  opacity: 0;
  animation: cs-fade-up 0.7s ease 1.3s forwards;
  transition: color 0.25s ease;
}
.cs-back:hover { color: var(--accent, #00FF94); }
.cs-back-arrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px; height: 28px;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 50%;
  font-size: 12px;
  transition: all 0.25s ease;
}
.cs-back:hover .cs-back-arrow {
  border-color: var(--accent, #00FF94);
  background: rgba(0,255,148,0.08);
  transform: translateX(-3px);
}

/* ─── BOTTOM INFO ────────────────────────────────────────────── */
.cs-bottom-info {
  position: absolute;
  bottom: clamp(24px, 4vw, 40px);
  right: clamp(24px, 5vw, 80px);
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.15);
  z-index: 2;
  opacity: 0;
  animation: cs-fade-up 0.7s ease 1.3s forwards;
  text-align: right;
  line-height: 1.7;
}
.cs-bottom-info span {
  display: block;
}
.cs-bottom-info .cs-accent {
  color: rgba(0,255,148,0.5);
}

/* ─── SCANLINE OVERLAY ──────────────────────────────────────── */
.cs-scanlines {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0,0,0,0.025) 2px,
    rgba(0,0,0,0.025) 4px
  );
}

/* ─── ANIMATIONS ─────────────────────────────────────────────── */
@keyframes cs-fade-up {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

@media (max-width: 640px) {
  .cs-corner { display: none; }
  .cs-bottom-info { display: none; }
  .cs-heading { font-size: clamp(3rem, 15vw, 6rem); }
}
@media (prefers-reduced-motion: reduce) {
  .cs-heading-line2::after { animation: none; clip-path: inset(0 0% 0 0); }
  .cs-progress-fill { animation: none; width: 68%; }
  .cs-status-dot { animation: none; }
}
`

/* ────────────────────────────────────────────────────────────── */
/*  Component                                                     */
/* ────────────────────────────────────────────────────────────── */

export default function ComingSoonPage() {
  const line1 = useScramble('COMING', 700)
  const line2 = useScramble('SOON', 900)

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <div className="cs-page">
        {/* Scanline texture */}
        <div className="cs-scanlines" aria-hidden="true" />

        {/* HUD corner brackets */}
        <div className="cs-corner cs-corner--tl" aria-hidden="true" />
        <div className="cs-corner cs-corner--tr" aria-hidden="true" />
        <div className="cs-corner cs-corner--bl" aria-hidden="true" />
        <div className="cs-corner cs-corner--br" aria-hidden="true" />

        {/* Orbital decoration */}
        <svg
          className="cs-orbits"
          viewBox="0 0 1440 800"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <defs>
            <radialGradient id="cs-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="var(--accent, #00FF94)" stopOpacity="0.06" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>
          </defs>
          <ellipse cx="720" cy="400" rx="480" ry="280" fill="url(#cs-glow)" />
          <ellipse id="cso1" className="cs-orbit-ring" cx="720" cy="400" rx="340" ry="80" />
          <ellipse id="cso2" className="cs-orbit-ring" cx="720" cy="400" rx="220" ry="240" transform="rotate(40 720 400)" />
          <ellipse id="cso3" className="cs-orbit-ring" cx="720" cy="400" rx="480" ry="120" transform="rotate(-18 720 400)" />
          <circle className="cs-orbit-sat">
            <animateMotion dur="22s" repeatCount="indefinite">
              <mpath href="#cso1" />
            </animateMotion>
          </circle>
          <circle className="cs-orbit-sat" style={{ opacity: 0.45 }}>
            <animateMotion dur="34s" repeatCount="indefinite" keyPoints="0;1" keyTimes="0;1" calcMode="linear">
              <mpath href="#cso2" />
            </animateMotion>
          </circle>
          <circle className="cs-orbit-sat" style={{ r: '2', opacity: 0.55 }}>
            <animateMotion dur="18s" repeatCount="indefinite" keyPoints="1;0" keyTimes="0;1" calcMode="linear">
              <mpath href="#cso3" />
            </animateMotion>
          </circle>
        </svg>

        {/* Top label */}
        <span className="cs-top-label" aria-hidden="true">
          ANURAG.STUDIO — PROJECT STATUS
        </span>

        {/* Center content */}
        <div className="cs-center">
          {/* Status pill */}
          <div className="cs-status">
            <span className="cs-status-dot" aria-hidden="true" />
            Active development
          </div>

          {/* Main heading with scramble effect */}
          <h1 className="cs-heading" aria-label="Coming Soon">
            <span className="cs-heading-line1">{line1}</span>
            <span className="cs-heading-line2" data-text="SOON">{line2}</span>
          </h1>

          {/* Description */}
          <p className="cs-desc">
            This project is currently being crafted with intention.
            Something remarkable is on its way — stay tuned.
          </p>

          {/* Progress */}
          <div className="cs-progress-wrap">
            <div className="cs-progress-label">
              <span>Build progress</span>
              <span>68%</span>
            </div>
            <div className="cs-progress-bar">
              <div className="cs-progress-fill" />
            </div>
          </div>
        </div>

        {/* Back link */}
        <Link href="/" className="cs-back">
          <span className="cs-back-arrow">←</span>
          Back to home
        </Link>

        {/* Bottom info */}
        <div className="cs-bottom-info" aria-hidden="true">
          <span className="cs-accent">// STATUS</span>
          <span>IN DEVELOPMENT</span>
          <span>EST. 2025</span>
        </div>
      </div>
    </>
  )
}
