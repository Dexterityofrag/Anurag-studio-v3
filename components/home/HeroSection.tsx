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

/* ── Draggable artboard — only wraps the ANURAG text ── */
.v3-drag-artboard {
  position: relative;
  cursor: grab;
  display: inline-block;
  padding: 10px 18px;
  user-select: none;
}
.v3-drag-artboard.v3-dragging { cursor: grabbing; }

/* Dashed artboard frame */
.v3-ab-frame {
  position: absolute;
  inset: 0;
  border: 1px dashed rgba(255,255,255,0);
  border-radius: 2px;
  pointer-events: none;
  transition: border-color 0.25s ease;
}
.v3-drag-artboard:hover .v3-ab-frame,
.v3-drag-artboard.v3-dragging .v3-ab-frame { border-color: rgba(255,255,255,0.2); }

/* Corner selection handles */
.v3-ab-handle {
  position: absolute;
  width: 7px;
  height: 7px;
  border-color: rgba(255,255,255,0.55);
  border-style: solid;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.25s ease;
}
.v3-drag-artboard:hover .v3-ab-handle,
.v3-drag-artboard.v3-dragging .v3-ab-handle { opacity: 1; }
.v3-ab-handle--tl { top: -1px; left: -1px; border-width: 1px 0 0 1px; }
.v3-ab-handle--tr { top: -1px; right: -1px; border-width: 1px 1px 0 0; }
.v3-ab-handle--bl { bottom: -1px; left: -1px; border-width: 0 0 1px 1px; }
.v3-ab-handle--br { bottom: -1px; right: -1px; border-width: 0 1px 1px 0; }

/* Layer name tag (top-left, above the frame) */
.v3-ab-tag {
  position: absolute;
  top: -22px;
  left: 0;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.06em;
  color: rgba(255,255,255,0.4);
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.25s ease;
}
.v3-drag-artboard:hover .v3-ab-tag,
.v3-drag-artboard.v3-dragging .v3-ab-tag { opacity: 1; }

/* "DRAG TO MOVE" hint pill (centered above, only on hover) */
.v3-drag-hint {
  position: absolute;
  top: -52px;
  left: 50%;
  transform: translateX(-50%);
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgba(240,237,232,0.45);
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  padding: 5px 14px;
  border-radius: 4px;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
}
.v3-drag-artboard:hover .v3-drag-hint { opacity: 1; }
.v3-drag-artboard.v3-dragging .v3-drag-hint { opacity: 0; }

/* dx / dy coordinate readout (bottom-right, only while dragging) */
.v3-ab-coords {
  position: absolute;
  bottom: -26px;
  right: 0;
  font-family: var(--font-mono);
  font-size: 9px;
  letter-spacing: 0.08em;
  color: rgba(255,255,255,0.28);
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.15s ease;
}
.v3-drag-artboard.v3-dragging .v3-ab-coords { opacity: 1; }

