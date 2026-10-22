// Alle Themen im WR-Lab. Die Startseite zeigt sie als Karten, nach Klassenstufe sortiert.
// Neues Thema: Ordner anlegen, hier eintragen (siehe README, Abschnitt „Neues Thema hinzufügen“).
//   id:     Ordnername, nur Kleinbuchstaben, Ziffern und Bindestrich (wird auch im Live-Raum gespeichert)
//   stufe:  Klassenstufe nach dem Thüringer Lehrplan: 9, 10, 11 oder 12. Innerhalb einer Stufe gilt
//           die Reihenfolge dieser Liste, am besten die des Lehrplans.
//   bild:   Foto im Themenordner, Seitenverhältnis etwa 16:9; foto: Bildnachweis (bei CC-Lizenzen mit Lizenz)
//   fotoLink, lizenzLink: bei CC-Lizenzen Link zur Datei und zur Lizenz (für die Fußzeile der Startseite)
export const THEMEN = [
  {
    id: 'geldanlage',
    titel: 'Anlagemöglichkeiten',
    stufe: 9,
    bereich: 'Wirtschaft',
    text: 'Sparbuch, Aktie, ETF oder Bitcoin? Geldschmelze, magisches Dreieck, Schneeball-Rechner, eine Depot-Zeitmaschine mit echten Kursen und der Wolf of Saale, der an dein Jugendweihe-Geld will.',
    stichworte: ['Dreieck der Geldanlage', 'Zinseszins', 'Chat-Abenteuer', 'Klassen-Quiz'],
    bild: 'geldanlage/img/boerse.jpg',
    alt: 'Die Bronzefiguren Bulle und Bär vor der Frankfurter Wertpapierbörse',
    foto: 'giesing / Flickr, CC BY 2.0',
    fotoLink: 'https://www.flickr.com/photos/46074423@N00/14842086960',
    lizenzLink: 'https://creativecommons.org/licenses/by/2.0/'
  },
  {
    id: 'geschaeftsfaehigkeit',
    titel: 'Geschäftsfähigkeit',
    stufe: 10,
    bereich: 'Recht',
    text: 'Döner, Handyvertrag, V-Bucks, Klarna: Welche Verträge darfst du schon allein abschließen? Mit Rechts-Navi, Fall-Akte, „Ihr seid das Gericht“ für die ganze Klasse und der Mission Zwergspitz.',
    stichworte: ['§§ 104–113 BGB', 'Taschengeldparagraf', 'Live-Abstimmung', 'Lernraum'],
    bild: 'geschaeftsfaehigkeit/img/galerie.jpg',
    alt: 'Blick in die Goethe Galerie in Jena: Glasdach, Rolltreppen und Geschäfte auf mehreren Etagen',
    foto: 'Andreas Praefcke / Wikimedia Commons, CC BY 3.0',
    fotoLink: 'https://commons.wikimedia.org/wiki/File:Jena_Goethe-Galerie_2010_1.jpg',
    lizenzLink: 'https://creativecommons.org/licenses/by/3.0/'
  },
  {
    id: 'deliktsfaehigkeit',
    titel: 'Deliktsfähigkeit',
    stufe: 10,
    bereich: 'Recht',
    text: 'Ball gegen den Zaun, Crash mit der Simson, Party-Chaos: Wer zahlt, wenn\'s kracht? Eine Lernstrecke in fünf Lektionen mit Live-Abstimmung, Rechts-Navi und Mission Simson.',
    stichworte: ['§§ 823, 827, 828 BGB', 'Haftung', 'Lernstrecke', 'Lernraum'],
    bild: 'deliktsfaehigkeit/img/simson.jpg',
    alt: 'Eine Simson S51 mit schwarzem Tank und roten Schutzblechen steht auf einem Parkplatz bei Eisenberg neben einem grauen Auto',
    foto: 'Steffen Mokosch / Wikimedia Commons, CC BY-SA 3.0',
    fotoLink: 'https://commons.wikimedia.org/wiki/File:Simson_S51_at_McDonald%27s_Petersberg_near_Eisenberg_2026.jpg',
    lizenzLink: 'https://creativecommons.org/licenses/by-sa/3.0/'
  },
  {
    id: 'sechseck',
    titel: 'Magisches Sechseck',
    stufe: 11,
    bereich: 'Wirtschaft',
    text: 'Sechs Ziele der Wirtschaftspolitik messen, Zielkonflikte aufdecken und im Planspiel „Sechseck-Leben“ vier Jahre Politik für Menschen aus Thüringen entscheiden.',
    stichworte: ['StabG 1967', 'Zielkonflikte', 'Planspiel', 'Lernraum'],
    bild: 'sechseck/img/szene-3-jena.jpg',
    alt: 'Blick über das Saaletal auf Jena mit dem JenTower',
    foto: 'Lukas D. / Unsplash'
  }
];
