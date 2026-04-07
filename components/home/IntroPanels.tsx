'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/* ─────────────────────────────────────────────────────────────── */
/*  Panel data                                                      */
/* ─────────────────────────────────────────────────────────────── */

interface PanelDef {
  num: string
  fullHtml: string
  emWord: string
  sub: string
}

const PANELS: PanelDef[] = [
  {
    num: '01',
    fullHtml: 'I design for those who crave experiences that are <em>unforgettable</em>',
    emWord: 'unforgettable',
    sub: 'Experience Design',
  },
  {
    num: '02',
    fullHtml: "I don't just deliver design. I deliver <em>outcomes</em>",
    emWord: 'outcomes',
    sub: 'Strategy-first thinking',
  },
  {
    num: '03',
    fullHtml: 'Every pixel is a decision. Every decision is <em>intentional</em>',
    emWord: 'intentional',
    sub: 'Craft + precision',
  },
]

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

/* ─────────────────────────────────────────────────────────────── */
/*  CSS                                                             */
/* ─────────────────────────────────────────────────────────────── */

const css = /* css */ `
/* ─── SCROLL TRACK ────────────────────────────────────────────── */
.ip-wrap {
  position: relative;
  height: 400vh;
  background: var(--color-bg, #060606);
}

/* ─── STICKY VIEWPORT ─────────────────────────────────────────── */
.ip-pin {
  position: sticky;
  top: 0;
  height: 100vh;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg, #060606);
}

/* ─── PANEL SHELL ─────────────────────────────────────────────── */
.ip-panel {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 var(--page-px, clamp(1.5rem, 5vw, 6rem));
  opacity: 0;
  pointer-events: none;
  z-index: 10;
}

/* ─── STAGE ───────────────────────────────────────────────────── */
.ip-stage {
  position: relative;
  max-width: 880px;
  width: 100%;
}

/* ─── COUNTER ─────────────────────────────────────────────────── */
.ip-counter {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--color-accent, #00FF94);
  margin-bottom: 28px;
  display: flex;
  align-items: center;
  gap: 12px;
  opacity: 0;
}
.ip-counter::after {
  content: '';
  display: block;
  width: 40px;
  height: 1px;
  background: var(--color-accent, #00FF94);
  opacity: 0.4;
}

/* ─── STATEMENT TEXT ─────────────────────────────────────────── */
.ip-text {
  font-family: var(--font-display);
  font-size: clamp(2rem, 4.5vw, 4rem);
  font-weight: 600;
  color: var(--color-fg, #f0ede8);
  line-height: 1.25;
  letter-spacing: -0.02em;
  min-height: 2.5em;
}
.ip-text em {
  color: var(--color-accent, #00FF94);
  font-style: normal;
}

/* ─── FLIP CHARS ─────────────────────────────────────────────── */
.ip-flip-char {
  display: inline;
  transition: color 0.06s ease;
}
.ip-flip-char--scramble {
  color: rgba(0, 255, 148, 0.4);
}

/* ─── BLINKING CARET ─────────────────────────────────────────── */
.ip-cursor {
  display: inline-block;
  width: 3px;
  height: 0.85em;
  background: var(--color-accent, #00FF94);
  vertical-align: middle;
  margin-left: 3px;
  border-radius: 1px;
  animation: ip-blink 0.85s step-end infinite;
}
@keyframes ip-blink { 50% { opacity: 0; } }

/* ─── SUB LABEL ───────────────────────────────────────────────── */
.ip-sub {
  margin-top: 24px;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgba(240, 237, 232, 0.28);
  opacity: 0;
}

/* ─── PROGRESS STRIP (bottom) ────────────────────────────────── */
.ip-progress-strip {
  position: absolute;
  bottom: 32px;
  left: var(--page-px, clamp(1.5rem, 5vw, 6rem));
  right: var(--page-px, clamp(1.5rem, 5vw, 6rem));
  height: 1px;
  background: rgba(255,255,255,0.05);
  overflow: hidden;
}
.ip-progress-fill {
  height: 100%;
  background: var(--color-accent, #00FF94);
  width: 0%;
  transition: width 0.1s linear;
  border-radius: 1px;
  box-shadow: 0 0 8px rgba(0,255,148,0.5);
}

@media (max-width: 768px) {
  .ip-text { font-size: clamp(1.6rem, 6vw, 2.5rem); }
}
`

/* ─────────────────────────────────────────────────────────────── */
/*  Per-panel ref type                                             */
/* ─────────────────────────────────────────────────────────────── */

interface PanelRefs {
  panel: HTMLDivElement | null
  counter: HTMLParagraphElement | null
  sub: HTMLParagraphElement | null
  text: HTMLParagraphElement | null
}

/* ─────────────────────────────────────────────────────────────── */
/*  A-Z flip typewriter builder                                    */
/* ─────────────────────────────────────────────────────────────── */

