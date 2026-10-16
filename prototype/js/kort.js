// Kortet: et stort SVG-verdenskort med kamera, noder, forbindelser, tåge, kamp ved noden og afsløringer.
import { NODER, KANTER, KLYNGER, VEJE, LANDMAERKER, VERDEN } from './data.js'
import {
  spil, noder, rank, level, xpFremdrift, kamppoint, aktivitetsTid, spillerStats, klyngeAfsloeret, kravListe, socketAntal, dungeonRaekke,
} from './spil.js'
import { tema } from './tema.js'
import { T } from './tekster.js'

const NS = 'http://www.w3.org/2000/svg'
const el = (tag, attrs = {}, forælder) => {
  const e = document.createElementNS(NS, tag)
  for (const [k, v] of Object.entries(attrs)) if (v !== undefined && v !== null) e.setAttribute(k, v)
  if (forælder) forælder.appendChild(e)
  return e
}
const STR = { aktivitet: 64, modifier: 56, gear: 60, bygning: 60, slot: 56, socket: 56, tilbygning: 56, monster: 72, stat: 56, passiv: 56, ukendt: 56 }
export const nodeStr = n => (n.monster?.boss ? 100 : STR[n.type] ?? 56)
const LANGT_UDE = 0.55

export const kamera = { x: VERDEN.start[0], y: VERDEN.start[1], zoom: 0.8, flyv: null }
let svg, lag, himmel, himmelCtx, stjerneFlise
const lagBilleder = new Map()
let snavset = true
let vaelgFn = () => {}
let valgt = null
const afsloeringsKoe = []
const skjulKlynge = new Set()
let afsloererNu = false

export function markerSnavset() { snavset = true }
export function saetValgt(id) { valgt = id; snavset = true }

// Kamera
function viewport() { return { w: svg.clientWidth || window.innerWidth, h: svg.clientHeight || window.innerHeight } }
function anvendKamera() {
  const { w, h } = viewport()
  const z = kamera.zoom
  svg.setAttribute('viewBox', `${kamera.x - w / (2 * z)} ${kamera.y - h / (2 * z)} ${w / z} ${h / z}`)
  const ude = z < LANGT_UDE
  if (ude !== svg.classList.contains('langt-ude')) { svg.classList.toggle('langt-ude', ude); snavset = true }
}
export function flyvTil(x, y, zoom = kamera.zoom, ms = 800) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) { Object.assign(kamera, { x, y, zoom, flyv: null }); anvendKamera(); return Promise.resolve() }
  return new Promise(resolve => { kamera.flyv = { fra: { x: kamera.x, y: kamera.y, zoom: kamera.zoom }, til: { x, y, zoom }, t0: performance.now(), ms, resolve } })
}
export function tilSkaerm(x, y) {
  const { w, h } = viewport()
  return { x: (x - kamera.x) * kamera.zoom + w / 2, y: (y - kamera.y) * kamera.zoom + h / 2 }
}
export const langtUde = () => kamera.zoom < LANGT_UDE

function opsaetInput() {
  let træk = null
  svg.addEventListener('pointerdown', e => {
    træk = { x: e.clientX, y: e.clientY, flyttet: 0, mål: e.target.closest?.('[data-id]')?.dataset.id ?? null }
    svg.setPointerCapture(e.pointerId)
    kamera.flyv = null
  })
  svg.addEventListener('pointermove', e => {
    if (!træk) return
    const dx = e.clientX - træk.x, dy = e.clientY - træk.y
    træk.flyttet += Math.abs(dx) + Math.abs(dy)
    træk.x = e.clientX; træk.y = e.clientY
    if (træk.flyttet > 4) { svg.classList.add('traekker'); kamera.x -= dx / kamera.zoom; kamera.y -= dy / kamera.zoom; begrænsKamera(); anvendKamera() }
  })
  svg.addEventListener('pointerup', () => {
    if (træk && træk.flyttet <= 4) vaelgFn(træk.mål)
    træk = null
    svg.classList.remove('traekker')
  })
  svg.addEventListener('wheel', e => {
    e.preventDefault()
    const { w, h } = viewport()
    const r = svg.getBoundingClientRect()
    const fx = kamera.x + (e.clientX - r.left - w / 2) / kamera.zoom
    const fy = kamera.y + (e.clientY - r.top - h / 2) / kamera.zoom
    const ny = Math.min(1.6, Math.max(0.3, kamera.zoom * Math.exp(-e.deltaY * 0.0015)))
    kamera.x = fx - (fx - kamera.x) * (kamera.zoom / ny)
    kamera.y = fy - (fy - kamera.y) * (kamera.zoom / ny)
    kamera.zoom = ny
    kamera.flyv = null
    begrænsKamera()
    anvendKamera()
  }, { passive: false })
  window.addEventListener('resize', () => { tilpasHimmel(); anvendKamera() })
}
function begrænsKamera() {
  kamera.x = Math.min(VERDEN.bredde, Math.max(0, kamera.x))
  kamera.y = Math.min(VERDEN.hoejde, Math.max(0, kamera.y))
}

