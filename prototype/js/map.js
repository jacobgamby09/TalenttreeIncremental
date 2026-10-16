// The map: a large SVG world map with camera, nodes, edges, fog, combat at the node and reveals.
import { NODES, EDGES, CLUSTERS, ROADS, LANDMARKS, WORLD } from './data.js'
import {
  game, nodes, rank, level, xpProgress, combatPoints, activityTime, playerStats, clusterRevealed, requirementList, socketCount, dungeonOrder,
} from './game.js'
import { theme } from './theme.js'
import { T } from './text.js'

const NS = 'http://www.w3.org/2000/svg'
const el = (tag, attrs = {}, parent) => {
  const e = document.createElementNS(NS, tag)
  for (const [k, v] of Object.entries(attrs)) if (v !== undefined && v !== null) e.setAttribute(k, v)
  if (parent) parent.appendChild(e)
  return e
}
const SIZE = { activity: 64, modifier: 56, gear: 60, building: 60, slot: 56, socket: 56, extension: 56, monster: 72, stat: 56, passive: 56, unknown: 56 }
export const nodeSize = n => (n.monster?.boss ? 100 : SIZE[n.type] ?? 56)
const ZOOMED_OUT = 0.55

export const camera = { x: WORLD.start[0], y: WORLD.start[1], zoom: 0.8, flight: null }
let svg, layers, sky, skyCtx, starTile
const layerImages = new Map()
let dirty = true
let selectFn = () => {}
let selected = null
const revealQueue = []
const hiddenClusters = new Set()
let revealing = false

export function markDirty() { dirty = true }
export function setSelected(id) { selected = id; dirty = true }

// Camera
function viewport() { return { w: svg.clientWidth || window.innerWidth, h: svg.clientHeight || window.innerHeight } }
function applyCamera() {
  const { w, h } = viewport()
  const z = camera.zoom
  svg.setAttribute('viewBox', `${camera.x - w / (2 * z)} ${camera.y - h / (2 * z)} ${w / z} ${h / z}`)
  const out = z < ZOOMED_OUT
  if (out !== svg.classList.contains('zoomed-out')) { svg.classList.toggle('zoomed-out', out); dirty = true }
}
export function flyTo(x, y, zoom = camera.zoom, ms = 800) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { Object.assign(camera, { x, y, zoom, flight: null }); applyCamera(); return Promise.resolve() }
  return new Promise(resolve => { camera.flight = { from: { x: camera.x, y: camera.y, zoom: camera.zoom }, to: { x, y, zoom }, t0: performance.now(), ms, resolve } })
}
export function toScreen(x, y) {
  const { w, h } = viewport()
  return { x: (x - camera.x) * camera.zoom + w / 2, y: (y - camera.y) * camera.zoom + h / 2 }
}
export const zoomedOut = () => camera.zoom < ZOOMED_OUT

function setupInput() {
  let drag = null
  svg.addEventListener('pointerdown', e => {
    drag = { x: e.clientX, y: e.clientY, moved: 0, target: e.target.closest?.('[data-id]')?.dataset.id ?? null }
    svg.setPointerCapture(e.pointerId)
    camera.flight = null
  })
  svg.addEventListener('pointermove', e => {
    if (!drag) return
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y
    drag.moved += Math.abs(dx) + Math.abs(dy)
    drag.x = e.clientX; drag.y = e.clientY
    if (drag.moved > 4) { svg.classList.add('dragging'); camera.x -= dx / camera.zoom; camera.y -= dy / camera.zoom; clampCamera(); applyCamera() }
  })
  svg.addEventListener('pointerup', () => {
    if (drag && drag.moved <= 4) selectFn(drag.target)
    drag = null
    svg.classList.remove('dragging')
  })
  svg.addEventListener('wheel', e => {
    e.preventDefault()
    const { w, h } = viewport()
    const r = svg.getBoundingClientRect()
    const fx = camera.x + (e.clientX - r.left - w / 2) / camera.zoom
    const fy = camera.y + (e.clientY - r.top - h / 2) / camera.zoom
    const next = Math.min(1.6, Math.max(0.3, camera.zoom * Math.exp(-e.deltaY * 0.0015)))
    camera.x = fx - (fx - camera.x) * (camera.zoom / next)
    camera.y = fy - (fy - camera.y) * (camera.zoom / next)
    camera.zoom = next
    camera.flight = null
    clampCamera()
    applyCamera()
  }, { passive: false })
  window.addEventListener('resize', () => { fitSky(); applyCamera() })
}
function clampCamera() {
  camera.x = Math.min(WORLD.width, Math.max(0, camera.x))
  camera.y = Math.min(WORLD.height, Math.max(0, camera.y))
}

