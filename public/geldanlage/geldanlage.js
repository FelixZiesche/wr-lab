// Lernwerkstatt Anlagemöglichkeiten (Klasse 9): Geldschmelze, Dreieck der Geldanlage, Anlage-Check, Anlageberatung,
// Schneeball-Rechner, Depot-Zeitmaschine, goldene Regeln und das Chat-Abenteuer mit dem Wolf of Saale (fiktiv).
// Gerüst, Navigation und Aufgaben-Bausteine kommen aus /shared/, hier stehen nur die Inhalte.
import { $, $$, esc, fmt, clamp, store, svgMass, beiBreite } from '../shared/js/ui.js';
import { createWerkstatt } from '../shared/js/werkstatt.js';
import { schreibfeld, zuordnen, lueckentext, wissenscheck, impuls, hilfen, blitz, blitzAufloesung, abstimmung } from '../shared/js/aufgaben.js';
import { chatgeschichte } from '../shared/js/chat.js';
import { STAND, ZINS, PREIS, ZIELE, STUFE, ANLAGEN, anlage, ANLEGER, FOTO, wolfSVG } from './daten.js';
import { ZEIT } from './zeitreise.js';
import { WOLF_CHAT } from './wolf.js';
import { HINWEISE, WAND, IMPULS } from './wand.js';
import { WISSENSCHECK } from './wissenscheck.js';

const P='ga';
const eur=(n,d=0)=>`${fmt(n,d)} €`;
const pz=(n,d=1)=>`${fmt(n,d)} %`;

/* ---------- Merksätze ---------- */
const MS={
  bauchgefuehl:['Geld anlegen heißt: Geld so aufbewahren, dass es nicht weniger wert wird oder sogar wächst. Welche Anlage passt, hängt davon ab, wie sicher sie ist, wie schnell du an dein Geld kommst und wie viel sie bringt.'],
  geldschmelze:['Inflation lässt die Kaufkraft schrumpfen: Für denselben Betrag bekommst du später weniger. Auf dem Girokonto ohne Zinsen verliert dein Geld deshalb jedes Jahr an Wert.',
    'Was dir eine Anlage wirklich bringt, zeigt der Realzins: Realzins ≈ Zins − Inflationsrate. Ist er negativ, wird dein Geld trotz Zinsen weniger wert.'],
  dreieck:['Das magische Dreieck der Geldanlage hat drei Ziele: Sicherheit (Wie hoch ist das Risiko, Geld zu verlieren?), Liquidität (Wie schnell komme ich an mein Geld?) und Rendite (Wie viel kann ich verdienen?).',
    'Keine Anlage erreicht alle drei Ziele gleichzeitig. Wer mehr Rendite will, muss mehr Risiko eingehen oder sein Geld länger festlegen. Wer etwas anderes verspricht, ist unseriös.'],
  anlagecheck:['Sparbuch, Tagesgeld und Festgeld sind sicher (Einlagensicherung bis 100.000 € pro Kunde und Bank), bringen aber wenig Rendite. Aktien, Fonds und Kryptowährungen bieten mehr Chancen, aber auch mehr Risiko. Immobilien sind wertbeständig, aber wenig liquide.',
    'Ein ETF bildet einen Index nach, zum Beispiel den MSCI World mit rund 1.300 Unternehmen. Durch die breite Streuung (Diversifikation) sinkt das Risiko, und die Kosten sind niedrig.'],
  beratung:['Welche Anlage passt, hängt vom Anlegerprofil ab: Anlageziel, Anlagedauer, Risikobereitschaft, Einkommen und Vermögen, Alter und Lebenssituation sowie Wissen und Erfahrung.'],
  schneeball:['Beim Zinseszins bekommst du auch Zinsen auf die Zinsen der vergangenen Jahre. So wächst dein Geld nicht gleichmäßig, sondern immer schneller: Kn = K0 × (1 + p)ⁿ.',
    'Für den Zinseszins ist Zeit wichtiger als der Betrag: Wer früh anfängt, hat am Ende oft mehr als jemand, der später mit mehr Geld startet. Geld für kurzfristige Ziele spart man sicher, für langfristige Ziele kann man investieren.'],
  zeitmaschine:['Kurse schwanken. Wer breit streut und lange durchhält, kann Verluste meist wieder aufholen. Wer in einer Krise in Panik verkauft, macht Verluste endgültig.',
    'Alles auf eine Karte zu setzen ist riskant: Eine einzelne Aktie oder eine Kryptowährung kann viel gewinnen oder sehr viel verlieren. Hinterher ist man immer schlauer, vorher weiß es niemand.'],
  regeln:['Die goldenen Regeln der Geldanlage: Schulden zuerst tilgen, ein klares Sparziel haben, Chancen und Risiken prüfen, skeptisch bei Gewinnversprechen sein, auf Kosten achten, zur eigenen Risikobereitschaft passend anlegen, streuen und schwankende Anlagen nur langfristig halten.'],
  wolfchat:['Wer schnelle, hohe Gewinne ohne Risiko verspricht, will meist an dein Geld. Warnsignale sind Zeitdruck („nur heute“), Gewinnscreenshots, teure VIP-Gruppen und Zahlungen über Gutscheinkarten oder fremde Konten.'],
  sichern:['Eine gute Geldanlage passt zu deinem Ziel: Für kurzfristige Ziele und den Notgroschen sparst du sicher und liquide, etwa auf Tagesgeld. Für langfristige Ziele kannst du breit gestreut investieren, etwa mit einem ETF-Sparplan, und den Zinseszins für dich arbeiten lassen.']
};

/* ---------- Glossar ---------- */
const GLOSS=[
  ['Aktie','Wertpapier, mit dem man einen kleinen Anteil an einer Aktiengesellschaft besitzt. Aktionäre sind Miteigentümer, dürfen auf der Hauptversammlung abstimmen und bekommen einen Teil des Gewinns (Dividende).'],
  ['Anlagehorizont','Zeit, für die man Geld anlegen kann, bis man es braucht: kurzfristig (1 bis 3 Jahre), mittelfristig (3 bis 7 Jahre) oder langfristig (mehr als 7 Jahre).'],
  ['Anlegerprofil','Beschreibt, was zu einem Anleger passt: Anlageziel, Anlagedauer, Risikobereitschaft, Einkommen und Vermögen, Alter und Erfahrung.'],
  ['Anleihe','Schuldschein: Man leiht einem Staat oder Unternehmen Geld für eine feste Laufzeit und bekommt dafür feste Zinsen.'],
  ['Börse','Marktplatz, an dem Wertpapiere wie Aktien, Anleihen und ETFs gehandelt werden. Der Preis (Kurs) entsteht aus Angebot und Nachfrage. Die größte Börse in Deutschland ist in Frankfurt am Main.'],
  ['DAX','Deutscher Aktienindex: die 40 größten an der Frankfurter Börse gehandelten deutschen Unternehmen.'],
  ['Depot','Konto für Wertpapiere bei einer Bank. Für Minderjährige können die Eltern ein Junior-Depot eröffnen.'],
  ['Diversifikation','Streuung: Man verteilt sein Geld auf viele verschiedene Anlagen. Fällt eine, gleichen andere das aus. So sinkt das Risiko.'],
  ['Dividende','Teil vom Gewinn einer Aktiengesellschaft, den sie an ihre Aktionäre auszahlt.'],
  ['Einlagensicherung','Gesetzlicher Schutz für Guthaben auf Bankkonten (Girokonto, Sparbuch, Tagesgeld, Festgeld): bis 100.000 € pro Kunde und Bank. Für Aktien, Fonds und Kryptowährungen gilt sie nicht.'],
  ['ETF','Exchange Traded Fund: Fonds, der einen Index wie den DAX oder den MSCI World nachbildet. Er wird an der Börse gehandelt und kostet meist wenig.'],
  ['Festgeld','Geld wird für eine feste Laufzeit zu einem festen Zins angelegt. Vorher kommt man nicht heran.'],
  ['Finfluencer','Influencer, die in sozialen Medien über Geld und Geldanlage sprechen. Manche informieren seriös, andere werben verdeckt oder locken in riskante oder betrügerische Angebote.'],
  ['Fonds','Investmentfonds: sammelt das Geld vieler Anleger und legt es breit gestreut an, zum Beispiel in Aktien oder Anleihen.'],
  ['Girokonto','Konto für den Zahlungsverkehr: Lohn, Taschengeld, Kartenzahlung, Überweisungen. Meist gibt es keine Zinsen.'],
  ['Immobilie','Grundstück oder Gebäude. Ein Sachwert, der als wertbeständig gilt, aber nur langsam zu verkaufen ist.'],
  ['Index','Kennzahl, die die Entwicklung einer Gruppe von Aktien zusammenfasst, zum Beispiel DAX oder MSCI World.'],
  ['Inflation','Anhaltender Anstieg der Preise. Für denselben Betrag bekommt man weniger, die Kaufkraft sinkt.'],
  ['Kaufkraft','Wie viel man für sein Geld kaufen kann. Steigen die Preise, sinkt die Kaufkraft.'],
  ['Kryptowährung','Digitales Geld wie Bitcoin, das ohne Banken und Staaten funktioniert. Die Kurse schwanken extrem, eine Einlagensicherung gibt es nicht.'],
  ['Kurs','Preis eines Wertpapiers an der Börse.'],
  ['Liquidität','Wie schnell und einfach man eine Geldanlage in Bargeld umwandeln kann. Von „liquide“, also flüssig.'],
  ['Meme-Coin','Kryptowährung, die vor allem durch einen Witz, ein Meme oder einen Hype bekannt wird, ohne echten Nutzen dahinter. Sehr riskant, oft endet sie mit einem Absturz.'],
  ['MSCI World','Aktienindex mit rund 1.300 großen und mittleren Unternehmen aus 23 Industrieländern.'],
  ['Pfandbrief','Besonders sichere Anleihe einer Bank, abgesichert durch Kredite, zum Beispiel für Immobilien.'],
  ['Realzins','Zins abzüglich Inflationsrate. Er zeigt, ob das Geld wirklich mehr wert wird.'],
  ['Rendite','Ertrag einer Geldanlage im Verhältnis zum eingesetzten Geld, meist in Prozent pro Jahr: Zinsen, Dividenden und Kursgewinne.'],
  ['Risiko','Möglichkeit, dass man mit einer Geldanlage Geld verliert. Mehr Rendite gibt es meist nur mit mehr Risiko.'],
  ['Rug Pull','Betrug mit Kryptowährungen: Die Macher werben Käufer an, verkaufen dann plötzlich alles und verschwinden mit dem Geld. Der Kurs stürzt auf fast null.'],
  ['Sachwert','Anlage in etwas Greifbares wie Immobilien oder Gold, im Gegensatz zu Geld auf dem Konto.'],
  ['Sparbuch','Klassisches Sparkonto. Sicher, aber mit sehr niedrigen Zinsen.'],
  ['Sparplan','Man legt regelmäßig einen festen Betrag an, zum Beispiel 25 € im Monat in einen ETF.'],
  ['Tagesgeld','Sparkonto, auf das man jeden Tag zugreifen kann. Die Bank darf den Zins jederzeit ändern.'],
  ['Totalverlust','Das ganze eingesetzte Geld ist weg, zum Beispiel wenn eine Firma pleitegeht oder ein Coin abstürzt.'],
  ['Zins','Preis für geliehenes Geld. Wer Geld anlegt, bekommt Zinsen, wer einen Kredit aufnimmt, zahlt Zinsen.'],
  ['Zinseszins','Zinsen auf Zinsen: Die Zinsen werden mitverzinst, das Geld wächst immer schneller.']
];

