// Tjekker et temas filer mod temaer/asset-manifest.json og temaets tema.json.
// Brug: node tools/tjek-assets.mjs [temamappe] [manifest]
// Standard: temaer/stjernekort og temaer/asset-manifest.json
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs'
import { join, relative, resolve, dirname, extname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { inflateSync } from 'node:zlib'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const themeDir = resolve(root, process.argv[2] ?? 'temaer/stjernekort')
const manifestPath = resolve(root, process.argv[3] ?? 'temaer/asset-manifest.json')

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
const errors = []
const warnings = []
const missing = { P1: [], P2: [], P3: [] }
const wrongFormat = new Set()
const FORMATS = ['png', 'jpg', 'webp', 'svg']
let ok = 0

// Manifestets felter
const seen = new Set()
for (const a of manifest.assets) {
  const folder = a.id?.split('/')[0]
  const spec = manifest.mapper?.[folder]
  if (!/^[a-z0-9-]+\/[a-z0-9-]+$/.test(a.id ?? '')) errors.push(`manifest: ugyldigt id "${a.id}"`)
  if (seen.has(a.id)) errors.push(`manifest: id'et ${a.id} står flere gange`)
  seen.add(a.id)
  if (!spec) errors.push(`manifest: ${a.id} ligger i en mappe, der ikke står under "mapper"`)
  if (!['P1', 'P2', 'P3'].includes(a.prioritet)) errors.push(`manifest: ${a.id} har ugyldig prioritet "${a.prioritet}"`)
  if (!['spil', 'tema'].includes(a.rolle)) errors.push(`manifest: ${a.id} har ugyldig rolle "${a.rolle}"`)
  if (!FORMATS.includes(a.format)) errors.push(`manifest: ${a.id} har ukendt format "${a.format}"`)
  if (!['transparent', 'opak'].includes(a.baggrund)) errors.push(`manifest: ${a.id} har ugyldig baggrund "${a.baggrund}"`)
  if (!Number.isInteger(a.bredde) || !Number.isInteger(a.hoejde) || a.bredde <= 0 || a.hoejde <= 0) errors.push(`manifest: ${a.id} mangler gyldig bredde og højde`)
  if (a.toenbar && !['png', 'svg'].includes(a.format)) errors.push(`manifest: ${a.id} er tonbar, men tonbare filer skal være png eller svg`)
  for (const key of ['bredde', 'hoejde', 'format', 'baggrund']) {
    if (spec?.[key] !== undefined && spec[key] !== a[key]) errors.push(`manifest: ${a.id} har ${key} ${a[key]}, men mappen kræver ${spec[key]}`)
  }
}

// Temaets tema.json: hvilke tema-assets der bruges, og om farverne findes
const temaPath = join(themeDir, 'tema.json')
const byId = new Map(manifest.assets.map(a => [a.id, a]))
const usedThemeAssets = new Set()
if (!existsSync(temaPath)) {
  errors.push('tema.json mangler i temamappen')
} else {
  const tema = JSON.parse(readFileSync(temaPath, 'utf8'))
  const refs = [
    ...(tema.baggrundslag ?? []).map(l => l.asset),
    tema.taage?.asset, tema.klyngesloer?.asset, tema.portraetbaggrund,
  ].filter(Boolean)
  for (const id of refs) {
    usedThemeAssets.add(id)
    const a = byId.get(id)
    if (a && a.rolle !== 'tema') errors.push(`tema.json: ${id} har rolle "${a.rolle}" i manifestet, ikke "tema"`)
    if (!a && !FORMATS.some(f => existsSync(join(themeDir, `${id}.${f}`)))) errors.push(`tema.json: ${id} findes hverken i manifestet eller som fil`)
  }
  const colorRefs = [...(tema.baggrundslag ?? []).map(l => l.farve), tema.taage?.farve, tema.silhuetter?.farve].filter(Boolean)
  for (const c of colorRefs) if (!/^#/.test(c) && !(c in (tema.farver ?? {}))) errors.push(`tema.json: farven "${c}" findes ikke under farver`)
  const templates = tema.prompts?.tillaeg ?? {}
  for (const a of manifest.assets) {
    if (a.tillaeg !== null && a.tillaeg !== undefined && !(a.tillaeg in templates)) errors.push(`tema.json: promptskabelonen "${a.tillaeg}" til ${a.id} findes ikke`)
  }
}

function readPng(buf) {
  if (buf.length < 8 || buf.readUInt32BE(0) !== 0x89504e47) throw new Error('ikke en gyldig PNG')
  let pos = 8
  const info = { idat: [], palette: null, trns: null }
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos)
    const type = buf.toString('ascii', pos + 4, pos + 8)
    const data = buf.subarray(pos + 8, pos + 8 + len)
    if (type === 'IHDR') {
      info.width = data.readUInt32BE(0)
      info.height = data.readUInt32BE(4)
      info.bitDepth = data[8]
      info.colorType = data[9]
      info.interlace = data[12]
    } else if (type === 'PLTE') info.palette = data
    else if (type === 'tRNS') info.trns = data
    else if (type === 'IDAT') info.idat.push(data)
    else if (type === 'IEND') break
    pos += 12 + len
  }
  info.hasAlpha = info.colorType === 4 || info.colorType === 6 || info.trns !== null
  return info
}

