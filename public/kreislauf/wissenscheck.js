// Wissenscheck zum Wirtschaftskreislauf (Klasse 9): Aufgaben in drei Stufen mit Erwartungshorizont.
// Aufbau und Felder: siehe shared/js/aufgaben.js, wissenscheck(). Punkte etwa 40 % Grundlagen, 40 % Anwenden, 20 % Beurteilen.
// werkstatt: Werkstatt, die bei Fehlern zum Wiederholen vorgeschlagen wird.
// w in erwartung: Wortstämme (Groß- und Kleinschreibung und Umlaute egal), 'urteil' prüft auf ein eigenes Urteil.

export const WISSENSCHECK={
  id:'wissenscheck',
  titel:'Wissenscheck: Der Wirtschaftskreislauf',
  thema:'Einfacher und erweiterter Wirtschaftskreislauf: Haushalte, Unternehmen, Banken, Staat und Ausland, Geld- und Güterströme, ausgeglichene Sektoren und Wirkungsketten',
  stufe:9,
  tipps:{1:'Wiederhole die Merksätze in „Mein Kreislauf-Wissen“. Kürzel wie C<sub>H</sub>, S<sub>H</sub> oder T<sub>ind</sub> findest du unter „Begriffe nachschlagen“.',
    2:'Beim Rechnen hilft die Regel: Was in einen Sektor hineinfließt, muss auch wieder hinausfließen. Schreib Zuflüsse und Abflüsse getrennt auf.',
    3:'Beim Beurteilen: Was spricht dafür, was dagegen? Denk an die Wirkungsketten aus den Schockwellen und komm am Ende zu einem eigenen Urteil.'},
  aufgaben:[
  /* ---------- Stufe I: Grundlagen ---------- */
  {afb:1,art:'wahl',werkstatt:'einfach',f:'Welche Sektoren gibt es im einfachen Wirtschaftskreislauf?',
    o:['Haushalte und Unternehmen','Haushalte, Unternehmen und Staat','Unternehmen und Banken','Staat und Ausland'],r:0,
    fehler:{1:'Der Staat kommt erst im erweiterten Kreislauf dazu (Stufe 3).',2:'Die Banken sind die zweite Stufe. Im einfachen Kreislauf sparen die Haushalte nichts.',3:'Staat und Ausland gehören zum erweiterten Kreislauf.'},
    e:'Der einfache Kreislauf hat nur zwei Sektoren: Haushalte und Unternehmen. Zwischen ihnen fließen zwei Geld- und zwei Güterströme.'},
  {afb:1,art:'richtigfalsch',werkstatt:'einfach',f:'Zu jedem Güterstrom gibt es einen Geldstrom in die Gegenrichtung.',r:true,
    e:'Richtig. Peter bekommt einen Döner und zahlt dafür 7 €. Murat arbeitet und bekommt dafür Lohn.'},
  {afb:1,art:'richtigfalsch',werkstatt:'einfach',f:'Das Einkommen (Y) fließt von den Haushalten zu den Unternehmen.',r:false,
    e:'Falsch. Die Unternehmen zahlen den Haushalten Lohn, Gehalt, Miete und Zinsen für ihre Produktionsfaktoren. Das Einkommen fließt also zu den Haushalten.'},
  {afb:1,art:'zuordnen',p:4,f:'Geldstrom oder Güterstrom? Ordne zu.',
    faecher:[{id:'geld',t:'Geldstrom'},{id:'gut',t:'Güterstrom'}],
    karten:[{t:'Peter zahlt 7 € für seinen Döner.',f:'geld',werkstatt:'einfach'},{t:'Murat bekommt am Monatsende seinen Lohn.',f:'geld',werkstatt:'einfach'},
      {t:'Familie Schulz bekommt Kindergeld.',f:'geld',werkstatt:'staat'},{t:'Murat arbeitet in der Küche von Mr. Kebab.',f:'gut',werkstatt:'einfach'},
      {t:'Peter bekommt seinen XXL-Döner.',f:'gut',werkstatt:'einfach'},{t:'Eine Firma aus Eisenach liefert Autoteile nach Frankreich.',f:'gut',werkstatt:'ausland'}],
    e:'Geldströme: Konsumausgaben, Einkommen, Transfers. Güterströme: Arbeit (Produktionsfaktoren), Konsumgüter, gelieferte Waren. Für die gelieferten Autoteile fließt als Gegenstrom Geld aus Frankreich.'},
  {afb:1,art:'mehrfach',p:2,werkstatt:'staat',f:'Welche Ströme sind Ausgaben des Staates?',
    o:['Transferzahlungen an Haushalte (Z<sub>H</sub>)','Subventionen an Unternehmen (Z<sub>U</sub>)','Konsum des Staates (C<sub>St</sub>)','Direkte Steuern (T<sub>dir</sub>)','Indirekte Steuern (T<sub>ind</sub>)'],r:[0,1,2],
    fehler:{3:'Steuern sind Einnahmen des Staates: Der Pfeil zeigt zum Staat hin.',4:'Die Mehrwertsteuer führen die Unternehmen an den Staat ab. Das ist eine Einnahme.'},
    e:'Ausgaben: Transfers, Subventionen und Staatskonsum (Pfeile vom Staat weg). Einnahmen: direkte und indirekte Steuern, dazu Kredite.'},
  {afb:1,art:'wahl',werkstatt:'ausland',f:'Wofür steht das Kürzel X im Wirtschaftskreislauf?',
    o:['Exporte','Importe','Steuern','Investitionen'],r:0,
    fehler:{1:'Importe heißen M (vom englischen imports).',2:'Steuern heißen T (vom englischen taxes).',3:'Investitionen heißen I.'},
    e:'X steht für Exporte: Geld, das das Ausland für Waren aus Deutschland bezahlt. 2025 waren es 1.563 Mrd. € (Destatis).'},
  {afb:1,art:'richtigfalsch',werkstatt:'banken',f:'Den Sektor Banken nennt man im Kreislauf auch Vermögensveränderung (VV).',r:true,
    e:'Richtig. Dort landet, was gespart wird, und von dort kommt das Geld für Investitionen und Kredite.'},

  /* ---------- Stufe II: Anwenden ---------- */
  {afb:2,art:'zahl',r:18,tol:0,einheit:'Mrd. €',werkstatt:'banken',f:'Die Haushalte bekommen 120 Mrd. € Einkommen und geben 102 Mrd. € für Konsum aus. Es gibt keinen Staat. Wie viel sparen sie?',
    fehler:[{wert:222,text:'Du hast addiert. Gespart wird, was vom Einkommen übrig bleibt: 120 − 102.'},{wert:-18,text:'Prüfe das Vorzeichen: Die Haushalte geben weniger aus, als sie einnehmen.'}],
    e:'120 − 102 = 18. Zuflüsse (120) und Abflüsse (102 + 18) sind gleich: Der Sektor ist ausgeglichen.'},
  {afb:2,art:'zahl',r:10,tol:0,einheit:'Mrd. €',werkstatt:'staat',f:'Der Staat nimmt 30 Mrd. € direkte und 20 Mrd. € indirekte Steuern ein. Er zahlt 25 Mrd. € Transfers, 5 Mrd. € Subventionen und gibt 30 Mrd. € für Staatskonsum aus. Wie viel muss er sich bei den Banken leihen?',
    fehler:[{wert:110,text:'Du hast alles addiert. Vergleiche Einnahmen (30 + 20) und Ausgaben (25 + 5 + 30).'},{wert:-10,text:'Der Staat gibt mehr aus, als er einnimmt. Gefragt ist, wie viel fehlt: eine positive Zahl.'}],
    e:'Einnahmen 50, Ausgaben 60: Es fehlen 10 Mrd. €. Die leiht er sich bei den Banken (KR<sub>St</sub>).'},
  {afb:2,art:'zahl',r:5,tol:0,einheit:'Mrd. €',werkstatt:'ausland',f:'Die Unternehmen exportieren für 40 Mrd. € und importieren für 35 Mrd. €. Wie hoch ist der Außenbeitrag?',
    fehler:[{wert:75,text:'Du hast addiert. Der Außenbeitrag ist Exporte minus Importe.'},{wert:-5,text:'Andersherum: Exporte minus Importe, also 40 − 35.'}],
    e:'40 − 35 = 5 Mrd. €: ein Exportüberschuss. Er fließt über die Banken ins Ausland.'},
  {afb:2,art:'reihe',p:2,werkstatt:'schockwellen',f:'Viele Menschen haben Angst um ihren Job und sparen mehr. Bring die Wirkungskette in die richtige Reihenfolge.',
    schritte:['Die Haushalte sparen mehr.','Die Haushalte kaufen weniger ein.','Die Unternehmen verkaufen weniger.','Die Unternehmen produzieren weniger und zahlen weniger Lohn.','Das Einkommen der Haushalte sinkt.'],
    e:'Jeder Schritt löst den nächsten aus. Am Ende sinkt sogar das Einkommen, obwohl jeder nur vorsichtig sein wollte: das Sparparadox.'},
  {afb:2,art:'wahl',werkstatt:'schockwellen',f:'Der Staat erhöht die Mehrwertsteuer. Welcher Strom wird direkt dicker?',
    o:['Indirekte Steuern (T<sub>ind</sub>)','Direkte Steuern (T<sub>dir</sub>)','Transferzahlungen (Z<sub>H</sub>)','Exporte (X)'],r:0,
    fehler:{1:'Direkte Steuern zahlen die Haushalte auf ihr Einkommen, zum Beispiel die Lohnsteuer. Die Mehrwertsteuer steckt im Preis.',2:'Transfers zahlt der Staat aus. Eine Steuererhöhung bringt ihm Geld ein.',3:'Die Mehrwertsteuer gilt für Käufe im Inland. Mit Exporten hat sie nichts zu tun.'},
    e:'Die Mehrwertsteuer ist eine indirekte Steuer: Die Kunden zahlen sie mit dem Preis, die Unternehmen führen sie an den Staat ab.'},
  {afb:2,art:'offen',op:'erklären',werkstatt:'banken',f:'Erkläre, warum im Kreislauf mit Banken die Ersparnis der Haushalte gleich den Investitionen der Unternehmen sein muss.',
    anfaenge:['Was die Haushalte sparen, …','Damit die Unternehmen ausgeglichen sind, …'],
    erwartung:[{t:'Sparen reißt eine Lücke: Den Unternehmen fehlt dieser Teil des Konsums als Einnahme.',w:[['spar'],['fehl','lücke','weniger','konsum']],tipp:'Was fehlt den Unternehmen, wenn die Haushalte einen Teil ihres Einkommens sparen?'},
      {t:'Die Banken geben das Ersparte als Kredit weiter, die Unternehmen investieren es. Nur wenn S = I, fließt alles zurück und jeder Sektor ist ausgeglichen.',w:[['bank','kredit'],['investi']],tipp:'Wohin bringen die Banken das gesparte Geld?'}],
    muster:'Was die Haushalte sparen, geben sie nicht für Konsum aus. Dadurch fehlt den Unternehmen dieser Teil ihrer Einnahmen, es entsteht eine Lücke. Die Banken geben das Ersparte als Kredit an die Unternehmen weiter, die damit investieren, zum Beispiel in einen neuen Ofen. Deshalb müssen Sparen und Investitionen gleich groß sein, damit alle Sektoren ausgeglichen sind.'},

  /* ---------- Stufe III: Beurteilen ---------- */
  {afb:3,art:'offen',op:'beurteilen',werkstatt:'schockwellen',f:'Beurteile die Aussage: „Wenn alle mehr sparen, geht es allen besser.“',
    anfaenge:['Einerseits …','Andererseits zeigt der Kreislauf, dass …','Insgesamt halte ich die Aussage für …, weil …'],
    erwartung:[{t:'Dafür: Wer spart, hat Rücklagen für Notfälle, Gespartes ermöglicht Kredite und Investitionen.',w:[['rücklage','notfall','notgroschen','vorsorge','investi','kredit']],tipp:'Was spricht für das Sparen? Denk an den Notgroschen und an die Banken.'},
      {t:'Dagegen: Sparen alle gleichzeitig, sinkt der Konsum, die Unternehmen verkaufen weniger, Einkommen und Arbeitsplätze gehen verloren (Sparparadox).',w:[['konsum','kaufen','umsatz','verkauf'],['einkommen','lohn','arbeitsplätz','job','kurzarbeit','sinkt']],tipp:'Was passiert im Kreislauf, wenn alle gleichzeitig weniger kaufen?'},
      {t:'Eigenes Urteil mit Begründung.',w:'urteil',tipp:'Am Ende fehlt dein eigenes Urteil: „Insgesamt halte ich die Aussage für …, weil …“.'}],
    muster:'Einerseits ist Sparen für jeden Einzelnen sinnvoll, denn mit Rücklagen kann man Notfälle bezahlen. Außerdem können die Banken das Ersparte als Kredit für Investitionen verleihen. Andererseits zeigt der Kreislauf, dass weniger Konsum für die Unternehmen weniger Umsatz bedeutet. Wenn alle gleichzeitig sparen, verkaufen sie weniger, produzieren weniger, und das Einkommen der Haushalte sinkt, weil Arbeitsplätze verloren gehen. Insgesamt halte ich die Aussage für zu einfach, weil Sparen nur dann allen hilft, wenn das Geld auch investiert wird.'},
  {afb:3,art:'offen',op:'Stellung nehmen',werkstatt:'sichern',f:'Nimm Stellung: „Der Wirtschaftskreislauf ist ein gutes Modell, um Wirtschaft zu verstehen.“',
    anfaenge:['Für das Modell spricht, dass …','Allerdings lässt es weg, dass …','Ich finde deshalb …'],
    erwartung:[{t:'Dafür: Es zeigt übersichtlich, wie die Sektoren zusammenhängen und wie ein Ereignis andere Ströme verändert.',w:[['zusammenh','verbund','übersicht','wirkung','folge']],tipp:'Was kann man mit dem Modell gut erklären? Denk an die Schockwellen.'},
      {t:'Dagegen: Es vereinfacht stark, Preise, Zeit, Hausarbeit, Schwarzarbeit und Umwelt fehlen, die Werte sind gedacht.',w:[['vereinfach','fehl','weg','nicht'],['preis','zeit','umwelt','hausarbeit','schwarzarbeit','inflation','wirklich']],tipp:'Was zeigt das Modell nicht? Denk an Preise, Zeit oder die Umwelt.'},
      {t:'Eigenes Urteil mit Begründung.',w:'urteil',tipp:'Am Ende fehlt deine eigene Meinung: „Ich finde deshalb …, weil …“.'}],
    muster:'Für das Modell spricht, dass es übersichtlich zeigt, wie Haushalte, Unternehmen, Banken, Staat und Ausland zusammenhängen. Dadurch kann man abschätzen, welche Folgen ein Ereignis wie höhere Zölle hat. Allerdings vereinfacht es stark: Preise und Inflation fehlen, alles passiert gleichzeitig, und Hausarbeit, Schwarzarbeit oder die Umwelt kommen nicht vor. Ich finde deshalb, dass es ein gutes Modell für den Einstieg ist, weil man die Zusammenhänge versteht, aber keine genauen Vorhersagen machen kann.'}
  ]
};
