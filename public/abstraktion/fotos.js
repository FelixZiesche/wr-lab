// Abstraktionsprinzip: Fotos mit Bildnachweis, eigene Illustrationen und die Quellenliste.
// Die Fotos sind dieselben Dateien wie in der Lernwerkstatt Geschäftsfähigkeit (Wikimedia Commons, verkleinert).
import { esc } from '../shared/js/ui.js';

// credit: 'Urheber / Quelle, Lizenz'; link: Dateiseite, lizenz: Link zur Lizenz (bei CC-Lizenzen)
const C={by3:'https://creativecommons.org/licenses/by/3.0/',by4:'https://creativecommons.org/licenses/by/4.0/',bysa4:'https://creativecommons.org/licenses/by-sa/4.0/',cc0:'https://creativecommons.org/publicdomain/zero/1.0/'};
const W='https://commons.wikimedia.org/wiki/File:';
export const FOTO={
  banner:{motiv:'Goethe Galerie Jena',src:'img/galerie.jpg',alt:'Blick in die Goethe Galerie in Jena: Glasdach, Rolltreppen und Geschäfte auf mehreren Etagen',credit:'Andreas Praefcke / Wikimedia Commons, CC BY 3.0',link:W+'Jena_Goethe-Galerie_2010_1.jpg',lizenz:C.by3},
  sneaker:{motiv:'Air Force 1',src:'img/sneaker.jpg',alt:'Ein Paar weiße Nike Air Force 1 auf dem Schuhkarton',credit:'Xanor / Wikimedia Commons, CC0',link:W+'Air_Force_1.JPG',lizenz:C.cc0},
  simson:{motiv:'Simson S51',src:'img/simson.jpg',alt:'Rote Simson S51 von 1987, ein Moped aus Suhl in Thüringen',credit:'Max schwalbe / Wikimedia Commons, CC BY-SA 4.0',link:W+'Simson_S_51_B1-3_von_1987_Bild1.jpg',lizenz:C.bysa4},
  cafe:{motiv:'Café Stilbruch Jena',src:'img/cafe-jena.jpg',alt:'Café in Jena am Abend: Außentische auf Kopfsteinpflaster, drinnen sitzen Gäste im warmen Licht',credit:'Sebastian Wallroth / Wikimedia Commons, CC BY 4.0',link:W+'Jena_2023_002.jpg',lizenz:C.by4},
  pc:{motiv:'Gaming-PC',src:'img/gaming-pc.jpg',alt:'Offener Gaming-PC mit Wasserkühlung und bunter RGB-Beleuchtung',credit:'Benlisquare / Wikimedia Commons, CC BY-SA 4.0',link:W+'Ricer_gaming_PC_with_CPU_watercooler.jpg',lizenz:C.bysa4},
  baeckerei:{motiv:'Bäckerei in Jena',src:'img/baeckerei-jena.jpg',alt:'Bäckerei am Johannisplatz in Jena: Schaufenster mit Brötchen und Kaffee im Erdgeschoss eines alten Hauses',credit:'Timk70 / Wikimedia Commons, CC BY-SA 4.0',link:W+'Baeckerei_Zwiebel_%26_CiZ,_Jena,_Johannisplatz_9_%26_10.jpg',lizenz:C.bysa4},
  switch:{motiv:'Nintendo Switch',src:'img/switch.jpg',alt:'Nintendo Switch mit roten Joy-Cons und Dockingstation',credit:'KK IN HK / Wikimedia Commons, CC BY-SA 4.0',link:W+'Nintendo_Switch.jpg',lizenz:C.bysa4},
  controller:{motiv:'PS5-Controller',src:'img/controller.jpg',alt:'Hände halten einen pinken PlayStation-5-Controller',credit:'InclusiveGameLab / Wikimedia Commons, CC BY-SA 4.0',link:W+'InclusiveGameLab_Person-with-PS5-Controller_01_CC-BY-SA.jpg',lizenz:C.bysa4},
  // Eigene Illustrationen (WR-Lab)
  handy:{motiv:'Gebrauchtes Handy',src:'img/handy.svg',alt:'Illustration: Ein Smartphone mit Preisschild „350 €“ zwischen zwei Sprechblasen',credit:'eigene Illustration (WR-Lab)'},
  fahrrad:{motiv:'Fahrradladen',src:'img/fahrrad.svg',alt:'Illustration: Ein neues Fahrrad mit Preisschild „750 €“ vor einem Ladenschild',credit:'eigene Illustration (WR-Lab)'},
  ebike:{motiv:'E-Bike-Kette',src:'img/kette.svg',alt:'Illustration: Ein E-Bike wandert vom Großhändler über den Fahrradladen zum Kunden, drei Pfeile verbinden die Stationen',credit:'eigene Illustration (WR-Lab)'}
};
export function nachweis(k){const f=FOTO[k];if(!f)return '';const [wer,lizenz]=f.credit.split(', ');
  if(!f.link)return f.credit.startsWith('eigene')?esc(f.credit[0].toUpperCase()+f.credit.slice(1)):`Foto: ${esc(f.credit)}`;
  return `Foto: <a href="${f.link}" rel="noopener" target="_blank">${esc(wer)}</a>${lizenz?`, ${f.lizenz?`<a href="${f.lizenz}" rel="noopener" target="_blank">${esc(lizenz)}</a>`:esc(lizenz)}`:''}`}
export const fotoHTML=k=>!FOTO[k]?'':`<figure class="ap-fig"><img src="${FOTO[k].src}" alt="${esc(FOTO[k].alt)}" loading="lazy"><figcaption>${nachweis(k)}</figcaption></figure>`;

/* ---------- Quellen ---------- */
const FOTOS=['banner','sneaker','simson','cafe','pc','baeckerei','switch','controller'];
export const QUELLEN=[
  'Bürgerliches Gesetzbuch: §§ 104–110, 145, 147, 275, 433, 449, 854, 903, 929, 935 BGB (gesetze-im-internet.de, Stand Oktober 2026)',
  'Frankreich: Code civil, Art. 1196 und 1583 (Eigentum geht schon mit dem Kaufvertrag über, Konsensprinzip; legifrance.gouv.fr)',
  `Fotos (Wikimedia Commons, verkleinert): ${FOTOS.map(k=>`${FOTO[k].motiv}: <a href="${FOTO[k].link}" rel="noopener" target="_blank">${FOTO[k].credit.split(' / ')[0]}</a> (<a href="${FOTO[k].lizenz}" rel="noopener" target="_blank">${FOTO[k].credit.split(', ')[1]}</a>)`).join(' · ')}`,
  'Illustrationen (Handy, Fahrradladen, E-Bike-Kette) und Schemata: eigene Grafiken von WR-Lab',
  'Fälle nach den Unterrichtsmaterialien der Lehrkraft (Fahrrad-Fall, Doppelverkauf, „Das neue Handy“ in drei Akten), nach Thüringen verlegt. Alle Personen und Szenarien sind erfunden.'
];