// Afkoder PNG'er uden interlace (alle farvetyper og bitdybder) til 8-bit RGBA. Returnerer null ved interlace.
function decodePng(info) {
  const channels = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[info.colorType]
  if (!channels || info.interlace !== 0) return null
  const bits = info.bitDepth
  const bpp = Math.max(1, (channels * bits) >> 3)
  const stride = Math.ceil((info.width * channels * bits) / 8)
  const raw = inflateSync(Buffer.concat(info.idat))
  const out = Buffer.alloc(info.width * info.height * 4)
  let prev = Buffer.alloc(stride)
  const sample = (line, x, c) => {
    const i = x * channels + c
    if (bits === 8) return line[i]
    if (bits === 16) return line[i * 2]
    const perByte = 8 / bits
    return (line[Math.floor(i / perByte)] >> (8 - bits * (1 + (i % perByte)))) & ((1 << bits) - 1)
  }
  const scale = v => (bits < 8 && info.colorType !== 3 ? Math.round(v * 255 / ((1 << bits) - 1)) : v)
  for (let y = 0; y < info.height; y++) {
    const filter = raw[y * (stride + 1)]
    const line = Buffer.from(raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1)))
    for (let i = 0; i < stride; i++) {
      const a = i >= bpp ? line[i - bpp] : 0
      const b = prev[i]
      const c = i >= bpp ? prev[i - bpp] : 0
      let add = 0
      if (filter === 1) add = a
      else if (filter === 2) add = b
      else if (filter === 3) add = (a + b) >> 1
      else if (filter === 4) {
        const p = a + b - c
        const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c)
        add = pa <= pb && pa <= pc ? a : pb <= pc ? b : c
      }
      line[i] = (line[i] + add) & 0xff
    }
    for (let x = 0; x < info.width; x++) {
      const d = (y * info.width + x) * 4
      if (info.colorType === 3) {
        const idx = sample(line, x, 0)
        out[d] = info.palette[idx * 3]; out[d + 1] = info.palette[idx * 3 + 1]; out[d + 2] = info.palette[idx * 3 + 2]
        out[d + 3] = info.trns && idx < info.trns.length ? info.trns[idx] : 255
      } else if (channels <= 2) {
        out[d] = out[d + 1] = out[d + 2] = scale(sample(line, x, 0))
        out[d + 3] = channels === 2 ? scale(sample(line, x, 1)) : 255
      } else {
        out[d] = scale(sample(line, x, 0)); out[d + 1] = scale(sample(line, x, 1)); out[d + 2] = scale(sample(line, x, 2))
        out[d + 3] = channels === 4 ? scale(sample(line, x, 3)) : 255
      }
    }
    prev = line
  }
  return out
}

