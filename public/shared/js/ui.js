// Gemeinsame Hilfsfunktionen für alle Themen im WR-Lab.
export const $ = (s,r=document)=>r.querySelector(s);
export const $$ = (s,r=document)=>Array.from(r.querySelectorAll(s));
export const fmt=(n,d=1)=>Number(n).toLocaleString('de-DE',{minimumFractionDigits:d,maximumFractionDigits:d});
export const sgn=(n,d=1)=>(n>0?'+':n<0?'−':'±')+fmt(Math.abs(n),d);
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/** Liest (ein Argument) oder schreibt (zwei Argumente) einen Wert im localStorage dieses Browsers. */
export function store(k,v){try{ if(v===undefined){return JSON.parse(localStorage.getItem(k)||'null')} localStorage.setItem(k,JSON.stringify(v)) }catch(e){return null}}

/* ---------- Foto mit Infopunkten ----------
   p = {src, alt, credit, hs:[{x, y, t, d}]}  (x, y in Prozent)
   key = Speicherschlüssel für die bereits entdeckten Infopunkte, z. B. 'ms6-hs-0' */
const PHOTOS=new Map();
export function photoHTML(p,key){PHOTOS.set(key,p);return `<figure class="photo" data-photo="${esc(key)}"><img src="${p.src}" alt="${esc(p.alt)}">${p.hs.map((h,i)=>`<button class="hotspot" type="button" data-h="${i}" style="left:${h.x}%;top:${h.y}%" aria-label="Infopunkt: ${esc(h.t)}" aria-expanded="false"><span class="ms">add</span></button>`).join('')}<figcaption>${esc(p.credit)}</figcaption></figure><span class="hs-progress"><span class="ms sm">touch_app</span><span data-hsp></span></span><div class="hs-info" data-hsi hidden></div>`}
export function bindPhoto(root){$$('.photo',root).forEach(fig=>{
  const key=fig.dataset.photo,M=PHOTOS.get(key),box=fig.parentElement;if(!M)return;const seen=new Set(store(key)||[]);
  const info=$('[data-hsi]',box),prog=$('[data-hsp]',box);
  const upd=()=>{prog.textContent=seen.size<M.hs.length?`Tippe auf die Punkte im Foto: ${seen.size} von ${M.hs.length} entdeckt`:`Alle ${M.hs.length} Infopunkte entdeckt`;$$('.hotspot',fig).forEach(b=>{const i=+b.dataset.h;b.classList.toggle('seen',seen.has(i));$('.ms',b).textContent=seen.has(i)?'check':'add'})};
  $$('.hotspot',fig).forEach(b=>b.addEventListener('click',()=>{const i=+b.dataset.h,h=M.hs[i];seen.add(i);store(key,[...seen]);
    $$('.hotspot',fig).forEach(x=>x.setAttribute('aria-expanded',String(x===b)));
    info.hidden=false;info.innerHTML=`<span class="ms">info</span><div><p class="title-s">${esc(h.t)}</p><p class="small" style="margin-top:4px">${esc(h.d)}</p></div><button class="icon-btn" type="button" aria-label="Infopunkt schließen"><span class="ms">close</span></button>`;
    $('button',info).addEventListener('click',()=>{info.hidden=true;b.setAttribute('aria-expanded','false');b.focus()});upd()}));
  upd()})}
