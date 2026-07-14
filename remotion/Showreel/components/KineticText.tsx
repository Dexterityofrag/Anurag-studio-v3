import React from 'react'
import { interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from 'remotion'

// Long expo-out ease used across the reel for the Apple-style settle
export const expoOut = Easing.out(Easing.exp)

type KineticTextProps = {
  text: string
  delay?: number
  /** frames between each character's entrance */
  stagger?: number
  style?: React.CSSProperties
  charStyle?: (char: string, index: number) => React.CSSProperties
  /** px the characters travel up from */
  rise?: number
}

// Per-character spring reveal: rises, settles, no overshoot wobble
export const KineticText: React.FC<KineticTextProps> = ({
  text,
  delay = 0,
  stagger = 2,
  style,
  charStyle,
  rise = 90,
}) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const chars = Array.from(text)
  return (
    <div style={{ display: 'flex', overflow: 'hidden', ...style }}>
      {chars.map((char, i) => {
        const progress = spring({
          frame: frame - delay - i * stagger,
          fps,
          config: { damping: 200, stiffness: 80, mass: 0.9 },
        })
        const y = interpolate(progress, [0, 1], [rise, 0])
        const opacity = interpolate(progress, [0, 0.4], [0, 1], {
          extrapolateRight: 'clamp',
        })
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              whiteSpace: 'pre',
              transform: `translateY(${y}px)`,
              opacity,
              ...(charStyle ? charStyle(char, i) : undefined),
            }}
          >
            {char}
          </span>
        )
      })}
    </div>
  )
}

type FadeUpProps = {
  children: React.ReactNode
  delay?: number
  duration?: number
  distance?: number
  style?: React.CSSProperties
}

// Whole-block fade + rise with expo-out, for sub-lines and captions
export const FadeUp: React.FC<FadeUpProps> = ({
  children,
  delay = 0,
  duration = 30,
  distance = 40,
  style,
}) => {
  const frame = useCurrentFrame()
  const t = interpolate(frame, [delay, delay + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: expoOut,
  })
  return (
    <div
      style={{
        transform: `translateY(${(1 - t) * distance}px)`,
        opacity: t,
        ...style,
      }}
    >
      {children}
    </div>
  )
}
