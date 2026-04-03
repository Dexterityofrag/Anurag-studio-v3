'use client'

import { useRef, useEffect } from 'react'
import gsap from 'gsap'

/* ────────────────────────────────────────────────────────────── */
/*  Styles                                                        */
/* ────────────────────────────────────────────────────────────── */

const css = /* css */ `
/* ── Overlay ── */
.pl {
  position: fixed;
  inset: 0;
  z-index: var(--z-loader, 6000);
  background: #060606;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transition: transform 0.9s cubic-bezier(0.76, 0, 0.24, 1);
}
.pl--hidden {
  transform: translateY(-100%);
  pointer-events: none;
}

/* ── Scanlines ── */
.pl::before {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 3px,
    rgba(0,255,148,0.015) 3px,
    rgba(0,255,148,0.015) 4px
  );
  pointer-events: none;
  z-index: 1;
}

/* ── Corner HUD brackets ── */
.pl__corner {
  position: absolute;
  width: 48px;
  height: 48px;
  z-index: 2;
  opacity: 0;
}
.pl__corner--tl { top: 24px; left: 24px; border-top: 1px solid rgba(0,255,148,0.45); border-left: 1px solid rgba(0,255,148,0.45); }
.pl__corner--tr { top: 24px; right: 24px; border-top: 1px solid rgba(0,255,148,0.45); border-right: 1px solid rgba(0,255,148,0.45); }
.pl__corner--bl { bottom: 24px; left: 24px; border-bottom: 1px solid rgba(0,255,148,0.45); border-left: 1px solid rgba(0,255,148,0.45); }
.pl__corner--br { bottom: 24px; right: 24px; border-bottom: 1px solid rgba(0,255,148,0.45); border-right: 1px solid rgba(0,255,148,0.45); }

/* ── HUD text labels ── */
.pl__hud {
  position: absolute;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 10px;
  color: rgba(0,255,148,0.45);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  z-index: 2;
  opacity: 0;
  line-height: 1.8;
}
.pl__hud--tl { top: 84px; left: 24px; }
.pl__hud--tr { top: 84px; right: 24px; text-align: right; }
.pl__hud--bl { bottom: 84px; left: 24px; }
.pl__hud--br { bottom: 84px; right: 24px; text-align: right; }

/* ── Mission ID ── */
.pl__mission {
  position: absolute;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 10px;
  color: rgba(255,255,255,0.2);
  letter-spacing: 0.22em;
  text-transform: uppercase;
  z-index: 2;
  opacity: 0;
}

/* ── Center stage ── */
.pl__stage {
  position: relative;
  z-index: 3;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
}

/* ── Letter row ── */
.pl__letters {
  display: flex;
  gap: clamp(8px, 2.5vw, 24px);
  align-items: flex-end;
}

/* ── Single letter node ── */
.pl__node {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.pl__letter {
  font-family: var(--font-display, 'Space Grotesk', sans-serif);
  font-weight: 700;
  font-size: clamp(4rem, 9vw, 9rem);
  line-height: 1;
  letter-spacing: -0.04em;
  color: rgba(255,255,255,0.08);
  transition: color 0.4s ease, text-shadow 0.4s ease;
  user-select: none;
}
.pl__letter.lit {
  color: #f0ede8;
  text-shadow: 0 0 40px rgba(0,255,148,0.35);
}

/* ── Scan bar under each letter ── */
.pl__bar-wrap {
  width: 100%;
  min-width: clamp(40px, 7vw, 80px);
  height: 2px;
  background: rgba(255,255,255,0.07);
  position: relative;
  overflow: hidden;
}
.pl__bar-fill {
  position: absolute;
  left: 0; top: 0;
  height: 100%;
  width: 0%;
  background: #00FF94;
  box-shadow: 0 0 8px rgba(0,255,148,0.8);
  transition: none;
}

/* Tick marks */
.pl__ticks {
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding: 0 1px;
}
.pl__tick {
  width: 1px;
  height: 4px;
  background: rgba(255,255,255,0.12);
}
.pl__tick:first-child, .pl__tick:last-child { height: 6px; background: rgba(0,255,148,0.3); }

/* Node code */
.pl__code {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 9px;
  letter-spacing: 0.1em;
  color: rgba(255,255,255,0.15);
  margin-top: 2px;
  transition: color 0.3s ease;
}
.pl__node.lit .pl__code { color: rgba(0,255,148,0.6); }

/* ── Status line ── */
.pl__status-wrap {
  margin-top: clamp(2.5rem, 5vh, 4rem);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: clamp(280px, 60vw, 560px);
}

.pl__status-text {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 10px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: rgba(0,255,148,0.7);
  min-height: 1.2em;
}
.pl__status-text::after {
  content: '▌';
  animation: blink 0.7s step-end infinite;
  opacity: 0.8;
}
@keyframes blink { 50% { opacity: 0; } }

/* Main progress track */
.pl__progress-track {
  width: 100%;
  height: 1px;
  background: rgba(255,255,255,0.08);
  position: relative;
}
.pl__progress-fill {
  position: absolute;
  left: 0; top: 0;
  height: 100%;
  width: 0%;
  background: rgba(0,255,148,0.5);
  transition: width 0.3s ease;
}
.pl__progress-fill::after {
  content: '';
  position: absolute;
  right: 0; top: -2px;
  width: 4px; height: 5px;
  background: #00FF94;
  box-shadow: 0 0 10px rgba(0,255,148,1);
}

.pl__progress-nums {
  display: flex;
  justify-content: space-between;
  width: 100%;
}
.pl__progress-pct {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 10px;
  color: rgba(255,255,255,0.25);
  letter-spacing: 0.06em;
}
.pl__progress-pct span {
  color: rgba(0,255,148,0.6);
  font-size: 11px;
}

/* ── Telemetry stream (right side) ── */
.pl__telem {
  position: absolute;
  right: 24px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
  opacity: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.pl__telem-row {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 9px;
  color: rgba(0,255,148,0.2);
  letter-spacing: 0.08em;
  white-space: nowrap;
}
.pl__telem-row b { color: rgba(0,255,148,0.45); }

/* ── Left data stream ── */
.pl__stream {
  position: absolute;
  left: 24px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
  opacity: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.pl__stream-row {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 9px;
  color: rgba(255,255,255,0.1);
  letter-spacing: 0.06em;
}
.pl__stream-row.hi { color: rgba(0,255,148,0.3); }

/* ── Reduced motion ── */
@media (prefers-reduced-motion: reduce) {
  .pl { transition-duration: 0.01ms; }
  .pl__letter { transition-duration: 0.01ms; }
}
`

