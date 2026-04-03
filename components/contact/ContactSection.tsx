'use client'

import { useActionState, useState } from 'react'
import {
  Copy,
  Check,
  Loader2,
  Instagram,
  Linkedin,
  Github,
  Dribbble,
} from 'lucide-react'
import { submitContact, type ContactState } from '@/app/actions/contact'
import Typewriter from '@/components/Typewriter'
import { useMagnetic } from '@/hooks/useMagnetic'

/* ────────────────────────────────────────────────────────────── */
/*  Data                                                          */
/* ────────────────────────────────────────────────────────────── */

const EMAIL = 'hello@anurag.studio'
const WHATSAPP_URL = 'https://wa.me/917980105391'

const WhatsAppIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.886 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
)

const SOCIALS = [
  { icon: WhatsAppIcon, href: WHATSAPP_URL, label: 'WhatsApp' },
  { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
  { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
  { icon: Github, href: 'https://github.com', label: 'GitHub' },
  { icon: Dribbble, href: 'https://dribbble.com', label: 'Dribbble' },
]

const PROJECT_TYPES = [
  'Web Design',
  'Development',
  'Brand Identity',
  'Other',
]

/* ────────────────────────────────────────────────────────────── */
/*  Styles                                                        */
/* ────────────────────────────────────────────────────────────── */

const css = /* css */ `
.contact {
  min-height: 100dvh;
  display: grid;
  grid-template-columns: 2fr 3fr;
  padding-top: var(--nav-h, 72px);
}

/* ── LEFT ─────────────────────────────────────────────────────── */
.contact__left {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: clamp(3rem, 6vw, 5rem) var(--page-px);
  gap: 32px;
}
.contact__heading {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(4rem, 9vw, 7rem);
  line-height: 0.95;
  color: var(--text);
  letter-spacing: -0.03em;
}
.typewriter-char {
  display: inline-block;
}
.contact__desc {
  font-family: var(--font-body);
  font-size: clamp(0.95rem, 1.4vw, 1.1rem);
  color: var(--muted);
  line-height: 1.6;
  max-width: 400px;
}

/* Email row */
.contact__email-row {
  display: flex;
  align-items: center;
  gap: 10px;
}
.contact__email {
  font-family: var(--font-mono);
  font-size: 13px;
  color: var(--accent);
  text-decoration: none;
  transition: opacity 0.2s ease;
}
.contact__email:hover { opacity: 0.8; }
.contact__copy-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: 6px;
  cursor: pointer;
  color: var(--muted);
  transition: color 0.2s ease, border-color 0.2s ease;
}
.contact__copy-btn:hover {
  color: var(--text);
  border-color: var(--muted-2, #555);
}
.contact__copy-btn svg { width: 14px; height: 14px; }

/* Socials */
.contact__socials {
  display: flex;
  gap: 12px;
}
.contact__social {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  color: var(--muted);
  text-decoration: none;
  transition: color 0.3s ease, transform 0.3s ease;
}
.contact__social:hover {
  color: var(--text);
  transform: scale(1.15);
}
.contact__social svg { width: 18px; height: 18px; }

/* ── RIGHT (form card) ───────────────────────────────────────── */
.contact__right {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(3rem, 6vw, 5rem) var(--page-px);
}
.contact__card {
  width: 100%;
  max-width: 540px;
  background: rgba(20, 20, 20, 0.8);
  border: 1px solid var(--border);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  padding: clamp(28px, 3vw, 40px);
}

/* Form fields */
.cf-group {
  position: relative;
  margin-bottom: 24px;
}
.cf-label {
  position: absolute;
  left: 0;
  top: 14px;
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--muted);
  letter-spacing: 0.04em;
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
  border-bottom: 1px solid var(--border);
  padding: 14px 0 10px;
  font-family: var(--font-body);
  font-size: 15px;
  color: var(--text);
  outline: none;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  border-radius: 0;
  -webkit-appearance: none;
}
.cf-select {
  cursor: pointer;
}
.cf-select option {
  background: var(--surface);
  color: var(--text);
}
.cf-textarea {
  resize: vertical;
  min-height: 100px;
}
.cf-input:focus,
.cf-select:focus,
.cf-textarea:focus {
  border-color: var(--accent);
  box-shadow: 0 2px 8px rgba(255, 77, 0, 0.08);
}

/* Float label on focus or filled */
.cf-input:focus ~ .cf-label,
.cf-input:not(:placeholder-shown) ~ .cf-label,
.cf-select:focus ~ .cf-label,
.cf-select:valid ~ .cf-label,
.cf-textarea:focus ~ .cf-label,
.cf-textarea:not(:placeholder-shown) ~ .cf-label {
  transform: translateY(-22px);
  font-size: 10px;
  color: var(--accent);
}

/* Submit button */
.cf-submit {
  width: 100%;
  padding: 16px;
  margin-top: 8px;
  background: var(--accent);
  color: var(--bg);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 15px;
  letter-spacing: 0.04em;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: transform 0.15s ease, opacity 0.2s ease;
}
.cf-submit:hover:not(:disabled) { opacity: 0.9; }
.cf-submit:active:not(:disabled) { transform: scale(0.98); }
.cf-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.cf-submit svg { width: 18px; height: 18px; }

/* Magnetic wrapper - CSS variable spring (no framer-motion) */
.cf-mag-wrap {
  transform: translate(var(--mx, 0px), var(--my, 0px));
  transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
}

/* Spinner */
@keyframes cf-spin {
  to { transform: rotate(360deg); }
}
.cf-spinner {
  animation: cf-spin 0.8s linear infinite;
}

/* Feedback */
.cf-feedback {
  margin-top: 16px;
  padding: 12px;
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.04em;
  text-align: center;
}
.cf-feedback--success {
  background: rgba(255, 77, 0, 0.08);
  color: var(--accent);
  border: 1px solid rgba(255, 77, 0, 0.15);
}
.cf-feedback--error {
  background: rgba(239, 68, 68, 0.08);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.15);
}

/* ── RESPONSIVE ──────────────────────────────────────────────── */
@media (max-width: 768px) {
  .contact {
    grid-template-columns: 1fr;
  }
  .contact__left {
    padding-bottom: 0;
  }
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
  const submitMag = useMagnetic()

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
        <div className="contact__left">
          <h1 className="contact__heading">
            <Typewriter text="LET'S TALK." speed={60} startDelay={300} />
          </h1>

          <p className="contact__desc">
            Open for freelance, collaborations, and full-time roles.
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
        </div>

        {/* ── Right (form) ─────────────────────────────────── */}
        <div className="contact__right">
          <form className="contact__card" action={formAction}>
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
                  <option key={t} value={t}>
                    {t}
                  </option>
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
            <div ref={submitMag.ref as React.RefObject<HTMLDivElement>} className="cf-mag-wrap">
              <button type="submit" className="cf-submit" disabled={isPending} data-magnetic>
                {isPending ? (
                  <>
                    <Loader2 className="cf-spinner" /> Sending…
                  </>
                ) : state?.success ? (
                  <>
                    <Check /> Sent!
                  </>
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
