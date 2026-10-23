// Klassenbank: ein Übungskonto mit Spielgeld, wie im Online-Banking. Die Schüler überweisen sich im Lernraum
// gegenseitig Geld (Standard- und Echtzeitüberweisung), mit Prüfziffer der IBAN, Empfängerprüfung und Freigabe.
// Dazu kommt die Kontosimulation: Monat für Monat kommt Geld rein, Daueraufträge, Lastschriften und Kartenzahlungen
// gehen raus, und in jedem Monat passiert etwas (Event), auf das die Schüler reagieren. Sicherheit und Überblick
// zeigen, wie gut sie reagiert haben. Ohne Lernraum überweist man an erfundene Konten (konten), alles bleibt auf dem Gerät.
//
//   bank({id, titel, name, start, konten, auftraege, eingang, monate, verzoegerung})
//     name       Name der Bank, z. B. 'Klassenbank (fiktiv)'
//     start      Startguthaben in Cent (Spielgeld)
//     konten     erfundene Konten [{name, iban, icon, info}]; ohne iban bekommt das Konto eine aus seinem Namen
//     auftraege  Aufträge mit automatischem Haken [{id, t, art, betrag?, wort?}]
//                art: 'zweck' (Überweisung mit betrag in Cent und wort im Verwendungszweck), 'echtzeit', 'pruefziffer'
//                (eine IBAN mit Tippfehler wurde erkannt), 'empfaenger' (Warnung der Empfängerprüfung richtig beachtet),
//                'dauerauftrag', 'lastschrift' (unberechtigte Lastschrift zurückgegeben)
//     eingang    Dauerauftrag an dich, der in der Liste der Daueraufträge steht {name, betrag, zweck}, z. B. Taschengeld
//     monate     Kontosimulation [{name, ein:[{name, betrag, zweck}], aus:[{id?, name, betrag, zweck, typ:'lastschrift'|'karte'}],
//                event:{id, icon, kanal, titel, text, frage, wahl:[{t, art:'ok'|'amb'|'bad', folge, s?, u?, buchung?, abo?, rueck?, auftrag?}]}}]
//                buchung {name, betrag (Cent, + oder −), zweck, alles?: höchstens der Kontostand}, abo {name, betrag, zweck, mal}
//                bucht ab dem nächsten Monat mal-mal ab, rueck gibt die Lastschrift aus diesem Monat mit dieser id zurück,
//                s und u ändern Sicherheit und Überblick (0 bis 10, Start 5), auftrag hakt einen Auftrag ab
//     verzoegerung Sekunden, bis eine Standardüberweisung ankommt (Standard 60, „ein Bankarbeitstag“)
// Im Lernraum: Jeder Teilnehmer bekommt ein Konto mit seinem Spitznamen als Kontoinhaber. Die IBAN kommt aus der
// Kennung des Geräts. Überweisungen gehen über live.js (konten, buchungen), siehe firestore.rules. Die Lehrkraft sieht
// den Bank-Monitor (im Beamer-Modus ohne Spitznamen) und hat kein eigenes Konto. Mit „Monat starten“ steuert sie die
// Kontosimulation für alle (Raumfeld bankMonat), jede Reaktion geht als Buchstabe a bis c an sie (Feld bk, ohne Texte).
// Icons, die das Thema in icons.txt braucht: account_balance, bolt, check_circle, content_copy, event_repeat, fast_forward,
// hourglass_top, lock, person_search, receipt_long, send, undo, verified, warning, calendar_month, shield, visibility.
import { $, $$, esc, fmt, store, kopieren, zeigeHinweis } from './ui.js';
import { raum, registriere } from './lernraum.js';

const DEFS=new Map();
const BLZ='00230500';   // gibt es nicht: Bankleitzahlen in Deutschland beginnen nie mit 0
const MAX_NR=300;       // so viele Überweisungen darf ein Gerät im Lernraum schicken (firestore.rules)
export const eur=c=>`${fmt(c/100,2)} €`;
const vorz=c=>(c>0?'+':c<0?'−':'')+eur(Math.abs(c));

/* ---------- IBAN ---------- */
const mod97=z=>{let r=0;for(const c of z)r=(r*10+ +c)%97;return r};
const zahlen=s=>s.replace(/[A-Z]/g,c=>String(c.charCodeAt(0)-55));
/** Deutsche IBAN aus einer zehnstelligen Kontonummer (Prüfziffer nach ISO 13616) */
export function ibanAus(konto){const bban=BLZ+String(konto).padStart(10,'0').slice(-10);
  return 'DE'+String(98-mod97(zahlen(bban+'DE00'))).padStart(2,'0')+bban}
/** Kontonummer aus einem beliebigen Text (Kennung des Geräts, Name eines erfundenen Kontos) */
const nummerAus=s=>{let h=2166136261,g=5381;for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619);g=(Math.imul(g,33)^c.charCodeAt(0))>>>0}
  return String((h>>>0)%100000)+String(g%100000).padStart(5,'0')};
export const ibanVon=s=>ibanAus(nummerAus(s));
export const ibanNorm=s=>String(s||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
/** '' (gültig), 'laenge', 'land' oder 'pruefziffer' */
export function ibanFehler(s){const i=ibanNorm(s);
  if(!/^[A-Z]{2}/.test(i)||i.slice(0,2)!=='DE')return i.length<2?'laenge':'land';
  if(!/^DE\d{20}$/.test(i))return 'laenge';
  return mod97(zahlen(i.slice(4)+i.slice(0,4)))===1?'':'pruefziffer'}
export const ibanSchoen=s=>ibanNorm(s).replace(/(.{4})/g,'$1 ').trim();

/* ---------- Empfängerprüfung ----------
   Wie bei den Banken seit Oktober 2025: Stimmt der Name genau, passt er fast (dann zeigt die Bank den richtigen Namen)
   oder passt er nicht. Verglichen wird ohne Groß- und Kleinschreibung, Leerzeichen und Zusätze wie „(fiktiv)“. */
const namenNorm=s=>String(s||'').toLowerCase().replace(/\(.*?\)/g,'').replace(/ß/g,'ss').normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]/g,'');
function abstand(a,b){const d=Array.from({length:b.length+1},(_,j)=>j);
  for(let i=1;i<=a.length;i++){let alt=d[0];d[0]=i;for(let j=1;j<=b.length;j++){const t=d[j];d[j]=Math.min(d[j]+1,d[j-1]+1,alt+(a[i-1]===b[j-1]?0:1));alt=t}}return d[b.length]}
