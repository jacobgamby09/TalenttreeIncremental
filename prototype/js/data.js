// Spildata for prototypen. Tallene følger dokumentation/prototype-noder.md.
// Grafik henvises kun via asset-id'er fra temaer/asset-manifest.json.

export const SPILLER_BASIS = { hp: 50, atk: 5, def: 2, tid: 2.0 }
export const GENOPLIV_SEK = 10
export const RESPAWN_SEK = 0.8
// Offline progress tæller højst så mange timer med, og kun hvis man har været væk i mindst et minut
export const OFFLINE_MAKS_TIMER = 8
export const OFFLINE_MIN_SEK = 60

export const xpTilNaeste = lvl => Math.round(35 * 1.22 ** (lvl - 1))

export const SKILLS = {
  traefaeldning: { navn: 'Træfældning', klynge: 'traefaeldning' },
  minedrift: { navn: 'Minedrift', klynge: 'minedrift' },
  smedje: { navn: 'Smedje', klynge: 'smedje' },
  kamp: { navn: 'Kamp', klynge: 'kamp' },
}

export const RESSOURCER = {
  eg: { navn: 'Eg', ikon: 'ressourcer/eg', farve: '#9B6A3C' },
  pil: { navn: 'Pil', ikon: 'ressourcer/pil', farve: '#A7A35A' },
  ask: { navn: 'Ask', ikon: 'ressourcer/ask', farve: '#D8D2C0' },
  kobbermalm: { navn: 'Kobbermalm', ikon: 'ressourcer/kobbermalm', farve: '#C8703A' },
  jernmalm: { navn: 'Jernmalm', ikon: 'ressourcer/jernmalm', farve: '#8C9BB0' },
  kobberbarre: { navn: 'Kobberbarre', ikon: 'ressourcer/kobberbarre', farve: '#E07B3C' },
  jernbarre: { navn: 'Jernbarre', ikon: 'ressourcer/jernbarre', farve: '#AAB8CC' },
  rottehale: { navn: 'Rottehale', ikon: 'ressourcer/rottehale', farve: '#D9A3A6' },
  laeder: { navn: 'Læder', ikon: 'ressourcer/laeder', farve: '#8A5A3A' },
  ulveskind: { navn: 'Ulveskind', ikon: 'ressourcer/ulveskind', farve: '#9AA0A8' },
}

export const SLOTS = { vaaben: 'Våben', hoved: 'Hoved', bryst: 'Bryst', ben: 'Ben', foedder: 'Fødder' }

export const KLYNGER = {
  traefaeldning: { navn: 'Træfældning', skill: 'traefaeldning', overskrift: [1180, 650], emblem: 'emblemer/traefaeldning' },
  minedrift: { navn: 'Minedrift', skill: 'minedrift', overskrift: [2960, 650], emblem: 'emblemer/minedrift' },
  smedje: { navn: 'Smedje', skill: 'smedje', overskrift: [3060, 1225], emblem: 'emblemer/smedje' },
  kamp: { navn: 'Kamp', skill: 'kamp', overskrift: [2140, 1850], emblem: 'emblemer/kamp' },
  hjemmebase: { navn: 'Hjemmebase', overskrift: [2100, 1120], emblem: 'emblemer/hjemmebase' },
  'den-hule-eg': { navn: 'Den hule eg', overskrift: [620, 975], emblem: 'emblemer/den-hule-eg', dungeon: true },
  druide: { navn: 'Druide', overskrift: [360, 1310], emblem: 'emblemer/druide', skjult: { boss: 'traeets-vogter' }, fraNode: 'traeets-vogter', center: [360, 1470] },
  skovbrug: { navn: 'Skovbrug', overskrift: [1410, 370], emblem: 'emblemer/skovbrug', skjult: { taeller: 'egFaeldet', antal: 300 }, fraNode: 'eg', center: [1410, 460] },
}

const mod = (lvl, res, priser, effekt) => ({ ranks: lvl.length, lvl, pris: priser.map(n => ({ [res]: n })), effekt })

