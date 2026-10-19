// Lernstrecke Deliktsfähigkeit (Klasse 10): fünf Lektionen im Rhythmus Fall – Entdecken – Sichern – Anwenden,
// danach Mission Simson und der Wissenscheck. Leitfrage: „Wer zahlt, wenn's kracht?“
// Gerüst, Lektionsnavigation und Aufgaben-Bausteine kommen aus /shared/, hier stehen nur die Inhalte.
import { $, $$, esc } from '../shared/js/ui.js';
import { createLernstrecke } from '../shared/js/lernstrecke.js';
import { schreibfeld, zuordnen, lueckentext, wissenscheck, impuls, hilfen, blitz, blitzAufloesung, pruefschema, fallakte, abstimmung } from '../shared/js/aufgaben.js';
import { labyrinth } from '../shared/js/labyrinth.js';
import { GESETZ, NAVI, FAELLE, GERICHT } from './daten.js';
import { FOTO, nachweis, fotoHTML, HAFTPFLICHT, QUELLEN } from './fotos.js';
import { HINWEISE, WAND, IMPULS } from './wand.js';
import { WISSENSCHECK } from './wissenscheck.js';

/* ---------- Merksätze (eine Erkenntnis pro Lektion) ---------- */
const MS={
  haftung:['Wer einem anderen vorsätzlich oder fahrlässig einen Schaden zufügt, muss ihn ersetzen – er haftet (§ 823 Abs. 1 BGB). Vorsatz heißt mit Absicht, fahrlässig handelt, wer die nötige Sorgfalt außer Acht lässt (§ 276 Abs. 2 BGB). Haften muss aber nur, wer deliktsfähig ist.'],
  stufen:['Deliktsfähigkeit gibt es in drei Stufen: Unter 7 Jahren ist man deliktsunfähig (§ 828 Abs. 1 BGB). Von 7 bis 17 ist man beschränkt deliktsfähig und haftet, wenn man die nötige Einsicht hat (§ 828 Abs. 3 BGB). Ab 18 ist man voll deliktsfähig.'],
  strassenverkehr:['Kinder von 7 bis 9 Jahren haften nicht für Schäden bei einem Unfall mit einem Auto, einer Straßenbahn oder einem Zug (§ 828 Abs. 2 BGB), weil sie Tempo und Abstand noch nicht sicher einschätzen können. Das gilt nicht bei Absicht und meist nicht bei parkenden Autos.'],
  einsicht:['Bei Minderjährigen ab 7 kommt es auf die Einsicht an: Konnten sie verstehen, dass sie für ihr Handeln geradestehen müssen? Zusätzlich muss Vorsatz oder Fahrlässigkeit vorliegen, gemessen an dem, was man in ihrem Alter erwarten kann. Wer bewusstlos ist, haftet nicht – wer sich selbst betrinkt, schon (§ 827 BGB).'],
  eltern:['Eltern haften nur, wenn sie ihre Aufsichtspflicht verletzt haben (§ 832 BGB). Sonst haftet der Jugendliche selbst – oder der Geschädigte bleibt auf dem Schaden sitzen. Gegen hohe Schäden schützt eine Haftpflichtversicherung, für Mopeds und E-Scooter ist sie Pflicht.'],
  simson:['Nach einem Unfall: anhalten, Unfallstelle sichern, Daten austauschen und den Schaden der Versicherung melden. Abhauen ist eine Straftat. Die Privathaftpflicht zahlt keine Schäden beim Fahren mit Moped oder Auto, dafür gibt es die Pflichtversicherung mit Versicherungskennzeichen.']
};

/* ---------- Glossar ---------- */
const GLOSS=[
  ['Aufsichtspflicht','Pflicht der Eltern (oder anderer Aufsichtspersonen), Minderjährige so zu beaufsichtigen, wie es ihr Alter und die Situation verlangen. Wer sie verletzt, haftet für Schäden, die das Kind anrichtet (§ 832 BGB).'],
  ['Beschränkt deliktsfähig','Minderjährige von 7 bis 17 Jahren. Sie haften, wenn sie die nötige Einsicht haben (§ 828 Abs. 3 BGB). Bis 9 gilt im Straßenverkehr eine Sonderregel.'],
  ['Deliktsfähigkeit','Fähigkeit, für Schäden, die man anderen zufügt, verantwortlich gemacht zu werden.'],
  ['Deliktsunfähig','Kinder unter 7 Jahren (§ 828 Abs. 1 BGB) und Menschen, die bewusstlos sind oder wegen einer krankhaften Störung der Geistestätigkeit nicht frei entscheiden können (§ 827 S. 1 BGB).'],
  ['Delikt','Unerlaubte Handlung: Jemand verletzt widerrechtlich die Rechte eines anderen, zum Beispiel sein Eigentum oder seine Gesundheit (§§ 823 ff. BGB).'],
  ['Einsicht','Die Fähigkeit zu verstehen, dass ein Verhalten gefährlich ist und man für die Folgen geradestehen muss (§ 828 Abs. 3 BGB).'],
  ['Fahrlässigkeit','Wer die im Verkehr erforderliche Sorgfalt außer Acht lässt, handelt fahrlässig (§ 276 Abs. 2 BGB). Bei Kindern zählt, was man in ihrem Alter erwarten kann.'],
  ['Haftpflichtversicherung','Versicherung, die Schäden bezahlt, die man anderen zufügt. Die private Haftpflicht ist freiwillig, für Autos, Mopeds und E-Scooter ist eine Kfz-Haftpflicht Pflicht.'],
  ['Haftung','Pflicht, einen Schaden zu ersetzen, den man einem anderen zugefügt hat.'],
  ['Schadensersatz','Ausgleich für einen Schaden, zum Beispiel die Reparatur bezahlen oder den Wert ersetzen.'],
  ['Sonderregel im Straßenverkehr','§ 828 Abs. 2 BGB: Kinder von 7 bis 9 Jahren haften nicht bei einem Unfall mit einem Kraftfahrzeug, einer Schienenbahn oder einer Schwebebahn – außer bei Absicht.'],
  ['Unfallflucht','Wer nach einem Unfall wegfährt, ohne seine Daten zu hinterlassen oder zu warten, begeht eine Straftat (§ 142 StGB, unerlaubtes Entfernen vom Unfallort).'],
  ['Versicherungskennzeichen','Kleines Kennzeichen für Mopeds, E-Scooter und andere Kleinfahrzeuge. Es zeigt, dass die Pflicht-Haftpflichtversicherung bezahlt ist. Es gilt jeweils vom 1. März bis Ende Februar.'],
  ['Voll deliktsfähig','Volljährige ab 18, für die keine Ausnahme nach § 827 BGB greift. Sie haften für jeden Schaden, den sie vorsätzlich oder fahrlässig verursachen.'],
  ['Vorsatz','Handeln mit Wissen und Wollen, also mit Absicht.']
];

