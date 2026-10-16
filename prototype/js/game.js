// The game engine: state, activities, combat, requirements, visibility and purchases.
import {
  NODES, EDGES, CLUSTERS, SKILLS, RESOURCES, SLOTS, PLAYER_BASE, REVIVE_SEC, RESPAWN_SEC, START_NODES, xpToNext,
  OFFLINE_MAX_HOURS,
} from './data.js'
import * as legacy from './legacy-ids.js'

export const SAVE_VERSION = 3

const DEFAULT_KEY = 'talenttree-prototype'
// Demo names from before version 3, for finding a demo's legacy save
const LEGACY_DEMOS = { all: 'alt' }
let saveKey = DEFAULT_KEY
let demo = null

// A demo load uses its own save, so the normal game is not overwritten. null switches back.
export function useDemo(name) {
  demo = name ?? null
  saveKey = demo ? `${DEFAULT_KEY}-${demo}` : DEFAULT_KEY
}
const legacyKey = () => (demo ? `${legacy.LEGACY_SAVE_KEY}-${LEGACY_DEMOS[demo] ?? demo}` : legacy.LEGACY_SAVE_KEY)

export const nodes = new Map(NODES.map(n => [n.id, n]))
export const neighbors = new Map(NODES.map(n => [n.id, []]))
for (const [a, b] of EDGES) { neighbors.get(a).push(b); neighbors.get(b).push(a) }
export const dungeonOrder = NODES.filter(n => n.dungeon).sort((a, b) => a.dungeon.index - b.dungeon.index).map(n => n.id)

function newState() {
  return {
    version: SAVE_VERSION,
    playTime: 0,
    offlineTime: 0,
    savedAt: null,
    milestones: {},
    resources: Object.fromEntries(Object.keys(RESOURCES).map(r => [r, 0])),
    seen: [],
    xp: Object.fromEntries(Object.keys(SKILLS).map(s => [s, 0])),
    ranks: {},
    crafted: [],
    equipped: Object.fromEntries(Object.keys(SLOTS).map(s => [s, null])),
    built: [],
    sockets: [null, null, null],
    extension: false,
    kills: {},
    counters: { oakFelled: 0 },
    defeated: {},
    revealed: {},
    discovered: [],
    unseen: [],
    hp: null,
    revive: 0,
    activity: null,
  }
}

export const game = {
  state: newState(),
  speed: 1,
  status: new Map(),
  listeners: new Map(),
  on(type, fn) { (this.listeners.get(type) ?? this.listeners.set(type, []).get(type)).push(fn) },
  // During offline progress the events are recorded instead of being sent to the UI
  recording: null,
  emit(type, data) {
    if (this.recording) { this.recording.push({ type, data }); return }
    for (const fn of this.listeners.get(type) ?? []) fn(data)
  },
}

// Milestones with play time, for the balance simulator and playtests
export const MILESTONES = [
  { id: 'first-gear', name: 'First gear crafted', ok: s => s.crafted.length > 0 },
  { id: 'goblin', name: 'First goblin defeated', ok: s => (s.kills.goblin ?? 0) > 0 },
  { id: 'willow', name: 'Willow unlocked (woodcutting lvl 8)', ok: () => level('woodcutting') >= 8 },
  { id: 'iron-ore', name: 'Iron ore unlocked (mining lvl 8)', ok: () => level('mining') >= 8 },
  { id: 'iron-bar', name: 'First iron bar', ok: s => s.seen.includes('iron-bar') },
  { id: 'wolf', name: 'First wolf defeated', ok: s => (s.kills.wolf ?? 0) > 0 },
  { id: 'iron-chestplate', name: 'Iron chestplate crafted', ok: s => s.crafted.includes('iron-chestplate') },
  { id: 'dungeon', name: 'Dungeon visible (woodcutting lvl 12)', ok: () => level('woodcutting') >= 12 },
  { id: 'boss', name: 'Tree Guardian defeated', ok: s => !!s.defeated['tree-guardian'] },
  { id: 'forestry', name: 'Forestry revealed', ok: s => !!s.revealed.forestry },
  { id: 'ash', name: 'Ash unlocked', ok: s => level('woodcutting') >= 15 && !!s.defeated['tree-guardian'] },
]
function checkMilestones() {
  const s = game.state
  for (const m of MILESTONES) {
    if (s.milestones[m.id] === undefined && m.ok(s)) {
      s.milestones[m.id] = Math.round(s.playTime)
      game.emit('milestone', { id: m.id, time: s.playTime })
    }
  }
}

