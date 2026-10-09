// Aufgaben-Bausteine für alle Themen: Schreibfeld „an die Wand“, Zuordnen, Lückentext, Test mit einem Versuch,
// Wissenscheck, gestufte Hilfen und Gesprächsimpuls. Jede Funktion liefert HTML für die html()-Funktion einer Werkstatt.
// werkstatt.js ruft danach bindAufgaben(root) auf. Lösungen und Erwartungshorizont stehen nur im Lehrerpanel
// (siehe lernraum.js, AUFGABEN). Einzige Ausnahme ist der Wissenscheck: Er zeigt den Erwartungshorizont,
// aber erst nach der eigenen Antwort.
//
//   schreibfeld({id, frage, anfaenge:[…], tipp, denkWeiter, erwartung:[…]})
//   zuordnen({id, frage, faecher:[{id, t}], karten:[{t, f, e}], klasse})  f = id des richtigen Fachs, e = Erklärung nach dem Prüfen,
//                                                                        klasse = eigenes Layout aus der CSS des Themas (z. B. ein Haus)
//   lueckentext({id, titel, saetze:['Text mit [Lösung|Alternative] …']})
//   test({id, titel, fragen:[{f, o:[…], r, e}]})                       r = Index der richtigen Option, e = Erklärung
//   wissenscheck({id, titel, thema, stufe, aufgaben:[…]})              ein Wissenscheck pro Thema, siehe unten
//   blitz({id, titel, werkstatt, optionen, karten, verdeckt}), blitzAufloesung(def)   Bauchgefühl-Karten, siehe unten
//   pruefschema({id, titel, schema, beispiel}), fallakte({id, titel, schema, faelle})  Rechts-Navi und Fälle, siehe unten
//   abstimmung({id, titel, fall, frage, optionen, r, e})               „Ihr seid das Gericht“: Live-Abstimmung im Lernraum
//   hilfen({tipp, denkWeiter}), impuls(text)
//
// id: Kleinbuchstaben, Ziffern, Bindestrich (max. 40 Zeichen), eindeutig im Thema. Texte in frage, tipp usw. dürfen HTML enthalten.
import { $, $$, esc, store, kopieren } from './ui.js';
import { raum, registriere } from './lernraum.js';
import { OPERATOREN, textFeedback, zahl, zahlFeedback } from './feedback.js';

const key=(art,id)=>`${raum.speicher()}-${art}-${id}`;
const kopf=(icon,text)=>`<p class="aufgabe-kopf"><span class="ms sm">${icon}</span>${text}</p>`;

export function hilfen({tipp,denkWeiter}={}){
  if(!tipp&&!denkWeiter)return '';
  return `<div class="hilfen">${tipp?`<details class="hilfe"><summary><span class="ms sm">help</span>Tipp</summary><p class="small">${tipp}</p></details>`:''}${denkWeiter?`<details class="hilfe pro"><summary><span class="ms sm">psychology</span>Denk weiter</summary><p class="small">${denkWeiter}</p></details>`:''}</div>`;
}
export function impuls(text){return `<p class="impuls"><span class="ms">forum</span><span><b>Mit der Klasse:</b> ${text}</span></p>`}

/* ---------- Schreibfeld „an die Wand“ ---------- */
export function schreibfeld({id,frage,anfaenge,tipp,denkWeiter,erwartung}){
  registriere({id,frage,loesung:erwartung||[],wand:true});
  return `<section class="aufgabe" data-schreib="${id}">${kopf('edit_note','An die Wand')}
  <p class="aufgabe-frage">${frage}</p>
  ${anfaenge&&anfaenge.length?`<details class="hilfe"><summary><span class="ms sm">format_quote</span>So kannst du anfangen</summary><ul class="small">${anfaenge.map(a=>`<li>${a}</li>`).join('')}</ul></details>`:''}
  <div class="stack" data-schreib-eingabe><label class="small" for="sf-${id}">Deine Antwort in ganzen Sätzen</label>
    <textarea id="sf-${id}" rows="4" maxlength="1000"></textarea>
    <div class="row"><button class="btn primary small" type="button" data-schreib-senden hidden><span class="ms">send</span>Abschicken</button><span class="small muted" data-schreib-status role="status"></span></div></div>
  <div class="stack" data-wand hidden></div>
  ${hilfen({tipp,denkWeiter})}</section>`;
}
const wandOffen=new Map();
function aktualisiereSchreibfeld(box){
  const id=box.dataset.schreib,ein=$('[data-schreib-eingabe]',box),wand=$('[data-wand]',box);
  if(raum.istLehrkraft()){
    ein.hidden=true;wand.hidden=false;
    const liste=raum.zustand().antworten.filter(a=>a.aufgabe===id),offen=!!wandOffen.get(id),namen=!raum.beamer();
    wand.innerHTML=`<div class="row" style="justify-content:space-between"><p class="title-s">An der Wand <span class="pill neu num" data-wand-n>${liste.length}</span></p>
      <button class="btn small" type="button" data-wand-zeigen aria-pressed="${offen}">${offen?'Antworten verbergen':'Antworten zeigen'}</button></div>
      ${offen?(liste.length?`<div class="wand-grid">${liste.map(a=>`<article class="wand-karte"><p>${esc(a.text)}</p>${namen?`<span class="small muted">${esc(raum.name(a.uid))}</span>`:''}</article>`).join('')}</div>`:'<p class="small muted">Noch keine Antworten.</p>'):''}`;
    $('[data-wand-zeigen]',wand).addEventListener('click',()=>{wandOffen.set(id,!offen);aktualisiereSchreibfeld(box)});
    return;
  }
  ein.hidden=false;wand.hidden=true;
  const btn=$('[data-schreib-senden]',box),st=$('[data-schreib-status]',box),text=$('textarea',box).value.trim(),gesendet=raum.gesendet(id);
  if(!raum.istSchueler()){btn.hidden=true;st.textContent='Ab ins Heft. Läuft ein Lernraum, schickst du deine Antwort mit „Abschicken“ an die Wand.';return}
  btn.hidden=false;
  btn.innerHTML=gesendet!=null?'<span class="ms">send</span>Erneut abschicken':'<span class="ms">send</span>Abschicken';
  st.textContent=gesendet==null?'':gesendet===text?'An der Wand. Du kannst sie noch ändern und erneut abschicken.':'Geändert – noch nicht abgeschickt.';
}
function bindSchreibfeld(box){
  const id=box.dataset.schreib,ta=$('textarea',box),btn=$('[data-schreib-senden]',box),st=$('[data-schreib-status]',box);
  ta.value=store(key('sf',id))||'';
  let t=null;
  ta.addEventListener('input',()=>{clearTimeout(t);t=setTimeout(()=>{store(key('sf',id),ta.value);aktualisiereSchreibfeld(box)},300)});
  btn.addEventListener('click',async()=>{
    const text=ta.value.trim();store(key('sf',id),ta.value);
    if(!text){st.textContent='Schreib zuerst eine Antwort.';return}
    btn.disabled=true;
    try{await raum.sendeAntwort(id,text)}catch(e){console.warn(e);st.textContent='Abschicken hat nicht geklappt. Bist du noch im Lernraum?'}
    finally{btn.disabled=false}
    aktualisiereSchreibfeld(box);
  });
  aktualisiereSchreibfeld(box);
}
raum.on(art=>{if(art!=='raum')$$('[data-schreib]').forEach(aktualisiereSchreibfeld)});

