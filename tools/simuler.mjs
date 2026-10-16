// Balanceringssimulator: en bot spiller prototypen igennem uden browser og måler tiden til milepælene.
// Brug: node tools/simuler.mjs [antal kørsler] [--skriv]   (--skriv gemmer rapporten i dokumentation/balancering.md)
import { writeFileSync } from 'node:fs'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const antal = Number(process.argv.slice(2).find(a => /^\d+$/.test(a)) ?? 10)
const skriv = process.argv.includes('--skriv')

const m = await import('../prototype/js/spil.js')
const { NODER } = await import('../prototype/js/data.js')
const { spil, noder, dungeonRaekke } = m

const DT = 0.5
const MAKS_TID = 3 * 3600

// Mål i minutter pr. milepæl. Prototypen sigter efter 30-45 minutter frem til bossen (prototype-noder.md).
const MAAL = {
  'foerste-gear': [0.5, 3],
  goblin: [4, 10],
  pil: [8, 16],
  jernmalm: [10, 20],
  jernbarre: [12, 22],
  ulv: [12, 25],
  jernbrystplade: [20, 35],
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

class TidenErGaaet extends Error {}
let doedsfald = 0
spil.on('doed', () => { doedsfald++ })

const har = r => spil.t.ressourcer[r] ?? 0
const tid = () => spil.t.spilletid
let skridtNr = 0
function skridt() {
  if (tid() > MAKS_TID) throw new TidenErGaaet()
  m.tick(DT)
  if (++skridtNr % 4 === 0) { m.beregnStatus(); autoKoeb() }
}
function start(id) {
  m.beregnStatus()
  return m.startAktivitet(id)
}

// Kører spillet, indtil betingelsen er opfyldt. oensket() siger, hvilken aktivitet der skal køre;
// den returnerer 'vent' for at vente et skridt og false, hvis botten må give op.
const koererAllerede = id => {
  const a = spil.t.aktivitet
  return !!a && (a.node === id || (a.dungeon && !!noder.get(id).dungeon))
}
function koerTil(betingelse, oensket, hvert) {
  while (!betingelse()) {
    if (oensket) {
      if (spil.t.genopliv > 0) { skridt(); continue }
      const id = oensket()
      if (!id) return false
      if (id !== 'vent' && !koererAllerede(id) && !start(id)) return false
    }
    if (hvert) hvert()
    skridt()
  }
  return true
}

// Ressourcer
const RAA = { eg: 'eg', pil: 'pil', ask: 'ask', kobbermalm: 'kobbermalm', jernmalm: 'jernmalm' }
const BARRE = { kobberbarre: 'smelt-kobber', jernbarre: 'smelt-jern' }
const DROP = { rottehale: 'rotte', laeder: 'goblin', ulveskind: 'ulv' }

function skaf(r, n) {
  if (har(r) >= n) return true
  if (RAA[r]) {
    saetSockets('samling')
    return koerTil(() => har(r) >= n, () => RAA[r])
  }
  if (BARRE[r]) {
    const id = BARRE[r]
    const akt = noder.get(id).aktivitet
    while (har(r) < n) {
      if (!m.kravOpfyldt(noder.get(id))) return false
      const batch = Math.min(n - har(r), 10)
      for (const [ind, k] of Object.entries(akt.bruger)) if (!skaf(ind, k * batch)) return false
      const maal = Math.min(n, har(r) + batch)
      saetSockets('smeltning')
      koerTil(() => har(r) >= maal || !m.kanBetale(akt.bruger), () => id)
      m.stopAktivitet()
    }
    return true
  }
  if (DROP[r]) return kaemp(() => DROP[r], () => har(r) >= n)
  return false
}

function skafPris(pris) {
  const ordnet = Object.entries(pris ?? {}).sort(([a], [b]) => (BARRE[b] ? 1 : 0) - (BARRE[a] ? 1 : 0))
  for (let i = 0; i < 6 && !m.kanBetale(pris); i++) {
    for (const [r, n] of ordnet) if (!skaf(r, n)) return false
  }
  return m.kanBetale(pris)
}

// Træning af skills
function bedsteAktivitet(skill) {
  const muligheder = NODER.filter(n => n.aktivitet?.skill === skill && !n.aktivitet.bruger && spil.status.get(n.id) === 'aaben' && m.kravOpfyldt(n))
  muligheder.sort((a, b) => m.aktivitetsXp(b.id) / m.aktivitetsTid(b.id) - m.aktivitetsXp(a.id) / m.aktivitetsTid(a.id))
  return muligheder[0]?.id
}
function traen(skill, lvl) {
  while (m.level(skill) < lvl) {
    m.beregnStatus()
    if (skill === 'smedje') {
      const jern = m.kravOpfyldt(noder.get('smelt-jern')) && m.level('minedrift') >= 8 && m.level('traefaeldning') >= 8
      const barre = jern ? 'jernbarre' : 'kobberbarre'
      if (!skaf(barre, har(barre) + 5)) return false
      continue
    }
    if (skill === 'kamp') { if (!kaemp(sikkertMonster, () => m.level('kamp') >= lvl)) return false; continue }
    const id = bedsteAktivitet(skill)
    if (!id) return false
    saetSockets('samling')
    koerTil(() => m.level(skill) >= lvl || bedsteAktivitet(skill) !== id, () => id)
    m.stopAktivitet()
  }
  return true
}

// Kamp
function sikkertMonster() {
  const s = m.spillerStats()
  for (const id of ['ulv', 'goblin', 'rotte']) {
    if (spil.status.get(id) !== 'aaben') continue
    const e = m.estimer([id])
    if (e.vinder && e.hp > s.hp * 0.4) return id
  }
  return 'rotte'
}
function kaemp(valg, betingelse) {
  saetSockets('kamp')
  return koerTil(
    betingelse,
    () => {
      const id = valg()
      if (koererAllerede(id)) return id
      if (spil.t.hp < m.spillerStats().hp * 0.95) return 'vent'
      return spil.status.get(id) === 'aaben' ? id : false
    },
    () => {
      // Træk dig ud mellem to monstre, hvis HP er lavt, og vent på at blive rask
      const a = spil.t.aktivitet
      if (a?.kamp && !a.dungeon && a.respawn > 0 && spil.t.hp < m.spillerStats().hp * 0.35) m.stopAktivitet()
    },
  )
}

// Køb, bygninger og sockets
const KAMPPOINT = [['styrke', 3], ['hurtige-haender', 3], ['forsvar', 3], ['udholdenhed', 3], ['styrke', 5], ['forsvar', 5], ['udholdenhed', 5], ['kritisk-slag', 3]]
const BYGNINGER = ['baalplads', 'sav', 'malmvogn', 'slibesten', 'tilbygning', 'blaesebaelg']
function autoKoeb() {
  for (const [id, maks] of KAMPPOINT) while (m.kamppoint() > 0 && m.rank(id) < maks && m.koebRank(id)) { /* køber et point ad gangen */ }
  for (const n of NODER) {
    if (n.type === 'modifier') {
      const r = m.rank(n.id)
      if (r < n.modifier.ranks && m.kravOpfyldt(n) && Object.entries(n.modifier.pris[r]).every(([res, k]) => har(res) >= k * 2)) m.koebRank(n.id)
    } else if (n.type === 'passiv' && spil.status.get(n.id) === 'aaben') {
      const r = m.rank(n.id)
      if (r < n.passiv.ranks && Object.entries(n.passiv.pris[r]).every(([res, k]) => har(res) >= k * 2)) m.koebRank(n.id)
    }
  }
  for (const id of BYGNINGER) {
    const n = noder.get(id)
    const pris = n.bygning?.pris ?? n.tilbygning?.pris
    const bygget = id === 'tilbygning' ? spil.t.tilbygning : spil.t.bygget.includes(id)
    if (!bygget && Object.entries(pris).every(([res, k]) => har(res) >= k * 1.5)) m.byg(id)
  }
}
const SOCKET_PLAN = {
  samling: ['sav', 'malmvogn', 'blaesebaelg', 'baalplads', 'slibesten'],
  smeltning: ['blaesebaelg', 'sav', 'malmvogn', 'baalplads', 'slibesten'],
  kamp: ['slibesten', 'baalplads', 'sav', 'malmvogn', 'blaesebaelg'],
}
function saetSockets(tilstand) {
  const plan = SOCKET_PLAN[tilstand].filter(id => spil.t.bygget.includes(id)).slice(0, m.socketAntal())
  if (plan.every(id => spil.t.sockets.includes(id))) return
  for (let i = 0; i < m.socketAntal(); i++) m.saetISocket(i, null)
  plan.forEach((id, i) => m.saetISocket(i, id))
}

function lavGear(id) {
  const n = noder.get(id)
  if (spil.t.craftet.includes(id)) return true
  for (const k of n.krav ?? []) if (k.skill && !traen(k.skill, k.lvl)) return false
  if (!skafPris(n.gear.pris)) return false
  return m.craft(id)
}
function byg(id) {
  const n = noder.get(id)
  if (spil.t.bygget.includes(id) || (id === 'tilbygning' && spil.t.tilbygning)) return true
  if (!skafPris(n.bygning?.pris ?? n.tilbygning.pris)) return false
  return m.byg(id)
}

// Ruten: det, en fornuftig spiller ville gøre, i en rimelig rækkefølge
function rute() {
  lavGear('kobbersvaerd')
  lavGear('kobberhjelm')
  byg('baalplads')
  byg('sav')
  kaemp(() => 'rotte', () => (spil.t.drab.rotte ?? 0) >= 10)
  lavGear('kobberbenskinner')
  lavGear('kobberbrystplade')
  kaemp(() => 'goblin', () => (spil.t.drab.goblin ?? 0) >= 15)
  lavGear('kobberstoevler')
  traen('traefaeldning', 8)
  traen('minedrift', 8)
  for (const g of ['jernhjelm', 'jernsvaerd', 'jernbenskinner', 'jernbrystplade', 'jernstoevler']) lavGear(g)
  traen('traefaeldning', 12)
  while (!spil.t.besejret['traeets-vogter']) {
    m.beregnStatus()
    const s = m.spillerStats()
    if (spil.t.genopliv > 0 || spil.t.hp < s.hp * 0.95) { m.stopAktivitet(); skridt(); continue }
    if (m.estimer(dungeonRaekke).vinder) {
      saetSockets('kamp')
      start(dungeonRaekke[0])
      koerTil(() => !spil.t.aktivitet || spil.t.besejret['traeets-vogter'])
    } else traen('kamp', m.level('kamp') + 1)
  }
  traen('traefaeldning', 15)
}

// Kør
const koersler = []
for (let i = 0; i < antal; i++) {
  Math.random = mulberry32(1000 + i)
  m.nulstil()
  doedsfald = 0
  skridtNr = 0
  let slut = 'færdig'
  try { rute() } catch (e) { if (e instanceof TidenErGaaet) slut = 'tiden løb ud'; else throw e }
  koersler.push({
    milepaele: { ...spil.t.milepaele },
    levels: Object.fromEntries(['traefaeldning', 'minedrift', 'smedje', 'kamp'].map(s => [s, m.level(s)])),
    doedsfald, slut, tid: tid(),
  })
}

// Rapport
const median = v => { const s = [...v].sort((a, b) => a - b); return s.length ? s[Math.floor((s.length - 1) / 2)] : null }
const mmss = s => (s == null ? '–' : `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`)
const linjer = []
const ud = l => linjer.push(l)
ud(`# Balancering`)
ud('')
ud(`Genereret af \`node tools/simuler.mjs ${antal} --skriv\`. Botten spiller prototypen igennem med fast seed (${antal} kørsler) og måler spilletid til hver milepæl. Ret ikke i filen i hånden.`)
ud('')
ud('| Milepæl | Median | Hurtigst | Langsomst | Nået | Mål | Vurdering |')
ud('|---|---|---|---|---|---|---|')
for (const mp of m.MILEPAELE) {
  const tider = koersler.map(k => k.milepaele[mp.id]).filter(v => v !== undefined)
  const med = median(tider)
  const maal = MAAL[mp.id]
  let vurdering = '–'
  if (maal && med != null) vurdering = med / 60 < maal[0] ? 'for hurtigt' : med / 60 > maal[1] ? 'for langsomt' : 'inden for målet'
  ud(`| ${mp.navn} | ${mmss(med)} | ${mmss(tider.length ? Math.min(...tider) : null)} | ${mmss(tider.length ? Math.max(...tider) : null)} | ${tider.length}/${antal} | ${maal ? `${maal[0]}-${maal[1]} min` : '–'} | ${vurdering} |`)
}
ud('')
const lv = s => median(koersler.map(k => k.levels[s]))
ud(`Levels ved slut (median): træfældning ${lv('traefaeldning')}, minedrift ${lv('minedrift')}, smedje ${lv('smedje')}, kamp ${lv('kamp')}. Dødsfald (median): ${median(koersler.map(k => k.doedsfald))}. Kørsler, hvor tiden løb ud: ${koersler.filter(k => k.slut !== 'færdig').length}.`)
const rapport = linjer.join('\n') + '\n'
console.log(rapport)
if (skriv) {
  writeFileSync(join(root, 'dokumentation', 'balancering.md'), rapport)
  console.log('Skrev dokumentation/balancering.md')
}