/* ---------- Lernstrecke ---------- */
const dot=k=>`<span class="df-dot ${k}" aria-hidden="true"></span>`;
const L=createLernstrecke({
  thema:'deliktsfaehigkeit',
  speicher:'df',
  titel:'Lernstrecke Deliktsfähigkeit',kurz:'Deliktsfähigkeit',
  logo:'<svg aria-hidden="true" width="40" height="40" viewBox="0 0 42 42"><path d="M21 5 7 10v9c0 9 6 15.5 14 18 8-2.5 14-9 14-18v-9Z" fill="none" stroke="var(--md-primary)" stroke-width="3" stroke-linejoin="round"/><rect x="13" y="16" width="5" height="12" rx="1.5" fill="var(--df-rot)"/><rect x="18.5" y="16" width="5" height="12" rx="1.5" fill="var(--df-gelb)"/><rect x="24" y="16" width="5" height="12" rx="1.5" fill="var(--df-gruen)"/></svg>',
  eyebrow:'Leitfrage · Klasse 10 · Bürgerliches Recht',
  leitfrage:'Wer zahlt, wenn\'s kracht?',
  banner:FOTO.banner?{src:FOTO.banner.src,alt:FOTO.banner.alt,nachweis:nachweis('banner')}:null,
  intro:'Ein Ball fliegt gegen den Zaun, eine Tasse zerbricht, die Simson rutscht weg – und dann steht jemand vor dir und will Geld. In dieser Lernstrecke findest du heraus, wann Kinder und Jugendliche für Schäden geradestehen müssen, wann die Eltern einspringen und warum am Ende oft eine Versicherung zahlt. Fünf Lektionen, jede mit einem Fall aus dem Alltag.',
  ziele:['Haftung nach § 823 Abs. 1 BGB erklären: Schaden, Vorsatz oder Fahrlässigkeit, Deliktsfähigkeit',
    'Die drei Stufen der Deliktsfähigkeit und die Sonderregel im Straßenverkehr unterscheiden (§§ 827, 828 BGB)',
    'Fälle mit dem Rechts-Navi prüfen und ein Gutachten schreiben',
    'Beurteilen, wann Eltern haften (§ 832 BGB) und warum eine Haftpflichtversicherung wichtig ist'],
  bereiche:[
    {id:'mission',icon:'two_wheeler',label:'Mission',title:'Mission Simson',tool:'simson',desc:'Nach dem Crash: Welche Wege führen dazu, dass der Schaden sauber geregelt ist?'},
    {id:'wissen',icon:'school',label:'Wissen',title:'Sichern und wiederholen',ch:[2],render:wissenHTML,desc:'Wissenscheck, Fachbegriffe, deine Merksätze und die Quellen'}],
  abschluss:[
    {tool:'simson',titel:'Mission Simson',text:'Lauf durchs Labyrinth: Welche Wege nach einem Unfall führen ans Ziel?',icon:'two_wheeler'},
    {tool:'wissenscheck',titel:'Wissenscheck',text:`${WISSENSCHECK.aufgaben.length} Aufgaben in drei Stufen mit Auswertung`,icon:'fact_check'}],
  kapitel:{2:['Sichern und wiederholen','Allein']},
  merksaetze:MS,
  wissenTitel:'Mein Delikt-Wissen',
  glossar:GLOSS,
  punkte:x=>(x.farben||[]).map(dot).join(''),
  beimZeigen(id,v){
    if($('#reset',v)){
      $('#reset',v).addEventListener('click',()=>{$('#reset-confirm',v).hidden=false});
      $('#reset-no',v).addEventListener('click',()=>{$('#reset-confirm',v).hidden=true});
      $('#reset-yes',v).addEventListener('click',()=>L.resetWissen());
    }
  }
});

const gesetz=(...n)=>`<details class="hilfe"><summary><span class="ms sm" aria-hidden="true">menu_book</span>${n.map(k=>GESETZ[k].p).join(', ')} nachlesen</summary><dl class="glossary">${n.map(k=>`<dt>${GESETZ[k].p} – ${GESETZ[k].titel}</dt><dd>${GESETZ[k].t}</dd>`).join('')}</dl></details>`;
// Ein Fall mit Foto daneben: Szenario-Hinweis, Text, Frage
const fallHTML=(foto,html)=>`<div class="df-fall">${fotoHTML(foto)}<div class="stack">${html}</div></div>`;

/* Blitzrunde „Wer zahlt?“: Einstieg in Lektion 1, Auflösung in Lektion 5 */
const BLITZ={id:'wer-zahlt',werkstatt:'haftung',verdeckt:true,
  titel:'Wer zahlt? Entscheide aus dem Bauch: Muss die Person den Schaden bezahlen?',
  optionen:[{id:'frei',t:'Muss nicht zahlen',icon:'money_off'},{id:'zahlt',t:'Muss zahlen',icon:'payments'}],
  karten:[
    {t:'Ben (5) schießt beim Fußball eine Zaunlatte des Nachbarn locker.',r:'frei',e:'Unter 7 ist man deliktsunfähig (§ 828 Abs. 1 BGB).'},
    {t:'Michael (16) schießt weiter gegen denselben Zaun, obwohl er gesehen hat, dass er schon locker ist. Die Latte bricht.',r:'zahlt',e:'Mit 16 hat Michael die nötige Einsicht und handelt mindestens fahrlässig (§§ 823 Abs. 1, 828 Abs. 3 BGB).'},
    {t:'Lisa (9) nimmt mit dem Fahrrad einem Auto die Vorfahrt. Das Auto weicht aus und rammt ein parkendes Auto.',r:'frei',e:'Sonderregel im Straßenverkehr: Kinder von 7 bis 9 haften bei einem Unfall mit einem fahrenden Auto nicht (§ 828 Abs. 2 BGB).'},
    {t:'Paul (9) fährt mit dem Fahrrad unaufmerksam gegen ein ordnungsgemäß geparktes Auto.',r:'zahlt',e:'Überraschend: Bei parkenden Autos greift die Sonderregel meist nicht (BGH, 2004). Dann kommt es auf die Einsicht an – und die hat ein Neunjähriger in der Regel.'},
    {t:'Dein Bruder (8) schießt auf dem Bolzplatz versehentlich eine Scheibe ein. Eure Mutter hat ordentlich aufgepasst. Muss sie zahlen?',r:'frei',e:'Eltern haften nur, wenn sie ihre Aufsichtspflicht verletzt haben (§ 832 BGB). Ob dein Bruder selbst haftet, hängt davon ab, ob er unvorsichtig war.'},
    {t:'Tom (17) betrinkt sich auf einer Party und stößt die Musikbox seines Kumpels vom Tisch.',r:'zahlt',e:'Wer sich selbst betrinkt, haftet trotzdem (§ 827 S. 2 BGB).'},
    {t:'Lena (19) wird im Supermarkt ohne Vorwarnung ohnmächtig und reißt beim Fallen ein Regal mit Weinflaschen um.',r:'frei',e:'Wer bewusstlos ist, ist für den Schaden nicht verantwortlich (§ 827 S. 1 BGB).'},
    {t:'Mia (15) fährt mit dem E-Scooter auf dem Gehweg, schaut aufs Handy und rammt einen Fußgänger.',r:'zahlt',e:'Mit 15 hat Mia die nötige Einsicht und handelt fahrlässig. Zahlen wird ihre E-Scooter-Versicherung – haften muss sie trotzdem.'}]};

