// HUD: resources, info panel, activity bar, edge arrow, messages and developer panel.
import { RESOURCES, CLUSTERS, WORLD, OFFLINE_MAX_HOURS } from './data.js'
import {
  game, nodes, rank, level, combatPoints, canAfford, requirementList, requirementsMet, activityTime, activityXp, doubleChance,
  playerStats, estimate, startActivity, stopActivity, buyRank, craft, equip, build, placeInSocket, socketCount, dungeonOrder, dev, reset,
} from './game.js'
import { theme } from './theme.js'
import { T, num, sec, duration } from './text.js'
import { flyTo, toScreen, zoomedOut, markDirty, setSelected } from './map.js'

const $ = id => document.getElementById(id)
let selectedId = null
let infoDirty = false
let pointerOnPanel = false

// Small building blocks
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
function glyphHtml(id, color = 'var(--text)', size = 16) {
  if (!theme.has(id)) return `<span class="glyph-placeholder" style="width:${size}px;height:${size}px;background:${color}"></span>`
  return `<span class="glyph" style="width:${size}px;height:${size}px;background:${color};-webkit-mask-image:url('${theme.url(id)}');mask-image:url('${theme.url(id)}')"></span>`
}
function resourceIcon(r, size = 20) {
  const id = RESOURCES[r].icon
  if (theme.has(id)) return `<img class="res-icon" src="${theme.url(id)}" width="${size}" height="${size}" alt="">`
  return `<span class="res-placeholder" style="width:${size}px;height:${size}px;background:${RESOURCES[r].color}"></span>`
}
function nodeIconHtml(n, size = 56) {
  if (theme.has(n.icon)) {
    if (n.icon.startsWith('glyphs/')) return `<span class="info-icon glyph-box" style="width:${size}px;height:${size}px">${glyphHtml(n.icon, theme.clusterColor(n.cluster), size * 0.62)}</span>`
    const bg = n.icon.startsWith('portraits/') && theme.has(theme.data.portraitBackground) ? `background-image:url('${theme.url(theme.data.portraitBackground)}')` : ''
    return `<span class="info-icon" style="width:${size}px;height:${size}px;${bg}"><img src="${theme.url(n.icon)}" alt=""></span>`
  }
  const initials = n.name.split(/\s+/).map(o => o[0]).join('').slice(0, 2).toUpperCase()
  return `<span class="info-icon placeholder" style="width:${size}px;height:${size}px;color:${theme.clusterColor(n.cluster)}">${initials}</span>`
}
function priceHtml(price) {
  const parts = Object.entries(price ?? {})
  if (!parts.length) return `<span class="price-free">${T.info.free}</span>`
  return parts.map(([r, n]) => `<span class="price ${(game.state.resources[r] ?? 0) >= n ? '' : 'price-missing'}">${resourceIcon(r, 16)}${num(n)} ${esc(T.resource(r).toLowerCase())}</span>`).join('')
}
function requirementsHtml(list) {
  if (!list.length) return ''
  return `<ul class="requirements">${list.map(k => {
    let ok, text
    if (k.skill) { ok = level(k.skill) >= k.lvl; text = T.requires.skill(k.skill, k.lvl) }
    else if (k.boss) { ok = !!game.state.defeated[k.boss]; text = T.requires.boss(nodes.get(k.boss).name) }
    else if (k.stat) { ok = rank(k.stat) >= k.points; text = T.requires.stat(nodes.get(k.stat).name, k.points) }
    return `<li class="${ok ? 'ok' : 'missing'}">${esc(text)}</li>`
  }).join('')}</ul>`
}
const btn = (action, text, enabled = true, cls = '') => `<button class="btn ${cls}" data-action="${action}" ${enabled ? '' : 'disabled'}>${esc(text)}</button>`
const row = (label, value) => `<div class="row"><span>${esc(label)}</span><span>${value}</span></div>`
const targetNames = ids => ids.map(id => nodes.get(id).name.toLowerCase()).join(' and ')

