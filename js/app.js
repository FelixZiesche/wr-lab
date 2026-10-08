(function(){
"use strict";

/* ---------- Grunddaten ---------- */
const ORDER=['P','B','W','A','U','V'];
const G={
  P:{name:'Stabilität des Preisniveaus',short:'Preisniveau',since:'1967',law:'§ 1 StabG; für die EZB vorrangig: Art. 127 AEUV',
     ind:'Verbraucherpreisindex (VPI), im Euroraum der Harmonisierte VPI (HVPI); Veränderung zum Vorjahr = Inflationsrate',
     target:'Inflationsrate von 2 % auf mittlere Sicht (EZB-Strategie seit 2021, symmetrisch: Abweichungen nach oben und unten sind gleich unerwünscht)',
     now:'3,3 % im September 2026 (vorläufig), getrieben von Energie (+14,9 %); Kerninflation 2,4 %. Jahresdurchschnitt 2025: 2,2 %',
     who:'Vor allem die Europäische Zentralbank (Geldpolitik), daneben Tarifpartner (Löhne) und Staat (Steuern, Abgaben, administrierte Preise)',
     risk:'Inflation: Kaufkraftverlust, Umverteilung zulasten von Sparern und Geringverdienern, Gefahr einer Lohn-Preis-Spirale. Deflation: Kaufzurückhaltung, Investitionsstau, steigende reale Schuldenlast',
     tool:'preis', chip:'3,3 %', chipLab:'Inflation Sept. 2026'},
  B:{name:'Hoher Beschäftigungsstand',short:'Beschäftigung',since:'1967',law:'§ 1 StabG',
     ind:'Arbeitslosenquote der Bundesagentur für Arbeit (registrierte Arbeitslose bezogen auf alle zivilen Erwerbspersonen); ergänzend ILO-Erwerbslosenquote und Unterbeschäftigung',
     target:'Keine gesetzliche Zahl. Faustregel: Unter etwa 3 % spricht man von Vollbeschäftigung, weil Sucharbeitslosigkeit immer bleibt',
     now:'6,4 % im September 2026 (2,994 Mio. Arbeitslose); Unterbeschäftigung 3,6 Mio. Thüringen: 6,5 % (Juli 2026)',
     who:'Staat (Fiskal-, Bildungs-, Arbeitsmarktpolitik), Bundesagentur für Arbeit, Tarifpartner, Unternehmen',
     risk:'Einkommensverlust und Armutsrisiko, Ausfälle bei Steuern und Sozialbeiträgen, Entwertung von Qualifikationen, gesellschaftliche Folgen wie Ausgrenzung',
     tool:'beschaeftigung', chip:'6,4 %', chipLab:'Arbeitslosenquote Sept. 2026'},
  W:{name:'Stetiges und angemessenes Wirtschaftswachstum',short:'Wachstum',since:'1967',law:'§ 1 StabG',
     ind:'Veränderungsrate des realen (preisbereinigten) Bruttoinlandsprodukts gegenüber dem Vorjahr',
     target:'Keine feste Zahl. „Stetig“ heißt ohne starke Schwankungen, „angemessen“ heißt: das Produktionspotenzial auslasten. Das Potenzialwachstum liegt in Deutschland wegen der schrumpfenden Erwerbsbevölkerung derzeit deutlich unter 1 %',
     now:'2025: +0,2 % nach zwei Rezessionsjahren (2023: −0,9 %, 2024: −0,5 %). 2. Quartal 2026: +0,3 % zum Vorquartal. Prognose 2026: +1,3 %',
     who:'Staat (Investitionen, Steuern, Rahmenbedingungen), indirekt die EZB über Zinsen, Unternehmen und Haushalte über Investitionen und Konsum',
     risk:'Zu wenig: Rezession, Arbeitslosigkeit, sinkende Steuereinnahmen. Zu viel: Überhitzung, Inflation, Ressourcenverbrauch',
     tool:'wachstum', chip:'+1,3 %', chipLab:'BIP-Prognose 2026'},
  A:{name:'Außenwirtschaftliches Gleichgewicht',short:'Außenwirtschaft',since:'1967',law:'§ 1 StabG',
     ind:'Saldo der Leistungsbilanz in Prozent des BIP (Handel mit Waren und Dienstleistungen plus Primär- und Sekundäreinkommen)',
     target:'Annähernd ausgeglichene Leistungsbilanz. Die EU-Frühwarnschwellen liegen bei mehr als +6 % oder weniger als −4 % des BIP (Dreijahresdurchschnitt)',
     now:'2025: Überschuss von rund 200 Mrd. € bzw. 4,4 % des BIP; Prognose 2026: 4,7 %',
     who:'Bundesregierung, EU (Handelspolitik ist EU-Kompetenz), Wechselkurs des Euro (frei schwankend)',
     risk:'Überschuss: Abhängigkeit vom Export, Handelskonflikte und Zölle, Risiko für die im Ausland angelegten Ersparnisse. Defizit: wachsende Auslandsverschuldung',
     tool:'aussen', chip:'+4,4 %', chipLab:'Leistungsbilanz 2025 (in % BIP)'},
  U:{name:'Schutz der natürlichen Lebensgrundlagen',short:'Umwelt',since:'Erweiterung',law:'Art. 20a GG (seit 1994), Bundes-Klimaschutzgesetz',
     ind:'Treibhausgasemissionen in Mio. t CO₂-Äquivalente; ergänzend Anteil erneuerbarer Energien, Flächenverbrauch, Artenvielfalt',
     target:'Klimaschutzgesetz: −65 % bis 2030 und −88 % bis 2040 gegenüber 1990, Netto-Treibhausgasneutralität bis 2045',
     now:'2025: rund 649 Mio. t, das sind etwa 48 % weniger als 1990. Für 2030 sind rund 438 Mio. t erlaubt',
     who:'Bund und EU (Emissionshandel, CO₂-Preis, Ordnungsrecht), Länder und Kommunen, Unternehmen und Haushalte',
     risk:'Klimafolgeschäden, Kosten für künftige Generationen. Das Bundesverfassungsgericht hat 2021 geurteilt, dass zu spätes Handeln die Freiheit künftiger Generationen verletzt',
     tool:'umwelt', chip:'−48 %', chipLab:'Treibhausgase ggü. 1990'},
  V:{name:'Gerechte Einkommens- und Vermögensverteilung',short:'Verteilung',since:'Erweiterung',law:'Sozialstaatsprinzip, Art. 20 Abs. 1 GG',
     ind:'Gini-Koeffizient, Armutsgefährdungsquote (Anteil der Menschen mit weniger als 60 % des mittleren Einkommens), Verhältnis oberstes zu unterstem Fünftel (S80/S20)',
     target:'Politisch umstritten, denn „gerecht“ ist eine Wertfrage: Leistungs-, Bedarfs- oder Chancengerechtigkeit?',
     now:'Armutsgefährdungsquote 16,1 % (2025), Schwelle für Alleinlebende 1.446 € netto im Monat. Gini der verfügbaren Einkommen rund 0,29 bis 0,30, bei Vermögen über 0,7',
     who:'Staat (Steuer-, Sozial-, Bildungspolitik), Tarifpartner (Lohnpolitik), Mindestlohnkommission',
     risk:'Schwindender gesellschaftlicher Zusammenhalt, ungleiche Bildungs- und Aufstiegschancen, politische Polarisierung, schwache Binnennachfrage',
     tool:'verteilung', chip:'16,1 %', chipLab:'Armutsgefährdung 2025'}
};
const gc = k => `var(--g-${k})`;

/* ---------- Hilfsfunktionen ---------- */
const $ = (s,r=document)=>r.querySelector(s);
const $$ = (s,r=document)=>Array.from(r.querySelectorAll(s));
const fmt=(n,d=1)=>Number(n).toLocaleString('de-DE',{minimumFractionDigits:d,maximumFractionDigits:d});
const sgn=(n,d=1)=>(n>0?'+':n<0?'−':'±')+fmt(Math.abs(n),d);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function store(k,v){try{ if(v===undefined){return JSON.parse(localStorage.getItem(k)||'null')} localStorage.setItem(k,JSON.stringify(v)) }catch(e){return null}}
function hexPts(cx,cy,r,n=6){return Array.from({length:n},(_,i)=>{const a=(-90+360/n*i)*Math.PI/180;return [cx+r*Math.cos(a),cy+r*Math.sin(a)]})}
const ptsStr=p=>p.map(q=>q.map(v=>v.toFixed(1)).join(',')).join(' ');
function hexDot(k){return `<svg class="hexdot" viewBox="0 0 12 12" aria-hidden="true"><polygon points="6,0.5 11,3.3 11,8.7 6,11.5 1,8.7 1,3.3" fill="${gc(k)}"/></svg>`}

/* ---------- Merksätze ---------- */
const MS={
  grundlagen:['Das magische Sechseck umfasst sechs Ziele der Wirtschaftspolitik: stabiles Preisniveau, hoher Beschäftigungsstand, außenwirtschaftliches Gleichgewicht und stetiges, angemessenes Wachstum (magisches Viereck, § 1 StabG 1967) sowie gerechte Einkommens- und Vermögensverteilung und Schutz der natürlichen Lebensgrundlagen.',
              '„Magisch“ heißt das Sechseck, weil sich nicht alle Ziele gleichzeitig vollständig erreichen lassen – wer eines fördert, gefährdet oft ein anderes.'],
  preis:['Die Inflationsrate misst die Veränderung des Verbraucherpreisindex gegenüber dem Vorjahr. Grundlage ist ein fester Warenkorb mit Gewichten (Wägungsschema). Die EZB strebt mittelfristig 2 % an.',
         'Der Reallohn steigt nur, wenn die Löhne schneller wachsen als die Preise: Reallohnänderung ≈ Nominallohnänderung − Inflationsrate.'],
  beschaeftigung:['Arbeitslosenquote = Arbeitslose ÷ (Erwerbstätige + Arbeitslose) × 100. Man unterscheidet friktionelle, saisonale, konjunkturelle und strukturelle Arbeitslosigkeit – die strukturelle ist am hartnäckigsten.'],
  wachstum:['Wirtschaftswachstum wird an der Veränderung des realen BIP gemessen (reales Wachstum ≈ nominales Wachstum − Preissteigerung). Die Konjunktur schwankt in Phasen um den Wachstumstrend: Aufschwung, Hochkonjunktur, Abschwung, Tiefstand.'],
  aussen:['Außenwirtschaftliches Gleichgewicht bedeutet eine annähernd ausgeglichene Leistungsbilanz. Deutschland hat seit Jahren hohe Überschüsse – das sichert Jobs in der Exportindustrie, macht aber abhängig und belastet Handelspartner.',
          'Wertet der Euro auf, werden deutsche Exporte im Ausland teurer und Importe billiger: Der Überschuss sinkt tendenziell.'],
  verteilung:['Die Lorenzkurve zeigt, welcher Anteil der Bevölkerung welchen Anteil am Einkommen hat. Der Gini-Koeffizient fasst das zusammen: 0 = alle gleich, 1 = einer hat alles. Der Staat verteilt über Steuern und Transfers um (Sekundärverteilung).'],
  umwelt:['Umweltschutz ist seit 1994 Staatsziel (Art. 20a GG). Deutschland will die Treibhausgase bis 2030 um 65 % gegenüber 1990 senken und 2045 klimaneutral sein. Ein CO₂-Preis macht externe Kosten sichtbar, verteuert aber fossile Energie.'],
  beziehungen:['Zwischen den Zielen bestehen Zielharmonie (Förderung des einen fördert das andere), Zielkonflikt (Förderung des einen gefährdet das andere) oder Zielneutralität. Viele Beziehungen sind ambivalent: Sie hängen von Zeitraum und Ursache ab.'],
  phillips:['Die Phillips-Kurve beschreibt einen Zielkonflikt zwischen Preisniveaustabilität und Beschäftigung. Bei Angebotsschocks (Ölkrise 1973, Energiekrise 2022) steigen Inflation und Arbeitslosigkeit gleichzeitig: Stagflation.'],
  politik:['Jede wirtschaftspolitische Maßnahme hat Haupt- und Nebenwirkungen. Wirtschaftspolitik bedeutet daher, Ziele zu gewichten und Prioritäten zu setzen – das ist eine politische Wertentscheidung.'],
  leben:['Wirtschaftspolitische Entscheidungen treffen Menschen sehr unterschiedlich: Was dem Sechseck insgesamt hilft, kann für einzelne Gruppen teuer sein. Zielkonflikte sind deshalb immer auch Interessenkonflikte zwischen Menschen.'],
  check:['Ob ein Ziel „erreicht“ ist, hängt von der Messlatte ab. Zielmarken wie 2 % Inflation oder −65 % Treibhausgase sind politische Setzungen, die man begründen und kritisieren kann.']
};
const MS_ALL=Object.entries(MS).flatMap(([t,a])=>a.map((s,i)=>({id:t+'-'+i,tool:t,text:s})));
let msGot=new Set(store('ms6-wissen')||[]);
let curView='start';
function saveMs(){store('ms6-wissen',[...msGot]);updMs();if(curView!=='spiel')renderView()}
function updMs(){$('#ms-count').textContent=`${msGot.size}/${MS_ALL.length}`}

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
    <p class="small muted">Gespeichert in „Mein Sechseck-Wissen“.</p></div></div>`;
}
function bindErk(root){
  $$('[data-erk]',root).forEach(box=>{
    const t=box.dataset.erk, btn=$('[data-erk-btn]',box), body=$('[data-erk-body]',box);
    const show=()=>{body.hidden=false;btn.hidden=true};
    if(MS[t].every((_,i)=>msGot.has(t+'-'+i))) show();
    btn.addEventListener('click',()=>{MS[t].forEach((_,i)=>msGot.add(t+'-'+i));saveMs();show()});
  });
}
function teacher(items){return `<details class="teacher"><summary><span class="ms sm">co_present</span>Für die Lehrkraft</summary><div><ul>${items.map(i=>`<li>${i}</li>`).join('')}</ul></div></details>`}

/* ---------- Sechseck-Grafik (Hero) ---------- */
function wrapText(str,max){const w=str.split(' ');const out=[];let cur='';w.forEach(x=>{if((cur+' '+x).trim().length>max&&cur){out.push(cur);cur=x}else cur=(cur+' '+x).trim()});if(cur)out.push(cur);return out}
function heroHex(){
  const W=660,H=480,cx=330,cy=240,r=145;
  const p=hexPts(cx,cy,r);
  let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Magisches Sechseck mit sechs Zielen">`;
  s+=`<polygon points="${ptsStr(hexPts(cx,cy,r))}" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2.5"/>`;
  for(let i=0;i<6;i++)for(let j=i+2;j<6;j++){ if(i===0&&j===5)continue; s+=`<line x1="${p[i][0]}" y1="${p[i][1]}" x2="${p[j][0]}" y2="${p[j][1]}" class="s-line" stroke-width="1" stroke-dasharray="3 5"/>`}
  s+=`<text x="${cx}" y="${cy-6}" text-anchor="middle" class="t-fg" font-size="21" font-weight="700">Magisches</text><text x="${cx}" y="${cy+18}" text-anchor="middle" class="t-fg" font-size="21" font-weight="700">Sechseck</text>`;
  s+=`<text x="${cx}" y="${cy+40}" text-anchor="middle" class="t-mu" font-size="12">gestrichelt: Zielbeziehungen</text>`;
  ORDER.forEach((k,i)=>{
    const [x,y]=p[i]; const lp=hexPts(cx,cy,r+30)[i];
    const anchor=Math.abs(lp[0]-cx)<5?'middle':(lp[0]>cx?'start':'end');
    const lx=lp[0]+(anchor==='start'?-6:anchor==='end'?6:0);
    const sub=wrapText(G[k].name,24); if(G[k].since==='Erweiterung') sub.push('(Erweiterung)');
    const n=1+sub.length, lh=15;
    const top= i===0 ? lp[1]-(n-1)*lh-2 : i===3 ? lp[1]+12 : lp[1]-((n-1)*lh)/2+5;
    s+=`<g class="hexcorner" tabindex="0" role="button" data-k="${k}" aria-label="${esc(G[k].name)}: Steckbrief öffnen">
      <circle class="dot" cx="${x}" cy="${y}" r="17" fill="${gc(k)}" stroke="var(--surface)" stroke-width="3"/>
      <text x="${x}" y="${y+5}" text-anchor="middle" fill="var(--md-on-g-${k})" font-size="14" font-weight="700">${k}</text>
      <text x="${lx}" y="${top}" text-anchor="${anchor}" fill="${gc(k)}" font-size="16" font-weight="700">${esc(G[k].short)}</text>
      ${sub.map((ln,li)=>`<text x="${lx}" y="${top+(li+1)*lh}" text-anchor="${anchor}" class="t-mu" font-size="12">${esc(ln)}</text>`).join('')}
    </g>`;
  });
  s+='</svg>';
  return s;
}

function steckbriefHTML(k){
  const g=G[k];
  return `<figure class="sb-fig"><img class="sb-img" src="${GOAL_IMG[k].src}" alt="${esc(GOAL_IMG[k].alt)}"><figcaption>Foto: ${esc(GOAL_IMG[k].credit)} / Unsplash</figcaption></figure><div class="panel"><dl class="kv">
    <dt>Ziel</dt><dd><b>${esc(g.name)}</b></dd>
    <dt>Rechtsgrundlage</dt><dd>${esc(g.law)}</dd>
    <dt>Indikator</dt><dd>${esc(g.ind)}</dd>
    <dt>Zielmarke</dt><dd>${esc(g.target)}</dd>
    <dt>Aktuell</dt><dd>${esc(g.now)}</dd>
    <dt>Zuständig</dt><dd>${esc(g.who)}</dd>
    <dt>Risiken</dt><dd>${esc(g.risk)}</dd></dl></div>`;
}
function openSteckbrief(k){
  openModal(`${hexDot(k)} Steckbrief: ${esc(G[k].short)}`,
    steckbriefHTML(k)+`<div class="row"><button class="btn primary" type="button" id="sb-go">Zur Werkstatt „${esc(TOOLS.find(t=>t.id===G[k].tool).title)}“</button>
    ${ORDER.map(o=>o===k?'':`<button class="btn small" type="button" data-sb="${o}">${hexDot(o)} ${esc(G[o].short)}</button>`).join('')}</div>`,
    root=>{$('#sb-go',root).addEventListener('click',()=>openTool(G[k].tool));$$('[data-sb]',root).forEach(b=>b.addEventListener('click',()=>openSteckbrief(b.dataset.sb)))});
}

/* ---------- Radar ---------- */
function radar(series,opt={}){
  const W=opt.w||520,H=opt.h||380,cx=W/2,cy=H/2+4,r=opt.r||130;
  let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(opt.label||'Zielerreichung als Sechseck')}">`;
  [25,50,75,100].forEach(v=>{s+=`<polygon points="${ptsStr(hexPts(cx,cy,r*v/100))}" fill="none" class="s-line" stroke-width="1"/>`});
  s+=`<text x="${cx+4}" y="${cy-r-4}" class="t-mu" font-size="10">100</text><text x="${cx+4}" y="${cy-r/2-3}" class="t-mu" font-size="10">50</text>`;
  const outer=hexPts(cx,cy,r);
  outer.forEach(([x,y])=>{s+=`<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" class="s-line"/>`});
  series.forEach(se=>{
    const pts=ORDER.map((k,i)=>{const v=clamp(se.v[k],0,100)/100;const [x,y]=outer[i];return [cx+(x-cx)*v,cy+(y-cy)*v]});
    s+=`<polygon points="${ptsStr(pts)}" fill="${se.fill||'none'}" fill-opacity="${se.fo??0.18}" stroke="${se.stroke}" stroke-width="${se.sw||2.5}" ${se.dash?`stroke-dasharray="${se.dash}"`:''}/>`;
    if(!se.dash) pts.forEach(([x,y],i)=>{s+=`<circle cx="${x}" cy="${y}" r="4.5" fill="${gc(ORDER[i])}"/>`});
  });
  const lab=hexPts(cx,cy,r+20);
  ORDER.forEach((k,i)=>{const [x,y]=lab[i];const a=Math.abs(x-cx)<5?'middle':(x>cx?'start':'end');s+=`<text x="${x}" y="${y+(i===0?-2:i===3?10:4)}" text-anchor="${a}" fill="${gc(k)}" font-size="13" font-weight="700">${G[k].short}</text>`});
  return s+'</svg>';
}

/* ---------- Werkzeuge ---------- */
const TOOLS=[];
function tool(o){TOOLS.push(o)}

/* 1 Grundlagen */
tool({id:'grundlagen',ch:1,goals:ORDER,title:'Sechseck-Baukasten',sub:'Vom magischen Viereck (1967) zum Sechseck: Ziele, Gesetze, Indikatoren, Akteure',
html(){return `
<p class="task"><b>Auftrag:</b> Startet beim Viereck von 1967 und erweitert es zum Sechseck. Klickt jede Ecke an und lest den Steckbrief. Ordnet anschließend die Indikatoren den Zielen zu.</p>
<div class="grid2">
  <div class="panel chart"><div class="row" style="justify-content:space-between;margin-bottom:6px"><h3 id="gl-h">1967: Das magische Viereck</h3>
  <button class="btn small primary" id="gl-toggle" type="button">Zum Sechseck erweitern</button></div><div id="gl-svg"></div></div>
  <div class="stack">
    <div class="quote"><b>§ 1 Stabilitäts- und Wachstumsgesetz (1967):</b> „Bund und Länder haben bei ihren wirtschafts- und finanzpolitischen Maßnahmen die Erfordernisse des gesamtwirtschaftlichen Gleichgewichts zu beachten. Die Maßnahmen sind so zu treffen, daß sie im Rahmen der marktwirtschaftlichen Ordnung gleichzeitig zur Stabilität des Preisniveaus, zu einem hohen Beschäftigungsstand und außenwirtschaftlichem Gleichgewicht bei stetigem und angemessenem Wirtschaftswachstum beitragen.“</div>
    <div id="gl-ext" class="quote" hidden><b>Erweiterung:</b> Das Sozialstaatsprinzip (Art. 20 Abs. 1 GG) begründet das Ziel einer gerechten Einkommens- und Vermögensverteilung. Seit 1994 schützt der Staat nach Art. 20a GG „auch in Verantwortung für die künftigen Generationen die natürlichen Lebensgrundlagen“. Beide Ziele stehen nicht im StabG, gelten aber als gleichrangige Ergänzung.</div>
    <div id="gl-sb"></div>
  </div>
</div>
<div class="grid2">
  <div class="panel"><h3>Warum „magisch“?</h3><p>Das Gesetz verlangt, alle Ziele <i>gleichzeitig</i> zu erreichen. In der Praxis ist das wie Zauberei: Wer mit niedrigen Zinsen das Wachstum ankurbelt, riskiert steigende Preise. Wer die Umwelt mit einem CO₂-Preis schützt, verteuert Energie. Die Ziele stehen in Wechselbeziehungen – mal unterstützen sie sich, mal behindern sie sich. Darum muss Politik gewichten und Prioritäten setzen.</p>
  <p class="small muted" style="margin-top:8px">In der Diskussion stehen weitere Erweiterungen zum „magischen Achteck“, etwa um tragfähige Staatsfinanzen oder Bildung.</p></div>
  <div class="panel"><h3>Wer steuert was?</h3><dl class="kv">
    <dt>Bund, Länder</dt><dd>Fiskalpolitik: Staatsausgaben, Steuern, Investitionen (Haushalt, Schuldenbremse)</dd>
    <dt>EZB</dt><dd>Geldpolitik für den Euroraum: Leitzinsen; vorrangiges Ziel Preisstabilität (Art. 127 AEUV)</dd>
    <dt>Tarifpartner</dt><dd>Gewerkschaften und Arbeitgeberverbände: Löhne, Arbeitszeit (Tarifautonomie, Art. 9 GG)</dd>
    <dt>EU</dt><dd>Handelspolitik, Emissionshandel, Wettbewerbsrecht, Fiskalregeln</dd>
    <dt>Beratung</dt><dd>Sachverständigenrat (Jahresgutachten), Forschungsinstitute (Gemeinschaftsdiagnose)</dd></dl></div>
</div>
<div class="panel"><h3>Zuordnung: Welcher Indikator misst welches Ziel?</h3><div id="gl-match"></div>
<div class="row" style="margin-top:10px"><button class="btn primary" id="gl-check" type="button">Prüfen</button><span id="gl-res" class="small"></span></div></div>
${erkHTML('grundlagen')}
${teacher(['Einstieg: Sechseck an die Tafel, Schüler sammeln Vorwissen zu den Ecken, dann Erweiterung live per Klick zeigen.','Impulsfrage: Warum stehen Verteilung und Umwelt nicht im StabG von 1967? (Zeitgeist der Nachkriegszeit: Wachstum und Stabilität im Vordergrund; Umweltbewegung erst ab den 1970ern)','Methodische Reserve: Schüler formulieren für jedes Ziel eine Schlagzeile, die das Ziel als verfehlt zeigt.'])}`},
init(root){
  let six=false, sel='P';
  const draw=()=>{
    const W=500,H=380,cx=250,cy=188,r=120,p=hexPts(cx,cy,r);
    const vis=six?ORDER:['P','B','W','A'];
    let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${six?'Magisches Sechseck':'Magisches Viereck'}">`;
    const poly=ORDER.map((k,i)=>vis.includes(k)?p[i]:null).filter(Boolean);
    s+=`<polygon points="${ptsStr(poly)}" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2.5" style="transition:all .4s"/>`;
    ORDER.forEach((k,i)=>{
      const on=vis.includes(k);const [x,y]=p[i];const lp=hexPts(cx,cy,r+28)[i];const a=Math.abs(lp[0]-cx)<5?'middle':(lp[0]>cx?'start':'end');
      s+=`<g class="hexcorner" tabindex="${on?0:-1}" role="button" data-k="${k}" opacity="${on?1:.28}" aria-label="${esc(G[k].name)}">
        <circle class="dot" cx="${x}" cy="${y}" r="${sel===k?19:15}" fill="${on?gc(k):'none'}" stroke="${on?'var(--surface)':'var(--muted)'}" stroke-width="3" ${on?'':'stroke-dasharray="4 3"'}/>
        <text x="${x}" y="${y+5}" text-anchor="middle" fill="${on?'var(--md-on-g-'+k+')':'var(--muted)'}" font-size="13" font-weight="700">${k}</text>
        <text x="${lp[0]}" y="${lp[1]+(i===0?-4:i===3?14:5)}" text-anchor="${a}" fill="${on?gc(k):'var(--muted)'}" font-size="14" font-weight="700">${G[k].short}</text></g>`;
    });
    s+=`<text x="${cx}" y="${cy+5}" text-anchor="middle" class="t-fg" font-size="17" font-weight="700">${six?'6 Ziele':'4 Ziele'}</text></svg>`;
    $('#gl-svg',root).innerHTML=s;
    $$('.hexcorner',root).forEach(g=>{const f=()=>{if(!six&&['U','V'].includes(g.dataset.k))return;sel=g.dataset.k;draw()};g.addEventListener('click',f);g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();f()}})});
    $('#gl-sb',root).innerHTML=steckbriefHTML(sel);
    $('#gl-h',root).textContent=six?'Heute: Das magische Sechseck':'1967: Das magische Viereck';
    $('#gl-toggle',root).textContent=six?'Zurück zum Viereck':'Zum Sechseck erweitern';
    $('#gl-ext',root).hidden=!six;
  };
  $('#gl-toggle',root).addEventListener('click',()=>{six=!six;if(!six&&['U','V'].includes(sel))sel='P';draw()});
  draw();
  const IND=[['Verbraucherpreisindex','P'],['Arbeitslosenquote','B'],['Veränderungsrate des realen BIP','W'],['Leistungsbilanzsaldo in % des BIP','A'],['Gini-Koeffizient','V'],['Treibhausgasemissionen in CO₂-Äquivalenten','U'],['Unterbeschäftigung','B'],['Armutsgefährdungsquote','V']];
  $('#gl-match',root).innerHTML=IND.map(([n],i)=>`<div class="case"><span>${n}</span><select id="gl-s${i}" aria-label="Ziel für ${n}"><option value="">– Ziel wählen –</option>${ORDER.map(k=>`<option value="${k}">${G[k].short}</option>`).join('')}</select></div>`).join('');
  $('#gl-check',root).addEventListener('click',()=>{let ok=0;IND.forEach(([,k],i)=>{const s=$('#gl-s'+i,root);const r=s.value===k;if(r)ok++;s.style.borderColor=s.value?(r?'var(--ok)':'var(--bad)'):'var(--line)'});$('#gl-res',root).textContent=`${ok} von ${IND.length} richtig${ok===IND.length?' – stark!':' – rot markierte noch einmal prüfen.'}`});
  bindErk(root);
}});

