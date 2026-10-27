/**
 * Kharchaaaa, product reel.
 *
 * Twelve beats in fourteen seconds. The register is a hardware keynote rather
 * than an app tour: the screens are never shown whole and never shown flat.
 * Each beat is a camera move into one feature — a crop tight enough that the
 * type is the subject — on a pane of glass held in three dimensions.
 *
 * The version before this one showed six phones, each centred, each entire,
 * each still. At 1920 wide a whole 1170x2532 screen is nine percent of the
 * frame, so every feature arrived as a thumbnail: technically on screen,
 * practically unreadable. The fix was not bigger phones, it was a camera.
 *
 * Two things carry that:
 *
 *   1. A crop, not a fit. `focusStyle` sizes the screenshot so a named region
 *      of it fills the window, so `fw: 0.45` means the frame holds forty-five
 *      percent of the phone's width and the rest is off screen. The dial, the
 *      pace card, one log row — each gets the whole 1920.
 *
 *   2. Two clocks per beat. The crop lands just before the cut, so the feature
 *      settles and reads; the rotation is still turning when we cut away. A
 *      move that finishes before its cut reads as a slide. This is the whole
 *      difference between a sequence and a slideshow.
 *
 * The palette, type and easing are the site's own tokens, because Kharchaaaa
 * borrows its design language from here.
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
export const INTRO_DURATION = 426

/** The house curve. Arrives, overshoots nothing, settles. */
const EASE = Easing.bezier(0.22, 1, 0.36, 1)
/** Near linear, barely shaped at the ends. For anything that must not settle. */
const DRIFT = Easing.bezier(0.45, 0.05, 0.55, 0.95)
/**
 * The camera curve, and the one worth explaining. The house curve is so
 * front-loaded that a move is a third done four frames in, which means the
 * composition a beat opens on — one log row filling the frame, the shoulder of
 * the 6 — exists for about two frames and nobody sees it. This leaves more
 * slowly, spends real time in the middle of the travel, and still settles.
 */
const CAM = Easing.bezier(0.3, 0.1, 0.25, 1)
/** Frames a beat holds its opening composition before the camera moves. */
const HOLD = 5

/** The camera's distance from the glass. Lower is a wider lens and a harder
 *  tilt; 2200 is about a 50mm, which is the least theatrical option. */
const PERSPECTIVE = 2200

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

const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))

/* ─── The camera ───────────────────────────────────────────────── */

/** The captures are all 1170x2532, straight off the device at dSF 3. */
const IMG_W = 1170
const IMG_H = 2532
const IMG_RATIO = IMG_H / IMG_W

/**
 * One camera position: a window cut in the frame, a region of the screenshot
 * to put behind it, and the attitude of the glass in space.
 *
 *   w,h,r   the window, in frame pixels, and its corner radius
 *   cx,cy   the point of the screenshot to centre, 0..1 of its own size
 *   fw      how much of the screenshot's width the window holds, 0..1.
 *           This is the zoom, and it is the number worth tuning first.
 *   rx,ry,rz,tz  degrees about each axis, and distance toward the lens
 */
type View = {
  w: number
  h: number
  r: number
  cx: number
  cy: number
  fw: number
  rx: number
  ry: number
  rz: number
  tz: number
}

/**
 * Sizes and offsets the screenshot so the requested region fills the window.
 *
 * The clamp is a guard rail: a crop that would run off the edge of the capture
 * is pulled back inside it rather than showing a strip of page behind. When the
 * region is wider than the capture it centres instead, which is the only
 * sensible reading of an impossible request.
 */
function focusStyle(
  vw: number,
  vh: number,
  cx: number,
  cy: number,
  fw: number,
): React.CSSProperties {
  const dispW = vw / fw
  const dispH = dispW * IMG_RATIO
  const halfX = vw / 2 / dispW
  const halfY = vh / 2 / dispH
  const x = clamp(cx, Math.min(0.5, halfX), Math.max(0.5, 1 - halfX))
  const y = clamp(cy, Math.min(0.5, halfY), Math.max(0.5, 1 - halfY))
  return {
    position: 'absolute',
    display: 'block',
    width: dispW,
    height: dispH,
    left: vw / 2 - x * dispW,
    top: vh / 2 - y * dispH,
  }
}

