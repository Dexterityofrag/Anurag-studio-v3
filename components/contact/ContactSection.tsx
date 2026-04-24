'use client'

import { useActionState, useState, useEffect, useRef } from 'react'
import {
  Copy,
  Check,
  Loader2,
  Instagram,
  Linkedin,
  Github,
  ArrowUpRight,
} from 'lucide-react'
import { CV_URL } from '@/lib/constants'

const BehanceIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M7.799 5.698c.589 0 1.12.051 1.606.156.484.103.9.27 1.25.507.347.236.617.546.81.928.19.38.285.853.285 1.411 0 .602-.138 1.104-.41 1.507-.274.4-.674.728-1.207.984.72.211 1.26.576 1.605 1.1.348.524.52 1.158.52 1.897 0 .6-.113 1.12-.343 1.552-.23.436-.544.794-.941 1.07a4.03 4.03 0 01-1.362.616 6.067 6.067 0 01-1.57.198H2V5.698h5.799zm-.352 4.43c.48 0 .878-.114 1.192-.345.312-.23.463-.609.463-1.133 0-.291-.053-.528-.156-.717a1.172 1.172 0 00-.427-.45 1.733 1.733 0 00-.614-.231 3.818 3.818 0 00-.72-.066H4.65v2.942h2.797zm.155 4.646c.267 0 .521-.026.764-.078.24-.052.45-.143.634-.273.182-.13.329-.305.44-.528.108-.22.164-.501.164-.842 0-.663-.188-1.137-.562-1.42-.374-.287-.87-.43-1.487-.43H4.65v3.571h2.952zm8.562-.387c.36.35.88.525 1.555.525.484 0 .9-.121 1.25-.367.347-.243.56-.5.638-.771h2.272c-.363 1.127-.92 1.934-1.67 2.42-.75.485-1.657.73-2.725.73-.741 0-1.41-.12-2.005-.358a4.27 4.27 0 01-1.512-1.023 4.584 4.584 0 01-.957-1.585 5.813 5.813 0 01-.335-2.01c0-.698.115-1.35.345-1.951a4.66 4.66 0 012.5-2.637 4.89 4.89 0 011.964-.384c.803 0 1.5.156 2.09.467.588.311 1.072.725 1.456 1.244.383.519.66 1.108.827 1.77.168.664.23 1.355.187 2.07h-6.777c0 .697.227 1.36.587 1.71zM18.443 9.18c-.289-.316-.786-.489-1.379-.489-.387 0-.71.066-.967.197a1.981 1.981 0 00-.613.483 1.7 1.7 0 00-.325.59 2.63 2.63 0 00-.117.52h4.199c-.06-.648-.289-1.095-.578-1.3h-.22zm-3.648-5.12h5.258v1.275h-5.258V4.061z"/>
  </svg>
)
import { submitContact, type ContactState } from '@/app/actions/contact'
import Typewriter from '@/components/Typewriter'
import { useMagnetic } from '@/hooks/useMagnetic'

/* ────────────────────────────────────────────────────────────── */
/*  Data                                                          */
/* ────────────────────────────────────────────────────────────── */

const EMAIL = 'hello@anurag.studio'
const WHATSAPP_URL = 'https://wa.me/917980105391'

const WhatsAppIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.886 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
)

const SOCIALS = [
  { icon: WhatsAppIcon, href: WHATSAPP_URL, label: 'WhatsApp' },
  { icon: Instagram, href: 'https://instagram.com/lightlyricist', label: 'Instagram' },
  { icon: Linkedin, href: 'https://www.linkedin.com/in/dexterityofrag', label: 'LinkedIn' },
  { icon: Github, href: 'https://github.com/Dexterityofrag', label: 'GitHub' },
  { icon: BehanceIcon, href: 'https://www.behance.net/anuragadhikari5', label: 'Behance' },
]

const PROJECT_TYPES = ['Web Design', 'Development', 'Brand Identity', 'Other']

/* ────────────────────────────────────────────────────────────── */
/*  Styles                                                        */
/* ────────────────────────────────────────────────────────────── */

