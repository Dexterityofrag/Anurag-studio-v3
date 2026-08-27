'use client'

import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { ASK_AI_PROMPT, ASK_AI_PROVIDERS, LLMS_TXT_URL } from '@/lib/ask-ai'

/* ────────────────────────────────────────────────────────────── */
/*  Styles                                                        */
/*                                                                */
/*  The whole thing is one fixed island in the bottom-right       */
/*  corner: a scrim, a panel, and the trigger. No measuring, no   */
/*  portal — the corner is the anchor, so the panel simply grows  */
/*  up and left out of the button.                                */
/* ────────────────────────────────────────────────────────────── */

const css = /* css */ `
/* Animatable gradient angle. Without @property the conic gradient snaps
   instead of turning, so the fallback below just holds it still. */
@property --ai-turn {
  syntax: '<angle>';
  inherits: false;
  initial-value: 0deg;
}

.aiw {
  --ai-1: var(--accent, #00FF94);
  --ai-2: #12E0E8;
  --ai-3: #6C7BFF;
  --ai-4: #FF5CA8;
  --ai-5: #FFC46B;
  --ai-grad: conic-gradient(
    from var(--ai-turn),
    var(--ai-1), var(--ai-2), var(--ai-3), var(--ai-4), var(--ai-5), var(--ai-1)
  );
  --ai-edge: 24px;

  position: fixed;
  right: var(--ai-edge);
  bottom: var(--ai-edge);
  z-index: 5000;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 14px;
  font-family: var(--font-display, "Space Grotesk", sans-serif);
}

/* ─── SCRIM ──────────────────────────────────────────────────── */
/* Darkens and softens the page so the panel reads as the only thing
   happening. Pointer-events off while closed so the page stays live. */
.aiw__scrim {
  position: fixed;
  inset: 0;
  border: 0;
  padding: 0;
  background:
    radial-gradient(120% 90% at 100% 100%, rgba(0,0,0,0.35), rgba(0,0,0,0.72));
  -webkit-backdrop-filter: blur(3px) saturate(120%);
  backdrop-filter: blur(3px) saturate(120%);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.55s cubic-bezier(0.22,1,0.36,1);
}
.aiw.is-open .aiw__scrim { opacity: 1; pointer-events: auto; }

/* ─── PANEL ──────────────────────────────────────────────────── */
.aiw__panel {
  position: relative;
  width: 306px;
  max-width: calc(100vw - (var(--ai-edge) * 2));
  max-height: calc(100dvh - 150px);
  border-radius: 20px;
  overflow: hidden;
  background: rgba(9,9,10,0.72);
  -webkit-backdrop-filter: blur(28px) saturate(200%);
  backdrop-filter: blur(28px) saturate(200%);
  box-shadow:
    0 40px 90px rgba(0,0,0,0.6),
    0 2px 10px rgba(0,0,0,0.4);

  /* Closed: collapsed into the button's corner, blurred out of being. */
  opacity: 0;
  transform: translateY(18px) scale(0.86);
  transform-origin: 100% 100%;
  filter: blur(16px);
  pointer-events: none;
  transition:
    opacity 0.34s ease,
    filter 0.44s ease,
    transform 0.62s cubic-bezier(0.16, 1.16, 0.3, 1);
}
.aiw.is-open .aiw__panel {
  opacity: 1;
  transform: none;
  filter: blur(0);
  pointer-events: auto;
}

/* Living gradient hairline around the panel */
.aiw__panel::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px;
  background: var(--ai-grad);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
          mask-composite: exclude;
  opacity: 0.55;
  pointer-events: none;
}
.aiw.is-open .aiw__panel::before { animation: ai-turn 7s linear infinite; }

/* Aurora — the thing that makes it feel like it is thinking */
.aiw__aura {
  position: absolute;
  inset: -55%;
  background: var(--ai-grad);
  filter: blur(46px);
  opacity: 0;
  transform: scale(0.5);
  transition: opacity 0.8s ease, transform 1.1s cubic-bezier(0.22,1,0.36,1);
  pointer-events: none;
}
.aiw.is-open .aiw__aura {
  opacity: 0.22;
  transform: none;
  animation: ai-turn 9s linear infinite;
}

/* One-shot light sweep across the glass as it opens */
.aiw__sheen {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    100deg,
    transparent 30%,
    rgba(255,255,255,0.16) 46%,
    rgba(255,255,255,0.03) 58%,
    transparent 70%
  );
  transform: translateX(-120%);
  pointer-events: none;
}
.aiw.is-open .aiw__sheen { animation: ai-sheen 1.5s cubic-bezier(0.22,1,0.36,1) 0.16s 1; }

.aiw__inner { position: relative; padding: 8px; }

/* ─── PANEL CONTENT ──────────────────────────────────────────── */
.aiw__lead {
  padding: 12px 12px 14px;
  font-family: var(--font-body, "DM Sans", sans-serif);
  font-size: 12.5px;
  line-height: 1.5;
  color: rgba(240,237,232,0.5);
}
.aiw__lead b {
  font-weight: 500;
  color: rgba(240,237,232,0.9);
}

.aiw__item {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 11px;
  padding: 10px 12px;
  border: none;
  border-radius: 11px;
  background: transparent;
  color: var(--color-fg, #f0ede8);
  font-family: inherit;
  font-size: 13.5px;
  font-weight: 500;
  letter-spacing: 0.01em;
  text-align: left;
  text-decoration: none;
  position: relative;
  transition: background 0.25s ease, transform 0.25s ease;
}
.aiw__item:hover,
.aiw__item:focus-visible {
  background: rgba(255,255,255,0.07);
  outline: none;
  transform: translateX(2px);
}
.aiw__item:focus-visible { box-shadow: inset 0 0 0 1px rgba(255,255,255,0.22); }

/* Each row rises and sharpens on a stagger */
.aiw__stagger {
  opacity: 0;
  transform: translateY(12px);
  filter: blur(5px);
  transition:
    opacity 0.4s ease,
    transform 0.55s cubic-bezier(0.22,1,0.36,1),
    filter 0.45s ease,
    background 0.25s ease;
  transition-delay: calc(var(--i) * 42ms);
}
.aiw.is-open .aiw__stagger { opacity: 1; transform: none; filter: blur(0); }

.aiw__mark {
  display: grid;
  place-items: center;
  width: 26px; height: 26px;
  flex: none;
  border-radius: 8px;
  background: rgba(255,255,255,0.05);
  font-family: var(--font-mono, "JetBrains Mono", monospace);
  font-size: 10.5px;
  font-weight: 500;
  color: rgba(240,237,232,0.5);
  position: relative;
  transition: color 0.25s ease;
}
/* Gradient ring lights up on the hovered row only */
.aiw__mark::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px;
  background: var(--ai-grad);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
          mask-composite: exclude;
  opacity: 0;
  transition: opacity 0.3s ease;
}
.aiw__item:hover .aiw__mark,
.aiw__item:focus-visible .aiw__mark { color: #fff; }
.aiw__item:hover .aiw__mark::before,
.aiw__item:focus-visible .aiw__mark::before { opacity: 1; }

.aiw__note {
  margin-left: auto;
  font-family: var(--font-mono, "JetBrains Mono", monospace);
  font-size: 9px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(240,237,232,0.3);
}

.aiw__rule { height: 1px; margin: 7px 12px; background: rgba(255,255,255,0.08); }

.aiw__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 5px 13px 9px;
  font-family: var(--font-mono, "JetBrains Mono", monospace);
  font-size: 9px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(240,237,232,0.26);
}
.aiw__foot a { color: inherit; text-decoration: none; border-bottom: 1px solid rgba(255,255,255,0.16); }
.aiw__foot a:hover { color: var(--accent, #00FF94); border-color: currentColor; }

/* ─── TRIGGER ────────────────────────────────────────────────── */
.aiw__fab {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 9px;
  height: 46px;
  padding: 0 20px;
  border: none;
  border-radius: 999px;
  background: rgba(12,12,13,0.72);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  backdrop-filter: blur(20px) saturate(180%);
  box-shadow: 0 10px 34px rgba(0,0,0,0.45);
  color: var(--color-fg, #f0ede8);
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  white-space: nowrap;
  transition: transform 0.45s cubic-bezier(0.16,1.16,0.3,1), box-shadow 0.4s ease;
}
.aiw__fab:hover { transform: translateY(-2px); box-shadow: 0 16px 44px rgba(0,0,0,0.55); }
.aiw__fab:active { transform: translateY(0) scale(0.97); }

/* Gradient rim, always turning, brighter while open */
.aiw__fab::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1.2px;
  background: var(--ai-grad);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
          mask-composite: exclude;
  opacity: 0.62;
  animation: ai-turn 6s linear infinite;
  transition: opacity 0.4s ease;
}
.aiw__fab:hover::before,
.aiw.is-open .aiw__fab::before { opacity: 1; }

/* Bloom behind the button — the Apple-Intelligence halo */
.aiw__bloom {
  position: absolute;
  inset: -8px;
  border-radius: 999px;
  background: var(--ai-grad);
  filter: blur(15px);
  opacity: 0.28;
  animation: ai-turn 6s linear infinite;
  transition: opacity 0.5s ease, filter 0.5s ease, inset 0.5s ease;
  pointer-events: none;
  z-index: -1;
}
.aiw__fab:hover .aiw__bloom { opacity: 0.5; filter: blur(19px); }
.aiw.is-open .aiw__bloom { opacity: 0.72; filter: blur(24px); inset: -13px; }

/* Ring that fires outward once, on the press */
.aiw__pulse {
  position: absolute;
  inset: 0;
  border-radius: 999px;
  border: 1.5px solid rgba(255,255,255,0.5);
  opacity: 0;
  pointer-events: none;
}
.aiw.is-pulsing .aiw__pulse { animation: ai-pulse 0.85s cubic-bezier(0.22,1,0.36,1) 1; }

.aiw__spark {
  width: 14px; height: 14px;
  flex: none;
  color: #fff;
  filter: drop-shadow(0 0 5px rgba(255,255,255,0.55));
  transition: transform 0.7s cubic-bezier(0.16,1.16,0.3,1);
}
.aiw__fab:hover .aiw__spark { transform: rotate(180deg) scale(1.15); }
.aiw.is-open .aiw__spark { transform: rotate(180deg); }

.aiw__label { position: relative; }

/* ─── MOBILE ─────────────────────────────────────────────────── */
/* The nav pill owns the bottom-centre, so the trigger shrinks to a
   disc and lifts clear of it. */
@media (max-width: 768px) {
  .aiw {
    --ai-edge: 16px;
    bottom: calc(env(safe-area-inset-bottom, 0px) + 78px);
    gap: 12px;
  }
  .aiw__fab { height: 46px; width: 46px; padding: 0; justify-content: center; gap: 0; }
  .aiw__label { display: none; }
  .aiw__spark { width: 17px; height: 17px; }
  .aiw__panel { width: min(306px, calc(100vw - 32px)); max-height: calc(100dvh - 210px); }
}

/* ─── MOTION ─────────────────────────────────────────────────── */
@keyframes ai-turn { to { --ai-turn: 360deg; } }
@keyframes ai-sheen {
  0%   { transform: translateX(-120%); }
  100% { transform: translateX(120%); }
}
@keyframes ai-pulse {
  0%   { opacity: 0.85; transform: scale(1); }
  100% { opacity: 0;    transform: scale(1.85); }
}

@media (prefers-reduced-motion: reduce) {
  .aiw__panel,
  .aiw__stagger,
  .aiw__fab,
  .aiw__bloom { transition-duration: 0.01ms; }
  .aiw__panel::before,
  .aiw__aura,
  .aiw__bloom,
  .aiw__fab::before,
  .aiw__sheen,
  .aiw__pulse { animation: none; }
  .aiw__spark { transition: none; }
}
`

