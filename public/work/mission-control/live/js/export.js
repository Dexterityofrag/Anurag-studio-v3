// Real outputs: files a ground station or a companion computer can load.
import { DEFS } from './nodes.js'
import { surveyPath } from './geo.js'

const NAV = new Set([16, 18, 19, 21, 22])
const r7 = v => v == null ? v : Math.round(v * 1e7) / 1e7

/**
 * QGroundControl .plan. A waypoint mission cannot branch, so this is the
 * nominal path: conditions resolved by the simulator on a fault free flight,
 * loops unrolled. Contingencies live in the Python script and the autopilot's
 * own failsafe parameters.
 */
export function toPlan(m, nominal) {
  const s = m.settings
  return JSON.stringify({
    fileType: 'Plan',
    version: 1,
    groundStation: 'QGroundControl',
    mission: {
      version: 2,
      firmwareType: s.firmware === 'px4' ? 12 : 3,
      vehicleType: 2,
      cruiseSpeed: s.cruise,
      hoverSpeed: 5,
      globalPlanAltitudeMode: 1,
      plannedHomePosition: [r7(s.home.lat), r7(s.home.lng), 0],
      items: nominal.items.map((it, i) => {
        const o = { type: 'SimpleItem', autoContinue: true, command: it.cmd, doJumpId: i + 1, frame: it.frame, params: it.params.map(r7) }
        if (NAV.has(it.cmd)) Object.assign(o, { AMSLAltAboveTerrain: null, Altitude: it.params[6], AltitudeMode: 1 })
        return o
      }),
    },
    geoFence: {
      version: 2,
      circles: [{ circle: { center: [r7(s.home.lat), r7(s.home.lng)], radius: s.fenceRadius }, inclusion: true, version: 1 }],
      polygons: [],
    },
    rallyPoints: { version: 2, points: [] },
  }, null, 2)
}

/** Mission Planner / ArduPilot text format. Line 0 is home. */
export function toWaypoints(m, nominal) {
  const s = m.settings
  const row = (i, frame, cmd, p) => [i, 0, frame, cmd, ...p.map(v => v == null ? 0 : r7(v)), 1].join('\t')
  const lines = ['QGC WPL 110', [0, 1, 0, 16, 0, 0, 0, 0, r7(s.home.lat), r7(s.home.lng), 0, 1].join('\t')]
  nominal.items.forEach((it, i) => lines.push(row(i + 1, it.frame, it.cmd, it.params)))
  return lines.join('\n') + '\n'
}

/* ── Python (MAVSDK) ──────────────────────────────────── */
const py = v => typeof v === 'string' ? JSON.stringify(v) : Number.isInteger(v) ? String(v) : String(+v.toFixed(7))
const OP = { '>': '>', '>=': '>=', '<': '<', '<=': '<=' }
const METRIC = { battery: 'self.battery', wind: 'self.wind', sats: 'self.sats', elapsed: 'self.elapsed' }

