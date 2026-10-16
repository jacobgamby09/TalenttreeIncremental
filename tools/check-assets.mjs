// Checks a theme's files against themes/asset-manifest.json and the theme's theme.json.
// Usage: node tools/check-assets.mjs [theme folder] [manifest]
// Defaults: themes/starchart and themes/asset-manifest.json
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs'
import { join, relative, resolve, dirname, extname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { inflateSync } from 'node:zlib'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const themeDir = resolve(root, process.argv[2] ?? 'themes/starchart')
const manifestPath = resolve(root, process.argv[3] ?? 'themes/asset-manifest.json')

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
const errors = []
const warnings = []
const missing = { P1: [], P2: [], P3: [] }
const wrongFormat = new Set()
const FORMATS = ['png', 'jpg', 'webp', 'svg']
let ok = 0

// The manifest's fields
const seen = new Set()
for (const a of manifest.assets) {
  const folder = a.id?.split('/')[0]
  const spec = manifest.folders?.[folder]
  if (!/^[a-z0-9-]+\/[a-z0-9-]+$/.test(a.id ?? '')) errors.push(`manifest: invalid id "${a.id}"`)
  if (seen.has(a.id)) errors.push(`manifest: the id ${a.id} appears more than once`)
  seen.add(a.id)
  if (!spec) errors.push(`manifest: ${a.id} is in a folder that is not listed under "folders"`)
  if (!['P1', 'P2', 'P3'].includes(a.priority)) errors.push(`manifest: ${a.id} has an invalid priority "${a.priority}"`)
  if (!['game', 'theme'].includes(a.role)) errors.push(`manifest: ${a.id} has an invalid role "${a.role}"`)
  if (!FORMATS.includes(a.format)) errors.push(`manifest: ${a.id} has an unknown format "${a.format}"`)
  if (!['transparent', 'opaque'].includes(a.background)) errors.push(`manifest: ${a.id} has an invalid background "${a.background}"`)
  if (!Number.isInteger(a.width) || !Number.isInteger(a.height) || a.width <= 0 || a.height <= 0) errors.push(`manifest: ${a.id} lacks a valid width and height`)
  if (a.tintable && !['png', 'svg'].includes(a.format)) errors.push(`manifest: ${a.id} is tintable, but tintable files must be png or svg`)
  for (const key of ['width', 'height', 'format', 'background']) {
    if (spec?.[key] !== undefined && spec[key] !== a[key]) errors.push(`manifest: ${a.id} has ${key} ${a[key]}, but the folder requires ${spec[key]}`)
  }
}

// The theme's theme.json: which theme assets are used, and whether the colors exist
const themePath = join(themeDir, 'theme.json')
const byId = new Map(manifest.assets.map(a => [a.id, a]))
const usedThemeAssets = new Set()
if (!existsSync(themePath)) {
  errors.push('theme.json is missing from the theme folder')
} else {
  const theme = JSON.parse(readFileSync(themePath, 'utf8'))
  const refs = [
    ...(theme.backgroundLayers ?? []).map(l => l.asset),
    theme.fog?.asset, theme.clusterVeil?.asset, theme.portraitBackground,
  ].filter(Boolean)
  for (const id of refs) {
    usedThemeAssets.add(id)
    const a = byId.get(id)
    if (a && a.role !== 'theme') errors.push(`theme.json: ${id} has role "${a.role}" in the manifest, not "theme"`)
    if (!a && !FORMATS.some(f => existsSync(join(themeDir, `${id}.${f}`)))) errors.push(`theme.json: ${id} exists neither in the manifest nor as a file`)
  }
  const colorRefs = [...(theme.backgroundLayers ?? []).map(l => l.color), theme.fog?.color, theme.silhouettes?.color].filter(Boolean)
  for (const c of colorRefs) if (!/^#/.test(c) && !(c in (theme.colors ?? {}))) errors.push(`theme.json: the color "${c}" is not defined under colors`)
  const templates = theme.prompts?.addons ?? {}
  for (const a of manifest.assets) {
    if (a.addon !== null && a.addon !== undefined && !(a.addon in templates)) errors.push(`theme.json: the prompt template "${a.addon}" for ${a.id} does not exist`)
  }
}

function readPng(buf) {
  if (buf.length < 8 || buf.readUInt32BE(0) !== 0x89504e47) throw new Error('not a valid PNG')
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

// Decodes non-interlaced PNGs (all color types and bit depths) to 8-bit RGBA. Returns null for interlaced files.
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
  if (buf[0] !== 0xff || buf[1] !== 0xd8) throw new Error('not a valid JPEG')
  let pos = 2
  while (pos < buf.length) {
    if (buf[pos] !== 0xff) { pos++; continue }
    const marker = buf[pos + 1]
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return { height: buf.readUInt16BE(pos + 5), width: buf.readUInt16BE(pos + 7), hasAlpha: false }
    }
    pos += 2 + buf.readUInt16BE(pos + 2)
  }
  throw new Error('found no image dimensions in the JPEG')
}

function readWebp(buf) {
  if (buf.toString('ascii', 0, 4) !== 'RIFF' || buf.toString('ascii', 8, 12) !== 'WEBP') throw new Error('not a valid WebP')
  const chunk = buf.toString('ascii', 12, 16)
  if (chunk === 'VP8X') return { width: 1 + buf.readUIntLE(24, 3), height: 1 + buf.readUIntLE(27, 3), hasAlpha: (buf[20] & 0x10) !== 0 }
  if (chunk === 'VP8L') {
    const bits = buf.readUInt32LE(21)
    return { width: 1 + (bits & 0x3fff), height: 1 + ((bits >> 14) & 0x3fff), hasAlpha: ((bits >> 28) & 1) === 1 }
  }
  if (chunk === 'VP8 ') return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff, hasAlpha: false }
  throw new Error(`unknown WebP variant (${chunk})`)
}

