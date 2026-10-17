// Tests of the world layout (prototype/js/world.js), its format and the dev server's save endpoint. Run with: npm test
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL, fileURLToPath } from 'node:url'

const { NODES, EDGES, CLUSTERS, LANDMARKS, LAYOUT, edgeKey } = await import('../prototype/js/data.js')
const { formatWorld, validateWorld } = await import('../prototype/js/world-format.js')
const root = fileURLToPath(new URL('..', import.meta.url))
const worldFile = join(root, 'prototype', 'js', 'world.js')

test('the layout has a position for every node and cluster header, and nothing stale', () => {
  assert.deepEqual(Object.keys(LAYOUT.nodes).sort(), NODES.map(n => n.id).sort())
  assert.deepEqual(Object.keys(LAYOUT.headers).sort(), Object.keys(CLUSTERS).sort())
  assert.deepEqual(Object.keys(LAYOUT.landmarks).sort(), LANDMARKS.map(l => l.id).sort())
  const edges = new Set(EDGES.map(([a, b]) => edgeKey(a, b)))
  for (const k of Object.keys(LAYOUT.bends)) assert.ok(edges.has(k), `bend for an edge that does not exist: ${k}`)
})

test('every node lies inside the world', () => {
  const [w, h] = LAYOUT.size
  for (const n of NODES) assert.ok(n.pos[0] >= 0 && n.pos[0] <= w && n.pos[1] >= 0 && n.pos[1] <= h, `${n.id} is outside the world`)
})

test('world.js is valid and written in the editor\'s format', () => {
  assert.equal(validateWorld(LAYOUT), null)
  assert.equal(readFileSync(worldFile, 'utf8').replace(/\r\n/g, '\n'), formatWorld(LAYOUT))
})

test('the format reads back to the same layout', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'world-'))
  try {
    const changed = structuredClone(LAYOUT)
    changed.nodes.oak = [1234, 567]
    changed.bends['oak|willow'] = -80
    writeFileSync(join(dir, 'world.js'), formatWorld(changed))
    const back = (await import(pathToFileURL(join(dir, 'world.js')).href)).default
    assert.deepEqual(back, changed)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('invalid layouts are rejected', () => {
  assert.match(validateWorld(null), /not an object/)
  assert.match(validateWorld({ ...LAYOUT, nodes: { oak: [1, 'x'] } }), /nodes/)
  assert.match(validateWorld({ ...LAYOUT, size: [0, 100] }), /size/)
  assert.match(validateWorld({ ...LAYOUT, roads: [[[0, 0], [1]]] }), /roads/)
  assert.match(validateWorld({ ...LAYOUT, landmarks: { tower: { pos: [0, 0] } } }), /landmarks/)
})

test('the dev server saves a valid layout and refuses an invalid one', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'world-save-'))
  const file = join(dir, 'world.js')
  const port = 5300 + Math.floor(Math.random() * 500)
  const server = spawn(process.execPath, [join(root, 'tools', 'serve.mjs')], { env: { ...process.env, PORT: String(port), WORLD_FILE: file } })
  try {
    await new Promise((resolve, reject) => {
      server.stdout.on('data', d => { if (String(d).includes('running')) resolve() })
      server.on('error', reject)
      setTimeout(() => reject(new Error('the server did not start')), 5000)
    })
    const url = `http://127.0.0.1:${port}/api/world`
    const changed = structuredClone(LAYOUT)
    changed.nodes.oak = [1111, 222]
    const ok = await fetch(url, { method: 'PUT', body: JSON.stringify(changed) })
    assert.equal(ok.status, 200)
    assert.equal(readFileSync(file, 'utf8'), formatWorld(changed))
    const bad = await fetch(url, { method: 'PUT', body: JSON.stringify({ ...changed, nodes: 'none' }) })
    assert.equal(bad.status, 400)
    assert.equal(readFileSync(file, 'utf8'), formatWorld(changed))
    assert.equal((await fetch(url)).status, 405)
    const foreign = await fetch(url, { method: 'PUT', headers: { Origin: 'https://example.com' }, body: JSON.stringify(changed) })
    assert.equal(foreign.status, 403)
  } finally {
    server.kill()
    rmSync(dir, { recursive: true, force: true })
  }
})
