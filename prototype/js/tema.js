// Indlæser temaet: farver, skrifttyper, lag og hvilke assets der findes.
// Spilkoden spørger kun efter asset-id'er; mangler en fil, tegner kortet en pladsholder.

const ROD = '../temaer'

export const tema = {
  navn: 'stjernekort',
  data: null,
  manifest: null,
  findes: new Map(),
  url(id) {
    const a = this.manifest?.assets.find(x => x.id === id)
    return `${ROD}/${this.navn}/${id}.${a?.format ?? 'png'}`
  },
  har(id) { return this.findes.get(id) === true },
  farve(noegle) {
    if (!noegle) return '#ffffff'
    if (noegle.startsWith('#')) return noegle
    return this.data.farver.klynger[noegle] ?? this.data.farver[noegle] ?? '#ffffff'
  },
  klyngeFarve(klynge) { return this.data.farver.klynger[klynge] ?? this.data.farver.linje },
}

function proevBillede(url) {
  return new Promise(resolve => {
    const img = new Image()
    const timer = setTimeout(() => resolve(false), 8000)
    img.onload = () => { clearTimeout(timer); resolve(true) }
    img.onerror = () => { clearTimeout(timer); resolve(false) }
    img.src = url
  })
}

export async function indlaesTema(navn) {
  tema.navn = navn
  const [manifest, data] = await Promise.all([
    fetch(`${ROD}/asset-manifest.json`).then(r => r.json()),
    fetch(`${ROD}/${navn}/tema.json`).then(r => r.json()),
  ])
  tema.manifest = manifest
  tema.data = data

  const rodStil = document.documentElement.style
  const f = data.farver
  const vars = {
    baggrund: f.baggrund, nodeflade: f.nodeflade, nodekant: f.nodekant, linje: f.linje, tekst: f.tekst,
    'tekst-daempet': f.tekstDaempet, 'spiller-hp': f.spillerHp, 'fjende-hp': f.fjendeHp, taage: f.taage, silhuet: f.silhuet,
  }
  for (const [k, v] of Object.entries(vars)) if (v) rodStil.setProperty(`--${k}`, v)
  for (const [k, v] of Object.entries(f.klynger)) rodStil.setProperty(`--k-${k}`, v)

  const skrift = data.skrifttyper ?? {}
  const familier = Object.values(skrift).filter(s => s.kilde === 'Google Fonts')
  if (familier.length) {
    const q = familier.map(s => `family=${encodeURIComponent(s.familie)}:wght@${(s.vaegte ?? [400]).join(';')}`).join('&')
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = `https://fonts.googleapis.com/css2?${q}&display=swap`
    document.head.appendChild(link)
  }
  if (skrift.overskrift) rodStil.setProperty('--skrift-overskrift', `'${skrift.overskrift.familie}', Georgia, serif`)
  if (skrift.broedtekst) rodStil.setProperty('--skrift-broed', `'${skrift.broedtekst.familie}', system-ui, sans-serif`)

  const resultater = await Promise.all(manifest.assets.map(async a => [a.id, await proevBillede(tema.url(a.id))]))
  for (const [id, ok] of resultater) tema.findes.set(id, ok)
  const mangler = resultater.filter(([, ok]) => !ok).map(([id]) => id)
  if (mangler.length) console.info(`Temaet "${navn}" mangler ${mangler.length} assets, der vises som pladsholdere:`, mangler)
  return tema
}
