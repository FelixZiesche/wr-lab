// Lernwerkstatt Zahlungsmethoden (Klasse 9): Bauchgefühl, Kassen-Rush, Klassenbank (Überweisen im Lernraum),
// Fake-Detektor, Krypto-Achterbahn und das Chat-Abenteuer „Jetzt kaufen, später zahlen“.
// Gerüst, Navigation und Aufgaben-Bausteine kommen aus /shared/, hier stehen nur die Inhalte.
import { $, $$, esc, fmt, store, beiBreite } from '../shared/js/ui.js';
import { createWerkstatt } from '../shared/js/werkstatt.js';
import { schreibfeld, zuordnen, lueckentext, wissenscheck, impuls, blitz, blitzAufloesung } from '../shared/js/aufgaben.js';
import { chatgeschichte } from '../shared/js/chat.js';
import { bank } from '../shared/js/bank.js';
import { STAND, ZAHLEN, FOTO, ARTEN, KASSEN, BANK, NACHRICHTEN, KURS, SHIRT } from './daten.js';
import { PAYLATER_CHAT } from './paylater.js';
import { HINWEISE, WAND, IMPULS } from './wand.js';
import { WISSENSCHECK } from './wissenscheck.js';

const P='zm';
const eur=(n,d=2)=>`${fmt(n,d)} €`;

/* ---------- Merksätze ---------- */
const MS={
  bauchgefuehl:['Bargeld ist noch das häufigste Zahlungsmittel, aber nicht mehr die Mehrheit: 2025 wurden 55 % aller Zahlungen in Deutschland bargeldlos bezahlt, vor allem mit Karte und Handy.'],
  kassenrush:['Bargeld wird fast überall angenommen, funktioniert ohne Technik und gibt dir den besten Überblick, ist aber online nutzlos und kann verloren gehen. Girocard, Kreditkarte und Handy sind schnell und kontaktlos, aber das Konto muss gedeckt sein, und man verliert leichter den Überblick.',
    'Online schützt dich ein Bezahldienst mit Käuferschutz oder der Kauf auf Rechnung. Vorkasse an unbekannte Shops ist riskant.'],
  klassenbank:['Für eine Überweisung brauchst du Name und IBAN des Empfängers. Die Prüfziffer der IBAN erkennt Tippfehler, die Empfängerprüfung warnt, wenn der Name nicht zur IBAN passt. Eine Echtzeitüberweisung ist in Sekunden da und lässt sich nicht zurückholen.',
    'Mit einem Dauerauftrag überweist du regelmäßig selbst, bei einer Lastschrift bucht der Empfänger ab. Eine Lastschrift kannst du acht Wochen lang ohne Grund zurückgeben. Ein Schülerkonto kann man nicht überziehen.'],
  fake:['Betrüger arbeiten mit Zeitdruck, Drohungen, Gewinnversprechen und Links zu fremden Seiten. Banken fragen nie per Link nach Zugangs- oder Kartendaten. Im Zweifel: nicht klicken, selbst bei der Bank oder der Person anrufen.'],
  krypto:['Kryptowährungen wie Bitcoin sind kein gesetzliches Zahlungsmittel und werden kaum angenommen. Ihr Kurs schwankt stark, deshalb weiß beim Bezahlen niemand, was etwas am Ende wirklich kostet. Wer seinen Key verliert, verliert sein Geld für immer.'],
  paylater:['„Buy now, pay later“ ist ein Zahlungsaufschub und damit ein Kredit. Wer Fristen verpasst, zahlt Mahngebühren und Inkassokosten, bei Ratenzahlung Zinsen. Seit dem 20. November 2026 muss der Anbieter prüfen, ob du zurückzahlen kannst.'],
  sichern:['Die passende Zahlungsart hängt von der Situation ab: im Laden Bargeld, Karte oder Handy, online ein Verfahren mit Käuferschutz, unter Freunden die Echtzeitüberweisung. Sicher bezahlt, wer Daten prüft, Warnungen ernst nimmt und nur Geld ausgibt, das er hat.']
};

