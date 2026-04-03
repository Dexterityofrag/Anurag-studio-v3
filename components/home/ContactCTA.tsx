'use client'

const css = /* css */ `
.cta-footer {
  padding: clamp(5rem,10vh,8rem) var(--page-px, clamp(1.5rem,5vw,6rem));
  border-top: 1px solid rgba(255,255,255,0.06);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: clamp(1.5rem,4vw,3rem);
  flex-wrap: wrap;
}

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
}

.cta-footer__links {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
}
.cta-footer__email {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 13px;
  color: rgba(255,255,255,0.6);
  text-decoration: none;
  letter-spacing: 0.04em;
  transition: color 0.2s ease;
}
.cta-footer__email:hover { color: var(--accent, #FF4D00); }

.cta-footer__socials {
  display: flex;
  gap: 24px;
  align-items: center;
}
.cta-footer__social {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 11px;
  color: rgba(255,255,255,0.35);
  text-decoration: none;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  transition: color 0.2s ease;
}
.cta-footer__social:hover { color: rgba(255,255,255,0.8); }

@media (max-width: 640px) {
  .cta-footer { flex-direction: column; align-items: flex-start; }
  .cta-footer__links { align-items: flex-start; }
}
`

export default function ContactCTA() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <section className="cta-footer" id="contact-cta">
        <h2 className="cta-footer__heading">
          Let&apos;s <em>Talk.</em>
        </h2>

        <div className="cta-footer__links">
          <a
            href="mailto:hello@anurag.studio"
            className="cta-footer__email"
          >
            hello@anurag.studio
          </a>
          <div className="cta-footer__socials">
            <a
              href="https://www.linkedin.com/in/anuragp21/"
              target="_blank"
              rel="noopener noreferrer"
              className="cta-footer__social"
            >
              LinkedIn
            </a>
            <a
              href="https://www.instagram.com/anurag.design/"
              target="_blank"
              rel="noopener noreferrer"
              className="cta-footer__social"
            >
              Instagram
            </a>
            <a
              href="https://twitter.com/anuragdesign"
              target="_blank"
              rel="noopener noreferrer"
              className="cta-footer__social"
            >
              Twitter
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
