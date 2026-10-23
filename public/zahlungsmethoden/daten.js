// Lernwerkstatt Zahlungsmethoden: Zahlen zum Zahlungsverhalten, Fotos, Szenen im Kassen-Rush, die Klassenbank,
// Nachrichten im Fake-Detektor und der Kurs in der Krypto-Achterbahn (Szenario).
// Zahlen gerundet, Stand und Quelle stehen in QUELLEN (Quellenliste des Themas).
import { ibanVon } from '../shared/js/bank.js';

export const STAND='Oktober 2026';

/* ---------- Zahlen (Deutsche Bundesbank, Zahlungsverhalten in Deutschland 2025, veröffentlicht Juni 2026) ----------
   Befragt wurden 6.070 Personen ab 18 Jahren von September bis Dezember 2025, mit Zahlungstagebuch über drei Tage. */
export const ZAHLEN={
  barAnzahl:45,       // Anteil Bargeld an der Zahl der Zahlungen 2025 (2023: 51 %, 2008: 83 %)
  barAnzahl2023:51,
  barAnzahl2008:83,
  barUmsatz:23,       // Anteil Bargeld am Umsatz 2025
  unbar:55,           // erstmals mehr als die Hälfte der Zahlungen bargeldlos
  mobil:10,           // Anteil Zahlungen mit dem Handy oder der Smartwatch 2025 (vier Prozentpunkte mehr als 2023)
  portemonnaie:98,    // Bargeld im Portemonnaie im Schnitt in Euro
  portemonnaieJung:47,// 18- bis 24-Jährige
  ohneBar:4,          // Anteil ohne jedes Bargeld im Portemonnaie
  kreditkarte:50,     // Anteil mit Kreditkarte
  wero:5              // Anteil mit eingerichtetem Wero-Konto
};

/* ---------- Fotos (Wikimedia Commons, freie Lizenzen) ----------
   motiv: kurzer Name für die Quellenliste, credit: „Name / Quelle, Lizenz“, link: Dateiseite, lizenz: Lizenztext */
export const FOTO={
  galerie:{motiv:'Goethe Galerie Jena',src:'img/galerie.jpg',alt:'Blick in die Goethe Galerie in Jena: Glasdach, Rolltreppen und Geschäfte auf mehreren Etagen',credit:'Andreas Praefcke / Wikimedia Commons, CC BY 3.0',
    link:'https://commons.wikimedia.org/wiki/File:Jena_Goethe-Galerie_2010_1.jpg',lizenz:'https://creativecommons.org/licenses/by/3.0/'},
  baeckerei:{motiv:'Bäckerei in Jena',src:'img/baeckerei-jena.jpg',alt:'Bäckerei am Johannisplatz in Jena: Schaufenster mit Brötchen und Kaffee im Erdgeschoss eines alten Hauses',credit:'Timk70 / Wikimedia Commons, CC BY-SA 4.0',
    link:'https://commons.wikimedia.org/wiki/File:Baeckerei_Zwiebel_%26_CiZ,_Jena,_Johannisplatz_9_%26_10.jpg',lizenz:'https://creativecommons.org/licenses/by-sa/4.0/'},
  gotha:{motiv:'Neumarkt Gotha',src:'img/gotha.jpg',alt:'Verschneiter Neumarkt in Gotha mit der Margarethenkirche und Wohnhäusern',credit:'Roeland P. / Wikimedia Commons, CC0',
    link:'https://commons.wikimedia.org/wiki/File:2026-01-26-Neumarkt-Gotha-Schnee.jpg',lizenz:'https://creativecommons.org/publicdomain/zero/1.0/'},
  automat:{motiv:'Pokémon-Automat',src:'img/pokemon-automat.jpg',alt:'Verkaufsautomat für Pokémon-Sammelkarten in einem Geschäft',credit:'KKPCW (Kyu3) / Wikimedia Commons, CC BY-SA 4.0',
    link:'https://commons.wikimedia.org/wiki/File:Pok%C3%A9mon_Trading_Card_Vending_machine.jpg',lizenz:'https://creativecommons.org/licenses/by-sa/4.0/'},
  sneaker:{motiv:'Air Force 1',src:'img/sneaker.jpg',alt:'Ein Paar weiße Sneaker auf dem Schuhkarton',credit:'Xanor / Wikimedia Commons, CC0',
    link:'https://commons.wikimedia.org/wiki/File:Air_Force_1.JPG',lizenz:'https://creativecommons.org/publicdomain/zero/1.0/'},
  messe:{motiv:'Messe Erfurt',src:'img/messe-erfurt.jpg',alt:'Gebäude der Messe Erfurt mit großem Vorplatz',credit:'Messe Erfurt AG / Wikimedia Commons, CC BY-SA 3.0',
    link:'https://commons.wikimedia.org/wiki/File:Panorama_Messe_Erfurt.jpg',lizenz:'https://creativecommons.org/licenses/by-sa/3.0/'},
  cafe:{motiv:'Café Stilbruch Jena',src:'img/cafe-jena.jpg',alt:'Café in Jena am Abend: Außentische auf Kopfsteinpflaster, drinnen sitzen Gäste im warmen Licht',credit:'Sebastian Wallroth / Wikimedia Commons, CC BY 4.0',
    link:'https://commons.wikimedia.org/wiki/File:Jena_2023_002.jpg',lizenz:'https://creativecommons.org/licenses/by/4.0/'},
  supermarkt:{motiv:'Supermarkt-Regale',src:'img/supermarkt.jpg',alt:'Lange Regale in einem Supermarkt, daneben Kühltruhen',credit:'The real Marcoman / Wikimedia Commons, CC0',
    link:'https://commons.wikimedia.org/wiki/File:Netto_Marken-Discount_Innenansicht_(4).jpg',lizenz:'https://creativecommons.org/publicdomain/zero/1.0/'},
  bitcoin:{motiv:'Bitcoin',src:'img/bitcoin.jpg',alt:'Goldene Bitcoin-Münze vor einem Kursdiagramm auf einem Bildschirm',credit:'Jorge Franganillo / Wikimedia Commons, CC BY 2.0',
    link:'https://commons.wikimedia.org/wiki/File:Bitcoin_(50799812413).jpg',lizenz:'https://creativecommons.org/licenses/by/2.0/'}
};

