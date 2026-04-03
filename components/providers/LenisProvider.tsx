'use client'

import {
    createContext,
    useContext,
    useEffect,
    useRef,
    type ReactNode,
} from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// ─── CONTEXT ─────────────────────────────────────────────────────
const LenisContext = createContext<Lenis | null>(null)

export function useLenis() {
    return useContext(LenisContext)
}

// ─── PROVIDER ────────────────────────────────────────────────────
export default function LenisProvider({ children }: { children: ReactNode }) {
    const lenisRef = useRef<Lenis | null>(null)

    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            smoothWheel: true,
        })

        lenisRef.current = lenis

        // Sync Lenis with GSAP ticker
        const tickerCallback = (time: number) => {
            lenis.raf(time * 1000)
        }
        gsap.ticker.add(tickerCallback)

        // Disable GSAP's internal lag smoothing so Lenis stays in control
        gsap.ticker.lagSmoothing(0)

        // Refresh ScrollTrigger on every Lenis scroll event
        lenis.on('scroll', ScrollTrigger.update)

        // Initial refresh after mount
        ScrollTrigger.refresh()

        return () => {
            gsap.ticker.remove(tickerCallback)
            lenis.off('scroll', ScrollTrigger.update)
            lenis.destroy()
            lenisRef.current = null
        }
    }, [])

    return (
        <LenisContext.Provider value={lenisRef.current}>
            {children}
        </LenisContext.Provider>
    )
}