// Level and XP
const xpForLevel = lvl => { let sum = 0; for (let l = 1; l < lvl; l++) sum += xpToNext(l); return sum }
export function level(skill) {
  const xp = game.state.xp[skill] ?? 0
  let l = 1
  while (xp >= xpForLevel(l + 1)) l++
  return l
}
export function xpProgress(skill) {
  const l = level(skill)
  const start = xpForLevel(l)
  return { lvl: l, have: (game.state.xp[skill] ?? 0) - start, needed: xpToNext(l) }
}
function giveXp(skill, xp) {
  const before = level(skill)
  game.state.xp[skill] += xp
  const after = level(skill)
  if (after > before) game.emit('levelUp', { skill, lvl: after })
}

export const rank = id => game.state.ranks[id] ?? 0
export const combatPoints = () => {
  const spent = NODES.filter(n => n.type === 'stat').reduce((s, n) => s + rank(n.id), 0)
  return level('combat') - 1 - spent
}

// Resources
export const canAfford = price => Object.entries(price ?? {}).every(([r, n]) => (game.state.resources[r] ?? 0) >= n)
function pay(price) { for (const [r, n] of Object.entries(price ?? {})) game.state.resources[r] -= n }
function give(r, n) {
  game.state.resources[r] = (game.state.resources[r] ?? 0) + n
  if (!game.state.seen.includes(r)) game.state.seen.push(r)
}

// Effects from upgrades, buildings in sockets, equipment and discoveries
function buildingEffects() {
  return game.state.sockets.filter(Boolean).map(id => nodes.get(id).building.effect)
}
function passiveEffect(type) {
  return NODES.filter(n => n.type === 'passive' && rank(n.id) > 0 && n.passive.effect.type === type)
}

export function activityTime(id) {
  const n = nodes.get(id)
  let time = n.activity.time
  for (const m of NODES.filter(m => m.type === 'modifier' && m.modifier.effect.type === 'time' && m.modifier.effect.targets.includes(id))) {
    time += m.modifier.effect.value * rank(m.id)
  }
  if (id === 'oak' && rank('sustainable-felling') > 0) time += nodes.get('sustainable-felling').passive.effect.time
  const skill = n.activity.smelting ? 'smelting' : n.activity.skill
  const speed = buildingEffects().filter(e => e.type === 'speed' && e.skill === skill).reduce((s, e) => s + e.value, 0)
  return Math.max(0.5, time / (1 + speed))
}
export function doubleChance(id) {
  return NODES.filter(m => m.type === 'modifier' && m.modifier.effect.type === 'double' && m.modifier.effect.targets.includes(id))
    .reduce((s, m) => s + m.modifier.effect.value * rank(m.id), 0)
}
const fuelSaving = () => nodes.get('thrifty-stoking').modifier.effect.value * rank('thrifty-stoking')
export function activityXp(id) {
  const n = nodes.get(id)
  let xp = n.activity.xp
  if (id === 'oak' && rank('sustainable-felling') > 0) xp += nodes.get('sustainable-felling').passive.effect.xp
  const bonus = passiveEffect('xpBonus').filter(p => p.passive.effect.skill === n.activity.skill).reduce((s, p) => s + p.passive.effect.value * rank(p.id), 0)
  return xp * (1 + bonus)
}

