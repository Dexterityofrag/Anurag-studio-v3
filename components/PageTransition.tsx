'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import gsap from 'gsap'

/* ────────────────────────────────────────────────────────────── */
/*  Styles                                                        */
/* ────────────────────────────────────────────────────────────── */

const css = /* css */ `
.sel-transition {
  position: fixed;
  inset: 0;
  z-index: var(--z-transition, 7000);
  pointer-events: none;
  opacity: 0;
}

.sel-blur {
  position: absolute;
  inset: 0;
}

.sel-box {
  position: absolute;
  border: 1.5px solid #00FF94;
  border-radius: 2px;
  opacity: 0;
  /* Start as a small centered square */
  width: 0;
  height: 0;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

.sel-label {
  position: absolute;
  top: -22px;
  left: 0;
  background: #00FF94;
  color: #000;
  font-family: var(--font-mono, "JetBrains Mono", monospace);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: 2px;
  white-space: nowrap;
}

.sel-handle {
  position: absolute;
  width: 7px;
  height: 7px;
  background: #00FF94;
  border-radius: 1px;
}
.h-tl { top: -3px; left: -3px; }
.h-tr { top: -3px; right: -3px; }
.h-bl { bottom: -3px; left: -3px; }
.h-br { bottom: -3px; right: -3px; }

.sel-dims {
  position: absolute;
  bottom: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-family: var(--font-mono, "JetBrains Mono", monospace);
  font-size: 9px;
  color: #00FF94;
  white-space: nowrap;
  letter-spacing: 0.04em;
}

.sel-flash {
  position: absolute;
  inset: 0;
  background: #00FF94;
  opacity: 0;
}
`

/* ────────────────────────────────────────────────────────────── */
/*  Component                                                     */
/* ────────────────────────────────────────────────────────────── */

export default function PageTransition() {
  const pathname   = usePathname()
  const wrapRef    = useRef<HTMLDivElement>(null)
  const blurRef    = useRef<HTMLDivElement>(null)
  const boxRef     = useRef<HTMLDivElement>(null)
  const dimsRef    = useRef<HTMLDivElement>(null)
  const flashRef   = useRef<HTMLDivElement>(null)
  const isFirstRef = useRef(true)

  useEffect(() => {
    // Skip the very first render (initial page load - preloader handles that)
    if (isFirstRef.current) {
      isFirstRef.current = false
      return
    }

    const wrap  = wrapRef.current
    const blur  = blurRef.current
    const box   = boxRef.current
    const dims  = dimsRef.current
    const flash = flashRef.current
    if (!wrap || !blur || !box || !dims || !flash) return

    // Set dims text
    dims.textContent = `${window.innerWidth}×${window.innerHeight}`

    // Reset box position to center
    gsap.set(box, {
      width: 0,
      height: 0,
      left: '50%',
      top: '50%',
      xPercent: -50,
      yPercent: -50,
      opacity: 0,
    })

    const tl = gsap.timeline()

    // ── ENTER: selection expands to fill screen
    tl.to(wrap, { opacity: 1, duration: 0 })
      .to(box, {
        opacity: 1,
        width: '100vw',
        height: '100vh',
        left: 0,
        top: 0,
        xPercent: 0,
        yPercent: 0,
        duration: 0.5,
        ease: 'power3.out',
      })
      .to(blur, {
        backdropFilter: 'blur(8px) brightness(0.7)',
        WebkitBackdropFilter: 'blur(8px) brightness(0.7)',
        duration: 0.4,
      }, '<')
      .to(flash, { opacity: 0.12, duration: 0.1, yoyo: true, repeat: 1 })

    // ── EXIT: selection collapses upward then wrapper fades
    tl.to(box, {
        scaleY: 0,
        opacity: 0,
        duration: 0.4,
        ease: 'power3.inOut',
        transformOrigin: 'top center',
      })
      .to(blur, {
        backdropFilter: 'blur(0px) brightness(1)',
        WebkitBackdropFilter: 'blur(0px) brightness(1)',
        duration: 0.3,
      }, '<')
      .to(wrap, { opacity: 0, duration: 0.2 })
      // Reset scaleY for next use
      .set(box, { scaleY: 1 })

    return () => { tl.kill() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div ref={wrapRef} className="sel-transition" aria-hidden="true">
        <div ref={blurRef} className="sel-blur" />
        <div ref={boxRef} className="sel-box">
          <div className="sel-label">NAVIGATING</div>
          <span className="sel-handle h-tl" />
          <span className="sel-handle h-tr" />
          <span className="sel-handle h-bl" />
          <span className="sel-handle h-br" />
          <div ref={dimsRef} className="sel-dims" />
        </div>
        <div ref={flashRef} className="sel-flash" />
      </div>
    </>
  )
}
