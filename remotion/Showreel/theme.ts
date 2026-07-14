import { loadFont as loadSpaceGrotesk } from '@remotion/google-fonts/SpaceGrotesk'
import { loadFont as loadDMSans } from '@remotion/google-fonts/DMSans'
import { loadFont as loadJetBrainsMono } from '@remotion/google-fonts/JetBrainsMono'

const spaceGrotesk = loadSpaceGrotesk('normal', { weights: ['300', '400', '500', '600', '700'] })
const dmSans = loadDMSans('normal', { weights: ['300', '400', '500', '700'] })
const jetBrainsMono = loadJetBrainsMono('normal', { weights: ['300', '400', '500', '600'] })

// Tokens mirrored from app/globals.css so the reel matches the site exactly
export const theme = {
  bg: '#060606',
  bgAlt: '#0e0e0e',
  fg: '#f0ede8',
  muted: 'rgba(240, 237, 232, 0.42)',
  accent: '#00FF94',
  border: 'rgba(255, 255, 255, 0.05)',
  fontDisplay: spaceGrotesk.fontFamily,
  fontBody: dmSans.fontFamily,
  fontMono: jetBrainsMono.fontFamily,
} as const

export const outlineText = (color: string, width = 1.5): React.CSSProperties => ({
  color: 'transparent',
  WebkitTextStroke: `${width}px ${color}`,
})
