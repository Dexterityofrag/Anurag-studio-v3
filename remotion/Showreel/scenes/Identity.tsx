import React from 'react'
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion'
import { theme, outlineText } from '../theme'
import { KineticText, FadeUp } from '../components/KineticText'
import { MonoLabel } from '../components/Overlays'

const TYPED = 'anurag.studio'
const TYPE_START = 10
const TYPE_SPEED = 2.5 // frames per character
const NAME_AT = 55

// Scene 1 (0-5s): mono cursor types the domain, then the name slams in,
// filled + outlined split like the site's SELECTED WORK header.
export const Identity: React.FC = () => {
  const frame = useCurrentFrame()

  const typedCount = Math.min(
    TYPED.length,
    Math.max(0, Math.floor((frame - TYPE_START) / TYPE_SPEED))
  )
  const cursorOn = Math.floor(frame / 16) % 2 === 0
  // typed line drifts up + dims once the name takes over
  const typedShift = interpolate(frame, [NAME_AT, NAME_AT + 25], [0, -60], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const typedOpacity = interpolate(frame, [NAME_AT, NAME_AT + 25], [1, 0.35], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  return (
    <AbsoluteFill
      style={{
        backgroundColor: theme.bg,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          fontFamily: theme.fontMono,
          fontSize: 30,
          letterSpacing: '0.3em',
          color: theme.accent,
          transform: `translateY(${typedShift}px)`,
          opacity: typedOpacity,
          marginBottom: 48,
        }}
      >
        {TYPED.slice(0, typedCount)}
        <span style={{ opacity: cursorOn ? 1 : 0 }}>_</span>
      </div>

      {frame >= NAME_AT && (
        <div style={{ display: 'flex', gap: 64 }}>
          <KineticText
            text="ANURAG"
            delay={NAME_AT}
            stagger={3}
            style={{
              fontFamily: theme.fontDisplay,
              fontWeight: 700,
              fontSize: 190,
              letterSpacing: '-0.02em',
              color: theme.fg,
            }}
          />
          <KineticText
            text="ADHIKARI"
            delay={NAME_AT + 10}
            stagger={3}
            style={{
              fontFamily: theme.fontDisplay,
              fontWeight: 700,
              fontSize: 190,
              letterSpacing: '-0.02em',
            }}
            charStyle={() => outlineText('rgba(240, 237, 232, 0.55)', 2)}
          />
        </div>
      )}

      <FadeUp delay={NAME_AT + 40} style={{ marginTop: 40 }}>
        <MonoLabel>Product Designer (Developer)</MonoLabel>
      </FadeUp>
    </AbsoluteFill>
  )
}
