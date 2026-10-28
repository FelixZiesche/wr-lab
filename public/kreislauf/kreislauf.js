// Lernwerkstatt Der Wirtschaftskreislauf (Klasse 9): Ein Euro auf Reise, dann bauen die Schüler den Kreislauf in vier Stufen
// selbst (einfach, Banken, Staat, Ausland) und lassen danach Schockwellen durch ihn laufen, allein oder live mit der Klasse.
// Gerüst, Navigation und Aufgaben-Bausteine kommen aus /shared/, das Diagramm aus modell.js, hier stehen nur die Inhalte.
import { $, $$, esc, fmt, store } from '../shared/js/ui.js';
import { createWerkstatt } from '../shared/js/werkstatt.js';
import { schreibfeld, lueckentext, wissenscheck, impuls, abstimmung } from '../shared/js/aufgaben.js';
import { bauHTML, bindBau, bauStand, wellenHTML, bindWellen, tafelHTML, bindTafel } from './modell.js';
import { reiseHTML, bindReise } from './reise.js';
import { STAND, ZAHLEN, FOTO } from './daten.js';
import { HINWEISE, WAND, IMPULS } from './wand.js';
import { WISSENSCHECK } from './wissenscheck.js';

const P='wk';

/* ---------- Merksätze ---------- */
const MS={
  euro:['Geld fließt im Kreis: Was der eine ausgibt, ist für den anderen Einkommen. Zu jedem Geldstrom gibt es einen Gegenstrom aus Gütern oder Arbeit.'],
  einfach:['Der Wirtschaftskreislauf ist ein Modell, also eine vereinfachte Darstellung der Wirklichkeit. Gleichartige Wirtschaftseinheiten werden zu Sektoren zusammengefasst.',
    'Im einfachen Kreislauf stellen die Haushalte den Unternehmen Produktionsfaktoren (Arbeit) zur Verfügung und bekommen dafür Einkommen (Y). Die Unternehmen liefern Konsumgüter und bekommen dafür die Konsumausgaben (CH). Die Haushalte geben ihr ganzes Einkommen aus: Y = CH.'],
  banken:['Was die Haushalte nicht ausgeben, sparen sie (SH). Die Banken (Vermögensveränderung) geben das Ersparte als Kredit an die Unternehmen weiter, die damit investieren (In). Im Gleichgewicht gilt S = I.'],
  staat:['Der Staat nimmt direkte Steuern von den Haushalten (Tdir) und indirekte Steuern von den Unternehmen (Tind) ein. Er zahlt Transfers an Haushalte (ZH), Subventionen an Unternehmen (ZU) und kauft selbst ein (CSt). Was fehlt, leiht er sich bei den Banken (KRSt).'],
  ausland:['Für Exporte (X) fließt Geld aus dem Ausland zu den Unternehmen, für Importe (M) fließt Geld ins Ausland. Der Unterschied X − M heißt Außenbeitrag. Deutschland hat einen Exportüberschuss.'],
  schockwellen:['Jeder Sektor ist ausgeglichen: Zuflüsse = Abflüsse. Ändert ein Ereignis einen Strom, ändern sich in einer Wirkungskette auch andere Ströme, bis wieder alles ausgeglichen ist.'],
  sichern:['Der erweiterte Wirtschaftskreislauf verbindet fünf Sektoren: Haushalte, Unternehmen, Banken, Staat und Ausland. Er hilft, Folgen von Ereignissen abzuschätzen, lässt aber Preise, Zeit und vieles aus der Wirklichkeit weg.']
};

