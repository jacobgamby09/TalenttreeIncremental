// Opstart og spilløkke.
import { KLYNGER, RESSOURCER, OFFLINE_MIN_SEK } from './data.js'
import { spil, noder, tick, beregnStatus, indlaes, gem, brugDemo, simulerOffline } from './spil.js'
import { indlaesTema } from './tema.js'
import { opsaetKort, frame, markerSnavset, flyvTil, koerAfsloering, holdSkjult, nodePop, spillerPop, ryst, tilSkaerm } from './kort.js'
import { opsaetUi, uiFrame, vaelg, besked, opdaterInfo, visOffline } from './ui.js'
import { T, tal } from './tekster.js'

const parametre = new URLSearchParams(location.search)
const temaNavn = parametre.get('tema') ?? 'stjernekort'
const demo = parametre.get('load') === 'alt' ? 'alt' : null

async function start() {
  await indlaesTema(temaNavn)
  if (demo) brugDemo(demo)
  indlaes()
  const offline = koerOffline()
  opsaetKort({ onVaelg: id => vaelg(id) })
  if (demo) flyvTil(1850, 1450, 0.42, 1)
  opsaetUi()
  forbindHaendelser()
  document.getElementById('indlaeser').remove()
  if (offline) {
    const afspil = () => offline.klynger.forEach(k => koerAfsloering(k, () => besked(T.besked.nyKlynge(KLYNGER[k].navn), 'stor')))
    if (offline.aktivitet) visOffline(offline, afspil)
    else afspil()
  }

  let sidst = performance.now()
  let statusUr = 0, gemUr = 0
  const loekke = now => {
    const dt = Math.min(0.25, (now - sidst) / 1000)
    sidst = now
    tick(dt)
    statusUr += dt
    if (statusUr > 0.25) {
      statusUr = 0
      const foer = [...spil.status.values()].join()
      beregnStatus()
      if ([...spil.status.values()].join() !== foer) { markerSnavset(); opdaterInfo() }
    }
    gemUr += dt
    if (gemUr > 5) { gemUr = 0; gem() }
    frame(now)
    uiFrame()
    requestAnimationFrame(loekke)
  }
  requestAnimationFrame(loekke)
  window.addEventListener('beforeunload', gem)
  window.spil = spil
}

// Tiden siden sidste gem køres som offline progress, før kortet tegnes.
// Klynger, der blev afsløret imens, holdes skjult, så afsløringen kan ses, når opsummeringen lukkes.
function koerOffline() {
  const vaek = spil.t.gemtTid ? (Date.now() - spil.t.gemtTid) / 1000 : 0
  if (vaek < OFFLINE_MIN_SEK) return null
  const r = simulerOffline(vaek)
  const klynger = r.haendelser.filter(h => h.type === 'afsloering').map(h => h.data.klynge)
  for (const k of klynger) holdSkjult(k)
  gem()
  return { ...r, klynger }
}

function forbindHaendelser() {
  spil.on('levelOp', ({ skill, lvl }) => { besked(T.besked.levelOp(skill, lvl), 'level'); markerSnavset(); opdaterInfo() })
  spil.on('udbytte', ({ id, ressource, antal }) => { nodePop(id, `+${tal(antal)} ${RESSOURCER[ressource].navn.toLowerCase()}`, 'udbytte'); opdaterInfo() })
  spil.on('slag', ({ af, skade, crit }) => {
    const a = spil.t.aktivitet
    if (!a) return
    if (af === 'spiller') { nodePop(a.node, `−${tal(skade)}`, crit ? 'crit' : 'skade'); ryst(a.node) }
    else if (af === 'torne') nodePop(a.node, `−${tal(skade)}`, 'torne')
    else { spillerPop(`−${tal(skade)}`, 'skade-spiller'); ryst('spiller') }
  })
  spil.on('heal', ({ antal }) => spillerPop(`+${tal(antal)}`, 'heal'))
  spil.on('drab', () => { markerSnavset(); opdaterInfo() })
  spil.on('nytMonster', () => markerSnavset())
  spil.on('aktivitet', ({ id }) => {
    markerSnavset()
    opdaterInfo()
    const a = spil.t.aktivitet
    if (a?.kamp && id) {
      const n = noder.get(id)
      const p = tilSkaerm(n.pos[0], n.pos[1])
      const udenfor = p.x < 80 || p.y < 80 || p.x > innerWidth - 80 || p.y > innerHeight - 80
      if (udenfor || a.dungeon) flyvTil(n.pos[0] + n.kampPlads[0] / 2, n.pos[1] + n.kampPlads[1] / 2, 0.95)
    }
  })
  spil.on('doed', ({ dungeon }) => { besked(dungeon ? T.besked.dungeonTabt : T.besked.doed, 'advarsel'); markerSnavset(); opdaterInfo() })
  spil.on('genoplivet', () => { besked(T.besked.genoplivet); opdaterInfo() })
  spil.on('bossBesejret', ({ id }) => { besked(T.besked.bossBesejret(noder.get(id).navn), 'stor'); markerSnavset(); opdaterInfo() })
  spil.on('afsloering', ({ klynge }) => koerAfsloering(klynge, () => besked(T.besked.nyKlynge(KLYNGER[klynge].navn), 'stor')))
  spil.on('nyNode', ({ id }) => {
    const n = noder.get(id)
    if (n.monster && !n.dungeon) besked(T.besked.nyOpdagelse(n.navn))
    markerSnavset()
  })
  spil.on('craftet', ({ id }) => { besked(T.besked.craftet(noder.get(id).navn)); markerSnavset(); opdaterInfo() })
  spil.on('bygget', ({ id }) => { besked(T.besked.bygget(noder.get(id).navn)); markerSnavset(); opdaterInfo() })
  spil.on('aendret', () => { markerSnavset(); opdaterInfo() })
  spil.on('besked', ({ tekst, navn }) => { if (tekst === 'mangler') besked(T.besked.manglerRessourcer(navn), 'advarsel'); opdaterInfo() })
}

start().catch(e => {
  console.error(e)
  const el = document.getElementById('indlaeser')
  if (el) el.textContent = `Prototypen kunne ikke starte: ${e.message}. Kør den via node tools/serve.mjs.`
})
