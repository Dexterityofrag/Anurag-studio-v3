export const revalidate = 60

import type { Metadata } from 'next'
import AboutPage, { type ExperienceEntry, type FoundationEntry, type PhilosophyEntry, type AboutStatEntry } from '@/components/about/AboutPage'
import { fetchAboutSection } from '@/lib/data/about'
import { getCertifications } from '@/app/actions/certifications'
import { fetchSiteContentGroup } from '@/lib/data/siteContent'

const aboutPersonSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": "https://anurag.studio/#person",
    "name": "Anurag Adhikari",
    "url": "https://anurag.studio",
    "jobTitle": "Designer & Developer",
    "description": "Product designer crafting thoughtful digital experiences through strategy, systems, and storytelling. Based in India.",
    "image": "https://anurag.studio/portrait.jpg",
    "sameAs": [
        "https://linkedin.com/in/dexterityofrag",
        "https://github.com/Dexterityofrag"
    ]
};

export const metadata: Metadata = {
    title: 'About Anurag Adhikari',
    description:
        'Anurag Adhikari is a product designer crafting thoughtful digital experiences through strategy, systems, and storytelling. Based in India.',
    openGraph: {
        title: 'About Anurag Adhikari | Designer & Developer',
        description:
            'Anurag Adhikari is a product designer crafting thoughtful digital experiences through strategy, systems, and storytelling.',
        images: [{ url: '/portrait.jpg', alt: 'Anurag Adhikari' }],
    },
    twitter: { card: 'summary_large_image', images: ['/portrait.jpg'] },
}

export default async function AboutPageRoute() {
    const [bioRows, certsRaw, experienceRows, aboutPageContent, aboutStatsContent] = await Promise.all([
        fetchAboutSection('bio').catch(() => []),
        getCertifications().catch(() => []),
        fetchAboutSection('experience').catch(() => []),
        fetchSiteContentGroup('about_page').catch(() => ({} as Record<string, string>)),
        fetchSiteContentGroup('about_stats').catch(() => ({} as Record<string, string>)),
    ])

    const bio1 = bioRows[0]?.content ?? null
    const bio2 = bioRows[1]?.content ?? null
    const certifications = certsRaw.map(c => ({
        id: c.id,
        name: c.name,
        issuer: c.issuer,
        logoUrl: c.logoUrl ?? null,
        verifyUrl: c.verifyUrl ?? null,
    }))

    // Map aboutInfo experience rows to ExperienceEntry
    const experience: ExperienceEntry[] = experienceRows.map(row => ({
        range: [row.metadata?.start_date, row.metadata?.end_date]
            .filter(Boolean).join(' – ') || '',
        role:    row.title    ?? '',
        company: row.metadata?.company ?? '',
        desc:    row.content  ?? '',
    })).filter(e => e.role)

    // Map siteContent about_page group to section props
    const philosophy: PhilosophyEntry[] = [1, 2].map(n => ({
        indexLabel: aboutPageContent[`philosophy${n}.index`] || undefined,
        title:      aboutPageContent[`philosophy${n}.title`] || '',
        subtitle:   aboutPageContent[`philosophy${n}.subtitle`] || undefined,
        body:       aboutPageContent[`philosophy${n}.body`]  || '',
    })).filter(p => p.title && p.body)

    const foundations: FoundationEntry[] = [1, 2, 3].map(n => ({
        num:   aboutPageContent[`foundation${n}.num`]   || undefined,
        title: aboutPageContent[`foundation${n}.title`] || '',
        body:  aboutPageContent[`foundation${n}.body`]  || '',
    })).filter(f => f.title && f.body)

    // about_stats group from Stats admin page (takes priority over about_page group)
    const aboutStats: AboutStatEntry[] = [1, 2, 3].map(n => ({
        display: aboutStatsContent[`item${n}.display`] || aboutPageContent[`stats.item${n}.display`] || '',
        label:   aboutStatsContent[`item${n}.label`]   || aboutPageContent[`stats.item${n}.label`]   || '',
    })).filter(s => s.display && s.label)

    const offscreenTitle = aboutPageContent['offscreen.title'] || undefined
    const offscreenBody  = aboutPageContent['offscreen.body']  || undefined

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutPersonSchema) }}
            />
            <AboutPage
                bio1={bio1}
                bio2={bio2}
                certifications={certifications}
                experience={experience.length ? experience : undefined}
                offscreenTitle={offscreenTitle}
                offscreenBody={offscreenBody}
                aboutStats={aboutStats.length ? aboutStats : undefined}
                philosophy={philosophy.length ? philosophy : undefined}
                foundations={foundations.length ? foundations : undefined}
            />
        </>
    )
}