/* ---------- Zuordnen (Antippen oder Ziehen) ---------- */
export function zuordnen({id,frage,faecher,karten,klasse}){
  registriere({id,frage,loesung:faecher.map(f=>`<b>${f.t}:</b> ${karten.filter(k=>k.f===f.id).map(k=>k.t).join(' · ')}`)});
  const erkl=karten.some(k=>k.e)?`<details class="hilfe" data-zu-warum hidden><summary><span class="ms sm">help</span>Warum? Die Lösung mit Erklärung</summary><ul class="small">${karten.map(k=>`<li><b>${k.t}</b> → ${faecher.find(f=>f.id===k.f).t}${k.e?`: ${k.e}`:''}</li>`).join('')}</ul></details>`:'';
  return `<section class="aufgabe${klasse?' '+klasse:''}" data-zuordnen="${id}" data-karten="${esc(JSON.stringify(karten.map(k=>k.f)))}">${kopf('category','Zuordnen')}
  <p class="aufgabe-frage">${frage}</p>
  <p class="small muted">Tippe eine Karte an und dann das passende Fach – oder zieh die Karte hinein.</p>
  <div class="zu-fach zu-pool" data-fach=""><button class="zu-ziel" type="button" data-ziel="">Noch nicht zugeordnet</button><div class="zu-inhalt">${karten.map((k,i)=>`<button class="zu-karte" type="button" draggable="true" data-k="${i}" aria-pressed="false">${k.t}</button>`).join('')}</div></div>
  <div class="zu-faecher">${faecher.map(f=>`<div class="zu-fach" data-fach="${esc(f.id)}"><button class="zu-ziel" type="button" data-ziel="${esc(f.id)}">${f.t}</button><div class="zu-inhalt"></div></div>`).join('')}</div>
  <div class="row"><button class="btn primary small" type="button" data-pruefen><span class="ms">task_alt</span>Prüfen</button><button class="btn small" type="button" data-neu><span class="ms">restart_alt</span>Neu</button><span class="small" data-ergebnis role="status"></span></div>${erkl}</section>`;
}
function bindZuordnen(box){
  const id=box.dataset.zuordnen,soll=JSON.parse(box.dataset.karten),karten=$$('.zu-karte',box);
  let lage=store(key('zu',id))||{},gewaehlt=null;
  const fachEl=f=>$(`.zu-fach[data-fach="${CSS.escape(f)}"] .zu-inhalt`,box);
  const zeichne=geprueft=>{
    karten.forEach(k=>{const f=lage[k.dataset.k]||'';const ziel=fachEl(f)||fachEl('');if(k.parentElement!==ziel)ziel.append(k);
      k.setAttribute('aria-pressed',String(gewaehlt===k));k.classList.remove('right','wrong');
      if(geprueft&&f){k.classList.add(soll[k.dataset.k]===f?'right':'wrong')}});
    store(key('zu',id),lage);
  };
  const lege=(k,f)=>{lage[k.dataset.k]=f;gewaehlt=null;$('[data-ergebnis]',box).textContent='';zeichne(false)};
  karten.forEach(k=>{
    k.addEventListener('click',()=>{gewaehlt=gewaehlt===k?null:k;zeichne(false)});
    k.addEventListener('dragstart',e=>{e.dataTransfer.setData('text/plain',k.dataset.k);e.dataTransfer.effectAllowed='move'});
  });
  $$('.zu-fach',box).forEach(f=>{
    $('.zu-ziel',f).addEventListener('click',()=>{if(gewaehlt)lege(gewaehlt,f.dataset.fach)});
    f.addEventListener('dragover',e=>{e.preventDefault();f.classList.add('ueber')});
    f.addEventListener('dragleave',()=>f.classList.remove('ueber'));
    f.addEventListener('drop',e=>{e.preventDefault();f.classList.remove('ueber');const k=karten[+e.dataTransfer.getData('text/plain')];if(k)lege(k,f.dataset.fach)});
  });
  $('[data-pruefen]',box).addEventListener('click',()=>{
    const gelegt=karten.filter(k=>lage[k.dataset.k]),ok=gelegt.filter(k=>soll[k.dataset.k]===lage[k.dataset.k]).length,offen=karten.length-gelegt.length;
    zeichne(true);const warum=$('[data-zu-warum]',box);if(warum&&!offen)warum.hidden=false;
    $('[data-ergebnis]',box).textContent=`${ok} von ${karten.length} richtig${offen?` – ${offen} noch nicht zugeordnet`:ok===karten.length?' – stark!':' – rot markierte Karten noch einmal verschieben.'}`;
  });
  $('[data-neu]',box).addEventListener('click',()=>{lage={};gewaehlt=null;$('[data-ergebnis]',box).textContent='';zeichne(false)});
  zeichne(false);
}

/* ---------- Lückentext für den Hefteintrag ---------- */
const LUECKE=/\[([^\]]+)\]/g;
export function lueckentext({id,titel,saetze}){
  const loesungen=[];saetze.forEach(s=>s.replace(LUECKE,(_,l)=>{loesungen.push(l.split('|'));return ''}));
  registriere({id,frage:titel,loesung:saetze.map(s=>s.replace(LUECKE,(_,l)=>`<b>${l.split('|')[0]}</b>`))});
  let i=0;
  const woerter=[...new Set(loesungen.map(l=>l[0]))].sort((a,b)=>a.localeCompare(b,'de'));
  return `<section class="aufgabe" data-luecken="${id}" data-loesungen="${esc(JSON.stringify(loesungen))}">${kopf('edit','Ins Heft')}
  <p class="aufgabe-frage">${titel}</p>
  <div class="lt-text">${saetze.map(s=>`<p>${s.replace(LUECKE,(_,l)=>{const n=i++;return `<input class="lt-luecke" type="text" data-i="${n}" aria-label="Lücke ${n+1}" size="${Math.max(6,l.split('|')[0].length+2)}" autocomplete="off" spellcheck="false">`})}</p>`).join('')}</div>
  <details class="hilfe"><summary><span class="ms sm">help</span>Wörter zur Auswahl</summary><p class="small">${woerter.map(esc).join(' · ')}</p></details>
  <div class="row"><button class="btn primary small" type="button" data-pruefen><span class="ms">task_alt</span>Prüfen</button><button class="btn small" type="button" data-zeigen hidden><span class="ms">visibility</span>Lösungen zeigen</button><span class="small" data-ergebnis role="status"></span></div></section>`;
}
function bindLuecken(box){
  const id=box.dataset.luecken,loes=JSON.parse(box.dataset.loesungen),felder=$$('.lt-luecke',box);
  const norm=t=>String(t).trim().toLowerCase().replace(/\s+/g,' ');
  const werte=store(key('lt',id))||[];
  felder.forEach((f,i)=>{f.value=werte[i]||'';f.addEventListener('input',()=>{f.classList.remove('right','wrong');werte[i]=f.value;store(key('lt',id),werte)})});
  $('[data-pruefen]',box).addEventListener('click',()=>{
    let ok=0;felder.forEach((f,i)=>{const r=loes[i].some(l=>norm(l)===norm(f.value));if(r)ok++;f.classList.toggle('right',r);f.classList.toggle('wrong',!r)});
    $('[data-ergebnis]',box).textContent=`${ok} von ${felder.length} richtig`;$('[data-zeigen]',box).hidden=ok===felder.length;
  });
  $('[data-zeigen]',box).addEventListener('click',()=>{felder.forEach((f,i)=>{f.value=loes[i][0];werte[i]=f.value;f.classList.remove('wrong');f.classList.add('right')});store(key('lt',id),werte);$('[data-ergebnis]',box).textContent='Lösungen eingetragen – jetzt ins Heft übernehmen.';$('[data-zeigen]',box).hidden=true});
}

/* ---------- Test mit einem Versuch ---------- */
export function test({id,titel,fragen}){
  registriere({id,frage:titel,loesung:fragen.map((q,i)=>`${i+1}. ${q.f} – <b>${q.o[q.r]}</b>`)});
  return `<section class="aufgabe" data-test="${id}" data-richtig="${esc(JSON.stringify(fragen.map(q=>q.r)))}">${kopf('quiz','Test · ein Versuch')}
  <p class="aufgabe-frage">${titel}</p>
  <ol class="test-fragen">${fragen.map((q,i)=>`<li><fieldset><legend>${i+1}. ${q.f}</legend>${q.o.map((o,j)=>`<label class="test-opt"><input type="radio" name="t-${id}-${i}" value="${j}"><span>${o}</span></label>`).join('')}</fieldset><p class="small test-erkl" hidden>${q.e||''}</p></li>`).join('')}</ol>
  <div class="row"><button class="btn primary small" type="button" data-pruefen disabled><span class="ms">task_alt</span>Prüfen</button><button class="btn small" type="button" data-neu hidden><span class="ms">restart_alt</span>Noch einmal</button><span class="small" data-ergebnis role="status"></span></div></section>`;
}
function bindTest(box){
  const id=box.dataset.test,richtig=JSON.parse(box.dataset.richtig),gruppen=$$('fieldset',box),pr=$('[data-pruefen]',box);
  let st=store(key('test',id))||{a:[],fertig:false};
  const wahl=()=>gruppen.map(g=>{const r=$('input:checked',g);return r?+r.value:null});
  const zeichne=()=>{
    gruppen.forEach((g,i)=>{$$('input',g).forEach(r=>{r.checked=st.a[i]===+r.value;r.disabled=st.fertig;const l=r.closest('.test-opt');l.classList.remove('right','wrong');
      if(st.fertig){if(+r.value===richtig[i])l.classList.add('right');else if(r.checked)l.classList.add('wrong')}});
      g.nextElementSibling.hidden=!st.fertig||!g.nextElementSibling.textContent});
    pr.disabled=st.fertig||st.a.length<gruppen.length||st.a.some(x=>x==null);pr.hidden=st.fertig;$('[data-neu]',box).hidden=!st.fertig;
    const ok=st.a.filter((x,i)=>x===richtig[i]).length;$('[data-ergebnis]',box).textContent=st.fertig?`${ok} von ${gruppen.length} richtig`:'';
    store(key('test',id),st);
  };
  box.addEventListener('change',()=>{if(st.fertig)return;st.a=wahl();zeichne()});
  pr.addEventListener('click',()=>{st.fertig=true;zeichne()});
  $('[data-neu]',box).addEventListener('click',()=>{st={a:[],fertig:false};zeichne()});
  zeichne();
}

/* ---------- Wissenscheck ----------
   Abschluss eines Themas: Aufgaben in drei Stufen (Anforderungsbereiche I–III), Erwartungshorizont erst nach der
   eigenen Antwort, Feedback ohne KI (feedback.js), Auswertung pro Stufe. Im Lernraum gehen die Punkte (keine Texte)
   an die Lehrkraft; mit einem AIS.chat-Link der Lehrkraft gibt es bei offenen Aufgaben den Knopf „KI-Coach“.
   aufgaben: [{afb: 1|2|3, art, f: Frage, material?, p?: Punkte, werkstatt?: id zum Wiederholen, e?: Erklärung}]
     wahl:          o:[…], r: Index,      fehler?: {Index: 'Warum diese Antwort nicht stimmt'}
     mehrfach:      o:[…], r:[Indizes],   fehler?: {Index: '…'}
     richtigfalsch: r: true|false
     zahl:          r: Zahl, tol?, einheit?, fehler?: [{wert, text}]   typische Rechenfehler
     reihe:         schritte:[… in richtiger Reihenfolge]
     zuordnen:      faecher:[{id, t}], karten:[{t, f, werkstatt?}]
     offen:         op: Operator (siehe feedback.js), erwartung:[{t, w, tipp}], muster?, anfaenge?:[…]
   Punkte: p, sonst bei offenen Aufgaben die Zahl der erwarteten Punkte, sonst die Stufe (I = 1, II = 2, III = 3). */
