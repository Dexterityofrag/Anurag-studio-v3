/**
 * The case study copy for every project, and the figures woven through it.
 *
 *   npm run seed:descriptions
 *
 * This file is the single source of truth for what a case study says. Lineup's
 * copy used to live in seed-lineup.ts; that script now only imports Lineup's
 * screenshots and builds its row, and defers to this one for the writing.
 *
 * ── How the figures work ──────────────────────────────────────────────
 * Images referenced here point at public/projects/<slug>/case/, which is built
 * by `npm run images:case`. Run that first if the sources have changed.
 *
 * A `figure` block emits a Tiptap image node plus a caption paragraph. The
 * caption is <p class="pd-figcap"><em>…</em></p>: Tiptap's schema has no class
 * on paragraphs, so the class is lost the first time a case study is opened and
 * saved in the admin editor, but the <em> is a real mark and survives. Styled
 * caption with the class, plain italic line without it.
 *
 * Anything listed in IMAGES but never used as a figure falls through to the
 * gallery under the write-up. ProjectDetail works that out by matching URLs
 * against the rendered HTML, so moving an image between the body and the
 * gallery means moving it in this file and nowhere else.
 *
 * ── On claims ─────────────────────────────────────────────────────────
 * Same constraint the Lineup copy carries: describe what was designed and why,
 * never invent an outcome. No conversion lifts, no adoption numbers, no "became
 * the primary acquisition channel" unless someone can point at the dashboard it
 * came from. Where a project is a concept or a prototype, the copy says so.
 */

import { config } from 'dotenv'
config({ path: `${process.cwd()}/.env.local` })

import path from 'node:path'
import sharp from 'sharp'
import { db } from '../lib/db'
import { projects, type ImageItem } from '../lib/db/schema'
import { eq } from 'drizzle-orm'

/* ─── Blocks ──────────────────────────────────────────────────── */

type Block =
  | { type: 'heading'; level: 2 | 3; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'bulletList'; items: string[] }
  | { type: 'figure'; src: string; alt: string; caption: string }

function buildTiptapJson(blocks: Block[]) {
  const content: any[] = []

  for (const block of blocks) {
    if (block.type === 'heading') {
      content.push({
        type: 'heading',
        attrs: { level: block.level },
        content: [{ type: 'text', text: block.text }],
      })
    } else if (block.type === 'paragraph') {
      content.push({
        type: 'paragraph',
        content: [{ type: 'text', text: block.text }],
      })
    } else if (block.type === 'bulletList') {
      content.push({
        type: 'bulletList',
        content: block.items.map((item) => ({
          type: 'listItem',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: item }] }],
        })),
      })
    } else if (block.type === 'figure') {
      content.push({
        type: 'image',
        attrs: { src: block.src, alt: block.alt, title: block.caption },
      })
      content.push({
        type: 'paragraph',
        content: [{ type: 'text', marks: [{ type: 'italic' }], text: block.caption }],
      })
    }
  }

  return { type: 'doc', content }
}