/* ────────────────────────────────────────────────────────────── */
/*  Icon                                                          */
/* ────────────────────────────────────────────────────────────── */

const Spark = () => (
  <svg className="aiw__spark" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 0c.6 5.9 5.5 10.8 11.4 11.4v1.2C17.5 13.2 12.6 18.1 12 24h-1.2C10.2 18.1 5.3 13.2-.6 12.6v-1.2C5.3 10.8 10.2 5.9 10.8 0H12z" />
  </svg>
)

/* ────────────────────────────────────────────────────────────── */
/*  Clipboard                                                     */
/* ────────────────────────────────────────────────────────────── */

async function copyPrompt(): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(ASK_AI_PROMPT)
    return true
  } catch {
    /* Safari without permission, or an insecure origin — fall back. */
    try {
      const el = document.createElement('textarea')
      el.value = ASK_AI_PROMPT
      el.setAttribute('readonly', '')
      el.style.cssText = 'position:fixed;top:-1000px;opacity:0'
      document.body.appendChild(el)
      el.select()
      const ok = document.execCommand('copy')
      document.body.removeChild(el)
      return ok
    } catch {
      return false
    }
  }
}

/* ────────────────────────────────────────────────────────────── */
/*  Component                                                     */
/* ────────────────────────────────────────────────────────────── */

