# WR-Lab

Interaktive Lernwerkstätten für **Wirtschaft und Recht in den Klassen 9 bis 12** (Thüringen). Die Seite läuft im Browser, ohne Anmeldung und ohne Installation: am Handy, am Tablet und am Beamer. Alles lässt sich allein bearbeiten oder als ganze Klasse im **Lernraum**: Die Lehrkraft öffnet einen Raum, die Schüler treten mit Code oder QR-Code bei, schicken Antworten an die Wand, spielen den Wissenscheck als Klassen-Quiz mit Rangliste und das Planspiel gemeinsam.

Adresse nach der Einrichtung: **https://wr-lab.web.app**

## Themen

Die Startseite zeigt die Themen nach Klassenstufe sortiert: Klasse 9, 10, 11 und 12.

| Klasse | Thema | Inhalt | Lehrplan Thüringen |
| --- | --- | --- | --- |
| 9 | [Anlagemöglichkeiten](public/geldanlage/) | Leitfrage: Jugendweihe-Geld, erster Lohn, Erspartes – wie legst du dein Geld clever an? Verdeckte Blitzrunde „Stimmt das?“ (allein oder als Klassenrunde), Geldschmelze mit Schätzfrage (Döner und Deutschlandtickets statt Euro, Realzins), magisches Dreieck aus Sicherheit, Liquidität und Rendite zum Ziehen und Schieben, acht Anlagen im Check (Steckbriefe, Tabelle aus dem Unterrichtsmaterial, Anlage-Duell), „Ihr seid die Anlageberater“ als Live-Abstimmung mit sechs Anlegern aus Thüringen und ein Anlegertest, Schneeball-Rechner zum Zinseszins mit der Rechenaufgabe aus dem Material, frühem Start, Kosten-Killer und Frühstart-Rente, Depot-Zeitmaschine mit echten Kursen von 2018 bis 2025 (Tagesgeld bis Bitcoin und die Jenoptik-Aktie aus Jena, mit Krisen-Entscheidungen), die zehn goldenen Regeln als Lückentext und das Chat-Abenteuer mit dem Wolf of Saale (fiktiver Finfluencer, Finanz-Checks, vier Enden). Dazu Hefteintrag, Bauchgefühl-Check und ein Wissenscheck mit 23 Aufgaben in drei Stufen, auch als Klassen-Quiz. | Handeln als Konsument, Umgang mit Geld (Klasse 9, Kapitel 2.1.1) |
| 10 | [Geschäftsfähigkeit](public/geschaeftsfaehigkeit/) | Welche Verträge darf ich mit 15 schon allein abschließen? Bauchgefühl-Blitzrunde (allein oder als Klassenrunde), Altersschieber mit Mopedführerschein und Einwilligung in Apps, Haus der Geschäftsfähigkeit mit Hilfeknopf an jedem Raum und Hefteintrag, Rechts-Navi mit Zitiertechnik, Fall-Akte mit neun Fällen (darunter ein Job-Fall zu § 113 BGB) und Gutachten-Baukasten, Taschengeld-Detektiv mit sechs Fällen zu § 110 BGB, Live-Abstimmung „Ihr seid das Gericht“ mit sieben Fällen (darunter das Kind als Bote), Gaming, Abos und Klarna, der erste Job (§ 113 BGB, auch: Warum gilt er nicht für den Ausbildungsvertrag?), Mission Zwergspitz als Labyrinth-Spiel (Figur steuern, schätzen, Sackgassen, Würfel an den Toren) und ein Wissenscheck mit 42 Aufgaben in drei Stufen. Eigene Erkenntnis zuerst formulieren, dann mit dem Merksatz vergleichen. Fälle mit Fotos, Trends wie Labubu, Pokémon-Karten und TikTok-LIVE und erfundenen Influencern. | Lernbereich Recht |
| 10 | [Deliktsfähigkeit](public/deliktsfaehigkeit/) | Die erste **Lernstrecke**: Leitfrage „Wer zahlt, wenn's kracht?“, fünf Lektionen im Rhythmus Fall – Entdecken – Sichern – Anwenden, Lektionsplan und Tafelbild der Reihe auf der Übersicht. Einstieg mit dem Simson-Unfall (Vermutung an die Wand) und einer verdeckten Blitzrunde „Wer zahlt?“. Haftung nach § 823 Abs. 1 BGB mit Vorsatz, Fahrlässigkeit oder Pech, Altersschieber mit den Stufen der Deliktsfähigkeit, Straßenverkehr-Check zur Sonderregel für Kinder von 7 bis 9 (§ 828 Abs. 2 BGB), „Ihr seid das Gericht“ mit vier Fällen, Rechts-Navi und Fall-Akte mit acht Fällen und Gutachten-Baukasten, Party-Abrechnung zur Aufsichtspflicht (§ 832 BGB), Haftpflicht-Rechner, Mission Simson als Chat-Abenteuer nach dem Crash (Nachrichten von Mama, Papa, Jonas und der Versicherung, Rechts-Checks, vier Enden zum Entdecken) und ein Wissenscheck mit 17 Aufgaben. Die Fälle aus dem Unterrichtsmaterial (Ben, Michael, Lisa, Marie) spielen in Apolda, Weimar und Jena. | Lernbereich Recht |
| 11 | [Magisches Sechseck](public/sechseck/) | Leitfrage: Warum kann die Politik nicht alles gleichzeitig reparieren? Einstieg mit einer verdeckten Nachrichten-Blitzrunde (allein oder als Klassenrunde), aufgelöst im Bauchgefühl-Check. Sechs Ziele der Wirtschaftspolitik messen, in den Regler-Werkstätten erst schätzen, dann schieben (BIP-Blitzrunde, Euro und Zeiss-Mikroskop, Vermögen des reichsten Zehntels, Tempo beim Klimaschutz), Zielkonflikte aufdecken, Politik simulieren und im Planspiel „Sechseck-Leben“ vier Jahre Wirtschaftspolitik für acht Figuren aus Thüringen entscheiden (mit Deutschlandticket 2027 und Industriestrompreis). Zu jeder Werkstatt eine Frage an die Wand, eigene Erkenntnis vor dem Merksatz, dazu Glossar, Wissensspeicher, Hefteintrag mit Kurztest und ein Wissenscheck mit 36 Aufgaben in drei Stufen. | Lernbereich Soziale Marktwirtschaft |