const css = /* css */ `
/* ─── ROOT ───────────────────────────────────────────────────── */
.contact {
  min-height: 100dvh;
  display: grid;
  grid-template-columns: 2fr 3fr;
  padding-top: var(--nav-h, 72px);
  overflow: hidden;
}

/* ─── LEFT ───────────────────────────────────────────────────── */
.contact__left {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: clamp(3rem, 6vw, 5rem) clamp(2rem, 5vw, 4rem) clamp(3rem, 6vw, 5rem) var(--page-px, clamp(1.5rem,5vw,6rem));
  gap: 28px;
  position: relative;
  opacity: 0;
  transform: translateX(-28px);
  transition: opacity 0.9s cubic-bezier(0.22,1,0.36,1), transform 0.9s cubic-bezier(0.22,1,0.36,1);
}
.contact__left.is-visible {
  opacity: 1;
  transform: translateX(0);
}

/* Vertical accent line */
.contact__left::before {
  content: '';
  position: absolute;
  top: 20%;
  left: 0;
  width: 2px;
  height: 0;
  background: linear-gradient(to bottom, transparent, var(--accent, #00FF94), transparent);
  transition: height 1.2s cubic-bezier(0.22,1,0.36,1) 0.4s;
}
.contact__left.is-visible::before {
  height: 60%;
}

/* Status badge */
.contact__badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.45);
  border: 1px solid rgba(255,255,255,0.1);
  padding: 7px 16px 7px 12px;
  border-radius: 999px;
  width: fit-content;
}
.contact__badge-dot {
  width: 7px; height: 7px;
  background: var(--accent, #00FF94);
  border-radius: 50%;
  animation: cs-pulse 2s ease infinite;
  flex-shrink: 0;
}
@keyframes cs-pulse {
  0%,100% { opacity: 1; box-shadow: 0 0 0 0 rgba(0,255,148,0.5); }
  50% { opacity: 0.7; box-shadow: 0 0 0 5px rgba(0,255,148,0); }
}

/* Heading */
.contact__heading {
  font-family: var(--font-display, 'Space Grotesk', sans-serif);
  font-weight: 700;
  font-size: clamp(4rem, 9vw, 7.5rem);
  line-height: 0.92;
  color: var(--color-fg, #FAFAFA);
  letter-spacing: -0.03em;
  margin: 0;
}

/* Description */
.contact__desc {
  font-family: var(--font-body, 'DM Sans', sans-serif);
  font-size: clamp(0.9rem, 1.3vw, 1.05rem);
  color: rgba(255,255,255,0.4);
  line-height: 1.65;
  max-width: 360px;
}

/* Email row */
.contact__email-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.contact__email {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: clamp(12px, 1.2vw, 14px);
  color: var(--accent, #00FF94);
  text-decoration: none;
  transition: opacity 0.2s ease;
  letter-spacing: 0.03em;
}
.contact__email:hover { opacity: 0.75; }
.contact__copy-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px; height: 30px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 6px;
  cursor: pointer;
  color: rgba(255,255,255,0.4);
  transition: all 0.2s ease;
}
.contact__copy-btn:hover {
  background: rgba(0,255,148,0.1);
  border-color: rgba(0,255,148,0.3);
  color: var(--accent, #00FF94);
}
.contact__copy-btn svg { width: 13px; height: 13px; }

/* Socials */
.contact__socials {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}
.contact__social {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px; height: 38px;
  color: rgba(255,255,255,0.3);
  text-decoration: none;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.06);
  transition: color 0.25s ease, border-color 0.25s ease, background 0.25s ease, transform 0.25s ease;
}
.contact__social:hover {
  color: var(--accent, #00FF94);
  border-color: rgba(0,255,148,0.25);
  background: rgba(0,255,148,0.06);
  transform: translateY(-2px);
}
.contact__social svg { width: 16px; height: 16px; }

/* CV CTA (standalone) */
.contact__cv-wrap {
  margin-top: 32px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.contact__cv-label {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 10px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.35);
}
.contact__cv {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  align-self: flex-start;
  font-family: var(--font-display, 'Space Grotesk', sans-serif);
  font-size: clamp(14px, 1.3vw, 17px);
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--accent, #00FF94);
  text-decoration: none;
  padding: 12px 22px;
  border: 1px solid rgba(0,255,148,0.35);
  border-radius: 999px;
  position: relative;
  overflow: hidden;
  transition: color 0.25s ease, border-color 0.25s ease, transform 0.25s ease;
}
.contact__cv::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--accent, #00FF94);
  transform: translateY(100%);
  transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
  z-index: 0;
}
.contact__cv > * { position: relative; z-index: 1; }
.contact__cv:hover { color: #000; border-color: var(--accent, #00FF94); transform: translateY(-1px); }
.contact__cv:hover::before { transform: translateY(0); }
.contact__cv svg { transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1); }
.contact__cv:hover svg { transform: translate(3px, -3px); }

/* ─── RIGHT ──────────────────────────────────────────────────── */
.contact__right {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(3rem, 6vw, 5rem) var(--page-px, clamp(1.5rem,5vw,6rem)) clamp(3rem, 6vw, 5rem) clamp(2rem, 4vw, 3rem);
  opacity: 0;
  transform: translateX(28px);
  transition: opacity 0.9s cubic-bezier(0.22,1,0.36,1) 0.15s, transform 0.9s cubic-bezier(0.22,1,0.36,1) 0.15s;
}
.contact__right.is-visible {
  opacity: 1;
  transform: translateX(0);
}

/* Form card */
.contact__card {
  width: 100%;
  max-width: 540px;
  background: rgba(12,12,12,0.7);
  border: 1px solid rgba(255,255,255,0.07);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  padding: clamp(28px, 3.5vw, 44px);
  border-radius: 2px;
  position: relative;
  overflow: hidden;
}

/* Corner bracket decoration */
.contact__card::before,
.contact__card::after {
  content: '';
  position: absolute;
  width: 16px; height: 16px;
  border-color: var(--accent, #00FF94);
  border-style: solid;
  opacity: 0.4;
}
.contact__card::before {
  top: 0; left: 0;
  border-width: 1px 0 0 1px;
}
.contact__card::after {
  bottom: 0; right: 0;
  border-width: 0 1px 1px 0;
}

/* Form label */
.cf-card-label {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.2);
  margin-bottom: 24px;
  display: block;
}

/* ─── FORM FIELDS ─────────────────────────────────────────────── */
.cf-group {
  position: relative;
  margin-bottom: 28px;
}
.cf-label {
  position: absolute;
  left: 0;
  top: 14px;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 11px;
  color: rgba(255,255,255,0.3);
  letter-spacing: 0.08em;
  pointer-events: none;
  transition: transform 0.25s ease, font-size 0.25s ease, color 0.25s ease;
  transform-origin: left top;
}
.cf-input,
.cf-select,
.cf-textarea {
  width: 100%;
  background: transparent;
  border: none;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  padding: 14px 0 10px;
  font-family: var(--font-body, 'DM Sans', sans-serif);
  font-size: 15px;
  color: var(--color-fg, #FAFAFA);
  outline: none;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  border-radius: 0;
  -webkit-appearance: none;
}
.cf-select {
  cursor: pointer;
}
.cf-select option {
  background: #111;
  color: #FAFAFA;
}
.cf-textarea {
  resize: vertical;
  min-height: 100px;
}
.cf-input:focus,
.cf-select:focus,
.cf-textarea:focus {
  border-color: var(--accent, #00FF94);
  box-shadow: 0 2px 0 rgba(0,255,148,0.35), 0 4px 20px rgba(0,255,148,0.06);
}

/* Float label */
.cf-input:focus ~ .cf-label,
.cf-input:not(:placeholder-shown) ~ .cf-label,
.cf-select:focus ~ .cf-label,
.cf-select:valid ~ .cf-label,
.cf-textarea:focus ~ .cf-label,
.cf-textarea:not(:placeholder-shown) ~ .cf-label {
  transform: translateY(-22px);
  font-size: 9px;
  color: var(--accent, #00FF94);
  letter-spacing: 0.12em;
}

/* ─── SUBMIT BUTTON ──────────────────────────────────────────── */
.cf-submit-wrap {
  transform: translate(var(--mx, 0px), var(--my, 0px));
  transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
}
.cf-submit {
  width: 100%;
  padding: 16px;
  margin-top: 8px;
  background: var(--accent, #00FF94);
  color: #000;
  font-family: var(--font-display, 'Space Grotesk', sans-serif);
  font-weight: 700;
  font-size: 14px;
  letter-spacing: 0.08em;
  border: none;
  cursor: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  position: relative;
  overflow: hidden;
  transition: opacity 0.2s ease, transform 0.15s ease;
}
.cf-submit::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.15);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.4s ease;
}
.cf-submit:hover:not(:disabled)::before {
  transform: scaleX(1);
}
.cf-submit:active:not(:disabled) { transform: scale(0.98); }
.cf-submit:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.cf-submit svg { width: 16px; height: 16px; }

@keyframes cf-spin {
  to { transform: rotate(360deg); }
}
.cf-spinner { animation: cf-spin 0.8s linear infinite; }

/* Feedback */
.cf-feedback {
  margin-top: 14px;
  padding: 11px 14px;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 11px;
  letter-spacing: 0.06em;
  text-align: center;
  border-radius: 2px;
}
.cf-feedback--success {
  background: rgba(0,255,148,0.07);
  color: var(--accent, #00FF94);
  border: 1px solid rgba(0,255,148,0.15);
}
.cf-feedback--error {
  background: rgba(239,68,68,0.07);
  color: #f87171;
  border: 1px solid rgba(239,68,68,0.2);
}

/* ─── RESPONSIVE ─────────────────────────────────────────────── */
@media (max-width: 768px) {
  .contact { grid-template-columns: 1fr; }
  .contact__left {
    padding-bottom: 0;
    transform: translateY(24px);
  }
  .contact__left.is-visible { transform: translateY(0); }
  .contact__right {
    transform: translateY(24px);
  }
  .contact__right.is-visible { transform: translateY(0); }
}
@media (prefers-reduced-motion: reduce) {
  .contact__left, .contact__right { transition: opacity 0.3s ease; transform: none !important; }
  .contact__badge-dot { animation: none; }
}
`