const STUFEN={1:{name:'Grundlagen',afb:'Anforderungsbereich I',was:'Wissen wiedergeben: nennen, beschreiben, zuordnen.'},
  2:{name:'Anwenden',afb:'Anforderungsbereich II',was:'Zusammenhänge erklären, rechnen und auf neue Fälle übertragen.'},
  3:{name:'Beurteilen',afb:'Anforderungsbereich III',was:'Aussagen und Maßnahmen prüfen und begründet urteilen.'}};
const ARTEN={wahl:['radio_button_checked','Auswahl'],mehrfach:['check_box','Mehrfachauswahl'],richtigfalsch:['rule','Richtig oder falsch'],
  zahl:['calculate','Rechnen'],reihe:['format_list_numbered','Reihenfolge'],zuordnen:['category','Zuordnen'],offen:['edit_note','Offene Aufgabe']};
const CHECKS=new Map(), ERGEBNIS=new Map();
const punkteVon=a=>a.p??(a.art==='offen'?a.erwartung.length:a.afb);
const fmtP=x=>String(Math.round(x*2)/2).replace('.',',');
const plain=html=>{const d=document.createElement('div');d.innerHTML=html;return d.textContent.replace(/\s+/g,' ').trim()};
const streuwert=s=>{let h=2166136261;for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0};
// Feste Mischung pro Frage: gleich nach jedem Neuladen, aber nicht in der Reihenfolge der Lösung
function mischen(n,seed){const idx=[...Array(n).keys()];let s=seed||1;for(let i=n-1;i>0;i--){s=Math.imul(s^(s>>>15),2246822507)>>>0;const j=s%(i+1);[idx[i],idx[j]]=[idx[j],idx[i]]}
  return n>1&&idx.every((x,i)=>x===i)?[...idx.slice(1),idx[0]]:idx}

function loesungHTML(a){
  switch(a.art){
    case 'wahl':return `<b>${a.o[a.r]}</b>`;
    case 'mehrfach':return `Richtig sind: ${a.r.map(j=>`<b>${a.o[j]}</b>`).join(' · ')}`;
    case 'richtigfalsch':return `Die Aussage ist <b>${a.r?'richtig':'falsch'}</b>.`;
    case 'zahl':return `<b>${fmtZahl(a.r)}${a.einheit?' '+a.einheit:''}</b>`;
    case 'reihe':return `<ol>${a.schritte.map(s=>`<li>${s}</li>`).join('')}</ol>`;
    case 'zuordnen':return a.faecher.map(f=>`<b>${f.t}:</b> ${a.karten.filter(k=>k.f===f.id).map(k=>k.t).join(' · ')}`).join('<br>');
    case 'offen':return `<ul>${a.erwartung.map(e=>`<li>${e.t}</li>`).join('')}</ul>`;
  }
}
const fmtZahl=x=>String(x).replace('.',',');

function kiAnweisung(def){
  const offen=def.aufgaben.map((a,i)=>({a,i})).filter(x=>x.a.art==='offen');
  return [`Du bist ein freundlicher Feedback-Coach für Schüler der Klasse ${def.stufe||11} im Fach Wirtschaft und Recht in Thüringen. Thema: ${def.thema||def.titel}.`,
    'Die Schüler schicken dir ihre Antwort auf eine offene Aufgabe aus dem Wissenscheck. Am Anfang steht die Nummer der Aufgabe.','',
    'So gibst du Feedback:',
    '- Sprich die Schüler mit „du“ an. Schreib kurz, klar und ermutigend, höchstens 120 Wörter.',
    '- Nenne zuerst, was schon gelungen ist.',
    '- Nenne dann höchstens zwei Punkte, die noch fehlen oder ungenau sind, als Frage oder Tipp.',
    '- Verrate nicht die vollständige Lösung und schreib die Antwort nicht für die Schüler um.',
    '- Prüfe, ob der Operator erfüllt ist. Beim Beurteilen, Bewerten und Stellungnehmen gehören eine Abwägung und ein begründetes eigenes Urteil dazu.',
    '- Achte auf Fachbegriffe und sachliche Richtigkeit und korrigiere Fehler freundlich.',
    '- Schreib ohne Gendersternchen und ohne Doppelnennungen.',
    '- Gib keine Noten. Wenn eine Nachricht nichts mit den Aufgaben zu tun hat, lenk freundlich zur Aufgabe zurück.',
    '- Schickt jemand eine überarbeitete Fassung, sag, was sich verbessert hat.','',
    'Aufgaben und Erwartungshorizont:',
    ...offen.map(({a,i})=>`\nAufgabe ${i+1} (${STUFEN[a.afb].afb}, Operator: ${a.op}): ${plain(a.f)}${a.material?`\nMaterial: ${plain(a.material)}`:''}\nErwartet:\n${a.erwartung.map(e=>'- '+plain(e.t)).join('\n')}`)].join('\n');
}

function aufgabeHTML(id,a,i){
  const [icon,artName]=ARTEN[a.art],p=punkteVon(a),n=`wc-${id}-${i}`;
  const opt=(typ,j,text)=>`<label class="test-opt"><input type="${typ}" name="${n}" value="${j}"><span>${text}</span></label>`;
  let mitte='';
  if(a.art==='wahl'||a.art==='mehrfach')
    mitte=`<fieldset class="wc-opts"><legend class="aufgabe-frage">${a.f}${a.art==='mehrfach'?' <span class="small muted">(mehrere Antworten richtig)</span>':''}</legend>${mischen(a.o.length,streuwert(a.f)).map(j=>opt(a.art==='wahl'?'radio':'checkbox',j,a.o[j])).join('')}</fieldset>`;
  else if(a.art==='richtigfalsch')
    mitte=`<p class="aufgabe-frage">„${a.f}“</p><fieldset class="wc-opts wc-rf"><legend class="small">Die Aussage ist …</legend>${opt('radio',1,'richtig')}${opt('radio',0,'falsch')}</fieldset>`;
  else if(a.art==='zahl')
    mitte=`<p class="aufgabe-frage">${a.f}</p><div class="row wc-zahl"><label class="small" for="${n}">Dein Ergebnis</label><input id="${n}" type="text" inputmode="decimal" autocomplete="off" spellcheck="false">${a.einheit?`<span>${a.einheit}</span>`:''}</div>`;
  else if(a.art==='reihe')
    mitte=`<p class="aufgabe-frage" id="${n}-f">${a.f}</p><p class="small muted">Verschiebe die Schritte mit den Pfeilen.</p><ol class="wc-reihe" aria-labelledby="${n}-f"></ol>`;
  else if(a.art==='zuordnen')
    mitte=`<p class="aufgabe-frage">${a.f}</p><div class="wc-zu">${a.karten.map((k,j)=>`<label class="wc-zu-k"><span>${k.t}</span><select data-k="${j}"><option value="">– wählen –</option>${a.faecher.map(f=>`<option value="${esc(f.id)}">${f.t}</option>`).join('')}</select></label>`).join('')}</div>`;
  else if(a.art==='offen'){
    const op=OPERATOREN[a.op];
    mitte=`<p class="aufgabe-frage">${a.f}</p>
    ${op?`<details class="hilfe"><summary><span class="ms sm">help</span>Was heißt „${a.op}“?</summary><p class="small">${op.was}</p></details>`:''}
    ${a.anfaenge&&a.anfaenge.length?`<details class="hilfe"><summary><span class="ms sm">format_quote</span>So kannst du anfangen</summary><ul class="small">${a.anfaenge.map(x=>`<li>${x}</li>`).join('')}</ul></details>`:''}
    <label class="small" for="${n}">Deine Antwort in ganzen Sätzen</label><textarea id="${n}" rows="5" maxlength="1000"></textarea>`;
  }
  const knoepfe=a.art==='offen'
    ?`<button class="btn small" type="button" data-wc-hinweis><span class="ms">tips_and_updates</span>Feedback holen</button><button class="btn small" type="button" data-wc-ki hidden><span class="ms">smart_toy</span>KI-Coach (AIS.chat)</button><button class="btn primary small" type="button" data-wc-fertig><span class="ms">task_alt</span>Fertig – Erwartungshorizont zeigen</button>`
    :`<button class="btn primary small" type="button" data-wc-pruefen disabled><span class="ms">task_alt</span>Prüfen</button>`;
  return `<article class="aufgabe wc-a" data-wc-i="${i}" data-art="${a.art}">
    <p class="aufgabe-kopf"><span class="ms sm">${icon}</span>Aufgabe ${i+1} · ${artName}<span class="wc-p">${fmtP(p)} ${p===1?'Punkt':'Punkte'}</span></p>
    ${a.material?`<div class="wc-material">${a.material}</div>`:''}${mitte}
    <div class="row">${knoepfe}<span class="small" data-wc-status role="status"></span></div>
    ${a.art==='offen'?'<div class="wc-hinweise" data-wc-hinweise hidden></div>':''}<div class="stack" data-wc-fb hidden></div></article>`;
}

