// Mission state, history, persistence and templates.
import { DEFS, defaults } from './nodes.js'
import { offset } from './geo.js'

const KEY = 'mc.missions.v1'
const CUR = 'mc.current.v1'
const HOME = { lat: 18.221, lng: 74.662 }   // open farmland outside Baramati, Maharashtra

export const DEFAULT_SETTINGS = {
  home: HOME,
  fenceRadius: 800,   // metres around home
  maxAlt: 120,        // metres AGL, the common regulatory ceiling
  reserve: 20,        // % battery that must remain at touchdown
  cruise: 10,         // m/s
  climb: 3,           // m/s
  endurance: 25,      // minutes of hover on a full pack
  wind: 4,            // forecast m/s, used for planning and as sim baseline
  firmware: 'ardupilot',
}

let seq = 0
const uid = p => `${p}${Date.now().toString(36)}${(seq++).toString(36)}`

/* ── tiny event bus ───────────────────────────────────── */
const subs = new Set()
export const subscribe = fn => (subs.add(fn), () => subs.delete(fn))
const emit = why => subs.forEach(fn => fn(why))

export const store = {
  mission: null,
  past: [],
  future: [],
}

/* ── node and link helpers ───────────────────────────── */
export function makeNode(type, x, y, params = {}) {
  if (!DEFS[type]) throw new Error('Unknown block ' + type)
  return { id: uid('n'), type, x, y, p: { ...defaults(type), ...params } }
}

export const node = id => store.mission.nodes.find(n => n.id === id)
export const linkFrom = (id, pin) => store.mission.links.find(l => l.from === id && l.pin === pin)

/**
 * All mutations go through here so undo, autosave and redraw stay in step.
 * `coalesce` merges rapid edits of the same field (typing, dragging) into one undo step.
 */
let lastCoalesce = null, lastAt = 0
export function commit(fn, why = 'edit', coalesce = null) {
  const now = performance.now()
  const merge = coalesce && coalesce === lastCoalesce && now - lastAt < 1200
  if (!merge) {
    store.past.push(JSON.stringify(store.mission))
    if (store.past.length > 200) store.past.shift()
  }
  store.future = []
  lastCoalesce = coalesce; lastAt = now
  fn(store.mission)
  store.mission.updated = Date.now()
  persist()
  emit(why)
}

export function undo() {
  if (!store.past.length) return
  store.future.push(JSON.stringify(store.mission))
  store.mission = JSON.parse(store.past.pop())
  lastCoalesce = null
  persist(); emit('history')
}
export function redo() {
  if (!store.future.length) return
  store.past.push(JSON.stringify(store.mission))
  store.mission = JSON.parse(store.future.pop())
  lastCoalesce = null
  persist(); emit('history')
}

export function connect(m, from, pin, to) {
  if (from === to) return
  m.links = m.links.filter(l => !(l.from === from && l.pin === pin))
  m.links.push({ id: uid('l'), from, pin, to })
}

export function removeNodes(m, ids) {
  const s = new Set(ids)
  m.nodes = m.nodes.filter(n => !s.has(n.id))
  m.links = m.links.filter(l => !s.has(l.from) && !s.has(l.to))
}

/* ── persistence ──────────────────────────────────────── */
function readAll() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {} } catch { return {} }
}
function persist() {
  try {
    const all = readAll()
    all[store.mission.id] = store.mission
    localStorage.setItem(KEY, JSON.stringify(all))
    localStorage.setItem(CUR, store.mission.id)
  } catch { /* private mode: the session still works, it just will not survive a reload */ }
}

export function listMissions() {
  return Object.values(readAll()).sort((a, b) => b.updated - a.updated)
}

export function open(m, why = 'open') {
  store.mission = normalise(m)
  store.past = []; store.future = []
  persist(); emit(why)
}

export function deleteMission(id) {
  try {
    const all = readAll(); delete all[id]
    localStorage.setItem(KEY, JSON.stringify(all))
  } catch { /* ignore */ }
}

export function boot() {
  let m = null
  try {
    const id = localStorage.getItem(CUR)
    m = id && readAll()[id]
  } catch { /* ignore */ }
  open(m || TEMPLATES[0].build(), 'boot')
}

function normalise(m) {
  m = structuredClone(m)
  m.id ||= uid('m')
  m.name ||= 'Untitled mission'
  m.settings = { ...DEFAULT_SETTINGS, ...(m.settings || {}) }
  m.nodes = (m.nodes || []).filter(n => DEFS[n.type]).map(n => ({ ...n, p: { ...defaults(n.type), ...n.p } }))
  const ids = new Set(m.nodes.map(n => n.id))
  m.links = (m.links || []).filter(l => ids.has(l.from) && ids.has(l.to))
  m.updated ||= Date.now()
  return m
}

export function importMission(text) {
  const m = JSON.parse(text)
  if (!m || !Array.isArray(m.nodes)) throw new Error('Not a Mission Control file')
  m.id = uid('m')
  m.name = (m.name || 'Imported') + ''
  open(m, 'open')
}

