# Prototype: proposed nodes

Date: 16 October 2026. The assistant's proposal, not adopted by the user. All numbers are first drafts and are to be balanced in the prototype.

The proposal covers 58 nodes in six clusters plus two hidden clusters. The goal is that reaching and defeating the boss takes 30-45 minutes. Names and texts are neutral, in line with the user's decision to set humor aside for now.

## Basic rules

- The player can only do one activity at a time: gather, smelt or fight. Crafting is a click and does not interrupt the current activity (the assistant's assumption, not settled by the user).
- Each skill has its own level and its own XP bar. XP to the next level is 35 × 1.22^(level − 1). Level 8 takes about 480 XP in total, level 12 about 1,260 and level 15 about 2,420. The curve was tuned with the balance simulator, see [balance.md](balance.md).
- Visibility: nodes one step from an open node are visible. Nodes two steps away are shown as silhouettes in fog. Further away they are invisible. Hidden clusters are never shown, not even as fog.
- Modifiers have ranks (0/3) and are paid for with the resource they improve.
- Gear is crafted once in Smithing and equipped in an equipment slot at the Home Base.
- There is no gold. Combat gives XP and materials. Each combat level gives one combat point for the stat nodes in the Combat cluster.
- Combat: damage = ATK − the enemy's DEF, but at least 1. The player starts with 50 HP, 5 ATK, 2 DEF and a 2.0 s attack time.

## Woodcutting

| Node | Type | Requires | Price | Effect |
|---|---|---|---|---|
| Oak | Activity | — | — | 1 oak / 3.0 s, 5 XP |
| Sharp Axe | Modifier 0/3 | Lvl 2/4/6 | 10/25/50 oak | −0.2 s on Oak per rank |
| Bountiful Harvest | Modifier 0/3 | Lvl 3/5/7 | 15/30/60 oak | +10% chance of double oak per rank |
| Willow | Activity | Lvl 8 | — | 1 willow / 4.0 s, 12 XP |
| Nimble Felling | Modifier 0/3 | Lvl 9/11/13 | 10/25/50 willow | −0.3 s on Willow per rank |
| Rich Branches | Modifier 0/3 | Lvl 10/12/14 | 15/30/60 willow | +10% chance of double willow per rank |
| Ash | Activity | Lvl 15 + Tree Guardian defeated | — | 1 ash / 5.0 s, 25 XP |

Oak is fuel for copper and willow is fuel for iron, so Woodcutting stays relevant throughout the prototype. Ash is the end point and shows that the boss opened a new tier.

## Mining

| Node | Type | Requires | Price | Effect |
|---|---|---|---|---|
| Copper Ore | Activity | — | — | 1 copper ore / 3.0 s, 5 XP |
| Hard Pick | Modifier 0/3 | Lvl 2/4/6 | 10/25/50 copper ore | −0.2 s per rank |
| Rich Vein | Modifier 0/3 | Lvl 3/5/7 | 15/30/60 copper ore | +10% chance of double per rank |
| Iron Ore | Activity | Lvl 8 | — | 1 iron ore / 4.0 s, 12 XP |
| Heavy Pick | Modifier 0/3 | Lvl 9/11/13 | 10/25/50 iron ore | −0.3 s per rank |
| Deep Vein | Modifier 0/3 | Lvl 10/12/14 | 15/30/60 iron ore | +10% chance of double per rank |

## Smithing

### Smelting

| Node | Type | Requires | Price | Effect |
|---|---|---|---|---|
| Smelt Copper | Activity | — | 1 copper ore + 1 oak | 1 copper bar / 3.0 s, 4 XP |
| Smelt Iron | Activity | Lvl 6 | 1 iron ore + 1 willow | 1 iron bar / 4.0 s, 10 XP |
| Hot Furnace | Modifier 0/3 | Lvl 2/5/8 | 5/10/20 copper bars | −0.3 s on all smelting per rank |
| Thrifty Stoking | Modifier 0/2 | Lvl 7/9 | 3/6 iron bars | 25% chance of not using fuel per rank |

### Gear

| Node | Slot | Requires | Price | Effect |
|---|---|---|---|---|
| Copper Sword | Weapon | — | 4 copper bars | +4 ATK, 20 XP |
| Copper Helm | Head | — | 2 copper bars | +1 DEF, 10 XP |
| Copper Chestplate | Chest | Lvl 3 | 5 copper bars | +3 DEF, 25 XP |
| Copper Greaves | Legs | Lvl 2 | 3 copper bars | +2 DEF, 15 XP |
| Copper Boots | Boots | Lvl 4 | 2 copper bars + 3 leather | +1 DEF, 15 XP |
| Iron Sword | Weapon | Lvl 7 | 5 iron bars | +9 ATK, 50 XP |
| Iron Helm | Head | Lvl 6 | 3 iron bars | +2 DEF, 30 XP |
| Iron Greaves | Legs | Lvl 8 | 4 iron bars | +4 DEF, 40 XP |
| Iron Chestplate | Chest | Lvl 9 | 6 iron bars | +5 DEF, 60 XP |
| Iron Boots | Boots | Lvl 10 | 3 iron bars + 3 wolf pelts | +2 DEF, 30 XP |

The Copper Chestplate at 5 copper bars matches the user's Copper Armor example. The boots need materials from combat, so Smithing also depends on the Combat cluster.

## Combat

### Monsters

All three monsters are farming areas: when a monster dies, a new one appears automatically. The player's HP carries over from fight to fight. If the player dies, the fight ends, and after 10 s HP is full again.

| Monster | Becomes visible when | HP | ATK | DEF | Attack time | XP | Drop |
|---|---|---|---|---|---|---|---|
| Rat | From the start | 12 | 3 | 0 | 1.5 s | 4 | 30% chance of a rat tail |
| Goblin | 10 rats defeated | 30 | 8 | 2 | 2.2 s | 12 | 40% chance of a piece of leather |
| Wolf | 15 goblins defeated | 45 | 12 | 3 | 1.6 s | 22 | 35% chance of a wolf pelt |

The goblin is the first gear check: with the starting stats the player narrowly loses, with a copper sword the player wins safely. The wolf requires copper armor.

### Stat nodes

Each combat level from level 2 gives one combat point. Each rank costs one point. There are 21 ranks in total, and the player reaches about combat level 12-15 in the prototype, so choices have to be made.

| Node | Ranks | Requires | Effect |
|---|---|---|---|
| Strength | 0/5 | — | +1 ATK per rank |
| Endurance | 0/5 | — | +8 max HP per rank |
| Defense | 0/5 | — | +1 DEF per rank |
| Quick Hands | 0/3 | 3 points in Strength | −0.1 s attack time per rank |
| Critical Strike | 0/3 | 2 points in Quick Hands | +5% chance of double damage per rank |

Combat levels may later give other benefits than combat points, following the user's idea. That is not in the prototype.

## Dungeon: The Hollow Oak

The dungeon hangs off the Woodcutting cluster behind the lock on Ash. From the start it is shown as fog, and it becomes visible at woodcutting lvl 12. The monsters come in order, and HP carries over all the way. If the player dies, the dungeon starts over without a reward.

| Monster | HP | ATK | DEF | Attack time | XP |
|---|---|---|---|---|---|
| Bark Beetle | 30 | 14 | 4 | 1.8 s | 15 |
| Moss Lump | 45 | 16 | 7 | 2.4 s | 20 |
| Raging Squirrel | 35 | 18 | 3 | 1.2 s | 18 |
| Tree Guardian (boss) | 160 | 26 | 8 | 2.8 s | 150 |

Estimate for the whole dungeon with Whetstone and Campfire at the Home Base, computed with the engine's `estimate`:

- With full copper gear, or an iron sword and the rest in copper, the player loses, even with 18 combat points.
- With 13 combat points (4 Strength, 3 Quick Hands, 3 Defense, 3 Endurance) and full iron gear, the player narrowly wins with 10 of 74 HP left.
- With 15 combat points, an iron sword, iron chestplate and iron greaves narrowly win (13 of 74 HP), and full iron gear wins with 27 of 74 HP.
- In the balance simulator the boss falls after 32-33 minutes of play (median), and the bot then has combat at around lvl 14.

The iron chestplate and iron greaves are therefore the key, and they need both willow and iron. The victory opens Ash and triggers the hidden Druid cluster.

## Home Base

### Equipment

| Node | Effect |
|---|---|
| Weapon | Slot for a crafted weapon |
| Head | Slot for a crafted helm |
| Chest | Slot for a crafted chestplate |
| Legs | Slot for crafted greaves |
| Boots | Slot for crafted boots |

All five slots are visible and empty from the start. Clicking a slot shows the gear the player has crafted for that slot. The equipment is also shown on the player's node in combat.

### Buildings

| Node | Price | Effect |
|---|---|---|
| Socket 1 and 2 | From the start | Empty places for buildings |
| Extension | 40 oak + 20 willow + 10 copper bars | Socket no. 3 |
| Saw | 20 oak + 3 copper bars | Woodcutting 15% faster |
| Ore Cart | 15 oak + 5 copper bars | Mining 15% faster |
| Whetstone | 15 copper ore + 3 copper bars | +2 ATK |
| Campfire | 30 oak | +2 HP after each defeated monster |
| Bellows | 20 willow + 4 iron bars | Smelting 25% faster |

Each building is built once and placed in a socket. Buildings can be swapped around for free. There are five buildings and at most three places, so the player has to choose between faster gathering and stronger combat.

## Hidden clusters

### Druid

Triggered when the Tree Guardian is defeated. A new connection grows out from the boss.

| Node | Price | Effect |
|---|---|---|
| Root Network | Free | +10% XP in woodcutting |
| Thornskin | 30 willow + 5 wolf pelts | Enemies take 2 damage when they hit the player |
| Herbal Medicine | 10 rat tails | Heals 15% HP every 20 s in combat |
| Unknown | — | Shown as fog and hints that the cluster continues |

### Forestry

Triggered when the player has felled 300 oak in total. The cluster appears in an empty area of the map.

| Node | Price | Effect |
|---|---|---|
| Plant a Tree | 0/10, 25 oak per rank | +1% XP in woodcutting per rank |
| Sustainable Felling | 50 oak | Oak gives +2 XP but takes 0.2 s longer |

The prototype thus has both kinds of surprise: one triggered by a boss and one triggered by the player's activity.

## Visible from the start

About 20 of the 58 nodes are visible from the start: Oak, Copper Ore, Smelt Copper, the first copper recipes, Rat, the first three stat nodes and the Home Base with five empty equipment slots and two empty sockets. Willow and Iron Ore are shown with locks and level requirements. A silhouette next to the rat hints at the next monster, and behind the lock on Ash lies fog.

## Deliberately left out

Gold, offline progress, food and cooking, more gear tiers, prestige and sound. They can be taken up once it has been tested whether the core works.

## Open questions for the user

1. Is it ok that gear is crafted once and can then be chosen in its slot, without an actual inventory?

The style is settled: the prototype is built in the starchart style (8). The language is settled too: the game is in English (the user's decision, 16 October 2026).