/* ---------- Glossar ---------- */
const GLOSS=[
  ['Außenbeitrag (X − M)','Exporte minus Importe. Ist er positiv, verkauft ein Land mehr ins Ausland, als es von dort kauft (Exportüberschuss).'],
  ['Ausgeglichener Sektor','Zuflüsse und Abflüsse eines Sektors sind gleich groß. Im Kreislaufmodell gilt das für jeden Sektor.'],
  ['C<sub>H</sub> (Konsumausgaben der Haushalte)','Alle Ausgaben der privaten Haushalte für Güter und Dienstleistungen, zum Beispiel Döner, Handyvertrag oder Miete.'],
  ['C<sub>St</sub> (Konsum des Staates)','Käufe des Staates bei Unternehmen, zum Beispiel Tablets für Schulen, Straßenbau oder Polizeiautos.'],
  ['Direkte Steuern (T<sub>dir</sub>)','Steuern auf Einkommen und Vermögen, die die Haushalte selbst an den Staat zahlen, zum Beispiel die Lohnsteuer.'],
  ['Ersatzinvestitionen (D = I<sub>e</sub>)','Investitionen, die Verschlissenes ersetzen, zum Beispiel einen alten Ofen durch einen neuen. Sie bleiben innerhalb der Unternehmen.'],
  ['Exporte (X)','Waren und Dienstleistungen, die ins Ausland verkauft werden. Im Kreislauf: Geld aus dem Ausland an die Unternehmen.'],
  ['Geldstrom','Geld, das von einem Sektor zum anderen fließt, zum Beispiel Lohn oder Konsumausgaben.'],
  ['Güterstrom','Güter, Dienstleistungen oder Arbeit, die von einem Sektor zum anderen fließen. Zu jedem Güterstrom gibt es einen Geldstrom in die Gegenrichtung.'],
  ['Importe (M)','Waren und Dienstleistungen, die aus dem Ausland gekauft werden. Im Kreislauf: Geld von den Unternehmen ans Ausland.'],
  ['Indirekte Steuern (T<sub>ind</sub>)','Steuern, die im Preis stecken, zum Beispiel die Mehrwertsteuer. Die Unternehmen führen sie an den Staat ab.'],
  ['KR<sub>St</sub> (Kreditaufnahme des Staates)','Geld, das sich der Staat bei den Banken leiht, wenn seine Einnahmen nicht reichen.'],
  ['Modell','Vereinfachte Darstellung der Wirklichkeit. Es funktioniert nur unter bestimmten Annahmen, zeigt aber die wichtigen Zusammenhänge.'],
  ['Nettoinvestitionen (I<sub>n</sub>)','Investitionen, die etwas Neues schaffen, zum Beispiel eine neue Fabrikhalle. Bezahlt mit Krediten aus dem Ersparten.'],
  ['Produktionsfaktoren','Was man zum Produzieren braucht: Arbeit, Boden und Kapital. Die Haushalte stellen sie den Unternehmen zur Verfügung.'],
  ['S<sub>H</sub> (Sparen der Haushalte)','Der Teil des Einkommens, den die Haushalte nicht ausgeben. Er fließt zu den Banken.'],
  ['Sektor','Gruppe gleichartiger Wirtschaftseinheiten, zum Beispiel alle privaten Haushalte oder alle Unternehmen.'],
  ['Sparparadox','Wenn alle gleichzeitig mehr sparen, sinkt der Konsum. Die Unternehmen verkaufen weniger, das Einkommen sinkt, und am Ende kann sogar weniger gespart werden.'],
  ['Sparquote','Anteil des verfügbaren Einkommens, der gespart wird. In Deutschland 10,3 % (1. Halbjahr 2025).'],
  ['Subventionen (Z<sub>U</sub>)','Geld vom Staat an Unternehmen, um bestimmte Branchen oder Regionen zu fördern.'],
  ['Transferzahlungen (Z<sub>H</sub>)','Geld vom Staat an Haushalte ohne direkte Gegenleistung, zum Beispiel Kindergeld, Rente oder Bürgergeld.'],
  ['Vermögensveränderung (VV)','Anderer Name für den Sektor Banken: Hier wird gespart und von hier fließt das Geld als Kredit weiter.'],
  ['Volkseinkommen (Y)','Alle Einkommen der Haushalte für ihre Produktionsfaktoren: Löhne, Gehälter, Mieten, Zinsen und Gewinne.'],
  ['Wirkungskette','Folge von Ursache und Wirkung: Ein Ereignis ändert einen Strom, das ändert den nächsten und so weiter.']
];

