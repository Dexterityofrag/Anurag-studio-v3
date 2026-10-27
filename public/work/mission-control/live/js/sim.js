// Flight simulator and program interpreter.
//
// The compiled program is walked by generators: every `yield` is one physics
// tick, so a long manoeuvre is just a loop that yields until it arrives. An
// event handler preempts by swapping the running generator, the same way an
// Unreal event interrupts whatever the graph was doing.

import { distance, bearing, offset, stepToward, surveyPath } from './geo.js'
import { DEFS } from './nodes.js'

export const RANK = { normal: 0, warning: 1, critical: 2 }
const NEEDS_AIR = new Set(['goto', 'survey', 'orbit', 'hold', 'land', 'rtl', 'emland'])
const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
const REL = 3, MISSION = 2   // MAV_FRAME_GLOBAL_RELATIVE_ALT, MAV_FRAME_MISSION

export class Sim {
  constructor(program, settings) {
    this.prog = program
    this.s = settings
    this.st = {
      pos: { ...settings.home }, alt: 0, ground: true, armed: false,
      speed: settings.cruise, hs: 0, vs: 0, heading: 0,
      battery: 100, elapsed: 0, dist: 0, wind: settings.wind, sats: 14,
      link: true, linkLostFor: 0, gimbal: 0, recording: false, payload: true, photos: 0,
    }
    this.log = []
    this.trail = []
    this.items = []          // MAVLink mission items flown in the main program
    this.fired = new Set()
    this.mode = { sev: 'normal', label: 'Main program', node: null }
    this.faults = { gust: 0, gps: 0, link: false, }
    this.outcome = null
    this.activeNode = null
    this.endedAirborne = false
    this.dt = 0.5
    this.gen = null
  }

  /* ── lifecycle ─────────────────────────────────────── */
  start() {
    if (!this.prog.main) return this.finish('no-start', 'No Mission Start block, nothing to run')
    this.gen = this.execSeq(this.prog.main.seq)
    this.event('Mission start', 'normal', this.prog.main.node.id)
  }

  /** Start airborne partway through a flight and run one handler. Used for contingency previews. */
  startHandler(h, from) {
    Object.assign(this.st, { pos: { lat: from.lat, lng: from.lng }, alt: from.alt, ground: false, armed: true, battery: from.battery ?? 50, elapsed: from.t ?? 0 })
    this.mode = { sev: h.sev, label: DEFS[h.node.type].title, node: h.node.id }
    this.fired.add(h.node.id)
    this.gen = this.execSeq(h.seq)
  }

  finish(kind, msg) {
    if (this.outcome) return
    if (kind === 'landed') {
      const d = distance(this.st.pos, this.s.home)
      kind = d < 15 ? 'landed-home' : 'landed-away'
      msg = d < 15 ? 'Landed at home' : `Landed ${Math.round(d)} m from home`
    }
    this.outcome = { kind, msg, t: this.st.elapsed }
    const sev = kind === 'landed-home' ? 'normal' : kind === 'landed-away' ? 'warning' : 'critical'
    this.event(msg, sev)
  }

  tick(dt) {
    if (this.outcome || !this.gen) return
    this.dt = dt
    const st = this.st, f = this.faults
    // injected faults
    st.wind = f.gust > 0 ? this.s.wind + 9 : this.s.wind
    if (f.gust > 0) f.gust -= dt
    st.sats = f.gps > 0 ? 4 : 14
    if (f.gps > 0) f.gps -= dt
    st.link = !f.link
    st.linkLostFor = f.link ? st.linkLostFor + dt : 0

    const alt0 = st.alt
    const r = this.gen.next()
    if (r.done) this.programEnded()
    st.vs = (st.alt - alt0) / dt

    if (st.armed && !st.ground) {
      const base = 100 / (this.s.endurance * 60)
      const load = 1 + 0.25 * (st.hs / Math.max(1, this.s.cruise)) ** 2 + 0.035 * st.wind + (st.vs > 0.2 ? 0.3 : 0)
      st.battery = Math.max(0, st.battery - base * load * dt)
    }
    st.elapsed += dt

    const last = this.trail[this.trail.length - 1]
    if (!last || st.elapsed - last.t >= 1 || last.sev !== this.mode.sev) {
      this.trail.push({ lat: st.pos.lat, lng: st.pos.lng, alt: st.alt, t: st.elapsed, sev: this.mode.sev, battery: st.battery })
    }

    if (st.battery <= 0 && !st.ground) return this.finish('crash', 'Battery exhausted in flight, aircraft lost')
    this.checkEvents()
  }

