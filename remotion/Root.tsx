import React from 'react'
import { Composition } from 'remotion'
import { Showreel, SHOWREEL_DURATION, SHOWREEL_FPS } from './Showreel/Showreel'
import { ShowreelSound } from './Showreel/ShowreelSound'

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
    </>
  )
}
