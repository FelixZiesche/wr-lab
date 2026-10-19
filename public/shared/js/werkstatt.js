// Gerüst einer Lernwerkstatt nach Material Design 3: Navigation (Rail ab 600 px, Bar darunter),
// Bereiche, Werkstatt-Karten, Detailansicht, Erkenntnisse („Mein Wissen“), Glossar, Schriftgröße
// und der Lernraum (lernraum.js) mit Lehrerpanel. Aufgaben-Bausteine (aufgaben.js) werden automatisch gebunden.
// Jedes Thema ruft createWerkstatt() mit seinen Inhalten auf, siehe sechseck/sechseck.js.
import { $, $$, esc, store, zeigeHinweis, suchtext } from './ui.js';
import { raum, AUFGABEN, imTool, normCode, sperreHintergrund } from './lernraum.js';
import { bindAufgaben } from './aufgaben.js';

/**
 * cfg = {
 *   thema:       Ordnername des Themas, z. B. 'sechseck' (wird im Lernraum gespeichert)
 *   speicher:    Präfix für den localStorage, z. B. 'ms6'
 *   logo:        SVG für die Navigation Rail (führt zurück zur WR-Lab-Startseite)
 *   start:       Adresse der WR-Lab-Startseite (Standard: '../')
 *   bereiche:    [{id, icon, label, title, kurz, desc, ch:[Kapitel], tool:'id' (Werkstatt direkt im Bereich), render: () => HTML}]
 *                kurz: Titel auf dem Handy (Standard: label)
 *   kapitel:     {1: ['Kapitel 1 – …', 'Untertitel'], …}
 *   merksaetze:  {werkstattId: ['Merksatz', …]}
 *   wissenTitel: 'Mein Sechseck-Wissen'
 *   glossar:     [['Begriff', 'Erklärung'], …]
 *   punkte:      tool => HTML der Farbpunkte auf einer Werkstatt-Karte
 *   beimZeigen:  (bereichId, element) => Ereignisse für themenspezifische Inhalte binden
 *   hash:        hash => Bereich, falls das Thema eigene Sprungadressen hat (z. B. #join=CODE)
 * }
 * Werkstätten: tool({id, ch, title, sub, goals, hinweise:[…], html(), init(root)}); hinweise erscheinen nur im Lehrerpanel.
 * Überall auf der Seite öffnet ein Knopf mit data-gehzu="id" die Werkstatt oder den Bereich id.
 * Elemente mit data-nur-lk (z. B. „Alle aufdecken“) sieht nur die Lehrkraft im offenen Lernraum, auch im Beamer-Modus.
 * Am besten gleich mit hidden schreiben: <button class="btn small" type="button" id="…" data-nur-lk hidden>…</button>
 */
