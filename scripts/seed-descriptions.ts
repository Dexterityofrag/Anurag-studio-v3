/**
 * One-off script to seed project descriptions into the database.
 * Run with: npx tsx scripts/seed-descriptions.ts
 */

import { db } from '../lib/db'
import { projects } from '../lib/db/schema'
import { eq } from 'drizzle-orm'

/* ─── Helper: build Tiptap JSON from simple structure ─────────── */

type Block =
  | { type: 'heading'; level: 2 | 3; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'bulletList'; items: string[] }

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
      if (block.text.trim() === '') {
        content.push({ type: 'paragraph' })
      } else {
        content.push({
          type: 'paragraph',
          content: [{ type: 'text', text: block.text }],
        })
      }
    } else if (block.type === 'bulletList') {
      content.push({
        type: 'bulletList',
        content: block.items.map((item) => ({
          type: 'listItem',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: item }],
            },
          ],
        })),
      })
    }
  }

  return { type: 'doc', content }
}

function buildHtml(blocks: Block[]) {
  let html = ''
  for (const block of blocks) {
    if (block.type === 'heading') {
      html += `<h${block.level}>${block.text}</h${block.level}>`
    } else if (block.type === 'paragraph') {
      html += `<p>${block.text || ''}</p>`
    } else if (block.type === 'bulletList') {
      html += '<ul>'
      for (const item of block.items) {
        html += `<li><p>${item}</p></li>`
      }
      html += '</ul>'
    }
  }
  return html
}

/* ─── Project Descriptions ────────────────────────────────────── */