/* ---------- Kapitel und Bereiche ---------- */
const CH={1:['Kapitel 1 – Einstieg','Ein Euro auf Reise'],2:['Kapitel 2 – Der einfache Kreislauf','Haushalte und Unternehmen'],
  3:['Kapitel 3 – Der erweiterte Kreislauf','Banken, Staat und Ausland, Stufe für Stufe'],4:['Kapitel 4 – Schockwellen','Ein Ereignis trifft den Kreislauf'],5:['Kapitel 5 – Sichern','Hefteintrag und Wissenscheck']};
const DEST=[
  {id:'start',icon:'home',label:'Start',title:'Lernwerkstatt Der Wirtschaftskreislauf',kurz:'Kreislauf',render:startHTML},
  {id:'einstieg',icon:'euro',label:'Euro',title:'Ein Euro auf Reise',kurz:'Euro',ch:[1],desc:'Wohin wandert Peters Euro? Tippe jede Station.'},
  {id:'bauen',icon:'sync_alt',label:'Bauen',title:'Den Kreislauf bauen',kurz:'Bauen',ch:[2,3],desc:'Vom einfachen zum erweiterten Kreislauf: Du zeichnest jeden Pfeil selbst.'},
  {id:'wellen',icon:'waves',label:'Schocks',title:'Schockwellen',kurz:'Schocks',ch:[4],desc:'Mindestlohn, Zölle, Sparwelle: Welche Pfeile werden dicker, welche dünner?'},
  {id:'wissen',icon:'school',label:'Wissen',title:'Sichern und wiederholen',ch:[5],render:wissenHTML,desc:'Tafelbild, Hefteintrag, Wissenscheck mit Klassen-Quiz und Fachbegriffe'}
];
const dot=k=>`<span class="wk-dot ${k}" aria-hidden="true"></span>`;

const W=createWerkstatt({
  thema:'kreislauf',
  speicher:P,
  logo:'<svg aria-hidden="true" width="40" height="40" viewBox="0 0 42 42"><path d="M21 7a14 14 0 0 1 13.4 10" fill="none" stroke="var(--wk-geld)" stroke-width="3.5" stroke-linecap="round"/><path d="M35 25A14 14 0 0 1 9 30" fill="none" stroke="var(--wk-gut)" stroke-width="3.5" stroke-linecap="round"/><path d="M7.4 22A14 14 0 0 1 14 9" fill="none" stroke="var(--md-primary)" stroke-width="3.5" stroke-linecap="round"/><path d="M31 15l3.6 3 2-4.4z" fill="var(--wk-geld)"/><path d="M12 33.6l-4.4-2.4 4.4-1.8z" fill="var(--wk-gut)"/><path d="M11.4 7.6l4 .8-2.6 3.6z" fill="var(--md-primary)"/></svg>',
  bereiche:DEST,
  kapitel:CH,
  merksaetze:MS,
  wissenTitel:'Mein Kreislauf-Wissen',
  glossar:GLOSS,
  punkte:x=>x.farben.map(dot).join(''),
  beimZeigen(id,v){
    $$('[data-wk-tool]',v).forEach(b=>b.addEventListener('click',()=>openTool(b.dataset.wkTool)));
    if($('#reset',v)){
      $('#reset',v).addEventListener('click',()=>{$('#reset-confirm',v).hidden=false});
      $('#reset-no',v).addEventListener('click',()=>{$('#reset-confirm',v).hidden=true});
      $('#reset-yes',v).addEventListener('click',()=>W.resetWissen());
    }
  }
});
const {tool,erkHTML,bindErk,openTool,chapterHTML}=W;

/* ---------- Fotos mit Bildnachweis ---------- */
function nachweis(k){const f=FOTO[k];const [wer,lizenz]=f.credit.split(', ');
  return `Foto: <a href="${f.link}" rel="noopener" target="_blank">${esc(wer)}</a>, <a href="${f.lizenz}" rel="noopener" target="_blank">${esc(lizenz)}</a>`}

