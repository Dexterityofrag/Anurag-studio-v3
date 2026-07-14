import { Config } from '@remotion/cli/config'

// png frames (not jpeg): jpeg frames are full-range, which forces the encoder to
// yuvj420p/pc and makes the blacks and accent green shift between decoders.
// png gives ffmpeg RGB, so yuv420p comes out limited-range as browsers expect.
Config.setVideoImageFormat('png')
Config.setOverwriteOutput(true)
Config.setPixelFormat('yuv420p')
