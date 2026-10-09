// Lernwerkstatt Geschäftsfähigkeit (Klasse 10): Werkstätten, Fall-Akte, Live-Gericht und Mission Zwergspitz.
// Gerüst, Navigation und Aufgaben-Bausteine kommen aus /shared/, hier stehen nur die Inhalte.
import { $, $$, esc, store } from '../shared/js/ui.js';
import { createWerkstatt } from '../shared/js/werkstatt.js';
import { schreibfeld, zuordnen, lueckentext, test as kurztest, wissenscheck, impuls, blitz, blitzAufloesung, pruefschema, fallakte, abstimmung } from '../shared/js/aufgaben.js';
import { GESETZ, NAVI, FAELLE, STUFEN, MEILENSTEINE, FOTO } from './daten.js';
import { HINWEISE, WAND, IMPULS } from './wand.js';
import { WISSENSCHECK } from './wissenscheck.js';

/* ---------- Merksätze ---------- */
const MS={
  bauchgefuehl:['Verträge schließen wir ständig: beim Döner, im App-Store, im Handyshop. Ob sie gelten, entscheidet nicht das Bauchgefühl, sondern das Gesetz – vor allem das Alter, die Zustimmung der Eltern und die Art der Bezahlung.'],
  alter:['Rechtsfähig ist jeder Mensch ab der Geburt (§ 1 BGB): Er kann Rechte und Pflichten haben. Geschäftsfähig wird man in Stufen: unter 7 Jahren geschäftsunfähig, von 7 bis 17 beschränkt geschäftsfähig, ab 18 voll geschäftsfähig (§ 2 BGB).'],
  haus:['Geschäftsunfähig sind Kinder unter 7 und dauerhaft geisteskranke Menschen (§ 104 BGB). Ihre Willenserklärungen sind nichtig (§ 105 BGB).',
    'Beschränkt Geschäftsfähige brauchen die Zustimmung der Eltern: vorher als Einwilligung (§ 107 BGB) oder nachträglich als Genehmigung (§ 108 BGB). Ohne Zustimmung geht es nur in drei Ausnahmen: lediglich rechtlicher Vorteil (§ 107), Taschengeld (§ 110) und erlaubter Job (§ 113).'],
  navi:['Fälle zur Geschäftsfähigkeit prüft man in fester Reihenfolge: Alter – lediglich rechtlicher Vorteil – Einwilligung – Taschengeld – Job – Genehmigung. Greift keine Ausnahme, ist der Vertrag schwebend unwirksam, bis die Eltern genehmigen oder verweigern.'],
  fallakte:['Nichtig heißt: von Anfang an ohne Wirkung. Schwebend unwirksam heißt: Der Vertrag wartet auf die Genehmigung der Eltern. Verweigern sie, ist er endgültig unwirksam. Wird der Minderjährige vorher volljährig, entscheidet er selbst (§ 108 Abs. 3 BGB).'],
  gericht:['Lediglich rechtlicher Vorteil heißt: Man bekommt etwas und übernimmt keine rechtlichen Pflichten. Wirtschaftlich günstig reicht nicht – einen zinslosen Kredit muss man zurückzahlen, mit einer vermieteten Wohnung übernimmt man die Pflichten als Vermieter.'],
  online:['§ 110 BGB gilt nur, wenn sofort und vollständig mit eigenem Geld bezahlt wird. Raten, Abos und „Jetzt kaufen, später bezahlen“ fallen nicht darunter, ebenso wenig Käufe mit dem Geld oder der Kreditkarte der Eltern.'],
  job:['Erlauben die Eltern einen Job, dürfen Minderjährige alle Geschäfte rund um diesen Job allein erledigen: Arbeitsvertrag, Kündigung, Lohnkonto (§ 113 BGB). Was sie vom Lohn kaufen, regelt § 110 BGB.'],
  zwergspitz:['Gegen das ausdrückliche Nein der Eltern hilft auch eigenes Geld nicht. Ein Tier bringt Folgekosten und Pflichten. Sicher ans Ziel führen nur die Einwilligung der Eltern oder das Warten bis zum 18. Geburtstag.'],
  sichern:['Die Geschäftsfähigkeit schützt Kinder und Jugendliche vor Verträgen, deren Folgen sie noch nicht überblicken. Je älter man wird, desto mehr darf man allein – und desto mehr Verantwortung trägt man.']
};

/* ---------- Glossar ---------- */
const GLOSS=[
  ['Arbeitsmündigkeit','§ 113 BGB: Erlauben die Eltern einen Job, darf der Minderjährige die Geschäfte rund um diesen Job allein erledigen, etwa Arbeitsvertrag und Kündigung.'],
  ['Beschränkt geschäftsfähig','Minderjährige von 7 bis 17 Jahren (§ 106 BGB). Für die meisten Verträge brauchen sie die Zustimmung der Eltern.'],
  ['Betreuung','Das Betreuungsgericht bestellt für Volljährige, die ihre Angelegenheiten nicht selbst regeln können, eine Betreuerin oder einen Betreuer (§ 1814 BGB).'],
  ['BGB','Bürgerliches Gesetzbuch. Es regelt seit 1900 die Rechtsbeziehungen zwischen Privatpersonen, zum Beispiel Kaufverträge.'],
  ['Einwilligung','Vorherige Zustimmung der Eltern (§§ 107, 183 BGB).'],
  ['Endgültig unwirksam','Die Eltern haben die Genehmigung verweigert. Ware und Geld gehen zurück.'],
  ['Familiengericht','Abteilung beim Amtsgericht. Es muss bestimmte Geschäfte der Eltern für ihre Kinder genehmigen, zum Beispiel einen Kredit (§ 1643 BGB).'],
  ['Genehmigung','Nachträgliche Zustimmung der Eltern (§§ 108, 184 BGB).'],
  ['Geschäftsfähigkeit','Fähigkeit, selbst wirksam Rechtsgeschäfte abzuschließen, zum Beispiel einen Kaufvertrag.'],
  ['Geschäftsunfähig','Kinder unter 7 Jahren und Menschen mit einer dauerhaften krankhaften Störung der Geistestätigkeit (§ 104 BGB).'],
  ['Gesetzlicher Vertreter','Bei Minderjährigen in der Regel die Eltern, bei betreuten Volljährigen die Betreuerin oder der Betreuer.'],
  ['Lediglich rechtlicher Vorteil','Man bekommt etwas, ohne rechtliche Pflichten zu übernehmen, zum Beispiel ein Geschenk (§ 107 BGB).'],
  ['Nichtig','Von Anfang an ohne jede Wirkung (§ 105 BGB).'],
  ['Rechtsfähigkeit','Fähigkeit, Träger von Rechten und Pflichten zu sein. Sie beginnt mit der Vollendung der Geburt (§ 1 BGB).'],
  ['Rechtsgeschäft','Eine oder mehrere Willenserklärungen, die eine rechtliche Folge haben sollen. Ein Kaufvertrag besteht aus Angebot und Annahme.'],
  ['Schwebend unwirksam','Der Vertrag gilt noch nicht und wartet auf die Genehmigung der Eltern (§ 108 BGB).'],
  ['Taschengeldparagraf','§ 110 BGB: Ein Vertrag ist wirksam, wenn sofort und vollständig mit Geld bezahlt wird, das zur freien Verfügung oder für diesen Zweck überlassen wurde.'],
  ['Voll geschäftsfähig','Volljährige ab 18 Jahren (§ 2 BGB).'],
  ['Willenserklärung','Äußerung, mit der jemand eine rechtliche Folge herbeiführen will, zum Beispiel „Ich kaufe die Jeans“.'],
  ['Zitiertechnik','So gibt man eine Fundstelle an: § 108 Abs. 3 BGB heißt Paragraf 108, Absatz 3, Bürgerliches Gesetzbuch.']
];

