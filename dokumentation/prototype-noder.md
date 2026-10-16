# Prototype: forslag til nodes

Dato: 16. oktober 2026. Assistentens forslag, ikke vedtaget af brugeren. Alle tal er første udkast og skal balanceres i prototypen.

Forslaget dækker 58 nodes i seks klynger plus to skjulte klynger. Målet er, at det tager 30-45 minutter at nå frem til bossen og besejre den. Navne og tekster er neutrale, jf. brugerens beslutning om at lægge humor til side indtil videre.

## Grundregler

- Spilleren kan kun udføre én aktivitet ad gangen: indsamle, smelte eller kæmpe. Crafting er et klik og afbryder ikke den aktive aktivitet (assistentens antagelse, ikke afgjort af brugeren).
- Hver skill har sit eget level og sin egen XP-bar. XP til næste level er 35 × 1,22^(level − 1). Level 8 kræver ca. 480 XP i alt, level 12 ca. 1.260 og level 15 ca. 2.420. Kurven er justeret med balanceringssimulatoren, se [balancering.md](balancering.md).
- Synlighed: nodes ét skridt fra en åben node er synlige. Nodes to skridt væk vises som silhuetter i tåge. Længere væk er de usynlige. Skjulte klynger vises aldrig, heller ikke som tåge.
- Modifiers har ranks (0/3) og betales med den ressource, de forbedrer.
- Gear craftes én gang i smedjen og tages på i et udrustningsslot i hjemmebasen.
- Der er ingen guld. Combat giver XP og materialer. Hvert kamp-level giver ét kamppoint til stat-nodes i kampklyngen.
- Combat: skade = ATK − fjendens DEF, dog mindst 1. Spilleren starter med 50 HP, 5 ATK, 2 DEF og 2,0 sek. angrebstid.

## Træfældning

| Node | Type | Krav | Pris | Effekt |
|---|---|---|---|---|
| Eg | Aktivitet | — | — | 1 eg / 3,0 sek., 5 XP |
| Skarp økse | Modifier 0/3 | Lvl 2/4/6 | 10/25/50 eg | −0,2 sek. på Eg pr. rank |
| Rigelig høst | Modifier 0/3 | Lvl 3/5/7 | 15/30/60 eg | +10% chance for dobbelt eg pr. rank |
| Pil | Aktivitet | Lvl 8 | — | 1 pil / 4,0 sek., 12 XP |
| Smidig fældning | Modifier 0/3 | Lvl 9/11/13 | 10/25/50 pil | −0,3 sek. på Pil pr. rank |
| Grenrigdom | Modifier 0/3 | Lvl 10/12/14 | 15/30/60 pil | +10% chance for dobbelt pil pr. rank |
| Ask | Aktivitet | Lvl 15 + Træets vogter besejret | — | 1 ask / 5,0 sek., 25 XP |

Eg er brændsel til kobber, og pil er brændsel til jern, så træfældning forbliver relevant gennem hele prototypen. Ask er slutpunktet og viser, at bossen åbnede en ny tier.

## Minedrift

| Node | Type | Krav | Pris | Effekt |
|---|---|---|---|---|
| Kobbermalm | Aktivitet | — | — | 1 kobbermalm / 3,0 sek., 5 XP |
| Hård hakke | Modifier 0/3 | Lvl 2/4/6 | 10/25/50 kobbermalm | −0,2 sek. pr. rank |
| Rig åre | Modifier 0/3 | Lvl 3/5/7 | 15/30/60 kobbermalm | +10% chance for dobbelt pr. rank |
| Jernmalm | Aktivitet | Lvl 8 | — | 1 jernmalm / 4,0 sek., 12 XP |
| Tung hakke | Modifier 0/3 | Lvl 9/11/13 | 10/25/50 jernmalm | −0,3 sek. pr. rank |
| Dyb åre | Modifier 0/3 | Lvl 10/12/14 | 15/30/60 jernmalm | +10% chance for dobbelt pr. rank |

## Smedje

### Smeltning

| Node | Type | Krav | Pris | Effekt |
|---|---|---|---|---|
| Smelt kobber | Aktivitet | — | 1 kobbermalm + 1 eg | 1 kobberbarre / 3,0 sek., 4 XP |
| Smelt jern | Aktivitet | Lvl 6 | 1 jernmalm + 1 pil | 1 jernbarre / 4,0 sek., 10 XP |
| Varm ovn | Modifier 0/3 | Lvl 2/5/8 | 5/10/20 kobberbarre | −0,3 sek. på al smeltning pr. rank |
| Sparsom fyring | Modifier 0/2 | Lvl 7/9 | 3/6 jernbarre | 25% chance for ikke at bruge brændsel pr. rank |

