// Lernraum: ein Live-Raum für die ganze Lernwerkstatt eines Themas, auch für das Planspiel.
// Die Lehrkraft öffnet den Raum, die Schüler treten mit Code und Spitznamen bei, ohne Konto.
// Die Lehrkraft sieht, wer gerade wo arbeitet, sammelt Antworten „an der Wand“, hält alle Geräte an,
// holt alle in eine Werkstatt, gibt Werkstätten frei und sieht in jeder Werkstatt das Lehrerpanel.
// Die Verbindung läuft ausschließlich über live.js. Eingebunden wird der Lernraum von werkstatt.js.
import { $, $$, esc, store } from './ui.js';
import { connect } from './live.js';
import { THEMEN } from '../../themen.js';

const CODE_ALPHA=/[^A-HJ-NP-Z2-9]/g;
export const normCode=s=>String(s||'').toUpperCase().replace(CODE_ALPHA,'').slice(0,6);
export function qrSVG(text){try{if(!window.qrcode)return '';const q=window.qrcode(0,'M');q.addData(text);q.make();return q.createSvgTag({cellSize:6,margin:2,scalable:true,alt:'QR-Code zum Beitreten'})}catch(e){return ''}}
/** Beitrittslink: #raum=CODE öffnet den Lernraum, #join=CODE das Planspiel. */
export const linkZu=(code,art='raum')=>location.href.split('#')[0]+'#'+art+'='+code;

/* ---------- Verzeichnis der Aufgaben ----------
   Aufgaben mit Lösung oder Antwort melden sich hier an: {id, frage, loesung:[…], wand:true|false, tool}.
   Das Lehrerpanel und die Druckansicht lesen daraus. */
export const AUFGABEN=new Map();
let aktuellesTool=null;
/** Führt f aus und ordnet alle dabei angemeldeten Aufgaben der Werkstatt id zu. */
export function imTool(id,f){const alt=aktuellesTool;aktuellesTool=id;try{return f()}finally{aktuellesTool=alt}}
export function registriere(def){AUFGABEN.set(def.id,{...def,tool:aktuellesTool||AUFGABEN.get(def.id)?.tool||null});return def}

/* ---------- Sitzung ---------- */
let cfg={}, L=null, s=null, z={raum:null,spieler:[],antworten:[]}, abos=[], ortT=null, gemeldet='';
const hoerer=new Set();
const speichern=()=>store(cfg.speicher+'-raum',s);
function melde(art){hoerer.forEach(f=>{try{f(art)}catch(e){console.warn(e)}})}
function abmelden(){abos.forEach(u=>{try{u()}catch(e){}});abos=[]}
function ende(meldung){abmelden();s=null;speichern();z={raum:null,spieler:[],antworten:[]};melde('ende');if(meldung&&cfg.hinweis)cfg.hinweis(meldung)}
function fehler(text,html){const e=new Error(text);e.html=!!html;return e}

async function anbinden(){
  if(!s)return;
  L=await connect();
  if(!s)return;
  if(!L)return ende(null);
  abmelden();
  const code=s.code;
  if(s.rolle==='lk'){
    const r=await L.getRoom(code);
    if(!s||s.code!==code)return;
    if(!r||r.owner!==L.uid||r.phase==='closed')return ende(null);
    z.raum=r;
    abos.push(L.watchRoom(code,d=>{if(!s)return;if(!d||d.phase==='closed')return ende('Der Lernraum wurde beendet.');z.raum=d;melde('raum')}));
    abos.push(L.watchPlayers(code,ps=>{z.spieler=ps.sort((a,b)=>((a.joinedAt&&a.joinedAt.seconds)||0)-((b.joinedAt&&b.joinedAt.seconds)||0));melde('spieler')}));
    abos.push(L.watchAnswers(code,as=>{z.antworten=as;melde('antworten')}));
  }else{
    abos.push(L.watchRoom(code,d=>{
      if(!s)return;
      if(!d||d.phase==='closed')return ende('Der Lernraum wurde beendet.');
      z.raum=d;
      if((d.zielN||0)>(s.zielN||0)){s.zielN=d.zielN;speichern();if(d.ziel&&cfg.gehZu)cfg.gehZu(d.ziel,true)}
      melde('raum');
    }));
    abos.push(L.watchMe(code,da=>{if(s&&!da)ende('Deine Lehrkraft hat dich aus dem Lernraum entfernt.')}));
  }
  melde('verbunden');
}
async function steuern(patch){if(!raum.istLehrkraft())return;z.raum={...z.raum,...patch};melde('raum');await L.updateRoom(s.code,patch)}

