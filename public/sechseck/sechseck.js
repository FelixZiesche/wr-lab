// Lernwerkstatt Magisches Sechseck: Werkstätten, Wissen und Planspiel „Sechseck-Leben“.
// Gerüst, Navigation und Planspiel-Mechanik kommen aus /shared/, hier stehen nur die Inhalte.
import { $, $$, fmt, sgn, clamp, esc, store, svgMass, svgHandy, innenBreite, beiBreite, zeigeHinweis } from '../shared/js/ui.js';
import { createWerkstatt } from '../shared/js/werkstatt.js';
import { schreibfeld, zuordnen, lueckentext, test as kurztest, wissenscheck, impuls, blitz, blitzAufloesung } from '../shared/js/aufgaben.js';
import { mountPlanspiel, joinHash, setPendingJoin } from '../shared/js/planspiel.js';
import { raum } from '../shared/js/lernraum.js';
import { ORDER, G, gc, hexPts, ptsStr, hexDot, radar, eckPos, START, GOAL_IMG } from './daten.js';
import { SPIEL, PHOTOS } from './leben.js';
import { HINWEISE, WAND, IMPULS } from './wand.js';
import { WISSENSCHECK } from './wissenscheck.js';

/* ---------- Merksätze ---------- */
const MS={
  nachrichten:['Ob eine Wirtschaftsnachricht gut oder schlecht ist, hängt oft davon ab, welches Ziel man anschaut und wen sie trifft. Was einem Ziel hilft, schadet häufig einem anderen – genau darum geht es im magischen Sechseck.'],
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
  phillips:['Die Phillips-Kurve beschreibt einen Zielkonflikt zwischen Preisniveaustabilität und Beschäftigung. Bei Angebotsschocks (Ölkrise 1973/74, Energiekrise 2022/23) können Inflation und Arbeitslosigkeit gleichzeitig steigen: Stagflation. In Deutschland zeigte sich das 2023: Inflation 5,9 %, BIP −1,0 %, mehr Arbeitslose.'],
  politik:['Jede wirtschaftspolitische Maßnahme hat Haupt- und Nebenwirkungen. Wirtschaftspolitik bedeutet daher, Ziele zu gewichten und Prioritäten zu setzen – das ist eine politische Wertentscheidung.'],
  leben:['Wirtschaftspolitische Entscheidungen treffen Menschen sehr unterschiedlich: Was dem Sechseck insgesamt hilft, kann für einzelne Gruppen teuer sein. Zielkonflikte sind deshalb immer auch Interessenkonflikte zwischen Menschen.'],
  check:['Ob ein Ziel „erreicht“ ist, hängt von der Messlatte ab. Zielmarken wie 2 % Inflation oder −65 % Treibhausgase sind politische Setzungen, die man begründen und kritisieren kann.'],
  sichern:['Das magische Sechseck ist ein Zielsystem: Weil sich nicht alle Ziele gleichzeitig erreichen lassen, muss Wirtschaftspolitik die Ziele gewichten und begründet Prioritäten setzen.']
};

/* ---------- Glossar ---------- */
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
  ['Inflation / Inflationsrate','Anhaltender Anstieg des Preisniveaus. Die Inflationsrate ist die Veränderung des Verbraucherpreisindex gegenüber dem Vorjahresmonat oder dem Vorjahr.'],
  ['Kalte Progression','Steigt der Lohn nur so stark wie die Preise, rutscht man trotzdem in einen höheren Steuersatz. Real bleibt dann weniger übrig. Der Staat gleicht das von Zeit zu Zeit aus, indem er den Steuertarif anpasst.'],
  ['Kerninflation','Inflationsrate ohne die schwankungsanfälligen Bereiche Energie und Nahrungsmittel.'],
  ['Klimageld','Idee: Die Einnahmen aus dem CO₂-Preis gehen als gleicher Betrag pro Kopf an alle zurück. Haushalte mit geringem Energieverbrauch profitieren davon. In Deutschland bisher nicht eingeführt.'],
  ['Konjunktur','Schwankungen der wirtschaftlichen Aktivität um den langfristigen Wachstumstrend.'],
  ['Kurzarbeit','Betriebe verkürzen vorübergehend die Arbeitszeit, statt Beschäftigte zu entlassen. Die Bundesagentur für Arbeit ersetzt einen Teil des Lohnausfalls: Das Kurzarbeitergeld beträgt 60 % des ausgefallenen Nettolohns, mit Kind 67 %.'],
  ['Leistungsbilanz','Erfasst Waren- und Dienstleistungsverkehr sowie Primär- und Sekundäreinkommen mit dem Ausland.'],
  ['Leitzins','Zinssatz, zu dem sich Banken bei der Zentralbank Geld leihen oder anlegen. Die EZB hob ihn im Juni und im September 2026 um je 0,25 Prozentpunkte an. Der Einlagenzins liegt seit September 2026 bei 2,50 %.'],
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
  ['Schuldenbremse','Regel im Grundgesetz (Art. 109 und 115 GG), die neue Schulden von Bund und Ländern begrenzt. In normalen Zeiten darf der Bund höchstens 0,35 % des BIP an neuen Krediten aufnehmen, seit 2025 auch die Länder zusammen 0,35 %. Im Abschwung ist etwas mehr erlaubt, im Aufschwung weniger. Ausnahmen gelten in Notlagen wie der Corona-Krise und seit März 2025 für Verteidigungsausgaben über 1 % des BIP. Dazu kommt ein Sondervermögen von 500 Mrd. € für die Infrastruktur.'],
  ['Stabilitäts- und Wachstumsgesetz (StabG)','Gesetz von 1967, das Bund und Länder auf das gesamtwirtschaftliche Gleichgewicht verpflichtet.'],
  ['Stagflation','Gleichzeitig Stagnation (oder Rezession) und Inflation.'],
  ['Unterbeschäftigung','Registrierte Arbeitslose plus Menschen in Maßnahmen, Weiterbildung oder kurzfristiger Arbeitsunfähigkeit.'],
  ['Verbraucherpreisindex (VPI)','Misst die durchschnittliche Preisentwicklung eines festen Warenkorbs aller privaten Haushalte.'],
  ['Wägungsschema','Gewichtung der Güter im Warenkorb nach ihrem Anteil an den Konsumausgaben.'],
  ['Wechselkurs','Preis einer Währung in einer anderen, z. B. 1 € = 1,15 US-$.'],
  ['Zielharmonie / Zielkonflikt / Zielneutralität','Ziele fördern sich, behindern sich oder beeinflussen sich nicht.']
];

/* ---------- Kapitel und Bereiche ---------- */
const CH={1:['Kapitel 1 – Grundlagen','Einstieg für alle'],2:['Kapitel 2 – Die sechs Ziele messen','Sechs Werkstätten, eine pro Ziel'],3:['Kapitel 3 – Zielbeziehungen','Harmonie, Konflikt, Neutralität'],4:['Kapitel 4 – Wirtschaftspolitik','Entscheiden und bewerten'],5:['Kapitel 5 – Planspiel','Allein oder als ganze Klasse'],6:['Kapitel 6 – Sichern','Wiederholung und Abiturvorbereitung']};
const DEST=[
  {id:'start',icon:'home',label:'Start',title:'Lernwerkstatt Magisches Sechseck',kurz:'Sechseck',render:startHTML},
  {id:'ziele',icon:'hexagon',label:'Ziele',title:'Die sechs Ziele messen',ch:[2],desc:'Sechs Werkstätten: Warenkorb, Arbeitsmarkt, Konjunktur, Leistungsbilanz, Lorenzkurve, Klima'},
  {id:'abwaegen',icon:'balance',label:'Abwägen',title:'Zielbeziehungen und Politik',ch:[3,4],desc:'Zielkonflikte aufdecken, Phillips-Kurve prüfen, Politik simulieren, Deutschland bewerten'},
  {id:'spiel',icon:'sports_esports',label:'Planspiel',title:'Planspiel Sechseck-Leben',ch:[5],tool:'leben',desc:'Acht Figuren aus Thüringen, vier Jahre Wirtschaftspolitik – allein oder als Klasse'},
  {id:'wissen',icon:'school',label:'Wissen',title:'Sichern und wiederholen',ch:[6],render:wissenHTML,desc:'Hefteintrag, Wissenscheck in drei Stufen, Fachbegriffe und deine gesammelten Merksätze'}
];

const W=createWerkstatt({
  thema:'sechseck',
  speicher:'ms6',
  logo:'<svg aria-hidden="true" width="40" height="40" viewBox="0 0 42 42"><polygon points="21,2 37.5,11.5 37.5,30.5 21,40 4.5,30.5 4.5,11.5" fill="none" stroke="var(--md-primary)" stroke-width="3"/><circle cx="21" cy="2.8" r="3.4" fill="var(--g-P)"/><circle cx="37.2" cy="11.7" r="3.4" fill="var(--g-B)"/><circle cx="37.2" cy="30.3" r="3.4" fill="var(--g-W)"/><circle cx="21" cy="39.2" r="3.4" fill="var(--g-A)"/><circle cx="4.8" cy="30.3" r="3.4" fill="var(--g-U)"/><circle cx="4.8" cy="11.7" r="3.4" fill="var(--g-V)"/></svg>',
  bereiche:DEST,
  kapitel:CH,
  merksaetze:MS,
  wissenTitel:'Mein Sechseck-Wissen',
  glossar:GLOSS,
  punkte:x=>x.goals.map(hexDot).join(''),
  hash(h){const c=joinHash(h);if(c){setPendingJoin(c);return 'spiel'}},
  beimZeigen(id,v){
    // Sechseck-Grafik in der Breite zeichnen, die wirklich da ist (Schriftgröße), bei Größenänderung neu
    const hx=$('#hero-hex',v);
    if(hx){const z=()=>{const k=document.activeElement?.closest?.('#hero-hex .hexcorner')?.dataset.k;hx.innerHTML=heroHex(hx);
      // Die ganze Ecke mit Beschriftung ist antippbar, auch die Lücke zwischen Punkt und Text
      $$('.hexcorner',hx).forEach(g=>{try{const b=g.getBBox();g.insertAdjacentHTML('afterbegin',`<rect x="${b.x-4}" y="${b.y-4}" width="${b.width+8}" height="${b.height+8}" fill="transparent"/>`)}catch(e){}});
      $$('.hexcorner',hx).forEach(g=>{const f=()=>openSteckbrief(g.dataset.k);g.addEventListener('click',f);g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();f()}})});
      if(k)$(`.hexcorner[data-k="${k}"]`,hx)?.focus({preventScroll:true})};
      z();beiBreite(hx,z)}
    $$('.lage .chip',v).forEach(c=>c.addEventListener('click',()=>openTool(G[c.dataset.k].tool)));
    $('#cta-leben',v)?.addEventListener('click',()=>go('spiel'));
    if($('#reset',v)){
      $('#reset',v).addEventListener('click',()=>{$('#reset-confirm',v).hidden=false});
      $('#reset-no',v).addEventListener('click',()=>{$('#reset-confirm',v).hidden=true});
      $('#reset-yes',v).addEventListener('click',()=>{store('ms6-rel',[]);try{localStorage.removeItem('ms6-basket')}catch(e){}W.resetWissen()});
    }
  }
});
const {tool,erkHTML,bindErk,openModal,openTool,go,chapterHTML}=W;