/* ---------- Lektion 1: Wer zahlt, wenn's kracht? ---------- */
L.lektion({id:'haftung',titel:'Wer zahlt, wenn\'s kracht?',icon:'car_crash',dauer:'25 Minuten',farben:['rot','gelb','gruen'],hinweise:HINWEISE.haftung,
  frage:'Wann muss man für einen Schaden bezahlen?',
  tafel:'<b>Haftung (§ 823 Abs. 1 BGB)</b><ul><li>Schaden bei einem anderen</li><li>Vorsatz (mit Absicht) oder Fahrlässigkeit (unvorsichtig)</li><li>Der Täter ist deliktsfähig</li></ul><p>→ Er muss den Schaden ersetzen.</p>',
  stationen:[
    {sozial:'klasse',titel:'Krach vor der Schule',html:()=>`${fallHTML('simson',`<p class="szenario"><span class="ms sm" aria-hidden="true">theater_comedy</span>Szenario</p>
      <p class="body-l">Du fährst mit deiner neuen Simson zur Schule in Apolda. Weil du wie üblich spät dran bist, nimmst du die Verkehrsregeln an diesem Morgen nicht ganz so genau. Herr Labuhn muss wegen dir ausweichen und fährt gegen eine Laterne. An seinem Auto entsteht ein Schaden von 1.500 €.</p>
      <p class="title-m">Herr Labuhn steigt aus und ruft: „Wer bezahlt mir das jetzt?“</p>`)}
      <p class="task"><b>Auftrag:</b> Was meinst du – wer muss für den Schaden zahlen? Schreib deine Vermutung an die Wand. Am Ende der Lernstrecke schaust du, ob du richtig lagst.</p>
      ${schreibfeld(WAND.haftung)}
      ${impuls(IMPULS.haftung)}`},
    {sozial:'allein',titel:'Dein Bauchgefühl',html:()=>`<p class="task"><b>Auftrag:</b> Entscheide bei jeder Karte blitzschnell: Muss die Person zahlen oder nicht? Nicht lange nachdenken – die Auflösung kommt erst in Lektion 5. Ordne danach zu: Mit Absicht, unvorsichtig oder einfach Pech?</p>
      ${blitz(BLITZ)}
      ${zuordnen({id:'verschulden-zuordnen',frage:'Vorsatz, Fahrlässigkeit oder Pech? Ordne jede Karte zu.',
        faecher:[
          {id:'vorsatz',t:'Vorsatz<span class="zu-sub">mit Absicht</span>',kurz:'Vorsatz',info:'<p>Vorsätzlich handelt, wer weiß, was er tut, und es so will – also mit Absicht.</p>'},
          {id:'fahrlaessig',t:'Fahrlässigkeit<span class="zu-sub">unvorsichtig</span>',kurz:'Fahrlässigkeit',info:'<p>Fahrlässig handelt, wer die nötige Sorgfalt außer Acht lässt (§ 276 Abs. 2 BGB). Mit etwas Vorsicht wäre der Schaden nicht passiert.</p>'},
          {id:'pech',t:'Kein Verschulden<span class="zu-sub">einfach Pech</span>',kurz:'Kein Verschulden',info:'<p>Auch mit aller Vorsicht wäre es passiert. Dann muss niemand haften, der Geschädigte trägt den Schaden selbst.</p>'}],
        karten:[
          {t:'Kai (17) ritzt aus Wut seinen Namen in den Lack vom Auto seines Nachbarn.',f:'vorsatz',e:'Kai will den Kratzer – das ist Vorsatz.'},
          {t:'Leon (16) schießt den Ball absichtlich gegen das Fenster des Hausmeisters.',f:'vorsatz',e:'Absichtlich heißt: vorsätzlich.'},
          {t:'Sara (16) schaut beim Radfahren in Erfurt aufs Handy und fährt einen Fußgänger an.',f:'fahrlaessig',e:'Wer beim Fahren aufs Handy schaut, lässt die nötige Sorgfalt außer Acht.'},
          {t:'Ali (18) stellt in seiner WG in Jena eine heiße Pfanne auf den Holztisch. Es bleibt ein Brandfleck.',f:'fahrlaessig',e:'Mit einem Untersetzer wäre nichts passiert: fahrlässig.'},
          {t:'Nele (15) geht vorsichtig über den Gehweg. Eine Sturmböe reißt ihr den Schirm aus der Hand, er zerkratzt ein Auto.',f:'pech',e:'Gegen eine plötzliche Sturmböe hilft auch alle Vorsicht nichts. Kein Verschulden.'},
          {t:'Hanna (17) wird an der Ampel von hinten geschubst und stößt gegen ein E-Bike, das umfällt.',f:'pech',e:'Hanna hat nichts falsch gemacht. Haften müsste, wer geschubst hat.'}]})}`},
    {sozial:'allein',titel:'Haftung auf den Punkt',html:()=>`<p class="task"><b>Auftrag:</b> Füll den Hefteintrag aus. Die Gesetzestexte kannst du unten aufklappen.</p>
      ${lueckentext({id:'haftung-heft',titel:'Hefteintrag: Haftung',saetze:[
        'Wer einem anderen [vorsätzlich|absichtlich] oder [fahrlässig] einen Schaden zufügt, muss ihn ersetzen (§ 823 Abs. 1 BGB). Man sagt: Er [haftet].',
        'Vorsatz heißt: mit [Absicht|Wissen und Wollen]. Fahrlässig handelt, wer die nötige [Sorgfalt|Vorsicht] außer Acht lässt (§ 276 Abs. 2 BGB).',
        'Haften muss aber nur, wer [deliktsfähig] ist, also für seine Taten verantwortlich gemacht werden kann.']})}
      ${gesetz(823,276)}`},
    {sozial:'zweit',titel:'Frisbee im Ilmpark',html:()=>`${fallHTML('frisbee',`<p class="body-l">Finn (17) wirft im Ilmpark in Weimar eine Frisbee quer über die Liegewiese, obwohl dort viele Leute liegen. Die Scheibe trifft das Handy von Ida, die auf ihrer Decke liegt. Das Display ist kaputt, die Reparatur kostet 180 €.</p>`)}
      <p class="task"><b>Auftrag:</b> Prüft zu zweit die Voraussetzungen aus dem Hefteintrag und schreibt eure Antwort an die Wand.</p>
      ${schreibfeld(WAND.frisbee)}
      ${impuls(IMPULS.frisbee)}`}]});

/* ---------- Lektion 2: Zu klein zum Zahlen? ---------- */
const STUFEN=[
  {bis:6,farbe:'rot',titel:'Deliktsunfähig',p:'§ 828 Abs. 1 BGB',kurz:'Du haftest für keinen Schaden, den du anrichtest – egal ob mit Absicht oder aus Versehen.',bsp:'Ben (5) schießt eine Zaunlatte locker und muss nicht zahlen.'},
  {bis:9,farbe:'blau',titel:'Beschränkt deliktsfähig – mit Schutz im Straßenverkehr',p:'§ 828 Abs. 2 und 3 BGB',kurz:'Bei einem Unfall mit einem fahrenden Auto, einer Straßenbahn oder einem Zug haftest du nicht, außer mit Absicht. Sonst kommt es auf deine Einsicht an.',bsp:'Lisa (9) nimmt einem Auto die Vorfahrt und muss nicht zahlen.'},
  {bis:17,farbe:'gelb',titel:'Beschränkt deliktsfähig',p:'§ 828 Abs. 3 BGB',kurz:'Du haftest, wenn du verstehen konntest, dass du für dein Handeln geradestehen musst. Diese Einsicht haben fast alle Jugendlichen.',bsp:'Michael (16) schießt weiter gegen den kaputten Zaun und muss zahlen.'},
  {bis:99,farbe:'gruen',titel:'Voll deliktsfähig',p:'§ 823 Abs. 1 BGB, keine Ausnahme nach § 828 BGB',kurz:'Du haftest für jeden Schaden, den du mit Absicht oder unvorsichtig anrichtest.',bsp:'Lisa (19) fährt bei Nebel zu schnell und muss zahlen.'}];
const FIGUR=[[2,'child_care'],[6,'toys'],[9,'pedal_bike'],[13,'backpack'],[17,'two_wheeler'],[99,'directions_car']];
const RAETSEL=[
  {f:'Ab welchem Alter kann man überhaupt für einen Schaden haften?',r:7,e:'Mit dem 7. Geburtstag endet die Deliktsunfähigkeit (§ 828 Abs. 1 BGB).'},
  {f:'Ab welchem Alter endet der Schutz bei Unfällen mit Autos und Bahnen?',r:10,e:'Die Sonderregel gilt von 7 bis 9 Jahren, mit dem 10. Geburtstag endet sie (§ 828 Abs. 2 BGB).'},
  {f:'Ab welchem Alter darfst du einen E-Scooter fahren?',r:14,e:'E-Scooter darf man ab 14 fahren, einen Führerschein braucht man dafür nicht (§ 3 eKFV). Wer fahren darf, haftet in der Regel auch für seine Unfälle.'},
  {f:'Ab welchem Alter darfst du den Mopedführerschein für eine Simson machen?',r:15,e:'Seit 2021 geht der Führerschein der Klasse AM in ganz Deutschland ab 15. Damit hast du auch die Einsicht, für Unfälle geradezustehen.'},
  {f:'Ab welchem Alter haftest du ohne Prüfung der Einsicht – also voll?',r:18,e:'Ab 18 greift § 828 BGB nicht mehr. Dann bist du voll deliktsfähig.'}];