// Background: the theme's starfield as a tile plus a procedural layer of near stars
function fitSky() {
  const dpr = window.devicePixelRatio || 1
  sky.width = innerWidth * dpr
  sky.height = innerHeight * dpr
  skyCtx.setTransform(dpr, 0, 0, dpr, 0, 0)
}
function makeStarTile(layer) {
  const c = document.createElement('canvas')
  c.width = c.height = 1024
  const ctx = c.getContext('2d')
  let seed = 16102026
  const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296
  const count = Math.round((layer.densityPerMegapixel ?? 60) * 1.05)
  for (let i = 0; i < count; i++) {
    const x = rnd() * 1024, y = rnd() * 1024, r = 0.5 + rnd() ** 3 * 1.6
    ctx.globalAlpha = 0.35 + rnd() * 0.6
    ctx.fillStyle = layer.colors?.[Math.floor(rnd() * layer.colors.length)] ?? '#fff'
    for (const [ox, oy] of [[0, 0], [1024, 0], [-1024, 0], [0, 1024], [0, -1024]]) { ctx.beginPath(); ctx.arc(x + ox, y + oy, r, 0, Math.PI * 2); ctx.fill() }
  }
  return c
}
function drawSky() {
  const ctx = skyCtx
  const w = innerWidth, h = innerHeight
  ctx.fillStyle = theme.color('background')
  ctx.fillRect(0, 0, w, h)
  for (const l of theme.data.backgroundLayers ?? []) {
    const source = layerSource(l)
    if (!source) continue
    const tile = l.procedural ? 1024 : l.tileCssPx ?? 1024
    const s = tile * (0.6 + 0.4 * camera.zoom)
    const ox = ((-camera.x * camera.zoom * l.parallax) % s + s) % s - s
    const oy = ((-camera.y * camera.zoom * l.parallax) % s + s) % s - s
    ctx.globalAlpha = l.opacity ?? 1
    for (let x = ox; x < w; x += s) for (let y = oy; y < h; y += s) ctx.drawImage(source, x, y, s, s)
  }
  ctx.globalAlpha = 1
}

// A background layer from the theme; tintable layers are tinted once and cached
function layerSource(l) {
  if (l.procedural === 'stars') return starTile
  if (!l.asset || !theme.has(l.asset)) return null
  let e = layerImages.get(l.asset)
  if (!e) {
    const img = new Image()
    img.src = theme.url(l.asset)
    e = { img, tinted: null }
    layerImages.set(l.asset, e)
  }
  if (!e.img.complete || !e.img.naturalWidth) return null
  if (!l.color) return e.img
  if (!e.tinted) {
    const c = document.createElement('canvas')
    c.width = e.img.naturalWidth
    c.height = e.img.naturalHeight
    const cx = c.getContext('2d')
    cx.fillStyle = theme.color(l.color)
    cx.fillRect(0, 0, c.width, c.height)
    cx.globalCompositeOperation = 'destination-in'
    cx.drawImage(e.img, 0, 0)
    e.tinted = c
  }
  return e.tinted
}

