# WR-Lab

Interaktive Lernwerkstätten für **Wirtschaft und Recht in den Klassen 9 bis 12** (Thüringen). Die Seite läuft im Browser, ohne Anmeldung und ohne Installation: am Handy, am Tablet und am Beamer. Alles lässt sich allein bearbeiten oder als ganze Klasse im **Lernraum**: Die Lehrkraft öffnet einen Raum, die Schüler treten mit Code oder QR-Code bei, schicken Antworten an die Wand und spielen das Planspiel gemeinsam.

Adresse nach der Einrichtung: **https://wr-lab.web.app**

## Themen

Die Startseite zeigt die Themen nach Klassenstufe sortiert: Klasse 9, 10, 11 und 12.

| Klasse | Thema | Inhalt | Lehrplan Thüringen |
| --- | --- | --- | --- |
| 11 | [Magisches Sechseck](public/sechseck/) | Sechs Ziele der Wirtschaftspolitik messen, Zielkonflikte aufdecken, Politik simulieren und im Planspiel „Sechseck-Leben“ vier Jahre Wirtschaftspolitik für acht Figuren aus Thüringen entscheiden. Zu jeder Werkstatt eine Frage an die Wand, dazu Glossar, Wissensspeicher, Hefteintrag mit Kurztest und ein Wissenscheck mit 31 Aufgaben in drei Stufen. | *noch ergänzen* |

## Aufbau

```
public/                 wird veröffentlicht
  index.html, start.js  Startseite mit Themenkarten
  themen.js             Liste aller Themen mit Klassenstufe
  shared/               gemeinsam für alle Themen
    css/m3.css          Material Design 3 (Farbrollen, Google Sans, Komponenten, App-Shell)
    js/ui.js            Hilfsfunktionen, Foto mit Infopunkten
    js/werkstatt.js     App-Navigation und Gerüst einer Lernwerkstatt, Lehrerpanel
    js/lernraum.js      Lernraum: ein Live-Raum für Werkstätten und Planspiel, Dashboard der Lehrkraft
    js/aufgaben.js      Aufgaben-Bausteine: Schreibfeld an die Wand, Zuordnen, Lückentext, Test, Wissenscheck, Hilfen, Impuls
    js/feedback.js      Feedback ohne KI für den Wissenscheck
    js/planspiel.js     Planspiel-Grundmechanik: Runden, Abstimmung, Lehrkraft-Dashboard, Beamer-Modus
    js/live.js          Verbindung zum Server (einzige Datei mit Firebase)
    vendor/qrcode.js    QR-Code-Bibliothek (MIT-Lizenz)
  sechseck/             Lernwerkstatt Magisches Sechseck
    sechseck.js         Werkstätten, Wissen, Navigation
    leben.js            Planspiel Sechseck-Leben (Figuren, Runden, Rechenmodell)
    daten.js            Grunddaten und Sechseck-Grafiken
    wand.js             Fragen an die Wand, Gesprächsimpulse, Hinweise für das Lehrerpanel
    wissenscheck.js     Wissenscheck: Aufgaben in drei Stufen mit Erwartungshorizont
    img/                Fotos
firestore.rules         Sicherheitsregeln der Datenbank
firebase.json           Hosting, Firestore-Regeln, Emulatoren
tests/                  Playwright-Tests und Regeltests
.github/workflows/      Tests, Veröffentlichung und Vorschau
CLAUDE.md               Standards und Checkliste für neue Themen
```

## Firebase einrichten (einmalig, ca. 20 Minuten)