## Aufbau

```
public/                 wird veröffentlicht
  index.html, start.js  Startseite mit Themenkarten
  datenschutz.html, impressum.html, 404.html   Datenschutzerklärung, Impressum und Fehlerseite
  themen.js             Liste aller Themen mit Klassenstufe
  shared/               gemeinsam für alle Themen
    css/m3.css          Material Design 3 (Farbrollen, Google Sans, Komponenten, App-Shell)
    js/ui.js            Hilfsfunktionen, Foto mit Infopunkten
    js/werkstatt.js     App-Navigation und Gerüst einer Lernwerkstatt, Lehrerpanel
    js/lernstrecke.js   Lernstrecke: Übersichtsseite mit Lektionsplan und Tafelbild, Lektionen mit vier Stationen
    js/lernraum.js      Lernraum: ein Live-Raum für Werkstätten und Planspiel, Dashboard der Lehrkraft
    js/aufgaben.js      Aufgaben-Bausteine: Schreibfeld an die Wand, Zuordnen, Lückentext, Test, Wissenscheck,
                        Blitzrunde, Rechts-Navi und Fall-Akte, Live-Abstimmung „Ihr seid das Gericht“, Hilfen, Impuls
    js/chat.js          Chat-Abenteuer: Geschichte im Messenger, Entscheidungen, Rechts- oder Finanz-Checks, mehrere Enden
    js/quiz.js          Klassen-Quiz: den Wissenscheck im Lernraum gemeinsam spielen, mit Punkten nach Tempo, Teams und Rangliste
    js/praesentation.js Präsentationsansicht: zweites Fenster für den Beamer, der Laptop bleibt der eigene Bildschirm der Lehrkraft
    js/labyrinth.js     Labyrinth-Spiel: Figur mit Tastatur, Wischen, Steuerkreuz oder Antippen, Nebel, Würfel-Tore
    js/feedback.js      Feedback ohne KI für den Wissenscheck
    js/planspiel.js     Planspiel-Grundmechanik: Runden, Abstimmung, Lehrkraft-Dashboard, Beamer-Modus
    js/live.js          Verbindung zum Server (einzige Datei mit Firebase)
    vendor/qrcode.js    QR-Code-Bibliothek (MIT-Lizenz)
    vendor/fonts/       Google Sans, Google Sans Code (OFL 1.1) und Material Symbols Rounded (Apache 2.0), selbst ausgeliefert
  sechseck/             Lernwerkstatt Magisches Sechseck
    sechseck.js         Werkstätten, Wissen, Navigation
    leben.js            Planspiel Sechseck-Leben (Figuren, Runden, Rechenmodell)
    daten.js            Grunddaten und Sechseck-Grafiken
    wand.js             Fragen an die Wand, Gesprächsimpulse, Hinweise für das Lehrerpanel
    wissenscheck.js     Wissenscheck: Aufgaben in drei Stufen mit Erwartungshorizont
    img/                Fotos
  geschaeftsfaehigkeit/ Lernwerkstatt Geschäftsfähigkeit
    geschaeftsfaehigkeit.js  Werkstätten, Mission Zwergspitz, Navigation
    daten.js            Gesetzestexte, Rechts-Navi, Fälle, Altersgrenzen, Fotos
    wand.js             Fragen an die Wand, Gesprächsimpulse, Hinweise für das Lehrerpanel
    wissenscheck.js     Wissenscheck: Aufgaben in drei Stufen mit Erwartungshorizont
    img/                Fotos
firestore.rules         Sicherheitsregeln der Datenbank
firebase.json           Hosting, Firestore-Regeln, Emulatoren
scripts/schriften.mjs   lädt Schriften und Icons von Google Fonts nach public/shared/vendor/fonts/ (npm run schriften)
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

Jeder Raum, jeder Schülereintrag und jede Antwort hat das Feld `expireAt` (24 Stunden nach dem Anlegen, berechnet mit der Uhr des Geräts). Die Sicherheitsregeln verlangen es beim Anlegen und lassen höchstens 72 Stunden in der Zukunft zu, weil Geräteuhren falsch gehen können. Firestore kann solche Einträge automatisch löschen:

1. **Firestore Database → Time-to-live (TTL)** öffnen.
2. Je eine Richtlinie mit dem Feld `expireAt` für die Sammlungsgruppen `rooms`, `players` und `antworten` anlegen.

Das geht nur im kostenpflichtigen Blaze-Tarif: Löschungen per TTL haben laut Firebase-Preisliste kein kostenloses Kontingent. Wer das will, bucht Blaze mit einer Budgetwarnung (z. B. 1 €) und legt die Richtlinien in der Konsole an. Bitte keine TTL-Einstellungen in die Dateien des Projekts schreiben: Im kostenlosen Spark-Tarif würde sonst die Veröffentlichung scheitern. Auch mit TTL löscht Firestore erst einige Zeit nach dem Ablauf, typischerweise innerhalb von 24 Stunden.

Ohne TTL bleiben vergessene Räume liegen. Dagegen hilft: Mit **„Raum beenden“** löscht die Lehrkraft alle Daten eines Raums sofort. Öffnet sie auf demselben Gerät einen neuen Raum im selben Thema, beendet die Seite den alten automatisch.

## Veröffentlichung

| Was du tust | Was passiert |
| --- | --- |
| Push oder Merge auf `main` | Workflow **Veröffentlichen**: Zuerst laufen alle Tests. Wenn sie grün sind, werden Seite und Firestore-Regeln veröffentlicht. |
| Pull Request öffnen oder aktualisieren | Workflow **Vorschau**: Zuerst laufen die Tests, dann bekommt der Pull Request eine eigene Vorschau-Adresse (7 Tage gültig) als Kommentar. |
| Actions → Veröffentlichen → Run workflow | Veröffentlicht den aktuellen Stand von `main` von Hand. Mit einem anderen Branch laufen nur die Tests, veröffentlicht wird nichts. |

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
2. Navigation, Werkstätten, Erkenntnisse, Glossar, Lernraum und Lehrerpanel baut `shared/js/werkstatt.js` auf. Aufgaben (Schreibfeld an die Wand, Zuordnen mit Hilfeknopf, Lückentext, Test, Blitzrunde, Rechts-Navi, Fall-Akte, Live-Abstimmung) kommen aus `shared/js/aufgaben.js`, das Labyrinth-Spiel aus `shared/js/labyrinth.js`. Für Rechtsthemen ist `public/geschaeftsfaehigkeit/` ein gutes Muster. Das Thema liefert nur die Inhalte, Hinweise für die Lehrkraft stehen in `hinweise` und erscheinen nur im Lehrerpanel. Zum Abschluss kommt ein Wissenscheck in `<id>/wissenscheck.js`, Muster: `public/sechseck/wissenscheck.js`. Wie viele Aufgaben er hat, richtet sich nach dem Thema (mindestens 12).
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
npm run schriften   # nur nach einem neuen Icon in public/shared/vendor/fonts/icons.txt: lädt Schriften und Icons neu
```

