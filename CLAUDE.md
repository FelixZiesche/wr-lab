# WR-Lab – Standards für jede Sitzung

WR-Lab ist eine Website mit interaktiven Lernwerkstätten für **Wirtschaft und Recht in den Klassenstufen 9 bis 12 in Thüringen**. Sie wird über **Firebase Hosting** veröffentlicht (Projekt-ID `wr-lab`). Der Lernraum (Live-Klassenraum) nutzt Firestore und die anonyme Anmeldung. Diese Regeln gelten für jede Änderung, auch für kleine.

## Aufbau

```
public/                 nur dieser Ordner wird veröffentlicht
  index.html, start.js  Startseite mit Themenkarten
  themen.js             Liste aller Themen mit Klassenstufe (Startseite, Hinweis bei fremden Raumcodes)
  shared/               gemeinsam für alle Themen
    css/m3.css          Material Design 3: Farbrollen, Typografie, Komponenten, App-Shell
    js/ui.js            Hilfsfunktionen, Foto mit Infopunkten
    js/werkstatt.js     Gerüst einer Lernwerkstatt (Navigation, Werkstätten, Erkenntnisse, Glossar, Lehrerpanel)
    js/lernraum.js      Lernraum: ein Live-Raum pro Thema für Werkstätten und Planspiel, Lehrkraft-Dashboard
    js/aufgaben.js      Aufgaben-Bausteine: Schreibfeld „an die Wand“, Zuordnen, Lückentext, Test, Hilfen, Impuls
    js/planspiel.js     Planspiel-Grundmechanik (Runden, Abstimmung, Dashboard, Beamer-Modus)
    js/live.js          Verbindung zum Server – die EINZIGE Datei, die Firebase kennt
    vendor/             selbst ausgelieferte Bibliotheken (QR-Code)
  <thema>/              ein Ordner pro Thema, z. B. sechseck/
firestore.rules         Sicherheitsregeln für alle Themen
tests/                  Playwright-Tests und Regeltests (laufen gegen den Firebase-Emulator)
.github/workflows/      Tests, Veröffentlichung (main) und Vorschau (Pull Requests)
```