/* ---------- Zahlungsarten ---------- */
export const ARTEN={
  bar:{t:'Bargeld',icon:'payments'},
  karte:{t:'Girocard oder Debitkarte',icon:'credit_card'},
  kredit:{t:'Kreditkarte',icon:'credit_card'},
  handy:{t:'Handy (Apple Pay, Google Pay)',icon:'smartphone'},
  paypal:{t:'Online-Bezahldienst (PayPal)',icon:'account_balance_wallet'},
  vorkasse:{t:'Überweisung vorab (Vorkasse)',icon:'account_balance'},
  echtzeit:{t:'Echtzeitüberweisung oder Wero',icon:'bolt'},
  spaeter:{t:'Später bezahlen (Buy now, pay later)',icon:'schedule'}
};

/* ---------- Kassen-Rush: sechs Kassen in Thüringen ----------
   w: gut (2 Punkte), geht (1 Punkt), schlecht (0 Punkte) mit Folge t. Alle Personen sind erfunden. */
export const KASSEN=[
  {id:'baecker',foto:'baeckerei',ort:'Bäckerei in Jena, 7:20 Uhr',was:'Zwei Brötchen und ein Kakao',betrag:'3,40 €',
    w:{bar:['gut','Passt immer. Mit Kleingeld bist du in Sekunden fertig.'],karte:['gut','Kontaktlos, ohne PIN: Bis 50 € reicht meist Hinhalten.'],
      handy:['gut','Handy kurz ans Terminal, fertig. Akku leer? Dann stehst du dumm da.'],spaeter:['schlecht','Für Brötchen auf Pump? Das gibt es an der Bäckertheke nicht, und das ist gut so.']}},
  {id:'markt',foto:'gotha',ort:'Weihnachtsmarkt in Gotha',was:'Kinderpunsch und Bratwurst am Holzstand',betrag:'7,50 €',
    w:{bar:['gut','Richtig! Der Stand hat kein Kartengerät. Bargeld klappt immer, auch ohne Strom und Netz.'],karte:['schlecht','Kein Kartengerät am Stand. Ohne Bargeld bleibt der Magen leer.'],
      handy:['schlecht','Ohne Kartengerät nützt dir das Handy nichts.'],echtzeit:['geht','Manche Händler nehmen Wero oder eine Überweisung aufs Handy. Darauf verlassen kannst du dich nicht.']}},
  {id:'automat',foto:'automat',ort:'Spieleladen in Erfurt',was:'Ein Booster-Pack aus dem Automaten',betrag:'6,00 €',
    w:{bar:['schlecht','Der Automat hat keinen Münzschlitz. Immer mehr Automaten sind bargeldlos.'],karte:['gut','Karte ans Lesegerät, das Geld geht sofort vom Konto ab.'],
      handy:['gut','Klappt wie mit der Karte. Wer viel am Automaten kauft, verliert aber schnell den Überblick.'],kredit:['geht','Geht, aber die Rechnung kommt erst später. Bei kleinen Spontankäufen ist das gefährlich.']}},
  {id:'shop',foto:'sneaker',ort:'Online-Shop, den du nicht kennst',was:'Sneaker im Angebot, 50 % billiger als überall',betrag:'110,00 €',
    w:{vorkasse:['schlecht','Achtung, Fake-Shop-Masche! Eine Überweisung vorab bekommst du kaum zurück, und die Ware kommt nie.'],paypal:['gut','Mit dem Käuferschutz holst du dir das Geld zurück, wenn nichts ankommt. Trotzdem: Prüf erst das Impressum und Bewertungen.'],
      kredit:['geht','Bei Betrug kann deine Bank die Zahlung zurückholen (Chargeback). Das dauert und klappt nicht immer.'],spaeter:['geht','Zahlen erst nach Lieferung schützt dich. Aber die Frist vergisst man leicht, dann kommen Mahngebühren.']}},
  {id:'festival',foto:'messe',ort:'Gaming-Messe in Erfurt',was:'Getränk und Merch am Stand: Hier ist alles bargeldlos',betrag:'18,50 €',
    w:{bar:['schlecht','Auf der Veranstaltung ist alles bargeldlos. Mit Scheinen kommst du nicht weiter.'],karte:['gut','Funktioniert an jedem Stand. Das Geld geht sofort von deinem Konto ab.'],
      handy:['gut','Schnell und kontaktlos. Denk an eine Powerbank, sonst ist Schluss.'],kredit:['geht','Geht, aber du siehst erst auf der Abrechnung, wie viel es am Ende war.']}},
  {id:'cafe',foto:'cafe',ort:'Café in Jena mit zwei Freunden',was:'Du hast alles bezahlt. Jeder schuldet dir 8 €',betrag:'je 8,00 €',
    w:{echtzeit:['gut','In Sekunden auf deinem Konto, ohne Extrakosten. Die Empfängerprüfung zeigt, ob der Name zur IBAN passt.'],bar:['gut','Klappt, wenn deine Freunde Bargeld dabeihaben. Die 18- bis 24-Jährigen haben im Schnitt nur 47 € dabei.'],
      paypal:['geht','Geht schnell, aber alle brauchen ein Konto beim selben Dienst.'],kredit:['schlecht','Mit der Kreditkarte schickt man Freunden kein Geld.']}}
];

