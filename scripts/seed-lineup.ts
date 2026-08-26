/**
 * Add the Lineup case study.
 *
 *   npm run seed:lineup
 *
 * Source material: /Users/lucifer/Documents/JURY 26/ (Pearl Academy Jury 26).
 *
 * HONESTY CONSTRAINT — do not weaken this without asking Anurag first.
 * Lineup is a working prototype at concept stage. There is no revenue, no
 * pilot, no deployment and no users. The pitch deck contains revenue
 * projections (Rs 1.8 Cr by 2027, Rs 12 Cr by 2028) and market sizing; those
 * are MODELLING, not results, and must never be written as achievements here.
 * Every research figure below is attributed to its source in the copy itself.
 */
import { config } from 'dotenv'
config({ path: '.env.local' })

import { mkdirSync, existsSync } from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import { db } from '../lib/db'
import { projects, type ImageItem } from '../lib/db/schema'
import { eq } from 'drizzle-orm'
import { build, type Recipe } from './build-thumbnails'

const JURY = '/Users/lucifer/Documents/JURY 26/Speculative/VQ System'
const SHOTS = path.join(JURY, 'AppScreenshots')
const OUT = path.join(process.cwd(), 'public', 'projects', 'lineup')

/* Screens worth showing, in narrative order. */
const SCREENS: Array<{ src: string; name: string; alt: string }> = [
  { src: 'FireShot Capture 022 - 07 Your token - [].png', name: 'token.webp', alt: 'Lineup token screen showing a queue position and live ETA' },
  { src: 'FireShot Capture 023 - 08 Live queue - [].png', name: 'live-queue.webp', alt: 'Lineup live queue screen counting down to the slot' },
  { src: 'FireShot Capture 019 - 04 Home - [].png', name: 'home.webp', alt: 'Lineup home screen listing civic use cases' },
  { src: 'FireShot Capture 024 - 09 Arrival - [].png', name: 'arrival.webp', alt: 'Lineup arrival screen with the on-screen check-in QR code' },
  { src: 'FireShot Capture 020 - 05 Centers near - [].png', name: 'centers.webp', alt: 'Lineup nearby centres screen' },
]

/* ─── Case study copy ─────────────────────────────────────────── */

type Block =
  | { type: 'heading'; level: 2 | 3; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'bulletList'; items: string[] }

const BLOCKS: Block[] = [
  { type: 'paragraph', text: 'I built Lineup because I watched my grandmother spend three hours in an AIIMS queue, then go home without seeing a doctor.' },

  { type: 'heading', level: 2, text: 'The Queue Is the Interface' },
  { type: 'paragraph', text: 'In India, the queue is where citizens meet the state. It is also where the experience collapses. A physical token ties you to a spot on a floor for hours, and the people it punishes hardest are the ones least able to stand there: the elderly, the unwell, the people who took a day of unpaid leave to be there at all.' },
  { type: 'paragraph', text: 'Lineup replaces the paper token with a digital one, so the queue holds your place while you do not have to.' },

  { type: 'heading', level: 2, text: 'What the Research Said' },
  { type: 'paragraph', text: 'I scoped the problem across five civic verticals before designing anything. The numbers below come from published sources, not from my own measurement.' },
  { type: 'bulletList', items: [
    'Election Commission of India data puts the country at roughly 1.07 million polling booths, with queue fatigue a recognised contributor to voter drop-off',
    'AIIMS outpatient departments report waits of four to six hours, with a meaningful share of patients leaving before being seen',
    'Tirupati handles between 60,000 and 100,000 visitors on a busy day, which turns crowd management into a safety problem rather than a comfort one',
    'RTOs, ration shops and passport centres routinely run multi-hour waits with no digital queuing at all',
  ]},

  { type: 'heading', level: 2, text: 'One App, Seven Counters' },
  { type: 'paragraph', text: 'Rather than build a queue app for a single sector, I designed one system that adapts to seven: voting booths, hospital OPDs, government offices, temple darshan, bank counters, railway reservation and blood banks.' },
  { type: 'paragraph', text: 'The interaction is the same everywhere, which is the point. You join with a six-digit code or a QR scan, you get a token, and you leave. Learn it once at a bank and you already know how to use it at a hospital.' },

  { type: 'heading', level: 2, text: 'Designing for a Phone in a Pocket' },
  { type: 'paragraph', text: 'The hardest constraint was that the user is not looking at the screen. They are having lunch, or sitting in shade across the road, or minding a child. A notification competing with dozens of others is the wrong instrument.' },
  { type: 'paragraph', text: 'So the primary output is haptic. Two short pulses fifteen minutes before your slot. Two long pulses when it is time to walk. The phone stays in the pocket and still does its job, which also means the system works for users who cannot easily read a screen.' },
  { type: 'bulletList', items: [
    'A live ETA that says "arrive in 22 minutes" rather than showing an abstract queue position',
    'Leaving the premises without losing your place, which is the entire promise',
    'An on-screen QR at the counter, so no physical token is ever printed or handed over',
  ]},

  { type: 'heading', level: 2, text: 'The System' },
  { type: 'paragraph', text: 'Lineup runs on a small, deliberate design system: Instrument Serif for display, Geist for interface, Geist Mono for token codes so a six-digit code is never misread. A single ember accent carries every state change against a cream or obsidian field, and a 23-icon set covers all seven verticals in one visual language.' },
  { type: 'paragraph', text: 'I built it as a progressive web app in React and Vite, wrapped with Capacitor for Android, so a centre can adopt it without buying hardware. Eleven screens, installable from the browser.' },

  { type: 'heading', level: 2, text: 'Where It Stands' },
  { type: 'paragraph', text: 'Lineup is a working prototype, not a deployed product. It was designed and built as my Jury 26 submission at Pearl Academy, and the full flow runs end to end, but it has not been piloted at a live counter and has no users yet.' },
  { type: 'paragraph', text: 'I modelled the commercial side too, because a civic tool that cannot fund itself does not get adopted: a software-only install with no hardware cost, priced per centre, per cycle. Those figures are projections used to test whether the idea could stand up, not results.' },
  { type: 'paragraph', text: 'The next honest step is a single pilot, one district counter or one hospital OPD, to find out what the prototype gets wrong.' },
]