/** 'ok', 'fast' oder 'nein' */
export function empfaengerPruefen(eingabe,inhaber){const a=namenNorm(eingabe),b=namenNorm(inhaber);
  if(!a)return 'nein';if(a===b)return 'ok';
  const teile=String(inhaber).toLowerCase().replace(/\(.*?\)/g,'').split(/[\s,.-]+/).map(namenNorm).filter(x=>x.length>2);
  if(abstand(a,b)<=Math.max(1,Math.floor(b.length/6))||(a.length>2&&(b.startsWith(a)||teile.includes(a))))return 'fast';
  return 'nein'}

export function bank(def){
  DEFS.set(def.id,def);
  registriere({id:def.id,frage:def.titel,loesung:def.auftraege.map(a=>a.t)});
  return `<section class="aufgabe bank" data-bank="${def.id}">
    <p class="aufgabe-kopf"><span class="ms sm" aria-hidden="true">account_balance</span>${esc(def.name)}</p>
    <p class="aufgabe-frage">${def.titel}</p>
    <div class="bank-monitor stack" data-bank-monitor hidden></div>
    <div class="bank-grid" data-bank-app>
      <div class="bank-handy">
        <div class="bank-kopf"><p class="small"><span data-bank-modus></span></p>
          <p class="title-m" data-bank-inhaber></p>
          <p class="row bank-iban"><span class="mono small" data-bank-iban></span><button class="icon-btn" type="button" data-bank-kopie aria-label="IBAN kopieren" title="IBAN kopieren"><span class="ms" aria-hidden="true">content_copy</span></button></p>
          <p class="eyebrow">Kontostand</p><p class="big-num num" data-bank-saldo aria-live="polite"></p></div>
        ${def.monate?`<div class="bank-monat row"><p class="title-s"><span class="ms sm" aria-hidden="true">calendar_month</span> <span data-bank-mname></span></p>
          <button class="btn primary small" type="button" data-bank-monat><span class="ms" aria-hidden="true">fast_forward</span><span data-bank-mtext>Nächster Monat</span></button>
          <p class="small muted" data-bank-mhinweis hidden></p></div>
        <div class="stack" data-bank-events></div>`:''}
        <div class="seg bank-tabs" role="tablist" aria-label="Banking">
          <button type="button" role="tab" data-bank-tab="ueberweisen" aria-selected="true"><span class="ms sm" aria-hidden="true">send</span>Überweisen</button>
          <button type="button" role="tab" data-bank-tab="umsaetze" aria-selected="false"><span class="ms sm" aria-hidden="true">receipt_long</span>Umsätze</button>
          <button type="button" role="tab" data-bank-tab="dauer" aria-selected="false"><span class="ms sm" aria-hidden="true">event_repeat</span>Daueraufträge</button></div>
        <div class="bank-seite" data-bank-seite="ueberweisen" role="tabpanel">
          <form class="stack" data-bank-form novalidate>
            <div class="bank-kontakte row" data-bank-kontakte=""></div>
            <label class="small" for="${def.id}-name">Empfänger</label><input id="${def.id}-name" data-bank-name autocomplete="off" maxlength="40">
            <label class="small" for="${def.id}-iban">IBAN</label><input id="${def.id}-iban" class="mono" data-bank-ibanfeld autocomplete="off" inputmode="text" maxlength="34" placeholder="DE00 0000 0000 0000 0000 00">
            <div class="row bank-zeile"><span class="stack"><label class="small" for="${def.id}-betrag">Betrag in €</label><input id="${def.id}-betrag" data-bank-betrag inputmode="decimal" autocomplete="off" placeholder="0,00"></span>
              <span class="stack" style="flex:1"><label class="small" for="${def.id}-zweck">Verwendungszweck</label><input id="${def.id}-zweck" data-bank-zweck maxlength="140" autocomplete="off"></span></div>
            <label class="test-opt"><input type="checkbox" data-bank-echtzeit><span><span class="ms sm" aria-hidden="true">bolt</span>Echtzeitüberweisung: in Sekunden da</span></label>
            <div class="row"><button class="btn primary" type="submit"><span class="ms" aria-hidden="true">person_search</span>Weiter</button></div>
          </form>
          <div class="stack" data-bank-schritt tabindex="-1"></div>
        </div>
        <div class="bank-seite" data-bank-seite="umsaetze" role="tabpanel" hidden><ul class="bank-umsaetze" data-bank-liste></ul></div>
        <div class="bank-seite stack" data-bank-seite="dauer" role="tabpanel" hidden>
          <ul class="bank-umsaetze" data-bank-dauerliste></ul>
          <form class="stack" data-bank-dauerform novalidate><p class="title-s">Neuer Dauerauftrag (jeden Monat)</p>
            <div class="bank-kontakte row" data-bank-kontakte="d"></div>
            <label class="small" for="${def.id}-dname">Empfänger</label><input id="${def.id}-dname" data-bank-dname maxlength="40" autocomplete="off">
            <label class="small" for="${def.id}-diban">IBAN</label><input id="${def.id}-diban" class="mono" data-bank-diban maxlength="34" autocomplete="off">
            <div class="row bank-zeile"><span class="stack"><label class="small" for="${def.id}-dbetrag">Betrag in €</label><input id="${def.id}-dbetrag" data-bank-dbetrag inputmode="decimal" autocomplete="off"></span>
              <span class="stack" style="flex:1"><label class="small" for="${def.id}-dzweck">Verwendungszweck</label><input id="${def.id}-dzweck" data-bank-dzweck maxlength="140" autocomplete="off"></span></div>
            <div class="row"><button class="btn" type="submit"><span class="ms" aria-hidden="true">event_repeat</span>Dauerauftrag einrichten</button></div>
            <p class="small" data-bank-dfb role="status"></p></form>
        </div>
      </div>
      <div class="stack bank-seitenleiste"><p class="title-s">Deine Aufträge <span class="num small muted" data-bank-n></span></p><ul class="bank-auftraege" data-bank-auftraege></ul>
        ${def.monate?`<div class="stack bank-werte" data-bank-werte></div>`:''}
        <div class="row"><button class="btn small text" type="button" data-bank-neu><span class="ms" aria-hidden="true">restart_alt</span>Konto zurücksetzen</button></div></div>
    </div></section>`;
}

