'use client'

import { useRef, useEffect } from 'react'
import gsap from 'gsap'

/* ────────────────────────────────────────────────────────────── */
/*  Styles                                                        */
/* ────────────────────────────────────────────────────────────── */

const css = /* css */ `
.pl {
  position: fixed;
  inset: 0;
  z-index: var(--z-loader, 6000);
  background: var(--color-bg, #050505);
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  padding: 40px;
  /* exit: slide up */
  transition: transform 0.7s cubic-bezier(0.76, 0, 0.24, 1);
}

.pl--hidden {
  transform: translateY(-100%);
  pointer-events: none;
}

.pl__counter {
  font-family: var(--font-display, "Space Grotesk", sans-serif);
  font-size: clamp(4rem, 8vw, 8rem);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  color: var(--color-fg, #f0f0f0);
  user-select: none;
}
`

/* ────────────────────────────────────────────────────────────── */
/*  Component                                                     */
/* ────────────────────────────────────────────────────────────── */

export default function Preloader() {
  const overlayRef = useRef<HTMLDivElement | null>(null)
  const counterRef = useRef<HTMLSpanElement | null>(null)

  useEffect(() => {
    const overlay = overlayRef.current
    const counter = counterRef.current
    if (!overlay || !counter) return

    // Respect reduced-motion preference
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (reduced) {
      counter.textContent = '100'
      overlay.classList.add('pl--hidden')
      window.dispatchEvent(new CustomEvent('preloader:done'))
      return
    }

    // GSAP tween: 0 → 100
    const obj = { val: 0 }
    const tween = gsap.to(obj, {
      val: 100,
      duration: 2.2,
      ease: 'power2.inOut',
      onUpdate() {
        counter.textContent = String(Math.round(obj.val))
      },
      onComplete() {
        // Slide the overlay upward off-screen
        overlay.classList.add('pl--hidden')

        // After transition ends, fire event and clean up
        const onEnd = () => {
          overlay.removeEventListener('transitionend', onEnd)
          window.dispatchEvent(new CustomEvent('preloader:done'))
        }
        overlay.addEventListener('transitionend', onEnd, { once: true })
      },
    })

    return () => {
      tween.kill()
    }
  }, [])

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div ref={overlayRef} className="pl" aria-hidden="true">
        <span ref={counterRef} className="pl__counter">0</span>
      </div>
    </>
  )
}