export const raum={
  /** c = {speicher, thema, hinweis(text), gehZu(id), ort(), orte(), modal(title, html, init), vorbereiten()} */
  init(c){cfg=c;s=store(cfg.speicher+'-raum');if(s&&!s.code)s=null;if(s)anbinden()},
  on(f){hoerer.add(f);return ()=>hoerer.delete(f)},
  sitzung:()=>s,
  speicher:()=>cfg.speicher||'wrlab',
  zustand:()=>z,
  live:()=>L,
  istLehrkraft:()=>!!(s&&s.rolle==='lk'&&z.raum),
  istSchueler:()=>!!(s&&s.rolle==='schueler'),
  beamer:()=>!!store(cfg.speicher+'-beamer'),
  setBeamer(b){store(cfg.speicher+'-beamer',!!b);melde('beamer')},
  gesperrt:id=>!!(s&&s.rolle==='schueler'&&z.raum&&(z.raum.gesperrt||[]).includes(id)),
  pausiert:()=>!!(s&&s.rolle==='schueler'&&z.raum&&z.raum.pause),
  /** Lehrkraft: neuen Raum öffnen. */
  async oeffnen(){
    L=await connect();
    if(!L)throw fehler('Der Live-Modus ist nicht eingerichtet. Wie du ihn einschaltest, steht in der README im GitHub-Projekt.');
    const code=await L.createRoom(cfg.thema,Math.random().toString(36).slice(2,8));
    s={code,rolle:'lk'};speichern();await anbinden();melde('start');return code;
  },
  /** Schüler: mit Code und Spitznamen beitreten. Gibt die Raumdaten zurück, wirft bei Problemen einen Fehler mit Text. */
  async beitreten(code,nick){
    code=normCode(code);nick=String(nick||'').trim().replace(/\s+/g,' ').slice(0,20);
    if(code.length!==6)throw fehler('Der Code hat sechs Zeichen, zum Beispiel K7Q2XM.');
    if(!nick)throw fehler('Bitte gib einen Spitznamen ein.');
    if(s&&s.rolle==='lk')throw fehler('Auf diesem Gerät ist schon ein Lernraum als Lehrkraft geöffnet.');
    L=await connect();
    if(!L)throw fehler('Der Live-Modus ist nicht eingerichtet.');
    const r=await L.getRoom(code);
    if(!r||r.phase==='closed')throw fehler('Diesen Raum gibt es nicht (mehr). Prüfe den Code.');
    if(r.topic&&r.topic!==cfg.thema){
      const th=THEMEN.find(x=>x.id===r.topic);
      if(!th)throw fehler('Dieser Code gehört zu einem anderen Thema.');
      throw fehler(`Dieser Code gehört zum Thema „${esc(th.titel)}“. <a href="../${th.id}/#raum=${code}">Dort beitreten</a>`,true);
    }
    if(!r.open)throw fehler('Dieser Raum nimmt gerade niemanden auf.');
    const gleich=s&&s.rolle==='schueler'&&s.code===code;
    if(gleich)await L.updatePlayer(code,{nick});
    else await L.joinRoom(code,{nick,ort:String(cfg.ort?cfg.ort():'').slice(0,40)});
    s={code,nick,rolle:'schueler',zielN:r.zielN||0,gesendet:gleich?(s.gesendet||{}):{}};speichern();gemeldet='';
    await anbinden();melde('start');return r;
  },
  async verlassen(){if(!s)return;const c=s.code;ende(null);try{await L.kick(c,L.uid)}catch(e){}},
  async beenden(){if(!s)return;const c=s.code;ende(null);await L.closeRoom(c)},
  vergessen(){if(s)ende(null)},
  /** Schüler: meldet, in welcher Werkstatt oder welchem Bereich das Gerät gerade ist. */
  sendeOrt(id){if(!s||s.rolle!=='schueler'||!L)return;clearTimeout(ortT);ortT=setTimeout(()=>{if(!s||id===gemeldet)return;gemeldet=id;L.updatePlayer(s.code,{ort:String(id).slice(0,40)}).catch(e=>console.warn('Ort',e))},500)},
  async sendeAntwort(aufgabe,text){
    if(!s||s.rolle!=='schueler'||!L)throw fehler('Du bist in keinem Lernraum.');
    await L.sendAnswer(s.code,aufgabe,text);
    s.gesendet={...(s.gesendet||{}),[aufgabe]:text};speichern();melde('gesendet');
  },
  gesendet:aufgabe=>s&&s.gesendet?s.gesendet[aufgabe]:undefined,
  pause:b=>steuern({pause:!!b}),
  holen:id=>steuern({ziel:id,zielN:((z.raum&&z.raum.zielN)||0)+1}),
  sperren:ids=>steuern({gesperrt:ids}),
  kick:uid=>L.kick(s.code,uid),
  /** Kennung einer Person an der Wand: Spitzname oder (im Beamer-Modus) eine Nummer. */
  name(uid){const i=z.spieler.findIndex(p=>p.uid===uid);if(raum.beamer())return i<0?'Gerät':'Gerät '+(i+1);return i<0?'?':z.spieler[i].nick},
  oeffneDialog
};

