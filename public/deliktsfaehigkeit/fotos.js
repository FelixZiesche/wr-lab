// Deliktsfähigkeit: Fotos mit Bildnachweis, Zahlen für den Haftpflicht-Rechner und die Quellenliste.
import { esc } from '../shared/js/ui.js';

// credit: 'Urheber / Quelle, Lizenz'; link: Dateiseite, lizenz: Link zur Lizenz (bei CC-Lizenzen)
const C={'by2':'https://creativecommons.org/licenses/by/2.0/','by4':'https://creativecommons.org/licenses/by/4.0/','bysa3':'https://creativecommons.org/licenses/by-sa/3.0/','bysa4':'https://creativecommons.org/licenses/by-sa/4.0/','cc0':'https://creativecommons.org/publicdomain/zero/1.0/'};
const W='https://commons.wikimedia.org/wiki/File:';
export const FOTO={
  banner:{motiv:'Markt in Apolda',src:'img/titel.jpg',alt:'Der Marktplatz von Apolda mit bunten Altstadthäusern und parkenden Autos auf Kopfsteinpflaster',credit:'NatiSythen / Wikimedia Commons, CC BY-SA 3.0',link:W+'Apolda_Markt01.jpg',lizenz:C.bysa3},
  simson:{motiv:'Simson S51 bei Eisenberg',src:'img/simson.jpg',alt:'Eine Simson S51 mit schwarzem Tank und roten Schutzblechen steht auf einem Parkplatz direkt neben einem grauen Auto',credit:'Steffen Mokosch / Wikimedia Commons, CC BY-SA 3.0',link:W+'Simson_S51_at_McDonald%27s_Petersberg_near_Eisenberg_2026.jpg',lizenz:C.bysa3},
  zaun:{motiv:'Fußball',src:'img/fussball.jpg',alt:'Ein schwarz-weißer Fußball liegt auf grünem Rasen',credit:'Tim Reckmann / Wikimedia Commons, CC BY 2.0',link:W+'Fu%C3%9Fball_auf_Rasen_(40259829870).jpg',lizenz:C.by2},
  fahrrad:{motiv:'Kind auf dem Fahrrad',src:'img/fahrrad.jpg',alt:'Ein Kind mit pinkem Helm fährt, von hinten gesehen, auf einem rot markierten Radweg zwischen Erwachsenen auf Fahrrädern',credit:'Skgbl / Wikimedia Commons, CC BY 4.0',link:W+'Kidical_Mass_Hamburg_2024_September_26.jpg',lizenz:C.by4},
  tassen:{motiv:'Bunte Tassen',src:'img/geschirr.jpg',alt:'Viele bunte Tassen liegen durcheinander übereinander gestapelt',credit:'Erkaha / Wikimedia Commons, CC BY-SA 4.0',link:W+'Bunte_Tassen_wild_gemischt.jpg',lizenz:C.bysa4},
  party:{motiv:'Partykeller',src:'img/party.jpg',alt:'Ein leerer Partykeller mit Backsteinwand, Discokugel an der Decke und roten Sesseln',credit:'Mr N / Wikimedia Commons, CC BY-SA 4.0',link:W+'Kinolino-Partykeller_01.jpg',lizenz:C.bysa4},
  silvester:{motiv:'Silvester in Jena',src:'img/silvester.jpg',alt:'Silvesterraketen explodieren in der Neujahrsnacht dicht über verschneiten Hausdächern in Jena',credit:'Rene Schwietzke / Wikimedia Commons, CC BY 2.0',link:W+'Silvester_2010_in_Jena_(5311663151).jpg',lizenz:C.by2},
  escooter:{motiv:'E-Scooter auf dem Gehweg',src:'img/escooter.jpg',alt:'Mehrere grüne Leih-E-Scooter stehen auf einem Gehweg, einer liegt umgekippt quer auf dem Weg',credit:'Catatine / Wikimedia Commons, CC0',link:W+'HAL-Vogelweide,_Scooter.jpg',lizenz:C.cc0},
  auto:{motiv:'Auto mit Delle',src:'img/auto.jpg',alt:'Ein silbernes Auto mit eingedellter Beifahrertür, das Fenster ist mit Folie abgeklebt',credit:'Garitzko / Wikimedia Commons, gemeinfrei',link:W+'Damaged_car_door.jpg'},
  schild:{motiv:'Baustellenschild',src:'img/schild.jpg',alt:'Gelbes Schild an einem blauen Bauzaun: Betreten der Baustelle verboten. Eltern haften für ihre Kinder!',credit:'Sascha Grosser / Wikimedia Commons, CC BY-SA 4.0',link:W+'Schild_-_Baustelle_verboten_-_Eltern_haften_f%C3%BCr_ihre_Kinder.jpg',lizenz:C.bysa4}
};
// Aliase für Fälle, die dasselbe Motiv nutzen
FOTO.parkplatz=FOTO.banner;FOTO.ball=FOTO.zaun;FOTO.nebel=FOTO.auto;FOTO.bruecke=FOTO.auto;
export function nachweis(k){const f=FOTO[k];if(!f)return '';const [wer,lizenz]=f.credit.split(', ');
  if(!f.link)return `Foto: ${esc(f.credit)}`;
  return `Foto: <a href="${f.link}" rel="noopener" target="_blank">${esc(wer)}</a>${lizenz?`, ${f.lizenz?`<a href="${f.lizenz}" rel="noopener" target="_blank">${esc(lizenz)}</a>`:esc(lizenz)}`:''}`}
