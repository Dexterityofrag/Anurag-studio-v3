/**
 * Build the in-body figures for the case studies.
 *
 *   npm run images:case
 *
 * The case study body is stored as Tiptap HTML and rendered with
 * dangerouslySetInnerHTML, which means the images inside it are plain <img>
 * tags. Next's image optimiser never sees them. So the source material — deck
 * slides at 3840x2160, product photography at 5120x3328 — has to be brought
 * down to web weight HERE, at build time, or every case study ships megabytes
 * of PNG straight to the reader.
 *
 * Output lands in public/projects/<slug>/case/ and is committed, so the site
 * does not depend on anyone re-running this. Re-run it when source art changes.
 *
 * Two kinds of figure:
 *
 *   plain   Resize and re-encode. For deck slides and desktop screenshots that
 *           are already composed 16:9 artwork and only need to lose weight.
 *
 *   phones  Compose tall phone screenshots onto a tinted 16:9 field, reusing
 *           the exact geometry of the thumbnail compositor. A 759x1648 screen
 *           dropped raw into a text column is a column of pixels nobody reads;
 *           two or three of them on the project's own palette is a figure.
 */
import { mkdirSync } from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import { compose, type Shot } from './build-thumbnails'

const PUBLIC = path.join(process.cwd(), 'public')

/** 16:9 at a width that still looks sharp on a 2x laptop display. */
const FIGURE = { w: 2000, h: 1125, centre: 0.5 }

/** Widest a `plain` figure is allowed to be. Slides above this are downscaled. */
const PLAIN_MAX_W = 2000

const QUALITY = 84

type Figure =
  | { kind: 'plain'; name: string; src: string }
  | { kind: 'phones'; name: string; bg: string; glow: string; shots: Shot[] }

type ProjectFigures = { slug: string; figures: Figure[] }

/* ─── What each case study shows, in the order the copy calls for it ── */

const P = 'projects'

