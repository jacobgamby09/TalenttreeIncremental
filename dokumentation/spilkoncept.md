# Spilkoncept — TalenttreeIncremental

Dato: 16. oktober 2026. Arbejdsnavn taget fra projektmappen.

## Grundidé og tone

Et take på incremental talent trees: talenttræet er hele spillet og udgør selve spilverdenen. Spilleren bevæger sig gennem progressionen ved at åbne og bruge nodes. Ressourcer, opgraderinger, udstyr, fjender og bygninger har alle deres plads i samme store netværk.

Kortet forventes at blive meget stort. Indhold ligger i klynger med store overskrifter og lokale XP-bars, så spilleren kan finde rundt. Melvor Idle er brugerens reference for automatiske skills og begrænsningen til én aktivitet ad gangen.

Tone: Det oprindelige oplæg var et humoristisk take. Den 16. oktober 2026 besluttede brugeren at lægge det sarkastiske og humoristiske til side for nu. Nodes, navne og tekster skrives neutralt, og der er ingen joke-nodes. Humor kan tages op igen senere.

## Fastlagt retning fra brugeren

### Én aktivitet ad gangen

I starten kan spilleren kun udføre én aktivitet ad gangen. Woodcutting og mining sættes i gang og fortsætter automatisk. Muligheden for flere samtidige aktiviteter kan undersøges senere, men er ikke en del af den fastlagte startmodel.

Crafting er klik-for-at-crafte med en ressourcepris. Det er ikke afgjort af brugeren, om et craftingklik skal afbryde en aktiv skill; assistentens forslag er, at det ikke gør.

### Woodcutting og andre indsamlingsskills

En woodcutting-klynge indeholder forskellige træsorter. Oak er brugerens eksempel på den første. Når noden er aktiv, hugger man automatisk træ med en bestemt frekvens.

Rundt om en ressourcenode ligger tilstødende opgraderinger, eksempelvis mere wood/oak pr. tick eller 0,2 sekunder hurtigere chopping. En XP-bar på selve boardet viser progression for den specifikke skill. Ved et bestemt skill-level bliver næste træsort tilgængelig i forlængelse af den eksisterende.

Mining følger samme grundidé med automatiske aktiviteter og ressourcenodes. De præcise træsorter, malme, XP-kurver og hastigheder er ikke fastlagt.

### Crafting

Våben og armor har egne crafting-klynger. Hver genstand, man kan lave, er en node på boardet og koster ressourcer. Brugerens konkrete eksempel er en Copper Armor-node hos Blacksmith, hvor et klik koster 5 copper bars.

Gentagen crafting, inventory, smeltning og den fulde opskriftsliste er endnu ikke specificeret. Udstyrsslots er beskrevet under hjemmebasen. Skitsernes ekstra opskrifter og funktioner er illustrative.

### Combat direkte på kortet

Combat skal være simpelt, men tilfredsstillende.

- Spilleren kan klikke på en monsternode og se ATK, HP, DEF og Attack Speed.
- Ved kampstart dukker spillerens egen node op ved siden af fjendens node.
- Begge nodes er firkantede.
- Rammen fyldes gradvist op rundt langs kanten og viser tiden frem til næste angreb.
- Begge har en health bar under noden.

Combat har sin egen klynge, der kan vokse, når man overvinder fjender. En besejret fjende kan eksempelvis afsløre en eller to nye monsternodes.

Skadeformel, betydningen af DEF, healing, nederlag, flugt og præcis kamphastighed er åbne designspørgsmål.

Brugerens oprindelige tanke er, at kampen foregår ved monsternoden på kortet: spillerens node kommer ind ved siden af, og kampen forløber dér. Codex' mockups viser kampen midt på skærmen, hvilket ikke var brugerens forestilling. Brugeren peger på, at kortet bliver så stort, at man ofte vil være langt fra midten, og bad om assistentens anbefaling. Se "Combat ved noden med aktivitetsbjælke" under assistentens forslag.

### Visuel retning for prototypen

Brugeren har valgt stjernekortet (8) til prototypen. Prototypen skal også bruges til at beslutte den endelige designretning, så det grafiske udtryk skal være så nemt som muligt at skifte. Codex leverer de assets, der er brug for.

### Gradvis afsløring og overraskelser

Kortet skal bruge en blanding af gradvis vækst og synlige antydninger. Nogle steder skal spilleren kunne se, at der gemmer sig nodes bag en lås eller et uudforsket område. Andre milepæle skal udløse egentlige overraskelser: en helt ny klynge springer frem et sted, hvor spilleren ikke havde forventet noget.

