// Graph → program, preflight checks, and the plain language brief.
import { DEFS, LOCATED } from './nodes.js'
import { distance, surveyPath, pathLength, toXY, centroid, fmt } from './geo.js'
import { runHeadless, contingency, RANK } from './sim.js'

const isBranch = d => d.outs[0]?.id === 'true'

/**
 * Walk exec wires from every event into a tree. Branches end their sequence
 * (as in Blueprints, the two paths never rejoin), Repeat runs its body and then
 * carries on from Completed.
 */
export function buildProgram(m) {
  const byId = new Map(m.nodes.map(n => [n.id, n]))
  const out = (id, pin) => m.links.find(l => l.from === id && l.pin === pin)?.to
  const issues = []
  const reached = new Set()

  function seq(id, stack) {
    const ops = []
    while (id) {
      const n = byId.get(id)
      if (!n) break
      if (stack.includes(id)) {
        issues.push({ sev: 'critical', node: id, msg: `Wires loop back into “${DEFS[n.type].title}”. Use a Repeat block to repeat.` })
        break
      }
      reached.add(id)
      const d = DEFS[n.type]
      stack = [...stack, id]
      if (isBranch(d)) {
        ops.push({ kind: 'if', node: n, then: seq(out(id, 'true'), stack), else: seq(out(id, 'false'), stack) })
        break
      }
      if (n.type === 'repeat') {
        ops.push({ kind: 'repeat', node: n, body: seq(out(id, 'body'), stack) })
        id = out(id, 'done')
        continue
      }
      ops.push({ kind: 'do', node: n })
      id = out(id, 'then')
    }
    return ops
  }

  const events = m.nodes.filter(n => DEFS[n.type].event)
  const starts = events.filter(n => n.type === 'ev_start')
  let main = null
  if (starts[0]) {
    reached.add(starts[0].id)
    main = { node: starts[0], seq: seq(out(starts[0].id, 'then'), [starts[0].id]) }
  }
  const handlers = events
    .filter(n => n.type !== 'ev_start')
    .map(n => { reached.add(n.id); return { node: n, sev: DEFS[n.type].sev, seq: seq(out(n.id, 'then'), [n.id]) } })
    .sort((a, b) => RANK[b.sev] - RANK[a.sev])

  return { main, handlers, starts, issues, reached }
}

/* ── static airborne state walk ──────────────────────── */
function walkAir(ops, air, tail, issues, isBody = false) {
  let last = tail
  for (const op of ops) {
    const n = op.node, d = DEFS[n.type]
    if (n.type === 'takeoff') {
      if (air) issues.push({ sev: 'warning', node: n.id, msg: 'Take Off while already airborne is skipped.' })
      air = true
    } else if (['goto', 'survey', 'orbit', 'hold', 'land', 'rtl', 'emland'].includes(n.type) && !air) {
      issues.push({ sev: 'critical', node: n.id, msg: `“${d.title}” runs while the aircraft is on the ground. Add Take Off before it.` })
    } else if (d.grounds) air = false
    if (op.kind === 'if') {
      walkAir(op.then, air, { node: n, pin: 'True' }, issues, isBody)
      walkAir(op.else, air, { node: n, pin: 'False' }, issues, isBody)
      return
    }
    if (op.kind === 'repeat') air = walkAir(op.body, air, { node: n, pin: 'Body' }, issues, true)
    last = { node: n }
  }
  if (air && !isBody) {
    if (last?.pin) issues.push({ sev: 'critical', node: last.node.id, msg: `The ${last.pin} path is empty, so the aircraft would hover until a failsafe fires. Wire Return Home or Land.` })
    else if (last) issues.push({ sev: 'critical', node: last.node.id, msg: `Mission ends in the air after “${DEFS[last.node.type].title}”. Finish with Return Home or Land.` })
  }
  return air
}

