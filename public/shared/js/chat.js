// Chat-Abenteuer für alle Themen: Eine Geschichte läuft als Messenger-Chat ab. Nach jeder Szene entscheiden die
// Schüler, was sie antworten oder tun, und erleben die Folgen. Ein „Rechts-Check“ im Chat erklärt danach, was das
// Gesetz dazu sagt. Mehrere Enden lassen sich nacheinander entdecken, gemerkt wird nur, welche schon gefunden sind.
//
//   chatgeschichte({id, titel, kontakte, start, szenen, enden, speicher, check})
//     kontakte {kid: {name, icon}}             Absender mit Material Symbol als Profilbild
//     szenen   {sid: {n: [nachricht…], wahl: [{t, sag, n: [nachricht…], weiter: sid | ende: eid}]}}
//              t   = Text des Knopfs; sag: true heißt, der Text wird als eigene Nachricht gesendet, sonst ist es eine Handlung
//              sag kann auch ein eigener Nachrichtentext sein; n = Folgen, die direkt nach der Entscheidung kommen
//     nachricht {von: kid, t} | {ich: t} | {info: t} (Erzähler, mittig) | {recht: t} (Rechts-Check)
//     enden    {eid: {titel, art: 'gut' | 'mittel' | 'schlecht', t}}
//     speicher localStorage-Schlüssel (Standard: <Präfix>-chat-<id>)
//     check    Name und Icon des Checks im Chat, Standard {name: 'Rechts-Check', icon: 'gavel'}, z. B. {name: 'Finanz-Check', icon: 'savings'}
// Bei reduzierter Bewegung erscheinen die Nachrichten sofort, sonst mit kurzem „schreibt …“.
// Icons, die das Thema in icons.txt braucht: chat, emoji_events, gavel, lock, more_horiz, replay und die Icons der Kontakte.
import { $, $$, esc, store } from './ui.js';
import { raum, registriere } from './lernraum.js';

const DEFS=new Map();
const ART={gut:['ok','emoji_events','Bestes Ende'],mittel:['amb','help','Geht so'],schlecht:['bad','block','Schlechtes Ende']};
const ruhig=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const warte=ms=>new Promise(r=>setTimeout(r,ms));

export function chatgeschichte(def){
  const {id,titel,enden}=def;DEFS.set(id,def);
  registriere({id,frage:titel,loesung:Object.values(enden).map(e=>`<b>${e.titel}</b> (${ART[e.art][2]}): ${e.t}`)});
  return `<section class="aufgabe chat" data-chat="${id}">
    <p class="aufgabe-kopf"><span class="ms sm" aria-hidden="true">chat</span>Chat-Abenteuer</p>
    <p class="aufgabe-frage">${titel}</p>
    <div class="chat-grid">
      <div class="chat-handy">
        <div class="chat-verlauf" data-chat-verlauf role="log" aria-live="polite" aria-label="Chatverlauf" tabindex="0"></div>
        <div class="chat-wahl" data-chat-wahl role="group" aria-label="Was tust du?"></div>
      </div>
      <div class="chat-seite stack"><p class="title-s">Enden <span class="num small muted" data-chat-n></span></p><ul class="chat-enden" data-chat-enden></ul>
        <div class="row"><button class="btn small" type="button" data-chat-neu><span class="ms" aria-hidden="true">replay</span>Von vorn spielen</button></div></div>
    </div></section>`;
}

const blase=(def,m)=>{
  if(m.info)return `<p class="chat-info">${m.info}</p>`;
  if(m.recht){const c=def.check||{name:'Rechts-Check',icon:'gavel'};return `<div class="chat-recht"><p class="chat-recht-kopf"><span class="ms sm" aria-hidden="true">${c.icon}</span>${c.name}</p><p>${m.recht}</p></div>`}
  if(m.ich)return `<div class="chat-zeile ich"><p class="chat-blase"><span class="sr-only">Du: </span>${esc(m.ich)}</p></div>`;
  if(m.tat)return `<div class="chat-zeile ich"><p class="chat-tat"><span class="sr-only">Du entscheidest: </span>${esc(m.tat)}</p></div>`;
  const k=def.kontakte[m.von]||{name:m.von,icon:'person'};
  return `<div class="chat-zeile"><span class="chat-bild" aria-hidden="true"><span class="ms sm">${k.icon}</span></span><div class="chat-blase"><p class="chat-name">${esc(k.name)}</p><p>${m.t}</p></div></div>`;
};

