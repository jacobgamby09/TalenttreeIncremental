// Map editor (?edit): move nodes, cluster headers, landmarks, roads and the start marker, bend edges,
// and save the layout to world.js through the dev server. The game does not run while editing.
import { NODES, EDGES, LAYOUT, edgeKey } from './data.js'
import { nodes } from './game.js'
import { svgEl as el, mapLayer, mapSvg, setEditing, onDrawn, markDirty, toWorld, camera, nodeSize, bendPoint, bendFrom } from './map.js'
import { formatWorld, validateWorld } from './world-format.js'
import { T } from './text.js'

const SNAP = 10
const history = []
let selected = new Set()
let focus = null
let drag = null
let savedState = ''
let drawnZoom = 0
let panel, statusLine

const $ = id => document.getElementById(id)
const snap = (v, free) => (free ? Math.round(v) : Math.round(v / SNAP) * SNAP)
const copy = (to, from) => { to[0] = from[0]; to[1] = from[1] }

// Undo works on snapshots. Restoring copies values into the existing arrays, because nodes and clusters hold references to them.
const snapshot = () => JSON.stringify(LAYOUT)
const unsaved = () => snapshot() !== savedState
function restore(json) {
  const w = JSON.parse(json)
  copy(LAYOUT.size, w.size)
  copy(LAYOUT.start, w.start)
  for (const [id, p] of Object.entries(w.nodes)) if (LAYOUT.nodes[id]) copy(LAYOUT.nodes[id], p)
  for (const [id, p] of Object.entries(w.headers)) if (LAYOUT.headers[id]) copy(LAYOUT.headers[id], p)
  for (const [id, l] of Object.entries(w.landmarks)) if (LAYOUT.landmarks[id]) { copy(LAYOUT.landmarks[id].pos, l.pos); LAYOUT.landmarks[id].size = l.size }
  for (const k of Object.keys(LAYOUT.bends)) delete LAYOUT.bends[k]
  Object.assign(LAYOUT.bends, w.bends)
  w.roads.forEach((r, i) => { const t = LAYOUT.roads[i]; if (t) { copy(t[0], r[0]); copy(t[1], r[1]); t[2] = r[2] } })
}
function changed() { markDirty(); drawPanel() }
function undo() {
  if (!history.length) return
  restore(history.pop())
  changed()
}

// What a pointer press grabbed, and how moving the pointer changes the layout
function grab(target, e, p) {
  const free = e.altKey
  const handle = target.dataset.handle
  if (target.dataset.id) {
    const id = target.dataset.id
    if (e.shiftKey) {
      if (selected.has(id)) selected.delete(id); else selected.add(id)
    } else if (!selected.has(id)) selected = new Set([id])
    focus = { kind: 'node', id }
    return moveGroup([...selected].map(s => LAYOUT.nodes[s]), p, free)
  }
  if (target.dataset.header) {
    const k = target.dataset.header
    focus = { kind: 'header', id: k }
    if (e.shiftKey) {
      selected = new Set(NODES.filter(n => n.cluster === k).map(n => n.id))
      return moveGroup([LAYOUT.headers[k], ...[...selected].map(s => LAYOUT.nodes[s])], p, free)
    }
    selected = new Set()
    return moveGroup([LAYOUT.headers[k]], p, free)
  }
  selected = new Set()
  if (handle === 'landmark') { focus = { kind: 'landmark', id: target.dataset.key }; return moveGroup([LAYOUT.landmarks[target.dataset.key].pos], p, free) }
  if (handle === 'start') { focus = { kind: 'start' }; return moveGroup([LAYOUT.start], p, free) }
  if (handle === 'road-end') {
    const [i, end] = target.dataset.key.split(':').map(Number)
    focus = { kind: 'road', id: i }
    return moveGroup([LAYOUT.roads[i][end]], p, free)
  }
  if (handle === 'bend') {
    const key = target.dataset.key
    const [a, b] = key.split('|')
    focus = { kind: 'edge', id: key }
    return q => {
      const bend = Math.round(bendFrom(nodes.get(a).pos, nodes.get(b).pos, q))
      if (!free && Math.abs(bend) < 8) delete LAYOUT.bends[key]
      else LAYOUT.bends[key] = bend
    }
  }
  if (handle === 'road-bend') {
    const i = Number(target.dataset.key)
    const r = LAYOUT.roads[i]
    focus = { kind: 'road', id: i }
    return q => { const bend = Math.round(bendFrom(r[0], r[1], q)); r[2] = !free && Math.abs(bend) < 8 ? 0 : bend }
  }
  return null
}
// One point snaps to the grid; several points move by a snapped distance, so their spacing is kept
function moveGroup(points, p0, free) {
  const starts = points.map(pt => [...pt])
  return q => {
    if (points.length === 1) { points[0][0] = snap(starts[0][0] + q[0] - p0[0], free); points[0][1] = snap(starts[0][1] + q[1] - p0[1], free); return }
    const dx = snap(q[0] - p0[0], free), dy = snap(q[1] - p0[1], free)
    points.forEach((pt, i) => { pt[0] = starts[i][0] + dx; pt[1] = starts[i][1] + dy })
  }
}