/* ---------- Klassenbank ----------
   Erfundene Konten zum Üben ohne Lernraum. Die IBAN entsteht aus dem Namen und hat eine gültige Prüfziffer,
   die Bankleitzahl gibt es nicht. Alle Personen und Firmen sind erfunden. */
export const KONTEN=[
  {name:'Mia Krause (fiktiv)',icon:'person'},
  {name:'Pizzeria Saaleblick Jena (fiktiv)',icon:'storefront'},
  {name:'Handyfuchs Mobilfunk (fiktiv)',icon:'smartphone'}
];
// IBAN mit Zahlendreher für den Auftrag „Tippfehler“: zwei Ziffern von Mias IBAN vertauscht
const mia=ibanVon('fiktiv:'+KONTEN[0].name);
const i=12+mia.slice(12).search(/(\d)(?!\1)\d/);
export const MIA_FALSCH=(mia.slice(0,i)+mia[i+1]+mia[i]+mia.slice(i+2)).replace(/(.{4})/g,'$1 ').trim();
export const BANK={id:'klassenbank',name:'Klassenbank (fiktiv)',start:25000,konten:KONTEN,
  titel:'Dein Übungskonto mit 250 € Spielgeld. Im Lernraum überweist ihr euch gegenseitig Geld, sonst übst du mit den Vorlagen.',
  eingang:{name:'Mama und Papa',betrag:4000,zweck:'Taschengeld'},
  lastschrift:{name:'Saale-Fit Fitnessstudio (fiktiv)',betrag:3990,zweck:'Mitgliedsbeitrag, Mandat SF-2291'},
  auftraege:[
    {id:'pizza',art:'zweck',betrag:650,wort:'pizza',t:'<b>Pizza teilen:</b> Überweise 6,50 € mit dem Verwendungszweck „Pizza“. Im Lernraum an jemanden aus deiner Klasse, sonst an Mia.'},
    {id:'echtzeit',art:'echtzeit',t:'<b>Blitzschnell:</b> Schick eine Echtzeitüberweisung.'},
    {id:'tippfehler',art:'pruefziffer',t:`<b>Zahlendreher:</b> Mia hat dir ihre IBAN diktiert: <span class="mono">${MIA_FALSCH}</span>. Versuch, ihr 1 € zu überweisen.`},
    {id:'name',art:'empfaenger',t:'<b>Wer ist das?</b> Überweise an die Pizzeria, schreib als Empfänger aber nur „Pizza Saale“. Was sagt die Empfängerprüfung?'},
    {id:'dauer',art:'dauerauftrag',t:'<b>Handyvertrag:</b> Richte einen Dauerauftrag über 9,99 € an Handyfuchs ein.'},
    {id:'lastschrift',art:'lastschrift',t:'<b>Fremde Abbuchung:</b> Spul einen Monat vor und prüf deine Umsätze. Holst du dir unberechtigtes Geld zurück?'}]
};

