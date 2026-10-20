// Lernraum: ein Live-Raum für die ganze Lernwerkstatt eines Themas, auch für das Planspiel.
// Die Lehrkraft öffnet den Raum, die Schüler treten mit Code und Spitznamen bei, ohne Konto.
// Die Lehrkraft sieht, wer gerade wo arbeitet, sammelt Antworten „an der Wand“, hält alle Geräte an,
// holt alle in eine Werkstatt, gibt Werkstätten frei und sieht in jeder Werkstatt das Lehrerpanel.
// Aus dem Wissenscheck kommen nur Punkte (keine Texte); ein AIS.chat-Link der Lehrkraft schaltet den KI-Coach frei.
// „Ihr seid das Gericht“: Die Lehrkraft startet eine Abstimmung (Raumfeld umfrage), die Handys zeigen sie in einem Fenster,
// jede Stimme landet im eigenen Eintrag (Feld stimme), die Lehrkraft zählt und deckt auf.
// Klassen-Quiz (quiz.js): Die Lehrkraft steuert das Quiz (Raumfeld quiz), jede Antwort ist eine Zahl im eigenen Eintrag (Feld q),
// das Team steht im Feld team. Punkte und Plätze rechnet das Gerät der Lehrkraft aus, Spitznamen gehen nicht in den Raum.
// Die Verbindung läuft ausschließlich über live.js. Eingebunden wird der Lernraum von werkstatt.js.
// Bei einem Verbindungsproblem bleibt die Sitzung erhalten („Erneut verbinden“); verworfen wird nur ein Raum,
// den es sicher nicht (mehr) gibt. Das Gerät der Lehrkraft merkt sich seinen offenen Raum pro Thema
// (<speicher>-eigener-raum) und beendet ihn, wenn es einen neuen öffnet.
import { $, $$, esc, store, neuZeichnen } from './ui.js';
import { connect, liveFehler } from './live.js';
import { THEMEN } from '../../themen.js';

const CODE_ALPHA=/[^A-HJ-NP-Z2-9]/g;
export const normCode=s=>String(s||'').toUpperCase().replace(CODE_ALPHA,'').slice(0,6);
export function qrSVG(text){try{if(!window.qrcode)return '';const q=window.qrcode(0,'M');q.addData(text);q.make();return q.createSvgTag({cellSize:6,margin:2,scalable:true,alt:'QR-Code zum Beitreten'})}catch(e){return ''}}
/** Beitrittslink: #raum=CODE öffnet den Lernraum, #join=CODE das Planspiel. */
export const linkZu=(code,art='raum')=>location.href.split('#')[0]+'#'+art+'='+code;

/* ---------- Verzeichnis der Aufgaben ----------
   Aufgaben mit Lösung oder Antwort melden sich hier an: {id, frage, loesung:[…], wand:true|false, tool}.
   Der Wissenscheck meldet zusätzlich check:{stufen, aufgaben:[{afb, p, kurz}]} und ki (Anweisung für AIS.chat),
   eine Abstimmung umfrage:{fall, frage, optionen, r, e}.
   Das Lehrerpanel, das Dashboard und die Druckansicht lesen daraus. */
export const AUFGABEN=new Map();
let aktuellesTool=null;
/** Führt f aus und ordnet alle dabei angemeldeten Aufgaben der Werkstatt id zu. */
export function imTool(id,f){const alt=aktuellesTool;aktuellesTool=id;try{return f()}finally{aktuellesTool=alt}}
export function registriere(def){AUFGABEN.set(def.id,{...def,tool:aktuellesTool||AUFGABEN.get(def.id)?.tool||null});return def}

/* ---------- Sitzung ---------- */
let cfg={}, L=null, s=null, z={raum:null,spieler:[],antworten:[],verbindung:''}, abos=[], ortT=null, gemeldet='', ergT=null, ergGemeldet='', schliesst=false;
const hoerer=new Set();
const speichern=()=>store(cfg.speicher+'-raum',s);
// Eigener offener Raum der Lehrkraft (bleibt auch, wenn die Sitzung verloren geht, bis der Raum sicher gelöscht ist)
const eigenerRaum=v=>v===undefined?store(cfg.speicher+'-eigener-raum'):store(cfg.speicher+'-eigener-raum',v);
function melde(art){hoerer.forEach(f=>{try{f(art)}catch(e){console.warn(e)}})}
function abmelden(){abos.forEach(u=>{try{u()}catch(e){}});abos=[]}
function ende(meldung){abmelden();s=null;speichern();z={raum:null,spieler:[],antworten:[],verbindung:''};melde('ende');if(meldung&&cfg.hinweis)cfg.hinweis(meldung)}
/** Fehler mit Text für die Seite; feld: 'code' oder 'nick', wenn ein Eingabefeld betroffen ist */
function fehler(text,html,feld){const e=new Error(text);e.html=!!html;e.feld=feld||'';return e}
/** Knopf „Seite neu laden“; hash (z. B. raum=K7Q2XM) kommt vorher wieder in die Adresse */
export const neuLadenHTML=(hash,kl='btn small')=>`<button class="${kl}" type="button" data-neu-laden="${esc(hash||'')}"><span class="ms" aria-hidden="true">refresh</span>Seite neu laden</button>`;
document.addEventListener('click',e=>{const b=e.target.closest('[data-neu-laden]');if(!b)return;const h=b.dataset.neuLaden;try{if(h)history.replaceState(null,'','#'+h)}catch(x){}location.reload()});
/** Fehler, wenn connect() null lieferte: nicht eingerichtet oder keine Verbindung (mit „Seite neu laden“, wenn nur das hilft) */
function ohneVerbindung(hash,config){
  const g=liveFehler();
  if(g==='config')return fehler(config);
  if(g==='laden')return fehler(`Keine Verbindung zum Lernraum. Prüfe das WLAN und lade die Seite neu. ${neuLadenHTML(hash)}`,true);
  return fehler('Keine Verbindung zum Lernraum. Prüfe das WLAN und versuch es noch einmal.');
}
const netzFehler=()=>fehler('Keine Verbindung zum Lernraum. Prüfe das WLAN und versuch es noch einmal.');