// Baggrund: temaets stjernehimmel som flise plus et procedurelt lag nære stjerner
function tilpasHimmel() {
  const dpr = window.devicePixelRatio || 1
  himmel.width = innerWidth * dpr
  himmel.height = innerHeight * dpr
  himmelCtx.setTransform(dpr, 0, 0, dpr, 0, 0)
}
function lavStjerneFlise(lag) {
  const c = document.createElement('canvas')
  c.width = c.height = 1024
  const ctx = c.getContext('2d')
  let seed = 16102026
  const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296
  const antal = Math.round((lag.taethed_pr_megapixel ?? 60) * 1.05)
  for (let i = 0; i < antal; i++) {
    const x = rnd() * 1024, y = rnd() * 1024, r = 0.5 + rnd() ** 3 * 1.6
    ctx.globalAlpha = 0.35 + rnd() * 0.6
    ctx.fillStyle = lag.farver?.[Math.floor(rnd() * lag.farver.length)] ?? '#fff'
    for (const [ox, oy] of [[0, 0], [1024, 0], [-1024, 0], [0, 1024], [0, -1024]]) { ctx.beginPath(); ctx.arc(x + ox, y + oy, r, 0, Math.PI * 2); ctx.fill() }
  }
  return c
}
function tegnHimmel() {
  const ctx = himmelCtx
  const w = innerWidth, h = innerHeight
  ctx.fillStyle = tema.farve('baggrund')
  ctx.fillRect(0, 0, w, h)
  for (const l of tema.data.baggrundslag ?? []) {
    const kilde = lagKilde(l)
    if (!kilde) continue
    const flise = l.procedurelt ? 1024 : l.flise_css_px ?? 1024
    const s = flise * (0.6 + 0.4 * kamera.zoom)
    const ox = ((-kamera.x * kamera.zoom * l.parallax) % s + s) % s - s
    const oy = ((-kamera.y * kamera.zoom * l.parallax) % s + s) % s - s
    ctx.globalAlpha = l.opacitet ?? 1
    for (let x = ox; x < w; x += s) for (let y = oy; y < h; y += s) ctx.drawImage(kilde, x, y, s, s)
  }
  ctx.globalAlpha = 1
}

// Et baggrundslag fra temaet; tonbare lag farves én gang og gemmes
function lagKilde(l) {
  if (l.procedurelt === 'stjerner') return stjerneFlise
  if (!l.asset || !tema.har(l.asset)) return null
  let e = lagBilleder.get(l.asset)
  if (!e) {
    const img = new Image()
    img.src = tema.url(l.asset)
    e = { img, tonet: null }
    lagBilleder.set(l.asset, e)
  }
  if (!e.img.complete || !e.img.naturalWidth) return null
  if (!l.farve) return e.img
  if (!e.tonet) {
    const c = document.createElement('canvas')
    c.width = e.img.naturalWidth
    c.height = e.img.naturalHeight
    const cx = c.getContext('2d')
    cx.fillStyle = tema.farve(l.farve)
    cx.fillRect(0, 0, c.width, c.height)
    cx.globalCompositeOperation = 'destination-in'
    cx.drawImage(e.img, 0, 0)
    e.tonet = c
  }
  return e.tonet
}

