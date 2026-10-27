import { DEFS, CATEGORIES, LOCATED } from './nodes.js'
import { store, subscribe, commit, undo, redo, boot, open, listMissions, deleteMission, importMission, TEMPLATES, node as getNode } from './store.js'
import { analyse, brief } from './compile.js'
import { toPlan, toWaypoints, toPython } from './export.js'
import { Sim, RANK } from './sim.js'
import { createGraph, isTyping } from './graph.js'
import { createMap } from './map.js'
import { distance, fmt, toXY } from './geo.js'
import { bootSequence, tour } from './onboarding.js'

const $ = s => document.querySelector(s)
const $$ = s => [...document.querySelectorAll(s)]
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))

let selection = []
let analysis = null
let mode = 'plan'
let sim = null, running = false, speed = 4, lastFrame = 0
let codeFmt = 'py'

/* ── graph ─────────────────────────────────────────────── */
const graph = createGraph($('#graph'), {
  onSelect(ids) { selection = ids; renderInspector(); renderMap() },
})

/* ── map ───────────────────────────────────────────────── */
const map = createMap($('#map'), {
  onPlace(n, p) {
    const key = LOCATED[n.type]
    commit(m => {
      const t = m.nodes.find(x => x.id === n.id)
      if (key === 'area') t.p.area = insertVertex(t.p.area || [], p)
      else t.p[key] = p
    }, 'map')
  },
  onMove(n, key, i, p) {
    commit(m => {
      const t = m.nodes.find(x => x.id === n.id)
      if (i == null) t.p[key] = p
      else t.p[key][i] = p
    }, 'map')
  },
  onHome(p) { commit(m => { m.settings.home = p }, 'settings') },
  onRemoveVertex(n, i) { commit(m => { m.nodes.find(x => x.id === n.id).p.area.splice(i, 1) }, 'map') },
})
window.addEventListener('mc:select', e => { graph.select([e.detail]); graph.center(e.detail) })

// Put a new corner where it lengthens the outline least, so clicking near an edge splits that edge.
function insertVertex(area, p) {
  if (area.length < 3) return [...area, p]
  let best = 0, cost = Infinity
  for (let i = 0; i < area.length; i++) {
    const a = area[i], b = area[(i + 1) % area.length]
    const c = distance(a, p) + distance(p, b) - distance(a, b)
    if (c < cost) { cost = c; best = i + 1 }
  }
  const out = [...area]
  out.splice(best, 0, p)
  return out
}

/* ── library ──────────────────────────────────────────── */
function renderLibrary() {
  const q = $('#lib-search').value.trim().toLowerCase()
  let h = ''
  for (const c of CATEGORIES) {
    const items = Object.entries(DEFS).filter(([, d]) => d.cat === c.id && (!q || d.title.toLowerCase().includes(q) || d.desc.toLowerCase().includes(q)))
    if (!items.length) continue
    h += `<div class="lib-cat">${c.label}</div>`
    h += items.map(([t, d]) => `<button class="blk${d.sev ? ' ev-' + d.sev : ''}" draggable="true" data-type="${t}" title="${esc(d.desc)}"><b>${esc(d.title)}</b><span>${esc(d.desc)}</span></button>`).join('')
  }
  $('#lib-list').innerHTML = h
}
$('#lib-search').addEventListener('input', renderLibrary)
$('#lib-list').addEventListener('dragstart', e => {
  const b = e.target.closest('.blk')
  if (b) { e.dataTransfer.setData('text/x-mc-block', b.dataset.type); e.dataTransfer.effectAllowed = 'copy' }
})
$('#lib-list').addEventListener('click', e => {
  const b = e.target.closest('.blk')
  if (!b) return
  const r = $('#graph').getBoundingClientRect()
  const p = graph.toGraph(r.left + r.width / 2, r.top + r.height / 2)
  // chain onto a selected block when there is exactly one with a free output
  const from = selection.length === 1 ? getNode(selection[0]) : null
  const pin = from && DEFS[from.type].outs.find(o => !store.mission.links.some(l => l.from === from.id && l.pin === o.id))
  if (from && pin && !DEFS[b.dataset.type].event) graph.addAt(b.dataset.type, from.x + 260, from.y, { from: from.id, pin: pin.id })
  else graph.addAt(b.dataset.type, p.x - 100, p.y - 30)
})