/* 2 Preisniveau */
const BASKET=[
  {n:'Döner in Jena',q:4,p0:7.50,p1:8.00},
  {n:'Deutschlandticket (Monat)',q:1,p0:58.00,p1:63.00},
  {n:'Tankfüllung Roller/Auto, 10 l Super E10',q:2,p0:17.20,p1:19.60},
  {n:'Streaming-Abo',q:1,p0:6.99,p1:7.49},
  {n:'Kinoticket (Erfurt)',q:1,p0:11.00,p1:11.50},
  {n:'Matcha-Latte im Café',q:4,p0:4.90,p1:5.50},
  {n:'Buldak-Nudeln (Cup)',q:3,p0:2.49,p1:2.79},
  {n:'Energydrink 0,25 l',q:6,p0:1.69,p1:1.79},
  {n:'Handyvertrag',q:1,p0:14.99,p1:14.99},
  {n:'Brötchen beim Bäcker',q:10,p0:0.55,p1:0.58}
];
tool({id:'preis',ch:2,goals:['P'],title:'Warenkorb-Werkstatt',sub:'Euren eigenen Preisindex berechnen, Reallohn und Kaufkraftverlust bestimmen',
html(){return `
<p class="task"><b>Auftrag:</b> Passt den Warenkorb an euer Leben an: Mengen pro Monat und Preise (letztes Jahr / heute). Die Werkstatt berechnet euren persönlichen Preisindex nach dem Verfahren des Statistischen Bundesamts (Laspeyres). Vergleicht mit der offiziellen Inflationsrate.</p>
<div class="grid2 wide-left">
  <div class="panel"><h3>Unser Warenkorb <span class="small muted">(Beispielpreise – ersetzt sie durch eure!)</span></h3>
  <div class="tbl-wrap"><table><thead><tr><th>Gut</th><th class="r">Menge/Monat</th><th class="r">Preis 2025 (€)</th><th class="r">Preis 2026 (€)</th><th class="r">Änderung</th></tr></thead><tbody id="pr-body"></tbody></table></div>
  <div class="row" style="margin-top:8px"><button class="btn small" id="pr-add" type="button"><span class="ms">add</span>Eigenes Gut</button><button class="btn small" id="pr-reset" type="button"><span class="ms">refresh</span>Beispielwerte laden</button></div></div>
  <div class="stack">
    <div class="panel"><p class="eyebrow">Euer Preisindex (2025 = 100)</p><div class="big-num" id="pr-idx">–</div>
    <p>Persönliche Inflationsrate: <b id="pr-rate" class="num">–</b></p>
    <p class="small muted" id="pr-cost"></p></div>
    <div class="panel chart"><h3>Inflations-Thermometer</h3><div id="pr-thermo"></div>
    <p class="small muted">Offiziell: 3,3 % (Sept. 2026, vorläufig), Energie +14,9 %, Nahrungsmittel +0,4 %, Kerninflation 2,4 %.</p></div>
  </div>
</div>
<div class="panel chart"><h3>Wer treibt euren Index? Beitrag der einzelnen Güter (Prozentpunkte)</h3><div id="pr-contrib"></div></div>
<div class="grid2">
  <div class="panel"><h3>Reallohn-Rechner</h3>
    <div class="ctrl"><label for="rl-n">Lohnerhöhung (nominal) <output id="rl-no"></output></label><input type="range" id="rl-n" min="0" max="10" step="0.1" value="4"></div>
    <div class="ctrl"><label for="rl-i">Inflationsrate <output id="rl-io"></output></label><input type="range" id="rl-i" min="-1" max="10" step="0.1" value="3.3"></div>
    <p>Reallohnänderung: <b id="rl-r" class="num"></b></p><p class="small muted" id="rl-t"></p></div>
  <div class="panel"><h3>Kaufkraft-Schwund</h3>
    <div class="ctrl"><label for="kk-i">Durchschnittliche Inflation <output id="kk-io"></output></label><input type="range" id="kk-i" min="0" max="10" step="0.1" value="2"></div>
    <div class="ctrl"><label for="kk-y">Jahre <output id="kk-yo"></output></label><input type="range" id="kk-y" min="1" max="40" step="1" value="10"></div>
    <p>1.000 € unter der Matratze sind dann noch <b id="kk-r" class="num"></b> heutige Euro wert.</p>
    <p class="small muted">Faustregel 72: Bei einer Inflation von x % halbiert sich die Kaufkraft nach etwa 72 ÷ x Jahren.</p></div>
</div>
<div class="panel"><h3>Hintergrund: So misst das Statistische Bundesamt</h3><p>Rund 300.000 Preise für etwa 650 Güterarten gehen monatlich in den Verbraucherpreisindex ein. Jedes Gut hat ein Gewicht nach seinem Anteil an den Ausgaben aller Haushalte (Wägungsschema, Basisjahr 2020) – Wohnen und Energie zählen am meisten. Weil jeder anders konsumiert, weicht die persönliche Inflation von der amtlichen ab: Wer viel tankt und heizt, spürt 2026 die Energiepreise stärker. Das Bundesamt bietet dafür einen <a href="https://www.destatis.de/DE/Service/InflationsRechner/inflationsrechner.html" target="_blank" rel="noopener">persönlichen Inflationsrechner</a>.</p>
<p style="margin-top:8px"><b>Begriffe:</b> Inflation (Preisniveau steigt) · Deflation (Preisniveau sinkt) · Disinflation (Preise steigen langsamer) · Kerninflation (ohne Energie und Nahrungsmittel) · Stagflation (Inflation bei Stagnation).</p></div>
${erkHTML('preis')}
${teacher(['Vorab Hausaufgabe: Schüler notieren eine Woche lang Preise ihrer typischen Ausgaben; Vorjahrespreise per Recherche oder Elternbefragung.','Vergleich Gruppen: Wer hat die höchste persönliche Inflation – und warum? (Gewichtung!)','Impulsfrage: Warum strebt die EZB 2 % an und nicht 0 %? (Sicherheitsabstand zur Deflation, Messfehler, Spielraum für Zinssenkungen)','Methodische Reserve: Reallohn-Rechner mit Ausbildungsvergütung durchspielen.'])}`},
init(root){
  let items=store('ms6-basket')||BASKET.map(o=>({...o}));
  const body=$('#pr-body',root);
  const row=(o,i)=>`<tr><td><input type="text" value="${esc(o.n)}" data-i="${i}" data-f="n" aria-label="Gut" style="border:1px solid var(--line);border-radius:6px;padding:4px 6px;background:var(--surface);width:100%;min-width:9em"></td>
    <td class="r"><input type="number" min="0" step="1" value="${o.q}" data-i="${i}" data-f="q" aria-label="Menge"></td>
    <td class="r"><input type="number" min="0" step="0.01" value="${o.p0}" data-i="${i}" data-f="p0" aria-label="Preis 2025"></td>
    <td class="r"><input type="number" min="0" step="0.01" value="${o.p1}" data-i="${i}" data-f="p1" aria-label="Preis 2026"></td>
    <td class="r num" data-ch="${i}"></td></tr>`;
  const renderRows=()=>{body.innerHTML=items.map(row).join('');calc()};
  const calc=()=>{
    let c0=0,c1=0;items.forEach(o=>{c0+=o.q*o.p0;c1+=o.q*o.p1});
    items.forEach((o,i)=>{const el=$(`[data-ch="${i}"]`,body);if(el){const ch=o.p0>0?(o.p1/o.p0-1)*100:0;el.textContent=sgn(ch)+' %';el.style.color=ch>0.05?'var(--bad)':ch<-0.05?'var(--ok)':'var(--muted)'}});
    const idx=c0>0?c1/c0*100:100, rate=idx-100;
    $('#pr-idx',root).textContent=fmt(idx,1);
    $('#pr-rate',root).textContent=sgn(rate)+' %';
    $('#pr-cost',root).textContent=`Warenkorb kostet ${fmt(c0,2)} € (2025) bzw. ${fmt(c1,2)} € (2026) pro Monat: ${sgn(c1-c0,2)} €.`;
    $('#pr-thermo',root).innerHTML=thermo(rate);
    // Beiträge
    const contr=items.map(o=>({n:o.n,v:c0>0?o.q*(o.p1-o.p0)/c0*100:0})).sort((a,b)=>Math.abs(b.v)-Math.abs(a.v));
    const mx=Math.max(0.5,...contr.map(c=>Math.abs(c.v)));
    const W=640,rh=24,H=contr.length*rh+10,x0=230,x1=W-60,zero=x0+(x1-x0)/2;
    let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Beiträge der Güter zur Inflationsrate">`;
    s+=`<line x1="${zero}" y1="0" x2="${zero}" y2="${H}" class="s-mu"/>`;
    contr.forEach((c,i)=>{const y=5+i*rh;const w=(c.v/mx)*(x1-x0)/2;
      s+=`<text x="${x0-8}" y="${y+15}" text-anchor="end" class="t-fg" font-size="12.5">${esc(c.n.length>32?c.n.slice(0,31)+'…':c.n)}</text>
      <rect x="${w>=0?zero:zero+w}" y="${y+3}" width="${Math.max(1,Math.abs(w))}" height="${rh-8}" rx="3" fill="${c.v>=0?'var(--g-P)':'var(--ok)'}"/>
      <text x="${w>=0?zero+w+5:zero+w-5}" y="${y+15}" text-anchor="${w>=0?'start':'end'}" class="t-mu num" font-size="11.5">${sgn(c.v,2)}</text>`});
    $('#pr-contrib',root).innerHTML=s+'</svg>';
    store('ms6-basket',items);
  };
  body.addEventListener('input',e=>{const t=e.target;const i=+t.dataset.i,f=t.dataset.f;if(!items[i])return;items[i][f]=f==='n'?t.value:Math.max(0,parseFloat(t.value)||0);calc()});
  $('#pr-add',root).addEventListener('click',()=>{items.push({n:'Neues Gut',q:1,p0:10,p1:10});renderRows()});
  $('#pr-reset',root).addEventListener('click',()=>{items=BASKET.map(o=>({...o}));renderRows()});
  renderRows();
  const rl=()=>{const n=+$('#rl-n',root).value,i=+$('#rl-i',root).value;const r=((1+n/100)/(1+i/100)-1)*100;
    $('#rl-no',root).textContent=sgn(n)+' %';$('#rl-io',root).textContent=sgn(i)+' %';
    const el=$('#rl-r',root);el.textContent=sgn(r,2)+' %';el.style.color=r>=0?'var(--ok)':'var(--bad)';
    $('#rl-t',root).textContent=`Beispiel Ausbildungsvergütung 1.100 €: Nach der Erhöhung ${fmt(1100*(1+n/100),0)} € – das entspricht real ${fmt(1100*(1+r/100),0)} € in heutiger Kaufkraft. Genau: (1 + n) ÷ (1 + i) − 1; die Faustregel n − i ergibt ${sgn(n-i,1)} %.`};
  ['#rl-n','#rl-i'].forEach(s=>$(s,root).addEventListener('input',rl));rl();
  const kk=()=>{const i=+$('#kk-i',root).value,y=+$('#kk-y',root).value;$('#kk-io',root).textContent=fmt(i)+' %';$('#kk-yo',root).textContent=y;$('#kk-r',root).textContent=fmt(1000/Math.pow(1+i/100,y),0)+' €'};
  ['#kk-i','#kk-y'].forEach(s=>$(s,root).addEventListener('input',kk));kk();
  bindErk(root);
}});
function thermo(rate){
  const W=520,H=86,x0=20,x1=W-20,min=-2,max=10,sx=v=>x0+(clamp(v,min,max)-min)/(max-min)*(x1-x0);
  const zones=[[-2,0,'var(--g-B)','Deflation'],[0,1.5,'var(--neu)','niedrig'],[1.5,2.5,'var(--ok)','Zielbereich'],[2.5,5,'var(--amb)','erhöht'],[5,10,'var(--bad)','hoch']];
  let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Inflationsrate ${fmt(rate)} Prozent auf einer Skala">`;
  zones.forEach(([a,b,c,l])=>{s+=`<rect x="${sx(a)}" y="22" width="${sx(b)-sx(a)}" height="16" fill="${c}" opacity=".75"/><text x="${(sx(a)+sx(b))/2}" y="14" text-anchor="middle" class="t-mu" font-size="11">${l}</text>`});
  [-2,0,2,4,6,8,10].forEach(v=>{s+=`<text x="${sx(v)}" y="54" text-anchor="middle" class="t-mu num" font-size="11">${v} %</text>`});
  s+=`<line x1="${sx(2)}" y1="18" x2="${sx(2)}" y2="42" class="s-fg" stroke-width="2"/>`;
  const x=sx(rate);s+=`<polygon points="${x-8},80 ${x+8},80 ${x},62" fill="var(--fg)"/>`;
  return s+'</svg>';
}

/* 3 Beschäftigung */
const CASES=[
  ['Lena hat ihr BWL-Studium in Jena beendet und schickt seit fünf Wochen Bewerbungen. Passende Stellen gibt es genug.','friktionell'],
  ['Ein Dachdecker aus Apolda ist im Januar ohne Arbeit, weil bei Frost nicht gebaut werden kann.','saisonal'],
  ['Ein Autozulieferer in Thüringen stellt Teile für Verbrennungsmotoren her. Durch die E-Mobilität fällt die Produktion dauerhaft weg.','strukturell'],
  ['Wegen einer weltweiten Rezession brechen die Aufträge eines Maschinenbauers ein, 80 Beschäftigte werden entlassen.','konjunkturell'],
  ['Ein Eisverkäufer am Erfurter Domplatz ist im Winter arbeitslos.','saisonal'],
  ['Eine Sachbearbeiterin verliert ihre Stelle, weil eine KI-Software die Rechnungsprüfung übernimmt; für die neuen IT-Jobs fehlt ihr die Qualifikation.','strukturell'],
  ['Ein Koch kündigt in Weimar, um in Leipzig zu arbeiten. Die neue Stelle beginnt erst in sechs Wochen.','friktionell'],
  ['Die Energiepreise steigen stark, die Nachfrage nach Konsumgütern sinkt im ganzen Land, Händler bauen Personal ab.','konjunkturell']
];
const CAUSE={friktionell:'Sucharbeitslosigkeit beim Stellenwechsel; kurz und kaum vermeidbar.',saisonal:'Abhängig von der Jahreszeit (Wetter, Tourismus).',konjunkturell:'Folge einer allgemein schwachen Nachfrage im Abschwung.',strukturell:'Dauerhafter Wandel von Branchen, Regionen oder Qualifikationsanforderungen (Mismatch).'};
tool({id:'beschaeftigung',ch:2,goals:['B'],title:'Arbeitsmarkt-Werkstatt',sub:'Arbeitslosenquote berechnen, Arten der Arbeitslosigkeit erkennen, Thüringen vergleichen',
html(){return `
<p class="task"><b>Auftrag:</b> Berechnet die Arbeitslosenquote für Deutschland und Thüringen. Ordnet danach acht Fälle den Arten der Arbeitslosigkeit zu und überlegt, welche Politik jeweils helfen würde.</p>
<div class="grid2">
  <div class="panel"><h3>Quoten-Rechner</h3>
   <div class="row" style="margin-bottom:8px"><button class="btn small" data-preset="de" type="button">Deutschland, Sept. 2026</button><button class="btn small" data-preset="th" type="button">Thüringen, Juli 2026</button><button class="btn small" data-preset="vb" type="button">Vollbeschäftigung?</button></div>
   <div class="ctrl"><label for="al-a">Registrierte Arbeitslose (Tsd.) <output id="al-ao"></output></label><input type="range" id="al-a" min="20" max="5000" step="1" value="2994"></div>
   <div class="ctrl"><label for="al-e">Erwerbstätige (Tsd., zivil, Bezugsgröße) <output id="al-eo"></output></label><input type="range" id="al-e" min="500" max="48000" step="10" value="43790"></div>
   <p style="margin-top:6px">Arbeitslosenquote = <span class="mono small">Arbeitslose ÷ (Erwerbstätige + Arbeitslose) × 100</span></p>
   <div class="big-num" id="al-q">–</div><div id="al-g" class="chart"></div></div>
  <div class="panel"><h3>Mehr als eine Zahl</h3><dl class="kv">
   <dt>Registriert</dt><dd>2,994 Mio. Arbeitslose (Sept. 2026), 40.000 mehr als vor einem Jahr</dd>
   <dt>Unterbeschäftigung</dt><dd>3,615 Mio. – zählt auch Menschen in Weiterbildung, Maßnahmen oder kurzfristiger Arbeitsunfähigkeit mit</dd>
   <dt>Kurzarbeit</dt><dd>rund 118.000 Beschäftigte erhielten Kurzarbeitergeld</dd>
   <dt>Offene Stellen</dt><dd>660.000 gemeldet – gleichzeitig Fachkräftemangel und Arbeitslosigkeit</dd>
   <dt>ILO-Konzept</dt><dd>Die international vergleichbare Erwerbslosenquote liegt deutlich niedriger, weil sie u. a. Menschen mit Minijob nicht als erwerbslos zählt</dd>
   <dt>Thüringen</dt><dd>6,5 % (Juli 2026), 71.152 Arbeitslose; gut jeder Dritte ist langzeitarbeitslos, gut jeder Dritte über 50</dd></dl>
   <p class="small muted" style="margin-top:8px">BA-Chefin Andrea Nahles im September 2026: Die wirtschaftliche Verbesserung kommt am Arbeitsmarkt noch nicht an.</p></div>
</div>
<div class="panel"><h3>Fall-Sortierung: Welche Art von Arbeitslosigkeit?</h3><div id="al-cases"></div>
<div class="row" style="margin-top:10px"><button class="btn primary" id="al-check" type="button">Prüfen</button><span class="small" id="al-res"></span></div>
<div class="grid3" style="margin-top:10px">${Object.entries(CAUSE).map(([k,v])=>`<div class="fb neu"><b>${k[0].toUpperCase()+k.slice(1)}</b><br><span class="small">${v}</span></div>`).join('')}</div></div>
${erkHTML('beschaeftigung')}
${teacher(['Rechenweg an der Tafel festhalten; Thüringen-Preset zeigt, dass die Bezugsgröße (rund 1,1 Mio. Erwerbspersonen) viel kleiner ist.','Impulsfrage: Warum gibt es gleichzeitig 660.000 offene Stellen und 3 Mio. Arbeitslose? (Mismatch nach Qualifikation, Region, Branche)','Transfer: Welche Instrumente helfen gegen welche Art? (Weiterbildung → strukturell, Konjunkturprogramm/Kurzarbeit → konjunkturell, Jobbörsen → friktionell)','Methodische Reserve: Eigenen Fall aus der Region formulieren und von der Nachbargruppe zuordnen lassen.'])}`},
init(root){
  const PR={de:[2994,43790],th:[71,1024],vb:[1300,44500]};
  const upd=()=>{const a=+$('#al-a',root).value,e=+$('#al-e',root).value;const q=a/(a+e)*100;
    $('#al-ao',root).textContent=fmt(a,0);$('#al-eo',root).textContent=fmt(e,0);$('#al-q',root).textContent=fmt(q,1)+' %';
    const W=520,H=60,x0=16,x1=W-16,mx=15,sx=v=>x0+clamp(v,0,mx)/mx*(x1-x0);
    let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Arbeitslosenquote auf Skala">`;
    [[0,3,'var(--ok)','Vollbeschäftigung (Faustregel)'],[3,6,'var(--amb)','mittel'],[6,15,'var(--bad)','hoch']].forEach(([a,b,c,l])=>{s+=`<rect x="${sx(a)}" y="18" width="${sx(b)-sx(a)}" height="12" fill="${c}" opacity=".7"/><text x="${(sx(a)+sx(b))/2}" y="12" text-anchor="middle" class="t-mu" font-size="10.5">${l}</text>`});
    [0,3,6,9,12,15].forEach(v=>s+=`<text x="${sx(v)}" y="46" text-anchor="middle" class="t-mu" font-size="10.5">${v} %</text>`);
    const x=sx(q);s+=`<polygon points="${x-7},58 ${x+7},58 ${x},34" fill="var(--fg)"/>`;
    $('#al-g',root).innerHTML=s+'</svg>'};
  $$('[data-preset]',root).forEach(b=>b.addEventListener('click',()=>{const [a,e]=PR[b.dataset.preset];
    const sa=$('#al-a',root),se=$('#al-e',root);if(b.dataset.preset==='th'){sa.min=5;se.min=200}sa.value=a;se.value=e;upd()}));
  ['#al-a','#al-e'].forEach(s=>$(s,root).addEventListener('input',upd));upd();
  const TYPES=['friktionell','saisonal','konjunkturell','strukturell'];
  $('#al-cases',root).innerHTML=CASES.map(([t],i)=>`<div class="case"><span>${i+1}. ${t}</span><select id="al-c${i}" aria-label="Art der Arbeitslosigkeit, Fall ${i+1}"><option value="">– Art wählen –</option>${TYPES.map(x=>`<option>${x}</option>`).join('')}</select></div>`).join('');
  $('#al-check',root).addEventListener('click',()=>{let ok=0;CASES.forEach(([,k],i)=>{const s=$('#al-c'+i,root);const r=s.value===k;if(r)ok++;s.style.borderColor=s.value?(r?'var(--ok)':'var(--bad)'):'var(--line)'});$('#al-res',root).textContent=`${ok} von ${CASES.length} richtig.`});
  bindErk(root);
}});

/* 4 Wachstum */
const BIP=[['2019',1.0],['2020',-4.1],['2023',-0.9],['2024',-0.5],['2025',0.2],['2026*',1.3],['2027*',1.1]];
const PHASES={
  auf:{n:'Aufschwung (Expansion)',d:'Aufträge und Produktion ziehen an, die Kapazitäten werden besser ausgelastet. Unternehmen investieren wieder, Arbeitslosigkeit sinkt verzögert.',t:['steigend','beginnt zu sinken','noch moderat','niedrig, langsam steigend','optimistisch']},
  boom:{n:'Hochkonjunktur (Boom)',d:'Kapazitäten voll ausgelastet, Fachkräfte knapp, Löhne und Preise steigen kräftig. Die Zentralbank erhöht die Zinsen, um eine Überhitzung zu verhindern.',t:['sehr hoch, kaum steigerbar','niedrig','stark steigend','hoch','euphorisch, erste Sorgen']},
  ab:{n:'Abschwung (Rezession)',d:'Nachfrage und Aufträge gehen zurück, Lager füllen sich, Investitionen werden verschoben. Kurzarbeit, später Entlassungen. Bei zwei Quartalen mit sinkendem BIP spricht man von technischer Rezession.',t:['sinkend','steigend','Anstieg lässt nach','sinkend','pessimistisch']},
  tief:{n:'Tiefstand (Depression)',d:'Geringe Auslastung, hohe Arbeitslosigkeit, wenig Investitionen, niedrige Zinsen. Staatliche Konjunkturprogramme sollen die Nachfrage stützen.',t:['niedrig','hoch','niedrig, evtl. sinkend','niedrig','gedrückt']}
};
tool({id:'wachstum',ch:2,goals:['W'],title:'Konjunktur-Werkstatt',sub:'Konjunkturzyklus durchfahren, reales vs. nominales BIP berechnen, Deutschland einordnen',
html(){return `
<p class="task"><b>Auftrag:</b> Fahrt mit dem Regler durch einen Konjunkturzyklus und beobachtet, wie sich die Indikatoren verändern. Ordnet Deutschland im Herbst 2026 ein und rechnet nominales in reales Wachstum um.</p>
<div class="grid2 wide-left">
  <div class="panel chart"><h3>Konjunkturzyklus um den Wachstumstrend</h3><div id="kz-svg"></div>
  <div class="ctrl"><label for="kz-t">Zeit im Zyklus <output id="kz-to"></output></label><input type="range" id="kz-t" min="0" max="100" step="0.5" value="8"></div>
  <div class="row"><button class="btn small" id="kz-de" type="button">Wo steht Deutschland (Herbst 2026)?</button></div></div>
  <div class="panel"><h3 id="kz-name"></h3><p id="kz-desc"></p>
  <div class="tbl-wrap" style="margin-top:8px"><table><tbody id="kz-tab"></tbody></table></div>
  <p class="small muted" id="kz-de-t" hidden style="margin-top:8px">Einschätzung: Die Gemeinschaftsdiagnose (Sept. 2026) spricht von einem „Aufschwung mit Strukturproblemen“: Exporte und Industrie ziehen an (auch durch den weltweiten KI-Boom), Konsum und Investitionen bleiben schwach, der Energiepreisschock durch den Iran-Krieg bremst. Der Arbeitsmarkt folgt verzögert.</p></div>
</div>
<div class="grid2">
  <div class="panel chart"><h3>Reales BIP-Wachstum Deutschland (%)</h3><div id="bip-bars"></div><p class="small muted">* Prognose Gemeinschaftsdiagnose Herbst 2026. 2020: Corona-Einbruch.</p></div>
  <div class="panel"><h3>Nominal oder real?</h3>
   <div class="ctrl"><label for="bn-n">Nominales BIP-Wachstum <output id="bn-no"></output></label><input type="range" id="bn-n" min="-4" max="12" step="0.1" value="3.8"></div>
   <div class="ctrl"><label for="bn-p">Preissteigerung (BIP-Deflator) <output id="bn-po"></output></label><input type="range" id="bn-p" min="-2" max="10" step="0.1" value="2.5"></div>
   <div class="ctrl"><label for="bn-b">Bevölkerungsveränderung <output id="bn-bo"></output></label><input type="range" id="bn-b" min="-1" max="2" step="0.1" value="0.1"></div>
   <p>Reales Wachstum: <b id="bn-r" class="num"></b> · real pro Kopf: <b id="bn-k" class="num"></b></p>
   <p class="small muted">Das nominale BIP misst in aktuellen Preisen. Steigen nur die Preise, wächst es, ohne dass mehr produziert wird. Deshalb zählt für das Wachstumsziel das reale (preisbereinigte) BIP.</p></div>
</div>
<div class="panel"><h3>Kritik am BIP als Wohlstandsmaß</h3><p>Das BIP erfasst keine unbezahlte Arbeit (Pflege, Ehrenamt), keine Umweltschäden und keine Verteilung. Ein Unfall mit Reparatur und Krankenhausaufenthalt erhöht das BIP sogar. Alternativen wie der Nationale Wohlfahrtsindex oder die Wohlfahrtsmessung der OECD ergänzen es. Deshalb steht neben dem Wachstum auch Umweltschutz im Sechseck.</p></div>
${erkHTML('wachstum')}
${teacher(['Regler langsam bewegen und Schüler Phasen vorhersagen lassen, bevor die Tabelle umspringt.','Impulsfrage: Warum reagiert die Arbeitslosigkeit verzögert? (Kündigungsfristen, Kurzarbeit, Unternehmen halten Fachkräfte)','Diskussion: Ist „angemessenes“ Wachstum bei schrumpfender Erwerbsbevölkerung noch 1,5 %? Oder brauchen wir ein Wachstumsziel überhaupt?','Methodische Reserve: Aktuelle Schlagzeilen (z. B. tagesschau.de) einer Konjunkturphase zuordnen.'])}`},
init(root){
  const draw=t=>{
    const W=600,H=260,x0=40,x1=W-14,y0=210,sx=v=>x0+v/100*(x1-x0);
    const per=50, yv=v=>y0-30-v*1.1-48*Math.sin(2*Math.PI*v/per);
    let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Konjunkturzyklus">`;
    s+=`<line x1="${x0}" y1="${y0+20}" x2="${x1}" y2="${y0+20}" class="s-mu"/><line x1="${x0}" y1="10" x2="${x0}" y2="${y0+20}" class="s-mu"/>`;
    s+=`<text x="${x1}" y="${y0+36}" text-anchor="end" class="t-mu" font-size="11">Zeit</text><text x="${x0+4}" y="18" class="t-mu" font-size="11">reales BIP</text>`;
    s+=`<line x1="${sx(0)}" y1="${y0-30}" x2="${sx(100)}" y2="${y0-30-110}" stroke="var(--muted)" stroke-dasharray="6 5" stroke-width="1.5"/><text x="${sx(100)-4}" y="${y0-30-110+16}" text-anchor="end" class="t-mu" font-size="11">Trend (Potenzial)</text>`;
    let d='';for(let v=0;v<=100;v+=0.5)d+=(v?'L':'M')+sx(v).toFixed(1)+','+yv(v).toFixed(1);
    s+=`<path d="${d}" fill="none" stroke="var(--g-W)" stroke-width="3"/>`;
    const ph=v=>{const th=((2*Math.PI*v/per)%(2*Math.PI)+2*Math.PI)%(2*Math.PI);if(th<Math.PI/4||th>=7*Math.PI/4)return 'auf';if(th<3*Math.PI/4)return 'boom';if(th<5*Math.PI/4)return 'ab';return 'tief'};
    // Phasen-Beschriftung an Hoch- und Tiefpunkten
    [[12.5,'Boom'],[37.5,'Tiefstand'],[62.5,'Boom'],[87.5,'Tiefstand']].forEach(([v,l])=>{s+=`<text x="${sx(v)}" y="${yv(v)+(l==='Boom'?-14:24)}" text-anchor="middle" class="t-mu" font-size="11">${l}</text>`});
    const x=sx(t),y=yv(t);s+=`<line x1="${x}" y1="${y}" x2="${x}" y2="${y0+20}" stroke="var(--g-W)" stroke-dasharray="3 3"/><circle cx="${x}" cy="${y}" r="8" fill="var(--g-W)" stroke="var(--surface)" stroke-width="3"/>`;
    $('#kz-svg',root).innerHTML=s+'</svg>';
    const P=PHASES[ph(t)];$('#kz-name',root).textContent=P.n;$('#kz-desc',root).textContent=P.d;
    $('#kz-tab',root).innerHTML=['Produktion, Auslastung','Arbeitslosigkeit','Preise','Zinsen','Stimmung (ifo-Index)'].map((n,i)=>`<tr><td class="muted">${n}</td><td><b>${P.t[i]}</b></td></tr>`).join('');
    $('#kz-to',root).textContent=Math.round(t)+' %';
  };
  const sl=$('#kz-t',root);sl.addEventListener('input',()=>{draw(+sl.value);$('#kz-de-t',root).hidden=true});draw(+sl.value);
  $('#kz-de',root).addEventListener('click',()=>{sl.value=53;draw(53);$('#kz-de-t',root).hidden=false});
  // Balken
  const W=520,H=230,x0=40,x1=W-10,yz=130,sc=18;let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Reales BIP-Wachstum Deutschland">`;
  [-4,-2,0,2].forEach(v=>{const y=yz-v*sc;s+=`<line x1="${x0}" y1="${y}" x2="${x1}" y2="${y}" class="s-line"/><text x="${x0-6}" y="${y+4}" text-anchor="end" class="t-mu" font-size="11">${v}</text>`});
  const bw=(x1-x0)/BIP.length;
  BIP.forEach(([j,v],i)=>{const x=x0+i*bw+bw*0.18,w=bw*0.64,y=v>=0?yz-v*sc:yz;const pr=j.includes('*');
    s+=`<rect x="${x}" y="${y}" width="${w}" height="${Math.max(1,Math.abs(v)*sc)}" rx="3" fill="var(--g-W)" ${pr?'fill-opacity=".45" stroke="var(--g-W)" stroke-dasharray="4 3"':''}/>
    <text x="${x+w/2}" y="${v>=0?y-5:y+Math.abs(v)*sc+14}" text-anchor="middle" class="t-fg num" font-size="11.5" font-weight="700">${sgn(v)}</text>
    <text x="${x+w/2}" y="${H-6}" text-anchor="middle" class="t-mu" font-size="11">${j}</text>`});
  $('#bip-bars',root).innerHTML=s+'</svg>';
  const bn=()=>{const n=+$('#bn-n',root).value,p=+$('#bn-p',root).value,b=+$('#bn-b',root).value;const r=((1+n/100)/(1+p/100)-1)*100,k=((1+r/100)/(1+b/100)-1)*100;
    $('#bn-no',root).textContent=sgn(n)+' %';$('#bn-po',root).textContent=sgn(p)+' %';$('#bn-bo',root).textContent=sgn(b)+' %';$('#bn-r',root).textContent=sgn(r,2)+' %';$('#bn-k',root).textContent=sgn(k,2)+' %'};
  ['#bn-n','#bn-p','#bn-b'].forEach(s=>$(s,root).addEventListener('input',bn));bn();
  bindErk(root);
}});

/* 5 Außenwirtschaft */
tool({id:'aussen',ch:2,goals:['A'],title:'Leistungsbilanz-Waage',sub:'Teilbilanzen einstellen, Saldo in % des BIP bewerten, Wechselkurseffekte testen',
html(){return `
<p class="task"><b>Auftrag:</b> Stellt die vier Teilbilanzen ein und beobachtet, wohin die Waage kippt. Prüft, ob die EU-Frühwarnschwelle überschritten wird. Testet dann, wie ein stärkerer oder schwächerer Euro auf Export und Import wirkt.</p>
<div class="grid2 wide-left">
  <div class="panel chart"><h3>Die Waage</h3><div id="lb-svg"></div>
   <div class="row"><button class="btn small" data-lb="de" type="button">Deutschland 2025 (Näherung)</button><button class="btn small" data-lb="null" type="button">Ausgeglichen</button><button class="btn small" data-lb="def" type="button">Defizitland</button></div></div>
  <div class="panel stack"><h3>Teilbilanzen (Saldo, Mrd. €)</h3>
   <div class="ctrl"><label for="lb-w">Warenhandel (Export − Import) <output id="lb-wo"></output></label><input type="range" id="lb-w" min="-200" max="350" step="1"></div>
   <div class="ctrl"><label for="lb-d">Dienstleistungen (z. B. Reisen, Software-Lizenzen) <output id="lb-do"></output></label><input type="range" id="lb-d" min="-150" max="100" step="1"></div>
   <div class="ctrl"><label for="lb-p">Primäreinkommen (Zinsen, Dividenden aus dem Ausland) <output id="lb-po"></output></label><input type="range" id="lb-p" min="-100" max="200" step="1"></div>
   <div class="ctrl"><label for="lb-s">Sekundäreinkommen (Überweisungen, EU-Beiträge) <output id="lb-so"></output></label><input type="range" id="lb-s" min="-120" max="40" step="1"></div>
   <p>Saldo: <b id="lb-sum" class="num"></b> = <b id="lb-pct" class="num"></b> des BIP <span class="small muted">(BIP ≈ 4.550 Mrd. €)</span></p><div id="lb-fb" class="fb"></div></div>
</div>
<div class="grid2">
  <div class="panel"><h3>Wechselkurs-Labor</h3>
   <div class="ctrl"><label for="fx">1 Euro = … US-Dollar <output id="fxo"></output></label><input type="range" id="fx" min="0.85" max="1.45" step="0.01" value="1.15"></div>
   <dl class="kv"><dt>Export</dt><dd>Ein Mikroskop von ZEISS aus Jena kostet 10.000 €. In den USA kostet es <b id="fx-e" class="num"></b>.</dd>
   <dt>Import</dt><dd>Ein Smartphone kostet in den USA 999 $. Umgerechnet sind das <b id="fx-i" class="num"></b> (ohne Steuern).</dd></dl>
   <p class="small" id="fx-t" style="margin-top:6px"></p></div>
  <div class="panel"><h3>Ist ein Überschuss schlecht?</h3>
   <p><b>Pro:</b> Exportstärke sichert Arbeitsplätze in Industrie und Mittelstand (in Thüringen z. B. Optik, Automobilzulieferer, Maschinenbau). Überschüsse bilden Auslandsvermögen, etwa für eine alternde Gesellschaft.</p>
   <p style="margin-top:6px"><b>Contra:</b> Einem Überschuss steht immer ein Defizit anderer Länder gegenüber – sie verschulden sich. Abhängigkeit von der Weltkonjunktur, Konflikte um Zölle (USA). Überschuss heißt auch: Ersparnisse fließen ins Ausland statt in Investitionen im Inland.</p></div>
</div>
${erkHTML('aussen')}
${teacher(['Vorwissen: Warum heißt es „Gleichgewicht“, obwohl Deutschland stolz auf den „Exportweltmeister“ war?','Wechselkurs-Labor mit Beamer: Schüler rufen Vorhersage, bevor der Regler bewegt wird.','Kontroverse: Rollenspiel deutsche Exportwirtschaft vs. US-Handelsbeauftragter.','Methodische Reserve: Etiketten von Kleidung und Elektronik im Raum prüfen – woher kommen unsere Importe?'])}`},
init(root){
  const PRE={de:[196,-56,122,-62],null:[40,-20,20,-40],def:[-120,-10,-15,-35]};
  const ids=['w','d','p','s'];
  const set=a=>{ids.forEach((k,i)=>$('#lb-'+k,root).value=a[i]);upd()};
  const upd=()=>{
    const v=ids.map(k=>+$('#lb-'+k,root).value);ids.forEach((k,i)=>$('#lb-'+k+'o',root).textContent=sgn(v[i],0));
    const sum=v.reduce((a,b)=>a+b,0),pct=sum/4550*100;
    $('#lb-sum',root).textContent=sgn(sum,0)+' Mrd. €';$('#lb-pct',root).textContent=sgn(pct,1)+' %';
    const fb=$('#lb-fb',root);
    if(pct>6){fb.className='fb bad';fb.textContent='Über +6 %: Die EU-Kommission würde ein übermäßiges Ungleichgewicht prüfen (Überschuss).'}
    else if(pct<-4){fb.className='fb bad';fb.textContent='Unter −4 %: Das Land lebt über seine Verhältnisse und verschuldet sich im Ausland.'}
    else if(Math.abs(pct)<=1){fb.className='fb ok';fb.textContent='Nahezu ausgeglichen – das Ziel ist erreicht.'}
    else{fb.className='fb amb';fb.textContent=pct>0?'Überschuss innerhalb der EU-Schwelle, aber deutlich vom Gleichgewicht entfernt.':'Defizit innerhalb der EU-Schwelle.'}
    const W=520,H=240,cx=260,cy=110,ang=clamp(-pct*3.2,-24,24),rad=ang*Math.PI/180,L=180;
    const lx=cx-L*Math.cos(rad),ly=cy-L*Math.sin(rad),rx=cx+L*Math.cos(rad),ry=cy+L*Math.sin(rad);
    let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Waage: Leistungsbilanzsaldo ${fmt(pct)} Prozent">`;
    s+=`<polygon points="${cx-30},${H-12} ${cx+30},${H-12} ${cx},${cy+6}" fill="var(--surface-2)" class="s-mu"/>`;
    s+=`<line x1="${lx}" y1="${ly}" x2="${rx}" y2="${ry}" stroke="var(--fg)" stroke-width="5" stroke-linecap="round"/><circle cx="${cx}" cy="${cy}" r="7" fill="var(--fg)"/>`;
    const pan=(x,y,lab,val,col)=>`<line x1="${x}" y1="${y}" x2="${x-40}" y2="${y+50}" class="s-mu"/><line x1="${x}" y1="${y}" x2="${x+40}" y2="${y+50}" class="s-mu"/>
      <path d="M${x-52},${y+50} Q${x},${y+82} ${x+52},${y+50} Z" fill="${col}" fill-opacity=".85"/>
      <text x="${x}" y="${y+46}" text-anchor="middle" class="t-fg" font-size="12" font-weight="700">${lab}</text><text x="${x}" y="${y+68}" text-anchor="middle" class="t-fg" font-size="12" font-weight="700">${val}</text>`;
    const inflow=v.filter(x=>x>0).reduce((a,b)=>a+b,0),outflow=-v.filter(x=>x<0).reduce((a,b)=>a+b,0);
    // Zuflüsse (Einnahmen) schwerer → Seite sinkt: links Einnahmen
    s+=pan(lx,ly,'Einnahmen',fmt(inflow,0),'var(--md-ok-container)')+pan(rx,ry,'Ausgaben',fmt(outflow,0),'var(--md-error-container)');
    s+=`<text x="${cx}" y="22" text-anchor="middle" class="t-fg" font-size="14" font-weight="700">${pct>0.05?'Überschuss':pct<-0.05?'Defizit':'ausgeglichen'}</text>`;
    $('#lb-svg',root).innerHTML=s+'</svg>';
  };
  ids.forEach(k=>$('#lb-'+k,root).addEventListener('input',upd));
  $$('[data-lb]',root).forEach(b=>b.addEventListener('click',()=>set(PRE[b.dataset.lb])));set(PRE.de);
  const fx=()=>{const r=+$('#fx',root).value;$('#fxo',root).textContent=fmt(r,2);$('#fx-e',root).textContent=fmt(10000*r,0)+' $';$('#fx-i',root).textContent=fmt(999/r,0)+' €';
    $('#fx-t',root).textContent=r>1.18?'Starker Euro (Aufwertung): Deutsche Waren werden im Ausland teurer, Importe billiger → Exporte sinken tendenziell, Importe steigen, der Überschuss schrumpft. Dafür wird importierte Energie günstiger (dämpft die Inflation).':r<1.08?'Schwacher Euro (Abwertung): Deutsche Waren werden im Ausland billiger → Exporte steigen, Importe (auch Öl und Gas in Dollar) werden teurer → importierte Inflation.':'Wechselkurs im mittleren Bereich. Bewegt den Regler nach links und rechts.'};
  $('#fx',root).addEventListener('input',fx);fx();
  bindErk(root);
}});

