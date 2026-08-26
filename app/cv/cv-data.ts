/**
 * Single source of truth for both CV documents.
 *
 * `ats/page.tsx` renders every field. `designed/page.tsx` renders the same data
 * clipped to one page via the `designedBullets` counts below. Nothing here is
 * duplicated in either page component, so the two documents cannot drift apart.
 *
 * Tailored for: Apple, Product Designer, ETS Insight (Role 200678614-0321).
 */

export interface ContactLink {
    /** Text shown on the page. Kept as a bare visible URL so it survives an ATS
     *  that strips the link layer, per ATS formatting guidance. */
    label: string
    href: string
}

export interface ExperienceEntry {
    role: string
    org: string
    location: string
    dates: string
    bullets: string[]
    /** How many bullets the one page designed CV keeps. */
    designedBullets: number
}

export interface ProjectEntry {
    name: string
    meta: string
    description: string
    link?: ContactLink
    /** Dropped from the designed one pager when false. */
    inDesigned: boolean
}

export interface EducationEntry {
    qualification: string
    institution: string
    dates: string
    /** Schooling is kept for the ATS document only. */
    inDesigned: boolean
}

export interface CertificationEntry {
    name: string
    issuer: string
    date: string
}

export const cv = {
    name: 'Anurag Adhikari',
    title: 'Product Designer, UI/UX',
    location: 'Bengaluru, India',
    phone: '+91 79801 05391',
    email: 'anuragprivate2002@gmail.com',

    links: [
        { label: 'anurag.studio', href: 'https://anurag.studio' },
        { label: 'linkedin.com/in/dexterityofrag', href: 'https://linkedin.com/in/dexterityofrag' },
        { label: 'behance.net/anuragadhikari5', href: 'https://behance.net/anuragadhikari5' },
        { label: 'github.com/Dexterityofrag', href: 'https://github.com/Dexterityofrag' },
    ] satisfies ContactLink[],

    /* ── Summary ──────────────────────────────────────────────────
       Written against the ETS Insight brief: dense data, enterprise
       users, prototyping in code, engineers as daily collaborators. */
    summary:
        'Product designer who turns dense, data-heavy systems into interfaces people can actually work in. ' +
        'Designed an enterprise AI platform end to end, from information architecture through design systems to ' +
        'dev-ready specs, covering an analytics dashboard, an ROI calculator, and conversational and voice interfaces. ' +
        'Prototypes in code rather than in static frames, shipping production React and Next.js against a PostgreSQL ' +
        'backend. Works closely with engineers, argues design decisions from user reasoning, and treats accessibility ' +
        'as a requirement rather than a pass at the end.',

    /* The one page designed CV cannot carry the full summary. Same
       claims, fewer words. */
    summaryShort:
        'Product designer who turns dense, data-heavy systems into interfaces people can actually work in. ' +
        'Designed an enterprise AI platform end to end, from information architecture to dev-ready specs, and ' +
        'prototypes in code rather than in static frames.',

    /* Ordered so the terms this team screens for land first.
       Rendered one per line in the ATS document: a wrapped pipe-separated
       paragraph splits phrases across lines ("Cross-" / "Functional"), and a
       parser that does not normalise newlines then fails to match them.
       US spelling on "Visualization" deliberately, to match the posting. */
    coreSkills: [
        'End-to-End Product Design',
        'User-Centered Design Process',
        'Enterprise and B2B SaaS Design',
        'Data Visualization and Dashboard Design',
        'Information Visualization and Data Storytelling',
        'Data-Driven Design',
        'Information Architecture',
        'User Research and Usability Testing',
        'Interactive Prototyping',
        'Design Systems and Component Libraries',
        'Interaction and Micro-Interaction Design',
        'Design Handoff and Documentation',
        'Design Rationale and Stakeholder Communication',
        'Cross-Functional Collaboration (Engineers, Product Managers, Data Teams)',
        'Accessibility and Inclusive Design (WCAG)',
    ],

    /* Condensed skills line for the one page designed CV. */
    coreSkillsShort: [
        'End-to-End Product Design',
        'Enterprise and B2B SaaS',
        'Data Visualization and Dashboards',
        'Design Systems',
        'User Research',
        'Interactive Prototyping',
        'Accessibility (WCAG)',
    ],

    experience: [
        {
            role: 'Product Designer',
            org: 'Independent Practice',
            location: 'Bengaluru, India',
            dates: 'Apr 2026 - Present',
            designedBullets: 2,
            bullets: [
                'Designing website and mobile experiences across three luxury fashion brands for a retail client.',
                'Building a shared visual language and component library so the three products stay consistent while keeping distinct brand voices.',
                'Designing and building production front-end work in React and Next.js alongside the design deliverables.',
            ],
        },
        {
            role: 'Product Design Consultant',
            org: 'Evolusis',
            location: 'Remote',
            dates: 'Jan 2026 - Apr 2026',
            designedBullets: 4,
            bullets: [
                'Owned design across every surface of an enterprise AI platform in 2.5 months: analytics dashboard, voice coach, chat interface, ROI calculator, marketing site, and brand foundations.',
                'Designed the analytics dashboard around a clear metric hierarchy and progressive disclosure, so users could read status at a glance and drill into detail without losing context.',
                'Designed an ROI calculator that translated input assumptions into a narrative a buyer could follow, used directly in enterprise sales conversations.',
                'Audited the existing product, rebuilt the information architecture from scratch, and locked user flows against prior user research before any visual design began.',
                'Built a component library with variants and interaction states so three separate product surfaces stayed consistent under a compressed timeline.',
                'Produced dev-ready specs and worked with the founder and engineering team on responsive behaviour, interaction states, and launch QA.',
                'Defended design decisions with user reasoning against conflicting stakeholder input, including keeping leaderboards private and team-based rather than public, to avoid reintroducing the social pressure the product exists to remove.',
                'Redesign shipped and supported enterprise client wins with Reliance (Oil and Gas) and Kotak Securities.',
            ],
        },
        {
            role: 'Product Designer',
            org: 'Stealth Startup (Quick Commerce)',
            location: 'Remote',
            dates: 'Oct 2025 - Jan 2026',
            designedBullets: 2,
            bullets: [
                'Mapped core user flows for browse, search, add to cart, delivery slot selection, and order placement.',
                'Designed high-contrast, thumb-reachable mobile UI for fast decisions on dense, information-heavy screens.',
                'Established design tokens, components, and variant states to support rapid iteration.',
                'Planned rider and vendor onboarding screens to support early operations.',
            ],
        },
        {
            role: 'Graphic Design Intern',
            org: 'IGP (Indian Gifts Portal)',
            location: 'Mumbai, India',
            dates: 'Jun 2023 - Aug 2023',
            designedBullets: 1,
            bullets: [
                'Designed marketing materials including social media creatives, banners, and landing pages.',
                'Contributed UI/UX improvements to the e-commerce platform to increase user engagement.',
                'Collaborated with cross-functional teams to align branding with business objectives.',
            ],
        },
    ] satisfies ExperienceEntry[],

    /* Carries the "prototypes in code" and "works with data" evidence that a
       design-only history cannot demonstrate on its own. */
    projects: [
        {
            name: 'anurag.studio',
            meta: 'Designer and Developer, ongoing',
            description:
                'Designed and built the full portfolio platform end to end: Next.js 15, React 19, PostgreSQL with Drizzle ORM, ' +
                'authentication, S3-compatible media storage, and a custom admin CMS for projects, writing, and site content. ' +
                'Wrote the database schema and queries.',
            link: { label: 'anurag.studio', href: 'https://anurag.studio' },
            inDesigned: true,
        },
        {
            name: 'Programmatic Showreel',
            meta: 'Motion, in code',
            description:
                'Built a code-driven motion reel in Remotion, composing timing, transitions, and audio in React rather than ' +
                'in a timeline editor, so the reel rebuilds itself whenever the underlying work changes.',
            inDesigned: true,
        },
        {
            name: 'Writing',
            meta: 'Medium, Bootcamp publication',
            description:
                'Essays on design systems, hardware, and AI-assisted design workflows, written to work through why a given ' +
                'design or engineering decision was made the way it was.',
            link: { label: 'medium.com/@Dexterityofrag', href: 'https://medium.com/@Dexterityofrag' },
            inDesigned: false,
        },
    ] satisfies ProjectEntry[],

    education: [
        {
            qualification: 'Bachelor of Design, Communication Design and Technology',
            institution: 'Pearl Academy, Mumbai',
            dates: 'Aug 2022 - 2026',
            inDesigned: true,
        },
        {
            qualification: 'ISC (Class 12), Commerce with Mathematics and Computer Science',
            institution: 'Adamas International School, Kolkata',
            dates: '2021',
            inDesigned: false,
        },
        {
            qualification: 'ICSE (Class 10)',
            institution: 'Adamas International School, Kolkata',
            dates: '2019',
            inDesigned: false,
        },
    ] satisfies EducationEntry[],

    certifications: [
        { name: 'Google UI/UX Design Certificate', issuer: 'Google', date: 'Oct 2025' },
        { name: 'Adobe Certified Professional, Graphics and Illustration (Illustrator)', issuer: 'Adobe', date: 'Apr 2026' },
        { name: 'Adobe Certified Professional, Digital Video (Premiere Pro)', issuer: 'Adobe', date: 'Sep 2025' },
    ] satisfies CertificationEntry[],

    /* Nothing claimed here that cannot be defended in a first round.
       No D3, Observable, Tableau, Python, or Sketch. */
    tools: [
        {
            group: 'Design',
            items: 'Figma, Figma Make, Framer, Spline, Adobe Creative Suite (Photoshop, Illustrator, Premiere Pro, After Effects), Miro, Notion',
        },
        {
            group: 'Build and Prototyping',
            items: 'HTML, CSS, JavaScript, React, Next.js, Three.js, p5.js, MediaPipe, Remotion, Git and GitHub, VS Code, Claude Code',
        },
        {
            group: 'Data',
            items: 'PostgreSQL, SQL, Drizzle ORM',
        },
    ],

    languages: 'English (Fluent), Hindi (Native), Bengali (Native)',
} as const

