// HUD: ressourcer, infopanel, aktivitetsbjælke, pil i skærmkanten, beskeder og udviklerpanel.
import { RESSOURCER, KLYNGER, VERDEN } from './data.js'
import {
  spil, noder, rank, level, kamppoint, kanBetale, kravListe, kravOpfyldt, aktivitetsTid, aktivitetsXp, dobbeltChance,
  spillerStats, estimer, startAktivitet, stopAktivitet, koebRank, craft, udrust, byg, saetISocket, socketAntal, dungeonRaekke, udvikler, nulstil,
} from './spil.js'
import { tema } from './tema.js'
import { T, tal, sek, pct } from './tekster.js'
import { flyvTil, tilSkaerm, langtUde, markerSnavset, saetValgt } from './kort.js'

const $ = id => document.getElementById(id)
let valgtId = null
let infoSnavset = false
let pegerPaaPanel = false

// Små byggesten
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]))
function glyfHtml(id, farve = 'var(--tekst)', str = 16) {
  if (!tema.har(id)) return `<span class="glyf-pladsholder" style="width:${str}px;height:${str}px;background:${farve}"></span>`
  return `<span class="glyf" style="width:${str}px;height:${str}px;background:${farve};-webkit-mask-image:url('${tema.url(id)}');mask-image:url('${tema.url(id)}')"></span>`
}
function ressourceIkon(r, str = 20) {
  const id = RESSOURCER[r].ikon
  if (tema.har(id)) return `<img class="res-ikon" src="${tema.url(id)}" width="${str}" height="${str}" alt="">`
  return `<span class="res-pladsholder" style="width:${str}px;height:${str}px;background:${RESSOURCER[r].farve}"></span>`
}
function nodeIkonHtml(n, str = 56) {
  if (tema.har(n.ikon)) {
    if (n.ikon.startsWith('glyffer/')) return `<span class="info-ikon glyf-boks" style="width:${str}px;height:${str}px">${glyfHtml(n.ikon, tema.klyngeFarve(n.klynge), str * 0.62)}</span>`
    const bag = n.ikon.startsWith('portraetter/') && tema.har(tema.data.portraetbaggrund) ? `background-image:url('${tema.url(tema.data.portraetbaggrund)}')` : ''
    return `<span class="info-ikon" style="width:${str}px;height:${str}px;${bag}"><img src="${tema.url(n.ikon)}" alt=""></span>`
  }
  const initialer = n.navn.split(/\s+/).map(o => o[0]).join('').slice(0, 2).toUpperCase()
  return `<span class="info-ikon pladsholder" style="width:${str}px;height:${str}px;color:${tema.klyngeFarve(n.klynge)}">${initialer}</span>`
}
function prisHtml(pris) {
  const dele = Object.entries(pris ?? {})
  if (!dele.length) return `<span class="pris-gratis">${T.info.gratis}</span>`
  return dele.map(([r, n]) => `<span class="pris ${(spil.t.ressourcer[r] ?? 0) >= n ? '' : 'pris-mangler'}">${ressourceIkon(r, 16)}${tal(n)} ${esc(T.ressource(r).toLowerCase())}</span>`).join('')
}
function kravHtml(liste) {
  if (!liste.length) return ''
  return `<ul class="krav">${liste.map(k => {
    let ok, tekst
    if (k.skill) { ok = level(k.skill) >= k.lvl; tekst = T.krav.skill(k.skill, k.lvl) }
    else if (k.boss) { ok = !!spil.t.besejret[k.boss]; tekst = T.krav.boss(noder.get(k.boss).navn) }
    else if (k.stat) { ok = rank(k.stat) >= k.point; tekst = T.krav.stat(noder.get(k.stat).navn, k.point) }
    return `<li class="${ok ? 'ok' : 'mangler'}">${esc(tekst)}</li>`
  }).join('')}</ul>`
}
const knap = (handling, tekst, aktiv = true, klasse = '') => `<button class="knap ${klasse}" data-handling="${handling}" ${aktiv ? '' : 'disabled'}>${esc(tekst)}</button>`
const raekke = (label, vaerdi) => `<div class="raekke"><span>${esc(label)}</span><span>${vaerdi}</span></div>`
const maalNavne = ids => ids.map(id => noder.get(id).navn.toLowerCase()).join(' og ')

