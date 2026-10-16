// Spilmotoren: tilstand, aktiviteter, kamp, krav, synlighed og køb.
import {
  NODER, KANTER, KLYNGER, SKILLS, RESSOURCER, SLOTS, SPILLER_BASIS, GENOPLIV_SEK, RESPAWN_SEK, STARTNODER, xpTilNaeste,
} from './data.js'

let GEM_NOEGLE = 'talenttrae-prototype-v1'
let demo = null

// Et demo-load bruger sit eget gemte spil, så det normale spil ikke overskrives
export function brugDemo(navn) {
  demo = navn
  GEM_NOEGLE = `talenttrae-prototype-v1-${navn}`
}

export const noder = new Map(NODER.map(n => [n.id, n]))
export const naboer = new Map(NODER.map(n => [n.id, []]))
for (const [a, b] of KANTER) { naboer.get(a).push(b); naboer.get(b).push(a) }
export const dungeonRaekke = NODER.filter(n => n.dungeon).sort((a, b) => a.dungeon.index - b.dungeon.index).map(n => n.id)

function nyTilstand() {
  return {
    version: 1,
    ressourcer: Object.fromEntries(Object.keys(RESSOURCER).map(r => [r, 0])),
    sete: [],
    xp: Object.fromEntries(Object.keys(SKILLS).map(s => [s, 0])),
    ranks: {},
    craftet: [],
    udrustet: Object.fromEntries(Object.keys(SLOTS).map(s => [s, null])),
    bygget: [],
    sockets: [null, null, null],
    tilbygning: false,
    drab: {},
    taellere: { egFaeldet: 0 },
    besejret: {},
    afsloeret: {},
    opdagede: [],
    uset: [],
    hp: null,
    genopliv: 0,
    aktivitet: null,
  }
}

export const spil = {
  t: nyTilstand(),
  fart: 1,
  status: new Map(),
  lyttere: new Map(),
  on(type, fn) { (this.lyttere.get(type) ?? this.lyttere.set(type, []).get(type)).push(fn) },
  emit(type, data) { for (const fn of this.lyttere.get(type) ?? []) fn(data) },
}

// Level og XP
const xpTilLevel = lvl => { let sum = 0; for (let l = 1; l < lvl; l++) sum += xpTilNaeste(l); return sum }
export function level(skill) {
  const xp = spil.t.xp[skill] ?? 0
  let l = 1
  while (xp >= xpTilLevel(l + 1)) l++
  return l
}
export function xpFremdrift(skill) {
  const l = level(skill)
  const start = xpTilLevel(l)
  return { lvl: l, har: (spil.t.xp[skill] ?? 0) - start, af: xpTilNaeste(l) }
}
function giveXp(skill, xp) {
  const foer = level(skill)
  spil.t.xp[skill] += xp
  const efter = level(skill)
  if (efter > foer) spil.emit('levelOp', { skill, lvl: efter })
}

export const rank = id => spil.t.ranks[id] ?? 0
export const kamppoint = () => {
  const brugt = NODER.filter(n => n.type === 'stat').reduce((s, n) => s + rank(n.id), 0)
  return level('kamp') - 1 - brugt
}

// Ressourcer
export const kanBetale = pris => Object.entries(pris ?? {}).every(([r, n]) => (spil.t.ressourcer[r] ?? 0) >= n)
function betal(pris) { for (const [r, n] of Object.entries(pris ?? {})) spil.t.ressourcer[r] -= n }
function giv(r, n) {
  spil.t.ressourcer[r] = (spil.t.ressourcer[r] ?? 0) + n
  if (!spil.t.sete.includes(r)) spil.t.sete.push(r)
}

// Effekter fra opgraderinger, bygninger i sockets, udrustning og opdagelser
const iSocket = id => spil.t.sockets.includes(id)
function bygningsEffekter() {
  return spil.t.sockets.filter(Boolean).map(id => noder.get(id).bygning.effekt)
}
function passivEffekt(type) {
  return NODER.filter(n => n.type === 'passiv' && rank(n.id) > 0 && n.passiv.effekt.type === type)
}

