// Gerüst einer Lernwerkstatt nach Material Design 3: Navigation (Rail ab 600 px, Bar darunter),
// Bereiche, Werkstatt-Karten, Detailansicht, Erkenntnisse („Mein Wissen“), Glossar und Schriftgröße.
// Jedes Thema ruft createWerkstatt() mit seinen Inhalten auf, siehe sechseck/sechseck.js.
import { $, $$, esc, store } from './ui.js';

/**
 * cfg = {
 *   speicher:    Präfix für den localStorage, z. B. 'ms6'
 *   logo:        SVG für die Navigation Rail (führt zurück zur WR-Lab-Startseite)
 *   start:       Adresse der WR-Lab-Startseite (Standard: '../')
 *   bereiche:    [{id, icon, label, title, desc, ch:[Kapitel], tool:'id' (Werkstatt direkt im Bereich), render: () => HTML}]
 *   kapitel:     {1: ['Kapitel 1 – …', 'Untertitel'], …}
 *   merksaetze:  {werkstattId: ['Merksatz', …]}
 *   wissenTitel: 'Mein Sechseck-Wissen'
 *   glossar:     [['Begriff', 'Erklärung'], …]
 *   punkte:      tool => HTML der Farbpunkte auf einer Werkstatt-Karte
 *   beimZeigen:  (bereichId, element) => Ereignisse für themenspezifische Inhalte binden
 *   hash:        hash => Bereich, falls das Thema eigene Sprungadressen hat (z. B. #join=CODE)
 * }
 */