/* ---------- Kapitel und Bereiche ---------- */
const CH={1:['Kapitel 1 – Einstieg','Dein Bauchgefühl'],2:['Kapitel 2 – Die Regeln','Alter, Haus und Rechts-Navi'],3:['Kapitel 3 – Fälle lösen','Allein, zu zweit oder als ganze Klasse'],4:['Kapitel 4 – Mission Zwergspitz','Zu zweit'],5:['Kapitel 5 – Sichern','Hefteintrag und Wissenscheck']};
const DEST=[
  {id:'start',icon:'home',label:'Start',title:'Lernwerkstatt Geschäftsfähigkeit',kurz:'Geschäftsfähigkeit',render:startHTML},
  {id:'regeln',icon:'gavel',label:'Regeln',title:'Die Regeln der Geschäftsfähigkeit',kurz:'Regeln',ch:[2],desc:'Vom Baby zum Vertragsprofi, das Haus der Geschäftsfähigkeit und der Rechts-Navi'},
  {id:'faelle',icon:'folder_open',label:'Fälle',title:'Fälle lösen',ch:[3],desc:'Fall-Akte, Live-Gericht mit der ganzen Klasse, Gaming und Abos, der erste Job'},
  {id:'mission',icon:'pets',label:'Mission',title:'Mission Zwergspitz',ch:[4],tool:'zwergspitz',desc:'Sieben Wege zum Hund – welche führen ans Ziel, welche in die Sackgasse?'},
  {id:'wissen',icon:'school',label:'Wissen',title:'Sichern und wiederholen',ch:[5],render:wissenHTML,desc:'Hefteintrag, Bauchgefühl-Check, Wissenscheck, Fachbegriffe und deine Merksätze'}
];
const FARBE={unfaehig:'rot',beschraenkt:'gelb',voll:'gruen'};
const dot=k=>`<span class="gf-dot ${k}" aria-hidden="true"></span>`;

const W=createWerkstatt({
  thema:'geschaeftsfaehigkeit',
  speicher:'gf',
  logo:'<svg aria-hidden="true" width="40" height="40" viewBox="0 0 42 42"><path d="M4 19 21 5l17 14" fill="none" stroke="var(--md-primary)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><rect x="7" y="20" width="8.6" height="12" rx="1.5" fill="var(--gf-rot)"/><rect x="16.7" y="20" width="8.6" height="12" rx="1.5" fill="var(--gf-gelb)"/><rect x="26.4" y="20" width="8.6" height="12" rx="1.5" fill="var(--gf-gruen)"/><rect x="5" y="34" width="32" height="4" rx="2" fill="var(--gf-blau)"/></svg>',
  bereiche:DEST,
  kapitel:CH,
  merksaetze:MS,
  wissenTitel:'Mein Rechts-Wissen',
  glossar:GLOSS,
  punkte:x=>x.farben.map(dot).join(''),
  beimZeigen(id,v){
    $$('[data-gf-tool]',v).forEach(b=>b.addEventListener('click',()=>openTool(b.dataset.gfTool)));
    if($('#reset',v)){
      $('#reset',v).addEventListener('click',()=>{$('#reset-confirm',v).hidden=false});
      $('#reset-no',v).addEventListener('click',()=>{$('#reset-confirm',v).hidden=true});
      $('#reset-yes',v).addEventListener('click',()=>W.resetWissen());
    }
  }
});
const {tool,erkHTML,bindErk,openTool,chapterHTML}=W;

/* ---------- Fotos mit Bildnachweis ---------- */
function nachweis(k){const f=FOTO[k],[wer,lizenz]=f.credit.split(', ');return `Foto: <a href="${f.link}" rel="noopener" target="_blank">${esc(wer)}</a>, <a href="${f.lizenz}" rel="noopener" target="_blank">${esc(lizenz)}</a>`}
const fotoHTML=k=>`<figure class="gf-fig"><img src="${FOTO[k].src}" alt="${esc(FOTO[k].alt)}" loading="lazy"><figcaption>${nachweis(k)}</figcaption></figure>`;

/* 1 Bauchgefühl: Blitzrunde, aufgelöst erst in „Hefteintrag und Kurztest“ */
const BAUCH={id:'bauch',werkstatt:'bauchgefuehl',verdeckt:true,
  titel:'Darfst du das – allein, ohne deine Eltern? Entscheide aus dem Bauch.',
  optionen:[{id:'nein',t:'Nicht allein',icon:'block'},{id:'ja',t:'Geht klar',icon:'check_circle'}],
  karten:[
    {t:'Du bist 15 und kaufst dir vom Taschengeld einen Döner in Jena.',r:'ja',e:'Sofort und vollständig mit Taschengeld bezahlt: Das deckt der Taschengeldparagraf (§ 110 BGB).'},
    {t:'Du bist 16 und schließt allein einen Handyvertrag über 24 Monate ab.',r:'nein',e:'Der Vertrag verpflichtet dich jeden Monat zu zahlen. Ohne Zustimmung der Eltern ist er schwebend unwirksam (§ 108 BGB).'},
    {t:'Du bist 14 und kaufst EA-FC-Points – mit einer Guthabenkarte, die du vom Taschengeld bezahlt hast.',r:'ja',e:'Die Guthabenkarte ist schon bezahlt, und zwar mit deinem Taschengeld: § 110 BGB.'},
    {t:'Du bist 17 und bestellst Sneaker mit Klarna: „Jetzt kaufen, in 30 Tagen bezahlen“.',r:'nein',e:'„Später bezahlen“ ist nicht sofort bezahlt, § 110 BGB greift nicht. Klarna selbst verlangt außerdem ein Mindestalter von 18 Jahren.'},
    {t:'Deine kleine Schwester ist 6 und kauft sich am Kiosk von ihrem eigenen Euro Gummibärchen.',r:'nein',e:'Überraschend, aber wahr: Unter 7 ist man geschäftsunfähig, die Willenserklärung ist nichtig (§§ 104, 105 BGB). Schicken die Eltern sie zum Kiosk, überbringt sie nur deren Erklärung als Botin.'},
    {t:'Du bist 13 und deine Patentante schenkt dir 100 € zum Geburtstag.',r:'ja',e:'Ein Geschenk bringt dir lediglich einen rechtlichen Vorteil (§ 107 BGB). Dafür brauchst du keine Zustimmung.'},
    {t:'Du bist 16, jobbst mit Erlaubnis deiner Eltern im Café und kündigst den Job selbst.',r:'ja',e:'Für alles rund um den erlaubten Job bist du voll geschäftsfähig, auch für die Kündigung (§ 113 BGB).'},
    {t:'Du bist 15 und kaufst dir von angespartem Taschengeld einen Hund. Deine Eltern haben ausdrücklich Nein gesagt.',r:'nein',e:'Gegen das ausdrückliche Nein der Eltern hilft auch das Taschengeld nicht. Mehr dazu in der Mission Zwergspitz.'}]};
tool({id:'bauchgefuehl',ch:1,farben:['rot','gelb','gruen'],hinweise:HINWEISE.bauchgefuehl,title:'Darfst du das?',sub:'Acht Alltagssituationen, eine Sekunde pro Karte: Entscheide aus dem Bauch – die Auflösung kommt am Ende',
html(){return `<p class="task"><b>Auftrag:</b> Entscheide bei jeder Karte blitzschnell: Darfst du das allein, ohne deine Eltern? Nicht lange nachdenken! Ob du richtig lagst, erfährst du erst am Ende der Lernwerkstatt.</p>
${blitz(BAUCH)}
${schreibfeld(WAND.bauchgefuehl)}
${impuls(IMPULS.bauchgefuehl)}
${erkHTML('bauchgefuehl')}`},
init(root){bindErk(root)}});

/* 2 Vom Baby zum Vertragsprofi: Altersschieber */
const FIGUR=[[2,'child_care'],[6,'toys'],[12,'backpack'],[17,'skateboarding'],[18,'celebration'],[99,'work']];
const RAETSEL=[
  {f:'Ab welchem Alter bist du beschränkt geschäftsfähig?',r:7,e:'Mit dem 7. Geburtstag (§ 106 BGB). Vorher ist alles, was du allein abschließt, nichtig.'},
  {f:'Ab welchem Alter darfst du in Thüringen bei der Kommunalwahl wählen?',r:16,e:'Ab 16 wählst du in Thüringen den Gemeinderat und den Bürgermeister mit, außerdem das Europäische Parlament. Für Landtag und Bundestag musst du 18 sein.'},
  {f:'Ab welchem Alter kannst du für eine Straftat bestraft werden?',r:14,e:'Ab 14 bist du strafmündig (§ 19 StGB). Bis 17 gilt das Jugendstrafrecht.'},
  {f:'Ab welchem Alter darfst du einen Handyvertrag ganz allein abschließen?',r:18,e:'Erst mit 18 bist du voll geschäftsfähig (§ 2 BGB). Vorher brauchst du die Zustimmung deiner Eltern.'}];
