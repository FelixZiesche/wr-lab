// Lernwerkstatt Haushaltsplan und Schulden: Zahlen, Fotos und das Haushaltsspiel „Benjamins Monat“.
// Zahlen gerundet, Stand und Quelle stehen in QUELLEN (Quellenliste des Themas).

export const STAND='Oktober 2026';

/* ---------- Zahlen ---------- */
export const ZAHLEN={
  azubiBrutto:1209,     // tarifliche Ausbildungsvergütung im Schnitt, alle Lehrjahre (BIBB, Stand 1. Oktober 2025)
  kindergeld:259,       // pro Kind und Monat seit Januar 2026
  dticket:63,           // Deutschlandticket seit Januar 2026
  rundfunk:18.36,       // Rundfunkbeitrag pro Wohnung und Monat
  dispoSchnitt:11,      // durchschnittlicher Dispozins in % (Stiftung Warentest, Mai 2026: 10,99 %)
  ueberschuldet:5.67,   // überschuldete Erwachsene in Mio. (SchuldnerAtlas 2025, Creditreform)
  quote:8.2,            // Überschuldungsquote in % (8,16 %)
  schuldenBeratung:34650,// durchschnittliche Schulden der Ratsuchenden in der Schuldnerberatung 2025 (Destatis, Juli 2026)
  beratene:187000,      // beratene Personen 2025
  konsum:3030,          // Konsumausgaben je Haushalt und Monat (EVS 2023)
  wohnenEssen:52,       // Anteil Wohnen und Ernährung am Konsum, alle Haushalte (EVS 2023)
  wohnenEssenArm:64     // bei weniger als 1.300 € Nettoeinkommen
};

/* Benjamins Lohnzettel: 2. Lehrjahr, 1.050 € brutto, Steuerklasse I, Beitragssätze 2026 (Anteil des Arbeitnehmers).
   Keine Lohnsteuer: Das Jahreseinkommen liegt nach den Pauschalen unter dem Grundfreibetrag (12.348 €). */
export const LOHN={brutto:1050,abzuege:[
  {t:'Rentenversicherung',satz:9.3,betrag:97.65,icon:'elderly'},
  {t:'Krankenversicherung',satz:8.75,betrag:91.88,icon:'personal_injury'},
  {t:'Pflegeversicherung',satz:1.8,betrag:18.9,icon:'elderly_woman'},
  {t:'Arbeitslosenversicherung',satz:1.3,betrag:13.65,icon:'work'},
  {t:'Lohnsteuer',satz:0,betrag:0,icon:'account_balance',info:'0 €: Benjamin verdient im Jahr weniger als den Grundfreibetrag.'}],netto:827.92};

/* Konsumausgaben je Haushalt und Monat (Destatis, Laufende Wirtschaftsrechnungen 2022), Anteile gerundet */
export const AUSGABEN=[
  {id:'wohnen',t:'Wohnen und Energie',icon:'home',anteil:36},
  {id:'essen',t:'Lebensmittel',icon:'shopping_basket',anteil:15},
  {id:'verkehr',t:'Verkehr (Auto, Bus, Bahn)',icon:'directions_car',anteil:12},
  {id:'freizeit',t:'Freizeit, Sport und Kultur',icon:'sports_soccer',anteil:9},
  {id:'gastro',t:'Restaurants und Urlaub im Hotel',icon:'coffee',anteil:6}];
// Rest: Einrichtung 6 %, Kommunikation 4 %, Gesundheit 4 %, Kleidung 4 %, Sonstiges 4 %

/* Gläubiger der Ratsuchenden in der Schuldnerberatung 2025: Anteil der Personen mit Rückständen (Destatis, Juli 2026) */
export const GLAEUBIGER=[
  {id:'staat',t:'Ämter und Behörden (Finanzamt, Jobcenter, Krankenkasse)',icon:'account_balance',anteil:57},
  {id:'handy',t:'Handy- und Internetanbieter',icon:'smartphone',anteil:47},
  {id:'bank',t:'Banken (Ratenkredite)',icon:'credit_card',anteil:37},
  {id:'online',t:'Online- und Versandhandel',icon:'shopping_bag',anteil:29}];

