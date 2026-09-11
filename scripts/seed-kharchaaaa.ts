/**
 * Add the Kharchaaaa case study.
 *
 *   npm run seed:kharchaaaa
 *
 * Source material: ~/kharchaaaa (CONTEXT.md, brand/BRAND.md, app/README.md)
 * and the app itself, captured at 390x844 deviceScaleFactor 3.
 *
 * HONESTY CONSTRAINT, do not weaken without asking Anurag first.
 *
 * Two things this case study must keep saying, because both are true and both
 * are the kind of thing a portfolio quietly drops:
 *
 *   The two halves do not share data yet. The app and the bot are built to be
 *   joined without a migration, and that is a real design achievement, but
 *   they are not joined today. The copy says "built to be joined", never
 *   "joined".
 *
 *   The bot is not deployed. It runs on a Mac and stops when the lid closes.
 *   Bill reading is inert until an OCR key is added. Neither is hidden here.
 *
 * The numbers in the screenshots are invented, and the body says so. They are
 * one plausible month for one person, not anyone's real spending. Every amount
 * is integer paise, because that is the rule the whole product rests on, and a
 * screenshot that broke it would be a screenshot of a different product.
 */
import { config } from 'dotenv'
config({ path: '.env.local' })

import { mkdirSync, existsSync } from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import { db } from '../lib/db'
import { projects, type ImageItem } from '../lib/db/schema'
import { eq, gte, sql } from 'drizzle-orm'
import { build, type Recipe } from './build-thumbnails'

const SRC = '/private/tmp/claude-501/-Users-lucifer-anurag-studio-v3/6ddc197e-d71e-458c-b099-12958c18ab28/scratchpad/kharchaaaa-shots/mobile'
const OUT = path.join(process.cwd(), 'public', 'projects', 'kharchaaaa')

/** Narrative order. The composer sits second because the page renders
 *  images[1] as the featured image below the body, and that one screen
 *  explains the product faster than any sentence here does. */
const SCREENS: Array<{ name: string; alt: string }> = [
  { name: '01-today', alt: 'The Today screen: a ring showing 34,113 rupees spent of a 45,000 rupee ceiling, with checkpoint ticks, and safe pace against actual pace underneath' },
  { name: '05-composer', alt: 'Three lines typed into the composer, each resolved to a category before being committed: uber to Transport, zepto to Quick commerce, swiggy to Food delivery' },
  { name: '02-log', alt: 'The Log, grouped by day, one row per spend with its category and the time it was recorded' },
  { name: '03-shape', alt: 'The Shape screen breaking the month down by category, rent taking 53 per cent of it' },
  { name: '06-checkpoint', alt: 'A checkpoint firing full screen: 60 per cent of September gone, with what is left and the daily rate that would keep it' },
  { name: '04-setup', alt: 'Setup, showing the ceiling for the active group, a second group for a trip, and the checkpoint count' },
]

/* ─── Case study copy ─────────────────────────────────────────── */

type Block =
  | { type: 'heading'; level: 2 | 3; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'bulletList'; items: string[] }

