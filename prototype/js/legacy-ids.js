// Danish ids from save version 2 and earlier, mapped to the English ids used since version 3.
// Only used to migrate old saves. Keep this file unchanged once released.

export const LEGACY_SAVE_KEY = 'talenttrae-prototype-v1'

export const SKILLS = {
  traefaeldning: 'woodcutting',
  minedrift: 'mining',
  smedje: 'smithing',
  kamp: 'combat',
}

export const RESOURCES = {
  eg: 'oak',
  pil: 'willow',
  ask: 'ash',
  kobbermalm: 'copper-ore',
  jernmalm: 'iron-ore',
  kobberbarre: 'copper-bar',
  jernbarre: 'iron-bar',
  rottehale: 'rat-tail',
  laeder: 'leather',
  ulveskind: 'wolf-pelt',
}

export const SLOTS = {
  vaaben: 'weapon',
  hoved: 'head',
  bryst: 'chest',
  ben: 'legs',
  foedder: 'boots',
}

export const CLUSTERS = {
  traefaeldning: 'woodcutting',
  minedrift: 'mining',
  smedje: 'smithing',
  kamp: 'combat',
  hjemmebase: 'home-base',
  'den-hule-eg': 'hollow-oak',
  druide: 'druid',
  skovbrug: 'forestry',
}

export const NODES = {
  eg: 'oak',
  'skarp-oekse': 'sharp-axe',
  'rigelig-hoest': 'bountiful-harvest',
  pil: 'willow',
  'smidig-faeldning': 'nimble-felling',
  grenrigdom: 'rich-branches',
  ask: 'ash',
  kobbermalm: 'copper-ore',
  'haard-hakke': 'hard-pick',
  'rig-aare': 'rich-vein',
  jernmalm: 'iron-ore',
  'tung-hakke': 'heavy-pick',
  'dyb-aare': 'deep-vein',
  'smelt-kobber': 'smelt-copper',
  'smelt-jern': 'smelt-iron',
  'varm-ovn': 'hot-furnace',
  'sparsom-fyring': 'thrifty-stoking',
  kobbersvaerd: 'copper-sword',
  kobberhjelm: 'copper-helm',
  kobberbrystplade: 'copper-chestplate',
  kobberbenskinner: 'copper-greaves',
  kobberstoevler: 'copper-boots',
  jernsvaerd: 'iron-sword',
  jernhjelm: 'iron-helm',
  jernbrystplade: 'iron-chestplate',
  jernbenskinner: 'iron-greaves',
  jernstoevler: 'iron-boots',
  'slot-vaaben': 'slot-weapon',
  'slot-hoved': 'slot-head',
  'slot-bryst': 'slot-chest',
  'slot-ben': 'slot-legs',
  'slot-foedder': 'slot-boots',
  'socket-1': 'socket-1',
  'socket-2': 'socket-2',
  tilbygning: 'extension',
  sav: 'saw',
  malmvogn: 'ore-cart',
  slibesten: 'whetstone',
  baalplads: 'campfire',
  blaesebaelg: 'bellows',
  rotte: 'rat',
  goblin: 'goblin',
  ulv: 'wolf',
  styrke: 'strength',
  'hurtige-haender': 'quick-hands',
  'kritisk-slag': 'critical-strike',
  udholdenhed: 'endurance',
  forsvar: 'defense',
  barkbille: 'bark-beetle',
  mosklump: 'moss-lump',
  'rasende-egern': 'raging-squirrel',
  'traeets-vogter': 'tree-guardian',
  rodnet: 'root-network',
  tornehud: 'thornskin',
  urtemedicin: 'herbal-medicine',
  'druide-ukendt': 'druid-unknown',
  'plant-et-trae': 'plant-a-tree',
  'baeredygtig-faeldning': 'sustainable-felling',
}

export const MILESTONES = {
  'foerste-gear': 'first-gear',
  goblin: 'goblin',
  pil: 'willow',
  jernmalm: 'iron-ore',
  jernbarre: 'iron-bar',
  ulv: 'wolf',
  jernbrystplade: 'iron-chestplate',
  dungeon: 'dungeon',
  boss: 'boss',
  skovbrug: 'forestry',
  ask: 'ash',
}

export const COUNTERS = { egFaeldet: 'oakFelled' }

// Top-level fields of the saved state
export const STATE_FIELDS = {
  version: 'version',
  spilletid: 'playTime',
  offlinetid: 'offlineTime',
  gemtTid: 'savedAt',
  milepaele: 'milestones',
  ressourcer: 'resources',
  sete: 'seen',
  xp: 'xp',
  ranks: 'ranks',
  craftet: 'crafted',
  udrustet: 'equipped',
  bygget: 'built',
  sockets: 'sockets',
  tilbygning: 'extension',
  drab: 'kills',
  taellere: 'counters',
  besejret: 'defeated',
  afsloeret: 'revealed',
  opdagede: 'discovered',
  uset: 'unseen',
  hp: 'hp',
  genopliv: 'revive',
  aktivitet: 'activity',
}

// Fields of state.activity
export const ACTIVITY_FIELDS = {
  node: 'node',
  t: 't',
  kamp: 'combat',
  dungeon: 'dungeon',
  fjendeHp: 'enemyHp',
  fjendeT: 'enemyT',
  spillerT: 'playerT',
  respawn: 'respawn',
  urtT: 'herbT',
  drab: 'kills',
}

const GLYPHS = {
  'slot-vaaben': 'slot-weapon',
  'slot-hoved': 'slot-head',
  'slot-bryst': 'slot-chest',
  'slot-ben': 'slot-legs',
  'slot-foedder': 'slot-boots',
  'socket-bygning': 'socket-building',
  atk: 'atk',
  hp: 'hp',
  def: 'def',
  angrebstid: 'attack-time',
  xp: 'xp',
  kamppoint: 'combat-point',
  laas: 'lock',
  taage: 'fog',
  level: 'level',
  boss: 'boss',
  besejret: 'defeated',
  'ny-opdagelse': 'new-discovery',
  farmingomraade: 'farming-area',
  dungeon: 'dungeon',
  'kritisk-slag': 'critical-strike',
  drab: 'kill',
  nederlag: 'defeat',
  helbredelse: 'healing',
  varighed: 'duration',
  chance: 'chance',
  braendsel: 'fuel',
  torne: 'thorns',
}

// Asset folders and names: old folder → [new folder, name map]
export const ASSET_FOLDERS = {
  noder: ['nodes', NODES],
  ressourcer: ['resources', RESOURCES],
  glyffer: ['glyphs', GLYPHS],
  portraetter: ['portraits', { ...NODES, spiller: 'player' }],
  emblemer: ['emblems', CLUSTERS],
  baggrunde: ['backgrounds', { stjernehimmel: 'starfield', taage: 'fog', nebula: 'nebula', klyngesloer: 'cluster-veil', portraet: 'portrait' }],
  silhuetter: ['silhouettes', { bjergtinde: 'mountain-peak', ruin: 'ruin', taarn: 'tower', 'den-hule-eg': 'hollow-oak' }],
}

export function assetId(oldId) {
  const [folder, name] = oldId.split('/')
  const entry = ASSET_FOLDERS[folder]
  if (!entry || !(name in entry[1])) throw new Error(`Unknown legacy asset id: ${oldId}`)
  return `${entry[0]}/${entry[1][name]}`
}