// Helpers for icons and placeholders
const masks = new Set()
function glyphMask(id) {
  const mid = `mask-${id.replace('/', '-')}`
  if (!masks.has(mid)) {
    const m = el('mask', { id: mid, maskContentUnits: 'objectBoundingBox' }, layers.defs)
    el('image', { href: theme.url(id), width: 1, height: 1, preserveAspectRatio: 'xMidYMid meet' }, m)
    masks.add(mid)
  }
  return `url(#${mid})`
}
function glyph(id, x, y, s, color, parent) {
  if (!theme.has(id)) return el('circle', { cx: x + s / 2, cy: y + s / 2, r: s / 3, fill: color, opacity: 0.8 }, parent)
  return el('rect', { x, y, width: s, height: s, fill: color, mask: glyphMask(id) }, parent)
}
const initials = name => name.split(/\s+/).map(o => o[0]).join('').slice(0, 2).toUpperCase()
function icon(n, id, x, y, s, parent, { silhouette = false } = {}) {
  const color = theme.clusterColor(n.cluster)
  if (id.startsWith('glyphs/')) return glyph(id, x + s * 0.18, y + s * 0.18, s * 0.64, silhouette ? '#000' : color, parent)
  if (theme.has(id)) {
    const g = el('g', {}, parent)
    if (id.startsWith('portraits/') && !silhouette) {
      if (theme.has(theme.data.portraitBackground)) el('image', { href: theme.url(theme.data.portraitBackground), x, y, width: s, height: s, 'clip-path': `url(#clip-${Math.round(s)})` }, g)
      el('image', { href: theme.url(id), x, y, width: s, height: s, 'clip-path': `url(#clip-${Math.round(s)})` }, g)
    } else {
      const pad = id.startsWith('portraits/') ? 0 : s * 0.06
      el('image', { href: theme.url(id), x: x + pad, y: y + pad, width: s - 2 * pad, height: s - 2 * pad, filter: silhouette ? 'url(#silhouette)' : null }, g)
    }
    return g
  }
  const g = el('g', { class: 'placeholder' }, parent)
  el('rect', { x: x + 4, y: y + 4, width: s - 8, height: s - 8, rx: 6, fill: color, opacity: silhouette ? 0.12 : 0.18 }, g)
  if (!silhouette) {
    const t = el('text', { x: x + s / 2, y: y + s / 2, 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: color, class: 'placeholder-text', 'font-size': s * 0.3 }, g)
    t.textContent = initials(n.name)
  }
  return g
}
const clipSizes = new Set()
function ensureClip(s) {
  const k = Math.round(s)
  if (clipSizes.has(k)) return
  const cp = el('clipPath', { id: `clip-${k}`, clipPathUnits: 'objectBoundingBox' }, layers.defs)
  el('rect', { x: 0, y: 0, width: 1, height: 1, rx: 8 / k, ry: 8 / k }, cp)
  clipSizes.add(k)
}

// The extent of each cluster (for veils and reveals)
const clusterBox = {}
for (const n of NODES) {
  const b = (clusterBox[n.cluster] ??= { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity })
  b.x0 = Math.min(b.x0, n.pos[0]); b.y0 = Math.min(b.y0, n.pos[1]); b.x1 = Math.max(b.x1, n.pos[0]); b.y1 = Math.max(b.y1, n.pos[1])
}
export const clusterCenter = k => CLUSTERS[k].center ?? [(clusterBox[k].x0 + clusterBox[k].x1) / 2, (clusterBox[k].y0 + clusterBox[k].y1) / 2]

