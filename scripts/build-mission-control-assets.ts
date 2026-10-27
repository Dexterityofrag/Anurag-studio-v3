/**
 * Every Mission Control image on the site, from one folder of raw captures.
 *
 *   npx tsx scripts/build-mission-control-assets.ts <captures-dir>
 *
 * The captures come from scripts/capture-mission-control.mjs (3840x2160 stills
 * of the live tool, plus flight.mp4). This writes:
 *
 *   public/projects/mission-control/case/live-*.webp   case study figures
 *   public/projects/mission-control/reel/*             sources for the Remotion reel
 *   public/projects/mission-control/thumb-*.webp       /work card and hero, redrawn in place
 *   public/projects/mission-control/reel-poster.jpg    the film's first frame on the case study
 *
 * Thumbnails keep their filenames so the database row does not have to change.
 */
import { copyFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const SRC = process.argv[2]
if (!SRC) { console.error('usage: build-mission-control-assets.ts <captures-dir>'); process.exit(1) }

const OUT = path.join(process.cwd(), 'public', 'projects', 'mission-control')
const CASE = path.join(OUT, 'case')
const REEL = path.join(OUT, 'reel')

async function main() {
  mkdirSync(CASE, { recursive: true })
  mkdirSync(REEL, { recursive: true })

  for (const name of ['plan', 'survey', 'checks', 'sim', 'code', 'boot']) {
    // the simulate figure is the moment the failsafe takes over, not the landed end state,
  // and the code figure is the export menu over a taller code panel
    await sharp(path.join(SRC, 'stills', `${{ sim: 'midflight', code: 'export' }[name] ?? name}.png`)).resize({ width: 2400 }).webp({ quality: 84 }).toFile(path.join(CASE, `live-${name}.webp`))
  }
  for (const name of ['plan', 'survey', 'checks', 'export']) {
    await sharp(path.join(SRC, 'stills', `${name}.png`)).jpeg({ quality: 88, mozjpeg: true }).toFile(path.join(REEL, `${name}.jpg`))
  }
  copyFileSync(path.join(SRC, 'flight.mp4'), path.join(REEL, 'flight.mp4'))

  // The cards are one tight crop of the flight, not a composite of shrunken
  // screens: on a black field two dark UIs side by side read as murk. The crop
  // holds the gauges, the survey and the orange failsafe trail turning home.
  const mid = path.join(SRC, 'stills', 'midflight.png')
  const crop = (x: number, y: number, w: number, h: number) => ({ left: Math.round(x * 3.2), top: Math.round(y * 3.2), width: Math.round(w * 3.2), height: Math.round(h * 3.2) })
  await sharp(mid).extract(crop(146, 38, 864, 486)).resize(2400, 1350).webp({ quality: 84 }).toFile(path.join(OUT, 'thumb-wide.webp'))
  await sharp(mid).extract(crop(412, 40, 344, 430)).resize(1200, 1500).webp({ quality: 84 }).toFile(path.join(OUT, 'thumb-portrait.webp'))
  // the film's poster is the wide card, so the frame shown before playback carries no caption
  await sharp(path.join(OUT, 'thumb-wide.webp')).resize({ width: 1920 }).jpeg({ quality: 84, mozjpeg: true }).toFile(path.join(OUT, 'reel-poster.jpg'))
  console.log('  mission-control assets written')
}

main().catch(e => { console.error(e); process.exit(1) })
