'use client'

/* ─────────────────────────────────────────────────────────────────
   useMagnetic  — vanilla CSS-variable spring, no framer-motion
   ─────────────────────────────────────────────────────────────────
   Sets --mx / --my CSS custom properties directly on the element.
   Pair the target element with:
     transform: translate(var(--mx, 0px), var(--my, 0px));
     transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);

   All animation cost lives in the CSS compositor thread —
   zero JS executes per animation frame.
   ───────────────────────────────────────────────────────────────── */

import { useRef, useCallback, useEffect } from 'react'

export interface MagneticResult {
  ref: React.RefObject<HTMLElement | null>
}

const RADIUS = 72
const PULL   = 0.38

export function useMagnetic(): MagneticResult {
  const ref = useRef<HTMLElement | null>(null)

  const set = useCallback((x: number, y: number) => {
    const el = ref.current
    if (!el) return
    el.style.setProperty('--mx', `${x.toFixed(1)}px`)
    el.style.setProperty('--my', `${y.toFixed(1)}px`)
  }, [])

  const handleMove = useCallback((e: MouseEvent) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const cx   = rect.left + rect.width  / 2
    const cy   = rect.top  + rect.height / 2
    const dx   = e.clientX - cx
    const dy   = e.clientY - cy
    const dist = Math.sqrt(dx * dx + dy * dy)

    if (dist < RADIUS) {
      const pull = (1 - dist / RADIUS) * PULL
      set(dx * pull, dy * pull)
    } else {
      set(0, 0)
    }
  }, [set])

  const handleLeave = useCallback(() => set(0, 0), [set])

  useEffect(() => {
    window.addEventListener('mousemove', handleMove, { passive: true })
    window.addEventListener('mouseleave', handleLeave)
    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseleave', handleLeave)
    }
  }, [handleMove, handleLeave])

  return { ref }
}
