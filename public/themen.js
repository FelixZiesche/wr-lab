// Alle Themen im WR-Lab. Die Startseite zeigt sie als Karten, nach Klassenstufe sortiert.
// Neues Thema: Ordner anlegen, hier eintragen (siehe README, Abschnitt „Neues Thema hinzufügen“).
//   id:     Ordnername, nur Kleinbuchstaben, Ziffern und Bindestrich (wird auch im Live-Raum gespeichert)
//   stufe:  Klassenstufe nach dem Thüringer Lehrplan: 9, 10, 11 oder 12. Innerhalb einer Stufe gilt
//           die Reihenfolge dieser Liste, am besten die des Lehrplans.
//   bild:   Foto im Themenordner, Seitenverhältnis etwa 16:9; foto: Bildnachweis (bei CC-Lizenzen mit Lizenz)
export const THEMEN = [
  {
    id: 'geschaeftsfaehigkeit',
    titel: 'Geschäftsfähigkeit',
    stufe: 10,
    bereich: 'Recht',
    text: 'Döner, Handyvertrag, V-Bucks, Klarna: Welche Verträge darfst du schon allein abschließen? Mit Rechts-Navi, Fall-Akte, Live-Gericht für die ganze Klasse und der Mission Zwergspitz.',
    stichworte: ['§§ 104–113 BGB', 'Taschengeldparagraf', 'Live-Abstimmung', 'Lernraum'],
    bild: 'geschaeftsfaehigkeit/img/galerie.jpg',
    alt: 'Blick in die Goethe Galerie in Jena: Glasdach, Rolltreppen und Geschäfte auf mehreren Etagen',
    foto: 'Andreas Praefcke / Wikimedia Commons, CC BY 3.0'
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
