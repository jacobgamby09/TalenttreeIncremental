// Game data for the prototype. The numbers follow docs/prototype-nodes.md.
// Graphics are referenced only through asset ids from themes/asset-manifest.json.
// Positions on the map live in world.js, which the map editor writes.
import LAYOUT from './world.js'

export { LAYOUT }

export const PLAYER_BASE = { hp: 50, atk: 5, def: 2, time: 2.0 }
export const REVIVE_SEC = 10
export const RESPAWN_SEC = 0.8
// Offline progress counts at most this many hours, and only after at least a minute away
export const OFFLINE_MAX_HOURS = 8
export const OFFLINE_MIN_SEC = 60

export const xpToNext = lvl => Math.round(35 * 1.22 ** (lvl - 1))

export const SKILLS = {
  woodcutting: { name: 'Woodcutting', cluster: 'woodcutting' },
  mining: { name: 'Mining', cluster: 'mining' },
  smithing: { name: 'Smithing', cluster: 'smithing' },
  combat: { name: 'Combat', cluster: 'combat' },
}

export const RESOURCES = {
  oak: { name: 'Oak', icon: 'resources/oak', color: '#9B6A3C' },
  willow: { name: 'Willow', icon: 'resources/willow', color: '#A7A35A' },
  ash: { name: 'Ash', icon: 'resources/ash', color: '#D8D2C0' },
  'copper-ore': { name: 'Copper Ore', icon: 'resources/copper-ore', color: '#C8703A' },
  'iron-ore': { name: 'Iron Ore', icon: 'resources/iron-ore', color: '#8C9BB0' },
  'copper-bar': { name: 'Copper Bar', icon: 'resources/copper-bar', color: '#E07B3C' },
  'iron-bar': { name: 'Iron Bar', icon: 'resources/iron-bar', color: '#AAB8CC' },
  'rat-tail': { name: 'Rat Tail', icon: 'resources/rat-tail', color: '#D9A3A6' },
  leather: { name: 'Leather', icon: 'resources/leather', color: '#8A5A3A' },
  'wolf-pelt': { name: 'Wolf Pelt', icon: 'resources/wolf-pelt', color: '#9AA0A8' },
}

export const SLOTS = { weapon: 'Weapon', head: 'Head', chest: 'Chest', legs: 'Legs', boots: 'Boots' }

export const CLUSTERS = {
  woodcutting: { name: 'Woodcutting', skill: 'woodcutting', emblem: 'emblems/woodcutting' },
  mining: { name: 'Mining', skill: 'mining', emblem: 'emblems/mining' },
  smithing: { name: 'Smithing', skill: 'smithing', emblem: 'emblems/smithing' },
  combat: { name: 'Combat', skill: 'combat', emblem: 'emblems/combat' },
  'home-base': { name: 'Home Base', emblem: 'emblems/home-base' },
  'hollow-oak': { name: 'The Hollow Oak', emblem: 'emblems/hollow-oak', dungeon: true },
  druid: { name: 'Druid', emblem: 'emblems/druid', hidden: { boss: 'tree-guardian' }, fromNode: 'tree-guardian' },
  forestry: { name: 'Forestry', emblem: 'emblems/forestry', hidden: { counter: 'oakFelled', count: 300 }, fromNode: 'oak' },
}

const mod = (lvl, res, prices, effect) => ({ ranks: lvl.length, lvl, price: prices.map(n => ({ [res]: n })), effect })

