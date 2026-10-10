// Labyrinth-Spiel für alle Themen: Eine Figur läuft durch ein Heckenlabyrinth. An jeder Kreuzung beginnt ein Weg
// mit einer Entscheidung. Die Schüler schätzen zuerst, wohin er führt, dann laufen sie ihn ab: ins Ziel, in eine
// Sackgasse (sie stecken fest) oder an ein Tor, an dem der Würfel entscheidet („Kommt drauf an“).
// Was hinter einer Kreuzung liegt, bleibt im Nebel (sieht aus wie Hecke), bis die Figur dort war.
// Steuerung: Pfeiltasten oder WASD (ein Schritt, mit Umschalttaste bis zur nächsten Kreuzung), Wischen und
// Steuerkreuz (bis zur nächsten Kreuzung), Feld antippen (die Figur läuft dorthin).
//
//   labyrinth({id, titel, karte:[…], wege:[…], ziel, wuerfel, namen, speicher, fertig})
//     karte    Zeilen gleicher Länge: # Hecke, . Gang (immer sichtbar), S Start, Z Ziel, 1–9 Kreuzung von Weg 1–9,
//              a–i Gang von Weg 1–9 (erst nach dem Schätzen begehbar), A–I Tor von Weg 1–9 (der Würfel öffnet es)
//     wege     [{id, titel, icon, text, erg:'ziel'|'sackgasse'|'glueck', e, unterwegs:['…'], wuerfel:{frage, ja, nein}}]
//              e = Erklärung am Ende des Wegs, unterwegs = Meldungen, die nacheinander auf dem Gang erscheinen
//     ziel     {bild:{src, alt, nachweis}, text}   Foto im Ziel (Bildnachweis steht unter dem Labyrinth), Text beim Ankommen
//     wuerfel  {ja:4}                              ab dieser Augenzahl öffnet sich ein Tor
//     namen    {ziel, sackgasse, glueck}           Namen der drei Ergebnisse, z. B. „Führt zum Hund“
//     speicher localStorage-Schlüssel (Standard: <Präfix>-lab-<id>)
//     fertig   (richtig, n) => HTML               erscheint, wenn alle Wege erkundet sind
// Farben aus der CSS des Themas: --lab-hecke, --lab-busch, --lab-rand, --lab-pfad (M3-Farbrollen).
// Icons, die das Thema in icon_names braucht: block, casino, check_circle, directions_walk, explore, flag,
// keyboard_arrow_down, keyboard_arrow_left, keyboard_arrow_right, keyboard_arrow_up, lock, lock_open, replay,
// restart_alt, undo, workspace_premium und die Icons der Wege.
import { $, $$, store } from './ui.js';
import { raum, registriere } from './lernraum.js';

const T=40,TEMPO=90,DEFS=new Map();
const RICHT={hoch:[0,-1],runter:[0,1],links:[-1,0],rechts:[1,0]},GEGEN={hoch:'runter',runter:'hoch',links:'rechts',rechts:'links'};
const TASTE={ArrowUp:'hoch',ArrowDown:'runter',ArrowLeft:'links',ArrowRight:'rechts',w:'hoch',s:'runter',a:'links',d:'rechts'};
const ERG={ziel:['ok','check_circle'],glueck:['amb','casino'],sackgasse:['bad','block']};
const NAMEN={ziel:'Führt ans Ziel',sackgasse:'Sackgasse',glueck:'Kommt drauf an'};
const AUGEN={1:[4],2:[0,8],3:[0,4,8],4:[0,2,6,8],5:[0,2,4,6,8],6:[0,2,3,5,6,8]};
const ruhig=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const wuerfelHTML=(n,leer)=>`<div class="lab-wuerfel${leer?' leer':''}" role="img" aria-label="${leer?'Würfel':`Würfel zeigt ${n}`}">${[...Array(9)].map((_,i)=>`<span${AUGEN[n].includes(i)?' class="an"':''}></span>`).join('')}</div>`;

