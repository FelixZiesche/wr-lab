// Planspiel-Grundmechanik für alle Themen: Einzelspiel, Klassenspiel mit Stimmkarten und Live-Klassenraum.
// Das Modul kümmert sich um Modi, Beitritt mit Code und QR-Code, Figurenwahl, den Ablauf jeder Runde
// (Ereignis → Abstimmung → Beschluss → Check → private Entscheidung), das Lehrkraft-Dashboard und den Beamer-Modus.
// Das Thema liefert nur die Inhalte. Beispiel: sechseck/leben.js
//
// spiel = {
//   thema: 'sechseck',                 Ordnername des Themas, wird im Live-Raum gespeichert
//   speicher: 'ms6-leben',             Präfix für Spielstände im Browser
//   figuren: [{id, n, a, ort, job}],   id: Kleinbuchstaben, Ziffern, Bindestrich (max. 24 Zeichen)
//   runden: [{y, t, real, q, opts: [{k: 'A'|'B'|'C', t, d}], choice: {q, opts: [{t, l}]}}]
//   portrait(f)                        → SVG der Figur
//   einleitung, figurenTitel           → Texte im Startmenü
//   figurInfo(f)                       → Zusatzzeilen bei der Figurenwahl (HTML)
//   hudWerte(f, g)                     → Kennzahlen in der Kopfleiste (HTML)
//   ereignis(f, g)                     → Ereignis aus Sicht der Figur (HTML)
//   optionWirkung(f, g, o)             → Wirkung einer Option auf die Figur (HTML)
//   ergebnis(f, g)                     → Ergebnis des Beschlusses (HTML)
//   check(r, o)                        → {frage, optionen: [{txt, ok}], warum} Fachbegriff-Check
//   privat: {wurf(o), rueckmeldung(o, x)} optional: Zufall bei der privaten Entscheidung
//   bilanz(f, g, live)                 → Abschlussbilanz (HTML)
//   werte(f, g)                        → Kennzahlen fürs Dashboard, z. B. {konto, mood}
//   texte: {beschluss}                 optional, z. B. 'Der Bundestag beschließt'
//   lehrkraft: {ereignis(t), optionInfo(o), abstimmungDetails(t), ergebnis(t, hinweis), bilanz(t), auswertung,
//               dashKopf, dashZeile(p, f), dashHinweis}
// }
// g = Spielstand eines Spielers {r, ph, decs, votes, ck, ch, chx, …}, t = Spielstand der Lehrkraft {r, ph, decs, …}
import { $, $$, esc, store, bindPhoto } from './ui.js';
import { connect } from './live.js';
import { THEMEN } from '../../themen.js';

export const OPTC={A:'var(--md-o-A);--on-oc:var(--md-on-o-A)',B:'var(--md-o-B);--on-oc:var(--md-on-o-B)',C:'var(--md-o-C);--on-oc:var(--md-on-o-C)'};
const KEYS=['A','B','C'];
const CODE_ALPHA=/[^A-HJ-NP-Z2-9]/g;
const normCode=s=>String(s||'').toUpperCase().replace(CODE_ALPHA,'').slice(0,6);
function qrSVG(text){try{if(!window.qrcode)return '';const q=window.qrcode(0,'M');q.addData(text);q.make();return q.createSvgTag({cellSize:6,margin:2,scalable:true,alt:'QR-Code zum Beitreten'})}catch(e){return ''}}
const joinURL=code=>location.href.split('#')[0]+'#join='+code;

let pendingJoin=null;
/** Liest einen Beitrittscode aus der Adresse (#join=CODE). */
export const joinHash=h=>{const m=/^join=([A-Za-z0-9]+)/.exec(h);return m?normCode(m[1]):''};
/** Merkt sich einen Code aus dem QR-Link, das Planspiel öffnet dann direkt den Beitritt. */
export function setPendingJoin(code){pendingJoin=code}