/* 6 Verteilung */
const LZ={
  verf:{b:'Verfügbare Einkommen',n:'Deutschland: verfügbare Einkommen nach Steuern und Transfers (Näherung)',v:[7.5,13,17.5,23,39]},
  markt:{b:'Markteinkommen',n:'Deutschland: Markteinkommen vor Steuern und Transfers (Näherung)',v:[1.5,8,16,25,49.5]},
  verm:{b:'Vermögen',n:'Deutschland: Nettovermögen (Näherung; das ärmste Fünftel hat oft null oder Schulden)',v:[0,1.5,6.5,18,74]},
  gleich:{b:'Gleichverteilung',n:'Gleichverteilung: Jedes Fünftel hat 20 %',v:[20,20,20,20,20]}
};
tool({id:'verteilung',ch:2,goals:['V'],title:'Lorenz-Werkstatt',sub:'Lorenzkurve zeichnen, Gini-Koeffizient berechnen, Umverteilung durch den Staat sichtbar machen',
html(){return `
<p class="task"><b>Auftrag:</b> Verteilt 100 % des Einkommens auf fünf gleich große Bevölkerungsgruppen (ärmstes bis reichstes Fünftel). Vergleicht Markteinkommen und verfügbare Einkommen: Wie stark verteilt der Staat um? Und warum ist Vermögen viel ungleicher verteilt?</p>
<div class="grid2 wide-left">
  <div class="panel chart"><h3>Lorenzkurve</h3><div id="lz-svg"></div></div>
  <div class="panel stack"><div class="row">${Object.entries(LZ).map(([k,o])=>`<button class="btn small" data-lz="${k}" type="button">${o.b}</button>`).join('')}</div>
   <p class="small muted" id="lz-name"></p>
   ${[1,2,3,4,5].map(i=>`<div class="ctrl"><label for="lz${i}">${['Ärmstes','Zweites','Mittleres','Viertes','Reichstes'][i-1]} Fünftel <output id="lz${i}o"></output></label><input type="range" id="lz${i}" min="0" max="100" step="0.5"></div>`).join('')}
   <p class="small" id="lz-sum"></p>
   <div><p class="eyebrow">Gini-Koeffizient</p><div class="big-num" id="lz-g"></div><p class="small muted">0 = völlige Gleichheit · 1 = eine Person hat alles. Mit nur fünf Gruppen wird der Gini leicht unterschätzt.</p></div></div>
</div>
<div class="grid2">
  <div class="panel"><h3>Mindestlohn-Rechner</h3>
   <div class="ctrl"><label for="ml-h">Wochenstunden <output id="ml-ho"></output></label><input type="range" id="ml-h" min="5" max="45" step="1" value="40"></div>
   <div class="ctrl"><label for="ml-l">Stundenlohn <output id="ml-lo"></output></label><input type="range" id="ml-l" min="12.82" max="20" step="0.01" value="13.90"></div>
   <p>Monatlich brutto: <b id="ml-r" class="num"></b></p><p class="small muted">Gesetzlicher Mindestlohn: 13,90 € (2026), 14,60 € (ab 2027). Minijob-Grenze 2026: 603 € im Monat. Armutsgefährdungsschwelle für Alleinlebende: 1.446 € netto.</p></div>
  <div class="panel"><h3>Was ist gerecht?</h3><dl class="kv">
   <dt>Leistungsgerechtigkeit</dt><dd>Wer mehr leistet, soll mehr bekommen.</dd>
   <dt>Bedarfsgerechtigkeit</dt><dd>Jeder soll bekommen, was er zum Leben braucht.</dd>
   <dt>Chancengerechtigkeit</dt><dd>Gleiche Startchancen, z. B. durch Bildung – unabhängig vom Elternhaus.</dd>
   <dt>Primärverteilung</dt><dd>Verteilung über den Markt (Löhne, Gewinne, Zinsen, Mieten)</dd>
   <dt>Sekundärverteilung</dt><dd>Korrektur durch den Staat: progressive Einkommensteuer, Sozialabgaben, Transfers wie Kindergeld, Wohngeld, Grundsicherung</dd></dl></div>
</div>
${erkHTML('verteilung')}
${teacher(['Einstieg: 10 Schokoriegel auf 5 Schüler verteilen, wie es dem Vermögen in Deutschland entspricht (oberstes Fünftel bekommt rund 7).','Impulsfrage: Warum ist der Unterschied zwischen Markteinkommen und verfügbarem Einkommen so groß? Welche Instrumente bewirken das?','Kontroverse: Vermögensteuer, Erbschaftsteuer, höherer Mindestlohn – Pro und Contra.','Methodische Reserve: Positionslinie im Raum zur These „Der Mindestlohn sollte auf 15 € steigen“.'])}`},
init(root){
  let cur=LZ.verf.v.slice();
  const gini=s=>{const t=s.reduce((a,b)=>a+b,0)||1;let cum=0,prev=0,A=0;s.forEach(v=>{cum+=v/t;A+=(prev+cum)*0.2;prev=cum});return 1-A};
  const draw=()=>{
    const t=cur.reduce((a,b)=>a+b,0)||1;
    [1,2,3,4,5].forEach(i=>{$('#lz'+i,root).value=cur[i-1];$('#lz'+i+'o',root).textContent=fmt(cur[i-1]/t*100,1)+' %'});
    $('#lz-sum',root).textContent=Math.abs(t-100)>0.6?`Summe der Regler: ${fmt(t,1)} – die Werkstatt rechnet automatisch auf 100 % um.`:'Summe: 100 %';
    const g=gini(cur);$('#lz-g',root).textContent=fmt(g,2);
    const W=420,H=400,x0=56,y0=350,S=300,X=v=>x0+v*S,Y=v=>y0-v*S;
    let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Lorenzkurve, Gini ${fmt(g,2)}">`;
    [0,.2,.4,.6,.8,1].forEach(v=>{s+=`<line x1="${X(v)}" y1="${Y(0)}" x2="${X(v)}" y2="${Y(1)}" class="s-line"/><line x1="${X(0)}" y1="${Y(v)}" x2="${X(1)}" y2="${Y(v)}" class="s-line"/>
      <text x="${X(v)}" y="${y0+16}" text-anchor="middle" class="t-mu" font-size="11">${v*100}%</text><text x="${x0-6}" y="${Y(v)+4}" text-anchor="end" class="t-mu" font-size="11">${v*100}%</text>`});
    let pts=[[0,0]],c=0;cur.forEach((v,i)=>{c+=v/t;pts.push([(i+1)*0.2,c])});
    const ps=pts.map(([a,b])=>`${X(a).toFixed(1)},${Y(b).toFixed(1)}`).join(' ');
    s+=`<polygon points="${X(0)},${Y(0)} ${X(1)},${Y(1)} ${pts.slice().reverse().map(([a,b])=>`${X(a).toFixed(1)},${Y(b).toFixed(1)}`).join(' ')}" fill="var(--g-V)" fill-opacity=".22"/>`;
    s+=`<line x1="${X(0)}" y1="${Y(0)}" x2="${X(1)}" y2="${Y(1)}" class="s-fg" stroke-width="1.5" stroke-dasharray="6 4"/>`;
    s+=`<polyline points="${ps}" fill="none" stroke="var(--g-V)" stroke-width="3"/>`;
    pts.forEach(([a,b])=>s+=`<circle cx="${X(a)}" cy="${Y(b)}" r="4" fill="var(--g-V)"/>`);
    s+=`<text x="${X(.47)}" y="${Y(.56)}" class="t-mu" font-size="11" transform="rotate(-45 ${X(.47)} ${Y(.56)})">Gleichverteilungsgerade</text>`;
    s+=`<text x="${X(.62)}" y="${Y(.3)}" class="t-fg" font-size="12">Fläche ≈ Ungleichheit</text>`;
    s+=`<text x="${X(.5)}" y="${H-6}" text-anchor="middle" class="t-mu" font-size="11.5">Anteil der Bevölkerung (kumuliert, von arm nach reich)</text>`;
    s+=`<text x="14" y="${Y(.5)}" text-anchor="middle" class="t-mu" font-size="11.5" transform="rotate(-90 14 ${Y(.5)})">Anteil am Einkommen (kumuliert)</text>`;
    $('#lz-svg',root).innerHTML=s+'</svg>';
  };
  [1,2,3,4,5].forEach(i=>$('#lz'+i,root).addEventListener('input',e=>{cur[i-1]=+e.target.value;$('#lz-name',root).textContent='Eigene Verteilung';draw()}));
  $$('[data-lz]',root).forEach(b=>b.addEventListener('click',()=>{cur=LZ[b.dataset.lz].v.slice();$('#lz-name',root).textContent=LZ[b.dataset.lz].n;draw()}));
  $('#lz-name',root).textContent=LZ.verf.n;draw();
  const ml=()=>{const h=+$('#ml-h',root).value,l=+$('#ml-l',root).value;$('#ml-ho',root).textContent=h+' h';$('#ml-lo',root).textContent=fmt(l,2)+' €';$('#ml-r',root).textContent=fmt(h*l*13/3,0)+' €'};
  ['#ml-h','#ml-l'].forEach(s=>$(s,root).addEventListener('input',ml));ml();
  bindErk(root);
}});

/* 7 Umwelt */
const THG=[[1990,1251],[2000,1045],[2010,942],[2015,904],[2019,800],[2020,730],[2021,760],[2022,750],[2023,674],[2024,649],[2025,649]];
tool({id:'umwelt',ch:2,goals:['U'],title:'Klima-Werkstatt',sub:'Treibhausgas-Pfad bis 2045 planen, CO₂-Preis an der Zapfsäule berechnen',
html(){return `
<p class="task"><b>Auftrag:</b> Legt fest, um wie viele Millionen Tonnen Deutschland ab 2026 jedes Jahr Emissionen senkt. Wird das Ziel 2030 erreicht? Berechnet anschließend, was ein CO₂-Preis an der Tankstelle und beim Heizen kostet.</p>
<div class="panel chart"><h3>Treibhausgasemissionen Deutschland (Mio. t CO₂-Äquivalente)</h3><div id="th-svg"></div>
 <div class="legend" style="margin-bottom:6px"><span><i style="background:var(--g-U)"></i>Emissionen bis 2025</span><span><i style="background:var(--g-U);opacity:.5"></i>euer Pfad (gepunktet)</span><span><i style="background:var(--ok)"></i>Zielpfad Klimaschutzgesetz: 2030 → 438, 2040 → −88 %, 2045 → netto null</span></div>
 <div class="ctrl"><label for="th-r">Minderung pro Jahr ab 2026 <output id="th-ro"></output></label><input type="range" id="th-r" min="0" max="80" step="1" value="15"></div>
 <div id="th-fb" class="fb"></div></div>
<div class="grid2">
  <div class="panel"><h3>CO₂-Preis-Rechner</h3>
   <div class="ctrl"><label for="co-p">CO₂-Preis pro Tonne <output id="co-po"></output></label><input type="range" id="co-p" min="0" max="250" step="5" value="60"></div>
   <div class="tbl-wrap"><table><thead><tr><th>Produkt</th><th class="r">Aufschlag</th></tr></thead><tbody id="co-tab"></tbody></table></div>
   <p class="small muted">Werte ohne Mehrwertsteuer. Nationaler CO₂-Preis für Verkehr und Wärme 2026: Preiskorridor 55 bis 65 €/t, danach Übergang in den EU-Emissionshandel.</p></div>
  <div class="panel"><h3>Warum ist Umwelt ein wirtschaftspolitisches Ziel?</h3>
   <p>Wer CO₂ ausstößt, verursacht Schäden, für die er nicht bezahlt: <b>externe Kosten</b>. Der Markt produziert dann „zu billig“ und zu viel. Ein CO₂-Preis oder Emissionshandel (Obergrenze plus handelbare Zertifikate) rechnet diese Kosten ein.</p>
   <p style="margin-top:6px"><b>Entkopplung:</b> Seit 1990 ist die deutsche Wirtschaftsleistung real um rund die Hälfte gewachsen, die Emissionen sind um 48 % gesunken. Wachstum und Umweltschutz schließen sich also nicht zwingend aus – reicht das Tempo aber?</p>
   <p style="margin-top:6px"><b>Klimageld:</b> Wird das Geld aus dem CO₂-Preis pro Kopf zurückgezahlt, profitieren Haushalte mit geringem Verbrauch – oft die mit geringerem Einkommen.</p></div>
</div>
${erkHTML('umwelt')}
${teacher(['Rechenaufgabe: Wie viel Minderung pro Jahr wäre nötig, um 2030 genau 438 Mio. t zu erreichen? (≈ 42 Mio. t/Jahr – das Dreifache der Minderung der letzten Jahre)','Impulsfrage: Wer trägt die Last eines höheren CO₂-Preises? Pendler im ländlichen Thüringen vs. Studierende in Jena.','Bezug Rechtsprechung: Klimabeschluss des BVerfG 2021 – Freiheitsrechte künftiger Generationen.','Methodische Reserve: Eigenen CO₂-Fußabdruck mit dem UBA-CO₂-Rechner schätzen.'])}`},
init(root){
  const draw=()=>{
    const red=+$('#th-r',root).value;$('#th-ro',root).textContent=fmt(red,0)+' Mio. t';
    const W=760,H=300,x0=50,x1=W-16,y0=260,yt=20,sx=y=>x0+(y-1990)/(2046-1990)*(x1-x0),sy=v=>y0-(v/1300)*(y0-yt);
    let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Emissionspfad Deutschland">`;
    [0,250,500,750,1000,1250].forEach(v=>{s+=`<line x1="${x0}" y1="${sy(v)}" x2="${x1}" y2="${sy(v)}" class="s-line"/><text x="${x0-6}" y="${sy(v)+4}" text-anchor="end" class="t-mu" font-size="11">${v}</text>`});
    [1990,2000,2010,2020,2030,2040,2045].forEach(y=>s+=`<text x="${sx(y)}" y="${y0+18}" text-anchor="middle" class="t-mu" font-size="11">${y}</text>`);
    // Zielpfad
    const goal=[[2025,649],[2030,438],[2040,150],[2045,0]];
    s+=`<polyline points="${goal.map(([y,v])=>sx(y)+','+sy(v)).join(' ')}" fill="none" stroke="var(--ok)" stroke-width="2" stroke-dasharray="7 5"/>`;
    [[2030,438,'Ziel 2030: 438',-10,22,'end'],[2040,150,'2040: −88 %',-10,22,'end'],[2045,0,'',0,0,'end']].forEach(([y,v,l,dx,dy,a])=>s+=`<circle cx="${sx(y)}" cy="${sy(v)}" r="5" fill="var(--ok)"/>${l?`<text x="${sx(y)+dx}" y="${sy(v)+dy}" text-anchor="${a}" fill="var(--ok)" font-size="11.5" font-weight="700">${l}</text>`:''}`);
    // Projektion
    let pr=[[2025,649]];for(let y=2026;y<=2045;y++)pr.push([y,Math.max(0,649-red*(y-2025))]);
    s+=`<polyline points="${pr.map(([y,v])=>sx(y)+','+sy(v)).join(' ')}" fill="none" stroke="var(--g-U)" stroke-width="2.5" stroke-dasharray="2 4"/>`;
    s+=`<polyline points="${THG.map(([y,v])=>sx(y)+','+sy(v)).join(' ')}" fill="none" stroke="var(--g-U)" stroke-width="3"/>`;
    THG.forEach(([y,v])=>s+=`<circle cx="${sx(y)}" cy="${sy(v)}" r="3.5" fill="var(--g-U)"/>`);
    s+=`<text x="${sx(1990)+6}" y="${sy(1251)-6}" class="t-fg" font-size="11.5">1990: 1.251</text><text x="${sx(2024)}" y="${sy(649)+24}" text-anchor="end" class="t-fg" font-size="11.5">2025: 649 (−48 %)</text>`;
    $('#th-svg',root).innerHTML=s+'</svg>';
    const v30=Math.max(0,649-red*5),zero=red>0?2025+Math.ceil(649/red):null,fb=$('#th-fb',root);
    fb.className='fb '+(v30<=438?'ok':'bad');
    fb.innerHTML=`2030 lägen die Emissionen bei <b>${fmt(v30,0)} Mio. t</b> (${sgn((v30/1251-1)*100,0)} % ggü. 1990). ${v30<=438?'Ziel 2030 erreicht.':`Ziel um ${fmt(v30-438,0)} Mio. t verfehlt.`} ${zero&&zero<=2100?`Klimaneutral wäre Deutschland ${zero<=2045?'bereits ':''}im Jahr ${zero}.`:'Klimaneutralität rückt in weite Ferne.'} <span class="muted">Zum Vergleich: 2019 bis 2025 sanken die Emissionen im Schnitt um rund 25 Mio. t pro Jahr.</span>`;
  };
  $('#th-r',root).addEventListener('input',draw);draw();
  const co=()=>{const p=+$('#co-p',root).value;$('#co-po',root).textContent=fmt(p,0)+' €';
    const rows=[['1 Liter Benzin',2.33,'ct',100],['1 Liter Diesel',2.65,'ct',100],['Tankfüllung 50 l Benzin',2.33*50,'€',1],['1.000 kWh Erdgas (Heizen)',201,'€',1],['Jahresverbrauch Gas, 2-Zimmer-Wohnung (8.000 kWh)',1608,'€',1]];
    $('#co-tab',root).innerHTML=rows.map(([n,kg,u,f])=>`<tr><td>${n}</td><td class="r num"><b>${fmt(kg/1000*p*f,u==='ct'?1:2)} ${u}</b></td></tr>`).join('')};
  $('#co-p',root).addEventListener('input',co);co();
  bindErk(root);
}});

/* 8 Zielbeziehungen */
const REL={
  'P-B':['k','Konflikt','Expansive Politik (niedrige Zinsen, Konjunkturprogramme) senkt die Arbeitslosigkeit, erhöht aber die Nachfrage und damit die Preise. Umgekehrt dämpfen hohe Zinsen die Inflation und kosten Jobs (Phillips-Kurve). Gegenbeispiel Stagflation: Bei Angebotsschocks verschlechtern sich beide Ziele gleichzeitig.'],
  'P-W':['a','ambivalent','Kurzfristig Konflikt: Starkes Wachstum lässt die Preise steigen, Zinserhöhungen gegen Inflation bremsen das Wachstum. Langfristig Harmonie: Stabile Preise schaffen Planungssicherheit für Investitionen.'],
  'P-A':['a','ambivalent','Steigen die Preise im Inland stärker als im Ausland, werden Exporte teurer – bei einem Überschussland wie Deutschland nähert sich die Leistungsbilanz dem Gleichgewicht. Umgekehrt importiert ein Land über teures Öl und Gas Inflation (2022, 2026).'],
  'P-V':['h','Harmonie','Inflation trifft Menschen mit geringem Einkommen härter: Sie geben einen größeren Teil für Lebensmittel und Energie aus und haben kaum Vermögen, das mit den Preisen steigt. Stabile Preise schützen also auch die Verteilung. Spannung gibt es bei Mindestlohnerhöhungen, die Preise treiben können.'],
  'P-U':['k','Konflikt','Klimaschutz über CO₂-Preise verteuert fossile Energie, Heizen und Mobilität – das Preisniveau steigt („Greenflation“). Langfristig können günstige erneuerbare Energien die Preise aber stabilisieren.'],
  'B-W':['h','Harmonie','Wächst die Wirtschaft, brauchen Unternehmen mehr Arbeitskräfte (Okunsches Gesetz). Ausnahme: „Jobless Growth“, wenn Wachstum vor allem durch Automatisierung und KI entsteht.'],
  'B-A':['a','ambivalent','Exportüberschüsse sichern Arbeitsplätze in der Exportindustrie – das spricht für Konflikt mit dem Gleichgewicht. Steigt dagegen die Beschäftigung durch Binnennachfrage, wird mehr importiert und der Überschuss sinkt: Harmonie.'],
  'B-V':['h','Harmonie','Arbeit ist die wichtigste Einkommensquelle; Arbeitslosigkeit ist eines der größten Armutsrisiken. Mehr Beschäftigung verbessert daher meist die Verteilung.'],
  'B-U':['a','ambivalent','Strukturwandel durch Klimaschutz vernichtet Jobs (Kohleausstieg, Verbrennerzulieferer in Thüringen) und schafft neue (Wärmepumpen, Solar, Netzausbau). Entscheidend ist, ob Beschäftigte umgeschult werden.'],
  'W-A':['a','ambivalent','Exportgetriebenes Wachstum vergrößert einen Überschuss (Konflikt). Wachstum durch Konsum und Investitionen im Inland erhöht die Importe und verringert ihn (Harmonie).'],
  'W-V':['a','ambivalent','Wachstum schafft Verteilungsspielraum, aber nicht automatisch Gleichheit: Ob alle profitieren, hängt von Löhnen, Steuern und Bildung ab. Umgekehrt kann starke Umverteilung Leistungsanreize schwächen – das ist umstritten.'],
  'W-U':['k','Konflikt','Klassisch bedeutet mehr Produktion mehr Ressourcen- und Energieverbrauch. Gegenargument: Entkopplung durch grünes Wachstum – Deutschlands BIP stieg seit 1990, die Emissionen sanken um 48 %.'],
  'A-V':['n','neutral','Zwischen Leistungsbilanz und Einkommensverteilung besteht kein direkter Zusammenhang. Kritiker argumentieren allerdings, Lohnzurückhaltung habe Exportüberschüsse begünstigt und die Verteilung verschlechtert.'],
  'A-U':['n','neutral','Weitgehend unabhängig. Spannungen entstehen, wenn CO₂-intensive Produktion ins Ausland verlagert wird (Carbon Leakage); Chancen, wenn Umwelttechnik exportiert wird.'],
  'V-U':['k','Konflikt','Klimaschutz kostet Haushalte mit geringem Einkommen relativ mehr (CO₂-Preis wirkt regressiv). Lösbar über ein Klimageld. Zugleich verursachen reiche Haushalte deutlich mehr Emissionen.']
};
const RELC={h:['ok','var(--ok)','Harmonie'],k:['bad','var(--bad)','Konflikt'],a:['amb','var(--amb)','ambivalent'],n:['neu','var(--neu)','neutral']};
const relKey=(a,b)=>{const ia=ORDER.indexOf(a),ib=ORDER.indexOf(b);const pairOrder=['P','B','W','A','V','U'];return [a,b].sort((x,y)=>pairOrder.indexOf(x)-pairOrder.indexOf(y)).join('-')};
tool({id:'beziehungen',ch:3,goals:ORDER,title:'Zielbeziehungs-Detektiv',sub:'15 Paare untersuchen: Harmonie, Konflikt, neutral oder ambivalent?',
html(){return `
<p class="task"><b>Auftrag:</b> Wählt zwei Ziele aus. Entscheidet zuerst selbst, wie sie zusammenhängen, und deckt dann die Lösung auf. Ziel: alle 15 Beziehungen im Sechseck aufklären.</p>
<div class="grid2 wide-left">
  <div class="panel chart"><div class="row" style="justify-content:space-between"><h3>Beziehungsnetz <span class="small muted" id="zb-cnt"></span></h3><button class="btn small" id="zb-all" type="button">Alle aufdecken (Lehrkraft)</button></div>
  <div id="zb-svg"></div>
  <div class="legend"><span><i style="background:var(--ok)"></i>Harmonie</span><span><i style="background:var(--bad)"></i>Konflikt</span><span><i style="background:var(--amb)"></i>ambivalent</span><span><i style="background:var(--neu)"></i>neutral</span></div></div>
  <div class="panel stack" id="zb-panel"><p class="muted">Klickt im Sechseck zwei Ecken nacheinander an.</p></div>
</div>
<div class="panel"><h3>Begriffe</h3><dl class="kv">
 <dt>Zielharmonie</dt><dd>Die Förderung des einen Ziels fördert auch das andere (komplementär).</dd>
 <dt>Zielkonflikt</dt><dd>Die Förderung des einen Ziels beeinträchtigt das andere (konkurrierend).</dd>
 <dt>Zielneutralität</dt><dd>Die Ziele beeinflussen sich nicht (indifferent).</dd>
 <dt>ambivalent</dt><dd>Je nach Ursache, Zeitraum und Ausgangslage Harmonie oder Konflikt.</dd></dl></div>
${erkHTML('beziehungen')}
${teacher(['Gruppen erhalten je 3 Paare, begründen ihre Einschätzung mit Wirkungskette (Pfeildiagramm) und präsentieren.','Wichtig: Es gibt Spielraum! Gut begründete Abweichungen von der Lösung anerkennen – gerade bei ambivalenten Paaren.','Impulsfrage: Welche zwei Ziele würdet ihr priorisieren, wenn ihr nur zwei erreichen könntet?','Methodische Reserve: Wirkungskette für ein Paar als Hefteintrag zeichnen.'])}`},
init(root){
  let pick=[], seen=new Set(store('ms6-rel')||[]), guess=null;
  const draw=()=>{
    const W=520,H=400,cx=260,cy=200,r=136,p=hexPts(cx,cy,r);
    let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Beziehungsnetz der sechs Ziele">`;
    s+=`<polygon points="${ptsStr(p)}" fill="none" class="s-line" stroke-width="1.5"/>`;
    Object.keys(REL).forEach(key=>{const [a,b]=key.split('-');const ia=ORDER.indexOf(a),ib=ORDER.indexOf(b);const on=seen.has(key);
      s+=`<line x1="${p[ia][0]}" y1="${p[ia][1]}" x2="${p[ib][0]}" y2="${p[ib][1]}" stroke="${on?RELC[REL[key][0]][1]:'var(--line)'}" stroke-width="${on?4:1.5}" ${on?'':'stroke-dasharray="3 5"'} stroke-linecap="round"/>`});
    ORDER.forEach((k,i)=>{const [x,y]=p[i];const lp=hexPts(cx,cy,r+30)[i];const a=Math.abs(lp[0]-cx)<5?'middle':(lp[0]>cx?'start':'end');const sel=pick.includes(k);
      s+=`<g class="hexcorner" tabindex="0" role="button" data-k="${k}" aria-pressed="${sel}" aria-label="${G[k].short} auswählen"><circle class="dot" cx="${x}" cy="${y}" r="${sel?21:16}" fill="${gc(k)}" stroke="${sel?'var(--fg)':'var(--surface)'}" stroke-width="3"/>
      <text x="${x}" y="${y+5}" text-anchor="middle" fill="var(--md-on-g-${k})" font-size="13" font-weight="700">${k}</text>
      <text x="${lp[0]}" y="${lp[1]+(i===0?-4:i===3?14:5)}" text-anchor="${a}" fill="${gc(k)}" font-size="14" font-weight="700">${G[k].short}</text></g>`});
    $('#zb-svg',root).innerHTML=s+'</svg>';
    $('#zb-cnt',root).textContent=`(${seen.size}/15 aufgeklärt)`;
    $$('.hexcorner',root).forEach(g=>{const f=()=>clickK(g.dataset.k);g.addEventListener('click',f);g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();f()}})});
  };
  const panel=$('#zb-panel',root);
  const clickK=k=>{
    if(pick.length===2||pick.includes(k))pick=[];
    pick.push(k);guess=null;draw();
    if(pick.length===1){panel.innerHTML=`<p>${hexDot(k)} <b>${G[k].short}</b> gewählt. Jetzt die zweite Ecke anklicken.</p>`;return}
    const key=relKey(pick[0],pick[1]);
    panel.innerHTML=`<h3>${hexDot(pick[0])} ${G[pick[0]].short} <span class="ms sm">sync_alt</span> ${hexDot(pick[1])} ${G[pick[1]].short}</h3>
      <p>Eure Vermutung:</p><div class="choice" id="zb-ch">${Object.entries(RELC).map(([c,v])=>`<button type="button" data-c="${c}">${v[2]}</button>`).join('')}</div>
      <button class="btn primary" id="zb-rev" type="button" ${seen.has(key)?'':'disabled'}>Lösung aufdecken</button><div id="zb-sol"></div>`;
    $$('#zb-ch button',panel).forEach(b=>b.addEventListener('click',()=>{guess=b.dataset.c;$$('#zb-ch button',panel).forEach(x=>x.classList.toggle('sel',x===b));$('#zb-rev',panel).disabled=false}));
    $('#zb-rev',panel).addEventListener('click',()=>reveal(key));
    if(seen.has(key))reveal(key);
  };
  const reveal=key=>{
    const [c,lab,txt]=REL[key];seen.add(key);store('ms6-rel',[...seen]);
    $$('#zb-ch button',panel).forEach(x=>{if(x.dataset.c===c)x.classList.add('right');else if(x.dataset.c===guess)x.classList.add('wrong')});
    $('#zb-sol',panel).innerHTML=`<div class="fb ${RELC[c][0]}" style="margin-top:8px"><b>${lab}</b>${guess?(guess===c?' – richtig vermutet!':' – andere Einschätzung als eure. Habt ihr gute Gründe?'):''}<br>${txt}</div>`;
    $('#zb-rev',panel).hidden=true;draw();
  };
  $('#zb-all',root).addEventListener('click',()=>{Object.keys(REL).forEach(k=>seen.add(k));store('ms6-rel',[...seen]);draw()});
  draw();bindErk(root);
}});

