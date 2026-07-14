/**
 * Synthesises the showreel's sound design into public/showreel-audio.wav.
 *
 * No music, no samples, no external audio deps: this writes raw PCM. Every event
 * time is derived from the same scene/cut constants the picture uses, so the sound
 * cannot drift out of sync with the edit.
 *
 *   node --experimental-strip-types scripts/build-sound.ts
 */
import { writeFileSync, mkdirSync } from 'node:fs'

const SR = 48000 // sample rate
const FPS = 30
const CH = 2

// ─── the edit, in frames (mirrors Showreel.tsx / Flow.tsx) ──────────────────
const SCENES = { identity: 155, why: 210, flow: 480, tools: 205, outro: 175 }
const CUTS = { zPush: 22, dotDrop: 30, railRotate: 26, bloomOut: 24 }

const AT = {
  identity: 0,
  why: SCENES.identity - CUTS.zPush, // 133
  get flow() {
    return this.why + SCENES.why - CUTS.dotDrop
  }, // 313
  get tools() {
    return this.flow + SCENES.flow - CUTS.railRotate
  }, // 767
  get outro() {
    return this.tools + SCENES.tools - CUTS.bloomOut
  }, // 948
  get end() {
    return this.outro + SCENES.outro
  }, // 1123
}

// Flow internals
const F_ENTRY = 34
const F_DWELL = 45
const F_HOP = 28
const F_CYCLE = F_DWELL + F_HOP
const F_OVERVIEW = 385
// Tools internals
const T_ROLL_START = 24
const T_PER_TOOL = 26

const TOTAL = AT.end
const N = Math.ceil((TOTAL / FPS) * SR)
const L = new Float64Array(N)
const R = new Float64Array(N)

const f2s = (frame: number) => Math.round((frame / FPS) * SR)
const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x)

/** write a sample with equal-power-ish stereo placement (-1 left … 1 right) */
function add(i: number, v: number, pan = 0) {
  if (i < 0 || i >= N) return
  const l = Math.cos(((pan + 1) * Math.PI) / 4)
  const r = Math.sin(((pan + 1) * Math.PI) / 4)
  L[i] += v * l
  R[i] += v * r
}

/** exponential decay envelope with a short attack, so nothing clicks */
const env = (t: number, dur: number, attack = 0.004, curve = 4) => {
  if (t < 0 || t > dur) return 0
  const a = clamp01(t / attack)
  const d = Math.exp((-curve * t) / dur)
  return a * d
}

// ─── voices ────────────────────────────────────────────────────────────────

/** soft UI tick: a short filtered blip */
function tick(frame: number, freq = 2200, gain = 0.08, dur = 0.05, pan = 0) {
  const s = f2s(frame)
  for (let i = 0; i < dur * SR; i++) {
    const t = i / SR
    const e = env(t, dur, 0.001, 9)
    add(s + i, Math.sin(2 * Math.PI * freq * t) * e * gain, pan)
  }
}

/** tonal note with a soft bell-ish timbre (fundamental + a quiet 2nd/3rd) */
function note(frame: number, freq: number, gain = 0.1, dur = 1.6, pan = 0) {
  const s = f2s(frame)
  for (let i = 0; i < dur * SR; i++) {
    const t = i / SR
    const e = env(t, dur, 0.008, 4)
    const v =
      Math.sin(2 * Math.PI * freq * t) +
      0.32 * Math.sin(2 * Math.PI * freq * 2 * t) * Math.exp(-6 * t) +
      0.14 * Math.sin(2 * Math.PI * freq * 3.01 * t) * Math.exp(-9 * t)
    add(s + i, v * e * gain * 0.5, pan)
  }
}

/** sub hit: a pitch-dropping sine, the weight under a cut */
function sub(frame: number, f0 = 110, f1 = 38, gain = 0.5, dur = 0.85) {
  const s = f2s(frame)
  let phase = 0
  for (let i = 0; i < dur * SR; i++) {
    const t = i / SR
    const k = clamp01(t / dur)
    const freq = f0 + (f1 - f0) * (1 - Math.pow(1 - k, 3))
    phase += (2 * Math.PI * freq) / SR
    const e = env(t, dur, 0.006, 3.4)
    add(s + i, Math.sin(phase) * e * gain, 0)
  }
}

/**
 * air whoosh: white noise through a sweeping one-pole bandpass-ish filter.
 * `rise` sweeps the cutoff up (accelerating move), otherwise it sweeps down.
 */
function whoosh(frame: number, dur = 0.6, gain = 0.13, rise = true, pan = 0) {
  const s = f2s(frame)
  let lp = 0
  let hp = 0
  for (let i = 0; i < dur * SR; i++) {
    const t = i / SR
    const k = clamp01(t / dur)
    // bell-shaped loudness so it swells and leaves
    const e = Math.sin(Math.PI * k) ** 1.5
    const sweep = rise ? k : 1 - k
    const cutoff = 0.02 + 0.30 * sweep // one-pole coefficient
    const n = Math.random() * 2 - 1
    lp += cutoff * (n - lp)
    hp = lp - hp * 0.02
    add(s + i, lp * e * gain, pan * (rise ? 1 : -1))
  }
}