/* ---------- Zustand ----------
   Gespeichert pro Gerät: lokale Umsätze (erfundene Konten, Daueraufträge, Lastschriften), Daueraufträge, erledigte Aufträge,
   die letzte Nummer im Lernraum und der Monat. Live-Buchungen kommen aus dem Raum. */
const leer=()=>({lokal:[],dauer:[],erledigt:{},nr:0,monat:0,abos:[],ev:{},s:5,u:5,eigen:''});
const ICON={lastschrift:'receipt_long',dauer:'event_repeat',ein:'payments',karte:'credit_card',rueck:'undo',geplatzt:'warning',event:'account_balance'};
const ART={lastschrift:'SEPA-Lastschrift',dauer:'Dauerauftrag',ein:'Gutschrift',karte:'Kartenzahlung',rueck:'Rückgabe der Lastschrift',geplatzt:'Nicht ausgeführt',event:'Buchung'};
const grenze=x=>Math.max(0,Math.min(10,x));
const BUCHST='abc';
// „6,50“, „6.50“, „1.000“ und „1.000,50“ sind erlaubt, Ergebnis in Cent (NaN bei ungültiger Eingabe)
const betragAus=s=>{const t=String(s||'').replace(/[\s€]/g,'').replace(/\.(?=\d{3}(?:,|$))/g,'');
  return /^\d{1,6}([.,]\d{1,2})?$/.test(t)?Math.round(parseFloat(t.replace(',','.'))*100):NaN};

