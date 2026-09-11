import type { Metadata } from 'next'
import WaitlistForm from '@/components/waitlist/WaitlistForm'

export const metadata: Metadata = {
    title: 'Kharchaaaa, waitlist',
    description:
        'Kharchaaaa is invite only. Leave an email and you will get a code when there is room.',
    openGraph: {
        title: 'Kharchaaaa, waitlist | Anurag',
        description: 'An expense book you type into. Invite only, for now.',
    },
    twitter: { card: 'summary_large_image' },
    // A waitlist page has nothing to offer a search result, and an indexed one
    // collects bots rather than people.
    robots: { index: false, follow: true },
}

export default function WaitlistPage() {
    return <WaitlistForm />
}