function stmt(op, ind, ctx) {
  const n = op.node, p = n.p, I = '    '.repeat(ind), d = DEFS[n.type]
  const c = `${I}# ${d.title}${d.summary ? ': ' + d.summary(p).replace(/[“”]/g, '"') : ''}\n`
  switch (n.type) {
    case 'takeoff': return c + `${I}await self.takeoff(${py(p.alt)})\n`
    case 'goto': return c + (p.point ? `${I}await self.fly_to(${py(p.point.lat)}, ${py(p.point.lng)}, ${py(p.alt)})\n${p.hold ? `${I}await asyncio.sleep(${py(p.hold)})\n` : ''}` : `${I}pass  # location not set\n`)
    case 'survey': {
      const path = surveyPath(p.area, p.spacing, p.angle)
      if (!path.length) return c + `${I}pass  # area not drawn\n`
      const name = `SURVEY_${++ctx.survey}`
      ctx.consts.push(`${name} = [\n${path.map(q => `    (${py(q.lat)}, ${py(q.lng)}),`).join('\n')}\n]`)
      return c + `${I}await self.survey(${name}, ${py(p.alt)}, photo_every_m=${py(p.trigger)})\n`
    }
    case 'orbit': return c + (p.center ? `${I}await self.orbit(${py(p.center.lat)}, ${py(p.center.lng)}, ${py(p.radius)}, ${py(p.turns)}, ${py(p.alt)})\n` : `${I}pass  # centre not set\n`)
    case 'hold': return c + `${I}await asyncio.sleep(${py(p.sec)})\n`
    case 'speed': return c + `${I}await self.drone.action.set_current_speed(${py(p.ms)})\n`
    case 'land': return c + `${I}await self.land()\n`
    case 'rtl': return c + `${I}await self.return_home(${py(p.alt)})\n`
    case 'emland': return c + `${I}await self.land()\n`
    case 'photo': return c + `${I}await self.photos(${py(p.count)})\n`
    case 'video_start': return c + `${I}await self.compat(self.drone.camera, "start_video")\n`
    case 'video_stop': return c + `${I}await self.compat(self.drone.camera, "stop_video")\n`
    case 'gimbal': return c + `${I}await self.compat(self.drone.gimbal, "set_pitch_and_yaw", ${py(p.pitch)}, 0.0)\n`
    case 'drop': return c + `${I}await self.compat(self.drone.gripper, "release", 1)\n`
    case 'signal': return c + `${I}log(${py(p.msg)})\n`
    case 'if_battery': case 'if_wind': case 'if_gps': case 'if_time':
      return c + `${I}if ${METRIC[d.metric]} ${OP[p.op]} ${py(p.value)}:\n${body(op.then, ind + 1, ctx)}${I}else:\n${body(op.else, ind + 1, ctx)}`
    case 'repeat':
      return c + `${I}for _ in range(${py(p.count)}):\n${body(op.body, ind + 1, ctx)}`
  }
  return ''
}

function body(seq, ind, ctx) {
  const s = seq.map(op => stmt(op, ind, ctx)).join('')
  return s || `${'    '.repeat(ind)}pass\n`
}

const TRIGGER = {
  ev_battery_low: p => `self.battery < ${py(p.pct)}`,
  ev_battery_critical: p => `self.battery < ${py(p.pct)}`,
  ev_link_lost: p => `self.link_lost_for() >= ${py(p.sec)}`,
  ev_gps_lost: p => `self.sats < ${py(p.sats)}`,
  ev_geofence: () => 'self.position is not None and distance(self.position[:2], HOME) > FENCE_RADIUS_M',
}
const RANKN = { warning: 1, critical: 2 }

