// Lernwerkstatt Haushaltsplan und Schulden (Klasse 9): Schätzduell, Woher kommt das Geld?, Wohin fließt das Geld?,
// das Haushaltsspiel „Benjamins Monat“ (allein oder live mit der Klasse), Schuldenfalle und Wege aus den Schulden.
// Gerüst, Navigation und Aufgaben-Bausteine kommen aus /shared/, hier stehen nur die Inhalte.
import { $, $$, esc, fmt, store } from '../shared/js/ui.js';
import { createWerkstatt } from '../shared/js/werkstatt.js';
import { schreibfeld, zuordnen, lueckentext, wissenscheck, impuls, blitz, blitzAufloesung, abstimmung } from '../shared/js/aufgaben.js';
import { haushaltsspiel, bindHaushaltsspiel, geld } from './monat.js';
import { STAND, ZAHLEN, LOHN, AUSGABEN, GLAEUBIGER, FOTO, BENJAMIN } from './daten.js';
import { HINWEISE, WAND, IMPULS } from './wand.js';
import { WISSENSCHECK } from './wissenscheck.js';

const P='hh';
const pz=n=>`${fmt(n,0)} %`;

/* ---------- Merksätze ---------- */
const MS={
  schaetzduell:['Ein Haushalt muss mit seinen Einnahmen auskommen. Wer seine Zahlen kennt (Netto, Miete, Fixkosten), plant besser als mit dem Bauchgefühl.'],
  geldquellen:['Einkommen gibt es aus drei Quellen: aus Arbeit (Erwerbseinkommen: Lohn, Gehalt, Gewinn), vom Staat oder der Sozialversicherung (Transfereinkommen: Kindergeld, Rente, Arbeitslosengeld, Bürgergeld) und aus Vermögen (Vermögenseinkommen: Zinsen, Dividenden, Mieten).',
    'Brutto ist der vereinbarte Lohn. Davon gehen Sozialversicherungsbeiträge (Rente, Kranken, Pflege, Arbeitslosen) und die Lohnsteuer ab. Was auf dem Konto ankommt, ist das Netto. Geplant wird immer mit dem Netto.'],
  geldfluss:['Fixe Ausgaben kommen regelmäßig in gleicher Höhe und sind kurzfristig kaum zu ändern (Miete, Verträge, Versicherungen). Variable Ausgaben sind nötig, schwanken aber (Lebensmittel, Drogerie). Optionale Ausgaben sind Wünsche, auf die man verzichten kann (Kino, Restaurant, Urlaub).',
    'Den größten Teil ihres Geldes geben Haushalte in Deutschland fürs Wohnen aus: rund 36 %. Je kleiner das Einkommen, desto größer der Anteil für Wohnen und Essen.'],
  benjamin:['Ein Haushaltsplan stellt die Einnahmen den fixen und variablen Ausgaben gegenüber. Bleibt etwas übrig, ist das der Überschuss, den man sparen kann. Die Sparquote ist der Anteil des Einkommens, der gespart wird.',
    'Verträge mit langer Laufzeit binden dich: Was heute bequem ist, kann in drei Monaten das Konto ins Minus ziehen. Ein Notgroschen fängt unerwartete Ausgaben ab.'],
  schuldenfalle:['Schulden zu haben ist normal (Verschuldung). Gefährlich wird es, wenn die Einnahmen auf Dauer nicht reichen, um die Schulden zu bezahlen (Überschuldung). Der Dispo ist ein teurer Kredit, im Schnitt rund 11 % Zinsen im Jahr.'],
  auswege:['Häufige Auslöser von Überschuldung sind Krankheit, Unfall, Jobverlust oder Trennung, bei jungen Leuten oft Handyverträge, Konsum auf Raten und der Dispo. Wege heraus: Überblick verschaffen, Haushaltsplan, mit Gläubigern reden, kostenlose Schuldnerberatung, als letzter Weg die Privatinsolvenz.'],
  sichern:['Mit dem eigenen Geld kommt aus, wer mit dem Netto plant, die Fixkosten im Griff hat, auf Laufzeiten achtet, per Dauerauftrag einen Notgroschen spart und den Dispo nicht als Einkommen betrachtet.']
};

