// Lernwerkstatt Der Wirtschaftskreislauf: Zahlen, Fotos, Sektoren, Ströme, Stufen des Modells, Euro-Reise und Schockwellen.
// Das Modell (modell.js) zeichnet daraus den Kreislauf. Alle Beträge im Modell sind gedachte Milliarden Euro (Szenario).

export const STAND='Oktober 2026';
export const ZAHLEN={
  sparquote:10.3,        // Sparquote der privaten Haushalte, 1. Halbjahr 2025 (Destatis, Oktober 2025)
  exporte:1563,          // Warenexporte 2025 in Mrd. € (Destatis, Februar 2026)
  importe:1362.5,        // Warenimporte 2025 in Mrd. €
  ueberschuss:200.5,     // Exportüberschuss 2025 in Mrd. €
  autoUSA:-17.8,         // Exporte von Autos und Autoteilen in die USA 2025 gegenüber 2024 in %
  mindestlohn27:14.60,   // Mindestlohn ab 1. Januar 2027 (Mindestlohnkommission, Juni 2025)
  kindergeld:259         // Kindergeld pro Kind und Monat 2026
};

export const FOTO={
  baeckerei:{motiv:'Bäckerei in Jena',src:'img/baeckerei-jena.jpg',alt:'Bäckerei am Johannisplatz in Jena: Schaufenster mit Brötchen und Kaffee im Erdgeschoss eines alten Hauses',credit:'Timk70 / Wikimedia Commons, CC BY-SA 4.0',
    link:'https://commons.wikimedia.org/wiki/File:Baeckerei_Zwiebel_%26_CiZ,_Jena,_Johannisplatz_9_%26_10.jpg',lizenz:'https://creativecommons.org/licenses/by-sa/4.0/'}
};

/* ---------- Sektoren ----------
   x, y: Mitte des Kastens im Diagramm (viewBox 640 × 620, Anordnung wie auf dem Arbeitsblatt), stufe: ab dieser Stufe dabei */
export const SEKTOREN={
  h:{t:'Haushalte',kurz:'H',icon:'family_restroom',x:95,y:80,stufe:1},
  u:{t:'Unternehmen',kurz:'U',icon:'storefront',x:310,y:310,stufe:1},
  b:{t:'Banken',kurz:'VV',icon:'account_balance',x:95,y:530,stufe:2},
  s:{t:'Staat',kurz:'St',icon:'apartment',x:520,y:80,stufe:3},
  a:{t:'Ausland',kurz:'Ausl.',icon:'public',x:520,y:530,stufe:4}
};

/* ---------- Ströme ----------
   art: 'geld' oder 'gut'; sym/sub: Kürzel wie im Hefteintrag (C mit H tiefgestellt); off: Abstand zur Mittellinie zwischen den Sektoren;
   lt: Lage des Kürzels auf dem Pfeil (0 bis 1); weg: eigener Linienzug statt gerader Linie; icon, story: Karte zum Einzeichnen;
   tipp: Hinweis, wenn die Sektoren nicht stimmen */
