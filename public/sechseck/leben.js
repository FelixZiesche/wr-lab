// Planspiel „Sechseck-Leben“: Figuren, Runden, Rechenmodell und Darstellung.
// Den Ablauf (Modi, Live-Klassenraum, Abstimmung, Dashboard) übernimmt shared/js/planspiel.js.
import { esc, fmt, sgn, clamp, store, photoHTML } from '../shared/js/ui.js';
import { OPTC } from '../shared/js/planspiel.js';
import { ORDER, G, radar, START } from './daten.js';

/* ================= Planspiel Sechseck-Leben ================= */
const ZINS0=2.25, ML0=13.90;
const FIG=[
 {id:'mia',n:'Mia',a:17,ort:'Apolda',job:'Azubi Feinoptikerin bei einem Optikhersteller in Jena, pendelt mit dem Deutschlandticket',sec:'optik',netto:880,stadt:false,pers:1,tax:false,
  li:{miete:150,energie:0,mobil:63,essen:180},base:150,spar:1200,kredit:0,
  vibe:'Matcha-Fan, spart auf den Führerschein und antwortet auf alles mit „Six Seven“.',ziel:'Führerschein (rund 3.500 €)'},
 {id:'jonas',n:'Jonas',a:20,ort:'Jena',job:'Physikstudent im WG-Zimmer, Minijob in einer Bar (43 Stunden im Monat zum Mindestlohn) plus BAföG',sec:'mini',netto:1118,mini:43,stadt:true,pers:1,tax:false,
  li:{miete:430,energie:35,mobil:0,essen:260},base:60,spar:400,kredit:0,
  vibe:'Macht jede Buldak-Challenge mit, wartet seit Jahren auf GTA 6 und kommentiert Mietanzeigen mit „Ragebait“.',ziel:'Eine eigene Wohnung ohne WG'},
 {id:'sabine',n:'Sabine',a:46,ort:'Bad Sulza (Weimarer Land)',job:'Pflegefachkraft im Krankenhaus Erfurt, pendelt täglich 40 km mit dem Auto, alleinerziehend mit einem Sohn (16)',sec:'pflege',netto:2450,stadt:false,pers:2,tax:true,
  li:{miete:620,energie:170,mobil:280,essen:520},base:200,spar:5000,kredit:0,
  vibe:'Ihr Sohn erklärt ihr die Jugendwörter – sie sagt trotzdem „Digga“ an den falschen Stellen.',ziel:'Ein neues Auto, bevor das alte schlappmacht'},
 {id:'tobias',n:'Tobias',a:41,ort:'Apolda',job:'Bäckermeister mit eigener Bäckerei und 6 Beschäftigten, Kredit für einen neuen Ofen',sec:'baecker',selbst:true,netto:3100,stadt:false,pers:3,tax:true,
  betr:{energie:1500,lohn:9000,rohstoff:2500,umsatz:30000},li:{miete:900,energie:200,mobil:180,essen:750},base:250,spar:8000,kredit:90000,
  vibe:'Seine Dubai-Schoko-Croissants gingen auf TikTok viral – die Schlange reichte bis zum Markt.',ziel:'Eine zweite Filiale in Weimar'},
 {id:'daniel',n:'Daniel',a:52,ort:'Eisenach',job:'Schichtarbeiter bei einem Autozulieferer, der Getriebeteile für Verbrenner herstellt',sec:'auto',netto:2450,stadt:false,pers:2,tax:true,
  li:{miete:560,energie:150,mobil:140,essen:480},base:220,spar:14000,kredit:0,
  vibe:'Schaut abends Tuning-Videos und fragt sich, ob E-Autos seinen Job überflüssig machen.',ziel:'Sicher bis zur Rente arbeiten'},
 {id:'gisela',n:'Gisela',a:72,ort:'Weimar',job:'Rentnerin, früher Verkäuferin; heizt mit Gas, das Ersparte liegt auf dem Sparbuch',sec:'rente',netto:1380,stadt:true,pers:1,tax:false,
  li:{miete:520,energie:140,mobil:40,essen:330},base:80,spar:22000,kredit:0,
  vibe:'Fand die Dubai-Schokolade „peak“ – das Wort hat sie von ihrer Enkelin.',ziel:'Der Enkelin den Führerschein mitfinanzieren'},
 {id:'lea',n:'Lea',a:29,ort:'Jena',job:'Gründerin eines KI-Start-ups für Bilderkennung in der Optikindustrie, Gründerkredit',sec:'tech',netto:3000,stadt:true,pers:1,tax:true,
  li:{miete:950,energie:70,mobil:30,essen:420},base:400,spar:6000,kredit:40000,
  vibe:'Postet „Day in my life als Gründerin“ – die Hälfte der Kommentare ist Ragebait.',ziel:'Zehn neue Leute einstellen'},
 {id:'paul',n:'Paul',a:58,ort:'Sömmerda (Thüringer Becken)',job:'Landwirt mit Weizen, Raps und Zuckerrüben auf 300 Hektar, Kredit für Maschinen',sec:'agrar',selbst:true,netto:2400,stadt:false,pers:2,tax:true,
  betr:{energie:300,diesel:1500,lohn:0,rohstoff:0,umsatz:14000},li:{miete:0,energie:220,mobil:150,essen:520},base:300,spar:20000,kredit:150000,
  vibe:'Sein Traktor-Video mit „Gute Käse“-Sound hat 400.000 Aufrufe.',ziel:'Den Hof an die Tochter übergeben'}
];
const ROUNDS=[
 {y:'Herbst 2026',real:true,t:'Energiepreisschock',
  post:{h:'jena.foodie',txt:'Döner in Jena jetzt 8 € und der Matcha 5,50 😭 Ich bin kurz vorm Crashout. #inflation #jena',likes:'12,4 Tsd.'},
  txt:'Der Krieg im Iran treibt die Öl- und Gaspreise. Energie ist 15 % teurer als vor einem Jahr, die Inflation steigt auf 3,3 %. Die EZB erhöht den Leitzins um 0,25 Prozentpunkte.',
  ops:{E:1.15,S:1.12,L:1.03,zins:0.25,umsatz:{baecker:0.985},hex:{P:-10,W:-4,V:-3}},
  fig:{mia:'Das Deutschlandticket kostet gleich viel – aber Snacks und Matcha werden teurer.',jonas:'Die WG-Nebenkosten steigen, in der Bar bestellen die Gäste weniger.',sabine:'Tanken für die tägliche Pendelstrecke tut jetzt richtig weh.',tobias:'Der Ofen frisst Gas: Die Energierechnung der Bäckerei explodiert.',daniel:'Heizen und Tanken werden teurer, im Werk wird über Sparprogramme geredet.',gisela:'Die Gasrechnung steigt – dafür bringt das Sparbuch etwas mehr Zinsen.',lea:'Höhere Zinsen machen ihren Gründerkredit teurer.',paul:'Diesel für die Traktoren und Strom für die Trocknung kosten deutlich mehr.'},
  q:'Wie soll der Bundestag auf den Energiepreisschock reagieren?',
  opts:[
   {k:'A',t:'Energiepreisbremse',d:'Der Staat deckelt Strom- und Gaspreise für ein Jahr und bezahlt die Differenz mit Krediten.',ops:{tmp:{E:0.9},hex:{P:6,W:3,V:3,U:-6},debt:2}},
   {k:'B',t:'Klimageld auszahlen',d:'Alle bekommen dauerhaft 150 € pro Kopf und Jahr (12,50 € im Monat) aus den CO₂-Einnahmen. Die Preise bleiben, wie sie sind.',ops:{T:12.5,hex:{V:5,U:2},debt:1}},
   {k:'C',t:'Nicht eingreifen',d:'Keine Hilfen, die Schuldenbremse wird eingehalten. Hohe Preise sollen zum Energiesparen bewegen.',ops:{hex:{P:2,W:-3,V:-4,U:3},debt:-1}}],
  choice:{q:'GTA 6 erscheint am 19. November. Holst du es dir (oder verschenkst du es)?',opts:[
   {t:'Day One kaufen (rund 80 €)',cost:80,mood:8,l:'Konsum jetzt macht jetzt Spaß – das Geld fehlt aber beim Sparziel.'},
   {t:'Warten, bis es im Angebot ist',cost:0,mood:-2,l:'Neue Spiele werden oft nach einigen Monaten günstiger: Wer warten kann, spart.'},
   {t:'Gar nicht – das Geld kommt aufs Sparkonto',cost:0,mood:-4,l:'Opportunitätskosten: Jeder Euro kann nur einmal ausgegeben werden.'}]}},
 {y:'2027',real:false,t:'Zollkrieg und KI-Boom',
  post:{h:'thueringen.wirtschaft',txt:'Eisenacher Zulieferer meldet Kurzarbeit an. Gleichzeitig sucht Jenas Optikbranche 300 Fachkräfte. Peak und Crashout am selben Tag.',likes:'3.870'},
  txt:'Die USA erheben 25 % Zoll auf Autos aus der EU – Thüringer Zulieferer verlieren Aufträge. Gleichzeitig boomt die KI: Chipfabriken brauchen Präzisionsoptik aus Jena, KI-Firmen suchen Leute. Der Mindestlohn steigt wie beschlossen auf 14,60 €.',
  ops:{job:{auto:1},lohn:{optik:1.04,tech:1.08},ML:14.60/13.90,umsatz:{baecker:0.99},hex:{B:-6,W:-2,A:4}},
  fig:{mia:'Ihr Betrieb hat volle Auftragsbücher: Die Ausbildungsvergütung steigt um 4 %.',jonas:'Sein Stundenlohn in der Bar steigt mit dem Mindestlohn auf 14,60 €.',sabine:'In der Pflege ändert sich wenig.',tobias:'In Apolda wird weniger gekauft, weil viele Zulieferer-Familien sparen. Die Mindestlohnerhöhung kostet ihn zusätzlich.',daniel:'Sein Werk meldet Kurzarbeit an – wie geht es weiter?',gisela:'Ihr Nachbar arbeitet beim Zulieferer und hat Angst um seinen Job.',lea:'Investoren melden sich, die Gehälter in der KI-Branche steigen.',paul:'Kaum betroffen – Weizen wird weltweit gehandelt.'},
  q:'Wie reagiert die Politik auf die US-Zölle?',
  opts:[
   {k:'A',t:'Kurzarbeit verlängern + Weiterbildung',d:'Das Kurzarbeitergeld läuft weiter, Beschäftigte werden für E-Mobilität und KI umgeschult.',ops:{job:{auto:3},hex:{B:6,V:2,W:1},debt:1}},
   {k:'B',t:'Industriestrompreis',d:'Der Staat verbilligt Strom für die Industrie, damit die Werke wettbewerbsfähig bleiben.',ops:{job:{auto:0},hex:{B:4,W:4,U:-5,A:-2},debt:2}},
   {k:'C',t:'Gegenzölle auf US-Waren',d:'Die EU belegt US-Produkte wie Jeans, Motorräder und Whiskey mit Zöllen. Die USA reagieren verärgert.',ops:{job:{auto:2},L:1.02,hex:{P:-4,W:-3,B:-2}}}],
  choice:{q:'Matcha ist weltweit knapp: Die Nachfrage wächst durch TikTok schneller als Japans Ernte. Ein Matcha-Latte kostet jetzt 5,50 €.',opts:[
   {t:'Dreimal pro Woche gönnen (rund 860 € im Jahr)',cost:860,mood:6,l:'Knappes Angebot plus hohe Nachfrage = hoher Preis. Wer trotzdem kauft, zahlt die Knappheit mit.'},
   {t:'Matcha-Pulver kaufen und selbst machen (rund 180 €)',cost:180,mood:3,l:'Substitution: Wer auf eine günstigere Alternative ausweicht, spart.'},
   {t:'Umsteigen auf Leitungswasser',cost:0,mood:-3,l:'Verzicht spart Geld – aber Konsum ist auch Lebensqualität. Abwägen gehört dazu.'}]}},
 {y:'2028',real:false,t:'Wohnungsnot und Fachkräftemangel',
  post:{h:'wg.gesucht.jena',txt:'22 m² WG-Zimmer, 620 € warm, Besichtigung mit 40 Leuten. Ragebait oder Realität? 🙃',likes:'28,1 Tsd.'},
  txt:'Die Inflation ist zurück bei 2 %, die EZB senkt den Leitzins um 0,5 Prozentpunkte. Dafür steigen die Mieten in Jena, Weimar und Erfurt um 8 %. In der Pflege fehlen Tausende Fachkräfte – die Löhne dort steigen um 5 %.',
  ops:{zins:-0.5,Mc:1.08,Ml:1.02,lohn:{pflege:1.05},umsatz:{baecker:1.02},hex:{P:6,W:2,V:-4}},
  fig:{mia:'Sie wohnt noch bei den Eltern – die Mietexplosion trifft sie nicht.',jonas:'Die WG-Miete steigt um 8 %.',sabine:'Endlich mehr Lohn: Pflegekräfte werden dringend gesucht.',tobias:'Sinkende Zinsen helfen beim Ofen-Kredit, die Kundschaft kauft wieder mehr.',daniel:'Je nach Beschluss im letzten Jahr: Umschulung geschafft, Job gerettet – oder weiter auf Jobsuche.',gisela:'Die Miete steigt, und das Sparbuch bringt wieder weniger Zinsen.',lea:'Kredite werden günstiger, aber ihre neuen Leute finden in Jena kaum Wohnungen.',paul:'Niedrigere Zinsen entlasten den Maschinenkredit.'},
  q:'Was tut der Bundestag für ein bezahlbares Leben?',
  opts:[
   {k:'A',t:'Six-Seven-Plan: Mindestlohn +6,7 %',d:'Der Mindestlohn steigt um 6,7 % von 14,60 € auf 15,58 €.',ops:{ML:1.067,L:1.01,hex:{V:6,P:-2,B:-2}}},
   {k:'B',t:'Bauoffensive + Mietpreisbremse',d:'Der Staat fördert 100.000 Sozialwohnungen und begrenzt Mieterhöhungen in Städten strenger.',ops:{Mc:0.96,hex:{V:3,W:3,U:-2},debt:2}},
   {k:'C',t:'Einkommensteuer senken',d:'Alle Steuerzahler zahlen weniger Einkommensteuer, das Netto steigt um rund 3 %.',ops:{St:3,hex:{W:3,B:2,V:-3,P:-2},debt:2}}],
  choice:{q:'Sommer 2028: Alle aus deinem Umfeld fahren auf ein Festival. Und du?',opts:[
   {t:'Festivalticket plus Anreise (rund 350 €)',cost:350,mood:10,l:'Erlebnisse sind für viele das Wichtigste, wofür sie Geld ausgeben – sie haben aber ihren Preis.'},
   {t:'Kurztrip mit dem Deutschlandticket (rund 120 €)',cost:120,mood:5,l:'Mit einem Pauschalticket kostet jede zusätzliche Fahrt nichts: Grenzkosten null.'},
   {t:'Balkonien – Sommer zu Hause',cost:0,mood:-3,l:'Sparen schafft Sicherheit für später. Das ist eine Abwägung, kein Richtig oder Falsch.'}]}},
 {y:'2029',real:false,t:'Dürresommer und CO₂-Preis',
  post:{h:'paul.vom.acker',txt:'Seit April kaum Regen. Der Weizen vertrocknet, der Diesel wird teurer. Und alle so: Warum kostet das Brötchen jetzt 70 Cent? 🤡',likes:'41,7 Tsd.'},
  txt:'Nach einem Dürresommer fällt die Ernte um 20 % geringer aus, Lebensmittel werden 6 % teurer. Seit 2028 gilt der EU-Emissionshandel auch für Heizen und Tanken – der CO₂-Preis steigt deutlich: Sprit +8 %, Heizen +6 %.',
  ops:{L:1.06,S:1.08,E:1.06,umsatz:{agrar:0.8},hex:{P:-6,W:-3,U:-2}},
  fig:{mia:'Snacks und Brötchen werden teurer.',jonas:'Der Wocheneinkauf wird teurer, Mensa-Preise steigen.',sabine:'Sprit wird wieder teurer – die Pendelstrecke frisst ihr Budget.',tobias:'Mehl wird teurer, und er muss die Brötchenpreise erhöhen.',daniel:'Heizen und Tanken werden teurer.',gisela:'Lebensmittel und Gas belasten ihre kleine Rente.',lea:'Merkt die höheren Preise kaum.',paul:'Die Ernte ist eingebrochen, Diesel kostet mehr: das schwerste Jahr seit Langem.'},
  q:'Wie reagiert die Politik auf Dürre und CO₂-Preis?',
  opts:[
   {k:'A',t:'Klimageld verdoppeln',d:'Die CO₂-Einnahmen gehen als Klimageld zurück: zusätzlich 300 € pro Kopf und Jahr (25 € im Monat).',ops:{T:25,hex:{V:5,U:3}}},
   {k:'B',t:'Tankrabatt + Agrardiesel-Hilfe',d:'Steuern auf Benzin und Diesel sinken für ein Jahr, Landwirte bekommen Dieselhilfen.',ops:{tmp:{S:0.92},umsatz:{agrar:1.05},hex:{P:3,U:-6,V:-1},debt:2}},
   {k:'C',t:'Investitionsprogramm Klimaanpassung',d:'Kreditfinanziert: Bewässerung, Waldumbau, Schiene, Hitzeschutz – und Dürrehilfen für Bauern.',ops:{umsatz:{agrar:1.12},hex:{U:5,W:3,B:3,P:-2},debt:3}}],
  choice:{q:'Ein Finfluencer auf TikTok verspricht mit dem Memecoin „$SIXSEVEN“ 670 % Gewinn. Was machst du?',opts:[
   {t:'500 € in $SIXSEVEN stecken',cost:500,mood:5,risk:true,l:'Hohe versprochene Rendite = hohes Risiko. Die meisten Memecoins verlieren fast alles – manche Posts sind schlicht Betrug.'},
   {t:'ETF-Sparplan: 50 € im Monat',cost:0,mood:2,etf:true,l:'Breit gestreut und langfristig: weniger spektakulär, aber deutlich geringeres Risiko.'},
   {t:'Nichts – Geld bleibt auf dem Konto',cost:0,mood:0,l:'Kein Risiko, aber die Inflation knabbert am Ersparten.'}]}}
];
/* --- Figuren: Ziele, Kürzungen, Aussehen --- */
const FIGX={
 mia:{goal:{t:'Führerschein und erstes gebrauchtes Auto',amt:9000},cut:0,look:{bg:'#FFE3EC',skin:'#F3C9A8',hair:'pony',hc:'#6B3E26',top:'#74B816',acc:'matcha'}},
 jonas:{goal:{t:'Kaution und Einrichtung für eine eigene Wohnung',amt:3500},cut:40,look:{bg:'#E7F5FF',skin:'#E0AC88',hair:'messy',hc:'#2B1D14',top:'#495057',acc:'phones'}},
 sabine:{goal:{t:'Ein gebrauchtes Auto für die Pendelstrecke',amt:14500},cut:0,look:{bg:'#E6FCF5',skin:'#F1C7A5',hair:'bob',hc:'#A0522D',top:'#12B886',acc:'stetho'}},
 tobias:{goal:{t:'Die Bäckerei ohne Pleite durch die Krise bringen: mindestens 2.000 € Rücklage',amt:2000},cut:80,look:{bg:'#FFF4E6',skin:'#E8B48F',hair:'baker',hc:'#5C4033',top:'#F08C00',acc:'apron'}},
 daniel:{goal:{t:'Eine Rücklage für die Rente aufbauen',amt:20000},cut:0,look:{bg:'#F1F3F5',skin:'#D9A07A',hair:'short',hc:'#868E96',top:'#F76707',acc:'vest'}},
 gisela:{goal:{t:'23.300 € Rücklage – inklusive Geld für den Führerschein der Enkelin',amt:23300},cut:0,look:{bg:'#F3F0FF',skin:'#F3D2BA',hair:'bun',hc:'#CED4DA',top:'#9775FA',acc:'glasses'}},
 lea:{goal:{t:'Genug Kapital, um zehn neue Leute einzustellen',amt:30000},cut:120,look:{bg:'#FFF9DB',skin:'#8D5A3B',hair:'curly',hc:'#1E1E1E',top:'#E64980',acc:'laptop'}},
 paul:{goal:{t:'Den Hof mit 18.000 € Rücklage an die Tochter übergeben',amt:18000},cut:200,look:{bg:'#EBFBEE',skin:'#E3A87F',hair:'cap',hc:'#2F9E44',top:'#C92A2A',acc:'check'}}
};
FIG.forEach(f=>Object.assign(f,FIGX[f.id]));
FIG.find(f=>f.id==='mia').li.mobil=0; // Deutschlandticket: fester Preis

