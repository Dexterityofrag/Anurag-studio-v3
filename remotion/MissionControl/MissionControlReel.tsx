/**
 * Mission Control, product reel.
 *
 * Shot like a launch webcast rather than an app tour: black frame, lower
 * thirds in condensed caps, and the interface itself as the only picture. The
 * captures already carry the app's own wordmark and T+ clock, so the film adds
 * no chrome of its own on top of them. Every still is a real 3840 wide capture of the live tool, and
 * the flight is real too: the simulator stepped frame by frame by
 * scripts/capture-mission-control.mjs, with a cell failure injected so the
 * battery failsafe takes over on camera.
 *
 * Each beat is a camera move into one region of a capture. `region` is the
 * centre and the fraction of the image width the frame holds, so w: 0.5 is a
 * 2x crop. The move runs the whole beat and is still travelling at the cut.
 *
 *   npm run reel:mission
 */
import React from 'react'
import {
  AbsoluteFill,
  Sequence,
  Img,
  OffthreadVideo,
  staticFile,
  interpolate,
  useCurrentFrame,
  Easing,
} from 'remotion'
import { loadFont as loadCond } from '@remotion/google-fonts/BarlowCondensed'
import { loadFont as loadSans } from '@remotion/google-fonts/Barlow'
import { loadFont as loadMono } from '@remotion/google-fonts/JetBrainsMono'

const { fontFamily: COND } = loadCond('normal', { weights: ['300', '400', '500', '600'] })
const { fontFamily: SANS } = loadSans('normal', { weights: ['400'] })
const { fontFamily: MONO } = loadMono('normal', { weights: ['400'] })

export const MC_FPS = 30
const W = 1920, H = 1080
const EASE = Easing.bezier(0.22, 1, 0.36, 1)
const CAM = Easing.bezier(0.3, 0.1, 0.25, 1)
const DIR = 'projects/mission-control/reel'

type Region = { x: number; y: number; w: number }

type Beat =
  | { kind: 'title'; dur: number }
  | { kind: 'still'; dur: number; src: string; from: Region; to: Region; n: string; title: string; sub: string }
  | { kind: 'flight'; dur: number; n: string; title: string; sub: string }
  | { kind: 'end'; dur: number }

const BEATS: Beat[] = [
  { kind: 'title', dur: 96 },
  { kind: 'still', dur: 120, src: 'plan.jpg', from: { x: 0.5, y: 0.5, w: 1 }, to: { x: 0.47, y: 0.45, w: 0.82 },
    n: '01', title: 'Wire the logic', sub: 'Blocks and wires, the way Unreal Blueprints work. No code.' },
  { kind: 'still', dur: 114, src: 'plan.jpg', from: { x: 0.27, y: 0.42, w: 0.46 }, to: { x: 0.25, y: 0.46, w: 0.38 },
    n: '02', title: 'Failsafes are events', sub: 'Battery, link, GPS, geofence. When one fires, it takes over.' },
  { kind: 'still', dur: 114, src: 'survey.jpg', from: { x: 0.69, y: 0.4, w: 0.5 }, to: { x: 0.7, y: 0.36, w: 0.4 },
    n: '03', title: 'Plan on real imagery', sub: 'Draw a field. The survey lines lay themselves out.' },
  { kind: 'still', dur: 114, src: 'checks.jpg', from: { x: 0.55, y: 0.62, w: 0.78 }, to: { x: 0.62, y: 0.55, w: 0.6 },
    n: '04', title: 'Checks on every edit', sub: 'Orange is a warning. Red means it should not fly.' },
  { kind: 'flight', dur: 246, n: '05', title: 'Fly it first', sub: 'A cell fails mid survey. The failsafe brings it home.' },
  { kind: 'still', dur: 120, src: 'export.jpg', from: { x: 0.4, y: 0.68, w: 0.6 }, to: { x: 0.72, y: 0.3, w: 0.5 },
    n: '06', title: 'Export it for real', sub: 'QGroundControl  ·  Mission Planner  ·  Python for PX4 and ArduPilot' },
  { kind: 'end', dur: 120 },
]

export const MC_DURATION = BEATS.reduce((n, b) => n + b.dur, 0)
/** Frame each beat starts on. */
const STARTS = BEATS.map((_, i) => BEATS.slice(0, i).reduce((n, b) => n + b.dur, 0))

/* ── pieces ─────────────────────────────────────────────── */

function camera(r: Region) {
  const s = 1 / r.w
  return `translate(${(0.5 - r.x) * W * s}px, ${(0.5 - r.y) * H * s}px) scale(${s})`
}

function Shot({ src, from, to, dur }: { src: string; from: Region; to: Region; dur: number }) {
  const f = useCurrentFrame()
  const t = interpolate(f, [0, dur], [0, 1], { easing: CAM, extrapolateRight: 'clamp' })
  const r = { x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t, w: from.w + (to.w - from.w) * t }
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <Img src={staticFile(`${DIR}/${src}`)} style={{ width: W, height: H, transform: camera(r), transformOrigin: 'center' }} />
    </AbsoluteFill>
  )
}

