// seed-blogs.mjs — Insert 7 Medium posts + fix about data + remove junk project
import postgres from 'postgres'

const DATABASE_URL = 'postgresql://doadmin:AVNS_NxNPAd3TxvxyfSi9Vsp@anurag-studio-db-do-user-33474512-0.h.db.ondigitalocean.com:25060/defaultdb?sslmode=require'

const sql = postgres(DATABASE_URL, { ssl: 'require' })

/* ─── BLOG POSTS ────────────────────────────────────────────── */
const posts = [
  {
    title: 'Agentic Browser Is the New Design Toolchain',
    slug: 'agentic-browser-is-the-new-design-toolchain',
    excerpt: 'How Atlas and Comet unlock new possibilities if you actually push them to full capacity. Explores how AI-powered browsers like ChatGPT Atlas and Perplexity Comet integrate agents into browsing sessions for richer design workflows.',
    cover_url: 'https://miro.medium.com/1*fHWqhdjEh1uJBP_VGTXK_A@2x.jpeg',
    external_url: 'https://medium.com/design-bootcamp/agentic-browser-is-the-new-design-toolchain-895f773640e7',
    published_at: '2025-11-12',
    tags: ['Artificial Intelligence', 'Design', 'UX Design', 'AI', 'Agentic AI'],
    reading_time_minutes: 7,
  },
  {
    title: 'The $5,000 Lantern and the Playbook of Symbolic Design',
    slug: 'the-5000-lantern-and-the-playbook-of-symbolic-design',
    excerpt: "Inside LoveFrom's quiet mastery of symbolic design and halo thinking. Analyzes LoveFrom studio's portfolio strategy, illustrating how curated limited-edition projects and symbolic objects command premium positioning.",
    cover_url: 'https://miro.medium.com/1*6rJ-Fp1VvctNFponsaG0OA@2x.jpeg',
    external_url: 'https://medium.com/design-bootcamp/the-5-000-lantern-and-the-playbook-of-symbolic-design-b56eab9203ed',
    published_at: '2025-10-11',
    tags: ['Design Thinking', 'Product Design', 'Creativity', 'Innovation', 'Technology'],
    reading_time_minutes: 4,
  },
  {
    title: "iPhone 17 Air: Apple's Thinnest Statement Yet",
    slug: 'iphone-17-air-apples-thinnest-statement-yet',
    excerpt: "Exploring Apple's latest design gamble and what it means for the future of smartphones. Examines Apple's ultra-thin iPhone 17 Air (5.6mm), analyzing its titanium construction, A19 Pro chip, and bold removal of legacy ports.",
    cover_url: 'https://miro.medium.com/1*6Z2WyivZegHMcA9n_cBXPw@2x.jpeg',
    external_url: 'https://medium.com/design-bootcamp/iphone-17-air-apples-thinnest-statement-yet-b6afb6a9c859',
    published_at: '2025-09-09',
    tags: ['iPhone', 'Apple', 'Product Design', 'Minimalism', 'Technology'],
    reading_time_minutes: 3,
  },
  {
    title: 'AI Hallucinations Explained: Why Smart Machines Make Dumb Mistakes',
    slug: 'ai-hallucinations-explained-why-smart-machines-make-dumb-mistakes',
    excerpt: 'Understanding why AI creates confident but false answers and what we can do about it. Clarifies AI hallucinations as statistical prediction errors where models generate false information confidently.',
    cover_url: 'https://miro.medium.com/1*uheWI0_PYYxJ3FG8lwY_5A@2x.jpeg',
    external_url: 'https://medium.com/@Dexterityofrag/ai-hallucinations-explained-why-smart-machines-make-dumb-mistakes-9a983c4aba6a',
    published_at: '2025-08-29',
    tags: ['Artificial Intelligence', 'Design', 'Machine Learning', 'Technology', 'Data Science'],
    reading_time_minutes: 3,
  },
  {
    title: "Behind the Speed: How Apple's Custom iPhone Tech Is Changing F1 Filmmaking",
    slug: 'behind-the-speed-how-apples-custom-iphone-tech-is-changing-f1-filmmaking',
    excerpt: "Inside Apple's mini iPhone-powered camera that brought Formula 1's cockpit to the big screen. Details Apple's custom camera module combining iPhone components with compact design for F1 racing.",
    cover_url: 'https://miro.medium.com/1*j-UM-p__AwVoRmnKz2aCxg@2x.jpeg',
    external_url: 'https://medium.com/@Dexterityofrag/behind-the-speed-how-apples-custom-iphone-tech-is-changing-f1-filmmaking-e8edba3d276e',
    published_at: '2025-06-21',
    tags: ['Technology', 'Film', 'Photography', 'Sports', 'Innovation'],
    reading_time_minutes: 3,
  },
  {
    title: "The Quiet Silicon Revolution: ARM's Rise Over Intel",
    slug: 'the-quiet-silicon-revolution-arms-rise-over-intel',
    excerpt: "A deep dive into how ARM's lean RISC design and Apple's bold pivot upended Intel's x86 reign. Contrasts CISC and RISC architectures, documenting how ARM leveraged efficiency gains.",
    cover_url: 'https://miro.medium.com/1*qbXy4N1PSu5DchXuyyZ2hA@2x.jpeg',
    external_url: 'https://medium.com/@Dexterityofrag/the-quiet-silicon-revolution-arms-rise-over-intel-fa1471489f1e',
    published_at: '2025-06-19',
    tags: ['Technology', 'Apple', 'Programming', 'Artificial Intelligence', 'iOS'],
    reading_time_minutes: 2,
  },
  {
    title: "Apple's Liquid Glass: Misstep or Masterstroke?",
    slug: 'apples-liquid-glass-misstep-or-masterstroke',
    excerpt: "Whenever Apple makes a daring decision, initial skepticism inevitably follows. Evaluates Vision Pro's Liquid Glass interface as a bold design bet — exploring whether the translucent aesthetic signals a new era or a costly misstep.",
    cover_url: 'https://miro.medium.com/1*WJN2-W1qG3f7EliYKZ-kNg.jpeg',
    external_url: 'https://medium.com/@Dexterityofrag/apples-liquid-glass-misstep-or-masterstroke-1ed9f9ff2b89',
    published_at: '2025-06-17',
    tags: ['Apple', 'AR', 'UI', 'Product Design', 'Future'],
    reading_time_minutes: 1,
  },
]