/* 9 Phillips */
const PH=[[2015,6.4,0.7],[2016,6.1,0.4],[2017,5.7,1.7],[2018,5.2,1.9],[2019,5.0,1.4],[2020,5.9,0.5],[2021,5.7,3.1],[2022,5.3,6.9],[2023,5.7,5.9],[2024,6.0,2.2],[2025,6.3,2.2]];
tool({id:'phillips',ch:3,goals:['P','B'],title:'Phillips-Kurven-Labor',sub:'Den Klassiker unter den Zielkonflikten an echten deutschen Daten prüfen',
html(){return `
<p class="task"><b>Auftrag:</b> Die Phillips-Kurve behauptet: Weniger Arbeitslosigkeit gibt es nur um den Preis höherer Inflation. Prüft die These mit den deutschen Jahreswerten 2015 bis 2025. Wo passt sie, wo nicht – und warum?</p>
<div class="grid2 wide-left">
  <div class="panel chart"><div id="ph-svg"></div>
   <div class="row"><button class="btn small" id="ph-theo" type="button" aria-pressed="false">Theoretische Kurve einblenden</button><button class="btn small" id="ph-stag" type="button" aria-pressed="false">Stagflation markieren</button></div></div>
  <div class="panel stack"><h3>Die Geschichte der Kurve</h3>
   <p><b>1958</b> fand A. W. Phillips für Großbritannien einen Zusammenhang zwischen niedriger Arbeitslosigkeit und schnell steigenden Löhnen. Samuelson und Solow übertrugen ihn 1960 auf die Inflation: Politik könne zwischen beiden Zielen wählen.</p>
   <p>Der Satz „Lieber 5 % Inflation als 5 % Arbeitslosigkeit“ wird Helmut Schmidt (1972) zugeschrieben. In den 1970er Jahren bekam Deutschland nach der Ölkrise beides: hohe Inflation <i>und</i> steigende Arbeitslosigkeit.</p>
   <p><b>Erklärung:</b> Die Kurve gilt am ehesten bei Nachfrageschwankungen. Bei Angebotsschocks (teure Energie) steigen Kosten und Preise, während die Produktion sinkt: <b>Stagflation</b>. Außerdem passen Menschen ihre Inflationserwartungen an – dauerhaft lässt sich Arbeitslosigkeit nicht mit Inflation „kaufen“ (Friedman, Phelps).</p>
   <div id="ph-info" class="fb neu small">Tippt auf einen Punkt für Details.</div></div>
</div>
${erkHTML('phillips')}
${teacher(['Vor dem Aufdecken: Schüler skizzieren, wie die Punkte liegen müssten, wenn die Theorie stimmt.','Impulsfrage: Was unterscheidet 2022 von 2017? (Ursache der Inflation: Energiepreise statt Nachfrageüberhang)','Aktueller Bezug: Energiepreisschock 2026 durch den Iran-Krieg – droht erneut Stagflation?','Methodische Reserve: Kurzvortrag zur Ölkrise 1973 und den Sonntagsfahrverboten.'])}`},
init(root){
  let theo=false,stag=false;
  const draw=()=>{
    const W=560,H=380,x0=56,x1=W-20,y0=320,yt=20,sx=v=>x0+(v-4.5)/(7-4.5)*(x1-x0),sy=v=>y0-v/8*(y0-yt);
    let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Phillips-Diagramm Deutschland 2015 bis 2025">`;
    [0,2,4,6,8].forEach(v=>s+=`<line x1="${x0}" y1="${sy(v)}" x2="${x1}" y2="${sy(v)}" class="s-line"/><text x="${x0-6}" y="${sy(v)+4}" text-anchor="end" class="t-mu" font-size="11">${v} %</text>`);
    [4.5,5,5.5,6,6.5,7].forEach(v=>s+=`<text x="${sx(v)}" y="${y0+18}" text-anchor="middle" class="t-mu" font-size="11">${fmt(v)} %</text>`);
    s+=`<text x="${(x0+x1)/2}" y="${H-8}" text-anchor="middle" class="t-mu" font-size="12">Arbeitslosenquote (BA)</text><text x="14" y="${(y0+yt)/2}" text-anchor="middle" class="t-mu" font-size="12" transform="rotate(-90 14 ${(y0+yt)/2})">Inflationsrate (VPI)</text>`;
    s+=`<line x1="${x0}" y1="${sy(2)}" x2="${x1}" y2="${sy(2)}" stroke="var(--ok)" stroke-dasharray="6 4"/><text x="${x1}" y="${sy(2)-5}" text-anchor="end" fill="var(--ok)" font-size="11">EZB-Ziel 2 %</text>`;
    if(theo){let d='';for(let u=4.6;u<=7;u+=0.05){const pi=0.9+ 3.2/(u-3.6)-0.4;d+=(d?'L':'M')+sx(u).toFixed(1)+','+sy(clamp(pi,0,8)).toFixed(1)}s+=`<path d="${d}" fill="none" stroke="var(--g-W)" stroke-width="2.5"/><text x="${sx(4.62)}" y="${sy(3.9)}" fill="var(--g-W)" font-size="11.5" font-weight="700">theoretische Phillips-Kurve</text>`}
    s+=`<polyline points="${PH.map(([,u,p])=>sx(u)+','+sy(p)).join(' ')}" fill="none" class="s-mu" stroke-width="1.2" stroke-dasharray="2 3"/>`;
    PH.forEach(([y,u,p],i)=>{const st=stag&&(y===2022||y===2023);s+=`<g class="hexcorner" tabindex="0" role="button" data-i="${i}" aria-label="${y}: Arbeitslosenquote ${fmt(u)} %, Inflation ${fmt(p)} %"><circle cx="${sx(u)}" cy="${sy(p)}" r="${st?9:6.5}" fill="${st?'var(--bad)':'var(--g-P)'}" stroke="var(--surface)" stroke-width="2"/>
      <text x="${sx(u)+9}" y="${sy(p)-7}" class="t-fg" font-size="11">${y}</text></g>`});
    if(stag)s+=`<text x="${sx(5.5)+40}" y="${sy(6.9)+4}" fill="var(--bad)" font-size="12" font-weight="700">Energiepreisschock</text>`;
    $('#ph-svg',root).innerHTML=s+'</svg>';
    $$('#ph-svg .hexcorner',root).forEach(g=>{const f=()=>{const [y,u,p]=PH[+g.dataset.i];$('#ph-info',root).innerHTML=`<b>${y}</b>: Arbeitslosenquote ${fmt(u)} %, Inflation ${fmt(p)} %. ${{2020:'Corona: Nachfrageeinbruch, Mehrwertsteuersenkung.',2021:'Nachholeffekte, CO₂-Preis eingeführt, Mehrwertsteuer wieder normal.',2022:'Russlands Krieg gegen die Ukraine: Energiepreisschock.',2023:'Inflation bleibt hoch, Wirtschaft schrumpft.',2019:'Höchststand der Beschäftigung, niedrige Inflation – widerspricht dem Zielkonflikt.',2017:'Aufschwung: weniger Arbeitslose, etwas mehr Inflation – passt zur Theorie.',2018:'Aufschwung: weniger Arbeitslose, etwas mehr Inflation – passt zur Theorie.',2025:'Arbeitslosigkeit steigt bei moderater Inflation.'}[y]||''}`};g.addEventListener('click',f);g.addEventListener('keydown',e=>{if(e.key==='Enter'){f()}})});
  };
  $('#ph-theo',root).addEventListener('click',e=>{theo=!theo;e.currentTarget.setAttribute('aria-pressed',theo);draw()});
  $('#ph-stag',root).addEventListener('click',e=>{stag=!stag;e.currentTarget.setAttribute('aria-pressed',stag);draw()});
  draw();bindErk(root);
}});

/* 10 Politik-Simulator */
const MEAS=[
  {id:'zins',a:'EZB',n:'Leitzins um 0,5 Prozentpunkte erhöhen',e:{P:2,B:-1,W:-1,A:1,V:0,U:-1},d:0,c:'Kredite teurer → Konsum und Investitionen sinken → weniger Preisdruck. Euro wertet auf → Exporte bremsen. Klimainvestitionen werden teurer.'},
  {id:'invest',a:'Bundesregierung',n:'Kreditfinanziertes Investitionsprogramm (Schiene, Netze, Schulen)',e:{P:-1,B:1,W:2,A:1,V:0,U:1},d:2,c:'Staatsnachfrage ↑ → Aufträge für Bau und Industrie → Jobs. Mehr Importe → Überschuss sinkt. Höhere Nachfrage → Preisdruck. Schulden steigen.'},
  {id:'steuer',a:'Bundesregierung',n:'Einkommensteuer für alle senken',e:{P:-1,B:1,W:1,A:1,V:-1,U:-1},d:2,c:'Mehr Netto → Konsum ↑ → Wachstum. Absolut profitieren Besserverdienende stärker. Mehr Konsum → mehr Ressourcenverbrauch. Steuereinnahmen fehlen.'},
  {id:'co2',a:'Bundesregierung',n:'CO₂-Preis deutlich erhöhen, Einnahmen als Klimageld pro Kopf zurück',e:{P:-1,B:0,W:-1,A:0,V:1,U:2},d:0,c:'Fossile Energie teurer → weniger Emissionen, aber höhere Preise. Klimageld entlastet sparsame, oft ärmere Haushalte.'},
  {id:'mindest',a:'Mindestlohnkommission',n:'Mindestlohn kräftig erhöhen',e:{P:-1,B:-1,W:0,A:0,V:2,U:0},d:0,c:'Geringverdiener ↑ → Verteilung besser. Höhere Lohnkosten → Preise ↑; Gefahr von Jobabbau in Niedriglohnbranchen (empirisch umstritten).'},
  {id:'reich',a:'Bundesregierung',n:'Spitzensteuersatz erhöhen, Vermögensteuer einführen',e:{P:0,B:0,W:-1,A:0,V:2,U:0},d:-1,c:'Umverteilung von oben nach unten, Mehreinnahmen. Kritiker: weniger Investitionen und Kapitalflucht.'},
  {id:'export',a:'Bundesregierung',n:'Industriestrompreis subventionieren, Exporte fördern',e:{P:0,B:1,W:1,A:-1,V:0,U:-1},d:1,c:'Energieintensive Industrie bleibt wettbewerbsfähig → Jobs. Exporte ↑ → Überschuss wächst. Billiger Strom senkt Sparanreize.'},
  {id:'sparen',a:'Bundesregierung',n:'Sparprogramm: Ausgaben kürzen (Schuldenbremse)',e:{P:1,B:-1,W:-1,A:-1,V:-1,U:-1},d:-2,c:'Staatsnachfrage ↓ → weniger Preisdruck, aber Aufträge und Jobs gehen verloren. Kürzungen treffen oft Sozial- und Klimaprogramme. Weniger Importe → Überschuss ↑.'},
  {id:'bremse',a:'Bundesregierung',n:'Energiepreisbremse für Strom und Gas',e:{P:1,B:0,W:1,A:0,V:1,U:-1},d:2,c:'Gemessene Preise sinken sofort, Haushalte werden entlastet. Sparanreiz sinkt → mehr Verbrauch. Sehr teuer für den Staat.'},
  {id:'fach',a:'Bund und Länder',n:'Fachkräfteeinwanderung und Weiterbildungsoffensive',e:{P:0,B:1,W:1,A:0,V:1,U:0},d:1,c:'Engpässe am Arbeitsmarkt sinken, strukturelle Arbeitslosigkeit geht zurück. Wirkt erst nach Jahren.'},
  {id:'lohn',a:'Tarifpartner',n:'Gewerkschaften setzen hohe Lohnabschlüsse durch',e:{P:-1,B:-1,W:1,A:1,V:1,U:0},d:0,c:'Kaufkraft ↑ → Konsum, mehr Importe. Höhere Kosten → Preise ↑, Gefahr Lohn-Preis-Spirale; manche Betriebe stellen weniger ein.'}
];
const START={
  de:{n:'Deutschland, Herbst 2026',v:{P:74,B:49,W:89,A:44,V:68,U:74},t:'Inflation 3,3 %, Arbeitslosenquote 6,4 %, Wachstumsprognose 1,3 %, Leistungsbilanz +4,7 %, Treibhausgase −48 %. Staatsdefizit steigt.'},
  rez:{n:'Tiefe Rezession',v:{P:90,B:35,W:15,A:55,V:55,U:80},t:'Die Wirtschaft schrumpft um 2 %, die Arbeitslosigkeit steigt schnell, die Preise sind stabil, die Emissionen sinken – weil weniger produziert wird.'},
  boom:{n:'Überhitzung',v:{P:25,B:88,W:80,A:60,V:62,U:45},t:'Volle Auftragsbücher, Fachkräftemangel, Inflation bei 6 %. Die Emissionen steigen mit der Produktion.'}
};
tool({id:'politik',ch:4,goals:ORDER,title:'Wirtschaftspolitik-Simulator',sub:'Maßnahmen wählen und sehen, wie sich das Sechseck verformt',
html(){return `
<p class="task"><b>Auftrag:</b> Ihr seid der Wirtschaftsausschuss. Wählt eine Ausgangslage und kombiniert bis zu vier Maßnahmen. Schafft ihr es, alle sechs Ziele über 70 Punkte zu bringen? Begründet eure Auswahl mit den Wirkungsketten.</p>
<div class="row"><span class="small muted">Ausgangslage:</span>${Object.entries(START).map(([k,o])=>`<button class="btn small" data-st="${k}" type="button" aria-pressed="${k==='de'}">${o.n}</button>`).join('')}</div>
<p class="small" id="ps-st"></p>
<div class="grid2">
  <div class="panel chart"><div id="ps-radar"></div>
   <div class="legend"><span><i style="background:var(--muted)"></i>Ausgangslage (gestrichelt)</span><span><i style="background:var(--accent)"></i>nach euren Maßnahmen</span></div></div>
  <div class="panel stack"><h3>Bilanz</h3><div id="ps-tab"></div>
   <div><p class="small">Staatsverschuldung</p><div class="bar"><i id="ps-debt"></i></div><p class="small muted" id="ps-debt-t"></p></div>
   <div id="ps-fb" class="fb neu small"></div></div>
</div>
<div class="panel"><h3>Maßnahmen <span class="small muted" id="ps-n"></span></h3><div class="measures" id="ps-m"></div></div>
<p class="small muted">Modell: Jede Maßnahme verschiebt die Ziele qualitativ um bis zu ±2 Stufen (je 9 Punkte). Echte Wirkungen hängen von Ausmaß, Zeitpunkt und Lage ab und sind teils umstritten. Genau darüber lohnt sich die Diskussion.</p>
${erkHTML('politik')}
${teacher(['Gruppen vertreten Parteien oder Verbände (Gewerkschaft, Arbeitgeber, Umweltverband, Sozialverband) und wählen Maßnahmen aus ihrer Sicht – anschließend Vergleich der Sechsecke.','Achtung Akteure: Die EZB ist unabhängig und gehört nicht zur Bundesregierung – gut für eine Nachfrage.','Impulsfrage: Warum ist es unmöglich, alle Ziele über 70 zu bringen? Was folgt daraus für Politik?','Methodische Reserve: „Regierungserklärung“ in 60 Sekunden, die das gewählte Paket rechtfertigt.'])}`},
init(root){
  let st='de',on=new Set();
  const MAX=4;
  const calc=()=>{
    const base=START[st].v,res={},dsum=MEAS.filter(m=>on.has(m.id)).reduce((a,m)=>a+m.d,0);
    ORDER.forEach(k=>{res[k]=clamp(base[k]+MEAS.filter(m=>on.has(m.id)).reduce((a,m)=>a+m.e[k]*9,0),0,100)});
    $('#ps-radar',root).innerHTML=radar([{v:base,stroke:'var(--muted)',dash:'6 5',fo:0},{v:res,stroke:'var(--accent)',fill:'var(--accent)',fo:.2}],{label:'Zielerreichung vor und nach den Maßnahmen'});
    $('#ps-tab',root).innerHTML=`<div class="tbl-wrap"><table><tbody>${ORDER.map(k=>{const d=res[k]-base[k];return `<tr><td>${hexDot(k)} ${G[k].short}</td><td class="r num">${Math.round(base[k])}</td><td class="r num"><b>${Math.round(res[k])}</b></td><td class="r num" style="color:${d>0?'var(--ok)':d<0?'var(--bad)':'var(--muted)'}">${d?sgn(d,0):'±0'}</td></tr>`}).join('')}</tbody></table></div>`;
    const debt=clamp(50+dsum*8,5,100);$('#ps-debt',root).style.width=debt+'%';$('#ps-debt',root).style.background=debt>66?'var(--bad)':debt<40?'var(--ok)':'var(--amb)';
    $('#ps-debt-t',root).textContent=dsum>0?'Eure Maßnahmen erhöhen die Staatsschulden – künftige Zinslasten und die Schuldenbremse beachten.':dsum<0?'Eure Maßnahmen senken die Neuverschuldung.':'Neutral für die Staatsfinanzen.';
    const up=ORDER.filter(k=>res[k]>base[k]),dn=ORDER.filter(k=>res[k]<base[k]),all70=ORDER.every(k=>res[k]>=70);
    const fb=$('#ps-fb',root);
    if(!on.size){fb.className='fb neu small';fb.textContent='Wählt Maßnahmen aus. Die gestrichelte Linie zeigt die Ausgangslage.'}
    else if(all70){fb.className='fb ok small';fb.innerHTML='<b>Alle sechs Ziele über 70!</b> Prüft kritisch: Sind die Annahmen realistisch, und wer bezahlt die Schulden?'}
    else if(up.length&&dn.length){fb.className='fb amb small';fb.innerHTML=`<b>Zielkonflikt:</b> Ihr verbessert ${up.map(k=>G[k].short).join(', ')}, verschlechtert aber ${dn.map(k=>G[k].short).join(', ')}. Ziele, die noch unter 70 liegen: ${ORDER.filter(k=>res[k]<70).map(k=>G[k].short).join(', ')||'keine'}.`}
    else{fb.className='fb neu small';fb.innerHTML=`Durchschnittliche Zielerreichung: <b>${Math.round(ORDER.reduce((a,k)=>a+res[k],0)/6)}</b> Punkte.`}
    $('#ps-n',root).textContent=`(${on.size}/${MAX} gewählt)`;
    $$('#ps-m .toggle-card',root).forEach(b=>{const sel=on.has(b.dataset.m);b.setAttribute('aria-pressed',sel);b.disabled=!sel&&on.size>=MAX;b.style.opacity=b.disabled?.5:1;$('.chain',b).hidden=!sel});
  };
  $('#ps-m',root).innerHTML=MEAS.map(m=>`<button class="toggle-card" type="button" data-m="${m.id}" aria-pressed="false"><span class="actor">${m.a}</span><b>${m.n}</b>
    <span class="row" style="gap:4px">${ORDER.filter(k=>m.e[k]).map(k=>`<span class="pill ${m.e[k]>0?'ok':'bad'}">${k}<span class="ms">${Math.abs(m.e[k])>1?(m.e[k]>0?'keyboard_double_arrow_up':'keyboard_double_arrow_down'):(m.e[k]>0?'arrow_upward':'arrow_downward')}</span></span>`).join('')}</span><span class="chain" hidden>${m.c}</span></button>`).join('');
  $$('#ps-m .toggle-card',root).forEach(b=>b.addEventListener('click',()=>{const id=b.dataset.m;on.has(id)?on.delete(id):on.size<MAX&&on.add(id);calc()}));
  $$('[data-st]',root).forEach(b=>b.addEventListener('click',()=>{st=b.dataset.st;$$('[data-st]',root).forEach(x=>x.setAttribute('aria-pressed',x===b));$('#ps-st',root).textContent=START[st].t;calc()}));
  $('#ps-st',root).textContent=START[st].t;calc();bindErk(root);
}});

/* 11 Deutschland-Check */
const YEARS={
  '2019':{P:1.4,B:5.0,W:1.0,A:8,V:0.295,U:36,thg:'≈ 800',lb:'≈ 8'},
  '2020':{P:0.5,B:5.9,W:-4.1,A:7,V:0.295,U:41,thg:'≈ 730',lb:'≈ 7'},
  '2023':{P:5.9,B:5.7,W:-0.9,A:6,V:0.295,U:46,thg:'674',lb:'≈ 6'},
  '2025':{P:2.2,B:6.3,W:0.2,A:4.4,V:0.295,U:48.2,thg:'649',lb:'4,4'},
  '2026*':{P:2.8,B:6.4,W:1.3,A:4.7,V:0.295,U:48.2,thg:'649 (Stand 2025)',lb:'4,7'}
};
const SCORE={
  P:{f:v=>100-Math.abs(v-2)*20,rule:'100 − 20 × Abstand zu 2 %',show:v=>fmt(v)+' %'},
  B:{f:v=>100-Math.max(0,v-3)*15,rule:'100 − 15 × Prozentpunkte über 3 %',show:v=>fmt(v)+' %'},
  W:{f:v=>100-Math.abs(v-1.75)*25,rule:'100 − 25 × Abstand zu 1,75 %',show:v=>sgn(v)+' %'},
  A:{f:v=>100-Math.abs(v)*12,rule:'100 − 12 × Betrag des Saldos (in % BIP)',show:(v,y)=>'+'+y.lb+' %'},
  V:{f:v=>(0.5-v)/0.3*100,rule:'(0,5 − Gini) ÷ 0,3 × 100',show:()=>'Gini ≈ 0,29–0,30'},
  U:{f:v=>v/65*100,rule:'erreichte Minderung ÷ 65 % (Ziel 2030) × 100',show:(v,y)=>`${y.thg} Mio. t (−${fmt(v,0)} %)`}
};
tool({id:'check',ch:4,goals:ORDER,title:'Deutschland-Check',sub:'Wie gut erreicht Deutschland die Ziele? Jahre vergleichen – und die Messlatte hinterfragen',
html(){return `
<p class="task"><b>Auftrag:</b> Vergleicht zwei Jahre. In welchem Jahr war das Sechseck am „rundesten“? Prüft dann die Bewertungsregeln: Sind sie fair? Ändert eine Regel und begründet, warum eure besser ist.</p>
<div class="row"><span class="small muted">Jahr A:</span><span id="ck-a" class="row"></span></div>
<div class="row"><span class="small muted">Jahr B (Vergleich):</span><span id="ck-b" class="row"></span></div>
<div class="grid2">
  <div class="panel chart"><div id="ck-radar"></div><div class="legend" id="ck-leg"></div></div>
  <div class="panel"><div class="tbl-wrap"><table><thead><tr><th>Ziel</th><th>Indikator <span id="ck-ya"></span></th><th class="r">Punkte</th><th class="r" id="ck-yb"></th></tr></thead><tbody id="ck-tab"></tbody></table></div>
  <p class="small muted" style="margin-top:8px">* 2026: Prognose der Gemeinschaftsdiagnose (Herbst 2026). Werte gerundet; Leistungsbilanz der früheren Jahre nach späteren Revisionen nur ungefähr. Gini-Koeffizient seit Jahren nahezu unverändert.</p></div>
</div>
<div class="panel"><h3>Die Messlatte (normative Setzung!)</h3><div class="tbl-wrap"><table><tbody>${ORDER.map(k=>`<tr><td>${hexDot(k)} ${G[k].short}</td><td class="mono small">${SCORE[k].rule}</td></tr>`).join('')}</tbody></table></div>
<p class="small" style="margin-top:8px">Diskussionsfragen: Ist ein Leistungsbilanzüberschuss genauso schlecht wie ein Defizit? Warum 1,75 % Wachstum – und nicht 0 %? Wie misst man „gerechte“ Verteilung mit einer Zahl?</p>
<p class="small" style="margin-top:6px"><b>Regional:</b> Thüringen hatte im Juli 2026 eine Arbeitslosenquote von 6,5 % – etwas mehr als der Bundesdurchschnitt.</p></div>
${erkHTML('check')}
${teacher(['Einstieg: Sechseck 2019 vs. 2023 zeigen, Schüler beschreiben die Verformung und nennen Ursachen (Corona, Energiekrise).','Wichtig: Die Punkteskala ist eine didaktische Setzung, keine amtliche Statistik – genau das ist Lerngegenstand.','Methodische Reserve: Eigene Bewertungsregel entwerfen und das Jahr 2025 neu bewerten.'])}`},
init(root){
  let a='2026*',b='2019';
  const score=(k,y)=>clamp(Math.round(SCORE[k].f(YEARS[y][k])),0,100);
  const btns=(id,get,set)=>{$(id,root).innerHTML=Object.keys(YEARS).map(y=>`<button class="btn small" type="button" data-y="${y}" aria-pressed="${y===get()}">${y}</button>`).join('')+(id==='#ck-b'?`<button class="btn small" type="button" data-y="" aria-pressed="${!get()}">keins</button>`:'');
    $$(id+' button',root).forEach(x=>x.addEventListener('click',()=>{set(x.dataset.y);$$(id+' button',root).forEach(z=>z.setAttribute('aria-pressed',z===x));draw()}))};
  const draw=()=>{
    const sa={},sb={};ORDER.forEach(k=>{sa[k]=score(k,a);if(b)sb[k]=score(k,b)});
    const ser=[];if(b)ser.push({v:sb,stroke:'var(--muted)',dash:'6 5',fo:0});ser.push({v:sa,stroke:'var(--accent)',fill:'var(--accent)',fo:.2});
    $('#ck-radar',root).innerHTML=radar(ser,{label:'Zielerreichung Deutschland'});
    $('#ck-leg',root).innerHTML=`<span><i style="background:var(--accent)"></i>${a}</span>${b?`<span><i style="background:var(--muted)"></i>${b} (gestrichelt)</span>`:''}`;
    $('#ck-ya',root).textContent=a;$('#ck-yb',root).textContent=b?b:'';
    $('#ck-tab',root).innerHTML=ORDER.map(k=>`<tr><td>${hexDot(k)} ${G[k].short}</td><td class="num">${SCORE[k].show(YEARS[a][k],YEARS[a])}</td><td class="r num"><b>${sa[k]}</b></td><td class="r num muted">${b?sb[k]:''}</td></tr>`).join('')+
      `<tr><td><b>Durchschnitt</b></td><td></td><td class="r num"><b>${Math.round(ORDER.reduce((s,k)=>s+sa[k],0)/6)}</b></td><td class="r num muted">${b?Math.round(ORDER.reduce((s,k)=>s+sb[k],0)/6):''}</td></tr>`;
  };
  btns('#ck-a',()=>a,v=>a=v);btns('#ck-b',()=>b,v=>b=v);draw();bindErk(root);
}});

/* 12 Quiz */
const QUIZ=[
  ['Welches Gesetz legte 1967 die vier Ziele des magischen Vierecks fest?',['Stabilitäts- und Wachstumsgesetz (StabG)','Grundgesetz, Art. 20a','Gesetz gegen Wettbewerbsbeschränkungen','Bundes-Klimaschutzgesetz'],0,'§ 1 StabG nennt Preisniveaustabilität, hohen Beschäftigungsstand, außenwirtschaftliches Gleichgewicht und stetiges, angemessenes Wachstum.'],
  ['Warum heißt das Sechseck „magisch“?',['Weil die Ziele nicht alle gleichzeitig vollständig erreichbar sind','Weil die Zielwerte geheim sind','Weil es sich jedes Jahr automatisch anpasst','Weil nur die EZB es steuern kann'],0,'Zwischen den Zielen bestehen Konflikte; sie gleichzeitig zu erreichen, gleicht Zauberei.'],
  ['Die Inflationsrate sinkt von 3,3 % auf 2,5 %. Was stimmt?',['Die Preise steigen weiter, nur langsamer (Disinflation)','Die Preise sinken (Deflation)','Das Preisniveau bleibt gleich','Die Kaufkraft steigt um 0,8 %'],0,'Eine sinkende, aber positive Inflationsrate heißt: Das Preisniveau steigt weiter, nur weniger schnell.'],
  ['Welches Inflationsziel verfolgt die EZB?',['2 % mittelfristig, symmetrisch','0 % jederzeit','unter 3 % pro Quartal','genau die Lohnsteigerung'],0,'Seit 2021 strebt die EZB symmetrisch 2 % auf mittlere Sicht an.'],
  ['Der Nominallohn steigt um 4 %, die Inflation beträgt 3,3 %. Wie verändert sich der Reallohn ungefähr?',['+0,7 %','+7,3 %','−0,7 %','+4 %'],0,'Reallohn ≈ Nominallohn − Inflation = 4 % − 3,3 % ≈ 0,7 %.'],
  ['Ein Gini-Koeffizient von 0 bedeutet …',['… völlige Gleichverteilung','… völlige Ungleichverteilung','… keine Armut, aber Ungleichheit','… dass keine Daten vorliegen'],0,'0 = alle haben gleich viel, 1 = eine Person hat alles.'],
  ['Deutschland hat einen hohen Leistungsbilanzüberschuss. Das heißt:',['Deutschland nimmt aus dem Ausland mehr ein, als es ausgibt, und baut Forderungen gegenüber dem Ausland auf','Der Staatshaushalt hat einen Überschuss','Deutschland importiert mehr als es exportiert','Die Bundesbank hat mehr Gold gekauft'],0,'Leistungsbilanz ≠ Staatshaushalt. Der Überschuss bedeutet Kapitalexport: Deutschland wird Gläubiger des Auslands.'],
  ['Die Phillips-Kurve beschreibt einen Zielkonflikt zwischen …',['Preisniveaustabilität und hohem Beschäftigungsstand','Wachstum und Umweltschutz','Verteilung und Außenwirtschaft','Wachstum und Beschäftigung'],0,'Weniger Arbeitslosigkeit gehe mit höherer Inflation einher – und umgekehrt.'],
  ['Was ist Stagflation?',['Hohe Inflation bei gleichzeitig schwachem Wachstum und steigender Arbeitslosigkeit','Stillstand der Preise','Eine besonders stabile Wachstumsphase','Sinkende Preise im Boom'],0,'Stagnation + Inflation, typisch nach Angebotsschocks wie der Ölkrise 1973 oder der Energiekrise 2022.'],
  ['Ein Dachdecker ist im Januar wegen Frost ohne Arbeit. Das ist …',['saisonale Arbeitslosigkeit','strukturelle Arbeitslosigkeit','konjunkturelle Arbeitslosigkeit','friktionelle Arbeitslosigkeit'],0,'Sie hängt von der Jahreszeit ab.'],
  ['Welche Maßnahme erzeugt typischerweise einen Konflikt zwischen Umweltschutz und Preisniveaustabilität?',['Ein höherer CO₂-Preis','Mehr Weiterbildung','Eine Leitzinserhöhung','Eine Vermögensteuer'],0,'Der CO₂-Preis verteuert fossile Energie und damit viele Güter.'],
  ['Das nominale BIP wächst um 4 %, die Preise um 2,5 %. Das reale Wachstum beträgt ungefähr …',['1,5 %','6,5 %','4 %','−1,5 %'],0,'Real ≈ nominal − Preissteigerung.'],
  ['Wer ist in Deutschland für die Geldpolitik zuständig?',['Die Europäische Zentralbank','Das Bundesfinanzministerium','Der Sachverständigenrat','Der Bundestag'],0,'Seit 1999 bestimmt die unabhängige EZB die Geldpolitik im Euroraum; die Bundesbank ist Teil des Eurosystems.'],
  ['Welche Rechtsgrundlage stützt das Ziel „Schutz der natürlichen Lebensgrundlagen“?',['Art. 20a GG','§ 1 StabG','Art. 127 AEUV','Art. 9 GG'],0,'Seit 1994 Staatsziel im Grundgesetz; konkretisiert durch das Klimaschutzgesetz.']
];
tool({id:'quiz',ch:6,goals:ORDER,title:'Abi-Check',sub:'14 Fragen zum magischen Sechseck mit Erklärungen',
html(){return `<p class="task"><b>Auftrag:</b> Beantwortet die Fragen allein oder als Team. Nach jeder Antwort gibt es eine Erklärung.</p><div class="panel" id="qz"></div>
${teacher(['Als Quiz-Battle mit dem Beamer: Teams stimmen per Handzeichen ab, dann Auflösung.','Die Reihenfolge der Antworten wird bei jedem Start gemischt.'])}`},
init(root){
  let i=0,pts=0,order=[];
  const start=()=>{i=0;pts=0;order=QUIZ.map((q,k)=>({q,perm:[0,1,2,3].sort(()=>Math.random()-.5)}));show()};
  const show=()=>{
    const box=$('#qz',root);
    if(i>=order.length){box.innerHTML=`<h3>Geschafft: ${pts} von ${order.length} Punkten</h3><p>${pts>=12?'Abi-reif!':pts>=8?'Solide Basis – schaut euch die Werkstätten zu den falschen Antworten noch einmal an.':'Geht noch einmal durch Kapitel 1 bis 3.'}</p><button class="btn primary" type="button" id="qz-r" style="margin-top:10px">Noch einmal</button>`;$('#qz-r',box).addEventListener('click',start);return}
    const {q,perm}=order[i];
    box.innerHTML=`<p class="eyebrow">Frage ${i+1} von ${order.length} · ${pts} Punkte</p><h3 style="margin:6px 0 10px">${q[0]}</h3><div class="choice" style="flex-direction:column">${perm.map(p=>`<button type="button" data-p="${p}" style="text-align:left">${q[1][p]}</button>`).join('')}</div><div id="qz-fb" style="margin-top:10px"></div>`;
    $$('[data-p]',box).forEach(b=>b.addEventListener('click',()=>{
      if(box.dataset.done==='1')return;box.dataset.done='1';const r=+b.dataset.p===q[2];if(r)pts++;
      $$('[data-p]',box).forEach(x=>{if(+x.dataset.p===q[2])x.classList.add('right');else if(x===b)x.classList.add('wrong')});
      $('#qz-fb',box).innerHTML=`<div class="fb ${r?'ok':'bad'}"><b>${r?'Richtig.':'Nicht ganz.'}</b> ${q[3]}</div><button class="btn primary" type="button" id="qz-n" style="margin-top:8px">Weiter</button>`;
      $('#qz-n',box).addEventListener('click',()=>{box.dataset.done='0';i++;show()})}));
  };
  start();
}});