`npm run dev` startet die Seite mit einer lokalen Datenbank (Demo-Projekt `demo-wr-lab`), es fließen keine echten Daten. Den Lernraum testest du mit zwei Browserfenstern, z. B. einem normalen und einem privaten Fenster.

Auf dem Mac belegt der AirPlay-Empfänger Port 5000. Startet der Emulator nicht, unter **Systemeinstellungen → Allgemein → AirDrop & Handoff** den AirPlay-Empfänger ausschalten.

Ohne Java geht es auch, dann aber ohne Lernraum:

```bash
python3 -m http.server 8000 -d public   # dann http://localhost:8000 öffnen
```

## Im Unterricht

### Lernraum

1. **Lehrkraft (Beamer):** https://wr-lab.web.app öffnen, ein Thema wählen, z. B. **Geschäftsfähigkeit**, und oben auf das Symbol **Lernraum** tippen. Dann **Lernraum öffnen** klicken. Code und QR-Code erscheinen groß.
2. **Schüler (Handy):** QR-Code scannen oder die Seite öffnen, oben **Lernraum** tippen, Code und Spitznamen eingeben.
3. **Im Dashboard der Lehrkraft** (Symbol Lernraum, auch aus jeder Werkstatt heraus):
   - **Teilnehmer:** wer im Raum ist, in welcher Werkstatt gerade gearbeitet wird und wie viele Antworten schon an der Wand sind. **Entfernen** fragt kurz nach und bietet an, die Antworten dieser Person an der Wand mitzulöschen
   - **Alle anhalten:** Auf allen Handys erscheint „Schau nach vorn“, bis du weitermachst
   - **Alle holen nach …:** Alle Handys springen in dieselbe Werkstatt
   - **Werkstätten freigeben:** Gesperrte Werkstätten können die Schüler nicht öffnen
   - **Beamer-Modus:** blendet Spitznamen und das Lehrerpanel aus, sobald das Dashboard für alle sichtbar ist. Ausnahme ist die Rangliste im Klassen-Quiz (Top 5, lässt sich mit **Spitznamen** ausblenden)
   - **Präsentationsansicht:** eigenes Fenster für den Beamer, wenn der Laptop einen erweiterten Bildschirm hat (siehe unten)
   - **Alle Antworten drucken:** Druckansicht mit allen Antworten, auch „Als PDF speichern“
   - **Raum beenden:** Alle Handys zeigen „beendet“, der Raum und alle Daten der Schüler werden sofort gelöscht. Klappt das Löschen nicht (z. B. WLAN weg), bleibt der Raum im Dashboard und „Raum löschen“ lässt sich wiederholen
