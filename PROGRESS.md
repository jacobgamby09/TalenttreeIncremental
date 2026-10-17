# PROGRESS.md

Progress of the project. Updated by every agent after each delivery; the rules are in [AGENTS.md](AGENTS.md#progressmd).

Last updated: 2026-10-16

## Status

| Area | Status | Where |
|---|---|---|
| Game concept | Ready, version 1. Humor is set aside for now | [game-concept.md](docs/game-concept.md) |
| Node list | 58 nodes in six clusters plus two hidden. First draft of the numbers | [prototype-nodes.md](docs/prototype-nodes.md) |
| Asset contract | 106 assets in the manifest, with a check and a generated list | [asset-manifest.json](themes/asset-manifest.json), [asset-list.md](docs/asset-list.md) |
| Theme: starchart | Complete: 106 of 106 approved by the check | [themes/starchart](themes/starchart), [kilder/stjernekort](kilder/stjernekort) |
| Prototype | Playable with all 58 nodes and all layers, offline progress and versioned saves | [prototype/](prototype/) |
| Balance | Measured with a bot simulator: all milestones within their targets, the boss falls after about 33 min. Not tested with real players | [balance.md](docs/balance.md) |
| World design | Principles agreed for the tree and the world; the assistant's suggestions are marked | [world-design.md](docs/world-design.md) |
| Map editor | Drag nodes, headers, landmarks and roads, bend edges, save to `world.js` (`?edit`) | [editor.js](prototype/js/editor.js), [world.js](prototype/js/world.js) |
| Tests | 32 tests of the game engine and the map layout, all passing | [tests/](tests/) |
| Language | The game and all project files are in English; the conversation with the user is in Danish | [AGENTS.md](AGENTS.md) |
| Art direction | Not chosen. The starchart is the full theme; cartoon and pixel are being explored | [grafik/](grafik/) |

## In progress

- **Pixel moodboards (Codex):** eight pixel styles following [BESTILLING.md](grafik/pixel-moodboards/BESTILLING.md). `LEVERANCE.md` has arrived, but the delivery has not been reviewed yet; the user has chosen to wait. Do not change `grafik/pixel-moodboards/` until it has been reviewed.

## Next steps

1. Lay out the current 58 nodes again with the map editor, following docs/world-design.md: organic clusters with a spine, one wilderness path and one secret.
2. Playtests with real players: measure milestone times (stored in `milestones` in the saved game) and compare them with the bot.
3. Review the pixel moodboards (delivered, waiting for the user), and compare them with the starchart and the cartoon style.
4. After the review: rename Codex's archives `kilder/`, `grafik/` and `konceptbilleder/` to English together with Codex, and agree on the English delivery paths (e.g. `sources/<theme>/round-NN/DELIVERY.md`).
5. The user plays the prototype through and chooses an art direction.
6. Test offline progress: 8 hours at full effect gives many levels compared with the prototype's roughly 40 minutes of content.
7. The bot never reaches Forestry (300 oak) on its route. Consider whether the threshold should be lowered, or whether it is fine that Forestry comes later.
8. Slow movement of the fog with two copies at different scales, as theme.json suggests.
9. Deliberately left out for now: food and cooking, more gear tiers, prestige and sound.

## Open questions for the user

- Which art direction should the game have? Starchart, cartoon or a pixel style?
- The cartoon delivery talks about "the chosen cartoon style". Is cartoon decided, or is it still a sample?
- Is it ok that gear is crafted once and chosen in its slot without an actual inventory? The prototype does it that way now.
- Where does the base sit: in the middle of the map, or at the bottom as the root of a tree that grows upwards? (more questions in docs/world-design.md)
- Should offline progress give full effect for up to 8 hours, or less? It is the assistant's choice for now.

## Known issues

- The console shows a 404 for `favicon.ico`.
- The starfield is a JPG, so its seam is not checked automatically. It was approved visually in a 3×3 sample.
- Balance has only been measured with a bot, not with real players.
- The prototype has only been tested on desktop, not on mobile.

## Log

Newest first.

### 2026-10-16 · Claude · World design and map editor

- `docs/world-design.md`: the user's decisions about the tree and the world (organic clusters, scattered secrets and dungeons, gate bosses in clusters, residents) and the assistant's suggestions, clearly separated.
- The map layout moved out of `data.js` into `prototype/js/world.js`. The map editor (`?edit`, or the button in the Developer panel) drags nodes, headers, landmarks, road ends and the start marker, bends edges into curves, and saves straight to `world.js` through the dev server (only from this computer). Undo, snapping and arrow-key nudging are included. Tested in a browser with Playwright; the layout itself is unchanged so far.
- 6 new tests (32 in total), including the save endpoint against a temporary file.

### 2026-10-16 · Claude · Everything in English

- The user decided that the game and all project files are in English, while the conversation stays in Danish. Code, identifiers, comments, game text, documents, file and folder names and all 106 asset ids are translated (`docs/`, `themes/starchart/`, `prototype/js/game.js` and so on; files moved with `git mv`). Codex's archives `kilder/`, `grafik/` and `konceptbilleder/` are not renamed yet.
- Save version 3 with English ids under the key `talenttree-prototype`. An old Danish save is migrated automatically with `prototype/js/legacy-ids.js`, and the old key is left untouched. Tested in the browser with a real Danish save.
- Behavior is unchanged: an equivalence check against the Danish engine matched on 10 seeds, and `npm run simulate` gives the same milestone times as before. 26 tests pass, and the asset check approves 106 of 106.

### 2026-10-16 · Claude · Balance simulator and offline progress

- `tools/simulate.mjs` (`npm run simulate`): a bot plays the prototype 20 times with fixed seeds and writes milestone times to `docs/balance.md`.
- Balance adjusted after the measurement: the XP curve is now 35 × 1.22^(level − 1), and the Tree Guardian has 160 HP and 26 ATK. The boss falls after 32:35 (median), and all milestones are within their targets.
- Saves are versioned (version 2) with migration from version 1. A save from an unknown version is kept as a backup instead of being overwritten. Play time and milestones are saved.
- Offline progress: the activity continues for up to 8 hours, and a "While you were away" window shows the result. Clusters revealed in the meantime are revealed when the window closes. Tested in the browser.
- 5 new tests (18 in total).

### 2026-10-16 · Claude · Git

- Repository created and pushed to https://github.com/jacobgamby09/TalenttreeIncremental (branch `main`). `grafik/pixel-moodboards/` is not included, because Codex is working in the folder.

### 2026-10-16 · Claude · Project structure and tests

- AGENTS.md, CLAUDE.md and PROGRESS.md created. CLAUDE.md imports AGENTS.md, so there is only one set of shared rules.
- `package.json` with commands (`npm start`, `npm test`, `npm run check:assets`, `npm run asset-list`), plus `.gitignore` and `.editorconfig`.
- 13 automated tests of the game engine in `tests/engine.test.mjs`. All pass.

### 2026-10-16 · Claude · Demo load with the whole map

- `?load=all` starts a demo game where all skills are lvl 20, the boss is defeated and all clusters are revealed. It is saved separately. There is also a button in the developer panel.

### 2026-10-16 · Claude · Pixel moodboard brief

- Brief and two reference images of the prototype in `grafik/pixel-moodboards/`.

### 2026-10-16 · Codex · Style samples in cartoon style

- `grafik/stilproever/tegneserie-01` (moodboard and three test assets) and `tegneserie-02-terraen` (map with terrain per cluster). Ordered by the user directly from Codex.

### 2026-10-16 · Codex and Claude · Starchart theme finished

- Codex delivered test batch 01 and rounds 02-04, 106 of 106 files in total. Claude reviewed each round, fixed the check script and asked for corrections.
- The prototype now uses the nebula, the fog texture, the cluster veil and landmarks. Fog and silhouettes were toned down after a visual review.

### 2026-10-16 · Claude · First prototype

- Playable prototype in `prototype/`: all 58 nodes, one activity at a time, crafting, sockets, combat points, combat at the node with an activity bar and arrow, farming areas, a dungeon with a boss, fog and the reveal of Druid and Forestry.
- XP bars in the headers and icons in selection lists were fixed after the user's test.

### 2026-10-16 · Claude · Asset list and tools

- Asset manifest with 106 assets, `theme.json` for the starchart theme, `tools/check-assets.mjs` and `tools/make-asset-list.mjs`. The list was reviewed by several agents before it went to Codex.

### 2026-10-16 · Claude and Codex · Concept and style sketches

- Game concept, idea history and node list in `docs/`. Eight style sketches from Codex in `konceptbilleder/`. The user chose the starchart for the prototype.