// Hjælpere til ikoner og pladsholdere
const masker = new Set()
function glyfMaske(id) {
  const mid = `m-${id.replace('/', '-')}`
  if (!masker.has(mid)) {
    const m = el('mask', { id: mid, maskContentUnits: 'objectBoundingBox' }, lag.defs)
    el('image', { href: tema.url(id), width: 1, height: 1, preserveAspectRatio: 'xMidYMid meet' }, m)
    masker.add(mid)
  }
  return `url(#${mid})`
}
function glyf(id, x, y, s, farve, forælder) {
  if (!tema.har(id)) return el('circle', { cx: x + s / 2, cy: y + s / 2, r: s / 3, fill: farve, opacity: 0.8 }, forælder)
  return el('rect', { x, y, width: s, height: s, fill: farve, mask: glyfMaske(id) }, forælder)
}
const initialer = navn => navn.split(/\s+/).map(o => o[0]).join('').slice(0, 2).toUpperCase()
function ikon(n, id, x, y, s, forælder, { silhuet = false } = {}) {
  const farve = tema.klyngeFarve(n.klynge)
  if (id.startsWith('glyffer/')) return glyf(id, x + s * 0.18, y + s * 0.18, s * 0.64, silhuet ? '#000' : farve, forælder)
  if (tema.har(id)) {
    const g = el('g', {}, forælder)
    if (id.startsWith('portraetter/') && !silhuet) {
      if (tema.har(tema.data.portraetbaggrund)) el('image', { href: tema.url(tema.data.portraetbaggrund), x, y, width: s, height: s, 'clip-path': `url(#klip-${Math.round(s)})` }, g)
      el('image', { href: tema.url(id), x, y, width: s, height: s, 'clip-path': `url(#klip-${Math.round(s)})` }, g)
    } else {
      const pad = id.startsWith('portraetter/') ? 0 : s * 0.06
      el('image', { href: tema.url(id), x: x + pad, y: y + pad, width: s - 2 * pad, height: s - 2 * pad, filter: silhuet ? 'url(#silhuet)' : null }, g)
    }
    return g
  }
  const g = el('g', { class: 'pladsholder' }, forælder)
  el('rect', { x: x + 4, y: y + 4, width: s - 8, height: s - 8, rx: 6, fill: farve, opacity: silhuet ? 0.12 : 0.18 }, g)
  if (!silhuet) {
    const t = el('text', { x: x + s / 2, y: y + s / 2, 'text-anchor': 'middle', 'dominant-baseline': 'central', fill: farve, class: 'pladsholder-tekst', 'font-size': s * 0.3 }, g)
    t.textContent = initialer(n.navn)
  }
  return g
}
const klipStr = new Set()
function sikrKlip(s) {
  const k = Math.round(s)
  if (klipStr.has(k)) return
  const cp = el('clipPath', { id: `klip-${k}`, clipPathUnits: 'objectBoundingBox' }, lag.defs)
  el('rect', { x: 0, y: 0, width: 1, height: 1, rx: 8 / k, ry: 8 / k }, cp)
  klipStr.add(k)
}

// Klyngernes udstrækning (til slør og afsløringer)
const klyngeBoks = {}
for (const n of NODER) {
  const b = (klyngeBoks[n.klynge] ??= { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity })
  b.x0 = Math.min(b.x0, n.pos[0]); b.y0 = Math.min(b.y0, n.pos[1]); b.x1 = Math.max(b.x1, n.pos[0]); b.y1 = Math.max(b.y1, n.pos[1])
}
export const klyngeCenter = k => KLYNGER[k].center ?? [(klyngeBoks[k].x0 + klyngeBoks[k].x1) / 2, (klyngeBoks[k].y0 + klyngeBoks[k].y1) / 2]

