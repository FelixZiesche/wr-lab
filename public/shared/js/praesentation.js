// Präsentationsansicht wie in PowerPoint: Der Laptop der Lehrkraft bleibt ihr eigener Bildschirm (Dashboard, Lehrerpanel,
// Lösungen, Spitznamen), ein zweites Fenster auf dem erweiterten Bildschirm ist der Beamer. Geöffnet wird es im
// Lernraum-Dashboard (Knopf „Präsentationsansicht“, Adresse ?praesentation). Beide Fenster laufen im selben Browser und
// sind damit dieselbe Lehrkraft (dieselbe anonyme Anmeldung, derselbe Raum aus localStorage).
// Das Beamer-Fenster folgt dem Laptop nicht, es zeigt nur, was die Lehrkraft schickt: Startbild (Raumcode, QR-Code),
// Klassen-Quiz, die Wand einer Aufgabe oder eine Werkstatt. Quiz starten und „Antworten zeigen“ an der Wand schicken
// von selbst. Im Beamer-Fenster gilt raum.istLehrkraft() nicht (es schreibt nie in den Raum, kein Lehrerpanel,
// keine Spitznamen außer in der Quiz-Rangliste wie im Beamer-Modus), dafür raum.praesentation().
// Die Fenster sprechen über einen BroadcastChannel nur auf diesem Gerät, ohne Server; neue Firestore-Felder gibt es nicht.
//
//   PRAES                 true im Beamer-Fenster
//   praes.init({thema, ort, orte, gehZu, titel})   aus werkstatt.js, nach raum.init()
//   praes.zeige({art, id}) Laptop: auf den Beamer schicken, art 'start' | 'quiz' | 'wand' (id der Aufgabe) | 'werkstatt' (id)
//   praes.zeigt()         was der Beamer gerade zeigt, auf beiden Seiten
//   praes.verbunden()     Laptop: ein Beamer-Fenster ist offen
//   praes.quiz(daten)     Laptop: Zustand des Quiz-Fensters an den Beamer ({n, ansicht, frist, namen}), praes.quizDaten() auf dem Beamer
//   praes.on(f)           f(art) bei Änderungen: 'zeige', 'verbunden', 'quiz'
//   praes.leiste()        Laptop: Leiste „Beamer zeigt …“ aktualisieren (nach jedem Wechsel der Ansicht)
//   praes.dashboardHTML() Knopf und Status für das Lernraum-Dashboard
import { $, $$, esc, neuZeichnen, zeigeHinweis } from './ui.js';
import { raum, AUFGABEN, qrSVG, linkZu, beitrittsWeg, sperreHintergrund } from './lernraum.js';
import { THEMEN } from '../../themen.js';

export const PRAES=(()=>{try{return new URLSearchParams(location.search).has('praesentation')}catch(e){return false}})();
const KANN=typeof BroadcastChannel==='function';
const ARTEN=['start','quiz','wand','werkstatt'];
let cfg={},kanal=null,was={art:'start',id:''},da=false,qd={},qdAlt='',fensterRef=null;
const hoerer=new Set();
function melde(art){hoerer.forEach(f=>{try{f(art)}catch(e){console.warn(e)}})}
const senden=m=>{try{if(kanal)kanal.postMessage(m)}catch(e){console.warn('Präsentation',e)}};
const pruefe=w=>w&&ARTEN.includes(w.art)?{art:w.art,id:String(w.id||'').slice(0,60)}:{art:'start',id:''};
const plain=html=>{const d=document.createElement('div');d.innerHTML=html||'';return d.textContent.replace(/\s+/g,' ').trim()};
const kurz=(t,n=60)=>t.length>n?t.slice(0,n-1)+'…':t;
const fensterName=()=>'wrlab-praes-'+raum.speicher();
// Das Beamer-Fenster merkt sich, was es zeigt (Neuladen), nur in diesem Fenster
const merken=()=>{try{sessionStorage.setItem(raum.speicher()+'-praes',JSON.stringify(was))}catch(e){}};
const gemerkt=()=>{try{return pruefe(JSON.parse(sessionStorage.getItem(raum.speicher()+'-praes')||'null'))}catch(e){return pruefe(null)}};