/** Routes that own the whole screen and should not carry a floating button. */
const HIDDEN_ON = ['/menu', '/coming-soon']

export default function AskAI({ label = 'Ask AI about me' }: { label?: string }) {
  const [open, setOpen] = useState(false)
  const [pulsing, setPulsing] = useState(false)
  const [copied, setCopied] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const fabRef = useRef<HTMLButtonElement>(null)
  const panelId = useId()
  const pathname = usePathname()

  /* Escape closes and hands focus back to the trigger. */
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setOpen(false)
      fabRef.current?.focus()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  const flashCopied = useCallback(async () => {
    const ok = await copyPrompt()
    if (ok) {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2200)
    }
  }, [])

  const toggle = useCallback(() => {
    setCopied(false)
    setPulsing(true)
    window.setTimeout(() => setPulsing(false), 900)
    setOpen((v) => !v)
  }, [])

  if (HIDDEN_ON.some((r) => pathname === r || pathname.startsWith(r + '/'))) return null

  /* Rows are numbered so the stagger runs top-to-bottom on open. */
  let row = 0

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <div className={`aiw${open ? ' is-open' : ''}${pulsing ? ' is-pulsing' : ''}`}>
        {/* Click-anywhere-else to dismiss. Hidden from the a11y tree — Escape
            and the trigger are the real controls. */}
        <button
          type="button"
          className="aiw__scrim"
          tabIndex={-1}
          aria-hidden="true"
          onClick={() => setOpen(false)}
        />

        <div
          ref={panelRef}
          id={panelId}
          className="aiw__panel"
          role="menu"
          aria-label="Ask an AI assistant about Anurag"
          aria-hidden={!open}
          inert={!open}
        >
          <span className="aiw__aura" aria-hidden="true" />
          <span className="aiw__sheen" aria-hidden="true" />

          <div className="aiw__inner">
            <p className="aiw__lead aiw__stagger" style={{ '--i': row++ } as React.CSSProperties}>
              Don&apos;t take my word for it. <b>Ask an assistant to look me up</b> and
              tell you what it finds.
            </p>

            {ASK_AI_PROVIDERS.map((p) => (
              <a
                key={p.id}
                role="menuitem"
                className="aiw__item aiw__stagger"
                style={{ '--i': row++ } as React.CSSProperties}
                href={p.href(ASK_AI_PROMPT)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  /* Gemini takes no prompt parameter — hand over the clipboard. */
                  if (p.needsPaste) void flashCopied()
                  setOpen(false)
                }}
              >
                <span className="aiw__mark" aria-hidden="true">{p.mark}</span>
                {p.name}
                {p.needsPaste && <span className="aiw__note">Paste it</span>}
              </a>
            ))}

            <div className="aiw__rule" />

            <button
              type="button"
              role="menuitem"
              className="aiw__item aiw__stagger"
              style={{ '--i': row++ } as React.CSSProperties}
              onClick={() => void flashCopied()}
            >
              <span className="aiw__mark" aria-hidden="true">{copied ? '✓' : '⌘'}</span>
              {copied ? 'Prompt copied' : 'Copy the question'}
            </button>

            <div className="aiw__foot aiw__stagger" style={{ '--i': row++ } as React.CSSProperties}>
              <span>No tracking</span>
              <a href={LLMS_TXT_URL} target="_blank" rel="noopener noreferrer">
                What it reads
              </a>
            </div>
          </div>
        </div>

        <button
          ref={fabRef}
          type="button"
          className="aiw__fab"
          aria-expanded={open}
          aria-haspopup="menu"
          aria-controls={panelId}
          aria-label={label}
          onClick={toggle}
        >
          <span className="aiw__bloom" aria-hidden="true" />
          <span className="aiw__pulse" aria-hidden="true" />
          <Spark />
          <span className="aiw__label">{label}</span>
        </button>
      </div>
    </>
  )
}