function buildTiptapJson(blocks: Block[]) {
  const content: any[] = []
  for (const block of blocks) {
    if (block.type === 'heading') {
      content.push({ type: 'heading', attrs: { level: block.level }, content: [{ type: 'text', text: block.text }] })
    } else if (block.type === 'paragraph') {
      content.push({ type: 'paragraph', content: [{ type: 'text', text: block.text }] })
    } else if (block.type === 'bulletList') {
      content.push({
        type: 'bulletList',
        content: block.items.map((item) => ({
          type: 'listItem',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: item }] }],
        })),
      })
    }
  }
  return { type: 'doc', content }
}

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function buildHtml(blocks: Block[]) {
  let html = ''
  for (const block of blocks) {
    if (block.type === 'heading') html += `<h${block.level}>${escapeHtml(block.text)}</h${block.level}>`
    else if (block.type === 'paragraph') html += `<p>${escapeHtml(block.text)}</p>`
    else if (block.type === 'bulletList') {
      html += '<ul>'
      for (const item of block.items) html += `<li><p>${escapeHtml(item)}</p></li>`
      html += '</ul>'
    }
  }
  return html
}

/* ─── Lineup's own palette, from src/lineup/tokens.tsx ────────── */
const OBSIDIAN = '#0B0B0B'
const EMBER = '#E84A1F'

const RECIPE: Recipe = {
  slug: 'lineup',
  bg: OBSIDIAN,
  glow: EMBER,
  // Wide: three screens, the token screen leading, so the card reads as a
  // multi-screen product rather than a single cropped screenshot.
  wide: [
    { file: 'projects/lineup/home.webp', scale: 0.54, dx: -0.205, dy: 0.015, rotate: -7 },
    { file: 'projects/lineup/live-queue.webp', scale: 0.54, dx: 0.205, dy: 0.015, rotate: 7 },
    { file: 'projects/lineup/token.webp', scale: 0.66, dx: 0, dy: 0 },
  ],
  // Portrait: one hero screen, larger, because the strip card is narrow.
  portrait: [
    { file: 'projects/lineup/token.webp', scale: 0.58, dx: 0, dy: 0 },
  ],
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set. Add it to .env.local.')
    process.exit(1)
  }

  /* 1. Bring the screenshots across as WebP. */
  mkdirSync(OUT, { recursive: true })
  const gallery: ImageItem[] = []

  for (const s of SCREENS) {
    const src = path.join(SHOTS, s.src)
    if (!existsSync(src)) {
      console.error(`  missing screenshot: ${s.src}`)
      continue
    }
    await sharp(src).webp({ quality: 90 }).toFile(path.join(OUT, s.name))
    gallery.push({ url: `/projects/lineup/${s.name}`, alt: s.alt })
    console.log(`  screen  ${s.name}`)
  }

  /* 2. Wordmark, kept for the case study. */
  const mark = path.join(JURY, 'qvote-app', 'lineup-wordmark-transparent-cream.png')
  if (existsSync(mark)) {
    await sharp(mark).resize({ width: 1200 }).webp({ quality: 92 }).toFile(path.join(OUT, 'wordmark.webp'))
    console.log('  wordmark.webp')
  }

  /* 3. Compose the two thumbnail masters. */
  await build([RECIPE])

  /* 4. Upsert the project row. */
  const description = buildTiptapJson(BLOCKS)
  const descriptionHtml = buildHtml(BLOCKS)

  const row = {
    title: 'Lineup: Ending the Physical Queue',
    slug: 'lineup',
    tagline: 'A haptic-first virtual queue for India’s civic counters — seven use cases, one token, no hardware',
    description,
    descriptionHtml,
    coverUrl: '/projects/lineup/thumb-wide.webp',
    thumbnailUrl: '/projects/lineup/thumb-portrait.webp',
    images: gallery,
    tags: ['Product Design', 'UX Research', 'Design Systems', 'Mobile Design', 'Civic Tech', 'Accessibility'],
    client: null,
    role: 'Product Designer, UX Researcher and Frontend Developer (solo)',
    year: 2026,
    isFeatured: true,
    isPublished: true,
    displayOrder: 0,
    updatedAt: new Date(),
  }

  await db
    .insert(projects)
    .values(row)
    .onConflictDoUpdate({ target: projects.slug, set: row })

  const [saved] = await db.select().from(projects).where(eq(projects.slug, 'lineup'))
  console.log(`\n  saved: ${saved.title}`)
  console.log(`  order: ${saved.displayOrder}   year: ${saved.year}   images: ${(saved.images ?? []).length}`)
  process.exit(0)
}

main().catch((err) => {
  console.error('seed-lineup failed:', err)
  process.exit(1)
})
