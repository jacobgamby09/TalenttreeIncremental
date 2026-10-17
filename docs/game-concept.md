# Game Concept — TalenttreeIncremental

Date: 16 October 2026. Working title taken from the project folder.

## Core idea and tone

A take on incremental talent trees: the talent tree is the whole game and makes up the game world itself. The player moves through the progression by opening and using nodes. Resources, upgrades, gear, enemies and buildings all have their place in the same large network.

The map is expected to become very large. Content sits in clusters with large headings and local XP bars, so the player can find their way around. Melvor Idle is the user's reference for automatic skills and for the limit of one activity at a time.

Tone: The original pitch was a humorous take. On 16 October 2026 the user decided to set the sarcasm and humor aside for now. Nodes, names and texts are written neutrally, and there are no joke nodes. Humor can be taken up again later.

## Direction set by the user

### One activity at a time

At the start, the player can only perform one activity at a time. Woodcutting and Mining are started and then continue automatically. The option of several simultaneous activities can be explored later, but it is not part of the settled starting model.

The Home Base is the exception (decided on 16 October 2026): residents that the player rescues in dungeons move into the base and work there alongside the player's own activity. How fast they work, how many there can be and what they can do is not decided yet.

Crafting is click-to-craft with a resource cost. The user has not decided whether a crafting click should interrupt an active skill; the assistant's suggestion is that it does not.

### Woodcutting and other gathering skills

A Woodcutting cluster contains different tree types. Oak is the user's example of the first one. While the node is active, wood is chopped automatically at a set frequency.

Around a resource node sit adjacent upgrades, for example more wood/oak per tick or 0.2 seconds faster chopping. An XP bar on the board itself shows the progression of that specific skill. At a certain skill level the next tree type becomes available, extending from the existing one.

Mining follows the same basic idea with automatic activities and resource nodes. The exact tree types, ores, XP curves and speeds are not settled.

### Crafting

Weapons and armor have their own crafting clusters. Every item you can make is a node on the board and costs resources. The user's concrete example is a Copper Armor node at the Blacksmith, where one click costs 5 copper bars.

Repeated crafting, inventory, smelting and the full recipe list are not yet specified. Gear slots are described under Home Base. The extra recipes and features in the sketches are illustrative.

### Combat directly on the map

Combat should be simple but satisfying.

- The player can click a monster node and see ATK, HP, DEF and Attack Speed.
- When combat starts, the player's own node appears next to the enemy's node.
- Both nodes are square.
- The frame gradually fills up along the edge and shows the time until the next attack.
- Both have a health bar below the node.

Combat has its own cluster, which can grow as you defeat enemies. A defeated enemy can, for example, reveal one or two new monster nodes.

The damage formula, the meaning of DEF, healing, defeat, fleeing and the exact combat speed are open design questions.

The user's original idea is that combat takes place at the monster node on the map: the player's node comes in alongside it, and the fight plays out there. Codex's mockups show combat in the middle of the screen, which was not what the user had in mind. The user points out that the map will become so large that you will often be far from the center, and asked for the assistant's recommendation. See "Combat at the node with an activity bar" under the assistant's suggestions.

### Visual direction for the prototype

The user has chosen the Star Chart (8) for the prototype. The prototype will also be used to decide the final design direction, so the visual style must be as easy as possible to switch. Codex delivers the assets that are needed.

### Gradual reveal and surprises

The map should use a mix of gradual growth and visible hints. In some places the player should be able to see that nodes are hiding behind a lock or an unexplored area. Other milestones should trigger real surprises: a whole new cluster springs up somewhere the player did not expect anything.

The intended experience is both being able to work toward known goals and discovering that the game is bigger than you thought. The whole tree should therefore not be revealed in advance.

### The tree and the world are one

Decided on 16 October 2026. The map is at least as original as the base: the talent tree and the world are the same thing. The map must feel like a world map the player explores while still being a talent tree.

- Skills still sit in clusters (the user leans towards this), but the clusters do not need straight, right-angled lines. They may be organic and dynamic, so the map has some play and life.
- Hidden and interesting nodes are spread across the map. They must be discovered, or the player must do something special to unlock them. The reward can be anything: a new resident, a dungeon, a rare skill or something else.
- Dungeons are not clusters of their own. They are spread across the whole tree.
- A skill cluster can still contain bosses and dungeons that the player must overcome to move on.

