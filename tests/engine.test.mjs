// Automated tests of the game engine in prototype/js/game.js. Run with: npm test
import { test, beforeEach, afterEach } from 'node:test'
import assert from 'node:assert/strict'

// Randomness is turned off so double yields, drops and critical strikes do not affect the tests
Math.random = () => 0.999

const m = await import('../prototype/js/game.js')
const { xpToNext, NODES, RESOURCES, SKILLS, SLOTS, CLUSTERS } = await import('../prototype/js/data.js')
const legacy = await import('../prototype/js/legacy-ids.js')
const { game } = m

const run = (seconds, step = 0.05) => {
  for (let t = 0; t < seconds; t += step) m.tick(step)
  m.computeStatus()
}
const status = id => game.status.get(id)

// An in-memory localStorage for the save tests. Node has none, so the other tests run without storage.
const useStorage = (entries = {}) => {
  const data = new Map(Object.entries(entries))
  globalThis.localStorage = {
    getItem: k => data.get(k) ?? null,
    setItem: (k, v) => { data.set(k, String(v)) },
    removeItem: k => { data.delete(k) },
  }
  return data
}

beforeEach(() => m.reset())
afterEach(() => { delete globalThis.localStorage })

test('the starting game shows the right nodes', () => {
  assert.equal(status('oak'), 'open')
  assert.equal(status('willow'), 'locked')
  assert.equal(status('ash'), 'fog')
  assert.equal(status('goblin'), 'fog')
  assert.equal(status('bark-beetle'), 'hidden')
  assert.equal(status('root-network'), 'hidden')
  assert.equal(status('slot-weapon'), 'open')
})

test('an activity gives resources, XP and levels', () => {
  assert.ok(m.startActivity('oak'))
  run(3.05)
  assert.equal(game.state.resources.oak, 1)
  assert.equal(game.state.xp.woodcutting, 5)
  run(Math.ceil(xpToNext(1) / 5) * 3)
  assert.equal(m.level('woodcutting'), 2)
})

test('only one activity at a time', () => {
  m.startActivity('oak')
  m.startActivity('copper-ore')
  assert.equal(game.state.activity.node, 'copper-ore')
})

test('locked nodes cannot be started', () => {
  assert.equal(m.startActivity('willow'), false)
  assert.equal(game.state.activity, null)
})

test('smelting uses resources and stops when they run out', () => {
  game.state.resources['copper-ore'] = 2
  game.state.resources.oak = 2
  assert.ok(m.startActivity('smelt-copper'))
  run(9.5)
  assert.equal(game.state.resources['copper-bar'], 2)
  assert.equal(game.state.resources['copper-ore'], 0)
  assert.equal(game.state.activity, null)
})

test('modifiers make the activity faster', () => {
  for (let i = 0; i < 2; i++) m.dev.levels()
  game.state.resources.oak = 10
  m.computeStatus()
  assert.ok(m.buyRank('sharp-axe'))
  assert.equal(m.rank('sharp-axe'), 1)
  assert.equal(Math.round(m.activityTime('oak') * 10) / 10, 2.8)
})

test('crafting equips the gear and gives stats', () => {
  game.state.resources['copper-bar'] = 4
  assert.ok(m.craft('copper-sword'))
  assert.equal(game.state.equipped.weapon, 'copper-sword')
  assert.equal(m.playerStats().atk, 9)
  assert.equal(m.craft('copper-sword'), false)
})

test('buildings go into a free socket and work there', () => {
  game.state.resources.oak = 20
  game.state.resources['copper-bar'] = 3
  assert.ok(m.build('saw'))
  assert.deepEqual(game.state.sockets, ['saw', null, null])
  assert.ok(m.activityTime('oak') < 3)
})

test('the goblin becomes visible after 10 defeated rats', () => {
  game.state.kills.rat = 9
  m.computeStatus()
  assert.equal(status('goblin'), 'fog')
  game.state.kills.rat = 10
  m.computeStatus()
  assert.equal(status('goblin'), 'open')
})

test('combat at the rat gives kills and combat XP', () => {
  game.state.hp = 50
  assert.ok(m.startActivity('rat'))
  run(20)
  assert.ok(game.state.kills.rat >= 3)
  assert.ok(game.state.xp.combat > 0)
})

