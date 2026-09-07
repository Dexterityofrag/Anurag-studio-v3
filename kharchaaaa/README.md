# Kharchaaaa, the app

A mobile-first expense book you add to your iPhone home screen. Type
`uber 105`, watch it work out that Uber is transport and file it, and see the
month's ceiling drain in front of you.

No build step, no framework, no dependencies. Three files of JavaScript and a
service worker.

---

## Running it

```bash
python3 -m http.server 4321 --directory kharchaaaa
```

Then open `http://localhost:4321`. There is also a `kharchaaaa` entry in
`.claude/launch.json`.

## Putting it on your phone

It is a PWA, so it installs without an app store.

1. Serve it over **https** (a phone will not install from plain http, except on
   localhost). Easiest is to drop the folder on any static host.
2. Open it in **Safari** on the iPhone.
3. Share → **Add to Home Screen**.

It then opens full screen with no browser chrome, keeps its own icon, and works
with no signal. The service worker caches the shell and the two fonts.

---

## How it reads what you type

One spend per line. Enter sends, Shift+Enter starts another line, and a preview
chip appears for every line before you commit, so you always see what it worked
out.

```
uber 105
zepto 495
swiggy 340 late dinner
```

Text before the number is the merchant, text after is a note, and either order
works. Amounts in any shape: `105`, `1,05,000`, `12,000.50`, `₹495`,
`Rs 2,499.50`, `2k`, `1.5L`, `499/-`.

`chai 40 #dining` forces a category. `uber 105 yesterday` and `uber 105 12/09`
backdate. An unknown tag like `gift 900 #festivals` creates that category on the
spot.

## The four screens

**Today** is the dial. The ring is the month's ceiling, the arc is what you have
spent, the ticks are your checkpoints, and the colour turns amber at 80% and red
past 100%. Under it: safe pace against your actual pace, one bar per day of the
month, and today's spends on a spine.

**Log** is everything, grouped by day, filtered by window.

**Shape** is where it actually goes. Category bars, a running marquee of your
averages, and the long-run numbers: per day, per month, biggest single spend,
heaviest category.

**Setup** holds the ceiling, the checkpoint count, your categories, export and
restore, and the wipes.

## Where the data lives

`localStorage`, on that device only. Nothing is sent anywhere; there is no
server and no account. That is a deliberate trade: it is private and instant,
but it is also one device and one browser.

So **back it up**. Setup → *backup json* writes a file you can restore from on
any device. Export CSV if you want it in a spreadsheet.

---

## Its relationship to the bot

There is a Telegram bot, **@KharchaaaaBot**, that does the same job in chat and
additionally reads bank SMS and photographed bills. The two are deliberately
kept apart for now, but they are built to be joined:

- amounts are integer **paise** on both sides, never floats
- the category slugs are character-for-character identical
- the same parser rules, ported line for line
- the same budget and checkpoint maths

Joining them later means putting a shared store behind both, not rewriting
either. Nothing in this app assumes it is alone.

## Files

```
index.html                the shell and all four screens
styles.css                the whole design system
js/core.js                categories, parsing, storage, budget maths
js/ui.js                  rendering and interaction
sw.js                     offline
manifest.webmanifest      home screen install
brand/                    mark, maskable mark, lockup, BRAND.md
icons/                    generated PNGs, do not edit by hand
```

Icons are generated from `brand/mark.svg`. If you change the mark, re-run the
sharp resize into `icons/` rather than editing the PNGs.