/* 1 Ein Euro auf Reise */
tool({id:'euro',ch:1,farben:['g','w'],hinweise:HINWEISE.euro,title:'Ein Euro auf Reise',sub:'Peters Euro wandert durch fünf Hände. Wohin geht er als Nächstes?',
html(){return `<p class="task"><b>Auftrag:</b> Tippe an jeder Station, wohin der Euro als Nächstes wandert.</p>
${reiseHTML()}
${schreibfeld(WAND.euro)}
${impuls(IMPULS.euro)}
${erkHTML('euro')}`},
init(root){bindReise(root);bindErk(root)}});

/* 2 bis 5 Den Kreislauf bauen, Stufe für Stufe */
const STUFE_TOOLS=[
  {id:'einfach',n:1,ch:2,farben:['g','w'],title:'Stufe 1: Der einfache Kreislauf',sub:'Peter, Murat und Mr. Kebab: Zeichne die vier Ströme zwischen Haushalten und Unternehmen ein',
    auftrag:'Wähl eine Karte und zeichne den Pfeil: erst den Start antippen, dann das Ziel. Entscheide danach, ob Geld oder Güter fließen.'},
  {id:'banken',n:2,ch:3,farben:['g','b'],title:'Stufe 2: Die Banken',sub:'Was passiert, wenn die Haushalte sparen? Bau die Banken ein und schließ die Lücke',
    auftrag:'Stimm erst ab. Schieb dann am Regler, wie viel gespart wird, und schließ die Lücke mit zwei neuen Pfeilen.'},
  {id:'staat',n:3,ch:3,farben:['g','s'],title:'Stufe 3: Der Staat',sub:'Steuern, Kindergeld, Subventionen, Tablets für eure Schule: sechs neue Pfeile',
    auftrag:'Zeichne die sechs Ströme zwischen dem Staat und den anderen Sektoren ein. Rechne dann aus, wie viel sich der Staat leihen muss.'},
  {id:'ausland',n:4,ch:3,farben:['g','a'],title:'Stufe 4: Das Ausland',sub:'Autoteile nach Frankreich, Smartphones aus China: Der Kreislauf wird offen',
    auftrag:'Zeichne Exporte, Importe und den Außenbeitrag ein. Dann sind alle fünf Sektoren verbunden.'}
];
// Stufe 2: die Lücke, die das Sparen reißt
const luecke=()=>`<section class="aufgabe stack wk-luecke" data-wk-luecke><p class="aufgabe-kopf"><span class="ms sm" aria-hidden="true">savings</span>Die Lücke</p>
  <div class="ctrl"><label for="wk-spar">Die Haushalte sparen von 100 Mrd. € <output id="wk-spar-o"></output></label><input type="range" id="wk-spar" min="0" max="30" step="1" value="15"></div>
  <div class="wk-balken-box" aria-hidden="true">
    <p class="small">Unternehmen zahlen an Löhnen (Y)</p><div class="wk-balken"><span class="geld" style="width:100%">Y 100</span></div>
    <p class="small">Unternehmen nehmen ein</p><div class="wk-balken" data-wk-ein></div></div>
  <div data-wk-luecke-fb role="status"></div></section>`;
