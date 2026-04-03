'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let Draggable: any
import { sound } from '@/lib/sound'

/* ────────────────────────────────────────────────────────────── */
/*  Props                                                         */
/* ────────────────────────────────────────────────────────────── */

interface HeroProps {
  title?: string
  subtitle?: string
  eyebrow?: string
  badge?: string
}

/* ────────────────────────────────────────────────────────────── */
/*  Helpers                                                       */
/* ────────────────────────────────────────────────────────────── */

function splitToChars(text: string, baseDelay = 0, step = 0.04) {
  return text.split('').map((ch, i) => (
    <span
      key={i}
      className="h-char"
      style={{ '--char-delay': `${baseDelay + i * step}s` } as React.CSSProperties}
    >
      {ch === ' ' ? '\u00A0' : ch}
    </span>
  ))
}

/* ────────────────────────────────────────────────────────────── */
/*  Styles                                                        */
/* ────────────────────────────────────────────────────────────── */

const css = /* css */ `
/* ── Scroll track (200vh gives us room for the tilt) ── */
.v3-hero-track {
  width: 100vw;
  height: 200vh;
  position: relative;
}

/* ── Sticky viewport shell ── */
.v3-hero {
  position: sticky;
  top: 0;
  height: 100vh;
  width: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--color-bg, #060606);
}

/* ── Ruler / grid overlay (subtle axis lines) ── */
.v3-hero-grid {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
  background-image:
    linear-gradient(rgba(255,255,255,0.028) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.028) 1px, transparent 1px);
  background-size: 80px 80px;
  mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%);
}

/* ── Corner meta ── */
.v3-hero-meta {
  position: absolute;
  top: 28px;
  left: 36px;
  right: 36px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 20;
  pointer-events: none;
}
.v3-hero-meta-label {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(240,237,232,0.28);
}
.v3-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(240,237,232,0.45);
  pointer-events: auto;
}
.v3-badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #22c55e;
  flex-shrink: 0;
  animation: available-pulse 2s ease-in-out infinite;
}

/* ── Center kinetic name ── */
.v3-name-wrap {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  /* velocity blur applied via JS */
  filter: blur(var(--scroll-blur, 0px));
  transition: filter 0.08s linear;
  will-change: filter;
}

.v3-name-line {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(72px, 14vw, 180px);
  line-height: 0.9;
  letter-spacing: -0.03em;
  color: var(--color-fg, #f0ede8);
  user-select: none;
  display: flex;
}

/* ── Per-character reveal ── */
.h-char {
  display: inline-block;
  opacity: 0;
  filter: blur(12px);
  transform: translateY(40px) scaleY(1.1);
  transition:
    opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1) var(--char-delay, 0s),
    filter  0.7s cubic-bezier(0.22, 1, 0.36, 1) var(--char-delay, 0s),
    transform 0.7s cubic-bezier(0.22, 1, 0.36, 1) var(--char-delay, 0s);
  will-change: transform, opacity, filter;
}
.h-char.in {
  opacity: 1;
  filter: blur(0px);
  transform: translateY(0) scaleY(1);
}

/* ── Letter hover glow ── */
.v3-name-line:hover .h-char {
  text-shadow: 0 0 40px rgba(0, 255, 148, 0.45);
  transition:
    text-shadow 0.3s ease,
    opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1) var(--char-delay, 0s),
    filter  0.7s cubic-bezier(0.22, 1, 0.36, 1) var(--char-delay, 0s),
    transform 0.7s cubic-bezier(0.22, 1, 0.36, 1) var(--char-delay, 0s);
}

/* ── Subtitle pill ── */
.v3-subtitle {
  margin-top: 28px;
  font-family: var(--font-body);
  font-size: clamp(13px, 1.4vw, 16px);
  font-weight: 400;
  color: rgba(240, 237, 232, 0.48);
  letter-spacing: 0.04em;
  opacity: 0;
  transform: translateY(16px);
  transition: opacity 0.9s ease 0.6s, transform 0.9s ease 0.6s;
}
.v3-subtitle.in {
  opacity: 1;
  transform: translateY(0);
}

/* ── Eyebrow accent line ── */
.v3-eyebrow {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--color-accent, #00FF94);
  margin-bottom: 20px;
  opacity: 0;
  transition: opacity 0.6s ease 0.1s;
}
.v3-eyebrow.in {
  opacity: 1;
}

/* ── Scroll cue ── */
.v3-scroll-cue {
  position: absolute;
  bottom: 36px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  opacity: 0;
  transition: opacity 1s ease 1.4s;
}
.v3-scroll-cue.in { opacity: 1; }
.v3-scroll-cue-line {
  width: 1px;
  height: 48px;
  background: linear-gradient(to bottom, rgba(0,255,148,0.6), transparent);
  animation: scroll-line-drop 1.8s ease-in-out infinite;
}
.v3-scroll-cue-label {
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(240, 237, 232, 0.25);
}
@keyframes scroll-line-drop {
  0%   { transform: scaleY(0); transform-origin: top; }
  50%  { transform: scaleY(1); transform-origin: top; }
  51%  { transform: scaleY(1); transform-origin: bottom; }
  100% { transform: scaleY(0); transform-origin: bottom; }
}

/* ── Bottom marquee strip ── */
.v3-hero-bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 20;
  overflow: hidden;
  border-top: 1px solid rgba(255,255,255,0.05);
  padding: 12px 0;
  opacity: 0;
  transition: opacity 1s ease 1.2s;
}
.v3-hero-bottom.in { opacity: 1; }
.v3-marquee-track {
  display: flex;
  white-space: nowrap;
  gap: 0;
  animation: v3-marquee 28s linear infinite;
}
.v3-marquee-item {
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(240, 237, 232, 0.22);
  padding: 0 32px;
}
.v3-marquee-sep {
  color: var(--color-accent, #00FF94);
  opacity: 0.5;
  padding: 0 8px;
}
@keyframes v3-marquee {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}

/* ── Snap drag zone ── */
.v3-snap-zone {
  position: absolute;
  bottom: 80px;
  right: 48px;
  z-index: 25;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
  pointer-events: none;
}
.v3-snap-label {
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: rgba(0, 255, 148, 0.4);
  opacity: 0;
  transition: opacity 0.6s ease 1.8s;
}
.v3-snap-label.in { opacity: 1; }

/* ── Neon snap cursor ── */
.v3-snap-cursor {
  position: absolute;
  width: 20px;
  height: 20px;
  pointer-events: none;
  z-index: 1000;
  opacity: 0;
  transition: opacity 0.2s ease;
}
.v3-snap-cursor.visible { opacity: 1; }
.v3-snap-cursor-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-accent, #00FF94);
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%,-50%);
  box-shadow: 0 0 12px rgba(0,255,148,0.8);
}
.v3-snap-cursor-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 1px solid rgba(0,255,148,0.4);
  animation: snap-ring-pulse 1.4s ease-in-out infinite;
}
@keyframes snap-ring-pulse {
  0%, 100% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.8); opacity: 0; }
}

/* ── Snap message bubble ── */
.v3-snap-bubble {
  position: absolute;
  background: rgba(0,255,148,0.08);
  border: 1px solid rgba(0,255,148,0.25);
  border-radius: 8px;
  padding: 8px 14px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: rgba(0,255,148,0.85);
  white-space: nowrap;
  pointer-events: none;
  z-index: 1000;
  opacity: 0;
  transform: translateY(6px) scale(0.96);
  transition: opacity 0.22s ease, transform 0.22s ease;
  backdrop-filter: blur(8px);
}
.v3-snap-bubble.show {
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* ── Scroll tilt target ── */
.v3-tilt-target {
  position: absolute;
  inset: 0;
  will-change: transform;
  transform-style: preserve-3d;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  /* Optical center: shift content down by half the nav height
     so the visual mass sits in the true center of the usable viewport */
  margin-top: 36px;
}

/* ── Orbital SVG ── */
.v3-orbits {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  pointer-events: none;
  opacity: 0;
  transition: opacity 1.6s ease 0.6s;
  overflow: hidden;
}
.v3-orbits.in { opacity: 1; }

/* Subtle center glow pulse */
@keyframes glow-pulse {
  0%, 100% { opacity: 0.55; }
  50%       { opacity: 0.9; }
}
.v3-orbit-glow { animation: glow-pulse 6s ease-in-out infinite; }

/* Satellite dot glow */
@keyframes sat-glow {
  0%, 100% { r: 2.5; filter: blur(0px); }
  50%       { r: 3.8; filter: blur(1px); }
}

/* ── Reduced motion ── */
@media (prefers-reduced-motion: reduce) {
  .h-char {
    opacity: 1;
    filter: none;
    transform: none;
    transition: none;
  }
  .v3-subtitle, .v3-eyebrow, .v3-scroll-cue, .v3-hero-bottom, .v3-snap-label {
    opacity: 1;
    transform: none;
    transition: none;
  }
  .v3-marquee-track { animation: none; }
  .v3-scroll-cue-line { animation: none; }
}
`

