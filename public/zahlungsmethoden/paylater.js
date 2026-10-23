// Chat-Abenteuer „Jetzt kaufen, später zahlen“: Mit 18 im ersten Lehrjahr lockt beim Sneaker-Kauf „Später bezahlen“.
// Aufbau und Felder: siehe shared/js/chat.js. Alle Personen, Shops und Dienste sind erfunden.
export const PAYLATER_CHAT={id:'paylater-chat',titel:'Drei Jahre später in Erfurt: Du bist 18, im ersten Lehrjahr und willst diese Sneaker. Auf dem Konto: 80 €.',start:'start',
  check:{name:'Finanz-Check',icon:'savings'},
  kontakte:{
    shop:{name:'SneakFlex Shop (fiktiv)',icon:'storefront'},
    later:{name:'Zahlspäter-App (fiktiv)',icon:'schedule'},
    ben:{name:'Ben, dein Kumpel',icon:'person'},
    mama:{name:'Mama',icon:'favorite'},
    inkasso:{name:'Forderungsmanagement Nord GmbH (fiktiv)',icon:'warning'}},
  szenen:{
    start:{n:[
      {info:'Freitagabend. Die Sneaker kosten 120 €. Auf deinem Konto sind 80 €, die Ausbildungsvergütung kommt in drei Wochen.'},
      {von:'shop',t:'Nur noch 2 Paar in deiner Größe! Jetzt kaufen, in 30 Tagen bezahlen. 0 % Zinsen!'},
      {von:'ben',t:'Hol sie dir, ich hab meine auch mit Später-Bezahlen gekauft.'}],
      wahl:[
        {t:'Später bezahlen, zwei Klicks',weiter:'gekauft'},
        {t:'Ben, wie läuft das bei dir so?',sag:true,weiter:'ben'},
        {t:'Warten, bis das Geld da ist',weiter:'sparen'}]},
    ben:{n:[
      {von:'ben',t:'Ehrlich? Ich hab grad drei offene Rechnungen bei verschiedenen Apps. Keine Ahnung, wann welche fällig ist'},
      {recht:'„Später bezahlen“ fühlt sich nicht wie Geld ausgeben an. Genau deshalb verlieren viele den Überblick. Wer mehrere Rechnungen bei verschiedenen Diensten hat, vergisst leicht eine Frist.'}],
      wahl:[
        {t:'Egal, ich bezahl später',weiter:'gekauft'},
        {t:'Lieber warten, bis die Vergütung da ist',weiter:'sparen'}]},
    gekauft:{n:[
      {tat:'Du tippst auf „Später bezahlen“.'},
      {von:'later',t:'Zahlung aufgeschoben Fällig in 30 Tagen: 120,00 €.'},
      {recht:'Ein Zahlungsaufschub ist ein kleiner Kredit: Jemand zahlt für dich, du zahlst später zurück. Ab dem 20. November 2026 gelten dafür strengere Regeln. Der Anbieter muss vorher prüfen, ob du das Geld zurückzahlen kannst.'},
      {info:'Eine Woche später, Sonntagabend.'},
      {von:'shop',t:'Passend zu deinen Sneakern: Hoodie 45 € und Cap 25 €. Wieder einfach später bezahlen?'}],
      wahl:[
        {t:'Gönn ich mir, später bezahlen',weiter:'stapel'},
        {t:'Nein. Erinnerung für die 120 € in den Kalender',weiter:'puenktlich'}]},
    stapel:{n:[
      {info:'30 Tage später. Fällig: 120 € und eine Woche danach 70 €. Auf deinem Konto: 140 €, und die Miete fürs Wohnheim geht auch noch ab.'},
      {von:'later',t:'Erinnerung: 120,00 € sind morgen fällig.'}],
      wahl:[
        {t:'Ignorieren, das wird schon',weiter:'mahnung'},
        {t:'In der App auf Ratenzahlung umstellen',weiter:'raten'},
        {t:'Mama anrufen und ehrlich sein',weiter:'mama'}]},
    mahnung:{n:[
      {von:'later',t:'Zahlung überfällig. Mahngebühr: 3,00 €.'},
      {info:'Du schiebst es weiter auf. Sechs Wochen später kommt ein Brief.'},
      {von:'inkasso',t:'Offene Forderung 190,00 € plus Mahn- und Inkassokosten 54,50 €. Zahlen Sie innerhalb von 7 Tagen.'},
      {recht:'Wer nicht zahlt, bekommt Mahnungen. Dann übernimmt oft ein Inkassobüro, und die Kosten wachsen. Unbezahlte, angemahnte Schulden können bei der SCHUFA landen. Dann gibt es später Probleme beim Handyvertrag oder bei der Wohnung.'}],
      wahl:[
        {t:'Zur kostenlosen Schuldnerberatung gehen',ende:'inkasso'}]},
    raten:{n:[
      {von:'later',t:'Ratenzahlung aktiviert: 6 Raten à 33,60 €. Effektiver Jahreszins inklusive.'},
      {recht:'Aus 190 € werden 201,60 €. Die Ratenzahlung kostet Zinsen, und du zahlst ein halbes Jahr für Sachen, die du schon trägst. Vor jeder Ratenzahlung lohnt der Blick auf den Gesamtbetrag.'}],
      wahl:[{t:'Abstottern',ende:'raten'}]},
    mama:{n:[
      {ich:'Mama, ich hab Mist gebaut. Ich hab zu viel auf später bezahlt.'},
      {von:'mama',t:'Gut, dass du es sagst. Wir machen jetzt zusammen einen Haushaltsplan. Ich leih dir die 50 €, du zahlst sie mir in zwei Monaten zurück.'},
      {recht:'Ehrlich sein und früh handeln ist der beste Weg aus Schulden. Ein Haushaltsplan zeigt, was jeden Monat reinkommt und rausgeht. Kostenlose Hilfe gibt es auch bei der Schuldnerberatung der Verbraucherzentrale, der Caritas oder der Diakonie.'}],
      wahl:[{t:'Haushaltsplan machen',ende:'mama'}]},
    puenktlich:{n:[
      {info:'Drei Wochen später kommt die Ausbildungsvergütung. Dein Kalender erinnert dich.'},
      {von:'later',t:'Zahlung eingegangen 120,00 €. Danke!'},
      {recht:'Pünktlich bezahlt kostet „Später bezahlen“ nichts. Aber: Hätte die Vergütung später geklappt oder wäre etwas dazwischengekommen, wäre es schnell teuer geworden.'}],
      wahl:[{t:'Puh, durchatmen',ende:'puenktlich'}]},
    sparen:{n:[
      {info:'Drei Wochen später ist die Ausbildungsvergütung da.'},
      {von:'shop',t:'Die Sneaker gibt es wieder, jetzt sogar 15 € günstiger!'},
      {recht:'Erst sparen, dann kaufen: keine Schulden, keine Fristen, keine Mahngebühren. „Nur noch 2 Paar!“ ist oft nur ein Verkaufstrick, der dich unter Zeitdruck setzt.'}],
      wahl:[{t:'Mit der Karte bezahlen, mein Geld, meine Sneaker',ende:'gespart'}]}},
  enden:{
    gespart:{titel:'Erst sparen, dann kaufen',art:'gut',t:'Du hast gewartet, gespart und am Ende sogar weniger bezahlt. Keine Schulden, kein Stress.'},
    puenktlich:{titel:'Gerade noch gut gegangen',art:'mittel',t:'Pünktlich bezahlt, keine Kosten. Aber du hast Geld ausgegeben, das du noch nicht hattest.'},
    raten:{titel:'Teuer abgestottert',art:'mittel',t:'Mit der Ratenzahlung hast du den Ärger vermieden, aber Zinsen bezahlt und bist ein halbes Jahr gebunden.'},
    mama:{titel:'Ehrlich ist der beste Plan',art:'mittel',t:'Du hast rechtzeitig Hilfe geholt. Mit einem Haushaltsplan kommst du wieder raus.'},
    inkasso:{titel:'Die Schuldenfalle',art:'schlecht',t:'Aus 190 € wurden fast 250 €, und ein SCHUFA-Eintrag droht. Die Schuldnerberatung hilft dir kostenlos, einen Plan zu machen.'}}
};