Das Firebase-Projekt `wr-lab` ist schon angelegt. Der kostenlose Spark-Tarif reicht: Pro Tag sind 50.000 Lese- und 20.000 Schreibvorgänge frei, eine Doppelstunde mit 30 Schülern braucht nur einen Bruchteil davon. Alle Schritte in der [Firebase-Konsole](https://console.firebase.google.com/project/wr-lab):

### 1. Datenbank erstellen

1. **Build → Firestore Database → Datenbank erstellen.**
2. Als Standort **eur3 (Europa)** wählen. Der Standort lässt sich später nicht mehr ändern.
3. **Im Produktionsmodus starten.** Die richtigen Regeln kommen bei der ersten Veröffentlichung automatisch aus `firestore.rules`.

### 2. Anonyme Anmeldung einschalten

1. **Build → Authentication → Jetzt starten.**
2. Unter **Anmeldemethode** den Anbieter **Anonym** aktivieren und speichern.

Die Schüler merken davon nichts. Jedes Gerät bekommt im Hintergrund eine zufällige Kennung, damit jeder nur seinen eigenen Eintrag ändern kann.

### 3. Web-App registrieren und Hosting verknüpfen

1. In der **Projektübersicht** auf **App hinzufügen → Web** (Symbol `</>`) klicken.
2. Name `WR-Lab` eingeben und **„Firebase Hosting für diese App einrichten“** ankreuzen, die Site `wr-lab` auswählen, dann **App registrieren**.
3. Die angezeigten Befehle (SDK installieren, CLI, `firebase init`) überspringen. Alles ist schon im Repository.

Damit kennt Firebase Hosting die Zugangsdaten der Web-App und liefert sie unter `/__/firebase/init.json` an die Seite aus. Du musst nichts von Hand eintragen. Der `apiKey` darin ist kein Passwort, sondern nur eine Kennung des Projekts. Die Daten schützen die Sicherheitsregeln.

### 4. GitHub mit Firebase verbinden

GitHub braucht einen Zugang, um die Seite und die Regeln zu veröffentlichen. Dafür legst du ein **Dienstkonto** an und hinterlegst seinen Schlüssel als **Secret** in GitHub. Den Schlüssel bekommt niemand außer GitHub zu sehen.

**a) Dienstkonto anlegen**

1. Die [Dienstkonten von wr-lab](https://console.cloud.google.com/iam-admin/serviceaccounts?project=wr-lab) in der Google Cloud Console öffnen (gleiches Google-Konto wie bei Firebase).
2. **Dienstkonto erstellen**: Name `github-deploy`, Beschreibung „Veröffentlichung aus GitHub Actions“, dann **Erstellen und fortfahren**.
3. Diese vier Rollen hinzufügen (jeweils **Weitere Rolle hinzufügen**, im Suchfeld den englischen Namen eingeben):
   - **Firebase Hosting Admin**: Seite und Vorschauen veröffentlichen
   - **Firebase Rules Admin**: Firestore-Regeln veröffentlichen
   - **Service Usage Consumer**: prüfen, ob die nötigen Dienste eingeschaltet sind
   - **API Keys Viewer**: Zugangsdaten der Web-App lesen
4. **Fertig** klicken. Das Dienstkonto bekommt bewusst keinen Zugriff auf die Daten der Schüler.

**b) Schlüssel erzeugen**

1. In der Liste auf `github-deploy@wr-lab.iam.gserviceaccount.com` klicken, dann Reiter **Schlüssel**.
2. **Schlüssel hinzufügen → Neuen Schlüssel erstellen → JSON → Erstellen.** Eine Datei wird heruntergeladen. Behandle sie wie ein Passwort.

Meldet die Konsole, dass das Erstellen von Schlüsseln deaktiviert ist, liegt das an einer Richtlinie deiner Organisation. Das ist bei Schulkonten in Google Workspace häufig. Dann entweder das Firebase-Projekt mit einem privaten Google-Konto verwalten oder die Verbindung ohne Schlüssel über „Workload Identity Federation“ einrichten (siehe [google-github-actions/auth](https://github.com/google-github-actions/auth)).

**c) Secret in GitHub eintragen**

1. Im Repository auf GitHub: **Settings → Secrets and variables → Actions → New repository secret.**
2. Name: `FIREBASE_SERVICE_ACCOUNT_WR_LAB`
3. Secret: die heruntergeladene JSON-Datei mit einem Texteditor öffnen, den **gesamten Inhalt** kopieren und einfügen. **Add secret** klicken.
4. Die JSON-Datei vom Computer löschen und den Papierkorb leeren.

**d) Ausprobieren**

