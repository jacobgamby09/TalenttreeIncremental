// Reads and writes the world layout file (world.js). Shared by the map editor, the dev server and the tests.

const point = p => Array.isArray(p) && p.length === 2 && p.every(Number.isFinite)
const pointMap = o => o && typeof o === 'object' && !Array.isArray(o) && Object.values(o).every(point)

// Returns null when the layout is valid, otherwise a short description of the first problem
export function validateWorld(w) {
  if (!w || typeof w !== 'object') return 'the layout is not an object'
  if (!point(w.size) || w.size.some(v => v <= 0)) return 'size must be [width, height]'
  if (!point(w.start)) return 'start must be [x, y]'
  if (!pointMap(w.nodes)) return 'nodes must map ids to [x, y]'
  if (!pointMap(w.headers)) return 'headers must map cluster ids to [x, y]'
  const lm = w.landmarks
  if (!lm || typeof lm !== 'object' || !Object.values(lm).every(l => point(l?.pos) && Number.isFinite(l?.size) && l.size > 0)) return 'landmarks must map ids to { pos, size }'
  if (!w.bends || typeof w.bends !== 'object' || !Object.values(w.bends).every(Number.isFinite)) return 'bends must map edge keys to numbers'
  if (!Array.isArray(w.roads) || !w.roads.every(r => Array.isArray(r) && point(r[0]) && point(r[1]) && Number.isFinite(r[2] ?? 0))) return 'roads must be [[x, y], [x, y], bend]'
  return null
}

const key = k => (/^[a-zA-Z_$][\w$]*$/.test(k) ? k : `'${k}'`)
const num = v => String(Math.round(v))
const pt = p => `[${num(p[0])}, ${num(p[1])}]`
const block = (name, open, close, lines) => (lines.length ? [`  ${name}: ${open}`, ...lines, `  ${close},`] : [`  ${name}: ${open}${close},`])
const entries = (o, fmt) => Object.entries(o).map(([k, v]) => `    ${key(k)}: ${fmt(v)},`)

// The file is formatted with one entry per line, so changes are easy to read in a diff
export function formatWorld(w) {
  const bends = Object.fromEntries(Object.entries(w.bends).filter(([, v]) => Math.round(v) !== 0))
  return [
    '// World layout: where nodes, cluster headers and landmarks sit on the map, how edges bend, and the size of the world.',
    '// Written by the map editor (open the prototype with ?edit). Hand edits are fine; keep the format.',
    'export default {',
    `  size: ${pt(w.size)},`,
    `  start: ${pt(w.start)},`,
    ...block('nodes', '{', '}', entries(w.nodes, pt)),
    ...block('headers', '{', '}', entries(w.headers, pt)),
    ...block('landmarks', '{', '}', entries(w.landmarks, l => `{ pos: ${pt(l.pos)}, size: ${num(l.size)} }`)),
    ...block('bends', '{', '}', entries(bends, num)),
    ...block('roads', '[', ']', w.roads.map(r => `    [${pt(r[0])}, ${pt(r[1])}, ${num(r[2] ?? 0)}],`)),
    '}',
    '',
  ].join('\n')
}
