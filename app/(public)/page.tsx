// Cache home page output for 60s — DB data rarely changes in real-time
export const revalidate = 60

import { fetchSiteContentGroup, fetchSiteContent } from '@/lib/data/siteContent'
import { fetchProjects } from '@/lib/data/projects'
import { fetchAboutSection } from '@/lib/data/about'
import { fetchPosts } from '@/lib/data/posts'
import { getPartners } from '@/app/actions/partners'
import { fetchSocialLinks } from '@/lib/data/social'
import HeroSection from '@/components/home/HeroSection'
import IntroPanels, { type PanelProp } from '@/components/home/IntroPanels'
import WorkPreview from '@/components/home/WorkPreview'
import AboutTeaser from '@/components/home/AboutTeaser'
import BlogTeaser from '@/components/home/BlogTeaser'
import WorkedWith from '@/components/home/WorkedWith'
import StatsStrip, { type StatProp } from '@/components/home/StatsStrip'
import ContactCTA from '@/components/home/ContactCTA'

const HERO_DEFAULTS = {
  eyebrow: 'PRODUCT DESIGNER & CREATIVE DEVELOPER',
  subtitle: 'Strategy-first design, built for the real world.',
  badge: 'Available for work',
}

export default async function HomePage() {
  // Parallel data fetching
  const [hero, featuredProjects, bioData, recentPosts, partnersData, showreelUrl, socialLinks, introPanelsContent, homeStatsContent, aboutTeaserContent, contactCtaContent] = await Promise.all([
    fetchSiteContentGroup('hero').catch(() => ({} as Record<string, string>)),
    fetchProjects({ featured: true }).catch(() => []),
    fetchAboutSection('bio').catch(() => []),
    fetchPosts({ limit: 3 }).catch(() => []),
    getPartners().catch(() => [] as Awaited<ReturnType<typeof getPartners>>),
    fetchSiteContent('settings.showreelUrl').catch(() => null),
    fetchSocialLinks().catch(() => []),
    fetchSiteContentGroup('intro_panels').catch(() => ({} as Record<string, string>)),
    fetchSiteContentGroup('home_stats').catch(() => ({} as Record<string, string>)),
    fetchSiteContentGroup('about_teaser').catch(() => ({} as Record<string, string>)),
    fetchSiteContentGroup('contact_cta').catch(() => ({} as Record<string, string>)),
  ])

  const eyebrow = hero.eyebrow || HERO_DEFAULTS.eyebrow
  const subtitle = hero.subtitle || HERO_DEFAULTS.subtitle
  const badge = hero.badge || HERO_DEFAULTS.badge

  // Build panels array from DB (falls back to defaults inside IntroPanels if empty)
  const panels: PanelProp[] = [1, 2, 3]
    .map(n => ({
      body: introPanelsContent[`panel${n}.body`] || '',
      em:   introPanelsContent[`panel${n}.em`]   || '',
      sub:  introPanelsContent[`panel${n}.sub`]  || '',
    }))
    .filter(p => p.body && p.em)

  // Build stats array from DB
  const homeStats: StatProp[] = [1, 2, 3, 4]
    .map(n => ({
      display: homeStatsContent[`item${n}.display`] || '',
      label:   homeStatsContent[`item${n}.label`]   || '',
    }))
    .filter(s => s.display && s.label)

  const aboutTeaserTagline = aboutTeaserContent['tagline'] || undefined
  const ctaHeading = contactCtaContent['heading'] || undefined
  const ctaEmail   = contactCtaContent['email']   || undefined

  return (
    <main>
      <HeroSection eyebrow={eyebrow} subtitle={subtitle} badge={badge} />
      <div className="tone-b"><IntroPanels panels={panels.length ? panels : undefined} /></div>
      <div className="tone-a"><WorkedWith partners={partnersData} /></div>
      <div className="tone-b"><StatsStrip stats={homeStats.length ? homeStats : undefined} /></div>
      <div className="tone-a"><WorkPreview projects={featuredProjects.slice(0, 4)} videoUrl={showreelUrl ?? ''} /></div>
      <div className="tone-a"><AboutTeaser bio={bioData[0] ?? null} tagline={aboutTeaserTagline} /></div>
      <div className="tone-b"><BlogTeaser posts={recentPosts} /></div>
      <div className="tone-a"><ContactCTA socialLinks={socialLinks} heading={ctaHeading} email={ctaEmail} /></div>
    </main>
  )
}
