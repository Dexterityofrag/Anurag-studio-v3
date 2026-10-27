// First run: a boot screen, then a short guided briefing over the real interface.
// Returning visitors get only a brief boot and the staggered reveal.

const KEY = 'mc.onboarded.v1'
const seen = () => { try { return localStorage.getItem(KEY) === '1' } catch { return false } }
const remember = () => { try { localStorage.setItem(KEY, '1') } catch { /* ignore */ } }

const STEPS = [
  { el: '#lib', title: 'Blocks', body: 'Every block is one instruction: take off, fly to a point, survey a field, return home. Drag one onto the canvas, or click it to chain it after the selected block.' },
  { el: '#graph', title: 'Logic graph', body: 'Wire blocks left to right, the way Unreal Blueprints work. Events on the left are failsafes. When one fires it takes over from the main plan, and its wires carry its severity.' },
  { el: '#mapwrap', title: 'The map', body: 'Select a Fly To, Orbit or Survey block and click the map to place it. The white line is the flight the planner expects. Dashed lines are where each failsafe would take the aircraft.' },
  { el: '#status', title: 'Preflight checks', body: 'Checks run on every edit: altitude ceiling, geofence, battery reserve, paths that end in the air. Orange is a warning. Red means it should not fly.' },
  { el: '.modes', title: 'Simulate', body: 'Fly the mission before anything leaves the ground. Inject a cell failure, a gust, GPS loss or a dead link, and watch the failsafes respond.' },
  { el: '#btn-export', title: 'Export', body: 'Send it to QGroundControl or Mission Planner as a waypoint file, or as a Python script that carries the full logic to a real PX4 or ArduPilot aircraft.' },
]

const CHECKS = ['Satellite imagery', 'Block compiler', 'Preflight checks', 'Flight simulator', 'Exporters']

export function bootSequence(app) {
  const first = !seen()
  const boot = document.createElement('div')
  boot.className = 'boot' + (first ? ' first' : '')
  boot.innerHTML = `
    <div class="boot-inner">
      <div class="boot-mark">MISSION&nbsp;CONTROL</div>
      <p class="boot-sub">No code mission planning for drones</p>
      <ul class="boot-checks">${CHECKS.map(c => `<li><span>${c}</span><i></i><b>GO</b></li>`).join('')}</ul>
      <div class="boot-cta">
        <button class="btn solid" data-b="tour">Begin briefing</button>
        <button class="btn ghost" data-b="skip">Skip to planner</button>
      </div>
    </div>`
  document.body.append(boot)
  app.classList.add('booting')

  const reveal = () => {
    boot.classList.add('out')
    app.classList.remove('booting')
    app.classList.add('revealing')
    setTimeout(() => { boot.remove(); app.classList.remove('revealing') }, 1100)
  }

  // tick the systems check off one by one
  const items = [...boot.querySelectorAll('li')]
  const step = first ? 260 : 90
  items.forEach((li, i) => setTimeout(() => li.classList.add('go'), 300 + i * step))
  const done = 300 + items.length * step + 200

  if (!first) { setTimeout(reveal, done); return }

  setTimeout(() => boot.classList.add('ready'), done)
  boot.addEventListener('click', e => {
    const b = e.target.closest('[data-b]')?.dataset.b
    if (!b) return
    remember()
    reveal()
    if (b === 'tour') setTimeout(() => tour(), 900)
  })
}

export function tour() {
  let i = 0
  const spot = document.createElement('div')
  spot.className = 'tour-spot'
  const card = document.createElement('div')
  card.className = 'tour-card'
  card.setAttribute('role', 'dialog')
  document.body.append(spot, card)

  const close = () => { spot.remove(); card.remove(); window.removeEventListener('resize', place); window.removeEventListener('keydown', key) }
  const key = e => {
    if (e.key === 'Escape') close()
    if (e.key === 'ArrowRight' || e.key === 'Enter') go(1)
    if (e.key === 'ArrowLeft') go(-1)
  }
  const go = d => { i += d; if (i < 0) i = 0; if (i >= STEPS.length) return close(); show() }

  function place() {
    const s = STEPS[i], el = document.querySelector(s.el)
    if (!el) return
    const r = el.getBoundingClientRect(), pad = 6
    Object.assign(spot.style, { left: r.left - pad + 'px', top: r.top - pad + 'px', width: r.width + pad * 2 + 'px', height: r.height + pad * 2 + 'px' })
    const cw = Math.min(340, innerWidth - 32), ch = card.offsetHeight
    // beside the target when there is room, otherwise below or above it
    let x, y
    if (r.right + 20 + cw < innerWidth) { x = r.right + 20; y = r.top }
    else if (r.left - 20 - cw > 0) { x = r.left - 20 - cw; y = r.top }
    else { x = r.left; y = r.bottom + 20 > innerHeight - ch ? r.top - ch - 20 : r.bottom + 20 }
    card.style.left = Math.max(16, Math.min(innerWidth - cw - 16, x)) + 'px'
    card.style.top = Math.max(16, Math.min(innerHeight - ch - 16, y)) + 'px'
    card.style.width = cw + 'px'
  }

  function show() {
    const s = STEPS[i]
    document.querySelector(s.el)?.scrollIntoView({ block: 'nearest' })
    card.innerHTML = `
      <div class="tour-n">${String(i + 1).padStart(2, '0')} / ${String(STEPS.length).padStart(2, '0')}</div>
      <h3>${s.title}</h3>
      <p>${s.body}</p>
      <div class="tour-nav">
        <button class="btn ghost sm" data-t="skip">End briefing</button>
        <span></span>
        ${i ? '<button class="btn ghost sm" data-t="back">Back</button>' : ''}
        <button class="btn solid sm" data-t="next">${i === STEPS.length - 1 ? 'Start planning' : 'Next'}</button>
      </div>`
    card.classList.remove('in'); void card.offsetWidth; card.classList.add('in')
    place()
  }

  card.addEventListener('click', e => {
    const t = e.target.closest('[data-t]')?.dataset.t
    if (t === 'next') go(1)
    if (t === 'back') go(-1)
    if (t === 'skip') close()
  })
  spot.addEventListener('click', () => go(1))
  window.addEventListener('resize', place)
  window.addEventListener('keydown', key)
  show()
}
