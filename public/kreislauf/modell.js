// Das Kreislauf-Diagramm der Lernwerkstatt Wirtschaftskreislauf: Sektoren als Kästen, Ströme als Pfeile (SVG).
//   bauHTML(n), bindBau(root)       Stufe n selbst bauen: Karte wählen, Start und Ziel antippen, Pfeil erscheint.
//                                   Danach rechnen, bis jeder Sektor ausgeglichen ist. Meldet Änderungen mit dem Ereignis 'wk-bau'.
//   wellenHTML(), bindWellen(root)  Schockwellen: Ein Ereignis trifft den Kreislauf, Pfeile werden dicker oder dünner.
//                                   Vorher stimmen die Schüler ab (allein oder live im Lernraum). Löst die Lehrkraft die
//                                   Abstimmung auf, läuft die Welle auf allen Geräten, auch auf dem Beamer. Keine neuen Firestore-Felder.
//   bauStand(n)                     gespeicherter Stand einer Stufe {ok:[…], art:{…}, r:{…}, gb}
import { $, $$, esc, store, fmt } from '../shared/js/ui.js';
import { raum } from '../shared/js/lernraum.js';
import { abstimmung } from '../shared/js/aufgaben.js';
import { zahl, zahlFeedback } from '../shared/js/feedback.js';
import { SEKTOREN, STROEME, STUFEN, SCHOCKS } from './daten.js';

const P='wk';
const HW=88,HH=34;   // halbe Breite und Höhe eines Sektor-Kastens
const ruhig=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const S=Object.fromEntries(STROEME.map(s=>[s.id,s]));
const symHTML=(sym,sub)=>`${sym}${sub?`<sub>${sub}</sub>`:''}`;
export const sym=s=>symHTML(s.sym,s.sub);
const symSVG=s=>`${esc(s.sym)}${s.sub?`<tspan class="wk-sub" dy="6">${esc(s.sub)}</tspan>`:''}`;

/* ---------- Geometrie ---------- */
// Vom Punkt p in Richtung d bis zum Rand des Kastens um den Sektor c
function rand(c,p,d){
  const tx=d[0]?((d[0]>0?HW:-HW)-(p[0]-c.x))/d[0]:Infinity,ty=d[1]?((d[1]>0?HH:-HH)-(p[1]-c.y))/d[1]:Infinity,t=Math.min(tx,ty);
  return [p[0]+d[0]*t,p[1]+d[1]*t];
}
// Punkte eines Pfeils. Der Versatz zählt immer vom alphabetisch ersten Sektor aus, so liegen Hin- und Rückstrom nebeneinander.
const PUNKTE=new Map();
function punkte(s){
  if(PUNKTE.has(s.id))return PUNKTE.get(s.id);
  let p;
  if(s.weg)p=s.weg;
  else{
    const A=SEKTOREN[s.von],B=SEKTOREN[s.nach],[P1,P2]=s.von<s.nach?[A,B]:[B,A];
    const l=Math.hypot(P2.x-P1.x,P2.y-P1.y),nx=-(P2.y-P1.y)/l,ny=(P2.x-P1.x)/l,o=s.off||0;
    const d=[(B.x-A.x)/l,(B.y-A.y)/l];
    p=[rand(A,[A.x+nx*o,A.y+ny*o],d),rand(B,[B.x+nx*o,B.y+ny*o],[-d[0],-d[1]])];
  }
  // Etwas Abstand zu den Kästen, damit die Pfeilspitze sichtbar bleibt
  const kuerze=(a,b,n)=>{const l=Math.hypot(b[0]-a[0],b[1]-a[1]);return [a[0]+(b[0]-a[0])/l*n,a[1]+(b[1]-a[1])/l*n]};
  p=p.map(q=>[...q]);p[0]=kuerze(p[0],p[1],4);p[p.length-1]=kuerze(p[p.length-1],p[p.length-2],6);
  PUNKTE.set(s.id,p);return p;
}
const pfad=p=>'M'+p.map(q=>q.map(v=>Math.round(v*10)/10).join(' ')).join(' L');
function stelle(p,t){
  const seg=p.slice(1).map((q,i)=>Math.hypot(q[0]-p[i][0],q[1]-p[i][1])),ges=seg.reduce((a,b)=>a+b,0);let rest=ges*t;
  for(let i=0;i<seg.length;i++){if(rest<=seg[i]){const f=rest/seg[i];return [p[i][0]+(p[i+1][0]-p[i][0])*f,p[i][1]+(p[i+1][1]-p[i][1])*f]}rest-=seg[i]}
  return p[p.length-1];
}
const breite=(w,d=0)=>Math.max(2,(w?3+Math.sqrt(w)*.75:5)*(1+.6*d));

