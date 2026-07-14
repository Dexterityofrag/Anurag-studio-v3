import React from 'react'
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion'
import { theme, outlineText } from '../theme'
import { expoOut, FadeUp } from '../components/KineticText'
import { MonoLabel } from '../components/Overlays'
import { Bloom } from '../components/Camera'
import { CUT } from '../transitions'

const TOOLS = ['Figma', 'Framer', 'Spline', 'Adobe CC', 'Claude Code', 'VS Code']

const ROW_H = 132
const ROLL_START = 24
const FRAMES_PER_TOOL = 26
const LAST = TOOLS.length - 1

/** the spine the rail rotated into — the list hangs off it */
const SPINE_X = CUT.spine.x
const SPINE_TOP = CUT.spine.y - CUT.spine.length / 2
const LIST_X = SPINE_X + 70

/**
 * Scene 4: the rail, now vertical, becomes the spine of the toolkit.
 * The centred tool is filled and scaled up; the rest sit as thin outlines.
 */
export const Tools: React.FC = () => {
  const frame = useCurrentFrame()

  // continuous roll position in rows, easing into each one
  const step = Math.min(LAST, Math.floor(Math.max(0, frame - ROLL_START) / FRAMES_PER_TOOL))
  const stepFrame = Math.max(0, frame - ROLL_START) - step * FRAMES_PER_TOOL
  const stepT =
    step >= LAST
      ? 0
      : interpolate(stepFrame, [FRAMES_PER_TOOL * 0.45, FRAMES_PER_TOOL], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: expoOut,
        })
  const rollPos = Math.min(LAST, step + stepT)

  return (
    <AbsoluteFill style={{ backgroundColor: theme.bg, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 96, left: 0, right: 0, textAlign: 'center' }}>
        <FadeUp delay={5}>
          <MonoLabel style={{ display: 'inline-block' }}>/ The toolkit</MonoLabel>
        </FadeUp>
      </div>

      {/* spine: base track */}
      <div
        style={{
          position: 'absolute',
          left: SPINE_X,
          top: SPINE_TOP,
          width: 2,
          height: CUT.spine.length,
          transform: 'translateX(-50%)',
          background: 'rgba(240, 237, 232, 0.12)',
        }}
      />
      {/* spine: accent fill, tracking the roll */}
      <div
        style={{
          position: 'absolute',
          left: SPINE_X,
          top: SPINE_TOP,
          width: 2,
          height: (rollPos / LAST) * CUT.spine.length,
          transform: 'translateX(-50%)',
          background: theme.accent,
          boxShadow: `0 0 18px ${theme.accent}`,
        }}
      />
      <Bloom
        x={SPINE_X}
        y={SPINE_TOP + (rollPos / LAST) * CUT.spine.length}
        size={180}
        color={theme.accent}
        opacity={0.3}
      />

      {/* soft focus band behind the active row */}
      <div
        style={{
          position: 'absolute',
          left: SPINE_X,
          right: 0,
          top: 540 - ROW_H / 2,
          height: ROW_H,
          borderTop: `1px solid ${theme.border}`,
          borderBottom: `1px solid ${theme.border}`,
          background: 'rgba(255, 255, 255, 0.015)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          left: LIST_X,
          top: 540,
          // centre the focused row: row i sits at (i - rollPos) * ROW_H from centre
          transform: `translateY(${-rollPos * ROW_H}px)`,
        }}
      >
        {TOOLS.map((tool, i) => {
          const dist = Math.abs(i - rollPos)
          const isFocus = dist < 0.5
          const opacity = interpolate(dist, [0, 0.5, 2.2], [1, 0.5, 0.09], {
            extrapolateRight: 'clamp',
          })
          const scale = interpolate(dist, [0, 1], [1, 0.76], { extrapolateRight: 'clamp' })
          return (
            <div
              key={tool}
              style={{
                position: 'absolute',
                top: i * ROW_H,
                left: 0,
                height: ROW_H,
                display: 'flex',
                alignItems: 'center',
                gap: 44,
                whiteSpace: 'nowrap',
                transform: `translateY(-50%) scale(${scale})`,
                transformOrigin: 'left center',
                opacity,
              }}
            >
              <span
                style={{
                  fontFamily: theme.fontMono,
                  fontSize: 24,
                  color: isFocus ? theme.accent : theme.muted,
                }}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
              <span
                style={{
                  fontFamily: theme.fontDisplay,
                  fontWeight: 700,
                  fontSize: 106,
                  letterSpacing: '-0.02em',
                  ...(isFocus
                    ? { color: theme.fg }
                    : outlineText('rgba(240, 237, 232, 0.35)', 1.5)),
                }}
              >
                {tool}
              </span>
            </div>
          )
        })}
      </div>
    </AbsoluteFill>
  )
}
