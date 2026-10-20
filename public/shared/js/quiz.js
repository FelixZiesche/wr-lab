// Klassen-Quiz für alle Themen: Die Lehrkraft spielt den Wissenscheck im Lernraum mit der ganzen Klasse. Die Frage steht
// auf dem Beamer und auf allen Handys, geantwortet wird auf Zeit, schnelle richtige Antworten bringen mehr Punkte,
// nach jeder Frage gibt es die Lösung und eine Rangliste. Gespielt werden die geschlossenen Aufgaben des Wissenschecks
// (Auswahl, Mehrfachauswahl, Richtig oder falsch, Rechnen). aufgaben.js meldet jeden Wissenscheck mit quizAnmelden(def,
// werkzeuge) an, setzt quizHTML(id) über den Wissenscheck und bindet den Kasten mit bindQuiz(box).
//
// Ablauf im Raumfeld quiz (nur die Lehrkraft schreibt): ph 'lobby' → 'frage' (t = Start, Uhrzeit des Servers) → 'zu'
// (Zeit um, Auswertung) → 'auf' (Lösung und Punkte) → nächste Frage … → 'ende'. Jede Antwort ist eine Zahl im eigenen
// Eintrag (q: {n, w, at}): Auswahl = Index, Richtig oder falsch = 1 oder 0, Mehrfachauswahl = Bitmaske, Rechnen = Ergebnis.
// Punkte: bis 1000 pro Frage, wer schneller antwortet, bekommt mehr (mindestens die Hälfte), Teilpunkte bei der
// Mehrfachauswahl, Serienbonus ab der zweiten richtigen Antwort in Folge (+100, höchstens +500). Das Gerät der Lehrkraft
// rechnet und schreibt pkt (Kennung → [gesamt, plus, platz, serie]) und bei Teams teams (Durchschnitt pro Team) in den
// Raum, nie Spitznamen. Die Rangliste mit Spitznamen (Top 5) zeigt nur das Gerät der Lehrkraft, auf Wunsch ohne Namen.
// Antworten aus dem Quiz übernimmt der Wissenscheck der Schüler, wenn die Aufgabe dort noch offen ist (zählt im Dashboard).
// Gespeichert auf dem Gerät der Lehrkraft: <speicher>-quiz (Spielstand), -quiz-wahl (Einstellungen), -quiz-namen.
import { $, $$, esc, store, neuZeichnen } from './ui.js';
import { raum, sperreHintergrund, qrSVG, linkZu } from './lernraum.js';
import { zahl } from './feedback.js';

const DEFS=new Map();let W=null;
const ARTEN={wahl:'Auswahl',mehrfach:'Mehrfachauswahl',richtigfalsch:'Richtig oder falsch',zahl:'Rechnen'};
const FORMEN=['change_history','circle','square','diamond','pentagon','hexagon'];
const TEAMS=['Saale','Ilm','Unstrut','Werra','Gera','Schwarza'];
const ZEITEN=[[20,'20 Sekunden'],[30,'30 Sekunden'],[60,'60 Sekunden'],[90,'90 Sekunden'],[0,'Ohne Zeitlimit']];
const ms=t=>t&&typeof t.toMillis==='function'?t.toMillis():null;
const zahlText=n=>Number(n||0).toLocaleString('de-DE');
const team=k=>`Team ${TEAMS[k-1]}`;
// Beim Weiterschreiben des Raumfelds nur einen echten Zeitstempel mitnehmen (null oder Platzhalter lehnen die Regeln ab)
const basis=q=>{const {t,...r}=q;return ms(t)!=null?{...r,t}:r};

/** Wissenscheck anmelden. werkzeuge = {bewerte, punkteVon, loesungHTML, mischen, streuwert, eintragen, STUFEN} aus aufgaben.js */
export function quizAnmelden(def,werkzeuge){DEFS.set(def.id,def);W=werkzeuge}
export const quizFaehig=a=>!!ARTEN[a.art];
// Der Kasten selbst bleibt ohne Rahmen, solange er versteckt ist; gezeichnet wird ein Panel darin
export const quizHTML=id=>`<section class="qz-kasten" data-quiz="${id}" hidden></section>`;

/* ---------- Antworten ---------- */
// Reihenfolge wie im Wissenscheck; w ist der Wert, der gespeichert wird
function optionen(a){
  if(a.art==='richtigfalsch')return [{w:1,t:'richtig'},{w:0,t:'falsch'}];
  return W.mischen(a.o.length,W.streuwert(a.f)).map(j=>({w:j,t:a.o[j]}));
}
// Antwort im Format des Wissenschecks
function alsWc(a,w){
  if(a.art==='richtigfalsch')return w===1;
  if(a.art==='mehrfach')return a.o.map((x,j)=>j).filter(j=>w&(1<<j));
  if(a.art==='zahl')return String(w).replace('.',',');
  return w;
}
// Anteil der Punkte (0 bis 1). Mehrfachauswahl fein abgestuft: richtige minus falsche Kreuze, geteilt durch die richtigen
const anteil=(a,w)=>{if(a.art!=='mehrfach')return W.bewerte(a,{w:alsWc(a,w)})/W.punkteVon(a);
  const x=alsWc(a,w),ok=x.filter(j=>a.r.includes(j)).length;return Math.max(0,(ok-(x.length-ok))/a.r.length)};
