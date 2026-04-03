import type { Metadata } from 'next'
import ContactSection from '@/components/contact/ContactSection'

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

export default function ContactPage() {
    return <ContactSection />
}