/* ---------- Glossar ---------- */
const GLOSS=[
  ['Bargeld','Münzen und Scheine. In Deutschland ist nur der Euro als Bargeld gesetzliches Zahlungsmittel.'],
  ['Buy now, pay later','„Jetzt kaufen, später zahlen“: Ein Dienst bezahlt für dich, du zahlst später oder in Raten zurück. Das ist ein Kredit.'],
  ['Dauerauftrag','Du beauftragst deine Bank, regelmäßig denselben Betrag an denselben Empfänger zu überweisen, zum Beispiel für den Handyvertrag.'],
  ['Debitkarte','Bankkarte zum Girokonto, zum Beispiel die Girocard oder eine Visa- oder Mastercard-Debitkarte. Das Geld wird sofort vom Konto abgebucht.'],
  ['Digitaler Euro','Geplantes digitales Bargeld der Europäischen Zentralbank. Er soll Bargeld ergänzen, nicht ersetzen. Die Einführung ist für 2029 geplant.'],
  ['Dispokredit','Erlaubnis der Bank, das Girokonto bis zu einer Grenze zu überziehen. Sehr teuer. Für Minderjährige gibt es ihn nicht.'],
  ['Echtzeitüberweisung','Überweisung, die in höchstens zehn Sekunden beim Empfänger ankommt, rund um die Uhr. Sie darf nicht mehr kosten als eine normale Überweisung.'],
  ['Empfängerprüfung','Seit Oktober 2025 prüft die Bank vor jeder Überweisung, ob der Name des Empfängers zur IBAN passt. Englisch: Verification of Payee.'],
  ['Girocard','Die verbreitetste Debitkarte in Deutschland, früher EC-Karte genannt.'],
  ['Girokonto','Konto für den Zahlungsverkehr: Taschengeld, Lohn, Kartenzahlung, Überweisungen. Für Jugendliche gibt es das Schülerkonto.'],
  ['IBAN','Internationale Kontonummer. Eine deutsche IBAN hat 22 Zeichen: DE, zwei Prüfziffern, die Bankleitzahl und die Kontonummer.'],
  ['Inkasso','Firma, die offene Rechnungen für andere eintreibt. Dabei kommen weitere Kosten dazu.'],
  ['Käuferschutz','Schutz bei Online-Bezahldiensten: Kommt die Ware nicht oder ist sie ganz anders als beschrieben, bekommst du dein Geld zurück.'],
  ['Kontaktlos bezahlen','Karte oder Handy kurz ans Kartengerät halten. Bei kleinen Beträgen (meist bis 50 €) ohne PIN.'],
  ['Kreditkarte','Karte, mit der du jetzt bezahlst und erst später abgerechnet wirst, meist einmal im Monat. Weltweit und online nutzbar.'],
  ['Kryptowährung','Digitales Geld wie Bitcoin, das ohne Banken und Staaten funktioniert. Kein gesetzliches Zahlungsmittel, der Kurs schwankt stark.'],
  ['Lastschrift','Du erlaubst einem Empfänger (Mandat), Geld von deinem Konto abzubuchen. Zurückgeben kannst du sie acht Wochen ohne Grund, ohne Mandat 13 Monate.'],
  ['Mahngebühr','Gebühr, die du zahlen musst, wenn du eine Rechnung zu spät bezahlst.'],
  ['Mobile Payment','Bezahlen mit dem Handy oder der Smartwatch, zum Beispiel mit Apple Pay oder Google Pay.'],
  ['Phishing','Betrug mit gefälschten Nachrichten oder Webseiten, um an Passwörter, Zugangs- oder Kartendaten zu kommen.'],
  ['Prüfziffer','Die zwei Ziffern nach dem DE in der IBAN. Sie werden aus allen anderen Ziffern berechnet und entdecken Tippfehler.'],
  ['SCHUFA','Auskunftei, die speichert, ob jemand seine Rechnungen und Kredite bezahlt. Ein negativer Eintrag erschwert Handyverträge, Kredite und die Wohnungssuche.'],
  ['Überweisung','Du schickst Geld von deinem Konto auf ein anderes Konto. Eine Standardüberweisung braucht bis zu einem Bankarbeitstag.'],
  ['Verwendungszweck','Kurzer Text bei einer Überweisung, wofür das Geld ist, zum Beispiel eine Rechnungsnummer.'],
  ['Wallet','Digitale Geldbörse. Bei Kryptowährungen speichert sie die Keys, mit denen man auf seine Coins zugreift.'],
  ['Wero','Europäischer Bezahldienst der Banken und Sparkassen: Geld in Sekunden von Handy zu Handy schicken.']
];

/* ---------- Kapitel und Bereiche ---------- */
const CH={1:['Kapitel 1 – Einstieg','Dein Bauchgefühl'],2:['Kapitel 2 – Bezahlen im Alltag','Sechs Kassen in Thüringen'],3:['Kapitel 3 – Online-Banking','Überweisen und Betrug erkennen'],
  4:['Kapitel 4 – Neue Wege','Krypto und „später bezahlen“'],5:['Kapitel 5 – Sichern','Hefteintrag und Wissenscheck']};
const DEST=[
  {id:'start',icon:'home',label:'Start',title:'Lernwerkstatt Zahlungsmethoden',kurz:'Bezahlen',render:startHTML},
  {id:'alltag',icon:'storefront',label:'Alltag',title:'Bezahlen im Alltag',kurz:'Alltag',ch:[2],desc:'Sechs Kassen von der Bäckerei bis zum Fake-Shop: Wie bezahlst du am besten?'},
  {id:'banking',icon:'account_balance',label:'Banking',title:'Online-Banking',kurz:'Banking',ch:[3],desc:'Die Klassenbank: Überweist euch gegenseitig Geld. Dazu der Fake-Detektor'},
  {id:'neu',icon:'currency_bitcoin',label:'Neue Wege',title:'Krypto und „später bezahlen“',kurz:'Neue Wege',ch:[4],desc:'Die Krypto-Achterbahn und ein Chat-Abenteuer über „Jetzt kaufen, später zahlen“'},
  {id:'wissen',icon:'school',label:'Wissen',title:'Sichern und wiederholen',ch:[5],render:wissenHTML,desc:'Hefteintrag, Bauchgefühl-Check, Wissenscheck mit Klassen-Quiz, Fachbegriffe und deine Merksätze'}
];
const dot=k=>`<span class="zm-dot ${k}" aria-hidden="true"></span>`;

const W=createWerkstatt({
  thema:'zahlungsmethoden',
  speicher:P,
  logo:'<svg aria-hidden="true" width="40" height="40" viewBox="0 0 42 42"><rect x="4" y="9" width="34" height="24" rx="4" fill="none" stroke="var(--md-primary)" stroke-width="3"/><rect x="4" y="15" width="34" height="4" fill="var(--zm-k)"/><circle cx="13" cy="27" r="3" fill="var(--zm-b)"/><circle cx="19" cy="27" r="3" fill="var(--zm-d)"/></svg>',
  bereiche:DEST,
  kapitel:CH,
  merksaetze:MS,
  wissenTitel:'Mein Bezahl-Wissen',
  glossar:GLOSS,
  punkte:x=>x.farben.map(dot).join(''),
  beimZeigen(id,v){
    $$('[data-zm-tool]',v).forEach(b=>b.addEventListener('click',()=>openTool(b.dataset.zmTool)));
    if($('#reset',v)){
      $('#reset',v).addEventListener('click',()=>{$('#reset-confirm',v).hidden=false});
      $('#reset-no',v).addEventListener('click',()=>{$('#reset-confirm',v).hidden=true});
      $('#reset-yes',v).addEventListener('click',()=>W.resetWissen());
    }
  }
});
const {tool,erkHTML,bindErk,openTool,chapterHTML}=W;

