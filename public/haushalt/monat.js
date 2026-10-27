// Benjamins Monat: Haushaltsspiel über vier Monate. Pro Monat Entscheidungen (Verträge, variable und einmalige Ausgaben),
// ein Ereignis und die Monatsabrechnung wie ein Kontoauszug. Verträge laufen mit ihrer Laufzeit weiter, ein Minus läuft
// als verzinster Dispo in den nächsten Monat. Am Ende: Sparquote, Wohnanteil, teuerster Vertrag und ein Blick ein Jahr voraus.
//
//   haushaltsspiel(def)   HTML, Inhalte aus daten.js (BENJAMIN); bindHaushaltsspiel(root) macht es interaktiv
// Im Lernraum: Die Lehrkraft startet die Monate für alle (Raumfeld bankMonat wie bei der Kontosimulation in bank.js).
// Jedes Gerät schickt nur Buchstaben (Feld bk): Zeichen 1 bis 4 der Stand nach jedem Monat (a = im Plus, b = knapp, 0 bis 49 €,
// c = im Minus), Zeichen 5 bis 8 die Reaktion auf das Ereignis (a bis c). Die Lehrkraft sieht den Klassenspiegel
// (Anzahlen, keine Spitznamen) statt des Spiels. Gespeichert wird auf dem Gerät (<speicher>-monat-<id>).
import { $, $$, esc, fmt, store, zeigeHinweis } from '../shared/js/ui.js';
import { raum, registriere } from '../shared/js/lernraum.js';

const DEFS=new Map();
const BUCHST='abc';
export const rund=x=>Math.round(x*100)/100;
export const geld=(x,d=2)=>(x<-0.004?'−':'')+fmt(Math.abs(x),d)+' €';
const vz=x=>(x>0.004?'+':'')+geld(x);
const ART={fix:'Fixe Ausgabe',variabel:'Variable Ausgabe',einmal:'Einmalige Ausgabe',kuendigen:'Verträge prüfen'};
const KEINE_KONSUM=['Sparen','Kaution','Kredite','Zinsen'];

export function haushaltsspiel(def){
  DEFS.set(def.id,def);
  registriere({id:def.id,frage:def.titel,loesung:def.merksaetze});
  return `<section class="aufgabe hh-spiel" data-hh="${def.id}">
    <p class="aufgabe-kopf"><span class="ms sm" aria-hidden="true">calendar_month</span>Benjamins Monat</p>
    <div class="stack" data-hh-monitor hidden></div>
    <div class="hh-grid" data-hh-app>
      <div class="stack hh-buehne" data-hh-buehne></div>
      <aside class="stack hh-seite" aria-label="Benjamins Konto">
        <div class="hh-konto stack" data-hh-konto></div>
        <div class="stack" data-hh-vertraege></div>
        <div class="row"><button class="btn small text" type="button" data-hh-neu><span class="ms" aria-hidden="true">restart_alt</span>Neu anfangen</button></div>
      </aside>
    </div></section>`;
}

/* ---------- Rechnen ---------- */
const leer=def=>({monat:0,phase:'',schritt:0,wahl:{},ev:{},konto:def.start,spar:0,vertraege:[],offen:[],buch:[],kfb:null,raum:''});
const aktiv=(v,m)=>v.ab<=m&&(v.bis==null||m<=v.bis)&&(v.ende==null||m<=v.ende);
/** Kontext für Texte und Beträge, die vom Spielstand abhängen: k.o.wohnen = gewählte Wohnung, k.hat('haftpflicht') */
function kontext(def,st){
  const o={};def.monate.forEach((M,i)=>M.entscheidungen.forEach(D=>{const w=st.wahl[i+1]&&st.wahl[i+1][D.id];if(D.optionen&&w!=null)o[D.id]=D.optionen[w]}));
  return {o,hat:id=>st.vertraege.some(v=>v.id===id&&aktiv(v,st.monat)),spar:st.spar};
}
const wert=(x,k)=>typeof x==='function'?x(k):x;
/** Monatsabrechnung für Monat m: Einnahmen, fixe und variable Ausgaben, Sparen, Dispozinsen */
function abrechnung(def,st,m,offen,kontoVor){
  const ein=def.ein.map(x=>({t:x.t,b:x.betrag})).concat(offen.filter(x=>x.b<0).map(x=>({t:x.t,b:-x.b})));
  const vs=st.vertraege.filter(v=>aktiv(v,m)&&v.betrag>0);
  const fix=def.pflicht.map(x=>({t:x.t,b:x.betrag,kat:x.kat})).concat(vs.filter(v=>!v.spar).map(v=>({t:v.name,b:v.betrag,kat:v.kat,lz:v.bis!=null?`${m-v.ab+1}/${v.bis-v.ab+1}`:''})));
  const vari=offen.filter(x=>x.b>0).map(x=>({t:x.t,b:x.b,kat:x.kat}));
  const spar=vs.filter(v=>v.spar).reduce((s,v)=>s+v.betrag,0);
  const E=ein.reduce((s,x)=>s+x.b,0),F=fix.reduce((s,x)=>s+x.b,0),V=vari.reduce((s,x)=>s+x.b,0);
  const z=rund(kontoVor+E-F-V-spar);
  const zins=z<0?rund(Math.min(-z,def.dispo)*def.zins/1200+Math.max(0,-z-def.dispo)*def.zinsUeber/1200):0;
  if(zins)vari.push({t:'Dispozinsen',b:zins,kat:'Zinsen'});
  return {m,ein,fix,vari,spar,E:rund(E),F:rund(F),V:rund(V+zins),saldo:rund(E-F-V-zins-spar),kontoVor,konto:rund(z-zins),zins};
}
const status=konto=>konto>=50?'a':konto>=0?'b':'c';