/* ---------- Zeichnen ---------- */
// Sektoren werden einmal gezeichnet (sie sind die Knöpfe zum Einzeichnen), die Pfeile bei jeder Änderung neu.
function sektorenSVG(ids,neu=[],geister=[]){
  return geister.map(id=>{const k=SEKTOREN[id];
    return `<g class="wk-geist" transform="translate(${k.x} ${k.y})" aria-hidden="true"><rect x="${-HW}" y="${-HH}" width="${HW*2}" height="${HH*2}" rx="18"/><text text-anchor="middle" y="10">?</text></g>`}).join('')
  +ids.map(id=>{const k=SEKTOREN[id];
    return `<g class="wk-sek${neu.includes(id)?' neu':''}" data-sek="${id}" transform="translate(${k.x} ${k.y})">
      <rect x="${-HW}" y="${-HH}" width="${HW*2}" height="${HH*2}" rx="18"/>
      <text class="wk-ic" x="${-HW+16}" y="10" aria-hidden="true">${k.icon}</text>
      <text class="wk-sek-t" x="${-HW+48}" y="-2">${esc(k.t)}</text><text class="wk-sek-k" x="${-HW+48}" y="20">${esc(k.kurz)}</text></g>`}).join('');
}
const MARKER=['geld','gut','offen','plus','minus'].map(k=>`<marker id="wk-m-${k}" viewBox="0 0 10 10" refX="8" refY="5" markerUnits="userSpaceOnUse" markerWidth="18" markerHeight="18" orient="auto-start-reverse"><path class="wk-mk-${k}" d="M0 0 L10 5 L0 10 z"/></marker>`).join('');
function diagrammHTML(ids,neu,label,geister){
  return `<svg class="wk-svg" viewBox="0 0 640 620" role="group" aria-label="${esc(label)}"><defs>${MARKER}</defs>
    <g data-wk-pfeile></g><g data-wk-sektoren>${sektorenSVG(ids,neu,geister)}</g><g data-wk-labels></g></svg>`;
}
// pfeile: [{id, art:'geld'|'gut'|'offen', wert, d:+1|−1|0, puls}], teilchen: Geld fließt sichtbar
function zeichnePfeile(svg,pfeile,{teilchen=true,werte=false}={}){
  const bewegt=teilchen&&!ruhig();
  $('[data-wk-pfeile]',svg).innerHTML=pfeile.map(f=>{const s=S[f.id],p=punkte(s),d=pfad(p),k=f.d>0?'plus':f.d<0?'minus':f.art;
    const dur=Math.max(1.2,3.2-(f.d||0)*1.1);
    return `<g class="wk-pf ${k}${f.puls?' puls':''}${f.neu?' neu':''}" data-pf="${s.id}">
      <path d="${d}" stroke-width="${breite(f.wert,f.d)}" marker-end="url(#wk-m-${k})"/>
      ${bewegt&&f.art==='geld'?[0,1,2].map(i=>`<circle r="${f.d>0?6:4.5}"><animateMotion dur="${dur}s" begin="${-i*dur/3}s" repeatCount="indefinite" path="${d}"/></circle>`).join(''):''}</g>`}).join('');
  // Auf dem Handy ist das Diagramm nur halb so breit: dort größere Kürzel
  const g=matchMedia('(max-width:599px)').matches?1.4:1,hh=Math.round(15*g);
  $('[data-wk-labels]',svg).innerHTML=pfeile.map(f=>{const s=S[f.id],[x,y]=stelle(punkte(s),s.lt??.5),k=f.d>0?'plus':f.d<0?'minus':f.art;
    const t=(f.d>0?'+ ':f.d<0?'− ':'')+s.sym+(s.sub||'')+(werte&&f.wert!=null?' '+f.wert:''),w=Math.max(34,t.length*11+18)*g;
    return `<g class="wk-lab ${k}" transform="translate(${Math.round(x)} ${Math.round(y)})"><rect x="${-w/2}" y="${-hh}" width="${w}" height="${hh*2}" rx="${hh}"/>
      <text text-anchor="middle" y="${Math.round(6*g)}">${f.d>0?'+ ':f.d<0?'− ':''}${symSVG(s)}${werte&&f.wert!=null?` <tspan class="wk-wert" dy="${s.sub?-6:0}">${f.wert}</tspan>`:''}</text></g>`}).join('');
}
// Für Screenreader: die Pfeile als Liste
const pfeilText=f=>{const s=S[f.id];return `${s.name}: von ${SEKTOREN[s.von].t} zu ${SEKTOREN[s.nach].t}${f.wert!=null?`, ${f.wert} Mrd. €`:''}${f.d>0?', wird größer':f.d<0?', wird kleiner':''}`};