function effektTekst(n) {
  const e = n.modifier?.effekt ?? n.bygning?.effekt ?? n.passiv?.effekt
  if (n.stat) return T.effekt.stat(n.stat.effekt)
  if (n.gear) return T.effekt.gear(n.gear.stats)
  if (n.tilbygning) return T.effekt.tilbygning
  if (!e) return ''
  switch (e.type) {
    case 'tid': return T.effekt.tid(e.pr, maalNavne(e.maal))
    case 'dobbelt': return T.effekt.dobbelt(e.pr, maalNavne(e.maal))
    case 'braendsel': return T.effekt.braendsel(e.pr)
    case 'fart': return T.effekt.fart(e.pr, e.skill)
    case 'atk': return T.effekt.atk(e.pr)
    case 'hpPrDrab': return T.effekt.hpPrDrab(e.pr)
    case 'xpBonus': return T.effekt.xpBonus(e.pr, e.skill)
    case 'torne': return T.effekt.torne(e.pr)
    case 'urtemedicin': return T.effekt.urtemedicin(e.pr, e.interval)
    case 'baeredygtig': return T.effekt.baeredygtig(e.xp, e.tid)
  }
  return ''
}

function statsGrid(st, farve) {
  return `<div class="stats">
    <span>${glyfHtml('glyffer/atk', farve)} ATK ${tal(st.atk)}</span>
    <span>${glyfHtml('glyffer/hp', farve)} HP ${tal(st.hp)}</span>
    <span>${glyfHtml('glyffer/def', farve)} DEF ${tal(st.def)}</span>
    <span>${glyfHtml('glyffer/angrebstid', farve)} ${sek(st.tid)}</span>
  </div>`
}

// Infopanelet
function infoIndhold(n) {
  const status = spil.status.get(n.id)
  const farve = tema.klyngeFarve(n.klynge)
  const laast = status === 'laast'
  const kopf = `<header class="info-top" style="--farve:${farve}">${status === 'taage' ? `<span class="info-ikon taage">${glyfHtml('glyffer/taage', farve, 30)}</span>` : nodeIkonHtml(n)}
    <div><div class="info-type">${esc(KLYNGER[n.klynge].navn)} · ${esc(T.typer[n.type])}</div><h2>${status === 'taage' ? '…' : esc(n.navn)}</h2></div>
    <button class="luk" data-handling="luk" aria-label="${T.knap.luk}">×</button></header>`

  if (status === 'taage' || n.type === 'ukendt') {
    let hint = T.info.ukendt
    const k = n.synligKrav
    if (k?.drab) { const [id, antal] = Object.entries(k.drab)[0]; hint = T.krav.drab(noder.get(id).monster.flertal, antal, spil.t.drab[id] ?? 0) }
    else if (k?.skill) hint = T.krav.synligSkill(k.skill, k.lvl)
    return kopf + `<p class="info-tekst">${esc(hint)}</p>`
  }

  let krop = ''
  if (n.aktivitet) {
    const a = n.aktivitet
    const aktiv = spil.t.aktivitet?.node === n.id
    const giver = Object.keys(a.giver).map(r => `${ressourceIkon(r, 16)}${esc(T.ressource(r))}`).join(' ')
    const dob = dobbeltChance(n.id)
    krop += raekke(T.info.tid, sek(aktivitetsTid(n.id)))
    krop += raekke(T.info.giver, `${giver}${dob ? ` <small>(${pct(dob)} dobbelt)</small>` : ''}`)
    if (a.bruger) krop += raekke(T.info.bruger, prisHtml(a.bruger))
    krop += raekke(T.info.xp, `${tal(aktivitetsXp(n.id), 1)} ${esc(T.skill(a.skill).toLowerCase())}`)
    krop += kravHtml(kravListe(n))
    krop += `<div class="handlinger">${aktiv ? knap('stop', T.knap.stop, true, 'sekundaer') : knap('start', T.knap.start, !laast && kravOpfyldt(n) && (!a.bruger || kanBetale(a.bruger)))}</div>`
  } else if (n.modifier || n.stat || n.passiv) {
    const def = n.modifier ?? n.stat ?? n.passiv
    const r = rank(n.id)
    krop += `<p class="info-tekst">${esc(effektTekst(n))}</p>`
    krop += raekke(T.info.rankLabel, `${r}/${def.ranks}`)
    if (r >= def.ranks) krop += `<p class="info-ok">${T.info.maks}</p>`
    else if (n.stat) {
      krop += kravHtml(n.krav ?? [])
      krop += `<p class="info-tekst">${T.info.point(kamppoint())}</p>`
      krop += `<div class="handlinger">${knap('koeb', T.knap.brugPoint, kravOpfyldt(n) && kamppoint() > 0)}</div>`
    } else {
      const pris = def.pris[r]
      krop += raekke(T.info.pris, prisHtml(pris))
      krop += kravHtml(kravListe(n))
      const ok = n.modifier ? kravOpfyldt(n) : status === 'aaben'
      krop += `<div class="handlinger">${knap('koeb', `${T.knap.koeb} ${T.info.rank(r + 1, def.ranks).toLowerCase()}`, ok && kanBetale(pris))}</div>`
    }
  } else if (n.gear) {
    const harDen = spil.t.craftet.includes(n.id)
    const paa = spil.t.udrustet[n.gear.slot] === n.id
    krop += `<p class="info-tekst">${esc(effektTekst(n))} · ${esc(T.slot(n.gear.slot))}</p>`
    if (!harDen) {
      krop += raekke(T.info.pris, prisHtml(n.gear.pris))
      krop += raekke(T.info.xp, `${tal(n.gear.xp)} smedje`)
      krop += kravHtml(kravListe(n))
      krop += `<div class="handlinger">${knap('craft', T.knap.craft, kravOpfyldt(n) && kanBetale(n.gear.pris))}</div>`
    } else {
      krop += `<p class="info-ok">${paa ? T.info.taget : T.info.ejet}</p>`
      krop += `<div class="handlinger">${paa ? '' : knap('udrust', T.knap.tagPaa)}</div>`
    }
  } else if (n.type === 'slot') {
    const nu = spil.t.udrustet[n.slot]
    const muligheder = spil.t.craftet.filter(id => noder.get(id).gear.slot === n.slot)
    krop += raekke(T.info.taget, nu ? esc(noder.get(nu).navn) : T.info.tom)
    krop += muligheder.length
      ? `<ul class="valg">${muligheder.map(id => `<li>${nodeIkonHtml(noder.get(id), 32)}<span>${esc(noder.get(id).navn)} <small>${esc(T.effekt.gear(noder.get(id).gear.stats))}</small></span>${id === nu ? knap(`tagaf:${id}`, T.knap.tagAf, true, 'sekundaer') : knap(`tagpaa:${id}`, T.knap.tagPaa)}</li>`).join('')}</ul>`
      : `<p class="info-tekst">${T.info.ingenGear}</p>`
  } else if (n.type === 'socket' || (n.type === 'tilbygning' && spil.t.tilbygning)) {
    const nu = spil.t.sockets[n.socket]
    krop += raekke(T.typer.socket, nu ? esc(noder.get(nu).navn) : T.info.ledig)
    krop += spil.t.bygget.length
      ? `<ul class="valg">${spil.t.bygget.map(id => `<li>${nodeIkonHtml(noder.get(id), 32)}<span>${esc(noder.get(id).navn)} <small>${esc(effektTekst(noder.get(id)))}</small></span>${id === nu ? knap(`tagud:${id}`, T.knap.tagUd, true, 'sekundaer') : knap(`saeti:${id}`, T.knap.saetI)}</li>`).join('')}</ul>`
      : `<p class="info-tekst">${T.info.ingenBygninger}</p>`
  } else if (n.type === 'tilbygning') {
    krop += `<p class="info-tekst">${T.effekt.tilbygning}</p>`
    krop += raekke(T.info.pris, prisHtml(n.tilbygning.pris))
    krop += `<div class="handlinger">${knap('byg', T.knap.byg, kanBetale(n.tilbygning.pris))}</div>`
  } else if (n.bygning) {
    const bygget = spil.t.bygget.includes(n.id)
    krop += `<p class="info-tekst">${esc(effektTekst(n))}</p>`
    if (!bygget) {
      krop += raekke(T.info.pris, prisHtml(n.bygning.pris))
      krop += `<div class="handlinger">${knap('byg', T.knap.byg, kanBetale(n.bygning.pris))}</div>`
    } else {
      const i = spil.t.sockets.indexOf(n.id)
      krop += `<p class="info-ok">${i >= 0 ? T.info.iSocket : T.info.bygget}</p>`
      const ledig = spil.t.sockets.slice(0, socketAntal()).indexOf(null)
      krop += `<div class="handlinger">${i >= 0 ? knap(`tagud:${n.id}`, T.knap.tagUd, true, 'sekundaer') : knap(`saeti:${n.id}`, T.knap.saetI, ledig >= 0)}</div>`
    }
  } else if (n.monster) {
    const m = n.monster
    const s = spillerStats()
    krop += statsGrid({ atk: m.atk, hp: m.hp, def: m.def, tid: m.tid }, tema.farve('fjendeHp'))
    krop += raekke(T.info.xp, `${tal(m.xp)} kamp`)
    if (m.drop) krop += raekke('Drop', `${ressourceIkon(m.drop.ressource, 16)}${esc(T.info.drop(T.ressource(m.drop.ressource), m.drop.chance))}`)
    krop += `<p class="info-tekst">${n.dungeon ? T.info.dungeonForloeb : T.info.farming}</p>`
    const est = estimer(n.dungeon ? dungeonRaekke : [n.id])
    krop += `<p class="estimat ${est.vinder ? 'vinder' : 'taber'}">${n.dungeon
      ? (est.vinder ? T.info.estimatDungeonVinder(est.hp) : T.info.estimatDungeonTaber(noder.get(est.taberVed).navn))
      : (est.vinder ? T.info.estimatVinder(est.tid) : T.info.estimatTaber(est.tid))}</p>`
    krop += `<div class="dine"><div class="info-type">${T.info.dineStats}</div>${statsGrid(s, tema.farve('spillerHp'))}</div>`
    const iKamp = spil.t.aktivitet?.kamp && (spil.t.aktivitet.node === n.id || (n.dungeon && spil.t.aktivitet.dungeon))
    const doed = spil.t.genopliv > 0
    krop += `<div class="handlinger">${iKamp ? knap('stop', T.knap.stop, true, 'sekundaer') : knap('start', doed ? T.bjaelke.doed(spil.t.genopliv) : n.dungeon ? T.knap.dungeon : T.knap.kaemp, status === 'aaben' && !doed)}</div>`
  }
  return kopf + `<div class="info-krop">${krop}</div>`
}

let sidsteInfo = ''
function visInfo() {
  const panel = $('info')
  if (!valgtId) { panel.hidden = true; sidsteInfo = ''; return }
  const n = noder.get(valgtId)
  const html = infoIndhold(n)
  if (html !== sidsteInfo) { panel.innerHTML = html; sidsteInfo = html }
  panel.style.setProperty('--farve', tema.klyngeFarve(n.klynge))
  panel.hidden = false
}
export const opdaterInfo = () => { infoSnavset = true }

function handling(h) {
  const n = noder.get(valgtId)
  const [type, arg] = h.split(':')
  let ok = true
  if (type === 'luk') return vaelg(null)
  if (type === 'start') ok = startAktivitet(n.id)
  if (type === 'stop') stopAktivitet()
  if (type === 'koeb') ok = koebRank(n.id)
  if (type === 'craft') ok = craft(n.id)
  if (type === 'udrust') ok = udrust(n.gear.slot, n.id)
  if (type === 'tagpaa') ok = udrust(n.slot, arg)
  if (type === 'tagaf') ok = udrust(n.slot, null)
  if (type === 'byg') ok = byg(n.id)
  if (type === 'saeti') {
    const index = n.socket ?? spil.t.sockets.slice(0, socketAntal()).indexOf(null)
    ok = saetISocket(index, arg)
  }
  if (type === 'tagud') { const i = spil.t.sockets.indexOf(arg); if (i >= 0) ok = saetISocket(i, null) }
  if (!ok) besked(T.besked.manglerRessourcer(n.navn), 'advarsel')
  markerSnavset()
  visInfo()
}

export function vaelg(id) {
  valgtId = id
  saetValgt(id)
  if (id) {
    const i = spil.t.uset.indexOf(id)
    if (i >= 0) spil.t.uset.splice(i, 1)
  }
  visInfo()
}

// Ressourcelinje og spillerens HP
let sidsteRes = ''
function tegnTop() {
  const s = spillerStats()
  const res = spil.t.sete.map(r => `<span class="res" title="${esc(T.ressource(r))}">${ressourceIkon(r)}<b>${tal(Math.floor(spil.t.ressourcer[r]))}</b></span>`).join('')
  if (res !== sidsteRes) { $('ressourcer').innerHTML = res; sidsteRes = res }
  const hp = Math.max(0, spil.t.hp ?? s.hp)
  $('spiller-hp-fyld').style.width = `${(hp / s.hp) * 100}%`
  $('spiller-hp-tekst').textContent = spil.t.genopliv > 0 ? T.bjaelke.doed(spil.t.genopliv) : `HP ${tal(Math.ceil(hp))} / ${tal(s.hp)}`
}

// Aktivitetsbjælken og pilen i skærmkanten
let bjaelkeNoegle = ''
function tegnBjaelke() {
  const a = spil.t.aktivitet
  const bj = $('bjaelke'), pil = $('kantpil')
  const doed = spil.t.genopliv > 0
  if (!a && !doed) { bj.hidden = true; pil.hidden = true; bjaelkeNoegle = ''; return }
  const n = a ? noder.get(a.node) : null
  let synlig = false, skaerm = null
  if (n) {
    const pos = a.kamp ? [n.pos[0] + n.kampPlads[0] / 2, n.pos[1] + n.kampPlads[1] / 2] : n.pos
    skaerm = tilSkaerm(pos[0], pos[1])
    const m = 40
    synlig = skaerm.x > m && skaerm.y > m && skaerm.x < innerWidth - m && skaerm.y < innerHeight - m && !langtUde()
  }
  bj.hidden = synlig && !doed
  if (!bj.hidden) {
    const noegle = `${a?.node ?? 'doed'}-${a?.kamp ? 'k' : 'a'}`
    if (noegle !== bjaelkeNoegle) {
      bjaelkeNoegle = noegle
      if (!a) bj.innerHTML = `<div class="bj-tekst"><b>${T.besked.doed}</b><small data-bj-doed></small></div>`
      else if (a.kamp) bj.innerHTML = `<div class="bj-mini">${nodeIkonHtml({ ...noder.get('rotte'), ikon: 'portraetter/spiller', navn: 'Dig' }, 34)}<i class="bj-timer spiller"><i data-bj-pt></i></i><i class="bj-hp spiller"><i data-bj-php></i></i></div>
          <div class="bj-mini" data-bj-monster>${nodeIkonHtml(n, 34)}<i class="bj-timer fjende"><i data-bj-mt></i></i><i class="bj-hp fjende"><i data-bj-mhp></i></i></div>
          <div class="bj-tekst"><b data-bj-titel></b><small data-bj-under></small></div>${knap('bj-stop', T.knap.stop, true, 'sekundaer lille')}`
      else bj.innerHTML = `${nodeIkonHtml(n, 34)}<div class="bj-tekst"><b>${esc(n.navn)}</b><i class="bj-fremdrift"><i data-bj-f></i></i></div>${knap('bj-stop', T.knap.stop, true, 'sekundaer lille')}`
      bj.style.setProperty('--farve', n ? tema.klyngeFarve(n.klynge) : 'var(--fjende-hp)')
    }
    if (!a) bj.querySelector('[data-bj-doed]').textContent = T.bjaelke.doed(spil.t.genopliv)
    else if (a.kamp) {
      const s = spillerStats()
      const mn = noder.get(a.node)
      if (bj.querySelector('[data-bj-monster] img')?.getAttribute('src') !== tema.url(mn.ikon) && tema.har(mn.ikon)) bj.querySelector('[data-bj-monster]').firstElementChild.outerHTML = nodeIkonHtml(mn, 34)
      bj.querySelector('[data-bj-pt]').style.width = `${Math.min(1, a.spillerT / s.tid) * 100}%`
      bj.querySelector('[data-bj-php]').style.width = `${Math.max(0, spil.t.hp / s.hp) * 100}%`
      bj.querySelector('[data-bj-mt]').style.width = `${a.respawn > 0 ? 0 : Math.min(1, a.fjendeT / mn.monster.tid) * 100}%`
      bj.querySelector('[data-bj-mhp]').style.width = `${a.respawn > 0 ? 0 : Math.max(0, a.fjendeHp / mn.monster.hp) * 100}%`
      const i = dungeonRaekke.indexOf(mn.id)
      bj.querySelector('[data-bj-titel]').textContent = a.dungeon ? T.bjaelke.dungeon(mn.navn, i + 1, dungeonRaekke.length) : T.bjaelke.kamp(mn.navn)
      bj.querySelector('[data-bj-under]').textContent = a.respawn > 0 ? T.bjaelke.venter : `${T.bjaelke.drab(a.drab)} · ${T.bjaelke.gaaTil}`
    } else {
      bj.querySelector('[data-bj-f]').style.width = `${Math.min(1, a.t / aktivitetsTid(a.node)) * 100}%`
    }
  }
  if (n && !synlig && skaerm && !langtUde() && (skaerm.x < 0 || skaerm.y < 0 || skaerm.x > innerWidth || skaerm.y > innerHeight)) {
    const cx = innerWidth / 2, cy = innerHeight / 2
    const dx = skaerm.x - cx, dy = skaerm.y - cy
    const k = Math.min((innerWidth / 2 - 30) / Math.abs(dx || 1e-6), (innerHeight / 2 - (dy > 0 ? 90 : 60)) / Math.abs(dy || 1e-6))
    pil.hidden = false
    pil.style.transform = `translate(${cx + dx * k}px, ${cy + dy * k}px) rotate(${Math.atan2(dy, dx)}rad)`
    pil.style.setProperty('--farve', tema.klyngeFarve(n.klynge))
  } else pil.hidden = true
}
function gaaTilAktivitet() {
  const a = spil.t.aktivitet
  if (!a) return
  const n = noder.get(a.node)
  const p = a.kamp ? [n.pos[0] + n.kampPlads[0] / 2, n.pos[1] + n.kampPlads[1] / 2] : n.pos
  flyvTil(p[0], p[1], 0.9)
}

// Beskeder
export function besked(tekst, klasse = '') {
  const b = document.createElement('div')
  b.className = `besked ${klasse}`
  b.textContent = tekst
  const liste = $('beskeder')
  liste.appendChild(b)
  while (liste.children.length > 4) liste.firstElementChild.remove()
  setTimeout(() => b.classList.add('vaek'), 3200)
  setTimeout(() => b.remove(), 3800)
}

// Udviklerpanel
function tegnUdvikler() {
  const p = $('udvikler')
  p.innerHTML = `<h3>${T.udvikler.titel}</h3>
    <div class="raekke"><span>${T.udvikler.fart}</span><span>${[1, 5, 20, 60].map(f => `<button class="knap lille ${spil.fart === f ? '' : 'sekundaer'}" data-fart="${f}">${f}×</button>`).join('')}</span></div>
    <button class="knap sekundaer" data-dev="ressourcer">${T.udvikler.ressourcer}</button>
    <button class="knap sekundaer" data-dev="levels">${T.udvikler.xp}</button>
    <button class="knap sekundaer" data-dev="afsloer">${T.udvikler.afsloer}</button>
    <button class="knap sekundaer" data-dev="altSynligt">${T.udvikler.altSynligt}</button>
    <button class="knap fare" data-dev="nulstil">${T.knap.nulstil}</button>
    <p class="info-tekst"><small>${T.udvikler.note}</small></p>`
}

export function opsaetUi() {
  document.title = T.titel
  $('knap-hjem').textContent = T.knap.centrer
  $('knap-udvikler').textContent = T.knap.udvikler
  $('knap-hjem').addEventListener('click', () => flyvTil(VERDEN.start[0], VERDEN.start[1], 0.8))
  $('knap-udvikler').addEventListener('click', () => { const p = $('udvikler'); p.hidden = !p.hidden; if (!p.hidden) tegnUdvikler() })
  $('udvikler').addEventListener('click', e => {
    const f = e.target.closest('[data-fart]')
    if (f) { spil.fart = Number(f.dataset.fart); tegnUdvikler(); return }
    const d = e.target.closest('[data-dev]')?.dataset.dev
    if (d === 'nulstil') { if (confirm(T.knap.nulstil + '?')) { nulstil(); vaelg(null); markerSnavset() } return }
    if (d === 'altSynligt') { if (confirm(T.udvikler.altSynligtSpoerg)) { udvikler.altSynligt(); vaelg(null); markerSnavset(); flyvTil(1850, 1450, 0.42) } return }
    if (d && udvikler[d]) { udvikler[d](); markerSnavset(); opdaterInfo() }
  })
  const info = $('info')
  info.addEventListener('pointerdown', () => { pegerPaaPanel = true })
  window.addEventListener('pointerup', () => { pegerPaaPanel = false })
  info.addEventListener('click', e => { const h = e.target.closest('[data-handling]')?.dataset.handling; if (h) handling(h) })
  $('bjaelke').addEventListener('click', e => {
    if (e.target.closest('[data-handling="bj-stop"]')) { stopAktivitet(); return }
    gaaTilAktivitet()
  })
  $('kantpil').addEventListener('click', gaaTilAktivitet)
  window.addEventListener('keydown', e => {
    if (e.key === 'Escape') vaelg(null)
  })
}

export function uiFrame() {
  tegnTop()
  tegnBjaelke()
  if (infoSnavset && !pegerPaaPanel && valgtId) { infoSnavset = false; visInfo() }
}

