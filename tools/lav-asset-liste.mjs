// Genererer dokumentation/asset-liste.md ud fra temaer/asset-manifest.json og temaer/stjernekort/tema.json.
// Brug: node tools/lav-asset-liste.mjs
// Ret i manifestet, tema.json eller reglerne herunder, ikke i den genererede fil.
import { readFileSync, writeFileSync } from 'node:fs'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const manifest = JSON.parse(readFileSync(join(root, 'temaer', 'asset-manifest.json'), 'utf8'))
const tema = JSON.parse(readFileSync(join(root, 'temaer', 'stjernekort', 'tema.json'), 'utf8'))

const TRIAL = [
  'noder/eg', 'noder/kobberbrystplade', 'ressourcer/kobberbarre', 'glyffer/laas', 'portraetter/spiller',
  'portraetter/ulv', 'emblemer/traefaeldning', 'baggrunde/stjernehimmel',
]

const FOLDERS = {
  noder: {
    titel: 'Noder',
    regler: [
      '256×256 PNG med transparent baggrund.',
      'Ét samlet motiv uden røg, damp, dis, gnister eller løse partikler. Koden laver tåge-silhuetter ved at gøre ikonet sort og sløre det, så alt uden for motivet bliver til grå pletter.',
      'Motivets længste side fylder 76% af lærredet, og intet rører kanten. Mål det efter, at næsten usynlige kantpixels er fjernet.',
      'Naturlige materialefarver. Klyngefarven ligger i kodens ramme og glød, bortset fra små accenter, som står i prompten.',
      'Aktiviteter viser kilden på en lille base (træ på tue, klippe, ovn). Hastighedsmodifiers viser et redskab. Udbyttemodifiers viser en rigelig mængde af råvaren. Bygninger står på den samme lille runde jordplet.',
      'Gear svæver uden base med fast vinkel pr. slot: sværd diagonalt med fæstet nederst til venstre, hjelm og brystplade forfra, benskinner side om side forfra og støvler i trekvart.',
      'Kobber er altid varm rødorange med runde, hamrede former. Jern er altid kølig blågrå med kantede former og sølvhøjlys.',
      'Mørke materialer som jern, mørk sten og bark forsvinder på den mørke nodeflade. Giv dem lyse kanter fra lyset øverst til venstre.',
    ],
  },
  ressourcer: {
    titel: 'Ressourcer',
    regler: [
      '128×128 PNG med transparent baggrund. Motivets længste side fylder 84%, og det består af få, store former.',
      'Ressourcen er selve råvaren (stamme, malmklump, barre), mens aktivitetsnoden viser kilden (træet, klippen).',
    ],
  },
  glyffer: {
    titel: 'Glyffer',
    regler: [
      'Tegnes som SVG i kode, ikke med billedgeneratoren. Skabelon: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><path fill="#FFFFFF" fill-rule="evenodd" d="…"/></svg>`.',
      'Kun hvid fill. Ingen stroke, opacity, mask, clipPath, gradienter, filtre, tekst eller billeder. Konturer konverteres til udfyldte paths, og udskæringer laves med evenodd eller boolske operationer.',
      'Fyldte glyffer ligger inden for feltet 10-118. Optisk størrelse: runde former Ø 104, kvadratiske 96×96, høje 80×108 og brede 108×80.',
      'Udskæringer og mellemrum er mindst 10 enheder. Ydre hjørner afrundes med r = 4, mens spidser (klinger, stjerne, torne, chevroner) er skarpe. Lodrette og vandrette kanter ligger på et gitter af 8 enheder.',
      'Tomme udrustningsslots og bygnings-socket er hule konturer med en streg på 8 enheder inden for feltet 16-112. De er undtaget fra minimum 10, fordi de kun vises i 24-32 px.',
      'Fælles former: samme hjerte i hp, helbredelse og nederlag, samme kranie i boss og drab, og samme sværd i atk og slot-vaaben. Faste valg for retning og placering står i noterne.',
      'Ingen bogstaver eller tegn: ingen spørgsmålstegn, udråbstegn, plus eller flueben.',
    ],
  },
  portraetter: {
    titel: 'Portrætter',
    regler: [
      '512×512 PNG med transparent baggrund. Koden lægger baggrunde/portraet bag, så alle portrætter står ens side om side.',
      'Udsnittet står i prompten: bryst-op for spiller, goblin og ulv, overkrop for bossen og hel krop for rotte, barkbille, mosklump og egern. Alle fylder ca. 80% med øjnene ca. 40% fra toppen.',
      'Bryst-op og overkrop skæres af ved bundkanten (feltet kant_tilladt). De må ikke ende i en vandret afskæring over bunden. Hel krop holdes helt inde med luft under.',
      'Generér på flad neutral mellemgrå (#6B6B73), ikke indigo, så skyggerne ikke forsvinder med baggrunden. Friskær med en segmenteringsmodel (fx BiRefNet eller rembg) og ikke med farvenøgle. Fyld lukkede huller, så motivets indre er helt dækkende, og rens kantfarven.',
      'Spilleren ser mod højre, og monstrene ser mod venstre. Koden spejler efter behov, så intet må se forkert ud spejlet. Bossen ses forfra og spejles ikke.',
      'Den transparente version bruges også som silhuet i tågen, så omridset skal være genkendeligt.',
    ],
  },
  emblemer: {
    titel: 'Emblemer',
    regler: [
      '256×256 PNG med transparent baggrund: en rund medaljon, der fylder 90%.',
      'Lav først én tom medaljon, og brug den som referencebillede, så alle emblemer får samme skive og kant.',
      'Generér i neutral sølvgrå, og farv bagefter med et gradient map i tre punkter: skygge = klyngefarven ved ca. 25% luminans, mellemtone = klyngefarven præcis, højlys = klyngefarven blandet 60% med hvid. Klyngefarverne står i tema.json.',
      'Påfør til sidst en matematisk cirkulær alfamaske (Ø 230 px, centreret, antialiaseret), så skiven er helt rund, og alt uden for den er 0.',
      'Ét enkelt motiv pr. emblem. Ingen indskrift, perler, bånd, kranse eller ekstra ringe på kanten.',
    ],
  },
  baggrunde: {
    titel: 'Baggrunde',
    regler: [
      'Bruges kun via tema.json (rolle "tema"), så et andet tema kan have helt andre lag. Hver post har sin egen promptskabelon i feltet tillaeg.',
      'Stjernehimlen (2048) laves procedurelt med fast seed og stjerner, der fortsætter over kanterne. Den svage støvvariation må ikke danne pletter, der gentager sig synligt i en 3×3-prøve.',
      'Tonbare lag (taage, nebula og klyngesloer) er hvide med formen i alfa. Lav dem som lys på sort eller procedurelt (fBm-støj med wrap-around), og konvertér luminans til alfa. Tågen normaliseres til alfa 0,20-0,85.',
      'Sømløse fliser testes som 3×3. Tjekscriptet tjekker kun sømme i PNG; JPG skal ses i 3×3.',
      'Brug ikke pngquant på bløde gradienter, da det giver banding. Tilføj let dither.',
    ],
  },
  silhuetter: {
    titel: 'Silhuetter',
    regler: [
      '1024×1024 PNG, tonbar: hvid med formen i alfa. Lav dem som lys silhuet på sort, og konvertér luminans til alfa.',
      'Skalér alfa, så motivets kerne er 100% dækkende. Koden styrer selv, hvor svag silhuetten er.',
      'Gang alfa med en lineær rampe fra 1 ved 75% af højden til 0 ved bundkanten, og sæt alfa til 0 i en 16 px bred ramme hele vejen rundt.',
      'Ingen streger, omrids, oplyste vinduer, lyskilder, stjerner eller måne.',
    ],
  },
}