function setupInput() {
  const svg = mapSvg()
  // Capture phase, so a grabbed item never reaches the map's own panning
  svg.addEventListener('pointerdown', e => {
    const target = e.target.closest?.('[data-handle], [data-header], [data-id]')
    if (!target) { if (!e.shiftKey && (selected.size || focus)) { selected = new Set(); focus = null; markDirty(); drawPanel() } return }
    e.stopPropagation()
    e.preventDefault()
    const before = snapshot()
    const move = grab(target, e, toWorld(e.clientX, e.clientY))
    drag = { move, before, id: e.pointerId }
    svg.setPointerCapture(e.pointerId)
    markDirty()
    drawPanel()
  }, true)
  svg.addEventListener('pointermove', e => {
    if (!drag?.move || e.pointerId !== drag.id) return
    e.stopPropagation()
    drag.move(toWorld(e.clientX, e.clientY))
    markDirty()
    drawPanel()
  }, true)
  const end = e => {
    if (!drag || e.pointerId !== drag.id) return
    e.stopPropagation()
    if (snapshot() !== drag.before) { history.push(drag.before); if (history.length > 200) history.shift(); changed() }
    drag = null
  }
  svg.addEventListener('pointerup', end, true)
  svg.addEventListener('pointercancel', end, true)

  window.addEventListener('keydown', e => {
    if (e.target.closest?.('input, textarea')) return
    const ctrl = e.ctrlKey || e.metaKey
    if (ctrl && e.key.toLowerCase() === 'z') { e.preventDefault(); undo(); return }
    if (ctrl && e.key.toLowerCase() === 's') { e.preventDefault(); saveLayout(); return }
    if (e.key === 'Escape') { selected = new Set(); focus = null; markDirty(); drawPanel(); return }
    const step = e.shiftKey ? 10 : 1
    const arrows = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }
    if (arrows[e.key]) {
      const points = focusedPoints()
      if (!points.length) return
      e.preventDefault()
      history.push(snapshot())
      for (const pt of points) { pt[0] += arrows[e.key][0]; pt[1] += arrows[e.key][1] }
      changed()
      return
    }
    if ((e.key === '+' || e.key === '-') && focus?.kind === 'landmark') {
      history.push(snapshot())
      const l = LAYOUT.landmarks[focus.id]
      l.size = Math.max(40, l.size + (e.key === '+' ? 20 : -20))
      changed()
    }
  })
  window.addEventListener('beforeunload', e => { if (unsaved()) { e.preventDefault(); e.returnValue = '' } })
}
function focusedPoints() {
  if (selected.size) return [...selected].map(id => LAYOUT.nodes[id])
  if (focus?.kind === 'header') return [LAYOUT.headers[focus.id]]
  if (focus?.kind === 'landmark') return [LAYOUT.landmarks[focus.id].pos]
  if (focus?.kind === 'start') return [LAYOUT.start]
  return []
}