L.lektion({id:'stufen',titel:'Zu klein zum Zahlen?',icon:'child_care',dauer:'20 Minuten',farben:['rot','blau','gelb','gruen'],hinweise:HINWEISE.stufen,
  frage:'Ab welchem Alter muss man für Schäden geradestehen?',
  tafel:`<b>Stufen der Deliktsfähigkeit</b><ul><li>${dot('rot')} unter 7: deliktsunfähig (§ 828 Abs. 1)</li><li>${dot('gelb')} 7 bis 17: beschränkt deliktsfähig, es zählt die Einsicht (§ 828 Abs. 3)</li><li>${dot('gruen')} ab 18: voll deliktsfähig</li><li>Deliktsunfähig auch: bewusstlos oder krankhafte Störung (§ 827)</li></ul>`,
  stationen:[
    {sozial:'klasse',titel:'Ben, der Fußballer',html:()=>`<p class="task"><b>Auftrag:</b> Stimmt ab: Müssen Ben und sein Freund zahlen? Im Lernraum startet eure Lehrkraft die Abstimmung, allein fällst du dein Urteil selbst.</p>
      ${abstimmung({id:'ben-urteil',titel:'Ben und der Zaun',
        fall:`${fotoHTML('zaun')}<p>Der fünfjährige Ben spielt im Garten seines Kindergartenfreunds in Apolda Fußball. Der Zaun des Nachbarn eignet sich hervorragend, um „über Bande“ zu spielen – bis eine Zaunlatte locker ist. Der Nachbar kommt wutentbrannt aus dem Haus: „Die Reparatur bezahlt ihr mir!“</p>`,
        frage:'Müssen Ben und sein Freund den Zaun bezahlen?',optionen:['Ja, sie haben ihn kaputtgemacht','Nein, dafür sind sie noch zu jung','Nein, aber ihre Eltern müssen auf jeden Fall zahlen'],r:1,
        e:'Unter 7 Jahren ist man deliktsunfähig (§ 828 Abs. 1 BGB). Die Eltern müssten nur zahlen, wenn sie ihre Aufsichtspflicht verletzt hätten – mehr dazu in Lektion 5.'})}`},
    {sozial:'allein',titel:'Der Altersschieber',html:()=>`<p class="task"><b>Auftrag:</b> Schieb das Alter von 0 bis 21 Jahre. Beobachte, wann sich die Farbe ändert. Löse dann die Altersrätsel: Stell das richtige Alter am Schieber ein.</p>
      <div class="grid2">
        <div class="panel df-alter" id="da-box">
          <div class="df-alter-kopf"><span class="df-figur" id="da-figur" aria-hidden="true"><span class="ms" aria-hidden="true">child_care</span></span>
            <div><p class="display-s num" id="da-zahl" aria-live="polite">0 Jahre</p><p class="title-m" id="da-stufe"></p><p class="small muted" id="da-p"></p></div></div>
          <label class="small" for="da-r">Alter</label>
          <input type="range" id="da-r" min="0" max="21" step="1" value="0">
          <div class="df-band" aria-hidden="true"><span></span><span></span><span></span><span></span></div>
          <div class="df-skala" aria-hidden="true"><span style="left:0">0</span><span style="left:33.3%">7</span><span style="left:47.6%">10</span><span style="left:85.7%">18</span><span style="left:100%">21</span></div>
          <ul class="df-legende"><li>${dot('rot')}deliktsunfähig</li><li>${dot('blau')}Schutz im Straßenverkehr</li><li>${dot('gelb')}beschränkt deliktsfähig</li><li>${dot('gruen')}voll deliktsfähig</li></ul>
          <p class="df-kurz" id="da-kurz"></p>
          <p class="small" id="da-bsp"></p>
        </div>
        <section class="aufgabe" id="da-raetsel"><p class="aufgabe-kopf"><span class="ms sm" aria-hidden="true">quiz</span>Altersrätsel <span class="small muted num" id="da-rn"></span></p>
          <p class="aufgabe-frage" id="da-rf"></p>
          <div class="row"><button class="btn primary small" type="button" id="da-pruefen"><span class="ms" aria-hidden="true">task_alt</span>Das Alter am Schieber prüfen</button><button class="btn small" type="button" id="da-weiter" hidden><span class="ms" aria-hidden="true">arrow_forward</span>Nächstes Rätsel</button></div>
          <div id="da-fb" class="stack" role="status"></div></section>
      </div>`,
      init(root){
        const r=$('#da-r',root),fig=$('#da-figur',root);if(!r)return;let altIcon='',ri=0;
        function zeige(){
          const a=+r.value,st=STUFEN.find(s=>a<=s.bis),icon=FIGUR.find(([b])=>a<=b)[1],j=`${a} ${a===1?'Jahr':'Jahre'}`;
          $('#da-zahl',root).textContent=j;r.setAttribute('aria-valuetext',`${j}: ${st.titel}`);
          $('#da-stufe',root).textContent=st.titel;$('#da-p',root).textContent=st.p;$('#da-kurz',root).textContent=st.kurz;$('#da-bsp',root).innerHTML=`<b>Beispiel:</b> ${st.bsp}`;
          const box=$('#da-box',root);['rot','blau','gelb','gruen'].forEach(f=>box.classList.toggle('df-stufe-'+f,f===st.farbe));
          if(icon!==altIcon){fig.innerHTML=`<span class="ms" aria-hidden="true">${icon}</span>`;fig.classList.remove('wechsel');void fig.offsetWidth;fig.classList.add('wechsel');altIcon=icon}
        }
        function raetsel(){const q=RAETSEL[ri];$('#da-rn',root).textContent=`${ri+1} von ${RAETSEL.length}`;$('#da-rf',root).textContent=q.f;$('#da-fb',root).innerHTML='';$('#da-weiter',root).hidden=true;$('#da-pruefen',root).hidden=false}
        $('#da-pruefen',root).addEventListener('click',()=>{
          const q=RAETSEL[ri],a=+r.value,ok=a===q.r;
          $('#da-fb',root).innerHTML=`<div class="fb ${ok?'ok':'bad'}"><b>${ok?'Richtig!':a<q.r?'Zu jung.':'Zu alt.'}</b> ${ok?q.e:'Schieb weiter und prüf noch einmal.'}</div>`;
          if(ok){$('#da-pruefen',root).hidden=true;
            if(ri+1<RAETSEL.length){$('#da-weiter',root).hidden=false;$('#da-weiter',root).focus()}
            else $('#da-fb',root).insertAdjacentHTML('beforeend',`<div class="fb ok"><span class="ms sm" aria-hidden="true">workspace_premium</span> <b>Alle ${RAETSEL.length} Rätsel gelöst!</b></div>`)}
        });
        $('#da-weiter',root).addEventListener('click',()=>{ri++;raetsel();r.focus()});
        r.addEventListener('input',zeige);zeige();raetsel();
      }},
    {sozial:'allein',titel:'Die drei Stufen',html:()=>`<p class="task"><b>Auftrag:</b> Ordne jede Person der passenden Stufe zu. Das Fragezeichen an jeder Stufe erklärt sie dir. Füll dann den Hefteintrag aus.</p>
      ${zuordnen({id:'stufen-zuordnen',frage:'Auf welcher Stufe der Deliktsfähigkeit steht die Person?',
        faecher:[
          {id:'unfaehig',t:'Deliktsunfähig<span class="zu-sub">unter 7 Jahren oder bewusstlos</span>',kurz:'Deliktsunfähig',info:'<p>Kinder unter 7 Jahren (§ 828 Abs. 1 BGB). Außerdem, wer bewusstlos ist oder wegen einer krankhaften Störung der Geistestätigkeit nicht frei entscheiden kann (§ 827 S. 1 BGB). Sie haften nie.</p>'},
          {id:'beschraenkt',t:'Beschränkt deliktsfähig<span class="zu-sub">7 bis 17 Jahre</span>',kurz:'Beschränkt deliktsfähig',info:'<p>Minderjährige von 7 bis 17 Jahren haften, wenn sie die nötige Einsicht haben (§ 828 Abs. 3 BGB). Kinder von 7 bis 9 sind außerdem bei Unfällen mit Autos und Bahnen geschützt (§ 828 Abs. 2 BGB).</p>'},
          {id:'voll',t:'Voll deliktsfähig<span class="zu-sub">ab 18 Jahren</span>',kurz:'Voll deliktsfähig',info:'<p>Ab 18 greift § 828 BGB nicht mehr. Wer vorsätzlich oder fahrlässig einen Schaden verursacht, haftet (§ 823 Abs. 1 BGB).</p>'}],
        karten:[
          {t:'Ben (5) schießt beim Fußball eine Zaunlatte locker.',f:'unfaehig',e:'Unter 7: deliktsunfähig (§ 828 Abs. 1 BGB).'},
          {t:'Lena (19) wird im Supermarkt ohnmächtig und reißt ein Regal um.',f:'unfaehig',e:'Wer bewusstlos ist, ist in diesem Moment deliktsunfähig (§ 827 S. 1 BGB) – auch mit 19.'},
          {t:'Marie (8) lässt beim Abräumen eine Tasse fallen.',f:'beschraenkt',e:'Mit 8 ist Marie beschränkt deliktsfähig (§ 828 Abs. 3 BGB). Ob sie haftet, prüfst du in Lektion 4.'},
          {t:'Michael (16) schießt gegen den Zaun, bis eine Latte bricht.',f:'beschraenkt',e:'Mit 16 ist Michael beschränkt deliktsfähig und hat die nötige Einsicht.'},
          {t:'Tom (17) stößt betrunken eine Musikbox vom Tisch.',f:'beschraenkt',e:'Mit 17 ist Tom beschränkt deliktsfähig. Dass er betrunken war, hilft ihm nicht (§ 827 S. 2 BGB) – mehr in Lektion 4.'},
          {t:'Lisa (19) fährt bei Nebel zu schnell und übersieht einen Radfahrer.',f:'voll',e:'Mit 19 greift keine Ausnahme: voll deliktsfähig.'},
          {t:'Opa Gerd (72) parkt in Weimar aus und schrammt ein anderes Auto.',f:'voll',e:'Volljährig und nicht bewusstlos: voll deliktsfähig, egal wie alt.'}]})}
      ${lueckentext({id:'stufen-heft',titel:'Hefteintrag: Stufen der Deliktsfähigkeit',saetze:[
        'Wer [deliktsfähig] ist, muss für die Schäden haften, die er anderen zufügt.',
        'Kinder unter [7|sieben] Jahren sind [deliktsunfähig]. Sie müssen für Schäden nicht aufkommen (§ 828 Abs. 1 BGB). Deliktsunfähig ist auch, wer [bewusstlos] ist oder wegen einer krankhaften Störung der Geistestätigkeit nicht frei entscheiden kann (§ 827 BGB).',
        'Wer mindestens 7, aber noch nicht [18|achtzehn] Jahre alt ist, ist [beschränkt deliktsfähig]. Er haftet nur, wenn er die nötige [Einsicht] hatte (§ 828 Abs. 3 BGB).',
        'Ab [18|achtzehn] Jahren ist man [voll deliktsfähig].']})}
      ${gesetz(828,827)}`},
    {sozial:'zweit',titel:'Der unvernünftige Michael',html:()=>`${fallHTML('zaun',`<p class="body-l">Bens großer Bruder Michael (16) hat das Spektakel mitbekommen. Trotzdem spielt er am nächsten Tag mit seinem Kumpel Fußball gegen denselben Zaun. Diesmal bricht die Latte. Der Nachbar kann es nicht fassen: Michael müsse doch vernünftiger sein als Ben.</p>`)}
      <p class="task"><b>Auftrag:</b> Klärt zu zweit, ob Michael zahlen muss, und schreibt eure Begründung an die Wand.</p>
      ${schreibfeld(WAND.stufen)}
      ${impuls(IMPULS.stufen)}`}]});

