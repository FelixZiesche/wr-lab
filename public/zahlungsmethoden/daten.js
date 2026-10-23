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
// Kontosimulation: sechs Monate Girokonto bei Z-Invest (fiktiv). Jeden Monat kommt Geld rein (ein), es gehen
// Lastschriften und Kartenzahlungen raus (aus) und es passiert etwas (event). Jede Reaktion ändert Kontostand,
// Sicherheit (s) und Überblick (u). Felder: siehe shared/js/bank.js. Alle Personen, Firmen und Apps sind erfunden.
const TASCHENGELD={name:'Mama und Papa',betrag:4000,zweck:'Taschengeld'},LOHN={name:'Café Saalestrand Apolda (fiktiv)',betrag:16000,zweck:'Lohn Aushilfe'};
export const BANK={id:'klassenbank',name:'Z-Invest (fiktiv)',start:25000,konten:KONTEN,
  titel:'Du bist 16, jobbst als Aushilfe im Café und hast dein Girokonto bei Z-Invest. Spiel sechs Monate: Geld kommt rein, Abbuchungen gehen raus, und jeden Monat passiert etwas. Im Lernraum überweist ihr euch gegenseitig Geld.',
  eingang:TASCHENGELD,
  monate:[
    {name:'November',ein:[TASCHENGELD,LOHN],
      aus:[{id:'saalefit',name:'Saale-Fit Fitnessstudio (fiktiv)',betrag:3990,zweck:'Mitgliedsbeitrag, Mandat SF-2291',typ:'lastschrift'},{name:'Dönerladen am Holzmarkt Jena',betrag:750,zweck:'Kartenzahlung',typ:'karte'}],
      event:{id:'fremd',icon:'receipt_long',kanal:'Z-Invest App',titel:'Unbekannte Abbuchung',
        text:'Neue Lastschrift: −39,90 € an Saale-Fit Fitnessstudio. Du warst noch nie bei Saale-Fit und hast nichts unterschrieben.',
        frage:'Was tust du?',
        wahl:[
          {t:'Lastschrift in der App zurückgeben',art:'ok',s:1,u:2,rueck:'saalefit',auftrag:'lastschrift',folge:'Richtig! Ohne Erlaubnis (Mandat) kannst du eine Lastschrift sogar 13 Monate lang zurückgeben. Die 39,90 € sind sofort wieder da.'},
          {t:'Abwarten, wird schon stimmen',art:'bad',u:-2,abo:{name:'Saale-Fit Fitnessstudio (fiktiv)',betrag:3990,zweck:'Mitgliedsbeitrag, Mandat SF-2291',mal:5},folge:'Teuer: Saale-Fit bucht jetzt jeden Monat ab. Wer seine Umsätze nicht prüft, merkt so etwas oft erst nach Monaten.'},
          {t:'Bei Saale-Fit anrufen und nachfragen',art:'amb',s:1,u:1,buchung:{name:'Saale-Fit Fitnessstudio (fiktiv)',betrag:3990,zweck:'Erstattung: Verwechslung'},folge:'Klappt: Es war eine Verwechslung, du bekommst das Geld zurück. Schneller und sicherer ist aber die Rückgabe direkt bei deiner Bank.'}]}},
    {name:'Dezember',ein:[TASCHENGELD,LOHN,{name:'Oma Gitti',betrag:5000,zweck:'Frohe Weihnachten!'}],
      aus:[{name:'Goethe Galerie Jena',betrag:4590,zweck:'Kartenzahlung Geschenke',typ:'karte'}],
      event:{id:'phishing',icon:'sms',kanal:'SMS',titel:'Dein Konto wird gesperrt!',
        text:'Z-Invest: Ihr Konto wird heute gesperrt. Bestätigen Sie jetzt Ihre Daten unter z-invest-sicherheit.info',
        frage:'Was tust du?',
        wahl:[
          {t:'Link öffnen, Zugangsdaten und TAN eingeben',art:'bad',s:-3,buchung:{name:'Unbekannt (Betrüger)',betrag:-15000,zweck:'Echtzeitüberweisung',alles:true},folge:'Betrug! Mit deinen Daten und der TAN haben Betrüger per Echtzeitüberweisung Geld abgeräumt. Zurückholen ist kaum möglich. Banken fragen nie per SMS nach Zugangsdaten.'},
          {t:'Löschen und in der echten Z-Invest-App nachsehen',art:'ok',s:2,u:1,folge:'Genau richtig. In der App ist alles in Ordnung. Die SMS war Phishing: falscher Link, Zeitdruck, Drohung.'},
          {t:'Link öffnen, aber nichts eingeben',art:'amb',s:-1,folge:'Glück gehabt, aber riskant: Gefälschte Seiten können Schadsoftware laden. Besser gar nicht erst klicken.'}]}},
    {name:'Januar',ein:[TASCHENGELD,LOHN],
      aus:[{name:'Kino in Erfurt',betrag:1200,zweck:'Kartenzahlung',typ:'karte'}],
      event:{id:'karte',icon:'credit_card',kanal:'Nach dem Eislaufen',titel:'Karte weg!',
        text:'Nach dem Eislaufen in Erfurt merkst du: Deine Girocard ist weg. Mit ihr kann man kontaktlos bezahlen, bei kleinen Beträgen ohne PIN.',
        frage:'Was tust du?',
        wahl:[
          {t:'Sofort in der App sperren oder den Sperr-Notruf 116 116 anrufen',art:'ok',s:2,u:1,buchung:{name:'Z-Invest (fiktiv)',betrag:-1000,zweck:'Ersatzkarte'},folge:'Richtig. Die Karte ist gesperrt, niemand kann mehr damit zahlen. Z-Invest berechnet 10 € für die neue Karte.'},
          {t:'Bis morgen warten, vielleicht taucht sie wieder auf',art:'bad',s:-2,buchung:{name:'Fremde Kartenzahlungen',betrag:-5000,zweck:'Haftung bis zur Sperre'},folge:'Ein Finder hat mehrmals kontaktlos bezahlt. Bis zur Sperre haftest du mit bis zu 50 €. Danach zahlt die Bank. Darum: sofort sperren.'},
          {t:'Egal, die PIN steht ja auf einem Zettel im Portemonnaie',art:'bad',s:-3,buchung:{name:'Fremde Abhebungen',betrag:-12000,zweck:'Geldautomat',alles:true},folge:'Das ist grob fahrlässig: PIN und Karte zusammen. Der Finder hebt am Automaten ab, und die Bank muss dir nichts ersetzen.'}]}},
    {name:'Februar',ein:[TASCHENGELD,LOHN],
      aus:[{id:'fitboost',name:'FitBoost-App (fiktiv)',betrag:1299,zweck:'Abo nach Gratismonat',typ:'lastschrift'}],
      event:{id:'abo',icon:'event_repeat',kanal:'Z-Invest App',titel:'Der Gratismonat ist vorbei',
        text:'Neue Lastschrift: −12,99 € an FitBoost-App. Die Workout-App war einen Monat gratis, jetzt kostet sie jeden Monat. Du nutzt sie nicht mehr.',
        frage:'Was tust du?',
        wahl:[
          {t:'In der App kündigen und die Bestätigung speichern',art:'ok',s:1,u:2,folge:'Richtig. Ab jetzt wird nichts mehr abgebucht. Die Kündigungsbestätigung ist dein Beweis.'},
          {t:'Weiterlaufen lassen, sind ja nur 12,99 €',art:'bad',u:-2,abo:{name:'FitBoost-App (fiktiv)',betrag:1299,zweck:'Abo',mal:2},folge:'Kleine Abos fressen viel Geld: 12,99 € im Monat sind über 155 € im Jahr.'},
          {t:'Nur die Lastschrift zurückgeben, nicht kündigen',art:'amb',u:-1,rueck:'fitboost',abo:{name:'FitBoost-App (fiktiv)',betrag:1799,zweck:'Abo und Mahngebühr',mal:2},folge:'Das Geld ist erst mal zurück, aber der Vertrag läuft weiter. FitBoost bucht wieder ab, jetzt mit Mahngebühr. Erst kündigen, dann zurückgeben.'}]}},
    {name:'März',ein:[TASCHENGELD,LOHN],
      aus:[{name:'Bäckerei in Weimar',betrag:480,zweck:'Kartenzahlung',typ:'karte'}],
      event:{id:'spaeter',icon:'schedule',kanal:'E-Mail',titel:'Rechnung fällig',
        text:'Zahlspäter-App (fiktiv): Deine Rechnung über 89,00 € für den Hoodie ist in 3 Tagen fällig.',
        frage:'Was tust du?',
        wahl:[
          {t:'Gleich überweisen',art:'ok',u:2,buchung:{name:'Zahlspäter-App (fiktiv)',betrag:-8900,zweck:'Rechnung Hoodie'},folge:'Pünktlich bezahlt, keine Kosten. „Später zahlen“ bleibt nur dann kostenlos.'},
          {t:'Ignorieren, ist ja noch Zeit',art:'bad',u:-2,buchung:{name:'Zahlspäter-App (fiktiv)',betrag:-9400,zweck:'Rechnung und Mahngebühr'},folge:'Frist verpasst: Jetzt kommen 5 € Mahngebühr dazu. Beim nächsten Mal droht Inkasso.'},
          {t:'Auf Ratenzahlung umstellen',art:'amb',u:-1,buchung:{name:'Zahlspäter-App (fiktiv)',betrag:-3150,zweck:'Rate 1 von 3'},abo:{name:'Zahlspäter-App (fiktiv)',betrag:3150,zweck:'Rate',mal:2},folge:'Aus 89 € werden 94,50 €. Raten kosten Zinsen und binden dich noch Monate.'}]}},
    {name:'April',ein:[TASCHENGELD,LOHN],
      aus:[{name:'Eisdiele in Apolda',betrag:350,zweck:'Kartenzahlung',typ:'karte'}],
      event:{id:'sparen',icon:'savings',kanal:'Z-Invest App',titel:'Dein Halbjahr ist um',
        text:'Z-Invest: Du hast ein halbes Jahr geschafft! Willst du ab jetzt jeden Monat etwas zurücklegen?',
        frage:'Was machst du mit deinem Geld?',
        wahl:[
          {t:'Dauerauftrag: 30 € im Monat aufs eigene Sparkonto',art:'ok',s:1,u:2,buchung:{name:'Dein Sparkonto bei Z-Invest',betrag:-3000,zweck:'Sparen, erste Rate'},folge:'Stark! Erst sparen, dann ausgeben. Das Geld ist nicht weg, es liegt auf deinem Sparkonto.'},
          {t:'Alles auf dem Girokonto lassen',art:'amb',folge:'Geht, aber was auf dem Girokonto liegt, gibt man leichter aus.'},
          {t:'Alles in den Coin aus dem TikTok-Video stecken',art:'bad',s:-2,buchung:{name:'Krypto-Börse (fiktiv)',betrag:-10000,zweck:'Coin-Kauf',alles:true},folge:'Riskant: Der Coin verliert in einer Woche 80 %. Was dir ein Video verspricht, ist keine Anlageberatung.'}]}}],
  auftraege:[
    {id:'pizza',art:'zweck',betrag:650,wort:'pizza',t:'<b>Pizza teilen:</b> Überweise 6,50 € mit dem Verwendungszweck „Pizza“. Im Lernraum an jemanden aus deiner Klasse, sonst an Mia.'},
    {id:'echtzeit',art:'echtzeit',t:'<b>Blitzschnell:</b> Schick eine Echtzeitüberweisung.'},
    {id:'tippfehler',art:'pruefziffer',t:`<b>Zahlendreher:</b> Mia hat dir ihre IBAN diktiert: <span class="mono">${MIA_FALSCH}</span>. Versuch, ihr 1 € zu überweisen.`},
    {id:'name',art:'empfaenger',t:'<b>Wer ist das?</b> Überweise an die Pizzeria, schreib als Empfänger aber nur „Pizza Saale“. Was sagt die Empfängerprüfung?'},
    {id:'dauer',art:'dauerauftrag',t:'<b>Handyvertrag:</b> Richte einen Dauerauftrag über 9,99 € an Handyfuchs ein.'},
    {id:'lastschrift',art:'lastschrift',t:'<b>Fremde Abbuchung:</b> Starte den November und reagier richtig auf die Abbuchung, die du nicht kennst.'}]
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