/* ────────────────────────────────────────────────────────────── */
/*  Telemetry data                                                */
/* ────────────────────────────────────────────────────────────── */

const LETTERS = ['A', 'N', 'U', 'R', 'A', 'G']
const CODES   = ['SYS_01', 'SYS_02', 'SYS_03', 'SYS_04', 'SYS_05', 'SYS_06']

const STATUSES = [
  'INITIALIZING SYSTEMS',
  'LOADING DESIGN ASSETS',
  'MOUNTING COMPONENTS',
  'CALIBRATING ANIMATIONS',
  'SYNCING DATA LAYERS',
  'SYSTEMS NOMINAL',
  'READY FOR LAUNCH',
]

const TELEM = [
  ['VEL', '2.847 km/s'],
  ['ALT', '408.3 km'],
  ['LAT', '28.5234° N'],
  ['LON', '80.6512° W'],
  ['TEMP', '−156.7 °C'],
  ['PWR', '98.4 %'],
  ['SIG', '−72 dBm'],
  ['FPS', '144 Hz'],
]

const STREAM = [
  '0x4E2F A1B8',
  '0x3C1D 9F4A',
  '// BOOT.seq',
  '0xFF04 3B2E',
  '> run init',
  '0xA8C2 1D9F',
  '0x7E3F B05C',
  '// OK',
]