/* ---------- Fotos mit Bildnachweis ---------- */
function nachweis(k){const f=FOTO[k];if(!f)return '';const [wer,lizenz]=f.credit.split(', ');
  return f.link?`Foto: <a href="${f.link}" rel="noopener" target="_blank">${esc(wer)}</a>${lizenz?`, <a href="${f.lizenz}" rel="noopener" target="_blank">${esc(lizenz)}</a>`:''}`:`Foto: ${esc(f.credit)}`}
const foto=(k,kl='')=>`<figure class="zm-fig ${kl}"><img src="${FOTO[k].src}" alt="${esc(FOTO[k].alt)}" loading="lazy"><figcaption>${nachweis(k)}</figcaption></figure>`;

/* 1 Bauchgefühl: Blitzrunde, aufgelöst erst in „Hefteintrag und Bauchgefühl-Check“ */
const BAUCH={id:'zm-blitz',werkstatt:'bauchgefuehl',verdeckt:true,
  titel:'Stimmt das oder stimmt das nicht? Entscheide aus dem Bauch.',
  optionen:[{id:'nein',t:'Stimmt nicht',icon:'thumb_down'},{id:'ja',t:'Stimmt',icon:'thumb_up'}],
  karten:[
    {t:'In Deutschland wird inzwischen mehr als die Hälfte aller Einkäufe ohne Bargeld bezahlt.',r:'ja',e:`2025 erstmals: ${ZAHLEN.unbar} % bargeldlos, ${ZAHLEN.barAnzahl} % bar. 2008 waren es noch ${ZAHLEN.barAnzahl2008} % bar (Bundesbank).`},
    {t:'Junge Erwachsene zwischen 18 und 24 haben im Schnitt mehr als 50 € Bargeld im Portemonnaie.',r:'nein',e:`Es sind im Schnitt ${ZAHLEN.portemonnaieJung} €. Über alle Altersgruppen sind es ${ZAHLEN.portemonnaie} €.`},
    {t:'Mit 15 kannst du dein Schülerkonto überziehen, wenn das Geld mal knapp ist.',r:'nein',e:'Ein Schülerkonto läuft nur auf Guthaben. Minderjährige dürfen keinen Dispokredit aufnehmen.'},
    {t:'Eine Echtzeitüberweisung darf nicht mehr kosten als eine normale Überweisung.',r:'ja',e:'Das schreibt eine EU-Verordnung seit Januar 2025 vor.'},
    {t:'Bitcoin ist in Deutschland ein gesetzliches Zahlungsmittel wie der Euro.',r:'nein',e:'Kein Laden muss Bitcoin annehmen. Gesetzliches Zahlungsmittel ist nur der Euro.'},
    {t:'Bucht jemand ohne deine Erlaubnis per Lastschrift Geld ab, kannst du es zurückholen.',r:'ja',e:'Acht Wochen lang sogar ohne Grund, ohne Erlaubnis (Mandat) bis zu 13 Monate.'},
    {t:'Bevor du eine Überweisung freigibst, prüft deine Bank, ob der Name zur IBAN passt.',r:'ja',e:'Die Empfängerprüfung gibt es seit Oktober 2025 bei allen Banken in der EU.'},
    {t:'„Jetzt kaufen, später zahlen“ ist kein Kredit, weil keine Zinsen anfallen.',r:'nein',e:'Ein Zahlungsaufschub ist ein Kredit. Seit dem 20. November 2026 muss der Anbieter deshalb prüfen, ob du zurückzahlen kannst.'}]};
tool({id:'bauchgefuehl',ch:1,farben:['b','k','d'],hinweise:HINWEISE.bauchgefuehl,title:'Stimmt das?',sub:'Acht Aussagen rund ums Bezahlen – entscheide so schnell du kannst. Die Auflösung kommt am Ende',
html(){return `<p class="task"><b>Auftrag:</b> Stimmt die Aussage oder nicht? Entscheide blitzschnell. Ob du richtig lagst, erfährst du am Ende.</p>
${blitz(BAUCH)}
${schreibfeld(WAND.bauchgefuehl)}
${impuls(IMPULS.bauchgefuehl)}
${erkHTML('bauchgefuehl')}`},
init(root){bindErk(root)}});