### Gear

| Node | Slot | Krav | Pris | Effekt |
|---|---|---|---|---|
| Kobbersværd | Våben | — | 4 kobberbarre | +4 ATK, 20 XP |
| Kobberhjelm | Hoved | — | 2 kobberbarre | +1 DEF, 10 XP |
| Kobberbrystplade | Bryst | Lvl 3 | 5 kobberbarre | +3 DEF, 25 XP |
| Kobberbenskinner | Ben | Lvl 2 | 3 kobberbarre | +2 DEF, 15 XP |
| Kobberstøvler | Fødder | Lvl 4 | 2 kobberbarre + 3 læder | +1 DEF, 15 XP |
| Jernsværd | Våben | Lvl 7 | 5 jernbarre | +9 ATK, 50 XP |
| Jernhjelm | Hoved | Lvl 6 | 3 jernbarre | +2 DEF, 30 XP |
| Jernbenskinner | Ben | Lvl 8 | 4 jernbarre | +4 DEF, 40 XP |
| Jernbrystplade | Bryst | Lvl 9 | 6 jernbarre | +5 DEF, 60 XP |
| Jernstøvler | Fødder | Lvl 10 | 3 jernbarre + 3 ulveskind | +2 DEF, 30 XP |

Kobberbrystpladen til 5 kobberbarre svarer til brugerens eksempel med Copper Armor. Støvlerne kræver materialer fra combat, så smedjen også afhænger af kampklyngen.

## Kamp

### Monstre

Alle tre monstre er farmingområder: når et monster dør, kommer der automatisk et nyt. Spillerens HP følger med fra kamp til kamp. Dør spilleren, afsluttes kampen, og efter 10 sek. er HP fuld igen.

| Monster | Bliver synlig når | HP | ATK | DEF | Angrebstid | XP | Drop |
|---|---|---|---|---|---|---|---|
| Rotte | Fra start | 12 | 3 | 0 | 1,5 sek. | 4 | 30% chance for en rottehale |
| Goblin | 10 rotter besejret | 30 | 8 | 2 | 2,2 sek. | 12 | 40% chance for et stykke læder |
| Ulv | 15 goblins besejret | 45 | 12 | 3 | 1,6 sek. | 22 | 35% chance for et ulveskind |

Goblinen er det første gear-tjek: med startstats taber spilleren knebent, med kobbersværd vinder spilleren sikkert. Ulven kræver kobberrustning.

### Stat-nodes

Hvert kamp-level fra level 2 giver ét kamppoint. Hver rank koster ét point. Der er 21 ranks i alt, og spilleren når cirka kamp-level 12-15 i prototypen, så der skal vælges.

| Node | Ranks | Krav | Effekt |
|---|---|---|---|
| Styrke | 0/5 | — | +1 ATK pr. rank |
| Udholdenhed | 0/5 | — | +8 max HP pr. rank |
| Forsvar | 0/5 | — | +1 DEF pr. rank |
| Hurtige hænder | 0/3 | 3 point i Styrke | −0,1 sek. angrebstid pr. rank |
| Kritisk slag | 0/3 | 2 point i Hurtige hænder | +5% chance for dobbelt skade pr. rank |

Kamp-level kan senere give andre fordele end kamppoint, jf. brugerens idé. Det er ikke med i prototypen.

## Dungeon: Den hule eg

Dungeonen hænger på træfældningsklyngen bag låsen på Ask. Fra start vises den som tåge, og den bliver synlig ved træfældning lvl 12. Monstrene kommer i rækkefølge, og HP følger med hele vejen. Dør spilleren, starter dungeonen forfra uden belønning.

| Monster | HP | ATK | DEF | Angrebstid | XP |
|---|---|---|---|---|---|
| Barkbille | 30 | 14 | 4 | 1,8 sek. | 15 |
| Mosklump | 45 | 16 | 7 | 2,4 sek. | 20 |
| Rasende egern | 35 | 18 | 3 | 1,2 sek. | 18 |
| Træets vogter (boss) | 160 | 26 | 8 | 2,8 sek. | 150 |