/* ────────────────────────────────────────────────────────────── */
/*  Component                                                     */
/* ────────────────────────────────────────────────────────────── */

export default function Preloader() {
  const overlayRef   = useRef<HTMLDivElement>(null)
  const progressRef  = useRef<HTMLDivElement>(null)
  const statusRef    = useRef<HTMLSpanElement>(null)
  const pctRef       = useRef<HTMLSpanElement>(null)
  const barFillRefs  = useRef<(HTMLDivElement | null)[]>([])
  const letterRefs   = useRef<(HTMLSpanElement | null)[]>([])
  const nodeRefs     = useRef<(HTMLDivElement | null)[]>([])
  const telemRowRefs = useRef<(HTMLDivElement | null)[]>([])
  const streamRowRefs= useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const overlay = overlayRef.current
    if (!overlay) return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      overlay.classList.add('pl--hidden')
      window.dispatchEvent(new CustomEvent('preloader:done'))
      return
    }

    const tl = gsap.timeline({ defaults: { ease: 'power2.inOut' } })

    /* 0. Live clock */
    const start = Date.now()
    const clockEl = overlay.querySelector('#pl-time') as HTMLElement | null
    const clockInterval = setInterval(() => {
      const elapsed = Date.now() - start
      const s = Math.floor(elapsed / 1000) % 60
      const m = Math.floor(elapsed / 60000) % 60
      const h = Math.floor(elapsed / 3600000)
      if (clockEl) clockEl.textContent = `T+${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
    }, 100)

    /* 1. HUD chrome fades in */
    tl.to('.pl__corner, .pl__mission, .pl__hud, .pl__telem, .pl__stream', {
      opacity: 1,
      duration: 0.5,
      stagger: 0.04,
      ease: 'power1.out',
    }, 0)

    /* 2. Telemetry rows flicker in */
    tl.to(telemRowRefs.current.filter(Boolean), {
      opacity: 1,
      stagger: 0.08,
      duration: 0.3,
      ease: 'none',
    }, 0.3)

    /* 3. Stream rows */
    tl.to(streamRowRefs.current.filter(Boolean), {
      opacity: 1,
      stagger: 0.07,
      duration: 0.25,
      ease: 'none',
    }, 0.35)

    /* 4. Letters + bars activate one by one */
    LETTERS.forEach((_, i) => {
      const startAt = 0.4 + i * 0.22
      const letter  = letterRefs.current[i]
      const bar     = barFillRefs.current[i]
      const node    = nodeRefs.current[i]

      // Letter lights up
      tl.call(() => {
        letter?.classList.add('lit')
        node?.classList.add('lit')
      }, [], startAt)

      // Bar fills
      tl.to(bar, {
        width: '100%',
        duration: 0.18,
        ease: 'power1.inOut',
      }, startAt)

      // Status text changes
      const si = Math.min(i, STATUSES.length - 2)
      tl.call(() => {
        if (statusRef.current) statusRef.current.textContent = STATUSES[si]
      }, [], startAt)
    })

    /* 5. Progress bar tracks letter completion */
    tl.to(progressRef.current, {
      width: '100%',
      duration: LETTERS.length * 0.22 + 0.1,
      ease: 'power1.inOut',
    }, 0.4)

    /* 6. Percent counter */
    const obj = { val: 0 }
    tl.to(obj, {
      val: 100,
      duration: LETTERS.length * 0.22 + 0.1,
      ease: 'power1.inOut',
      onUpdate() {
        if (pctRef.current) pctRef.current.textContent = String(Math.round(obj.val))
      },
    }, 0.4)

    /* 7. Final status */
    const endAt = 0.4 + LETTERS.length * 0.22 + 0.1
    tl.call(() => {
      if (statusRef.current) statusRef.current.textContent = 'READY FOR LAUNCH'
    }, [], endAt)

    /* 8. Brief hold then exit */
    tl.call(() => {
      overlay.classList.add('pl--hidden')
      const onEnd = () => {
        overlay.removeEventListener('transitionend', onEnd)
        window.dispatchEvent(new CustomEvent('preloader:done'))
      }
      overlay.addEventListener('transitionend', onEnd, { once: true })
    }, [], endAt + 0.45)

    return () => {
      tl.kill()
      clearInterval(clockInterval)
    }
  }, [])

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <div ref={overlayRef} className="pl" aria-hidden="true">

        {/* Corner brackets */}
        <div className="pl__corner pl__corner--tl" />
        <div className="pl__corner pl__corner--tr" />
        <div className="pl__corner pl__corner--bl" />
        <div className="pl__corner pl__corner--br" />

        {/* Mission ID top-center */}
        <div className="pl__mission">MISSION // ANURAG.STUDIO — V3</div>

        {/* HUD labels */}
        <div className="pl__hud pl__hud--tl">
          <div>STUDIO // DESIGN SYSTEMS</div>
          <div style={{ color: 'rgba(255,255,255,0.18)' }}>SESSION INIT</div>
          <div id="pl-time" style={{ color: 'rgba(0,255,148,0.6)' }}>T+00:00:00</div>
        </div>

        <div className="pl__hud pl__hud--tr">
          <div>NODE // PRIMARY</div>
          <div style={{ color: 'rgba(255,255,255,0.18)' }}>6 SYSTEMS PENDING</div>
          <div style={{ color: 'rgba(0,255,148,0.6)' }}>STATUS: BOOT</div>
        </div>

        <div className="pl__hud pl__hud--bl">
          <div>ENV // PRODUCTION</div>
          <div style={{ color: 'rgba(255,255,255,0.18)' }}>NEXT.JS 15 / RSC</div>
        </div>

        <div className="pl__hud pl__hud--br">
          <div>BUILD // 2026.04.03</div>
          <div style={{ color: 'rgba(255,255,255,0.18)' }}>REV 0xA4F2</div>
        </div>

        {/* Left binary stream */}
        <div className="pl__stream">
          {STREAM.map((row, i) => (
            <div
              key={i}
              ref={el => { streamRowRefs.current[i] = el }}
              className={`pl__stream-row${row.startsWith('//') || row.startsWith('>') ? ' hi' : ''}`}
              style={{ opacity: 0 }}
            >
              {row}
            </div>
          ))}
        </div>

        {/* Right telemetry */}
        <div className="pl__telem">
          {TELEM.map(([label, val], i) => (
            <div
              key={i}
              ref={el => { telemRowRefs.current[i] = el }}
              className="pl__telem-row"
              style={{ opacity: 0 }}
            >
              <b>{label}</b> {val}
            </div>
          ))}
        </div>

        {/* ── CENTER STAGE ── */}
        <div className="pl__stage">

          {/* Letters */}
          <div className="pl__letters">
            {LETTERS.map((char, i) => (
              <div
                key={i}
                ref={el => { nodeRefs.current[i] = el }}
                className="pl__node"
              >
                <span
                  ref={el => { letterRefs.current[i] = el }}
                  className="pl__letter"
                >
                  {char}
                </span>

                {/* Scan bar */}
                <div className="pl__bar-wrap">
                  <div
                    ref={el => { barFillRefs.current[i] = el }}
                    className="pl__bar-fill"
                  />
                </div>

                {/* Tick marks */}
                <div className="pl__ticks">
                  {Array.from({ length: 5 }).map((_, t) => (
                    <div key={t} className="pl__tick" />
                  ))}
                </div>

                <span className="pl__code">{CODES[i]}</span>
              </div>
            ))}
          </div>

          {/* Status + progress */}
          <div className="pl__status-wrap">
            <span ref={statusRef} className="pl__status-text">
              INITIALIZING SYSTEMS
            </span>

            <div className="pl__progress-track">
              <div ref={progressRef} className="pl__progress-fill" style={{ width: '0%' }} />
            </div>

            <div className="pl__progress-nums">
              <span className="pl__progress-pct">LOAD_PROGRESS</span>
              <span className="pl__progress-pct">
                <span ref={pctRef}>0</span>%
              </span>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