/* ── inspector ────────────────────────────────────────── */
function field(n, prm) {
  const v = n.p[prm.key], id = `f-${prm.key}`
  const k = `data-key="${prm.key}"`
  switch (prm.kind) {
    case 'number':
      return `<label class="fld"><span>${prm.label}</span><div class="num"><input type="number" id="${id}" ${k} value="${v}" min="${prm.min ?? ''}" max="${prm.max ?? ''}" step="${prm.step ?? 1}" />${prm.unit ? `<em>${prm.unit}</em>` : ''}</div>${prm.hint ? `<small>${prm.hint}</small>` : ''}</label>`
    case 'text':
      return `<label class="fld"><span>${prm.label}</span><input type="text" ${k} value="${esc(v)}" maxlength="80" /></label>`
    case 'select':
      return `<div class="fld"><span>${prm.label}</span><div class="seg" ${k}>${prm.options.map(o => `<button data-v="${o}" class="${o === v ? 'on' : ''}">${o}</button>`).join('')}</div></div>`
    case 'point':
      return `<label class="fld"><span>${prm.label}</span><input type="text" ${k} data-kind="point" value="${v ? `${v.lat.toFixed(6)}, ${v.lng.toFixed(6)}` : ''}" placeholder="Click the map, or paste lat, lng" />${v ? `<small>${fmt.m(distance(v, store.mission.settings.home))} from home</small>` : '<small class="hot">Click the map to place it</small>'}</label>`
    case 'polygon': {
      const a = v || []
      return `<div class="fld"><span>${prm.label}</span><div class="poly-info">${a.length >= 3 ? `${a.length} corners · ${(polyArea(a) / 10000).toFixed(2)} ha` : `<b class="hot">${a.length} of 3 corners</b>`}</div><small>Click the map to add corners. Drag to move, right click to remove.</small>${a.length ? `<button class="btn ghost sm" data-clear="${prm.key}">Clear area</button>` : ''}</div>`
    }
  }
}

function polyArea(poly) {
  const o = poly[0], q = poly.map(p => toXY(o, p))
  let s = 0
  for (let i = 0, j = q.length - 1; i < q.length; j = i++) s += (q[j].x + q[i].x) * (q[j].y - q[i].y)
  return Math.abs(s / 2)
}