/* Figma-style snap toast ("property → value") */
.v3-snap-toast {
  position: absolute;
  bottom: -52px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-mono);
  font-size: 10px;
  letter-spacing: 0.08em;
  background: rgba(14,14,14,0.93);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 4px;
  padding: 5px 12px;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
}
.v3-snap-toast-prop { color: rgba(255,255,255,0.35); }
.v3-snap-toast-arrow { color: rgba(255,255,255,0.2); }
.v3-snap-toast-val { color: var(--color-accent, #00FF94); }

/* ── Scroll tilt target ── */
.v3-tilt-target {
  position: absolute;
  inset: 0;
  will-change: transform;
  transform-style: preserve-3d;
  transform-origin: 50% 50%;
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
/*  Component                                                     */
/* ────────────────────────────────────────────────────────────── */

export default function HeroSection({ eyebrow, subtitle, badge }: HeroProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const tiltRef = useRef<HTMLDivElement>(null)
  const orbitsRef = useRef<SVGSVGElement>(null)
  const dragArtboardRef = useRef<HTMLDivElement>(null)
  const coordsRef = useRef<HTMLSpanElement>(null)
  const snapToastRef = useRef<HTMLDivElement>(null)
  const toastPropRef = useRef<HTMLSpanElement>(null)
  const toastValRef = useRef<HTMLSpanElement>(null)

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
      rotateX: -12,
      rotateZ: 0,
      scale: 0.82,
      y: 0,
      borderRadius: '16px',
      ease: 'none',
    })

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill())
    }
  }, [])

  /* ── Draggable hero artboard (snaps back with Figma-style toast) ── */
  useEffect(() => {
    if (!dragArtboardRef.current) return
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    Draggable = (require('gsap/Draggable') as { Draggable: unknown }).Draggable
    gsap.registerPlugin(Draggable)

    const el = dragArtboardRef.current
    const hero = heroRef.current

    const TOASTS: { prop: string; val: string }[] = [
      { prop: 'alignment', val: 'centering...' },
      { prop: 'escape.attempt', val: 'denied' },
      { prop: 'position', val: 'reset ✓' },
      { prop: 'gravity', val: 'winning' },
      { prop: 'freedom', val: 'false' },
      { prop: 'home', val: 'always here' },
      { prop: 'resistance', val: 'futile' },
      { prop: 'drift', val: 'rejected' },
      { prop: 'return', val: 'mandatory' },
      { prop: 'x', val: '0   dy: 0' },
    ]
    let toastIndex = 0
    let toastTween: gsap.core.Tween | null = null

    const draggable = Draggable.create(el, {
      type: 'x,y',
      edgeResistance: 0.72,
      onDragStart() {
        sound.drag()
        el.classList.add('v3-dragging')
        // Allow overflow during drag so element isn't clipped
        if (hero) hero.style.overflow = 'visible'
      },
      onDrag() {
        if (coordsRef.current) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const d = this as any
          coordsRef.current.textContent = `dx: ${Math.round(d.x)}   dy: ${Math.round(d.y)}`
        }
      },
      onDragEnd() {
        el.classList.remove('v3-dragging')
        // Elastic snap back to origin
        gsap.to(el, {
          x: 0, y: 0,
          ease: 'elastic.out(1, 0.4)',
          duration: 1.3,
          onComplete: () => {
            if (hero) hero.style.overflow = ''
          }
        })
        sound.snap()
        // Show Figma-style toast
        const t = TOASTS[toastIndex % TOASTS.length]
        toastIndex++
        if (toastPropRef.current) toastPropRef.current.textContent = t.prop
        if (toastValRef.current) toastValRef.current.textContent = t.val
        if (snapToastRef.current) {
          toastTween?.kill()
          toastTween = gsap.fromTo(
            snapToastRef.current,
            { opacity: 0, y: 6 },
            {
              opacity: 1, y: 0, duration: 0.28, ease: 'power2.out',
              onComplete: () => {
                gsap.to(snapToastRef.current!, { opacity: 0, delay: 1.4, duration: 0.4 })
              }
            }
          )
        }
      },
    })[0]

    return () => {
      draggable?.kill()
      toastTween?.kill()
      if (hero) hero.style.overflow = ''
    }
  }, [])

  const displayEyebrow = eyebrow || 'Product Designer & Creative Developer'
  const displaySubtitle = subtitle || 'Strategy-first design, built for the real world.'
  const displayBadge = badge || 'Available for work'

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />

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

              {/* Draggable artboard — just the ANURAG text */}
              <div ref={dragArtboardRef} className="v3-drag-artboard" aria-hidden="true">
                {/* Artboard chrome */}
                <div className="v3-ab-frame" />
                <span className="v3-ab-handle v3-ab-handle--tl" />
                <span className="v3-ab-handle v3-ab-handle--tr" />
                <span className="v3-ab-handle v3-ab-handle--bl" />
                <span className="v3-ab-handle v3-ab-handle--br" />
                <span className="v3-ab-tag">anurag.frame</span>
                <span className="v3-drag-hint">Drag to move</span>
                <span ref={coordsRef} className="v3-ab-coords">dx: 0   dy: 0</span>
                {/* The name */}
                <div className="v3-name-line">
                  {splitToChars('ANURAG', 0.05, 0.06)}
                </div>
                {/* Snap toast */}
                <div ref={snapToastRef} className="v3-snap-toast">
                  <span ref={toastPropRef} className="v3-snap-toast-prop">alignment</span>
                  <span className="v3-snap-toast-arrow">→</span>
                  <span ref={toastValRef} className="v3-snap-toast-val">centering...</span>
                </div>
              </div>

              <p className="v3-subtitle">{displaySubtitle}</p>
            </div>

            {/* Scroll cue */}
            <div className="v3-scroll-cue" aria-hidden="true">
              <div className="v3-scroll-cue-line" />
              <span className="v3-scroll-cue-label">Scroll</span>
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
