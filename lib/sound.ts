'use client'

/**
 * useSound - Web Audio API synthesized UI sounds
 *
 * Matches andrewreff.com's approach: zero external files, pure oscillator synthesis.
 * All sounds are short (< 150ms) and respect prefers-reduced-motion.
 *
 * SOUNDS:
 *   hover()     - soft high tick (cursor enters interactive element)
 *   click()     - slightly deeper, short blip (mousedown)
 *   drag()      - low rumble / noise burst (drag start)
 *   snap()      - satisfying spring "thwack" (snap-back complete)
 *   success()   - ascending two-tone chime (save / copy)
 *   error()     - short low buzz (error state)
 */

let ctx: AudioContext | null = null

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null
  if (!ctx) ctx = new (window.AudioContext || (window as Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)()
  if (ctx.state === 'suspended') ctx.resume().catch(() => {})
  return ctx
}

/** Play a simple oscillator tone */
function tone(
  freq: number,
  duration: number,
  type: OscillatorType = 'sine',
  gainPeak = 0.15,
  freqEnd?: number,
  startDelay = 0,
) {
  const c = getCtx()
  if (!c) return

  const t = c.currentTime + startDelay
  const osc  = c.createOscillator()
  const gain = c.createGain()

  osc.connect(gain)
  gain.connect(c.destination)

  osc.type      = type
  osc.frequency.setValueAtTime(freq, t)
  if (freqEnd !== undefined) {
    osc.frequency.exponentialRampToValueAtTime(freqEnd, t + duration)
  }

  // attack → sustain → release
  gain.gain.setValueAtTime(0, t)
  gain.gain.linearRampToValueAtTime(gainPeak, t + 0.008)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration)

  osc.start(t)
  osc.stop(t + duration + 0.01)
}

/** Play a burst of filtered noise (drag / rumble) */
function noise(duration: number, gainPeak = 0.06, startDelay = 0) {
  const c = getCtx()
  if (!c) return

  const t = c.currentTime + startDelay

  // Generate noise buffer
  const bufferSize = Math.ceil(c.sampleRate * duration)
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1

  const src    = c.createBufferSource()
  const filter = c.createBiquadFilter()
  const gain   = c.createGain()

  src.buffer = buffer
  filter.type      = 'bandpass'
  filter.frequency.value = 400
  filter.Q.value         = 0.8

  src.connect(filter)
  filter.connect(gain)
  gain.connect(c.destination)

  gain.gain.setValueAtTime(0, t)
  gain.gain.linearRampToValueAtTime(gainPeak, t + 0.015)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + duration)

  src.start(t)
  src.stop(t + duration + 0.01)
}

/* ─────────────────────────────────────────────────────────────── */
/*  Exported sound presets                                         */
/* ─────────────────────────────────────────────────────────────── */

export const sound = {
  /**
   * Soft high-freq tick - cursor enters a hoverable element
   * Similar to the subtle blip on andrewreff.com hover
   */
  hover() {
    tone(1800, 0.07, 'sine', 0.06, 1600)
  },

  /**
   * Short click blip - mousedown on interactive element
   */
  click() {
    tone(900, 0.07, 'triangle', 0.10, 700)
  },

  /**
   * Low noise burst - drag start
   */
  drag() {
    noise(0.09, 0.05)
    tone(320, 0.08, 'triangle', 0.06, 280)
  },

  /**
   * Spring "thwack" - snap back completed
   * Two rapid tones: impact + resonance
   */
  snap() {
    tone(500, 0.06, 'triangle', 0.18, 250)
    tone(1200, 0.12, 'sine', 0.08, 1000, 0.06)
  },

  /**
   * Ascending two-tone chime - save/copy success
   */
  success() {
    tone(660, 0.10, 'sine', 0.12)
    tone(990, 0.12, 'sine', 0.10, undefined, 0.12)
  },

  /**
   * Short low buzz - error
   */
  error() {
    tone(160, 0.12, 'sawtooth', 0.10, 120)
  },

  /**
   * Subtle whoosh - page transition / panel change
   */
  whoosh() {
    noise(0.14, 0.04)
    tone(2400, 0.14, 'sine', 0.04, 600)
  },
}

export default sound
