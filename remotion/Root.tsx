import React from 'react'
import { Composition } from 'remotion'
import { Showreel, SHOWREEL_DURATION, SHOWREEL_FPS } from './Showreel/Showreel'

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Showreel"
      component={Showreel}
      durationInFrames={SHOWREEL_DURATION}
      fps={SHOWREEL_FPS}
      width={1920}
      height={1080}
    />
  )
}