const BLOCKS: Block[] = [
  { type: 'paragraph', text: 'An expense tracker where the whole interface is a line of text. You type uber 105, and it works out that Uber is transport, files it, counts it against the month, and tells you what that leaves.' },

  { type: 'heading', level: 2, text: 'Why Another One of These' },
  { type: 'paragraph', text: 'Every expense app I tried wanted the same thing from me: a category picked from a dropdown, an amount typed into a numeric field, a date confirmed. Four taps to record a ninety rupee chai. The friction is small and it is fatal, because the entry you do not make is the one that breaks the month.' },
  { type: 'paragraph', text: 'So the target was one gesture. Open it, type what happened, done. Everything else in the product exists to make that line of text enough.' },

  { type: 'heading', level: 2, text: 'The Line of Text Does a Lot' },
  { type: 'paragraph', text: 'Text before the number is the merchant, text after it is a note, and either order works. Amounts arrive in whatever shape a person actually writes them: 105, ₹495, Rs 2,499.50, 1,05,000, 2k, 1.5L, 499/-. One spend per line, so three lines commit three spends.' },
  { type: 'paragraph', text: 'A preview chip appears for every line before anything is committed, which is the part that matters. You always see what it worked out before you agree to it, so the guessing never happens behind your back.' },
  { type: 'paragraph', text: 'It also learns. Picking a category for a merchant writes that pairing down, so the same shop files itself forever after. And when it cannot place something it still saves the amount and flags the entry as pending rather than dropping it, because a spend you have lost is worse than one that is filed wrong.' },

  { type: 'heading', level: 2, text: 'The Composer Is a Textarea, and That Was a Bug First' },
  { type: 'paragraph', text: 'It shipped as an input. An input silently strips newlines, so three typed lines merged into one entry and two spends vanished. One spend per line is the entire premise, and the element I had chosen made it impossible.' },
  { type: 'paragraph', text: 'It is a textarea now, Enter sends and Shift+Enter starts another line. The interesting part is not the fix, it is that the reset had covered button and input but not textarea, so the new element took the browser default and typed black on black until that was found too.' },

  { type: 'heading', level: 2, text: 'Two Front Ends, One Idea' },
  { type: 'paragraph', text: 'There is a phone app you add to your home screen, and there is a Telegram bot. The bot does the same job in chat, and it can read a bank SMS or a photographed bill. They exist because the moment you spend money and the moment you are willing to open an app are rarely the same moment.' },
  { type: 'paragraph', text: 'They are not connected yet. That is the honest state of it. What they do share is a data model held identical on both sides so they can be joined later without anybody migrating anything:' },
  { type: 'bulletList', items: [
    'Amounts are integer paise on both sides, never floats and never rupees, so ₹105 is 10500 and there is no floating point drift anywhere in either half',
    'The twenty category slugs are character for character identical between the bot’s Python and the app’s JavaScript, and changing one means changing both in the same commit',
    'The parser is ported line for line: same regex shapes, same suffix multipliers, same merchant-then-amount rules, same backdating',
    'Checkpoint maths is the same formula on both sides, so a month looks the same whichever half you recorded it in',
  ]},
  { type: 'paragraph', text: 'Joining them later should mean putting one shared store behind both, not rewriting either side. Every change gets measured against whether it keeps that true.' },

  { type: 'heading', level: 2, text: 'The Line the Design Rests On' },
  { type: 'paragraph', text: 'Who you are is on the server. What you spend is not.' },
  { type: 'paragraph', text: 'The account list is the only thing that ever leaves a phone, and it holds an email, a role and a password hash. Spends stay in that browser’s own storage and no code path uploads one. This is what makes it possible to hand somebody a login without taking custody of what they buy, and it is the constraint I would refuse to trade away for a sync feature.' },
  { type: 'paragraph', text: 'It costs something real, and the cost is not hidden in the product either: a book does not follow you to a new phone. An account does. Somebody switching devices starts empty and should export a backup first. Moving that data to a server would be a deliberate decision about custody, not a bug to patch quietly.' },
  { type: 'paragraph', text: 'The passkey is described the same way. It does not prove who you are to anything, it re-opens a session this device already has, which is Face ID instead of retyping. Verifying WebAuthn properly means a server holding public keys and checking signatures, which is more than this app has earned, so the copy says exactly what the button does rather than borrowing the word credential.' },

  { type: 'heading', level: 2, text: 'It Reports, It Does Not Cheer' },
  { type: 'paragraph', text: 'The voice is plain and lowercase. Over by ₹2,784. you are overspending. Never a cheerful apology with an emoji, and never a streak, because nobody wants to be congratulated for spending less than they did last week.' },
  { type: 'paragraph', text: 'Colour follows the same rule. The accent is a signal, not decoration: if everything is green then nothing is. The ring turns amber at eighty per cent and red past a hundred, and those are the only two moments the interface raises its voice.' },
  { type: 'paragraph', text: 'The one place it is deliberately theatrical is switching between groups, which is a channel change and reads like one: a stepped jolt, the numbers splitting red and cyan, a bright band over scanlines. It stands down completely under prefers-reduced-motion.' },

  { type: 'heading', level: 2, text: 'What It Costs to Run' },
  { type: 'paragraph', text: 'Nothing, and that was a constraint rather than an outcome. The app has no framework, no bundler and no dependencies, which is why it deploys by copying a folder. The bot is Python standard library only, against SQLite. There is one server-side function in the whole product and it answers a single question, which is who is allowed to sign in.' },

  { type: 'heading', level: 2, text: 'Where It Stands' },
  { type: 'paragraph', text: 'The app is live and is what I record my own spending in. It installs to an iPhone home screen, opens full screen, and works with no signal, because signing in needs the network once and nothing after that does.' },
  { type: 'paragraph', text: 'What is not done is worth saying plainly. The bot is written and tested but not deployed, so it runs on a laptop and stops when the lid closes. Bill reading is built against three interchangeable backends and is inert until one of them has a key. And the two halves still do not share a store, which is the next real piece of work rather than a detail.' },
  { type: 'paragraph', text: 'The figures in these screenshots are invented. They are one plausible month for one person, not anybody’s actual spending, which is the only kind of screenshot a product like this should ever be shown with.' },
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

/* ─── Kharchaaaa palette, from brand/BRAND.md in that repo ────── */
const FIELD = '#060606'   // the ground everything sits on
const SIGNAL = '#00FF94'  // the accent, used sparingly, on purpose

/**
 * Every screen here is a phone, so both masters are built from phones rather
 * than one desktop capture scaled down.
 *
 * Wide: the composer in front, because it is the screen that explains the
 * product, with Today and Shape tilted behind so the card reads as a product
 * rather than one cropped screenshot.
 *
 * Portrait: the dial alone. It is the mark of the product drawn in the product.
 */
const RECIPE: Recipe = {
  slug: 'kharchaaaa',
  bg: FIELD,
  glow: SIGNAL,
  wide: [
    { file: 'projects/kharchaaaa/01-today.webp', scale: 0.62, dx: -0.25, dy: 0.0, rotate: -7 },
    { file: 'projects/kharchaaaa/03-shape.webp', scale: 0.62, dx: 0.25, dy: 0.0, rotate: 7 },
    { file: 'projects/kharchaaaa/05-composer.webp', scale: 0.78, dx: 0, dy: 0.02 },
  ],
  portrait: [
    { file: 'projects/kharchaaaa/01-today.webp', scale: 0.78, dx: 0, dy: 0.035 },
  ],
}

const ORDER = 1

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set. Add it to .env.local.')
    process.exit(1)
  }

  /* 1. Bring the screenshots across as WebP. */
  mkdirSync(OUT, { recursive: true })
  const gallery: ImageItem[] = []

  for (const s of SCREENS) {
    const src = path.join(SRC, `${s.name}.png`)
    if (!existsSync(src)) {
      console.error(`  missing screenshot: ${s.name}.png`)
      continue
    }
    await sharp(src).webp({ quality: 90 }).toFile(path.join(OUT, `${s.name}.webp`))
    gallery.push({ url: `/projects/kharchaaaa/${s.name}.webp`, alt: s.alt })
    console.log(`  screen  ${s.name}.webp`)
  }

  /* 2. Compose the two thumbnail masters. */
  await build([RECIPE])

  /* 3. Make room at ORDER. Adjacent-project navigation walks displayOrder with
   *    strict comparisons, so the values have to stay unique. Skip the shift if
   *    kharchaaaa already sits there, otherwise a re-run pushes everything on. */
  const [existing] = await db.select().from(projects).where(eq(projects.slug, 'kharchaaaa'))
  if (existing?.displayOrder !== ORDER) {
    await db
      .update(projects)
      .set({ displayOrder: sql`${projects.displayOrder} + 1` })
      .where(gte(projects.displayOrder, ORDER))
    console.log(`\n  shifted projects at order >= ${ORDER} down by one`)
  }

  /* 4. Upsert the project row.
   *
   *    externalUrl is deliberately null. The app is live, but it is invite
   *    only: the account list is server side and seeded, so a visitor who
   *    followed a link would reach a lock screen they cannot get past. The
   *    closing call to action is overridden to the waitlist instead, in
   *    lib/project-cta.ts. */
  const description = buildTiptapJson(BLOCKS)
  const descriptionHtml = buildHtml(BLOCKS)

  const row = {
    title: 'Kharchaaaa: Type It and It Is Filed',
    slug: 'kharchaaaa',
    tagline: 'An expense book for India whose whole interface is a line of text, with a phone app and a Telegram bot built to be joined without a migration',
    description,
    descriptionHtml,
    coverUrl: '/projects/kharchaaaa/thumb-wide.webp',
    thumbnailUrl: '/projects/kharchaaaa/thumb-portrait.webp',
    images: gallery,
    tags: ['Product Design', 'Personal Finance', 'PWA', 'Design Systems', 'Frontend', 'Interaction Design'],
    client: 'Self-initiated',
    role: 'Designer and Developer',
    year: 2026,
    externalUrl: null,
    isFeatured: true,
    isPublished: true,
    displayOrder: ORDER,
    updatedAt: new Date(),
  }

  await db
    .insert(projects)
    .values(row)
    .onConflictDoUpdate({ target: projects.slug, set: row })

  const [saved] = await db.select().from(projects).where(eq(projects.slug, 'kharchaaaa'))
  console.log(`\n  saved: ${saved.title}`)
  console.log(`  order: ${saved.displayOrder}   year: ${saved.year}   images: ${(saved.images ?? []).length}`)
  process.exit(0)
}

main().catch((err) => {
  console.error('seed-kharchaaaa failed:', err)
  process.exit(1)
})