/* ---------- Fotos (Wikimedia Commons, freie Lizenzen) ---------- */
export const FOTO={
  gotha:{motiv:'Neumarkt Gotha',src:'img/gotha.jpg',alt:'Verschneiter Neumarkt in Gotha mit der Margarethenkirche und Wohnhäusern',credit:'Roeland P. / Wikimedia Commons, CC0',
    link:'https://commons.wikimedia.org/wiki/File:2026-01-26-Neumarkt-Gotha-Schnee.jpg',lizenz:'https://creativecommons.org/publicdomain/zero/1.0/'},
  supermarkt:{motiv:'Supermarkt-Regale',src:'img/supermarkt.jpg',alt:'Lange Regale in einem Supermarkt, daneben Kühltruhen',credit:'The real Marcoman / Wikimedia Commons, CC0',
    link:'https://commons.wikimedia.org/wiki/File:Netto_Marken-Discount_Innenansicht_(4).jpg',lizenz:'https://creativecommons.org/publicdomain/zero/1.0/'},
  cafe:{motiv:'Café Stilbruch Jena',src:'img/cafe-jena.jpg',alt:'Café in Jena am Abend: Außentische auf Kopfsteinpflaster, drinnen sitzen Gäste im warmen Licht',credit:'Sebastian Wallroth / Wikimedia Commons, CC BY 4.0',
    link:'https://commons.wikimedia.org/wiki/File:Jena_2023_002.jpg',lizenz:'https://creativecommons.org/licenses/by/4.0/'}
};

/* ---------- Benjamins Monat ----------
   Haushaltsspiel (monat.js): vier Monate, pro Monat Entscheidungen und ein Ereignis. Beträge in Euro.
   Entscheidung {id, art:'fix'|'variabel'|'einmal'|'kuendigen', kat, icon, frage, text?, optionen:[{t, sub?, icon, betrag, einmal?, laufzeit?, vertrag?, ausSpar?}]}
     fix:       betrag läuft als Vertrag jeden Monat weiter, laufzeit in Monaten (ohne laufzeit monatlich kündbar, frist: Kündigungsfrist)
     variabel:  betrag nur in diesem Monat (Lebensmittel und Alltag, jeden Monat neu)
     einmal:    einmalige Ausgabe; ausSpar: zuerst vom Sparkonto
     kuendigen: Liste der laufenden Verträge zum Kündigen
   Ereignis {id, icon, kanal, titel, text, frage, wahl:[{t, art:'ok'|'amb'|'bad', folge, einmal?, vertrag?, ausSpar?, ohne?}]}
     einmal und vertrag dürfen Funktionen des Spielstands sein (k.o.wohnen = gewählte Wohnung), ohne:{vertrag, …} gilt,
     wenn dieser Vertrag fehlt. Ein negativer Betrag bei einmal ist eine Einnahme (z. B. ein Kredit). */
