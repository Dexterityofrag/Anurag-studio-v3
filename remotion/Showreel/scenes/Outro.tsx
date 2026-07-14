import React from 'react'
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion'
import { theme, outlineText } from '../theme'
import { KineticText, FadeUp, expoOut } from '../components/KineticText'
import { MonoLabel, PulseDot } from '../components/Overlays'

const WORDMARK_AT = 60
const FADE_OUT_AT = 135 // last 30 frames fade to black for the loop seam

// Scene 5 (25-30s): DESIGN × CODE resolves to the wordmark + pulse dot,
// then fades to the same black as frame 0 so the video loops seamlessly.
export const Outro: React.FC = () => {
  const frame = useCurrentFrame()

  const equationOpacity = interpolate(frame, [WORDMARK_AT - 15, WORDMARK_AT], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const fadeToBlack = interpolate(frame, [FADE_OUT_AT, FADE_OUT_AT + 28], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: expoOut,
  })

  return (
    <AbsoluteFill
      style={{
        backgroundColor: theme.bg,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {frame < WORDMARK_AT && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4em',
            opacity: equationOpacity,
          }}
        >
          <KineticText
            text="DESIGN"
            delay={5}
            stagger={2}
            style={{
              fontFamily: theme.fontDisplay,
              fontWeight: 700,
              fontSize: 150,
              letterSpacing: '-0.02em',
              color: theme.fg,
            }}
          />
          <FadeUp delay={22} duration={20}>
            <span
              style={{
                fontFamily: theme.fontDisplay,
                fontWeight: 300,
                fontSize: 110,
                color: theme.accent,
              }}
            >
              ×
            </span>
          </FadeUp>
          <KineticText
            text="CODE"
            delay={28}
            stagger={2}
            style={{
              fontFamily: theme.fontDisplay,
              fontWeight: 700,
              fontSize: 150,
              letterSpacing: '-0.02em',
            }}
            charStyle={() => outlineText('rgba(240, 237, 232, 0.55)', 2)}
          />
        </div>
      )}

      {frame >= WORDMARK_AT && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
            <KineticText
              text="ANURAG"
              delay={WORDMARK_AT + 2}
              stagger={3}
              style={{
                fontFamily: theme.fontDisplay,
                fontWeight: 700,
                fontSize: 170,
                letterSpacing: '-0.02em',
                color: theme.fg,
              }}
            />
            <FadeUp delay={WORDMARK_AT + 24} duration={20}>
              <PulseDot size={22} />
            </FadeUp>
          </div>
          <FadeUp delay={WORDMARK_AT + 32} style={{ marginTop: 36 }}>
            <MonoLabel style={{ color: theme.accent }}>anurag.studio</MonoLabel>
          </FadeUp>
        </div>
      )}

      <AbsoluteFill style={{ backgroundColor: theme.bg, opacity: fadeToBlack }} />
    </AbsoluteFill>
  )
}
