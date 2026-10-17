// Startup and game loop.
import { CLUSTERS, RESOURCES, OFFLINE_MIN_SEC } from './data.js'
import { game, nodes, tick, computeStatus, load, save, useDemo, simulateOffline } from './game.js'
import { loadTheme } from './theme.js'
import { setupMap, frame, markDirty, flyTo, runReveal, keepHidden, nodePop, playerPop, shake, toScreen } from './map.js'
import { setupUi, uiFrame, select, showMessage, updateInfo, showOffline } from './ui.js'
import { T, num } from './text.js'
import { setupEditor, editorFrame } from './editor.js'

const params = new URLSearchParams(location.search)
const themeName = params.get('theme') ?? 'starchart'
const demo = params.get('load') === 'all' ? 'all' : null
// The map editor shows the saved game read-only: no ticking, no offline progress and no saving
const editMode = params.has('edit')

async function start() {
  await loadTheme(themeName)
  if (demo) useDemo(demo)
  load()
  const offline = editMode ? null : runOffline()
  setupMap({ onSelect: id => select(id) })
  if (demo) flyTo(1850, 1450, 0.42, 1)
  setupUi()
  bindEvents()
  if (editMode) setupEditor()
  document.getElementById('loader').remove()
  if (offline) {
    const play = () => offline.clusters.forEach(k => runReveal(k, () => showMessage(T.message.newCluster(CLUSTERS[k].name), 'big')))
    if (offline.activity) showOffline(offline, play)
    else play()
  }

  let last = performance.now()
  let statusClock = 0, saveClock = 0
  const loop = now => {
    const dt = Math.min(0.25, (now - last) / 1000)
    last = now
    if (editMode) editorFrame()
    else {
      tick(dt)
      statusClock += dt
      if (statusClock > 0.25) {
        statusClock = 0
        const before = [...game.status.values()].join()
        computeStatus()
        if ([...game.status.values()].join() !== before) { markDirty(); updateInfo() }
      }
      saveClock += dt
      if (saveClock > 5) { saveClock = 0; save() }
    }
    frame(now)
    uiFrame()
    requestAnimationFrame(loop)
  }
  requestAnimationFrame(loop)
  if (!editMode) window.addEventListener('beforeunload', save)
  window.game = game
}

// The time since the last save runs as offline progress before the map is drawn.
// Clusters revealed in the meantime stay hidden, so the reveal can be seen when the summary closes.
function runOffline() {
  const away = game.state.savedAt ? (Date.now() - game.state.savedAt) / 1000 : 0
  if (away < OFFLINE_MIN_SEC) return null
  const r = simulateOffline(away)
  const clusters = r.events.filter(e => e.type === 'reveal').map(e => e.data.cluster)
  for (const k of clusters) keepHidden(k)
  save()
  return { ...r, clusters }
}

function bindEvents() {
  game.on('levelUp', ({ skill, lvl }) => { showMessage(T.message.levelUp(skill, lvl), 'level'); markDirty(); updateInfo() })
  game.on('yield', ({ id, resource, amount }) => { nodePop(id, `+${num(amount)} ${RESOURCES[resource].name.toLowerCase()}`, 'yield'); updateInfo() })
  game.on('hit', ({ by, damage, crit }) => {
    const a = game.state.activity
    if (!a) return
    if (by === 'player') { nodePop(a.node, `−${num(damage)}`, crit ? 'crit' : 'damage'); shake(a.node) }
    else if (by === 'thorns') nodePop(a.node, `−${num(damage)}`, 'thorns')
    else { playerPop(`−${num(damage)}`, 'damage-player'); shake('player') }
  })
  game.on('heal', ({ amount }) => playerPop(`+${num(amount)}`, 'heal'))
  game.on('kill', () => { markDirty(); updateInfo() })
  game.on('newMonster', () => markDirty())
  game.on('activity', ({ id }) => {
    markDirty()
    updateInfo()
    const a = game.state.activity
    if (a?.combat && id) {
      const n = nodes.get(id)
      const p = toScreen(n.pos[0], n.pos[1])
      const outside = p.x < 80 || p.y < 80 || p.x > innerWidth - 80 || p.y > innerHeight - 80
      if (outside || a.dungeon) flyTo(n.pos[0] + n.combatOffset[0] / 2, n.pos[1] + n.combatOffset[1] / 2, 0.95)
    }
  })
  game.on('death', ({ dungeon }) => { showMessage(dungeon ? T.message.dungeonLost : T.message.died, 'warning'); markDirty(); updateInfo() })
  game.on('revived', () => { showMessage(T.message.revived); updateInfo() })
  game.on('bossDefeated', ({ id }) => { showMessage(T.message.bossDefeated(nodes.get(id).name), 'big'); markDirty(); updateInfo() })
  game.on('reveal', ({ cluster }) => runReveal(cluster, () => showMessage(T.message.newCluster(CLUSTERS[cluster].name), 'big')))
  game.on('newNode', ({ id }) => {
    const n = nodes.get(id)
    if (n.monster && !n.dungeon) showMessage(T.message.newDiscovery(n.name))
    markDirty()
  })
  game.on('crafted', ({ id }) => { showMessage(T.message.crafted(nodes.get(id).name)); markDirty(); updateInfo() })
  game.on('built', ({ id }) => { showMessage(T.message.built(nodes.get(id).name)); markDirty(); updateInfo() })
  game.on('changed', () => { markDirty(); updateInfo() })
  game.on('message', ({ text, name }) => { if (text === 'missing') showMessage(T.message.missingResources(name), 'warning'); updateInfo() })
}

start().catch(e => {
  console.error(e)
  const el = document.getElementById('loader')
  if (el) el.textContent = `The prototype could not start: ${e.message}. Run it with node tools/serve.mjs.`
})