// Handles drawn on top of the map after every static draw. Their size follows the zoom, so they stay easy to grab.
function drawHandles() {
  const g = mapLayer('editor')
  g.replaceChildren()
  drawnZoom = camera.zoom
  const r = 6 / camera.zoom
  el('rect', { x: 0, y: 0, width: LAYOUT.size[0], height: LAYOUT.size[1], class: 'ed-bounds' }, g)

  for (const [i, road] of LAYOUT.roads.entries()) {
    road.slice(0, 2).forEach((pt, end) => el('circle', { cx: pt[0], cy: pt[1], r, class: 'ed-handle ed-road', 'data-handle': 'road-end', 'data-key': `${i}:${end}` }, g))
    const m = bendPoint(road[0], road[1], road[2] ?? 0)
    el('circle', { cx: m[0], cy: m[1], r: r * 0.8, class: `ed-handle ed-bend ${road[2] ? 'ed-bent' : ''}`, 'data-handle': 'road-bend', 'data-key': i }, g)
  }
  for (const [id, l] of Object.entries(LAYOUT.landmarks)) {
    const focused = focus?.kind === 'landmark' && focus.id === id
    el('rect', { x: l.pos[0] - l.size / 2, y: l.pos[1] - l.size / 2, width: l.size, height: l.size, class: `ed-landmark ${focused ? 'ed-focus' : ''}` }, g)
    el('rect', { x: l.pos[0] - r * 1.4, y: l.pos[1] - r * 1.4, width: r * 2.8, height: r * 2.8, class: 'ed-handle ed-landmark-handle', 'data-handle': 'landmark', 'data-key': id }, g)
    const t = el('text', { x: l.pos[0], y: l.pos[1] + r * 4, class: 'ed-label', 'text-anchor': 'middle', 'font-size': 12 / camera.zoom }, g)
    t.textContent = id
  }
  for (const [a, b] of EDGES) {
    const key = edgeKey(a, b)
    const m = bendPoint(nodes.get(a).pos, nodes.get(b).pos, LAYOUT.bends[key] ?? 0)
    el('circle', { cx: m[0], cy: m[1], r: r * 0.8, class: `ed-handle ed-bend ${LAYOUT.bends[key] ? 'ed-bent' : ''}`, 'data-handle': 'bend', 'data-key': key }, g)
  }
  for (const id of selected) {
    const n = nodes.get(id)
    const s = nodeSize(n) + 14
    el('rect', { x: n.pos[0] - s / 2, y: n.pos[1] - s / 2, width: s, height: s, rx: 12, class: 'ed-selected' }, g)
  }
  const [sx, sy] = LAYOUT.start
  el('path', { d: `M${sx} ${sy - r * 2.2}L${sx + r * 2.2} ${sy}L${sx} ${sy + r * 2.2}L${sx - r * 2.2} ${sy}Z`, class: `ed-handle ed-start ${focus?.kind === 'start' ? 'ed-focus' : ''}`, 'data-handle': 'start' }, g)
  const t = el('text', { x: sx, y: sy - r * 3, class: 'ed-label', 'text-anchor': 'middle', 'font-size': 12 / camera.zoom }, g)
  t.textContent = T.editor.start
}

