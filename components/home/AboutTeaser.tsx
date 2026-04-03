'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import type { AboutInfo } from '@/lib/types'

const css = /* css */ `
.at {
  padding: clamp(8rem,16vh,14rem) var(--page-px, clamp(1.5rem,5vw,6rem));
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(2rem,4vh,3rem);
  overflow: hidden;
}

.at__line {
  display: block;
  width: 0;
  height: 1px;
  background: var(--accent, #00FF94);
  margin: 0 auto 8px;
  opacity: 0.5;
  transition: width 1.1s cubic-bezier(0.22, 1, 0.36, 1) 0.1s;
}
.at__line.vis { width: 48px; }

.at__heading {
  font-family: var(--font-display, 'Space Grotesk', sans-serif);
  font-weight: 700;
  font-size: clamp(3rem, 8.5vw, 8.5rem);
  line-height: 0.92;
  letter-spacing: -0.04em;
  text-transform: uppercase;
  color: var(--text, #FAFAFA);
  margin: 0;
  /* Each line clips for word reveal */
  overflow: hidden;
}
.at__heading em {
  font-style: normal;
  color: transparent;
  -webkit-text-stroke: 1.5px rgba(255,255,255,0.55);
}

/* Each .at__word slides up on reveal */
.at__word {
  display: inline-block;
  overflow: hidden;
  vertical-align: bottom;
  margin-right: 0.22em;
}
.at__word-inner {
  display: inline-block;
  transform: translateY(110%);
  transition: transform 0.85s cubic-bezier(0.22, 1, 0.36, 1);
}
.at__word.vis .at__word-inner { transform: translateY(0); }

.at__tagline {
  font-family: var(--font-body, 'DM Sans', sans-serif);
  font-size: clamp(1rem, 1.5vw, 1.2rem);
  color: rgba(255,255,255,0.45);
  line-height: 1.7;
  max-width: 44ch;
  margin: 0;
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.8s ease 0.5s, transform 0.8s ease 0.5s;
}
.at__tagline.vis { opacity: 1; transform: translateY(0); }

/* Pill CTA with sweep fill */
.at__cta {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 32px;
  border: 1px solid rgba(0, 255, 148, 0.35);
  border-radius: 999px;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 11px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  text-decoration: none;
  color: var(--accent, #00FF94);
  overflow: hidden;
  opacity: 0;
  transform: translateY(16px);
  transition:
    color 0.35s ease,
    opacity 0.7s ease 0.7s,
    transform 0.7s ease 0.7s;
}
.at__cta.vis { opacity: 1; transform: translateY(0); }
.at__cta::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--accent, #00FF94);
  transform: translateX(-101%);
  transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);
  z-index: 0;
}
.at__cta:hover { color: #060606; }
.at__cta:hover::before { transform: translateX(0); }
.at__cta span { position: relative; z-index: 1; }
`

export default function AboutTeaser({ bio }: { bio: AboutInfo | null }) {
  void bio
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const targets = section.querySelectorAll('.at__line, .at__word, .at__tagline, .at__cta')

    const words = section.querySelectorAll<HTMLElement>('.at__word')
    words.forEach((w, i) => {
      w.style.transitionDelay = `${0.15 + i * 0.07}s`
    })

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          targets.forEach(el => el.classList.add('vis'))
          io.disconnect()
        }
      },
      { threshold: 0.2 }
    )
    io.observe(section)
    return () => io.disconnect()
  }, [])

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <section ref={sectionRef} className="at" id="about-teaser">
        <span className="at__line" aria-hidden="true" />

        <h2 className="at__heading" aria-label="The Designer Behind the Work.">
          {/* Word-by-word reveal */}
          {['The', 'Designer'].map(w => (
            <span key={w} className="at__word">
              <span className="at__word-inner">{w}</span>
            </span>
          ))}
          <br aria-hidden="true" />
          {['Behind', 'the'].map(w => (
            <span key={w} className="at__word">
              <span className="at__word-inner">{w}</span>
            </span>
          ))}
          <span className="at__word">
            <span className="at__word-inner"><em>Work.</em></span>
          </span>
        </h2>

        <p className="at__tagline">
          Systems that scale. Typography that respects the reader.<br />
          Interactions that feel inevitable.
        </p>

        <Link href="/about" className="at__cta">
          <span>View Full Profile</span>
          <span>→</span>
        </Link>
      </section>
    </>
  )
}