/* ---------- Sechseck-Grafik (Hero) ---------- */
function wrapText(str,max){const w=str.split(' ');const out=[];let cur='';w.forEach(x=>{if((cur+' '+x).trim().length>max&&cur){out.push(cur);cur=x}else cur=(cur+' '+x).trim()});if(cur)out.push(cur);return out}
// Keine Zeile nur mit einem kurzen Wort („und“): das letzte Wort der Zeile davor dazunehmen, wenn es passt
function ausgleichen(z,max){for(let i=1;i<z.length-1;i++)if(z[i].length<=4){const w=z[i-1].split(' ');if(w.length>1&&(w.at(-1)+' '+z[i]).length<=max){z[i]=w.pop()+' '+z[i];z[i-1]=w.join(' ')}}return z}
// Breit: Kurzname und Langname an jeder Ecke. Schmal (unter 480 px, z. B. Handy): nur Buchstabe und Kurzname,
// die Langnamen stehen im Steckbrief. Schrift gerendert mindestens 12 px (Handy) bzw. 14 px.
function heroHex(el){
  const w=innenBreite(el)||660,min=svgHandy()?12:14,kompakt=w<480;
  if(kompakt){
    const W=Math.floor(w),f=x=>Math.max(x,min),fl=f(15),r=Math.min(130,W*.35),ab=17+8,H=Math.round(2*r+2*(ab+fl)+16),cx=W/2,cy=H/2,p=hexPts(cx,cy,r);
    let s=`<svg viewBox="0 0 ${W} ${H}" role="group" aria-label="Magisches Sechseck mit sechs Zielen">`;
    s+=`<polygon points="${ptsStr(p)}" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2.5"/>`;
    for(let i=0;i<6;i++)for(let j=i+2;j<6;j++){ if(i===0&&j===5)continue; s+=`<line x1="${p[i][0]}" y1="${p[i][1]}" x2="${p[j][0]}" y2="${p[j][1]}" class="s-line" stroke-width="1" stroke-dasharray="3 5"/>`}
    s+=`<text x="${cx}" y="${cy-4}" text-anchor="middle" class="t-fg" font-size="${f(19)}" font-weight="700">Magisches</text><text x="${cx}" y="${cy+f(19)}" text-anchor="middle" class="t-fg" font-size="${f(19)}" font-weight="700">Sechseck</text>`;
    ORDER.forEach((k,i)=>{const [x,y]=p[i],q=eckPos(i,cx,cy,r,ab,{handy:true,fs:fl,W,txt:G[k].short});
      s+=`<g class="hexcorner" tabindex="0" role="button" data-k="${k}" aria-label="${k} ${esc(G[k].short)} – ${esc(G[k].name)}: Steckbrief öffnen">
      <circle class="dot" cx="${x}" cy="${y}" r="17" fill="${gc(k)}" stroke="var(--surface)" stroke-width="3"/>
      <text x="${x}" y="${y+5}" text-anchor="middle" fill="var(--md-on-g-${k})" font-size="${f(14)}" font-weight="700">${k}</text>
      <text x="${q.x}" y="${q.y}" text-anchor="middle" fill="${gc(k)}" class="t-halo" font-size="${fl}" font-weight="700">${esc(G[k].short)}</text></g>`});
    return s+'</svg>';
  }
  // Breite Fassung: viewBox 660 × 480 wie bisher, Schrift wächst mit, wenn die Grafik kleiner dargestellt wird
  const W=660,H=480,cx=330,cy=240,f=x=>+Math.max(x,min*W/w+.05).toFixed(1),fu=f(12),lh=fu*1.25;
  // Platz für 20 Zeichen der Untertitel neben den seitlichen Ecken
  const r=Math.min(145,(cx-20*fu*.52-6)/.866-30),zeichen=Math.floor((cx-.866*(r+30)-6)/(fu*.52));
  const p=hexPts(cx,cy,r);
  let s=`<svg viewBox="0 0 ${W} ${H}" role="group" aria-label="Magisches Sechseck mit sechs Zielen">`;
  s+=`<polygon points="${ptsStr(hexPts(cx,cy,r))}" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2.5"/>`;
  for(let i=0;i<6;i++)for(let j=i+2;j<6;j++){ if(i===0&&j===5)continue; s+=`<line x1="${p[i][0]}" y1="${p[i][1]}" x2="${p[j][0]}" y2="${p[j][1]}" class="s-line" stroke-width="1" stroke-dasharray="3 5"/>`}
  s+=`<text x="${cx}" y="${cy-6}" text-anchor="middle" class="t-fg" font-size="${f(21)}" font-weight="700">Magisches</text><text x="${cx}" y="${cy+f(21)-3}" text-anchor="middle" class="t-fg" font-size="${f(21)}" font-weight="700">Sechseck</text>`;
  s+=`<text x="${cx}" y="${cy+f(21)+fu+8}" text-anchor="middle" class="t-mu" font-size="${fu}">gestrichelt: Zielbeziehungen</text>`;
  ORDER.forEach((k,i)=>{
    const [x,y]=p[i]; const lp=hexPts(cx,cy,r+30)[i];
    const anchor=Math.abs(lp[0]-cx)<5?'middle':(lp[0]>cx?'start':'end');
    const lx=lp[0]+(anchor==='start'?-6:anchor==='end'?6:0);
    const sub=ausgleichen(wrapText(G[k].name,anchor==='middle'?28:zeichen),zeichen); if(G[k].since==='Erweiterung') sub.push('(Erweiterung)');
    const n=1+sub.length;
    const top= i===0 ? lp[1]-(n-1)*lh-2 : i===3 ? lp[1]+12 : lp[1]-((n-1)*lh)/2+5;
    s+=`<g class="hexcorner" tabindex="0" role="button" data-k="${k}" aria-label="${k} ${esc(G[k].short)} – ${esc(G[k].name)}: Steckbrief öffnen">
      <circle class="dot" cx="${x}" cy="${y}" r="17" fill="${gc(k)}" stroke="var(--surface)" stroke-width="3"/>
      <text x="${x}" y="${y+5}" text-anchor="middle" fill="var(--md-on-g-${k})" font-size="${f(14)}" font-weight="700">${k}</text>
      <text x="${lx}" y="${top}" text-anchor="${anchor}" fill="${gc(k)}" font-size="${f(16)}" font-weight="700">${esc(G[k].short)}</text>
      ${sub.map((ln,li)=>`<text x="${lx}" y="${top+(li+1)*lh}" text-anchor="${anchor}" class="t-mu" font-size="${fu}">${esc(ln)}</text>`).join(' ')}
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
    steckbriefHTML(k)+`<div class="row"><button class="btn primary" type="button" id="sb-go">Zur Werkstatt „${esc(W.tools.find(t=>t.id===G[k].tool).title)}“</button>
    ${ORDER.map(o=>o===k?'':`<button class="btn small" type="button" data-sb="${o}">${hexDot(o)} ${esc(G[o].short)}</button>`).join('')}</div>`,
    root=>{$('#sb-go',root).addEventListener('click',()=>openTool(G[k].tool));$$('[data-sb]',root).forEach(b=>b.addEventListener('click',()=>openSteckbrief(b.dataset.sb)))});
}

/* 1 Einstieg: Nachrichten-Blitzrunde, aufgelöst erst in „Hefteintrag und Kurztest“ */
const NEWS={id:'news-blitz',werkstatt:'nachrichten',verdeckt:true,
  titel:'Gute oder schlechte Nachricht für Deutschland? Entscheide aus dem Bauch. (Die Schlagzeilen sind erfunden.)',
  optionen:[{id:'gut',t:'Gut',icon:'thumb_up'},{id:'schlecht',t:'Schlecht',icon:'thumb_down'},{id:'beides',t:'Kommt drauf an',icon:'balance'}],
  karten:[
    {t:'„Die Preise steigen um 3,3 %, deine Ausbildungsvergütung nur um 2 %.“',r:'schlecht',e:'Dein Reallohn sinkt: Für dein Geld bekommst du weniger als vorher. Das Ziel stabiles Preisniveau ist verfehlt.'},
    {t:'„Die Inflation sinkt von 3,3 % auf 2 %.“',r:'gut',e:'Die Preise steigen nur noch so stark, wie es die EZB anstrebt (2 %). Gut für die Kaufkraft.'},
    {t:'„Der Tankrabatt macht Benzin um bis zu 17 Cent billiger.“',r:'beides',e:'Gut für alle, die tanken, etwa Pendler aus dem Weimarer Land. Aber dem Staat fehlen Steuereinnahmen, und billiger Sprit hilft dem Klima nicht. Ein Zielkonflikt.'},
    {t:'„In Thüringen finden 5.000 Arbeitslose wieder einen Job.“',r:'gut',e:'Mehr Beschäftigung heißt mehr Einkommen und mehr Steuern und Beiträge. Hier gibt es kaum einen Haken.'},
    {t:'„Deutschland verkauft so viel ins Ausland wie nie: Rekordüberschuss!“',r:'beides',e:'Exporte sichern Jobs, etwa in der Optik in Jena. Aber ein hoher Überschuss heißt: Andere Länder verschulden sich, es drohen Streit und Zölle. Das Ziel ist ein Gleichgewicht.'},
    {t:'„Die EZB erhöht den Leitzins.“',r:'beides',e:'Das bremst die Inflation, macht aber Kredite teurer – den Autokredit genauso wie den Kredit einer Firma, die investieren will. Das Wachstum leidet.'},
    {t:'„Mehr Menschen in Thüringen sind armutsgefährdet.“',r:'schlecht',e:'Die Verteilung wird ungleicher, und der Zusammenhalt leidet. Ein klares Minus für das Ziel gerechte Verteilung.'},
    {t:'„Die Treibhausgase sinken, weil Fabriken wegen der Krise weniger produzieren.“',r:'beides',e:'Gut für das Klima, schlecht für Wachstum und Jobs. Genau so sieht ein Zielkonflikt aus.'}]};
tool({id:'nachrichten',hinweise:HINWEISE.nachrichten,ch:1,goals:ORDER,title:'Gute Nachricht, schlechte Nachricht?',sub:'Acht Schlagzeilen – entscheide so schnell du kannst: Ist das gut für Deutschland? Die Auflösung kommt am Ende',
html(){return `<p class="task"><b>Auftrag:</b> Lies jede Schlagzeile und entscheide blitzschnell: gute Nachricht, schlechte Nachricht – oder kommt es darauf an? Nicht lange nachdenken! Ob du richtig lagst, erfährst du am Ende in „Hefteintrag und Kurztest“.</p>
${blitz(NEWS)}
${schreibfeld(WAND.nachrichten)}
${impuls(IMPULS.nachrichten)}
${erkHTML('nachrichten')}`},
init(root){bindErk(root)}});

/* 2 Grundlagen */
// Zuordnung Indikator → Ziel: Erklärung der Ziele hinter dem Hilfeknopf, Erklärung jeder Karte nach dem Prüfen
const ZIEL_INFO={
  P:'<p><b>Stabilität des Preisniveaus:</b> Die Preise sollen insgesamt nur langsam und gleichmäßig steigen. Die EZB strebt 2 % im Jahr an.</p>',
  B:'<p><b>Hoher Beschäftigungsstand:</b> Möglichst alle, die arbeiten wollen, sollen eine Stelle finden.</p>',
  W:'<p><b>Stetiges und angemessenes Wachstum:</b> Die Wirtschaft soll ohne starke Schwankungen wachsen und ihre Möglichkeiten ausschöpfen.</p>',
  A:'<p><b>Außenwirtschaftliches Gleichgewicht:</b> Was Deutschland vom Ausland einnimmt und dorthin zahlt, soll ungefähr ausgeglichen sein.</p>',
  U:'<p><b>Schutz der natürlichen Lebensgrundlagen:</b> Klima, Luft, Wasser und Böden sollen auch für künftige Generationen erhalten bleiben (Art. 20a GG).</p>',
  V:'<p><b>Gerechte Einkommens- und Vermögensverteilung:</b> Einkommen und Vermögen sollen nicht zu ungleich verteilt sein (Sozialstaatsprinzip).</p>'};
const INDIKATOREN=[
  {t:'Verbraucherpreisindex',f:'P',e:'Er misst, wie sich die Preise eines festen Warenkorbs verändern. Die Veränderung zum Vorjahr ist die Inflationsrate.'},
  {t:'Arbeitslosenquote',f:'B',e:'Anteil der registrierten Arbeitslosen an allen zivilen Erwerbspersonen – der wichtigste Indikator für die Beschäftigung.'},
  {t:'Veränderungsrate des realen BIP',f:'W',e:'Das reale BIP ist um Preissteigerungen bereinigt. Seine Veränderung zum Vorjahr ist das Wirtschaftswachstum.'},
  {t:'Leistungsbilanzsaldo in % des BIP',f:'A',e:'Er zeigt, ob Deutschland mehr aus dem Ausland einnimmt, als es dorthin zahlt. Ziel ist ein annähernd ausgeglichener Saldo.'},
  {t:'Gini-Koeffizient',f:'V',e:'Er misst, wie ungleich Einkommen oder Vermögen verteilt sind: 0 heißt alle gleich, 1 heißt eine Person hat alles.'},
  {t:'Treibhausgasemissionen in CO₂-Äquivalenten',f:'U',e:'Sie zeigen, ob Deutschland seine Klimaziele erreicht: −65 % bis 2030 gegenüber 1990.'},
  {t:'Unterbeschäftigung',f:'B',e:'Sie zählt auch Menschen in Weiterbildung oder Maßnahmen mit, die nicht als arbeitslos gelten. So zeigt sie die Lage am Arbeitsmarkt vollständiger.'},
  {t:'Armutsgefährdungsquote',f:'V',e:'Anteil der Menschen mit weniger als 60 % des mittleren Einkommens (2025: 16,1 %). Sie zeigt die Verteilung am unteren Rand.'}];
tool({id:'grundlagen',hinweise:HINWEISE.grundlagen,ch:1,goals:ORDER,title:'Sechseck-Baukasten',sub:'Vom magischen Viereck (1967) zum Sechseck: Ziele, Gesetze, Indikatoren, Akteure',
html(){return `
<p class="task"><b>Auftrag:</b> Startet beim Viereck von 1967 und erweitert es zum Sechseck. Klickt jede Ecke an und lest den Steckbrief. Ordnet anschließend die Indikatoren den Zielen zu.</p>
<div class="grid2">
  <div class="panel chart"><div class="row" style="justify-content:space-between;margin-bottom:6px"><h3 id="gl-h">1967: Das magische Viereck</h3>
  <button class="btn small primary" id="gl-toggle" type="button">Zum Sechseck erweitern</button></div><div id="gl-svg"></div></div>
  <div class="stack">
    <div class="quote"><b>§ 1 Stabilitäts- und Wachstumsgesetz (1967):</b> „Bund und Länder haben bei ihren wirtschafts- und finanzpolitischen Maßnahmen die Erfordernisse des gesamtwirtschaftlichen Gleichgewichts zu beachten. Die Maßnahmen sind so zu treffen, daß sie im Rahmen der marktwirtschaftlichen Ordnung gleichzeitig zur Stabilität des Preisniveaus, zu einem hohen Beschäftigungsstand und außenwirtschaftlichem Gleichgewicht bei stetigem und angemessenem Wirtschaftswachstum beitragen.“</div>
    <p class="small muted">Anlass für das Gesetz vom 8. Juni 1967 war die erste Rezession der Bundesrepublik 1966/67.</p>
    <div id="gl-ext" class="quote" hidden><b>Erweiterung:</b> Das Sozialstaatsprinzip (Art. 20 Abs. 1 GG) begründet das Ziel einer gerechten Einkommens- und Vermögensverteilung. Seit 1994 schützt der Staat nach Art. 20a GG „auch in Verantwortung für die künftigen Generationen die natürlichen Lebensgrundlagen“. Beide Ziele stehen nicht im StabG. Viele erweitern das Viereck heute um sie zum Sechseck. Ob sie gleichrangig neben den vier Zielen stehen sollten, ist umstritten.</div>
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
${zuordnen({id:'gl-indikatoren',frage:'Welcher Indikator misst welches Ziel?',faecher:ORDER.map(k=>({id:k,t:G[k].short,info:ZIEL_INFO[k]})),karten:INDIKATOREN})}
${schreibfeld(WAND.grundlagen)}
${impuls(IMPULS.grundlagen)}
${erkHTML('grundlagen')}`},
init(root){
  let six=false, sel='P';
  const draw=()=>{
    const m=svgMass($('#gl-svg',root),500),W=m.W,f=m.fs,fl=f(14),kompakt=m.handy||W<480;
    const r=kompakt?Math.min(120,W*.34):120,H=kompakt?Math.round(2*r+2*(29+fl)+12):380,cx=W/2,cy=kompakt?H/2:188,p=hexPts(cx,cy,r);
    const vis=six?ORDER:['P','B','W','A'];
    let s=`<svg viewBox="0 0 ${W} ${H}" role="group" aria-label="${six?'Magisches Sechseck':'Magisches Viereck'}">`;
    const poly=ORDER.map((k,i)=>vis.includes(k)?p[i]:null).filter(Boolean);
    s+=`<polygon points="${ptsStr(poly)}" fill="var(--accent-soft)" stroke="var(--accent)" stroke-width="2.5" style="transition:all .4s"/>`;
    ORDER.forEach((k,i)=>{
      const on=vis.includes(k);const [x,y]=p[i];const q=eckPos(i,cx,cy,r,kompakt?27:28,{handy:kompakt,fs:fl,W,txt:G[k].short});
      s+=`<g class="hexcorner" tabindex="${on?0:-1}" role="button" data-k="${k}" opacity="${on?1:.28}" aria-pressed="${sel===k}"${on?'':' aria-disabled="true"'} aria-label="${k} ${esc(G[k].short)} – ${esc(G[k].name)}">
        <circle class="dot" cx="${x}" cy="${y}" r="${sel===k?19:15}" fill="${on?gc(k):'none'}" stroke="${on?'var(--surface)':'var(--muted)'}" stroke-width="3" ${on?'':'stroke-dasharray="4 3"'}/>
        <text x="${x}" y="${y+5}" text-anchor="middle" fill="${on?'var(--md-on-g-'+k+')':'var(--muted)'}" font-size="${f(13)}" font-weight="700">${k}</text>
        <text x="${q.x}" y="${q.y}" text-anchor="${q.a}" fill="${on?gc(k):'var(--muted)'}" font-size="${fl}" font-weight="700">${G[k].short}</text></g>`;
    });
    s+=`<text x="${cx}" y="${cy+5}" text-anchor="middle" class="t-fg" font-size="${f(17)}" font-weight="700">${six?'6 Ziele':'4 Ziele'}</text></svg>`;
    $('#gl-svg',root).innerHTML=s;
    $$('.hexcorner',root).forEach(g=>{const f=()=>{if(!six&&['U','V'].includes(g.dataset.k))return;sel=g.dataset.k;draw()};g.addEventListener('click',f);g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();f();$(`#gl-svg .hexcorner[data-k="${g.dataset.k}"]`,root)?.focus()}})}); // neu gezeichnet: Fokus zurück auf die Ecke
    $('#gl-sb',root).innerHTML=steckbriefHTML(sel);
    $('#gl-h',root).textContent=six?'Heute: Das magische Sechseck':'1967: Das magische Viereck';
    $('#gl-toggle',root).textContent=six?'Zurück zum Viereck':'Zum Sechseck erweitern';
    $('#gl-ext',root).hidden=!six;
  };
  $('#gl-toggle',root).addEventListener('click',()=>{six=!six;if(!six&&['U','V'].includes(sel))sel='P';draw()});
  draw();beiBreite($('#gl-svg',root),draw);
  bindErk(root);
}});

