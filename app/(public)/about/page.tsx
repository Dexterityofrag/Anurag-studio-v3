export const revalidate = 60

import type { Metadata } from 'next'
import AboutPage from '@/components/about/AboutPage'
import { fetchAboutSection } from '@/lib/data/about'
import { getCertifications } from '@/app/actions/certifications'

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
    const [bioRows, certsRaw] = await Promise.all([
        fetchAboutSection('bio').catch(() => []),
        getCertifications().catch(() => []),
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
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutPersonSchema) }}
            />
            <AboutPage bio1={bio1} bio2={bio2} certifications={certifications} />
        </>
    )
}
