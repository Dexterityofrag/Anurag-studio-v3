'use client'

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ArrowUpRight } from 'lucide-react'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import { paletteFor } from '@/lib/project-palette'
import type { Project, ProjectWithTestimonials } from '@/lib/types'
import type { ImageItem } from '@/lib/db/schema'

interface ProjectDetailProps {
  project: ProjectWithTestimonials
  adjacent: { prev: Project | null; next: Project | null }
  /** Where this project sits in the published set, for the hero counter. */
  position?: { index: number; total: number }
}

/* ────────────────────────────────────────────────────────────── */
/*  Splitting the write-up into numbered chapters                 */
/* ────────────────────────────────────────────────────────────── */

type Chapter = { title: string | null; html: string }

const TAGS = /<[^>]*>/g

/**
 * The case study is stored as one HTML blob, but it reads as chapters: every
 * <h2> starts one. Splitting on those boundaries lets the page put the chapter
 * name in the left rail and the writing in the right column without touching a
 * word of the content — take the layout away and the same HTML still renders
 * top to bottom, in order.
 *
 * Anything before the first heading (a standing intro) becomes an unlabelled
 * opening chapter rather than being dropped.
 */
function toChapters(html: string): Chapter[] {
  if (!html.trim()) return []

  return html
    .split(/(?=<h2[\s>])/i)
    .map((chunk) => {
      const heading = chunk.match(/^<h2[^>]*>([\s\S]*?)<\/h2>/i)
      if (!heading) return { title: null, html: chunk }
      return {
        title: heading[1].replace(TAGS, '').trim(),
        html: chunk.slice(heading[0].length),
      }
    })
    .filter((c) => c.title || c.html.replace(TAGS, '').trim())
}

/**
 * Give each chapter a picture to sit with.
 *
 * When a case study has been written with its figures woven in, this does
 * nothing: every image is already inside the prose and none are left over. It
 * matters for the ones still stored as plain copy plus a pile of screenshots,
 * where the alternative is what the page used to do — run the whole write-up,
 * then dump every image underneath it in a grid nobody scrolls to.
 *
 * Images go in as small groups rather than one per chapter. Two reasons: a
 * pair of screens beside each other says more than two lone plates a screen
 * apart, and on a phone a group becomes one swipeable rail, which is the
 * difference between a five-screen scroll and a one-screen one.
 *
 * Groups are spread across the titled chapters rather than filling the first
 * few, so a seven-chapter study with five screenshots gets a pair near the
 * top, a pair in the middle and one near the end. Anything that does not fit
 * falls through to the closing gallery.
 */
const PER_GROUP = 2

function placeFigures(chapters: Chapter[], loose: ImageItem[]) {
  const slots = chapters.map((c, i) => (c.title ? i : -1)).filter((i) => i >= 0)
  const placed = new Map<number, ImageItem[]>()
  if (slots.length === 0 || loose.length === 0) return { placed, leftover: loose }

  const count = Math.min(Math.ceil(loose.length / PER_GROUP), slots.length)
  const per = Math.ceil(loose.length / count)

  const groups: ImageItem[][] = []
  for (let i = 0; i < count; i++) groups.push(loose.slice(i * per, (i + 1) * per))

  groups.forEach((group, i) => {
    if (group.length === 0) return
    const want =
      count === 1
        ? Math.floor(slots.length / 2)
        : Math.round((i * (slots.length - 1)) / (count - 1))
    // Nudge along on a collision so two groups never claim one chapter.
    let at = want
    while (at < slots.length && placed.has(slots[at])) at++
    if (at >= slots.length) return
    placed.set(slots[at], group)
  })

  const used = new Set([...placed.values()].flat())
  return { placed, leftover: loose.filter((img) => !used.has(img)) }
}

/** "https://lineup.app/menu" → "lineup.app" */
function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return 'the live site'
  }
}

const pad = (n: number) => String(n).padStart(2, '0')

/* ────────────────────────────────────────────────────────────── */
/*  Motion                                                        */
/* ────────────────────────────────────────────────────────────── */

/**
 * The site's standard scroll reveal, wrapped so the options object stays
 * stable. useScrollReveal keys its effect on that object, so an inline literal
 * would tear down and rebuild the ScrollTrigger on every render.
 */
function Reveal({
  children,
  className,
  y = 44,
  delay = 0,
}: {
  children: ReactNode
  className?: string
  y?: number
  delay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const options = useMemo(() => {
    const still =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    return still
      ? { y: 0, opacity: 1, duration: 0.01, delay: 0 }
      : { y, delay, duration: 0.9, start: 'top 88%' }
  }, [y, delay])

  useScrollReveal(ref, options)

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}

/**
 * Kept out of ProjectDetail so a scroll event does not re-render the whole
 * case study sixty times a second — which would also thrash every reveal.
 */
function ReadingBar() {
  const [pct, setPct] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight
      if (h > 0) setPct((window.scrollY / h) * 100)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="cs-prog" aria-hidden="true">
      <div className="cs-prog__bar" style={{ width: `${pct}%` }} />
    </div>
  )
}