tool({id:'alter',ch:2,farben:['rot','gelb','gruen'],hinweise:HINWEISE.alter,title:'Vom Baby zum Vertragsprofi',sub:'Am Altersschieber erleben, was du in welchem Alter darfst – und vier Altersrätsel lösen',
html(){return `<p class="task"><b>Auftrag:</b> Schieb das Alter von 0 bis 21 Jahre. Beobachte, wann sich die Farbe ändert und welche Altersgrenzen du erreichst. Löse dann die Altersrätsel: Stell das richtige Alter am Schieber ein.</p>
<div class="grid2">
  <div class="stack"><div class="panel gf-alter" id="al-box">
    <div class="gf-alter-kopf"><span class="gf-figur" id="al-figur" aria-hidden="true"><span class="ms">child_care</span></span>
      <div><p class="display-s num" id="al-zahl" aria-live="polite">0 Jahre</p><p class="title-m" id="al-stufe"></p><p class="small muted" id="al-p"></p></div></div>
    <label class="small" for="al-r">Alter</label>
    <input type="range" id="al-r" min="0" max="21" step="1" value="0">
    <div class="gf-band" aria-hidden="true"><span></span><span></span><span></span></div>
    <div class="gf-skala" aria-hidden="true"><span style="left:0">0</span><span style="left:33.3%">7</span><span style="left:85.7%">18</span><span style="left:100%">21</span></div>
    <p class="small" id="al-kurz"></p>
    <div class="gf-darf" id="al-darf"></div>
  </div>
  <section class="aufgabe" id="al-raetsel"><p class="aufgabe-kopf"><span class="ms sm">quiz</span>Altersrätsel <span class="small muted num" id="al-rn"></span></p>
    <p class="aufgabe-frage" id="al-rf"></p>
    <div class="row"><button class="btn primary small" type="button" id="al-pruefen"><span class="ms">task_alt</span>Das Alter am Schieber prüfen</button><button class="btn small" type="button" id="al-weiter" hidden><span class="ms">arrow_forward</span>Nächstes Rätsel</button></div>
    <div id="al-fb" class="stack" role="status"></div></section></div>
  <div class="panel stack"><h3 class="title-m">Altersgrenzen</h3><p class="small muted" id="al-naechste"></p><ol class="gf-meilen" id="al-meilen"></ol></div>
</div>
${schreibfeld(WAND.alter)}
${impuls(IMPULS.alter)}
${erkHTML('alter')}`},
init(root){
  const r=$('#al-r',root),fig=$('#al-figur',root);let altIcon='',erreicht=-1,ri=0;
  function zeige(){
    const a=+r.value,st=STUFEN.find(s=>a<=s.bis),farbe=FARBE[st.id],icon=FIGUR.find(([b])=>a<=b)[1];
    $('#al-zahl',root).textContent=`${a} ${a===1?'Jahr':'Jahre'}`;r.setAttribute('aria-valuetext',`${a} ${a===1?'Jahr':'Jahre'}: ${st.titel}`);
    $('#al-stufe',root).textContent=st.titel;$('#al-p',root).textContent=st.p;$('#al-kurz',root).textContent=st.kurz;
    $('#al-darf',root).innerHTML=`<b>Das darfst du:</b> ${st.darf}`;
    const box=$('#al-box',root);['rot','gelb','gruen'].forEach(f=>box.classList.toggle('gf-stufe-'+f,f===farbe));
    if(icon!==altIcon){fig.innerHTML=`<span class="ms">${icon}</span>`;fig.classList.remove('wechsel');void fig.offsetWidth;fig.classList.add('wechsel');altIcon=icon}
    const n=MEILENSTEINE.filter(m=>a>=m.ab).length;
    $('#al-meilen',root).innerHTML=MEILENSTEINE.map((m,i)=>`<li class="${a>=m.ab?'erreicht':''}${i===n-1&&n-1>erreicht?' neu':''}"><span class="ms">${a>=m.ab?m.icon:'lock'}</span><span><b>${m.titel}</b><br><span class="small">${m.t}</span><br><span class="small muted">${m.p}</span></span></li>`).join('');
    erreicht=n-1;
    const next=MEILENSTEINE.find(m=>m.ab>a);
    $('#al-naechste',root).textContent=next?`Nächste Grenze in ${next.ab-a} ${next.ab-a===1?'Jahr':'Jahren'}: ${next.titel.replace(/^\d+: /,'')}`:'Alle Altersgrenzen erreicht.';
  }
  function raetsel(){
    const q=RAETSEL[ri];$('#al-rn',root).textContent=`${ri+1} von ${RAETSEL.length}`;$('#al-rf',root).textContent=q.f;
    $('#al-fb',root).innerHTML='';$('#al-weiter',root).hidden=true;$('#al-pruefen',root).hidden=false;
  }
  $('#al-pruefen',root).addEventListener('click',()=>{
    const q=RAETSEL[ri],a=+r.value,ok=a===q.r;
    $('#al-fb',root).innerHTML=`<div class="fb ${ok?'ok':'bad'}"><b>${ok?'Richtig!':a<q.r?'Zu jung.':'Zu alt.'}</b> ${ok?q.e:'Schieb weiter und prüf noch einmal.'}</div>`;
    if(ok){$('#al-pruefen',root).hidden=true;
      if(ri+1<RAETSEL.length){$('#al-weiter',root).hidden=false;$('#al-weiter',root).focus()}
      else $('#al-fb',root).insertAdjacentHTML('beforeend',`<div class="fb ok"><span class="ms sm">workspace_premium</span> <b>Alle ${RAETSEL.length} Rätsel gelöst!</b></div>`)}
  });
  $('#al-weiter',root).addEventListener('click',()=>{ri++;raetsel();r.focus()});
  r.addEventListener('input',zeige);zeige();raetsel();bindErk(root);
}});