### Residents rescued in dungeons

The user likes the idea that the player rescues residents in dungeons, and that they then work in the town. This is the base's answer to "one activity at a time", see above.

### Language

On 16 October 2026 the user decided that the game and all project files are in English. The conversation with the user stays in Danish. [idea-history.md](idea-history.md) keeps the user's messages word for word in the original Danish, with English translations as aids.

## The user's possible extensions

These options were suggested by the user, but their scope and implementation are not finally decided.

### Three uses of combat

| Option | Description | Purpose |
| --- | --- | --- |
| Farming area | A single combat node automatically replaces a defeated enemy with a new one | Endless farming of XP or resources |
| Dungeon cluster | A line of different mobs, one after another, with a boss at the end | A connected series of fights |
| Boss as an access requirement | A boss blocks part of the talent tree | Victory opens new skills or higher tiers |

A larger boss could, for example, open three new skills. A boss can also stand inside an existing skill: Woodcutting tier 5 could require a victory over a Wood Guardian. The specific numbers and tiers are examples.

### Home Base

Somewhere in the talent tree lies the player's Home Base. It can consist of empty node slots where you build and place things that give various bonuses. Later the base may be expanded with more slots.

Building types, prices, bonuses and the option to move or replace buildings have not been decided.

The user also suggests that gear sits in the Home Base as nodes in the tree, in keeping with everything being in the tree: a weapon slot and, to begin with, four armor slots for chest, head, legs and boots.

### Combat XP

Combat should give XP, which gives stat upgrades and later other benefits. The user also asked whether gold is needed at all.

## Suggestions from the assistant — not adopted as requirements

### Connections between the clusters

Let resources and rewards create reasons to visit several clusters. A small possible loop is:

Oak → weapon → monster → building → better Woodcutting.

This loop was suggested as a first test of whether the game's core idea is satisfying. The first prototype, built on 16 October 2026, implements this loop.

### Three degrees of visibility

1. Visible goals: the next tree type and its requirements can be seen in advance.
2. Hints: a connection runs out into the fog, or faint nodes can be glimpsed behind a guardian.
3. Real surprises: a new connection grows out of a familiar node and reveals an unexpected cluster.

The assistant's example: the Wood Guardian is defeated, roots grow downward, and a new mushroom-farming cluster appears beneath the forest. Mushroom farming is an example, not an adopted skill.

### Presenting discoveries

A connection can be drawn out first, then the nodes unfold, and finally the cluster's name and XP bar appear. Small secrets, the occasional miniboss and larger skill reveals can be mixed, so that not every discovery promises a whole new part of the game.

### Combat feedback

Small hit shakes, clear damage numbers and health bars that react to the hit can give fights weight without many extra mechanics. Crafting was suggested as an instant action that does not stop the active activity.

### Boss requirements and balance

Show both level requirements and boss requirements in advance. Use boss blocks at selected larger milestones, so that a gathering skill still has its own rhythm. The player should be able to get the necessary gear from the areas that are already open; several possible ways to prepare can make the progression less linear.

An earlier example was: Woodcutting level 20 → the next tree type becomes visible → the Wood Guardian blocks the connection → victory opens the tree type and its upgrades. Level 20 is only an illustrative number.

### Humor (set aside)

The assistant earlier suggested that names, animations and upgrades could deliver the humor. The user has chosen to set humor aside for now, so those suggestions are not used.

### No gold in the prototype

Gold had only a few uses in the first node proposal. The assistant's suggestion is to remove gold: combat gives XP, one combat point per Combat level for stat nodes, and materials such as Rat Tail, Leather and Wolf Pelt that are used in recipes. Gold can come back if the game later gets a shop or trading.

### The prototype in one of the eight styles

The user asked whether the prototype can be built in the style of one of the concept images. The assistant's assessment: the structure is made in code in every style, that is nodes, connections, headings, XP bars, fog and the attack indicator along the square edge. The illustrations require image files. Star Chart (8) and Neon (5) can be made almost entirely in code with simple icons. The painted styles (2, 3, 4, 6 and 7) require a coherent set of generated icons, portraits and backgrounds. The assistant's recommendation for the prototype was the Star Chart, and the user has chosen it.

### Swappable theme

To make the visual style easy to switch, the assistant suggests keeping the graphics separate from the game code. Colors, fonts, frames, lines and glow are tokens in a theme. All images are loaded through an asset list, where every node, every monster and every cluster points to an asset id instead of a file path. A new look is then a new theme folder with tokens and image files, which Codex can deliver without the game code changing.