/** Verbindet die gespeicherte Sitzung. Bei Verbindungsproblemen bleibt sie erhalten (z.verbindung = 'netz' oder 'laden'). */
async function anbinden(still){
  if(!s)return;
  const code=s.code;
  z.verbindung='verbindet';melde('verbindung');
  L=await connect();
  if(!s||s.code!==code)return;
  const getrennt=g=>{z.verbindung=g;melde('verbindung');if(!still&&cfg.hinweis)cfg.hinweis('Keine Verbindung zum Lernraum. Tippe oben auf das Symbol Lernraum, um es noch einmal zu versuchen.')};
  if(!L){if(liveFehler()==='config')return ende(null);return getrennt(liveFehler()||'netz')}
  abmelden();
  if(s.rolle==='lk'){
    const st=await L.raumStatus(code);
    if(!s||s.code!==code)return;
    if(st.fehler)return getrennt('netz');
    const r=st.raum;
    if(!r||r.owner!==L.uid||r.phase==='closed'){
      // Abgebrochenes „Raum beenden“: den Rest still löschen
      if(r&&r.owner===L.uid&&r.phase==='closed')L.closeRoom(code).then(()=>{if(eigenerRaum()===code)eigenerRaum(null)},e=>console.warn(e));
      else if(eigenerRaum()===code)eigenerRaum(null);
      return ende(null);
    }
    z.raum=r;z.verbindung='';
    // Während „Raum beenden“ läuft, beendet erst beenden() die Sitzung (sonst wäre ein Fehler beim Löschen nicht mehr zu melden)
    abos.push(L.watchRoom(code,d=>{if(!s||schliesst)return;if(!d||d.phase==='closed')return ende('Der Lernraum wurde beendet.');z.raum=d;melde('raum')}));
    abos.push(L.watchPlayers(code,ps=>{z.spieler=ps.sort((a,b)=>((a.joinedAt&&a.joinedAt.seconds)||0)-((b.joinedAt&&b.joinedAt.seconds)||0));melde('spieler')}));
    abos.push(L.watchAnswers(code,as=>{z.antworten=as;melde('antworten')}));
  }else{
    z.verbindung='';
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
/** Code und Titel des Themas für die Beschreibung des Beitrittswegs */
const themaTitel=()=>(THEMEN.find(x=>x.id===cfg.thema)||{}).titel||'';
/** Weg zum Beitreten in Worten: art 'raum' (Lernraum) oder 'join' (Planspiel) */
export function beitrittsWeg(art){
  const t=themaTitel(),wo=`<b>${esc(location.host||'wr-lab.web.app')}</b>${t?` → Thema <b>„${esc(t)}“</b>`:''}`;
  return art==='join'?`${wo} → <b>Planspiel</b> → <b>Schüler</b> → Code eingeben. Oder QR-Code scannen.`:`${wo} → oben das Symbol <b>Lernraum</b> → Code eingeben. Oder QR-Code scannen.`;
}

export const raum={
  /** c = {speicher, thema, hinweis(text), gehZu(id), ort(), orte(), modal(title, html, init), vorbereiten()} */
  init(c){cfg=c;s=store(cfg.speicher+'-raum');if(s&&!s.code)s=null;if(s)anbinden()},
  /** Zustand der Verbindung einer gespeicherten Sitzung: '' (verbunden oder keine Sitzung), 'verbindet', 'netz', 'laden' */
  verbindung:()=>s?z.verbindung:'',
  /** Neuer Verbindungsversuch nach einem Verbindungsproblem („Erneut verbinden“) */
  verbinden:()=>anbinden(true),
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
  /** Lehrkraft: neuen Raum öffnen. Ein alter, noch offener Raum dieses Geräts im selben Thema wird dabei beendet. */
  async oeffnen(){
    L=await connect();
    if(!L)throw ohneVerbindung('','Der Lernraum ist nicht eingerichtet. Wie du ihn einschaltest, steht in der README im GitHub-Projekt.');
    const alt=eigenerRaum();
    if(alt&&!(s&&s.code===alt)){const st=await L.raumStatus(alt);if(st.raum&&st.raum.owner===L.uid)await L.closeRoom(alt).catch(e=>console.warn('Alter Raum',e))}
    let code;
    try{code=await L.createRoom(cfg.thema,Math.random().toString(36).slice(2,8))}
    catch(e){console.warn(e);throw fehler('Der Lernraum konnte nicht geöffnet werden. Prüfe das WLAN und versuch es noch einmal.')}
    eigenerRaum(code);s={code,rolle:'lk'};speichern();await anbinden(true);melde('start');return code;
  },
  /** Schüler: mit Code und Spitznamen beitreten. Gibt die Raumdaten zurück, wirft bei Problemen einen Fehler mit Text. */
  async beitreten(code,nick){
    code=normCode(code);nick=String(nick||'').trim().replace(/\s+/g,' ').slice(0,20);
    if(code.length!==6)throw fehler('Der Code hat sechs Zeichen, zum Beispiel K7Q2XM.',false,'code');
    if(!nick)throw fehler('Bitte gib einen Spitznamen ein.',false,'nick');
    if(s&&s.rolle==='lk')throw fehler('Auf diesem Gerät ist schon ein Lernraum als Lehrkraft geöffnet.');
    L=await connect();
    if(!L)throw ohneVerbindung('raum='+code,'Der Lernraum ist nicht eingerichtet.');
    const st=await L.raumStatus(code);
    if(st.fehler)throw netzFehler();
    const r=st.raum;
    if(!r||r.phase==='closed')throw fehler('Diesen Raum gibt es nicht (mehr). Prüfe den Code.',false,'code');
    if(r.topic&&r.topic!==cfg.thema){
      const th=THEMEN.find(x=>x.id===r.topic);
      if(!th)throw fehler('Dieser Code gehört zu einem anderen Thema.',false,'code');
      throw fehler(`Dieser Code gehört zum Thema „${esc(th.titel)}“. <a href="../${th.id}/#raum=${code}">Dort beitreten</a>`,true,'code');
    }
    if(!r.open)throw fehler('Dieser Raum nimmt gerade niemanden auf.',false,'code');
    const gleich=s&&s.rolle==='schueler'&&s.code===code,ort=String(cfg.ort?cfg.ort():'').slice(0,40);
    // Gibt es den eigenen Eintrag nicht mehr, wird er neu angelegt (mit Ablaufdatum, das verlangen die Regeln)
    try{if(gleich)await L.updatePlayer(code,{nick}).catch(()=>L.joinRoom(code,{nick,ort}));else await L.joinRoom(code,{nick,ort})}
    catch(e){console.warn(e);throw fehler('Beitreten hat nicht geklappt. Prüfe das WLAN und versuch es noch einmal.')}
    s={code,nick,rolle:'schueler',zielN:r.zielN||0,gesendet:gleich?(s.gesendet||{}):{},urteile:gleich?(s.urteile||{}):{},quiz:gleich?s.quiz:null,team:gleich?(s.team||0):0};speichern();gemeldet='';ergGemeldet='';
    await anbinden(true);melde('start');return r;
  },
  /** Schüler: Raum verlassen. Löscht den eigenen Eintrag und die eigenen Antworten an der Wand. */
  async verlassen(){
    if(!s)return;
    if(cfg.vorbereiten&&s.rolle==='schueler')cfg.vorbereiten();
    // Die Liste der eigenen Antworten dürfen Schüler nicht lesen: alle Wand-Aufgaben probieren (fehlende lehnen die Regeln ab)
    const c=s.code,ids=new Set([...Object.keys(s.gesendet||{}),...[...AUFGABEN.values()].filter(a=>a.wand).map(a=>a.id)]);
    ende(null);if(!L)return;
    await Promise.all([...[...ids].map(a=>L.deleteAnswer(c,a)),L.kick(c,L.uid)].map(p=>p.catch(()=>{})));
  },
  /** Lehrkraft: Raum beenden. Erst wenn alles gelöscht ist, endet die Sitzung; sonst wirft es (noch einmal versuchen). */
  async beenden(){
    if(!s)return;const c=s.code;schliesst=true;
    try{await L.closeRoom(c)}finally{schliesst=false}
    if(eigenerRaum()===c)eigenerRaum(null);
    ende(null);
  },
  vergessen(){if(s)ende(null)},
  /** Schüler: meldet, in welcher Werkstatt oder welchem Bereich das Gerät gerade ist. */
  sendeOrt(id){if(!s||s.rolle!=='schueler'||!L)return;clearTimeout(ortT);ortT=setTimeout(()=>{if(!s||id===gemeldet)return;gemeldet=id;L.updatePlayer(s.code,{ort:String(id).slice(0,40)}).catch(e=>console.warn('Ort',e))},500)},
  async sendeAntwort(aufgabe,text){
    if(!s||s.rolle!=='schueler'||!L)throw fehler('Du bist in keinem Lernraum.');
    await L.sendAnswer(s.code,aufgabe,text);
    s.gesendet={...(s.gesendet||{}),[aufgabe]:text};speichern();melde('gesendet');
  },
  gesendet:aufgabe=>s&&s.gesendet?s.gesendet[aufgabe]:undefined,
  /** Schüler: Punkte aus dem Wissenscheck melden, ein Zeichen pro Aufgabe (siehe aufgaben.js). */
  sendeErgebnis(code){if(!s||s.rolle!=='schueler'||!L)return;clearTimeout(ergT);ergT=setTimeout(()=>{if(!s||code===ergGemeldet)return;ergGemeldet=code;L.updatePlayer(s.code,{wc:String(code).slice(0,60)}).catch(e=>console.warn('Wissenscheck',e))},800)},
  /** Link zum geteilten Lernszenario in AIS.chat, den die Lehrkraft im Dashboard einträgt. */
  kiLink:()=>(s&&z.raum&&z.raum.ki)||'',
  setzeKi:url=>steuern({ki:url}),
  /** Live-Abstimmung: laufende Umfrage {id, n, auf} oder {} */
  umfrage:()=>(z.raum&&z.raum.umfrage&&z.raum.umfrage.id)?z.raum.umfrage:{},
  starteUmfrage(id){const u=(z.raum&&z.raum.umfrage)||{};return steuern({umfrage:{id,n:(u.n||0)+1,auf:false}})},
  deckeAuf(){const u=raum.umfrage();if(u.id)return steuern({umfrage:{...u,auf:true}})},
  beendeUmfrage(){const u=(z.raum&&z.raum.umfrage)||{};return steuern({umfrage:{id:'',n:u.n||0,auf:false}})},
  /** Lehrkraft: Stimmen pro Antwort für die laufende Umfrage */
  stimmen(){const u=raum.umfrage(),a=AUFGABEN.get(u.id),k=a&&a.umfrage?a.umfrage.optionen.length:0,st=Array(k).fill(0);
    z.spieler.forEach(p=>{const v=p.stimme;if(v&&v.n===u.n&&v.w>=0&&v.w<k)st[v.w]++});return st},
  /** Schüler: abstimmen (bis zur Auflösung änderbar) */
  async stimme(w){const u=raum.umfrage();if(!s||s.rolle!=='schueler'||!L||!u.id||u.auf)return;s.stimme={n:u.n,w};speichern();umfrageFenster();melde('stimme');await L.updatePlayer(s.code,{stimme:{n:u.n,w}})},
  /** Schüler: eigene Stimme in der laufenden Umfrage oder null */
  meineStimme(){const u=raum.umfrage();return s&&s.stimme&&u.id&&s.stimme.n===u.n?s.stimme.w:null},
  /** Schüler: eigenes Urteil zu einer aufgelösten Abstimmung {w} */
  urteil:id=>s&&s.urteile?s.urteile[id]:undefined,
  /** Klassen-Quiz: laufendes Quiz {id, n, ph, i, nr, von, t, s, team, pkt, teams} oder {} */
  quiz:()=>(z.raum&&z.raum.quiz&&z.raum.quiz.id)?z.raum.quiz:{},
  /** Lehrkraft: das ganze Quiz-Feld setzen; zeit: true setzt t auf die Uhrzeit des Servers (Start der Frage) */
  steuereQuiz:(q,zeit)=>steuern({quiz:zeit&&L?{...q,t:L.zeit()}:q}),
  /** Schüler: Antwort auf die laufende Frage n (eine pro Frage, den Zeitpunkt setzt der Server) */
  async quizAntwort(n,w){if(!s||s.rolle!=='schueler'||!L)return;s.quiz={n,w};speichern();melde('quiz');
    try{await L.updatePlayer(s.code,{q:{n,w,at:L.zeit()}})}catch(e){if(s&&s.quiz&&s.quiz.n===n){s.quiz=null;speichern();melde('quiz')}throw e}},
  /** Schüler: eigene Antwort auf die Frage n oder null */
  quizMeins:n=>s&&s.quiz&&s.quiz.n===n?s.quiz.w:null,
  /** Schüler: eigenes Team (0 = keins) und Team wählen */
  team:()=>(s&&s.team)||0,
  async waehleTeam(k){if(!s||s.rolle!=='schueler'||!L)return;s.team=k;speichern();melde('quiz');await L.updatePlayer(s.code,{team:k})},
  /** Alle Werkstätten einmal zeichnen, damit ihre Aufgaben angemeldet sind (z. B. für ein Fenster, das der Raum öffnet) */
  vorbereiten:()=>{if(cfg.vorbereiten)cfg.vorbereiten()},
  /** Kennung dieses Geräts (für die eigenen Punkte im Quiz) */
  uid:()=>L?L.uid:'',
  /** Titel einer Werkstatt oder eines Bereichs. */
  titel:id=>ortName(id),
  pause:b=>steuern({pause:!!b}),
  holen:id=>steuern({ziel:id,zielN:((z.raum&&z.raum.zielN)||0)+1}),
  sperren:ids=>steuern({gesperrt:ids}),
  /** Lehrkraft: Teilnehmer entfernen, auf Wunsch mit seinen Antworten an der Wand */
  async kick(uid,mitAntworten){
    const c=s.code;
    if(mitAntworten)await Promise.all(z.antworten.filter(a=>a.uid===uid).map(a=>L.deleteAnswer(c,a.aufgabe,uid)));
    await L.kick(c,uid);
  },
  /** Lehrkraft: eine Antwort von der Wand löschen */
  loescheAntwort(aufgabe,uid){if(!raum.istLehrkraft())return Promise.resolve();return L.deleteAnswer(s.code,aufgabe,uid)},
  /** Kennung einer Person an der Wand: Spitzname oder (im Beamer-Modus) eine Nummer. */
  name(uid){const i=z.spieler.findIndex(p=>p.uid===uid);if(raum.beamer())return i<0?'Gerät':'Gerät '+(i+1);return i<0?'?':z.spieler[i].nick},
  oeffneDialog
};

/* ---------- Barrierefreiheit: Fehler an Feldern, Hintergrund sperren (neu zeichnen: neuZeichnen in ui.js) ---------- */
/** Pause („Schau nach vorn“), Abstimmungsfenster und Quiz-Fenster sind echt modal: alles dahinter wird inert (keine Tab-Stopps, kein Vorlesen). */
export function sperreHintergrund(){
  const p=$('#lr-pause'),pause=!!p&&!p.hidden,fenster=['#lr-umfrage','#qz'].map(sel=>$(sel)).filter(Boolean),offen=fenster.some(f=>!f.hidden);
  ['.app','#modal'].forEach(sel=>{const e=$(sel);if(e)e.inert=pause||offen});
  fenster.forEach(f=>{f.inert=pause});
}
/** Fehlermeldung beim Beitreten zeigen (role=alert) und mit dem betroffenen Feld verknüpfen; felder = {code:'#…', nick:'#…'} */
export function fehlerZeigen(root,box,err,felder){
  if(err.html)box.innerHTML=err.message;else box.textContent=err.message;box.hidden=false;
  const f=felder&&felder[err.feld]&&$(felder[err.feld],root);
  if(f){f.setAttribute('aria-invalid','true');f.setAttribute('aria-describedby',box.id)}
}
/** Vor einem neuen Versuch: Meldung ausblenden, Felder wieder als gültig markieren (so wird ein erneuter Fehler wieder angesagt). */
export function fehlerWeg(root,box,felder){
  box.hidden=true;box.textContent='';
  Object.values(felder||{}).forEach(sel=>{const f=$(sel,root);if(f){f.removeAttribute('aria-invalid');f.removeAttribute('aria-describedby')}});
}

/* ---------- Dialog: beitreten, öffnen, Dashboard ---------- */
function ortName(id){const o=(cfg.orte?cfg.orte():[]).find(x=>x.id===id);return o?o.titel:(id||'–')}
function gruppiert(){const g=new Map();z.antworten.forEach(a=>{if(!g.has(a.aufgabe))g.set(a.aufgabe,[]);g.get(a.aufgabe).push(a)});return g}

function oeffneDialog(code){
  cfg.modal('Lernraum','<div id="lr-dialog" class="stack"></div>',root=>{
    const box=$('#lr-dialog',root);
    const zeichne=()=>{if(!document.body.contains(box))return stop();if(raum.verbindung())verbindungInfo(box);else if(raum.istLehrkraft())dashboard(box);else if(raum.istSchueler())schuelerInfo(box);else startDialog(box,code)};
    let art0=s?s.rolle:'';
    const stop=raum.on(art=>{if(!document.body.contains(box))return stop();const art1=s?s.rolle:'';
      if(art1!==art0||art==='verbunden'||art==='ende'||art==='verbindung'){art0=art1;zeichne()}else if(raum.istLehrkraft())aktualisiere(box)});
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
      <div class="fb bad" id="lr-jerr" role="alert" hidden></div>
      <div class="cta"><button class="btn primary" type="submit" id="lr-jgo"><span class="ms" aria-hidden="true">login</span>Beitreten</button></div></form>
    <div class="panel stack"><h3 class="title-l">Lehrkraft</h3>
      <p class="small muted">Öffne einen Raum für deine Klasse. Du siehst, wer gerade wo arbeitet, sammelst Antworten an der Wand, hältst alle Geräte an und gibst Werkstätten frei.</p>
      <div class="fb bad" id="lr-oerr" role="alert" hidden></div>
      <div class="cta"><button class="btn" type="button" id="lr-open"><span class="ms" aria-hidden="true">cast_for_education</span>Lernraum öffnen</button></div></div>
  </div>
  <p class="small muted" id="lr-datenschutz">Gespeichert werden nur dein Spitzname, wo du gerade arbeitest (die geöffnete Werkstatt), Antworten, die du abschickst, deine Stimmen bei Abstimmungen, deine Antworten im Klassen-Quiz (nur die gewählte Antwort und wann du sie gegeben hast) und deine Punkte im Wissenscheck (keine Texte), im Planspiel auch deine Figur und dein Spielstand. „Raum verlassen“ löscht deinen Eintrag und deine Antworten, „Raum beenden“ löscht alles sofort. <a href="/datenschutz.html">Mehr zum Datenschutz</a></p>`;
  const felder={code:'#lr-code',nick:'#lr-nick'},jerr=$('#lr-jerr',box),oerr=$('#lr-oerr',box);
  // Wer ein markiertes Feld korrigiert, bekommt es wieder als gültig angezeigt
  Object.values(felder).forEach(sel=>$(sel,box).addEventListener('input',e=>e.target.removeAttribute('aria-invalid')));
  $('#lr-join',box).addEventListener('submit',async e=>{e.preventDefault();const b=$('#lr-jgo',box);b.disabled=true;fehlerWeg(box,jerr,felder);
    try{await raum.beitreten($('#lr-code',box).value,$('#lr-nick',box).value);if(cfg.hinweis)cfg.hinweis(`Du bist im Lernraum ${s.code}.`)}
    catch(err){fehlerZeigen(box,jerr,err,felder)}finally{b.disabled=false}});
  $('#lr-open',box).addEventListener('click',async e=>{const b=e.currentTarget;b.disabled=true;fehlerWeg(box,oerr);try{await raum.oeffnen()}catch(err){console.warn(err);fehlerZeigen(box,oerr,err.message?err:fehler('Der Lernraum konnte nicht geöffnet werden.'))}finally{b.disabled=false}});
  if(!code)$('#lr-code',box).focus();else $('#lr-nick',box).focus();
}

function schuelerInfo(box){
  box.innerHTML=`<div class="panel stack" style="max-width:600px"><p class="title-m"><span class="live-dot"></span>Du bist im Lernraum <b class="mono">${esc(s.code)}</b> als ${esc(s.nick)}.</p>
    <p class="small muted">Schreibfelder haben jetzt den Knopf „Abschicken“. Deine Antwort erscheint dann bei deiner Lehrkraft an der Wand.</p>
    <div class="cta"><button class="btn text" type="button" id="lr-leave"><span class="ms" aria-hidden="true">logout</span>Raum verlassen</button></div>
    <div class="fb amb" id="lr-leave-q" hidden>Raum wirklich verlassen? Dein Eintrag und deine Antworten an der Wand werden gelöscht. <button class="btn small primary" type="button" id="lr-leave-y">Verlassen</button> <button class="btn small text" type="button" id="lr-leave-n">Abbrechen</button></div></div>`;
  $('#lr-leave',box).addEventListener('click',()=>{$('#lr-leave-q',box).hidden=false});
  $('#lr-leave-n',box).addEventListener('click',()=>{$('#lr-leave-q',box).hidden=true});
  $('#lr-leave-y',box).addEventListener('click',()=>raum.verlassen());
}

let kickFrage=null; // offene Rückfrage beim Entfernen: {uid, antw}
/** Gespeicherte Sitzung ohne Verbindung: Sitzung bleibt, „Erneut verbinden“ (oder „Seite neu laden“, wenn nur das hilft) */
function verbindungInfo(box){
  const v=raum.verbindung(),warDrin=box.contains(document.activeElement),lk=s.rolle==='lk';
  if(v==='verbindet'){box.innerHTML=`<div class="panel row" role="status" style="max-width:600px"><span class="ms" aria-hidden="true">hourglass_top</span><span>Verbinde mit dem Lernraum <b class="mono">${esc(s.code)}</b> …</span></div>`;return}
  box.innerHTML=`<div class="panel stack" style="max-width:600px">
    <div class="fb bad" role="alert" id="lr-netz"><b>Keine Verbindung zum Lernraum.</b> ${v==='laden'?'Prüfe das WLAN und lade die Seite neu.':'Prüfe das WLAN und versuch es noch einmal.'}</div>
    <p class="small">Dein Lernraum <b class="mono">${esc(s.code)}</b>${lk?' (Lehrkraft)':` (du bist ${esc(s.nick)})`} bleibt auf diesem Gerät gespeichert.${lk?' Die Schüler können in der Zwischenzeit weiterarbeiten.':''}</p>
    <div class="cta">${v==='laden'?neuLadenHTML('','btn primary'):'<button class="btn primary" type="button" id="lr-neu"><span class="ms" aria-hidden="true">refresh</span>Erneut verbinden</button>'}
      <button class="btn text" type="button" id="lr-vergessen"><span class="ms" aria-hidden="true">logout</span>Auf diesem Gerät vergessen</button></div>
    <div class="fb amb" id="lr-vergessen-q" hidden>Lernraum ${esc(s.code)} auf diesem Gerät vergessen? ${lk?'Dann kannst du ihn von hier aus nicht mehr steuern. Öffnest du später einen neuen Raum, wird dieser beendet.':'Dein Eintrag bleibt dann im Raum, bis die Lehrkraft ihn beendet.'} <button class="btn small primary" type="button" id="lr-vergessen-y">Vergessen</button> <button class="btn small text" type="button" id="lr-vergessen-n">Abbrechen</button></div></div>`;
  $('#lr-neu',box)?.addEventListener('click',()=>raum.verbinden());
  $('#lr-vergessen',box).addEventListener('click',()=>{$('#lr-vergessen-q',box).hidden=false;$('#lr-vergessen-y',box).focus()});
  $('#lr-vergessen-n',box).addEventListener('click',()=>{$('#lr-vergessen-q',box).hidden=true;$('#lr-vergessen',box).focus()});
  $('#lr-vergessen-y',box).addEventListener('click',()=>raum.vergessen());
  // Nach einem gescheiterten Versuch steht der Fokus wieder auf dem Knopf (die Meldung sagt role=alert an)
  if(warDrin||document.activeElement===document.body)($('#lr-neu',box)||$('[data-neu-laden]',box)).focus();
}

function dashboard(box){
  if(cfg.vorbereiten)cfg.vorbereiten();kickFrage=null;
  const url=linkZu(s.code),orte=cfg.orte?cfg.orte():[];
  box.innerHTML=`<div id="lr-dash" class="stack">
  <div class="grid2 wide-left"><div class="panel stack"><p class="eyebrow">Raumcode</p><div class="code lr-code">${esc(s.code)}</div>
    <p class="small" id="lr-weg">${beitrittsWeg('raum')}</p><p class="small muted mono" style="word-break:break-all">${esc(url)}</p>
    <div class="row"><button class="btn small" type="button" id="lr-beamer" aria-pressed="${raum.beamer()}">Beamer-Modus</button><button class="btn text small" type="button" id="lr-ende"><span class="ms" aria-hidden="true">delete</span>Raum beenden</button></div>
    <div class="fb bad" id="lr-ende-q" hidden>Lernraum ${esc(s.code)} beenden? Alle Einträge und Antworten der Schüler werden sofort gelöscht. <button class="btn small primary" type="button" id="lr-ende-y">Raum löschen</button> <button class="btn small text" type="button" id="lr-ende-n">Abbrechen</button>
      <p class="small" id="lr-ende-err" role="alert" hidden></p></div></div>
    <div class="panel stack" style="align-items:center"><div class="lr-qr">${qrSVG(url)}</div><p class="small muted">QR-Code zum Beitreten</p></div></div>
  <section class="panel stack"><h3>Steuerung</h3>
    <div class="row"><button class="btn" type="button" id="lr-anhalten"></button><span class="small muted">Auf allen Handys erscheint „Schau nach vorn“.</span></div>
    <div class="row"><label for="lr-ziel" class="small">Alle holen nach</label><select id="lr-ziel">${orte.map(o=>`<option value="${esc(o.id)}">${esc(o.titel)}</option>`).join('')}</select><button class="btn" type="button" id="lr-holen"><span class="ms" aria-hidden="true">group</span>Alle dorthin</button></div>
    <details id="lr-frei"><summary class="small"><b>Werkstätten freigeben</b> – gesperrte Werkstätten können die Schüler nicht öffnen</summary>
      <div class="row" style="margin-top:8px" id="lr-frei-liste"></div>
      <div class="row" style="margin-top:8px"><button class="btn small" type="button" id="lr-alle-frei"><span class="ms" aria-hidden="true">lock_open</span>Alle freigeben</button><button class="btn small" type="button" id="lr-alle-zu"><span class="ms" aria-hidden="true">lock</span>Alle sperren</button></div></details>
  </section>
  <section class="panel stack" id="lr-teil"></section>
  <section class="panel stack" id="lr-wc" hidden></section>
  <section class="panel stack" id="lr-abst" hidden></section>
  <section class="panel stack" id="lr-antw"></section>
  ${kiHTML()}</div>`;
  $('#lr-beamer',box).addEventListener('click',()=>raum.setBeamer(!raum.beamer()));
  $('#lr-ende',box).addEventListener('click',()=>{$('#lr-ende-q',box).hidden=false});
  $('#lr-ende-n',box).addEventListener('click',()=>{$('#lr-ende-q',box).hidden=true});
  // Erst nach dem Löschen melden; scheitert es, bleibt der Raum hier und die Lehrkraft kann es noch einmal versuchen
  $('#lr-ende-y',box).addEventListener('click',async e=>{const b=e.currentTarget,err=$('#lr-ende-err',box);b.disabled=true;err.hidden=true;
    try{await raum.beenden();if(cfg.hinweis)cfg.hinweis('Lernraum beendet. Alle Daten sind gelöscht.')}
    catch(x){console.warn(x);b.disabled=false;err.textContent='Der Raum konnte nicht vollständig gelöscht werden. Prüfe das WLAN und tippe noch einmal auf „Raum löschen“.';err.hidden=false}});
  $('#lr-anhalten',box).addEventListener('click',()=>raum.pause(!(z.raum&&z.raum.pause)));
  $('#lr-holen',box).addEventListener('click',()=>{raum.holen($('#lr-ziel',box).value);if(cfg.hinweis)cfg.hinweis('Alle Geräte springen dorthin.')});
  const werk=orte.filter(o=>o.art==='werkstatt');
  $('#lr-alle-frei',box).addEventListener('click',()=>raum.sperren([]));
  $('#lr-alle-zu',box).addEventListener('click',()=>raum.sperren(werk.map(o=>o.id)));
  // Knöpfe in den Teilen, die aktualisiere() neu zeichnet: Ereignisse per Delegation, damit nichts doppelt gebunden wird
  // Entfernen mit kurzer Rückfrage; die Antworten an der Wand nur auf Wunsch mitlöschen (Entfernen dient auch für doppelte Geräte)
  $('#lr-dash',box).addEventListener('click',e=>{const b=e.target.closest('[data-lr-kick],[data-lr-wand],[data-lr-abst],[data-lr-quiz],#lr-druck,#lr-kick-y,#lr-kick-n');if(!b)return;
    if(b.id==='lr-druck')return drucken();
    if(b.dataset.lrKick){kickFrage={uid:b.dataset.lrKick,antw:false};aktualisiere(box);$('#lr-kick-y',box)?.focus();return}
    if(b.id==='lr-kick-n'){const u=kickFrage&&kickFrage.uid;kickFrage=null;aktualisiere(box);$(`[data-lr-kick="${CSS.escape(u||'')}"]`,box)?.focus();return}
    if(b.id==='lr-kick-y'){const k=kickFrage;if(!k)return;b.disabled=true;
      raum.kick(k.uid,k.antw).then(()=>{kickFrage=null;aktualisiere(box)},x=>{console.warn(x);b.disabled=false;if(cfg.hinweis)cfg.hinweis('Entfernen hat nicht geklappt. Prüfe das WLAN und versuch es noch einmal.')});return}
    if(cfg.gehZu)cfg.gehZu(b.dataset.lrWand||b.dataset.lrAbst||b.dataset.lrQuiz)});
  $('#lr-dash',box).addEventListener('change',e=>{if(e.target.id==='lr-kick-antw'&&kickFrage)kickFrage.antw=e.target.checked});
  $('#lr-frei-liste',box).addEventListener('click',e=>{const b=e.target.closest('[data-frei]');if(!b)return;const id=b.dataset.frei,g=new Set((z.raum&&z.raum.gesperrt)||[]);g.has(id)?g.delete(id):g.add(id);raum.sperren([...g])});
  if($('#lr-ki',box)){
    const inp=$('#lr-ki-link',box),st=$('#lr-ki-st',box);
    $('#lr-ki-ok',box).addEventListener('click',async()=>{const url=inp.value.trim();
      if(!/^https:\/\/[^ ]+$/.test(url)||url.length>300){st.textContent='Bitte den vollständigen Link aus AIS.chat einfügen. Er beginnt mit https://.';return}
      await raum.setzeKi(url);st.textContent='Gespeichert. Die Schüler sehen jetzt bei offenen Aufgaben den Knopf „KI-Coach“.'});
    $('#lr-ki-weg',box).addEventListener('click',async()=>{await raum.setzeKi('');inp.value='';st.textContent='Entfernt. Der Knopf „KI-Coach“ ist ausgeblendet.'});
  }
  aktualisiere(box);
}

/** Aktualisiert das Dashboard bei jedem Ereignis im Raum. Neu gezeichnet wird nur, was sich geändert hat,
 *  und der Fokus bleibt auf dem Knopf, den die Lehrkraft gerade bedient (Tastatur, Screenreader). */
function aktualisiere(box){
  if(!$('#lr-dash',box))return;
  const r=z.raum||{},orte=cfg.orte?cfg.orte():[],gesperrt=new Set(r.gesperrt||[]),beamer=raum.beamer();
  $('#lr-beamer',box).setAttribute('aria-pressed',String(beamer));
  const an=$('#lr-anhalten',box),anH=r.pause?'<span class="ms" aria-hidden="true">play_arrow</span>Weiter':'<span class="ms" aria-hidden="true">pause</span>Alle anhalten';
  if(an._html!==anH){an.innerHTML=anH;an._html=anH}
  an.classList.toggle('primary',!!r.pause);
  neuZeichnen($('#lr-frei-liste',box),orte.filter(o=>o.art==='werkstatt').map(o=>`<button class="btn small" type="button" data-frei="${esc(o.id)}" aria-pressed="${!gesperrt.has(o.id)}">${esc(o.titel)}</button>`).join(''));
  const n=z.spieler.length,antw=gruppiert();
  const anzahl=uid=>z.antworten.filter(a=>a.uid===uid).length;
  if(kickFrage&&(beamer||!z.spieler.some(p=>p.uid===kickFrage.uid)))kickFrage=null;
  const kp=kickFrage&&z.spieler.find(p=>p.uid===kickFrage.uid),ka=kp?anzahl(kp.uid):0;
  const kickHTML=kp?`<div class="fb amb stack" id="lr-kick-q" role="group" aria-labelledby="lr-kick-t"><p id="lr-kick-t"><b>${esc(kp.nick)}</b> aus dem Lernraum entfernen?</p>
    ${ka?`<label class="small" style="display:flex;gap:8px;align-items:flex-start"><input type="checkbox" id="lr-kick-antw" style="flex:none;margin-top:2px"${kickFrage.antw?' checked':''}>Auch ${ka===1?'die Antwort':`die ${ka} Antworten`} von ${esc(kp.nick)} an der Wand löschen</label>`:''}
    <div class="row"><button class="btn small primary" type="button" id="lr-kick-y"><span class="ms" aria-hidden="true">person_remove</span>Entfernen</button><button class="btn small text" type="button" id="lr-kick-n">Abbrechen</button></div></div>`:'';
  neuZeichnen($('#lr-teil',box),`<div class="row" style="justify-content:space-between"><h3 class="title-l">Teilnehmer</h3><span class="small muted">${n} ${n===1?'Person':'Personen'} im Raum</span></div>
    ${n?`<div class="tbl-wrap"><table><thead><tr><th>${beamer?'Gerät':'Spitzname'}</th><th>Gerade in</th><th class="r">Antworten</th>${beamer?'':'<th><span class="sr-only">Entfernen</span></th>'}</tr></thead><tbody>${z.spieler.map(p=>`<tr><td>${esc(raum.name(p.uid))}</td><td>${esc(ortName(p.ort))}</td><td class="r num">${anzahl(p.uid)}</td>${beamer?'':`<td class="r"><button class="icon-btn" type="button" data-lr-kick="${esc(p.uid)}" aria-label="${esc(p.nick)} entfernen" title="Entfernen"><span class="ms" aria-hidden="true">person_remove</span></button></td>`}</tr>`).join('')}</tbody></table></div>${kickHTML}`:'<p class="small muted">Noch niemand im Raum.</p>'}`,'h3');
  wissenscheck($('#lr-wc',box),beamer);
  abstimmungen($('#lr-abst',box));
  if($('#lr-ki-weg',box))$('#lr-ki-weg',box).hidden=!r.ki;
  const wand=[...AUFGABEN.values()].filter(a=>a.wand);
  neuZeichnen($('#lr-antw',box),`<div class="row" style="justify-content:space-between"><h3 class="title-l">Antworten an der Wand</h3><button class="btn small" type="button" id="lr-druck"><span class="ms" aria-hidden="true">print</span>Alle Antworten drucken</button></div>
    <div class="tbl-wrap"><table><tbody>${wand.map(a=>{const k=(antw.get(a.id)||[]).length;return `<tr><td>${esc(a.frage)}<div class="small muted">${esc(ortName(a.tool))}</div></td><td class="r num">${k}</td><td class="r">${a.tool?`<button class="btn text small" type="button" data-lr-wand="${esc(a.tool)}">Zur Wand</button>`:''}</td></tr>`}).join('')}</tbody></table></div>`,'h3');
}

/* ---------- Wissenscheck und KI-Coach im Dashboard ---------- */
// Ein Zeichen pro Aufgabe: „-“ offen, „0“–„9“ Zehntel der Punkte, „a“ volle Punkte
const anteile=code=>[...String(code||'')].map(c=>c==='-'?null:c==='a'?1:+c/10);
function wissenscheck(el,beamer){
  const chk=[...AUFGABEN.values()].find(a=>a.check);
  el.hidden=!chk;if(!chk)return;
  const A=chk.check.aufgaben,N=chk.check.stufen,mit=z.spieler.filter(p=>anteile(p.wc).some(x=>x!=null));
  // Anteil der Punkte, bezogen auf die bearbeiteten Aufgaben
  const quote=(liste,filter)=>{let p=0,max=0,n=0;liste.forEach(sp=>anteile(sp.wc).forEach((x,i)=>{if(x==null||!A[i]||!filter(A[i],i))return;p+=x*A[i].p;max+=A[i].p;n++}));return {q:max?Math.round(p/max*100):null,n}};
  const stufen=[1,2,3].map(k=>({k,...quote(mit,a=>a.afb===k)}));
  const schwer=A.map((a,i)=>({i,a,...quote(mit,(b,j)=>j===i)})).filter(x=>x.n).sort((x,y)=>x.q-y.q).slice(0,3).filter(x=>x.q<75);
  const zelle=(sp,k)=>{const r=quote([sp],a=>a.afb===k);return r.n?`${r.q} %`:'–'};
  const quiz=raum.quiz().id===chk.id;
  neuZeichnen(el,`<div class="row" style="justify-content:space-between"><h3 class="title-l">Wissenscheck</h3><span class="small muted">${mit.length} von ${z.spieler.length} haben Aufgaben bearbeitet</span></div>
    ${chk.tool?`<div class="row"><button class="btn small" type="button" data-lr-quiz="${esc(chk.tool)}"><span class="ms" aria-hidden="true">quiz</span>Zum Klassen-Quiz</button>${quiz?'<span class="pill ok">läuft</span>':''}<span class="small muted">Alle spielen den Wissenscheck gleichzeitig, mit Rangliste. Die Antworten zählen auch hier.</span></div>`:''}
    ${mit.length?`<p class="small muted">Anteil der erreichten Punkte in den bearbeiteten Aufgaben</p>
    ${stufen.map(s=>`<div class="wc-erg"><div class="row" style="justify-content:space-between"><span class="title-s">${esc(N[s.k-1])}</span><span class="small num">${s.n?`${s.q} % · ${s.n} ${s.n===1?'Bearbeitung':'Bearbeitungen'}`:'noch nichts bearbeitet'}</span></div><div class="wc-balken" aria-hidden="true"><span style="width:${s.q||0}%"></span></div></div>`).join('')}
    ${schwer.length?`<div><p class="title-s">Am schwierigsten</p><ul class="small">${schwer.map(x=>`<li>${esc(x.a.kurz)} … – ${x.q} %</li>`).join('')}</ul></div>`:''}
    ${beamer?'':`<div class="tbl-wrap"><table><thead><tr><th>Spitzname</th>${N.map(n=>`<th class="r">${esc(n)}</th>`).join('')}</tr></thead><tbody>${mit.map(sp=>`<tr><td>${esc(sp.nick)}</td>${[1,2,3].map(k=>`<td class="r num">${zelle(sp,k)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`}`
    :'<p class="small muted">Sobald die Schüler im Wissenscheck Aufgaben prüfen, siehst du hier die Ergebnisse pro Stufe. Texte werden nicht übertragen.</p>'}`,'h3');
}
function abstimmungen(el){
  // Abstimmungen und Blitzrunden (deren Karten sind interne Abstimmungen <id>-k<Nummer>)
  const liste=[...AUFGABEN.values()].filter(a=>(a.umfrage&&!a.intern)||a.runde),u=raum.umfrage();
  const laeuft=a=>u.id===a.id||(a.runde&&String(u.id||'').startsWith(a.id+'-k'));
  el.hidden=!liste.length;if(!liste.length)return;
  neuZeichnen(el,`<h3 class="title-l">Live-Abstimmungen</h3><p class="small muted">Ihr seid das Gericht und Blitzrunden als Klassenrunde: Starten und auflösen kannst du in der Werkstatt am Beamer.</p>
    <div class="tbl-wrap"><table><tbody>${liste.map(a=>`<tr><td>${a.runde?'Blitzrunde: ':''}${esc(a.frage)}<div class="small muted">${esc(ortName(a.tool))}</div></td><td class="r">${laeuft(a)?`<span class="pill ok">läuft</span>`:''}</td><td class="r">${a.tool?`<button class="btn text small" type="button" data-lr-abst="${esc(a.tool)}">Zur Abstimmung</button>`:''}</td></tr>`).join('')}</tbody></table></div>`,'h3');
}

/* ---------- Live-Abstimmung: Fenster auf den Handys ---------- */
// Das Fenster ist modal: Solange es offen ist, ist alles dahinter inert. Esc schließt es,
// danach geht der Fokus an die Stelle zurück, an der er vorher war.
let umfrageZu='',umfrageVorher=null;
function umfrageWeg(el,entfernen){
  const war=!el.hidden;if(entfernen)el.remove();else el.hidden=true;
  if(!war)return;sperreHintergrund();
  const v=umfrageVorher,a=document.activeElement;umfrageVorher=null;
  if((!a||a===document.body||!document.body.contains(a)||el.contains(a))&&v&&v!==document.body&&document.body.contains(v)&&!v.closest('[inert]'))v.focus();
}
function umfrageFenster(){
  let el=$('#lr-umfrage');
  if(!raum.istSchueler()){if(el)umfrageWeg(el,true);return}
  const u=raum.umfrage();
  if(!u.id){if(el)umfrageWeg(el);return}
  let a=AUFGABEN.get(u.id);if((!a||!a.umfrage)&&cfg.vorbereiten){cfg.vorbereiten();a=AUFGABEN.get(u.id)}
  if(!a||!a.umfrage)return;
  const q=a.umfrage,w=s.stimme&&s.stimme.n===u.n?s.stimme.w:null,zustand=u.n+(u.auf?'a':'');
  if(u.auf&&w!=null&&!(s.urteile&&s.urteile[u.id]&&s.urteile[u.id].n===u.n)){s.urteile={...(s.urteile||{}),[u.id]:{w,n:u.n}};speichern();melde('urteil')}
  if(umfrageZu===zustand){if(el)umfrageWeg(el);return}
  const neu=!el||el.hidden,aufgedeckt=u.auf&&el&&el._zustand!==zustand,neueKarte=!neu&&el._n!==u.n;
  if(!el){el=document.createElement('div');el.id='lr-umfrage';el.className='lr-umfrage';el.hidden=true;el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');el.setAttribute('aria-labelledby','lr-umfrage-t');
    // Die Statuszeile bleibt dasselbe Element (nur ihr Text wechselt), sonst sagen Screenreader „Deine Stimme ist abgegeben“ nicht an
    el.innerHTML='<div class="lr-umfrage-karte stack"><div class="stack" data-u-oben></div><div class="lr-umfrage-wahl" role="group" aria-label="Dein Urteil" data-u-wahl></div><p class="small" role="status" data-u-status></p><div data-u-unten hidden></div></div>';document.body.append(el);
    // Ereignisse per Delegation: Der Inhalt wird bei jeder Änderung neu gezeichnet
    el.addEventListener('click',e=>{const b=e.target.closest('[data-u-w],[data-u-zu]');if(!b)return;
      if(b.hasAttribute('data-u-zu')){umfrageZu=el._zustand;umfrageWeg(el)}else raum.stimme(+b.dataset.uW).catch(e=>console.warn('Abstimmung',e))})}
  if(neu)umfrageVorher=document.activeElement;
  el._zustand=zustand;el._n=u.n;
  // Blitzrunde als Klassenrunde: keine Wörter aus dem Gericht („Dein Urteil“), es geht um Alltagsfragen
  const blitz=q.art==='blitz';$('[data-u-wahl]',el).setAttribute('aria-label',blitz?'Deine Antwort':'Dein Urteil');
  neuZeichnen($('[data-u-oben]',el),`<div class="row" style="justify-content:space-between"><p class="eyebrow"><span class="ms sm" aria-hidden="true">${q.icon||'gavel'}</span> ${q.kopf||`Ihr seid das Gericht${q.titel?` · ${q.titel}`:''}`}</p><button class="icon-btn" type="button" data-u-zu aria-label="Fenster schließen"><span class="ms" aria-hidden="true">close</span></button></div>
    ${q.fall?`<div class="wc-material">${q.fall}</div>`:''}<h2 class="title-l" id="lr-umfrage-t">${q.frage}</h2>`);
  // Antworten getrennt vom Fall: Eine Stimme oder das Auflösen zeichnet das Foto nicht neu (es würde kurz verschwinden)
  neuZeichnen($('[data-u-wahl]',el),q.optionen.map((o,i)=>`<button class="btn${w===i?' primary':''}" type="button" data-u-w="${i}" aria-pressed="${w===i}"${u.auf?' disabled':''}>${o}</button>`).join(''));
  const st=$('[data-u-status]',el),txt=u.auf?'':w==null?(blitz?'Was meinst du? Tippe deine Antwort.':'Wie urteilst du? Tippe deine Antwort.'):'Deine Stimme ist abgegeben. Bis zur Auflösung kannst du sie noch ändern.';
  if(st.textContent!==txt)st.textContent=txt;
  const unten=$('[data-u-unten]',el);unten.hidden=!u.auf;
  neuZeichnen(unten,u.auf?`<div class="fb ${w===q.r?'ok':'bad'}" data-u-urteil tabindex="-1"><b>${w==null?'Du hast nicht abgestimmt.':w===q.r?(blitz?'Richtig!':'Richtig geurteilt!'):(blitz?'Nicht ganz.':'Das Gericht entscheidet anders.')}</b> Richtig ist: <b>${q.optionen[q.r]}</b>. ${q.e||''}</div>`:'');
  el.hidden=false;sperreHintergrund();
  // Beim Öffnen auf die erste Antwort (der Screenreader liest dabei den Namen des Fensters, die Frage),
  // beim Auflösen auf das Urteil (die Antwortknöpfe sind dann gesperrt)
  if(u.auf&&(neu||aufgedeckt)){const z=$('[data-u-urteil]',el);z.focus();z.scrollIntoView({block:'nearest'})}
  else if(neu)($('[data-u-w]:not(:disabled)',el)||$('[data-u-zu]',el)).focus();
  // Neue Frage im offenen Fenster (z. B. nächste Karte der Blitzrunde): Fokus auf die Frage, damit sie vorgelesen wird
  else if(neueKarte){const t=$('#lr-umfrage-t',el);t.tabIndex=-1;t.focus()}
}
raum.on(art=>{if(['raum','start','verbunden','ende'].includes(art))umfrageFenster()});
// Esc schließt zuerst das Abstimmungsfenster (Erfassungsphase, damit nicht die Werkstatt dahinter zugeht), nicht während der Pause
document.addEventListener('keydown',e=>{const el=$('#lr-umfrage'),p=$('#lr-pause');
  if(e.key!=='Escape'||!el||el.hidden||(p&&!p.hidden))return;e.stopPropagation();$('[data-u-zu]',el).click()},true);

function kiHTML(){
  const chk=[...AUFGABEN.values()].find(a=>a.ki);if(!chk)return '';
  return `<section class="panel stack" id="lr-ki"><h3 class="title-l">KI-Coach mit AIS.chat</h3>
    <p class="small">Teilst du ein Lernszenario aus AIS.chat, erscheint bei den offenen Aufgaben im Wissenscheck der Knopf „KI-Coach“. Er kopiert die Antwort und öffnet AIS.chat. AIS.chat ist das KI-Angebot des Landes im Thüringer Schulportal.</p>
    <ol class="small"><li>Anweisung kopieren und in AIS.chat ein Lernszenario damit anlegen.</li><li>Das Lernszenario teilen und den Link hier einfügen.</li></ol>
    <div class="row"><button class="btn small" type="button" data-kopiere="#lr-ki-text"><span class="ms" aria-hidden="true">content_copy</span>Anweisung kopieren</button></div>
    <pre class="wc-ki" id="lr-ki-text" hidden>${esc(chk.ki)}</pre>
    <div class="row"><label for="lr-ki-link" class="small">Link zum Lernszenario</label><input id="lr-ki-link" type="url" inputmode="url" autocomplete="off" spellcheck="false" placeholder="https://…" value="${esc((z.raum&&z.raum.ki)||'')}" style="flex:1;min-width:200px"></div>
    <div class="row"><button class="btn small primary" type="button" id="lr-ki-ok"><span class="ms" aria-hidden="true">link</span>Link speichern</button><button class="btn text small" type="button" id="lr-ki-weg" hidden><span class="ms" aria-hidden="true">link_off</span>Link entfernen</button><span class="small" id="lr-ki-st" role="status"></span></div></section>`;
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