/* 3 Das Haus der Geschäftsfähigkeit (Grafik und Lückentext aus dem Arbeitsblatt) */
tool({id:'haus',ch:2,farben:['rot','gelb','gruen','blau'],hinweise:HINWEISE.haus,title:'Das Haus der Geschäftsfähigkeit',sub:'Das Haus einrichten, den Hefteintrag aus dem Gesetz ergänzen und richtig zitieren',
html(){return `<p class="task"><b>Auftrag:</b> Richte das Haus der Geschäftsfähigkeit ein: Ordne jede Karte dem passenden Raum zu. Fülle dann den Hefteintrag mit den Informationen aus den §§ 104 bis 113 BGB aus. Die Gesetzestexte findest du unten zum Aufklappen.</p>
${zuordnen({id:'haus-bauen',klasse:'haus',frage:'Wohin gehört jede Karte im Haus der Geschäftsfähigkeit?',
  faecher:[{id:'unfaehig',t:'Geschäftsunfähig · bis 6 Jahre'},{id:'beschraenkt',t:'Beschränkt geschäftsfähig · 7 bis 17 Jahre'},{id:'voll',t:'Voll geschäftsfähig · ab 18 Jahren'},
    {id:'ausnahme',t:'Ausnahmen: ohne Zustimmung der Eltern wirksam'},{id:'basis',t:'Fundament: Rechtsfähigkeit ab der Geburt'}],
  karten:[
    {t:'Leon (5) tauscht auf dem Spielplatz seine Pokémon-Karten gegen ein Spielzeugauto.',f:'unfaehig',e:'Unter 7 ist man geschäftsunfähig (§ 104 Nr. 1 BGB), der Tausch ist nichtig (§ 105 BGB).'},
    {t:'Franz (30) ist dauerhaft geisteskrank.',f:'unfaehig',e:'§ 104 Nr. 2 BGB: Wer sich dauerhaft in einem Zustand krankhafter Störung der Geistestätigkeit befindet, ist geschäftsunfähig – egal wie alt.'},
    {t:'Lukas (12) braucht für einen Handyvertrag die Zustimmung seiner Eltern.',f:'beschraenkt',e:'Mit 12 ist Lukas beschränkt geschäftsfähig (§§ 106, 107 BGB).'},
    {t:'Ohne Zustimmung ist der Vertrag erst einmal schwebend unwirksam.',f:'beschraenkt',e:'Das gilt für beschränkt Geschäftsfähige, bis die Eltern genehmigen oder verweigern (§ 108 Abs. 1 BGB).'},
    {t:'Die Eltern können einen Kauf auch nachträglich genehmigen.',f:'beschraenkt',e:'Die Genehmigung ist die nachträgliche Zustimmung (§ 108 Abs. 1 BGB).'},
    {t:'Lea hat gestern ihren 18. Geburtstag gefeiert und schließt heute allein einen Handyvertrag ab.',f:'voll',e:'Mit 18 ist Lea volljährig und voll geschäftsfähig (§ 2 BGB).'},
    {t:'Wer volljährig ist, haftet auch allein für seine Schulden.',f:'voll',e:'Volle Geschäftsfähigkeit heißt auch volle Verantwortung.'},
    {t:'Emma (10) bekommt vom Nachbarn ein Halloween-Kostüm geschenkt.',f:'ausnahme',e:'Lediglich rechtlicher Vorteil: Emma bekommt etwas und hat keine Pflichten (§ 107 BGB).'},
    {t:'Jonas (14) kauft sich vom Taschengeld einen Döner und bezahlt sofort.',f:'ausnahme',e:'Taschengeldparagraf (§ 110 BGB).'},
    {t:'Sophie (16) kündigt ihren Minijob, den ihre Eltern erlaubt haben.',f:'ausnahme',e:'Für Geschäfte rund um den erlaubten Job ist Sophie voll geschäftsfähig (§ 113 BGB).'},
    {t:'Ein Baby erbt das Haus seiner Oma.',f:'basis',e:'Jeder Mensch ist ab der Geburt rechtsfähig (§ 1 BGB) und kann deshalb Eigentümer werden. Verwalten müssen das Haus die Eltern.'}]})}
${lueckentext({id:'haus-luecken',titel:'Hefteintrag: Stufen der Geschäftsfähigkeit',saetze:[
  'Eine Person unter [7|sieben] Jahren ist [geschäftsunfähig]. Eine Willenserklärung dieser Person ist [nichtig].',
  'Eine minderjährige Person, die mindestens [7|sieben] Jahre, aber noch nicht [18|achtzehn] Jahre alt ist, ist nach § [106] BGB beschränkt geschäftsfähig. Um ein Rechtsgeschäft wirksam abschließen zu können, braucht sie laut § [107] BGB die [Einwilligung|Zustimmung] des gesetzlichen Vertreters, zum Beispiel der [Eltern|Mutter|Vater].',
  'Wurde diese nicht schon vor dem Vertragsschluss gegeben, hängt laut § [108] BGB die Wirksamkeit des Vertrags von der nachträglichen [Genehmigung] des gesetzlichen Vertreters ab. Bis dahin ist das Rechtsgeschäft [schwebend unwirksam].',
  'Die Zustimmung kann also auf zwei Arten erfolgen: vorher durch [Einwilligung] (§ 107 BGB) oder nachträglich durch [Genehmigung] (§ 108 BGB).',
  '<b>Ausnahmen:</b> Ein 14-Jähriger, der Geld geschenkt bekommt, braucht keine Zustimmung, weil er durch das Geld nur einen [rechtlichen Vorteil|lediglich rechtlichen Vorteil] erlangt und keine Verpflichtungen eingeht.',
  'Nach § 110 BGB ist ein Vertrag ohne Zustimmung wirksam, wenn der Minderjährige sofort und vollständig mit Geld bezahlt, das ihm [zur freien Verfügung|zu freier Verfügung] oder für diesen Zweck überlassen wurde. Deshalb heißt § 110 auch [Taschengeldparagraf|Taschengeldparagraph].',
  'Erlauben die Eltern einen Job, kann der Minderjährige alle Geschäfte rund um dieses [Arbeitsverhältnis|Dienst- oder Arbeitsverhältnis|Dienst- und Arbeitsverhältnis] allein abschließen, etwa den Arbeitsvertrag oder die Kündigung (§ 113 BGB). Was er vom Lohn kauft, regelt dagegen § [110] BGB.',
  'Mit Eintritt der [Volljährigkeit] sind Personen voll geschäftsfähig. Geschäftsunfähig sind nach § 104 BGB außerdem Personen im Zustand einer nicht nur vorübergehenden krankhaften Störung der [Geistestätigkeit].',
  'Rechtsfähig ist jeder Mensch nach § 1 BGB ab der Vollendung der [Geburt].']})}
<details class="hilfe"><summary><span class="ms sm">menu_book</span>Gesetzestexte §§ 1, 2, 104–110 und 113 BGB nachlesen</summary>
  <dl class="glossary">${[1,2,104,105,106,107,108,110,113].map(n=>`<dt>${GESETZ[n].p} – ${GESETZ[n].titel}</dt><dd>${GESETZ[n].t}</dd>`).join('')}</dl></details>
<div class="panel stack"><h3 class="title-m">Zitiertechnik: So gibst du eine Fundstelle an</h3>
  <p class="body-l mono" style="font-size:1.25rem">§ 823 Abs. 2 S. 1 BGB</p>
  <dl class="kv"><dt>§ 823</dt><dd>Welcher Paragraf?</dd><dt>Abs. 2</dt><dd>Welcher Absatz? Absätze stehen im Gesetz in Klammern: (1), (2) …</dd><dt>S. 1</dt><dd>Welcher Satz im Absatz?</dd><dt>Nr. 1</dt><dd>Welche Nummer einer Aufzählung? Etwa § 104 Nr. 1 BGB</dd><dt>BGB</dt><dd>Welches Gesetz? Hier das Bürgerliche Gesetzbuch</dd><dt>§§ 434, 90 BGB</dt><dd>Zwei Paragrafenzeichen: mehrere Paragrafen</dd></dl></div>
${kurztest({id:'haus-zitieren',titel:'Zitiertechnik: vier Fragen, je ein Versuch',fragen:[
  {f:'Wie zitierst du Absatz 3 von Paragraf 108 im Bürgerlichen Gesetzbuch?',o:['§ 108 Abs. 3 BGB','BGB § 3 Abs. 108','§§ 108, 3 BGB'],r:0,e:'Erst das Zeichen §, dann der Paragraf, dann der Absatz, am Ende das Gesetz.'},
  {f:'Was bedeutet „§§ 104, 105 BGB“?',o:['Paragraf 104 Absatz 105','Paragraf 104 und Paragraf 105','Die Paragrafen 104 bis 150'],r:1,e:'Zwei Paragrafenzeichen stehen für mehrere Paragrafen.'},
  {f:'In § 104 BGB steht unter „1.“: Geschäftsunfähig ist, wer nicht das siebente Lebensjahr vollendet hat. Wie zitierst du diese Stelle?',o:['§ 104 Abs. 1 BGB','§ 1 Nr. 104 BGB','§ 104 Nr. 1 BGB'],r:2,e:'Aufzählungen mit Ziffern heißen Nummer (Nr.), Absätze in Klammern heißen Absatz (Abs.).'},
  {f:'Wo steht, dass man mit 18 volljährig wird?',o:['§ 2 BGB','§ 18 BGB','§ 110 BGB'],r:0,e:'§ 2 BGB: Die Volljährigkeit tritt mit der Vollendung des 18. Lebensjahres ein.'}]})}
${schreibfeld(WAND.haus)}
${impuls(IMPULS.haus)}
${erkHTML('haus')}`},
init(root){bindErk(root)}});