/* 2 Preisniveau */
const BASKET=[
  {n:'Döner in Jena',q:4,p0:7.50,p1:8.00},
  {n:'Deutschlandticket (Monat)',q:1,p0:58.00,p1:63.00},
  {n:'Tankfüllung Roller/Auto, 10 l Super E10',q:2,p0:16.70,p1:22.70},
  {n:'Streaming-Abo',q:1,p0:6.99,p1:7.49},
  {n:'Kinoticket (Erfurt)',q:1,p0:11.00,p1:11.50},
  {n:'Matcha-Latte im Café',q:4,p0:4.90,p1:5.50},
  {n:'Buldak-Nudeln (Cup)',q:3,p0:2.49,p1:2.79},
  {n:'Energydrink 0,25 l',q:6,p0:1.69,p1:1.79},
  {n:'Handyvertrag',q:1,p0:14.99,p1:14.99},
  {n:'Brötchen beim Bäcker',q:10,p0:0.55,p1:0.58}
];
tool({id:'preis',hinweise:HINWEISE.preis,ch:2,goals:['P'],title:'Warenkorb-Werkstatt',sub:'Euren eigenen Preisindex berechnen, Reallohn und Kaufkraftverlust bestimmen',
html(){return `
<p class="task"><b>Auftrag:</b> Passt den Warenkorb an euer Leben an: Mengen pro Monat und Preise (letztes Jahr / heute). Die Werkstatt berechnet euren persönlichen Preisindex nach dem Verfahren des Statistischen Bundesamts (Laspeyres). Vergleicht mit der offiziellen Inflationsrate.</p>
<div class="grid2 wide-left">
  <div class="panel"><h3>Unser Warenkorb <span class="small muted">(Beispielpreise – ersetzt sie durch eure!)</span></h3>
  <p class="small muted pr-wisch" id="pr-wisch" hidden><span class="ms sm" aria-hidden="true">swipe_left</span>Zur Seite wischen: Rechts stehen die Preise 2026 und die Änderung.</p>
  <div class="tbl-wrap" id="pr-wrap"><table id="pr-tab"><thead><tr><th>Gut</th><th class="r"><span class="th-lang">Menge/Monat</span><span class="th-kurz">Menge</span></th><th class="r"><span class="th-lang">Preis 2025 (€)</span><span class="th-kurz">2025 €</span></th><th class="r"><span class="th-lang">Preis 2026 (€)</span><span class="th-kurz">2026 €</span></th><th class="r"><span class="th-lang">Änderung</span><span class="th-kurz">±</span></th></tr></thead><tbody id="pr-body"></tbody></table></div>
  <p class="small muted" style="margin-top:6px">Tankfüllung: Super E10 im Monatsmittel September 2025 und September 2026 (ADAC). Seit dem 1. Oktober 2026 macht der Tankrabatt den Liter um bis zu 17 Cent billiger.</p>
  <div class="row" style="margin-top:8px"><button class="btn small" id="pr-add" type="button"><span class="ms" aria-hidden="true">add</span>Eigenes Gut</button><button class="btn small" id="pr-reset" type="button"><span class="ms" aria-hidden="true">refresh</span>Beispielwerte laden</button></div></div>
  <div class="stack">
    <div class="panel"><p class="eyebrow">Euer Preisindex (2025 = 100)</p><div class="big-num" id="pr-idx">–</div>
    <p>Persönliche Inflationsrate: <b id="pr-rate" class="num">–</b></p>
    <p class="small muted" id="pr-cost"></p></div>
    <div class="panel chart"><h3>Inflations-Thermometer</h3><div id="pr-thermo"></div>
    <p class="small muted">Offiziell: 3,3 % (Sept. 2026), Energie +14,9 %, davon Kraftstoffe +37,1 % und Heizöl +74,9 %, Strom −5,5 %; Nahrungsmittel +0,4 %, Kerninflation 2,4 %.</p>
    <p class="small muted">Thüringen: 3,4 % (Sept. 2026); Sprit +37 %, Heizöl +53 %. Ohne Sprit und Heizöl wären es nur 2,0 %.</p></div>
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
<div class="panel"><h3>Hintergrund: So misst das Statistische Bundesamt</h3><p>Rund 300.000 Preise für etwa 650 Güterarten gehen monatlich in den Verbraucherpreisindex ein. Jedes Gut hat ein Gewicht nach seinem Anteil an den Ausgaben aller Haushalte (Wägungsschema, Basisjahr 2020) – Wohnen und Energie zählen am meisten. Weil jeder anders konsumiert, weicht die persönliche Inflation von der amtlichen ab: Wer viel tankt oder mit Heizöl heizt, spürt 2026 die Energiepreise stärker. Strom und Gas sind dagegen etwas billiger als 2025. Das Bundesamt bietet dafür einen <a href="https://www.destatis.de/DE/Service/InflationsRechner/inflationsrechner.html" target="_blank" rel="noopener">persönlichen Inflationsrechner</a>.</p>
<p style="margin-top:8px"><b>Begriffe:</b> Inflation (Preisniveau steigt) · Deflation (Preisniveau sinkt) · Disinflation (Preise steigen langsamer) · Kerninflation (ohne Energie und Nahrungsmittel) · Stagflation (Inflation bei Stagnation).</p></div>
${schreibfeld(WAND.preis)}
${impuls(IMPULS.preis)}
${erkHTML('preis')}`},
init(root){
  let items=store('ms6-basket')||BASKET.map(o=>({...o}));
  const body=$('#pr-body',root);
  const row=(o,i)=>`<tr><td><input class="pr-gut" type="text" value="${esc(o.n)}" data-i="${i}" data-f="n" aria-label="Gut"></td>
    <td class="r"><input type="number" min="0" step="1" value="${o.q}" data-i="${i}" data-f="q" aria-label="Menge"></td>
    <td class="r"><input type="number" min="0" step="0.01" value="${o.p0}" data-i="${i}" data-f="p0" aria-label="Preis 2025"></td>
    <td class="r"><input type="number" min="0" step="0.01" value="${o.p1}" data-i="${i}" data-f="p1" aria-label="Preis 2026"></td>
    <td class="r num" data-ch="${i}"></td></tr>`;
  // Handy: Passt die Tabelle nicht ganz hinein, sagt ein Hinweis, dass rechts noch Spalten kommen
  const wisch=()=>{const w=$('#pr-wrap',root);$('#pr-wisch',root).hidden=!(w.scrollWidth>w.clientWidth+2)};
  const renderRows=()=>{body.innerHTML=items.map(row).join('');calc();wisch()};
  const calc=()=>{
    let c0=0,c1=0;items.forEach(o=>{c0+=o.q*o.p0;c1+=o.q*o.p1});
    items.forEach((o,i)=>{const el=$(`[data-ch="${i}"]`,body);if(el){const ch=o.p0>0?(o.p1/o.p0-1)*100:0;el.textContent=sgn(ch)+' %';el.style.color=ch>0.05?'var(--bad)':ch<-0.05?'var(--ok)':'var(--muted)'}});
    const idx=c0>0?c1/c0*100:100, rate=idx-100;
    $('#pr-idx',root).textContent=fmt(idx,1);
    $('#pr-rate',root).textContent=sgn(rate)+' %';
    $('#pr-cost',root).textContent=`Warenkorb kostet ${fmt(c0,2)} € (2025) und ${fmt(c1,2)} € (2026) pro Monat: ${sgn(c1-c0,2)} €.`;
    $('#pr-thermo',root).innerHTML=thermo(rate,$('#pr-thermo',root));
    // Beiträge
    const contr=items.map(o=>({n:o.n,v:c0>0?o.q*(o.p1-o.p0)/c0*100:0})).sort((a,b)=>Math.abs(b.v)-Math.abs(a.v));
    const mx=Math.max(0.5,...contr.map(c=>Math.abs(c.v)));
    const el=$('#pr-contrib',root),m=svgMass(el,640),W=m.W,fn=m.fs(12.5),fv=m.fs(11.5),kurz=(t,px)=>{const n=Math.floor(px/(fn*.53));return t.length>n?t.slice(0,n-1)+'…':t};
    let s;
    if(m.handy){
      // Handy: Name über dem Balken, Wert daneben (sonst bliebe für die Balken kein Platz)
      const rh=fn+26,x0=fv*3.6,x1=W-fv*3.6,zero=(x0+x1)/2,H=contr.length*rh+6;
      s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Beiträge der Güter zur Inflationsrate">`;
      contr.forEach((c,i)=>{const y=4+i*rh,w=(c.v/mx)*(x1-x0)/2,yb=y+fn+6;
        s+=`<line x1="${zero}" y1="${yb-3}" x2="${zero}" y2="${yb+17}" class="s-mu"/><text x="2" y="${y+fn}" class="t-fg" font-size="${fn}">${esc(kurz(c.n,W-4))}</text>
        <rect x="${w>=0?zero:zero+w}" y="${yb}" width="${Math.max(1,Math.abs(w))}" height="14" rx="3" fill="${c.v>=0?'var(--g-P)':'var(--ok)'}"/>
        <text x="${w>=0?zero+w+5:zero+w-5}" y="${yb+12}" text-anchor="${w>=0?'start':'end'}" class="t-mu num" font-size="${fv}">${sgn(c.v,2)}</text>`});
    }else{
      const rh=Math.max(24,fn+10),H=contr.length*rh+10,x0=Math.min(230,W*.42),x1=W-fv*4.2,zero=x0+(x1-x0)/2;
      s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Beiträge der Güter zur Inflationsrate">`;
      s+=`<line x1="${zero}" y1="0" x2="${zero}" y2="${H}" class="s-mu"/>`;
      contr.forEach((c,i)=>{const y=5+i*rh,w=(c.v/mx)*(x1-x0)/2,ym=y+rh/2;
        s+=`<text x="${x0-8}" y="${ym+fn*.36}" text-anchor="end" class="t-fg" font-size="${fn}">${esc(kurz(c.n,x0-12))}</text>
        <rect x="${w>=0?zero:zero+w}" y="${ym-8}" width="${Math.max(1,Math.abs(w))}" height="16" rx="3" fill="${c.v>=0?'var(--g-P)':'var(--ok)'}"/>
        <text x="${w>=0?zero+w+5:zero+w-5}" y="${ym+fv*.36}" text-anchor="${w>=0?'start':'end'}" class="t-mu num" font-size="${fv}">${sgn(c.v,2)}</text>`});
    }
    $('#pr-contrib',root).innerHTML=s+'</svg>';
    store('ms6-basket',items);
  };
  body.addEventListener('input',e=>{const t=e.target;const i=+t.dataset.i,f=t.dataset.f;if(!items[i])return;items[i][f]=f==='n'?t.value:Math.max(0,parseFloat(t.value)||0);calc()});
  $('#pr-add',root).addEventListener('click',()=>{items.push({n:'Neues Gut',q:1,p0:10,p1:10});renderRows()});
  $('#pr-reset',root).addEventListener('click',()=>{items=BASKET.map(o=>({...o}));renderRows()});
  renderRows();
  beiBreite($('#pr-contrib',root),calc);beiBreite($('#pr-thermo',root),()=>{calc();wisch()});
  const rl=()=>{const n=+$('#rl-n',root).value,i=+$('#rl-i',root).value;const r=((1+n/100)/(1+i/100)-1)*100;
    $('#rl-no',root).textContent=sgn(n)+' %';$('#rl-io',root).textContent=sgn(i)+' %';
    const el=$('#rl-r',root);el.textContent=sgn(r,2)+' %';el.style.color=r>=0?'var(--ok)':'var(--bad)';
    $('#rl-t',root).textContent=`Beispiel Ausbildungsvergütung 1.100 €: Nach der Erhöhung ${fmt(1100*(1+n/100),0)} € – das entspricht real ${fmt(1100*(1+r/100),0)} € in heutiger Kaufkraft. Genau: (1 + n) ÷ (1 + i) − 1; die Faustregel n − i ergibt ${sgn(n-i,1)} %.`};
  ['#rl-n','#rl-i'].forEach(s=>$(s,root).addEventListener('input',rl));rl();
  const kk=()=>{const i=+$('#kk-i',root).value,y=+$('#kk-y',root).value;$('#kk-io',root).textContent=fmt(i)+' %';$('#kk-yo',root).textContent=y;$('#kk-r',root).textContent=fmt(1000/Math.pow(1+i/100,y),0)+' €'};
  ['#kk-i','#kk-y'].forEach(s=>$(s,root).addEventListener('input',kk));kk();
  bindErk(root);
}});
// Zonen-Namen in zwei Reihen, damit sie sich auch bei großer Schrift nicht überlappen
function thermo(rate,el){
  const m=svgMass(el,520),W=m.W,fl=m.fs(11),x0=Math.max(20,fl*1.6),x1=W-x0,min=-2,max=10,sx=v=>x0+(clamp(v,min,max)-min)/(max-min)*(x1-x0);
  const r1=fl+2,r2=2*fl+6,yb=r2+6,yt=yb+16+fl+4,H=yt+28;
  const zones=[[-2,0,'var(--g-B)','Deflation'],[0,1.5,'var(--neu)','niedrig'],[1.5,2.5,'var(--ok)','Zielbereich'],[2.5,5,'var(--amb)','erhöht'],[5,10,'var(--bad)','hoch']];
  let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Inflationsrate ${fmt(rate)} Prozent auf einer Skala">`;
  zones.forEach(([a,b,c,l],i)=>{const hw=l.length*fl*.28+2,x=clamp((sx(a)+sx(b))/2,hw,W-hw);
    s+=`<rect x="${sx(a)}" y="${yb}" width="${sx(b)-sx(a)}" height="16" fill="${c}" opacity=".75"/><text x="${x}" y="${i%2?r2:r1}" text-anchor="middle" class="t-mu" font-size="${fl}">${l}</text>`});
  [-2,0,2,4,6,8,10].forEach(v=>{s+=`<text x="${sx(v)}" y="${yt}" text-anchor="middle" class="t-mu num" font-size="${fl}">${v<0?'−'+-v:v} %</text>`});
  s+=`<line x1="${sx(2)}" y1="${yb-4}" x2="${sx(2)}" y2="${yb+20}" class="s-fg" stroke-width="2"/>`;
  const x=sx(rate);s+=`<polygon points="${x-8},${H-2} ${x+8},${H-2} ${x},${yt+6}" fill="var(--fg)"/>`;
  return s+'</svg>';
}

/* 3 Beschäftigung */
// Fälle zur Arbeitslosigkeit: Erklärung der Arten hinter dem Hilfeknopf, Erklärung jedes Falls nach dem Prüfen
const ARTEN_AL=[
  {id:'friktionell',t:'Friktionell',info:'<p><b>Sucharbeitslosigkeit</b> beim Wechsel zwischen zwei Stellen. Sie dauert meist nur kurz und lässt sich kaum vermeiden, weil Suchen und Bewerben Zeit brauchen.</p>'},
  {id:'saisonal',t:'Saisonal',info:'<p>Arbeitslosigkeit, die von der <b>Jahreszeit</b> abhängt, zum Beispiel vom Wetter auf dem Bau oder vom Tourismus. Sie kommt jedes Jahr wieder und verschwindet von selbst.</p>'},
  {id:'konjunkturell',t:'Konjunkturell',info:'<p>Folge einer <b>allgemein schwachen Nachfrage im Abschwung</b>. Viele Branchen sind gleichzeitig betroffen. Zieht die Wirtschaft wieder an, entstehen neue Stellen.</p>'},
  {id:'strukturell',t:'Strukturell',info:'<p>Folge eines <b>dauerhaften Wandels</b> von Branchen, Regionen oder Anforderungen an die Qualifikation. Stellen und Arbeitslose passen nicht zusammen (Mismatch). Sie ist am hartnäckigsten.</p>'}];
const CASES=[
  {t:'Lena (24) hat ihr BWL-Studium in Jena beendet und schickt seit fünf Wochen Bewerbungen. Passende Stellen gibt es genug.',f:'friktionell',e:'Stellen sind da, Lena braucht nur Zeit für die Suche.'},
  {t:'Marco (38), Dachdecker aus Apolda, ist im Januar ohne Arbeit, weil bei Frost nicht gebaut werden kann.',f:'saisonal',e:'Das Wetter bremst den Bau nur im Winter. Im Frühjahr gibt es wieder Arbeit.'},
  {t:'Uwe (55) fertigt bei einem Autozulieferer in Eisenach Teile für Verbrennungsmotoren. Weil immer mehr E-Autos gebaut werden, fällt seine Stelle dauerhaft weg.',f:'strukturell',e:'Die Branche wandelt sich dauerhaft. Uwes Stelle kommt auch im nächsten Aufschwung nicht zurück.'},
  {t:'Kevin (31) arbeitet bei einem Maschinenbauer in Gotha. Wegen einer weltweiten Rezession brechen die Aufträge ein, er und 79 Kollegen werden entlassen.',f:'konjunkturell',e:'Ursache ist die schwache Nachfrage im Abschwung. Zieht die Konjunktur wieder an, braucht der Betrieb wieder Leute.'},
  {t:'Jana (27) arbeitet im Sommer in einer Eisdiele am Erfurter Domplatz. Im Winter schließt die Eisdiele, und Jana ist arbeitslos.',f:'saisonal',e:'Die Arbeit hängt an der Jahreszeit: Eis wird vor allem im Sommer gekauft.'},
  {t:'Petra (52), Sachbearbeiterin in Gera, verliert ihre Stelle, weil eine KI-Software die Rechnungsprüfung übernimmt. Für die neuen IT-Jobs fehlt ihr die Qualifikation.',f:'strukturell',e:'Technischer Wandel: Ihre Qualifikation passt nicht mehr zu den offenen Stellen (Mismatch). Helfen würde eine Umschulung.'},
  {t:'Tom (33), Koch in Weimar, kündigt, um in Leipzig zu arbeiten. Die neue Stelle beginnt erst in sechs Wochen.',f:'friktionell',e:'Eine kurze Lücke beim Wechsel zwischen zwei Stellen.'},
  {t:'Sandra (41) arbeitet in einem Modegeschäft in Jena. Weil im ganzen Land die Leute wegen hoher Preise sparen, baut der Laden Personal ab, und sie wird entlassen.',f:'konjunkturell',e:'Die Nachfrage sinkt überall gleichzeitig. Das ist ein Abschwung und kein dauerhafter Wandel der Branche.'}
];
tool({id:'beschaeftigung',hinweise:HINWEISE.beschaeftigung,ch:2,goals:['B'],title:'Arbeitsmarkt-Werkstatt',sub:'Arbeitslosenquote berechnen, Arten der Arbeitslosigkeit erkennen, Thüringen vergleichen',
html(){return `
<p class="task"><b>Auftrag:</b> Berechnet die Arbeitslosenquote für Deutschland und Thüringen. Ordnet danach acht Fälle den Arten der Arbeitslosigkeit zu und überlegt, welche Politik jeweils helfen würde.</p>
<div class="grid2">
  <div class="panel"><h3>Quoten-Rechner</h3>
   <div class="row" style="margin-bottom:8px"><button class="btn small" data-preset="de" type="button">Deutschland, Sept. 2026</button><button class="btn small" data-preset="th" type="button">Thüringen, Sept. 2026</button><button class="btn small" data-preset="vb" type="button">Vollbeschäftigung?</button></div>
   <div class="ctrl"><label for="al-a">Registrierte Arbeitslose (Tsd.) <output id="al-ao"></output></label><input type="range" id="al-a" min="20" max="5000" step="1" value="2994"></div>
   <div class="ctrl"><label for="al-e">Erwerbstätige (Tsd., zivil, Bezugsgröße) <output id="al-eo"></output></label><input type="range" id="al-e" min="500" max="48000" step="1" value="43790"></div>
   <p style="margin-top:6px">Arbeitslosenquote = <span class="mono small">Arbeitslose ÷ (Erwerbstätige + Arbeitslose) × 100</span></p>
   <div class="big-num" id="al-q">–</div><div id="al-g" class="chart"></div></div>
  <div class="panel"><h3>Mehr als eine Zahl</h3><dl class="kv">
   <dt>Registriert</dt><dd>knapp 3,0 Mio. Arbeitslose (Sept. 2026), 40.000 mehr als vor einem Jahr</dd>
   <dt>Unterbeschäftigung</dt><dd>3,6 Mio. – zählt auch Menschen in Weiterbildung, Maßnahmen oder kurzfristiger Arbeitsunfähigkeit mit</dd>
   <dt>Kurzarbeit</dt><dd>rund 118.000 Beschäftigte erhielten im Juli 2026 konjunkturelles Kurzarbeitergeld (neuere Zahlen gibt es noch nicht)</dd>
   <dt>Offene Stellen</dt><dd>660.000 gemeldet – gleichzeitig Fachkräftemangel und Arbeitslosigkeit</dd>
   <dt>ILO-Konzept</dt><dd>Die international vergleichbare Erwerbslosenquote liegt deutlich niedriger, weil sie u. a. Menschen mit Minijob nicht als erwerbslos zählt</dd>
   <dt>Thüringen</dt><dd>6,3 % (Sept. 2026), rund 69.000 Arbeitslose; gut jeder Dritte ist langzeitarbeitslos, gut jeder Dritte ist 50 oder älter</dd></dl>
   <p class="small muted" style="margin-top:8px">BA-Chefin Andrea Nahles im September 2026: Die wirtschaftliche Verbesserung kommt am Arbeitsmarkt noch nicht an.</p></div>
</div>
${zuordnen({id:'al-arten',frage:'Welche Art von Arbeitslosigkeit liegt vor? Was die vier Arten bedeuten, verrät das Fragezeichen an jedem Fach.',faecher:ARTEN_AL,karten:CASES})}
${schreibfeld(WAND.beschaeftigung)}
${impuls(IMPULS.beschaeftigung)}
${erkHTML('beschaeftigung')}`},
init(root){
  // Thüringen: 69.052 Arbeitslose bei 6,3 % (BA, Sept. 2026); Erwerbstätige daraus abgeleitet
  const PR={de:[2994,43790],th:[69,1027],vb:[1300,44500]};
  const upd=()=>{const a=+$('#al-a',root).value,e=+$('#al-e',root).value;const q=a/(a+e)*100;
    $('#al-ao',root).textContent=fmt(a,0);$('#al-eo',root).textContent=fmt(e,0);$('#al-q',root).textContent=fmt(q,1)+' %';
    // „Vollbeschäftigung“ steht über dem schmalen Feld 0 bis 3 % in einer eigenen Reihe, linksbündig (ragt nicht aus dem Bild)
    const el=$('#al-g',root),m=svgMass(el,520),W=m.W,fl=m.fs(10.5),x0=Math.max(16,fl*1.4),x1=W-x0,mx=15,sx=v=>x0+clamp(v,0,mx)/mx*(x1-x0);
    const r1=fl+1,r2=2*fl+5,yb=r2+5,yt=yb+12+fl+4,H=yt+18;
    let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Arbeitslosenquote auf Skala">`;
    [[0,3,'var(--ok)','Vollbeschäftigung (Faustregel)'],[3,6,'var(--amb)','mittel'],[6,15,'var(--bad)','hoch']].forEach(([a,b,c,l],i)=>{s+=`<rect x="${sx(a)}" y="${yb}" width="${sx(b)-sx(a)}" height="12" fill="${c}" opacity=".7"/>`+
      (i?`<text x="${(sx(a)+sx(b))/2}" y="${r2}" text-anchor="middle" class="t-mu" font-size="${fl}">${l}</text>`:`<text x="${sx(a)}" y="${r1}" class="t-mu" font-size="${fl}">${l}</text>`)});
    [0,3,6,9,12,15].forEach(v=>s+=`<text x="${sx(v)}" y="${yt}" text-anchor="${v?'middle':'start'}" class="t-mu" font-size="${fl}">${v} %</text>`);
    const x=sx(q);s+=`<polygon points="${x-7},${H-2} ${x+7},${H-2} ${x},${yt+4}" fill="var(--fg)"/>`;
    el.innerHTML=s+'</svg>'};
  $$('[data-preset]',root).forEach(b=>b.addEventListener('click',()=>{const [a,e]=PR[b.dataset.preset];
    const sa=$('#al-a',root),se=$('#al-e',root);if(b.dataset.preset==='th'){sa.min=5;se.min=200}sa.value=a;se.value=e;upd()}));
  ['#al-a','#al-e'].forEach(s=>$(s,root).addEventListener('input',upd));upd();beiBreite($('#al-g',root),upd);
  bindErk(root);
}});

