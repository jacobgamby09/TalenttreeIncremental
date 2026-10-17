// All texts in the prototype in one place, so the language can be changed.
import { RESOURCES, SKILLS, SLOTS } from './data.js'

export const num = (v, dec = 0) => Number(v).toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec })
export const sec = v => `${num(v, 1)} s`
export const pct = v => `${num(v * 100, 0)}%`
export const duration = s => {
  const h = Math.floor(s / 3600), min = Math.floor((s % 3600) / 60)
  if (h > 0) return `${h} h ${min} min`
  return min > 0 ? `${min} min` : `${Math.round(s)} s`
}

export const T = {
  title: 'Talent Tree',
  loading: 'Loading theme …',
  you: 'You',
  lvl: n => `Lvl ${n}`,
  xp: (n, of) => `${num(n)} / ${num(of)} XP`,
  combatPoints: n => (n === 1 ? '1 combat point' : `${n} combat points`),
  sockets: (n, of) => `${n}/${of} sockets`,
  monsters: n => (n === 1 ? '1 monster' : `${n} monsters`),
  resource: id => RESOURCES[id]?.name ?? id,
  skill: id => (id === 'smelting' ? 'Smelting' : SKILLS[id]?.name ?? id),
  slot: id => SLOTS[id] ?? id,

  types: {
    activity: 'Activity', modifier: 'Upgrade', gear: 'Gear', building: 'Building', slot: 'Gear slot',
    socket: 'Building socket', extension: 'Extension', monster: 'Monster', stat: 'Combat stat', passive: 'Discovery', unknown: 'Unknown',
  },

  requires: {
    skill: (s, l) => `Requires ${T.skill(s)} lvl ${l}`,
    boss: name => `Requires ${name} to be defeated`,
    stat: (name, p) => `Requires ${p} ${p === 1 ? 'point' : 'points'} in ${name}`,
    statShort: (name, p) => `${p} in ${name}`,
    kills: (plural, n, have) => `Becomes visible when ${n} ${plural.toLowerCase()} are defeated (${Math.min(have, n)}/${n})`,
    visibleSkill: (s, l) => `Becomes visible at ${T.skill(s)} lvl ${l}`,
  },

  btn: {
    start: 'Start', stop: 'Stop', fight: 'Fight', dungeon: 'Enter the dungeon', buy: 'Buy', craft: 'Craft', build: 'Build',
    equip: 'Equip', unequip: 'Unequip', place: 'Place in socket', remove: 'Remove', spendPoint: 'Spend combat point', close: 'Close',
    goTo: 'Go to', home: 'Home', dev: 'Developer', reset: 'Reset game',
  },

  info: {
    time: 'Time', xp: 'XP', gives: 'Gives', uses: 'Uses', price: 'Cost', effect: 'Effect', rank: (r, of) => `Rank ${r}/${of}`,
    rankLabel: 'Rank', max: 'Fully upgraded', crafted: 'Crafted', built: 'Built', active: 'Running', equipped: 'Equipped', empty: 'Empty',
    noGear: 'You have not crafted anything for this slot yet.', noBuildings: 'You have not built anything yet.',
    inSocket: 'Placed in a socket', vacant: 'Vacant', defeated: 'Defeated', unknown: 'Something is hidden here.',
    dungeonRun: 'The monsters come in order, and your HP carries over. If you fall, the dungeon starts over.',
    farming: 'When the monster dies, a new one appears automatically. Your HP carries over from fight to fight.',
    double: p => `${pct(p)} double`,
    dropLabel: 'Drop',
    drop: (name, chance) => `${pct(chance)} chance of ${name.toLowerCase()}`,
    estimateWin: s => `You win in about ${num(s)} s.`,
    estimateLose: s => `You lose after about ${num(s)} s.`,
    estimateDungeonWin: hp => `You clear the whole dungeon with about ${num(hp)} HP left.`,
    estimateDungeonLose: name => `You will probably fall at ${name}.`,
    yourStats: 'Your stats',
    points: n => `Unspent combat points: ${n}`,
    free: 'Free',
  },

  effect: {
    time: (value, targets) => `${value > 0 ? '+' : '−'}${num(Math.abs(value), 1)} s on ${targets} per rank`,
    double: (value, targets) => `+${pct(value)} chance of double ${targets} per rank`,
    fuel: value => `${pct(value)} chance of not using fuel per rank`,
    speed: (value, skill) => `${T.skill(skill)} ${pct(value)} faster`,
    atk: value => `+${value} ATK`,
    hpPerKill: value => `+${value} HP after each defeated monster`,
    stat: e => Object.entries(e).map(([k, v]) => ({ atk: `+${v} ATK per rank`, def: `+${v} DEF per rank`, hp: `+${v} max HP per rank`, time: `−${num(-v, 1)} s attack time per rank`, crit: `+${pct(v)} chance of double damage per rank` }[k])).join(', '),
    gear: s => Object.entries(s).map(([k, v]) => `+${v} ${k.toUpperCase()}`).join(', '),
    xpBonus: (value, skill) => `+${pct(value)} XP in ${T.skill(skill).toLowerCase()}`,
    thorns: value => `Enemies take ${value} damage when they hit you`,
    herbalMedicine: (value, interval) => `Heals ${pct(value)} HP every ${interval} s in combat`,
    sustainable: (xp, time) => `Oak gives +${xp} XP but takes ${num(time, 1)} s longer`,
    extension: 'Adds socket 3',
  },

  message: {
    levelUp: (skill, lvl) => `${T.skill(skill)} is now lvl ${lvl}`,
    missingResources: name => `Not enough resources for ${name.toLowerCase()}`,
    stopped: 'The activity has stopped',
    died: 'You were defeated. Your HP will be full again in 10 s.',
    dungeonLost: 'You fell in the dungeon and must start over',
    newDiscovery: name => `New discovery: ${name}`,
    newCluster: name => `A new cluster has appeared: ${name}`,
    bossDefeated: name => `${name} has been defeated`,
    crafted: name => `${name} has been crafted`,
    built: name => `${name} has been built`,
    revived: 'Your HP is full again',
  },

  bar: {
    combat: name => `Combat: ${name}`,
    dungeon: (name, i, of) => `The Hollow Oak: ${name} (${i}/${of})`,
    kills: n => `Kills ${n}`,
    goTo: 'Click to go there',
    waiting: 'Next monster …',
    dead: s => `Reviving in ${num(Math.ceil(s))} s`,
  },

  offline: {
    title: 'While you were away',
    away: time => `You were away for ${time}.`,
    capped: hours => `At most ${hours} hours are counted.`,
    activity: name => `Activity: ${name}`,
    stopped: 'The activity stopped along the way, for example because resources ran out.',
    died: 'You were defeated along the way and rested for the remaining time.',
    resources: 'Resources',
    levels: 'New levels',
    kills: 'Defeated monsters',
    reveals: n => (n === 1 ? 'Something new has appeared on the map.' : `${n} new things have appeared on the map.`),
    continue: 'Continue',
  },

  dev: {
    title: 'Developer',
    speed: 'Game speed',
    resources: '+100 of all resources',
    levels: '+1 level in all skills',
    reveal: 'Reveal all clusters',
    revealAll: 'Load: everything visible',
    revealAllConfirm: 'Replace your game with one where the whole map is visible? Use ?load=all in the address if you want to keep your own game.',
    note: 'Only for testing the prototype.',
    editor: 'Map editor',
  },

  editor: {
    title: 'Map editor',
    ready: 'Drag to edit. Nothing is saved until you press Save.',
    unsaved: 'Unsaved changes',
    saving: 'Saving …',
    saved: 'Saved to prototype/js/world.js',
    downloaded: 'No dev server, so the layout was downloaded as world.js. Put it in prototype/js/.',
    failed: m => `Could not save: ${m}`,
    invalid: m => `The layout is not valid: ${m}`,
    nothing: 'Nothing selected',
    selectedMany: n => `${n} nodes selected`,
    header: 'Header',
    size: 'size',
    start: 'Start',
    bend: 'bend',
    road: 'Road',
    save: 'Save',
    undo: 'Undo',
    exit: 'Exit editor',
    leaveUnsaved: 'Leave the editor without saving?',
    help: [
      'Drag nodes, headers, landmarks, road ends and the start marker.',
      'Drag the dot on an edge to bend it. Drag it back to the middle to straighten it.',
      'Shift+click selects several nodes. Shift+drag a header moves its whole cluster.',
      'Positions snap to 10 px. Hold Alt for free placement.',
      'Arrow keys nudge (Shift: 10 px). + and − resize a landmark.',
      'Ctrl+S saves. Ctrl+Z undoes.',
    ],
  },
}