Unter **Actions → Veröffentlichen → Run workflow** (Branch `main`) die erste Veröffentlichung starten. Nach drei bis fünf Minuten ist die Seite unter https://wr-lab.web.app erreichbar. Fehlt das Secret, laufen die Tests trotzdem, die Veröffentlichung wird mit einer Warnung übersprungen.

### 5. Optional: Daten automatisch löschen lassen

Jeder Raum, jeder Schülereintrag und jede Antwort hat das Feld `expireAt` (24 Stunden nach dem Anlegen). Firestore kann solche Einträge automatisch löschen:

1. **Firestore Database → Time-to-live (TTL)** öffnen.
2. Je eine Richtlinie mit dem Feld `expireAt` für die Sammlungsgruppen `rooms`, `players` und `antworten` anlegen.

Falls die Konsole dafür den Blaze-Tarif verlangt, kann der Schritt entfallen. Mit **„Raum beenden“** löscht die Lehrkraft alle Daten eines Raums ohnehin sofort.

## Veröffentlichung

| Was du tust | Was passiert |
| --- | --- |
| Push oder Merge auf `main` | Workflow **Veröffentlichen**: Zuerst laufen alle Tests. Wenn sie grün sind, werden Seite und Firestore-Regeln veröffentlicht. |
| Pull Request öffnen oder aktualisieren | Workflow **Vorschau**: Zuerst laufen die Tests, dann bekommt der Pull Request eine eigene Vorschau-Adresse (7 Tage gültig) als Kommentar. |
| Actions → Veröffentlichen → Run workflow | Veröffentlicht den aktuellen Stand von `main` von Hand. |

- **Vorschau:** Die Vorschau nutzt die echte Datenbank mit den Regeln von `main`. Neue Regeln aus einem Pull Request gelten erst nach dem Merge.
- **Zurück zu einer alten Version:** In der Firebase-Konsole unter **Hosting → Versionsverlauf** bei einer älteren Version **Rollback** wählen.

## Eigene Domain

1. In der Firebase-Konsole **Hosting → Benutzerdefinierte Domain hinzufügen** wählen und die Domain eingeben, z. B. `wr-lab.de` oder `lernen.meine-schule.de`.
2. Firebase zeigt DNS-Einträge an: erst einen TXT-Eintrag zur Bestätigung, dann A-Einträge (oder einen CNAME bei Subdomains). Diese beim Anbieter der Domain eintragen, z. B. bei IONOS, Strato oder All-Inkl.
3. Warten, bis der Status **Verbunden** zeigt. Das dauert wenige Minuten bis 24 Stunden, das SSL-Zertifikat kommt automatisch.
4. **Authentication → Einstellungen → Autorisierte Domains → Domain hinzufügen**, damit der Lernraum auch unter der neuen Domain funktioniert. `wr-lab.web.app` und `wr-lab.firebaseapp.com` sind schon eingetragen.

QR-Codes und Beitrittslinks nutzen automatisch die Adresse, unter der die Seite gerade geöffnet ist.

## Neues Thema hinzufügen

Kurzfassung (die vollständige Checkliste steht in [CLAUDE.md](CLAUDE.md)):