export function labyrinth(def){
  const {id,titel,wege,ziel}=def,namen={...NAMEN,...def.namen},b=def.karte[0].length,h=def.karte.length;
  DEFS.set(id,def);
  registriere({id,frage:titel,loesung:wege.map((w,i)=>`<b>Weg ${i+1}: ${w.titel}</b> – ${namen[w.erg]}. ${w.e}`)});
  const pfeil=(r,ic,t)=>`<button class="lab-pfeil" type="button" data-lab-dir="${r}" aria-label="${t}"><span class="ms">${ic}</span></button>`;
  return `<section class="aufgabe lab" data-labyrinth="${id}">
  <div class="lab-links">
    <p class="aufgabe-kopf"><span class="ms sm">explore</span>${titel}</p>
    <div class="lab-feld" tabindex="0" role="application" aria-roledescription="Spiel" aria-label="Labyrinth. Pfeiltasten oder W, A, S, D: ein Schritt. Mit Umschalttaste bis zur nächsten Kreuzung." aria-describedby="${id}-stand">
      <svg viewBox="0 0 ${b*T} ${h*T}" aria-hidden="true"><defs>
        <pattern id="${id}-busch" width="${T}" height="${T}" patternUnits="userSpaceOnUse"><rect width="${T}" height="${T}" class="lab-hecke"/><circle cx="11" cy="12" r="8" class="lab-busch"/><circle cx="29" cy="26" r="9" class="lab-busch"/><circle cx="8" cy="33" r="5" class="lab-busch"/></pattern>
        <clipPath id="${id}-clip" clipPathUnits="objectBoundingBox"><circle cx=".5" cy=".5" r=".5"/></clipPath></defs>
        <rect width="${b*T}" height="${h*T}" rx="16" fill="url(#${id}-busch)"/>
        <g data-lab-karte></g>
        <g class="lab-figur" data-lab-figur><g class="lab-figur-in"><ellipse cy="14" rx="11" ry="4" class="lab-schatten"/><path d="M-11 13 C-11 1 -6 -2 0 -2 C6 -2 11 1 11 13 Z" class="lab-koerper"/><circle cy="-9" r="7.5" class="lab-koerper"/></g></g>
      </svg></div>
    ${ziel?.bild?`<p class="small muted">Im Ziel: ${ziel.bild.nachweis}</p>`:''}
    <div class="lab-unten">
      <div class="stack lab-info"><p class="small num" id="${id}-stand" data-lab-stand></p><p class="small muted">Steuern: Pfeiltasten, Wischen im Labyrinth, Steuerkreuz oder ein Feld antippen.</p></div>
      <div class="lab-steuer" role="group" aria-label="Steuerkreuz: bis zur nächsten Kreuzung laufen">${pfeil('hoch','keyboard_arrow_up','Nach oben laufen')}${pfeil('links','keyboard_arrow_left','Nach links laufen')}${pfeil('rechts','keyboard_arrow_right','Nach rechts laufen')}${pfeil('runter','keyboard_arrow_down','Nach unten laufen')}</div>
    </div>
  </div>
  <div class="lab-rechts">
    <div class="lab-panel" data-lab-panel></div>
    <p class="sr-only" role="status" data-lab-ansage></p>
    <div class="akte-faelle lab-wege" role="group" aria-label="Zu einer Kreuzung springen">${wege.map((w,i)=>`<button class="akte-fall" type="button" data-lab-weg="${i}"><span class="ms">${w.icon}</span><span class="akte-titel">${i+1}. ${w.titel}</span><span class="akte-status small" data-status></span></button>`).join('')}</div>
    <div data-lab-fertig></div>
    <div class="row"><button class="btn small" type="button" data-lab-neu><span class="ms">restart_alt</span>Mission neu starten</button></div>
  </div></section>`;
}