export const NODES = [
  // Woodcutting
  { id: 'oak', cluster: 'woodcutting', type: 'activity', name: 'Oak', icon: 'nodes/oak',
    activity: { skill: 'woodcutting', time: 3.0, xp: 5, gives: { oak: 1 } } },
  { id: 'sharp-axe', cluster: 'woodcutting', type: 'modifier', name: 'Sharp Axe', icon: 'nodes/sharp-axe',
    modifier: mod([2, 4, 6], 'oak', [10, 25, 50], { type: 'time', targets: ['oak'], value: -0.2 }), skill: 'woodcutting' },
  { id: 'bountiful-harvest', cluster: 'woodcutting', type: 'modifier', name: 'Bountiful Harvest', icon: 'nodes/bountiful-harvest',
    modifier: mod([3, 5, 7], 'oak', [15, 30, 60], { type: 'double', targets: ['oak'], value: 0.1 }), skill: 'woodcutting' },
  { id: 'willow', cluster: 'woodcutting', type: 'activity', name: 'Willow', icon: 'nodes/willow',
    requires: [{ skill: 'woodcutting', lvl: 8 }], activity: { skill: 'woodcutting', time: 4.0, xp: 12, gives: { willow: 1 } } },
  { id: 'nimble-felling', cluster: 'woodcutting', type: 'modifier', name: 'Nimble Felling', icon: 'nodes/nimble-felling',
    modifier: mod([9, 11, 13], 'willow', [10, 25, 50], { type: 'time', targets: ['willow'], value: -0.3 }), skill: 'woodcutting' },
  { id: 'rich-branches', cluster: 'woodcutting', type: 'modifier', name: 'Rich Branches', icon: 'nodes/rich-branches',
    modifier: mod([10, 12, 14], 'willow', [15, 30, 60], { type: 'double', targets: ['willow'], value: 0.1 }), skill: 'woodcutting' },
  { id: 'ash', cluster: 'woodcutting', type: 'activity', name: 'Ash', icon: 'nodes/ash',
    requires: [{ skill: 'woodcutting', lvl: 15 }, { boss: 'tree-guardian' }], activity: { skill: 'woodcutting', time: 5.0, xp: 25, gives: { ash: 1 } } },

  // Mining
  { id: 'copper-ore', cluster: 'mining', type: 'activity', name: 'Copper Ore', icon: 'nodes/copper-ore',
    activity: { skill: 'mining', time: 3.0, xp: 5, gives: { 'copper-ore': 1 } } },
  { id: 'hard-pick', cluster: 'mining', type: 'modifier', name: 'Hard Pick', icon: 'nodes/hard-pick',
    modifier: mod([2, 4, 6], 'copper-ore', [10, 25, 50], { type: 'time', targets: ['copper-ore'], value: -0.2 }), skill: 'mining' },
  { id: 'rich-vein', cluster: 'mining', type: 'modifier', name: 'Rich Vein', icon: 'nodes/rich-vein',
    modifier: mod([3, 5, 7], 'copper-ore', [15, 30, 60], { type: 'double', targets: ['copper-ore'], value: 0.1 }), skill: 'mining' },
  { id: 'iron-ore', cluster: 'mining', type: 'activity', name: 'Iron Ore', icon: 'nodes/iron-ore',
    requires: [{ skill: 'mining', lvl: 8 }], activity: { skill: 'mining', time: 4.0, xp: 12, gives: { 'iron-ore': 1 } } },
  { id: 'heavy-pick', cluster: 'mining', type: 'modifier', name: 'Heavy Pick', icon: 'nodes/heavy-pick',
    modifier: mod([9, 11, 13], 'iron-ore', [10, 25, 50], { type: 'time', targets: ['iron-ore'], value: -0.3 }), skill: 'mining' },
  { id: 'deep-vein', cluster: 'mining', type: 'modifier', name: 'Deep Vein', icon: 'nodes/deep-vein',
    modifier: mod([10, 12, 14], 'iron-ore', [15, 30, 60], { type: 'double', targets: ['iron-ore'], value: 0.1 }), skill: 'mining' },

  // Smithing: smelting
  { id: 'smelt-copper', cluster: 'smithing', type: 'activity', name: 'Smelt Copper', icon: 'nodes/smelt-copper',
    activity: { skill: 'smithing', time: 3.0, xp: 4, uses: { 'copper-ore': 1, oak: 1 }, fuel: 'oak', gives: { 'copper-bar': 1 }, smelting: true } },
  { id: 'smelt-iron', cluster: 'smithing', type: 'activity', name: 'Smelt Iron', icon: 'nodes/smelt-iron',
    requires: [{ skill: 'smithing', lvl: 6 }], activity: { skill: 'smithing', time: 4.0, xp: 10, uses: { 'iron-ore': 1, willow: 1 }, fuel: 'willow', gives: { 'iron-bar': 1 }, smelting: true } },
  { id: 'hot-furnace', cluster: 'smithing', type: 'modifier', name: 'Hot Furnace', icon: 'nodes/hot-furnace',
    modifier: mod([2, 5, 8], 'copper-bar', [5, 10, 20], { type: 'time', targets: ['smelt-copper', 'smelt-iron'], value: -0.3 }), skill: 'smithing' },
  { id: 'thrifty-stoking', cluster: 'smithing', type: 'modifier', name: 'Thrifty Stoking', icon: 'nodes/thrifty-stoking',
    modifier: mod([7, 9], 'iron-bar', [3, 6], { type: 'fuel', value: 0.25 }), skill: 'smithing' },

  // Smithing: gear
  ...[
    ['copper-sword', 'Copper Sword', 'weapon', 1, { 'copper-bar': 4 }, { atk: 4 }, 20],
    ['copper-helm', 'Copper Helm', 'head', 1, { 'copper-bar': 2 }, { def: 1 }, 10],
    ['copper-chestplate', 'Copper Chestplate', 'chest', 3, { 'copper-bar': 5 }, { def: 3 }, 25],
    ['copper-greaves', 'Copper Greaves', 'legs', 2, { 'copper-bar': 3 }, { def: 2 }, 15],
    ['copper-boots', 'Copper Boots', 'boots', 4, { 'copper-bar': 2, leather: 3 }, { def: 1 }, 15],
    ['iron-sword', 'Iron Sword', 'weapon', 7, { 'iron-bar': 5 }, { atk: 9 }, 50],
    ['iron-helm', 'Iron Helm', 'head', 6, { 'iron-bar': 3 }, { def: 2 }, 30],
    ['iron-chestplate', 'Iron Chestplate', 'chest', 9, { 'iron-bar': 6 }, { def: 5 }, 60],
    ['iron-greaves', 'Iron Greaves', 'legs', 8, { 'iron-bar': 4 }, { def: 4 }, 40],
    ['iron-boots', 'Iron Boots', 'boots', 10, { 'iron-bar': 3, 'wolf-pelt': 3 }, { def: 2 }, 30],
  ].map(([id, name, slot, lvl, price, stats, xp]) => ({
    id, cluster: 'smithing', type: 'gear', name, icon: `nodes/${id}`,
    requires: lvl > 1 ? [{ skill: 'smithing', lvl }] : [], gear: { slot, price, stats, xp },
  })),

  // Home base: equipment, sockets and buildings
  ...Object.keys(SLOTS).map((slot, i) => ({
    id: `slot-${slot}`, cluster: 'home-base', type: 'slot', name: SLOTS[slot], icon: `glyphs/slot-${slot}`, glyph: true,
    slot,
  })),
  { id: 'socket-1', cluster: 'home-base', type: 'socket', name: 'Socket 1', icon: 'glyphs/socket-building', glyph: true, socket: 0 },
  { id: 'socket-2', cluster: 'home-base', type: 'socket', name: 'Socket 2', icon: 'glyphs/socket-building', glyph: true, socket: 1 },
  { id: 'extension', cluster: 'home-base', type: 'extension', name: 'Extension', icon: 'nodes/extension', socket: 2,
    extension: { price: { oak: 40, willow: 20, 'copper-bar': 10 } } },
  ...[
    ['saw', 'Saw', { oak: 20, 'copper-bar': 3 }, { type: 'speed', skill: 'woodcutting', value: 0.15 }],
    ['ore-cart', 'Ore Cart', { oak: 15, 'copper-bar': 5 }, { type: 'speed', skill: 'mining', value: 0.15 }],
    ['whetstone', 'Whetstone', { 'copper-ore': 15, 'copper-bar': 3 }, { type: 'atk', value: 2 }],
    ['campfire', 'Campfire', { oak: 30 }, { type: 'hpPerKill', value: 2 }],
    ['bellows', 'Bellows', { willow: 20, 'iron-bar': 4 }, { type: 'speed', skill: 'smelting', value: 0.25 }],
  ].map(([id, name, price, effect], i) => ({
    id, cluster: 'home-base', type: 'building', name, icon: `nodes/${id}`, building: { price, effect },
  })),

  // Combat: farming areas
  { id: 'rat', cluster: 'combat', type: 'monster', name: 'Rat', icon: 'portraits/rat', combatOffset: [-100, 0],
    monster: { plural: 'rats', hp: 12, atk: 3, def: 0, time: 1.5, xp: 4, drop: { resource: 'rat-tail', chance: 0.3 }, farming: true } },
  { id: 'goblin', cluster: 'combat', type: 'monster', name: 'Goblin', icon: 'portraits/goblin', combatOffset: [-100, 0],
    visibleWhen: { kills: { rat: 10 } },
    monster: { plural: 'goblins', hp: 30, atk: 8, def: 2, time: 2.2, xp: 12, drop: { resource: 'leather', chance: 0.4 }, farming: true } },
  { id: 'wolf', cluster: 'combat', type: 'monster', name: 'Wolf', icon: 'portraits/wolf', combatOffset: [-100, 0],
    visibleWhen: { kills: { goblin: 15 } },
    monster: { plural: 'wolves', hp: 45, atk: 12, def: 3, time: 1.6, xp: 22, drop: { resource: 'wolf-pelt', chance: 0.35 }, farming: true } },

  // Combat: stat nodes
  { id: 'strength', cluster: 'combat', type: 'stat', name: 'Strength', icon: 'nodes/strength', stat: { ranks: 5, effect: { atk: 1 } } },
  { id: 'quick-hands', cluster: 'combat', type: 'stat', name: 'Quick Hands', icon: 'nodes/quick-hands',
    requires: [{ stat: 'strength', points: 3 }], stat: { ranks: 3, effect: { time: -0.1 } } },
  { id: 'critical-strike', cluster: 'combat', type: 'stat', name: 'Critical Strike', icon: 'nodes/critical-strike',
    requires: [{ stat: 'quick-hands', points: 2 }], stat: { ranks: 3, effect: { crit: 0.05 } } },
  { id: 'endurance', cluster: 'combat', type: 'stat', name: 'Endurance', icon: 'nodes/endurance', stat: { ranks: 5, effect: { hp: 8 } } },
  { id: 'defense', cluster: 'combat', type: 'stat', name: 'Defense', icon: 'nodes/defense', stat: { ranks: 5, effect: { def: 1 } } },

  // Dungeon: The Hollow Oak
  ...[
    ['bark-beetle', 'Bark Beetle', { plural: 'bark beetles', hp: 30, atk: 14, def: 4, time: 1.8, xp: 15 }],
    ['moss-lump', 'Moss Lump', { plural: 'moss lumps', hp: 45, atk: 16, def: 7, time: 2.4, xp: 20 }],
    ['raging-squirrel', 'Raging Squirrel', { plural: 'raging squirrels', hp: 35, atk: 18, def: 3, time: 1.2, xp: 18 }],
    ['tree-guardian', 'Tree Guardian', { plural: 'tree guardians', hp: 160, atk: 26, def: 8, time: 2.8, xp: 150, boss: true }],
  ].map(([id, name, monster], index) => ({
    id, cluster: 'hollow-oak', type: 'monster', name, icon: `portraits/${id}`, combatOffset: [0, monster.boss ? 140 : 125],
    visibleWhen: { skill: 'woodcutting', lvl: 12 }, dungeon: { id: 'hollow-oak', index }, monster,
  })),

  // Druid (hidden until the Tree Guardian is defeated)
  { id: 'root-network', cluster: 'druid', type: 'passive', name: 'Root Network', icon: 'nodes/root-network',
    passive: { ranks: 1, price: [{}], effect: { type: 'xpBonus', skill: 'woodcutting', value: 0.1 } } },
  { id: 'thornskin', cluster: 'druid', type: 'passive', name: 'Thornskin', icon: 'nodes/thornskin',
    passive: { ranks: 1, price: [{ willow: 30, 'wolf-pelt': 5 }], effect: { type: 'thorns', value: 2 } } },
  { id: 'herbal-medicine', cluster: 'druid', type: 'passive', name: 'Herbal Medicine', icon: 'nodes/herbal-medicine',
    passive: { ranks: 1, price: [{ 'rat-tail': 10 }], effect: { type: 'herbalMedicine', value: 0.15, interval: 20 } } },
  { id: 'druid-unknown', cluster: 'druid', type: 'unknown', name: 'Unknown', icon: 'glyphs/fog', glyph: true },

  // Forestry (hidden until 300 oak have been felled)
  { id: 'plant-a-tree', cluster: 'forestry', type: 'passive', name: 'Plant a Tree', icon: 'nodes/plant-a-tree',
    passive: { ranks: 10, price: Array(10).fill({ oak: 25 }), effect: { type: 'xpBonus', skill: 'woodcutting', value: 0.01 } } },
  { id: 'sustainable-felling', cluster: 'forestry', type: 'passive', name: 'Sustainable Felling', icon: 'nodes/sustainable-felling',
    passive: { ranks: 1, price: [{ oak: 50 }], effect: { type: 'sustainable', xp: 2, time: 0.2 } } },
]