export const STROEME=[
  // Stufe 1: einfacher Kreislauf (Peter und sein Döner)
  {id:'faktor',stufe:1,von:'h',nach:'u',art:'gut',sym:'Arbeit',name:'Produktionsfaktoren (Arbeit)',off:44,lt:.3,icon:'work',
    story:'Murat arbeitet bei Mr. Kebab in Jena.',tipp:'Murat gehört zu einem Haushalt. Wem stellt er seine Arbeitskraft zur Verfügung?'},
  {id:'y',stufe:1,von:'u',nach:'h',art:'geld',sym:'Y',name:'Einkommen (Volkseinkommen)',off:-14,lt:.7,icon:'payments',
    story:'Murat bekommt am Monatsende seinen Lohn.',tipp:'Wer zahlt Murat den Lohn, und wo landet das Geld?'},
  {id:'gueter',stufe:1,von:'u',nach:'h',art:'gut',sym:'Güter',name:'Konsumgüter und Dienstleistungen',off:-44,lt:.3,icon:'kebab_dining',
    story:'Peter bekommt seinen XXL-Döner.',tipp:'Wer stellt den Döner her, und wer isst ihn?'},
  {id:'ch',stufe:1,von:'h',nach:'u',art:'geld',sym:'C',sub:'H',name:'Konsumausgaben der Haushalte',off:14,lt:.7,icon:'shopping_cart',
    story:'Peter zahlt 7 € für seinen Döner.',tipp:'Peter ist ein Haushalt. Wer bekommt sein Geld?'},
  // Stufe 2: Banken (Vermögensveränderung)
  {id:'sh',stufe:2,von:'h',nach:'b',art:'geld',sym:'S',sub:'H',name:'Sparen der Haushalte',off:0,lt:.5,icon:'savings',
    story:'Lena legt jeden Monat 50 € aufs Sparkonto.',tipp:'Lena ist ein Haushalt. Wohin bringt sie das Geld, das sie nicht ausgibt?'},
  {id:'in',stufe:2,von:'b',nach:'u',art:'geld',sym:'I',sub:'n',name:'Nettoinvestitionen',off:0,lt:.5,icon:'construction',
    story:'Eine Bäckerei in Apolda leiht sich Geld für einen neuen Ofen.',tipp:'Woher bekommt die Bäckerei das Geld für den Ofen, und wer ist die Bäckerei?'},
  // Stufe 3: Staat
  {id:'tdir',stufe:3,von:'h',nach:'s',art:'geld',sym:'T',sub:'dir',name:'Direkte Steuern',off:-14,lt:.35,icon:'receipt_long',
    story:'Von Lenas Lohn geht Lohnsteuer ab.',tipp:'Wer zahlt die Lohnsteuer, und wer bekommt sie?'},
  {id:'zh',stufe:3,von:'s',nach:'h',art:'geld',sym:'Z',sub:'H',name:'Transferzahlungen an Haushalte',off:14,lt:.35,icon:'family_restroom',
    story:'Familie Schulz aus Erfurt bekommt Kindergeld.',tipp:'Familie Schulz ist ein Haushalt. Wer zahlt das Kindergeld?'},
  {id:'tind',stufe:3,von:'u',nach:'s',art:'geld',sym:'T',sub:'ind',name:'Indirekte Steuern',off:-30,lt:.75,icon:'sell',
    story:'Mr. Kebab führt die Mehrwertsteuer aufs Döner-Geld ab.',tipp:'Die Mehrwertsteuer steckt im Preis. Wer überweist sie, und an wen?'},
  {id:'zu',stufe:3,von:'s',nach:'u',art:'geld',sym:'Z',sub:'U',name:'Subventionen an Unternehmen',off:0,lt:.5,icon:'solar_power',
    story:'Der Staat fördert eine Solarfirma in Erfurt.',tipp:'Eine Firma ist ein Unternehmen. Wer gibt ihr Fördergeld?'},
  {id:'cst',stufe:3,von:'s',nach:'u',art:'geld',sym:'C',sub:'St',name:'Konsum des Staates',off:30,lt:.2,icon:'tablet',
    story:'Der Freistaat kauft neue Tablets für eure Schule.',tipp:'Wer bezahlt die Tablets, und wer verkauft sie?'},
  {id:'kr',stufe:3,von:'b',nach:'s',art:'geld',sym:'KR',sub:'St',name:'Kreditaufnahme des Staates',lt:.3,icon:'request_quote',
    weg:[[95,564],[95,602],[628,602],[628,80],[610,80]],
    story:'Der Staat leiht sich Geld bei den Banken.',tipp:'Wer leiht sich hier Geld, und wer verleiht es?'},
  // Stufe 4: Ausland
  {id:'x',stufe:4,von:'a',nach:'u',art:'geld',sym:'X',name:'Exporte (Geld fürs Ausland verkaufte Waren)',off:14,lt:.3,icon:'local_shipping',
    story:'Eine Firma aus Eisenach verkauft Autoteile nach Frankreich.',tipp:'Für einen Export bezahlt der Kunde im Ausland. Wohin fließt sein Geld?'},
  {id:'m',stufe:4,von:'u',nach:'a',art:'geld',sym:'M',name:'Importe (Geld für Waren aus dem Ausland)',off:-14,lt:.3,icon:'smartphone',
    story:'Ein Händler in Erfurt kauft Smartphones aus China ein.',tipp:'Der Händler ist ein Unternehmen. Wohin fließt sein Geld?'},
  {id:'xm',stufe:4,von:'b',nach:'a',art:'geld',sym:'X − M',name:'Außenbeitrag (Exportüberschuss)',off:0,lt:.5,icon:'currency_exchange',
    story:'Deutschland verkauft mehr ins Ausland, als es kauft. Das Plus wird im Ausland angelegt.',tipp:'Das übrige Geld wird über die Banken angelegt. Wo?'}
];

