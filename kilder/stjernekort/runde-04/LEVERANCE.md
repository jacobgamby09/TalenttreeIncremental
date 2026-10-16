# Runde 04 — 16. oktober 2026

Runden er klar til samlet vurdering i prototypen. Alle **106 af 106 assets** er leveret og godkendt af `node tools/tjek-assets.mjs` (exitkode 0). 30 nye filer og én rettet glyf.

## Leveret

- **P1 (17 nye):** fem stat-noder, seks bygninger inklusive tilbygning, fem emblemer (minedrift, smedje, kamp, hjemmebase og den-hule-eg) samt tåge.
- **P2 (13 nye):** tre druide-noder, to skovbrugs-noder, druide- og skovbrugsemblemer, nebula, klyngeslør og fire landmærke-silhuetter.
- **Rettelse:** slot-vaaben har bredere klinge, greb og parerstang; yderfelt 16–112, hult motiv med 8 px godstykkelse.

Spilfilerne ligger i [temaer/stjernekort](../../../temaer/stjernekort). Sammenligning med runde 03's SHA-256-rapport bekræfter, at kun slot-vaaben er ændret blandt de tidligere 76 assets.

## Visuel kontrol

[Samlet oversigt](oversigt.png).

Familieark i [kontaktark](../kontaktark):
[stat-noder](../kontaktark/stat-noder.png), [bygninger](../kontaktark/bygninger.png), [druide](../kontaktark/druide.png), [skovbrug](../kontaktark/skovbrug.png), [emblemer](../kontaktark/emblemer.png), [glyffer](../kontaktark/glyffer.png), [tonbare lag](../kontaktark/baggrunde-runde-04.png) og [silhuetter](../kontaktark/silhuetter.png).

- Noder gennemset i 56/72 px, i farve og gråtoner.
- Alle otte medaljoner vises sammen i 24/32/64 px. De syv nye bruger den fælles tomme medaljon som reference, er genereret neutralt og farvet med gradient map efter temaets klyngefarver. Minedrift er forenklet til tre store krystaller. Den hule eg er forenklet til stamme, hulning og rødder.
- Silhuetter vises med temaets farve #C9C6EE og opacitet 0,25 samt ved fuld alfaværdi til formkontrol. Hulningen i egen er løftet og er synlig efter bundfading.
- Tåge og nebula vises tonet som 3×3. Der er også fuld størrelse: [tåge 3072×3072](taage-3x3.png) og [nebula 3072×3072](nebula-3x3.png).
- Klyngesløret vises med alle otte klyngefarver og opacitet 0,18.

De endelige lag skal stadig vurderes samlet med spillets stjerner, tågens to bevægelige kopier og kortets øvrige grafik i prototypen.

## Kontrol og efterbehandling

[Tjekresultat](asset-tjek.txt) og [kvalitetsrapport med mål og filhashes](kvalitetsrapport.json).

Ingen fejl, manglende filer eller fyldgradsadvarsler. Den eneste advarsel er den eksisterende besked om, at automatisk sømtjek ikke omfatter stjernehimlens JPG-format. Stjernehimlen er uændret fra den godkendte runde 02; [dens 3×3-prøve](../runde-02/stjernehimmel-3x3.jpg) er bevaret.

Ekstra kontrol bekræfter hvid RGB i samtlige pixels på alle syv tonbare PNG-filer, tågens alfa 51–217, fuldt alfaområde på nebula/klyngeslør, 64 px tom kant på klyngesløret og 16 px tom kant på silhuetterne. Silhuetternes kerne når alfa 255; kildebilledets nederste afskæring blødgøres før den foreskrevne lineære fading gennem lærredets sidste fjerdedel.

Malede noder er renset for alfa ≤8, skaleret til cirka 76 %, centreret, nedskaleret med præmultipliceret alfa og gemt med skjult kantfarve. Emblemer har 230 px cirkulær alfamaske på 256 px lærred. PNG-filer er 8-bit RGBA uden interlace.

## Kilder

Billederne er lavet med **det indbyggede image_gen-værktøj**. Ingen API/CLI-fallback. De tre tonbare baggrundslag er lavet procedurelt med fast seed og wrap-around fBm, som asset-listen tillader. Glyffen er SVG-geometri.

[Prompts og referencer](prompts.json), [første genereringer](kilder.json), [valgte rettelser](rettelser.json), [teksturparametre](teksturer.json). De valgte originaler er gemt i 1024 px under [originaler](../originaler), ordnet efter asset-id.

Efterbehandling og kontaktark kan genskabes med scripts i denne mappe. Miljøets biblioteksversioner står i [requirements.txt](requirements.txt).

