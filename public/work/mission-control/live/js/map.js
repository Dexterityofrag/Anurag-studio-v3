// Satellite map: home, geofence, waypoints, orbits, survey areas, the nominal
// path, worst case contingency paths, and the live aircraft in simulation.
import { DEFS, LOCATED } from './nodes.js'
import { surveyPath, circlePoints } from './geo.js'

const L = window.L
const SEV = { normal: '#f5f5f5', warning: '#ff8a1f', critical: '#ff3b30' }
const ll = p => [p.lat, p.lng]
const P = q => ({ lat: q.lat, lng: q.lng })

export function createMap(el, { onPlace, onMove, onHome, onRemoveVertex }) {
  const map = L.map(el, { zoomControl: false, attributionControl: true, worldCopyJump: true, zoomSnap: 0.25 })
  const sat = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 20, maxNativeZoom: 19, className: 'tiles-sat',
    attribution: 'Imagery © Esri, Maxar, Earthstar Geographics',
  })
  const dark = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 20, subdomains: 'abcd', className: 'tiles-dark',
    attribution: '© OpenStreetMap contributors © CARTO',
  })
  let base = sat.addTo(map)
  L.control.zoom({ position: 'bottomright' }).addTo(map)

  const plan = L.layerGroup().addTo(map)
  const simLayer = L.layerGroup().addTo(map)
  let drone = null, simTrail = null, lastSev = null
  let selected = [], mission = null

  const icon = (cls, html = '') => L.divIcon({ className: 'mk ' + cls, html, iconSize: null })

  map.on('click', e => {
    const n = selectedLocated()
    if (n) onPlace(n, P(e.latlng))
  })

  function selectedLocated() {
    if (!mission || selected.length !== 1) return null
    const n = mission.nodes.find(x => x.id === selected[0])
    return n && LOCATED[n.type] ? n : null
  }

  function render(m, analysis, sel, order) {
    mission = m; selected = sel
    plan.clearLayers()
    const s = m.settings
    const sn = selectedLocated()
    el.classList.toggle('placing', !!sn)

    L.circle(ll(s.home), { radius: s.fenceRadius, color: '#fff', weight: 1, opacity: 0.55, dashArray: '2 6', fill: false, interactive: false }).addTo(plan)

    if (analysis) {
      for (const c of analysis.contingencies) {
        const pts = c.sim.trail.map(ll)
        if (pts.length > 1) L.polyline(pts, { color: SEV[c.h.sev], weight: 1.5, opacity: 0.9, dashArray: '6 6', interactive: false }).addTo(plan)
      }
      const nom = analysis.nominal.trail.filter(p => p.sev === 'normal').map(ll)
      if (nom.length > 1) {
        L.polyline(nom, { color: '#000', weight: 5, opacity: 0.35, interactive: false }).addTo(plan)
        L.polyline(nom, { color: '#fff', weight: 2, opacity: 0.95, interactive: false }).addTo(plan)
      }
    }

    for (const n of m.nodes) {
      const key = LOCATED[n.type]
      if (!key) continue
      const isSel = sel.includes(n.id)
      const p = n.p
      const label = order.get(n.id) ?? ''
      if (n.type === 'goto' && p.point) {
        const mk = L.marker(ll(p.point), { icon: icon('wp' + (isSel ? ' sel' : ''), `<i>${label}</i><span>${p.alt} m</span>`), draggable: isSel, keyboard: false }).addTo(plan)
        mk.on('dragend', () => onMove(n, 'point', null, P(mk.getLatLng())))
        mk.on('click', () => window.dispatchEvent(new CustomEvent('mc:select', { detail: n.id })))
      }
      if (n.type === 'orbit' && p.center) {
        L.polyline(circlePoints(p.center, p.radius, 72).map(ll), { color: '#fff', weight: isSel ? 2 : 1.25, opacity: 0.9, interactive: false }).addTo(plan)
        const mk = L.marker(ll(p.center), { icon: icon('poi' + (isSel ? ' sel' : ''), `<i>${label}</i>`), draggable: isSel }).addTo(plan)
        mk.on('dragend', () => onMove(n, 'center', null, P(mk.getLatLng())))
        mk.on('click', () => window.dispatchEvent(new CustomEvent('mc:select', { detail: n.id })))
      }
      if (n.type === 'survey' && p.area?.length) {
        const poly = L.polygon(p.area.map(ll), { color: '#fff', weight: isSel ? 1.5 : 1, opacity: 0.9, fillColor: '#fff', fillOpacity: isSel ? 0.1 : 0.05 }).addTo(plan)
        poly.on('click', e => { if (!isSel) { L.DomEvent.stop(e); window.dispatchEvent(new CustomEvent('mc:select', { detail: n.id })) } })
        const lines = surveyPath(p.area, p.spacing, p.angle)
        if (lines.length > 1) L.polyline(lines.map(ll), { color: '#fff', weight: 1, opacity: 0.45, interactive: false }).addTo(plan)
        if (isSel) p.area.forEach((v, i) => {
          const mk = L.marker(ll(v), { icon: icon('vx'), draggable: true }).addTo(plan)
          mk.on('drag', () => { const a = poly.getLatLngs()[0]; a[i] = mk.getLatLng(); poly.setLatLngs(a) })
          mk.on('dragend', () => onMove(n, 'area', i, P(mk.getLatLng())))
          mk.on('contextmenu', e => { L.DomEvent.stop(e); onRemoveVertex(n, i) })
        })
      }
    }

    const home = L.marker(ll(s.home), { icon: icon('home', 'H'), draggable: true, zIndexOffset: 1000, title: 'Home. Drag to move the launch point.' }).addTo(plan)
    home.on('dragend', () => onHome(P(home.getLatLng())))
  }

  /* ── simulation ─────────────────────────────────── */
  function setSim(sim) {
    if (!sim) {
      simLayer.clearLayers(); drone = null; simTrail = null; lastSev = null
      return
    }
    const st = sim.st
    if (!drone) {
      drone = L.marker(ll(st.pos), { icon: icon('drone', '<svg viewBox="0 0 24 24"><path d="M12 2 20 21 12 16 4 21Z"/></svg>'), zIndexOffset: 2000, interactive: false }).addTo(simLayer)
    }
    drone.setLatLng(ll(st.pos))
    const svg = drone.getElement()?.querySelector('svg')
    if (svg) svg.style.transform = `rotate(${st.heading}deg)`
    drone.getElement()?.classList.toggle('grounded', st.ground)
    const sev = sim.mode.sev
    if (!simTrail || sev !== lastSev) {
      const prev = simTrail?.getLatLngs()
      simTrail = L.polyline(prev?.length ? [prev[prev.length - 1]] : [], { color: SEV[sev], weight: 3, opacity: 1, interactive: false }).addTo(simLayer)
      lastSev = sev
    }
    simTrail.addLatLng(ll(st.pos))
  }

  function fit(m, analysis) {
    map.invalidateSize()
    const pts = [ll(m.settings.home)]
    for (const n of m.nodes) {
      if (n.p.point) pts.push(ll(n.p.point))
      if (n.p.center) pts.push(ll(n.p.center))
      if (n.p.area) n.p.area.forEach(v => pts.push(ll(v)))
    }
    analysis?.nominal.trail.forEach(p => pts.push(ll(p)))
    if (pts.length === 1) map.setView(pts[0], 16)
    else map.fitBounds(L.latLngBounds(pts).pad(0.15), { maxZoom: 18 })
  }

  function toggleBase() {
    map.removeLayer(base)
    base = base === sat ? dark : sat
    base.addTo(map)
    return base === sat ? 'Satellite' : 'Dark'
  }

  return { render, setSim, fit, toggleBase, invalidate: () => map.invalidateSize(), map }
}
