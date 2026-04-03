'use client'

import Link from 'next/link'
import type { AboutInfo } from '@/lib/types'

const css = /* css */ `
.at {
  padding: clamp(8rem,16vh,14rem) var(--page-px, clamp(1.5rem,5vw,6rem));
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(2rem,4vh,3rem);
}

.at__heading {
  font-family: var(--font-display, 'Space Grotesk', sans-serif);
  font-weight: 700;
  font-size: clamp(3rem, 8.5vw, 8.5rem);
  line-height: 0.92;
  letter-spacing: -0.04em;
  text-transform: uppercase;
  color: var(--text, #FAFAFA);
  margin: 0;
}
.at__heading em {
  font-style: normal;
  color: transparent;
  -webkit-text-stroke: 1.5px rgba(255,255,255,0.55);
}

.at__tagline {
  font-family: var(--font-body, 'DM Sans', sans-serif);
  font-size: clamp(1rem, 1.5vw, 1.2rem);
  color: rgba(255,255,255,0.45);
  line-height: 1.7;
  max-width: 44ch;
  margin: 0;
}

.at__cta {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 12px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.5);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  position: relative;
  padding-bottom: 2px;
  transition: color 0.25s ease;
}
.at__cta::after {
  content: '';
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 1px;
  background: currentColor;
  opacity: 0.4;
  transition: opacity 0.25s ease;
}
.at__cta:hover { color: var(--accent, #FF4D00); }
.at__cta:hover::after { opacity: 1; }
`

export default function AboutTeaser({ bio }: { bio: AboutInfo | null }) {
  void bio

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <section className="at" id="about-teaser">
        <h2 className="at__heading">
          The Designer<br />
          Behind the <em>Work.</em>
        </h2>

        <p className="at__tagline">
          Systems that scale. Typography that respects the reader.<br />
          Interactions that feel inevitable.
        </p>

        <Link href="/about" className="at__cta">
          View Full Profile →
        </Link>
      </section>
    </>
  )
}