test('full iron gear and combat points defeat the boss, and Druid and Ash open', () => {
  for (let i = 0; i < 18; i++) m.dev.levels()
  for (let i = 0; i < 3; i++) m.dev.resources()
  m.computeStatus()
  for (const g of ['copper-helm', 'iron-sword', 'iron-helm', 'iron-chestplate', 'iron-greaves', 'iron-boots']) assert.ok(m.craft(g), g)
  for (const [id, n] of [['strength', 5], ['quick-hands', 3], ['defense', 5], ['endurance', 5]]) for (let i = 0; i < n; i++) assert.ok(m.buyRank(id), id)
  m.build('whetstone')
  m.build('campfire')
  game.state.hp = m.playerStats().hp
  m.computeStatus()
  assert.ok(m.estimate(m.dungeonOrder).wins)
  assert.ok(m.startActivity('moss-lump'))
  assert.equal(game.state.activity.node, 'bark-beetle')
  run(120)
  assert.ok(game.state.defeated['tree-guardian'])
  assert.ok(game.state.revealed.druid)
  assert.equal(status('ash'), 'open')
  assert.equal(status('root-network'), 'open')
  assert.equal(status('druid-unknown'), 'fog')
})

test('Forestry appears when 300 oak have been felled', () => {
  game.state.counters.oakFelled = 299
  m.startActivity('oak')
  run(3.1)
  assert.ok(game.state.revealed.forestry)
  assert.equal(status('plant-a-tree'), 'open')
})

test('the demo load shows the whole map', () => {
  m.useDemo('all')
  try {
    m.reset()
    const notOpen = [...game.status].filter(([, s]) => s !== 'open').map(([id]) => id)
    assert.deepEqual(notOpen, ['druid-unknown'])
  } finally {
    m.useDemo(null)
  }
})

test('saves from version 1 are upgraded, and unknown versions are rejected', () => {
  const v1 = { version: 1, ressourcer: { eg: 7 }, xp: { traefaeldning: 40 } }
  const s = m.migrate(v1)
  assert.equal(s.version, 3)
  assert.equal(s.resources.oak, 7)
  assert.equal(s.playTime, 0)
  assert.deepEqual(s.milestones, {})
  assert.equal(m.migrate({ version: 99 }), null)
  assert.equal(m.migrate(null), null)
})

test('offline progress continues the activity and records the events', () => {
  let sent = 0
  game.on('yield', () => sent++)
  m.startActivity('oak')
  const r = m.simulateOffline(60)
  assert.equal(sent, 0)
  assert.equal(r.resources.oak, 20)
  assert.equal(game.state.resources.oak, 20)
  assert.equal(game.state.offlineTime, 60)
  assert.equal(r.activity, 'oak')
  assert.equal(r.stopped, false)
  assert.ok(r.events.some(e => e.type === 'yield'))
  assert.equal(game.state.activity.node, 'oak')
})

test('offline progress counts at most 8 hours', () => {
  m.startActivity('oak')
  const r = m.simulateOffline(20 * 3600)
  assert.equal(r.capped, true)
  assert.equal(r.used, 8 * 3600)
  assert.equal(game.state.offlineTime, 8 * 3600)
})

test('a cluster can be revealed offline', () => {
  game.state.counters.oakFelled = 299
  m.startActivity('oak')
  const r = m.simulateOffline(60)
  assert.ok(game.state.revealed.forestry)
  assert.ok(r.events.some(e => e.type === 'reveal' && e.data.cluster === 'forestry'))
  assert.equal(status('plant-a-tree'), 'open')
})

test('offline progress without an activity gives no resources', () => {
  const r = m.simulateOffline(600)
  assert.equal(r.activity, null)
  assert.deepEqual(r.resources, {})
  assert.deepEqual(r.levels, [])
})

// Save migration from the Danish ids and fields of version 2 and earlier

// A save as the Danish version 2 wrote it, after the boss, in the middle of a dungeon run
const danishV2 = () => ({
  version: 2,
  spilletid: 7432.6,
  offlinetid: 1800,
  gemtTid: 1760600000000,
  milepaele: { 'foerste-gear': 412, goblin: 1180, pil: 1650, jernmalm: 2010, jernbarre: 2400, ulv: 3100, jernbrystplade: 3900, dungeon: 4300, boss: 6100 },
  ressourcer: { eg: 37, pil: 12, ask: 0, kobbermalm: 5, jernmalm: 3, kobberbarre: 2, jernbarre: 1, rottehale: 4, laeder: 6, ulveskind: 2 },
  sete: ['eg', 'kobbermalm', 'kobberbarre', 'rottehale', 'laeder', 'pil', 'jernmalm', 'jernbarre', 'ulveskind'],
  xp: { traefaeldning: 4200, minedrift: 2600, smedje: 1900, kamp: 3300 },
  ranks: { 'skarp-oekse': 3, 'rigelig-hoest': 1, 'haard-hakke': 2, 'varm-ovn': 1, styrke: 5, 'hurtige-haender': 2, tornehud: 1 },
  craftet: ['kobbersvaerd', 'kobberhjelm', 'jernsvaerd', 'jernbrystplade'],
  udrustet: { vaaben: 'jernsvaerd', hoved: 'kobberhjelm', bryst: 'jernbrystplade', ben: null, foedder: null },
  bygget: ['sav', 'baalplads', 'slibesten'],
  sockets: ['sav', 'slibesten', 'baalplads'],
  tilbygning: true,
  drab: { rotte: 40, goblin: 22, ulv: 9, barkbille: 3, mosklump: 3, 'rasende-egern': 3, 'traeets-vogter': 1 },
  taellere: { egFaeldet: 212 },
  besejret: { 'traeets-vogter': true },
  afsloeret: { druide: true },
  opdagede: ['eg', 'kobbermalm', 'smelt-kobber', 'rotte', 'pil', 'goblin', 'ulv', 'barkbille', 'rodnet', 'tornehud', 'urtemedicin', 'druide-ukendt'],
  uset: ['urtemedicin'],
  hp: 61.5,
  genopliv: 0,
  aktivitet: { kamp: true, node: 'rasende-egern', dungeon: true, fjendeHp: 12, fjendeT: 0.6, spillerT: 1.2, respawn: 0, urtT: 4.5, drab: 2 },
})