### Asset contract for Codex

The user asked for the asset list before the prototype was built, so Codex could work in parallel. The list was made by the assistant and reviewed for completeness, usefulness to Codex and technical soundness. It is in [asset-list.md](asset-list.md) and is generated from [asset-manifest.json](../themes/asset-manifest.json) and [theme.json](../themes/starchart/theme.json).

- The manifest is the contract: the game code only refers to ids such as `nodes/oak`, and a theme delivers the files as `themes/<theme>/<id>.<format>`.
- 106 files: 43 node icons, 10 resources, 28 glyphs, 8 portraits, 8 emblems, 5 backgrounds and 4 landmark silhouettes. P1 is everything on the way to the boss, and P2 is what only appears after the boss or a hidden trigger, plus atmosphere layers.
- Glyphs are drawn as white SVGs so the code can color them.
- The portraits are transparent, and the code places a shared background behind them. The transparent shape also gives the monsters' silhouettes in the fog.
- Effects, the arrow at the screen edge and nearby stars are made in code and are not on the list.
- If a file is missing, the game shows a placeholder drawn in code, so the delivery order never blocks the prototype.
- `npm run check:assets` checks a delivery against the manifest.

Test batch 01 (8 files) was delivered on 16 October 2026. The assistant's assessment: the style fits the Star Chart, and the files are cleanly cut out. Corrections before the rest: the Oak and the Copper Chestplate must fill more of the canvas, the two busts must be cut off at the bottom edge, the Woodcutting emblem is to be redone with a single leaf and a gradient map, the lock's corners must follow the glyph rule, and the dust specks in the starfield must not visibly repeat. The user passed the approval, with the corrections, on to Codex and kept the player portrait.

Round 02 was delivered the same day: the corrections, the families trees, woodcutting-modifiers, ores, mining-modifiers and furnaces, the portrait background and all 28 glyphs (52 of 106 passed the check). The assistant's assessment: trees, modifiers, furnaces, emblem and most glyphs are good. For round 03 the portraits must be scaled up within the node, the ores made as rocks on a base, Deep Vein made clearer, and six glyphs fixed (atk, slot-weapon, slot-chest, slot-legs, dungeon and boss).

Round 03 (gear, resources and monster portraits) and round 04 (stat nodes, buildings, emblems, Druid, Forestry, fog, nebula, cluster veil and landmarks) were delivered the same day. The Star Chart is thus complete, with 106 of 106 files passing the check. The prototype now uses all layers, including the nebula and the fog texture. The fog and the landmarks were toned down after a visual review (the silhouette opacity in theme.json was lowered from 0.25 to 0.16).

### Combat at the node with an activity bar

The assistant recommends the user's original idea: combat takes place at the monster node on the map, not in a fixed panel in the middle of the screen. Codex's mockups show a small map where the center happens to be close to the fight. On a large map, a fixed panel would either cover the map or sit far from the monster.

Reasons:

- It holds on to the idea that everything is in the tree.
- In a dungeon, the player's node can move along the branch from monster to monster.
- When a boss is defeated, the camera is already at the boss, so the reveal of a new cluster can start from there.

Additions:

1. When a fight starts, the camera flies to the monster node. The player's node slides into a reserved spot next to the monster. Every monster node has such a spot in the map layout, so nothing overlaps.
2. When the active node is off screen, or the view is zoomed so far out that the node cannot be read, a small activity bar appears at the edge of the screen. It shows mini versions of both nodes with the attack indicator and health bars, and an arrow at the screen edge points toward the fight. A click flies the camera back.

The activity bar is not only for combat. Because the player has only one activity at a time, the same bar also shows progress in Woodcutting, Mining and Smelting.

### Offline progress

The user asked for offline progress on 16 October 2026. The details below are the assistant's choices and can be changed:

- The activity that was running when the player closed the game continues at full effect for the time the player was away.
- At most 8 hours are counted, and less than a minute does not count.
- If the player loses a fight along the way, the activity stops, just as it does during play.
- On the next start, a "While you were away" window shows the time, resources, levels and kills. Clusters revealed in the meantime stay hidden until the window is closed, so the reveal can still be seen.

Open point: the prototype's content lasts about 40 minutes, while 8 hours of Woodcutting gives around 28 levels. The effect and the cap should be tested before they are locked.