export function wissenscheck(def){
  const {id,titel,aufgaben}=def;
  CHECKS.set(id,def);
  registriere({id,frage:titel,loesung:aufgaben.map((a,i)=>`<b>Aufgabe ${i+1}</b> (${STUFEN[a.afb].name}): ${loesungHTML(a)}`),ki:kiAnweisung(def),
    check:{stufen:[1,2,3].map(k=>STUFEN[k].name),aufgaben:aufgaben.map((a,i)=>({afb:a.afb,p:punkteVon(a),kurz:`Aufgabe ${i+1}: ${plain(a.f).slice(0,70)}`}))}});
  const zahlen=k=>aufgaben.filter(a=>a.afb===k).length;
  return `<section class="wc stack" data-wc="${id}">
  <div class="panel stack wc-kopf"><div class="row" style="justify-content:space-between"><h3 class="title-m">${titel}</h3><span class="small muted num" data-wc-gesamt></span></div>
    <div class="wc-tabs" role="group" aria-label="Stufe wählen">${[1,2,3].map(k=>`<button type="button" data-wc-tab="${k}"><span>${STUFEN[k].name}</span><span class="wc-tab-n num" data-wc-n="${k}">0/${zahlen(k)}</span></button>`).join('')}<button type="button" data-wc-tab="0"><span class="ms sm">insights</span><span>Auswertung</span></button></div></div>
  ${[1,2,3].map(k=>`<div class="stack" data-wc-stufe="${k}" hidden><p class="small muted"><b>${STUFEN[k].afb}:</b> ${STUFEN[k].was}</p>
    ${aufgaben.map((a,i)=>a.afb===k?aufgabeHTML(id,a,i):'').join('')}
    <div class="row"><button class="btn small" type="button" data-wc-tab="${k<3?k+1:0}"><span class="ms">arrow_forward</span>${k<3?'Weiter: '+STUFEN[k+1].name:'Zur Auswertung'}</button></div></div>`).join('')}
  <div class="stack" data-wc-stufe="0" hidden></div></section>`;
}

/** Punkte einer bearbeiteten Aufgabe, abgerundet auf halbe Punkte: Volle Punkte gibt es nur, wenn alles stimmt. */
function bewerte(a,s){
  const p=punkteVon(a),halb=x=>Math.floor(Math.max(0,Math.min(1,x))*p*2+1e-9)/2;
  switch(a.art){
    case 'wahl':return s.w===a.r?p:0;
    case 'richtigfalsch':return s.w===a.r?p:0;
    case 'zahl':return zahlFeedback(zahl(s.w),a).richtig?p:0;
    case 'mehrfach':{const w=s.w||[],ok=w.filter(j=>a.r.includes(j)).length,falsch=w.length-ok;return halb((ok-falsch)/a.r.length)}
    case 'reihe':{const w=s.w||[];let ok=0;for(let j=0;j<w.length-1;j++)if(w[j+1]===w[j]+1)ok++;return halb(ok/(a.schritte.length-1))}
    case 'zuordnen':{const w=s.w||{};return halb(a.karten.filter((k,j)=>w[j]===k.f).length/a.karten.length)}
    case 'offen':return halb((s.h||[]).length/a.erwartung.length);
  }
}
// Für den Lernraum: pro Aufgabe ein Zeichen, „-“ = offen, „0“–„9“ = Zehntel der Punkte, „a“ = volle Punkte
function ergebnisCode(def,st){return def.aufgaben.map((a,i)=>{const s=st.a[i];return s&&s.f?'0123456789a'[Math.round((s.p||0)/punkteVon(a)*10)]:'-'}).join('')}
raum.on(art=>{
  if(art==='start'||art==='verbunden')ERGEBNIS.forEach(code=>raum.sendeErgebnis(code));
  if(art==='raum'||art==='start'||art==='ende'||art==='verbunden')$$('[data-wc-ki]').forEach(b=>{b.hidden=!(raum.istSchueler()&&raum.kiLink())||b.closest('.wc-a').dataset.fertig==='1'});
});