function esc(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

type Dims = Map<string, { w: number; h: number }>

/**
 * Measure every figure once, at seed time.
 *
 * These images render as raw <img> inside dangerouslySetInnerHTML, so Next's
 * image component never sees them and never reserves their space. Without
 * width and height on the tag the whole case study reflows as each figure
 * arrives. Baking the real dimensions into the stored HTML is the only place
 * this can be fixed, because by render time the markup is already a string.
 */
async function measure(blocks: Block[], dims: Dims) {
  for (const block of blocks) {
    if (block.type !== 'figure' || dims.has(block.src)) continue
    const meta = await sharp(path.join(process.cwd(), 'public', block.src)).metadata()
    if (!meta.width || !meta.height) throw new Error(`could not measure ${block.src}`)
    dims.set(block.src, { w: meta.width, h: meta.height })
  }
}

function buildHtml(blocks: Block[], dims: Dims) {
  let html = ''
  for (const block of blocks) {
    if (block.type === 'heading') {
      html += `<h${block.level}>${esc(block.text)}</h${block.level}>`
    } else if (block.type === 'paragraph') {
      html += `<p>${esc(block.text)}</p>`
    } else if (block.type === 'bulletList') {
      html += '<ul>'
      for (const item of block.items) html += `<li><p>${esc(item)}</p></li>`
      html += '</ul>'
    } else if (block.type === 'figure') {
      const d = dims.get(block.src)
      const size = d ? ` width="${d.w}" height="${d.h}"` : ''
      html += `<img src="${esc(block.src)}" alt="${esc(block.alt)}" title="${esc(block.caption)}"${size} loading="lazy" decoding="async">`
      html += `<p class="pd-figcap"><em>${esc(block.caption)}</em></p>`
    }
  }
  return html
}

/** Shorthand so a figure reads as one line in the copy below. */
const fig = (slug: string, name: string, alt: string, caption: string): Block => ({
  type: 'figure',
  src: `/projects/${slug}/case/${name}.webp`,
  alt,
  caption,
})

/* ─── Case studies ────────────────────────────────────────────── */

const DESCRIPTIONS: Record<string, Block[]> = {
  /* ══ Lineup ══════════════════════════════════════════════════ */
  /* HONESTY CONSTRAINT — do not weaken without asking Anurag first.
     Lineup is a working prototype at concept stage. No revenue, no pilot, no
     deployment, no users. The pitch deck's revenue projections are MODELLING
     and must never be written as achievements. Research figures stay attributed
     to their sources in the copy itself. */
  lineup: [
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

    fig('lineup', 'joining', 'Lineup home screen beside the nearby centres screen, showing live wait times for four locations',
      'Joining. The home screen leads with the token you already hold; the centres list ranks by live wait, not by distance.'),

    { type: 'heading', level: 2, text: 'Designing for a Phone in a Pocket' },
    { type: 'paragraph', text: 'The hardest constraint was that the user is not looking at the screen. They are having lunch, or sitting in shade across the road, or minding a child. A notification competing with dozens of others is the wrong instrument.' },
    { type: 'paragraph', text: 'So the primary output is haptic. Two short pulses fifteen minutes before your slot. Two long pulses when it is time to walk. The phone stays in the pocket and still does its job, which also means the system works for users who cannot easily read a screen.' },
    { type: 'bulletList', items: [
      'A live ETA that says "arrive in 22 minutes" rather than showing an abstract queue position',
      'Leaving the premises without losing your place, which is the entire promise',
      'An on-screen QR at the counter, so no physical token is ever printed or handed over',
    ]},

    fig('lineup', 'holding', 'Lineup token screen showing token A-47 with a walk time, beside the live queue screen showing position and updates',
      'Holding your place. The token screen answers "when do I walk"; the queue view exists for the minority who want to watch it move.'),

    { type: 'heading', level: 2, text: 'The System' },
    { type: 'paragraph', text: 'Lineup runs on a small, deliberate design system: Instrument Serif for display, Geist for interface, Geist Mono for token codes so a six-digit code is never misread. A single ember accent carries every state change against a cream or obsidian field, and a 23-icon set covers all seven verticals in one visual language.' },
    { type: 'paragraph', text: 'I built it as a progressive web app in React and Vite, wrapped with Capacitor for Android, so a centre can adopt it without buying hardware. Eleven screens, installable from the browser.' },

    fig('lineup', 'arrival', 'Lineup arrival screen reading "You are up, walk in", with a QR token and the time saved',
      'Arrival. The one screen a staff member ever sees, and the only place the app claims credit: time saved, stated plainly.'),

    { type: 'heading', level: 2, text: 'Where It Stands' },
    { type: 'paragraph', text: 'Lineup is a working prototype, not a deployed product. It was designed and built as my Jury 26 submission at Pearl Academy, and the full flow runs end to end, but it has not been piloted at a live counter and has no users yet.' },
    { type: 'paragraph', text: 'I modelled the commercial side too, because a civic tool that cannot fund itself does not get adopted: a software-only install with no hardware cost, priced per centre, per cycle. Those figures are projections used to test whether the idea could stand up, not results.' },
    { type: 'paragraph', text: 'The next honest step is a single pilot, one district counter or one hospital OPD, to find out what the prototype gets wrong.' },
  ],

  /* ══ Evolusis landing page ═══════════════════════════════════ */
  'evolusis-landing-page': [
    { type: 'paragraph', text: 'Evolusis sells AI coaching to companies. Not the kind that books a workshop and disappears, but a system employees actually talk to when a hard conversation is coming. My job was the page that has to explain all of that before anyone scrolls.' },

    { type: 'heading', level: 2, text: 'Two Sceptics, One Page' },
    { type: 'paragraph', text: 'A page like this is read by two people who distrust it for opposite reasons. The buyer has seen enough products with AI in the name to assume this one is a wrapper. The employee who will actually use it assumes it was bought to score them.' },
    { type: 'paragraph', text: 'Ignoring either of them is how these pages fail. So the page takes a position in the headline instead of hedging: AI and humans, building resilient workforces together. It is a claim about who is in charge, made before the product is even named.' },

    fig('evolusis-landing-page', 'hero', 'The Evolusis landing page hero, with the headline beside a live coaching conversation panel',
      'The hero as it ships. The panel on the right is a real coaching exchange, not an abstract product illustration.'),

    { type: 'heading', level: 2, text: 'Show the Conversation' },
    { type: 'paragraph', text: 'The panel beside the headline was the argument I cared most about winning. The default for a B2B AI site is a glowing orb, an unreadable dashboard, or a stock photo of people pointing at a laptop. None of them say what the thing does.' },
    { type: 'paragraph', text: 'An actual coaching exchange does. Someone types that a colleague keeps taking credit for their work, and the response does not solve it for them, it asks a better question. A visitor reads that in about three seconds and understands the product, the tone and the boundary all at once.' },
    { type: 'paragraph', text: 'Everything else on the page is sequenced behind that: what it does, who it is for, what it costs you to try, and the proof strip that makes those claims survivable.' },

    fig('evolusis-landing-page', 'scroll', 'The Evolusis landing page scrolled, showing the compacted navigation and a Dashboard action',
      'Scrolled. The nav compacts and the primary action switches to Dashboard for anyone already signed in, so returning users are not sold to twice.'),

    { type: 'heading', level: 2, text: 'The Small Things That Took Longest' },
    { type: 'paragraph', text: 'The trust signals. The customer logos, the line about professionals already growing with Evo, the ticker of outcomes along the bottom edge. Each one is a few words and each one was argued over, because on a page whose job is a demo booking, those are the difference between a click and a closed tab.' },
    { type: 'paragraph', text: 'The rule I held to: every number on the page has to be one the company can defend in a sales call. A landing page that overstates gets found out in the first meeting, and then the whole page is a liability.' },

    { type: 'heading', level: 2, text: 'What I Did' },
    { type: 'bulletList', items: [
      'Designed the full page: hero, product sections, proof, and the path to a demo booking',
      'Contributed to the frontend build in Next.js, so it shipped as designed rather than as interpreted',
      'Set the type scale, spacing and colour that the Evolusis product suite then inherited, which is why the dashboard and chat products read as the same company',
      'Built the responsive behaviour properly, including the scrolled and signed-in states most marketing sites forget',
    ]},

    { type: 'heading', level: 2, text: 'Where It Stands' },
    { type: 'paragraph', text: 'The page is live and is the public front door to the platform. I worked on it as a design consultant with a frontend contribution, alongside the Evolusis team, rather than as sole owner of the product.' },
  ],

  /* ══ Evo Dashboard ═══════════════════════════════════════════ */
  'evo-dashboard-evo-by-evolusis': [
    { type: 'paragraph', text: 'A landing page has to win three seconds. A dashboard has to survive three months.' },

    { type: 'heading', level: 2, text: 'The Room You Come Back To' },
    { type: 'paragraph', text: 'This is the screen an Evolusis user opens on a Tuesday morning. Their company bought the product, somebody sent a link, and now there is a piece of software asking for a slice of a day that is already full.' },
    { type: 'paragraph', text: 'The whole thing lives or dies on one question: does it give me something worth doing in the next five minutes, or is it another tab I close?' },

    fig('evo-dashboard-evo-by-evolusis', 'dashboard-dark', 'The Evo dashboard on a free account, with a Today’s Focus card, three coaching modules, and locked benchmark panels',
      'A free account on first open. Today’s Focus leads, the three coaching modes sit under it, and the locked modules stay visible instead of being hidden.'),

    { type: 'heading', level: 2, text: 'One Thing First' },
    { type: 'paragraph', text: 'Most dashboards open with a wall of numbers and leave the user to work out what to do about them. I inverted that. The top of the screen is a single card with a named skill, a time cost and one button: Delivering Constructive Feedback, five minutes, Start Practice.' },
    { type: 'paragraph', text: 'No interpretation required. You do not have to understand your own engagement metrics to know what that card is asking of you.' },
    { type: 'paragraph', text: 'Everything else is deliberately subordinate. The three coaching modes below it, voice practice, chat and a development plan, are the second tier. Progress and benchmarks are third, because reviewing your own progress is not the behaviour the product needs from you on a Tuesday morning. It is the behaviour it needs on a Friday.' },

    { type: 'heading', level: 2, text: 'Designing the Locked State' },
    { type: 'paragraph', text: 'The free tier does not include company benchmarks or weekly activity. The easy call is to hide them and show a clean screen.' },
    { type: 'paragraph', text: 'I kept them on screen, dimmed, with the padlock and the real module name visible. Three reasons, in order of how much they mattered:' },
    { type: 'bulletList', items: [
      'Hiding a feature makes the product feel small. A visible ceiling makes it feel like there is somewhere to go',
      'It is honest about what the paid tier actually contains, which is a better upgrade prompt than a modal that appears when you click the wrong thing',
      'It stops a new account collapsing into empty space, and the empty account is the state most users see first and most teams design last',
    ]},

    fig('evo-dashboard-evo-by-evolusis', 'dashboard-light', 'The same Evo dashboard in light theme on a full account, with benchmark and weekly activity charts unlocked',
      'The same layout, full account, light theme. The grid does not move when panels unlock, so nothing has to be relearned.'),

    { type: 'heading', level: 2, text: 'Two Themes, One Grid' },
    { type: 'paragraph', text: 'Dark and light are not a taste toggle here. HR leads present this screen in meeting rooms with the lights up. Employees use it alone at a desk, often late. Both are real contexts and neither is the default.' },
    { type: 'paragraph', text: 'So the grid holds still between them. Only the surface changes. Nobody should have to relearn where their own progress lives because the theme changed, and a layout that only works in one of its two themes is a layout that was designed once and adapted badly.' },

    { type: 'heading', level: 2, text: 'What I Owned' },
    { type: 'bulletList', items: [
      'Information hierarchy and the module grid, across both themes and every account state',
      'Empty, locked and first-run states, which is where most dashboard designs quietly give up',
      'The component set that the chat and voice products reused, so the suite reads as one system rather than three',
    ]},
    { type: 'paragraph', text: 'I worked on this as a design consultant to the Evolusis team. The engineering is theirs.' },
  ],

  /* ══ Evo Chat ════════════════════════════════════════════════ */
  'evo-chat-ai-coaching-chatbot': [
    { type: 'paragraph', text: 'Evo Chat is where an employee brings the thing they cannot say out loud. A manager taking credit for their work. A review they are dreading. A resignation they have not decided on yet.' },

    { type: 'heading', level: 2, text: 'Not a Chat Window With a Logo On It' },
    { type: 'paragraph', text: 'That context changes the design problem completely. A general purpose chat interface is optimised for getting an answer quickly. This one has to be optimised for getting someone to start typing at all.' },
    { type: 'paragraph', text: 'The person on the other side is about to describe a workplace problem, in writing, to software their employer paid for. Every ordinary chat convention has to be re-examined against that.' },

    fig('evo-chat-ai-coaching-chatbot', 'chat-open', 'The Evo Chat opening screen with a greeting and three suggested starting points',
      'The opening state. No feature tour and no empty canvas: a greeting, and three ways in that name real situations.'),

    { type: 'heading', level: 2, text: 'The Blank Page Problem' },
    { type: 'paragraph', text: 'The hardest screen in the product is the one before the conversation starts. A cursor blinking in an empty box asks the user to summarise their own workplace problem in a sentence, cold. Most people close the tab.' },
    { type: 'paragraph', text: 'So the empty state offers three doors instead: generate a report, practise a tough conversation, improve my tone and clarity. Each is a real task, phrased the way a person would actually say it out loud.' },
    { type: 'paragraph', text: 'Picking one of three is a much smaller act than composing an opening line. It also quietly teaches the user what the product is for, which a placeholder saying "Ask me anything" never does.' },

    { type: 'heading', level: 2, text: 'Consent Before Anything' },
    { type: 'paragraph', text: 'The product works better if it remembers your history. That is also precisely the thing an employee should be nervous about.' },

    fig('evo-chat-ai-coaching-chatbot', 'consent', 'The Evo Chat consent screen explaining what conversation data is stored and why, with accept and decline options',
      'Consent as a screen, not a checkbox. What is kept, what it is used for, how to clear it, and a working way to say no.'),

    { type: 'paragraph', text: 'So consent is a full screen, shown before the first message, written in sentences rather than policy language. It says what is stored, what it is used for, and how to clear it. The user can decline and still use the product.' },
    { type: 'paragraph', text: 'This was not a legal box being ticked. In a tool where the employer is the customer and the employee is the user, being visibly straight about data is the entire basis on which anyone types anything honest into it. Get that wrong and every downstream design decision is decorating a product nobody trusts.' },

    { type: 'heading', level: 2, text: 'The Voice Sibling' },
    { type: 'paragraph', text: 'Evo Coach handles the same conversations out loud, for people rehearsing a real exchange rather than drafting one. Speaking a difficult sentence and typing it are different skills, and the second does not prepare you for the first.' },

    fig('evo-chat-ai-coaching-chatbot', 'voice-check', 'The Evo Coach voice permission screen with compliance badges, a data retention note, and a text-only alternative',
      'Evo Coach asking for the microphone. Certifications, the retention window and a working text-only path are all on screen before the request, not after it.'),

    { type: 'paragraph', text: 'Its microphone request follows the same rule as the chat consent screen. The compliance badges, the deletion window and a genuine text-only option are visible at the moment of the ask. A permission prompt that arrives with no context gets denied, and a denied microphone in a voice product is a dead end.' },

    { type: 'heading', level: 2, text: 'What I Owned' },
    { type: 'bulletList', items: [
      'The conversational flow: entry states, suggestion design, and how a coaching exchange is structured differently on screen from ordinary chat',
      'The consent experience across both the chat and voice products',
      'Empty, loading and permission-declined states, because those are the ones real users actually hit',
    ]},
    { type: 'paragraph', text: 'Design consultancy work for the Evolusis team, built on the system established by the landing page and dashboard.' },
  ],

  /* ══ Mission Control ═════════════════════════════════════════ */
  'mission-control': [
    { type: 'paragraph', text: 'A drone mission is a program. In most systems today somebody writes it in code, or clicks through a form and hopes.' },

    { type: 'heading', level: 2, text: 'Blueprints, For Drones' },
    { type: 'paragraph', text: 'Mission Control is a no-code editor that lets the person who actually understands the mission build its logic themselves, by connecting blocks on a canvas. Take off, fly this perimeter, hold if the battery drops below reserve, come home.' },
    { type: 'paragraph', text: 'The reference was Unreal Engine’s Blueprint system. If a game designer can build complex behaviour visually without touching C++, an operator should be able to plan a survey flight without touching Python.' },

    fig('mission-control', 'cover', 'Mission Control title slide reading Operator-First Autonomous Drone Logic Editor',
      'Mission Control. A no-code HMI for high-stakes mission orchestration, designed end to end.'),

    { type: 'heading', level: 2, text: 'The Gap Worth Closing' },
    { type: 'paragraph', text: 'Drone operations are unforgiving in a specific way. There is a gap between the person who understands the mission and the person who can express it in code, and every handoff across that gap is a chance to lose intent.' },
    { type: 'paragraph', text: 'These mistakes do not fail politely. A wrong sequence is a lost aircraft, a violated airspace boundary, or worse.' },

    fig('mission-control', 'cognitive-gap', 'Slide titled The Cognitive Gap in Command and Control listing three problems with code-first tooling',
      'The framing. Code-first tools bury risk in logs, fragmented panels slow down state parsing, and safety ends up reactive rather than built in.'),

    { type: 'heading', level: 2, text: 'One View, Four Regions' },
    { type: 'paragraph', text: 'The interface is a single screen on purpose. A block library on the left, the phase canvas in the middle, an inspector on the right, and the generated code with its live errors underneath.' },
    { type: 'paragraph', text: 'Operators do not get to hunt through tabs while an aircraft is airborne. Everything needed to answer "what will this thing do next" stays in peripheral vision. Tabs are a filing decision, and filing is the wrong thing to be doing under time pressure.' },

    fig('mission-control', 'unified-hmi', 'Annotated Mission Control interface showing the block library, phase canvas, inspector box and code with errors',
      'Library, canvas, inspector and faults in one operator view. Nothing about a mission requires leaving this screen.'),

    { type: 'heading', level: 2, text: 'Colour Carries Risk, and Nothing Else' },
    { type: 'paragraph', text: 'Cyan is normal. Orange is a warning. Red is critical. Three states, and colour is used for nothing else in the entire interface.' },
    { type: 'paragraph', text: 'That restraint is the whole trick. The moment colour also means "selected" or "primary action", the operator learns to filter it out, and the day it means "your battery reserve will not get you home" they filter that out too.' },
    { type: 'paragraph', text: 'Multi-condition gates, battery reserve checks and return-to-base routes all inherit the same three-step scale, so risk reads identically wherever it appears on the canvas.' },

    fig('mission-control', 'safety-logic', 'Slide showing a node graph with cyan, orange and red paths for normal, warning and critical conditions',
      'Safety logic on the canvas. One scale, applied everywhere, so severity never has to be decoded.'),

    { type: 'heading', level: 2, text: 'Glass Box, Not Black Box' },
    { type: 'paragraph', text: 'The editor writes real code, and it shows it. The generated source sits under the canvas with errors inline, next to a plain-language mission brief.' },
    { type: 'paragraph', text: 'Two audiences, one screen. The operator reads the brief in order to fly. The engineer or the auditor reads the code in order to sign it off. A no-code tool that hides its own output cannot be trusted with anything consequential, so this one does not hide it.' },

    fig('mission-control', 'glass-box', 'Slide showing generated code with inline errors beside a plain-language mission brief panel',
      'The generated code and the mission brief, side by side. Clarity for execution on one side, transparency for audit on the other.'),

    { type: 'heading', level: 2, text: 'Where It Stands' },
    { type: 'paragraph', text: 'Mission Control is a design project: an end-to-end HMI concept taken to a high-fidelity prototype, with its own design system, information architecture and interaction model.' },
    { type: 'paragraph', text: 'It has not flown an aircraft. The safety model here is designed and argued, not certified, and the distance between those two things in aviation is considerable. I would want a real operator to break it before I claimed anything more.' },
  ],

  /* ══ AWR ═════════════════════════════════════════════════════ */
  awr: [
    { type: 'paragraph', text: 'Every alcohol delivery app in India is a catalogue. Hundreds of bottles, a filter panel, a search bar, and a checkout that quietly adds fees at the last step.' },

    { type: 'heading', level: 2, text: 'A Brand, Not a Store' },
    { type: 'paragraph', text: 'Anurag Whiskey Reserve is a self-initiated concept: a single small-batch whiskey label from Mumbai, and the app that sells it. One brand, one cellar, no marketplace.' },
    { type: 'paragraph', text: 'I wanted to design the opposite of a catalogue. Something for a person who already knows what he drinks and wants it in his hand by evening, not a discovery engine for someone browsing.' },

    fig('awr', 'brand', 'Anurag Whiskey Reserve brand slide with the bottle and wordmark against a bar setting',
      'The brand. A single label, positioned as something you keep rather than something you browse.'),

    { type: 'heading', level: 2, text: 'Sebastian' },
    { type: 'paragraph', text: 'The whole project is built around one person. Sebastian D’Souza, 42, runs a printing business in Mumbai. Long days, limited time, and he likes ending his evenings with a good small-batch whiskey at home.' },
    { type: 'paragraph', text: 'His line from the persona work became the brief: "After a ten hour day I do not want to scroll through hundreds of bottles. Just show me the good stuff and get it to my door on time."' },

    fig('awr', 'persona', 'Persona slide for Sebastian D’Souza with bio, goals, frustrations, behaviours and a quote',
      'The persona. Narrow on purpose. Designing for one specific evening is more useful than designing for a demographic.'),

    { type: 'heading', level: 2, text: 'What Was Actually Wrong' },
    { type: 'paragraph', text: 'I wrote the problems down before drawing a single screen, because "existing apps feel cluttered" is a complaint, not a brief.' },
    { type: 'bulletList', items: [
      'Flavour profile, age and ABV hidden behind taps, when those are the only details that decide the purchase',
      'Reordering a familiar bottle repeats the entire address and payment flow, every time',
      'Fees and delivery charges appearing late, which reads as a trick even when it is not one',
      'Order status and delivery-day tracking left vague, so the anxiety lands after the money has gone',
    ]},

    fig('awr', 'problems-solutions', 'Slide pairing the problems with alcohol delivery apps against the solutions designed for AWR',
      'Problems on the left, the decision each one forced on the right. Every screen in the app traces back to a line on this slide.'),

    { type: 'heading', level: 2, text: 'Seven Screens, One Purchase' },
    { type: 'paragraph', text: 'The flow is deliberately short: age gate, home, listings, product detail, cart, checkout, confirmation. Nothing else exists. No feed, no reviews to write, no loyalty points to chase.' },

    fig('awr', 'flow', 'User flow diagram running from age gate through home, shop, product detail, cart, checkout and order confirmation',
      'The whole product, in eight steps. Anything that could not be justified on this line did not get designed.'),

    { type: 'paragraph', text: 'Age verification comes first and does not pretend to be onboarding. The home screen greets Sebastian by name and leads with one curated pick for tonight rather than a grid, because a grid is a decision handed back to the user.' },
    { type: 'paragraph', text: 'Product detail puts tasting notes, ABV and size selection above the fold, since that is the actual decision. Checkout shows the full total with delivery and taxes before the payment step rather than after it, which is the single change most likely to be felt as respect.' },

    fig('awr', 'screens', 'All seven AWR app screens in a row: age screen, home, listings, product detail, cart, checkout and order confirmation',
      'The full set. Dark, warm, amber, and the product photography carrying the page while the interface stays out of its way.'),

    { type: 'heading', level: 2, text: 'The Look, and One Honest Note' },
    { type: 'paragraph', text: 'Premium in spirits design means restraint and patience, not gold on everything. So the type is quiet, the spacing is generous, and the amber accent only appears where something is actionable.' },
    { type: 'paragraph', text: 'The bottle imagery is AI generated, because the brand does not exist and there is nothing to photograph. The interface, the flow, the brand system and the reasoning are mine.' },

    { type: 'heading', level: 2, text: 'Where It Stands' },
    { type: 'paragraph', text: 'A concept project, designed end to end. No client, no product, no sales. It exists because I wanted to find out what customer loyalty looks like as an interface when you are not optimising for browsing.' },
  ],

  /* ══ CloudQA ═════════════════════════════════════════════════ */
  cloudqa: [
    { type: 'paragraph', text: 'CloudQA sells no-code test automation: software that checks your software still works after you change it. A freelance brief, one page, one job. The pricing page was not converting.' },

    { type: 'heading', level: 2, text: 'The Actual Problem' },
    { type: 'paragraph', text: 'The page was a feature grid. Three columns, bullet lists of near-identical length, and no answer to the only question a visitor arrives with: which one of these is me?' },

    fig('cloudqa', 'before', 'The original CloudQA pricing page with three near-identical tier columns of bullet lists',
      'The page as it was. Three columns of similar bullets, and no signal about which plan belongs to which kind of buyer.'),

    { type: 'paragraph', text: 'A feature comparison is genuinely useful at the end of a decision. It is close to useless at the start of one. Leading with it asks the visitor to do the company’s segmentation work on their behalf, and most people leave rather than do that.' },

    { type: 'heading', level: 2, text: 'What I Changed' },
    { type: 'bulletList', items: [
      'Framed every tier around who it is for before what it contains, so a visitor self-selects in a single read',
      'Gave the recommended plan real visual weight, instead of an identical card with a small badge on it',
      'Put price and the things that drive it up front, with add-on costs stated plainly rather than in footnotes',
      'Pulled the objections forward: what happens after the trial, what counts as a test run, whether you can change plans',
      'Kept the full comparison, demoted below the decision, for the minority who genuinely want to audit it',
    ]},

    fig('cloudqa', 'after', 'The redesigned CloudQA pricing page with named tiers, a visually prioritised recommended plan, and stated add-on pricing',
      'The redesign. Tiers carry a named audience, the recommended plan takes visual priority, and add-on pricing is stated instead of footnoted.'),

    { type: 'heading', level: 2, text: 'Why Pricing Pages Fail' },
    { type: 'paragraph', text: 'They fail in a predictable way. The team knows the product so well that every feature feels load-bearing, so everything gets equal space. Meanwhile the visitor knows nothing, needs to be told where they belong, and is handed a spreadsheet.' },
    { type: 'paragraph', text: 'The redesign does not remove information. It sequences it. Position first, price second, proof third, exhaustive detail last for the small group that wants it.' },
    { type: 'paragraph', text: 'Moving the FAQ up mattered more than it looks. Those questions are the reason a visitor says "I will come back to this later", and later usually means never. Answering them next to the price removes the reason to leave.' },

    fig('cloudqa', 'in-context', 'The CloudQA pricing page shown on a laptop in a dark studio setting',
      'The page in context. Most of these decisions get made on a work machine, mid-afternoon, with three other tabs open.'),

    { type: 'heading', level: 2, text: 'Scope' },
    { type: 'paragraph', text: 'This was a focused freelance engagement on the pricing page, not a redesign of the CloudQA product or brand.' },
    { type: 'paragraph', text: 'I do not have access to their post-launch conversion data, so I am not going to quote a number at you. What I can defend is the reasoning above, which is the part that transfers to the next page anyway.' },
  ],

  /* ══ Orange+ ═════════════════════════════════════════════════ */
  orange: [
    { type: 'paragraph', text: 'Orange+ is a student app for a design college. One login for the schedule, attendance, assignments and the administrative sprawl currently spread across three portals and a physical notice board.' },

    { type: 'heading', level: 2, text: 'The App You Open Before You Are Awake' },
    { type: 'paragraph', text: 'The brief I set myself was narrow on purpose. Not the most complete campus app. The one a student actually opens at 8:55am, walking, one-handed, on the way to a class that starts in two minutes.' },
    { type: 'paragraph', text: 'Every campus app I looked at was designed for the registrar. Comprehensive, hierarchical, and clearly built by people who sit down at a desk to use software.' },

    fig('orange', 'home', 'The Orange+ home screen showing a good morning greeting, a live punch-in card for a class starting in two minutes, and the day’s schedule',
      'The home screen. A live punch-in for the class starting in two minutes, then the rest of the day underneath it.'),

    { type: 'heading', level: 2, text: 'Designing for an Eight Second Window' },
    { type: 'paragraph', text: 'Students do not sit down with a campus app. They check it between things, with about eight seconds of attention and one thumb.' },
    { type: 'paragraph', text: 'So the home screen answers one question before any other: what is happening right now, and what do I have to do about it. The card at the top is the class starting in two minutes, with a Punch In button on it and a countdown running.' },
    { type: 'paragraph', text: 'Attendance is the single most repeated action in a student’s day. From a cold open, it is one tap. Everything else in the app can afford to be two.' },
    { type: 'paragraph', text: 'Below that, the day runs as a horizontal strip of cards. Not a calendar grid, because nobody needs a month view to work out where they are going next.' },

    { type: 'heading', level: 2, text: 'Real Course Names, On Purpose' },
    { type: 'paragraph', text: 'The schedule cards carry actual titles, Interaction Studios and Designing with Code, rather than placeholder text.' },
    { type: 'paragraph', text: 'That sounds like a small thing and it is not. An interface designed against "Course 1, Course 2" produces layouts that break the moment real titles arrive, and it hides something true about the user: students identify their day by subject, not by time slot. Design against placeholders and you end up leading with the clock.' },

    fig('orange', 'in-hand', 'Two phones showing the Orange+ splash screen and the home screen',
      'Splash and home. The wordmark is the only moment the brand speaks before the day takes over.'),

    { type: 'heading', level: 2, text: 'Warm, Not Institutional' },
    { type: 'paragraph', text: 'Orange+ uses a warm gradient, soft illustration and generous type, because of where it actually lives. This icon sits on a home screen between Instagram and Messages, and it has to survive that comparison every time a student unlocks their phone.' },
    { type: 'paragraph', text: 'Institutional software gets opened because it must be. That is a low bar and it produces low-quality habits. I wanted this one to be opened because it is the fastest way to answer a question the student already has.' },

    fig('orange', 'on-homescreen', 'The Orange+ app icon on an iPhone home screen among standard apps',
      'The icon in its real competitive context, sitting between Calendar and Mail. This is the comparison the design actually has to win.'),

    { type: 'heading', level: 2, text: 'Four Tabs, Held' },
    { type: 'paragraph', text: 'The bottom navigation is four items and stayed four items: home, submissions, saved, calendar.' },
    { type: 'paragraph', text: 'Every idea for a fifth got refused. The moment a student has to stop and think about which tab a thing lives in, the app has already lost to a WhatsApp group, and once it loses to the group chat it does not get that habit back.' },

    { type: 'heading', level: 2, text: 'Where It Stands' },
    { type: 'paragraph', text: 'A product design project taken to a high-fidelity prototype. The screens shown here are the ones I finished. The full flow is not built, and it has never run against a real timetable.' },
  ],
}

/* ─── Gallery images ──────────────────────────────────────────── */

/**
 * Everything the project has, in order. Figures used in the copy above are
 * skipped by the gallery automatically; what is left over shows under the
 * write-up as closing plates.
 */
const IMAGES: Record<string, ImageItem[]> = {
  lineup: [
    { url: '/projects/lineup/case/joining.webp', alt: 'Lineup home and nearby centres screens' },
    { url: '/projects/lineup/case/holding.webp', alt: 'Lineup token and live queue screens' },
    { url: '/projects/lineup/case/arrival.webp', alt: 'Lineup arrival screen' },
    { url: '/projects/lineup/wordmark.webp', alt: 'The Lineup wordmark', caption: 'The wordmark. Instrument Serif, with the ember dot doing the work of the token.' },
  ],
  'evolusis-landing-page': [
    { url: '/projects/evolusis-landing-page/case/hero.webp', alt: 'Evolusis landing page hero' },
    { url: '/projects/evolusis-landing-page/case/scroll.webp', alt: 'Evolusis landing page scrolled state' },
  ],
  'evo-dashboard-evo-by-evolusis': [
    { url: '/projects/evo-dashboard-evo-by-evolusis/case/dashboard-dark.webp', alt: 'Evo dashboard, free account, dark theme' },
    { url: '/projects/evo-dashboard-evo-by-evolusis/case/dashboard-light.webp', alt: 'Evo dashboard, full account, light theme' },
  ],
  'evo-chat-ai-coaching-chatbot': [
    { url: '/projects/evo-chat-ai-coaching-chatbot/case/chat-open.webp', alt: 'Evo Chat opening state' },
    { url: '/projects/evo-chat-ai-coaching-chatbot/case/consent.webp', alt: 'Evo Chat consent screen' },
    { url: '/projects/evo-chat-ai-coaching-chatbot/case/voice-check.webp', alt: 'Evo Coach voice permission screen' },
  ],
  'mission-control': [
    { url: '/projects/mission-control/case/cover.webp', alt: 'Mission Control title slide' },
    { url: '/projects/mission-control/case/cognitive-gap.webp', alt: 'The cognitive gap in command and control' },
    { url: '/projects/mission-control/case/unified-hmi.webp', alt: 'The unified Mission Control HMI, annotated' },
    { url: '/projects/mission-control/case/safety-logic.webp', alt: 'Safety logic and spatial risk on the canvas' },
    { url: '/projects/mission-control/case/glass-box.webp', alt: 'Generated code and operator brief side by side' },
    { url: '/projects/mission-control/case/on-desk.webp', alt: 'Mission Control shown on a laptop', caption: 'Where the work was done.' },
  ],
  awr: [
    { url: '/projects/awr/case/brand.webp', alt: 'Anurag Whiskey Reserve brand slide' },
    { url: '/projects/awr/case/persona.webp', alt: 'The Sebastian persona' },
    { url: '/projects/awr/case/problems-solutions.webp', alt: 'Problems and solutions' },
    { url: '/projects/awr/case/flow.webp', alt: 'The AWR user flow' },
    { url: '/projects/awr/case/screens.webp', alt: 'All seven AWR screens' },
    { url: '/projects/awr/case/cheers.webp', alt: 'The AWR bottle, closing plate', caption: 'Cheers. Bottle imagery generated, brand and interface designed.' },
  ],
  cloudqa: [
    { url: '/projects/cloudqa/case/before.webp', alt: 'The original CloudQA pricing page' },
    { url: '/projects/cloudqa/case/after.webp', alt: 'The redesigned CloudQA pricing page' },
    { url: '/projects/cloudqa/case/in-context.webp', alt: 'The pricing page on a laptop' },
    { url: '/projects/cloudqa/case/on-desk.webp', alt: 'The pricing page on a laptop outdoors', caption: 'The redesign, out of the browser.' },
  ],
  orange: [
    { url: '/projects/orange/case/home.webp', alt: 'The Orange+ home screen' },
    { url: '/projects/orange/case/in-hand.webp', alt: 'Orange+ splash and home screens' },
    { url: '/projects/orange/case/on-homescreen.webp', alt: 'The Orange+ icon on a home screen' },
    { url: '/projects/orange/case/on-desk.webp', alt: 'Orange+ on a phone, closing plate', caption: 'Orange+, where it actually lives.' },
  ],
}

/* ─── Run ─────────────────────────────────────────────────────── */

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set. Add it to .env.local.')
    process.exit(1)
  }

  const rows = await db.select().from(projects)

  let updated = 0
  const missing: string[] = []
  const dims: Dims = new Map()

  for (const project of rows) {
    const blocks = DESCRIPTIONS[project.slug]
    if (!blocks) {
      missing.push(project.slug)
      continue
    }

    // Fails loudly on a missing figure rather than seeding a broken image.
    await measure(blocks, dims)

    await db
      .update(projects)
      .set({
        description: buildTiptapJson(blocks),
        descriptionHtml: buildHtml(blocks, dims),
        images: IMAGES[project.slug] ?? [],
        updatedAt: new Date(),
      })
      .where(eq(projects.id, project.id))

    const figures = blocks.filter((b) => b.type === 'figure').length
    const words = blocks.reduce((n, b) => {
      if (b.type === 'paragraph') return n + b.text.split(/\s+/).length
      if (b.type === 'bulletList') return n + b.items.join(' ').split(/\s+/).length
      return n
    }, 0)

    console.log(`  ${project.slug.padEnd(32)} ${String(words).padStart(4)} words   ${figures} figures   ${(IMAGES[project.slug] ?? []).length} images`)
    updated++
  }

  if (missing.length) {
    console.log(`\n  no copy written for: ${missing.join(', ')}`)
  }
  console.log(`\n  updated ${updated}/${rows.length} projects`)
  process.exit(0)
}

main().catch((err) => {
  console.error('seed-descriptions failed:', err)
  process.exit(1)
})
