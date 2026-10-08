# Lernwerkstatt Magisches Sechseck

Interaktive Lernwerkstatt zum magischen Sechseck der Wirtschaftspolitik für die Oberstufe (Wirtschaft und Recht). Die Seite läuft komplett im Browser, ohne Anmeldung und ohne Installation.

**Inhalt**

- **Ziele:** alle sechs Ziele mit ihren Unterpunkten, Messgrößen und aktuellen Daten
- **Abwägen:** Zielharmonie, Zielkonflikt und Zielneutralität an Fallbeispielen
- **Planspiel „Sechseck-Leben“:** acht Figuren aus Thüringen und vier Jahre Wirtschaftspolitik (2026 bis 2029)
  - allein spielbar
  - oder als ganze Klasse im **Live-Klassenraum**
- **Wissen:** Glossar, Wissensspeicher und Selbsttests

## Seite veröffentlichen (GitHub Pages)

1. Im Repository auf **Settings → Pages** gehen.
2. Unter **Build and deployment** bei **Source** „Deploy from a branch“ wählen, dann Branch **main** und Ordner **/ (root)** wählen und speichern.
3. Nach ein bis zwei Minuten ist die Seite erreichbar unter
   `https://felixziesche.github.io/Magisches-Sechseck/`

Ohne weitere Einrichtung funktioniert schon alles außer dem Live-Klassenraum. Das Klassenspiel läuft dann mit Stimmkarten: Die Schüler halten ihre Wahl hoch, die Lehrkraft zählt am Beamer.

## Live-Klassenraum einrichten (einmalig, ca. 15 Minuten)

So funktioniert der Live-Klassenraum:

- Die Lehrkraft erstellt am Beamer einen Raum mit sechsstelligem Code und QR-Code.
- Die Schüler treten auf dem Handy bei, nur mit Code und Spitznamen, ohne Konto.
- Das Dashboard zeigt live, wer beigetreten ist und wer schon gelesen hat. Es zeigt außerdem, wie abgestimmt wurde, wie viele den Fachbegriff-Check richtig hatten und welche privaten Entscheidungen getroffen wurden.
- Am Ende zeigt es die Bilanz aller Schüler.

Dafür braucht die Seite eine kostenlose Datenbank bei Google Firebase.

### 1. Firebase-Projekt anlegen

1. Auf <https://console.firebase.google.com> mit einem Google-Konto anmelden (am besten einem Schul- oder Dienstkonto).
2. **Projekt hinzufügen**, einen Namen eingeben (z. B. `sechseck-klasse`). Google Analytics wird nicht gebraucht, also abschalten.
3. Der kostenlose Spark-Tarif reicht. Pro Tag sind 50.000 Lesevorgänge und 20.000 Schreibvorgänge frei. Eine Doppelstunde mit 30 Schülern braucht nur einen Bruchteil davon.

### 2. Datenbank erstellen

1. Links **Build → Firestore Database → Datenbank erstellen**.
2. Als Standort einen in Europa wählen: **eur3 (Europa)** oder **europe-west3 (Frankfurt)**. Der Standort lässt sich später nicht ändern.
3. **Im Produktionsmodus starten** wählen.

### 3. Anonyme Anmeldung einschalten

1. **Build → Authentication → Jetzt starten**.
2. Unter **Anmeldemethode** den Anbieter **Anonym** aktivieren und speichern.

Die Schüler merken davon nichts. Jedes Gerät bekommt im Hintergrund eine zufällige Kennung, damit jeder nur seinen eigenen Eintrag ändern kann.

### 4. Domain freigeben

**Authentication → Einstellungen → Autorisierte Domains → Domain hinzufügen**: `felixziesche.github.io`

### 5. Sicherheitsregeln veröffentlichen

1. **Firestore Database → Regeln**.
2. Den gesamten Inhalt durch den Inhalt der Datei [`firestore.rules`](firestore.rules) aus diesem Repository ersetzen.
3. **Veröffentlichen** klicken.

Die Regeln sorgen dafür:

- Nur das Gerät, das einen Raum erstellt hat, kann ihn steuern, die Schüler sehen und entfernen.
- Schüler schreiben nur ihren eigenen Eintrag und sehen die Einträge der anderen nicht.
- Räume lassen sich nicht auflisten. Ohne Code findet man nichts.

### 6. Web-App registrieren und Konfiguration eintragen

1. In der **Projektübersicht** auf das Symbol **</>** (Web) klicken, einen Namen eingeben und registrieren. Firebase Hosting wird nicht gebraucht.
2. Firebase zeigt einen Block `const firebaseConfig = { ... }`.
3. Im Repository die Datei [`js/firebase-config.js`](js/firebase-config.js) öffnen (auf GitHub: Stift-Symbol) und die Zeile `window.FIREBASE_CONFIG = null;` ersetzen durch:

   ```js
   window.FIREBASE_CONFIG = {
     apiKey: "…",
     authDomain: "….firebaseapp.com",
     projectId: "…",
     storageBucket: "….appspot.com",
     messagingSenderId: "…",
     appId: "…"
   };
   ```

4. Änderung committen. Nach ein bis zwei Minuten ist der Live-Klassenraum aktiv.

Der `apiKey` darf öffentlich im Repository stehen. Er ist nur eine Kennung des Projekts und kein Passwort. Geschützt werden die Daten durch die Sicherheitsregeln aus Schritt 5.

