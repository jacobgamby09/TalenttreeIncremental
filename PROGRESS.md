# PROGRESS.md

Fremdriften i projektet. Opdateres af alle agenter efter hver leverance; reglerne står i [AGENTS.md](AGENTS.md#progressmd).

Senest opdateret: 2026-10-16

## Status

| Område | Status | Hvor |
|---|---|---|
| Spilkoncept | Klar, version 1. Humor er lagt til side for nu | [spilkoncept.md](dokumentation/spilkoncept.md) |
| Nodeliste | 58 nodes i seks klynger plus to skjulte. Første udkast til tal | [prototype-noder.md](dokumentation/prototype-noder.md) |
| Asset-kontrakt | 106 assets i manifestet, med tjek og genereret liste | [asset-manifest.json](temaer/asset-manifest.json), [asset-liste.md](dokumentation/asset-liste.md) |
| Tema: stjernekort | Komplet: 106 af 106 godkendt af tjekket | [temaer/stjernekort](temaer/stjernekort), [kilder/stjernekort](kilder/stjernekort) |
| Prototype | Spilbar med alle 58 nodes og alle lag. Ikke balanceret | [prototype/](prototype/) |
| Tests | 13 tests af spilmotoren, alle består | [tests/](tests/) |
| Grafisk retning | Ikke valgt. Stjernekortet er det fulde tema; tegneserie og pixel udforskes | [grafik/](grafik/) |

## I gang

- **Pixel-moodboards (Codex):** otte pixelstilarter efter [BESTILLING.md](grafik/pixel-moodboards/BESTILLING.md). Mapperne findes, men `LEVERANCE.md` mangler endnu, så leverancen er ikke færdig. Rør ikke `grafik/pixel-moodboards/`, før den er afleveret.

## Næste skridt

1. Vurdér pixel-moodboards, når de er leveret, og sammenlign med stjernekortet og tegneseriestilen.
2. Brugeren spiller prototypen igennem og vælger grafisk retning.
3. Balancering: i en automatisk test nåede træfældning lvl 10 på fem minutter, hurtigere end de planlagte 30-45 minutter frem til bossen.
4. Tågens langsomme bevægelse med to kopier i forskellig skala, som tema.json lægger op til.
5. Versionsstyring med git, så ændringer kan følges og rulles tilbage. Brugeren har valgt at vente med det.
6. Bevidst udeladt indtil videre: offline progress, mad og cooking, flere gear-tiers, prestige og lyd.

## Åbne spørgsmål til brugeren

- Hvilken grafisk retning skal spillet have? Stjernekort, tegneserie eller en pixelstil?
- Tegneseriens leverance taler om "den valgte tegneseriestil". Er tegneserie besluttet, eller er det stadig en prøve?
- Er det ok, at gear craftes én gang og vælges i sit slot uden et egentligt inventory? Prototypen gør det sådan nu.
- Skal spillets tekster være på dansk eller engelsk? Prototypen er på dansk nu.

## Kendte problemer

- Konsollen viser 404 for `favicon.ico`.
- Stjernehimlen er en JPG, så sømmen tjekkes ikke automatisk. Den er godkendt visuelt i en 3×3-prøve.
- Balanceringen er ikke afprøvet med rigtige spillere.
- Prototypen er kun afprøvet på desktop, ikke på mobil.

## Log

Nyeste først.

### 2026-10-16 · Claude · Projektstruktur og tests

- AGENTS.md, CLAUDE.md og PROGRESS.md oprettet. CLAUDE.md importerer AGENTS.md, så der kun findes ét sæt fælles regler.
- `package.json` med kommandoer (`npm start`, `npm test`, `npm run tjek:assets`, `npm run asset-liste`), plus `.gitignore` og `.editorconfig`.
- 13 automatiske tests af spilmotoren i `tests/motor.test.mjs`. Alle består.

### 2026-10-16 · Claude · Demo-load med hele kortet

- `?load=alt` starter et demo-spil, hvor alle skills er lvl 20, bossen er besejret og alle klynger er afsløret. Det gemmes for sig selv. Der er også en knap i udviklerpanelet.

### 2026-10-16 · Claude · Bestilling af pixel-moodboards

- Bestilling og to referencebilleder af prototypen i `grafik/pixel-moodboards/`.

### 2026-10-16 · Codex · Stilprøver i tegneseriestil

- `grafik/stilproever/tegneserie-01` (moodboard og tre test-assets) og `tegneserie-02-terraen` (kort med terræn pr. klynge). Bestilt af brugeren direkte hos Codex.

### 2026-10-16 · Codex og Claude · Stjernekort-temaet færdigt

- Codex leverede prøvebatch 01 og runde 02-04, i alt 106 af 106 filer. Claude vurderede hver runde, rettede tjekscriptet og bad om rettelser.
- Prototypen bruger nu nebula, tågetekstur, klyngeslør og landmærker. Tåge og silhuetter er dæmpet efter en visuel gennemgang.

### 2026-10-16 · Claude · Første prototype

- Spilbar prototype i `prototype/`: alle 58 nodes, én aktivitet ad gangen, crafting, sockets, kamppoint, kamp ved noden med aktivitetsbjælke og pil, farmingområder, dungeon med boss, tåge og afsløring af Druide og Skovbrug.
- XP-bars i overskrifterne og ikoner i valglister er rettet efter brugerens test.

### 2026-10-16 · Claude · Asset-liste og værktøjer

- Asset-manifest med 106 assets, `tema.json` for stjernekortet, `tools/tjek-assets.mjs` og `tools/lav-asset-liste.mjs`. Listen blev gennemgået af flere agenter, før den gik til Codex.

### 2026-10-16 · Claude og Codex · Koncept og stilskitser

- Spilkoncept, idéhistorik og nodeliste i `dokumentation/`. Otte stilskitser fra Codex i `konceptbilleder/`. Brugeren valgte stjernekortet til prototypen.