export function aktivitetsTid(id) {
  const n = noder.get(id)
  let tid = n.aktivitet.tid
  for (const m of NODER.filter(m => m.type === 'modifier' && m.modifier.effekt.type === 'tid' && m.modifier.effekt.maal.includes(id))) {
    tid += m.modifier.effekt.pr * rank(m.id)
  }
  if (id === 'eg' && rank('baeredygtig-faeldning') > 0) tid += noder.get('baeredygtig-faeldning').passiv.effekt.tid
  const skill = n.aktivitet.smeltning ? 'smeltning' : n.aktivitet.skill
  const fart = bygningsEffekter().filter(e => e.type === 'fart' && e.skill === skill).reduce((s, e) => s + e.pr, 0)
  return Math.max(0.5, tid / (1 + fart))
}
export function dobbeltChance(id) {
  return NODER.filter(m => m.type === 'modifier' && m.modifier.effekt.type === 'dobbelt' && m.modifier.effekt.maal.includes(id))
    .reduce((s, m) => s + m.modifier.effekt.pr * rank(m.id), 0)
}
const braendselSpar = () => noder.get('sparsom-fyring').modifier.effekt.pr * rank('sparsom-fyring')
export function aktivitetsXp(id) {
  const n = noder.get(id)
  let xp = n.aktivitet.xp
  if (id === 'eg' && rank('baeredygtig-faeldning') > 0) xp += noder.get('baeredygtig-faeldning').passiv.effekt.xp
  const bonus = passivEffekt('xpBonus').filter(p => p.passiv.effekt.skill === n.aktivitet.skill).reduce((s, p) => s + p.passiv.effekt.pr * rank(p.id), 0)
  return xp * (1 + bonus)
}

export function spillerStats() {
  const s = { ...SPILLER_BASIS, crit: 0, torne: 0, hpPrDrab: 0, urtemedicin: null }
  for (const id of Object.values(spil.t.udrustet)) if (id) for (const [k, v] of Object.entries(noder.get(id).gear.stats)) s[k] += v
  for (const n of NODER.filter(n => n.type === 'stat')) for (const [k, v] of Object.entries(n.stat.effekt)) s[k] += v * rank(n.id)
  for (const e of bygningsEffekter()) {
    if (e.type === 'atk') s.atk += e.pr
    if (e.type === 'hpPrDrab') s.hpPrDrab += e.pr
  }
  for (const p of passivEffekt('torne')) s.torne += p.passiv.effekt.pr
  const urt = passivEffekt('urtemedicin')[0]
  if (urt) s.urtemedicin = urt.passiv.effekt
  s.tid = Math.max(0.5, s.tid)
  return s
}

// Krav og synlighed
const kravOk = k => {
  if (k.skill) return level(k.skill) >= k.lvl
  if (k.boss) return !!spil.t.besejret[k.boss]
  if (k.stat) return rank(k.stat) >= k.point
  return true
}
export const kravListe = n => n.type === 'modifier' ? [{ skill: n.skill, lvl: n.modifier.lvl[Math.min(rank(n.id), n.modifier.ranks - 1)] }, ...(n.krav ?? [])] : (n.krav ?? [])
export const kravOpfyldt = n => kravListe(n).every(kravOk)
const foersteKravOk = n => (n.type === 'modifier' ? kravOk({ skill: n.skill, lvl: n.modifier.lvl[0] }) : (n.krav ?? []).every(kravOk))
export function synligKravOk(n) {
  const k = n.synligKrav
  if (!k) return true
  if (k.drab) return Object.entries(k.drab).every(([id, antal]) => (spil.t.drab[id] ?? 0) >= antal)
  if (k.skill) return level(k.skill) >= k.lvl
  return true
}
export const klyngeAfsloeret = k => !KLYNGER[k].skjult || !!spil.t.afsloeret[k]