function bindLuecke(root){
  const box=$('[data-wk-luecke]',root);if(!box)return;
  const r=$('#wk-spar',box);
  function zeige(){
    const s=+r.value,st=bauStand(2),zu=st.ok.includes('sh')&&st.ok.includes('in');
    $('#wk-spar-o',box).textContent=`${s} Mrd. €`;
    $('[data-wk-ein]',box).innerHTML=`<span class="geld" style="width:${100-s}%">C<sub>H</sub> ${100-s}</span>${s?(zu?`<span class="invest" style="width:${s}%">I<sub>n</sub> ${s}</span>`:`<span class="loch" style="width:${s}%">fehlt</span>`):''}`;
    $('[data-wk-luecke-fb]',box).innerHTML=!s?'<p class="small">Niemand spart: Alles Einkommen kommt als Konsum zurück.</p>'
      :zu?`<div class="fb ok"><b>Lücke geschlossen.</b> Die Banken leihen die ${s} Mrd. € den Unternehmen, die damit investieren.</div>`
      :`<div class="fb bad"><b>Es fehlen ${s} Mrd. €.</b> Die Unternehmen bleiben auf Waren sitzen. Wo ist das Geld?</div>`;
  }
  r.addEventListener('input',zeige);root.addEventListener('wk-bau',zeige);zeige();
}
STUFE_TOOLS.forEach(t=>tool({id:t.id,ch:t.ch,farben:t.farben,hinweise:HINWEISE[t.id],title:t.title,sub:t.sub,
html(){return `<p class="task"><b>Auftrag:</b> ${t.auftrag}</p>
${t.n===2?abstimmung({id:'wk-sparen',kopf:'Ihr seid die Wirtschaftsforscher',icon:'insights',titel:'Alle sparen',
  fall:`<p>In Deutschland legen die Haushalte von 100 € Einkommen im Schnitt <b>${fmt(ZAHLEN.sparquote,2)} €</b> zur Seite.</p><p class="small muted">Sparquote 1. Halbjahr 2025, Statistisches Bundesamt</p>`,
  frage:'Was bedeutet das Sparen für die Unternehmen?',
  optionen:['Ihnen fehlt Geld: Sie verkaufen weniger, als sie an Löhnen gezahlt haben','Nichts, das Geld bleibt ja im Land','Sie verdienen mehr, weil die Haushalte reicher werden'],r:0,
  e:'Was gespart wird, kommt nicht als Konsum bei den Unternehmen an. Es entsteht eine Lücke. Geschlossen wird sie erst, wenn das Gesparte über die Banken als Kredit zu den Unternehmen fließt.'})+luecke():''}
${bauHTML(t.n)}
${schreibfeld(WAND[t.id])}
${impuls(IMPULS[t.id])}
${erkHTML(t.id)}`},
init(root){bindBau(root);bindLuecke(root);bindErk(root)}}));

/* 6 Schockwellen */
tool({id:'schockwellen',ch:4,farben:['g','b','s','a'],hinweise:HINWEISE.schockwellen,title:'Schockwellen',sub:'Sieben Ereignisse treffen den Kreislauf. Stimm ab, dann löst du die Welle aus',
html(){return `<p class="task"><b>Auftrag:</b> Wähl ein Ereignis und stimm ab, was passiert. Dann löst du die Welle aus und siehst, welche Pfeile dicker und welche dünner werden.</p>
${wellenHTML()}
${schreibfeld(WAND.schockwellen)}
${impuls(IMPULS.schockwellen)}
${erkHTML('schockwellen')}`},
init(root){bindWellen(root);bindErk(root)}});

/* 7 Sichern: Tafelbild und Hefteintrag */
tool({id:'sichern',ch:5,farben:['g','w','b','s','a'],hinweise:HINWEISE.sichern,title:'Tafelbild und Hefteintrag',sub:'Der ganze Kreislauf auf einen Blick, der Hefteintrag und deine Modellkritik',
html(){return `<p class="task"><b>Auftrag:</b> Vergleiche das Tafelbild mit deinem Arbeitsblatt. Vervollständige dann den Hefteintrag.</p>
${tafelHTML()}
${lueckentext({id:'wk-sichern-lt',titel:'Hefteintrag: Der Wirtschaftskreislauf',saetze:[
  'Der Wirtschaftskreislauf ist ein [Modell]: eine vereinfachte Darstellung der Wirklichkeit.',
  'Im einfachen Kreislauf stellen die [Haushalte] den [Unternehmen] Arbeit zur Verfügung und bekommen dafür [Einkommen].',
  'Zu jedem Güterstrom gibt es einen [Geldstrom] in die Gegenrichtung.',
  'Was die Haushalte nicht ausgeben, [sparen] sie. Die [Banken] verleihen es an die Unternehmen, die damit [investieren].',
  'Der [Staat] nimmt Steuern ein und zahlt Transfers, Subventionen und den Staatskonsum.',
  'Für [Exporte] fließt Geld aus dem Ausland zu uns, für [Importe] fließt Geld ins Ausland.',
  'Jeder Sektor ist [ausgeglichen]: Zuflüsse und Abflüsse sind gleich groß.']})}
${schreibfeld(WAND.sichern)}
${impuls(IMPULS.sichern)}
${erkHTML('sichern')}`},
init(root){bindTafel(root);bindErk(root)}});

