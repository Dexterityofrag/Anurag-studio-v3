'use client'

import { useEffect, useRef, useState } from 'react'

/* ────────────────────────────────────────────────────────────── */
/*  Styles                                                        */
/* ────────────────────────────────────────────────────────────── */

const css = /* css */ `
.you-cur {
  position: fixed;
  top: 0;
  left: 0;
  z-index: var(--z-cursor, 10100);
  pointer-events: none;
  will-change: transform;
  display: flex;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}
.you-cur.on {
  opacity: 1;
}

/* ─── Arrow SVG ───────────────────────────────────────────────── */
.you-cur__arrow {
  display: block;
  width: 20px;
  height: 28px;
  filter: drop-shadow(0 1px 3px rgba(0,0,0,0.4));
  flex-shrink: 0;
}

/* ─── Contextual tag pill ─────────────────────────────────────── */
.you-tag {
  font-family: var(--font-mono, "DM Mono", monospace);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.04em;
  white-space: nowrap;
  background: var(--color-fg, #f0f0f0);
  color: var(--color-bg, #050505);
  padding: 3px 8px;
  border-radius: 3px;
  margin-left: 8px;
  opacity: 0;
  transition: opacity 0.2s ease;
}
.you-tag.on {
  opacity: 1;
}
`

/* ────────────────────────────────────────────────────────────── */
/*  Helpers                                                       */
/* ────────────────────────────────────────────────────────────── */

const TAG_MAP: Record<string, string> = {
  View:  'View →',
  Read:  'Read →',
  Open:  'Open →',
}

function getTagText(el: Element | null): string {
  let node = el
  while (node && node !== document.documentElement) {
    const attr = (node as HTMLElement).dataset?.cursor
    if (attr && TAG_MAP[attr]) return TAG_MAP[attr]
    node = (node as HTMLElement).parentElement
  }
  return ''
}

/* ────────────────────────────────────────────────────────────── */
/*  Component                                                     */
/* ────────────────────────────────────────────────────────────── */

export default function CustomCursor() {
  // Start as touch=true to suppress SSR render; flip on client mount
  const [isTouch, setIsTouch] = useState(true)
  const curRef  = useRef<HTMLDivElement>(null)
  const tagRef  = useRef<HTMLSpanElement>(null)
  const rafRef  = useRef<number>(0)
  const posRef  = useRef({ x: -100, y: -100 })
  const dirty   = useRef(false)

  // Touch detection - runs once on client
  useEffect(() => {
    if ('ontouchstart' in window) {
      document.body.classList.add('is-touch')
      setIsTouch(true)
    } else {
      setIsTouch(false)
    }
  }, [])

  // Core cursor logic - only for non-touch
  useEffect(() => {
    if (isTouch) return

    const cur = curRef.current
    const tag = tagRef.current
    if (!cur || !tag) return

    // RAF loop: apply pending position in one batch
    const flush = () => {
      if (dirty.current) {
        cur.style.transform = `translate3d(${posRef.current.x}px, ${posRef.current.y}px, 0)`
        dirty.current = false
      }
      rafRef.current = requestAnimationFrame(flush)
    }
    rafRef.current = requestAnimationFrame(flush)

    const onMove = (e: MouseEvent) => {
      posRef.current.x = e.clientX
      posRef.current.y = e.clientY
      dirty.current = true

      // Show cursor on first move
      if (!cur.classList.contains('on')) cur.classList.add('on')

      // Resolve tag from data-cursor attribute
      const text = getTagText(e.target as Element)
      if (tag.textContent !== text) tag.textContent = text
      tag.classList.toggle('on', text !== '')
    }

    const onLeave = () => cur.classList.remove('on')
    const onEnter = () => cur.classList.add('on')

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
      <div ref={curRef} className="you-cur" aria-hidden="true">
        {/* Classic up-left pointer arrow */}
        <svg
          className="you-cur__arrow"
          viewBox="0 0 20 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M2 2L2 22L7.5 16.5L11.5 26L14.5 24.5L10.5 15H18L2 2Z"
            fill="white"
          />
        </svg>
        <span ref={tagRef} className="you-tag" />
      </div>
    </>
  )
}