const cell = s => String(s ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ')
const byFolder = {}
for (const a of manifest.assets) (byFolder[a.id.split('/')[0]] ??= []).push(a)
const count = p => manifest.assets.filter(a => a.prioritet === p).length
const families = [...new Set(manifest.assets.filter(a => a.tillaeg !== null).map(a => a.familie))]

const lines = []
const out = (...l) => lines.push(...l)

out(
  '# Asset-liste til Codex: stjernekort',
  '',
  'Genereret af `node tools/lav-asset-liste.mjs` ud fra [asset-manifest.json](../temaer/asset-manifest.json) og [tema.json](../temaer/stjernekort/tema.json). Ret i de to filer eller i reglerne i værktøjet, ikke her.',
  '',
  `Prototypen skal bruge ${manifest.assets.length} filer: ${count('P1')} med prioritet P1 og ${count('P2')} med P2. Manifestet er kontrakten mellem spilkoden og temaerne. Spilkoden henviser kun til id'er, så et nyt grafisk udtryk er en ny temamappe med de samme id'er.`,
  '',
  'Motivprompter, noter, familie og promptskabelon for hver fil står i manifestet. Noterne er til kvalitetstjek; alt, der skal med i billedet, står i prompt_en.',
  '',
  '## Sådan leverer du',
  '',
  '- Læg hver fil i `temaer/stjernekort/<id>.<format>`, fx `temaer/stjernekort/noder/eg.png`.',
  `- Id'er: ${manifest.konventioner.id}`,
  `- ${manifest.konventioner.png}`,
  '- Kør `node tools/tjek-assets.mjs` fra projektmappen. Det tjekker manifest og tema.json, navne, størrelser, formater, transparens og kanter, motivets fyldgrad, hvide glyffer, sømme i PNG-fliser og filstørrelser, og det viser, hvad der mangler.',
  '- Gem originaler i 1024 px, efterbehandlingsscripts og kontaktark i `kilder/stjernekort/` eller i en batchmappe under `grafik/`, uden for temamappen.',
  '- Gem en `prompts.json` pr. batch med strukturen `{ "<id>": { "prompt": "…", "model": "…", "dato": "ÅÅÅÅ-MM-DD", "referencer": ["<id>"] } }`.',
  '',
  '### Generator og plan B',
  '',
  '- Billedgeneratoren laver 1024×1024. Generér i den størrelse, og skalér ned.',
  '- Uden ægte transparens: generér på flad neutral mellemgrå (#808080), og friskær med en segmenteringsmodel.',
  '- Uden referencebilleder: lav søskende side om side i ét billede, og skær dem ud bagefter.',
  '- Uden inpainting: lav sømløse fliser procedurelt.',
  '',
  '### Efterbehandling af malede filer',
  '',
  '1. Fjern løse, næsten usynlige pixels (alfa under ca. 8) og halvgennemsigtige rester uden for motivet.',
  '2. Rens kantfarven, og udvid farven ind under de transparente pixels (alpha bleed), så der ikke kommer rande ved skalering.',
  '3. Trim til alfaens omrids, skalér, så den længste side får mappens fyldgrad (noder 76%, ressourcer 84%, portrætter 80%, emblemer 90%), og centrér. Portrætter med kant_tilladt placeres, så busten skæres af ved bunden.',
  '4. Nedskalér med præmultipliceret alfa (fx sharp/libvips, `npm i sharp` i kilder/), og gem som 8-bit RGBA PNG uden interlace.',
  '',
  '### Prioritet',
  '',
  ...Object.entries(manifest.konventioner.prioritet).map(([k, v]) => `- **${k}:** ${v}`),
  `- **Manglende filer:** ${manifest.konventioner.mangler}`,
  '',
  '## Rækkefølge',
  '',
  `1. **Prøvebatch.** ${TRIAL.map(id => `\`${id}\``).join(', ')}. Brugeren godkender stilen, før resten laves. noder/eg og noder/kobberbrystplade er stilreference for alle noder, indtil familiens egen første fil er godkendt.`,
  `2. **Familiebatches.** Familie for familie, med de godkendte filer som referencebilleder. Familierne står i manifestets felt familie: ${families.map(f => `\`${f}\``).join(', ')}. Par, hvor forskellen er vigtig (kobber og jern i samme slot, Hård og Tung hakke, Varm ovn og Sparsom fyring), laves med samme reference eller side om side.`,
  '3. **Kontaktark.** Efter hver familie gemmes et kontaktark som `kilder/stjernekort/kontaktark/<familie>.png`. Det viser filerne i de rigtige størrelser på nodefladen (#121735), i farve og i gråtoner: noder i 56 og 72 px (gear også i 24 px), ressourcer i 16 og 32 px, glyffer i 14-32 px, portrætter i 64 og 128 px og emblemer i 24, 32 og 64 px. Søskende står side om side. Lever i runder på en eller flere familier efter aftale med brugeren, og stop efter hver runde, indtil den er godkendt.',
  '4. **P1 før P2.**',
  '',
  '## Prompts',
  '',
  `${tema.prompts.opbygning}`,
  '',
  '### Basis',
  '',
  `> ${tema.prompts.basis}`,
  '',
  '### Skabeloner',
  '',
  ...Object.entries(tema.prompts.tillaeg).flatMap(([k, v]) => [`**${k}** (${v.basis ? 'med basis' : 'uden basis'}; bruges af ${manifest.assets.filter(a => a.tillaeg === k).length} filer)`, '', `> ${v.tekst}`, '']),
  '## Afvisningskriterier',
  '',
  'Lav filen om, hvis den har:',
  '',
  '- bogstaver, runer, indskrifter eller tal, også på klinger, skjolde og medaljonkanter (zoom til 200% for at finde pseudotekst)',
  '- en signatur i et hjørne',
  '- en ramme, plade eller glorie om motivet, eller en glødende kant (emblemets egen skive og kant er tilladt)',
  '- stjerner, gnister, røg eller glød omkring et transparent motiv',
  '- et motiv, der er beskåret eller rører kanten (undtagen bunden af bryst-op- og overkrop-portrætter)',
  '- en lys eller mørk rand i alfakanten',
  '- et nuttet eller komisk udtryk',
  '',
  '## Det laver koden, ikke billederne',
  '',
  'Rammer, glød, forbindelseslinjer, overskrifter, XP-bars, HP-bars, angrebsindikatoren langs kanten, tal og tekst, effekter (partikler, slag, kritisk slag, level-up og afsløringer), pilen i skærmkanten, afspil- og stopfigurer, nære stjerner, tåge-silhuetter af ikonerne, låst og besejret tilstand (mørkning og desaturering), spejling af portrætter og pladsholdere for filer, der mangler.',
  '',
  '## Farver i stjernekortet',
  '',
  '| Klynge | Farve |',
  '|---|---|',
  ...Object.entries(tema.farver.klynger).map(([k, v]) => `| ${k} | \`${v}\` |`),
  '',
  `Baggrund \`${tema.farver.baggrund}\`, nodeflade \`${tema.farver.nodeflade}\`, tekst \`${tema.farver.tekst}\`. Alle farver står i tema.json.`,
  '',
)

for (const [folder, spec] of Object.entries(FOLDERS)) {
  const list = byFolder[folder] ?? []
  out(`## ${spec.titel} (${list.length})`, '', ...spec.regler.map(r => `- ${r}`), '')
  out('| Id | Prio | Familie | Fil | Motiv |', '|---|---|---|---|---|')
  for (const a of list) {
    const flags = [a.baggrund === 'opak' && 'opak', a.toenbar && 'tonbar', a.soemloes && 'sømløs', a.kant_tilladt && 'bund må skæres af'].filter(Boolean).join(', ')
    out(`| \`${a.id}\` | ${a.prioritet} | ${a.familie} | ${a.bredde}×${a.hoejde} ${a.format}${flags ? `, ${flags}` : ''} | ${cell(a.motiv)} |`)
  }
  out('')
}

writeFileSync(join(root, 'dokumentation', 'asset-liste.md'), lines.join('\n'))
console.log(`Skrev dokumentation/asset-liste.md (${manifest.assets.length} assets)`)