export const EDGES = [
  ['oak', 'sharp-axe'], ['oak', 'bountiful-harvest'], ['oak', 'willow'], ['willow', 'nimble-felling'], ['willow', 'rich-branches'], ['willow', 'ash'],
  ['ash', 'bark-beetle'], ['bark-beetle', 'moss-lump'], ['moss-lump', 'raging-squirrel'], ['raging-squirrel', 'tree-guardian'],
  ['tree-guardian', 'thornskin'], ['root-network', 'thornskin'], ['thornskin', 'herbal-medicine'], ['thornskin', 'druid-unknown'],
  ['plant-a-tree', 'sustainable-felling'],
  ['copper-ore', 'hard-pick'], ['copper-ore', 'rich-vein'], ['copper-ore', 'iron-ore'], ['iron-ore', 'heavy-pick'], ['iron-ore', 'deep-vein'],
  ['smelt-copper', 'hot-furnace'], ['smelt-copper', 'smelt-iron'], ['hot-furnace', 'thrifty-stoking'], ['smelt-iron', 'thrifty-stoking'],
  ['smelt-copper', 'copper-sword'], ['smelt-iron', 'iron-sword'],
  ['copper-sword', 'copper-helm'], ['copper-helm', 'copper-chestplate'], ['copper-chestplate', 'copper-greaves'], ['copper-greaves', 'copper-boots'],
  ['iron-sword', 'iron-helm'], ['iron-helm', 'iron-chestplate'], ['iron-chestplate', 'iron-greaves'], ['iron-greaves', 'iron-boots'],
  ['copper-sword', 'iron-sword'], ['copper-helm', 'iron-helm'], ['copper-chestplate', 'iron-chestplate'], ['copper-greaves', 'iron-greaves'], ['copper-boots', 'iron-boots'],
  ['slot-weapon', 'slot-head'], ['slot-head', 'slot-chest'], ['slot-chest', 'slot-legs'], ['slot-legs', 'slot-boots'],
  ['socket-1', 'socket-2'], ['socket-2', 'extension'], ['slot-chest', 'socket-2'],
  ['socket-1', 'ore-cart'], ['socket-2', 'whetstone'], ['extension', 'campfire'],
  ['saw', 'ore-cart'], ['ore-cart', 'whetstone'], ['whetstone', 'campfire'], ['campfire', 'bellows'],
  ['rat', 'goblin'], ['goblin', 'wolf'],
  ['strength', 'quick-hands'], ['quick-hands', 'critical-strike'], ['strength', 'endurance'], ['endurance', 'defense'],
]