function effectText(n) {
  const e = n.modifier?.effect ?? n.building?.effect ?? n.passive?.effect
  if (n.stat) return T.effect.stat(n.stat.effect)
  if (n.gear) return T.effect.gear(n.gear.stats)
  if (n.extension) return T.effect.extension
  if (!e) return ''
  switch (e.type) {
    case 'time': return T.effect.time(e.value, targetNames(e.targets))
    case 'double': return T.effect.double(e.value, targetNames(e.targets))
    case 'fuel': return T.effect.fuel(e.value)
    case 'speed': return T.effect.speed(e.value, e.skill)
    case 'atk': return T.effect.atk(e.value)
    case 'hpPerKill': return T.effect.hpPerKill(e.value)
    case 'xpBonus': return T.effect.xpBonus(e.value, e.skill)
    case 'thorns': return T.effect.thorns(e.value)
    case 'herbalMedicine': return T.effect.herbalMedicine(e.value, e.interval)
    case 'sustainable': return T.effect.sustainable(e.xp, e.time)
  }
  return ''
}

function statsGrid(st, color) {
  return `<div class="stats">
    <span>${glyphHtml('glyphs/atk', color)} ATK ${num(st.atk)}</span>
    <span>${glyphHtml('glyphs/hp', color)} HP ${num(st.hp)}</span>
    <span>${glyphHtml('glyphs/def', color)} DEF ${num(st.def)}</span>
    <span>${glyphHtml('glyphs/attack-time', color)} ${sec(st.time)}</span>
  </div>`
}