/* ---------- Kreislauf bauen ---------- */
export const bauStand=n=>({ok:[],art:{},r:{},...(store(`${P}-bau-${n}`)||{})});
const sektorenBis=n=>Object.keys(SEKTOREN).filter(id=>SEKTOREN[id].stufe<=n);

export function bauHTML(n){
  return `<section class="aufgabe stack wk-bau" data-wk-bau="${n}">
  <p class="aufgabe-kopf"><span class="ms sm" aria-hidden="true">draw</span>Stufe ${n} von 4: ${esc(STUFEN[n].titel)}</p>
  <div class="wk-bau-grid">
    <div class="stack wk-dia-box"><p class="wk-schritt" data-wk-schritt role="status" aria-live="polite"></p>
      <div class="wk-dia">${diagrammHTML(sektorenBis(n),n>1?Object.keys(SEKTOREN).filter(id=>SEKTOREN[id].stufe===n):[],`Kreislauf, Stufe ${n}`,Object.keys(SEKTOREN).filter(id=>SEKTOREN[id].stufe>n))}</div>
      <ul class="sr-only" data-wk-liste></ul></div>
    <div class="stack"><div class="wk-karten" data-wk-karten role="group" aria-label="Ströme zum Einzeichnen"></div><div data-wk-fb class="stack"></div></div>
  </div>
  <div data-wk-ende class="stack"></div></section>`;
}

