// Deliktsfähigkeit: Fotos mit Bildnachweis, Zahlen für den Haftpflicht-Rechner und die Quellenliste.
import { esc } from '../shared/js/ui.js';

// credit: 'Urheber / Quelle, Lizenz'; link: Dateiseite, lizenz: Link zur Lizenz (bei CC-Lizenzen)
export const FOTO={
  simson:{motiv:'Simson S51',src:'img/simson.jpg',alt:'Rote Simson S51 von 1987, ein Moped aus Suhl in Thüringen',credit:'Max schwalbe / Wikimedia Commons, CC BY-SA 4.0',
    link:'https://commons.wikimedia.org/wiki/File:Simson_S_51_B1-3_von_1987_Bild1.jpg',lizenz:'https://creativecommons.org/licenses/by-sa/4.0/'}
};
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
  'Fälle nach den Unterrichtsmaterialien der Lehrkraft (Ben, Michael, Lisa, Marie, Simson-Fall), nach Thüringen verlegt. Alle Personen und Szenarien sind erfunden.'
];