4. **An der Wand:** Jede Werkstatt hat eine Frage mit Schreibfeld. Die Schüler tippen **Abschicken**, die Lehrkraft öffnet dieselbe Werkstatt am Beamer und deckt mit **Antworten zeigen** auf, wann es passt. Eine unpassende Antwort nimmt sie mit dem Papierkorb an der Karte von der Wand (mit kurzer Rückfrage, auch im Beamer-Modus).
5. **Lehrerpanel:** Oben in jeder Werkstatt stehen auf dem Gerät der Lehrkraft Hinweise und der Erwartungshorizont. Schüler sehen davon nichts, im Beamer-Modus ist es ausgeblendet.
6. **Verbindungsprobleme:** Hakt das WLAN beim Neuladen, bleibt der Raum auf dem Gerät gespeichert. Im Lernraum-Fenster steht dann „Keine Verbindung zum Lernraum.“ mit **Erneut verbinden** (oder **Seite neu laden**, wenn die Firebase-Bibliothek nicht geladen werden konnte).

Ohne Lernraum funktioniert alles genauso, die Antworten kommen dann ins Heft.

### Präsentationsansicht (Laptop und Beamer getrennt)

Wie die Referentenansicht in PowerPoint: Der Laptop bleibt dein eigener Bildschirm mit Dashboard, Lehrerpanel, Lösungen und Spitznamen. Der Beamer zeigt nur, was du schickst. Das geht, wenn der Beamer als **erweiterter** Bildschirm angeschlossen ist (nicht gespiegelt). Bei einem gespiegelten Bildschirm bleibt es beim Beamer-Modus.