/** Startet das Planspiel im Element app. */
export function mountPlanspiel(app,spiel){
  const FIG=spiel.figuren, ROUNDS=spiel.runden, N=ROUNDS.length;
  const TX=Object.assign({beschluss:'Der Bundestag beschließt'},spiel.texte);
  const LK=spiel.lehrkraft;
  const privat=Object.assign({wurf:()=>0,rueckmeldung:o=>({cls:'neu',html:esc(o.l)})},spiel.privat);
  const avatarHTML=(f,big)=>`<span class="avatar${big?' lg':''}">${spiel.portrait(f)}</span>`;
  let unsub=[];
  const cleanup=()=>{unsub.forEach(u=>{try{u()}catch(e){}});unsub=[]};
  const obs=new MutationObserver(()=>{if(!document.body.contains(app)){cleanup();obs.disconnect()}});obs.observe(document.body,{childList:true,subtree:true});
  const save=(k,v)=>store(spiel.speicher+'-'+k,v);
  const load=k=>store(spiel.speicher+'-'+k);
  const top=()=>{const m=$('#modal');if(m&&!m.hidden)m.scrollTop=0;else window.scrollTo(0,0)};
  const waiting=txt=>{app.innerHTML=`<div class="panel row"><span class="ms">hourglass_top</span><span>${txt}</span></div>`};
  const head=(R,h,size)=>`<div class="row"><span class="yr">${R.y}</span><h3${size?` style="font-size:${size}"`:''}>${h}</h3></div>`;
  const eventHead=(R,size)=>`<div class="row"><span class="yr">${R.y}</span><h3 style="font-size:${size}">${esc(R.t)}</h3><span class="tagx">${R.real?'echte Lage':'Szenario'}</span></div>`;
  const nextLabel=r=>r<N-1?'Nächste Runde<span class="ms trail">arrow_forward</span>':'Zur Abschlussbilanz<span class="ms trail">arrow_forward</span>';

  /* ----- Startmenü ----- */
  function menu(){
    cleanup();
    const so=load('solo'),st=load('schueler'),lk=load('lk');
    app.innerHTML=`<p class="task"><b>Worum geht’s?</b> ${spiel.einleitung}</p><div class="mode-cards">
      <button class="mode-card" type="button" data-m="solo"><span class="ic"><span class="ms">person</span></span><span class="eyebrow">Einzelspiel</span><h3>Allein spielen</h3><p class="small muted">Du wählst eine Figur und entscheidest jede Runde selbst, was die Politik tut. Ideal für Hausaufgaben oder Stillarbeit.</p>${so&&so.fig?`<span class="small">Spielstand vorhanden: ${esc(FIG.find(f=>f.id===so.fig)?.n||'')}, Runde ${Math.min(N,(so.decs||[]).length+1)}</span>`:''}</button>
      <button class="mode-card" type="button" data-m="lk"><span class="ic"><span class="ms">co_present</span></span><span class="eyebrow">Klassenspiel</span><h3>Lehrkraft (Beamer)</h3><p class="small muted">Du erstellst den Klassenraum mit Code, steuerst die Runden und siehst live, was die Klasse macht.</p>${lk&&lk.code?`<span class="small">Offener Raum: <b class="mono">${esc(lk.code)}</b>, Runde ${Math.min(N,(lk.decs||[]).length+1)}</span>`:''}</button>
      <button class="mode-card" type="button" data-m="schueler"><span class="ic"><span class="ms">groups</span></span><span class="eyebrow">Klassenspiel</span><h3>Schüler (eigenes Gerät)</h3><p class="small muted">Mit dem Code vom Beamer beitreten, Figur spielen, auf dem Handy abstimmen.</p>${st&&st.fig?`<span class="small">Spielstand vorhanden: ${esc(FIG.find(f=>f.id===st.fig)?.n||'')}${st.code?` in Raum <b class="mono">${esc(st.code)}</b>`:''}</span>`:''}</button></div>
      <div class="panel"><h3>${esc(spiel.figurenTitel||'Die Figuren')}</h3><div class="figs">${FIG.map(f=>`<div class="fig" style="cursor:default"><div class="fighead">${avatarHTML(f)}<div><div class="nm">${esc(f.n)}, ${f.a}</div><div class="sm">${esc(f.ort)}</div></div></div><div class="small">${esc(f.job)}</div></div>`).join('')}</div></div>`;
    $$('[data-m]',app).forEach(b=>b.addEventListener('click',()=>{const m=b.dataset.m;
      if(m==='solo')return player('solo',null);
      waiting('Verbinde mit dem Live-Klassenraum …');
      connect().then(L=>{if(!document.body.contains(app))return;m==='lk'?teacherStart(L):player('schueler',L)})}));
  }

  /* ----- Spieler (Einzel und Schüler) ----- */
  function player(mode,L){
    cleanup();
    const live=mode==='schueler'&&L?L:null;
    let g=load(mode)||{};
    let liveOn=false,pushT=null,lastSent='';
    const pushMe=()=>{
      if(!live||!g.joined||!g.code)return;
      clearTimeout(pushT);pushT=setTimeout(()=>{
        const f=FIG.find(x=>x.id===g.fig);if(!f)return;
        const votes={},checks={},choices={};
        (g.votes||[]).forEach((v,i)=>{if(v)votes[i]=v});
        (g.ck||[]).forEach((v,i)=>{if(v==null)return;const d=(g.decs||[])[i];const o=d&&ROUNDS[i].opts.find(x=>x.k===d);if(o)checks[i]=spiel.check(i,o).optionen[v].ok});
        (g.ch||[]).forEach((v,i)=>{if(v!=null)choices[i]=v});
        const data={nick:g.nick,fig:g.fig,r:g.r||0,ph:g.ph||'event',votes,checks,choices,stats:spiel.werte(f,g)};
        const js=JSON.stringify(data);if(js===lastSent)return;lastSent=js;
        live.updatePlayer(g.code,data).catch(e=>console.warn('Senden fehlgeschlagen',e));
      },400);
    };
    const persist=()=>{save(mode,g);pushMe()};
    if(live){
      if(pendingJoin&&g.code!==pendingJoin){g={code:pendingJoin};save(mode,g)}
      pendingJoin=null;
      if(!g.joined)return joinScreen();
    }else if(mode==='schueler'&&pendingJoin){pendingJoin=null}
    if(!g.fig)return pickFig();
    if(live){
      unsub.push(live.watchRoom(g.code,d=>{
        if(!d||d.phase==='closed'){liveOn=false;return ended('Der Klassenraum wurde beendet oder ist abgelaufen.')}
        liveOn=true;
        if(g.gameId!==d.gameId){g.gameId=d.gameId;g.decs=[];g.ch=[];g.chx=[];g.ck=[];g.votes=[];g.r=0;g.ph='event';g.vote=null}
        const ld=(d.decisions||[]).filter(x=>KEYS.includes(x)).slice(0,N);
        if(ld.length>(g.decs||[]).length){g.decs=ld;if(g.ph==='wait'&&g.decs.length>g.r)g.ph='result'}
        persist();render();
      }));
      unsub.push(live.watchMe(g.code,exists=>{if(!exists&&g.joined)ended('Deine Lehrkraft hat dich aus dem Raum entfernt. Du kannst mit einem anderen Spitznamen neu beitreten.')}));
    }
    function ended(msg){
      cleanup();g={};save(mode,g);
      app.innerHTML=`<div class="panel stack" style="max-width:560px"><h3 class="title-l">Live-Spiel beendet</h3><p>${esc(msg)}</p><div class="cta"><button class="btn primary" type="button" id="rj"><span class="ms">login</span>Neu beitreten</button><button class="btn text" type="button" id="bk"><span class="ms">arrow_back</span>Menü</button></div></div>`;
      $('#rj',app).addEventListener('click',()=>player(mode,L));$('#bk',app).addEventListener('click',menu);
    }
    function joinScreen(err){
      app.innerHTML=`<div class="row"><button class="btn small" type="button" id="bk"><span class="ms">arrow_back</span>Menü</button></div>
      <form class="panel stack" id="jf" style="max-width:520px" novalidate><h3 class="title-l">Klassenraum beitreten</h3>
      <p class="small muted">Gib den Code vom Beamer ein und wähle einen Spitznamen. Bitte nicht deinen vollen echten Namen.</p>
      <div class="ctrl"><label for="jc">Code</label><input id="jc" type="text" inputmode="text" maxlength="8" autocomplete="off" autocapitalize="characters" spellcheck="false" value="${esc(g.code||'')}" style="font-family:var(--mono);font-size:1.5rem;letter-spacing:.2em;text-transform:uppercase"></div>
      <div class="ctrl"><label for="jn">Spitzname</label><input id="jn" type="text" maxlength="20" autocomplete="off" value="${esc(g.nick||'')}"></div>
      <div class="fb bad" id="jerr" ${err?'':'hidden'}>${esc(err||'')}</div>
      <div class="cta"><button class="btn primary" type="submit" id="jgo"><span class="ms">login</span>Weiter zur Figurenwahl</button></div></form>`;
      $('#bk',app).addEventListener('click',menu);
      $('#jf',app).addEventListener('submit',async e=>{e.preventDefault();
        const code=normCode($('#jc',app).value),nick=$('#jn',app).value.trim().replace(/\s+/g,' ').slice(0,20);
        const fail=t=>{const el=$('#jerr',app);el.textContent=t;el.hidden=false};
        if(code.length!==6)return fail('Der Code hat sechs Zeichen, zum Beispiel K7Q2XM.');
        if(!nick)return fail('Bitte gib einen Spitznamen ein.');
        $('#jgo',app).disabled=true;
        const room=await live.getRoom(code);
        $('#jgo',app).disabled=false;
        if(!room)return fail('Diesen Raum gibt es nicht (mehr). Prüfe den Code.');
        if(room.topic&&room.topic!==spiel.thema){
          const th=THEMEN.find(x=>x.id===room.topic);
          if(!th)return fail('Dieser Code gehört zu einem anderen Thema.');
          const el=$('#jerr',app);el.hidden=false;
          el.innerHTML=`Dieser Code gehört zum Thema „${esc(th.titel)}“. <a href="../${th.id}/#join=${code}">Dort beitreten</a>`;
          return;
        }
        if(!room.open)return fail('Dieser Raum nimmt gerade niemanden auf.');
        g={code,nick,gameId:room.gameId};save(mode,g);pickFig();
      });
    }
    function pickFig(err){
      app.innerHTML=`<div class="row"><button class="btn small" type="button" id="bk"><span class="ms">arrow_back</span>Menü</button><b>Wähle deine Figur</b>${mode==='schueler'?'<span class="small muted">Nimm die Figur, die deine Lehrkraft dir zuteilt.</span>':''}</div>
      ${err?`<div class="fb bad">${esc(err)}</div>`:''}
      <div class="figs">${FIG.map(f=>`<button class="fig" type="button" data-f="${f.id}"><div class="fighead">${avatarHTML(f,true)}<div><div class="nm">${esc(f.n)}, ${f.a}</div><div class="sm">${esc(f.ort)}</div></div></div><div class="small">${esc(f.job)}</div>${spiel.figurInfo(f)}</button>`).join('')}</div>`;
      $('#bk',app).addEventListener('click',menu);
      $$('[data-f]',app).forEach(b=>b.addEventListener('click',async()=>{
        const keep={code:g.code,nick:g.nick,joined:g.joined,gameId:g.gameId||null};
        const fig=b.dataset.f;
        if(live){
          $$('[data-f]',app).forEach(x=>x.disabled=true);
          try{
            const f=FIG.find(x=>x.id===fig);
            const base={nick:keep.nick,fig,r:0,ph:'event',votes:{},checks:{},choices:{},stats:spiel.werte(f,{r:0,ph:'event',decs:[],ch:[],chx:[]})};
            if(keep.joined)await live.updatePlayer(keep.code,base);else await live.joinRoom(keep.code,base);
          }catch(e){console.warn(e);return pickFig('Beitreten hat nicht geklappt. Ist der Raum noch offen? Frag deine Lehrkraft.')}
          keep.joined=true;
        }
        g=Object.assign(keep,{fig,decs:[],ch:[],chx:[],ck:[],votes:[],r:0,ph:'event'});save(mode,g);lastSent='';player(mode,L);
      }));
    }
    function hud(f){
      return `<div class="hud">${avatarHTML(f)}<div><div class="nm"><b>${esc(f.n)}, ${f.a}</b></div><div class="small muted">${esc(f.ort)}</div></div>
        <div><div class="k">Runde</div><div class="v">${Math.min(N,g.r+1)}/${N}</div></div>
        ${spiel.hudWerte(f,g)}
        ${mode==='schueler'?(live?`<div class="small"><span class="live-dot ${liveOn?'':'off'}"></span>${liveOn?`Live in Raum <b class="mono">${esc(g.code)}</b> als ${esc(g.nick)}`:'Verbinde …'}</div>`:`<div class="small"><span class="live-dot off"></span>Ohne Live-Verbindung</div>`):''}
        <span style="flex:1"></span>${live?'<button class="btn text small" type="button" id="leave"><span class="ms">logout</span>Raum verlassen</button>':''}<button class="btn small" type="button" id="bk"><span class="ms">arrow_back</span>Menü</button></div>
        <div class="fb amb" id="leave-q" hidden>Raum wirklich verlassen? Dein Spielstand in diesem Raum wird gelöscht. <button class="btn small primary" type="button" id="leave-y">Verlassen</button> <button class="btn small text" type="button" id="leave-n">Abbrechen</button></div>`;
    }
    function render(){
      if(!document.body.contains(app))return;
      const f=FIG.find(x=>x.id===g.fig);if(!f)return pickFig();
      g.decs=g.decs||[];g.ch=g.ch||[];g.chx=g.chx||[];
      if(g.r>=N)g.ph='end';
      const R=ROUNDS[Math.min(g.r,N-1)];
      let h=hud(f);
      if(g.ph==='event'){
        h+=`${eventHead(R,'1.3rem')}
        ${spiel.ereignis(f,g)}
        <div class="cta"><button class="btn primary" type="button" id="go">Zur Abstimmung<span class="ms trail">arrow_forward</span></button></div>`;
      }else if(g.ph==='vote'){
        h+=`${head(R,esc(R.q))}
        <p class="small muted">${mode==='solo'?'Du entscheidest. Deine Wahl wird zum Beschluss.':'Stimme aus Sicht deiner Figur ab.'}</p>
        <div class="opts">${R.opts.map(o=>`<button class="opt" type="button" data-o="${o.k}" style="--oc:${OPTC[o.k]}"><span class="lt"><span class="letter">${o.k}</span><b>${esc(o.t)}</b></span><span class="small">${esc(o.d)}</span>${spiel.optionWirkung(f,g,o)}</button>`).join('')}</div>`;
      }else if(g.ph==='card'){
        const o=R.opts.find(x=>x.k===g.vote);
        h+=`<div class="stimmkarte" style="--oc:${OPTC[g.vote]}"><b>${g.vote}</b><span>${esc(o.t)}</span><span class="small">${esc(f.n)} stimmt dafür</span></div>
        <p class="small muted">${liveOn?'Deine Stimme ist beim Beamer angekommen.':'Halte die Karte hoch, damit deine Lehrkraft zählen kann.'}</p>
        <div class="cta"><button class="btn" type="button" id="schere"><span class="ms">undo</span>Schere – Stimme ändern</button><button class="btn primary" type="button" id="go">Weiter: Beschluss abwarten<span class="ms trail">arrow_forward</span></button></div>`;
      }else if(g.ph==='wait'){
        h+=`<div class="panel stack"><h3>Welchen Beschluss hat die Klasse gefasst?</h3>
        <p class="small muted">${liveOn?'Sobald deine Lehrkraft den Beschluss verkündet, geht es automatisch weiter.':'Deine Lehrkraft verkündet den Beschluss. Tippe den Buchstaben an:'}</p>
        ${liveOn?'<div class="row"><span class="ms">hourglass_top</span><span>Warte auf den Beschluss …</span></div>':`<div class="choice">${R.opts.map(o=>`<button type="button" data-d="${o.k}" style="font-weight:700">${o.k} – ${esc(o.t)}</button>`).join('')}</div>
        <details><summary class="small">Runde verpasst? Klassencode eingeben</summary><div class="row" style="margin-top:6px"><input id="kc" type="text" maxlength="${N}" placeholder="z. B. BAC" aria-label="Klassencode" style="width:8em;text-transform:uppercase"><button class="btn small" type="button" id="kcgo">Übernehmen</button></div></details>`}</div>`;
      }else if(g.ph==='result'){
        const o=R.opts.find(x=>x.k===g.decs[g.r]);
        h+=`<div class="row"><span class="yr">${R.y}</span><span class="letter" style="--oc:${OPTC[o.k]}">${o.k}</span><h3>Beschluss: ${esc(o.t)}</h3></div>
        ${spiel.ergebnis(f,g)}
        <div class="cta"><button class="btn primary" type="button" id="go">Weiter: Fachbegriff-Check<span class="ms trail">arrow_forward</span></button></div>`;
      }else if(g.ph==='check'){
        const o=R.opts.find(x=>x.k===g.decs[g.r]);const C=spiel.check(g.r,o);const ops=C.optionen;const a=(g.ck||[])[g.r];
        h+=`${head(R,'Fachbegriff-Check')}<div class="panel stack">
        <p><b>${esc(C.frage)}</b></p>
        <div class="choice" style="flex-direction:column">${ops.map((x,i)=>`<button type="button" data-k="${i}" style="text-align:left" class="${a!=null?(x.ok?'right':(a===i?'wrong':'')):''}">${esc(x.txt)}</button>`).join('')}</div>
        ${a!=null?`<div class="fb ${ops[a].ok?'ok':'amb'}"><b>${ops[a].ok?'Richtig!':'Nicht ganz.'}</b> ${esc(C.warum)}</div><div class="cta"><button class="btn primary" type="button" id="go">Weiter: private Entscheidung<span class="ms trail">arrow_forward</span></button></div>`:''}</div>`;
      }else if(g.ph==='choice'){
        const C=R.choice;const picked=g.ch[g.r];const fb=picked!=null?privat.rueckmeldung(C.opts[picked],g.chx[g.r]):null;
        h+=`${head(R,'Deine private Entscheidung')}<div class="panel stack"><p><b>${esc(C.q)}</b></p>
        <div class="opts">${C.opts.map((o,i)=>`<button class="opt" type="button" data-c="${i}" style="--oc:var(--accent)" aria-pressed="${picked===i}"><b>${esc(o.t)}</b>${picked!=null?`<span class="small muted">${esc(o.l)}</span>`:''}</button>`).join('')}</div>
        ${fb?`<div class="fb ${fb.cls}">${fb.html}</div>
        <div class="cta"><button class="btn primary" type="button" id="go">${nextLabel(g.r)}</button></div>`:''}</div>`;
      }else if(g.ph==='end'){
        h+=`${spiel.bilanz(f,g,!!live)}
        ${live?'':`<div class="cta"><button class="btn" type="button" id="again"><span class="ms">refresh</span>Noch einmal mit anderen Beschlüssen</button><button class="btn" type="button" id="newfig">Andere Figur wählen</button></div>`}`;
      }
      app.innerHTML=h;bindPhoto(app);
      $('#bk',app)?.addEventListener('click',()=>{cleanup();menu()});
      if($('#leave',app)){
        $('#leave',app).addEventListener('click',()=>{$('#leave-q',app).hidden=false});
        $('#leave-n',app).addEventListener('click',()=>{$('#leave-q',app).hidden=true});
        $('#leave-y',app).addEventListener('click',async()=>{const c=g.code;cleanup();g={};save(mode,g);try{await live.kick(c,live.uid)}catch(e){}menu()});
      }
      const go=$('#go',app);
      if(g.ph==='event')go.addEventListener('click',()=>{g.ph='vote';persist();render();top()});
      if(g.ph==='vote')$$('[data-o]',app).forEach(b=>b.addEventListener('click',()=>{
        g.vote=b.dataset.o;g.votes=g.votes||[];g.votes[g.r]=g.vote;
        if(mode==='solo'){g.decs[g.r]=g.vote;g.ph='result'}else g.ph='card';
        persist();render();top()}));
      if(g.ph==='card'){$('#schere',app).addEventListener('click',()=>{g.ph='vote';persist();render()});go.addEventListener('click',()=>{g.ph=g.decs.length>g.r?'result':'wait';persist();render();top()})}
      if(g.ph==='wait'&&!liveOn){
        $$('[data-d]',app).forEach(b=>b.addEventListener('click',()=>{g.decs[g.r]=b.dataset.d;g.decs=g.decs.slice(0,g.r+1);g.ph='result';persist();render();top()}));
        $('#kcgo',app).addEventListener('click',()=>{const c=($('#kc',app).value||'').toUpperCase().split('').filter(x=>KEYS.includes(x)).slice(0,N).join('');if(!c)return;g.decs=c.split('');g.r=Math.min(c.length-1,N-1);g.ph='result';g.ch=g.ch.slice(0,g.r);g.chx=g.chx.slice(0,g.r);persist();render();top()});
      }
      if(g.ph==='result')go.addEventListener('click',()=>{g.ph='check';persist();render();top()});
      if(g.ph==='check'){
        $$('[data-k]',app).forEach(b=>b.addEventListener('click',()=>{g.ck=g.ck||[];if(g.ck[g.r]!=null)return;g.ck[g.r]=+b.dataset.k;persist();render()}));
        go?.addEventListener('click',()=>{g.ph='choice';persist();render();top()});
      }
      if(g.ph==='choice'){
        $$('[data-c]',app).forEach(b=>b.addEventListener('click',()=>{if(g.ch[g.r]!=null)return;const i=+b.dataset.c;g.ch[g.r]=i;g.chx[g.r]=privat.wurf(R.choice.opts[i]);persist();render()}));
        go?.addEventListener('click',()=>{g.r++;g.vote=null;g.ph=g.r>=N?'end':'event';persist();render();top()});
      }
      if(g.ph==='end'&&!live){
        $('#again',app).addEventListener('click',()=>{g.decs=[];g.ch=[];g.chx=[];g.ck=[];g.votes=[];g.r=0;g.ph='event';persist();render();top()});
        $('#newfig',app).addEventListener('click',()=>{g={gameId:g.gameId};persist();player(mode,L)});
      }
    }
    render();pushMe();
  }

  /* ----- Lehrkraft (Beamer) mit Live-Dashboard ----- */
  function teacherStart(L){
    cleanup();
    const live=L||null;
    const newT=()=>({gameId:Math.random().toString(36).slice(2,8),r:0,ph:'lobby',decs:[],tally:{A:0,B:0,C:0},show:false,anon:false,code:(t&&t.code)||null});
    let t=null;t=load('lk');
    if(!t||!t.gameId)t=newT();
    const persist=()=>save('lk',t);persist();
    let players=[],roomOk=false,roomErr='',busy=false,playersUnsub=null,confirmClose=false;
    const pushState=()=>{if(live&&t.code&&roomOk)live.updateRoom(t.code,{round:t.r,phase:t.ph,decisions:t.decs.slice(),gameId:t.gameId}).catch(e=>console.warn('Raum-Update',e))};
    async function attach(){
      if(!live||!t.code){render();return}
      const r=await live.getRoom(t.code);
      if(!document.body.contains(app))return;
      if(!r||r.owner!==live.uid||r.phase==='closed'){t.code=null;roomOk=false;persist();render();return}
      roomOk=true;
      if(playersUnsub)playersUnsub();
      playersUnsub=live.watchPlayers(t.code,ps=>{players=ps.sort((a,b)=>((a.joinedAt&&a.joinedAt.seconds)||0)-((b.joinedAt&&b.joinedAt.seconds)||0));render()});
      unsub.push(()=>playersUnsub&&playersUnsub());
      pushState();render();
    }
    async function createRoom(){busy=true;roomErr='';render();
      try{t.code=await live.createRoom(spiel.thema,t.gameId);persist();await attach()}
      catch(e){console.warn(e);roomErr='Der Klassenraum konnte nicht erstellt werden. Prüfe die Firebase-Einrichtung (README, Abschnitt „Firebase einrichten“).'}
      busy=false;render()}
    async function closeRoom(){busy=true;render();
      if(playersUnsub){playersUnsub();playersUnsub=null}
      try{await live.closeRoom(t.code)}catch(e){console.warn(e)}
      t.code=null;roomOk=false;players=[];busy=false;confirmClose=false;persist();render()}
    const liveVotes=()=>{const c={A:0,B:0,C:0};players.forEach(p=>{const v=p.votes&&p.votes[t.r];if(c[v]!=null)c[v]++});return c};
    const label=p=>{if(!t.anon)return esc(p.nick||'?');const same=players.filter(q=>q.fig===p.fig);return `${esc(FIG.find(f=>f.id===p.fig)?.n||'?')} ${same.indexOf(p)+1}`};
    const figOf=p=>FIG.find(f=>f.id===p.fig)||FIG[0];
    const stepOf=p=>{const order=['event','vote','card','wait','result','check','choice'];return (p.r||0)*10+Math.max(0,order.indexOf(p.ph))+(p.ph==='end'?100:0)};
    function lobbyLiveHTML(){
      if(!live)return `<div class="fb neu"><b>Live-Modus nicht eingerichtet.</b> Das Planspiel läuft mit Stimmkarten. Wie du den Live-Klassenraum einschaltest, steht in der README im GitHub-Projekt.</div>`;
      if(!t.code||!roomOk)return `<div class="panel stack"><h3 class="title-l">Live-Klassenraum</h3><p>Erstelle einen Raum. Die Schüler treten mit Code oder QR-Code bei – ohne Konto.</p>${roomErr?`<div class="fb bad">${esc(roomErr)}</div>`:''}<div class="cta"><button class="btn primary" type="button" id="mkroom" ${busy?'disabled':''}><span class="ms">add</span>Live-Klassenraum erstellen</button></div></div>`;
      const url=joinURL(t.code);const cnt={};players.forEach(p=>cnt[p.fig]=(cnt[p.fig]||0)+1);
      return `<div class="grid2 wide-left"><div class="panel stack"><p class="eyebrow">Raumcode</p><div class="code" style="font-size:clamp(2.5rem,7vw,4.5rem);letter-spacing:.15em;line-height:1.15;margin-top:4px;display:block">${esc(t.code)}</div>
        <p class="small">Seite öffnen → <b>Planspiel</b> → <b>Schüler</b> → Code eingeben. Oder QR-Code scannen.</p><p class="small muted mono" style="word-break:break-all">${esc(url)}</p>
        <div><p class="title-s" style="margin-bottom:8px">Figuren in der Klasse</p>${FIG.map(f=>`<div class="row" style="gap:10px;margin-bottom:4px">${avatarHTML(f)}<span style="width:5.5em">${esc(f.n)}</span><div class="bar" style="flex:1"><i style="width:${Math.min(100,(cnt[f.id]||0)*25)}%"></i></div><b class="num" style="width:2ch;text-align:right">${cnt[f.id]||0}</b></div>`).join('')}</div></div>
        <div class="panel stack" style="align-items:center"><div style="width:min(100%,300px);background:#fff;border-radius:16px;padding:8px">${qrSVG(url)}</div><p class="small muted">QR-Code zum Beitreten</p></div></div>`;
    }
    function playersHTML(){
      if(!players.length)return '<p class="small muted">Noch niemand im Raum.</p>';
      return `<div class="row" style="gap:8px">${players.map(p=>`<span class="pill neu" style="padding:4px 6px 4px 4px;gap:6px"><span class="avatar" style="width:24px;height:24px;border-radius:8px">${spiel.portrait(figOf(p))}</span>${label(p)}${!t.anon?`<button class="icon-btn" type="button" data-kick="${esc(p.uid)}" aria-label="${esc(p.nick)} entfernen" title="Entfernen" style="width:24px;height:24px"><span class="ms sm">close</span></button>`:''}</span>`).join('')}</div>`;
    }
    function dashHTML(){
      if(!live||!t.code||!roomOk)return '';
      const n=players.length;const head=`<div class="row" style="justify-content:space-between"><h3 class="title-l">Live-Dashboard</h3><span class="small muted">${n} ${n===1?'Person':'Personen'} im Raum</span></div>`;
      let body='';
      if(t.ph==='lobby'){body=playersHTML()}
      else if(t.ph==='event'){const done=players.filter(p=>stepOf(p)>t.r*10).length;
        body=`<p>Ereignis gelesen und weiter zur Abstimmung: <b>${done} von ${n}</b></p><div class="bar"><i style="width:${n?done/n*100:0}%"></i></div>${playersHTML()}`}
      else if(t.ph==='vote'){const c=liveVotes(),voted=players.filter(p=>p.votes&&p.votes[t.r]),missing=players.filter(p=>!(p.votes&&p.votes[t.r]));
        body=`<p>Abgestimmt: <b>${voted.length} von ${n}</b></p>${KEYS.map(k=>`<div class="row" style="gap:10px;margin:6px 0"><span class="letter" style="--oc:${OPTC[k]};width:28px;height:28px">${k}</span><div class="bar" style="flex:1;height:14px"><i style="width:${voted.length?c[k]/voted.length*100:0}%;background:var(--md-o-${k})"></i></div><b class="num" style="width:3ch;text-align:right">${c[k]}</b></div>`).join('')}
        ${missing.length?`<p class="small muted" style="margin-top:8px">Noch nicht abgestimmt: ${t.anon?missing.length+' Personen':missing.map(label).join(', ')}</p>`:''}
        <details style="margin-top:8px"><summary class="small">Wer hat wie abgestimmt?</summary><div class="tbl-wrap"><table><tbody>${FIG.map(f=>{const ps=players.filter(p=>p.fig===f.id);if(!ps.length)return '';const cc={A:0,B:0,C:0};ps.forEach(p=>{const v=p.votes&&p.votes[t.r];if(cc[v]!=null)cc[v]++});return `<tr><td>${esc(f.n)}</td>${KEYS.map(k=>`<td class="r num">${k}: ${cc[k]}</td>`).join('')}</tr>`}).join('')}</tbody></table></div></details>`}
      else if(t.ph==='result'){const ans=players.filter(p=>p.checks&&p.checks[t.r]!=null),ok=ans.filter(p=>p.checks[t.r]).length;
        const C=ROUNDS[t.r].choice,ch=C.opts.map(()=>0);players.forEach(p=>{const v=p.choices&&p.choices[t.r];if(v!=null&&ch[v]!=null)ch[v]++});const chn=ch.reduce((a,b)=>a+b,0);
        body=`<div class="grid2"><div class="stack"><p class="title-s">Fachbegriff-Check</p><p>${ans.length?`<b>${Math.round(ok/ans.length*100)} %</b> richtig (${ok} von ${ans.length} Antworten)`:'Noch keine Antworten.'}</p><div class="bar"><i style="width:${ans.length?ok/ans.length*100:0}%;background:var(--ok)"></i></div></div>
          <div class="stack"><p class="title-s">Private Entscheidung</p><p class="small muted">${esc(C.q)}</p>${C.opts.map((o,i)=>`<div><div class="small">${esc(o.t)}</div><div class="row" style="gap:8px"><div class="bar" style="flex:1"><i style="width:${chn?ch[i]/chn*100:0}%"></i></div><b class="num">${ch[i]}</b></div></div>`).join('')}</div></div>`}
      else if(t.ph==='end'){
        body=`<div class="tbl-wrap"><table><thead><tr><th>${t.anon?'Figur':'Spitzname'}</th><th>Figur</th>${LK.dashKopf}<th class="r">Check richtig</th></tr></thead><tbody>${players.map(p=>{const f=figOf(p);const cks=Object.values(p.checks||{});return `<tr><td>${label(p)}</td><td>${esc(f.n)}</td>${LK.dashZeile(p,f)}<td class="r num">${cks.filter(Boolean).length}/${cks.length}</td></tr>`}).join('')}</tbody></table></div>
        ${LK.dashHinweis||''}`}
      return `<section class="panel stack" style="background:var(--md-surface-container)">${head}${body}</section>`;
    }
    function render(){
      if(!document.body.contains(app))return;
      const R=ROUNDS[Math.min(t.r,N-1)];
      const liveOk=!!(live&&t.code&&roomOk);
      let h=`<div class="hud"><b>Klassenspiel · Lehrkraft</b><div><div class="k">Runde</div><div class="v">${Math.min(N,t.r+1)}/${N}</div></div>
        ${liveOk?`<div><div class="k">Raumcode</div><div class="v mono">${esc(t.code)}</div></div><div class="small"><span class="live-dot"></span>${players.length} live verbunden</div>`:`<div><div class="k">Klassencode</div><div class="v mono">${t.decs.join('')||'–'}</div></div><div class="small"><span class="live-dot off"></span>Ohne Live-Verbindung</div>`}
        <span style="flex:1"></span>${liveOk?`<button class="btn small" type="button" id="anon" aria-pressed="${!!t.anon}">Beamer-Modus</button><button class="btn text small" type="button" id="close"><span class="ms">delete</span>Raum beenden</button>`:''}<button class="btn small" type="button" id="bk"><span class="ms">arrow_back</span>Menü</button><button class="btn small" type="button" id="reset"><span class="ms">restart_alt</span>Neues Spiel</button></div>
        <div id="reset-q" class="fb amb" hidden>Spiel neu starten? Der Raum bleibt offen, alle Spielstände beginnen von vorn. <button class="btn small primary" type="button" id="reset-y">Ja, neu starten</button> <button class="btn small text" type="button" id="reset-n">Abbrechen</button></div>
        ${confirmClose?`<div class="fb bad">Raum ${esc(t.code)} beenden? Alle Daten der Schüler werden sofort gelöscht. <button class="btn small primary" type="button" id="close-y" ${busy?'disabled':''}>Raum löschen</button> <button class="btn small text" type="button" id="close-n">Abbrechen</button></div>`:''}`;
      if(t.ph==='lobby'){
        h+=`${lobbyLiveHTML()}${dashHTML()}<div class="panel stack"><h3>So läuft eine Runde</h3><ol style="margin:0;padding-left:1.2em"><li>Ereignis am Beamer zeigen, die Schüler lesen auf dem Handy, was es für ihre Figur bedeutet.</li><li>Debatte aus Sicht der Figuren.</li><li>Abstimmung ${liveOk?'auf den Handys – die Stimmen erscheinen hier live':'per Stimmkarte'}, dann Beschluss verkünden.</li></ol>
        <div class="cta"><button class="btn primary" type="button" id="go">Runde 1 starten<span class="ms trail">arrow_forward</span></button></div></div>`;
      }else if(t.ph==='event'){
        h+=`${eventHead(R,'1.5rem')}
        ${LK.ereignis(t)}
        ${dashHTML()}
        <div class="cta"><button class="btn primary" type="button" id="go">Abstimmung starten<span class="ms trail">arrow_forward</span></button></div>`;
      }else if(t.ph==='vote'){
        const lv=liveOk?liveVotes():{A:0,B:0,C:0};
        const tot={A:t.tally.A+lv.A,B:t.tally.B+lv.B,C:t.tally.C+lv.C};
        const details=LK.abstimmungDetails?LK.abstimmungDetails(t):'';
        h+=`${head(R,esc(R.q),'1.3rem')}
        <div class="opts">${R.opts.map(o=>`<div class="opt" style="--oc:${OPTC[o.k]};cursor:default"><span class="lt"><span class="letter">${o.k}</span><b>${esc(o.t)}</b></span><span class="small">${esc(o.d)}</span><span>${LK.optionInfo?LK.optionInfo(o):''}</span>
          <div class="tally"><button class="icon-btn" type="button" data-dn="${o.k}" aria-label="Stimme weniger für ${o.k}"><span class="ms">remove</span></button><span class="cnt">${tot[o.k]}</span><button class="icon-btn" type="button" data-up="${o.k}" aria-label="Stimme mehr für ${o.k}" style="background:var(--md-secondary-container);color:var(--md-on-secondary-container)"><span class="ms">add</span></button>${liveOk?`<span class="small muted">davon live: ${lv[o.k]}</span>`:''}</div></div>`).join('')}</div>
        ${dashHTML()}
        ${details?`<details class="panel" ${t.show?'open':''} id="who"><summary><b>Wer gewinnt, wer verliert?</b> <span class="small muted">(erst nach der Debatte aufklappen)</span></summary>${details}</details>`:''}
        <div class="cta" id="dec"></div>`;
      }else if(t.ph==='result'){
        const o=R.opts.find(x=>x.k===t.decs[t.r]);
        const hinweis=liveOk?'':`<div class="fb neu" style="margin-top:8px">Die Schüler tippen jetzt <b>${o.k}</b> ein. Wer eine Runde verpasst hat, gibt den Klassencode ein: <span class="code">${t.decs.join('')}</span></div>`;
        h+=`<div class="row"><span class="yr">${R.y}</span><span class="letter" style="--oc:${OPTC[o.k]}">${o.k}</span><h3 style="font-size:1.4rem">${esc(TX.beschluss)}: ${esc(o.t)}</h3></div>
        ${LK.ergebnis(t,hinweis)}
        ${dashHTML()}
        <div class="cta"><button class="btn primary" type="button" id="go">${nextLabel(t.r)}</button><span class="small muted">Die Schüler machen jetzt den Fachbegriff-Check und ihre private Entscheidung.</span></div>`;
      }else if(t.ph==='end'){
        h+=`${LK.bilanz(t)}
        ${dashHTML()}
        ${LK.auswertung||''}`;
      }
      app.innerHTML=h;bindPhoto(app);
      $('#bk',app).addEventListener('click',()=>{cleanup();menu()});
      $('#reset',app).addEventListener('click',()=>{$('#reset-q',app).hidden=false});
      $('#reset-n',app).addEventListener('click',()=>{$('#reset-q',app).hidden=true});
      $('#reset-y',app).addEventListener('click',()=>{t=newT();persist();pushState();render()});
      $('#mkroom',app)?.addEventListener('click',createRoom);
      $('#anon',app)?.addEventListener('click',()=>{t.anon=!t.anon;persist();render()});
      $('#close',app)?.addEventListener('click',()=>{confirmClose=true;render()});
      $('#close-n',app)?.addEventListener('click',()=>{confirmClose=false;render()});
      $('#close-y',app)?.addEventListener('click',closeRoom);
      $$('[data-kick]',app).forEach(b=>b.addEventListener('click',()=>live.kick(t.code,b.dataset.kick).catch(e=>console.warn(e))));
      const go=$('#go',app);
      if(t.ph==='lobby')go.addEventListener('click',()=>{t.ph='event';persist();pushState();render();top()});
      if(t.ph==='event')go.addEventListener('click',()=>{t.ph='vote';t.tally={A:0,B:0,C:0};t.show=false;persist();pushState();render();top()});
      if(t.ph==='vote'){
        $$('[data-up]',app).forEach(b=>b.addEventListener('click',()=>{t.tally[b.dataset.up]++;persist();render()}));
        $$('[data-dn]',app).forEach(b=>b.addEventListener('click',()=>{const k=b.dataset.dn;t.tally[k]=Math.max(0,t.tally[k]-1);persist();render()}));
        $('#who',app)?.addEventListener('toggle',e=>{t.show=e.target.open;persist()});
        const lv=liveOk?liveVotes():{A:0,B:0,C:0};
        const tot={A:t.tally.A+lv.A,B:t.tally.B+lv.B,C:t.tally.C+lv.C};
        const mx=Math.max(tot.A,tot.B,tot.C),win=KEYS.filter(k=>tot[k]===mx&&mx>0);
        const dec=$('#dec',app);
        dec.innerHTML=!mx?'<span class="small muted">Noch keine Stimmen.</span>':win.length===1?`<button class="btn primary" type="button" data-win="${win[0]}">Beschluss verkünden: ${win[0]}<span class="ms trail">arrow_forward</span></button>`:`<span class="small">Gleichstand – du entscheidest:</span>${win.map(k=>`<button class="btn primary" type="button" data-win="${k}">${k}</button>`).join('')}`;
        $$('[data-win]',dec).forEach(b=>b.addEventListener('click',()=>{t.decs[t.r]=b.dataset.win;t.decs=t.decs.slice(0,t.r+1);t.ph='result';persist();pushState();render();top()}));
      }
      if(t.ph==='result')go.addEventListener('click',()=>{t.r++;t.ph=t.r>=N?'end':'event';persist();pushState();render();top()});
    }
    attach();
  }

  menu();
  if(pendingJoin){waiting('Verbinde mit dem Klassenraum …');connect().then(L=>{if(document.body.contains(app))player('schueler',L)})}
}
