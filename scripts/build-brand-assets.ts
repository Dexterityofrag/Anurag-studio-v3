/**
 * Generate the social share card and app icons.
 *
 *   npm run brand
 *
 * The Open Graph image used to be a portrait photo, so every shared link put
 * Anurag's face in the preview. This replaces it with a branded card in the
 * site's own language: near-black field, HUD corner brackets, scanlines and
 * the signal-green accent.
 *
 * Text is drawn with system faces rather than the site's Space Grotesk, because
 * sharp's SVG renderer resolves installed fonts only and cannot load the
 * next/font woff2 files. Helvetica Neue is close enough in the weights used.
 */
import { mkdirSync } from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const PUBLIC = path.join(process.cwd(), 'public')
const APP = path.join(process.cwd(), 'app')

const INK = '#f0ede8'
const BG = '#060606'
const ACCENT = '#00FF94'
const DISPLAY = 'Helvetica Neue, Helvetica, Arial, sans-serif'
const MONO = 'SF Mono, Menlo, Monaco, monospace'

/** Repeating 2px scanlines, matching the treatment used across the site. */
function scanlines(w: number, h: number, opacity = 0.028) {
  let out = ''
  for (let y = 0; y < h; y += 4) {
    out += `<rect x="0" y="${y + 2}" width="${w}" height="2" fill="#000" opacity="${opacity}"/>`
  }
  return out
}

/** HUD corner brackets, as used on the project cards. */
function corners(w: number, h: number, inset: number, size: number, sw = 2) {
  const c = 'rgba(255,255,255,0.16)'
  const L = (x1: number, y1: number, x2: number, y2: number) =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="${sw}"/>`
  return [
    L(inset, inset, inset + size, inset), L(inset, inset, inset, inset + size),
    L(w - inset - size, inset, w - inset, inset), L(w - inset, inset, w - inset, inset + size),
    L(inset, h - inset, inset + size, h - inset), L(inset, h - inset - size, inset, h - inset),
    L(w - inset - size, h - inset, w - inset, h - inset), L(w - inset, h - inset - size, w - inset, h - inset),
  ].join('')
}

/* ── 1200x630 Open Graph card ───────────────────────────────── */
function ogCard() {
  const w = 1200, h = 630
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
  <defs>
    <radialGradient id="glow" cx="50%" cy="42%" r="62%">
      <stop offset="0%" stop-color="${ACCENT}" stop-opacity="0.13"/>
      <stop offset="55%" stop-color="${ACCENT}" stop-opacity="0.03"/>
      <stop offset="100%" stop-color="${ACCENT}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="${BG}"/>
  <rect width="${w}" height="${h}" fill="url(#glow)"/>
  ${scanlines(w, h)}
  ${corners(w, h, 34, 30)}

  <text x="${w / 2}" y="118" text-anchor="middle" font-family="${MONO}" font-size="17"
        letter-spacing="7" fill="rgba(240,237,232,0.36)">ANURAG.STUDIO</text>

  <text x="${w / 2}" y="316" text-anchor="middle" font-family="${DISPLAY}" font-size="146"
        font-weight="700" letter-spacing="-5" fill="${INK}">ANURAG</text>
  <text x="${w / 2}" y="430" text-anchor="middle" font-family="${DISPLAY}" font-size="146"
        font-weight="700" letter-spacing="-5" fill="none"
        stroke="rgba(240,237,232,0.30)" stroke-width="2">ADHIKARI</text>

  <circle cx="${w / 2 - 290}" cy="516" r="5" fill="${ACCENT}"/>
  <text x="${w / 2}" y="522" text-anchor="middle" font-family="${MONO}" font-size="20"
        letter-spacing="4.5" fill="${ACCENT}">PRODUCT DESIGNER · DEVELOPER</text>
  <circle cx="${w / 2 + 290}" cy="516" r="5" fill="${ACCENT}"/>
</svg>`)
}

/* ── Square app icon ────────────────────────────────────────── */
function iconSquare(size: number) {
  const r = Math.round(size * 0.22)
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
  <defs>
    <radialGradient id="g" cx="50%" cy="38%" r="70%">
      <stop offset="0%" stop-color="${ACCENT}" stop-opacity="0.20"/>
      <stop offset="100%" stop-color="${ACCENT}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${r}" ry="${r}" fill="${BG}"/>
  <rect width="${size}" height="${size}" rx="${r}" ry="${r}" fill="url(#g)"/>
  <text x="50%" y="${size * 0.70}" text-anchor="middle" font-family="${DISPLAY}"
        font-size="${size * 0.60}" font-weight="700" letter-spacing="-2" fill="${INK}">A</text>
  <circle cx="${size * 0.755}" cy="${size * 0.652}" r="${size * 0.062}" fill="${ACCENT}"/>
</svg>`)
}

async function main() {
  mkdirSync(PUBLIC, { recursive: true })

  await sharp(ogCard()).png().toFile(path.join(PUBLIC, 'og.png'))
  console.log('  public/og.png              1200x630')

  await sharp(iconSquare(512)).png().toFile(path.join(APP, 'icon.png'))
  console.log('  app/icon.png               512x512')

  await sharp(iconSquare(180)).png().toFile(path.join(APP, 'apple-icon.png'))
  console.log('  app/apple-icon.png         180x180')

  // Multi-size .ico is not worth a dependency; a 48px PNG named .ico is served
  // fine by every current browser, and app/icon.png covers the modern path.
  await sharp(iconSquare(48)).png().toFile(path.join(PUBLIC, 'favicon-48.png'))
  console.log('  public/favicon-48.png      48x48')
}

main().catch((e) => {
  console.error('build-brand-assets failed:', e)
  process.exit(1)
})