export const BENJAMIN={
  id:'hh-benjamin',
  titel:'Benjamins Monat: Kommst du mit dem Geld aus?',
  start:150,      // Kontostand am Anfang
  dispo:500,      // Dispo-Rahmen
  zins:12,        // Dispozins im Jahr (1 % im Monat)
  zinsUeber:16,   // Zins für die geduldete Überziehung über den Dispo hinaus
  ein:[{t:'Ausbildungsvergütung (netto)',betrag:827.92},{t:'Kindergeld (geben die Eltern weiter)',betrag:259}],
  pflicht:[{t:'Rundfunkbeitrag',betrag:18.36,kat:'Wohnen'}],
  zukunft:['März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember','Januar','Februar'],
  monate:[
  {name:'November',titel:'Einzug',text:'Benjamin zieht in Jena in seine erste eigene Bude. Ab jetzt zahlt er alles selbst.',
    entscheidungen:[
    {id:'wohnen',art:'fix',kat:'Wohnen',icon:'home',frage:'Wo wohnt Benjamin?',frist:3,
      optionen:[
        {t:'WG-Zimmer in Lobeda',sub:'15 m², drei Mitbewohner, Bad teilen',icon:'groups',betrag:385,kaution:780},
        {t:'1-Raum-Wohnung in Winzerla',sub:'28 m², Altbau, 15 Minuten mit der Straßenbahn',icon:'home',betrag:490,kaution:990},
        {t:'Neubau-Apartment in der Innenstadt',sub:'35 m², möbliert, mit Balkon',icon:'apartment',betrag:690,kaution:1560}],
      text:'Warmmiete mit Nebenkosten und Strom. Kündigungsfrist: drei Monate.'},
    {id:'mobil',art:'fix',kat:'Mobilität',icon:'train',frage:'Wie kommt Benjamin zur Werkstatt in Göschwitz und zur Berufsschule?',
      optionen:[
        {t:'Deutschlandticket',sub:'monatlich kündbar',icon:'train',betrag:63},
        {t:'Gebrauchtes Fahrrad',sub:'einmal 180 € über Kleinanzeigen, danach kostenlos',icon:'pedal_bike',betrag:0,einmal:180},
        {t:'Gebrauchter VW Polo auf Kredit',sub:'Rate 189 €, Versicherung 75 €, Sprit 90 €, 48 Monate',icon:'directions_car',betrag:354,laufzeit:48}]},
    {id:'handy',art:'fix',kat:'Handy und Internet',icon:'smartphone',frage:'Welchen Handytarif nimmt Benjamin?',
      optionen:[
        {t:'Prepaid mit 10 GB',sub:'monatlich kündbar',icon:'smartphone',betrag:10},
        {t:'Vertrag mit 50 GB',sub:'24 Monate Laufzeit',icon:'smartphone',betrag:25,laufzeit:24},
        {t:'Vertrag mit neuem iPhone 17 Pro',sub:'Handy inklusive, 24 Monate Laufzeit',icon:'devices',betrag:79,laufzeit:24}]},
    {id:'essen-1',art:'variabel',kat:'Lebensmittel und Alltag',icon:'shopping_basket',frage:'Wie kauft Benjamin im November ein?',
      text:'Lebensmittel, Drogerie, mal ein Döner: Das entscheidet er jeden Monat neu.',
      optionen:[
        {t:'Selbst kochen, Angebote, Eigenmarken',sub:'Meal-Prep für die ganze Woche',icon:'shopping_basket',betrag:200},
        {t:'Normal einkaufen, ab und zu ein Döner',sub:'',icon:'kebab_dining',betrag:270},
        {t:'Lieferdienst, Bäcker, Energydrinks',sub:'keine Lust zu kochen',icon:'local_drink',betrag:380}]}],
    ereignis:{id:'kaution',icon:'mail',kanal:'Mail vom Vermieter',titel:'Die Kaution ist fällig',
      text:k=>`Der Vermieter will drei Kaltmieten als Kaution: ${k.o.wohnen.kaution} €. Er hebt sie als Sicherheit auf und zahlt sie beim Auszug zurück.`,
      frage:'Wie zahlst du die Kaution?',
      wahl:[
        {t:'In drei Monatsraten',art:'ok',folge:'Dein gutes Recht: Nach § 551 BGB darfst du die Kaution in drei Monatsraten zahlen. So bleibt mehr Luft auf dem Konto.',
          vertrag:k=>({name:'Kaution (Rate)',kat:'Kaution',betrag:k.o.wohnen.kaution/3,laufzeit:3})},
        {t:'Alles auf einmal überweisen',art:'amb',folge:'Erlaubt, aber dein Konto rauscht in den Keller. Reicht das Geld nicht, rutschst du in den Dispo und zahlst Zinsen.',
          einmal:k=>k.o.wohnen.kaution,name:'Kaution',kat:'Kaution'},
        {t:'Die Eltern leihen mir das Geld',art:'amb',folge:'Ein Kredit ohne Zinsen, aber trotzdem Schulden: Du zahlst den Eltern jeden Monat 100 € zurück, bis alles weg ist.',
          vertrag:k=>({name:'Rückzahlung an die Eltern',kat:'Kredite',betrag:100,laufzeit:Math.ceil(k.o.wohnen.kaution/100)})}]}},
  {name:'Dezember',titel:'Weihnachten',text:'Weihnachtsmarkt, Geschenke, Silvester: Der Dezember ist teuer.',
    entscheidungen:[
    {id:'sparen',art:'fix',kat:'Sparen',spar:true,icon:'savings',frage:'Richtet Benjamin einen Sparplan ein?',
      text:'Ein Dauerauftrag schiebt das Geld jeden Monat aufs Tagesgeldkonto, bevor er es ausgeben kann.',
      optionen:[
        {t:'Nein, ich spare, was übrig bleibt',sub:'',icon:'money_off',betrag:0},
        {t:'50 € im Monat',sub:'Dauerauftrag aufs Tagesgeld',icon:'savings',betrag:50},
        {t:'110 € im Monat',sub:'etwa 10 % vom Einkommen',icon:'savings',betrag:110}]},
    {id:'abos',art:'fix',kat:'Freizeit',icon:'live_tv',frage:'Welche Abos gönnt sich Benjamin?',
      optionen:[
        {t:'Nur Musik',sub:'ein Musik-Abo, monatlich kündbar',icon:'music_note',betrag:12},
        {t:'Musik und Netflix',sub:'monatlich kündbar',icon:'live_tv',betrag:26},
        {t:'Musik, Netflix, Disney+ und DAZN',sub:'Serien und Fußball, monatlich kündbar',icon:'live_tv',betrag:70}]},
    {id:'geschenke',art:'einmal',kat:'Geschenke',icon:'redeem',frage:'Was gibt Benjamin für Weihnachtsgeschenke aus?',
      optionen:[
        {t:'Wichteln und Selbstgemachtes',sub:'',icon:'redeem',betrag:40},
        {t:'Für jeden etwas Kleines',sub:'Familie und beste Freunde',icon:'redeem',betrag:150},
        {t:'Alle groß beschenken',sub:'AirPods für die Freundin inklusive',icon:'celebration',betrag:380}]},
    {id:'essen-2',art:'variabel',kat:'Lebensmittel und Alltag',icon:'shopping_basket',frage:'Wie lebt Benjamin im Dezember?',
      optionen:[
        {t:'Selbst kochen, Glühwein nur einmal',sub:'',icon:'shopping_basket',betrag:210},
        {t:'Normal, plus Weihnachtsmarkt',sub:'',icon:'kebab_dining',betrag:290},
        {t:'Jedes Wochenende unterwegs',sub:'Weihnachtsfeier, Silvester in Erfurt',icon:'celebration',betrag:420}]}],
    ereignis:{id:'display',icon:'smartphone',kanal:'Weihnachtsmarkt Erfurt',titel:'Handy runtergefallen',
      text:'Auf dem Erfurter Weihnachtsmarkt rutscht dir das Handy aus der Hand. Das Display ist gesplittert. Die Reparatur kostet 189 €.',
      frage:'Was machst du?',
      wahl:[
        {t:'Reparieren lassen',art:'ok',folge:'Bezahlt wird zuerst vom Ersparten, soweit da etwas ist. Genau dafür ist ein Notgroschen da.',einmal:189,ausSpar:true,name:'Display-Reparatur',kat:'Handy und Internet'},
        {t:'Neues Handy auf Raten',art:'bad',folge:'30 € im Monat, 24 Monate lang: 720 € statt 189 €. Ein Ratenkauf macht aus einem kleinen Problem eine Verpflichtung für zwei Jahre.',
          vertrag:{name:'Ratenkauf Handy',kat:'Kredite',betrag:30,laufzeit:24}},
        {t:'Mit Sprung weiterbenutzen',art:'amb',folge:'Kostet erst mal nur 15 € für ein Panzerglas. Hoffentlich hält es.',einmal:15,name:'Panzerglas',kat:'Handy und Internet'}]}},
  {name:'Januar',titel:'Neues Jahr',text:'Neues Jahr, neue Vorsätze. Und der Winterschlussverkauf lockt.',
    entscheidungen:[
    {id:'fitness',art:'fix',kat:'Freizeit',icon:'fitness_center',frage:'Neujahrsvorsatz: mehr Sport. Wie?',
      optionen:[
        {t:'Joggen im Paradiespark',sub:'kostenlos',icon:'directions_run',betrag:0},
        {t:'Fitnessstudio-Kette',sub:'12 Monate Laufzeit',icon:'fitness_center',betrag:30,laufzeit:12},
        {t:'Premium-Studio mit Sauna',sub:'24 Monate Laufzeit',icon:'fitness_center',betrag:60,laufzeit:24}]},
    {id:'haftpflicht',art:'fix',kat:'Versicherungen',icon:'shield',frage:'Braucht Benjamin eine Haftpflichtversicherung?',
      text:'Seine Eltern haben keine. Die Haftpflicht zahlt, wenn du anderen aus Versehen einen Schaden zufügst.',
      optionen:[
        {t:'Private Haftpflicht',sub:'jährlich kündbar',icon:'shield',betrag:5,laufzeit:12,id:'haftpflicht'},
        {t:'Haftpflicht plus Handy- und Brillenversicherung',sub:'jährlich kündbar',icon:'shield',betrag:25,laufzeit:12,id:'haftpflicht'},
        {t:'Brauche ich nicht',sub:'',icon:'block',betrag:0}]},
    {id:'sale',art:'einmal',kat:'Kleidung',icon:'shopping_bag',frage:'Winterschlussverkauf in der Goethe Galerie. Was kauft Benjamin?',
      optionen:[
        {t:'Nichts',sub:'die alte Jacke tut es noch',icon:'block',betrag:0},
        {t:'Eine Winterjacke im Sale',sub:'',icon:'shopping_bag',betrag:80},
        {t:'Großer Haul',sub:'Sneaker, Jacke und zwei Hoodies',icon:'shopping_bag',betrag:290}]},
    {id:'essen-3',art:'variabel',kat:'Lebensmittel und Alltag',icon:'shopping_basket',frage:'Wie kauft Benjamin im Januar ein?',
      optionen:[
        {t:'Selbst kochen, Angebote, Eigenmarken',sub:'',icon:'shopping_basket',betrag:200},
        {t:'Normal einkaufen, ab und zu ein Döner',sub:'',icon:'kebab_dining',betrag:270},
        {t:'Lieferdienst, Bäcker, Energydrinks',sub:'',icon:'local_drink',betrag:380}]}],
    ereignis:{id:'fernseher',icon:'chat',kanal:'Nachricht von Tom',titel:'Der Fernseher ist hin',
      text:'Du hilfst deinem Kumpel Tom beim Umzug in Weimar. Dir rutscht sein Fernseher aus der Hand. Schaden: 450 €. Dafür musst du geradestehen.',
      frage:'Wie regelst du das?',
      wahl:[
        {t:'Meiner Haftpflichtversicherung melden',art:'ok',folge:'Deine Haftpflicht zahlt den Schaden, gute Tarife decken auch Schäden beim Helfen ab. Dafür hast du sie.',einmal:0,
          ohne:{vertrag:'haftpflicht',art:'bad',folge:'Du hast keine Haftpflichtversicherung. Niemand zahlt für dich: Die 450 € gehen sofort von deinem Konto ab.',einmal:450,name:'Schaden am Fernseher',kat:'Sonstiges'}},
        {t:'Tom in Raten abstottern',art:'amb',folge:'75 € im Monat, sechs Monate lang. Tom ist geduldig, aber du hast jetzt Schulden bei einem Freund.',
          vertrag:{name:'Raten an Tom',kat:'Kredite',betrag:75,laufzeit:6}},
        {t:'Sofort selbst bezahlen',art:'amb',folge:'450 € auf einen Schlag, zuerst vom Ersparten. Ohne Notgroschen geht es in den Dispo.',einmal:450,ausSpar:true,name:'Schaden am Fernseher',kat:'Sonstiges'}]}},
  {name:'Februar',titel:'Kassensturz',text:'Zeit für einen Kassensturz: Welche Verträge laufen eigentlich alle?',
    entscheidungen:[
    {id:'kuendigen',art:'kuendigen',kat:'Verträge',icon:'fact_check',frage:'Kassensturz! Welche Verträge kündigt Benjamin?',
      text:'Kreuze an, was weg soll. Ob das geht, hängt von der Laufzeit ab.'},
    {id:'festival',art:'einmal',kat:'Freizeit',icon:'celebration',frage:'Die Clique fährt im Sommer zum Highfield-Festival. Das Ticket kostet 250 €.',
      optionen:[
        {t:'Nicht dieses Jahr',sub:'',icon:'block',betrag:0},
        {t:'Ticket kaufen, vom Ersparten',sub:'was fehlt, geht vom Girokonto ab',icon:'savings',betrag:250,ausSpar:true},
        {t:'Ticket mit „Später bezahlen“',sub:'4 Raten zu 65 €',icon:'credit_card',betrag:0,vertrag:{name:'Festival-Ticket in Raten',kat:'Kredite',betrag:65,laufzeit:4}}]},
    {id:'essen-4',art:'variabel',kat:'Lebensmittel und Alltag',icon:'shopping_basket',frage:'Wie kauft Benjamin im Februar ein?',
      optionen:[
        {t:'Selbst kochen, Angebote, Eigenmarken',sub:'',icon:'shopping_basket',betrag:200},
        {t:'Normal einkaufen, ab und zu ein Döner',sub:'',icon:'kebab_dining',betrag:270},
        {t:'Lieferdienst, Bäcker, Energydrinks',sub:'',icon:'local_drink',betrag:380}]}],
    ereignis:{id:'kredit',icon:'notifications',kanal:'Push-Nachricht',titel:'1.500 € in 10 Minuten',
      text:'Eine Kredit-App wirbt: „1.500 € sofort aufs Konto. Nur 50 € im Monat!“ Im Kleingedruckten: 36 Monate Laufzeit, effektiver Jahreszins 12,9 %.',
      frage:'Nimmst du den Kredit?',
      wahl:[
        {t:'Ablehnen',art:'ok',folge:'Gut so. 36 × 50 € sind 1.800 €: 300 € Zinsen für Geld, das du sofort ausgibst.'},
        {t:'Annehmen und den Dispo ausgleichen',art:'amb',folge:'Umschulden: Der Ratenkredit ist billiger als der Dispo. Das hilft aber nur, wenn du den Dispo danach nicht wieder nutzt. Drei Jahre lang gehen 50 € weg.',
          einmal:-1500,name:'Ratenkredit ausgezahlt',vertrag:{name:'Ratenkredit',kat:'Kredite',betrag:50,laufzeit:36}},
        {t:'Annehmen und eine PS5 Pro mit Zubehör kaufen',art:'bad',folge:'Die Konsole ist in zwei Jahren alt, die Raten laufen drei Jahre. Du zahlst 1.800 € für 1.500 €.',
          vertrag:{name:'Ratenkredit',kat:'Kredite',betrag:50,laufzeit:36}}]}}
  ],
  merksaetze:['Erst die Fixkosten, dann der Rest: Miete und Verträge laufen jeden Monat weiter, egal wie es dir geht.',
    'Lange Laufzeiten tun erst später weh: Ein Vertrag für 24 oder 48 Monate bindet dich, auch wenn das Geld knapp wird.',
    'Der Dispo ist kein Einkommen, sondern ein teurer Kredit. Wer ständig im Minus ist, braucht einen Plan und im Notfall die Schuldnerberatung.']
};