/* 2 Kassen-Rush: sechs Kassen, eine Zahlungsart pro Kasse */
const WERT={gut:[2,'ok','Top-Wahl'],geht:[1,'amb','Geht'],schlecht:[0,'bad','Schlechte Wahl']};
tool({id:'kassenrush',ch:2,farben:['b','k','d'],hinweise:HINWEISE.kassenrush,title:'Kassen-Rush',sub:'Sechs Kassen in Thüringen: Wähle jedes Mal die beste Zahlungsart und sieh sofort, was passiert',
html(){return `<p class="task"><b>Auftrag:</b> Du stehst an sechs Kassen. Wähle jedes Mal, wie du bezahlst. Sammle möglichst viele Punkte.</p>
<section class="aufgabe stack zm-kasse" id="kr"><p class="aufgabe-kopf"><span class="ms sm" aria-hidden="true">storefront</span>Kassen-Rush <span class="num small muted" id="kr-n"></span></p>
  <div id="kr-buehne" class="stack"></div></section>
${schreibfeld(WAND.kassenrush)}
${impuls(IMPULS.kassenrush)}
${erkHTML('kassenrush')}`},
init(root){
  let st=store(P+'-kasse');if(!st||!Array.isArray(st.a)||st.a.length!==KASSEN.length)st={a:KASSEN.map(()=>null)};
  const buehne=$('#kr-buehne',root),sichern=()=>store(P+'-kasse',st);
  const punkte=()=>st.a.reduce((s,w,i)=>s+(w?WERT[KASSEN[i].w[w][0]][0]:0),0);
  function zeige(fokus){
    const i=st.a.findIndex(x=>x==null);
    $('#kr-n',root).textContent=i<0?'':`· Kasse ${i+1} von ${KASSEN.length} · ${punkte()} Punkte`;
    if(i<0)return ende(fokus);
    const k=KASSEN[i];
    buehne.innerHTML=`<div class="zm-kasse-grid">${foto(k.foto)}
      <div class="stack"><p class="eyebrow">${esc(k.ort)}</p><p class="title-m">${esc(k.was)}</p><p class="big-num num">${esc(k.betrag)}</p>
        <div class="zm-optionen" role="group" aria-label="Wie bezahlst du?">${Object.keys(k.w).map(a=>`<button class="btn zm-opt" type="button" data-kr="${a}"><span class="ms" aria-hidden="true">${ARTEN[a].icon}</span>${ARTEN[a].t}</button>`).join('')}</div>
        <div class="stack" id="kr-fb"></div></div></div>`;
    $$('[data-kr]',buehne).forEach(b=>b.addEventListener('click',()=>waehle(i,b.dataset.kr)));
    if(fokus)$('[data-kr]',buehne).focus();
  }
  function waehle(i,a){
    const k=KASSEN[i],[w,t]=k.w[a],[,kl,titel]=WERT[w];
    $$('[data-kr]',buehne).forEach(b=>{b.disabled=true;const[ww]=k.w[b.dataset.kr];b.classList.add(WERT[ww][1]);if(b.dataset.kr===a)b.setAttribute('aria-pressed','true')});
    const besser=Object.entries(k.w).filter(([x,[ww]])=>ww==='gut'&&x!==a).map(([x])=>ARTEN[x].t);
    $('#kr-fb',buehne).innerHTML=`<div class="fb ${kl}" tabindex="-1"><b>${titel} (+${WERT[w][0]})</b> ${t}${w!=='gut'&&besser.length?` <br><span class="small">Besser: ${besser.join(', ')}.</span>`:''}</div>
      <div class="row"><button class="btn primary small" type="button" id="kr-weiter"><span class="ms" aria-hidden="true">arrow_forward</span>${i+1<KASSEN.length?'Nächste Kasse':'Zur Auswertung'}</button></div>`;
    st.a[i]=a;sichern();
    $('#kr-fb .fb',buehne).focus();
    $('#kr-weiter',buehne).addEventListener('click',()=>zeige(true));
  }
  function ende(fokus){
    const p=punkte(),max=KASSEN.length*2;
    buehne.innerHTML=`<div class="fb ${p>=max-2?'ok':p>=max/2?'amb':'bad'}" tabindex="-1"><p class="title-m num">${p} von ${max} Punkten</p>
      <p>${p>=max-2?'Kassen-Profi! Du weißt, wann Bargeld, Karte oder Käuferschutz gewinnt.':'Schau dir an, wo du danebenlagst: Es kommt immer auf die Situation an.'}</p></div>
      <ul class="zm-bilanz">${KASSEN.map((k,i)=>{const a=st.a[i],[w]=k.w[a];return `<li class="${WERT[w][1]}"><span class="ms sm" aria-hidden="true">${ARTEN[a].icon}</span><span><b>${esc(k.ort)}:</b> ${ARTEN[a].t} <span class="small muted">(${WERT[w][2]})</span></span></li>`}).join('')}</ul>
      <div class="row"><button class="btn small" type="button" id="kr-neu"><span class="ms" aria-hidden="true">restart_alt</span>Noch einmal</button></div>`;
    $('#kr-neu',buehne).addEventListener('click',()=>{st={a:KASSEN.map(()=>null)};sichern();zeige(true)});
    if(fokus)$('.fb',buehne).focus();
  }
  zeige(false);
  bindErk(root);
}});

/* 3 Klassenbank */
tool({id:'klassenbank',ch:3,farben:['k','d'],hinweise:HINWEISE.klassenbank,title:'Die Klassenbank',sub:'Dein Übungskonto mit Spielgeld: Überweist euch im Lernraum gegenseitig Geld, mit Empfängerprüfung, Dauerauftrag und Lastschrift',
html(){return `<p class="task"><b>Auftrag:</b> Erledige die sechs Aufträge unter „Deine Aufträge“. Im Lernraum: Frag deinen Nachbarn nach seiner IBAN und überweis ihm Geld.</p>
${bank(BANK)}
${schreibfeld(WAND.klassenbank)}
${impuls(IMPULS.klassenbank)}
${erkHTML('klassenbank')}`},
init(root){bindErk(root)}});