export function bindHaushaltsspiel(root){
  $$('[data-hh]',root).forEach(box=>{if(box.dataset.gebunden)return;box.dataset.gebunden='1';binde(box)});
}

function binde(box){
  const def=DEFS.get(box.dataset.hh);if(!def)return;
  const N=def.monate.length,key=`${raum.speicher()}-monat-${def.id}`;
  let st={...leer(def),...(store(key)||{})};
  const sichern=()=>store(key,st);
  const code=()=>raum.sitzung()&&raum.sitzung().code;
  const imRaum=()=>raum.istSchueler()&&!!raum.live()&&!!code();
  const gesteuert=()=>imRaum()&&raum.bankMonat()!=null;
  const darfStarten=()=>st.monat<N&&(!gesteuert()||st.monat<raum.bankMonat());
  const buehne=$('[data-hh-buehne]',box);
  const M=()=>def.monate[st.monat-1];
  const fokus=sel=>{const el=$(sel,buehne);if(el){if(!el.matches('button'))el.tabIndex=-1;el.focus({preventScroll:false})}};

  /* ---------- Zug: Monat starten, entscheiden, Ereignis, abrechnen ---------- */
  function starte(){if(!darfStarten()||(st.monat&&st.phase!=='fertig'))return;
    st.monat++;st.phase='entscheiden';st.schritt=0;st.offen=[];st.kfb=null;st.wahl[st.monat]={};sichern();zeichne();fokus('[data-hh-titel]')}
  // Zahlung: zuerst vom Sparkonto, wenn ausSpar
  function zahle(t,b,kat,ausSpar){
    if(ausSpar&&b>0&&st.spar>0){const von=rund(Math.min(st.spar,b));st.spar=rund(st.spar-von);b=rund(b-von);
      st.offen.push({t:`${t} (${geld(von)} vom Sparkonto)`,b:0,kat,sparVon:von})}
    if(b)st.offen.push({t,b:rund(b),kat});
  }
  function vertrag(id,v,ab){st.vertraege=st.vertraege.filter(x=>x.id!==id);
    st.vertraege.push({id,name:v.name,kat:v.kat,betrag:rund(v.betrag),ab,bis:v.laufzeit?ab+v.laufzeit-1:null,frist:v.laufzeit?null:(v.frist??1),laufzeit:v.laufzeit||0,spar:!!v.spar})}
  function waehle(i){const D=M().entscheidungen[st.schritt],o=D.optionen[i],m=st.monat;if(!o)return;
    st.wahl[m][D.id]=i;
    if(D.art==='fix'&&o.betrag>0)vertrag(o.id||D.id,{name:`${D.kat}: ${o.t}`,kat:D.kat,betrag:o.betrag,laufzeit:o.laufzeit,frist:D.frist,spar:D.spar},m);
    if(D.art==='fix'&&o.einmal)zahle(o.t,o.einmal,D.kat);
    if(D.art!=='fix'&&o.betrag)zahle(D.art==='variabel'?D.kat:o.t,o.betrag,D.kat,o.ausSpar);
    if(o.vertrag)vertrag(`${D.id}-v`,o.vertrag,m+1);
    weiter();
  }
  function kuendige(ids){const m=st.monat,fb=[];
    st.vertraege.filter(v=>ids.includes(v.id)&&aktiv(v,m)).forEach(v=>{
      if(v.kat==='Kredite'||v.kat==='Kaution')fb.push({t:v.name,art:'bad',e:'Ein Kredit lässt sich nicht kündigen. Du zahlst, bis alles getilgt ist.'});
      else if(v.bis!=null&&v.bis>m)fb.push({t:v.name,art:'bad',e:`Geht nicht: Die Laufzeit läuft noch ${v.bis-m} Monate. Kündigen kannst du erst zum Ende.`});
      else{v.ende=m+Math.max(0,(v.frist||1)-1);fb.push({t:v.name,art:'ok',e:v.frist>1?`Gekündigt. Wegen der Kündigungsfrist zahlst du noch ${v.frist-1} Monate weiter.`:'Gekündigt. Ab nächstem Monat ist die Ausgabe weg.'})}});
    st.wahl[m].kuendigen=ids;st.kfb=fb;sichern();zeichne();fokus('[data-hh-kfb]');
  }
  function weiter(){st.schritt++;if(st.schritt>=M().entscheidungen.length)st.phase='ereignis';st.kfb=null;sichern();zeichne();
    fokus(st.phase==='ereignis'?'[data-hh-ev] .title-s':'[data-hh-frage]')}
  function reagiere(i){const m=st.monat,E=M().ereignis,k=kontext(def,st);let w=E.wahl[i];if(!w||st.ev[m]!=null)return;
    if(w.ohne&&!k.hat(w.ohne.vertrag))w={...w,...w.ohne};
    st.ev[m]=i;
    const b=wert(w.einmal,k);if(b)zahle(w.name||E.titel,b,w.kat||'Sonstiges',w.ausSpar);
    const v=wert(w.vertrag,k);if(v)vertrag(`ev${m}`,v,v.kat==='Kaution'?m:m+1);
    st.evArt={...(st.evArt||{}),[m]:w.art};st.evFolge={...(st.evFolge||{}),[m]:w.folge};
    sichern();zeichne();sende();fokus('[data-hh-ev] .fb');
  }
  function abrechnen(){if(st.phase!=='ereignis'||st.ev[st.monat]==null)return;
    const a=abrechnung(def,st,st.monat,st.offen,st.konto);
    st.spar=rund(st.spar+a.spar);st.konto=a.konto;a.sparstand=st.spar;st.buch[st.monat-1]=a;st.phase='fertig';
    sichern();sende();zeichne();fokus('[data-hh-auszug]');
  }

  /* ---------- Lernraum ---------- */
  const zeichen=()=>Array.from({length:N},(_,i)=>st.buch[i]?status(st.buch[i].konto):'-').join('')+Array.from({length:N},(_,i)=>st.ev[i+1]!=null?BUCHST[st.ev[i+1]]:'-').join('');
  function sende(){if(imRaum())raum.sendeBank(zeichen())}
  function verbinde(){
    const lk=raum.istLehrkraft()||raum.praesentation();
    $('[data-hh-app]',box).hidden=lk;$('[data-hh-monitor]',box).hidden=!lk;
    if(lk)return zeichneMonitor();
    if(imRaum()&&st.raum!==code()){st={...leer(def),raum:code()};sichern()}
    sende();zeichne();
  }
  const aus=raum.on(art=>{if(!box.isConnected){aus();return}
    if(['verbunden','ende','start','beamer'].includes(art))return verbinde();
    if(art==='raum'||art==='spieler'){if(raum.istLehrkraft()||raum.praesentation())zeichneMonitor();else if(art==='raum')zeichne()}});

  /* ---------- Anzeige ---------- */
  const preis=(o,D)=>{const t=[];
    if(o.betrag&&D.art==='fix')t.push(`<b class="num">${geld(o.betrag,0)}</b> im Monat`);
    else if(o.betrag)t.push(`<b class="num">${geld(o.betrag,0)}</b>${D.art==='variabel'?' diesen Monat':' einmalig'}`);
    if(o.einmal)t.push(`<b class="num">${geld(o.einmal,0)}</b> einmalig`);
    if(o.vertrag)t.push(`<b class="num">${o.vertrag.laufzeit} × ${geld(o.vertrag.betrag,0)}</b>`);
    if(!t.length)t.push('<b>0 €</b>');return t.join(' + ')};
  const lzChip=o=>o.laufzeit?`<span class="pill amb"><span class="ms" aria-hidden="true">lock_clock</span>${o.laufzeit} Monate</span>`:'';
  function zeichne(){
    if(raum.istLehrkraft()||raum.praesentation())return;
    zeichneKonto();zeichneVertraege();
    const m=st.monat;
    if(!m)return zeichneStart();
    if(st.phase==='entscheiden')return zeichneEntscheidung();
    if(st.phase==='ereignis')return zeichneEreignis();
    if(st.phase==='fertig'&&m>=N&&st.ende)return zeichneEnde();
    return zeichneAuszug();
  }
  function kopf(){const m=st.monat,Mo=M();
    return `<div class="hh-kopf"><p class="eyebrow">Monat ${m} von ${N}</p><p class="title-l" data-hh-titel>${esc(Mo.name)}: ${esc(Mo.titel)}</p>
      <ol class="hh-schritte" aria-label="Fortschritt im ${esc(Mo.name)}">${Mo.entscheidungen.map((D,i)=>`<li class="${i<st.schritt||st.phase!=='entscheiden'?'ok':i===st.schritt?'jetzt':''}"><span class="ms sm" aria-hidden="true">${D.icon}</span><span class="sr-only">${esc(D.kat)}</span></li>`).join('')}
        <li class="${st.phase==='fertig'?'ok':st.phase==='ereignis'?'jetzt':''}"><span class="ms sm" aria-hidden="true">bolt</span><span class="sr-only">Ereignis</span></li>
        <li class="${st.phase==='fertig'?'jetzt':''}"><span class="ms sm" aria-hidden="true">receipt_long</span><span class="sr-only">Abrechnung</span></li></ol></div>`}
  function zeichneStart(){
    const E=def.ein.reduce((s,x)=>s+x.betrag,0),g=gesteuert();
    buehne.innerHTML=`<div class="hh-start stack"><div class="hh-figur"><span class="ms" aria-hidden="true">face</span><div><p class="title-l">Benjamin, 18</p><p class="small">Azubi zum Kfz-Mechatroniker in Jena, 2. Lehrjahr. Gerade zieht er von zu Hause aus.</p></div></div>
      <dl class="hh-ein">${def.ein.map(x=>`<dt>${esc(x.t)}</dt><dd class="num">${geld(x.betrag)}</dd>`).join('')}<dt><b>Einnahmen pro Monat</b></dt><dd class="num"><b>${geld(E)}</b></dd>
        <dt>Auf dem Girokonto</dt><dd class="num">${geld(def.start)}</dd><dt>Dispo</dt><dd class="num">bis ${geld(def.dispo,0)} zu ${def.zins} % Zinsen im Jahr</dd></dl>
      <p>Du entscheidest für Benjamin: ${N} Monate, jeden Monat drei oder vier Entscheidungen und ein Ereignis. Verträge laufen weiter, ein Minus auch.</p>
      <div class="row">${darfStarten()?`<button class="btn primary" type="button" data-hh-start><span class="ms" aria-hidden="true">play_arrow</span>${esc(def.monate[0].name)} starten</button>`:''}
        ${g&&!darfStarten()?'<p class="small muted"><span class="ms sm" aria-hidden="true">hourglass_top</span> Den ersten Monat startet eure Lehrkraft.</p>':''}</div></div>`;
    $('[data-hh-start]',buehne)?.addEventListener('click',starte);
  }
  function zeichneEntscheidung(){
    const D=M().entscheidungen[st.schritt];
    if(D.art==='kuendigen')return zeichneKuendigen(D);
    buehne.innerHTML=`${kopf()}${st.schritt===0?`<p class="hh-intro">${esc(M().text)}</p>`:''}
      <div class="stack hh-frage"><p class="small hh-art"><span class="ms sm" aria-hidden="true">${D.icon}</span>${esc(D.kat)} · ${ART[D.art]}</p>
        <p class="title-m" data-hh-frage>${esc(D.frage)}</p>${D.text?`<p class="small">${esc(D.text)}</p>`:''}
        <div class="hh-optionen" role="group" aria-label="${esc(D.frage)}">${D.optionen.map((o,i)=>`<button class="hh-opt" type="button" data-hh-o="${i}">
          <span class="ms" aria-hidden="true">${o.icon||D.icon}</span><span class="hh-opt-text"><b>${esc(o.t)}</b>${o.sub?`<span class="small">${esc(o.sub)}</span>`:''}
          <span class="hh-preis small">${preis(o,D)} ${lzChip(o)}</span></span></button>`).join('')}</div></div>`;
    $$('[data-hh-o]',buehne).forEach(b=>b.addEventListener('click',()=>waehle(+b.dataset.hhO)));
  }
  function zeichneKuendigen(D){
    const m=st.monat,vs=st.vertraege.filter(v=>aktiv(v,m)&&v.betrag>0&&(v.ende==null||v.ende>=m));
    buehne.innerHTML=`${kopf()}<p class="hh-intro">${esc(M().text)}</p>
      <div class="stack hh-frage"><p class="small hh-art"><span class="ms sm" aria-hidden="true">${D.icon}</span>${esc(D.kat)}</p>
        <p class="title-m" data-hh-frage>${esc(D.frage)}</p><p class="small">${esc(D.text)}</p>
        ${st.kfb?`<ul class="hh-kfb stack" data-hh-kfb>${st.kfb.length?st.kfb.map(f=>`<li class="fb ${f.art}"><b>${esc(f.t)}:</b> ${esc(f.e)}</li>`).join(''):'<li class="fb neu">Du hast nichts gekündigt. Alle Verträge laufen weiter.</li>'}</ul>
          <div class="row"><button class="btn primary" type="button" data-hh-weiter><span class="ms" aria-hidden="true">arrow_forward</span>Weiter</button></div>`
        :`<fieldset class="hh-kliste"><legend class="sr-only">Laufende Verträge</legend>${vs.map(v=>`<label class="test-opt"><input type="checkbox" value="${esc(v.id)}"><span><b>${esc(v.name)}</b> · <span class="num">${geld(v.betrag)}</span> im Monat<br><span class="small muted">${v.kat==='Kredite'||v.kat==='Kaution'?'Rückzahlung':v.bis!=null?`Laufzeit bis Monat ${v.bis}, noch ${v.bis-m} Monate`:v.frist>1?`Kündigungsfrist ${v.frist} Monate`:'monatlich kündbar'}</span></span></label>`).join('')}</fieldset>
          <div class="row"><button class="btn primary" type="button" data-hh-kuend><span class="ms" aria-hidden="true">fact_check</span>Auswahl kündigen</button></div>`}</div>`;
    $('[data-hh-kuend]',buehne)?.addEventListener('click',()=>kuendige($$('input:checked',buehne).map(x=>x.value)));
    $('[data-hh-weiter]',buehne)?.addEventListener('click',weiter);
  }
  function zeichneEreignis(){
    const m=st.monat,E=M().ereignis,k=kontext(def,st),r=st.ev[m];
    buehne.innerHTML=`${kopf()}<div class="bank-event hh-ev" data-hh-ev><p class="bank-ev-kopf small"><span class="ms sm" aria-hidden="true">${E.icon}</span><b>${esc(E.kanal)}</b><span class="muted">${esc(M().name)}</span></p>
      <p class="title-s">${esc(E.titel)}</p><p>${esc(wert(E.text,k))}</p>
      ${r!=null?`<div class="fb ${st.evArt[m]}"><b>${esc(E.wahl[r].t)}.</b> ${esc(st.evFolge[m])}</div>
        <div class="row"><button class="btn primary" type="button" data-hh-abrechnen><span class="ms" aria-hidden="true">receipt_long</span>${esc(M().name)} abrechnen</button></div>`
      :`<p class="small"><b>${esc(E.frage)}</b></p><div class="bank-ev-wahl" role="group" aria-label="${esc(E.frage)}">${E.wahl.map((w,j)=>`<button class="btn" type="button" data-hh-w="${j}">${esc(w.t)}</button>`).join('')}</div>`}</div>`;
    $$('[data-hh-w]',buehne).forEach(b=>b.addEventListener('click',()=>reagiere(+b.dataset.hhW)));
    $('[data-hh-abrechnen]',buehne)?.addEventListener('click',abrechnen);
  }
  const zeilen=(l,minus)=>l.map(x=>`<tr><td>${esc(x.t)}${x.lz?` <span class="small muted">(Rate ${x.lz})</span>`:''}</td><td class="num">${minus?'−':'+'}${geld(x.b)}</td></tr>`).join('');
  function auszugHTML(a,mname){
    return `<div class="hh-auszug" data-hh-auszug><p class="title-m"><span class="ms" aria-hidden="true">receipt_long</span> Abrechnung ${esc(mname)}</p>
      <div class="tbl-wrap"><table><caption class="sr-only">Abrechnung ${esc(mname)}</caption>
        <tbody><tr><th colspan="2">Einnahmen</th></tr>${zeilen(a.ein)}
        <tr><th colspan="2">Fixe Ausgaben</th></tr>${zeilen(a.fix,true)}
        <tr><th colspan="2">Variable und einmalige Ausgaben</th></tr>${a.vari.length?zeilen(a.vari,true):'<tr><td colspan="2" class="small muted">keine</td></tr>'}
        ${a.spar?`<tr><th colspan="2">Sparen</th></tr><tr><td>Dauerauftrag aufs Tagesgeld</td><td class="num">−${geld(a.spar)}</td></tr>`:''}</tbody>
        <tfoot><tr><td>Überschuss oder Minus im Monat</td><td class="num"><b>${vz(a.saldo)}</b></td></tr>
          <tr><td>Kontostand vorher</td><td class="num">${geld(a.kontoVor)}</td></tr>
          <tr class="hh-summe ${status(a.konto)}"><td><b>Kontostand nachher</b></td><td class="num"><b>${geld(a.konto)}</b></td></tr></tfoot></table></div></div>`;
  }
  function bewertung(a){const k=a.konto;
    if(k<-def.dispo)return ['bad',`<b>Über den Dispo hinaus!</b> Die Bank verlangt jetzt ${def.zinsUeber} % Zinsen und kann Lastschriften platzen lassen. Hol dir Hilfe: Die Schuldnerberatung ist kostenlos.`];
    if(k<0)return ['bad',`<b>Im Dispo.</b> Du zahlst ${geld(a.zins)} Zinsen für diesen Monat${a.spar?`, und gleichzeitig sparst du ${geld(a.spar)}. Sparen mit Schulden ist ein teures Hobby`:''}. Im nächsten Monat geht es mit Minus los.`];
    if(k<50)return ['amb','<b>Knapp.</b> Das Konto ist gerade noch im Plus. Die nächste unerwartete Rechnung bringt dich in den Dispo.'];
    return ['ok',`<b>Im Plus.</b> ${a.saldo<0?'Aber diesen Monat hast du mehr ausgegeben als eingenommen.':'Dein Haushaltsplan geht auf.'}`];
  }
  function zeichneAuszug(){
    const m=st.monat,a=st.buch[m-1],[art,txt]=bewertung(a),g=gesteuert(),letzter=m>=N;
    buehne.innerHTML=`${kopf()}${auszugHTML(a,M().name)}<div class="fb ${art}">${txt}</div>
      <div class="row">${letzter?`<button class="btn primary" type="button" data-hh-ende><span class="ms" aria-hidden="true">insights</span>Zur Auswertung</button>`
        :darfStarten()?`<button class="btn primary" type="button" data-hh-start><span class="ms" aria-hidden="true">fast_forward</span>${esc(def.monate[m].name)} starten</button>`
        :g?`<p class="small muted" data-hh-warten><span class="ms sm" aria-hidden="true">hourglass_top</span> Den ${esc(def.monate[m].name)} startet eure Lehrkraft.</p>`:''}</div>`;
    $('[data-hh-start]',buehne)?.addEventListener('click',starte);
    $('[data-hh-ende]',buehne)?.addEventListener('click',()=>{st.ende=true;sichern();zeichne();fokus('[data-hh-titel]')});
  }

  /* ---------- Auswertung und Blick in die Zukunft ---------- */
  function zukunft(){
    const essen=st.buch.map((a,i)=>a.vari.filter(x=>x.kat==='Lebensmittel und Alltag').reduce((s,x)=>s+x.b,0));
    const var_=essen.reduce((s,x)=>s+x,0)/Math.max(1,essen.length);
    let konto=st.konto;const pkt=[konto];
    for(let t=N+1;t<=N+12;t++){const a=abrechnung(def,st,t,[{t:'Lebensmittel und Alltag',b:var_,kat:'Lebensmittel und Alltag'}],konto);konto=a.konto;pkt.push(konto)}
    return pkt;
  }
  function zukunftSVG(pkt){
    const W=600,H=220,p=28,lo=Math.min(-def.dispo-100,...pkt),hi=Math.max(500,...pkt);
    const x=i=>p+i*(W-2*p)/(pkt.length-1),y=v=>H-p-(v-lo)/(hi-lo)*(H-2*p);
    const namen=['Jetzt',...def.zukunft];
    return `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="Kontostand in den nächsten zwölf Monaten: von ${geld(pkt[0],0)} auf ${geld(pkt[pkt.length-1],0)}">
      <rect class="hh-dispozone" x="${p}" y="${y(0)}" width="${W-2*p}" height="${Math.max(0,y(lo)-y(0))}"/>
      <line class="hh-null" x1="${p}" x2="${W-p}" y1="${y(0)}" y2="${y(0)}"/><text class="hh-achse" x="${p+4}" y="${y(0)-6}">0 €</text>
      <line class="hh-grenze" x1="${p}" x2="${W-p}" y1="${y(-def.dispo)}" y2="${y(-def.dispo)}"/><text class="hh-achse" x="${p+4}" y="${y(-def.dispo)-6}">Dispo-Grenze −${def.dispo} €</text>
      <polyline class="hh-linie" points="${pkt.map((v,i)=>`${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')}"/>
      ${pkt.map((v,i)=>i%3===0||i===pkt.length-1?`<circle class="hh-punkt ${v<0?'minus':''}" cx="${x(i)}" cy="${y(v)}" r="5"/><text class="hh-achse" x="${x(i)}" y="${H-6}" text-anchor="middle">${namen[i]}</text>`:'').join('')}</svg>`;
  }
  function zeichneEnde(){
    const B=st.buch,E=B.reduce((s,a)=>s+def.ein.reduce((t,x)=>t+x.betrag,0),0),S=B.reduce((s,a)=>s+a.spar,0);
    const alle=B.flatMap(a=>[...a.fix,...a.vari]),konsum=alle.filter(x=>!KEINE_KONSUM.includes(x.kat)).reduce((s,x)=>s+x.b,0);
    const wohnen=alle.filter(x=>x.kat==='Wohnen').reduce((s,x)=>s+x.b,0),zinsen=B.reduce((s,a)=>s+a.zins,0);
    const quote=Math.round(S/E*100),wq=Math.round(wohnen/konsum*100);
    const teuer=st.vertraege.filter(v=>!v.spar&&v.kat!=='Kaution').map(v=>({...v,ges:v.betrag*(v.laufzeit||12)})).sort((a,b)=>b.ges-a.ges)[0];
    const minus=B.filter(a=>a.konto<0).length,pkt=zukunft(),spaeter=pkt[pkt.length-1];
    const titel=st.konto<0?'Benjamin steckt im Dispo':st.konto<50?'Gerade so geschafft':'Benjamin hat seinen Haushalt im Griff';
    buehne.innerHTML=`<div class="stack hh-ende"><p class="eyebrow">Auswertung nach ${N} Monaten</p><p class="title-l" data-hh-titel>${titel}</p>
      <div class="hh-kacheln">
        <div class="hh-kachel ${status(st.konto)}"><span class="small">Girokonto</span><b class="num">${geld(st.konto,0)}</b></div>
        <div class="hh-kachel"><span class="small">Sparkonto</span><b class="num">${geld(st.spar,0)}</b></div>
        <div class="hh-kachel"><span class="small">Sparquote</span><b class="num">${quote} %</b><span class="small">vom Einkommen gespart</span></div>
        <div class="hh-kachel"><span class="small">Wohnen</span><b class="num">${wq} %</b><span class="small">deiner Ausgaben (Deutschland: 36 %)</span></div>
        ${zinsen?`<div class="hh-kachel c"><span class="small">Dispozinsen</span><b class="num">${geld(zinsen)}</b><span class="small">einfach weg</span></div>`:''}</div>
      ${teuer?`<div class="fb amb"><b>Deine teuerste Entscheidung:</b> ${esc(teuer.name)} – ${geld(teuer.betrag,0)} im Monat, ${teuer.laufzeit?`über ${teuer.laufzeit} Monate zusammen <b class="num">${geld(teuer.ges,0)}</b>`:`im Jahr <b class="num">${geld(teuer.ges,0)}</b>`}.</div>`:''}
      <section class="stack"><p class="title-s"><span class="ms sm" aria-hidden="true">show_chart</span> Blick in die Zukunft: Wenn Benjamin so weitermacht …</p>
        <div class="chart hh-chart">${zukunftSVG(pkt)}</div>
        <p class="small">Mit denselben Verträgen und Einkäufen steht sein Girokonto in einem Jahr bei <b class="num">${geld(spaeter,0)}</b>. ${spaeter<-def.dispo?'Das ist die Schuldenspirale: Zinsen auf Zinsen, und das Minus wächst von allein.':spaeter<0?'Das Minus frisst jeden Monat Zinsen.':'Ohne neue Überraschungen wächst sein Polster.'} Was ausläuft oder gekündigt ist, fällt weg.</p></section>
      ${minus>=2||st.konto<-300?`<div class="fb bad hh-hilfe"><p><span class="ms sm" aria-hidden="true">support_agent</span> <b>Hilfe holen ist kein Scheitern.</b> Schuldnerberatungen von Caritas, Diakonie, AWO, Verbraucherzentrale oder der Stadt helfen kostenlos und vertraulich: Überblick schaffen, mit Gläubigern verhandeln, einen Plan machen.</p></div>`:''}
      <section class="panel stack"><p class="title-s"><span class="ms sm" aria-hidden="true">lightbulb</span> Drei Regeln für deinen Haushalt</p><ol class="hh-regeln">${def.merksaetze.map(s=>`<li>${esc(s)}</li>`).join('')}</ol></section>
      <details class="hilfe"><summary><span class="ms sm" aria-hidden="true">receipt_long</span>Alle Abrechnungen ansehen</summary><div class="stack">${B.map((a,i)=>auszugHTML(a,def.monate[i].name)).join('')}</div></details>
      <div class="row"><button class="btn" type="button" data-hh-nochmal><span class="ms" aria-hidden="true">replay</span>Noch einmal mit anderen Entscheidungen</button></div></div>`;
    $('[data-hh-nochmal]',buehne).addEventListener('click',neu);
  }

  /* ---------- Seitenleiste: Kontostand und laufende Verträge ---------- */
  function zeichneKonto(){
    const k=st.konto,max=1500,anteil=v=>Math.max(0,Math.min(100,(v+def.dispo)/(max+def.dispo)*100));
    $('[data-hh-konto]',box).innerHTML=`<p class="eyebrow">Girokonto</p><p class="big-num num hh-stand ${status(k)}" aria-live="polite">${geld(k)}</p>
      <div class="hh-meter" aria-hidden="true"><span class="hh-meter-null" style="left:${anteil(0)}%"></span><span class="hh-meter-wert ${status(k)}" style="left:${anteil(k)}%"></span></div>
      <p class="small row hh-meter-legende"><span>Dispo −${def.dispo} €</span><span>0 €</span><span>${fmt(max,0)} €</span></p>
      <p class="small row"><span class="ms sm" aria-hidden="true">savings</span> Sparkonto: <b class="num">${geld(st.spar)}</b></p>`;
  }
  function zeichneVertraege(){
    const m=Math.max(1,st.monat),vs=st.vertraege.filter(v=>aktiv(v,m)&&v.betrag>0);
    const summe=def.pflicht.reduce((s,x)=>s+x.betrag,0)+vs.filter(v=>!v.spar).reduce((s,v)=>s+v.betrag,0);
    $('[data-hh-vertraege]',box).innerHTML=`<p class="title-s">Laufende Verträge <span class="num small muted">${geld(summe)} im Monat</span></p>
      <ul class="hh-vliste">${def.pflicht.map(x=>`<li><span>${esc(x.t)}</span><span class="num">${geld(x.betrag)}</span></li>`).join('')}
      ${vs.map(v=>`<li class="${v.spar?'spar':''}"><span>${esc(v.name)}${v.bis!=null?` <span class="small muted">bis Monat ${v.bis}</span>`:''}${v.ende!=null?' <span class="small muted">gekündigt</span>':''}</span><span class="num">${geld(v.betrag)}</span></li>`).join('')}</ul>`;
  }

  /* ---------- Klassenspiegel der Lehrkraft ---------- */
  function zeichneMonitor(){
    const mon=$('[data-hh-monitor]',box),bm=raum.bankMonat(),m=bm||0,sp=raum.zustand().spieler||[],lk=raum.istLehrkraft();
    const zahl=(i,c)=>sp.filter(p=>String(p.bk||'')[i]===c).length;
    const spiegel=i=>{const a=zahl(i,'a'),b=zahl(i,'b'),c=zahl(i,'c'),n=a+b+c,E=def.monate[i].ereignis,ev=[0,1,2].map(j=>zahl(N+i,BUCHST[j])),ne=ev.reduce((s,x)=>s+x,0);
      return `<div class="stack hh-spiegel"><p class="title-s">${esc(def.monate[i].name)} <span class="small muted num">${n} von ${sp.length} haben abgerechnet</span></p>
        <div class="hh-kacheln"><div class="hh-kachel a"><span class="small">im Plus</span><b class="num">${a}</b></div><div class="hh-kachel b"><span class="small">knapp (0 bis 49 €)</span><b class="num">${b}</b></div><div class="hh-kachel c"><span class="small">im Dispo</span><b class="num">${c}</b></div></div>
        <p class="small"><b>${esc(E.titel)}</b> <span class="muted num">${ne} haben reagiert</span></p>
        ${E.wahl.map((w,j)=>`<div class="bank-reak-zeile"><span class="small">${esc(w.t)}</span><div class="bank-balken ${w.art}" aria-hidden="true"><span style="width:${ne?Math.round(ev[j]/ne*100):0}%"></span></div><span class="num small">${ev[j]}</span></div>`).join('')}</div>`};
    mon.innerHTML=`<p class="title-m"><span class="ms" aria-hidden="true">groups</span> Klassenspiegel</p>
      <p class="small">${bm==null?'Jeder spielt in seinem Tempo. Mit dem Knopf startest du die Monate für alle gemeinsam.':`${esc(m?def.monate[m-1].name:'Start')}: Monat ${m} von ${N} läuft.`}</p>
      ${lk&&m<N?`<div class="row"><button class="btn primary small" type="button" data-hh-lkmonat="${m+1}"><span class="ms" aria-hidden="true">fast_forward</span>${esc(def.monate[m].name)} für alle starten</button></div>`:''}
      ${Array.from({length:m},(_,i)=>spiegel(m-1-i)).join('')||(sp.length?`<p class="small muted num">${sp.length} im Lernraum.</p>`:'<p class="small muted">Noch niemand im Lernraum.</p>')}`;
    $('[data-hh-lkmonat]',mon)?.addEventListener('click',e=>raum.setzeBankMonat(+e.currentTarget.dataset.hhLkmonat));
  }

  function neu(){st={...leer(def),raum:st.raum};sichern();sende();zeichne();fokus('[data-hh-start]')}
  $('[data-hh-neu]',box).addEventListener('click',neu);
  verbinde();
}