/* ---------- Lektion 3: Achtung, Straßenverkehr! ---------- */
const gerichtHTML=g=>abstimmung({id:g.id,titel:g.titel,fall:`${fotoHTML(g.foto)}<p>${g.fall}</p>`,frage:g.frage,optionen:g.optionen,r:g.r,e:g.e});
L.lektion({id:'strassenverkehr',titel:'Achtung, Straßenverkehr!',icon:'traffic',dauer:'20 Minuten',farben:['blau','gelb'],hinweise:HINWEISE.strassenverkehr,
  frage:'Warum sind Kinder bis 9 im Straßenverkehr besonders geschützt?',
  tafel:`<b>Sonderregel im Straßenverkehr (§ 828 Abs. 2)</b><ul><li>${dot('blau')} 7 bis 9 Jahre: keine Haftung bei einem Unfall mit Auto, Straßenbahn oder Zug</li><li>nicht bei Absicht</li><li>meist nicht bei parkenden Autos (BGH 2004)</li></ul><p>Grund: Tempo und Abstand können Kinder noch nicht sicher einschätzen.</p>`,
  stationen:[
    {sozial:'klasse',titel:'Die eilige Lisa',html:()=>`<p class="task"><b>Auftrag:</b> Stimmt ab: Muss Lisa zahlen? Überlegt danach: Warum macht das Gesetz für Kinder im Straßenverkehr eine Ausnahme?</p>
      ${abstimmung({id:'lisa-urteil',titel:'Lisa und das Auto',
        fall:`${fotoHTML('fahrrad')}<p>Lisa hat zu ihrem 9. Geburtstag ein neues Fahrrad bekommen und radelt am nächsten Morgen damit zur Schule in Weimar. Sie ist spät dran und nimmt einem Auto die Vorfahrt. Der Autofahrer muss ausweichen und fährt ein geparktes Auto an. Schaden: 1.500 €.</p>`,
        frage:'Muss Lisa die 1.500 € bezahlen?',optionen:['Ja, sie hat die Vorfahrt missachtet','Nein, mit 9 ist sie bei einem Unfall mit einem fahrenden Auto geschützt','Ja, aber nur die Hälfte'],r:1,
        e:'Kinder von 7 bis 9 Jahren haften nicht für Schäden bei einem Unfall mit einem Kraftfahrzeug, wenn sie nicht absichtlich gehandelt haben (§ 828 Abs. 2 BGB). Dass am Ende ein parkendes Auto beschädigt wurde, ändert nichts: Der Unfall ist mit dem fahrenden Auto passiert.'})}`},
    {sozial:'zweit',titel:'Der Straßenverkehr-Check',html:()=>`<p class="task"><b>Auftrag:</b> Prüft zu zweit jede Karte: Greift die Sonderregel für Kinder von 7 bis 9 – oder müsst ihr weiter prüfen? Das Fragezeichen erklärt euch beide Fächer.</p>
      ${zuordnen({id:'verkehr-check',frage:'Greift die Sonderregel im Straßenverkehr (§ 828 Abs. 2 BGB)?',
        faecher:[
          {id:'geschuetzt',t:'Sonderregel greift<span class="zu-sub">Das Kind haftet nicht</span>',kurz:'Sonderregel greift',info:'<p>Das Kind ist 7 bis 9 Jahre alt, der Schaden entsteht bei einem Unfall mit einem Kraftfahrzeug (Auto, Motorrad, Bus), einer Straßenbahn oder einem Zug – und das Kind hat nicht absichtlich gehandelt.</p>'},
          {id:'pruefen',t:'Sonderregel greift nicht<span class="zu-sub">Weiter mit der Einsicht prüfen</span>',kurz:'Sonderregel greift nicht',info:'<p>Das Kind ist 10 oder älter, es war kein Fahrzeug in Fahrt beteiligt (zum Beispiel ein parkendes Auto oder ein Fußgänger) oder es hat absichtlich gehandelt. Dann zählt die Einsicht nach § 828 Abs. 3 BGB.</p>'}],
        karten:[
          {t:'Lisa (9) nimmt mit dem Rad einem Auto die Vorfahrt. Das Auto weicht aus und rammt ein parkendes Auto.',f:'geschuetzt',e:'Unfall mit einem fahrenden Auto, keine Absicht: Die Sonderregel greift.'},
          {t:'Jonas (9) rennt in Jena hinter seinem Ball auf die Straße. Ein Auto bremst und kracht in eine Laterne.',f:'geschuetzt',e:'Ein fahrendes Auto und ein Kind, das Tempo und Abstand nicht einschätzt: genau dafür ist die Regel da.'},
          {t:'Mila (8) fährt in Erfurt mit dem Laufrad vor eine Straßenbahn. Die Bahn bremst scharf, Fahrgäste stürzen.',f:'geschuetzt',e:'Auch Straßenbahnen zählen (Schienenbahn, § 828 Abs. 2 BGB).'},
          {t:'Paul (9) fährt mit dem Fahrrad unaufmerksam gegen ein ordnungsgemäß geparktes Auto.',f:'pruefen',e:'Bei einem parkenden Auto fehlt die typische Überforderung durch den fließenden Verkehr (BGH, 2004).'},
          {t:'Emma (8) wirft von einer Brücke absichtlich einen Stein auf ein fahrendes Auto.',f:'pruefen',e:'Bei Absicht gilt die Sonderregel nie (§ 828 Abs. 2 S. 2 BGB).'},
          {t:'Leni (8) fährt mit dem Rad auf dem Gehweg einen Fußgänger um.',f:'pruefen',e:'Kein Kraftfahrzeug und keine Bahn beteiligt: Die Sonderregel greift nicht.'},
          {t:'Max (10) nimmt mit dem Rad einem Auto die Vorfahrt.',f:'pruefen',e:'Mit 10 ist Max zu alt für die Sonderregel. Jetzt zählt seine Einsicht.'}]})}`},
    {sozial:'allein',titel:'Die Sonderregel',html:()=>`<p class="task"><b>Auftrag:</b> Lies § 828 Abs. 2 BGB und füll den Hefteintrag aus.</p>
      ${gesetz(828)}
      ${lueckentext({id:'verkehr-heft',titel:'Hefteintrag: Sonderregel im Straßenverkehr',saetze:[
        'Wer mindestens 7, aber noch nicht [10|zehn] Jahre alt ist, haftet nicht für Schäden bei einem Unfall mit einem [Kraftfahrzeug|Auto], einer Schienenbahn oder einer Schwebebahn (§ 828 Abs. 2 BGB).',
        'Das gilt nicht, wenn das Kind den Schaden [vorsätzlich|absichtlich] herbeigeführt hat.',
        'Der Grund: Kinder unter 10 können [Geschwindigkeit|Tempo|Geschwindigkeiten] und Entfernungen von Fahrzeugen noch nicht sicher einschätzen.',
        'Fährt ein Kind gegen ein [parkendes|geparktes] Auto, greift die Sonderregel meistens nicht (BGH, 2004).']})}
      ${hilfen({tipp:'Im Gesetz steht „nicht das zehnte Lebensjahr vollendet“. Das heißt: noch nicht 10 Jahre alt.',
        denkWeiter:'Und ein Auto, das nur kurz an der Ampel wartet? Dafür gilt die Sonderregel doch: Der Bundesgerichtshof hat 2007 entschieden, dass ein Achtjähriger nicht haftet, der mit dem Rad gegen ein Auto fuhr, das im fließenden Verkehr kurz anhalten musste. Ein ordentlich geparktes Auto ist dagegen für ein Kind wie eine Mauer.'})}`},
    {sozial:'klasse',titel:'Ihr seid das Gericht',html:()=>`<p class="task"><b>Auftrag:</b> Ihr seid das Gericht. Urteilt über vier Fälle – im Lernraum stimmt die ganze Klasse live ab. Schreibt danach eure Meinung zur Altersgrenze an die Wand.</p>
      ${GERICHT.map(gerichtHTML).join('')}
      ${schreibfeld(WAND.strassenverkehr)}
      ${impuls(IMPULS.strassenverkehr)}`}]});

