# Asset-liste til Codex: stjernekort

Genereret af `node tools/lav-asset-liste.mjs` ud fra [asset-manifest.json](../temaer/asset-manifest.json) og [tema.json](../temaer/stjernekort/tema.json). Ret i de to filer eller i reglerne i værktøjet, ikke her.

Prototypen skal bruge 106 filer: 91 med prioritet P1 og 15 med P2. Manifestet er kontrakten mellem spilkoden og temaerne. Spilkoden henviser kun til id'er, så et nyt grafisk udtryk er en ny temamappe med de samme id'er.

Motivprompter, noter, familie og promptskabelon for hver fil står i manifestet. Noterne er til kvalitetstjek; alt, der skal med i billedet, står i prompt_en.

## Sådan leverer du

- Læg hver fil i `temaer/stjernekort/<id>.<format>`, fx `temaer/stjernekort/noder/eg.png`.
- Id'er: Små bogstaver a-z, tal og bindestreg, én skråstreg mellem mappe og navn. æ → ae, ø → oe, å → aa. Id'et er kun entydigt som hel sti: noder/eg og ressourcer/eg er to forskellige assets.
- PNG-filer gemmes som 8-bit RGBA (eller RGB for opake) uden interlace.
- Kør `node tools/tjek-assets.mjs` fra projektmappen. Det tjekker manifest og tema.json, navne, størrelser, formater, transparens og kanter, motivets fyldgrad, hvide glyffer, sømme i PNG-fliser og filstørrelser, og det viser, hvad der mangler.
- Gem originaler i 1024 px, efterbehandlingsscripts og kontaktark i `kilder/stjernekort/` eller i en batchmappe under `grafik/`, uden for temamappen.
- Gem en `prompts.json` pr. batch med strukturen `{ "<id>": { "prompt": "…", "model": "…", "dato": "ÅÅÅÅ-MM-DD", "referencer": ["<id>"] } }`.

### Generator og plan B