1. Lernraum öffnen, im Dashboard **Präsentationsansicht** tippen. Es öffnet sich ein zweites Fenster. In Chrome und Edge legt es sich nach einer einmaligen Erlaubnis selbst auf den zweiten Bildschirm, sonst ziehst du es hinüber. Im Beamer-Fenster **Vollbild** tippen oder die Taste **F** drücken.
2. **Startbild:** Raumcode, QR-Code und die Zahl der Geräte im Raum.
3. **Von selbst auf den Beamer** kommen: das Klassen-Quiz beim Starten und die Wand, sobald du **Antworten zeigen** tippst. Alles andere bleibt auf dem Laptop.
4. **Leiste unten rechts auf dem Laptop:** zeigt, was der Beamer gerade zeigt. **Diese Werkstatt zeigen** schickt die geöffnete Werkstatt auf den Beamer, **Startbild** holt das Startbild zurück. An der Wand schickt **Auf den Beamer** sie erneut.
5. **Wand:** Am Beamer groß und ohne Spitznamen, auf dem Laptop mit Spitznamen und Papierkorb. Gelöschte Antworten verschwinden sofort auch am Beamer.
6. **Klassen-Quiz:** Am Beamer Frage, Countdown, Verteilung, Lösung und Rangliste ohne Knöpfe. Auf dem Laptop steuerst du wie gewohnt und siehst zusätzlich die Lösung schon während der Frage, wer noch nicht geantwortet hat und die nächste Frage. **Weiter** geht es auch mit Pfeil rechts, Bild ab (Presenter) oder der Leertaste. Schließt du das Quiz-Fenster auf dem Laptop, läuft das Quiz am Beamer weiter.

Das Beamer-Fenster ist dieselbe Lehrkraft im selben Browser, es schreibt aber nichts in den Raum. Die beiden Fenster sprechen nur auf dem Laptop miteinander (BroadcastChannel), neue Daten auf dem Server gibt es nicht.

### Blitzrunde als Klassenrunde

Bei der Geschäftsfähigkeit unter **Start → Darfst du das?**, beim Magischen Sechseck unter **Start → Gute Nachricht, schlechte Nachricht?**: Ist der Lernraum offen, sieht die Lehrkraft statt der Karten die Steuerung. **Klassenrunde starten** zeigt jede Karte auf allen Handys, die Balken zeigen live, wie die Klasse tippt. Das Bauchgefühl bleibt verdeckt. Am Ende zeigt der **Bauchgefühl-Check** (Werkstatt „Hefteintrag und Kurztest“) auf dem Gerät der Lehrkraft das Ergebnis der Klasse und auf den Handys das eigene.

### Erkenntnis: erst selbst formulieren, dann vergleichen

Am Ende jeder Werkstatt schreiben die Schüler ihre Erkenntnis zuerst in einem Satz auf (freiwillig). **Mit dem Merksatz vergleichen** zeigt dann den Merksatz neben dem eigenen Satz und legt ihn in „Mein Wissen“ ab. Der eigene Satz bleibt nur im Browser des Geräts und geht nie an den Server, auch nicht im Lernraum.

### Fall-Akte mit Gutachten-Baukasten

Jeder Fall hat einen Steckbrief mit Foto und den wichtigen Fakten. Die Schüler lösen ihn mit dem Rechts-Navi, falsche Abzweigungen werden mit einem Tipp erklärt. Danach bauen sie die Lösung aus Sätzen im Gutachtenstil zusammen: Obersatz, Prüfung, Ergebnis.

### Ihr seid das Gericht (Live-Abstimmung)

Bei der Geschäftsfähigkeit unter **Fälle → Ihr seid das Gericht**:

1. Lernraum öffnen, die Werkstatt am Beamer öffnen (auch über **Zur Abstimmung** im Dashboard).
2. Bei einem Fall **Abstimmung starten**. Auf allen Handys im Lernraum erscheint der Fall mit den Antworten.
3. Die Balken füllen sich live. Bis zur Auflösung können die Schüler ihre Stimme noch ändern.
4. Erst diskutieren lassen, dann **Auflösen**: Am Beamer und auf den Handys erscheint das Urteil mit Begründung.
5. **Abstimmung beenden** schließt die Fenster auf den Handys. Danach den nächsten Fall starten.