/* ---------- Glossar ---------- */
const GLOSS=[
  ['Bruttoeinkommen','Der vereinbarte Lohn oder das vereinbarte Gehalt, bevor Steuern und Sozialabgaben abgezogen werden.'],
  ['Dauerauftrag','Du beauftragst deine Bank, regelmäßig denselben Betrag zu überweisen, zum Beispiel an dein Sparkonto.'],
  ['Dispokredit','Erlaubnis der Bank, das Girokonto bis zu einer Grenze zu überziehen. Sehr teuer, im Schnitt rund 11 % Zinsen im Jahr.'],
  ['Effektiver Jahreszins','Was ein Kredit im Jahr wirklich kostet, mit allen Gebühren. Damit kann man Kredite vergleichen.'],
  ['Erwerbseinkommen','Einkommen aus Arbeit: Lohn, Gehalt, Ausbildungsvergütung oder der Gewinn von Selbstständigen.'],
  ['Fixe Ausgaben','Ausgaben, die regelmäßig in gleicher Höhe anfallen und kurzfristig kaum zu ändern sind, zum Beispiel Miete, Handyvertrag, Versicherungen.'],
  ['Geduldete Überziehung','Wer über den Dispo hinaus ins Minus geht, zahlt noch höhere Zinsen. Die Bank kann dann Zahlungen ablehnen.'],
  ['Grundfreibetrag','Bis zu diesem Jahreseinkommen zahlt man keine Einkommensteuer: 12.348 € (2026).'],
  ['Haftpflichtversicherung','Zahlt, wenn du anderen aus Versehen einen Schaden zufügst. Eine der wichtigsten Versicherungen, kostet oft nur wenige Euro im Monat.'],
  ['Haushaltsplan','Übersicht über alle Einnahmen und Ausgaben eines Haushalts in einem Monat. Zeigt, ob am Ende etwas übrig bleibt.'],
  ['Inkasso','Firma, die offene Rechnungen für andere eintreibt. Dabei kommen weitere Kosten dazu.'],
  ['Kaution','Sicherheit für den Vermieter, höchstens drei Kaltmieten. Darf in drei Monatsraten gezahlt werden und kommt beim Auszug zurück.'],
  ['Kindergeld','Geld vom Staat für Eltern, 259 € pro Kind und Monat (2026). Während einer Ausbildung gibt es es bis höchstens 25.'],
  ['Konsumquote','Anteil des verfügbaren Einkommens, der für Konsum ausgegeben wird. Konsumquote und Sparquote ergeben zusammen 100 %.'],
  ['Kündigungsfrist','Zeit zwischen Kündigung und Ende eines Vertrags, bei einer Mietwohnung drei Monate.'],
  ['Laufzeit','Zeit, für die ein Vertrag fest abgeschlossen ist, zum Beispiel 24 Monate beim Handyvertrag. Vorher kommt man nicht heraus.'],
  ['Nettoeinkommen','Was nach Abzug von Steuern und Sozialabgaben auf dem Konto ankommt. Damit plant man.'],
  ['Notgroschen','Erspartes für unerwartete Ausgaben, zum Beispiel eine Reparatur. Faustregel: zwei bis drei Monatsausgaben.'],
  ['Optionale Ausgaben','Ausgaben für Wünsche, auf die man verzichten kann, zum Beispiel Kino, Restaurant, Urlaub. Auch diskretionäre Ausgaben genannt.'],
  ['Privatinsolvenz','Gerichtliches Verfahren für überschuldete Menschen. Nach in der Regel drei Jahren sind die restlichen Schulden erlassen (Restschuldbefreiung).'],
  ['Ratenkredit','Kredit, der in festen Monatsraten über eine feste Laufzeit zurückgezahlt wird. Günstiger als der Dispo, bindet aber lange.'],
  ['Saldo','Unterschied zwischen Einnahmen und Ausgaben. Positiv: Überschuss. Negativ: Fehlbetrag.'],
  ['SCHUFA','Auskunftei, die speichert, ob jemand seine Rechnungen und Kredite bezahlt. Ein negativer Eintrag erschwert Handyverträge, Kredite und die Wohnungssuche.'],
  ['Schuldnerberatung','Kostenlose Beratung für Menschen mit Schulden, zum Beispiel bei Caritas, Diakonie, AWO, Verbraucherzentrale oder der Stadt.'],
  ['Sozialversicherung','Renten-, Kranken-, Pflege- und Arbeitslosenversicherung. Arbeitnehmer und Arbeitgeber zahlen je etwa die Hälfte der Beiträge.'],
  ['Sparquote','Anteil des verfügbaren Einkommens, der gespart wird.'],
  ['Transfereinkommen','Geld vom Staat oder der Sozialversicherung, zum Beispiel Kindergeld, Rente, Arbeitslosengeld, Bürgergeld oder BAföG.'],
  ['Überschuldung','Die Einnahmen reichen auf Dauer nicht, um Lebensunterhalt und Schulden zu bezahlen.'],
  ['Variable Ausgaben','Notwendige Ausgaben, deren Höhe schwankt und die man beeinflussen kann, zum Beispiel Lebensmittel und Drogerieartikel.'],
  ['Verschuldung','Man hat sich Geld geliehen und zahlt es planmäßig zurück, zum Beispiel einen Kredit. Das ist normal, solange man die Raten zahlen kann.'],
  ['Vermögenseinkommen','Einkommen aus Besitz: Zinsen auf Erspartes, Dividenden aus Aktien, Mieten aus einer vermieteten Wohnung.']
];

/* ---------- Kapitel und Bereiche ---------- */
const CH={1:['Kapitel 1 – Einstieg','Das Schätzduell'],2:['Kapitel 2 – Einnahmen und Ausgaben','Woher das Geld kommt und wohin es fließt'],3:['Kapitel 3 – Benjamins Monat','Allein oder mit der Klasse'],
  4:['Kapitel 4 – Schulden','Dispo, Kredite und Wege heraus'],5:['Kapitel 5 – Sichern','Hefteintrag und Wissenscheck']};
const DEST=[
  {id:'start',icon:'home',label:'Start',title:'Lernwerkstatt Haushaltsplan und Schulden',kurz:'Haushalt',render:startHTML},
  {id:'geld',icon:'payments',label:'Geld',title:'Einnahmen und Ausgaben',kurz:'Geld',ch:[1,2],desc:'Schätzduell, woher das Geld kommt und wohin es fließt'},
  {id:'monat',icon:'calendar_month',label:'Benjamin',title:'Benjamins Monat',kurz:'Benjamin',ch:[3],desc:'Vier Monate erste eigene Wohnung: Kommst du mit dem Geld aus?'},
  {id:'schulden',icon:'credit_card',label:'Schulden',title:'Schulden',kurz:'Schulden',ch:[4],desc:'Was der Dispo kostet, wer Geld will und wie man aus den Schulden herauskommt'},
  {id:'wissen',icon:'school',label:'Wissen',title:'Sichern und wiederholen',ch:[5],render:wissenHTML,desc:'Hefteintrag, Schätz-Check, Wissenscheck mit Klassen-Quiz, Fachbegriffe und deine Merksätze'}
];
const dot=k=>`<span class="hh-dot ${k}" aria-hidden="true"></span>`;

const W=createWerkstatt({
  thema:'haushalt',
  speicher:P,
  logo:'<svg aria-hidden="true" width="40" height="40" viewBox="0 0 42 42"><path d="M6 20 21 8l15 12v15H6z" fill="none" stroke="var(--md-primary)" stroke-width="3" stroke-linejoin="round"/><rect x="12" y="24" width="5" height="8" rx="1" fill="var(--hh-e)"/><rect x="19" y="20" width="5" height="12" rx="1" fill="var(--hh-a)"/><rect x="26" y="27" width="5" height="5" rx="1" fill="var(--hh-s)"/></svg>',
  bereiche:DEST,
  kapitel:CH,
  merksaetze:MS,
  wissenTitel:'Mein Haushalts-Wissen',
  glossar:GLOSS,
  punkte:x=>x.farben.map(dot).join(''),
  beimZeigen(id,v){
    $$('[data-hh-tool]',v).forEach(b=>b.addEventListener('click',()=>openTool(b.dataset.hhTool)));
    if($('#reset',v)){
      $('#reset',v).addEventListener('click',()=>{$('#reset-confirm',v).hidden=false});
      $('#reset-no',v).addEventListener('click',()=>{$('#reset-confirm',v).hidden=true});
      $('#reset-yes',v).addEventListener('click',()=>W.resetWissen());
    }
  }
});
const {tool,erkHTML,bindErk,openTool,chapterHTML}=W;

/* ---------- Fotos mit Bildnachweis ---------- */
function nachweis(k){const f=FOTO[k];const [wer,lizenz]=f.credit.split(', ');
  return `Foto: <a href="${f.link}" rel="noopener" target="_blank">${esc(wer)}</a>, <a href="${f.lizenz}" rel="noopener" target="_blank">${esc(lizenz)}</a>`}