Den ønskede oplevelse er både at kunne arbejde hen imod kendte mål og at opdage, at spillet er større, end man troede. Hele træet skal derfor ikke afsløres på forhånd.

## Brugerens mulige udvidelser

Disse muligheder er foreslået af brugeren, men omfang og implementering er ikke endeligt besluttet.

### Tre anvendelser af combat

| Mulighed | Beskrivelse | Formål |
| --- | --- | --- |
| Farmingområde | En enkelt combat-node erstatter automatisk en besejret fjende med en ny | Uendelig farming af XP eller ressourcer |
| Dungeon-klynge | En linje af forskellige mobs, en efter en, med en boss til sidst | En sammenhængende række kampe |
| Boss som adgangskrav | En boss blokerer en del af talenttræet | Sejr åbner nye skills eller højere tiers |

En større boss kan eksempelvis åbne tre nye skills. En boss kan også stå inde i en eksisterende skill: woodcutting tier 5 kan kræve sejr over en Wood Guardian. De konkrete antal og tiers er eksempler.

### Hjemmebase

Et sted i talenttræet ligger spillerens homebase. Den kan bestå af tomme node-slots, hvor man bygger og indsætter ting, som giver forskellige bonusser. Senere kan basen muligvis udvides med flere slots.

Bygningstyper, priser, bonusser og muligheden for at flytte eller udskifte bygninger er ikke besluttet.

Brugeren foreslår også, at udrustningen ligger i hjemmebasen som nodes i træet, i tråd med at alt er i træet: et våbenslot og til en start fire rustningsslots til bryst, hoved, ben og støvler.

### Combat-XP

Combat skal give XP, som giver stat-opgraderinger og senere andre fordele. Brugeren spurgte samtidig, om der overhovedet er brug for guld.

## Forslag fra assistenten — ikke vedtaget som krav

### Sammenhæng mellem klyngerne

Lad ressourcer og belønninger skabe grunde til at besøge flere klynger. En lille mulig kreds er:

Oak → våben → monster → bygning → bedre woodcutting.

Denne kreds blev foreslået som første afprøvning af, om spillets grundidé er tilfredsstillende. Der er ikke bestilt eller bygget en prototype endnu.

### Tre grader af synlighed

1. Synlige mål: næste træsort og dens krav kan ses på forhånd.
2. Antydninger: en forbindelse løber ud i tågen, eller utydelige nodes anes bag en vogter.
3. Ægte overraskelser: en ny forbindelse vokser ud fra en velkendt node og afslører en uventet klynge.

Assistentens eksempel: Wood Guardian besejres, rødder vokser nedad, og en ny svampedyrknings-klynge dukker op under skoven. Svampedyrkning er et eksempel, ikke en vedtaget skill.

### Præsentation af opdagelser

En forbindelse kan tegnes ud først, derefter foldes nodes frem, og til sidst vises klyngens navn og XP-bar. Små hemmeligheder, enkelte minibosser og større skill-afsløringer kan blandes, så ikke enhver opdagelse lover en hel ny del af spillet.

### Combat-feedback

Små slagryk, tydelige skadetal og health bars, som reagerer på træffet, kan give kampene vægt uden mange ekstra mekanikker. Crafting blev foreslået som en øjeblikkelig handling, der ikke stopper den aktive aktivitet.

### Bosskrav og balance

Vis både levelkrav og bosskrav på forhånd. Brug bossblokeringer ved udvalgte større milepæle, så en indsamlingsskill stadig har sin egen rytme. Spilleren bør kunne skaffe det nødvendige udstyr fra de allerede åbne områder; flere mulige forberedelser kan gøre progressionen mindre ensrettet.

Et tidligere eksempel var: woodcutting level 20 → næste træsort bliver synlig → Wood Guardian blokerer forbindelsen → sejr åbner træsort og opgraderinger. Level 20 er kun et illustrativt tal.

### Humor (lagt til side)

Assistenten foreslog tidligere, at navne, animationer og opgraderinger kunne levere humoren. Brugeren har valgt at lægge humoren til side for nu, så de forslag bruges ikke.

### Ingen guld i prototypen

Guld havde kun få anvendelser i det første nodeforslag. Assistentens forslag er at fjerne guld: combat giver XP, ét kamppoint pr. kamp-level til stat-nodes og materialer som rottehale, læder og ulveskind, der bruges i opskrifter. Guld kan komme tilbage, hvis spillet senere får butik eller handel.