// Statisk tegning af kortet (kaldes, når noget har ændret sig)
function tegnStatisk() {
  for (const g of Object.values(lag)) if (g !== lag.defs && g !== lag.kamp && g !== lag.effekter && g !== lag.afsloering) g.replaceChildren()
  const status = spil.status
  const vis = id => (skjulKlynge.has(noder.get(id).klynge) ? 'skjult' : status.get(id) ?? 'skjult')
  const ude = langtUde()

  // Slør bag klyngerne
  for (const k of Object.keys(KLYNGER)) {
    if (!klyngeAfsloeret(k) || skjulKlynge.has(k)) continue
    const synlige = NODER.filter(n => n.klynge === k && ['aaben', 'laast'].includes(vis(n.id)))
    if (!synlige.length) continue
    const [cx, cy] = klyngeCenter(k)
    const b = klyngeBoks[k]
    const r = Math.max(b.x1 - b.x0, b.y1 - b.y0) / 2 + 220
    const op = tema.data.klyngesloer?.opacitet ?? 0.18
    if (tema.har('baggrunde/klyngesloer')) el('rect', { x: cx - r, y: cy - r, width: 2 * r, height: 2 * r, fill: tema.klyngeFarve(k), opacity: op, mask: glyfMaske('baggrunde/klyngesloer') }, lag.sloer)
    else el('circle', { cx, cy, r, fill: `url(#sloer-${k})`, opacity: op * 2.2 }, lag.sloer)
  }

  // Landmærker i tågen
  for (const l of LANDMAERKER) {
    if (!tema.har(l.asset)) continue
    if (l.indtil && level(l.indtil.skill) >= l.indtil.lvl) continue
    el('rect', { x: l.pos[0] - l.str / 2, y: l.pos[1] - l.str / 2, width: l.str, height: l.str, fill: tema.farve(tema.data.silhuetter?.farve ?? 'silhuet'), opacity: tema.data.silhuetter?.opacitet ?? 0.25, mask: glyfMaske(l.asset) }, lag.landmaerker)
  }

  // Veje mellem klyngerne
  for (const [a, b] of VEJE) el('line', { x1: a[0], y1: a[1], x2: b[0], y2: b[1], class: 'vej' }, lag.veje)

  // Forbindelser
  for (const [a, b] of KANTER) {
    const sa = vis(a), sb = vis(b)
    if (sa === 'skjult' || sb === 'skjult') continue
    const na = noder.get(a), nb = noder.get(b)
    const taage = sa === 'taage' || sb === 'taage'
    const farve = tema.klyngeFarve(na.klynge === nb.klynge ? na.klynge : nb.klynge)
    el('line', { x1: na.pos[0], y1: na.pos[1], x2: nb.pos[0], y2: nb.pos[1], stroke: farve, class: taage ? 'kant kant-taage' : 'kant' }, lag.kanter)
  }

  // Tåge og noder
  for (const n of NODER) {
    const s = vis(n.id)
    if (s === 'skjult') continue
    const str = nodeStr(n)
    sikrKlip(str)
    const [x, y] = n.pos
    const x0 = x - str / 2, y0 = y - str / 2
    if (s === 'taage') {
      if (tema.har(tema.data.taage?.asset)) el('circle', { cx: x, cy: y, r: str * 2.3, fill: 'url(#taage-moenster)', mask: 'url(#taage-klat)', opacity: (tema.data.taage.opacitet ?? 0.85) * 0.22, class: 'taage-sky' }, lag.taage)
      else el('circle', { cx: x, cy: y, r: str * 1.6, fill: 'url(#taage-grad)', class: 'taage-sky' }, lag.taage)
      const g = el('g', { class: 'node node-taage', 'data-id': n.id }, lag.noder)
      if (n.type === 'ukendt') glyf('glyffer/taage', x0 + str * 0.18, y0 + str * 0.18, str * 0.64, tema.farve('taage'), g).setAttribute('opacity', 0.5)
      else ikon(n, n.ikon, x0, y0, str, g, { silhuet: true })
      continue
    }
    const farve = tema.klyngeFarve(n.klynge)
    const aktiv = spil.t.aktivitet?.node === n.id || (spil.t.aktivitet?.dungeon && n.dungeon)
    const klasser = ['node', `node-${s}`]
    if (aktiv) klasser.push('node-aktiv')
    if (valgt === n.id) klasser.push('node-valgt')
    if (n.monster?.boss && spil.t.besejret[n.id]) klasser.push('node-besejret')
    if (spil.t.uset.includes(n.id)) klasser.push('node-ny')
    const g = el('g', { class: klasser.join(' '), 'data-id': n.id, style: `--farve:${farve}` }, lag.noder)
    el('rect', { x: x0 - 5, y: y0 - 5, width: str + 10, height: str + 10, rx: 12, class: 'node-gloed', stroke: farve }, g)
    el('rect', { x: x0, y: y0, width: str, height: str, rx: 8, class: 'node-flade', stroke: farve }, g)

    // Indhold: slots og sockets viser det, der sidder i dem
    let indhold = n
    let ikonId = n.ikon
    if (n.type === 'slot' && spil.t.udrustet[n.slot]) indhold = noder.get(spil.t.udrustet[n.slot])
    if ((n.type === 'socket' || (n.type === 'tilbygning' && spil.t.tilbygning)) && spil.t.sockets[n.socket]) indhold = noder.get(spil.t.sockets[n.socket])
    else if (n.type === 'tilbygning' && spil.t.tilbygning) ikonId = 'glyffer/socket-bygning'
    if (indhold !== n) ikonId = indhold.ikon
    ikon(indhold, ikonId, x0, y0, str, g)

    el('rect', { x: x0, y: y0, width: str, height: str, rx: 8, class: 'node-fremdrift', stroke: farve, pathLength: 100, 'stroke-dasharray': 100, 'stroke-dashoffset': 100, 'data-fremdrift': n.id }, g)

    if (s === 'laast') glyf('glyffer/laas', x0 + str - 20, y0 + str - 20, 18, tema.farve('tekst'), g)
    if (n.monster?.boss && spil.t.besejret[n.id]) glyf('glyffer/besejret', x0 + str - 26, y0 + 4, 22, tema.farve('tekst'), g)
    else if (n.monster?.boss) glyf('glyffer/boss', x0 + str - 24, y0 + 4, 20, tema.farve('tekst'), g)
    if (n.monster?.farming && !ude) glyf('glyffer/farmingomraade', x0 + 4, y0 + 4, 16, tema.farve('tekst'), g)
    if (spil.t.uset.includes(n.id)) glyf('glyffer/ny-opdagelse', x0 - 10, y0 - 10, 20, tema.farve('tekst'), g)

    const maks = n.modifier?.ranks ?? n.stat?.ranks ?? (n.passiv?.ranks > 1 ? n.passiv.ranks : null)
    if (maks && !ude) {
      const r = rank(n.id)
      const tekst = el('text', { x: x0 + str + 4, y: y0 + 2, class: `rank ${r >= maks ? 'rank-maks' : ''}`, 'dominant-baseline': 'hanging' }, g)
      tekst.textContent = `${r}/${maks}`
    }
    if ((n.gear && spil.t.craftet.includes(n.id)) || (n.bygning && spil.t.bygget.includes(n.id)) || (n.type === 'passiv' && n.passiv.ranks === 1 && rank(n.id) > 0)) {
      el('circle', { cx: x0 + str - 6, cy: y0 + 6, r: 5, fill: farve, class: 'ejet-prik' }, g)
    }

    if (!ude) {
      const navnY = y0 + str + (n.monster ? 27 : 15)
      const navn = el('text', { x, y: navnY, class: 'node-navn', 'text-anchor': 'middle' }, g)
      navn.textContent = n.navn
      if (s === 'laast') {
        const krav = kravListe(n).find(k => (k.skill && level(k.skill) < k.lvl) || (k.boss && !spil.t.besejret[k.boss]) || (k.stat && rank(k.stat) < k.point))
        if (krav) {
          const kt = el('text', { x, y: navnY + 15, class: 'node-krav', 'text-anchor': 'middle' }, g)
          kt.textContent = krav.skill ? `${T.skill(krav.skill)} ${T.lvl(krav.lvl)}` : krav.boss ? noder.get(krav.boss).navn : `${krav.point} i ${noder.get(krav.stat).navn}`
        }
      }
    }
  }

  // Overskrifter med XP-bars
  for (const [k, kl] of Object.entries(KLYNGER)) {
    if (!klyngeAfsloeret(k) || skjulKlynge.has(k)) continue
    if (!NODER.some(n => n.klynge === k && ['aaben', 'laast'].includes(vis(n.id)))) continue
    const [hx, hy] = kl.overskrift
    const skala = ude ? Math.min(2.4, 0.75 / kamera.zoom) : 1
    const g = el('g', { class: 'overskrift', transform: `translate(${hx} ${hy}) scale(${skala})` }, lag.overskrifter)
    const farve = tema.klyngeFarve(k)
    const e = 44
    if (tema.har(kl.emblem)) el('image', { href: tema.url(kl.emblem), x: -140, y: -e / 2, width: e, height: e }, g)
    else { el('circle', { cx: -140 + e / 2, cy: 0, r: e / 2 - 2, fill: farve, opacity: 0.3, stroke: farve }, g); const t = el('text', { x: -140 + e / 2, y: 1, 'text-anchor': 'middle', 'dominant-baseline': 'central', class: 'pladsholder-tekst', fill: farve }, g); t.textContent = kl.navn[0] }
    const navn = el('text', { x: -86, y: -4, class: 'overskrift-navn' }, g)
    navn.textContent = kl.navn
    const { under, fremdrift } = overskriftTekst(k)
    const ut = el('text', { x: -86, y: 16, class: 'overskrift-under' }, g)
    ut.textContent = under
    let fyld = null
    if (fremdrift !== null) {
      el('rect', { x: -86, y: 24, width: 200, height: 5, rx: 2.5, class: 'xp-spor' }, g)
      fyld = el('rect', { x: -86, y: 24, width: Math.max(0, Math.min(1, fremdrift)) * 200, height: 5, rx: 2.5, fill: farve, class: 'xp-fyld' }, g)
    }
    overskriftRef.set(k, { ut, fyld, under })
  }
  snavset = false
}

