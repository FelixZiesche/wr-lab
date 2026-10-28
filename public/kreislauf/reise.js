// Einstieg der Lernwerkstatt Wirtschaftskreislauf: „Ein Euro auf Reise“. Peters Euro wandert durch fünf Hände,
// an jeder Station tippen die Schüler (oder ruft die Klasse), wohin er als Nächstes geht. Am Ende ist er wieder bei Peter,
// und die Gegenströme (Döner, Arbeit, Schuhe) erscheinen. Die falschen Tipps führen schon zu Banken, Staat und Ausland.
//   reiseHTML(), bindReise(root)
import { $, $$, esc, store } from '../shared/js/ui.js';
import { REISE } from './daten.js';

const KEY='wk-reise',C=220,R=140,N=REISE.length;
const ruhig=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const winkel=i=>(-90+360/N*i)*Math.PI/180;
const pos=(i,r=R)=>[C+r*Math.cos(winkel(i)),C+r*Math.sin(winkel(i))].map(v=>Math.round(v*10)/10);
// Bogen von Station i zur nächsten, mit etwas Abstand zu den Kreisen
function bogen(i,r,rueck){
  const a=winkel(i)+.24,b=winkel(i+1)-.24,p=t=>[C+r*Math.cos(t),C+r*Math.sin(t)].map(v=>Math.round(v*10)/10);
  const [x1,y1]=p(rueck?b:a),[x2,y2]=p(rueck?a:b);
  return `M${x1} ${y1} A${r} ${r} 0 0 ${rueck?0:1} ${x2} ${y2}`;
}

export function reiseHTML(){
  return `<section class="aufgabe stack wk-reise" data-wk-reise>
  <p class="aufgabe-kopf"><span class="ms sm" aria-hidden="true">euro</span>Ein Euro auf Reise</p>
  <div class="wk-reise-grid">
    <svg class="wk-ring" viewBox="0 0 440 440" role="img" aria-labelledby="wk-ring-t"><title id="wk-ring-t">Der Weg von Peters Euro</title>
      <defs><marker id="wk-r-geld" viewBox="0 0 10 10" refX="8" refY="5" markerUnits="userSpaceOnUse" markerWidth="16" markerHeight="16" orient="auto"><path class="wk-mk-geld" d="M0 0 L10 5 L0 10 z"/></marker>
        <marker id="wk-r-gut" viewBox="0 0 10 10" refX="8" refY="5" markerUnits="userSpaceOnUse" markerWidth="14" markerHeight="14" orient="auto"><path class="wk-mk-gut" d="M0 0 L10 5 L0 10 z"/></marker></defs>
      <g data-wk-wege></g>
      ${REISE.map((s,i)=>{const [x,y]=pos(i),[lx,ly]=pos(i,R+52);
        return `<g class="wk-station" data-st="${i}"><circle cx="${x}" cy="${y}" r="32"/><text class="wk-ic" x="${x}" y="${y+12}" text-anchor="middle" aria-hidden="true">${s.icon}</text>
        <text class="wk-st-name" x="${lx}" y="${ly}" text-anchor="${Math.abs(lx-C)<20?'middle':lx<C?'end':'start'}">${esc(s.wer)}</text>
        <text class="wk-st-sek" x="${lx}" y="${ly+18}" text-anchor="${Math.abs(lx-C)<20?'middle':lx<C?'end':'start'}">${esc(s.sektor)}</text></g>`}).join('')}
      <g class="wk-muenze" data-wk-muenze><circle r="20"/><text text-anchor="middle" y="7">1 €</text></g>
    </svg>
    <div class="stack" data-wk-reise-inhalt aria-live="polite"></div>
  </div></section>`;
}

