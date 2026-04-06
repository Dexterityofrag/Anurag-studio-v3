'use client'

import { useEffect, useRef, useState } from 'react'

/* ────────────────────────────────────────────────────────────── */
/*  Styles                                                        */
/* ────────────────────────────────────────────────────────────── */

const css = /* css */ `
/* ── Outer ring ── */
.cc-outer {
  position: fixed;
  top: 0; left: 0;
  width: 36px; height: 36px;
  border-radius: 50%;
  background: transparent;
  border: 1.5px solid rgba(240,237,232,0.7);
  pointer-events: none;
  z-index: var(--z-cursor, 10100);
  will-change: transform;
  transform: translate3d(-100px, -100px, 0) translate(-50%, -50%) scale(0);
  transition: transform 0.55s cubic-bezier(0.23, 1, 0.32, 1),
              opacity 0.3s ease,
              width 0.3s ease,
              height 0.3s ease,
              border-color 0.3s ease;
  opacity: 0;
}
.cc-outer.on {
  opacity: 1;
}
/* Expand on hover */
.cc-outer.hover {
  transform: translate3d(var(--cx,0), var(--cy,0), 0) translate(-50%, -50%) scale(1);
  width: 52px; height: 52px;
  border-color: var(--color-accent, #00FF94);
}
.cc-outer.idle {
  transform: translate3d(var(--cx,0), var(--cy,0), 0) translate(-50%, -50%) scale(1);
}

/* ── Inner neon dot ── */
.cc-dot {
  position: fixed;
  top: 0; left: 0;
  width: 7px; height: 7px;
  border-radius: 50%;
  background: var(--color-accent, #00FF94);
  pointer-events: none;
  z-index: calc(var(--z-cursor, 10100) + 1);
  will-change: transform;
  transform: translate3d(-100px, -100px, 0) translate(-50%, -50%);
  opacity: 0;
  transition: opacity 0.3s ease, width 0.2s ease, height 0.2s ease;
  box-shadow: 0 0 10px rgba(0,255,148,0.7);
}
.cc-dot.on {
  opacity: 1;
}
/* Dot shrinks when hovering (big ring takes over) */
.cc-dot.hover {
  width: 4px;
  height: 4px;
  opacity: 0.5;
}

/* ── Contextual label ── */
.cc-label {
  position: fixed;
  top: 0; left: 0;
  pointer-events: none;
  z-index: calc(var(--z-cursor, 10100) + 2);
  font-family: var(--font-mono, "JetBrains Mono", monospace);
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-bg, #060606);
  white-space: nowrap;
  opacity: 0;
  transform: translate3d(-200px, -200px, 0) translate(-50%, 38px);
  transition: opacity 0.2s ease;
  mix-blend-mode: normal;
}
.cc-label.on {
  opacity: 1;
}
`

/* ────────────────────────────────────────────────────────────── */
/*  Tag mapping                                                   */
/* ────────────────────────────────────────────────────────────── */

const TAG_MAP: Record<string, string> = {
  View: 'View',
  Read: 'Read',
  Open: 'Open',
  Drag: 'Drag',
}

function getCursorTag(el: Element | null): string {
  let node = el
  while (node && node !== document.documentElement) {
    const attr = (node as HTMLElement).dataset?.cursor
    if (attr && TAG_MAP[attr]) return TAG_MAP[attr]
    // Treat all interactive elements as hoverable
    const tag = (node as HTMLElement).tagName?.toLowerCase()
    if (['a', 'button'].includes(tag)) return ''
    node = (node as HTMLElement).parentElement
  }
  return ''
}

function isInteractive(el: Element | null): boolean {
  let node = el
  while (node && node !== document.documentElement) {
    const tag = (node as HTMLElement).tagName?.toLowerCase()
    const role = (node as HTMLElement).getAttribute?.('role')
    if (['a', 'button', 'input', 'select', 'textarea'].includes(tag)) return true
    if (role === 'button' || role === 'link') return true
    if ((node as HTMLElement).dataset?.cursor) return true
    // common card class names
    const cls = (node as HTMLElement).className || ''
    if (typeof cls === 'string' && (cls.includes('card') || cls.includes('btn') || cls.includes('link'))) return true
    node = (node as HTMLElement).parentElement
  }
  return false
}

/* ────────────────────────────────────────────────────────────── */
/*  Component                                                     */
/* ────────────────────────────────────────────────────────────── */

export default function CustomCursor() {
  const [isTouch, setIsTouch] = useState(true)
  const outerRef = useRef<HTMLDivElement>(null)
  const dotRef   = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLSpanElement>(null)
  const rafRef   = useRef<number>(0)
  const posRef   = useRef({ x: -200, y: -200 })
  const dirty    = useRef(false)

  useEffect(() => {
    if ('ontouchstart' in window) {
      document.body.classList.add('is-touch')
      setIsTouch(true)
    } else {
      setIsTouch(false)
    }
  }, [])

  useEffect(() => {
    if (isTouch) return

    const outer = outerRef.current
    const dot   = dotRef.current
    const label = labelRef.current
    if (!outer || !dot || !label) return

    /* RAF loop - move both elements together */
    const flush = () => {
      if (dirty.current) {
        const { x, y } = posRef.current
        const tx = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`
        dot.style.transform = tx
        label.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, 38px)`
        // outer uses CSS var so scale transition works on top
        outer.style.setProperty('--cx', x + 'px')
        outer.style.setProperty('--cy', y + 'px')
        dirty.current = false
      }
      rafRef.current = requestAnimationFrame(flush)
    }
    rafRef.current = requestAnimationFrame(flush)

    const onMove = (e: MouseEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY }
      dirty.current = true

      outer.classList.add('on')
      dot.classList.add('on')

      const hovering = isInteractive(e.target as Element)
      outer.classList.toggle('hover', hovering)
      outer.classList.toggle('idle', !hovering)
      dot.classList.toggle('hover', hovering)

      const tagText = getCursorTag(e.target as Element)
      if (label.textContent !== tagText) label.textContent = tagText
      label.classList.toggle('on', tagText !== '' && hovering)
    }

    const onLeave = () => {
      outer.classList.remove('on')
      dot.classList.remove('on')
      label.classList.remove('on')
    }
    const onEnter = () => {
      outer.classList.add('on')
      dot.classList.add('on')
    }

    document.addEventListener('mousemove', onMove, { passive: true })
    document.addEventListener('mouseleave', onLeave)
    document.addEventListener('mouseenter', onEnter)

    return () => {
      cancelAnimationFrame(rafRef.current)
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseleave', onLeave)
      document.removeEventListener('mouseenter', onEnter)
    }
  }, [isTouch])

  if (isTouch) return null

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div ref={outerRef} className="cc-outer" aria-hidden="true" />
      <div ref={dotRef}   className="cc-dot"   aria-hidden="true" />
      <span ref={labelRef} className="cc-label" aria-hidden="true" />
    </>
  )
}