1. Ordner `public/<id>/` anlegen, z. B. `public/kaufvertrag/`, mit `index.html`, `<id>.css`, `<id>.js` und `img/`. Als Vorlage dient `public/sechseck/`.
2. Navigation, Werkstätten, Erkenntnisse, Glossar, Lernraum und Lehrerpanel baut `shared/js/werkstatt.js` auf. Aufgaben (Schreibfeld an die Wand, Zuordnen, Lückentext, Test) kommen aus `shared/js/aufgaben.js`. Das Thema liefert nur die Inhalte, Hinweise für die Lehrkraft stehen in `hinweise` und erscheinen nur im Lehrerpanel. Zum Abschluss kommt ein Wissenscheck mit mindestens 20 Aufgaben in `<id>/wissenscheck.js`, Muster: `public/sechseck/wissenscheck.js`.
3. Für ein Planspiel die Inhalte nach dem Muster von `sechseck/leben.js` anlegen. Ablauf, Dashboard und Beamer-Modus kommen aus `shared/js/planspiel.js`, live läuft es im Lernraum des Themas.
4. Das Thema mit seiner Klassenstufe (`stufe`: 9, 10, 11 oder 12) in `public/themen.js` eintragen. Es erscheint dann auf der Startseite als Karte unter dieser Klassenstufe.
5. Tests in `tests/<id>.spec.mjs` ergänzen, `npm test` ausführen, Pull Request öffnen und die Vorschau prüfen.

Der Lernraum und die Sicherheitsregeln funktionieren für jedes Thema ohne weitere Einrichtung: Jeder Raum speichert sein Thema. Wer einen Code auf der falschen Themenseite eingibt, bekommt einen Hinweis mit Link zum richtigen Thema.

In einer Sitzung mit Claude Code reicht ein Auftrag wie „Leg das Thema Kaufvertrag für Klasse 10 an, Lernbereich …“. Die Standards aus `CLAUDE.md` gelten dann automatisch, und Claude stellt zuerst den Plan vor.

## Lokal entwickeln und testen

