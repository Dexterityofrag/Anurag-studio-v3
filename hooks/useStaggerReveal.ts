'use client'

import { useEffect, type RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

interface StaggerRevealOptions {
    selector?: string
    y?: number
    opacity?: number
    stagger?: number
    duration?: number
    ease?: string
    start?: string
}

const DEFAULTS: Required<StaggerRevealOptions> = {
    selector: '.stagger-item',
    y: 40,
    opacity: 0,
    stagger: 0.1,
    duration: 0.7,
    ease: 'power3.out',
    start: 'top 85%',
}

export function useStaggerReveal(
    containerRef: RefObject<HTMLElement | null>,
    options?: StaggerRevealOptions
) {
    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        const opts = { ...DEFAULTS, ...options }
        const items = container.querySelectorAll(opts.selector)
        if (items.length === 0) return

        const ctx = gsap.context(() => {
            gsap.from(items, {
                y: opts.y,
                opacity: opts.opacity,
                duration: opts.duration,
                ease: opts.ease,
                stagger: opts.stagger,
                scrollTrigger: {
                    trigger: container,
                    start: opts.start,
                    toggleActions: 'play none none none',
                },
            })
        })

        return () => ctx.revert()
    }, [containerRef, options])
}
