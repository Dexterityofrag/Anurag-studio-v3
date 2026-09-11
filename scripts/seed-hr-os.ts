/**
 * Add the HR OS case study.
 *
 *   npm run seed:hr-os
 *
 * Source material: /Users/lucifer/Jumpking Main/hr-os/portfolio-handoff/
 * Screenshots were captured against that project's DEMO database, never the
 * office one, which holds a real roster with encrypted identity documents.
 *
 * HONESTY CONSTRAINT, do not weaken without asking Anurag first.
 *
 * The system is live and in daily use, but there is no measured before and
 * after figure for what the manual process cost. The copy says so rather than
 * estimating one. The only external figures are two facts read off Zoho
 * People's own pricing page on 2026-09-04, and both are attributed in the
 * sentence that carries them. No per user price is quoted, because that page
 * renders prices in JavaScript and the figure could not be read from the
 * vendor's own page.
 *
 * The client is deliberately unnamed at Anurag's instruction.
 */
import { config } from 'dotenv'
config({ path: '.env.local' })

import { mkdirSync, existsSync, readFileSync, renameSync, readdirSync, unlinkSync } from 'node:fs'
import { createHash } from 'node:crypto'
import path from 'node:path'
import sharp from 'sharp'
import { db } from '../lib/db'
import { projects, type ImageItem } from '../lib/db/schema'
import { eq, gte, sql } from 'drizzle-orm'
import { build, type Recipe } from './build-thumbnails'

/**
 * RECAPTURED 11 Sep 2026.
 *
 * The handoff set in portfolio-handoff/ was taken on 2026-09-04 at 18:20, and
 * eleven commits landed on apps/web after it. One of them, a79dbd7 on 5 Sep,
 * is "flip the visual language to Crextio, cream plane, white cards", and the
 * ones after it rebuilt the dashboard card for card, carried that language
 * across the remaining twenty-five pages, cut the navigation from seven slots
 * to five and then four, and turned every page into a grid of compact cards.
 *
 * So every image in that folder showed a dark product that no longer exists,
 * and several pointed at routes that had been folded away: /register and
 * /leave are now /attendance tabs, /payroll and /expenses are /money tabs,
 * and /admin is gone entirely because there is one roster now.
 *
 * These come from a fresh capture against the current build, same settings as
 * INDEX.md records, same DEMO database. See capture-hros.tmp.mjs.
 */
const SRC = '/private/tmp/claude-501/-Users-lucifer-anurag-studio-v3/6ddc197e-d71e-458c-b099-12958c18ab28/scratchpad/hros-shots'
const OUT = path.join(process.cwd(), 'public', 'projects', 'hr-os')

/** Narrative order. The register sits second because the page renders images[1]
 *  as the featured image below the body, and the month at a glance is still the
 *  screen that says "attendance system" fastest. */
const SCREENS: Array<{ name: string; file: string; alt: string }> = [
  { name: '01-dashboard', file: 'desktop/01-dashboard.png', alt: 'The HR OS dashboard: a greeting, the month’s payroll card, hours logged over the last weeks, and the company attendance report drawn as a grid of days' },
  { name: '02-register', file: 'desktop/04-register.png', alt: 'The month at a glance: one row per person and one glyph per day, with days worked, clean days, time deducted and days ended with no credit summarised above it' },
  { name: '03-enrolment', file: 'desktop/05-enrolment.png', alt: 'Device setup, linking a face the terminal recognises to a person on the roster, with the people already linked listed underneath' },
  { name: '04-employees', file: 'desktop/08-employees.png', alt: 'The roster as one table: department, designation, monthly gross and attendance against each person' },
  { name: '05-payroll-run', file: 'desktop/15-payroll-run.png', alt: 'A draft payroll run for August 2026 showing gross earnings, total deductions and net payable, with a payslip line for every person before the run is locked' },
  { name: '06-employee-detail', file: 'desktop/09-employee-detail.png', alt: 'One employee: an attendance score, days present, leave taken and monthly gross, above their profile and documents' },
  { name: '07-mobile-me', file: 'mobile/m02-me.png', alt: 'An employee’s own page on a phone, showing leave available, days present this month, latest net pay and the requests they can make' },
]