function renderInspector() {
  const el = $('#insp')
  const m = store.mission
  if (selection.length === 1 && getNode(selection[0])) {
    const n = getNode(selection[0]), d = DEFS[n.type]
    const iss = analysis?.issues.filter(i => i.node === n.id) || []
    el.innerHTML = `
      <div class="panel-h">Block</div>
      <div class="insp-head">
        <span class="insp-cat${d.sev ? ' sev-' + d.sev : ''}">${d.event ? (d.sev ? d.sev + ' event' : 'event') : CATEGORIES.find(c => c.id === d.cat).label}</span>
        <h2>${esc(d.title)}</h2>
        <p>${esc(d.desc)}</p>
      </div>
      ${iss.map(i => `<div class="iss sev-${i.sev}"><i></i>${esc(i.msg)}</div>`).join('')}
      <div class="form" data-node="${n.id}">${d.params.map(p => field(n, p)).join('') || '<p class="muted">No settings.</p>'}</div>
      <div class="insp-actions">
        <button class="btn ghost" data-act="dup">Duplicate</button>
        <button class="btn ghost" data-act="del">Delete</button>
      </div>`
    return
  }
  if (selection.length > 1) {
    el.innerHTML = `<div class="panel-h">Selection</div><div class="insp-head"><h2>${selection.length} blocks</h2><p>Drag to move them together.</p></div>
      <div class="insp-actions"><button class="btn ghost" data-act="dup">Duplicate</button><button class="btn ghost" data-act="del">Delete</button></div>`
    return
  }
  const s = m.settings
  const num = (key, label, unit, min, max, step = 1) =>
    `<label class="fld"><span>${label}</span><div class="num"><input type="number" data-set="${key}" value="${s[key]}" min="${min}" max="${max}" step="${step}" /><em>${unit}</em></div></label>`
  el.innerHTML = `
    <div class="panel-h">Mission</div>
    <div class="insp-head"><h2>${esc(m.name)}</h2><p>Select a block to edit it. These limits apply to the whole flight.</p></div>
    <div class="form">
      <label class="fld"><span>Home</span><input type="text" data-set="home" value="${s.home.lat.toFixed(6)}, ${s.home.lng.toFixed(6)}" /><small>Drag the H marker, or paste lat, lng</small></label>
      ${num('fenceRadius', 'Geofence radius', 'm', 50, 10000, 10)}
      ${num('maxAlt', 'Altitude ceiling', 'm', 5, 500)}
      ${num('reserve', 'Landing reserve', '%', 0, 60)}
      <div class="sub">Aircraft</div>
      ${num('cruise', 'Cruise speed', 'm/s', 1, 30)}
      ${num('climb', 'Climb rate', 'm/s', 0.5, 10, 0.5)}
      ${num('endurance', 'Hover endurance', 'min', 3, 120)}
      <div class="fld"><span>Autopilot</span><div class="seg" data-set="firmware"><button data-v="ardupilot" class="${s.firmware === 'ardupilot' ? 'on' : ''}">ArduPilot</button><button data-v="px4" class="${s.firmware === 'px4' ? 'on' : ''}">PX4</button></div></div>
      <div class="sub">Conditions</div>
      ${num('wind', 'Forecast wind', 'm/s', 0, 30)}
    </div>
    <div class="keys">
      <div class="sub">Keys</div>
      <dl><dt>Right click</dt><dd>Add block</dd><dt>Drag pin to space</dt><dd>Add and wire</dd><dt>Alt click pin</dt><dd>Cut its wires</dd><dt>Shift drag</dt><dd>Box select</dd><dt>⌘D</dt><dd>Duplicate</dd><dt>⌫</dt><dd>Delete</dd><dt>F</dt><dd>Frame graph</dd><dt>⌘Z</dt><dd>Undo</dd></dl>
    </div>`
}

const parsePoint = t => {
  const m = String(t).match(/(-?\d+(?:\.\d+)?)\s*[, ]\s*(-?\d+(?:\.\d+)?)/)
  if (!m) return null
  const lat = +m[1], lng = +m[2]
  return Math.abs(lat) <= 90 && Math.abs(lng) <= 180 ? { lat, lng } : null
}

$('#insp').addEventListener('input', e => {
  const t = e.target
  const form = t.closest('[data-node]')
  if (form && t.dataset.key) {
    const id = form.dataset.node, key = t.dataset.key
    if (t.dataset.kind === 'point') {
      const p = parsePoint(t.value)
      if (p) commit(m => { m.nodes.find(n => n.id === id).p[key] = p }, 'insp', id + key)
      return
    }
    const v = t.type === 'number' ? parseFloat(t.value) : t.value
    if (t.type === 'number' && !Number.isFinite(v)) return
    commit(m => { m.nodes.find(n => n.id === id).p[key] = v }, 'insp', id + key)
  }
  if (t.dataset.set) {
    const key = t.dataset.set
    if (key === 'home') { const p = parsePoint(t.value); if (p) commit(m => { m.settings.home = p }, 'insp', 'home'); return }
    const v = parseFloat(t.value)
    if (Number.isFinite(v)) commit(m => { m.settings[key] = v }, 'insp', key)
  }
})
$('#insp').addEventListener('click', e => {
  const seg = e.target.closest('.seg button')
  if (seg) {
    const box = seg.parentElement
    const form = box.closest('[data-node]')
    if (box.dataset.key && form) commit(m => { m.nodes.find(n => n.id === form.dataset.node).p[box.dataset.key] = seg.dataset.v }, 'insp')
    if (box.dataset.set) commit(m => { m.settings[box.dataset.set] = seg.dataset.v }, 'insp')
    renderInspector()
    return
  }
  const clear = e.target.closest('[data-clear]')
  if (clear) { const id = clear.closest('[data-node]').dataset.node; commit(m => { m.nodes.find(n => n.id === id).p[clear.dataset.clear] = [] }, 'insp'); renderInspector() }
  const act = e.target.closest('[data-act]')?.dataset.act
  if (act === 'del') graph.deleteSelection()
  if (act === 'dup') graph.duplicate()
})
// redraw the inspector when a field loses focus, so derived text (distances, summaries) catches up
$('#insp').addEventListener('change', () => renderInspector())

