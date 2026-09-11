'use client'

/**
 * The Kharchaaaa waitlist.
 *
 * Deliberately the contact form's twin rather than a new pattern: same card,
 * same corner brackets, same floating labels, same mono micro-labels. A
 * visitor who has already been to /contact should recognise this instantly.
 *
 * What differs is the register. The contact form asks you to describe a
 * project; this one asks for as little as it can get away with, because every
 * extra field on a waitlist is a person who does not join. Two fields are
 * required. The other three are marked optional and say why they are useful.
 */

import { useActionState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Loader2, Check, ArrowUpRight } from 'lucide-react'
import { joinWaitlist, type WaitlistState } from '@/app/actions/waitlist'
import { useMagnetic } from '@/hooks/useMagnetic'

/** The product has two front ends, so the waitlist asks which one you want. */
const PLATFORMS = [
    'iPhone home screen',
    'Telegram',
    'Both',
]

const css = /* css */ `
.wl {
  min-height: 100dvh;
  display: grid;
  grid-template-columns: 2fr 3fr;
  padding-top: var(--nav-h, 72px);
  overflow: hidden;
}

/* ─── LEFT ───────────────────────────────────────────────────── */
.wl__left {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: clamp(3rem, 6vw, 5rem) clamp(2rem, 5vw, 4rem) clamp(3rem, 6vw, 5rem) var(--page-px, clamp(1.5rem,5vw,6rem));
  gap: 26px;
  position: relative;
  opacity: 0;
  transform: translateX(-28px);
  transition: opacity 0.9s cubic-bezier(0.22,1,0.36,1), transform 0.9s cubic-bezier(0.22,1,0.36,1);
}
.wl__left.is-visible { opacity: 1; transform: translateX(0); }

.wl__left::before {
  content: '';
  position: absolute;
  top: 20%; left: 0;
  width: 2px; height: 0;
  background: linear-gradient(to bottom, transparent, var(--accent, #00FF94), transparent);
  transition: height 1.2s cubic-bezier(0.22,1,0.36,1) 0.4s;
}
.wl__left.is-visible::before { height: 60%; }

.wl__badge {
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
.wl__badge-dot {
  width: 7px; height: 7px;
  background: var(--accent, #00FF94);
  border-radius: 50%;
  animation: wl-pulse 2s ease infinite;
  flex-shrink: 0;
}
@keyframes wl-pulse {
  0%,100% { opacity: 1; box-shadow: 0 0 0 0 rgba(0,255,148,0.5); }
  50% { opacity: 0.7; box-shadow: 0 0 0 5px rgba(0,255,148,0); }
}

.wl__title {
  font-family: var(--font-display, 'Space Grotesk', sans-serif);
  font-weight: 700;
  font-size: clamp(2.4rem, 5.5vw, 4.2rem);
  line-height: 0.98;
  letter-spacing: -0.03em;
  color: var(--color-fg, #FAFAFA);
  margin: 0;
}
.wl__title em {
  font-style: normal;
  color: var(--accent, #00FF94);
}
.wl__body {
  font-family: var(--font-body, 'DM Sans', sans-serif);
  font-size: 15px;
  line-height: 1.75;
  color: rgba(255,255,255,0.5);
  max-width: 42ch;
  margin: 0;
}
.wl__note {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 10px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.24);
  line-height: 1.9;
  margin: 0;
}
.wl__back {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 11px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.4);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  width: fit-content;
  transition: color 0.25s ease;
}
.wl__back:hover { color: var(--accent, #00FF94); }
.wl__back svg { width: 13px; height: 13px; }

/* ─── RIGHT ──────────────────────────────────────────────────── */
.wl__right {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: clamp(3rem, 6vw, 5rem) var(--page-px, clamp(1.5rem,5vw,6rem)) clamp(3rem, 6vw, 5rem) clamp(2rem, 5vw, 4rem);
  opacity: 0;
  transform: translateX(28px);
  transition: opacity 0.9s cubic-bezier(0.22,1,0.36,1) 0.15s, transform 0.9s cubic-bezier(0.22,1,0.36,1) 0.15s;
}
.wl__right.is-visible { opacity: 1; transform: translateX(0); }

.wl__card {
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
.wl__card::before,
.wl__card::after {
  content: '';
  position: absolute;
  width: 16px; height: 16px;
  border-color: var(--accent, #00FF94);
  border-style: solid;
  opacity: 0.4;
}
.wl__card::before { top: 0; left: 0; border-width: 1px 0 0 1px; }
.wl__card::after { bottom: 0; right: 0; border-width: 0 1px 1px 0; }

.wl-card-label {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.2);
  margin-bottom: 24px;
  display: block;
}

.wl-group { position: relative; margin-bottom: 28px; }
.wl-label {
  position: absolute;
  left: 0; top: 14px;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 11px;
  color: rgba(255,255,255,0.3);
  letter-spacing: 0.08em;
  pointer-events: none;
  transition: transform 0.25s ease, font-size 0.25s ease, color 0.25s ease;
  transform-origin: left top;
}
.wl-input,
.wl-select {
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
.wl-select { cursor: pointer; }
.wl-select option { background: #111; color: #FAFAFA; }
.wl-input:focus,
.wl-select:focus {
  border-color: var(--accent, #00FF94);
  box-shadow: 0 2px 0 rgba(0,255,148,0.35), 0 4px 20px rgba(0,255,148,0.06);
}
.wl-input:focus ~ .wl-label,
.wl-input:not(:placeholder-shown) ~ .wl-label,
.wl-select:focus ~ .wl-label,
.wl-select:valid ~ .wl-label {
  transform: translateY(-22px);
  font-size: 9px;
  color: var(--accent, #00FF94);
  letter-spacing: 0.12em;
}

/* The honeypot. Off-screen rather than display:none, because some bots skip
   anything that is not rendered. No label, no tab stop, no autofill. */
.wl-pot {
  position: absolute;
  left: -9999px;
  width: 1px; height: 1px;
  opacity: 0;
  pointer-events: none;
}

.wl-submit-wrap {
  transform: translate(var(--mx, 0px), var(--my, 0px));
  transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
}
.wl-submit {
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
.wl-submit::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.15);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.4s ease;
}
.wl-submit:hover:not(:disabled)::before { transform: scaleX(1); }
.wl-submit:active:not(:disabled) { transform: scale(0.98); }
.wl-submit:disabled { opacity: 0.55; cursor: not-allowed; }
.wl-submit svg { width: 16px; height: 16px; }

@keyframes wl-spin { to { transform: rotate(360deg); } }
.wl-spinner { animation: wl-spin 0.8s linear infinite; }

.wl-feedback {
  margin-top: 14px;
  padding: 11px 14px;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 11px;
  letter-spacing: 0.06em;
  text-align: center;
  border-radius: 2px;
}
.wl-feedback--success {
  background: rgba(0,255,148,0.07);
  color: var(--accent, #00FF94);
  border: 1px solid rgba(0,255,148,0.15);
}
.wl-feedback--error {
  background: rgba(255,59,78,0.07);
  color: #FF3B4E;
  border: 1px solid rgba(255,59,78,0.15);
}

/* The state after a successful join replaces the form rather than sitting
   under it, because leaving the fields on screen invites a second submit. */
.wl-done {
  text-align: center;
  padding: 18px 0 6px;
}
.wl-done__mark {
  width: 46px; height: 46px;
  margin: 0 auto 20px;
  border-radius: 50%;
  border: 1px solid rgba(0,255,148,0.3);
  background: rgba(0,255,148,0.07);
  display: grid;
  place-items: center;
  color: var(--accent, #00FF94);
}
.wl-done__title {
  font-family: var(--font-display, 'Space Grotesk', sans-serif);
  font-weight: 700;
  font-size: 22px;
  letter-spacing: -0.01em;
  color: var(--color-fg, #FAFAFA);
  margin: 0 0 10px;
}
.wl-done__body {
  font-family: var(--font-body, 'DM Sans', sans-serif);
  font-size: 14px;
  line-height: 1.7;
  color: rgba(255,255,255,0.45);
  margin: 0 auto;
  max-width: 34ch;
}

/* ─── RESPONSIVE ─────────────────────────────────────────────── */
@media (max-width: 1000px) {
  .wl { grid-template-columns: 1fr; }
  .wl__left {
    padding: clamp(2.5rem,8vw,4rem) var(--page-px, clamp(1.5rem,5vw,6rem)) 0;
    gap: 20px;
  }
  .wl__right {
    padding: clamp(2rem,6vw,3rem) var(--page-px, clamp(1.5rem,5vw,6rem)) clamp(4rem,10vw,6rem);
  }
  .wl__card { max-width: none; }
}
@media (prefers-reduced-motion: reduce) {
  .wl__left, .wl__right { transition: none; opacity: 1; transform: none; }
  .wl__badge-dot { animation: none; }
}
`