// Ist die Antwortmöglichkeit w (Wert aus optionen) richtig?
const richtig=(a,w)=>a.art==='mehrfach'?a.r.includes(w):a.art==='richtigfalsch'?(w===1)===a.r:w===a.r;
const frageHTML=a=>`${a.material?`<div class="wc-material">${a.material}</div>`:''}<h2 class="qz-frage" id="qz-t" tabindex="-1">${a.art==='richtigfalsch'?`Stimmt das? „${a.f}“`:a.f}</h2>`;
const kopfText=(q,a)=>`Frage ${q.nr} von ${q.von} · ${W.STUFEN[a.afb].name} · ${ARTEN[a.art]}`;
const feld=(o,k,inhalt,attr='',cls='')=>`<${attr?'button type="button"':'div'} class="qz-feld qz-f${k%4+1}${cls}" ${attr}><span class="ms" aria-hidden="true">${FORMEN[k%FORMEN.length]}</span><span class="qz-feld-t">${o.t}</span>${inhalt||''}</${attr?'button':'div'}>`;

/* ---------- Kasten im Wissenscheck ---------- */
const wahl=()=>({anzahl:10,stufe:0,s:30,team:0,...(store(raum.speicher()+'-quiz-wahl')||{})});
function kasten(box){
  const id=box.dataset.quiz,def=DEFS.get(id);if(!def)return;
  const q=raum.quiz(),laeuft=q.id===id;
  if(raum.istLehrkraft()){
    box.hidden=false;
    if(laeuft){
      if(neuZeichnen(box,`<div class="panel stack"><h3 class="title-m"><span class="ms" aria-hidden="true">quiz</span> Klassen-Quiz</h3>
        <p class="small">Das Quiz läuft${q.nr?` (Frage ${q.nr} von ${q.von})`:''}.</p>
        <div class="row"><button class="btn primary small" type="button" data-qz-oeffnen><span class="ms" aria-hidden="true">open_in_full</span>Quiz-Fenster öffnen</button><button class="btn text small" type="button" data-qz-ende><span class="ms" aria-hidden="true">stop_circle</span>Quiz beenden</button></div></div>`,'[data-qz-oeffnen]')){
        $('[data-qz-oeffnen]',box).addEventListener('click',()=>{lkOffen=true;fenster()});
        $('[data-qz-ende]',box).addEventListener('click',beenden);
      }
      return;
    }
    const A=def.aufgaben,pool=k=>A.filter(a=>quizFaehig(a)&&(!k||a.afb===k)).length,N=pool(0),w=wahl();
    if(!N){box.hidden=true;return}
    const anz=[5,10,15,20].filter(x=>x<N);
    if(neuZeichnen(box,`<div class="panel stack"><h3 class="title-m"><span class="ms" aria-hidden="true">quiz</span> Klassen-Quiz</h3>
      <p class="small">Spielt den Wissenscheck mit der ganzen Klasse: Die Frage erscheint am Beamer und auf allen Handys im Lernraum, schnelle richtige Antworten bringen mehr Punkte, nach jeder Frage gibt es die Lösung und eine Rangliste. Die Antworten zählen auch in der Auswertung im Dashboard.</p>
      <p class="small muted">${N} Quizfragen (${Object.values(ARTEN).join(', ')}). Offene Aufgaben, Zuordnen und Reihenfolge bleiben im Wissenscheck.</p>
      <div class="qz-wahl">
        <label class="ctrl"><span class="small">Fragen</span><select data-qz-anzahl>${anz.map(x=>`<option value="${x}"${x===w.anzahl?' selected':''}>${x} Fragen</option>`).join('')}<option value="0"${!anz.includes(w.anzahl)?' selected':''}>Alle (${N})</option></select></label>
        <label class="ctrl"><span class="small">Stufe</span><select data-qz-stufe><option value="0">Alle Stufen</option>${[1,2,3].filter(k=>pool(k)).map(k=>`<option value="${k}"${k===w.stufe?' selected':''}>${W.STUFEN[k].name} (${pool(k)})</option>`).join('')}</select></label>
        <label class="ctrl"><span class="small">Zeit pro Frage</span><select data-qz-zeit-wahl>${ZEITEN.map(([s,t])=>`<option value="${s}"${s===w.s?' selected':''}>${t}</option>`).join('')}</select></label>
        <label class="ctrl"><span class="small">Spielen</span><select data-qz-teams><option value="0">Jeder für sich</option>${[2,3,4,5,6].map(k=>`<option value="${k}"${k===w.team?' selected':''}>In ${k} Teams</option>`).join('')}</select></label>
      </div>
      <p class="small muted">Rechenaufgaben bekommen doppelt so viel Zeit. Bei Teams wählt jeder auf dem Handy sein Team, es zählt der Durchschnitt.</p>
      <div class="row"><button class="btn primary" type="button" data-qz-start><span class="ms" aria-hidden="true">play_arrow</span>Quiz starten</button></div></div>`,'[data-qz-start]')){
      $('[data-qz-start]',box).addEventListener('click',()=>{
        const v=sel=>+$(sel,box).value,x={anzahl:v('[data-qz-anzahl]'),stufe:v('[data-qz-stufe]'),s:v('[data-qz-zeit-wahl]'),team:v('[data-qz-teams]')};
        store(raum.speicher()+'-quiz-wahl',x);starten(id,x).catch(e=>console.warn('Quiz',e));
      });
    }
    return;
  }
  box.hidden=!(raum.istSchueler()&&laeuft);
  if(box.hidden)return;
  if(neuZeichnen(box,`<div class="panel stack"><p class="title-s"><span class="ms sm" aria-hidden="true">quiz</span> Das Klassen-Quiz läuft.</p><div class="row"><button class="btn primary small" type="button" data-qz-oeffnen><span class="ms" aria-hidden="true">open_in_full</span>Zum Quiz</button></div></div>`))
    $('[data-qz-oeffnen]',box).addEventListener('click',()=>{zuBei='';fenster()});
}
export function bindQuiz(box){kasten(box)}

