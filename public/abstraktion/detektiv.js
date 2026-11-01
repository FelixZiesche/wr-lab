// Eigentums-Detektiv: Die Schüler gehen einen Kauf Szene für Szene durch, bestimmen jedes Rechtsgeschäft
// (Kaufvertrag oder Übereignung) und seine Wirksamkeit. Daraus wächst das Schema der Kaufhandlung, und eine Tabelle zeigt
// nach jeder Szene, wem was gehört (Eigentum) und wer was hat (Besitz). Inhalte: DETEKTIV in daten.js.
//   detektiv(def) → HTML, bindDetektiv(root) bindet alle Detektive in root
// Fortschritt pro Fall im localStorage: ap-dt-<id> = {i: Szene, q: Frage in der Szene, f: Fehlversuche}. Ohne Firestore,
// im Lernraum arbeitet jeder auf seinem Gerät (die Klasse urteilt in den Abstimmungen gemeinsam).
import { $, $$, esc, store } from '../shared/js/ui.js';
import { ST, ZEILE } from './daten.js';

const DEFS=new Map();
const KEY=id=>`ap-dt-${id}`;
const fokus=el=>{if(!el)return;if(!el.matches('button'))el.tabIndex=-1;el.focus({preventScroll:false})};

export function detektiv(def){
  DEFS.set(def.id,def);
  return `<section class="aufgabe dt" data-dt="${def.id}"><p class="aufgabe-kopf"><span class="ms sm" aria-hidden="true">person_search</span>Eigentums-Detektiv</p>
    <p class="aufgabe-frage">${def.titel}</p>
    <div class="dt-grid">
      <div class="dt-fall stack" data-dt-fall></div>
      <div class="dt-brett stack" data-dt-brett aria-label="Schema und Eigentum" role="region"></div>
    </div></section>`;
}

/** Zustand nach den Szenen 0 … bis-1: Schema-Zeilen, Eigentum und Besitz */
function stand(def,bis){
  const z={zeilen:[],eigentum:{...def.start.eigentum},besitz:{...def.start.besitz},neu:new Set()};
  def.szenen.slice(0,bis).forEach((s,k)=>{const d=s.dann||{},letzte=k===bis-1;
    if(d.zeile){z.zeilen.push({...d.zeile});if(letzte)z.neu.add('z'+(z.zeilen.length-1))}
    Object.entries(d.status||{}).forEach(([i,st])=>{z.zeilen[i].st=st;if(letzte)z.neu.add('z'+i)});
    Object.entries(d.eigentum||{}).forEach(([s2,p])=>{z.eigentum[s2]=p;if(letzte)z.neu.add('e'+s2)});
    Object.entries(d.besitz||{}).forEach(([s2,p])=>{z.besitz[s2]=p;if(letzte)z.neu.add('b'+s2)})});
  return z;
}
const person=(def,k)=>{const p=def.personen[k];return `<span class="dt-person"><span class="ms sm" aria-hidden="true">${p.icon}</span>${esc(p.name)}</span>`};
function brettHTML(def,bis){
  const z=stand(def,bis);
  const zeilen=z.zeilen.map((r,i)=>{const a=ZEILE[r.art],[k,ic,t]=ST[r.st];
    return `<li class="dt-zeile dt-art-${r.art} dt-${k}${z.neu.has('z'+i)?' neu':''}"><span class="dt-zeile-ic"><span class="ms" aria-hidden="true">${a.icon}</span></span>
      <span class="dt-zeile-text"><span><b>${a.t}</b> <span class="small muted">${a.p}</span></span><span class="small">${person(def,r.von)} <span aria-hidden="true">${a.pfeil}</span><span class="sr-only">${r.art==='kv'?'und':'an'}</span> ${person(def,r.an)} · ${esc(r.was)}</span></span>
      <span class="pill ${k}"><span class="ms" aria-hidden="true">${ic}</span>${t}</span></li>`}).join('');
  const tab=Object.entries(def.sachen).map(([s,x])=>`<tr><th scope="row"><span class="ms sm" aria-hidden="true">${x.icon}</span>${esc(x.name)}</th>
    <td class="${z.neu.has('e'+s)?'neu':''}">${person(def,z.eigentum[s])}</td><td class="${z.neu.has('b'+s)?'neu':''}">${person(def,z.besitz[s])}</td></tr>`).join('');
  return `<h4 class="title-s"><span class="ms sm" aria-hidden="true">account_tree</span>Dein Schema der Kaufhandlung</h4>
    ${zeilen?`<ol class="dt-schema">${zeilen}</ol>`:'<p class="small muted">Noch leer. Jedes Rechtsgeschäft, das du erkennst, landet hier.</p>'}
    <h4 class="title-s"><span class="ms sm" aria-hidden="true">key</span>Wem gehört was, wer hat was?</h4>
    <div class="dt-tab-wrap"><table class="dt-tab"><thead><tr><th scope="col">Sache</th><th scope="col">Eigentümer<span class="small muted"> (gehört)</span></th><th scope="col">Besitzer<span class="small muted"> (hat)</span></th></tr></thead><tbody>${tab}</tbody></table></div>`;
}