/* ================= Planspiel Sechseck-Leben ================= */
const OPTC={A:'var(--md-o-A);--on-oc:var(--md-on-o-A)',B:'var(--md-o-B);--on-oc:var(--md-on-o-B)',C:'var(--md-o-C);--on-oc:var(--md-on-o-C)'};
const FIGC=['var(--g-P)','var(--g-B)','var(--g-W)','var(--g-A)','var(--g-U)','var(--g-V)','var(--accent)','var(--ok)'];
const ZINS0=2.25, ML0=13.90;
const FIG=[
 {id:'mia',n:'Mia',a:17,ort:'Apolda',job:'Azubi Feinoptikerin bei einem Optikhersteller in Jena, pendelt mit dem Deutschlandticket',sec:'optik',netto:880,stadt:false,pers:1,tax:false,
  li:{miete:150,energie:0,mobil:63,essen:180},base:150,spar:1200,kredit:0,
  vibe:'Matcha-Fan, spart auf den Führerschein und antwortet auf alles mit „Six Seven“.',ziel:'Führerschein (rund 3.500 €)'},
 {id:'jonas',n:'Jonas',a:20,ort:'Jena',job:'Physikstudent im WG-Zimmer, Minijob in einer Bar (43 Stunden im Monat zum Mindestlohn) plus BAföG',sec:'mini',netto:1118,mini:43,stadt:true,pers:1,tax:false,
  li:{miete:430,energie:35,mobil:0,essen:260},base:60,spar:400,kredit:0,
  vibe:'Macht jede Buldak-Challenge mit, wartet seit Jahren auf GTA 6 und kommentiert Mietanzeigen mit „Ragebait“.',ziel:'Eine eigene Wohnung ohne WG'},
 {id:'sabine',n:'Sabine',a:46,ort:'Bad Sulza (Weimarer Land)',job:'Pflegefachkraft im Krankenhaus Erfurt, pendelt täglich 40 km mit dem Auto, alleinerziehend mit einem Sohn (16)',sec:'pflege',netto:2450,stadt:false,pers:2,tax:true,
  li:{miete:620,energie:170,mobil:280,essen:520},base:200,spar:5000,kredit:0,
  vibe:'Ihr Sohn erklärt ihr die Jugendwörter – sie sagt trotzdem „Digga“ an den falschen Stellen.',ziel:'Ein neues Auto, bevor das alte schlappmacht'},
 {id:'tobias',n:'Tobias',a:41,ort:'Apolda',job:'Bäckermeister mit eigener Bäckerei und 6 Beschäftigten, Kredit für einen neuen Ofen',sec:'baecker',selbst:true,netto:3100,stadt:false,pers:3,tax:true,
  betr:{energie:1500,lohn:9000,rohstoff:2500,umsatz:30000},li:{miete:900,energie:200,mobil:180,essen:750},base:250,spar:8000,kredit:90000,
  vibe:'Seine Dubai-Schoko-Croissants gingen auf TikTok viral – die Schlange reichte bis zum Markt.',ziel:'Eine zweite Filiale in Weimar'},
 {id:'daniel',n:'Daniel',a:52,ort:'Eisenach',job:'Schichtarbeiter bei einem Autozulieferer, der Getriebeteile für Verbrenner herstellt',sec:'auto',netto:2450,stadt:false,pers:2,tax:true,
  li:{miete:560,energie:150,mobil:140,essen:480},base:220,spar:14000,kredit:0,
  vibe:'Schaut abends Tuning-Videos und fragt sich, ob E-Autos seinen Job überflüssig machen.',ziel:'Sicher bis zur Rente arbeiten'},
 {id:'gisela',n:'Gisela',a:72,ort:'Weimar',job:'Rentnerin, früher Verkäuferin; heizt mit Gas, das Ersparte liegt auf dem Sparbuch',sec:'rente',netto:1380,stadt:true,pers:1,tax:false,
  li:{miete:520,energie:140,mobil:40,essen:330},base:80,spar:22000,kredit:0,
  vibe:'Fand die Dubai-Schokolade „peak“ – das Wort hat sie von ihrer Enkelin.',ziel:'Der Enkelin den Führerschein mitfinanzieren'},
 {id:'lea',n:'Lea',a:29,ort:'Jena',job:'Gründerin eines KI-Start-ups für Bilderkennung in der Optikindustrie, Gründerkredit',sec:'tech',netto:3000,stadt:true,pers:1,tax:true,
  li:{miete:950,energie:70,mobil:30,essen:420},base:400,spar:6000,kredit:40000,
  vibe:'Postet „Day in my life als Gründerin“ – die Hälfte der Kommentare ist Ragebait.',ziel:'Zehn neue Leute einstellen'},
 {id:'paul',n:'Paul',a:58,ort:'Sömmerda (Thüringer Becken)',job:'Landwirt mit Weizen, Raps und Zuckerrüben auf 300 Hektar, Kredit für Maschinen',sec:'agrar',selbst:true,netto:2400,stadt:false,pers:2,tax:true,
  betr:{energie:300,diesel:1500,lohn:0,rohstoff:0,umsatz:14000},li:{miete:0,energie:220,mobil:150,essen:520},base:300,spar:20000,kredit:150000,
  vibe:'Sein Traktor-Video mit „Gute Käse“-Sound hat 400.000 Aufrufe.',ziel:'Den Hof an die Tochter übergeben'}
];
const ROUNDS=[
 {y:'Herbst 2026',real:true,t:'Energiepreisschock',
  post:{h:'jena.foodie',txt:'Döner in Jena jetzt 8 € und der Matcha 5,50 😭 Ich bin kurz vorm Crashout. #inflation #jena',likes:'12,4 Tsd.'},
  txt:'Der Krieg im Iran treibt die Öl- und Gaspreise. Energie ist 15 % teurer als vor einem Jahr, die Inflation steigt auf 3,3 %. Die EZB erhöht den Leitzins um 0,25 Prozentpunkte.',
  ops:{E:1.15,S:1.12,L:1.03,zins:0.25,umsatz:{baecker:0.985},hex:{P:-10,W:-4,V:-3}},
  fig:{mia:'Das Deutschlandticket kostet gleich viel – aber Snacks und Matcha werden teurer.',jonas:'Die WG-Nebenkosten steigen, in der Bar bestellen die Gäste weniger.',sabine:'Tanken für die tägliche Pendelstrecke tut jetzt richtig weh.',tobias:'Der Ofen frisst Gas: Die Energierechnung der Bäckerei explodiert.',daniel:'Heizen und Tanken werden teurer, im Werk wird über Sparprogramme geredet.',gisela:'Die Gasrechnung steigt – dafür bringt das Sparbuch etwas mehr Zinsen.',lea:'Höhere Zinsen machen ihren Gründerkredit teurer.',paul:'Diesel für die Traktoren und Strom für die Trocknung kosten deutlich mehr.'},
  q:'Wie soll der Bundestag auf den Energiepreisschock reagieren?',
  opts:[
   {k:'A',t:'Energiepreisbremse',d:'Der Staat deckelt Strom- und Gaspreise für ein Jahr und bezahlt die Differenz mit Krediten.',ops:{tmp:{E:0.9},hex:{P:6,W:3,V:3,U:-6},debt:2}},
   {k:'B',t:'Klimageld auszahlen',d:'Alle bekommen dauerhaft 150 € pro Kopf und Jahr (12,50 € im Monat) aus den CO₂-Einnahmen. Die Preise bleiben, wie sie sind.',ops:{T:12.5,hex:{V:5,U:2},debt:1}},
   {k:'C',t:'Nicht eingreifen',d:'Keine Hilfen, die Schuldenbremse wird eingehalten. Hohe Preise sollen zum Energiesparen bewegen.',ops:{hex:{P:2,W:-3,V:-4,U:3},debt:-1}}],
  choice:{q:'GTA 6 erscheint am 19. November. Holst du es dir (oder verschenkst du es)?',opts:[
   {t:'Day One kaufen (rund 80 €)',cost:80,mood:8,l:'Konsum jetzt macht jetzt Spaß – das Geld fehlt aber beim Sparziel.'},
   {t:'Warten, bis es im Angebot ist',cost:0,mood:-2,l:'Neue Spiele werden oft nach einigen Monaten günstiger: Wer warten kann, spart.'},
   {t:'Gar nicht – das Geld kommt aufs Sparkonto',cost:0,mood:-4,l:'Opportunitätskosten: Jeder Euro kann nur einmal ausgegeben werden.'}]}},
 {y:'2027',real:false,t:'Zollkrieg und KI-Boom',
  post:{h:'thueringen.wirtschaft',txt:'Eisenacher Zulieferer meldet Kurzarbeit an. Gleichzeitig sucht Jenas Optikbranche 300 Fachkräfte. Peak und Crashout am selben Tag.',likes:'3.870'},
  txt:'Die USA erheben 25 % Zoll auf Autos aus der EU – Thüringer Zulieferer verlieren Aufträge. Gleichzeitig boomt die KI: Chipfabriken brauchen Präzisionsoptik aus Jena, KI-Firmen suchen Leute. Der Mindestlohn steigt wie beschlossen auf 14,60 €.',
  ops:{job:{auto:1},lohn:{optik:1.04,tech:1.08},ML:14.60/13.90,umsatz:{baecker:0.99},hex:{B:-6,W:-2,A:4}},
  fig:{mia:'Ihr Betrieb hat volle Auftragsbücher: Die Ausbildungsvergütung steigt um 4 %.',jonas:'Sein Stundenlohn in der Bar steigt mit dem Mindestlohn auf 14,60 €.',sabine:'In der Pflege ändert sich wenig.',tobias:'In Apolda wird weniger gekauft, weil viele Zulieferer-Familien sparen. Die Mindestlohnerhöhung kostet ihn zusätzlich.',daniel:'Sein Werk meldet Kurzarbeit an – wie geht es weiter?',gisela:'Ihr Nachbar arbeitet beim Zulieferer und hat Angst um seinen Job.',lea:'Investoren melden sich, die Gehälter in der KI-Branche steigen.',paul:'Kaum betroffen – Weizen wird weltweit gehandelt.'},
  q:'Wie reagiert die Politik auf die US-Zölle?',
  opts:[
   {k:'A',t:'Kurzarbeit verlängern + Weiterbildung',d:'Das Kurzarbeitergeld läuft weiter, Beschäftigte werden für E-Mobilität und KI umgeschult.',ops:{job:{auto:3},hex:{B:6,V:2,W:1},debt:1}},
   {k:'B',t:'Industriestrompreis',d:'Der Staat verbilligt Strom für die Industrie, damit die Werke wettbewerbsfähig bleiben.',ops:{job:{auto:0},hex:{B:4,W:4,U:-5,A:-2},debt:2}},
   {k:'C',t:'Gegenzölle auf US-Waren',d:'Die EU belegt US-Produkte wie Jeans, Motorräder und Whiskey mit Zöllen. Die USA reagieren verärgert.',ops:{job:{auto:2},L:1.02,hex:{P:-4,W:-3,B:-2}}}],
  choice:{q:'Matcha ist weltweit knapp: Die Nachfrage wächst durch TikTok schneller als Japans Ernte. Ein Matcha-Latte kostet jetzt 5,50 €.',opts:[
   {t:'Dreimal pro Woche gönnen (rund 860 € im Jahr)',cost:860,mood:6,l:'Knappes Angebot plus hohe Nachfrage = hoher Preis. Wer trotzdem kauft, zahlt die Knappheit mit.'},
   {t:'Matcha-Pulver kaufen und selbst machen (rund 180 €)',cost:180,mood:3,l:'Substitution: Wer auf eine günstigere Alternative ausweicht, spart.'},
   {t:'Umsteigen auf Leitungswasser',cost:0,mood:-3,l:'Verzicht spart Geld – aber Konsum ist auch Lebensqualität. Abwägen gehört dazu.'}]}},
 {y:'2028',real:false,t:'Wohnungsnot und Fachkräftemangel',
  post:{h:'wg.gesucht.jena',txt:'22 m² WG-Zimmer, 620 € warm, Besichtigung mit 40 Leuten. Ragebait oder Realität? 🙃',likes:'28,1 Tsd.'},
  txt:'Die Inflation ist zurück bei 2 %, die EZB senkt den Leitzins um 0,5 Prozentpunkte. Dafür steigen die Mieten in Jena, Weimar und Erfurt um 8 %. In der Pflege fehlen Tausende Fachkräfte – die Löhne dort steigen um 5 %.',
  ops:{zins:-0.5,Mc:1.08,Ml:1.02,lohn:{pflege:1.05},umsatz:{baecker:1.02},hex:{P:6,W:2,V:-4}},
  fig:{mia:'Sie wohnt noch bei den Eltern – die Mietexplosion trifft sie nicht.',jonas:'Die WG-Miete steigt um 8 %.',sabine:'Endlich mehr Lohn: Pflegekräfte werden dringend gesucht.',tobias:'Sinkende Zinsen helfen beim Ofen-Kredit, die Kundschaft kauft wieder mehr.',daniel:'Je nach Beschluss im letzten Jahr: Umschulung geschafft, Job gerettet – oder weiter auf Jobsuche.',gisela:'Die Miete steigt, und das Sparbuch bringt wieder weniger Zinsen.',lea:'Kredite werden günstiger, aber ihre neuen Leute finden in Jena kaum Wohnungen.',paul:'Niedrigere Zinsen entlasten den Maschinenkredit.'},
  q:'Was tut der Bundestag für ein bezahlbares Leben?',
  opts:[
   {k:'A',t:'Six-Seven-Plan: Mindestlohn +6,7 %',d:'Der Mindestlohn steigt um 6,7 % von 14,60 € auf 15,58 €.',ops:{ML:1.067,L:1.01,hex:{V:6,P:-2,B:-2}}},
   {k:'B',t:'Bauoffensive + Mietpreisbremse',d:'Der Staat fördert 100.000 Sozialwohnungen und begrenzt Mieterhöhungen in Städten strenger.',ops:{Mc:0.96,hex:{V:3,W:3,U:-2},debt:2}},
   {k:'C',t:'Einkommensteuer senken',d:'Alle Steuerzahler zahlen weniger Einkommensteuer, das Netto steigt um rund 3 %.',ops:{St:3,hex:{W:3,B:2,V:-3,P:-2},debt:2}}],
  choice:{q:'Sommer 2028: Alle aus deinem Umfeld fahren auf ein Festival. Und du?',opts:[
   {t:'Festivalticket plus Anreise (rund 350 €)',cost:350,mood:10,l:'Erlebnisse sind für viele das Wichtigste, wofür sie Geld ausgeben – sie haben aber ihren Preis.'},
   {t:'Kurztrip mit dem Deutschlandticket (rund 120 €)',cost:120,mood:5,l:'Mit einem Pauschalticket kostet jede zusätzliche Fahrt nichts: Grenzkosten null.'},
   {t:'Balkonien – Sommer zu Hause',cost:0,mood:-3,l:'Sparen schafft Sicherheit für später. Das ist eine Abwägung, kein Richtig oder Falsch.'}]}},
 {y:'2029',real:false,t:'Dürresommer und CO₂-Preis',
  post:{h:'paul.vom.acker',txt:'Seit April kaum Regen. Der Weizen vertrocknet, der Diesel wird teurer. Und alle so: Warum kostet das Brötchen jetzt 70 Cent? 🤡',likes:'41,7 Tsd.'},
  txt:'Nach einem Dürresommer fällt die Ernte um 20 % geringer aus, Lebensmittel werden 6 % teurer. Seit 2028 gilt der EU-Emissionshandel auch für Heizen und Tanken – der CO₂-Preis steigt deutlich: Sprit +8 %, Heizen +6 %.',
  ops:{L:1.06,S:1.08,E:1.06,umsatz:{agrar:0.8},hex:{P:-6,W:-3,U:-2}},
  fig:{mia:'Snacks und Brötchen werden teurer.',jonas:'Der Wocheneinkauf wird teurer, Mensa-Preise steigen.',sabine:'Sprit wird wieder teurer – die Pendelstrecke frisst ihr Budget.',tobias:'Mehl wird teurer, und er muss die Brötchenpreise erhöhen.',daniel:'Heizen und Tanken werden teurer.',gisela:'Lebensmittel und Gas belasten ihre kleine Rente.',lea:'Merkt die höheren Preise kaum.',paul:'Die Ernte ist eingebrochen, Diesel kostet mehr: das schwerste Jahr seit Langem.'},
  q:'Wie reagiert die Politik auf Dürre und CO₂-Preis?',
  opts:[
   {k:'A',t:'Klimageld verdoppeln',d:'Die CO₂-Einnahmen gehen als Klimageld zurück: zusätzlich 300 € pro Kopf und Jahr (25 € im Monat).',ops:{T:25,hex:{V:5,U:3}}},
   {k:'B',t:'Tankrabatt + Agrardiesel-Hilfe',d:'Steuern auf Benzin und Diesel sinken für ein Jahr, Landwirte bekommen Dieselhilfen.',ops:{tmp:{S:0.92},umsatz:{agrar:1.05},hex:{P:3,U:-6,V:-1},debt:2}},
   {k:'C',t:'Investitionsprogramm Klimaanpassung',d:'Kreditfinanziert: Bewässerung, Waldumbau, Schiene, Hitzeschutz – und Dürrehilfen für Bauern.',ops:{umsatz:{agrar:1.12},hex:{U:5,W:3,B:3,P:-2},debt:3}}],
  choice:{q:'Ein Finfluencer auf TikTok verspricht mit dem Memecoin „$SIXSEVEN“ 670 % Gewinn. Was machst du?',opts:[
   {t:'500 € in $SIXSEVEN stecken',cost:500,mood:5,risk:true,l:'Hohe versprochene Rendite = hohes Risiko. Die meisten Memecoins verlieren fast alles – manche Posts sind schlicht Betrug.'},
   {t:'ETF-Sparplan: 50 € im Monat',cost:0,mood:2,etf:true,l:'Breit gestreut und langfristig: weniger spektakulär, aber deutlich geringeres Risiko.'},
   {t:'Nichts – Geld bleibt auf dem Konto',cost:0,mood:0,l:'Kein Risiko, aber die Inflation knabbert am Ersparten.'}]}}
];
/* --- Figuren: Ziele, Kürzungen, Aussehen --- */
const FIGX={
 mia:{goal:{t:'Führerschein und erstes gebrauchtes Auto',amt:9000},cut:0,look:{bg:'#FFE3EC',skin:'#F3C9A8',hair:'pony',hc:'#6B3E26',top:'#74B816',acc:'matcha'}},
 jonas:{goal:{t:'Kaution und Einrichtung für eine eigene Wohnung',amt:3500},cut:40,look:{bg:'#E7F5FF',skin:'#E0AC88',hair:'messy',hc:'#2B1D14',top:'#495057',acc:'phones'}},
 sabine:{goal:{t:'Ein gebrauchtes Auto für die Pendelstrecke',amt:14500},cut:0,look:{bg:'#E6FCF5',skin:'#F1C7A5',hair:'bob',hc:'#A0522D',top:'#12B886',acc:'stetho'}},
 tobias:{goal:{t:'Die Bäckerei ohne Pleite durch die Krise bringen: mindestens 2.000 € Rücklage',amt:2000},cut:80,look:{bg:'#FFF4E6',skin:'#E8B48F',hair:'baker',hc:'#5C4033',top:'#F08C00',acc:'apron'}},
 daniel:{goal:{t:'Eine Rücklage für die Rente aufbauen',amt:20000},cut:0,look:{bg:'#F1F3F5',skin:'#D9A07A',hair:'short',hc:'#868E96',top:'#F76707',acc:'vest'}},
 gisela:{goal:{t:'23.300 € Rücklage – inklusive Geld für den Führerschein der Enkelin',amt:23300},cut:0,look:{bg:'#F3F0FF',skin:'#F3D2BA',hair:'bun',hc:'#CED4DA',top:'#9775FA',acc:'glasses'}},
 lea:{goal:{t:'Genug Kapital, um zehn neue Leute einzustellen',amt:30000},cut:120,look:{bg:'#FFF9DB',skin:'#8D5A3B',hair:'curly',hc:'#1E1E1E',top:'#E64980',acc:'laptop'}},
 paul:{goal:{t:'Den Hof mit 18.000 € Rücklage an die Tochter übergeben',amt:18000},cut:200,look:{bg:'#EBFBEE',skin:'#E3A87F',hair:'cap',hc:'#2F9E44',top:'#C92A2A',acc:'check'}}
};
FIG.forEach(f=>Object.assign(f,FIGX[f.id]));
FIG.find(f=>f.id==='mia').li.mobil=0; // Deutschlandticket: fester Preis