/**
 * A beat: one screenshot, one move across it.
 *
 * `to` is reached at 92% of the beat — late enough to feel like the move was
 * cut short, early enough that the last few frames hold still and let the
 * numbers read. The rotation runs on its own clock scaled well past the beat's
 * own length, so it is always mid-turn at the cut.
 */
const Detail: React.FC<{
  src: string
  from: View
  to: View
  dur: number
  caption?: string
  captionDelay?: number
}> = ({ src, from, to, dur, caption, captionDelay = 6 }) => {
  const f = useCurrentFrame()
  const { fps } = useVideoConfig()

  const tc = interpolate(f, [HOLD, dur * 0.94], [0, 1], {
    easing: CAM,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })
  const tr = interpolate(f, [0, dur * 2.1], [0, 1], {
    easing: DRIFT,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  const w = lerp(from.w, to.w, tc)
  const h = lerp(from.h, to.h, tc)
  const r = lerp(from.r, to.r, tc)
  const rx = lerp(from.rx, to.rx, tr)
  const ry = lerp(from.ry, to.ry, tr)
  const rz = lerp(from.rz, to.rz, tr)
  const tz = lerp(from.tz, to.tz, tr)

  const p = pop(f, fps)
  const enter = Math.min(1, p * 1.6)
  /** The lens pulls focus on the way in. Nine frames, then it is gone. */
  const soft = ease(f, 0, 9, 14, 0)
  /** A specular band that crosses the glass as it turns to face the lens. */
  const sheen = interpolate(ry, [-34, 8], [-10, 100], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  })

  return (
    <AbsoluteFill
      style={{
        perspective: PERSPECTIVE,
        // Dead centre, and it has to stay there. A shifted origin reads as a
        // camera move until you add translateZ, at which point the projection
        // throws the object off frame in proportion to its depth — which is
        // how the first cut of this ended up with a phone in the top corner.
        perspectiveOrigin: '50% 50%',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          transformStyle: 'preserve-3d',
          // The lift leaves a band at the bottom for the caption, so it never
          // has to sit on the glass.
          transform: `translateY(-26px) translateZ(${tz}px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg)`,
          opacity: enter,
        }}
      >
        {/* Contact shadow. It sits behind and below, and it is most of why the
            glass reads as an object with a side rather than a rectangle. */}
        <div
          style={{
            position: 'absolute',
            left: '6%',
            width: '88%',
            bottom: -46,
            height: 120,
            borderRadius: '50%',
            background: 'rgba(0,0,0,0.85)',
            filter: 'blur(60px)',
            transform: `translateZ(-160px) translateX(${ry * 1.8}px)`,
          }}
        />
        <div
          style={{
            position: 'relative',
            width: w,
            height: h,
            borderRadius: r,
            overflow: 'hidden',
            background: theme.bg,
            filter: `blur(${soft}px)`,
            boxShadow: `0 60px 160px rgba(0,0,0,0.75), 0 0 120px ${theme.accent}12, inset 0 0 0 1px rgba(255,255,255,0.09)`,
          }}
        >
          <Img src={staticFile(src)} style={focusStyle(w, h, lerp(from.cx, to.cx, tc), lerp(from.cy, to.cy, tc), lerp(from.fw, to.fw, tc))} />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `linear-gradient(105deg, transparent ${sheen - 26}%, rgba(255,255,255,0.055) ${sheen}%, transparent ${sheen + 26}%)`,
              pointerEvents: 'none',
            }}
          />
        </div>
      </div>
      {caption ? <Caption delay={captionDelay}>{caption}</Caption> : null}
    </AbsoluteFill>
  )
}

/* ─── Shared furniture ─────────────────────────────────────────── */

/** The mono micro-label. Every beat gets exactly one line of this, and no more.
 *  It floats in front of the glass rather than on it, so the depth is legible
 *  even when the crop is too tight to show an edge. */
const Caption: React.FC<{ children: React.ReactNode; delay?: number }> = ({
  children,
  delay = 5,
}) => {
  const f = useCurrentFrame()
  return (
    <div
      style={{
        position: 'absolute',
        bottom: 46,
        left: 0,
        right: 0,
        textAlign: 'center',
        fontFamily: theme.fontMono,
        fontSize: 25,
        letterSpacing: '0.3em',
        textTransform: 'uppercase',
        color: 'rgba(240,237,232,0.72)',
        textShadow: '0 6px 40px rgba(0,0,0,0.9)',
        // Enough Z to sit in front of the glass, not enough for the projection
        // to magnify it off the bottom of the frame.
        transform: `translateZ(70px) translateY(${ease(f, delay, delay + 12, 16, 0)}px)`,
        opacity: ease(f, delay, delay + 9, 0, 1),
      }}
    >
      {children}
    </div>
  )
}

