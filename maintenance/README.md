# Maintenance page

Self-contained. No build step, no dependencies, no network calls except Google Fonts
(which has a full fallback stack, so it renders fine if that is blocked).

## Files

| File | Purpose |
|---|---|
| `index.html` | The page. Everything is inlined. |
| `404.html` | Byte-identical copy, so unknown paths show the page instead of a Cloudflare 404. |
| `_redirects` | `/* /index.html 200`, catches every path including old `/work/*` and `/blog/*` URLs. |
| `_worker.js` | Serves the page with **HTTP 503 + Retry-After** for every path. |

### Why `_worker.js` and not `functions/`

Cloudflare Pages only compiles a `functions/` directory on **Git-connected builds**. A
drag-and-drop **Direct Upload ignores it entirely**, which is why the first deploy came
back as 200 on the homepage and 404 on every other path. `_worker.js` at the project
root is the Direct Upload equivalent and it does run.

While `_worker.js` exists, Pages runs in Advanced Mode and `_redirects`, `_headers` and
`404.html` are bypassed. The worker already catches every path, so nothing is lost.
They stay in the folder as a fallback if the worker is ever deleted.

### Why the 503 matters

- **200** tells search engines every URL on anurag.studio now genuinely contains the
  words "BACK SOON", so the real pages get replaced in the index.
- **404** is worse. It tells them the pages are permanently gone and should be deleted
  from search, which is what the first deploy was accidentally saying about every case
  study and blog post.
- **503** says "temporarily unavailable, come back later". That is true, and existing
  rankings are held while the site is rebuilt.

## Deploy to Cloudflare Pages

1. Cloudflare dashboard, **Workers & Pages**, **Create**, **Pages**, **Upload assets**.
2. Drag this entire `maintenance` folder in. Name the project `anurag-studio-maintenance`.
3. **Custom domains**, add `anurag.studio` and `www.anurag.studio`.

The domain has to be on Cloudflare first, see `MIGRATION.md` step 1.

## What is interactive

- Cursor-reactive particle field. Points drift, link to neighbours, and lean toward
  the pointer, turning green in range. Touch works too.
- Scrambling `BACK SOON` headline that resolves on load.
- `status.log` terminal that types itself out. It holds while the tab is in the
  background rather than crawling at the throttled 1 char per second.
- **Enquire** panel, opened by the button or the `E` key, closed with `Esc` or the
  scrim. Focus is trapped and restored.
- **Copy email** with a toast confirmation, `execCommand` fallback for old browsers.

## The Enquire button

There is no backend, so the form composes a pre-filled `mailto:` draft addressed to
`anuragprivate2002@gmail.com` and opens the visitor's mail app. Nothing sends on its
own. Name and email are validated first, and the address is also shown as a plain
link in case no mail client is installed.

To change the address, edit the `EMAIL` constant near the top of the `<script>`, the
`id="direct"` link in the enquire panel, and re-copy `index.html` over `404.html`.

Once Cloudflare Email Routing is live you can switch both to `hello@anurag.studio`.

## Accessibility

Respects `prefers-reduced-motion` (animations collapse, the log renders complete and
static). Live regions on the log and toast, `aria-modal` and focus trap on the panel,
visible focus rings, and it survives down to a 320px viewport.
