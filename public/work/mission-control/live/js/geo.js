// Small flat-earth-correct geometry for mission scale distances (a few km).

const R = 6371000
const rad = d => d * Math.PI / 180
const deg = r => r * 180 / Math.PI

export function distance(a, b) {
  const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)))
}

export function bearing(a, b) {
  const y = Math.sin(rad(b.lng - a.lng)) * Math.cos(rad(b.lat))
  const x = Math.cos(rad(a.lat)) * Math.sin(rad(b.lat)) - Math.sin(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.cos(rad(b.lng - a.lng))
  return (deg(Math.atan2(y, x)) + 360) % 360
}

/** Point `m` metres from `p` along `brg` degrees. */
export function offset(p, brg, m) {
  const d = m / R, t = rad(brg), la = rad(p.lat), lo = rad(p.lng)
  const la2 = Math.asin(Math.sin(la) * Math.cos(d) + Math.cos(la) * Math.sin(d) * Math.cos(t))
  const lo2 = lo + Math.atan2(Math.sin(t) * Math.sin(d) * Math.cos(la), Math.cos(d) - Math.sin(la) * Math.sin(la2))
  return { lat: deg(la2), lng: deg(lo2) }
}

/** Move from a toward b by m metres, never past b. */
export function stepToward(a, b, m) {
  const d = distance(a, b)
  if (d <= m || d === 0) return { ...b }
  const f = m / d
  return { lat: a.lat + (b.lat - a.lat) * f, lng: a.lng + (b.lng - a.lng) * f }
}

// Local tangent plane, metres east/north of an origin.
export function toXY(o, p) {
  return { x: rad(p.lng - o.lng) * R * Math.cos(rad(o.lat)), y: rad(p.lat - o.lat) * R }
}
export function fromXY(o, q) {
  return { lat: o.lat + deg(q.y / R), lng: o.lng + deg(q.x / (R * Math.cos(rad(o.lat)))) }
}

export function inPolygon(p, poly) {
  let inside = false
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i], b = poly[j]
    if ((a.lat > p.lat) !== (b.lat > p.lat) &&
        p.lng < (b.lng - a.lng) * (p.lat - a.lat) / (b.lat - a.lat) + a.lng) inside = !inside
  }
  return inside
}

export function centroid(poly) {
  const n = poly.length || 1
  return { lat: poly.reduce((s, p) => s + p.lat, 0) / n, lng: poly.reduce((s, p) => s + p.lng, 0) / n }
}

export function pathLength(pts) {
  let d = 0
  for (let i = 1; i < pts.length; i++) d += distance(pts[i - 1], pts[i])
  return d
}

/**
 * Lawnmower survey over a polygon: parallel lines `spacing` metres apart at
 * `angle` degrees, clipped to the polygon, joined boustrophedon style.
 */
export function surveyPath(poly, spacing, angle = 0) {
  if (!poly || poly.length < 3 || spacing <= 0) return []
  const o = centroid(poly)
  const t = rad(angle)
  const rot = (q, s) => ({ x: q.x * Math.cos(s) - q.y * Math.sin(s), y: q.x * Math.sin(s) + q.y * Math.cos(s) })
  const pts = poly.map(p => rot(toXY(o, p), -t))
  const minY = Math.min(...pts.map(p => p.y)), maxY = Math.max(...pts.map(p => p.y))
  const out = []
  let flip = false
  for (let y = minY + spacing / 2; y < maxY; y += spacing) {
    const xs = []
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const a = pts[i], b = pts[j]
      if ((a.y > y) !== (b.y > y)) xs.push(a.x + (y - a.y) * (b.x - a.x) / (b.y - a.y))
    }
    if (xs.length < 2) continue
    xs.sort((m, n) => m - n)
    let seg = [{ x: xs[0], y }, { x: xs[xs.length - 1], y }]
    if (flip) seg.reverse()
    flip = !flip
    for (const q of seg) out.push(fromXY(o, rot(q, t)))
  }
  return out
}

/** Points around a circle, for drawing and for flying an orbit. */
export function circlePoints(c, radius, n = 36) {
  return Array.from({ length: n + 1 }, (_, i) => offset(c, (i / n) * 360, radius))
}

export const fmt = {
  m: v => v >= 1000 ? (v / 1000).toFixed(2) + ' km' : Math.round(v) + ' m',
  t: s => {
    s = Math.max(0, Math.round(s))
    const h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60, x = s % 60
    return (h ? String(h).padStart(2, '0') + ':' : '') + String(m).padStart(2, '0') + ':' + String(x).padStart(2, '0')
  },
  ll: p => p ? `${p.lat.toFixed(6)}, ${p.lng.toFixed(6)}` : 'not set',
}