### Prototypen i en af de otte stilarter

Brugeren spurgte, om prototypen kan bygges i en af konceptbillederne. Assistentens vurdering: rammerne laves i kode i alle stilarter, dvs. nodes, forbindelser, overskrifter, XP-bars, tåge og angrebsindikatoren langs den firkantede kant. Illustrationerne kræver billedfiler. Stjernekort (8) og neon (5) kan næsten laves rent i kode med enkle ikoner. De malede stilarter (2, 3, 4, 6 og 7) kræver et sammenhængende sæt genererede ikoner, portrætter og baggrunde. Assistentens anbefaling til prototypen var stjernekortet, og brugeren har valgt det.

### Udskifteligt tema

For at gøre det grafiske udtryk let at skifte foreslår assistenten, at grafikken holdes adskilt fra spilkoden. Farver, skrifttyper, rammer, linjer og glød er tokens i et tema. Alle billeder hentes gennem en asset-liste, hvor hver node, hvert monster og hver klynge peger på et asset-id i stedet for en filsti. Et nyt udtryk er dermed en ny temamappe med tokens og billedfiler, som Codex kan levere, uden at spilkoden ændres.

### Asset-kontrakt til Codex

Brugeren bad om asset-listen, før prototypen bygges, så Codex kan arbejde parallelt. Listen er lavet af assistenten og gennemgået for fuldstændighed, Codex-brugbarhed og teknik. Den ligger i [asset-liste.md](asset-liste.md) og er genereret fra [asset-manifest.json](../temaer/asset-manifest.json) og [tema.json](../temaer/stjernekort/tema.json).

- Manifestet er kontrakten: spilkoden henviser kun til id'er som `noder/eg`, og et tema leverer filerne i `temaer/<tema>/<id>.<format>`.
- 106 filer: 43 node-ikoner, 10 ressourcer, 28 glyffer, 8 portrætter, 8 emblemer, 5 baggrunde og 4 landmærke-silhuetter. P1 er alt på vejen frem til bossen, og P2 er det, der først vises efter bossen eller en skjult trigger, samt stemningslag.
- Glyffer tegnes som hvide SVG'er, så koden kan farve dem.
- Portrætterne er transparente, og koden lægger en fælles baggrund bag dem. Den transparente form giver også monstrenes silhuetter i tågen.
- Effekter, pilen i skærmkanten og nære stjerner laves i kode og er ikke med i listen.
- Mangler en fil, viser spillet en pladsholder tegnet i kode, så leveringsrækkefølgen aldrig blokerer prototypen.
- `node tools/tjek-assets.mjs` tjekker en leverance mod manifestet.

Prøvebatch 01 (8 filer) blev leveret den 16. oktober 2026. Assistentens vurdering: stilen rammer stjernekortet, og filerne er rent friskåret. Rettelser før resten: egen og kobberbrystpladen skal fylde mere af lærredet, de to buster skal skæres af ved bundkanten, træfældningsemblemet laves om med ét blad og gradient map, låsens hjørner skal følge glyf-reglen, og stjernehimlens støvpletter må ikke gentage sig synligt. Brugeren sendte godkendelsen med rettelserne videre til Codex og beholdt spillerportrættet.

Runde 02 blev leveret samme dag: rettelserne, familierne traeer, traefaeldning-modifiers, malme, minedrift-modifiers og ovne, portrætbaggrunden og alle 28 glyffer (52 af 106 godkendt af tjekket). Assistentens vurdering: træer, modifiers, ovne, emblem og de fleste glyffer er gode. Til runde 03 skal portrætterne skaleres op i noden, malmene laves som klipper på en base, Dyb åre gøres tydeligere, og seks glyffer rettes (atk, slot-vaaben, slot-bryst, slot-ben, dungeon og boss).

Runde 03 (gear, ressourcer og monsterportrætter) og runde 04 (stat-nodes, bygninger, emblemer, Druide, Skovbrug, tåge, nebula, klyngeslør og landmærker) blev leveret samme dag. Stjernekortet er dermed komplet med 106 af 106 filer godkendt af tjekket. Prototypen bruger nu alle lag, inklusive nebula og tågetekstur. Tågen og landmærkerne er dæmpet efter en visuel gennemgang (silhuetternes opacitet i tema.json er sat fra 0,25 til 0,16).

### Combat ved noden med aktivitetsbjælke

