'use client'

/**
 * The holding page for a project that exists but is not ready to be read.
 *
 * Deliberately short. It is the site's own coming-soon language (mono
 * micro-labels, HUD corner brackets, the pulsing accent dot, scanlines) rather
 * than a new one, but it drops the generic page's scramble headline and fake
 * progress bar: this is a real project with a real name, and a percentage
 * nobody measured would be the one invented number on the site.
 *
 * It is coloured by the project's own palette, exactly as the full case study
 * is, so arriving here does not feel like leaving the work.
 */

import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import { paletteFor } from '@/lib/project-palette'
import type { ProjectStatus } from '@/lib/project-status'
import type { Project } from '@/lib/types'

const css = /* css */ `
.pcs {
  --pcs-max: 1180px;
  position: relative;
  min-height: 100dvh;
  background: var(--pcs-field);
  padding: clamp(7rem, 15vh, 10rem) clamp(1.5rem, 5vw, 6rem) clamp(4rem, 8vw, 7rem);
  overflow: hidden;
}
.pcs::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(60% 50% at 50% 32%, var(--pcs-accent) 0%, transparent 68%);
  opacity: 0.09;
  pointer-events: none;
}
.pcs__scanlines {
  position: absolute; inset: 0; z-index: 1; pointer-events: none;
  background: repeating-linear-gradient(0deg, transparent, transparent 2px,
    rgba(0,0,0,0.025) 2px, rgba(0,0,0,0.025) 4px);
}
.pcs__corner {
  position: absolute; width: 26px; height: 26px;
  border-color: rgba(255,255,255,0.12); border-style: solid;
}
.pcs__corner--tl { top: 30px; left: 30px; border-width: 1px 0 0 1px; }
.pcs__corner--tr { top: 30px; right: 30px; border-width: 1px 1px 0 0; }
.pcs__corner--bl { bottom: 30px; left: 30px; border-width: 0 0 1px 1px; }
.pcs__corner--br { bottom: 30px; right: 30px; border-width: 0 1px 1px 0; }

.pcs__inner {
  position: relative; z-index: 2;
  max-width: var(--pcs-max);
  margin: 0 auto;
}

.pcs__eyebrow {
  display: flex; align-items: center; justify-content: space-between;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase;
  color: rgba(255,255,255,0.32);
  padding-bottom: 18px;
  border-bottom: 1px solid rgba(255,255,255,0.07);
  margin-bottom: clamp(40px, 6vw, 64px);
}
.pcs__back {
  display: inline-flex; align-items: center; gap: 9px;
  color: inherit; text-decoration: none; transition: color 0.2s ease;
}
.pcs__back:hover { color: #fff; }
.pcs__back svg { width: 13px; height: 13px; }
.pcs__year { color: var(--pcs-accent); }

.pcs__status {
  display: inline-flex; align-items: center; gap: 9px;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase;
  color: rgba(255,255,255,0.5);
  border: 1px solid rgba(255,255,255,0.12);
  padding: 8px 17px 8px 13px;
  border-radius: 999px;
  margin-bottom: 30px;
}
.pcs__dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--pcs-accent);
  animation: pcs-pulse 2s ease infinite;
}
@keyframes pcs-pulse {
  0%,100% { opacity: 1; }
  50% { opacity: 0.45; }
}

.pcs__title {
  font-family: var(--font-display, 'Space Grotesk', sans-serif);
  font-weight: 700;
  font-size: clamp(2.6rem, 7vw, 5.4rem);
  line-height: 0.96;
  letter-spacing: -0.035em;
  color: var(--color-fg, #FAFAFA);
  margin: 0 0 26px;
  max-width: 16ch;
}
.pcs__title em { font-style: normal; color: var(--pcs-accent); }

.pcs__note {
  font-family: var(--font-body, 'DM Sans', sans-serif);
  font-size: clamp(1rem, 1.5vw, 1.15rem);
  line-height: 1.7;
  color: rgba(255,255,255,0.52);
  max-width: 54ch;
  margin: 0 0 clamp(38px, 5vw, 54px);
}

/* ── the two columns: what is left, and the way out ── */
.pcs__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(28px, 5vw, 70px);
  padding-top: clamp(30px, 4vw, 44px);
  border-top: 1px solid rgba(255,255,255,0.07);
}
.pcs__label {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase;
  color: rgba(255,255,255,0.3);
  margin: 0 0 16px;
}
.pcs__list { list-style: none; margin: 0; padding: 0; }
.pcs__list li {
  font-family: var(--font-body, 'DM Sans', sans-serif);
  font-size: 14px; line-height: 1.6;
  color: rgba(255,255,255,0.62);
  padding: 9px 0 9px 20px;
  position: relative;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}
.pcs__list li::before {
  content: '';
  position: absolute; left: 0; top: 17px;
  width: 7px; height: 1px;
  background: var(--pcs-accent);
  opacity: 0.7;
}
.pcs__meta p { margin: 0 0 14px; }
.pcs__meta dt {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase;
  color: rgba(255,255,255,0.3);
  margin-bottom: 5px;
}
.pcs__meta dd {
  margin: 0 0 18px;
  font-family: var(--font-body, 'DM Sans', sans-serif);
  font-size: 14px;
  color: rgba(255,255,255,0.72);
}

.pcs__cta {
  display: inline-flex; align-items: center; gap: 13px;
  margin-top: 10px;
  padding: 15px 21px; border-radius: 3px;
  background: var(--pcs-accent); color: #0a0a0a;
  font-family: var(--font-display, 'Space Grotesk', sans-serif);
  font-weight: 700; font-size: 12px;
  letter-spacing: 0.06em; text-transform: uppercase;
  text-decoration: none; transition: opacity 0.2s ease;
}
.pcs__cta:hover { opacity: 0.88; }
.pcs__cta svg { width: 15px; height: 15px; transition: transform 0.25s ease; }
.pcs__cta:hover svg { transform: translate(2px,-2px); }

/* ── a single glimpse, dimmed, so it is clearly not the case study ── */
.pcs__peek {
  position: relative;
  margin-top: clamp(48px, 7vw, 80px);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 4px;
  overflow: hidden;
  aspect-ratio: 16 / 9;
}
.pcs__peek img { object-fit: cover; opacity: 0.4; }
.pcs__peek::after {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(to bottom, transparent 20%, var(--pcs-field) 96%);
}

@media (max-width: 800px) {
  .pcs__grid { grid-template-columns: 1fr; }
  .pcs__corner { display: none; }
  .pcs__title { max-width: none; }
}
@media (prefers-reduced-motion: reduce) {
  .pcs__dot { animation: none; }
}
`

