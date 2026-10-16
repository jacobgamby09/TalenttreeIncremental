// Lille statisk server til prototypen. Serverer hele projektmappen, så prototypen kan hente temaer/.
// Brug: node tools/serve.mjs  (åbn derefter http://localhost:5173/prototype/)
import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { join, resolve, dirname, extname, normalize, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const port = Number(process.env.PORT ?? 5173)
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.md': 'text/plain; charset=utf-8',
}

createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost')
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
    res.end('Ikke fundet')
  }
}).listen(port, () => console.log(`Prototypen kører på http://localhost:${port}/prototype/`))