/* ────────────────────────────────────────────────────────────── */
/*  Marquee content (doubled for seamless loop)                  */
/* ────────────────────────────────────────────────────────────── */

const ROLES = [
  'Product Designer',
  'UI/UX Design',
  'Brand Identity',
  'Creative Dev',
  'Motion Design',
  'Design Systems',
]

function MarqueeContent() {
  const items = [...ROLES, ...ROLES]
  return (
    <>
      {items.map((r, i) => (
        <span key={i} className="v3-marquee-item">
          {r}
          {i < items.length - 1 && <span className="v3-marquee-sep">·</span>}
        </span>
      ))}
    </>
  )
}

/* ────────────────────────────────────────────────────────────── */
/*  Snap messages                                                 */
/* ────────────────────────────────────────────────────────────── */

const SNAP_MSGS = [
  'Locked in.',
  'Snapped.',
  'Pixel perfect.',
  'Grid aligned.',
  'That\'s the one.',
]

/* ────────────────────────────────────────────────────────────── */
/*  Component                                                     */
/* ────────────────────────────────────────────────────────────── */

export default function HeroSection({ eyebrow, subtitle, badge }: HeroProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const tiltRef = useRef<HTMLDivElement>(null)
  const orbitsRef = useRef<SVGSVGElement>(null)
  const snapCursorRef = useRef<HTMLDivElement>(null)
  const snapBubbleRef = useRef<HTMLDivElement>(null)
  const snapZoneRef = useRef<HTMLDivElement>(null)
  const bubbleTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  /* ── Char reveal + subtitle fade-in ── */
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      document.querySelectorAll('.h-char').forEach(el => el.classList.add('in'))
      document.querySelectorAll('.v3-eyebrow, .v3-subtitle, .v3-scroll-cue, .v3-hero-bottom, .v3-snap-label')
        .forEach(el => el.classList.add('in'))
    })
    return () => cancelAnimationFrame(raf)
  }, [])

  /* ── Velocity scroll blur ── */
  useEffect(() => {
    const hero = heroRef.current
    if (!hero) return
    let lastY = window.scrollY
    let lastT = performance.now()
    let rafId: number

    function onScroll() {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        if (!hero) return
        const now = performance.now()
        const dy = Math.abs(window.scrollY - lastY)
        const dt = Math.max(now - lastT, 1)
        const velocity = dy / dt   // px/ms
        const blur = Math.min(velocity * 18, 22)
        hero.style.setProperty('--scroll-blur', blur + 'px')
        // decay
        setTimeout(() => hero?.style.setProperty('--scroll-blur', '0px'), 120)
        lastY = window.scrollY
        lastT = now
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(rafId)
    }
  }, [])

  /* ── Orbital SVG fade in ── */
  useEffect(() => {
    const svg = orbitsRef.current
    if (!svg) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      svg.classList.add('in')
      return
    }
    const raf = requestAnimationFrame(() => svg.classList.add('in'))
    return () => cancelAnimationFrame(raf)
  }, [])

  /* ── GSAP scroll tilt ── */
  useEffect(() => {
    if (!trackRef.current || !tiltRef.current) return
    gsap.registerPlugin(ScrollTrigger)

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: trackRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.2,
      },
    })

    tl.to(tiltRef.current, {
      rotateX: 40,
      rotateZ: -8,
      scale: 0.62,
      y: -20,
      ease: 'none',
    })

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill())
    }
  }, [])

  /* ── Drag snap ── */
  useEffect(() => {
    if (!snapZoneRef.current) return
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    Draggable = (require('gsap/Draggable') as { Draggable: unknown }).Draggable
    gsap.registerPlugin(Draggable)

    const zone = snapZoneRef.current
    const cursor = snapCursorRef.current
    const bubble = snapBubbleRef.current

    // Create invisible draggable dot
    const dot = document.createElement('div')
    dot.style.cssText = `
      width: 24px; height: 24px; border-radius: 50%;
      position: absolute; bottom: 0; right: 0;
      cursor: none; pointer-events: all; z-index: 30;
      background: transparent;
    `
    zone.appendChild(dot)

    const snapPoints = [
      { x: 0, y: 0 },
      { x: -60, y: -40 },
      { x: -120, y: -20 },
      { x: -40, y: -80 },
    ]

    let msgIndex = 0

    const draggable = Draggable.create(dot, {
      type: 'x,y',
      edgeResistance: 0.65,
      bounds: { minX: -200, maxX: 0, minY: -140, maxY: 0 },
      onDrag() {
        if (cursor) {
          cursor.style.left = (dot.getBoundingClientRect().left + 12) + 'px'
          cursor.style.top = (dot.getBoundingClientRect().top + 12) + 'px'
          cursor.classList.add('visible')
        }
      },
      onDragStart() {
        sound.drag()
      },
      snap: {
        x: snapPoints.map(p => p.x),
        y: snapPoints.map(p => p.y),
      },
      onDragEnd() {
        sound.snap()
        if (bubble) {
          bubble.textContent = SNAP_MSGS[msgIndex % SNAP_MSGS.length]
          msgIndex++
          bubble.style.left = (dot.getBoundingClientRect().left - 10) + 'px'
          bubble.style.top = (dot.getBoundingClientRect().top - 44) + 'px'
          bubble.classList.add('show')
          if (bubbleTimeout.current) clearTimeout(bubbleTimeout.current)
          bubbleTimeout.current = setTimeout(() => bubble.classList.remove('show'), 1600)
        }
        if (cursor) cursor.classList.remove('visible')
      },
    })[0]

    return () => {
      draggable?.kill()
      dot.remove()
    }
  }, [])

  const displayEyebrow = eyebrow || 'Product Designer & Creative Developer'
  const displaySubtitle = subtitle || 'Strategy-first design, built for the real world.'
  const displayBadge = badge || 'Available for work'

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />

      {/* Neon snap cursor */}
      <div ref={snapCursorRef} className="v3-snap-cursor" style={{ position: 'fixed' }}>
        <div className="v3-snap-cursor-ring" />
        <div className="v3-snap-cursor-dot" />
      </div>

      {/* Snap message bubble */}
      <div ref={snapBubbleRef} className="v3-snap-bubble" style={{ position: 'fixed' }} />

      <section ref={trackRef} className="v3-hero-track">
        <div
          ref={heroRef}
          className="v3-hero"
          style={{ perspective: '1400px', perspectiveOrigin: '50% 40%' }}
        >
          {/* Tilt target wraps everything that tilts */}
          <div ref={tiltRef} className="v3-tilt-target">

            {/* Ruler grid */}
            <div className="v3-hero-grid" aria-hidden="true" />

            {/* Orbital rings */}
            <svg
              ref={orbitsRef}
              className="v3-orbits"
              viewBox="0 0 1440 900"
              preserveAspectRatio="xMidYMid slice"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Soft center radial glow */}
                <radialGradient id="center-glow" cx="50%" cy="50%" r="25%">
                  <stop offset="0%" stopColor="#00FF94" stopOpacity="0.07" />
                  <stop offset="100%" stopColor="#00FF94" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* Ambient center glow */}
              <ellipse
                className="v3-orbit-glow"
                cx="720" cy="450"
                rx="340" ry="200"
                fill="url(#center-glow)"
              />

              {/* Ring 1 — wide flat orbit (like looking at a tilted ring from slightly above) */}
              <ellipse
                id="op1"
                cx="720" cy="450"
                rx="440" ry="88"
                fill="none"
                stroke="rgba(0,255,148,0.10)"
                strokeWidth="0.75"
              />
              {/* Satellite on ring 1 */}
              <circle r="2.8" fill="#00FF94" opacity="0.65">
                <animateMotion dur="26s" repeatCount="indefinite">
                  <mpath href="#op1" />
                </animateMotion>
              </circle>

              {/* Ring 2 — more upright, rotated 40° in plane */}
              <ellipse
                id="op2"
                cx="720" cy="450"
                rx="220" ry="340"
                fill="none"
                stroke="rgba(0,255,148,0.055)"
                strokeWidth="0.65"
                transform="rotate(38 720 450)"
              />
              {/* Slower satellite on ring 2 */}
              <circle r="2" fill="#00FF94" opacity="0.45">
                <animateMotion dur="42s" repeatCount="indefinite" keyPoints="1;0" keyTimes="0;1">
                  <mpath href="#op2" />
                </animateMotion>
              </circle>

              {/* Ring 3 — medium, opposite tilt */}
              <ellipse
                id="op3"
                cx="720" cy="450"
                rx="310" ry="170"
                fill="none"
                stroke="rgba(0,255,148,0.045)"
                strokeWidth="0.6"
                transform="rotate(-22 720 450)"
              />
              {/* No satellite on ring 3 — just the ring */}

              {/* Ring 4 — small tight inner ring */}
              <ellipse
                id="op4"
                cx="720" cy="450"
                rx="140" ry="52"
                fill="none"
                stroke="rgba(0,255,148,0.07)"
                strokeWidth="0.5"
                transform="rotate(15 720 450)"
              />
              {/* Fast small satellite */}
              <circle r="1.5" fill="#00FF94" opacity="0.55">
                <animateMotion dur="14s" repeatCount="indefinite">
                  <mpath href="#op4" />
                </animateMotion>
              </circle>
            </svg>

            {/* Center kinetic name */}
            <div className="v3-name-wrap" aria-label="Anurag">
              <p className="v3-eyebrow">{displayEyebrow}</p>
              <div className="v3-name-line" aria-hidden="true">
                {splitToChars('ANURAG', 0.05, 0.06)}
              </div>
              <p className="v3-subtitle">{displaySubtitle}</p>
            </div>

            {/* Scroll cue */}
            <div className="v3-scroll-cue" aria-hidden="true">
              <div className="v3-scroll-cue-line" />
              <span className="v3-scroll-cue-label">Scroll</span>
            </div>

            {/* Snap drag zone */}
            <div ref={snapZoneRef} className="v3-snap-zone" aria-hidden="true">
              <span className="v3-snap-label">Drag to snap</span>
            </div>

            {/* Bottom marquee */}
            <div className="v3-hero-bottom" aria-hidden="true">
              <div className="v3-marquee-track">
                <MarqueeContent />
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  )
}
