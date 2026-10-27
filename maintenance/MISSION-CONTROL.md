# Mission Control

The working drone mission planner at `/work/mission-control/live`, its case
study, and its product film. Written 28 Oct 2026.

## Where things are

| | |
|---|---|
| **The tool** | `public/work/mission-control/live/` (static ES modules, no build step) |
| **Map library** | `vendor/leaflet/` inside the tool, Leaflet 1.9.4 from npm |
| **Map tiles** | Esri World Imagery, CARTO dark fallback. Allowed in the CSP by `MAP_TILES` in `next.config.ts` |
| **Case study copy** | `scripts/seed-descriptions.ts`, key `mission-control` |
| **Case study row** | `scripts/seed-mission-control.ts` (title, tagline, role, year, tags) |
| **Hero film** | `lib/project-video.ts` maps the slug to `public/projects/mission-control/reel.mp4` |
| **Film source** | `remotion/MissionControl/MissionControlReel.tsx`, composition `MissionControlReel` |
| **Captures** | `scripts/capture-mission-control.mjs` then `scripts/build-mission-control-assets.ts` |
| **Colours** | `lib/project-palette.ts`: black field, white accent |

## The tool, file by file

| File | Job |
|---|---|
| `js/nodes.js` | The block catalogue: pins, parameters, severities |
| `js/store.js` | Mission state, undo, autosave to localStorage, templates |
| `js/compile.js` | Graph to program, preflight checks, the plain language brief |
| `js/sim.js` | Interpreter and flight model. Events preempt by swapping the running generator |
| `js/export.js` | QGroundControl `.plan`, Mission Planner `.waypoints`, MAVSDK Python |
| `js/graph.js` | The Blueprint editor |
| `js/map.js` | The satellite map |
| `js/onboarding.js` | First visit boot screen and the six step briefing |
| `js/main.js` | Layout, inspector, panels, simulation loop. `?capture` exposes `window.__mc` |

## Shipping the case study (two steps, in this order)

1. **Deploy the code.** The film, palette and new thumbnails go live with it.
   The thumbnails replaced files in place, so nothing in the database changes.
   The new case images use new names (`case/live-*.webp`), so the old copy
   keeps working until step 2.
2. **Then seed the copy:**

   ```bash
   npm run seed:mission-control
   ```

   This updates the one row and its write up, nothing else. Running it before
   the deploy would point the live page at images that are not there yet.

Do not use `npm run seed:projects` for this: it upserts every project and puts
each cover back to its original PNG.

## Redoing the film

```bash
npm run dev
node scripts/capture-mission-control.mjs /tmp/mc
npx tsx scripts/build-mission-control-assets.ts /tmp/mc
npm run reel:mission
# the poster is the wide thumbnail, so it stays clean of captions
```

## Honest limits

It has not flown an aircraft. The exports follow the published formats but have
not been run in SITL or loaded into QGroundControl. The case study says so.