/* 4 Der Rechts-Navi: das Prüfschema zum Durchklicken */
tool({id:'navi',ch:2,farben:['rot','gelb','gruen','blau'],hinweise:HINWEISE.navi,title:'Der Rechts-Navi',sub:'Das Prüfungsschema als Route: Frage für Frage zum Ergebnis – wirksam, schwebend unwirksam oder nichtig',
html(){return `<p class="task"><b>Auftrag:</b> Mach eine Probefahrt mit dem Rechts-Navi. Beantworte die Fragen für das Beispiel und schau, wo du ankommst. Starte dann neu und probier andere Abzweigungen aus: Wann landest du bei „Nichtig“, wann bei „Schwebend unwirksam“?</p>
${pruefschema({id:'navi-probe',titel:'Wirksam oder nicht? Der Rechts-Navi prüft für dich.',schema:NAVI,
  beispiel:'<b>Probefahrt:</b> Lea (16) kauft sich ohne Wissen ihrer Eltern Kopfhörer für 40 € und bezahlt sofort mit ihrem Taschengeld.'})}
${schreibfeld(WAND.navi)}
${impuls(IMPULS.navi)}
${erkHTML('navi')}`},
init(root){bindErk(root)}});

/* 5 Fall-Akte: die Fälle aus dem Arbeitsblatt, gelöst mit dem Rechts-Navi */
tool({id:'fallakte',ch:3,farben:['rot','gelb','gruen','blau'],hinweise:HINWEISE.fallakte,title:'Fall-Akte',sub:'Acht Fälle von Franz bis Boombox II: Mit dem Rechts-Navi lösen und die Lösung im Gutachtenstil lesen',
html(){return `<p class="task"><b>Auftrag:</b> Löst die Fälle zu zweit mit dem Rechts-Navi. Wählt bei jeder Frage die Antwort, die zum Fall passt. Biegt ihr falsch ab, bekommt ihr einen Tipp. Am Ende steht, wie man die Lösung aufschreibt – übertragt mindestens zwei Lösungen ins Heft.</p>
${fallakte({id:'akte',titel:'Fall-Akte Geschäftsfähigkeit',schema:NAVI,faelle:FAELLE})}
${schreibfeld(WAND.fallakte)}
${impuls(IMPULS.fallakte)}
${erkHTML('fallakte')}`},
init(root){bindErk(root)}});

/* 6 Ihr seid das Gericht: Live-Abstimmung im Lernraum, allein mit eigenem Urteil */
const URTEIL=['Wirksam','Schwebend unwirksam','Nichtig'];
const GERICHT=[
  {id:'gericht-simson',titel:'Die Simson',fall:`${fotoHTML('simson')}<p><b>Elias (16)</b> aus Suhl hat 1.800 € Taschengeld gespart. Ohne seine Eltern zu fragen, kauft er eine gebrauchte Simson S51 und bezahlt bar.</p>`,
    frage:'Ist der Kauf wirksam?',r:1,e:'Das Geld reicht, und Elias zahlt sofort. Mit dem Moped kommen aber Versicherung, Sprit und Unfallrisiko dazu. So weit reicht die Erlaubnis, über das Taschengeld frei zu verfügen, in der Regel nicht. Der Kauf ist schwebend unwirksam, bis die Eltern entscheiden.'},
  {id:'gericht-konzert',titel:'Das Konzert',fall:'<p><b>Hanna (15)</b> kauft sich an der Abendkasse der Messe Erfurt von ihrem Taschengeld ein Konzertticket für 59 € und bezahlt bar.</p>',
    frage:'Ist der Kauf wirksam?',r:0,e:'Sofort und vollständig mit Taschengeld bezahlt: Der Taschengeldparagraf (§ 110 BGB) greift. Ob Hanna abends auf das Konzert darf, ist eine andere Frage – das entscheiden die Eltern.'},
  {id:'gericht-wohnung',titel:'Die Wohnung',fall:'<p>Der Patenonkel schenkt <b>Lina (12)</b> eine vermietete Eigentumswohnung in Gotha. Die Eltern wissen nichts davon.</p>',
    frage:'Ist die Schenkung wirksam?',r:1,e:'Ein Geschenk – aber mit Haken: Mit der Wohnung übernimmt Lina den Mietvertrag und damit Pflichten als Vermieterin, etwa für Reparaturen. Das ist kein lediglich rechtlicher Vorteil. Ohne Zustimmung der Eltern ist die Schenkung schwebend unwirksam.'},
  {id:'gericht-job',titel:'Der Jobwechsel',fall:'<p><b>Tom (17)</b> darf mit Erlaubnis seiner Eltern bei einem Lieferdienst in Jena jobben. Weil ein Café mehr zahlt, kündigt er und unterschreibt dort einen neuen Arbeitsvertrag – ohne seine Eltern zu fragen.</p>',
    frage:'Sind Kündigung und neuer Vertrag wirksam?',r:0,e:'Die Erlaubnis für einen Job gilt im Zweifel auch für Jobs derselben Art (§ 113 Abs. 4 BGB). Kündigung und neuer Vertrag sind wirksam.'},
  {id:'gericht-tiktok',titel:'Der TikTok Shop',fall:'<p><b>Noah (15)</b> sieht im TikTok Shop eine Gaming-Maus für 89 € und bestellt sie mit „Jetzt kaufen, später bezahlen“.</p>',
    frage:'Ist der Kauf wirksam?',r:1,e:'Später bezahlen heißt: nicht sofort bewirkt. § 110 BGB greift nicht, der Kauf ist schwebend unwirksam, bis die Eltern entscheiden.'},
  {id:'gericht-konsole',titel:'Die Konsole',fall:'<p><b>Oskar (6)</b> bekommt von seiner Oma eine Spielekonsole geschenkt und sagt begeistert: „Danke, die nehm ich!“</p>',
    frage:'Hat Oskar das Geschenk wirksam angenommen?',r:2,e:'Überraschung: Auch ein Geschenk kann Oskar nicht selbst annehmen. Unter 7 ist jede eigene Willenserklärung nichtig (§§ 104, 105 BGB). Die Eltern nehmen das Geschenk für ihn an – dann gehört die Konsole Oskar.'}];
tool({id:'gericht',ch:3,farben:['rot','gelb','gruen'],hinweise:HINWEISE.gericht,title:'Ihr seid das Gericht',sub:'Sechs knifflige Fälle: Die ganze Klasse stimmt live auf dem Handy ab, dann kommt das Urteil',
html(){return `<p class="task"><b>Auftrag:</b> Fällt euer Urteil: wirksam, schwebend unwirksam oder nichtig? Im Lernraum startet eure Lehrkraft die Abstimmung, ihr stimmt auf dem Handy ab und seht danach das Ergebnis der Klasse. Ohne Lernraum urteilst du allein. Begründe dein Urteil mit dem Rechts-Navi.</p>
${GERICHT.map(g=>abstimmung({...g,optionen:URTEIL})).join('')}
${schreibfeld(WAND.gericht)}
${impuls(IMPULS.gericht)}
${erkHTML('gericht')}`},
init(root){bindErk(root)}});