/* 4 Fake-Detektor */
const warnHTML=(t,zeigen)=>esc(t).replace(/\[\[(.+?)\]\]/g,(m,x)=>zeigen?`<mark class="zm-warn">${x}</mark>`:x);
tool({id:'fake',ch:3,farben:['d'],hinweise:HINWEISE.fake,title:'Fake-Detektor',sub:'Acht Nachrichten auf deinem Handy: Echt oder Betrug? Danach leuchten die Warnsignale auf',
html(){return `<p class="task"><b>Auftrag:</b> Lies jede Nachricht und entscheide: echt oder Fake? Danach siehst du die Warnsignale.</p>
<section class="aufgabe stack" id="fd"><p class="aufgabe-kopf"><span class="ms sm" aria-hidden="true">visibility</span>Fake-Detektor <span class="num small muted" id="fd-n"></span></p>
  <div id="fd-buehne" class="stack"></div></section>
${schreibfeld(WAND.fake)}
${impuls(IMPULS.fake)}
${erkHTML('fake')}`},
init(root){
  let st=store(P+'-fake');if(!st||!Array.isArray(st.a)||st.a.length!==NACHRICHTEN.length)st={a:NACHRICHTEN.map(()=>null)};
  const buehne=$('#fd-buehne',root),sichern=()=>store(P+'-fake',st),richtig=()=>st.a.filter((x,i)=>x!=null&&x===NACHRICHTEN[i].fake).length;
  const karte=(m,zeigen)=>`<article class="zm-nachricht"><p class="zm-n-kopf"><span class="ms sm" aria-hidden="true">${m.icon}</span><b>${esc(m.kanal)}</b><span class="small muted">${esc(m.von)}</span></p><p>${warnHTML(m.text,zeigen)}</p></article>`;
  function zeige(fokus){
    const i=st.a.findIndex(x=>x==null);
    $('#fd-n',root).textContent=i<0?'':`· Nachricht ${i+1} von ${NACHRICHTEN.length}`;
    if(i<0)return ende(fokus);
    const m=NACHRICHTEN[i];
    buehne.innerHTML=`${karte(m,false)}<div class="row zm-fd-wahl" role="group" aria-label="Deine Entscheidung"><button class="btn" type="button" data-fd="1"><span class="ms" aria-hidden="true">warning</span>Fake</button><button class="btn" type="button" data-fd="0"><span class="ms" aria-hidden="true">verified</span>Echt</button></div><div id="fd-fb" class="stack"></div>`;
    $$('[data-fd]',buehne).forEach(b=>b.addEventListener('click',()=>waehle(i,b.dataset.fd==='1')));
    if(fokus)$('[data-fd]',buehne).focus();
  }
  function waehle(i,fake){
    const m=NACHRICHTEN[i],ok=fake===m.fake;st.a[i]=fake;sichern();
    $('.zm-nachricht',buehne).outerHTML=karte(m,true);$('.zm-fd-wahl',buehne).remove();
    $('#fd-fb',buehne).innerHTML=`<div class="fb ${ok?'ok':'bad'}" tabindex="-1"><b>${ok?'Richtig erkannt.':'Daneben.'} ${m.fake?'Das ist Betrug.':'Die Nachricht ist echt.'}</b> ${m.e}${m.fake?' <span class="small">Die Warnsignale sind markiert.</span>':''}</div>
      <div class="row"><button class="btn primary small" type="button" id="fd-weiter"><span class="ms" aria-hidden="true">arrow_forward</span>${i+1<NACHRICHTEN.length?'Nächste Nachricht':'Zur Auswertung'}</button></div>`;
    $('#fd-fb .fb',buehne).focus();
    $('#fd-weiter',buehne).addEventListener('click',()=>zeige(true));
  }
  function ende(fokus){const n=richtig();
    buehne.innerHTML=`<div class="fb ${n===NACHRICHTEN.length?'ok':n>=6?'amb':'bad'}" tabindex="-1"><p class="title-m num">${n} von ${NACHRICHTEN.length} richtig erkannt</p><p>${n===NACHRICHTEN.length?'Dich legt so schnell keiner rein.':'Merk dir die Warnsignale: Zeitdruck, Drohung, Gewinnversprechen, fremde Links und Fragen nach Kartendaten.'}</p></div>
      <div class="row"><button class="btn small" type="button" id="fd-neu"><span class="ms" aria-hidden="true">restart_alt</span>Noch einmal</button></div>`;
    $('#fd-neu',buehne).addEventListener('click',()=>{st={a:NACHRICHTEN.map(()=>null)};sichern();zeige(true)});
    if(fokus)$('.fb',buehne).focus();
  }
  zeige(false);
  bindErk(root);
}});

/* 5 Krypto-Achterbahn: T-Shirt mit Bitcoin bezahlen (Szenario), danach Wallet und Key */
const BTC=n=>fmt(n,6).replace(/0+$/,'').replace(/,$/,'');
const uhr=i=>{const m=14*60+i*5;return `${Math.floor(m/60)}:${String(m%60).padStart(2,'0')} Uhr`};
const KEY=[
  {id:'foto',t:'Als Screenshot in der Handy-Galerie',icon:'smartphone',art:'bad',e:'Riskant: Fotos landen oft automatisch in der Cloud. Wer dein Handy oder dein Cloud-Konto knackt, hat deine Bitcoin.'},
  {id:'zettel',t:'Auf einem Zettel im Portemonnaie',icon:'account_balance_wallet',art:'bad',e:'Portemonnaie weg, Zettel in der Wäsche? Dann sind deine Bitcoin für immer verloren. Keine Bank kann sie dir zurückgeben.'},
  {id:'usb',t:'Auf einem Hardware-Wallet (USB-Stick) und eine Kopie sicher zu Hause',icon:'lock',art:'ok',e:'Am sichersten. Aber auch hier gilt: Verlierst du Stick und Kopie, ist alles weg. Es gibt keine Hotline, kein „Passwort vergessen“.'}];