const WORK: ProjectFigures[] = [
  /* ── Lineup: clean phone screenshots, so these get composed ──────── */
  {
    slug: 'lineup',
    figures: [
      {
        kind: 'phones',
        name: 'joining',
        bg: '#0B0B0B',
        glow: '#E84A1F',
        // A 4:5-ish screen at 0.86 of canvas height leaves ~80px of margin and
        // reads as cropped. 0.78 for the lead screen and 0.72 for the tilted
        // one behind it keeps both fully inside the frame with air around them.
        shots: [
          { file: `${P}/lineup/centers.webp`, scale: 0.72, dx: 0.15, dy: 0, rotate: 5 },
          { file: `${P}/lineup/home.webp`, scale: 0.78, dx: -0.13, dy: 0 },
        ],
      },
      {
        kind: 'phones',
        name: 'holding',
        bg: '#0B0B0B',
        glow: '#E84A1F',
        shots: [
          { file: `${P}/lineup/live-queue.webp`, scale: 0.72, dx: 0.15, dy: 0, rotate: 5 },
          { file: `${P}/lineup/token.webp`, scale: 0.78, dx: -0.13, dy: 0 },
        ],
      },
      {
        kind: 'phones',
        name: 'arrival',
        bg: '#0B0B0B',
        glow: '#E84A1F',
        shots: [{ file: `${P}/lineup/arrival.webp`, scale: 0.80, dx: 0, dy: 0 }],
      },
    ],
  },

  /* ── Evolusis: 1440x900 product screenshots, already the right shape ─ */
  {
    slug: 'evolusis-landing-page',
    figures: [
      { kind: 'plain', name: 'hero', src: `${P}/evolusis/landing-hero.png` },
      { kind: 'plain', name: 'scroll', src: `${P}/evolusis/landing-scroll.png` },
    ],
  },
  {
    slug: 'evo-dashboard-evo-by-evolusis',
    figures: [
      { kind: 'plain', name: 'dashboard-dark', src: `${P}/evolusis/dashboard-live.png` },
      { kind: 'plain', name: 'dashboard-light', src: `${P}/evolusis/dashboard-replica.png` },
    ],
  },
  {
    slug: 'evo-chat-ai-coaching-chatbot',
    figures: [
      { kind: 'plain', name: 'chat-open', src: `${P}/evolusis/chat-replica.png` },
      { kind: 'plain', name: 'consent', src: `${P}/evolusis/chat-consent.png` },
      { kind: 'plain', name: 'voice-check', src: `${P}/evolusis/coach-live.png` },
    ],
  },

  /* ── Mission Control: case study deck slides at 3840x2160 ─────────── */
  {
    slug: 'mission-control',
    figures: [
      { kind: 'plain', name: 'cover', src: `${P}/mission-control/nCOjxVwI9Vh3ThEJfaJyEApSA.png` },
      { kind: 'plain', name: 'cognitive-gap', src: `${P}/mission-control/YLSPRzXZYiB1Jw8DrT1hCB6jbLg.png` },
      { kind: 'plain', name: 'unified-hmi', src: `${P}/mission-control/hdYWk78rDMrafA7S7eVoWOcKgHs.png` },
      { kind: 'plain', name: 'safety-logic', src: `${P}/mission-control/ONjh7VsHgILILEYDKonQBH7JNk.png` },
      { kind: 'plain', name: 'glass-box', src: `${P}/mission-control/23whaDSKZNjtRgfD17Vu7ZUwL90.png` },
      { kind: 'plain', name: 'on-desk', src: `${P}/mission-control/h3fjBbKW8fB894qyaBw16K0DQM.jpeg` },
    ],
  },

  /* ── AWR: brand deck slides ───────────────────────────────────────── */
  {
    slug: 'awr',
    figures: [
      { kind: 'plain', name: 'brand', src: `${P}/awr/BAmbDD2w2ChS0D9wn9V5wD8RTLE.jpg` },
      { kind: 'plain', name: 'persona', src: `${P}/awr/g9pezMkeskBSL6OhgxkvS994.jpg` },
      { kind: 'plain', name: 'problems-solutions', src: `${P}/awr/lypDvimZjAuqFFN8jGA4QhaaVLM.jpg` },
      { kind: 'plain', name: 'flow', src: `${P}/awr/Odq4lQv7Cgna228HcU8jen6lgA.jpg` },
      { kind: 'plain', name: 'screens', src: `${P}/awr/oJwIrsqUDgpBTpEUbCLkLvIUk.jpg` },
      { kind: 'plain', name: 'cheers', src: `${P}/awr/zYqKa5zaVkEyMdT1tpWwQ1fPK6s.jpg` },
    ],
  },

  /* ── CloudQA ──────────────────────────────────────────────────────── */
  {
    slug: 'cloudqa',
    figures: [
      { kind: 'plain', name: 'before', src: `${P}/cloudqa/1hZb6qngyXXOWLMRvkUFoSbEar0.png` },
      { kind: 'plain', name: 'after', src: `${P}/cloudqa/ehAiohEx9OBe2JhTfA68msZt9o.png` },
      { kind: 'plain', name: 'in-context', src: `${P}/cloudqa/FlccEdhDEp8v1C5VQFa1BVA9BM.jpg` },
      { kind: 'plain', name: 'on-desk', src: `${P}/cloudqa/IIWnaTpSna8FfkFPIJY4IXLPAHo.jpeg` },
    ],
  },

  /* ── Orange+ ──────────────────────────────────────────────────────── */
  {
    slug: 'orange',
    figures: [
      { kind: 'plain', name: 'home', src: `${P}/orange/bgMZor6QuJV3Y7gZXZr12MhVZo.png` },
      { kind: 'plain', name: 'in-hand', src: `${P}/orange/5XOIhTm28b1XsGO6dLNVcEqD4rk.png` },
      { kind: 'plain', name: 'on-homescreen', src: `${P}/orange/m0bpIvA19BXNBbPOMBQDvdaDCG0.png` },
      { kind: 'plain', name: 'on-desk', src: `${P}/orange/xyNey9d5MRLSuxnRc6lhL3Wf0po.png` },
    ],
  },
]

/* ─── Build ───────────────────────────────────────────────────────── */

async function buildFigure(slug: string, fig: Figure): Promise<Buffer> {
  if (fig.kind === 'plain') {
    return sharp(path.join(PUBLIC, fig.src))
      // Bakes in EXIF orientation. Without it a photo stored sideways with a
      // rotation flag encodes sideways — the About page portrait bug again.
      .rotate()
      .resize({ width: PLAIN_MAX_W, withoutEnlargement: true })
      .webp({ quality: QUALITY })
      .toBuffer()
  }
  return compose(FIGURE, { bg: fig.bg, glow: fig.glow }, fig.shots)
}

async function main() {
  let count = 0
  let bytes = 0

  for (const project of WORK) {
    const dir = path.join(PUBLIC, 'projects', project.slug, 'case')
    mkdirSync(dir, { recursive: true })
    console.log(`\n  ${project.slug}`)

    for (const fig of project.figures) {
      const buf = await buildFigure(project.slug, fig)
      await sharp(buf).toFile(path.join(dir, `${fig.name}.webp`))
      const meta = await sharp(buf).metadata()
      console.log(
        `    ${fig.name.padEnd(20)} ${String(meta.width).padStart(4)}x${String(meta.height).padEnd(4)}  ${Math.round(buf.length / 1024)}KB`,
      )
      count++
      bytes += buf.length
    }
  }

  console.log(`\n  ${count} figures, ${Math.round(bytes / 1024)}KB total`)
}

main().catch((err) => {
  console.error('build-case-images failed:', err)
  process.exit(1)
})
