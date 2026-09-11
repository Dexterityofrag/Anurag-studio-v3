/**
 * Kharchaaaa, product reel.
 *
 * Thirteen beats in eleven seconds, hard cut, roughly twenty-four frames each.
 * The register is a phone feature reel rather than a title sequence: something
 * new every three quarters of a second, nothing held long enough to settle,
 * and the product itself on screen for most of it.
 *
 * The first version of this file was four beats of typography and it was far
 * too slow. The fix was not to speed the same thing up, it was to show the
 * product. Eight of these beats now carry a real captured screen and the
 * typography only carries the joins.
 *
 * Everything eases on the house curve, and the palette and type are the site's
 * own tokens, because Kharchaaaa borrows its design language from here.
 */
import React from 'react'
import {
  AbsoluteFill,
  Sequence,
  Img,
  staticFile,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Easing,
} from 'remotion'
import { theme } from '../Showreel/theme'

export const INTRO_FPS = 30
export const INTRO_DURATION = 320

const EASE = Easing.bezier(0.22, 1, 0.36, 1)

function ease(frame: number, from: number, to: number, a: number, b: number) {
  return interpolate(frame, [from, to], [a, b], {
    easing: EASE,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
}

/** A short overshoot, for things that should arrive rather than fade in. */
function pop(frame: number, fps: number, delay = 0) {
  return spring({ frame: frame - delay, fps, config: { damping: 14, mass: 0.5 } })
}

/* ─── Shared furniture ─────────────────────────────────────────── */

/** The mono micro-label. Every beat gets exactly one line of this, and no more. */
const Caption: React.FC<{ children: React.ReactNode; delay?: number }> = ({
  children,
  delay = 4,
}) => {
  const f = useCurrentFrame()
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 54,
        left: 0,
        right: 0,
        textAlign: 'center',
        fontFamily: theme.fontMono,
        fontSize: 25,
        letterSpacing: '0.3em',
        textTransform: 'uppercase',
        color: 'rgba(240,237,232,0.66)',
        opacity: ease(f, delay, delay + 9, 0, 1),
        transform: `translateY(${ease(f, delay, delay + 11, 10, 0)}px)`,
      }}
    >
      {children}
    </div>
  )
}

/**
 * A captured screen in a phone. The images are 1170x2532 straight out of the
 * real app, so the frame is a rounded clip at the right aspect with a hairline
 * and an accent bloom behind it.
 */
const Phone: React.FC<{ src: string; delay?: number; height?: number }> = ({
  src,
  delay = 0,
  height = 910,
}) => {
  const f = useCurrentFrame()
  const { fps } = useVideoConfig()
  const p = pop(f, fps, delay)
  const w = height * (1170 / 2532)

  return (
    <div
      style={{
        width: w,
        height,
        borderRadius: height * 0.055,
        overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.10)',
        boxShadow: `0 40px 120px rgba(0,0,0,0.6), 0 0 90px ${theme.accent}14`,
        transform: `scale(${0.9 + p * 0.1}) translateY(${(1 - p) * 34}px)`,
        opacity: Math.min(1, p * 1.6),
      }}
    >
      <Img src={staticFile(src)} style={{ width: '100%', display: 'block' }} />
    </div>
  )
}

/* ─── B1: the mark, fast ───────────────────────────────────────── */

const Mark: React.FC<{ progress: number; size: number }> = ({ progress, size }) => {
  const ring = ease(progress, 0, 0.34, 0, 1)
  const arc = ease(progress, 0.1, 0.78, 0, 1)
  const bead = ease(progress, 0.7, 0.9, 0, 1)
  const letter = ease(progress, 0.4, 1, 0, 1)
  return (
    <svg width={size} height={size} viewBox="0 0 512 512" aria-hidden>
      <g transform="translate(256,256)">
        <circle
          r="150" fill="none" stroke="#ffffff" strokeOpacity={0.09 * ring}
          strokeWidth="30" pathLength={1} strokeDasharray={1}
          strokeDashoffset={1 - ring} transform="rotate(-90)"
        />
        <path
          d="M 26 -147.7 A 150 150 0 1 1 -150 0" fill="none" stroke={theme.accent}
          strokeWidth="30" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - arc}
        />
        <circle cx="-150" cy="0" r={26 * bead} fill={theme.accent} />
        <g fill="none" stroke={theme.fg} strokeWidth="22" strokeLinecap="round"
           pathLength={1} strokeDasharray={1} strokeDashoffset={1 - letter}>
          <path d="M -34 -92 L -34 92" pathLength={1} />
          <path d="M 30 -26 L -28 22" pathLength={1} />
          <path d="M -28 22 L 34 92" pathLength={1} />
        </g>
      </g>
    </svg>
  )
}