/* ────────────────────────────────────────────────────────────── */
/*  Component                                                     */
/* ────────────────────────────────────────────────────────────── */

export default function ContactSection() {
  const [state, formAction, isPending] = useActionState<ContactState, FormData>(
    submitContact,
    null
  )
  const [copied, setCopied] = useState(false)
  const submitMag  = useMagnetic()
  const leftRef    = useRef<HTMLDivElement>(null)
  const rightRef   = useRef<HTMLDivElement>(null)

  /* Entrance animation */
  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          io.unobserve(entry.target)
        }
      })
    }, { threshold: 0.1 })

    if (leftRef.current)  io.observe(leftRef.current)
    if (rightRef.current) io.observe(rightRef.current)
    return () => io.disconnect()
  }, [])

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL)
    } catch {
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

      <div className="contact">
        {/* ── Left ──────────────────────────────────────────── */}
        <div className="contact__left" ref={leftRef}>

          {/* Availability badge */}
          <div className="contact__badge">
            <span className="contact__badge-dot" aria-hidden="true" />
            Available for new projects
          </div>

          <h1 className="contact__heading">
            <Typewriter text="LET'S TALK." speed={60} startDelay={300} />
          </h1>

          <p className="contact__desc">
            Open for freelance, collaborations, and full-time roles.
            Got a project in mind? Let&apos;s make it real.
          </p>

          <div className="contact__email-row">
            <a href={`mailto:${EMAIL}`} className="contact__email">
              {EMAIL}
            </a>
            <button
              className="contact__copy-btn"
              onClick={copyEmail}
              aria-label="Copy email"
              title="Copy email"
            >
              {copied ? <Check /> : <Copy />}
            </button>
          </div>

          <div className="contact__socials">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="contact__social"
                aria-label={s.label}
              >
                <s.icon />
              </a>
            ))}
          </div>

          {/* ── CV CTA (standalone) ─────────────────────────── */}
          <div className="contact__cv-wrap">
            <span className="contact__cv-label">The One-Pager</span>
            <a
              href={CV_URL}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="contact__cv"
            >
              <span>Grab the CV</span>
              <ArrowUpRight size={16} />
            </a>
          </div>
        </div>

        {/* ── Right (form) ─────────────────────────────────── */}
        <div className="contact__right" ref={rightRef}>
          <form className="contact__card" action={formAction}>
            <span className="cf-card-label">Send a message</span>

            {/* Name */}
            <div className="cf-group">
              <input
                type="text"
                name="name"
                className="cf-input"
                placeholder=" "
                required
                autoComplete="name"
              />
              <label className="cf-label">Name</label>
            </div>

            {/* Email */}
            <div className="cf-group">
              <input
                type="email"
                name="email"
                className="cf-input"
                placeholder=" "
                required
                autoComplete="email"
              />
              <label className="cf-label">Email</label>
            </div>

            {/* Project Type */}
            <div className="cf-group">
              <select name="projectType" className="cf-select" required defaultValue="">
                <option value="" disabled hidden />
                {PROJECT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <label className="cf-label">Project Type</label>
            </div>

            {/* Message */}
            <div className="cf-group">
              <textarea
                name="message"
                className="cf-textarea"
                placeholder=" "
                required
                rows={4}
              />
              <label className="cf-label">Message</label>
            </div>

            {/* Submit */}
            <div
              ref={submitMag.ref as React.RefObject<HTMLDivElement>}
              className="cf-submit-wrap"
            >
              <button
                type="submit"
                className="cf-submit"
                disabled={isPending}
                data-magnetic
              >
                {isPending ? (
                  <><Loader2 className="cf-spinner" /> Sending…</>
                ) : state?.success ? (
                  <><Check /> Sent!</>
                ) : (
                  'Send Message'
                )}
              </button>
            </div>

            {/* Feedback */}
            {state?.success && (
              <div className="cf-feedback cf-feedback--success">
                Message sent! I&apos;ll be in touch soon.
              </div>
            )}
            {state?.error && (
              <div className="cf-feedback cf-feedback--error">
                {state.error}
              </div>
            )}
          </form>
        </div>
      </div>
    </>
  )
}