/**
 * Given a plain text string and a count of how many chars to reveal,
 * produce HTML where:
 *   - chars 0..(count-3) are fully revealed (stable)
 *   - chars (count-2)..(count-1) are "scrambling" (random A-Z, with class)
 *   - chars count..end are not shown
 *   - emWord gets wrapped in <em> when fully contained in the revealed range
 */
function buildFlipHtml(
  plain: string,
  count: number,
  emWord: string,
  prevCount: number,
): string {
  if (count <= 0) return '<span class="ip-cursor"></span>'

  let result = ''
  const safeCount = Math.min(count, plain.length)
  const scrambleStart = Math.max(0, safeCount - 2)

  for (let i = 0; i < safeCount; i++) {
    const ch = plain[i]
    if (ch === ' ') {
      result += ' '
      continue
    }
    if (i >= scrambleStart && i >= prevCount) {
      // This char is newly revealed — show random letter
      const randomChar = ALPHABET[Math.floor(Math.random() * 26)]
      result += `<span class="ip-flip-char ip-flip-char--scramble">${randomChar}</span>`
    } else {
      result += ch
    }
  }

  // Replace emWord in the stable portion only
  const stablePortion = plain.slice(0, scrambleStart)
  if (stablePortion.includes(emWord)) {
    // Rebuild with em tag in stable portion
    const beforeScramble = plain.slice(0, scrambleStart)
    const scramblePart = result.slice(beforeScramble.length)
    const stableHtml = beforeScramble.replace(emWord, `<em>${emWord}</em>`)
    result = stableHtml + scramblePart
  }

  result += '<span class="ip-cursor"></span>'
  return result
}

/* ─────────────────────────────────────────────────────────────── */
/*  Component                                                      */
/* ─────────────────────────────────────────────────────────────── */

export default function IntroPanels() {
  const wrapRef       = useRef<HTMLDivElement>(null)
  const progressRef   = useRef<HTMLDivElement>(null)
  const panelRefs     = useRef<PanelRefs[]>(
    PANELS.map(() => ({ panel: null, counter: null, sub: null, text: null }))
  )

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const wrap = wrapRef.current
    const prog = progressRef.current
    if (!wrap) return

    const refs = panelRefs.current

    /* Track previous char count per panel for scramble detection */
    const prevCounts = PANELS.map(() => 0)

    /* Each panel gets 1 unit in a 3-unit timeline */
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: wrap,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
        onUpdate(self) {
          if (prog) prog.style.width = (self.progress * 100) + '%'
        },
      },
    })

    PANELS.forEach((panel, i) => {
      const r = refs[i]
      if (!r.panel || !r.text) return

      const base  = i
      const plain = panel.fullHtml.replace(/<[^>]+>/g, '')

      gsap.set(r.panel, { opacity: 0 })
      gsap.set([r.counter, r.sub], { opacity: 0 })
      r.text.innerHTML = '<span class="ip-cursor"></span>'

      /* Fade in panel */
      tl.to(r.panel,   { opacity: 1, duration: 0.06 }, base)
      tl.to(r.counter, { opacity: 1, duration: 0.04 }, base + 0.04)

      /* Scroll-driven typewriter with A-Z flip */
      const charObj = { n: 0 }
      tl.to(charObj, {
        n: plain.length,
        duration: 0.72,
        ease: 'none',
        onUpdate() {
          const count = Math.round(charObj.n)
          const prev = prevCounts[i]
          r.text!.innerHTML = buildFlipHtml(plain, count, panel.emWord, prev)
          prevCounts[i] = count
        },
      }, base + 0.08)

      /* Sub label fades in at 80% of typewriter */
      tl.to(r.sub, { opacity: 1, duration: 0.05 }, base + 0.65)

      /* Fade out — ends exactly at base+1 so next panel starts with no black gap */
      tl.to([r.counter, r.sub], { opacity: 0, duration: 0.06 }, base + 0.88)
      tl.to(r.panel, { opacity: 0, duration: 0.1 }, base + 0.90)
    })

    tl.to({}, { duration: 0.08 }, 2.92)

    return () => {
      tl.scrollTrigger?.kill()
      tl.kill()
    }
  }, [])

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <div ref={wrapRef} className="ip-wrap" aria-label="Introduction">
        <div className="ip-pin">

          {PANELS.map((p, i) => (
            <div
              key={i}
              ref={(el) => { panelRefs.current[i].panel = el }}
              className="ip-panel"
            >
              <div className="ip-stage">
                <p
                  ref={(el) => { panelRefs.current[i].counter = el }}
                  className="ip-counter"
                >
                  {p.num} / 0{PANELS.length}
                </p>

                <p
                  ref={(el) => { panelRefs.current[i].text = el }}
                  className="ip-text"
                />

                <p
                  ref={(el) => { panelRefs.current[i].sub = el }}
                  className="ip-sub"
                >
                  {p.sub}
                </p>
              </div>
            </div>
          ))}

          {/* Bottom progress strip */}
          <div className="ip-progress-strip" aria-hidden="true">
            <div ref={progressRef} className="ip-progress-fill" />
          </div>

        </div>
      </div>
    </>
  )
}