function portraitSVG(f){
  const L=f.look,h=L.hc,sk=L.skin;let back='',front='',acc='';
  switch(L.hair){
    case 'pony':back=`<path d="M52 24 Q68 30 60 50" stroke="${h}" stroke-width="7" fill="none" stroke-linecap="round"/>`;front=`<path d="M24.5 34 Q24 17 40 17 Q56 17 55.5 34 Q51 24 40 24 Q29 24 24.5 34Z" fill="${h}"/>`;break;
    case 'messy':front=`<path d="M24.5 33 Q23 19 34 17 L37 12 L41 17 L46 13 L47 18 Q57 20 55.5 33 Q52 25 45 25 L42 22 L38 26 L34 23 Q27 25 24.5 33Z" fill="${h}"/>`;break;
    case 'bob':back=`<path d="M23 36 Q22 16 40 16 Q58 16 57 36 L58 50 Q51 50 50 44 L30 44 Q29 50 22 50Z" fill="${h}"/>`;front=`<path d="M25 32 Q27 18 40 18 Q53 18 55 32 Q46 26 34 27 Q29 28 25 32Z" fill="${h}"/>`;break;
    case 'baker':front=`<path d="M26 26 Q22 12 31 12 Q33 4 40 6 Q47 4 49 12 Q58 12 54 26Z" fill="#FFFFFF" stroke="#CED4DA" stroke-width="1.5"/><rect x="26" y="24" width="28" height="5" rx="2" fill="#F1F3F5" stroke="#CED4DA"/>`;break;
    case 'short':front=`<path d="M25 31 Q25 18 40 18 Q55 18 55 31 Q50 23 40 23 Q30 23 25 31Z" fill="${h}"/>`;break;
    case 'bun':back=`<circle cx="40" cy="15" r="7" fill="${h}"/>`;front=`<path d="M24.5 33 Q24 18 40 18 Q56 18 55.5 33 Q52 23 40 23 Q28 23 24.5 33Z" fill="${h}"/>`;break;
    case 'curly':back=[[26,26],[31,18],[40,14],[49,18],[54,26],[56,36],[24,36],[25,46],[55,46]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="8" fill="${h}"/>`).join('');front=`<path d="M26 30 Q30 20 40 20 Q50 20 54 30 Q47 25 40 26 Q33 25 26 30Z" fill="${h}"/>`;break;
    case 'cap':front=`<path d="M24 31 Q24 16 40 16 Q56 16 56 31Z" fill="${h}"/><path d="M50 29 L67 31 Q66 34 52 33Z" fill="${h}"/>`;break;
  }
  switch(L.acc){
    case 'matcha':acc=`<rect x="57" y="59" width="11" height="15" rx="2" fill="#94D82D"/><rect x="56" y="56" width="13" height="4" rx="1.5" fill="#F8F9FA"/><rect x="61" y="50" width="2" height="7" fill="#F8F9FA"/>`;break;
    case 'phones':acc=`<path d="M27 52 Q40 62 53 52" stroke="#212529" stroke-width="3.5" fill="none"/><circle cx="27" cy="51" r="4" fill="#212529"/><circle cx="53" cy="51" r="4" fill="#212529"/>`;break;
    case 'stetho':acc=`<path d="M31 56 Q32 70 40 70 Q48 70 49 56" stroke="#E9ECEF" stroke-width="2.2" fill="none"/><circle cx="40" cy="71" r="3" fill="#ADB5BD"/>`;break;
    case 'apron':acc=`<path d="M31 60 L49 60 L52 80 L28 80Z" fill="#FFFFFF" opacity=".92"/>`;break;
    case 'vest':acc=`<rect x="13" y="66" width="54" height="4" fill="#F8F9FA"/><rect x="11" y="73" width="58" height="3" fill="#F8F9FA"/>`;break;
    case 'glasses':acc=`<circle cx="34.5" cy="35" r="4.2" stroke="#495057" stroke-width="1.4" fill="none"/><circle cx="45.5" cy="35" r="4.2" stroke="#495057" stroke-width="1.4" fill="none"/><line x1="38.7" y1="35" x2="41.3" y2="35" stroke="#495057" stroke-width="1.4"/>${[31,35.5,40,44.5,49].map(x=>`<circle cx="${x}" cy="${58+Math.abs(x-40)/4}" r="1.7" fill="#F8F9FA"/>`).join('')}`;break;
    case 'laptop':acc=`<rect x="30" y="31.5" width="9" height="7" rx="2" stroke="#F1F3F5" stroke-width="1.4" fill="none"/><rect x="41" y="31.5" width="9" height="7" rx="2" stroke="#F1F3F5" stroke-width="1.4" fill="none"/><rect x="20" y="66" width="40" height="14" rx="2" fill="#CED4DA"/><circle cx="40" cy="73" r="2" fill="#ADB5BD"/>`;break;
    case 'check':acc=`<g stroke="#FFFFFF" stroke-opacity=".45" stroke-width="2">${[24,32,40,48,56].map(x=>`<line x1="${x}" y1="59" x2="${x}" y2="80"/>`).join('')}<line x1="14" y1="67" x2="66" y2="67"/><line x1="12" y1="75" x2="68" y2="75"/></g>`;break;
  }
  return `<svg viewBox="0 0 80 80" aria-hidden="true"><rect width="80" height="80" rx="16" fill="${L.bg}"/>${back}<path d="M8 80 C10 60 24 54 40 54 C56 54 70 60 72 80 Z" fill="${L.top}"/><rect x="35" y="44" width="10" height="12" rx="4" fill="${sk}"/><circle cx="40" cy="34" r="15" fill="${sk}"/>${front}<circle cx="34.5" cy="35" r="1.8" fill="#212529"/><circle cx="45.5" cy="35" r="1.8" fill="#212529"/><path d="M35 41 Q40 45 45 41" stroke="#212529" stroke-width="1.6" fill="none" stroke-linecap="round"/>${acc}</svg>`;
}

/* --- Fotos (Unsplash-Lizenz) mit Infopunkten --- */
const PHOTOS=["img/szene-1-tankstelle.jpg", "img/szene-2-hafen.jpg", "img/szene-3-jena.jpg", "img/szene-4-duerre.jpg"];
const PHOTO_META=[{"alt": "Eine Person in roter Jacke tankt ein Auto an der Zapfsäule", "credit": "Foto: engin akyurt / Unsplash", "hs": [{"x": 33, "y": 52, "t": "Was steckt im Spritpreis?", "d": "Von jedem Liter Benzin geht ein großer Teil an den Staat: 65,45 Cent Energiesteuer, dazu der CO₂-Preis (2026 rund 13 bis 15 Cent) und 19 % Mehrwertsteuer auf alles. Der Rest deckt Rohöl, Raffinerie, Transport und die Marge der Tankstelle. Steigt der Ölpreis, steigt der Spritpreis – die Energiesteuer bleibt gleich."}, {"x": 72, "y": 29, "t": "Pendeln kostet", "d": "Wer wie Sabine täglich 40 km zur Arbeit fährt und zurück, kommt auf rund 1.700 km im Monat und tankt über 100 Liter. Jeder Cent mehr pro Liter kostet also über einen Euro im Monat. Seit 2026 gibt es ab dem ersten Kilometer 38 Cent Pendlerpauschale – das senkt die Steuer etwas."}, {"x": 8, "y": 63, "t": "Öl wird in Dollar bezahlt", "d": "Rohöl wird weltweit in US-Dollar gehandelt. Wird der Euro schwächer, zahlt Deutschland für dieselbe Menge Öl mehr – selbst wenn der Ölpreis in Dollar gleich bleibt. Das nennt man importierte Inflation."}]}, {"alt": "Großes Containerschiff der Reederei COSCO an den Kränen eines Containerterminals im Hamburger Hafen", "credit": "Foto: Jacob Meissner / Unsplash", "hs": [{"x": 55, "y": 52, "t": "Exportland Deutschland", "d": "Deutschland hat 2024 Waren für gut 1,5 Billionen Euro exportiert. Wichtigstes Abnehmerland waren die USA. US-Zölle treffen deshalb vor allem Autos, Maschinen und Chemie – und damit auch Zulieferer in Thüringen."}, {"x": 28, "y": 76, "t": "Ein Schiff aus China", "d": "Das Schiff gehört der chinesischen Reederei COSCO. Aus China importiert Deutschland mehr als aus jedem anderen Land: Smartphones, Laptops, Solarmodule, Batterien. 2023 stieg COSCO mit knapp 25 % bei einem Hamburger Containerterminal ein – das war politisch heftig umstritten."}, {"x": 75, "y": 21, "t": "Wer zahlt den Zoll?", "d": "Ein Zoll ist eine Steuer auf Importe. Zahlen muss ihn das importierende Unternehmen im Zielland, das die Kosten meist an die Kundschaft weitergibt. US-Zölle auf deutsche Autos zahlen also zuerst US-Händler – deutsche Hersteller verlieren aber Kunden, weil ihre Autos teurer werden."}]}, {"alt": "Blick über das Saaletal auf Jena mit dem JenTower, im Vordergrund Wald, Wiesen und ein Ortsteil", "credit": "Foto: Lukas D. / Unsplash", "hs": [{"x": 36, "y": 30, "t": "Der JenTower", "d": "Das rund 145 Meter hohe Hochhaus wurde Anfang der 1970er Jahre als Forschungsgebäude für den VEB Carl Zeiss Jena gebaut. Heute steht Jena für Optik, Photonik und Software – diese Branchen ziehen Fachkräfte aus aller Welt an, und die suchen Wohnungen."}, {"x": 72, "y": 82, "t": "Knapper Wohnraum", "d": "In Universitätsstädten wie Jena konkurrieren Studierende, Fachkräfte und Familien um dieselben Wohnungen. Das enge Saaletal lässt wenig Platz für neue Baugebiete. Ist das Angebot knapp und steigt die Nachfrage, steigen die Mieten."}, {"x": 86, "y": 30, "t": "Bauen oder schützen?", "d": "Neue Wohnungen brauchen Fläche. Die Hänge rund um Jena sind aber Natur- und Erholungsgebiete, bekannt für seltene Orchideen. Deutschland will den Flächenverbrauch bis 2030 auf unter 30 Hektar pro Tag senken. Hier treffen bezahlbares Wohnen und Umweltschutz direkt aufeinander."}]}, {"alt": "Abgeerntetes, ausgetrocknetes Feld mit tiefen Rissen im Boden und Stoppeln", "credit": "Foto: Md. Hasanuzzaman Himel / Unsplash", "hs": [{"x": 68, "y": 43, "t": "Wenn der Boden reißt", "d": "Im Dürresommer 2018 fiel die Getreideernte in Deutschland um rund 16 % geringer aus als im Durchschnitt der Vorjahre. Bund und Länder halfen betroffenen Betrieben mit bis zu 340 Millionen Euro. Das Thüringer Becken gehört zu den trockensten Regionen Deutschlands."}, {"x": 7, "y": 56, "t": "Weniger Ernte, höhere Preise?", "d": "Wird weltweit weniger Getreide geerntet, steigt der Preis. Einem Bauern in einer Dürreregion hilft das kaum, denn er hat wenig zu verkaufen. Für Bäckereien wie die von Tobias steigen dagegen die Mehlkosten."}, {"x": 29, "y": 24, "t": "Anpassung an den Klimawandel", "d": "Trockenresistente Sorten, Bewässerung und humusreiche Böden, die mehr Wasser speichern, helfen gegen Dürre. Das kostet Geld – genau darum geht es beim Investitionsprogramm Klimaanpassung."}]}];
const GOAL_IMG={"P": {"src": "img/ziel-P.jpg", "alt": "Supermarktregal mit gelben Preisschildern", "credit": "Yosuke Ota"}, "B": {"src": "img/ziel-B.jpg", "alt": "Beschäftigte an einer Montagelinie in einer Fabrikhalle", "credit": "Remy Gieling"}, "W": {"src": "img/ziel-W.jpg", "alt": "Baukräne vor Abendhimmel", "credit": "Artem Labunsky"}, "A": {"src": "img/ziel-A.jpg", "alt": "Gestapelte Container von Hapag-Lloyd im Hamburger Hafen", "credit": "Wolfgang Weiser"}, "U": {"src": "img/ziel-U.jpg", "alt": "Windräder über einem Getreidefeld bei Sonnenuntergang", "credit": "Karsten Würth"}, "V": {"src": "img/ziel-V.jpg", "alt": "Münzstapel, die von links nach rechts immer höher werden", "credit": "Marcel Strauß"}};
function photoHTML(r){const M=PHOTO_META[r];return `<figure class="photo" data-r="${r}"><img src="${PHOTOS[r]}" alt="${esc(M.alt)}">${M.hs.map((h,i)=>`<button class="hotspot" type="button" data-h="${i}" style="left:${h.x}%;top:${h.y}%" aria-label="Infopunkt: ${esc(h.t)}" aria-expanded="false"><span class="ms">add</span></button>`).join('')}<figcaption>${esc(M.credit)}</figcaption></figure><span class="hs-progress"><span class="ms sm">touch_app</span><span data-hsp></span></span><div class="hs-info" data-hsi hidden></div>`}
function bindPhoto(root){$$('.photo',root).forEach(fig=>{
  const r=+fig.dataset.r,M=PHOTO_META[r],box=fig.parentElement;const seen=new Set(store('ms6-hs-'+r)||[]);
  const info=$('[data-hsi]',box),prog=$('[data-hsp]',box);
  const upd=()=>{prog.textContent=seen.size<M.hs.length?`Tippe auf die Punkte im Foto: ${seen.size} von ${M.hs.length} entdeckt`:`Alle ${M.hs.length} Infopunkte entdeckt`;$$('.hotspot',fig).forEach(b=>{const i=+b.dataset.h;b.classList.toggle('seen',seen.has(i));$('.ms',b).textContent=seen.has(i)?'check':'add'})};
  $$('.hotspot',fig).forEach(b=>b.addEventListener('click',()=>{const i=+b.dataset.h,h=M.hs[i];seen.add(i);store('ms6-hs-'+r,[...seen]);
    $$('.hotspot',fig).forEach(x=>x.setAttribute('aria-expanded',String(x===b)));
    info.hidden=false;info.innerHTML=`<span class="ms">info</span><div><p class="title-s">${esc(h.t)}</p><p class="small" style="margin-top:4px">${esc(h.d)}</p></div><button class="icon-btn" type="button" aria-label="Infopunkt schließen"><span class="ms">close</span></button>`;
    $('button',info).addEventListener('click',()=>{info.hidden=true;b.setAttribute('aria-expanded','false');b.focus()});upd()}));
  upd()})}

/* --- Echte Vorbilder und Fachbegriff-Check je Maßnahme --- */
const OPTX={
 '0A':{real:'2023 galten in Deutschland Strom- und Gaspreisbremsen: Für 80 % des bisherigen Verbrauchs zahlten Haushalte höchstens 40 Cent je kWh Strom und 12 Cent je kWh Gas. Bezahlt wurde das mit Krediten aus dem bis zu 200 Milliarden Euro großen „Abwehrschirm“.',
  chk:{a:'Zielkonflikt: Preisniveau wird stabiler, der Umweltschutz leidet',d:['Zielharmonie: Preisniveau und Umweltschutz verbessern sich gemeinsam','Zielneutralität: Die Maßnahme wirkt nur auf das Preisniveau'],why:'Günstigere Energie senkt die gemessene Inflation, nimmt aber den Anreiz zum Energiesparen – mehr Verbrauch bedeutet mehr Emissionen. Dazu kommen neue Schulden.'}},
 '0B':{real:'Ein Klimageld wurde 2021 im Koalitionsvertrag vereinbart, aber nie ausgezahlt. Österreich zahlte von 2022 bis 2024 einen „Klimabonus“ an alle Einwohner, die Schweiz verteilt ihre CO₂-Abgabe seit 2008 über die Krankenkassenprämien an alle zurück.',
  chk:{a:'Zielharmonie: Verteilung und Umweltschutz verbessern sich gemeinsam',d:['Zielkonflikt: Die Verteilung wird gerechter, die Umwelt leidet','Zielkonflikt: Die Verteilung wird gerechter, die Preise steigen stark'],why:'Der CO₂-Preis bleibt als Sparanreiz bestehen. Weil alle denselben Betrag bekommen, gewinnen Haushalte mit kleinem Einkommen und geringem Verbrauch unterm Strich am meisten.'}},
 '0C':{real:'2022 sank der Gasverbrauch in Deutschland bei hohen Preisen deutlich – Haushalte und Industrie sparten. Trotzdem griffen fast alle EU-Staaten mit Hilfen ein, weil die Belastung für Haushalte mit wenig Geld sehr hoch war.',
  chk:{a:'Zielkonflikt: Der Umweltschutz profitiert, Verteilung und Wachstum leiden',d:['Zielharmonie: Alle Ziele profitieren, weil der Staat spart','Zielneutralität: Ohne Eingriff ändert sich am Sechseck nichts'],why:'Hohe Preise bringen Menschen zum Energiesparen, belasten aber Geringverdiener besonders und bremsen den Konsum. Auch „nichts tun“ ist eine Entscheidung mit Folgen.'}},
 '1A':{real:'In der Corona-Krise waren im April 2020 rund 6 Millionen Menschen in Kurzarbeit. Die Arbeitslosigkeit stieg dadurch deutlich weniger als in vielen anderen Ländern – das Instrument gilt international als deutsches Erfolgsmodell.',
  chk:{a:'Zielharmonie: Beschäftigung und Verteilung verbessern sich gemeinsam',d:['Zielkonflikt: Mehr Beschäftigung, aber ungerechtere Verteilung','Zielkonflikt: Mehr Beschäftigung, aber weniger Umweltschutz'],why:'Jobs bleiben erhalten und Einkommen brechen nicht weg – Arbeit ist die wichtigste Einkommensquelle. Die Weiterbildung bekämpft zugleich strukturelle Arbeitslosigkeit. Der Preis sind höhere Staatsausgaben.'}},
 '1B':{real:'Seit 2024 zahlt das produzierende Gewerbe bei der Stromsteuer nur noch den EU-Mindestsatz. Ein noch stärker verbilligter Industriestrompreis wurde jahrelang diskutiert – Kritiker warnen vor dauerhaften Subventionen.',
  chk:{a:'Zielkonflikt: Beschäftigung und Wachstum profitieren, Umwelt und Außenwirtschaft leiden',d:['Zielharmonie: Billiger Strom hilft allen sechs Zielen','Zielkonflikt: Mehr Beschäftigung, aber höhere Inflation'],why:'Billiger Strom sichert Industriejobs, senkt aber den Anreiz, Energie zu sparen. Und weil die Exporte steigen, wächst der ohnehin hohe Leistungsbilanzüberschuss.'}},
 '1C':{real:'2018 reagierte die EU auf US-Zölle auf Stahl mit Gegenzöllen auf Jeans, Bourbon-Whiskey und Motorräder. 2025 verzichtete die EU dagegen auf Vergeltung und akzeptierte in einem Abkommen US-Zölle von 15 % auf die meisten Waren.',
  chk:{a:'Kein Ziel gewinnt: Preisniveau, Wachstum und Beschäftigung verschlechtern sich zugleich',d:['Zielharmonie: Zölle schützen Jobs und senken die Preise','Zielkonflikt: Mehr Beschäftigung, aber höhere Preise'],why:'Zölle verteuern Importe, provozieren weitere Gegenmaßnahmen und kosten Exportjobs. Ökonomen sehen in Handelskriegen fast nur Verlierer.'}},
 '2A':{real:'Der Mindestlohn wurde 2015 mit 8,50 € eingeführt und 2022 per Gesetz auf 12 € angehoben. Die befürchteten massenhaften Jobverluste blieben aus, allerdings ging die Zahl der Minijobs zurück.',
  chk:{a:'Zielkonflikt: Die Verteilung wird gerechter, Preisniveau und Beschäftigung können leiden',d:['Zielharmonie: Verteilung und Beschäftigung verbessern sich gemeinsam','Zielneutralität: Ein höherer Mindestlohn betrifft nur die Verteilung'],why:'Geringverdiener gewinnen. Höhere Lohnkosten werden aber teils über Preise weitergegeben, und manche Betriebe stellen weniger ein – wie stark, ist in der Forschung umstritten.'}},
 '2B':{real:'Die Mietpreisbremse gilt seit 2015 in angespannten Wohnungsmärkten. Die Bundesregierung wollte ab 2022 jedes Jahr 400.000 neue Wohnungen – 2023 wurden aber nur rund 295.000 fertig.',
  chk:{a:'Zielkonflikt: Verteilung und Wachstum profitieren, der Umweltschutz leidet',d:['Zielharmonie: Bauen hilft Verteilung und Umwelt gleichermaßen','Zielneutralität: Wohnungsbau betrifft das Sechseck nicht'],why:'Mehr Wohnungen dämpfen die Mieten und bringen Aufträge für den Bau. Neubau verbraucht aber Fläche und Baustoffe wie Zement, dessen Herstellung viel CO₂ verursacht.'}},
 '2C':{real:'Mit dem Inflationsausgleichsgesetz hob der Bund 2023 und 2024 den Grundfreibetrag an und glich die „kalte Progression“ aus. Steuerzahler wurden um mehrere Milliarden Euro im Jahr entlastet.',
  chk:{a:'Zielkonflikt: Wachstum profitiert, die Verteilung wird ungleicher',d:['Zielharmonie: Wachstum und gerechte Verteilung verbessern sich gemeinsam','Zielneutralität: Steuersenkungen wirken nur auf die Staatskasse'],why:'Mehr Netto stärkt Konsum und Wachstum. Gutverdiener sparen in Euro aber am meisten, und wer keine Einkommensteuer zahlt (Rentner mit kleiner Rente, Studierende), bekommt nichts.'}},
 '3A':{real:'Die Schweiz zahlt ihre CO₂-Abgabe seit 2008 pro Kopf an die Bevölkerung zurück. Untersuchungen zeigen: Haushalte mit kleinem Einkommen bekommen dabei oft mehr zurück, als sie bezahlen.',
  chk:{a:'Zielharmonie: Verteilung und Umweltschutz verbessern sich gemeinsam',d:['Zielkonflikt: Die Verteilung wird gerechter, die Umwelt leidet','Zielneutralität: Klimageld wirkt nur auf die Verteilung'],why:'Der CO₂-Preis bleibt voll wirksam, die Einnahmen fließen gleichmäßig zurück. Wer sparsam lebt, gewinnt – das sind oft Haushalte mit wenig Geld.'}},
 '3B':{real:'Im Sommer 2022 gab es drei Monate lang einen Tankrabatt: Die Energiesteuer sank um rund 30 Cent je Liter Benzin und 14 Cent je Liter Diesel. Als 2024 die Agrardiesel-Hilfe gestrichen werden sollte, protestierten Landwirte bundesweit mit Traktoren.',
  chk:{a:'Zielkonflikt: Das Preisniveau wird stabiler, der Umweltschutz leidet',d:['Zielharmonie: Günstiger Sprit hilft Preisniveau und Umwelt','Zielneutralität: Der Tankrabatt wirkt nur auf Pendler'],why:'Billigeres Tanken senkt kurzfristig die Inflation, setzt aber ein klimaschädliches Signal. Am meisten profitieren Vielfahrer – und es kostet den Staat Milliarden.'}},
 '3C':{real:'2025 beschloss der Bundestag ein Sondervermögen von 500 Milliarden Euro für Infrastruktur, davon 100 Milliarden für den Klimaschutz. Dafür wurde das Grundgesetz geändert.',
  chk:{a:'Zielharmonie zwischen Umwelt, Wachstum und Beschäftigung – erkauft mit neuen Schulden',d:['Zielkonflikt: Mehr Umweltschutz, aber weniger Wachstum','Zielneutralität: Investitionen wirken erst in Jahrzehnten'],why:'Investitionen bringen Aufträge und Jobs und schützen vor Klimafolgen. Der Preis: Die zusätzliche Nachfrage treibt die Preise leicht, und die Schulden steigen – künftige Generationen zahlen mit.'}}
};
ROUNDS.forEach((R,i)=>R.opts.forEach(o=>Object.assign(o,OPTX[i+o.k])));
const CHK_PERM=[[1,0,2],[2,1,0],[0,2,1],[1,2,0]];
function chkOptions(o,r){const all=[o.chk.a].concat(o.chk.d);return CHK_PERM[r].map(i=>({txt:all[i],ok:i===0}))}
function realHTML(o){return `<div class="real"><b>Das gab es wirklich</b><p class="small" style="margin-top:4px">${esc(o.real)}</p></div>`}
function debtHTML(d){return `<p class="small">Staatsverschuldung</p><div class="bar debt"><i style="width:${d}%;background:${d>=82?'var(--bad)':d<40?'var(--ok)':'var(--amb)'}"></i></div><p class="small muted">Ab der Markierung greift 2029 die Schuldenbremse: Dann kommt ein Sparpaket.</p>`}
function crisisHTML(rd){return rd&&rd.crisis?`<div class="fb bad"><b>Die Schuldenbremse greift!</b> Die Staatsschulden sind in den letzten Jahren stark gestiegen. Der Bund muss sparen: Das Klimageld wird halbiert, Förderprogramme wie BAföG, Gründer-, Handwerks- und Agrarförderung werden gekürzt. Wachstum und Verteilung leiden.</div>`:''}

function newSt(){return {E:1,S:1,L:1,Mc:1,Ml:1,zins:ZINS0,ML:ML0,lohn:{},umsatz:{},job:{},T:0,St:0,tmp:{},hex:Object.assign({},START.de.v),debt:50}}
const cloneSt=s=>JSON.parse(JSON.stringify(s));
function applyOps(st,o){
  if(!o)return;
  ['E','S','L','Mc','Ml'].forEach(k=>{if(o[k])st[k]*=o[k]});
  if(o.zins)st.zins+=o.zins;
  if(o.ML)st.ML=Math.round(st.ML*o.ML*100)/100;
  if(o.lohn)for(const s in o.lohn)st.lohn[s]=(st.lohn[s]||1)*o.lohn[s];
  if(o.umsatz)for(const s in o.umsatz)st.umsatz[s]=(st.umsatz[s]||1)*o.umsatz[s];
  if(o.job)Object.assign(st.job,o.job);
  if(o.T)st.T+=o.T; if(o.St)st.St+=o.St;
  if(o.tmp)for(const k in o.tmp)st.tmp[k]=(st.tmp[k]||1)*o.tmp[k];
  if(o.hex)for(const k in o.hex)st.hex[k]=clamp(st.hex[k]+o.hex[k],0,100);
  if(o.debt)st.debt=clamp(st.debt+o.debt*8,0,100);
}
function simulate(decs){
  const st=newSt(),out=[];
  for(let i=0;i<ROUNDS.length;i++){
    const R=ROUNDS[i]; st.tmp={};
    if(st.job.auto===3)st.job.auto=0;      // Umschulung abgeschlossen
    else if(st.job.auto===2&&i===3)st.job.auto=4; // nach langer Suche neuer Job
    const hex0=Object.assign({},st.hex),debt0=st.debt;
    if(i===3&&st.debt>=82){st.crisis=true;st.T*=0.5;applyOps(st,{hex:{W:-3,V:-3}})}
    applyOps(st,R.ops);
    const ev=cloneSt(st); let after=null;
    const o=R.opts.find(x=>x.k===decs[i]);
    if(o){applyOps(st,o.ops);after=cloneSt(st)}
    out.push({hex0,debt0,ev,after,d:o?o.k:null,crisis:!!st.crisis});
    if(!o)break;
  }
  return out;
}
function monthly(f,s){
  const t=s.tmp||{},E=s.E*(t.E||1),S=s.S*(t.S||1),M=f.stadt?s.Mc:s.Ml,parts=[];
  const pc=x=>sgn((x-1)*100,0)+' %';
  const add=(l,v,w)=>{if(Math.abs(v)>=1)parts.push([l,Math.round(v),w||''])};
  add('Energie zu Hause',-f.li.energie*(E-1),`Energiepreise ${pc(E)} gegenüber Herbst 2026 (Iran-Krieg, später der CO₂-Preis${t.E?'; dieses Jahr gedämpft durch die Preisbremse':''}) → Strom und Heizung (${eur(f.li.energie)} im Monat) werden teurer.`);
  add('Tanken & Mobilität',-f.li.mobil*(S-1),`Spritpreise ${pc(S)}${t.S?' (dieses Jahr gedämpft durch den Tankrabatt)':''} → Tanken für ${eur(f.li.mobil)} im Monat wird teurer. Wer viel pendelt, trifft das besonders.`);
  add('Lebensmittel & Konsum',-f.li.essen*(s.L-1),`Lebensmittel und Konsumgüter ${pc(s.L)}: Höhere Energie- und Transportkosten, Zölle und die Dürre werden über die Preise weitergegeben → der Einkauf (${eur(f.li.essen)} im Monat) wird teurer.`);
  add('Miete',-f.li.miete*(M-1),`Mieten ${pc(M)}: ${f.stadt?'In den Städten':'Auch auf dem Land'} suchen mehr Menschen eine Wohnung, als es Wohnungen gibt. Knappes Angebot plus hohe Nachfrage → der Preis steigt.`);
  const dz=s.zins-ZINS0;
  const zt=dz>=0?`Die EZB hat den Leitzins seit Herbst 2026 um ${fmt(dz,2)} Prozentpunkte erhöht`:`Die EZB hat den Leitzins seit Herbst 2026 um ${fmt(-dz,2)} Prozentpunkte gesenkt`;
  add('Zinsen aufs Ersparte',f.spar*dz/100/12,`${zt} → Banken zahlen ${dz>0?'mehr':'weniger'} Zinsen auf ${eur(f.spar)} Erspartes.`);
  if(f.kredit)add('Kreditzinsen',-f.kredit*dz/100/12,`${zt} → der Kredit über ${eur(f.kredit)} (variabler Zins) wird ${dz>0?'teurer':'günstiger'}.`);
  const LW={optik:'KI-Boom: Chipfabriken brauchen Präzisionsoptik aus Jena → volle Auftragsbücher → höhere Vergütung',tech:'KI-Boom: Fachkräfte sind knapp und begehrt → höhere Gehälter',pflege:'Fachkräftemangel in der Pflege: Krankenhäuser konkurrieren um Personal → höhere Löhne'};
  if(!f.selbst&&!f.mini)add(f.sec==='rente'?'Rente':(f.sec==='optik'?'Ausbildungsvergütung':'Lohn'),f.netto*((s.lohn[f.sec]||1)-1),`${LW[f.sec]||'Lohnänderung'} (${pc(s.lohn[f.sec]||1)}).`);
  if(f.mini)add('Mindestlohn im Minijob',f.mini*(s.ML-ML0),`Der Mindestlohn steigt von 13,90 € auf ${fmt(s.ML,2)} € → ${f.mini} Stunden × ${fmt(s.ML-ML0,2)} € mehr im Monat. Die Minijob-Grenze wächst automatisch mit.`);
  const j=s.job[f.sec]||0;
  if(j===1)add('Kurzarbeit',-0.2*f.netto,'US-Zölle → weniger Aufträge → kürzere Arbeitszeit. Das Kurzarbeitergeld ersetzt nur 60 % (mit Kind 67 %) des ausgefallenen Nettolohns.');
  if(j===3)add('Kurzarbeit mit Weiterbildung',-0.15*f.netto,'Kurzarbeit, aber die freie Zeit wird für eine Umschulung genutzt, die der Staat bezahlt. Ab dem nächsten Jahr wartet ein sicherer Job.');
  if(j===2)add('Jobverlust: Arbeitslosengeld',-0.4*f.netto,'Gegenzölle → der Handelsstreit eskaliert → weitere Aufträge fallen weg → Entlassung. Das Arbeitslosengeld I beträgt 60 % (mit Kind 67 %) des letzten Nettolohns.');
  if(j===4)add('Neuer Job mit weniger Lohn',-0.1*f.netto,'Nach langer Suche ein Job in einer anderen Branche. Die Erfahrung aus dem alten Beruf zählt dort weniger, also gibt es weniger Lohn – typisch für strukturelle Arbeitslosigkeit.');
  if(f.betr){const b=f.betr;
    const kE=-b.energie*(E-1),kD=-(b.diesel||0)*(S-1),kL=-(b.lohn||0)*(s.ML/ML0-1)*0.5,kR=-(b.rohstoff||0)*(s.L-1);
    add('Betrieb: Energie',kE,`${f.sec==='agrar'?'Strom für Trocknung und Ställe':'Gas für den Backofen'} ${pc(E)} → die Energiekosten des Betriebs (${eur(b.energie)} im Monat) steigen.`);
    add('Betrieb: Diesel',kD,`Diesel ${pc(S)} → Traktoren und Erntemaschinen (${eur(b.diesel||0)} im Monat) werden teurer im Betrieb.`);
    add('Betrieb: Löhne (Mindestlohn)',kL,`Mindestlohn jetzt ${fmt(s.ML,2)} € → Verkaufskräfte und Aushilfen kosten mehr.`);
    add('Betrieb: Mehl und Zutaten',kR,`Mehl, Butter und Zucker ${pc(s.L)} → der Wareneinsatz (${eur(b.rohstoff||0)} im Monat) wird teurer.`);
    add('Betrieb: höhere Verkaufspreise',-0.7*(kE+kD+kL+kR),'Rund 70 % der höheren Kosten gibt der Betrieb über höhere Preise an die Kundschaft weiter. Genau so entsteht Inflation: Kosten wandern durch die Wirtschaft (Kostendruckinflation).');
    add(f.sec==='agrar'?'Betrieb: Ernteerlöse':'Betrieb: Umsatz',b.umsatz*0.35*((s.umsatz[f.sec]||1)-1),f.sec==='agrar'?`Ernteerlöse ${pc(s.umsatz.agrar||1)}: Die Dürre vernichtet einen Teil der Ernte, Hilfen gleichen das nur teilweise aus.`:`Umsatz ${pc(s.umsatz[f.sec]||1)}: Wenn die Kundschaft spart, wird weniger gekauft (Kaufzurückhaltung); erholt sich die Lage, kaufen die Leute wieder mehr.`);}
  if(s.T)add('Klimageld',s.T*f.pers,`Klimageld: ${fmt(s.T,2)} € pro Person und Monat × ${f.pers} ${f.pers>1?'Personen':'Person'} im Haushalt. Alle bekommen gleich viel – wer wenig Energie verbraucht, gewinnt unterm Strich.${s.crisis?' Wegen des Sparpakets wurde es halbiert.':''}`);
  if(s.St&&f.tax)add('Steuerentlastung',f.netto*s.St/100,`Die Einkommensteuer wurde gesenkt → rund ${fmt(s.St,0)} % mehr Netto. Wer keine Einkommensteuer zahlt, hat nichts davon.`);
  if(s.crisis&&f.cut)add('Sparpaket des Bundes',-f.cut,'Hohe Schulden → die Schuldenbremse greift → der Bund kürzt Förderungen, zum Beispiel BAföG, Gründer-, Handwerks- und Agrarförderung.');
  return {sum:parts.reduce((a,p)=>a+p[1],0),parts};
}
function moodLabel(m){return m>=80?['Peak','ok']:m>=65?['Gute Käse','ok']:m>=45?['Passt schon','neu']:m>=30?['Angespannt','amb']:['Crashout','bad']}
function figTrack(f,decs,ch,chx){
  // Kontostand und Stimmung über die abgeschlossenen Runden
  const sim=simulate(decs);let konto=f.spar,joy=0,mood=60,policy=0;const rows=[];
  sim.forEach((rd,i)=>{if(!rd.after)return;const m=monthly(f,rd.after);const yr=12*(f.base+m.sum);konto+=yr;policy+=12*m.sum;
    const j=rd.after.job[f.sec]||0;
    const c=ch&&ch[i]!=null?ROUNDS[i].choice.opts[ch[i]]:null;
    if(c){konto-=c.cost;joy+=c.mood;if(c.risk)konto+=(chx&&chx[i])||0;if(c.etf)konto+=30}
    mood=clamp(Math.round(60+clamp(m.sum/f.netto*150,-35,30)+({1:-8,2:-15,3:-4,4:-4}[j]||0)+joy),0,100);rows.push({i,m,yr,konto,mood})});
  const done=rows.length,last=done?rows[done-1].m.sum:0,prog=Math.round(konto+(4-done)*12*(f.base+last));
  return {konto:Math.round(konto),mood,policy:Math.round(policy),rows,start:f.spar,prog,goalOk:konto>=f.goal.amt};
}
const eur=(n,d=0)=>fmt(n,d)+' €';
const sgnE=n=>(n>0?'+':n<0?'−':'±')+fmt(Math.abs(Math.round(n)),0)+' €';
function postHTML(R){return `<div class="post"><div class="who"><span class="av"><span class="ms sm">person</span></span><span>@${esc(R.post.h)}</span></div><div>${esc(R.post.txt)}</div><div class="meta"><span class="ms sm">favorite</span>${R.post.likes} · fiktiver Beitrag</div></div>`}
function hexPillsHTML(h){return ORDER.filter(k=>h&&h[k]).map(k=>`<span class="pill ${h[k]>0?'ok':'bad'}">${G[k].short} ${h[k]>0?'+':'−'}${Math.abs(h[k])}</span>`).join(' ')}
function partsHTML(m){if(!m.parts.length)return '<p class="small muted">Keine Veränderung gegenüber dem Start.</p>';
  return `<p class="small muted">Tippe auf eine Zeile: Warum ändert sich das?</p><div class="tbl-wrap"><table><tbody>${m.parts.slice().sort((a,b)=>a[1]-b[1]).map(([l,v,w])=>`<tr><td><details class="why"><summary>${esc(l)}</summary><p class="small">${esc(w)}</p></details></td><td class="r num ${v>0?'pos':'neg'}" style="vertical-align:top">${sgnE(v)}</td></tr>`).join('')}<tr><td><b>Summe pro Monat</b></td><td class="r num ${m.sum>=0?'pos':'neg'}"><b>${sgnE(m.sum)}</b></td></tr></tbody></table></div>`}
function avatarHTML(f,big){return `<span class="avatar${big?' lg':''}">${portraitSVG(f)}</span>`}
function figsTableHTML(decs,r,useAfter){
  const sim=simulate(decs),rd=sim[r];if(!rd)return '';
  const s=useAfter&&rd.after?rd.after:rd.ev;
  return `<div class="tbl-wrap"><table><thead><tr><th>Figur</th><th class="r">Veränderung pro Monat</th><th>Stärkster Effekt</th></tr></thead><tbody>${FIG.map(f=>{const m=monthly(f,s);const top=m.parts.slice().sort((a,b)=>Math.abs(b[1])-Math.abs(a[1]))[0];
    return `<tr><td>${esc(f.n)} <span class="small muted">(${f.a}, ${esc(f.ort.split(' (')[0])})</span></td><td class="r num ${m.sum>=0?'pos':'neg'}"><b>${sgnE(m.sum)}</b></td><td class="small">${top?esc(top[0])+' '+sgnE(top[1]):'–'}</td></tr>`}).join('')}</tbody></table></div><p class="small muted">Veränderung gegenüber Herbst 2026 vor dem Schock; normale Lohn- und Rentenerhöhungen sind herausgerechnet.</p>`;
}
function optMatrixHTML(decs,r){
  const R=ROUNDS[r];
  return `<div class="tbl-wrap"><table><thead><tr><th>Figur</th>${R.opts.map(o=>`<th class="r"><span class="letter" style="--oc:${OPTC[o.k]};display:inline-grid;width:24px;height:24px;font-size:.8rem">${o.k}</span></th>`).join('')}</tr></thead><tbody>${FIG.map(f=>{
    const base=monthly(f,simulate(decs.slice(0,r))[r].ev).sum;
    return `<tr><td>${esc(f.n)}</td>${R.opts.map(o=>{const s=simulate(decs.slice(0,r).concat([o.k]))[r].after;const v=monthly(f,s).sum-base;return `<td class="r num ${v>0.5?'pos':v<-0.5?'neg':''}">${sgnE(v)}</td>`}).join('')}</tr>`}).join('')}</tbody></table></div><p class="small muted">Wirkung des Beschlusses auf die Monatsbilanz jeder Figur.</p>`;
}

/* --- Live-Klassenraum (Firebase, siehe js/live.js) --- */
const liveReady=new Promise(res=>{
  if('LiveFB' in window)return res(window.LiveFB);
  window.addEventListener('live-ready',()=>res(window.LiveFB),{once:true});
  setTimeout(()=>res(window.LiveFB||null),10000);
});
let pendingJoin=null;
const CODE_ALPHA=/[^A-HJ-NP-Z2-9]/g;
const normCode=s=>String(s||'').toUpperCase().replace(CODE_ALPHA,'').slice(0,6);
function qrSVG(text){try{if(!window.qrcode)return '';const q=window.qrcode(0,'M');q.addData(text);q.make();return q.createSvgTag({cellSize:6,margin:2,scalable:true,alt:'QR-Code zum Beitreten'})}catch(e){return ''}}
const joinURL=code=>location.href.split('#')[0]+'#join='+code;

/* --- Werkzeug --- */
tool({id:'leben',ch:5,goals:ORDER,title:'Planspiel Sechseck-Leben',sub:'In die Rolle einer Person aus Thüringen schlüpfen, vier Jahre Wirtschaftspolitik erleben – allein oder als ganze Klasse',
html(){return `
<div id="lb-app" class="stack"></div>
${erkHTML('leben')}
${teacher(['Live-Klassenraum: „Klassenspiel – Lehrkraft“ am Beamer öffnen und „Live-Klassenraum erstellen“ wählen. Die Schüler scannen den QR-Code oder geben den Code ein, wählen einen Spitznamen und eine Figur. Ohne Konto, ohne App.','Pro Figur zwei bis vier Schüler, damit sich in der Debatte Interessengruppen bilden. Die Verteilung siehst du in der Lobby.','Pro Runde rund 10 Minuten: Ereignis und Infopunkte (2) – Wirkung auf die eigene Figur prüfen (2) – Debatte aus Sicht der Figuren (4) – Abstimmung auf den Handys und Beschluss (2). Vier Runden passen in eine Doppelstunde.','Beamer-Modus: blendet Spitznamen aus und zeigt nur Figuren. Unpassende Spitznamen kannst du in der Lobby entfernen.','Ohne eingerichteten Live-Modus (oder in der Vorschau): Schüler halten ihre Stimmkarte hoch, du zählst per Klick; den Beschluss tippen die Schüler als Buchstaben ein.','Die Tabelle „Wer gewinnt?“ in der Abstimmungsphase zunächst verdeckt lassen und erst nach der Debatte zeigen.','Auswertung: Wer hat am Ende gewonnen, wer verloren? Waren die Beschlüsse gerecht – und für wen? Was bedeutet der Schuldenstand für künftige Generationen?','Nach der Stunde: „Raum beenden“ löscht alle Daten sofort. Sonst laufen Räume nach 24 Stunden ab.','Hinweis: Runde 1 beruht auf echten Daten von Oktober 2026, Runden 2 bis 4 sind plausible, aber erfundene Szenarien. Alle Social-Media-Posts sind fiktiv.'])}`},
init(root){
  const app=$('#lb-app',root);
  let unsub=[];
  const cleanup=()=>{unsub.forEach(u=>{try{u()}catch(e){}});unsub=[]};
  const obs=new MutationObserver(()=>{if(!document.body.contains(app)){cleanup();obs.disconnect()}});obs.observe(document.body,{childList:true,subtree:true});
  const save=(k,v)=>store('ms6-leben-'+k,v);
  const load=k=>store('ms6-leben-'+k);
  const top=()=>{const m=$('#modal');if(m&&!m.hidden)m.scrollTop=0;else window.scrollTo(0,0)};
  const waiting=txt=>{app.innerHTML=`<div class="panel row"><span class="ms">hourglass_top</span><span>${txt}</span></div>`};

  /* ----- Startmenü ----- */
  function menu(){
    cleanup();
    const so=load('solo'),st=load('schueler'),lk=load('lk');
    app.innerHTML=`<p class="task"><b>Worum geht’s?</b> Ihr übernehmt eine von acht Figuren aus der Region – vom Azubi in Jena bis zum Landwirt bei Sömmerda. Vier Runden lang (2026 bis 2029) passieren Dinge, die das Leben teurer oder leichter machen, und ihr entscheidet, wie die Politik reagiert. Jede Entscheidung landet direkt im Geldbeutel eurer Figur – und im Sechseck.</p><div class="mode-cards">
      <button class="mode-card" type="button" data-m="solo"><span class="ic"><span class="ms">person</span></span><span class="eyebrow">Einzelspiel</span><h3>Allein spielen</h3><p class="small muted">Du wählst eine Figur und entscheidest jede Runde selbst, was die Politik tut. Ideal für Hausaufgaben oder Stillarbeit.</p>${so&&so.fig?`<span class="small">Spielstand vorhanden: ${esc(FIG.find(f=>f.id===so.fig)?.n||'')}, Runde ${Math.min(4,(so.decs||[]).length+1)}</span>`:''}</button>
      <button class="mode-card" type="button" data-m="lk"><span class="ic"><span class="ms">co_present</span></span><span class="eyebrow">Klassenspiel</span><h3>Lehrkraft (Beamer)</h3><p class="small muted">Du erstellst den Klassenraum mit Code, steuerst die Runden und siehst live, was die Klasse macht.</p>${lk&&lk.code?`<span class="small">Offener Raum: <b class="mono">${esc(lk.code)}</b>, Runde ${Math.min(4,(lk.decs||[]).length+1)}</span>`:''}</button>
      <button class="mode-card" type="button" data-m="schueler"><span class="ic"><span class="ms">groups</span></span><span class="eyebrow">Klassenspiel</span><h3>Schüler (eigenes Gerät)</h3><p class="small muted">Mit dem Code vom Beamer beitreten, Figur spielen, auf dem Handy abstimmen.</p>${st&&st.fig?`<span class="small">Spielstand vorhanden: ${esc(FIG.find(f=>f.id===st.fig)?.n||'')}${st.code?` in Raum <b class="mono">${esc(st.code)}</b>`:''}</span>`:''}</button></div>
      <div class="panel"><h3>Die acht Figuren</h3><div class="figs">${FIG.map(f=>`<div class="fig" style="cursor:default"><div class="fighead">${avatarHTML(f)}<div><div class="nm">${esc(f.n)}, ${f.a}</div><div class="sm">${esc(f.ort)}</div></div></div><div class="small">${esc(f.job)}</div></div>`).join('')}</div></div>`;
    $$('[data-m]',app).forEach(b=>b.addEventListener('click',()=>{const m=b.dataset.m;
      if(m==='solo')return player('solo',null);
      waiting('Verbinde mit dem Live-Klassenraum …');
      liveReady.then(L=>{if(!document.body.contains(app))return;m==='lk'?teacherStart(L):player('schueler',L)})}));
  }

  /* ----- Spieler (Einzel und Schüler) ----- */
  function player(mode,L){
    cleanup();
    const live=mode==='schueler'&&L?L:null;
    let g=load(mode)||{};
    let liveOn=false,pushT=null,lastSent='';
    const pushMe=()=>{
      if(!live||!g.joined||!g.code)return;
      clearTimeout(pushT);pushT=setTimeout(()=>{
        const f=FIG.find(x=>x.id===g.fig);if(!f)return;
        const tr=figTrack(f,g.decs||[],g.ch,g.chx);
        const votes={},checks={},choices={};
        (g.votes||[]).forEach((v,i)=>{if(v)votes[i]=v});
        (g.ck||[]).forEach((v,i)=>{if(v==null)return;const d=(g.decs||[])[i];const o=d&&ROUNDS[i].opts.find(x=>x.k===d);if(o)checks[i]=chkOptions(o,i)[v].ok});
        (g.ch||[]).forEach((v,i)=>{if(v!=null)choices[i]=v});
        let hs=0;for(let i=0;i<4;i++)hs+=(store('ms6-hs-'+i)||[]).length;
        const data={nick:g.nick,fig:g.fig,r:g.r||0,ph:g.ph||'event',votes,checks,choices,konto:tr.konto,goalOk:g.ph==='end'?tr.goalOk:tr.prog>=f.goal.amt,mood:tr.mood,hs};
        const js=JSON.stringify(data);if(js===lastSent)return;lastSent=js;
        live.updatePlayer(g.code,data).catch(e=>console.warn('Senden fehlgeschlagen',e));
      },400);
    };
    const persist=()=>{save(mode,g);pushMe()};
    if(live){
      if(pendingJoin&&g.code!==pendingJoin){g={code:pendingJoin};save(mode,g)}
      pendingJoin=null;
      if(!g.joined)return joinScreen();
    }else if(mode==='schueler'&&pendingJoin){pendingJoin=null}
    if(!g.fig)return pickFig();
    if(live){
      unsub.push(live.watchRoom(g.code,d=>{
        if(!d){liveOn=false;return ended('Der Klassenraum wurde beendet oder ist abgelaufen.')}
        liveOn=true;
        if(g.gameId!==d.gameId){g.gameId=d.gameId;g.decs=[];g.ch=[];g.chx=[];g.ck=[];g.votes=[];g.r=0;g.ph='event';g.vote=null}
        const ld=(d.decisions||[]).filter(x=>/^[ABC]$/.test(x)).slice(0,4);
        if(ld.length>(g.decs||[]).length){g.decs=ld;if(g.ph==='wait'&&g.decs.length>g.r)g.ph='result'}
        persist();render();
      }));
      unsub.push(live.watchMe(g.code,exists=>{if(!exists&&g.joined)ended('Deine Lehrkraft hat dich aus dem Raum entfernt. Du kannst mit einem anderen Spitznamen neu beitreten.')}));
    }
    function ended(msg){
      cleanup();g={};save(mode,g);
      app.innerHTML=`<div class="panel stack" style="max-width:560px"><h3 class="title-l">Live-Spiel beendet</h3><p>${esc(msg)}</p><div class="cta"><button class="btn primary" type="button" id="rj"><span class="ms">login</span>Neu beitreten</button><button class="btn text" type="button" id="bk"><span class="ms">arrow_back</span>Menü</button></div></div>`;
      $('#rj',app).addEventListener('click',()=>player(mode,L));$('#bk',app).addEventListener('click',menu);
    }
    function joinScreen(err){
      app.innerHTML=`<div class="row"><button class="btn small" type="button" id="bk"><span class="ms">arrow_back</span>Menü</button></div>
      <form class="panel stack" id="jf" style="max-width:520px" novalidate><h3 class="title-l">Klassenraum beitreten</h3>
      <p class="small muted">Gib den Code vom Beamer ein und wähle einen Spitznamen. Bitte nicht deinen vollen echten Namen.</p>
      <div class="ctrl"><label for="jc">Code</label><input id="jc" type="text" inputmode="text" maxlength="8" autocomplete="off" autocapitalize="characters" spellcheck="false" value="${esc(g.code||'')}" style="font-family:var(--mono);font-size:1.5rem;letter-spacing:.2em;text-transform:uppercase"></div>
      <div class="ctrl"><label for="jn">Spitzname</label><input id="jn" type="text" maxlength="20" autocomplete="off" value="${esc(g.nick||'')}"></div>
      <div class="fb bad" id="jerr" ${err?'':'hidden'}>${esc(err||'')}</div>
      <div class="cta"><button class="btn primary" type="submit" id="jgo"><span class="ms">login</span>Weiter zur Figurenwahl</button></div></form>`;
      $('#bk',app).addEventListener('click',menu);
      $('#jf',app).addEventListener('submit',async e=>{e.preventDefault();
        const code=normCode($('#jc',app).value),nick=$('#jn',app).value.trim().replace(/\s+/g,' ').slice(0,20);
        const fail=t=>{const el=$('#jerr',app);el.textContent=t;el.hidden=false};
        if(code.length!==6)return fail('Der Code hat sechs Zeichen, zum Beispiel K7Q2XM.');
        if(!nick)return fail('Bitte gib einen Spitznamen ein.');
        $('#jgo',app).disabled=true;
        const room=await live.getRoom(code);
        $('#jgo',app).disabled=false;
        if(!room)return fail('Diesen Raum gibt es nicht (mehr). Prüfe den Code.');
        if(!room.open)return fail('Dieser Raum nimmt gerade niemanden auf.');
        g={code,nick,gameId:room.gameId};save(mode,g);pickFig();
      });
    }
    function pickFig(err){
      app.innerHTML=`<div class="row"><button class="btn small" type="button" id="bk"><span class="ms">arrow_back</span>Menü</button><b>Wähle deine Figur</b>${mode==='schueler'?'<span class="small muted">Nimm die Figur, die deine Lehrkraft dir zuteilt.</span>':''}</div>
      ${err?`<div class="fb bad">${esc(err)}</div>`:''}
      <div class="figs">${FIG.map(f=>`<button class="fig" type="button" data-f="${f.id}"><div class="fighead">${avatarHTML(f,true)}<div><div class="nm">${esc(f.n)}, ${f.a}</div><div class="sm">${esc(f.ort)}</div></div></div><div class="small">${esc(f.job)}</div><div class="sm">${esc(f.vibe)}</div><div class="small">Netto: <b>${eur(f.netto)}</b> · Erspartes: <b>${eur(f.spar)}</b>${f.kredit?` · Kredit: <b>${eur(f.kredit)}</b>`:''}</div><div class="sm">Ziel bis 2029: ${esc(f.goal.t)} (${eur(f.goal.amt)} auf dem Konto)</div></button>`).join('')}</div>`;
      $('#bk',app).addEventListener('click',menu);
      $$('[data-f]',app).forEach(b=>b.addEventListener('click',async()=>{
        const keep={code:g.code,nick:g.nick,joined:g.joined,gameId:g.gameId||null};
        const fig=b.dataset.f;
        if(live){
          $$('[data-f]',app).forEach(x=>x.disabled=true);
          try{
            const f=FIG.find(x=>x.id===fig);
            const base={nick:keep.nick,fig,r:0,ph:'event',votes:{},checks:{},choices:{},konto:f.spar,goalOk:false,mood:60,hs:0};
            if(keep.joined)await live.updatePlayer(keep.code,base);else await live.joinRoom(keep.code,base);
          }catch(e){console.warn(e);return pickFig('Beitreten hat nicht geklappt. Ist der Raum noch offen? Frag deine Lehrkraft.')}
          keep.joined=true;
        }
        g=Object.assign(keep,{fig,decs:[],ch:[],chx:[],ck:[],votes:[],r:0,ph:'event'});save(mode,g);lastSent='';player(mode,L);
      }));
    }
    function hud(f){
      const tr=figTrack(f,g.decs||[],g.ch,g.chx);const [ml,mc]=moodLabel(tr.mood);
      return `<div class="hud">${avatarHTML(f)}<div><div class="nm"><b>${esc(f.n)}, ${f.a}</b></div><div class="small muted">${esc(f.ort)}</div></div>
        <div><div class="k">Runde</div><div class="v">${Math.min(4,g.r+1)}/4</div></div>
        <div><div class="k">Kontostand</div><div class="v">${eur(tr.konto)}</div></div>
        <div><div class="k">Stimmung</div><div class="v"><span class="pill ${mc}">${ml}</span></div></div>
        <div class="goal"><div class="k">Ziel: ${esc(f.goal.t)}</div><div class="bar"><i style="width:${clamp(tr.konto/f.goal.amt*100,0,100)}%;background:${tr.prog>=f.goal.amt?'var(--ok)':'var(--amb)'}"></i></div><div class="small muted">Prognose 2029: <b class="${tr.prog>=f.goal.amt?'pos':'neg'}">${eur(tr.prog)}</b> von ${eur(f.goal.amt)}</div></div>
        ${mode==='schueler'?(live?`<div class="small"><span class="live-dot ${liveOn?'':'off'}"></span>${liveOn?`Live in Raum <b class="mono">${esc(g.code)}</b> als ${esc(g.nick)}`:'Verbinde …'}</div>`:`<div class="small"><span class="live-dot off"></span>Ohne Live-Verbindung</div>`):''}
        <span style="flex:1"></span>${live?'<button class="btn text small" type="button" id="leave"><span class="ms">logout</span>Raum verlassen</button>':''}<button class="btn small" type="button" id="bk"><span class="ms">arrow_back</span>Menü</button></div>
        <div class="fb amb" id="leave-q" hidden>Raum wirklich verlassen? Dein Spielstand in diesem Raum wird gelöscht. <button class="btn small primary" type="button" id="leave-y">Verlassen</button> <button class="btn small text" type="button" id="leave-n">Abbrechen</button></div>`;
    }
    function render(){
      if(!document.body.contains(app))return;
      const f=FIG.find(x=>x.id===g.fig);if(!f)return pickFig();
      g.decs=g.decs||[];g.ch=g.ch||[];g.chx=g.chx||[];
      if(g.r>=4)g.ph='end';
      const R=ROUNDS[Math.min(g.r,3)],sim=simulate(g.decs);
      let h=hud(f);
      if(g.ph==='event'){
        const rdE=simulate(g.decs.slice(0,g.r).concat(['A']))[g.r],ev=rdE.ev;const m=monthly(f,ev);
        h+=`<div class="row"><span class="yr">${R.y}</span><h3 style="font-size:1.3rem">${esc(R.t)}</h3><span class="tagx">${R.real?'echte Lage':'Szenario'}</span></div>
        ${crisisHTML(rdE)}
        <div class="grid2"><div class="stack">${photoHTML(g.r)}${postHTML(R)}<p>${esc(R.txt)}</p></div>
        <div class="panel"><h3>Was heißt das für ${esc(f.n)}?</h3><p>${esc(R.fig[f.id])}</p><p class="small muted" style="margin-top:6px">Monatsbilanz im Vergleich zum Start:</p>${partsHTML(m)}</div></div>
        <div class="cta"><button class="btn primary" type="button" id="go">Zur Abstimmung<span class="ms trail">arrow_forward</span></button></div>`;
      }else if(g.ph==='vote'){
        const base=monthly(f,simulate(g.decs.slice(0,g.r).concat(['A']))[g.r].ev).sum;
        h+=`<div class="row"><span class="yr">${R.y}</span><h3>${esc(R.q)}</h3></div>
        <p class="small muted">${mode==='solo'?'Du entscheidest. Deine Wahl wird zum Beschluss.':'Stimme aus Sicht deiner Figur ab.'}</p>
        <div class="opts">${R.opts.map(o=>{const v=monthly(f,simulate(g.decs.slice(0,g.r).concat([o.k]))[g.r].after).sum-base;return `<button class="opt" type="button" data-o="${o.k}" style="--oc:${OPTC[o.k]}"><span class="lt"><span class="letter">${o.k}</span><b>${esc(o.t)}</b></span><span class="small">${esc(o.d)}</span><span class="small">Für ${esc(f.n)}: <span class="me ${v>0.5?'pos':v<-0.5?'neg':''}">${sgnE(v)} im Monat</span></span><span>${hexPillsHTML(o.ops.hex)}</span></button>`}).join('')}</div>`;
      }else if(g.ph==='card'){
        const o=ROUNDS[g.r].opts.find(x=>x.k===g.vote);
        h+=`<div class="stimmkarte" style="--oc:${OPTC[g.vote]}"><b>${g.vote}</b><span>${esc(o.t)}</span><span class="small">${esc(f.n)} stimmt dafür</span></div>
        <p class="small muted">${liveOn?'Deine Stimme ist beim Beamer angekommen.':'Halte die Karte hoch, damit deine Lehrkraft zählen kann.'}</p>
        <div class="cta"><button class="btn" type="button" id="schere"><span class="ms">undo</span>Schere – Stimme ändern</button><button class="btn primary" type="button" id="go">Weiter: Beschluss abwarten<span class="ms trail">arrow_forward</span></button></div>`;
      }else if(g.ph==='wait'){
        h+=`<div class="panel stack"><h3>Welchen Beschluss hat die Klasse gefasst?</h3>
        <p class="small muted">${liveOn?'Sobald deine Lehrkraft den Beschluss verkündet, geht es automatisch weiter.':'Deine Lehrkraft verkündet den Beschluss. Tippe den Buchstaben an:'}</p>
        ${liveOn?'<div class="row"><span class="ms">hourglass_top</span><span>Warte auf den Beschluss …</span></div>':`<div class="choice">${ROUNDS[g.r].opts.map(o=>`<button type="button" data-d="${o.k}" style="font-weight:700">${o.k} – ${esc(o.t)}</button>`).join('')}</div>
        <details><summary class="small">Runde verpasst? Klassencode eingeben</summary><div class="row" style="margin-top:6px"><input id="kc" type="text" maxlength="4" placeholder="z. B. BAC" aria-label="Klassencode" style="width:8em;text-transform:uppercase"><button class="btn small" type="button" id="kcgo">Übernehmen</button></div></details>`}</div>`;
      }else if(g.ph==='result'){
        const rd=sim[g.r];const o=ROUNDS[g.r].opts.find(x=>x.k===rd.d);const m=monthly(f,rd.after);const tr=figTrack(f,g.decs,g.ch,g.chx);const row=tr.rows[g.r];
        h+=`<div class="row"><span class="yr">${R.y}</span><span class="letter" style="--oc:${OPTC[o.k]}">${o.k}</span><h3>Beschluss: ${esc(o.t)}</h3></div>
        <div class="grid2"><div class="panel"><h3>${esc(/[sxzß]$/.test(f.n)?f.n+'’':f.n+'s')} Monatsbilanz</h3>${partsHTML(m)}
          <p style="margin-top:8px">Über das Jahr: <b class="${row.yr>=0?'pos':'neg'}">${sgnE(row.yr)}</b> auf dem Konto (inklusive normalem Überschuss von ${eur(f.base)} im Monat).</p></div>
          <div class="panel chart"><h3>Klassen-Sechseck</h3>${radar([{v:rd.hex0,stroke:'var(--muted)',dash:'6 5',fo:0},{v:rd.after.hex,stroke:'var(--accent)',fill:'var(--accent)',fo:.2}],{label:'Sechseck vor und nach dieser Runde'})}<p class="small muted">Gestrichelt: vor der Runde.</p></div></div>
        ${realHTML(o)}
        <details class="panel"><summary><b>Und wie geht es den anderen?</b></summary>${figsTableHTML(g.decs,g.r,true)}</details>
        <div class="cta"><button class="btn primary" type="button" id="go">Weiter: Fachbegriff-Check<span class="ms trail">arrow_forward</span></button></div>`;
      }else if(g.ph==='check'){
        const o=ROUNDS[g.r].opts.find(x=>x.k===g.decs[g.r]);const ops=chkOptions(o,g.r);const a=(g.ck||[])[g.r];
        h+=`<div class="row"><span class="yr">${R.y}</span><h3>Fachbegriff-Check</h3></div><div class="panel stack">
        <p><b>Welche Zielbeziehung zeigt der Beschluss „${esc(o.t)}“ am deutlichsten?</b></p>
        <div class="choice" style="flex-direction:column">${ops.map((x,i)=>`<button type="button" data-k="${i}" style="text-align:left" class="${a!=null?(x.ok?'right':(a===i?'wrong':'')):''}">${esc(x.txt)}</button>`).join('')}</div>
        ${a!=null?`<div class="fb ${ops[a].ok?'ok':'amb'}"><b>${ops[a].ok?'Richtig!':'Nicht ganz.'}</b> ${esc(o.chk.why)}</div><div class="cta"><button class="btn primary" type="button" id="go">Weiter: private Entscheidung<span class="ms trail">arrow_forward</span></button></div>`:''}</div>`;
      }else if(g.ph==='choice'){
        const C=R.choice;const picked=g.ch[g.r];
        h+=`<div class="row"><span class="yr">${R.y}</span><h3>Deine private Entscheidung</h3></div><div class="panel stack"><p><b>${esc(C.q)}</b></p>
        <div class="opts">${C.opts.map((o,i)=>`<button class="opt" type="button" data-c="${i}" style="--oc:var(--accent)" aria-pressed="${picked===i}"><b>${esc(o.t)}</b>${picked!=null?`<span class="small muted">${esc(o.l)}</span>`:''}</button>`).join('')}</div>
        ${picked!=null?`<div class="fb ${C.opts[picked].risk?(g.chx[g.r]>0?'ok':'bad'):'neu'}">${C.opts[picked].risk?(g.chx[g.r]>0?'Glück gehabt: Der Coin ist explodiert, aus 500 € wurden 2.000 €. Das war reines Glück – die meisten verlieren.':'Der Coin ist um 90 % abgestürzt, von 500 € sind 50 € übrig. Die Gründer hatten früh verkauft.'):esc(C.opts[picked].l)}</div>
        <div class="cta"><button class="btn primary" type="button" id="go">${g.r<3?'Nächste Runde<span class="ms trail">arrow_forward</span>':'Zur Abschlussbilanz<span class="ms trail">arrow_forward</span>'}</button></div>`:''}</div>`;
      }else if(g.ph==='end'){
        const tr=figTrack(f,g.decs,g.ch,g.chx);const [ml,mc]=moodLabel(tr.mood);const fin=simulate(g.decs)[3];
        const all=FIG.map(x=>({f:x,t:figTrack(x,g.decs,[],[])})).sort((a,b)=>b.t.policy-a.t.policy);
        h+=`<div class="panel stack"><h3>Abschlussbilanz 2029</h3>
        <div class="fb ${tr.goalOk?'ok':'bad'}"><b>${tr.goalOk?'Ziel erreicht!':'Ziel verfehlt.'}</b> ${esc(f.goal.t)}: ${eur(tr.konto)} von ${eur(f.goal.amt)}.</div>
        <p>${esc(f.n)} startete mit ${eur(f.spar)} und hat jetzt <b>${eur(tr.konto)}</b>. Die Politik der vier Jahre hat ${esc(f.n)} insgesamt <b class="${tr.policy>=0?'pos':'neg'}">${sgnE(tr.policy)}</b> gebracht. Stimmung: <span class="pill ${mc}">${ml}</span></p>
        <p class="small muted">Eure Beschlüsse: ${g.decs.map((d,i)=>`${ROUNDS[i].y}: ${d} – ${esc(ROUNDS[i].opts.find(o=>o.k===d).t)}`).join(' · ')}</p></div>
        <div class="grid2"><div class="panel chart"><h3>Sechseck 2026 → 2029</h3>${radar([{v:START.de.v,stroke:'var(--muted)',dash:'6 5',fo:0},{v:fin.after.hex,stroke:'var(--accent)',fill:'var(--accent)',fo:.2}],{label:'Sechseck am Anfang und am Ende'})}
          ${debtHTML(fin.after.debt)}</div>
        <div class="panel"><h3>Gewinner und Verlierer eurer Politik</h3><div class="tbl-wrap"><table><thead><tr><th>Figur</th><th class="r">Politik-Effekt in 4 Jahren</th><th>Ziel</th></tr></thead><tbody>${all.map(a=>`<tr${a.f.id===f.id?' style="background:var(--accent-soft)"':''}><td>${esc(a.f.n)} <span class="small muted">${esc(a.f.job.split(',')[0])}</span></td><td class="r num ${a.t.policy>=0?'pos':'neg'}"><b>${sgnE(a.t.policy)}</b></td><td>${a.t.goalOk?'<span class="pill ok">erreicht</span>':'<span class="pill bad">verfehlt</span>'}</td></tr>`).join('')}</tbody></table></div><p class="small muted">Politik-Effekt und Ziele ohne private Entscheidungen. Dein eigenes Ergebnis oben enthält sie.</p></div></div>
        <div class="panel"><h3>Nachdenken</h3><ul><li>War eure Politik gerecht – und für wen?</li><li>Wer hat von den Beschlüssen profitiert, die dem Sechseck insgesamt geholfen haben?</li><li>Was bedeutet der Schuldenstand für eure Generation?</li><li>Welche Beschlüsse würdet ihr mit dem Wissen von heute anders treffen?</li></ul></div>
        ${live?'':`<div class="cta"><button class="btn" type="button" id="again"><span class="ms">refresh</span>Noch einmal mit anderen Beschlüssen</button><button class="btn" type="button" id="newfig">Andere Figur wählen</button></div>`}`;
      }
      app.innerHTML=h;bindPhoto(app);
      $('#bk',app)?.addEventListener('click',()=>{cleanup();menu()});
      if($('#leave',app)){
        $('#leave',app).addEventListener('click',()=>{$('#leave-q',app).hidden=false});
        $('#leave-n',app).addEventListener('click',()=>{$('#leave-q',app).hidden=true});
        $('#leave-y',app).addEventListener('click',async()=>{const c=g.code;cleanup();g={};save(mode,g);try{await live.kick(c,live.uid)}catch(e){}menu()});
      }
      const go=$('#go',app);
      if(g.ph==='event')go.addEventListener('click',()=>{g.ph='vote';persist();render();top()});
      if(g.ph==='vote')$$('[data-o]',app).forEach(b=>b.addEventListener('click',()=>{
        g.vote=b.dataset.o;g.votes=g.votes||[];g.votes[g.r]=g.vote;
        if(mode==='solo'){g.decs[g.r]=g.vote;g.ph='result'}else g.ph='card';
        persist();render();top()}));
      if(g.ph==='card'){$('#schere',app).addEventListener('click',()=>{g.ph='vote';persist();render()});go.addEventListener('click',()=>{g.ph=g.decs.length>g.r?'result':'wait';persist();render();top()})}
      if(g.ph==='wait'&&!liveOn){
        $$('[data-d]',app).forEach(b=>b.addEventListener('click',()=>{g.decs[g.r]=b.dataset.d;g.decs=g.decs.slice(0,g.r+1);g.ph='result';persist();render();top()}));
        $('#kcgo',app).addEventListener('click',()=>{const c=($('#kc',app).value||'').toUpperCase().replace(/[^ABC]/g,'').slice(0,4);if(!c)return;g.decs=c.split('');g.r=Math.min(c.length-1,3);g.ph='result';g.ch=g.ch.slice(0,g.r);g.chx=g.chx.slice(0,g.r);persist();render();top()});
      }
      if(g.ph==='result')go.addEventListener('click',()=>{g.ph='check';persist();render();top()});
      if(g.ph==='check'){
        $$('[data-k]',app).forEach(b=>b.addEventListener('click',()=>{g.ck=g.ck||[];if(g.ck[g.r]!=null)return;g.ck[g.r]=+b.dataset.k;persist();render()}));
        go?.addEventListener('click',()=>{g.ph='choice';persist();render();top()});
      }
      if(g.ph==='choice'){
        $$('[data-c]',app).forEach(b=>b.addEventListener('click',()=>{if(g.ch[g.r]!=null)return;const i=+b.dataset.c;g.ch[g.r]=i;const o=R.choice.opts[i];g.chx[g.r]=o.risk?(Math.random()<0.2?2000:50):0;persist();render()}));
        go?.addEventListener('click',()=>{g.r++;g.vote=null;g.ph=g.r>=4?'end':'event';persist();render();top()});
      }
      if(g.ph==='end'&&!live){
        $('#again',app).addEventListener('click',()=>{g.decs=[];g.ch=[];g.chx=[];g.ck=[];g.votes=[];g.r=0;g.ph='event';persist();render();top()});
        $('#newfig',app).addEventListener('click',()=>{g={gameId:g.gameId};persist();player(mode,L)});
      }
    }
    render();pushMe();
  }

  /* ----- Lehrkraft (Beamer) mit Live-Dashboard ----- */
  function teacherStart(L){
    cleanup();
    const live=L||null;
    const newT=()=>({gameId:Math.random().toString(36).slice(2,8),r:0,ph:'lobby',decs:[],tally:{A:0,B:0,C:0},show:false,anon:false,code:(t&&t.code)||null});
    let t=null;t=load('lk');
    if(!t||!t.gameId)t=newT();
    const persist=()=>save('lk',t);persist();
    let players=[],roomOk=false,roomErr='',busy=false,playersUnsub=null,confirmClose=false;
    const pushState=()=>{if(live&&t.code&&roomOk)live.updateRoom(t.code,{round:t.r,phase:t.ph,decisions:t.decs.slice(),gameId:t.gameId}).catch(e=>console.warn('Raum-Update',e))};
    async function attach(){
      if(!live||!t.code){render();return}
      const r=await live.getRoom(t.code);
      if(!document.body.contains(app))return;
      if(!r||r.owner!==live.uid){t.code=null;roomOk=false;persist();render();return}
      roomOk=true;
      if(playersUnsub)playersUnsub();
      playersUnsub=live.watchPlayers(t.code,ps=>{players=ps.sort((a,b)=>((a.joinedAt&&a.joinedAt.seconds)||0)-((b.joinedAt&&b.joinedAt.seconds)||0));render()});
      unsub.push(()=>playersUnsub&&playersUnsub());
      pushState();render();
    }
    async function createRoom(){busy=true;roomErr='';render();
      try{t.code=await live.createRoom(t.gameId);persist();await attach()}
      catch(e){console.warn(e);roomErr='Der Klassenraum konnte nicht erstellt werden. Prüfe die Firebase-Einrichtung (README, Abschnitt „Live-Klassenraum einrichten“).'}
      busy=false;render()}
    async function closeRoom(){busy=true;render();
      try{await live.deleteRoom(t.code)}catch(e){console.warn(e)}
      if(playersUnsub){playersUnsub();playersUnsub=null}
      t.code=null;roomOk=false;players=[];busy=false;confirmClose=false;persist();render()}
    const liveVotes=()=>{const c={A:0,B:0,C:0};players.forEach(p=>{const v=p.votes&&p.votes[t.r];if(c[v]!=null)c[v]++});return c};
    const label=p=>{if(!t.anon)return esc(p.nick||'?');const same=players.filter(q=>q.fig===p.fig);return `${esc(FIG.find(f=>f.id===p.fig)?.n||'?')} ${same.indexOf(p)+1}`};
    const figOf=p=>FIG.find(f=>f.id===p.fig)||FIG[0];
    const stepOf=p=>{const order=['event','vote','card','wait','result','check','choice'];return (p.r||0)*10+Math.max(0,order.indexOf(p.ph))+(p.ph==='end'?100:0)};
    function lobbyLiveHTML(){
      if(!live)return `<div class="fb neu"><b>Live-Modus nicht eingerichtet.</b> Das Planspiel läuft mit Stimmkarten. Wie du den Live-Klassenraum einschaltest, steht in der README im GitHub-Projekt.</div>`;
      if(!t.code||!roomOk)return `<div class="panel stack"><h3 class="title-l">Live-Klassenraum</h3><p>Erstelle einen Raum. Die Schüler treten mit Code oder QR-Code bei – ohne Konto.</p>${roomErr?`<div class="fb bad">${esc(roomErr)}</div>`:''}<div class="cta"><button class="btn primary" type="button" id="mkroom" ${busy?'disabled':''}><span class="ms">add</span>Live-Klassenraum erstellen</button></div></div>`;
      const url=joinURL(t.code);const cnt={};players.forEach(p=>cnt[p.fig]=(cnt[p.fig]||0)+1);
      return `<div class="grid2 wide-left"><div class="panel stack"><p class="eyebrow">Raumcode</p><div class="code" style="font-size:clamp(2.5rem,7vw,4.5rem);letter-spacing:.15em;line-height:1.15;margin-top:4px;display:block">${esc(t.code)}</div>
        <p class="small">Seite öffnen → <b>Planspiel</b> → <b>Schüler</b> → Code eingeben. Oder QR-Code scannen.</p><p class="small muted mono" style="word-break:break-all">${esc(url)}</p>
        <div><p class="title-s" style="margin-bottom:8px">Figuren in der Klasse</p>${FIG.map(f=>`<div class="row" style="gap:10px;margin-bottom:4px">${avatarHTML(f)}<span style="width:5.5em">${esc(f.n)}</span><div class="bar" style="flex:1"><i style="width:${Math.min(100,(cnt[f.id]||0)*25)}%"></i></div><b class="num" style="width:2ch;text-align:right">${cnt[f.id]||0}</b></div>`).join('')}</div></div>
        <div class="panel stack" style="align-items:center"><div style="width:min(100%,300px);background:#fff;border-radius:16px;padding:8px">${qrSVG(url)}</div><p class="small muted">QR-Code zum Beitreten</p></div></div>`;
    }
    function playersHTML(){
      if(!players.length)return '<p class="small muted">Noch niemand im Raum.</p>';
      return `<div class="row" style="gap:8px">${players.map(p=>`<span class="pill neu" style="padding:4px 6px 4px 4px;gap:6px"><span class="avatar" style="width:24px;height:24px;border-radius:8px">${portraitSVG(figOf(p))}</span>${label(p)}${!t.anon?`<button class="icon-btn" type="button" data-kick="${esc(p.uid)}" aria-label="${esc(p.nick)} entfernen" title="Entfernen" style="width:24px;height:24px"><span class="ms sm">close</span></button>`:''}</span>`).join('')}</div>`;
    }
    function dashHTML(){
      if(!live||!t.code||!roomOk)return '';
      const n=players.length;const head=`<div class="row" style="justify-content:space-between"><h3 class="title-l">Live-Dashboard</h3><span class="small muted">${n} ${n===1?'Person':'Personen'} im Raum</span></div>`;
      let body='';
      if(t.ph==='lobby'){body=playersHTML()}
      else if(t.ph==='event'){const done=players.filter(p=>stepOf(p)>t.r*10).length;
        body=`<p>Ereignis gelesen und weiter zur Abstimmung: <b>${done} von ${n}</b></p><div class="bar"><i style="width:${n?done/n*100:0}%"></i></div>${playersHTML()}`}
      else if(t.ph==='vote'){const c=liveVotes(),voted=players.filter(p=>p.votes&&p.votes[t.r]),missing=players.filter(p=>!(p.votes&&p.votes[t.r]));
        body=`<p>Abgestimmt: <b>${voted.length} von ${n}</b></p>${['A','B','C'].map(k=>`<div class="row" style="gap:10px;margin:6px 0"><span class="letter" style="--oc:${OPTC[k]};width:28px;height:28px">${k}</span><div class="bar" style="flex:1;height:14px"><i style="width:${voted.length?c[k]/voted.length*100:0}%;background:var(--md-o-${k})"></i></div><b class="num" style="width:3ch;text-align:right">${c[k]}</b></div>`).join('')}
        ${missing.length?`<p class="small muted" style="margin-top:8px">Noch nicht abgestimmt: ${t.anon?missing.length+' Personen':missing.map(label).join(', ')}</p>`:''}
        <details style="margin-top:8px"><summary class="small">Wer hat wie abgestimmt?</summary><div class="tbl-wrap"><table><tbody>${FIG.map(f=>{const ps=players.filter(p=>p.fig===f.id);if(!ps.length)return '';const cc={A:0,B:0,C:0};ps.forEach(p=>{const v=p.votes&&p.votes[t.r];if(cc[v]!=null)cc[v]++});return `<tr><td>${esc(f.n)}</td>${['A','B','C'].map(k=>`<td class="r num">${k}: ${cc[k]}</td>`).join('')}</tr>`}).join('')}</tbody></table></div></details>`}
      else if(t.ph==='result'){const ans=players.filter(p=>p.checks&&p.checks[t.r]!=null),ok=ans.filter(p=>p.checks[t.r]).length;
        const C=ROUNDS[t.r].choice,ch=[0,0,0];players.forEach(p=>{const v=p.choices&&p.choices[t.r];if(v!=null&&ch[v]!=null)ch[v]++});const chn=ch.reduce((a,b)=>a+b,0);
        body=`<div class="grid2"><div class="stack"><p class="title-s">Fachbegriff-Check</p><p>${ans.length?`<b>${Math.round(ok/ans.length*100)} %</b> richtig (${ok} von ${ans.length} Antworten)`:'Noch keine Antworten.'}</p><div class="bar"><i style="width:${ans.length?ok/ans.length*100:0}%;background:var(--ok)"></i></div></div>
          <div class="stack"><p class="title-s">Private Entscheidung</p><p class="small muted">${esc(C.q)}</p>${C.opts.map((o,i)=>`<div><div class="small">${esc(o.t)}</div><div class="row" style="gap:8px"><div class="bar" style="flex:1"><i style="width:${chn?ch[i]/chn*100:0}%"></i></div><b class="num">${ch[i]}</b></div></div>`).join('')}</div></div>`}
      else if(t.ph==='end'){
        const rows=players.map(p=>{const f=figOf(p);const [ml,mc]=moodLabel(p.mood||60);return {p,f,ml,mc}});
        body=`<div class="tbl-wrap"><table><thead><tr><th>${t.anon?'Figur':'Spitzname'}</th><th>Figur</th><th class="r">Kontostand</th><th>Stimmung</th><th>Ziel</th><th class="r">Check richtig</th></tr></thead><tbody>${rows.map(({p,f,ml,mc})=>{const cks=Object.values(p.checks||{});return `<tr><td>${label(p)}</td><td>${esc(f.n)}</td><td class="r num">${eur(p.konto||0)}</td><td><span class="pill ${mc}">${ml}</span></td><td>${p.goalOk?'<span class="pill ok">erreicht</span>':'<span class="pill bad">verfehlt</span>'}</td><td class="r num">${cks.filter(Boolean).length}/${cks.length}</td></tr>`}).join('')}</tbody></table></div>
        <p class="small muted">Kontostände enthalten die privaten Entscheidungen der Schüler – deshalb unterscheiden sie sich auch innerhalb einer Figur.</p>`}
      return `<section class="panel stack" style="background:var(--md-surface-container)">${head}${body}</section>`;
    }
    function render(){
      if(!document.body.contains(app))return;
      const R=ROUNDS[Math.min(t.r,3)];
      const liveOk=!!(live&&t.code&&roomOk);
      let h=`<div class="hud"><b>Klassenspiel · Lehrkraft</b><div><div class="k">Runde</div><div class="v">${Math.min(4,t.r+1)}/4</div></div>
        ${liveOk?`<div><div class="k">Raumcode</div><div class="v mono">${esc(t.code)}</div></div><div class="small"><span class="live-dot"></span>${players.length} live verbunden</div>`:`<div><div class="k">Klassencode</div><div class="v mono">${t.decs.join('')||'–'}</div></div><div class="small"><span class="live-dot off"></span>Ohne Live-Verbindung</div>`}
        <span style="flex:1"></span>${liveOk?`<button class="btn small" type="button" id="anon" aria-pressed="${!!t.anon}">Beamer-Modus</button><button class="btn text small" type="button" id="close"><span class="ms">delete</span>Raum beenden</button>`:''}<button class="btn small" type="button" id="bk"><span class="ms">arrow_back</span>Menü</button><button class="btn small" type="button" id="reset"><span class="ms">restart_alt</span>Neues Spiel</button></div>
        <div id="reset-q" class="fb amb" hidden>Spiel neu starten? Der Raum bleibt offen, alle Spielstände beginnen von vorn. <button class="btn small primary" type="button" id="reset-y">Ja, neu starten</button> <button class="btn small text" type="button" id="reset-n">Abbrechen</button></div>
        ${confirmClose?`<div class="fb bad">Raum ${esc(t.code)} beenden? Alle Daten der Schüler werden sofort gelöscht. <button class="btn small primary" type="button" id="close-y" ${busy?'disabled':''}>Raum löschen</button> <button class="btn small text" type="button" id="close-n">Abbrechen</button></div>`:''}`;
      if(t.ph==='lobby'){
        h+=`${lobbyLiveHTML()}${dashHTML()}<div class="panel stack"><h3>So läuft eine Runde</h3><ol style="margin:0;padding-left:1.2em"><li>Ereignis am Beamer zeigen, die Schüler lesen auf dem Handy, was es für ihre Figur bedeutet.</li><li>Debatte aus Sicht der Figuren.</li><li>Abstimmung ${liveOk?'auf den Handys – die Stimmen erscheinen hier live':'per Stimmkarte'}, dann Beschluss verkünden.</li></ol>
        <div class="cta"><button class="btn primary" type="button" id="go">Runde 1 starten<span class="ms trail">arrow_forward</span></button></div></div>`;
      }else if(t.ph==='event'){
        h+=`<div class="row"><span class="yr">${R.y}</span><h3 style="font-size:1.5rem">${esc(R.t)}</h3><span class="tagx">${R.real?'echte Lage':'Szenario'}</span></div>
        ${crisisHTML(simulate(t.decs.concat(['A']))[t.r])}
        <div class="grid2"><div class="stack">${photoHTML(t.r)}${postHTML(R)}<p style="font-size:1.1rem">${esc(R.txt)}</p><p class="small">Auswirkung aufs Sechseck: ${hexPillsHTML(R.ops.hex)}</p></div>
        <div class="panel"><h3>So trifft es die Figuren</h3>${figsTableHTML(t.decs.concat(['A']),t.r,false)}</div></div>
        ${dashHTML()}
        <div class="cta"><button class="btn primary" type="button" id="go">Abstimmung starten<span class="ms trail">arrow_forward</span></button></div>`;
      }else if(t.ph==='vote'){
        const lv=liveOk?liveVotes():{A:0,B:0,C:0};
        const tot={A:t.tally.A+lv.A,B:t.tally.B+lv.B,C:t.tally.C+lv.C};
        h+=`<div class="row"><span class="yr">${R.y}</span><h3 style="font-size:1.3rem">${esc(R.q)}</h3></div>
        <div class="opts">${R.opts.map(o=>`<div class="opt" style="--oc:${OPTC[o.k]};cursor:default"><span class="lt"><span class="letter">${o.k}</span><b>${esc(o.t)}</b></span><span class="small">${esc(o.d)}</span><span>${hexPillsHTML(o.ops.hex)}${o.ops.debt>0?' <span class="pill amb"><span class="ms">trending_up</span>Schulden</span>':''}</span>
          <div class="tally"><button class="icon-btn" type="button" data-dn="${o.k}" aria-label="Stimme weniger für ${o.k}"><span class="ms">remove</span></button><span class="cnt">${tot[o.k]}</span><button class="icon-btn" type="button" data-up="${o.k}" aria-label="Stimme mehr für ${o.k}" style="background:var(--md-secondary-container);color:var(--md-on-secondary-container)"><span class="ms">add</span></button>${liveOk?`<span class="small muted">davon live: ${lv[o.k]}</span>`:''}</div></div>`).join('')}</div>
        ${dashHTML()}
        <details class="panel" ${t.show?'open':''} id="who"><summary><b>Wer gewinnt, wer verliert?</b> <span class="small muted">(erst nach der Debatte aufklappen)</span></summary>${optMatrixHTML(t.decs,t.r)}</details>
        <div class="cta" id="dec"></div>`;
      }else if(t.ph==='result'){
        const sim=simulate(t.decs),rd=sim[t.r],o=R.opts.find(x=>x.k===rd.d);
        h+=`<div class="row"><span class="yr">${R.y}</span><span class="letter" style="--oc:${OPTC[o.k]}">${o.k}</span><h3 style="font-size:1.4rem">Der Bundestag beschließt: ${esc(o.t)}</h3></div>
        <div class="grid2"><div class="panel chart"><h3>Klassen-Sechseck</h3>${radar([{v:rd.hex0,stroke:'var(--muted)',dash:'6 5',fo:0},{v:rd.after.hex,stroke:'var(--accent)',fill:'var(--accent)',fo:.2}],{label:'Sechseck vor und nach dem Beschluss'})}
          ${debtHTML(rd.after.debt)}</div>
        <div class="panel"><h3>Die Figuren nach dem Beschluss</h3>${figsTableHTML(t.decs,t.r,true)}
          ${realHTML(o)}
          <details class="panel" style="margin-top:8px"><summary><b>Diskussionsfrage:</b> Welche Zielbeziehung zeigt dieser Beschluss? <span class="small muted">(Lösung)</span></summary><p style="margin-top:6px"><b>${esc(o.chk.a)}.</b> ${esc(o.chk.why)}</p></details>
          ${liveOk?'':`<div class="fb neu" style="margin-top:8px">Die Schüler tippen jetzt <b>${o.k}</b> ein. Wer eine Runde verpasst hat, gibt den Klassencode ein: <span class="code">${t.decs.join('')}</span></div>`}</div></div>
        ${dashHTML()}
        <div class="cta"><button class="btn primary" type="button" id="go">${t.r<3?'Nächste Runde<span class="ms trail">arrow_forward</span>':'Zur Abschlussbilanz<span class="ms trail">arrow_forward</span>'}</button><span class="small muted">Die Schüler machen jetzt den Fachbegriff-Check und ihre private Entscheidung.</span></div>`;
      }else if(t.ph==='end'){
        const fin=simulate(t.decs)[3];const all=FIG.map(f=>({f,t:figTrack(f,t.decs,[],[])})).sort((a,b)=>b.t.policy-a.t.policy);
        h+=`<div class="panel"><h3>Abschlussbilanz der Klasse</h3><p class="small muted">Beschlüsse: ${t.decs.map((d,i)=>`${ROUNDS[i].y}: ${d} – ${esc(ROUNDS[i].opts.find(o=>o.k===d).t)}`).join(' · ')}</p></div>
        <div class="grid2"><div class="panel chart"><h3>Sechseck 2026 → 2029</h3>${radar([{v:START.de.v,stroke:'var(--muted)',dash:'6 5',fo:0},{v:fin.after.hex,stroke:'var(--accent)',fill:'var(--accent)',fo:.2}],{label:'Sechseck am Anfang und am Ende'})}
          ${debtHTML(fin.after.debt)}</div>
        <div class="panel"><h3>Gewinner und Verlierer (Figuren)</h3><div class="tbl-wrap"><table><thead><tr><th>Figur</th><th class="r">Politik-Effekt in 4 Jahren</th><th>Stimmung</th><th>Ziel</th></tr></thead><tbody>${all.map(a=>{const [ml,mc]=moodLabel(a.t.mood);return `<tr><td>${esc(a.f.n)} <span class="small muted">${esc(a.f.job.split(',')[0])}</span></td><td class="r num ${a.t.policy>=0?'pos':'neg'}"><b>${sgnE(a.t.policy)}</b></td><td><span class="pill ${mc}">${ml}</span></td><td>${a.t.goalOk?'<span class="pill ok">erreicht</span>':'<span class="pill bad">verfehlt</span>'}</td></tr>`}).join('')}</tbody></table></div></div></div>
        ${dashHTML()}
        <div class="panel"><h3>Auswertungsfragen</h3><ul><li>War unsere Politik gerecht – und für wen?</li><li>Welche Figur hat am meisten verloren, obwohl das Sechseck insgesamt besser wurde (oder umgekehrt)?</li><li>Wo wurden Zielkonflikte zu Interessenkonflikten zwischen euch?</li><li>Wer bezahlt den gestiegenen Schuldenstand?</li></ul></div>`;
      }
      app.innerHTML=h;bindPhoto(app);
      $('#bk',app).addEventListener('click',()=>{cleanup();menu()});
      $('#reset',app).addEventListener('click',()=>{$('#reset-q',app).hidden=false});
      $('#reset-n',app).addEventListener('click',()=>{$('#reset-q',app).hidden=true});
      $('#reset-y',app).addEventListener('click',()=>{t=newT();persist();pushState();render()});
      $('#mkroom',app)?.addEventListener('click',createRoom);
      $('#anon',app)?.addEventListener('click',()=>{t.anon=!t.anon;persist();render()});
      $('#close',app)?.addEventListener('click',()=>{confirmClose=true;render()});
      $('#close-n',app)?.addEventListener('click',()=>{confirmClose=false;render()});
      $('#close-y',app)?.addEventListener('click',closeRoom);
      $$('[data-kick]',app).forEach(b=>b.addEventListener('click',()=>live.kick(t.code,b.dataset.kick).catch(e=>console.warn(e))));
      const go=$('#go',app);
      if(t.ph==='lobby')go.addEventListener('click',()=>{t.ph='event';persist();pushState();render();top()});
      if(t.ph==='event')go.addEventListener('click',()=>{t.ph='vote';t.tally={A:0,B:0,C:0};t.show=false;persist();pushState();render();top()});
      if(t.ph==='vote'){
        $$('[data-up]',app).forEach(b=>b.addEventListener('click',()=>{t.tally[b.dataset.up]++;persist();render()}));
        $$('[data-dn]',app).forEach(b=>b.addEventListener('click',()=>{const k=b.dataset.dn;t.tally[k]=Math.max(0,t.tally[k]-1);persist();render()}));
        $('#who',app).addEventListener('toggle',e=>{t.show=e.target.open;persist()});
        const lv=liveOk?liveVotes():{A:0,B:0,C:0};
        const tot={A:t.tally.A+lv.A,B:t.tally.B+lv.B,C:t.tally.C+lv.C};
        const mx=Math.max(tot.A,tot.B,tot.C),win=['A','B','C'].filter(k=>tot[k]===mx&&mx>0);
        const dec=$('#dec',app);
        dec.innerHTML=!mx?'<span class="small muted">Noch keine Stimmen.</span>':win.length===1?`<button class="btn primary" type="button" data-win="${win[0]}">Beschluss verkünden: ${win[0]}<span class="ms trail">arrow_forward</span></button>`:`<span class="small">Gleichstand – du entscheidest:</span>${win.map(k=>`<button class="btn primary" type="button" data-win="${k}">${k}</button>`).join('')}`;
        $$('[data-win]',dec).forEach(b=>b.addEventListener('click',()=>{t.decs[t.r]=b.dataset.win;t.decs=t.decs.slice(0,t.r+1);t.ph='result';persist();pushState();render();top()}));
      }
      if(t.ph==='result')go.addEventListener('click',()=>{t.r++;t.ph=t.r>=4?'end':'event';persist();pushState();render();top()});
    }
    attach();
  }

  menu();
  if(pendingJoin){waiting('Verbinde mit dem Klassenraum …');liveReady.then(L=>{if(document.body.contains(app))player('schueler',L)})}
  bindErk(root);
}});

/* Glossar */
const GLOSS=[
  ['Angebotsschock','Plötzliche Verteuerung oder Verknappung von Produktionsfaktoren (z. B. Energie). Führt zu steigenden Preisen bei sinkender Produktion.'],
  ['Armutsgefährdungsquote','Anteil der Menschen mit weniger als 60 % des mittleren (Median-)Einkommens. 2025: 16,1 %.'],
  ['Arbeitslosenquote','Registrierte Arbeitslose in Prozent aller zivilen Erwerbspersonen (Definition der Bundesagentur für Arbeit).'],
  ['Außenwirtschaftliches Gleichgewicht','Annähernd ausgeglichene Leistungsbilanz; gemessen als Saldo in % des BIP.'],
  ['Bruttoinlandsprodukt (BIP)','Wert aller im Inland in einem Jahr hergestellten Waren und Dienstleistungen (nach Abzug der Vorleistungen).'],
  ['Deflation','Anhaltendes Sinken des Preisniveaus. Gefährlich, weil Konsumenten Käufe aufschieben.'],
  ['Disinflation','Rückgang der Inflationsrate; die Preise steigen weiter, aber langsamer.'],
  ['Emissionshandel','Obergrenze für Emissionen plus handelbare Zertifikate; der Markt bestimmt den CO₂-Preis.'],
  ['Entkopplung','Wirtschaft wächst, während der Ressourcenverbrauch oder die Emissionen sinken.'],
  ['Externe Effekte','Kosten oder Nutzen, die Dritte tragen, ohne dass sie im Marktpreis enthalten sind (z. B. Klimaschäden).'],
  ['Fiskalpolitik','Wirtschaftspolitik über Staatseinnahmen und -ausgaben (Steuern, Investitionen, Transfers).'],
  ['Geldpolitik','Steuerung von Geldmenge und Zinsen durch die Zentralbank, im Euroraum durch die EZB.'],
  ['Gini-Koeffizient','Maß für Ungleichheit zwischen 0 (Gleichverteilung) und 1 (eine Person besitzt alles).'],
  ['HVPI','Harmonisierter Verbraucherpreisindex – europaweit vergleichbare Inflationsmessung; Grundlage für die EZB.'],
  ['Kerninflation','Inflationsrate ohne die schwankungsanfälligen Bereiche Energie und Nahrungsmittel.'],
  ['Konjunktur','Schwankungen der wirtschaftlichen Aktivität um den langfristigen Wachstumstrend.'],
  ['Leistungsbilanz','Erfasst Waren- und Dienstleistungsverkehr sowie Primär- und Sekundäreinkommen mit dem Ausland.'],
  ['Leitzins','Zinssatz, zu dem sich Banken bei der Zentralbank Geld leihen oder anlegen. Die EZB hob ihn im September 2026 an; der Einlagenzins liegt bei 2,50 %.'],
  ['Lorenzkurve','Grafik, die kumulierte Bevölkerungsanteile den kumulierten Einkommens- oder Vermögensanteilen gegenüberstellt.'],
  ['Magisches Viereck','Die vier Ziele des § 1 StabG von 1967.'],
  ['Magisches Sechseck','Viereck erweitert um gerechte Verteilung und Umweltschutz.'],
  ['Nominal / real','Nominal = in aktuellen Preisen; real = um Preisveränderungen bereinigt.'],
  ['Okunsches Gesetz','Faustregel: Steigt das Wachstum über den Trend, sinkt die Arbeitslosigkeit.'],
  ['Phillips-Kurve','Zusammenhang zwischen niedriger Arbeitslosigkeit und höherer Inflation.'],
  ['Primär- und Sekundärverteilung','Primär: Verteilung durch den Markt. Sekundär: nach staatlicher Umverteilung durch Steuern und Transfers.'],
  ['Produktionspotenzial','Wirtschaftsleistung bei normaler Auslastung aller Produktionsfaktoren.'],
  ['Reallohn','Lohn bereinigt um die Preisentwicklung; zeigt die tatsächliche Kaufkraft.'],
  ['Rezession','Rückgang der Wirtschaftsleistung; technische Rezession: zwei Quartale in Folge sinkendes BIP.'],
  ['Stabilitäts- und Wachstumsgesetz (StabG)','Gesetz von 1967, das Bund und Länder auf das gesamtwirtschaftliche Gleichgewicht verpflichtet.'],
  ['Stagflation','Gleichzeitig Stagnation (oder Rezession) und Inflation.'],
  ['Unterbeschäftigung','Registrierte Arbeitslose plus Menschen in Maßnahmen, Weiterbildung oder kurzfristiger Arbeitsunfähigkeit.'],
  ['Verbraucherpreisindex (VPI)','Misst die durchschnittliche Preisentwicklung eines festen Warenkorbs aller privaten Haushalte.'],
  ['Wägungsschema','Gewichtung der Güter im Warenkorb nach ihrem Anteil an den Konsumausgaben.'],
  ['Wechselkurs','Preis einer Währung in einer anderen, z. B. 1 € = 1,15 US-$.'],
  ['Zielharmonie / Zielkonflikt / Zielneutralität','Ziele fördern sich, behindern sich oder beeinflussen sich nicht.']
];
function openGlossar(){
  openModal('Begriffe nachschlagen',`<input type="search" id="gs" placeholder="Begriff suchen …" aria-label="Begriff suchen" style="width:100%;padding:9px 12px"><dl class="glossary panel" id="gl"></dl>`,root=>{
    const r=q=>{$('#gl',root).innerHTML=GLOSS.filter(([t,d])=>(t+d).toLowerCase().includes(q.toLowerCase())).map(([t,d])=>`<dt>${t}</dt><dd>${d}</dd>`).join('')||'<p class="muted">Kein Treffer.</p>'};
    $('#gs',root).addEventListener('input',e=>r(e.target.value));r('');$('#gs',root).focus()});
}
function openWissen(){
  openModal('Mein Sechseck-Wissen',`<p class="task">Hier sammeln sich die Merksätze, sobald ihr in einer Werkstatt die Erkenntnis aufdeckt. Zusammen ergeben sie euren Hefteintrag.</p><div class="panel" id="ws"></div><div class="row"><button class="btn small" id="ws-all" type="button">Alle anzeigen (Lehrkraft)</button><button class="btn small" id="ws-copy" type="button">Gesammelte Merksätze kopieren</button><span class="small muted" id="ws-msg"></span></div>`,root=>{
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
const CH={1:['Kapitel 1 – Grundlagen','Einstieg für alle'],2:['Kapitel 2 – Die sechs Ziele messen','Ideal als Gruppenpuzzle: eine Werkstatt pro Expertengruppe'],3:['Kapitel 3 – Zielbeziehungen','Harmonie, Konflikt, Neutralität'],4:['Kapitel 4 – Wirtschaftspolitik','Entscheiden und bewerten'],5:['Kapitel 5 – Planspiel','Allein oder als ganze Klasse'],6:['Kapitel 6 – Sichern','Wiederholung und Abiturvorbereitung']};
const DEST=[
  {id:'start',icon:'home',label:'Start',title:'Lernwerkstatt Magisches Sechseck'},
  {id:'ziele',icon:'hexagon',label:'Ziele',title:'Die sechs Ziele messen',ch:[2],desc:'Sechs Werkstätten: Warenkorb, Arbeitsmarkt, Konjunktur, Leistungsbilanz, Lorenzkurve, Klima'},
  {id:'abwaegen',icon:'balance',label:'Abwägen',title:'Zielbeziehungen und Politik',ch:[3,4],desc:'Zielkonflikte aufdecken, Phillips-Kurve prüfen, Politik simulieren, Deutschland bewerten'},
  {id:'spiel',icon:'sports_esports',label:'Planspiel',title:'Planspiel Sechseck-Leben',ch:[5],desc:'Acht Figuren aus Thüringen, vier Jahre Wirtschaftspolitik – allein oder als Klasse'},
  {id:'wissen',icon:'school',label:'Wissen',title:'Sichern und wiederholen',ch:[6],desc:'Abi-Check, Fachbegriffe und deine gesammelten Merksätze'}
];
const destOfTool=id=>{const t=TOOLS.find(x=>x.id===id);return t?(DEST.find(d=>(d.ch||[1]).includes(t.ch))||DEST[0]).id:'start'};
function navHTML(){return DEST.map(d=>`<button class="nav-item" type="button" data-dest="${d.id}" ${d.id===curView?'aria-current="page"':''}><span class="ind"><span class="ms">${d.icon}</span></span><span>${d.label}</span></button>`).join('')}
function renderNav(){['#rail-items','#nav-bar'].forEach(sel=>{const el=$(sel);el.innerHTML=navHTML();$$('[data-dest]',el).forEach(b=>b.addEventListener('click',()=>go(b.dataset.dest)))})}
function cardHTML(x){const done=MS[x.id]&&MS[x.id].every((_,i)=>msGot.has(x.id+'-'+i));
  return `<button class="card" type="button" data-tool="${x.id}"><span class="dots">${x.goals.map(hexDot).join('')}</span><h4>${x.title}</h4><p>${x.sub}</p>${done?'<span class="done"><span class="ms sm">check_circle</span>Erkenntnis gesichert</span>':''}<span class="go">Werkstatt öffnen<span class="ms sm">arrow_forward</span></span></button>`}
function chapterHTML(c,extra){const [h,t]=CH[c];return `<section class="chapter"><div class="chapter-h"><h3>${h}</h3><span class="tag">${t}</span></div><div class="cards">${TOOLS.filter(x=>x.ch==c).map(cardHTML).join('')}${extra||''}</div></section>`}
function startHTML(){
  return `<section class="banner"><img src="${PHOTOS[2]}" alt="Blick über das Saaletal auf Jena mit dem JenTower"><span class="credit">Foto: Lukas D. / Unsplash</span>
    <div class="banner-text"><p class="eyebrow">Stand der Daten: Oktober 2026</p><h2 style="font-size:clamp(1.5rem,3.6vw,2.25rem);line-height:1.2">Sechs Ziele sollen gleichzeitig gelten. Sie stehen sich gegenseitig im Weg.</h2></div></section>
  <section class="hero"><div class="hero-hex" id="hero-hex" aria-label="Das magische Sechseck – Ecken antippen für Steckbriefe">${heroHex()}</div>
    <div class="hero-text"><p class="body-l">Das Stabilitätsgesetz von 1967 verpflichtet Bund und Länder auf vier Ziele, Sozialstaat und Umweltschutz kommen als fünftes und sechstes hinzu. In dieser Werkstatt messt ihr jedes Ziel selbst, deckt Zielkonflikte auf und steuert die deutsche Wirtschaftspolitik.</p>
    <div class="lage">${ORDER.map(k=>`<button class="chip media" type="button" style="--gc:${gc(k)}" data-k="${k}"><img src="${GOAL_IMG[k].src}" alt="${esc(GOAL_IMG[k].alt)}"><span class="cbody"><span class="lbl">${hexDot(k)}${G[k].short}</span><b>${G[k].chip}</b><span class="sub">${G[k].chipLab}</span></span></button>`).join('')}</div>
    <p class="hint">Ecke im Sechseck oder Kennzahl antippen: Steckbrief bzw. passende Werkstatt öffnet sich.</p>
    <div class="cta"><button class="fab" type="button" id="cta-leben"><span class="ms">sports_esports</span>Planspiel starten</button></div></div></section>
  ${chapterHTML(1)}
  <section class="section-h"><h2>Dein Lernpfad</h2><p>Die Bereiche bauen aufeinander auf. „Ziele“ eignet sich für ein Gruppenpuzzle: Sechs Expertengruppen übernehmen je ein Ziel und stellen es danach den anderen vor. Jede Werkstatt endet mit einer Erkenntnis, die als Merksatz in „Mein Wissen“ landet – gesammelt ergibt das den Hefteintrag.</p></section>
  <div class="dest-cards">${DEST.slice(1).map(d=>`<button class="dest" type="button" data-dest="${d.id}"><span class="ic"><span class="ms">${d.icon}</span></span><span><span class="title-m">${d.label}</span><span class="small muted" style="display:block">${d.desc}</span></span></button>`).join('')}</div>`;
}
function sourcesHTML(){return `<section class="panel sources"><h3 class="title-m" style="color:var(--md-on-surface)">Quellen und Datenstand (gerundet, Oktober 2026)</h3><ul>
  <li>Destatis: Inflationsrate September 2026 (vorläufig), Jahresinflation 2025, BIP 2025 und Vorjahre, Armutsgefährdung 2025</li>
  <li>Bundesagentur für Arbeit: Arbeitsmarkt im September 2026; Regionaldirektion Sachsen-Anhalt-Thüringen, Juli 2026</li>
  <li>Gemeinschaftsdiagnose Herbst 2026 (24.09.2026): Prognosen BIP, Inflation, Arbeitslosenquote, Leistungsbilanz</li>
  <li>Umweltbundesamt: Treibhausgas-Emissionen in Deutschland (Stand Juli 2026)</li>
  <li>Gesetzestexte: § 1 StabG, Art. 20 und 20a GG, Art. 127 AEUV, Bundes-Klimaschutzgesetz</li>
  <li>Fotos: engin akyurt, Jacob Meissner, Lukas D., Md. Hasanuzzaman Himel, Yosuke Ota, Remy Gieling, Artem Labunsky, Wolfgang Weiser, Karsten Würth, Marcel Strauß – alle über Unsplash (Unsplash-Lizenz)</li></ul>
  <p>Modellwerkzeuge (Simulator, Planspiel, Bewertungsskalen) sind didaktische Vereinfachungen und keine Prognosen. Spielstände und Merksätze werden nur in diesem Browser gespeichert.</p>
  <div class="row"><button class="btn outlined small" id="reset" type="button"><span class="ms">restart_alt</span>Merksätze zurücksetzen</button><span id="reset-confirm" class="row" hidden><button class="btn primary small" id="reset-yes" type="button">Ja, alles zurücksetzen</button><button class="btn text small" id="reset-no" type="button">Abbrechen</button></span></div></section>`}
function renderView(){
  const v=$('#view'),d=DEST.find(x=>x.id===curView)||DEST[0];
  $('#view-title').textContent=d.title;
  if(curView==='start')v.innerHTML=startHTML();
  else if(curView==='spiel'){const t=TOOLS.find(x=>x.id==='leben');v.innerHTML=t.html();t.init(v);}
  else if(curView==='wissen')v.innerHTML=chapterHTML(6,`<button class="card" type="button" data-open="glossar"><span class="dots">${ORDER.map(hexDot).join('')}</span><h4>Begriffe nachschlagen</h4><p>${GLOSS.length} Fachbegriffe mit Suche</p><span class="go">Öffnen<span class="ms sm">arrow_forward</span></span></button><button class="card" type="button" data-open="wissen"><span class="dots">${ORDER.map(hexDot).join('')}</span><h4>Mein Sechseck-Wissen</h4><p>Alle Merksätze als Hefteintrag sammeln und kopieren</p><span class="go">Öffnen<span class="ms sm">arrow_forward</span></span></button>`)+sourcesHTML();
  else v.innerHTML=d.ch.map(c=>chapterHTML(c)).join('');
  $$('[data-tool]',v).forEach(b=>b.addEventListener('click',()=>openTool(b.dataset.tool)));
  $$('[data-open]',v).forEach(b=>b.addEventListener('click',()=>b.dataset.open==='glossar'?openGlossar():openWissen()));
  $$('[data-dest]',v).forEach(b=>b.addEventListener('click',()=>go(b.dataset.dest)));
  $$('#hero-hex .hexcorner',v).forEach(g=>{const f=()=>openSteckbrief(g.dataset.k);g.addEventListener('click',f);g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();f()}})});
  $$('.lage .chip',v).forEach(c=>c.addEventListener('click',()=>openTool(G[c.dataset.k].tool)));
  $('#cta-leben',v)?.addEventListener('click',()=>go('spiel'));
  if($('#reset',v)){
    $('#reset',v).addEventListener('click',()=>{$('#reset-confirm',v).hidden=false});
    $('#reset-no',v).addEventListener('click',()=>{$('#reset-confirm',v).hidden=true});
    $('#reset-yes',v).addEventListener('click',()=>{msGot=new Set();store('ms6-rel',[]);try{localStorage.removeItem('ms6-basket')}catch(e){}saveMs()});
  }
}
function go(id){
  if(!modal.hidden)closeModal(true);
  curView=DEST.find(d=>d.id===id)?id:'start';
  renderNav();renderView();window.scrollTo(0,0);
  try{history.replaceState(null,'','#'+curView)}catch(e){}
}
function openTool(id){
  if(id==='leben')return go('spiel');
  const t=TOOLS.find(x=>x.id===id);if(!t)return;
  const dest=destOfTool(id);if(dest!==curView){curView=dest;renderNav();renderView()}
  openModal(esc(t.title),t.html(),t.init);
  try{history.replaceState(null,'','#'+id)}catch(e){}
}

/* ---------- Start ---------- */
$('#btn-glossar').addEventListener('click',openGlossar);
$('#btn-wissen').addEventListener('click',openWissen);
const setFs=b=>{document.documentElement.classList.toggle('big',b);$('#btn-fs').setAttribute('aria-pressed',String(b));store('ms6-fs',b)};
$('#btn-fs').addEventListener('click',()=>setFs(!document.documentElement.classList.contains('big')));
if(store('ms6-fs'))setFs(true);
window.addEventListener('scroll',()=>$('#topbar').classList.toggle('scrolled',window.scrollY>4),{passive:true});
updMs();
const h0=(location.hash||'').slice(1);
const joinHash=h=>{const m=/^join=([A-Za-z0-9]+)/.exec(h);return m?normCode(m[1]):''};
window.addEventListener('hashchange',()=>{const c=joinHash((location.hash||'').slice(1));if(c){pendingJoin=c;go('spiel')}});
if(joinHash(h0)){pendingJoin=joinHash(h0);go('spiel')}
else if(DEST.find(d=>d.id===h0))go(h0);
else if(h0&&TOOLS.find(t=>t.id===h0)){go(destOfTool(h0));openTool(h0)}
else go('start');
})();
