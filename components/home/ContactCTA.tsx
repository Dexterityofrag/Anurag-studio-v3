'use client'

import { useEffect, useRef } from 'react'

const css = /* css */ `
.cta-footer {
  padding: clamp(5rem,10vh,8rem) var(--page-px, clamp(1.5rem,5vw,6rem));
  border-top: 1px solid rgba(255,255,255,0.06);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: clamp(1.5rem,4vw,3rem);
  flex-wrap: wrap;
  overflow: hidden;
}

/* Heading word reveal */
.cta-footer__heading {
  font-family: var(--font-display, 'Space Grotesk', sans-serif);
  font-weight: 700;
  font-size: clamp(3rem, 7vw, 7rem);
  letter-spacing: -0.04em;
  text-transform: uppercase;
  line-height: 0.92;
  color: var(--text, #FAFAFA);
  margin: 0;
  display: flex;
  align-items: baseline;
  gap: 0.25em;
  flex-wrap: wrap;
}
.cta-footer__heading em {
  font-style: normal;
  color: transparent;
  -webkit-text-stroke: 1.5px rgba(255,255,255,0.55);
  transition: -webkit-text-stroke 0.4s ease, color 0.4s ease;
}
.cta-footer__heading:hover em {
  color: var(--accent, #00FF94);
  -webkit-text-stroke: 1.5px transparent;
}

/* Word clip + slide reveal */
.cta-footer__word {
  display: inline-block;
  overflow: hidden;
  vertical-align: bottom;
}
.cta-footer__word-inner {
  display: inline-block;
  transform: translateY(110%);
  transition: transform 0.85s cubic-bezier(0.22,1,0.36,1);
}
.cta-footer__word.vis .cta-footer__word-inner { transform: translateY(0); }
.cta-footer__word:nth-child(1) .cta-footer__word-inner { transition-delay: 0s; }
.cta-footer__word:nth-child(2) .cta-footer__word-inner { transition-delay: 0.12s; }
.cta-footer__word:nth-child(3) .cta-footer__word-inner { transition-delay: 0.22s; }

.cta-footer__links {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 16px;
  opacity: 0;
  transform: translateX(20px);
  transition: opacity 0.8s ease 0.3s, transform 0.8s cubic-bezier(0.22,1,0.36,1) 0.3s;
}
.cta-footer__links.vis { opacity: 1; transform: translateX(0); }

/* Email: big sweep underline */
.cta-footer__email {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: clamp(12px, 1.2vw, 15px);
  color: rgba(255,255,255,0.6);
  text-decoration: none;
  letter-spacing: 0.04em;
  position: relative;
  transition: color 0.3s ease;
}
.cta-footer__email::after {
  content: '';
  position: absolute;
  bottom: -2px; left: 0;
  width: 0%; height: 1px;
  background: var(--accent, #00FF94);
  transition: width 0.45s cubic-bezier(0.22,1,0.36,1);
}
.cta-footer__email:hover { color: var(--accent, #00FF94); }
.cta-footer__email:hover::after { width: 100%; }

.cta-footer__socials {
  display: flex;
  gap: 24px;
  align-items: center;
}
.cta-footer__social {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 11px;
  color: rgba(255,255,255,0.3);
  text-decoration: none;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  position: relative;
  transition: color 0.25s ease;
}
.cta-footer__social::after {
  content: '';
  position: absolute;
  bottom: -2px; left: 0;
  width: 0%; height: 1px;
  background: currentColor;
  transition: width 0.3s cubic-bezier(0.22,1,0.36,1);
}
.cta-footer__social:hover { color: rgba(255,255,255,0.7); }
.cta-footer__social:hover::after { width: 100%; }

/* Stagger social links in */
.cta-footer__social:nth-child(1) { transition-delay: 0.4s; }
.cta-footer__social:nth-child(2) { transition-delay: 0.5s; }
.cta-footer__social:nth-child(3) { transition-delay: 0.6s; }

@media (max-width: 640px) {
  .cta-footer { flex-direction: column; align-items: flex-start; }
  .cta-footer__links { align-items: flex-start; }
}
`

export default function ContactCTA() {
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    const links = section.querySelector('.cta-footer__links')
    const words = section.querySelectorAll('.cta-footer__word')

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          links?.classList.add('vis')
          words.forEach(el => el.classList.add('vis'))
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

      <section ref={sectionRef} className="cta-footer" id="contact-cta">
        <h2 className="cta-footer__heading">
          <span className="cta-footer__word">
            <span className="cta-footer__word-inner">Let&apos;s</span>
          </span>
          {' '}
          <span className="cta-footer__word">
            <span className="cta-footer__word-inner"><em>Talk.</em></span>
          </span>
        </h2>

        <div className="cta-footer__links">
          <a href="mailto:hello@anurag.studio" className="cta-footer__email">
            hello@anurag.studio
          </a>
          <div className="cta-footer__socials">
            <a href="https://www.linkedin.com/in/dexterityofrag" target="_blank" rel="noopener noreferrer" className="cta-footer__social">LinkedIn</a>
            <a href="https://instagram.com/lightlyricist" target="_blank" rel="noopener noreferrer" className="cta-footer__social">Instagram</a>
            <a href="https://github.com/Dexterityofrag" target="_blank" rel="noopener noreferrer" className="cta-footer__social">GitHub</a>
            <a href="https://www.behance.net/anuragadhikari5" target="_blank" rel="noopener noreferrer" className="cta-footer__social">Behance</a>
          </div>
        </div>
      </section>
    </>
  )
}