/**
 * A chapter's pictures.
 *
 * One element, two behaviours. Above 700px it is a row of letterboxed plates:
 * every screenshot sits centred on the project's own colour, so a portrait
 * phone shot and a wide dashboard shot take the same vertical space and the
 * column keeps an even rhythm. Below 700px the same row becomes a horizontal
 * scroll-snap rail that bleeds to both screen edges, which is what keeps a
 * five-screenshot case study from turning into a five-screen scroll.
 */
function FigureGroup({ images, fallbackAlt }: { images: ImageItem[]; fallbackAlt: string }) {
  const railRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)
  // A phone screenshot and a dashboard screenshot want different plates. The
  // stored ImageItem carries no dimensions, so the shape is settled from the
  // file itself the moment it loads — before the reveal animation brings the
  // plate into view, so nothing visibly jumps.
  const [tall, setTall] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const rail = railRef.current
    if (!rail || images.length < 2) return

    // Only meaningful while the rail is actually scrollable, which is the
    // mobile case; on desktop scrollWidth matches clientWidth and this never
    // moves off zero.
    const onScroll = () => {
      const step = rail.scrollWidth / images.length
      if (step > 0) setActive(Math.round(rail.scrollLeft / step))
    }
    rail.addEventListener('scroll', onScroll, { passive: true })
    return () => rail.removeEventListener('scroll', onScroll)
  }, [images.length])

  const pair = images.length > 1

  return (
    <div className="cs-figs">
      <div
        className={`cs-figs__rail${pair ? ' cs-figs__rail--pair' : ''}`}
        ref={railRef}
        role={pair ? 'group' : undefined}
        aria-label={pair ? `${images.length} project images` : undefined}
      >
        {images.map((image) => (
          <figure
            className={`cs-figure${tall[image.url] ? ' cs-figure--tall' : ''}`}
            key={image.url}
          >
            <div className="cs-figure__frame">
              <Image
                src={image.url}
                alt={image.alt || fallbackAlt}
                fill
                sizes="(max-width:700px) 88vw, (max-width:1400px) 50vw, 700px"
                className="cs-figure__img"
                onLoad={(e) => {
                  const el = e.currentTarget
                  if (!el.naturalWidth || !el.naturalHeight) return
                  const isTall = el.naturalHeight > el.naturalWidth * 1.1
                  setTall((prev) =>
                    prev[image.url] === isTall ? prev : { ...prev, [image.url]: isTall },
                  )
                }}
              />
            </div>
            {(image.caption || image.alt) && (
              <figcaption className="cs-figure__cap">{image.caption || image.alt}</figcaption>
            )}
          </figure>
        ))}
      </div>

      {pair && (
        <div className="cs-figs__dots" aria-hidden="true">
          {images.map((image, i) => (
            <span
              key={image.url}
              className={`cs-figs__dot${i === active ? ' cs-figs__dot--on' : ''}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}

/* ────────────────────────────────────────────────────────────── */
/*  Styles                                                        */
/* ────────────────────────────────────────────────────────────── */

const css = /* css */ `
/* Every colour on this page is mixed from the project's own two values, set on
   .cs as --pj-field (the deep ground) and --pj-accent (the signal colour). */
.cs {
  --cs-rule: rgba(255,255,255,0.10);
  --cs-dim:  rgba(255,255,255,0.42);
  --cs-body: rgba(255,255,255,0.66);
  --cs-gut:  var(--page-px, clamp(1.5rem,5vw,4rem));
  --cs-max:  1400px;
  position: relative;
  /* The case study is its own room. The site's green mesh is deliberately
     covered here so the only colour in the page is the project's own. */
  background: var(--pj-field);
}

/* ─── READING PROGRESS ──────────────────────────────────────── */
.cs-prog { position: fixed; top: 0; left: 0; right: 0; height: 2px; z-index: 200; pointer-events: none; }
.cs-prog__bar { height: 100%; background: var(--pj-accent); transition: width 0.05s linear; }

/* ─── HERO ──────────────────────────────────────────────────── */
.cs-hero {
  position: relative;
  overflow: hidden;
  background: var(--pj-field);
  padding: clamp(7rem,14vh,10rem) var(--cs-gut) 0;
}
/* The field on its own is nearly black. The glow is what makes a case study
   read as "the orange one" or "the teal one" before a word of it is read. */
.cs-hero::before {
  content: '';
  position: absolute; inset: 0; z-index: 0;
  background: radial-gradient(
    118% 80% at 50% 8%,
    color-mix(in srgb, var(--pj-accent) 30%, transparent) 0%,
    color-mix(in srgb, var(--pj-accent) 9%, transparent) 42%,
    transparent 72%
  );
}
.cs-hero__inner { position: relative; z-index: 1; max-width: var(--cs-max); margin: 0 auto; }

.cs-hero__eyebrow {
  display: flex; align-items: center; justify-content: space-between; gap: 1rem;
  padding-bottom: 14px; border-bottom: 1px solid var(--cs-rule);
  font-family: var(--font-mono); font-size: 10px; font-weight: 500;
  letter-spacing: 0.14em; text-transform: uppercase; color: var(--cs-dim);
}
.cs-hero__back { display: inline-flex; align-items: center; gap: 9px; color: inherit; text-decoration: none; transition: color 0.2s ease; }
.cs-hero__back:hover { color: #fff; }
.cs-hero__back svg { width: 13px; height: 13px; }
.cs-hero__count { color: var(--pj-accent); }

.cs-hero__title {
  font-family: var(--font-display); font-weight: 800;
  font-size: clamp(3.1rem, 11.5vw, 10.5rem);
  line-height: 0.84; letter-spacing: -0.05em;
  color: #fff; margin: clamp(2.5rem,7vh,4.5rem) 0 0;
  max-width: 15ch;
}
.cs-hero__lead {
  font-family: var(--font-body); font-weight: 400;
  font-size: clamp(1.1rem, 2.2vw, 1.85rem);
  line-height: 1.25; letter-spacing: -0.02em;
  color: rgba(255,255,255,0.72);
  max-width: 34ch;
  /* Set against the right, the way the reference hangs its lead off the end of
     the title rather than beside it. */
  margin: clamp(2rem,5vh,3.5rem) 0 0 auto;
}

.cs-hero__visual {
  position: relative; z-index: 1;
  max-width: var(--cs-max); margin: clamp(3rem,7vh,5.5rem) auto 0;
  transform: translateY(clamp(1.5rem,4vh,3rem));
}
.cs-hero__frame {
  position: relative; overflow: hidden;
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 8px; background: #0d0d0d;
  box-shadow: 0 40px 80px -30px rgba(0,0,0,0.8);
  aspect-ratio: 16 / 9;
}
.cs-hero__img { object-fit: cover; object-position: center; }

/* ─── META STRIP ────────────────────────────────────────────── */
/* Darkened rather than recoloured, so the band still carries the project's
   own hue instead of dropping to a neutral black. */
.cs-meta {
  background: rgba(0,0,0,0.4);
  padding: clamp(5rem,10vh,7.5rem) var(--cs-gut) clamp(2.5rem,5vh,3.5rem);
}
.cs-body, .cs-gallery { background: rgba(0,0,0,0.4); }
.cs-meta__grid {
  max-width: var(--cs-max); margin: 0 auto;
  display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  border-top: 1px solid var(--cs-rule);
}
.cs-meta__cell {
  padding: clamp(1.5rem,3vh,2rem) clamp(1rem,2vw,1.75rem) clamp(1.75rem,3.5vh,2.5rem) 0;
  border-right: 1px solid var(--cs-rule);
}
.cs-meta__cell:last-child { border-right: none; }
.cs-meta__label {
  font-family: var(--font-mono); font-size: 10px; font-weight: 500;
  letter-spacing: 0.14em; text-transform: uppercase;
  color: var(--cs-dim); margin: 0 0 clamp(1.5rem,3vh,2.5rem);
}
.cs-meta__value {
  font-family: var(--font-display); font-weight: 500;
  font-size: clamp(1.05rem, 1.7vw, 1.35rem);
  line-height: 1.25; letter-spacing: -0.02em;
  color: rgba(255,255,255,0.9); margin: 0;
}
.cs-meta__tags { display: flex; flex-wrap: wrap; gap: 6px 8px; }
.cs-meta__tag {
  font-family: var(--font-mono); font-size: 10px;
  letter-spacing: 0.06em; text-transform: uppercase;
  color: var(--cs-dim); padding: 4px 9px;
  border: 1px solid var(--cs-rule); border-radius: 2px;
}

/* ─── CHAPTERS ──────────────────────────────────────────────── */
.cs-body { padding: clamp(4rem,8vh,7rem) var(--cs-gut) clamp(5rem,10vh,8rem); }
.cs-chapter {
  max-width: var(--cs-max); margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 0.34fr) minmax(0, 0.66fr);
  gap: clamp(2rem, 5vw, 4rem);
  padding: clamp(3rem,6vh,4.5rem) 0 clamp(3.5rem,7vh,6rem);
  border-top: 1px solid var(--cs-rule);
}
.cs-chapter:first-child { border-top: none; padding-top: 0; }
.cs-chapter__label {
  display: flex; gap: clamp(1.25rem,2.5vw,2.5rem);
  font-family: var(--font-mono); font-size: 10px; font-weight: 500;
  letter-spacing: 0.11em; text-transform: uppercase;
  /* Stays alongside the chapter it names, then releases at the next one. */
  position: sticky; top: clamp(5.5rem,11vh,7rem); align-self: start;
}
.cs-chapter__num { color: var(--pj-accent); flex-shrink: 0; }
.cs-chapter__name { color: var(--cs-dim); }
.cs-chapter__body { min-width: 0; }
.cs-chapter__title {
  font-family: var(--font-display); font-weight: 700;
  font-size: clamp(1.9rem, 4.6vw, 3.8rem);
  line-height: 0.95; letter-spacing: -0.04em;
  color: var(--text, #FAFAFA);
  margin: 0 0 clamp(1.75rem,4vh,3rem);
}

/* ─── PROSE ─────────────────────────────────────────────────── */
.cs-prose p {
  font-family: var(--font-body);
  font-size: clamp(1.02rem, 1.35vw, 1.2rem);
  line-height: 1.68; color: var(--cs-body);
  margin: 0 0 1.35em; max-width: 62ch;
}
.cs-prose h3 {
  font-family: var(--font-display); font-weight: 600;
  font-size: clamp(1.1rem, 1.8vw, 1.45rem);
  letter-spacing: -0.02em; color: var(--text, #FAFAFA);
  margin: clamp(2.25rem,4.5vh,3rem) 0 0.9rem;
}
.cs-prose a { color: var(--pj-accent); text-decoration: none; border-bottom: 1px solid transparent; transition: border-color 0.2s ease; }
.cs-prose a:hover { border-bottom-color: currentColor; }
.cs-prose strong { color: rgba(255,255,255,0.9); font-weight: 600; }

/* Lists read as a stack of stated points, one hairline apart, rather than as a
   bulleted paragraph. */
.cs-prose ul, .cs-prose ol { list-style: none; padding: 0; margin: 0 0 1.6em; max-width: 62ch; }
.cs-prose li {
  font-family: var(--font-body);
  font-size: clamp(1.02rem, 1.35vw, 1.2rem);
  line-height: 1.6; color: var(--cs-body);
  padding: 0.85rem 0 0.85rem 2.25rem;
  border-top: 1px solid var(--cs-rule);
  position: relative;
}
.cs-prose li:last-child { border-bottom: 1px solid var(--cs-rule); }
.cs-prose li::before {
  content: ''; position: absolute; left: 0.35rem; top: 1.5em;
  width: 14px; height: 1px; background: var(--pj-accent); opacity: 0.7;
}
.cs-prose ol { counter-reset: cs-ol; }
.cs-prose ol li { counter-increment: cs-ol; }
.cs-prose ol li::before {
  content: counter(cs-ol, decimal-leading-zero);
  left: 0; top: 0.85rem; width: auto; height: auto; background: none;
  font-family: var(--font-mono); font-size: 10px; color: var(--pj-accent); opacity: 1;
}
.cs-prose li p { margin: 0; max-width: none; }

.cs-prose blockquote {
  margin: clamp(2.5rem,5vh,3.5rem) 0;
  padding-left: clamp(1.25rem,3vw,2.5rem);
  border-left: 2px solid var(--pj-accent);
  font-family: var(--font-display); font-weight: 600;
  font-size: clamp(1.4rem, 3vw, 2.4rem);
  line-height: 1.08; letter-spacing: -0.035em;
  color: var(--text, #FAFAFA);
}
.cs-prose blockquote p { font: inherit; color: inherit; margin: 0; max-width: 20ch; }

/* ─── FIGURES IN THE WRITING ──────────────────────────────────
   Same plate as the chapter figures, done without a wrapper: these arrive as
   raw <img> inside the stored HTML. The seed bakes real width and height onto
   every tag, so width:auto keeps the true aspect while max-height stops a
   portrait phone screenshot running to 1,300px and stretching the page. */
.cs-prose img {
  box-sizing: border-box;
  display: block;
  width: auto; height: auto;
  max-width: 100%;
  max-height: clamp(340px, 56vh, 620px);
  margin: clamp(2.5rem,5vh,3.5rem) auto 0;
  padding: clamp(0.75rem, 2.5%, 1.5rem);
  border: 1px solid rgba(255,255,255,0.09);
  border-radius: 8px;
  background:
    radial-gradient(
      82% 78% at 50% 42%,
      color-mix(in srgb, var(--pj-accent) 16%, transparent) 0%,
      transparent 70%
    ),
    var(--pj-field);
}
/* Captions are <p class="pd-figcap"><em>…</em></p>. Tiptap's paragraph schema
   has no class attribute, so the class disappears the first time a case study
   is saved from the admin editor; the <em> is a real mark and survives. Both
   selectors are kept, so a caption stays a caption either way. */
.cs-prose p.pd-figcap,
.cs-prose img + p > em {
  font-family: var(--font-mono); font-size: 11px; font-style: normal;
  line-height: 1.6; letter-spacing: 0.02em;
  color: rgba(255,255,255,0.36);
}
/* Centred under a centred plate. */
.cs-prose p.pd-figcap,
.cs-prose img + p {
  margin: 0.9rem auto clamp(2.5rem,5vh,3.5rem);
  max-width: 58ch; text-align: center;
}

/* ─── FIGURES PLACED WITH A CHAPTER ─────────────────────────── */
/* Breaks the two-column grid so the pictures run the full measure of the page,
   under the label rail as well as the text. */
.cs-figs-reveal { grid-column: 1 / -1; margin-top: clamp(2.5rem,5.5vh,4rem); }
.cs-figs__rail { display: grid; grid-template-columns: 1fr; gap: clamp(1rem,2vw,1.75rem); }
.cs-figs__rail--pair { grid-template-columns: repeat(2, minmax(0,1fr)); }
.cs-figs__dots { display: none; }

.cs-figure { margin: 0; min-width: 0; }
/* A fixed plate, not a full-bleed image. A portrait phone screenshot and a
   wide dashboard shot then take the same vertical space, which is what stops
   a five-screenshot case study running to twenty thousand pixels. */
.cs-figure__frame {
  position: relative; overflow: hidden;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.09);
  background:
    radial-gradient(
      82% 78% at 50% 42%,
      color-mix(in srgb, var(--pj-accent) 16%, transparent) 0%,
      transparent 70%
    ),
    var(--pj-field);
  aspect-ratio: 16 / 10;
}
.cs-figs__rail--pair .cs-figure__frame { aspect-ratio: 4 / 3; }

/* Portrait shots, once measured. A lone phone screenshot gets a plate cut to
   its own shape and pulled in from the full width, rather than sitting adrift
   in the middle of a letterbox. */
.cs-figure--tall .cs-figure__frame { aspect-ratio: 4 / 5; }
.cs-figs__rail:not(.cs-figs__rail--pair) .cs-figure--tall {
  max-width: 480px; margin-inline: auto;
}
.cs-figure__img {
  box-sizing: border-box;
  object-fit: contain;
  padding: clamp(0.9rem, 3.5%, 2.25rem);
  transform: scale(0.99);
  transition: transform 0.9s cubic-bezier(0.22,1,0.36,1);
}
.cs-figure__frame:hover .cs-figure__img { transform: scale(1.01); }
.cs-figure__cap {
  font-family: var(--font-mono); font-size: 11px; line-height: 1.6;
  letter-spacing: 0.02em; color: rgba(255,255,255,0.36);
  margin-top: 0.9rem; max-width: 58ch;
}

/* ─── GALLERY ───────────────────────────────────────────────── */
.cs-gallery { padding: 0 var(--cs-gut) clamp(4rem,8vh,6rem); }
.cs-gallery__inner { max-width: var(--cs-max); margin: 0 auto; }
.cs-gallery__label {
  font-family: var(--font-mono); font-size: 10px; font-weight: 500;
  letter-spacing: 0.14em; text-transform: uppercase; color: var(--cs-dim);
  padding-top: clamp(1.25rem,2.5vh,1.75rem); border-top: 1px solid var(--cs-rule);
  margin: 0 0 clamp(1.5rem,3vh,2.25rem);
}
.cs-gallery__grid {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 380px), 1fr));
  gap: clamp(1rem,2vw,1.75rem);
}
.cs-gallery__item { min-width: 0; margin: 0; }
.cs-gallery__frame {
  position: relative; overflow: hidden; background: #111;
  border: 1px solid rgba(255,255,255,0.09); border-radius: 6px;
}
.cs-gallery__img {
  width: 100%; height: auto; display: block;
  transform: scale(1.02);
  transition: transform 0.8s cubic-bezier(0.22,1,0.36,1);
}
.cs-gallery__frame:hover .cs-gallery__img { transform: scale(1); }
.cs-gallery__cap {
  font-family: var(--font-mono); font-size: 11px; line-height: 1.6;
  color: rgba(255,255,255,0.36); margin-top: 0.85rem;
}

/* ─── CLOSING ───────────────────────────────────────────────── */
.cs-close {
  background: var(--pj-field);
  position: relative; overflow: hidden;
  padding: clamp(4.5rem,9vh,7rem) var(--cs-gut);
}
.cs-close::before {
  content: '';
  position: absolute; inset: 0;
  background: radial-gradient(
    100% 120% at 50% 100%,
    color-mix(in srgb, var(--pj-accent) 22%, transparent) 0%,
    transparent 68%
  );
}
.cs-close__inner {
  position: relative; z-index: 1;
  max-width: var(--cs-max); margin: 0 auto;
  display: flex; flex-wrap: wrap; align-items: flex-end;
  justify-content: space-between; gap: clamp(2rem,4vw,3rem);
}
.cs-close__label {
  font-family: var(--font-mono); font-size: 10px; font-weight: 500;
  letter-spacing: 0.14em; text-transform: uppercase;
  color: var(--pj-accent); margin: 0 0 clamp(1rem,2vh,1.5rem);
}
.cs-close__line {
  font-family: var(--font-display); font-weight: 700;
  font-size: clamp(1.75rem, 4vw, 3.25rem);
  line-height: 1.02; letter-spacing: -0.04em;
  color: #fff; margin: 0; max-width: 18ch;
}
.cs-close__cta {
  display: inline-flex; align-items: center; gap: 14px;
  padding: 16px 22px; border-radius: 3px;
  background: var(--pj-accent); color: #0a0a0a;
  font-family: var(--font-display); font-weight: 700;
  font-size: 12px; letter-spacing: 0.06em; text-transform: uppercase;
  text-decoration: none; transition: opacity 0.2s ease;
}
.cs-close__cta:hover { opacity: 0.88; }
.cs-close__cta svg { width: 15px; height: 15px; flex-shrink: 0; transition: transform 0.25s ease; }
.cs-close__cta:hover svg { transform: translate(2px,-2px); }
.cs-close__cta--off {
  background: transparent; color: rgba(255,255,255,0.35);
  border: 1px solid var(--cs-rule); pointer-events: none;
}

/* ─── NEXT PROJECT ──────────────────────────────────────────── */
.cs-next { border-top: 1px solid var(--cs-rule); }
.cs-next__link {
  display: block; text-decoration: none; position: relative; overflow: hidden;
  padding: clamp(3rem,7vh,5.5rem) var(--cs-gut);
  transition: background 0.4s ease;
}
.cs-next__link:hover { background: rgba(255,255,255,0.02); }
.cs-next__inner {
  max-width: var(--cs-max); margin: 0 auto;
  display: flex; align-items: baseline; justify-content: space-between; gap: 1.5rem;
}
.cs-next__label {
  font-family: var(--font-mono); font-size: 10px; font-weight: 500;
  letter-spacing: 0.14em; text-transform: uppercase; color: var(--cs-dim);
  margin: 0 0 clamp(1rem,2.5vh,1.75rem);
}
.cs-next__title {
  font-family: var(--font-display); font-weight: 700;
  font-size: clamp(2rem, 6vw, 5rem);
  line-height: 0.92; letter-spacing: -0.045em;
  color: rgba(255,255,255,0.4); margin: 0;
  transition: color 0.35s ease;
}
.cs-next__link:hover .cs-next__title { color: #fff; }
.cs-next__arrow {
  color: var(--pj-accent); flex-shrink: 0;
  opacity: 0; transform: translateX(-8px);
  transition: opacity 0.35s ease, transform 0.35s ease;
}
.cs-next__link:hover .cs-next__arrow { opacity: 1; transform: translateX(0); }
/* The closing rule of the whole page. Everything stays left: the Ask AI pill
   is fixed to the bottom-right of the viewport, so anything sitting in that
   corner at the end of the page is underneath it. */
.cs-next__foot {
  border-top: 1px solid var(--cs-rule);
  padding: clamp(1.5rem,3vh,2rem) var(--cs-gut) clamp(2rem,4vh,2.75rem);
  display: flex; align-items: center; justify-content: flex-start;
  gap: clamp(1.25rem,3vw,2.5rem); flex-wrap: wrap;
  font-family: var(--font-mono); font-size: 10px; font-weight: 500;
  letter-spacing: 0.12em; text-transform: uppercase;
}
.cs-next__prev {
  display: inline-flex; align-items: center; gap: 10px;
  min-width: 0; max-width: min(100%, 640px);
  color: var(--cs-dim); text-decoration: none; transition: color 0.2s ease;
}
.cs-next__prev:hover { color: #fff; }
.cs-next__prev svg { width: 13px; height: 13px; flex-shrink: 0; transition: transform 0.25s ease; }
.cs-next__prev:hover svg { transform: translateX(-3px); }
.cs-next__prev-label { flex-shrink: 0; }
.cs-next__prev-title {
  color: rgba(255,255,255,0.28);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  transition: color 0.2s ease;
}
.cs-next__prev:hover .cs-next__prev-title { color: rgba(255,255,255,0.6); }
.cs-next__all {
  color: var(--cs-dim); text-decoration: none;
  border-bottom: 1px solid var(--cs-rule);
  padding-bottom: 2px; flex-shrink: 0;
  transition: color 0.2s ease, border-color 0.2s ease;
}
.cs-next__all:hover { color: #fff; border-bottom-color: currentColor; }

/* ─── RESPONSIVE ────────────────────────────────────────────── */
@media (max-width: 900px) {
  .cs-chapter { grid-template-columns: 1fr; gap: clamp(1.25rem,3vh,2rem); }
  .cs-chapter__label { position: static; gap: 1rem; }
  .cs-hero__lead { margin-left: 0; max-width: 40ch; }
}

/* ─── PHONE ─────────────────────────────────────────────────
   Two things make a case study endless on a phone: full-height screenshots,
   and a meta block that reads as four separate screens. The rail fixes the
   first, the compact grid the second. */
@media (max-width: 700px) {
  .cs-hero { padding-top: clamp(6rem,13vh,8rem); }
  .cs-hero__title { font-size: clamp(2.6rem, 13vw, 4.5rem); letter-spacing: -0.04em; max-width: none; }
  .cs-hero__eyebrow { font-size: 9px; letter-spacing: 0.12em; }
  .cs-hero__frame { aspect-ratio: 4 / 3; }

  /* Meta: a tight two-column grid instead of four stacked full-width rows. */
  .cs-meta { padding-top: clamp(3.5rem,7vh,5rem); padding-bottom: 2rem; }
  .cs-meta__grid { grid-template-columns: repeat(2, minmax(0,1fr)); column-gap: 1.25rem; }
  .cs-meta__cell {
    padding: 1.1rem 0 1.25rem;
    border-right: none; border-bottom: 1px solid var(--cs-rule);
  }
  /* Client and Services carry long values; the short ones pair up. */
  .cs-meta__cell:first-child, .cs-meta__cell:last-child { grid-column: 1 / -1; }
  .cs-meta__cell:last-child { border-bottom: none; }
  .cs-meta__label { margin-bottom: 0.6rem; }
  .cs-meta__value { font-size: 1rem; }

  .cs-body { padding-top: clamp(2.5rem,5vh,3.5rem); padding-bottom: clamp(3rem,6vh,4rem); }
  .cs-chapter { padding: clamp(2.25rem,4.5vh,3rem) 0 clamp(2.5rem,5vh,3.5rem); }

  /* The chapter number and name are already spelled out by the heading right
     under them. On a phone that repetition costs a line of screen per chapter
     for nothing, so only the number stays. */
  .cs-chapter__name { display: none; }
  .cs-chapter__title { margin-bottom: 1.1rem; line-height: 1.02; }

  /* Set a little tighter than the desktop column: the measure is half as wide,
     so the same leading reads loose and stretches the page. */
  .cs-prose p { line-height: 1.58; margin-bottom: 1.15em; }
  .cs-prose li { line-height: 1.52; padding-top: 0.7rem; padding-bottom: 0.7rem; }
  .cs-prose h3 { margin-top: 1.75rem; }

  /* One swipeable rail per chapter, bleeding to both screen edges so the next
     card peeks in and the gesture is obvious without a label saying "swipe". */
  .cs-figs__rail,
  .cs-figs__rail--pair {
    display: flex;
    grid-template-columns: none;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
    gap: 10px;
    margin: 0 calc(-1 * var(--cs-gut));
    padding: 0 var(--cs-gut);
  }
  .cs-figs__rail::-webkit-scrollbar { display: none; }
  .cs-figs__rail > .cs-figure { flex: 0 0 88%; max-width: none; scroll-snap-align: center; }
  .cs-figs__rail--pair .cs-figure__frame,
  .cs-figs__rail .cs-figure__frame { aspect-ratio: 4 / 3; }
  .cs-figs__rail .cs-figure--tall .cs-figure__frame { aspect-ratio: 4 / 5; }
  .cs-figure__cap { margin-top: 0.7rem; }

  .cs-figs__dots { display: flex; gap: 6px; justify-content: center; margin-top: 1rem; }
  .cs-figs__dot {
    width: 5px; height: 5px; border-radius: 50%;
    background: rgba(255,255,255,0.2);
    transition: background 0.25s ease, transform 0.25s ease;
  }
  .cs-figs__dot--on { background: var(--pj-accent); transform: scale(1.25); }

  .cs-gallery__grid { gap: 0.9rem; }
  .cs-close__inner { align-items: flex-start; }
  .cs-close__cta { width: 100%; justify-content: space-between; }
  .cs-next__inner { flex-direction: column; align-items: flex-start; gap: 0.75rem; }
  .cs-next__prev-title { display: none; }
  /* The mobile nav pill is fixed to the bottom of the viewport, so the last
     row of the last section lands underneath it. Clear its height. */
  .cs-next__foot {
    font-size: 9px; gap: 1rem;
    padding-bottom: calc(2rem + 76px + env(safe-area-inset-bottom, 0px));
  }
}
@media (prefers-reduced-motion: reduce) {
  .cs-gallery__img, .cs-figure__img, .cs-next__title,
  .cs-next__arrow, .cs-close__cta svg, .cs-figs__dot { transition: none; }
  .cs-figs__rail { scroll-behavior: auto; }
}
`

/* ────────────────────────────────────────────────────────────── */
/*  Component                                                     */
/* ────────────────────────────────────────────────────────────── */

export default function ProjectDetail({ project, adjacent, position }: ProjectDetailProps) {
  const palette = paletteFor(project.slug)
  const images = useMemo(() => (project.images ?? []) as ImageItem[], [project.images])
  const descriptionHtml = project.descriptionHtml ?? ''

  const chapters = useMemo(() => toChapters(descriptionHtml), [descriptionHtml])

  // Anything the writing already uses stays where the writing put it. What is
  // left over gets dealt out to the chapters, and only the remainder after that
  // reaches the closing gallery.
  const { placed, leftover } = useMemo(() => {
    const loose = images.filter((img) => !descriptionHtml.includes(img.url))
    return placeFigures(chapters, loose)
  }, [chapters, images, descriptionHtml])

  return (
    <div
      className="cs"
      style={
        {
          '--pj-field': palette.field,
          '--pj-accent': palette.accent,
        } as React.CSSProperties
      }
    >
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <ReadingBar />

      {/* ── HERO ── */}
      <header className="cs-hero">
        <div className="cs-hero__inner">
          <div className="cs-hero__eyebrow">
            <Link href="/work" className="cs-hero__back">
              <ArrowLeft /> Selected work
            </Link>
            <span>
              {position ? (
                <>
                  <span className="cs-hero__count">{pad(position.index)}</span>
                  {' / '}
                  {pad(position.total)}
                </>
              ) : (
                (project.year ?? 'Selected project')
              )}
            </span>
          </div>

          <h1 className="cs-hero__title">{project.title}</h1>

          {project.tagline && <p className="cs-hero__lead">{project.tagline}</p>}
        </div>

        {project.coverUrl && (
          <div className="cs-hero__visual">
            <div className="cs-hero__frame">
              <Image
                src={project.coverUrl}
                alt={project.title}
                fill priority
                sizes="(max-width: 1400px) 100vw, 1400px"
                className="cs-hero__img"
              />
            </div>
          </div>
        )}
      </header>

      {/* ── META ── */}
      <section className="cs-meta" aria-label="Project details">
        <div className="cs-meta__grid">
          {project.client && (
            <div className="cs-meta__cell">
              <p className="cs-meta__label">Client</p>
              <p className="cs-meta__value">{project.client}</p>
            </div>
          )}
          {project.role && (
            <div className="cs-meta__cell">
              <p className="cs-meta__label">Role</p>
              <p className="cs-meta__value">{project.role}</p>
            </div>
          )}
          {project.year && (
            <div className="cs-meta__cell">
              <p className="cs-meta__label">Year</p>
              <p className="cs-meta__value">{project.year}</p>
            </div>
          )}
          {project.tags && project.tags.length > 0 && (
            <div className="cs-meta__cell">
              <p className="cs-meta__label">Services</p>
              <div className="cs-meta__tags">
                {project.tags.map((t) => (
                  <span key={t} className="cs-meta__tag">{t}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── CHAPTERS ── */}
      {chapters.length > 0 && (
        <main className="cs-body">
          {chapters.map((chapter, i) => {
            const figures = placed.get(i)

            return (
              <section className="cs-chapter" key={chapter.title ?? `intro-${i}`}>
                <div className="cs-chapter__label">
                  <span className="cs-chapter__num">{pad(i + 1)}</span>
                  {chapter.title && <span className="cs-chapter__name">{chapter.title}</span>}
                </div>

                <div className="cs-chapter__body">
                  {chapter.title && (
                    <Reveal y={26}>
                      <h2 className="cs-chapter__title">{chapter.title}</h2>
                    </Reveal>
                  )}
                  <div className="cs-prose" dangerouslySetInnerHTML={{ __html: chapter.html }} />
                </div>

                {/* Runs the full measure of the page, under the label rail as
                    well as the text, so the pictures get the whole width. */}
                {figures && (
                  <Reveal className="cs-figs-reveal">
                    <FigureGroup images={figures} fallbackAlt={project.title} />
                  </Reveal>
                )}
              </section>
            )
          })}
        </main>
      )}

      {/* ── GALLERY (whatever the chapters could not take) ── */}
      {leftover.length > 0 && (
        <section className="cs-gallery">
          <div className="cs-gallery__inner">
            <p className="cs-gallery__label">More from this project</p>
            <div className="cs-gallery__grid">
              {leftover.map((img, i) => (
                <Reveal key={img.url} delay={(i % 2) * 0.1}>
                  <figure className="cs-gallery__item">
                    <div className="cs-gallery__frame">
                      <Image
                        src={img.url}
                        alt={img.alt || project.title}
                        width={1600} height={1000}
                        sizes="(max-width:768px) 100vw, (max-width:1400px) 50vw, 680px"
                        className="cs-gallery__img"
                      />
                    </div>
                    {img.caption && (
                      <figcaption className="cs-gallery__cap">{img.caption}</figcaption>
                    )}
                  </figure>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CLOSING ── */}
      <section className="cs-close">
        <div className="cs-close__inner">
          <div>
            <p className="cs-close__label">The build</p>
            <p className="cs-close__line">Designed and built by Anurag.</p>
          </div>
          {project.externalUrl ? (
            <a
              href={project.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="cs-close__cta"
            >
              Visit {hostOf(project.externalUrl)} <ArrowUpRight />
            </a>
          ) : (
            <span className="cs-close__cta cs-close__cta--off">
              Not publicly live <ArrowUpRight />
            </span>
          )}
        </div>
      </section>

      {/* ── NEXT / PREVIOUS ──
          The page ends here: the footer stands down on a case study, because
          the next project is the way out. Both neighbours wrap, so this block
          is the same on the first case study and the last. */}
      <nav className="cs-next" aria-label="Project navigation">
        {adjacent.next && (
          <Link href={`/work/${adjacent.next.slug}`} className="cs-next__link">
            <div className="cs-next__inner">
              <div>
                <p className="cs-next__label">Next project</p>
                <p className="cs-next__title">{adjacent.next.title}</p>
              </div>
              <ArrowUpRight className="cs-next__arrow" size={28} />
            </div>
          </Link>
        )}

        <div className="cs-next__foot">
          {adjacent.prev && (
            <Link href={`/work/${adjacent.prev.slug}`} className="cs-next__prev">
              <ArrowLeft />
              <span className="cs-next__prev-label">Previous</span>
              <span className="cs-next__prev-title">{adjacent.prev.title}</span>
            </Link>
          )}
          <Link href="/work" className="cs-next__all">
            All work
          </Link>
        </div>
      </nav>
    </div>
  )
}