function bindWissenscheck(box){
  const id=box.dataset.wc,def=CHECKS.get(id);if(!def)return;
  // Ändern sich Aufgaben oder Antwortmöglichkeiten, passen gespeicherte Antworten nicht mehr: dann neu beginnen
  const A=def.aufgaben,fp=streuwert(JSON.stringify(A.map(a=>[a.art,a.f,a.o,a.r,a.schritte,a.karten&&a.karten.map(k=>k.t),a.erwartung&&a.erwartung.length])));
  let st=store(key('wc',id));if(!st||st.v!==fp)st={v:fp,a:{},tab:1};
  const zu=i=>st.a[i]||(st.a[i]={});
  const sichern=()=>{store(key('wc',id),st);const code=ergebnisCode(def,st);ERGEBNIS.set(id,code);raum.sendeErgebnis(code);kopf()};
  const werkstattKnopf=wid=>wid?`<button class="btn text small" type="button" data-gehzu="${esc(wid)}"><span class="ms">replay</span>Wiederholen: ${esc(raum.titel(wid))}</button>`:'';

  /* Kopf und Stufen */
  function kopf(){
    let p=0,max=0;
    [1,2,3].forEach(k=>{const l=A.map((a,i)=>({a,i})).filter(x=>x.a.afb===k);$(`[data-wc-n="${k}"]`,box).textContent=`${l.filter(x=>st.a[x.i]&&st.a[x.i].f).length}/${l.length}`});
    A.forEach((a,i)=>{max+=punkteVon(a);if(st.a[i]&&st.a[i].f)p+=st.a[i].p||0});
    $('[data-wc-gesamt]',box).textContent=`${fmtP(p)} von ${max} Punkten`;
    if(st.tab===0)auswertung();
  }
  function zeigeStufe(k,scrollen){
    st.tab=k;store(key('wc',id),st);
    $$('[data-wc-stufe]',box).forEach(d=>{d.hidden=+d.dataset.wcStufe!==k});
    $$('.wc-tabs [data-wc-tab]',box).forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.wcTab===k)));
    if(k===0)auswertung();
    if(scrollen)box.scrollIntoView({block:'start'});
  }
  box.addEventListener('click',e=>{const b=e.target.closest('[data-wc-tab]');if(b&&box.contains(b))zeigeStufe(+b.dataset.wcTab,!b.closest('.wc-tabs'))});

  function auswertung(){
    const el=$('[data-wc-stufe="0"]',box);
    const stufe=k=>{let p=0,max=0,n=0,anz=0;A.forEach((a,i)=>{if(a.afb!==k)return;anz++;max+=punkteVon(a);const s=st.a[i];if(s&&s.f){n++;p+=s.p||0}});return {p,max,n,anz}};
    const S=[1,2,3].map(stufe),p=S.reduce((x,s)=>x+s.p,0),max=S.reduce((x,s)=>x+s.max,0),n=S.reduce((x,s)=>x+s.n,0),pct=max?Math.round(p/max*100):0;
    const wdh=[...new Set(A.flatMap((a,i)=>{const s=st.a[i];if(!s||!s.f||(s.p||0)>=punkteVon(a))return [];
      if(a.art==='zuordnen'){const w=s.w||{},f=a.karten.filter((k,j)=>w[j]!==k.f&&k.werkstatt).map(k=>k.werkstatt);if(f.length)return f}return a.werkstatt?[a.werkstatt]:[]}))];
    const schwach=S.map((s,k)=>({k:k+1,q:s.n?s.p/Math.max(1,A.reduce((x,a,i)=>x+(a.afb===k+1&&st.a[i]&&st.a[i].f?punkteVon(a):0),0)):1})).filter((x,k)=>S[k].n).sort((x,y)=>x.q-y.q)[0];
    const TIPP={1:'Wiederhole die Merksätze in „Mein Wissen“ und schlag Fachbegriffe im Glossar nach.',2:'Beim Anwenden hilft es, zuerst die Formel oder die Wirkungskette aufzuschreiben.',3:'Beim Beurteilen hilft das Schema: Kriterien nennen, Pro und Contra abwägen, begründet urteilen.'};
    el.innerHTML=`<div class="panel stack"><h3 class="title-l">Deine Auswertung</h3>
      ${[1,2,3].map(k=>{const s=S[k-1];return `<div class="wc-erg"><div class="row" style="justify-content:space-between"><span class="title-s">${STUFEN[k].name} <span class="small muted">(${STUFEN[k].afb})</span></span><span class="small num">${fmtP(s.p)} von ${s.max} Punkten · ${s.n}/${s.anz} bearbeitet</span></div><div class="wc-balken" aria-hidden="true"><span style="width:${s.max?Math.round(s.p/s.max*100):0}%"></span></div></div>`}).join('')}
      <p class="title-m num">Gesamt: ${fmtP(p)} von ${max} Punkten (${pct} %)</p>
      <p>${!n?'Du hast noch keine Aufgabe bearbeitet. Fang mit den Grundlagen an.':pct>=85?'Stark! Du beherrschst das Thema auf allen Stufen.':pct>=60?'Solide Basis. Schau dir die Werkstätten unten noch einmal an.':'Da geht noch was. Wiederhole die Werkstätten unten und versuch es dann noch einmal.'}${n<A.length&&n?` Noch ${A.length-n} ${A.length-n===1?'Aufgabe ist':'Aufgaben sind'} offen.`:''}</p>
      ${schwach&&schwach.q<0.85?`<p class="small"><b>Tipp für „${STUFEN[schwach.k].name}“:</b> ${TIPP[schwach.k]}</p>`:''}
      ${wdh.length?`<div class="stack"><p class="title-s">Das solltest du wiederholen</p><div class="row">${wdh.map(werkstattKnopf).join('')}</div></div>`:''}
      <div class="row"><button class="btn text small" type="button" data-wc-neu><span class="ms">restart_alt</span>Wissenscheck neu starten</button>
      <span class="fb amb" data-wc-neu-q hidden>Alle Antworten löschen? <button class="btn small primary" type="button" data-wc-neu-y>Neu starten</button> <button class="btn small text" type="button" data-wc-neu-n>Abbrechen</button></span></div></div>`;
    $('[data-wc-neu]',el).addEventListener('click',()=>{$('[data-wc-neu-q]',el).hidden=false});
    $('[data-wc-neu-n]',el).addEventListener('click',()=>{$('[data-wc-neu-q]',el).hidden=true});
    $('[data-wc-neu-y]',el).addEventListener('click',()=>{st={v:fp,a:{},tab:1};$$('.wc-a',box).forEach(art=>zeichne(+art.dataset.wcI,true));sichern();zeigeStufe(1,true)});
  }

  /* Einzelne Aufgaben */
  const zeichner=new Map();
  function zeichne(i,neu){const f=zeichner.get(i);if(f)f(neu)}
  $$('.wc-a',box).forEach(art=>{
    const i=+art.dataset.wcI,a=A[i],fb=$('[data-wc-fb]',art),status=$('[data-wc-status]',art),pr=$('[data-wc-pruefen]',art);
    const eingaben=()=>$$('input,select,textarea',art).filter(x=>!x.closest('[data-wc-fb]'));
    const sperren=b=>eingaben().forEach(x=>{if(x.tagName==='TEXTAREA')x.readOnly=b;else x.disabled=b});
    const markiere=(el,cls)=>{el.classList.remove('right','wrong');if(cls)el.classList.add(cls)};
    const pruefen=()=>{const s=zu(i);s.f=true;s.p=bewerte(a,s);sichern();zeichne(i)};

    if(a.art==='offen'){
      const ta=$('textarea',art),hw=$('[data-wc-hinweise]',art);let t=null;
      ta.addEventListener('input',()=>{clearTimeout(t);t=setTimeout(()=>{zu(i).w=ta.value;store(key('wc',id),st)},300)});
      $('[data-wc-hinweis]',art).addEventListener('click',async()=>{
        const text=ta.value.trim();zu(i).w=ta.value;store(key('wc',id),st);
        if(!text){status.textContent='Schreib zuerst eine Antwort.';return}
        const r=await textFeedback({text,op:a.op,erwartung:a.erwartung});
        hw.hidden=false;
        hw.innerHTML=`<p class="title-s"><span class="ms sm">tips_and_updates</span>Automatischer Hinweis</p>
          ${r.treffer.length?`<p class="small"><b>Das steckt schon drin:</b></p><ul class="wc-gut">${r.treffer.map(j=>`<li>${a.erwartung[j].t}</li>`).join('')}</ul>`:''}
          ${r.tipps.length?`<p class="small"><b>Denk noch an:</b></p><ul class="small">${r.tipps.map(x=>`<li>${x}</li>`).join('')}</ul>`:'<p class="small">Sieht vollständig aus. Prüf noch Fachbegriffe und Rechtschreibung und klick dann auf „Fertig“.</p>'}
          <p class="small muted">Der Hinweis kommt ohne KI aus. Er erkennt, ob etwas in deinem Text steht – nicht, wie gut es ist.</p>`;
        status.textContent='';
      });
      $('[data-wc-ki]',art).addEventListener('click',async()=>{
        const link=raum.kiLink(),text=ta.value.trim();if(!link)return;
        if(!text){status.textContent='Schreib zuerst eine Antwort.';return}
        const kopiert=kopieren(`Aufgabe ${i+1} (${STUFEN[a.afb].name}, Operator: ${a.op}): ${plain(a.f)}\n\nMeine Antwort:\n${text}`);
        window.open(link,'_blank','noopener');
        status.textContent=(await kopiert)?'Deine Antwort ist kopiert. Füge sie in AIS.chat ein (Strg+V oder lange tippen und „Einfügen“).':'Kopieren hat nicht geklappt. Markiere deine Antwort und kopiere sie selbst.';
      });
      $('[data-wc-fertig]',art).addEventListener('click',()=>{
        const text=ta.value.trim();zu(i).w=ta.value;
        if(!text){status.textContent='Schreib zuerst eine Antwort.';return}
        const s=zu(i);if(!s.h)s.h=textFeedback({text,op:a.op,erwartung:a.erwartung}).treffer;
        status.textContent='';hw.hidden=true;pruefen();
      });
      zeichner.set(i,neu=>{
        const s=st.a[i]||{};if(neu)ta.value=s.w||'';
        art.dataset.fertig=s.f?'1':'';sperren(!!s.f);$('[data-wc-fertig]',art).hidden=!!s.f;$('[data-wc-hinweis]',art).hidden=!!s.f;
        $('[data-wc-ki]',art).hidden=!!s.f||!(raum.istSchueler()&&raum.kiLink());
        if(neu)hw.hidden=true;
        fb.hidden=!s.f;if(!s.f){fb.innerHTML='';return}
        const p=punkteVon(a),h=new Set(s.h||[]);
        fb.innerHTML=`<div class="wc-eh stack"><p class="title-s"><span class="ms sm">checklist</span>Erwartungshorizont</p>
          <fieldset class="wc-opts"><legend class="small">Hake ab, was in deiner Antwort steckt. Vorausgewählt hat das automatische Feedback – prüf selbst und ändere die Haken, wenn nötig.</legend>
          ${a.erwartung.map((e,j)=>`<label class="test-opt"><input type="checkbox" data-h="${j}"${h.has(j)?' checked':''}><span>${e.t}</span></label>`).join('')}</fieldset>
          ${a.muster?`<details class="hilfe"><summary><span class="ms sm">format_quote</span>Beispiel für eine gelungene Antwort</summary><p class="small">${a.muster}</p></details>`:''}
          <p class="small num" data-wc-punkte>${fmtP(s.p||0)} von ${fmtP(p)} Punkten (Selbsteinschätzung)</p>
          <div class="row"><button class="btn text small" type="button" data-wc-ueberarbeiten><span class="ms">edit</span>Antwort überarbeiten</button>${(s.p||0)<p?werkstattKnopf(a.werkstatt):''}</div></div>`;
        $$('[data-h]',fb).forEach(c=>c.addEventListener('change',()=>{s.h=$$('[data-h]',fb).filter(x=>x.checked).map(x=>+x.dataset.h);s.p=bewerte(a,s);sichern();$('[data-wc-punkte]',fb).textContent=`${fmtP(s.p)} von ${fmtP(p)} Punkten (Selbsteinschätzung)`}));
        $('[data-wc-ueberarbeiten]',fb).addEventListener('click',()=>{s.f=false;delete s.h;s.p=0;sichern();zeichne(i);ta.focus()});
      });
      zeichne(i,true);
      return;
    }

    // Geschlossene Aufgaben: Eingabe lesen, Prüfen freischalten
    const lies=()=>{const s=zu(i);
      if(a.art==='wahl'||a.art==='richtigfalsch'){const r=$('input:checked',art);s.w=r?(a.art==='wahl'?+r.value:r.value==='1'):undefined}
      else if(a.art==='mehrfach')s.w=$$('input:checked',art).map(x=>+x.value);
      else if(a.art==='zahl')s.w=$('input',art).value;
      else if(a.art==='zuordnen'){s.w={};$$('select',art).forEach(x=>{if(x.value)s.w[x.dataset.k]=x.value})}
      store(key('wc',id),st);bereit()};
    const bereit=()=>{const s=st.a[i]||{};pr.disabled=!!s.f||(a.art==='mehrfach'?!(s.w||[]).length:a.art==='zuordnen'?Object.keys(s.w||{}).length<a.karten.length:a.art==='reihe'?false:s.w===undefined||s.w==='')};
    art.addEventListener('change',e=>{if(!e.target.closest('[data-wc-fb]'))lies()});
    if(a.art==='zahl'){const inp=$('input',art);inp.addEventListener('input',lies);inp.addEventListener('keydown',e=>{if(e.key==='Enter'&&!pr.disabled)pruefen()})}
    pr.addEventListener('click',pruefen);

    // Reihenfolge: Liste mit Pfeilen
    const reihe=()=>{const s=zu(i);if(!s.w)s.w=mischen(a.schritte.length,streuwert(a.f));return s.w};
    const zeichneReihe=()=>{
      const ol=$('.wc-reihe',art),w=reihe(),fertig=!!(st.a[i]&&st.a[i].f);
      ol.innerHTML=w.map((j,pos)=>`<li class="wc-schritt${fertig?(pos===j?' right':' wrong'):''}"><span>${a.schritte[j]}</span>${fertig?'':`<span class="wc-pfeile"><button class="icon-btn" type="button" data-hoch="${pos}" aria-label="„${esc(plain(a.schritte[j]))}“ nach oben"${pos===0?' disabled':''}><span class="ms">arrow_upward</span></button><button class="icon-btn" type="button" data-runter="${pos}" aria-label="„${esc(plain(a.schritte[j]))}“ nach unten"${pos===w.length-1?' disabled':''}><span class="ms">arrow_downward</span></button></span>`}</li>`).join('');
    };
    if(a.art==='reihe')$('.wc-reihe',art).addEventListener('click',e=>{
      const b=e.target.closest('[data-hoch],[data-runter]');if(!b)return;const w=reihe(),pos=+(b.dataset.hoch??b.dataset.runter),ziel=b.dataset.hoch!==undefined?pos-1:pos+1;
      const dir=b.dataset.hoch!==undefined?'hoch':'runter';
      [w[pos],w[ziel]]=[w[ziel],w[pos]];store(key('wc',id),st);zeichneReihe();
      ($(`[data-${dir}="${ziel}"]:not(:disabled)`,art)||$(`[data-${dir==='hoch'?'runter':'hoch'}="${ziel}"]`,art))?.focus()});

    zeichner.set(i,neu=>{
      const s=st.a[i]||{};
      if(neu){ // Eingaben aus dem Speicher übernehmen
        if(a.art==='wahl'||a.art==='richtigfalsch'||a.art==='mehrfach')$$('input',art).forEach(x=>{const v=a.art==='richtigfalsch'?x.value==='1':+x.value;x.checked=a.art==='mehrfach'?(s.w||[]).includes(v):s.w===v});
        if(a.art==='zahl')$('input',art).value=s.w||'';
        if(a.art==='zuordnen')$$('select',art).forEach(x=>{x.value=(s.w||{})[x.dataset.k]||''});
      }
      if(a.art==='reihe')zeichneReihe();
      sperren(!!s.f);pr.hidden=!!s.f;bereit();
      // Markierungen
      if(a.art==='wahl'||a.art==='richtigfalsch'||a.art==='mehrfach')$$('.test-opt',art).forEach(l=>{const x=$('input',l),v=a.art==='richtigfalsch'?x.value==='1':+x.value;
        const soll=a.art==='mehrfach'?a.r.includes(v):a.r===v;markiere(l,!s.f?null:soll?'right':x.checked?'wrong':null)});
      if(a.art==='zuordnen')$$('.wc-zu-k',art).forEach((l,j)=>markiere(l,!s.f?null:(s.w||{})[j]===a.karten[j].f?'right':'wrong'));
      if(a.art==='zahl')markiere($('input',art),!s.f?null:s.p>0?'right':'wrong');
      fb.hidden=!s.f;if(!s.f){fb.innerHTML='';return}
      const p=punkteVon(a),pk=s.p||0;
      let detail='';
      if(a.art==='wahl'&&pk<p&&a.fehler&&a.fehler[s.w])detail=a.fehler[s.w];
      if(a.art==='mehrfach'){const w=s.w||[];detail=[`Du hast ${w.filter(j=>a.r.includes(j)).length} von ${a.r.length} richtigen Antworten gefunden${w.some(j=>!a.r.includes(j))?' und mindestens eine falsche angekreuzt':''}.`,
        ...w.filter(j=>!a.r.includes(j)&&a.fehler&&a.fehler[j]).map(j=>`„${a.o[j]}“: ${a.fehler[j]}`)].join(' ')}
      if(a.art==='zahl'&&pk<p)detail=zahlFeedback(zahl(s.w),a).text;
      if(a.art==='reihe'&&pk<p){const w=s.w||[],j=w.findIndex((x,k)=>k<w.length-1&&w[k+1]!==x+1);if(j>=0)detail=`Nach „${plain(a.schritte[w[j]])}“ folgt nicht „${plain(a.schritte[w[j+1]])}“. Was passiert direkt danach?`}
      if(a.art==='zuordnen'&&pk<p){const f=a.karten.filter((k,j)=>(s.w||{})[j]!==k.f).length;detail=`${f} ${f===1?'Karte ist':'Karten sind'} falsch zugeordnet (rot markiert).`}
      const wdh=a.art==='zuordnen'?[...new Set(a.karten.filter((k,j)=>(s.w||{})[j]!==k.f&&k.werkstatt).map(k=>k.werkstatt))]:[a.werkstatt];
      fb.innerHTML=`<div class="fb ${pk>=p?'ok':pk>0?'amb':'bad'}"><b>${pk>=p?'Richtig.':pk>0?'Teilweise richtig.':'Nicht ganz.'}</b> ${detail}</div>
        <div class="wc-eh stack"><p class="title-s"><span class="ms sm">checklist</span>Erwartungshorizont</p><div class="small">${loesungHTML(a)}</div>${a.e?`<p class="small">${a.e}</p>`:''}
        <p class="small num">${fmtP(pk)} von ${fmtP(p)} ${p===1?'Punkt':'Punkten'}</p>${pk<p?`<div class="row">${wdh.map(werkstattKnopf).join('')}</div>`:''}</div>`;
    });
    zeichne(i,true);
  });
  sichern();zeigeStufe(st.tab??1,false);
}