/** bright shimmer: a cluster of high partials blooming open */
function shimmer(frame: number, gain = 0.05, dur = 1.8) {
  const s = f2s(frame)
  const parts = [1568, 2093, 2637, 3136, 4186]
  for (let i = 0; i < dur * SR; i++) {
    const t = i / SR
    const e = env(t, dur, 0.14, 3)
    let v = 0
    for (let p = 0; p < parts.length; p++) {
      v += Math.sin(2 * Math.PI * parts[p] * t + p) / parts.length
    }
    add(s + i, v * e * gain, Math.sin(t * 1.7) * 0.4)
  }
}

/** reverse swell: noise+tone rising into a hit (used before the pull-back) */
function swell(frame: number, dur = 1.2, gain = 0.11) {
  const s = f2s(frame - dur * FPS) // lands ON `frame`
  let lp = 0
  for (let i = 0; i < dur * SR; i++) {
    const t = i / SR
    const k = clamp01(t / dur)
    const e = Math.pow(k, 2.2) // grows into the landing
    const n = Math.random() * 2 - 1
    lp += (0.03 + 0.12 * k) * (n - lp)
    const tone = Math.sin(2 * Math.PI * (180 + 260 * k) * t) * 0.35
    add(s + i, (lp + tone) * e * gain, 0)
  }
}

/** wide pad: slow, quiet, sits under a held shot */
function pad(frame: number, freq: number, dur: number, gain = 0.05) {
  const s = f2s(frame)
  const n = Math.floor(dur * SR)
  for (let i = 0; i < n; i++) {
    const t = i / SR
    const k = i / n
    const e = Math.sin(Math.PI * k) // fade in and out, never clicks
    const v =
      Math.sin(2 * Math.PI * freq * t) +
      0.5 * Math.sin(2 * Math.PI * freq * 1.5 * t + 1.1) +
      0.25 * Math.sin(2 * Math.PI * freq * 2 * t + 2.3)
    // slow stereo drift so it feels wide rather than centred
    add(s + i, v * e * gain * 0.4, Math.sin(t * 0.35) * 0.55)
  }
}

/** the bed: a very quiet evolving drone under everything, silent at both ends */
function drone() {
  for (let i = 0; i < N; i++) {
    const t = i / SR
    const k = i / N
    // fade in over the first 1.5s, out over the last 2.5s → loop-safe
    const e = clamp01(t / 1.5) * clamp01((TOTAL / FPS - t) / 2.5)
    const wobble = 1 + 0.004 * Math.sin(2 * Math.PI * 0.07 * t)
    const v =
      Math.sin(2 * Math.PI * 55 * t * wobble) * 0.6 +
      Math.sin(2 * Math.PI * 110 * t) * 0.22 * (0.5 + 0.5 * Math.sin(2 * Math.PI * 0.05 * t)) +
      Math.sin(2 * Math.PI * 82.5 * t) * 0.12
    add(i, v * e * 0.05 * (0.7 + 0.3 * k), 0)
  }
}

// ─── the score ─────────────────────────────────────────────────────────────
drone()

// 1. IDENTITY — the domain types itself in, then the name lands
for (let c = 0; c < 13; c++) {
  tick(10 + c * 2.5, 1800 + (c % 3) * 260, 0.045, 0.035, (c % 2 ? 1 : -1) * 0.15)
}
sub(55, 130, 42, 0.30)
whoosh(48, 0.5, 0.10, true)
note(58, 261.63, 0.13, 2.4) // C4, the reel's root

// 2. CUT: wordmark pushes through the lens
whoosh(AT.why - 12, 0.75, 0.17, true)
sub(AT.why + 6, 90, 34, 0.26)

// "the why." resolves
note(AT.why + 45, 392.0, 0.16, 2.6, -0.2) // G4
tick(AT.why + 68, 2600, 0.10) // the period arrives

// 3. CUT: the dot falls and lands on the rail
// descending tone across the fall
{
  const s = f2s(AT.flow - 30)
  const dur = 1.0
  for (let i = 0; i < dur * SR; i++) {
    const t = i / SR
    const k = clamp01(t / dur)
    const freq = 780 - 420 * k * k
    const e = env(t, dur, 0.02, 2.6)
    add(s + i, Math.sin(2 * Math.PI * freq * t) * e * 0.07, 0.3 - 0.6 * k)
  }
}
const RAIL_LAND = AT.flow + F_ENTRY // 347
tick(RAIL_LAND, 3000, 0.16, 0.06)
sub(RAIL_LAND, 120, 45, 0.24, 0.6)
whoosh(RAIL_LAND, 0.9, 0.11, true) // rail streaks outward from the landing