- Billedgeneratoren laver 1024×1024. Generér i den størrelse, og skalér ned.
- Uden ægte transparens: generér på flad neutral mellemgrå (#808080), og friskær med en segmenteringsmodel.
- Uden referencebilleder: lav søskende side om side i ét billede, og skær dem ud bagefter.
- Uden inpainting: lav sømløse fliser procedurelt.

### Efterbehandling af malede filer

1. Fjern løse, næsten usynlige pixels (alfa under ca. 8) og halvgennemsigtige rester uden for motivet.
2. Rens kantfarven, og udvid farven ind under de transparente pixels (alpha bleed), så der ikke kommer rande ved skalering.
3. Trim til alfaens omrids, skalér, så den længste side får mappens fyldgrad (noder 76%, ressourcer 84%, portrætter 80%, emblemer 90%), og centrér. Portrætter med kant_tilladt placeres, så busten skæres af ved bunden.
4. Nedskalér med præmultipliceret alfa (fx sharp/libvips, `npm i sharp` i kilder/), og gem som 8-bit RGBA PNG uden interlace.

### Prioritet

- **P1:** Alt, spilleren ser på vejen frem til og med bossen, undtagen stemningslag og landmærker. Leveres først.
- **P2:** Det, der først vises efter bossen eller efter en skjult trigger (Druide, Skovbrug, ask), samt stemningslagene baggrunde/nebula og baggrunde/klyngesloer og landmærke-silhuetterne.
- **P3:** Valgfrit pynt. Ingen lige nu.
- **Manglende filer:** Spillet kører uden filen og viser en pladsholder tegnet i kode, så rækkefølgen aldrig blokerer prototypen.

## Rækkefølge

1. **Prøvebatch.** `noder/eg`, `noder/kobberbrystplade`, `ressourcer/kobberbarre`, `glyffer/laas`, `portraetter/spiller`, `portraetter/ulv`, `emblemer/traefaeldning`, `baggrunde/stjernehimmel`. Brugeren godkender stilen, før resten laves. noder/eg og noder/kobberbrystplade er stilreference for alle noder, indtil familiens egen første fil er godkendt.
2. **Familiebatches.** Familie for familie, med de godkendte filer som referencebilleder. Familierne står i manifestets felt familie: `traeer`, `traefaeldning-modifiers`, `malme`, `minedrift-modifiers`, `ovne`, `kobbergear`, `jerngear`, `stat-noder`, `bygninger`, `druide`, `skovbrug`, `ressourcer`, `portraetter`, `emblemer`, `baggrunde`, `silhuetter`. Par, hvor forskellen er vigtig (kobber og jern i samme slot, Hård og Tung hakke, Varm ovn og Sparsom fyring), laves med samme reference eller side om side.
3. **Kontaktark.** Efter hver familie gemmes et kontaktark som `kilder/stjernekort/kontaktark/<familie>.png`. Det viser filerne i de rigtige størrelser på nodefladen (#121735), i farve og i gråtoner: noder i 56 og 72 px (gear også i 24 px), ressourcer i 16 og 32 px, glyffer i 14-32 px, portrætter i 64 og 128 px og emblemer i 24, 32 og 64 px. Søskende står side om side. Lever i runder på en eller flere familier efter aftale med brugeren, og stop efter hver runde, indtil den er godkendt.
4. **P1 før P2.**

## Prompts

Fuld prompt = basis (når skabelonen bruger basis) + skabelonens tekst + "Subject: " + postens prompt_en. Skabelonen står i postens felt tillaeg. Glyffer genereres ikke; de tegnes som SVG.

### Basis

> Game art asset for a serious, elegant celestial fantasy RPG. The image contains only the isolated subject described below. Shared look: digitally hand-painted fantasy RPG icon art with crisp edges and painterly texture; natural material colours with rich but believable saturation, set against deep indigo-blue shadows; a soft warm key light from the upper left balanced by a cool blue-violet fill light from the right; clear value contrast and a strong, instantly readable silhouette; grounded medieval fantasy materials such as wood, bark, stone, copper, iron, leather and fur with convincing texture. Mood: magical and restrained; serious and neutral, never cute, comic or caricatured, no exaggerated expressions, no gore. No text, letters, numbers, runes, inscriptions, logos, signatures or watermarks anywhere, including on blades, shields and rims. No frame, border, backing plate, panel, button or bar around the subject, and no glowing outline, outer glow, halo, lens flare or vignette. No smoke, haze, heat shimmer, drifting sparks or floating particles.

### Skabeloner

**noder** (med basis; bruges af 43 filer)

> Asset type: node icon for a talent-tree map. Rendering: a richly detailed digital painting in the manner of a premium RPG item icon, with crisp edges and painterly texture. View: a slight three-quarter view from above unless the subject states another view. Gear items float with no base or ground. Composition: one subject, centered, with generous empty space on all sides and nothing touching or crossing the edges. Background: fully transparent, with no scenery, sky, stars, sparkles or smoke, and no cast shadow except on a small base when the subject names one. Use a bold, simple overall shape with a distinctive outline and large, clearly separated forms.

**ressourcer** (med basis; bruges af 10 filer)

> Asset type: small resource icon. Rendering: the same digital painting style, simplified into a few large, bold forms with minimal fine detail, a clean outer contour and strong light-dark contrast, in a slight three-quarter view from above, lit from the upper left. Composition: a single object, centered and filling most of the canvas, nothing touching the edges. Background: fully transparent, with no ground, no shadow and no props beyond those named.

**portraetter** (med basis; bruges af 8 filer)

> Asset type: square combat portrait. Rendering: the same digital painting style with more detail than the node icons; a single figure or creature, framed as the subject states (head-and-shoulders, waist-up or full body) and always filling about 80% of the square, with the eyes at about 40% from the top. Head-and-shoulders and waist-up figures are cut off by the bottom edge of the square; nothing touches the top or the sides, and full-body figures stay fully inside with space below. Lit from the upper left so the figure separates from a dark background by value contrast rather than a glowing rim. Background: a flat, plain neutral mid-grey (#6B6B73) with nothing else behind the subject; it will be removed.

**emblemer** (med basis; bruges af 8 filer)

> Asset type: round cluster emblem. The medallion itself is the subject, not an interface frame. Rendering: a perfectly circular medallion seen straight on, in dark neutral silver-grey enamel with a thin, plain silver rim and one simple central motif inlaid in bright pale silver, with bold shapes. The rim is completely plain: no inscriptions, lettering, notches, beads, laurels, ribbons, banners, stars or extra rings. Centered, filling about 90% of the canvas, fully transparent outside the disc. Greyscale only; colour is added afterwards.

**baggrund-flise** (uden basis; bruges af 1 filer)

> Asset type: seamless tileable background texture for a game map, not an illustration: no subject, no focal point, no horizon, no planets, moons, galaxies or constellation lines, evenly distributed all the way to every edge, with low overall brightness. No text, signature or watermark.

**baggrund-toenbar-flise** (uden basis; bruges af 2 filer)

> Asset type: seamless tileable greyscale texture, not an illustration. Greyscale only: white mist on pure black, no stars, no colour, using the full range from dark grey to bright white, evenly distributed all the way to every edge with no focal point. No text, signature or watermark.

**baggrund-toenbar-enkelt** (uden basis; bruges af 1 filer)

> Asset type: a single soft light shape, not an illustration. Greyscale only: white light on pure black, no stars, no colour, fading completely to black well before every edge. No text, signature or watermark.

**baggrund-enkelt** (uden basis; bruges af 1 filer)

> Asset type: background plate behind a square character portrait, not an illustration: no subject, no planets, moons, galaxies or constellation lines, with the outer edge kept dark and empty. No text, signature or watermark.

**silhuetter** (uden basis; bruges af 4 filer)

> Asset type: distant landmark silhouette for unexplored fog. Draw a clear, solid light-grey silhouette mass on pure black, clearly brighter than the background, with aerial perspective and only subtle internal shading, anchored at the bottom center with clear empty space above and to the sides. No linework, outlines, lit windows or light sources, and nothing else in the image: no stars, moon, sky glow, ground plane, text or signature.

## Afvisningskriterier

Lav filen om, hvis den har:

- bogstaver, runer, indskrifter eller tal, også på klinger, skjolde og medaljonkanter (zoom til 200% for at finde pseudotekst)
- en signatur i et hjørne
- en ramme, plade eller glorie om motivet, eller en glødende kant (emblemets egen skive og kant er tilladt)
- stjerner, gnister, røg eller glød omkring et transparent motiv
- et motiv, der er beskåret eller rører kanten (undtagen bunden af bryst-op- og overkrop-portrætter)
- en lys eller mørk rand i alfakanten
- et nuttet eller komisk udtryk

## Det laver koden, ikke billederne

Rammer, glød, forbindelseslinjer, overskrifter, XP-bars, HP-bars, angrebsindikatoren langs kanten, tal og tekst, effekter (partikler, slag, kritisk slag, level-up og afsløringer), pilen i skærmkanten, afspil- og stopfigurer, nære stjerner, tåge-silhuetter af ikonerne, låst og besejret tilstand (mørkning og desaturering), spejling af portrætter og pladsholdere for filer, der mangler.

## Farver i stjernekortet

| Klynge | Farve |
|---|---|
| traefaeldning | `#6DD58C` |
| minedrift | `#62B8F0` |
| smedje | `#F0A03C` |
| kamp | `#E5484D` |
| hjemmebase | `#F5CF6B` |
| den-hule-eg | `#9E2B3A` |
| druide | `#A78BFA` |
| skovbrug | `#45CDBE` |

Baggrund `#0A0D24`, nodeflade `#121735`, tekst `#F2EAD8`. Alle farver står i tema.json.

## Noder (43)

- 256×256 PNG med transparent baggrund.
- Ét samlet motiv uden røg, damp, dis, gnister eller løse partikler. Koden laver tåge-silhuetter ved at gøre ikonet sort og sløre det, så alt uden for motivet bliver til grå pletter.
- Motivets længste side fylder 76% af lærredet, og intet rører kanten. Mål det efter, at næsten usynlige kantpixels er fjernet.
- Naturlige materialefarver. Klyngefarven ligger i kodens ramme og glød, bortset fra små accenter, som står i prompten.
- Aktiviteter viser kilden på en lille base (træ på tue, klippe, ovn). Hastighedsmodifiers viser et redskab. Udbyttemodifiers viser en rigelig mængde af råvaren. Bygninger står på den samme lille runde jordplet.
- Gear svæver uden base med fast vinkel pr. slot: sværd diagonalt med fæstet nederst til venstre, hjelm og brystplade forfra, benskinner side om side forfra og støvler i trekvart.
- Kobber er altid varm rødorange med runde, hamrede former. Jern er altid kølig blågrå med kantede former og sølvhøjlys.
- Mørke materialer som jern, mørk sten og bark forsvinder på den mørke nodeflade. Giv dem lyse kanter fra lyset øverst til venstre.

| Id | Prio | Familie | Fil | Motiv |
|---|---|---|---|---|
| `noder/eg` | P1 | traeer | 256×256 png | Bredt, gammelt egetræ med rund krone på en lille græstue |
| `noder/skarp-oekse` | P1 | traefaeldning-modifiers | 256×256 png | Skovhuggerøkse med nyslebet, blank æg, hugget ned i en egekævle |
| `noder/rigelig-hoest` | P1 | traefaeldning-modifiers | 256×256 png | Flettet kurv, der flyder over med egebrænde og agern |
| `noder/pil` | P1 | traeer | 256×256 png | Grædepil med lange, hængende grene over en lille dam |
| `noder/smidig-faeldning` | P1 | traefaeldning-modifiers | 256×256 png | Let krumkniv, der skærer gennem hængende pilegrene |
| `noder/grenrigdom` | P1 | traefaeldning-modifiers | 256×256 png | Afskåret pilegren, der deler sig i mange bladrige skud |
| `noder/ask` | P1 | traeer | 256×256 png | Højt, ranket asketræ med lys bark, luftig krone og vingede frø |
| `noder/kobbermalm` | P1 | malme | 256×256 png | Afrundet, forvitret klippe i varm brungrå sten med kobberorange årer og grøn malakit |
| `noder/haard-hakke` | P1 | minedrift-modifiers | 256×256 png | Spidshakke med hærdet stålspids, lænet op ad en kobberåret sten |
| `noder/rig-aare` | P1 | minedrift-modifiers | 256×256 png | Kløvet sten med et indre fyldt af forgrenet kobber |
| `noder/jernmalm` | P1 | malme | 256×256 png | Kantet blågrå klippe med kraftige sølvgrå jernårer og få rustpletter |
| `noder/tung-hakke` | P1 | minedrift-modifiers | 256×256 png | Massiv jernhakke med to spidser, stående lodret i en kantet blågrå klippe med sølvårer |
| `noder/dyb-aare` | P1 | minedrift-modifiers | 256×256 png | Blågrå klippe kløvet af en bred, dyb kløft med sølvgrå jernårer og en rigelig bunke jernmalm, der vælter ud |
| `noder/smelt-kobber` | P1 | ovne | 256×256 png | Lav, rund lerovn med en digel af smeltet kobber |
| `noder/smelt-jern` | P1 | ovne | 256×256 png | Høj smelteovn af grå sten med skorsten, hvorfra hvidglødende jern løber ud |
| `noder/varm-ovn` | P1 | ovne | 256×256 png | Fyrboks af mursten og sten med tung jernlåge slået helt op og høje flammer |
| `noder/sparsom-fyring` | P1 | ovne | 256×256 png | Samme fyrboks som Varm ovn med lågen næsten lukket, en lille rolig flamme og to ubrugte brændestykker |
| `noder/kobbersvaerd` | P1 | kobbergear | 256×256 png | Kort, bredt, bladformet kobbersværd med læderviklet greb |
| `noder/kobberhjelm` | P1 | kobbergear | 256×256 png | Enkel, rund kobberkalot med nittet pandebånd og kort næseskærm |
| `noder/kobberbrystplade` | P1 | kobbergear | 256×256 png | Brystplade af afrundede, hamrede kobberplader med nitter og læderremme |
| `noder/kobberbenskinner` | P1 | kobbergear | 256×256 png | Et par benskinner af kobber med afrundede skinnebensplader og læderremme |
| `noder/kobberstoevler` | P1 | kobbergear | 256×256 png | Et par brune læderstøvler med tåkapper og ankelbånd af kobber |
| `noder/jernsvaerd` | P1 | jerngear | 256×256 png | Langt, lige, tveægget jernsværd med blodrille og korsformet parerstang |
| `noder/jernhjelm` | P1 | jerngear | 256×256 png | Mørkegrå jernhjelm med høj rygget kuppel, kindskærme og visir med øjenspalter |
| `noder/jernbenskinner` | P1 | jerngear | 256×256 png | Et par mørke jernbenskinner med kantede skinnebensplader og leddelte knæplader |
| `noder/jernbrystplade` | P1 | jerngear | 256×256 png | Tung, mørk jernbrystplade med overlappende kantede plader, midterkam og skulderplader |
| `noder/jernstoevler` | P1 | jerngear | 256×256 png | Et par tunge, ankelhøje støvler med tåkapper og ankelplader af jern, foret med gråt ulveskind |
| `noder/styrke` | P1 | stat-noder | 256×256 png | Løftet, knyttet næve i stålpanserhandske med karminrøde remme, set i trekvart |
| `noder/udholdenhed` | P1 | stat-noder | 256×256 png | Hjerteformet rubin, der står op, med ét nittet jernbånd om |
| `noder/forsvar` | P1 | stat-noder | 256×256 png | Stålskjold med nittet kant og glat karminrødt felt |
| `noder/hurtige-haender` | P1 | stat-noder | 256×256 png | Lille messingtimeglas med karminrødt sand og fjervinger på siderne |
| `noder/kritisk-slag` | P1 | stat-noder | 256×256 png | Dolk boret ind i en stenblok med revner, der stråler ud fra træffet |
| `noder/sav` | P1 | bygninger | 256×256 png | Savbuk med en halvt gennemsavet egestamme og en stor rammesav i snittet |
| `noder/malmvogn` | P1 | bygninger | 256×256 png | Trævogn med jernbeslag, fyldt med kobbermalm, på et kort stykke skinne |
| `noder/slibesten` | P1 | bygninger | 256×256 png | Rund slibesten i træstativ med håndsving, vandtrug og et kort blad lænet mod stenen |
| `noder/baalplads` | P1 | bygninger | 256×256 png | Bål i en ring af sten med en lille stak kløvet egebrænde og en stamme at sidde på |
| `noder/blaesebaelg` | P1 | bygninger | 256×256 png | Stor smedebælg af læder og træplader med messingtud, rettet mod en lille bunke gløder |
| `noder/tilbygning` | P1 | bygninger | 256×256 png | Ufærdigt bindingsværk til en lille bygning med stillads, plankestabel og kobberbeslag |
| `noder/rodnet` | P2 | druide | 256×256 png | Løs, rund klump af levende, knudrede rødder med et agern i midten og små violette blomster |
| `noder/tornehud` | P2 | druide | 256×256 png | Tom armskinne af hærdet bark, der står op af sig selv, omviklet med tornede ranker og violette knopper |
| `noder/urtemedicin` | P2 | druide | 256×256 png | Stenmorter med støder og knuste grønne urter, ved siden af et bundt tørrede urter bundet med snor |
| `noder/plant-et-trae` | P2 | skovbrug | 256×256 png | Ung egeplante med få friske blade i en lille bunke mørk jord og en planteske med træskaft |
| `noder/baeredygtig-faeldning` | P2 | skovbrug | 256×256 png | Glatsavet egestub med et kraftigt nyt skud fra siden og en lille, pæn stak kløvet brænde |

## Ressourcer (10)

- 128×128 PNG med transparent baggrund. Motivets længste side fylder 84%, og det består af få, store former.
- Ressourcen er selve råvaren (stamme, malmklump, barre), mens aktivitetsnoden viser kilden (træet, klippen).

| Id | Prio | Familie | Fil | Motiv |
|---|---|---|---|---|
| `ressourcer/eg` | P1 | ressourcer | 128×128 png | Kort, tyk egestamme med mørkebrun furet bark, lyse årringe i snitfladen og ét egeblad |
| `ressourcer/pil` | P1 | ressourcer | 128×128 png | To slanke pilestammer på kryds med glat olivengrå bark, gullige snitflader og et langt smalt pileblad |
| `ressourcer/ask` | P2 | ressourcer | 128×128 png | Lige asketræsstamme med glat sølvgrå bark, næsten hvid snitflade og en lille klase vingede askefrø |
| `ressourcer/kobbermalm` | P1 | ressourcer | 128×128 png | Afrundet klump af varm brungrå sten med kobberorange krystaller og årer |
| `ressourcer/jernmalm` | P1 | ressourcer | 128×128 png | Kantet, blokagtig klump af blågrå sten med sølvgrå metalfacetter og få rustprikker |
| `ressourcer/kobberbarre` | P1 | ressourcer | 128×128 png | Én trapezformet kobberbarre med glatte, polerede kobberorange flader, set skråt fra siden |
| `ressourcer/jernbarre` | P1 | ressourcer | 128×128 png | Én trapezformet jernbarre i kølig blågrå med lys sølvgrå overside, set skråt |
| `ressourcer/rottehale` | P1 | ressourcer | 128×128 png | Én tyk rottehale i en blød J-bue, bundet med snor i den tykke ende |
| `ressourcer/laeder` | P1 | ressourcer | 128×128 png | Et sammenfoldet, kvadratisk stykke garvet brunt læder med et let opkrøllet hjørne og en række sting langs den ene kant |
| `ressourcer/ulveskind` | P1 | ressourcer | 128×128 png | Gråt ulveskind rullet til et tykt bundt og bundet med en læderrem, uden hoved og poter |

## Glyffer (28)

- Tegnes som SVG i kode, ikke med billedgeneratoren. Skabelon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><path fill="#FFFFFF" fill-rule="evenodd" d="…"/></svg>`.
- Kun hvid fill. Ingen stroke, opacity, mask, clipPath, gradienter, filtre, tekst eller billeder. Konturer konverteres til udfyldte paths, og udskæringer laves med evenodd eller boolske operationer.
- Fyldte glyffer ligger inden for feltet 10-118. Optisk størrelse: runde former Ø 104, kvadratiske 96×96, høje 80×108 og brede 108×80.
- Udskæringer og mellemrum er mindst 10 enheder. Ydre hjørner afrundes med r = 4, mens spidser (klinger, stjerne, torne, chevroner) er skarpe. Lodrette og vandrette kanter ligger på et gitter af 8 enheder.
- Tomme udrustningsslots og bygnings-socket er hule konturer med en streg på 8 enheder inden for feltet 16-112. De er undtaget fra minimum 10, fordi de kun vises i 24-32 px.
- Fælles former: samme hjerte i hp, helbredelse og nederlag, samme kranie i boss og drab, og samme sværd i atk og slot-vaaben. Faste valg for retning og placering står i noterne.
- Ingen bogstaver eller tegn: ingen spørgsmålstegn, udråbstegn, plus eller flueben.

| Id | Prio | Familie | Fil | Motiv |
|---|---|---|---|---|
| `glyffer/slot-vaaben` | P1 | glyffer | 128×128 svg, tonbar | Hul kontur af et opretstående sværd |
| `glyffer/slot-hoved` | P1 | glyffer | 128×128 svg, tonbar | Hul kontur af en åben hjelm med næseskinne, set forfra |
| `glyffer/slot-bryst` | P1 | glyffer | 128×128 svg, tonbar | Hul kontur af en brystplade set forfra |
| `glyffer/slot-ben` | P1 | glyffer | 128×128 svg, tonbar | Hul kontur af et par benskinner side om side |
| `glyffer/slot-foedder` | P1 | glyffer | 128×128 svg, tonbar | Hul kontur af en enkelt støvle set fra siden |
| `glyffer/socket-bygning` | P1 | glyffer | 128×128 svg, tonbar | Hul kontur af et lille hus med saddeltag |
| `glyffer/atk` | P1 | glyffer | 128×128 svg, tonbar | Et enkelt lige sværd, der peger skråt op mod højre, med enkel parérstang og rund knop |
| `glyffer/hp` | P1 | glyffer | 128×128 svg, tonbar | Et enkelt, symmetrisk hjerte |
| `glyffer/def` | P1 | glyffer | 128×128 svg, tonbar | Et klassisk skjold med let buet overkant, spids bund og en lodret midterkam |
| `glyffer/angrebstid` | P1 | glyffer | 128×128 svg, tonbar | Et timeglas med sand, der er ved at løbe ned |
| `glyffer/xp` | P1 | glyffer | 128×128 svg, tonbar | En femtakket stjerne med skarpe spidser |
| `glyffer/kamppoint` | P1 | glyffer | 128×128 svg, tonbar | En lodret, rhombeformet slebet ædelsten med facetlinjer |
| `glyffer/laas` | P1 | glyffer | 128×128 svg, tonbar | En lukket hængelås med rund bøjle og nøglehul |
| `glyffer/taage` | P1 | glyffer | 128×128 svg, tonbar | Tre vandrette, bølgede tågebanker stablet over hinanden |
| `glyffer/level` | P1 | glyffer | 128×128 svg, tonbar | Tre opadvendte chevroner stablet lodret med lige stor afstand |
| `glyffer/boss` | P1 | glyffer | 128×128 svg, tonbar | Et kranie set forfra med to korte buede horn |
| `glyffer/besejret` | P1 | glyffer | 128×128 svg, tonbar | En laurbærkrans af to buede grene med blade, der mødes forneden og er åben foroven |
| `glyffer/ny-opdagelse` | P1 | glyffer | 128×128 svg, tonbar | Én stor firtakket gnist med to små firtakkede gnister ved siden af |
| `glyffer/farmingomraade` | P1 | glyffer | 128×128 svg, tonbar | To buede pile, der jager hinanden og danner en lukket cirkel |
| `glyffer/dungeon` | P1 | glyffer | 128×128 svg, tonbar | En rundbuet stenport af kileformede sten med en mørk åben passage |
| `glyffer/kritisk-slag` | P1 | glyffer | 128×128 svg, tonbar | To parallelle diagonale hug, der spidser til i begge ender |
| `glyffer/drab` | P1 | glyffer | 128×128 svg, tonbar | Kranie set forfra uden horn |
| `glyffer/nederlag` | P1 | glyffer | 128×128 svg, tonbar | Et hjerte delt i to af en takket revne fra top til bund, halvdelene lidt adskilt |
| `glyffer/helbredelse` | P1 | glyffer | 128×128 svg, tonbar | Et hjerte med en opadvendt pil skåret ud i midten |
| `glyffer/varighed` | P1 | glyffer | 128×128 svg, tonbar | Et rundt stopur med knap foroven, fire korte streger og én viser |
| `glyffer/chance` | P1 | glyffer | 128×128 svg, tonbar | Én terningside set lige forfra med tre prikker på diagonalen |
| `glyffer/braendsel` | P1 | glyffer | 128×128 svg, tonbar | En enkelt flamme med tre tunger fra en rund bund |
| `glyffer/torne` | P2 | glyffer | 128×128 svg, tonbar | En kort, buet tornegren med fire skarpe torne |

## Portrætter (8)

- 512×512 PNG med transparent baggrund. Koden lægger baggrunde/portraet bag, så alle portrætter står ens side om side.
- Udsnittet står i prompten: bryst-op for spiller, goblin og ulv, overkrop for bossen og hel krop for rotte, barkbille, mosklump og egern. Alle fylder ca. 80% med øjnene ca. 40% fra toppen.
- Bryst-op og overkrop skæres af ved bundkanten (feltet kant_tilladt). De må ikke ende i en vandret afskæring over bunden. Hel krop holdes helt inde med luft under.
- Generér på flad neutral mellemgrå (#6B6B73), ikke indigo, så skyggerne ikke forsvinder med baggrunden. Friskær med en segmenteringsmodel (fx BiRefNet eller rembg) og ikke med farvenøgle. Fyld lukkede huller, så motivets indre er helt dækkende, og rens kantfarven.
- Spilleren ser mod højre, og monstrene ser mod venstre. Koden spejler efter behov, så intet må se forkert ud spejlet. Bossen ses forfra og spejles ikke.
- Den transparente version bruges også som silhuet i tågen, så omridset skal være genkendeligt.

| Id | Prio | Familie | Fil | Motiv |
|---|---|---|---|---|
| `portraetter/spiller` | P1 | portraetter | 512×512 png, bund må skæres af | Neutral hætteklædt eventyrer i enkel, varm brungrå rejsekappe med spids hætte, set i trekvart profil mod højre, uden synligt gear |
| `portraetter/rotte` | P1 | portraetter | 512×512 png | Stor, mager rotte, lavt sammenkrøbet med blottede fortænder og lang nøgen hale |
| `portraetter/goblin` | P1 | portraetter | 512×512 png, bund må skæres af | Senet goblin med olivengrøn hud, lange spidse ører, lappet læderjakke og en kort, hakket klinge |
| `portraetter/ulv` | P1 | portraetter | 512×512 png, bund må skæres af | Grå ulv med tyk sølvgrå vinterpels, snerrende med lange hjørnetænder |
| `portraetter/barkbille` | P1 | portraetter | 512×512 png | Stor bille med hvælvet skjold af revnet egebark, kraftige savtakkede kindbakker |
| `portraetter/mosklump` | P1 | portraetter | 512×512 png | Lav, rund klump af levende mos og fugtig jord med sten, blege svampe og rødder, to små dybtliggende øjne |
| `portraetter/rasende-egern` | P1 | portraetter | 512×512 png | Rødt egern i spændt angrebsstilling med strittende pels, højt rejst busket hale og blottede tænder |
| `portraetter/traeets-vogter` | P1 | portraetter | 512×512 png, bund må skæres af | Ældgammel, tårnhøj vogter af egebark med et ansigt i stammen, krone af knudrede grene og et hult bryst med mørkerødt lys |

## Emblemer (8)

- 256×256 PNG med transparent baggrund: en rund medaljon, der fylder 90%.
- Lav først én tom medaljon, og brug den som referencebillede, så alle emblemer får samme skive og kant.
- Generér i neutral sølvgrå, og farv bagefter med et gradient map i tre punkter: skygge = klyngefarven ved ca. 25% luminans, mellemtone = klyngefarven præcis, højlys = klyngefarven blandet 60% med hvid. Klyngefarverne står i tema.json.
- Påfør til sidst en matematisk cirkulær alfamaske (Ø 230 px, centreret, antialiaseret), så skiven er helt rund, og alt uden for den er 0.
- Ét enkelt motiv pr. emblem. Ingen indskrift, perler, bånd, kranse eller ekstra ringe på kanten.

| Id | Prio | Familie | Fil | Motiv |
|---|---|---|---|---|
| `emblemer/traefaeldning` | P1 | emblemer | 256×256 png | Rundt emblem med ét stort egeblad krydset af et økseskaft |
| `emblemer/minedrift` | P1 | emblemer | 256×256 png | Rundt emblem med en hakke over en klynge kantede krystaller |
| `emblemer/smedje` | P1 | emblemer | 256×256 png | Rundt emblem med en ambolt og en smedehammer |
| `emblemer/kamp` | P1 | emblemer | 256×256 png | Rundt emblem med to krydsede sværd, spidserne opad |
| `emblemer/hjemmebase` | P1 | emblemer | 256×256 png | Rundt emblem med et lille hus med skorsten og et oplyst vindue |
| `emblemer/den-hule-eg` | P1 | emblemer | 256×256 png | Rundt emblem med en gammel egestamme med en mørk hulning ved roden som en indgang |
| `emblemer/druide` | P2 | emblemer | 256×256 png | Rundt emblem med en halvmåne, der bærer en mistelten-kvist med små bær |
| `emblemer/skovbrug` | P2 | emblemer | 256×256 png | Rundt emblem med en ung spire med to blade, der skyder op fra et frø på en kort jordlinje |

## Baggrunde (5)

- Bruges kun via tema.json (rolle "tema"), så et andet tema kan have helt andre lag. Hver post har sin egen promptskabelon i feltet tillaeg.
- Stjernehimlen (2048) laves procedurelt med fast seed og stjerner, der fortsætter over kanterne. Den svage støvvariation må ikke danne pletter, der gentager sig synligt i en 3×3-prøve.
- Tonbare lag (taage, nebula og klyngesloer) er hvide med formen i alfa. Lav dem som lys på sort eller procedurelt (fBm-støj med wrap-around), og konvertér luminans til alfa. Tågen normaliseres til alfa 0,20-0,85.
- Sømløse fliser testes som 3×3. Tjekscriptet tjekker kun sømme i PNG; JPG skal ses i 3×3.
- Brug ikke pngquant på bløde gradienter, da det giver banding. Tilføj let dither.

| Id | Prio | Familie | Fil | Motiv |
|---|---|---|---|---|
| `baggrunde/stjernehimmel` | P1 | baggrunde | 2048×2048 jpg, opak, sømløs | Mørk midnatsindigo stjernehimmel med mange små stjerner i varierende styrke og svage støvvariationer, uden fokuspunkt |
| `baggrunde/taage` | P1 | baggrunde | 1024×1024 png, tonbar, sømløs | Drivende kosmisk tåge med varierende tæthed fra tykke banker til tynde slør |
| `baggrunde/nebula` | P2 | baggrunde | 1024×1024 png, tonbar, sømløs | Store, diffuse nebulaskyer med bløde former, der dækker cirka halvdelen af fladen |
| `baggrunde/klyngesloer` | P2 | baggrunde | 1024×1024 png, tonbar | Én blød, uregelmæssig sky, der er tættest i midten og fader helt ud før kanten |
| `baggrunde/portraet` | P1 | baggrunde | 512×512 jpg, opak | Rolig, mørk nattehimmel i midnatsindigo med kun få svage stjerner og mørke kanter |

## Silhuetter (4)

- 1024×1024 PNG, tonbar: hvid med formen i alfa. Lav dem som lys silhuet på sort, og konvertér luminans til alfa.
- Skalér alfa, så motivets kerne er 100% dækkende. Koden styrer selv, hvor svag silhuetten er.
- Gang alfa med en lineær rampe fra 1 ved 75% af højden til 0 ved bundkanten, og sæt alfa til 0 i en 16 px bred ramme hele vejen rundt.
- Ingen streger, omrids, oplyste vinduer, lyskilder, stjerner eller måne.

| Id | Prio | Familie | Fil | Motiv |
|---|---|---|---|---|
| `silhuetter/bjergtinde` | P2 | silhuetter | 1024×1024 png, tonbar | Fjern bjergkæde med sneklædte tinder og én dominerende top. |
| `silhuetter/ruin` | P2 | silhuetter | 1024×1024 png, tonbar | Fjerne oldtidsruiner: brudte stenbuer, smuldrende mure og en sammenstyrtet tårnstub. |
| `silhuetter/taarn` | P2 | silhuetter | 1024×1024 png, tonbar | Ensomt slankt stentårn med spir på en klippefremspring. |
| `silhuetter/den-hule-eg` | P2 | silhuetter | 1024×1024 png, tonbar | Fjern, kæmpemæssig gammel eg med delvis bladløs krone og en mørk hulning ved roden |