export function bindReise(root){
  const box=$('[data-wk-reise]',root);if(!box)return;
  let st={i:0,t:[],...(store(KEY)||{})},offen=null; // i: so viele Etappen geschafft, t: Tipps; offen: Tipp dieser Etappe, noch nicht weiter
  const inhalt=$('[data-wk-reise-inhalt]',box),muenze=$('[data-wk-muenze]',box);
  if(ruhig())muenze.style.transition='none';
  function setze(){const [x,y]=pos(st.i%N,R-46);muenze.style.transform=`translate(${x}px,${y}px)`}
  function wege(){
    const ende=st.i>=N;
    $('[data-wk-wege]',box).innerHTML=REISE.slice(0,st.i).map((s,i)=>`<path class="wk-weg" d="${bogen(i,R)}" marker-end="url(#wk-r-geld)"/>`).join('')
      +(ende?REISE.map((s,i)=>s.gegen?`<path class="wk-gegen" d="${bogen(i,R-62,true)}" marker-end="url(#wk-r-gut)"/>`
        +(()=>{const t=(winkel(i)+winkel(i+1))/2,x=C+(R-90)*Math.cos(t),y=C+(R-90)*Math.sin(t);return `<text class="wk-gegen-t" x="${Math.round(x)}" y="${Math.round(y)+5}" text-anchor="middle">${esc(s.gegen)}</text>`})():'').join(''):'');
    $$('.wk-station',box).forEach(g=>g.classList.toggle('hier',+g.dataset.st===st.i%N&&!ende));
  }
  function zeichne(fokus){
    setze();wege();
    if(st.i>=N){
      const treffer=st.t.filter((t,i)=>t===REISE[i].r).length;
      inhalt.innerHTML=`<div class="fb ok" tabindex="-1"><b>Der Euro ist wieder bei Peter!</b> Er ist im Kreis gewandert. Was der eine ausgibt, ist für den anderen Einkommen.</div>
        <p class="wk-treffer"><span class="big-num num">${treffer} von ${N}</span> richtig getippt</p>
        <div class="panel stack"><p><span class="ms sm wk-gut-farbe" aria-hidden="true">sync_alt</span> <b>Jeder Strom hat einen Gegenstrom.</b> Für Peters Euro gab es einen Döner, für Murats Lohn seine Arbeit. Nur beim Taschengeld nicht: Peter und seine Mutter sind ein Haushalt.</p>
        <p class="small">Und die anderen Tipps? Kopfkissen, Finanzamt und China gibt es auch. Banken, Staat und Ausland baust du später in den Kreislauf ein.</p></div>
        <div class="row"><button class="btn" type="button" data-wk-reise-neu><span class="ms" aria-hidden="true">replay</span>Noch einmal reisen</button><button class="btn primary" type="button" data-gehzu="einfach"><span class="ms" aria-hidden="true">arrow_forward</span>Kreislauf bauen</button></div>`;
      if(fokus)$('.fb',inhalt).focus();return;
    }
    const s=REISE[st.i];
    inhalt.innerHTML=`<p class="eyebrow">Station ${st.i+1} von ${N}</p><p class="title-m">${esc(s.frage)}</p>
      <div class="wk-tipps" role="group" aria-label="Dein Tipp">${s.o.map((o,j)=>`<button class="wk-tipp${offen!=null&&j===s.r?' richtig':''}${offen===j&&j!==s.r?' daneben':''}" type="button" data-wk-tipp="${j}" ${offen!=null?'disabled':''} aria-pressed="${offen===j}"><span class="ms" aria-hidden="true">${o.icon}</span><span>${esc(o.t)}</span></button>`).join('')}</div>
      ${offen!=null?`<div class="fb ${offen===s.r?'ok':'amb'}" tabindex="-1"><b>${offen===s.r?'Richtig getippt!':'Diesmal nicht.'}</b> ${esc(s.weg)}</div>
        <div class="row"><button class="btn primary" type="button" data-wk-weiter><span class="ms" aria-hidden="true">arrow_forward</span>Der Euro wandert weiter</button></div>`:''}`;
    if(fokus)(offen!=null?$('.fb',inhalt):$('[data-wk-tipp]',inhalt)).focus();
  }
  inhalt.addEventListener('click',e=>{
    const t=e.target.closest('[data-wk-tipp]');
    if(t&&offen==null){offen=+t.dataset.wkTipp;zeichne(true);return}
    if(e.target.closest('[data-wk-weiter]')){st.t[st.i]=offen;st.i++;offen=null;store(KEY,st);zeichne(true);return}
    if(e.target.closest('[data-wk-reise-neu]')){st={i:0,t:[]};offen=null;store(KEY,st);zeichne(true)}
  });
  zeichne(false);
}