/* 4 Wachstum */
// Reales BIP, preisbereinigt (Destatis nach der Überarbeitung im Juli/August 2026), * Prognose Gemeinschaftsdiagnose Herbst 2026
const BIP=[['2019',1.1],['2020',-4.0],['2021',4.0],['2022',1.9],['2023',-1.0],['2024',0.0],['2025',0.2],['2026*',1.3],['2027*',1.1]];
const PHASES={
  auf:{n:'Aufschwung (Expansion)',d:'Aufträge und Produktion ziehen an, die Kapazitäten werden besser ausgelastet. Unternehmen investieren wieder, Arbeitslosigkeit sinkt verzögert.',t:['steigend','beginnt zu sinken','noch moderat','niedrig, langsam steigend','optimistisch']},
  boom:{n:'Hochkonjunktur (Boom)',d:'Kapazitäten voll ausgelastet, Fachkräfte knapp, Löhne und Preise steigen kräftig. Die Zentralbank erhöht die Zinsen, um eine Überhitzung zu verhindern.',t:['sehr hoch, kaum steigerbar','niedrig','stark steigend','hoch','euphorisch, erste Sorgen']},
  ab:{n:'Abschwung (Rezession)',d:'Nachfrage und Aufträge gehen zurück, Lager füllen sich, Investitionen werden verschoben. Kurzarbeit, später Entlassungen. Bei zwei Quartalen mit sinkendem BIP spricht man von technischer Rezession.',t:['sinkend','steigend','Anstieg lässt nach','sinkend','pessimistisch']},
  tief:{n:'Tiefstand (Depression)',d:'Geringe Auslastung, hohe Arbeitslosigkeit, wenig Investitionen, niedrige Zinsen. Staatliche Konjunkturprogramme sollen die Nachfrage stützen.',t:['niedrig','hoch','niedrig, evtl. sinkend','niedrig','gedrückt']}
};
const BIP_BLITZ={id:'bip-blitz',werkstatt:'wachstum',
  titel:'Erst schätzen: Steigt dadurch das BIP?',
  optionen:[{id:'steigt',t:'BIP steigt',icon:'trending_up'},{id:'nicht',t:'BIP steigt nicht',icon:'trending_flat'}],
  karten:[
    {t:'Nach einem Auffahrunfall auf der A4 bei Jena werden beide Autos in der Werkstatt repariert.',r:'steigt',e:'Die Reparatur ist eine bezahlte Leistung und zählt zum BIP. Reicher macht der Unfall niemanden – eine Schwäche des BIP als Wohlstandsmaß.'},
    {t:'Oma passt jeden Nachmittag auf ihre Enkel auf, ohne Geld dafür zu bekommen.',r:'nicht',e:'Unbezahlte Arbeit wie Kinderbetreuung, Pflege oder Ehrenamt erfasst das BIP nicht, obwohl sie viel wert ist.'},
    {t:'Du verkaufst deine alte PS5 auf Kleinanzeigen.',r:'nicht',e:'Die PS5 wurde schon im Jahr ihrer Herstellung gezählt. Beim Gebrauchtverkauf wechselt nur der Besitzer, neu hergestellt wird nichts.'},
    {t:'Nach einem Waldbrand im Thüringer Wald pflanzt ein Forstbetrieb im Auftrag des Landes neue Bäume.',r:'steigt',e:'Die Aufforstung ist bezahlte Arbeit und erhöht das BIP. Den Schaden durch den Brand zieht das BIP aber nirgends ab.'},
    {t:'Eine Bäckerei in Apolda backt mehr Brötchen und verkauft sie.',r:'steigt',e:'Mehr hergestellte und verkaufte Waren: Genau das misst das BIP.'},
    {t:'Du hilfst samstags ehrenamtlich bei der Tafel in Erfurt.',r:'nicht',e:'Ehrenamt ist unbezahlt und taucht im BIP nicht auf. Deshalb ergänzen Messgrößen wie der Nationale Wohlfahrtsindex oder die Wohlfahrtsmessung der OECD das BIP – und deshalb steht neben dem Wachstum auch Umweltschutz im Sechseck.'}]};
tool({id:'wachstum',hinweise:HINWEISE.wachstum,ch:2,goals:['W'],title:'Konjunktur-Werkstatt',sub:'Erst schätzen, was das BIP misst, dann den Konjunkturzyklus durchfahren und reales Wachstum berechnen',
html(){return `
<p class="task"><b>Auftrag:</b> Schätzt zuerst in der Blitzrunde, was das BIP überhaupt misst. Fahrt dann mit dem Regler durch einen Konjunkturzyklus und beobachtet, wie sich die Indikatoren verändern. Ordnet Deutschland im Herbst 2026 ein und rechnet nominales in reales Wachstum um.</p>
${blitz(BIP_BLITZ)}
<div class="grid2 wide-left">
  <div class="panel chart"><h3>Konjunkturzyklus um den Wachstumstrend</h3><div id="kz-svg"></div>
  <div class="ctrl"><label for="kz-t">Zeit im Zyklus <output id="kz-to"></output></label><input type="range" id="kz-t" min="0" max="100" step="0.5" value="8"></div>
  <div class="row"><button class="btn small" id="kz-de" type="button">Wo steht Deutschland (Herbst 2026)?</button></div></div>
  <div class="panel"><h3 id="kz-name"></h3><p id="kz-desc"></p>
  <div class="tbl-wrap" style="margin-top:8px"><table><tbody id="kz-tab"></tbody></table></div>
  <p class="small muted" id="kz-de-t" hidden style="margin-top:8px">Einschätzung: Die Gemeinschaftsdiagnose (Sept. 2026) spricht von einem „Aufschwung mit Strukturproblemen“: Exporte und Industrie ziehen an (auch durch den weltweiten KI-Boom), Konsum und Investitionen bleiben schwach, der Energiepreisschock durch den Iran-Krieg bremst. Der Arbeitsmarkt folgt verzögert.</p></div>
</div>
<div class="grid2">
  <div class="panel chart"><h3>Reales BIP-Wachstum Deutschland (%)</h3><div id="bip-bars"></div><p class="small muted">* Prognose Gemeinschaftsdiagnose Herbst 2026. 2020: Corona-Einbruch, 2023: Rezession, 2024: Stagnation. Werte nach der Überarbeitung durch Destatis im Juli 2026.</p></div>
  <div class="panel"><h3>Nominal oder real?</h3>
   <div class="ctrl"><label for="bn-n">Nominales BIP-Wachstum <output id="bn-no"></output></label><input type="range" id="bn-n" min="-4" max="12" step="0.1" value="3.8"></div>
   <div class="ctrl"><label for="bn-p">Preissteigerung (BIP-Deflator) <output id="bn-po"></output></label><input type="range" id="bn-p" min="-2" max="10" step="0.1" value="2.5"></div>
   <div class="ctrl"><label for="bn-b">Bevölkerungsveränderung <output id="bn-bo"></output></label><input type="range" id="bn-b" min="-1" max="2" step="0.1" value="0.1"></div>
   <p>Reales Wachstum: <b id="bn-r" class="num"></b> · real pro Kopf: <b id="bn-k" class="num"></b></p>
   <p class="small muted">Das nominale BIP misst in aktuellen Preisen. Steigen nur die Preise, wächst es, ohne dass mehr produziert wird. Deshalb zählt für das Wachstumsziel das reale (preisbereinigte) BIP.</p></div>
</div>
${schreibfeld(WAND.wachstum)}
${impuls(IMPULS.wachstum)}
${erkHTML('wachstum')}`},
init(root){
  const draw=t=>{
    const el=$('#kz-svg',root),m=svgMass(el,600),W=m.W,fl=m.fs(11),H=260,x0=m.handy?16:40,x1=W-14,y0=H-fl-36,sx=v=>x0+v/100*(x1-x0);
    const per=50, yv=v=>y0-30-v*1.1-48*Math.sin(2*Math.PI*v/per);
    let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Konjunkturzyklus">`;
    s+=`<line x1="${x0}" y1="${y0+20}" x2="${x1}" y2="${y0+20}" class="s-mu"/><line x1="${x0}" y1="10" x2="${x0}" y2="${y0+20}" class="s-mu"/>`;
    s+=`<text x="${x1}" y="${y0+24+fl}" text-anchor="end" class="t-mu" font-size="${fl}">Zeit</text><text x="${x0+4}" y="${fl+6}" class="t-mu" font-size="${fl}">reales BIP</text>`;
    // Beschriftung links unter dem Anfang der Trendlinie, dort kreuzt keine Kurve; Halo als Schutz
    s+=`<line x1="${sx(0)}" y1="${y0-30}" x2="${sx(100)}" y2="${y0-30-110}" stroke="var(--muted)" stroke-dasharray="6 5" stroke-width="1.5"/><text x="${sx(1)}" y="${y0-30+fl+6}" class="t-mu t-halo" font-size="${fl}">Trend (Potenzial)</text>`;
    let d='';for(let v=0;v<=100;v+=0.5)d+=(v?'L':'M')+sx(v).toFixed(1)+','+yv(v).toFixed(1);
    s+=`<path d="${d}" fill="none" stroke="var(--g-W)" stroke-width="3"/>`;
    const ph=v=>{const th=((2*Math.PI*v/per)%(2*Math.PI)+2*Math.PI)%(2*Math.PI);if(th<Math.PI/4||th>=7*Math.PI/4)return 'auf';if(th<3*Math.PI/4)return 'boom';if(th<5*Math.PI/4)return 'ab';return 'tief'};
    // Phasen-Beschriftung an Hoch- und Tiefpunkten
    [[12.5,'Boom'],[37.5,'Tiefstand'],[62.5,'Boom'],[87.5,'Tiefstand']].forEach(([v,l])=>{s+=`<text x="${sx(v)}" y="${yv(v)+(l==='Boom'?-14:14+fl)}" text-anchor="middle" class="t-mu" font-size="${fl}">${l}</text>`});
    const x=sx(t),y=yv(t);s+=`<line x1="${x}" y1="${y}" x2="${x}" y2="${y0+20}" stroke="var(--g-W)" stroke-dasharray="3 3"/><circle cx="${x}" cy="${y}" r="8" fill="var(--g-W)" stroke="var(--surface)" stroke-width="3"/>`;
    $('#kz-svg',root).innerHTML=s+'</svg>';
    const P=PHASES[ph(t)];$('#kz-name',root).textContent=P.n;$('#kz-desc',root).textContent=P.d;
    $('#kz-tab',root).innerHTML=['Produktion, Auslastung','Arbeitslosigkeit','Preise','Zinsen','Stimmung (ifo-Index)'].map((n,i)=>`<tr><td class="muted">${n}</td><td><b>${P.t[i]}</b></td></tr>`).join('');
    $('#kz-to',root).textContent=Math.round(t)+' %';
  };
  const sl=$('#kz-t',root);sl.addEventListener('input',()=>{draw(+sl.value);$('#kz-de-t',root).hidden=true});draw(+sl.value);beiBreite($('#kz-svg',root),()=>draw(+sl.value));
  $('#kz-de',root).addEventListener('click',()=>{sl.value=53;draw(53);$('#kz-de-t',root).hidden=false});
  // Balken
  // Werte negativer Balken stehen über der Nulllinie, damit sie nicht mit den Jahreszahlen kollidieren
  // Ist für jede Jahreszahl zu wenig Platz (Handy), steht nur jede zweite da
  const bip=()=>{const el=$('#bip-bars',root),m=svgMass(el,520),W=m.W,fl=m.fs(11),fv=m.fs(11.5),H=230,x0=fl*2.4,x1=W-6,yz=128,sc=18;
  let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Reales BIP-Wachstum Deutschland 2019 bis 2027">`;
  [-4,-2,0,2,4].forEach(v=>{const y=yz-v*sc;s+=`<line x1="${x0}" y1="${y}" x2="${x1}" y2="${y}" class="s-line"/><text x="${x0-6}" y="${y+4}" text-anchor="end" class="t-mu" font-size="${fl}">${v}</text>`});
  const bw=(x1-x0)/BIP.length,jede=bw<fl*3.1?2:1;
  BIP.forEach(([j,v],i)=>{const x=x0+i*bw+bw*0.18,w=bw*0.64,y=v>=0?yz-v*sc:yz;const pr=j.includes('*');
    s+=`<rect x="${x}" y="${y}" width="${w}" height="${Math.max(1,Math.abs(v)*sc)}" rx="3" fill="var(--g-W)" ${pr?'fill-opacity=".45" stroke="var(--g-W)" stroke-dasharray="4 3"':''}/>
    <text x="${x+w/2}" y="${v>=0?y-5:yz-5}" text-anchor="middle" class="t-fg num" font-size="${fv}" font-weight="700">${v?sgn(v):'0,0'}</text>
    ${i%jede?'':`<text x="${x+w/2}" y="${H-6}" text-anchor="middle" class="t-mu" font-size="${fl}">${j}</text>`}`});
  el.innerHTML=s+'</svg>'};
  bip();beiBreite($('#bip-bars',root),bip);
  const bn=()=>{const n=+$('#bn-n',root).value,p=+$('#bn-p',root).value,b=+$('#bn-b',root).value;const r=((1+n/100)/(1+p/100)-1)*100,k=((1+r/100)/(1+b/100)-1)*100;
    $('#bn-no',root).textContent=sgn(n)+' %';$('#bn-po',root).textContent=sgn(p)+' %';$('#bn-bo',root).textContent=sgn(b)+' %';$('#bn-r',root).textContent=sgn(r,2)+' %';$('#bn-k',root).textContent=sgn(k,2)+' %'};
  ['#bn-n','#bn-p','#bn-b'].forEach(s=>$(s,root).addEventListener('input',bn));bn();
  bindErk(root);
}});