/* ---------- Stufen ----------
   werte: Beträge im Modell (Mrd. €), Zuflüsse = Abflüsse für jeden Sektor; rechnen: Aufgaben am Ende der Stufe */
export const STUFEN={
  1:{titel:'Der einfache Kreislauf',werte:{y:100,ch:100,faktor:100,gueter:100},
    rechnen:[{id:'ch',f:'Die Haushalte bekommen 100 Mrd. € Einkommen (Y). Wie hoch sind ihre Konsumausgaben im einfachen Kreislauf?',sym:'C',sub:'H',r:100,
      fehler:[{wert:0,text:'Im einfachen Kreislauf sparen die Haushalte nichts. Sie geben alles aus.'}],
      e:'Alles, was reinkommt, geht auch wieder raus: Y = C<sub>H</sub> = 100. Der Sektor ist ausgeglichen.'}]},
  2:{titel:'Banken',werte:{y:100,ch:85,sh:15,in:15},
    rechnen:[{id:'sh',f:'Die Haushalte bekommen 100 Mrd. € und geben 85 Mrd. € aus. Wie viel sparen sie?',sym:'S',sub:'H',r:15,
      fehler:[{wert:185,text:'Du hast addiert. Gespart wird, was vom Einkommen übrig bleibt: 100 − 85.'}],
      e:'100 − 85 = 15. Die Haushalte sind ausgeglichen: 100 rein, 85 + 15 raus.'},
      {id:'in',f:'Damit auch die Banken ausgeglichen sind: Wie viel können sie als Kredit für Investitionen weitergeben?',sym:'I',sub:'n',r:15,
      fehler:[{wert:85,text:'85 ist der Konsum. Die Banken geben weiter, was bei ihnen gespart wurde.'}],
      e:'Was gespart wird, wird investiert: S<sub>H</sub> = I<sub>n</sub> = 15. Die Lücke bei den Unternehmen ist geschlossen: 85 + 15 = 100.'}]},
  3:{titel:'Staat',werte:{y:100,zh:20,ch:80,sh:15,tdir:25,tind:15,zu:5,cst:20,in:10,kr:5},
    rechnen:[{id:'kr',f:'Der Staat nimmt 25 Mrd. € direkte und 15 Mrd. € indirekte Steuern ein. Er gibt 20 Mrd. € Transfers, 5 Mrd. € Subventionen und 20 Mrd. € für den Staatskonsum aus. Wie viel muss er sich leihen?',sym:'KR',sub:'St',r:5,
      fehler:[{wert:85,text:'Du hast alles addiert. Vergleiche: Einnahmen 25 + 15 = 40, Ausgaben 20 + 5 + 20 = 45.'},{wert:-5,text:'Der Staat gibt mehr aus, als er einnimmt. Wie viel fehlt ihm? Die Antwort ist positiv.'}],
      e:'Einnahmen 40, Ausgaben 45: Es fehlen 5. Die leiht sich der Staat bei den Banken.'},
      {id:'in',f:'Die Haushalte sparen 15 Mrd. €. Der Staat leiht sich 5 Mrd. € davon. Wie viel bleibt für Investitionen der Unternehmen?',sym:'I',sub:'n',r:10,
      fehler:[{wert:20,text:'Der Kredit für den Staat fehlt den Banken. Zieh ihn ab: 15 − 5.'}],
      e:'15 − 5 = 10. Was der Staat sich leiht, steht nicht mehr für Investitionen bereit.'}]},
  4:{titel:'Ausland',werte:{y:100,zh:20,ch:80,sh:15,tdir:25,tind:15,zu:5,cst:20,in:6,kr:5,x:30,m:26,xm:4},
    rechnen:[{id:'xm',f:'Die Unternehmen verkaufen für 30 Mrd. € ins Ausland (X) und kaufen für 26 Mrd. € im Ausland ein (M). Wie hoch ist der Außenbeitrag?',sym:'X − M',r:4,
      fehler:[{wert:56,text:'Du hast addiert. Der Außenbeitrag ist der Unterschied: Exporte minus Importe.'},{wert:-4,text:'Andersherum: Exporte minus Importe, also 30 − 26.'}],
      e:'30 − 26 = 4. Deutschland verkauft mehr, als es kauft: ein Exportüberschuss.'},
      {id:'in',f:'Von 15 Mrd. € Erspartem leiht sich der Staat 5 Mrd. €, 4 Mrd. € werden im Ausland angelegt. Was bleibt für Investitionen?',sym:'I',sub:'n',r:6,
      fehler:[{wert:10,text:'Auch der Außenbeitrag geht von der Ersparnis ab: 15 − 5 − 4.'},{wert:24,text:'Die Kredite an Staat und Ausland werden abgezogen, nicht addiert.'}],
      e:'15 − 5 − 4 = 6. Jetzt sind alle fünf Sektoren ausgeglichen.'}]}
};

