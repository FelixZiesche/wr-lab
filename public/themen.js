// Alle Themen im WR-Lab. Die Startseite zeigt sie als Karten, nach Klassenstufe sortiert.
// Neues Thema: Ordner anlegen, hier eintragen (siehe README, Abschnitt „Neues Thema hinzufügen“).
//   id:     Ordnername, nur Kleinbuchstaben, Ziffern und Bindestrich (wird auch im Live-Raum gespeichert)
//   stufe:  Klassenstufe nach dem Thüringer Lehrplan: 9, 10, 11 oder 12. Innerhalb einer Stufe gilt
//           die Reihenfolge dieser Liste, am besten die des Lehrplans.
//   bild:   Foto im Themenordner, Seitenverhältnis etwa 16:9; foto: Bildnachweis
export const THEMEN = [
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