  programEnded() {
    if (this.st.ground) return this.finish('landed')
    if (!this.endedAirborne) {
      this.endedAirborne = true
      this.event('Program ended in the air, aircraft is hovering', 'critical', this.activeNode)
    }
    this.gen = this.hover()
  }

  *hover() { for (;;) { this.st.hs = 0; yield } }

  checkEvents() {
    const st = this.st
    if (st.ground) return
    for (const h of this.prog.handlers) {
      if (this.fired.has(h.node.id)) continue
      if (!this.triggered(h.node)) continue
      this.fired.add(h.node.id)
      const title = DEFS[h.node.type].title
      const what = DEFS[h.node.type].summary(h.node.p)
      if (RANK[h.sev] > RANK[this.mode.sev]) {
        this.mode = { sev: h.sev, label: title, node: h.node.id }
        this.endedAirborne = false
        this.st.hs = 0
        this.gen = this.execSeq(h.seq)
        this.event(`${title}: ${what}`, h.sev, h.node.id)
      } else {
        this.event(`${title}: ${what}, already handling ${this.mode.label}`, h.sev, h.node.id)
      }
    }
  }

  triggered(n) {
    const st = this.st, p = n.p
    switch (n.type) {
      case 'ev_battery_low':
      case 'ev_battery_critical': return st.battery < p.pct
      case 'ev_link_lost': return st.linkLostFor >= p.sec
      case 'ev_gps_lost': return st.sats < p.sats
      case 'ev_geofence': return distance(st.pos, this.s.home) > this.s.fenceRadius
    }
    return false
  }

  /* ── fault injection ───────────────────────────────── */
  inject(kind) {
    const st = this.st
    if (kind === 'battery') { st.battery = Math.max(0, st.battery - 25); this.event('Fault: cell failure, battery −25%', 'warning') }
    if (kind === 'gust') { this.faults.gust = 60; this.event('Fault: wind gust +9 m/s for 60 s', 'warning') }
    if (kind === 'gps') { this.faults.gps = 30; this.event('Fault: GPS degraded to 4 satellites for 30 s', 'warning') }
    if (kind === 'link') {
      this.faults.link = !this.faults.link
      this.event(this.faults.link ? 'Fault: ground link lost' : 'Ground link restored', this.faults.link ? 'warning' : 'normal')
    }
  }

  /* ── log and mission items ─────────────────────────── */
  event(msg, sev = 'normal', node = null) {
    this.log.push({ t: this.st.elapsed, msg, sev, node })
  }
  item(cmd, params, frame = MISSION, node = null) {
    if (this.mode.sev !== 'normal') return
    this.items.push({ cmd, frame, params: params.map(v => v === undefined ? 0 : v), node })
  }

  /* ── motion primitives ─────────────────────────────── */
  *climbTo(alt, rate) {
    const st = this.st
    while (Math.abs(st.alt - alt) > 0.05) {
      st.hs = 0
      st.alt += clamp(alt - st.alt, -rate * this.dt, rate * this.dt)
      yield
    }
    st.alt = alt
  }

  *flyTo(p, alt) {
    const st = this.st
    for (;;) {
      st.alt += clamp(alt - st.alt, -this.s.climb * this.dt, this.s.climb * this.dt)
      const d = distance(st.pos, p)
      if (d < 0.5 && Math.abs(alt - st.alt) < 0.1) break
      if (d >= 0.5) {
        st.heading = bearing(st.pos, p)
        const np = stepToward(st.pos, p, st.speed * this.dt)
        st.dist += distance(st.pos, np)
        st.hs = Math.min(st.speed, d / this.dt)
        st.pos = np
      } else st.hs = 0
      yield
    }
    st.hs = 0
  }

