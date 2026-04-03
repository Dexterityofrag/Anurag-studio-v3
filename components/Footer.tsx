'use client'

import { useState } from 'react'
import Link from 'next/link'

/* ────────────────────────────────────────────────────────────── */
/*  Data                                                          */
/* ────────────────────────────────────────────────────────────── */

const EMAIL = 'hello@anurag.studio'

const SOCIALS = [
  { label: 'LinkedIn', href: 'https://linkedin.com/in/anuragadhikari' },
  { label: 'GitHub',   href: 'https://github.com/anuragadhikari' },
  { label: 'Dribbble', href: 'https://dribbble.com/anuragadhikari' },
  { label: 'WhatsApp', href: 'https://wa.me/917980105391' },
]

/* ────────────────────────────────────────────────────────────── */
/*  Styles                                                        */
/* ────────────────────────────────────────────────────────────── */

const css = /* css */ `
/* ─── FOOTER ─────────────────────────────────────────────────── */
.site-footer {
  max-width: var(--max-width, 1440px);
  margin: 0 auto;
  padding: 120px var(--gutter, 40px) 60px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

/* ─── INNER ROW ──────────────────────────────────────────────── */
.ft-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* ─── LEFT: CTA ──────────────────────────────────────────────── */
.ft-cta {
  font-family: var(--font-display, "Space Grotesk", sans-serif);
  font-size: clamp(1.5rem, 4vw, 3rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  text-transform: uppercase;
  color: var(--color-fg, #f0f0f0);
  text-decoration: none;
  cursor: none;
  transition: color 0.3s ease;
}
.ft-cta:hover { color: var(--accent, #00FF94); }

/* ─── RIGHT: LINKS ───────────────────────────────────────────── */
.ft-links {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: flex-end;
}
.ft-socials {
  display: flex;
  gap: 24px;
}
.ft-social-link {
  font-family: var(--font-mono, "JetBrains Mono", monospace);
  font-size: 13px;
  color: var(--color-muted, rgba(240,240,240,0.5));
  text-decoration: none;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  padding-bottom: 2px;
  cursor: none;
  transition: color 0.3s ease, border-color 0.3s ease;
}
.ft-social-link:hover {
  color: var(--color-fg, #f0f0f0);
  border-color: var(--accent, #00FF94);
}

/* Email copy button */
.ft-email-btn {
  font-family: var(--font-mono, "JetBrains Mono", monospace);
  font-size: 13px;
  color: var(--color-muted, rgba(240,240,240,0.5));
  background: none;
  border: none;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  padding: 0 0 2px;
  cursor: none;
  transition: color 0.3s ease, border-color 0.3s ease;
  letter-spacing: 0.02em;
}
.ft-email-btn:hover {
  color: var(--accent, #00FF94);
  border-color: var(--accent, #00FF94);
}

/* ─── BOTTOM BAR ─────────────────────────────────────────────── */
.ft-bottom {
  margin-top: 80px;
  padding-top: 32px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: var(--font-mono, "JetBrains Mono", monospace);
  font-size: 12px;
  color: var(--color-muted, rgba(240,240,240,0.5));
}

/* ─── TOAST ──────────────────────────────────────────────────── */
.ft-toast {
  position: fixed;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%) translateY(12px);
  background: rgba(18, 18, 18, 0.95);
  color: var(--accent, #00FF94);
  font-family: var(--font-mono, "JetBrains Mono", monospace);
  font-size: 12px;
  letter-spacing: 0.06em;
  padding: 8px 20px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  pointer-events: none;
  opacity: 0;
  backdrop-filter: blur(8px);
  transition: opacity 0.3s ease, transform 0.3s ease;
  z-index: var(--z-toast, 9000);
  white-space: nowrap;
}
.ft-toast--visible {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

/* ─── MOBILE ─────────────────────────────────────────────────── */
@media (max-width: 768px) {
  .ft-inner {
    flex-direction: column;
    gap: 32px;
    text-align: center;
  }
  .ft-links { align-items: center; }
  .ft-socials { flex-wrap: wrap; justify-content: center; }
  .ft-bottom {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
}
`

/* ────────────────────────────────────────────────────────────── */
/*  Component                                                     */
/* ────────────────────────────────────────────────────────────── */

export default function Footer() {
  const [copied, setCopied] = useState(false)

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL)
    } catch {
      // fallback for older browsers
      const ta = document.createElement('textarea')
      ta.value = EMAIL
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <footer className="site-footer" role="contentinfo">
        <div className="ft-inner">

          {/* Left - CTA */}
          <Link href="/contact" className="ft-cta">
            LET&rsquo;S TALK.
          </Link>

          {/* Right - socials + email */}
          <div className="ft-links">
            <div className="ft-socials">
              {SOCIALS.map(s => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ft-social-link"
                >
                  {s.label}
                </a>
              ))}
            </div>
            <button
              className="ft-email-btn"
              onClick={copyEmail}
              aria-label="Copy email address"
            >
              {copied ? 'Copied!' : EMAIL}
            </button>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="ft-bottom">
          <span>© 2026 Anurag Adhikari. All rights reserved.</span>
          <span>Designed &amp; built by Anurag ✦</span>
        </div>
      </footer>

      {/* Copied toast */}
      <div
        className={`ft-toast${copied ? ' ft-toast--visible' : ''}`}
        aria-live="polite"
      >
        Email copied!
      </div>
    </>
  )
}