export function beregnStatus() {
  const aabne = []
  for (const n of NODER) {
    if (!klyngeAfsloeret(n.klynge) || n.type === 'ukendt') continue
    if (synligKravOk(n) && foersteKravOk(n)) aabne.push(n.id)
  }
  const afstand = new Map(aabne.map(id => [id, 0]))
  const koe = [...aabne]
  while (koe.length) {
    const id = koe.shift()
    const d = afstand.get(id)
    if (d >= 2) continue
    for (const nb of naboer.get(id)) {
      if (!klyngeAfsloeret(noder.get(nb).klynge) || afstand.has(nb)) continue
      afstand.set(nb, d + 1)
      koe.push(nb)
    }
  }
  const forrige = spil.status
  const ny = new Map()
  for (const n of NODER) {
    let s = 'skjult'
    if (klyngeAfsloeret(n.klynge)) {
      const d = afstand.get(n.id)
      if (n.type === 'ukendt') s = 'taage'
      else if (d === 0) s = 'aaben'
      else if (d === 1) s = synligKravOk(n) ? 'laast' : 'taage'
      else if (d === 2) s = 'taage'
    }
    ny.set(n.id, s)
  }
  spil.status = ny
  for (const [id, s] of ny) {
    const foer = forrige.get(id)
    if (foer && (foer === 'skjult' || foer === 'taage') && (s === 'aaben' || s === 'laast') && !spil.t.opdagede.includes(id)) {
      spil.t.opdagede.push(id)
      spil.t.uset.push(id)
      spil.emit('nyNode', { id })
    }
  }
  return ny
}
export const erSynlig = id => ['aaben', 'laast'].includes(spil.status.get(id))

function tjekAfsloeringer() {
  for (const [k, kl] of Object.entries(KLYNGER)) {
    if (!kl.skjult || spil.t.afsloeret[k]) continue
    const s = kl.skjult
    const ok = s.boss ? !!spil.t.besejret[s.boss] : (spil.t.taellere[s.taeller] ?? 0) >= s.antal
    if (ok) {
      spil.t.afsloeret[k] = true
      for (const n of NODER.filter(n => n.klynge === k)) {
        if (!spil.t.opdagede.includes(n.id)) spil.t.opdagede.push(n.id)
        if (n.type !== 'ukendt' && !spil.t.uset.includes(n.id)) spil.t.uset.push(n.id)
      }
      spil.emit('afsloering', { klynge: k })
    }
  }
}

// Handlinger
export function startAktivitet(id) {
  const n = noder.get(id)
  if (spil.status.get(id) !== 'aaben' || !kravOpfyldt(n)) return false
  if (n.aktivitet) {
    if (n.aktivitet.bruger && !kanBetale(n.aktivitet.bruger)) { spil.emit('besked', { tekst: 'mangler', navn: n.navn }); return false }
    spil.t.aktivitet = { node: id, t: 0 }
  } else if (n.monster) {
    if (spil.t.genopliv > 0) return false
    const startId = n.dungeon ? dungeonRaekke[0] : id
    spil.t.aktivitet = { kamp: true, node: startId, dungeon: !!n.dungeon, fjendeHp: noder.get(startId).monster.hp, fjendeT: 0, spillerT: 0, respawn: 0, urtT: 0, drab: 0 }
  } else return false
  spil.emit('aktivitet', { id: spil.t.aktivitet.node })
  return true
}
export function stopAktivitet() {
  if (!spil.t.aktivitet) return
  spil.t.aktivitet = null
  spil.emit('aktivitet', { id: null })
}

export function koebRank(id) {
  const n = noder.get(id)
  const r = rank(id)
  let pris
  if (n.type === 'modifier') { if (r >= n.modifier.ranks || !kravOpfyldt(n)) return false; pris = n.modifier.pris[r] }
  else if (n.type === 'passiv') { if (r >= n.passiv.ranks || spil.status.get(id) !== 'aaben') return false; pris = n.passiv.pris[r] }
  else if (n.type === 'stat') { if (r >= n.stat.ranks || !kravOpfyldt(n) || kamppoint() < 1) return false; pris = {} }
  else return false
  if (!kanBetale(pris)) return false
  betal(pris)
  spil.t.ranks[id] = r + 1
  spil.emit('aendret', { id })
  return true
}