/* 7 Gaming, Abos und Klarna */
tool({id:'online',ch:3,farben:['rot','gelb','gruen'],hinweise:HINWEISE.online,title:'Gaming, Abos und Klarna',sub:'V-Bucks, Spotify, Deutschlandticket und „später bezahlen“: Was gilt beim Bezahlen im Netz?',
html(){return `<p class="task"><b>Auftrag:</b> Ordne die Käufe zu: wirksam, schwebend unwirksam oder nichtig? Die Eltern wissen jeweils nichts davon. Prüfe dann, ob du die Erklärungen verstanden hast, und beantworte die Frage an der Wand.</p>
${zuordnen({id:'online-zuordnen',frage:'Wirksam, schwebend unwirksam oder nichtig?',
  faecher:[{id:'wirksam',t:'Wirksam'},{id:'schwebend',t:'Schwebend unwirksam'},{id:'nichtig',t:'Nichtig'}],
  karten:[
    {t:'Ben (14) löst für V-Bucks eine Guthabenkarte über 25 € ein, die er vom Taschengeld gekauft hat.',f:'wirksam',e:'Sofort und vollständig mit Taschengeld bezahlt (§ 110 BGB).'},
    {t:'Ben (14) kauft V-Bucks für 90 € mit Mamas Kreditkarte, die im Konto gespeichert ist.',f:'schwebend',e:'Nicht sein Geld und keine Einwilligung. Verweigert Mama die Genehmigung, muss der Anbieter das Geld zurückgeben.'},
    {t:'Lea (16) schließt ein Spotify-Premium-Abo ab und zahlt jeden Monat vom Taschengeld.',f:'schwebend',e:'Ein Abo verpflichtet für die Zukunft und ist nicht sofort vollständig bezahlt. Die Eltern müssen zustimmen.'},
    {t:'Jonas (16) bestellt mit Klarna Sneaker für 140 €: „Jetzt kaufen, in 30 Tagen bezahlen“.',f:'schwebend',e:'Später bezahlen ist nicht sofort bewirkt (§ 110 BGB). Klarna verlangt außerdem ein Mindestalter von 18.'},
    {t:'Paul (17) schließt im Handyshop allein einen Handyvertrag über 24 Monate ab.',f:'schwebend',e:'Monatliche Pflichten über zwei Jahre: ohne Zustimmung schwebend unwirksam (§ 108 BGB).'},
    {t:'Lina (17) bestellt das Deutschlandticket für 63 € im Monat als Abo.',f:'schwebend',e:'Das Deutschlandticket ist ein Abo, das jeden Monat weiterläuft. § 110 BGB greift nicht.'},
    {t:'Tim (15) bekommt von seinem Opa einen Gutschein über 50 € für einen Gaming-Shop geschenkt.',f:'wirksam',e:'Lediglich rechtlicher Vorteil (§ 107 BGB).'},
    {t:'Sarah (19) schließt online einen Handyvertrag ab.',f:'wirksam',e:'Sarah ist volljährig und voll geschäftsfähig (§ 2 BGB).'},
    {t:'Mia (6) tippt in einem Spiel auf „Diamanten kaufen“ für 4,99 €.',f:'nichtig',e:'Mia ist geschäftsunfähig, ihre Willenserklärung ist nichtig (§§ 104, 105 BGB).'},
    {t:'Ole (6) bestellt per Sprachbefehl am smarten Lautsprecher seiner Eltern Spielzeug für 30 €.',f:'nichtig',e:'Auch per Sprachbefehl gibt Ole eine Willenserklärung ab – und die ist nichtig, weil er unter 7 ist.'}]})}
<div class="panel stack"><h3 class="title-m"><span class="ms sm">shield</span> So schützt du dich und deine Geschwister</h3>
  <ul class="small"><li>Zahlungsdaten nicht im Spiel oder App-Store speichern, Käufe mit Passwort oder Fingerabdruck absichern.</li>
  <li>In den Familien-Einstellungen von Konsole und Handy Kaufsperren und Ausgabenlimits setzen.</li>
  <li>Bei ungewollten Käufen schnell den Support des Anbieters anschreiben und das Geld zurückfordern.</li></ul></div>
${schreibfeld(WAND.online)}
${impuls(IMPULS.online)}
${erkHTML('online')}`},
init(root){bindErk(root)}});

/* 8 Der erste Job (§ 113 BGB) */
const JOB={id:'job-blitz',werkstatt:'job',
  titel:'Lisa (16) aus Weimar jobbt mit Erlaubnis ihrer Eltern in einem Café am Theaterplatz. Was darf sie jetzt allein?',
  optionen:[{id:'eltern',t:'Nur mit Eltern',icon:'family_restroom'},{id:'allein',t:'Darf sie allein',icon:'check_circle'}],
  karten:[
    {t:'Den Arbeitsvertrag mit dem Café unterschreiben.',r:'allein',e:'Genau dafür ist § 113 Abs. 1 BGB da: Eingehung des erlaubten Arbeitsverhältnisses.'},
    {t:'Vom ersten Lohn ein E-Bike auf Raten kaufen.',r:'eltern',e:'Käufe vom Lohn gehören nicht zum Job. Und Raten sind nicht sofort bezahlt, also hilft auch § 110 BGB nicht.'},
    {t:'Den Job kündigen, weil ihr die Schichten zu spät sind.',r:'allein',e:'Auch die Kündigung gehört zum Job (§ 113 Abs. 1 BGB).'},
    {t:'Einen Kredit aufnehmen, um sich eine Siebträgermaschine für zu Hause zu kaufen.',r:'eltern',e:'Hat mit dem Job nichts zu tun. Für einen Kredit bräuchten sogar die Eltern die Genehmigung des Familiengerichts.'},
    {t:'Ein Girokonto eröffnen, auf das ihr Lohn überwiesen wird.',r:'allein',e:'Ein Lohnkonto gehört zur Abwicklung des Jobs (§ 113 BGB). Viele Banken wollen in der Praxis trotzdem die Unterschrift der Eltern sehen.'},
    {t:'Vom Lohn, den sie bar bekommt, eine Kinokarte kaufen.',r:'allein',e:'Das regelt nicht § 113, sondern § 110 BGB: Lassen die Eltern ihr den Lohn zur freien Verfügung, darf sie damit sofort bezahlen.'},
    {t:'Mit dem Chef mehr Lohn aushandeln.',r:'allein',e:'Auch Änderungen am Arbeitsvertrag gehören zum erlaubten Job (§ 113 BGB).'},
    {t:'Ein WG-Zimmer mieten, um näher am Café zu wohnen.',r:'eltern',e:'Ein Mietvertrag gehört nicht zum Job, auch wenn er praktisch wäre. Dafür braucht Lisa ihre Eltern.'}]};
tool({id:'job',ch:3,farben:['gelb','blau'],hinweise:HINWEISE.job,title:'Der erste Job',sub:'Minijob im Café in Weimar: Was darfst du mit 16 allein – und wofür brauchst du deine Eltern?',
html(){return `<p class="task"><b>Auftrag:</b> Lisa hat ihren ersten Job. Entscheide bei jeder Karte: Darf sie das allein oder nur mit ihren Eltern? Du bekommst sofort eine Rückmeldung. Lies dazu § 113 BGB.</p>
<details class="hilfe"><summary><span class="ms sm">menu_book</span>${GESETZ[113].p} nachlesen</summary><p class="small">${GESETZ[113].t}</p></details>
${blitz(JOB)}
${schreibfeld(WAND.job)}
${impuls(IMPULS.job)}
${erkHTML('job')}`},
init(root){bindErk(root)}});

/* 9 Mission Zwergspitz: sieben Wege zum Hund */
const WEGE=[
  {id:'ueberreden',icon:'record_voice_over',titel:'Eltern überzeugen',text:'Du hältst eine Präsentation: Wer geht Gassi, wer zahlt Futter und Tierarzt? Am Ende sagen deine Eltern Ja. Dann kaufst du den Hund beim Züchter.',erg:'ziel',e:'Mit der Einwilligung deiner Eltern ist der Kauf wirksam (§ 107 BGB). Der sicherste Weg!'},
  {id:'welpenblick',icon:'pets',titel:'Erst kaufen, dann Welpenblick',text:'Du kaufst den Hund heimlich und hoffst, dass deine Eltern beim Anblick des Welpen schmelzen.',erg:'glueck',e:'Ohne Einwilligung ist der Kauf schwebend unwirksam (§ 108 Abs. 1 BGB). Genehmigen deine Eltern, ist er wirksam. Verweigern sie, muss der Hund zurück. Reine Glückssache!'},
  {id:'taschengeld',icon:'savings',titel:'Angespartes Taschengeld',text:'Du hast 1.500 € Taschengeld gespart und bezahlst den Hund sofort bar.',erg:'sackgasse',e:'Deine Eltern haben ausdrücklich Nein gesagt, und ein Hund bringt Folgekosten: Futter, Tierarzt, Hundesteuer. So weit reicht die Erlaubnis, über dein Taschengeld frei zu verfügen, nicht (§ 110 BGB). Der Kauf ist schwebend unwirksam – und deine Eltern verweigern.'},
  {id:'raten',icon:'credit_card',titel:'Ratenkauf beim Züchter',text:'Der Züchter bietet an: zwölf Raten zu je 125 €.',erg:'sackgasse',e:'Raten sind nicht sofort bezahlt, also hilft § 110 BGB nicht. Ohne Zustimmung deiner Eltern ist der Kauf schwebend unwirksam, nach ihrem Nein endgültig unwirksam.'},
  {id:'oma',icon:'elderly_woman',titel:'Oma schenkt dir den Hund',text:'Deine Oma findet die Idee super und schenkt dir den Zwergspitz.',erg:'glueck',e:'Ein Geschenk bringt normalerweise lediglich einen rechtlichen Vorteil (§ 107 BGB). Bei einem Tier ist das umstritten, denn wer einen Hund hält, haftet für Schäden und muss Hundesteuer zahlen. Und ob der Hund bei euch wohnen darf, entscheiden sowieso deine Eltern.'},
  {id:'minijob',icon:'work',titel:'Minijob im Café',text:'Deine Eltern erlauben dir einen Minijob. Vom Lohn kaufst du den Hund.',erg:'sackgasse',e:'§ 113 BGB gilt nur für Geschäfte rund um den Job, nicht für Käufe vom Lohn. Die laufen über § 110 BGB – und gegen das ausdrückliche Nein deiner Eltern hilft der nicht.'},
  {id:'warten',icon:'cake',titel:'Warten bis 18',text:'Du wartest bis zu deinem 18. Geburtstag und kaufst den Hund dann selbst.',erg:'ziel',e:'Mit 18 bist du voll geschäftsfähig (§ 2 BGB) und kaufst allein. Ob der Hund in die Wohnung deiner Eltern darf, ist allerdings eine andere Frage …'}];
