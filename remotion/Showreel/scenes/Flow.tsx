import React from 'react'
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion'
import { theme, outlineText } from '../theme'
import { expoOut, FadeUp } from '../components/KineticText'
import { MonoLabel } from '../components/Overlays'
import { cine, Bloom } from '../components/Camera'
import { CUT } from '../transitions'

const STEPS = [
  { label: 'RESEARCH', caption: 'Ask. Observe. Listen.' },
  { label: 'FRAME', caption: 'Define the real problem.' },
  { label: 'PROTOTYPE', caption: 'Make it tangible, fast.' },
  { label: 'ITERATE', caption: 'Test. Learn. Refine.' },
  { label: 'SHIP', caption: 'Real, and in production.' },
]

const LAST = STEPS.length - 1

/** world px between stations — one screen apart, so only one is ever centred */
const GAP = 1500
const RAIL_Y = CUT.rail.y

const ENTRY = 34 // rail draws in, first dot lands from the match cut
const DWELL = 45 // frames the camera rests on a station (~1.5s of stillness)
const HOP = 28 // frames to travel to the next station
const CYCLE = DWELL + HOP

// after SHIP, the camera pulls back to reveal the whole flow before the handoff
const OVERVIEW_START = 385
const OVERVIEW_DUR = 55
const OVERVIEW_ZOOM = 0.24 // fits all five stations, with margin for the end labels

/** Camera position along the rail, in station units. Rests, moves, rests. */
const railPos = (frame: number) => {
  const t = frame - ENTRY
  if (t <= 0) return 0
  const i = Math.min(LAST, Math.floor(t / CYCLE))
  if (i >= LAST) return LAST
  const local = t - i * CYCLE
  if (local < DWELL) return i
  const hop = interpolate(local, [DWELL, CYCLE], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: cine,
  })
  return i + hop
}

/** 0 while travelling the rail, 1 once pulled back to the whole-flow view */
const overviewAt = (frame: number) =>
  interpolate(frame, [OVERVIEW_START, OVERVIEW_START + OVERVIEW_DUR], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: cine,
  })

/** Where the camera is looking, and how far back it is standing. */
const cameraAt = (frame: number) => {
  const pos = railPos(frame)
  const ov = overviewAt(frame)
  return {
    pos,
    ov,
    // pull back to the middle station so the whole rail is centred
    x: interpolate(ov, [0, 1], [pos * GAP, (LAST / 2) * GAP]),
    zoom: interpolate(ov, [0, 1], [1, OVERVIEW_ZOOM]),
  }
}

/**
 * Scene 3: the camera travels the rail, one station at a time.
 * Each step owns the frame for ~2.4s at display scale, so it can actually be read.
 * A minimap at the bottom keeps the 5-step structure legible without competing.
 */