const foto=(k,kl='')=>`<figure class="hh-fig ${kl}"><img src="${FOTO[k].src}" alt="${esc(FOTO[k].alt)}" loading="lazy"><figcaption>${nachweis(k)}</figcaption></figure>`;
const regler=(id,label,min,max,step,wert)=>`<div class="ctrl"><label for="${id}">${label} <output id="${id}-o"></output></label><input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${wert}"></div>`;

/* 1 Schätzduell: Mehr oder weniger? Aufgelöst erst im Schätz-Check */
const SCHAETZ={id:'hh-schaetz',werkstatt:'schaetzduell',verdeckt:true,
  titel:'Mehr oder weniger? Tipp so schnell du kannst.',
  optionen:[{id:'weniger',t:'Weniger',icon:'arrow_downward'},{id:'mehr',t:'Mehr',icon:'arrow_upward'}],
  karten:[
    {t:'Ein Azubi in Deutschland bekommt im Schnitt mehr oder weniger als 1.000 € brutto im Monat?',r:'mehr',e:`${fmt(ZAHLEN.azubiBrutto,0)} € im Schnitt über alle Lehrjahre (BIBB, Oktober 2025).`},
    {t:'Von 1.050 € brutto Ausbildungsvergütung bleiben auf dem Konto mehr oder weniger als 900 €?',r:'weniger',e:`Es sind ${geld(LOHN.netto)}. Rund 21 % gehen an die Sozialversicherung.`},
    {t:'Kindergeld pro Kind und Monat: mehr oder weniger als 250 €?',r:'mehr',e:`${ZAHLEN.kindergeld} € seit Januar 2026.`},
    {t:'Fürs Wohnen geben Haushalte in Deutschland mehr oder weniger als ein Viertel ihres Geldes aus?',r:'mehr',e:'Rund 36 %, also mehr als ein Drittel (Destatis, 2022).'},
    {t:'Das Deutschlandticket kostet mehr oder weniger als 60 € im Monat?',r:'mehr',e:`${ZAHLEN.dticket} € seit Januar 2026.`},
    {t:'Zinsen für den Dispo: im Schnitt mehr oder weniger als 5 % im Jahr?',r:'mehr',e:`Rund ${ZAHLEN.dispoSchnitt} % (Stiftung Warentest, Mai 2026). Fürs Tagesgeld bekommt man nicht einmal ein Viertel davon.`},
    {t:'Überschuldete Erwachsene in Deutschland: mehr oder weniger als 5 Millionen?',r:'mehr',e:`${fmt(ZAHLEN.ueberschuldet,2)} Millionen, also etwa jeder zwölfte Erwachsene (SchuldnerAtlas 2025).`},
    {t:'Menschen in der Schuldnerberatung haben im Schnitt mehr oder weniger als 10.000 € Schulden?',r:'mehr',e:`${fmt(ZAHLEN.schuldenBeratung,0)} € im Schnitt (Destatis, 2025).`}]};
tool({id:'schaetzduell',ch:1,farben:['e','a','s'],hinweise:HINWEISE.schaetzduell,title:'Das Schätzduell',sub:'Acht Zahlen rund ums Geld: mehr oder weniger? Die Auflösung kommt am Ende',
html(){return `<p class="task"><b>Auftrag:</b> Mehr oder weniger? Tipp blitzschnell. Ob du richtig lagst, erfährst du am Ende der Stunde.</p>
${blitz(SCHAETZ)}
${schreibfeld(WAND.schaetzduell)}
${impuls(IMPULS.schaetzduell)}
${erkHTML('schaetzduell')}`},
init(root){bindErk(root)}});