/* ── templates ────────────────────────────────────────── */
function build(name, fn) {
  const m = { id: uid('m'), name, settings: { ...DEFAULT_SETTINGS }, nodes: [], links: [], updated: Date.now() }
  const add = (type, x, y, p) => { const n = makeNode(type, x, y, p); m.nodes.push(n); return n }
  const wire = (a, b, pin = 'then') => connect(m, a.id, pin, b.id)
  fn({ add, wire, home: m.settings.home })
  return m
}

// Shared failsafes: every template starts life with its safety net already wired.
function failsafes({ add, wire }, y) {
  const low = add('ev_battery_low', 40, y, { pct: 30 })
  const lowMsg = add('signal', 300, y, { msg: 'Battery low, returning home' })
  const lowRtl = add('rtl', 560, y, { alt: 40 })
  wire(low, lowMsg); wire(lowMsg, lowRtl)
  const crit = add('ev_battery_critical', 40, y + 120, { pct: 15 })
  wire(crit, add('emland', 300, y + 120))
  const link = add('ev_link_lost', 40, y + 240, { sec: 10 })
  wire(link, add('rtl', 300, y + 240, { alt: 40 }))
  const fence = add('ev_geofence', 40, y + 360)
  wire(fence, add('rtl', 300, y + 360, { alt: 40 }))
}

export const TEMPLATES = [
  {
    id: 'survey', name: 'Perimeter survey', desc: 'Map a field in a lawnmower pattern, with a wind gate',
    build: () => build('Field survey 01', g => {
      const h = g.home
      const area = [offset(offset(h, 0, 120), 90, 60), offset(offset(h, 0, 380), 90, 80), offset(offset(h, 0, 400), 90, 360), offset(offset(h, 0, 140), 90, 330)]
      const start = g.add('ev_start', 40, 40)
      const to = g.add('takeoff', 300, 40, { alt: 40 })
      const gim = g.add('gimbal', 560, 40, { pitch: -90 })
      const wind = g.add('if_wind', 820, 40, { op: '<', value: 10 })
      const sv = g.add('survey', 1100, 0, { area, alt: 50, spacing: 35, angle: 10, trigger: 25 })
      const home = g.add('rtl', 1380, 0, { alt: 50 })
      const abort = g.add('signal', 1100, 150, { msg: 'Wind above limit, survey aborted' })
      g.wire(start, to); g.wire(to, gim); g.wire(gim, wind)
      g.wire(wind, sv, 'true'); g.wire(sv, home)
      g.wire(wind, abort, 'false'); g.wire(abort, home)
      failsafes(g, 300)
    }),
  },
  {
    id: 'inspect', name: 'Tower inspection', desc: 'Orbit a structure at three heights, photographing each pass',
    build: () => build('Tower inspection', g => {
      const t = offset(g.home, 40, 260)
      const start = g.add('ev_start', 40, 40)
      const to = g.add('takeoff', 300, 40, { alt: 20 })
      const fly = g.add('goto', 560, 40, { point: offset(t, 220, 40), alt: 20 })
      const vid = g.add('video_start', 820, 40)
      const rep = g.add('repeat', 1080, 40, { count: 3 })
      const orb = g.add('orbit', 1360, -40, { center: t, radius: 35, turns: 1, alt: 30 })
      const ph = g.add('photo', 1620, -40, { count: 4 })
      const stop = g.add('video_stop', 1360, 140)
      const home = g.add('rtl', 1620, 140, { alt: 40 })
      g.wire(start, to); g.wire(to, fly); g.wire(fly, vid); g.wire(vid, rep)
      g.wire(rep, orb, 'body'); g.wire(orb, ph)
      g.wire(rep, stop, 'done'); g.wire(stop, home)
      failsafes(g, 300)
    }),
  },
  {
    id: 'delivery', name: 'Payload delivery', desc: 'Fly out, drop a package, come home, only if the battery allows',
    build: () => build('Medical drop', g => {
      const drop = offset(g.home, 120, 620)
      const start = g.add('ev_start', 40, 40)
      const gate = g.add('if_battery', 300, 40, { op: '>', value: 70 })
      const to = g.add('takeoff', 580, 0, { alt: 35 })
      const fly = g.add('goto', 840, 0, { point: drop, alt: 35 })
      const hold = g.add('hold', 1100, 0, { sec: 4 })
      const rel = g.add('drop', 1360, 0)
      const msg = g.add('signal', 1620, 0, { msg: 'Package delivered' })
      const home = g.add('rtl', 1880, 0, { alt: 40 })
      const no = g.add('signal', 580, 160, { msg: 'Not enough battery to launch' })
      g.wire(start, gate); g.wire(gate, to, 'true'); g.wire(to, fly); g.wire(fly, hold)
      g.wire(hold, rel); g.wire(rel, msg); g.wire(msg, home)
      g.wire(gate, no, 'false')
      failsafes(g, 320)
    }),
  },
  {
    id: 'blank', name: 'Blank', desc: 'Only a Mission Start block',
    build: () => build('New mission', g => { g.add('ev_start', 40, 40) }),
  },
]
