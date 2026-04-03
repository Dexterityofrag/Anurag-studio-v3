'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/* ─────────────────────────────────────────────────────────────── */
/*  Panel data                                                      */
/* ─────────────────────────────────────────────────────────────── */

interface PanelDef {
  num: string
  layerChip: string
  propChips: [string, string]
  fullHtml: string
  emWord: string
}

const PANELS: PanelDef[] = [
  {
    num: '01',
    layerChip: 'p / Statement 01',
    propChips: ['span / Co...', 'color → #C8FF00'],
    fullHtml: 'I design for those who crave experiences that are <em>unforgettable</em>',
    emWord: 'unforgettable',
  },
  {
    num: '02',
    layerChip: 'p / Statement 02',
    propChips: ['span / Co...', 'alignment → center'],
    fullHtml: "I don't just deliver design. I deliver <em>outcomes</em>",
    emWord: 'outcomes',
  },
  {
    num: '03',
    layerChip: 'p / Statement 03',
    propChips: ['p / text', 'font-weight → 700'],
    fullHtml: 'Every pixel is a decision. Every decision is <em>intentional</em>',
    emWord: 'intentional',
  },
]

/* ─────────────────────────────────────────────────────────────── */
/*  CSS                                                             */
/* ─────────────────────────────────────────────────────────────── */

