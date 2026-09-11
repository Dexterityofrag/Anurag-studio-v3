/**
 * Add the Raj Associates case study.
 *
 *   npm run seed:raj
 *
 * Source material: /Users/lucifer/Freelance/raj-associates-website/docs/
 * (information architecture, build notes, gameplan, mobile audit, checklist).
 *
 * HONESTY CONSTRAINT, do not weaken without asking Anurag first.
 *
 * This is a CLIENT project and it is NOT FINISHED. Two rules follow from that.
 *
 *   It is described as ongoing, everywhere, and externalUrl stays null. The
 *   only live URL today is a deploy preview on a workers.dev subdomain while
 *   the real domain propagates, and the firm's own photographs are not in yet.
 *   Linking a preview as though it were the launched site would be a small lie
 *   that a visitor could check.
 *
 *   Nothing private is repeated. Specifically kept out, deliberately: the
 *   commercial terms and any fee figure, the named corporate clients the
 *   principal has acted for (a consent question that is the firm's to answer,
 *   not mine), personal contact details, the unresolved postcode, and the
 *   entire client-relationship narrative. A case study is about the work.
 *
 * Every claim below is from the project's own documents or the code. Where a
 * sentence carries a quote, the quote is from those documents verbatim.
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

const SRC = '/private/tmp/claude-501/-Users-lucifer-anurag-studio-v3/6ddc197e-d71e-458c-b099-12958c18ab28/scratchpad/raj-shots'
const OUT = path.join(process.cwd(), 'public', 'projects', 'raj-associates')

/** Narrative order. The practice index sits second because the page renders
 *  images[1] as the featured image, and the cause list is the one screen that
 *  shows the whole argument: a law firm's index drawn as the thing a lawyer
 *  actually reads in the morning. */
const SCREENS: Array<{ name: string; file: string; alt: string }> = [
  { name: '01-hero', file: 'desktop/01-hero.png', alt: 'The landing page: the headline "Understand where you stand, before you decide what to do" set in a high contrast serif, beside a photograph of the firm’s own chamber door' },
  { name: '02-practice-index', file: 'desktop/03-practice-index.png', alt: 'The practice areas drawn as a numbered list rather than a card grid, each with the question a client would actually arrive asking' },
  { name: '03-practice-page', file: 'desktop/04-practice-page.png', alt: 'A single practice page, Criminal Matters, opening with the client’s own words in quotation marks before any description of the law' },
  { name: '04-enquiry', file: 'desktop/05-enquiry-form.png', alt: 'The enquiry form: three fields, name, phone and matter, with the phone number and WhatsApp link offered next to it for anyone who would rather not type' },
  { name: '05-internship', file: 'desktop/07-internship.png', alt: 'The internship page, describing the two kinds of term on offer and who the firm is looking for' },
  { name: '06-feedback', file: 'desktop/06-feedback.png', alt: 'The feedback form, kept separate from the enquiry form so a complaint never arrives filed as a new matter' },
  { name: '07-mobile', file: 'mobile/m01-home.png', alt: 'The landing page on a phone, with the call and WhatsApp bar pinned inside the thumb’s reach at the bottom of the screen' },
]

/* ─── Case study copy ─────────────────────────────────────────── */

type Block =
  | { type: 'heading'; level: 2 | 3; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'bulletList'; items: string[] }