const Wordmark: React.FC<{ size?: number }> = ({ size = 78 }) => {
  const f = useCurrentFrame()
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'baseline',
        fontFamily: theme.fontDisplay,
        fontWeight: 700,
        fontSize: size,
        letterSpacing: '-0.03em',
        color: theme.fg,
      }}
    >
      <span style={{ opacity: ease(f, 6, 13, 0, 1) }}>kharch</span>
      {[0, 1, 2, 3].map((i) => {
        const at = 9 + i * 2.5
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              opacity: ease(f, at, at + 7, 0, 1),
              marginLeft: ease(f, at, at + 9, 0, i * 2),
              color: i === 0 ? theme.fg : theme.accent,
            }}
          >
            a
          </span>
        )
      })}
    </div>
  )
}

const B1: React.FC = () => {
  const f = useCurrentFrame()
  return (
    <AbsoluteFill
      style={{ alignItems: 'center', justifyContent: 'center', gap: 6, flexDirection: 'column' }}
    >
      <Mark progress={ease(f, 0, 20, 0, 1)} size={190} />
      <Wordmark />
    </AbsoluteFill>
  )
}

/* ─── B2 and B3: the line, and what it becomes ─────────────────── */

const TYPED = 'uber 105'

const B2: React.FC = () => {
  const f = useCurrentFrame()
  const { fps } = useVideoConfig()
  const chars = Math.round(ease(f, 2, 15, 0, TYPED.length))
  const p = pop(f, fps)
  const caret = Math.floor(f / 5) % 2 === 0
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div
        style={{
          transform: `scale(${0.94 + p * 0.06})`,
          display: 'flex', alignItems: 'center', gap: 22,
          padding: '40px 70px', borderRadius: 999,
          border: `1px solid ${theme.accent}55`, background: theme.bgAlt,
          fontFamily: theme.fontDisplay, fontSize: 78, color: theme.fg, minWidth: 780,
        }}
      >
        <span style={{ width: 18, height: 18, borderRadius: 999, background: theme.accent }} />
        <span>
          {TYPED.slice(0, chars)}
          <span style={{ opacity: caret ? 1 : 0, color: theme.accent }}>|</span>
        </span>
      </div>
      <Caption delay={7}>just type what happened</Caption>
    </AbsoluteFill>
  )
}

const B3: React.FC = () => {
  const f = useCurrentFrame()
  const { fps } = useVideoConfig()
  const p = pop(f, fps, 2)
  return (
    <AbsoluteFill
      style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 34 }}
    >
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 22,
          padding: '40px 70px', borderRadius: 999,
          border: '1px solid rgba(255,255,255,0.08)', background: theme.bgAlt,
          fontFamily: theme.fontDisplay, fontSize: 78,
          color: 'rgba(240,237,232,0.45)', minWidth: 780,
        }}
      >
        <span style={{ width: 18, height: 18, borderRadius: 999, background: theme.accent }} />
        <span>{TYPED}</span>
      </div>
      <div
        style={{
          transform: `scale(${0.8 + p * 0.2})`,
          opacity: Math.min(1, p * 2),
          display: 'flex', alignItems: 'center', gap: 24,
          padding: '26px 46px', borderRadius: 999,
          background: `${theme.accent}1a`, border: `1px solid ${theme.accent}44`,
          fontFamily: theme.fontMono, fontSize: 34,
          letterSpacing: '0.16em', textTransform: 'uppercase', color: theme.accent,
        }}
      >
        <span style={{ width: 16, height: 16, borderRadius: 999, background: theme.accent }} />
        transport
        <span style={{ color: theme.fg, letterSpacing: 0 }}>₹105</span>
      </div>
      <Caption delay={9}>it already knows what that was</Caption>
    </AbsoluteFill>
  )
}

/* ─── B6: the twenty categories, as colour ─────────────────────── */

