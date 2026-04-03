'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
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
/*  Styles                                                        */
/* ────────────────────────────────────────────────────────────── */

const css = /* css */ `
/* ─── CAMERA TRACK ──────────────────────────────────────────── */
.camera-track {
  width: 100vw;
  height: 200vh;
  perspective: 1500px;
  perspective-origin: 50% 50%;
  position: relative;
  background: #000;
}

/* ─── ARTBOARD ──────────────────────────────────────────────── */
.artboard {
  position: sticky;
  top: 0;
  height: 100vh;
  width: 100%;
  transform-style: preserve-3d;
  will-change: transform;
  backface-visibility: hidden;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

/* Overlay that fades in the rounded-corner frame + glow shadow.
   Animating opacity is GPU-composited - zero paint cost.           */
.artboard-frame {
  position: absolute;
  inset: 0;
  border-radius: 32px;
  box-shadow:
    rgba(0,0,0,0.8) 0px 40px 100px,
    rgba(166,139,249,0.6) 0px 0px 0px 2px;
  opacity: 0;
  pointer-events: none;
  z-index: 50;
  will-change: opacity;
}

/* ─── DOT GRID BACKGROUND ───────────────────────────────────── */
.hero-dot-grid {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
  /* Dot grid via radial-gradient */
  background-image: radial-gradient(circle, rgba(255,255,255,0.18) 1px, transparent 1px);
  background-size: 30px 30px;
  opacity: 0;
}

/* Blue vignette edges (like the reference) */
.hero-vignette {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 2;
  background:
    radial-gradient(ellipse 120% 80% at 50% 50%, transparent 50%, rgba(10, 20, 60, 0.45) 100%),
    radial-gradient(ellipse 40% 100% at 0% 50%, rgba(10, 30, 80, 0.3) 0%, transparent 70%),
    radial-gradient(ellipse 40% 100% at 100% 50%, rgba(10, 30, 80, 0.3) 0%, transparent 70%);
}

/* ─── HERO CENTER CONTENT ────────────────────────────────────── */
.hero-ic {
  position: absolute;
  inset: 0;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 0 var(--gutter, 40px);
  user-select: none;
}

/* ── Eyebrow (top tracking text) ─── */
/* "NAVIGATING THE UNKNOWN, PIXEL BY PIXEL." */
.hero-ic-eye {
  font-family: var(--font-mono, 'DM Mono', monospace);
  font-size: 11px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.45);
  letter-spacing: 0.38em;
  text-transform: uppercase;
  margin-bottom: 28px;
  opacity: 0;
  white-space: nowrap;
}

/* ── Inner wrap ─── */
.hero-ic-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  line-height: 0.85;
}
.mask-wrap {
  overflow: hidden;
  display: block;
}
.mask-wrap.revealed {
  overflow: visible;
}
.drag-text {
  display: block;
  font-family: var(--font-display, 'Space Grotesk', sans-serif);
  font-size: clamp(5rem, 14vw, 14rem);
  font-weight: 700;
  line-height: 0.85;
  letter-spacing: -0.04em;
  text-transform: uppercase;
  color: var(--color-fg, #f0f0f0);
  transform: translateY(120%);
  will-change: transform;
  cursor: grab;
  position: relative;
  z-index: 12;
  -webkit-user-drag: none;
  user-select: none;
}
.drag-text.outline {
  color: transparent;
  -webkit-text-stroke: 2px var(--color-fg, #f0f0f0);
}
.drag-text.is-dragging {
  cursor: grabbing !important;
  z-index: 20;
}
body.hero-dragging, body.hero-dragging * {
  cursor: grabbing !important;
}

/* ── Tagline (bottom subtitle) ─── */
/* "Precision structure, bold creative vision." */
.hero-ic-sub {
  font-family: var(--font-display, 'Space Grotesk', sans-serif);
  font-size: clamp(1rem, 1.6vw, 1.35rem);
  font-weight: 400;
  font-style: italic;
  color: rgba(255, 255, 255, 0.42);
  margin-top: 28px;
  opacity: 0;
  letter-spacing: 0.01em;
}

/* ─── FIGMA OVERLAYS ────────────────────────────────────────── */

/* Andy cursor */
.ac-hero {
  position: absolute;
  z-index: 30;
  pointer-events: none;
  display: flex;
  align-items: flex-start;
  gap: 6px;
  opacity: 0;
  top: 0;
  left: 0;
  transform: translate3d(-200px, -200px, 0);
}
.ac-hero-tag {
  background: #a78bfa;
  color: #000;
  font-family: var(--font-mono, 'DM Mono', monospace);
  font-size: 11px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 3px;
  white-space: nowrap;
  margin-top: 2px;
}

/* Figma comment bubble */
.figma-comment {
  position: absolute;
  top: 28px;
  left: 10px;
  background: #a78bfa;
  color: #000;
  border-radius: 0 12px 12px 12px;
  padding: 6px 14px;
  font-family: var(--font-body, 'DM Sans', sans-serif);
  font-size: 15px;
  font-weight: 500;
  letter-spacing: -0.15px;
  white-space: nowrap;
  opacity: 0;
  min-width: 4px;
  max-width: 300px;
  pointer-events: none;
}
.figma-comment.on { opacity: 1; }

/* Andy's selection box */
.asel-hero {
  position: absolute;
  z-index: 25;
  pointer-events: none;
  border: 1.5px solid #a78bfa;
  background: rgba(167, 139, 250, 0.05);
  opacity: 0;
  top: 0; left: 0;
}
.asel-hero-lbl {
  position: absolute;
  top: -25px;
  left: -2px;
  background: #a78bfa;
  color: #000;
  font-family: var(--font-mono, 'DM Mono', monospace);
  font-size: 10px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 3px;
  white-space: nowrap;
}
.asel-hero-handle {
  position: absolute;
  width: 6px;
  height: 6px;
  background: #a78bfa;
  border: 1px solid #050505;
}
.h-tl { top: -3px; left: -3px; }
.h-tr { top: -3px; right: -3px; }
.h-bl { bottom: -3px; left: -3px; }
.h-br { bottom: -3px; right: -3px; }

/* Property toast */
.toast-hero {
  position: absolute;
  z-index: 30;
  pointer-events: none;
  top: 0; left: 0;
  background: rgba(18, 18, 18, 0.95);
  border-radius: 6px;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  white-space: nowrap;
  opacity: 0;
}
.toast-hero-inner {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  font-family: var(--font-mono, 'DM Mono', monospace);
  font-size: 12px;
}
.toast-hero-prop { color: var(--color-muted, rgba(240,240,240,0.5)); }
.toast-hero-val  { color: var(--color-fg, #f0f0f0); font-weight: 700; }
.toast-hero-arrow { color: var(--color-muted, rgba(240,240,240,0.5)); }

/* ─── USER HOVER SELECTION (you-sel) ─────────────────────────── */
.you-sel {
  position: absolute;
  z-index: 22;
  pointer-events: none;
  opacity: 0;
  top: 0; left: 0;
  border: 1px dashed rgba(255, 255, 255, 0.4);
  background: rgba(255, 255, 255, 0.02);
  transition: border-color 0.15s;
}
.you-sel.is-dragging {
  border-color: rgba(255,255,255,0.8);
  border-style: solid;
}
.you-sel-lbl {
  position: absolute;
  top: -24px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--color-fg, #f0f0f0);
  color: var(--color-bg, #050505);
  font-family: var(--font-mono, 'DM Mono', monospace);
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  padding: 3px 8px;
  border-radius: 3px;
  white-space: nowrap;
}

/* ─── REDLINE MEASUREMENT ─────────────────────────────────────── */
.redline-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 24;
  opacity: 0;
}
.redline-svg line {
  stroke: #FF3366;
  stroke-width: 1;
  stroke-dasharray: 4 3;
}
.redline-pill {
  position: absolute;
  z-index: 28;
  pointer-events: none;
  background: #FF3366;
  color: #fff;
  font-family: var(--font-mono, 'DM Mono', monospace);
  font-size: 11px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 4px;
  white-space: nowrap;
  opacity: 0;
  top: 0; left: 0;
  transform: translate(-50%, -50%);
}

/* ─── MOBILE ─────────────────────────────────────────────────── */
@media (max-width: 768px) {
  .ac-hero, .asel-hero, .toast-hero, .you-sel, .redline-svg, .redline-pill { display: none; }
  .drag-text { font-size: clamp(4rem, 20vw, 7rem); cursor: default; }
  .hero-ic-eye { font-size: 9px; letter-spacing: 0.22em; white-space: normal; text-align: center; }
}
`