export function toPython(m, prog) {
  const s = m.settings
  const ctx = { survey: 0, consts: [] }
  const main = prog.main ? body(prog.main.seq, 2, ctx) : '        pass  # no Mission Start block\n'
  const handlers = prog.handlers.filter(h => h.seq.length)
  const hdefs = handlers.map((h, i) => `    async def handler_${i}(self):\n        """${DEFS[h.node.type].title}: ${DEFS[h.node.type].summary(h.node.p)}"""\n${body(h.seq, 2, ctx)}`).join('\n')
  const trig = handlers.map((h, i) => `            ("${DEFS[h.node.type].title}", ${RANKN[h.sev]}, lambda: ${TRIGGER[h.node.type](h.node.p)}, self.handler_${i}),`).join('\n')
  const stamp = new Date().toISOString().slice(0, 16).replace('T', ' ')

  return `#!/usr/bin/env python3
"""
${m.name}
Generated by Mission Control on ${stamp} UTC.

Runs the full mission logic, branches and failsafes included, against any
MAVLink autopilot (PX4 or ArduPilot) through MAVSDK.

    pip install mavsdk
    python3 mission.py --connect udp://:14540

Fly it in SITL first. Keep the autopilot's own failsafes configured as well:
this script is a second layer, not a replacement for them.
"""

import argparse
import asyncio
import math
import time

from mavsdk import System

HOME = (${py(s.home.lat)}, ${py(s.home.lng)})
FENCE_RADIUS_M = ${py(s.fenceRadius)}
MAX_ALT_M = ${py(s.maxAlt)}
CRUISE_MS = ${py(s.cruise)}

${ctx.consts.join('\n\n')}${ctx.consts.length ? '\n\n' : ''}
def log(msg):
    print(f"[{time.strftime('%H:%M:%S')}] {msg}", flush=True)


def distance(a, b):
    """Metres between two (lat, lon) pairs."""
    r = 6371000.0
    la1, la2 = math.radians(a[0]), math.radians(b[0])
    dla, dlo = la2 - la1, math.radians(b[1] - a[1])
    h = math.sin(dla / 2) ** 2 + math.cos(la1) * math.cos(la2) * math.sin(dlo / 2) ** 2
    return 2 * r * math.asin(min(1.0, math.sqrt(h)))


def bearing(a, b):
    la1, la2 = math.radians(a[0]), math.radians(b[0])
    dlo = math.radians(b[1] - a[1])
    y = math.sin(dlo) * math.cos(la2)
    x = math.cos(la1) * math.sin(la2) - math.sin(la1) * math.cos(la2) * math.cos(dlo)
    return (math.degrees(math.atan2(y, x)) + 360) % 360


def offset(p, brg, m):
    r = 6371000.0
    d, t = m / r, math.radians(brg)
    la, lo = math.radians(p[0]), math.radians(p[1])
    la2 = math.asin(math.sin(la) * math.cos(d) + math.cos(la) * math.sin(d) * math.cos(t))
    lo2 = lo + math.atan2(math.sin(t) * math.sin(d) * math.cos(la), math.cos(d) - math.sin(la) * math.sin(la2))
    return (math.degrees(la2), math.degrees(lo2))


class Mission:
    def __init__(self, drone):
        self.drone = drone
        self.battery = 100.0
        self.sats = 0
        self.wind = 0.0  # MAVLink has no standard wind stream; feed this from your own sensor if you have one
        self.position = None  # (lat, lon, relative alt)
        self.home_amsl = 0.0
        self.connected = True
        self.lost_since = None
        self.started = time.monotonic()
        self.handling = 0
        self.fired = set()

    @property
    def elapsed(self):
        return time.monotonic() - self.started

    def link_lost_for(self):
        return 0 if self.lost_since is None else time.monotonic() - self.lost_since

    # ── telemetry ─────────────────────────────────────────
    async def watch_battery(self):
        async for b in self.drone.telemetry.battery():
            v = b.remaining_percent
            self.battery = v * 100 if v <= 1.0 else v  # MAVSDK 1.x reports 0..1, 2.x reports 0..100

    async def watch_gps(self):
        async for g in self.drone.telemetry.gps_info():
            self.sats = g.num_satellites

    async def watch_position(self):
        async for p in self.drone.telemetry.position():
            self.position = (p.latitude_deg, p.longitude_deg, p.relative_altitude_m)

    async def watch_link(self):
        async for c in self.drone.core.connection_state():
            self.connected = c.is_connected
            self.lost_since = None if c.is_connected else (self.lost_since or time.monotonic())

    # ── primitives ────────────────────────────────────────
    async def compat(self, plugin, method, *args):
        """Payload calls differ between MAVSDK versions and airframes; log rather than abort."""
        fn = getattr(plugin, method)
        try:
            await fn(*args)
        except TypeError:
            try:
                await fn(0, *args)  # MAVSDK 2.x takes a component id first
            except Exception as e:
                log(f"{method} unavailable: {e}")
        except Exception as e:
            log(f"{method} failed: {e}")

    async def until(self, cond, timeout=600):
        start = time.monotonic()
        while not cond():
            if time.monotonic() - start > timeout:
                raise TimeoutError("manoeuvre timed out")
            await asyncio.sleep(0.2)

    async def takeoff(self, alt):
        alt = min(alt, MAX_ALT_M)
        await self.drone.action.set_takeoff_altitude(alt)
        await self.drone.action.arm()
        await self.drone.action.takeoff()
        await self.until(lambda: self.position and self.position[2] > alt - 1.0)
        log(f"Airborne at {alt} m")

    async def fly_to(self, lat, lon, alt, tolerance=2.0):
        alt = min(alt, MAX_ALT_M)
        yaw = bearing(self.position[:2], (lat, lon)) if self.position else 0.0
        await self.drone.action.goto_location(lat, lon, self.home_amsl + alt, yaw)
        await self.until(lambda: self.position and distance(self.position[:2], (lat, lon)) < tolerance
                         and abs(self.position[2] - alt) < 1.5)

    async def survey(self, points, alt, photo_every_m=0):
        for i, (lat, lon) in enumerate(points):
            await self.fly_to(lat, lon, alt)
            if photo_every_m and i % 2 == 1:
                shots = max(1, int(distance(points[i - 1], points[i]) // photo_every_m))
                log(f"Line {i // 2 + 1}: {shots} photos")
                await self.photos(1)

    async def orbit(self, lat, lon, radius, turns, alt, step_deg=20):
        start = bearing((lat, lon), self.position[:2]) if self.position else 0.0
        steps = max(1, int(turns * 360 / step_deg))
        for k in range(steps + 1):
            p = offset((lat, lon), start + k * step_deg, radius)
            await self.fly_to(p[0], p[1], alt, tolerance=3.0)

    async def photos(self, n):
        for _ in range(n):
            await self.compat(self.drone.camera, "take_photo")
            await asyncio.sleep(0.5)

    async def land(self):
        await self.drone.action.land()
        async for in_air in self.drone.telemetry.in_air():
            if not in_air:
                break
        log("Landed")

    async def return_home(self, alt):
        await self.drone.action.set_return_to_launch_altitude(min(alt, MAX_ALT_M))
        await self.drone.action.return_to_launch()
        async for in_air in self.drone.telemetry.in_air():
            if not in_air:
                break
        log("Home")

    # ── the graph ─────────────────────────────────────────
    async def main(self):
${main}
${hdefs ? hdefs + '\n' : ''}    def triggers(self):
        return [
${trig || '            # no failsafe handlers in this mission'}
        ]

    async def run(self):
        task = asyncio.create_task(self.main())
        while True:
            for name, rank, cond, handler in self.triggers():
                if name in self.fired or not cond():
                    continue
                self.fired.add(name)
                if rank > self.handling:
                    log(f"EVENT {name}: preempting")
                    self.handling = rank
                    task.cancel()
                    task = asyncio.create_task(handler())
                else:
                    log(f"EVENT {name}: already handling a higher priority event")
            if task.done():
                if not task.cancelled() and task.exception():
                    raise task.exception()
                break
            await asyncio.sleep(0.2)


async def run(address):
    drone = System()
    await drone.connect(system_address=address)
    log(f"Connecting to {address}")
    async for state in drone.core.connection_state():
        if state.is_connected:
            break
    log("Waiting for a global position and home")
    async for h in drone.telemetry.health():
        if h.is_global_position_ok and h.is_home_position_ok:
            break
    mission = Mission(drone)
    async for home in drone.telemetry.home():
        mission.home_amsl = home.absolute_altitude_m
        break
    watchers = [asyncio.create_task(w()) for w in (mission.watch_battery, mission.watch_gps,
                                                   mission.watch_position, mission.watch_link)]
    try:
        await mission.run()
    finally:
        for w in watchers:
            w.cancel()
    log("Mission complete")


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description=${py(m.name)})
    ap.add_argument("--connect", default="udp://:14540", help="MAVSDK connection string")
    asyncio.run(run(ap.parse_args().connect))
`
}