export const NODER = [
  // Træfældning
  { id: 'eg', klynge: 'traefaeldning', type: 'aktivitet', navn: 'Eg', ikon: 'noder/eg', pos: [1400, 850],
    aktivitet: { skill: 'traefaeldning', tid: 3.0, xp: 5, giver: { eg: 1 } } },
  { id: 'skarp-oekse', klynge: 'traefaeldning', type: 'modifier', navn: 'Skarp økse', ikon: 'noder/skarp-oekse', pos: [1310, 760],
    modifier: mod([2, 4, 6], 'eg', [10, 25, 50], { type: 'tid', maal: ['eg'], pr: -0.2 }), skill: 'traefaeldning' },
  { id: 'rigelig-hoest', klynge: 'traefaeldning', type: 'modifier', navn: 'Rigelig høst', ikon: 'noder/rigelig-hoest', pos: [1310, 940],
    modifier: mod([3, 5, 7], 'eg', [15, 30, 60], { type: 'dobbelt', maal: ['eg'], pr: 0.1 }), skill: 'traefaeldning' },
  { id: 'pil', klynge: 'traefaeldning', type: 'aktivitet', navn: 'Pil', ikon: 'noder/pil', pos: [1180, 850],
    krav: [{ skill: 'traefaeldning', lvl: 8 }], aktivitet: { skill: 'traefaeldning', tid: 4.0, xp: 12, giver: { pil: 1 } } },
  { id: 'smidig-faeldning', klynge: 'traefaeldning', type: 'modifier', navn: 'Smidig fældning', ikon: 'noder/smidig-faeldning', pos: [1090, 760],
    modifier: mod([9, 11, 13], 'pil', [10, 25, 50], { type: 'tid', maal: ['pil'], pr: -0.3 }), skill: 'traefaeldning' },
  { id: 'grenrigdom', klynge: 'traefaeldning', type: 'modifier', navn: 'Grenrigdom', ikon: 'noder/grenrigdom', pos: [1090, 940],
    modifier: mod([10, 12, 14], 'pil', [15, 30, 60], { type: 'dobbelt', maal: ['pil'], pr: 0.1 }), skill: 'traefaeldning' },
  { id: 'ask', klynge: 'traefaeldning', type: 'aktivitet', navn: 'Ask', ikon: 'noder/ask', pos: [960, 850],
    krav: [{ skill: 'traefaeldning', lvl: 15 }, { boss: 'traeets-vogter' }], aktivitet: { skill: 'traefaeldning', tid: 5.0, xp: 25, giver: { ask: 1 } } },

  // Minedrift
  { id: 'kobbermalm', klynge: 'minedrift', type: 'aktivitet', navn: 'Kobbermalm', ikon: 'noder/kobbermalm', pos: [2800, 850],
    aktivitet: { skill: 'minedrift', tid: 3.0, xp: 5, giver: { kobbermalm: 1 } } },
  { id: 'haard-hakke', klynge: 'minedrift', type: 'modifier', navn: 'Hård hakke', ikon: 'noder/haard-hakke', pos: [2890, 760],
    modifier: mod([2, 4, 6], 'kobbermalm', [10, 25, 50], { type: 'tid', maal: ['kobbermalm'], pr: -0.2 }), skill: 'minedrift' },
  { id: 'rig-aare', klynge: 'minedrift', type: 'modifier', navn: 'Rig åre', ikon: 'noder/rig-aare', pos: [2890, 940],
    modifier: mod([3, 5, 7], 'kobbermalm', [15, 30, 60], { type: 'dobbelt', maal: ['kobbermalm'], pr: 0.1 }), skill: 'minedrift' },
  { id: 'jernmalm', klynge: 'minedrift', type: 'aktivitet', navn: 'Jernmalm', ikon: 'noder/jernmalm', pos: [3020, 850],
    krav: [{ skill: 'minedrift', lvl: 8 }], aktivitet: { skill: 'minedrift', tid: 4.0, xp: 12, giver: { jernmalm: 1 } } },
  { id: 'tung-hakke', klynge: 'minedrift', type: 'modifier', navn: 'Tung hakke', ikon: 'noder/tung-hakke', pos: [3110, 760],
    modifier: mod([9, 11, 13], 'jernmalm', [10, 25, 50], { type: 'tid', maal: ['jernmalm'], pr: -0.3 }), skill: 'minedrift' },
  { id: 'dyb-aare', klynge: 'minedrift', type: 'modifier', navn: 'Dyb åre', ikon: 'noder/dyb-aare', pos: [3110, 940],
    modifier: mod([10, 12, 14], 'jernmalm', [15, 30, 60], { type: 'dobbelt', maal: ['jernmalm'], pr: 0.1 }), skill: 'minedrift' },

  // Smedje: smeltning
  { id: 'smelt-kobber', klynge: 'smedje', type: 'aktivitet', navn: 'Smelt kobber', ikon: 'noder/smelt-kobber', pos: [2760, 1340],
    aktivitet: { skill: 'smedje', tid: 3.0, xp: 4, bruger: { kobbermalm: 1, eg: 1 }, braendsel: 'eg', giver: { kobberbarre: 1 }, smeltning: true } },
  { id: 'smelt-jern', klynge: 'smedje', type: 'aktivitet', navn: 'Smelt jern', ikon: 'noder/smelt-jern', pos: [2760, 1500],
    krav: [{ skill: 'smedje', lvl: 6 }], aktivitet: { skill: 'smedje', tid: 4.0, xp: 10, bruger: { jernmalm: 1, pil: 1 }, braendsel: 'pil', giver: { jernbarre: 1 }, smeltning: true } },
  { id: 'varm-ovn', klynge: 'smedje', type: 'modifier', navn: 'Varm ovn', ikon: 'noder/varm-ovn', pos: [2660, 1420],
    modifier: mod([2, 5, 8], 'kobberbarre', [5, 10, 20], { type: 'tid', maal: ['smelt-kobber', 'smelt-jern'], pr: -0.3 }), skill: 'smedje' },
  { id: 'sparsom-fyring', klynge: 'smedje', type: 'modifier', navn: 'Sparsom fyring', ikon: 'noder/sparsom-fyring', pos: [2660, 1580],
    modifier: mod([7, 9], 'jernbarre', [3, 6], { type: 'braendsel', pr: 0.25 }), skill: 'smedje' },

  // Smedje: gear
  ...[
    ['kobbersvaerd', 'Kobbersværd', 'vaaben', 1, { kobberbarre: 4 }, { atk: 4 }, 20, [2880, 1340]],
    ['kobberhjelm', 'Kobberhjelm', 'hoved', 1, { kobberbarre: 2 }, { def: 1 }, 10, [3000, 1340]],
    ['kobberbrystplade', 'Kobberbrystplade', 'bryst', 3, { kobberbarre: 5 }, { def: 3 }, 25, [3120, 1340]],
    ['kobberbenskinner', 'Kobberbenskinner', 'ben', 2, { kobberbarre: 3 }, { def: 2 }, 15, [3240, 1340]],
    ['kobberstoevler', 'Kobberstøvler', 'foedder', 4, { kobberbarre: 2, laeder: 3 }, { def: 1 }, 15, [3360, 1340]],
    ['jernsvaerd', 'Jernsværd', 'vaaben', 7, { jernbarre: 5 }, { atk: 9 }, 50, [2880, 1500]],
    ['jernhjelm', 'Jernhjelm', 'hoved', 6, { jernbarre: 3 }, { def: 2 }, 30, [3000, 1500]],
    ['jernbrystplade', 'Jernbrystplade', 'bryst', 9, { jernbarre: 6 }, { def: 5 }, 60, [3120, 1500]],
    ['jernbenskinner', 'Jernbenskinner', 'ben', 8, { jernbarre: 4 }, { def: 4 }, 40, [3240, 1500]],
    ['jernstoevler', 'Jernstøvler', 'foedder', 10, { jernbarre: 3, ulveskind: 3 }, { def: 2 }, 30, [3360, 1500]],
  ].map(([id, navn, slot, lvl, pris, stats, xp, pos]) => ({
    id, klynge: 'smedje', type: 'gear', navn, ikon: `noder/${id}`, pos,
    krav: lvl > 1 ? [{ skill: 'smedje', lvl }] : [], gear: { slot, pris, stats, xp },
  })),

  // Hjemmebase: udrustning, sockets og bygninger
  ...Object.keys(SLOTS).map((slot, i) => ({
    id: `slot-${slot}`, klynge: 'hjemmebase', type: 'slot', navn: SLOTS[slot], ikon: `glyffer/slot-${slot}`, glyf: true,
    pos: [1940 + i * 80, 1220], slot,
  })),
  { id: 'socket-1', klynge: 'hjemmebase', type: 'socket', navn: 'Socket 1', ikon: 'glyffer/socket-bygning', glyf: true, pos: [2020, 1360], socket: 0 },
  { id: 'socket-2', klynge: 'hjemmebase', type: 'socket', navn: 'Socket 2', ikon: 'glyffer/socket-bygning', glyf: true, pos: [2100, 1360], socket: 1 },
  { id: 'tilbygning', klynge: 'hjemmebase', type: 'tilbygning', navn: 'Tilbygning', ikon: 'noder/tilbygning', pos: [2180, 1360], socket: 2,
    tilbygning: { pris: { eg: 40, pil: 20, kobberbarre: 10 } } },
  ...[
    ['sav', 'Sav', { eg: 20, kobberbarre: 3 }, { type: 'fart', skill: 'traefaeldning', pr: 0.15 }],
    ['malmvogn', 'Malmvogn', { eg: 15, kobberbarre: 5 }, { type: 'fart', skill: 'minedrift', pr: 0.15 }],
    ['slibesten', 'Slibesten', { kobbermalm: 15, kobberbarre: 3 }, { type: 'atk', pr: 2 }],
    ['baalplads', 'Bålplads', { eg: 30 }, { type: 'hpPrDrab', pr: 2 }],
    ['blaesebaelg', 'Blæsebælg', { pil: 20, jernbarre: 4 }, { type: 'fart', skill: 'smeltning', pr: 0.25 }],
  ].map(([id, navn, pris, effekt], i) => ({
    id, klynge: 'hjemmebase', type: 'bygning', navn, ikon: `noder/${id}`, pos: [1940 + i * 80, 1500], bygning: { pris, effekt },
  })),

  // Kamp: farmingområder
  { id: 'rotte', klynge: 'kamp', type: 'monster', navn: 'Rotte', ikon: 'portraetter/rotte', pos: [1920, 1980], kampPlads: [-100, 0],
    monster: { flertal: 'rotter', hp: 12, atk: 3, def: 0, tid: 1.5, xp: 4, drop: { ressource: 'rottehale', chance: 0.3 }, farming: true } },
  { id: 'goblin', klynge: 'kamp', type: 'monster', navn: 'Goblin', ikon: 'portraetter/goblin', pos: [2140, 1980], kampPlads: [-100, 0],
    synligKrav: { drab: { rotte: 10 } },
    monster: { flertal: 'goblins', hp: 30, atk: 8, def: 2, tid: 2.2, xp: 12, drop: { ressource: 'laeder', chance: 0.4 }, farming: true } },
  { id: 'ulv', klynge: 'kamp', type: 'monster', navn: 'Ulv', ikon: 'portraetter/ulv', pos: [2360, 1980], kampPlads: [-100, 0],
    synligKrav: { drab: { goblin: 15 } },
    monster: { flertal: 'ulve', hp: 45, atk: 12, def: 3, tid: 1.6, xp: 22, drop: { ressource: 'ulveskind', chance: 0.35 }, farming: true } },

  // Kamp: stat-nodes
  { id: 'styrke', klynge: 'kamp', type: 'stat', navn: 'Styrke', ikon: 'noder/styrke', pos: [1900, 2200], stat: { ranks: 5, effekt: { atk: 1 } } },
  { id: 'hurtige-haender', klynge: 'kamp', type: 'stat', navn: 'Hurtige hænder', ikon: 'noder/hurtige-haender', pos: [1900, 2320],
    krav: [{ stat: 'styrke', point: 3 }], stat: { ranks: 3, effekt: { tid: -0.1 } } },
  { id: 'kritisk-slag', klynge: 'kamp', type: 'stat', navn: 'Kritisk slag', ikon: 'noder/kritisk-slag', pos: [1900, 2440],
    krav: [{ stat: 'hurtige-haender', point: 2 }], stat: { ranks: 3, effekt: { crit: 0.05 } } },
  { id: 'udholdenhed', klynge: 'kamp', type: 'stat', navn: 'Udholdenhed', ikon: 'noder/udholdenhed', pos: [2040, 2200], stat: { ranks: 5, effekt: { hp: 8 } } },
  { id: 'forsvar', klynge: 'kamp', type: 'stat', navn: 'Forsvar', ikon: 'noder/forsvar', pos: [2180, 2200], stat: { ranks: 5, effekt: { def: 1 } } },

  // Dungeon: Den hule eg
  ...[
    ['barkbille', 'Barkbille', [900, 1090], { flertal: 'barkbiller', hp: 30, atk: 14, def: 4, tid: 1.8, xp: 15 }],
    ['mosklump', 'Mosklump', [720, 1090], { flertal: 'mosklumper', hp: 45, atk: 16, def: 7, tid: 2.4, xp: 20 }],
    ['rasende-egern', 'Rasende egern', [540, 1090], { flertal: 'rasende egern', hp: 35, atk: 18, def: 3, tid: 1.2, xp: 18 }],
    ['traeets-vogter', 'Træets vogter', [340, 1090], { flertal: 'vogtere', hp: 160, atk: 26, def: 8, tid: 2.8, xp: 150, boss: true }],
  ].map(([id, navn, pos, monster], index) => ({
    id, klynge: 'den-hule-eg', type: 'monster', navn, ikon: `portraetter/${id}`, pos, kampPlads: [0, monster.boss ? 140 : 125],
    synligKrav: { skill: 'traefaeldning', lvl: 12 }, dungeon: { id: 'den-hule-eg', index }, monster,
  })),

  // Druide (skjult indtil Træets vogter er besejret)
  { id: 'rodnet', klynge: 'druide', type: 'passiv', navn: 'Rodnet', ikon: 'noder/rodnet', pos: [240, 1440],
    passiv: { ranks: 1, pris: [{}], effekt: { type: 'xpBonus', skill: 'traefaeldning', pr: 0.1 } } },
  { id: 'tornehud', klynge: 'druide', type: 'passiv', navn: 'Tornehud', ikon: 'noder/tornehud', pos: [360, 1440],
    passiv: { ranks: 1, pris: [{ pil: 30, ulveskind: 5 }], effekt: { type: 'torne', pr: 2 } } },
  { id: 'urtemedicin', klynge: 'druide', type: 'passiv', navn: 'Urtemedicin', ikon: 'noder/urtemedicin', pos: [480, 1440],
    passiv: { ranks: 1, pris: [{ rottehale: 10 }], effekt: { type: 'urtemedicin', pr: 0.15, interval: 20 } } },
  { id: 'druide-ukendt', klynge: 'druide', type: 'ukendt', navn: 'Ukendt', ikon: 'glyffer/taage', glyf: true, pos: [360, 1570] },

  // Skovbrug (skjult indtil 300 eg er fældet)
  { id: 'plant-et-trae', klynge: 'skovbrug', type: 'passiv', navn: 'Plant et træ', ikon: 'noder/plant-et-trae', pos: [1340, 470],
    passiv: { ranks: 10, pris: Array(10).fill({ eg: 25 }), effekt: { type: 'xpBonus', skill: 'traefaeldning', pr: 0.01 } } },
  { id: 'baeredygtig-faeldning', klynge: 'skovbrug', type: 'passiv', navn: 'Bæredygtig fældning', ikon: 'noder/baeredygtig-faeldning', pos: [1480, 470],
    passiv: { ranks: 1, pris: [{ eg: 50 }], effekt: { type: 'baeredygtig', xp: 2, tid: 0.2 } } },
]