/* 2 Woher kommt das Geld? Einkommensarten und Benjamins Lohnzettel */
tool({id:'geldquellen',ch:2,farben:['e'],hinweise:HINWEISE.geldquellen,title:'Woher kommt das Geld?',sub:'Neun Menschen aus Thüringen, drei Arten von Einkommen und Benjamins erster Lohnzettel',
html(){return `<p class="task"><b>Auftrag:</b> Ordne zu, woher das Geld kommt. Schätz dann, was von Benjamins Ausbildungsvergütung auf dem Konto ankommt.</p>
${zuordnen({id:'hh-quellen',frage:'Woher kommt das Geld? Ordne jede Person einer Einkommensart zu.',
  faecher:[{id:'erwerb',t:'Erwerbseinkommen',info:'Geld aus Arbeit: Lohn, Gehalt, Ausbildungsvergütung, Gewinn einer eigenen Firma.'},
    {id:'transfer',t:'Transfereinkommen',info:'Geld vom Staat oder der Sozialversicherung, ohne dass man gerade dafür arbeitet: Kindergeld, Rente, Arbeitslosengeld, Bürgergeld, BAföG.'},
    {id:'vermoegen',t:'Vermögenseinkommen',info:'Geld aus Besitz: Zinsen auf Erspartes, Dividenden aus Aktien, Miete aus einer vermieteten Wohnung.'}],
  karten:[{t:'Benjamin (18) bekommt jeden Monat seine Ausbildungsvergütung vom Autohaus in Jena.',f:'erwerb',e:'Lohn für Arbeit: Erwerbseinkommen.'},
    {t:'Lena (19) jobbt samstags in einem Café in Weimar für 13,90 € pro Stunde.',f:'erwerb',e:'Ein Minijob ist Arbeit, also Erwerbseinkommen. 13,90 € ist der Mindestlohn 2026.'},
    {t:'Herr Kaya (45) führt eine Tischlerei in Apolda und lebt vom Gewinn.',f:'erwerb',e:'Auch der Gewinn von Selbstständigen ist Erwerbseinkommen. Er schwankt aber, und Herr Kaya muss sich selbst um Versicherungen kümmern.'},
    {t:'Familie Schulz aus Erfurt bekommt für ihre zwei Kinder Kindergeld.',f:'transfer',e:'Eine Leistung des Staates: Transfereinkommen.'},
    {t:'Oma Renate (71) aus Gera bekommt jeden Monat ihre Rente.',f:'transfer',e:'Die Rente zahlt die Rentenversicherung, für die sie früher Beiträge gezahlt hat: Transfereinkommen.'},
    {t:'Paul (24) aus Suhl hat seinen Job verloren und bekommt Arbeitslosengeld.',f:'transfer',e:'Arbeitslosengeld I zahlt die Arbeitslosenversicherung, zeitlich begrenzt: Transfereinkommen.'},
    {t:'Frau Berger (52) vermietet eine Wohnung in Jena und bekommt jeden Monat Miete.',f:'vermoegen',e:'Einkommen aus Besitz einer Wohnung: Vermögenseinkommen.'},
    {t:'Mia (16) bekommt Zinsen für ihr Jugendweihe-Geld auf dem Tagesgeldkonto.',f:'vermoegen',e:'Zinsen auf Erspartes: Vermögenseinkommen.'},
    {t:'Herr Wolf (60) bekommt eine Dividende für seine Aktien.',f:'vermoegen',e:'Gewinnanteil aus Aktien: Vermögenseinkommen.'}]})}
<section class="aufgabe stack" id="lz"><p class="aufgabe-kopf"><span class="ms sm" aria-hidden="true">receipt_long</span>Benjamins Lohnzettel</p>
  <p class="aufgabe-frage">Benjamin ist im 2. Lehrjahr und bekommt <b class="num">${geld(LOHN.brutto,0)}</b> brutto. Was kommt auf seinem Konto an?</p>
  ${regler('lz-t','Dein Tipp: netto',600,1050,10,950)}
  <div class="row"><button class="btn primary" type="button" id="lz-auf"><span class="ms" aria-hidden="true">visibility</span>Lohnzettel aufdecken</button></div>
  <div id="lz-erg" class="stack"></div></section>
${schreibfeld(WAND.geldquellen)}
${impuls(IMPULS.geldquellen)}
${erkHTML('geldquellen')}`},
init(root){
  const r=$('#lz-t',root),erg=$('#lz-erg',root);let st=store(P+'-lohn')||{};
  const zeige=()=>{$('#lz-t-o',root).textContent=geld(+r.value,0)};
  function aufdecken(fokus){
    const tipp=+st.tipp,d=Math.round(tipp-LOHN.netto),ab=LOHN.brutto-LOHN.netto;
    r.value=tipp;r.disabled=true;$('#lz-auf',root).hidden=true;zeige();
    erg.innerHTML=`<div class="tbl-wrap"><table class="hh-lohn"><caption class="sr-only">Lohnzettel</caption><tbody>
      <tr><td><b>Bruttolohn</b></td><td class="num"><b>${geld(LOHN.brutto)}</b></td></tr>
      ${LOHN.abzuege.map(a=>`<tr><td><span class="ms sm" aria-hidden="true">${a.icon}</span> ${a.t} <span class="small muted">${a.satz?fmt(a.satz,a.satz%1?2:1).replace(/,?0+$/,'')+' %':''}${a.info?esc(a.info):''}</span></td><td class="num">−${geld(a.betrag)}</td></tr>`).join('')}</tbody>
      <tfoot><tr><td><b>Netto auf dem Konto</b></td><td class="num"><b>${geld(LOHN.netto)}</b></td></tr></tfoot></table></div>
      <div class="hh-lohnbalken" aria-hidden="true"><span class="netto" style="width:${LOHN.netto/LOHN.brutto*100}%">Netto</span><span class="ab" style="width:${ab/LOHN.brutto*100}%">Abzüge</span></div>
      <div class="fb ${Math.abs(d)<=30?'ok':'amb'}" tabindex="-1"><b>${Math.abs(d)<=30?'Sehr gut geschätzt!':d>0?`Du lagst ${geld(d,0)} zu hoch.`:`Du lagst ${geld(-d,0)} zu niedrig.`}</b> Von ${geld(LOHN.brutto,0)} bleiben ${geld(LOHN.netto)}: Rund ${pz(ab/LOHN.brutto*100)} gehen an die Sozialversicherung. Lohnsteuer zahlt Benjamin noch nicht, er verdient im Jahr weniger als den Grundfreibetrag von 12.348 €. Der Arbeitgeber zahlt übrigens noch einmal ungefähr so viel in die Sozialversicherung.</div>
      <div class="row"><button class="btn small" type="button" id="lz-neu"><span class="ms" aria-hidden="true">restart_alt</span>Noch einmal schätzen</button></div>`;
    $('#lz-neu',erg).addEventListener('click',()=>{st={};store(P+'-lohn',st);r.disabled=false;$('#lz-auf',root).hidden=false;erg.innerHTML='';r.focus()});
    if(fokus)$('.fb',erg).focus();
  }
  r.addEventListener('input',zeige);
  $('#lz-auf',root).addEventListener('click',()=>{st={tipp:+r.value};store(P+'-lohn',st);aufdecken(true)});
  zeige();if(st.tipp)aufdecken(false);
  bindErk(root);
}});