/* ---------- Lehrkraft: Spielstand und Steuerung ---------- */
// LK = {code, id, liste: [Index im Wissenscheck], pos, s, team, pkt: {Kennung: {g, plus, serie}}}
let LK=null,lkOffen=null,ansicht='loesung',frist=0,schliesst=-1;
const lkLaden=()=>{const x=store(raum.speicher()+'-quiz'),c=raum.sitzung()&&raum.sitzung().code;LK=x&&x.code===c?x:null;return LK};
const lkSichern=()=>store(raum.speicher()+'-quiz',LK);

function starten(id,{anzahl,stufe,s,team:teams}){
  const A=DEFS.get(id).aufgaben;
  // Zufällige Auswahl, dann nach Stufe sortiert: Von Frage zu Frage wird es anspruchsvoller
  const liste=A.map((a,i)=>({a,i,r:Math.random()})).filter(x=>quizFaehig(x.a)&&(!stufe||x.a.afb===stufe))
    .sort((x,y)=>x.r-y.r).slice(0,anzahl||undefined).sort((x,y)=>x.a.afb-y.a.afb||x.i-y.i).map(x=>x.i);
  const alt=((raum.zustand().raum||{}).quiz||{}).n||0;
  LK={code:raum.sitzung().code,id,liste,pos:-1,s,team:teams,pkt:{}};lkSichern();lkOffen=true;ansicht='loesung';
  if(raum.umfrage().id)raum.beendeUmfrage();
  return raum.steuereQuiz({id,n:alt+1,ph:'lobby',nr:0,von:liste.length,s,team:teams,pkt:{},teams:Array(teams).fill(0)});
}
function weiter(){
  const q=raum.quiz();if(!LK||!q.id)return;
  LK.pos++;lkSichern();ansicht='loesung';
  if(LK.pos>=LK.liste.length)return raum.steuereQuiz({...basis(q),ph:'ende'});
  const i=LK.liste[LK.pos],a=DEFS.get(q.id).aufgaben[i],s=LK.s&&a.art==='zahl'?Math.min(600,LK.s*2):LK.s;
  frist=s?Date.now()+s*1000:0;
  return raum.steuereQuiz({...basis(q),ph:'frage',n:q.n+1,i,nr:LK.pos+1,s},true);
}
function mehrZeit(){const q=raum.quiz();if(q.ph!=='frage'||!q.s)return;frist+=15000;raum.steuereQuiz({...basis(q),s:Math.min(600,q.s+15)})}
function schliessen(){
  const q=raum.quiz();if(q.ph!=='frage'||schliesst===q.n)return;schliesst=q.n;
  raum.steuereQuiz({...basis(q),ph:'zu'});
  // Kurz warten, damit Antworten aus den letzten Sekunden noch ankommen
  setTimeout(()=>auswerten(q.n),1500);
}
function auswerten(n){
  const q=raum.quiz();if(!LK||q.n!==n||q.ph!=='zu')return;
  const a=DEFS.get(q.id).aufgaben[q.i],t0=ms(q.t),sp=raum.zustand().spieler;
  sp.forEach(p=>{
    const e=LK.pkt[p.uid]||(LK.pkt[p.uid]={g:0,plus:0,serie:0}),x=p.q&&p.q.n===n?p.q:null;let plus=0;
    if(x){
      const f=anteil(a,x.w),dt=t0!=null&&ms(x.at)!=null?(ms(x.at)-t0)/1000:0,tempo=q.s?Math.max(.5,Math.min(1,1-dt/(2*q.s))):1;
      plus=Math.round(1000*f*tempo/10)*10;
      if(f>=1){e.serie++;plus+=Math.min(5,e.serie-1)*100}else e.serie=0;
    }else e.serie=0;
    e.plus=plus;e.g+=plus;
  });
  lkSichern();
  const r=rangliste(),pkt={};
  r.slice(0,100).forEach(x=>{const e=LK.pkt[x.uid];pkt[x.uid]=[e.g,e.plus,x.platz,e.serie]});
  raum.steuereQuiz({...basis(q),ph:'auf',pkt,teams:teamPunkte(q.team)});
}
// Alle im Raum, sortiert nach Punkten; gleiche Punkte = gleicher Platz
function rangliste(){
  const l=raum.zustand().spieler.map(p=>({uid:p.uid,nick:p.nick,team:p.team||0,g:LK&&LK.pkt[p.uid]?LK.pkt[p.uid].g:0})).sort((x,y)=>y.g-x.g);
  l.forEach(x=>{x.platz=1+l.filter(y=>y.g>x.g).length});return l;
}
function teamPunkte(k){
  if(!k)return [];const sp=raum.zustand().spieler;
  return Array.from({length:k},(x,j)=>{const m=sp.filter(p=>p.team===j+1),g=m.reduce((s,p)=>s+(LK&&LK.pkt[p.uid]?LK.pkt[p.uid].g:0),0);return m.length?Math.round(g/m.length):0});
}
function beenden(){const q=raum.quiz();LK=null;store(raum.speicher()+'-quiz',null);lkOffen=false;frist=0;
  return raum.steuereQuiz({id:'',n:q.n||((raum.zustand().raum||{}).quiz||{}).n||0,ph:''})}

