import React from 'react'
import { AbsoluteFill } from 'remotion'
import { TransitionSeries, linearTiming } from '@remotion/transitions'
import { theme } from './theme'
import { Scanlines, Vignette, CornerBrackets } from './components/Overlays'
import { Camera } from './components/Camera'
import { zPush, dotDrop, railRotate, bloomOut } from './transitions'
import { Identity } from './scenes/Identity'
import { Why } from './scenes/Why'
import { Flow } from './scenes/Flow'
import { Tools } from './scenes/Tools'
import { Outro } from './scenes/Outro'

export const SHOWREEL_FPS = 30

// flow: 34 entry + 5 stations + pull back to the whole rail + hold on it
const SCENES = { identity: 155, why: 210, flow: 480, tools: 205, outro: 175 }
const CUTS = { zPush: 22, dotDrop: 30, railRotate: 26, bloomOut: 24 }

// scene durations overlap by the length of the cut between them
// 1225 - 102 = 1123 frames ≈ 37.4s
export const SHOWREEL_DURATION =
  Object.values(SCENES).reduce((a, b) => a + b, 0) -
  Object.values(CUTS).reduce((a, b) => a + b, 0)

export const Showreel: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: theme.bg }}>
      <TransitionSeries>
        {/* push in — the name grows until it pushes through the lens */}
        <TransitionSeries.Sequence durationInFrames={SCENES.identity}>
          <Camera duration={SCENES.identity} scaleFrom={1} scaleTo={1.08}>
            <Identity />
          </Camera>
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={zPush()}
          timing={linearTiming({ durationInFrames: CUTS.zPush })}
        />

        {/* settles to scale 1 so the period sits at its layout position for the cut */}
        <TransitionSeries.Sequence durationInFrames={SCENES.why}>
          <Camera duration={SCENES.why} scaleFrom={1.07} scaleTo={1} panY={-10}>
            <Why />
          </Camera>
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={dotDrop()}
          timing={linearTiming({ durationInFrames: CUTS.dotDrop })}
        />

        {/* starts at scale 1 to catch the falling dot; Flow drives its own dolly */}
        <TransitionSeries.Sequence durationInFrames={SCENES.flow}>
          <Camera duration={SCENES.flow} scaleFrom={1} scaleTo={1.04}>
            <Flow />
          </Camera>
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={railRotate()}
          timing={linearTiming({ durationInFrames: CUTS.railRotate })}
        />

        <TransitionSeries.Sequence durationInFrames={SCENES.tools}>
          <Camera duration={SCENES.tools} scaleFrom={1} scaleTo={1.05} panX={-14}>
            <Tools />
          </Camera>
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={bloomOut()}
          timing={linearTiming({ durationInFrames: CUTS.bloomOut })}
        />

        <TransitionSeries.Sequence durationInFrames={SCENES.outro}>
          <Camera duration={SCENES.outro} scaleFrom={1.04} scaleTo={1}>
            <Outro />
          </Camera>
        </TransitionSeries.Sequence>
      </TransitionSeries>

      {/* persistent film-frame overlays, matching the site's video frame */}
      <Scanlines />
      <Vignette />
      <CornerBrackets />
    </AbsoluteFill>
  )
}