// Static drawing of the map (called when something has changed)
function drawStatic() {
  for (const g of Object.values(layers)) if (g !== layers.defs && g !== layers.combat && g !== layers.effects && g !== layers.reveal) g.replaceChildren()
  const status = game.status
  const vis = id => (hiddenClusters.has(nodes.get(id).cluster) ? 'hidden' : status.get(id) ?? 'hidden')
  const out = zoomedOut()

  // Veils behind the clusters
  for (const k of Object.keys(CLUSTERS)) {
    if (!clusterRevealed(k) || hiddenClusters.has(k)) continue
    const visible = NODES.filter(n => n.cluster === k && ['open', 'locked'].includes(vis(n.id)))
    if (!visible.length) continue
    const [cx, cy] = clusterCenter(k)
    const b = clusterBox[k]
    const r = Math.max(b.x1 - b.x0, b.y1 - b.y0) / 2 + 220
    const op = theme.data.clusterVeil?.opacity ?? 0.18
    if (theme.has('backgrounds/cluster-veil')) el('rect', { x: cx - r, y: cy - r, width: 2 * r, height: 2 * r, fill: theme.clusterColor(k), opacity: op, mask: glyphMask('backgrounds/cluster-veil') }, layers.veil)
    else el('circle', { cx, cy, r, fill: `url(#veil-${k})`, opacity: op * 2.2 }, layers.veil)
  }

  // Landmarks in the fog
  for (const l of LANDMARKS) {
    if (!theme.has(l.asset)) continue
    if (l.until && level(l.until.skill) >= l.until.lvl) continue
    el('rect', { x: l.pos[0] - l.size / 2, y: l.pos[1] - l.size / 2, width: l.size, height: l.size, fill: theme.color(theme.data.silhouettes?.color ?? 'silhouette'), opacity: theme.data.silhouettes?.opacity ?? 0.25, mask: glyphMask(l.asset) }, layers.landmarks)
  }

  // Roads between the clusters
  for (const [a, b] of ROADS) el('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], class: 'road' }, layers.roads)

  // Edges
  for (const [a, b] of EDGES) {
    const sa = vis(a), sb = vis(b)
    if (sa === 'hidden' || sb === 'hidden') continue
    const na = nodes.get(a), nb = nodes.get(b)
    const fog = sa === 'fog' || sb === 'fog'
    const color = theme.clusterColor(na.cluster === nb.cluster ? na.cluster : nb.cluster)
    el('line', { x1: na.pos[0], y1: na.pos[1], x2: nb.pos[0], y2: nb.pos[1], stroke: color, class: fog ? 'edge edge-fog' : 'edge' }, layers.edges)
  }

  // Fog and nodes
  for (const n of NODES) {
    const s = vis(n.id)
    if (s === 'hidden') continue
    const size = nodeSize(n)
    ensureClip(size)
    const [x, y] = n.pos
    const x0 = x - size / 2, y0 = y - size / 2
    if (s === 'fog') {
      if (theme.has(theme.data.fog?.asset)) el('circle', { cx: x, cy: y, r: size * 2.3, fill: 'url(#fog-pattern)', mask: 'url(#fog-blob)', opacity: (theme.data.fog.opacity ?? 0.85) * 0.22, class: 'fog-cloud' }, layers.fog)
      else el('circle', { cx: x, cy: y, r: size * 1.6, fill: 'url(#fog-grad)', class: 'fog-cloud' }, layers.fog)
      const g = el('g', { class: 'node node-fog', 'data-id': n.id }, layers.nodes)
      if (n.type === 'unknown') glyph('glyphs/fog', x0 + size * 0.18, y0 + size * 0.18, size * 0.64, theme.color('fog'), g).setAttribute('opacity', 0.5)
      else icon(n, n.icon, x0, y0, size, g, { silhouette: true })
      continue
    }
    const color = theme.clusterColor(n.cluster)
    const active = game.state.activity?.node === n.id || (game.state.activity?.dungeon && n.dungeon)
    const classes = ['node', `node-${s}`]
    if (active) classes.push('node-active')
    if (selected === n.id) classes.push('node-selected')
    if (n.monster?.boss && game.state.defeated[n.id]) classes.push('node-defeated')
    if (game.state.unseen.includes(n.id)) classes.push('node-new')
    const g = el('g', { class: classes.join(' '), 'data-id': n.id, style: `--accent:${color}` }, layers.nodes)
    el('rect', { x: x0 - 5, y: y0 - 5, width: size + 10, height: size + 10, rx: 12, class: 'node-glow', stroke: color }, g)
    el('rect', { x: x0, y: y0, width: size, height: size, rx: 8, class: 'node-fill', stroke: color }, g)

    // Content: slots and sockets show what is placed in them
    let content = n
    let iconId = n.icon
    if (n.type === 'slot' && game.state.equipped[n.slot]) content = nodes.get(game.state.equipped[n.slot])
    if ((n.type === 'socket' || (n.type === 'extension' && game.state.extension)) && game.state.sockets[n.socket]) content = nodes.get(game.state.sockets[n.socket])
    else if (n.type === 'extension' && game.state.extension) iconId = 'glyphs/socket-building'
    if (content !== n) iconId = content.icon
    icon(content, iconId, x0, y0, size, g)

    el('rect', { x: x0, y: y0, width: size, height: size, rx: 8, class: 'node-progress', stroke: color, pathLength: 100, 'stroke-dasharray': 100, 'stroke-dashoffset': 100, 'data-progress': n.id }, g)

    if (s === 'locked') glyph('glyphs/lock', x0 + size - 20, y0 + size - 20, 18, theme.color('text'), g)
    if (n.monster?.boss && game.state.defeated[n.id]) glyph('glyphs/defeated', x0 + size - 26, y0 + 4, 22, theme.color('text'), g)
    else if (n.monster?.boss) glyph('glyphs/boss', x0 + size - 24, y0 + 4, 20, theme.color('text'), g)
    if (n.monster?.farming && !out) glyph('glyphs/farming-area', x0 + 4, y0 + 4, 16, theme.color('text'), g)
    if (game.state.unseen.includes(n.id)) glyph('glyphs/new-discovery', x0 - 10, y0 - 10, 20, theme.color('text'), g)

    const max = n.modifier?.ranks ?? n.stat?.ranks ?? (n.passive?.ranks > 1 ? n.passive.ranks : null)
    if (max && !out) {
      const r = rank(n.id)
      const text = el('text', { x: x0 + size + 4, y: y0 + 2, class: `rank ${r >= max ? 'rank-max' : ''}`, 'dominant-baseline': 'hanging' }, g)
      text.textContent = `${r}/${max}`
    }
    if ((n.gear && game.state.crafted.includes(n.id)) || (n.building && game.state.built.includes(n.id)) || (n.type === 'passive' && n.passive.ranks === 1 && rank(n.id) > 0)) {
      el('circle', { cx: x0 + size - 6, cy: y0 + 6, r: 5, fill: color, class: 'owned-dot' }, g)
    }

    if (!out) {
      const nameY = y0 + size + (n.monster ? 27 : 15)
      const name = el('text', { x, y: nameY, class: 'node-name', 'text-anchor': 'middle' }, g)
      name.textContent = n.name
      if (s === 'locked') {
        const req = requirementList(n).find(k => (k.skill && level(k.skill) < k.lvl) || (k.boss && !game.state.defeated[k.boss]) || (k.stat && rank(k.stat) < k.points))
        if (req) {
          const rt = el('text', { x, y: nameY + 15, class: 'node-requirement', 'text-anchor': 'middle' }, g)
          rt.textContent = req.skill ? `${T.skill(req.skill)} ${T.lvl(req.lvl)}` : req.boss ? nodes.get(req.boss).name : T.requires.statShort(nodes.get(req.stat).name, req.points)
        }
      }
    }
  }

  // Headers with XP bars
  for (const [k, cl] of Object.entries(CLUSTERS)) {
    if (!clusterRevealed(k) || hiddenClusters.has(k)) continue
    if (!NODES.some(n => n.cluster === k && ['open', 'locked'].includes(vis(n.id)))) continue
    const [hx, hy] = cl.header
    const scale = out ? Math.min(2.4, 0.75 / camera.zoom) : 1
    const g = el('g', { class: 'cluster-header', transform: `translate(${hx} ${hy}) scale(${scale})` }, layers.headers)
    const color = theme.clusterColor(k)
    const e = 44
    if (theme.has(cl.emblem)) el('image', { href: theme.url(cl.emblem), x: -140, y: -e / 2, width: e, height: e }, g)
    else { el('circle', { cx: -140 + e / 2, cy: 0, r: e / 2 - 2, fill: color, opacity: 0.3, stroke: color }, g); const t = el('text', { x: -140 + e / 2, y: 1, 'text-anchor': 'middle', 'dominant-baseline': 'central', class: 'placeholder-text', fill: color }, g); t.textContent = cl.name[0] }
    const name = el('text', { x: -86, y: -4, class: 'cluster-header-name' }, g)
    name.textContent = cl.name
    const { sub, progress } = headerText(k)
    const st = el('text', { x: -86, y: 16, class: 'cluster-header-sub' }, g)
    st.textContent = sub
    let fill = null
    if (progress !== null) {
      el('rect', { x: -86, y: 24, width: 200, height: 5, rx: 2.5, class: 'xp-track' }, g)
      fill = el('rect', { x: -86, y: 24, width: Math.max(0, Math.min(1, progress)) * 200, height: 5, rx: 2.5, fill: color, class: 'xp-fill' }, g)
    }
    headerRefs.set(k, { st, fill, sub })
  }
  dirty = false
}

// Header text and XP bar update every frame, so they keep up while gathering
const headerRefs = new Map()
function headerText(k) {
  const cl = CLUSTERS[k]
  if (cl.skill) {
    const p = xpProgress(cl.skill)
    let sub = `${T.lvl(p.lvl)}   ${T.xp(Math.floor(p.have), p.needed)}`
    if (k === 'combat' && combatPoints() > 0) sub += `   ${T.combatPoints(combatPoints())}`
    return { sub, progress: p.have / p.needed }
  }
  if (k === 'home-base') return { sub: T.sockets(game.state.sockets.slice(0, socketCount()).filter(Boolean).length, socketCount()), progress: null }
  if (cl.dungeon) return { sub: game.state.defeated['tree-guardian'] ? T.info.defeated : T.monsters(dungeonOrder.length), progress: null }
  return { sub: '', progress: null }
}
function updateHeaders() {
  for (const [k, ref] of headerRefs) {
    if (!ref.st.isConnected) { headerRefs.delete(k); continue }
    const { sub, progress } = headerText(k)
    if (sub !== ref.sub) { ref.st.textContent = sub; ref.sub = sub }
    if (ref.fill && progress !== null) ref.fill.setAttribute('width', Math.max(0, Math.min(1, progress)) * 200)
  }
}

// Dynamic drawing every frame: progress, combat nodes and camera
let combatGroup = null
function drawCombat() {
  const a = game.state.activity
  if (!a?.combat) { if (combatGroup) { combatGroup.remove(); combatGroup = null } return }
  const n = nodes.get(a.node)
  const s = playerStats()
  const size = 72
  const [mx, my] = n.pos
  const px = mx + n.combatOffset[0], py = my + n.combatOffset[1]
  if (!combatGroup) {
    combatGroup = el('g', { class: 'combat-player' }, layers.combat)
    combatGroup.style.transform = `translate(${px}px, ${py}px)`
    ensureClip(size)
    const inner = el('g', { class: 'combat-inner' }, combatGroup)
    el('line', { x1: 0, y1: 0, x2: 0, y2: 0, class: 'combat-line', 'data-line': '' }, combatGroup)
    el('rect', { x: -size / 2 - 5, y: -size / 2 - 5, width: size + 10, height: size + 10, rx: 12, class: 'node-glow', stroke: theme.color('playerHp') }, inner)
    el('rect', { x: -size / 2, y: -size / 2, width: size, height: size, rx: 8, class: 'node-fill', stroke: theme.color('playerHp') }, inner)
    icon({ cluster: 'combat', name: T.you }, 'portraits/player', -size / 2, -size / 2, size, inner)
    el('rect', { x: -size / 2, y: -size / 2, width: size, height: size, rx: 8, class: 'node-progress combat-timer', stroke: theme.color('playerHp'), pathLength: 100, 'stroke-dasharray': 100, 'stroke-dashoffset': 100, 'data-player-timer': '' }, inner)
    el('rect', { x: -size / 2, y: size / 2 + 8, width: size, height: 6, rx: 3, class: 'hp-track' }, inner)
    el('rect', { x: -size / 2, y: size / 2 + 8, width: size, height: 6, rx: 3, class: 'hp-fill', fill: theme.color('playerHp'), 'data-player-hp': '' }, inner)
    const gearRow = el('g', { 'data-gear': '' }, inner)
    Object.values(game.state.equipped).filter(Boolean).forEach((id, i, all) => {
      const gs = 20
      icon(nodes.get(id), nodes.get(id).icon, -((all.length * (gs + 2)) / 2) + i * (gs + 2), size / 2 + 18, gs, gearRow)
    })
    combatGroup.monsterHp = el('g', { class: 'combat-monster' }, layers.combat)
    el('rect', { width: size, height: 6, rx: 3, class: 'hp-track', 'data-enemy-hp-track': '' }, combatGroup.monsterHp)
    el('rect', { width: size, height: 6, rx: 3, class: 'hp-fill', fill: theme.color('enemyHp'), 'data-enemy-hp': '' }, combatGroup.monsterHp)
    combatGroup.monsterTimer = el('rect', { rx: 8, class: 'node-progress combat-timer', stroke: theme.color('enemyHp'), pathLength: 100, 'stroke-dasharray': 100, 'stroke-dashoffset': 100 }, layers.combat)
  }
  combatGroup.style.transform = `translate(${px}px, ${py}px)`
  const ms = nodeSize(n)
  const line = combatGroup.querySelector('[data-line]')
  line.setAttribute('x2', mx - px + (n.combatOffset[0] < 0 ? -ms / 2 : 0))
  line.setAttribute('y2', my - py + (n.combatOffset[1] > 0 ? ms / 2 : 0))
  line.setAttribute('x1', n.combatOffset[0] < 0 ? size / 2 : 0)
  line.setAttribute('y1', n.combatOffset[1] > 0 ? -size / 2 : 0)
  combatGroup.querySelector('[data-player-timer]').setAttribute('stroke-dashoffset', 100 - Math.min(1, a.playerT / s.time) * 100)
  combatGroup.querySelector('[data-player-hp]').setAttribute('width', Math.max(0, game.state.hp / s.hp) * size)
  const mhp = combatGroup.monsterHp
  mhp.setAttribute('transform', `translate(${mx - ms / 2} ${my + ms / 2 + 6})`)
  for (const r of mhp.children) r.setAttribute('width', ms)
  mhp.querySelector('[data-enemy-hp]').setAttribute('width', a.respawn > 0 ? 0 : Math.max(0, a.enemyHp / n.monster.hp) * ms)
  const mt = combatGroup.monsterTimer
  mt.setAttribute('x', mx - ms / 2); mt.setAttribute('y', my - ms / 2); mt.setAttribute('width', ms); mt.setAttribute('height', ms)
  mt.setAttribute('stroke-dashoffset', a.respawn > 0 ? 100 : 100 - Math.min(1, a.enemyT / n.monster.time) * 100)
  mt.style.opacity = a.respawn > 0 ? 0 : 1
}

function drawProgress() {
  const a = game.state.activity
  for (const r of layers.nodes.querySelectorAll('[data-progress]')) {
    const id = r.dataset.progress
    if (a && !a.combat && a.node === id) r.setAttribute('stroke-dashoffset', 100 - Math.min(1, a.t / activityTime(id)) * 100)
    else if (r.getAttribute('stroke-dashoffset') !== '100') r.setAttribute('stroke-dashoffset', 100)
  }
}

export function popText(x, y, text, cls = '') {
  const t = el('text', { x, y, class: `pop ${cls}`, 'text-anchor': 'middle' }, layers.effects)
  t.textContent = text
  setTimeout(() => t.remove(), 1100)
}
export function nodePop(id, text, cls) {
  const n = nodes.get(id)
  if (!n) return
  popText(n.pos[0] + (Math.random() - 0.5) * 16, n.pos[1] - nodeSize(n) / 2 - 6, text, cls)
}
export function playerPop(text, cls) {
  const a = game.state.activity
  const n = a ? nodes.get(a.node) : null
  if (!n) return
  popText(n.pos[0] + n.combatOffset[0] + (Math.random() - 0.5) * 14, n.pos[1] + n.combatOffset[1] - 44, text, cls)
}
export function shake(id) {
  const g = id === 'player' ? combatGroup?.querySelector('.combat-inner') : layers.nodes.querySelector(`[data-id="${id}"]`)
  if (!g) return
  g.classList.remove('shake'); void g.getBoundingClientRect(); g.classList.add('shake')
}

// Keeps a cluster hidden on the map until its reveal runs (used after offline progress)
export function keepHidden(cluster) {
  hiddenClusters.add(cluster)
  dirty = true
}

// Reveal of a hidden cluster: the camera zooms out, a branch grows out, and the nodes unfold
export function runReveal(cluster, onShown = () => {}) {
  hiddenClusters.add(cluster)
  dirty = true
  revealQueue.push({ cluster, onShown })
  if (!revealing) nextReveal()
}
async function nextReveal() {
  if (!revealQueue.length) { revealing = false; return }
  if (document.hidden) { document.addEventListener('visibilitychange', nextReveal, { once: true }); return }
  revealing = true
  const { cluster: k, onShown } = revealQueue.shift()
  const cl = CLUSTERS[k]
  const from = nodes.get(cl.fromNode).pos
  const [cx, cy] = clusterCenter(k)
  const { w, h } = viewport()
  const zoom = Math.min(0.9, Math.max(0.35, Math.min(w / (Math.abs(cx - from[0]) + 700), h / (Math.abs(cy - from[1]) + 600))))
  svg.classList.add('revealing', `revealing-${k}`)
  await flyTo((from[0] + cx) / 2, (from[1] + cy) / 2, zoom, 1100)
  const color = theme.clusterColor(k)
  const branch = el('path', { d: `M${from[0]} ${from[1]} Q${(from[0] + cx) / 2 + 80} ${(from[1] + cy) / 2 - 60} ${cx} ${cy}`, class: 'branch', stroke: color, pathLength: 100 }, layers.reveal)
  requestAnimationFrame(() => branch.classList.add('grow'))
  await wait(1100)
  hiddenClusters.delete(k)
  drawStatic()
  for (const [i, n] of NODES.filter(n => n.cluster === k).entries()) {
    const g = layers.nodes.querySelector(`[data-id="${n.id}"]`)
    if (g) { g.style.animationDelay = `${i * 120}ms`; g.classList.add('bloom') }
  }
  onShown()
  svg.classList.remove('revealing', `revealing-${k}`)
  setTimeout(() => branch.classList.add('fade'), 1600)
  setTimeout(() => branch.remove(), 2600)
  await wait(1200)
  nextReveal()
}
const wait = ms => new Promise(r => setTimeout(r, ms))

// Setup and loop
export function setupMap({ onSelect }) {
  selectFn = onSelect
  sky = document.getElementById('sky')
  skyCtx = sky.getContext('2d')
  svg = document.getElementById('world')
  layers = { defs: el('defs', {}, svg) }
  for (const name of ['veil', 'landmarks', 'roads', 'edges', 'fog', 'reveal', 'nodes', 'combat', 'headers', 'effects']) layers[name] = el('g', { class: `layer-${name}` }, svg)

  const f = el('filter', { id: 'silhouette', x: '-20%', y: '-20%', width: '140%', height: '140%' }, layers.defs)
  el('feColorMatrix', { type: 'matrix', values: '0 0 0 0 0.02  0 0 0 0 0.03  0 0 0 0 0.08  0 0 0 0.9 0' }, f)
  el('feGaussianBlur', { stdDeviation: 1.6 }, f)
  const fg = el('radialGradient', { id: 'fog-grad' }, layers.defs)
  el('stop', { offset: '0%', 'stop-color': theme.color('fog'), 'stop-opacity': 0.1 }, fg)
  el('stop', { offset: '55%', 'stop-color': theme.color('fog'), 'stop-opacity': 0.05 }, fg)
  el('stop', { offset: '100%', 'stop-color': theme.color('fog'), 'stop-opacity': 0 }, fg)
  for (const k of Object.keys(CLUSTERS)) {
    const vg = el('radialGradient', { id: `veil-${k}` }, layers.defs)
    el('stop', { offset: '0%', 'stop-color': theme.clusterColor(k), 'stop-opacity': 0.35 }, vg)
    el('stop', { offset: '60%', 'stop-color': theme.clusterColor(k), 'stop-opacity': 0.08 }, vg)
    el('stop', { offset: '100%', 'stop-color': theme.clusterColor(k), 'stop-opacity': 0 }, vg)
  }

  const starLayer = (theme.data.backgroundLayers ?? []).find(l => l.procedural === 'stars')
  starTile = makeStarTile(starLayer ?? {})
  if (theme.has(theme.data.fog?.asset)) {
    const p = el('pattern', { id: 'fog-pattern', patternUnits: 'userSpaceOnUse', width: 1024, height: 1024 }, layers.defs)
    el('rect', { width: 1024, height: 1024, fill: theme.color(theme.data.fog.color ?? 'fog'), mask: glyphMask(theme.data.fog.asset) }, p)
    const bg = el('radialGradient', { id: 'fog-blob-grad' }, layers.defs)
    el('stop', { offset: '0%', 'stop-color': '#fff', 'stop-opacity': 1 }, bg)
    el('stop', { offset: '55%', 'stop-color': '#fff', 'stop-opacity': 0.6 }, bg)
    el('stop', { offset: '100%', 'stop-color': '#fff', 'stop-opacity': 0 }, bg)
    const blob = el('mask', { id: 'fog-blob', maskContentUnits: 'objectBoundingBox' }, layers.defs)
    el('circle', { cx: 0.5, cy: 0.5, r: 0.5, fill: 'url(#fog-blob-grad)' }, blob)
  }

  fitSky()
  setupInput()
  applyCamera()
}

export function frame(now) {
  if (camera.flight) {
    const f = camera.flight
    const k = Math.min(1, (now - f.t0) / f.ms)
    const e = k < 0.5 ? 4 * k * k * k : 1 - (-2 * k + 2) ** 3 / 2
    camera.x = f.from.x + (f.to.x - f.from.x) * e
    camera.y = f.from.y + (f.to.y - f.from.y) * e
    camera.zoom = f.from.zoom + (f.to.zoom - f.from.zoom) * e
    if (k >= 1) { camera.flight = null; f.resolve() }
    applyCamera()
  }
  if (dirty) drawStatic()
  updateHeaders()
  drawProgress()
  drawCombat()
  drawSky()
}

export const mapSvg = () => svg
export { drawStatic }