/* ---------- Blitzrunde: Bauchgefühl-Karten ----------
   Eine Karte nach der anderen, Antwort per Knopf (bei zwei Antworten auch per Wischen).
   blitz({id, titel, werkstatt, optionen:[{id, t, icon}], karten:[{t, r, e}], verdeckt})
     verdeckt: keine Auflösung; die kommt später mit blitzAufloesung(def), z. B. in der Sichern-Werkstatt.
     werkstatt: id der Werkstatt mit der Blitzrunde (für den Link aus der Auflösung). */
const BLITZ=new Map();
export function blitz(def){
  const {id,titel,optionen,karten,verdeckt}=def;BLITZ.set(id,def);
  const opt=r=>optionen.find(o=>o.id===r);
  registriere({id,frage:titel,loesung:karten.map(k=>`${k.t} – <b>${opt(k.r).t}</b>`)});
  return `<section class="aufgabe blitz" data-blitz="${id}">${kopf('bolt',verdeckt?'Blitzrunde · Bauchgefühl':'Blitzrunde')}
    <p class="aufgabe-frage">${titel}</p>
    <div class="stack" data-blitz-spiel>
      <div class="row" style="justify-content:space-between"><span class="small muted num" data-blitz-n></span>${optionen.length===2?'<span class="small muted">Tippen oder wischen</span>':''}</div>
      <div class="blitz-karte" data-blitz-karte><p data-blitz-text aria-live="polite"></p></div>
      <div class="blitz-wahl" role="group" aria-label="Deine Antwort">${optionen.map(o=>`<button class="btn blitz-btn" type="button" data-wahl="${esc(o.id)}">${o.icon?`<span class="ms">${o.icon}</span>`:''}${o.t}</button>`).join('')}</div>
      <div class="stack" data-blitz-fb hidden></div>
    </div>
    <div class="stack" data-blitz-ende hidden></div></section>`;
}
function bindBlitz(box){
  const def=BLITZ.get(box.dataset.blitz);if(!def)return;
  const {id,optionen,karten,verdeckt}=def,opt=r=>optionen.find(o=>o.id===r);
  let st=store(key('blitz',id));if(!st||!Array.isArray(st.a)||st.a.length!==karten.length)st={a:karten.map(()=>null)};
  const spiel=$('[data-blitz-spiel]',box),ende=$('[data-blitz-ende]',box),karte=$('[data-blitz-karte]',box),fb=$('[data-blitz-fb]',box),wahl=$('.blitz-wahl',box);
  let warte=false;
  const naechste=()=>st.a.findIndex(x=>x==null);
  function zeige(fokus){
    const i=naechste();
    karte.style.transform='';karte.classList.remove('links','rechts');
    if(i<0){spiel.hidden=true;ende.hidden=false;zeichneEnde();return}
    spiel.hidden=false;ende.hidden=true;fb.hidden=true;wahl.hidden=false;warte=false;
    $('[data-blitz-n]',box).textContent=`Karte ${i+1} von ${karten.length}`;
    $('[data-blitz-text]',box).innerHTML=karten[i].t;
    karte.classList.remove('neu');void karte.offsetWidth;karte.classList.add('neu');
    if(fokus)$('[data-wahl]',wahl).focus();
  }
  function waehle(r){
    if(warte)return;const i=naechste();if(i<0)return;
    st.a[i]=r;store(key('blitz',id),st);
    if(verdeckt)return zeige(true);
    const k=karten[i],ok=k.r===r;warte=true;wahl.hidden=true;fb.hidden=false;
    fb.innerHTML=`<div class="fb ${ok?'ok':'bad'}"><b>${ok?'Richtig.':`Nicht ganz – richtig ist: ${opt(k.r).t}.`}</b> ${k.e||''}</div><div class="row"><button class="btn primary small" type="button" data-blitz-weiter><span class="ms">arrow_forward</span>${i+1<karten.length?'Weiter':'Zur Auswertung'}</button></div>`;
    const w=$('[data-blitz-weiter]',fb);w.addEventListener('click',()=>zeige(true));w.focus();
  }
  function zeichneEnde(){
    const ok=karten.filter((k,i)=>st.a[i]===k.r).length;
    ende.innerHTML=verdeckt
      ?`<div class="fb ok"><b>Geschafft!</b> Dein Bauchgefühl ist gespeichert. Am Ende der Lernwerkstatt zeigt dir der Bauchgefühl-Check, wie gut du lagst.</div>`
      :`<p class="title-m num">${ok} von ${karten.length} richtig</p><p class="small">${ok===karten.length?'Stark – alles richtig!':'Schau dir die Erklärungen noch einmal an und versuch es dann erneut.'}</p>`;
    ende.insertAdjacentHTML('beforeend',`<div class="row"><button class="btn small" type="button" data-blitz-neu><span class="ms">restart_alt</span>Noch einmal</button></div>`);
    $('[data-blitz-neu]',ende).addEventListener('click',()=>{st={a:karten.map(()=>null)};store(key('blitz',id),st);zeige(true)});
  }
  wahl.addEventListener('click',e=>{const b=e.target.closest('[data-wahl]');if(b)waehle(b.dataset.wahl)});
  // Wischen: links = erste Antwort, rechts = zweite Antwort
  if(optionen.length===2){
    let x0=null,dx=0;
    karte.addEventListener('pointerdown',e=>{if(warte)return;x0=e.clientX;dx=0;karte.setPointerCapture(e.pointerId)});
    karte.addEventListener('pointermove',e=>{if(x0==null)return;dx=e.clientX-x0;karte.style.transform=`translateX(${dx}px) rotate(${dx/24}deg)`;karte.classList.toggle('links',dx<-40);karte.classList.toggle('rechts',dx>40)});
    const los=()=>{if(x0==null)return;x0=null;if(Math.abs(dx)>90)waehle(dx<0?optionen[0].id:optionen[1].id);else{karte.style.transform='';karte.classList.remove('links','rechts')}};
    karte.addEventListener('pointerup',los);karte.addEventListener('pointercancel',los);
  }
  zeige(false);
}
export function blitzAufloesung(def){
  BLITZ.set(def.id,def);
  return `<section class="aufgabe" data-blitz-aufl="${def.id}">${kopf('psychology','Bauchgefühl-Check')}<p class="aufgabe-frage">Wie gut war dein Bauchgefühl am Anfang?</p><div class="stack" data-aufl></div></section>`;
}
function bindAufloesung(box){
  const def=BLITZ.get(box.dataset.blitzAufl),el=$('[data-aufl]',box),opt=r=>def.optionen.find(o=>o.id===r);
  const a=(store(key('blitz',def.id))||{}).a||[],n=a.filter(x=>x!=null).length;
  if(!n){el.innerHTML=`<p class="small">Du hast die Blitzrunde am Anfang noch nicht gemacht. Hol das nach – dann siehst du hier, wie gut dein Bauchgefühl war.</p>${def.werkstatt?`<div class="row"><button class="btn small" type="button" data-gehzu="${esc(def.werkstatt)}"><span class="ms">bolt</span>Zur Blitzrunde</button></div>`:''}`;return}
  const ok=def.karten.filter((k,i)=>a[i]===k.r).length;
  el.innerHTML=`<p class="title-m num">Dein Bauchgefühl: ${ok} von ${n} richtig</p>
    <p class="small">${ok===def.karten.length?'Wow – du hattest von Anfang an den richtigen Riecher!':'Jetzt weißt du es genauer. Hier lag dein Bauchgefühl daneben:'}</p>
    <ol class="blitz-liste">${def.karten.map((k,i)=>{const w=a[i];return `<li class="${w==null?'':w===k.r?'right':'wrong'}"><p>${k.t}</p><p class="small">Dein Bauchgefühl: <b>${w==null?'–':opt(w).t}</b> · Richtig: <b>${opt(k.r).t}</b></p>${k.e?`<p class="small">${k.e}</p>`:''}</li>`}).join('')}</ol>`;
}