/* ── full analysis: checks, nominal flight, contingencies ── */
export function analyse(m) {
  const s = m.settings
  const prog = buildProgram(m)
  const issues = [...prog.issues]

  if (!prog.starts.length) issues.push({ sev: 'critical', msg: 'No Mission Start block. Drag one in from Events.' })
  prog.starts.slice(1).forEach(n => issues.push({ sev: 'critical', node: n.id, msg: 'Only one Mission Start is allowed. This one is ignored.' }))

  const seen = {}
  for (const h of prog.handlers) {
    const d = DEFS[h.node.type]
    if (seen[h.node.type]) issues.push({ sev: 'warning', node: h.node.id, msg: `Two “${d.title}” blocks. Each fires once, the first wins.` })
    seen[h.node.type] = true
    if (!h.seq.length) issues.push({ sev: 'warning', node: h.node.id, msg: `“${d.title}” has nothing wired to it.` })
  }
  if (prog.main) walkAir(prog.main.seq, false, { node: prog.main.node, pin: 'Mission Start' }, issues)
  for (const h of prog.handlers) if (h.seq.length) walkAir(h.seq, true, { node: h.node }, issues)

  for (const n of m.nodes) {
    const d = DEFS[n.type], p = n.p
    if (!prog.reached.has(n.id)) issues.push({ sev: 'warning', node: n.id, msg: `“${d.title}” is not connected to any event, so it will never run.` })
    if (p.alt != null && p.alt > s.maxAlt) issues.push({ sev: 'critical', node: n.id, msg: `${d.title} altitude ${p.alt} m is above the ${s.maxAlt} m ceiling.` })
    if (n.type === 'goto') {
      if (!p.point) issues.push({ sev: 'critical', node: n.id, msg: 'Fly To has no location. Select it and click the map.' })
      else if (distance(p.point, s.home) > s.fenceRadius) issues.push({ sev: 'critical', node: n.id, msg: `Waypoint is ${Math.round(distance(p.point, s.home))} m from home, outside the ${s.fenceRadius} m geofence.` })
    }
    if (n.type === 'orbit') {
      if (!p.center) issues.push({ sev: 'critical', node: n.id, msg: 'Orbit has no centre. Select it and click the map.' })
      else if (distance(p.center, s.home) + p.radius > s.fenceRadius) issues.push({ sev: 'critical', node: n.id, msg: 'Orbit crosses the geofence.' })
    }
    if (n.type === 'survey') {
      if (!p.area || p.area.length < 3) issues.push({ sev: 'critical', node: n.id, msg: 'Survey area needs at least 3 corners. Select it and click the map.' })
      else if (p.area.some(v => distance(v, s.home) > s.fenceRadius)) issues.push({ sev: 'critical', node: n.id, msg: 'Survey area extends outside the geofence.' })
    }
  }

  const has = t => prog.handlers.some(h => h.node.type === t && h.seq.length)
  if (!has('ev_battery_low') && !has('ev_battery_critical')) issues.push({ sev: 'warning', msg: 'No battery failsafe. Add On Battery Low with Return Home.' })
  if (!has('ev_link_lost')) issues.push({ sev: 'warning', msg: 'No link loss failsafe. Add On Link Lost.' })
  if (!has('ev_geofence')) issues.push({ sev: 'warning', msg: 'No geofence response. Add On Geofence Breach.' })

  // Nominal flight: no faults, forecast wind.
  const nominal = runHeadless(prog, s)
  const o = nominal.outcome
  if (prog.main && !nominal.trail.some(p => p.alt > 0.5)) issues.push({ sev: 'warning', node: prog.main.node.id, msg: 'The mission never leaves the ground. Wire Take Off after Mission Start.' })
  if (prog.main) {
    if (o.kind === 'crash') issues.push({ sev: 'critical', msg: `Nominal flight runs out of battery at T+${fmt.t(o.t)}.` })
    else if (o.kind === 'timeout') issues.push({ sev: 'critical', msg: 'Nominal flight never lands.' })
    else if (o.kind === 'landed-away') issues.push({ sev: 'warning', msg: `Nominal flight lands away from home. ${o.msg}.` })
    const fired = nominal.log.find(e => e.sev !== 'normal' && e.node && prog.handlers.some(h => h.node.id === e.node))
    if (fired) issues.push({ sev: 'warning', node: fired.node, msg: `Even with no faults, “${fired.msg}” fires at T+${fmt.t(fired.t)}. The plan is too long for the pack.` })
    else if (o.kind.startsWith('landed') && nominal.st.battery < s.reserve) issues.push({ sev: 'critical', msg: `Lands with ${Math.round(nominal.st.battery)}% battery, below the ${s.reserve}% reserve.` })
    else if (o.kind.startsWith('landed') && nominal.st.battery < s.reserve + 10) issues.push({ sev: 'warning', msg: `Lands with ${Math.round(nominal.st.battery)}%, within 10% of the reserve.` })
  }

  const contingencies = prog.handlers.filter(h => h.seq.length).map(h => ({ h, sim: contingency(prog, s, nominal, h) })).filter(c => c.sim)

  // de-duplicate and order critical first
  const key = new Set()
  const list = issues.filter(i => { const k = i.node + i.msg; if (key.has(k)) return false; key.add(k); return true })
    .sort((a, b) => RANK[b.sev] - RANK[a.sev])

  return { prog, issues: list, nominal, contingencies }
}