/* ────────────────────────────────────────────────────────────── */
/*  Component                                                     */
/* ────────────────────────────────────────────────────────────── */

export default function HeroSection({ subtitle, eyebrow }: HeroProps) {
  const artboardRef    = useRef<HTMLDivElement>(null)
  const eyebrowRef     = useRef<HTMLSpanElement>(null)
  const subRef         = useRef<HTMLSpanElement>(null)
  const dotGridRef     = useRef<HTMLDivElement>(null)
  const line1Ref       = useRef<HTMLDivElement>(null)
  const line2Ref       = useRef<HTMLDivElement>(null)

  // Andy cursor
  const acRef          = useRef<HTMLDivElement>(null)
  const commentRef     = useRef<HTMLDivElement>(null)

  // Andy selection box
  const aselRef        = useRef<HTMLDivElement>(null)
  const aselLblRef     = useRef<HTMLDivElement>(null)

  // Property toast
  const toastRef       = useRef<HTMLDivElement>(null)
  const toastPropRef   = useRef<HTMLSpanElement>(null)
  const toastValRef    = useRef<HTMLSpanElement>(null)

  // User hover selection box
  const youSelRef      = useRef<HTMLDivElement>(null)
  const youSelLblRef   = useRef<HTMLDivElement>(null)

  // Redline measurement
  const redlineSvgRef  = useRef<SVGSVGElement>(null)
  const redlineLineRef = useRef<SVGLineElement>(null)
  const redlinePillRef = useRef<HTMLDivElement>(null)

  /* ── scroll tilt on artboard ──────────────────────────────── */
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const artboard = artboardRef.current
    const frame    = artboard?.querySelector<HTMLElement>('.artboard-frame')
    if (!artboard) return

    gsap.set(artboard, { transformOrigin: '50% 50%' })

    // Artboard: only transform properties - all GPU composited, zero paint
    const tl = gsap.timeline({ defaults: { ease: 'none' } })
    tl.fromTo(artboard,
      { rotateX: 0, rotateZ: 0, scale: 1, yPercent: 0 },
      { rotateX: 45, rotateZ: -10, scale: 0.60, yPercent: -15 }
    )
    // Frame overlay: opacity only - also GPU composited
    if (frame) {
      tl.fromTo(frame, { opacity: 0 }, { opacity: 1 }, '<')
    }

    const st = ScrollTrigger.create({
      trigger: artboard.parentElement!,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1.2,
      animation: tl,
    })
    ScrollTrigger.refresh()
    return () => st.kill()
  }, [])

  /* ── hero-in text reveal ─────────────────────────────────── */
  useEffect(() => {
    const lines   = [line1Ref.current, line2Ref.current].filter(Boolean)
    const eyebrowEl = eyebrowRef.current
    const sub     = subRef.current
    const dotGrid = dotGridRef.current

    const run = () => {
      // Eyebrow tracks in from opacity 0
      if (eyebrowEl) gsap.to(eyebrowEl, { opacity: 1, duration: 0.7, delay: 0.1, ease: 'power2.out' })
      // Main name lines slide up
      gsap.to(lines, {
        translateY: '0%', duration: 1.0, stagger: 0.12, ease: 'power4.out', delay: 0.3,
        onComplete() {
          document.querySelectorAll<HTMLElement>('.mask-wrap').forEach(el => el.classList.add('revealed'))
        },
      })
      // Subtitle fades in
      if (sub) gsap.to(sub, { opacity: 1, duration: 0.6, delay: 0.85, ease: 'power2.out' })
      // Dot grid subtly fades in
      if (dotGrid) gsap.to(dotGrid, { opacity: 1, duration: 1.4, delay: 0.9, ease: 'power2.out' })
    }

    const onDone = () => run()
    window.addEventListener('preloader:done', onDone, { once: true })
    const fallback = setTimeout(run, 3000)
    return () => {
      window.removeEventListener('preloader:done', onDone)
      clearTimeout(fallback)
    }
  }, [])

  /* ── Drag interaction + Andy cursor system ───────────────── */
  useEffect(() => {
    const artboard   = artboardRef.current
    const ac         = acRef.current
    const comment    = commentRef.current
    const asel       = aselRef.current
    const aselLbl    = aselLblRef.current
    const toast      = toastRef.current
    const toastProp  = toastPropRef.current
    const toastVal   = toastValRef.current
    const youSel     = youSelRef.current
    const youSelLbl  = youSelLblRef.current
    const redlineSvg = redlineSvgRef.current
    const redlineLine= redlineLineRef.current
    const redlinePill= redlinePillRef.current

    if (!artboard || !ac || !comment || !asel || !aselLbl ||
        !toast || !toastProp || !toastVal ||
        !youSel || !youSelLbl || !redlineSvg || !redlineLine || !redlinePill) return

    // Mobile guard
    if (window.innerWidth <= 768) return

    /* ── Andy cursor smooth tracking ───────────────────────── */
    let curX = window.innerWidth + 200
    let curY = -100
    let targetX = curX
    let targetY = curY
    let rafId = 0
    let destroyed = false

    const moveCursor = (x: number, y: number) => {
      targetX = x
      targetY = y
    }

    const loop = () => {
      if (destroyed) return
      curX += (targetX - curX) * 0.08
      curY += (targetY - curY) * 0.08
      ac.style.transform = `translate3d(${curX}px, ${curY}px, 0)`
      rafId = requestAnimationFrame(loop)
    }
    rafId = requestAnimationFrame(loop)

    /* ── You-sel: follows hovered drag-text ─────────────────── */
    const dragEls = [line1Ref.current, line2Ref.current].filter(Boolean) as HTMLDivElement[]
    let hoveredEl: HTMLDivElement | null = null
    let draggingEl: HTMLDivElement | null = null
    // snapActive blocks drag during Andy's snap-back sequence
    let snapActive  = false

    /* ── You-sel: follows hovered / dragged element ─────────── */
    const updateYouSel = () => {
      const el = draggingEl || hoveredEl
      if (!el || !artboard) {
        gsap.to(youSel, { opacity: 0, duration: 0.2 })
        return
      }
      const ab  = artboard.getBoundingClientRect()
      const r   = el.getBoundingClientRect()
      const PAD = 4
      youSel.style.left   = `${r.left   - ab.left - PAD}px`
      youSel.style.top    = `${r.top    - ab.top  - PAD}px`
      youSel.style.width  = `${r.width  + PAD * 2}px`
      youSel.style.height = `${r.height + PAD * 2}px`
      gsap.to(youSel, { opacity: 1, duration: 0.15 })
      // hide label while dragging
      youSelLbl.style.opacity = draggingEl ? '0' : '1'
    }

    dragEls.forEach(el => { el.dataset.x = '0'; el.dataset.y = '0' })

    // Hover detection - always active (not blocked by loop)
    const onPointerMove = (e: PointerEvent) => {
      if (draggingEl) return
      const hit     = document.elementFromPoint(e.clientX, e.clientY)
      const matched = dragEls.find(el => el === hit || el.contains(hit))
      if (matched !== hoveredEl) {
        hoveredEl = matched ?? null
        if (hoveredEl) sound.hover()
        updateYouSel()
      }
    }
    const onPointerLeaveArtboard = () => {
      if (!draggingEl) { hoveredEl = null; updateYouSel() }
    }
    artboard.addEventListener('pointermove', onPointerMove)
    artboard.addEventListener('pointerleave', onPointerLeaveArtboard)

    /* ── Helpers ────────────────────────────────────────────── */
    let offsetX = 0, offsetY = 0, originCX = 0, originCY = 0
    const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms))

    const SNAP_MESSAGES = [
      "Let's keep this centered, please.",
      'bruhhh .. stop breaking my layout.',
      'Again? We just fixed this.',
      "I'm locking this layer. (Just kidding)",
    ]
    let msgIdx = 0

    const showToast = (prop: string, val: string) => {
      if (!toastProp || !toastVal || !toast || !ac) return
      const abR = artboard.getBoundingClientRect()
      toastProp.textContent = prop
      toastVal.textContent  = val
      toast.style.left = `${curX - abR.left + 24}px`
      toast.style.top  = `${curY - abR.top  - 32}px`
      gsap.killTweensOf(toast)
      gsap.fromTo(toast, { opacity: 0, y: 4 }, { opacity: 1, y: 0, duration: 0.3, ease: 'power3.out' })
      setTimeout(() => gsap.to(toast, { opacity: 0, duration: 0.3 }), 1800)
    }

    const positionAsel = (el: HTMLElement, label: string) => {
      if (!artboard || !asel || !aselLbl) return
      const ab = artboard.getBoundingClientRect()
      const r  = el.getBoundingClientRect()
      const P  = 4
      asel.style.left   = `${r.left   - ab.left - P}px`
      asel.style.top    = `${r.top    - ab.top  - P}px`
      asel.style.width  = `${r.width  + P * 2}px`
      asel.style.height = `${r.height + P * 2}px`
      aselLbl.textContent = label
    }

    /* ── Snap-back (plays after user drag, then loop resumes) ── */
    const snapBack = async (el: HTMLDivElement) => {
      if (!artboard || !ac || !asel || !comment) return
      snapActive = true

      gsap.to(ac, { opacity: 1, duration: 0.3 })
      const r  = el.getBoundingClientRect()
      const ab = artboard.getBoundingClientRect()
      moveCursor(r.left - ab.left + r.width / 2, r.top - ab.top + r.height / 2)

      await sleep(800);  if (destroyed) return

      positionAsel(el, 'Aligning to Grid...')
      gsap.to(asel, { opacity: 1, duration: 0.3 })
      gsap.to(el, {
        x: 0, y: 0, duration: 1.2, ease: 'power3.inOut',
        onUpdate() {
          el.dataset.x = String(gsap.getProperty(el, 'x'))
          el.dataset.y = String(gsap.getProperty(el, 'y'))
          const rr = el.getBoundingClientRect()
          const aa = artboard.getBoundingClientRect()
          moveCursor(rr.left - aa.left + rr.width / 2, rr.top - aa.top + rr.height / 2)
          positionAsel(el, 'Aligning to Grid...')
          updateYouSel()
        },
      })

      await sleep(1300);  if (destroyed) return

      gsap.to(asel, { opacity: 0, duration: 0.3 })
      sound.snap()

      const msg = SNAP_MESSAGES[msgIdx % SNAP_MESSAGES.length]
      msgIdx++
      comment.textContent = ''
      gsap.to(comment, { opacity: 1, duration: 0.3 })
      for (let i = 0; i <= msg.length; i++) {
        comment.textContent = msg.slice(0, i)
        await sleep(28 + Math.random() * 20)
        if (destroyed) return
      }

      await sleep(2000);  if (destroyed) return

      gsap.to(comment, { opacity: 0, duration: 0.4 })
      moveCursor(window.innerWidth + 200, -100)
      await sleep(1000);  if (destroyed) return
      gsap.to(ac, { opacity: 0, duration: 0.5 })

      snapActive = false
    }

    /* ── Drag mechanics ─────────────────────────────────────── */
    const onMouseDown = (el: HTMLDivElement) => (e: MouseEvent | TouchEvent) => {
      e.preventDefault()
      if (snapActive) return   // blocked during snap-back only
      draggingEl = el
      hoveredEl  = null
      el.classList.add('is-dragging')
      youSel.classList.add('is-dragging')
      document.body.classList.add('hero-dragging')
      gsap.killTweensOf(el)

      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
      offsetX = clientX - parseFloat(el.dataset.x || '0')
      offsetY = clientY - parseFloat(el.dataset.y || '0')
      el.style.zIndex = '20'
      sound.drag()

      const rr = el.getBoundingClientRect()
      const ab = artboard.getBoundingClientRect()
      originCX = rr.left - ab.left + rr.width  / 2 - parseFloat(el.dataset.x || '0')
      originCY = rr.top  - ab.top  + rr.height / 2 - parseFloat(el.dataset.y || '0')

      if (redlineSvg)  gsap.to(redlineSvg,  { opacity: 1, duration: 0.2 })
      if (redlinePill) gsap.to(redlinePill,  { opacity: 1, duration: 0.2 })
    }

    const onMouseMove = (e: MouseEvent | TouchEvent) => {
      if (!draggingEl || !artboard) return
      e.preventDefault?.()
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY
      const dx = clientX - offsetX
      const dy = clientY - offsetY

      draggingEl.dataset.x = String(dx)
      draggingEl.dataset.y = String(dy)
      draggingEl.style.transform = `translate3d(${dx}px, ${dy}px, 0)`
      updateYouSel()

      if (redlineLine && redlinePill) {
        const ab    = artboard.getBoundingClientRect()
        const rr    = draggingEl.getBoundingClientRect()
        const curCX = rr.left - ab.left + rr.width  / 2
        const curCY = rr.top  - ab.top  + rr.height / 2
        redlineLine.setAttribute('x1', String(originCX))
        redlineLine.setAttribute('y1', String(originCY))
        redlineLine.setAttribute('x2', String(curCX))
        redlineLine.setAttribute('y2', String(curCY))
        redlinePill.style.left = `${(originCX + curCX) / 2}px`
        redlinePill.style.top  = `${(originCY + curCY) / 2 - 15}px`
        redlinePill.textContent = `dx: ${Math.round(dx)}, dy: ${Math.round(dy)}`
      }
    }

    const onMouseUp = async () => {
      if (!draggingEl) return
      const el = draggingEl
      draggingEl = null
      el.classList.remove('is-dragging')
      youSel.classList.remove('is-dragging')
      document.body.classList.remove('hero-dragging')
      el.style.zIndex = '12'

      if (redlineSvg)  gsap.to(redlineSvg,  { opacity: 0, duration: 0.3 })
      if (redlinePill) gsap.to(redlinePill,  { opacity: 0, duration: 0.2 })

      const dx = parseFloat(el.dataset.x || '0')
      const dy = parseFloat(el.dataset.y || '0')
      if (dx !== 0 || dy !== 0) await snapBack(el)

      hoveredEl = null
      updateYouSel()
    }

    dragEls.forEach(el => {
      const down = onMouseDown(el)
      el.addEventListener('mousedown', down)
      el.addEventListener('touchstart', down as EventListener, { passive: true })
    })
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('touchmove', onMouseMove as EventListener, { passive: false })
    window.addEventListener('mouseup', onMouseUp)
    window.addEventListener('touchend', onMouseUp)

    /* ── Looping Figma inspection sequence ───────────────────── */
    // Runs forever. Pauses automatically when user is dragging or
    // snap-back is in progress. Each await is a safe interruption point.
    const runLoop = async () => {
      // Initial delay after preloader
      await sleep(1500)

      while (!destroyed) {
        // Wait if user is interacting
        while ((draggingEl || snapActive) && !destroyed) await sleep(80)
        if (destroyed) break

        const [first, second] = dragEls
        const sub = subRef.current

        // ── Step 1: Andy cursor appears → moves to first name ──
        gsap.to(ac, { opacity: 1, duration: 0.5 })
        if (first) {
          const r  = first.getBoundingClientRect()
          const ab = artboard.getBoundingClientRect()
          moveCursor(r.left - ab.left + r.width / 2, r.top - ab.top + r.height / 2)
        }
        await sleep(900);  if (destroyed || draggingEl || snapActive) { gsap.to(ac, { opacity: 0, duration: 0.3 }); continue }

        // ── Step 2: Select first name ──
        if (first) {
          positionAsel(first, 'h1 / First Name')
          gsap.to(asel, { opacity: 1, duration: 0.3 })
          showToast('tracking', '-0.04em')
        }
        await sleep(1200);  if (destroyed || draggingEl || snapActive) { gsap.to(asel, { opacity: 0, duration: 0.2 }); gsap.to(ac, { opacity: 0, duration: 0.3 }); continue }
        gsap.to(asel, { opacity: 0, duration: 0.3 })

        // ── Step 3: Move to second name ──
        if (second) {
          const r  = second.getBoundingClientRect()
          const ab = artboard.getBoundingClientRect()
          moveCursor(r.left - ab.left + r.width / 2, r.top - ab.top + r.height / 2)
        }
        await sleep(800);  if (destroyed || draggingEl || snapActive) { gsap.to(ac, { opacity: 0, duration: 0.3 }); continue }

        // ── Step 4: Select second name ──
        if (second) {
          positionAsel(second, 'h1 / Last Name')
          gsap.to(asel, { opacity: 1, duration: 0.3 })
          showToast('font-weight', '700')
        }
        await sleep(1200);  if (destroyed || draggingEl || snapActive) { gsap.to(asel, { opacity: 0, duration: 0.2 }); gsap.to(ac, { opacity: 0, duration: 0.3 }); continue }
        gsap.to(asel, { opacity: 0, duration: 0.3 })

        // ── Step 5: Move to subtitle ──
        if (sub) {
          const r  = sub.getBoundingClientRect()
          const ab = artboard.getBoundingClientRect()
          moveCursor(r.left - ab.left + r.width * 0.6, r.top - ab.top + r.height / 2)
          await sleep(700);  if (destroyed || draggingEl || snapActive) { gsap.to(ac, { opacity: 0, duration: 0.3 }); continue }

          positionAsel(sub, 'p / Subtitle')
          gsap.to(asel, { opacity: 1, duration: 0.3 })
          showToast('opacity', '0.42')
          await sleep(1000);  if (destroyed || draggingEl || snapActive) { gsap.to(asel, { opacity: 0, duration: 0.2 }); gsap.to(ac, { opacity: 0, duration: 0.3 }); continue }
          gsap.to(asel, { opacity: 0, duration: 0.3 })
        }

        // ── Step 6: Andy cursor exits ──
        moveCursor(window.innerWidth + 200, -100)
        await sleep(700);  if (destroyed) break
        gsap.to(ac, { opacity: 0, duration: 0.5 })

        // ── Pause between loops - also waits if user is dragging ──
        let pauseMs = 0
        while (pauseMs < 2800 && !destroyed) {
          await sleep(80)
          pauseMs += 80
          // Extend pause while drag/snap is active
          if (draggingEl || snapActive) pauseMs = 0
        }
      }
    }

    const startLoop = () => runLoop()
    window.addEventListener('preloader:done', startLoop, { once: true })
    const fallback = setTimeout(startLoop, 3500)

    return () => {
      destroyed = true
      cancelAnimationFrame(rafId)
      window.removeEventListener('preloader:done', startLoop)
      clearTimeout(fallback)
      artboard.removeEventListener('pointermove', onPointerMove)
      artboard.removeEventListener('pointerleave', onPointerLeaveArtboard)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('touchmove', onMouseMove as EventListener)
      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('touchend', onMouseUp)
    }
  }, [])

  // Sub-text: use DB value or reference-matching default
  const eyebrowText = eyebrow ?? 'NAVIGATING THE UNKNOWN, PIXEL BY PIXEL.'
  const tagline     = subtitle ?? 'Precision structure, bold creative vision.'

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <section className="camera-track" id="hero" aria-label="Hero">

        {/* ── Artboard ─────────────────────────────────────── */}
        <div ref={artboardRef} className="artboard">

          {/* Frame overlay - rounded corners + glow, fades in via opacity (no paint) */}
          <div className="artboard-frame" aria-hidden="true" />

          {/* Dot grid background */}
          <div ref={dotGridRef} className="hero-dot-grid" aria-hidden="true" />

          {/* Blue vignette */}
          <div className="hero-vignette" aria-hidden="true" />

          {/* ── Center content ──────────────────────────────── */}
          <div className="hero-ic">
            <div className="hero-ic-wrap" aria-label="Anurag Adhikari">

              {/* Eyebrow - tracked uppercase mono */}
              <span ref={eyebrowRef} className="hero-ic-eye" aria-label={eyebrowText}>
                {eyebrowText}
              </span>

              <div>
                <div className="mask-wrap">
                  <div ref={line1Ref} className="drag-text" aria-hidden="true" draggable={false}>ANURAG</div>
                </div>
              </div>
              <div>
                <div className="mask-wrap">
                  <div ref={line2Ref} className="drag-text outline" aria-hidden="true" draggable={false}>ADHIKARI</div>
                </div>
              </div>

              {/* Tagline */}
              <span ref={subRef} className="hero-ic-sub">
                {tagline}
              </span>
            </div>
          </div>

          {/* ── Figma overlays ──────────────────────────────── */}

          {/* Redline measurement SVG */}
          <svg ref={redlineSvgRef} className="redline-svg" aria-hidden="true">
            <line ref={redlineLineRef} x1="0" y1="0" x2="0" y2="0" />
          </svg>

          {/* dx/dy pill */}
          <div ref={redlinePillRef} className="redline-pill" aria-hidden="true" />

          {/* Andy cursor */}
          <div ref={acRef} className="ac-hero" aria-hidden="true">
            <svg width="16" height="20" viewBox="0 0 14 18" fill="none">
              <path d="M0.5 0.5L13 10.5H5.5L2.5 17.5L0.5 0.5Z" fill="#a78bfa" />
            </svg>
            <div className="ac-hero-tag">Anurag Adhikari</div>
            <div ref={commentRef} className="figma-comment" />
          </div>

          {/* Andy's selection box */}
          <div ref={aselRef} className="asel-hero" aria-hidden="true">
            <div ref={aselLblRef} className="asel-hero-lbl">h1 / Name</div>
            <div className="asel-hero-handle h-tl" />
            <div className="asel-hero-handle h-tr" />
            <div className="asel-hero-handle h-bl" />
            <div className="asel-hero-handle h-br" />
          </div>

          {/* Property toast */}
          <div ref={toastRef} className="toast-hero" aria-hidden="true">
            <div className="toast-hero-inner">
              <span ref={toastPropRef} className="toast-hero-prop">tracking</span>
              <span className="toast-hero-arrow">→</span>
              <span ref={toastValRef} className="toast-hero-val">-0.04em</span>
            </div>
          </div>

          {/* User hover selection box */}
          <div ref={youSelRef} className="you-sel" aria-hidden="true">
            <div ref={youSelLblRef} className="you-sel-lbl">Drag to move</div>
          </div>

        </div>
      </section>
    </>
  )
}
