'use client'

import { useState, useEffect } from 'react'

const css = /* css */ `
.reading-bar {
  position: fixed;
  top: 0;
  left: 0;
  height: 2px;
  background: #00FF94;
  z-index: 9999;
  will-change: width;
  transition: opacity 0.3s ease;
}
.reading-bar--hidden {
  opacity: 0;
}
`

export default function ReadingProgress() {
    const [width, setWidth] = useState(0)
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        let rafId: number

        const onScroll = () => {
            if (!rafId) {
                rafId = requestAnimationFrame(() => {
                    const scrollY = window.scrollY
                    const docHeight = document.body.scrollHeight - window.innerHeight
                    if (docHeight > 0) {
                        setWidth((scrollY / docHeight) * 100)
                        setVisible(scrollY > 100)
                    }
                    rafId = 0
                })
            }
        }

        window.addEventListener('scroll', onScroll, { passive: true })

        // Seed the initial value through the same rAF path rather than setting
        // state synchronously in the effect body, which triggers a cascading
        // render. One frame of delay here is imperceptible.
        onScroll()
        return () => {
            window.removeEventListener('scroll', onScroll)
            if (rafId) cancelAnimationFrame(rafId)
        }
    }, [])

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: css }} />
            <div
                className={`reading-bar${visible ? '' : ' reading-bar--hidden'}`}
                style={{ width: `${width}%` }}
                role="progressbar"
                aria-valuenow={Math.round(width)}
                aria-valuemin={0}
                aria-valuemax={100}
            />
        </>
    )
}