export function playerStats() {
  const s = { ...PLAYER_BASE, crit: 0, thorns: 0, hpPerKill: 0, herbalMedicine: null }
  for (const id of Object.values(game.state.equipped)) if (id) for (const [k, v] of Object.entries(nodes.get(id).gear.stats)) s[k] += v
  for (const n of NODES.filter(n => n.type === 'stat')) for (const [k, v] of Object.entries(n.stat.effect)) s[k] += v * rank(n.id)
  for (const e of buildingEffects()) {
    if (e.type === 'atk') s.atk += e.value
    if (e.type === 'hpPerKill') s.hpPerKill += e.value
  }
  for (const p of passiveEffect('thorns')) s.thorns += p.passive.effect.value
  const herb = passiveEffect('herbalMedicine')[0]
  if (herb) s.herbalMedicine = herb.passive.effect
  s.time = Math.max(0.5, s.time)
  return s
}

// Requirements and visibility
const requirementMet = r => {
  if (r.skill) return level(r.skill) >= r.lvl
  if (r.boss) return !!game.state.defeated[r.boss]
  if (r.stat) return rank(r.stat) >= r.points
  return true
}
export const requirementList = n => n.type === 'modifier' ? [{ skill: n.skill, lvl: n.modifier.lvl[Math.min(rank(n.id), n.modifier.ranks - 1)] }, ...(n.requires ?? [])] : (n.requires ?? [])
export const requirementsMet = n => requirementList(n).every(requirementMet)
const firstRequirementsMet = n => (n.type === 'modifier' ? requirementMet({ skill: n.skill, lvl: n.modifier.lvl[0] }) : (n.requires ?? []).every(requirementMet))
export function visibleWhenMet(n) {
  const v = n.visibleWhen
  if (!v) return true
  if (v.kills) return Object.entries(v.kills).every(([id, count]) => (game.state.kills[id] ?? 0) >= count)
  if (v.skill) return level(v.skill) >= v.lvl
  return true
}
export const clusterRevealed = c => !CLUSTERS[c].hidden || !!game.state.revealed[c]

export function computeStatus() {
  const open = []
  for (const n of NODES) {
    if (!clusterRevealed(n.cluster) || n.type === 'unknown') continue
    if (visibleWhenMet(n) && firstRequirementsMet(n)) open.push(n.id)
  }
  const distance = new Map(open.map(id => [id, 0]))
  const queue = [...open]
  while (queue.length) {
    const id = queue.shift()
    const d = distance.get(id)
    if (d >= 2) continue
    for (const nb of neighbors.get(id)) {
      if (!clusterRevealed(nodes.get(nb).cluster) || distance.has(nb)) continue
      distance.set(nb, d + 1)
      queue.push(nb)
    }
  }
  const previous = game.status
  const next = new Map()
  for (const n of NODES) {
    let s = 'hidden'
    if (clusterRevealed(n.cluster)) {
      const d = distance.get(n.id)
      if (n.type === 'unknown') s = 'fog'
      else if (d === 0) s = 'open'
      else if (d === 1) s = visibleWhenMet(n) ? 'locked' : 'fog'
      else if (d === 2) s = 'fog'
    }
    next.set(n.id, s)
  }
  game.status = next
  for (const [id, s] of next) {
    const before = previous.get(id)
    if (before && (before === 'hidden' || before === 'fog') && (s === 'open' || s === 'locked') && !game.state.discovered.includes(id)) {
      game.state.discovered.push(id)
      game.state.unseen.push(id)
      game.emit('newNode', { id })
    }
  }
  return next
}
export const isVisible = id => ['open', 'locked'].includes(game.status.get(id))

function checkReveals() {
  for (const [c, cluster] of Object.entries(CLUSTERS)) {
    if (!cluster.hidden || game.state.revealed[c]) continue
    const h = cluster.hidden
    const ok = h.boss ? !!game.state.defeated[h.boss] : (game.state.counters[h.counter] ?? 0) >= h.count
    if (ok) {
      game.state.revealed[c] = true
      for (const n of NODES.filter(n => n.cluster === c)) {
        if (!game.state.discovered.includes(n.id)) game.state.discovered.push(n.id)
        if (n.type !== 'unknown' && !game.state.unseen.includes(n.id)) game.state.unseen.push(n.id)
      }
      game.emit('reveal', { cluster: c })
    }
  }
}

