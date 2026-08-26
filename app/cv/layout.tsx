import type { Metadata } from 'next'
import './cv.css'

/* These pages carry a phone number, so they stay out of search
   results and out of any crawler that respects the directive. */
export const metadata: Metadata = {
    title: 'Anurag Adhikari, CV',
    robots: {
        index: false,
        follow: false,
        nocache: true,
        googleBot: { index: false, follow: false },
    },
}

export default function CvLayout({ children }: { children: React.ReactNode }) {
    return children
}
