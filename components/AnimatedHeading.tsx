'use client'

import { useRef, useEffect, type ElementType } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

interface AnimatedHeadingProps {
    text: string
    tag?: 'h1' | 'h2' | 'h3'
    className?: string
    accentLast?: boolean
}

const css = /* css */ `
.anim-heading {
  overflow: hidden;
}
.anim-heading .char {
  display: inline-block;
  clip-path: inset(0 0 100% 0);
  will-change: clip-path;
}
.anim-heading .whitespace {
  display: inline-block;
  width: 0.25em;
}
.anim-heading__accent-word .char {
  color: var(--accent, #FF4D00);
}
`

export default function AnimatedHeading({
    text,
    tag: Tag = 'h1',
    className = '',
    accentLast = false,
}: AnimatedHeadingProps) {
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const el = containerRef.current
        if (!el) return

        const chars = el.querySelectorAll('.char')
        if (chars.length === 0) return

        const ctx = gsap.context(() => {
            gsap.to(chars, {
                clipPath: 'inset(0 0 0% 0)',
                duration: 0.8,
                stagger: 0.02,
                ease: 'power4.out',
                scrollTrigger: {
                    trigger: el,
                    start: 'top 85%',
                    toggleActions: 'play none none none',
                },
            })
        })

        return () => ctx.revert()
    }, [text])

    // Split into words, then chars - wrap each word in a non-breaking span
    // so individual characters never break mid-word across lines
    const words = text.split(' ')
    const rendered = words.map((word, wi) => {
        const isLast = wi === words.length - 1
        return (
            <span
                key={wi}
                style={{ display: 'inline-block', whiteSpace: 'nowrap' }}
                className={accentLast && isLast ? 'anim-heading__accent-word' : undefined}
            >
                {word.split('').map((ch, ci) => (
                    <span key={ci} className="char">{ch}</span>
                ))}
                {!isLast && <span className="whitespace" />}
            </span>
        )
    })

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: css }} />
            <Tag ref={containerRef as React.RefObject<HTMLHeadingElement>} className={`anim-heading ${className}`.trim()}>
                {rendered}
            </Tag>
        </>
    )
}
