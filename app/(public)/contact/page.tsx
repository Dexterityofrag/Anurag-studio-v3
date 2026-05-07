import type { Metadata } from 'next'
import ContactSection from '@/components/contact/ContactSection'
import { fetchSiteContent } from '@/lib/data/siteContent'
import { CV_URL } from '@/lib/constants'

export const metadata: Metadata = {
    title: 'Contact',
    description:
        'Get in touch with Anurag for freelance projects, collaborations, or full-time opportunities.',
    openGraph: {
        title: 'Contact | Anurag',
        description: 'Get in touch for freelance, collaborations, or full-time roles.',
    },
    twitter: { card: 'summary_large_image' },
}

export default async function ContactPage() {
    const cvUrl = await fetchSiteContent('settings.cvUrl').catch(() => null)
    return <ContactSection cvUrl={cvUrl ?? CV_URL} />
}
