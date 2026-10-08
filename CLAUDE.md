# WR-Lab – Standards für jede Sitzung

WR-Lab ist eine Website mit interaktiven Lernwerkstätten für **Wirtschaft und Recht in der Oberstufe in Thüringen**. Sie wird über **Firebase Hosting** veröffentlicht (Projekt-ID `wr-lab`). Der Live-Klassenraum nutzt Firestore und die anonyme Anmeldung. Diese Regeln gelten für jede Änderung, auch für kleine.

## Aufbau

```
public/                 nur dieser Ordner wird veröffentlicht
  index.html, start.js  Startseite mit Themenkarten
  themen.js             Liste aller Themen (Startseite, Hinweis bei fremden Raumcodes)
  shared/               gemeinsam für alle Themen
    css/m3.css          Material Design 3: Farbrollen, Typografie, Komponenten, App-Shell
    js/ui.js            Hilfsfunktionen, Foto mit Infopunkten
    js/werkstatt.js     Gerüst einer Lernwerkstatt (Navigation, Werkstätten, Erkenntnisse, Glossar)
    js/planspiel.js     Planspiel-Grundmechanik (Runden, Abstimmung, Dashboard, Beamer-Modus)
    js/live.js          Live-Klassenraum – die EINZIGE Datei, die Firebase kennt
    vendor/             selbst ausgelieferte Bibliotheken (QR-Code)
  <thema>/              ein Ordner pro Thema, z. B. sechseck/
firestore.rules         Sicherheitsregeln für alle Themen
tests/                  Playwright-Tests und Regeltests (laufen gegen den Firebase-Emulator)
.github/workflows/      Tests, Veröffentlichung (main) und Vorschau (Pull Requests)
```

Befehle: `npm ci` (einmalig), `npm run dev` (lokale Seite mit Emulator auf http://127.0.0.1:5000), `npm test` (alle Tests, braucht Java 21).

## Sprache und Inhalte

- **Deutsch.** Schüler werden mit „du“ oder „ihr“ angesprochen.
- **Nie gendern:** kein Sternchen, kein Doppelpunkt, kein Binnen-I, keine Doppelnennung wie „Schülerinnen und Schüler“. Geschrieben wird „die Schüler“, „die Lehrkraft“, „die Verbraucher“.
- **Nie „SuS“** – immer „Schüler“ ausschreiben.
- **Schülernah für 15- bis 19-Jährige:** kurze Sätze und konkrete Beispiele aus ihrem Alltag (Ausbildungsvergütung, Handyvertrag, Deutschlandticket, Führerschein, erster Job, Streaming).
- **Aktuelle virale Inhalte:** Trends, Memes, Jugendwörter, Social-Media-Formate und Ereignisse, über die gerade alle reden. Sie müssen sachlich richtig eingesetzt werden. Erfundene Posts tragen den Hinweis „fiktiver Beitrag“, erfundene Szenarien den Hinweis „Szenario“.
- **Regionalbezug:** Beispiele, Figuren, Orte und Fotos möglichst aus Apolda, Jena, Weimar, Erfurt oder anderswo in Thüringen.
- **Daten mit Stand und Quelle:** Zahlen gerundet, mit Monat und Jahr. Die Quelle steht in der Quellenliste des Themas, z. B. Destatis, Bundesagentur für Arbeit, Thüringer Landesamt für Statistik oder Gesetzestexte.
- **Die Seite richtet sich an Schüler.** Keine Kästen oder Hinweise „Für die Lehrkraft“ in Werkstätten und Planspielen. Funktionen für die Lehrkraft (z. B. der Lehrkraft-Modus im Planspiel) bleiben erlaubt.
- **Lehrplanbezug:** Der Thüringer Lehrplan Wirtschaft und Recht (Oberstufe) steht in der README in der Themenübersicht.

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
- **Firestore:** Jedes neue oder geänderte Feld in `live.js` oder `planspiel.js` muss auch in `firestore.rules` und `tests/rules.test.mjs` nachgezogen werden.
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
4. **`<id>.js`:** `createWerkstatt({...})` aus `shared/js/werkstatt.js` aufrufen mit `speicher` (neues Präfix), `logo`, `bereiche`, `kapitel`, `merksaetze`, `wissenTitel`, `glossar` und `punkte`. Beispiel: `sechseck/sechseck.js`.
   - Werkstätten mit `tool({id, ch, title, sub, html(), init(root)})` anlegen.
   - Jede Werkstatt hat einen Auftrag (`<p class="task">`) und eine Erkenntnis (`erkHTML` / `bindErk`).
5. **Planspiel (optional):** Inhalte in eine eigene Datei nach dem Muster von `sechseck/leben.js`.
   - Die Schnittstelle steht oben in `shared/js/planspiel.js`.
   - `thema` ist die Ordner-`id`. Pro Runde gibt es die Optionen A, B und C.
   - Figuren-IDs folgen demselben Muster wie die `id` (höchstens 24 Zeichen). Spitznamen statt echter Namen.
   - Der Bereich mit dem Planspiel bekommt in `bereiche` den Eintrag `tool: '<werkstatt-id>'`.
   - Für Beitrittslinks `hash: h => { const c = joinHash(h); if (c) { setPendingJoin(c); return '<bereich>'; } }` setzen.
6. **Inhalte prüfen:**
   - nie gendern, kein „SuS“
   - schülernah, mit aktuellen Anlässen und Regionalbezug
   - Daten mit Stand und Quelle, Lehrplanbezug in der README
   - keine Hinweise „Für die Lehrkraft“ auf der Seite
7. **Fotos** in `img/` mit Bildnachweis am Bild, in der Quellenliste und in der README.
8. **Startseite:** Eintrag in `public/themen.js` mit `id`, `titel`, `bereich`, `text`, `stichworte`, `bild`, `alt` und `foto`.
9. **Tests:** `tests/<id>.spec.mjs` nach dem Muster der Sechseck-Tests:
   - Navigation
   - alle Werkstätten öffnen
   - Planspiel allein und live, falls vorhanden
10. **README:** Thema in der Übersicht ergänzen und Bildnachweise eintragen.
11. **Abschluss:** `npm test` muss grün sein. Danach Screenshots prüfen (390 px und 1280 px, hell und dunkel) und erst dann committen.
