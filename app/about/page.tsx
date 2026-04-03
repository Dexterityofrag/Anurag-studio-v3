import type { Metadata } from 'next'
import AboutPage from '@/components/about/AboutPage'
import { fetchAboutSection } from '@/lib/data/about'

export const metadata: Metadata = {
    title: 'About | Anurag',
    description:
        'Product designer crafting thoughtful digital experiences through strategy, systems, and storytelling. Based in India.',
    openGraph: {
        title: 'About | Anurag Adhikari',
        description:
            'Product designer crafting thoughtful digital experiences through strategy, systems, and storytelling.',
    },
    twitter: { card: 'summary_large_image' },
}

export default async function AboutPageRoute() {
    const bioRows = await fetchAboutSection('bio').catch(() => [])
    const bio1 = bioRows[0]?.content ?? null
    const bio2 = bioRows[1]?.content ?? null
    return <AboutPage bio1={bio1} bio2={bio2} />
}