/* 8 Wissenscheck */
tool({id:'wissenscheck',ch:5,farben:['g','w','b','s','a'],hinweise:HINWEISE.wissenscheck,title:'Wissenscheck',sub:`${WISSENSCHECK.aufgaben.length} Aufgaben in drei Stufen mit Feedback zu jeder Antwort – auch als Klassen-Quiz im Lernraum`,
html(){return `<p class="task"><b>Auftrag:</b> Prüfe dein Wissen in drei Stufen: Grundlagen, Anwenden, Beurteilen. Läuft ein Lernraum, kann eure Lehrkraft den Wissenscheck als Klassen-Quiz starten.</p>
${wissenscheck(WISSENSCHECK)}`},
init(){}});

/* ---------- Startseite und Wissen ---------- */
function startHTML(){
  return `<section class="banner"><img src="${FOTO.baeckerei.src}" alt="${esc(FOTO.baeckerei.alt)}"><span class="credit">${nachweis('baeckerei')}</span>
    <div class="banner-text"><p class="eyebrow">Leitfrage · Klasse 9 · Rolle der Unternehmen</p><h2>Wohin fließt dein Geld, wenn du es ausgegeben hast?</h2></div></section>
  <section class="wk-start-grid">
    <div class="stack">
      <div class="wk-zahl"><p class="display-s num">${fmt(ZAHLEN.sparquote,2)} €</p><p>von 100 € legen die Haushalte in Deutschland zur Seite. Wohin fließt dieses Geld, und was fehlt dann?<span class="small muted" style="display:block">Sparquote 1. Halbjahr 2025, Statistisches Bundesamt</span></p></div>
      <p class="body-l">Ein Döner bei Mr. Kebab in Jena: Dein Geld ist weg, aber nicht verschwunden. Verfolge es, bau daraus Schritt für Schritt den Kreislauf der ganzen Wirtschaft und schick Schockwellen hindurch.</p>
      <div class="cta"><button class="fab" type="button" data-wk-tool="euro"><span class="ms" aria-hidden="true">play_arrow</span>Ein Euro auf Reise</button><button class="btn outlined" type="button" data-wk-tool="einfach"><span class="ms" aria-hidden="true">draw</span>Kreislauf bauen</button></div></div>
    <div class="panel stack"><h3 class="title-m">Was du danach kannst</h3><ul class="lernziele">
      <li><span class="ms" aria-hidden="true">check_circle</span><span>Den einfachen Wirtschaftskreislauf mit Geld- und Güterströmen zeichnen und erklären</span></li>
      <li><span class="ms" aria-hidden="true">check_circle</span><span>Banken, Staat und Ausland einbauen: der erweiterte Kreislauf</span></li>
      <li><span class="ms" aria-hidden="true">check_circle</span><span>Mit der Regel „Zuflüsse = Abflüsse“ fehlende Ströme berechnen</span></li>
      <li><span class="ms" aria-hidden="true">check_circle</span><span>Wirkungsketten erklären, wenn ein Ereignis den Kreislauf trifft</span></li></ul></div>
  </section>
  ${chapterHTML(1)}
  <section class="section-h"><h2>Dein Lernpfad</h2><p>Erst verfolgst du einen Euro. Dann baust du den Kreislauf in vier Stufen, vom einfachen bis zum erweiterten. Zum Schluss schickst du Schockwellen hindurch, allein oder live mit der Klasse.</p></section>
  <ol class="wk-pfad">${[['euro','euro','Ein Euro auf Reise'],['looks_one','einfach','Einfacher Kreislauf'],['looks_two','banken','+ Banken'],['looks_3','staat','+ Staat'],['looks_4','ausland','+ Ausland'],['waves','schockwellen','Schockwellen']].map(([ic,id,t])=>`<li><button class="btn outlined" type="button" data-wk-tool="${id}"><span class="ms" aria-hidden="true">${ic}</span>${t}</button></li>`).join('')}</ol>
  <div class="dest-cards">${DEST.slice(1).map(d=>`<button class="dest" type="button" data-dest="${d.id}"><span class="ic"><span class="ms" aria-hidden="true">${d.icon}</span></span><span><span class="title-m">${d.label}</span><span class="small muted" style="display:block">${d.desc}</span></span></button>`).join('')}</div>`;
}
const QUELLEN=[
  'Statistisches Bundesamt: Sparquote der privaten Haushalte im 1. Halbjahr 2025: 10,3 % (Pressemitteilung vom Oktober 2025)',
  'Statistisches Bundesamt: Außenhandel 2025, Pressemitteilung vom Februar 2026 (Exporte 1.563,0 Mrd. €, Importe 1.362,5 Mrd. €, Überschuss 200,5 Mrd. €, Autoexporte in die USA −17,8 %)',
  'Mindestlohnkommission: Beschluss vom Juni 2025 (13,90 € ab Januar 2026, 14,60 € ab Januar 2027); Kindergeld 259 € (2026)',
  'Lehrplan Wirtschaft und Recht, Gymnasium Thüringen: Klasse 9, Rolle der Unternehmen (einfacher Wirtschaftskreislauf); Klasse 11/12, Im Kreislauf der Wirtschaft (5-Sektoren-Modell)',
  'Unterrichtsmaterial der Lehrkraft: Folien „1.5 Der einfache Wirtschaftskreislauf“, Arbeitsblatt „Peter und sein Döner“, M1 Taschengeld, M3 Einnahmen und Ausgaben des Staates (Inhalte neu geschrieben)'];
