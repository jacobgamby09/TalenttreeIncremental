# TalenttreeIncremental

An incremental RPG where the talent tree is the whole game world. Skills, crafting, combat, dungeons and a home base sit as connected clusters of nodes on a large map that grows as you play.

How far the project has come is in [PROGRESS.md](PROGRESS.md). AI agents (Codex, Claude and others) follow [AGENTS.md](AGENTS.md), and Claude Code also reads [CLAUDE.md](CLAUDE.md).

## Getting started

Requires Node.js 22 or newer. Nothing needs to be installed.

```bash
npm start
```

Then open http://localhost:5173/prototype/. To see the whole map, open http://localhost:5173/prototype/?load=all. That is a demo game where every cluster is open, and it is saved separately, so your normal game is not touched.

The game is saved in the browser. The Developer button gives higher game speed, resources and levels for testing, plus a reset.

## Commands

| Command | Does |
|---|---|
| `npm start` | Starts the prototype at http://localhost:5173/prototype/ |
| `npm test` | Runs the game engine tests |
| `npm run simulate` | Lets a bot play the prototype and measures when the milestones are reached |
| `npm run check:assets` | Checks the theme's image files against the manifest |
| `npm run asset-list` | Regenerates the asset list from the manifest |
| `npm run check` | Runs both the tests and the asset check |

## Documents

- [Game concept and decisions](docs/game-concept.md): separates the user's decisions, the user's possible extensions and the agents' proposals
- [Node list](docs/prototype-nodes.md): every node in the prototype with requirements, prices and effects
- [Balance](docs/balance.md): milestone times from the balance simulator (generated)
- [Idea history](docs/idea-history.md): the user's creative messages, verbatim
- [Asset list](docs/asset-list.md): generated from [asset-manifest.json](themes/asset-manifest.json) and [the starchart theme.json](themes/starchart/theme.json)
- [The first eight style sketches](konceptbilleder/OVERSIGT.md) and [their prompts](konceptbilleder/billedprompts.md)

## Folders

| Folder | Contents |
|---|---|
| `prototype/` | The playable prototype in plain JavaScript with no build step |
| `themes/` | The asset manifest and one folder per theme. The starchart theme is complete |
| `tools/` | Server, asset check, asset list generator and balance simulator |
| `tests/` | Automated tests of the game engine |
| `docs/` | Concept, node list, idea history, balance and asset list |
| `kilder/` | Codex's deliveries per round: originals, prompts, scripts and contact sheets |
| `grafik/` | Graphic explorations: test batch 01, style samples and pixel moodboards |
| `konceptbilleder/` | The first eight style sketches |

`kilder/`, `grafik/` and `konceptbilleder/` are Codex's archives. They keep their Danish names for now and will be renamed together with Codex later.