// The info panel
function infoContent(n) {
  const status = game.status.get(n.id)
  const color = theme.clusterColor(n.cluster)
  const locked = status === 'locked'
  const head = `<header class="info-top" style="--accent:${color}">${status === 'fog' ? `<span class="info-icon fog">${glyphHtml('glyphs/fog', color, 30)}</span>` : nodeIconHtml(n)}
    <div><div class="info-type">${esc(CLUSTERS[n.cluster].name)} · ${esc(T.types[n.type])}</div><h2>${status === 'fog' ? '…' : esc(n.name)}</h2></div>
    <button class="close" data-action="close" aria-label="${T.btn.close}">×</button></header>`

  if (status === 'fog' || n.type === 'unknown') {
    let hint = T.info.unknown
    const k = n.visibleWhen
    if (k?.kills) { const [id, count] = Object.entries(k.kills)[0]; hint = T.requires.kills(nodes.get(id).monster.plural, count, game.state.kills[id] ?? 0) }
    else if (k?.skill) hint = T.requires.visibleSkill(k.skill, k.lvl)
    return head + `<p class="info-text">${esc(hint)}</p>`
  }

  let body = ''
  if (n.activity) {
    const a = n.activity
    const active = game.state.activity?.node === n.id
    const gives = Object.keys(a.gives).map(r => `${resourceIcon(r, 16)}${esc(T.resource(r))}`).join(' ')
    const dbl = doubleChance(n.id)
    body += row(T.info.time, sec(activityTime(n.id)))
    body += row(T.info.gives, `${gives}${dbl ? ` <small>(${T.info.double(dbl)})</small>` : ''}`)
    if (a.uses) body += row(T.info.uses, priceHtml(a.uses))
    body += row(T.info.xp, `${num(activityXp(n.id), 1)} ${esc(T.skill(a.skill).toLowerCase())}`)
    body += requirementsHtml(requirementList(n))
    body += `<div class="actions">${active ? btn('stop', T.btn.stop, true, 'secondary') : btn('start', T.btn.start, !locked && requirementsMet(n) && (!a.uses || canAfford(a.uses)))}</div>`
  } else if (n.modifier || n.stat || n.passive) {
    const spec = n.modifier ?? n.stat ?? n.passive
    const r = rank(n.id)
    body += `<p class="info-text">${esc(effectText(n))}</p>`
    body += row(T.info.rankLabel, `${r}/${spec.ranks}`)
    if (r >= spec.ranks) body += `<p class="info-ok">${T.info.max}</p>`
    else if (n.stat) {
      body += requirementsHtml(n.requires ?? [])
      body += `<p class="info-text">${T.info.points(combatPoints())}</p>`
      body += `<div class="actions">${btn('buy', T.btn.spendPoint, requirementsMet(n) && combatPoints() > 0)}</div>`
    } else {
      const price = spec.price[r]
      body += row(T.info.price, priceHtml(price))
      body += requirementsHtml(requirementList(n))
      const ok = n.modifier ? requirementsMet(n) : status === 'open'
      body += `<div class="actions">${btn('buy', `${T.btn.buy} ${T.info.rank(r + 1, spec.ranks).toLowerCase()}`, ok && canAfford(price))}</div>`
    }
  } else if (n.gear) {
    const owned = game.state.crafted.includes(n.id)
    const worn = game.state.equipped[n.gear.slot] === n.id
    body += `<p class="info-text">${esc(effectText(n))} · ${esc(T.slot(n.gear.slot))}</p>`
    if (!owned) {
      body += row(T.info.price, priceHtml(n.gear.price))
      body += row(T.info.xp, `${num(n.gear.xp)} ${esc(T.skill('smithing').toLowerCase())}`)
      body += requirementsHtml(requirementList(n))
      body += `<div class="actions">${btn('craft', T.btn.craft, requirementsMet(n) && canAfford(n.gear.price))}</div>`
    } else {
      body += `<p class="info-ok">${worn ? T.info.equipped : T.info.crafted}</p>`
      body += `<div class="actions">${worn ? '' : btn('equip', T.btn.equip)}</div>`
    }
  } else if (n.type === 'slot') {
    const current = game.state.equipped[n.slot]
    const options = game.state.crafted.filter(id => nodes.get(id).gear.slot === n.slot)
    body += row(T.info.equipped, current ? esc(nodes.get(current).name) : T.info.empty)
    body += options.length
      ? `<ul class="choices">${options.map(id => `<li>${nodeIconHtml(nodes.get(id), 32)}<span>${esc(nodes.get(id).name)} <small>${esc(T.effect.gear(nodes.get(id).gear.stats))}</small></span>${id === current ? btn(`unequip:${id}`, T.btn.unequip, true, 'secondary') : btn(`wear:${id}`, T.btn.equip)}</li>`).join('')}</ul>`
      : `<p class="info-text">${T.info.noGear}</p>`
  } else if (n.type === 'socket' || (n.type === 'extension' && game.state.extension)) {
    const current = game.state.sockets[n.socket]
    body += row(T.types.socket, current ? esc(nodes.get(current).name) : T.info.vacant)
    body += game.state.built.length
      ? `<ul class="choices">${game.state.built.map(id => `<li>${nodeIconHtml(nodes.get(id), 32)}<span>${esc(nodes.get(id).name)} <small>${esc(effectText(nodes.get(id)))}</small></span>${id === current ? btn(`remove:${id}`, T.btn.remove, true, 'secondary') : btn(`place:${id}`, T.btn.place)}</li>`).join('')}</ul>`
      : `<p class="info-text">${T.info.noBuildings}</p>`
  } else if (n.type === 'extension') {
    body += `<p class="info-text">${T.effect.extension}</p>`
    body += row(T.info.price, priceHtml(n.extension.price))
    body += `<div class="actions">${btn('build', T.btn.build, canAfford(n.extension.price))}</div>`
  } else if (n.building) {
    const built = game.state.built.includes(n.id)
    body += `<p class="info-text">${esc(effectText(n))}</p>`
    if (!built) {
      body += row(T.info.price, priceHtml(n.building.price))
      body += `<div class="actions">${btn('build', T.btn.build, canAfford(n.building.price))}</div>`
    } else {
      const i = game.state.sockets.indexOf(n.id)
      body += `<p class="info-ok">${i >= 0 ? T.info.inSocket : T.info.built}</p>`
      const vacant = game.state.sockets.slice(0, socketCount()).indexOf(null)
      body += `<div class="actions">${i >= 0 ? btn(`remove:${n.id}`, T.btn.remove, true, 'secondary') : btn(`place:${n.id}`, T.btn.place, vacant >= 0)}</div>`
    }
  } else if (n.monster) {
    const m = n.monster
    const s = playerStats()
    body += statsGrid({ atk: m.atk, hp: m.hp, def: m.def, time: m.time }, theme.color('enemyHp'))
    body += row(T.info.xp, `${num(m.xp)} ${esc(T.skill('combat').toLowerCase())}`)
    if (m.drop) body += row(T.info.dropLabel, `${resourceIcon(m.drop.resource, 16)}${esc(T.info.drop(T.resource(m.drop.resource), m.drop.chance))}`)
    body += `<p class="info-text">${n.dungeon ? T.info.dungeonRun : T.info.farming}</p>`
    const est = estimate(n.dungeon ? dungeonOrder : [n.id])
    body += `<p class="estimate ${est.wins ? 'wins' : 'loses'}">${n.dungeon
      ? (est.wins ? T.info.estimateDungeonWin(est.hp) : T.info.estimateDungeonLose(nodes.get(est.losesAt).name))
      : (est.wins ? T.info.estimateWin(est.time) : T.info.estimateLose(est.time))}</p>`
    body += `<div class="your-stats"><div class="info-type">${T.info.yourStats}</div>${statsGrid(s, theme.color('playerHp'))}</div>`
    const inCombat = game.state.activity?.combat && (game.state.activity.node === n.id || (n.dungeon && game.state.activity.dungeon))
    const dead = game.state.revive > 0
    body += `<div class="actions">${inCombat ? btn('stop', T.btn.stop, true, 'secondary') : btn('start', dead ? T.bar.dead(game.state.revive) : n.dungeon ? T.btn.dungeon : T.btn.fight, status === 'open' && !dead)}</div>`
  }
  return head + `<div class="info-body">${body}</div>`
}