const gearVaerdi = id => Object.values(noder.get(id).gear.stats).reduce((s, v) => s + v, 0)
export function craft(id) {
  const n = noder.get(id)
  if (!n.gear || spil.t.craftet.includes(id) || !kravOpfyldt(n) || !kanBetale(n.gear.pris)) return false
  betal(n.gear.pris)
  spil.t.craftet.push(id)
  giveXp('smedje', n.gear.xp)
  const nu = spil.t.udrustet[n.gear.slot]
  if (!nu || gearVaerdi(id) > gearVaerdi(nu)) spil.t.udrustet[n.gear.slot] = id
  spil.emit('craftet', { id })
  return true
}
export function udrust(slot, id) {
  if (id && (!spil.t.craftet.includes(id) || noder.get(id).gear.slot !== slot)) return false
  spil.t.udrustet[slot] = id
  spil.emit('aendret', { id })
  return true
}

export const socketAntal = () => (spil.t.tilbygning ? 3 : 2)
export function byg(id) {
  const n = noder.get(id)
  if (n.type === 'tilbygning') {
    if (spil.t.tilbygning || !kanBetale(n.tilbygning.pris)) return false
    betal(n.tilbygning.pris)
    spil.t.tilbygning = true
    spil.emit('bygget', { id })
    return true
  }
  if (!n.bygning || spil.t.bygget.includes(id) || !kanBetale(n.bygning.pris)) return false
  betal(n.bygning.pris)
  spil.t.bygget.push(id)
  const ledig = spil.t.sockets.slice(0, socketAntal()).indexOf(null)
  if (ledig >= 0) spil.t.sockets[ledig] = id
  spil.emit('bygget', { id })
  return true
}
export function saetISocket(index, id) {
  if (index >= socketAntal()) return false
  if (id && !spil.t.bygget.includes(id)) return false
  const gammel = spil.t.sockets.indexOf(id)
  if (id && gammel >= 0) spil.t.sockets[gammel] = null
  spil.t.sockets[index] = id
  spil.emit('aendret', { id })
  return true
}

// Tidsforløb
function afslutAktivitet(n) {
  const a = n.aktivitet
  if (a.bruger) {
    if (!kanBetale(a.bruger)) {
      spil.emit('besked', { tekst: 'mangler', navn: n.navn })
      stopAktivitet()
      return
    }
    const forbrug = { ...a.bruger }
    if (a.braendsel && Math.random() < braendselSpar()) delete forbrug[a.braendsel]
    betal(forbrug)
  }
  for (const [r, antal] of Object.entries(a.giver)) {
    const ialt = antal + (Math.random() < dobbeltChance(n.id) ? antal : 0)
    giv(r, ialt)
    if (r === 'eg') spil.t.taellere.egFaeldet += ialt
    spil.emit('udbytte', { id: n.id, ressource: r, antal: ialt })
  }
  giveXp(a.skill, aktivitetsXp(n.id))
}