/* ---------- Kapitel und Bereiche ---------- */
const CH={1:['Kapitel 1 – Einstieg','Dein Bauchgefühl'],2:['Kapitel 2 – Grundlagen','Geldschmelze und Dreieck'],3:['Kapitel 3 – Anlageformen','Vergleichen und beraten'],4:['Kapitel 4 – Strategie','Zeit, Streuung und Regeln'],5:['Kapitel 5 – Der Wolf of Saale','Zu zweit'],6:['Kapitel 6 – Sichern','Hefteintrag und Wissenscheck']};
const DEST=[
  {id:'start',icon:'home',label:'Start',title:'Lernwerkstatt Anlagemöglichkeiten',kurz:'Geldanlage',render:startHTML},
  {id:'grundlagen',icon:'change_history',label:'Grundlagen',title:'Grundlagen der Geldanlage',kurz:'Grundlagen',ch:[2],desc:'Die Geldschmelze auf dem Girokonto und das magische Dreieck aus Sicherheit, Liquidität und Rendite'},
  {id:'anlagen',icon:'savings',label:'Anlagen',title:'Anlageformen vergleichen',kurz:'Anlagen',ch:[3],desc:'Acht Anlagen im Check, das Anlage-Duell und die Anlageberatung mit der ganzen Klasse'},
  {id:'strategie',icon:'trending_up',label:'Strategie',title:'Clever anlegen',kurz:'Strategie',ch:[4],desc:'Schneeball-Rechner, Depot-Zeitmaschine von 2018 bis 2025 und die goldenen Regeln'},
  {id:'wolf',icon:'chat',label:'Wolf',title:'Der Wolf of Saale',ch:[5],tool:'wolfchat',desc:'Ein Finfluencer will an dein Jugendweihe-Geld. Was tust du?'},
  {id:'wissen',icon:'school',label:'Wissen',title:'Sichern und wiederholen',ch:[6],render:wissenHTML,desc:'Hefteintrag, Bauchgefühl-Check, Wissenscheck mit Klassen-Quiz, Fachbegriffe und deine Merksätze'}
];
const dot=k=>`<span class="ga-dot ${k}" aria-hidden="true"></span>`;

const W=createWerkstatt({
  thema:'geldanlage',
  speicher:P,
  logo:'<svg aria-hidden="true" width="40" height="40" viewBox="0 0 42 42"><path d="M21 4 39 36H3Z" fill="none" stroke="var(--md-primary)" stroke-width="3" stroke-linejoin="round"/><circle cx="21" cy="6" r="4.4" fill="var(--ga-r)"/><circle cx="5" cy="35" r="4.4" fill="var(--ga-s)"/><circle cx="37" cy="35" r="4.4" fill="var(--ga-l)"/><text x="21" y="31" text-anchor="middle" font-size="13" font-weight="700" fill="var(--md-on-surface)">€</text></svg>',
  bereiche:DEST,
  kapitel:CH,
  merksaetze:MS,
  wissenTitel:'Mein Geld-Wissen',
  glossar:GLOSS,
  punkte:x=>x.farben.map(dot).join(''),
  beimZeigen(id,v){
    $$('[data-ga-tool]',v).forEach(b=>b.addEventListener('click',()=>openTool(b.dataset.gaTool)));
    if($('#reset',v)){
      $('#reset',v).addEventListener('click',()=>{$('#reset-confirm',v).hidden=false});
      $('#reset-no',v).addEventListener('click',()=>{$('#reset-confirm',v).hidden=true});
      $('#reset-yes',v).addEventListener('click',()=>W.resetWissen());
    }
  }
});
const {tool,erkHTML,bindErk,openTool,chapterHTML}=W;

/* ---------- Fotos mit Bildnachweis ---------- */
function nachweis(k){const f=FOTO[k];if(!f)return '';const [wer,lizenz]=f.credit.split(', ');
  return f.link?`Foto: <a href="${f.link}" rel="noopener" target="_blank">${esc(wer)}</a>${lizenz?`, <a href="${f.lizenz}" rel="noopener" target="_blank">${esc(lizenz)}</a>`:''}`:`Foto: ${esc(f.credit)}`}

/* 1 Bauchgefühl: Blitzrunde, aufgelöst erst in „Hefteintrag und Bauchgefühl-Check“ */
const BAUCH={id:'geld-blitz',werkstatt:'bauchgefuehl',verdeckt:true,
  titel:'Stimmt das oder stimmt das nicht? Entscheide aus dem Bauch.',
  optionen:[{id:'nein',t:'Stimmt nicht',icon:'thumb_down'},{id:'ja',t:'Stimmt',icon:'thumb_up'}],
  karten:[
    {t:'Wenn dein Geld auf dem Girokonto liegt, bleibt es genauso viel wert.',r:'nein',e:'Steigen die Preise, bekommst du für dein Geld jedes Jahr weniger. Ohne Zinsen verliert es an Kaufkraft.'},
    {t:'Geld auf dem Tagesgeldkonto ist bis 100.000 € geschützt, auch wenn die Bank pleitegeht.',r:'ja',e:'Die gesetzliche Einlagensicherung schützt Guthaben bis 100.000 € pro Kunde und Bank.'},
    {t:'Bitcoin ist genauso abgesichert wie Geld auf dem Sparbuch.',r:'nein',e:'Für Kryptowährungen gibt es keine Einlagensicherung. Ein Totalverlust ist möglich.'},
    {t:'Mit einer Aktie gehört dir ein kleines Stück eines Unternehmens.',r:'ja',e:'Aktionäre sind Miteigentümer. Sie dürfen auf der Hauptversammlung abstimmen und bekommen einen Teil vom Gewinn.'},
    {t:'Es gibt Anlagen, die gleichzeitig ganz sicher sind, jederzeit verfügbar und sehr viel Gewinn bringen.',r:'nein',e:'Sicherheit, Liquidität und Rendite stehen im Konflikt. Wer alles gleichzeitig verspricht, ist unseriös.'},
    {t:'Wer mit 15 anfängt, jeden Monat 25 € anzulegen, kann mit 67 mehr haben als jemand, der erst mit 30 mit 50 € im Monat startet.',r:'ja',e:'Das schafft der Zinseszins: Bei 5 % Rendite im Jahr hat die frühe Starterin am Ende mehr, obwohl sie weniger eingezahlt hat. Nachrechnen kannst du das im Schneeball-Rechner.'},
    {t:'Ein ETF auf den MSCI World verteilt dein Geld auf rund 1.300 Unternehmen.',r:'ja',e:'Der MSCI World enthält rund 1.300 Unternehmen aus 23 Industrieländern. Ein ETF darauf streut dein Geld entsprechend breit.'},
    {t:'Wenn ein Finfluencer zeigt, dass er mit einem Coin 1.000 % Gewinn gemacht hat, ist das ein sicherer Tipp.',r:'nein',e:'Gewinnscreenshots beweisen nichts und lassen sich leicht fälschen. Oft verdient der Finfluencer daran, dass du kaufst.'}]};
tool({id:'bauchgefuehl',ch:1,farben:['s','l','r'],hinweise:HINWEISE.bauchgefuehl,title:'Stimmt das?',sub:'Acht Aussagen rund ums Geld – entscheide so schnell du kannst. Die Auflösung kommt am Ende',
html(){return `<p class="task"><b>Auftrag:</b> Entscheide bei jeder Karte blitzschnell: Stimmt die Aussage oder nicht? Nicht lange nachdenken! Ob du richtig lagst, erfährst du erst am Ende der Lernwerkstatt.</p>
${blitz(BAUCH)}
${schreibfeld(WAND.bauchgefuehl)}
${impuls(IMPULS.bauchgefuehl)}
${erkHTML('bauchgefuehl')}`},
init(root){bindErk(root)}});

/* 2 Die Geldschmelze: Inflation und Kaufkraft */
const SCHMELZE={betrag:1000,inflation:2,jahre:15};
const doenerIn=(betrag,infl,jahre,zins=0)=>betrag*Math.pow(1+zins/100,jahre)/Math.pow(1+infl/100,jahre)/PREIS.doener;
tool({id:'geldschmelze',ch:2,farben:['s','r'],hinweise:HINWEISE.geldschmelze,title:'Die Geldschmelze',sub:'Schätze, wie viele Döner dein Jugendweihe-Geld in 15 Jahren noch wert ist – und warum Zinsen allein nicht reichen',
html(){const heute=Math.floor(SCHMELZE.betrag/PREIS.doener);
return `<p class="task"><b>Auftrag:</b> Stell dir vor, du lässt dein Jugendweihe-Geld einfach auf dem Girokonto liegen. Schätze zuerst, dann probiere mit den Reglern aus, was mit deinem Geld passiert.</p>
<section class="aufgabe stack"><p class="aufgabe-kopf"><span class="ms sm" aria-hidden="true">psychology</span>Erst schätzen</p>
  <p class="aufgabe-frage">Ein Döner kostet in Jena gerade ${eur(PREIS.doener,2)}. Für 1.000 € bekommst du also ${heute} Döner. Die Preise steigen jedes Jahr um 2 %. Für wie viele Döner reichen deine 1.000 € in 15 Jahren noch?</p>
  <div class="ga-schaetzung"><label class="small" for="gs-tipp">Deine Schätzung</label><input id="gs-tipp" type="text" inputmode="numeric" autocomplete="off"><span>Döner</span>
    <button class="btn primary small" type="button" id="gs-pruefen"><span class="ms" aria-hidden="true">task_alt</span>Schätzung prüfen</button></div>
  <div id="gs-fb" class="stack" role="status"></div></section>
<div class="grid2 wide-left">
  <div class="panel stack"><h3 class="title-m">Was ist dein Geld später wert?</h3>
    <div class="ctrl"><label for="gs-b">Dein Geld <output id="gs-bo"></output></label><input type="range" id="gs-b" min="100" max="3000" step="100" value="${SCHMELZE.betrag}"></div>
    <div class="ctrl"><label for="gs-i">Inflationsrate pro Jahr <output id="gs-io"></output></label><input type="range" id="gs-i" min="0" max="8" step="0.1" value="${SCHMELZE.inflation}"></div>
    <div class="ctrl"><label for="gs-z">Zinsen auf dem Konto pro Jahr <output id="gs-zo"></output></label><input type="range" id="gs-z" min="0" max="5" step="0.1" value="0"></div>
    <div class="ctrl"><label for="gs-j">Jahre <output id="gs-jo"></output></label><input type="range" id="gs-j" min="0" max="40" step="1" value="${SCHMELZE.jahre}"></div>
    <div class="row" role="group" aria-label="Beispiele">
      <button class="btn small" type="button" data-gs-preset="0,2">Girokonto, EZB-Ziel 2 %</button>
      <button class="btn small" type="button" data-gs-preset="${ZINS.tagesgeldTyp},${ZINS.inflation}">Tagesgeld ${pz(ZINS.tagesgeldTyp)}, Inflation heute ${pz(ZINS.inflation)}</button>
      <button class="btn small" type="button" data-gs-preset="0,6.9">Girokonto, Inflation wie 2022</button></div></div>
  <div class="panel stack" aria-live="polite"><p class="eyebrow">Kaufkraft in heutigen Euro</p><div class="big-num" id="gs-wert">–</div>
    <p id="gs-text" class="small"></p>
    <p>Realzins: <b id="gs-real" class="num"></b> <span class="small muted">(Zins − Inflation)</span></p>
    <p class="small"><span class="ms sm" aria-hidden="true">kebab_dining</span> <b id="gs-d" class="num"></b> Döner statt ${heute} · <span class="ms sm" aria-hidden="true">train</span> <b id="gs-t" class="num"></b> Deutschlandtickets</p>
    <div class="ga-raster" id="gs-raster" aria-hidden="true"></div><p class="small muted" id="gs-raster-l"></p></div>
</div>
<p class="small muted">Döner in Jena ${eur(PREIS.doener,2)}, Deutschlandticket ${eur(PREIS.dticket,2)} im Monat (2026). Inflationsrate Deutschland ${pz(ZINS.inflation)}, Thüringen ${pz(ZINS.inflationTh)} (September 2026), 2022: 6,9 %. Gerechnet wird vereinfacht mit gleichbleibender Inflation.</p>
${schreibfeld(WAND.geldschmelze)}
${impuls(IMPULS.geldschmelze)}
${erkHTML('geldschmelze')}`},
init(root){
  const b=$('#gs-b',root),i=$('#gs-i',root),z=$('#gs-z',root),j=$('#gs-j',root);
  const st=store(P+'-schmelze');if(st){b.value=st.b;i.value=st.i;z.value=st.z;j.value=st.j}
  const calc=()=>{
    const B=+b.value,I=+i.value,Z=+z.value,J=+j.value,wert=B*Math.pow(1+Z/100,J)/Math.pow(1+I/100,J),nominal=B*Math.pow(1+Z/100,J),d=Math.floor(wert/PREIS.doener),heute=Math.floor(B/PREIS.doener);
    $('#gs-bo',root).textContent=eur(B);$('#gs-io',root).textContent=pz(I);$('#gs-zo',root).textContent=pz(Z);$('#gs-jo',root).textContent=J===1?'1 Jahr':`${J} Jahre`;
    $('#gs-wert',root).textContent=eur(wert);
    $('#gs-text',root).textContent=`Auf dem Konto stehen nach ${J} ${J===1?'Jahr':'Jahren'} ${eur(nominal)}. Weil die Preise steigen, kannst du dir davon aber nur so viel kaufen wie heute für ${eur(wert)}.${wert<B?` Das sind ${eur(B-wert)} weniger.`:wert>B?` Das sind ${eur(wert-B)} mehr.`:''}`;
    const real=Z-I;$('#gs-real',root).textContent=(real>0?'+':real<0?'−':'±')+pz(Math.abs(real));$('#gs-real',root).className='num '+(real<0?'ga-minus':real>0?'ga-plus':'');
    $('#gs-d',root).textContent=fmt(d,0);$('#gs-t',root).textContent=fmt(Math.floor(wert/PREIS.dticket),0);
    // Döner-Raster: ein Symbol pro Döner, ab 150 Dönern ein Symbol für 5
    const pro=heute>150?5:1,n=Math.ceil(heute/pro),voll=Math.min(n,Math.floor(d/pro));
    $('#gs-raster',root).innerHTML=Array.from({length:n},(_,k)=>`<span class="ms${k<voll?'':' weg'}">kebab_dining</span>`).join('');
    $('#gs-raster-l',root).textContent=`Ein Symbol = ${pro===1?'ein Döner':'fünf Döner'}. Grau: Döner, die dir die Inflation weggefressen hat.`;
    store(P+'-schmelze',{b:B,i:I,z:Z,j:J});
  };
  [b,i,z,j].forEach(x=>x.addEventListener('input',calc));
  $$('[data-gs-preset]',root).forEach(k=>k.addEventListener('click',()=>{const [zz,ii]=k.dataset.gsPreset.split(',');z.value=zz;i.value=ii;calc()}));
  calc();
  // Schätzung: 1.000 € bei 2 % Inflation nach 15 Jahren
  const loes=Math.floor(doenerIn(1000,2,15));
  $('#gs-pruefen',root).addEventListener('click',()=>{
    const t=parseInt($('#gs-tipp',root).value.replace(/\D/g,''),10),fb=$('#gs-fb',root);
    if(isNaN(t)){fb.innerHTML='<div class="fb neu">Gib zuerst eine Zahl ein.</div>';return}
    const ab=Math.abs(t-loes);
    fb.innerHTML=`<div class="fb ${ab<=5?'ok':'amb'}"><b>${ab<=5?'Sehr gut geschätzt!':t>loes?'Etwas zu optimistisch.':'Etwas zu pessimistisch.'}</b> Richtig sind <b>${loes} Döner</b>: Ein Döner kostet dann ${eur(PREIS.doener*Math.pow(1.02,15),2)}, also bekommst du für 1.000 € nur noch ${loes} Stück. Das sind ${Math.floor(1000/PREIS.doener)-loes} Döner weniger, ohne dass du einen Cent ausgegeben hast.</div>`;
  });
  bindErk(root);
}});