/* 3 Wohin fließt das Geld? Schätzen und sortieren */
tool({id:'geldfluss',ch:2,farben:['a'],hinweise:HINWEISE.geldfluss,title:'Wohin fließt das Geld?',sub:'Schätz die Ausgaben deutscher Haushalte und sortiere fixe, variable und optionale Ausgaben',
html(){return `<p class="task"><b>Auftrag:</b> Schätz mit den Reglern, wie viel Prozent ihres Geldes Haushalte in Deutschland für jeden Bereich ausgeben. Sortiere danach Benjamins Ausgaben.</p>
<div class="hh-fluss-grid">${foto('supermarkt','hh-fig-klein')}
<section class="aufgabe stack" id="gf"><p class="aufgabe-kopf"><span class="ms sm" aria-hidden="true">donut_large</span>Wohin fließt das Geld?</p>
  <p class="aufgabe-frage">Von 100 € für den Konsum gehen wie viele Euro in …</p>
  <div class="stack" id="gf-regler">${AUSGABEN.map(a=>`<div class="hh-schaetz" data-gf="${a.id}">${regler('gf-'+a.id,`<span><span class="ms sm" aria-hidden="true">${a.icon}</span> ${a.t}</span>`,0,60,1,15)}<div class="hh-vergleich" hidden></div></div>`).join('')}</div>
  <div class="row"><button class="btn primary" type="button" id="gf-auf"><span class="ms" aria-hidden="true">visibility</span>Aufdecken</button></div>
  <div id="gf-fb" class="stack"></div></section></div>
${zuordnen({id:'hh-ausgabenarten',frage:'Fix, variabel oder optional? Sortiere Benjamins Ausgaben.',
  faecher:[{id:'fix',t:'Fixe Ausgaben',info:'Regelmäßig, meist gleich hoch, kurzfristig kaum zu ändern (Verträge).'},
    {id:'var',t:'Variable Ausgaben',info:'Regelmäßig nötig, aber die Höhe schwankt und lässt sich beeinflussen.'},
    {id:'opt',t:'Optionale Ausgaben',info:'Wünsche, nicht lebensnotwendig, oft unregelmäßig. Hier kann man am leichtesten sparen. Fachbegriff: diskretionäre Ausgaben.'}],
  karten:[{t:'Benjamin (18) zahlt jeden Monat 490 € Miete für seine Wohnung in Winzerla.',f:'fix',e:'Miete: jeden Monat gleich, Kündigungsfrist drei Monate.'},
    {t:'Benjamin zahlt 63 € im Monat für sein Deutschlandticket.',f:'fix',e:'Ein Abo mit festem Betrag. Monatlich kündbar, aber jeden Monat gleich.'},
    {t:'Benjamin zahlt 18,36 € Rundfunkbeitrag für seine Wohnung.',f:'fix',e:'Pflicht für jede Wohnung, jeden Monat gleich.'},
    {t:'Benjamin zahlt 25 € für seinen Handyvertrag mit 24 Monaten Laufzeit.',f:'fix',e:'Vertrag mit fester Laufzeit: eine typische Fixausgabe.'},
    {t:'Benjamin kauft jede Woche Lebensmittel im Supermarkt ein.',f:'var',e:'Nötig, aber er entscheidet, wie viel er ausgibt.'},
    {t:'Benjamin kauft Duschgel, Zahnpasta und Waschmittel.',f:'var',e:'Drogerieartikel braucht man, die Menge schwankt.'},
    {t:'Benjamin geht alle paar Wochen zum Friseur.',f:'var',e:'Regelmäßig nötig, aber Abstand und Preis kann er beeinflussen.'},
    {t:'Benjamin bucht mit Freunden einen Wochenendtrip nach Prag.',f:'opt',e:'Ein Wunsch, auf den man verzichten kann.'},
    {t:'Benjamin geht samstags mit seiner Freundin ins Kino in Jena.',f:'opt',e:'Freizeit, nicht lebensnotwendig.'},
    {t:'Benjamin bestellt sich am Sonntag eine Pizza beim Lieferdienst.',f:'opt',e:'Bequem, aber verzichtbar: Kochen ist günstiger.'}]})}
<section class="panel stack hh-fakten"><p class="title-s"><span class="ms sm" aria-hidden="true">info</span> Gut zu wissen</p><ul class="small">
  <li>Ein Haushalt in Deutschland gibt im Schnitt <b class="num">${fmt(ZAHLEN.konsum,0)} €</b> im Monat für den Konsum aus (EVS 2023).</li>
  <li>Für Wohnen und Essen gehen im Schnitt <b>${ZAHLEN.wohnenEssen} %</b> drauf, bei Haushalten mit weniger als 1.300 € netto <b>${ZAHLEN.wohnenEssenArm} %</b>.</li></ul></section>
${schreibfeld(WAND.geldfluss)}
${impuls(IMPULS.geldfluss)}
${erkHTML('geldfluss')}`},
init(root){
  let st=store(P+'-fluss')||{};
  const ausgabe=a=>{const r=$('#gf-'+a.id,root);$('#gf-'+a.id+'-o',root).textContent=`${r.value} €`};
  const summe=()=>AUSGABEN.reduce((s,a)=>s+ +$('#gf-'+a.id,root).value,0);
  function aufdecken(fokus){
    let fehler=0;
    AUSGABEN.forEach(a=>{const r=$('#gf-'+a.id,root),v=st.t[a.id];r.value=v;r.disabled=true;ausgabe(a);fehler+=Math.abs(v-a.anteil);
      const el=$(`[data-gf="${a.id}"] .hh-vergleich`,root);el.hidden=false;
      el.innerHTML=`<div class="hh-balken2" aria-hidden="true"><span class="tipp" style="width:${v/60*100}%"></span><span class="echt" style="width:${a.anteil/60*100}%"></span></div>
        <p class="small">Dein Tipp ${v} €, echt <b>${a.anteil} €</b>${Math.abs(v-a.anteil)<=3?' <span class="pill ok">Treffer</span>':''}</p>`});
    $('#gf-auf',root).hidden=true;
    $('#gf-fb',root).innerHTML=`<div class="fb ${fehler<=20?'ok':fehler<=40?'amb':'bad'}" tabindex="-1"><b>Zusammen ${fehler} € daneben.</b> Wohnen ist mit Abstand der größte Brocken: 36 von 100 €. Die übrigen 22 € gehen an Einrichtung, Handy und Internet, Gesundheit, Kleidung und Sonstiges (Destatis, 2022).</div>
      <div class="row"><button class="btn small" type="button" id="gf-neu"><span class="ms" aria-hidden="true">restart_alt</span>Noch einmal schätzen</button></div>`;
    $('#gf-neu',root).addEventListener('click',()=>{st={};store(P+'-fluss',st);AUSGABEN.forEach(a=>{$('#gf-'+a.id,root).disabled=false;$(`[data-gf="${a.id}"] .hh-vergleich`,root).hidden=true});$('#gf-auf',root).hidden=false;$('#gf-fb',root).innerHTML='';$('#gf-'+AUSGABEN[0].id,root).focus()});
    if(fokus)$('#gf-fb .fb',root).focus();
  }
  AUSGABEN.forEach(a=>{$('#gf-'+a.id,root).addEventListener('input',()=>ausgabe(a));ausgabe(a)});
  $('#gf-auf',root).addEventListener('click',()=>{st={t:Object.fromEntries(AUSGABEN.map(a=>[a.id,+$('#gf-'+a.id,root).value]))};store(P+'-fluss',st);aufdecken(true)});
  if(st.t)aufdecken(false);
  bindErk(root);
}});

/* 4 Benjamins Monat: das Haushaltsspiel */
tool({id:'benjamin',ch:3,farben:['e','a','s'],hinweise:HINWEISE.benjamin,title:'Benjamins Monat',sub:'Erste eigene Wohnung in Jena: vier Monate, jeden Monat Entscheidungen und eine Überraschung. Allein oder live mit der Klasse',
html(){return `<p class="task"><b>Auftrag:</b> Entscheide vier Monate lang für Benjamin. Trag nach jeder Abrechnung die Summen in deinen Haushaltsplan auf dem Arbeitsblatt ein.</p>
${haushaltsspiel(BENJAMIN)}
${schreibfeld(WAND.benjamin)}
${impuls(IMPULS.benjamin)}
${erkHTML('benjamin')}`},
init(root){bindHaushaltsspiel(root);bindErk(root)}});

/* 5 Die Schuldenfalle: Dispo-Rechner und Gläubiger */
const STUFEN=[{icon:'credit_card',t:'Dispo',e:'Das Konto rutscht ins Minus. Bequem, aber rund 11 % Zinsen im Jahr.'},
  {icon:'event_repeat',t:'Ratenkredit',e:'Feste Raten über Monate oder Jahre. Günstiger als der Dispo, aber du bist lange gebunden.'},
  {icon:'warning',t:'Überschuldung',e:'Das Geld reicht auf Dauer nicht mehr für Leben und Raten. Mahnungen, Inkasso, SCHUFA-Eintrag.'}];