/* ---------- Lektion 4: Kommt drauf an! ---------- */
L.lektion({id:'einsicht',titel:'Kommt drauf an!',icon:'psychology',dauer:'25 Minuten',farben:['gelb','gruen'],hinweise:HINWEISE.einsicht,
  frage:'Wann müssen Kinder und Jugendliche für Schäden zahlen – und wann nicht?',
  tafel:'<b>Prüfschema Haftung</b><ol><li>Schaden?</li><li>Durch die Person verursacht?</li><li>Alter: unter 7 / 7–9 im Straßenverkehr / Einsicht?</li><li>Bewusstlos? Selbst betrunken zählt nicht (§ 827)</li><li>Vorsatz oder Fahrlässigkeit?</li></ol><p>→ Haftet nach § 823 Abs. 1 BGB</p>',
  stationen:[
    {sozial:'klasse',titel:'Die hilfsbereite Marie',html:()=>`<p class="task"><b>Auftrag:</b> Stimmt ab. Achtung: Diesmal kommt es nicht nur auf das Alter an.</p>
      ${abstimmung({id:'marie-urteil',titel:'Marie und die Tasse',
        fall:`${fotoHTML('tassen')}<p>Marie (8) ist mit ihrer Mutter bei Freunden in Jena zum Kaffeetrinken. Eifrig möchte sie beim Abräumen helfen. Wie ihre Mutter stapelt sie ein paar Tassen und will sie in die Küche tragen. Doch der Stapel ist für Marie zu hoch: Die oberste Tasse fällt zu Boden und zerbricht.</p>`,
        frage:'Muss Marie für die Tasse aufkommen?',optionen:['Ja, sie hat sie fallen lassen','Nein, sie war so vorsichtig, wie man es von einer Achtjährigen erwarten kann','Nein, Kinder unter 10 haften nie'],r:1,
        e:'Mit 8 ist Marie beschränkt deliktsfähig. Dass Geschirr zerbrechen kann, versteht sie. Haften müsste sie aber nur, wenn sie fahrlässig gehandelt hat – und Maßstab ist ein durchschnittliches Kind in ihrem Alter. Marie hat es gut gemeint und es so gemacht wie ihre Mutter. Sie haftet nicht.'})}`},
    {sozial:'allein',titel:'Der Rechts-Navi',html:()=>`<p class="task"><b>Auftrag:</b> Mach eine Probefahrt mit dem Rechts-Navi: Beantworte die Fragen für Marie und schau, wo du ankommst. Starte dann neu und probier andere Abzweigungen aus: Wann haftet jemand, wann nicht?</p>
      ${pruefschema({id:'navi-probe',titel:'Haftet die Person für den Schaden? Der Rechts-Navi prüft Schritt für Schritt.',schema:NAVI,
        beispiel:'<b>Probefahrt:</b> Marie (8) will beim Abräumen helfen. Der Tassenstapel ist für sie zu hoch, eine Tasse zerbricht.'})}`},
    {sozial:'allein',titel:'Einsicht und Verschulden',html:()=>`<p class="task"><b>Auftrag:</b> Füll den Hefteintrag aus. § 827 BGB kannst du unten nachlesen.</p>
      ${lueckentext({id:'einsicht-heft',titel:'Hefteintrag: Einsicht, Verschulden und Rausch',saetze:[
        'Bei Kindern und Jugendlichen von 7 bis 17 kommt es auf die [Einsicht] an: Konnten sie verstehen, dass ihr Handeln gefährlich ist und sie dafür geradestehen müssen (§ 828 Abs. 3 BGB)?',
        'Diese Einsicht haben die meisten. Wer sich darauf beruft, dass sie fehlte, muss das [beweisen|nachweisen].',
        'Außerdem muss die Person [vorsätzlich] oder [fahrlässig] gehandelt haben. Maßstab ist, was man von einem Kind in diesem [Alter] erwarten kann.',
        'Wer bewusstlos ist, haftet nicht. Wer sich aber selbst [betrinkt|betrunken macht|berauscht] oder Drogen nimmt, haftet trotzdem (§ 827 S. 2 BGB).']})}
      ${gesetz(827,276)}`},
    {sozial:'zweit',titel:'Fall-Akte',html:()=>`<p class="task"><b>Auftrag:</b> Löst die Fälle zu zweit. Lest zuerst den Steckbrief, dann klickt euch durch den Rechts-Navi. Biegt ihr falsch ab, bekommt ihr einen Tipp. Danach baut ihr aus den Sätzen das Gutachten – übertragt mindestens drei Gutachten ins Heft.</p>
      ${fallakte({id:'akte',titel:'Fall-Akte Deliktsfähigkeit',schema:NAVI,faelle:FAELLE})}
      ${schreibfeld(WAND.einsicht)}
      ${impuls(IMPULS.einsicht)}`}]});