Voraussetzungen: [Node.js 22](https://nodejs.org) und Java 21 (für die Firebase-Emulatoren).

```bash
npm ci          # einmalig
npm run dev     # Seite mit Emulator: http://127.0.0.1:5000, Emulator-Oberfläche: http://127.0.0.1:4000
npm test        # alle Tests: Werkstätten, Aufgaben, Planspiel, Lernraum (Playwright) und Sicherheitsregeln
```

`npm run dev` startet die Seite mit einer lokalen Datenbank (Demo-Projekt `demo-wr-lab`), es fließen keine echten Daten. Den Lernraum testest du mit zwei Browserfenstern, z. B. einem normalen und einem privaten Fenster.

Ohne Java geht es auch, dann aber ohne Lernraum:

```bash
python3 -m http.server 8000 -d public   # dann http://localhost:8000 öffnen
```

## Im Unterricht

### Lernraum

1. **Lehrkraft (Beamer):** https://wr-lab.web.app öffnen, **Magisches Sechseck** wählen und oben auf das Symbol **Lernraum** tippen. Dann **Lernraum öffnen** klicken. Code und QR-Code erscheinen groß.
2. **Schüler (Handy):** QR-Code scannen oder die Seite öffnen, oben **Lernraum** tippen, Code und Spitznamen eingeben.
3. **Im Dashboard der Lehrkraft** (Symbol Lernraum, auch aus jeder Werkstatt heraus):
   - **Teilnehmer:** wer im Raum ist, in welcher Werkstatt gerade gearbeitet wird und wie viele Antworten schon an der Wand sind
   - **Alle anhalten:** Auf allen Handys erscheint „Schau nach vorn“, bis du weitermachst
   - **Alle holen nach …:** Alle Handys springen in dieselbe Werkstatt
   - **Werkstätten freigeben:** Gesperrte Werkstätten können die Schüler nicht öffnen
   - **Beamer-Modus:** blendet Spitznamen und das Lehrerpanel aus, sobald das Dashboard für alle sichtbar ist
   - **Alle Antworten drucken:** Druckansicht mit allen Antworten, auch „Als PDF speichern“
   - **Raum beenden:** Alle Handys zeigen „beendet“, der Raum und alle Daten der Schüler werden sofort gelöscht
4. **An der Wand:** Jede Werkstatt hat eine Frage mit Schreibfeld. Die Schüler tippen **Abschicken**, die Lehrkraft öffnet dieselbe Werkstatt am Beamer und deckt mit **Antworten zeigen** auf, wann es passt.
5. **Lehrerpanel:** Oben in jeder Werkstatt stehen auf dem Gerät der Lehrkraft Hinweise und der Erwartungshorizont. Schüler sehen davon nichts, im Beamer-Modus ist es ausgeblendet.

Ohne Lernraum funktioniert alles genauso, die Antworten kommen dann ins Heft.

### Wissenscheck

Jedes Thema endet mit einem Wissenscheck (beim Sechseck unter **Wissen**). Die Aufgaben stehen in drei Stufen nach den Anforderungsbereichen: **Grundlagen** (I), **Anwenden** (II) und **Beurteilen** (III).

- **Feedback ohne KI:** Zu jeder falschen Antwort erklärt die Seite, warum sie nicht stimmt. Bei Rechenaufgaben erkennt sie typische Fehler. Bei offenen Aufgaben gibt **Feedback holen** Hinweise zu Fachbegriffen und zum Operator, ohne die Lösung zu verraten.
- **Erwartungshorizont erst nach der Antwort:** Bei offenen Aufgaben haken die Schüler ab, was ihre Antwort enthält, und schätzen so ihre Punkte selbst ein.
- **Auswertung:** Punkte pro Stufe, ein Tipp für die schwächste Stufe und Links zu den Werkstätten, die wiederholt werden sollten.
- **Im Lernraum** sieht die Lehrkraft im Dashboard die Punkte der Klasse pro Stufe und die schwierigsten Aufgaben. Übertragen werden nur Punkte, keine Texte.

### KI-Coach mit AIS.chat

AIS.chat ist das KI-Angebot des Landes Thüringen im Schulportal. Der Datenschutz ist vom Land geklärt. So bekommen die Schüler bei offenen Aufgaben im Wissenscheck ein KI-Feedback:

1. Lernraum öffnen. Im Dashboard unter **KI-Coach mit AIS.chat** auf **Anweisung kopieren** klicken. Dieselbe Anweisung steht auch im Lehrerpanel des Wissenschecks.
2. In AIS.chat ein **Lernszenario** anlegen und die Anweisung einfügen.
3. Das Lernszenario **teilen**, den Link kopieren und im Dashboard einfügen, dann **Link speichern**.
4. Bei offenen Aufgaben erscheint der Knopf **KI-Coach (AIS.chat)**. Er kopiert die Antwort und öffnet AIS.chat. Die Schüler fügen sie dort ein.

Vorher klären, ob AIS.chat an der Schule für Schüler freigegeben ist. Ohne Link fehlt der Knopf, das Feedback ohne KI funktioniert immer.

### Planspiel Sechseck-Leben

1. **Lehrkraft:** **Planspiel → Lehrkraft (Beamer)** wählen. Ist schon ein Lernraum offen, nutzt das Planspiel denselben Code. Sonst **Live-Klassenraum erstellen** klicken.
2. **Schüler:** QR-Code scannen oder **Planspiel → Schüler** wählen. Wer schon im Lernraum ist, wählt direkt die zugeteilte Figur.
3. **Runde für Runde:**
   1. Ereignis am Beamer zeigen.
   2. Debatte aus Sicht der Figuren.
   3. Abstimmung auf den Handys, die Balken füllen sich live.
   4. **Beschluss verkünden**: Die Handys springen automatisch zum Ergebnis.
4. **Beamer-Modus:** blendet die Spitznamen aus und zeigt nur Figuren (z. B. „Mia 2“). Er gilt für Planspiel und Lernraum gemeinsam.
5. **Entfernen:** Ein unpassender Spitzname lässt sich in der Teilnehmerliste mit dem Kreuz entfernen.

Die Lehrkraft sollte den Raum vom selben Gerät und Browser aus steuern, mit dem sie ihn erstellt hat. Neu laden ist kein Problem, der Raum bleibt erhalten. Ohne Live-Verbindung läuft das Klassenspiel mit Stimmkarten: Die Schüler halten ihre Wahl hoch, die Lehrkraft zählt am Beamer.

## Datenschutz

- **Ohne Lernraum:**
  - Einzelspiel, Werkstätten, Antworten, Wissensspeicher und Spielstände bleiben nur im Browser des jeweiligen Geräts (localStorage).
  - Es gibt keine Anmeldung, keine Statistikdienste und keine Werbung.
- **Lernraum:**
  - Die Verbindung zu Firebase entsteht erst, wenn jemand einen Lernraum öffnet oder ihm beitritt.
  - Gespeichert werden nur ein frei gewählter Spitzname, die gerade geöffnete Werkstatt, abgeschickte Antworten (höchstens 1000 Zeichen, nur für die Lehrkraft lesbar), die Punkte im Wissenscheck (ohne Texte) und im Planspiel die Figur und Spieldaten (Stimmen, Check-Antworten, Kontostand der Figur). Es gibt keine E-Mail-Adresse, kein Passwort und kein Konto.
  - Der KI-Coach schickt selbst nichts an AIS.chat. Er kopiert nur die Antwort in die Zwischenablage, die Schüler fügen sie in AIS.chat selbst ein.
  - Die Schüler sollen keinen vollen echten Namen verwenden. Die Seite weist darauf hin.
- **Speicherort und Dauer:**
  - Die Daten liegen in Firestore am Standort eur3 (Europa).
  - Sie werden mit „Raum beenden“ gelöscht oder, falls eingerichtet, automatisch nach 24 Stunden.
- **Hosting:**
  - Die Seite wird über Firebase Hosting ausgeliefert (Google Ireland Ltd.).
  - Dabei verarbeitet Google technisch notwendige Verbindungsdaten wie die IP-Adresse.
- **Externe Dienste:**
  - Schriften und Symbole kommen von Google Fonts.
  - Die Firebase-Bibliothek kommt im Lernraum von gstatic.com (Google).
  - Die QR-Code-Bibliothek liefert die Seite selbst aus.
- **Vertrag mit Google:** In der Firebase-Konsole unter **Projekteinstellungen → Datenschutz** die Kontaktdaten eintragen und den Bedingungen zur Datenverarbeitung (Data Processing and Security Terms) zustimmen.
- **Abstimmung mit der Schule:**
  - Bitte vor dem Einsatz mit dem Datenschutzbeauftragten der Schule sprechen.
  - Je nach Schule kann ein Eintrag ins Verzeichnis der Verarbeitungstätigkeiten nötig sein.
  - Ist die Seite öffentlich erreichbar, braucht sie unter Umständen ein Impressum und eine Datenschutzerklärung. Beides lässt sich als eigene Seite in `public/` ergänzen.

## Bildnachweise

Alle Fotos stammen von [Unsplash](https://unsplash.com) und stehen unter der [Unsplash-Lizenz](https://unsplash.com/license).

- **Magisches Sechseck, Szenen:**
  - Tankstelle: engin akyurt
  - Containerschiff im Hamburger Hafen: Jacob Meissner
  - Jena mit JenTower: Lukas D. (auch auf der Startseite)
  - Trockenes Feld: Md. Hasanuzzaman Himel
- **Magisches Sechseck, Ziele:**
  - Preisniveaustabilität: Yosuke Ota
  - Beschäftigung: Remy Gieling
  - Wachstum: Artem Labunsky
  - Außenwirtschaft: Wolfgang Weiser
  - Umwelt: Karsten Würth
  - Verteilung: Marcel Strauß

Die Figuren sind eigene Illustrationen. Die Idee der Lernwerkstätten ist angelehnt an die Lernwerkstätten von Steve Wagner (steve-wagner.de). QR-Code-Bibliothek: qrcode-generator von Kazuhiko Arase (MIT-Lizenz).
