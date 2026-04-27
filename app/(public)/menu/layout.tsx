import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Menu',
    description: 'Navigate the site, jump to a section, or reach out.',
    openGraph: {
        title: 'Menu | Anurag',
        description: 'Navigate the site, jump to a section, or reach out.',
    },
}

export default function MenuLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}