function kampTick(dt) {
  const k = spil.t.aktivitet
  const s = spillerStats()
  if (k.respawn > 0) {
    k.respawn -= dt
    if (k.respawn <= 0) {
      k.fjendeHp = noder.get(k.node).monster.hp
      k.fjendeT = 0
      k.spillerT = 0
      spil.emit('nytMonster', { id: k.node })
    }
    return
  }
  const n = noder.get(k.node)
  const m = n.monster
  k.spillerT += dt
  k.fjendeT += dt
  if (s.urtemedicin) {
    k.urtT += dt
    if (k.urtT >= s.urtemedicin.interval) {
      k.urtT -= s.urtemedicin.interval
      const heal = Math.round(s.hp * s.urtemedicin.pr)
      spil.t.hp = Math.min(s.hp, spil.t.hp + heal)
      spil.emit('heal', { antal: heal })
    }
  }
  if (k.spillerT >= s.tid) {
    k.spillerT -= s.tid
    const crit = Math.random() < s.crit
    const skade = Math.max(1, s.atk - m.def) * (crit ? 2 : 1)
    k.fjendeHp -= skade
    spil.emit('slag', { af: 'spiller', skade, crit })
    if (k.fjendeHp <= 0) return drab(n, s)
  }
  if (k.fjendeT >= m.tid) {
    k.fjendeT -= m.tid
    const skade = Math.max(1, m.atk - s.def)
    spil.t.hp -= skade
    spil.emit('slag', { af: 'fjende', skade })
    if (s.torne > 0) {
      k.fjendeHp -= s.torne
      spil.emit('slag', { af: 'torne', skade: s.torne })
      if (k.fjendeHp <= 0 && spil.t.hp > 0) return drab(n, s)
    }
    if (spil.t.hp <= 0) return doed(n)
  }
}

function drab(n, s) {
  const k = spil.t.aktivitet
  const m = n.monster
  spil.t.drab[n.id] = (spil.t.drab[n.id] ?? 0) + 1
  k.drab++
  giveXp('kamp', m.xp)
  if (m.drop && Math.random() < m.drop.chance) { giv(m.drop.ressource, 1); spil.emit('udbytte', { id: n.id, ressource: m.drop.ressource, antal: 1 }) }
  if (s.hpPrDrab) spil.t.hp = Math.min(s.hp, spil.t.hp + s.hpPrDrab)
  spil.emit('drab', { id: n.id })
  if (n.dungeon) {
    const i = dungeonRaekke.indexOf(n.id)
    if (i === dungeonRaekke.length - 1) {
      const foerste = !spil.t.besejret[n.id]
      spil.t.besejret[n.id] = true
      stopAktivitet()
      spil.emit('bossBesejret', { id: n.id, foerste })
      tjekAfsloeringer()
      return
    }
    k.node = dungeonRaekke[i + 1]
  }
  k.respawn = RESPAWN_SEK
}

function doed(n) {
  spil.t.hp = 0
  spil.t.genopliv = GENOPLIV_SEK
  const iDungeon = !!n.dungeon
  stopAktivitet()
  spil.emit('doed', { dungeon: iDungeon })
}

export function tick(dtReal) {
  const dt = dtReal * spil.fart
  const t = spil.t
  const s = spillerStats()
  if (t.hp === null || t.hp > s.hp) t.hp = Math.min(t.hp ?? s.hp, s.hp)
  const a = t.aktivitet
  if (t.genopliv > 0) {
    t.genopliv -= dt
    if (t.genopliv <= 0) { t.genopliv = 0; t.hp = s.hp; spil.emit('genoplivet') }
  } else if (!a?.kamp && t.hp < s.hp) {
    t.hp = Math.min(s.hp, t.hp + (s.hp / GENOPLIV_SEK) * dt)
  }
  if (a && !a.kamp) {
    const n = noder.get(a.node)
    a.t += dt
    let tid = aktivitetsTid(n.id)
    while (spil.t.aktivitet === a && a.t >= tid) {
      a.t -= tid
      afslutAktivitet(n)
      tid = aktivitetsTid(n.id)
    }
  } else if (a?.kamp) {
    let rest = dt
    while (rest > 0 && spil.t.aktivitet === a) { const skridt = Math.min(rest, 0.05); kampTick(skridt); rest -= skridt }
  }
  tjekAfsloeringer()
}