/* ---------- Lektion 5: Und die Eltern? ---------- */
function rechnerHTML(){
  const h=HAFTPFLICHT;
  return `<section class="aufgabe df-rechner" id="hp-box"><p class="aufgabe-kopf"><span class="ms sm" aria-hidden="true">calculate</span>Lohnt sich die Haftpflicht?</p>
    <p class="aufgabe-frage">Wähle einen Schaden. Wie viele Jahre Versicherungsbeitrag könnte man dafür bezahlen?</p>
    <div class="df-wahl" role="group" aria-label="Schaden wählen">${h.schaeden.map((s,i)=>`<button type="button" data-hp="${i}" aria-pressed="${i===0}"><span class="ms sm" aria-hidden="true">${s.icon}</span>${s.t}</button>`).join('')}</div>
    <div class="df-balken" id="hp-balken" aria-live="polite"></div>
    <p class="small muted">${h.stand}</p></section>`;
}
function rechnerInit(root){
  const box=$('#hp-box',root);if(!box)return;const h=HAFTPFLICHT,fmt=n=>n.toLocaleString('de-DE');
  const zeige=i=>{
    const s=h.schaeden[i],jahre=s.betrag/h.beitrag,max=Math.max(s.betrag,h.beitrag);
    $$('[data-hp]',box).forEach(b=>b.setAttribute('aria-pressed',String(+b.dataset.hp===i)));
    $('#hp-balken',box).innerHTML=`<div class="df-balken-zeile"><span>Haftpflicht im Jahr</span><span class="df-balken-spur"><span style="width:${Math.max(.5,h.beitrag/max*100)}%;--df-farbe:var(--df-gruen)"></span></span></div>
      <div class="df-balken-zeile"><span>${esc(s.t)}</span><span class="df-balken-spur"><span style="width:${s.betrag/max*100}%;--df-farbe:var(--df-rot)"></span></span></div>
      <p class="title-m num">${fmt(s.betrag)} € – so viel wie ${jahre<2?'gut ein Jahr':`${fmt(Math.round(jahre))} Jahre`} Haftpflicht-Beitrag</p>
      <p class="small">${s.e}</p>`;
  };
  box.addEventListener('click',e=>{const b=e.target.closest('[data-hp]');if(b)zeige(+b.dataset.hp)});
  zeige(0);
}
L.lektion({id:'eltern',titel:'Und die Eltern?',icon:'family_restroom',dauer:'30 Minuten',farben:['rot','gelb','gruen','blau'],hinweise:HINWEISE.eltern,
  frage:'Wer zahlt am Ende wirklich – du, deine Eltern oder die Versicherung?',
  tafel:'<b>Wer zahlt?</b><ul><li>Eltern nur bei verletzter Aufsichtspflicht (§ 832)</li><li>sonst der Täter selbst – oder niemand: Der Geschädigte bleibt auf dem Schaden sitzen</li><li>Haftpflichtversicherung zahlt für den, der haftet</li><li>Moped, E-Scooter, Auto: Pflichtversicherung</li></ul><p><b>Leitfrage:</b> Wer deliktsfähig ist und schuldhaft einen Schaden anrichtet, haftet selbst. Bezahlen tut oft die Versicherung.</p>',
  stationen:[
    {sozial:'klasse',titel:'Das Schild an der Baustelle',html:()=>`<p class="task"><b>Auftrag:</b> Stimmt ab: Stimmt das Schild? Sammelt danach Situationen, in denen Eltern wirklich zahlen müssten.</p>
      ${abstimmung({id:'schild-urteil',titel:'Eltern haften für ihre Kinder',
        fall:`${fotoHTML('schild')}<p>An fast jeder Baustelle hängt es: „Betreten der Baustelle verboten! Eltern haften für ihre Kinder.“ Auch am Bauzaun neben deiner Schule in Apolda.</p>`,
        frage:'Stimmt, was auf dem Schild steht?',optionen:['Ja, Eltern haften immer für ihre Kinder','Nein, Eltern haften nur, wenn sie ihre Aufsichtspflicht verletzt haben','Nein, Eltern haften nie für ihre Kinder'],r:1,
        e:'Das Schild ist rechtlich ohne Wirkung. Eltern haften nach § 832 BGB nur, wenn sie ihre Aufsichtspflicht verletzt haben. Wie viel Aufsicht nötig ist, hängt vom Alter und von der Situation ab.'})}`},
    {sozial:'zweit',titel:'Die Party-Abrechnung',html:()=>`<div class="stack"><p class="szenario small muted"><span class="ms sm" aria-hidden="true">theater_comedy</span> Szenario</p>
      <p class="body-l">Deine Party zum 16. war legendär – die Abrechnung am Sonntag auch. Auf dem Küchentisch liegen fünf Rechnungen. Wer muss zahlen?</p></div>
      <p class="task"><b>Auftrag:</b> Ordnet zu zweit jede Rechnung zu: Zahlt der Verursacher selbst, zahlen seine Eltern, oder bleibt der Geschädigte auf dem Schaden sitzen? Probiert danach den Haftpflicht-Rechner aus.</p>
      ${zuordnen({id:'party-abrechnung',frage:'Wer muss die Rechnung bezahlen?',
        faecher:[
          {id:'selbst',t:'Der Verursacher selbst<span class="zu-sub">§ 823 Abs. 1 BGB</span>',kurz:'Der Verursacher selbst',info:'<p>Wer deliktsfähig ist und vorsätzlich oder fahrlässig einen Schaden anrichtet, muss ihn selbst ersetzen. Ab 7 kommt es auf die Einsicht an.</p>'},
          {id:'eltern',t:'Die Eltern<span class="zu-sub">Aufsichtspflicht verletzt, § 832 BGB</span>',kurz:'Die Eltern',info:'<p>Eltern haften, wenn sie ihr Kind nicht so beaufsichtigt haben, wie es sein Alter und die Situation verlangen. Ein Fünfjähriger braucht viel Aufsicht, ein Sechzehnjähriger kaum noch.</p>'},
          {id:'niemand',t:'Niemand<span class="zu-sub">Der Geschädigte bleibt darauf sitzen</span>',kurz:'Niemand',info:'<p>Haftet weder der Verursacher (zu jung, keine Schuld) noch die Eltern (gut aufgepasst), muss der Geschädigte den Schaden selbst tragen.</p>'}],
        karten:[
          {t:'Tom (17) betrinkt sich und stößt die Musikbox vom Tisch: 250 €.',f:'selbst',e:'Selbst verschuldeter Rausch schützt nicht (§ 827 S. 2 BGB). Tom zahlt.'},
          {t:'Jan (16) wirft aus Spaß ein Glas vom Balkon. Es landet auf dem Auto des Nachbarn: 400 €.',f:'selbst',e:'Mit 16 hat Jan die nötige Einsicht und handelt mindestens fahrlässig.'},
          {t:'Dein Cousin Emil (5) bemalt mit Edding die Tapete, während seine Mutter eine Stunde lang draußen telefoniert: 300 €.',f:'eltern',e:'Emil ist deliktsunfähig. Einen Fünfjährigen eine Stunde allein zu lassen, verletzt aber die Aufsichtspflicht. Seine Mutter zahlt (§ 832 BGB).'},
          {t:'Lea (6) stößt beim Spielen ein Glas Saft auf den Teppich. Ihr Vater sitzt daneben und passt auf: 120 € Reinigung.',f:'niemand',e:'Lea ist deliktsunfähig, ihr Vater hat aufgepasst. Ihr bleibt auf der Reinigung sitzen.'},
          {t:'Sophie (17) rutscht auf verschüttetem Saft aus und reißt im Fallen die Gardine herunter: 80 €.',f:'niemand',e:'Sophie hat nichts falsch gemacht – kein Verschulden. Ihr tragt den Schaden selbst.'}]})}
      ${rechnerHTML()}`,init:rechnerInit},
    {sozial:'allein',titel:'Eltern und Versicherung',html:()=>`<p class="task"><b>Auftrag:</b> Füll den Hefteintrag aus. Schau dann, wie gut dein Bauchgefühl aus Lektion 1 war.</p>
      ${lueckentext({id:'eltern-heft',titel:'Hefteintrag: Eltern und Versicherung',saetze:[
        'Eltern haften für Schäden ihrer Kinder nur, wenn sie ihre [Aufsichtspflicht] verletzt haben (§ 832 BGB).',
        'Haben sie gut aufgepasst, haftet der Minderjährige selbst – oder der Geschädigte bleibt auf dem Schaden [sitzen].',
        'Schilder wie „Eltern haften für ihre Kinder“ ändern daran [nichts].',
        'Gegen hohe Schäden schützt eine [Haftpflichtversicherung|Privathaftpflicht|private Haftpflichtversicherung]. Kinder sind meist in der Versicherung der [Eltern|Familie] mitversichert.',
        'Für Mopeds und E-Scooter ist eine Haftpflichtversicherung Pflicht. Man erkennt sie am [Versicherungskennzeichen].']})}
      ${gesetz(832)}
      ${blitzAufloesung(BLITZ)}`},
    {sozial:'klasse',titel:'Zurück zur Simson',html:()=>`${L.rueckblick(WAND.haftung.id,'Wer muss für den Schaden an Herrn Labuhns Auto zahlen?')}
      ${fallHTML('simson',`<p class="body-l">Erinnerst du dich? Du bist 15, fährst mit deiner Simson zur Schule und nimmst die Verkehrsregeln nicht so genau. Herr Labuhn weicht aus und fährt gegen eine Laterne: 1.500 € Schaden. An deiner Simson klebt das schwarze Versicherungskennzeichen für 2026/27.</p>`)}
      <p class="task"><b>Auftrag:</b> Jetzt bist du Profi. Beantworte die Leitfrage für den Simson-Fall und vergleiche mit deiner Vermutung vom Anfang.</p>
      ${schreibfeld(WAND.eltern)}
      ${impuls(IMPULS.eltern)}`}]});