/* 3 Das magische Dreieck der Geldanlage */
const KEYS=['s','l','r'];
const gewicht=a=>{const s=a.w.s+a.w.l+a.w.r;return {s:a.w.s/s,l:a.w.l/s,r:a.w.r/s}};
tool({id:'dreieck',ch:2,farben:['s','l','r'],hinweise:HINWEISE.dreieck,title:'Das magische Dreieck',sub:'Sicherheit, Liquidität, Rendite: Verteile 100 Punkte und finde heraus, welche Anlage zu dir passt – und warum es die perfekte Anlage nicht gibt',
html(){return `<p class="task"><b>Auftrag:</b> Jede Geldanlage hat drei Ziele. Lies zuerst, was sie bedeuten. Verteile dann 100 Punkte auf die drei Ziele: mit den Reglern oder indem du ins Dreieck tippst. Welche Anlage passt zu deiner Wahl? Versuch auch, alle drei Ziele auf das Maximum zu bringen.</p>
<div class="ga-ziele">${KEYS.map(k=>`<div class="ga-ziel ${k}"><p class="title-m"><span class="ms" aria-hidden="true">${ZIELE[k].icon}</span>${ZIELE[k].name}</p><p class="small"><b>${ZIELE[k].frage}</b></p><p class="small">${ZIELE[k].text}</p></div>`).join('')}</div>
<div class="grid2">
  <div class="panel chart ga-dreieck"><h3 class="title-m">Dein Punkt im Dreieck</h3><div id="dr-svg"></div><p class="small muted">Tippe ins Dreieck oder nutze die Regler. Die kleinen Punkte sind die acht Anlageformen.</p></div>
  <div class="stack">
    <div class="panel stack ga-regler"><h3 class="title-m">100 Punkte verteilen</h3>
      ${KEYS.map(k=>`<div class="ctrl"><label for="dr-${k}">${ZIELE[k].name} <output id="dr-${k}o"></output></label><input class="${k}" type="range" id="dr-${k}" min="0" max="100" step="1"></div>`).join('')}
      <div class="row"><button class="btn small" type="button" id="dr-alles"><span class="ms" aria-hidden="true">auto_awesome</span>Alles auf Maximum</button><button class="btn small" type="button" id="dr-mitte"><span class="ms" aria-hidden="true">restart_alt</span>Gleich verteilen</button></div></div>
    <div class="panel stack" aria-live="polite"><div class="ga-treffer"><span class="ms" aria-hidden="true" id="dr-ic">balance</span><div><p class="eyebrow">Am besten passt</p><p class="title-l" id="dr-name"></p></div></div><p class="small" id="dr-text"></p><div id="dr-alarm"></div></div>
  </div>
</div>
${schreibfeld(WAND.dreieck)}
${impuls(IMPULS.dreieck)}
${erkHTML('dreieck')}`},
init(root){
  const el=$('#dr-svg',root),inp=Object.fromEntries(KEYS.map(k=>[k,$(`#dr-${k}`,root)]));
  let w=store(P+'-dreieck')||{s:34,l:33,r:33},alarm='';
  let geo=null;
  const ecken=(W,H,rand)=>({r:[W/2,rand.o],s:[rand.x,H-rand.u],l:[W-rand.x,H-rand.u]});
  const pkt=(g,E)=>[g.s*E.s[0]+g.l*E.l[0]+g.r*E.r[0],g.s*E.s[1]+g.l*E.l[1]+g.r*E.r[1]];
  const naechste=()=>{const g={s:w.s/100,l:w.l/100,r:w.r/100},d=ANLAGEN.map(a=>{const h=gewicht(a);return {a,d:Math.hypot(h.s-g.s,h.l-g.l,h.r-g.r)}});
    const min=Math.min(...d.map(x=>x.d));return d.filter(x=>x.d-min<1e-9).map(x=>x.a)};
  function zeichne(){
    const m=svgMass(el,460),W=m.W,f=m.fs,fl=f(14),H=Math.round(W*.86)+Math.round(fl*2.4),rand={x:Math.round(fl*1.2),o:Math.round(fl*2.2),u:Math.round(fl*2.2)},E=ecken(W,H,rand);
    geo={W,E};
    const best=naechste().map(a=>a.id);
    let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Dreieck der Geldanlage mit den Ecken Rendite oben, Sicherheit links unten und Liquidität rechts unten. Dein Punkt: ${w.s} Punkte Sicherheit, ${w.l} Punkte Liquidität, ${w.r} Punkte Rendite.">`;
    s+=`<polygon points="${E.r} ${E.s} ${E.l}" fill="var(--md-surface-container-high)" stroke="var(--md-outline)" stroke-width="2"/>`;
    KEYS.forEach(k=>{const [x,y]=E[k];s+=`<circle cx="${x}" cy="${y}" r="${fl*.6}" fill="var(--ga-${k})"/>`;
      const ty=k==='r'?y-fl*.9:y+fl*1.5,ta=k==='r'?'middle':k==='s'?'start':'end',tx=k==='r'?x:k==='s'?x-fl*.6:x+fl*.6;
      s+=`<text x="${tx}" y="${ty}" text-anchor="${ta}" font-size="${fl}" font-weight="700" fill="var(--md-ga-${k})" class="t-halo">${ZIELE[k].name}</text>`});
    // Anlageformen als kleine Punkte, die passenden hervorgehoben und beschriftet
    const gezeigt=new Set();
    ANLAGEN.forEach(a=>{const [x,y]=pkt(gewicht(a),E),hi=best.includes(a.id);
      s+=`<circle cx="${x}" cy="${y}" r="${hi?7:5}" fill="${hi?'var(--md-primary)':'var(--md-on-surface-variant)'}" stroke="var(--md-surface)" stroke-width="2"/>`;
      if(hi&&!gezeigt.has(`${x},${y}`)){gezeigt.add(`${x},${y}`);const namen=ANLAGEN.filter(b=>{const [bx,by]=pkt(gewicht(b),E);return Math.abs(bx-x)<.5&&Math.abs(by-y)<.5}).map(b=>b.name).join(', ');
        s+=`<text x="${x}" y="${y-fl*.8}" text-anchor="middle" font-size="${f(12)}" class="t-fg t-halo" font-weight="600">${esc(namen)}</text>`}});
    const [px,py]=pkt({s:w.s/100,l:w.l/100,r:w.r/100},E);
    s+=`<circle class="ga-punkt" cx="${px}" cy="${py}" r="${fl*.75}" fill="var(--md-tertiary)" stroke="var(--md-surface)" stroke-width="3"/>`;
    $('#dr-svg',root).innerHTML=s+'</svg>';
  }
  function zeige(){
    KEYS.forEach(k=>{inp[k].value=w[k];$(`#dr-${k}o`,root).textContent=`${w[k]} Punkte`});
    const best=naechste();
    $('#dr-name',root).textContent=best.map(a=>a.name).join(' oder ');
    $('#dr-ic',root).textContent=best[0].icon;
    $('#dr-text',root).textContent=best.map(a=>`${a.name}: Sicherheit ${STUFE[a.w.s]}, Liquidität ${STUFE[a.w.l]}, Rendite ${STUFE[a.w.r]}.`).join(' ');
    $('#dr-alarm',root).innerHTML=alarm;
    zeichne();store(P+'-dreieck',w);
  }
  // Ein Regler ändert sich: Die anderen beiden teilen sich den Rest im bisherigen Verhältnis
  function setze(k,v){
    v=clamp(Math.round(v),0,100);const andere=KEYS.filter(x=>x!==k),summe=andere.reduce((a,x)=>a+w[x],0),rest=100-v;
    const n={[k]:v};
    if(summe===0){n[andere[0]]=Math.round(rest/2);n[andere[1]]=rest-n[andere[0]]}
    else{n[andere[0]]=Math.round(rest*w[andere[0]]/summe);n[andere[1]]=rest-n[andere[0]]}
    w=n;alarm=v>=90?`<div class="fb amb"><b>Konflikt!</b> Fast alle Punkte auf ${ZIELE[k].name} – dafür bleibt für ${andere.map(x=>ZIELE[x].name).join(' und ')} kaum etwas übrig.</div>`:'';zeige();
  }
  KEYS.forEach(k=>inp[k].addEventListener('input',()=>setze(k,+inp[k].value)));
  $('#dr-alles',root).addEventListener('click',()=>{alarm=`<div class="fb bad"><b>Geht nicht!</b> Mehr als 100 Punkte gibt es nicht: Keine Anlage ist gleichzeitig ganz sicher, jederzeit verfügbar und sehr rentabel. Wer dir genau das verspricht, will dich reinlegen – mehr dazu beim Wolf of Saale.</div>`;w={s:34,l:33,r:33};zeige();$('#dr-alarm .fb',root).tabIndex=-1;$('#dr-alarm .fb',root).focus()});
  $('#dr-mitte',root).addEventListener('click',()=>{alarm='';w={s:34,l:33,r:33};zeige()});
  // Tippen oder Ziehen im Dreieck: baryzentrische Koordinaten, auf das Dreieck begrenzt
  const ausZeiger=e=>{if(!geo)return;const svg=$('svg',el),r=svg.getBoundingClientRect(),k=geo.W/r.width,x=(e.clientX-r.left)*k,y=(e.clientY-r.top)*k,E=geo.E;
    const [x1,y1]=E.s,[x2,y2]=E.l,[x3,y3]=E.r,det=(y2-y3)*(x1-x3)+(x3-x2)*(y1-y3);
    let a=((y2-y3)*(x-x3)+(x3-x2)*(y-y3))/det,b=((y3-y1)*(x-x3)+(x1-x3)*(y-y3))/det,c=1-a-b;
    a=Math.max(0,a);b=Math.max(0,b);c=Math.max(0,c);const s=a+b+c;
    const S=Math.round(a/s*100),L=Math.round(b/s*100);w={s:S,l:L,r:100-S-L};
    alarm=Math.max(w.s,w.l,w.r)>=90?`<div class="fb amb"><b>Konflikt!</b> Fast alle Punkte auf einem Ziel – für die anderen bleibt kaum etwas übrig.</div>`:'';zeige()};
  let zieht=false;
  el.addEventListener('pointerdown',e=>{if(!e.target.closest('svg'))return;zieht=true;el.setPointerCapture(e.pointerId);ausZeiger(e)});
  el.addEventListener('pointermove',e=>{if(zieht)ausZeiger(e)});
  const los=()=>{zieht=false};el.addEventListener('pointerup',los);el.addEventListener('pointercancel',los);
  zeige();beiBreite(el,zeichne);
  bindErk(root);
}});