Übertragen wird nur die Nummer der gewählten Antwort. Ohne Lernraum fällen die Schüler ihr Urteil allein und sehen es sofort aufgelöst.

### Klassen-Quiz

Jeder Wissenscheck lässt sich im Lernraum als Quiz mit der ganzen Klasse spielen, ähnlich wie bekannte Quiz-Apps:

1. Lernraum öffnen, im Dashboard **Zum Klassen-Quiz** (oder den Wissenscheck am Beamer öffnen).
2. Einstellen: Zahl der Fragen, Stufe, Zeit pro Frage (20 bis 90 Sekunden oder ohne Zeitlimit, Rechenaufgaben doppelt so lang) und ob jeder für sich oder in 2 bis 6 Teams gespielt wird (Team Saale, Ilm, Unstrut, Werra, Gera, Schwarza). Dann **Quiz starten**.
3. **Lobby:** Am Beamer stehen die Zahl der Geräte und ein QR-Code für Nachzügler. Bei Teams wählt jeder auf dem Handy sein Team.
4. **Frage:** Am Beamer und auf allen Handys erscheinen Frage, Countdown und Antwortfelder mit Form und Farbe. Gespielt werden Auswahl, Mehrfachauswahl, Richtig oder falsch und Rechnen. Haben alle geantwortet oder ist die Zeit um, löst das Quiz auf. Die Lehrkraft kann auch früher **Auflösen** oder **15 Sekunden mehr** geben.
5. **Lösung:** Am Beamer die Verteilung der Antworten mit der richtigen Lösung und Erklärung, auf den Handys das eigene Ergebnis, die Punkte und der Platz. Danach **Rangliste** (Top 5, bei Teams auch die Teams) und **Nächste Frage**.
6. **Endstand:** Siegertreppchen am Beamer, der eigene Platz auf dem Handy. **Quiz beenden** schließt die Fenster.

Punkte: bis 1000 pro Frage, wer schneller richtig antwortet, bekommt mehr (mindestens die Hälfte), Teilpunkte bei der Mehrfachauswahl, Bonus für mehrere richtige Antworten in Folge. Den Zeitpunkt jeder Antwort setzt der Server, eine Antwort pro Frage. Die Antworten übernimmt der Wissenscheck auf dem Handy, wenn die Aufgabe dort noch offen ist. So zählen sie auch in der Auswertung im Dashboard. Spitznamen zeigt nur das Gerät der Lehrkraft, in den Raum gehen nur Punkte pro Gerät.

### Wissenscheck

Jedes Thema endet mit einem Wissenscheck (unter **Wissen**). Die Aufgaben stehen in drei Stufen nach den Anforderungsbereichen: **Grundlagen** (I), **Anwenden** (II) und **Beurteilen** (III).

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
  - Gespeichert werden nur ein frei gewählter Spitzname, die gerade geöffnete Werkstatt, abgeschickte Antworten (höchstens 1000 Zeichen, nur für die Lehrkraft lesbar), die Punkte im Wissenscheck (ohne Texte), bei Live-Abstimmungen die Nummer der gewählten Antwort und im Planspiel die Figur und Spieldaten (Stimmen, Check-Antworten, Kontostand der Figur). Es gibt keine E-Mail-Adresse, kein Passwort und kein Konto.
  - Der KI-Coach schickt selbst nichts an AIS.chat. Er kopiert nur die Antwort in die Zwischenablage, die Schüler fügen sie in AIS.chat selbst ein.
  - Die Schüler sollen keinen vollen echten Namen verwenden. Die Seite weist darauf hin.
- **Speicherort und Dauer:**
  - Die Daten liegen in Firestore am Standort eur3 (Europa).
  - „Raum beenden“ löscht alle Daten eines Raums sofort. „Raum verlassen“ löscht den eigenen Eintrag und die eigenen Antworten. Öffnet die Lehrkraft auf demselben Gerät einen neuen Raum im selben Thema, wird der alte beendet.
  - Jeder Eintrag trägt ein Ablaufdatum (`expireAt`, 24 Stunden nach dem Anlegen). Automatisch gelöscht wird nur, wenn die TTL-Richtlinie eingerichtet ist (Abschnitt 5, kostenpflichtiger Blaze-Tarif), und dann erst einige Zeit nach dem Ablauf. Die Seite verspricht den Schülern deshalb keine feste Frist.