// 4. FLOW — five stations, an ascending pentatonic, one note per step.
// These carry the whole middle of the film, so they sit well above the drone.
const PENT = [261.63, 293.66, 349.23, 392.0, 440.0] // C D F G A
for (let i = 0; i < 5; i++) {
  const arrive = AT.flow + F_ENTRY + i * F_CYCLE
  tick(arrive, 2400, 0.13, 0.05, (i - 2) * 0.2)
  note(arrive, PENT[i], 0.19, 2.2, (i - 2) * 0.22)
  note(arrive, PENT[i] * 2, 0.05, 1.4, (i - 2) * 0.22) // octave, adds sparkle
  if (i > 0) {
    // the hop that got us here
    whoosh(arrive - F_HOP, F_HOP / FPS, 0.13, true, (i - 2) * 0.3)
  }
}

// pull back to the whole flow: a swell landing on the wide view, then a pad
swell(AT.flow + F_OVERVIEW + 20, 1.3, 0.17)
pad(AT.flow + F_OVERVIEW + 10, 130.81, 2.8, 0.13) // C3 under the wide shot
note(AT.flow + F_OVERVIEW + 22, 523.25, 0.10, 2.8, 0) // C5 resolves the ascent

// 5. CUT: rail rotates into the toolkit spine
whoosh(AT.tools - 14, 0.85, 0.16, false)
sub(AT.tools + 8, 100, 40, 0.24)

// 6. TOOLS — the six names land on a steady pulse (26 frames apart, ~69bpm).
// A tick alone was inaudible under the bed, so each name also gets a note:
// a descending line, so the toolkit answers the flow's ascent instead of repeating it.
const TOOL_LINE = [523.25, 440.0, 392.0, 349.23, 329.63, 261.63] // C5 A4 G4 F4 E4 C4
for (let i = 0; i < 6; i++) {
  const at = AT.tools + T_ROLL_START + i * T_PER_TOOL
  tick(at, 1800 + i * 160, 0.2, 0.045, (i - 2.5) * 0.16)
  note(at, TOOL_LINE[i], 0.15, 1.5, (i - 2.5) * 0.18)
}
pad(AT.tools + T_ROLL_START, 130.81, 5.6, 0.09) // holds the section together

// 7. CUT: collapse to a point of light, bloom open
sub(AT.outro, 140, 32, 0.38, 1.1)
whoosh(AT.outro - 10, 0.7, 0.13, false)
shimmer(AT.outro + 6, 0.07, 2.2)

// 8. OUTRO — resolve, then leave in silence for the loop
note(AT.outro + 30, 261.63, 0.17, 3.2, -0.25) // C
note(AT.outro + 34, 392.0, 0.12, 3.2, 0.25) // G
pad(AT.outro + 26, 130.81, 4.0, 0.13)
tick(AT.outro + 84, 2800, 0.09) // the pulse dot

// ─── mix: soft-limit, then write 16-bit PCM ────────────────────────────────
let peak = 0
for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]))

// tanh soft clip keeps transients from splatting, then normalise to -1.5 dBFS
const target = 0.84
const buf = Buffer.alloc(44 + N * CH * 2)
buf.write('RIFF', 0)
buf.writeUInt32LE(36 + N * CH * 2, 4)
buf.write('WAVE', 8)
buf.write('fmt ', 12)
buf.writeUInt32LE(16, 16)
buf.writeUInt16LE(1, 20) // PCM
buf.writeUInt16LE(CH, 22)
buf.writeUInt32LE(SR, 24)
buf.writeUInt32LE(SR * CH * 2, 28)
buf.writeUInt16LE(CH * 2, 32)
buf.writeUInt16LE(16, 34)
buf.write('data', 36)
buf.writeUInt32LE(N * CH * 2, 40)

const drive = peak > 1 ? 1 / peak : 1
let outPeak = 0
const l2 = new Float64Array(N)
const r2 = new Float64Array(N)
for (let i = 0; i < N; i++) {
  l2[i] = Math.tanh(L[i] * drive * 1.15)
  r2[i] = Math.tanh(R[i] * drive * 1.15)
  outPeak = Math.max(outPeak, Math.abs(l2[i]), Math.abs(r2[i]))
}
const norm = outPeak > 0 ? target / outPeak : 1
for (let i = 0; i < N; i++) {
  buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, l2[i] * norm)) * 32767), 44 + i * 4)
  buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, r2[i] * norm)) * 32767), 44 + i * 4 + 2)
}

mkdirSync('public', { recursive: true })
writeFileSync('public/showreel-audio.wav', buf)
console.log(
  `wrote public/showreel-audio.wav — ${(TOTAL / FPS).toFixed(2)}s, ${(buf.length / 1024 / 1024).toFixed(2)} MB`,
)
console.log(`scene frames: identity 0, why ${AT.why}, flow ${AT.flow}, tools ${AT.tools}, outro ${AT.outro}, end ${AT.end}`)