tool({id:'krypto',ch:4,farben:['d'],hinweise:HINWEISE.krypto,title:'Die Krypto-Achterbahn',sub:'Bezahl ein T-Shirt mit Bitcoin, während der Kurs Achterbahn fährt. Was hat es dich am Ende gekostet?',
html(){return `<p class="task"><b>Auftrag:</b> Du kaufst ein T-Shirt für ${SHIRT} € und bezahlst mit Bitcoin. Wähle den Zeitpunkt. Danach siehst du, was passiert.</p>
<div class="zm-krypto-grid">${foto('bitcoin','zm-fig-klein')}
<section class="aufgabe stack"><p class="aufgabe-kopf"><span class="ms sm" aria-hidden="true">show_chart</span>Bitcoin-Kurs in Euro <span class="pill neu">Szenario</span></p>
  <div class="chart zm-chart" id="kb-chart" aria-hidden="true"></div>
  <div class="ctrl" id="kb-regler"><label for="kb-t">Du bezahlst um <output id="kb-to"></output></label><input type="range" id="kb-t" min="0" max="12" step="1" value="0"></div>
  <p id="kb-info" aria-live="polite"></p>
  <div class="row"><button class="btn primary" type="button" id="kb-zahlen"><span class="ms" aria-hidden="true">currency_bitcoin</span>Mit Bitcoin bezahlen</button></div>
  <div id="kb-fb" class="stack"></div></section></div>
<section class="aufgabe stack" id="kb-key"><p class="aufgabe-kopf"><span class="ms sm" aria-hidden="true">lock</span>Dein Key</p>
  <p class="aufgabe-frage">Deine Bitcoin liegen nicht im Handy, sondern in der Blockchain. Zugreifen kannst du nur mit deinem geheimen Key. Wo bewahrst du ihn auf?</p>
  <div class="zm-optionen" role="group" aria-label="Wo bewahrst du deinen Key auf?">${KEY.map(k=>`<button class="btn zm-opt" type="button" data-key="${k.id}"><span class="ms" aria-hidden="true">${k.icon}</span>${k.t}</button>`).join('')}</div>
  <div id="kb-keyfb" class="stack"></div></section>
<section class="panel stack zm-fakten"><p class="title-s"><span class="ms sm" aria-hidden="true">info</span> Gut zu wissen</p><ul class="small">
  <li>Bitcoin ist kein gesetzliches Zahlungsmittel. Kaum ein Laden in Thüringen nimmt ihn an.</li>
  <li>El Salvador hatte Bitcoin 2021 als gesetzliches Zahlungsmittel eingeführt und im Februar 2025 wieder abgeschafft, die Zentralafrikanische Republik schon 2023.</li>
  <li>Eine Bitcoin-Zahlung lässt sich nicht zurückholen, und der Betrieb des Bitcoin-Netzes braucht sehr viel Strom.</li></ul></section>
${schreibfeld(WAND.krypto)}
${impuls(IMPULS.krypto)}
${erkHTML('krypto')}`},
init(root){
  const r=$('#kb-t',root),el=$('#kb-chart',root),letzte=KURS.length-1;let bezahlt=null;
  const st=store(P+'-krypto')||{};
  if(Number.isInteger(st.t)){r.value=st.t;bezahlt=st.t}
  function zeichne(){
    const t=+r.value,bis=bezahlt==null?t:letzte,min=55000,max=102000,Wv=600,H=220,pad=8;
    const x=i=>pad+i*(Wv-2*pad)/letzte,y=v=>H-pad-(v-min)/(max-min)*(H-2*pad);
    const pts=KURS.slice(0,bis+1).map((v,i)=>`${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
    el.innerHTML=`<svg viewBox="0 0 ${Wv} ${H}" width="100%" role="presentation">
      ${[60000,70000,80000,90000,100000].map(v=>`<line class="zm-gitter" x1="${pad}" x2="${Wv-pad}" y1="${y(v)}" y2="${y(v)}"/><text class="zm-achse" x="${pad+2}" y="${y(v)-4}">${fmt(v/1000,0)}.000 €</text>`).join('')}
      ${bezahlt==null?`<rect class="zm-zukunft" x="${x(t)}" y="0" width="${Wv-x(t)}" height="${H}"/><text class="zm-achse" x="${(x(t)+Wv)/2}" y="${H/2}" text-anchor="middle">Zukunft: ?</text>`:''}
      <polyline class="zm-linie" points="${pts}"/>
      <circle class="zm-punkt" cx="${x(bezahlt??t)}" cy="${y(KURS[bezahlt??t])}" r="6"/></svg>`;
    $('#kb-to',root).textContent=uhr(t);
    const btc=SHIRT/KURS[t];
    $('#kb-info',root).innerHTML=`Kurs um ${uhr(t)}: <b class="num">${eur(KURS[t],0)}</b> pro Bitcoin. Für das T-Shirt zahlst du <b class="num">${BTC(btc)} Bitcoin</b>.`;
  }
  function ergebnis(fokus){
    if(bezahlt==null){$('#kb-fb',root).innerHTML='';r.disabled=false;$('#kb-zahlen',root).hidden=false;return}
    r.disabled=true;$('#kb-zahlen',root).hidden=true;
    const btc=SHIRT/KURS[bezahlt],wert=btc*KURS[letzte],plus=wert-SHIRT;
    $('#kb-fb',root).innerHTML=`<div class="fb ${plus>0?'bad':'ok'}" tabindex="-1"><p><b>Um ${uhr(letzte)} wären deine ${BTC(btc)} Bitcoin ${eur(wert)} wert.</b></p>
      <p>${plus>0?`Dein T-Shirt hat dich umgerechnet <b>${eur(wert)}</b> gekostet, also ${eur(plus)} mehr als gedacht. Der Laden freut sich, wenn er die Bitcoin behalten hat.`:'Glück gehabt: Der Kurs ist gefallen. Dafür hat jetzt der Laden Verlust gemacht.'}</p>
      <p class="small">Darum nehmen fast keine Händler Bitcoin: Niemand weiß, was der Preis in Euro morgen wert ist. Und für die Steuer müsste jeder Kauf in Euro aufgeschrieben werden.</p></div>
      <div class="row"><button class="btn small" type="button" id="kb-neu"><span class="ms" aria-hidden="true">restart_alt</span>Anderen Zeitpunkt ausprobieren</button></div>`;
    $('#kb-neu',root).addEventListener('click',()=>{bezahlt=null;store(P+'-krypto',{});zeichne();ergebnis();r.focus()});
    if(fokus)$('#kb-fb .fb',root).focus();
  }
  r.addEventListener('input',zeichne);
  $('#kb-zahlen',root).addEventListener('click',()=>{bezahlt=+r.value;store(P+'-krypto',{t:bezahlt});zeichne();ergebnis(true)});
  $$('[data-key]',root).forEach(b=>b.addEventListener('click',()=>{const k=KEY.find(x=>x.id===b.dataset.key);
    $$('[data-key]',root).forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
    $('#kb-keyfb',root).innerHTML=`<div class="fb ${k.art}" tabindex="-1">${k.e}</div>`;$('#kb-keyfb .fb',root).focus()}));
  beiBreite(el,zeichne);
  zeichne();ergebnis(false);
  bindErk(root);
}});

/* 6 Jetzt kaufen, später zahlen: Chat-Abenteuer */
tool({id:'paylater',ch:4,farben:['k','d'],hinweise:HINWEISE.paylater,title:'Jetzt kaufen, später zahlen',sub:'Sneaker für 120 €, auf dem Konto 80 €: Ein Chat-Abenteuer mit fünf Enden',
html(){return `<p class="task"><b>Auftrag:</b> Spielt das Chat-Abenteuer zu zweit. Entscheidet, was ihr tut. Der Finanz-Check erklärt die Folgen. Findet mindestens zwei Enden.</p>
${chatgeschichte(PAYLATER_CHAT)}
${schreibfeld(WAND.paylater)}
${impuls(IMPULS.paylater)}
${erkHTML('paylater')}`},
init(root){bindErk(root)}});

/* 7 Sichern: Hefteintrag, Vor- und Nachteile, Bauchgefühl-Check, Antwort auf die Leitfrage */
tool({id:'sichern',ch:5,farben:['b','k','d'],hinweise:HINWEISE.sichern,title:'Hefteintrag und Bauchgefühl-Check',sub:'Das Wichtigste für dein Heft, Vor- und Nachteile sortieren, die Auflösung der Blitzrunde und deine Antwort auf die Leitfrage',
html(){return `<p class="task"><b>Auftrag:</b> Vervollständige den Hefteintrag und sortiere die Vor- und Nachteile. Schau dann, wie gut dein Bauchgefühl war.</p>
${lueckentext({id:'zm-sichern-lt',titel:'Hefteintrag: Zahlungsmethoden',saetze:[
  'Bargeld gibt dir den besten [Überblick] und klappt ohne Technik, online kannst du damit aber nicht zahlen.',
  'Mit der [Girocard|Debitkarte] wird das Geld sofort vom Konto abgebucht. Bei der [Kreditkarte] kommt die Abrechnung erst später.',
  'Für eine Überweisung brauchst du Name und [IBAN] des Empfängers. Die [Empfängerprüfung] warnt, wenn beides nicht zusammenpasst.',
  'Eine [Echtzeitüberweisung] ist in Sekunden da und lässt sich nicht zurückholen.',
  'Bei einer [Lastschrift] bucht der Empfänger ab. Du kannst sie acht [Wochen] lang ohne Grund zurückgeben.',
  'Online schützt dich der [Käuferschutz] eines Bezahldienstes. „Jetzt kaufen, später zahlen“ ist ein [Kredit].']})}
${zuordnen({id:'zm-vorteile',frage:'Vorteil oder Nachteil? Ordne jede Karte der passenden Zahlungsart zu.',
  faecher:[{id:'bar',t:'Bargeld'},{id:'karte',t:'Karte'},{id:'ueberw',t:'Überweisung und Lastschrift'},{id:'digital',t:'Handy und Online-Bezahldienst'}],
  karten:[{t:'Plus: Funktioniert ohne Strom und Netz',f:'bar',e:'Bargeld braucht keine Technik.'},{t:'Minus: Weg ist weg, wenn das Portemonnaie verloren geht',f:'bar',e:'Verlust- und Diebstahlrisiko.'},
    {t:'Plus: Weltweit akzeptiert und schnell an der Kasse',f:'karte',e:'Karten werden fast überall angenommen.'},{t:'Minus: Man verliert leicht den Überblick über die Ausgaben',f:'karte',e:'Besonders bei der Kreditkarte, die erst später abrechnet.'},
    {t:'Plus: Regelmäßige Zahlungen wie Miete laufen automatisch',f:'ueberw',e:'Dauerauftrag und Lastschrift erledigen das von selbst.'},{t:'Minus: Bei einer Lastschrift muss das Konto gedeckt sein, sonst kostet es Gebühren',f:'ueberw',e:'Platzt eine Lastschrift, berechnet die Bank Gebühren.'},
    {t:'Plus: Kontaktlos und Käuferschutz beim Online-Kauf',f:'digital',e:'Handy kontaktlos an der Kasse, Käuferschutz bei Bezahldiensten.'},{t:'Minus: Akku leer, und deine Daten landen bei weiteren Firmen',f:'digital',e:'Technik und Datenschutz sind die Schwachstellen.'}]})}
${blitzAufloesung(BAUCH)}
${schreibfeld(WAND.sichern)}
${impuls(IMPULS.sichern)}
${erkHTML('sichern')}`},
init(root){bindErk(root)}});

/* 8 Wissenscheck */
tool({id:'wissenscheck',ch:5,farben:['b','k','d'],hinweise:HINWEISE.wissenscheck,title:'Wissenscheck',sub:`${WISSENSCHECK.aufgaben.length} Aufgaben in drei Stufen mit Feedback zu jeder Antwort – auch als Klassen-Quiz im Lernraum`,
html(){return `<p class="task"><b>Auftrag:</b> Prüfe dein Wissen in drei Stufen: Grundlagen, Anwenden, Beurteilen. Läuft ein Lernraum, kann eure Lehrkraft den Wissenscheck als Klassen-Quiz starten.</p>
${wissenscheck(WISSENSCHECK)}`},
init(){}});

/* ---------- Startseite und Wissen ---------- */
function startHTML(){
  return `<section class="banner"><img src="${FOTO.galerie.src}" alt="${esc(FOTO.galerie.alt)}"><span class="credit">${nachweis('galerie')}</span>
    <div class="banner-text"><p class="eyebrow">Leitfrage · Klasse 9 · Umgang mit Geld</p><h2>Bar, Karte, Handy oder später: Wie bezahlst du clever und sicher?</h2></div></section>
  <section class="zm-start">
    <div class="stack">
      <div class="zm-zahl"><p class="display-s num">${ZAHLEN.unbar} %</p><p>aller Zahlungen in Deutschland waren 2025 bargeldlos. Zum ersten Mal mehr als die Hälfte.<span class="small muted" style="display:block">Bundesbank, Zahlungsverhalten in Deutschland 2025</span></p></div>
      <p class="body-l">Teste dein Bauchgefühl, rette dich durch sechs Kassen, überweist euch in der Klassenbank gegenseitig Geld und entlarve Fake-Nachrichten.</p>
      <div class="cta"><button class="fab" type="button" data-zm-tool="bauchgefuehl"><span class="ms" aria-hidden="true">bolt</span>Bauchgefühl testen</button><button class="btn outlined" type="button" data-zm-tool="klassenbank"><span class="ms" aria-hidden="true">account_balance</span>Zur Klassenbank</button></div></div>
    <div class="panel stack"><h3 class="title-m">Was du danach kannst</h3><ul class="lernziele">
      <li><span class="ms" aria-hidden="true">check_circle</span><span>Zahlungsarten mit ihren Vor- und Nachteilen vergleichen</span></li>
      <li><span class="ms" aria-hidden="true">check_circle</span><span>Eine Überweisung sicher ausführen, Dauerauftrag und Lastschrift unterscheiden</span></li>
      <li><span class="ms" aria-hidden="true">check_circle</span><span>Phishing und Betrugsmaschen erkennen</span></li>
      <li><span class="ms" aria-hidden="true">check_circle</span><span>Neue Entwicklungen beurteilen: Echtzeitüberweisung, Kryptowährungen, „später bezahlen“</span></li></ul></div>
  </section>
  ${chapterHTML(1)}
  <section class="section-h"><h2>Dein Lernpfad</h2><p>Jede Werkstatt endet mit einer Erkenntnis für „Mein Bezahl-Wissen“. Am Ende prüfst du alles im Wissenscheck.</p></section>
  <div class="dest-cards">${DEST.slice(1).map(d=>`<button class="dest" type="button" data-dest="${d.id}"><span class="ic"><span class="ms" aria-hidden="true">${d.icon}</span></span><span><span class="title-m">${d.label}</span><span class="small muted" style="display:block">${d.desc}</span></span></button>`).join('')}</div>`;
}
const QUELLEN=[
  'Deutsche Bundesbank: Zahlungsverhalten in Deutschland 2025, Studie und Pressegespräch vom 17. Juni 2026 (Bargeld 45 % der Zahlungen, 23 % des Umsatzes; 55 % bargeldlos; 10 % mobil; 98 € im Portemonnaie, 18 bis 24 Jahre: 47 €)',
  'Verordnung (EU) 2024/886 über Echtzeitüberweisungen: gleiche Entgelte wie Standardüberweisungen seit 9. Januar 2025, Empfängerprüfung seit 9. Oktober 2025',
  'Verbraucherzentrale: SEPA-Lastschrift, Rückgabe acht Wochen ohne Grund, ohne Mandat 13 Monate (§ 675x BGB, § 676b BGB)',
  'Gesetz zur Umsetzung der Verbraucherkreditrichtlinie (EU) 2023/2225, gilt ab 20. November 2026: auch kurze zinslose Zahlungsaufschübe zählen als Verbraucherdarlehen',
  'El Salvador: Änderung des Bitcoin-Gesetzes, Februar 2025 (kein gesetzliches Zahlungsmittel mehr); Zentralafrikanische Republik: Rücknahme 2023',
  'Unterrichtsmaterial der Lehrkraft: Skript Klasse 9, Kapitel 5.3 Zahlungsverkehr; Folien „1.5 Zahlungsmethoden“; Arbeitsblatt zu Bitcoin (Inhalte neu geschrieben)'];
function sourcesHTML(){return `<section class="panel sources"><h3 class="title-m" style="color:var(--md-on-surface)">Quellen (Stand ${STAND})</h3><ul>${QUELLEN.map(q=>`<li>${q}</li>`).join('')}
  <li>Fotos: ${Object.values(FOTO).map(f=>`${esc(f.motiv)}: <a href="${f.link}" rel="noopener" target="_blank">${esc(f.credit.split(', ')[0])}</a> (<a href="${f.lizenz}" rel="noopener" target="_blank">${esc(f.credit.split(', ')[1])}</a>)`).join(' · ')}</li>
  <li>Die Klassenbank, alle Konten, Shops, Dienste und Personen sind erfunden. Die Bankleitzahl der Übungs-IBANs gibt es nicht. Der Bitcoin-Kurs in der Krypto-Achterbahn ist ein Szenario.</li></ul>
  <p>Merksätze und Ergebnisse werden nur in diesem Browser gespeichert. Im Lernraum gehen Überweisungen der Klassenbank an die Datenbank des Raums.</p>
  <div class="row"><button class="btn outlined small" id="reset" type="button"><span class="ms" aria-hidden="true">restart_alt</span>Merksätze zurücksetzen</button><span id="reset-confirm" class="row" hidden><button class="btn primary small" id="reset-yes" type="button">Ja, alles zurücksetzen</button><button class="btn text small" id="reset-no" type="button">Abbrechen</button></span></div></section>`}
function wissenHTML(){const alle=['b','k','d'].map(dot).join('');
  return chapterHTML(5,`<button class="card" type="button" data-open="glossar"><span class="dots">${alle}</span><h3 class="title-m">Begriffe nachschlagen</h3><p>${GLOSS.length} Fachbegriffe mit Suche</p><span class="go">Öffnen<span class="ms sm" aria-hidden="true">arrow_forward</span></span></button><button class="card" type="button" data-open="wissen"><span class="dots">${alle}</span><h3 class="title-m">Mein Bezahl-Wissen</h3><p>Alle Merksätze als Hefteintrag sammeln und kopieren</p><span class="go">Öffnen<span class="ms sm" aria-hidden="true">arrow_forward</span></span></button>`)+sourcesHTML()}

W.start();