/* ---------- Prüfschema (Rechts-Navi) und Fall-Akte ----------
   schema: {start, schritte:{sid:{frage, hilfe, gesetz:{p, t}, antworten:[{t, weiter: sid} | {t, ergebnis:{art, t}}]}}}
     art: 'wirksam' | 'schwebend' | 'unwirksam' bestimmt Farbe und Symbol des Ergebnisses.
   pruefschema({id, titel, schema, beispiel})   Probefahrt: frei durchklicken, dazu die ganze Route auf einen Blick
   fallakte({id, titel, schema, faelle:[{titel, icon, text, frage, weg:{sid: Index der richtigen Antwort}, tipps:{sid: '…'}, loesung, denkWeiter}]})
     Fälle mit dem Navi lösen: Falsche Abzweigungen werden erklärt, die Lösung erscheint erst danach. Gelöste Fälle bleiben gespeichert. */
const SCHEMAS=new Map(), AKTEN=new Map();
const ERG={wirksam:['ok','check_circle','Wirksam'],schwebend:['amb','hourglass_top','Schwebend unwirksam'],unwirksam:['bad','block','Unwirksam']};
const ergebnisHTML=e=>{const [k,ic,t]=ERG[e.art]||ERG.unwirksam;return `<li class="navi-ergebnis fb ${k}"><span class="ms">${ic}</span><span><b>${e.titel||t}</b>${e.t?` – ${e.t}`:''}</span></li>`};
function uebersichtHTML(schema){
  const ids=Object.keys(schema.schritte),nr=new Map(ids.map((s,i)=>[s,i+1]));
  return `<ol class="navi-karte small">${ids.map(sid=>{const s=schema.schritte[sid];return `<li><b>${s.frage}</b>${s.gesetz?` <span class="muted">(${s.gesetz.p})</span>`:''}<ul>${s.antworten.map(a=>`<li>${a.t} → ${a.ergebnis?`<b>${a.ergebnis.titel||ERG[a.ergebnis.art][2]}</b>`:`weiter mit Frage ${nr.get(a.weiter)}`}</li>`).join('')}</ul></li>`}).join('')}</ol>`;
}
/** Zeichnet die Route in ol; fall: Fallmodus mit richtigem Weg, fertig(ergebnis, fehler) nach dem Ziel. */
function route(ol,schema,{fall,fertig}={}){
  const nr=new Map(Object.keys(schema.schritte).map((s,i)=>[s,i+1]));
  let weg=[],tipp=null,fehler=0;
  function zeichne(){
    let sid=schema.start,html='';
    for(let k=0;k<50;k++){
      const s=schema.schritte[sid],w=weg[k];
      html+=`<li class="navi-schritt${w?' fertig':''}"><p class="navi-frage"><span class="navi-nr" aria-hidden="true">${nr.get(sid)}</span>${s.frage}</p>
        ${s.hilfe?`<p class="small muted">${s.hilfe}</p>`:''}${s.gesetz?`<details class="hilfe"><summary><span class="ms sm">menu_book</span>${s.gesetz.p} nachlesen</summary><p class="small">${s.gesetz.t}</p></details>`:''}
        <div class="navi-antw" role="group" aria-label="Antwort zu Frage ${nr.get(sid)}">${s.antworten.map((a,j)=>{const gew=w&&w.j===j,falsch=tipp&&tipp.sid===sid&&tipp.j===j;
          return `<button class="btn small${gew?' gewaehlt':''}${falsch?' falsch':''}" type="button" data-sid="${sid}" data-j="${j}" aria-pressed="${!!gew}"${w?' disabled':''}>${a.t}</button>`}).join('')}</div>
        ${tipp&&tipp.sid===sid?`<div class="fb amb" role="status"><b>Nicht ganz.</b> ${tipp.t}</div>`:''}</li>`;
      if(!w)break;
      const a=s.antworten[w.j];
      if(a.ergebnis){html+=ergebnisHTML(a.ergebnis);break}
      sid=a.weiter;
    }
    ol.innerHTML=html;
  }
  ol.addEventListener('click',e=>{
    const b=e.target.closest('[data-j]');if(!b||b.disabled)return;
    const sid=b.dataset.sid,j=+b.dataset.j;
    if(fall&&fall.weg[sid]!==undefined&&fall.weg[sid]!==j){tipp={sid,j,t:(fall.tipps||{})[sid]||'Lies den Fall noch einmal genau.'};fehler++;zeichne();$(`[data-sid="${sid}"][data-j="${j}"]`,ol)?.focus();return}
    tipp=null;weg.push({sid,j});zeichne();
    const a=schema.schritte[sid].antworten[j];
    if(a.ergebnis){if(fertig)fertig(a.ergebnis,fehler)}
    else $$('.navi-schritt:not(.fertig) [data-j]',ol)[0]?.focus();
  });
  return {
    neu(){weg=[];tipp=null;fehler=0;zeichne()},
    // Fallmodus: den richtigen Weg nachzeichnen (gelöster Fall nach dem Neuladen)
    loese(){weg=[];tipp=null;let sid=schema.start;for(let k=0;k<50;k++){const j=fall.weg[sid];if(j===undefined)break;weg.push({sid,j});const a=schema.schritte[sid].antworten[j];if(a.ergebnis)break;sid=a.weiter}zeichne()}
  };
}
export function pruefschema({id,titel,schema,beispiel}){
  SCHEMAS.set(id,schema);
  return `<section class="aufgabe navi" data-navi="${id}">${kopf('alt_route','Rechts-Navi')}<p class="aufgabe-frage">${titel}</p>${beispiel?`<div class="wc-material">${beispiel}</div>`:''}
    <ol class="navi-route" data-route></ol>
    <div class="row"><button class="btn small" type="button" data-navi-neu><span class="ms">restart_alt</span>Neue Fahrt</button></div>
    <details class="hilfe"><summary><span class="ms sm">map</span>Die ganze Route auf einen Blick</summary>${uebersichtHTML(schema)}</details></section>`;
}
function bindNavi(box){
  const schema=SCHEMAS.get(box.dataset.navi);if(!schema)return;
  const r=route($('[data-route]',box),schema);r.neu();
  $('[data-navi-neu]',box).addEventListener('click',()=>{r.neu();$('[data-route] [data-j]',box)?.focus()});
}
export function fallakte(def){
  AKTEN.set(def.id,def);
  registriere({id:def.id,frage:def.titel,loesung:def.faelle.map(f=>`<b>${f.titel}:</b> ${f.loesung}`)});
  return `<section class="stack akte" data-akte="${def.id}">
    <div class="panel stack"><div class="row" style="justify-content:space-between"><h3 class="title-m">${def.titel}</h3><span class="small muted num" data-akte-stand></span></div>
      <div class="akte-faelle" role="group" aria-label="Fall wählen">${def.faelle.map((f,i)=>`<button class="akte-fall" type="button" data-fall="${i}" aria-pressed="false"><span class="ms">${f.icon||'folder'}</span><span class="akte-titel">${f.titel}</span><span class="akte-status small" data-status></span></button>`).join('')}</div>
      <div data-akte-profi></div></div>
    <div data-akte-fall></div></section>`;
}
function bindAkte(box){
  const def=AKTEN.get(box.dataset.akte);if(!def)return;
  let st=store(key('akte',def.id))||{geloest:{},fall:0};
  const sichern=()=>store(key('akte',def.id),st);
  function stand(){
    const n=Object.keys(st.geloest).length;
    $('[data-akte-stand]',box).textContent=`${n} von ${def.faelle.length} gelöst`;
    $$('[data-fall]',box).forEach(b=>{const i=+b.dataset.fall,g=st.geloest[i];b.classList.toggle('geloest',!!g);b.setAttribute('aria-pressed',String(i===st.fall));$('[data-status]',b).innerHTML=g?'<span class="ms sm">check_circle</span>gelöst':'offen'});
    $('[data-akte-profi]',box).innerHTML=n===def.faelle.length?`<div class="fb ok"><span class="ms sm">workspace_premium</span> <b>Alle Fälle gelöst – du bist jetzt Rechtsprofi!</b> ${Object.values(st.geloest).every(g=>!g.fehler)?'Und das ohne eine einzige falsche Abzweigung.':''}</div>`:'';
  }
  function oeffne(i,fokus){
    st.fall=i;sichern();stand();
    const f=def.faelle[i],el=$('[data-akte-fall]',box);
    el.innerHTML=`<article class="aufgabe"><p class="aufgabe-kopf"><span class="ms sm">folder_open</span>Fall ${i+1}: ${f.titel}</p>
      <div class="wc-material akte-text">${f.text}</div>${f.frage?`<p class="aufgabe-frage">${f.frage}</p>`:''}
      <p class="small muted">Löse den Fall mit dem Rechts-Navi: Tippe bei jeder Frage die Antwort, die zum Fall passt.</p>
      <ol class="navi-route" data-route></ol><div data-akte-loesung></div>
      <div class="row"><button class="btn small" type="button" data-akte-neu><span class="ms">restart_alt</span>Noch einmal prüfen</button>${i+1<def.faelle.length?'<button class="btn small primary" type="button" data-akte-weiter><span class="ms">arrow_forward</span>Nächster Fall</button>':''}</div></article>`;
    const loesung=()=>{$('[data-akte-loesung]',el).innerHTML=`<div class="wc-eh stack"><p class="title-s"><span class="ms sm">gavel</span>So schreibst du die Lösung auf</p><p class="small">${f.loesung}</p>${f.denkWeiter?`<details class="hilfe pro"><summary><span class="ms sm">psychology</span>Denk weiter</summary><p class="small">${f.denkWeiter}</p></details>`:''}</div>`};
    const r=route($('[data-route]',el),def.schema,{fall:f,fertig:(erg,fehler)=>{st.geloest[i]={fehler};sichern();stand();loesung()}});
    if(st.geloest[i]){r.loese();loesung()}else r.neu();
    $('[data-akte-neu]',el).addEventListener('click',()=>{delete st.geloest[i];sichern();stand();$('[data-akte-loesung]',el).innerHTML='';r.neu();$('[data-route] [data-j]',el)?.focus()});
    $('[data-akte-weiter]',el)?.addEventListener('click',()=>{oeffne(i+1,true)});
    if(fokus){el.scrollIntoView({block:'start'});$('[data-route] [data-j]',el)?.focus({preventScroll:true})}
  }
  $$('[data-fall]',box).forEach(b=>b.addEventListener('click',()=>oeffne(+b.dataset.fall,true)));
  oeffne(Math.min(st.fall||0,def.faelle.length-1),false);
}