const englishV3 = () => ({
  version: 3,
  playTime: 7432.6,
  offlineTime: 1800,
  savedAt: 1760600000000,
  milestones: { 'first-gear': 412, goblin: 1180, willow: 1650, 'iron-ore': 2010, 'iron-bar': 2400, wolf: 3100, 'iron-chestplate': 3900, dungeon: 4300, boss: 6100 },
  resources: { oak: 37, willow: 12, ash: 0, 'copper-ore': 5, 'iron-ore': 3, 'copper-bar': 2, 'iron-bar': 1, 'rat-tail': 4, leather: 6, 'wolf-pelt': 2 },
  seen: ['oak', 'copper-ore', 'copper-bar', 'rat-tail', 'leather', 'willow', 'iron-ore', 'iron-bar', 'wolf-pelt'],
  xp: { woodcutting: 4200, mining: 2600, smithing: 1900, combat: 3300 },
  ranks: { 'sharp-axe': 3, 'bountiful-harvest': 1, 'hard-pick': 2, 'hot-furnace': 1, strength: 5, 'quick-hands': 2, thornskin: 1 },
  crafted: ['copper-sword', 'copper-helm', 'iron-sword', 'iron-chestplate'],
  equipped: { weapon: 'iron-sword', head: 'copper-helm', chest: 'iron-chestplate', legs: null, boots: null },
  built: ['saw', 'campfire', 'whetstone'],
  sockets: ['saw', 'whetstone', 'campfire'],
  extension: true,
  kills: { rat: 40, goblin: 22, wolf: 9, 'bark-beetle': 3, 'moss-lump': 3, 'raging-squirrel': 3, 'tree-guardian': 1 },
  counters: { oakFelled: 212 },
  defeated: { 'tree-guardian': true },
  revealed: { druid: true },
  discovered: ['oak', 'copper-ore', 'smelt-copper', 'rat', 'willow', 'goblin', 'wolf', 'bark-beetle', 'root-network', 'thornskin', 'herbal-medicine', 'druid-unknown'],
  unseen: ['herbal-medicine'],
  hp: 61.5,
  revive: 0,
  activity: { combat: true, node: 'raging-squirrel', dungeon: true, enemyHp: 12, enemyT: 0.6, playerT: 1.2, respawn: 0, herbT: 4.5, kills: 2 },
})

test('a Danish version 2 save migrates to English fields and ids in version 3', () => {
  const old = danishV2()
  const s = m.migrate(old)
  assert.deepStrictEqual(s, englishV3())
  assert.deepStrictEqual(old, danishV2(), 'the old save is not changed')
  assert.deepStrictEqual(m.migrate(s), s, 'a version 3 save is kept as it is')
  const gathering = m.migrate({ ...danishV2(), aktivitet: { node: 'smelt-jern', t: 1.5 } })
  assert.deepStrictEqual(gathering.activity, { node: 'smelt-iron', t: 1.5 })
})

test('a version 1 save migrates through version 2 to version 3', () => {
  const v1 = { version: 1, ressourcer: { eg: 7, kobbermalm: 2 }, sete: ['eg', 'kobbermalm'], xp: { traefaeldning: 40 }, taellere: { egFaeldet: 7 }, aktivitet: { node: 'eg', t: 1.2 } }
  assert.deepStrictEqual(m.migrate(v1), {
    version: 3, playTime: 0, offlineTime: 0, savedAt: null, milestones: {},
    resources: { oak: 7, 'copper-ore': 2 }, seen: ['oak', 'copper-ore'], xp: { woodcutting: 40 }, counters: { oakFelled: 7 }, activity: { node: 'oak', t: 1.2 },
  })
})

