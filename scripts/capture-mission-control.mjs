/**
 * Captures the live Mission Control tool for the case study and the reel.
 *
 *   npm run dev                                  (in another terminal)
 *   node scripts/capture-mission-control.mjs <out-dir>
 *   npx tsx scripts/build-mission-control-assets.ts <out-dir>
 *   npm run reel:mission
 *
 * Drives the system Chrome headless through Playwright. The page is opened with
 * ?capture, which skips the boot screen and exposes window.__mc so the flight
 * can be stepped a fixed amount per frame: the footage is a smooth 30 fps no
 * matter how long each screenshot takes.
 *
 * Writes <out>/stills/*.png at 3840x2160 and <out>/flight.mp4 (needs ffmpeg).
 */
import { chromium } from 'playwright'
import { mkdirSync, rmSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

const OUT = process.argv[2]
if (!OUT) { console.error('usage: capture-mission-control.mjs <out-dir>'); process.exit(1) }
const URL = process.env.MC_URL ?? 'http://localhost:3000/work/mission-control/live'
mkdirSync(`${OUT}/stills`, { recursive: true })
rmSync(`${OUT}/frames`, { recursive: true, force: true })
mkdirSync(`${OUT}/frames`, { recursive: true })

const browser = await chromium.launch({ channel: 'chrome', headless: true })
const errors = []

async function open(dsf, capture = true) {
  const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: dsf })
  if (capture) await ctx.addInitScript(() => { try { localStorage.setItem('mc.onboarded.v1', '1') } catch {} })
  const p = await ctx.newPage()
  p.on('pageerror', e => errors.push(String(e)))
  await p.goto(URL + (capture ? '?capture' : ''), { waitUntil: 'networkidle' })
  await p.waitForTimeout(1500)
  return p
}
const settle = async p => { await p.waitForLoadState('networkidle'); await p.waitForTimeout(900) }
const setField = (p, key, v) => p.evaluate(([k, x]) => {
  const i = document.querySelector(`[data-key=${k}]`); i.value = x; i.dispatchEvent(new Event('input', { bubbles: true }))
}, [key, v])

/* ── stills, 2x ── */
let p = await open(2)
await p.screenshot({ path: `${OUT}/stills/plan.png` })
await p.evaluate(() => __mc.select('survey')); await settle(p)
await p.screenshot({ path: `${OUT}/stills/survey.png` })
await setField(p, 'alt', 150); await p.waitForTimeout(600)
await p.evaluate(() => __mc.tab('checks')); await settle(p)
await p.screenshot({ path: `${OUT}/stills/checks.png` })
await setField(p, 'alt', 50); await p.waitForTimeout(600)
await p.evaluate(() => __mc.tab('brief')); await p.waitForTimeout(400)
await p.screenshot({ path: `${OUT}/stills/brief.png` })
await p.context().close()

// the export menu over a taller code panel, so the code is legible
p = await open(2)
await p.evaluate(() => { __mc.tab('code'); document.querySelector('#drawer').style.height = '560px' })
await p.waitForTimeout(800)
await p.evaluate(() => { const c = document.querySelector('#code'); c.scrollTop = c.scrollHeight * 0.52 })
await p.click('#btn-export'); await p.waitForTimeout(400)
await p.screenshot({ path: `${OUT}/stills/export.png` })
await p.context().close()

// a real first visit: the boot screen
p = await open(2, false)
await p.waitForTimeout(1300)   // the systems check has ticked through and the buttons are up
await p.screenshot({ path: `${OUT}/stills/boot.png` })
await p.context().close()

// the moment the battery failsafe takes over, for the thumbnails
p = await open(2)
await p.evaluate(() => __mc.setMode('sim')); await settle(p)
await p.evaluate(() => __mc.launch())
for (let i = 0; i < 151; i++) await p.evaluate(() => __mc.step(0.75))
await p.evaluate(() => { __mc.inject('battery'); __mc.inject('battery') })
for (let i = 0; i < 400; i++) {
  const s = await p.evaluate(() => __mc.step(0.75))
  if (s.mode !== 'Main program') { for (let k = 0; k < 40; k++) await p.evaluate(() => __mc.step(0.75)); break }
}
await settle(p)
await p.screenshot({ path: `${OUT}/stills/midflight.png` })
await p.context().close()

/* ── flight footage, 1x, 30 fps ── */
p = await open(1)
await p.evaluate(() => __mc.setMode('sim')); await settle(p)
await p.evaluate(() => __mc.launch())
let f = 0
const shot = () => p.screenshot({ path: `${OUT}/frames/${String(f++).padStart(4, '0')}.png` })
for (let i = 0; i < 20; i++) await shot()
for (let i = 0; i < 600; i++) {
  const s = await p.evaluate(sec => __mc.step(sec), 0.75)
  if (i === 150) await p.evaluate(() => { __mc.inject('battery'); __mc.inject('battery') })
  if (i % 60 === 0) await p.waitForLoadState('networkidle').catch(() => {})
  await shot()
  if (s.done) { for (let k = 0; k < 45; k++) await shot(); break }
}
await browser.close()

execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', '30', '-i', `${OUT}/frames/%04d.png`,
  '-c:v', 'libx264', '-crf', '16', '-preset', 'slow', '-pix_fmt', 'yuv420p', `${OUT}/flight.mp4`])
console.log(`  ${f} frames, ${errors.length} page errors`, errors)