/* ─── B1: the mark, turned ─────────────────────────────────────── */

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

const Wordmark: React.FC<{ size?: number; at?: number }> = ({ size = 78, at = 6 }) => {
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
      <span style={{ opacity: ease(f, at, at + 7, 0, 1) }}>kharch</span>
      {[0, 1, 2, 3].map((i) => {
        const t = at + 3 + i * 2.5
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              opacity: ease(f, t, t + 7, 0, 1),
              marginLeft: ease(f, t, t + 9, 0, i * 2),
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

/**
 * The mark arrives edge on and turns into the lens while it is still drawing
 * itself, and the wordmark sits on a nearer plane so the two separate as it
 * turns. Cut at thirty-two frames, several degrees short of square.
 */
const B1: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame()
  const t = interpolate(f, [0, dur * 1.9], [0, 1], {
    easing: DRIFT,
    extrapolateRight: 'clamp',
  })
  return (
    <AbsoluteFill
      style={{
        perspective: PERSPECTIVE,
        perspectiveOrigin: '50% 50%',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          transformStyle: 'preserve-3d',
          transform: `translateZ(${lerp(-420, 110, t)}px) rotateY(${lerp(-48, -5, t)}deg) rotateX(${lerp(12, 2, t)}deg)`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <Mark progress={ease(f, 0, 22, 0, 1)} size={300} />
        <div style={{ transform: 'translateZ(120px)' }}>
          <Wordmark size={130} at={7} />
        </div>
      </div>
    </AbsoluteFill>
  )
}

/* ─── B2: the line, and what it becomes ────────────────────────── */

const TYPED = 'uber 105'

/**
 * The composer and the chip it resolves into, on two planes two hundred and
 * sixty units apart. The gap is the point: the chip is a consequence of the
 * line, so it arrives in front of it rather than beside it.
 */
const B2: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame()
  const { fps } = useVideoConfig()
  const t = interpolate(f, [0, dur * 2], [0, 1], { easing: DRIFT, extrapolateRight: 'clamp' })
  const chars = Math.round(ease(f, 2, 14, 0, TYPED.length))
  const caret = Math.floor(f / 5) % 2 === 0
  const chip = pop(f, fps, 17)

  return (
    <AbsoluteFill
      style={{
        perspective: PERSPECTIVE,
        perspectiveOrigin: '50% 50%',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          transformStyle: 'preserve-3d',
          transform: `translateZ(${lerp(-260, 60, t)}px) rotateY(${lerp(-30, -5, t)}deg) rotateX(${lerp(9, 2, t)}deg)`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 40,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 32,
            padding: '52px 88px',
            borderRadius: 999,
            border: `1px solid ${theme.accent}55`,
            background: theme.bgAlt,
            boxShadow: `0 50px 130px rgba(0,0,0,0.7), 0 0 90px ${theme.accent}18`,
            fontFamily: theme.fontDisplay,
            fontSize: 112,
            color: theme.fg,
            minWidth: 1180,
          }}
        >
          <span style={{ width: 26, height: 26, borderRadius: 999, background: theme.accent }} />
          <span>
            {TYPED.slice(0, chars)}
            <span style={{ opacity: caret ? 1 : 0, color: theme.accent }}>|</span>
          </span>
        </div>
        <div
          style={{
            transform: `translateZ(${260 * chip}px) scale(${0.82 + chip * 0.18})`,
            opacity: Math.min(1, chip * 2),
            display: 'flex',
            alignItems: 'center',
            gap: 30,
            padding: '38px 68px',
            borderRadius: 999,
            background: `${theme.accent}1f`,
            border: `1px solid ${theme.accent}55`,
            boxShadow: `0 40px 110px rgba(0,0,0,0.65), 0 0 70px ${theme.accent}22`,
            fontFamily: theme.fontMono,
            fontSize: 50,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: theme.accent,
          }}
        >
          <span style={{ width: 22, height: 22, borderRadius: 999, background: theme.accent }} />
          transport
          <span style={{ color: theme.fg, letterSpacing: 0 }}>₹105</span>
        </div>
      </div>
      <Caption delay={20}>type it. it knows what it was.</Caption>
    </AbsoluteFill>
  )
}

/* ─── B8: the twenty categories, as a plane of colour ──────────── */

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

/**
 * Twenty swatches on a plane that is steeply raked at the start and nearly
 * square by the cut, each one arriving out of its own depth. It is the one
 * beat with no screenshot in it, so it gets to be the most openly three
 * dimensional thing in the film.
 */
const B8: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame()
  const { fps } = useVideoConfig()
  const t = interpolate(f, [0, dur * 2], [0, 1], { easing: DRIFT, extrapolateRight: 'clamp' })
  return (
    <AbsoluteFill
      style={{
        perspective: 1500,
        perspectiveOrigin: '50% 50%',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          transformStyle: 'preserve-3d',
          // translateZ first. After a rotation it runs along the object's own
          // axis, not the world's, and the plane slides out of frame.
          transform: `translateZ(${lerp(-220, 60, t)}px) rotateX(${lerp(20, 4, t)}deg) rotateY(${lerp(-16, -3, t)}deg)`,
          display: 'grid',
          // Four columns, not five. The beat sits between two screenshots
          // cropped hard enough to be read across a room, and a five-wide grid
          // of nineteen-pixel labels reads as a footnote next to them.
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '34px 72px',
          width: 1560,
        }}
      >
        {CATS.map(([name, colour], i) => {
          const p = pop(f, fps, (i % 4) * 1.1 + Math.floor(i / 4) * 2.2)
          return (
            <div
              key={name}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 22,
                opacity: Math.min(1, p * 1.8),
                transform: `translateZ(${(1 - p) * -180}px)`,
              }}
            >
              <span
                style={{
                  width: 34, height: 34, borderRadius: 999,
                  background: colour, flexShrink: 0,
                  boxShadow: `0 0 34px ${colour}99`,
                }}
              />
              <span
                style={{
                  fontFamily: theme.fontMono, fontSize: 30,
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
        maxWidth: 1000,
        padding: '32px 50px',
        borderRadius: 38,
        borderBottomRightRadius: mine ? 8 : 38,
        borderBottomLeftRadius: mine ? 38 : 8,
        background: mine ? theme.accent : 'rgba(255,255,255,0.07)',
        color: mine ? '#060606' : theme.fg,
        fontFamily: theme.fontBody,
        fontSize: 48,
        boxShadow: '0 30px 80px rgba(0,0,0,0.55)',
        opacity: Math.min(1, p * 2),
        // Each bubble lands from its own depth, so the thread builds toward
        // the lens instead of scrolling up a flat pane.
        transform: `translateZ(${(1 - p) * -220}px) translateY(${(1 - p) * 18}px)`,
      }}
    >
      {text}
    </div>
  )
}

const B11: React.FC<{ dur: number }> = ({ dur }) => {
  const f = useCurrentFrame()
  const t = interpolate(f, [0, dur * 2], [0, 1], { easing: DRIFT, extrapolateRight: 'clamp' })
  return (
    <AbsoluteFill
      style={{
        perspective: PERSPECTIVE,
        perspectiveOrigin: '50% 50%',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          transformStyle: 'preserve-3d',
          transform: `translateZ(${lerp(-200, 70, t)}px) rotateY(${lerp(24, 4, t)}deg) rotateX(${lerp(8, 1, t)}deg)`,
          display: 'flex',
          flexDirection: 'column',
          gap: 22,
          width: 1400,
        }}
      >
        <Bubble text="zepto 495" mine delay={0} />
        <Bubble text="filed · quick commerce · ₹495" delay={4} />
        <Bubble text="swiggy 340 late dinner" mine delay={9} />
        <Bubble text="filed · food delivery · ₹340" delay={13} />
      </div>
      <Caption delay={14}>or just text the bot</Caption>
    </AbsoluteFill>
  )
}

/* ─── B12: end card ────────────────────────────────────────────── */

/**
 * The only beat that comes to rest. Everything before it is cut mid move, so
 * the film needs one frame that is allowed to be square and still, or the end
 * reads as another cut rather than an ending.
 */
const B12: React.FC = () => {
  const f = useCurrentFrame()
  const { fps } = useVideoConfig()
  const p = pop(f, fps)
  return (
    <AbsoluteFill
      style={{
        perspective: PERSPECTIVE,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          transformStyle: 'preserve-3d',
          transform: `translateZ(${ease(f, 0, 34, -180, 0)}px) rotateY(${ease(f, 0, 34, -12, 0)}deg)`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            fontFamily: theme.fontDisplay, fontWeight: 700, fontSize: 134,
            letterSpacing: '-0.035em', color: theme.fg,
            opacity: Math.min(1, p * 2),
            transform: `translateY(${(1 - p) * 18}px)`,
          }}
        >
          type it. <span style={{ color: theme.accent }}>it&rsquo;s filed.</span>
        </div>
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 24, marginTop: 48,
            opacity: ease(f, 9, 22, 0, 1),
            transform: 'translateZ(80px)',
          }}
        >
          <Mark progress={1} size={92} />
          <span style={{ fontFamily: theme.fontDisplay, fontWeight: 700, fontSize: 60, color: theme.fg }}>
            kharcha<span style={{ color: theme.accent }}>aaa</span>a
          </span>
        </div>
        <div
          style={{
            marginTop: 34, fontFamily: theme.fontMono, fontSize: 26,
            letterSpacing: '0.26em', textTransform: 'uppercase', color: theme.muted,
            opacity: ease(f, 18, 30, 0, 1),
            transform: 'translateZ(80px)',
          }}
        >
          works offline · stays on your phone · invite only
        </div>
      </div>
    </AbsoluteFill>
  )
}

/* ─── Assembly ─────────────────────────────────────────────────── */

const P = 'projects/kharchaaaa/'

/**
 * The camera positions, one pair per screen beat.
 *
 * Every `to` was checked against the capture it crops: the numbers are chosen
 * so the named feature is inside the window at the end of the move and nothing
 * from the chrome — the composer pill at 0.89, the tab bar at 0.96 — creeps
 * into the bottom of a frame that is not about it.
 */
const DIVE: [View, View] = [
  // The one establishing shot in the film: the whole screen, phone shaped and
  // held away, which then opens into the dial. Doing this once buys the right
  // to crop everything after it without the viewer losing the object.
  { w: 452, h: 978, r: 54, cx: 0.5, cy: 0.5, fw: 1, rx: 10, ry: -30, rz: -4, tz: -420 },
  { w: 1150, h: 840, r: 26, cx: 0.5, cy: 0.415, fw: 0.95, rx: 3, ry: -8, rz: 0, tz: 120 },
]

const PACE: [View, View] = [
  // The left half, then the whole card. Travelling right is the comparison —
  // safe pace, then the pace you are actually on — so the move is the argument.
  { w: 1400, h: 540, r: 24, cx: 0.36, cy: 0.687, fw: 0.70, rx: 7, ry: -20, rz: 2, tz: -120 },
  { w: 1400, h: 540, r: 24, cx: 0.50, cy: 0.690, fw: 0.95, rx: 2, ry: -4, rz: 0, tz: 60 },
]

const LINES: [View, View] = [
  // A slot on the three typed lines that opens upward onto the three chips
  // they became. The width is held near the full capture throughout: the
  // amounts sit at the right edge of each chip and cropping them off loses
  // the whole point of the beat.
  { w: 1240, h: 470, r: 24, cx: 0.5, cy: 0.875, fw: 0.92, rx: 8, ry: 22, rz: -2, tz: -60 },
  { w: 1240, h: 760, r: 24, cx: 0.5, cy: 0.800, fw: 0.92, rx: 2, ry: 5, rz: 0, tz: 90 },
]

const LOG: [View, View] = [
  // One spend — Uber, transport, ₹118, 16:41 — filling 1400px, then opening
  // out to the day it belongs to.
  { w: 1400, h: 300, r: 22, cx: 0.45, cy: 0.293, fw: 0.86, rx: 6, ry: -24, rz: 3, tz: -140 },
  { w: 1200, h: 840, r: 24, cx: 0.50, cy: 0.420, fw: 0.92, rx: 1, ry: -6, rz: 0, tz: 70 },
]

const SHAPE: [View, View] = [
  // The one beat that pushes in rather than pulling back, so the run of
  // opening moves does not become a tic: the ranking, closing onto the line
  // at the top of it.
  { w: 1200, h: 830, r: 24, cx: 0.5, cy: 0.655, fw: 0.98, rx: 7, ry: 20, rz: -3, tz: -140 },
  { w: 1200, h: 400, r: 22, cx: 0.5, cy: 0.505, fw: 0.90, rx: 2, ry: 4, rz: 0, tz: 60 },
]

const SETUP: [View, View] = [
  { w: 1320, h: 430, r: 22, cx: 0.5, cy: 0.468, fw: 0.92, rx: 8, ry: -22, rz: 2, tz: -120 },
  { w: 1320, h: 660, r: 24, cx: 0.5, cy: 0.500, fw: 0.98, rx: 2, ry: -5, rz: 0, tz: 70 },
]

const CROSS: [View, View] = [
  // The deepest crop in the film, on the shoulder of the 6, pulling out to the
  // whole sentence. Forty-five percent of the phone's width across 1400px is
  // about a seven times magnification.
  { w: 1400, h: 760, r: 26, cx: 0.30, cy: 0.44, fw: 0.45, rx: 6, ry: 18, rz: -2, tz: -200 },
  { w: 1400, h: 820, r: 26, cx: 0.50, cy: 0.50, fw: 0.99, rx: 1, ry: 3, rz: 0, tz: 90 },
]

/** Beat boundaries. Hard cuts: each sequence ends exactly where the next starts. */
const BEATS: Array<[number, number, (dur: number) => React.ReactNode]> = [
  [0, 32, (d) => <B1 dur={d} />],
  [32, 38, (d) => <B2 dur={d} />],
  [70, 50, (d) => (
    <Detail src={`${P}01-today.webp`} from={DIVE[0]} to={DIVE[1]} dur={d}
            caption="the month, as a dial" captionDelay={20} />
  )],
  [120, 34, (d) => (
    <Detail src={`${P}01-today.webp`} from={PACE[0]} to={PACE[1]} dur={d}
            caption="and whether you are ahead of it" />
  )],
  [154, 38, (d) => (
    <Detail src={`${P}05-composer.webp`} from={LINES[0]} to={LINES[1]} dur={d}
            caption="one spend per line" />
  )],
  [192, 34, (d) => (
    <Detail src={`${P}02-log.webp`} from={LOG[0]} to={LOG[1]} dur={d}
            caption="every spend, by day" />
  )],
  [226, 34, (d) => (
    <Detail src={`${P}03-shape.webp`} from={SHAPE[0]} to={SHAPE[1]} dur={d}
            caption="where it actually went" />
  )],
  [260, 32, (d) => <B8 dur={d} />],
  [292, 32, (d) => (
    <Detail src={`${P}04-setup.webp`} from={SETUP[0]} to={SETUP[1]} dur={d}
            caption="a group is a ceiling with a name" />
  )],
  [324, 32, (d) => (
    <Detail src={`${P}06-checkpoint.webp`} from={CROSS[0]} to={CROSS[1]} dur={d}
            caption="it says when you cross" />
  )],
  [356, 34, (d) => <B11 dur={d} />],
  [390, 36, () => <B12 />],
]

/**
 * Two frames of accent bloom on every cut. You do not consciously see it, but
 * it is the difference between cuts that land and cuts that shuffle.
 */
const CutFlash: React.FC = () => {
  const f = useCurrentFrame()
  const hit = BEATS.some(([start]) => start > 0 && f - start >= 0 && f - start < 2)
  return hit ? (
    <AbsoluteFill style={{ background: theme.accent, opacity: 0.06, pointerEvents: 'none' }} />
  ) : null
}

/**
 * The room the glass is in. The bloom drifts across the frame over the whole
 * film, so the background is never the same two beats running and the cuts
 * never land on an identical black.
 */
const Room: React.FC = () => {
  const f = useCurrentFrame()
  const x = interpolate(f, [0, INTRO_DURATION], [38, 62])
  const y = interpolate(f, [0, INTRO_DURATION], [40, 52])
  return (
    <>
      <AbsoluteFill
        style={{
          background: `radial-gradient(62% 62% at ${x}% ${y}%, ${theme.accent}18 0%, transparent 72%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: 'radial-gradient(120% 80% at 50% 118%, rgba(255,255,255,0.045) 0%, transparent 60%)',
        }}
      />
    </>
  )
}

export const KharchaIntro: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: theme.bg }}>
      <Room />
      {BEATS.map(([from, dur, node], i) => (
        <Sequence key={i} from={from} durationInFrames={dur}>
          {node(dur)}
        </Sequence>
      ))}
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