export function bindBau(root){
  const box=$('[data-wk-bau]',root);if(!box)return;
  const n=+box.dataset.wkBau,st=bauStand(n),svg=$('svg',box),neu=STROEME.filter(s=>s.stufe===n);
  let wahl=null,von=null,frage=null,zuletzt=null;   // gewählte Karte, gewählter Start, offene Frage „Geld oder Güter?“
  const speichern=()=>{store(`${P}-bau-${n}`,st);box.dispatchEvent(new CustomEvent('wk-bau',{bubbles:true,detail:st}))};
  const fertig=()=>neu.every(s=>st.ok.includes(s.id))&&!frage;
  const gerechnet=()=>STUFEN[n].rechnen.every(r=>st.r[r.id]);

  function pfeile(){
    const w=gerechnet()?STUFEN[n].werte:{},gb=n>1||st.gb;
    return STROEME.filter(s=>s.stufe<n||(s.stufe===n&&st.ok.includes(s.id))).filter(s=>!(gb&&s.art==='gut'))
      .map(s=>({id:s.id,art:s.stufe<n||n>1||st.art[s.id]?s.art:'offen',wert:s.art==='geld'?w[s.id]:undefined,neu:s.id===zuletzt}));
  }
  function zeichne(){
    const pf=pfeile();zeichnePfeile(svg,pf,{werte:gerechnet()});
    $('[data-wk-liste]',box).innerHTML=pf.map(f=>`<li>${esc(pfeilText(f))}</li>`).join('');
    $$('.wk-sek',svg).forEach(g=>{g.classList.toggle('start',g.dataset.sek===von);const an=!!wahl;
      g.setAttribute('role','button');g.setAttribute('tabindex',an?'0':'-1');g.setAttribute('aria-disabled',String(!an));
      g.setAttribute('aria-label',SEKTOREN[g.dataset.sek].t+(g.dataset.sek===von?' (Start gewählt)':''))});
    $('[data-wk-schritt]',box).innerHTML=fertig()?'<span class="ms sm" aria-hidden="true">task_alt</span> Alle Pfeile sind drin.'
      :frage?'<span class="ms sm" aria-hidden="true">help</span> Geld oder Güter? Entscheide unten.'
      :!wahl?'<span class="wk-nr">1</span> Wähle eine Karte.'
      :!von?`<span class="wk-nr">2</span> Tippe auf den Sektor, von dem „${esc(S[wahl].story)}“ ausgeht.`
      :`<span class="wk-nr">3</span> Tippe jetzt auf das Ziel.`;
    $('[data-wk-karten]',box).innerHTML=neu.map(s=>{const ok=st.ok.includes(s.id);
      return `<button class="wk-karte${ok?' ok':''}" type="button" data-wk-k="${s.id}" aria-pressed="${wahl===s.id}"${ok||frage?' disabled':''}>
        <span class="ms" aria-hidden="true">${ok?'check_circle':s.icon}</span><span><span class="wk-story">${esc(s.story)}</span>
        ${ok?`<span class="wk-name ${n===1&&!st.art[s.id]?'':s.art}"><b>${sym(s)}</b> ${esc(s.name)}</span>`:''}</span></button>`}).join('');
    ende();
  }
  function meldung(html,art){const fb=$('[data-wk-fb]',box);fb.innerHTML=html?`<div class="fb ${art}" tabindex="-1">${html}</div>`:'';return $('.fb',fb)}
  function fragArt(id){
    const fb=$('[data-wk-fb]',box);
    fb.innerHTML=`<div class="fb ok" tabindex="-1"><b>Richtig eingezeichnet!</b> ${sym(S[id])}: ${esc(S[id].name)}</div>
      <div class="wk-art" role="group" aria-label="Geld oder Güter?"><p class="small"><b>Fließt hier Geld oder fließen Güter?</b></p>
      <div class="row"><button class="btn wk-geld-btn" type="button" data-wk-art="geld"><span class="ms" aria-hidden="true">euro</span>Geld</button>
      <button class="btn wk-gut-btn" type="button" data-wk-art="gut"><span class="ms" aria-hidden="true">kebab_dining</span>Güter</button></div><div data-wk-art-fb></div></div>`;
    $('.fb',fb).focus();
  }
  function tippe(sek){
    if(!wahl||frage)return;
    if(!von){von=sek;zeichne();return}
    if(sek===von){von=null;zeichne();return}
    const s=S[wahl],a=von;von=null;wahl=null;
    if(a===s.von&&sek===s.nach){
      st.ok.push(s.id);zuletzt=s.id;wahl=null;
      if(n===1){frage=s.id;speichern();zeichne();fragArt(s.id);return}
      speichern();zeichne();meldung(`<b>Richtig eingezeichnet!</b> ${sym(s)}: ${esc(s.name)}`,'ok');
      if(fertig())$('[data-wk-ende] .fb',box)?.focus();else $('[data-wk-k]:not([disabled])',box)?.focus();
      return;
    }
    zeichne();
    const f=a===s.nach&&sek===s.von?'<b>Fast!</b> Die Sektoren stimmen, aber der Pfeil zeigt in die falsche Richtung. '+(s.art==='geld'?'Wer bezahlt hier, wer bekommt das Geld?':'Wer gibt hier etwas her?')
      :`<b>Noch nicht.</b> ${esc(s.tipp)}`;
    meldung(f+' Wähl die Karte und versuch es noch einmal.','amb');
    $(`[data-wk-k="${s.id}"]`,box).focus();
  }
  box.addEventListener('click',e=>{
    const k=e.target.closest('[data-wk-k]');
    if(k&&!k.disabled){wahl=wahl===k.dataset.wkK?null:k.dataset.wkK;von=null;meldung('');zeichne();
      $(`[data-wk-k="${wahl}"]`,box)?.focus();
      if(wahl&&matchMedia('(max-width:899px)').matches)$('.wk-dia-box',box).scrollIntoView({block:'start',behavior:ruhig()?'auto':'smooth'});
      return}
    const g=e.target.closest('.wk-sek');if(g)return tippe(g.dataset.sek);
    const a=e.target.closest('[data-wk-art]');
    if(a&&frage){const s=S[frage],afb=$('[data-wk-art-fb]',box);
      if(a.dataset.wkArt===s.art){st.art[s.id]=true;frage=null;speichern();zeichne();
        meldung(`<b>Genau: ${s.art==='geld'?'ein Geldstrom':'ein Güterstrom'}.</b> ${sym(s)}: ${esc(s.name)}`,'ok');
        (fertig()?$('[data-wk-ende] .fb',box):$('[data-wk-k]:not([disabled])',box))?.focus()}
      else{afb.innerHTML=`<p class="small wk-hinweis" role="status">${s.art==='geld'?'Schau genau hin: Hier wechseln Euros den Besitzer.':'Hier bezahlt niemand. Hier fließt eine Leistung: Arbeit oder ein Döner.'}</p>`}
      return}
    const gb=e.target.closest('[data-wk-gb]');if(gb){st.gb=!st.gb;speichern();zeichne();$('[data-wk-gb]',box).focus();return}
    const p=e.target.closest('[data-wk-pruefe]');if(p)return pruefe(p.dataset.wkPruefe);
    if(e.target.closest('[data-wk-neu]')){Object.assign(st,{ok:[],art:{},r:{},gb:false});wahl=von=frage=zuletzt=null;speichern();meldung('');zeichne();$('[data-wk-k]',box).focus()}
  });
  svg.addEventListener('keydown',e=>{const g=e.target.closest('.wk-sek');if(g&&(e.key==='Enter'||e.key===' ')){e.preventDefault();tippe(g.dataset.sek)}});

  // Am Ende der Stufe: rechnen, bis jeder Sektor ausgeglichen ist
  function pruefe(id){
    const r=STUFEN[n].rechnen.find(x=>x.id===id),inp=$(`#wk-r-${n}-${id}`,box),w=zahl(inp.value),f=zahlFeedback(w,{r:r.r,tol:0,fehler:r.fehler});
    if(f.richtig){st.r[id]=true;speichern();zeichne();$(`[data-wk-r="${id}"] .fb`,box)?.focus();return}
    const el=$(`[data-wk-r="${id}"] [data-wk-rfb]`,box);el.innerHTML=`<div class="fb amb" tabindex="-1">${f.text||'Noch nicht. Zuflüsse und Abflüsse müssen gleich groß sein.'}</div>`;$('.fb',el).focus();
  }
  function waage(){
    const w=STUFEN[n].werte,ids=sektorenBis(n),sum=(id,seite)=>STROEME.filter(s=>s.art==='geld'&&s[seite]===id&&w[s.id]!=null).reduce((a,s)=>a+w[s.id],0);
    return `<ul class="wk-waage">${ids.map(id=>{const rein=sum(id,'nach'),raus=sum(id,'von');
      return `<li><span class="ms" aria-hidden="true">${SEKTOREN[id].icon}</span><span><b>${SEKTOREN[id].t}</b><span class="small">${rein} rein · ${raus} raus</span></span><span class="ms ${rein===raus?'ok':''}" aria-label="${rein===raus?'ausgeglichen':'nicht ausgeglichen'}">${rein===raus?'balance':'warning'}</span></li>`}).join('')}</ul>`;
  }
  function ende(){
    const el=$('[data-wk-ende]',box);
    if(!fertig()){el.innerHTML='';return}
    const offen=STUFEN[n].rechnen.findIndex(r=>!st.r[r.id]),bis=offen<0?STUFEN[n].rechnen.length:offen+1;
    const html=`<div class="fb ok" tabindex="-1"><b>Kreislauf geschlossen!</b> ${n===1?'Jeder Strom hat einen Gegenstrom: Für Geld gibt es Güter oder Arbeit.':n===2?'Was die Haushalte sparen, leihen die Banken den Unternehmen.':n===3?'Der Staat nimmt Steuern ein und gibt sie als Transfers, Subventionen und für eigene Käufe wieder aus.':'Jetzt sind alle fünf Sektoren verbunden: der erweiterte Wirtschaftskreislauf.'}</div>
      ${n===1?`<div class="panel stack wk-vereinfachen"><p><b>Einfacher geht's:</b> Zu jedem Güterstrom gibt es einen Geldstrom in die Gegenrichtung. Darum reicht eine Sorte Pfeile. Ab Stufe 2 zeigen wir nur noch die Geldströme.</p>
        <div class="row"><button class="btn${st.gb?' primary':''}" type="button" data-wk-gb aria-pressed="${!!st.gb}"><span class="ms" aria-hidden="true">${st.gb?'visibility':'visibility_off'}</span>${st.gb?'Güterströme zeigen':'Güterströme ausblenden'}</button></div></div>`:''}
      <section class="stack wk-rechnen"><p class="title-s"><span class="ms sm" aria-hidden="true">balance</span> Ist jeder Sektor ausgeglichen?</p><p class="small">Was in einen Sektor hineinfließt, muss auch wieder hinausfließen. Rechne nach.</p>
      ${STUFEN[n].rechnen.slice(0,bis).map(r=>`<div class="stack" data-wk-r="${r.id}"><label for="wk-r-${n}-${r.id}">${r.f}</label>
        ${st.r[r.id]?`<div class="fb ok" tabindex="-1"><b>${symHTML(r.sym,r.sub)} = ${r.r}</b> ${r.e}</div>`
          :`<div class="row"><span class="wk-gleich"><b>${symHTML(r.sym,r.sub)} =</b></span><input id="wk-r-${n}-${r.id}" class="wk-eingabe" inputmode="decimal" autocomplete="off" size="5"><span>Mrd. €</span><button class="btn primary small" type="button" data-wk-pruefe="${r.id}"><span class="ms" aria-hidden="true">task_alt</span>Prüfen</button></div><div data-wk-rfb></div>`}</div>`).join('')}
      ${offen<0?waage():''}</section>
      <div class="row"><button class="btn small text" type="button" data-wk-neu><span class="ms" aria-hidden="true">restart_alt</span>Stufe neu bauen</button></div>`;
    if(el._html!==html){el.innerHTML=html;el._html=html;
      $$('.wk-eingabe',el).forEach(i=>i.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();pruefe(i.closest('[data-wk-r]').dataset.wkR)}}))}
  }
  zeichne();
}