/* ---------- Mission Simson: Labyrinth ---------- */
const WEGE=[
  {id:'kennzeichen',icon:'verified',titel:'Versicherung melden',text:'An deiner Simson klebt das schwarze Versicherungskennzeichen für 2026/27. Du meldest den Unfall noch am selben Tag deiner Versicherung.',erg:'ziel',
    e:'Für Mopeds ist eine Haftpflichtversicherung Pflicht. Herr Labuhn kann sein Geld direkt von deiner Versicherung verlangen. Du haftest zwar (§ 823 Abs. 1 BGB), aber die Versicherung zahlt für dich.'},
  {id:'zeugen',icon:'visibility',titel:'Zeugen suchen',text:'Du bist dir sicher: Herr Labuhn war auch viel zu schnell. Du suchst Zeugen.',erg:'glueck',
    e:'Hat Herr Labuhn den Unfall mitverschuldet, wird der Schaden geteilt (§ 254 BGB). Ob das so war, entscheiden die Beweise.',
    wuerfel:{frage:'Findet sich eine Zeugin, die bestätigt, dass Herr Labuhn zu schnell war?',ja:'Eine Zeugin bestätigt es. Herr Labuhn trägt einen Teil seines Schadens selbst, den Rest zahlt deine Versicherung.',nein:'Niemand hat etwas gesehen, das gegen Herrn Labuhn spricht. Du haftest voll – zum Glück zahlt deine Versicherung.'}},
  {id:'abhauen',icon:'directions_run',titel:'Einfach weiterfahren',text:'Du gibst Gas und verschwindest. Hat ja keiner gesehen …',erg:'sackgasse',
    e:'Unfallflucht ist eine Straftat (§ 142 StGB). Herr Labuhn hat sich dein Kennzeichen gemerkt. Die Versicherung zahlt ihm zwar den Schaden, kann sich aber Geld von dir zurückholen – und für dich wird es richtig teuer.',
    unterwegs:['Du biegst um die Ecke und atmest durch.','In der Schule fragt dich niemand etwas. Puh.','Am Nachmittag klingelt die Polizei bei euch: Herr Labuhn hat dein Kennzeichen notiert.']},
  {id:'eltern',icon:'family_restroom',titel:'Die Eltern sollen zahlen',text:'„Eltern haften für ihre Kinder!“ – du gibst Herrn Labuhn die Adresse deiner Eltern.',erg:'sackgasse',
    e:'Eltern haften nur, wenn sie ihre Aufsichtspflicht verletzt haben (§ 832 BGB). Eine Fünfzehnjährige mit Mopedführerschein müssen sie nicht zur Schule begleiten. Deine Eltern müssen nicht zahlen.'},
  {id:'jung',icon:'child_care',titel:'„Ich bin doch erst 15!“',text:'Du sagst: „Ich bin minderjährig, ich muss gar nichts zahlen.“',erg:'sackgasse',
    e:'Mit 15 bist du beschränkt deliktsfähig. Wer den Mopedführerschein hat, kann verstehen, dass er für Unfälle geradestehen muss (§ 828 Abs. 3 BGB). Du haftest.'},
  {id:'privathaftpflicht',icon:'home',titel:'Die Familienhaftpflicht',text:'Deine Eltern haben eine Privathaftpflicht für die ganze Familie. Die soll den Schaden bezahlen.',erg:'sackgasse',
    e:'Die Privathaftpflicht zahlt keine Schäden, die beim Fahren mit einem Kraftfahrzeug entstehen – auch nicht mit einem Moped (Benzinklausel). Dafür ist die Pflichtversicherung mit Versicherungskennzeichen da.'},
  {id:'richtig',icon:'checklist',titel:'Alles richtig machen',text:'Du hältst an und machst Schritt für Schritt alles richtig.',erg:'ziel',
    e:'Anhalten, sichern, Daten austauschen, Schaden melden: So bekommt Herr Labuhn sein Geld von deiner Versicherung, und du bleibst auf der sicheren Seite.',
    unterwegs:['Warnblinker an, Unfallstelle sichern.','Ist jemand verletzt? Zum Glück nicht.','Daten austauschen: Name, Anschrift, Versicherungskennzeichen.','Fotos von der Unfallstelle machen, Zeugen notieren.','Den Schaden deiner Versicherung melden.']}];
// Karte: Kreuzungen 1–7 unten, Gänge a–g, Tor B (Würfel) beim Weg „Zeugen suchen“, Ziel Z oben in der Mitte
const KARTE=[
  '#################',
  '#########ggggggg#',
  '#######ZZZ#####g#',
  '#d###bBZZZ#e###g#',
  '#d#c#b##a##e#f#g#',
  '#d#c#b##a##e#f#g#',
  '#d#c#b##a##e#f#g#',
  '#d#c#b##a##e#f#g#',
  '#d#c#b##a##e#f#g#',
  '#d#c#b##a##e#f#g#',
  '#4#3#2##1##5#6#7#',
  '#...............#',
  '########S########',
  '#################'];
L.tool({id:'simson',ch:3,farben:['gelb','gruen','blau'],hinweise:HINWEISE.simson,title:'Mission Simson',sub:'Nach dem Crash vor der Schule: Welche Wege führen dazu, dass der Schaden sauber geregelt ist?',
html(){return `<p class="task"><b>Auftrag:</b> Spielt zu zweit. Lauft mit der Figur zu einer Kreuzung, lest, was passiert, und schätzt zuerst: Führt der Weg ans Ziel, in die Sackgasse, oder kommt es darauf an? Dann lauft ihn ab. Schafft ihr alle sieben Wege?</p>
<div class="stack"><p class="small muted"><span class="ms sm" aria-hidden="true">theater_comedy</span> Szenario</p><h2 class="headline-s">Du bist 15 und hast gerade Herrn Labuhns Auto gegen eine Laterne gelenkt.</h2>
  <p class="body-l">1.500 € Schaden, Herr Labuhn ist sauer, und du musst gleich in die Schule. Sieben Wege führen durch das Labyrinth. Ziel: Herr Labuhn bekommt sein Geld, und du stehst nicht allein mit den Schulden da.</p></div>
${labyrinth({id:'simson-lab',titel:'Das Labyrinth nach dem Crash',karte:KARTE,wege:WEGE,speicher:'df-simson',
  namen:{ziel:'Schaden geregelt',sackgasse:'Sackgasse',glueck:'Kommt drauf an'},
  ziel:{bild:FOTO.simson?{src:FOTO.simson.src,alt:FOTO.simson.alt,nachweis:nachweis('simson')}:null,text:'Herr Labuhn bekommt sein Geld von deiner Versicherung.'},
  fertig:()=>'Sicher ans Ziel führen nur zwei Wege: den Unfall richtig abwickeln und der Versicherung melden. Abhauen, die Eltern oder die Familienhaftpflicht helfen nicht.'})}
${schreibfeld(WAND.simson)}
${impuls(IMPULS.simson)}
${L.erkHTML('simson')}`},
init(root){L.bindErk(root)}});

/* ---------- Wissenscheck ---------- */
L.tool({id:'wissenscheck',ch:2,farben:['rot','gelb','gruen','blau'],hinweise:HINWEISE.wissenscheck,title:'Wissenscheck',sub:`${WISSENSCHECK.aufgaben.length} Aufgaben in drei Stufen – Grundlagen, Anwenden, Beurteilen – mit Lösungen, Erwartungshorizont und Auswertung`,
html(){return `<p class="task"><b>Auftrag:</b> Prüf, was du kannst. Fang bei den Grundlagen an und arbeite dich bis zum Beurteilen vor. Die Lösung und bei offenen Aufgaben den Erwartungshorizont – also was in eine gute Antwort gehört – siehst du erst, nachdem du geantwortet hast. Am Ende zeigt dir die Auswertung, welche Lektion du wiederholen solltest.</p>
${wissenscheck(WISSENSCHECK)}
${schreibfeld(WAND.wissenscheck)}
${impuls(IMPULS.wissenscheck)}`},
init(){}});

/* ---------- Bereich Wissen ---------- */
function quellenHTML(){return `<section class="panel sources"><h3 class="title-m" style="color:var(--md-on-surface)">Quellen (Stand Oktober 2026)</h3><ul>${QUELLEN.map(q=>`<li>${q}</li>`).join('')}</ul>
  <p>Merksätze, Antworten und Spielstände werden nur in diesem Browser gespeichert.</p>
  <div class="row"><button class="btn outlined small" id="reset" type="button"><span class="ms" aria-hidden="true">restart_alt</span>Merksätze zurücksetzen</button><span id="reset-confirm" class="row" hidden><button class="btn primary small" id="reset-yes" type="button">Ja, alles zurücksetzen</button><button class="btn text small" id="reset-no" type="button">Abbrechen</button></span></div></section>`}
function wissenHTML(){const alle=['rot','gelb','gruen','blau'].map(dot).join('');
  return L.chapterHTML(2,`<button class="card" type="button" data-open="glossar"><span class="dots">${alle}</span><h3 class="title-m">Begriffe nachschlagen</h3><p>${GLOSS.length} Fachbegriffe mit Suche</p><span class="go">Öffnen<span class="ms sm" aria-hidden="true">arrow_forward</span></span></button><button class="card" type="button" data-open="wissen"><span class="dots">${alle}</span><h3 class="title-m">Mein Delikt-Wissen</h3><p>Alle Merksätze als Hefteintrag sammeln und kopieren</p><span class="go">Öffnen<span class="ms sm" aria-hidden="true">arrow_forward</span></span></button>`)+quellenHTML()}

L.start();
