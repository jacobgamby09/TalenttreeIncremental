// Loads the theme: colors, fonts, layers and which assets exist.
// The game code only asks for asset ids; if a file is missing, the map draws a placeholder.

const ROOT = '../themes'

export const theme = {
  name: 'starchart',
  data: null,
  manifest: null,
  exists: new Map(),
  url(id) {
    const a = this.manifest?.assets.find(x => x.id === id)
    return `${ROOT}/${this.name}/${id}.${a?.format ?? 'png'}`
  },
  has(id) { return this.exists.get(id) === true },
  color(key) {
    if (!key) return '#ffffff'
    if (key.startsWith('#')) return key
    return this.data.colors.clusters[key] ?? this.data.colors[key] ?? '#ffffff'
  },
  clusterColor(cluster) { return this.data.colors.clusters[cluster] ?? this.data.colors.line },
}

function probeImage(url) {
  return new Promise(resolve => {
    const img = new Image()
    const timer = setTimeout(() => resolve(false), 8000)
    img.onload = () => { clearTimeout(timer); resolve(true) }
    img.onerror = () => { clearTimeout(timer); resolve(false) }
    img.src = url
  })
}

export async function loadTheme(name) {
  theme.name = name
  const [manifest, data] = await Promise.all([
    fetch(`${ROOT}/asset-manifest.json`).then(r => r.json()),
    fetch(`${ROOT}/${name}/theme.json`).then(r => r.json()),
  ])
  theme.manifest = manifest
  theme.data = data

  const rootStyle = document.documentElement.style
  const c = data.colors
  const vars = {
    background: c.background, 'node-fill': c.nodeFill, 'node-border': c.nodeBorder, line: c.line, text: c.text,
    'text-muted': c.textMuted, 'player-hp': c.playerHp, 'enemy-hp': c.enemyHp, fog: c.fog, silhouette: c.silhouette,
  }
  for (const [k, v] of Object.entries(vars)) if (v) rootStyle.setProperty(`--${k}`, v)
  for (const [k, v] of Object.entries(c.clusters)) rootStyle.setProperty(`--cluster-${k}`, v)

  const fonts = data.fonts ?? {}
  const families = Object.values(fonts).filter(f => f.source === 'Google Fonts')
  if (families.length) {
    const q = families.map(f => `family=${encodeURIComponent(f.family)}:wght@${(f.weights ?? [400]).join(';')}`).join('&')
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = `https://fonts.googleapis.com/css2?${q}&display=swap`
    document.head.appendChild(link)
  }
  if (fonts.heading) rootStyle.setProperty('--font-heading', `'${fonts.heading.family}', Georgia, serif`)
  if (fonts.body) rootStyle.setProperty('--font-body', `'${fonts.body.family}', system-ui, sans-serif`)

  const results = await Promise.all(manifest.assets.map(async a => [a.id, await probeImage(theme.url(a.id))]))
  for (const [id, ok] of results) theme.exists.set(id, ok)
  const missing = results.filter(([, ok]) => !ok).map(([id]) => id)
  if (missing.length) console.info(`The theme "${name}" is missing ${missing.length} assets, shown as placeholders:`, missing)
  return theme
}
