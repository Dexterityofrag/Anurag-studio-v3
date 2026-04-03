'use client'

import { useState, useEffect, useRef } from 'react'

interface TypewriterProps {
    text: string
    speed?: number
    startDelay?: number
    className?: string
}

const css = /* css */ `
.typewriter-cursor {
  display: inline-block;
  width: 2px;
  height: 0.9em;
  background: var(--accent);
  margin-left: 2px;
  vertical-align: baseline;
  animation: tw-blink 0.8s step-end infinite;
}
@keyframes tw-blink {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0; }
}
`

export default function Typewriter({
    text,
    speed = 60,
    startDelay = 0,
    className = '',
}: TypewriterProps) {
    const [displayed, setDisplayed] = useState('')
    const idxRef = useRef(0)

    useEffect(() => {
        idxRef.current = 0
        setDisplayed('')

        const delayTimer = setTimeout(() => {
            const interval = setInterval(() => {
                idxRef.current++
                if (idxRef.current <= text.length) {
                    setDisplayed(text.slice(0, idxRef.current))
                } else {
                    clearInterval(interval)
                }
            }, speed)

            return () => clearInterval(interval)
        }, startDelay)

        return () => clearTimeout(delayTimer)
    }, [text, speed, startDelay])

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: css }} />
            <span className={className}>
                {displayed}
                <span className="typewriter-cursor" aria-hidden="true" />
            </span>
        </>
    )
}
