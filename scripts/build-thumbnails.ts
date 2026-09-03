/**
 * Compose project thumbnails from real UI screenshots.
 *
 *   npm run thumbs
 *
 * Two masters per project, because no single aspect ratio survives every slot
 * the site renders a project image into:
 *
 *   wide     2400x1350 (16:9)  -> coverUrl      desktop cards, detail hero
 *   portrait 1200x1500 (4:5)   -> thumbnailUrl  homepage strip, every mobile card
 *
 * Composition rules, derived from the overlays the site paints on top:
 *   - A gradient darkens the BOTTOM THIRD of every card to 0.92 opacity, where
 *     the title and tagline sit. So the subject lives in the upper two thirds.
 *   - The work-page large card crops the wide master to 2.27:1, taking the
 *     height down to ~1058px of 1350. Keep the subject inside that centre band.
 *   - Thumbnails carry no text of their own; the site supplies all typography.
 */
import { mkdirSync, existsSync } from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const PUBLIC = path.join(process.cwd(), 'public')

type Shot = { file: string; scale?: number; dx?: number; dy?: number; rotate?: number }

type Recipe = {
  slug: string
  /** Background field, taken from the project's own palette. */
  bg: string
  /** Accent used for the ambient glow behind the screens. */
  glow: string
  /** Source screenshots, drawn back-to-front. Paths relative to public/. */
  wide: Shot[]
  portrait: Shot[]
}

/* ── Canvas specs ───────────────────────────────────────────── */
const WIDE = { w: 2400, h: 1350, centre: 0.46 }
const PORTRAIT = { w: 1200, h: 1500, centre: 0.40 }

/**
 * `centre` is where the subject sits vertically, as a fraction of canvas height.
 *
 * It differs per master because the crops differ. The work-page large card
 * takes the 16:9 wide master down to 2.27:1, cutting ~145px from the top and
 * bottom of 1350 — so the subject must sit inside 145..1205. The portrait
 * master gets squared off on mobile, losing 150px top and bottom of 1500.
 * Both then have their bottom third darkened by the card gradient, which is
 * why neither sits dead centre.
 */

/* ── Background: flat field + soft radial glow ──────────────── */
function backdrop(w: number, h: number, bg: string, glow: string, centre: number) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
    <defs>
      <radialGradient id="g" cx="50%" cy="${centre * 100}%" r="62%">
        <stop offset="0%"   stop-color="${glow}" stop-opacity="0.30"/>
        <stop offset="45%"  stop-color="${glow}" stop-opacity="0.10"/>
        <stop offset="100%" stop-color="${glow}" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="v" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"   stop-color="#000" stop-opacity="0.16"/>
        <stop offset="55%"  stop-color="#000" stop-opacity="0"/>
        <stop offset="100%" stop-color="#000" stop-opacity="0.30"/>
      </linearGradient>
    </defs>
    <rect width="${w}" height="${h}" fill="${bg}"/>
    <rect width="${w}" height="${h}" fill="url(#g)"/>
    <rect width="${w}" height="${h}" fill="url(#v)"/>
  </svg>`
  return Buffer.from(svg)
}

/** Round the corners of a screenshot so it reads as a device screen, not a crop. */
async function rounded(buf: Buffer, w: number, h: number, radius: number) {
  const mask = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
       <rect width="${w}" height="${h}" rx="${radius}" ry="${radius}" fill="#fff"/>
     </svg>`,
  )
  return sharp(buf)
    .resize(w, h, { fit: 'fill' })
    .composite([{ input: mask, blend: 'dest-in' }])
    .png()
    .toBuffer()
}

/**
 * `r` is deliberately narrower than `Recipe`: composition only ever needs the
 * two palette values. Keeping it that way lets the case-study figure builder
 * reuse this geometry without inventing a fake thumbnail recipe around it.
 */
async function compose(canvas: { w: number; h: number; centre: number }, r: { bg: string; glow: string }, shots: Shot[]) {
  const base = sharp(backdrop(canvas.w, canvas.h, r.bg, r.glow, canvas.centre)).png()
  const layers: sharp.OverlayOptions[] = []

  for (const shot of shots) {
    const src = path.join(PUBLIC, shot.file)
    if (!existsSync(src)) throw new Error(`missing source: ${shot.file}`)

    const meta = await sharp(src).metadata()
    const srcW = meta.width ?? 1
    const srcH = meta.height ?? 1

    // Scale relative to canvas height so screens feel consistent across masters.
    const targetH = Math.round(canvas.h * (shot.scale ?? 0.72))
    const targetW = Math.round((srcW / srcH) * targetH)

    // .rotate() with no argument bakes in EXIF orientation. Without it, a
    // source photo stored sideways with a rotation flag composites sideways —
    // exactly what happened to the About page portrait.
    let png = await rounded(await sharp(src).rotate().toBuffer(), targetW, targetH, Math.round(targetW * 0.055))

    if (shot.rotate) {
      png = await sharp(png).rotate(shot.rotate, { background: { r: 0, g: 0, b: 0, alpha: 0 } }).toBuffer()
    }

    const placed = await sharp(png).metadata()
    const pw = placed.width ?? targetW
    const ph = placed.height ?? targetH

    layers.push({
      input: png,
      left: Math.round(canvas.w / 2 - pw / 2 + (shot.dx ?? 0) * canvas.w),
      top: Math.round(canvas.h * canvas.centre - ph / 2 + (shot.dy ?? 0) * canvas.h),
    })
  }

  return base.composite(layers).webp({ quality: 88 }).toBuffer()
}

export async function build(recipes: Recipe[]) {
  for (const r of recipes) {
    const dir = path.join(PUBLIC, 'projects', r.slug)
    mkdirSync(dir, { recursive: true })

    const wide = await compose(WIDE, r, r.wide)
    const portrait = await compose(PORTRAIT, r, r.portrait)

    await sharp(wide).toFile(path.join(dir, 'thumb-wide.webp'))
    await sharp(portrait).toFile(path.join(dir, 'thumb-portrait.webp'))

    const kb = (b: Buffer) => Math.round(b.length / 1024)
    console.log(`  ${r.slug.padEnd(30)} wide ${kb(wide)}KB   portrait ${kb(portrait)}KB`)
  }
}

export type { Recipe, Shot }
export { WIDE, PORTRAIT, compose, backdrop, rounded }