/* 4 Acht Anlagen im Check: Steckbriefe, Tabelle, Anlage-Duell */
const KAT={s:['sicherer','Was ist sicherer?'],l:['liquider','An welches Geld kommst du schneller?'],r:['rentabler','Was bringt mehr Rendite?']};
const richtigeWerte=(a,k)=>[a.w[k],...((a.auch||{})[k]||[])];
tool({id:'anlagecheck',ch:3,farben:['s','l','r'],hinweise:HINWEISE.anlagecheck,title:'Acht Anlagen im Check',sub:'Steckbriefe lesen, die Tabelle zum Dreieck ausfüllen und im Anlage-Duell gegen die Uhr vergleichen',
html(){return `<p class="task"><b>Auftrag:</b> Öffne die acht Steckbriefe und lies sie. Bewerte dann jede Anlage in der Tabelle: Sind Sicherheit, Liquidität und Rendite eher niedrig, mittel oder hoch? Zum Schluss: das Anlage-Duell.</p>
<div class="ga-briefe">${ANLAGEN.map(a=>`<details class="ga-brief"><summary><span class="ga-ic"><span class="ms" aria-hidden="true">${a.icon}</span></span><span><span class="title-s">${a.name}</span><span class="small muted" style="display:block">${a.kurz}</span></span><span class="ms ga-mehr" aria-hidden="true">expand_more</span></summary><p class="ga-brief-text">${a.text}</p></details>`).join('')}</div>
<section class="aufgabe stack ga-tab" id="ac-tab"><p class="aufgabe-kopf"><span class="ms sm" aria-hidden="true">table_view</span>Tabelle</p>
  <p class="aufgabe-frage">Bewerte die Anlageformen: Sind Sicherheit, Liquidität und Rendite eher niedrig, mittel oder hoch?</p>
  <div class="tbl-wrap"><table><thead><tr><th>Anlageform</th>${KEYS.map(k=>`<th class="${k}"><span class="ms sm" aria-hidden="true">${ZIELE[k].icon}</span> <span class="th-lang">${ZIELE[k].name}</span><span class="th-kurz">${ZIELE[k].name.slice(0,5)}.</span></th>`).join('')}</tr></thead>
  <tbody>${ANLAGEN.map(a=>`<tr><th scope="row">${a.name}</th>${KEYS.map(k=>`<td data-zelle="${a.id}-${k}"><select aria-label="${a.name}: ${ZIELE[k].name}" data-a="${a.id}" data-k="${k}"><option value="">–</option>${[1,2,3].map(v=>`<option value="${v}">${STUFE[v]}</option>`).join('')}</select></td>`).join('')}</tr>`).join('')}</tbody></table></div>
  <div class="row"><button class="btn primary small" type="button" id="ac-pruefen"><span class="ms" aria-hidden="true">task_alt</span>Prüfen</button><button class="btn small" type="button" id="ac-zeigen" hidden><span class="ms" aria-hidden="true">visibility</span>Lösung zeigen</button><button class="btn small" type="button" id="ac-neu"><span class="ms" aria-hidden="true">restart_alt</span>Neu</button><span class="small" id="ac-erg" role="status"></span></div>
  <details class="hilfe" id="ac-warum" hidden><summary><span class="ms sm" aria-hidden="true">help</span>Warum? Die Lösung mit Begründung</summary><ul class="small">${ANLAGEN.map(a=>`<li><b>${a.name}:</b> ${KEYS.map(k=>`${ZIELE[k].name} ${STUFE[a.w[k]]} – ${a.warum[k]}`).join(' ')}</li>`).join('')}</ul></details>
  ${hilfen({tipp:'Achte auf die Signalwörter in den Steckbriefen: „Einlagensicherung“ heißt sicher, „jederzeit“ oder „an jedem Handelstag“ heißt liquide, „Chance auf hohe Gewinne“ heißt hohe Rendite.'})}</section>
<section class="aufgabe stack" id="ac-duell"><p class="aufgabe-kopf"><span class="ms sm" aria-hidden="true">swords</span>Anlage-Duell</p>
  <p class="aufgabe-frage">Zehn Duelle: Welche Anlage gewinnt? Wenn beide gleichauf sind, tippe auf „Gleich“.</p>
  <div class="stack" id="ac-d"></div></section>
${schreibfeld(WAND.anlagecheck)}
${impuls(IMPULS.anlagecheck)}
${erkHTML('anlagecheck')}`},
init(root){
  /* Tabelle */
  const sel=$$('#ac-tab select',root);let werte=store(P+'-tab')||{};
  const markiere=(s,r)=>{const td=s.closest('td');td.classList.remove('right','wrong');$('.ga-mark',td)?.remove();s.removeAttribute('aria-invalid');
    if(r==null)return;td.classList.add(r?'right':'wrong');s.setAttribute('aria-invalid',String(!r));td.insertAdjacentHTML('beforeend',`<span class="ms sm ga-mark ${r?'ok':'bad'}" aria-hidden="true">${r?'check':'close'}</span>`)};
  sel.forEach(s=>{s.value=werte[`${s.dataset.a}-${s.dataset.k}`]||'';s.addEventListener('change',()=>{werte[`${s.dataset.a}-${s.dataset.k}`]=s.value;store(P+'-tab',werte);markiere(s,null)})});
  $('#ac-pruefen',root).addEventListener('click',()=>{
    let ok=0,leer=0;sel.forEach(s=>{if(!s.value){leer++;markiere(s,null);return}const r=richtigeWerte(anlage(s.dataset.a),s.dataset.k).includes(+s.value);if(r)ok++;markiere(s,r)});
    $('#ac-erg',root).textContent=`${ok} von ${sel.length} richtig${leer?`, ${leer} noch leer`:''}${ok<sel.length?' – falsche Felder sind mit einem Kreuz markiert.':' – stark!'}`;
    $('#ac-zeigen',root).hidden=ok===sel.length;$('#ac-warum',root).hidden=false;
  });
  $('#ac-zeigen',root).addEventListener('click',()=>{sel.forEach(s=>{s.value=anlage(s.dataset.a).w[s.dataset.k];werte[`${s.dataset.a}-${s.dataset.k}`]=s.value;markiere(s,true)});store(P+'-tab',werte);$('#ac-erg',root).textContent='Lösung eingetragen – übertrage die Tabelle ins Heft.';$('#ac-zeigen',root).hidden=true;$('#ac-pruefen',root).focus()});
  $('#ac-neu',root).addEventListener('click',()=>{werte={};store(P+'-tab',werte);sel.forEach(s=>{s.value='';markiere(s,null)});$('#ac-erg',root).textContent='';$('#ac-zeigen',root).hidden=true;$('#ac-warum',root).hidden=true;sel[0].focus()});
  /* Duell: nur Paare, deren Einstufung in dieser Kategorie eindeutig ist */
  const box=$('#ac-d',root);
  const eindeutig=k=>ANLAGEN.filter(a=>!((a.auch||{})[k]||[]).length);
  function runden(){const liste=[];let sicher=0;
    while(liste.length<10&&sicher++<500){const k=KEYS[Math.floor(Math.random()*3)],pool=eindeutig(k),a=pool[Math.floor(Math.random()*pool.length)],b=pool[Math.floor(Math.random()*pool.length)];
      if(a===b||liste.some(x=>x.k===k&&[x.a,x.b].includes(a.id)&&[x.a,x.b].includes(b.id)))continue;liste.push({k,a:a.id,b:b.id})}
    return liste}
  let d={runden:runden(),i:0,ok:0};
  function zeigeDuell(fokus){
    if(d.i>=d.runden.length){box.innerHTML=`<p class="title-m num">${d.ok} von ${d.runden.length} Duellen richtig</p><p class="small">${d.ok>=8?'Du kennst dich aus!':'Lies die Steckbriefe noch einmal und starte eine neue Runde.'}</p><div class="row"><button class="btn small" type="button" id="ac-d-neu"><span class="ms" aria-hidden="true">replay</span>Neue Runde</button></div>`;
      $('#ac-d-neu',box).addEventListener('click',()=>{d={runden:runden(),i:0,ok:0};zeigeDuell(true)});if(fokus)$('#ac-d-neu',box).focus();return}
    const r=d.runden[d.i],A=anlage(r.a),B=anlage(r.b);
    box.innerHTML=`<div class="row" style="justify-content:space-between"><span class="small muted num">Duell ${d.i+1} von ${d.runden.length}</span><span class="small muted num">${d.ok} richtig</span></div>
      <p class="ga-duell-frage"><span class="ga-kat ${r.k}">${ZIELE[r.k].name}</span> ${KAT[r.k][1]}</p>
      <div class="ga-duell" role="group" aria-label="Deine Antwort"><button class="ga-karte" type="button" data-w="a"><span class="ms" aria-hidden="true">${A.icon}</span><b>${A.name}</b></button><span class="ga-vs" aria-hidden="true">vs.</span><button class="ga-karte" type="button" data-w="b"><span class="ms" aria-hidden="true">${B.icon}</span><b>${B.name}</b></button></div>
      <div class="row"><button class="btn small" type="button" data-w="g"><span class="ms" aria-hidden="true">balance</span>Gleich</button></div><div data-fb></div>`;
    const loes=A.w[r.k]>B.w[r.k]?'a':A.w[r.k]<B.w[r.k]?'b':'g';
    $$('[data-w]',box).forEach(k=>k.addEventListener('click',()=>{
      if(box.dataset.fertig==='1')return;box.dataset.fertig='1';const ok=k.dataset.w===loes;if(ok)d.ok++;
      $$('[data-w]',box).forEach(x=>{x.disabled=true;if(x.classList.contains('ga-karte'))x.classList.add(x.dataset.w===loes?'right':loes==='g'?'right':'wrong')});
      const txt=loes==='g'?`Gleichauf: beide ${STUFE[A.w[r.k]]}.`:`${(loes==='a'?A:B).name} ist ${KAT[r.k][0]} (${STUFE[(loes==='a'?A:B).w[r.k]]} statt ${STUFE[(loes==='a'?B:A).w[r.k]]}).`;
      $('[data-fb]',box).innerHTML=`<div class="fb ${ok?'ok':'bad'}" tabindex="-1"><b>${ok?'Richtig!':'Nicht ganz.'}</b> ${txt} ${A.name}: ${A.warum[r.k]} ${B.name}: ${B.warum[r.k]}</div><div class="row" style="margin-top:8px"><button class="btn primary small" type="button" id="ac-d-weiter"><span class="ms" aria-hidden="true">arrow_forward</span>${d.i+1<d.runden.length?'Nächstes Duell':'Zum Ergebnis'}</button></div>`;
      $('#ac-d-weiter',box).addEventListener('click',()=>{d.i++;box.dataset.fertig='';zeigeDuell(true)});$('#ac-d-weiter',box).focus();
    }));
    if(fokus)$('.ga-karte',box).focus();
  }
  zeigeDuell(false);
  bindErk(root);
}});