export default function WaitlistForm() {
    const [state, formAction, isPending] = useActionState<WaitlistState, FormData>(
        joinWaitlist,
        null
    )
    const submitMag = useMagnetic()
    const leftRef = useRef<HTMLDivElement>(null)
    const rightRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((e) => {
                    if (e.isIntersecting) e.target.classList.add('is-visible')
                })
            },
            { threshold: 0.1 }
        )
        if (leftRef.current) io.observe(leftRef.current)
        if (rightRef.current) io.observe(rightRef.current)
        return () => io.disconnect()
    }, [])

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: css }} />

            <div className="wl">
                {/* ── Left ─────────────────────────────────────── */}
                <div className="wl__left" ref={leftRef}>
                    <span className="wl__badge">
                        <span className="wl__badge-dot" />
                        Invite only
                    </span>

                    <h1 className="wl__title">
                        Ask for a<br />way <em>in</em>.
                    </h1>

                    <p className="wl__body">
                        Kharchaaaa is an expense book you type into. It is not open yet.
                        Leave an email and you will get a code when there is room, which
                        is the only thing that opens it.
                    </p>

                    <p className="wl__note">
                        No spend data leaves your phone, ever.
                        <br />
                        This list is one email address and nothing else.
                    </p>

                    <Link href="/work/kharchaaaa" className="wl__back">
                        Read the case study first <ArrowUpRight />
                    </Link>
                </div>

                {/* ── Right ────────────────────────────────────── */}
                <div className="wl__right" ref={rightRef}>
                    <div className="wl__card">
                        {state?.success ? (
                            <div className="wl-done">
                                <div className="wl-done__mark">
                                    <Check size={20} />
                                </div>
                                <h2 className="wl-done__title">You are on the list.</h2>
                                <p className="wl-done__body">
                                    Nothing else to do. When there is room you will get a code
                                    at that address, from a person, not a mailing list.
                                </p>
                            </div>
                        ) : (
                            <form className="wl-form" action={formAction}>
                                <span className="wl-card-label">Request an invite</span>

                                {/* Honeypot. Never filled by a person. */}
                                <input
                                    className="wl-pot"
                                    type="text"
                                    name="company"
                                    tabIndex={-1}
                                    autoComplete="off"
                                    aria-hidden="true"
                                />

                                <div className="wl-group">
                                    <input
                                        type="text"
                                        name="name"
                                        className="wl-input"
                                        placeholder=" "
                                        required
                                        autoComplete="name"
                                    />
                                    <label className="wl-label">Name</label>
                                </div>

                                <div className="wl-group">
                                    <input
                                        type="email"
                                        name="email"
                                        className="wl-input"
                                        placeholder=" "
                                        required
                                        autoComplete="email"
                                    />
                                    <label className="wl-label">Email</label>
                                </div>

                                <div className="wl-group">
                                    <select
                                        name="platform"
                                        className="wl-select"
                                        required
                                        defaultValue=""
                                    >
                                        <option value="" disabled hidden />
                                        {PLATFORMS.map((p) => (
                                            <option key={p} value={p}>
                                                {p}
                                            </option>
                                        ))}
                                    </select>
                                    <label className="wl-label">Where you would use it</label>
                                </div>

                                <div className="wl-group">
                                    <input
                                        type="text"
                                        name="telegram"
                                        className="wl-input"
                                        placeholder=" "
                                        autoComplete="off"
                                    />
                                    <label className="wl-label">Telegram handle, optional</label>
                                </div>

                                <div className="wl-group">
                                    <input
                                        type="text"
                                        name="current"
                                        className="wl-input"
                                        placeholder=" "
                                        autoComplete="off"
                                    />
                                    <label className="wl-label">
                                        What you use today, optional
                                    </label>
                                </div>

                                <div
                                    ref={submitMag.ref as React.RefObject<HTMLDivElement>}
                                    className="wl-submit-wrap"
                                >
                                    <button
                                        type="submit"
                                        className="wl-submit"
                                        disabled={isPending}
                                        data-magnetic
                                    >
                                        {isPending ? (
                                            <>
                                                <Loader2 className="wl-spinner" /> Adding you…
                                            </>
                                        ) : (
                                            'Request an invite'
                                        )}
                                    </button>
                                </div>

                                {state?.error && (
                                    <div className="wl-feedback wl-feedback--error">
                                        {state.error}
                                    </div>
                                )}
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}