function readJpeg(buf) {
  if (buf[0] !== 0xff || buf[1] !== 0xd8) throw new Error('ikke en gyldig JPEG')
  let pos = 2
  while (pos < buf.length) {
    if (buf[pos] !== 0xff) { pos++; continue }
    const marker = buf[pos + 1]
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return { height: buf.readUInt16BE(pos + 5), width: buf.readUInt16BE(pos + 7), hasAlpha: false }
    }
    pos += 2 + buf.readUInt16BE(pos + 2)
  }
  throw new Error('fandt ingen billeddimensioner i JPEG')
}

function readWebp(buf) {
  if (buf.toString('ascii', 0, 4) !== 'RIFF' || buf.toString('ascii', 8, 12) !== 'WEBP') throw new Error('ikke en gyldig WebP')
  const chunk = buf.toString('ascii', 12, 16)
  if (chunk === 'VP8X') return { width: 1 + buf.readUIntLE(24, 3), height: 1 + buf.readUIntLE(27, 3), hasAlpha: (buf[20] & 0x10) !== 0 }
  if (chunk === 'VP8L') {
    const bits = buf.readUInt32LE(21)
    return { width: 1 + (bits & 0x3fff), height: 1 + ((bits >> 14) & 0x3fff), hasAlpha: ((bits >> 28) & 1) === 1 }
  }
  if (chunk === 'VP8 ') return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff, hasAlpha: false }
  throw new Error(`ukendt WebP-variant (${chunk})`)
}