export const KANTER = [
  ['eg', 'skarp-oekse'], ['eg', 'rigelig-hoest'], ['eg', 'pil'], ['pil', 'smidig-faeldning'], ['pil', 'grenrigdom'], ['pil', 'ask'],
  ['ask', 'barkbille'], ['barkbille', 'mosklump'], ['mosklump', 'rasende-egern'], ['rasende-egern', 'traeets-vogter'],
  ['traeets-vogter', 'tornehud'], ['rodnet', 'tornehud'], ['tornehud', 'urtemedicin'], ['tornehud', 'druide-ukendt'],
  ['plant-et-trae', 'baeredygtig-faeldning'],
  ['kobbermalm', 'haard-hakke'], ['kobbermalm', 'rig-aare'], ['kobbermalm', 'jernmalm'], ['jernmalm', 'tung-hakke'], ['jernmalm', 'dyb-aare'],
  ['smelt-kobber', 'varm-ovn'], ['smelt-kobber', 'smelt-jern'], ['varm-ovn', 'sparsom-fyring'], ['smelt-jern', 'sparsom-fyring'],
  ['smelt-kobber', 'kobbersvaerd'], ['smelt-jern', 'jernsvaerd'],
  ['kobbersvaerd', 'kobberhjelm'], ['kobberhjelm', 'kobberbrystplade'], ['kobberbrystplade', 'kobberbenskinner'], ['kobberbenskinner', 'kobberstoevler'],
  ['jernsvaerd', 'jernhjelm'], ['jernhjelm', 'jernbrystplade'], ['jernbrystplade', 'jernbenskinner'], ['jernbenskinner', 'jernstoevler'],
  ['kobbersvaerd', 'jernsvaerd'], ['kobberhjelm', 'jernhjelm'], ['kobberbrystplade', 'jernbrystplade'], ['kobberbenskinner', 'jernbenskinner'], ['kobberstoevler', 'jernstoevler'],
  ['slot-vaaben', 'slot-hoved'], ['slot-hoved', 'slot-bryst'], ['slot-bryst', 'slot-ben'], ['slot-ben', 'slot-foedder'],
  ['socket-1', 'socket-2'], ['socket-2', 'tilbygning'], ['slot-bryst', 'socket-2'],
  ['socket-1', 'malmvogn'], ['socket-2', 'slibesten'], ['tilbygning', 'baalplads'],
  ['sav', 'malmvogn'], ['malmvogn', 'slibesten'], ['slibesten', 'baalplads'], ['baalplads', 'blaesebaelg'],
  ['rotte', 'goblin'], ['goblin', 'ulv'],
  ['styrke', 'hurtige-haender'], ['hurtige-haender', 'kritisk-slag'], ['styrke', 'udholdenhed'], ['udholdenhed', 'forsvar'],
]

// Svage linjer mellem klyngerne, kun til pynt
export const VEJE = [
  [[2100, 1160], [1400, 900]], [[2100, 1160], [2800, 900]], [[2260, 1360], [2760, 1340]], [[2100, 1540], [2100, 1840]],
  [[960, 890], [900, 1050]],
]

export const LANDMAERKER = [
  { asset: 'silhuetter/den-hule-eg', pos: [620, 1010], str: 520, indtil: { skill: 'traefaeldning', lvl: 12 } },
  { asset: 'silhuetter/bjergtinde', pos: [3330, 520], str: 560 },
  { asset: 'silhuetter/ruin', pos: [2720, 2380], str: 520 },
  { asset: 'silhuetter/taarn', pos: [3480, 1920], str: 440 },
]

export const VERDEN = { bredde: 3700, hoejde: 2800, start: [2100, 1350] }

export const STARTNODER = new Set(['eg', 'kobbermalm', 'smelt-kobber', 'rotte'])
