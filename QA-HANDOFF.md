# QA Handoff — Items Needing Your Input

Generated 2026-04-25. All autonomous fixes already landed; this file lists what is **left** because it requires a decision or secret only you have.

## 🔴 Blockers (production-impacting)

### 1. `RESEND_API_KEY` missing in `.env.local`
- **Symptom before fix:** contact form returned a hard 500 (Resend constructor threw at module load).
- **What I changed:** [`app/actions/contact.ts`](app/actions/contact.ts) now lazy-initializes Resend, returns a friendly "Email service is not configured" message, and HTML-escapes user input. So the form no longer crashes — but it also can't actually send mail.
- **What you need to do:** add `RESEND_API_KEY=re_...` to `.env.local` (and your prod env). Also: the `from:` address is `onboarding@resend.dev` which is Resend's sandbox sender — once you've verified your domain in Resend, swap it for something like `noreply@anurag.studio`.

### 2. Admin login rejected with the password you gave me
- **Symptom:** `admin@anurag.studio` / `admin@anurag` fails on `/x/admin/login`.
- **What I confirmed offline:** the bcrypt hash in `.env.local` (`ADMIN_PASSWORD_HASH`) DOES match the string `admin@anurag`. So the env-fallback path should work.
- **What I changed:** [`auth.ts`](auth.ts) — the silent `} catch {}` around the DB-credential lookup now logs the error. So next time login fails, the dev-server console will show *why* the DB path failed (most likely it's returning a row with a different email/hash that overrides the env fallback).
- **What you need to do:** try logging in once, then check the dev-server log. If you see `[auth] DB credential lookup failed`, the issue is DB connectivity. If login still fails *without* that log, there's a row in `admin_credentials` with stale data — either delete that row (so the env fallback wins) or `UPDATE` it with a fresh bcrypt hash. The full admin portal QA pass is blocked until this is resolved.

## 🟡 Decisions you should make

### 3. CV download URL
- Currently the footer/contact CV button links to a Google Drive URL. Confirm whether you want to keep that, or upload `cv.pdf` to your DO Space and serve it from there. (Search `CV_URL` in the codebase — there are a couple of places.)

### 4. Stats numbers in [`components/home/StatsStrip.tsx:9`](components/home/StatsStrip.tsx:9)
- Hard-coded values: `1.5+ Years Experience`, `5+ Projects Shipped`, `100% On-Time Delivery`, `5+ Happy Clients`. These are realistic but if you want them sourced from the DB or just bumped, edit the `STATS` array.
- The "all zeros" I observed during QA was the pre-IntersectionObserver render state — not a bug. The flip animation triggers when the section scrolls into view.

### 5. Work tag filter has duplicates ("DESIGN SYSTEM" vs "DESIGN SYSTEMS")
- This comes from inconsistent tags in your DB rows, not a code bug. Fix it by editing project tags in the admin (once login works), or I can add case-insensitive deduping in `WorkGrid` if you want — say the word.

## ✅ Already fixed (autonomous, no action needed)

| File | What changed | Why |
|---|---|---|
| [`app/actions/contact.ts`](app/actions/contact.ts) | Lazy Resend init, HTML-escape all user input, friendly error when key missing | Prevents 500s; closes XSS-in-email risk |
| [`auth.ts`](auth.ts) | Replaced silent catch with `console.error` | Surfaces root cause of DB-fallback failures |
| [`app/(public)/about/page.tsx:9`](app/(public)/about/page.tsx:9) | `'About \| Anurag'` → `'About'` | Root template adds ` \| Anurag` already; was double-appending |
| [`app/(public)/work/[slug]/page.tsx:37`](app/(public)/work/[slug]/page.tsx:37) | `${title} \| Anurag` → `project.title` | Same root cause as above |
| [`app/(public)/menu/layout.tsx`](app/(public)/menu/layout.tsx) (new) | Adds `Menu` metadata | `/menu` had no title — was inheriting the default |
| [`components/Footer.tsx:715`](components/Footer.tsx:715) | `pathname === '/contact'` → `pathname?.startsWith('/contact')` | Trailing slash safety; null-safe |

Verified via preview server — `/about`, `/menu`, `/contact` all return 200 with correct titles, and footer is hidden on `/contact` only.

## What I did NOT touch

- `RESEND_API_KEY` value (yours).
- DB rows in `admin_credentials` (yours, and read-only mode was the agreed scope).
- `app/actions/contact.ts` `from:` address — still `onboarding@resend.dev` because changing it without a verified domain would break sending entirely.
- Any DB writes whatsoever.
