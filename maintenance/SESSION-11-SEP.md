# Session notes, 11 Sep 2026

Handoff for the 6:52 PM wake-up, or anyone picking this up cold.
Branch `feat/kharchaaaa-app`. **Nothing has been committed.**

---

## What landed

### Kharchaaaa case study and waitlist
- `scripts/seed-kharchaaaa.ts`, `npm run seed:kharchaaaa`. Seeded, order 2.
- Six screens in `public/projects/kharchaaaa/`, captured from the real app at
  390x844 @3 by seeding a session and a book into localStorage. The lock screen
  was not bypassed: `auth.boot()` opens the app on a cached session when the
  account API is unreachable, and a static serve is exactly that case.
- `/waitlist` route, `components/waitlist/WaitlistForm.tsx`,
  `app/actions/waitlist.ts`.
- `lib/project-cta.ts` lets a slug override the closing CTA with an internal
  link. Kharchaaaa uses it for "Invite only, tap to join the waitlist".
- `remotion/KharchaIntro/` — 11s product intro, registered in `Root.tsx`,
  rendered to `public/projects/kharchaaaa/intro.mp4`. `npm run intro:kharcha`.

### HR OS, fully recaptured
The set in `portfolio-handoff/` was taken 2026-09-04 18:20 and **eleven commits
landed on `apps/web` after it**, including `a79dbd7` "flip the visual language
to Crextio, cream plane, white cards". Every one of those images showed a dark
product that no longer exists, and several pointed at routes that had been
folded away.

- Recaptured 30 desktop + 5 mobile against the current build, DEMO database.
- Route changes found: `/register` and `/leave` are now `/attendance?tab=`,
  `/payroll` and `/expenses` are `/money?tab=`, `/admin/*` is gone (one roster,
  at `/employees`), `/actions` folded into `/me`. Nav went seven slots to four.
- `scripts/seed-hr-os.ts` updated: new screens, new palette, and a new section
  in the body about the rebuild.
- Palette in `lib/project-palette.ts` corrected from `#161617 / #03c37b` to
  `#1c1c1e / #f5c518`.

### Raj Associates, added as ongoing
- `scripts/seed-raj-associates.ts`, `npm run seed:raj`. Seeded, order 3.
- `externalUrl` is deliberately **null** so the closing line reads "Not publicly
  live". The domain was still propagating and the firm's photographs are not in.
- Deliberately kept out of the copy: commercial terms and any fee figure, the
  principal's named corporate clients, personal contact details, the unresolved
  postcode, and the whole client-relationship narrative.

### Tooling
- `web-scraping` skill installed to `~/.claude/skills/web-scraping`
  (from github.com/yfe404/web-scraper, MIT, docs and examples only, no install
  hooks). Available in every project for this user. macOS has no true
  all-users location for Claude Code skills without an admin password.

---

## Open, needs a person

1. **Delete two test rows** from the waitlist Sheet: `TEST ROW - delete me` and
   `TEST 2 browser - delete me`.
2. **A real bug in HR OS, still live.**
   `apps/web/components/arrival-distribution.tsx` computes
   `((categories.onTime / total) * 100).toFixed(1)` with no guard for
   `total === 0`. `hros_demo` has zero `DevicePunch` rows with
   `source='LEGACY_IMPORT' AND direction='IN'`, so every category divides 0/0
   and the Attendance "Today" tab renders `NaN%` on **any** date. This is the
   same defect `portfolio-handoff/NOTES.md` flagged on 4 Sep. `03-attendance` is
   kept out of the case study set because of it.
3. **A demo account's password was changed.** `aarav.sharma@example.com` in
   **`hros_demo` only** now has the password `PortfolioShot2026!` with
   `mustChangePassword` cleared, so the capture could sign in. Fictional data,
   demo database, reset it whenever. The office database `hros` was never opened.
4. **Secrets sitting in plaintext.** `Jumpking Main/hr-os/.env` holds a live
   Telegram bot token, the Hikvision terminal's admin password and the PII
   encryption key. Gitignored, but readable by anything running as this user.
   Separately, `~/kharchaaaa` still has its own bot token to rotate.
5. **Nothing is committed.** Review and commit when ready.

---

## Traps worth not falling into twice

**Do not screenshot with `animation: none !important`.** HR OS reveals nearly
every card with `.reveal { opacity: 0; animation: reveal-rise ... forwards }`.
Killing the animation pins the element at opacity 0, and the first pass produced
thirty screenshots of an empty cream page with a nav bar on it. Every text-based
check passed, because `innerText` still reads text from invisible elements.
Emulate `prefers-reduced-motion: reduce` instead, which the app already handles
correctly. The capture script also learned to count elements still under 0.9
opacity and fail loudly.

**`hr-os/.claude/launch.json` already has a `hr-os-web-demo` entry** pointing at
`hros_demo` on port 3100. Use it rather than writing an `.env.local` override.

**Apps Script always answers HTTP 200.** The real status is in the JSON body, so
check `parsed.status !== 200`, not `res.ok`. A rejected row otherwise reads as a
success.