Befehle: `npm ci` (einmalig), `npm run dev` (lokale Seite mit Emulator auf http://127.0.0.1:5000), `npm test` (alle Tests, braucht Java 21).

## Arbeitsweise

- **Erst der Plan, dann bauen:** Vor einem neuen Thema oder einer größeren Änderung den Plan kurz vorstellen und auf die Freigabe der Lehrkraft warten. Der Plan nennt Klassenstufe, Aufbau (Werkstätten oder Lektionen), Planspiel ja oder nein und neue Bausteine in `shared/`. Kleine Korrekturen direkt umsetzen.
- **Lehrplan:** Lernbereich und Ziele aus dem Thüringer Lehrplan gibt die Lehrkraft vor, denn das Schulportal blockiert automatische Abrufe. Fehlt die Angabe, nachfragen statt raten.
- **Pushen:** Ist `npm test` grün, direkt auf den Arbeitsbranch pushen, ohne nachzufragen.
- **Veröffentlichen:** Pull Request nach `main` öffnen, er bekommt eine Vorschau-Adresse. Erst der Merge veröffentlicht auf https://wr-lab.web.app. Gemergt wird nur, wenn die Lehrkraft es sagt.
- **Geheime Schlüssel** trägt die Lehrkraft selbst in GitHub ein. Nie im Chat danach fragen.

## Sprache und Inhalte

- **Deutsch.** Schüler werden mit „du“ oder „ihr“ angesprochen.
- **Nie gendern:** kein Sternchen, kein Doppelpunkt, kein Binnen-I, keine Doppelnennung wie „Schülerinnen und Schüler“. Geschrieben wird „die Schüler“, „die Lehrkraft“, „die Verbraucher“.
- **Nie „SuS“** – immer „Schüler“ ausschreiben.
- **Schülernah für 15- bis 19-Jährige:** kurze Sätze und konkrete Beispiele aus ihrem Alltag (Ausbildungsvergütung, Handyvertrag, Deutschlandticket, Führerschein, erster Job, Streaming).
- **Abwechslungsreich und faszinierend:** Jedes Thema soll die Schüler packen und neugierig machen.
  - Aufgabenformen abwechseln: rechnen, schieben, zuordnen, abstimmen, entscheiden, an die Wand schreiben, Planspiel. Zwei Werkstätten nacheinander haben möglichst nie dieselbe Form.
  - Mit etwas Überraschendem einsteigen: eine verblüffende Zahl, ein Rätsel, ein Fall mit offenem Ende, „Was würdest du tun?“.
  - Lieber ausprobieren lassen als erklären: Die Schüler treffen Entscheidungen und sehen die Folgen.
- **Aktuelle virale Inhalte:** Trends, Memes, Jugendwörter, Social-Media-Formate und Ereignisse, über die gerade alle reden. Sie müssen sachlich richtig eingesetzt werden. Erfundene Posts tragen den Hinweis „fiktiver Beitrag“, erfundene Szenarien den Hinweis „Szenario“.
- **Regionalbezug:** Beispiele, Figuren, Orte und Fotos möglichst aus Apolda, Jena, Weimar, Erfurt oder anderswo in Thüringen.
- **Daten mit Stand und Quelle:** Zahlen gerundet, mit Monat und Jahr. Die Quelle steht in der Quellenliste des Themas, z. B. Destatis, Bundesagentur für Arbeit, Thüringer Landesamt für Statistik oder Gesetzestexte.
- **Die Seite richtet sich an Schüler.** Keine Kästen oder Hinweise „Für die Lehrkraft“ in Werkstätten und Planspielen. Didaktische Hinweise, Lösungen und Erwartungshorizonte gehören ausschließlich ins **Lehrerpanel** (`hinweise` einer Werkstatt, `erwartung` eines Schreibfelds). Das sieht nur die Lehrkraft, die den Lernraum geöffnet hat, und nicht im Beamer-Modus. Funktionen für die Lehrkraft (Lernraum-Dashboard, Lehrkraft-Modus im Planspiel) bleiben erlaubt.
- **Klassenstufen:** Jedes Thema gehört zu einer Klassenstufe: 9, 10, 11 oder 12 (Feld `stufe` in `themen.js`). Die Startseite sortiert die Themen danach. Sprache, Tempo und Anspruch passen zur Stufe: in Klasse 9 kürzere Texte und mehr Hilfen, in Klasse 11 und 12 mit Blick auf das Abitur.
- **Lehrplanbezug:** Klassenstufe und Lernbereich im Thüringer Lehrplan Wirtschaft und Recht stehen in der README in der Themenübersicht.

## Design: Material Design 3

- Nur `public/shared/css/m3.css` benutzen und dort erweitern. Komponenten bekommen keine eigenen Kopien.
- **Farben nur über M3-Farbrollen**, z. B. `--md-primary`, `--md-on-primary`, `--md-primary-container`, `--md-surface-container`, `--md-on-surface-variant`, `--md-outline-variant`. Komponenten enthalten keine festen Hex-Farben.
  - Themenfarben, z. B. die Zielfarben des Sechsecks, sind M3 Custom Colors: harmonisiert mit der Primärfarbe, mit `on-`- und `container`-Rollen, für hell und dunkel. Sie stehen in der CSS-Datei des Themas.
- **Schrift:** Google Sans, für Codes Google Sans Code. Größen nach der M3-Typoskala: `.title-l`, `.body-m`, `.label-m` usw.
- **Icons ausschließlich Material Symbols Rounded** (`<span class="ms">name</span>`). Keine Emojis als Icons, keine anderen Icon-Bibliotheken, keine selbst gezeichneten Icon-SVGs. Jedes neue Icon in `icon_names` der Font-URL im `<head>` eintragen, alphabetisch sortiert, sonst fehlt es.
- **WCAG 2.2 AA:**
  - Kontrast: Text mindestens 4,5:1, großer Text und Bedienelemente mindestens 3:1.
  - Alles muss per Tastatur bedienbar sein, mit sichtbarem Fokus.
  - Icon-Buttons haben ein `aria-label`, Bilder einen aussagekräftigen `alt`-Text.
  - Klickflächen mindestens 24 × 24 px, besser 40–48 px.
  - `prefers-reduced-motion` wird beachtet.
  - Der Dunkelmodus funktioniert.
- **Layout:** Navigation Rail ab 600 px, darunter Navigation Bar. Jede Ansicht prüfen bei 390 px (Handy) und 1280 px (Beamer), jeweils hell und dunkel.

## Lernraum und Aufgaben

- **Ein Raum pro Stunde und Thema:** Die Lehrkraft öffnet ihn über das Symbol „Lernraum“ (`cast_for_education`) oder im Planspiel. Schüler treten mit Code oder QR-Code (`#raum=CODE`, im Planspiel `#join=CODE`) und **Spitzname** bei. Keine PIN, keine Tier- oder Farbkennungen.
- **Dashboard der Lehrkraft:** Teilnehmer und ihr aktueller Ort, „Alle anhalten“, „Alle holen nach …“, Werkstätten freigeben oder sperren, Beamer-Modus (keine Spitznamen, kein Lehrerpanel), Antworten drucken, Raum beenden.
- **Antworten „an die Wand“** kommen nur aus `schreibfeld()`. Sie liegen in `rooms/{code}/antworten`, sind höchstens 1000 Zeichen lang und nur für die Lehrkraft lesbar. „Raum beenden“ löscht sie.
- **Bausteine aus `shared/js/aufgaben.js`** statt eigener Formulare benutzen. Die Schnittstelle steht oben in der Datei. IDs der Aufgaben: Kleinbuchstaben, Ziffern, Bindestrich, eindeutig im Thema (z. B. `preis-wand`).

## Muster für künftige Themen: Lernstrecke

Für das nächste neue Thema ist (noch nicht umgesetzt) eine **Lernstrecke** geplant, angelehnt an die Methode der Lernwerkstätten von Steve Wagner (steve-wagner.de). Übernommen werden nur Idee und Aufbau. Code, Texte und Bilder von dort sind geschützt und werden nie kopiert.

- **Übersichtsseite:** Leitfrage, „Was ihr danach könnt“ (Lernziele), zwei Wege (allein oder im Lernraum), Lektionsplan (zeigt im Lernraum, wo die Klasse steht), Tafelbild der ganzen Reihe, Datenschutz.
- **Lektionen** als eigene Ansichten, immer im selben Rhythmus:
  1. **Der Fall:** Alltagsszene aus der Lebenswelt, erste Vermutung an die Wand
  2. **Entdecken:** interaktives Tafelbild oder Diagramm
  3. **Sichern:** Merksatz und Hefteintrag als Lückentext
  4. **Anwenden:** neuer Fall, Antwort an die Wand, Gesprächsimpuls
- Pro Station Sozialform (Einzelarbeit, mit der Klasse) und gestufte Hilfen (Satzanfänge, Tipp, Denk weiter).
- Die Leitfrage wird in Lektion 1 gestellt und in der letzten Lektion beantwortet, mit Blick zurück auf die eigene Vermutung. Am Ende ein Test mit einem Versuch.
- Bausteine dafür gibt es schon (`aufgaben.js`, Lernraum). Neu zu bauen wären die Übersichtsseite und die Lektionsnavigation in `shared/`.

## Bilder

- **Echte Fotos**, keine KI-Bilder, mit freier Lizenz: Unsplash, Pexels oder Wikimedia Commons (CC BY / CC BY-SA / CC0). Motive möglichst aus Thüringen.
- **Jedes Foto hat einen Bildnachweis an drei Stellen:**
  1. direkt am Bild (`<figcaption>Foto: Name / Quelle</figcaption>`)
  2. in der Quellenliste des Themas
  3. in der README unter „Bildnachweise“
  - Bei CC-Lizenzen zusätzlich Lizenz und Link angeben.
- JPG, höchstens 1600 px breit, möglichst unter 250 KB. Ablage im Ordner `img/` des Themas.
- Figuren und Diagramme dürfen eigene SVG-Illustrationen sein.

## Technik

- **Kein Build-Schritt:** HTML, CSS und ES-Module direkt. Externe Bibliotheken nur, wenn nötig, und dann selbst in `shared/vendor/` ausliefern (mit Lizenzkopf). Ausnahmen: Google Fonts und das Firebase-SDK von gstatic.com.
- **Firebase nur in `shared/js/live.js`.** Die Schnittstelle oben in der Datei darf nicht brechen, denn so bleibt Firebase austauschbar. Die Zugangsdaten kommen automatisch von `/__/firebase/init.json`; Schlüssel gehören nie in den Code.
- **Was mehrere Themen brauchen, gehört nach `shared/`.** Inhalte bleiben im Themenordner. Der Code eines Themas importiert nur aus `shared/` und dem eigenen Ordner.
- **Code-Stil:** wie der vorhandene Code (kompakt, Kommentare auf Deutsch, Bezeichner wie im Umfeld).
- **localStorage:** Schlüssel mit Präfix des Themas (Sechseck: `ms6-…`). Vorhandene Schlüssel nie umbenennen, sonst gehen Spielstände verloren.
- **Firestore:** Jedes neue oder geänderte Feld in `live.js`, `lernraum.js` oder `planspiel.js` muss auch in `firestore.rules` und `tests/rules.test.mjs` nachgezogen werden.
- **Firebase-SDK-Version** steht an drei Stellen, die immer zusammen geändert werden: `shared/js/live.js`, `package.json` (`firebase`) und `tests/helpers.mjs`.
- **Vor jedem Commit muss `npm test` grün sein.** Bei Änderungen an der Darstellung Screenshots prüfen: Handy und Beamer, hell und dunkel.
- **Datenschutz:**
  - keine Klarnamen, keine Konten, keine Tracker oder Statistikdienste
  - keine neuen externen Dienste ohne Rücksprache
  - Live-Daten nur so lange wie nötig: `expireAt` nach 24 Stunden, „Raum beenden“ löscht sofort

## Checkliste: neues Themenmodul

1. **Ordner** `public/<id>/` anlegen. Die `id` besteht aus Kleinbuchstaben, Ziffern und Bindestrich, z. B. `kaufvertrag`. Sie ist zugleich das Thema im Live-Raum.
2. **`index.html`** von `public/sechseck/index.html` kopieren und anpassen:
   - Titel, Beschreibung, Favicon
   - `icon_names` (alle verwendeten Icons, alphabetisch)
   - eigene CSS-Datei und eigenes Modul (`<script type="module" src="<id>.js">`)
   - `../shared/vendor/qrcode.js` nur einbinden, wenn das Thema ein Planspiel hat
3. **`<id>.css`:** nur Themenfarben (M3 Custom Colors, hell und dunkel) und themeneigene Grafiken.
4. **`<id>.js`:** `createWerkstatt({...})` aus `shared/js/werkstatt.js` aufrufen mit `thema` (die `id`), `speicher` (neues Präfix), `logo`, `bereiche` (mit `kurz` für den Handy-Titel der Startansicht), `kapitel`, `merksaetze`, `wissenTitel`, `glossar` und `punkte`. Beispiel: `sechseck/sechseck.js`.
   - Werkstätten mit `tool({id, ch, title, sub, hinweise, html(), init(root)})` anlegen.
   - Jede Werkstatt hat einen Auftrag (`<p class="task">`), eine Frage an die Wand (`schreibfeld` mit Satzanfängen und `erwartung`) mit Gesprächsimpuls (`impuls`) und eine Erkenntnis (`erkHTML` / `bindErk`).
   - Hinweise für die Lehrkraft stehen in `hinweise`, nie im HTML der Werkstatt. Beispiel: `sechseck/wand.js`.
5. **Planspiel (optional):** Inhalte in eine eigene Datei nach dem Muster von `sechseck/leben.js`.
   - Die Schnittstelle steht oben in `shared/js/planspiel.js`.
   - `thema` ist die Ordner-`id`. Pro Runde gibt es die Optionen A, B und C.
   - Figuren-IDs folgen demselben Muster wie die `id` (höchstens 24 Zeichen). Spitznamen statt echter Namen.
   - Der Bereich mit dem Planspiel bekommt in `bereiche` den Eintrag `tool: '<werkstatt-id>'`.
   - Für Beitrittslinks `hash: h => { const c = joinHash(h); if (c) { setPendingJoin(c); return '<bereich>'; } }` setzen.
6. **Inhalte prüfen:**
   - nie gendern, kein „SuS“
   - schülernah, mit aktuellen Anlässen und Regionalbezug
   - abwechslungsreich: Aufgabenformen wechseln, Einstieg mit Überraschung
   - Anspruch passend zur Klassenstufe
   - Daten mit Stand und Quelle, Lehrplanbezug in der README
   - keine Hinweise „Für die Lehrkraft“ auf der Seite
7. **Fotos** in `img/` mit Bildnachweis am Bild, in der Quellenliste und in der README.
8. **Startseite:** Eintrag in `public/themen.js` mit `id`, `titel`, `stufe` (9, 10, 11 oder 12), `bereich`, `text`, `stichworte`, `bild`, `alt` und `foto`.
9. **Tests:** `tests/<id>.spec.mjs` nach dem Muster der Sechseck-Tests:
   - Navigation
   - alle Werkstätten öffnen
   - Planspiel allein und live, falls vorhanden
   - Lernraum: eine Antwort an die Wand schicken, Lehrerpanel nur bei der Lehrkraft (Muster: `tests/lernraum.spec.mjs`)
10. **README:** Thema mit Klassenstufe und Lehrplanbezug in der Übersicht ergänzen und Bildnachweise eintragen.
11. **Abschluss:** `npm test` muss grün sein. Danach Screenshots prüfen (390 px und 1280 px, hell und dunkel) und erst dann committen.