/* ---------- Ihr seid das Gericht (Live-Abstimmung) ----------
   abstimmung({id, titel, fall, frage, optionen:[…], r, e})   r = Index des richtigen Urteils, e = Begründung, titel = kurzer Name des Falls
   Im Lernraum startet die Lehrkraft die Abstimmung, alle Handys zeigen den Fall (Fenster aus lernraum.js), die Lehrkraft
   sieht die Stimmen live und deckt auf. Ohne Lernraum fällt man das Urteil allein. */
const URTEILE=new Map();
export function abstimmung(def){
  const {id,titel,fall,frage,optionen,r,e}=def;URTEILE.set(id,def);
  registriere({id,frage:titel?`${titel}: ${frage}`:frage,loesung:[`<b>${optionen[r]}</b>`,e].filter(Boolean),umfrage:{titel,fall,frage,optionen,r,e}});
  return `<section class="aufgabe abst" data-abst="${id}">${kopf('gavel',titel?`Ihr seid das Gericht · ${titel}`:'Ihr seid das Gericht')}${fall?`<div class="wc-material">${fall}</div>`:''}<p class="aufgabe-frage">${frage}</p><div class="stack" data-abst-inhalt></div></section>`;
}
const urteilHTML=(def,w)=>`<div class="fb ${w===def.r?'ok':'bad'}"><b>${w===def.r?'Richtig geurteilt!':'Das Gericht entscheidet anders.'}</b> Richtig ist: <b>${def.optionen[def.r]}</b>. ${def.e||''}</div>`;
function zeichneAbst(box){
  const def=URTEILE.get(box.dataset.abst);if(!def)return;
  const el=$('[data-abst-inhalt]',box),u=raum.umfrage();
  if(raum.istLehrkraft()){
    if(u.id!==def.id){
      el.innerHTML=`${u.id?'<p class="small muted">Gerade läuft eine andere Abstimmung. Starten beendet sie.</p>':''}<div class="row"><button class="btn primary" type="button" data-abst-start><span class="ms">how_to_vote</span>Abstimmung starten</button><span class="small muted">Alle Handys im Lernraum zeigen den Fall und die Antworten.</span></div>`;
      $('[data-abst-start]',el).addEventListener('click',()=>raum.starteUmfrage(def.id));return;
    }
    const st=raum.stimmen(),n=st.reduce((a,b)=>a+b,0),gesamt=raum.zustand().spieler.length;
    el.innerHTML=`<div class="abst-balken">${def.optionen.map((o,i)=>{const p=n?Math.round(st[i]/n*100):0,richtig=u.auf&&i===def.r;
        return `<div class="wc-erg abst-zeile${richtig?' richtig':''}"><div class="row" style="justify-content:space-between"><span class="title-s">${richtig?'<span class="ms sm">check_circle</span> ':''}${o}</span><span class="num" data-abst-zahl="${i}">${st[i]} · ${p} %</span></div><div class="wc-balken" aria-hidden="true"><span style="width:${p}%"></span></div></div>`}).join('')}</div>
      <p class="small muted num" data-abst-n>${n} von ${gesamt} ${gesamt===1?'Person hat':'Personen haben'} abgestimmt.</p>
      ${u.auf?`<div class="fb ok"><b>Urteil: ${def.optionen[def.r]}.</b> ${def.e||''}</div>`:''}
      <div class="row">${u.auf?'':'<button class="btn primary" type="button" data-abst-auf><span class="ms">visibility</span>Auflösen</button>'}<button class="btn" type="button" data-abst-ende><span class="ms">stop_circle</span>Abstimmung beenden</button></div>`;
    $('[data-abst-auf]',el)?.addEventListener('click',()=>raum.deckeAuf());
    $('[data-abst-ende]',el).addEventListener('click',()=>raum.beendeUmfrage());
    return;
  }
  if(raum.istSchueler()){
    const meins=raum.urteil(def.id);
    el.innerHTML=u.id===def.id?'<p class="small"><span class="ms sm">how_to_vote</span> Die Abstimmung läuft – stimm im Fenster ab.</p>'
      :meins?urteilHTML(def,meins.w):'<p class="small muted">Abstimmen könnt ihr, sobald eure Lehrkraft die Abstimmung startet.</p>';
    return;
  }
  // Allein: Urteil fällen und gleich auflösen
  const st=store(key('abst',def.id));
  if(st&&st.w!=null){
    el.innerHTML=urteilHTML(def,st.w)+'<div class="row"><button class="btn small" type="button" data-abst-neu><span class="ms">restart_alt</span>Noch einmal</button></div>';
    $('[data-abst-neu]',el).addEventListener('click',()=>{store(key('abst',def.id),{});zeichneAbst(box)});return;
  }
  el.innerHTML=`<fieldset class="wc-opts"><legend class="small">Dein Urteil</legend>${def.optionen.map((o,i)=>`<label class="test-opt"><input type="radio" name="abst-${def.id}" value="${i}"><span>${o}</span></label>`).join('')}</fieldset>
    <div class="row"><button class="btn primary small" type="button" data-abst-urteil disabled><span class="ms">gavel</span>Urteil fällen</button></div>`;
  const btn=$('[data-abst-urteil]',el);
  el.onchange=()=>{btn.disabled=!$('input:checked',el)};
  btn.addEventListener('click',()=>{const r=$('input:checked',el);if(!r)return;store(key('abst',def.id),{w:+r.value});zeichneAbst(box)});
}
raum.on(art=>{if(['raum','spieler','start','ende','verbunden','urteil'].includes(art))$$('[data-abst]').forEach(zeichneAbst)});

/** Macht alle Aufgaben in root interaktiv (jede nur einmal). */
export function bindAufgaben(root){
  const einmal=(sel,f)=>$$(sel,root).forEach(b=>{if(b.dataset.gebunden)return;b.dataset.gebunden='1';f(b)});
  einmal('[data-schreib]',bindSchreibfeld);
  einmal('[data-zuordnen]',bindZuordnen);
  einmal('[data-luecken]',bindLuecken);
  einmal('[data-test]',bindTest);
  einmal('[data-wc]',bindWissenscheck);
  einmal('[data-blitz]',bindBlitz);
  einmal('[data-blitz-aufl]',bindAufloesung);
  einmal('[data-navi]',bindNavi);
  einmal('[data-akte]',bindAkte);
  einmal('[data-abst]',zeichneAbst);
}
