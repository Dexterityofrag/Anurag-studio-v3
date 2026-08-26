/**
 * Per-project thumbnail recipes.
 *
 *   npm run thumbs
 *
 * Each project gets its OWN field colour and glow, sampled from or matched to
 * that project's real interface, and its own composition. These are not one
 * template with the colour swapped:
 *
 *   Lineup          phone screens, ember on obsidian        (seeded separately)
 *   Evolusis        light product UI, deep teal field
 *   Mission Control dark tactical HMI, slate and signal cyan
 *   AWR             warm spirit-brand dark, amber
 *   CloudQA         light SaaS pricing UI, deep navy
 *   Orange+         campus portal, burnt orange
 *
 * Landscape sources (1440x900, 3840x2160, 1920x1080) are inset with margin so
 * the card reads as a composed frame rather than a raw screen grab. The portrait
 * master stacks two screens, since one 16:9 screen alone leaves a 4:5 canvas empty.
 */
import { config } from 'dotenv'
config({ path: '.env.local' })

import { db } from '../lib/db'
import { projects } from '../lib/db/schema'
import { eq } from 'drizzle-orm'
import { build, type Recipe } from './build-thumbnails'

const P = 'projects'

const RECIPES: Recipe[] = [
  /* ── Evolusis: light teal product UI on a deep teal field ──── */
  {
    slug: 'evolusis-landing-page',
    bg: '#0A2327',
    glow: '#5EC8C8',
    wide: [
      { file: `${P}/evolusis/landing-scroll.png`, scale: 0.38, dx: 0.10, dy: -0.03, rotate: 3 },
      { file: `${P}/evolusis/landing-hero.png`, scale: 0.50, dx: -0.05, dy: 0.02 },
    ],
    portrait: [
      { file: `${P}/evolusis/landing-scroll.png`, scale: 0.30, dx: 0.03, dy: 0.16, rotate: 3 },
      { file: `${P}/evolusis/landing-hero.png`, scale: 0.34, dx: -0.02, dy: -0.10 },
    ],
  },
  {
    slug: 'evo-dashboard-evo-by-evolusis',
    bg: '#0A2327',
    glow: '#4FB6C4',
    wide: [
      { file: `${P}/evolusis/dashboard-replica.png`, scale: 0.38, dx: 0.11, dy: -0.04, rotate: 3 },
      { file: `${P}/evolusis/dashboard-live.png`, scale: 0.50, dx: -0.05, dy: 0.02 },
    ],
    portrait: [
      { file: `${P}/evolusis/dashboard-replica.png`, scale: 0.30, dx: 0.03, dy: 0.16, rotate: 3 },
      { file: `${P}/evolusis/dashboard-live.png`, scale: 0.34, dx: -0.02, dy: -0.10 },
    ],
  },
  {
    slug: 'evo-chat-ai-coaching-chatbot',
    bg: '#0B2129',
    glow: '#57C2B4',
    wide: [
      { file: `${P}/evolusis/chat-consent.png`, scale: 0.38, dx: 0.11, dy: -0.04, rotate: 3 },
      { file: `${P}/evolusis/chat-replica.png`, scale: 0.50, dx: -0.05, dy: 0.02 },
    ],
    portrait: [
      { file: `${P}/evolusis/chat-consent.png`, scale: 0.30, dx: 0.03, dy: 0.16, rotate: 3 },
      { file: `${P}/evolusis/chat-replica.png`, scale: 0.34, dx: -0.02, dy: -0.10 },
    ],
  },

  /* ── Mission Control: operator HMI, slate + signal cyan ────── */
  {
    slug: 'mission-control',
    bg: '#0B1418',
    glow: '#3E9BC4',
    wide: [
      { file: `${P}/mission-control/ONjh7VsHgILILEYDKonQBH7JNk.png`, scale: 0.37, dx: 0.12, dy: -0.05, rotate: 3 },
      { file: `${P}/mission-control/hdYWk78rDMrafA7S7eVoWOcKgHs.png`, scale: 0.50, dx: -0.05, dy: 0.02 },
    ],
    portrait: [
      { file: `${P}/mission-control/ONjh7VsHgILILEYDKonQBH7JNk.png`, scale: 0.30, dx: 0.03, dy: 0.16, rotate: 3 },
      { file: `${P}/mission-control/hdYWk78rDMrafA7S7eVoWOcKgHs.png`, scale: 0.34, dx: -0.02, dy: -0.10 },
    ],
  },

  /* ── AWR: single-brand whiskey, warm dark + amber ──────────── */
  {
    slug: 'awr',
    bg: '#150E08',
    glow: '#C8862A',
    wide: [
      { file: `${P}/awr/BAmbDD2w2ChS0D9wn9V5wD8RTLE.jpg`, scale: 0.37, dx: 0.12, dy: -0.05, rotate: 3 },
      { file: `${P}/awr/oJwIrsqUDgpBTpEUbCLkLvIUk.jpg`, scale: 0.50, dx: -0.05, dy: 0.02 },
    ],
    portrait: [
      { file: `${P}/awr/BAmbDD2w2ChS0D9wn9V5wD8RTLE.jpg`, scale: 0.30, dx: 0.03, dy: 0.16, rotate: 3 },
      { file: `${P}/awr/oJwIrsqUDgpBTpEUbCLkLvIUk.jpg`, scale: 0.34, dx: -0.02, dy: -0.10 },
    ],
  },

  /* ── CloudQA: light SaaS pricing UI on deep navy ───────────── */
  {
    slug: 'cloudqa',
    bg: '#0C1822',
    glow: '#3B82F6',
    wide: [
      { file: `${P}/cloudqa/ehAiohEx9OBe2JhTfA68msZt9o.png`, scale: 0.37, dx: 0.12, dy: -0.05, rotate: 3 },
      { file: `${P}/cloudqa/1hZb6qngyXXOWLMRvkUFoSbEar0.png`, scale: 0.44, dx: -0.05, dy: 0.03 },
    ],
    portrait: [
      { file: `${P}/cloudqa/ehAiohEx9OBe2JhTfA68msZt9o.png`, scale: 0.30, dx: 0.03, dy: 0.16, rotate: 3 },
      { file: `${P}/cloudqa/1hZb6qngyXXOWLMRvkUFoSbEar0.png`, scale: 0.26, dx: -0.02, dy: -0.10 },
    ],
  },

  /* ── Orange+: campus portal, burnt orange ──────────────────── */
  {
    slug: 'orange',
    bg: '#180E06',
    glow: '#F97316',
    wide: [
      { file: `${P}/orange/bgMZor6QuJV3Y7gZXZr12MhVZo.png`, scale: 0.37, dx: 0.12, dy: -0.05, rotate: 3 },
      { file: `${P}/orange/5XOIhTm28b1XsGO6dLNVcEqD4rk.png`, scale: 0.38, dx: -0.05, dy: 0.02 },
    ],
    portrait: [
      { file: `${P}/orange/bgMZor6QuJV3Y7gZXZr12MhVZo.png`, scale: 0.28, dx: 0.03, dy: 0.16, rotate: 3 },
      { file: `${P}/orange/5XOIhTm28b1XsGO6dLNVcEqD4rk.png`, scale: 0.34, dx: -0.02, dy: -0.10 },
    ],
  },
]

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set.')
    process.exit(1)
  }

  await build(RECIPES)

  for (const r of RECIPES) {
    await db
      .update(projects)
      .set({
        coverUrl: `/projects/${r.slug}/thumb-wide.webp`,
        thumbnailUrl: `/projects/${r.slug}/thumb-portrait.webp`,
        updatedAt: new Date(),
      })
      .where(eq(projects.slug, r.slug))
  }
  console.log(`\n  pointed ${RECIPES.length} projects at their new masters`)
  process.exit(0)
}

main().catch((err) => {
  console.error('build-recipes failed:', err)
  process.exit(1)
})
