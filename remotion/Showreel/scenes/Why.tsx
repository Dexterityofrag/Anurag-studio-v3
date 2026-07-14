import React from 'react'
import { AbsoluteFill, useCurrentFrame } from 'remotion'
import { theme } from '../theme'
import { KineticText, FadeUp } from '../components/KineticText'
import { MonoLabel } from '../components/Overlays'

// Faint perspective wireframe grid drifting toward the viewer for depth
const PerspectiveGrid: React.FC = () => {
  const frame = useCurrentFrame()
  const drift = (frame * 0.6) % 90
  return (
    <AbsoluteFill style={{ perspective: 900, overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute',
          left: '-50%',
          right: '-50%',
          bottom: '-70%',
          height: '120%',
          transform: `rotateX(72deg) translateY(${-drift}px)`,
          backgroundImage: `
            linear-gradient(rgba(240,237,232,0.06) 1.5px, transparent 1.5px),
            linear-gradient(90deg, rgba(240,237,232,0.06) 1.5px, transparent 1.5px)`,
          backgroundSize: '90px 90px',
          maskImage: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent 75%)',
          WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent 75%)',
        }}
      />
    </AbsoluteFill>
  )
}

// Scene 2 (5-11s): the ethos line, "the why" in accent green.
export const Why: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: theme.bg,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <PerspectiveGrid />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
      <FadeUp delay={5}>
        <MonoLabel style={{ marginBottom: 56, textAlign: 'center' }}>
          / The approach
        </MonoLabel>
      </FadeUp>
      <KineticText
        text="I like to find out"
        delay={15}
        stagger={2}
        style={{
          fontFamily: theme.fontDisplay,
          fontWeight: 500,
          fontSize: 120,
          letterSpacing: '-0.02em',
          color: theme.fg,
          justifyContent: 'center',
        }}
      />
      {/* the period is its own element: the next scene's first rail stop is this dot */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          marginTop: 12,
        }}
      >
        <KineticText
          text="the why"
          delay={45}
          stagger={3}
          style={{
            fontFamily: theme.fontDisplay,
            fontWeight: 700,
            fontSize: 160,
            letterSpacing: '-0.02em',
            color: theme.accent,
          }}
        />
        <FadeUp delay={68} duration={18} distance={20}>
          <div
            style={{
              width: 30,
              height: 30,
              marginLeft: 20,
              marginBottom: 24,
              borderRadius: '50%',
              background: theme.accent,
              boxShadow: `0 0 16px ${theme.accent}`,
            }}
          />
        </FadeUp>
      </div>
      <FadeUp delay={85} style={{ marginTop: 64, maxWidth: 900, textAlign: 'center' }}>
        <div
          style={{
            fontFamily: theme.fontBody,
            fontWeight: 300,
            fontSize: 34,
            lineHeight: 1.5,
            color: theme.muted,
          }}
        >
          Behind every screen, a reason. Behind every reason, a better design.
        </div>
      </FadeUp>
      </div>
    </AbsoluteFill>
  )
}