- **Hosting:**
  - Die Seite wird über Firebase Hosting ausgeliefert (Google Ireland Ltd.).
  - Dabei verarbeitet Google technisch notwendige Verbindungsdaten wie die IP-Adresse.
- **Externe Dienste:**
  - Schriften und Symbole liefert die Seite selbst aus. Beim Aufruf geht keine Anfrage an Google Fonts.
  - Die Firebase-Bibliothek kommt im Lernraum von gstatic.com (Google).
  - Die QR-Code-Bibliothek liefert die Seite selbst aus.
- **Vertrag mit Google:** In der Firebase-Konsole unter **Projekteinstellungen → Datenschutz** die Kontaktdaten eintragen und den Bedingungen zur Datenverarbeitung (Data Processing and Security Terms) zustimmen.
- **Abstimmung mit der Schule:**
  - Bitte vor dem Einsatz mit dem Datenschutzbeauftragten der Schule sprechen.
  - Je nach Schule kann ein Eintrag ins Verzeichnis der Verarbeitungstätigkeiten nötig sein.
- **Impressum und Datenschutzerklärung:**
  - Sie stehen in `public/impressum.html` und `public/datenschutz.html`, verlinkt von der Startseite, der Fehlerseite, jedem Thema und dem Lernraum.
  - Vor dem Veröffentlichen die Angaben in eckigen Klammern ersetzen: Name, Anschrift, E-Mail und den Satz zur automatischen Löschung.
  - Ändert sich, was die Seite speichert, die Datenschutzerklärung mitziehen.

## Bildnachweise