const BLOCKS: Block[] = [
  { type: 'paragraph', text: 'A website for a small litigation practice in Bengaluru, built around one reader: somebody frightened, on a mid-range Android phone, on patchy 4G, who has already been told something alarming by a search engine.' },
  { type: 'paragraph', text: 'It is in build. The firm’s own photographs are still to come and the domain is still settling, so nothing here is a launch announcement.' },

  { type: 'heading', level: 2, text: 'The Brief Was Two Briefs' },
  { type: 'paragraph', text: 'The client sent seven reference sites and they split cleanly into two camps that want opposite things. One camp is prestige and referral: serif type, a lot of whitespace, no urgency, nothing that looks like it is selling. The other is consumer lead generation: sticky call bars, forms everywhere, walls of five star reviews.' },
  { type: 'paragraph', text: 'He wanted both, which is the usual and reasonable thing for a client to want. The direction I proposed was Group B mechanics with Group A manners: keep every piece of conversion plumbing, deliver all of it in a register that never raises its voice.' },

  { type: 'heading', level: 2, text: 'A Rule Decided the Design' },
  { type: 'paragraph', text: 'Advocates in India work under Bar Council of India Rule 36, which permits factual particulars and restricts advertising and solicitation. That is not a footnote on this project, it is the thing that chose the layout.' },
  { type: 'paragraph', text: 'It rules out the entire vocabulary the lead generation references are built from: no "leading firm", no success rate, no client count, no testimonial wall, no superlative of any kind. What it does not rule out is a phone number in the thumb zone, one page per practice area, and a short form.' },
  { type: 'paragraph', text: 'Only the puffery is exposed. Keep the machinery, drop the claims. Working inside the rule produced a more restrained site than an unconstrained brief would have, and the restraint is what makes it read as a serious practice.' },

  { type: 'heading', level: 2, text: 'Designed for the Worst Moment of Someone’s Year' },
  { type: 'paragraph', text: 'The reader is anxious, often ashamed, and in a hurry. Every decision on the page answers that.' },
  { type: 'bulletList', items: [
    'One primary action per screen, never a choice between three buttons, because a frightened person given three doors takes none of them',
    'A call and WhatsApp bar pinned to the bottom of the phone screen, in the thumb’s reach, because the person who most needs this firm is the least likely to fill in a form',
    'Three fields on the enquiry form, name, phone and matter. No email address, because asking for one buys nothing and costs a submission',
    'What a first consultation involves is said before anyone has to ask, since the unasked question is almost always about money',
    'No red anywhere, no countdowns, no urgency devices. The reader arrived with all the urgency this page will ever need',
  ]},
  { type: 'paragraph', text: 'There are also no gavels, no scales and no blindfolded figures. None of them are used in Indian courts; they are a Western import that would quietly tell a local reader this site was not made for them.' },

  { type: 'heading', level: 2, text: 'The Index Is a Cause List' },
  { type: 'paragraph', text: 'The ten practice areas could have been a grid of cards with an icon each, which is what every template does. They are a numbered list instead, modelled on a court cause list, which is the document a litigator actually reads first thing in the morning.' },
  { type: 'paragraph', text: 'Each entry carries the sentence a client would arrive saying rather than the name of the statute. "I have a dispute regarding the property in another legal issue and need help protecting my rights" finds a person faster than the words Civil and Property Disputes do, because it is the sentence already in their head.' },

  { type: 'heading', level: 2, text: 'Colour Taken Off Their Own Shelves' },
  { type: 'paragraph', text: 'The palette was sampled from photographs of the firm’s own chambers rather than chosen from a picker. The slate is their cabinetry. The brick is the bare act spines on their shelves. The paper is a warm bone rather than white, and the brass appears only as hairlines, never as a fill.' },
  { type: 'paragraph', text: 'The type is Boska for display and Ranade for body, both from an Indian foundry, both variable, both self hosted and subset to Latin, which is the whole weight range in about eighty kilobytes. Ranade was picked over a colder grotesque on the grounds that the firm’s entire positioning is that you will be understood, and the body type should not contradict that. Every pairing clears WCAG AA, the tightest at 4.62 to 1.' },

  { type: 'heading', level: 2, text: 'No Build Step, on Purpose' },
  { type: 'paragraph', text: 'It is hand written HTML and CSS with no framework, no bundler and no build. That was a decision about what happens after I am gone: a handover project should leave a client able to host the site anywhere and edit it in any text editor, indefinitely, without needing me or a toolchain that will rot.' },
  { type: 'paragraph', text: 'The forms post to a Google Apps Script that appends to a Sheet the firm owns, so their enquiries are theirs and no third party sits in the middle. There are twelve of those forms rather than the two it looks like, because the enquiry form repeats on all ten practice pages, each carrying its own hidden matter value.' },
  { type: 'paragraph', text: 'That wiring taught me something I have since reused. Google Sheets reads a value beginning with an equals, plus, minus or at sign as a formula, so a phone number typed as +91 98450 11223 arrived as an error, and +919742887766 arrived silently as a number with the plus dropped, which is worse because nothing looks wrong. Both sides now mark such values as text before they are stored.' },

  { type: 'heading', level: 2, text: 'Two Bugs Worth Writing Down' },
  { type: 'paragraph', text: 'The disclaimer gate the Bar Council rules require was built with viewport units, and on an iPhone the browser chrome covered the Accept button, so the site could not be entered at all on the device most of its readers use. The client found that, not me. It uses dynamic viewport units and the safe area inset now.' },
  { type: 'paragraph', text: 'The second was worse and quieter: a single unclosed div meant all ten practice pages rendered completely blank after a reader accepted the disclaimer. Every one of them, on the deployed draft, for anybody who got that far. It is fixed, and the lesson I took is that the state after a gate needs testing as carefully as the gate.' },

  { type: 'heading', level: 2, text: 'Where It Stands' },
  { type: 'paragraph', text: 'The build is done: all twelve pages, the ten practice areas, the disclaimer gate, the forms live and tested end to end, and a mobile audit closed out. Hosting moved to Cloudflare when the original form handling stopped working there, which is what prompted the move to the firm’s own Sheet.' },
  { type: 'paragraph', text: 'What is left is not code. The firm’s photographs are still to come, so the team cards carry placeholders. The display typeface is not finally settled; four options are with the client. The domain was still propagating at the time of writing. Until those close, this is an ongoing project and is described that way.' },
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

/* ─── Raj Associates palette, sampled from the firm's own chambers ──
 * Ink is the warm near-black the site sets its type in; brass is the hairline
 * colour, and the only warm metal on the page. Both are from the project's own
 * documented palette rather than picked off a screenshot. */
const INK = '#14120F'
const BRASS = '#A8894F'

/**
 * Wide: the practice index in front, because the cause list is the argument,
 * with the landing page and a practice page tilted behind it.
 *
 * Portrait: the phone. Most of this site's readers will never see the desktop
 * layout, and the strip card is narrow enough that a 16:10 screen scaled to
 * fit it leaves the canvas mostly empty.
 */
const RECIPE: Recipe = {
  slug: 'raj-associates',
  bg: INK,
  glow: BRASS,
  wide: [
    { file: 'projects/raj-associates/01-hero.webp', scale: 0.5, dx: -0.24, dy: -0.01, rotate: -6 },
    { file: 'projects/raj-associates/03-practice-page.webp', scale: 0.5, dx: 0.24, dy: -0.01, rotate: 6 },
    { file: 'projects/raj-associates/02-practice-index.webp', scale: 0.62, dx: 0, dy: 0.02 },
  ],
  portrait: [
    { file: 'projects/raj-associates/07-mobile.webp', scale: 0.78, dx: 0, dy: 0.035 },
  ],
}

/** Sits behind the two finished personal projects and ahead of the older work. */
const ORDER = 3

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set. Add it to .env.local.')
    process.exit(1)
  }

  /* 1. Bring the screenshots across as WebP. */
  mkdirSync(OUT, { recursive: true })
  const gallery: ImageItem[] = []

  for (const s of SCREENS) {
    const src = path.join(SRC, s.file)
    if (!existsSync(src)) {
      console.error(`  missing screenshot: ${s.file}`)
      continue
    }
    await sharp(src).webp({ quality: 90 }).toFile(path.join(OUT, `${s.name}.webp`))
    gallery.push({ url: `/projects/raj-associates/${s.name}.webp`, alt: s.alt })
    console.log(`  screen  ${s.name}.webp`)
  }

  /* 2. Compose the two thumbnail masters. */
  await build([RECIPE])

  /* 3. Make room at ORDER. Adjacent-project navigation walks displayOrder with
   *    strict comparisons, so the values have to stay unique. */
  const [existing] = await db.select().from(projects).where(eq(projects.slug, 'raj-associates'))
  if (existing?.displayOrder !== ORDER) {
    await db
      .update(projects)
      .set({ displayOrder: sql`${projects.displayOrder} + 1` })
      .where(gte(projects.displayOrder, ORDER))
    console.log(`\n  shifted projects at order >= ${ORDER} down by one`)
  }

  /* 4. Upsert the project row.
   *
   *    externalUrl stays null while the domain settles and the firm's own
   *    photographs are outstanding. The closing section then reads "Not
   *    publicly live", which is the true statement about this project today. */
  const description = buildTiptapJson(BLOCKS)
  const descriptionHtml = buildHtml(BLOCKS)

  const row = {
    title: 'Raj Associates: Group B Mechanics, Group A Manners',
    slug: 'raj-associates',
    tagline: 'A website for a Bengaluru litigation practice, designed for one frightened person on a mid-range phone, inside a professional-conduct rule that forbids every claim a law firm site usually makes',
    description,
    descriptionHtml,
    coverUrl: '/projects/raj-associates/thumb-wide.webp',
    thumbnailUrl: '/projects/raj-associates/thumb-portrait.webp',
    images: gallery,
    tags: ['Web Design', 'Art Direction', 'Typography', 'Frontend', 'Accessibility', 'Client Work'],
    client: 'Raj Associates, Advocates and Legal Solicitors',
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

  const [saved] = await db.select().from(projects).where(eq(projects.slug, 'raj-associates'))
  console.log(`\n  saved: ${saved.title}`)
  console.log(`  order: ${saved.displayOrder}   year: ${saved.year}   images: ${(saved.images ?? []).length}`)
  process.exit(0)
}

main().catch((err) => {
  console.error('seed-raj-associates failed:', err)
  process.exit(1)
})
