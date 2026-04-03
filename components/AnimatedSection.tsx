'use client'

import { useRef, type ReactNode } from 'react'
import { useScrollReveal } from '@/hooks/useScrollReveal'

interface AnimatedSectionProps {
    children: ReactNode
    className?: string
    y?: number
    delay?: number
}

export default function AnimatedSection({
    children,
    className,
    y = 60,
    delay = 0,
}: AnimatedSectionProps) {
    const ref = useRef<HTMLDivElement>(null)
    useScrollReveal(ref, { y, delay })

    return (
        <div ref={ref} className={className}>
            {children}
        </div>
    )
}