/* ── analysis and panels ─────────────────────────────── */
function sevMap(a) {
  const sev = new Map()
  const walk = (seq, s) => seq.forEach(op => {
    if (RANK[s] > RANK[sev.get(op.node.id) || 'normal']) sev.set(op.node.id, s)
    if (op.then) walk(op.then, s)
    if (op.else) walk(op.else, s)
    if (op.body) walk(op.body, s)
  })
  for (const h of a.prog.handlers) { sev.set(h.node.id, h.sev); walk(h.seq, h.sev) }
  const issues = new Map()
  for (const i of a.issues) if (i.node && RANK[i.sev] > RANK[issues.get(i.node) || 'normal']) issues.set(i.node, i.sev)
  return { sev, issues }
}

function locatedOrder(a) {
  const order = new Map()
  let k = 0
  const walk = seq => seq.forEach(op => {
    if (LOCATED[op.node.type] && !order.has(op.node.id)) order.set(op.node.id, ++k)
    if (op.then) walk(op.then); if (op.else) walk(op.else); if (op.body) walk(op.body)
  })
  if (a.prog.main) walk(a.prog.main.seq)
  a.prog.handlers.forEach(h => walk(h.seq))
  return order
}

function renderStatus() {
  const crit = analysis.issues.filter(i => i.sev === 'critical').length
  const warn = analysis.issues.filter(i => i.sev === 'warning').length
  const s = $('#status')
  s.className = 'status ' + (crit ? 'sev-critical' : warn ? 'sev-warning' : 'sev-normal')
  s.querySelector('span').textContent = crit ? `${crit} critical` : warn ? `Go · ${warn} warning${warn > 1 ? 's' : ''}` : 'Go for launch'
  $('#n-checks').textContent = analysis.issues.length || ''
}

function renderChecks() {
  const a = analysis, n = a.nominal
  const row = i => `<button class="chk sev-${i.sev}" ${i.node ? `data-node="${i.node}"` : ''}><i></i><span class="chk-sev">${i.sev}</span><span class="chk-msg">${esc(i.msg)}</span>${i.node ? `<span class="chk-go">${esc(DEFS[getNode(i.node)?.type]?.title || '')} →</span>` : ''}</button>`
  $('#pane-checks').innerHTML = `
    <div class="stats">
      <div><b>${fmt.t(n.outcome?.t ?? 0)}</b><span>Flight time</span></div>
      <div><b>${fmt.m(n.st.dist)}</b><span>Distance</span></div>
      <div><b>${Math.round(n.st.battery)}%</b><span>Battery at landing</span></div>
      <div><b>${n.items.length}</b><span>Mission items</span></div>
      <div><b>${n.st.photos}</b><span>Photos</span></div>
    </div>
    <div class="chks">${a.issues.length ? a.issues.map(row).join('') : '<div class="chk sev-normal"><i></i><span class="chk-sev">Go</span><span class="chk-msg">All checks pass. Simulate it with faults before you fly it for real.</span></div>'}</div>`
}

function renderCode() {
  const m = store.mission
  const text = codeFmt === 'py' ? toPython(m, analysis.prog) : codeFmt === 'plan' ? toPlan(m, analysis.nominal) : toWaypoints(m, analysis.nominal)
  $('#code').textContent = text
  $('#code-note').textContent = codeFmt === 'py'
    ? 'Full logic: branches, loops and every failsafe as live telemetry watchers.'
    : 'Nominal path only. Waypoint missions cannot branch, so conditions are resolved on a fault free flight and loops are unrolled.'
}

function renderMap() {
  if (!analysis) return
  map.render(store.mission, analysis, selection, locatedOrder(analysis))
  const n = selection.length === 1 && getNode(selection[0])
  const hint = $('#map-hint')
  if (n && LOCATED[n.type] && mode === 'plan') {
    hint.hidden = false
    hint.textContent = n.type === 'survey' ? `Click to add corners to “${DEFS[n.type].title}”` : `Click to place “${DEFS[n.type].title}”`
  } else hint.hidden = true
}