- **Anlagemöglichkeiten**:
  - Bulle und Bär vor der Frankfurter Börse: giesing / Flickr, [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/), [Datei](https://www.flickr.com/photos/46074423@N00/14842086960) (ohne Ortsdaten gespeichert)
  - Der Wolf of Saale ist eine erfundene Figur und eine eigene Illustration von WR-Lab (auch als Vorschaubild beim Teilen).
- **Deliktsfähigkeit** (Wikimedia Commons, verkleinert):
  - Markt in Apolda: NatiSythen, [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/), [Datei](https://commons.wikimedia.org/wiki/File:Apolda_Markt01.jpg)
  - Simson S51 bei Eisenberg: Steffen Mokosch, [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/), [Datei](https://commons.wikimedia.org/wiki/File:Simson_S51_at_McDonald%27s_Petersberg_near_Eisenberg_2026.jpg)
  - Fußball: Tim Reckmann, [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/), [Datei](https://commons.wikimedia.org/wiki/File:Fu%C3%9Fball_auf_Rasen_(40259829870).jpg)
  - Kind auf dem Fahrrad: Skgbl, [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), [Datei](https://commons.wikimedia.org/wiki/File:Kidical_Mass_Hamburg_2024_September_26.jpg)
  - Bunte Tassen: Erkaha, [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/), [Datei](https://commons.wikimedia.org/wiki/File:Bunte_Tassen_wild_gemischt.jpg)
  - Partykeller: Mr N, [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/), [Datei](https://commons.wikimedia.org/wiki/File:Kinolino-Partykeller_01.jpg)
  - Silvester in Jena: Rene Schwietzke, [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/), [Datei](https://commons.wikimedia.org/wiki/File:Silvester_2010_in_Jena_(5311663151).jpg)
  - E-Scooter auf dem Gehweg: Catatine, [CC0](https://creativecommons.org/publicdomain/zero/1.0/), [Datei](https://commons.wikimedia.org/wiki/File:HAL-Vogelweide,_Scooter.jpg)
  - Baustellenschild: Sascha Grosser, [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/), [Datei](https://commons.wikimedia.org/wiki/File:Schild_-_Baustelle_verboten_-_Eltern_haften_f%C3%BCr_ihre_Kinder.jpg)
  - Auto mit Delle: Garitzko, gemeinfrei, [Datei](https://commons.wikimedia.org/wiki/File:Damaged_car_door.jpg)
- **Geschäftsfähigkeit** (Wikimedia Commons):
  - Goethe Galerie Jena: Andreas Praefcke, [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/), [Datei](https://commons.wikimedia.org/wiki/File:Jena_Goethe-Galerie_2010_1.jpg)
  - Simson S51: Max schwalbe, [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/), [Datei](https://commons.wikimedia.org/wiki/File:Simson_S_51_B1-3_von_1987_Bild1.jpg)
  - Zwergspitz: Jiafei Slay Queen, [CC0](https://creativecommons.org/publicdomain/zero/1.0/), [Datei](https://commons.wikimedia.org/wiki/File:Aww..._Cute_pomeranian!.jpg)
  - Gaming-PC: Benlisquare, [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/), [Datei](https://commons.wikimedia.org/wiki/File:Ricer_gaming_PC_with_CPU_watercooler.jpg)
  - Pokémon-Karten: Jarek Tuszyński, [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/), [Datei](https://commons.wikimedia.org/wiki/File:Pokemon_collection.jpg)
  - Halloween-Accessoires: Silar, [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/), [Datei](https://commons.wikimedia.org/wiki/File:020221016_Halloween_2022_in_Poland,_accessories.jpg)
  - Bitcoin: Jorge Franganillo, [CC BY 2.0](https://creativecommons.org/licenses/by/2.0/), [Datei](https://commons.wikimedia.org/wiki/File:Bitcoin_%2850799812413%29.jpg)
  - Air Force 1: Xanor, [CC0](https://creativecommons.org/publicdomain/zero/1.0/), [Datei](https://commons.wikimedia.org/wiki/File:Air_Force_1.JPG)
  - JBL-Partybox: TaurusEmerald, [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/), [Datei](https://commons.wikimedia.org/wiki/File:JBL_PartyBox_On-The-Go.jpg)
  - Pop-Mart-Laden: Thelabubucollector, [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), [Datei](https://commons.wikimedia.org/wiki/File:Labubu_Pop_Mart_store_in_New_York_City.jpg)
  - Pokémon-Automat: KKPCW (Kyu3), [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/), [Datei](https://commons.wikimedia.org/wiki/File:Pok%C3%A9mon_Trading_Card_Vending_machine.jpg)
  - PS5-Controller: InclusiveGameLab, [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/), [Datei](https://commons.wikimedia.org/wiki/File:InclusiveGameLab_Person-with-PS5-Controller_01_CC-BY-SA.jpg)
  - Spielkonsolen: InclusiveGameLab, [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/), [Datei](https://commons.wikimedia.org/wiki/File:InclusiveGameLab_Current_Console_Generation_CC-BY-SA.jpg)
  - Messe Erfurt: Messe Erfurt AG, [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/), [Datei](https://commons.wikimedia.org/wiki/File:Panorama_Messe_Erfurt.jpg)
  - Neumarkt Gotha: Roeland P., [CC0](https://creativecommons.org/publicdomain/zero/1.0/), [Datei](https://commons.wikimedia.org/wiki/File:2026-01-26-Neumarkt-Gotha-Schnee.jpg)
  - Café Stilbruch Jena: Sebastian Wallroth, [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/), [Datei](https://commons.wikimedia.org/wiki/File:Jena_2023_002.jpg)
  - Computermäuse: Gpkp, [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/), [Datei](https://commons.wikimedia.org/wiki/File:Computer_mice_%282026%29.jpg)
  - Nintendo Switch: KK IN HK, [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/), [Datei](https://commons.wikimedia.org/wiki/File:Nintendo_Switch.jpg)
  - Supermarkt-Regale: The real Marcoman, [CC0](https://creativecommons.org/publicdomain/zero/1.0/), [Datei](https://commons.wikimedia.org/wiki/File:Netto_Marken-Discount_Innenansicht_(4).jpg)
  - Bäckerei in Jena (Ausschnitt): Timk70, [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/), [Datei](https://commons.wikimedia.org/wiki/File:Baeckerei_Zwiebel_%26_CiZ,_Jena,_Johannisplatz_9_%26_10.jpg)
  - Eigene Illustrationen: Labyrinth und Spielfigur der Mission Zwergspitz, TikTok-LIVE (Fall „Rosen für den Streamer“) und Energydrink (Fall „Der verbotene Energydrink“)

Die Fotos zum Magischen Sechseck stammen von [Unsplash](https://unsplash.com) und stehen unter der [Unsplash-Lizenz](https://unsplash.com/license).

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