/* ---------- Dialog: beitreten, öffnen, Dashboard ---------- */
function ortName(id){const o=(cfg.orte?cfg.orte():[]).find(x=>x.id===id);return o?o.titel:(id||'–')}
function gruppiert(){const g=new Map();z.antworten.forEach(a=>{if(!g.has(a.aufgabe))g.set(a.aufgabe,[]);g.get(a.aufgabe).push(a)});return g}

function oeffneDialog(code){
  cfg.modal('Lernraum','<div id="lr-dialog" class="stack"></div>',root=>{
    const box=$('#lr-dialog',root);
    const zeichne=()=>{if(!document.body.contains(box))return stop();if(raum.istLehrkraft())dashboard(box);else if(raum.istSchueler())schuelerInfo(box);else startDialog(box,code)};
    let art0=s?s.rolle:'';
    const stop=raum.on(art=>{if(!document.body.contains(box))return stop();const art1=s?s.rolle:'';
      if(art1!==art0||art==='verbunden'||art==='ende'){art0=art1;zeichne()}else if(raum.istLehrkraft())aktualisiere(box)});
    zeichne();
  });
}

function startDialog(box,code){
  box.innerHTML=`<p class="task"><b>Lernraum:</b> Die Lehrkraft öffnet einen Raum, ihr tretet mit Code oder QR-Code bei – ohne Konto. Antworten aus den Schreibfeldern landen dann gesammelt vorn an der Wand.</p>
  <div class="mode-cards">
    <form class="panel stack" id="lr-join" novalidate><h3 class="title-l">Beitreten</h3>
      <p class="small muted">Gib den Code von vorn ein und wähle einen Spitznamen. Bitte nicht deinen vollen echten Namen.</p>
      <div class="ctrl"><label for="lr-code">Code</label><input id="lr-code" type="text" maxlength="8" autocomplete="off" autocapitalize="characters" spellcheck="false" value="${esc(code||'')}" style="font-family:var(--mono);font-size:1.5rem;letter-spacing:.2em;text-transform:uppercase"></div>
      <div class="ctrl"><label for="lr-nick">Spitzname</label><input id="lr-nick" type="text" maxlength="20" autocomplete="off"></div>
      <div class="fb bad" id="lr-jerr" hidden></div>
      <div class="cta"><button class="btn primary" type="submit" id="lr-jgo"><span class="ms">login</span>Beitreten</button></div></form>
    <div class="panel stack"><h3 class="title-l">Lehrkraft</h3>
      <p class="small muted">Öffne einen Raum für deine Klasse. Du siehst, wer gerade wo arbeitet, sammelst Antworten an der Wand, hältst alle Geräte an und gibst Werkstätten frei.</p>
      <div class="fb bad" id="lr-oerr" hidden></div>
      <div class="cta"><button class="btn" type="button" id="lr-open"><span class="ms">cast_for_education</span>Lernraum öffnen</button></div></div>
  </div>
  <p class="small muted">Gespeichert werden nur der Spitzname, die gerade geöffnete Werkstatt und Antworten, die du abschickst. „Raum beenden“ löscht alles sofort, sonst nach 24 Stunden.</p>`;
  const zeig=(id,e)=>{const el=$(id,box);if(e.html)el.innerHTML=e.message;else el.textContent=e.message;el.hidden=false};
  $('#lr-join',box).addEventListener('submit',async e=>{e.preventDefault();const b=$('#lr-jgo',box);b.disabled=true;
    try{await raum.beitreten($('#lr-code',box).value,$('#lr-nick',box).value);if(cfg.hinweis)cfg.hinweis(`Du bist im Lernraum ${s.code}.`)}
    catch(err){zeig('#lr-jerr',err)}finally{b.disabled=false}});
  $('#lr-open',box).addEventListener('click',async e=>{const b=e.currentTarget;b.disabled=true;try{await raum.oeffnen()}catch(err){console.warn(err);zeig('#lr-oerr',err.message?err:fehler('Der Lernraum konnte nicht geöffnet werden.'))}finally{b.disabled=false}});
  if(!code)$('#lr-code',box).focus();else $('#lr-nick',box).focus();
}

