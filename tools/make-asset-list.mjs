// Generates docs/asset-list.md from themes/asset-manifest.json and themes/starchart/theme.json.
// Usage: node tools/make-asset-list.mjs
// Edit the manifest, theme.json or the rules below, not the generated file.
import { readFileSync, writeFileSync } from 'node:fs'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const manifest = JSON.parse(readFileSync(join(root, 'themes', 'asset-manifest.json'), 'utf8'))
const theme = JSON.parse(readFileSync(join(root, 'themes', 'starchart', 'theme.json'), 'utf8'))

const TRIAL = [
  'nodes/oak', 'nodes/copper-chestplate', 'resources/copper-bar', 'glyphs/lock', 'portraits/player',
  'portraits/wolf', 'emblems/woodcutting', 'backgrounds/starfield',
]

const FOLDERS = {
  nodes: {
    title: 'Nodes',
    rules: [
      '256×256 PNG with a transparent background.',
      'One unified subject with no smoke, steam, haze, sparks or loose particles. The code makes fog silhouettes by turning the icon black and blurring it, so anything outside the subject turns into grey smudges.',
      'The subject\'s longest side fills 76% of the canvas, and nothing touches the edge. Measure it after nearly invisible edge pixels have been removed.',
      'Natural material colors. The cluster color lives in the code\'s frame and glow, apart from small accents, which are stated in the prompt.',
      'Activities show the source on a small base (a tree on a mound, a rock, a furnace). Speed modifiers show a tool. Yield modifiers show a generous amount of the raw material. Buildings stand on the same small round patch of ground.',
      'Gear floats without a base, at a fixed angle per slot: swords diagonal with the hilt at the lower left, helms and chestplates from the front, greaves side by side from the front and boots in three-quarter view.',
      'Copper is always a warm red-orange with round, hammered forms. Iron is always a cool blue-grey with angular forms and silver highlights.',
      'Dark materials such as iron, dark stone and bark disappear on the dark node fill. Give them light edges from the light at the upper left.',
    ],
  },
  resources: {
    title: 'Resources',
    rules: [
      '128×128 PNG with a transparent background. The subject\'s longest side fills 84%, and it consists of a few large shapes.',
      'The resource is the raw material itself (log, ore lump, bar), while the activity node shows the source (the tree, the rock).',
    ],
  },
  glyphs: {
    title: 'Glyphs',
    rules: [
      'Drawn as SVG in code, not with the image generator. Template: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><path fill="#FFFFFF" fill-rule="evenodd" d="…"/></svg>`.',
      'White fill only. No stroke, opacity, mask, clipPath, gradients, filters, text or images. Outlines are converted to filled paths, and cut-outs are made with evenodd or boolean operations.',
      'Filled glyphs lie within the 10-118 area. Optical size: round shapes 104 in diameter, square 96×96, tall 80×108 and wide 108×80.',
      'Cut-outs and gaps are at least 10 units. Outer corners are rounded with r = 4, while points (blades, star, thorns, chevrons) are sharp. Vertical and horizontal edges lie on a grid of 8 units.',
      'Empty equipment slots and the building socket are hollow outlines with a line 8 units thick within the 16-112 area. They are exempt from the minimum of 10, because they are only shown at 24-32 px.',
      'Shared shapes: the same heart in hp, healing and defeat, the same skull in boss and kill, and the same sword in atk and slot-weapon. Fixed choices of direction and placement are in the notes.',
      'No letters or symbols: no question marks, exclamation marks, plus signs or check marks.',
    ],
  },
  portraits: {
    title: 'Portraits',
    rules: [
      '512×512 PNG with a transparent background. The code lays backgrounds/portrait behind it, so all portraits look alike side by side.',
      'The framing is stated in the prompt: head-and-shoulders for the player, goblin and wolf, waist-up for the boss and full body for the rat, bark beetle, moss lump and squirrel. All fill about 80% with the eyes about 40% from the top.',
      'Head-and-shoulders and waist-up figures are cut off at the bottom edge (the edge_allowed field). They must not end in a horizontal cut above the bottom. Full-body figures are kept fully inside with space below.',
      'Generate on a flat neutral mid-grey (#6B6B73), not indigo, so the shadows do not disappear with the background. Cut out with a segmentation model (e.g. BiRefNet or rembg), not with a color key. Fill closed holes so the subject\'s interior is fully opaque, and clean the edge color.',
      'The player faces right, and the monsters face left. The code mirrors as needed, so nothing may look wrong when mirrored. The boss is seen from the front and is not mirrored.',
      'The transparent version is also used as a silhouette in the fog, so the outline must be recognizable.',
    ],
  },
  emblems: {
    title: 'Emblems',
    rules: [
      '256×256 PNG with a transparent background: a round medallion that fills 90%.',
      'First make one empty medallion and use it as the reference image, so all emblems get the same disc and rim.',
      'Generate in neutral silver-grey, and color it afterwards with a three-point gradient map: shadow = the cluster color at about 25% luminance, midtone = the exact cluster color, highlight = the cluster color mixed 60% with white. The cluster colors are in theme.json.',
      'Finally apply a mathematical circular alpha mask (230 px in diameter, centered, antialiased), so the disc is perfectly round and everything outside it is 0.',
      'One single motif per emblem. No inscription, beads, ribbons, wreaths or extra rings on the rim.',
    ],
  },
  backgrounds: {
    title: 'Backgrounds',
    rules: [
      'Used only through theme.json (role "theme"), so another theme can have completely different layers. Each entry has its own prompt template in the addon field.',
      'The starfield (2048) is made procedurally with a fixed seed and stars that continue across the edges. The faint dust variation must not form patches that visibly repeat in a 3×3 sample.',
      'Tintable layers (fog, nebula and cluster-veil) are white with the shape in the alpha. Make them as light on black or procedurally (fBm noise with wrap-around), and convert luminance to alpha. The fog is normalized to alpha 0.20-0.85.',
      'Seamless tiles are tested as 3×3. The check script only checks seams in PNG; JPG must be inspected as 3×3.',
      'Do not use pngquant on soft gradients, since it causes banding. Add light dither.',
    ],
  },
  silhouettes: {
    title: 'Silhouettes',
    rules: [
      '1024×1024 PNG, tintable: white with the shape in the alpha. Make them as a light silhouette on black, and convert luminance to alpha.',
      'Scale the alpha so the subject\'s core is 100% opaque. The code controls how faint the silhouette is.',
      'Multiply the alpha by a linear ramp from 1 at 75% of the height to 0 at the bottom edge, and set the alpha to 0 in a 16 px wide border all the way around.',
      'No lines, outlines, lit windows, light sources, stars or moon.',
    ],
  },
}