let pending = 0
function refresh(why) {
  $('#mname').value = store.mission.name
  $('#btn-undo').disabled = !store.past.length
  $('#btn-redo').disabled = !store.future.length
  graph.render()
  clearTimeout(pending)
  pending = setTimeout(() => {
    analysis = analyse(store.mission)
    const o = sevMap(analysis)
    graph.setOverlay(o)
    renderStatus(); renderChecks(); renderCode()
    $('#pane-brief').innerHTML = brief(store.mission, analysis)
    if (!(why === 'insp' && document.activeElement?.closest('#insp'))) renderInspector()
    renderMap()
    if (mode === 'sim' && !running) resetSim()
    if (why === 'boot' || why === 'open') { map.fit(store.mission, analysis); requestAnimationFrame(() => graph.frame()) }
  }, why === 'boot' ? 0 : 120)
}
subscribe(refresh)

/* ── drawer, tabs ─────────────────────────────────────── */
$$('.tab').forEach(t => t.addEventListener('click', () => showTab(t.dataset.tab)))
function showTab(id) {
  $$('.tab').forEach(t => t.classList.toggle('on', t.dataset.tab === id))
  $$('.pane').forEach(p => p.classList.toggle('on', p.dataset.pane === id))
  $('#drawer').classList.remove('collapsed')
}
$('#drawer-toggle').addEventListener('click', () => {
  $('#drawer').classList.toggle('collapsed')
  setTimeout(() => map.invalidate(), 220)
})
$('#drawer').addEventListener('click', e => {
  const el = e.target.closest('[data-node]')
  if (!el || e.target.closest('.form')) return
  const id = el.dataset.node
  if (!getNode(id)) return
  e.stopPropagation()
  graph.select([id]); graph.center(id)
})
$('#status').addEventListener('click', () => showTab('checks'))

$('#code-fmt').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return
  codeFmt = b.dataset.f
  $$('#code-fmt button').forEach(x => x.classList.toggle('on', x === b))
  renderCode()
})
$('#code-copy').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText($('#code').textContent); toast('Copied') } catch { toast('Copy failed, select the text instead') }
})
$('#code-dl').addEventListener('click', () => doExport(codeFmt))