function bind(box){
  const def=DEFS.get(box.dataset.dt);if(!def||box.dataset.dtGebunden)return;box.dataset.dtGebunden='1';
  const fall=$('[data-dt-fall]',box),brett=$('[data-dt-brett]',box),n=def.szenen.length;
  let x=store(KEY(def.id));if(!x||typeof x.i!=='number'||x.i>n)x={i:0,q:0,f:0};
  let fb=null; // Rückmeldung zur letzten Antwort: {ok, t, j}
  const sichern=()=>store(KEY(def.id),x);
  function zeichne(fokusZiel){
    brett.innerHTML=brettHTML(def,x.i>=n?n:x.i+(x.q>=(def.szenen[x.i]?.fragen.length||0)?1:0));
    if(x.i>=n){
      fall.innerHTML=`<p class="dt-schritt small muted">Fall gelöst</p><div class="fb ok stack"><p><span class="ms sm" aria-hidden="true">workspace_premium</span> <b>Fall gelöst${x.f?'':' – ohne einen einzigen Fehler'}!</b></p><p>${def.fazit}</p></div>
        <p class="small">Übertrag das Schema rechts in dein Heft: jedes Rechtsgeschäft mit Paragraf und ob es wirksam ist.</p>
        <div class="row"><button class="btn small" type="button" data-dt-neu><span class="ms" aria-hidden="true">restart_alt</span>Fall noch einmal lösen</button></div>`;
      if(fokusZiel)fokus($('.fb',fall));return;
    }
    const s=def.szenen[x.i],fertig=x.q>=s.fragen.length,fr=s.fragen[x.q],falsch=j=>fb&&!fb.ok&&fb.q===x.q&&fb.j===j;
    fall.innerHTML=`<p class="dt-schritt small muted"><span class="num">Szene ${x.i+1} von ${n}</span> · ${esc(s.szene)}</p>
      <div class="dt-szene"><p class="body-l">${s.t}</p></div>
      ${s.fragen.slice(0,x.q).map(q=>`<div class="dt-erledigt small"><span class="ms sm" aria-hidden="true">check</span><span><b>${q.f}</b> ${q.o[q.r]}</span></div>`).join('')}
      ${fertig?'':`<div class="dt-frage stack"><p class="title-m" id="dt-f-${def.id}">${fr.f}</p>
        <div class="dt-opt" role="group" aria-labelledby="dt-f-${def.id}">${fr.o.map((o,j)=>`<button class="btn${falsch(j)?' falsch':''}" type="button" data-dt-j="${j}"${falsch(j)?` aria-describedby="dt-fb-${def.id}"`:''}>${o}</button>`).join('')}</div></div>`}
      ${fb?`<div class="fb ${fb.ok?'ok':'amb'}" id="dt-fb-${def.id}" role="status"><b>${fb.ok?'Richtig!':'Nicht ganz.'}</b> ${fb.t}</div>`:''}
      ${fertig?`<div class="row"><button class="btn primary" type="button" data-dt-weiter><span class="ms" aria-hidden="true">arrow_forward</span>${x.i+1<n?'Nächste Szene':'Fall abschließen'}</button></div>`:''}`;
    if(fokusZiel==='weiter')$('[data-dt-weiter]',fall)?.focus();
    else if(fokusZiel==='frage')$('[data-dt-j]',fall)?.focus();
    else if(fokusZiel==='falsch')$(`[data-dt-j="${fb.j}"]`,fall)?.focus();
  }
  box.addEventListener('click',e=>{
    const b=e.target.closest('[data-dt-j],[data-dt-weiter],[data-dt-neu]');if(!b)return;
    if(b.dataset.dtNeu!==undefined){x={i:0,q:0,f:0};fb=null;sichern();zeichne('frage');return}
    if(b.dataset.dtWeiter!==undefined){x.i++;x.q=0;fb=null;sichern();zeichne(x.i>=n?'ende':'frage');return}
    const s=def.szenen[x.i],fr=s.fragen[x.q],j=+b.dataset.dtJ;
    if(j===fr.r){fb={ok:true,t:fr.e,j,q:x.q};x.q++;sichern();zeichne(x.q>=s.fragen.length?'weiter':'frage')}
    else{fb={ok:false,t:(fr.fehler||{})[j]||'Lies die Szene noch einmal genau.',j,q:x.q};x.f++;sichern();zeichne('falsch')}
  });
  zeichne();
}
export function bindDetektiv(root){$$('[data-dt]',root).forEach(bind)}
