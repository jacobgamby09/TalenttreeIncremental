# Runde 03 — klar til gennemgang

16. oktober 2026. 24 nye assets og 11 rettelser er leveret i `temaer/stjernekort/`. Temaet har nu 76 af 106 filer. Runden stopper her.

## Nye assets

- Kobbergear: sværd, hjelm, benskinner og støvler. Den godkendte brystplade er med på kontaktarket.
- Jerngear: alle fem dele.
- Ressourcer: de ni resterende, inklusive ask som bestilt. Kobberbarren er bevaret som reference for jernbarrens form.
- Portrætter: rotte, goblin, barkbille, mosklump, rasende egern og Træets vogter.

## Rettelser

- Spillerens eksisterende ansigt er bevaret. Hætten starter 12,9% fra toppen, og øjnene ligger visuelt omkring 40%. Kappen skæres af ved bundkanten.
- Ulven er omkomponeret med samme udtryk og pels. Ørerne starter 7,8% fra toppen (ca. 8%), øjnene omkring 40%, og brystet fortsætter til bundkanten. Ingen synlige pixels berører sidekanterne.
- Kobbermalm er et lavt, bredt klippefremspring på jordbund. Jernmalm er højere, kantet og køligt blågrå med sølvårer. Dyb åre har en åben kløft med tydelige sølvårer ned ad væggene.
- De seks bestilte glyffer er tegnet om. ATK og våbenslot bruger samme sværdform. ATK fylder feltet 10–118 diagonalt; slots holder sig inden for 16–112. Brystpladen har midterkam og skulderplader, benskinnerne har separate knæplader, stenporten har kilesnit og slutsten, og bosskraniet har opadbuede horn.

## Kontrol og kendte advarsler

`node tools/tjek-assets.mjs` er kørt på den endelige levering. Det rapporterer **76 af 106 leveret og godkendt, ingen fejl**. Den fulde udskrift er gemt i `asset-tjek.txt`. Exitkode 1 skyldes de resterende 17 P1-filer uden for denne runde. Der mangler desuden 13 P2-filer.

Fire buster giver stadig den generelle advarsel om fyldgrad: spiller 93%, goblin 89%, ulv 97% og vogter 92%. Den længste side er her skuldrenes bredde; den tættere beskæring følger den nye komposition med hovedet højere og busten ved bunden. Alle fire består den nye kontrol af topplacering, alle skæres ved bunden, og ingen rammer siderne. Toppen er 14,1% for goblin og vogter. Tjekscriptet og manifestets generelle mål på 80% er ikke ændret.

Den eksisterende JPG-advarsel om stjernehimlens manuelle sømtjek er fortsat med. Stjernehimlen er uændret i denne runde og blev visuelt godkendt i runde 02.

Bossens PNG er optimeret tabsfrit til 455.554 bytes (ca. 445 KiB), under grænsen på 450 KiB. RGBA-pixels er verificeret identiske før og efter komprimering.

Kontaktarkene er gennemset i farve og gråtoner. Gear vises også i 24 px, ressourcer i 16 og 32 px, glyffer i 14–32 px og portrætter i 64 og 128 px. Portrætterne er lagt på `baggrunde/portraet` i alle visninger.

## Filer til gennemgang

- [Samlet oversigt](<C:/Users/JacobGamby/OneDrive - Plutonic Media/Documents/TalenttreeIncremental/kilder/stjernekort/runde-03/oversigt.png>)
- [Kobbergear](<C:/Users/JacobGamby/OneDrive - Plutonic Media/Documents/TalenttreeIncremental/kilder/stjernekort/kontaktark/kobbergear.png>) · [Jerngear](<C:/Users/JacobGamby/OneDrive - Plutonic Media/Documents/TalenttreeIncremental/kilder/stjernekort/kontaktark/jerngear.png>) · [Parvis sammenligning](<C:/Users/JacobGamby/OneDrive - Plutonic Media/Documents/TalenttreeIncremental/kilder/stjernekort/kontaktark/gear-par.png>)
- [Ressourcer](<C:/Users/JacobGamby/OneDrive - Plutonic Media/Documents/TalenttreeIncremental/kilder/stjernekort/kontaktark/ressourcer.png>) · [Portrætter på baggrunden](<C:/Users/JacobGamby/OneDrive - Plutonic Media/Documents/TalenttreeIncremental/kilder/stjernekort/kontaktark/portraetter.png>)
- [Malme](<C:/Users/JacobGamby/OneDrive - Plutonic Media/Documents/TalenttreeIncremental/kilder/stjernekort/kontaktark/malme.png>) · [Minedrift-modifiers](<C:/Users/JacobGamby/OneDrive - Plutonic Media/Documents/TalenttreeIncremental/kilder/stjernekort/kontaktark/minedrift-modifiers.png>) · [Glyffer](<C:/Users/JacobGamby/OneDrive - Plutonic Media/Documents/TalenttreeIncremental/kilder/stjernekort/kontaktark/glyffer.png>)
- [Tjekudskrift](<C:/Users/JacobGamby/OneDrive - Plutonic Media/Documents/TalenttreeIncremental/kilder/stjernekort/runde-03/asset-tjek.txt>) · [Målinger og filhashes](<C:/Users/JacobGamby/OneDrive - Plutonic Media/Documents/TalenttreeIncremental/kilder/stjernekort/runde-03/kvalitetsrapport.json>)

## Kilder og metode

Malede assets er lavet med den indbyggede **image_gen**, ét kald pr. motiv eller rettelse. De endelige [prompter](<C:/Users/JacobGamby/OneDrive - Plutonic Media/Documents/TalenttreeIncremental/kilder/stjernekort/runde-03/prompts.json>) er gemt pr. id. Genereringshistorikken findes i `kilder.json`, `ekstra-kilder.json`, `portraet-rettelser.json` og `portraet-slutrettelser.json`; senere poster erstatter tidligere poster med samme id.

Originalerne er normaliseret til 1024×1024 i `kilder/stjernekort/originaler/`. Nye portrætter og den omkomponerede ulv er genereret på mellemgrå og friskåret med rembg/BiRefNet-general-lite. Segmentering skaber masken; kantfarver renses med nærmeste dækkende motivpixel. Mørke indre områder bevares, mens reelle mellemrum mellem grene er transparente. Spillerens godkendte friskæring er genbrugt.

Eksporten renser svag alfa, bruger præmultipliceret nedskalering og otte pixels alpha bleed. Filerne er 8-bit RGBA PNG. Glyfferne er hvide SVG-paths med evenodd. Tidligere versioner af de rettede temafiler ligger i `foer-rettelser/`.

Genopbygning fra projektroden, med Python-afhængighederne i `requirements.txt`: kør rundens `eksporter.py`, `glyf-rettelser.py`, `optimer-png.py`, `kontaktark.py`, `gear-par.py` og til sidst `aflever.py`. De gemte råkilder skal være tilgængelige ved ny eksport; den leverede temamappe er selvstændig og kræver ingen af værktøjerne under spillet.

Resterende P1 til næste runde: fem stat-nodes, seks bygninger, fem emblemer og tågen. Runde 04 er ikke startet.