function portraitSVG(f){
  const L=f.look,h=L.hc,sk=L.skin;let back='',front='',acc='';
  switch(L.hair){
    case 'pony':back=`<path d="M52 24 Q68 30 60 50" stroke="${h}" stroke-width="7" fill="none" stroke-linecap="round"/>`;front=`<path d="M24.5 34 Q24 17 40 17 Q56 17 55.5 34 Q51 24 40 24 Q29 24 24.5 34Z" fill="${h}"/>`;break;
    case 'messy':front=`<path d="M24.5 33 Q23 19 34 17 L37 12 L41 17 L46 13 L47 18 Q57 20 55.5 33 Q52 25 45 25 L42 22 L38 26 L34 23 Q27 25 24.5 33Z" fill="${h}"/>`;break;
    case 'bob':back=`<path d="M23 36 Q22 16 40 16 Q58 16 57 36 L58 50 Q51 50 50 44 L30 44 Q29 50 22 50Z" fill="${h}"/>`;front=`<path d="M25 32 Q27 18 40 18 Q53 18 55 32 Q46 26 34 27 Q29 28 25 32Z" fill="${h}"/>`;break;
    case 'baker':front=`<path d="M26 26 Q22 12 31 12 Q33 4 40 6 Q47 4 49 12 Q58 12 54 26Z" fill="#FFFFFF" stroke="#CED4DA" stroke-width="1.5"/><rect x="26" y="24" width="28" height="5" rx="2" fill="#F1F3F5" stroke="#CED4DA"/>`;break;
    case 'short':front=`<path d="M25 31 Q25 18 40 18 Q55 18 55 31 Q50 23 40 23 Q30 23 25 31Z" fill="${h}"/>`;break;
    case 'bun':back=`<circle cx="40" cy="15" r="7" fill="${h}"/>`;front=`<path d="M24.5 33 Q24 18 40 18 Q56 18 55.5 33 Q52 23 40 23 Q28 23 24.5 33Z" fill="${h}"/>`;break;
    case 'curly':back=[[26,26],[31,18],[40,14],[49,18],[54,26],[56,36],[24,36],[25,46],[55,46]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="8" fill="${h}"/>`).join('');front=`<path d="M26 30 Q30 20 40 20 Q50 20 54 30 Q47 25 40 26 Q33 25 26 30Z" fill="${h}"/>`;break;
    case 'cap':front=`<path d="M24 31 Q24 16 40 16 Q56 16 56 31Z" fill="${h}"/><path d="M50 29 L67 31 Q66 34 52 33Z" fill="${h}"/>`;break;
  }
  switch(L.acc){
    case 'matcha':acc=`<rect x="57" y="59" width="11" height="15" rx="2" fill="#94D82D"/><rect x="56" y="56" width="13" height="4" rx="1.5" fill="#F8F9FA"/><rect x="61" y="50" width="2" height="7" fill="#F8F9FA"/>`;break;
    case 'phones':acc=`<path d="M27 52 Q40 62 53 52" stroke="#212529" stroke-width="3.5" fill="none"/><circle cx="27" cy="51" r="4" fill="#212529"/><circle cx="53" cy="51" r="4" fill="#212529"/>`;break;
    case 'stetho':acc=`<path d="M31 56 Q32 70 40 70 Q48 70 49 56" stroke="#E9ECEF" stroke-width="2.2" fill="none"/><circle cx="40" cy="71" r="3" fill="#ADB5BD"/>`;break;
    case 'apron':acc=`<path d="M31 60 L49 60 L52 80 L28 80Z" fill="#FFFFFF" opacity=".92"/>`;break;
    case 'vest':acc=`<rect x="13" y="66" width="54" height="4" fill="#F8F9FA"/><rect x="11" y="73" width="58" height="3" fill="#F8F9FA"/>`;break;
    case 'glasses':acc=`<circle cx="34.5" cy="35" r="4.2" stroke="#495057" stroke-width="1.4" fill="none"/><circle cx="45.5" cy="35" r="4.2" stroke="#495057" stroke-width="1.4" fill="none"/><line x1="38.7" y1="35" x2="41.3" y2="35" stroke="#495057" stroke-width="1.4"/>${[31,35.5,40,44.5,49].map(x=>`<circle cx="${x}" cy="${58+Math.abs(x-40)/4}" r="1.7" fill="#F8F9FA"/>`).join('')}`;break;
    case 'laptop':acc=`<rect x="30" y="31.5" width="9" height="7" rx="2" stroke="#F1F3F5" stroke-width="1.4" fill="none"/><rect x="41" y="31.5" width="9" height="7" rx="2" stroke="#F1F3F5" stroke-width="1.4" fill="none"/><rect x="20" y="66" width="40" height="14" rx="2" fill="#CED4DA"/><circle cx="40" cy="73" r="2" fill="#ADB5BD"/>`;break;
    case 'check':acc=`<g stroke="#FFFFFF" stroke-opacity=".45" stroke-width="2">${[24,32,40,48,56].map(x=>`<line x1="${x}" y1="59" x2="${x}" y2="80"/>`).join('')}<line x1="14" y1="67" x2="66" y2="67"/><line x1="12" y1="75" x2="68" y2="75"/></g>`;break;
  }
  return `<svg viewBox="0 0 80 80" aria-hidden="true"><rect width="80" height="80" rx="16" fill="${L.bg}"/>${back}<path d="M8 80 C10 60 24 54 40 54 C56 54 70 60 72 80 Z" fill="${L.top}"/><rect x="35" y="44" width="10" height="12" rx="4" fill="${sk}"/><circle cx="40" cy="34" r="15" fill="${sk}"/>${front}<circle cx="34.5" cy="35" r="1.8" fill="#212529"/><circle cx="45.5" cy="35" r="1.8" fill="#212529"/><path d="M35 41 Q40 45 45 41" stroke="#212529" stroke-width="1.6" fill="none" stroke-linecap="round"/>${acc}</svg>`;
}

/* --- Fotos (Unsplash-Lizenz) mit Infopunkten --- */
const PHOTOS=["img/szene-1-tankstelle.jpg", "img/szene-2-hafen.jpg", "img/szene-3-jena.jpg", "img/szene-4-duerre.jpg"];
const PHOTO_META=[{"alt": "Eine Person in roter Jacke tankt ein Auto an der Zapfsäule", "credit": "Foto: engin akyurt / Unsplash", "hs": [{"x": 33, "y": 52, "t": "Was steckt im Spritpreis?", "d": "Von jedem Liter Benzin geht ein großer Teil an den Staat: 65,45 Cent Energiesteuer, dazu der CO₂-Preis (2026 rund 13 bis 15 Cent) und 19 % Mehrwertsteuer auf alles. Der Rest deckt Rohöl, Raffinerie, Transport und die Marge der Tankstelle. Steigt der Ölpreis, steigt der Spritpreis – die Energiesteuer bleibt gleich."}, {"x": 72, "y": 29, "t": "Pendeln kostet", "d": "Wer wie Sabine täglich 40 km zur Arbeit fährt und zurück, kommt auf rund 1.700 km im Monat und tankt über 100 Liter. Jeder Cent mehr pro Liter kostet also über einen Euro im Monat. Seit 2026 gibt es ab dem ersten Kilometer 38 Cent Pendlerpauschale – das senkt die Steuer etwas."}, {"x": 8, "y": 63, "t": "Öl wird in Dollar bezahlt", "d": "Rohöl wird weltweit in US-Dollar gehandelt. Wird der Euro schwächer, zahlt Deutschland für dieselbe Menge Öl mehr – selbst wenn der Ölpreis in Dollar gleich bleibt. Das nennt man importierte Inflation."}]}, {"alt": "Großes Containerschiff der Reederei COSCO an den Kränen eines Containerterminals im Hamburger Hafen", "credit": "Foto: Jacob Meissner / Unsplash", "hs": [{"x": 55, "y": 52, "t": "Exportland Deutschland", "d": "Deutschland hat 2024 Waren für gut 1,5 Billionen Euro exportiert. Wichtigstes Abnehmerland waren die USA. US-Zölle treffen deshalb vor allem Autos, Maschinen und Chemie – und damit auch Zulieferer in Thüringen."}, {"x": 28, "y": 76, "t": "Ein Schiff aus China", "d": "Das Schiff gehört der chinesischen Reederei COSCO. Aus China importiert Deutschland mehr als aus jedem anderen Land: Smartphones, Laptops, Solarmodule, Batterien. 2023 stieg COSCO mit knapp 25 % bei einem Hamburger Containerterminal ein – das war politisch heftig umstritten."}, {"x": 75, "y": 21, "t": "Wer zahlt den Zoll?", "d": "Ein Zoll ist eine Steuer auf Importe. Zahlen muss ihn das importierende Unternehmen im Zielland, das die Kosten meist an die Kundschaft weitergibt. US-Zölle auf deutsche Autos zahlen also zuerst US-Händler – deutsche Hersteller verlieren aber Kunden, weil ihre Autos teurer werden."}]}, {"alt": "Blick über das Saaletal auf Jena mit dem JenTower, im Vordergrund Wald, Wiesen und ein Ortsteil", "credit": "Foto: Lukas D. / Unsplash", "hs": [{"x": 36, "y": 30, "t": "Der JenTower", "d": "Das rund 145 Meter hohe Hochhaus wurde Anfang der 1970er Jahre als Forschungsgebäude für den VEB Carl Zeiss Jena gebaut. Heute steht Jena für Optik, Photonik und Software – diese Branchen ziehen Fachkräfte aus aller Welt an, und die suchen Wohnungen."}, {"x": 72, "y": 82, "t": "Knapper Wohnraum", "d": "In Universitätsstädten wie Jena konkurrieren Studierende, Fachkräfte und Familien um dieselben Wohnungen. Das enge Saaletal lässt wenig Platz für neue Baugebiete. Ist das Angebot knapp und steigt die Nachfrage, steigen die Mieten."}, {"x": 86, "y": 30, "t": "Bauen oder schützen?", "d": "Neue Wohnungen brauchen Fläche. Die Hänge rund um Jena sind aber Natur- und Erholungsgebiete, bekannt für seltene Orchideen. Deutschland will den Flächenverbrauch bis 2030 auf unter 30 Hektar pro Tag senken. Hier treffen bezahlbares Wohnen und Umweltschutz direkt aufeinander."}]}, {"alt": "Abgeerntetes, ausgetrocknetes Feld mit tiefen Rissen im Boden und Stoppeln", "credit": "Foto: Md. Hasanuzzaman Himel / Unsplash", "hs": [{"x": 68, "y": 43, "t": "Wenn der Boden reißt", "d": "Im Dürresommer 2018 fiel die Getreideernte in Deutschland um rund 16 % geringer aus als im Durchschnitt der Vorjahre. Bund und Länder halfen betroffenen Betrieben mit bis zu 340 Millionen Euro. Das Thüringer Becken gehört zu den trockensten Regionen Deutschlands."}, {"x": 7, "y": 56, "t": "Weniger Ernte, höhere Preise?", "d": "Wird weltweit weniger Getreide geerntet, steigt der Preis. Einem Bauern in einer Dürreregion hilft das kaum, denn er hat wenig zu verkaufen. Für Bäckereien wie die von Tobias steigen dagegen die Mehlkosten."}, {"x": 29, "y": 24, "t": "Anpassung an den Klimawandel", "d": "Trockenresistente Sorten, Bewässerung und humusreiche Böden, die mehr Wasser speichern, helfen gegen Dürre. Das kostet Geld – genau darum geht es beim Investitionsprogramm Klimaanpassung."}]}];
/* --- Echte Vorbilder und Fachbegriff-Check je Maßnahme --- */
const OPTX={
 '0A':{real:'2023 galten in Deutschland Strom- und Gaspreisbremsen: Für 80 % des bisherigen Verbrauchs zahlten Haushalte höchstens 40 Cent je kWh Strom und 12 Cent je kWh Gas. Bezahlt wurde das mit Krediten aus dem bis zu 200 Milliarden Euro großen „Abwehrschirm“.',
  chk:{a:'Zielkonflikt: Preisniveau wird stabiler, der Umweltschutz leidet',d:['Zielharmonie: Preisniveau und Umweltschutz verbessern sich gemeinsam','Zielneutralität: Die Maßnahme wirkt nur auf das Preisniveau'],why:'Günstigere Energie senkt die gemessene Inflation, nimmt aber den Anreiz zum Energiesparen – mehr Verbrauch bedeutet mehr Emissionen. Dazu kommen neue Schulden.'}},
 '0B':{real:'Ein Klimageld wurde 2021 im Koalitionsvertrag vereinbart, aber nie ausgezahlt. Österreich zahlte von 2022 bis 2024 einen „Klimabonus“ an alle Einwohner, die Schweiz verteilt ihre CO₂-Abgabe seit 2008 über die Krankenkassenprämien an alle zurück.',
  chk:{a:'Zielharmonie: Verteilung und Umweltschutz verbessern sich gemeinsam',d:['Zielkonflikt: Die Verteilung wird gerechter, die Umwelt leidet','Zielkonflikt: Die Verteilung wird gerechter, die Preise steigen stark'],why:'Der CO₂-Preis bleibt als Sparanreiz bestehen. Weil alle denselben Betrag bekommen, gewinnen Haushalte mit kleinem Einkommen und geringem Verbrauch unterm Strich am meisten.'}},
 '0C':{real:'2022 sank der Gasverbrauch in Deutschland bei hohen Preisen deutlich – Haushalte und Industrie sparten. Trotzdem griffen fast alle EU-Staaten mit Hilfen ein, weil die Belastung für Haushalte mit wenig Geld sehr hoch war.',
  chk:{a:'Zielkonflikt: Der Umweltschutz profitiert, Verteilung und Wachstum leiden',d:['Zielharmonie: Alle Ziele profitieren, weil der Staat spart','Zielneutralität: Ohne Eingriff ändert sich am Sechseck nichts'],why:'Hohe Preise bringen Menschen zum Energiesparen, belasten aber Geringverdiener besonders und bremsen den Konsum. Auch „nichts tun“ ist eine Entscheidung mit Folgen.'}},
 '1A':{real:'In der Corona-Krise waren im April 2020 rund 6 Millionen Menschen in Kurzarbeit. Die Arbeitslosigkeit stieg dadurch deutlich weniger als in vielen anderen Ländern – das Instrument gilt international als deutsches Erfolgsmodell.',
  chk:{a:'Zielharmonie: Beschäftigung und Verteilung verbessern sich gemeinsam',d:['Zielkonflikt: Mehr Beschäftigung, aber ungerechtere Verteilung','Zielkonflikt: Mehr Beschäftigung, aber weniger Umweltschutz'],why:'Jobs bleiben erhalten und Einkommen brechen nicht weg – Arbeit ist die wichtigste Einkommensquelle. Die Weiterbildung bekämpft zugleich strukturelle Arbeitslosigkeit. Der Preis sind höhere Staatsausgaben.'}},
 '1B':{real:'Seit 2024 zahlt das produzierende Gewerbe bei der Stromsteuer nur noch den EU-Mindestsatz. Ein noch stärker verbilligter Industriestrompreis wurde jahrelang diskutiert – Kritiker warnen vor dauerhaften Subventionen.',
  chk:{a:'Zielkonflikt: Beschäftigung und Wachstum profitieren, Umwelt und Außenwirtschaft leiden',d:['Zielharmonie: Billiger Strom hilft allen sechs Zielen','Zielkonflikt: Mehr Beschäftigung, aber höhere Inflation'],why:'Billiger Strom sichert Industriejobs, senkt aber den Anreiz, Energie zu sparen. Und weil die Exporte steigen, wächst der ohnehin hohe Leistungsbilanzüberschuss.'}},
 '1C':{real:'2018 reagierte die EU auf US-Zölle auf Stahl mit Gegenzöllen auf Jeans, Bourbon-Whiskey und Motorräder. 2025 verzichtete die EU dagegen auf Vergeltung und akzeptierte in einem Abkommen US-Zölle von 15 % auf die meisten Waren.',
  chk:{a:'Kein Ziel gewinnt: Preisniveau, Wachstum und Beschäftigung verschlechtern sich zugleich',d:['Zielharmonie: Zölle schützen Jobs und senken die Preise','Zielkonflikt: Mehr Beschäftigung, aber höhere Preise'],why:'Zölle verteuern Importe, provozieren weitere Gegenmaßnahmen und kosten Exportjobs. Ökonomen sehen in Handelskriegen fast nur Verlierer.'}},
 '2A':{real:'Der Mindestlohn wurde 2015 mit 8,50 € eingeführt und 2022 per Gesetz auf 12 € angehoben. Die befürchteten massenhaften Jobverluste blieben aus, allerdings ging die Zahl der Minijobs zurück.',
  chk:{a:'Zielkonflikt: Die Verteilung wird gerechter, Preisniveau und Beschäftigung können leiden',d:['Zielharmonie: Verteilung und Beschäftigung verbessern sich gemeinsam','Zielneutralität: Ein höherer Mindestlohn betrifft nur die Verteilung'],why:'Geringverdiener gewinnen. Höhere Lohnkosten werden aber teils über Preise weitergegeben, und manche Betriebe stellen weniger ein – wie stark, ist in der Forschung umstritten.'}},
 '2B':{real:'Die Mietpreisbremse gilt seit 2015 in angespannten Wohnungsmärkten. Die Bundesregierung wollte ab 2022 jedes Jahr 400.000 neue Wohnungen – 2023 wurden aber nur rund 295.000 fertig.',
  chk:{a:'Zielkonflikt: Verteilung und Wachstum profitieren, der Umweltschutz leidet',d:['Zielharmonie: Bauen hilft Verteilung und Umwelt gleichermaßen','Zielneutralität: Wohnungsbau betrifft das Sechseck nicht'],why:'Mehr Wohnungen dämpfen die Mieten und bringen Aufträge für den Bau. Neubau verbraucht aber Fläche und Baustoffe wie Zement, dessen Herstellung viel CO₂ verursacht.'}},
 '2C':{real:'Mit dem Inflationsausgleichsgesetz hob der Bund 2023 und 2024 den Grundfreibetrag an und glich die „kalte Progression“ aus. Steuerzahler wurden um mehrere Milliarden Euro im Jahr entlastet.',
  chk:{a:'Zielkonflikt: Wachstum profitiert, die Verteilung wird ungleicher',d:['Zielharmonie: Wachstum und gerechte Verteilung verbessern sich gemeinsam','Zielneutralität: Steuersenkungen wirken nur auf die Staatskasse'],why:'Mehr Netto stärkt Konsum und Wachstum. Gutverdiener sparen in Euro aber am meisten, und wer keine Einkommensteuer zahlt (Rentner mit kleiner Rente, Studierende), bekommt nichts.'}},
 '3A':{real:'Die Schweiz zahlt ihre CO₂-Abgabe seit 2008 pro Kopf an die Bevölkerung zurück. Untersuchungen zeigen: Haushalte mit kleinem Einkommen bekommen dabei oft mehr zurück, als sie bezahlen.',
  chk:{a:'Zielharmonie: Verteilung und Umweltschutz verbessern sich gemeinsam',d:['Zielkonflikt: Die Verteilung wird gerechter, die Umwelt leidet','Zielneutralität: Klimageld wirkt nur auf die Verteilung'],why:'Der CO₂-Preis bleibt voll wirksam, die Einnahmen fließen gleichmäßig zurück. Wer sparsam lebt, gewinnt – das sind oft Haushalte mit wenig Geld.'}},
 '3B':{real:'Im Sommer 2022 gab es drei Monate lang einen Tankrabatt: Die Energiesteuer sank um rund 30 Cent je Liter Benzin und 14 Cent je Liter Diesel. Als 2024 die Agrardiesel-Hilfe gestrichen werden sollte, protestierten Landwirte bundesweit mit Traktoren.',
  chk:{a:'Zielkonflikt: Das Preisniveau wird stabiler, der Umweltschutz leidet',d:['Zielharmonie: Günstiger Sprit hilft Preisniveau und Umwelt','Zielneutralität: Der Tankrabatt wirkt nur auf Pendler'],why:'Billigeres Tanken senkt kurzfristig die Inflation, setzt aber ein klimaschädliches Signal. Am meisten profitieren Vielfahrer – und es kostet den Staat Milliarden.'}},
 '3C':{real:'2025 beschloss der Bundestag ein Sondervermögen von 500 Milliarden Euro für Infrastruktur, davon 100 Milliarden für den Klimaschutz. Dafür wurde das Grundgesetz geändert.',
  chk:{a:'Zielharmonie zwischen Umwelt, Wachstum und Beschäftigung – erkauft mit neuen Schulden',d:['Zielkonflikt: Mehr Umweltschutz, aber weniger Wachstum','Zielneutralität: Investitionen wirken erst in Jahrzehnten'],why:'Investitionen bringen Aufträge und Jobs und schützen vor Klimafolgen. Der Preis: Die zusätzliche Nachfrage treibt die Preise leicht, und die Schulden steigen – künftige Generationen zahlen mit.'}}
};
ROUNDS.forEach((R,i)=>R.opts.forEach(o=>Object.assign(o,OPTX[i+o.k])));
const CHK_PERM=[[1,0,2],[2,1,0],[0,2,1],[1,2,0]];
function chkOptions(o,r){const all=[o.chk.a].concat(o.chk.d);return CHK_PERM[r].map(i=>({txt:all[i],ok:i===0}))}
function realHTML(o){return `<div class="real"><b>Das gab es wirklich</b><p class="small" style="margin-top:4px">${esc(o.real)}</p></div>`}
function debtHTML(d){return `<p class="small">Staatsverschuldung</p><div class="bar debt"><i style="width:${d}%;background:${d>=82?'var(--bad)':d<40?'var(--ok)':'var(--amb)'}"></i></div><p class="small muted">Ab der Markierung greift 2029 die Schuldenbremse: Dann kommt ein Sparpaket.</p>`}
function crisisHTML(rd){return rd&&rd.crisis?`<div class="fb bad"><b>Die Schuldenbremse greift!</b> Die Staatsschulden sind in den letzten Jahren stark gestiegen. Der Bund muss sparen: Das Klimageld wird halbiert, Förderprogramme wie BAföG, Gründer-, Handwerks- und Agrarförderung werden gekürzt. Wachstum und Verteilung leiden.</div>`:''}

function newSt(){return {E:1,S:1,L:1,Mc:1,Ml:1,zins:ZINS0,ML:ML0,lohn:{},umsatz:{},job:{},T:0,St:0,tmp:{},hex:Object.assign({},START.de.v),debt:50}}
const cloneSt=s=>JSON.parse(JSON.stringify(s));
function applyOps(st,o){
  if(!o)return;
  ['E','S','L','Mc','Ml'].forEach(k=>{if(o[k])st[k]*=o[k]});
  if(o.zins)st.zins+=o.zins;
  if(o.ML)st.ML=Math.round(st.ML*o.ML*100)/100;
  if(o.lohn)for(const s in o.lohn)st.lohn[s]=(st.lohn[s]||1)*o.lohn[s];
  if(o.umsatz)for(const s in o.umsatz)st.umsatz[s]=(st.umsatz[s]||1)*o.umsatz[s];
  if(o.job)Object.assign(st.job,o.job);
  if(o.T)st.T+=o.T; if(o.St)st.St+=o.St;
  if(o.tmp)for(const k in o.tmp)st.tmp[k]=(st.tmp[k]||1)*o.tmp[k];
  if(o.hex)for(const k in o.hex)st.hex[k]=clamp(st.hex[k]+o.hex[k],0,100);
  if(o.debt)st.debt=clamp(st.debt+o.debt*8,0,100);
}
function simulate(decs){
  const st=newSt(),out=[];
  for(let i=0;i<ROUNDS.length;i++){
    const R=ROUNDS[i]; st.tmp={};
    if(st.job.auto===3)st.job.auto=0;      // Umschulung abgeschlossen
    else if(st.job.auto===2&&i===3)st.job.auto=4; // nach langer Suche neuer Job
    const hex0=Object.assign({},st.hex),debt0=st.debt;
    if(i===3&&st.debt>=82){st.crisis=true;st.T*=0.5;applyOps(st,{hex:{W:-3,V:-3}})}
    applyOps(st,R.ops);
    const ev=cloneSt(st); let after=null;
    const o=R.opts.find(x=>x.k===decs[i]);
    if(o){applyOps(st,o.ops);after=cloneSt(st)}
    out.push({hex0,debt0,ev,after,d:o?o.k:null,crisis:!!st.crisis});
    if(!o)break;
  }
  return out;
}
function monthly(f,s){
  const t=s.tmp||{},E=s.E*(t.E||1),S=s.S*(t.S||1),M=f.stadt?s.Mc:s.Ml,parts=[];
  const pc=x=>sgn((x-1)*100,0)+' %';
  const add=(l,v,w)=>{if(Math.abs(v)>=1)parts.push([l,Math.round(v),w||''])};
  add('Energie zu Hause',-f.li.energie*(E-1),`Energiepreise ${pc(E)} gegenüber Herbst 2026 (Iran-Krieg, später der CO₂-Preis${t.E?'; dieses Jahr gedämpft durch die Preisbremse':''}) → Strom und Heizung (${eur(f.li.energie)} im Monat) werden teurer.`);
  add('Tanken & Mobilität',-f.li.mobil*(S-1),`Spritpreise ${pc(S)}${t.S?' (dieses Jahr gedämpft durch den Tankrabatt)':''} → Tanken für ${eur(f.li.mobil)} im Monat wird teurer. Wer viel pendelt, trifft das besonders.`);
  add('Lebensmittel & Konsum',-f.li.essen*(s.L-1),`Lebensmittel und Konsumgüter ${pc(s.L)}: Höhere Energie- und Transportkosten, Zölle und die Dürre werden über die Preise weitergegeben → der Einkauf (${eur(f.li.essen)} im Monat) wird teurer.`);
  add('Miete',-f.li.miete*(M-1),`Mieten ${pc(M)}: ${f.stadt?'In den Städten':'Auch auf dem Land'} suchen mehr Menschen eine Wohnung, als es Wohnungen gibt. Knappes Angebot plus hohe Nachfrage → der Preis steigt.`);
  const dz=s.zins-ZINS0;
  const zt=dz>=0?`Die EZB hat den Leitzins seit Herbst 2026 um ${fmt(dz,2)} Prozentpunkte erhöht`:`Die EZB hat den Leitzins seit Herbst 2026 um ${fmt(-dz,2)} Prozentpunkte gesenkt`;
  add('Zinsen aufs Ersparte',f.spar*dz/100/12,`${zt} → Banken zahlen ${dz>0?'mehr':'weniger'} Zinsen auf ${eur(f.spar)} Erspartes.`);
  if(f.kredit)add('Kreditzinsen',-f.kredit*dz/100/12,`${zt} → der Kredit über ${eur(f.kredit)} (variabler Zins) wird ${dz>0?'teurer':'günstiger'}.`);
  const LW={optik:'KI-Boom: Chipfabriken brauchen Präzisionsoptik aus Jena → volle Auftragsbücher → höhere Vergütung',tech:'KI-Boom: Fachkräfte sind knapp und begehrt → höhere Gehälter',pflege:'Fachkräftemangel in der Pflege: Krankenhäuser konkurrieren um Personal → höhere Löhne'};
  if(!f.selbst&&!f.mini)add(f.sec==='rente'?'Rente':(f.sec==='optik'?'Ausbildungsvergütung':'Lohn'),f.netto*((s.lohn[f.sec]||1)-1),`${LW[f.sec]||'Lohnänderung'} (${pc(s.lohn[f.sec]||1)}).`);
  if(f.mini)add('Mindestlohn im Minijob',f.mini*(s.ML-ML0),`Der Mindestlohn steigt von 13,90 € auf ${fmt(s.ML,2)} € → ${f.mini} Stunden × ${fmt(s.ML-ML0,2)} € mehr im Monat. Die Minijob-Grenze wächst automatisch mit.`);
  const j=s.job[f.sec]||0;
  if(j===1)add('Kurzarbeit',-0.2*f.netto,'US-Zölle → weniger Aufträge → kürzere Arbeitszeit. Das Kurzarbeitergeld ersetzt nur 60 % (mit Kind 67 %) des ausgefallenen Nettolohns.');
  if(j===3)add('Kurzarbeit mit Weiterbildung',-0.15*f.netto,'Kurzarbeit, aber die freie Zeit wird für eine Umschulung genutzt, die der Staat bezahlt. Ab dem nächsten Jahr wartet ein sicherer Job.');
  if(j===2)add('Jobverlust: Arbeitslosengeld',-0.4*f.netto,'Gegenzölle → der Handelsstreit eskaliert → weitere Aufträge fallen weg → Entlassung. Das Arbeitslosengeld I beträgt 60 % (mit Kind 67 %) des letzten Nettolohns.');
  if(j===4)add('Neuer Job mit weniger Lohn',-0.1*f.netto,'Nach langer Suche ein Job in einer anderen Branche. Die Erfahrung aus dem alten Beruf zählt dort weniger, also gibt es weniger Lohn – typisch für strukturelle Arbeitslosigkeit.');
  if(f.betr){const b=f.betr;
    const kE=-b.energie*(E-1),kD=-(b.diesel||0)*(S-1),kL=-(b.lohn||0)*(s.ML/ML0-1)*0.5,kR=-(b.rohstoff||0)*(s.L-1);
    add('Betrieb: Energie',kE,`${f.sec==='agrar'?'Strom für Trocknung und Ställe':'Gas für den Backofen'} ${pc(E)} → die Energiekosten des Betriebs (${eur(b.energie)} im Monat) steigen.`);
    add('Betrieb: Diesel',kD,`Diesel ${pc(S)} → Traktoren und Erntemaschinen (${eur(b.diesel||0)} im Monat) werden teurer im Betrieb.`);
    add('Betrieb: Löhne (Mindestlohn)',kL,`Mindestlohn jetzt ${fmt(s.ML,2)} € → Verkaufskräfte und Aushilfen kosten mehr.`);
    add('Betrieb: Mehl und Zutaten',kR,`Mehl, Butter und Zucker ${pc(s.L)} → der Wareneinsatz (${eur(b.rohstoff||0)} im Monat) wird teurer.`);
    add('Betrieb: höhere Verkaufspreise',-0.7*(kE+kD+kL+kR),'Rund 70 % der höheren Kosten gibt der Betrieb über höhere Preise an die Kundschaft weiter. Genau so entsteht Inflation: Kosten wandern durch die Wirtschaft (Kostendruckinflation).');
    add(f.sec==='agrar'?'Betrieb: Ernteerlöse':'Betrieb: Umsatz',b.umsatz*0.35*((s.umsatz[f.sec]||1)-1),f.sec==='agrar'?`Ernteerlöse ${pc(s.umsatz.agrar||1)}: Die Dürre vernichtet einen Teil der Ernte, Hilfen gleichen das nur teilweise aus.`:`Umsatz ${pc(s.umsatz[f.sec]||1)}: Wenn die Kundschaft spart, wird weniger gekauft (Kaufzurückhaltung); erholt sich die Lage, kaufen die Leute wieder mehr.`);}
  if(s.T)add('Klimageld',s.T*f.pers,`Klimageld: ${fmt(s.T,2)} € pro Person und Monat × ${f.pers} ${f.pers>1?'Personen':'Person'} im Haushalt. Alle bekommen gleich viel – wer wenig Energie verbraucht, gewinnt unterm Strich.${s.crisis?' Wegen des Sparpakets wurde es halbiert.':''}`);
  if(s.St&&f.tax)add('Steuerentlastung',f.netto*s.St/100,`Die Einkommensteuer wurde gesenkt → rund ${fmt(s.St,0)} % mehr Netto. Wer keine Einkommensteuer zahlt, hat nichts davon.`);
  if(s.crisis&&f.cut)add('Sparpaket des Bundes',-f.cut,'Hohe Schulden → die Schuldenbremse greift → der Bund kürzt Förderungen, zum Beispiel BAföG, Gründer-, Handwerks- und Agrarförderung.');
  return {sum:parts.reduce((a,p)=>a+p[1],0),parts};
}
function moodLabel(m){return m>=80?['Peak','ok']:m>=65?['Gute Käse','ok']:m>=45?['Passt schon','neu']:m>=30?['Angespannt','amb']:['Crashout','bad']}
function figTrack(f,decs,ch,chx){
  // Kontostand und Stimmung über die abgeschlossenen Runden
  const sim=simulate(decs);let konto=f.spar,joy=0,mood=60,policy=0;const rows=[];
  sim.forEach((rd,i)=>{if(!rd.after)return;const m=monthly(f,rd.after);const yr=12*(f.base+m.sum);konto+=yr;policy+=12*m.sum;
    const j=rd.after.job[f.sec]||0;
    const c=ch&&ch[i]!=null?ROUNDS[i].choice.opts[ch[i]]:null;
    if(c){konto-=c.cost;joy+=c.mood;if(c.risk)konto+=(chx&&chx[i])||0;if(c.etf)konto+=30}
    mood=clamp(Math.round(60+clamp(m.sum/f.netto*150,-35,30)+({1:-8,2:-15,3:-4,4:-4}[j]||0)+joy),0,100);rows.push({i,m,yr,konto,mood})});
  const done=rows.length,last=done?rows[done-1].m.sum:0,prog=Math.round(konto+(4-done)*12*(f.base+last));
  return {konto:Math.round(konto),mood,policy:Math.round(policy),rows,start:f.spar,prog,goalOk:konto>=f.goal.amt};
}
const eur=(n,d=0)=>fmt(n,d)+' €';
const sgnE=n=>(n>0?'+':n<0?'−':'±')+fmt(Math.abs(Math.round(n)),0)+' €';
function postHTML(R){return `<div class="post"><div class="who"><span class="av"><span class="ms sm">person</span></span><span>@${esc(R.post.h)}</span></div><div>${esc(R.post.txt)}</div><div class="meta"><span class="ms sm">favorite</span>${R.post.likes} · fiktiver Beitrag</div></div>`}
function hexPillsHTML(h){return ORDER.filter(k=>h&&h[k]).map(k=>`<span class="pill ${h[k]>0?'ok':'bad'}">${G[k].short} ${h[k]>0?'+':'−'}${Math.abs(h[k])}</span>`).join(' ')}
function partsHTML(m){if(!m.parts.length)return '<p class="small muted">Keine Veränderung gegenüber dem Start.</p>';
  return `<p class="small muted">Tippe auf eine Zeile: Warum ändert sich das?</p><div class="tbl-wrap"><table><tbody>${m.parts.slice().sort((a,b)=>a[1]-b[1]).map(([l,v,w])=>`<tr><td><details class="why"><summary>${esc(l)}</summary><p class="small">${esc(w)}</p></details></td><td class="r num ${v>0?'pos':'neg'}" style="vertical-align:top">${sgnE(v)}</td></tr>`).join('')}<tr><td><b>Summe pro Monat</b></td><td class="r num ${m.sum>=0?'pos':'neg'}"><b>${sgnE(m.sum)}</b></td></tr></tbody></table></div>`}
function figsTableHTML(decs,r,useAfter){
  const sim=simulate(decs),rd=sim[r];if(!rd)return '';
  const s=useAfter&&rd.after?rd.after:rd.ev;
  return `<div class="tbl-wrap"><table><thead><tr><th>Figur</th><th class="r">Veränderung pro Monat</th><th>Stärkster Effekt</th></tr></thead><tbody>${FIG.map(f=>{const m=monthly(f,s);const top=m.parts.slice().sort((a,b)=>Math.abs(b[1])-Math.abs(a[1]))[0];
    return `<tr><td>${esc(f.n)} <span class="small muted">(${f.a}, ${esc(f.ort.split(' (')[0])})</span></td><td class="r num ${m.sum>=0?'pos':'neg'}"><b>${sgnE(m.sum)}</b></td><td class="small">${top?esc(top[0])+' '+sgnE(top[1]):'–'}</td></tr>`}).join('')}</tbody></table></div><p class="small muted">Veränderung gegenüber Herbst 2026 vor dem Schock; normale Lohn- und Rentenerhöhungen sind herausgerechnet.</p>`;
}
function optMatrixHTML(decs,r){
  const R=ROUNDS[r];
  return `<div class="tbl-wrap"><table><thead><tr><th>Figur</th>${R.opts.map(o=>`<th class="r"><span class="letter" style="--oc:${OPTC[o.k]};display:inline-grid;width:24px;height:24px;font-size:.8rem">${o.k}</span></th>`).join('')}</tr></thead><tbody>${FIG.map(f=>{
    const base=monthly(f,simulate(decs.slice(0,r))[r].ev).sum;
    return `<tr><td>${esc(f.n)}</td>${R.opts.map(o=>{const s=simulate(decs.slice(0,r).concat([o.k]))[r].after;const v=monthly(f,s).sum-base;return `<td class="r num ${v>0.5?'pos':v<-0.5?'neg':''}">${sgnE(v)}</td>`}).join('')}</tr>`}).join('')}</tbody></table></div><p class="small muted">Wirkung des Beschlusses auf die Monatsbilanz jeder Figur.</p>`;
}
const photo=r=>{const M=PHOTO_META[r];return photoHTML({src:PHOTOS[r],alt:M.alt,credit:M.credit,hs:M.hs},'ms6-hs-'+r)};
export { PHOTOS };

/* --- Anbindung an die Planspiel-Grundmechanik --- */
export const SPIEL={
  thema:'sechseck',
  speicher:'ms6-leben',
  figuren:FIG,
  runden:ROUNDS,
  portrait:portraitSVG,
  einleitung:'Ihr übernehmt eine von acht Figuren aus der Region – vom Azubi in Jena bis zum Landwirt bei Sömmerda. Vier Runden lang (2026 bis 2029) passieren Dinge, die das Leben teurer oder leichter machen, und ihr entscheidet, wie die Politik reagiert. Jede Entscheidung landet direkt im Geldbeutel eurer Figur – und im Sechseck.',
  figurenTitel:'Die acht Figuren',
  figurInfo:f=>`<div class="sm">${esc(f.vibe)}</div><div class="small">Netto: <b>${eur(f.netto)}</b> · Erspartes: <b>${eur(f.spar)}</b>${f.kredit?` · Kredit: <b>${eur(f.kredit)}</b>`:''}</div><div class="sm">Ziel bis 2029: ${esc(f.goal.t)} (${eur(f.goal.amt)} auf dem Konto)</div>`,
  hudWerte(f,g){
    const tr=figTrack(f,g.decs||[],g.ch,g.chx);const [ml,mc]=moodLabel(tr.mood);
    return `<div><div class="k">Kontostand</div><div class="v">${eur(tr.konto)}</div></div>
        <div><div class="k">Stimmung</div><div class="v"><span class="pill ${mc}">${ml}</span></div></div>
        <div class="goal"><div class="k">Ziel: ${esc(f.goal.t)}</div><div class="bar"><i style="width:${clamp(tr.konto/f.goal.amt*100,0,100)}%;background:${tr.prog>=f.goal.amt?'var(--ok)':'var(--amb)'}"></i></div><div class="small muted">Prognose 2029: <b class="${tr.prog>=f.goal.amt?'pos':'neg'}">${eur(tr.prog)}</b> von ${eur(f.goal.amt)}</div></div>`;
  },
  ereignis(f,g){
    const R=ROUNDS[g.r],rdE=simulate(g.decs.slice(0,g.r).concat(['A']))[g.r],ev=rdE.ev;const m=monthly(f,ev);
    return `${crisisHTML(rdE)}
        <div class="grid2"><div class="stack">${photo(g.r)}${postHTML(R)}<p>${esc(R.txt)}</p></div>
        <div class="panel"><h3>Was heißt das für ${esc(f.n)}?</h3><p>${esc(R.fig[f.id])}</p><p class="small muted" style="margin-top:6px">Monatsbilanz im Vergleich zum Start:</p>${partsHTML(m)}</div></div>`;
  },
  optionWirkung(f,g,o){
    const base=monthly(f,simulate(g.decs.slice(0,g.r).concat(['A']))[g.r].ev).sum;
    const v=monthly(f,simulate(g.decs.slice(0,g.r).concat([o.k]))[g.r].after).sum-base;
    return `<span class="small">Für ${esc(f.n)}: <span class="me ${v>0.5?'pos':v<-0.5?'neg':''}">${sgnE(v)} im Monat</span></span><span>${hexPillsHTML(o.ops.hex)}</span>`;
  },
  ergebnis(f,g){
    const rd=simulate(g.decs)[g.r];const o=ROUNDS[g.r].opts.find(x=>x.k===rd.d);const m=monthly(f,rd.after);const tr=figTrack(f,g.decs,g.ch,g.chx);const row=tr.rows[g.r];
    return `<div class="grid2"><div class="panel"><h3>${esc(/[sxzß]$/.test(f.n)?f.n+'’':f.n+'s')} Monatsbilanz</h3>${partsHTML(m)}
          <p style="margin-top:8px">Über das Jahr: <b class="${row.yr>=0?'pos':'neg'}">${sgnE(row.yr)}</b> auf dem Konto (inklusive normalem Überschuss von ${eur(f.base)} im Monat).</p></div>
          <div class="panel chart"><h3>Klassen-Sechseck</h3>${radar([{v:rd.hex0,stroke:'var(--muted)',dash:'6 5',fo:0},{v:rd.after.hex,stroke:'var(--accent)',fill:'var(--accent)',fo:.2}],{label:'Sechseck vor und nach dieser Runde'})}<p class="small muted">Gestrichelt: vor der Runde.</p></div></div>
        ${realHTML(o)}
        <details class="panel"><summary><b>Und wie geht es den anderen?</b></summary>${figsTableHTML(g.decs,g.r,true)}</details>`;
  },
  check:(r,o)=>({frage:`Welche Zielbeziehung zeigt der Beschluss „${o.t}“ am deutlichsten?`,optionen:chkOptions(o,r),warum:o.chk.why}),
  privat:{
    wurf:o=>o.risk?(Math.random()<0.2?2000:50):0,
    rueckmeldung:(o,x)=>o.risk?{cls:x>0?'ok':'bad',html:x>0?'Glück gehabt: Der Coin ist explodiert, aus 500 € wurden 2.000 €. Das war reines Glück – die meisten verlieren.':'Der Coin ist um 90 % abgestürzt, von 500 € sind 50 € übrig. Die Gründer hatten früh verkauft.'}:{cls:'neu',html:esc(o.l)}
  },
  bilanz(f,g){
    const tr=figTrack(f,g.decs,g.ch,g.chx);const [ml,mc]=moodLabel(tr.mood);const fin=simulate(g.decs)[3];
    const all=FIG.map(x=>({f:x,t:figTrack(x,g.decs,[],[])})).sort((a,b)=>b.t.policy-a.t.policy);
    return `<div class="panel stack"><h3>Abschlussbilanz 2029</h3>
        <div class="fb ${tr.goalOk?'ok':'bad'}"><b>${tr.goalOk?'Ziel erreicht!':'Ziel verfehlt.'}</b> ${esc(f.goal.t)}: ${eur(tr.konto)} von ${eur(f.goal.amt)}.</div>
        <p>${esc(f.n)} startete mit ${eur(f.spar)} und hat jetzt <b>${eur(tr.konto)}</b>. Die Politik der vier Jahre hat ${esc(f.n)} insgesamt <b class="${tr.policy>=0?'pos':'neg'}">${sgnE(tr.policy)}</b> gebracht. Stimmung: <span class="pill ${mc}">${ml}</span></p>
        <p class="small muted">Eure Beschlüsse: ${g.decs.map((d,i)=>`${ROUNDS[i].y}: ${d} – ${esc(ROUNDS[i].opts.find(o=>o.k===d).t)}`).join(' · ')}</p></div>
        <div class="grid2"><div class="panel chart"><h3>Sechseck 2026 → 2029</h3>${radar([{v:START.de.v,stroke:'var(--muted)',dash:'6 5',fo:0},{v:fin.after.hex,stroke:'var(--accent)',fill:'var(--accent)',fo:.2}],{label:'Sechseck am Anfang und am Ende'})}
          ${debtHTML(fin.after.debt)}</div>
        <div class="panel"><h3>Gewinner und Verlierer eurer Politik</h3><div class="tbl-wrap"><table><thead><tr><th>Figur</th><th class="r">Politik-Effekt in 4 Jahren</th><th>Ziel</th></tr></thead><tbody>${all.map(a=>`<tr${a.f.id===f.id?' style="background:var(--accent-soft)"':''}><td>${esc(a.f.n)} <span class="small muted">${esc(a.f.job.split(',')[0])}</span></td><td class="r num ${a.t.policy>=0?'pos':'neg'}"><b>${sgnE(a.t.policy)}</b></td><td>${a.t.goalOk?'<span class="pill ok">erreicht</span>':'<span class="pill bad">verfehlt</span>'}</td></tr>`).join('')}</tbody></table></div><p class="small muted">Politik-Effekt und Ziele ohne private Entscheidungen. Dein eigenes Ergebnis oben enthält sie.</p></div></div>
        <div class="panel"><h3>Nachdenken</h3><ul><li>War eure Politik gerecht – und für wen?</li><li>Wer hat von den Beschlüssen profitiert, die dem Sechseck insgesamt geholfen haben?</li><li>Was bedeutet der Schuldenstand für eure Generation?</li><li>Welche Beschlüsse würdet ihr mit dem Wissen von heute anders treffen?</li></ul></div>`;
  },
  werte(f,g){
    const tr=figTrack(f,g.decs||[],g.ch,g.chx);
    let hs=0;for(let i=0;i<4;i++)hs+=(store('ms6-hs-'+i)||[]).length;
    return {konto:tr.konto,goalOk:g.ph==='end'?tr.goalOk:tr.prog>=f.goal.amt,mood:tr.mood,hs};
  },
  lehrkraft:{
    ereignis(t){
      const R=ROUNDS[t.r];
      return `${crisisHTML(simulate(t.decs.concat(['A']))[t.r])}
        <div class="grid2"><div class="stack">${photo(t.r)}${postHTML(R)}<p style="font-size:1.1rem">${esc(R.txt)}</p><p class="small">Auswirkung aufs Sechseck: ${hexPillsHTML(R.ops.hex)}</p></div>
        <div class="panel"><h3>So trifft es die Figuren</h3>${figsTableHTML(t.decs.concat(['A']),t.r,false)}</div></div>`;
    },
    optionInfo:o=>`${hexPillsHTML(o.ops.hex)}${o.ops.debt>0?' <span class="pill amb"><span class="ms">trending_up</span>Schulden</span>':''}`,
    abstimmungDetails:t=>optMatrixHTML(t.decs,t.r),
    ergebnis(t,hinweis){
      const R=ROUNDS[t.r],rd=simulate(t.decs)[t.r],o=R.opts.find(x=>x.k===rd.d);
      return `<div class="grid2"><div class="panel chart"><h3>Klassen-Sechseck</h3>${radar([{v:rd.hex0,stroke:'var(--muted)',dash:'6 5',fo:0},{v:rd.after.hex,stroke:'var(--accent)',fill:'var(--accent)',fo:.2}],{label:'Sechseck vor und nach dem Beschluss'})}
          ${debtHTML(rd.after.debt)}</div>
        <div class="panel"><h3>Die Figuren nach dem Beschluss</h3>${figsTableHTML(t.decs,t.r,true)}
          ${realHTML(o)}
          <details class="panel" style="margin-top:8px"><summary><b>Diskussionsfrage:</b> Welche Zielbeziehung zeigt dieser Beschluss? <span class="small muted">(Lösung)</span></summary><p style="margin-top:6px"><b>${esc(o.chk.a)}.</b> ${esc(o.chk.why)}</p></details>
          ${hinweis}</div></div>`;
    },
    bilanz(t){
      const fin=simulate(t.decs)[3];const all=FIG.map(f=>({f,t:figTrack(f,t.decs,[],[])})).sort((a,b)=>b.t.policy-a.t.policy);
      return `<div class="panel"><h3>Abschlussbilanz der Klasse</h3><p class="small muted">Beschlüsse: ${t.decs.map((d,i)=>`${ROUNDS[i].y}: ${d} – ${esc(ROUNDS[i].opts.find(o=>o.k===d).t)}`).join(' · ')}</p></div>
        <div class="grid2"><div class="panel chart"><h3>Sechseck 2026 → 2029</h3>${radar([{v:START.de.v,stroke:'var(--muted)',dash:'6 5',fo:0},{v:fin.after.hex,stroke:'var(--accent)',fill:'var(--accent)',fo:.2}],{label:'Sechseck am Anfang und am Ende'})}
          ${debtHTML(fin.after.debt)}</div>
        <div class="panel"><h3>Gewinner und Verlierer (Figuren)</h3><div class="tbl-wrap"><table><thead><tr><th>Figur</th><th class="r">Politik-Effekt in 4 Jahren</th><th>Stimmung</th><th>Ziel</th></tr></thead><tbody>${all.map(a=>{const [ml,mc]=moodLabel(a.t.mood);return `<tr><td>${esc(a.f.n)} <span class="small muted">${esc(a.f.job.split(',')[0])}</span></td><td class="r num ${a.t.policy>=0?'pos':'neg'}"><b>${sgnE(a.t.policy)}</b></td><td><span class="pill ${mc}">${ml}</span></td><td>${a.t.goalOk?'<span class="pill ok">erreicht</span>':'<span class="pill bad">verfehlt</span>'}</td></tr>`}).join('')}</tbody></table></div></div></div>`;
    },
    auswertung:`<div class="panel"><h3>Auswertungsfragen</h3><ul><li>War unsere Politik gerecht – und für wen?</li><li>Welche Figur hat am meisten verloren, obwohl das Sechseck insgesamt besser wurde (oder umgekehrt)?</li><li>Wo wurden Zielkonflikte zu Interessenkonflikten zwischen euch?</li><li>Wer bezahlt den gestiegenen Schuldenstand?</li></ul></div>`,
    dashKopf:'<th class="r">Kontostand</th><th>Stimmung</th><th>Ziel</th>',
    dashZeile(p){const s=p.stats||{};const [ml,mc]=moodLabel(s.mood||60);return `<td class="r num">${eur(s.konto||0)}</td><td><span class="pill ${mc}">${ml}</span></td><td>${s.goalOk?'<span class="pill ok">erreicht</span>':'<span class="pill bad">verfehlt</span>'}</td>`},
    dashHinweis:'<p class="small muted">Kontostände enthalten die privaten Entscheidungen der Schüler – deshalb unterscheiden sie sich auch innerhalb einer Figur.</p>'
  }
};