// Overskrifternes tekst og XP-bar opdateres hver frame, så de følger med, mens man skiller
const overskriftRef = new Map()
function overskriftTekst(k) {
  const kl = KLYNGER[k]
  if (kl.skill) {
    const f = xpFremdrift(kl.skill)
    let under = `${T.lvl(f.lvl)}   ${T.xp(Math.floor(f.har), f.af)}`
    if (k === 'kamp' && kamppoint() > 0) under += `   ${T.kamppoint(kamppoint())}`
    return { under, fremdrift: f.har / f.af }
  }
  if (k === 'hjemmebase') return { under: T.sockets(spil.t.sockets.slice(0, socketAntal()).filter(Boolean).length, socketAntal()), fremdrift: null }
  if (kl.dungeon) return { under: spil.t.besejret['traeets-vogter'] ? T.info.besejret : `${dungeonRaekke.length} monstre`, fremdrift: null }
  return { under: '', fremdrift: null }
}
function opdaterOverskrifter() {
  for (const [k, ref] of overskriftRef) {
    if (!ref.ut.isConnected) { overskriftRef.delete(k); continue }
    const { under, fremdrift } = overskriftTekst(k)
    if (under !== ref.under) { ref.ut.textContent = under; ref.under = under }
    if (ref.fyld && fremdrift !== null) ref.fyld.setAttribute('width', Math.max(0, Math.min(1, fremdrift)) * 200)
  }
}