export const Flow: React.FC = () => {
  const frame = useCurrentFrame()
  const cam = cameraAt(frame)
  const prev = cameraAt(frame - 1)
  const { pos, ov, zoom } = cam

  // approximate motion blur from the camera's own velocity — sharp at rest, smeared mid-hop
  const velocity = Math.abs(cam.x - prev.x) * zoom
  const blur = Math.min(9, velocity * 0.035)

  const railIn = interpolate(frame, [0, ENTRY], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: expoOut,
  })

  return (
    <AbsoluteFill style={{ backgroundColor: theme.bg, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 96, left: 0, right: 0, textAlign: 'center' }}>
        <FadeUp delay={5}>
          <MonoLabel style={{ display: 'inline-block' }}>/ Flow of work</MonoLabel>
        </FadeUp>
      </div>

      {/* the travelling world: stations laid out along one long rail */}
      <AbsoluteFill style={{ filter: blur > 0.4 ? `blur(${blur}px)` : undefined }}>
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            // look at cam.x from cam.zoom away, mapping that world point to screen centre
            transform: `translate(${CUT.rail.x}px, ${CUT.rail.y}px) scale(${zoom}) translate(${-cam.x}px, ${-RAIL_Y}px)`,
          }}
        >
          {/* base rail — streaks outward from the dot that just landed.
              thickness is divided by zoom so the line holds up in the wide view */}
          <div
            style={{
              position: 'absolute',
              left: -1200,
              top: RAIL_Y - 1 / zoom,
              width: LAST * GAP + 2400,
              height: 2 / zoom,
              background: 'rgba(240, 237, 232, 0.12)',
              transform: `scaleX(${railIn})`,
              transformOrigin: '1200px center',
            }}
          />
          {/* accent fill, trailing the camera */}
          <div
            style={{
              position: 'absolute',
              left: -1200,
              top: RAIL_Y - 1 / zoom,
              width: 1200 + pos * GAP,
              height: 2 / zoom,
              background: theme.accent,
              boxShadow: `0 0 ${20 / zoom}px ${theme.accent}`,
              transform: `scaleX(${railIn})`,
              transformOrigin: '1200px center',
            }}
          />

          {STEPS.map((step, i) => {
            const dist = Math.abs(i - pos)
            const reached = pos >= i - 0.02
            // in the wide view every step is equally present — that's the point of it
            const focused = dist < 0.5 || ov > 0.5

            // everything off-centre falls back to dim outline type — parallax, not clutter
            const labelOpacity = interpolate(
              ov,
              [0, 1],
              [interpolate(dist, [0, 0.5, 1.4], [1, 0.5, 0.12], { extrapolateRight: 'clamp' }), 1]
            )
            const labelScale = interpolate(
              ov,
              [0, 1],
              [interpolate(dist, [0, 1], [1, 0.72], { extrapolateRight: 'clamp' }), 1]
            )
            // captions are unreadable that far back, so let them go
            const captionOpacity =
              interpolate(dist, [0, 0.32], [1, 0], { extrapolateRight: 'clamp' }) * (1 - ov)
            const captionRise = interpolate(dist, [0, 0.32], [0, 26], {
              extrapolateRight: 'clamp',
            })

            return (
              <div
                key={step.label}
                style={{
                  position: 'absolute',
                  left: i * GAP,
                  top: RAIL_Y,
                  transform: 'translate(-50%, -50%)',
                  width: 1250,
                  height: 0,
                }}
              >
                {/* index */}
                <div
                  style={{
                    position: 'absolute',
                    top: -288,
                    width: '100%',
                    textAlign: 'center',
                    fontFamily: theme.fontMono,
                    fontSize: 24,
                    letterSpacing: '0.3em',
                    color: reached ? theme.accent : 'rgba(240,237,232,0.22)',
                    opacity: labelOpacity,
                  }}
                >
                  {String(i + 1).padStart(2, '0')}
                </div>

                {/* the step, at display scale — this is the thing you're meant to read */}
                <div
                  style={{
                    position: 'absolute',
                    top: -228,
                    width: '100%',
                    textAlign: 'center',
                    fontFamily: theme.fontDisplay,
                    fontWeight: 700,
                    fontSize: 118,
                    letterSpacing: '-0.01em',
                    whiteSpace: 'nowrap',
                    opacity: labelOpacity,
                    transform: `scale(${labelScale})`,
                    ...(focused
                      ? { color: theme.fg }
                      : outlineText('rgba(240, 237, 232, 0.55)', 1.5)),
                  }}
                >
                  {step.label}
                </div>

                {/* stop on the rail */}
                {reached && <Bloom x={625} y={0} size={140} color={theme.accent} opacity={0.35} />}
                <div
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: 0,
                    width: focused ? 20 : 13,
                    height: focused ? 20 : 13,
                    transform: 'translate(-50%, -50%)',
                    borderRadius: '50%',
                    background: reached ? theme.accent : theme.bgAlt,
                    border: `2px solid ${reached ? theme.accent : 'rgba(240,237,232,0.25)'}`,
                    boxShadow: reached ? `0 0 16px ${theme.accent}` : 'none',
                    opacity: railIn,
                  }}
                />

                {/* caption, cross-faded properly rather than hard-cut */}
                <div
                  style={{
                    position: 'absolute',
                    top: 76,
                    width: '100%',
                    textAlign: 'center',
                    fontFamily: theme.fontBody,
                    fontWeight: 300,
                    fontSize: 44,
                    letterSpacing: '-0.01em',
                    whiteSpace: 'nowrap',
                    color: theme.muted,
                    opacity: captionOpacity,
                    transform: `translateY(${captionRise}px)`,
                  }}
                >
                  {step.caption}
                </div>
              </div>
            )
          })}
        </div>
      </AbsoluteFill>

      {/* minimap: keeps the 5-step shape readable without pulling focus */}
      <div
        style={{
          position: 'absolute',
          bottom: 104,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 420,
          height: 1,
          background: 'rgba(240, 237, 232, 0.14)',
          // redundant once the real rail is fully in frame
          opacity: railIn * 0.9 * (1 - ov),
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            width: `${(pos / LAST) * 100}%`,
            background: theme.accent,
          }}
        />
        {STEPS.map((step, i) => (
          <div
            key={step.label}
            style={{
              position: 'absolute',
              left: `${(i / LAST) * 100}%`,
              top: 0,
              width: 6,
              height: 6,
              transform: 'translate(-50%, -50%)',
              borderRadius: '50%',
              background: pos >= i - 0.02 ? theme.accent : 'rgba(240,237,232,0.25)',
            }}
          />
        ))}
      </div>
    </AbsoluteFill>
  )
}