let lastInfo = ''
function showInfo() {
  const panel = $('info')
  if (!selectedId) { panel.hidden = true; lastInfo = ''; return }
  const n = nodes.get(selectedId)
  const html = infoContent(n)
  if (html !== lastInfo) { panel.innerHTML = html; lastInfo = html }
  panel.style.setProperty('--accent', theme.clusterColor(n.cluster))
  panel.hidden = false
}
export const updateInfo = () => { infoDirty = true }

function runAction(h) {
  const n = nodes.get(selectedId)
  const [type, arg] = h.split(':')
  let ok = true
  if (type === 'close') return select(null)
  if (type === 'start') ok = startActivity(n.id)
  if (type === 'stop') stopActivity()
  if (type === 'buy') ok = buyRank(n.id)
  if (type === 'craft') ok = craft(n.id)
  if (type === 'equip') ok = equip(n.gear.slot, n.id)
  if (type === 'wear') ok = equip(n.slot, arg)
  if (type === 'unequip') ok = equip(n.slot, null)
  if (type === 'build') ok = build(n.id)
  if (type === 'place') {
    const index = n.socket ?? game.state.sockets.slice(0, socketCount()).indexOf(null)
    ok = placeInSocket(index, arg)
  }
  if (type === 'remove') { const i = game.state.sockets.indexOf(arg); if (i >= 0) ok = placeInSocket(i, null) }
  if (!ok) showMessage(T.message.missingResources(n.name), 'warning')
  markDirty()
  showInfo()
}

export function select(id) {
  selectedId = id
  setSelected(id)
  if (id) {
    const i = game.state.unseen.indexOf(id)
    if (i >= 0) game.state.unseen.splice(i, 1)
  }
  showInfo()
}

// Resource bar and the player's HP
let lastRes = ''
function drawTop() {
  const s = playerStats()
  const res = game.state.seen.map(r => `<span class="res" title="${esc(T.resource(r))}">${resourceIcon(r)}<b>${num(Math.floor(game.state.resources[r]))}</b></span>`).join('')
  if (res !== lastRes) { $('resources').innerHTML = res; lastRes = res }
  const hp = Math.max(0, game.state.hp ?? s.hp)
  $('player-hp-fill').style.width = `${(hp / s.hp) * 100}%`
  $('player-hp-text').textContent = game.state.revive > 0 ? T.bar.dead(game.state.revive) : `HP ${num(Math.ceil(hp))} / ${num(s.hp)}`
}

