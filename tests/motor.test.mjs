// Automatiske tests af spilmotoren i prototype/js/spil.js. Kør med: npm test
import { test, beforeEach } from 'node:test'
import assert from 'node:assert/strict'

// Tilfældighed slås fra, så dobbelt udbytte, drops og kritiske slag ikke påvirker testene
Math.random = () => 0.999

const m = await import('../prototype/js/spil.js')
const { spil } = m

const koer = (sekunder, skridt = 0.05) => {
  for (let t = 0; t < sekunder; t += skridt) m.tick(skridt)
  m.beregnStatus()
}
const status = id => spil.status.get(id)

beforeEach(() => m.nulstil())

test('startspillet viser de rigtige noder', () => {
  assert.equal(status('eg'), 'aaben')
  assert.equal(status('pil'), 'laast')
  assert.equal(status('ask'), 'taage')
  assert.equal(status('goblin'), 'taage')
  assert.equal(status('barkbille'), 'skjult')
  assert.equal(status('rodnet'), 'skjult')
  assert.equal(status('slot-vaaben'), 'aaben')
})

test('en aktivitet giver ressourcer, XP og level', () => {
  assert.ok(m.startAktivitet('eg'))
  koer(3.05)
  assert.equal(spil.t.ressourcer.eg, 1)
  assert.equal(spil.t.xp.traefaeldning, 5)
  koer(9.2)
  assert.equal(m.level('traefaeldning'), 2)
})

test('kun én aktivitet ad gangen', () => {
  m.startAktivitet('eg')
  m.startAktivitet('kobbermalm')
  assert.equal(spil.t.aktivitet.node, 'kobbermalm')
})

test('låste noder kan ikke startes', () => {
  assert.equal(m.startAktivitet('pil'), false)
  assert.equal(spil.t.aktivitet, null)
})

test('smeltning bruger ressourcer og stopper, når de slipper op', () => {
  spil.t.ressourcer.kobbermalm = 2
  spil.t.ressourcer.eg = 2
  assert.ok(m.startAktivitet('smelt-kobber'))
  koer(9.5)
  assert.equal(spil.t.ressourcer.kobberbarre, 2)
  assert.equal(spil.t.ressourcer.kobbermalm, 0)
  assert.equal(spil.t.aktivitet, null)
})

test('modifiers gør aktiviteten hurtigere', () => {
  for (let i = 0; i < 2; i++) m.udvikler.levels()
  spil.t.ressourcer.eg = 10
  m.beregnStatus()
  assert.ok(m.koebRank('skarp-oekse'))
  assert.equal(m.rank('skarp-oekse'), 1)
  assert.equal(Math.round(m.aktivitetsTid('eg') * 10) / 10, 2.8)
})

test('crafting tager gear på og giver stats', () => {
  spil.t.ressourcer.kobberbarre = 4
  assert.ok(m.craft('kobbersvaerd'))
  assert.equal(spil.t.udrustet.vaaben, 'kobbersvaerd')
  assert.equal(m.spillerStats().atk, 9)
  assert.equal(m.craft('kobbersvaerd'), false)
})

test('bygninger sættes i en ledig socket og virker der', () => {
  spil.t.ressourcer.eg = 20
  spil.t.ressourcer.kobberbarre = 3
  assert.ok(m.byg('sav'))
  assert.deepEqual(spil.t.sockets, ['sav', null, null])
  assert.ok(m.aktivitetsTid('eg') < 3)
})

test('goblinen bliver synlig efter 10 besejrede rotter', () => {
  spil.t.drab.rotte = 9
  m.beregnStatus()
  assert.equal(status('goblin'), 'taage')
  spil.t.drab.rotte = 10
  m.beregnStatus()
  assert.equal(status('goblin'), 'aaben')
})

test('kamp ved rotten giver drab og kamp-XP', () => {
  spil.t.hp = 50
  assert.ok(m.startAktivitet('rotte'))
  koer(20)
  assert.ok(spil.t.drab.rotte >= 3)
  assert.ok(spil.t.xp.kamp > 0)
})

test('fuldt jerngear besejrer bossen, og Druide og Ask åbner sig', () => {
  for (let i = 0; i < 14; i++) m.udvikler.levels()
  for (let i = 0; i < 3; i++) m.udvikler.ressourcer()
  m.beregnStatus()
  for (const g of ['kobberhjelm', 'jernsvaerd', 'jernhjelm', 'jernbrystplade', 'jernbenskinner', 'jernstoevler']) assert.ok(m.craft(g), g)
  for (const [id, n] of [['styrke', 4], ['hurtige-haender', 3], ['udholdenhed', 2], ['forsvar', 2]]) for (let i = 0; i < n; i++) assert.ok(m.koebRank(id), id)
  m.byg('slibesten')
  m.byg('baalplads')
  spil.t.hp = m.spillerStats().hp
  m.beregnStatus()
  assert.ok(m.estimer(m.dungeonRaekke).vinder)
  assert.ok(m.startAktivitet('mosklump'))
  assert.equal(spil.t.aktivitet.node, 'barkbille')
  koer(120)
  assert.ok(spil.t.besejret['traeets-vogter'])
  assert.ok(spil.t.afsloeret.druide)
  assert.equal(status('ask'), 'aaben')
  assert.equal(status('rodnet'), 'aaben')
  assert.equal(status('druide-ukendt'), 'taage')
})

test('Skovbrug dukker op, når 300 eg er fældet', () => {
  spil.t.taellere.egFaeldet = 299
  m.startAktivitet('eg')
  koer(3.1)
  assert.ok(spil.t.afsloeret.skovbrug)
  assert.equal(status('plant-et-trae'), 'aaben')
})

test('demo-loadet viser hele kortet', () => {
  m.brugDemo('alt')
  m.nulstil()
  const ikkeAabne = [...spil.status].filter(([, s]) => s !== 'aaben').map(([id]) => id)
  assert.deepEqual(ikkeAabne, ['druide-ukendt'])
})