/* 5 Anlageberatung: Ihr seid die Anlageberater, Anlegertest, Faktoren an die Wand */
const TYP_FRAGEN=[
  {f:'Du bekommst 500 € geschenkt. Was fühlt sich am besten an?',o:['Sicher weglegen, damit nichts passiert','Einen Teil sicher sparen, einen Teil anlegen','Es soll wachsen, auch wenn es schwanken kann']},
  {f:'Deine Anlage ist in einem Monat 20 % im Minus. Was tust du?',o:['Ich kann nicht mehr schlafen und verkaufe','Unangenehm, aber ich warte ab','Ich bleibe ruhig und lege vielleicht sogar nach']},
  {f:'Wann brauchst du das Geld voraussichtlich?',o:['In ein bis zwei Jahren','In drei bis sieben Jahren','Erst in zehn Jahren oder später']},
  {f:'Wie gut kennst du dich mit Geldanlage aus?',o:['Kaum','Ein bisschen','Ziemlich gut, ich informiere mich regelmäßig']}];
const TYPEN=[
  {bis:6,name:'Sicherheitsorientiert',icon:'shield',text:'Dir ist wichtig, dass nichts verloren geht. Tagesgeld und Festgeld passen zu dir. Denk aber an die Geldschmelze: Ein kleiner Teil in einem breit gestreuten ETF kann sich langfristig lohnen.'},
  {bis:9,name:'Ausgewogen',icon:'balance',text:'Du willst Sicherheit und Chancen. Eine Mischung passt zu dir: Notgroschen auf Tagesgeld, für langfristige Ziele ein ETF-Sparplan.'},
  {bis:12,name:'Chancenorientiert',icon:'rocket_launch',text:'Du kannst Schwankungen aushalten und hast Zeit. Breit gestreute ETFs passen zu dir. Aber: Erst kommt der Notgroschen, und nie alles auf eine Karte setzen.'}];
tool({id:'beratung',ch:3,farben:['s','r'],hinweise:HINWEISE.beratung,title:'Ihr seid die Anlageberater',sub:'Sechs Menschen aus Thüringen brauchen euren Rat – allein oder live mit der ganzen Klasse. Dazu: Welcher Anlagetyp bist du?',
html(){return `<p class="task"><b>Auftrag:</b> Sechs Menschen kommen zu euch in die Beratung. Lest ihre Geschichte und empfehlt die passende Anlage. Läuft ein Lernraum, startet eure Lehrkraft die Fälle live für die ganze Klasse. Danach findest du heraus, welcher Anlagetyp du selbst bist.</p>
<div class="grid2">${ANLEGER.map(x=>abstimmung({id:x.id,titel:x.titel,kopf:'Ihr seid die Anlageberater',icon:'support_agent',fall:`<p class="small"><b>${x.wer}</b></p><p>${x.fall}</p>`,frage:`Welche Anlage empfehlt ihr ${x.titel.startsWith('Familie')?'den Mostafas':x.titel.startsWith('Herr')?x.titel.replace('Herr','Herrn'):x.titel}?`,optionen:x.optionen,r:x.r,e:x.e})).join('')}</div>
<section class="aufgabe stack" id="be-typ"><p class="aufgabe-kopf"><span class="ms sm" aria-hidden="true">person_search</span>Test · Welcher Anlagetyp bist du?</p>
  <p class="aufgabe-frage">Beantworte die vier Fragen ehrlich. Es gibt kein richtig oder falsch. Dein Ergebnis bleibt auf deinem Gerät.</p>
  <ol class="test-fragen">${TYP_FRAGEN.map((q,i)=>`<li><fieldset><legend>${i+1}. ${q.f}</legend>${q.o.map((o,j)=>`<label class="test-opt"><input type="radio" name="be-typ-${i}" value="${j+1}"><span>${o}</span></label>`).join('')}</fieldset></li>`).join('')}</ol>
  <div class="row"><button class="btn primary small" type="button" id="be-auswerten" disabled><span class="ms" aria-hidden="true">insights</span>Auswerten</button></div>
  <div id="be-erg" class="stack"></div>
  <p class="small muted">Auch Banken müssen vor einer Anlageberatung fragen, welche Ziele, Erfahrungen und Risikobereitschaft du hast, und dürfen dir nur Passendes empfehlen (§ 64 Wertpapierhandelsgesetz).</p></section>
${schreibfeld(WAND.beratung)}
${impuls(IMPULS.beratung)}
${erkHTML('beratung')}`},
init(root){
  const box=$('#be-typ',root),btn=$('#be-auswerten',root);let st=store(P+'-typ')||{a:[]};
  $$('fieldset',box).forEach((g,i)=>$$('input',g).forEach(r=>{r.checked=st.a[i]===+r.value}));
  const wahl=()=>$$('fieldset',box).map(g=>{const r=$('input:checked',g);return r?+r.value:null});
  const zeige=fokus=>{const a=st.a;if(a.length<4||a.some(x=>x==null)){$('#be-erg',root).innerHTML='';return}
    const p=a.reduce((x,y)=>x+y,0),t=TYPEN.find(x=>p<=x.bis);
    $('#be-erg',root).innerHTML=`<div class="fb neu ga-typ" tabindex="-1"><span class="ms" aria-hidden="true">${t.icon}</span><div><p class="title-m">${t.name}</p><p>${t.text}</p></div></div>`;if(fokus)$('#be-erg .fb',root).focus()};
  box.addEventListener('change',()=>{st.a=wahl();btn.disabled=st.a.some(x=>x==null);store(P+'-typ',st)});
  btn.disabled=wahl().some(x=>x==null);
  btn.addEventListener('click',()=>{st.a=wahl();store(P+'-typ',st);zeige(true)});
  zeige(false);
  bindErk(root);
}});

/* 6 Schneeball-Rechner: Zinseszins, früher Start, Kosten, Anlagehorizont */
// Vereinfachte Rechnung: Die Sparrate eines Jahres wird am Jahresanfang eingezahlt, verzinst wird einmal im Jahr.
const verlauf=(k0,rate,p,n)=>{const out=[];let k=k0,ein=k0;for(let j=1;j<=n;j++){k=(k+rate*12)*(1+p/100);ein+=rate*12;out.push({j,k,ein})}return out};
const endwert=(k0,rate,p,n)=>{const v=verlauf(k0,rate,p,n);return v.length?v[v.length-1]:{k:k0,ein:k0}};
const HORIZONT=[
  {t:'Elias, 16, will in zwei Jahren den Führerschein bezahlen.',f:'kurz',e:'Zwei Jahre sind kurzfristig. Das Geld muss dann sicher da sein: Tagesgeld oder Festgeld.'},
  {t:'Mia, 15, legt Geld für den Notfall zurück, falls das Handy kaputtgeht.',f:'kurz',e:'Ein Notgroschen muss jederzeit verfügbar sein: Tagesgeld.'},
  {t:'Ben, 19, Azubi, spart für die Kaution und Möbel der ersten eigenen Wohnung in fünf Jahren.',f:'mittel',e:'Fünf Jahre sind mittelfristig. Eine Mischung aus sicherem Sparen und etwas Investieren kann passen.'},
  {t:'Sara, 17, möchte etwas für ihre Rente mit 67 zurücklegen.',f:'lang',e:'Bis zur Rente vergehen 50 Jahre. Schwankungen gleichen sich aus, der Zinseszins arbeitet: Investieren, zum Beispiel mit einem ETF-Sparplan.'},
  {t:'Lukas, 14, will mit 22 ein Auslandssemester bezahlen.',f:'lang',e:'Acht Jahre sind langfristig. Ein ETF-Sparplan kann passen, kurz vorher sollte das Geld nach und nach in sicherere Anlagen wandern.'},
  {t:'Lea, 16, spart für ein E-Bike im nächsten Sommer.',f:'kurz',e:'Weniger als ein Jahr: Das Geld gehört aufs Tagesgeldkonto.'}];