### Balance simulator

`npm run simulate` has a bot play the prototype 20 times with fixed random seeds and measures when the milestones are reached. The result is written to [balance.md](balance.md). The bot plays close to optimally, so real players will be slower. The targets are in `tools/simulate.mjs`.

### Skills, dungeons and the base (brainstorm, 16 October 2026)

The user wants to go "all in" on the base and sees it as what makes the concept original. The assistant's suggestions, none of them adopted yet except the residents:

- **The base as the trunk of the tree:** every cluster feeds the base along visible supply lines, and the base strengthens the branches. Loop: skills → base → dungeons (keys, residents, blueprints) → new branches on the map.
- **Skills without dead ends:** every resource is used by at least two other skills. Candidates: Fishing, Foraging, Hunting, Excavation (gathering); Cooking, Carpentry, Tanning, Alchemy, Masonry (processing); Tailoring, Jewelcrafting (crafting); Farming (plots that grow in real time in the base), Scouting (explores the fog), Construction (building in the base as an activity).
- **Bridge nodes:** nodes placed physically between two clusters that require levels in both, e.g. a Charcoal Burner between Woodcutting and Smithing. The map's geography then shows which skills belong together.
- **Dungeons as a small tree of rooms:** a branching map inside the dungeon node with combat, elite, boss, rest, treasure, trap and skill rooms (e.g. a collapsed tunnel that needs Mining 20). Supplies from other skills (food, potions, torches) limit how deep the player gets. Rewards that cannot be farmed: blueprints, residents, keys to hidden clusters and trophies. The route is chosen once and then runs by itself.
- **The base:** residents who unlock buildings and work secondary activities at low speed; buildings whose recipes need resources from many clusters; adjacency bonuses between buildings; wings (Workshop, Kitchen, Library, Barracks, Garden, Trophy Hall) that grow as new nodes around the base; a Trophy Hall with a permanent bonus per boss.

### Node list for the first prototype

A concrete proposal for the prototype's nodes with requirements, prices and effects is in [prototype-nodes.md](prototype-nodes.md). It has not been adopted, and the numbers are a first draft.

## Points to watch from the discussion

- The tree shape alone does not make the game fun; the player must have meaningful choices between improvement, exploration, gear and base investments.
- A large map must be easy to read through clusters, headings and local XP bars.
- A mix of known goals and unknown possibilities should preserve both direction and curiosity.
- One activity at a time forces prioritization; several simultaneous activities would change the character of the game and should be assessed later.

## The eight visual directions

1. Nordic minimalism: light surfaces, calm colors and a simple overview.
2. Dark fantasy: ornate frames, mystery and dramatic bosses.
3. Cozy pixel art: retro charm and small, detailed environments.
4. Hand-drawn adventure map: parchment, watercolor and pencil sketches of hidden branches.
5. Neon and holograms: glowing connections and strong color coding.
6. Paper cutouts and board game: physical pieces, soft colors and empty building slots.
7. Comics and chaos: thick lines, expressive monsters and humor.
8. Cosmic star chart: skill clusters as constellations in a large world.

The assistant's subjective favorites were 3, 4 and 7. The user has chosen the Star Chart (8) for the prototype, but the final style will be decided through the prototype. All images were generated with the built-in imagegen tool, and the prompts used are preserved.

An important difference between the images and the idea: several images show a round or curved attack indicator. The user's requirement is an indicator that follows the edge of the square node. The illustrations are mood and style sketches, not finished UI specifications. Level numbers on individual nodes, extra XP bars, resource icons and upgrade names in the images should not be read as adopted rules either.

## Next decisions when work continues

The first prototype was built on 16 October 2026 in `prototype/` as plain JavaScript with an SVG map and no build step. It covers all 58 nodes from the node list: one activity at a time, click-to-craft, modifiers with ranks, gear and sockets in the Home Base, combat points, combat at the node with an activity bar and an arrow at the screen edge, farming areas, the dungeon with its boss, visibility with fog, and the reveal of Druid and Forestry. The final visual direction, platform and engine have not been chosen. The balance has been measured with the balance simulator, where the bot defeats the boss after about 33 minutes, but it has not been tested with real players. Possible next topics are the scope of a first playable loop, the exact handling of activity switching and crafting, and simple rules for combat and defeat. This list is a summary of open topics, not an order to implement them.