/** Was der Beamer zeigt, in Worten (Leiste und Dashboard) */
function wasText(w=was){
  if(w.art==='quiz'){const q=raum.quiz();return q.id?`Klassen-Quiz${q.nr?`, Frage ${q.nr} von ${q.von}`:''}`:'Startbild (das Quiz ist vorbei)'}
  if(w.art==='wand'){const a=AUFGABEN.get(w.id);return `Wand: ${a?`„${kurz(plain(a.frage))}“`:'Antworten'}`}
  if(w.art==='werkstatt')return `„${cfg.titel?cfg.titel(w.id):w.id}“`;
  return 'Startbild mit Raumcode';
}

export const praes={
  init(c){
    cfg=c||{};if(!KANN)return;
    kanal=new BroadcastChannel(fensterName());
    if(PRAES)return beamerStart();
    kanal.onmessage=e=>{const m=e.data||{};
      if(m.typ==='da'){const neu=!da;da=true;was=pruefe(m.was);if(neu){qdAlt='';melde('verbunden')}melde('zeige');aktualisiere()}
      else if(m.typ==='weg'){da=false;melde('verbunden');aktualisiere()}};
    senden({typ:'wer'});
    raum.on(()=>aktualisiere());
    // Knopf im Dashboard (wird dort neu gezeichnet: Delegation)
    document.addEventListener('click',e=>{if(e.target.closest('[data-praes-oeffnen]'))oeffnen()});
  },
  zeige(w){if(PRAES||!da||!raum.istLehrkraft())return;was=pruefe(w);senden({typ:'zeige',was});melde('zeige');aktualisiere()},
  zeigt:()=>was,
  verbunden:()=>!PRAES&&da&&raum.istLehrkraft(),
  istBeamer:()=>PRAES,
  quiz(d){if(PRAES||!da)return;const j=JSON.stringify(d);if(j===qdAlt)return;qdAlt=j;senden({typ:'quiz',daten:d})},
  quizDaten:()=>qd,
  on(f){hoerer.add(f);return ()=>hoerer.delete(f)},
  leiste:()=>aktualisiere(),
  dashboardHTML(){
    if(!KANN||PRAES)return '';
    return `<div class="stack praes-dash"><div class="row"><button class="btn small" type="button" data-praes-oeffnen><span class="ms" aria-hidden="true">present_to_all</span><span data-praes-knopf>${da?'Beamer-Fenster nach vorn':'Präsentationsansicht'}</span></button></div>
      <p class="small muted" data-praes-status>${statusText()}</p></div>`;
  }
};

/* ---------- Laptop ---------- */
const statusText=()=>da?`Das Beamer-Fenster ist offen und zeigt: ${esc(wasText())}.`
  :'Hat dein Laptop einen zweiten Bildschirm (erweitert, nicht gespiegelt)? Dann öffnet die Präsentationsansicht ein eigenes Fenster für den Beamer. Es zeigt nur, was du schickst. Lehrerpanel, Lösungen und Spitznamen bleiben auf deinem Bildschirm.';

/** Öffnet das Beamer-Fenster und legt es, wenn der Browser es kann (Chrome, Edge), auf den zweiten Bildschirm */
async function oeffnen(){
  const name=fensterName();
  if(da){const w=fensterRef&&!fensterRef.closed?fensterRef:window.open('',name);if(w)w.focus();return}
  // Sofort öffnen (sonst blockiert der Browser das Fenster), danach verschieben
  const w=window.open(location.pathname+'?praesentation',name,'popup,width=1280,height=720');
  if(!w){zeigeHinweis('Der Browser hat das Fenster blockiert. Erlaube Pop-ups für diese Seite und tippe noch einmal auf „Präsentationsansicht“.');return}
  fensterRef=w;
  try{
    if(window.screen.isExtended&&'getScreenDetails' in window){
      const d=await window.getScreenDetails(),z=d.screens.find(x=>x!==d.currentScreen);
      if(z){w.moveTo(z.availLeft,z.availTop);w.resizeTo(z.availWidth,z.availHeight)}
    }
  }catch(e){console.warn('Zweiter Bildschirm',e)}
}

