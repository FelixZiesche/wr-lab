// Planspiel-Grundmechanik für alle Themen: Einzelspiel, Klassenspiel mit Stimmkarten und Live-Klassenraum.
// Das Modul kümmert sich um Modi, Beitritt mit Code und QR-Code, Figurenwahl, den Ablauf jeder Runde
// (Ereignis → Abstimmung → Beschluss → Check → private Entscheidung), das Lehrkraft-Dashboard und den Beamer-Modus.
// Das Thema liefert nur die Inhalte. Beispiel: sechseck/leben.js
// Live läuft das Planspiel im Lernraum des Themas (lernraum.js): ein Code für Werkstätten und Planspiel.
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
import { $, $$, esc, store, bindPhoto, neuZeichnen } from './ui.js';
import { connect, liveFehler } from './live.js';
import { raum, normCode, qrSVG, linkZu, fehlerZeigen, fehlerWeg, neuLadenHTML, beitrittsWeg } from './lernraum.js';

export const OPTC={A:'var(--md-o-A);--on-oc:var(--md-on-o-A)',B:'var(--md-o-B);--on-oc:var(--md-on-o-B)',C:'var(--md-o-C);--on-oc:var(--md-on-o-C)'};
const KEYS=['A','B','C'];
const joinURL=code=>linkZu(code,'join');

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
  let unsub=[],ohneKlasse=false; // ohneKlasse: Schüler spielt nach einem Verbindungsproblem bewusst mit Stimmkarten weiter
  const cleanup=()=>{unsub.forEach(u=>{try{u()}catch(e){}});unsub=[]};
  const obs=new MutationObserver(()=>{if(!document.body.contains(app)){cleanup();obs.disconnect()}});obs.observe(document.body,{childList:true,subtree:true});
  const save=(k,v)=>store(spiel.speicher+'-'+k,v);
  const load=k=>store(spiel.speicher+'-'+k);
  // Nach jedem Spielschritt: nach oben und Fokus auf die Überschrift des neuen Schritts (Tastatur, Screenreader).
  // Live-Aktualisierungen lassen den Fokus, wo er ist (niemand wird beim Lesen oder Tippen gestört);
  // nur wenn das fokussierte Element dabei wegfällt, springt er auf die Überschrift (neuZeichnen mit KOPF).
  const KOPF='[data-fokus],h3:not(button h3):not(.hud h3)';
  const fokus=sel=>{const z=(sel&&$(sel,app))||$(KOPF,app);if(z){if(!z.matches('button,input,a[href]'))z.tabIndex=-1;z.focus({preventScroll:true})}};
  const oben=()=>{const m=$('#modal');if(m&&!m.hidden)m.scrollTop=0;else window.scrollTo(0,0)};
  const top=()=>{oben();fokus()};
  // springen: Der nächste Bildschirm bekommt den Fokus (nach Auswahl im Menü, auch wenn er erst nach dem Verbinden kommt)
  let springen=false;const gesprungen=sel=>{if(springen){springen=false;oben();fokus(sel)}};
  const waiting=txt=>{app.innerHTML=`<div class="panel row" role="status"><span class="ms" aria-hidden="true">hourglass_top</span><span>${txt}</span></div>`};
  const head=(R,h,size)=>`<div class="row"><span class="yr">${R.y}</span><h3${size?` style="font-size:${size}"`:''}>${h}</h3></div>`;
  const eventHead=(R,size)=>`<div class="row"><span class="yr">${R.y}</span><h3 style="font-size:${size}">${esc(R.t)}</h3><span class="tagx">${R.real?'echte Lage':'Szenario'}</span></div>`;
  const nextLabel=r=>r<N-1?'Nächste Runde<span class="ms trail" aria-hidden="true">arrow_forward</span>':'Zur Abschlussbilanz<span class="ms trail" aria-hidden="true">arrow_forward</span>';

  /* ----- Startmenü ----- */
  function menu(){
    cleanup();
    const so=load('solo'),st=load('schueler'),lk=load('lk');
    app.innerHTML=`<p class="task" data-fokus><b>Worum geht’s?</b> ${spiel.einleitung}</p><div class="mode-cards">
      <button class="mode-card" type="button" data-m="solo"><span class="ic"><span class="ms" aria-hidden="true">person</span></span><span class="eyebrow">Einzelspiel</span><h3>Allein spielen</h3><p class="small muted">Du wählst eine Figur und entscheidest jede Runde selbst, was die Politik tut. Du spielst in deinem Tempo, kannst jederzeit unterbrechen und später weiterspielen.</p>${so&&so.fig?`<span class="small">Spielstand vorhanden: ${esc(FIG.find(f=>f.id===so.fig)?.n||'')}, Runde ${Math.min(N,(so.decs||[]).length+1)}</span>`:''}</button>
      <button class="mode-card" type="button" data-m="lk"><span class="ic"><span class="ms" aria-hidden="true">co_present</span></span><span class="eyebrow">Klassenspiel</span><h3>Lehrkraft (Beamer)</h3><p class="small muted">Du erstellst den Klassenraum mit Code, steuerst die Runden und siehst live, was die Klasse macht.</p>${lk&&lk.code?`<span class="small">Offener Raum: <b class="mono">${esc(lk.code)}</b>, Runde ${Math.min(N,(lk.decs||[]).length+1)}</span>`:''}</button>
      <button class="mode-card" type="button" data-m="schueler"><span class="ic"><span class="ms" aria-hidden="true">groups</span></span><span class="eyebrow">Klassenspiel</span><h3>Schüler (eigenes Gerät)</h3><p class="small muted">Mit dem Code vom Beamer beitreten, Figur spielen, auf dem Handy abstimmen.</p>${st&&st.fig?`<span class="small">Spielstand vorhanden: ${esc(FIG.find(f=>f.id===st.fig)?.n||'')}${st.code?` in Raum <b class="mono">${esc(st.code)}</b>`:''}</span>`:''}</button></div>
      <div class="panel"><h3>${esc(spiel.figurenTitel||'Die Figuren')}</h3><div class="figs">${FIG.map(f=>`<div class="fig" style="cursor:default"><div class="fighead">${avatarHTML(f)}<div><div class="nm">${esc(f.n)}, ${f.a}</div><div class="sm">${esc(f.ort)}</div></div></div><div class="small">${esc(f.job)}</div></div>`).join('')}</div></div>`;
    gesprungen();
    $$('[data-m]',app).forEach(b=>b.addEventListener('click',()=>{const m=b.dataset.m;springen=true;
      if(m==='solo')return player('solo',null);
      waiting('Verbinde mit dem Live-Klassenraum …');
      connect().then(L=>{if(!document.body.contains(app))return;m==='lk'?teacherStart(L):player('schueler',L)})}));
  }

  const zumMenu=()=>{springen=true;menu()};

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
      const rs=raum.sitzung(),imRaum=rs&&rs.rolle==='schueler';
      if(pendingJoin&&!(imRaum&&rs.code===pendingJoin)){g={code:pendingJoin};save(mode,g);pendingJoin=null;return joinScreen()}
      pendingJoin=null;
      if(imRaum){if(g.code!==rs.code)g={code:rs.code};g.nick=rs.nick;g.joined=true;save(mode,g)}
      else if(g.joined){g={code:g.code,nick:g.nick};save(mode,g)}
      if(!g.joined)return joinScreen();
    }else if(mode==='schueler'&&!ohneKlasse){
      // Beitritt per QR-Link (oder im Lernraum), aber keine Verbindung: nicht still ohne Klasse weiterspielen
      const rs=raum.sitzung(),code=pendingJoin||(rs&&rs.rolle==='schueler'?rs.code:'');
      if(code)return keineVerbindung(code);
    }
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
      cleanup();g={};save(mode,g);raum.vergessen();
      const warDrin=app.contains(document.activeElement);
      app.innerHTML=`<div class="panel stack" style="max-width:560px"><h3 class="title-l">Live-Spiel beendet</h3><p>${esc(msg)}</p><div class="cta"><button class="btn primary" type="button" id="rj"><span class="ms" aria-hidden="true">login</span>Neu beitreten</button><button class="btn text" type="button" id="bk"><span class="ms" aria-hidden="true">arrow_back</span>Menü</button></div></div>`;
      // Lag der Fokus im Spiel, springt er auf die Meldung; sonst bleibt er, wo er ist
      if(warDrin)springen=true;gesprungen();
      $('#rj',app).addEventListener('click',()=>{springen=true;player(mode,L)});$('#bk',app).addEventListener('click',zumMenu);
    }
    function keineVerbindung(code){
      const grund=liveFehler(),warDrin=app.contains(document.activeElement);
      app.innerHTML=`<div class="row"><button class="btn small" type="button" id="bk"><span class="ms" aria-hidden="true">arrow_back</span>Menü</button></div>
      <div class="panel stack" style="max-width:560px"><h3 class="title-l">Keine Verbindung zum Klassenraum</h3>
      <div class="fb bad" role="alert" id="kv">${grund==='config'?'Der Live-Modus ist nicht eingerichtet.':`Keine Verbindung zum Klassenraum (Code <b class="mono">${esc(code)}</b>). Prüfe das WLAN und ${grund==='laden'?'lade die Seite neu.':'versuch es noch einmal.'}`}</div>
      <p class="small muted">Ohne Klasse spielst du allein mit Stimmkarten weiter. Deine Lehrkraft sieht dich dann nicht im Raum.</p>
      <div class="cta">${grund==='config'?'':grund==='laden'?neuLadenHTML('join='+code,'btn primary'):'<button class="btn primary" type="button" id="kv-neu"><span class="ms" aria-hidden="true">refresh</span>Erneut versuchen</button>'}
        <button class="btn" type="button" id="kv-ohne"><span class="ms" aria-hidden="true">person</span>Ohne Klasse spielen</button></div></div>`;
      $('#bk',app).addEventListener('click',()=>{pendingJoin=null;zumMenu()});
      $('#kv-neu',app)?.addEventListener('click',()=>{springen=true;waiting('Verbinde mit dem Klassenraum …');
        connect().then(async L2=>{if(!document.body.contains(app))return;if(L2&&raum.verbindung())await raum.verbinden();player(mode,L2)})});
      $('#kv-ohne',app).addEventListener('click',()=>{ohneKlasse=true;pendingJoin=null;springen=true;player(mode,null)});
      if(warDrin)springen=true;gesprungen();
    }
    function joinScreen(err){
      app.innerHTML=`<div class="row"><button class="btn small" type="button" id="bk"><span class="ms" aria-hidden="true">arrow_back</span>Menü</button></div>
      <form class="panel stack" id="jf" style="max-width:520px" novalidate><h3 class="title-l">Klassenraum beitreten</h3>
      <p class="small muted">Gib den Code vom Beamer ein und wähle einen Spitznamen. Bitte nicht deinen vollen echten Namen.</p>
      <div class="ctrl"><label for="jc">Code</label><input id="jc" type="text" inputmode="text" maxlength="8" autocomplete="off" autocapitalize="characters" spellcheck="false" value="${esc(g.code||'')}" style="font-family:var(--mono);font-size:1.5rem;letter-spacing:.2em;text-transform:uppercase"></div>
      <div class="ctrl"><label for="jn">Spitzname</label><input id="jn" type="text" maxlength="20" autocomplete="off" value="${esc(g.nick||'')}"></div>
      <div class="fb bad" id="jerr" role="alert" ${err?'':'hidden'}>${esc(err||'')}</div>
      <div class="cta"><button class="btn primary" type="submit" id="jgo"><span class="ms" aria-hidden="true">login</span>Weiter zur Figurenwahl</button></div></form>`;
      $('#bk',app).addEventListener('click',zumMenu);
      const felder={code:'#jc',nick:'#jn'},jerr=$('#jerr',app);
      Object.values(felder).forEach(sel=>$(sel,app).addEventListener('input',e=>e.target.removeAttribute('aria-invalid')));
      $('#jf',app).addEventListener('submit',async e=>{e.preventDefault();
        const b=$('#jgo',app);b.disabled=true;fehlerWeg(app,jerr,felder);let room;
        try{room=await raum.beitreten($('#jc',app).value,$('#jn',app).value)}
        catch(err){b.disabled=false;fehlerZeigen(app,jerr,err,felder);return}
        const rs=raum.sitzung();
        g={code:rs.code,nick:rs.nick,joined:true,gameId:room.gameId};save(mode,g);springen=true;pickFig();
      });
      // Nach der Auswahl im Menü direkt ins Feld: mit Code aus dem QR-Link in den Spitznamen
      gesprungen(g.code?'#jn':'#jc');
    }
    function pickFig(err){
      app.innerHTML=`<div class="row"><button class="btn small" type="button" id="bk"><span class="ms" aria-hidden="true">arrow_back</span>Menü</button><h3 class="title-m">Wähle deine Figur</h3>${mode==='schueler'?'<span class="small muted">Nimm die Figur, die deine Lehrkraft dir zuteilt.</span>':''}</div>
      ${err?`<div class="fb bad" role="alert">${esc(err)}</div>`:''}
      <div class="figs">${FIG.map(f=>`<button class="fig" type="button" data-f="${f.id}"><div class="fighead">${avatarHTML(f,true)}<div><div class="nm">${esc(f.n)}, ${f.a}</div><div class="sm">${esc(f.ort)}</div></div></div><div class="small">${esc(f.job)}</div>${spiel.figurInfo(f)}</button>`).join('')}</div>`;
      $('#bk',app).addEventListener('click',zumMenu);
      gesprungen();
      $$('[data-f]',app).forEach(b=>b.addEventListener('click',async()=>{
        const keep={code:g.code,nick:g.nick,joined:g.joined,gameId:g.gameId||null};
        const fig=b.dataset.f;
        if(live){
          $$('[data-f]',app).forEach(x=>x.disabled=true);
          try{
            const f=FIG.find(x=>x.id===fig);
            const base={nick:keep.nick,fig,r:0,ph:'event',votes:{},checks:{},choices:{},stats:spiel.werte(f,{r:0,ph:'event',decs:[],ch:[],chx:[]})};
            // Fehlt der eigene Eintrag (z. B. entfernt), neu anlegen: nur joinRoom setzt das Ablaufdatum, das die Regeln verlangen
            if(keep.joined)await live.updatePlayer(keep.code,base).catch(()=>live.joinRoom(keep.code,base));else await live.joinRoom(keep.code,base);
          }catch(e){console.warn(e);return pickFig('Beitreten hat nicht geklappt. Ist der Raum noch offen? Frag deine Lehrkraft.')}
          keep.joined=true;
        }
        g=Object.assign(keep,{fig,decs:[],ch:[],chx:[],ck:[],votes:[],r:0,ph:'event'});save(mode,g);lastSent='';springen=true;player(mode,L);
      }));
    }
    function hud(f){
      return `<div class="hud">${avatarHTML(f)}<div><div class="nm"><b>${esc(f.n)}, ${f.a}</b></div><div class="small muted">${esc(f.ort)}</div></div>
        <div><div class="k">Runde</div><div class="v">${Math.min(N,g.r+1)}/${N}</div></div>
        ${spiel.hudWerte(f,g)}
        ${mode==='schueler'?(live?`<div class="small"><span class="live-dot ${liveOn?'':'off'}"></span>${liveOn?`Live in Raum <b class="mono">${esc(g.code)}</b> als ${esc(g.nick)}`:'Verbinde …'}</div>`:`<div class="small"><span class="live-dot off"></span>Ohne Live-Verbindung</div>`):''}
        <span style="flex:1"></span>${live?'<button class="btn text small" type="button" id="leave"><span class="ms" aria-hidden="true">logout</span>Raum verlassen</button>':''}<button class="btn small" type="button" id="bk"><span class="ms" aria-hidden="true">arrow_back</span>Menü</button></div>
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
        <div class="cta"><button class="btn primary" type="button" id="go">Zur Abstimmung<span class="ms trail" aria-hidden="true">arrow_forward</span></button></div>`;
      }else if(g.ph==='vote'){
        h+=`${head(R,esc(R.q))}
        <p class="small muted">${mode==='solo'?'Du entscheidest. Deine Wahl wird zum Beschluss.':'Stimme aus Sicht deiner Figur ab.'}</p>
        <div class="opts">${R.opts.map(o=>`<button class="opt" type="button" data-o="${o.k}" style="--oc:${OPTC[o.k]}"><span class="lt"><span class="letter">${o.k}</span><b>${esc(o.t)}</b></span><span class="small">${esc(o.d)}</span>${spiel.optionWirkung(f,g,o)}</button>`).join('')}</div>`;
      }else if(g.ph==='card'){
        const o=R.opts.find(x=>x.k===g.vote);
        h+=`<div class="stimmkarte" data-fokus style="--oc:${OPTC[g.vote]}"><b>${g.vote}</b><span>${esc(o.t)}</span><span class="small">${esc(f.n)} stimmt dafür</span></div>
        <p class="small muted">${liveOn?'Deine Stimme ist beim Beamer angekommen.':'Halte die Karte hoch, damit deine Lehrkraft zählen kann.'}</p>
        <div class="cta"><button class="btn" type="button" id="schere"><span class="ms" aria-hidden="true">undo</span>Schere – Stimme ändern</button><button class="btn primary" type="button" id="go">Weiter: Beschluss abwarten<span class="ms trail" aria-hidden="true">arrow_forward</span></button></div>`;
      }else if(g.ph==='wait'){
        h+=`<div class="panel stack"><h3>Welchen Beschluss hat die Klasse gefasst?</h3>
        <p class="small muted">${liveOn?'Sobald deine Lehrkraft den Beschluss verkündet, geht es automatisch weiter.':'Deine Lehrkraft verkündet den Beschluss. Tippe den Buchstaben an:'}</p>
        ${liveOn?'<div class="row"><span class="ms" aria-hidden="true">hourglass_top</span><span>Warte auf den Beschluss …</span></div>':`<div class="choice">${R.opts.map(o=>`<button type="button" data-d="${o.k}" style="font-weight:700">${o.k} – ${esc(o.t)}</button>`).join('')}</div>
        <details><summary class="small">Runde verpasst? Klassencode eingeben</summary><div class="row" style="margin-top:6px"><input id="kc" type="text" maxlength="${N}" placeholder="z. B. BAC" aria-label="Klassencode" style="width:8em;text-transform:uppercase"><button class="btn small" type="button" id="kcgo">Übernehmen</button></div></details>`}</div>`;
      }else if(g.ph==='result'){
        const o=R.opts.find(x=>x.k===g.decs[g.r]);
        h+=`<div class="row"><span class="yr">${R.y}</span><span class="letter" style="--oc:${OPTC[o.k]}">${o.k}</span><h3>Beschluss: ${esc(o.t)}</h3></div>
        ${spiel.ergebnis(f,g)}
        <div class="cta"><button class="btn primary" type="button" id="go">Weiter: Fachbegriff-Check<span class="ms trail" aria-hidden="true">arrow_forward</span></button></div>`;
      }else if(g.ph==='check'){
        const o=R.opts.find(x=>x.k===g.decs[g.r]);const C=spiel.check(g.r,o);const ops=C.optionen;const a=(g.ck||[])[g.r];
        h+=`${head(R,'Fachbegriff-Check')}<div class="panel stack">
        <p><b>${esc(C.frage)}</b></p>
        <div class="choice" style="flex-direction:column">${ops.map((x,i)=>`<button type="button" data-k="${i}" style="text-align:left" class="${a!=null?(x.ok?'right':(a===i?'wrong':'')):''}">${esc(x.txt)}</button>`).join('')}</div>
        ${a!=null?`<div class="fb ${ops[a].ok?'ok':'amb'}"><b>${ops[a].ok?'Richtig!':'Nicht ganz.'}</b> ${esc(C.warum)}</div><div class="cta"><button class="btn primary" type="button" id="go">Weiter: private Entscheidung<span class="ms trail" aria-hidden="true">arrow_forward</span></button></div>`:''}</div>`;
      }else if(g.ph==='choice'){
        const C=R.choice;const picked=g.ch[g.r];const fb=picked!=null?privat.rueckmeldung(C.opts[picked],g.chx[g.r]):null;
        h+=`${head(R,'Deine private Entscheidung')}<div class="panel stack"><p><b>${esc(C.q)}</b></p>
        <div class="opts">${C.opts.map((o,i)=>`<button class="opt" type="button" data-c="${i}" style="--oc:var(--accent)" aria-pressed="${picked===i}"><b>${esc(o.t)}</b>${picked!=null?`<span class="small muted">${esc(o.l)}</span>`:''}</button>`).join('')}</div>
        ${fb?`<div class="fb ${fb.cls}">${fb.html}</div>
        <div class="cta"><button class="btn primary" type="button" id="go">${nextLabel(g.r)}</button></div>`:''}</div>`;
      }else if(g.ph==='end'){
        h+=`${spiel.bilanz(f,g,!!live)}
        ${live?'':`<div class="cta"><button class="btn" type="button" id="again"><span class="ms" aria-hidden="true">refresh</span>Noch einmal mit anderen Beschlüssen</button><button class="btn" type="button" id="newfig">Andere Figur wählen</button></div>`}`;
      }
      // Live-Aktualisierungen ohne Änderung lassen die Seite stehen; sonst bleibt der Fokus auf demselben Knopf
      if(!neuZeichnen(app,h,KOPF))return gesprungen();
      bindPhoto(app);
      $('#bk',app)?.addEventListener('click',()=>{cleanup();zumMenu()});
      if($('#leave',app)){
        $('#leave',app).addEventListener('click',()=>{$('#leave-q',app).hidden=false});
        $('#leave-n',app).addEventListener('click',()=>{$('#leave-q',app).hidden=true});
        $('#leave-y',app).addEventListener('click',async()=>{const c=g.code;cleanup();g={};save(mode,g);if(raum.sitzung())await raum.verlassen();else try{await live.kick(c,live.uid)}catch(e){}menu()});
      }
      const go=$('#go',app);
      if(g.ph==='event')go.addEventListener('click',()=>{g.ph='vote';persist();render();top()});
      if(g.ph==='vote')$$('[data-o]',app).forEach(b=>b.addEventListener('click',()=>{
        g.vote=b.dataset.o;g.votes=g.votes||[];g.votes[g.r]=g.vote;
        if(mode==='solo'){g.decs[g.r]=g.vote;g.ph='result'}else g.ph='card';
        persist();render();top()}));
      if(g.ph==='card'){$('#schere',app).addEventListener('click',()=>{g.ph='vote';persist();render();fokus()});go.addEventListener('click',()=>{g.ph=g.decs.length>g.r?'result':'wait';persist();render();top()})}
      if(g.ph==='wait'&&!liveOn){
        $$('[data-d]',app).forEach(b=>b.addEventListener('click',()=>{g.decs[g.r]=b.dataset.d;g.decs=g.decs.slice(0,g.r+1);g.ph='result';persist();render();top()}));
        $('#kcgo',app).addEventListener('click',()=>{const c=($('#kc',app).value||'').toUpperCase().split('').filter(x=>KEYS.includes(x)).slice(0,N).join('');if(!c)return;g.decs=c.split('');g.r=Math.min(c.length-1,N-1);g.ph='result';g.ch=g.ch.slice(0,g.r);g.chx=g.chx.slice(0,g.r);persist();render();top()});
      }
      if(g.ph==='result')go.addEventListener('click',()=>{g.ph='check';persist();render();top()});
      if(g.ph==='check'){
        $$('[data-k]',app).forEach(b=>b.addEventListener('click',()=>{g.ck=g.ck||[];if(g.ck[g.r]!=null)return;g.ck[g.r]=+b.dataset.k;persist();render();fokus('.fb:not([hidden])')}));
        go?.addEventListener('click',()=>{g.ph='choice';persist();render();top()});
      }
      if(g.ph==='choice'){
        $$('[data-c]',app).forEach(b=>b.addEventListener('click',()=>{if(g.ch[g.r]!=null)return;const i=+b.dataset.c;g.ch[g.r]=i;g.chx[g.r]=privat.wurf(R.choice.opts[i]);persist();render();fokus('.fb:not([hidden])')}));
        go?.addEventListener('click',()=>{g.r++;g.vote=null;g.ph=g.r>=N?'end':'event';persist();render();top()});
      }
      if(g.ph==='end'&&!live){
        $('#again',app).addEventListener('click',()=>{g.decs=[];g.ch=[];g.chx=[];g.ck=[];g.votes=[];g.r=0;g.ph='event';persist();render();top()});
        $('#newfig',app).addEventListener('click',()=>{g={gameId:g.gameId};persist();springen=true;player(mode,L)});
      }
      gesprungen();
    }
    render();pushMe();
  }

  /* ----- Lehrkraft (Beamer) mit Live-Dashboard ----- */
  function teacherStart(L){
    cleanup();
    const live=L||null;
    const newT=()=>({gameId:Math.random().toString(36).slice(2,8),r:0,ph:'lobby',decs:[],tally:{A:0,B:0,C:0},show:false,code:(t&&t.code)||null});
    let t=null;t=load('lk');
    if(!t||!t.gameId)t=newT();
    const rs0=raum.sitzung();t.code=rs0&&rs0.rolle==='lk'?rs0.code:null;
    const persist=()=>save('lk',t);persist();
    const anon=()=>raum.beamer();
    let players=[],roomOk=false,roomErr='',roomNetz=false,closeErr='',busy=false,playersUnsub=null,confirmClose=false,confirmReset=false;
    const pushState=()=>{if(live&&t.code&&roomOk)live.updateRoom(t.code,{round:t.r,phase:t.ph,decisions:t.decs.slice(),gameId:t.gameId}).catch(e=>console.warn('Raum-Update',e))};
    // Nur einen sicher fehlenden, geschlossenen oder fremden Raum verwerfen; bei Verbindungsproblemen bleibt der Code
    async function attach(){
      if(!live||!t.code){render();return}
      const st=await live.raumStatus(t.code);
      if(!document.body.contains(app))return;
      if(st.fehler){roomOk=false;roomNetz=true;render();return}
      roomNetz=false;
      const r=st.raum;
      if(!r||r.owner!==live.uid||r.phase==='closed'){t.code=null;roomOk=false;persist();render();return}
      roomOk=true;beobachte();pushState();render();
    }
    function beobachte(){
      if(playersUnsub)playersUnsub();
      playersUnsub=live.watchPlayers(t.code,ps=>{players=ps.filter(p=>p.fig).sort((a,b)=>((a.joinedAt&&a.joinedAt.seconds)||0)-((b.joinedAt&&b.joinedAt.seconds)||0));render()});
      unsub.push(()=>playersUnsub&&playersUnsub());
    }
    async function neuVerbinden(){busy=true;render();const L2=await connect();if(!document.body.contains(app))return;
      if(L2&&raum.verbindung())await raum.verbinden();springen=true;teacherStart(L2)}
    async function createRoom(){busy=true;roomErr='';render();
      try{t.code=await raum.oeffnen();persist();await attach()}
      catch(e){console.warn(e);roomErr=e&&e.message&&!e.html?e.message:'Der Klassenraum konnte nicht erstellt werden. Prüfe das WLAN und versuch es noch einmal.'}
      busy=false;render()}
    // Erst nach dem Löschen ist der Raum weg; scheitert es, bleibt alles stehen und „Raum löschen“ geht noch einmal
    async function closeRoom(){busy=true;closeErr='';render();
      if(playersUnsub){playersUnsub();playersUnsub=null}
      try{await raum.beenden()}
      catch(e){console.warn(e);busy=false;closeErr='Der Raum konnte nicht vollständig gelöscht werden. Prüfe das WLAN und tippe noch einmal auf „Raum löschen“.';beobachte();render();return}
      t.code=null;roomOk=false;players=[];busy=false;confirmClose=false;persist();render()}
    const liveVotes=()=>{const c={A:0,B:0,C:0};players.forEach(p=>{const v=p.votes&&p.votes[t.r];if(c[v]!=null)c[v]++});return c};
    const label=p=>{if(!anon())return esc(p.nick||'?');const same=players.filter(q=>q.fig===p.fig);return `${esc(FIG.find(f=>f.id===p.fig)?.n||'?')} ${same.indexOf(p)+1}`};
    const figOf=p=>FIG.find(f=>f.id===p.fig)||FIG[0];
    const stepOf=p=>{const order=['event','vote','card','wait','result','check','choice'];return (p.r||0)*10+Math.max(0,order.indexOf(p.ph))+(p.ph==='end'?100:0)};
    // Keine Verbindung (nicht: nicht eingerichtet): Hinweis mit „Erneut verbinden“ oder, wenn nur das hilft, „Seite neu laden“
    function netzHTML(){
      const grund=liveFehler();
      if(!(!live&&grund!=='config')&&!roomNetz)return '';
      return `<div class="fb bad stack" id="netz"><p><b>Keine Verbindung zum Live-Klassenraum${t.code?` <span class="mono">${esc(t.code)}</span>`:''}.</b> Prüfe das WLAN und ${!live&&grund==='laden'?'lade die Seite neu':'versuch es noch einmal'}.${t.code?' Der Raum bleibt bestehen.':''} Bis dahin läuft das Planspiel mit Stimmkarten.</p>
        <div class="row">${!live&&grund==='laden'?neuLadenHTML(''):`<button class="btn small" type="button" id="neu-verbinden" ${busy?'disabled':''}><span class="ms" aria-hidden="true">refresh</span>${t.code?'Erneut verbinden':'Erneut versuchen'}</button>`}</div></div>`;
    }
    function lobbyLiveHTML(){
      if(!live&&liveFehler()==='config')return `<div class="fb neu"><b>Live-Modus nicht eingerichtet.</b> Das Planspiel läuft mit Stimmkarten. Wie du den Live-Klassenraum einschaltest, steht in der README im GitHub-Projekt.</div>`;
      const netz=netzHTML();if(netz)return netz;
      if(!t.code||!roomOk)return `<div class="panel stack"><h3 class="title-l">Live-Klassenraum</h3><p>Erstelle einen Raum. Die Schüler treten mit Code oder QR-Code bei – ohne Konto.</p>${roomErr?`<div class="fb bad">${esc(roomErr)}</div>`:''}<div class="cta"><button class="btn primary" type="button" id="mkroom" ${busy?'disabled':''}><span class="ms" aria-hidden="true">add</span>Live-Klassenraum erstellen</button></div></div>`;
      const url=joinURL(t.code);const cnt={};players.forEach(p=>cnt[p.fig]=(cnt[p.fig]||0)+1);
      return `<div class="grid2 wide-left"><div class="panel stack"><p class="eyebrow">Raumcode</p><div class="code" style="font-size:clamp(2.5rem,7vw,4.5rem);letter-spacing:.15em;line-height:1.15;margin-top:4px;display:block">${esc(t.code)}</div>
        <p class="small">${beitrittsWeg('join')}</p><p class="small muted mono" style="word-break:break-all">${esc(url)}</p>
        <div><p class="title-s" style="margin-bottom:8px">Figuren in der Klasse</p>${FIG.map(f=>`<div class="row" style="gap:10px;margin-bottom:4px">${avatarHTML(f)}<span style="width:5.5em">${esc(f.n)}</span><div class="bar" style="flex:1"><i style="width:${Math.min(100,(cnt[f.id]||0)*25)}%"></i></div><b class="num" style="width:2ch;text-align:right">${cnt[f.id]||0}</b></div>`).join('')}</div></div>
        <div class="panel stack" style="align-items:center"><div style="width:min(100%,300px);background:#fff;border-radius:16px;padding:8px">${qrSVG(url)}</div><p class="small muted">QR-Code zum Beitreten</p></div></div>`;
    }
    function playersHTML(){
      if(!players.length)return '<p class="small muted">Noch niemand im Raum.</p>';
      return `<div class="row" style="gap:8px">${players.map(p=>`<span class="pill neu" style="padding:4px 6px 4px 4px;gap:6px"><span class="avatar" style="width:24px;height:24px;border-radius:8px">${spiel.portrait(figOf(p))}</span>${label(p)}${!anon()?`<button class="icon-btn" type="button" data-kick="${esc(p.uid)}" aria-label="${esc(p.nick)} entfernen" title="Entfernen" style="width:24px;height:24px"><span class="ms sm" aria-hidden="true">close</span></button>`:''}</span>`).join('')}</div>`;
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
        ${missing.length?`<p class="small muted" style="margin-top:8px">Noch nicht abgestimmt: ${anon()?missing.length+' Personen':missing.map(label).join(', ')}</p>`:''}
        <details style="margin-top:8px"><summary class="small">Wer hat wie abgestimmt?</summary><div class="tbl-wrap"><table><tbody>${FIG.map(f=>{const ps=players.filter(p=>p.fig===f.id);if(!ps.length)return '';const cc={A:0,B:0,C:0};ps.forEach(p=>{const v=p.votes&&p.votes[t.r];if(cc[v]!=null)cc[v]++});return `<tr><td>${esc(f.n)}</td>${KEYS.map(k=>`<td class="r num">${k}: ${cc[k]}</td>`).join('')}</tr>`}).join('')}</tbody></table></div></details>`}
      else if(t.ph==='result'){const ans=players.filter(p=>p.checks&&p.checks[t.r]!=null),ok=ans.filter(p=>p.checks[t.r]).length;
        const C=ROUNDS[t.r].choice,ch=C.opts.map(()=>0);players.forEach(p=>{const v=p.choices&&p.choices[t.r];if(v!=null&&ch[v]!=null)ch[v]++});const chn=ch.reduce((a,b)=>a+b,0);
        body=`<div class="grid2"><div class="stack"><p class="title-s">Fachbegriff-Check</p><p>${ans.length?`<b>${Math.round(ok/ans.length*100)} %</b> richtig (${ok} von ${ans.length} Antworten)`:'Noch keine Antworten.'}</p><div class="bar"><i style="width:${ans.length?ok/ans.length*100:0}%;background:var(--ok)"></i></div></div>
          <div class="stack"><p class="title-s">Private Entscheidung</p><p class="small muted">${esc(C.q)}</p>${C.opts.map((o,i)=>`<div><div class="small">${esc(o.t)}</div><div class="row" style="gap:8px"><div class="bar" style="flex:1"><i style="width:${chn?ch[i]/chn*100:0}%"></i></div><b class="num">${ch[i]}</b></div></div>`).join('')}</div></div>`}
      else if(t.ph==='end'){
        body=`<div class="tbl-wrap"><table><thead><tr><th>${anon()?'Figur':'Spitzname'}</th><th>Figur</th>${LK.dashKopf}<th class="r">Check richtig</th></tr></thead><tbody>${players.map(p=>{const f=figOf(p);const cks=Object.values(p.checks||{});return `<tr><td>${label(p)}</td><td>${esc(f.n)}</td>${LK.dashZeile(p,f)}<td class="r num">${cks.filter(Boolean).length}/${cks.length}</td></tr>`}).join('')}</tbody></table></div>
        ${LK.dashHinweis||''}`}
      return `<section class="panel stack" style="background:var(--md-surface-container)">${head}${body}</section>`;
    }
    function render(){
      if(!document.body.contains(app))return;
      const R=ROUNDS[Math.min(t.r,N-1)];
      const liveOk=!!(live&&t.code&&roomOk);
      let h=`<div class="hud"><b>Klassenspiel · Lehrkraft</b><div><div class="k">Runde</div><div class="v">${Math.min(N,t.r+1)}/${N}</div></div>
        ${liveOk?`<div><div class="k">Raumcode</div><div class="v mono">${esc(t.code)}</div></div><div class="small"><span class="live-dot"></span>${players.length} live verbunden</div>`:`<div><div class="k">Klassencode</div><div class="v mono">${t.decs.join('')||'–'}</div></div><div class="small"><span class="live-dot off"></span>Ohne Live-Verbindung</div>`}
        <span style="flex:1"></span>${liveOk?`<button class="btn small" type="button" id="anon" aria-pressed="${anon()}">Beamer-Modus</button><button class="btn text small" type="button" id="close"><span class="ms" aria-hidden="true">delete</span>Raum beenden</button>`:''}<button class="btn small" type="button" id="bk"><span class="ms" aria-hidden="true">arrow_back</span>Menü</button><button class="btn small" type="button" id="reset"><span class="ms" aria-hidden="true">restart_alt</span>Neues Spiel</button></div>
        <div id="reset-q" class="fb amb"${confirmReset?'':' hidden'}>Spiel neu starten? Der Raum bleibt offen, alle Spielstände beginnen von vorn. <button class="btn small primary" type="button" id="reset-y">Ja, neu starten</button> <button class="btn small text" type="button" id="reset-n">Abbrechen</button></div>
        ${confirmClose?`<div class="fb bad">Raum ${esc(t.code)} beenden? Alle Daten der Schüler werden sofort gelöscht. <button class="btn small primary" type="button" id="close-y" ${busy?'disabled':''}>Raum löschen</button> <button class="btn small text" type="button" id="close-n">Abbrechen</button>${closeErr?`<p class="small" role="alert">${esc(closeErr)}</p>`:''}</div>`:''}
        ${t.ph!=='lobby'&&t.code?netzHTML():''}`;
      if(t.ph==='lobby'){
        h+=`${lobbyLiveHTML()}${dashHTML()}<div class="panel stack"><h3>So läuft eine Runde</h3><ol style="margin:0;padding-left:1.2em"><li>Ereignis am Beamer zeigen, die Schüler lesen auf dem Handy, was es für ihre Figur bedeutet.</li><li>Debatte aus Sicht der Figuren.</li><li>Abstimmung ${liveOk?'auf den Handys – die Stimmen erscheinen hier live':'per Stimmkarte'}, dann Beschluss verkünden.</li></ol>
        <div class="cta"><button class="btn primary" type="button" id="go">Runde 1 starten<span class="ms trail" aria-hidden="true">arrow_forward</span></button></div></div>`;
      }else if(t.ph==='event'){
        h+=`${eventHead(R,'1.5rem')}
        ${LK.ereignis(t)}
        ${dashHTML()}
        <div class="cta"><button class="btn primary" type="button" id="go">Abstimmung starten<span class="ms trail" aria-hidden="true">arrow_forward</span></button></div>`;
      }else if(t.ph==='vote'){
        const lv=liveOk?liveVotes():{A:0,B:0,C:0};
        const tot={A:t.tally.A+lv.A,B:t.tally.B+lv.B,C:t.tally.C+lv.C};
        const details=LK.abstimmungDetails?LK.abstimmungDetails(t):'';
        const mx=Math.max(tot.A,tot.B,tot.C),win=KEYS.filter(k=>tot[k]===mx&&mx>0);
        h+=`${head(R,esc(R.q),'1.3rem')}
        <div class="opts">${R.opts.map(o=>`<div class="opt" style="--oc:${OPTC[o.k]};cursor:default"><span class="lt"><span class="letter">${o.k}</span><b>${esc(o.t)}</b></span><span class="small">${esc(o.d)}</span><span>${LK.optionInfo?LK.optionInfo(o):''}</span>
          <div class="tally"><button class="icon-btn" type="button" data-dn="${o.k}" aria-label="Stimme weniger für ${o.k}"><span class="ms" aria-hidden="true">remove</span></button><span class="cnt">${tot[o.k]}</span><button class="icon-btn" type="button" data-up="${o.k}" aria-label="Stimme mehr für ${o.k}" style="background:var(--md-secondary-container);color:var(--md-on-secondary-container)"><span class="ms" aria-hidden="true">add</span></button>${liveOk?`<span class="small muted">davon live: ${lv[o.k]}</span>`:''}</div></div>`).join('')}</div>
        ${dashHTML()}
        ${details?`<details class="panel" ${t.show?'open':''} id="who"><summary><b>Wer gewinnt, wer verliert?</b> <span class="small muted">(erst nach der Debatte aufklappen)</span></summary>${details}</details>`:''}
        <div class="cta" id="dec">${!mx?'<span class="small muted">Noch keine Stimmen.</span>':win.length===1?`<button class="btn primary" type="button" data-win="${win[0]}">Beschluss verkünden: ${win[0]}<span class="ms trail" aria-hidden="true">arrow_forward</span></button>`:`<span class="small">Gleichstand – du entscheidest:</span>${win.map(k=>`<button class="btn primary" type="button" data-win="${k}">${k}</button>`).join('')}`}</div>`;
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
      // Jede Teilnehmeränderung ruft render() auf: nur neu zeichnen, wenn sich etwas geändert hat, Fokus und offene Details bleiben
      if(!neuZeichnen(app,h,KOPF))return gesprungen();
      bindPhoto(app);
      $('#bk',app).addEventListener('click',()=>{cleanup();zumMenu()});
      $('#reset',app).addEventListener('click',()=>{confirmReset=true;render()});
      $('#reset-n',app).addEventListener('click',()=>{confirmReset=false;render();$('#reset',app).focus()});
      $('#reset-y',app).addEventListener('click',()=>{t=newT();confirmReset=false;persist();pushState();render();top()});
      $('#mkroom',app)?.addEventListener('click',createRoom);
      $('#anon',app)?.addEventListener('click',()=>raum.setBeamer(!anon()));
      $('#close',app)?.addEventListener('click',()=>{confirmClose=true;render()});
      $('#close-n',app)?.addEventListener('click',()=>{confirmClose=false;closeErr='';render();$('#close',app)?.focus()});
      $('#neu-verbinden',app)?.addEventListener('click',neuVerbinden);
      $('#close-y',app)?.addEventListener('click',closeRoom);
      $$('[data-kick]',app).forEach(b=>b.addEventListener('click',()=>live.kick(t.code,b.dataset.kick).catch(e=>console.warn(e))));
      const go=$('#go',app);
      if(t.ph==='lobby')go.addEventListener('click',()=>{t.ph='event';persist();pushState();render();top()});
      if(t.ph==='event')go.addEventListener('click',()=>{t.ph='vote';t.tally={A:0,B:0,C:0};t.show=false;persist();pushState();render();top()});
      if(t.ph==='vote'){
        $$('[data-up]',app).forEach(b=>b.addEventListener('click',()=>{t.tally[b.dataset.up]++;persist();render()}));
        $$('[data-dn]',app).forEach(b=>b.addEventListener('click',()=>{const k=b.dataset.dn;t.tally[k]=Math.max(0,t.tally[k]-1);persist();render()}));
        $('#who',app)?.addEventListener('toggle',e=>{t.show=e.target.open;persist()});
        $$('[data-win]',app).forEach(b=>b.addEventListener('click',()=>{t.decs[t.r]=b.dataset.win;t.decs=t.decs.slice(0,t.r+1);t.ph='result';persist();pushState();render();top()}));
      }
      if(t.ph==='result')go.addEventListener('click',()=>{t.r++;t.ph=t.r>=N?'end':'event';persist();pushState();render();top()});
      gesprungen();
    }
    // Lernraum im Dashboard geöffnet oder beendet, Beamer-Modus umgeschaltet
    unsub.push(raum.on(art=>{
      if(!document.body.contains(app))return;
      const rs=raum.sitzung();
      if(art==='beamer')return render();
      if((!rs||rs.rolle!=='lk')&&t.code){if(playersUnsub){playersUnsub();playersUnsub=null}t.code=null;roomOk=false;players=[];persist();render()}
      else if(rs&&rs.rolle==='lk'&&rs.code!==t.code){t.code=rs.code;persist();attach()}
    }));
    attach();
  }

  menu();
  // Beitritt per QR-Link: wie im Lernraum gleich mit dem Cursor im Feld Spitzname
  if(pendingJoin){springen=true;waiting('Verbinde mit dem Klassenraum …');connect().then(L=>{if(document.body.contains(app))player('schueler',L)})}
}