// Dynamisk tegning hver frame: fremdrift, kampnoder og kamera
let kampGruppe = null
function tegnKamp() {
  const a = spil.t.aktivitet
  if (!a?.kamp) { if (kampGruppe) { kampGruppe.remove(); kampGruppe = null } return }
  const n = noder.get(a.node)
  const s = spillerStats()
  const str = 72
  const [mx, my] = n.pos
  const px = mx + n.kampPlads[0], py = my + n.kampPlads[1]
  if (!kampGruppe) {
    kampGruppe = el('g', { class: 'kamp-spiller' }, lag.kamp)
    kampGruppe.style.transform = `translate(${px}px, ${py}px)`
    sikrKlip(str)
    const inner = el('g', { class: 'kamp-ind' }, kampGruppe)
    el('line', { x1: 0, y1: 0, x2: 0, y2: 0, class: 'kamp-linje', 'data-linje': '' }, kampGruppe)
    el('rect', { x: -str / 2 - 5, y: -str / 2 - 5, width: str + 10, height: str + 10, rx: 12, class: 'node-gloed', stroke: tema.farve('spillerHp') }, inner)
    el('rect', { x: -str / 2, y: -str / 2, width: str, height: str, rx: 8, class: 'node-flade', stroke: tema.farve('spillerHp') }, inner)
    ikon({ klynge: 'kamp', navn: 'Dig' }, 'portraetter/spiller', -str / 2, -str / 2, str, inner)
    el('rect', { x: -str / 2, y: -str / 2, width: str, height: str, rx: 8, class: 'node-fremdrift kamp-timer', stroke: tema.farve('spillerHp'), pathLength: 100, 'stroke-dasharray': 100, 'stroke-dashoffset': 100, 'data-spiller-timer': '' }, inner)
    el('rect', { x: -str / 2, y: str / 2 + 8, width: str, height: 6, rx: 3, class: 'hp-spor' }, inner)
    el('rect', { x: -str / 2, y: str / 2 + 8, width: str, height: 6, rx: 3, class: 'hp-fyld', fill: tema.farve('spillerHp'), 'data-spiller-hp': '' }, inner)
    const gearRaekke = el('g', { 'data-gear': '' }, inner)
    Object.values(spil.t.udrustet).filter(Boolean).forEach((id, i, alle) => {
      const gs = 20
      ikon(noder.get(id), noder.get(id).ikon, -((alle.length * (gs + 2)) / 2) + i * (gs + 2), str / 2 + 18, gs, gearRaekke)
    })
    kampGruppe.monsterHp = el('g', { class: 'kamp-monster' }, lag.kamp)
    el('rect', { width: str, height: 6, rx: 3, class: 'hp-spor', 'data-mhp-spor': '' }, kampGruppe.monsterHp)
    el('rect', { width: str, height: 6, rx: 3, class: 'hp-fyld', fill: tema.farve('fjendeHp'), 'data-mhp': '' }, kampGruppe.monsterHp)
    kampGruppe.monsterTimer = el('rect', { rx: 8, class: 'node-fremdrift kamp-timer', stroke: tema.farve('fjendeHp'), pathLength: 100, 'stroke-dasharray': 100, 'stroke-dashoffset': 100 }, lag.kamp)
  }
  kampGruppe.style.transform = `translate(${px}px, ${py}px)`
  const ms = nodeStr(n)
  const linje = kampGruppe.querySelector('[data-linje]')
  linje.setAttribute('x2', mx - px + (n.kampPlads[0] < 0 ? -ms / 2 : 0))
  linje.setAttribute('y2', my - py + (n.kampPlads[1] > 0 ? ms / 2 : 0))
  linje.setAttribute('x1', n.kampPlads[0] < 0 ? str / 2 : 0)
  linje.setAttribute('y1', n.kampPlads[1] > 0 ? -str / 2 : 0)
  kampGruppe.querySelector('[data-spiller-timer]').setAttribute('stroke-dashoffset', 100 - Math.min(1, a.spillerT / s.tid) * 100)
  kampGruppe.querySelector('[data-spiller-hp]').setAttribute('width', Math.max(0, spil.t.hp / s.hp) * str)
  const mhp = kampGruppe.monsterHp
  mhp.setAttribute('transform', `translate(${mx - ms / 2} ${my + ms / 2 + 6})`)
  for (const r of mhp.children) r.setAttribute('width', ms)
  mhp.querySelector('[data-mhp]').setAttribute('width', a.respawn > 0 ? 0 : Math.max(0, a.fjendeHp / n.monster.hp) * ms)
  const mt = kampGruppe.monsterTimer
  mt.setAttribute('x', mx - ms / 2); mt.setAttribute('y', my - ms / 2); mt.setAttribute('width', ms); mt.setAttribute('height', ms)
  mt.setAttribute('stroke-dashoffset', a.respawn > 0 ? 100 : 100 - Math.min(1, a.fjendeT / n.monster.tid) * 100)
  mt.style.opacity = a.respawn > 0 ? 0 : 1
}

