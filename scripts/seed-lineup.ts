/**
 * Bring Lineup's source material into the repo and create its project row.
 *
 *   npm run seed:lineup
 *
 * Source material: /Users/lucifer/Documents/JURY 26/ (Pearl Academy Jury 26).
 * The paths below are local to Anurag's machine, which is why the screenshots
 * are committed once and this script is not part of the build.
 *
 * This script owns Lineup's ASSETS and METADATA only. The case study copy and
 * the gallery live in scripts/seed-descriptions.ts alongside every other
 * project, so there is one place to edit writing. Run this first on a fresh
 * database, then `npm run images:case` and `npm run seed:descriptions`.
 *
 * HONESTY CONSTRAINT — do not weaken this without asking Anurag first.
 * Lineup is a working prototype at concept stage. There is no revenue, no
 * pilot, no deployment and no users. The pitch deck contains revenue
 * projections (Rs 1.8 Cr by 2027, Rs 12 Cr by 2028) and market sizing; those
 * are MODELLING, not results, and must never be written as achievements. The
 * copy in seed-descriptions.ts carries the same constraint.
 */
import { config } from 'dotenv'
config({ path: '.env.local' })

import { mkdirSync, existsSync } from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import { db } from '../lib/db'
import { projects } from '../lib/db/schema'
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
    { file: 'projects/lineup/home.webp', scale: 0.43, dx: -0.215, dy: 0.015, rotate: -7 },
    { file: 'projects/lineup/live-queue.webp', scale: 0.43, dx: 0.215, dy: 0.015, rotate: 7 },
    { file: 'projects/lineup/token.webp', scale: 0.52, dx: 0, dy: 0 },
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

  /* 1. Bring the screenshots across as WebP. These are the raw sources;
        build-case-images.ts composes them into the figures the case study
        actually renders. */
  mkdirSync(OUT, { recursive: true })

  for (const s of SCREENS) {
    const src = path.join(SHOTS, s.src)
    if (!existsSync(src)) {
      console.error(`  missing screenshot: ${s.src}`)
      continue
    }
    await sharp(src).webp({ quality: 90 }).toFile(path.join(OUT, s.name))
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

  /* 4. Upsert the project row. Copy and gallery are deliberately absent:
        seed-descriptions.ts writes those, for every project, in one place. On a
        fresh database this row lands without a body until that script runs. */
  const row = {
    title: 'Lineup: Ending the Physical Queue',
    slug: 'lineup',
    tagline: 'A haptic-first virtual queue for India’s civic counters — seven use cases, one token, no hardware',
    coverUrl: '/projects/lineup/thumb-wide.webp',
    thumbnailUrl: '/projects/lineup/thumb-portrait.webp',
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
  console.log(`  order: ${saved.displayOrder}   year: ${saved.year}`)
  console.log('\n  next: npm run images:case && npm run seed:descriptions')
  process.exit(0)
}

main().catch((err) => {
  console.error('seed-lineup failed:', err)
  process.exit(1)
})