const ZIEL={ziel:['ok','check_circle','Führt zum Hund'],glueck:['amb','casino','Kommt drauf an'],sackgasse:['bad','block','Sackgasse']};
tool({id:'zwergspitz',ch:4,farben:['gelb','gruen','blau'],hinweise:HINWEISE.zwergspitz,title:'Mission Zwergspitz',sub:'Du willst unbedingt einen Zwergspitz, deine Eltern sagen Nein. Sieben Wege – welche führen zum Hund?',
html(){return `<p class="task"><b>Auftrag:</b> Prüft zu zweit alle Wege zu eurem Hund. Tippt einen Weg an, lest, was passiert, und schätzt zuerst: Führt er zum Hund, in die Sackgasse oder kommt es darauf an? Erst dann seht ihr die Auflösung.</p>
<div class="grid2">
  ${fotoHTML('zwergspitz')}
  <div class="stack"><p class="headline-s">Szenario: Du bist 15 und hast dich in einen Zwergspitz verliebt.</p>
  <p class="body-l">Nach dem Welpenfoto im Unterricht willst du sofort einen. Deine Eltern teilen deine Begeisterung nicht: Ein Hund sei viel zu teuer, sagen sie. Welche Wege hast du trotzdem?</p>
  <p class="small muted num" id="zs-stand"></p></div>
</div>
<div class="panel stack"><div class="akte-faelle" role="group" aria-label="Weg wählen" id="zs-wege">${WEGE.map((w,i)=>`<button class="akte-fall" type="button" data-weg="${i}" aria-pressed="false"><span class="ms">${w.icon}</span><span class="akte-titel">${w.titel}</span><span class="akte-status small" data-status></span></button>`).join('')}</div>
  <div id="zs-profi"></div></div>
<div id="zs-weg"></div>
${schreibfeld(WAND.zwergspitz)}
${impuls(IMPULS.zwergspitz)}
${erkHTML('zwergspitz')}`},
init(root){
  let st=store('gf-zs')||{tipp:{},weg:0};
  const sichern=()=>store('gf-zs',st);
  function stand(){
    const n=Object.keys(st.tipp).length,richtig=WEGE.filter(w=>st.tipp[w.id]===w.erg).length;
    $('#zs-stand',root).textContent=`${n} von ${WEGE.length} Wegen erkundet`;
    $$('[data-weg]',root).forEach(b=>{const i=+b.dataset.weg,w=WEGE[i],t=st.tipp[w.id];b.setAttribute('aria-pressed',String(i===st.weg));b.classList.toggle('geloest',!!t);
      $('[data-status]',b).innerHTML=t?`<span class="ms sm">${ZIEL[w.erg][1]}</span>${ZIEL[w.erg][2]}`:'noch offen'});
    $('#zs-profi',root).innerHTML=n===WEGE.length?`<div class="fb ok"><span class="ms sm">workspace_premium</span> <b>Mission erfüllt!</b> Du hast ${richtig} von ${WEGE.length} Wegen richtig eingeschätzt. Sicher zum Hund führen nur zwei: deine Eltern überzeugen oder warten, bis du 18 bist.</div>`:'';
  }
  function zeige(i,fokus){
    st.weg=i;sichern();stand();
    const w=WEGE[i],t=st.tipp[w.id],el=$('#zs-weg',root);
    el.innerHTML=`<article class="aufgabe"><p class="aufgabe-kopf"><span class="ms sm">${w.icon}</span>Weg ${i+1}: ${w.titel}</p>
      <div class="wc-material">${w.text}</div>
      ${t?'':`<p class="aufgabe-frage">Was schätzt du: Wohin führt dieser Weg?</p><div class="navi-antw" role="group" aria-label="Deine Einschätzung">${Object.entries(ZIEL).map(([k,[,ic,txt]])=>`<button class="btn small" type="button" data-tipp="${k}"><span class="ms">${ic}</span>${txt}</button>`).join('')}</div>`}
      <div id="zs-fb" role="status">${t?ergebnis(w,t):''}</div>
      ${t&&i+1<WEGE.length?'<div class="row"><button class="btn small primary" type="button" id="zs-weiter"><span class="ms">arrow_forward</span>Nächster Weg</button></div>':''}</article>`;
    $$('[data-tipp]',el).forEach(b=>b.addEventListener('click',()=>{st.tipp[w.id]=b.dataset.tipp;sichern();zeige(i,false);$('#zs-weiter',root)?.focus()}));
    $('#zs-weiter',el)?.addEventListener('click',()=>zeige(i+1,true));
    if(fokus){el.scrollIntoView({block:'start'});$('button',el)?.focus({preventScroll:true})}
  }
  function ergebnis(w,t){const [k,ic,txt]=ZIEL[w.erg],ok=t===w.erg;
    return `<div class="fb ${k}"><p><span class="ms sm">${ic}</span> <b>${txt}.</b> ${ok?'Gut eingeschätzt!':`Du hattest „${ZIEL[t][2]}“ getippt.`}</p><p>${w.e}</p></div>`}
  $$('[data-weg]',root).forEach(b=>b.addEventListener('click',()=>zeige(+b.dataset.weg,true)));
  zeige(Math.min(st.weg||0,WEGE.length-1),false);bindErk(root);
}});

/* 10 Hefteintrag, Kurztest und Bauchgefühl-Check */
tool({id:'sichern',ch:5,farben:['rot','gelb','gruen','blau'],hinweise:HINWEISE.sichern,title:'Hefteintrag und Kurztest',sub:'Das Wichtigste ins Heft, ein Test mit einem Versuch und der Vergleich mit deinem Bauchgefühl vom Anfang',
html(){return `<p class="task"><b>Auftrag:</b> Füllt den Hefteintrag aus und macht den Kurztest. Pro Frage habt ihr nur einen Versuch. Schaut dann, wie gut euer Bauchgefühl am Anfang war, und beantwortet die Leitfrage.</p>
${lueckentext({id:'sichern-heft',titel:'Hefteintrag: Geschäftsfähigkeit auf einen Blick',saetze:[
  'Rechtsfähig ist jeder Mensch ab der [Geburt] (§ 1 BGB). Geschäftsfähig wird man in Stufen.',
  'Kinder unter 7 Jahren sind [geschäftsunfähig]. Was sie erklären, ist [nichtig] (§ 105 BGB).',
  'Ohne Zustimmung der Eltern ist der Vertrag eines Minderjährigen [schwebend unwirksam]. Verweigern die Eltern die [Genehmigung], ist er endgültig unwirksam.',
  'Ohne Eltern wirksam sind Geschäfte mit lediglich rechtlichem [Vorteil], Käufe, die sofort mit [Taschengeld] bezahlt werden, und Geschäfte rund um einen erlaubten [Job|Arbeitsvertrag|Arbeitsverhältnis].',
  'Mit [18|achtzehn] Jahren ist man voll geschäftsfähig (§ 2 BGB).']})}
${kurztest({id:'sichern-test',titel:'Kurztest: vier Fragen',fragen:[
  {f:'Die Eltern stimmen einem Kauf zu, nachdem er passiert ist. Wie heißt das?',o:['Einwilligung','Genehmigung','Ermächtigung'],r:1,e:'Vorher: Einwilligung (§ 107 BGB). Nachher: Genehmigung (§ 108 BGB).'},
  {f:'Lena (13) bekommt ein Fahrrad geschenkt. Braucht sie die Zustimmung ihrer Eltern?',o:['Ja, weil sie beschränkt geschäftsfähig ist','Nein, weil sie lediglich einen rechtlichen Vorteil erlangt','Nein, weil sie schon 13 ist'],r:1,e:'Ein Geschenk bringt lediglich einen rechtlichen Vorteil (§ 107 BGB).'},
  {f:'Ein Vertrag ist schwebend unwirksam. Was heißt das?',o:['Er ist für immer ungültig.','Er gilt, bis die Eltern widersprechen.','Er wartet auf die Genehmigung der Eltern.'],r:2,e:'Genehmigen die Eltern, wird er wirksam. Verweigern sie, ist er endgültig unwirksam.'},
  {f:'Warum hilft § 110 BGB bei einem Ratenkauf nicht?',o:['Weil nicht sofort vollständig bezahlt wird','Weil Raten verboten sind','Weil § 110 nur für Lebensmittel gilt'],r:0,e:'§ 110 BGB verlangt, dass die Leistung mit eigenen Mitteln bewirkt ist, also sofort und vollständig bezahlt.'}]})}
${blitzAufloesung(BAUCH)}
${schreibfeld(WAND.sichern)}
${impuls(IMPULS.sichern)}
${erkHTML('sichern')}`},
init(root){bindErk(root)}});