const css = /* css */ `
/* ─── LAYOUT ─────────────────────────────────────────────────── */
/*
 * 500vh total:
 *   0→100vh   = un-tilt phase (Phase 1)
 *   100→400vh = 3-panel typewriter (Phase 2)
 *   400→500vh = end buffer so 'bottom bottom' fires at 400vh scroll
 */
.intro-panels {
  position: relative;
  height: 500vh;
  background: #000;
  /* Same perspective as .camera-track in HeroSection */
  perspective: 1100px;
  perspective-origin: 50% 0%;
}

/* ─── STICKY VIEWPORT ─────────────────────────────────────────── */
.intro-pin {
  position: sticky;
  top: 0;
  height: 100vh;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  /* 3D tile matching hero end state */
  transform-style: preserve-3d;
  will-change: transform;
  background: #000;
  /* Border is tweened from hero border to none */
  border: 0px solid rgba(255, 255, 255, 0);
}

/* ─── DOT GRID TEXTURE (matches hero) ───────────────────────── */
.ip-dot-grid {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
  background-image: radial-gradient(circle, rgba(255,255,255,0.18) 1px, transparent 1px);
  background-size: 30px 30px;
  /* Always visible - same as hero */
  opacity: 1;
}

/* ─── GLOW FRAME OVERLAY (matches artboard-frame on hero) ───── */
.ip-frame {
  position: absolute;
  inset: 0;
  border-radius: 18px;
  box-shadow:
    rgba(0,0,0,0.85) 0px 40px 100px,
    rgba(166,139,249,0.55) 0px 0px 0px 1.5px;
  pointer-events: none;
  z-index: 50;
  will-change: opacity;
  /* Always visible from start, fades out as tile goes full-screen */
  opacity: 1;
}

/* ─── CORNER ACCENT MARKS ────────────────────────────────────── */
/* L-shaped corner brackets - same accent colour as hero selection handles */
.ip-corners {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 51;
  /* Always visible */
  opacity: 1;
}
.ip-corner {
  position: absolute;
  width: 20px;
  height: 20px;
  border-color: var(--accent, #C8FF00);
  border-style: solid;
}
.ip-corner.tl { top: 12px; left: 12px; border-width: 2px 0 0 2px; border-radius: 3px 0 0 0; }
.ip-corner.tr { top: 12px; right: 12px; border-width: 2px 2px 0 0; border-radius: 0 3px 0 0; }
.ip-corner.bl { bottom: 12px; left: 12px; border-width: 0 0 2px 2px; border-radius: 0 0 0 3px; }
.ip-corner.br { bottom: 12px; right: 12px; border-width: 0 2px 2px 0; border-radius: 0 0 3px 0; }

/* ─── PANEL SHELL ─────────────────────────────────────────────── */
.ip-panel {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  pointer-events: none;
  z-index: 10;
}

/* ─── STAGE (centered column) ────────────────────────────────── */
.ip-stage {
  position: relative;
  width: 640px;
  max-width: 90vw;
}

/* ─── PANEL NUMBER ────────────────────────────────────────────── */
.ip-num {
  font-family: var(--font-mono, 'DM Mono', monospace);
  font-size: 13px;
  color: var(--accent, #C8FF00);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 16px;
  opacity: 0;
}

/* ─── PROPERTY CHIPS ROW ──────────────────────────────────────── */
.ip-props {
  display: flex;
  gap: 6px;
  margin-bottom: 8px;
  opacity: 0;
}
.ip-prop-chip {
  background: rgba(167,139,250,0.15);
  border: 1px solid rgba(167,139,250,0.3);
  color: #a78bfa;
  font-family: var(--font-mono, 'DM Mono', monospace);
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 3px;
  white-space: nowrap;
}

/* ─── SELECTION BOX ───────────────────────────────────────────── */
.ip-sel {
  border: 1.5px solid #a78bfa;
  position: relative;
  padding: 20px 24px;
  opacity: 0;
}

/* ─── LAYER CHIP (top-left of selection box) ─────────────────── */
.ip-layer-chip {
  position: absolute;
  top: -24px;
  left: 0;
  background: #a78bfa;
  color: #000;
  font-family: var(--font-mono, 'DM Mono', monospace);
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 3px 3px 0 0;
  white-space: nowrap;
  opacity: 0;
}

/* ─── TYPEWRITER TEXT ─────────────────────────────────────────── */
.ip-text {
  font-family: var(--font-display, 'Space Grotesk', sans-serif);
  font-size: clamp(1.6rem, 3vw, 2.5rem);
  font-weight: 500;
  color: var(--color-fg, #f0f0f0);
  line-height: 1.4;
}
.ip-text em {
  color: var(--accent, #C8FF00);
  font-style: italic;
}

/* ─── BLINKING CARET ─────────────────────────────────────────── */
.ip-cursor {
  display: inline-block;
  width: 2px;
  height: 1em;
  background: currentColor;
  vertical-align: middle;
  margin-left: 2px;
  animation: ip-blink 0.8s step-end infinite;
}
@keyframes ip-blink { 50% { opacity: 0; } }

/* ─── STATUS LABEL ────────────────────────────────────────────── */
.ip-status {
  position: absolute;
  bottom: -22px;
  right: 0;
  font-family: var(--font-mono, 'DM Mono', monospace);
  font-size: 11px;
  color: rgba(255,255,255,0.35);
  opacity: 0;
  white-space: nowrap;
}

/* ─── ANDY CURSOR ─────────────────────────────────────────────── */
.ip-ac {
  position: absolute;
  bottom: -48px;
  right: -80px;
  display: flex;
  align-items: flex-start;
  gap: 6px;
  opacity: 0;
  pointer-events: none;
}
.ip-ac-tag {
  background: #a78bfa;
  color: #000;
  font-family: var(--font-mono, 'DM Mono', monospace);
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 3px;
  white-space: nowrap;
}

/* ─── PANEL-NUMBER FLOATER (visible during un-tilt) ─────────── */
.ip-untilt-num {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -200%);
  font-family: var(--font-mono, 'DM Mono', monospace);
  font-size: 13px;
  color: var(--accent, #C8FF00);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  /* Always visible from the start */
  opacity: 1;
  pointer-events: none;
  z-index: 52;
}

@media (max-width: 768px) {
  .intro-panels {
    /* Simpler on mobile - skip perspective, just fade */
    perspective: none;
    height: 400vh;
  }
  .intro-pin {
    transform: none !important;
    transform-style: flat;
  }
  .ip-stage { width: 100%; }
  .ip-panel { padding: 0 24px; }
  .ip-ac { right: -20px; bottom: -60px; }
  .ip-corners, .ip-frame { display: none; }
}
`

/* ─────────────────────────────────────────────────────────────── */
/*  Andy cursor SVG                                               */
/* ─────────────────────────────────────────────────────────────── */

const CursorSVG = () => (
  <svg width="18" height="24" viewBox="0 0 18 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M0.5 0.5L0.5 18.5L4.5 14.5L7.5 21.5L9.5 20.5L6.5 13.5L12.5 13.5L0.5 0.5Z"
      fill="#a78bfa"
      stroke="#a78bfa"
      strokeWidth="0.5"
    />
  </svg>
)

/* ─────────────────────────────────────────────────────────────── */
/*  Per-panel ref type                                             */
/* ─────────────────────────────────────────────────────────────── */