/* ---------- Einstieg: Ein Euro auf Reise ----------
   Stationen im Kreis, an jeder Station drei Tipps; r ist der echte Weg. Die anderen Tipps zeigen schon Banken, Staat und Ausland. */
export const REISE=[
  {wer:'Peter',sektor:'Haushalt',icon:'person',weg:'Peter kauft bei Mr. Kebab einen Döner.',gegen:'Döner',
    frage:'Peter (15) hat Hunger. Wohin wandert sein Euro?',
    o:[{t:'Zu Mr. Kebab: ein Döner',icon:'kebab_dining'},{t:'Unters Kopfkissen',icon:'savings'},{t:'Ans Finanzamt',icon:'apartment'}],r:0},
  {wer:'Mr. Kebab',sektor:'Unternehmen',icon:'kebab_dining',weg:'Mr. Kebab zahlt Murat seinen Lohn.',gegen:'Arbeit',
    frage:'Mr. Kebab hat den Euro in der Kasse. Wohin geht er weiter?',
    o:[{t:'An einen Großhändler in Polen',icon:'public'},{t:'An Murat: sein Lohn',icon:'man'},{t:'Aufs Sparkonto der Firma',icon:'account_balance'}],r:1},
  {wer:'Murat',sektor:'Haushalt',icon:'man',weg:'Murat kauft neue Fußballschuhe im Sporthaus.',gegen:'Fußballschuhe',
    frage:'Murat hat seinen Lohn. Was macht er mit dem Euro?',
    o:[{t:'Lohnsteuer ans Finanzamt',icon:'receipt_long'},{t:'Online-Shop in China',icon:'smartphone'},{t:'Neue Fußballschuhe im Sporthaus',icon:'sports_soccer'}],r:2},
  {wer:'Sporthaus Jena',sektor:'Unternehmen',icon:'sports_soccer',weg:'Das Sporthaus zahlt Verkäuferin Sandra ihren Lohn.',gegen:'Arbeit',
    frage:'Das Sporthaus in Jena hat den Euro. Und jetzt?',
    o:[{t:'An Verkäuferin Sandra: ihr Lohn',icon:'woman'},{t:'An die Bank: Kredit abzahlen',icon:'account_balance'},{t:'An einen Hersteller in Vietnam',icon:'public'}],r:0},
  {wer:'Sandra',sektor:'Haushalt',icon:'woman',weg:'Sandra gibt Peter Taschengeld.',gegen:null,
    frage:'Sandra ist Peters Mutter. Wohin wandert der Euro?',
    o:[{t:'Stromrechnung bei den Stadtwerken',icon:'bolt'},{t:'An Peter: Taschengeld',icon:'person'},{t:'Urlaub auf Mallorca',icon:'flight'}],r:1}
];