tool({id:'schuldenfalle',ch:4,farben:['s'],hinweise:HINWEISE.schuldenfalle,title:'Die Schuldenfalle',sub:'Was kostet der Dispo in Döner? Und bei wem stehen Überschuldete in der Kreide?',
html(){return `<p class="task"><b>Auftrag:</b> Probier am Dispo-Rechner aus, was ein Minus kostet. Tipp dann, bei wem Menschen mit Schulden am häufigsten Rückstände haben.</p>
<ol class="hh-stufen">${STUFEN.map((s,i)=>`<li><span class="ms" aria-hidden="true">${s.icon}</span><b>${i+1}. ${s.t}</b><span class="small">${s.e}</span></li>`).join('')}</ol>
<section class="aufgabe stack" id="dr"><p class="aufgabe-kopf"><span class="ms sm" aria-hidden="true">calculate</span>Dispo-Rechner</p>
  ${regler('dr-minus','Minus auf dem Konto',50,1500,50,500)}
  ${regler('dr-monate','So lange bleibt es im Minus',1,24,1,6)}
  <div class="hh-dispo" aria-live="polite" id="dr-erg"></div>
  <p class="small muted">Zinssatz ${ZAHLEN.dispoSchnitt} % im Jahr (Schnitt, Mai 2026), ohne Zinseszins gerechnet. Ein Döner kostet in Jena rund 7,50 €.</p></section>
<section class="aufgabe stack" id="gl"><p class="aufgabe-kopf"><span class="ms sm" aria-hidden="true">leaderboard</span>Wer will Geld?</p>
  <p class="aufgabe-frage">Bei wem haben Menschen in der Schuldnerberatung am häufigsten offene Rechnungen? Tipp die vier in deiner Reihenfolge an, die häufigste zuerst.</p>
  <div class="hh-rang" id="gl-wahl" role="group" aria-label="Gläubiger in deiner Reihenfolge antippen"></div>
  <div id="gl-fb" class="stack"></div></section>
${schreibfeld(WAND.schuldenfalle)}
${impuls(IMPULS.schuldenfalle)}
${erkHTML('schuldenfalle')}`},
init(root){
  const m=$('#dr-minus',root),t=$('#dr-monate',root);
  function rechne(){const z=+m.value*ZAHLEN.dispoSchnitt/100*(+t.value)/12;
    $('#dr-minus-o',root).textContent=`${fmt(+m.value,0)} €`;$('#dr-monate-o',root).textContent=`${t.value} ${+t.value===1?'Monat':'Monate'}`;
    const d=Math.floor(z/7.5);
    $('#dr-erg',root).innerHTML=`<p class="big-num num">${geld(z)}</p><p>Zinsen für ${fmt(+m.value,0)} € Minus in ${t.value} ${+t.value===1?'Monat':'Monaten'}. Das sind <b class="num">${d} ${d===1?'Döner':'Döner'}</b>, die du nie isst.</p>
      <div class="hh-doener" aria-hidden="true">${Array.from({length:Math.min(d,40)},()=>'<span class="ms">kebab_dining</span>').join('')}${d>40?'<span class="small">…</span>':''}</div>`}
  [m,t].forEach(x=>x.addEventListener('input',rechne));rechne();
  // Gläubiger antippen: Reihenfolge des Tipps, dann die echte Reihenfolge
  let st=store(P+'-glaeubiger')||{r:[]};
  const wahl=$('#gl-wahl',root),fb=$('#gl-fb',root),echt=[...GLAEUBIGER].sort((a,b)=>b.anteil-a.anteil);
  function zeige(fokus){
    const fertig=st.r.length===GLAEUBIGER.length;
    wahl.innerHTML=GLAEUBIGER.map(g=>{const i=st.r.indexOf(g.id);return `<button class="hh-opt" type="button" data-gl="${g.id}" ${i>=0||fertig?'disabled':''} aria-pressed="${i>=0}"><span class="ms" aria-hidden="true">${g.icon}</span><span class="hh-opt-text"><b>${esc(g.t)}</b></span>${i>=0?`<span class="hh-platz num">${i+1}.</span>`:''}</button>`}).join('');
    $$('[data-gl]',wahl).forEach(b=>b.addEventListener('click',()=>{st.r.push(b.dataset.gl);store(P+'-glaeubiger',st);zeige(true)}));
    if(!fertig){fb.innerHTML=st.r.length?'<div class="row"><button class="btn small text" type="button" id="gl-neu"><span class="ms" aria-hidden="true">undo</span>Von vorn</button></div>':'';
      $('#gl-neu',fb)?.addEventListener('click',()=>{st={r:[]};store(P+'-glaeubiger',st);zeige(true)});
      if(fokus)$('[data-gl]:not([disabled])',wahl)?.focus();return}
    const richtig=echt.filter((g,i)=>st.r[i]===g.id).length;
    fb.innerHTML=`<div class="fb ${richtig>=3?'ok':richtig>=1?'amb':'bad'}" tabindex="-1"><b>${richtig} von 4 an der richtigen Stelle.</b> So oft gibt es Rückstände bei …</div>
      <ul class="hh-glist">${echt.map((g,i)=>`<li><span class="small"><b>${i+1}.</b> ${esc(g.t)} <span class="muted">(dein Tipp: ${st.r.indexOf(g.id)+1}.)</span></span><div class="bank-balken bad" aria-hidden="true"><span style="width:${g.anteil}%"></span></div><span class="num small">${g.anteil} %</span></li>`).join('')}</ul>
      <p class="small">Anteil der Menschen in der Schuldnerberatung mit Rückständen bei diesen Gläubigern (Destatis, 2025). Viele haben Schulden bei mehreren gleichzeitig.</p>
      <div class="row"><button class="btn small" type="button" id="gl-neu"><span class="ms" aria-hidden="true">restart_alt</span>Noch einmal</button></div>`;
    $('#gl-neu',fb).addEventListener('click',()=>{st={r:[]};store(P+'-glaeubiger',st);zeige(true)});
    if(fokus)$('.fb',fb).focus();
  }
  zeige(false);
  bindErk(root);
}});

/* 6 Raus aus den Schulden: Fall Lisa, Wege heraus */
const WEGE=[{icon:'receipt_long',t:'Überblick',e:'Alle Rechnungen, Mahnungen und Verträge sammeln. Nichts ungeöffnet lassen.'},
  {icon:'table_view',t:'Haushaltsplan',e:'Was kommt rein, was muss raus? Wo kann ich sparen?'},
  {icon:'forum',t:'Reden',e:'Gläubiger anrufen, Ratenzahlung oder Stundung vereinbaren.'},
  {icon:'support_agent',t:'Beratung',e:'Schuldnerberatung von Caritas, Diakonie, AWO, Verbraucherzentrale oder Stadt: kostenlos und vertraulich.'},
  {icon:'gavel',t:'Privatinsolvenz',e:'Letzter Weg über das Gericht. Nach in der Regel drei Jahren sind die restlichen Schulden weg.'}];