function aktualisiere(){
  if(PRAES)return;
  $$('[data-praes-status]').forEach(el=>{const h=statusText();if(el._h!==h){el.innerHTML=h;el._h=h}});
  $$('[data-praes-knopf]').forEach(el=>{const t=da?'Beamer-Fenster nach vorn':'Präsentationsansicht';if(el.textContent!==t)el.textContent=t});
  let el=$('#praes-leiste');
  const an=da&&raum.istLehrkraft();
  document.documentElement.classList.toggle('praes-leiste-an',an);
  if(!an){if(el)el.hidden=true;return}
  if(!el){el=document.createElement('div');el.id='praes-leiste';el.className='praes-leiste';el.setAttribute('role','region');el.setAttribute('aria-label','Präsentationsansicht');document.body.append(el);
    el.addEventListener('click',e=>{const b=e.target.closest('[data-praes-hier],[data-praes-start]');if(!b)return;
      if(b.hasAttribute('data-praes-start'))return praes.zeige({art:'start'});
      const o=hier();if(o)praes.zeige(o)})}
  const o=hier(),gleich=o&&o.art===was.art&&o.id===was.id;
  neuZeichnen(el,`<span class="ms" aria-hidden="true">present_to_all</span><span class="small praes-leiste-t"><b>Beamer:</b> ${esc(wasText())}</span>
    ${o&&!gleich?`<button class="btn small" type="button" data-praes-hier>${o.bereich?'Diese Seite zeigen':'Diese Werkstatt zeigen'}</button>`:''}
    ${was.art!=='start'?'<button class="btn small text" type="button" data-praes-start>Startbild</button>':''}`);
  el.hidden=false;
}
// Was auf dem Laptop gerade offen ist (Werkstatt oder Bereich)
function hier(){
  const id=cfg.ort?cfg.ort():'',o=(cfg.orte?cfg.orte():[]).find(x=>x.id===id);
  return o?{art:'werkstatt',id,bereich:o.art==='bereich'}:null;
}

/* ---------- Beamer-Fenster ---------- */
function beamerStart(){
  document.documentElement.classList.add('praes');
  document.title='Beamer · '+document.title;
  was=gemerkt();
  const el=document.createElement('div');el.id='praes';el.className='praes-buehne';el.hidden=true;
  el.innerHTML='<div class="praes-werkzeug"><button class="icon-btn" type="button" data-praes-vollbild aria-label="Vollbild" title="Vollbild (Taste F)"><span class="ms" aria-hidden="true">fullscreen</span></button></div><div class="praes-inhalt" data-praes-inhalt></div>';
  document.body.append(el);
  el.addEventListener('click',e=>{if(e.target.closest('[data-praes-vollbild]'))vollbild();if(e.target.closest('[data-praes-neu]'))raum.verbinden()});
  document.addEventListener('keydown',e=>{if((e.key==='f'||e.key==='F')&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&!e.target.closest('input,textarea,select'))vollbild()});
  document.addEventListener('fullscreenchange',()=>{const b=$('[data-praes-vollbild]',el),v=!!document.fullscreenElement;b.setAttribute('aria-label',v?'Vollbild beenden':'Vollbild');$('.ms',b).textContent=v?'fullscreen_exit':'fullscreen'});
  kanal.onmessage=e=>{const m=e.data||{};
    if(m.typ==='wer')senden({typ:'da',was});
    else if(m.typ==='zeige'){was=pruefe(m.was);merken();senden({typ:'da',was});if(was.art==='werkstatt'&&cfg.gehZu)cfg.gehZu(was.id);melde('zeige');buehne()}
    else if(m.typ==='quiz'){qd=m.daten||{};melde('quiz')}};
  senden({typ:'da',was});
  window.addEventListener('pagehide',()=>senden({typ:'weg'}));
  raum.on(()=>buehne());
  if(was.art==='werkstatt'&&cfg.gehZu)cfg.gehZu(was.id);
  buehne();
}
function vollbild(){try{if(document.fullscreenElement)document.exitFullscreen();else document.documentElement.requestFullscreen().catch(()=>{})}catch(e){}}