export const fotoHTML=k=>!FOTO[k]?'':`<figure class="df-fig"><img src="${FOTO[k].src}" alt="${esc(FOTO[k].alt)}" loading="lazy"><figcaption>${nachweis(k)}</figcaption></figure>`;

/* ---------- Haftpflicht-Rechner ---------- */
export const HAFTPFLICHT={
  beitrag:50,
  stand:'Beitrag: gute Familienhaftpflicht ab rund 50 € im Jahr (Stiftung Warentest, Mai 2026). Etwa 9 von 10 Haushalten haben eine (GDV, Daten 2023).',
  schaeden:[
    {icon:'smartphone',t:'Handy-Display',betrag:180,e:'Ein kaputtes Display kann man zur Not selbst bezahlen. Für kleine Schäden braucht man die Versicherung kaum.'},
    {icon:'directions_car',t:'Delle im Auto',betrag:1500,e:'Der Schaden aus dem Simson-Fall. Mit dem Moped zahlt ihn die Pflichtversicherung, mit dem Fahrrad die Privathaftpflicht.'},
    {icon:'two_wheeler',t:'Unfall mit dem Moped',betrag:4900,e:'So viel kostet ein Haftpflichtschaden mit Moped, Mofa oder E-Scooter im Durchschnitt (GDV, 2024). Bezahlen muss ihn die Versicherung hinter dem Versicherungskennzeichen.'},
    {icon:'local_fire_department',t:'Auto brennt an Silvester',betrag:7600,e:'So viel kostete ein Autobrand im Schnitt (GDV, 2024). Wer das Auto mit einem Böller absichtlich in Brand setzt, bekommt keine Hilfe: Bei Vorsatz zahlt die Haftpflicht nicht.'},
    {icon:'personal_injury',t:'Mensch schwer verletzt',betrag:2000000,e:'Beispiel: Wird ein Mensch schwer verletzt, können Behandlung, Verdienstausfall und Rente mehrere Millionen Euro kosten. Gute Tarife versichern deshalb mindestens 10 Millionen Euro.'}]
};

/* ---------- Quellen ---------- */
export const QUELLEN=[
  'Bürgerliches Gesetzbuch: §§ 254, 276, 823, 827, 828, 829, 832 BGB (gesetze-im-internet.de)',
  'Bundesgerichtshof, Urteile vom 30.11.2004, VI ZR 335/03 und VI ZR 365/03 (Sonderregel im Straßenverkehr greift bei parkenden Autos nicht) · Oberlandesgericht Celle, 14 U 69/19 (2020, Achtjährige auf dem Fahrrad haftet)',
  'Haftpflicht-Beitrag: Stiftung Warentest, Test Privathaftpflicht vom 18.05.2026 (Familientarife „sehr gut“ ab 48 € im Jahr) · Verbreitung: GDV, Insurance Flash 2026/01 (89 % der Haushalte, Daten 2023)',
  'Schadenshöhen: GDV/Die Versicherer, Versicherungskennzeichen 2024 (Schadendurchschnitt 4.900 €, Meldung vom 20.02.2026) · GDV, Fahrzeugbrände 2024 (im Schnitt 7.600 € je Pkw-Brand, Meldung vom 29.12.2025)',
  'Versicherungskennzeichen: gilt vom 1. März bis Ende Februar, 2026/27 schwarz (Die Versicherer, 20.02.2026) · Simson mit 60 km/h und Führerschein Klasse AM: Bundesministerium für Verkehr, Pressemitteilung 076/2026 vom 14.08.2026',
  'Elektrokleinstfahrzeuge-Verordnung: § 3 eKFV (E-Scooter ab 14) · Fahrerlaubnis-Verordnung: § 10 (Klasse AM ab 15 in ganz Deutschland seit 28.07.2021) · Strafgesetzbuch: § 142 StGB (unerlaubtes Entfernen vom Unfallort) · Jugendschutzgesetz: § 9 JuSchG',
  `Fotos (Wikimedia Commons, verkleinert): ${['banner','simson','zaun','fahrrad','tassen','party','silvester','escooter','auto','schild'].map(k=>`${FOTO[k].motiv}: <a href="${FOTO[k].link}" rel="noopener" target="_blank">${FOTO[k].credit.split(' / ')[0]}</a> (${FOTO[k].lizenz?`<a href="${FOTO[k].lizenz}" rel="noopener" target="_blank">${FOTO[k].credit.split(', ')[1]}</a>`:FOTO[k].credit.split(', ')[1]})`).join(' · ')}`,
  'Fälle nach den Unterrichtsmaterialien der Lehrkraft (Ben, Michael, Lisa, Marie, Simson-Fall), nach Thüringen verlegt. Alle Personen und Szenarien sind erfunden.'
];