export function bindLabyrinth(box){
  const def=DEFS.get(box.dataset.labyrinth);if(!def)return;
  const {wege}=def,namen={...NAMEN,...def.namen},ja=def.wuerfel?.ja||4,K=def.speicher||`${raum.speicher()}-lab-${def.id}`;
  const b=def.karte[0].length,h=def.karte.length,F=[],schild=[],tor=[],zielF=[];let start=0;
  def.karte.forEach((z,y)=>[...z].forEach((c,x)=>{const f={x,y,i:y*b+x,typ:'hecke'};
    if(c==='.')f.typ='gang';else if(c==='S'){f.typ='start';start=f.i}else if(c==='Z'){f.typ='ziel';zielF.push(f)}
    else if(c>='1'&&c<='9'){f.typ='schild';f.k=+c-1;schild[f.k]=f}
    else if(c>='a'&&c<='i'){f.typ='ast';f.k=c.charCodeAt(0)-97}
    else if(c>='A'&&c<='I'){f.typ='tor';f.k=c.charCodeAt(0)-65;tor[f.k]=f}
    F.push(f)}));
  const at=(x,y)=>x<0||y<0||x>=b||y>=h?null:F[y*b+x];
  const nachbarn=f=>Object.entries(RICHT).map(([r,[dx,dy]])=>[r,at(f.x+dx,f.y+dy)]).filter(([,n])=>n&&n.typ!=='hecke');
  // Abstand jedes Gangfelds von seiner Kreuzung; das entfernteste Feld ist das Ende des Wegs
  const abst=new Map(),ende=[],laenge=[];
  wege.forEach((w,k)=>{const s=schild[k];if(!s)return console.warn('Labyrinth: Kreuzung fehlt für Weg',k+1);
    const q=[s];let max=s;abst.set(s.i,0);
    while(q.length){const f=q.shift();nachbarn(f).forEach(([,n])=>{if((n.typ==='ast'||n.typ==='tor')&&n.k===k&&!abst.has(n.i)){abst.set(n.i,abst.get(f.i)+1);q.push(n);if(n.typ==='ast'&&abst.get(n.i)>abst.get(max.i))max=n}})}
    ende[k]=max;laenge[k]=Math.max(1,abst.get(max.i))});

  // Spielstand: Tipps und erkundete Wege bleiben, die Figur startet immer am Start
  let st=store(K)||{};st.tipp=st.tipp||{};st.schritte=st.schritte||0;
  if(!st.erg){st.erg={};wege.forEach(w=>{if(st.tipp[w.id])st.erg[w.id]=w.erg})} // alter Spielstand: geschätzt = erkundet
  const sichern=()=>store(K,{tipp:st.tipp,erg:st.erg,weg:st.weg,schritte:st.schritte});
  let pos=F[start],offen={},wurf={},gesehen,timer=null,modus={},angesagt=false;
  const frei=f=>!!f&&(['gang','start','schild','ziel'].includes(f.typ)||(f.typ==='ast'&&!!st.tipp[wege[f.k].id])||(f.typ==='tor'&&!!offen[f.k]));
  const erkundet=k=>!!st.erg[wege[k].id];
  function nebel(){gesehen=new Set(F.filter(f=>['gang','start','schild','ziel'].includes(f.typ)||((f.typ==='ast'||f.typ==='tor')&&erkundet(f.k))).map(f=>f.i))}
  // Die Figur sieht ein Feld weit. Gänge anderer Wege bleiben im Nebel, sonst verrät das Ziel, welche Wege dorthin führen
  function sehe(f){const k=f.k??st.weg;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const n=at(f.x+dx,f.y+dy);
    if(n&&n.typ!=='hecke'&&!((n.typ==='ast'||n.typ==='tor')&&n.k!==k&&!erkundet(n.k)))gesehen.add(n.i)}}

  const feld=$('.lab-feld',box),svg=$('svg',feld),karte=$('[data-lab-karte]',box),figur=$('[data-lab-figur]',box),panel=$('[data-lab-panel]',box),ansageEl=$('[data-lab-ansage]',box);
  const cx=f=>f.x*T+T/2,cy=f=>f.y*T+T/2;
  const farbe=f=>(f.typ==='ast'||f.typ==='tor')&&erkundet(f.k)?' '+ERG[wege[f.k].erg][0]:'';
  function zeichneKarte(){
    const sicht=f=>f.typ!=='hecke'&&gesehen.has(f.i);let rand='',pfad='',deko='';
    F.forEach(f=>{if(!sicht(f))return;const x=cx(f),y=cy(f),c=farbe(f);
      if(f.typ!=='ziel'){rand+=`<rect x="${x-18}" y="${y-18}" width="36" height="36" rx="10"/>`;pfad+=`<rect class="lab-pfad${c}" x="${x-15}" y="${y-15}" width="30" height="30" rx="8"/>`}
      [[1,0],[0,1]].forEach(([dx,dy])=>{const n=at(f.x+dx,f.y+dy);if(!n||!sicht(n))return;const cc=c&&(farbe(n)===c||n.typ==='schild')?c:'';
        rand+=dx?`<rect x="${x}" y="${y-18}" width="${T}" height="36"/>`:`<rect x="${x-18}" y="${y}" width="36" height="${T}"/>`;
        pfad+=dx?`<rect class="lab-pfad${cc}" x="${x}" y="${y-15}" width="${T}" height="30"/>`:`<rect class="lab-pfad${cc}" x="${x-15}" y="${y}" width="30" height="${T}"/>`});
      if(f.typ==='start')deko+=`<text x="${x}" y="${y}" class="lab-start-t">Start</text>`;
      if(f.typ==='ast'&&!st.tipp[wege[f.k].id])deko+=`<g class="lab-zu"><circle cx="${x}" cy="${y}" r="11"/><text x="${x}" y="${y}">?</text></g>`;
      if(f.typ==='tor'&&!offen[f.k])deko+=`<g class="lab-tor">${[-9,0,9].map(d=>`<line x1="${x+d}" y1="${y-13}" x2="${x+d}" y2="${y+13}"/>`).join('')}<line x1="${x-14}" y1="${y-4}" x2="${x+14}" y2="${y-4}"/></g>`});
    // Ziel: Lichtung mit Foto
    if(zielF.length){const x0=Math.min(...zielF.map(f=>f.x))*T,y0=Math.min(...zielF.map(f=>f.y))*T,x1=(Math.max(...zielF.map(f=>f.x))+1)*T,y1=(Math.max(...zielF.map(f=>f.y))+1)*T,mx=(x0+x1)/2,my=(y0+y1)/2;
      rand+=`<rect x="${x0+2}" y="${y0+2}" width="${x1-x0-4}" height="${y1-y0-4}" rx="18"/>`;pfad+=`<rect class="lab-pfad" x="${x0+5}" y="${y0+5}" width="${x1-x0-10}" height="${y1-y0-10}" rx="15"/>`;
      const bild=def.ziel?.bild,geschafft=wege.some(w=>st.erg[w.id]==='ziel'||st.erg[w.id]==='ja');
      deko+=bild?`<image href="${bild.src}" x="${mx-30}" y="${my-30}" width="60" height="60" preserveAspectRatio="xMidYMid slice" clip-path="url(#${def.id}-clip)"/>`:'';
      deko+=`<circle cx="${mx}" cy="${my}" r="30" class="lab-ziel-ring${geschafft?' erreicht':''}"/>`}
    wege.forEach((w,k)=>{const s=schild[k];if(!s)return;
      if(erkundet(k)&&w.erg==='sackgasse'){const e=ende[k],x=cx(e),y=cy(e);deko+=`<g class="lab-x"><line x1="${x-9}" y1="${y-9}" x2="${x+9}" y2="${y+9}"/><line x1="${x+9}" y1="${y-9}" x2="${x-9}" y2="${y+9}"/></g>`}
      deko+=`<g class="lab-schild${erkundet(k)?' '+ERG[w.erg][0]:''}${k===st.weg?' aktiv':''}"><circle cx="${cx(s)}" cy="${cy(s)}" r="17"/><text x="${cx(s)}" y="${cy(s)}">${k+1}</text></g>`});
    karte.innerHTML=`<g class="lab-rand">${rand}</g>${pfad}${deko}`;
  }
  function setze(f,springen){
    const t=`translate(${cx(f)}px,${cy(f)}px)`;
    if(springen){figur.classList.add('springt');figur.style.transform=t;void figur.getBoundingClientRect();requestAnimationFrame(()=>requestAnimationFrame(()=>figur.classList.remove('springt')))}
    else figur.style.transform=t;
  }
  function stoss(){const fi=$('.lab-figur-in',figur);fi.classList.remove('stoss');void fi.getBoundingClientRect();fi.classList.add('stoss');ansage('Hecke. Hier geht es nicht weiter.')}
  function ansage(t){angesagt=true;ansageEl.textContent='';requestAnimationFrame(()=>{ansageEl.textContent=t})}
  const ortText=()=>{const r=nachbarn(pos).map(([r])=>r);return `${pos.typ==='schild'?`Kreuzung ${pos.k+1}`:pos.typ==='start'?'Start':'Gang'}. Frei: ${r.join(', ')||'nichts'}.`};
  // Bei einer Entscheidung: Tastaturnutzer springen ins Panel, alle anderen sehen es (Handy: hinscrollen)
  function fokusPanel(){
    if(box.contains(document.activeElement)&&document.activeElement!==document.body){$('button',panel)?.focus();return}
    const r=panel.getBoundingClientRect();if(r.top>innerHeight-60||r.bottom<60)panel.scrollIntoView({block:'nearest',behavior:ruhig()?'auto':'smooth'});
  }
  const zurFigur=()=>feld.focus({preventScroll:true});

  /* ---------- Panel ---------- */
  const tippFb=w=>{const t=st.tipp[w.id];return !t?'':t===w.erg?'Gut eingeschätzt!':`Du hattest „${namen[t]}“ getippt.`};
  const ergebnisHTML=w=>{const [k,ic]=ERG[w.erg];return `<div class="fb ${k}"><p><span class="ms sm">${ic}</span> <b>${namen[w.erg]}.</b> ${tippFb(w)}</p><p>${w.e}</p></div>`};
  const kopfHTML=k=>`<p class="aufgabe-kopf"><span class="ms sm">${wege[k].icon}</span>Weg ${k+1}: ${wege[k].titel}</p>`;
  const knopf=(attr,ic,t)=>`<div class="row"><button class="btn small primary" type="button" ${attr}><span class="ms">${ic}</span>${t}</button></div>`;
  function panelStart(){modus={art:'start'};
    panel.innerHTML=`<p class="aufgabe-kopf"><span class="ms sm">explore</span>So spielst du</p><p class="small">Lauf mit deiner Figur zu einer der ${wege.length} Kreuzungen. Dort erfährst du, was auf diesem Weg passiert. Schätze zuerst, wohin er führt. Dann lauf ihn ab: Endet er im Ziel, steckst du in einer Sackgasse fest – oder entscheidet an einem Tor der Würfel?</p>`}
  function zeigeWeg(k,hinweis,j){
    const w=wege[k],t=st.tipp[w.id];modus={art:'weg',k,j};
    let s=kopfHTML(k)+`<div class="wc-material">${w.text}</div>`+(hinweis?`<div class="fb amb">${hinweis}</div>`:'');
    if(!t)s+=`<p class="aufgabe-frage">Was schätzt du: Wohin führt dieser Weg?</p><div class="navi-antw" role="group" aria-label="Deine Einschätzung">${Object.keys(ERG).map(x=>`<button class="btn small" type="button" data-lab-tipp="${x}"><span class="ms">${ERG[x][1]}</span>${namen[x]}</button>`).join('')}</div>`;
    else if(j!=null)s+=`<div class="lab-unterwegs"><span class="ms sm">directions_walk</span><span>${w.unterwegs[j]}</span></div>`;
    else if(erkundet(k))s+=ergebnisHTML(w)+`<p class="small muted">Du kannst den Weg noch einmal ablaufen.</p>`;
    else s+=`<p class="small">Dein Tipp: <b>${namen[t]}</b>. Lauf den Weg entlang und finde heraus, ob du recht hast!</p>`;
    panel.innerHTML=s;
    $$('[data-lab-tipp]',panel).forEach(bt=>bt.addEventListener('click',()=>{st.tipp[w.id]=bt.dataset.labTipp;st.weg=k;sichern();zeichneKarte();zeigeWeg(k);zeichneStand();
      ansage(`Dein Tipp: ${namen[st.tipp[w.id]]}. Der Weg ist frei.`);zurFigur()}));
  }
  function sackgasse(k){const w=wege[k];st.erg[w.id]='sackgasse';modus={art:'sackgasse',k};
    panel.innerHTML=kopfHTML(k)+`<div class="fb bad"><p><span class="ms sm">block</span> <b>Sackgasse! Du steckst fest.</b> ${tippFb(w)}</p><p>${w.e}</p></div>`+knopf('data-lab-zurueck','undo','Zurück zur Kreuzung');
    $('[data-lab-zurueck]',panel).addEventListener('click',()=>{springe(schild[k]);zurFigur()});
    ansage('Sackgasse! Du steckst fest.');fokusPanel();
  }
  function wurfHTML(k,n){const w=wege[k],wf=w.wuerfel||{};
    return n>=ja?`<div class="fb ok"><p><span class="ms sm">lock_open</span> <b>${n} – Ja!</b> ${wf.ja||''}</p><p>Das Tor ist offen. Lauf weiter ins Ziel!</p></div>`
      :`<div class="fb bad"><p><span class="ms sm">lock</span> <b>${n} – Nein.</b> ${wf.nein||''}</p></div>${ergebnisHTML(w)}`+knopf('data-lab-zurueck','undo','Zurück zur Kreuzung')}
  function wuerfelPanel(k){const w=wege[k],n=wurf[k];modus={art:'wuerfel',k};st.weg=k;
    panel.innerHTML=kopfHTML(k)+`<div class="lab-wurf"><div data-lab-wuerfel>${wuerfelHTML(n||5,!n)}</div><div class="stack lab-info"><p><b>${namen.glueck}!</b> ${w.wuerfel?.frage||''}</p><p class="small muted">Der Würfel entscheidet: Bei ${ja} oder mehr Augen heißt es Ja.</p></div></div>`
      +(n?wurfHTML(k,n):knopf('data-lab-wuerfeln','casino','Würfeln'));
    $('[data-lab-zurueck]',panel)?.addEventListener('click',()=>{springe(schild[k]);zurFigur()});
    $('[data-lab-wuerfeln]',panel)?.addEventListener('click',e=>{e.currentTarget.disabled=true;
      const z=1+Math.floor(Math.random()*6),el=$('[data-lab-wuerfel]',panel);
      const fertig=()=>{wurf[k]=z;st.erg[w.id]=z>=ja?'ja':'nein';if(z>=ja)offen[k]=true;sichern();zeichneKarte();zeichneStand();wuerfelPanel(k);
        ansage(z>=ja?`${z}. Ja! Das Tor ist offen.`:`${z}. Nein.`);if(z>=ja)zurFigur();else $('[data-lab-zurueck]',panel)?.focus({preventScroll:true})};
      if(ruhig())return fertig();
      let i=0;const t=setInterval(()=>{el.innerHTML=wuerfelHTML(1+Math.floor(Math.random()*6));el.firstElementChild.classList.add('rollt');if(++i>=8){clearInterval(t);fertig()}},70);
    });
    ansage(`${namen.glueck}! ${w.wuerfel?.frage||''}`);fokusPanel();
  }
  function imZiel(){const k=st.weg,w=wege[k];modus={art:'ziel'};
    if(w&&w.erg==='ziel')st.erg[w.id]='ziel';sichern();zeichneKarte();
    panel.innerHTML=`<p class="aufgabe-kopf"><span class="ms sm">flag</span>Ziel erreicht</p><div class="fb ok"><p><b>Geschafft!</b> ${def.ziel?.text||''}</p></div>${w?ergebnisHTML(w):''}`+knopf('data-lab-start','replay','Zurück zum Start');
    $('[data-lab-start]',panel).addEventListener('click',()=>{offen={};wurf={};springe(F[start]);panelStart();zurFigur()});
    ansage('Geschafft! Ziel erreicht.');fokusPanel();
  }

  /* ---------- Laufen ---------- */
  function ankommen(f){
    if(f.typ==='schild'){st.weg=f.k;zeigeWeg(f.k);ansage(`Kreuzung ${f.k+1}: ${wege[f.k].titel}`);if(!st.tipp[wege[f.k].id])fokusPanel();return false}
    if(f.typ==='ziel'){imZiel();return false}
    if(f.typ==='ast'||f.typ==='tor'){const k=f.k,w=wege[k];st.weg=k;
      if(f.typ==='ast'&&w.unterwegs?.length){const j=Math.min(w.unterwegs.length-1,Math.floor((abst.get(f.i)-1)*w.unterwegs.length/laenge[k]));
        if(modus.art!=='weg'||modus.k!==k||modus.j!==j){zeigeWeg(k,null,j);ansage(w.unterwegs[j])}}
      if(w.erg==='sackgasse'&&f===ende[k]){sackgasse(k);return false}
      const t=tor[k];if(t&&!offen[k]&&Math.abs(t.x-f.x)+Math.abs(t.y-f.y)===1){wuerfelPanel(k);return false}
    }
    return true;
  }
  function schritt(r){
    const [dx,dy]=RICHT[r],n=at(pos.x+dx,pos.y+dy);
    if(!n||n.typ==='hecke'){stoss();return false}
    if(n.typ==='ast'&&!st.tipp[wege[n.k].id]){zeigeWeg(n.k,'Erst schätzen, dann laufen: Wohin führt dieser Weg?');ansage('Erst schätzen, dann laufen.');fokusPanel();return false}
    if(n.typ==='tor'&&!offen[n.k]){wuerfelPanel(n.k);return false}
    pos=n;st.schritte++;setze(n);sehe(n);zeichneKarte();
    return ankommen(n);
  }
  function halt(){clearTimeout(timer);timer=null}
  function fertigGelaufen(){zeichneKarte();zeichneStand();if(!angesagt)ansage(ortText())}
  // weit = bis zur nächsten Kreuzung: Ecken werden mitgenommen, an Abzweigungen und Ereignissen hält die Figur
  function laufe(r,weit){halt();angesagt=false;
    const weiter=()=>{
      if(!schritt(r)||!weit)return fertigGelaufen();
      const aus=nachbarn(pos).filter(([rr])=>rr!==GEGEN[r]);
      if(aus.length!==1)return fertigGelaufen();
      r=aus[0][0];timer=setTimeout(weiter,ruhig()?0:TEMPO)};
    weiter();
  }
  // Antippen: kürzester Weg über begehbare Felder; das Zielfeld selbst darf gesperrt sein (dann kommt die Meldung)
  function geheZu(z){
    if(!z||z.typ==='hecke'||!gesehen.has(z.i)||z===pos)return;
    const vor=new Map([[pos.i,null]]),q=[pos];
    while(q.length){const f=q.shift();if(f===z)break;if(f!==pos&&(f.typ==='ziel'))continue;
      for(const [r,n] of nachbarn(f))if(!vor.has(n.i)&&(n===z||frei(n))){vor.set(n.i,[f,r]);q.push(n)}}
    if(!vor.has(z.i))return ansage('Dorthin führt kein freier Weg.');
    const pfad=[];for(let f=z;vor.get(f.i);f=vor.get(f.i)[0])pfad.unshift(vor.get(f.i)[1]);
    halt();angesagt=false;let i=0;
    const weiter=()=>{if(i>=pfad.length||!schritt(pfad[i++]))return fertigGelaufen();timer=setTimeout(weiter,ruhig()?0:TEMPO)};
    weiter();
  }
  function springe(f){halt();pos=f;setze(f,true);sehe(f);zeichneKarte();ankommen(f);zeichneStand()}

  /* ---------- Stand und Wegeliste ---------- */
  function zeichneStand(){
    const n=wege.filter((w,k)=>erkundet(k)).length,richtig=wege.filter(w=>st.tipp[w.id]===w.erg&&st.erg[w.id]).length;
    $('[data-lab-stand]',box).textContent=`${n} von ${wege.length} Wegen erkundet · ${st.schritte} ${st.schritte===1?'Schritt':'Schritte'}`;
    $$('[data-lab-weg]',box).forEach(bt=>{const k=+bt.dataset.labWeg,w=wege[k];bt.classList.toggle('geloest',erkundet(k));
      if(k===st.weg)bt.setAttribute('aria-current','true');else bt.removeAttribute('aria-current');
      $('[data-status]',bt).innerHTML=erkundet(k)?`<span class="ms sm">${ERG[w.erg][1]}</span>${namen[w.erg]}`:st.tipp[w.id]?'Tipp abgegeben':'noch offen'});
    $('[data-lab-fertig]',box).innerHTML=n===wege.length?`<div class="fb ok"><span class="ms sm">workspace_premium</span> <b>Mission erfüllt!</b> Du hast ${richtig} von ${n} Wegen richtig eingeschätzt. ${def.fertig?def.fertig(richtig,n):''}</div>`:'';
    sichern();
  }

  /* ---------- Steuerung ---------- */
  feld.addEventListener('keydown',e=>{if(e.altKey||e.ctrlKey||e.metaKey)return;const r=TASTE[e.key.length===1?e.key.toLowerCase():e.key];if(!r)return;e.preventDefault();laufe(r,e.shiftKey)});
  let p0=null;
  feld.addEventListener('pointerdown',e=>{p0={x:e.clientX,y:e.clientY};try{feld.setPointerCapture(e.pointerId)}catch(x){}});
  feld.addEventListener('pointercancel',()=>{p0=null});
  feld.addEventListener('pointerup',e=>{if(!p0)return;const dx=e.clientX-p0.x,dy=e.clientY-p0.y;p0=null;
    if(Math.max(Math.abs(dx),Math.abs(dy))>24)return laufe(Math.abs(dx)>Math.abs(dy)?(dx>0?'rechts':'links'):(dy>0?'runter':'hoch'),true);
    const r=svg.getBoundingClientRect();geheZu(at(Math.floor((e.clientX-r.left)/r.width*b),Math.floor((e.clientY-r.top)/r.height*h)))});
  $$('[data-lab-dir]',box).forEach(bt=>bt.addEventListener('click',()=>laufe(bt.dataset.labDir,true)));
  $$('[data-lab-weg]',box).forEach(bt=>bt.addEventListener('click',()=>{springe(schild[+bt.dataset.labWeg]);fokusPanel()}));
  $('[data-lab-neu]',box).addEventListener('click',()=>{halt();st={tipp:{},erg:{},schritte:0};offen={};wurf={};nebel();pos=F[start];setze(pos,true);sehe(pos);zeichneKarte();panelStart();zeichneStand();ansage('Neue Mission. Du stehst am Start.')});

  nebel();sehe(pos);setze(pos,true);zeichneKarte();panelStart();zeichneStand();
}
