/**
 * Exports both CV documents to PDF with live, tappable links.
 *
 * Chromium's page.pdf() turns every <a href> into a real PDF link annotation,
 * which is why the CVs are rendered from the /cv routes rather than typeset in
 * a document tool. Output goes to out/cv/, which is gitignored, so the phone
 * number in the header never ships with the site.
 *
 * Needs the dev server running (npm run dev):
 *
 *   node --experimental-strip-types scripts/render-cv.ts
 */
import { mkdirSync } from 'node:fs'
import { chromium } from 'playwright'

const BASE = process.env.CV_BASE_URL ?? 'http://localhost:3000'
const OUT_DIR = 'out/cv'

/** A4 height in CSS pixels at 96dpi, used to report page count before export. */
const A4_PAGE_PX = (297 / 25.4) * 96

const DOCS = [
    { route: '/cv/designed', file: 'Anurag-Adhikari-CV.pdf', expectedPages: 1 },
    { route: '/cv/ats', file: 'Anurag-Adhikari-CV-ATS.pdf', expectedPages: 2 },
    { route: '/cv/letter', file: 'Anurag-Adhikari-Cover-Letter.pdf', expectedPages: 1 },
]

const main = async () => {
    mkdirSync(OUT_DIR, { recursive: true })

    const browser = await chromium.launch()
    const page = await browser.newPage()

    // page.pdf() already renders with print media; matching it here means the
    // height measured below is the height that actually gets paginated.
    await page.emulateMedia({ media: 'print' })

    let failed = false

    for (const doc of DOCS) {
        const url = `${BASE}${doc.route}`

        try {
            await page.goto(url, { waitUntil: 'networkidle', timeout: 20_000 })
        } catch {
            console.error(`✗ could not reach ${url}. Is the dev server running?`)
            failed = true
            continue
        }

        // Space Grotesk, DM Sans, and JetBrains Mono all load over the network.
        // Paginating before they settle would measure the fallback metrics.
        await page.evaluate(() => document.fonts.ready)

        const { heightPx, textLength } = await page.evaluate(() => {
            const el = document.querySelector('main')
            return {
                heightPx: el ? el.getBoundingClientRect().height : 0,
                textLength: el?.textContent?.trim().length ?? 0,
            }
        })

        // The dev server can serve a route mid-recompile, which renders an empty
        // document. Chromium will happily turn that into a blank one page PDF and
        // nothing downstream would notice, so refuse to write it.
        if (textLength < 500 || heightPx < 400) {
            console.error(
                `✗ ${doc.route} rendered almost empty (${textLength} chars, ${Math.round(heightPx)}px). ` +
                    'Not writing a blank PDF. Retry once the dev server has finished compiling.',
            )
            failed = true
            continue
        }

        const pages = Math.max(1, Math.ceil(heightPx / A4_PAGE_PX - 0.02))

        await page.pdf({
            path: `${OUT_DIR}/${doc.file}`,
            format: 'A4',
            printBackground: true,
            // Hands margin control to the @page rule each document sets.
            preferCSSPageSize: true,
        })

        const over = pages > doc.expectedPages
        if (over) failed = true
        console.log(
            `${over ? '✗' : '✓'} ${OUT_DIR}/${doc.file}  ${pages} page${pages === 1 ? '' : 's'}` +
                (over ? `  (expected ${doc.expectedPages}, content is overflowing)` : ''),
        )
    }

    await browser.close()
    if (failed) process.exitCode = 1
}

main().catch(err => {
    console.error(err)
    process.exit(1)
})
