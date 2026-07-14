import React from 'react'
import { AbsoluteFill, Easing, interpolate } from 'remotion'
import type {
  TransitionPresentation,
  TransitionPresentationComponentProps,
} from '@remotion/transitions'
import { theme } from '../theme'
import { cine } from '../components/Camera'

const easeOut = Easing.out(Easing.cubic)

/**
 * Screen coordinates the match cuts hand elements between.
 * Scenes on either side of a cut end/start at camera scale 1, so these are
 * plain layout coordinates (see Camera).
 */
export const CUT = {
  /** the period of "the why." in the Why scene — measured from a still */
  whyPeriod: { x: 1277, y: 635 },
  /** the rail line in Flow: horizontal, through screen centre */
  rail: { x: 960, y: 540, length: 1400 },
  /** the tool spine in Tools: vertical, left of the list */
  spine: { x: 470, y: 540, length: 600 },
}

// ---------------------------------------------------------------------------
// 1. Identity -> Why: the wordmark pushes through the camera, grid behind it.
// ---------------------------------------------------------------------------

const ZPush: React.FC<TransitionPresentationComponentProps<Record<string, never>>> = ({
  children,
  presentationDirection,
  presentationProgress: p,
}) => {
  if (presentationDirection === 'exiting') {
    return (
      <AbsoluteFill
        style={{
          transform: `scale(${1 + easeOut(p) * 1.9})`,
          opacity: interpolate(p, [0, 0.75], [1, 0], { extrapolateRight: 'clamp' }),
          filter: `blur(${p * 28}px)`,
        }}
      >
        {children}
      </AbsoluteFill>
    )
  }
  const t = cine(p)
  return (
    <AbsoluteFill
      style={{
        transform: `scale(${interpolate(t, [0, 1], [0.86, 1])})`,
        opacity: interpolate(p, [0.2, 1], [0, 1], { extrapolateLeft: 'clamp' }),
        filter: `blur(${interpolate(t, [0, 1], [16, 0])}px)`,
      }}
    >
      {children}
    </AbsoluteFill>
  )
}

export const zPush = (): TransitionPresentation<Record<string, never>> => ({
  component: ZPush,
  props: {},
})

// ---------------------------------------------------------------------------
// 2. Why -> Flow: the period detaches, falls, and lands as the first rail stop.
// ---------------------------------------------------------------------------

const DotDrop: React.FC<TransitionPresentationComponentProps<Record<string, never>>> = ({
  children,
  presentationDirection,
  presentationProgress: p,
}) => {
  if (presentationDirection === 'exiting') {
    // Why lifts and dims; its own period fades early so only the travelling dot reads.
    return (
      <AbsoluteFill
        style={{
          transform: `translateY(${-easeOut(p) * 70}px)`,
          opacity: interpolate(p, [0, 0.45], [1, 0], { extrapolateRight: 'clamp' }),
        }}
      >
        {children}
      </AbsoluteFill>
    )
  }

  // The travelling dot: lateral drift leads, the rise settles last, so it arcs
  // into the rail rather than sliding there in a straight line.
  const tx = cine(interpolate(p, [0, 0.75], [0, 1], { extrapolateRight: 'clamp' }))
  const ty = cine(interpolate(p, [0.15, 1], [0, 1], { extrapolateLeft: 'clamp' }))
  const x = interpolate(tx, [0, 1], [CUT.whyPeriod.x, CUT.rail.x])
  const y = interpolate(ty, [0, 1], [CUT.whyPeriod.y, CUT.rail.y])
  const size = interpolate(p, [0, 1], [30, 18])

  return (
    <>
      <AbsoluteFill
        style={{ opacity: interpolate(p, [0.45, 1], [0, 1], { extrapolateLeft: 'clamp' }) }}
      >
        {children}
      </AbsoluteFill>
      <AbsoluteFill>
        <div
          style={{
            position: 'absolute',
            left: x,
            top: y,
            width: size,
            height: size,
            transform: 'translate(-50%, -50%)',
            borderRadius: '50%',
            background: theme.accent,
            boxShadow: `0 0 ${16 + p * 20}px ${theme.accent}`,
          }}
        />
      </AbsoluteFill>
    </>
  )
}

export const dotDrop = (): TransitionPresentation<Record<string, never>> => ({
  component: DotDrop,
  props: {},
})

// ---------------------------------------------------------------------------
// 3. Flow -> Tools: the rail rotates 90 degrees into the tool spine.
// ---------------------------------------------------------------------------