tool({id:'schneeball',ch:4,farben:['r'],hinweise:HINWEISE.schneeball,title:'Der Schneeball-Rechner',sub:'Zinseszins zum Ausprobieren: Warum früher Start und niedrige Kosten Tausende Euro wert sind',
html(){return `<p class="task"><b>Auftrag:</b> Ein Schneeball, der den Berg hinunterrollt, wird immer schneller größer. Genauso wächst Geld mit dem Zinseszins. Rechne zuerst die Aufgabe mit der Formel, probiere dann den Rechner aus.</p>
<div class="grid2">
  <div class="panel stack"><h3 class="title-m">Die Zinseszinsformel</h3><p class="ga-formel" aria-label="K n gleich K null mal Klammer 1 plus p Klammer zu hoch n">K<sub>n</sub> = K<sub>0</sub> × (1 + p)<sup>n</sup></p>
    <dl class="kv"><dt>K<sub>n</sub></dt><dd>Endbestand: dein Geld nach n Jahren</dd><dt>K<sub>0</sub></dt><dd>Anfangsbestand: dein angelegtes Geld</dd><dt>p</dt><dd>Zinssatz als Dezimalzahl, z. B. 5 % = 0,05</dd><dt>n</dt><dd>Anzahl der Jahre</dd></dl>
    <p class="small"><b>Zinseszins</b> heißt: Du bekommst nicht nur Zinsen auf dein angelegtes Geld, sondern auch auf die Zinsen der vergangenen Jahre. Dein Geld wächst nicht gleichmäßig, sondern exponentiell.</p></div>
  <section class="aufgabe stack"><p class="aufgabe-kopf"><span class="ms sm" aria-hidden="true">calculate</span>Rechnen</p>
    <p class="aufgabe-frage">Berechne den Endbestand K<sub>n</sub> für 10.000 € und für 100.000 €, jeweils bei 7 % Rendite über 30 Jahre. Runde auf ganze Euro.</p>
    <div class="row wc-zahl"><label class="small" for="sb-a1">10.000 € nach 30 Jahren</label><input id="sb-a1" type="text" inputmode="decimal" autocomplete="off"><span>€</span></div>
    <div class="row wc-zahl"><label class="small" for="sb-a2">100.000 € nach 30 Jahren</label><input id="sb-a2" type="text" inputmode="decimal" autocomplete="off"><span>€</span></div>
    <div class="row"><button class="btn primary small" type="button" id="sb-pruefen"><span class="ms" aria-hidden="true">task_alt</span>Prüfen</button></div>
    <div id="sb-fb" class="stack" role="status"></div>
    ${hilfen({tipp:'Setz ein: K<sub>n</sub> = 10.000 × 1,07<sup>30</sup>. Auf dem Taschenrechner: 1,07 ^ 30 = 7,612…',denkWeiter:'Vergleiche beide Ergebnisse: Was fällt dir auf, wenn der Anfangsbestand zehnmal so groß ist?'})}</section>
</div>
<div class="panel stack"><h3 class="title-m">Schneeball-Rechner</h3>
  <div class="grid2">
    <div class="stack">
      <div class="ctrl"><label for="sb-k0">Startbetrag <output id="sb-k0o"></output></label><input type="range" id="sb-k0" min="0" max="20000" step="100" value="1000"></div>
      <div class="ctrl"><label for="sb-r">Sparrate pro Monat <output id="sb-ro"></output></label><input type="range" id="sb-r" min="0" max="300" step="5" value="25"></div>
      <div class="ctrl"><label for="sb-p">Rendite pro Jahr <output id="sb-po"></output></label><input type="range" id="sb-p" min="0" max="10" step="0.5" value="5"></div>
      <div class="ctrl"><label for="sb-n">Jahre <output id="sb-no"></output></label><input type="range" id="sb-n" min="1" max="50" step="1" value="30"></div>
    </div>
    <div class="stack" aria-live="polite"><p class="eyebrow">Endbestand</p><div class="big-num" id="sb-end"></div><p class="small" id="sb-text"></p>
      <div class="legend ga-legende"><span><i class="ein"></i>Eingezahlt</span><span><i class="zins"></i>Zinsen und Zinseszinsen</span></div></div>
  </div>
  <div class="chart" id="sb-chart"></div>
  <p class="small muted">Vereinfacht: Die Sparrate eines Jahres wird am Jahresanfang eingezahlt, verzinst wird einmal im Jahr, ohne Kosten und Steuern. Eine Rendite von 5 bis 7 % im Jahr haben breit gestreute Aktien-ETFs in der Vergangenheit im langjährigen Durchschnitt erreicht. Das ist keine Garantie für die Zukunft.</p></div>
<div class="panel stack"><h3 class="title-m">Früh starten oder später mehr sparen?</h3>
  <div class="ga-vergleich" id="sb-vgl"></div>
  <p class="small muted">Beide bis 67, 5 % Rendite pro Jahr, gleiche vereinfachte Rechnung wie oben.</p></div>
<div class="panel stack"><h3 class="title-m">Kosten-Killer: ETF oder aktiver Fonds?</h3>
  <p class="small">Mia legt 40 Jahre lang jeden Monat 100 € an. Der Markt bringt 6 % im Jahr. Wie viel bleibt ihr nach Kosten?</p>
  <div class="ga-vergleich" id="sb-kosten"></div>
  <p class="small muted">Laufende Kosten pro Jahr: breit gestreuter ETF etwa 0,2 %, aktiver Fonds oft 1,5 % und mehr, dazu oft ein Ausgabeaufschlag (hier nicht eingerechnet).</p></div>
<div class="panel stack"><h3 class="title-m"><span class="ms" aria-hidden="true">child_care</span> Neu: die Frühstart-Rente</h3>
  <p class="small">Der Bundestag hat am 16. Oktober 2026 die Frühstart-Rente beschlossen, der Bundesrat muss noch zustimmen. Ab 2027 legt der Staat für jedes Kind vom 6. bis zum 18. Geburtstag jeden Monat 10 € in ein Depot mit Aktien, zusammen 1.440 €. Los geht es mit den Jahrgängen 2020 und 2021, vielleicht also für deine jüngeren Geschwister. Ausgezahlt wird frühestens mit 65.</p>
  <p class="small" id="sb-frueh"></p></div>
${zuordnen({id:'sb-horizont',frage:'Sparen oder investieren? Ordne die Sparziele dem passenden Anlagehorizont zu.',faecher:[
  {id:'kurz',t:'Kurzfristig: 1 bis 3 Jahre → sparen',kurz:'Kurzfristig',info:'<p><b>Kurzfristig (1 bis 3 Jahre):</b> Das Geld muss sicher und bald verfügbar sein. Sparen auf Tagesgeld oder Festgeld.</p>'},
  {id:'mittel',t:'Mittelfristig: 3 bis 7 Jahre → Mischung',kurz:'Mittelfristig',info:'<p><b>Mittelfristig (3 bis 7 Jahre):</b> Ein Teil sicher sparen, ein Teil breit gestreut investieren.</p>'},
  {id:'lang',t:'Langfristig: mehr als 7 Jahre → investieren',kurz:'Langfristig',info:'<p><b>Langfristig (mehr als 7 Jahre):</b> Schwankungen gleichen sich über die Zeit eher aus, der Zinseszins arbeitet. Investieren, zum Beispiel mit einem ETF-Sparplan.</p>'}],karten:HORIZONT})}
${schreibfeld(WAND.schneeball)}
${impuls(IMPULS.schneeball)}
${erkHTML('schneeball')}`},
init(root){
  const el={k0:$('#sb-k0',root),r:$('#sb-r',root),p:$('#sb-p',root),n:$('#sb-n',root)};
  const st=store(P+'-schneeball');if(st)Object.keys(el).forEach(k=>{if(st[k]!=null)el[k].value=st[k]});
  function chart(v){
    const box=$('#sb-chart',root),m=svgMass(box,760),W=m.W,f=m.fs,fl=f(12),H=Math.round(Math.min(320,W*.55)),L=Math.round(fl*5.4),R=8,T=10,B=Math.round(fl*2.2);
    const max=Math.max(1,...v.map(x=>x.k)),bw=(W-L-R)/v.length,y=x=>T+(H-T-B)*(1-x/max);
    const stufe=[1,2,5,10,20,50,100,200,500,1000,2000,5000,10000,20000,50000,100000,200000,500000,1e6,2e6,5e6].find(s=>max/s<=5)||1e7;
    let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Balkendiagramm: Endbestand nach ${v.length} Jahren ${eur(v.at(-1).k)}, davon eingezahlt ${eur(v.at(-1).ein)}.">`;
    for(let g=0;g<=max;g+=stufe){s+=`<line x1="${L}" x2="${W-R}" y1="${y(g)}" y2="${y(g)}" stroke="var(--md-outline-variant)"/><text x="${L-4}" y="${y(g)+fl/3}" text-anchor="end" font-size="${fl}" class="t-fg">${fmt(g,0)}</text>`}
    v.forEach((x,i)=>{const X=L+i*bw+bw*.12,w=Math.max(1,bw*.76);s+=`<rect x="${X}" y="${y(x.ein)}" width="${w}" height="${y(0)-y(x.ein)}" fill="var(--md-outline)"/><rect x="${X}" y="${y(x.k)}" width="${w}" height="${Math.max(0,y(x.ein)-y(x.k))}" fill="var(--md-ga-r)"/>`;
      if(v.length<=12||(i+1)%5===0||i===0)s+=`<text x="${X+w/2}" y="${H-B+fl*1.3}" text-anchor="middle" font-size="${fl}" class="t-fg">${x.j}</text>`});
    s+=`<text x="${L+4}" y="${T+fl}" font-size="${fl}" class="t-fg">Euro nach … Jahren</text>`;
    box.innerHTML=s+'</svg>';
  }
  function calc(){
    const k0=+el.k0.value,r=+el.r.value,p=+el.p.value,n=+el.n.value,v=verlauf(k0,r,p,n),e=v.at(-1);
    $('#sb-k0o',root).textContent=eur(k0);$('#sb-ro',root).textContent=eur(r);$('#sb-po',root).textContent=pz(p);$('#sb-no',root).textContent=`${n} ${n===1?'Jahr':'Jahre'}`;
    $('#sb-end',root).textContent=eur(e.k);
    $('#sb-text',root).textContent=`Eingezahlt: ${eur(e.ein)}. Zinsen und Zinseszinsen: ${eur(e.k-e.ein)}.${e.k>2*e.ein?' Mehr als die Hälfte hat der Schneeball selbst gemacht!':''}`;
    chart(v);store(P+'-schneeball',{k0,r,p,n});
  }
  Object.values(el).forEach(x=>x.addEventListener('input',calc));calc();beiBreite($('#sb-chart',root),calc);
  // Früher Start: Lena ab 15 mit 25 €, Tom ab 30 mit 50 €, beide bis 67
  const lena=endwert(0,25,5,52),tom=endwert(0,50,5,37);
  $('#sb-vgl',root).innerHTML=[['Lena','startet mit 15, legt 25 € im Monat an',lena],['Tom','startet mit 30, legt 50 € im Monat an',tom]].map(([n,t,e])=>`<div class="ga-person"><p class="title-m">${n}</p><p class="small">${t}</p><p class="small">Eingezahlt: <b class="num">${eur(e.ein)}</b></p><p>Mit 67: <b class="num">${eur(e.k)}</b></p></div>`).join('')+
    `<div class="fb ok"><b>Lena hat ${eur(lena.k-tom.k)} mehr,</b> obwohl sie ${eur(tom.ein-lena.ein)} weniger eingezahlt hat. Ihr Vorsprung: 15 Jahre mehr Zeit für den Zinseszins.</div>`;
  const etf=endwert(0,100,6-0.2,40),fonds=endwert(0,100,6-1.8,40);
  $('#sb-kosten',root).innerHTML=`<div class="ga-person"><p class="title-m">ETF, 0,2 % Kosten</p><p>Nach 40 Jahren: <b class="num">${eur(etf.k)}</b></p></div><div class="ga-person"><p class="title-m">Aktiver Fonds, 1,8 % Kosten</p><p>Nach 40 Jahren: <b class="num">${eur(fonds.k)}</b></p></div><div class="fb amb"><b>${eur(etf.k-fonds.k)} Unterschied</b> – nur durch die Kosten. Eingezahlt hat Mia in beiden Fällen ${eur(etf.ein)}.</div>`;
  // Frühstart-Rente: 12 Jahre lang 10 € im Monat, danach bis 65 liegen lassen
  const fr=endwert(0,10,5,12).k*Math.pow(1.05,47);
  $('#sb-frueh',root).innerHTML=`Rechne mit dem Schneeball: Bei 5 % Rendite im Jahr würden aus den 1.440 € bis zum 65. Geburtstag rund <b class="num">${eur(Math.round(fr/100)*100)}</b> – ganz ohne eigene Einzahlung.`;
  // Rechenaufgabe
  const soll=[10000,100000].map(k=>k*Math.pow(1.07,30));
  const zahlAus=t=>{const s=String(t).trim().replace(/\s|€/g,'');if(!s)return NaN;return parseFloat(s.includes(',')?s.replace(/\./g,'').replace(',','.'):/^\d{1,3}(\.\d{3})+$/.test(s)?s.replace(/\./g,''):s)};
  $('#sb-pruefen',root).addEventListener('click',()=>{
    const w=[zahlAus($('#sb-a1',root).value),zahlAus($('#sb-a2',root).value)],ok=w.map((x,i)=>Math.abs(x-soll[i])<=1.5);
    const tipp=(x,i)=>isNaN(x)?'Trag ein Ergebnis ein.':Math.abs(x-[10000,100000][i]*(1+0.07*30))<2?`Das ist ${eur(x)}: Du hast nur einfache Zinsen gerechnet (7 % × 30 Jahre). Beim Zinseszins werden auch die Zinsen verzinst.`:x>soll[i]*5?'Achtung: 7 % sind 0,07, nicht 0,7.':'Rechne noch einmal: Anfangsbestand × 1,07 hoch 30.';
    $('#sb-fb',root).innerHTML=ok.map((o,i)=>`<div class="fb ${o?'ok':'bad'}"><b>${[eur(10000),eur(100000)][i]}: ${o?'Richtig!':'Noch nicht.'}</b> ${o?`K<sub>30</sub> = ${eur(soll[i],2)}. Davon sind ${eur(soll[i]-[10000,100000][i])} Zinsen und Zinseszinsen.`:tipp(w[i],i)}</div>`).join('')+
      (ok.every(Boolean)?`<p class="small">Zehnmal so viel Startkapital ergibt zehnmal so viel Endbestand. Entscheidend für das Wachstum ist der Faktor 1,07<sup>30</sup> ≈ 7,6: Das Geld hat sich mehr als versiebenfacht.</p>`:'');
  });
  bindErk(root);
}});

