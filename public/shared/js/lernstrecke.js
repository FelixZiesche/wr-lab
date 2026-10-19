// Lernstrecke: eine Übersichtsseite und Lektionen, immer im selben Rhythmus Fall – Entdecken – Sichern – Anwenden.
// Die Idee ist an die Lernwerkstätten von Steve Wagner angelehnt (nur Idee und Aufbau, siehe CLAUDE.md).
// Baut auf createWerkstatt (werkstatt.js) auf: Lernraum, Lehrerpanel, Glossar, Erkenntnisse und Wissenscheck bleiben gleich.
// Jede Lektion ist eine Werkstatt, die vier Stationen nacheinander zeigt. Im Lernraum holt „Alle holen nach …“ die Klasse
// in eine Lektion, der Lektionsplan zeigt dann allen, wo die Klasse steht (Raumfeld ziel, keine neuen Felder).
//
//   const L = createLernstrecke({
//     …alles wie createWerkstatt (thema, speicher, logo, merksaetze, wissenTitel, glossar, punkte, kapitel, beimZeigen),
//     titel, eyebrow, leitfrage, intro,     Übersicht: Titel, Zeile über der Leitfrage, Leitfrage, Einleitung (HTML)
//     banner:   {src, alt, nachweis}         Foto hinter der Leitfrage, nachweis als HTML
//     ziele:    ['…']                        „Was ihr danach könnt“
//     bereiche: [{…}]                        weitere Bereiche nach der Übersicht, z. B. Mission und Wissen
//     abschluss:[{tool, titel, text, icon}]  Stationen nach den Lektionen im Lektionsplan, z. B. Mission und Wissenscheck
//     uebersichtEnde: () => HTML             am Ende der Übersicht, z. B. Quellen
//   });
//   L.lektion({id, titel, frage, icon, dauer, hinweise, tafel, stationen:[fall, entdecken, sichern, anwenden]})
//     station = {sozial:'allein'|'zweit'|'klasse', titel, html: () => HTML, init?: root => {}}
//     tafel   = HTML für das Tafelbild der Reihe, erscheint, sobald die Erkenntnis der Lektion gesichert ist
//     Die Erkenntnis (merksaetze[id]) steht automatisch am Ende der Station „Sichern“.
//   L.rueckblick(aufgabeId, frage)  zeigt die eigene Antwort aus einem früheren Schreibfeld (Blick zurück auf die Vermutung)
//   L.start()
// Fortschritt pro Lektion im localStorage: <speicher>-ls-<lektion> = {s: aktuelle Station, max: weiteste Station}.
import { $, $$, esc, store, neuZeichnen } from './ui.js';
import { createWerkstatt } from './werkstatt.js';
import { raum } from './lernraum.js';

const STATIONEN=[['fall','Der Fall','cases'],['entdecken','Entdecken','explore'],['sichern','Sichern','edit_note'],['anwenden','Anwenden','rocket_launch']];
const SOZIAL={allein:['person','Allein'],zweit:['group','Zu zweit'],klasse:['groups','Mit der Klasse']};