export function createWerkstatt(cfg){
  const P=cfg.speicher, DEST=cfg.bereiche, CH=cfg.kapitel, MS=cfg.merksaetze, GLOSS=cfg.glossar||[];
  const TOOLS=[];
  const MS_ALL=Object.entries(MS).flatMap(([t,a])=>a.map((s,i)=>({id:t+'-'+i,tool:t,text:s})));
  let msGot=new Set(store(P+'-wissen')||[]);
  let curView='start', offenesTool=null, zeigtSperre=false;

  document.body.insertAdjacentHTML('afterbegin',`<div class="app">
  <nav class="rail" aria-label="Bereiche">
    <a class="rail-logo" href="${cfg.start||'../'}" aria-label="Alle Themen im WR-Lab" title="Alle Themen im WR-Lab">${cfg.logo}</a>
    <div class="nav-items" id="rail-items"></div>
  </nav>
  <div class="pane">
    <header class="topbar" id="topbar">
      <a class="icon-btn home-link" href="${cfg.start||'../'}" aria-label="Alle Themen im WR-Lab" title="Alle Themen im WR-Lab"><span class="ms" aria-hidden="true">apps</span></a>
      <h1 id="view-title" data-kurz="${esc(DEST[0].kurz||DEST[0].label)}">${esc(DEST[0].title)}</h1>
      <button class="chip hide-compact" type="button" id="btn-wissen"><span class="ms sm" aria-hidden="true">lightbulb</span><span>Mein Wissen <span id="ms-count" class="num">0/0</span></span></button>
      <button class="icon-btn lr-btn" type="button" id="btn-raum" data-raum-btn aria-label="Lernraum" title="Lernraum"><span class="ms" aria-hidden="true">cast_for_education</span><span class="lr-dot" hidden></span></button>
      <button class="icon-btn" type="button" id="btn-glossar" aria-label="Begriffe nachschlagen" title="Begriffe nachschlagen"><span class="ms" aria-hidden="true">search</span></button>
      <button class="icon-btn" type="button" id="btn-fs" aria-pressed="false" aria-label="Größere Schrift" title="Größere Schrift"><span class="ms" aria-hidden="true">format_size</span></button>
    </header>
    <main id="view"></main>
  </div>
  <nav class="navbar" aria-label="Bereiche" id="nav-bar"></nav>
</div>

<div class="modal" id="modal" hidden>
  <div class="modal-card" role="region" aria-labelledby="modal-title">
    <div class="modal-head">
      <button class="icon-btn" id="modal-close" type="button" aria-label="Zurück"><span class="ms" aria-hidden="true">arrow_back</span></button>
      <h2 id="modal-title"></h2>
      <button class="icon-btn lr-btn" type="button" data-raum-btn aria-label="Lernraum" title="Lernraum"><span class="ms" aria-hidden="true">cast_for_education</span><span class="lr-dot" hidden></span></button>
    </div>
    <div class="modal-body" id="modal-body"></div>
  </div>
</div>
<div class="lr-pause" id="lr-pause" hidden role="alertdialog" aria-modal="true" aria-labelledby="lr-pause-t" tabindex="-1"><span class="ms" aria-hidden="true">co_present</span><p class="headline-s" id="lr-pause-t">Schau nach vorn</p><p class="body-l">Deine Lehrkraft hat alle Geräte kurz angehalten.</p></div>`);

  /* ---------- Erkenntnisse ---------- */
  function saveMs(){store(P+'-wissen',[...msGot]);updMs();if(!DEST.find(d=>d.id===curView)?.tool)renderView()}
  function updMs(){$('#ms-count').textContent=`${msGot.size}/${MS_ALL.length}`}
  function resetWissen(){msGot=new Set();Object.keys(MS).forEach(t=>{try{localStorage.removeItem(`${P}-erk-${t}`)}catch(e){}});saveMs()}

  /** Elemente mit data-nur-lk nur für die Lehrkraft zeigen (beim Öffnen und bei jeder Änderung im Lernraum) */
  const nurLk=(root=document)=>{const lk=raum.istLehrkraft();$$('[data-nur-lk]',root).forEach(el=>{el.hidden=!lk})};

  /* ---------- Modal ---------- */
  const modal=$('#modal'), mBody=$('#modal-body'), mTitle=$('#modal-title');
  let lastFocus=null, lastTool=null;
  // Solange das Fenster offen ist, ist .pane (Kopfleiste und Ansicht dahinter) inert: weder Tab noch Screenreader
  // gelangen dorthin. Rail und Navigation Bar liegen außerhalb und bleiben bedienbar, deshalb kein aria-modal.
  function openModal(title,html,init){
    // Wird ein Fenster im Fenster geöffnet (z. B. Lernraum), bleibt die Rücksprungstelle die ursprüngliche
    if(modal.hidden){lastFocus=document.activeElement;lastTool=lastFocus&&lastFocus.closest?lastFocus.closest('[data-tool]')?.dataset.tool||null:null}
    offenesTool=null;$('#modal-close').setAttribute('aria-label','Zurück');
    mTitle.innerHTML=title; mBody.innerHTML=html; $('.pane').inert=true; modal.hidden=false;
    document.body.style.overflow='hidden';
    modal.scrollTop=0;
    if(init) init(mBody);
    nurLk(mBody);
    // Den Fokus aus init (z. B. Suchfeld, Code-Feld) nicht überschreiben
    if(!mBody.contains(document.activeElement))$('#modal-close').focus();
  }
  function closeModal(silent){
    $('.pane').inert=false;modal.hidden=true;document.body.style.overflow='';mBody.innerHTML='';offenesTool=null;raum.sendeOrt(aktuellerOrt());try{history.replaceState(null,'','#'+curView)}catch(e){}
    if(silent)return;
    // Zurück zum auslösenden Knopf; wurde die Ansicht inzwischen neu gezeichnet, zur Karte derselben Werkstatt
    const z=lastFocus&&lastFocus!==document.body&&document.body.contains(lastFocus)?lastFocus:lastTool?$(`#view [data-tool="${CSS.escape(lastTool)}"]`):null;
    if(z)z.focus();
  }
  // Browserverlauf: Jede geöffnete Werkstatt ist ein eigener Schritt (history.state = {werkstatt, von}). „Zurück“ im Browser,
  // die Android-Zurück-Taste und das Zurückwischen schließen deshalb die Werkstatt statt das Thema zu verlassen.
  // Zurück-Knopf und Esc gehen denselben Weg (history.back()). Ohne eigenen Schritt (Werkstatt per Link oder eingetippter
  // Adresse geöffnet) schließen sie einfach, sonst verließe history.back() die Seite.
  const zurueck=()=>{if(history.state&&history.state.werkstatt)history.back();else closeModal()};
  modal.addEventListener('scroll',()=>modal.classList.toggle('scrolled',modal.scrollTop>4));
  $('#modal-close').addEventListener('click',zurueck);
  // Esc schließt das Werkstatt-Fenster, aber nicht während der Pause („Schau nach vorn“).
  // Das Abstimmungsfenster fängt Esc selbst ab (lernraum.js).
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!modal.hidden&&$('#lr-pause').hidden)zurueck()});

  // Erst selbst formulieren, dann vergleichen: Die eigene Erkenntnis (freiwillig) bleibt nur in diesem Browser
  // (Schlüssel <speicher>-erk-<werkstatt>) und geht nie an den Server. Nach dem Vergleich stehen beide nebeneinander.
  const erkKey=t=>`${P}-erk-${t}`;
  function erkHTML(tool){
    return `<div class="erk" data-erk="${tool}">
    <span class="erk-h"><span class="ms" aria-hidden="true">lightbulb</span>Erkenntnis</span>
    <div class="erk-vergleich">
      <div class="stack erk-eigen"><label class="small" for="erk-${tool}"><b>Deine Erkenntnis in einem Satz</b> (freiwillig, bleibt nur auf deinem Gerät)</label>
        <textarea id="erk-${tool}" rows="2" maxlength="400" data-erk-eigen></textarea></div>
      <div class="stack" data-erk-body hidden><p class="small"><b>Merksatz</b></p><ul>${MS[tool].map(s=>`<li>${esc(s)}</li>`).join('')}</ul>
      <p class="small">Gespeichert in „${esc(cfg.wissenTitel)}“. Passt dein Satz dazu? Ergänze, was fehlt.</p></div></div>
    <div class="row"><button class="btn small primary" type="button" data-erk-btn><span class="ms" aria-hidden="true">visibility</span>Mit dem Merksatz vergleichen</button></div></div>`;
  }
  function bindErk(root){
    $$('[data-erk]',root).forEach(box=>{
      const t=box.dataset.erk, btn=$('[data-erk-btn]',box), body=$('[data-erk-body]',box), ta=$('[data-erk-eigen]',box);
      const show=()=>{body.hidden=false;btn.closest('.row').hidden=true;box.classList.add('offen')};
      ta.value=store(erkKey(t))||'';
      let z=null;const sichern=()=>{clearTimeout(z);if(ta.value.trim())store(erkKey(t),ta.value);else try{localStorage.removeItem(erkKey(t))}catch(e){}};
      ta.addEventListener('input',()=>{clearTimeout(z);z=setTimeout(sichern,300)});ta.addEventListener('change',sichern);
      if(MS[t].every((_,i)=>msGot.has(t+'-'+i))) show();
      // Der Knopf verschwindet: Fokus auf die Merksätze, damit Tastatur und Screenreader dort weitermachen
      btn.addEventListener('click',()=>{sichern();MS[t].forEach((_,i)=>msGot.add(t+'-'+i));saveMs();show();body.tabIndex=-1;body.focus()});
    });
  }

  /* ---------- Glossar und Wissen ---------- */
  function openGlossar(){
    openModal('Begriffe nachschlagen',`<input type="search" id="gs" placeholder="Begriff suchen …" aria-label="Begriff suchen" style="width:100%;padding:9px 12px"><dl class="glossary panel" id="gl"></dl>`,root=>{
      // Suche ohne Rücksicht auf Groß- und Kleinschreibung, Leerzeichen, Bindestriche und Umlaute (suchtext in ui.js)
      const N=GLOSS.map(([t,d])=>[suchtext(t),suchtext(d)]);
      // Treffer im Begriff selbst stehen vor Treffern in der Erklärung
      const r=q=>{const s=suchtext(q),im=i=>N[i][0].includes(s)?0:N[i][1].includes(s)?1:2;
        $('#gl',root).innerHTML=GLOSS.map((g,i)=>[g,im(i)]).filter(x=>x[1]<2).sort((a,b)=>a[1]-b[1]).map(([[t,d]])=>`<dt>${t}</dt><dd>${d}</dd>`).join('')||'<p class="muted">Kein Treffer.</p>'};
      $('#gs',root).addEventListener('input',e=>r(e.target.value));r('');$('#gs',root).focus()});
  }
  function openWissen(){
    openModal(esc(cfg.wissenTitel),`<p class="task">Hier sammeln sich die Merksätze, sobald ihr in einer Werkstatt eure Erkenntnis mit dem Merksatz vergleicht. Zusammen ergeben sie euren Hefteintrag.</p><div class="panel" id="ws"></div><div class="row"><button class="btn small" id="ws-all" type="button" aria-pressed="false" data-nur-lk hidden>Alle anzeigen</button><button class="btn small" id="ws-copy" type="button">Gesammelte Merksätze kopieren</button><span class="small muted" id="ws-msg"></span></div>`,root=>{
      // „Alle anzeigen“ (nur Lehrkraft) zeigt alle Merksätze, ohne sie als entdeckt zu speichern
      let all=false;const alle=()=>all&&raum.istLehrkraft();
      const r=()=>{$('#ws',root).innerHTML=MS_ALL.map((m,i)=>{const got=msGot.has(m.id)||alle();const t=TOOLS.find(x=>x.id===m.tool);return `<div class="ms-item ${got?'':'locked'}"><span class="num" style="min-width:1.6em">${i+1}.</span><div>${got?esc(m.text):`noch nicht entdeckt – Werkstatt „${esc(t.title)}“`}</div></div>`}).join('')};
      const knopf=$('#ws-all',root),aus=()=>{all=false;knopf.setAttribute('aria-pressed','false');r()};
      r();knopf.addEventListener('click',()=>{all=!all;knopf.setAttribute('aria-pressed',String(all));r()});
      // Endet die Lehrkraft-Rolle bei offenem Fenster, wieder nur die entdeckten Merksätze zeigen
      const ab=raum.on(()=>{if(!root.contains(knopf))return ab();if(all&&!raum.istLehrkraft())aus()});
      $('#ws-copy',root).addEventListener('click',()=>{const txt=MS_ALL.filter(m=>msGot.has(m.id)||alle()).map((m,i)=>`${i+1}. ${m.text}`).join('\n');
        const done=()=>$('#ws-msg',root).textContent='Kopiert.';
        try{navigator.clipboard.writeText(txt).then(done,()=>fallback(txt))}catch(e){fallback(txt)}
        function fallback(t){const ta=document.createElement('textarea');ta.value=t;ta.style.width='100%';ta.rows=8;$('#ws',root).after(ta);ta.select();$('#ws-msg',root).textContent='Text markiert – mit Strg+C kopieren.'}});
    });
  }

  /* ---------- Navigation und Views ---------- */
  const destOfTool=id=>{const t=TOOLS.find(x=>x.id===id);return t?(DEST.find(d=>(d.ch||[1]).includes(t.ch))||DEST[0]).id:'start'};
  function navHTML(){return DEST.map(d=>`<button class="nav-item" type="button" data-dest="${d.id}" ${d.id===curView?'aria-current="page"':''}><span class="ind"><span class="ms" aria-hidden="true">${d.icon}</span></span><span>${d.label}</span></button>`).join('')}
  function renderNav(){['#rail-items','#nav-bar'].forEach(sel=>{const el=$(sel);el.innerHTML=navHTML();$$('[data-dest]',el).forEach(b=>b.addEventListener('click',()=>go(b.dataset.dest)))})}
  function cardHTML(x){const done=MS[x.id]&&MS[x.id].every((_,i)=>msGot.has(x.id+'-'+i)),zu=raum.gesperrt(x.id);
    return `<button class="card${zu?' gesperrt':''}" type="button" data-tool="${x.id}"${zu?' aria-disabled="true"':''}><span class="dots">${cfg.punkte(x)}</span><h3 class="title-m">${x.title}</h3><p>${x.sub}</p>${done?'<span class="done"><span class="ms sm" aria-hidden="true">check_circle</span>Erkenntnis gesichert</span>':''}${zu?'<span class="go"><span class="ms sm" aria-hidden="true">lock</span>Noch gesperrt</span>':'<span class="go">Werkstatt öffnen<span class="ms sm" aria-hidden="true">arrow_forward</span></span>'}</button>`}
  function chapterHTML(c,extra){const [h,t]=CH[c];return `<section class="chapter"><div class="chapter-h"><h2 class="title-l">${h}</h2><span class="tag">${t}</span></div><div class="cards">${TOOLS.filter(x=>x.ch==c).map(cardHTML).join('')}${extra||''}</div></section>`}
  function renderView(){
    const v=$('#view'),d=DEST.find(x=>x.id===curView)||DEST[0],h1=$('#view-title');
    h1.textContent=d.title;h1.dataset.kurz=d.kurz||d.label;
    zeigtSperre=!!(d.tool&&raum.gesperrt(d.tool));
    if(zeigtSperre)v.innerHTML=gesperrtHTML();
    else if(d.tool){const t=TOOLS.find(x=>x.id===d.tool),html=imTool(t.id,()=>t.html());v.innerHTML=lehrerpanelHTML(t)+html;t.init(v);bindAufgaben(v)}
    else if(d.render)v.innerHTML=d.render();
    else v.innerHTML=d.ch.map(c=>chapterHTML(c)).join('');
    $$('[data-tool]',v).forEach(b=>b.addEventListener('click',()=>openTool(b.dataset.tool)));
    $$('[data-open]',v).forEach(b=>b.addEventListener('click',()=>b.dataset.open==='glossar'?openGlossar():openWissen()));
    $$('[data-dest]',v).forEach(b=>b.addEventListener('click',()=>go(b.dataset.dest)));
    if(cfg.beimZeigen)cfg.beimZeigen(curView,v);
    nurLk(v);
  }
  function go(id){
    if(!modal.hidden)closeModal(true);
    curView=DEST.find(d=>d.id===id)?id:'start';
    renderNav();renderView();window.scrollTo(0,0);
    try{history.replaceState(null,'','#'+curView)}catch(e){}
    raum.sendeOrt(aktuellerOrt());
  }
  /** Öffnet eine Werkstatt. art: 'neu' (Standard) legt einen Schritt im Browserverlauf an, 'verlauf' nicht (Zurück/Vor,
   *  eingetippte Adresse, Neuladen), 'geholt' (die Lehrkraft holt alle) legt einen Schritt an, aber ohne Herkunft. */
  function openTool(id,ohneSperre,art='neu'){
    if(!ohneSperre&&raum.gesperrt(id)){zeigeHinweis('Deine Lehrkraft hat diese Werkstatt noch nicht freigegeben.');return}
    const own=DEST.find(d=>d.tool===id);if(own)return go(own.id);
    const t=TOOLS.find(x=>x.id===id);if(!t)return;
    const vorher=offenesTool;
    // Aus einer offenen Werkstatt heraus (z. B. „Wiederholen“ im Wissenscheck) bleibt der Bereich dahinter derselbe,
    // „Zurück“ führt dann in die vorige Werkstatt
    if(modal.hidden){const dest=destOfTool(id);if(dest!==curView){curView=dest;renderNav();renderView();if(art!=='verlauf')try{history.replaceState(null,'','#'+dest)}catch(e){}}}
    const von=art==='verlauf'?(history.state&&history.state.werkstatt===id?history.state.von:null):art==='neu'&&vorher&&vorher!==id?vorher:null;
    if(art!=='verlauf'&&vorher!==id)try{history.pushState({werkstatt:id,von},'','#'+id)}catch(e){}
    const html=imTool(t.id,()=>t.html());
    openModal(esc(t.title),lehrerpanelHTML(t)+html,root=>{t.init(root);bindAufgaben(root)});
    if(!lastTool)lastTool=id; // z. B. direkt über die Adresse geöffnet: beim Schließen auf die Karte
    offenesTool=id;raum.sendeOrt(id);
    const vt=von&&TOOLS.find(x=>x.id===von);if(vt)$('#modal-close').setAttribute('aria-label',`Zurück zu „${vt.title}“`);
    // Zurück aus einer Werkstatt, die per „Wiederholen“ geöffnet wurde: Fokus wieder auf diesen Knopf
    const k=art==='verlauf'&&vorher&&$(`[data-gehzu="${CSS.escape(vorher)}"]`,mBody);
    if(k){k.focus({preventScroll:true});k.scrollIntoView({block:'center'})}
  }
  /** Zeigt, was die Adresse verlangt (Zurück/Vor im Browser, eingetippte Adresse). Tut nichts, wenn es schon zu sehen ist.
   *  popstate und hashchange kommen oft beide: Der zweite Aufruf findet alles erledigt vor, deshalb kein doppeltes Zeichnen. */
  function route(){
    const h=(location.hash||'').slice(1);
    if(TOOLS.find(t=>t.id===h)&&!DEST.find(d=>d.tool===h)){if(modal.hidden||offenesTool!==h)openTool(h,false,'verlauf');return}
    const d=DEST.find(x=>x.id===h||x.tool===h);if(!d)return;
    if(!modal.hidden)closeModal();
    if(d.id!==curView)go(d.id);
  }

  /* ---------- Lernraum ---------- */
  const aktuellerOrt=()=>offenesTool||DEST.find(d=>d.id===curView)?.tool||curView;
  const gesperrtHTML=()=>`<div class="panel stack" style="max-width:560px"><p class="title-m"><span class="ms" aria-hidden="true">lock</span> Noch gesperrt</p><p>Deine Lehrkraft hat diesen Bereich noch nicht freigegeben.</p></div>`;
  function orte(){return [
    ...DEST.filter(d=>!d.tool).map(d=>({id:d.id,titel:d.title,art:'bereich'})),
    ...TOOLS.map(t=>({id:t.id,titel:t.title,art:'werkstatt'}))]}
  /** Lehrerpanel: Hinweise und Erwartungshorizont, nur auf dem Gerät der Lehrkraft und nicht im Beamer-Modus. */
  function lehrerpanelHTML(t){
    if(!t||!raum.istLehrkraft()||raum.beamer())return '';
    const auf=[...AUFGABEN.values()].filter(a=>a.tool===t.id&&!a.intern),hw=t.hinweise||[];
    if(!hw.length&&!auf.length)return '';
    return `<details class="lehrerpanel"><summary><span class="ms sm" aria-hidden="true">co_present</span>Lehrerpanel <span class="small muted">nur auf deinem Gerät, im Beamer-Modus ausgeblendet</span></summary><div class="stack">
      ${hw.length?`<div><p class="title-s">Hinweise</p><ul>${hw.map(h=>`<li>${h}</li>`).join('')}</ul></div>`:''}
      ${auf.length?`<div class="stack"><p class="title-s">Erwartungshorizont und Lösungen</p>${auf.map(a=>`<div><p class="small"><b>${a.frage}</b></p><ul class="small">${a.loesung.map(l=>`<li>${l}</li>`).join('')}</ul></div>`).join('')}</div>`:''}
      ${auf.filter(a=>a.ki).map(a=>`<div class="stack"><p class="title-s">KI-Coach mit AIS.chat</p>
        <ol class="small"><li>Anweisung kopieren und in AIS.chat ein Lernszenario damit anlegen.</li><li>Das Lernszenario teilen und den Link im Lernraum-Dashboard unter „KI-Coach“ einfügen.</li><li>Dann erscheint bei den offenen Aufgaben der Knopf „KI-Coach“.</li></ol>
        <details class="hilfe"><summary><span class="ms sm" aria-hidden="true">smart_toy</span>Anweisung anzeigen</summary><pre class="wc-ki" id="ki-${esc(a.id)}">${esc(a.ki)}</pre></details>
        <div class="row"><button class="btn small" type="button" data-kopiere="#ki-${esc(a.id)}"><span class="ms" aria-hidden="true">content_copy</span>Anweisung kopieren</button></div></div>`).join('')}</div></details>`;
  }
  function aktualisiereLehrerpanel(){
    const imModal=!modal.hidden&&offenesTool,d=DEST.find(x=>x.id===curView);
    const ziel=imModal?mBody:(d&&d.tool&&!raum.gesperrt(d.tool)?$('#view'):null);if(!ziel)return;
    const t=TOOLS.find(x=>x.id===(imModal?offenesTool:d.tool));
    ziel.querySelector(':scope > .lehrerpanel')?.remove();
    const h=lehrerpanelHTML(t);if(h)ziel.insertAdjacentHTML('afterbegin',h);
  }
  let sperreAlt='',pauseVorher=null,sperrePruefen=false;
  function raumGeaendert(art){
    const s=raum.sitzung(),v=raum.verbindung(),weg=v==='netz'||v==='laden';
    const txt=s?(s.rolle==='lk'?`Lernraum ${s.code} (Lehrkraft)`:`Lernraum ${s.code} – du bist ${s.nick}`)+(weg?' – keine Verbindung':''):'Lernraum';
    $$('[data-raum-btn]').forEach(b=>{$('.lr-dot',b).hidden=!s;b.setAttribute('aria-label',txt);b.title=txt});
    // Pause: Hintergrund sperren, danach zurück an die vorherige Stelle
    const p=$('#lr-pause'),pause=raum.pausiert();
    if(p.hidden===pause){if(pause)pauseVorher=document.activeElement;p.hidden=!pause;sperreHintergrund();if(pause)p.focus();else{const v=pauseVorher;pauseVorher=null;if(v&&v!==document.body&&document.body.contains(v)&&!v.closest('[inert]'))v.focus();else if(!modal.hidden&&!modal.inert)$('#modal-close').focus()}}
    const z=raum.zustand().raum,sperre=raum.istSchueler()&&z?JSON.stringify(z.gesperrt||[]):'[]';
    if(sperre!==sperreAlt){sperreAlt=sperre;const d=DEST.find(x=>x.id===curView);if(!d||!d.tool||raum.gesperrt(d.tool)||zeigtSperre)renderView()}
    // Gesperrte Werkstatt per Link oder Neuladen geöffnet (vor dem Verbinden war die Sperre unbekannt): nach dem
    // ersten Raumzustand schließen, Fokus auf ihre Karte („Noch gesperrt“). Beim Sperren schon offene Werkstätten
    // bleiben offen, ebenso eine, in die die Lehrkraft alle geholt hat.
    if(art==='verbunden')sperrePruefen=raum.istSchueler();
    if(sperrePruefen&&z){sperrePruefen=false;
      if(!modal.hidden&&offenesTool&&raum.gesperrt(offenesTool)&&z.ziel!==offenesTool){closeModal();zeigeHinweis('Deine Lehrkraft hat diese Werkstatt noch nicht freigegeben.')}}
    if(['start','ende','verbunden','beamer'].includes(art))aktualisiereLehrerpanel();
    nurLk();
  }
  /** Springt zu einem Bereich oder einer Werkstatt; hinweis: Schüler wurden von der Lehrkraft geholt. */
  function gehZu(id,hinweis){if(DEST.find(d=>d.id===id&&!d.tool))go(id);else openTool(id,true,hinweis?'geholt':'neu');if(hinweis)zeigeHinweis('Deine Lehrkraft hat alle hierher geholt.')}

  /* ---------- Start ---------- */
  function start(){
    $('#btn-glossar').addEventListener('click',openGlossar);
    $('#btn-wissen').addEventListener('click',openWissen);
    const setFs=b=>{document.documentElement.classList.toggle('big',b);$('#btn-fs').setAttribute('aria-pressed',String(b));store(P+'-fs',b)};
    $('#btn-fs').addEventListener('click',()=>setFs(!document.documentElement.classList.contains('big')));
    if(store(P+'-fs'))setFs(true);
    window.addEventListener('scroll',()=>$('#topbar').classList.toggle('scrolled',window.scrollY>4),{passive:true});
    updMs();
    raum.init({speicher:P,thema:cfg.thema,hinweis:zeigeHinweis,gehZu,ort:aktuellerOrt,orte,modal:openModal,
      vorbereiten:()=>TOOLS.forEach(t=>{try{imTool(t.id,()=>t.html())}catch(e){console.warn(e)}})});
    raum.on(raumGeaendert);raumGeaendert('start');
    $$('[data-raum-btn]').forEach(b=>b.addEventListener('click',()=>raum.oeffneDialog()));
    // Knöpfe mit data-gehzu (z. B. „Wiederholen“ im Wissenscheck) öffnen eine Werkstatt oder einen Bereich
    // (gesperrte Werkstätten bleiben gesperrt)
    document.addEventListener('click',e=>{const b=e.target.closest('[data-gehzu]');if(!b)return;e.preventDefault();const id=b.dataset.gehzu;if(DEST.find(d=>d.id===id&&!d.tool))go(id);else openTool(id)});
    const raumCode=h=>{const m=/^raum=([A-Za-z0-9]+)/.exec(h);return m?normCode(m[1]):''};
    const own=h=>cfg.hash?cfg.hash(h):null;
    window.addEventListener('popstate',route);
    window.addEventListener('hashchange',()=>{const h=(location.hash||'').slice(1),c=raumCode(h);if(c){go('start');raum.oeffneDialog(c);return}const d=own(h);if(d)go(d);else route()});
    const h0=(location.hash||'').slice(1),d0=own(h0),s0=history.state;
    if(raumCode(h0)){go('start');raum.oeffneDialog(raumCode(h0))}
    else if(d0)go(d0);
    else if(DEST.find(d=>d.id===h0))go(h0);
    else if(h0&&TOOLS.find(t=>t.id===h0)&&!DEST.find(d=>d.tool===h0)){
      // Per Link geöffnet: kein eigener Schritt im Verlauf. Neu geladen: Der Schritt von vorher bleibt (mit Herkunft).
      go(destOfTool(h0));try{history.replaceState(s0&&s0.werkstatt===h0?s0:null,'','#'+h0)}catch(e){}openTool(h0,false,'verlauf')}
    else if(h0&&DEST.find(d=>d.tool===h0))go(DEST.find(d=>d.tool===h0).id);
    else go('start');
  }

  return {
    tool:o=>TOOLS.push(o),
    tools:TOOLS,
    go,openTool,openModal,closeModal,erkHTML,bindErk,chapterHTML,resetWissen,openGlossar,openWissen,start
  };
}