/* 7 Depot-Zeitmaschine 2018 bis 2025 */
tool({id:'zeitmaschine',ch:4,farben:['s','l','r'],hinweise:HINWEISE.zeitmaschine,title:'Die Depot-Zeitmaschine',sub:'Jugendweihe 2018: Verteile 1.000 € und reise mit echten Kursen bis 2025. Hältst du durch, wenn es kracht?',
html(){return `<p class="task"><b>Auftrag:</b> Stell dir vor, du hast im Frühjahr 2018 zur Jugendweihe 1.000 € bekommen. Verteile das Geld auf die Anlagen. Was du nicht verteilst, bleibt auf dem Girokonto. Dann startest du die Zeitmaschine und erlebst Jahr für Jahr, was mit deinem Geld passiert – mit echten Kursen bis Ende 2025.</p>
<div id="zm" class="stack"></div>
${schreibfeld(WAND.zeitmaschine)}
${impuls(IMPULS.zeitmaschine)}
${erkHTML('zeitmaschine')}`},
init(root){
  const box=$('#zm',root),A=ZEIT.anlagen,J=ZEIT.jahre;
  let st=store(P+'-zeit')||{verteilung:Object.fromEntries(A.map(a=>[a.id,0])),phase:'verteilen'};
  const summe=()=>A.reduce((s,a)=>s+st.verteilung[a.id],0);
  const speichern=()=>store(P+'-zeit',st);
  // Rechnet den Verlauf: Jahr für Jahr mit den Jahresrenditen; nach einem „Verkaufen“ liegt alles Riskante auf Tagesgeld
  function rechne(vert,verkauft={}){
    let pos={...vert,giro:1000-A.reduce((s,a)=>s+vert[a.id],0)};const werte=[{jahr:J[0]-1,pos:{...pos},summe:1000}];
    J.forEach((j,i)=>{
      A.forEach(a=>{pos[a.id]=pos[a.id]*(1+a.r[i]/100)});
      if(verkauft[j]){const tg=A.find(a=>a.id==='tagesgeld');A.forEach(a=>{if(a.riskant){pos[tg.id]+=pos[a.id];pos[a.id]=0}})}
      werte.push({jahr:j,pos:{...pos},summe:Object.values(pos).reduce((s,x)=>s+x,0)});
    });
    return werte;
  }
  const kaufkraft=(wert,bis)=>{let f=1;J.forEach((j,i)=>{if(j<=bis)f*=1+ZEIT.inflation[i]/100});return wert/f};
  const zeile=(a,wert,vor)=>{const d=vor?wert/vor-1:0;return `<tr><td><span class="ms sm" aria-hidden="true">${a.icon}</span> ${a.name}</td><td class="r num">${eur(wert)}</td><td class="r num ${d<0?'ga-minus':d>0?'ga-plus':''}">${vor?(d>0?'+':d<0?'−':'±')+pz(Math.abs(d*100),0):'–'}</td></tr>`};
  const GIRO={id:'giro',name:'Girokonto',icon:'account_balance_wallet'};
  function verteilen(fokus){
    const rest=1000-summe();
    box.innerHTML=`<div class="ga-depot">${A.map(a=>`<div class="ga-pos"><div class="ga-pos-kopf"><span class="ms" aria-hidden="true">${a.icon}</span><b>${a.name}</b><output class="num" id="zm-o-${a.id}">${eur(st.verteilung[a.id])}</output></div><p class="small muted">${a.info}</p>
      <label class="sr-only" for="zm-${a.id}">${a.name}: Betrag in Euro</label><input type="range" id="zm-${a.id}" data-zm="${a.id}" min="0" max="1000" step="50" value="${st.verteilung[a.id]}"></div>`).join('')}</div>
      <div class="panel ga-rest"><span class="ms" aria-hidden="true">account_balance_wallet</span><span>Bleibt auf dem Girokonto (0 % Zinsen): <b class="num" id="zm-rest">${eur(rest)}</b></span>
      <button class="btn primary" type="button" id="zm-start"><span class="ms" aria-hidden="true">rocket_launch</span>Zeitmaschine starten</button></div>`;
    $$('[data-zm]',box).forEach(r=>r.addEventListener('input',()=>{const id=r.dataset.zm,andere=summe()-st.verteilung[id];let v=+r.value;if(andere+v>1000){v=1000-andere;r.value=v}
      st.verteilung[id]=v;speichern();$(`#zm-o-${id}`,box).textContent=eur(v);$('#zm-rest',box).textContent=eur(1000-summe())}));
    $('#zm-start',box).addEventListener('click',()=>{st.phase='reise';st.jahr=0;st.verkauft={};speichern();reise(true)});
    if(fokus)$('[data-zm]',box).focus();
  }
  function reise(fokus){
    // Angezeigt wird das Jahr vor einem Verkauf in diesem Jahr, damit die Änderungen stimmen
    const i=st.jahr,j=J[i],verkauftJetzt=!!(st.verkauft||{})[j],werte=rechne(st.verteilung,{...st.verkauft,[j]:false}),w=werte[i+1],vor=werte[i],ev=ZEIT.ereignisse[j],risk=A.some(a=>a.riskant&&w.pos[a.id]>0.5);
    const entscheiden=ZEIT.krise[j]&&risk&&!verkauftJetzt&&!(st.entschieden||{})[j];
    box.innerHTML=`<div class="ga-jahr"><span class="display-s" id="zm-jahr" tabindex="-1">Ende ${j}</span><span class="small muted">Jahr ${i+1} von ${J.length}</span></div>
      <div class="ga-ereignis"><p class="title-s">${ev.t}</p><p class="small">${ev.d}</p></div>
      <div class="grid2"><div class="panel stack"><p class="eyebrow">Dein Depot</p><div class="big-num">${eur(w.summe)}</div>
        <p class="small">${w.summe>=vor.summe?'Plus':'Minus'} in diesem Jahr: <b class="num ${w.summe>=vor.summe?'ga-plus':'ga-minus'}">${eur(Math.abs(w.summe-vor.summe))}</b> · seit 2018: <b class="num ${w.summe>=1000?'ga-plus':'ga-minus'}">${w.summe>=1000?'+':'−'}${eur(Math.abs(w.summe-1000))}</b></p></div>
      <div class="tbl-wrap"><table><thead><tr><th>Anlage</th><th class="r">Wert</th><th class="r">${j}</th></tr></thead><tbody>${A.filter(a=>st.verteilung[a.id]>0||w.pos[a.id]>0.5).map(a=>zeile(a,w.pos[a.id],vor.pos[a.id])).join('')}${w.pos.giro>0?zeile(GIRO,w.pos.giro,vor.pos.giro):''}</tbody></table></div></div>
      ${verkauftJetzt?`<div class="fb amb">Verkauft! Deine riskanten Anlagen liegen ab jetzt auf dem Tagesgeldkonto: <b class="num">${eur(rechne(st.verteilung,st.verkauft)[i+1].summe)}</b>. Weitere Kursverluste treffen dich nicht mehr – Kursgewinne aber auch nicht.</div>`:''}
      ${entscheiden?`<div class="ga-entscheidung stack"><p class="title-m"><span class="ms" aria-hidden="true">warning</span> ${ZEIT.krise[j]}</p><p class="small">Verkaufst du jetzt alles Riskante und legst es aufs Tagesgeld? Oder hältst du durch?</p>
        <div class="row"><button class="btn" type="button" id="zm-verkaufen"><span class="ms" aria-hidden="true">sell</span>Alles verkaufen</button><button class="btn primary" type="button" id="zm-halten"><span class="ms" aria-hidden="true">front_hand</span>Durchhalten</button></div></div>`
      :`<div class="row">${i+1<J.length?`<button class="btn primary" type="button" id="zm-weiter"><span class="ms" aria-hidden="true">fast_forward</span>Weiter ins Jahr ${J[i+1]}</button>`:`<button class="btn primary" type="button" id="zm-ende"><span class="ms" aria-hidden="true">flag</span>Zur Bilanz</button>`}<button class="btn text" type="button" id="zm-abbruch"><span class="ms" aria-hidden="true">restart_alt</span>Neu verteilen</button></div>`}`;
    const weiter=()=>{st.jahr++;speichern();reise(true)};
    $('#zm-weiter',box)?.addEventListener('click',weiter);
    $('#zm-ende',box)?.addEventListener('click',()=>{st.phase='bilanz';speichern();bilanz(true)});
    $('#zm-abbruch',box)?.addEventListener('click',()=>{st.phase='verteilen';speichern();verteilen(true)});
    $('#zm-verkaufen',box)?.addEventListener('click',()=>{st.verkauft={...st.verkauft,[j]:true};st.entschieden={...(st.entschieden||{}),[j]:'verkauft'};speichern();reise(true)});
    $('#zm-halten',box)?.addEventListener('click',()=>{st.entschieden={...(st.entschieden||{}),[j]:'gehalten'};st.jahr++;speichern();reise(true)});
    if(fokus)$('#zm-jahr',box).focus();
  }
  function bilanz(fokus){
    const ende=J.at(-1),du=rechne(st.verteilung,st.verkauft),ohne=rechne(st.verteilung),e=du.at(-1).summe;
    const nur=id=>rechne(Object.fromEntries(A.map(a=>[a.id,a.id===id?1000:0]))).at(-1).summe;
    const strategien=[['Du',e,true],['Alles Girokonto',1000],...A.map(a=>[`Alles ${a.name}`,nur(a.id)])];
    const panik=Object.keys(st.verkauft||{}).length;
    // Liniendiagramm: dein Depot, alles ETF, alles Tagesgeld, Girokonto
    const reihen=[['du','Dein Depot',du.map(x=>x.summe)],['etf','Alles '+A.find(a=>a.id==='etf').name,rechne(Object.fromEntries(A.map(a=>[a.id,a.id==='etf'?1000:0]))).map(x=>x.summe)],['tg','Alles Tagesgeld',rechne(Object.fromEntries(A.map(a=>[a.id,a.id==='tagesgeld'?1000:0]))).map(x=>x.summe)],['giro','Girokonto',du.map(()=>1000)]];
    box.innerHTML=`<div class="ga-jahr"><span class="display-s" id="zm-jahr" tabindex="-1">Bilanz Ende ${ende}</span></div>
      <div class="grid2"><div class="panel stack"><p class="eyebrow">Aus deinen 1.000 € wurden</p><div class="big-num">${eur(e)}</div>
        <p class="small">Kaufkraft in Euro von 2018: <b class="num">${eur(kaufkraft(e,ende))}</b>. Die Preise sind seit 2018 um rund ${pz((1000/kaufkraft(1000,ende)-1)*100,0)} gestiegen, dein Girokonto ist also nur noch ${eur(kaufkraft(1000,ende))} wert.</p>
        ${panik?`<div class="fb amb">Du hast in der Krise verkauft. Hättest du durchgehalten, hättest du jetzt <b>${eur(ohne.at(-1).summe)}</b>.</div>`:Object.keys(st.entschieden||{}).length?'<div class="fb ok">Du hast in den Krisen durchgehalten. Die Verluste wurden später wieder aufgeholt.</div>':''}</div>
        <div class="panel chart"><div id="zm-chart"></div><div class="legend">${reihen.map(([k,n])=>`<span><i class="ga-leg-${k}"></i>${esc(n)}</span>`).join('')}</div></div></div>
      <h3 class="title-m">So wäre es mit anderen Strategien ausgegangen</h3>
      <div class="ga-strategien">${strategien.map(([n,v,du])=>`<div class="ga-strategie${du?' du':''}"><p class="small">${esc(n)}</p><p class="title-m num">${eur(v)}</p></div>`).join('')}</div>
      <div class="fb neu"><b>Hinterher ist man immer schlauer.</b> ${ZEIT.fazit}</div>
      <div class="row"><button class="btn" type="button" id="zm-neu"><span class="ms" aria-hidden="true">restart_alt</span>Noch einmal mit anderer Verteilung</button></div>`;
    const zeichne=()=>{const c=$('#zm-chart',box);if(!c)return;const m=svgMass(c,520),Wd=m.W,f=m.fs,fl=f(12),H=Math.round(Wd*.55),L=Math.round(fl*3.6),R=Math.round(fl*1.6),T=10,B=Math.round(fl*2);
      const alle=reihen.flatMap(r=>r[2]),max=Math.max(...alle)*1.05,min=Math.min(0,...alle),x=i=>L+(Wd-L-R)*i/(du.length-1),y=v=>T+(H-T-B)*(1-(v-min)/(max-min));
      let s=`<svg viewBox="0 0 ${Wd} ${H}" role="img" aria-label="Liniendiagramm 2018 bis ${ende}: Dein Depot endet bei ${eur(e)}.">`;
      const stufe=[250,500,1000,2000,5000,10000,20000].find(st=>max/st<=6)||50000;
      for(let g=0;g<=max;g+=stufe)s+=`<line x1="${L}" x2="${Wd-R}" y1="${y(g)}" y2="${y(g)}" stroke="var(--md-outline-variant)"/><text x="${L-4}" y="${y(g)+fl/3}" text-anchor="end" font-size="${fl}" class="t-fg">${fmt(g,0)}</text>`;
      du.forEach((p,i)=>{if(i===0||i===du.length-1||i%2===0)s+=`<text x="${x(i)}" y="${H-4}" text-anchor="middle" font-size="${fl}" class="t-fg">${i===0?'2018':p.jahr}</text>`});
      reihen.slice().reverse().forEach(([k,,v])=>{s+=`<polyline class="ga-linie-${k}" fill="none" stroke-width="${k==='du'?3.5:2}" ${k==='giro'?'stroke-dasharray="5 4"':''} points="${v.map((w,i)=>`${x(i)},${y(w)}`).join(' ')}"/>`});
      c.innerHTML=s+'</svg>'};
    zeichne();beiBreite($('#zm-chart',box),zeichne);
    $('#zm-neu',box).addEventListener('click',()=>{st={verteilung:st.verteilung,phase:'verteilen'};speichern();verteilen(true)});
    if(fokus)$('#zm-jahr',box).focus();
  }
  if(st.phase==='reise')reise(false);else if(st.phase==='bilanz')bilanz(false);else verteilen(false);
  bindErk(root);
}});