export function bindChat(box){
  const def=DEFS.get(box.dataset.chat);if(!def)return;
  const verlauf=$('[data-chat-verlauf]',box),wahl=$('[data-chat-wahl]',box),key=def.speicher||`${raum.speicher()}-chat-${def.id}`;
  let gefunden=new Set((store(key)||{}).enden||[]),lauf=0;
  const zeigeEnden=()=>{
    const alle=Object.entries(def.enden);
    $('[data-chat-n]',box).textContent=`${[...gefunden].filter(e=>def.enden[e]).length} von ${alle.length} entdeckt`;
    $('[data-chat-enden]',box).innerHTML=alle.map(([eid,e])=>{const da=gefunden.has(eid),[k,ic]=ART[e.art];
      return `<li class="${da?k:'zu'}"><span class="ms sm" aria-hidden="true">${da?ic:'lock'}</span><span>${da?`<b>${e.titel}</b>`:'<span class="sr-only">Noch nicht entdeckt: </span>???'}</span></li>`}).join('');
  };
  const unten=()=>{verlauf.scrollTop=verlauf.scrollHeight};
  // Nachrichten nacheinander anhängen; nr bricht ab, wenn inzwischen neu gestartet wurde
  async function sende(liste,nr){
    for(const m of liste||[]){
      if(nr!==lauf)return false;
      if(!ruhig()&&m.von){verlauf.insertAdjacentHTML('beforeend','<p class="chat-tippt" data-tippt><span class="ms sm" aria-hidden="true">more_horiz</span>schreibt …</p>');unten();await warte(650);$('[data-tippt]',verlauf)?.remove();if(nr!==lauf)return false}
      else if(!ruhig())await warte(250);
      verlauf.insertAdjacentHTML('beforeend',blase(def,m));unten();
    }
    return nr===lauf;
  }
  async function szene(sid,nr){
    const s=def.szenen[sid];wahl.innerHTML='';
    if(!await sende(s.n,nr))return;
    wahl.innerHTML=s.wahl.map((w,i)=>`<button class="btn chat-knopf" type="button" data-w="${i}">${w.t}</button>`).join('');
    $$('[data-w]',wahl).forEach(b=>b.addEventListener('click',()=>waehle(s.wahl[+b.dataset.w],nr)));
    $('[data-w]',wahl).focus({preventScroll:true});
  }
  async function waehle(w,nr){
    if(nr!==lauf)return;wahl.innerHTML='';
    const eigen=w.sag?{ich:typeof w.sag==='string'?w.sag:w.t}:{tat:w.t};
    if(!await sende([eigen,...(w.n||[])],nr))return;
    if(w.weiter)return szene(w.weiter,nr);
    const e=def.enden[w.ende],[k,ic,art]=ART[e.art];
    gefunden.add(w.ende);store(key,{enden:[...gefunden]});zeigeEnden();
    verlauf.insertAdjacentHTML('beforeend',`<div class="fb ${k} chat-ende" tabindex="-1"><p><span class="ms sm" aria-hidden="true">${ic}</span> <b>${art}: ${e.titel}</b></p><p>${e.t}</p></div>`);unten();
    const alle=Object.keys(def.enden).every(x=>gefunden.has(x));
    wahl.innerHTML=`<button class="btn primary" type="button" data-chat-nochmal><span class="ms" aria-hidden="true">replay</span>${alle?'Noch einmal spielen':'Anderes Ende suchen'}</button>`;
    $('[data-chat-nochmal]',wahl).addEventListener('click',neu);
    $('.chat-ende:last-of-type',verlauf).focus({preventScroll:true});
  }
  function neu(){lauf++;verlauf.innerHTML='';szene(def.start,lauf)}
  $('[data-chat-neu]',box).addEventListener('click',neu);
  zeigeEnden();lauf++;szene(def.start,lauf);
}
