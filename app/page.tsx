// Cache home page output for 60s — DB data rarely changes in real-time
export const revalidate = 60

import { fetchSiteContentGroup } from '@/lib/data/siteContent'
import { fetchProjects } from '@/lib/data/projects'
import { fetchAboutSection } from '@/lib/data/about'
import { fetchPosts } from '@/lib/data/posts'
import HeroSection from '@/components/home/HeroSection'
import IntroPanels from '@/components/home/IntroPanels'
import WorkPreview from '@/components/home/WorkPreview'
import AboutTeaser from '@/components/home/AboutTeaser'
import BlogTeaser from '@/components/home/BlogTeaser'
import WorkedWith from '@/components/home/WorkedWith'
import ContactCTA from '@/components/home/ContactCTA'

const HERO_DEFAULTS = {
  eyebrow: 'PRODUCT DESIGNER & CREATIVE DEVELOPER',
  subtitle: 'Strategy-first design, built for the real world.',
  badge: 'Available for work',
}

export default async function HomePage() {
  // Parallel data fetching
  const [hero, featuredProjects, bioData, recentPosts] = await Promise.all([
    fetchSiteContentGroup('hero').catch(() => ({} as Record<string, string>)),
    fetchProjects({ featured: true }).catch(() => []),
    fetchAboutSection('bio').catch(() => []),
    fetchPosts({ limit: 3 }).catch(() => []),
  ])

  const eyebrow = hero.eyebrow || HERO_DEFAULTS.eyebrow
  const subtitle = hero.subtitle || HERO_DEFAULTS.subtitle
  const badge = hero.badge || HERO_DEFAULTS.badge

  return (
    <main>
      <HeroSection eyebrow={eyebrow} subtitle={subtitle} badge={badge} />
      <div className="tone-b"><IntroPanels /></div>
      <div className="tone-a"><WorkedWith /></div>
      <div className="tone-b"><WorkPreview projects={featuredProjects.slice(0, 4)} /></div>
      <div className="tone-a"><AboutTeaser bio={bioData[0] ?? null} /></div>
      <div className="tone-b"><BlogTeaser posts={recentPosts} /></div>
      <div className="tone-a"><ContactCTA /></div>
    </main>
  )
}