/** Zeichnet das Startbild oder die Wand. Quiz und Werkstatt zeigen quiz.js und werkstatt.js, die Bühne ist dann ausgeblendet. */
function buehne(){
  const el=$('#praes');if(!el)return;
  const s=raum.sitzung(),v=raum.verbindung(),q=raum.quiz();
  let art=was.art;
  if(art==='quiz'&&!q.id)art='start';
  let html='';
  if(!s||s.rolle!=='lk')html=`<div class="praes-mitte stack"><span class="ms praes-gross" aria-hidden="true">present_to_all</span><h1 class="headline-l">Präsentationsansicht</h1><p class="title-l">Öffne am Laptop einen Lernraum. Dann erscheint hier der Raumcode.</p></div>`;
  else if(v==='netz'||v==='laden')html=`<div class="praes-mitte stack"><h1 class="headline-l">Keine Verbindung zum Lernraum</h1><p class="title-l">Prüfe das WLAN.</p><div class="row" style="justify-content:center"><button class="btn primary" type="button" data-praes-neu><span class="ms" aria-hidden="true">refresh</span>Erneut verbinden</button></div></div>`;
  else if(!raum.praesentation())html=`<div class="praes-mitte stack"><span class="ms praes-gross" aria-hidden="true">hourglass_top</span><p class="title-l">Verbinde mit dem Lernraum …</p></div>`;
  else if(art==='wand')html=wandHTML(was.id);
  else if(art==='start')html=startHTML(s.code);
  const zeigen=!!html;
  if(zeigen)neuZeichnen($('[data-praes-inhalt]',el),html);
  // Hinter der Bühne ist nichts erreichbar (Tastatur, Screenreader), siehe sperreHintergrund()
  if(el.hidden===zeigen){el.hidden=!zeigen;sperreHintergrund()}
}
function startHTML(code){
  const n=raum.zustand().spieler.length,t=(THEMEN.find(x=>x.id===cfg.thema)||{}).titel||'';
  return `<div class="praes-start"><div class="stack praes-start-text"><p class="eyebrow">Lernraum${t?` · ${esc(t)}`:''}</p><h1 class="display-s">Macht mit!</h1>
    <p class="praes-code">${esc(code)}</p><p class="title-l">${beitrittsWeg('raum')}</p>
    <p class="headline-s num">${n} ${n===1?'Gerät':'Geräte'} im Raum</p></div>
    <figure class="praes-qr"><div class="lr-qr">${qrSVG(linkZu(code))}</div><figcaption class="title-m">QR-Code scannen</figcaption></figure></div>`;
}
// Die Wand am Beamer: groß und ohne Spitznamen, Löschen nur am Laptop
function wandHTML(id){
  let a=AUFGABEN.get(id);if(!a){raum.vorbereiten();a=AUFGABEN.get(id)}
  const liste=raum.zustand().antworten.filter(x=>x.aufgabe===id).sort((x,y)=>((x.at&&x.at.seconds)||0)-((y.at&&y.at.seconds)||0));
  return `<div class="stack praes-wand"><p class="eyebrow"><span class="ms sm" aria-hidden="true">edit_note</span> An der Wand · <span class="num">${liste.length}</span> ${liste.length===1?'Antwort':'Antworten'}</p>
    <h1 class="praes-frage">${a?a.frage:'Antworten an der Wand'}</h1>
    ${liste.length?`<div class="wand-grid">${liste.map(x=>`<article class="wand-karte"><p>${esc(x.text)}</p></article>`).join('')}</div>`
      :'<p class="title-l">Noch keine Antworten. Schreibt eure Antwort und tippt auf „Abschicken“.</p>'}</div>`;
}