// Positions come from the layout file, which the map editor writes
for (const n of NODES) {
  n.pos = LAYOUT.nodes[n.id]
  if (!n.pos) throw new Error(`world.js has no position for node ${n.id}`)
}
for (const [id, c] of Object.entries(CLUSTERS)) {
  c.header = LAYOUT.headers[id]
  if (!c.header) throw new Error(`world.js has no header position for cluster ${id}`)
}
export const edgeKey = (a, b) => `${a}|${b}`
export const edgeBend = (a, b) => LAYOUT.bends[edgeKey(a, b)] ?? 0

// Faint lines between the clusters, decoration only: [from, to, bend]
export const ROADS = LAYOUT.roads

// Silhouettes in the fog; position and size are in the layout
const landmark = (id, asset, until) => ({
  id, asset, until,
  get pos() { return LAYOUT.landmarks[id].pos },
  get size() { return LAYOUT.landmarks[id].size },
})
export const LANDMARKS = [
  landmark('hollow-oak', 'silhouettes/hollow-oak', { skill: 'woodcutting', lvl: 12 }),
  landmark('mountain-peak', 'silhouettes/mountain-peak'),
  landmark('ruin', 'silhouettes/ruin'),
  landmark('tower', 'silhouettes/tower'),
]

export const WORLD = {
  get width() { return LAYOUT.size[0] },
  get height() { return LAYOUT.size[1] },
  get start() { return LAYOUT.start },
}

export const START_NODES = new Set(['oak', 'copper-ore', 'smelt-copper', 'rat'])