test('an unknown save version returns null', () => {
  for (const saved of [{ version: 99 }, { version: 4 }, { version: 0 }, { version: '2' }, {}, null, undefined, 'save', 3]) {
    assert.equal(m.migrate(saved), null, JSON.stringify(saved))
  }
})

test('load() migrates the legacy save and leaves the legacy key untouched', () => {
  const raw = JSON.stringify(danishV2())
  const data = useStorage({ [legacy.LEGACY_SAVE_KEY]: raw })
  m.load()
  // load() adds the nodes that are open now to the discovered ones
  const { discovered, ...rest } = game.state
  const { discovered: expected, ...expectedRest } = englishV3()
  assert.deepStrictEqual(rest, expectedRest)
  assert.deepEqual(discovered.slice(0, expected.length), expected)
  assert.equal(status('root-network'), 'open')
  assert.equal(data.get(legacy.LEGACY_SAVE_KEY), raw)
  assert.equal(data.has('talenttree-prototype'), false)
  m.save()
  assert.equal(JSON.parse(data.get('talenttree-prototype')).version, 3)
  assert.equal(data.get(legacy.LEGACY_SAVE_KEY), raw)
  // Once there is a new save, the legacy save is no longer read
  game.state.resources.oak = 1
  m.save()
  m.load()
  assert.equal(game.state.resources.oak, 1)
})

test('a demo migrates its own legacy save', () => {
  const data = useStorage({ [`${legacy.LEGACY_SAVE_KEY}-alt`]: JSON.stringify(danishV2()), [legacy.LEGACY_SAVE_KEY]: JSON.stringify({ version: 2, ressourcer: { eg: 3 } }) })
  m.useDemo('all')
  try {
    m.load()
    assert.equal(game.state.resources.oak, 37)
    m.save()
    assert.ok(data.has('talenttree-prototype-all'))
    assert.equal(data.has('talenttree-prototype'), false)
  } finally {
    m.useDemo(null)
  }
  m.load()
  assert.equal(game.state.resources.oak, 3)
})

test('reset does not bring the legacy save back', () => {
  const raw = JSON.stringify(danishV2())
  const data = useStorage({ [legacy.LEGACY_SAVE_KEY]: raw })
  m.load()
  assert.equal(game.state.resources.oak, 37)
  m.reset()
  assert.equal(game.state.resources.oak, 0)
  m.load()
  assert.equal(game.state.resources.oak, 0)
  assert.equal(data.get(legacy.LEGACY_SAVE_KEY), raw)
})

test('a save of an unknown version is backed up and a fresh game starts', () => {
  const raw = JSON.stringify({ version: 99, resources: { oak: 5 } })
  const data = useStorage({ 'talenttree-prototype': raw, [legacy.LEGACY_SAVE_KEY]: JSON.stringify(danishV2()) })
  m.load()
  assert.equal(data.get('talenttree-prototype-backup'), raw)
  assert.equal(data.get('talenttree-prototype'), raw)
  assert.equal(game.state.version, 3)
  assert.equal(game.state.resources.oak, 0)
  // A legacy save of an unknown version starts a fresh game too and stays where it is
  const data2 = useStorage({ [legacy.LEGACY_SAVE_KEY]: '{"version":99}' })
  m.load()
  assert.equal(game.state.resources.oak, 0)
  assert.equal(data2.get(legacy.LEGACY_SAVE_KEY), '{"version":99}')
  assert.equal(data2.size, 1)
})

test('the legacy id maps cover every current id and state field', () => {
  const values = map => Object.values(map).sort()
  assert.deepEqual(values(legacy.NODES), NODES.map(n => n.id).sort())
  assert.deepEqual(values(legacy.RESOURCES), Object.keys(RESOURCES).sort())
  assert.deepEqual(values(legacy.SKILLS), Object.keys(SKILLS).sort())
  assert.deepEqual(values(legacy.SLOTS), Object.keys(SLOTS).sort())
  assert.deepEqual(values(legacy.CLUSTERS), Object.keys(CLUSTERS).sort())
  assert.deepEqual(values(legacy.MILESTONES), m.MILESTONES.map(ms => ms.id).sort())
  assert.deepEqual(values(legacy.COUNTERS), Object.keys(game.state.counters).sort())
  assert.deepEqual(values(legacy.STATE_FIELDS), Object.keys(game.state).sort())
  game.state.hp = 50
  m.startActivity('rat')
  assert.deepEqual(values(legacy.ACTIVITY_FIELDS), [...Object.keys(game.state.activity), 't'].sort())
})
