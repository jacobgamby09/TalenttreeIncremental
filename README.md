# TalenttreeIncremental

Et incremental RPG, hvor talenttræet er hele spilverdenen. Skills, crafting, kamp, dungeons og en hjemmebase ligger som forbundne klynger af nodes på et stort kort, der vokser frem, efterhånden som man spiller.

Hvor langt projektet er nået, står i [PROGRESS.md](PROGRESS.md). AI-agenter (Codex, Claude og andre) følger [AGENTS.md](AGENTS.md), og Claude Code læser desuden [CLAUDE.md](CLAUDE.md).

## Kom i gang

Kræver Node.js 22 eller nyere. Der skal ikke installeres noget.

```bash
npm start
```

Åbn derefter http://localhost:5173/prototype/. Vil du se hele kortet, så åbn http://localhost:5173/prototype/?load=alt. Det er et demo-spil, hvor alle klynger er åbne, og det gemmes for sig selv, så dit normale spil ikke røres.

Spillet gemmes i browseren. Knappen Udvikler giver højere spilfart, ressourcer og levels til afprøvning samt nulstilling.

## Kommandoer

| Kommando | Gør |
|---|---|
| `npm start` | Starter prototypen på http://localhost:5173/prototype/ |
| `npm test` | Kører testene af spilmotoren |
| `npm run tjek:assets` | Tjekker temaets billedfiler mod manifestet |
| `npm run asset-liste` | Genererer asset-listen igen ud fra manifestet |
| `npm run tjek` | Kører både tests og asset-tjek |

## Dokumenter

- [Spilkoncept og beslutninger](dokumentation/spilkoncept.md): skelner mellem brugerens beslutninger, brugerens mulige udvidelser og agenternes forslag
- [Nodeliste](dokumentation/prototype-noder.md): alle prototypens nodes med krav, priser og effekter
- [Idéhistorik](dokumentation/idehistorik.md): brugerens kreative beskeder, ordret
- [Asset-liste](dokumentation/asset-liste.md): genereret fra [asset-manifest.json](temaer/asset-manifest.json) og [stjernekortets tema.json](temaer/stjernekort/tema.json)
- [De otte første stilskitser](konceptbilleder/OVERSIGT.md) og [deres prompts](konceptbilleder/billedprompts.md)

## Mapper

| Mappe | Indhold |
|---|---|
| `prototype/` | Den spilbare prototype i ren JavaScript uden byggetrin |
| `temaer/` | Asset-manifestet og én mappe pr. tema. Stjernekortet er komplet |
| `tools/` | Server, asset-tjek og generator af asset-listen |
| `tests/` | Automatiske tests af spilmotoren |
| `dokumentation/` | Koncept, nodeliste, idéhistorik og asset-liste |
| `kilder/` | Codex' leverancer pr. runde: originaler, prompts, scripts og kontaktark |
| `grafik/` | Grafiske udforskninger: prøvebatch 01, stilprøver og pixel-moodboards |
| `konceptbilleder/` | De otte første stilskitser |