const WHITE = ['#fff', '#ffffff', 'white', 'rgb(255,255,255)']
function checkSvg(asset, text) {
  const rootTag = text.match(/<svg\b[^>]*>/i)
  if (!rootTag) return errors.push(`${asset.id}: not a valid SVG`)
  if (!/xmlns\s*=\s*["']http:\/\/www\.w3\.org\/2000\/svg["']/.test(rootTag[0])) errors.push(`${asset.id}: lacks xmlns="http://www.w3.org/2000/svg" (without it, it does not show as an image or mask)`)
  const viewBox = rootTag[0].match(/viewBox\s*=\s*["']([^"']+)["']/i)
  const want = `0 0 ${asset.width} ${asset.height}`
  if (!viewBox || viewBox[1].trim().split(/[\s,]+/).join(' ') !== want) errors.push(`${asset.id}: viewBox must be "${want}"`)
  for (const tag of ['text', 'image', 'foreignObject', 'linearGradient', 'radialGradient', 'filter', 'pattern', 'mask', 'clipPath', 'script', 'style', 'use']) {
    if (new RegExp(`<${tag}\\b`, 'i').test(text)) errors.push(`${asset.id}: <${tag}> is not allowed in a glyph`)
  }
  const fills = [...text.matchAll(/(?<![\w-])fill\s*[:=]\s*["']?\s*([^"';>]+?)\s*["';>]/gi)].map(m => m[1].toLowerCase().replace(/\s+/g, ''))
  const strokes = [...text.matchAll(/(?<![\w-])stroke\s*[:=]\s*["']?\s*([^"';>]+?)\s*["';>]/gi)].map(m => m[1].toLowerCase().replace(/\s+/g, ''))
  const badFill = [...new Set(fills.filter(c => !WHITE.includes(c) && c !== 'none'))]
  if (badFill.length) errors.push(`${asset.id}: the glyph may only use white fill (#FFFFFF), but uses ${badFill.join(', ')}`)
  if (!fills.some(c => WHITE.includes(c))) errors.push(`${asset.id}: no white fill; without it the shapes turn black`)
  if (strokes.some(c => c !== 'none')) errors.push(`${asset.id}: stroke is not allowed; convert outlines to filled paths`)
  if (/(?<![\w-])(fill-|stroke-)?opacity\s*[:=]/i.test(text)) errors.push(`${asset.id}: opacity is not allowed in a glyph`)
  if (!/<(path|rect|circle|ellipse|polygon|polyline|line)\b/i.test(text)) errors.push(`${asset.id}: the glyph contains no shapes`)
}

function checkPixels(asset, rgba, w, h) {
  const alphaAt = (x, y) => rgba[(y * w + x) * 4 + 3]
  const folder = asset.id.split('/')[0]
  if (asset.background === 'transparent' && !asset.seamless) {
    const allowBottom = (asset.edge_allowed ?? []).includes('bottom')
    let opaqueEdge = 0
    const rows = allowBottom ? [0, 1] : [0, 1, h - 2, h - 1]
    for (let x = 0; x < w; x++) for (const y of rows) if (alphaAt(x, y) > 8) opaqueEdge++
    for (let y = 0; y < (allowBottom ? h - 2 : h); y++) for (const x of [0, 1, w - 2, w - 1]) if (alphaAt(x, y) > 8) opaqueEdge++
    if (opaqueEdge > 0) errors.push(`${asset.id}: the edge is not fully transparent (${opaqueEdge} visible pixels in the outer 2 px); the subject must not touch ${allowBottom ? 'the top or sides' : 'the edge'}`)
    const target = manifest.folders?.[folder]?.fill
    if (target) {
      let minX = w, minY = h, maxX = -1, maxY = -1
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (alphaAt(x, y) > 8) {
        if (x < minX) minX = x; if (x > maxX) maxX = x; if (y < minY) minY = y; if (y > maxY) maxY = y
      }
      if (maxX >= 0) {
        const fill = Math.round(100 * Math.max(maxX - minX + 1, maxY - minY + 1) / Math.max(w, h))
        // Busts cut off at the bottom naturally fill the width, so only the lower limit applies
        if (fill < target - 8 || (fill > target + 6 && !allowBottom)) warnings.push(`${asset.id}: the subject's longest side fills ${fill}% of the canvas; the target for ${folder} is about ${target}%`)
        const top = Math.round(100 * minY / h)
        if (allowBottom && top > 16) warnings.push(`${asset.id}: the subject starts ${top}% from the top and sits too low; scale the bust up so the top is about 8-14% from the top and the eyes about 40%`)
      }
    }
  }
  if (asset.tintable) {
    let colored = 0, visible = 0
    for (let i = 0; i < rgba.length; i += 4) {
      if (rgba[i + 3] < 32) continue
      visible++
      if (Math.min(rgba[i], rgba[i + 1], rgba[i + 2]) < 225) colored++
    }
    if (visible === 0) errors.push(`${asset.id}: the file is completely empty`)
    else if (colored / visible > 0.02) errors.push(`${asset.id}: must be white with the shape in the alpha, but ${Math.round(100 * colored / visible)}% of the visible pixels are colored`)
  }
  if (asset.seamless) {
    // The difference across the seam compared with neighboring pixels at 1/4 and 3/4 of the image
    const px = (x, y) => (y * w + x) * 4
    const diff = (a, b) => Math.abs(rgba[a] - rgba[b]) + Math.abs(rgba[a + 1] - rgba[b + 1]) + Math.abs(rgba[a + 2] - rgba[b + 2]) + Math.abs(rgba[a + 3] - rgba[b + 3])
    const q = [Math.floor(w / 4), Math.floor(3 * w / 4)], r = [Math.floor(h / 4), Math.floor(3 * h / 4)]
    let seamX = 0, innerX = 0, seamY = 0, innerY = 0
    for (let y = 0; y < h; y++) { seamX += diff(px(w - 1, y), px(0, y)); innerX += (diff(px(q[0] - 1, y), px(q[0], y)) + diff(px(q[1] - 1, y), px(q[1], y))) / 2 }
    for (let x = 0; x < w; x++) { seamY += diff(px(x, h - 1), px(x, 0)); innerY += (diff(px(x, r[0] - 1), px(x, r[0])) + diff(px(x, r[1] - 1), px(x, r[1]))) / 2 }
    if (seamX > 2.5 * innerX + 2 * h) warnings.push(`${asset.id}: the left and right edges do not match; the tile may show a visible seam`)
    if (seamY > 2.5 * innerY + 2 * w) warnings.push(`${asset.id}: the top and bottom do not match; the tile may show a visible seam`)
  }
}

for (const asset of manifest.assets) {
  if (asset.role === 'theme' && existsSync(themePath) && !usedThemeAssets.has(asset.id)) continue
  const folder = asset.id.split('/')[0]
  const file = join(themeDir, `${asset.id}.${asset.format}`)
  if (!existsSync(file)) {
    const others = FORMATS.filter(f => f !== asset.format && existsSync(join(themeDir, `${asset.id}.${f}`)))
    if (others.length) {
      errors.push(`${asset.id}: found as .${others[0]}, but the manifest requires .${asset.format}`)
      wrongFormat.add(`${asset.id}.${others[0]}`)
    } else (missing[asset.priority] ?? missing.P3).push(asset.id)
    continue
  }
  try {
    const buf = readFileSync(file)
    const before = errors.length
    const maxKb = manifest.folders?.[folder]?.max_kb
    if (maxKb && buf.length > maxKb * 1024) warnings.push(`${asset.id}: is ${Math.round(buf.length / 1024)} KB; the limit for ${folder} is ${maxKb} KB`)
    if (asset.format === 'svg') {
      checkSvg(asset, buf.toString('utf8'))
    } else {
      let info
      if (asset.format === 'png') info = readPng(buf)
      else if (asset.format === 'jpg') info = readJpeg(buf)
      else if (asset.format === 'webp') info = readWebp(buf)
      if (info.width !== asset.width || info.height !== asset.height) {
        errors.push(`${asset.id}: is ${info.width}×${info.height}, must be ${asset.width}×${asset.height}`)
      }
      if (asset.background === 'transparent' && !info.hasAlpha) errors.push(`${asset.id}: lacks an alpha channel (transparent background)`)
      if (asset.background === 'opaque' && info.hasAlpha) warnings.push(`${asset.id}: is opaque in the manifest, but the file has an alpha channel`)
      if (asset.format === 'png') {
        if (info.bitDepth !== 8 || info.interlace !== 0 || info.colorType === 3) warnings.push(`${asset.id}: save as 8-bit RGBA without interlace and without a palette`)
        if (asset.background === 'transparent' || asset.tintable || asset.seamless) {
          const rgba = decodePng(info)
          if (rgba) checkPixels(asset, rgba, info.width, info.height)
          else errors.push(`${asset.id}: cannot be pixel-checked (interlaced); save without interlace`)
        }
      } else if (asset.seamless) {
        warnings.push(`${asset.id}: the seam check only runs on PNG; test the ${asset.format} tile as 3×3`)
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
for (const f of extra) warnings.push(`${f}: not in the manifest (a typo in the name?)`)

const required = manifest.assets.filter(a => a.role === 'game' || usedThemeAssets.has(a.id) || !existsSync(themePath)).length
const shown = relative(root, themeDir)
console.log(`Theme: ${shown && !shown.startsWith('..') ? shown : themeDir}`)
console.log(`${ok} of ${required} assets are delivered and approved.`)
for (const p of ['P1', 'P2', 'P3']) {
  if (missing[p].length) console.log(`Missing ${p} (${missing[p].length}): ${missing[p].join(', ')}`)
}
if (warnings.length) console.log(`\nWarnings:\n- ${warnings.join('\n- ')}`)
if (errors.length) console.log(`\nErrors:\n- ${errors.join('\n- ')}`)
process.exit(errors.length || missing.P1.length ? 1 : 0)