Assistenten anbefaler brugerens oprindelige tanke: kampen foregår ved monsternoden på kortet, ikke i et fast panel midt på skærmen. Codex' mockups viser et lille kort, hvor midten tilfældigvis er tæt på kampen. På et stort kort vil et fast panel enten dække kortet eller ligge langt fra monsteret.

Begrundelser:

- Det holder fast i, at alt er i træet.
- I en dungeon kan spillerens node bevæge sig langs grenen fra monster til monster.
- Når en boss besejres, er kameraet allerede ved bossen, så afsløringen af en ny klynge kan starte derfra.

Tilføjelser:

1. Når en kamp starter, flyver kameraet hen til monsternoden. Spillerens node glider ind på en reserveret plads ved siden af monsteret. Hver monsternode har en sådan plads i kortets layout, så intet overlapper.
2. Når den aktive node er uden for skærmen eller er zoomet så langt ud, at den ikke kan aflæses, vises en lille aktivitetsbjælke i kanten af skærmen. Den viser miniudgaver af begge nodes med angrebsindikator og health bars, og en pil i skærmkanten peger mod kampen. Et klik flyver kameraet tilbage.

Aktivitetsbjælken er ikke kun til combat. Fordi spilleren kun har én aktivitet ad gangen, viser den samme bjælke også fremdriften i woodcutting, mining og smeltning.

### Nodeliste til første prototype

Et konkret forslag til prototypens nodes med krav, priser og effekter ligger i [prototype-noder.md](prototype-noder.md). Det er ikke vedtaget, og tallene er første udkast.

## Opmærksomhedspunkter fra diskussionen

- Træformen alene gør ikke spillet sjovt; spilleren skal have meningsfulde valg mellem forbedring, udforskning, udstyr og baseinvesteringer.
- Et stort kort skal være let at aflæse gennem klynger, overskrifter og lokale XP-bars.
- En blanding af kendte mål og ukendte muligheder skal bevare både retning og nysgerrighed.
- En aktivitet ad gangen skaber prioritering; flere samtidige aktiviteter vil ændre spillets karakter og skal vurderes senere.

## De otte visuelle retninger

1. Nordisk minimalisme: lyse flader, rolige farver og enkelt overblik.
2. Mørk fantasy: ornamenterede rammer, mystik og dramatiske bosser.
3. Hyggelig pixelkunst: retrocharme og små detaljerede miljøer.
4. Håndtegnet eventyrkort: pergament, akvarel og blyantsskitser af skjulte grene.
5. Neon og hologrammer: lysende forbindelser og stærke farvekoder.
6. Papirklip og brætspil: fysiske brikker, bløde farver og tomme byggeslots.
7. Tegneserie og kaos: tykke streger, udtryksfulde monstre og humor.
8. Kosmisk stjernekort: skill-klynger som stjernebilleder i en stor verden.

Assistentens subjektive favoritter var 3, 4 og 7. Brugeren har valgt stjernekortet (8) til prototypen, men den endelige stil afgøres gennem prototypen. Alle billeder er genereret med det indbyggede imagegen-værktøj, og de anvendte prompts er bevaret.

Vigtig forskel mellem billeder og idé: flere billeder viser en rund eller buet angrebsindikator. Brugerens krav er en indikator, der følger den firkantede nodes kant. Illustrationerne er stemnings- og stilskitser, ikke færdige UI-specifikationer. Leveltal på enkelte nodes, ekstra XP-bars, ressourceikoner og opgraderingsnavne i billederne skal heller ikke opfattes som vedtagne regler.

## Næste beslutninger, når arbejdet fortsætter

Den første prototype er bygget 16. oktober 2026 i `prototype/` som ren JavaScript med et SVG-kort, uden byggetrin. Den dækker alle 58 nodes fra nodelisten: én aktivitet ad gangen, crafting med klik, modifiers med ranks, udrustning og sockets i hjemmebasen, kamppoint, combat ved noden med aktivitetsbjælke og pil i skærmkanten, farmingområder, dungeonen med boss, synlighed med tåge og afsløring af Druide og Skovbrug. Den endelige grafiske retning, platform og motor er ikke valgt. Balanceringen er ikke afprøvet med rigtige spillere; i en automatisk test nåede træfældning lvl 10 på 5 minutter, hvilket er hurtigere end planlagt. Mulige næste emner er omfanget af en første spilbar kreds, den præcise håndtering af aktivitetsskift og crafting samt simple regler for kamp og nederlag. Denne liste er en opsamling af åbne emner, ikke en bestilling på at implementere dem.