const cell = s => String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ')
const byFolder = {}
for (const a of manifest.assets) (byFolder[a.id.split('/')[0]] ??= []).push(a)
const count = p => manifest.assets.filter(a => a.priority === p).length
const families = [...new Set(manifest.assets.filter(a => a.addon !== null).map(a => a.family))]

const lines = []
const out = (...l) => lines.push(...l)

out(
  `# Asset list for Codex: ${theme.name}`,
  '',
  'Generated by `node tools/make-asset-list.mjs` from [asset-manifest.json](../themes/asset-manifest.json) and [theme.json](../themes/starchart/theme.json). Edit those two files or the rules in the tool, not this file.',
  '',
  `The prototype needs ${manifest.assets.length} files: ${count('P1')} with priority P1 and ${count('P2')} with P2. The manifest is the contract between the game code and the themes. The game code refers only to ids, so a new visual style is a new theme folder with the same ids.`,
  '',
  'Subject prompts, notes, family and prompt template for each file are in the manifest. The notes are for quality checks; everything that must be in the image is in prompt.',
  '',
  '## How to deliver',
  '',
  '- Put each file in `themes/starchart/<id>.<format>`, e.g. `themes/starchart/nodes/oak.png`.',
  `- Ids: ${manifest.conventions.id}`,
  `- ${manifest.conventions.png}`,
  '- Run `node tools/check-assets.mjs` from the project folder. It checks the manifest and theme.json, names, sizes, formats, transparency and edges, the subject\'s fill, white glyphs, seams in PNG tiles and file sizes, and it shows what is missing.',
  '- Keep 1024 px originals, post-processing scripts and contact sheets in `kilder/stjernekort/` or in a batch folder under `grafik/`, outside the theme folder.',
  '- Save a `prompts.json` per batch with the structure `{ "<id>": { "prompt": "…", "model": "…", "date": "YYYY-MM-DD", "references": ["<id>"] } }`.',
  '',
  '### Generator and plan B',
  '',
  '- The image generator makes 1024×1024. Generate at that size, and scale down.',
  '- Without real transparency: generate on a flat neutral mid-grey (#808080), and cut out with a segmentation model.',
  '- Without reference images: make siblings side by side in one image, and cut them apart afterwards.',
  '- Without inpainting: make seamless tiles procedurally.',
  '',
  '### Post-processing painted files',
  '',
  '1. Remove loose, nearly invisible pixels (alpha below about 8) and semi-transparent leftovers outside the subject.',
  '2. Clean the edge color, and extend the color in under the transparent pixels (alpha bleed), so no fringes appear when scaling.',
  '3. Trim to the alpha\'s outline, scale so the longest side gets the folder\'s fill (nodes 76%, resources 84%, portraits 80%, emblems 90%), and center. Portraits with edge_allowed are placed so the bust is cut off at the bottom.',
  '4. Downscale with premultiplied alpha (e.g. sharp/libvips, `npm i sharp` in kilder/), and save as 8-bit RGBA PNG without interlace.',
  '',
  '### Priority',
  '',
  ...Object.entries(manifest.conventions.priority).map(([k, v]) => `- **${k}:** ${v}`),
  `- **Missing files:** ${manifest.conventions.missing}`,
  '',
  '## Order',
  '',
  `1. **Trial batch.** ${TRIAL.map(id => `\`${id}\``).join(', ')}. The user approves the style before the rest is made. nodes/oak and nodes/copper-chestplate are the style reference for all nodes until the family's own first file is approved.`,
  `2. **Family batches.** Family by family, with the approved files as reference images. The families are in the manifest's family field: ${families.map(f => `\`${f}\``).join(', ')}. Pairs where the difference matters (copper and iron in the same slot, Hard Pick and Heavy Pick, Hot Furnace and Thrifty Stoking) are made with the same reference or side by side.`,
  '3. **Contact sheets.** After each family, save a contact sheet as `kilder/stjernekort/kontaktark/<family>.png`. It shows the files at their real sizes on the node fill (#121735), in color and in greyscale: nodes at 56 and 72 px (gear also at 24 px), resources at 16 and 32 px, glyphs at 14-32 px, portraits at 64 and 128 px and emblems at 24, 32 and 64 px. Siblings stand side by side. Deliver in rounds of one or more families as agreed with the user, and stop after each round until it is approved.',
  '4. **P1 before P2.**',
  '',
  '## Prompts',
  '',
  `${theme.prompts.structure}`,
  '',
  '### Base',
  '',
  `> ${theme.prompts.base}`,
  '',
  '### Templates',
  '',
  ...Object.entries(theme.prompts.addons).flatMap(([k, v]) => {
    const n = manifest.assets.filter(a => a.addon === k).length
    return [`**${k}** (${v.base ? 'with base' : 'without base'}; used by ${n} ${n === 1 ? 'file' : 'files'})`, '', `> ${v.text}`, '']
  }),
  '## Rejection criteria',
  '',
  'Redo the file if it has:',
  '',
  '- letters, runes, inscriptions or numbers, also on blades, shields and medallion rims (zoom to 200% to find pseudo-text)',
  '- a signature in a corner',
  '- a frame, plate or halo around the subject, or a glowing outline (the emblem\'s own disc and rim are allowed)',
  '- stars, sparks, smoke or glow around a transparent subject',
  '- a subject that is cropped or touches the edge (except the bottom of head-and-shoulders and waist-up portraits)',
  '- a light or dark fringe in the alpha edge',
  '- a cute or comic expression',
  '',
  '## What the code draws, not the images',
  '',
  'Frames, glow, connection lines, headers, XP bars, HP bars, the attack indicator along the edge, numbers and text, effects (particles, hits, critical strikes, level-ups and reveals), the arrow at the screen edge, play and stop shapes, near stars, fog silhouettes of the icons, the locked and defeated states (darkening and desaturation), mirroring of portraits and placeholders for missing files.',
  '',
  `## Colors in ${theme.name}`,
  '',
  '| Cluster | Color |',
  '|---|---|',
  ...Object.entries(theme.colors.clusters).map(([k, v]) => `| ${k} | \`${v}\` |`),
  '',
  `Background \`${theme.colors.background}\`, node fill \`${theme.colors.nodeFill}\`, text \`${theme.colors.text}\`. All colors are in theme.json.`,
  '',
)

for (const [folder, spec] of Object.entries(FOLDERS)) {
  const list = byFolder[folder] ?? []
  out(`## ${spec.title} (${list.length})`, '', ...spec.rules.map(r => `- ${r}`), '')
  out('| Id | Prio | Family | File | Subject |', '|---|---|---|---|---|')
  for (const a of list) {
    const flags = [a.background === 'opaque' && 'opaque', a.tintable && 'tintable', a.seamless && 'seamless', a.edge_allowed && 'bottom may be cut off'].filter(Boolean).join(', ')
    out(`| \`${a.id}\` | ${a.priority} | ${a.family} | ${a.width}×${a.height} ${a.format}${flags ? `, ${flags}` : ''} | ${cell(a.subject)} |`)
  }
  out('')
}

writeFileSync(join(root, 'docs', 'asset-list.md'), lines.join('\n'))
console.log(`Wrote docs/asset-list.md (${manifest.assets.length} assets)`)