/* 5 Außenwirtschaft */
tool({id:'aussen',hinweise:HINWEISE.aussen,ch:2,goals:['A'],title:'Leistungsbilanz-Waage',sub:'Teilbilanzen einstellen, Saldo in % des BIP bewerten, Wechselkurseffekte testen',
html(){return `
<p class="task"><b>Auftrag:</b> Schätzt zuerst, was ein stärkerer Euro mit dem Preis eines Mikroskops aus Jena macht. Stellt dann die vier Teilbilanzen ein und beobachtet, wohin die Waage kippt. Prüft, ob die EU-Frühwarnschwelle überschritten wird. Testet zum Schluss im Wechselkurs-Labor, ob eure Schätzung stimmt.</p>
${kurztest({id:'aussen-schaetzen',titel:'Erst schätzen, dann schieben: der Euro und das Mikroskop',fragen:[
  {f:'Ein Mikroskop von ZEISS aus Jena kostet 10.000 €. Der Euro steigt von 1,15 auf 1,30 US-Dollar. Was passiert mit dem Preis in den USA?',o:['Er steigt: von 11.500 $ auf 13.000 $.','Er sinkt: von 11.500 $ auf 10.000 $.','Er bleibt gleich, denn das Mikroskop kostet ja weiter 10.000 €.'],r:0,
    e:'10.000 € × 1,30 = 13.000 $ statt 10.000 € × 1,15 = 11.500 $. Ein stärkerer Euro macht deutsche Waren im Ausland teurer. Probiert es unten im Wechselkurs-Labor aus.'}]})}
<div class="grid2 wide-left">
  <div class="panel chart"><h3>Die Waage</h3><div id="lb-svg"></div>
   <div class="row"><button class="btn small" data-lb="de" type="button">Deutschland 2025 (Bundesbank)</button><button class="btn small" data-lb="null" type="button">Ausgeglichen</button><button class="btn small" data-lb="def" type="button">Defizitland</button></div></div>
  <div class="panel stack"><h3>Teilbilanzen (Saldo, Mrd. €)</h3>
   <div class="ctrl"><label for="lb-w">Warenhandel (Export − Import) <output id="lb-wo"></output></label><input type="range" id="lb-w" min="-200" max="350" step="1"></div>
   <div class="ctrl"><label for="lb-d">Dienstleistungen (z. B. Reisen, Software-Lizenzen) <output id="lb-do"></output></label><input type="range" id="lb-d" min="-150" max="100" step="1"></div>
   <div class="ctrl"><label for="lb-p">Primäreinkommen (Zinsen, Dividenden aus dem Ausland) <output id="lb-po"></output></label><input type="range" id="lb-p" min="-100" max="200" step="1"></div>
   <div class="ctrl"><label for="lb-s">Sekundäreinkommen (Überweisungen, EU-Beiträge) <output id="lb-so"></output></label><input type="range" id="lb-s" min="-120" max="40" step="1"></div>
   <p>Saldo: <b id="lb-sum" class="num"></b> = <b id="lb-pct" class="num"></b> des BIP <span class="small muted">(BIP 2025 ≈ 4.530 Mrd. €)</span></p><div id="lb-fb" class="fb"></div>
   <p class="small muted">Die Waage zeigt nur die Salden der vier Teilbilanzen. Tatsächlich nahm Deutschland 2025 rund 2.346 Mrd. € aus dem Ausland ein und zahlte rund 2.146 Mrd. € dorthin (Bundesbank).</p></div>
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
${schreibfeld(WAND.aussen)}
${impuls(IMPULS.aussen)}
${erkHTML('aussen')}`},
init(root){
  // Deutschland 2025: Salden in Mrd. € (Bundesbank, Zahlungsbilanzstatistik, Stand 13.10.2026)
  const PRE={de:[186,-76,161,-70],null:[40,-20,20,-40],def:[-120,-10,-15,-35]};
  const ids=['w','d','p','s'];
  const set=a=>{ids.forEach((k,i)=>$('#lb-'+k,root).value=a[i]);upd()};
  const upd=()=>{
    const v=ids.map(k=>+$('#lb-'+k,root).value);ids.forEach((k,i)=>$('#lb-'+k+'o',root).textContent=sgn(v[i],0));
    const sum=v.reduce((a,b)=>a+b,0),pct=sum/4530*100;
    $('#lb-sum',root).textContent=sgn(sum,0)+' Mrd. €';$('#lb-pct',root).textContent=sgn(pct,1)+' %';
    const fb=$('#lb-fb',root);
    if(pct>6){fb.className='fb bad';fb.textContent='Über +6 %: Liegt auch der Durchschnitt der letzten drei Jahre so hoch, prüft die EU-Kommission ein übermäßiges Ungleichgewicht (Überschuss).'}
    else if(pct<-4){fb.className='fb bad';fb.textContent='Unter −4 %: Das Land lebt über seine Verhältnisse und verschuldet sich im Ausland. Liegt auch der Dreijahresdurchschnitt so tief, prüft die EU-Kommission ein Ungleichgewicht.'}
    else if(Math.abs(pct)<=1){fb.className='fb ok';fb.textContent='Nahezu ausgeglichen – das Ziel ist erreicht.'}
    else{fb.className='fb amb';fb.textContent=pct>0?'Überschuss innerhalb der EU-Schwelle, aber deutlich vom Gleichgewicht entfernt.':'Defizit innerhalb der EU-Schwelle.'}
    const el=$('#lb-svg',root),m=svgMass(el,520),W=m.W,f=m.fs,H=240,cx=W/2,cy=110,ang=clamp(-pct*3.2,-24,24),rad=ang*Math.PI/180,L=Math.min(180,W/2-58);
    const lx=cx-L*Math.cos(rad),ly=cy-L*Math.sin(rad),rx=cx+L*Math.cos(rad),ry=cy+L*Math.sin(rad);
    let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Waage: Leistungsbilanzsaldo ${fmt(pct)} Prozent">`;
    s+=`<polygon points="${cx-30},${H-12} ${cx+30},${H-12} ${cx},${cy+6}" fill="var(--surface-2)" class="s-mu"/>`;
    s+=`<line x1="${lx}" y1="${ly}" x2="${rx}" y2="${ry}" stroke="var(--fg)" stroke-width="5" stroke-linecap="round"/><circle cx="${cx}" cy="${cy}" r="7" fill="var(--fg)"/>`;
    const pan=(x,y,lab,val,col)=>`<line x1="${x}" y1="${y}" x2="${x-40}" y2="${y+50}" class="s-mu"/><line x1="${x}" y1="${y}" x2="${x+40}" y2="${y+50}" class="s-mu"/>
      <path d="M${x-52},${y+50} Q${x},${y+82} ${x+52},${y+50} Z" fill="${col}" fill-opacity=".85"/>
      <text x="${x}" y="${y+46}" text-anchor="middle" class="t-fg" font-size="${f(12)}" font-weight="700">${lab}</text><text x="${x}" y="${y+68}" text-anchor="middle" class="t-fg" font-size="${f(12)}" font-weight="700">${val}</text>`;
    const inflow=v.filter(x=>x>0).reduce((a,b)=>a+b,0),outflow=-v.filter(x=>x<0).reduce((a,b)=>a+b,0);
    // Links die Summe der positiven Salden, rechts die der negativen (keine Einnahmen und Ausgaben, nur Salden)
    s+=pan(lx,ly,'Plus-Salden',fmt(inflow,0),'var(--md-ok-container)')+pan(rx,ry,'Minus-Salden',fmt(outflow,0),'var(--md-error-container)');
    s+=`<text x="${cx}" y="22" text-anchor="middle" class="t-fg" font-size="${f(14)}" font-weight="700">${pct>0.05?'Überschuss':pct<-0.05?'Defizit':'ausgeglichen'}</text>`;
    el.innerHTML=s+'</svg>';
  };
  ids.forEach(k=>$('#lb-'+k,root).addEventListener('input',upd));
  $$('[data-lb]',root).forEach(b=>b.addEventListener('click',()=>set(PRE[b.dataset.lb])));set(PRE.de);beiBreite($('#lb-svg',root),upd);
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
tool({id:'verteilung',hinweise:HINWEISE.verteilung,ch:2,goals:['V'],title:'Lorenz-Werkstatt',sub:'Lorenzkurve zeichnen, Gini-Koeffizient berechnen, Umverteilung durch den Staat sichtbar machen',
html(){return `
<p class="task"><b>Auftrag:</b> Schätzt zuerst, wie viel Vermögen dem reichsten Zehntel gehört. Verteilt dann 100 % des Einkommens auf fünf gleich große Bevölkerungsgruppen (ärmstes bis reichstes Fünftel). Vergleicht Markteinkommen und verfügbare Einkommen: Wie stark verteilt der Staat um? Und warum ist Vermögen viel ungleicher verteilt?</p>
${kurztest({id:'verteilung-schaetzen',titel:'Erst schätzen, dann schieben: Wem gehört das Vermögen?',fragen:[
  {f:'Wie viel des gesamten Nettovermögens in Deutschland gehört dem reichsten Zehntel der Haushalte?',o:['rund 10 %','rund 30 %','mehr als die Hälfte'],r:2,
    e:'Rund 56 % (Deutsche Bundesbank, Studie „Private Haushalte und ihre Finanzen“, Befragung 2021). Die ärmere Hälfte der Haushalte besitzt zusammen nur einen sehr kleinen Teil. Wie das aussieht, zeigt die Lorenzkurve unten mit dem Knopf „Vermögen“.'}]})}
<div class="grid2 wide-left">
  <div class="panel chart"><h3>Lorenzkurve</h3><div id="lz-svg"></div></div>
  <div class="panel stack"><div class="row">${Object.entries(LZ).map(([k,o])=>`<button class="btn small" data-lz="${k}" type="button">${o.b}</button>`).join('')}</div>
   <p class="small muted" id="lz-name"></p>
   ${[1,2,3,4,5].map(i=>`<div class="ctrl"><label for="lz${i}">${['Ärmstes','Zweites','Mittleres','Viertes','Reichstes'][i-1]} Fünftel <output id="lz${i}o"></output></label><input type="range" id="lz${i}" min="0" max="100" step="0.5"></div>`).join('')}
   <p class="small" id="lz-sum"></p>
   <p class="fb amb small" id="lz-sort" hidden>Achtung: Das „ärmste“ Fünftel hat jetzt nicht mehr am wenigsten. Für die Lorenzkurve und den Gini werden die Gruppen neu geordnet, vom kleinsten zum größten Anteil.</p>
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
${schreibfeld(WAND.verteilung)}
${impuls(IMPULS.verteilung)}
${erkHTML('verteilung')}`},
init(root){
  let cur=LZ.verf.v.slice();
  const gini=s=>{const t=s.reduce((a,b)=>a+b,0)||1;let cum=0,prev=0,A=0;s.forEach(v=>{cum+=v/t;A+=(prev+cum)*0.2;prev=cum});return Math.max(0,1-A)}; // max: Rundungsrest bei Gleichverteilung (sonst „−0,00“)
  const draw=()=>{
    const t=cur.reduce((a,b)=>a+b,0)||1;
    [1,2,3,4,5].forEach(i=>{$('#lz'+i,root).value=cur[i-1];$('#lz'+i+'o',root).textContent=fmt(cur[i-1]/t*100,1)+' %'});
    $('#lz-sum',root).textContent=Math.abs(t-100)>0.6?`Summe der Regler: ${fmt(t,1)} – die Werkstatt rechnet automatisch auf 100 % um.`:'Summe: 100 %';
    // Eine Lorenzkurve ist immer von arm nach reich sortiert: Regler bleiben, gerechnet und gezeichnet wird sortiert
    const srt=cur.slice().sort((a,b)=>a-b),neu=cur.some((v,i)=>v!==srt[i]);$('#lz-sort',root).hidden=!neu;
    const g=gini(srt);$('#lz-g',root).textContent=fmt(g,2);
    const el=$('#lz-svg',root),m=svgMass(el,420),W=m.W,f=m.fs,fl=f(11),fa=f(11.5),x0=Math.max(56,fl*2.8+fa+8),S=Math.min(300,W-x0-fl*1.4),y0=20+S,H=y0+fl+fa+18,X=v=>x0+v*S,Y=v=>y0-v*S;
    let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Lorenzkurve, Gini ${fmt(g,2)}">`;
    [0,.2,.4,.6,.8,1].forEach(v=>{s+=`<line x1="${X(v)}" y1="${Y(0)}" x2="${X(v)}" y2="${Y(1)}" class="s-line"/><line x1="${X(0)}" y1="${Y(v)}" x2="${X(1)}" y2="${Y(v)}" class="s-line"/>
      <text x="${X(v)}" y="${y0+fl+5}" text-anchor="middle" class="t-mu" font-size="${fl}">${v*100} %</text><text x="${x0-6}" y="${Y(v)+4}" text-anchor="end" class="t-mu" font-size="${fl}">${v*100} %</text>`});
    let pts=[[0,0]],c=0;srt.forEach((v,i)=>{c+=v/t;pts.push([(i+1)*0.2,c])});
    const ps=pts.map(([a,b])=>`${X(a).toFixed(1)},${Y(b).toFixed(1)}`).join(' ');
    s+=`<polygon points="${X(0)},${Y(0)} ${X(1)},${Y(1)} ${pts.slice().reverse().map(([a,b])=>`${X(a).toFixed(1)},${Y(b).toFixed(1)}`).join(' ')}" fill="var(--g-V)" fill-opacity=".22"/>`;
    s+=`<line x1="${X(0)}" y1="${Y(0)}" x2="${X(1)}" y2="${Y(1)}" class="s-fg" stroke-width="1.5" stroke-dasharray="6 4"/>`;
    s+=`<polyline points="${ps}" fill="none" stroke="var(--g-V)" stroke-width="3"/>`;
    pts.forEach(([a,b])=>s+=`<circle cx="${X(a)}" cy="${Y(b)}" r="4" fill="var(--g-V)"/>`);
    s+=`<text x="${X(.47)}" y="${Y(.56)}" class="t-mu" font-size="${fl}" transform="rotate(-45 ${X(.47)} ${Y(.56)})">Gleichverteilungsgerade</text>`;
    s+=`<text x="${X(1)-4}" y="${Y(.3)}" text-anchor="end" class="t-fg t-halo" font-size="${f(12)}">Fläche ≈ Ungleichheit</text>`;
    s+=`<text x="${X(.5)}" y="${H-6}" text-anchor="middle" class="t-mu" font-size="${fa}">${S<280?'Bevölkerung (kumuliert, arm bis reich)':'Anteil der Bevölkerung (kumuliert, von arm nach reich)'}</text>`;
    s+=`<text x="${fa}" y="${Y(.5)}" text-anchor="middle" class="t-mu" font-size="${fa}" transform="rotate(-90 ${fa} ${Y(.5)})">Anteil am Einkommen (kumuliert)</text>`;
    el.innerHTML=s+'</svg>';
  };
  [1,2,3,4,5].forEach(i=>$('#lz'+i,root).addEventListener('input',e=>{cur[i-1]=+e.target.value;$('#lz-name',root).textContent='Eigene Verteilung';draw()}));
  $$('[data-lz]',root).forEach(b=>b.addEventListener('click',()=>{cur=LZ[b.dataset.lz].v.slice();$('#lz-name',root).textContent=LZ[b.dataset.lz].n;draw()}));
  $('#lz-name',root).textContent=LZ.verf.n;draw();beiBreite($('#lz-svg',root),draw);
  const ml=()=>{const h=+$('#ml-h',root).value,l=+$('#ml-l',root).value;$('#ml-ho',root).textContent=h+' h';$('#ml-lo',root).textContent=fmt(l,2)+' €';$('#ml-r',root).textContent=fmt(h*l*13/3,0)+' €'};
  ['#ml-h','#ml-l'].forEach(s=>$(s,root).addEventListener('input',ml));ml();
  bindErk(root);
}});

/* 7 Umwelt */
const THG=[[1990,1251],[2000,1045],[2010,942],[2015,904],[2019,800],[2020,730],[2021,760],[2022,750],[2023,674],[2024,649],[2025,649]];
tool({id:'umwelt',hinweise:HINWEISE.umwelt,ch:2,goals:['U'],title:'Klima-Werkstatt',sub:'Treibhausgas-Pfad bis 2045 planen, CO₂-Preis an der Zapfsäule berechnen',
html(){return `
<p class="task"><b>Auftrag:</b> Schätzt zuerst, wie schnell Deutschland die Emissionen senken muss. Legt dann mit dem Regler fest, um wie viele Millionen Tonnen Deutschland ab 2026 jedes Jahr Emissionen senkt. Wird das Ziel 2030 erreicht? Berechnet anschließend, was ein CO₂-Preis an der Tankstelle und beim Heizen kostet.</p>
${kurztest({id:'umwelt-schaetzen',titel:'Erst schätzen, dann schieben: Wie schnell muss es gehen?',fragen:[
  {f:'2025 stieß Deutschland rund 649 Mio. t Treibhausgase aus. 2030 sollen es höchstens 438 Mio. t sein. Um wie viel muss Deutschland ab 2026 jedes Jahr senken?',o:['um rund 15 Mio. t','um rund 42 Mio. t','um rund 100 Mio. t'],r:1,
    e:'(649 − 438) ÷ 5 Jahre ≈ 42 Mio. t pro Jahr. Zum Vergleich: 2019 bis 2025 waren es im Schnitt rund 25 Mio. t, 2025 kaum noch etwas. Stellt den Regler unten auf 42 und auf 43: Ab wann klappt es?'}]})}
<div class="panel chart"><h3>Treibhausgasemissionen Deutschland (Mio. t CO₂-Äquivalente)</h3><div id="th-svg"></div>
 <div class="legend" style="margin-bottom:6px"><span><i style="background:var(--g-U)"></i>Emissionen bis 2025</span><span><i style="background:var(--g-U);opacity:.5"></i>euer Pfad (gepunktet)</span><span><i style="background:var(--ok)"></i>Zielpfad Klimaschutzgesetz: 2030 höchstens 438 Mio. t (−65 %), 2040 −88 %, 2045 netto null</span></div>
 <div class="ctrl"><label for="th-r">Minderung pro Jahr ab 2026 <output id="th-ro"></output></label><input type="range" id="th-r" min="0" max="80" step="1" value="15"></div>
 <div id="th-fb" class="fb"></div></div>
<div class="grid2">
  <div class="panel"><h3>CO₂-Preis-Rechner</h3>
   <div class="ctrl"><label for="co-p">CO₂-Preis pro Tonne <output id="co-po"></output></label><input type="range" id="co-p" min="0" max="250" step="5" value="60"></div>
   <div class="tbl-wrap"><table><thead><tr><th>Produkt</th><th class="r">Aufschlag</th></tr></thead><tbody id="co-tab"></tbody></table></div>
   <p class="small muted">Werte ohne Mehrwertsteuer. Nationaler CO₂-Preis für Verkehr und Wärme 2026: Preiskorridor 55 bis 65 €/t. Für 2027 plant die Bundesregierung denselben Korridor (Gesetzentwurf, Stand Oktober 2026). Ab 2028 gilt der EU-Emissionshandel für Gebäude und Verkehr (ETS2), dann bildet sich der Preis am Markt.</p></div>
  <div class="panel"><h3>Warum ist Umwelt ein wirtschaftspolitisches Ziel?</h3>
   <p>Wer CO₂ ausstößt, verursacht Schäden, für die er nicht bezahlt: <b>externe Kosten</b>. Der Markt produziert dann „zu billig“ und zu viel. Ein CO₂-Preis oder Emissionshandel (Obergrenze plus handelbare Zertifikate) rechnet diese Kosten ein.</p>
   <p style="margin-top:6px"><b>Entkopplung:</b> Seit 1990 ist die deutsche Wirtschaftsleistung real um rund die Hälfte gewachsen, die Emissionen sind um 48 % gesunken. Wachstum und Umweltschutz schließen sich also nicht zwingend aus – reicht das Tempo aber?</p>
   <p style="margin-top:6px"><b>Klimageld:</b> Wird das Geld aus dem CO₂-Preis pro Kopf zurückgezahlt, profitieren Haushalte mit geringem Verbrauch – oft die mit geringerem Einkommen.</p></div>
</div>
${schreibfeld(WAND.umwelt)}
${impuls(IMPULS.umwelt)}
${erkHTML('umwelt')}`},
init(root){
  const draw=()=>{
    const red=+$('#th-r',root).value;$('#th-ro',root).textContent=fmt(red,0)+' Mio. t';
    // Handy: höher als breit genug für die Beschriftung, Jahreszahlen ausgedünnt (2040 fällt weg, sie stünde zu dicht an 2045)
    const el=$('#th-svg',root),m=svgMass(el,760),W=m.W,f=m.fs,fl=f(11),fz=f(11.5),x0=Math.max(50,fl*3.4),x1=W-fl*1.4,H=300,y0=H-fl-22,yt=20,sx=y=>x0+(y-1990)/(2046-1990)*(x1-x0),sy=v=>y0-(v/1300)*(y0-yt);
    let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Emissionspfad Deutschland">`;
    [0,250,500,750,1000,1250].forEach(v=>{s+=`<line x1="${x0}" y1="${sy(v)}" x2="${x1}" y2="${sy(v)}" class="s-line"/><text x="${x0-6}" y="${sy(v)+4}" text-anchor="end" class="t-mu" font-size="${fl}">${v}</text>`});
    const jahre=(sx(2045)-sx(2040))<fl*2.6?[1990,2000,2010,2020,2030,2045]:[1990,2000,2010,2020,2030,2040,2045];
    if(sx(2000)-sx(1990)<fl*2.6)jahre.splice(0,jahre.length,1990,2010,2030,2045);
    jahre.forEach(y=>s+=`<text x="${sx(y)}" y="${y0+fl+7}" text-anchor="middle" class="t-mu" font-size="${fl}">${y}</text>`);
    // Zielpfad
    const goal=[[2025,649],[2030,438],[2040,150],[2045,0]];
    s+=`<polyline points="${goal.map(([y,v])=>sx(y)+','+sy(v)).join(' ')}" fill="none" stroke="var(--ok)" stroke-width="2" stroke-dasharray="7 5"/>`;
    [[2030,438,'Ziel 2030: 438',-10,fz+10,'end'],[2040,150,'2040: −88 %',-10,fz+10,'end'],[2045,0,'',0,0,'end']].forEach(([y,v,l,dx,dy,a])=>s+=`<circle cx="${sx(y)}" cy="${sy(v)}" r="5" fill="var(--ok)"/>${l?`<text x="${sx(y)+dx}" y="${sy(v)+dy}" text-anchor="${a}" fill="var(--ok)" class="t-halo" font-size="${fz}" font-weight="700">${l}</text>`:''}`);
    // Projektion
    let pr=[[2025,649]];for(let y=2026;y<=2045;y++)pr.push([y,Math.max(0,649-red*(y-2025))]);
    s+=`<polyline points="${pr.map(([y,v])=>sx(y)+','+sy(v)).join(' ')}" fill="none" stroke="var(--g-U)" stroke-width="2.5" stroke-dasharray="2 4"/>`;
    s+=`<polyline points="${THG.map(([y,v])=>sx(y)+','+sy(v)).join(' ')}" fill="none" stroke="var(--g-U)" stroke-width="3"/>`;
    THG.forEach(([y,v])=>s+=`<circle cx="${sx(y)}" cy="${sy(v)}" r="3.5" fill="var(--g-U)"/>`);
    s+=`<text x="${sx(1990)+6}" y="${sy(1251)-6}" class="t-fg t-halo" font-size="${fz}">1990: 1.251</text><text x="${sx(2024)}" y="${sy(649)+fz+12}" text-anchor="end" class="t-fg t-halo" font-size="${fz}">2025: 649 (−48 %)</text>`;
    el.innerHTML=s+'</svg>';
    const v30=Math.max(0,649-red*5),zero=red>0?2025+Math.ceil(649/red):null,fb=$('#th-fb',root);
    fb.className='fb '+(v30<=438?'ok':'bad');
    fb.innerHTML=`2030 lägen die Emissionen bei <b>${fmt(v30,0)} Mio. t</b> (${sgn((v30/1251-1)*100,0)} % gegenüber 1990). ${v30<=438?'Ziel 2030 erreicht.':`Ziel um ${fmt(v30-438,0)} Mio. t verfehlt.`} ${zero&&zero<=2100?`Klimaneutral wäre Deutschland ${zero<=2045?'bereits ':''}im Jahr ${zero}.`:'Klimaneutralität rückt in weite Ferne.'} <span class="muted">Zum Vergleich: 2019 bis 2025 sanken die Emissionen im Schnitt um rund 25 Mio. t pro Jahr, 2025 kaum noch. Das Umweltbundesamt erwartet mit der heutigen Politik bis 2030 nur −62,6 %, zum Ziel fehlen rund 30 Mio. t (Projektion März 2026).</span>`;
  };
  $('#th-r',root).addEventListener('input',draw);draw();beiBreite($('#th-svg',root),draw);
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
tool({id:'beziehungen',hinweise:HINWEISE.beziehungen,ch:3,goals:ORDER,title:'Zielbeziehungs-Detektiv',sub:'15 Paare untersuchen: Harmonie, Konflikt, neutral oder ambivalent?',
html(){return `
<p class="task"><b>Auftrag:</b> Wählt zwei Ziele aus. Entscheidet zuerst selbst, wie sie zusammenhängen, und deckt dann die Lösung auf. Ziel: alle 15 Beziehungen im Sechseck aufklären.</p>
<div class="grid2 wide-left">
  <div class="panel chart"><div class="row" style="justify-content:space-between"><h3>Beziehungsnetz <span class="small muted" id="zb-cnt"></span></h3><button class="btn small" id="zb-all" type="button" aria-pressed="false" data-nur-lk hidden>Alle aufdecken</button></div>
  <div id="zb-svg"></div>
  <div class="legend"><span><i style="background:var(--ok)"></i>Harmonie</span><span><i style="background:var(--bad)"></i>Konflikt</span><span><i style="background:var(--amb)"></i>ambivalent</span><span><i style="background:var(--neu)"></i>neutral</span></div></div>
  <div class="panel stack" id="zb-panel"><p class="muted">Klickt im Sechseck zwei Ecken nacheinander an.</p></div>
</div>
<div class="panel"><h3>Begriffe</h3><dl class="kv">
 <dt>Zielharmonie</dt><dd>Die Förderung des einen Ziels fördert auch das andere (komplementär).</dd>
 <dt>Zielkonflikt</dt><dd>Die Förderung des einen Ziels beeinträchtigt das andere (konkurrierend).</dd>
 <dt>Zielneutralität</dt><dd>Die Ziele beeinflussen sich nicht (indifferent).</dd>
 <dt>ambivalent</dt><dd>Je nach Ursache, Zeitraum und Ausgangslage Harmonie oder Konflikt.</dd></dl></div>
${schreibfeld(WAND.beziehungen)}
${impuls(IMPULS.beziehungen)}
${erkHTML('beziehungen')}`},
init(root){
  // seen: selbst aufgeklärte Paare (gespeichert); alle: „Alle aufdecken“ der Lehrkraft, nur angezeigt, nie gespeichert
  let pick=[], seen=new Set(store('ms6-rel')||[]), guess=null, alleAuf=false;
  const alle=()=>alleAuf&&raum.istLehrkraft(), offen=key=>seen.has(key)||alle();
  const draw=()=>{
    const m=svgMass($('#zb-svg',root),520),W=m.W,f=m.fs,fl=f(14),kompakt=m.handy||W<480;
    const r=kompakt?Math.min(136,W*.35):136,H=kompakt?Math.round(2*r+2*(31+fl)+12):400,cx=W/2,cy=H/2,p=hexPts(cx,cy,r);
    let s=`<svg viewBox="0 0 ${W} ${H}" role="group" aria-label="Beziehungsnetz der sechs Ziele">`;
    s+=`<polygon points="${ptsStr(p)}" fill="none" class="s-line" stroke-width="1.5"/>`;
    Object.keys(REL).forEach(key=>{const [a,b]=key.split('-');const ia=ORDER.indexOf(a),ib=ORDER.indexOf(b);const on=offen(key);
      s+=`<line x1="${p[ia][0]}" y1="${p[ia][1]}" x2="${p[ib][0]}" y2="${p[ib][1]}" stroke="${on?RELC[REL[key][0]][1]:'var(--line)'}" stroke-width="${on?4:1.5}" ${on?'':'stroke-dasharray="3 5"'} stroke-linecap="round"/>`});
    ORDER.forEach((k,i)=>{const [x,y]=p[i];const q=eckPos(i,cx,cy,r,kompakt?29:30,{handy:kompakt,fs:fl,W,txt:G[k].short});const sel=pick.includes(k);
      s+=`<g class="hexcorner" tabindex="0" role="button" data-k="${k}" aria-pressed="${sel}" aria-label="${k} ${G[k].short} auswählen"><circle class="dot" cx="${x}" cy="${y}" r="${sel?21:16}" fill="${gc(k)}" stroke="${sel?'var(--fg)':'var(--surface)'}" stroke-width="3"/>
      <text x="${x}" y="${y+5}" text-anchor="middle" fill="var(--md-on-g-${k})" font-size="${f(13)}" font-weight="700">${k}</text>
      <text x="${q.x}" y="${q.y}" text-anchor="${q.a}" fill="${gc(k)}" font-size="${fl}" font-weight="700">${G[k].short}</text></g>`});
    $('#zb-svg',root).innerHTML=s+'</svg>';
    $('#zb-cnt',root).textContent=alle()?'(alle aufgedeckt)':`(${seen.size}/15 aufgeklärt)`;
    $$('.hexcorner',root).forEach(g=>{const f=()=>clickK(g.dataset.k);g.addEventListener('click',f);g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();f();$(`#zb-svg .hexcorner[data-k="${g.dataset.k}"]`,root)?.focus()}})}); // neu gezeichnet: Fokus zurück auf die Ecke
  };
  const panel=$('#zb-panel',root);
  const clickK=k=>{
    if(pick.length===2||pick.includes(k))pick=[];
    pick.push(k);guess=null;draw();
    if(pick.length===1){panel.innerHTML=`<p>${hexDot(k)} <b>${G[k].short}</b> gewählt. Jetzt die zweite Ecke anklicken.</p>`;return}
    const key=relKey(pick[0],pick[1]);
    panel.innerHTML=`<h3>${hexDot(pick[0])} ${G[pick[0]].short} <span class="ms sm" aria-hidden="true">sync_alt</span><span class="sr-only">und</span> ${hexDot(pick[1])} ${G[pick[1]].short}</h3>
      <p>Eure Vermutung:</p><div class="choice" id="zb-ch">${Object.entries(RELC).map(([c,v])=>`<button type="button" data-c="${c}">${v[2]}</button>`).join('')}</div>
      <button class="btn primary" id="zb-rev" type="button" ${offen(key)?'':'disabled'}>Lösung aufdecken</button><div id="zb-sol"></div>`;
    $$('#zb-ch button',panel).forEach(b=>b.addEventListener('click',()=>{guess=b.dataset.c;$$('#zb-ch button',panel).forEach(x=>x.classList.toggle('sel',x===b));$('#zb-rev',panel).disabled=false}));
    $('#zb-rev',panel).addEventListener('click',()=>reveal(key,true));
    if(offen(key))reveal(key,seen.has(key));
  };
  const reveal=(key,merken)=>{
    const [c,lab,txt]=REL[key];if(merken){seen.add(key);store('ms6-rel',[...seen])}
    $$('#zb-ch button',panel).forEach(x=>{if(x.dataset.c===c)x.classList.add('right');else if(x.dataset.c===guess)x.classList.add('wrong')});
    $('#zb-sol',panel).innerHTML=`<div class="fb ${RELC[c][0]}" style="margin-top:8px"><b>${lab}</b>${guess?(guess===c?' – richtig vermutet!':' – andere Einschätzung als eure. Habt ihr gute Gründe?'):''}<br>${txt}</div>`;
    $('#zb-rev',panel).hidden=true;draw();
  };
  $('#zb-all',root).addEventListener('click',e=>{alleAuf=!alleAuf;warAlle=alle();e.currentTarget.setAttribute('aria-pressed',String(alleAuf));draw()});
  // Endet der Lernraum oder wechselt die Rolle, verschwinden die nur aufgedeckten Beziehungen wieder.
  // Neu gezeichnet wird nur bei einem Wechsel, sonst verlöre die Tastatur bei jedem Lernraum-Ereignis den Fokus.
  let warAlle=alle();
  const netz=$('#zb-svg',root),stop=raum.on(()=>{if(!document.body.contains(netz))return stop();
    if(alleAuf&&!raum.istLehrkraft()){alleAuf=false;$('#zb-all',root).setAttribute('aria-pressed','false')}
    if(alle()!==warAlle){warAlle=alle();draw()}});
  draw();beiBreite($('#zb-svg',root),draw);bindErk(root);
}});

/* 9 Phillips */
const PH=[[2015,6.4,0.7],[2016,6.1,0.4],[2017,5.7,1.7],[2018,5.2,1.9],[2019,5.0,1.4],[2020,5.9,0.5],[2021,5.7,3.1],[2022,5.3,6.9],[2023,5.7,5.9],[2024,6.0,2.2],[2025,6.3,2.2]];
tool({id:'phillips',hinweise:HINWEISE.phillips,ch:3,goals:['P','B'],title:'Phillips-Kurven-Labor',sub:'Den Klassiker unter den Zielkonflikten an echten deutschen Daten prüfen',
html(){return `
<p class="task"><b>Auftrag:</b> Die Phillips-Kurve behauptet: Weniger Arbeitslosigkeit gibt es nur um den Preis höherer Inflation. Prüft die These mit den deutschen Jahreswerten 2015 bis 2025. Wo passt sie, wo nicht – und warum?</p>
<div class="grid2 wide-left">
  <div class="panel chart stack"><div id="ph-svg"></div>
   <div class="choice" id="ph-jahre" role="group" aria-label="Jahr wählen">${PH.map(([y],i)=>`<button type="button" data-i="${i}" aria-pressed="false">${y}</button>`).join('')}</div>
   <div id="ph-info" class="fb neu small" role="status">Tippt auf ein Jahr oder einen Punkt für Details.</div>
   <div class="row"><button class="btn small" id="ph-theo" type="button" aria-pressed="false">Theoretische Kurve einblenden</button><button class="btn small" id="ph-stag" type="button" aria-pressed="false">Stagflation markieren</button></div></div>
  <div class="panel stack"><h3>Die Geschichte der Kurve</h3>
   <p><b>1958</b> fand A. W. Phillips für Großbritannien einen Zusammenhang zwischen niedriger Arbeitslosigkeit und schnell steigenden Löhnen. Samuelson und Solow übertrugen ihn 1960 auf die Inflation: Politik könne zwischen beiden Zielen wählen.</p>
   <p>Der Satz „Lieber 5 % Inflation als 5 % Arbeitslosigkeit“ wird Helmut Schmidt (1972) zugeschrieben. In den 1970er Jahren bekam Deutschland nach der Ölkrise beides: hohe Inflation <i>und</i> steigende Arbeitslosigkeit.</p>
   <p><b>Erklärung:</b> Die Kurve gilt am ehesten bei Nachfrageschwankungen. Bei Angebotsschocks (teure Energie) steigen Kosten und Preise, während die Produktion sinkt: <b>Stagflation</b>. Außerdem passen Menschen ihre Inflationserwartungen an – dauerhaft lässt sich Arbeitslosigkeit nicht mit Inflation „kaufen“ (Friedman, Phelps).</p></div>
</div>
${schreibfeld(WAND.phillips)}
${impuls(IMPULS.phillips)}
${erkHTML('phillips')}`},
init(root){
  // Jahrespunkte: Bedienung per Tastatur und Screenreader über die Jahresleiste, die Punkte im Diagramm sind zusätzlich antippbar
  let theo=false,stag=false,sel=null;
  const TXT={2020:'Corona: Nachfrageeinbruch, Mehrwertsteuersenkung.',2021:'Nachholeffekte, CO₂-Preis eingeführt, Mehrwertsteuer wieder normal.',2022:'Russlands Krieg gegen die Ukraine: Energiepreisschock. Die Preise steigen stark, aber die Arbeitslosigkeit sinkt noch, und die Wirtschaft wächst (+1,9 %).',2023:'Inflation bleibt hoch, die Wirtschaft schrumpft (−1,0 %), die Arbeitslosigkeit steigt: Stagflation.',2019:'Höchststand der Beschäftigung, niedrige Inflation – widerspricht dem Zielkonflikt.',2017:'Aufschwung: weniger Arbeitslose, etwas mehr Inflation – passt zur Theorie.',2018:'Aufschwung: weniger Arbeitslose, etwas mehr Inflation – passt zur Theorie.',2025:'Arbeitslosigkeit steigt bei moderater Inflation.'},info=$('#ph-info',root);
  const zeige=(i,scroll)=>{sel=i;const [y,u,p]=PH[i];info.innerHTML=`<b>${y}</b>: Arbeitslosenquote ${fmt(u)} %, Inflation ${fmt(p)} %. ${TXT[y]||''}`;draw();if(scroll)info.scrollIntoView({block:'nearest'})};
  const draw=()=>{
    // Handy: Jahreszahlen nur am gewählten Punkt (sonst überlappen sie), die Jahresleiste darunter nennt alle
    const el=$('#ph-svg',root),m=svgMass(el,560),W=m.W,f=m.fs,fl=f(11),fa=f(12),H=380,x0=Math.max(56,fl*2.6+fa+10),x1=W-20,y0=H-fa-fl-22,yt=20,sx=v=>x0+(v-4.5)/(7-4.5)*(x1-x0),sy=v=>y0-v/8*(y0-yt);
    let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Phillips-Diagramm Deutschland 2015 bis 2025">`;
    [0,2,4,6,8].forEach(v=>s+=`<line x1="${x0}" y1="${sy(v)}" x2="${x1}" y2="${sy(v)}" class="s-line"/><text x="${x0-6}" y="${sy(v)+4}" text-anchor="end" class="t-mu" font-size="${fl}">${v} %</text>`);
    const xs=(sx(5)-sx(4.5))<fl*3.4?[4.5,5.5,6.5]:[4.5,5,5.5,6,6.5,7];
    xs.forEach(v=>s+=`<text x="${sx(v)}" y="${y0+fl+7}" text-anchor="middle" class="t-mu" font-size="${fl}">${fmt(v)} %</text>`);
    s+=`<text x="${(x0+x1)/2}" y="${H-8}" text-anchor="middle" class="t-mu" font-size="${fa}">${m.handy?'Arbeitslosenquote (Arbeitsagentur)':'Arbeitslosenquote (Bundesagentur für Arbeit)'}</text><text x="${fa+2}" y="${(y0+yt)/2}" text-anchor="middle" class="t-mu" font-size="${fa}" transform="rotate(-90 ${fa+2} ${(y0+yt)/2})">Inflationsrate (VPI)</text>`;
    s+=`<line x1="${x0}" y1="${sy(2)}" x2="${x1}" y2="${sy(2)}" stroke="var(--ok)" stroke-dasharray="6 4"/><text x="${x1}" y="${sy(2)+fl+3}" text-anchor="end" fill="var(--ok)" class="t-halo" font-size="${fl}">EZB-Ziel 2 %</text>`;
    if(theo){let d='';for(let u=4.6;u<=7;u+=0.05){const pi=0.9+ 3.2/(u-3.6)-0.4;d+=(d?'L':'M')+sx(u).toFixed(1)+','+sy(clamp(pi,0,8)).toFixed(1)}s+=`<path d="${d}" fill="none" stroke="var(--g-W)" stroke-width="2.5"/><text x="${sx(4.62)}" y="${sy(3.9)}" fill="var(--g-W)" class="t-halo" font-size="${f(11.5)}" font-weight="700">theoretische Phillips-Kurve</text>`}
    s+=`<polyline points="${PH.map(([,u,p])=>sx(u)+','+sy(p)).join(' ')}" fill="none" class="s-mu" stroke-width="1.2" stroke-dasharray="2 3"/>`;
    PH.forEach(([y,u,p],i)=>{const st=stag&&y===2023,sch=stag&&y===2022,on=sel===i;s+=`<g class="hexcorner" data-i="${i}"><circle cx="${sx(u)}" cy="${sy(p)}" r="21" fill="transparent"/><circle cx="${sx(u)}" cy="${sy(p)}" r="${st||sch||on?9:6.5}" fill="${st?'var(--bad)':sch?'var(--amb)':'var(--g-P)'}" stroke="${on?'var(--fg)':'var(--surface)'}" stroke-width="${on?3:2}"/>
      ${st||sch||(m.handy&&!on)?'':`<text x="${sx(u)+9}" y="${sy(p)-7}" class="t-fg t-halo" font-size="${fl}"${on?' font-weight="700"':''}>${y}</text>`}</g>`}); // markierte Jahre stehen in der Beschriftung
    // Beschriftung der Stagflation: Zeilen so umbrechen, dass sie rechts nicht aus dem Bild ragt
    const notiz=(x,y,fett,farbe,rest)=>{const n=Math.max(12,Math.floor((W-x-4)/(fl*.53)));return `<text x="${x}" y="${y}" ${farbe} font-size="${fa}" font-weight="700">${fett}</text>`+wrapText(rest,n).map((z,i)=>`<text x="${x}" y="${y+(i+1)*(fl+3)}" class="t-mu t-halo" font-size="${fl}">${z}</text>`).join('')};
    if(stag)s+=notiz(sx(5.3)+16,sy(6.9)-2*(fl+3)-6,'2022: Angebotsschock','class="t-fg"','Preise steigen, Arbeitsmarkt noch stark')+notiz(sx(5.7)+16,sy(5.9)+fa,'2023: Stagflation','fill="var(--bad)"','BIP −1,0 %, mehr Arbeitslose');
    el.innerHTML=s+'</svg>';
    $$('#ph-svg .hexcorner',root).forEach(g=>g.addEventListener('click',()=>zeige(+g.dataset.i,true)));
    $$('#ph-jahre button',root).forEach(b=>{const an=+b.dataset.i===sel;b.classList.toggle('sel',an);b.setAttribute('aria-pressed',an)});
  };
  $$('#ph-jahre button',root).forEach(b=>b.addEventListener('click',()=>zeige(+b.dataset.i)));
  $('#ph-theo',root).addEventListener('click',e=>{theo=!theo;e.currentTarget.setAttribute('aria-pressed',theo);draw()});
  $('#ph-stag',root).addEventListener('click',e=>{stag=!stag;e.currentTarget.setAttribute('aria-pressed',stag);if(stag)sel=null;draw();
    if(stag)info.innerHTML='<b>2022</b> war ein Angebotsschock: Die Preise stiegen stark, die Arbeitslosigkeit sank aber noch, und die Wirtschaft wuchs. <b>2023</b> kam beides zusammen: Inflation 5,9 %, BIP −1,0 %, die Arbeitslosenquote stieg auf 5,7 %. Das ist Stagflation.'});
  draw();beiBreite($('#ph-svg',root),draw);bindErk(root);
}});

/* 10 Politik-Simulator */
const MEAS=[
  {id:'zins',a:'EZB',n:'Leitzins um 0,5 Prozentpunkte erhöhen',e:{P:2,B:-1,W:-1,A:1,V:0,U:-1},d:0,c:'Kredite teurer → Konsum und Investitionen sinken → weniger Preisdruck. Euro wertet auf → Exporte bremsen. Klimainvestitionen werden teurer.'},
  {id:'invest',a:'Bundesregierung',n:'Kreditfinanziertes Investitionsprogramm (Schiene, Netze, Schulen)',e:{P:-1,B:1,W:2,A:1,V:0,U:1},d:2,c:'Staatsnachfrage ↑ → Aufträge für Bau und Industrie → Jobs. Mehr Importe → Überschuss sinkt. Höhere Nachfrage → Preisdruck. Schulden steigen.'},
  {id:'steuer',a:'Bundesregierung',n:'Einkommensteuer für alle senken',e:{P:-1,B:1,W:1,A:1,V:-1,U:-1},d:2,c:'Mehr Netto → Konsum ↑ → Wachstum. Absolut profitieren Besserverdienende stärker. Mehr Konsum → mehr Ressourcenverbrauch. Steuereinnahmen fehlen.'},
  {id:'co2',a:'Bundesregierung',n:'CO₂-Preis deutlich erhöhen, Einnahmen als Klimageld pro Kopf zurück',e:{P:-1,B:0,W:-1,A:0,V:1,U:2},d:0,c:'Fossile Energie teurer → weniger Emissionen, aber höhere Preise. Klimageld entlastet sparsame, oft ärmere Haushalte.'},
  {id:'mindest',a:'Mindestlohnkommission',n:'Mindestlohn kräftig erhöhen',e:{P:-1,B:-1,W:0,A:0,V:2,U:0},d:0,c:'Geringverdiener ↑ → Verteilung besser. Höhere Lohnkosten → Preise ↑; Gefahr von Jobabbau in Niedriglohnbranchen (empirisch umstritten).'},
  {id:'reich',a:'Bundesregierung',n:'Spitzensteuersatz erhöhen, Vermögensteuer wieder erheben',e:{P:0,B:0,W:-1,A:0,V:2,U:0},d:-1,c:'Umverteilung von oben nach unten, Mehreinnahmen. Kritiker: weniger Investitionen und Kapitalflucht. Die Vermögensteuer wird seit 1997 nicht mehr erhoben, nachdem das Bundesverfassungsgericht 1995 die ungleiche Bewertung von Vermögen beanstandet hatte.'},
  {id:'export',a:'Bundesregierung',n:'Industriestrompreis subventionieren, Exporte fördern',e:{P:0,B:1,W:1,A:-1,V:0,U:-1},d:1,c:'Energieintensive Industrie bleibt wettbewerbsfähig → Jobs. Exporte ↑ → Überschuss wächst. Billiger Strom senkt Sparanreize.'},
  {id:'sparen',a:'Bundesregierung',n:'Sparprogramm: Ausgaben kürzen (Schuldenbremse)',e:{P:1,B:-1,W:-1,A:-1,V:-1,U:-1},d:-2,c:'Staatsnachfrage ↓ → weniger Preisdruck, aber Aufträge und Jobs gehen verloren. Kürzungen treffen oft Sozial- und Klimaprogramme. Weniger Importe → Überschuss ↑.'},
  {id:'bremse',a:'Bundesregierung',n:'Energiepreisbremse für Strom und Gas',e:{P:1,B:0,W:1,A:0,V:1,U:-1},d:2,c:'Gemessene Preise sinken sofort, Haushalte werden entlastet. Sparanreiz sinkt → mehr Verbrauch. Sehr teuer für den Staat.'},
  {id:'fach',a:'Bund und Länder',n:'Fachkräfteeinwanderung und Weiterbildungsoffensive',e:{P:0,B:1,W:1,A:0,V:1,U:0},d:1,c:'Engpässe am Arbeitsmarkt sinken, strukturelle Arbeitslosigkeit geht zurück. Wirkt erst nach Jahren.'},
  {id:'lohn',a:'Tarifpartner',n:'Gewerkschaften setzen hohe Lohnabschlüsse durch',e:{P:-1,B:-1,W:1,A:1,V:1,U:0},d:0,c:'Kaufkraft ↑ → Konsum, mehr Importe. Höhere Kosten → Preise ↑, Gefahr Lohn-Preis-Spirale; manche Betriebe stellen weniger ein.'}
];
tool({id:'politik',hinweise:HINWEISE.politik,ch:4,goals:ORDER,title:'Wirtschaftspolitik-Simulator',sub:'Maßnahmen wählen und sehen, wie sich das Sechseck verformt',
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
${schreibfeld(WAND.politik)}
${impuls(IMPULS.politik)}
${erkHTML('politik')}`},
init(root){
  let st='de',on=new Set();
  const MAX=4;
  const calc=()=>{
    const base=START[st].v,res={},dsum=MEAS.filter(m=>on.has(m.id)).reduce((a,m)=>a+m.d,0);
    ORDER.forEach(k=>{res[k]=clamp(base[k]+MEAS.filter(m=>on.has(m.id)).reduce((a,m)=>a+m.e[k]*9,0),0,100)});
    $('#ps-radar',root).innerHTML=radar([{v:base,stroke:'var(--muted)',dash:'6 5',fo:0},{v:res,stroke:'var(--accent)',fill:'var(--accent)',fo:.2}],{label:'Zielerreichung vor und nach den Maßnahmen',el:$('#ps-radar',root)});
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
    return res;
  };
  // Liegt das Sechseck außer Sicht (Handy: es steht weit über den Maßnahmen), kurz einblenden, was sich geändert hat
  const wirkung=(alt,neu,an)=>{const r=$('#ps-radar',root).getBoundingClientRect(),unten=innerHeight-($('#nav-bar')?.offsetHeight||0);
    if(r.bottom>80&&r.top<unten-80)return;
    const d=ORDER.filter(k=>Math.round(neu[k])!==Math.round(alt[k])).map(k=>`${G[k].short} ${sgn(Math.round(neu[k])-Math.round(alt[k]),0)}`).join(' · ');
    zeigeHinweis(`${an?'Maßnahme gewählt':'Maßnahme abgewählt'}. Sechseck oben: ${d||'keine Änderung'}`)};
  $('#ps-m',root).innerHTML=MEAS.map(m=>`<button class="toggle-card" type="button" data-m="${m.id}" aria-pressed="false"><span class="actor">${m.a}</span><b>${m.n}</b>
    <span class="row" style="gap:4px">${ORDER.filter(k=>m.e[k]).map(k=>`<span class="pill ${m.e[k]>0?'ok':'bad'}"><span aria-hidden="true">${k}</span><span class="ms" aria-hidden="true">${Math.abs(m.e[k])>1?(m.e[k]>0?'keyboard_double_arrow_up':'keyboard_double_arrow_down'):(m.e[k]>0?'arrow_upward':'arrow_downward')}</span><span class="sr-only">${G[k].short} ${m.e[k]>0?'steigt':'sinkt'}${Math.abs(m.e[k])>1?' stark':''}</span></span>`).join('')}</span><span class="chain" hidden>${m.c}</span></button>`).join('');
  $$('#ps-m .toggle-card',root).forEach(b=>b.addEventListener('click',()=>{const id=b.dataset.m,alt=calc();on.has(id)?on.delete(id):on.size<MAX&&on.add(id);wirkung(alt,calc(),on.has(id))}));
  $$('[data-st]',root).forEach(b=>b.addEventListener('click',()=>{st=b.dataset.st;$$('[data-st]',root).forEach(x=>x.setAttribute('aria-pressed',x===b));$('#ps-st',root).textContent=START[st].t;calc()}));
  $('#ps-st',root).textContent=START[st].t;calc();beiBreite($('#ps-radar',root),calc);bindErk(root);
}});

/* 11 Deutschland-Check */
const YEARS={
  '2019':{P:1.4,B:5.0,W:1.1,A:7.8,V:0.295,U:36,thg:'≈ 800',lb:'≈ 7,8'},
  '2020':{P:0.5,B:5.9,W:-4.0,A:6.3,V:0.295,U:41,thg:'≈ 730',lb:'≈ 6,3'},
  '2023':{P:5.9,B:5.7,W:-1.0,A:5.5,V:0.295,U:46,thg:'674',lb:'≈ 5,5'},
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
tool({id:'check',hinweise:HINWEISE.check,ch:4,goals:ORDER,title:'Deutschland-Check',sub:'Wie gut erreicht Deutschland die Ziele? Jahre vergleichen – und die Messlatte hinterfragen',
html(){return `
<p class="task"><b>Auftrag:</b> Vergleicht zwei Jahre. In welchem Jahr war das Sechseck am „rundesten“? Prüft dann die Bewertungsregeln: Sind sie fair? Ändert eine Regel und begründet, warum eure besser ist.</p>
<div class="row"><span class="small muted">Jahr A:</span><span id="ck-a" class="row"></span></div>
<div class="row"><span class="small muted">Jahr B (Vergleich):</span><span id="ck-b" class="row"></span></div>
<div class="grid2">
  <div class="panel chart"><div id="ck-radar"></div><div class="legend" id="ck-leg"></div></div>
  <div class="panel"><div class="tbl-wrap"><table><thead><tr><th>Ziel</th><th>Indikator <span id="ck-ya"></span></th><th class="r">Punkte</th><th class="r" id="ck-yb"></th></tr></thead><tbody id="ck-tab"></tbody></table></div>
  <p class="small muted" style="margin-top:8px">* 2026: Prognose der Gemeinschaftsdiagnose (Herbst 2026). Werte gerundet. BIP nach der Überarbeitung durch Destatis (Juli 2026), Leistungsbilanz nach der Bundesbank (Stand Oktober 2026). Gini-Koeffizient seit Jahren nahezu unverändert.</p></div>
</div>
<div class="panel"><h3>Die Messlatte (normative Setzung!)</h3><div class="tbl-wrap"><table><tbody>${ORDER.map(k=>`<tr><td>${hexDot(k)} ${G[k].short}</td><td class="mono small">${SCORE[k].rule}</td></tr>`).join('')}</tbody></table></div>
<p class="small" style="margin-top:8px">Diskussionsfragen: Ist ein Leistungsbilanzüberschuss genauso schlecht wie ein Defizit? Warum 1,75 % Wachstum – und nicht 0 %? Wie misst man „gerechte“ Verteilung mit einer Zahl?</p>
<p class="small" style="margin-top:6px"><b>Regional:</b> Thüringen lag im September 2026 mit einer Arbeitslosenquote von 6,3 % knapp unter dem Bundesdurchschnitt (6,4 %).</p></div>
${schreibfeld(WAND.check)}
${impuls(IMPULS.check)}
${erkHTML('check')}`},
init(root){
  let a='2026*',b='2019';
  const score=(k,y)=>clamp(Math.round(SCORE[k].f(YEARS[y][k])),0,100);
  const btns=(id,get,set)=>{$(id,root).innerHTML=Object.keys(YEARS).map(y=>`<button class="btn small" type="button" data-y="${y}" aria-pressed="${y===get()}">${y}</button>`).join('')+(id==='#ck-b'?`<button class="btn small" type="button" data-y="" aria-pressed="${!get()}">kein Vergleich</button>`:'');
    $$(id+' button',root).forEach(x=>x.addEventListener('click',()=>{set(x.dataset.y);$$(id+' button',root).forEach(z=>z.setAttribute('aria-pressed',z===x));draw()}))};
  const draw=()=>{
    const sa={},sb={};ORDER.forEach(k=>{sa[k]=score(k,a);if(b)sb[k]=score(k,b)});
    const ser=[];if(b)ser.push({v:sb,stroke:'var(--muted)',dash:'6 5',fo:0});ser.push({v:sa,stroke:'var(--accent)',fill:'var(--accent)',fo:.2});
    $('#ck-radar',root).innerHTML=radar(ser,{label:'Zielerreichung Deutschland',el:$('#ck-radar',root)});
    $('#ck-leg',root).innerHTML=`<span><i style="background:var(--accent)"></i>${a}</span>${b?`<span><i style="background:var(--muted)"></i>${b} (gestrichelt)</span>`:''}`;
    $('#ck-ya',root).textContent=a;$('#ck-yb',root).textContent=b?b:'';
    $('#ck-tab',root).innerHTML=ORDER.map(k=>`<tr><td>${hexDot(k)} ${G[k].short}</td><td class="num">${SCORE[k].show(YEARS[a][k],YEARS[a])}</td><td class="r num"><b>${sa[k]}</b></td><td class="r num muted">${b?sb[k]:''}</td></tr>`).join('')+
      `<tr><td><b>Durchschnitt</b></td><td></td><td class="r num"><b>${Math.round(ORDER.reduce((s,k)=>s+sa[k],0)/6)}</b></td><td class="r num muted">${b?Math.round(ORDER.reduce((s,k)=>s+sb[k],0)/6):''}</td></tr>`;
  };
  btns('#ck-a',()=>a,v=>a=v);btns('#ck-b',()=>b,v=>b=v);draw();beiBreite($('#ck-radar',root),draw);bindErk(root);
}});

/* 12b Hefteintrag und Kurztest */
tool({id:'sichern',ch:6,goals:ORDER,hinweise:HINWEISE.sichern,title:'Hefteintrag und Kurztest',sub:'Das Wichtigste ins Heft, Schlagzeilen zuordnen, ein Test mit einem Versuch und der Vergleich mit deinem Bauchgefühl vom Anfang',
html(){return `<p class="task"><b>Auftrag:</b> Sichert das Wichtigste: Füllt den Hefteintrag aus, ordnet die Schlagzeilen den Zielen zu und macht den Kurztest. Jeder Durchgang wird nur einmal geprüft, danach seht ihr die Lösungen. Schaut dann, wie gut euer Bauchgefühl bei den Nachrichten am Anfang war, und beantwortet die Leitfrage.</p>
${lueckentext({id:'sichern-heft',titel:'Hefteintrag: Das magische Sechseck',saetze:[
  'Das [Stabilitäts- und Wachstumsgesetz|Stabilitätsgesetz|StabG] von [1967] nennt vier Ziele: ein stabiles [Preisniveau], einen hohen [Beschäftigungsstand|Beschäftigung], ein außenwirtschaftliches [Gleichgewicht] und ein stetiges und angemessenes [Wirtschaftswachstum|Wachstum].',
  'Später kamen eine gerechte [Einkommens- und Vermögensverteilung|Verteilung|Einkommensverteilung] und der Schutz der natürlichen [Lebensgrundlagen|Umwelt] hinzu.',
  '„Magisch“ heißt das Sechseck, weil sich nicht alle Ziele [gleichzeitig] erreichen lassen. Fördert ein Ziel ein anderes, spricht man von [Zielharmonie], behindert es ein anderes, von einem [Zielkonflikt].',
  'Die Stabilität des Preisniveaus misst man mit dem [Verbraucherpreisindex|VPI], die Verteilung zum Beispiel mit dem [Gini-Koeffizienten|Gini-Koeffizient|Gini].']})}
${zuordnen({id:'sichern-schlagzeilen',frage:'Welches Ziel steht in der Schlagzeile auf dem Spiel? (Die Schlagzeilen sind erfunden.)',
  faecher:ORDER.map(k=>({id:k,t:G[k].short})),
  karten:[{t:'Döner in Jena kostet jetzt 8 Euro',f:'P'},{t:'Autozulieferer in Eisenach meldet Kurzarbeit an',f:'B'},{t:'Thüringer Landkreise bauen Solarparks aus',f:'U'},
    {t:'Deutsche Wirtschaft wächst nur um 0,2 Prozent',f:'W'},{t:'Jeder Sechste in Deutschland gilt als armutsgefährdet',f:'V'},{t:'US-Zölle: Deutsche Exporte brechen ein',f:'A'},
    {t:'EZB erhöht den Leitzins wegen hoher Inflation',f:'P'},{t:'Pflegeheime in Erfurt finden keine Fachkräfte',f:'B'},{t:'Exportüberschuss erreicht neuen Rekord',f:'A'},
    {t:'Dürresommer: Thüringer Wälder leiden',f:'U'},{t:'Gemeinschaftsdiagnose: Aufschwung mit Strukturproblemen',f:'W'},{t:'Das reichste Zehntel besitzt mehr als die Hälfte des Vermögens',f:'V'}]})}
${kurztest({id:'sichern-test',titel:'Kurztest: vier Fragen',fragen:[
  {f:'Seit wann ist der Schutz der natürlichen Lebensgrundlagen ein Staatsziel im Grundgesetz?',o:['1967','1994','2021'],r:1,e:'Art. 20a GG gilt seit 1994. 2021 hat das Bundesverfassungsgericht ihn mit dem Klimabeschluss gestärkt.'},
  {f:'Die EZB erhöht den Leitzins, um die Inflation zu bremsen. Welches Ziel gerät dadurch eher unter Druck?',o:['Wachstum','Umwelt','Außenwirtschaft'],r:0,e:'Höhere Zinsen machen Kredite teurer. Konsum und Investitionen sinken – die Wirtschaft wächst langsamer.'},
  {f:'Welche Zielbeziehung beschreibt die Phillips-Kurve?',o:['Harmonie zwischen Wachstum und Umwelt','Konflikt zwischen Preisniveau und Beschäftigung','Neutralität zwischen Verteilung und Außenwirtschaft'],r:1,e:'Nach der Phillips-Kurve geht weniger Arbeitslosigkeit mit höherer Inflation einher – und umgekehrt.'},
  {f:'Was misst der Gini-Koeffizient?',o:['Wie stark die Preise steigen','Wie ungleich Einkommen oder Vermögen verteilt sind','Wie viel Deutschland exportiert'],r:1,e:'0 heißt: Alle haben gleich viel. 1 heißt: Eine Person hat alles.'}]})}
${blitzAufloesung(NEWS)}
${schreibfeld(WAND.sichern)}
${impuls(IMPULS.sichern)}
${erkHTML('sichern')}`},
init(root){bindErk(root)}});

/* 12c Wissenscheck (Aufgaben in wissenscheck.js) */
tool({id:'wissenscheck',ch:6,goals:ORDER,hinweise:HINWEISE.wissenscheck,title:'Wissenscheck',sub:`${WISSENSCHECK.aufgaben.length} Aufgaben in drei Stufen – Grundlagen, Anwenden, Beurteilen – mit Lösungen, Erwartungshorizont und Auswertung`,
html(){return `<p class="task"><b>Auftrag:</b> Prüf, was du kannst. Fang bei den Grundlagen an und arbeite dich bis zum Beurteilen vor. Die Lösung und bei offenen Aufgaben den Erwartungshorizont – also was in eine gute Antwort gehört – siehst du erst, nachdem du geantwortet hast. Am Ende zeigt dir die Auswertung, was du noch wiederholen solltest.</p>
${wissenscheck(WISSENSCHECK)}
${schreibfeld(WAND.wissenscheck)}
${impuls(IMPULS.wissenscheck)}`},
init(){}});

/* 13 Planspiel (Inhalte in leben.js, Ablauf in shared/js/planspiel.js) */
tool({id:'leben',hinweise:HINWEISE.leben,ch:5,goals:ORDER,title:'Planspiel Sechseck-Leben',sub:'In die Rolle einer Person aus Thüringen schlüpfen, vier Jahre Wirtschaftspolitik erleben – allein oder als ganze Klasse',
html(){return `
<h2 class="sr-only">Das Spiel</h2><!-- Gliederung: Die Überschriften im Planspiel sind h3 -->
<div id="lb-app" class="stack"></div>
${schreibfeld(WAND.leben)}
${impuls(IMPULS.leben)}
${erkHTML('leben')}`},
init(root){
  mountPlanspiel($('#lb-app',root),SPIEL);
  bindErk(root);
}});

/* ---------- Startseite und Wissen ---------- */
function startHTML(){
  return `<section class="banner"><img src="${PHOTOS[2]}" alt="Blick über das Saaletal auf Jena mit dem JenTower"><span class="credit">Foto: Lukas D. / Unsplash</span>
    <div class="banner-text"><p class="eyebrow">Klasse 11 · Soziale Marktwirtschaft · Daten: Oktober 2026</p><h2>Inflation 3,3 %, fast 3 Millionen Arbeitslose, Treibhausgase erst −48 % statt −65 %: Warum kann die Politik nicht einfach alles gleichzeitig reparieren?</h2></div></section>
  <section class="hero"><div class="hero-hex" id="hero-hex">${heroHex(null)}</div>
    <div class="hero-text"><p class="body-l">Das Stabilitätsgesetz von 1967 verpflichtet Bund und Länder auf vier Ziele, Sozialstaat und Umweltschutz kommen als fünftes und sechstes hinzu. In dieser Lernwerkstatt messt ihr jedes Ziel selbst, deckt Zielkonflikte auf und steuert die deutsche Wirtschaftspolitik.</p>
    <div class="lage">${ORDER.map(k=>`<button class="chip media" type="button" style="--gc:${gc(k)}" data-k="${k}" aria-labelledby="lage-${k}"><img src="${GOAL_IMG[k].src}" alt="${esc(GOAL_IMG[k].alt)}"><span class="cbody" id="lage-${k}"><span class="lbl">${hexDot(k)}${G[k].short}</span><b>${G[k].chip}</b><span class="sub">${G[k].chipLab}</span></span></button>`).join('')}</div>
    <p class="small muted">Fotos: ${ORDER.map(k=>esc(GOAL_IMG[k].credit)).join(', ')} / Unsplash</p>
    <p class="hint">Tippt auf eine Ecke, um ihren Steckbrief zu öffnen, oder auf eine Kennzahl, um zur passenden Werkstatt zu springen.</p>
    <div class="cta"><button class="fab" type="button" data-gehzu="nachrichten"><span class="ms" aria-hidden="true">bolt</span>Blitzrunde starten</button><button class="btn outlined" type="button" id="cta-leben"><span class="ms" aria-hidden="true">sports_esports</span>Planspiel starten</button></div></div></section>
  <section class="panel stack"><h3 class="title-m">Was du danach kannst</h3><ul class="lernziele">
    <li><span class="ms" aria-hidden="true">check_circle</span><span>Die sechs Ziele der Wirtschaftspolitik nennen und mit Kennzahlen messen</span></li>
    <li><span class="ms" aria-hidden="true">check_circle</span><span>Inflationsrate, Reallohn, Arbeitslosenquote und Leistungsbilanzsaldo berechnen</span></li>
    <li><span class="ms" aria-hidden="true">check_circle</span><span>Zielharmonie, Zielkonflikt und Zielneutralität an Beispielen erklären</span></li>
    <li><span class="ms" aria-hidden="true">check_circle</span><span>Wirtschaftspolitische Maßnahmen mit ihren Haupt- und Nebenwirkungen beurteilen</span></li>
    <li><span class="ms" aria-hidden="true">check_circle</span><span>Die Leitfrage beantworten: Warum muss die Politik Ziele gewichten?</span></li></ul></section>
  ${chapterHTML(1)}
  <section class="section-h"><h2>Dein Lernpfad</h2><p>Die Bereiche bauen aufeinander auf. In „Ziele“ nimmt sich jede Werkstatt ein Ziel vor und misst es mit echten Zahlen. Jede Werkstatt endet mit einer Erkenntnis, die als Merksatz in „Mein Sechseck-Wissen“ landet – gesammelt ergibt das den Hefteintrag.</p></section>
  <div class="dest-cards">${DEST.slice(1).map(d=>`<button class="dest" type="button" data-dest="${d.id}"><span class="ic"><span class="ms" aria-hidden="true">${d.icon}</span></span><span><span class="title-m">${d.label}</span><span class="small muted" style="display:block">${d.desc}</span></span></button>`).join('')}</div>`;
}
function sourcesHTML(){return `<section class="panel sources"><h3 class="title-m" style="color:var(--md-on-surface)">Quellen und Datenstand (gerundet, Oktober 2026)</h3><ul>
  <li>Destatis: Verbraucherpreise September 2026 (Pressemitteilung Nr. 364 vom 13.10.2026), Jahresinflation 2025, Armutsgefährdung 2025; BIP 2019 bis 2025 und 2. Quartal 2026 nach der Sommerüberarbeitung 2026 (Pressemitteilungen Nr. 269 vom 30.07.2026 und Nr. 303 vom 25.08.2026); Außenhandel 2024; Baufertigstellungen 2023</li>
  <li>Thüringer Landesamt für Statistik: Verbraucherpreise in Thüringen im September 2026 (Pressemitteilung 248/2026 vom 05.10.2026)</li>
  <li>ADAC: Spritpreise im September 2025 und September 2026 (Pressemitteilungen vom 01.10.2025 und 01.10.2026) und nach dem Tankrabatt (07.10.2026)</li>
  <li>Bundesagentur für Arbeit: Arbeitsmarkt im September 2026 (Presseinfo Nr. 37 vom 30.09.2026), Kurzarbeit Juli 2026 und April 2020; Regionaldirektion Sachsen-Anhalt-Thüringen: Arbeitsmarkt in Thüringen im September 2026 (Presseinfo Nr. 62 vom 30.09.2026)</li>
  <li>Deutsche Bundesbank: Zahlungsbilanzstatistik, Leistungsbilanz und Teilbilanzen (Stand 13.10.2026); Studie „Private Haushalte und ihre Finanzen“, Befragung 2021 (Vermögensverteilung: reichstes Zehntel rund 56 % des Nettovermögens)</li>
  <li>Europäische Zentralbank: Leitzinsen (Einlagensatz 2,25 % ab 17.06.2026, 2,50 % ab 16.09.2026)</li>
  <li>Gemeinschaftsdiagnose Herbst 2026 „Aufschwung mit Strukturproblemen“ (24.09.2026): Prognosen BIP, Inflation, Arbeitslosenquote, Leistungsbilanz</li>
  <li>Umweltbundesamt: Treibhausgas-Emissionen in Deutschland 2025; Projektionsdaten 2026 (14.03.2026)</li>
  <li>Bundesministerium für Ernährung und Landwirtschaft: Erntebericht 2018 (Dürre)</li>
  <li>Bundesamt für Umwelt (Schweiz): CO₂-Abgabe und Merkblatt zur Rückverteilung 2026 (61,80 Franken pro Person)</li>
  <li>Gesetzestexte: § 1 StabG (08.06.1967), Art. 20 und 20a GG, Art. 127 AEUV, Bundes-Klimaschutzgesetz; § 2 und § 68 Energiesteuergesetz mit den Tankrabatten 2026 (BGBl. 2026 I Nr. 116 und Nr. 275); § 10 BEHG (CO₂-Preis 2026) und Gesetzentwurf für 2027 (BT-Drucksache 21/7869); § 9 EStG (Entfernungspauschale); Fünfte Mindestlohnanpassungsverordnung und § 8 SGB IV (Minijob-Grenze); §§ 105 und 149 SGB III (Kurzarbeitergeld, Arbeitslosengeld); § 19 SGB II (Grundsicherungsgeld seit 01.07.2026)</li>
  <li>Deutschlandticket: Beschluss der Verkehrsministerkonferenz vom 18.09.2025 (63 € ab Januar 2026) und vom 30.09.2026 (66,80 € ab Januar 2027, erstmals nach einem Kostenindex; Stand Oktober 2026); Correctiv-Faktencheck vom 15.01.2026 zum TikTok-Video über 129,99 €</li>
  <li>Industriestrompreis: Genehmigung der EU-Kommission vom 16.04.2026, gilt rückwirkend ab 01.01.2026 bis 2028 (Zielpreis rund 5 ct/kWh für höchstens die Hälfte des Verbrauchs, rund 90 Branchen, rund 3,8 Mrd. €, Anträge beim BAFA ab Anfang 2027; Stand Oktober 2026)</li>
  <li>Alle Personen im Planspiel und in den Fällen sowie alle Social-Media-Posts sind erfunden (fiktiv).</li>
  <li>Fotos: engin akyurt, Jacob Meissner, Lukas D., Md. Hasanuzzaman Himel, Yosuke Ota, Remy Gieling, Artem Labunsky, Wolfgang Weiser, Karsten Würth, Marcel Strauß – alle über Unsplash (Unsplash-Lizenz)</li></ul>
  <p>Modellwerkzeuge (Simulator, Planspiel, Bewertungsskalen) sind didaktische Vereinfachungen und keine Prognosen. Spielstände und Merksätze werden nur in diesem Browser gespeichert.</p>
  <div class="row"><button class="btn outlined small" id="reset" type="button"><span class="ms" aria-hidden="true">restart_alt</span>Merksätze zurücksetzen</button><span id="reset-confirm" class="row" hidden><button class="btn primary small" id="reset-yes" type="button">Ja, alles zurücksetzen</button><button class="btn text small" id="reset-no" type="button">Abbrechen</button></span></div></section>`}
function wissenHTML(){return chapterHTML(6,`<button class="card" type="button" data-open="glossar"><span class="dots">${ORDER.map(hexDot).join('')}</span><h3 class="title-m">Begriffe nachschlagen</h3><p>${GLOSS.length} Fachbegriffe mit Suche</p><span class="go">Öffnen<span class="ms sm" aria-hidden="true">arrow_forward</span></span></button><button class="card" type="button" data-open="wissen"><span class="dots">${ORDER.map(hexDot).join('')}</span><h3 class="title-m">Mein Sechseck-Wissen</h3><p>Alle Merksätze als Hefteintrag sammeln und kopieren</p><span class="go">Öffnen<span class="ms sm" aria-hidden="true">arrow_forward</span></span></button>`)+sourcesHTML()}

W.start();