Overslag over hele dungeonen med Slibesten og Bålplads i hjemmebasen, beregnet med motorens `estimer`:

- Med fuldt kobbergear eller jernsværd og resten i kobber taber spilleren, selv med 18 kamppoint.
- Med 13 kamppoint (4 Styrke, 3 Hurtige hænder, 3 Forsvar, 3 Udholdenhed) og fuldt jerngear vinder spilleren knebent med 10 af 74 HP tilbage.
- Med 15 kamppoint vinder jernsværd, jernbrystplade og jernbenskinner knebent (13 af 74 HP), og fuldt jerngear vinder med 27 af 74 HP.
- I balanceringssimulatoren falder bossen efter 32-33 minutters spil (median), og botten har da kamp omkring lvl 14.

Jernbrystpladen og jernbenskinnerne er dermed nøglen, og de kræver både pil og jern. Sejren åbner Ask og udløser den skjulte Druide-klynge.

## Hjemmebase

### Udrustning

| Node | Effekt |
|---|---|
| Våben | Slot til et crafted våben |
| Hoved | Slot til en crafted hjelm |
| Bryst | Slot til en crafted brystplade |
| Ben | Slot til crafted benskinner |
| Fødder | Slot til crafted støvler |

Alle fem slots er synlige og tomme fra start. Et klik på et slot viser det gear, spilleren har crafted til det slot. Udrustningen vises også på spillerens node i combat.

### Bygninger

| Node | Pris | Effekt |
|---|---|---|
| Socket 1 og 2 | Fra start | Tomme pladser til bygninger |
| Tilbygning | 40 eg + 20 pil + 10 kobberbarre | Socket nr. 3 |
| Sav | 20 eg + 3 kobberbarre | Træfældning 15% hurtigere |
| Malmvogn | 15 eg + 5 kobberbarre | Minedrift 15% hurtigere |
| Slibesten | 15 kobbermalm + 3 kobberbarre | +2 ATK |
| Bålplads | 30 eg | +2 HP efter hvert besejret monster |
| Blæsebælg | 20 pil + 4 jernbarre | Smeltning 25% hurtigere |

Hver bygning bygges én gang og sættes i en socket. Bygninger kan byttes rundt gratis. Der er fem bygninger og højst tre pladser, så spilleren skal vælge mellem hurtigere indsamling og stærkere combat.

## Skjulte klynger

### Druide

Udløses når Træets vogter er besejret. En ny forbindelse vokser ud fra bossen.

| Node | Pris | Effekt |
|---|---|---|
| Rodnet | Gratis | +10% XP i træfældning |
| Tornehud | 30 pil + 5 ulveskind | Fjender tager 2 skade, når de rammer spilleren |
| Urtemedicin | 10 rottehaler | Helbreder 15% HP hvert 20. sek. i kamp |
| Ukendt node | — | Vises som tåge og antyder, at klyngen fortsætter |

### Skovbrug

Udløses når spilleren har fældet 300 eg i alt. Klyngen dukker op i et tomt område på kortet.

| Node | Pris | Effekt |
|---|---|---|
| Plant et træ | 0/10, 25 eg pr. rank | +1% XP i træfældning pr. rank |
| Bæredygtig fældning | 50 eg | Eg giver +2 XP, men tager 0,2 sek. længere |

Prototypen har dermed begge slags overraskelser: én udløst af en boss og én udløst af spillerens aktivitet.

## Synligt fra start

Cirka 20 af de 58 nodes er synlige fra start: Eg, Kobbermalm, Smelt kobber, de første kobberopskrifter, Rotte, de tre første stat-nodes og hjemmebasen med fem tomme udrustningsslots og to tomme sockets. Pil og Jernmalm vises med låse og levelkrav. En silhuet ved siden af rotten antyder næste monster, og bag låsen på Ask ligger tåge.

## Bevidst udeladt

Guld, offline progress, mad og cooking, flere gear-tiers, prestige og lyd. De kan tages op, når det er afprøvet, om kernen fungerer.

## Åbne spørgsmål til brugeren

1. Er det ok, at gear craftes én gang og derefter kan vælges i sit slot, uden et egentligt inventory?
2. Skal spillets tekster være på dansk eller engelsk? Konceptbillederne bruger engelsk, nodelisten bruger dansk.

Stilen er afgjort: prototypen bygges i stjernekortet (8).