tool({id:'auswege',ch:4,farben:['s'],hinweise:HINWEISE.auswege,title:'Raus aus den Schulden',sub:'Lisa hat 2.300 € Schulden. Was sollte sie zuerst tun? Und wer ist eigentlich schuld?',
html(){return `<p class="task"><b>Auftrag:</b> Entscheide, was Lisa zuerst tun sollte. Lies dann die fünf Schritte aus den Schulden und nimm Stellung.</p>
${abstimmung({id:'hh-lisa',kopf:'Ihr seid die Schuldnerberater',icon:'support_agent',titel:'Lisa, 19',
  fall:'<p><b>Lisa (19)</b> macht eine Ausbildung zur Kauffrau in Erfurt. Ihr Konto steht 900 € im Dispo, für den Handyvertrag mit neuem Smartphone sind zwei Raten offen, dazu kommen drei Rechnungen von „Später bezahlen“-Käufen. Heute kam ein Brief vom Inkasso. Insgesamt sind es rund 2.300 €.</p><p class="small muted">Szenario, Person erfunden</p>',
  frage:'Was sollte Lisa als Erstes tun?',
  optionen:['Einen Ratenkredit aufnehmen und alles auf einmal bezahlen','Alle Briefe sammeln, sich einen Überblick verschaffen und zur Schuldnerberatung gehen','Die Briefe erst mal liegen lassen, bis der nächste Lohn kommt','Ihre Eltern bitten, heimlich alles zu bezahlen'],
  r:1,e:'Zuerst braucht Lisa einen Überblick: Wem schuldet sie wie viel, und was ist dringend? Die Schuldnerberatung hilft kostenlos, mit den Gläubigern Raten zu vereinbaren. Ein neuer Kredit ohne Plan verschiebt das Problem nur, und liegen gelassene Briefe machen es durch Mahn- und Inkassokosten teurer.'})}
<ol class="hh-wege">${WEGE.map((w,i)=>`<li><span class="hh-wege-nr num" aria-hidden="true">${i+1}</span><span class="ms" aria-hidden="true">${w.icon}</span><span><b>${w.t}</b><span class="small" style="display:block">${w.e}</span></span></li>`).join('')}</ol>
<section class="panel stack hh-fakten"><p class="title-s"><span class="ms sm" aria-hidden="true">info</span> Wie kommt es zur Überschuldung?</p><ul class="small">
  <li>Häufigste Auslöser 2025: Krankheit, Sucht oder Unfall (18 %) und Arbeitslosigkeit (17 %). Bei Alleinerziehenden oft Trennung oder Tod des Partners (Destatis).</li>
  <li>Junge Erwachsene geraten eher durch Konsum, Handyverträge und Kredite in Schulden. Unter 30-Jährige gehören zu den am stärksten betroffenen Gruppen (SchuldnerAtlas 2025).</li>
  <li>Folgen: Mahngebühren und Inkassokosten, ein negativer SCHUFA-Eintrag (kein Handyvertrag, keine Wohnung), Pfändung des Lohns, Stress und Streit in der Familie.</li></ul></section>
${schreibfeld(WAND.auswege)}
${impuls(IMPULS.auswege)}
${erkHTML('auswege')}`},
init(root){bindErk(root)}});

/* 7 Sichern: Hefteintrag und Auflösung des Schätzduells */
tool({id:'sichern',ch:5,farben:['e','a','s'],hinweise:HINWEISE.sichern,title:'Hefteintrag und Schätz-Check',sub:'Das Wichtigste für dein Heft, die Auflösung des Schätzduells und deine Antwort auf die Leitfrage',
html(){return `<p class="task"><b>Auftrag:</b> Vervollständige den Hefteintrag. Schau dann, wie gut du im Schätzduell lagst.</p>
${lueckentext({id:'hh-sichern-lt',titel:'Hefteintrag: Haushaltsplan und Schulden',saetze:[
  'Einkommen kommt aus Arbeit ([Erwerbseinkommen]), vom Staat ([Transfereinkommen]) oder aus Besitz ([Vermögenseinkommen]).',
  'Vom [Brutto] gehen Steuern und [Sozialversicherungsbeiträge|Sozialabgaben] ab. Geplant wird mit dem [Netto].',
  '[Fixe] Ausgaben wie die Miete bleiben gleich, [variable] Ausgaben wie Lebensmittel schwanken, auf [optionale] Ausgaben kann man verzichten.',
  'Ein [Haushaltsplan] stellt Einnahmen und Ausgaben gegenüber. Der Anteil des Einkommens, der gespart wird, heißt [Sparquote].',
  'Der [Dispo|Dispokredit] ist ein teurer Kredit. Reichen die Einnahmen auf Dauer nicht für die Schulden, spricht man von [Überschuldung].',
  'Hilfe gibt es kostenlos bei der [Schuldnerberatung].']})}
${blitzAufloesung(SCHAETZ)}
${schreibfeld(WAND.sichern)}
${impuls(IMPULS.sichern)}
${erkHTML('sichern')}`},
init(root){bindErk(root)}});

/* 8 Wissenscheck */
tool({id:'wissenscheck',ch:5,farben:['e','a','s'],hinweise:HINWEISE.wissenscheck,title:'Wissenscheck',sub:`${WISSENSCHECK.aufgaben.length} Aufgaben in drei Stufen mit Feedback zu jeder Antwort – auch als Klassen-Quiz im Lernraum`,
html(){return `<p class="task"><b>Auftrag:</b> Prüfe dein Wissen in drei Stufen: Grundlagen, Anwenden, Beurteilen. Läuft ein Lernraum, kann eure Lehrkraft den Wissenscheck als Klassen-Quiz starten.</p>
${wissenscheck(WISSENSCHECK)}`},
init(){}});

