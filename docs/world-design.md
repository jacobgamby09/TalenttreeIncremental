# World Design

How the talent tree and the world map fit together. The document separates the user's decisions from the assistant's suggestions. Suggestions are not requirements until the user adopts them. The user's own words are in [idea-history.md](idea-history.md), section 13.

## Decided by the user (16 October 2026)

- The talent tree and the world are one and the same thing. The map must feel like a world map you explore while it is also a talent tree. The map is at least as original as the Home Base.
- Skills sit in clusters, but clusters do not need straight, right-angled lines. They may be organic and dynamic, so the map has play and life.
- Hidden and interesting nodes are spread across the map. They must be discovered, or the player must do something special to unlock them. The reward can be anything: a resident, a dungeon, a rare skill or something else.
- Dungeons are not clusters of their own. They are spread across the whole tree.
- A skill cluster can still contain bosses and dungeons that the player must overcome to move on.
- Residents rescued in dungeons can work in the Home Base alongside the player's own activity.

## Suggestions from the assistant

### The world grows out from the base like a tree

The Home Base is the trunk, and the clusters are branches. The further out you go, the rarer and more dangerous it gets. One rule gives both sides of the concept: it is a talent tree, because everything is connected and grows outwards, and it is a world map, because distance means something and the edge is unexplored.

### Clusters: organic, but readable

- **Spine:** every cluster has a main path, for example Oak → Willow → Ash. It is drawn thicker and follows a curve instead of a straight line.
- **Twigs:** side nodes such as modifiers branch off the spine. They sit close to the node they improve.
- **Terrain:** each cluster lies in its own landscape (a forest, a mountain, a rocky valley with a forge), so it feels like a place. Codex's terrain sample in `grafik/stilproever/tegneserie-02-terraen` points in this direction.
- **Readability rules:** a curve may bend, but the spine must always be easy to follow. Nodes never overlap their neighbours' names. Headers stay large.
- **Zoom levels:** zoomed out, you see regions, headers and dungeons. Zoomed in, you see nodes, ranks and requirements.

### The wilderness between the clusters

Today the space between clusters is empty. It becomes wilderness: paths of small, cheap nodes that the player unlocks to reach further out. Exploration happens here, and this is where secrets and wild dungeons lie. A path costs resources or time, so the player chooses a direction instead of clicking everything.

### Secrets: how they are found × what they give

| How it is found | Example |
|---|---|
| A visible hint | A silhouette or a "?" in the fog |
| A counter | Fell 300 oak (Forestry works like this today) |
| Bring something | A key or a relic from a dungeon |
| An offering | Pay resources at an altar |
| A resident's ability | A rescued cartographer reveals hidden paths |
| An unexpected skill | A collapsed passage near Woodcutting that needs Mining |
| A sequence | Light three fires in the right order |

Rewards: a resident, a dungeon, a rare skill, a blueprint for a building, a shortcut or a permanent bonus.

Mixing the two lists makes every secret different without a new system each time.

### Two kinds of dungeons

- **Gate dungeons and bosses** inside skill clusters. The player must get through them to move on. The Hollow Oak and the Tree Guardian work like this today.
- **Wild dungeons** scattered in the wilderness. They are optional and give what cannot be farmed: residents, blueprints and keys. They match their surroundings, for example a collapsed mine near Mining.

Inside, a dungeon can become a small tree of rooms with forks (combat, elite, boss, rest, treasure, trap and skill rooms). That is a separate design round.

### Hand-made map

The map is placed by hand, not generated. Secrets and dungeons are only interesting where someone has chosen to put them. The map editor makes that practical.

## Map layout and the editor

The layout lives in `prototype/js/world.js`: positions of nodes, cluster headers and landmarks, the bend of each edge, decorative roads, the world size and the start position. `data.js` keeps the game data and reads positions from the layout.

Open the editor with `?edit` (or the Map editor button in the Developer panel):

- Drag nodes, cluster headers, landmarks, road ends and the start marker.
- Drag the small dot on an edge to bend it. Bent edges are drawn as curves.
- Shift+click selects several nodes; dragging one moves them all. Shift+drag on a header moves the whole cluster.
- Positions snap to 10 px; hold Alt for free placement. Arrow keys nudge the selection (Shift for 10 px).
- `+` and `−` resize a selected landmark.
- Ctrl+Z undoes. Ctrl+S saves straight into `prototype/js/world.js` through the dev server (`npm start`). Without the dev server, the layout is downloaded as a file instead.
- The game does not run while you edit, and nothing in your saved game changes.

## Open questions for the user

- Where does the base sit: in the middle of the map, or at the bottom as the root of a tree that grows upwards?
- Should wilderness paths cost resources, time, or both?
- How many clusters and wild dungeons should the next version of the map have?
