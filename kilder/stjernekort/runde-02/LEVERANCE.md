# Stjernekort — runde 02

16. oktober 2026. Runden er færdig og afventer vurdering. Ingen efterfølgende familier er igangsat.

[Samlet oversigt](oversigt.png) · [Præcise prompts](prompts.json) · [Asset-tjek](asset-tjek.txt) · [Målinger og filkontrol](kvalitetsrapport.json)

## Leveret

Alle fem bestilte nodefamilier er komplette: Træer (3), Træfældning-modifiers (4), Malme (2), Minedrift-modifiers (4) og Ovne (4). Derudover er portrætbaggrunden og samtlige 28 SVG-glyffer leveret, inklusive P2-glyffen Torne som bestilt. Filerne ligger under `temaer/stjernekort/` med manifestets id'er.

Prøvebatchens rettelser:

- Eg og kobberbrystplade er renset for alfa ≤ 8 og skaleret efter det synlige omrids til cirka 76%. Kobberbarren følger også det reviderede mål på 84%.
- Spiller og ulv beskæres gennem busten ved den faktiske bundkant. Ansigterne er bevaret. De eksisterende, godkendte friskæringer er genbrugt; der er ikke genereret nye portrætter eller foretaget ny segmentering.
- Træfældningsemblemet er genereret på en ny neutral medaljonreference med ét egeblad og økse, uden agern. Det er farvet med det krævede trepunkts-gradient map og forsynet med en centreret cirkulær alfamaske på Ø 230 px.
- Låsens krop har r = 4. Alle glyffer bruger hvid fyld og udskæringer, uden stroke, effekter eller tekst. Hjerter, kranier og sværd deler grundformer.
- Stjernehimlens støvkontrast er reduceret til 4% af den tidligere værdi. Seed og stjerner er bevaret. [3×3-prøve](stjernehimmel-3x3.jpg).

Under den visuelle kontrol blev asken gjort højere og smallere, og Hård hakke blev rettet til én spids og en kort stump bagside. Sparsom fyring bruger Varm ovn som reference, så murværk, perspektiv og proportioner passer sammen.

## Kontaktark

Arkene ligger i `kilder/stjernekort/kontaktark/` og viser de aftalte størrelser på #121735 i farve og gråtoner.

- [Træer](../kontaktark/traeer.png)
- [Træfældning-modifiers](../kontaktark/traefaeldning-modifiers.png)
- [Malme](../kontaktark/malme.png)
- [Minedrift-modifiers](../kontaktark/minedrift-modifiers.png)
- [Ovne](../kontaktark/ovne.png)
- [Alle 28 glyffer](../kontaktark/glyffer.png)
- [Portrætter](../kontaktark/portraetter.png)
- [Træfældningsemblem](../kontaktark/emblemer.png)
- [Baggrunde](../kontaktark/baggrunde.png)
- [Kobberbrystplade](../kontaktark/kobbergear.png)
- [Kobberbarre](../kontaktark/ressourcer.png)

## Kontrol og kilder

Det opdaterede `node tools/tjek-assets.mjs` godkender **52 af 106 assets**. Ingen filfejl eller fyldgradsadvarsler. Den ene advarsel er scriptets faste besked om, at JPG-sømme skal vurderes manuelt. 3×3-flisen er gennemgået visuelt, og sømforskelle er desuden målt i den gemte JPG. De resterende 40 P1- og 14 P2-assets ligger uden for denne runde; derfor returnerer det samlede tjek fortsat exitkode 1.

Malede filer er fremstillet med det indbyggede image_gen, med referencebilleder og separat generering pr. motiv. Generatorens originaloutput er bevaret på placeringerne i `kilder.json`; 1024×1024 kildemastere er gemt i `kilder/stjernekort/originaler/`. De leverede PNG'er er 8-bit RGBA uden interlace, nedskaleret med præmultipliceret alfa og med farveudvidelse under transparente kanter. Før-versioner findes i `foer-rettelser/`.

Kontaktarkene er visuelt gennemgået. Assets er endnu ikke afprøvet i en kørende spilprototype. Runden stopper her som bestilt.
