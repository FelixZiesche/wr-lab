// Gemeinsame Hilfsfunktionen für alle Themen im WR-Lab.
export const $ = (s,r=document)=>r.querySelector(s);
export const $$ = (s,r=document)=>Array.from(r.querySelectorAll(s));
export const fmt=(n,d=1)=>Number(n).toLocaleString('de-DE',{minimumFractionDigits:d,maximumFractionDigits:d});
export const sgn=(n,d=1)=>(n>0?'+':n<0?'−':'±')+fmt(Math.abs(n),d);
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/** Liest (ein Argument) oder schreibt (zwei Argumente) einen Wert im localStorage dieses Browsers. */
export function store(k,v){try{ if(v===undefined){return JSON.parse(localStorage.getItem(k)||'null')} localStorage.setItem(k,JSON.stringify(v)) }catch(e){return null}}

/** Ersetzt den Inhalt von el nur, wenn sich das HTML geändert hat (Live-Ereignisse kommen oft ohne sichtbare Änderung)
 *  oder anderer Code el inzwischen überschrieben hat. Lag der Tastaturfokus darin, kommt er ohne Scrollen zurück an
 *  dasselbe Element (gleiche id bzw. gleiche data-Attribute, sonst das erste mit demselben data-Attribut, sonst ersatz
 *  = Selektor; ist ersatz kein Bedienelement, wird es per tabIndex=-1 fokussierbar). Offene <details> bleiben offen,
 *  ein angefangener Eintrag im fokussierten Feld bleibt stehen. Gibt true zurück, wenn neu gezeichnet wurde:
 *  Listener deshalb nur dann setzen oder per Delegation am Elternelement binden. */
const fokusSchluessel=e=>e.id?'#'+CSS.escape(e.id):[...e.attributes].filter(x=>x.name.startsWith('data-')).map(x=>`[${x.name}="${CSS.escape(x.value)}"]`).join('')||null;
export function neuZeichnen(el,html,ersatz){
  if(el._html===html&&el._erst===el.firstChild)return false;
  const a=document.activeElement,drin=!!a&&a!==el&&el.contains(a),k=drin?fokusSchluessel(a):null,i=k?$$(k,el).indexOf(a):-1;
  const k2=drin&&!a.id?[...a.attributes].find(x=>x.name.startsWith('data-'))?.name:null;
  const dk=d=>d.id||$('summary',d)?.textContent||'',offen=new Set($$('details[open]',el).map(dk)),wert=drin&&/^(INPUT|TEXTAREA)$/.test(a.tagName)?a.value:null;
  el.innerHTML=html;el._html=html;el._erst=el.firstChild;
  $$('details',el).forEach(d=>{if(offen.has(dk(d)))d.open=true});
  if(drin){
    // sonst das nächste Element derselben Art (z. B. der andere Beschluss-Knopf), sonst ersatz
    let z=k?($$(k,el)[i]||$(k,el)||(k2&&$(`[${k2}]:not(:disabled)`,el))):null;if(z&&z.disabled)z=null;
    if(!z&&ersatz){z=$(ersatz,el);if(z&&!z.matches('a[href],button,input,select,textarea,summary,[tabindex]'))z.tabIndex=-1}
    if(z){if(wert!=null&&z.tagName===a.tagName)z.value=wert;z.focus({preventScroll:true})}
  }
  return true;
}

/* ---------- Foto mit Infopunkten ----------
   p = {src, alt, credit, hs:[{x, y, t, d}]}  (x, y in Prozent)
   key = Speicherschlüssel für die bereits entdeckten Infopunkte, z. B. 'ms6-hs-0'
   Nach dem Antippen springt der Fokus in die Erklärung (Screenreader lesen sie vor), „Schließen“ führt zurück zum Punkt. */
