/**
 * One-off script to seed project rows into the database.
 * This populates the projects table so that seed-descriptions.ts has rows to update.
 * Run with: npm run seed:projects or npx tsx scripts/seed-projects.ts
 */

import { config } from 'dotenv'

// Load .env.local from the project root
config({ path: `${process.cwd()}/.env.local` })

import { db } from '../lib/db'
import { projects } from '../lib/db/schema'

/* ─── Verify database URL ──────────────────────────────────────── */

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL is not set in .env.local')
  process.exit(1)
}

/* ─── Project seed data ────────────────────────────────────────── */

type ProjectSeed = {
  slug: string
  title: string
  tagline: string
  role: string | null
  year: number | null
  tags: string[]
  client: string | null
  coverUrl: string | null
  thumbnailUrl: string | null
  displayOrder: number
}

const projectSeeds: ProjectSeed[] = [
  {
    slug: 'evolusis-landing-page',
    title: 'Evolusis — Landing Page',
    tagline: 'Marketing site for a B2B AI coaching platform — shipped live, frontend contributed',
    role: 'Product Design Consultant + Frontend',
    year: 2025,
    tags: ['UI Design', 'Landing Page', 'B2B SaaS', 'Frontend Collaboration'],
    client: 'Evolusis',
    coverUrl: '/projects/evolusis/landing-hero.png',
    thumbnailUrl: '/projects/evolusis/landing-hero.png',
    displayOrder: 1,
  },
  {
    slug: 'evo-dashboard-evo-by-evolusis',
    title: 'Evo Dashboard — Evo by Evolusis',
    tagline: 'The control centre of the Evolusis suite — bento dashboard for AI-led workforce development',
    role: 'Product Design Consultant',
    year: 2025,
    tags: ['Dashboard Design', 'UX Design', 'Design Systems', 'B2B SaaS'],
    client: 'Evolusis',
    coverUrl: '/projects/evolusis/03-dashboard.png',
    thumbnailUrl: '/projects/evolusis/03-dashboard.png',
    displayOrder: 2,
  },
  {
    slug: 'evo-chat-ai-coaching-chatbot',
    title: 'Evo Chat — AI Coaching Chatbot',
    tagline: 'Conversational AI interface for workplace development — not a GPT wrapper, a coaching tool',
    role: 'Product Design Consultant',
    year: 2025,
    tags: ['Conversational UI', 'UX Design', 'AI Products', 'Product Design'],
    client: 'Evolusis',
    coverUrl: '/projects/evolusis/05-evo-chat.png',
    thumbnailUrl: '/projects/evolusis/05-evo-chat.png',
    displayOrder: 3,
  },
  // Evo Coach was retired as a standalone case study; its voice work is now
  // covered inside the Evo Chat write-up, which is where the consent and
  // permission design actually belongs.
  {
    slug: 'mission-control',
    title: 'Mission Control: Operator-First Drone (No-Code) HMI',
    tagline: 'Operator-First Autonomous Drone Logic Editor — No-Code HMI for high-stakes mission orchestration',
    role: 'HMI and UI/UX Designer (End-to-end)',
    year: 2025,
    tags: ['HMI Design', 'UI/UX Design', 'Interaction Design', 'Information Architecture', 'Design System', 'High-Fidelity Prototyping'],
    client: null,
    coverUrl: '/projects/mission-control/Bg1OTmRCa4HBnnu0CMG91vRZ2VY.png',
    thumbnailUrl: '/projects/mission-control/Bg1OTmRCa4HBnnu0CMG91vRZ2VY.png',
    displayOrder: 4,
  },
  {
    slug: 'awr',
    title: 'Anurag Whiskey Reserve: A Liquor Brand App',
    tagline: 'A single-brand whiskey experience built for the loyal, discerning buyer',
    role: 'Product Designer',
    year: 2025,
    tags: ['Product Design', 'UI Design', 'UX Design'],
    client: null,
    coverUrl: '/projects/awr/BAmbDD2w2ChS0D9wn9V5wD8RTLE.jpg',
    thumbnailUrl: '/projects/awr/BAmbDD2w2ChS0D9wn9V5wD8RTLE.jpg',
    displayOrder: 5,
  },
  {
    slug: 'cloudqa',
    title: 'CloudQA: Pricing Page Redesign',
    tagline: 'Turning a static comparison sheet into a narrative of value and confidence',
    role: 'UI/UX Designer',
    year: 2024,
    tags: ['UI/UX Design', 'UX Research'],
    client: null,
    coverUrl: '/projects/cloudqa/1hZb6qngyXXOWLMRvkUFoSbEar0.png',
    thumbnailUrl: '/projects/cloudqa/1hZb6qngyXXOWLMRvkUFoSbEar0.png',
    displayOrder: 6,
  },
  {
    slug: 'orange',
    title: 'Orange+: A Unified Student Portal Experience',
    tagline: 'A digital companion that feels less like an app, more like an extension of campus',
    role: 'Product Designer',
    year: 2024,
    tags: ['Product Design'],
    client: null,
    coverUrl: '/projects/orange/5XOIhTm28b1XsGO6dLNVcEqD4rk.png',
    thumbnailUrl: '/projects/orange/5XOIhTm28b1XsGO6dLNVcEqD4rk.png',
    displayOrder: 7,
  },
]

/* ─── Run upserts ──────────────────────────────────────────────── */

async function main() {
  let created = 0
  let updated = 0

  for (const seed of projectSeeds) {
    const result = await db
      .insert(projects)
      .values({
        title: seed.title,
        slug: seed.slug,
        tagline: seed.tagline,
        role: seed.role,
        year: seed.year,
        tags: seed.tags,
        client: seed.client,
        coverUrl: seed.coverUrl,
        thumbnailUrl: seed.thumbnailUrl,
        isPublished: true,
        displayOrder: seed.displayOrder,
      })
      .onConflictDoUpdate({
        target: projects.slug,
        set: {
          title: seed.title,
          tagline: seed.tagline,
          role: seed.role,
          year: seed.year,
          tags: seed.tags,
          client: seed.client,
          coverUrl: seed.coverUrl,
          thumbnailUrl: seed.thumbnailUrl,
          isPublished: true,
          displayOrder: seed.displayOrder,
          updatedAt: new Date(),
        },
      })

    console.log(`✓ ${seed.title} (${seed.slug})`)
  }

  console.log(`\nDone! Seeded ${projectSeeds.length} projects.`)
  process.exit(0)
}

main().catch((err) => {
  console.error('Script failed:', err)
  process.exit(1)
})