async function main() {
  console.log('=== Starting DB seed ===\n')

  /* ── 1. Show current projects ─────────────────────────────── */
  const existingProjects = await sql`SELECT id, title, slug FROM projects ORDER BY created_at`
  console.log('Current projects:')
  existingProjects.forEach(p => console.log(` • [${p.id}] "${p.title}" (${p.slug})`))

  /* ── 2. Remove junk test project (slug contains 'gg' or 'hgg') */
  const junkDeleted = await sql`
    DELETE FROM projects
    WHERE slug ~* '^(gg|hgg|test|junk|demo)' OR title ~* '^(gg|hgg|test|junk|demo)'
    RETURNING id, title, slug
  `
  if (junkDeleted.length > 0) {
    console.log('\nDeleted junk projects:')
    junkDeleted.forEach(p => console.log(` • [${p.id}] "${p.title}" (${p.slug})`))
  } else {
    console.log('\nNo junk projects to delete.')
  }

  /* ── 3. Insert blog posts ─────────────────────────────────── */
  console.log('\nInserting blog posts...')
  let inserted = 0, skipped = 0
  for (const post of posts) {
    const exists = await sql`SELECT id FROM blog_posts WHERE slug = ${post.slug}`
    if (exists.length > 0) {
      // Update to ensure is_published = true and correct data
      await sql`
        UPDATE blog_posts SET
          title = ${post.title},
          excerpt = ${post.excerpt},
          cover_url = ${post.cover_url},
          external_url = ${post.external_url},
          published_at = ${post.published_at}::timestamptz,
          tags = ${sql.array(post.tags)},
          reading_time_minutes = ${post.reading_time_minutes},
          is_published = true,
          updated_at = NOW()
        WHERE slug = ${post.slug}
      `
      console.log(` ↻  Updated: "${post.title}"`)
      skipped++
    } else {
      await sql`
        INSERT INTO blog_posts (
          title, slug, excerpt, cover_url, external_url,
          published_at, tags, reading_time_minutes, is_published
        ) VALUES (
          ${post.title}, ${post.slug}, ${post.excerpt}, ${post.cover_url}, ${post.external_url},
          ${post.published_at}::timestamptz, ${sql.array(post.tags)}, ${post.reading_time_minutes}, true
        )
      `
      console.log(` ✓  Inserted: "${post.title}"`)
      inserted++
    }
  }
  console.log(`\nBlog posts: ${inserted} inserted, ${skipped} updated.`)

  /* ── 4. Fix about page data ────────────────────────────────── */
  console.log('\nFixing about page data...')

  // Clear existing and re-insert proper data
  await sql`DELETE FROM about_info`

  // Bio section
  await sql`
    INSERT INTO about_info (section, title, content, display_order) VALUES
    ('bio', 'Bio', 'UI/UX Designer, 3D Artist & Creative Technologist based in India. I craft digital experiences that sit at the intersection of precision systems and bold creative vision — working with startups and established brands to turn complex ideas into interfaces that feel inevitable.', 0)
  `

  // Stats (experience years, projects shipped, awards)
  await sql`
    INSERT INTO about_info (section, title, content, metadata, display_order) VALUES
    ('stat', 'Years Experience', '4+', '{"value": "4+", "label": "YEARS EXPERIENCE"}'::jsonb, 0),
    ('stat', 'Projects Shipped', '20+', '{"value": "20+", "label": "PROJECTS SHIPPED"}'::jsonb, 1),
    ('stat', 'Happy Clients', '10+', '{"value": "10+", "label": "HAPPY CLIENTS"}'::jsonb, 2)
  `

  // Skills
  await sql`
    INSERT INTO about_info (section, title, content, metadata, display_order) VALUES
    ('skill', 'UI Design', 'Interface design for web and mobile', '{"proficiency": 95, "tags": ["Figma", "Framer"]}'::jsonb, 0),
    ('skill', 'Brand Identity', 'Visual systems and brand strategy', '{"proficiency": 90, "tags": ["Logo", "Guidelines"]}'::jsonb, 1),
    ('skill', '3D & Motion', '3D modeling and motion graphics', '{"proficiency": 80, "tags": ["Blender", "After Effects"]}'::jsonb, 2),
    ('skill', 'Front-End Dev', 'Next.js, React, TypeScript', '{"proficiency": 75, "tags": ["Next.js", "React", "TypeScript"]}'::jsonb, 3)
  `

  // Experience
  await sql`
    INSERT INTO about_info (section, title, content, metadata, display_order) VALUES
    ('experience', 'UI/UX Designer — Evolusis', 'Led end-to-end product design for an AI SaaS platform. Built design systems, component libraries, and shipped core product interfaces from 0→1.', '{"company": "Evolusis", "start_date": "2024-01", "end_date": "2025-01", "location": "Remote"}'::jsonb, 0),
    ('experience', 'Product Designer — CloudQA', 'Redesigned enterprise QA testing dashboard. Improved task completion rates and reduced cognitive load across complex multi-step workflows.', '{"company": "CloudQA", "start_date": "2023-06", "end_date": "2023-12", "location": "Remote"}'::jsonb, 1),
    ('experience', 'Brand Designer — AWR', 'Created full brand identity for a hospitality group — logo, typography system, marketing collateral, and digital presence.', '{"company": "AWR Hospitality", "start_date": "2023-01", "end_date": "2023-05", "location": "India"}'::jsonb, 2),
    ('experience', 'Freelance Designer', 'End-to-end UI/UX and product design across multiple industries including EdTech, FinTech, and consumer apps.', '{"company": "Freelance", "start_date": "2021-01", "end_date": null, "location": "India"}'::jsonb, 3)
  `

  console.log('About data updated ✓')

  /* ── 5. Verify final state ────────────────────────────────── */
  const finalPosts = await sql`SELECT title, slug, is_published FROM blog_posts ORDER BY published_at DESC`
  console.log(`\nFinal blog posts (${finalPosts.length} total):`)
  finalPosts.forEach(p => console.log(` • [${p.is_published ? '✓' : '✗'}] "${p.title}"`))

  const finalAbout = await sql`SELECT section, title, content FROM about_info ORDER BY section, display_order`
  console.log(`\nFinal about info (${finalAbout.length} rows):`)
  finalAbout.forEach(a => console.log(` • [${a.section}] ${a.title}`))

  await sql.end()
  console.log('\n=== Done ===')
}

main().catch(e => { console.error(e); process.exit(1) })