const WHITE = ['#fff', '#ffffff', 'white', 'rgb(255,255,255)']
function checkSvg(asset, text) {
  const rootTag = text.match(/<svg\b[^>]*>/i)
  if (!rootTag) return errors.push(`${asset.id}: ikke en gyldig SVG`)
  if (!/xmlns\s*=\s*["']http:\/\/www\.w3\.org\/2000\/svg["']/.test(rootTag[0])) errors.push(`${asset.id}: mangler xmlns="http://www.w3.org/2000/svg" (ellers vises den ikke som billede eller maske)`)
  const viewBox = rootTag[0].match(/viewBox\s*=\s*["']([^"']+)["']/i)
  const want = `0 0 ${asset.bredde} ${asset.hoejde}`
  if (!viewBox || viewBox[1].trim().split(/[\s,]+/).join(' ') !== want) errors.push(`${asset.id}: viewBox skal være "${want}"`)
  for (const tag of ['text', 'image', 'foreignObject', 'linearGradient', 'radialGradient', 'filter', 'pattern', 'mask', 'clipPath', 'script', 'style', 'use']) {
    if (new RegExp(`<${tag}\\b`, 'i').test(text)) errors.push(`${asset.id}: <${tag}> er ikke tilladt i en glyf`)
  }
  const fills = [...text.matchAll(/(?<![\w-])fill\s*[:=]\s*["']?\s*([^"';>]+?)\s*["';>]/gi)].map(m => m[1].toLowerCase().replace(/\s+/g, ''))
  const strokes = [...text.matchAll(/(?<![\w-])stroke\s*[:=]\s*["']?\s*([^"';>]+?)\s*["';>]/gi)].map(m => m[1].toLowerCase().replace(/\s+/g, ''))
  const badFill = [...new Set(fills.filter(c => !WHITE.includes(c) && c !== 'none'))]
  if (badFill.length) errors.push(`${asset.id}: glyffen må kun bruge hvid fyld (#FFFFFF), men bruger ${badFill.join(', ')}`)
  if (!fills.some(c => WHITE.includes(c))) errors.push(`${asset.id}: ingen hvid fill; uden den bliver figurerne sorte`)
  if (strokes.some(c => c !== 'none')) errors.push(`${asset.id}: stroke er ikke tilladt; konvertér konturer til udfyldte paths`)
  if (/(?<![\w-])(fill-|stroke-)?opacity\s*[:=]/i.test(text)) errors.push(`${asset.id}: opacity er ikke tilladt i en glyf`)
  if (!/<(path|rect|circle|ellipse|polygon|polyline|line)\b/i.test(text)) errors.push(`${asset.id}: glyffen indeholder ingen figurer`)
}

function checkPixels(asset, rgba, w, h) {
  const alphaAt = (x, y) => rgba[(y * w + x) * 4 + 3]
  const folder = asset.id.split('/')[0]
  if (asset.baggrund === 'transparent' && !asset.soemloes) {
    const allowBottom = (asset.kant_tilladt ?? []).includes('bund')
    let opaqueEdge = 0
    const rows = allowBottom ? [0, 1] : [0, 1, h - 2, h - 1]
    for (let x = 0; x < w; x++) for (const y of rows) if (alphaAt(x, y) > 8) opaqueEdge++
    for (let y = 0; y < (allowBottom ? h - 2 : h); y++) for (const x of [0, 1, w - 2, w - 1]) if (alphaAt(x, y) > 8) opaqueEdge++
    if (opaqueEdge > 0) errors.push(`${asset.id}: kanten er ikke helt transparent (${opaqueEdge} synlige pixels i de yderste 2 px); motivet må ikke røre ${allowBottom ? 'top og sider' : 'kanten'}`)
    const target = manifest.mapper?.[folder]?.fyld
    if (target) {
      let minX = w, minY = h, maxX = -1, maxY = -1
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (alphaAt(x, y) > 8) {
        if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y
      }
      if (maxX >= 0) {
        const fill = Math.round(100 * Math.max(maxX - minX + 1, maxY - minY + 1) / Math.max(w, h))
        // Buster, der skæres ved bunden, fylder naturligt bredden ud, så kun den nedre grænse gælder
        if (fill < target - 8 || (fill > target + 6 && !allowBottom)) warnings.push(`${asset.id}: motivets længste side fylder ${fill}% af lærredet; målet for ${folder} er ca. ${target}%`)
        const top = Math.round(100 * minY / h)
        if (allowBottom && top > 16) warnings.push(`${asset.id}: motivet starter ${top}% fra toppen og sidder for lavt; skalér busten op, så toppen er ca. 8-14% fra toppen og øjnene ca. 40%`)
      }
    }
  }
  if (asset.toenbar) {
    let colored = 0, visible = 0
    for (let i = 0; i < rgba.length; i += 4) {
      if (rgba[i + 3] < 32) continue
      visible++
      if (Math.min(rgba[i], rgba[i + 1], rgba[i + 2]) < 225) colored++
    }
    if (visible === 0) errors.push(`${asset.id}: filen er helt tom`)
    else if (colored / visible > 0.02) errors.push(`${asset.id}: skal være hvid med formen i alfa, men ${Math.round(100 * colored / visible)}% af de synlige pixels er farvede`)
  }
  if (asset.soemloes) {
    // Forskellen hen over sømmen sammenlignet med nabopixels ved 1/4 og 3/4 af billedet
    const px = (x, y) => (y * w + x) * 4
    const diff = (a, b) => Math.abs(rgba[a] - rgba[b]) + Math.abs(rgba[a + 1] - rgba[b + 1]) + Math.abs(rgba[a + 2] - rgba[b + 2]) + Math.abs(rgba[a + 3] - rgba[b + 3])
    const q = [Math.floor(w / 4), Math.floor(3 * w / 4)], r = [Math.floor(h / 4), Math.floor(3 * h / 4)]
    let seamX = 0, innerX = 0, seamY = 0, innerY = 0
    for (let y = 0; y < h; y++) { seamX += diff(px(w - 1, y), px(0, y)); innerX += (diff(px(q[0] - 1, y), px(q[0], y)) + diff(px(q[1] - 1, y), px(q[1], y))) / 2 }
    for (let x = 0; x < w; x++) { seamY += diff(px(x, h - 1), px(x, 0)); innerY += (diff(px(x, r[0] - 1), px(x, r[0])) + diff(px(x, r[1] - 1), px(x, r[1]))) / 2 }
    if (seamX > 2.5 * innerX + 2 * h) warnings.push(`${asset.id}: venstre og højre kant passer ikke sammen; flisen kan få en synlig søm`)
    if (seamY > 2.5 * innerY + 2 * w) warnings.push(`${asset.id}: top og bund passer ikke sammen; flisen kan få en synlig søm`)
  }
}

for (const asset of manifest.assets) {
  if (asset.rolle === 'tema' && existsSync(temaPath) && !usedThemeAssets.has(asset.id)) continue
  const folder = asset.id.split('/')[0]
  const file = join(themeDir, `${asset.id}.${asset.format}`)
  if (!existsSync(file)) {
    const others = FORMATS.filter(f => f !== asset.format && existsSync(join(themeDir, `${asset.id}.${f}`)))
    if (others.length) {
      errors.push(`${asset.id}: fundet som .${others[0]}, men manifestet kræver .${asset.format}`)
      wrongFormat.add(`${asset.id}.${others[0]}`)
    } else (missing[asset.prioritet] ?? missing.P3).push(asset.id)
    continue
  }
  try {
    const buf = readFileSync(file)
    const before = errors.length
    const maxKb = manifest.mapper?.[folder]?.maks_kb
    if (maxKb && buf.length > maxKb * 1024) warnings.push(`${asset.id}: fylder ${Math.round(buf.length / 1024)} KB, grænsen for ${folder} er ${maxKb} KB`)
    if (asset.format === 'svg') {
      checkSvg(asset, buf.toString('utf8'))
    } else {
      let info
      if (asset.format === 'png') info = readPng(buf)
      else if (asset.format === 'jpg') info = readJpeg(buf)
      else if (asset.format === 'webp') info = readWebp(buf)
      if (info.width !== asset.bredde || info.height !== asset.hoejde) {
        errors.push(`${asset.id}: er ${info.width}×${info.height}, skal være ${asset.bredde}×${asset.hoejde}`)
      }
      if (asset.baggrund === 'transparent' && !info.hasAlpha) errors.push(`${asset.id}: mangler alfakanal (transparent baggrund)`)
      if (asset.baggrund === 'opak' && info.hasAlpha) warnings.push(`${asset.id}: er opak i manifestet, men filen har alfakanal`)
      if (asset.format === 'png') {
        if (info.bitDepth !== 8 || info.interlace !== 0 || info.colorType === 3) warnings.push(`${asset.id}: gem som 8-bit RGBA uden interlace og uden palet`)
        if (asset.baggrund === 'transparent' || asset.toenbar || asset.soemloes) {
          const rgba = decodePng(info)
          if (rgba) checkPixels(asset, rgba, info.width, info.height)
          else errors.push(`${asset.id}: kan ikke pixeltjekkes (interlace); gem uden interlace`)
        }
      } else if (asset.soemloes) {
        warnings.push(`${asset.id}: sømtjek udføres kun for PNG; test ${asset.format}-flisen som 3×3`)
      }
    }
    if (errors.length === before) ok++
  } catch (e) {
    errors.push(`${asset.id}: ${e.message}`)
  }
}

const known = new Set(manifest.assets.map(a => `${a.id}.${a.format}`))
const themeRefs = new Set([...usedThemeAssets].flatMap(id => FORMATS.map(f => `${id}.${f}`)))
function walk(dir) {
  if (!existsSync(dir)) return []
  return readdirSync(dir).flatMap(name => {
    const p = join(dir, name)
    return statSync(p).isDirectory() ? walk(p) : [relative(themeDir, p).split('\\').join('/')]
  })
}
const extra = walk(themeDir).filter(f => FORMATS.includes(extname(f).slice(1)) && !known.has(f) && !wrongFormat.has(f) && !themeRefs.has(f))
for (const f of extra) warnings.push(`${f}: findes ikke i manifestet (stavefejl i navnet?)`)

const required = manifest.assets.filter(a => a.rolle === 'spil' || usedThemeAssets.has(a.id) || !existsSync(temaPath)).length
const shown = relative(root, themeDir)
console.log(`Tema: ${shown && !shown.startsWith('..') ? shown : themeDir}`)
console.log(`${ok} af ${required} assets er leveret og godkendt.`)
for (const p of ['P1', 'P2', 'P3']) {
  if (missing[p].length) console.log(`Mangler ${p} (${missing[p].length}): ${missing[p].join(', ')}`)
}
if (warnings.length) console.log(`\nAdvarsler:\n- ${warnings.join('\n- ')}`)
if (errors.length) console.log(`\nFejl:\n- ${errors.join('\n- ')}`)
process.exit(errors.length || missing.P1.length ? 1 : 0)
