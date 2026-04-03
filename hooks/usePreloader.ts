'use client'

import { useState, useEffect, useCallback } from 'react'

const SESSION_KEY = 'preloader-shown'

export function usePreloader() {
    const [loading, setLoading] = useState(true)
    const [progress, setProgress] = useState(0)

    const finish = useCallback(() => {
        try {
            sessionStorage.setItem(SESSION_KEY, '1')
        } catch { /* SSR / incognito */ }
        // 500ms grace after 100% before hiding
        setTimeout(() => setLoading(false), 500)
    }, [])

    useEffect(() => {
        // If preloader was already shown this session, skip it
        try {
            if (sessionStorage.getItem(SESSION_KEY) === '1') {
                setLoading(false)
                setProgress(100)
                return
            }
        } catch { /* SSR */ }

        // Simulate progress
        const steps = [
            { target: 30, delay: 200 },
            { target: 55, delay: 500 },
            { target: 75, delay: 800 },
            { target: 90, delay: 1200 },
            { target: 100, delay: 1600 },
        ]

        const timers: ReturnType<typeof setTimeout>[] = []
        for (const step of steps) {
            timers.push(
                setTimeout(() => {
                    setProgress(step.target)
                    if (step.target === 100) finish()
                }, step.delay)
            )
        }

        return () => timers.forEach(clearTimeout)
    }, [finish])

    return { loading, progress }
}
