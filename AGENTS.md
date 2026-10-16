# AGENTS.md

Instruktioner til AI-agenter (Codex, Claude og andre), der arbejder i projektet. Mennesker starter i [README.md](README.md).

## Projektet

TalenttreeIncremental er et incremental RPG, hvor talenttræet er hele spilverdenen: skills, crafting, kamp, dungeons og en hjemmebase ligger som klynger af nodes på et stort kort, der vokser frem. Der findes en spilbar prototype og et komplet tema (stjernekortet). Den aktuelle status står i [PROGRESS.md](PROGRESS.md).

## Sådan arbejder du

1. Læs [PROGRESS.md](PROGRESS.md): status, hvad der er i gang, og hvad der er det næste.
2. Læs de dokumenter, opgaven berører (se kilderne til sandhed nedenfor).
3. Lav opgaven. Ændr kun det, opgaven kræver.
4. Kør de relevante tjek (se Definition af færdig).
5. Opdater [PROGRESS.md](PROGRESS.md) og de dokumenter, ændringen påvirker.

## Mappestruktur

```
AGENTS.md, CLAUDE.md      Instruktioner til agenter
PROGRESS.md               Fremdrift og log, opdateres efter hver leverance
README.md                 Overblik for mennesker
package.json              Kommandoer (ingen afhængigheder)
dokumentation/            Spilkoncept, nodeliste, idéhistorik og den genererede asset-liste
prototype/                Den spilbare prototype (index.html, css/, js/)
temaer/                   Asset-manifest og én mappe pr. tema (stjernekort/)
tools/                    Server, asset-tjek og generator af asset-listen
tests/                    Automatiske tests af spilmotoren
kilder/<tema>/            Codex' leverancer pr. runde: originaler, prompts, scripts, kontaktark
grafik/                   Grafiske udforskninger: prøvebatch 01, stilprøver og moodboards
konceptbilleder/          De otte første stilskitser og deres prompts
.claude/launch.json       Startkonfiguration til Claude Codes preview
```

Prøvebatchen (runde 01) ligger i `grafik/proevebatch-01/` og ikke i `kilder/stjernekort/`, fordi scripts i senere runder henviser dertil. Flyt den ikke.

## Kommandoer

Kræver Node.js 22 eller nyere. Der skal ikke installeres noget.

| Kommando | Gør |
|---|---|
| `npm start` | Starter serveren. Prototypen kører på http://localhost:5173/prototype/ |
| `npm test` | Kører testene af spilmotoren |
| `npm run simuler` | Lader en bot spille prototypen 20 gange og skriver milepælstider til `dokumentation/balancering.md` |
| `npm run tjek:assets` | Tjekker temaets filer mod manifestet (standard: `temaer/stjernekort`) |
| `npm run asset-liste` | Genererer `dokumentation/asset-liste.md` ud fra manifestet og tema.json |
| `npm run tjek` | Kører både tests og asset-tjek |

I prototypen viser `?load=alt` et demo-spil, hvor hele kortet er synligt, og `?tema=<navn>` vælger et andet tema. Knappen Udvikler giver spilfart, ressourcer, levels og nulstilling.

## Kilder til sandhed

| Emne | Sandheden | Hold i takt med |
|---|---|---|
| Spildata (nodes, tal, krav) | `prototype/js/data.js` | `dokumentation/prototype-noder.md`, `dokumentation/balancering.md` (genereres med `npm run simuler`) |
| Spilregler | `prototype/js/spil.js` | `dokumentation/spilkoncept.md`, `tests/` |
| Spillets tekster | `prototype/js/tekster.js` | |
| Hvilke billedfiler findes | `temaer/asset-manifest.json` | `dokumentation/asset-liste.md` (genereres, ret den aldrig i hånden) |
| Et temas farver, lag og prompts | `temaer/<tema>/tema.json` | |
| Beslutninger og forslag | `dokumentation/spilkoncept.md` | |
| Brugerens egne ord | `dokumentation/idehistorik.md` | |

`spilkoncept.md` skelner mellem brugerens beslutninger, brugerens mulige udvidelser og agenternes forslag. Skriv aldrig et forslag som en beslutning. `idehistorik.md` gemmer brugerens kreative beskeder ordret.

## Faste beslutninger

Ændr dem ikke uden brugerens accept:

