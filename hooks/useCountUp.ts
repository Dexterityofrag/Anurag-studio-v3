'use client'

import { useEffect, useRef, useState, type RefObject } from 'react'
import gsap from 'gsap'

interface UseCountUpOptions {
    duration?: number
    startOnVisible?: boolean
}

export function useCountUp(
    targetValue: number,
    ref: RefObject<HTMLElement | null>,
    options?: UseCountUpOptions
): number {
    const { duration = 1.5, startOnVisible = true } = options ?? {}
    const [current, setCurrent] = useState(0)
    const hasRun = useRef(false)

    useEffect(() => {
        const el = ref.current
        if (!el || hasRun.current) return

        const animate = () => {
            if (hasRun.current) return
            hasRun.current = true

            const obj = { val: 0 }
            gsap.to(obj, {
                val: targetValue,
                duration,
                ease: 'power2.out',
                onUpdate: () => setCurrent(Math.round(obj.val)),
            })
        }

        if (!startOnVisible) {
            animate()
            return
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    animate()
                    observer.disconnect()
                }
            },
            { threshold: 0.3 }
        )

        observer.observe(el)
        return () => observer.disconnect()
    }, [targetValue, duration, startOnVisible, ref])

    return current
}