/* ── export ───────────────────────────────────────────── */
const slug = () => store.mission.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'mission'
function download(name, text, type) {
  const url = URL.createObjectURL(new Blob([text], { type }))
  const a = Object.assign(document.createElement('a'), { href: url, download: name })
  document.body.append(a); a.click(); a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
function doExport(kind) {
  const m = store.mission, a = analysis
  const crit = a.issues.some(i => i.sev === 'critical')
  if (kind === 'plan') download(`${slug()}.plan`, toPlan(m, a.nominal), 'application/json')
  if (kind === 'wpl') download(`${slug()}.waypoints`, toWaypoints(m, a.nominal), 'text/plain')
  if (kind === 'py') download(`${slug()}.py`, toPython(m, a.prog), 'text/x-python')
  if (kind === 'json') download(`${slug()}.mission.json`, JSON.stringify(m, null, 2), 'application/json')
  toast(crit && kind !== 'json' ? 'Exported, but the plan still has critical issues' : 'Exported')
}
$('#btn-export').addEventListener('click', e => { e.stopPropagation(); $('#export-menu').hidden = !$('#export-menu').hidden })
$('#export-menu').addEventListener('click', e => { const b = e.target.closest('[data-x]'); if (b) { doExport(b.dataset.x); $('#export-menu').hidden = true } })
document.addEventListener('click', e => { if (!e.target.closest('.menu-wrap')) $('#export-menu').hidden = true })

/* ── top bar ──────────────────────────────────────────── */
$('#mname').addEventListener('input', e => commit(m => { m.name = e.target.value || 'Untitled mission' }, 'name', 'name'))
$('#btn-undo').addEventListener('click', undo)
$('#btn-redo').addEventListener('click', redo)
$('#btn-base').addEventListener('click', e => { e.target.textContent = map.toggleBase() })
$('#btn-fit').addEventListener('click', () => map.fit(store.mission, analysis))

let toastT = 0
function toast(msg) {
  const t = $('#toast')
  t.textContent = msg; t.hidden = false
  clearTimeout(toastT); toastT = setTimeout(() => { t.hidden = true }, 2200)
}

/* ── missions sheet ───────────────────────────────────── */
function renderSheet() {
  $('#tpl').innerHTML = TEMPLATES.map(t => `<button class="tpl-i" data-tpl="${t.id}"><b>${t.name}</b><span>${t.desc}</span></button>`).join('')
  const list = listMissions()
  $('#saved').innerHTML = list.map(m => `<div class="saved-i${m.id === store.mission.id ? ' cur' : ''}"><button data-open="${m.id}"><b>${esc(m.name)}</b><span>${m.nodes.length} blocks · ${new Date(m.updated).toLocaleString()}</span></button>${m.id === store.mission.id ? '<em>Open</em>' : `<button class="btn ghost sm" data-del="${m.id}">Delete</button>`}</div>`).join('') || '<p class="muted">Nothing saved yet.</p>'
}
$('#btn-missions').addEventListener('click', () => { renderSheet(); $('#sheet').hidden = false })
$('#sheet-close').addEventListener('click', () => { $('#sheet').hidden = true })
$('#sheet').addEventListener('click', e => {
  if (e.target.id === 'sheet') { $('#sheet').hidden = true; return }
  const t = e.target.closest('[data-tpl]')
  if (t) { setMode('plan'); open(TEMPLATES.find(x => x.id === t.dataset.tpl).build()); $('#sheet').hidden = true; selection = []; return }
  const o = e.target.closest('[data-open]')
  if (o) { setMode('plan'); open(listMissions().find(m => m.id === o.dataset.open)); $('#sheet').hidden = true; selection = []; return }
  const d = e.target.closest('[data-del]')
  if (d && confirm('Delete this mission from this browser?')) { deleteMission(d.dataset.del); renderSheet() }
})
$('#btn-import').addEventListener('click', () => $('#file').click())
$('#file').addEventListener('change', async e => {
  const f = e.target.files[0]
  if (!f) return
  try { importMission(await f.text()); $('#sheet').hidden = true; toast('Imported') } catch (err) { toast(err.message) }
  e.target.value = ''
})

/* ── split divider ────────────────────────────────────── */
$('#divider').addEventListener('pointerdown', e => {
  const stage = $('#stage'), r = stage.getBoundingClientRect()
  e.target.setPointerCapture(e.pointerId)
  const move = ev => {
    const f = Math.min(0.8, Math.max(0.2, (ev.clientX - r.left) / r.width))
    stage.style.setProperty('--split', f * 100 + '%')
    map.invalidate()
  }
  const up = () => { e.target.removeEventListener('pointermove', move); e.target.removeEventListener('pointerup', up) }
  e.target.addEventListener('pointermove', move)
  e.target.addEventListener('pointerup', up)
})

/* ── simulation ───────────────────────────────────────── */
$$('.mode').forEach(b => b.addEventListener('click', () => setMode(b.dataset.mode)))
function setMode(m) {
  if (m === mode) return
  mode = m
  $$('.mode').forEach(b => b.classList.toggle('on', b.dataset.mode === m))
  document.body.classList.toggle('simulating', m === 'sim')
  $('#hud').hidden = $('#simbar').hidden = m !== 'sim'
  // the map is the instrument while flying, so give it the room; plan mode gets its own split back
  const stage = $('#stage')
  if (m === 'sim') { stage.dataset.plan = stage.style.getPropertyValue('--split'); stage.style.setProperty('--split', '30%') }
  else stage.style.setProperty('--split', stage.dataset.plan || '')
  if (m === 'sim') { resetSim(); showTab('log') }
  else { running = false; sim = null; map.setSim(null); graph.setOverlay({ active: null }); renderMap() }
  setTimeout(() => map.invalidate(), 50)
}

function resetSim() {
  running = false
  if (!analysis) return
  sim = new Sim(analysis.prog, store.mission.settings)
  map.setSim(null)
  map.setSim(sim)
  graph.setOverlay({ active: null })
  $('#sim-play').textContent = 'Launch'
  $('#fault-link').textContent = 'Cut link'
  renderTimeline(); renderHUD(); renderLog()
}

$('#sim-play').addEventListener('click', () => {
  if (!sim) return
  if (sim.outcome) resetSim()
  if (!sim.gen) sim.start()
  running = !running
  $('#sim-play').textContent = running ? 'Hold' : 'Resume'
  lastFrame = performance.now()
  if (running) requestAnimationFrame(loop)
})
$('#sim-reset').addEventListener('click', resetSim)
$('#sim-speed').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return
  speed = +b.dataset.s
  $$('#sim-speed button').forEach(x => x.classList.toggle('on', x === b))
})
$$('[data-fault]').forEach(b => b.addEventListener('click', () => {
  if (!sim?.gen || sim.outcome) { toast('Launch first'); return }
  sim.inject(b.dataset.fault)
  if (b.dataset.fault === 'link') b.textContent = sim.faults.link ? 'Restore link' : 'Cut link'
  renderLog()
}))