### 7. Optional: Daten automatisch löschen lassen

Jeder Raum und jeder Schülereintrag hat das Feld `expireAt` (24 Stunden nach dem Anlegen). Firestore kann solche Einträge automatisch löschen:

1. **Firestore Database → Time-to-live (TTL)** öffnen.
2. Eine Richtlinie für die Sammlungsgruppe `rooms` mit dem Feld `expireAt` anlegen.
3. Eine zweite Richtlinie für die Sammlungsgruppe `players` mit dem Feld `expireAt` anlegen.

Falls die Konsole dafür den Blaze-Tarif verlangt, kann der Schritt entfallen. Mit **„Raum beenden“** löscht die Lehrkraft alle Daten eines Raums ohnehin sofort.

## Im Unterricht

1. **Lehrkraft (Beamer):**
   1. **Planspiel** öffnen und **Lehrkraft (Beamer)** wählen.
   2. **Live-Klassenraum erstellen** klicken. Code und QR-Code erscheinen groß.
2. **Schüler (Handy):** QR-Code scannen oder die Seite öffnen und **Planspiel → Schüler** wählen. Danach Code und Spitznamen eingeben und die zugeteilte Figur wählen.
3. **Runde für Runde:**
   1. Ereignis am Beamer zeigen.
   2. Debatte aus Sicht der Figuren.
   3. Abstimmung auf den Handys, die Balken füllen sich live.
   4. **Beschluss verkünden**: Die Handys springen automatisch zum Ergebnis.
4. **Beamer-Modus:** blendet die Spitznamen aus und zeigt nur Figuren (z. B. „Mia 2“). Das ist sinnvoll, sobald das Dashboard für alle sichtbar ist.
5. **Entfernen:** Ein unpassender Spitzname lässt sich in der Teilnehmerliste mit ✕ entfernen.
6. **Raum beenden:** löscht den Raum und alle Schülerdaten sofort.

Die Lehrkraft sollte den Raum vom selben Gerät und Browser aus steuern, mit dem sie ihn erstellt hat. Neu laden ist kein Problem, der Raum bleibt erhalten.

## Datenschutz

- **Gespeicherte Daten:** Gespeichert werden nur ein frei gewählter Spitzname, die gewählte Figur und Spieldaten wie Stimmen, Antworten und Kontostand der Figur. Es gibt keine E-Mail-Adresse, kein Passwort und kein Konto.
- **Spitznamen:** Die Schüler sollten keinen vollen echten Namen verwenden. Die Seite weist darauf hin.
- **Speicherort und Dauer:** Die Daten liegen in Firebase (Google Ireland Ltd.) am gewählten europäischen Standort. Sie werden mit „Raum beenden“ gelöscht oder, falls eingerichtet, automatisch nach 24 Stunden.
- **Ohne Live-Klassenraum:** Einzelspiel, Wissensspeicher und Spielstände bleiben nur im Browser des jeweiligen Geräts (localStorage).
- **Externe Dienste:** Die Seite lädt Schriften und Symbole von Google Fonts, die QR-Code-Bibliothek von cdnjs und die Firebase-Bibliothek von gstatic.com. Dabei wird die IP-Adresse an diese Dienste übertragen.
- **Abstimmung mit der Schule:** Bitte vor dem Einsatz mit dem Datenschutzbeauftragten der Schule abstimmen. Je nach Bundesland und Schule kann ein Eintrag ins Verzeichnis der Verarbeitungstätigkeiten nötig sein.

## Lokal ansehen

Die Seite lädt Module und muss deshalb über einen kleinen Webserver geöffnet werden, nicht per Doppelklick:

```bash
python3 -m http.server 8000
# dann http://localhost:8000 im Browser öffnen
```

Für den Live-Klassenraum lokal unter **Autorisierte Domains** auch `localhost` eintragen (ist meist schon vorhanden).

## Aufbau

| Datei | Inhalt |
| --- | --- |
| `index.html` | Seitengerüst mit Navigation |
| `css/app.css` | Gestaltung nach Material Design 3 |
| `js/app.js` | Lernwerkstatt, Werkzeuge und Planspiel |
| `js/live.js` | Verbindung zu Firebase (Raum erstellen, beitreten, live mitlesen) |
| `js/firebase-config.js` | Firebase-Zugangsdaten (siehe oben) |
| `firestore.rules` | Sicherheitsregeln für die Datenbank |
| `img/` | Fotos der Szenen und Ziele |

## Bildnachweise

Alle Fotos stammen von [Unsplash](https://unsplash.com) und stehen unter der [Unsplash-Lizenz](https://unsplash.com/license).

- **Szenen:**
  - Tankstelle: engin akyurt
  - Containerschiff im Hamburger Hafen: Jacob Meissner
  - Jena mit JenTower: Lukas D.
  - Trockenes Feld: Md. Hasanuzzaman Himel
- **Ziele:**
  - Preisniveaustabilität: Yosuke Ota
  - Beschäftigung: Remy Gieling
  - Wachstum: Artem Labunsky
  - Außenwirtschaft: Wolfgang Weiser
  - Umwelt: Karsten Würth
  - Verteilung: Marcel Strauß

Die Figuren sind eigene Illustrationen. Die Idee der Lernwerkstatt ist angelehnt an die Lernwerkstätten von Steve Wagner (steve-wagner.de).