/** Contact line rendered as plain text, used by both documents. */
export const contactLine = [cv.location, cv.phone, cv.email].join('  |  ')

/**
 * Cover letter for the ETS Insight posting.
 *
 * Reuses the contact details on `cv` above so the three documents cannot drift.
 *
 * The opening deliberately does not lead with admiring Apple. ETS Insight
 * builds internal tools for manufacturing engineers, so the argument is about
 * understanding the operation underneath the data, which is the one instinct
 * that matters most for this particular team.
 *
 * Nothing here claims manufacturing or supply chain experience. The domain
 * interest is curiosity, evidenced by published writing, and reads that way.
 */
export const letter = {
    date: '19 August 2026',
    recipientLines: [
        'Apple ETS Insight Team',
        'Product Designer, Role Number 200678614-0321',
    ],
    salutation: 'Dear ETS Insight team,',

    paragraphs: [
        'When I was thirteen, I decided my father’s newly upgraded PC should look like Tony Stark’s JARVIS. I installed Rainmeter and every mod I could find, stacked them until the machine ran out of memory, and earned my first blue screen. So I opened the cabinet for the first time, to see what I was actually dealing with. The fix was simple once I knew it: boot into safe mode and uninstall. But every time I pressed the key, nothing happened. Fast boot was enabled, so the machine never paused long enough to hear me, and nothing on the screen ever said so.',

        'I have been chasing that kind of answer ever since: the setting nobody surfaced, the thing the system knew and never said out loud. Years later I found Jony Ive describing his need to understand not merely what a product does but how it works, all the way down to the mechanism, and it gave a name to a habit I already had. That is also, as far as I can tell, the work here. ETS Insight exists so engineers can see what a machine or a process is actually doing, instead of inferring it from the outside.',

        'At Evolusis I owned design across an enterprise AI platform in two and a half months: the dashboard, a voice coach, a chat interface, and an ROI calculator. I rebuilt the information architecture first, which in practice meant settling what belonged where before anyone drew a screen. The dashboard ran on a clear order of importance among the numbers, so the figure you needed most was the one you saw first, with the supporting detail one step away instead of crowding the view. The ROI calculator turned a page of assumptions into a story a buyer could follow. That work helped win Reliance Oil and Gas and Kotak Securities.',

        'I build as well as design. My portfolio, anurag.studio, is mine end to end, including the database behind it, because how the data is shaped turns out to be part of designing for it rather than something separate. I prototype in code instead of flat mockups, so engineers receive something that already behaves, and I direct AI tooling deliberately rather than lean on it. I would rather build for someone who lives inside a tool all day than for someone passing through, and Apple remains one of the few places where how a thing works and how it feels are argued as one decision. The 32-bit reinstall that followed my blue screen created an entirely new problem, but that is a longer story, and one I would happily tell you in person.',
    ],

    signoff: 'Warm regards,',
} as const