const PHOTOS=new Map();
const hsiId=key=>'hsi-'+String(key).replace(/[^\w-]/g,'');
export function photoHTML(p,key){PHOTOS.set(key,p);const id=hsiId(key);return `<figure class="photo" data-photo="${esc(key)}"><img src="${p.src}" alt="${esc(p.alt)}">${p.hs.map((h,i)=>`<button class="hotspot" type="button" data-h="${i}" style="left:${h.x}%;top:${h.y}%" aria-label="Infopunkt: ${esc(h.t)}" aria-expanded="false" aria-controls="${id}"><span class="ms" aria-hidden="true">add</span></button>`).join('')}<figcaption>${esc(p.credit)}</figcaption></figure><span class="hs-progress"><span class="ms sm" aria-hidden="true">touch_app</span><span data-hsp></span></span><div class="hs-info" id="${id}" data-hsi tabindex="-1" hidden></div>`}
export function bindPhoto(root){$$('.photo',root).forEach(fig=>{
  const key=fig.dataset.photo,M=PHOTOS.get(key),box=fig.parentElement;if(!M)return;const seen=new Set(store(key)||[]);
  const info=$('[data-hsi]',box),prog=$('[data-hsp]',box);
  const upd=()=>{prog.textContent=seen.size<M.hs.length?`Tippe auf die Punkte im Foto: ${seen.size} von ${M.hs.length} entdeckt`:`Alle ${M.hs.length} Infopunkte entdeckt`;$$('.hotspot',fig).forEach(b=>{const i=+b.dataset.h;b.classList.toggle('seen',seen.has(i));$('.ms',b).textContent=seen.has(i)?'check':'add'})};
  $$('.hotspot',fig).forEach(b=>b.addEventListener('click',()=>{const i=+b.dataset.h,h=M.hs[i];seen.add(i);store(key,[...seen]);
    $$('.hotspot',fig).forEach(x=>x.setAttribute('aria-expanded',String(x===b)));
    info.hidden=false;info.innerHTML=`<span class="ms" aria-hidden="true">info</span><div><p class="title-s" id="${info.id}-t">${esc(h.t)}</p><p class="small" id="${info.id}-d" style="margin-top:4px">${esc(h.d)}</p></div><button class="icon-btn" type="button" aria-label="Infopunkt schließen"><span class="ms" aria-hidden="true">close</span></button>`;
    info.setAttribute('role','group');info.setAttribute('aria-labelledby',info.id+'-t');info.setAttribute('aria-describedby',info.id+'-d');
    $('button',info).addEventListener('click',()=>{info.hidden=true;b.setAttribute('aria-expanded','false');b.focus()});upd();info.focus()}));
  upd()})}

/** Kurzer Hinweis am unteren Rand (M3-Snackbar), verschwindet nach einigen Sekunden. */
let snackT=null;
export function zeigeHinweis(text){
  let el=document.getElementById('snackbar');
  if(!el){el=document.createElement('div');el.id='snackbar';el.className='snackbar';el.setAttribute('role','status');el.setAttribute('aria-live','polite');document.body.append(el)}
  el.textContent=text;el.classList.add('zeigen');clearTimeout(snackT);snackT=setTimeout(()=>el.classList.remove('zeigen'),4500);
}

/** Text in die Zwischenablage kopieren. Gibt ein Promise mit true oder false zurück. */
export function kopieren(text){
  const alt=()=>{const ta=document.createElement('textarea');ta.value=text;ta.setAttribute('readonly','');ta.style.cssText='position:fixed;opacity:0';document.body.append(ta);ta.select();
    let ok=false;try{ok=document.execCommand('copy')}catch(e){}ta.remove();return ok};
  try{if(navigator.clipboard&&window.isSecureContext)return navigator.clipboard.writeText(text).then(()=>true,alt)}catch(e){}
  return Promise.resolve(alt());
}
// Knöpfe mit data-kopiere="#id" kopieren den Text des Elements
document.addEventListener('click',async e=>{
  const b=e.target.closest('[data-kopiere]');if(!b)return;
  const el=document.querySelector(b.dataset.kopiere);if(!el)return;
  zeigeHinweis(await kopieren(el.textContent)?'Kopiert.':'Kopieren hat nicht geklappt. Markiere den Text und kopiere ihn selbst.');
});