const descriptions: Record<string, Block[]> = {
  'evolusis-landing-page': [
    { type: 'heading', level: 2, text: 'The First Touchpoint' },
    { type: 'paragraph', text: 'Evolusis is a B2B AI coaching platform reimagining how companies develop their workforce. This landing page was the first thing potential customers would see — and it needed to earn every scroll.' },
    { type: 'paragraph', text: 'I designed and helped build the marketing site from scratch. The goal was clear: communicate a complex AI product without drowning visitors in jargon or buzzwords.' },

    { type: 'heading', level: 2, text: 'What I Did' },
    { type: 'bulletList', items: [
      'Designed the full landing experience — hero, feature breakdowns, social proof, and conversion flow',
      'Contributed to the frontend implementation in Next.js, shipping production-ready code',
      'Built a responsive system that feels considered on every viewport, from ultrawide to mobile',
    ]},

    { type: 'heading', level: 2, text: 'The Thinking' },
    { type: 'paragraph', text: 'Evolusis isn\'t another SaaS tool — it\'s a platform where AI coaches humans through real workplace challenges. The landing page needed to convey that warmth and intelligence simultaneously.' },
    { type: 'paragraph', text: 'I leaned into clean typography, deliberate whitespace, and motion that guides rather than decorates. Every section was designed to build confidence — from the hero statement to the feature deep-dives to the final call-to-action.' },
    { type: 'paragraph', text: 'The result shipped live and became the primary acquisition channel for the platform.' },
  ],

  'evo-dashboard-evo-by-evolusis': [
    { type: 'heading', level: 2, text: 'The Nerve Centre' },
    { type: 'paragraph', text: 'This is where HR leaders and managers come to understand, track, and shape workforce development through AI. The Evo Dashboard is the control centre of the entire Evolusis suite.' },

    { type: 'heading', level: 2, text: 'The Challenge' },
    { type: 'paragraph', text: 'Dashboard design is a graveyard of good intentions — most end up as data dumps that nobody actually uses. Evo Dashboard needed to surface actionable insights without overwhelming users who aren\'t data analysts.' },

    { type: 'heading', level: 2, text: 'My Approach' },
    { type: 'paragraph', text: 'I went with a bento grid layout that prioritises what matters. Each module tells a story: coaching progress, team engagement, skill gaps, upcoming sessions. The hierarchy is ruthless — primary metrics get space, everything else earns its place.' },

    { type: 'heading', level: 2, text: 'Key Decisions' },
    { type: 'bulletList', items: [
      'Bento grid architecture — modular, scannable, and adaptable to different user roles',
      'Design system built for consistency across the growing Evolusis product suite',
      'Dark mode as default — these are tools people live in daily, comfort matters',
      'Data visualisation that tells stories, not just displays numbers',
    ]},
  ],

  'evo-chat-ai-coaching-chatbot': [
    { type: 'heading', level: 2, text: 'Not Another ChatGPT Wrapper' },
    { type: 'paragraph', text: 'Evo Chat is a purpose-built coaching interface where AI guides employees through real workplace challenges — conflict resolution, career development, skill building. This isn\'t a generic chatbot with a corporate skin.' },

    { type: 'heading', level: 2, text: 'The Design Problem' },
    { type: 'paragraph', text: 'Chat interfaces feel solved until you try to design one for coaching. A coaching conversation has structure, empathy, and direction. Generic chat UIs don\'t support any of that.' },

    { type: 'heading', level: 2, text: 'What I Designed' },
    { type: 'bulletList', items: [
      'A conversational UI where coaching prompts, reflection points, and action items have distinct visual treatments',
      'Contextual nudges that guide without controlling the conversation',
      'A consent-first experience — users always know what data is being used and why',
    ]},

    { type: 'heading', level: 2, text: 'The Nuance' },
    { type: 'paragraph', text: 'The biggest challenge was balancing warmth with utility. The interface needed to feel like talking to a thoughtful mentor, not interrogating a search engine. Every interaction pattern was tested against that bar.' },
    { type: 'paragraph', text: 'Small details mattered: typing indicators that feel human, response pacing that doesn\'t overwhelm, and a visual rhythm that makes long coaching sessions feel manageable.' },
  ],

  'evo-coach-ai-voice-coaching': [
    { type: 'heading', level: 2, text: 'When Text Isn\'t Enough' },
    { type: 'paragraph', text: 'Mobile-first AI voice roleplay for high-stakes workplace conversations. Think: preparing for a difficult performance review, practising salary negotiation, or rehearsing feedback delivery.' },

    { type: 'heading', level: 2, text: 'Why Voice Matters' },
    { type: 'paragraph', text: 'Written coaching has limits. When someone needs to practice a tough conversation, they need to actually speak. Evo Coach puts users in realistic voice scenarios where the AI adapts in real-time to tone, confidence, and content.' },

    { type: 'heading', level: 2, text: 'My Design Approach' },
    { type: 'bulletList', items: [
      'Mobile-first and minimal — nothing competes with the conversation',
      'Clinical warmth: the UI feels safe and professional simultaneously',
      'System check flows that build confidence before jumping into roleplay',
      'Clear session states — preparation, active coaching, and reflection phases',
    ]},

    { type: 'heading', level: 2, text: 'The Tension' },
    { type: 'paragraph', text: 'Voice UX is unforgiving. There\'s no undo, no delete key. The visual layer needed to be a calm anchor while the audio experience was emotionally intense. I stripped the interface down to essentials and let breathing room do the heavy lifting.' },
  ],

  'mission-control': [
    { type: 'heading', level: 2, text: 'Blueprints for the Sky' },
    { type: 'paragraph', text: 'A no-code drone mission planner built for operators who need to orchestrate complex autonomous missions — without writing a single line of code.' },

    { type: 'heading', level: 2, text: 'The Inspiration' },
    { type: 'paragraph', text: 'Unreal Engine\'s Blueprint system. If game developers can build complex logic visually, drone operators should be able to do the same for mission planning. That was the starting premise.' },

    { type: 'heading', level: 2, text: 'What I Designed' },
    { type: 'bulletList', items: [
      'A visual node-based editor where prebuilt code blocks snap together to define mission logic',
      'Operators drag, connect, and configure — takeoff sequences, waypoint navigation, conditional behaviours, return-to-home protocols',
      'The interface speaks operator language, not developer language',
    ]},

    { type: 'heading', level: 2, text: 'The UX Challenge' },
    { type: 'paragraph', text: 'Drone operations are high-stakes. A bad mission sequence doesn\'t just fail gracefully — it can mean a lost aircraft or worse. The editor needed to be powerful enough for complex missions but constrained enough to prevent dangerous configurations.' },
    { type: 'paragraph', text: 'I focused on progressive disclosure: simple missions are simple to build, complex missions reveal complexity only when needed. Every node validates its connections, and the system warns before you can create something risky.' },
  ],

  'awr': [
    { type: 'heading', level: 2, text: 'A Brand, Not a Marketplace' },
    { type: 'paragraph', text: 'Anurag Whiskey Reserve is a personal concept project — a single-brand whiskey experience designed for the kind of person who doesn\'t browse, they collect.' },

    { type: 'heading', level: 2, text: 'The Concept' },
    { type: 'paragraph', text: 'AWR isn\'t a marketplace. It\'s a brand app for one whiskey, built for loyal buyers who want the full experience: tasting notes, collection tracking, exclusive drops, and the story behind every bottle.' },

    { type: 'heading', level: 2, text: 'Design Philosophy' },
    { type: 'bulletList', items: [
      'Premium without pretension — dark, warm tones with gold accents that feel earned, not slapped on',
      'Photography-forward — the product is the hero, the UI gets out of the way',
      'Considered typography that mirrors the patience of aged spirits',
    ]},

    { type: 'heading', level: 2, text: 'Why I Built This' },
    { type: 'paragraph', text: 'I wanted to explore what brand loyalty looks like in a digital product. Not gamified retention or push notification spam — actual value for someone who genuinely cares about a single product.' },
    { type: 'paragraph', text: 'The result is an app that feels like a private members\' club, not a store.' },
  ],

  'cloudqa': [
    { type: 'heading', level: 2, text: 'From Feature Grid to Value Story' },
    { type: 'paragraph', text: 'Freelance project for CloudQA — a no-code testing automation platform. Their pricing page was a static comparison table that confused more than it converted.' },

    { type: 'heading', level: 2, text: 'The Problem' },
    { type: 'paragraph', text: 'The old pricing page listed features in a grid. Every plan looked the same. Users couldn\'t quickly understand which plan fit their needs, and the page was haemorrhaging potential conversions.' },

    { type: 'heading', level: 2, text: 'My Approach' },
    { type: 'paragraph', text: 'I restructured the page around a narrative of value, not a feature checklist. Each tier tells a clear story: who it\'s for, what you get, and why it\'s worth it. The comparison table still exists, but it\'s secondary to the headline messaging.' },

    { type: 'heading', level: 2, text: 'Key Changes' },
    { type: 'bulletList', items: [
      'Reframed tiers around user personas, not feature counts',
      'Added visual hierarchy so the recommended plan is instantly obvious',
      'Built trust through social proof and transparent FAQ placement',
      'Reduced cognitive load — users make faster, more confident decisions',
    ]},
  ],

  'orange': [
    { type: 'heading', level: 2, text: 'One App for Campus Life' },
    { type: 'paragraph', text: 'Built for a college — a digital companion that feels less like a campus app and more like an extension of student life.' },

    { type: 'heading', level: 2, text: 'The Problem' },
    { type: 'paragraph', text: 'Students were juggling multiple platforms for schedules, grades, events, assignments, and campus services. The existing system was fragmented, frustrating, and felt like it was designed for administrators, not students.' },

    { type: 'heading', level: 2, text: 'What I Designed' },
    { type: 'paragraph', text: 'A unified portal that brings everything into one experience — class schedules, grade tracking, campus events, assignment deadlines, and administrative services. One app, one login, one place to manage college life.' },

    { type: 'heading', level: 2, text: 'Design Principles' },
    { type: 'bulletList', items: [
      'Designed for how students actually use their phones — quick glances between classes, not deep sessions',
      'Information density without clutter — the dashboard surfaces what\'s urgent',
      'Familiar patterns that don\'t require onboarding — if you\'ve used a modern app, you can use Orange+',
    ]},

    { type: 'paragraph', text: 'The goal wasn\'t to build the most feature-rich app. It was to build the one students actually open every morning.' },
  ],
}

/* ─── Run updates ─────────────────────────────────────────────── */

async function main() {
  const allProjects = await db.select().from(projects)

  let updated = 0

  for (const project of allProjects) {
    const blocks = descriptions[project.slug]
    if (!blocks) {
      console.log(`⚠ No description found for slug: "${project.slug}" — skipping`)
      continue
    }

    const description = buildTiptapJson(blocks)
    const descriptionHtml = buildHtml(blocks)

    await db
      .update(projects)
      .set({ description, descriptionHtml, updatedAt: new Date() })
      .where(eq(projects.id, project.id))

    console.log(`✓ Updated: ${project.title} (${project.slug})`)
    updated++
  }

  console.log(`\nDone! Updated ${updated}/${allProjects.length} projects.`)
  process.exit(0)
}

main().catch((err) => {
  console.error('Script failed:', err)
  process.exit(1)
})
