# Kharchaaaa

## The name

*Kharcha* is Hindi for spending. The four trailing **a**s are the joke: the word
stretches out the way money does when you are not watching it. Always lowercase
in the logotype, always four a's, never three and never five.

Written in running text: **Kharchaaaa**, capital K.

## The mark

A dial with a ceiling. It is the product drawn in one shape.

| Part | Means |
|---|---|
| Faint outer ring | the month's budget, all of it |
| Accent arc | what you have already spent |
| Bead at the arc's head | where you are right now |
| Gap at the top | the room you have left |
| The k | the name |

The letterform is built from three stroked paths, not type, so the mark renders
identically with no fonts installed. Never re-set it in a live font.

`brand/mark.svg` · `brand/mark-maskable.svg` (pulled in 28% for Android's
circular crop) · `brand/lockup.svg` (horizontal, needs Space Grotesk)

**Do not**: recolour the arc to anything but the accent, close the gap, add a
drop shadow, or place the mark on a light field. It is drawn for near-black.

## Colour

Taken wholesale from anurag.studio, because this is the same house.

| Token | Value | Job |
|---|---|---|
| Field | `#060606` | the ground everything sits on |
| Surface | `#0e0e0e` | cards, the composer |
| Surface 2 | `#151515` | things sitting on cards |
| Text | `#f0ede8` | warm off-white, never pure white |
| Muted | `rgba(240,237,232,.42)` | secondary text |
| Accent | `#00FF94` | the signal colour, used sparingly |
| Warn | `#FFB703` | past 80% of the budget |
| Over | `#FF3B4E` | past 100% |

Accent is a signal, not a decoration. If everything is green, nothing is.

The twenty categories each carry their own hue, defined once in
`js/core.js`. A category's colour is the same in the dot, the bar, the chip and
the sheet, so you learn to read the app by colour alone. Categories you invent
get a hue derived from their name, so they stay stable forever.

## Type

| Face | Where |
|---|---|
| Space Grotesk 700 | the logotype, every number, screen titles |
| DM Sans | body copy, merchant names |
| JetBrains Mono 10px / .14em / uppercase | every label, without exception |

Numbers are always tabular so columns line up and a count-up does not jitter.
Money never shows paise unless the paise are real: `₹1,440/day`, not
`₹1,440.13/day`.

## Voice

Plain, lowercase in the interface, never chirpy. It reports; it does not cheer.

- "23 days to go" not "You've got this!"
- "over by ₹2,784. you are overspending." not "Oops, over budget 😬"
- "needs a category" not "Uncategorized item requires attention"

Never gamify. Nobody wants a streak for spending less.

## Motion

One easing curve, `cubic-bezier(.22, 1, .36, 1)`, the site's own. Rows stagger in
at 45ms. The arc takes 1.1s to draw so the number has time to count up beside it.
Everything collapses under `prefers-reduced-motion`.

The one loud moment is the checkpoint takeover: crossing 20, 40, 60, 80 or 100
percent throws the number full-screen for two seconds. It is the only time the
app raises its voice, which is what makes it land.
