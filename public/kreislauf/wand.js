// Lernwerkstatt Der Wirtschaftskreislauf: Fragen „an die Wand“, Gesprächsimpulse und Hinweise für das Lehrerpanel.
// HINWEISE und der Erwartungshorizont (erwartung) erscheinen nur im Lehrerpanel auf dem Gerät der Lehrkraft,
// nie auf der Seite der Schüler.

export const HINWEISE={
  euro:['Einstieg ohne Vorwissen: Peters Euro wandert durch fünf Hände (Peter, Mr. Kebab, Murat, Sporthaus, Sandra) und landet wieder bei Peter. An jeder Station tippen die Schüler, wohin er geht. Die falschen Tipps (Kopfkissen, Finanzamt, Großhändler in Polen, China, Bank) sind keine Fehler, sondern die Sektoren der späteren Stufen. Darauf am Ende hinweisen.',
    '<b>Mit der Klasse:</b> Werkstatt im Lernraum auf den Beamer schicken (oder den Bildschirm spiegeln) und vorn klicken. Die Klasse ruft ihren Tipp, bei Uneinigkeit per Handzeichen abstimmen lassen. Wer mag, nimmt eine echte Münze mit und lässt sie durch fünf Hände wandern.',
    'Erkenntnis für die Tafel: Geld fließt im Kreis. Was der eine ausgibt, ist für den anderen Einkommen. Jeder Strom hat einen Gegenstrom (Döner, Arbeit, Schuhe). Ausnahme Taschengeld: innerhalb eines Haushalts.',
    `<b>Ablauf der Doppelstunde (2 × 45 Minuten):</b><ol>
      <li>Ein Euro auf Reise, mit der Klasse am Beamer (8 Min.)</li>
      <li>Stufe 1: einfacher Kreislauf mit Peter und Murat, Geld oder Güter, Güterströme ausblenden, rechnen (15 Min.)</li>
      <li>Stufe 2: Live-Abstimmung „Alle sparen“, Lücke mit dem Regler zeigen, Banken einbauen (12 Min.)</li>
      <li>Stufe 3: Staat einbauen, Kreditaufnahme ausrechnen (12 Min.)</li>
      <li>Stufe 4: Ausland einbauen, Außenbeitrag (10 Min.); kann entfallen, dann im Lernraum sperren</li>
      <li>Schockwellen: drei bis vier Ereignisse live abstimmen und auflösen (18 Min.)</li>
      <li>Hefteintrag, Modellkritik an der Wand, Hausaufgabe Wissenscheck (15 Min.)</li></ol>
      Parallel füllen die Schüler das Kreislaufschema auf dem Arbeitsblatt aus.`],
  einfach:['Ersetzt „Peter und sein Döner“ aus deinem Material als interaktive Version: Die Schüler wählen eine Karte (Peter zahlt, Peter bekommt den Döner, Murat arbeitet, Murat bekommt Lohn) und zeichnen den Pfeil, indem sie erst den Start und dann das Ziel antippen. Falsche Richtung und falsche Sektoren bekommen eigene Hinweise.',
    'Nach jedem Pfeil entscheiden sie: Geld oder Güter? Erst dann bekommt der Pfeil seine Farbe (Geld gelb, Güter grün). Das entspricht Aufgabe 2 deines Arbeitsblatts (gelb und rot markieren).',
    'Danach „Güterströme ausblenden“ (Aufgabe 3 deines Arbeitsblatts): Weil jeder Güterstrom einen Geldstrom als Gegenstrom hat, reicht eine Sorte. Ab Stufe 2 zeigt das Diagramm nur noch Geldströme.',
    'Rechnen: Y = 100, also C<sub>H</sub> = 100. Dazu die Annahmen des Modells: Haushalte geben alles aus, kein Staat, keine Banken, kein Ausland (stationäre Wirtschaft). Die Taschengeld-Analogie aus M1 passt gut als mündliche Ergänzung.',
    'Lehrplan: Der einfache Wirtschaftskreislauf steht in Klasse 9 unter „Rolle der Unternehmen“ (Kapitel 2.1.2). Der erweiterte Kreislauf mit Staat und Ausland (5-Sektoren-Modell) kommt in Klasse 11/12 (4.1.3) wieder, hier als Vorgriff.'],
  banken:['Brücke zum Haushaltsplan: Sparen ist das, was vom Einkommen übrig bleibt. Im Kreislauf reißt es eine Lücke, denn den Unternehmen fehlt dieser Teil des Umsatzes.',
    '<b>Live-Abstimmung</b> „Alle sparen“ zuerst starten (vor dem Bauen), dann mit dem Regler zeigen, wie die Lücke wächst. Erst nach dem Einbau der Banken (Pfeile S<sub>H</sub> und I<sub>n</sub>) schließt sich die Lücke im Regler.',
    'Fachbegriffe: Der Sektor heißt in deinem Material Vermögensveränderung (VV), im Diagramm „Banken“ mit dem Kürzel VV. Nettoinvestitionen I<sub>n</sub> erweitern den Kapitalstock (neuer Ofen, neue Halle), Ersatzinvestitionen D = I<sub>e</sub> ersetzen Verschlissenes und fließen innerhalb der Unternehmen.',
    'Sparquote der privaten Haushalte in Deutschland: 10,3 % im 1. Halbjahr 2025 (Destatis), in den Corona-Jahren 2020 und 2021 im Schnitt rund 15 %. Die Statista-Grafik aus deinen Folien passt hier.',
    'Rechnen: Y = 100, C<sub>H</sub> = 85, also S<sub>H</sub> = 15 und I<sub>n</sub> = 15. Merksatz: Im Gleichgewicht gilt S = I.'],
  staat:['Sechs Pfeile auf einmal: direkte Steuern, Transfers, indirekte Steuern, Subventionen, Staatskonsum und die Kreditaufnahme bei den Banken. Entspricht M3 aus deinem Material (Einnahmen und Ausgaben des Staates): Steuern sind Einnahmen, Transfers, Subventionen und Staatskonsum Ausgaben.',
    'Rechnen: Einnahmen 25 + 15 = 40, Ausgaben 20 + 5 + 20 = 45, also Kreditaufnahme 5. Für Investitionen bleiben 15 − 5 = 10. Gesprächsanlass: Was der Staat sich leiht, fehlt den Unternehmen (Verdrängung, crowding out, nur als Ausblick).',
    'Die Werte sind gedachte Milliarden, gewählt, damit alle Sektoren ausgeglichen sind. Haushalte: 100 + 20 rein, 80 + 15 + 25 raus. Unternehmen: 80 + 20 + 10 + 5 rein, 100 + 15 raus.'],
  ausland:['<b>Optional:</b> Wenn der Kreislauf beim Staat enden soll, diese Werkstatt im Lernraum sperren. Die Schockwellen 6 und 7 brauchen das Ausland, die übrigen nicht.',
    'X: Geld aus dem Ausland für unsere Exporte (Pfeil vom Ausland zu den Unternehmen). M: Geld für Importe ins Ausland. Der Außenbeitrag X − M fließt über die Banken ins Ausland (Forderungen ans Ausland).',
    `Echte Zahlen 2025 (Destatis, Februar 2026): Exporte 1.563 Mrd. €, Importe 1.362,5 Mrd. €, Exportüberschuss 200,5 Mrd. €. China ist wieder wichtigster Handelspartner, die USA größter Abnehmer.`,
    'Rechnen: X − M = 30 − 26 = 4, Investitionen 15 − 5 − 4 = 6. Alle fünf Sektoren sind ausgeglichen.'],
  schockwellen:['Herzstück zum Weiterdenken: Ein Ereignis trifft den Kreislauf, und die Pfeile werden in einer Wirkungskette nacheinander dicker (grün, +) oder dünner (rot, −). Jede Welle läuft auf dem Modell, das zu ihr passt: einfacher Kreislauf, mit Banken, mit Staat oder mit Ausland.',
    '<b>Live mit der Klasse:</b> Ereignis wählen, „Abstimmung starten“: Alle Handys zeigen die Meldung und die Frage. Du siehst die Balken. Mit „Auflösen“ läuft die Welle auf allen Geräten und auf dem Beamer los, die Schüler sehen ihr Ergebnis. Mit „Welle noch einmal“ kannst du die Kette Schritt für Schritt nachbesprechen.',
    'Echte Anlässe: Mindestlohn 14,60 € ab Januar 2027 (Mindestlohnkommission, Juni 2025), US-Zölle: Exporte von Autos und Autoteilen in die USA 2025 −17,8 % (Destatis). Die übrigen Meldungen sind Szenarien oder erfundene Schlagzeilen.',
    'Gute Gesprächsanlässe: Sparparadox (Ereignis 2: Jeder spart vernünftig, alle zusammen verlieren Einkommen), Staatsausgaben auf Kredit (Ereignis 4), Abhängigkeit vom Export (Ereignis 6).',
    'Vorschlag für 18 Minuten: Ereignis 1 (Wiederholung einfacher Kreislauf), 2, 4 und 6 live, die anderen als Übung allein.'],
  sichern:['Hefteintrag als Lückentext mit den Fachbegriffen aller vier Stufen. Danach Modellkritik an der Wand: Was zeigt das Modell gut, was lässt es weg?',
    'Erwartbare Modellkritik: Preise, Inflation und Zeit fehlen; die Werte sind gedacht; Menschen handeln nicht so gleichmäßig; Schwarzarbeit, Hausarbeit und Ehrenamt fehlen; Umwelt und Ressourcen kommen nicht vor (BNE).'],
  wissenscheck:['Wissenscheck mit Aufgaben zu allen Stufen und zu den Schockwellen, auch als Klassen-Quiz im Lernraum. Gut als Hausaufgabe oder zum Abschluss der Stunde.']
};