/* 11 Wissenscheck (Aufgaben in wissenscheck.js) */
tool({id:'wissenscheck',ch:5,farben:['rot','gelb','gruen','blau'],hinweise:HINWEISE.wissenscheck,title:'Wissenscheck',sub:`${WISSENSCHECK.aufgaben.length} Aufgaben in drei Stufen – Grundlagen, Anwenden, Beurteilen – mit Erwartungshorizont und Auswertung`,
html(){return `<p class="task"><b>Auftrag:</b> Prüft, was ihr könnt. Fangt bei den Grundlagen an und arbeitet euch bis zum Beurteilen vor. Den Erwartungshorizont seht ihr erst, nachdem ihr geantwortet habt. Am Ende zeigt die Auswertung, was ihr noch wiederholen solltet.</p>
${wissenscheck(WISSENSCHECK)}
${schreibfeld(WAND.wissenscheck)}
${impuls(IMPULS.wissenscheck)}`},
init(){}});

/* ---------- Startseite und Wissen ---------- */
function startHTML(){
  return `<section class="banner"><img src="${FOTO.galerie.src}" alt="${esc(FOTO.galerie.alt)}"><span class="credit">${nachweis('galerie')}</span>
    <div class="banner-text"><p class="eyebrow">Klasse 10 · Bürgerliches Recht</p><h2 style="font-size:clamp(1.5rem,3.6vw,2.25rem);line-height:1.2">Ich bin 15 – welche Verträge darf ich eigentlich schon allein abschließen?</h2></div></section>
  <section class="gf-start">
    <div class="stack"><p class="body-l">Döner, Handyvertrag, V-Bucks, Klarna: Jeden Tag schließt du Verträge, oft ohne es zu merken. Aber gelten sie auch? In dieser Lernwerkstatt testest du zuerst dein Bauchgefühl, lernst dann die Regeln des BGB kennen und löst echte Fälle – allein, zu zweit oder live mit der ganzen Klasse als Gericht.</p>
      <div class="cta"><button class="fab" type="button" data-gf-tool="bauchgefuehl"><span class="ms">bolt</span>Bauchgefühl testen</button><button class="btn outlined" type="button" data-dest="mission"><span class="ms">pets</span>Mission Zwergspitz</button></div></div>
    <div class="panel stack"><h3 class="title-m">Was du danach kannst</h3><ul class="gf-ziele">
      <li><span class="ms">check_circle</span><span>Rechtsfähigkeit und die drei Stufen der Geschäftsfähigkeit unterscheiden</span></li>
      <li><span class="ms">check_circle</span><span>Einwilligung und Genehmigung, nichtig und schwebend unwirksam auseinanderhalten</span></li>
      <li><span class="ms">check_circle</span><span>Die drei Ausnahmen kennen: Vorteil, Taschengeld, Job (§§ 107, 110, 113 BGB)</span></li>
      <li><span class="ms">check_circle</span><span>Fälle mit dem Prüfschema lösen und Paragrafen richtig zitieren</span></li></ul></div>
  </section>
  ${chapterHTML(1)}
  <section class="section-h"><h2>Dein Lernpfad</h2><p>Die Bereiche bauen aufeinander auf: erst die Regeln, dann die Fälle, dann die Mission. Jede Werkstatt endet mit einer Erkenntnis, die als Merksatz in „Mein Wissen“ landet – gesammelt ergibt das deinen Hefteintrag. Am Ende prüfst du alles im Wissenscheck.</p></section>
  <div class="dest-cards">${DEST.slice(1).map(d=>`<button class="dest" type="button" data-dest="${d.id}"><span class="ic"><span class="ms">${d.icon}</span></span><span><span class="title-m">${d.label}</span><span class="small muted" style="display:block">${d.desc}</span></span></button>`).join('')}</div>`;
}
function sourcesHTML(){return `<section class="panel sources"><h3 class="title-m" style="color:var(--md-on-surface)">Quellen (Stand Oktober 2026)</h3><ul>
  <li>Bürgerliches Gesetzbuch: §§ 1, 2, 104–110, 113, 105a, 566, 828, 833, 1643, 1814, 1854, 2229 BGB (gesetze-im-internet.de)</li>
  <li>Strafgesetzbuch: § 19 StGB · Fahrerlaubnis-Verordnung: begleitetes Fahren ab 17 · Personalausweisgesetz: Ausweispflicht ab 16</li>
  <li>Thüringer Kommunalwahlgesetz und Europawahlgesetz: Wahlrecht ab 16; Landtags- und Bundestagswahl ab 18</li>
  <li>Bundesgerichtshof: Beschlüsse V ZB 44/04 und V ZB 206/10 zur Schenkung von Wohnungen an Minderjährige</li>
  <li>Deutschlandticket: 63 € im Monat ab Januar 2026 (Beschluss der Verkehrsministerkonferenz vom 18.09.2025) · Klarna: Bezahlen erst ab 18 Jahren</li>
  <li>Fälle nach den Unterrichtsmaterialien der Lehrkraft, nach Thüringen verlegt. Alle Personen und Szenarien sind erfunden.</li>
  <li>Fotos (Wikimedia Commons): ${['galerie','simson','zwergspitz'].map(k=>`<a href="${FOTO[k].link}" rel="noopener" target="_blank">${esc(FOTO[k].credit.split(', ')[0].replace(' / Wikimedia Commons',''))}</a> (<a href="${FOTO[k].lizenz}" rel="noopener" target="_blank">${esc(FOTO[k].credit.split(', ')[1])}</a>)`).join(', ')}</li></ul>
  <p>Merksätze und Ergebnisse werden nur in diesem Browser gespeichert.</p>
  <div class="row"><button class="btn outlined small" id="reset" type="button"><span class="ms">restart_alt</span>Merksätze zurücksetzen</button><span id="reset-confirm" class="row" hidden><button class="btn primary small" id="reset-yes" type="button">Ja, alles zurücksetzen</button><button class="btn text small" id="reset-no" type="button">Abbrechen</button></span></div></section>`}
function wissenHTML(){const alle=['rot','gelb','gruen','blau'].map(dot).join('');
  return chapterHTML(5,`<button class="card" type="button" data-open="glossar"><span class="dots">${alle}</span><h4>Begriffe nachschlagen</h4><p>${GLOSS.length} Fachbegriffe mit Suche</p><span class="go">Öffnen<span class="ms sm">arrow_forward</span></span></button><button class="card" type="button" data-open="wissen"><span class="dots">${alle}</span><h4>Mein Rechts-Wissen</h4><p>Alle Merksätze als Hefteintrag sammeln und kopieren</p><span class="go">Öffnen<span class="ms sm">arrow_forward</span></span></button>`)+sourcesHTML()}

W.start();