let lastActive = null, lastLog = 0
function loop(now) {
  if (!running || !sim) return
  let budget = Math.min(0.25, (now - lastFrame) / 1000) * speed
  lastFrame = now
  while (budget > 0 && !sim.outcome) { const dt = Math.min(0.25, budget); sim.tick(dt); budget -= dt }
  map.setSim(sim)
  renderHUD()
  if (sim.activeNode !== lastActive) { lastActive = sim.activeNode; graph.setOverlay({ active: lastActive }) }
  if (sim.log.length !== lastLog) renderLog()
  if (sim.outcome) {
    running = false
    $('#sim-play').textContent = 'Fly again'
    graph.setOverlay({ active: null })
    toast(sim.outcome.msg)
    return
  }
  requestAnimationFrame(loop)
}

function gauge(id, v, max, label, sev = 'normal') {
  const g = $(id), c = g.querySelector('.g-val'), len = 2 * Math.PI * 42 * 0.75
  c.style.strokeDasharray = `${len * Math.max(0, Math.min(1, v / max))} 999`
  g.className = 'gauge sev-' + sev
  g.querySelector('b').textContent = label
}

function renderHUD() {
  if (!sim) return
  const st = sim.st, s = store.mission.settings
  $('#hud-t').textContent = (sim.gen ? '+' : '−') + fmt.t(st.elapsed)
  const mm = $('#hud-mode')
  mm.textContent = sim.outcome ? sim.outcome.msg : !sim.gen ? 'Ready on pad' : sim.mode.label
  mm.className = 'hud-mode sev-' + (sim.outcome ? (sim.outcome.kind === 'landed-home' ? 'normal' : sim.outcome.kind === 'landed-away' ? 'warning' : 'critical') : sim.mode.sev)
  gauge('#g-speed', st.hs, 20, st.hs.toFixed(1))
  gauge('#g-alt', st.alt, s.maxAlt, Math.round(st.alt), st.alt > s.maxAlt ? 'critical' : 'normal')
  gauge('#g-batt', st.battery, 100, Math.round(st.battery), st.battery < s.reserve ? 'critical' : st.battery < s.reserve + 15 ? 'warning' : 'normal')
  $('#hud-dist').textContent = fmt.m(st.dist)
  const dh = distance(st.pos, s.home)
  $('#hud-home').textContent = fmt.m(dh)
  $('#hud-home').className = dh > s.fenceRadius ? 'sev-critical' : ''
  $('#hud-wind').textContent = `${st.wind.toFixed(0)} m/s`
  $('#hud-wind').className = st.wind > s.wind + 1 ? 'sev-warning' : ''
  $('#hud-gps').textContent = `${st.sats} sats`
  $('#hud-gps').className = st.sats < 6 ? 'sev-warning' : ''
  $('#hud-link').textContent = st.link ? 'OK' : `Lost ${Math.round(st.linkLostFor)} s`
  $('#hud-link').className = st.link ? '' : 'sev-warning'
  $('#hud-photos').textContent = st.photos
  const total = Math.max(1, analysis.nominal.outcome?.t || 1)
  $('#tl-fill').style.width = Math.min(100, st.elapsed / total * 100) + '%'
  $$('#tl-marks .tl-m').forEach(m => m.classList.toggle('past', +m.dataset.t <= st.elapsed))
}