export function createLernstrecke(cfg){
  const LEKT=[],P=cfg.speicher;
  const DEST=[{id:'start',icon:'flag',label:'Übersicht',title:cfg.titel,kurz:cfg.kurz||cfg.titel,render:uebersichtHTML},...(cfg.bereiche||[])];
  const W=createWerkstatt({...cfg,bereiche:DEST,kapitel:{1:['Lektionen',''],...cfg.kapitel},
    beimZeigen(id,v){if(id==='start')bindUebersicht(v);if(cfg.beimZeigen)cfg.beimZeigen(id,v)}});
  const stand=id=>{const x=store(`${P}-ls-${id}`);return x&&typeof x.s==='number'?x:{s:0,max:0}};
  const fertig=l=>W.gesichert(l.id)&&stand(l.id).max>=3;
  // Knopf zu einer Werkstatt; liegt sie direkt in einem Bereich (z. B. Mission), führt er zu diesem Bereich
  const ziel=id=>{const d=DEST.find(x=>x.tool===id);return d?`data-dest="${d.id}"`:`data-tool="${id}"`};

  /* ---------- Lektion ---------- */
  function lektion(def){
    const nr=LEKT.length+1;LEKT.push({...def,nr});
    W.tool({id:def.id,ch:1,farben:def.farben||[],hinweise:def.hinweise,title:`Lektion ${nr}: ${def.titel}`,sub:def.frage,
      html(){return lektionHTML(def,nr)},
      init(root){bindLektion(root,def,nr)}});
  }
  function lektionHTML(def,nr){
    const naechste=LEKT[nr],ab=(cfg.abschluss||[])[0];
    return `<div class="ls-kopf"><p class="eyebrow">Lektion ${nr} von ${LEKT.length}${def.dauer?` · etwa ${esc(def.dauer)}`:''}</p><p class="headline-s">${def.frage}</p></div>
    <ol class="ls-schritte" aria-label="Stationen der Lektion">${STATIONEN.map(([k,t,ic],i)=>`<li><button type="button" class="ls-schritt" data-ls-zu="${i}"><span class="ls-ic"><span class="ms" aria-hidden="true">${ic}</span></span><span class="ls-st"><span class="small muted">Station ${i+1}</span><span>${t}</span></span></button></li>`).join('')}</ol>
    ${def.stationen.map((st,i)=>{const [k,t]=STATIONEN[i],[sic,stxt]=SOZIAL[st.sozial||'allein'];
      return `<section class="ls-station stack" data-ls-station="${i}" aria-labelledby="ls-${def.id}-${i}" hidden>
        <div class="ls-station-kopf"><h3 class="title-l" id="ls-${def.id}-${i}" tabindex="-1">${i+1} · ${t}${st.titel?`: ${st.titel}`:''}</h3><span class="tag ls-sozial"><span class="ms sm" aria-hidden="true">${sic}</span>${stxt}</span></div>
        ${st.html()}
        ${k==='sichern'&&cfg.merksaetze[def.id]?W.erkHTML(def.id):''}
        <div class="row ls-weiter">${i<3?`<button class="btn primary" type="button" data-ls-zu="${i+1}"><span class="ms" aria-hidden="true">arrow_forward</span>Weiter: ${STATIONEN[i+1][1]}</button>`
          :naechste?`<button class="btn primary" type="button" data-gehzu="${naechste.id}"><span class="ms" aria-hidden="true">arrow_forward</span>Weiter: Lektion ${nr+1}</button>`
          :ab?`<button class="btn primary" type="button" data-gehzu="${ab.tool}"><span class="ms" aria-hidden="true">${ab.icon||'arrow_forward'}</span>Weiter: ${esc(ab.titel)}</button>`:''}
          ${i===3?'<button class="btn" type="button" data-gehzu="start"><span class="ms" aria-hidden="true">flag</span>Zur Übersicht</button>':''}</div>
      </section>`}).join('')}`;
  }
  function bindLektion(root,def,nr){
    const zeige=(i,fokus)=>{
      const x=stand(def.id);x.s=i;x.max=Math.max(x.max,i);store(`${P}-ls-${def.id}`,x);aktualisiere();
      $$('[data-ls-station]',root).forEach(s=>{s.hidden=+s.dataset.lsStation!==i});
      $$('.ls-schritt',root).forEach(b=>{const j=+b.dataset.lsZu;b.classList.toggle('besucht',j<=x.max&&j!==i);
        if(j===i)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current')});
      if(fokus){const h=$(`#ls-${CSS.escape(def.id)}-${i}`,root);h.scrollIntoView({block:'start'});h.focus({preventScroll:true})}
    };
    // Die Knöpfe selbst binden: root ist das Fenster, das für jede Werkstatt neu befüllt wird
    $$('[data-ls-zu]',root).forEach(b=>b.addEventListener('click',()=>zeige(+b.dataset.lsZu,true)));
    def.stationen.forEach(st=>st.init&&st.init(root));
    W.bindErk(root);
    zeige(stand(def.id).s,false);
  }

  /* ---------- Übersicht ---------- */
  // Wo steht die Klasse? Lehrkraft: Geräte pro Lektion. Schüler: die Lektion, in die die Lehrkraft zuletzt alle geholt hat.
  function klasseBei(id){
    const z=raum.zustand();
    if(raum.istLehrkraft()){const n=z.spieler.filter(p=>p.ort===id).length;return n?`<span class="ls-klasse"><span class="ms sm" aria-hidden="true">groups</span>${n} ${n===1?'Gerät':'Geräte'} hier</span>`:''}
    if(raum.istSchueler()&&z.raum&&z.raum.ziel===id)return '<span class="ls-klasse"><span class="ms sm" aria-hidden="true">groups</span>Hier ist eure Klasse</span>';
    return '';
  }
  function planHTML(){
    const naechste=LEKT.find(l=>!fertig(l));
    const zeile=(id,nr,icon,titel,text,status,erledigt)=>`<li class="ls-plan-item${erledigt?' erledigt':''}${naechste&&naechste.id===id?' aktuell':''}">
      <button type="button" class="ls-plan-btn" ${ziel(id)}><span class="ls-nr" aria-hidden="true">${erledigt?'<span class="ms">check</span>':typeof nr==='number'?nr:`<span class="ms">${icon}</span>`}</span>
      <span class="ls-plan-text"><span class="small muted">${typeof nr==='number'?`Lektion ${nr}`:'Zum Schluss'}</span><span class="title-m">${titel}</span><span class="small">${text}</span>${status}</span>
      ${typeof nr==='number'?`<span class="ms ls-plan-ic" aria-hidden="true">${icon}</span>`:''}</button>${klasseBei(id)}</li>`;
    return LEKT.map(l=>{const x=stand(l.id),f=fertig(l);
      const status=`<span class="small muted ls-status">${f?'Gesichert':x.max||x.s?`Station ${x.s+1} von 4`:'Noch nicht begonnen'}${l.dauer?` · etwa ${esc(l.dauer)}`:''}</span>`;
      return zeile(l.id,l.nr,l.icon||'school',esc(l.titel),l.frage,status,f)}).join('')
      +(cfg.abschluss||[]).map(a=>zeile(a.tool,'',a.icon||'flag',esc(a.titel),a.text||'','',W.gesichert(a.tool))).join('');
  }
  function tafelHTML(){
    const alle=raum.istLehrkraft();
    return `<div class="ls-tafel"><p class="ls-tafel-frage"><span class="ms" aria-hidden="true">help</span>${esc(cfg.leitfrage)}</p>
      <ol class="ls-tafel-teile">${LEKT.map(l=>{const da=W.gesichert(l.id)||alle;
        return `<li class="${da?'':'leer'}"><p class="small muted">Lektion ${l.nr} · ${esc(l.titel)}</p>${da?l.tafel:`<p class="small"><span class="ms sm" aria-hidden="true">lock</span> Erscheint, sobald du die Erkenntnis von Lektion ${l.nr} sicherst.</p>`}</li>`}).join('')}</ol></div>`;
  }
  function uebersichtHTML(){
    const weiter=LEKT.find(l=>!fertig(l)),begonnen=LEKT.some(l=>stand(l.id).max>0||W.gesichert(l.id));
    return `<section class="banner">${cfg.banner?`<img src="${cfg.banner.src}" alt="${esc(cfg.banner.alt)}"><span class="credit">${cfg.banner.nachweis}</span>`:''}
      <div class="banner-text"><p class="eyebrow">${cfg.eyebrow||'Leitfrage'}</p><h2>${esc(cfg.leitfrage)}</h2></div></section>
    <section class="ls-start">
      <div class="stack"><p class="body-l">${cfg.intro||''}</p>
        <div class="cta">${weiter?`<button class="fab" type="button" data-tool="${weiter.id}"><span class="ms" aria-hidden="true">play_arrow</span>${begonnen?`Weiter mit Lektion ${weiter.nr}`:'Lektion 1 starten'}</button>`
          :(cfg.abschluss||[])[0]?`<button class="fab" type="button" ${ziel(cfg.abschluss[cfg.abschluss.length-1].tool)}><span class="ms" aria-hidden="true">${cfg.abschluss[cfg.abschluss.length-1].icon||'flag'}</span>${esc(cfg.abschluss[cfg.abschluss.length-1].titel)}</button>`:''}</div></div>
      <div class="panel stack"><h3 class="title-m">Was ihr danach könnt</h3><ul class="lernziele">${(cfg.ziele||[]).map(z=>`<li><span class="ms" aria-hidden="true">check_circle</span><span>${z}</span></li>`).join('')}</ul></div>
    </section>
    <section class="stack"><div class="section-h"><h2>Zwei Wege durch die Lernstrecke</h2></div>
      <div class="ls-wege">
        <div class="ls-weg"><span class="ic"><span class="ms" aria-hidden="true">person</span></span><div class="stack"><h3 class="title-m">Allein</h3><p class="small">Geh die Lektionen in deinem Tempo durch, am Handy oder am Laptop. Alles, was du eingibst, bleibt in deinem Browser.</p></div></div>
        <div class="ls-weg"><span class="ic"><span class="ms" aria-hidden="true">groups</span></span><div class="stack"><h3 class="title-m">Mit der Klasse im Lernraum</h3><p class="small">Deine Lehrkraft öffnet einen Lernraum. Mit dem Code und einem Spitznamen trittst du bei. Dann landen eure Antworten an der Wand, ihr stimmt live ab, und der Lektionsplan zeigt, wo die Klasse steht.</p>
          <div class="row"><button class="btn small" type="button" data-ls-raum><span class="ms" aria-hidden="true">cast_for_education</span>Lernraum beitreten</button></div></div></div>
      </div></section>
    <section class="stack"><div class="section-h"><h2>Lektionsplan</h2><p>Jede Lektion hat vier Stationen: <b>Der Fall</b> aus dem Alltag, <b>Entdecken</b>, <b>Sichern</b> mit Merksatz und Hefteintrag, <b>Anwenden</b> an einem neuen Fall.</p></div>
      <ol class="ls-plan" id="ls-plan">${planHTML()}</ol></section>
    <section class="stack"><div class="section-h"><h2>Tafelbild der Reihe</h2><p>Mit jeder gesicherten Lektion füllt sich das Tafelbild – am Ende beantwortet es die Leitfrage.</p></div>
      <div id="ls-tafel">${tafelHTML()}</div></section>
    <p class="small muted ls-schutz"><span class="ms sm" aria-hidden="true">shield</span><span>Ohne Lernraum bleibt alles auf deinem Gerät. Im Lernraum speichert die Seite nur deinen Spitznamen, wo du gerade arbeitest, abgeschickte Antworten, Stimmen und Punkte im Wissenscheck. <a href="../datenschutz.html">Mehr zum Datenschutz</a></span></p>
    ${cfg.uebersichtEnde?cfg.uebersichtEnde():''}`;
  }
  function bindUebersicht(v){
    $$('[data-ls-raum]',v).forEach(b=>b.addEventListener('click',()=>$('#btn-raum').click()));
  }
  // Lektionsplan und Tafelbild neu zeichnen, wenn sich im Lernraum oder in einer Lektion etwas ändert
  // (nur bei Änderungen, der Fokus bleibt). Die Übersicht liegt dabei oft hinter dem Fenster der Lektion.
  function aktualisiere(){const plan=$('#ls-plan');if(!plan)return;
    if(neuZeichnen(plan,planHTML())){$$('[data-tool]',plan).forEach(b=>b.addEventListener('click',()=>W.openTool(b.dataset.tool)));$$('[data-dest]',plan).forEach(b=>b.addEventListener('click',()=>W.go(b.dataset.dest)))}
    neuZeichnen($('#ls-tafel'),tafelHTML())}
  raum.on(aktualisiere);

  /** Blick zurück: die eigene Antwort aus einem Schreibfeld (nur aus diesem Browser) */
  function rueckblick(id,frage){
    const t=store(`${P}-sf-${id}`);
    return `<div class="ls-rueckblick"><p class="title-s"><span class="ms sm" aria-hidden="true">history</span>Deine Vermutung vom Anfang</p>${frage?`<p class="small muted">${frage}</p>`:''}
      ${t&&String(t).trim()?`<blockquote>${esc(t)}</blockquote>`:`<p class="small">Du hast am Anfang noch keine Vermutung aufgeschrieben. <button class="btn text small" type="button" data-gehzu="${esc(LEKT[0]?.id||'start')}">Zu Lektion 1</button></p>`}</div>`;
  }

  return {...W,lektion,rueckblick,lektionen:LEKT};
}