/* ─── Case study copy ─────────────────────────────────────────── */

type Block =
  | { type: 'heading'; level: 2 | 3; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'bulletList'; items: string[] }

const BLOCKS: Block[] = [
  { type: 'paragraph', text: 'Attendance at a fifteen person company was one person’s job in HR, done by hand, every month.' },

  { type: 'heading', level: 2, text: 'What Was Being Done by Hand' },
  { type: 'paragraph', text: 'HR tracked who came in, who was late and who took leave, and then turned all of it into pay. It worked, in the sense that people got paid. It also cost a real part of somebody’s month, and every hour of it went on writing down facts that the front door already knew.' },
  { type: 'paragraph', text: 'I have no measured figure for how long it took, so there is not one in this case study. What I can say is that it was manual from end to end, and that the mistakes it could produce were the kind that end in a conversation about somebody’s pay.' },

  { type: 'heading', level: 2, text: 'The Reason We Did Not Just Buy One' },
  { type: 'paragraph', text: 'We looked at the products that already do this. They are real, they work, and for most companies this size buying one is the right answer.' },
  { type: 'paragraph', text: 'Two things I checked on Zoho People’s own pricing page on 4 September 2026: every paid plan carries a minimum of five users, and the attendance features this actually needed, biometric integrations, attendance regularization, on duty and hourly permissions, are absent from the lower plans, with attendance management starting at Professional rather than Essential HR.' },
  { type: 'paragraph', text: 'The honest reason we did not buy is simpler than a feature table. The company had decided it wanted a terminal, and I said I could build the software around it. The engineering time was already in the building. A bought product would have been running inside a week and this took considerably longer, so what we traded was time then, for a system that matches how this company actually pays people.' },

  { type: 'heading', level: 2, text: 'The Terminal Does Not Know Who Anyone Is' },
  { type: 'paragraph', text: 'The face terminal assigns its own user numbers and they are not employee codes. Face ID 1 turned out to be employee code 5. The only field the two systems share is the name, so the bridge matches on the name.' },
  { type: 'paragraph', text: 'Matching people is the one operation here I did not let run unattended. An enrolment decides whose attendance a punch becomes, and therefore whose pay it affects. So the matcher reports by default and writes only when it is given an apply flag, and anything ambiguous is left on the enrolment screen for a person to resolve. It is slower every time somebody joins, and that is the trade I wanted.' },

  { type: 'heading', level: 2, text: 'Built for a Device That Does Not Cooperate' },
  { type: 'paragraph', text: 'Most of the engineering is defensive, because the terminal is not a well behaved peer.' },
  { type: 'bulletList', items: [
    'Punch ingestion is idempotent on a unique natural key, so the push listener and the five minute backfill can both deliver the same event, in any order, any number of times, without a day being counted twice',
    'The listener answers 200 before it does any work, because the device drops an event entirely if the reply is slow',
    'The digest client is hand written against RFC 2617, because Node’s fetch has no digest support, and it never retries a 401 more than once, because the admin account locks for around thirty minutes after roughly five failed attempts',
    'Non punch events are filtered out before user IDs are derived. A real terminal interleaves operation and alarm events carrying no employee number, and mapping over the unfiltered list took the whole backfill down. The mock never emitted those, so this only ever appeared against real hardware',
  ]},
  { type: 'paragraph', text: 'Punches are append only, and they are the evidence trail when somebody disputes their pay. The attendance day is derived from them and always recomputed, never authored. If the derivation is wrong it can be rebuilt. If the punches were editable there would be nothing left to rebuild from.' },

  { type: 'heading', level: 2, text: 'English Only, On Purpose' },
  { type: 'paragraph', text: 'The Telegram bot is the interface for people who do not sit at a computer, and its strings were English only for a long time by choice.' },
  { type: 'paragraph', text: 'An earlier machine translation rendered “Apply for leave” into Kannada using a word that is not the Kannada for leave. Hindi, Nepali and Kannada exist now, but they are marked unverified until a speaker signs them off, English stays the default, and a person sees another language only after choosing it. Fewer languages, deliberately, because a wrong word on the button that takes your leave is worse than an English one.' },
  { type: 'paragraph', text: 'The whole system runs on one machine inside the office, so the bot uses long polling rather than webhooks. There is no public URL to point a webhook at.' },

  { type: 'heading', level: 2, text: 'It Used to Be Dark, and That Was Wrong' },
  { type: 'paragraph', text: 'The first version was a dark interface with a bright green accent. It looked like the kind of software I enjoy looking at, and it was the wrong answer for this building.' },
  { type: 'paragraph', text: 'This is a system somebody reads under office lighting, next to paper, for an hour at a time, to decide what fifteen people get paid. So it was rebuilt onto a warm cream plane with white cards and a single gold accent, and every page became a grid of compact cards rather than a stack of full-width bands. The same pass cut the navigation from seven slots to four, because seven was a menu I had designed for the feature list rather than for the four things anyone actually does here.' },
  { type: 'paragraph', text: 'The screenshots on this page are from after that rebuild. Throwing away a finished interface is expensive and I would rather show the one that is in front of people.' },

  { type: 'heading', level: 2, text: 'Where It Stands' },
  { type: 'paragraph', text: 'It is live. Staff scan their faces at the door, HR runs the month on it, and payslips are generated from the hours the terminal recorded rather than from anything anyone typed. That was the whole point: the door already knows, so nobody should have to write it down twice.' },
  { type: 'paragraph', text: 'The screenshots here come from the demo database rather than the live one, which holds a real roster with encrypted identity documents. Every screen carries a sample data badge, because the product says so itself.' },
  { type: 'paragraph', text: 'What is still rough is the language work. Hindi, Nepali and Kannada remain unverified, so English is what almost everyone still sees.' },
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

/* ─── HR OS palette, from apps/web/app/globals.css in that repo ──
 *
 * These are the Crextio tokens the product wears since 5 Sep 2026. The old
 * pair, #161617 surface and #03c37b clean green, described the dark theme the
 * app had before that and is gone.
 *
 * The product's own plane is #f5f2ec, a warm cream, but the case study hero
 * composites the screens onto a dark field so the /work card and the share
 * image read against the rest of this site. --color-night is the product's own
 * near-black and is the honest choice for that, with the gold accent that the
 * redesign made the signal colour. */
const SURFACE = '#1c1c1e'   // --color-night
const CLEAN = '#f5c518'     // --color-accent, the gold the redesign signals with

/**
 * The case study hero shows this master in a framed 16:9 plate at full
 * brightness, not as a darkened backdrop, so the screens are composited as
 * captured. An earlier version brightened them for a hero that darkened its
 * background, which this layout does not do.
 */
/**
 * Wide: the register in front, because it is the screen that says "attendance
 * system" fastest, with the dashboard and roster tilted behind it so the card
 * reads as a product rather than one cropped screenshot.
 *
 * Portrait: the phone alone. The strip card is narrow, a 16:10 desktop screen
 * scaled to fit its width leaves the canvas mostly empty, and most of the staff
 * on this system only ever see it on a phone.
 */
const recipeFor = (v: string): Recipe => ({
  slug: 'hr-os',
  bg: SURFACE,
  glow: CLEAN,
  wide: [
    { file: `projects/hr-os/01-dashboard.${v}.webp`, scale: 0.5, dx: -0.24, dy: -0.01, rotate: -6 },
    { file: `projects/hr-os/04-employees.${v}.webp`, scale: 0.5, dx: 0.24, dy: -0.01, rotate: 6 },
    { file: `projects/hr-os/02-register.${v}.webp`, scale: 0.62, dx: 0, dy: 0.02 },
  ],
  portrait: [
    { file: `projects/hr-os/07-mobile-me.${v}.webp`, scale: 0.78, dx: 0, dy: 0.035 },
  ],
})

/**
 * Every asset filename carries a hash of the screenshots it was built from.
 *
 * The recapture overwrote `01-dashboard.webp` and friends in place, so anybody
 * who had already loaded the page kept being served the old dark screens from
 * their browser cache at the same URL, and got a confusing half-and-half set.
 * Next's image optimiser caches by URL too, so it made its own stale copies.
 *
 * Content in the name means a changed screenshot is a changed URL, and no
 * cache anywhere can serve the previous one. The cost is that stale files
 * accumulate, so the seed sweeps the directory before it writes.
 */
function stampOf(files: string[]) {
  const h = createHash('sha1')
  for (const f of files) h.update(readFileSync(f))
  return h.digest('hex').slice(0, 8)
}

const ORDER = 1

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set. Add it to .env.local.')
    process.exit(1)
  }

  /* 1. Bring the screenshots across as WebP, under a content-stamped name. */
  mkdirSync(OUT, { recursive: true })

  const sources = SCREENS.map((s) => path.join(SRC, s.file))
  const missing = sources.filter((s) => !existsSync(s))
  if (missing.length) {
    console.error('  missing screenshots:\n   ', missing.join('\n    '))
    process.exit(1)
  }
  const V = stampOf(sources)
  console.log(`  asset stamp: ${V}\n`)

  /* Sweep anything from a previous stamp, so the directory never grows a
   * museum of old captures that nothing references. */
  for (const f of readdirSync(OUT)) {
    if (f.endsWith('.webp') && !f.includes(`.${V}.`)) {
      unlinkSync(path.join(OUT, f))
      console.log(`  swept   ${f}`)
    }
  }

  const gallery: ImageItem[] = []
  for (const s of SCREENS) {
    const src = path.join(SRC, s.file)
    await sharp(src).webp({ quality: 90 }).toFile(path.join(OUT, `${s.name}.${V}.webp`))
    gallery.push({ url: `/projects/hr-os/${s.name}.${V}.webp`, alt: s.alt })
    console.log(`  screen  ${s.name}.${V}.webp`)
  }

  /* 2. Compose the two thumbnail masters, then stamp those too. build() writes
   *    fixed names, so they are renamed rather than the compositor changed. */
  await build([recipeFor(V)])
  for (const kind of ['thumb-wide', 'thumb-portrait']) {
    renameSync(path.join(OUT, `${kind}.webp`), path.join(OUT, `${kind}.${V}.webp`))
  }

  /* 3. Make room at ORDER. Adjacent-project navigation walks displayOrder with
   *    strict comparisons, so the values have to stay unique. Skip the shift if
   *    hr-os already sits there, otherwise a re-run pushes everything again. */
  const [existing] = await db.select().from(projects).where(eq(projects.slug, 'hr-os'))
  if (existing?.displayOrder !== ORDER) {
    await db
      .update(projects)
      .set({ displayOrder: sql`${projects.displayOrder} + 1` })
      .where(gte(projects.displayOrder, ORDER))
    console.log(`\n  shifted projects at order >= ${ORDER} down by one`)
  }

  /* 4. Upsert the project row. */
  const description = buildTiptapJson(BLOCKS)
  const descriptionHtml = buildHtml(BLOCKS)

  const row = {
    title: 'HR OS: The Door Already Knows',
    slug: 'hr-os',
    tagline: 'Attendance, leave, approvals and payroll for a fifteen person company, driven by a face terminal on the office LAN',
    description,
    descriptionHtml,
    coverUrl: `/projects/hr-os/thumb-wide.${V}.webp`,
    thumbnailUrl: `/projects/hr-os/thumb-portrait.${V}.webp`,
    images: gallery,
    tags: ['Product Design', 'Internal Tools', 'Systems Design', 'Design Systems', 'Frontend', 'Accessibility'],
    client: 'Undisclosed',
    role: 'Product Designer and Developer',
    year: 2026,
    isFeatured: true,
    isPublished: true,
    displayOrder: ORDER,
    updatedAt: new Date(),
  }

  await db
    .insert(projects)
    .values(row)
    .onConflictDoUpdate({ target: projects.slug, set: row })

  const [saved] = await db.select().from(projects).where(eq(projects.slug, 'hr-os'))
  console.log(`\n  saved: ${saved.title}`)
  console.log(`  order: ${saved.displayOrder}   year: ${saved.year}   images: ${(saved.images ?? []).length}`)
  process.exit(0)
}

main().catch((err) => {
  console.error('seed-hr-os failed:', err)
  process.exit(1)
})