/* ---------- Fenster ---------- */
let vorher=null,zuBei='',takt=null,startLokal={n:-1,t:0},eingetragen=new Set();
// Angefangene Antwort (Mehrfachauswahl, Rechnen): bleibt stehen, wenn das Fenster neu gezeichnet wird (z. B. mehr Zeit)
let entwurf={n:-1,m:0,z:''};
const meinEntwurf=n=>{if(entwurf.n!==n)entwurf={n,m:0,z:''};return entwurf};
const namen=()=>store(raum.speicher()+'-quiz-namen')!==false;
const geantwortet=q=>raum.zustand().spieler.filter(p=>p.q&&p.q.n===q.n).length;
const restZeit=q=>{if(!q.s)return null;
  if(raum.istLehrkraft()){if(!frist)frist=(ms(q.t)||Date.now())+q.s*1000;return Math.max(0,Math.ceil((frist-Date.now())/1000))}
  if(startLokal.n!==q.n)startLokal={n:q.n,t:Date.now()};return Math.max(0,Math.ceil(q.s-(Date.now()-startLokal.t)/1000))};

function schliesseFenster(el,entfernen){
  const war=el&&!el.hidden;if(!el)return;if(entfernen)el.remove();else el.hidden=true;
  clearInterval(takt);takt=null;if(!war)return;sperreHintergrund();
  const v=vorher,a=document.activeElement;vorher=null;
  if((!a||a===document.body||!document.body.contains(a)||el.contains(a))&&v&&v!==document.body&&document.body.contains(v)&&!v.closest('[inert]'))v.focus();
}
function fenster(){
  let el=$('#qz');const q=raum.quiz(),lk=raum.istLehrkraft();
  if(!q.id||!(lk||raum.istSchueler())){if(el)schliesseFenster(el,true);if(!q.id&&lk){frist=0;schliesst=-1}return}
  let def=DEFS.get(q.id);if(!def){raum.vorbereiten();def=DEFS.get(q.id)}
  if(!def)return;
  if(lk){lkLaden();if(lkOffen===null)lkOffen=true}
  const zustand=`${q.n}${q.ph}`;
  if(lk?!lkOffen:zuBei===zustand){if(el)schliesseFenster(el);return}
  if(!el){
    el=document.createElement('div');el.id='qz';el.className='qz';el.hidden=true;el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');el.setAttribute('aria-labelledby','qz-t');
    el.innerHTML='<div class="qz-karte stack"><div class="qz-kopf"><p class="eyebrow" data-qz-kopf></p><span class="qz-knoepfe" data-qz-knoepfe></span></div><div class="stack" data-qz-inhalt></div><p class="small" role="status" data-qz-status></p></div>';
    document.body.append(el);
    el.addEventListener('click',klick);
    el.addEventListener('input',e=>{if(!e.target.matches('[data-qz-zahl]'))return;meinEntwurf(raum.quiz().n).z=e.target.value;$('[data-qz-abgeben]',el).disabled=Number.isNaN(zahl(e.target.value))});
    el.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.matches('[data-qz-zahl]')){const b=$('[data-qz-abgeben]',el);if(!b.disabled)b.click()}});
  }
  const neu=el.hidden;if(neu)vorher=document.activeElement;
  const a=def.aufgaben[q.i]||def.aufgaben[0],kopf=q.ph==='frage'||q.ph==='zu'||q.ph==='auf'?kopfText(q,a):`Klassen-Quiz · ${def.titel}`;
  if($('[data-qz-kopf]',el).textContent!==kopf)$('[data-qz-kopf]',el).textContent=kopf;
  neuZeichnen($('[data-qz-knoepfe]',el),`${lk&&(q.ph==='auf'||q.ph==='ende')?`<button class="btn text small" type="button" data-qz-namen aria-pressed="${namen()}">Spitznamen</button>`:''}<button class="icon-btn" type="button" data-qz-zu aria-label="${lk?'Quiz-Fenster schließen, das Quiz läuft weiter':'Fenster schließen'}" title="Fenster schließen"><span class="ms" aria-hidden="true">close</span></button>`);
  const inhalt=$('[data-qz-inhalt]',el),vorZustand=el._zustand;el._zustand=zustand+(lk?ansicht:'');
  neuZeichnen(inhalt,lk?lehrkraftHTML(q,def,a):schuelerHTML(q,def,a),'#qz-t');
  el.classList.toggle('qz-lk',lk);
  el.hidden=false;sperreHintergrund();
  zeit();
  clearInterval(takt);takt=q.ph==='frage'&&q.s?setInterval(zeit,250):null;
  // Fokus beim Öffnen: auf die erste Antwort (Handy) oder den Hauptknopf (Lehrkraft). Bei einem neuen Abschnitt auf den Handys
  // auf die Überschrift (der Screenreader liest die neue Frage vor), bei der Lehrkraft nur, wenn der Fokus verloren ging.
  const haupt=()=>(lk?$('[data-qz-haupt]',inhalt):$('[data-qz-w]:not(:disabled),[data-qz-m]:not(:disabled),[data-qz-zahl],[data-qz-team]',inhalt))||$('#qz-t',el);
  if(neu)haupt()?.focus();
  else if(vorZustand!==el._zustand){const act=document.activeElement;if(!lk)$('#qz-t',el)?.focus();else if(!el.contains(act)||act===document.body)haupt()?.focus()}
}
// Countdown und automatisches Ende der Frage (Lehrkraft)
function zeit(){
  const el=$('#qz');if(!el||el.hidden)return;const q=raum.quiz(),z=$('[data-qz-zeit]',el);
  if(!z)return;const r=restZeit(q);if(r==null)return;
  const t=r>0?`noch ${r} s`:'Zeit ist um';if(z.textContent!==t)z.textContent=t;
  const b=$('[data-qz-balken]',el);if(b)b.style.width=`${Math.round(r/Math.max(1,q.s)*100)}%`;
  if(raum.istLehrkraft()&&r<=0&&q.ph==='frage')schliessen();
}
// Ereignisse per Delegation, der Inhalt wird bei jeder Änderung neu gezeichnet
function klick(e){
  const el=$('#qz'),b=e.target.closest('button');if(!b||b.disabled)return;const q=raum.quiz(),st=$('[data-qz-status]',el);
  if(b.hasAttribute('data-qz-zu')){if(raum.istLehrkraft())lkOffen=false;else zuBei=`${q.n}${q.ph}`;return fenster()}
  if(b.hasAttribute('data-qz-namen')){store(raum.speicher()+'-quiz-namen',!namen());return fenster()}
  if(b.hasAttribute('data-qz-weiter'))return weiter();
  if(b.hasAttribute('data-qz-schliessen'))return schliessen();
  if(b.hasAttribute('data-qz-mehr'))return mehrZeit();
  if(b.hasAttribute('data-qz-rang')){ansicht='rang';return fenster()}
  if(b.hasAttribute('data-qz-ende'))return beenden();
  if(b.dataset.qzTeam)return raum.waehleTeam(+b.dataset.qzTeam).catch(x=>{console.warn('Team',x);st.textContent='Das hat nicht geklappt. Prüfe das WLAN und tippe noch einmal.'});
  if(b.dataset.qzM){const e=meinEntwurf(q.n);e.m^=1<<+b.dataset.qzM;b.setAttribute('aria-pressed',String(!!(e.m&(1<<+b.dataset.qzM))));$('[data-qz-abgeben]',el).disabled=!e.m;return}
  let w=null;
  if(b.dataset.qzW)w=+b.dataset.qzW;
  else if(b.hasAttribute('data-qz-abgeben')){
    const z=$('[data-qz-zahl]',el);
    if(z){w=zahl(z.value);if(Number.isNaN(w)){st.textContent='Gib eine Zahl ein, zum Beispiel 2,4.';return}}
    else w=meinEntwurf(q.n).m;
  }
  if(w==null||q.ph!=='frage'||raum.quizMeins(q.n)!=null)return;
  raum.quizAntwort(q.n,w).catch(x=>{console.warn('Quiz',x);st.textContent='Deine Antwort ist nicht angekommen. Vielleicht war die Zeit schon um oder das WLAN hakt.'});
}

