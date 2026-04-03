'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { Project } from '@/lib/types'

/* ────────────────────────────────────────────────────────────── */
/*  Props                                                         */
/* ────────────────────────────────────────────────────────────── */

interface ProjectCardProps {
  project: Project
  index: number
  /** featured = large overlay card | medium = tall right-col card | small = compact card */
  variant?: 'featured' | 'medium' | 'small'
}

/* ────────────────────────────────────────────────────────────── */
/*  Styles                                                        */
/* ────────────────────────────────────────────────────────────── */

const css = /* css */ `
/* ── Base card link ── */
.pcard {
  display: block;
  text-decoration: none;
  color: var(--text);
  position: relative;
  transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
  will-change: transform;
}
.pcard:hover {
  transform: translateY(-6px);
  box-shadow:
    0 0 40px 6px rgba(255,77,0,0.22),
    0 0 90px 24px rgba(255,77,0,0.09),
    0 24px 64px 0 rgba(255,77,0,0.10);
}

/* ── Animated border sweep on hover ── */
@property --pcard-sweep {
  syntax: '<angle>';
  inherits: false;
  initial-value: 0turn;
}

.pcard::before {
  content: '';
  position: absolute;
  inset: -1.5px;
  border-radius: 17.5px;
  background: conic-gradient(
    from var(--pcard-sweep),
    transparent 0%,
    var(--accent) 15%,
    rgba(255,77,0,0.35) 25%,
    transparent 30%
  );
  opacity: 0;
  transition: opacity 0.35s ease;
  pointer-events: none;
  z-index: 4;
}
.pcard:hover::before {
  opacity: 1;
  animation: pcard-border-sweep 1.8s linear infinite;
}
@keyframes pcard-border-sweep {
  to { --pcard-sweep: 1turn; }
}

/* ── Inner surface cover - creates hollow border illusion ── */
.pcard::after {
  content: '';
  position: absolute;
  inset: 1.5px;
  border-radius: 14.5px;
  background: var(--surface, #141414);
  pointer-events: none;
  z-index: 3;
}

/* ── Image wrapper (shared) ── */
.pcard__img-wrap {
  position: relative;
  overflow: hidden;
  background: var(--surface, #111);
  z-index: 4;
}
.pcard__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}
.pcard:hover .pcard__img { transform: scale(1.06); }

/* ── Ghost index number (inside image) ── */
.pcard__ghost-num {
  position: absolute;
  bottom: -8px;
  right: 12px;
  font-family: var(--font-display);
  font-size: clamp(80px, 14vw, 150px);
  font-weight: 900;
  color: rgba(255, 255, 255, 0.06);
  line-height: 1;
  pointer-events: none;
  user-select: none;
  letter-spacing: -0.04em;
  z-index: 0;
}

/* ── FEATURED badge ── */
.pcard__badge {
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 3;
  background: var(--accent);
  color: #0A0A0A;
  font-family: var(--font-mono);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 5px 12px;
  border-radius: 999px;
}

/* ── Overlay gradient (featured only) ── */
.pcard__overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(8, 8, 8, 0.90) 0%,
    rgba(8, 8, 8, 0.18) 50%,
    transparent 100%
  );
  z-index: 1;
  pointer-events: none;
  transition: background 0.4s ease;
}
.pcard:hover .pcard__overlay {
  background: linear-gradient(
    to top,
    rgba(8, 8, 8, 0.94) 0%,
    rgba(8, 8, 8, 0.3) 55%,
    rgba(8, 8, 8, 0.05) 100%
  );
}

/* ── Featured info - overlaid at bottom of image ── */
.pcard__info-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: clamp(18px, 2.5vw, 28px);
  z-index: 2;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 12px;
}
.pcard__info-text { flex: 1; }
.pcard__title {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(1.2rem, 2.2vw, 1.6rem);
  line-height: 1.2;
  margin: 0 0 5px;
  color: #FAFAFA;
}
.pcard__subtitle {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  font-family: var(--font-body, sans-serif);
  line-height: 1.4;
  margin: 0;
}
.pcard__arrow-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  color: #FAFAFA;
  flex-shrink: 0;
  transition: background 0.3s ease, border-color 0.3s ease, color 0.3s ease;
}
.pcard:hover .pcard__arrow-btn {
  background: var(--accent);
  border-color: var(--accent);
  color: #0A0A0A;
}

/* ── Info below image (medium + small) ── */
.pcard__info-below {
  padding: 14px 0 0;
  position: relative;
  z-index: 4;
}
.pcard__title-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 6px;
}
.pcard__title-below {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: clamp(1rem, 1.6vw, 1.2rem);
  color: #FAFAFA;
  line-height: 1.2;
  margin: 0;
}
.pcard__subtitle-below {
  font-size: 12px;
  color: var(--muted);
  margin-bottom: 8px;
  font-family: var(--font-body, sans-serif);
  line-height: 1.4;
}
.pcard__year {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--muted);
  white-space: nowrap;
  flex-shrink: 0;
}
.pcard__tags {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.pcard__tag {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--muted);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 4px 10px;
  border: 1px solid var(--border);
  border-radius: 999px;
  transition: border-color 0.25s ease, color 0.25s ease;
}
.pcard:hover .pcard__tag {
  border-color: rgba(255, 255, 255, 0.18);
  color: rgba(255, 255, 255, 0.65);
}

/* ── FEATURED variant ── */
.pcard--featured .pcard__img-wrap {
  border-radius: 16px;
  aspect-ratio: 4 / 3;
}
@media (min-width: 900px) {
  .pcard--featured .pcard__img-wrap {
    aspect-ratio: unset;
    height: 100%;
    min-height: 460px;
  }
}

/* ── MEDIUM variant ── */
.pcard--medium {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.pcard--medium .pcard__img-wrap {
  border-radius: 16px 16px 0 0;
  flex: 1;
  min-height: 240px;
}

/* ── SMALL variant ── */
.pcard--small .pcard__img-wrap {
  border-radius: 16px 16px 0 0;
  aspect-ratio: 4 / 3;
}

@media (prefers-reduced-motion: reduce) {
  .pcard:hover::before { animation: none; }
}

/* Skeleton when no image */
.pcard__skeleton {
  position: absolute;
  inset: 0;
  background: var(--surface, #111);
}
`