/** Straight out of CATEGORIES in the app's js/core.js, slug order preserved. */
const CATS: Array<[string, string]> = [
  ['Food delivery', '#FF6B35'], ['Quick commerce', '#FFD23F'], ['Groceries', '#7ED957'],
  ['Dining out', '#FF8FA3'], ['Drinking', '#C77DFF'], ['Smoking', '#94A3B8'],
  ['Transport', '#00FF94'], ['Travel', '#4CC9F0'], ['Shopping', '#F72585'],
  ['Bills', '#FFB703'], ['Rent', '#E07A5F'], ['Subscriptions', '#56CFE1'],
  ['Entertainment', '#D264E0'], ['Health', '#06D6A0'], ['Personal care', '#FFAFCC'],
  ['Education', '#A3B18A'], ['Investments', '#43AA8B'], ['Transfers', '#9BA0AA'],
  ['Misc', '#6C757D'], ['Uncategorised', '#4A4A4A'],
]

const B6: React.FC = () => {
  const f = useCurrentFrame()
  const { fps } = useVideoConfig()
  return (
    <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '30px 48px',
          width: 1240,
        }}
      >
        {CATS.map(([name, colour], i) => {
          const p = pop(f, fps, i * 0.7)
          return (
            <div
              key={name}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                opacity: Math.min(1, p * 1.8),
                transform: `translateY(${(1 - p) * 14}px)`,
              }}
            >
              <span
                style={{
                  width: 20, height: 20, borderRadius: 999,
                  background: colour, flexShrink: 0,
                  boxShadow: `0 0 22px ${colour}66`,
                }}
              />
              <span
                style={{
                  fontFamily: theme.fontMono, fontSize: 19,
                  letterSpacing: '0.06em', color: theme.fg, whiteSpace: 'nowrap',
                }}
              >
                {name}
              </span>
            </div>
          )
        })}
      </div>
      <Caption delay={12}>twenty categories, each its own colour</Caption>
    </AbsoluteFill>
  )
}

/* ─── B11: the other half, in chat ─────────────────────────────── */

const Bubble: React.FC<{ text: string; mine?: boolean; delay: number }> = ({
  text, mine, delay,
}) => {
  const f = useCurrentFrame()
  const { fps } = useVideoConfig()
  const p = pop(f, fps, delay)
  return (
    <div
      style={{
        alignSelf: mine ? 'flex-end' : 'flex-start',
        maxWidth: 640,
        padding: '22px 34px',
        borderRadius: 26,
        borderBottomRightRadius: mine ? 6 : 26,
        borderBottomLeftRadius: mine ? 26 : 6,
        background: mine ? theme.accent : 'rgba(255,255,255,0.06)',
        color: mine ? '#060606' : theme.fg,
        fontFamily: theme.fontBody,
        fontSize: 32,
        opacity: Math.min(1, p * 2),
        transform: `scale(${0.9 + p * 0.1}) translateY(${(1 - p) * 16}px)`,
      }}
    >
      {text}
    </div>
  )
}

const B11: React.FC = () => (
  <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 860 }}>
      <Bubble text="zepto 495" mine delay={0} />
      <Bubble text="filed · quick commerce · ₹495" delay={4} />
      <Bubble text="swiggy 340 late dinner" mine delay={8} />
      <Bubble text="filed · food delivery · ₹340" delay={12} />
    </div>
    <Caption delay={13}>or just text the bot</Caption>
  </AbsoluteFill>
)

/* ─── B12: the two promises ────────────────────────────────────── */

const B12: React.FC = () => {
  const f = useCurrentFrame()
  const { fps } = useVideoConfig()
  const lines = ['works with no signal', 'your spends never leave your phone']
  return (
    <AbsoluteFill
      style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 24 }}
    >
      {lines.map((l, i) => {
        const p = pop(f, fps, i * 7)
        return (
          <div
            key={l}
            style={{
              fontFamily: theme.fontDisplay,
              fontWeight: 700,
              fontSize: 62,
              letterSpacing: '-0.025em',
              color: i === 0 ? theme.fg : theme.accent,
              opacity: Math.min(1, p * 2),
              transform: `translateY(${(1 - p) * 20}px)`,
            }}
          >
            {l}
          </div>
        )
      })}
    </AbsoluteFill>
  )
}

/* ─── B13: end card ────────────────────────────────────────────── */