/* ── brief ─────────────────────────────────────────────── */
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))

function area(poly) {
  const o = centroid(poly), q = poly.map(p => toXY(o, p))
  let a = 0
  for (let i = 0, j = q.length - 1; i < q.length; j = i++) a += (q[j].x + q[i].x) * (q[j].y - q[i].y)
  return Math.abs(a / 2)
}

function say(op, s) {
  const n = op.node, p = n.p
  switch (n.type) {
    case 'takeoff': return `Take off and climb to <b>${p.alt} m</b>.`
    case 'goto': return p.point ? `Fly to waypoint ${fmt.m(distance(p.point, s.home))} from home at <b>${p.alt} m</b>${p.hold ? `, hold ${p.hold} s` : ''}.` : 'Fly To, <em>location not set</em>.'
    case 'survey': {
      if (!p.area || p.area.length < 3) return 'Survey, <em>area not drawn</em>.'
      const path = surveyPath(p.area, p.spacing, p.angle)
      return `Survey <b>${(area(p.area) / 10000).toFixed(1)} ha</b> at ${p.alt} m: ${path.length / 2} lines ${p.spacing} m apart, ${fmt.m(pathLength(path))} of track${p.trigger ? `, a photo every ${p.trigger} m` : ''}.`
    }
    case 'orbit': return p.center ? `Orbit a point ${p.turns} time${p.turns === 1 ? '' : 's'} at ${p.radius} m radius, ${p.alt} m up.` : 'Orbit, <em>centre not set</em>.'
    case 'hold': return `Hover for ${p.sec} s.`
    case 'speed': return `Set speed to ${p.ms} m/s.`
    case 'land': return 'Land where it is and disarm.'
    case 'rtl': return `Return home at ${p.alt} m and land.`
    case 'emland': return 'Land immediately, wherever it is.'
    case 'photo': return `Take ${p.count} photo${p.count > 1 ? 's' : ''}.`
    case 'video_start': return 'Start recording video.'
    case 'video_stop': return 'Stop recording.'
    case 'gimbal': return `Point the camera ${p.pitch === -90 ? 'straight down' : `to ${p.pitch}°`}.`
    case 'drop': return 'Release the payload.'
    case 'signal': return `Tell ground control: “${esc(p.msg)}”.`
  }
  return esc(DEFS[n.type].title)
}

function list(seq, s) {
  if (!seq.length) return '<ol><li class="muted">Nothing. The aircraft hovers.</li></ol>'
  return '<ol>' + seq.map(op => {
    const id = `data-node="${op.node.id}"`
    if (op.kind === 'if') return `<li ${id}>If <b>${esc(DEFS[op.node.type].summary(op.node.p))}</b>:${list(op.then, s)}Otherwise:${list(op.else, s)}</li>`
    if (op.kind === 'repeat') return `<li ${id}>Repeat ${op.node.p.count} times:${list(op.body, s)}</li>`
    return `<li ${id}>${say(op, s)}</li>`
  }).join('') + '</ol>'
}

export function brief(m, a) {
  const s = m.settings, nom = a.nominal, crit = a.issues.filter(i => i.sev === 'critical').length
  const status = !a.prog.main ? 'No mission' : crit ? `${crit} critical issue${crit > 1 ? 's' : ''}, not ready to fly` : a.issues.length ? 'Ready, with warnings' : 'Ready to fly'
  const rows = [
    ['Status', status],
    ['Flight time', fmt.t(nom.outcome?.t ?? 0)],
    ['Distance', fmt.m(nom.st.dist)],
    ['Battery at landing', `${Math.round(nom.st.battery)}% (reserve ${s.reserve}%)`],
    ['Ceiling / fence', `${s.maxAlt} m / ${s.fenceRadius} m from home`],
    ['Forecast wind', `${s.wind} m/s`],
  ]
  let h = `<h3>${esc(m.name)}</h3><dl class="kv">${rows.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>`
  h += '<h4>Plan</h4>' + (a.prog.main ? list(a.prog.main.seq, s) : '<p class="muted">Add a Mission Start block.</p>')
  if (a.prog.handlers.length) {
    h += '<h4>Contingencies</h4><ul class="cont">'
    for (const x of a.prog.handlers) {
      const d = DEFS[x.node.type]
      h += `<li data-node="${x.node.id}" class="sev-${x.sev}"><span class="tag">${x.sev}</span> ${esc(d.title)}, ${esc(d.summary(x.node.p))}${list(x.seq, s)}</li>`
    }
    h += '</ul>'
  }
  return h
}