/* ---------- Ansicht auf den Handys ---------- */
function teamWahlHTML(q,titel){
  const t=raum.team();
  return `<h2 class="title-l" id="qz-t" tabindex="-1">${titel}</h2><div class="qz-teams" role="group" aria-label="Team wählen">${Array.from({length:q.team},(x,j)=>`<button class="btn${t===j+1?' primary':''}" type="button" data-qz-team="${j+1}" aria-pressed="${t===j+1}"><span class="ms" aria-hidden="true">groups</span>${team(j+1)}</button>`).join('')}</div>`;
}
function platzHTML(q,pk){
  if(!pk)return '<p class="small">Du bist neu dabei. Ab der nächsten Frage sammelst du Punkte.</p>';
  const n=Object.keys(q.pkt||{}).length,t=raum.team(),tp=q.team&&t?(q.teams||[])[t-1]:null,tPlatz=tp!=null?1+(q.teams||[]).filter(x=>x>tp).length:0;
  return `<div class="qz-platz"><p class="headline-s num">Platz ${pk[2]} <span class="title-m">von ${n}</span></p><p class="title-m num">${zahlText(pk[0])} Punkte</p>
    ${tp!=null?`<p class="small num">${team(t)}: Platz ${tPlatz} von ${q.team} · ${zahlText(tp)} Punkte im Schnitt</p>`:''}</div>`;
}
function schuelerHTML(q,def,a){
  const meins=raum.quizMeins(q.n),pk=(q.pkt||{})[raum.uid()];
  if(q.ph==='lobby')
    return `${q.team?teamWahlHTML(q,'Wähle dein Team'):`<h2 class="title-l" id="qz-t" tabindex="-1">Gleich geht's los!</h2>`}
      <p>${q.von} Fragen aus dem Wissenscheck. Schnelle richtige Antworten bringen bis zu 1000 Punkte, mehrere richtige in Folge geben einen Bonus. Schau nach vorn!</p>`;
  if(q.ph==='ende'){
    const pl=pk?pk[2]:0,txt=pl===1?'Gewonnen! Stark gespielt.':pl&&pl<=3?'Aufs Treppchen geschafft!':'Gut gespielt!';
    return `<h2 class="title-l" id="qz-t" tabindex="-1"><span class="ms" aria-hidden="true">emoji_events</span> Endstand: ${pk?txt:'Das Quiz ist vorbei.'}</h2>${pk?platzHTML(q,pk):''}
      <p class="small">Deine Antworten stehen jetzt auch im Wissenscheck, mit Lösungen und Erklärungen. Dort kannst du die übrigen Aufgaben bearbeiten.</p>
      <div class="row"><button class="btn primary" type="button" data-qz-zu>Schließen</button></div>`;
  }
  if(q.ph==='frage'&&q.team&&!raum.team())return teamWahlHTML(q,'Wähle zuerst dein Team');
  const opts=a.art==='zahl'?[]:optionen(a),fertig=meins!=null||q.ph!=='frage';
  const e=meinEntwurf(q.n),gewaehlt=o=>a.art==='mehrfach'?!!((meins??e.m)&(1<<o.w)):meins===o.w;
  let unten='';
  if(q.ph==='frage'){
    const zeit=q.s?`<div class="qz-zeit"><p class="title-m num" role="timer" data-qz-zeit></p><div class="wc-balken" aria-hidden="true"><span data-qz-balken></span></div></div>`:'';
    let felder;
    if(a.art==='zahl')felder=meins!=null?`<p class="title-m">Deine Antwort: ${esc(String(meins).replace('.',','))}${a.einheit?' '+a.einheit:''}</p>`
      :`<div class="row qz-zahl"><label for="qz-zahl" class="small">Dein Ergebnis</label><input id="qz-zahl" data-qz-zahl type="text" inputmode="decimal" autocomplete="off" spellcheck="false" value="${esc(e.z)}">${a.einheit?`<span>${a.einheit}</span>`:''}<button class="btn primary" type="button" data-qz-abgeben${Number.isNaN(zahl(e.z))?' disabled':''}><span class="ms" aria-hidden="true">send</span>Abgeben</button></div>`;
    else felder=`<div class="qz-felder" role="group" aria-label="${a.art==='mehrfach'?'Antworten wählen, mehrere sind richtig':'Deine Antwort'}">${opts.map((o,k)=>feld(o,k,meins!=null&&gewaehlt(o)?'<span class="ms qz-haken" aria-hidden="true">check_circle</span>':'',
      a.art==='mehrfach'?`data-qz-m="${o.w}" aria-pressed="${gewaehlt(o)}"${fertig?' disabled':''}`:`data-qz-w="${o.w}" aria-pressed="${gewaehlt(o)}"${fertig?' disabled':''}`)).join('')}</div>
      ${a.art==='mehrfach'&&!fertig?`<div class="row"><button class="btn primary" type="button" data-qz-abgeben${e.m?'':' disabled'}><span class="ms" aria-hidden="true">send</span>Antwort abgeben</button></div>`:''}`;
    unten=`${zeit}${frageHTML(a)}${felder}${meins!=null?'<p class="fb neu">Deine Antwort ist abgegeben. Gleich kommt die Auflösung.</p>':''}`;
    return unten;
  }
  if(q.ph==='zu')return `${frageHTML(a)}<p class="fb neu">${meins!=null?'Zeit ist um. Deine Antwort ist angekommen, gleich kommt die Auflösung.':'Zeit ist um. Diesmal hast du nicht geantwortet.'}</p>`;
  // Aufgelöst: Ergebnis, Lösung, Platz. Die Antwort geht in den Wissenscheck, wenn die Aufgabe dort noch offen ist.
  if(meins!=null&&!eingetragen.has(`${q.id}-${q.n}`)){eingetragen.add(`${q.id}-${q.n}`);W.eintragen(q.id,q.i,alsWc(a,meins))}
  const f=meins!=null?anteil(a,meins):null,plus=pk?pk[1]:0,serie=pk?pk[3]:0;
  const fehler=a.art==='wahl'&&meins!=null&&f<1&&a.fehler&&a.fehler[meins]?` ${a.fehler[meins]}`:'';
  return `${frageHTML(a)}
    <div class="fb ${f==null?'neu':f>=1?'ok':f>0?'amb':'bad'}" data-qz-ergebnis><p><b>${f==null?'Keine Antwort.':f>=1?'Richtig!':f>0?'Teilweise richtig.':'Nicht ganz.'}</b>${plus?` <b class="num">+${zahlText(plus)} Punkte</b>`:''}${f>=1&&serie>=2?` · <span class="ms sm" aria-hidden="true">local_fire_department</span> ${serie} richtig in Folge`:''}${fehler}</p>
      <p class="small">Richtig ist: ${W.loesungHTML(a)}</p>${a.e?`<p class="small">${a.e}</p>`:''}</div>
    ${platzHTML(q,pk)}`;
}

/* ---------- Ansicht der Lehrkraft (Beamer) ---------- */
function verteilung(q,a){
  const sp=raum.zustand().spieler.filter(p=>p.q&&p.q.n===q.n);
  if(a.art==='zahl'){const ok=sp.filter(p=>anteil(a,p.q.w)>=1).length;return {ok,falsch:sp.length-ok,n:sp.length}}
  const z={};optionen(a).forEach(o=>{z[o.w]=sp.filter(p=>a.art==='mehrfach'?p.q.w&(1<<o.w):p.q.w===o.w).length});return {z,n:sp.length};
}
function rangHTML(q,titel){
  const r=rangliste(),nm=namen(),top=r.slice(0,5);
  const teams=q.team?(q.teams||[]).map((g,j)=>({k:j+1,g})).sort((x,y)=>y.g-x.g):[];
  return `<h2 class="title-l" id="qz-t" tabindex="-1">${titel}</h2>
    ${teams.length?`<ol class="qz-rang">${teams.map(t=>`<li><span class="qz-platz-n num">${1+teams.filter(x=>x.g>t.g).length}.</span><span class="ms" aria-hidden="true">groups</span><span class="qz-name">${team(t.k)}</span><span class="num">${zahlText(t.g)}</span></li>`).join('')}</ol><p class="small muted">Punkte im Schnitt pro Team</p>`:''}
    ${top.length?`${teams.length?'<p class="title-s">Beste Einzelwertung</p>':''}<ol class="qz-rang">${top.map(x=>{const e=LK&&LK.pkt[x.uid];return `<li${x.platz<=3?` class="qz-p${x.platz}"`:''}><span class="qz-platz-n num">${x.platz}.</span>${x.platz<=3?'<span class="ms" aria-hidden="true">emoji_events</span>':''}<span class="qz-name">${nm?esc(x.nick):`Platz ${x.platz}`}</span><span class="num">${zahlText(x.g)}${e&&e.plus&&q.ph!=='ende'?` <span class="small">(+${zahlText(e.plus)})</span>`:''}</span></li>`}).join('')}</ol>`:'<p class="small muted">Noch niemand im Raum.</p>'}`;
}
function lehrkraftHTML(q,def,a){
  if(!LK)return `<h2 class="title-l" id="qz-t" tabindex="-1">Klassen-Quiz</h2><p>Der Spielstand dieses Quiz ist auf diesem Gerät nicht mehr gespeichert. Beende das Quiz und starte es im Wissenscheck neu.</p>
    <div class="row"><button class="btn primary" type="button" data-qz-ende data-qz-haupt><span class="ms" aria-hidden="true">stop_circle</span>Quiz beenden</button></div>`;
  const sp=raum.zustand().spieler,ende=`<button class="btn text" type="button" data-qz-ende><span class="ms" aria-hidden="true">stop_circle</span>Quiz beenden</button>`;
  const letzte=LK.pos>=LK.liste.length-1;
  if(q.ph==='lobby'){
    const t=q.team?`<ul class="qz-rang">${Array.from({length:q.team},(x,j)=>`<li><span class="ms" aria-hidden="true">groups</span><span class="qz-name">${team(j+1)}</span><span class="num">${sp.filter(p=>p.team===j+1).length}</span></li>`).join('')}</ul><p class="small muted num">${sp.filter(p=>!p.team).length} noch ohne Team</p>`:'';
    return `<h2 class="headline-s" id="qz-t" tabindex="-1">Klassen-Quiz: Macht mit!</h2>
      <p>Auf allen Handys im Lernraum erscheint jetzt das Quiz${q.team?', zuerst wählt jeder sein Team':''}. Raumcode: <b class="mono">${esc(raum.sitzung().code)}</b></p>
      <div class="qz-lobby"><div class="stack"><p class="headline-s num">${sp.length} ${sp.length===1?'Gerät':'Geräte'} im Raum</p>${t}</div>
        <figure class="qz-qr"><div class="lr-qr">${qrSVG(linkZu(raum.sitzung().code))}</div><figcaption class="small muted">Noch nicht dabei? QR-Code scannen</figcaption></figure></div>
      <p class="small muted">${q.von} Fragen · ${q.s?`${q.s} Sekunden pro Frage, Rechnen doppelt so lang`:'ohne Zeitlimit'} · bis 1000 Punkte pro Frage, schneller gibt mehr</p>
      <div class="row"><button class="btn primary" type="button" data-qz-weiter data-qz-haupt><span class="ms" aria-hidden="true">play_arrow</span>Erste Frage</button>${ende}</div>`;
  }
  if(q.ph==='ende')
    return `${rangHTML(q,'<span class="ms" aria-hidden="true">emoji_events</span> Endstand')}
      <p class="small">Die Antworten stehen im Dashboard unter „Wissenscheck“, auf den Handys auch im eigenen Wissenscheck mit Lösungen.</p>
      <div class="row"><button class="btn primary" type="button" data-qz-ende data-qz-haupt><span class="ms" aria-hidden="true">stop_circle</span>Quiz beenden</button></div>`;
  const opts=a.art==='zahl'?[]:optionen(a);
  if(q.ph==='frage'){
    const n=geantwortet(q);
    return `${q.s?`<div class="qz-zeit"><p class="headline-s num" role="timer" data-qz-zeit></p><div class="wc-balken" aria-hidden="true"><span data-qz-balken></span></div></div>`:''}${frageHTML(a)}
      ${a.art==='zahl'?`<p class="title-m"><span class="ms" aria-hidden="true">calculate</span> Ergebnis${a.einheit?` in ${a.einheit}`:''} auf dem Handy eintippen</p>`:`<div class="qz-felder">${opts.map((o,k)=>feld(o,k)).join('')}</div>`}
      ${a.art==='mehrfach'?'<p class="small">Mehrere Antworten sind richtig.</p>':''}
      <p class="title-m num" data-qz-n>${n} von ${sp.length} haben geantwortet</p>
      <div class="row"><button class="btn primary" type="button" data-qz-schliessen data-qz-haupt><span class="ms" aria-hidden="true">visibility</span>Auflösen</button>${q.s?'<button class="btn" type="button" data-qz-mehr><span class="ms" aria-hidden="true">more_time</span>15 Sekunden mehr</button>':''}${ende}</div>`;
  }
  if(q.ph==='zu')return `${frageHTML(a)}<p class="title-m"><span class="ms" aria-hidden="true">hourglass_top</span> Zeit ist um, die Antworten werden ausgewertet …</p>`;
  // Aufgelöst: erst Lösung mit Verteilung, dann Rangliste
  const knopf=`<button class="btn primary" type="button" data-qz-weiter data-qz-haupt><span class="ms" aria-hidden="true">${letzte?'emoji_events':'skip_next'}</span>${letzte?'Zum Endstand':'Nächste Frage'}</button>`;
  if(ansicht==='rang')return `${rangHTML(q,`Rangliste nach Frage ${q.nr}`)}<div class="row">${knopf}${ende}</div>`;
  const v=verteilung(q,a);
  const loesung=a.art==='zahl'?`<p class="title-m">Richtig ist: ${W.loesungHTML(a)}</p><p class="title-m num">${v.ok} richtig · ${v.falsch} falsch · ${sp.length-v.n} ohne Antwort</p>`
    :`<div class="qz-felder">${opts.map((o,k)=>{const r=richtig(a,o.w),c=v.z[o.w]||0,p=v.n?Math.round(c/v.n*100):0;
      return feld(o,k,`<span class="qz-zahl-n num">${r?'<span class="sr-only">Richtig, </span><span class="ms" aria-hidden="true">check_circle</span> ':''}${c}<span class="sr-only"> ${c===1?'Stimme':'Stimmen'}</span></span><span class="qz-anteil" aria-hidden="true"><span style="width:${p}%"></span></span>`,'',r?' richtig':' falsch')}).join('')}</div>`;
  return `${frageHTML(a)}${loesung}${a.e?`<p>${a.e}</p>`:''}<p class="small muted num">${v.n} von ${sp.length} haben geantwortet</p>
    <div class="row"><button class="btn primary" type="button" data-qz-rang data-qz-haupt><span class="ms" aria-hidden="true">leaderboard</span>Rangliste</button>${knopf.replace(' primary','').replace(' data-qz-haupt','')}${ende}</div>`;
}

/* ---------- Ereignisse ---------- */
raum.on(art=>{
  if(!['raum','spieler','start','verbunden','ende','quiz'].includes(art))return;
  const q=raum.quiz();
  // Lehrkraft: Haben alle geantwortet, ist die Frage vorbei
  if(art==='spieler'&&raum.istLehrkraft()&&q.ph==='frage'){const n=raum.zustand().spieler.length;if(n&&geantwortet(q)>=n)schliessen()}
  if(art==='raum'&&raum.istLehrkraft()&&q.ph==='zu'&&schliesst!==q.n){schliesst=q.n;setTimeout(()=>auswerten(q.n),1500)}
  fenster();
  $$('[data-quiz]').forEach(kasten);
});
// Esc schließt das Quiz-Fenster (nicht während der Pause)
document.addEventListener('keydown',e=>{const el=$('#qz'),p=$('#lr-pause');
  if(e.key!=='Escape'||!el||el.hidden||(p&&!p.hidden))return;e.stopPropagation();$('[data-qz-zu]',el).click()},true);
