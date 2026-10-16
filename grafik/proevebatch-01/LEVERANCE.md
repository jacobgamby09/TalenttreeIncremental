# Stjernekort — prøvebatch 01

Historisk leverance. Den korrigerede prøvebatch og næste runde findes i [runde 02](../../kilder/stjernekort/runde-02/LEVERANCE.md). Mål og kontrolresultater nedenfor gælder den oprindelige aflevering.

Leveret 16. oktober 2026. Status: stilprøve til brugerens vurdering. Stop efter disse otte assets; den resterende produktion er ikke igangsat.

## Se resultatet

- [Samlet oversigt med store motiver og små ikoner](oversigt.png)
- [Stjernehimlen gentaget 3 × 3](stjernehimmel-3x3.jpg)
- [De præcise anvendte prompts og originalfilernes placering](prompts.json)
- [Mål, filstørrelser, alfa og kontrol af JPG-sømme](teknisk-tjek.json)

## Filer til prototypen

Alle stier er relative til projektroden. Filerne følger det færdige manifest, inklusive dets ændringer fra den tidligere prøvebestilling: SVG til låsen, transparente portrætter og en sølvgrå ulv, hvis røde kampmarkering tegnes af spillet.

| Fil | Mål | Baggrund |
| --- | --- | --- |
| `temaer/stjernekort/noder/eg.png` | 256 × 256 | Transparent |
| `temaer/stjernekort/noder/kobberbrystplade.png` | 256 × 256 | Transparent |
| `temaer/stjernekort/ressourcer/kobberbarre.png` | 128 × 128 | Transparent |
| `temaer/stjernekort/glyffer/laas.svg` | viewBox 0 0 128 128 | Transparent; ren hvid |
| `temaer/stjernekort/portraetter/spiller.png` | 512 × 512 | Transparent |
| `temaer/stjernekort/portraetter/ulv.png` | 512 × 512 | Transparent |
| `temaer/stjernekort/emblemer/traefaeldning.png` | 256 × 256 | Transparent uden for medaljonen |
| `temaer/stjernekort/baggrunde/stjernehimmel.jpg` | 2048 × 2048 | Opak; sømløs |

## Visuel retning og brug

Malede fantasy-miniaturer med varmt lys fra øverste venstre side og kølige skygger. Kobber er tydeligt varmt rødorange; træet har grøn krone og en markant snoet stamme. Spilleren ser mod højre, ulven mod venstre. Spillerens portræt har ingen udrustning, så det kan bruges uanset gear.

Nodeikonerne har cirka 12% fri margen, portrætterne cirka 10%, og emblemet cirka 5%. Største motivdimension er henholdsvis 76%, 80% og 90% af lærredet. Bevar hele filen ved visning; undgå at beskære den med cover. Emblemets farvetone er justeret efter #6DD58C; naturlige skygger og højlys er bevaret.

Stjernehimlen er et bevidst diskret bageste lag. Den supplerer temaets separate stjerner og senere nebulalag. Disse ekstra lag er ikke en del af de otte leverede filer. Portrætterne kan foreløbig ligge på temaets nodeflade, indtil den fælles portrætbaggrund leveres.

Rammer, glød, HP-bars, forbindelser, låsetilstande og angrebsindikator er fortsat elementer, spillet tegner. Angrebsindikatoren skal følge den firkantede kant. Kortene i oversigtsbilledet er kun en præsentation af assets.

## Fremstilling og kontrol

De seks malede motiver er lavet med det indbyggede image_gen-værktøj, én generering pr. motiv, med rigtig transparens. De er eksporteret til de aftalte mål med bevaret alfa. Låsen er håndskrevet SVG. Stjernehimlen er procedurelt fremstillet med fast seed 16102026, periodiske støvvariationer og stjerner, der fortsætter over kanterne; JPG kvalitet 90 med 4:4:4-farver.

`node tools/tjek-assets.mjs` rapporterer: **8 af 106 assets er leveret og godkendt**. Ingen fejl eller advarsler på leverancen. Scriptets exitkode er 1, fordi resten endnu mangler: 83 P1 og 15 P2. Det er forventet for prøvebatchen.

JPG-sømme er desuden kontrolleret særskilt, da projektets script kun laver pixelsømstjek på PNG. 3 × 3-gentagelsen og den samlede oversigt er visuelt gennemgået. Alle leverede filer ligger under manifestets størrelsesgrænser.

Prøven er vurderet på oversigten og i små ikonstørrelser; den er endnu ikke afprøvet i en kørende spilprototype. Den endelige stil afventer brugerens vurdering.