// Actions
export function startActivity(id) {
  const n = nodes.get(id)
  if (game.status.get(id) !== 'open' || !requirementsMet(n)) return false
  if (n.activity) {
    if (n.activity.uses && !canAfford(n.activity.uses)) { game.emit('message', { text: 'missing', name: n.name }); return false }
    game.state.activity = { node: id, t: 0 }
  } else if (n.monster) {
    if (game.state.revive > 0) return false
    const startId = n.dungeon ? dungeonOrder[0] : id
    game.state.activity = { combat: true, node: startId, dungeon: !!n.dungeon, enemyHp: nodes.get(startId).monster.hp, enemyT: 0, playerT: 0, respawn: 0, herbT: 0, kills: 0 }
  } else return false
  game.emit('activity', { id: game.state.activity.node })
  return true
}
export function stopActivity() {
  if (!game.state.activity) return
  game.state.activity = null
  game.emit('activity', { id: null })
}

export function buyRank(id) {
  const n = nodes.get(id)
  const r = rank(id)
  let price
  if (n.type === 'modifier') { if (r >= n.modifier.ranks || !requirementsMet(n)) return false; price = n.modifier.price[r] }
  else if (n.type === 'passive') { if (r >= n.passive.ranks || game.status.get(id) !== 'open') return false; price = n.passive.price[r] }
  else if (n.type === 'stat') { if (r >= n.stat.ranks || !requirementsMet(n) || combatPoints() < 1) return false; price = {} }
  else return false
  if (!canAfford(price)) return false
  pay(price)
  game.state.ranks[id] = r + 1
  game.emit('changed', { id })
  return true
}

const gearValue = id => Object.values(nodes.get(id).gear.stats).reduce((s, v) => s + v, 0)
export function craft(id) {
  const n = nodes.get(id)
  if (!n.gear || game.state.crafted.includes(id) || !requirementsMet(n) || !canAfford(n.gear.price)) return false
  pay(n.gear.price)
  game.state.crafted.push(id)
  giveXp('smithing', n.gear.xp)
  const current = game.state.equipped[n.gear.slot]
  if (!current || gearValue(id) > gearValue(current)) game.state.equipped[n.gear.slot] = id
  game.emit('crafted', { id })
  return true
}
export function equip(slot, id) {
  if (id && (!game.state.crafted.includes(id) || nodes.get(id).gear.slot !== slot)) return false
  game.state.equipped[slot] = id
  game.emit('changed', { id })
  return true
}

export const socketCount = () => (game.state.extension ? 3 : 2)
export function build(id) {
  const n = nodes.get(id)
  if (n.type === 'extension') {
    if (game.state.extension || !canAfford(n.extension.price)) return false
    pay(n.extension.price)
    game.state.extension = true
    game.emit('built', { id })
    return true
  }
  if (!n.building || game.state.built.includes(id) || !canAfford(n.building.price)) return false
  pay(n.building.price)
  game.state.built.push(id)
  const free = game.state.sockets.slice(0, socketCount()).indexOf(null)
  if (free >= 0) game.state.sockets[free] = id
  game.emit('built', { id })
  return true
}
export function placeInSocket(index, id) {
  if (index >= socketCount()) return false
  if (id && !game.state.built.includes(id)) return false
  const old = game.state.sockets.indexOf(id)
  if (id && old >= 0) game.state.sockets[old] = null
  game.state.sockets[index] = id
  game.emit('changed', { id })
  return true
}

// Passage of time
function finishActivity(n) {
  const a = n.activity
  if (a.uses) {
    if (!canAfford(a.uses)) {
      game.emit('message', { text: 'missing', name: n.name })
      stopActivity()
      return
    }
    const consumed = { ...a.uses }
    if (a.fuel && Math.random() < fuelSaving()) delete consumed[a.fuel]
    pay(consumed)
  }
  for (const [r, amount] of Object.entries(a.gives)) {
    const total = amount + (Math.random() < doubleChance(n.id) ? amount : 0)
    give(r, total)
    if (r === 'oak') game.state.counters.oakFelled += total
    game.emit('yield', { id: n.id, resource: r, amount: total })
  }
  giveXp(a.skill, activityXp(n.id))
}