function schuelerInfo(box){
  box.innerHTML=`<div class="panel stack" style="max-width:600px"><p class="title-m"><span class="live-dot"></span>Du bist im Lernraum <b class="mono">${esc(s.code)}</b> als ${esc(s.nick)}.</p>
    <p class="small muted">Schreibfelder haben jetzt den Knopf „Abschicken“. Deine Antwort erscheint dann bei deiner Lehrkraft an der Wand.</p>
    <div class="cta"><button class="btn text" type="button" id="lr-leave"><span class="ms">logout</span>Raum verlassen</button></div>
    <div class="fb amb" id="lr-leave-q" hidden>Raum wirklich verlassen? Deine Einträge in diesem Raum werden gelöscht. <button class="btn small primary" type="button" id="lr-leave-y">Verlassen</button> <button class="btn small text" type="button" id="lr-leave-n">Abbrechen</button></div></div>`;
  $('#lr-leave',box).addEventListener('click',()=>{$('#lr-leave-q',box).hidden=false});
  $('#lr-leave-n',box).addEventListener('click',()=>{$('#lr-leave-q',box).hidden=true});
  $('#lr-leave-y',box).addEventListener('click',()=>raum.verlassen());
}

function dashboard(box){
  if(cfg.vorbereiten)cfg.vorbereiten();
  const url=linkZu(s.code),orte=cfg.orte?cfg.orte():[];
  box.innerHTML=`<div id="lr-dash" class="stack">
  <div class="grid2 wide-left"><div class="panel stack"><p class="eyebrow">Raumcode</p><div class="code lr-code">${esc(s.code)}</div>
    <p class="small">Seite öffnen → oben das Symbol <b>Lernraum</b> → Code eingeben. Oder QR-Code scannen.</p><p class="small muted mono" style="word-break:break-all">${esc(url)}</p>
    <div class="row"><button class="btn small" type="button" id="lr-beamer" aria-pressed="${raum.beamer()}">Beamer-Modus</button><button class="btn text small" type="button" id="lr-ende"><span class="ms">delete</span>Raum beenden</button></div>
    <div class="fb bad" id="lr-ende-q" hidden>Lernraum ${esc(s.code)} beenden? Alle Einträge und Antworten der Schüler werden sofort gelöscht. <button class="btn small primary" type="button" id="lr-ende-y">Raum löschen</button> <button class="btn small text" type="button" id="lr-ende-n">Abbrechen</button></div></div>
    <div class="panel stack" style="align-items:center"><div class="lr-qr">${qrSVG(url)}</div><p class="small muted">QR-Code zum Beitreten</p></div></div>
  <section class="panel stack"><h3>Steuerung</h3>
    <div class="row"><button class="btn" type="button" id="lr-anhalten"></button><span class="small muted">Auf allen Handys erscheint „Schau nach vorn“.</span></div>
    <div class="row"><label for="lr-ziel" class="small">Alle holen nach</label><select id="lr-ziel">${orte.map(o=>`<option value="${esc(o.id)}">${esc(o.titel)}</option>`).join('')}</select><button class="btn" type="button" id="lr-holen"><span class="ms">group</span>Alle dorthin</button></div>
    <details id="lr-frei"><summary class="small"><b>Werkstätten freigeben</b> – gesperrte Werkstätten können die Schüler nicht öffnen</summary>
      <div class="row" style="margin-top:8px" id="lr-frei-liste"></div>
      <div class="row" style="margin-top:8px"><button class="btn small" type="button" id="lr-alle-frei"><span class="ms">lock_open</span>Alle freigeben</button><button class="btn small" type="button" id="lr-alle-zu"><span class="ms">lock</span>Alle sperren</button></div></details>
  </section>
  <section class="panel stack" id="lr-teil"></section>
  <section class="panel stack" id="lr-antw"></section></div>`;
  $('#lr-beamer',box).addEventListener('click',()=>raum.setBeamer(!raum.beamer()));
  $('#lr-ende',box).addEventListener('click',()=>{$('#lr-ende-q',box).hidden=false});
  $('#lr-ende-n',box).addEventListener('click',()=>{$('#lr-ende-q',box).hidden=true});
  $('#lr-ende-y',box).addEventListener('click',async e=>{e.currentTarget.disabled=true;try{await raum.beenden();if(cfg.hinweis)cfg.hinweis('Lernraum beendet. Alle Daten sind gelöscht.')}catch(err){console.warn(err)}});
  $('#lr-anhalten',box).addEventListener('click',()=>raum.pause(!(z.raum&&z.raum.pause)));
  $('#lr-holen',box).addEventListener('click',()=>{raum.holen($('#lr-ziel',box).value);if(cfg.hinweis)cfg.hinweis('Alle Geräte springen dorthin.')});
  const werk=orte.filter(o=>o.art==='werkstatt');
  $('#lr-alle-frei',box).addEventListener('click',()=>raum.sperren([]));
  $('#lr-alle-zu',box).addEventListener('click',()=>raum.sperren(werk.map(o=>o.id)));
  $('#lr-frei-liste',box).addEventListener('click',e=>{const b=e.target.closest('[data-frei]');if(!b)return;const id=b.dataset.frei,g=new Set((z.raum&&z.raum.gesperrt)||[]);g.has(id)?g.delete(id):g.add(id);raum.sperren([...g])});
  aktualisiere(box);
}

