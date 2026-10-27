/**
 * Mission Control's row only: title, tagline, role, year and tags for the
 * Oct 2026 rebuild into a working planner.
 *
 *   npm run seed:mission-control
 *
 * Deliberately not seed-projects.ts, which upserts every project and would put
 * each cover back to its original PNG. Covers and thumbnails are untouched here:
 * the row already points at thumb-wide.webp / thumb-portrait.webp, and those
 * files were redrawn in place.
 *
 * Run it after the deploy that ships public/projects/mission-control/case/live-*,
 * since the copy it pairs with (seed-descriptions.ts) points at those images.
 */
import { db } from '../lib/db'
import { projects } from '../lib/db/schema'
import { eq } from 'drizzle-orm'

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set. Add it to .env.local.')
    process.exit(1)
  }
  const res = await db
    .update(projects)
    .set({
      title: 'Mission Control: A No Code Drone Mission Planner',
      tagline: 'Wire a drone mission like an Unreal Blueprint, check it, fly it in simulation, and export it to a real autopilot',
      role: 'Product Designer and Developer (End to end)',
      year: 2026,
      tags: ['Product Design', 'Interaction Design', 'HMI Design', 'Design System', 'Front End Development', 'Simulation'],
      updatedAt: new Date(),
    })
    .where(eq(projects.slug, 'mission-control'))
    .returning({ slug: projects.slug })
  console.log(res.length ? '  mission-control metadata updated' : '  no mission-control row found')
  process.exit(0)
}

main().catch((err) => {
  console.error('seed-mission-control failed:', err)
  process.exit(1)
})