/* ---------- Tafelbild: der ganze erweiterte Kreislauf mit Werten ---------- */
export function tafelHTML(){
  return `<figure class="wk-tafel stack"><div class="wk-dia" data-wk-tafel>${diagrammHTML(Object.keys(SEKTOREN),[],'Der erweiterte Wirtschaftskreislauf mit allen Geldströmen')}</div>
    <figcaption><ul class="wk-legende">${STROEME.filter(s=>s.art==='geld').map(s=>`<li><b>${sym(s)}</b> ${esc(s.name)}</li>`).join('')}</ul></figcaption></figure>`;
}
export function bindTafel(root){
  $$('[data-wk-tafel] svg',root).forEach(svg=>zeichnePfeile(svg,STROEME.filter(s=>s.art==='geld').map(s=>({id:s.id,art:'geld',wert:STUFEN[4].werte[s.id]})),{werte:true,teilchen:false}));
}

/* ---------- Schockwellen ---------- */
const abstId=s=>'wk-schock-'+s.id;
export function wellenHTML(){
  return `<section class="aufgabe stack wk-wellen" data-wk-wellen>
  <p class="aufgabe-kopf"><span class="ms sm" aria-hidden="true">waves</span>Schockwellen</p>
  <div class="choice wk-chips" role="group" aria-label="Ereignis wählen">${SCHOCKS.map((s,i)=>`<button type="button" data-wk-s="${i}" aria-pressed="false"><span class="ms sm" aria-hidden="true">${s.icon}</span><span>${i+1}. ${esc(s.titel)}</span></button>`).join('')}</div>
  <div class="wk-bau-grid">
    <div class="stack wk-dia-box"><div class="wk-dia">${diagrammHTML(Object.keys(SEKTOREN),[],'Kreislauf mit Schockwelle')}</div><ul class="sr-only" data-wk-liste></ul></div>
    <div class="stack">
      ${SCHOCKS.map((s,i)=>`<div class="stack" data-wk-schock="${i}" hidden>
        <p class="eyebrow">Ereignis ${i+1} von ${SCHOCKS.length} · Modell ${['','einfach','mit Banken','mit Staat','mit Ausland'][s.stufe]}</p>
        ${abstimmung({id:abstId(s),kopf:'Ihr seid die Wirtschaftsforscher',icon:'insights',titel:s.titel,
          fall:`<p><b>${esc(s.meldung)}</b></p><p class="small muted">${esc(s.quelle)}</p>`,frage:s.frage,optionen:s.optionen,r:s.r,e:s.e})}</div>`).join('')}
      <div class="row"><button class="btn primary" type="button" data-wk-welle><span class="ms" aria-hidden="true">play_arrow</span>Welle auslösen</button><span class="small muted" data-wk-welle-hinweis></span></div>
      <ol class="wk-kette" data-wk-kette aria-live="polite"></ol>
    </div>
  </div></section>`;
}

