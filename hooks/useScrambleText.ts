'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
const CYCLES = 8
const CYCLE_MS = 30

export function useScrambleText(target: string, trigger: boolean) {
    const [display, setDisplay] = useState(target)
    const frameRef = useRef<ReturnType<typeof setInterval> | null>(null)

    const scramble = useCallback(() => {
        if (frameRef.current) clearInterval(frameRef.current)

        const len = target.length
        const resolved = new Array(len).fill(false)
        const counters = new Array(len).fill(0)
        const result = target.split('')

        frameRef.current = setInterval(() => {
            let allDone = true

            for (let i = 0; i < len; i++) {
                if (resolved[i]) continue

                // Each char waits for its stagger offset (i * 1 cycle)
                const offset = i
                if (counters[i] < offset) {
                    counters[i]++
                    allDone = false
                    continue
                }

                const cyclesDone = counters[i] - offset
                if (cyclesDone < CYCLES) {
                    // Show random character
                    result[i] = target[i] === ' '
                        ? ' '
                        : CHARS[Math.floor(Math.random() * CHARS.length)]
                    counters[i]++
                    allDone = false
                } else {
                    // Resolve to real character
                    result[i] = target[i]
                    resolved[i] = true
                }
            }

            setDisplay(result.join(''))

            if (allDone && frameRef.current) {
                clearInterval(frameRef.current)
                frameRef.current = null
            }
        }, CYCLE_MS)
    }, [target])

    useEffect(() => {
        if (trigger) {
            scramble()
        }
        return () => {
            if (frameRef.current) clearInterval(frameRef.current)
        }
    }, [trigger, scramble])

    // Reset text when target changes without trigger
    useEffect(() => {
        if (!trigger) setDisplay(target)
    }, [target, trigger])

    return display
}