// The activity bar and the arrow at the screen edge
let barKey = ''
function drawBar() {
  const a = game.state.activity
  const bar = $('activity-bar'), arrow = $('edge-arrow')
  const dead = game.state.revive > 0
  if (!a && !dead) { bar.hidden = true; arrow.hidden = true; barKey = ''; return }
  const n = a ? nodes.get(a.node) : null
  let visible = false, screen = null
  if (n) {
    const pos = a.combat ? [n.pos[0] + n.combatOffset[0] / 2, n.pos[1] + n.combatOffset[1] / 2] : n.pos
    screen = toScreen(pos[0], pos[1])
    const m = 40
    visible = screen.x > m && screen.y > m && screen.x < innerWidth - m && screen.y < innerHeight - m && !zoomedOut()
  }
  bar.hidden = visible && !dead
  if (!bar.hidden) {
    const key = `${a?.node ?? 'dead'}-${a?.combat ? 'c' : 'a'}`
    if (key !== barKey) {
      barKey = key
      if (!a) bar.innerHTML = `<div class="bar-text"><b>${T.message.died}</b><small data-bar-dead></small></div>`
      else if (a.combat) bar.innerHTML = `<div class="bar-mini">${nodeIconHtml({ ...nodes.get('rat'), icon: 'portraits/player', name: T.you }, 34)}<i class="bar-timer player"><i data-bar-player-timer></i></i><i class="bar-hp player"><i data-bar-player-hp></i></i></div>
          <div class="bar-mini" data-bar-monster>${nodeIconHtml(n, 34)}<i class="bar-timer enemy"><i data-bar-enemy-timer></i></i><i class="bar-hp enemy"><i data-bar-enemy-hp></i></i></div>
          <div class="bar-text"><b data-bar-title></b><small data-bar-sub></small></div>${btn('bar-stop', T.btn.stop, true, 'secondary small')}`
      else bar.innerHTML = `${nodeIconHtml(n, 34)}<div class="bar-text"><b>${esc(n.name)}</b><i class="bar-progress"><i data-bar-progress></i></i></div>${btn('bar-stop', T.btn.stop, true, 'secondary small')}`
      bar.style.setProperty('--accent', n ? theme.clusterColor(n.cluster) : 'var(--enemy-hp)')
    }
    if (!a) bar.querySelector('[data-bar-dead]').textContent = T.bar.dead(game.state.revive)
    else if (a.combat) {
      const s = playerStats()
      const mn = nodes.get(a.node)
      if (bar.querySelector('[data-bar-monster] img')?.getAttribute('src') !== theme.url(mn.icon) && theme.has(mn.icon)) bar.querySelector('[data-bar-monster]').firstElementChild.outerHTML = nodeIconHtml(mn, 34)
      bar.querySelector('[data-bar-player-timer]').style.width = `${Math.min(1, a.playerT / s.time) * 100}%`
      bar.querySelector('[data-bar-player-hp]').style.width = `${Math.max(0, game.state.hp / s.hp) * 100}%`
      bar.querySelector('[data-bar-enemy-timer]').style.width = `${a.respawn > 0 ? 0 : Math.min(1, a.enemyT / mn.monster.time) * 100}%`
      bar.querySelector('[data-bar-enemy-hp]').style.width = `${a.respawn > 0 ? 0 : Math.max(0, a.enemyHp / mn.monster.hp) * 100}%`
      const i = dungeonOrder.indexOf(mn.id)
      bar.querySelector('[data-bar-title]').textContent = a.dungeon ? T.bar.dungeon(mn.name, i + 1, dungeonOrder.length) : T.bar.combat(mn.name)
      bar.querySelector('[data-bar-sub]').textContent = a.respawn > 0 ? T.bar.waiting : `${T.bar.kills(a.kills)} · ${T.bar.goTo}`
    } else {
      bar.querySelector('[data-bar-progress]').style.width = `${Math.min(1, a.t / activityTime(a.node)) * 100}%`
    }
  }
  if (n && !visible && screen && !zoomedOut() && (screen.x < 0 || screen.y < 0 || screen.x > innerWidth || screen.y > innerHeight)) {
    const cx = innerWidth / 2, cy = innerHeight / 2
    const dx = screen.x - cx, dy = screen.y - cy
    const k = Math.min((innerWidth / 2 - 30) / Math.abs(dx || 1e-6), (innerHeight / 2 - (dy > 0 ? 90 : 60)) / Math.abs(dy || 1e-6))
    arrow.hidden = false
    arrow.style.transform = `translate(${cx + dx * k}px, ${cy + dy * k}px) rotate(${Math.atan2(dy, dx)}rad)`
    arrow.style.setProperty('--accent', theme.clusterColor(n.cluster))
  } else arrow.hidden = true
}
function goToActivity() {
  const a = game.state.activity
  if (!a) return
  const n = nodes.get(a.node)
  const p = a.combat ? [n.pos[0] + n.combatOffset[0] / 2, n.pos[1] + n.combatOffset[1] / 2] : n.pos
  flyTo(p[0], p[1], 0.9)
}

// Messages
export function showMessage(text, cls = '') {
  const b = document.createElement('div')
  b.className = `message ${cls}`
  b.textContent = text
  const list = $('messages')
  list.appendChild(b)
  while (list.children.length > 4) list.firstElementChild.remove()
  setTimeout(() => b.classList.add('leaving'), 3200)
  setTimeout(() => b.remove(), 3800)
}