/* 8 Die goldenen Regeln */
tool({id:'regeln',ch:4,farben:['s','l','r'],hinweise:HINWEISE.regeln,title:'Die goldenen Regeln',sub:'Zehn Regeln, die dich vor teuren Fehlern schützen – als Lückentext für dein Heft',
html(){return `<p class="task"><b>Auftrag:</b> Fülle die Lücken mit den passenden Wörtern. Die Wörter zur Auswahl findest du unter dem Text. Prüfe, übertrage die Regeln ins Heft und überlege, welche Regel für dich am wichtigsten ist.</p>
${lueckentext({id:'regeln-lt',titel:'Die zehn goldenen Regeln der Geldanlage',saetze:[
  '1. [Schuldentilgung] hat immer Vorfahrt vor Geldanlage: Erst den Ratenkauf abbezahlen, dann anlegen.',
  '2. Mach dir klar, was dein [Sparziel] ist.',
  '3. Informiere dich über Chancen und [Risiken] von Anlagen.',
  '4. Sei skeptisch gegenüber [Verkäufern], besonders wenn sie dir in sozialen Medien schnelle und hohe Gewinne versprechen.',
  '5. Achte auf zusätzliche [Kosten] bei Geldanlagen, wie Provisionen und Gebühren.',
  '6. Wähle eine Anlageform, die zu deinem Anlageziel und deiner [Risikobereitschaft] passt.',
  '7. [Streue|Streu] deine Anlagen, das heißt: Wähle verschiedene Anlageformen, um das Risiko von Verlusten zu verringern.',
  '8. Investiere in schwankungsanfällige Anlagen wie Aktien nur [langfristig] oder mit Geld, das du in den nächsten Jahren nicht brauchst.',
  '9. Behalte deine [Anlagen] im Auge.',
  '10. [Kontrolliere] regelmäßig deine Ziele und Strategien.']})}
${schreibfeld(WAND.regeln)}
${impuls(IMPULS.regeln)}
${erkHTML('regeln')}`},
init(root){bindErk(root)}});

/* 9 Der Wolf of Saale: Chat-Abenteuer */
tool({id:'wolfchat',ch:5,farben:['s','l','r'],hinweise:HINWEISE.wolfchat,title:'Der Wolf of Saale',sub:'Ein Finfluencer verspricht dir: Aus 800 € mach 8.000 €. Vier Enden warten',
html(){return `<div class="ga-post"><div>${wolfSVG()}</div><div><p class="ga-post-kopf"><b>@wolf.of.saale</b><span class="pill neu">fiktiv</span><span class="small muted">erfundene Figur, fiktiver Beitrag</span></p>
  <p class="ga-post-text">„Ich war 17 und pleite. Heute fahr ich Lambo. Mein Geheimnis? $SAALE-Coin. Aus 800 € werden 8.000 €, garantiert. Nur heute in meiner VIP-Gruppe. Link in Bio.“</p></div></div>
<p class="task"><b>Auftrag:</b> Spielt das Chat-Abenteuer zu zweit. Ihr habt zur Jugendweihe 800 € bekommen, und plötzlich schreibt euch der Wolf of Saale. Entscheidet, was ihr antwortet und tut. Der Finanz-Check erklärt euch die Folgen. Findet alle vier Enden!</p>
${chatgeschichte(WOLF_CHAT)}
${schreibfeld(WAND.wolfchat)}
${impuls(IMPULS.wolfchat)}
${erkHTML('wolfchat')}`},
init(root){bindErk(root)}});

/* 10 Sichern: Hefteintrag, Bauchgefühl-Check, Antwort auf die Leitfrage */
tool({id:'sichern',ch:6,farben:['s','l','r'],hinweise:HINWEISE.sichern,title:'Hefteintrag und Bauchgefühl-Check',sub:'Das Wichtigste für dein Heft, die Auflösung der Blitzrunde und deine Antwort auf die Leitfrage',
html(){return `<p class="task"><b>Auftrag:</b> Vervollständige den Hefteintrag. Schau dann, wie gut dein Bauchgefühl am Anfang war, und beantworte die Leitfrage für dich selbst.</p>
${lueckentext({id:'sichern-lt',titel:'Hefteintrag: Geld anlegen',saetze:[
  'Auf dem Girokonto verliert Geld durch die [Inflation] an Kaufkraft. Was eine Anlage wirklich bringt, zeigt der [Realzins]: Zins minus Inflationsrate.',
  'Jede Geldanlage hat drei Ziele: [Sicherheit], [Liquidität] und [Rendite]. Sie stehen im Konflikt, deshalb spricht man vom magischen [Dreieck] der Geldanlage.',
  'Sparbuch, Tagesgeld und Festgeld sind bis 100.000 € durch die [Einlagensicherung] geschützt, bringen aber wenig Rendite.',
  'Mit einer [Aktie] wird man Miteigentümer eines Unternehmens. Ein [ETF] bildet einen Index nach und streut das Geld breit. Diese Streuung heißt [Diversifikation|Streuung].',
  'Beim [Zinseszins] werden auch die Zinsen verzinst. Deshalb lohnt es sich, früh anzufangen.',
  'Für kurzfristige Ziele spart man sicher, für [langfristige] Ziele kann man investieren.']})}
${blitzAufloesung(BAUCH)}
${schreibfeld(WAND.sichern)}
${impuls(IMPULS.sichern)}
${erkHTML('sichern')}`},
init(root){bindErk(root)}});

/* 11 Wissenscheck */
tool({id:'wissenscheck',ch:6,farben:['s','l','r'],hinweise:HINWEISE.wissenscheck,title:'Wissenscheck',sub:`${WISSENSCHECK.aufgaben.length} Aufgaben in drei Stufen mit Feedback zu jeder Antwort – auch als Klassen-Quiz im Lernraum`,
html(){return `<p class="task"><b>Auftrag:</b> Prüfe dein Wissen in drei Stufen: Grundlagen, Anwenden, Beurteilen. Zu jeder Antwort bekommst du ein Feedback. Läuft ein Lernraum, kann eure Lehrkraft den Wissenscheck als Klassen-Quiz starten.</p>
${wissenscheck(WISSENSCHECK)}`},
init(){}});

/* ---------- Startseite und Wissen ---------- */
function startHTML(){
  return `<section class="banner">${FOTO.boerse?`<img src="${FOTO.boerse.src}" alt="${esc(FOTO.boerse.alt)}"><span class="credit">${nachweis('boerse')}</span>`:''}
    <div class="banner-text"><p class="eyebrow">Leitfrage · Klasse 9 · Umgang mit Geld</p><h2>Jugendweihe-Geld, erster Lohn, Erspartes: Wie legst du dein Geld clever an?</h2></div></section>
  <section class="ga-start">
    <div class="stack"><p class="body-l">Geld einfach liegen lassen? Dann frisst die Inflation es langsam auf. Alles auf einen Coin setzen, wie es dir ein Finfluencer verspricht? Dann ist es vielleicht morgen weg. In dieser Lernwerkstatt testest du dein Bauchgefühl, vergleichst Sparbuch, Aktie, ETF und Bitcoin, reist mit der Depot-Zeitmaschine durch acht echte Börsenjahre und stellst dich dem Wolf of Saale.</p>
      <p class="small muted">Rund 8.300 Jugendliche in Thüringen haben sich 2026 zur Jugendweihe angemeldet. Viele bekommen dazu Geld geschenkt.</p>
      <div class="cta"><button class="fab" type="button" data-ga-tool="bauchgefuehl"><span class="ms" aria-hidden="true">bolt</span>Bauchgefühl testen</button><button class="btn outlined" type="button" data-ga-tool="zeitmaschine"><span class="ms" aria-hidden="true">rocket_launch</span>Depot-Zeitmaschine</button></div>
      <div class="ga-post"><div>${wolfSVG()}</div><div><p class="ga-post-kopf"><b>@wolf.of.saale</b><span class="pill neu">fiktiv</span><span class="small muted">erfundene Figur, fiktiver Beitrag</span></p><p class="ga-post-text">„Sparbuch ist was für Opas. Aus 800 € mach 8.000 €, garantiert! Link in Bio.“</p>
        <div class="row"><button class="btn small" type="button" data-dest="wolf"><span class="ms" aria-hidden="true">chat</span>Antworten …</button></div></div></div></div>
    <div class="panel stack"><h3 class="title-m">Was du danach kannst</h3><ul class="lernziele">
      <li><span class="ms" aria-hidden="true">check_circle</span><span>Erklären, warum Geld durch Inflation an Wert verliert, und den Realzins bestimmen</span></li>
      <li><span class="ms" aria-hidden="true">check_circle</span><span>Die drei Ziele der Geldanlage nennen und erklären, warum sie im Konflikt stehen</span></li>
      <li><span class="ms" aria-hidden="true">check_circle</span><span>Sparbuch, Tagesgeld, Festgeld, Anleihe, Aktie, Immobilie, ETF und Kryptowährung vergleichen</span></li>
      <li><span class="ms" aria-hidden="true">check_circle</span><span>Mit der Zinseszinsformel rechnen und eine Anlage passend zu Ziel und Anlegerprofil auswählen</span></li>
      <li><span class="ms" aria-hidden="true">check_circle</span><span>Unseriöse Angebote in sozialen Medien erkennen</span></li></ul></div>
  </section>
  ${chapterHTML(1)}
  <section class="section-h"><h2>Dein Lernpfad</h2><p>Die Bereiche bauen aufeinander auf: erst die Grundlagen, dann die Anlageformen, dann die Strategie und zum Schluss der Wolf. Jede Werkstatt endet mit einer Erkenntnis, die als Merksatz in „Mein Geld-Wissen“ landet – gesammelt ergibt das deinen Hefteintrag. Am Ende prüfst du alles im Wissenscheck, auf Wunsch als Klassen-Quiz.</p></section>
  <div class="dest-cards">${DEST.slice(1).map(d=>`<button class="dest" type="button" data-dest="${d.id}"><span class="ic"><span class="ms" aria-hidden="true">${d.icon}</span></span><span><span class="title-m">${d.label}</span><span class="small muted" style="display:block">${d.desc}</span></span></button>`).join('')}</div>`;
}
function sourcesHTML(){return `<section class="panel sources"><h3 class="title-m" style="color:var(--md-on-surface)">Quellen (Stand ${STAND})</h3><ul>${ZEIT.quellen.map(q=>`<li>${q}</li>`).join('')}
  <li>Fotos: ${Object.values(FOTO).map(f=>`${esc(f.motiv)}: ${f.link?`<a href="${f.link}" rel="noopener" target="_blank">${esc(f.credit.split(', ')[0])}</a>${f.lizenz?` (<a href="${f.lizenz}" rel="noopener" target="_blank">${esc(f.credit.split(', ')[1])}</a>)`:''}`:esc(f.credit)}`).join(' · ')||'keine'}</li>
  <li>Illustration: Der Wolf of Saale ist eine erfundene Figur und eine eigene Grafik von WR-Lab. $SAALE-Coin gibt es nicht.</li>
  <li>Anleger und Fälle nach den Unterrichtsmaterialien der Lehrkraft, nach Thüringen verlegt. Alle Personen und Szenarien sind erfunden.</li></ul>
  <p>Merksätze und Ergebnisse werden nur in diesem Browser gespeichert.</p>
  <div class="row"><button class="btn outlined small" id="reset" type="button"><span class="ms" aria-hidden="true">restart_alt</span>Merksätze zurücksetzen</button><span id="reset-confirm" class="row" hidden><button class="btn primary small" id="reset-yes" type="button">Ja, alles zurücksetzen</button><button class="btn text small" id="reset-no" type="button">Abbrechen</button></span></div></section>`}
function wissenHTML(){const alle=['s','l','r'].map(dot).join('');
  return chapterHTML(6,`<button class="card" type="button" data-open="glossar"><span class="dots">${alle}</span><h3 class="title-m">Begriffe nachschlagen</h3><p>${GLOSS.length} Fachbegriffe mit Suche</p><span class="go">Öffnen<span class="ms sm" aria-hidden="true">arrow_forward</span></span></button><button class="card" type="button" data-open="wissen"><span class="dots">${alle}</span><h3 class="title-m">Mein Geld-Wissen</h3><p>Alle Merksätze als Hefteintrag sammeln und kopieren</p><span class="go">Öffnen<span class="ms sm" aria-hidden="true">arrow_forward</span></span></button>`)+sourcesHTML()}

W.start();