/* ---------- Startseite und Wissen ---------- */
function startHTML(){
  return `<section class="banner"><img src="${FOTO.gotha.src}" alt="${esc(FOTO.gotha.alt)}"><span class="credit">${nachweis('gotha')}</span>
    <div class="banner-text"><p class="eyebrow">Leitfrage · Klasse 9 · Umgang mit Geld</p><h2>Erste eigene Wohnung: Wie kommst du mit deinem Geld über den Monat?</h2></div></section>
  <section class="hh-start-grid">
    <div class="stack">
      <div class="hh-zahl"><p class="display-s num">${fmt(ZAHLEN.ueberschuldet,2)} Mio.</p><p>Erwachsene in Deutschland sind überschuldet, etwa jeder zwölfte. Besonders oft trifft es unter 30-Jährige.<span class="small muted" style="display:block">SchuldnerAtlas 2025, Creditreform</span></p></div>
      <p class="body-l">Benjamin ist 18, Azubi in Jena und zieht zum ersten Mal allein. Du entscheidest für ihn: Wohnung, Handy, Auto, Abos. Kommt er bis zum Monatsende, oder landet er im Dispo?</p>
      <div class="cta"><button class="fab" type="button" data-hh-tool="benjamin"><span class="ms" aria-hidden="true">play_arrow</span>Benjamins Monat spielen</button><button class="btn outlined" type="button" data-hh-tool="schaetzduell"><span class="ms" aria-hidden="true">bolt</span>Schätzduell</button></div></div>
    <div class="panel stack"><h3 class="title-m">Was du danach kannst</h3><ul class="lernziele">
      <li><span class="ms" aria-hidden="true">check_circle</span><span>Einkommensarten unterscheiden und Brutto und Netto erklären</span></li>
      <li><span class="ms" aria-hidden="true">check_circle</span><span>Fixe, variable und optionale Ausgaben sortieren und die Ausgaben deutscher Haushalte beschreiben</span></li>
      <li><span class="ms" aria-hidden="true">check_circle</span><span>Einen Haushaltsplan aufstellen und die Sparquote berechnen</span></li>
      <li><span class="ms" aria-hidden="true">check_circle</span><span>Ursachen von Verschuldung erklären und Wege aus den Schulden beurteilen</span></li></ul></div>
  </section>
  ${chapterHTML(1)}
  <section class="section-h"><h2>Dein Lernpfad</h2><p>Erst schätzen, dann verstehen, woher das Geld kommt und wohin es fließt. Dann planst du vier Monate für Benjamin, allein oder live mit der Klasse. Zum Schluss: Schulden und wie man wieder herauskommt.</p></section>
  <div class="dest-cards">${DEST.slice(1).map(d=>`<button class="dest" type="button" data-dest="${d.id}"><span class="ic"><span class="ms" aria-hidden="true">${d.icon}</span></span><span><span class="title-m">${d.label}</span><span class="small muted" style="display:block">${d.desc}</span></span></button>`).join('')}</div>`;
}
const QUELLEN=[
  'BIBB: Tarifliche Ausbildungsvergütungen 2025, Stand 1. Oktober 2025 (1.209 € im Schnitt aller Lehrjahre)',
  'Mindestausbildungsvergütung, Kindergeld (259 €), Mindestlohn (13,90 €) und Grundfreibetrag (12.348 €) ab Januar 2026; Beitragssätze der Sozialversicherung 2026 mit durchschnittlichem Zusatzbeitrag der Krankenkassen von 2,9 %',
  'Statistisches Bundesamt: Laufende Wirtschaftsrechnungen 2022, Konsumausgaben privater Haushalte nach Bereichen (Wohnen, Energie und Instandhaltung 36 %)',
  'Statistisches Bundesamt: Einkommens- und Verbrauchsstichprobe 2023, Konsumausgaben 3.030 € je Haushalt und Monat, Anteil Wohnen und Ernährung 52 % bzw. 64 % unter 1.300 € netto (Dezember 2025)',
  'Stiftung Warentest: Dispozinsen im Vergleich, Mai 2026 (durchschnittlich 10,99 %)',
  'Creditreform: SchuldnerAtlas Deutschland 2025, November 2025 (5,67 Mio. überschuldete Erwachsene, Quote 8,16 %)',
  'Statistisches Bundesamt: Überschuldungsstatistik 2025, Pressemitteilung vom 15. Juli 2026 (Auslöser, Gläubiger, durchschnittliche Schulden 34.650 €)',
  '§ 551 BGB (Mietkaution in drei Raten), Rundfunkbeitrag 18,36 €, Deutschlandticket 63 € (2026)',
  'Unterrichtsmaterial der Lehrkraft: Folien „1.6 Einkommen und Ausgaben der Haushalte“, Infotext M1, Haushaltsplan von Clara, Positionslinie zur Verschuldung (Inhalte neu geschrieben)'];
function sourcesHTML(){return `<section class="panel sources"><h3 class="title-m" style="color:var(--md-on-surface)">Quellen (Stand ${STAND})</h3><ul>${QUELLEN.map(q=>`<li>${q}</li>`).join('')}
  <li>Fotos: ${Object.values(FOTO).map(f=>`${esc(f.motiv)}: <a href="${f.link}" rel="noopener" target="_blank">${esc(f.credit.split(', ')[0])}</a> (<a href="${f.lizenz}" rel="noopener" target="_blank">${esc(f.credit.split(', ')[1])}</a>)`).join(' · ')}</li>
  <li>Benjamin, Lisa und alle anderen Personen sind erfunden. Preise in „Benjamins Monat“ sind gerundete Beispiele (Szenario).</li></ul>
  <p>Merksätze und Ergebnisse werden nur in diesem Browser gespeichert. Im Lernraum geht bei „Benjamins Monat“ pro Monat nur ein Buchstabe für den Kontostand (Plus, knapp, Minus) und einer für die Reaktion auf das Ereignis an die Datenbank des Raums.</p>
  <div class="row"><button class="btn outlined small" id="reset" type="button"><span class="ms" aria-hidden="true">restart_alt</span>Merksätze zurücksetzen</button><span id="reset-confirm" class="row" hidden><button class="btn primary small" id="reset-yes" type="button">Ja, alles zurücksetzen</button><button class="btn text small" id="reset-no" type="button">Abbrechen</button></span></div></section>`}
function wissenHTML(){const alle=['e','a','s'].map(dot).join('');
  return chapterHTML(5,`<button class="card" type="button" data-open="glossar"><span class="dots">${alle}</span><h3 class="title-m">Begriffe nachschlagen</h3><p>${GLOSS.length} Fachbegriffe mit Suche</p><span class="go">Öffnen<span class="ms sm" aria-hidden="true">arrow_forward</span></span></button><button class="card" type="button" data-open="wissen"><span class="dots">${alle}</span><h3 class="title-m">Mein Haushalts-Wissen</h3><p>Alle Merksätze als Hefteintrag sammeln und kopieren</p><span class="go">Öffnen<span class="ms sm" aria-hidden="true">arrow_forward</span></span></button>`)+sourcesHTML()}

W.start();