// Summary after offline progress. onClosed is called when the player presses Continue.
export function showOffline(r, onClosed = () => {}) {
  const O = T.offline
  const chip = content => `<span class="price">${content}</span>`
  const resources = Object.entries(r.resources).sort((a, b) => b[1] - a[1])
    .map(([id, n]) => chip(`${resourceIcon(id, 16)}${n > 0 ? '+' : '−'}${num(Math.abs(n))} ${esc(T.resource(id).toLowerCase())}`))
  const levels = r.levels.map(l => chip(`${esc(T.skill(l.skill))} ${l.from} → ${l.to}`))
  const kills = Object.entries(r.kills).map(([id, n]) => {
    const node = nodes.get(id)
    return chip(`${num(n)} ${esc((n === 1 ? node.name : node.monster.plural ?? node.name).toLowerCase())}`)
  })
  const section = (title, parts) => (parts.length ? `<h3>${title}</h3><div class="offline-list">${parts.join('')}</div>` : '')
  const p = $('offline')
  p.innerHTML = `<div class="offline-panel">
    <h2 id="offline-title">${O.title}</h2>
    <p>${O.away(duration(r.seconds))}${r.capped ? ` ${O.capped(OFFLINE_MAX_HOURS)}` : ''}</p>
    <p>${O.activity(esc(nodes.get(r.activity).name))}</p>
    ${r.died ? `<p>${O.died}</p>` : r.stopped ? `<p>${O.stopped}</p>` : ''}
    ${section(O.resources, resources)}${section(O.levels, levels)}${section(O.kills, kills)}
    ${r.clusters.length ? `<p>${O.reveals(r.clusters.length)}</p>` : ''}
    <div class="actions"><button class="btn" data-offline-close>${O.continue}</button></div>
  </div>`
  p.hidden = false
  const button = p.querySelector('[data-offline-close]')
  const close = () => {
    p.hidden = true
    p.innerHTML = ''
    window.removeEventListener('keydown', onKey)
    onClosed()
  }
  const onKey = e => { if (e.key === 'Escape' || e.key === 'Enter') { e.preventDefault(); close() } }
  button.addEventListener('click', close)
  window.addEventListener('keydown', onKey)
  button.focus()
}

// Developer panel
function drawDev() {
  const p = $('dev-panel')
  p.innerHTML = `<h3>${T.dev.title}</h3>
    <div class="row"><span>${T.dev.speed}</span><span>${[1, 5, 20, 60].map(f => `<button class="btn small ${game.speed === f ? '' : 'secondary'}" data-speed="${f}">${f}×</button>`).join('')}</span></div>
    <button class="btn secondary" data-dev="resources">${T.dev.resources}</button>
    <button class="btn secondary" data-dev="levels">${T.dev.levels}</button>
    <button class="btn secondary" data-dev="reveal">${T.dev.reveal}</button>
    <button class="btn secondary" data-dev="revealAll">${T.dev.revealAll}</button>
    <button class="btn danger" data-dev="reset">${T.btn.reset}</button>
    <p class="info-text"><small>${T.dev.note}</small></p>`
}

export function setupUi() {
  document.title = T.title
  $('btn-home').textContent = T.btn.home
  $('btn-dev').textContent = T.btn.dev
  $('btn-home').addEventListener('click', () => flyTo(WORLD.start[0], WORLD.start[1], 0.8))
  $('btn-dev').addEventListener('click', () => { const p = $('dev-panel'); p.hidden = !p.hidden; if (!p.hidden) drawDev() })
  $('dev-panel').addEventListener('click', e => {
    const f = e.target.closest('[data-speed]')
    if (f) { game.speed = Number(f.dataset.speed); drawDev(); return }
    const d = e.target.closest('[data-dev]')?.dataset.dev
    if (d === 'reset') { if (confirm(T.btn.reset + '?')) { reset(); select(null); markDirty() } return }
    if (d === 'revealAll') { if (confirm(T.dev.revealAllConfirm)) { dev.revealAll(); select(null); markDirty(); flyTo(1850, 1450, 0.42) } return }
    if (d && dev[d]) { dev[d](); markDirty(); updateInfo() }
  })
  const info = $('info')
  info.addEventListener('pointerdown', () => { pointerOnPanel = true })
  window.addEventListener('pointerup', () => { pointerOnPanel = false })
  info.addEventListener('click', e => { const h = e.target.closest('[data-action]')?.dataset.action; if (h) runAction(h) })
  $('activity-bar').addEventListener('click', e => {
    if (e.target.closest('[data-action="bar-stop"]')) { stopActivity(); return }
    goToActivity()
  })
  $('edge-arrow').addEventListener('click', goToActivity)
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape') select(null)
  })
}

export function uiFrame() {
  drawTop()
  drawBar()
  if (infoDirty && !pointerOnPanel && selectedId) { infoDirty = false; showInfo() }
}
