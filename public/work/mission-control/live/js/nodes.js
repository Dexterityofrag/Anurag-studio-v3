// The block catalogue. Every block is an Unreal style node: one exec input
// (events have none), one or more named exec outputs, and typed parameters.
// Events carry a severity, which is the only thing that ever colours a wire.

const THEN = [{ id: 'then', label: '' }]
const BRANCH = [{ id: 'true', label: 'True' }, { id: 'false', label: 'False' }]
const OPS = ['>', '>=', '<', '<=']

const n = (key, label, def, extra = {}) => ({ key, label, kind: 'number', default: def, ...extra })

export const CATEGORIES = [
  { id: 'event', label: 'Events' },
  { id: 'flight', label: 'Flight' },
  { id: 'logic', label: 'Logic' },
  { id: 'action', label: 'Payload' },
  { id: 'safety', label: 'Safety' },
]

export const DEFS = {
  /* ── Events: entry points ─────────────────────────────── */
  ev_start: {
    cat: 'event', title: 'Mission Start', desc: 'Runs once when the mission is armed and started',
    event: true, outs: THEN, params: [],
    summary: () => 'On arm',
  },
  ev_battery_low: {
    cat: 'event', title: 'On Battery Low', desc: 'Fires once when the battery falls below a threshold',
    event: true, sev: 'warning', outs: THEN,
    params: [n('pct', 'Threshold', 30, { unit: '%', min: 5, max: 90 })],
    summary: p => `Battery < ${p.pct}%`,
  },
  ev_battery_critical: {
    cat: 'event', title: 'On Battery Critical', desc: 'Last resort energy reserve',
    event: true, sev: 'critical', outs: THEN,
    params: [n('pct', 'Threshold', 15, { unit: '%', min: 3, max: 60 })],
    summary: p => `Battery < ${p.pct}%`,
  },
  ev_link_lost: {
    cat: 'event', title: 'On Link Lost', desc: 'Ground control link silent for too long',
    event: true, sev: 'warning', outs: THEN,
    params: [n('sec', 'Timeout', 5, { unit: 's', min: 1, max: 120 })],
    summary: p => `No link for ${p.sec}s`,
  },
  ev_gps_lost: {
    cat: 'event', title: 'On GPS Degraded', desc: 'Satellite count drops below a minimum',
    event: true, sev: 'warning', outs: THEN,
    params: [n('sats', 'Min satellites', 6, { min: 3, max: 20 })],
    summary: p => `Sats < ${p.sats}`,
  },
  ev_geofence: {
    cat: 'event', title: 'On Geofence Breach', desc: 'Aircraft leaves the mission geofence',
    event: true, sev: 'critical', outs: THEN, params: [],
    summary: () => 'Outside fence',
  },

  /* ── Flight ────────────────────────────────────────────── */
  takeoff: {
    cat: 'flight', title: 'Take Off', desc: 'Arm and climb vertically', outs: THEN,
    params: [n('alt', 'Altitude', 30, { unit: 'm', min: 2, max: 500 })],
    summary: p => `Climb to ${p.alt} m`,
  },
  goto: {
    cat: 'flight', title: 'Fly To', desc: 'Fly to a point on the map', outs: THEN,
    params: [
      { key: 'point', label: 'Location', kind: 'point', default: null },
      n('alt', 'Altitude', 40, { unit: 'm', min: 2, max: 500 }),
      n('hold', 'Hold on arrival', 0, { unit: 's', min: 0, max: 600 }),
    ],
    summary: p => p.point ? `${p.alt} m · ${p.point.lat.toFixed(4)}, ${p.point.lng.toFixed(4)}` : 'Location not set',
  },
  survey: {
    cat: 'flight', title: 'Survey Area', desc: 'Lawnmower pattern over a polygon', outs: THEN,
    params: [
      { key: 'area', label: 'Area', kind: 'polygon', default: [] },
      n('alt', 'Altitude', 50, { unit: 'm', min: 5, max: 500 }),
      n('spacing', 'Line spacing', 30, { unit: 'm', min: 5, max: 500 }),
      n('angle', 'Line angle', 0, { unit: '°', min: 0, max: 179 }),
      n('trigger', 'Photo every', 25, { unit: 'm', min: 0, max: 500, hint: '0 for none' }),
    ],
    summary: p => (p.area?.length >= 3) ? `${p.area.length} vertices · ${p.spacing} m lines` : 'Area not drawn',
  },
  orbit: {
    cat: 'flight', title: 'Orbit', desc: 'Circle a point of interest', outs: THEN,
    params: [
      { key: 'center', label: 'Centre', kind: 'point', default: null },
      n('radius', 'Radius', 40, { unit: 'm', min: 5, max: 1000 }),
      n('turns', 'Turns', 2, { min: 0.25, max: 20, step: 0.25 }),
      n('alt', 'Altitude', 40, { unit: 'm', min: 2, max: 500 }),
    ],
    summary: p => p.center ? `${p.turns} × r ${p.radius} m` : 'Centre not set',
  },
  hold: {
    cat: 'flight', title: 'Hold', desc: 'Hover in place', outs: THEN,
    params: [n('sec', 'Duration', 10, { unit: 's', min: 1, max: 3600 })],
    summary: p => `${p.sec} s`,
  },
  speed: {
    cat: 'flight', title: 'Set Speed', desc: 'Change horizontal cruise speed', outs: THEN,
    params: [n('ms', 'Speed', 10, { unit: 'm/s', min: 1, max: 30 })],
    summary: p => `${p.ms} m/s`,
  },
  land: {
    cat: 'flight', title: 'Land Here', desc: 'Descend and disarm at the current position', outs: THEN,
    params: [], summary: () => 'Descend, disarm', grounds: true,
  },

  /* ── Logic ─────────────────────────────────────────────── */
  if_battery: {
    cat: 'logic', title: 'Battery Check', desc: 'Branch on remaining battery', outs: BRANCH, metric: 'battery',
    params: [{ key: 'op', label: 'Test', kind: 'select', options: OPS, default: '>' }, n('value', 'Value', 50, { unit: '%', min: 0, max: 100 })],
    summary: p => `Battery ${p.op} ${p.value}%`,
  },
  if_wind: {
    cat: 'logic', title: 'Wind Check', desc: 'Branch on measured wind speed', outs: BRANCH, metric: 'wind',
    params: [{ key: 'op', label: 'Test', kind: 'select', options: OPS, default: '<' }, n('value', 'Value', 8, { unit: 'm/s', min: 0, max: 40 })],
    summary: p => `Wind ${p.op} ${p.value} m/s`,
  },
  if_gps: {
    cat: 'logic', title: 'GPS Check', desc: 'Branch on satellite count', outs: BRANCH, metric: 'sats',
    params: [{ key: 'op', label: 'Test', kind: 'select', options: OPS, default: '>=' }, n('value', 'Value', 8, { min: 0, max: 30 })],
    summary: p => `Sats ${p.op} ${p.value}`,
  },
  if_time: {
    cat: 'logic', title: 'Time Check', desc: 'Branch on elapsed mission time', outs: BRANCH, metric: 'elapsed',
    params: [{ key: 'op', label: 'Test', kind: 'select', options: OPS, default: '<' }, n('value', 'Value', 600, { unit: 's', min: 0, max: 7200 })],
    summary: p => `T+ ${p.op} ${p.value}s`,
  },
  repeat: {
    cat: 'logic', title: 'Repeat', desc: 'Run the body a number of times, then continue',
    outs: [{ id: 'body', label: 'Body' }, { id: 'done', label: 'Completed' }],
    params: [n('count', 'Times', 2, { min: 1, max: 50 })],
    summary: p => `× ${p.count}`,
  },

  /* ── Payload ───────────────────────────────────────────── */
  photo: {
    cat: 'action', title: 'Take Photo', desc: 'Capture still images', outs: THEN,
    params: [n('count', 'Count', 1, { min: 1, max: 100 })],
    summary: p => `${p.count} frame${p.count > 1 ? 's' : ''}`,
  },
  video_start: { cat: 'action', title: 'Start Video', desc: 'Begin recording', outs: THEN, params: [], summary: () => 'Record' },
  video_stop: { cat: 'action', title: 'Stop Video', desc: 'End recording', outs: THEN, params: [], summary: () => 'Stop' },
  gimbal: {
    cat: 'action', title: 'Point Gimbal', desc: 'Set camera pitch', outs: THEN,
    params: [n('pitch', 'Pitch', -90, { unit: '°', min: -90, max: 30 })],
    summary: p => `Pitch ${p.pitch}°`,
  },
  drop: { cat: 'action', title: 'Release Payload', desc: 'Open the gripper', outs: THEN, params: [], summary: () => 'Gripper open' },
  signal: {
    cat: 'action', title: 'Send Signal', desc: 'Message to ground control', outs: THEN,
    params: [{ key: 'msg', label: 'Message', kind: 'text', default: 'Checkpoint reached' }],
    summary: p => `“${p.msg}”`,
  },

  /* ── Safety ────────────────────────────────────────────── */
  rtl: {
    cat: 'safety', title: 'Return Home', desc: 'Climb to return altitude, fly home, land', outs: THEN,
    params: [n('alt', 'Return altitude', 40, { unit: 'm', min: 5, max: 500 })],
    summary: p => `RTL at ${p.alt} m`, grounds: true,
  },
  emland: {
    cat: 'safety', title: 'Emergency Land', desc: 'Land immediately, wherever it is', outs: THEN,
    params: [], summary: () => 'Land now', grounds: true,
  },
}

export function defaults(type) {
  const p = {}
  for (const x of DEFS[type].params) p[x.key] = structuredClone(x.default)
  return p
}

export const FLIES = new Set(['goto', 'survey', 'orbit', 'hold', 'speed'])
export const LOCATED = { goto: 'point', orbit: 'center', survey: 'area' }