// SpaceX webcast style: milestones from the nominal flight laid on one line.
function renderTimeline() {
  const n = analysis.nominal, total = Math.max(1, n.outcome?.t || 1)
  const NAMES = [[/^Take off/, 'Liftoff'], [/^Survey/, 'Survey'], [/^Fly to/, 'Waypoint'], [/^Orbit/, 'Orbit'], [/^Payload released/, 'Release'], [/^Return home/, 'Return'], [/^Touchdown/, 'Landing']]
  const marks = n.log.map(e => ({ ...e, name: NAMES.find(([re]) => re.test(e.msg))?.[1] })).filter(e => e.name)
  let lastPct = -20
  $('#tl-marks').innerHTML = marks.map(e => {
    const pct = (e.t / total) * 100
    const label = pct - lastPct > 11 ? e.name : ''
    if (label) lastPct = pct
    const edge = pct < 6 ? ' l' : pct > 94 ? ' r' : ''
    return `<div class="tl-m${edge}" data-t="${e.t}" style="left:${pct}%"><i></i>${label ? `<span>${esc(label)}</span>` : ''}</div>`
  }).join('')
}

function renderLog() {
  if (!sim) { $('#pane-log').innerHTML = '<p class="muted pad">Switch to Simulate and launch to see the flight log.</p>'; return }
  lastLog = sim.log.length
  $('#n-log').textContent = sim.log.length || ''
  const rows = sim.log.slice().reverse().map(e => `<div class="lg sev-${e.sev}"${e.node ? ` data-node="${e.node}"` : ''}><time>T+${fmt.t(e.t)}</time><i></i><span>${esc(e.msg)}</span></div>`).join('')
  $('#pane-log').innerHTML = rows || '<p class="muted pad">On the pad. Press Launch, then try injecting faults to watch the failsafes take over.</p>'
}

/* ── keyboard ─────────────────────────────────────────── */
window.addEventListener('keydown', e => {
  if (isTyping(e)) return
  const mod = e.metaKey || e.ctrlKey
  if (mod && e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); return }
  if (mod && e.key.toLowerCase() === 'y') { e.preventDefault(); redo(); return }
  if (mod && e.key.toLowerCase() === 'd') { e.preventDefault(); graph.duplicate(); return }
  if (mod && e.key.toLowerCase() === 'a') { e.preventDefault(); graph.select(store.mission.nodes.map(n => n.id)); return }
  if (e.key === 'Delete' || e.key === 'Backspace') { if (graph.deleteSelection()) e.preventDefault(); return }
  if (e.key === 'Escape') { graph.select([]); $('#sheet').hidden = true; return }
  if (e.key === 'f' || e.key === 'F') { graph.frame(selection.length ? selection : undefined); return }
})

/* ── go ───────────────────────────────────────────────── */
renderLibrary()
renderLog()
boot()
const CAPTURE = new URLSearchParams(location.search).has('capture')
if (!CAPTURE) bootSequence($('#app'))

// ?capture: the product video steps the flight frame by frame from a script,
// so the footage is smooth no matter how slowly screenshots are taken.
if (CAPTURE) window.__mc = {
  setMode,
  tab: showTab,
  select(type) { const n = store.mission.nodes.find(x => x.type === type); if (n) { graph.select([n.id]); graph.center(n.id) } },
  frame: () => graph.frame(),
  launch() { if (!sim.gen) sim.start(); $('#sim-play').textContent = 'Hold'; renderHUD() },
  inject(kind) { sim.inject(kind); renderLog() },
  step(sec) {
    for (let t = 0; t < sec && !sim.outcome; t += 0.25) sim.tick(0.25)
    map.setSim(sim); renderHUD(); renderLog()
    if (sim.activeNode !== lastActive) { lastActive = sim.activeNode; graph.setOverlay({ active: lastActive }) }
    return { t: sim.st.elapsed, done: !!sim.outcome, mode: sim.mode.label }
  },
}
$('#btn-help').addEventListener('click', () => { setMode('plan'); tour() })