const RailRotate: React.FC<TransitionPresentationComponentProps<Record<string, never>>> = ({
  children,
  presentationDirection,
  presentationProgress: p,
}) => {
  if (presentationDirection === 'exiting') {
    return (
      <AbsoluteFill
        style={{
          opacity: interpolate(p, [0, 0.5], [1, 0], { extrapolateRight: 'clamp' }),
          transform: `scale(${1 - easeOut(p) * 0.06})`,
        }}
      >
        {children}
      </AbsoluteFill>
    )
  }

  const t = cine(p)
  const x = interpolate(t, [0, 1], [CUT.rail.x, CUT.spine.x])
  const y = interpolate(t, [0, 1], [CUT.rail.y, CUT.spine.y])
  const len = interpolate(t, [0, 1], [CUT.rail.length, CUT.spine.length])
  const rot = interpolate(t, [0, 1], [0, 90])
  // the line is the only thing carrying the eye across the cut, so it stays lit
  const lineOpacity = interpolate(p, [0.82, 1], [1, 0], { extrapolateLeft: 'clamp' })

  return (
    <>
      <AbsoluteFill
        style={{ opacity: interpolate(p, [0.35, 1], [0, 1], { extrapolateLeft: 'clamp' }) }}
      >
        {children}
      </AbsoluteFill>
      <AbsoluteFill style={{ opacity: lineOpacity }}>
        <div
          style={{
            position: 'absolute',
            left: x,
            top: y,
            width: len,
            height: 2,
            transform: `translate(-50%, -50%) rotate(${rot}deg)`,
            background: theme.accent,
            boxShadow: `0 0 18px ${theme.accent}`,
          }}
        />
      </AbsoluteFill>
    </>
  )
}

export const railRotate = (): TransitionPresentation<Record<string, never>> => ({
  component: RailRotate,
  props: {},
})

// ---------------------------------------------------------------------------
// 4. Tools -> Outro: the stack collapses to a point of light that blooms open.
// ---------------------------------------------------------------------------

const BloomOut: React.FC<TransitionPresentationComponentProps<Record<string, never>>> = ({
  children,
  presentationDirection,
  presentationProgress: p,
}) => {
  if (presentationDirection === 'exiting') {
    return (
      <AbsoluteFill
        style={{
          transform: `scale(${1 - easeOut(p) * 0.85})`,
          opacity: interpolate(p, [0, 0.4], [1, 0], { extrapolateRight: 'clamp' }),
          filter: `blur(${p * 10}px)`,
        }}
      >
        {children}
      </AbsoluteFill>
    )
  }

  // A bloom of soft light: three layers of the same radial gradient expanding at
  // different rates, so the light breathes and billows instead of being one blob
  // that simply scales. Blur grows as it spreads, the way light diffuses.
  const layers: { spread: number[]; soft: number[]; peak: number; at: number }[] = [
    { spread: [60, 900], soft: [10, 60], peak: 0.75, at: 0.24 },
    { spread: [30, 620], soft: [6, 40], peak: 0.55, at: 0.34 },
    { spread: [20, 320], soft: [2, 22], peak: 0.9, at: 0.16 },
  ]

  return (
    <>
      <AbsoluteFill
        style={{
          opacity: interpolate(p, [0.35, 1], [0, 1], { extrapolateLeft: 'clamp' }),
          transform: `scale(${interpolate(cine(p), [0, 1], [1.12, 1])})`,
        }}
      >
        {children}
      </AbsoluteFill>
      {/* light sits on top of the type and adds, rather than washing behind it */}
      <AbsoluteFill style={{ mixBlendMode: 'screen' }}>
        {layers.map((layer, i) => {
          const size = interpolate(easeOut(p), [0, 1], layer.spread)
          const soft = interpolate(p, [0, 1], layer.soft)
          const opacity = interpolate(p, [0, layer.at, 0.82], [0, layer.peak, 0], {
            extrapolateRight: 'clamp',
          })
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: 960,
                top: 540,
                width: size,
                height: size,
                transform: 'translate(-50%, -50%)',
                borderRadius: '50%',
                background: `radial-gradient(circle, ${theme.accent} 0%, transparent 62%)`,
                filter: `blur(${soft}px)`,
                opacity,
              }}
            />
          )
        })}
      </AbsoluteFill>
    </>
  )
}

export const bloomOut = (): TransitionPresentation<Record<string, never>> => ({
  component: BloomOut,
  props: {},
})
