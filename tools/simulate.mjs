// Balance simulator: a bot plays through the prototype without a browser and measures the time to each milestone.
// Usage: node tools/simulate.mjs [number of runs] [--write]   (--write saves the report to docs/balance.md)
import { writeFileSync } from 'node:fs'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const runs = Number(process.argv.slice(2).find(a => /^\d+$/.test(a)) ?? 10)
const write = process.argv.includes('--write')

const m = await import('../prototype/js/game.js')
const { NODES } = await import('../prototype/js/data.js')
const { game, nodes, dungeonOrder } = m

const DT = 0.5
const MAX_TIME = 3 * 3600

// Target in minutes per milestone. The prototype aims for 30-45 minutes up to the boss (prototype-nodes.md).
const TARGETS = {
  'first-gear': [0.5, 3],
  goblin: [4, 10],
  willow: [8, 16],
  'iron-ore': [10, 20],
  'iron-bar': [12, 22],
  wolf: [12, 25],
  'iron-chestplate': [20, 35],
  dungeon: [22, 38],
  boss: [30, 45],
}

function mulberry32(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

class OutOfTime extends Error {}
let deaths = 0
game.on('death', () => { deaths++ })

const have = r => game.state.resources[r] ?? 0
const time = () => game.state.playTime
let stepCount = 0
function step() {
  if (time() > MAX_TIME) throw new OutOfTime()
  m.tick(DT)
  if (++stepCount % 4 === 0) { m.computeStatus(); autoBuy() }
}
function start(id) {
  m.computeStatus()
  return m.startActivity(id)
}

// Runs the game until the condition holds. wanted() says which activity should run;
// it returns 'wait' to wait one step and false if the bot has to give up.
const alreadyRunning = id => {
  const a = game.state.activity
  return !!a && (a.node === id || (a.dungeon && !!nodes.get(id).dungeon))
}
function runUntil(condition, wanted, each) {
  while (!condition()) {
    if (wanted) {
      if (game.state.revive > 0) { step(); continue }
      const id = wanted()
      if (!id) return false
      if (id !== 'wait' && !alreadyRunning(id) && !start(id)) return false
    }
    if (each) each()
    step()
  }
  return true
}

// Resources
const RAW = { oak: 'oak', willow: 'willow', ash: 'ash', 'copper-ore': 'copper-ore', 'iron-ore': 'iron-ore' }
const BARS = { 'copper-bar': 'smelt-copper', 'iron-bar': 'smelt-iron' }
const DROPS = { 'rat-tail': 'rat', leather: 'goblin', 'wolf-pelt': 'wolf' }

function obtain(r, n) {
  if (have(r) >= n) return true
  if (RAW[r]) {
    setSockets('gathering')
    return runUntil(() => have(r) >= n, () => RAW[r])
  }
  if (BARS[r]) {
    const id = BARS[r]
    const act = nodes.get(id).activity
    while (have(r) < n) {
      if (!m.requirementsMet(nodes.get(id))) return false
      const batch = Math.min(n - have(r), 10)
      for (const [input, k] of Object.entries(act.uses)) if (!obtain(input, k * batch)) return false
      const goal = Math.min(n, have(r) + batch)
      setSockets('smelting')
      runUntil(() => have(r) >= goal || !m.canAfford(act.uses), () => id)
      m.stopActivity()
    }
    return true
  }
  if (DROPS[r]) return fight(() => DROPS[r], () => have(r) >= n)
  return false
}

function obtainPrice(price) {
  const ordered = Object.entries(price ?? {}).sort(([a], [b]) => (BARS[b] ? 1 : 0) - (BARS[a] ? 1 : 0))
  for (let i = 0; i < 6 && !m.canAfford(price); i++) {
    for (const [r, n] of ordered) if (!obtain(r, n)) return false
  }
  return m.canAfford(price)
}

// Training skills
function bestActivity(skill) {
  const options = NODES.filter(n => n.activity?.skill === skill && !n.activity.uses && game.status.get(n.id) === 'open' && m.requirementsMet(n))
  options.sort((a, b) => m.activityXp(b.id) / m.activityTime(b.id) - m.activityXp(a.id) / m.activityTime(a.id))
  return options[0]?.id
}
function train(skill, lvl) {
  while (m.level(skill) < lvl) {
    m.computeStatus()
    if (skill === 'smithing') {
      const iron = m.requirementsMet(nodes.get('smelt-iron')) && m.level('mining') >= 8 && m.level('woodcutting') >= 8
      const bar = iron ? 'iron-bar' : 'copper-bar'
      if (!obtain(bar, have(bar) + 5)) return false
      continue
    }
    if (skill === 'combat') { if (!fight(safeMonster, () => m.level('combat') >= lvl)) return false; continue }
    const id = bestActivity(skill)
    if (!id) return false
    setSockets('gathering')
    runUntil(() => m.level(skill) >= lvl || bestActivity(skill) !== id, () => id)
    m.stopActivity()
  }
  return true
}

// Combat
function safeMonster() {
  const s = m.playerStats()
  for (const id of ['wolf', 'goblin', 'rat']) {
    if (game.status.get(id) !== 'open') continue
    const e = m.estimate([id])
    if (e.wins && e.hp > s.hp * 0.4) return id
  }
  return 'rat'
}
function fight(choose, condition) {
  setSockets('combat')
  return runUntil(
    condition,
    () => {
      const id = choose()
      if (alreadyRunning(id)) return id
      if (game.state.hp < m.playerStats().hp * 0.95) return 'wait'
      return game.status.get(id) === 'open' ? id : false
    },
    () => {
      // Pull out between two monsters if HP is low, and wait to recover
      const a = game.state.activity
      if (a?.combat && !a.dungeon && a.respawn > 0 && game.state.hp < m.playerStats().hp * 0.35) m.stopActivity()
    },
  )
}

// Purchases, buildings and sockets
const COMBAT_POINTS = [['strength', 3], ['quick-hands', 3], ['defense', 3], ['endurance', 3], ['strength', 5], ['defense', 5], ['endurance', 5], ['critical-strike', 3]]
const BUILDINGS = ['campfire', 'saw', 'ore-cart', 'whetstone', 'extension', 'bellows']
function autoBuy() {
  for (const [id, max] of COMBAT_POINTS) while (m.combatPoints() > 0 && m.rank(id) < max && m.buyRank(id)) { /* buys one point at a time */ }
  for (const n of NODES) {
    if (n.type === 'modifier') {
      const r = m.rank(n.id)
      if (r < n.modifier.ranks && m.requirementsMet(n) && Object.entries(n.modifier.price[r]).every(([res, k]) => have(res) >= k * 2)) m.buyRank(n.id)
    } else if (n.type === 'passive' && game.status.get(n.id) === 'open') {
      const r = m.rank(n.id)
      if (r < n.passive.ranks && Object.entries(n.passive.price[r]).every(([res, k]) => have(res) >= k * 2)) m.buyRank(n.id)
    }
  }
  for (const id of BUILDINGS) {
    const n = nodes.get(id)
    const price = n.building?.price ?? n.extension?.price
    const built = id === 'extension' ? game.state.extension : game.state.built.includes(id)
    if (!built && Object.entries(price).every(([res, k]) => have(res) >= k * 1.5)) m.build(id)
  }
}
const SOCKET_PLAN = {
  gathering: ['saw', 'ore-cart', 'bellows', 'campfire', 'whetstone'],
  smelting: ['bellows', 'saw', 'ore-cart', 'campfire', 'whetstone'],
  combat: ['whetstone', 'campfire', 'saw', 'ore-cart', 'bellows'],
}
function setSockets(mode) {
  const plan = SOCKET_PLAN[mode].filter(id => game.state.built.includes(id)).slice(0, m.socketCount())
  if (plan.every(id => game.state.sockets.includes(id))) return
  for (let i = 0; i < m.socketCount(); i++) m.placeInSocket(i, null)
  plan.forEach((id, i) => m.placeInSocket(i, id))
}

function makeGear(id) {
  const n = nodes.get(id)
  if (game.state.crafted.includes(id)) return true
  for (const k of n.requires ?? []) if (k.skill && !train(k.skill, k.lvl)) return false
  if (!obtainPrice(n.gear.price)) return false
  return m.craft(id)
}
function construct(id) {
  const n = nodes.get(id)
  if (game.state.built.includes(id) || (id === 'extension' && game.state.extension)) return true
  if (!obtainPrice(n.building?.price ?? n.extension.price)) return false
  return m.build(id)
}

// The route: what a sensible player would do, in a reasonable order
function route() {
  makeGear('copper-sword')
  makeGear('copper-helm')
  construct('campfire')
  construct('saw')
  fight(() => 'rat', () => (game.state.kills.rat ?? 0) >= 10)
  makeGear('copper-greaves')
  makeGear('copper-chestplate')
  fight(() => 'goblin', () => (game.state.kills.goblin ?? 0) >= 15)
  makeGear('copper-boots')
  train('woodcutting', 8)
  train('mining', 8)
  for (const g of ['iron-helm', 'iron-sword', 'iron-greaves', 'iron-chestplate', 'iron-boots']) makeGear(g)
  train('woodcutting', 12)
  while (!game.state.defeated['tree-guardian']) {
    m.computeStatus()
    const s = m.playerStats()
    if (game.state.revive > 0 || game.state.hp < s.hp * 0.95) { m.stopActivity(); step(); continue }
    if (m.estimate(dungeonOrder).wins) {
      setSockets('combat')
      start(dungeonOrder[0])
      runUntil(() => !game.state.activity || game.state.defeated['tree-guardian'])
    } else train('combat', m.level('combat') + 1)
  }
  train('woodcutting', 15)
}

// Run
const results = []
for (let i = 0; i < runs; i++) {
  Math.random = mulberry32(1000 + i)
  m.reset()
  deaths = 0
  stepCount = 0
  let end = 'done'
  try { route() } catch (e) { if (e instanceof OutOfTime) end = 'out of time'; else throw e }
  results.push({
    milestones: { ...game.state.milestones },
    levels: Object.fromEntries(['woodcutting', 'mining', 'smithing', 'combat'].map(s => [s, m.level(s)])),
    deaths, end, time: time(),
  })
}

// Report
const median = v => { const s = [...v].sort((a, b) => a - b); return s.length ? s[Math.floor((s.length - 1) / 2)] : null }
const mmss = s => (s == null ? '–' : `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`)
const lines = []
const out = l => lines.push(l)
out('# Balance')
out('')
out(`Generated by \`node tools/simulate.mjs ${runs} --write\`. The bot plays through the prototype with a fixed seed (${runs} runs) and measures the play time to each milestone. Do not edit this file by hand.`)
out('')
out('| Milestone | Median | Fastest | Slowest | Reached | Target | Verdict |')
out('|---|---|---|---|---|---|---|')
for (const mp of m.MILESTONES) {
  const times = results.map(r => r.milestones[mp.id]).filter(v => v !== undefined)
  const med = median(times)
  const target = TARGETS[mp.id]
  let verdict = '–'
  if (target && med != null) verdict = med / 60 < target[0] ? 'too fast' : med / 60 > target[1] ? 'too slow' : 'within target'
  out(`| ${mp.name} | ${mmss(med)} | ${mmss(times.length ? Math.min(...times) : null)} | ${mmss(times.length ? Math.max(...times) : null)} | ${times.length}/${runs} | ${target ? `${target[0]}-${target[1]} min` : '–'} | ${verdict} |`)
}
out('')
const lv = s => median(results.map(r => r.levels[s]))
out(`Levels at the end (median): woodcutting ${lv('woodcutting')}, mining ${lv('mining')}, smithing ${lv('smithing')}, combat ${lv('combat')}. Deaths (median): ${median(results.map(r => r.deaths))}. Runs that ran out of time: ${results.filter(r => r.end !== 'done').length}.`)
const report = lines.join('\n') + '\n'
console.log(report)
if (write) {
  writeFileSync(join(root, 'docs', 'balance.md'), report)
  console.log('Wrote docs/balance.md')
}