export const WAND={
  euro:{id:'wk-euro-wand',frage:'Warum ist das Geld, das du ausgibst, für andere so wichtig?',
    anfaenge:['Wenn ich etwas kaufe, …','Für den Verkäufer ist mein Geld …'],
    tipp:'Denk an Mr. Kebab: Wovon bezahlt er Murats Lohn?',
    erwartung:['Was ich ausgebe, ist für andere Einkommen (Umsatz für das Unternehmen, Lohn für die Beschäftigten).','Geld fließt im Kreis: Ohne Konsum fehlt das Geld für Löhne.']},
  einfach:{id:'wk-einfach-wand',frage:'Warum reicht es, im Kreislauf nur die Geldströme zu zeigen?',
    anfaenge:['Zu jedem Güterstrom gibt es …','Wenn Peter einen Döner bekommt, …'],
    tipp:'Was fließt in die Gegenrichtung, wenn Peter seinen Döner bekommt?',
    erwartung:['Jeder Güterstrom hat einen Geldstrom als Gegenstrom (Döner gegen Konsumausgaben, Arbeit gegen Lohn).','Die Geldströme sind gleich groß wie die Güterströme, also geht keine Information verloren. Geld lässt sich zudem leichter messen und addieren.']},
  banken:{id:'wk-banken-wand',frage:'Ist Sparen gut für die Wirtschaft? Begründe mit dem Kreislauf.',
    anfaenge:['Wenn Haushalte sparen, …','Das ist aber kein Problem, solange …'],
    tipp:'Was passiert mit dem gesparten Geld bei den Banken?',
    erwartung:['Sparen fehlt zunächst als Konsum, den Unternehmen fehlt Umsatz (Lücke).','Wenn die Banken das Ersparte als Kredit weitergeben und Unternehmen investieren (S = I), schließt sich die Lücke. Gespartes ermöglicht Investitionen.','Spart man zu viel und investiert keiner, schrumpft der Kreislauf (Sparparadox).']},
  staat:{id:'wk-staat-wand',frage:'Der Staat gibt mehr aus, als er einnimmt. Was spricht dafür, was dagegen?',
    anfaenge:['Dafür spricht, dass …','Dagegen spricht, dass …'],
    tipp:'Wofür gibt der Staat Geld aus? Und woher kommt das fehlende Geld?',
    erwartung:['Dafür: Schulen, Straßen, Transfers helfen Menschen und Unternehmen, das Geld fließt über Staatskonsum und Transfers in den Kreislauf zurück.','Dagegen: Der Staat muss sich Geld leihen (Kreditaufnahme), zahlt Zinsen, das Geld fehlt für Investitionen der Unternehmen, spätere Generationen zahlen zurück.']},
  ausland:{id:'wk-ausland-wand',frage:'Deutschland verkauft viel mehr ins Ausland, als es kauft. Ist das nur gut?',
    anfaenge:['Gut ist, dass …','Problematisch kann sein, dass …'],
    tipp:'Denk an die Arbeitsplätze in Eisenach. Und was passiert, wenn die USA Zölle erheben?',
    erwartung:['Gut: Exporte bringen Geld ins Land und sichern Arbeitsplätze (zum Beispiel Autozulieferer in Thüringen).','Problematisch: Abhängigkeit vom Ausland, Zölle oder Krisen treffen die Wirtschaft hart; der Überschuss fließt ins Ausland ab, Handelspartner verschulden sich.']},
  schockwellen:{id:'wk-wellen-wand',frage:'Welche Schockwelle hat dich am meisten überrascht? Erkläre die Wirkungskette.',
    anfaenge:['Überrascht hat mich …','Zuerst …, dann …, am Ende …'],
    tipp:'Nimm die nummerierten Schritte der Welle und verbinde sie mit „dadurch“ oder „deshalb“.',
    erwartung:['Eine Wirkungskette in mindestens drei Schritten mit Fachbegriffen (zum Beispiel: Haushalte sparen mehr, Konsum sinkt, Unternehmen produzieren weniger, Einkommen sinkt).','Begründung, warum das überraschend ist (zum Beispiel Sparparadox).']},
  sichern:{id:'wk-sichern-wand',frage:'Ein Modell vereinfacht die Wirklichkeit. Was zeigt der Kreislauf gut, und was lässt er weg?',
    anfaenge:['Gut zeigt das Modell, …','Es lässt aber weg, dass …'],
    tipp:'Denk an Preise, an Zeit und an Arbeit, für die niemand bezahlt wird.',
    erwartung:['Gut: Zusammenhänge zwischen den Sektoren, Geld fließt im Kreis, Folgen von Ereignissen lassen sich abschätzen.','Weggelassen: Preise und Inflation, Zeit (alles passiert gleichzeitig), echte Zahlen, Hausarbeit, Ehrenamt und Schwarzarbeit, Umwelt und Ressourcen.']}
};

export const IMPULS={
  euro:'Wo ist euer letzter ausgegebener Euro jetzt wohl? Verfolgt ihn in Gedanken zwei Stationen weiter.',
  einfach:'Murat ist Haushalt und zugleich Arbeitskraft für ein Unternehmen. Gibt es jemanden, der nur zu einem Sektor gehört?',
  banken:'Lena spart 50 € im Monat. Wer arbeitet eigentlich mit ihrem Geld, während es auf dem Konto liegt?',
  staat:'Zählt eure Schule zum Kreislauf? Welche Pfeile laufen durch euer Schulgebäude?',
  ausland:'Schaut aufs Etikett eurer Kleidung und auf euer Handy: Welche Pfeile zum Ausland stecken darin?',
  schockwellen:'Welches Ereignis aus den Nachrichten der letzten Wochen würdet ihr als nächste Schockwelle einbauen?',
  sichern:'Ein Stadtplan zeigt auch nicht jeden Baum. Wann ist ein Modell trotzdem nützlich?'
};