function tegnFremdrift() {
  const a = spil.t.aktivitet
  for (const r of lag.noder.querySelectorAll('[data-fremdrift]')) {
    const id = r.dataset.fremdrift
    if (a && !a.kamp && a.node === id) r.setAttribute('stroke-dashoffset', 100 - Math.min(1, a.t / aktivitetsTid(id)) * 100)
    else if (r.getAttribute('stroke-dashoffset') !== '100') r.setAttribute('stroke-dashoffset', 100)
  }
}

export function popTekst(x, y, tekst, klasse = '') {
  const t = el('text', { x, y, class: `pop ${klasse}`, 'text-anchor': 'middle' }, lag.effekter)
  t.textContent = tekst
  setTimeout(() => t.remove(), 1100)
}
export function nodePop(id, tekst, klasse) {
  const n = noder.get(id)
  if (!n) return
  popTekst(n.pos[0] + (Math.random() - 0.5) * 16, n.pos[1] - nodeStr(n) / 2 - 6, tekst, klasse)
}
export function spillerPop(tekst, klasse) {
  const a = spil.t.aktivitet
  const n = a ? noder.get(a.node) : null
  if (!n) return
  popTekst(n.pos[0] + n.kampPlads[0] + (Math.random() - 0.5) * 14, n.pos[1] + n.kampPlads[1] - 44, tekst, klasse)
}
export function ryst(id) {
  const g = id === 'spiller' ? kampGruppe?.querySelector('.kamp-ind') : lag.noder.querySelector(`[data-id="${id}"]`)
  if (!g) return
  g.classList.remove('ryst'); void g.getBoundingClientRect(); g.classList.add('ryst')
}

// Holder en klynge skjult på kortet, indtil dens afsløring køres (bruges efter offline progress)
export function holdSkjult(klynge) {
  skjulKlynge.add(klynge)
  snavset = true
}

// Afsløring af en skjult klynge: kameraet zoomer ud, en gren vokser frem, og noderne folder sig ud
export function koerAfsloering(klynge, naarVist = () => {}) {
  skjulKlynge.add(klynge)
  snavset = true
  afsloeringsKoe.push({ klynge, naarVist })
  if (!afsloererNu) naesteAfsloering()
}
async function naesteAfsloering() {
  if (!afsloeringsKoe.length) { afsloererNu = false; return }
  if (document.hidden) { document.addEventListener('visibilitychange', naesteAfsloering, { once: true }); return }
  afsloererNu = true
  const { klynge: k, naarVist } = afsloeringsKoe.shift()
  const kl = KLYNGER[k]
  const fra = noder.get(kl.fraNode).pos
  const [cx, cy] = klyngeCenter(k)
  const { w, h } = viewport()
  const zoom = Math.min(0.9, Math.max(0.35, Math.min(w / (Math.abs(cx - fra[0]) + 700), h / (Math.abs(cy - fra[1]) + 600))))
  svg.classList.add('afsloerer', `afsloerer-${k}`)
  await flyvTil((fra[0] + cx) / 2, (fra[1] + cy) / 2, zoom, 1100)
  const farve = tema.klyngeFarve(k)
  const gren = el('path', { d: `M${fra[0]} ${fra[1]} Q${(fra[0] + cx) / 2 + 80} ${(fra[1] + cy) / 2 - 60} ${cx} ${cy}`, class: 'gren', stroke: farve, pathLength: 100 }, lag.afsloering)
  requestAnimationFrame(() => gren.classList.add('gro'))
  await vent(1100)
  skjulKlynge.delete(k)
  tegnStatisk()
  for (const [i, n] of NODER.filter(n => n.klynge === k).entries()) {
    const g = lag.noder.querySelector(`[data-id="${n.id}"]`)
    if (g) { g.style.animationDelay = `${i * 120}ms`; g.classList.add('bloom') }
  }
  naarVist()
  svg.classList.remove('afsloerer', `afsloerer-${k}`)
  setTimeout(() => gren.classList.add('fade'), 1600)
  setTimeout(() => gren.remove(), 2600)
  await vent(1200)
  naesteAfsloering()
}
const vent = ms => new Promise(r => setTimeout(r, ms))