// The panel in the corner: status, what is selected, buttons and a short guide
function describeFocus() {
  if (selected.size > 1) return T.editor.selectedMany(selected.size)
  if (!focus) return T.editor.nothing
  const at = p => `${Math.round(p[0])}, ${Math.round(p[1])}`
  if (focus.kind === 'node') return `${nodes.get(focus.id).name} · ${at(LAYOUT.nodes[focus.id])}`
  if (focus.kind === 'header') return `${T.editor.header} ${focus.id} · ${at(LAYOUT.headers[focus.id])}`
  if (focus.kind === 'landmark') { const l = LAYOUT.landmarks[focus.id]; return `${focus.id} · ${at(l.pos)} · ${T.editor.size} ${l.size}` }
  if (focus.kind === 'start') return `${T.editor.start} · ${at(LAYOUT.start)}`
  if (focus.kind === 'edge') return `${focus.id.replace('|', ' – ')} · ${T.editor.bend} ${LAYOUT.bends[focus.id] ?? 0}`
  if (focus.kind === 'road') return `${T.editor.road} ${focus.id + 1} · ${T.editor.bend} ${LAYOUT.roads[focus.id][2] ?? 0}`
  return ''
}
function drawPanel() {
  panel.querySelector('[data-focus]').textContent = describeFocus()
  if (!statusLine.dataset.sticky || unsaved()) setStatus(unsaved() ? T.editor.unsaved : T.editor.ready)
  panel.querySelector('[data-editor="undo"]').disabled = !history.length
}
function setStatus(text, cls = '') {
  statusLine.textContent = text
  statusLine.className = `editor-status ${cls}`
  delete statusLine.dataset.sticky
}

async function saveLayout() {
  const problem = validateWorld(LAYOUT)
  if (problem) { setStatus(T.editor.invalid(problem), 'warning'); return }
  setStatus(T.editor.saving)
  const sent = snapshot()
  try {
    const r = await fetch('/api/world', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(LAYOUT) })
    if (r.status === 404 || r.status === 405) { download(); savedState = sent; setStatus(T.editor.downloaded); statusLine.dataset.sticky = '1'; return }
    if (!r.ok) throw new Error((await r.text()) || r.statusText)
    savedState = sent
    setStatus(T.editor.saved, 'ok')
  } catch (err) {
    setStatus(T.editor.failed(err.message), 'warning')
  }
  statusLine.dataset.sticky = '1'
}
// Without the dev server the layout is downloaded, so it can be copied into prototype/js/world.js by hand
function download() {
  const url = URL.createObjectURL(new Blob([formatWorld(LAYOUT)], { type: 'text/javascript' }))
  const a = document.createElement('a')
  a.href = url
  a.download = 'world.js'
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
function exitEditor() {
  if (unsaved() && !confirm(T.editor.leaveUnsaved)) return
  savedState = snapshot()
  const params = new URLSearchParams(location.search)
  params.delete('edit')
  location.search = params.toString()
}

export function setupEditor() {
  document.body.classList.add('editing')
  setEditing(true)
  onDrawn(drawHandles)
  panel = $('editor-panel')
  panel.hidden = false
  panel.innerHTML = `<h3>${T.editor.title}</h3>
    <p class="editor-status" data-status></p>
    <p class="editor-focus" data-focus></p>
    <div class="actions">
      <button class="btn" data-editor="save">${T.editor.save}</button>
      <button class="btn secondary" data-editor="undo">${T.editor.undo}</button>
      <button class="btn secondary" data-editor="exit">${T.editor.exit}</button>
    </div>
    <ul class="editor-help">${T.editor.help.map(h => `<li>${h}</li>`).join('')}</ul>`
  statusLine = panel.querySelector('[data-status]')
  savedState = snapshot()
  setStatus(T.editor.ready)
  panel.addEventListener('click', e => {
    const a = e.target.closest('[data-editor]')?.dataset.editor
    if (a === 'save') saveLayout()
    if (a === 'undo') undo()
    if (a === 'exit') exitEditor()
  })
  setupInput()
  drawPanel()
}

// Called every frame: handles are redrawn when the zoom has changed enough to make them too small or too big
export function editorFrame() {
  if (drawnZoom && Math.abs(camera.zoom / drawnZoom - 1) > 0.08) markDirty()
}