- Talenttræet er hele verdenen. Spilleren har én aktivitet ad gangen. Crafting er et klik og afbryder ikke aktiviteten.
- Kampen foregår ved monsternoden. Noderne er firkantede, angrebsindikatoren følger den firkantede kant, og HP-baren sidder under noden. Er noden uden for skærmen, vises en aktivitetsbjælke og en pil i skærmkanten.
- Synlighed: nodes ét skridt fra en åben node er synlige, to skridt væk er de tåge, og skjulte klynger afsløres med en animation.
- Ingen humor eller sarkasme i spillets indhold for nu.
- Dokumenter og spiltekster er på dansk.
- Grafik hentes kun via asset-id'er fra manifestet, så et tema kan skiftes ved at udskifte mappen.
- Prototypen er ren JavaScript med ES-moduler: ingen byggetrin og ingen npm-afhængigheder uden aftale.

## Roller

- **Codex** laver billedfiler og grafiske udforskninger. Temaets filer leveres i runder til `temaer/<tema>/`, og hver runde dokumenteres i `kilder/<tema>/runde-NN/LEVERANCE.md`. Udforskninger ligger i `grafik/`. Stop efter hver runde, så brugeren kan godkende.
- **Claude** laver prototypens kode, værktøjer, tests og dokumentation og vurderer Codex' leverancer.
- **Begge** opdaterer PROGRESS.md. Ændrer du noget i den andens leverance, så skriv det i loggen.

## Assets

- Et id er stien uden filendelse, fx `noder/eg`. Filen ligger i `temaer/<tema>/<id>.<format>`. Id'er bruger små bogstaver, tal og bindestreg, og æ, ø og å skrives ae, oe og aa.
- Krav til størrelse, format, transparens og fyldgrad står i manifestet. Kør `npm run tjek:assets`, før du afleverer. Der må ikke være fejl.
- Originaler, prompts, efterbehandlingsscripts og kontaktark hører til i `kilder/<tema>/runde-NN/` eller i udforskningens mappe under `grafik/`, aldrig i temamappen.
- Ændrer du manifestet, så kør `npm run asset-liste` bagefter. Et nyt asset skal også bruges i `data.js` eller `tema.json`.

## Kodekonventioner

- ES-moduler, 2 mellemrum, ingen semikolon og enkelte anførselstegn. Navne er på dansk som i resten af koden.
- Få kommentarer, på dansk, og kun hvor koden ikke forklarer sig selv.
- Ansvarsfordeling: data i `data.js`, regler i `spil.js`, kortet i `kort.js`, HUD i `ui.js`, tema og assets i `tema.js`, tekster i `tekster.js`, opstart i `main.js`.
- Ny eller ændret spilmekanik skal have en test i `tests/`.

## Definition af færdig

- `npm test` består.
- Er balancetal i `data.js` ændret, er `npm run simuler` kørt, og alle milepæle ligger inden for målene.
- `npm run tjek:assets` giver ingen fejl. Den kendte advarsel om manuelt sømtjek af stjernehimlens JPG er i orden.
- Prototypen starter uden fejl i konsollen, bortset fra en manglende favicon.
- Berørte dokumenter er opdateret, og PROGRESS.md har en ny post i loggen.

## PROGRESS.md

- Skriv en ny post øverst i Log: `### ÅÅÅÅ-MM-DD · Agent · Titel` med 1-3 punkter om, hvad der er lavet, hvor det ligger, og hvad der ikke er afprøvet.
- Opdater statustabellen, flyt punkter mellem "I gang" og "Næste skridt", og ret "Kendte problemer" og "Åbne spørgsmål".
- Skriv kun det, der er sket. Marker antagelser og det, der ikke er afprøvet.
- Hold filen kort. Poster fra samme dag må gerne samles.

## Git

- Repoet er https://github.com/jacobgamby09/TalenttreeIncremental, og hovedgrenen hedder `main`.
- Commit og push kun, når brugeren beder om det, eller når opgaven udtrykkeligt omfatter det.
- Små commits med en kort besked på dansk i bydeform, der siger hvad og gerne hvorfor, fx "Tilføj demo-load med hele kortet".
- Commit ikke midt i en anden agents igangværende leverance (se "I gang" i PROGRESS.md).
- Force-push aldrig til `main`, og omskriv ikke historikken.
- Alle filer er i dag under 20 MB. Brug Git LFS, hvis en fil nærmer sig 50 MB.

## Forsigtighed

- Slet og overskriv ikke andres leverancer, originaler eller brugerens gemte spil.
- Spørg brugeren før store ændringer: flytning af mapper, nye afhængigheder, ny motor eller ændring af en fast beslutning.
