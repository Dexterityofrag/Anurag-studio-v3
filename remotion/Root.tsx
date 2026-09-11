import React from 'react'
import { Composition } from 'remotion'
import { Showreel, SHOWREEL_DURATION, SHOWREEL_FPS } from './Showreel/Showreel'
import { ShowreelSound } from './Showreel/ShowreelSound'
import { KharchaIntro, INTRO_DURATION, INTRO_FPS } from './KharchaIntro/KharchaIntro'

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* silent — this is the one on the site, where it autoplays muted */}
      <Composition
        id="Showreel"
        component={Showreel}
        durationInFrames={SHOWREEL_DURATION}
        fps={SHOWREEL_FPS}
        width={1920}
        height={1080}
      />
      {/* same picture with the synthesised sound design — for LinkedIn */}
      <Composition
        id="ShowreelSound"
        component={ShowreelSound}
        durationInFrames={SHOWREEL_DURATION}
        fps={SHOWREEL_FPS}
        width={1920}
        height={1080}
      />
      {/* Kharchaaaa product intro. Shorter and quieter than the showreel: it
          plays on one case study rather than standing for the whole studio. */}
      <Composition
        id="KharchaIntro"
        component={KharchaIntro}
        durationInFrames={INTRO_DURATION}
        fps={INTRO_FPS}
        width={1920}
        height={1080}
      />
    </>
  )
}
