'use client'

import { useEffect, useRef } from 'react'

/* ────────────────────────────────────────────────────────────── */
/*  Data                                                          */
/* ────────────────────────────────────────────────────────────── */

const STATS = [
  { value: 3,   suffix: '+', label: 'Years Experience',   prefix: '' },
  { value: 15,  suffix: '+', label: 'Projects Shipped',   prefix: '' },
  { value: 100, suffix: '%', label: 'On-Time Delivery',   prefix: '' },
  { value: 8,   suffix: '+', label: 'Happy Clients',      prefix: '' },
]

/* ────────────────────────────────────────────────────────────── */
/*  Styles                                                        */
/* ────────────────────────────────────────────────────────────── */

const css = /* css */ `
.ss {
  padding: clamp(4rem, 7vh, 6rem) var(--page-px, clamp(1.5rem,5vw,6rem));
  border-top: 1px solid rgba(255,255,255,0.05);
  border-bottom: 1px solid rgba(255,255,255,0.05);
  overflow: hidden;
}

.ss__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2px;
}

.ss__item {
  position: relative;
  padding: clamp(24px, 3vw, 40px) clamp(20px, 3vw, 36px);
  opacity: 0;
  transform: translateY(24px);
  transition:
    opacity 0.7s cubic-bezier(0.22,1,0.36,1),
    transform 0.7s cubic-bezier(0.22,1,0.36,1);
}
.ss__item + .ss__item::before {
  content: '';
  position: absolute;
  left: 0; top: 20%; bottom: 20%;
  width: 1px;
  background: rgba(255,255,255,0.06);
}
.ss__item.ss--in {
  opacity: 1;
  transform: translateY(0);
}
.ss__item:nth-child(1) { transition-delay: 0s; }
.ss__item:nth-child(2) { transition-delay: 0.08s; }
.ss__item:nth-child(3) { transition-delay: 0.16s; }
.ss__item:nth-child(4) { transition-delay: 0.24s; }

/* Hover glow */
.ss__item::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 50% 100%, rgba(0,255,148,0.04) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: none;
}
.ss__item:hover::after { opacity: 1; }

/* Number */
.ss__num {
  font-family: var(--font-display, 'Space Grotesk', sans-serif);
  font-size: clamp(2.5rem, 5vw, 4.5rem);
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 1;
  color: var(--color-fg, #FAFAFA);
  display: flex;
  align-items: baseline;
  gap: 2px;
}
.ss__num-val { display: inline-block; }
.ss__num-suffix {
  font-size: 0.55em;
  color: var(--accent, #00FF94);
  font-weight: 700;
  letter-spacing: 0;
}

/* Label */
.ss__label {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.3);
  margin-top: 8px;
}

/* Bottom accent line */
.ss__line {
  width: 0;
  height: 1px;
  background: var(--accent, #00FF94);
  margin-top: 14px;
  opacity: 0.5;
  transition: width 0.8s cubic-bezier(0.22,1,0.36,1) 0.4s;
}
.ss__item.ss--in .ss__line { width: 28px; }

@media (max-width: 768px) {
  .ss__grid { grid-template-columns: repeat(2, 1fr); }
  .ss__item:nth-child(3)::before,
  .ss__item:nth-child(odd)::before { display: none; }
  .ss__item:nth-child(3) { border-top: 1px solid rgba(255,255,255,0.06); }
  .ss__item:nth-child(4) { border-top: 1px solid rgba(255,255,255,0.06); }
}
@media (max-width: 480px) {
  .ss__grid { grid-template-columns: 1fr 1fr; }
}
@media (prefers-reduced-motion: reduce) {
  .ss__item { transition: opacity 0.3s ease; transform: none !important; }
}
`

/* ────────────────────────────────────────────────────────────── */
/*  Count-up hook                                                 */
/* ────────────────────────────────────────────────────────────── */

function countUp(el: HTMLElement, target: number, duration = 1200) {
  const start = performance.now()
  const update = (now: number) => {
    const elapsed = Math.min((now - start) / duration, 1)
    // ease-out cubic
    const eased = 1 - Math.pow(1 - elapsed, 3)
    el.textContent = Math.floor(eased * target).toString()
    if (elapsed < 1) requestAnimationFrame(update)
    else el.textContent = target.toString()
  }
  requestAnimationFrame(update)
}

/* ────────────────────────────────────────────────────────────── */
/*  Component                                                     */
/* ────────────────────────────────────────────────────────────── */

export default function StatsStrip() {
  const sectionRef = useRef<HTMLElement>(null)
  const numRefs = useRef<(HTMLSpanElement | null)[]>([])

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const items = Array.from(section.querySelectorAll<HTMLElement>('.ss__item'))

    const io = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return

      items.forEach((item, i) => {
        item.classList.add('ss--in')
        // Fire count-up on each number after reveal delay
        setTimeout(() => {
          const numEl = numRefs.current[i]
          if (numEl) countUp(numEl, STATS[i].value, 1400)
        }, i * 80 + 200)
      })

      io.disconnect()
    }, { threshold: 0.25 })

    io.observe(section)
    return () => io.disconnect()
  }, [])

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <section ref={sectionRef} className="ss" aria-label="Key metrics">
        <div className="ss__grid">
          {STATS.map((stat, i) => (
            <div key={stat.label} className="ss__item">
              <div className="ss__num">
                <span
                  className="ss__num-val"
                  ref={el => { numRefs.current[i] = el }}
                >
                  0
                </span>
                <span className="ss__num-suffix">{stat.suffix}</span>
              </div>
              <p className="ss__label">{stat.label}</p>
              <div className="ss__line" aria-hidden="true" />
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