function Fade({ dur, children }: { dur: number; children: React.ReactNode }) {
  const f = useCurrentFrame()
  const o = interpolate(f, [0, 8, dur - 6, dur], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>
}

function LowerThird({ n, title, sub }: { n: string; title: string; sub: string }) {
  const f = useCurrentFrame()
  const line = interpolate(f, [6, 30], [0, 1], { easing: EASE, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const up = (d: number) => ({
    opacity: interpolate(f, [d, d + 14], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
    transform: `translateY(${interpolate(f, [d, d + 18], [18, 0], { easing: EASE, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}px)`,
  })
  return (
    <AbsoluteFill>
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 420, background: 'linear-gradient(0deg, rgba(0,0,0,.92), rgba(0,0,0,.6) 55%, transparent)' }} />
      <div style={{ position: 'absolute', left: 96, bottom: 92, color: '#f4f4f4' }}>
        <div style={{ ...up(4), fontFamily: MONO, fontSize: 22, color: '#9a9a9a', letterSpacing: 2 }}>{n}</div>
        <div style={{ width: 420 * line, height: 1.5, background: '#f4f4f4', margin: '16px 0 22px' }} />
        <div style={{ ...up(10), fontFamily: COND, fontWeight: 400, fontSize: 92, lineHeight: 1, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{title}</div>
        <div style={{ ...up(18), fontFamily: SANS, fontSize: 30, color: '#bdbdbd', marginTop: 18 }}>{sub}</div>
      </div>
    </AbsoluteFill>
  )
}

function Title() {
  const f = useCurrentFrame()
  const spread = interpolate(f, [0, 50], [0.9, 0.42], { easing: EASE, extrapolateRight: 'clamp' })
  const o = interpolate(f, [0, 20, 80, 96], [0, 1, 1, 0], { extrapolateRight: 'clamp' })
  const sub = interpolate(f, [26, 46], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const rule = interpolate(f, [10, 60], [0, 1], { easing: EASE, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  const count = Math.max(0, 3 - Math.floor(f / MC_FPS))
  return (
    <AbsoluteFill style={{ background: '#000', alignItems: 'center', justifyContent: 'center', opacity: o }}>
      <div style={{ textAlign: 'center', color: '#f4f4f4' }}>
        <div style={{ fontFamily: MONO, fontSize: 24, color: '#9a9a9a', marginBottom: 34 }}>T−00:0{count}</div>
        <div style={{ fontFamily: COND, fontWeight: 600, fontSize: 110, letterSpacing: `${spread}em`, marginRight: `-${spread}em` }}>MISSION CONTROL</div>
        <div style={{ width: 760 * rule, height: 1.5, background: '#f4f4f4', margin: '36px auto 30px' }} />
        <div style={{ fontFamily: SANS, fontSize: 34, color: '#bdbdbd', opacity: sub }}>No code mission planning for drones</div>
      </div>
    </AbsoluteFill>
  )
}

function End() {
  const f = useCurrentFrame()
  const o = interpolate(f, [0, 18], [0, 1], { extrapolateRight: 'clamp' })
  const rule = interpolate(f, [8, 50], [0, 1], { easing: EASE, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
  return (
    <AbsoluteFill style={{ background: '#000', alignItems: 'center', justifyContent: 'center', opacity: o }}>
      <div style={{ textAlign: 'center', color: '#f4f4f4' }}>
        <div style={{ fontFamily: COND, fontWeight: 600, fontSize: 84, letterSpacing: '0.42em', marginRight: '-0.42em' }}>MISSION CONTROL</div>
        <div style={{ width: 560 * rule, height: 1.5, background: '#f4f4f4', margin: '32px auto 28px' }} />
        <div style={{ fontFamily: SANS, fontSize: 30, color: '#bdbdbd' }}>Runs in your browser</div>
        <div style={{ fontFamily: MONO, fontSize: 26, color: '#f4f4f4', marginTop: 18 }}>anurag.studio/work/mission-control</div>
      </div>
    </AbsoluteFill>
  )
}

function Flight({ dur }: { dur: number }) {
  const f = useCurrentFrame()
  // framed above the simulator's own controls, so the lower third sits over the map rather than on top of buttons
  const r = { x: interpolate(f, [0, dur], [0.55, 0.58], { easing: CAM }), y: interpolate(f, [0, dur], [0.42, 0.4], { easing: CAM }), w: interpolate(f, [0, dur], [0.8, 0.62], { easing: CAM }) }
  return (
    <AbsoluteFill style={{ overflow: 'hidden', background: '#000' }}>
      <div style={{ position: 'absolute', width: W, height: H, transform: camera(r), transformOrigin: 'center' }}>
        <OffthreadVideo src={staticFile(`${DIR}/flight.mp4`)} playbackRate={1.75} muted style={{ width: W, height: H }} />
      </div>
    </AbsoluteFill>
  )
}

/* ── composition ───────────────────────────────────────── */

export const MissionControlReel: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      {BEATS.map((b, i) => {
        return (
          <Sequence key={i} from={STARTS[i]} durationInFrames={b.dur}>
            {b.kind === 'title' && <Title />}
            {b.kind === 'end' && <End />}
            {b.kind === 'still' && (
              <Fade dur={b.dur}>
                <Shot src={b.src} from={b.from} to={b.to} dur={b.dur} />
                <LowerThird n={b.n} title={b.title} sub={b.sub} />
              </Fade>
            )}
            {b.kind === 'flight' && (
              <Fade dur={b.dur}>
                <Flight dur={b.dur} />
                <LowerThird n={b.n} title={b.title} sub={b.sub} />
              </Fade>
            )}
          </Sequence>
        )
      })}
    </AbsoluteFill>
  )
}