interface PanelRefs {
  panel: HTMLDivElement | null
  num: HTMLParagraphElement | null
  props: HTMLDivElement | null
  layerChip: HTMLSpanElement | null
  sel: HTMLDivElement | null
  status: HTMLSpanElement | null
  ac: HTMLDivElement | null
  text: HTMLParagraphElement | null
}

/* ─────────────────────────────────────────────────────────────── */
/*  Component                                                      */
/* ─────────────────────────────────────────────────────────────── */

export default function IntroPanels() {
  const wrapperRef    = useRef<HTMLDivElement>(null)
  const introPinRef   = useRef<HTMLDivElement>(null)
  const untiltNumRef  = useRef<HTMLDivElement>(null)
  const panelRefs     = useRef<PanelRefs[]>(
    PANELS.map(() => ({
      panel: null, num: null, props: null,
      layerChip: null, sel: null, status: null,
      ac: null, text: null,
    }))
  )

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const wrapper   = wrapperRef.current
    const introPin  = introPinRef.current
    const untiltNum = untiltNumRef.current
    if (!wrapper || !introPin) return

    const refs = panelRefs.current

    /* ── Mobile: skip the 3D tilt, simpler scroll ────────────── */
    const isMobile = window.innerWidth <= 768

    /* ── Phase 1: Un-tilt  (0→100vh of scroll = first 20% of 500vh) ─── */
    /* intro-pin starts in SAME state as hero artboard ends: rotateX -18, scale 0.66 */
    gsap.set(introPin, {
      transformOrigin: '50% 50%',
      rotateX: isMobile ? 0 : -18,
      scale: isMobile ? 1 : 0.66,
      borderRadius: isMobile ? '0px' : '18px',
      border: isMobile ? '0px solid rgba(255,255,255,0)' : '1px solid rgba(255,255,255,0.08)',
      boxShadow: isMobile ? 'none' : '0 80px 140px rgba(0,0,0,0.9)',
    })

    /* "01" is visible from the very start - opacity is 1 in CSS */
    /* We only need to fade it out as the tile reaches full-screen */
    const ipFrame   = introPin.querySelector<HTMLElement>('.ip-frame')
    const ipCorners = introPin.querySelector<HTMLElement>('.ip-corners')

    let untiltST: ScrollTrigger | null = null

    if (!isMobile) {
      const untiltAnim = gsap.fromTo(introPin,
        {
          rotateX: -18,
          scale: 0.66,
          borderRadius: '18px',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 80px 140px rgba(0,0,0,0.9)',
        },
        {
          rotateX: 0,
          scale: 1,
          borderRadius: '0px',
          border: '0px solid rgba(255,255,255,0)',
          boxShadow: 'none',
          ease: 'none',
        }
      )

      untiltST = ScrollTrigger.create({
        trigger: wrapper,
        start: 'top top',
        end: '20% top',   // 20% of 500vh = 100vh scrolled
        scrub: 1.2,
        animation: untiltAnim,
        onUpdate(self) {
          // Fade out "01", frame glow, and corner accents near the very end
          // They stay visible until ~85% of the un-tilt is done
          const keepVisible = self.progress < 0.88
          const targetOpacity = keepVisible ? 1 : 0
          if (untiltNum)  gsap.to(untiltNum,  { opacity: targetOpacity, duration: 0.12, overwrite: true })
          if (ipFrame)    gsap.to(ipFrame,    { opacity: targetOpacity, duration: 0.12, overwrite: true })
          if (ipCorners)  gsap.to(ipCorners,  { opacity: targetOpacity, duration: 0.12, overwrite: true })
        },
      })
    }

    /* ── Phase 2: 3-panel typewriter scrub (100→400vh of scroll) ─── */
    /*   start: 20% top  = same as Phase 1 end (100vh scrolled)       */
    /*   end:   bottom bottom = 500vh wrapper → fires at 400vh scroll  */
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: wrapper,
        start: isMobile ? 'top top' : '20% top',
        end: 'bottom bottom',
        scrub: 1,
      },
    })

    // Each panel gets 1 unit in a 3-unit timeline
    PANELS.forEach((panel, i) => {
      const r = refs[i]
      if (!r.panel || !r.text) return
      const base = i  // panel 0 → 0, panel 1 → 1, panel 2 → 2
      const plain = panel.fullHtml.replace(/<[^>]+>/g, '')

      // Reset all to hidden initially
      gsap.set(r.panel, { opacity: 0 })
      gsap.set([r.num, r.props, r.layerChip, r.sel, r.status, r.ac], { opacity: 0 })
      r.text.innerHTML = '<span class="ip-cursor"></span>'

      // ── FADE IN panel shell ──
      tl.to(r.panel, { opacity: 1, duration: 0.02 }, base)

      // ── Figma UI stagger (0% → 10% of panel range = 0.1 units) ──
      tl.to(r.num,       { opacity: 1, duration: 0.02 }, base)
      tl.to(r.props,     { opacity: 1, duration: 0.02 }, base + 0.02)
      tl.to(r.layerChip, { opacity: 1, duration: 0.02 }, base + 0.04)
      tl.to(r.sel,       { opacity: 1, duration: 0.02 }, base + 0.04)
      tl.to(r.status,    { opacity: 1, duration: 0.02 }, base + 0.06)
      tl.to(r.ac,        { opacity: 1, duration: 0.02 }, base + 0.07)

      // ── SCROLL-DRIVEN TYPEWRITER (10% → 85% of panel = 0.75 units) ──
      const charObj = { n: 0 }
      tl.to(charObj, {
        n: plain.length,
        duration: 0.75,
        ease: 'none',
        onUpdate() {
          const count = Math.round(charObj.n)
          const typed = plain.slice(0, count)
          const html = typed.includes(panel.emWord)
            ? typed.replace(panel.emWord, `<em>${panel.emWord}</em>`)
            : typed
          r.text!.innerHTML = html + '<span class="ip-cursor"></span>'
        },
      }, base + 0.10)

      // ── FADE OUT sub-elements, then panel ──
      tl.to([r.num, r.props, r.layerChip, r.sel, r.status, r.ac], {
        opacity: 0, duration: 0.05, stagger: 0.005,
      }, base + 0.90)
      tl.to(r.panel, { opacity: 0, duration: 0.05, ease: 'power1.inOut' }, base + 0.92)
    })

    // Pad end so last panel holds visible
    tl.to({}, { duration: 0.08 }, 2.92)

    return () => {
      untiltST?.kill()
      tl.scrollTrigger?.kill()
      tl.kill()
    }
  }, [])

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <div ref={wrapperRef} className="intro-panels" aria-label="Introduction">
        <div ref={introPinRef} className="intro-pin">

          {/* Dot-grid texture - always visible, matches hero */}
          <div className="ip-dot-grid" aria-hidden="true" />

          {/* Glow frame overlay - fades out as tile expands to full-screen */}
          <div className="ip-frame" aria-hidden="true" />

          {/* Corner accents - visible from start, fade near full-screen */}
          <div className="ip-corners" aria-hidden="true">
            <div className="ip-corner tl" />
            <div className="ip-corner tr" />
            <div className="ip-corner bl" />
            <div className="ip-corner br" />
          </div>

          {/* "01" number - visible from start, fades near full-screen */}
          <div ref={untiltNumRef} className="ip-untilt-num" aria-hidden="true">01</div>

          {PANELS.map((p, i) => (
            <div
              key={i}
              ref={(el) => { panelRefs.current[i].panel = el }}
              className="ip-panel"
            >
              <div className="ip-stage">
                {/* Panel number */}
                <p
                  ref={(el) => { panelRefs.current[i].num = el }}
                  className="ip-num"
                >
                  {p.num}
                </p>

                {/* Property chips */}
                <div
                  ref={(el) => { panelRefs.current[i].props = el }}
                  className="ip-props"
                >
                  <span className="ip-prop-chip">{p.propChips[0]}</span>
                  <span className="ip-prop-chip">{p.propChips[1]}</span>
                </div>

                {/* Selection box */}
                <div
                  ref={(el) => { panelRefs.current[i].sel = el }}
                  className="ip-sel"
                >
                  {/* Layer path chip - sits above selection border */}
                  <span
                    ref={(el) => { panelRefs.current[i].layerChip = el }}
                    className="ip-layer-chip"
                  >
                    {p.layerChip}
                  </span>

                  {/* Typewriter text */}
                  <p
                    ref={(el) => { panelRefs.current[i].text = el }}
                    className="ip-text"
                  />

                  {/* Status label */}
                  <span
                    ref={(el) => { panelRefs.current[i].status = el }}
                    className="ip-status"
                  >
                    content → editing...
                  </span>
                </div>

                {/* Anurag cursor */}
                <div
                  ref={(el) => { panelRefs.current[i].ac = el }}
                  className="ip-ac"
                >
                  <CursorSVG />
                  <span className="ip-ac-tag">Anurag Adhikari</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