const B13: React.FC = () => {
  const f = useCurrentFrame()
  const { fps } = useVideoConfig()
  const p = pop(f, fps)
  return (
    <AbsoluteFill
      style={{ alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}
    >
      <div
        style={{
          fontFamily: theme.fontDisplay, fontWeight: 700, fontSize: 104,
          letterSpacing: '-0.035em', color: theme.fg,
          opacity: Math.min(1, p * 2),
          transform: `translateY(${(1 - p) * 18}px)`,
        }}
      >
        type it. <span style={{ color: theme.accent }}>it&rsquo;s filed.</span>
      </div>
      <div
        style={{
          display: 'flex', alignItems: 'center', gap: 18, marginTop: 42,
          opacity: ease(f, 10, 24, 0, 1),
        }}
      >
        <Mark progress={1} size={64} />
        <span style={{ fontFamily: theme.fontDisplay, fontWeight: 700, fontSize: 42, color: theme.fg }}>
          kharcha<span style={{ color: theme.accent }}>aaa</span>a
        </span>
      </div>
      <div
        style={{
          marginTop: 26, fontFamily: theme.fontMono, fontSize: 20,
          letterSpacing: '0.34em', textTransform: 'uppercase', color: theme.muted,
          opacity: ease(f, 20, 34, 0, 1),
        }}
      >
        invite only
      </div>
    </AbsoluteFill>
  )
}

/* ─── A beat that is one screen and one line ───────────────────── */

const ScreenBeat: React.FC<{ src: string; caption: string }> = ({ src, caption }) => (
  <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
    <Phone src={src} />
    <Caption delay={5}>{caption}</Caption>
  </AbsoluteFill>
)

/* ─── Assembly ─────────────────────────────────────────────────── */

const P = 'projects/kharchaaaa/'

/** Beat boundaries. Hard cuts: each sequence ends exactly where the next starts. */
const BEATS: Array<[number, number, React.ReactNode]> = [
  [0, 26, <B1 key="b1" />],
  [26, 24, <B2 key="b2" />],
  [50, 24, <B3 key="b3" />],
  [74, 26, <ScreenBeat key="b4" src={`${P}05-composer.webp`} caption="one spend per line" />],
  [100, 28, <ScreenBeat key="b5" src={`${P}01-today.webp`} caption="the month, as a dial" />],
  [128, 26, <B6 key="b6" />],
  [154, 24, <ScreenBeat key="b7" src={`${P}02-log.webp`} caption="every spend, by day" />],
  [178, 24, <ScreenBeat key="b8" src={`${P}03-shape.webp`} caption="where it actually went" />],
  [202, 24, <ScreenBeat key="b9" src={`${P}04-setup.webp`} caption="a group is a ceiling with a name" />],
  [226, 24, <ScreenBeat key="b10" src={`${P}06-checkpoint.webp`} caption="it says when you cross" />],
  [250, 26, <B11 key="b11" />],
  [276, 22, <B12 key="b12" />],
  [298, 22, <B13 key="b13" />],
]

/** A slow push across the whole film, so no beat is ever perfectly still. */
const Push: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const f = useCurrentFrame()
  const scale = interpolate(f, [0, INTRO_DURATION], [1, 1.05], { extrapolateRight: 'clamp' })
  return <AbsoluteFill style={{ transform: `scale(${scale})` }}>{children}</AbsoluteFill>
}

/**
 * Two frames of accent bloom on every cut. You do not consciously see it, but
 * it is the difference between cuts that land and cuts that shuffle.
 */
const CutFlash: React.FC = () => {
  const f = useCurrentFrame()
  const hit = BEATS.some(([start]) => start > 0 && f - start >= 0 && f - start < 2)
  return hit ? (
    <AbsoluteFill style={{ background: theme.accent, opacity: 0.07, pointerEvents: 'none' }} />
  ) : null
}

export const KharchaIntro: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: theme.bg }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(58% 58% at 50% 46%, ${theme.accent}16 0%, transparent 70%)`,
        }}
      />
      <Push>
        {BEATS.map(([from, dur, node], i) => (
          <Sequence key={i} from={from} durationInFrames={dur}>
            {node}
          </Sequence>
        ))}
      </Push>
      <CutFlash />
      <AbsoluteFill
        style={{
          opacity: 0.035,
          mixBlendMode: 'overlay',
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/></filter><rect width='120' height='120' filter='url(%23n)' opacity='0.5'/></svg>\")",
        }}
      />
    </AbsoluteFill>
  )
}
