// Aufgaben-Bausteine für alle Themen: Schreibfeld „an die Wand“, Zuordnen, Lückentext, Test mit einem Versuch,
// gestufte Hilfen und Gesprächsimpuls. Jede Funktion liefert HTML für die html()-Funktion einer Werkstatt.
// werkstatt.js ruft danach bindAufgaben(root) auf. Lösungen und Erwartungshorizont stehen nie auf der Seite der
// Schüler, sondern nur im Lehrerpanel (siehe lernraum.js, AUFGABEN).
//
//   schreibfeld({id, frage, anfaenge:[…], tipp, denkWeiter, erwartung:[…]})
//   zuordnen({id, frage, faecher:[{id, t}], karten:[{t, f}]})          f = id des richtigen Fachs
//   lueckentext({id, titel, saetze:['Text mit [Lösung|Alternative] …']})
//   test({id, titel, fragen:[{f, o:[…], r, e}]})                       r = Index der richtigen Option, e = Erklärung
//   hilfen({tipp, denkWeiter}), impuls(text)
//
// id: Kleinbuchstaben, Ziffern, Bindestrich (max. 40 Zeichen), eindeutig im Thema. Texte in frage, tipp usw. dürfen HTML enthalten.
import { $, $$, esc, store } from './ui.js';
import { raum, registriere } from './lernraum.js';

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
export function zuordnen({id,frage,faecher,karten}){
  registriere({id,frage,loesung:faecher.map(f=>`<b>${f.t}:</b> ${karten.filter(k=>k.f===f.id).map(k=>k.t).join(' · ')}`)});
  return `<section class="aufgabe" data-zuordnen="${id}" data-karten="${esc(JSON.stringify(karten.map(k=>k.f)))}">${kopf('category','Zuordnen')}
  <p class="aufgabe-frage">${frage}</p>
  <p class="small muted">Tippe eine Karte an und dann das passende Fach – oder zieh die Karte hinein.</p>
  <div class="zu-fach zu-pool" data-fach=""><button class="zu-ziel" type="button" data-ziel="">Noch nicht zugeordnet</button><div class="zu-inhalt">${karten.map((k,i)=>`<button class="zu-karte" type="button" draggable="true" data-k="${i}" aria-pressed="false">${k.t}</button>`).join('')}</div></div>
  <div class="zu-faecher">${faecher.map(f=>`<div class="zu-fach" data-fach="${esc(f.id)}"><button class="zu-ziel" type="button" data-ziel="${esc(f.id)}">${f.t}</button><div class="zu-inhalt"></div></div>`).join('')}</div>
  <div class="row"><button class="btn primary small" type="button" data-pruefen><span class="ms">task_alt</span>Prüfen</button><button class="btn small" type="button" data-neu><span class="ms">restart_alt</span>Neu</button><span class="small" data-ergebnis role="status"></span></div></section>`;
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
    zeichne(true);
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

/** Macht alle Aufgaben in root interaktiv (jede nur einmal). */
export function bindAufgaben(root){
  const einmal=(sel,f)=>$$(sel,root).forEach(b=>{if(b.dataset.gebunden)return;b.dataset.gebunden='1';f(b)});
  einmal('[data-schreib]',bindSchreibfeld);
  einmal('[data-zuordnen]',bindZuordnen);
  einmal('[data-luecken]',bindLuecken);
  einmal('[data-test]',bindTest);
}
