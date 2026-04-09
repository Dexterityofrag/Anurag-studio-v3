'use client'

import { useRef, useEffect, useState } from 'react'
import Image from 'next/image'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/* ─────────────────────────────────────────────────────────────── */
/*  Static Content                                                  */
/* ─────────────────────────────────────────────────────────────── */

const EXPERIENCE = [
  {
    range: '2023',
    role: 'Graphic Design Intern',
    company: 'IGP',
    desc: 'Designed festive campaign graphics under intense peak-season production timelines.',
  },
  {
    range: '2023 – Present',
    role: 'Freelance UI/UX Designer',
    company: 'Independent',
    desc: 'Crafted digital products, interfaces, and visual systems for independent clients and startups.',
  },
  {
    range: '2024',
    role: 'UI/UX Designer',
    company: 'CloudQA',
    desc: 'Redesigned the pricing experience for better clarity and conversion.',
  },
  {
    range: '2024',
    role: 'Product Designer',
    company: 'LocalGo',
    desc: 'Built the end-to-end app ecosystem across rider, consumer, and admin products.',
  },
  {
    range: '2025',
    role: 'Game / Visual Designer',
    company: 'Bo Games',
    desc: 'Designed an educational card game blending play, learning, and strong visual identity.',
  },
  {
    range: '2025 – 2026',
    role: 'Product Design Consultant',
    company: 'Evolusis',
    desc: 'Designed the landing page and core Evo suite including dashboard, coach, and chat products.',
  },
]

const CORE_FOUNDATIONS = [
  {
    num: '01',
    title: 'Outcome-Driven',
    body: "Design that ships and converts. Every decision is anchored in real impact, not just aesthetics. If it doesn't move the needle, it doesn't belong on the canvas.",
  },
  {
    num: '02',
    title: 'Systems Thinking',
    body: "Scalable, not one-off. I build components, flows, and logic that flex without breaking. Good design isn't a single screen; it's a language that works at every scale.",
  },
  {
    num: '03',
    title: 'AI-Assisted',
    body: "Leveraging Claude, ChatGPT, and Gemini as creative co-pilots for research, copy, rapid prototyping, and code. AI amplifies craft; it doesn't replace it.",
  },
]

const CORE_COMPETENCIES = [
  {
    label: '0→1 Product Design',
    desc: 'Taking an idea from whiteboard to shipped product: defining the problem, the flow, the feel.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
      </svg>
    ),
  },
  {
    label: 'Design Systems',
    desc: 'Building scalable component libraries that maintain quality and coherence at speed.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
  {
    label: 'Research & Insights',
    desc: 'Grounding every decision in user data, interviews, and behavioral patterns.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/><path d="M11 8v6M8 11h6"/>
      </svg>
    ),
  },
  {
    label: 'Prototyping',
    desc: 'High-fidelity prototypes that communicate ideas better than words ever could.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="5 3 19 12 5 21 5 3"/>
      </svg>
    ),
  },
  {
    label: 'Motion & Interaction',
    desc: 'Micro-interactions and transitions that make interfaces feel alive and intentional.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12s2.545-5 7-5c4.454 0 7 5 7 5s-2.546 5-7 5c-4.455 0-7-5-7-5z"/><circle cx="12" cy="12" r="2"/>
      </svg>
    ),
  },
  {
    label: 'Front-end Dev',
    desc: 'React, Next.js, Tailwind. I design it, I build it. No translation layer needed.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
      </svg>
    ),
  },
]

const TOOLKIT = [
  { logo: '/toolkit/figma.png',       name: 'Figma',       desc: 'UI · Prototyping' },
  { logo: '/toolkit/claude.png',      name: 'Claude',      desc: 'Development · AI' },
  { logo: '/toolkit/chatgpt.png',     name: 'ChatGPT',     desc: 'Research · Writing' },
  { logo: '/toolkit/gemini.png',      name: 'Gemini',      desc: 'Rapid Prototyping' },
  { logo: '/toolkit/vscode.png',      name: 'VS Code',     desc: 'Frontend Dev' },
  { logo: '/toolkit/git.png',         name: 'Git',         desc: 'Version Control' },
  { logo: '/toolkit/illustrator.png', name: 'Illustrator', desc: 'Vectors · Brand' },
  { logo: '/toolkit/photoshop.png',   name: 'Photoshop',   desc: 'Photo Editing' },
]

type CertificationData = {
  id: string
  name: string
  issuer: string
  logoUrl: string | null
  verifyUrl: string | null
}

/* ─────────────────────────────────────────────────────────────── */
/*  Count-up hook                                                  */
/* ─────────────────────────────────────────────────────────────── */

function useCountUp(target: number, ref: React.RefObject<HTMLElement | null>) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    gsap.registerPlugin(ScrollTrigger)
    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top 82%',
      once: true,
      onEnter() {
        gsap.to({ n: 0 }, {
          n: target,
          duration: 1.6,
          ease: 'power2.out',
          onUpdate(this: gsap.core.Tween) { setVal(Math.round((this.targets()[0] as { n: number }).n)) },
        })
      },
    })
    return () => st.kill()
  }, [target, ref])
  return val
}