export function bindBank(box){
  const def=DEFS.get(box.dataset.bank);if(!def)return;
  const key=`${raum.speicher()}-bank-${def.id}`,verz=(def.verzoegerung??60)*1000;
  let st={...leer(),...(store(key)||{})},live=[],stopp=null,ich=null,offen=null,ticker=null;
  const B=def.name.replace(/\s*\(.*?\)/g,''),fikt=def.konten.map(k=>({...k,iban:k.iban||ibanVon('fiktiv:'+k.name)}));
  const sichern=()=>store(key,st);
  const L=()=>raum.live(),code=()=>raum.sitzung()&&raum.sitzung().code;
  const imRaum=()=>raum.istSchueler()&&!!L()&&!!code();
  // Eigenes Konto: im Lernraum aus der Kennung des Geräts, sonst ein zufälliges, das auf dem Gerät bleibt
  if(!st.eigen){st.eigen=ibanAus(String(Math.floor(Math.random()*1e10)));sichern()}
  const zeit=b=>b.at&&b.at.toMillis?b.at.toMillis():null;
  const angekommen=b=>b.echtzeit||(zeit(b)!=null&&Date.now()-zeit(b)>=verz);
  function umsaetze(){
    const lokal=st.lokal.map(u=>({...u,quelle:'lokal'}));
    const lv=ich?live.map(b=>{const raus=b.von===L().uid;return {id:b.id,t:zeit(b)||Date.now(),name:raus?b.anName:b.vonName,iban:raus?b.anIban:b.vonIban,
      betrag:raus?-b.betrag:b.betrag,zweck:b.zweck,echtzeit:b.echtzeit,unterwegs:!angekommen(b),quelle:'live',raus}}):[];
    return [...lokal,...lv].sort((a,b)=>b.t-a.t);
  }
  // Ausgehendes zählt sofort, Eingehendes erst, wenn es angekommen ist
  const saldo=()=>def.start+umsaetze().reduce((s,u)=>s+(u.betrag<0||!u.unterwegs?u.betrag:0),0);

  /* ---------- Anzeige ---------- */
  const modus=$('[data-bank-modus]',box),schritt=$('[data-bank-schritt]',box),form=$('[data-bank-form]',box);
  function zeichneKonto(){
    const lk=raum.istLehrkraft()||raum.praesentation();
    $('[data-bank-app]',box).hidden=lk;$('[data-bank-monitor]',box).hidden=!lk;
    if(lk)return zeichneMonitor();
    const iban=ich?ich.iban:st.eigen;
    modus.innerHTML=ich?`<span class="ms sm" aria-hidden="true">cast_for_education</span> Lernraum ${esc(code())}: Überweise an deine Klasse`:`<span class="ms sm" aria-hidden="true">lock</span> Übungskonto mit Spielgeld (${esc(def.name)})`;
    $('[data-bank-inhaber]',box).textContent=ich?ich.name:'Dein Übungskonto';
    $('[data-bank-iban]',box).textContent=ibanSchoen(iban);
    $('[data-bank-saldo]',box).textContent=eur(saldo());
    $$('[data-bank-kontakte]',box).forEach(el=>el.innerHTML=`<span class="small muted">Vorlagen:</span>`+fikt.map((k,i)=>`<button class="chip" type="button" data-bank-k="${i}"><span class="ms sm" aria-hidden="true">${k.icon||'person'}</span>${esc(k.name)}</button>`).join(''));
    zeichneListe();zeichneDauer();zeichneAuftraege();zeichneSim();
  }
  function zeichneListe(){const l=umsaetze();
    $('[data-bank-liste]',box).innerHTML=l.length?l.map(u=>`<li class="${u.betrag<0?'raus':'rein'}">
      <span class="ms" aria-hidden="true">${ICON[u.typ]||(u.echtzeit?'bolt':u.unterwegs?'hourglass_top':'account_balance')}</span>
      <span class="bank-u-text"><b>${esc(u.name)}</b><span class="small">${esc(u.zweck||'ohne Verwendungszweck')}</span>
        <span class="small muted">${ART[u.typ]||(u.echtzeit?'Echtzeitüberweisung':'Überweisung')}${u.unterwegs?(u.betrag<0?' · unterwegs, kommt nach einem Bankarbeitstag an':' · unterwegs'):''}${u.monat?` · Monat ${u.monat}`:''}</span>
        ${u.typ==='lastschrift'&&!u.zurueck?`<button class="btn small" type="button" data-bank-rueck="${esc(u.id)}"><span class="ms" aria-hidden="true">undo</span>Lastschrift zurückgeben</button>`:''}</span>
      <span class="num bank-betrag">${vorz(u.betrag)}</span></li>`).join(''):'<li class="small muted">Noch keine Umsätze.</li>';
    $$('[data-bank-rueck]',box).forEach(b=>b.addEventListener('click',()=>zurueck(b.dataset.bankRueck)));
  }
  function zeichneDauer(){
    $('[data-bank-dauerliste]',box).innerHTML=[...(def.eingang?[{...def.eingang,rein:true}]:[]),...st.dauer].map((d,i)=>`<li class="${d.rein?'rein':'raus'}"><span class="ms" aria-hidden="true">event_repeat</span>
      <span class="bank-u-text"><b>${esc(d.name)}</b><span class="small">${esc(d.zweck||'')} · jeden Monat${d.rein?' an dich':''}</span>
      ${d.rein?'':`<button class="btn small text" type="button" data-bank-dweg="${i-(def.eingang?1:0)}"><span class="ms" aria-hidden="true">delete</span>Löschen</button>`}</span><span class="num bank-betrag">${vorz(d.rein?d.betrag:-d.betrag)}</span></li>`).join('');
    $$('[data-bank-dweg]',box).forEach(b=>b.addEventListener('click',()=>{st.dauer.splice(+b.dataset.bankDweg,1);sichern();zeichneDauer()}));
  }
  function zeichneAuftraege(){const n=def.auftraege.filter(a=>st.erledigt[a.id]).length;
    $('[data-bank-n]',box).textContent=`${n} von ${def.auftraege.length}`;
    $('[data-bank-auftraege]',box).innerHTML=def.auftraege.map(a=>`<li class="${st.erledigt[a.id]?'ok':''}"><span class="ms sm" aria-hidden="true">${st.erledigt[a.id]?'check_circle':'radio_button_checked'}</span><span>${st.erledigt[a.id]?'<span class="sr-only">Erledigt: </span>':''}${a.t}</span></li>`).join('');
  }
  function erledige(art,b){let neu=false;
    def.auftraege.forEach(a=>{if(st.erledigt[a.id]||a.art!==art)return;
      if(art==='zweck'&&!(b&&b.betrag===a.betrag&&String(b.zweck||'').toLowerCase().includes(a.wort)))return;
      st.erledigt[a.id]=true;neu=a});
    if(neu){sichern();zeichneAuftraege();zeigeHinweis(`Auftrag erledigt: ${neu.t.replace(/<[^>]*>/g,'')}`)}
  }
  function zeichneMonitor(){
    const mon=$('[data-bank-monitor]',box),namen=!raum.beamer(),l=[...live].sort((a,b)=>(zeit(b)||0)-(zeit(a)||0));
    const summe=l.reduce((s,b)=>s+b.betrag,0),echt=l.filter(b=>b.echtzeit).length;
    mon.innerHTML=`<p class="title-m"><span class="ms" aria-hidden="true">account_balance</span> Bank-Monitor</p>
      <div class="row"><span class="pill neu num">${l.length} ${l.length===1?'Überweisung':'Überweisungen'}</span><span class="pill neu num">${eur(summe)} bewegt</span><span class="pill neu num">${echt} in Echtzeit</span></div>
      ${l.length?`<ul class="bank-umsaetze">${l.slice(0,12).map(b=>`<li><span class="ms" aria-hidden="true">${b.echtzeit?'bolt':'account_balance'}</span><span class="bank-u-text"><b>${namen?`${esc(b.vonName)} → ${esc(b.anName)}`:'Überweisung'}</b><span class="small">${esc(b.zweck||'ohne Verwendungszweck')}</span></span><span class="num bank-betrag">${eur(b.betrag)}</span></li>`).join('')}</ul>`
        :'<p class="small muted">Noch keine Überweisungen. Die Schüler sehen ihr Konto, sobald sie die Werkstatt öffnen.</p>'}
      ${N?simMonitor():''}`;
    $('[data-bank-lkmonat]',mon)?.addEventListener('click',e=>{const m=+e.currentTarget.dataset.bankLkmonat;raum.setzeBankMonat(m)});
  }

  // Kontosimulation im Lernraum: Monat für alle starten, Reaktionen der Klasse als Balken (ohne Spitznamen)
  function simMonitor(){
    const bm=raum.bankMonat(),m=bm||0,sp=raum.zustand().spieler||[],lk=raum.istLehrkraft();
    const reak=i=>{const n=[0,0,0];let k=0;sp.forEach(p=>{const c=String(p.bk||'')[i-1];const j=BUCHST.indexOf(c);if(j>=0){n[j]++;k++}});return {n,k}};
    const zeile=i=>{const E=def.monate[i-1].event,{n,k}=reak(i);
      return `<div class="stack bank-reak"><p class="small"><b>${esc(def.monate[i-1].name)}: ${esc(E.titel)}</b> <span class="muted num">${k} von ${sp.length} haben reagiert</span></p>
        ${E.wahl.map((w,j)=>`<div class="bank-reak-zeile"><span class="small">${esc(w.t)}</span><div class="bank-balken ${w.art}" aria-hidden="true"><span style="width:${k?Math.round(n[j]/k*100):0}%"></span></div><span class="num small">${n[j]}</span></div>`).join('')}</div>`};
    return `<div class="stack bank-steuer"><p class="title-s"><span class="ms sm" aria-hidden="true">calendar_month</span> Kontosimulation: ${bm==null?'Jeder spielt in seinem Tempo':`${esc(m?def.monate[m-1].name:'Start')}, Monat ${m} von ${N}`}</p>
      ${lk&&m<N?`<div class="row"><button class="btn primary small" type="button" data-bank-lkmonat="${m+1}"><span class="ms" aria-hidden="true">fast_forward</span>${esc(def.monate[m].name)} für alle starten</button>${bm==null?'<span class="small muted">Danach starten die Monate nur noch für alle gemeinsam.</span>':''}</div>`:''}
      ${Array.from({length:m},(_,i)=>zeile(m-i)).join('')}</div>`;
  }

  /* ---------- Lernraum ---------- */
  async function verbinde(){
    if(stopp){stopp();stopp=null}ich=null;live=[];
    if(raum.istLehrkraft()||raum.praesentation()){const l=L();if(l&&code())stopp=l.watchBuchungen(code(),b=>{live=b;zeichneKonto()},true);return zeichneKonto()}
    if(!imRaum())return zeichneKonto();
    const l=L(),c=code(),nick=raum.sitzung().nick;
    try{
      // Gehört die IBAN schon jemand anderem (sehr selten), kommt eine Ziffer dazu
      let iban='';for(let k=0;k<5&&!iban;k++){const kand=ibanVon(l.uid+(k?':'+k:''));const v=await l.konto(c,kand);if(!v||v.uid===l.uid)iban=kand}
      if(!iban)throw new Error('Keine freie IBAN');
      const v=await l.konto(c,iban);if(!v||v.name!==nick)await l.oeffneKonto(c,iban,nick);
      ich={iban,name:nick};
      // Neuer Lernraum: neues Konto für diese Stunde, dann zu dem Monat aufholen, den die Lehrkraft gestartet hat
      if(st.raum!==c){st={...leer(),eigen:st.eigen,raum:c};sichern()}
      aufholen();sendeReaktionen();
      stopp=l.watchBuchungen(c,b=>{live=b;zeichneKonto()});
    }catch(e){console.warn('Klassenbank',e);ich=null;zeigeHinweis(`Dein Konto bei ${B} konnte nicht geöffnet werden. Du übst jetzt mit den Vorlagen.`)}
    zeichneKonto();
  }
  raum.beimVerlassen((l,c)=>ich?l.loescheKonto(c,ich.iban):null);
  const aus=raum.on(art=>{if(!box.isConnected){aus();if(stopp)stopp();clearInterval(ticker);return}if(['verbunden','ende','start','beamer'].includes(art))return verbinde();
    if(art==='raum'||art==='spieler'){if(raum.istLehrkraft()||raum.praesentation())zeichneMonitor();else if(art==='raum'&&ich){aufholen();zeichneKonto()}}});
  // Standardüberweisungen kommen nach der Verzögerung an: Anzeige regelmäßig auffrischen
  ticker=setInterval(()=>{if(!box.isConnected){clearInterval(ticker);return}if(umsaetze().some(u=>u.unterwegs))zeichneKonto()},5000);

  /* ---------- Überweisen: Eingabe, Empfängerprüfung, Freigabe ---------- */
  const feld=s=>$(s,box);
  function meldung(html,art='neu'){schritt.innerHTML=`<div class="fb ${art}">${html}</div>`;schritt.focus({preventScroll:false})}
  async function finde(iban){
    const f=fikt.find(k=>k.iban===iban);if(f)return {name:f.name,fikt:true};
    if(ich){if(iban===ich.iban)return {selbst:true};const v=await L().konto(code(),iban).catch(()=>undefined);if(v===undefined)return {fehler:true};if(v)return {name:v.name,uid:v.uid}}
    return null;
  }
  form.addEventListener('submit',async e=>{e.preventDefault();offen=null;
    const name=feld('[data-bank-name]').value.trim(),iban=ibanNorm(feld('[data-bank-ibanfeld]').value),betrag=betragAus(feld('[data-bank-betrag]').value),zweck=feld('[data-bank-zweck]').value.trim().slice(0,140),echtzeit=feld('[data-bank-echtzeit]').checked;
    const f=ibanFehler(iban);
    if(!name)return meldung('Gib den Namen des Empfängers ein.','bad');
    if(f==='pruefziffer'){erledige('pruefziffer');return meldung('<b>Diese IBAN gibt es nicht.</b> Die Prüfziffer passt nicht: Wahrscheinlich ist eine Ziffer falsch oder vertauscht. Frag beim Empfänger noch einmal nach.','bad')}
    if(f)return meldung(f==='land'?`${B} kennt nur deutsche IBANs. Sie beginnen mit DE.`:'Eine deutsche IBAN hat 22 Zeichen: DE und 20 Ziffern.','bad');
    if(!(betrag>0))return meldung('Gib einen Betrag ein, zum Beispiel 6,50.','bad');
    if(betrag>100000)return meldung(`Bei ${B} geht höchstens 1.000 € pro Überweisung.`,'bad');
    if(betrag>saldo())return meldung(`<b>Abgelehnt: nicht genug Geld auf dem Konto.</b> Du hast noch ${eur(saldo())}. Ein Schülerkonto kann man nicht überziehen.`,'bad');
    const z=await finde(iban);
    if(z&&z.selbst)return meldung('Das ist deine eigene IBAN.','bad');
    if(z&&z.fehler)return meldung(`Keine Verbindung zu ${B}. Prüfe das WLAN und versuch es noch einmal.`,'bad');
    if(!z)return meldung(`Zu dieser IBAN gibt es kein Konto bei ${B}.${ich?' Frag deinen Mitschüler, ob er sein Konto schon geöffnet hat.':''}`,'bad');
    const pr=empfaengerPruefen(name,z.name);
    offen={name,iban,betrag,zweck,echtzeit,z,pr};
    if(pr==='ok'){offen.name=z.name;return freigabe()}
    schritt.innerHTML=`<div class="fb ${pr==='fast'?'amb':'bad'} stack bank-pruef"><p><span class="ms sm" aria-hidden="true">warning</span> <b>Empfängerprüfung: ${pr==='fast'?'Der Name passt fast.':'Der Name passt nicht zur IBAN.'}</b></p>
      <p>${pr==='fast'?`Das Konto gehört: <b>${esc(z.name)}</b>`:'Prüf, ob du die richtige IBAN hast. Überweist du trotzdem und das Geld landet beim Falschen, bekommst du es von der Bank nicht zurück.'}</p>
      <div class="row">${pr==='fast'?`<button class="btn primary small" type="button" data-bank-uebernehmen><span class="ms" aria-hidden="true">check_circle</span>Namen übernehmen</button>`:''}
        <button class="btn ${pr==='fast'?'':'primary '}small" type="button" data-bank-abbrechen><span class="ms" aria-hidden="true">close</span>Abbrechen</button>
        <button class="btn small text" type="button" data-bank-trotzdem>Trotzdem überweisen</button></div></div>`;
    $('[data-bank-uebernehmen]',schritt)?.addEventListener('click',()=>{feld('[data-bank-name]').value=z.name;offen.name=z.name;offen.pr='ok';erledige('empfaenger');freigabe()});
    $('[data-bank-abbrechen]',schritt).addEventListener('click',()=>{offen=null;erledige('empfaenger');meldung('Abgebrochen. Gut so: Erst die IBAN klären, dann überweisen.','ok')});
    $('[data-bank-trotzdem]',schritt).addEventListener('click',()=>freigabe());
    schritt.focus();
  });
  function freigabe(){const o=offen;if(!o)return;
    schritt.innerHTML=`<div class="bank-tan stack"><p class="title-s"><span class="ms sm" aria-hidden="true">verified</span> Freigabe in deiner Banking-App</p>
      <p class="small">Prüf alles genau. Freigeben ist wie eine Unterschrift.</p>
      <dl class="kv small"><dt>An</dt><dd>${esc(o.name)}</dd><dt>IBAN</dt><dd class="mono">${esc(ibanSchoen(o.iban))}</dd><dt>Betrag</dt><dd class="num"><b>${eur(o.betrag)}</b></dd><dt>Zweck</dt><dd>${esc(o.zweck||'–')}</dd><dt>Art</dt><dd>${o.echtzeit?'Echtzeitüberweisung':'Standardüberweisung'}</dd></dl>
      <div class="row"><button class="btn primary" type="button" data-bank-frei><span class="ms" aria-hidden="true">verified</span>Freigeben</button><button class="btn text" type="button" data-bank-zurueck>Zurück</button></div></div>`;
    $('[data-bank-zurueck]',schritt).addEventListener('click',()=>{offen=null;schritt.innerHTML='';feld('[data-bank-name]').focus()});
    $('[data-bank-frei]',schritt).addEventListener('click',e=>{e.currentTarget.disabled=true;senden()});
    $('[data-bank-frei]',schritt).focus();
  }
  async function senden(){const o=offen;offen=null;if(!o)return;
    if(o.betrag>saldo())return meldung(`<b>Abgelehnt: nicht genug Geld auf dem Konto.</b> Du hast noch ${eur(saldo())}.`,'bad');
    if(o.z.fikt||!ich){
      st.lokal.push({id:'l'+Date.now(),t:Date.now(),name:o.z.name,iban:o.iban,betrag:-o.betrag,zweck:o.zweck,echtzeit:o.echtzeit});sichern();
    }else{
      if(st.nr>=MAX_NR)return meldung('Du hast in diesem Lernraum schon 300 Überweisungen geschickt. Mehr geht nicht.','bad');
      st.nr++;sichern();
      try{await L().ueberweise(code(),st.nr,{an:o.z.uid,vonIban:ich.iban,anIban:o.iban,vonName:ich.name,anName:o.z.name,betrag:o.betrag,zweck:o.zweck,echtzeit:o.echtzeit})}
      catch(e){console.warn(e);return meldung('Die Überweisung hat nicht geklappt. Prüfe das WLAN und versuch es noch einmal.','bad')}
    }
    erledige('zweck',o);if(o.echtzeit)erledige('echtzeit');
    form.reset();zeichneKonto();
    meldung(o.echtzeit?`<b>Erledigt!</b> ${eur(o.betrag)} sind in Sekunden bei ${esc(o.name)}. Zurückholen geht nicht mehr.`
      :`<b>Auftrag angenommen.</b> ${eur(o.betrag)} gehen an ${esc(o.name)}. Eine normale Überweisung braucht einen Bankarbeitstag, bei ${B} ${Math.round(verz/1000)} Sekunden.`,'ok');
  }
  // Vorlagen füllen Empfänger und IBAN, in der Überweisung oder im Dauerauftrag
  box.addEventListener('click',e=>{const k=e.target.closest('[data-bank-k]');if(!k)return;const f=fikt[+k.dataset.bankK],d=k.closest('[data-bank-kontakte]').dataset.bankKontakte;
    feld(d?'[data-bank-dname]':'[data-bank-name]').value=f.name;feld(d?'[data-bank-diban]':'[data-bank-ibanfeld]').value=ibanSchoen(f.iban);feld(d?'[data-bank-dbetrag]':'[data-bank-betrag]').focus()});
  $('[data-bank-kopie]',box).addEventListener('click',()=>{kopieren(ibanSchoen(ich?ich.iban:st.eigen));zeigeHinweis('IBAN kopiert')});

  /* ---------- Tabs ---------- */
  const tabs=$$('[data-bank-tab]',box);
  function tab(id,fokus){tabs.forEach(t=>{const an=t.dataset.bankTab===id;t.setAttribute('aria-selected',String(an));t.tabIndex=an?0:-1;if(an&&fokus)t.focus()});
    $$('[data-bank-seite]',box).forEach(s=>s.hidden=s.dataset.bankSeite!==id)}
  tabs.forEach((t,i)=>{t.addEventListener('click',()=>tab(t.dataset.bankTab));
    t.addEventListener('keydown',e=>{const d=e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0;if(!d)return;e.preventDefault();tab(tabs[(i+d+tabs.length)%tabs.length].dataset.bankTab,true)})});
  tab('ueberweisen');

  /* ---------- Daueraufträge und Rückgabe einer Lastschrift ---------- */
  $('[data-bank-dauerform]',box).addEventListener('submit',e=>{e.preventDefault();
    const name=feld('[data-bank-dname]').value.trim(),iban=ibanNorm(feld('[data-bank-diban]').value),betrag=betragAus(feld('[data-bank-dbetrag]').value),zweck=feld('[data-bank-dzweck]').value.trim().slice(0,140),fb=feld('[data-bank-dfb]');
    const f=fikt.find(k=>k.iban===iban);
    if(!name||!(betrag>0))return fb.textContent='Gib Empfänger und Betrag ein.';
    if(ibanFehler(iban))return fb.textContent=ibanFehler(iban)==='pruefziffer'?'Diese IBAN gibt es nicht: Die Prüfziffer passt nicht.':'Prüf die IBAN: DE und 20 Ziffern.';
    if(!f)return fb.textContent=`Daueraufträge gehen bei ${B} nur an die Vorlagen.`;
    if(empfaengerPruefen(name,f.name)!=='ok')return fb.textContent=`Empfängerprüfung: Das Konto gehört ${f.name}.`;
    st.dauer.push({name:f.name,iban,betrag,zweck});sichern();e.target.reset();fb.textContent=`Eingerichtet: Jeden Monat gehen ${eur(betrag)} an ${f.name}.`;
    erledige('dauerauftrag');zeichneDauer();
  });
  /* ---------- Kontosimulation: Monate und Events ---------- */
  const N=(def.monate||[]).length;
  const gesteuert=()=>imRaum()&&raum.bankMonat()!=null;
  // Bucht einen Monat: Einnahmen, Daueraufträge, laufende Abos, Lastschriften und Kartenzahlungen.
  // Was nicht gedeckt ist, wird nicht ausgeführt (ein Schülerkonto kann man nicht überziehen).
  function monatBuchen(){
    if(st.monat>=N)return;
    st.monat++;const m=st.monat,M=def.monate[m-1];let t=Date.now();
    const buche=(x,betrag,typ,id)=>{st.lokal.push({id:id||`m${m}-${st.lokal.length}`,t:t++,name:x.name,iban:x.iban,betrag,zweck:x.zweck,typ,monat:m})};
    const raus=(x,typ,id)=>{if(x.betrag<=saldo())buche(x,-x.betrag,typ,id);else{buche({...x,zweck:`Nicht ausgeführt, zu wenig Geld: ${x.zweck||''}`},0,'geplatzt');st.u=grenze(st.u-1)}};
    (M.ein||[]).forEach(x=>buche(x,x.betrag,'ein'));
    st.dauer.forEach(d=>raus(d,'dauer'));
    st.abos.forEach(a=>{if(a.mal>0){a.mal--;raus(a,'lastschrift')}});st.abos=st.abos.filter(a=>a.mal>0);
    (M.aus||[]).forEach(x=>raus(x,x.typ==='karte'?'karte':'lastschrift',x.id?`m${m}-${x.id}`:undefined));
    sichern();
  }
  function reagiere(m,i){const M=def.monate[m-1],w=M&&M.event.wahl[i];if(!w||st.ev[m])return;
    st.ev[m]=BUCHST[i];st.s=grenze(st.s+(w.s||0));st.u=grenze(st.u+(w.u||0));
    if(w.rueck)zurueck(`m${m}-${w.rueck}`,true);
    if(w.buchung){const b=w.buchung,betrag=b.alles?-Math.min(-b.betrag,Math.max(0,saldo())):b.betrag;
      st.lokal.push({id:`ev${m}`,t:Date.now(),name:b.name,betrag,zweck:b.zweck,typ:'event',monat:m})}
    if(w.abo)st.abos.push({...w.abo,mal:w.abo.mal??99});
    if(w.auftrag)erledige(w.auftrag);
    sichern();sendeReaktionen();zeichneKonto();
    const fb=$(`[data-bank-ev="${m}"] .fb`,box);if(fb)fb.focus();
  }
  // Im Lernraum: Reaktionen als Buchstaben an die Lehrkraft (ein Zeichen pro Monat, „-“ = noch keine)
  const reaktionen=()=>Array.from({length:N},(_,i)=>st.ev[i+1]||'-').join('');
  function sendeReaktionen(){if(N&&imRaum())raum.sendeBank(reaktionen())}
  // Gesteuert: bis zu dem Monat aufholen, den die Lehrkraft gestartet hat
  function aufholen(){if(!N||!gesteuert())return false;let neu=false;while(st.monat<Math.min(N,raum.bankMonat())){monatBuchen();neu=true}return neu}
  function zeichneSim(){if(!N)return;
    const m=st.monat,offen=m>0&&!st.ev[m],fertig=m>=N&&!offen,g=gesteuert();
    $('[data-bank-mname]',box).textContent=m?`${def.monate[m-1].name} · Monat ${m} von ${N}`:`Start · noch ${N} Monate`;
    const knopf=$('[data-bank-monat]',box),hw=$('[data-bank-mhinweis]',box);
    knopf.hidden=g||m>=N;knopf.disabled=offen;
    if(m<N)$('[data-bank-mtext]',box).textContent=`${def.monate[m].name} starten`;
    hw.hidden=!(g&&m<N)&&!(offen&&!g);
    hw.textContent=g?'Den nächsten Monat startet eure Lehrkraft.':'Reagier erst auf das, was diesen Monat passiert ist.';
    // Events: alle ohne Reaktion und das aus dem aktuellen Monat
    const ev=[];for(let i=1;i<=m;i++)if(!st.ev[i]||i===m)ev.push(i);
    neuZeichnenEv(ev);
    zeichneWerte(fertig);
  }
  function neuZeichnenEv(liste){
    const el=$('[data-bank-events]',box),html=liste.map(i=>{const E=def.monate[i-1].event,r=st.ev[i],w=r?E.wahl[BUCHST.indexOf(r)]:null;
      return `<div class="bank-event${r?' fertig':''}" data-bank-ev="${i}"><p class="bank-ev-kopf small"><span class="ms sm" aria-hidden="true">${E.icon||'notifications'}</span><b>${esc(E.kanal||'')}</b><span class="muted">${esc(def.monate[i-1].name)}</span></p>
        <p class="title-s">${esc(E.titel)}</p><p>${esc(E.text)}</p>
        ${w?`<div class="fb ${w.art}" tabindex="-1"><b>${esc(w.t)}.</b> ${esc(w.folge)}</div>`
          :`<p class="small"><b>${esc(E.frage||'Was tust du?')}</b></p><div class="bank-ev-wahl" role="group" aria-label="${esc(E.frage||'Was tust du?')}">${E.wahl.map((x,j)=>`<button class="btn" type="button" data-bank-w="${i}:${j}">${esc(x.t)}</button>`).join('')}</div>`}</div>`}).join('');
    if(el._html!==html){el.innerHTML=html;el._html=html}
  }
  function zeichneWerte(fertig){
    const el=$('[data-bank-werte]',box);if(!el)return;
    const balken=(t,icon,v)=>`<div class="bank-wert"><p class="small row"><span class="ms sm" aria-hidden="true">${icon}</span><b>${t}</b><span class="num muted">${v} von 10</span></p><div class="bank-balken" aria-hidden="true"><span style="width:${v*10}%"></span></div></div>`;
    const plus=saldo()-def.start;
    el.innerHTML=`<p class="title-s">${fertig?'Dein Halbjahr bei '+esc(def.name):'So läuft dein Konto'}</p>
      ${balken('Sicherheit','shield',st.s)}${balken('Überblick','visibility',st.u)}
      ${fertig?`<div class="fb ${st.s+st.u>=15?'ok':st.s+st.u>=10?'amb':'bad'}"><p><b>Kontostand ${eur(saldo())}</b> (${vorz(plus)} seit dem Start).</p><p>${st.s+st.u>=15?'Stark: Du hast Betrug erkannt, Abbuchungen geprüft und den Überblick behalten.':st.s+st.u>=10?'Ganz gut, aber an manchen Stellen hat es dich Geld gekostet. Schau in deine Umsätze.':'Das Halbjahr war teuer. Schau in deine Umsätze, was schiefging, und spiel noch einmal.'}</p></div>`:''}`;
  }
  $('[data-bank-monat]',box)?.addEventListener('click',()=>{if(gesteuert()||(st.monat>0&&!st.ev[st.monat]))return;
    monatBuchen();zeichneKonto();const e=$(`[data-bank-ev="${st.monat}"]`,box);if(e){const b=$('button',e);if(b)b.focus()}});
  box.addEventListener('click',e=>{const b=e.target.closest('[data-bank-w]');if(!b)return;const [m,i]=b.dataset.bankW.split(':').map(Number);reagiere(m,i)});
  function zurueck(id,still){const u=st.lokal.find(x=>x.id===id);if(!u||u.zurueck||u.typ!=='lastschrift')return;u.zurueck=true;
    st.lokal.push({id:'r'+id,t:Date.now(),name:u.name,betrag:-u.betrag,zweck:`Rückgabe: ${u.zweck}`,typ:'rueck',monat:u.monat});sichern();
    erledige('lastschrift');if(still)return;zeichneKonto();tab('umsaetze');zeigeHinweis(`${eur(-u.betrag)} sind zurück auf deinem Konto.`)}
  $('[data-bank-neu]',box).addEventListener('click',()=>{const eigen=st.eigen,r=st.raum,nr=st.nr;st={...leer(),eigen,raum:r,nr};sichern();schritt.innerHTML='';
    aufholen();sendeReaktionen();zeichneKonto()});

  verbinde();
}