function aktualisiere(box){
  if(!$('#lr-dash',box))return;
  const r=z.raum||{},orte=cfg.orte?cfg.orte():[],gesperrt=new Set(r.gesperrt||[]),beamer=raum.beamer();
  $('#lr-beamer',box).setAttribute('aria-pressed',String(beamer));
  $('#lr-anhalten',box).innerHTML=r.pause?'<span class="ms">play_arrow</span>Weiter':'<span class="ms">pause</span>Alle anhalten';
  $('#lr-anhalten',box).classList.toggle('primary',!!r.pause);
  $('#lr-frei-liste',box).innerHTML=orte.filter(o=>o.art==='werkstatt').map(o=>`<button class="btn small" type="button" data-frei="${esc(o.id)}" aria-pressed="${!gesperrt.has(o.id)}">${esc(o.titel)}</button>`).join('');
  const n=z.spieler.length,antw=gruppiert();
  const anzahl=uid=>z.antworten.filter(a=>a.uid===uid).length;
  $('#lr-teil',box).innerHTML=`<div class="row" style="justify-content:space-between"><h3 class="title-l">Teilnehmer</h3><span class="small muted">${n} ${n===1?'Person':'Personen'} im Raum</span></div>
    ${n?`<div class="tbl-wrap"><table><thead><tr><th>${beamer?'Gerät':'Spitzname'}</th><th>Gerade in</th><th class="r">Antworten</th>${beamer?'':'<th></th>'}</tr></thead><tbody>${z.spieler.map(p=>`<tr><td>${esc(raum.name(p.uid))}</td><td>${esc(ortName(p.ort))}</td><td class="r num">${anzahl(p.uid)}</td>${beamer?'':`<td class="r"><button class="icon-btn" type="button" data-lr-kick="${esc(p.uid)}" aria-label="${esc(p.nick)} entfernen" title="Entfernen"><span class="ms">person_remove</span></button></td>`}</tr>`).join('')}</tbody></table></div>`:'<p class="small muted">Noch niemand im Raum.</p>'}`;
  $$('[data-lr-kick]',box).forEach(b=>b.addEventListener('click',()=>raum.kick(b.dataset.lrKick).catch(e=>console.warn(e))));
  const wand=[...AUFGABEN.values()].filter(a=>a.wand);
  $('#lr-antw',box).innerHTML=`<div class="row" style="justify-content:space-between"><h3 class="title-l">Antworten an der Wand</h3><button class="btn small" type="button" id="lr-druck"><span class="ms">print</span>Alle Antworten drucken</button></div>
    <div class="tbl-wrap"><table><tbody>${wand.map(a=>{const k=(antw.get(a.id)||[]).length;return `<tr><td>${esc(a.frage)}<div class="small muted">${esc(ortName(a.tool))}</div></td><td class="r num">${k}</td><td class="r">${a.tool?`<button class="btn text small" type="button" data-lr-wand="${esc(a.tool)}">Zur Wand</button>`:''}</td></tr>`}).join('')}</tbody></table></div>`;
  $$('[data-lr-wand]',box).forEach(b=>b.addEventListener('click',()=>cfg.gehZu&&cfg.gehZu(b.dataset.lrWand)));
  $('#lr-druck',box).addEventListener('click',drucken);
}

/** Druckansicht aller Antworten (im Browser „Als PDF speichern“). Im Beamer-Modus ohne Spitznamen. */
function drucken(){
  if(cfg.vorbereiten)cfg.vorbereiten();
  const antw=gruppiert();
  let el=$('#druck');if(!el){el=document.createElement('div');el.id='druck';document.body.append(el)}
  const datum=new Date().toLocaleDateString('de-DE',{day:'numeric',month:'long',year:'numeric'});
  el.innerHTML=`<h1>Antworten aus dem Lernraum ${esc(s.code)}</h1><p>${esc(document.title)} · ${esc(datum)}</p>
    ${[...AUFGABEN.values()].filter(a=>a.wand&&antw.has(a.id)).map(a=>`<section><h2>${esc(a.frage)}</h2><ol>${antw.get(a.id).map(x=>`<li><p>${esc(x.text)}</p>${raum.beamer()?'':`<p class="druck-name">${esc(raum.name(x.uid))}</p>`}</li>`).join('')}</ol></section>`).join('')||'<p>Noch keine Antworten.</p>'}`;
  window.print();
}