function combatTick(dt) {
  const c = game.state.activity
  const s = playerStats()
  if (c.respawn > 0) {
    c.respawn -= dt
    if (c.respawn <= 0) {
      c.enemyHp = nodes.get(c.node).monster.hp
      c.enemyT = 0
      c.playerT = 0
      game.emit('newMonster', { id: c.node })
    }
    return
  }
  const n = nodes.get(c.node)
  const m = n.monster
  c.playerT += dt
  c.enemyT += dt
  if (s.herbalMedicine) {
    c.herbT += dt
    if (c.herbT >= s.herbalMedicine.interval) {
      c.herbT -= s.herbalMedicine.interval
      const heal = Math.round(s.hp * s.herbalMedicine.value)
      game.state.hp = Math.min(s.hp, game.state.hp + heal)
      game.emit('heal', { amount: heal })
    }
  }
  if (c.playerT >= s.time) {
    c.playerT -= s.time
    const crit = Math.random() < s.crit
    const damage = Math.max(1, s.atk - m.def) * (crit ? 2 : 1)
    c.enemyHp -= damage
    game.emit('hit', { by: 'player', damage, crit })
    if (c.enemyHp <= 0) return kill(n, s)
  }
  if (c.enemyT >= m.time) {
    c.enemyT -= m.time
    const damage = Math.max(1, m.atk - s.def)
    game.state.hp -= damage
    game.emit('hit', { by: 'enemy', damage })
    if (s.thorns > 0) {
      c.enemyHp -= s.thorns
      game.emit('hit', { by: 'thorns', damage: s.thorns })
      if (c.enemyHp <= 0 && game.state.hp > 0) return kill(n, s)
    }
    if (game.state.hp <= 0) return die(n)
  }
}

function kill(n, s) {
  const c = game.state.activity
  const m = n.monster
  game.state.kills[n.id] = (game.state.kills[n.id] ?? 0) + 1
  c.kills++
  giveXp('combat', m.xp)
  if (m.drop && Math.random() < m.drop.chance) { give(m.drop.resource, 1); game.emit('yield', { id: n.id, resource: m.drop.resource, amount: 1 }) }
  if (s.hpPerKill) game.state.hp = Math.min(s.hp, game.state.hp + s.hpPerKill)
  game.emit('kill', { id: n.id })
  if (n.dungeon) {
    const i = dungeonOrder.indexOf(n.id)
    if (i === dungeonOrder.length - 1) {
      const first = !game.state.defeated[n.id]
      game.state.defeated[n.id] = true
      stopActivity()
      game.emit('bossDefeated', { id: n.id, first })
      checkReveals()
      return
    }
    c.node = dungeonOrder[i + 1]
  }
  c.respawn = RESPAWN_SEC
}

function die(n) {
  game.state.hp = 0
  game.state.revive = REVIVE_SEC
  const inDungeon = !!n.dungeon
  stopActivity()
  game.emit('death', { dungeon: inDungeon })
}

export function tick(dtReal) {
  const dt = dtReal * game.speed
  const st = game.state
  st.playTime += dt
  const s = playerStats()
  if (st.hp === null || st.hp > s.hp) st.hp = Math.min(st.hp ?? s.hp, s.hp)
  const a = st.activity
  if (st.revive > 0) {
    st.revive -= dt
    if (st.revive <= 0) { st.revive = 0; st.hp = s.hp; game.emit('revived') }
  } else if (!a?.combat && st.hp < s.hp) {
    st.hp = Math.min(s.hp, st.hp + (s.hp / REVIVE_SEC) * dt)
  }
  if (a && !a.combat) {
    const n = nodes.get(a.node)
    a.t += dt
    let time = activityTime(n.id)
    while (game.state.activity === a && a.t >= time) {
      a.t -= time
      finishActivity(n)
      time = activityTime(n.id)
    }
  } else if (a?.combat) {
    let rest = dt
    while (rest > 0 && game.state.activity === a) { const step = Math.min(rest, 0.05); combatTick(step); rest -= step }
  }
  checkReveals()
  checkMilestones()
}

