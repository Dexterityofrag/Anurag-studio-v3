// Blueprint style node editor: DOM nodes on a pannable, zoomable layer, with
// SVG bezier wires drawn underneath.
import { DEFS, CATEGORIES } from './nodes.js'
import { store, commit, makeNode, connect, removeNodes, node as getNode } from './store.js'

const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))

export function createGraph(root, { onSelect }) {
  root.innerHTML = `
    <div class="g-layer">
      <svg class="g-wires"><g class="g-links"></g><path class="g-temp" /></svg>
      <div class="g-nodes"></div>
    </div>
    <div class="g-marquee" hidden></div>
    <div class="g-menu" hidden><input class="g-search" placeholder="Search blocks" spellcheck="false" /><div class="g-list"></div></div>
    <div class="g-hint">Right click to add · Drag from a pin to wire · Double click a wire to cut</div>
    <div class="g-zoom"><button data-z="out" aria-label="Zoom out">−</button><span class="g-zval">100%</span><button data-z="in" aria-label="Zoom in">+</button><button data-z="fit" aria-label="Fit graph">Fit</button></div>`
  const layer = root.querySelector('.g-layer')
  const svg = root.querySelector('.g-wires')
  const linksG = root.querySelector('.g-links')
  const temp = root.querySelector('.g-temp')
  const nodesEl = root.querySelector('.g-nodes')
  const marquee = root.querySelector('.g-marquee')
  const menu = root.querySelector('.g-menu')
  const search = root.querySelector('.g-search')
  const listEl = root.querySelector('.g-list')
  const zval = root.querySelector('.g-zval')

  const view = { x: 40, y: 60, k: 0.85 }
  let sel = new Set()
  let sev = new Map(), issues = new Map(), active = null, selLink = null

  /* ── coordinates ─────────────────────────────────── */
  const toGraph = (cx, cy) => {
    const r = root.getBoundingClientRect()
    return { x: (cx - r.left - view.x) / view.k, y: (cy - r.top - view.y) / view.k }
  }
  function applyView() {
    layer.style.transform = `translate(${view.x}px, ${view.y}px) scale(${view.k})`
    root.style.backgroundPosition = `${view.x}px ${view.y}px, ${view.x}px ${view.y}px`
    root.style.backgroundSize = `${24 * view.k}px ${24 * view.k}px, ${120 * view.k}px ${120 * view.k}px`
    zval.textContent = Math.round(view.k * 100) + '%'
  }
  function zoomAt(f, cx, cy) {
    const r = root.getBoundingClientRect()
    const k = Math.min(2, Math.max(0.25, view.k * f))
    const px = cx - r.left, py = cy - r.top
    view.x = px - (px - view.x) * (k / view.k)
    view.y = py - (py - view.y) * (k / view.k)
    view.k = k
    applyView()
  }

  /* ── render ──────────────────────────────────────── */
  function nodeHTML(n) {
    const d = DEFS[n.type]
    const multi = d.outs.length > 1
    const s = d.sev ? ` ev-${d.sev}` : ''
    return `<div class="node cat-${d.cat}${d.event ? ' is-event' : ''}${s}" data-id="${n.id}" style="transform:translate(${n.x}px,${n.y}px)">
      <div class="n-head">
        ${d.event ? '' : '<span class="pin pin-in" data-pin="in" title="Exec in"></span>'}
        <span class="n-cat">${d.event ? (d.sev || 'event') : CATEGORIES.find(c => c.id === d.cat).label}</span>
        ${multi ? '' : `<span class="pin pin-out" data-pin="${d.outs[0].id}" title="Exec out"></span>`}
      </div>
      <div class="n-title">${esc(d.title)}</div>
      <div class="n-sum">${esc(d.summary(n.p))}</div>
      ${multi ? `<div class="n-outs">${d.outs.map(o => `<div class="n-out"><span>${o.label}</span><span class="pin pin-out" data-pin="${o.id}"></span></div>`).join('')}</div>` : ''}
    </div>`
  }

  function render() {
    const m = store.mission
    nodesEl.innerHTML = m.nodes.map(nodeHTML).join('')
    sel = new Set([...sel].filter(id => m.nodes.some(n => n.id === id)))
    decorate()
    drawWires()
  }

  function decorate() {
    for (const el of nodesEl.children) {
      const id = el.dataset.id
      el.classList.toggle('selected', sel.has(id))
      el.classList.toggle('active', active === id)
      el.classList.toggle('iss-critical', issues.get(id) === 'critical')
      el.classList.toggle('iss-warning', issues.get(id) === 'warning')
      const linked = new Set(store.mission.links.filter(l => l.from === id).map(l => l.pin))
      el.querySelectorAll('.pin-out').forEach(p => p.classList.toggle('linked', linked.has(p.dataset.pin)))
      const pin = el.querySelector('.pin-in')
      if (pin) pin.classList.toggle('linked', store.mission.links.some(l => l.to === id))
    }
  }

  function pinPos(id, pin) {
    const el = nodesEl.querySelector(`[data-id="${id}"] .pin[data-pin="${pin}"]`)
    if (!el) return null
    const r = el.getBoundingClientRect(), lr = layer.getBoundingClientRect()
    return { x: (r.left + r.width / 2 - lr.left) / view.k, y: (r.top + r.height / 2 - lr.top) / view.k }
  }
  const curve = (a, b) => {
    const dx = Math.max(40, Math.abs(b.x - a.x) * 0.5)
    return `M${a.x},${a.y} C${a.x + dx},${a.y} ${b.x - dx},${b.y} ${b.x},${b.y}`
  }

  function drawWires() {
    let h = ''
    for (const l of store.mission.links) {
      const a = pinPos(l.from, l.pin), b = pinPos(l.to, 'in')
      if (!a || !b) continue
      const s = sev.get(l.from) || 'normal'
      const path = curve(a, b)
      h += `<g class="wire sev-${s}${selLink === l.id ? ' picked' : ''}" data-link="${l.id}"><path class="w-hit" d="${path}"/><path class="w-line" d="${path}"/></g>`
    }
    linksG.innerHTML = h
  }

  /* ── selection ───────────────────────────────────── */
  function select(ids, additive = false) {
    sel = additive ? new Set([...sel, ...ids]) : new Set(ids)
    selLink = null
    decorate(); drawWires()
    onSelect([...sel])
  }

  /* ── pointer handling ────────────────────────────── */
  let drag = null

  root.addEventListener('pointerdown', e => {
    if (e.target.closest('.g-menu, .g-zoom')) return
    closeMenu()
    const pin = e.target.closest('.pin')
    const nodeEl = e.target.closest('.node')
    const wire = e.target.closest('.wire')
    // capture only real drags, so plain clicks and double clicks still reach their targets
    queueMicrotask(() => { if (drag) root.setPointerCapture(e.pointerId) })

    if (e.button === 1 || (e.button === 0 && e.target === root && spaceDown)) {
      drag = { kind: 'pan', sx: e.clientX, sy: e.clientY, vx: view.x, vy: view.y, moved: true }
      return
    }
    if (e.button === 2) return
    if (pin && e.altKey) {
      const id = pin.closest('.node').dataset.id, p = pin.dataset.pin
      commit(m => { m.links = m.links.filter(l => p === 'in' ? l.to !== id : !(l.from === id && l.pin === p)) }, 'graph')
      return
    }
    if (pin && pin.classList.contains('pin-out')) {
      const id = pin.closest('.node').dataset.id
      drag = { kind: 'wire', from: id, pin: pin.dataset.pin, a: pinPos(id, pin.dataset.pin) }
      return
    }
    if (nodeEl) {
      const id = nodeEl.dataset.id
      if (e.shiftKey || e.metaKey || e.ctrlKey) {
        if (sel.has(id)) { sel.delete(id); select([...sel]) } else select([id], true)
      } else if (!sel.has(id)) select([id])
      const start = toGraph(e.clientX, e.clientY)
      drag = { kind: 'move', start, moved: false, orig: [...sel].map(i => { const n = getNode(i); return { id: i, x: n.x, y: n.y } }) }
      return
    }
    if (wire) {
      selLink = wire.dataset.link
      sel = new Set(); decorate(); drawWires(); onSelect([])
      return
    }
    if (e.shiftKey) {
      drag = { kind: 'marquee', a: { x: e.clientX, y: e.clientY } }
      return
    }
    drag = { kind: 'pan', sx: e.clientX, sy: e.clientY, vx: view.x, vy: view.y, moved: false }
  })

  root.addEventListener('pointermove', e => {
    if (!drag) return
    if (drag.kind === 'pan') {
      const dx = e.clientX - drag.sx, dy = e.clientY - drag.sy
      if (Math.abs(dx) + Math.abs(dy) > 3) drag.moved = true
      view.x = drag.vx + dx; view.y = drag.vy + dy
      applyView()
    } else if (drag.kind === 'move') {
      const p = toGraph(e.clientX, e.clientY)
      const dx = p.x - drag.start.x, dy = p.y - drag.start.y
      if (Math.abs(dx) + Math.abs(dy) > 2) drag.moved = true
      for (const o of drag.orig) {
        const n = getNode(o.id)
        n.x = Math.round((o.x + dx) / 8) * 8; n.y = Math.round((o.y + dy) / 8) * 8
        const el = nodesEl.querySelector(`[data-id="${o.id}"]`)
        if (el) el.style.transform = `translate(${n.x}px,${n.y}px)`
      }
      drawWires()
    } else if (drag.kind === 'wire') {
      const b = toGraph(e.clientX, e.clientY)
      temp.setAttribute('d', curve(drag.a, b))
      const over = document.elementFromPoint(e.clientX, e.clientY)?.closest('.node')
      nodesEl.querySelectorAll('.drop-ok').forEach(x => x.classList.remove('drop-ok'))
      if (over && over.dataset.id !== drag.from && !over.classList.contains('is-event')) over.classList.add('drop-ok')
    } else if (drag.kind === 'marquee') {
      const r = root.getBoundingClientRect()
      const x1 = Math.min(drag.a.x, e.clientX), y1 = Math.min(drag.a.y, e.clientY)
      const x2 = Math.max(drag.a.x, e.clientX), y2 = Math.max(drag.a.y, e.clientY)
      Object.assign(marquee.style, { left: x1 - r.left + 'px', top: y1 - r.top + 'px', width: x2 - x1 + 'px', height: y2 - y1 + 'px' })
      marquee.hidden = false
      drag.b = { x: e.clientX, y: e.clientY }
    }
  })

  root.addEventListener('pointerup', e => {
    const d = drag
    drag = null
    if (!d) return
    if (d.kind === 'pan' && !d.moved) { select([]); selLink = null; drawWires() }
    if (d.kind === 'move' && d.moved) {
      const final = d.orig.map(o => { const n = getNode(o.id); return { id: o.id, x: n.x, y: n.y } })
      for (const o of d.orig) Object.assign(getNode(o.id), { x: o.x, y: o.y })
      commit(m => final.forEach(f => Object.assign(m.nodes.find(n => n.id === f.id), { x: f.x, y: f.y })), 'graph')
    }
    if (d.kind === 'wire') {
      temp.setAttribute('d', '')
      nodesEl.querySelectorAll('.drop-ok').forEach(x => x.classList.remove('drop-ok'))
      const over = document.elementFromPoint(e.clientX, e.clientY)?.closest('.node')
      if (over && over.dataset.id !== d.from && !over.classList.contains('is-event')) {
        commit(m => connect(m, d.from, d.pin, over.dataset.id), 'graph')
      } else if (!over) {
        openMenu(e.clientX, e.clientY, { from: d.from, pin: d.pin })
      }
    }
    if (d.kind === 'marquee') {
      marquee.hidden = true
      if (d.b) {
        const a = toGraph(Math.min(d.a.x, d.b.x), Math.min(d.a.y, d.b.y))
        const b = toGraph(Math.max(d.a.x, d.b.x), Math.max(d.a.y, d.b.y))
        const ids = []
        for (const el of nodesEl.children) {
          const n = getNode(el.dataset.id)
          if (n.x < b.x && n.x + el.offsetWidth > a.x && n.y < b.y && n.y + el.offsetHeight > a.y) ids.push(n.id)
        }
        select(ids, true)
      }
    }
  })

  root.addEventListener('dblclick', e => {
    const wire = e.target.closest('.wire')
    if (wire) { const id = wire.dataset.link; commit(m => { m.links = m.links.filter(l => l.id !== id) }, 'graph') }
  })

  root.addEventListener('contextmenu', e => {
    e.preventDefault()
    if (e.target.closest('.g-menu')) return
    openMenu(e.clientX, e.clientY)
  })

  root.addEventListener('wheel', e => {
    if (e.target.closest('.g-menu')) return
    e.preventDefault()
    const pinch = e.ctrlKey || e.metaKey
    const mouseWheel = e.deltaMode === 1 || (Math.abs(e.deltaY) >= 50 && e.deltaX === 0 && Number.isInteger(e.deltaY))
    if (pinch || mouseWheel) zoomAt(Math.exp(-e.deltaY * (pinch ? 0.01 : 0.0015)), e.clientX, e.clientY)
    else { view.x -= e.deltaX; view.y -= e.deltaY; applyView() }
  }, { passive: false })

  root.querySelector('.g-zoom').addEventListener('click', e => {
    const z = e.target.closest('button')?.dataset.z
    const r = root.getBoundingClientRect()
    if (z === 'in') zoomAt(1.2, r.left + r.width / 2, r.top + r.height / 2)
    if (z === 'out') zoomAt(1 / 1.2, r.left + r.width / 2, r.top + r.height / 2)
    if (z === 'fit') frame()
  })

  let spaceDown = false
  window.addEventListener('keydown', e => { if (e.code === 'Space' && !isTyping(e)) spaceDown = true })
  window.addEventListener('keyup', e => { if (e.code === 'Space') spaceDown = false })

  /* ── drop from the library ───────────────────────── */
  root.addEventListener('dragover', e => { if (e.dataTransfer.types.includes('text/x-mc-block')) { e.preventDefault(); e.dataTransfer.dropEffect = 'copy' } })
  root.addEventListener('drop', e => {
    const type = e.dataTransfer.getData('text/x-mc-block')
    if (!type) return
    e.preventDefault()
    const p = toGraph(e.clientX, e.clientY)
    addAt(type, p.x - 100, p.y - 30)
  })

  /* ── add menu ────────────────────────────────────── */
  let menuCtx = null, menuIdx = 0
  function openMenu(cx, cy, link = null) {
    const r = root.getBoundingClientRect()
    menuCtx = { at: toGraph(cx, cy), link }
    menu.hidden = false
    menu.style.left = Math.min(cx - r.left, r.width - 260) + 'px'
    menu.style.top = Math.min(cy - r.top, r.height - 320) + 'px'
    search.value = ''
    fillMenu()
    search.focus()
  }
  function closeMenu() { menu.hidden = true; menuCtx = null }
  function menuItems() {
    const q = search.value.trim().toLowerCase()
    return Object.entries(DEFS)
      .filter(([, d]) => !(menuCtx?.link && d.event))
      .filter(([t, d]) => !q || d.title.toLowerCase().includes(q) || d.desc.toLowerCase().includes(q) || t.includes(q))
  }
  function fillMenu() {
    const items = menuItems()
    menuIdx = Math.min(menuIdx, Math.max(0, items.length - 1))
    let h = '', cat = null
    items.forEach(([t, d], i) => {
      if (d.cat !== cat) { cat = d.cat; h += `<div class="g-mcat">${CATEGORIES.find(c => c.id === cat).label}</div>` }
      h += `<button class="g-mitem${i === menuIdx ? ' on' : ''}" data-type="${t}"><b>${esc(d.title)}</b><span>${esc(d.desc)}</span></button>`
    })
    listEl.innerHTML = h || '<div class="g-mcat">No match</div>'
    listEl.querySelector('.on')?.scrollIntoView({ block: 'nearest' })
  }
  search.addEventListener('input', () => { menuIdx = 0; fillMenu() })
  search.addEventListener('keydown', e => {
    const items = menuItems()
    if (e.key === 'ArrowDown') { menuIdx = Math.min(items.length - 1, menuIdx + 1); fillMenu(); e.preventDefault() }
    if (e.key === 'ArrowUp') { menuIdx = Math.max(0, menuIdx - 1); fillMenu(); e.preventDefault() }
    if (e.key === 'Enter' && items[menuIdx]) pick(items[menuIdx][0])
    if (e.key === 'Escape') closeMenu()
    e.stopPropagation()
  })
  listEl.addEventListener('click', e => { const b = e.target.closest('.g-mitem'); if (b) pick(b.dataset.type) })
  function pick(type) {
    const c = menuCtx
    closeMenu()
    addAt(type, c.at.x - (c.link ? 0 : 100), c.at.y - 30, c.link)
  }

  function addAt(type, x, y, link = null) {
    const n = makeNode(type, Math.round(x / 8) * 8, Math.round(y / 8) * 8)
    commit(m => {
      m.nodes.push(n)
      if (link) connect(m, link.from, link.pin, n.id)
    }, 'graph')
    select([n.id])
    return n
  }

  /* ── view helpers ────────────────────────────────── */
  function frame(ids) {
    const els = [...nodesEl.children].filter(el => !ids || ids.includes(el.dataset.id))
    if (!els.length) return
    let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity
    for (const el of els) {
      const n = getNode(el.dataset.id)
      x1 = Math.min(x1, n.x); y1 = Math.min(y1, n.y)
      x2 = Math.max(x2, n.x + el.offsetWidth); y2 = Math.max(y2, n.y + el.offsetHeight)
    }
    const r = root.getBoundingClientRect(), pad = 60
    const k = Math.min(1.1, Math.max(0.25, Math.min((r.width - pad * 2) / (x2 - x1), (r.height - pad * 2) / (y2 - y1))))
    view.k = ids && ids.length === 1 ? Math.max(view.k, 0.8) : k
    view.x = r.width / 2 - ((x1 + x2) / 2) * view.k
    view.y = r.height / 2 - ((y1 + y2) / 2) * view.k
    // A big graph is better read from its start at a legible size than seen whole as a smudge.
    if (view.k < 0.6 && !(ids && ids.length === 1)) {
      view.k = 0.6
      view.x = pad - x1 * view.k
      view.y = pad - y1 * view.k
    }
    applyView()
  }

  function deleteSelection() {
    if (selLink) { const id = selLink; selLink = null; commit(m => { m.links = m.links.filter(l => l.id !== id) }, 'graph'); return true }
    if (!sel.size) return false
    const ids = [...sel]
    commit(m => removeNodes(m, ids), 'graph')
    select([])
    return true
  }

  function duplicate() {
    if (!sel.size) return
    const map = new Map()
    commit(m => {
      for (const id of sel) {
        const o = m.nodes.find(n => n.id === id)
        const c = makeNode(o.type, o.x + 32, o.y + 48, structuredClone(o.p))
        map.set(id, c.id); m.nodes.push(c)
      }
      for (const l of [...m.links]) if (map.has(l.from) && map.has(l.to)) connect(m, map.get(l.from), l.pin, map.get(l.to))
    }, 'graph')
    select([...map.values()])
  }

  new ResizeObserver(() => drawWires()).observe(root)
  applyView()

  return {
    render, select, frame, deleteSelection, duplicate, addAt, toGraph,
    get selection() { return [...sel] },
    setOverlay(o) {
      sev = o.sev ?? sev; issues = o.issues ?? issues
      if ('active' in o) active = o.active
      decorate(); drawWires()
    },
    center(id) { frame([id]) },
  }
}

export const isTyping = e => /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable
