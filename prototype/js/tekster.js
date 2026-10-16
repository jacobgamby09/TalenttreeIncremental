// Alle tekster i prototypen samlet ét sted, så sproget kan skiftes.
import { RESSOURCER, SKILLS, SLOTS } from './data.js'

export const tal = (v, dec = 0) => Number(v).toLocaleString('da-DK', { minimumFractionDigits: dec, maximumFractionDigits: dec })
export const sek = v => `${tal(v, 1)} sek.`
export const pct = v => `${tal(v * 100, 0)}%`

export const T = {
  titel: 'Talenttræet',
  laster: 'Indlæser temaet …',
  lvl: n => `Lvl ${n}`,
  xp: (n, af) => `${tal(n)} / ${tal(af)} XP`,
  kamppoint: n => (n === 1 ? '1 kamppoint' : `${n} kamppoint`),
  sockets: (n, af) => `${n}/${af} sockets`,
  ressource: id => RESSOURCER[id]?.navn ?? id,
  skill: id => (id === 'smeltning' ? 'Smeltning' : SKILLS[id]?.navn ?? id),
  slot: id => SLOTS[id] ?? id,

  typer: {
    aktivitet: 'Aktivitet', modifier: 'Opgradering', gear: 'Udrustning', bygning: 'Bygning', slot: 'Udrustningsslot',
    socket: 'Bygnings-socket', tilbygning: 'Tilbygning', monster: 'Monster', stat: 'Kampegenskab', passiv: 'Opdagelse', ukendt: 'Ukendt',
  },

  krav: {
    skill: (s, l) => `Kræver ${T.skill(s)} lvl ${l}`,
    boss: navn => `Kræver at ${navn} er besejret`,
    stat: (navn, p) => `Kræver ${p} point i ${navn}`,
    drab: (navn, n, har) => `Bliver synlig, når ${n} ${navn.toLowerCase()} er besejret (${Math.min(har, n)}/${n})`,
    synligSkill: (s, l) => `Bliver synlig ved ${T.skill(s)} lvl ${l}`,
  },

  knap: {
    start: 'Start', stop: 'Stop', kaemp: 'Kæmp', dungeon: 'Gå ind i dungeonen', koeb: 'Køb', craft: 'Craft', byg: 'Byg',
    tagPaa: 'Tag på', tagAf: 'Tag af', saetI: 'Sæt i socket', tagUd: 'Tag ud', brugPoint: 'Brug kamppoint', luk: 'Luk',
    gaaTil: 'Gå til', centrer: 'Hjem', udvikler: 'Udvikler', nulstil: 'Nulstil spillet',
  },

  info: {
    tid: 'Tid', xp: 'XP', giver: 'Giver', bruger: 'Bruger', pris: 'Pris', effekt: 'Effekt', rank: (r, af) => `Rank ${r}/${af}`,
    rankLabel: 'Rank', maks: 'Fuldt opgraderet', ejet: 'Craftet', bygget: 'Bygget', aktiv: 'Kører nu', taget: 'Taget på', tom: 'Tomt',
    ingenGear: 'Du har ikke craftet noget til dette slot endnu.', ingenBygninger: 'Du har ikke bygget noget endnu.',
    iSocket: 'Står i en socket', ledig: 'Ledig', besejret: 'Besejret', ukendt: 'Noget gemmer sig her.',
    dungeonForloeb: 'Monstrene kommer i rækkefølge, og dine HP følger med. Dør du, starter dungeonen forfra.',
    farming: 'Når monsteret dør, kommer der automatisk et nyt. Dine HP følger med fra kamp til kamp.',
    drop: (navn, chance) => `${pct(chance)} chance for ${navn.toLowerCase()}`,
    estimatVinder: s => `Du vinder på ca. ${tal(s)} sek.`,
    estimatTaber: s => `Du taber efter ca. ${tal(s)} sek.`,
    estimatDungeonVinder: hp => `Du klarer hele dungeonen med ca. ${tal(hp)} HP tilbage.`,
    estimatDungeonTaber: navn => `Du falder sandsynligvis ved ${navn}.`,
    dineStats: 'Dine stats',
    point: (n) => `Ubrugte kamppoint: ${n}`,
    gratis: 'Gratis',
  },

  effekt: {
    tid: (pr, maal) => `${pr > 0 ? '+' : '−'}${tal(Math.abs(pr), 1)} sek. på ${maal} pr. rank`,
    dobbelt: (pr, maal) => `+${pct(pr)} chance for dobbelt ${maal} pr. rank`,
    braendsel: pr => `${pct(pr)} chance for ikke at bruge brændsel pr. rank`,
    fart: (pr, skill) => `${T.skill(skill)} ${pct(pr)} hurtigere`,
    atk: pr => `+${pr} ATK`,
    hpPrDrab: pr => `+${pr} HP efter hvert besejret monster`,
    stat: e => Object.entries(e).map(([k, v]) => ({ atk: `+${v} ATK pr. rank`, def: `+${v} DEF pr. rank`, hp: `+${v} max HP pr. rank`, tid: `−${tal(-v, 1)} sek. angrebstid pr. rank`, crit: `+${pct(v)} chance for dobbelt skade pr. rank` }[k])).join(', '),
    gear: s => Object.entries(s).map(([k, v]) => `+${v} ${k.toUpperCase()}`).join(', '),
    xpBonus: (pr, skill) => `+${pct(pr)} XP i ${T.skill(skill).toLowerCase()}`,
    torne: pr => `Fjender tager ${pr} skade, når de rammer dig`,
    urtemedicin: (pr, i) => `Helbreder ${pct(pr)} HP hvert ${i}. sek. i kamp`,
    baeredygtig: (xp, tid) => `Eg giver +${xp} XP, men tager ${tal(tid, 1)} sek. længere`,
    tilbygning: 'Giver socket nr. 3',
  },

  besked: {
    levelOp: (skill, lvl) => `${T.skill(skill)} er nu lvl ${lvl}`,
    manglerRessourcer: navn => `Ikke nok ressourcer til ${navn.toLowerCase()}`,
    stoppet: 'Aktiviteten er stoppet',
    doed: 'Du blev besejret. Dine HP er fulde igen om 10 sek.',
    dungeonTabt: 'Du faldt i dungeonen og må starte forfra',
    nyOpdagelse: navn => `Ny opdagelse: ${navn}`,
    nyKlynge: navn => `En ny klynge er dukket op: ${navn}`,
    bossBesejret: navn => `${navn} er besejret`,
    craftet: navn => `${navn} er craftet`,
    bygget: navn => `${navn} er bygget`,
    genoplivet: 'Dine HP er fulde igen',
  },

  bjaelke: {
    kamp: navn => `Kamp: ${navn}`,
    dungeon: (navn, i, af) => `Den hule eg: ${navn} (${i}/${af})`,
    drab: n => `Drab ${n}`,
    gaaTil: 'Klik for at gå dertil',
    venter: 'Næste monster …',
    doed: s => `Genopliver om ${tal(Math.ceil(s))} sek.`,
  },

  udvikler: {
    titel: 'Udvikler',
    fart: 'Spilfart',
    ressourcer: '+100 af alle ressourcer',
    xp: '+1 level i alle skills',
    afsloer: 'Vis alle klynger',
    altSynligt: 'Indlæs: alt synligt',
    altSynligtSpoerg: 'Erstat dit spil med et, hvor hele kortet er synligt? Brug ?load=alt i adressen, hvis du vil beholde dit eget spil.',
    note: 'Kun til afprøvning af prototypen.',
  },
}