// Offline progress: the game keeps running for the time the player was away (at most OFFLINE_MAX_HOURS).
// The events are recorded, so the UI can show a summary and play reveals afterwards.
export function simulateOffline(seconds) {
  const max = OFFLINE_MAX_HOURS * 3600
  const used = Math.min(Math.max(0, seconds), max)
  const before = {
    resources: { ...game.state.resources },
    levels: Object.fromEntries(Object.keys(SKILLS).map(s => [s, level(s)])),
    kills: { ...game.state.kills },
    activity: game.state.activity?.node ?? null,
  }
  const speed = game.speed
  game.speed = 1
  game.recording = []
  let rest = used
  try {
    while (rest > 0) {
      const step = Math.min(rest, 5)
      tick(step)
      rest -= step
    }
    // Visibility depends only on the total progress, so it is computed once at the end
    computeStatus()
  } finally {
    game.speed = speed
  }
  const events = game.recording
  game.recording = null
  game.state.offlineTime += used
  const diff = (after, prev) => Object.fromEntries(Object.entries(after).map(([k, v]) => [k, v - (prev[k] ?? 0)]).filter(([, v]) => Math.abs(v) >= 1))
  return {
    seconds, used, capped: seconds > max,
    activity: before.activity,
    stopped: !!before.activity && !game.state.activity,
    resources: diff(game.state.resources, before.resources),
    levels: Object.keys(SKILLS).filter(s => level(s) > before.levels[s]).map(s => ({ skill: s, from: before.levels[s], to: level(s) })),
    kills: diff(game.state.kills, before.kills),
    died: events.some(e => e.type === 'death'),
    events,
  }
}

// Estimate of a fight or the whole dungeon without randomness (critical strikes as an average)
export function estimate(ids) {
  const s = playerStats()
  let hp = game.state.revive > 0 ? s.hp : Math.max(1, game.state.hp ?? s.hp)
  let totalTime = 0
  for (const id of ids) {
    const m = nodes.get(id).monster
    let ehp = m.hp, pt = 0, et = 0, herb = 0, t = 0
    const dealt = Math.max(1, s.atk - m.def) * (1 + s.crit)
    const taken = Math.max(1, m.atk - s.def)
    while (ehp > 0 && hp > 0 && t < 600) {
      const next = Math.min(s.time - pt, m.time - et)
      pt += next; et += next; t += next; herb += next
      if (s.herbalMedicine && herb >= s.herbalMedicine.interval) { herb -= s.herbalMedicine.interval; hp = Math.min(s.hp, hp + s.hp * s.herbalMedicine.value) }
      if (pt >= s.time - 1e-9) { pt = 0; ehp -= dealt; if (ehp <= 0) break }
      if (et >= m.time - 1e-9) { et = 0; hp -= taken; ehp -= s.thorns }
    }
    totalTime += t
    if (hp <= 0) return { wins: false, time: totalTime, losesAt: id, hp: 0 }
    hp = Math.min(s.hp, hp + s.hpPerKill)
  }
  return { wins: true, time: totalTime, hp }
}

// Save and load
export function save() {
  game.state.savedAt = Date.now()
  try { localStorage.setItem(saveKey, JSON.stringify(game.state)) } catch { /* private window or full storage */ }
}
// A game where the whole map is visible: high levels, the boss defeated and all clusters revealed. Nothing is bought yet.
function revealAllState() {
  const s = newState()
  for (const skill of Object.keys(SKILLS)) s.xp[skill] = xpForLevel(20)
  for (const r of Object.keys(RESOURCES)) s.resources[r] = 500
  s.seen = Object.keys(RESOURCES)
  s.defeated['tree-guardian'] = true
  s.revealed = Object.fromEntries(Object.entries(CLUSTERS).filter(([, c]) => c.hidden).map(([id]) => [id, true]))
  s.counters.oakFelled = 300
  s.kills = { rat: 10, goblin: 15 }
  s.discovered = NODES.map(n => n.id)
  s.ranks = { strength: 3, 'quick-hands': 2 }
  return s
}
const startState = () => (demo === 'all' ? revealAllState() : newState())

