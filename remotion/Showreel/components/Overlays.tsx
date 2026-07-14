import React from 'react'
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion'
import { theme } from '../theme'

// Scanlines + vignette, echoing the fw-video-frame overlays in WorkPreview.tsx
export const Scanlines: React.FC = () => (
  <AbsoluteFill
    style={{
      backgroundImage:
        'repeating-linear-gradient(0deg, rgba(255,255,255,0.018) 0px, rgba(255,255,255,0.018) 1px, transparent 1px, transparent 4px)',
      pointerEvents: 'none',
    }}
  />
)

export const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.55) 100%)',
      pointerEvents: 'none',
    }}
  />
)

const bracket = (rotate: number, pos: React.CSSProperties): React.CSSProperties => ({
  position: 'absolute',
  width: 44,
  height: 44,
  borderTop: `2px solid rgba(240, 237, 232, 0.22)`,
  borderLeft: `2px solid rgba(240, 237, 232, 0.22)`,
  transform: `rotate(${rotate}deg)`,
  ...pos,
})

export const CornerBrackets: React.FC<{ inset?: number }> = ({ inset = 56 }) => (
  <AbsoluteFill style={{ pointerEvents: 'none' }}>
    <div style={bracket(0, { top: inset, left: inset })} />
    <div style={bracket(90, { top: inset, right: inset })} />
    <div style={bracket(270, { bottom: inset, left: inset })} />
    <div style={bracket(180, { bottom: inset, right: inset })} />
  </AbsoluteFill>
)

// Pulsing green dot, mirrors the site's "Showreel" badge indicator
export const PulseDot: React.FC<{ size?: number }> = ({ size = 14 }) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const t = (frame % (fps * 2)) / (fps * 2)
  const ringScale = 1 + t * 2.2
  const ringOpacity = Math.max(0, 0.5 * (1 - t))
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          border: `1.5px solid ${theme.accent}`,
          transform: `scale(${ringScale})`,
          opacity: ringOpacity,
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          background: theme.accent,
          boxShadow: `0 0 ${size}px ${theme.accent}`,
        }}
      />
    </div>
  )
}

// Uppercase mono micro-label, like the site's section labels
export const MonoLabel: React.FC<{
  children: React.ReactNode
  style?: React.CSSProperties
}> = ({ children, style }) => (
  <div
    style={{
      fontFamily: theme.fontMono,
      fontSize: 22,
      fontWeight: 400,
      letterSpacing: '0.35em',
      textTransform: 'uppercase',
      color: theme.muted,
      ...style,
    }}
  >
    {children}
  </div>
)
