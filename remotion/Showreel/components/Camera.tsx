import React from 'react'
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion'

/**
 * Camera move curve: eases in gently, travels fast, arrives and rests.
 * The rest at the end is what makes a move read as cinematic rather than sliding.
 */
export const cine = Easing.bezier(0.62, 0, 0.14, 1)

type CameraProps = {
  children: React.ReactNode
  /** scene length in frames, so the drift spans exactly the scene */
  duration: number
  scaleFrom?: number
  scaleTo?: number
  /** px of drift across the whole scene */
  panX?: number
  panY?: number
}

/**
 * Slow continuous push/drift wrapper so no frame is ever locked off.
 * Scenes that hand an element to a match cut should end at scale 1 (scaleTo: 1),
 * so the handoff element sits at its unscaled layout position at the cut.
 */
export const Camera: React.FC<CameraProps> = ({
  children,
  duration,
  scaleFrom = 1,
  scaleTo = 1.05,
  panX = 0,
  panY = 0,
}) => {
  const frame = useCurrentFrame()
  const t = interpolate(frame, [0, duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const scale = interpolate(t, [0, 1], [scaleFrom, scaleTo])
  return (
    <AbsoluteFill
      style={{
        transform: `scale(${scale}) translate(${t * panX}px, ${t * panY}px)`,
      }}
    >
      {children}
    </AbsoluteFill>
  )
}

/** Soft radial glow so the accent green reads as emitted light, not a flat shadow. */
export const Bloom: React.FC<{
  x: number
  y: number
  size?: number
  color: string
  opacity?: number
}> = ({ x, y, size = 240, color, opacity = 0.45 }) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: size,
      height: size,
      transform: 'translate(-50%, -50%)',
      borderRadius: '50%',
      background: `radial-gradient(circle, ${color} 0%, transparent 65%)`,
      opacity,
      pointerEvents: 'none',
    }}
  />
)