function StatCell({ num, suffix, label }: { num: number; suffix: string; label: string }) {
  const ref = useRef<HTMLParagraphElement>(null)
  const count = useCountUp(num, ref)
  return (
    <div className="abt-stat-cell">
      <p ref={ref} className="abt-stat-num">{count}{suffix}</p>
      <p className="abt-stat-label">{label}</p>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────── */
/*  CSS                                                            */
/* ─────────────────────────────────────────────────────────────── */

const css = /* css */ `

/* ─── RESET / SHARED ─────────────────────────────────────────── */
.abt-section-label {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 12px;
  color: var(--accent, #00FF94);
  text-transform: uppercase;
  letter-spacing: 0.14em;
  padding-bottom: 14px;
  border-bottom: 1px solid rgba(255,255,255,0.07);
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.abt-section-label::before {
  content: '';
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--accent, #00FF94);
  flex-shrink: 0;
}

/* ─── CERTIFICATIONS TAB (right edge sticky) ─────────────────── */
.abt-cert-rail {
  position: fixed;
  right: 0;
  top: 50%;
  transform: translateY(-50%) rotate(90deg);
  transform-origin: right center;
  z-index: 60;
  display: flex;
  gap: 0;
  pointer-events: none;
}
@media (max-width: 1100px) { .abt-cert-rail { display: none; } }
.abt-cert-tab {
  background: rgba(18,18,18,0.92);
  border: 1px solid rgba(255,255,255,0.08);
  border-bottom: none;
  color: rgba(255,255,255,0.45);
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 7px 14px;
  white-space: nowrap;
  backdrop-filter: blur(8px);
  cursor: none;
  pointer-events: all;
  transition: color 0.2s, background 0.2s;
}
.abt-cert-tab:first-child { border-radius: 0 0 0 6px; }
.abt-cert-tab:last-child  { border-radius: 6px 6px 0 0; }
.abt-cert-tab:hover { color: var(--accent, #00FF94); background: rgba(30,30,30,0.95); }
.abt-cert-tab-dot {
  display: inline-block;
  width: 5px; height: 5px;
  border-radius: 50%;
  background: var(--accent, #00FF94);
  margin-right: 6px;
  vertical-align: middle;
  opacity: 0.7;
}

/* ─── SECTION 01: HERO ───────────────────────────────────────── */
.abt-hero {
  max-width: var(--max-width, 1440px);
  margin: 0 auto;
  padding: 180px var(--gutter, 60px) 60px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  align-items: start;
}
@media (max-width: 1024px) {
  .abt-hero { grid-template-columns: 1fr; gap: 60px; padding: 120px 32px 80px; }
}

/* Left */
.abt-hero-left {
  position: sticky;
  top: 120px;
  align-self: start;
}
.abt-index {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 12px;
  color: var(--accent, #00FF94);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  margin-bottom: 28px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.abt-index::before {
  content: '';
  display: inline-block;
  width: 24px; height: 1px;
  background: var(--accent, #00FF94);
}
.abt-h1 {
  font-family: var(--font-display, 'Space Grotesk', sans-serif);
  font-size: clamp(4.5rem, 9vw, 10rem);
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 0.85;
  text-transform: uppercase;
  margin-bottom: 64px;
}
.abt-h1-solid { color: var(--color-fg, #f0f0f0); display: block; }
.abt-h1-outline {
  color: transparent;
  -webkit-text-stroke: 2px var(--color-fg, #f0f0f0);
  display: block;
}
.abt-mask { overflow: hidden; display: block; }
.abt-reveal {
  display: block;
  transform: translateY(110%);
  will-change: transform;
}

.abt-lead {
  font-family: var(--font-display, 'Space Grotesk', sans-serif);
  font-size: clamp(1.4rem, 2.2vw, 1.9rem);
  font-weight: 500;
  line-height: 1.3;
  color: var(--color-fg, #f0f0f0);
  margin-bottom: 20px;
}
.abt-body {
  font-family: var(--font-body, 'DM Sans', sans-serif);
  font-size: 17px;
  color: rgba(240,240,240,0.5);
  line-height: 1.75;
  max-width: 520px;
}

/* Right portrait stagger */
.abt-hero-right {
  display: flex;
  flex-direction: column;
  gap: 28px;
  padding-top: 40px;
}
.abt-portrait-wrap {
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 40px 80px rgba(0,0,0,0.7);
}
.abt-portrait-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  filter: grayscale(100%) contrast(1.05) brightness(0.9);
}
.abt-portrait-wrap.p1 { width: 80%; align-self: flex-end; aspect-ratio: 4/5; }
.abt-portrait-wrap.p2 { width: 65%; align-self: flex-start; aspect-ratio: 1/1; }
@media (max-width: 768px) {
  .abt-portrait-wrap.p1, .abt-portrait-wrap.p2 { width: 100%; }
}

/* ─── SECTION 02: OFF SCREEN ─────────────────────────────────── */
.abt-offscreen {
  border-top: 1px solid rgba(255,255,255,0.07);
  border-bottom: 1px solid rgba(255,255,255,0.07);
  padding: 120px var(--gutter, 60px);
  max-width: var(--max-width, 1440px);
  margin: 0 auto;
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 80px;
  align-items: start;
}
@media (max-width: 900px) {
  .abt-offscreen { grid-template-columns: 1fr; gap: 40px; padding: 80px 32px; }
}
.abt-offscreen-left { position: sticky; top: 120px; }
.abt-offscreen-title {
  font-family: var(--font-display, 'Space Grotesk', sans-serif);
  font-size: clamp(1.6rem, 2.5vw, 2.2rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.1;
  text-transform: uppercase;
  color: var(--color-fg, #f0f0f0);
  margin-top: 16px;
}
.abt-offscreen-title span {
  color: transparent;
  -webkit-text-stroke: 1.5px var(--color-fg, #f0f0f0);
}
.abt-offscreen-body {
  font-family: var(--font-body, 'DM Sans', sans-serif);
  font-size: 19px;
  color: rgba(240,240,240,0.55);
  line-height: 1.75;
}
.abt-offscreen-em {
  color: var(--color-fg, #f0f0f0);
  font-weight: 500;
}

/* ─── STATS BAND ──────────────────────────────────────────────── */
.abt-stats {
  background: var(--accent, #00FF94);
  padding: 80px var(--gutter, 60px);
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}
@media (max-width: 700px) {
  .abt-stats { grid-template-columns: 1fr; gap: 0; }
}
.abt-stat-cell {
  text-align: center;
  padding: 0 48px;
  border-right: 1px solid rgba(0,0,0,0.12);
}
.abt-stat-cell:last-child { border-right: none; }
.abt-stat-num {
  font-family: var(--font-display, 'Space Grotesk', sans-serif);
  font-size: clamp(3rem, 5vw, 5rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  color: #000;
  line-height: 1;
  margin-bottom: 10px;
}
.abt-stat-label {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(0,0,0,0.5);
}
@media (max-width: 700px) {
  .abt-stat-cell {
    border-right: none;
    border-bottom: 1px solid rgba(0,0,0,0.12);
    padding: 40px 0;
  }
  .abt-stat-cell:last-child { border-bottom: none; }
}

/* ─── PHILOSOPHY (THE DRIVE / THE VISION) ────────────────────── */
.abt-philosophy {
  max-width: var(--max-width, 1440px);
  margin: 0 auto;
  padding: 0 var(--gutter, 60px);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2px;
}
@media (max-width: 900px) { .abt-philosophy { grid-template-columns: 1fr; } }
.abt-philosophy-block {
  padding: 100px 60px;
  border: 1px solid rgba(255,255,255,0.07);
}
.abt-philosophy-block:first-child { border-right: none; }
@media (max-width: 900px) {
  .abt-philosophy-block { padding: 60px 32px; }
  .abt-philosophy-block:first-child { border-right: 1px solid rgba(255,255,255,0.07); border-bottom: none; }
}
.abt-phil-title {
  font-family: var(--font-display, 'Space Grotesk', sans-serif);
  font-size: clamp(1.8rem, 3vw, 2.8rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1;
  text-transform: uppercase;
  margin: 20px 0 32px;
  color: var(--color-fg, #f0f0f0);
}
.abt-phil-title .outline-word {
  color: transparent;
  -webkit-text-stroke: 2px var(--color-fg, #f0f0f0);
}
.abt-phil-body {
  font-family: var(--font-body, 'DM Sans', sans-serif);
  font-size: 17px;
  color: rgba(240,240,240,0.52);
  line-height: 1.78;
}

/* ─── EXPERIENCE TIMELINE ────────────────────────────────────── */
.abt-exp-section {
  max-width: var(--max-width, 1440px);
  margin: 0 auto;
  padding: 120px var(--gutter, 60px);
}
.abt-exp-head {
  font-family: var(--font-display, 'Space Grotesk', sans-serif);
  font-size: clamp(2.2rem, 3.5vw, 3.5rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  text-transform: uppercase;
  color: var(--color-fg, #f0f0f0);
  margin-bottom: 60px;
  line-height: 1;
}
.abt-exp-head .outline-word {
  color: transparent;
  -webkit-text-stroke: 2px var(--color-fg, #f0f0f0);
}
.abt-exp-row {
  display: grid;
  grid-template-columns: 180px 1fr max-content;
  gap: 32px 48px;
  align-items: start;
  padding: 40px 0;
  border-bottom: 1px solid rgba(255,255,255,0.07);
  transition: opacity 0.3s;
}
.abt-exp-row:hover { opacity: 1 !important; }
.abt-exp-section:hover .abt-exp-row { opacity: 0.35; }
.abt-exp-section:hover .abt-exp-row:hover { opacity: 1; }
.abt-exp-range {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 13px;
  color: rgba(240,240,240,0.4);
  padding-top: 4px;
  white-space: nowrap;
}
.abt-exp-role {
  font-family: var(--font-display, 'Space Grotesk', sans-serif);
  font-size: clamp(1rem, 1.6vw, 1.3rem);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.01em;
  color: var(--color-fg, #f0f0f0);
  margin-bottom: 8px;
}
.abt-exp-desc {
  font-family: var(--font-body, 'DM Sans', sans-serif);
  font-size: 15px;
  color: rgba(240,240,240,0.45);
  line-height: 1.6;
}
.abt-exp-company {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 12px;
  color: rgba(240,240,240,0.35);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding-top: 4px;
  text-align: right;
  white-space: nowrap;
}
@media (max-width: 768px) {
  .abt-exp-row { grid-template-columns: auto 1fr; gap: 12px 24px; }
  .abt-exp-company { display: none; }
}

/* ─── TOOLKIT ──────────────────────────────────────────────────── */
.abt-toolkit {
  max-width: var(--max-width, 1440px);
  margin: 0 auto;
  padding: 0 var(--gutter, 60px) 160px;
}
.abt-toolkit-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2px;
}
@media (max-width: 1100px) { .abt-toolkit-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 600px)  { .abt-toolkit-grid { grid-template-columns: 1fr; } }
.abt-tool-card {
  padding: 40px 32px;
  border: 1px solid rgba(255,255,255,0.07);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 14px;
  transition: border-color 0.3s, background 0.3s;
  cursor: none;
}
.abt-tool-card:hover {
  border-color: rgba(0,255,148,0.2);
  background: rgba(0,255,148,0.02);
}
.abt-tool-icon {
  width: 44px; height: 44px;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 4px;
  transition: border-color 0.3s;
}
.abt-tool-card:hover .abt-tool-icon {
  border-color: rgba(0,255,148,0.3);
}
.abt-tool-name {
  font-family: var(--font-display, 'Space Grotesk', sans-serif);
  font-size: 18px;
  font-weight: 600;
  color: var(--color-fg, #f0f0f0);
}
.abt-tool-desc {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 12px;
  color: rgba(240,240,240,0.35);
  letter-spacing: 0.04em;
}

/* ─── CORE FOUNDATIONS ───────────────────────────────────────── */
.abt-foundations {
  max-width: var(--max-width, 1440px);
  margin: 0 auto;
  padding: 120px var(--gutter, 60px);
  border-top: 1px solid rgba(255,255,255,0.06);
}
.abt-foundations-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 32px;
  margin-bottom: 64px;
  flex-wrap: wrap;
}
.abt-foundations-title {
  font-family: var(--font-display, 'Space Grotesk', sans-serif);
  font-size: clamp(2.2rem, 3.5vw, 3.5rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  text-transform: uppercase;
  color: var(--color-fg, #f0f0f0);
  line-height: 1;
}
.abt-foundations-title .outline-word {
  color: transparent;
  -webkit-text-stroke: 2px var(--color-fg, #f0f0f0);
}
.abt-foundations-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2px;
}
@media (max-width: 900px) {
  .abt-foundations-grid { grid-template-columns: 1fr; }
}
.abt-found-card {
  padding: 48px 36px;
  border: 1px solid rgba(255,255,255,0.07);
  display: flex;
  flex-direction: column;
  gap: 20px;
  transition: border-color 0.3s, background 0.3s;
}
.abt-found-card:hover {
  border-color: rgba(0,255,148,0.2);
  background: rgba(0,255,148,0.02);
}
.abt-found-num {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 11px;
  letter-spacing: 0.14em;
  color: var(--accent, #00FF94);
  text-transform: uppercase;
}
.abt-found-name {
  font-family: var(--font-display, 'Space Grotesk', sans-serif);
  font-size: clamp(1.4rem, 2.2vw, 2rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--color-fg, #f0f0f0);
  text-transform: uppercase;
  line-height: 1.05;
}
.abt-found-body {
  font-family: var(--font-body, 'DM Sans', sans-serif);
  font-size: 15px;
  color: rgba(240,240,240,0.48);
  line-height: 1.75;
  margin-top: auto;
  padding-top: 8px;
  border-top: 1px solid rgba(255,255,255,0.06);
}

/* ─── CORE COMPETENCIES ──────────────────────────────────────── */
.abt-competencies {
  max-width: var(--max-width, 1440px);
  margin: 0 auto;
  padding: 0 var(--gutter, 60px) 120px;
}
.abt-competencies-header {
  margin-bottom: 48px;
}
.abt-competencies-title {
  font-family: var(--font-display, 'Space Grotesk', sans-serif);
  font-size: clamp(2.2rem, 3.5vw, 3.5rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  text-transform: uppercase;
  color: var(--color-fg, #f0f0f0);
  line-height: 1;
}
.abt-competencies-title .outline-word {
  color: transparent;
  -webkit-text-stroke: 2px var(--color-fg, #f0f0f0);
}
.abt-comp-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2px;
}
@media (max-width: 900px) {
  .abt-comp-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 520px) {
  .abt-comp-grid { grid-template-columns: 1fr; }
}
.abt-comp-item {
  padding: 32px 28px;
  border: 1px solid rgba(255,255,255,0.07);
  display: flex;
  flex-direction: column;
  gap: 14px;
  transition: border-color 0.3s, background 0.3s;
}
.abt-comp-item:hover {
  border-color: rgba(0,255,148,0.2);
  background: rgba(0,255,148,0.02);
}
.abt-comp-icon {
  color: rgba(240,240,240,0.3);
  transition: color 0.3s;
  width: 24px; height: 24px;
}
.abt-comp-item:hover .abt-comp-icon { color: var(--accent, #00FF94); }
.abt-comp-label {
  font-family: var(--font-display, 'Space Grotesk', sans-serif);
  font-size: clamp(0.95rem, 1.4vw, 1.15rem);
  font-weight: 600;
  letter-spacing: -0.01em;
  color: var(--color-fg, #f0f0f0);
  text-transform: uppercase;
}
.abt-comp-desc {
  font-family: var(--font-body, 'DM Sans', sans-serif);
  font-size: 14px;
  color: rgba(240,240,240,0.42);
  line-height: 1.65;
}

/* ─── CERTIFICATIONS SECTION ─────────────────────────────────── */
.abt-certs {
  max-width: var(--max-width, 1440px);
  margin: 0 auto;
  padding: 120px var(--gutter, 60px) 0;
}
.abt-certs-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 32px;
  margin-bottom: 48px;
  flex-wrap: wrap;
}
.abt-certs-title {
  font-family: var(--font-display, 'Space Grotesk', sans-serif);
  font-size: clamp(2.2rem, 3.5vw, 3.5rem);
  font-weight: 700;
  letter-spacing: -0.03em;
  text-transform: uppercase;
  color: var(--color-fg, #f0f0f0);
  line-height: 1;
}
.abt-certs-title .outline-word {
  color: transparent;
  -webkit-text-stroke: 2px var(--color-fg, #f0f0f0);
}
.abt-certs-grid {
  display: flex;
  gap: 2px;
}
@media (max-width: 900px) { .abt-certs-grid { flex-direction: column; } }

.abt-cert-card {
  flex: 1;
  position: relative;
  min-height: 280px;
  perspective: 800px;
  cursor: pointer;
  text-decoration: none;
  display: block;
}

/* Inner flip container */
.abt-cert-inner {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 280px;
  transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
  transform-style: preserve-3d;
}
.abt-cert-card:hover .abt-cert-inner {
  transform: rotateY(180deg);
}

/* Shared face styles */
.abt-cert-front,
.abt-cert-back {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  border: 1px solid rgba(255,255,255,0.07);
  display: flex;
  flex-direction: column;
  padding: 40px 32px;
}

/* Front face */
.abt-cert-front {
  background: rgba(255,255,255,0.02);
  align-items: flex-start;
  justify-content: space-between;
}
.abt-cert-card:hover .abt-cert-front {
  border-color: rgba(0,255,148,0.2);
}
.abt-cert-issuer-logo {
  width: 48px;
  height: 48px;
  object-fit: contain;
  opacity: 0.8;
  transition: opacity 0.3s;
}
.abt-cert-card:hover .abt-cert-issuer-logo { opacity: 1; }
.abt-cert-issuer-placeholder {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display, 'Space Grotesk', sans-serif);
  font-size: 18px;
  font-weight: 700;
  color: var(--accent, #00FF94);
  background: rgba(0,255,148,0.05);
}
.abt-cert-front-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.abt-cert-name {
  font-family: var(--font-display, 'Space Grotesk', sans-serif);
  font-size: clamp(1rem, 1.4vw, 1.2rem);
  font-weight: 600;
  color: var(--color-fg, #f0f0f0);
  text-transform: uppercase;
  letter-spacing: -0.01em;
  line-height: 1.2;
}
.abt-cert-issuer-name {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 11px;
  color: rgba(255,255,255,0.35);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.abt-cert-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 10px;
  letter-spacing: 0.06em;
  color: var(--accent, #00FF94);
  text-transform: uppercase;
  padding: 4px 10px;
  border: 1px solid rgba(0,255,148,0.2);
  border-radius: 999px;
  width: fit-content;
}
.abt-cert-badge-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--accent, #00FF94);
  animation: abt-cert-pulse 2s ease-in-out infinite;
}
@keyframes abt-cert-pulse {
  0%, 100% { opacity: 0.4; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.4); }
}

/* Back face */
.abt-cert-back {
  background: rgba(0,255,148,0.06);
  border-color: rgba(0,255,148,0.25);
  transform: rotateY(180deg);
  align-items: center;
  justify-content: center;
  gap: 20px;
  text-align: center;
}
.abt-cert-back-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(0,255,148,0.12);
  display: flex;
  align-items: center;
  justify-content: center;
}
.abt-cert-back-icon svg {
  width: 24px;
  height: 24px;
  color: var(--accent, #00FF94);
}
.abt-cert-back-label {
  font-family: var(--font-display, 'Space Grotesk', sans-serif);
  font-size: 16px;
  font-weight: 600;
  color: var(--color-fg, #f0f0f0);
  text-transform: uppercase;
}
.abt-cert-back-hint {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: rgba(255,255,255,0.35);
}
.abt-cert-back-cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 24px;
  background: var(--accent, #00FF94);
  color: #000;
  font-family: var(--font-display, 'Space Grotesk', sans-serif);
  font-weight: 700;
  font-size: 12px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  border-radius: 4px;
  text-decoration: none;
  transition: opacity 0.2s;
}
.abt-cert-back-cta:hover { opacity: 0.85; }
.abt-cert-back-cta svg {
  width: 14px;
  height: 14px;
}

/* No-link state */
.abt-cert-card--no-link {
  cursor: default;
}
.abt-cert-card--no-link .abt-cert-inner {
  transform: none !important;
}
.abt-cert-card--no-link .abt-cert-back-cta {
  opacity: 0.4;
  pointer-events: none;
}

/* Glow effect on hover */
.abt-cert-front::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 50% 100%, rgba(0,255,148,0.04) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: none;
}
.abt-cert-card:hover .abt-cert-front::after { opacity: 1; }

@media (max-width: 900px) {
  .abt-cert-card { min-height: 240px; }
  .abt-cert-inner { min-height: 240px; }
}

/* ─── SCROLL-REVEAL utility ──────────────────────────────────── */
.abt-fade-up {
  opacity: 0;
  transform: translateY(28px);
  will-change: transform, opacity;
}

/* ─── FIGMA: cursor + selection ──────────────────────────────── */
.abt-figma-cursor {
  position: absolute;
  z-index: 30;
  pointer-events: none;
  display: flex;
  align-items: flex-start;
  gap: 6px;
  opacity: 0;
  top: 20px;
  right: -10px;
}
.abt-figma-tag {
  background: #00FF94;
  color: #000;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 10px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 3px;
  white-space: nowrap;
  margin-top: 2px;
}
.abt-figma-sel {
  position: absolute;
  z-index: 25;
  pointer-events: none;
  border: 1.5px solid #00FF94;
  background: rgba(0,255,148,0.05);
  opacity: 0;
}
.abt-figma-sel-lbl {
  position: absolute;
  top: -22px; left: -1px;
  background: #00FF94; color: #000;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 10px; font-weight: 700;
  padding: 2px 6px; border-radius: 2px 2px 0 0;
  white-space: nowrap;
}
.abt-figma-handle {
  position: absolute;
  width: 6px; height: 6px;
  background: #00FF94;
}
.abt-figma-handle.tl { top: -3px; left: -3px; }
.abt-figma-handle.tr { top: -3px; right: -3px; }
.abt-figma-handle.bl { bottom: -3px; left: -3px; }
.abt-figma-handle.br { bottom: -3px; right: -3px; }

@media (max-width: 768px) {
  .abt-figma-cursor, .abt-figma-sel { display: none; }
}
`

/* ─────────────────────────────────────────────────────────────── */
/*  Component                                                      */
/* ─────────────────────────────────────────────────────────────── */

export default function AboutPage({ bio1, bio2, certifications = [] }: { bio1?: string | null; bio2?: string | null; certifications?: CertificationData[] }) {
  /* Refs */
  const line1Ref   = useRef<HTMLSpanElement>(null)
  const line2Ref   = useRef<HTMLSpanElement>(null)
  const heroLeftRef = useRef<HTMLDivElement>(null)
  const cursorRef  = useRef<HTMLDivElement>(null)
  const selRef     = useRef<HTMLDivElement>(null)

  /* ── Register GSAP plugins (must run before all other effects) ── */
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
  }, [])

  /* ── Heading mask reveal ─────────────────────────────────── */
  useEffect(() => {
    const lines = [line1Ref.current, line2Ref.current].filter(Boolean) as HTMLSpanElement[]
    if (lines.length === 0) return
    gsap.to(lines, {
      translateY: '0%',
      duration: 1.1,
      stagger: 0.1,
      ease: 'power4.out',
      delay: 0.3,
    })
  }, [])

  /* ── Scroll-reveal for .abt-fade-up elements ─────────────── */
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('.abt-fade-up'))
    if (els.length === 0) return

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement
            el.style.transition = 'opacity 0.75s cubic-bezier(0.22,1,0.36,1), transform 0.75s cubic-bezier(0.22,1,0.36,1)'
            el.style.opacity = '1'
            el.style.transform = 'translateY(0)'
            io.unobserve(el)
          }
        })
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
    )

    els.forEach((el, i) => {
      // Stagger delay via transition-delay
      el.style.transitionDelay = `${i * 0.04}s`
      io.observe(el)
    })

    return () => io.disconnect()
  }, [])

  /* ── Figma sim on heading ─────────────────────────────────── */
  useEffect(() => {
    const cur = cursorRef.current
    const sel = selRef.current
    const left = heroLeftRef.current
    if (!cur || !sel || !left) return

    const h1 = left.querySelector<HTMLElement>('.abt-h1')
    if (!h1) return

    const positionSel = () => {
      const pb = left.getBoundingClientRect()
      const hb = h1.getBoundingClientRect()
      sel.style.top    = `${hb.top  - pb.top  - 8}px`
      sel.style.left   = `${hb.left - pb.left - 12}px`
      sel.style.width  = `${hb.width  + 24}px`
      sel.style.height = `${hb.height + 16}px`
    }

    gsap.set(sel, { scale: 0.9, transformOrigin: 'center center' })

    const st = ScrollTrigger.create({
      trigger: left,
      start: 'top 70%',
      once: true,
      onEnter() {
        positionSel()
        const tl = gsap.timeline()
        tl.to(cur, { opacity: 1, duration: 0.4 })
          .to(sel, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(1.5)' }, '+=0.3')
          .to([cur, sel], { opacity: 0, duration: 0.4 }, '+=1.8')
      },
    })
    return () => st.kill()
  }, [])

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />

      {/* ══ CERTIFICATIONS RAIL (right sticky edge) ══════════════ */}
      <div className="abt-cert-rail" aria-label="Certifications">
        {certifications.map((c) => (
          <div key={c.id} className="abt-cert-tab">
            <span className="abt-cert-tab-dot" />
            {c.issuer}
          </div>
        ))}
      </div>

      {/* ══ SECTION 01: HERO ═══════════════════════════════════ */}
      <section className="abt-hero" id="about-hero">

        {/* Left sticky */}
        <div className="abt-hero-left" ref={heroLeftRef} style={{ position: 'relative' }}>

          {/* Figma overlays */}
          <div ref={cursorRef} className="abt-figma-cursor" aria-hidden="true">
            <svg width="16" height="22" viewBox="0 0 16 22" fill="none">
              <path d="M1 1L1 18L5.5 13.5L8.5 21L10.5 20L7.5 12.5H14L1 1Z" fill="#00FF94" />
            </svg>
            <span className="abt-figma-tag">Anurag Adhikari</span>
          </div>
          <div ref={selRef} className="abt-figma-sel" aria-hidden="true">
            <span className="abt-figma-sel-lbl">ABOUT ME</span>
            <span className="abt-figma-handle tl" />
            <span className="abt-figma-handle tr" />
            <span className="abt-figma-handle bl" />
            <span className="abt-figma-handle br" />
          </div>

          <p className="abt-index">01 / THE DRIVE</p>

          <h1 className="abt-h1">
            <span className="abt-mask"><span ref={line1Ref} className="abt-reveal abt-h1-solid">ABOUT</span></span>
            <span className="abt-mask"><span ref={line2Ref} className="abt-reveal abt-h1-outline">ME</span></span>
          </h1>

          <div className="abt-fade-up">
            <p className="abt-section-label">BIO</p>
            {bio1 && (
              <p className="abt-lead">{bio1}</p>
            )}
            {bio2 && (
              <p className="abt-body" style={{ marginTop: 20 }}>{bio2}</p>
            )}
          </div>
        </div>

        {/* Right portrait stack */}
        <div className="abt-hero-right">
          <div className="abt-portrait-wrap p1">
            <Image
              src="/portrait.jpg"
              alt="Anurag Adhikari"
              width={600}
              height={750}
              priority
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }}
            />
          </div>
          <div className="abt-portrait-wrap p2">
            <Image
              src="/portrait2.jpg"
              alt="Anurag with family"
              width={600}
              height={600}
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
            />
          </div>
        </div>
      </section>

      {/* ══ SECTION 02: OFF SCREEN ════════════════════════════ */}
      <section className="abt-offscreen" id="about-off-screen">
        <div className="abt-offscreen-left">
          <p className="abt-index">02 / THE OFF-SCREEN</p>
          <h2 className="abt-offscreen-title">
            Gaming<br /><span>&amp; Music</span>
          </h2>
        </div>
        <div className="abt-fade-up">
          <p className="abt-offscreen-body">
            Off screen, I&apos;m deeply into{' '}
            <span className="abt-offscreen-em">gaming and music</span>.
            {' '}Games inspire the way I think about{' '}
            <span className="abt-offscreen-em">immersion, flow, interaction, and world-building</span>,
            {' '}while music shapes my sense of{' '}
            <span className="abt-offscreen-em">rhythm, emotion, and atmosphere</span> in design.
            Both constantly influence how I create experiences that feel alive, intentional, and memorable.
          </p>
        </div>
      </section>

      {/* ══ STATS BAND ════════════════════════════════════════ */}
      <div className="abt-stats" aria-label="Statistics">
        <StatCell num={1} suffix=".5+" label="Years Experience" />
        <StatCell num={4}  suffix="+"  label="Projects Shipped" />
        <StatCell num={3}  suffix=""   label="Certifications" />
      </div>

      {/* ══ PHILOSOPHY BLOCKS ════════════════════════════════ */}
      <div className="abt-philosophy">
        <div className="abt-philosophy-block abt-fade-up">
          <p className="abt-index">03 / THE DRIVE</p>
          <h2 className="abt-phil-title">
            Always<br /><span className="outline-word">The Best</span>
          </h2>
          <p className="abt-phil-body">
            I set a simple standard for myself: be the best in the room, in the craft, in the work.
            Not through obsession with perfection, but through genuine care for every detail. Whether
            it&apos;s a micro-interaction or a full product ecosystem, I treat every pixel as a decision,
            and every decision as intentional. The drive to improve never stops.
          </p>
        </div>
        <div className="abt-philosophy-block abt-fade-up">
          <p className="abt-index">04 / THE VISION</p>
          <h2 className="abt-phil-title">
            Design<br /><span className="outline-word">Beyond Screen</span>
          </h2>
          <p className="abt-phil-body">
            Jony Ive didn&apos;t just design products; he shaped how a generation thinks about objects,
            simplicity, and intention. That level of impact is what drives me. I want to build things that
            go beyond interfaces: experiences that shape how people feel, think, and move through the world.
            Design as culture. Design as legacy.
          </p>
        </div>
      </div>

      {/* ══ EXPERIENCE TIMELINE ═══════════════════════════════ */}
      <section className="abt-exp-section" id="about-experience">
        <h2 className="abt-exp-head abt-fade-up">
          Career <span className="outline-word">Timeline</span>
        </h2>
        {EXPERIENCE.map((row, i) => (
          <div key={i} className="abt-exp-row">
            <span className="abt-exp-range">{row.range}</span>
            <div>
              <p className="abt-exp-role">{row.role}</p>
              <p className="abt-exp-desc">{row.desc}</p>
            </div>
            <span className="abt-exp-company">{row.company}</span>
          </div>
        ))}
      </section>

      {/* ══ CORE FOUNDATIONS ═════════════════════════════════ */}
      <section className="abt-foundations" id="about-foundations">
        <div className="abt-foundations-header abt-fade-up">
          <h2 className="abt-foundations-title">
            Core <span className="outline-word">Foundations</span>
          </h2>
          <p className="abt-section-label">The Principles</p>
        </div>
        <div className="abt-foundations-grid">
          {CORE_FOUNDATIONS.map((f, i) => (
            <div key={i} className="abt-found-card abt-fade-up">
              <span className="abt-found-num">{f.num}</span>
              <p className="abt-found-name">{f.title}</p>
              <p className="abt-found-body">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ CORE COMPETENCIES ════════════════════════════════ */}
      <section className="abt-competencies" id="about-competencies">
        <div className="abt-competencies-header abt-fade-up">
          <h2 className="abt-competencies-title">
            Core <span className="outline-word">Competencies</span>
          </h2>
        </div>
        <div className="abt-comp-grid">
          {CORE_COMPETENCIES.map((c, i) => (
            <div key={i} className="abt-comp-item abt-fade-up">
              <span className="abt-comp-icon">{c.icon}</span>
              <p className="abt-comp-label">{c.label}</p>
              <p className="abt-comp-desc">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ CERTIFICATIONS ═════════════════════════════════ */}
      {certifications.length > 0 && (
        <section className="abt-certs" id="about-certifications">
          <div className="abt-certs-header abt-fade-up">
            <h2 className="abt-certs-title">
              Verified <span className="outline-word">Credentials</span>
            </h2>
            <p className="abt-section-label">Certifications</p>
          </div>
          <div className="abt-certs-grid">
            {certifications.map((cert) => {
              const hasLink = !!cert.verifyUrl
              const Wrapper = hasLink ? 'a' : 'div'
              const wrapperProps = hasLink
                ? { href: cert.verifyUrl!, target: '_blank', rel: 'noopener noreferrer' }
                : {}
              return (
                <Wrapper
                  key={cert.id}
                  className={`abt-cert-card abt-fade-up${!hasLink ? ' abt-cert-card--no-link' : ''}`}
                  {...wrapperProps}
                >
                  <div className="abt-cert-inner">
                    {/* Front */}
                    <div className="abt-cert-front">
                      {cert.logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={cert.logoUrl} alt={cert.issuer} className="abt-cert-issuer-logo" />
                      ) : (
                        <div className="abt-cert-issuer-placeholder">
                          {cert.issuer.charAt(0)}
                        </div>
                      )}
                      <div className="abt-cert-front-content">
                        <p className="abt-cert-name">{cert.name}</p>
                        <p className="abt-cert-issuer-name">{cert.issuer}</p>
                        <div className="abt-cert-badge">
                          <span className="abt-cert-badge-dot" />
                          Certified
                        </div>
                      </div>
                    </div>

                    {/* Back */}
                    <div className="abt-cert-back">
                      <div className="abt-cert-back-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                          <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                      </div>
                      <p className="abt-cert-back-label">{cert.name}</p>
                      <p className="abt-cert-back-hint">
                        {hasLink ? 'Click to verify credential' : 'Verification link coming soon'}
                      </p>
                      {hasLink && (
                        <span className="abt-cert-back-cta">
                          Verify
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="7" y1="17" x2="17" y2="7" /><polyline points="7 7 17 7 17 17" />
                          </svg>
                        </span>
                      )}
                    </div>
                  </div>
                </Wrapper>
              )
            })}
          </div>
        </section>
      )}

      {/* ══ TOOLKIT ══════════════════════════════════════════ */}
      <section className="abt-toolkit" id="about-toolkit">
        <p className="abt-section-label abt-fade-up">My Toolkit</p>
        <div className="abt-toolkit-grid">
          {TOOLKIT.map((tool, i) => (
            <div key={i} className="abt-tool-card abt-fade-up" data-cursor="View">
              <div className="abt-tool-icon">
                <Image src={tool.logo} alt={tool.name} width={36} height={36} style={{ width: 36, height: 36, objectFit: 'contain' }} />
              </div>
              <p className="abt-tool-name">{tool.name}</p>
              <p className="abt-tool-desc">{tool.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