const renamed = (map, id) => (Object.hasOwn(map, id) ? map[id] : id)
const renameKeys = (obj, map) => Object.fromEntries(Object.entries(obj).map(([k, v]) => [renamed(map, k), v]))

// Version 3 has English field names and ids
function toVersion3(old) {
  const s = renameKeys(old, legacy.STATE_FIELDS)
  const keyed = {
    resources: legacy.RESOURCES, xp: legacy.SKILLS, ranks: legacy.NODES, kills: legacy.NODES, defeated: legacy.NODES,
    revealed: legacy.CLUSTERS, counters: legacy.COUNTERS, milestones: legacy.MILESTONES,
  }
  const listed = { seen: legacy.RESOURCES, crafted: legacy.NODES, built: legacy.NODES, discovered: legacy.NODES, unseen: legacy.NODES, sockets: legacy.NODES }
  for (const [field, map] of Object.entries(keyed)) if (s[field] && typeof s[field] === 'object') s[field] = renameKeys(s[field], map)
  for (const [field, map] of Object.entries(listed)) if (Array.isArray(s[field])) s[field] = s[field].map(id => renamed(map, id))
  if (s.equipped && typeof s.equipped === 'object') {
    s.equipped = Object.fromEntries(Object.entries(s.equipped).map(([slot, id]) => [renamed(legacy.SLOTS, slot), renamed(legacy.NODES, id)]))
  }
  if (s.activity && typeof s.activity === 'object') {
    s.activity = renameKeys(s.activity, legacy.ACTIVITY_FIELDS)
    s.activity.node = renamed(legacy.NODES, s.activity.node)
  }
  s.version = 3
  return s
}

// Upgrades a save to the current version. Returns null for unknown, newer versions.
export function migrate(saved) {
  if (!saved || typeof saved !== 'object') return null
  let s = { ...saved }
  if (s.version === 1) s = { ...s, version: 2, spilletid: 0, offlinetid: 0, gemtTid: null, milepaele: {} }
  if (s.version === 2) s = toVersion3(s)
  return s.version === SAVE_VERSION ? s : null
}

// Reads the save, or the legacy save from before version 3 when there is none. The legacy key is never changed.
function readSave() {
  const raw = localStorage.getItem(saveKey)
  if (raw) {
    const saved = migrate(JSON.parse(raw))
    if (saved) return saved
    // A save from a newer version is set aside instead of being overwritten
    try { localStorage.setItem(`${saveKey}-backup`, raw) } catch { /* ignored */ }
    return null
  }
  const old = localStorage.getItem(legacyKey())
  return old ? migrate(JSON.parse(old)) : null
}

export function load() {
  try {
    const saved = readSave()
    game.state = saved ? { ...newState(), ...saved } : startState()
  } catch { game.state = startState() }
  if (!game.state.discovered.length) game.state.discovered = [...START_NODES]
  game.status = new Map()
  computeStatus()
  for (const [id, s] of game.status) if ((s === 'open' || s === 'locked') && !game.state.discovered.includes(id)) game.state.discovered.push(id)
}
export function reset() {
  try { localStorage.removeItem(saveKey) } catch { /* ignored */ }
  game.state = startState()
  // Saving the fresh game keeps load() from migrating the legacy save again
  save()
  load()
}

// Developer tools for testing
export const dev = {
  resources() { for (const r of Object.keys(RESOURCES)) give(r, 100) },
  levels() { for (const s of Object.keys(SKILLS)) { const l = level(s); game.state.xp[s] = Math.max(game.state.xp[s], xpForLevel(l + 1)); game.emit('levelUp', { skill: s, lvl: l + 1 }) } },
  reveal() { game.state.defeated['tree-guardian'] = true; game.state.counters.oakFelled = Math.max(300, game.state.counters.oakFelled); checkReveals() },
  revealAll() { game.state = revealAllState(); game.status = new Map(); computeStatus() },
}