/* ---------- Schockwellen ----------
   stufe: Modell, auf dem die Welle läuft; quelle: echt oder Szenario; kette: Schritte der Wirkungskette mit den Strömen,
   die dicker (+1) oder dünner (−1) werden. frage, optionen, r, e: Live-Abstimmung „Ihr seid die Wirtschaftsforscher“. */
export const SCHOCKS=[
  {id:'mindestlohn',stufe:1,icon:'payments',titel:'Mindestlohn steigt',
    meldung:`Der Mindestlohn steigt am 1. Januar 2027 auf ${ZAHLEN.mindestlohn27.toFixed(2).replace('.',',')} € pro Stunde.`,quelle:'Echt: Beschluss der Mindestlohnkommission, Juni 2025',
    frage:'Was passiert im einfachen Kreislauf mit dem Konsum der Haushalte (C<sub>H</sub>)?',
    optionen:['Er steigt um genauso viel wie das Einkommen','Er bleibt gleich','Er sinkt'],r:0,
    e:'Im einfachen Kreislauf geben die Haushalte alles aus, was sie verdienen. Steigt Y, steigt C<sub>H</sub> genauso. In Wirklichkeit sparen sie einen Teil davon.',
    kette:[{t:'Die Unternehmen zahlen höhere Löhne.',d:{y:1}},{t:'Die Haushalte haben mehr Geld und kaufen mehr.',d:{ch:1}},{t:'Die Unternehmen nehmen mehr ein. Der Kreislauf ist wieder ausgeglichen, nur größer.',d:{}}]},
  {id:'angst',stufe:2,icon:'savings',titel:'Alle sparen mehr',
    meldung:'Viele Menschen haben Angst um ihren Job. Sie geben weniger aus und legen mehr Geld zur Seite.',quelle:'Szenario',
    frage:'Was passiert danach mit dem Einkommen der Haushalte (Y)?',
    optionen:['Es steigt','Es bleibt gleich','Es sinkt'],r:2,
    e:'Wer weniger kauft, ist für die Unternehmen ein Kunde weniger. Sie produzieren weniger und brauchen weniger Arbeit. Das Einkommen sinkt, obwohl jeder Einzelne nur vorsichtig sein wollte. Das nennt man das Sparparadox.',
    kette:[{t:'Die Haushalte sparen mehr.',d:{sh:1}},{t:'Sie kaufen weniger ein.',d:{ch:-1}},{t:'Die Unternehmen verkaufen weniger und investieren nicht, obwohl die Banken mehr Geld haben.',d:{in:-1}},{t:'Die Unternehmen produzieren weniger: Kurzarbeit, weniger Lohn.',d:{y:-1}}]},
  {id:'werk',stufe:2,icon:'factory',titel:'Ein neues Werk',
    meldung:'Ein Chiphersteller baut ein neues Werk am Erfurter Kreuz und leiht sich dafür Geld bei den Banken.',quelle:'Schlagzeile (erfunden)',
    frage:'Welcher Strom wird zuerst dicker?',
    optionen:['Die Investitionen (I<sub>n</sub>)','Der Konsum der Haushalte (C<sub>H</sub>)','Das Sparen der Haushalte (S<sub>H</sub>)'],r:0,
    e:'Zuerst fließt das geliehene Geld als Investition zu den Unternehmen. Baufirmen bekommen Aufträge und stellen Leute ein. Erst danach steigen Einkommen und Konsum.',
    kette:[{t:'Die Banken geben Kredit für das neue Werk.',d:{in:1}},{t:'Baufirmen bekommen Aufträge und stellen Leute ein.',d:{y:1}},{t:'Mit mehr Einkommen kaufen die Haushalte mehr.',d:{ch:1}}]},
  {id:'schulen',stufe:3,icon:'school',titel:'Schulen sanieren',
    meldung:'Thüringen saniert 100 Schulen. Die Steuern sollen dafür nicht steigen.',quelle:'Schlagzeile (erfunden)',
    frage:'Woher kommt das Geld für die Schulen?',
    optionen:['Kredite bei den Banken (KR<sub>St</sub>)','Mehr Subventionen an Unternehmen (Z<sub>U</sub>)','Weniger Konsum der Haushalte (C<sub>H</sub>)'],r:0,
    e:'Ohne höhere Steuern leiht sich der Staat das Geld. Dann bestellt er bei Baufirmen (Staatskonsum), die Löhne zahlen. Über die Lohnsteuer kommt ein Teil des Geldes zum Staat zurück.',
    kette:[{t:'Der Staat leiht sich Geld bei den Banken.',d:{kr:1}},{t:'Er bezahlt Baufirmen für die Sanierung.',d:{cst:1}},{t:'Die Baufirmen zahlen mehr Löhne.',d:{y:1}},{t:'Die Haushalte kaufen mehr und zahlen mehr Lohnsteuer.',d:{ch:1,tdir:1}}]},
  {id:'kindergeld',stufe:3,icon:'family_restroom',titel:'Mehr Kindergeld',
    meldung:`Der Staat erhöht das Kindergeld um 20 € auf ${ZAHLEN.kindergeld+20} € im Monat.`,quelle:'Szenario',
    frage:'Was merken die Unternehmen davon?',
    optionen:['Mehr Umsatz, weil Familien mehr kaufen','Weniger Umsatz, weil sie mehr Steuern zahlen','Nichts, das Kindergeld bekommen nur die Familien'],r:0,
    e:'Familien geben das zusätzliche Geld zum großen Teil aus, zum Beispiel für Kleidung, Essen oder Sport. Das ist Umsatz für die Unternehmen. Bezahlen muss der Staat es aus Steuern oder Krediten.',
    kette:[{t:'Der Staat zahlt mehr Kindergeld.',d:{zh:1}},{t:'Die Familien kaufen mehr ein.',d:{ch:1}},{t:'Die Unternehmen verkaufen mehr und zahlen mehr Lohn.',d:{y:1}},{t:'Bezahlt wird mit Krediten oder später mit Steuern.',d:{kr:1}}]},
  {id:'zoelle',stufe:4,icon:'directions_car',titel:'Zölle in den USA',
    meldung:`Die USA verlangen seit 2025 höhere Zölle. Die Exporte von Autos und Autoteilen in die USA sanken 2025 um ${String(-ZAHLEN.autoUSA).replace('.',',')} %.`,quelle:'Echt: Statistisches Bundesamt, Februar 2026',
    frage:'Welcher Strom wird zuerst dünner?',
    optionen:['Die Exporte (X)','Die Importe (M)','Der Konsum des Staates (C<sub>St</sub>)'],r:0,
    e:'Kunden in den USA kaufen weniger deutsche Autos, also fließt weniger Geld aus dem Ausland zu uns. Das trifft auch Zulieferer in Thüringen, zum Beispiel rund um Eisenach.',
    kette:[{t:'Kunden in den USA kaufen weniger Autos aus Deutschland.',d:{x:-1}},{t:'Der Außenbeitrag schrumpft.',d:{xm:-1}},{t:'Autobauer und Zulieferer melden Kurzarbeit an: weniger Lohn.',d:{y:-1}},{t:'Die Haushalte kaufen weniger.',d:{ch:-1}}]},
  {id:'temu',stufe:4,icon:'shopping_bag',titel:'Alle bestellen in China',
    meldung:'Immer mehr Leute bestellen Kleidung und Gadgets direkt bei Temu und Shein.',quelle:'Szenario',
    frage:'Was passiert mit dem Außenbeitrag (X − M)?',
    optionen:['Er steigt','Er sinkt','Er bleibt gleich'],r:1,
    e:'Mehr Importe heißt: Mehr Geld fließt ins Ausland. Der Außenbeitrag (Exporte minus Importe) wird kleiner. Läden in Thüringen verkaufen weniger und brauchen weniger Personal.',
    kette:[{t:'Mehr Geld fließt für Importe ins Ausland.',d:{m:1}},{t:'Der Außenbeitrag schrumpft.',d:{xm:-1}},{t:'Läden in Erfurt und Jena verkaufen weniger und sparen Personal.',d:{y:-1}}]}
];