// Opstart og løkke
export function opsaetKort({ onVaelg }) {
  vaelgFn = onVaelg
  himmel = document.getElementById('himmel')
  himmelCtx = himmel.getContext('2d')
  svg = document.getElementById('verden')
  lag = { defs: el('defs', {}, svg) }
  for (const navn of ['sloer', 'landmaerker', 'veje', 'kanter', 'taage', 'afsloering', 'noder', 'kamp', 'overskrifter', 'effekter']) lag[navn] = el('g', { class: `lag-${navn}` }, svg)

  const f = el('filter', { id: 'silhuet', x: '-20%', y: '-20%', width: '140%', height: '140%' }, lag.defs)
  el('feColorMatrix', { type: 'matrix', values: '0 0 0 0 0.02  0 0 0 0 0.03  0 0 0 0 0.08  0 0 0 0.9 0' }, f)
  el('feGaussianBlur', { stdDeviation: 1.6 }, f)
  const tg = el('radialGradient', { id: 'taage-grad' }, lag.defs)
  el('stop', { offset: '0%', 'stop-color': tema.farve('taage'), 'stop-opacity': 0.1 }, tg)
  el('stop', { offset: '55%', 'stop-color': tema.farve('taage'), 'stop-opacity': 0.05 }, tg)
  el('stop', { offset: '100%', 'stop-color': tema.farve('taage'), 'stop-opacity': 0 }, tg)
  for (const k of Object.keys(KLYNGER)) {
    const sg = el('radialGradient', { id: `sloer-${k}` }, lag.defs)
    el('stop', { offset: '0%', 'stop-color': tema.klyngeFarve(k), 'stop-opacity': 0.35 }, sg)
    el('stop', { offset: '60%', 'stop-color': tema.klyngeFarve(k), 'stop-opacity': 0.08 }, sg)
    el('stop', { offset: '100%', 'stop-color': tema.klyngeFarve(k), 'stop-opacity': 0 }, sg)
  }

  const stjerneLag = (tema.data.baggrundslag ?? []).find(l => l.procedurelt === 'stjerner')
  stjerneFlise = lavStjerneFlise(stjerneLag ?? {})
  if (tema.har(tema.data.taage?.asset)) {
    const m = el('pattern', { id: 'taage-moenster', patternUnits: 'userSpaceOnUse', width: 1024, height: 1024 }, lag.defs)
    el('rect', { width: 1024, height: 1024, fill: tema.farve(tema.data.taage.farve ?? 'taage'), mask: glyfMaske(tema.data.taage.asset) }, m)
    const kg = el('radialGradient', { id: 'taage-klat-grad' }, lag.defs)
    el('stop', { offset: '0%', 'stop-color': '#fff', 'stop-opacity': 1 }, kg)
    el('stop', { offset: '55%', 'stop-color': '#fff', 'stop-opacity': 0.6 }, kg)
    el('stop', { offset: '100%', 'stop-color': '#fff', 'stop-opacity': 0 }, kg)
    const klat = el('mask', { id: 'taage-klat', maskContentUnits: 'objectBoundingBox' }, lag.defs)
    el('circle', { cx: 0.5, cy: 0.5, r: 0.5, fill: 'url(#taage-klat-grad)' }, klat)
  }

  tilpasHimmel()
  opsaetInput()
  anvendKamera()
}

export function frame(now) {
  if (kamera.flyv) {
    const f = kamera.flyv
    const k = Math.min(1, (now - f.t0) / f.ms)
    const e = k < 0.5 ? 4 * k * k * k : 1 - (-2 * k + 2) ** 3 / 2
    kamera.x = f.fra.x + (f.til.x - f.fra.x) * e
    kamera.y = f.fra.y + (f.til.y - f.fra.y) * e
    kamera.zoom = f.fra.zoom + (f.til.zoom - f.fra.zoom) * e
    if (k >= 1) { kamera.flyv = null; f.resolve() }
    anvendKamera()
  }
  if (snavset) tegnStatisk()
  opdaterOverskrifter()
  tegnFremdrift()
  tegnKamp()
  tegnHimmel()
}

export const kortSvg = () => svg
export { tegnStatisk }