/* ────────────────────────────────────────────────────────────── */
/*  Component                                                     */
/* ────────────────────────────────────────────────────────────── */

export default function ProjectCard({
  project,
  index,
  variant = 'small',
}: ProjectCardProps) {
  const idxStr = String(index + 1).padStart(2, '0')
  const tags = project.tags?.slice(0, 3) ?? []

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <Link
        href={`/work/${project.slug}`}
        className={`pcard pcard--${variant} project-card`}
        style={{ height: variant === 'medium' ? '100%' : undefined }}
        data-cursor="view"
      >
        {/* ── Image area ── */}
        <div className="pcard__img-wrap">
          {/* Ghost index number */}
          <span className="pcard__ghost-num">{idxStr}</span>

          {/* Featured badge */}
          {(variant === 'featured' || project.isFeatured) && (
            <span className="pcard__badge">Featured</span>
          )}

          {/* Thumbnail */}
          {project.thumbnailUrl ? (
            <Image
              src={project.thumbnailUrl}
              alt={project.title}
              fill
              sizes={
                variant === 'featured'
                  ? '(max-width:900px) 100vw, 60vw'
                  : variant === 'medium'
                  ? '(max-width:900px) 100vw, 40vw'
                  : '(max-width:600px) 100vw, 33vw'
              }
              className="pcard__img"
              priority={index === 0}
            />
          ) : (
            <div className="pcard__skeleton" />
          )}

          {/* Overlay gradient + bottom info (featured only) */}
          {variant === 'featured' && (
            <>
              <div className="pcard__overlay" />
              <div className="pcard__info-overlay">
                <div className="pcard__info-text">
                  <h3 className="pcard__title">{project.title}</h3>
                  {project.tagline && (
                    <p className="pcard__subtitle">{project.tagline}</p>
                  )}
                </div>
                <div className="pcard__arrow-btn" aria-hidden>↗</div>
              </div>
            </>
          )}
        </div>

        {/* ── Info below image (medium + small) ── */}
        {variant !== 'featured' && (
          <div className="pcard__info-below">
            <div className="pcard__title-row">
              <h3 className="pcard__title-below">{project.title}</h3>
              {project.year && (
                <span className="pcard__year">{project.year}</span>
              )}
            </div>
            {project.tagline && (
              <p className="pcard__subtitle-below">{project.tagline}</p>
            )}
            {tags.length > 0 && (
              <div className="pcard__tags">
                {tags.map((t) => (
                  <span key={t} className="pcard__tag">{t}</span>
                ))}
              </div>
            )}
          </div>
        )}
      </Link>
    </>
  )
}