// Overslag over en kamp eller hele dungeonen uden tilfældighed (kritiske slag som gennemsnit)
export function estimer(ids) {
  const s = spillerStats()
  let hp = spil.t.genopliv > 0 ? s.hp : Math.max(1, spil.t.hp ?? s.hp)
  let tidIalt = 0
  for (const id of ids) {
    const m = noder.get(id).monster
    let fhp = m.hp, pt = 0, ft = 0, urt = 0, t = 0
    const skade = Math.max(1, s.atk - m.def) * (1 + s.crit)
    const faar = Math.max(1, m.atk - s.def)
    while (fhp > 0 && hp > 0 && t < 600) {
      const naeste = Math.min(s.tid - pt, m.tid - ft)
      pt += naeste; ft += naeste; t += naeste; urt += naeste
      if (s.urtemedicin && urt >= s.urtemedicin.interval) { urt -= s.urtemedicin.interval; hp = Math.min(s.hp, hp + s.hp * s.urtemedicin.pr) }
      if (pt >= s.tid - 1e-9) { pt = 0; fhp -= skade; if (fhp <= 0) break }
      if (ft >= m.tid - 1e-9) { ft = 0; hp -= faar; fhp -= s.torne }
    }
    tidIalt += t
    if (hp <= 0) return { vinder: false, tid: tidIalt, taberVed: id, hp: 0 }
    hp = Math.min(s.hp, hp + s.hpPrDrab)
  }
  return { vinder: true, tid: tidIalt, hp }
}

// Gem og indlæs
export function gem() {
  try { localStorage.setItem(GEM_NOEGLE, JSON.stringify(spil.t)) } catch { /* privat vindue eller fuld lagring */ }
}
// Et spil, hvor hele kortet er synligt: høje levels, bossen besejret og alle klynger afsløret. Intet er købt endnu.
function altSynligtTilstand() {
  const t = nyTilstand()
  for (const s of Object.keys(SKILLS)) t.xp[s] = xpTilLevel(20)
  for (const r of Object.keys(RESSOURCER)) t.ressourcer[r] = 500
  t.sete = Object.keys(RESSOURCER)
  t.besejret['traeets-vogter'] = true
  t.afsloeret = Object.fromEntries(Object.entries(KLYNGER).filter(([, k]) => k.skjult).map(([id]) => [id, true]))
  t.taellere.egFaeldet = 300
  t.drab = { rotte: 10, goblin: 15 }
  t.opdagede = NODER.map(n => n.id)
  t.ranks = { styrke: 3, 'hurtige-haender': 2 }
  return t
}
const startTilstand = () => (demo === 'alt' ? altSynligtTilstand() : nyTilstand())

export function indlaes() {
  try {
    const raw = localStorage.getItem(GEM_NOEGLE)
    if (raw) {
      const gemt = JSON.parse(raw)
      if (gemt.version === 1) spil.t = { ...nyTilstand(), ...gemt }
    } else spil.t = startTilstand()
  } catch { spil.t = startTilstand() }
  if (!spil.t.opdagede.length) spil.t.opdagede = [...STARTNODER]
  spil.status = new Map()
  beregnStatus()
  for (const [id, s] of spil.status) if ((s === 'aaben' || s === 'laast') && !spil.t.opdagede.includes(id)) spil.t.opdagede.push(id)
}
export function nulstil() {
  try { localStorage.removeItem(GEM_NOEGLE) } catch { /* ignoreres */ }
  spil.t = startTilstand()
  indlaes()
}

// Udviklerværktøjer til afprøvning
export const udvikler = {
  ressourcer() { for (const r of Object.keys(RESSOURCER)) giv(r, 100) },
  levels() { for (const s of Object.keys(SKILLS)) { const l = level(s); spil.t.xp[s] = Math.max(spil.t.xp[s], xpTilLevel(l + 1)); spil.emit('levelOp', { skill: s, lvl: l + 1 }) } },
  afsloer() { spil.t.besejret['traeets-vogter'] = true; spil.t.taellere.egFaeldet = Math.max(300, spil.t.taellere.egFaeldet); tjekAfsloeringer() },
  altSynligt() { spil.t = altSynligtTilstand(); spil.status = new Map(); beregnStatus() },
}