export default function ComingSoonProject({
    project,
    status,
}: {
    project: Project
    status: ProjectStatus
}) {
    const palette = paletteFor(project.slug)

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: css }} />

            <main
                className="pcs"
                style={
                    {
                        '--pcs-field': palette.field,
                        '--pcs-accent': palette.accent,
                    } as React.CSSProperties
                }
            >
                <div className="pcs__scanlines" aria-hidden="true" />
                <span className="pcs__corner pcs__corner--tl" aria-hidden="true" />
                <span className="pcs__corner pcs__corner--tr" aria-hidden="true" />
                <span className="pcs__corner pcs__corner--bl" aria-hidden="true" />
                <span className="pcs__corner pcs__corner--br" aria-hidden="true" />

                <div className="pcs__inner">
                    <div className="pcs__eyebrow">
                        <Link href="/work" className="pcs__back">
                            <ArrowLeft /> Selected work
                        </Link>
                        <span className="pcs__year">{project.year ?? 'In progress'}</span>
                    </div>

                    <span className="pcs__status">
                        <span className="pcs__dot" aria-hidden="true" />
                        {status.label}
                    </span>

                    <h1 className="pcs__title">
                        {project.title.split(':')[0]}, <em>write-up coming</em>
                    </h1>

                    <p className="pcs__note">{status.note}</p>

                    <div className="pcs__grid">
                        <div>
                            {status.outstanding && status.outstanding.length > 0 && (
                                <>
                                    <p className="pcs__label">What it is waiting on</p>
                                    <ul className="pcs__list">
                                        {status.outstanding.map((o) => (
                                            <li key={o}>{o}</li>
                                        ))}
                                    </ul>
                                </>
                            )}
                        </div>

                        <div className="pcs__meta">
                            <dl>
                                {project.client && (
                                    <>
                                        <dt>Client</dt>
                                        <dd>{project.client}</dd>
                                    </>
                                )}
                                {project.role && (
                                    <>
                                        <dt>Role</dt>
                                        <dd>{project.role}</dd>
                                    </>
                                )}
                                {project.tags && project.tags.length > 0 && (
                                    <>
                                        <dt>Discipline</dt>
                                        <dd>{project.tags.join(' · ')}</dd>
                                    </>
                                )}
                            </dl>

                            <Link href="/contact" className="pcs__cta">
                                Ask me about it <ArrowUpRight />
                            </Link>
                        </div>
                    </div>

                    {project.coverUrl && (
                        <div className="pcs__peek">
                            <Image
                                src={project.coverUrl}
                                alt={`${project.title}, work in progress`}
                                fill
                                sizes="(max-width: 1180px) 100vw, 1180px"
                            />
                        </div>
                    )}
                </div>
            </main>
        </>
    )
}