export function createWerkstatt(cfg){
  const P=cfg.speicher, DEST=cfg.bereiche, CH=cfg.kapitel, MS=cfg.merksaetze, GLOSS=cfg.glossar||[];
  const TOOLS=[];
  const MS_ALL=Object.entries(MS).flatMap(([t,a])=>a.map((s,i)=>({id:t+'-'+i,tool:t,text:s})));
  let msGot=new Set(store(P+'-wissen')||[]);
  let curView='start';

  document.body.insertAdjacentHTML('afterbegin',`<div class="app">
  <nav class="rail" aria-label="Bereiche">
    <a class="rail-logo" href="${cfg.start||'../'}" aria-label="Alle Themen im WR-Lab" title="Alle Themen im WR-Lab">${cfg.logo}</a>
    <div class="nav-items" id="rail-items"></div>
  </nav>
  <div class="pane">
    <header class="topbar" id="topbar">
      <a class="icon-btn home-link" href="${cfg.start||'../'}" aria-label="Alle Themen im WR-Lab" title="Alle Themen im WR-Lab"><span class="ms">apps</span></a>
      <h1 id="view-title">${esc(DEST[0].title)}</h1>
      <button class="chip hide-compact" type="button" id="btn-wissen"><span class="ms sm">lightbulb</span><span>Mein Wissen <span id="ms-count" class="num">0/0</span></span></button>
      <button class="icon-btn" type="button" id="btn-glossar" aria-label="Begriffe nachschlagen" title="Begriffe nachschlagen"><span class="ms">search</span></button>
      <button class="icon-btn" type="button" id="btn-fs" aria-pressed="false" aria-label="Größere Schrift" title="Größere Schrift"><span class="ms">format_size</span></button>
    </header>
    <main id="view"></main>
  </div>
  <nav class="navbar" aria-label="Bereiche" id="nav-bar"></nav>
</div>

<div class="modal" id="modal" hidden>
  <div class="modal-card" role="region" aria-labelledby="modal-title">
    <div class="modal-head">
      <button class="icon-btn" id="modal-close" type="button" aria-label="Zurück"><span class="ms">arrow_back</span></button>
      <h2 id="modal-title"></h2>
    </div>
    <div class="modal-body" id="modal-body"></div>
  </div>
</div>`);

  /* ---------- Erkenntnisse ---------- */
  function saveMs(){store(P+'-wissen',[...msGot]);updMs();if(!DEST.find(d=>d.id===curView)?.tool)renderView()}
  function updMs(){$('#ms-count').textContent=`${msGot.size}/${MS_ALL.length}`}
  function resetWissen(){msGot=new Set();saveMs()}

  /* ---------- Modal ---------- */
  const modal=$('#modal'), mBody=$('#modal-body'), mTitle=$('#modal-title');
  let lastFocus=null;
  function openModal(title,html,init){
    lastFocus=document.activeElement;
    mTitle.innerHTML=title; mBody.innerHTML=html; modal.hidden=false;
    document.body.style.overflow='hidden';
    modal.scrollTop=0;
    if(init) init(mBody);
    $('#modal-close').focus();
  }
  function closeModal(silent){modal.hidden=true;document.body.style.overflow='';mBody.innerHTML='';try{history.replaceState(null,'','#'+curView)}catch(e){} if(!silent&&lastFocus&&document.body.contains(lastFocus)) lastFocus.focus()}
  modal.addEventListener('scroll',()=>modal.classList.toggle('scrolled',modal.scrollTop>4));
  $('#modal-close').addEventListener('click',closeModal);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!modal.hidden)closeModal()});

  function erkHTML(tool){
    return `<div class="erk" data-erk="${tool}">
    <div class="row" style="justify-content:space-between"><span class="erk-h"><span class="ms">lightbulb</span>Erkenntnis</span>
    <button class="btn small primary" type="button" data-erk-btn><span class="ms">visibility</span>Erkenntnis aufdecken</button></div>
    <div data-erk-body hidden><ul>${MS[tool].map(s=>`<li>${esc(s)}</li>`).join('')}</ul>
    <p class="small muted">Gespeichert in „${esc(cfg.wissenTitel)}“.</p></div></div>`;
  }
  function bindErk(root){
    $$('[data-erk]',root).forEach(box=>{
      const t=box.dataset.erk, btn=$('[data-erk-btn]',box), body=$('[data-erk-body]',box);
      const show=()=>{body.hidden=false;btn.hidden=true};
      if(MS[t].every((_,i)=>msGot.has(t+'-'+i))) show();
      btn.addEventListener('click',()=>{MS[t].forEach((_,i)=>msGot.add(t+'-'+i));saveMs();show()});
    });
  }

  /* ---------- Glossar und Wissen ---------- */
  function openGlossar(){
    openModal('Begriffe nachschlagen',`<input type="search" id="gs" placeholder="Begriff suchen …" aria-label="Begriff suchen" style="width:100%;padding:9px 12px"><dl class="glossary panel" id="gl"></dl>`,root=>{
      const r=q=>{$('#gl',root).innerHTML=GLOSS.filter(([t,d])=>(t+d).toLowerCase().includes(q.toLowerCase())).map(([t,d])=>`<dt>${t}</dt><dd>${d}</dd>`).join('')||'<p class="muted">Kein Treffer.</p>'};
      $('#gs',root).addEventListener('input',e=>r(e.target.value));r('');$('#gs',root).focus()});
  }
  function openWissen(){
    openModal(esc(cfg.wissenTitel),`<p class="task">Hier sammeln sich die Merksätze, sobald ihr in einer Werkstatt die Erkenntnis aufdeckt. Zusammen ergeben sie euren Hefteintrag.</p><div class="panel" id="ws"></div><div class="row"><button class="btn small" id="ws-all" type="button">Alle anzeigen (Lehrkraft)</button><button class="btn small" id="ws-copy" type="button">Gesammelte Merksätze kopieren</button><span class="small muted" id="ws-msg"></span></div>`,root=>{
      let all=false;
      const r=()=>{$('#ws',root).innerHTML=MS_ALL.map((m,i)=>{const got=msGot.has(m.id)||all;const t=TOOLS.find(x=>x.id===m.tool);return `<div class="ms-item ${got?'':'locked'}"><span class="num" style="min-width:1.6em">${i+1}.</span><div>${got?esc(m.text):`noch nicht entdeckt – Werkstatt „${esc(t.title)}“`}</div></div>`}).join('')};
      r();$('#ws-all',root).addEventListener('click',()=>{all=!all;r()});
      $('#ws-copy',root).addEventListener('click',()=>{const txt=MS_ALL.filter(m=>msGot.has(m.id)||all).map((m,i)=>`${i+1}. ${m.text}`).join('\n');
        const done=()=>$('#ws-msg',root).textContent='Kopiert.';
        try{navigator.clipboard.writeText(txt).then(done,()=>fallback(txt))}catch(e){fallback(txt)}
        function fallback(t){const ta=document.createElement('textarea');ta.value=t;ta.style.width='100%';ta.rows=8;$('#ws',root).after(ta);ta.select();$('#ws-msg',root).textContent='Text markiert – mit Strg+C kopieren.'}});
    });
  }

  /* ---------- Navigation und Views ---------- */
  const destOfTool=id=>{const t=TOOLS.find(x=>x.id===id);return t?(DEST.find(d=>(d.ch||[1]).includes(t.ch))||DEST[0]).id:'start'};
  function navHTML(){return DEST.map(d=>`<button class="nav-item" type="button" data-dest="${d.id}" ${d.id===curView?'aria-current="page"':''}><span class="ind"><span class="ms">${d.icon}</span></span><span>${d.label}</span></button>`).join('')}
  function renderNav(){['#rail-items','#nav-bar'].forEach(sel=>{const el=$(sel);el.innerHTML=navHTML();$$('[data-dest]',el).forEach(b=>b.addEventListener('click',()=>go(b.dataset.dest)))})}
  function cardHTML(x){const done=MS[x.id]&&MS[x.id].every((_,i)=>msGot.has(x.id+'-'+i));
    return `<button class="card" type="button" data-tool="${x.id}"><span class="dots">${cfg.punkte(x)}</span><h4>${x.title}</h4><p>${x.sub}</p>${done?'<span class="done"><span class="ms sm">check_circle</span>Erkenntnis gesichert</span>':''}<span class="go">Werkstatt öffnen<span class="ms sm">arrow_forward</span></span></button>`}
  function chapterHTML(c,extra){const [h,t]=CH[c];return `<section class="chapter"><div class="chapter-h"><h3>${h}</h3><span class="tag">${t}</span></div><div class="cards">${TOOLS.filter(x=>x.ch==c).map(cardHTML).join('')}${extra||''}</div></section>`}
  function renderView(){
    const v=$('#view'),d=DEST.find(x=>x.id===curView)||DEST[0];
    $('#view-title').textContent=d.title;
    if(d.tool){const t=TOOLS.find(x=>x.id===d.tool);v.innerHTML=t.html();t.init(v);}
    else if(d.render)v.innerHTML=d.render();
    else v.innerHTML=d.ch.map(c=>chapterHTML(c)).join('');
    $$('[data-tool]',v).forEach(b=>b.addEventListener('click',()=>openTool(b.dataset.tool)));
    $$('[data-open]',v).forEach(b=>b.addEventListener('click',()=>b.dataset.open==='glossar'?openGlossar():openWissen()));
    $$('[data-dest]',v).forEach(b=>b.addEventListener('click',()=>go(b.dataset.dest)));
    if(cfg.beimZeigen)cfg.beimZeigen(curView,v);
  }
  function go(id){
    if(!modal.hidden)closeModal(true);
    curView=DEST.find(d=>d.id===id)?id:'start';
    renderNav();renderView();window.scrollTo(0,0);
    try{history.replaceState(null,'','#'+curView)}catch(e){}
  }
  function openTool(id){
    const own=DEST.find(d=>d.tool===id);if(own)return go(own.id);
    const t=TOOLS.find(x=>x.id===id);if(!t)return;
    const dest=destOfTool(id);if(dest!==curView){curView=dest;renderNav();renderView()}
    openModal(esc(t.title),t.html(),t.init);
    try{history.replaceState(null,'','#'+id)}catch(e){}
  }

  /* ---------- Start ---------- */
  function start(){
    $('#btn-glossar').addEventListener('click',openGlossar);
    $('#btn-wissen').addEventListener('click',openWissen);
    const setFs=b=>{document.documentElement.classList.toggle('big',b);$('#btn-fs').setAttribute('aria-pressed',String(b));store(P+'-fs',b)};
    $('#btn-fs').addEventListener('click',()=>setFs(!document.documentElement.classList.contains('big')));
    if(store(P+'-fs'))setFs(true);
    window.addEventListener('scroll',()=>$('#topbar').classList.toggle('scrolled',window.scrollY>4),{passive:true});
    updMs();
    const own=h=>cfg.hash?cfg.hash(h):null;
    window.addEventListener('hashchange',()=>{const d=own((location.hash||'').slice(1));if(d)go(d)});
    const h0=(location.hash||'').slice(1),d0=own(h0);
    if(d0)go(d0);
    else if(DEST.find(d=>d.id===h0))go(h0);
    else if(h0&&TOOLS.find(t=>t.id===h0)){go(destOfTool(h0));openTool(h0)}
    else go('start');
  }

  return {
    tool:o=>TOOLS.push(o),
    tools:TOOLS,
    go,openTool,openModal,closeModal,erkHTML,bindErk,chapterHTML,resetWissen,openGlossar,openWissen,start
  };
}