/* ---------- Fake-Detektor ----------
   [[…]] markiert ein Warnsignal, das nach der Entscheidung aufleuchtet. fake: true = Betrug. Alle Absender sind erfunden. */
export const NACHRICHTEN=[
  {id:'sms-bank',kanal:'SMS',icon:'sms',von:'+49 1577 …',fake:true,
    text:'Ihr Bankkonto wurde [[vorübergehend gesperrt]]. Bestätigen Sie [[innerhalb von 24 Stunden]] Ihre Daten: [[meinbank-sicher-check.info]]',
    e:'Banken verschicken keine Links, um Daten zu „bestätigen“. Zeitdruck und eine fremde Adresse sind typisch für Phishing.'},
  {id:'mama',kanal:'WhatsApp',icon:'chat',von:'Unbekannte Nummer',fake:true,
    text:'[[Hallo Mama, das ist meine neue Nummer]], das alte Handy ist kaputt. Kannst du [[schnell 1.280 € für mich überweisen]]? [[Bitte heute noch]], erkläre ich dir später!',
    e:'Die „Hallo Mama“-Masche: Betrüger geben sich als Kind aus. Immer auf der alten Nummer zurückrufen!'},
  {id:'push',kanal:'Banking-App',icon:'account_balance',von:'Deine Banking-App',fake:false,
    text:'Überweisung ausgeführt: 6,50 € an Mia Krause, Verwendungszweck „Pizza“.',
    e:'Echt: Die Nachricht kommt in deiner eigenen App, passt zu dem, was du gerade getan hast, und will nichts von dir.'},
  {id:'paket',kanal:'SMS',icon:'sms',von:'Paketdienst',fake:true,
    text:'Ihr Paket konnte nicht zugestellt werden. Bitte [[zahlen Sie 1,99 € Gebühr]] über [[diesen Link]], sonst geht es [[zurück an den Absender]].',
    e:'Kleiner Betrag, großer Schaden: Über den Link wollen Betrüger deine Kartendaten.'},
  {id:'kleinanzeigen',kanal:'Kleinanzeigen-Chat',icon:'storefront',von:'Käufer „jens_1987“',fake:true,
    text:'Ich nehme dein Fahrrad! Ich zahle per [[„Sicher bezahlen“-Link]]. [[Gib dort deine Kartendaten ein, damit du das Geld empfangen kannst]].',
    e:'Um Geld zu empfangen, brauchst du nie deine Kartendaten. Wer das verlangt, will dein Konto leerräumen.'},
  {id:'vop',kanal:'Banking-App',icon:'warning',von:'Deine Banking-App',fake:false,
    text:'Empfängerprüfung: Der Name passt nicht zur IBAN. Bitte prüfe die Daten, bevor du die Überweisung freigibst.',
    e:'Echt und wichtig: Seit Oktober 2025 prüfen alle Banken in der EU, ob Name und IBAN zusammenpassen. Bei dieser Warnung: abbrechen und nachfragen.'},
  {id:'gewinn',kanal:'Instagram',icon:'photo_camera',von:'@gewinnspiel.offiziell (fiktiv)',fake:true,
    text:'Glückwunsch! [[Du hast ein iPhone gewonnen]]! [[Zahl nur 2,99 € Versand]] per Kreditkarte, das Angebot gilt [[nur noch 1 Stunde]].',
    e:'Gewinne, an denen du nicht teilgenommen hast, Mini-Gebühr und Zeitdruck: klassischer Betrug, oft mit teurem Abo dahinter.'},
  {id:'schule',kanal:'E-Mail',icon:'mail',von:'Sekretariat deiner Schule',fake:false,
    text:'Elternbrief zur Klassenfahrt nach Weimar: Bitte überweisen Sie 85 € bis zum 15. November auf das bekannte Schulkonto. Bei Fragen melden Sie sich bei der Klassenleitung.',
    e:'Wirkt echt: bekannter Absender, kein Link, kein Zeitdruck, Rückfragen möglich. Im Zweifel fragst du direkt in der Schule nach.'}
];

/* ---------- Krypto-Achterbahn (Szenario) ----------
   Ausgedachter Kurs von Bitcoin in Euro über zwei Stunden, alle fünf Minuten ein Wert. So stark schwankt Bitcoin
   selten in zwei Stunden, über einige Wochen aber durchaus. Wie im Material: Wer bei steigendem Kurs bezahlt, verliert. */
export const KURS=[60000,61200,59800,62500,64100,63000,66800,69500,68000,72400,75100,73000,78900,82000,79500,76300,80800,85600,88200,84900,90300,93700,89100,95400,99800];
export const SHIRT=20;
