// Small static server for the prototype. Serves the whole project folder, so the prototype can load themes/.
// It also lets the map editor (?edit) save the layout to prototype/js/world.js, but only from this computer.
// Usage: node tools/serve.mjs  (then open http://localhost:5173/prototype/)
import { createServer } from 'node:http'
import { readFile, stat, writeFile, rename } from 'node:fs/promises'
import { join, resolve, dirname, extname, normalize, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { formatWorld, validateWorld } from '../prototype/js/world-format.js'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const port = Number(process.env.PORT ?? 5173)
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.md': 'text/plain; charset=utf-8',
}

// WORLD_FILE can point elsewhere, so the tests never touch the real layout
const WORLD_FILE = process.env.WORLD_FILE ?? join(root, 'prototype', 'js', 'world.js')
const LOOPBACK = new Set(['127.0.0.1', '::1', '::ffff:127.0.0.1'])
const reply = (res, code, text) => { res.writeHead(code, { 'Content-Type': 'text/plain; charset=utf-8' }); res.end(text) }

async function saveWorld(req, res) {
  const origin = req.headers.origin
  if (!LOOPBACK.has(req.socket.remoteAddress) || (origin && !/^http:\/\/(localhost|127\.0\.0\.1|\[::1\]):\d+$/.test(origin))) return reply(res, 403, 'The map editor can only save from this computer')
  let body = ''
  for await (const chunk of req) {
    body += chunk
    if (body.length > 2_000_000) return reply(res, 413, 'The layout is too large')
  }
  let world
  try { world = JSON.parse(body) } catch { return reply(res, 400, 'The layout is not valid JSON') }
  const problem = validateWorld(world)
  if (problem) return reply(res, 400, `The layout is not valid: ${problem}`)
  const text = formatWorld(world)
  try {
    await writeFile(WORLD_FILE + '.tmp', text)
    await rename(WORLD_FILE + '.tmp', WORLD_FILE)
  } catch {
    // OneDrive and virus scanners sometimes lock the file during a rename; a direct write is the fallback
    try { await writeFile(WORLD_FILE, text) } catch (e) { return reply(res, 500, `Could not write world.js: ${e.message}`) }
  }
  console.log('Saved the map layout to prototype/js/world.js')
  reply(res, 200, 'Saved')
}

createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost')
    if (url.pathname === '/api/world') return req.method === 'PUT' ? await saveWorld(req, res) : reply(res, 405, 'Use PUT')
    let path = decodeURIComponent(url.pathname)
    if (path === '/') { res.writeHead(302, { Location: '/prototype/' }); return res.end() }
    const file = normalize(join(root, path))
    if (file !== root && !file.startsWith(root + sep)) { res.writeHead(403); return res.end() }
    let target = file
    if ((await stat(target)).isDirectory()) target = join(target, 'index.html')
    const body = await readFile(target)
    res.writeHead(200, { 'Content-Type': TYPES[extname(target).toLowerCase()] ?? 'application/octet-stream', 'Cache-Control': 'no-store' })
    res.end(body)
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end('Not found')
  }
}).listen(port, () => console.log(`The prototype is running at http://localhost:${port}/prototype/`))