  *wait(sec) {
    for (let t = 0; t < sec; t += this.dt) { this.st.hs = 0; yield }
  }

  *touchdown(rate) {
    yield* this.climbTo(0, rate)
    this.st.ground = true
    this.st.armed = false
    this.event('Touchdown, disarmed')
  }

  /* ── interpreter ───────────────────────────────────── */
  *execSeq(seq) {
    for (const op of seq) yield* this.execOp(op)
  }

  *execOp(op) {
    const n = op.node, p = n.p, d = DEFS[n.type], st = this.st, s = this.s
    this.activeNode = n.id
    if (NEEDS_AIR.has(n.type) && st.ground) {
      this.event(`${d.title} skipped, aircraft is on the ground`, 'critical', n.id)
      return
    }
    switch (n.type) {
      case 'takeoff':
        if (!st.ground) { this.event('Take Off skipped, already airborne', 'warning', n.id); return }
        st.armed = true; st.ground = false
        this.item(22, [0, 0, 0, null, st.pos.lat, st.pos.lng, p.alt], REL, n.id)
        this.event(`Take off to ${p.alt} m`, 'normal', n.id)
        yield* this.climbTo(p.alt, s.climb)
        return

      case 'goto':
        if (!p.point) { this.event('Fly To skipped, no location set', 'critical', n.id); return }
        this.item(16, [p.hold, 0, 0, null, p.point.lat, p.point.lng, p.alt], REL, n.id)
        this.event(`Fly to waypoint at ${p.alt} m`, 'normal', n.id)
        yield* this.flyTo(p.point, p.alt)
        if (p.hold > 0) yield* this.wait(p.hold)
        return

      case 'survey': {
        const path = surveyPath(p.area, p.spacing, p.angle)
        if (!path.length) { this.event('Survey skipped, area not drawn', 'critical', n.id); return }
        this.event(`Survey: ${path.length / 2} lines at ${p.alt} m`, 'normal', n.id)
        for (let i = 0; i < path.length; i++) {
          this.item(16, [0, 0, 0, null, path[i].lat, path[i].lng, p.alt], REL, n.id)
          // camera triggers only while flying a survey line, not on the turns between them
          if (p.trigger > 0) this.item(206, [i % 2 === 0 ? p.trigger : 0, 0, 1, 0, 0, 0, 0], MISSION, n.id)
          const start = { ...st.pos }
          yield* this.flyTo(path[i], p.alt)
          if (i % 2 === 1 && p.trigger > 0) st.photos += Math.floor(distance(start, st.pos) / p.trigger) + 1
        }
        return
      }

      case 'orbit': {
        if (!p.center) { this.event('Orbit skipped, centre not set', 'critical', n.id); return }
        const startBrg = distance(st.pos, p.center) < 1 ? 0 : bearing(p.center, st.pos)
        yield* this.flyTo(offset(p.center, startBrg, p.radius), p.alt)
        this.item(18, [p.turns, 0, p.radius, null, p.center.lat, p.center.lng, p.alt], REL, n.id)
        this.event(`Orbit ${p.turns}× at ${p.radius} m`, 'normal', n.id)
        const total = p.turns * 360
        let a = startBrg, done = 0
        while (done < total) {
          const step = Math.min(total - done, (st.speed * this.dt / p.radius) * 180 / Math.PI)
          a += step; done += step
          const np = offset(p.center, a, p.radius)
          st.dist += distance(st.pos, np)
          st.heading = (a + 90) % 360
          st.hs = st.speed
          st.pos = np
          yield
        }
        st.hs = 0
        return
      }

      case 'hold':
        this.item(19, [p.sec, 0, 0, null, st.pos.lat, st.pos.lng, st.alt], REL, n.id)
        this.event(`Hold ${p.sec} s`, 'normal', n.id)
        yield* this.wait(p.sec)
        return

      case 'speed':
        st.speed = p.ms
        this.item(178, [1, p.ms, -1, 0, 0, 0, 0], MISSION, n.id)
        this.event(`Speed ${p.ms} m/s`, 'normal', n.id)
        yield
        return

      case 'land':
        this.item(21, [0, 0, 0, null, st.pos.lat, st.pos.lng, 0], REL, n.id)
        this.event('Landing in place', 'normal', n.id)
        yield* this.touchdown(1.5)
        return

      case 'rtl': {
        this.item(20, [0, 0, 0, 0, 0, 0, 0], MISSION, n.id)
        const alt = Math.max(p.alt, st.alt)
        this.event(`Return home at ${Math.round(alt)} m`, this.mode.sev, n.id)
        yield* this.climbTo(alt, s.climb)
        yield* this.flyTo(s.home, alt)
        yield* this.touchdown(1.5)
        return
      }

      case 'emland':
        this.item(21, [0, 0, 0, null, st.pos.lat, st.pos.lng, 0], REL, n.id)
        this.event('Emergency landing', 'critical', n.id)
        yield* this.touchdown(2.5)
        return

      case 'if_battery': case 'if_wind': case 'if_gps': case 'if_time': {
        const v = { battery: st.battery, wind: st.wind, sats: st.sats, elapsed: st.elapsed }[d.metric]
        const ok = compare(v, p.op, p.value)
        this.event(`${d.summary(p)}: ${ok ? 'True' : 'False'} (${Math.round(v)})`, 'normal', n.id)
        yield
        yield* this.execSeq(ok ? op.then : op.else)
        return
      }

      case 'repeat':
        for (let i = 0; i < p.count; i++) {
          this.event(`Repeat ${i + 1} of ${p.count}`, 'normal', n.id)
          yield* this.execSeq(op.body)
          this.activeNode = n.id
        }
        return

      case 'photo':
        this.item(2000, [0, 0, p.count, 0, 0, 0, 0], MISSION, n.id)
        st.photos += p.count
        this.event(`Captured ${p.count} photo${p.count > 1 ? 's' : ''}`, 'normal', n.id)
        yield* this.wait(0.5 * p.count)
        return

      case 'video_start':
        this.item(2500, [0, 0, 0, 0, 0, 0, 0], MISSION, n.id)
        st.recording = true
        this.event('Recording', 'normal', n.id)
        yield
        return

      case 'video_stop':
        this.item(2501, [0, 0, 0, 0, 0, 0, 0], MISSION, n.id)
        st.recording = false
        this.event('Recording stopped', 'normal', n.id)
        yield
        return

      case 'gimbal':
        this.item(205, [p.pitch, 0, 0, 0, 0, 0, 2], MISSION, n.id)
        st.gimbal = p.pitch
        this.event(`Gimbal pitch ${p.pitch}°`, 'normal', n.id)
        yield* this.wait(1)
        return

      case 'drop':
        if (!st.payload) { this.event('Release skipped, no payload aboard', 'warning', n.id); return }
        this.item(211, [1, 0, 0, 0, 0, 0, 0], MISSION, n.id)
        st.payload = false
        this.event('Payload released', 'normal', n.id)
        yield* this.wait(1)
        return

      case 'signal':
        this.event(`Signal: ${p.msg}`, this.mode.sev, n.id)
        yield
        return
    }
  }
}

export function compare(v, op, x) {
  return op === '>' ? v > x : op === '>=' ? v >= x : op === '<' ? v < x : v <= x
}

/** Run a whole program as fast as possible. */
export function runHeadless(program, settings, limit = 4 * 3600) {
  const sim = new Sim(program, settings)
  sim.start()
  while (!sim.outcome && sim.st.elapsed < limit) sim.tick(0.5)
  if (!sim.outcome) sim.finish('timeout', 'Still airborne after the time limit')
  return sim
}

/**
 * Worst case preview for a handler: fire it at the point of the nominal flight
 * furthest from home, and fly it out.
 */
export function contingency(program, settings, nominal, handler) {
  const far = nominal.trail.filter(p => p.alt > 1).reduce((m, p) => !m || distance(p, settings.home) > distance(m, settings.home) ? p : m, null)
  if (!far) return null
  const sim = new Sim(program, settings)
  sim.startHandler(handler, far)
  while (!sim.outcome && sim.st.elapsed - far.t < 1800) {
    sim.tick(0.5)
    if (sim.endedAirborne) break
  }
  return sim
}