function sourcesHTML(){return `<section class="panel sources"><h3 class="title-m" style="color:var(--md-on-surface)">Quellen (Stand ${STAND})</h3><ul>${QUELLEN.map(q=>`<li>${q}</li>`).join('')}
  <li>Fotos: ${Object.values(FOTO).map(f=>`${esc(f.motiv)}: <a href="${f.link}" rel="noopener" target="_blank">${esc(f.credit.split(', ')[0])}</a> (<a href="${f.lizenz}" rel="noopener" target="_blank">${esc(f.credit.split(', ')[1])}</a>)`).join(' · ')}</li>
  <li>Peter, Murat, Sandra, Lena, Mr. Kebab und alle anderen Personen und Firmen sind erfunden. Die Beträge im Kreislauf sind gedachte Milliarden (Szenario), gewählt, damit jeder Sektor ausgeglichen ist.</li></ul>
  <p>Merksätze und Ergebnisse werden nur in diesem Browser gespeichert. Im Lernraum gehen bei den Abstimmungen nur die gewählte Antwort als kleine Zahl und beim Wissenscheck nur Punkte an die Datenbank des Raums.</p>
  <div class="row"><button class="btn outlined small" id="reset" type="button"><span class="ms" aria-hidden="true">restart_alt</span>Merksätze zurücksetzen</button><span id="reset-confirm" class="row" hidden><button class="btn primary small" id="reset-yes" type="button">Ja, alles zurücksetzen</button><button class="btn text small" id="reset-no" type="button">Abbrechen</button></span></div></section>`}
function wissenHTML(){const alle=['g','w','b','s','a'].map(dot).join('');
  return chapterHTML(5,`<button class="card" type="button" data-open="glossar"><span class="dots">${alle}</span><h3 class="title-m">Begriffe nachschlagen</h3><p>${GLOSS.length} Fachbegriffe und Kürzel mit Suche</p><span class="go">Öffnen<span class="ms sm" aria-hidden="true">arrow_forward</span></span></button><button class="card" type="button" data-open="wissen"><span class="dots">${alle}</span><h3 class="title-m">Mein Kreislauf-Wissen</h3><p>Alle Merksätze als Hefteintrag sammeln und kopieren</p><span class="go">Öffnen<span class="ms sm" aria-hidden="true">arrow_forward</span></span></button>`)+sourcesHTML()}

W.start();
