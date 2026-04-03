'use client'

import { useEffect, useRef, type RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

interface ScrollRevealOptions {
    y?: number
    x?: number
    opacity?: number
    duration?: number
    ease?: string
    delay?: number
    start?: string
}

const DEFAULTS: Required<ScrollRevealOptions> = {
    y: 60,
    x: 0,
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out',
    delay: 0,
    start: 'top 85%',
}

export function useScrollReveal(
    ref: RefObject<HTMLElement | null>,
    options?: ScrollRevealOptions
) {
    const stRef = useRef<ScrollTrigger | null>(null)

    useEffect(() => {
        const el = ref.current
        if (!el) return

        const opts = { ...DEFAULTS, ...options }

        const ctx = gsap.context(() => {
            gsap.from(el, {
                y: opts.y,
                x: opts.x,
                opacity: opts.opacity,
                duration: opts.duration,
                ease: opts.ease,
                delay: opts.delay,
                scrollTrigger: {
                    trigger: el,
                    start: opts.start,
                    toggleActions: 'play none none none',
                },
            })
        })

        return () => ctx.revert()
    }, [ref, options])

    return stRef
}