export function bindWellen(root){
  const box=$('[data-wk-wellen]',root);if(!box)return;
  const svg=$('svg',box);let i=Math.min(SCHOCKS.length-1,+(store(P+'-welle')||0)),schritt=-1,timer=null,zuletztN=null;
  const lk=()=>raum.istLehrkraft()||raum.praesentation();
  const geantwortet=s=>{const id=abstId(s);return lk()||(raum.istSchueler()?!!raum.urteil(id)||raum.umfrage().id===id&&raum.umfrage().auf:(store(`${raum.speicher()}-abst-${id}`)||{}).w!=null)};
  function zeige(){
    const s=SCHOCKS[i],w=STUFEN[s.stufe].werte,d={},puls=new Set();
    SCHOCKS[i].kette.slice(0,schritt+1).forEach((k,j)=>Object.entries(k.d).forEach(([id,v])=>{d[id]=v;if(j===schritt)puls.add(id)}));
    $$('.wk-sek',svg).forEach(g=>g.style.display=SEKTOREN[g.dataset.sek].stufe<=s.stufe?'':'none');
    const pf=STROEME.filter(f=>f.art==='geld'&&f.stufe<=s.stufe).map(f=>({id:f.id,art:'geld',wert:w[f.id],d:d[f.id]||0,puls:puls.has(f.id)}));
    zeichnePfeile(svg,pf);
    $('[data-wk-liste]',box).innerHTML=pf.map(f=>`<li>${esc(pfeilText(f))}</li>`).join('');
    $$('[data-wk-s]',box).forEach(b=>{b.setAttribute('aria-pressed',String(+b.dataset.wkS===i));b.classList.toggle('sel',+b.dataset.wkS===i)});
    $$('[data-wk-schock]',box).forEach(el=>el.hidden=+el.dataset.wkSchock!==i);
    $('[data-wk-kette]',box).innerHTML=s.kette.slice(0,schritt+1).map((k,j)=>`<li class="${j===schritt?'aktuell':''}"><span class="wk-nr">${j+1}</span><span>${esc(k.t)}${Object.entries(k.d).map(([id,v])=>` <span class="pill ${v>0?'wk-plus':'wk-minus'}">${v>0?'+':'−'} ${sym(S[id])}</span>`).join('')}</span></li>`).join('');
    const ok=geantwortet(s),b=$('[data-wk-welle]',box);
    b.disabled=!ok||timer!=null;
    b.innerHTML=`<span class="ms" aria-hidden="true">${schritt>=0?'replay':'play_arrow'}</span>${schritt>=0?'Welle noch einmal':'Welle auslösen'}`;
    $('[data-wk-welle-hinweis]',box).textContent=ok?'':'Erst abstimmen, dann die Welle auslösen.';
  }
  function welle(){
    clearTimeout(timer);timer=null;
    const k=SCHOCKS[i].kette.length;
    if(ruhig()){schritt=k-1;zeige();return}
    schritt=0;
    const weiter=()=>{zeige();if(schritt<k-1){timer=setTimeout(()=>{schritt++;weiter()},1500)}else{timer=null;zeige()}};
    timer=-1;weiter();
  }
  function waehle(j,start){clearTimeout(timer);timer=null;i=j;schritt=-1;store(P+'-welle',i);zeige();if(start)welle()}
  box.addEventListener('click',e=>{
    const c=e.target.closest('[data-wk-s]');if(c){waehle(+c.dataset.wkS);return}
    if(e.target.closest('[data-wk-welle]')){welle();return}
    // Allein: Nach der eigenen Antwort läuft die Welle von selbst
    if(e.target.closest('[data-abst-urteil]'))setTimeout(()=>{if(geantwortet(SCHOCKS[i]))welle()},0);
  });
  // Im Lernraum: Löst die Lehrkraft eine Abstimmung auf, läuft die Welle auf allen Geräten
  const aus=raum.on(art=>{if(!box.isConnected){aus();return}
    if(art!=='raum'&&art!=='urteil'&&art!=='start')return;
    const u=raum.umfrage(),j=SCHOCKS.findIndex(s=>abstId(s)===u.id);
    if(j>=0&&u.auf&&u.n!==zuletztN){zuletztN=u.n;waehle(j,true);return}
    if(j>=0&&!u.auf&&j!==i)waehle(j);
    else if(timer==null)zeige();
  });
  const u=raum.umfrage();if(u.auf)zuletztN=u.n;
  zeige();
}
