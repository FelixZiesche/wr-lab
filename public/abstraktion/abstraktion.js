// Lernstrecke Abstraktionsprinzip am Kaufvertrag (Klasse 10): vier Lektionen im Rhythmus Fall – Entdecken – Sichern – Anwenden,
// danach der Wissenscheck. Leitfrage: „Gekauft heißt gehört?“ Herzstück ist der Eigentums-Detektiv (detektiv.js).
// Gerüst, Lektionsnavigation und Aufgaben-Bausteine kommen aus /shared/, hier stehen nur die Inhalte.
import { $, $$ } from '../shared/js/ui.js';
import { createLernstrecke } from '../shared/js/lernstrecke.js';
import { schreibfeld, zuordnen, lueckentext, wissenscheck, impuls, hilfen, blitz, blitzAufloesung, pruefschema, fallakte, abstimmung } from '../shared/js/aufgaben.js';
import { GESETZ, NAVI, FAELLE, DETEKTIV } from './daten.js';
import { FOTO, nachweis, fotoHTML, QUELLEN } from './fotos.js';
import { detektiv, bindDetektiv } from './detektiv.js';
import { HINWEISE, WAND, IMPULS } from './wand.js';
import { WISSENSCHECK } from './wissenscheck.js';

/* ---------- Merksätze (eine Erkenntnis pro Lektion) ---------- */
const MS={
  drei:['Ein Kauf besteht aus drei Rechtsgeschäften: dem Kaufvertrag (§ 433 BGB) und zwei Übereignungen (§ 929 BGB), einer für die Ware und einer für das Geld. Der Kaufvertrag ist ein Verpflichtungsgeschäft: Er verpflichtet nur. Eigentümer wird man erst durch das Verfügungsgeschäft, also durch Einigung und Übergabe. Das ist das Trennungsprinzip.'],
  abstraktion:['Verpflichtungs- und Verfügungsgeschäft sind voneinander unabhängig: Ist der Kaufvertrag unwirksam, bleibt eine wirksame Übereignung trotzdem wirksam. Das ist das Abstraktionsprinzip. Minderjährige können Eigentum ohne ihre Eltern erwerben, weil das ein lediglich rechtlicher Vorteil ist (§ 107 BGB).'],
  doppelt:['Wer bezahlt hat, ist noch nicht Eigentümer. Ohne Übergabe hat der Käufer nur einen Anspruch aus dem Kaufvertrag. Eine Sache kann man deshalb zweimal wirksam verkaufen, aber nur einmal übereignen. Eigentümer wird, wem sie zuerst übereignet wird, der andere Käufer bekommt sein Geld zurück und kann Schadensersatz verlangen.'],
  warum:['Das Trennungsprinzip macht Vorbestellungen und den Kauf auf Raten mit Eigentumsvorbehalt möglich. Das Abstraktionsprinzip schützt alle, die später erwerben: Wer von einem Eigentümer kauft, muss nicht prüfen, ob dessen frühere Kaufverträge wirksam waren. Die Kehrseite: Wer übereignet hat, ist sein Eigentum los, auch wenn der Kaufvertrag platzt.']
};

/* ---------- Glossar ---------- */
const GLOSS=[
  ['Abstraktionsprinzip','Das Verfügungsgeschäft ist unabhängig vom Verpflichtungsgeschäft. Ist der Kaufvertrag unwirksam, bleibt die Übereignung trotzdem wirksam.'],
  ['Annahme','Die Willenserklärung, mit der man einen Antrag annimmt. Damit ist der Vertrag geschlossen (§ 147 BGB).'],
  ['Antrag','Die Willenserklärung, mit der man einem anderen einen Vertrag anbietet (§ 145 BGB). Auch: Angebot.'],
  ['Besitz','Die tatsächliche Herrschaft über eine Sache: Wer sie in der Hand oder in seiner Wohnung hat, ist Besitzer (§ 854 BGB).'],
  ['Doppelverkauf','Dieselbe Sache wird an zwei Käufer verkauft. Beide Kaufverträge sind wirksam, aber übereignen kann der Verkäufer nur einmal.'],
  ['Eigentum','Die rechtliche Herrschaft über eine Sache: Der Eigentümer darf mit ihr machen, was er will, und andere ausschließen (§ 903 BGB).'],
  ['Eigentumsvorbehalt','Vereinbarung beim Kauf auf Raten: Die Ware gehört dem Verkäufer, bis der Käufer alles bezahlt hat (§ 449 BGB). Der Käufer ist so lange nur Besitzer.'],
  ['Einigung','Teil der Übereignung: Beide sind sich einig, dass das Eigentum jetzt übergehen soll (§ 929 S. 1 BGB).'],
  ['Kaufvertrag','Vertrag, in dem sich der Verkäufer verpflichtet, die Sache zu übergeben und zu übereignen, und der Käufer, den Preis zu zahlen (§ 433 BGB). Ein Verpflichtungsgeschäft.'],
  ['Lediglich rechtlicher Vorteil','Ein Geschäft bringt einem Minderjährigen nur Rechte und keine Pflichten, zum Beispiel wenn er Eigentum geschenkt oder übereignet bekommt. Dafür braucht er seine Eltern nicht (§ 107 BGB).'],
  ['Realakt','Eine tatsächliche Handlung ohne Willenserklärung, zum Beispiel die Übergabe einer Sache.'],
  ['Rechtsgeschäft','Eine oder mehrere Willenserklärungen, die eine Rechtsfolge auslösen sollen, zum Beispiel ein Vertrag oder eine Übereignung.'],
  ['Schwebend unwirksam','Ein Vertrag eines Minderjährigen ohne Einwilligung der Eltern: Er wird wirksam, wenn die Eltern ihn genehmigen, und endgültig unwirksam, wenn sie Nein sagen (§ 108 BGB).'],
  ['Trennungsprinzip','Verpflichtungsgeschäft und Verfügungsgeschäft sind zwei getrennte Rechtsgeschäfte, auch wenn sie im selben Moment passieren.'],
  ['Übereignung','Übertragung des Eigentums an einer beweglichen Sache durch Einigung und Übergabe (§ 929 S. 1 BGB). Ein Verfügungsgeschäft.'],
  ['Verfügungsgeschäft','Ein Rechtsgeschäft, das ein Recht direkt ändert, zum Beispiel das Eigentum überträgt. Beim Kauf: die Übereignung der Ware und die Übereignung des Geldes.'],
  ['Verpflichtungsgeschäft','Ein Rechtsgeschäft, das nur eine Pflicht begründet, etwas zu tun. Beim Kauf: der Kaufvertrag.']
];

/* ---------- Lernstrecke ---------- */
const dot=k=>`<span class="ap-dot ${k}" aria-hidden="true"></span>`;
const L=createLernstrecke({
  thema:'abstraktion',
  speicher:'ap',
  titel:'Lernstrecke Abstraktionsprinzip',kurz:'Abstraktionsprinzip',
  logo:'<svg aria-hidden="true" width="40" height="40" viewBox="0 0 42 42"><rect x="5" y="8" width="14" height="26" rx="3" fill="none" stroke="var(--md-primary)" stroke-width="3"/><rect x="23" y="8" width="14" height="11" rx="3" fill="var(--ap-ware)"/><rect x="23" y="23" width="14" height="11" rx="3" fill="var(--ap-geld)"/></svg>',
  eyebrow:'Leitfrage · Klasse 10 · Bürgerliches Recht',
  leitfrage:'Gekauft heißt gehört?',
  banner:{src:FOTO.banner.src,alt:FOTO.banner.alt,nachweis:nachweis('banner')},
  intro:'Du kaufst etwas, bezahlst und hältst es in der Hand. Gehört es dir jetzt? Meistens ja – aber nicht immer, und manchmal gehört es dir sogar, obwohl der Kauf geplatzt ist. In dieser Lernstrecke wirst du zum Eigentums-Detektiv: Du zerlegst Käufe in ihre Rechtsgeschäfte und findest heraus, wem am Ende was gehört. Vier Lektionen, jede mit einem Fall aus Thüringen.',
  ziele:['Einen Kauf in Kaufvertrag (Verpflichtungsgeschäft) und zwei Übereignungen (Verfügungsgeschäfte) zerlegen und schematisch darstellen',
    'Eigentum und Besitz unterscheiden',
    'Trennungs- und Abstraktionsprinzip erklären und auf Fälle mit Minderjährigen und Doppelverkauf anwenden',
    'Die Wirksamkeit jedes Rechtsgeschäfts einer Kaufhandlung prüfen und Vor- und Nachteile des Abstraktionsprinzips beurteilen'],
  bereiche:[
    {id:'wissen',icon:'school',label:'Wissen',title:'Sichern und wiederholen',ch:[2],render:wissenHTML,desc:'Wissenscheck, Fachbegriffe, deine Merksätze und die Quellen'}],
  abschluss:[
    {tool:'wissenscheck',titel:'Wissenscheck',text:`${WISSENSCHECK.aufgaben.length} Aufgaben in drei Stufen mit Auswertung`,icon:'fact_check'}],
  kapitel:{2:['Sichern und wiederholen','Allein']},
  merksaetze:MS,
  wissenTitel:'Mein Eigentums-Wissen',
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
const fallHTML=(foto,html)=>`<div class="ap-fall">${fotoHTML(foto)}<div class="stack">${html}</div></div>`;
const szenario='<p class="szenario"><span class="ms sm" aria-hidden="true">theater_comedy</span>Szenario</p>';

/* Blitzrunde „Gehört es schon?“: Einstieg in Lektion 1, Auflösung in Lektion 4 */
const BLITZ={id:'gehoert',werkstatt:'drei',verdeckt:true,
  titel:'Gehört es schon? Entscheide aus dem Bauch: Ist die Person schon Eigentümer?',
  optionen:[{id:'nein',t:'Gehört (noch) nicht',icon:'block'},{id:'ja',t:'Gehört schon',icon:'check_circle'}],
  karten:[
    {t:'Lea (18) hat die neue PlayStation vorbestellt und schon bezahlt. Geliefert wird im Dezember. Gehört die Konsole Lea?',r:'nein',e:'Kaufvertrag und Zahlung sind erledigt, übergeben ist die Konsole aber noch nicht. Eigentum gibt es erst mit Einigung und Übergabe (§ 929 S. 1 BGB).'},
    {t:'Ben (19) bekommt beim Bäcker in Jena seine Brötchen und merkt: Portemonnaie vergessen. Er darf morgen zahlen. Gehören die Brötchen Ben?',r:'ja',e:'Die Bäckerin hat sie ihm übergeben, beide sind sich einig. Ob schon bezahlt ist, spielt für das Eigentum keine Rolle (Trennungsprinzip).'},
    {t:'Kim (16) kauft ein Fahrrad für 750 € und fährt gleich damit los. Zu Hause sagen ihre Eltern Nein zum Kauf. Gehört das Rad Kim?',r:'ja',e:'Der Kaufvertrag ist unwirksam, die Übereignung aber nicht: Eigentum zu bekommen ist für Kim ein lediglich rechtlicher Vorteil (§ 107 BGB). Das ist das Abstraktionsprinzip. Der Laden kann das Rad aber zurückverlangen.'},
    {t:'Max (20) kauft einen Gaming-PC auf Raten. Im Vertrag steht: „Bis zur letzten Rate bleibt der PC Eigentum des Händlers.“ Der PC steht schon in seinem Zimmer. Gehört er Max?',r:'nein',e:'Eigentumsvorbehalt (§ 449 BGB): Max ist Besitzer, Eigentümer wird er erst mit der letzten Rate.'},
    {t:'Jens (35) kauft eine Simson, zahlt bar und will sie morgen abholen. Am Abend verkauft der Verkäufer sie noch einmal, an Bernd, der sie gleich mitnimmt. Gehört die Simson Jens?',r:'nein',e:'Jens hat sie gekauft, aber nicht übergeben bekommen. Bernd ist Eigentümer geworden. Jens bleibt nur sein Anspruch gegen den Verkäufer.'},
    {t:'Sara (17) leiht sich von ihrer Freundin für das Wochenende eine Partybox. Gehört die Box Sara?',r:'nein',e:'Sara hat die Box, sie ist Besitzerin. Eigentümerin bleibt die Freundin.'},
    {t:'Mia (18) kauft über Kleinanzeigen eine Switch, bezahlt und bekommt sie. Später kommt raus: Die Switch war geklaut. Gehört sie Mia?',r:'nein',e:'An gestohlenen Sachen kann man kein Eigentum erwerben, auch nicht, wenn man vom Diebstahl nichts wusste (§ 935 BGB).'}]};

/* ---------- Lektion 1: Ein Kauf, drei Geschäfte ---------- */
L.lektion({id:'drei',titel:'Ein Kauf, drei Geschäfte',icon:'receipt_long',dauer:'25 Minuten',farben:['kv','ware','geld'],hinweise:HINWEISE.drei,
  frage:'Was passiert rechtlich, wenn du etwas kaufst?',
  tafel:`<b>Die Kaufhandlung</b><ol><li>${dot('kv')} Kaufvertrag (§ 433 BGB): Verpflichtungsgeschäft</li><li>${dot('ware')} Übereignung der Ware (§ 929 BGB): Verfügungsgeschäft</li><li>${dot('geld')} Übereignung des Geldes (§ 929 BGB): Verfügungsgeschäft</li></ol><p>Übereignung = Einigung + Übergabe. <b>Trennungsprinzip:</b> drei getrennte Rechtsgeschäfte, auch wenn alles in einer Sekunde passiert.</p><p><b>Besitz</b> = tatsächliche Herrschaft (hat), <b>Eigentum</b> = rechtliche Herrschaft (gehört).</p>`,
  stationen:[
    {sozial:'klasse',titel:'Gekauft heißt gehört?',html:()=>`${fallHTML('handy',`${szenario}
      <p class="body-l">Große Pause in Jena. Max (19) verkauft Lea (18) sein altes iPhone für 350 €. Um 17 Uhr bringt er es vorbei, das Geld bekommt er erst am nächsten Morgen.</p>
      <p class="title-m">Am Abend chattet Lea schon damit. Aber gehört ihr das Handy überhaupt?</p>`)}
      <p class="task"><b>Auftrag:</b> Was meinst du: Ab wann gehört Lea das Handy, und ab wann gehört Max das Geld? Schreib deine Vermutung an die Wand. Am Ende der Lernstrecke schaust du, ob du richtig lagst.</p>
      ${schreibfeld(WAND.drei)}
      ${impuls(IMPULS.drei)}`},
    {sozial:'allein',titel:'Das neue Handy in drei Akten',html:()=>`<p class="task"><b>Auftrag:</b> Erst dein Bauchgefühl: Entscheide bei jeder Karte blitzschnell, ob die Sache der Person schon gehört. Die Auflösung kommt in Lektion 4. Werde dann zum Eigentums-Detektiv: Geh Max’ und Leas Handy-Deal Szene für Szene durch.</p>
      ${blitz(BLITZ)}
      ${detektiv(DETEKTIV.handy)}
      ${gesetz(433,929,854,903)}`,init:bindDetektiv},
    {sozial:'allein',titel:'Ein Kauf, drei Geschäfte',html:()=>`<p class="task"><b>Auftrag:</b> Füll den Hefteintrag aus. Die Gesetzestexte kannst du unten aufklappen.</p>
      ${lueckentext({id:'drei-heft',titel:'Hefteintrag: Die Kaufhandlung',saetze:[
        'Jeder Kauf besteht aus [drei|3] Rechtsgeschäften, auch wenn alles im selben Moment passiert.',
        'Im [Kaufvertrag] (§ 433 BGB) verpflichtet sich der Verkäufer, die Sache zu übergeben und das [Eigentum] zu verschaffen. Der Käufer verpflichtet sich, den Kaufpreis zu [zahlen|bezahlen]. Weil er nur verpflichtet, heißt er [Verpflichtungsgeschäft].',
        'Eigentümer wird man erst durch die [Übereignung] (§ 929 BGB): [Einigung] und [Übergabe]. Weil sie das Eigentum direkt ändert, heißt sie [Verfügungsgeschäft].',
        'Beim Kauf gibt es zwei Übereignungen: die der [Ware|Sache] und die des [Geldes].',
        'Dass Verpflichtung und Verfügung getrennte Rechtsgeschäfte sind, nennt man [Trennungsprinzip].',
        'Wer eine Sache in der Hand hat, ist [Besitzer]. Wem sie rechtlich gehört, ist [Eigentümer].']})}
      ${gesetz(433,929)}`},
    {sozial:'zweit',titel:'Sneaker vom Flohmarkt',html:()=>`<p class="task"><b>Auftrag:</b> Ordnet zu zweit zu: Verpflichtungs- oder Verfügungsgeschäft? Löst dann den Sneaker-Fall und schreibt eure Antwort an die Wand.</p>
      ${zuordnen({id:'verpflichtung-verfuegung',frage:'Verpflichtungs- oder Verfügungsgeschäft? Ordne jede Karte zu.',
        faecher:[
          {id:'verpflichtung',t:'Verpflichtungsgeschäft<span class="zu-sub">Kaufvertrag: „Ich soll …“</span>',kurz:'Verpflichtungsgeschäft',info:'<p>Beide versprechen sich etwas: Ware gegen Geld. Es entstehen nur Pflichten, das Eigentum bleibt, wo es ist (§ 433 BGB).</p>'},
          {id:'verfuegung',t:'Verfügungsgeschäft<span class="zu-sub">Übereignung: „Gehört jetzt dir.“</span>',kurz:'Verfügungsgeschäft',info:'<p>Das Eigentum an der Ware oder am Geld geht über: Einigung und Übergabe (§ 929 S. 1 BGB).</p>'}],
        karten:[
          {t:'Paul (18) und Mia (18) einigen sich auf dem Flohmarkt in Erfurt: Sneaker für 120 €.',f:'verpflichtung',e:'Sie einigen sich nur, was passieren soll: ein Kaufvertrag.'},
          {t:'Mia gibt Paul 120 € in bar.',f:'verfuegung',e:'Das Geld wechselt den Besitzer und soll Paul gehören: Übereignung des Geldes.'},
          {t:'Paul gibt Mia die Sneaker: „Gehören jetzt dir.“',f:'verfuegung',e:'Einigung und Übergabe: Übereignung der Ware.'},
          {t:'Lea (18) klickt im Onlineshop auf „Jetzt kaufen“, der Shop bestätigt die Bestellung.',f:'verpflichtung',e:'Bestellung und Bestätigung sind Antrag und Annahme: ein Kaufvertrag. Der Hoodie gehört Lea noch nicht.'},
          {t:'Der Paketbote übergibt Lea den Hoodie aus dem Onlineshop.',f:'verfuegung',e:'Mit der Übergabe des Pakets wird Lea Eigentümerin: Übereignung der Ware.'},
          {t:'Ben (19) sagt beim Bäcker: „Zwei Brötchen, bitte.“ – „Gern, macht 1,20 €.“',f:'verpflichtung',e:'Antrag und Annahme über Brötchen gegen 1,20 €: ein Kaufvertrag, auch wenn er nur zwei Sätze dauert.'}]})}
      ${fallHTML('sneaker',`<p class="body-l">Paul (18) verkauft Mia (18) auf dem Flohmarkt in Erfurt seine Air Force 1 für 120 €. Mia zahlt sofort. Die Schuhe holt sie am Samstag bei Paul ab, weil sie heute keinen Platz in der Tasche hat.</p>`)}
      ${schreibfeld(WAND.sneaker)}
      ${impuls(IMPULS.sneaker)}`}]});

/* ---------- Lektion 2: Kauf geplatzt – Rad weg? ---------- */
function steckerHTML(){
  const block=(k,ic,t,p,txt)=>`<div class="ap-block ap-${k}" data-block="${k}"><span class="ms" aria-hidden="true">${ic}</span><span class="stack"><b>${t}</b><span class="small">${p}</span><span class="small" data-block-st>${txt}</span></span></div>`;
  return `<section class="aufgabe ap-stecker" id="stecker"><p class="aufgabe-kopf"><span class="ms sm" aria-hidden="true">link_off</span>Der Stecker</p>
    <p class="aufgabe-frage">Schalte um und beobachte: Was passiert mit dem Eigentum am Fahrrad?</p>
    <div class="ap-schalter">
      <button type="button" class="ap-switch" role="switch" aria-checked="false" data-sw="nein"><span class="ap-switch-track" aria-hidden="true"><span class="ap-switch-knopf"></span></span><span>Die Eltern sagen Nein zum Kauf</span></button>
      <button type="button" class="ap-switch" role="switch" aria-checked="false" data-sw="ohne"><span class="ap-switch-track" aria-hidden="true"><span class="ap-switch-knopf"></span></span><span>Gedankenexperiment: Es gibt kein Abstraktionsprinzip</span></button>
    </div>
    <div class="ap-bloecke">
      ${block('kv','receipt_long','Kaufvertrag','§ 433 BGB · Laden und Kim','')}
      <span class="ap-kabel" data-kabel aria-hidden="true"><span class="ms">link</span></span>
      ${block('ware','shopping_bag','Übereignung des Fahrrads','§ 929 BGB · Laden an Kim','')}
      ${block('geld','payments','Übereignung des Geldes','§ 929 BGB · Kim an Laden','noch nicht passiert')}
    </div>
    <p class="title-m" data-stecker-ergebnis aria-live="polite"></p><p class="small" data-stecker-erkl></p></section>`;
}
function steckerInit(root){
  const box=$('#stecker',root);if(!box)return;const sw={nein:false,ohne:false};
  const zeige=()=>{
    const kvTot=sw.nein,wareTot=sw.nein&&sw.ohne;
    $$('[data-sw]',box).forEach(b=>b.setAttribute('aria-checked',String(sw[b.dataset.sw])));
    const setz=(k,tot,txt)=>{const b=$(`[data-block="${k}"]`,box);b.classList.toggle('tot',tot);$('[data-block-st]',b).textContent=txt};
    setz('kv',kvTot,kvTot?'unwirksam (§ 108 BGB)':'schwebend unwirksam, solange die Eltern nichts wissen');
    setz('ware',wareTot,wareTot?'fällt mit dem Kaufvertrag weg':'wirksam (lediglich rechtlicher Vorteil, § 107 BGB)');
    $('[data-kabel]',box).classList.toggle('verbunden',sw.ohne);$('[data-kabel] .ms',box).textContent=sw.ohne?'link':'link_off';
    $('[data-stecker-ergebnis]',box).innerHTML=`<span class="ms" aria-hidden="true">pedal_bike</span> Eigentümer des Fahrrads: <b>${wareTot?'der Laden':'Kim'}</b>`;
    $('[data-stecker-erkl]',box).textContent=!sw.nein?'Noch ist offen, ob die Eltern den Kauf genehmigen. Die Übereignung ist davon nicht betroffen.'
      :sw.ohne?'Hingen Kaufvertrag und Übereignung aneinander, würde das Eigentum mit dem Kaufvertrag zurückfallen. So ist es zum Beispiel in Frankreich. In Deutschland gilt das nicht.'
      :'Der Kaufvertrag ist unwirksam, aber die Übereignung hängt nicht an ihm: Kim bleibt Eigentümerin. Das ist das Abstraktionsprinzip.';
  };
  box.addEventListener('click',e=>{const b=e.target.closest('[data-sw]');if(!b)return;sw[b.dataset.sw]=!sw[b.dataset.sw];zeige()});
  zeige();
}
L.lektion({id:'abstraktion',titel:'Kauf geplatzt – Rad weg?',icon:'pedal_bike',dauer:'20 Minuten',farben:['kv','ware'],hinweise:HINWEISE.abstraktion,
  frage:'Wem gehört das Fahrrad, wenn der Kaufvertrag platzt?',
  tafel:`<b>Abstraktionsprinzip</b><p>Die Wirksamkeit der Übereignung hängt nicht vom Kaufvertrag ab. Jedes Rechtsgeschäft wird einzeln geprüft.</p><ul><li>${dot('kv')} Kaufvertrag Kim (16): Pflicht zu zahlen → Eltern nötig → unwirksam (§§ 107, 108)</li><li>${dot('ware')} Übereignung an Kim: lediglich rechtlicher Vorteil → wirksam (§ 107)</li></ul><p>→ Kim ist Eigentümerin, obwohl der Kauf geplatzt ist.</p>`,
  stationen:[
    {sozial:'klasse',titel:'Kim und das Fahrrad',html:()=>`<p class="task"><b>Auftrag:</b> Stimmt ab. Im Lernraum startet eure Lehrkraft die Abstimmung, allein fällst du dein Urteil selbst.</p>
      ${abstimmung({id:'kim-urteil',titel:'Kim und das Fahrrad',
        fall:`${fotoHTML('fahrrad')}<p>Kim (16) kauft in einem Fahrradladen in Erfurt ein Trekkingrad für 750 €, ohne ihre Eltern zu fragen. Der Verkäufer gibt ihr das Rad sofort: „Gehört jetzt dir, zahl einfach nächste Woche.“ Zu Hause sagen Kims Eltern: „Den Kauf genehmigen wir nicht!“</p>`,
        frage:'Wem gehört das Fahrrad jetzt?',optionen:['Dem Laden, denn der Kaufvertrag ist unwirksam','Kim, denn die Übereignung ist wirksam','Kims Eltern, denn Kim ist minderjährig'],r:1,
        e:'Der Kaufvertrag ist unwirksam, weil die Eltern nicht genehmigt haben (§§ 107, 108 BGB). Die Übereignung ist aber ein eigenes Rechtsgeschäft. Eigentum zu bekommen ist für Kim ein lediglich rechtlicher Vorteil, dafür braucht sie ihre Eltern nicht. Kim ist Eigentümerin. Wie das geht, entdeckst du jetzt.'})}`},
    {sozial:'allein',titel:'Der Stecker',html:()=>`<p class="task"><b>Auftrag:</b> Spiel mit dem Stecker: Was passiert mit dem Eigentum, wenn der Kaufvertrag platzt? Löse dann den Fall Kim als Eigentums-Detektiv.</p>
      ${steckerHTML()}
      ${detektiv(DETEKTIV.fahrrad)}
      ${gesetz(107,108,929)}`,init(root){steckerInit(root);bindDetektiv(root)}},
    {sozial:'allein',titel:'Trennen und abstrahieren',html:()=>`<p class="task"><b>Auftrag:</b> Füll den Hefteintrag aus.</p>
      ${lueckentext({id:'abstraktion-heft',titel:'Hefteintrag: Trennungs- und Abstraktionsprinzip',saetze:[
        '<b>Trennungsprinzip:</b> Verpflichtungsgeschäft und Verfügungsgeschäft sind [getrennte|selbstständige|eigenständige] Rechtsgeschäfte.',
        '<b>Abstraktionsprinzip:</b> Die Wirksamkeit des [Verfügungsgeschäfts] ist unabhängig von der Wirksamkeit des [Verpflichtungsgeschäfts].',
        'Man prüft also jedes Rechtsgeschäft [einzeln|getrennt].',
        'Minderjährige brauchen für einen Kaufvertrag die Einwilligung ihrer [Eltern], weil sie sich zur Zahlung verpflichten (§ 107 BGB).',
        'Eigentum zu bekommen ist dagegen ein lediglich rechtlicher [Vorteil]. Deshalb ist die Übereignung an Kim [wirksam], obwohl der Kaufvertrag unwirksam ist.']})}
      ${hilfen({tipp:'„Abstrakt“ heißt hier: losgelöst. Die Übereignung ist vom Kaufvertrag losgelöst.',denkWeiter:'Und wenn ein Minderjähriger etwas hergibt? Zahlt Kim mit Geld, das nicht ihr Taschengeld ist, verliert sie ihr Eigentum am Geld. Das ist ein rechtlicher Nachteil. Dann ist auch die Übereignung des Geldes ohne die Eltern schwebend unwirksam.'})}`},
    {sozial:'zweit',titel:'Noahs Controller',html:()=>`${fallHTML('controller',`<p class="body-l">Noah (15) kauft im Elektronikmarkt in Gera einen Controller für 70 €. Er bezahlt mit Geld, das er sich ohne zu fragen von seinem Sparbuch geholt hat. Taschengeld ist das nicht. Seine Eltern sind sauer und genehmigen den Kauf nicht.</p>`)}
      <p class="task"><b>Auftrag:</b> Prüft zu zweit alle drei Rechtsgeschäfte: Wem gehört jetzt der Controller, wem das Geld? Schreibt eure Antwort an die Wand.</p>
      ${schreibfeld(WAND.noah)}
      ${impuls(IMPULS.noah)}`}]});

/* ---------- Lektion 3: Zweimal verkauft ---------- */
const MAN_NAVI='<b>Probefahrt:</b> Kim (16) bekommt das Fahrrad übergeben, „Gehört jetzt dir“. Der Kaufvertrag ist unwirksam.';
L.lektion({id:'doppelt',titel:'Zweimal verkauft',icon:'two_wheeler',dauer:'30 Minuten',farben:['kv','ware','geld'],hinweise:HINWEISE.doppelt,
  frage:'Wer bekommt die Simson, wenn sie zweimal verkauft wird?',
  tafel:`<b>Doppelverkauf</b><ul><li>${dot('kv')} Kaufvertrag Uwe – Jens: wirksam</li><li>${dot('geld')} Geld Jens → Uwe: wirksam</li><li>${dot('ware')} Simson Uwe → Jens: <i>nicht passiert</i></li><li>${dot('kv')} Kaufvertrag Uwe – Bernd: auch wirksam</li><li>${dot('ware')} Simson Uwe → Bernd: wirksam</li><li>${dot('geld')} Geld Bernd → Uwe: wirksam</li></ul><p>→ Bernd ist Eigentümer. Jens bekommt sein Geld zurück und kann Schadensersatz verlangen.</p><p><b>Prüfschema Übereignung (§ 929 S. 1):</b> Einigung – Übergabe – Veräußerer ist Eigentümer – Geschäftsfähigkeit</p>`,
  stationen:[
    {sozial:'klasse',titel:'Deal im Café',html:()=>`${fallHTML('cafe',`${szenario}
      <p class="body-l">Freitagabend in einem Café in Jena. Uwe (54) verkauft Jens (35) seine Simson S51 für 3.000 €. Jens zahlt sofort bar und will sie am Samstag abholen. Am selben Abend steht Sammler Bernd (61) in Uwes Garage und bietet 6.000 €. Uwe kann nicht Nein sagen.</p>
      <p class="title-m">Samstag, 9 Uhr: Jens steht vor der leeren Garage.</p>`)}
      <p class="task"><b>Auftrag:</b> Wer bekommt die Simson, Jens oder Bernd? Und was ist mit Jens’ Geld? Schreib deine Vermutung an die Wand.</p>
      ${schreibfeld(WAND.doppelt)}
      ${impuls(IMPULS.doppelt)}`},
    {sozial:'allein',titel:'Sechs Rechtsgeschäfte',html:()=>`<p class="task"><b>Auftrag:</b> Löse den Doppelverkauf als Eigentums-Detektiv. Achte auf die Tabelle: Wem gehört die Simson nach jeder Szene? Übertrag am Ende das Schema mit allen sechs Rechtsgeschäften ins Heft.</p>
      ${detektiv(DETEKTIV.simson)}`,init:bindDetektiv},
    {sozial:'allein',titel:'Das Prüfschema',html:()=>`<p class="task"><b>Auftrag:</b> Füll den Hefteintrag aus. Mach dann eine Probefahrt mit dem Rechts-Navi: Wann wird man Eigentümer?</p>
      ${lueckentext({id:'doppelt-heft',titel:'Hefteintrag: Doppelverkauf',saetze:[
        'Wer bezahlt hat, ist noch nicht [Eigentümer]. Ohne [Übergabe] hat der Käufer nur einen Anspruch aus dem Kaufvertrag.',
        'Eine Sache kann man zweimal wirksam [verkaufen], aber nur einmal [übereignen].',
        'Eigentümer wird, wem die Sache zuerst [übereignet|übergeben] wird, egal wer zuerst gekauft hat.',
        'Der andere Käufer bekommt sein [Geld] zurück und kann [Schadensersatz] verlangen.']})}
      ${pruefschema({id:'navi-probe',titel:'Wird der Erwerber Eigentümer? Der Rechts-Navi prüft die Übereignung Schritt für Schritt.',schema:NAVI,beispiel:MAN_NAVI})}`},
    {sozial:'zweit',titel:'Fall-Akte Eigentum',html:()=>`<p class="task"><b>Auftrag:</b> Erst urteilt die Klasse über Jens. Löst dann zu zweit die Fälle der Fall-Akte mit dem Rechts-Navi und baut das Gutachten. Übertragt mindestens zwei Gutachten ins Heft.</p>
      ${abstimmung({id:'jens-urteil',titel:'Jens vor der leeren Garage',
        fall:`${fotoHTML('simson')}<p>Jens (35) hat die Simson gekauft und 3.000 € bezahlt. Uwe hat sie aber am selben Abend an Bernd verkauft und übergeben.</p>`,
        frage:'Was kann Jens jetzt verlangen?',optionen:['Die Simson von Bernd','Die Simson von Uwe','Sein Geld zurück und Schadensersatz von Uwe'],r:2,
        e:'Bernd ist wirksam Eigentümer geworden, mit ihm hat Jens auch keinen Vertrag. Uwe kann seine Pflicht aus dem Kaufvertrag nicht mehr erfüllen. Jens bekommt deshalb von Uwe die 3.000 € zurück und kann Schadensersatz verlangen, zum Beispiel wenn eine andere Simson teurer ist.'})}
      ${fallakte({id:'akte',titel:'Fall-Akte: Wer ist Eigentümer?',schema:NAVI,faelle:FAELLE})}`}]});

/* ---------- Lektion 4: Warum so kompliziert? ---------- */
L.lektion({id:'warum',titel:'Warum so kompliziert?',icon:'balance',dauer:'15 Minuten',farben:['kv','ware','geld'],hinweise:HINWEISE.warum,
  frage:'Wozu brauchen wir Trennungs- und Abstraktionsprinzip?',
  tafel:`<b>Warum so kompliziert?</b><ul><li><b>Trennungsprinzip</b> macht möglich: Vorbestellung, Kauf auf Raten mit Eigentumsvorbehalt (§ 449)</li><li><b>Abstraktionsprinzip</b> schützt Käufer in der Kette: Wer vom Eigentümer kauft, muss frühere Verträge nicht prüfen</li><li><b>Kehrseite:</b> Wer übereignet hat, verliert sein Eigentum, auch wenn der Kaufvertrag platzt</li></ul><p><b>Leitfrage:</b> Gekauft heißt nicht gehört. Eigentümer wird man durch eine wirksame Übereignung: Einigung und Übergabe.</p>`,
  stationen:[
    {sozial:'klasse',titel:'Oles E-Bike',html:()=>`<p class="task"><b>Auftrag:</b> Stimmt ab. Überlegt danach: Was wäre, wenn Ole sein E-Bike abgeben müsste?</p>
      ${abstimmung({id:'ole-urteil',titel:'Oles E-Bike',
        fall:`${fotoHTML('ebike')}<p>Ein Großhändler aus Erfurt liefert 20 E-Bikes an einen Fahrradladen in Jena. Ole (18) kauft eins davon für 2.400 €, zahlt und fährt damit nach Hause. Eine Woche später merkt der Großhändler: Er hat sich beim Preis für den Laden vertippt. Er ficht den Vertrag mit dem Laden an, der Vertrag ist damit von Anfang an nichtig. Nun will er alle E-Bikes zurück, auch Oles.</p>`,
        frage:'Muss Ole sein E-Bike hergeben?',optionen:['Ja, der Laden hätte es nie verkaufen dürfen','Nein, Ole ist Eigentümer geworden','Ja, aber er bekommt sein Geld zurück'],r:1,
        e:'Der Kaufvertrag zwischen Großhändler und Laden ist nichtig. Die Übereignung der E-Bikes an den Laden bleibt aber wirksam (Abstraktionsprinzip). Der Laden war also Eigentümer und konnte Ole wirksam übereignen. Ole muss nichts über die Verträge vor ihm wissen. Der Großhändler kann sich nur an den Laden halten.'})}`},
    {sozial:'zweit',titel:'Wofür ist das gut?',html:()=>`<p class="task"><b>Auftrag:</b> Ordnet zu zweit zu: Was macht das Trennungsprinzip möglich, wovor schützt das Abstraktionsprinzip – und wo ist der Haken?</p>
      ${zuordnen({id:'vorteile-zuordnen',frage:'Wohin gehört jede Karte?',
        faecher:[
          {id:'trennung',t:'Trennungsprinzip<span class="zu-sub">macht es möglich</span>',kurz:'Trennungsprinzip',info:'<p>Weil Kaufvertrag und Übereignung getrennt sind, kann man heute kaufen und das Eigentum später übertragen.</p>'},
          {id:'abstraktion',t:'Abstraktionsprinzip<span class="zu-sub">schützt</span>',kurz:'Abstraktionsprinzip',info:'<p>Weil die Übereignung nicht vom Kaufvertrag abhängt, bleibt Eigentum Eigentum. Wer später kauft, kann sich darauf verlassen.</p>'},
          {id:'haken',t:'Der Haken<span class="zu-sub">Nachteil für einen Beteiligten</span>',kurz:'Der Haken',info:'<p>Wer übereignet hat oder nur gekauft hat, steht manchmal mit leeren Händen da und hat nur noch einen Anspruch gegen den anderen.</p>'}],
        karten:[
          {t:'Lea (18) bestellt eine Konsole vor, die erst im Dezember erscheint.',f:'trennung',e:'Verkaufen kann man auch, was es noch gar nicht gibt. Übereignet wird erst bei der Lieferung.'},
          {t:'Max (20) kauft einen Gaming-PC auf Raten, der Händler bleibt bis zur letzten Rate Eigentümer.',f:'trennung',e:'Eigentumsvorbehalt (§ 449 BGB): Kaufvertrag jetzt, Übereignung mit der letzten Rate.'},
          {t:'Ole (18) behält sein E-Bike, obwohl der Vertrag zwischen Großhändler und Laden nichtig ist.',f:'abstraktion',e:'Die Übereignung an den Laden bleibt wirksam, also war der Laden Eigentümer.'},
          {t:'Wer gebraucht kauft, muss nicht alle alten Kaufverträge des Verkäufers prüfen.',f:'abstraktion',e:'Es zählt nur, ob der Verkäufer Eigentümer ist, nicht, ob seine Kaufverträge wirksam waren.'},
          {t:'Der Fahrradladen ist sein Rad los, obwohl der Kaufvertrag mit Kim (16) geplatzt ist.',f:'haken',e:'Der Laden ist nicht mehr Eigentümer. Er muss das Rad von Kim zurückverlangen.'},
          {t:'Jens (35) hat die Simson bezahlt und bekommt sie trotzdem nicht.',f:'haken',e:'Als Käufer ohne Übergabe hat er nur einen Anspruch gegen Uwe, nicht gegen Bernd.'}]})}`},
    {sozial:'allein',titel:'Vorteile und Haken',html:()=>`<p class="task"><b>Auftrag:</b> Füll den Hefteintrag aus. Schau dann, wie gut dein Bauchgefühl aus Lektion 1 war.</p>
      ${lueckentext({id:'warum-heft',titel:'Hefteintrag: Warum so kompliziert?',saetze:[
        'Das [Trennungsprinzip] macht Vorbestellungen und den Kauf auf Raten mit [Eigentumsvorbehalt] möglich (§ 449 BGB).',
        'Das [Abstraktionsprinzip] schützt alle, die später erwerben: Wer vom [Eigentümer] kauft, muss frühere Kaufverträge nicht prüfen.',
        'Der Haken: Wer übereignet hat, verliert sein Eigentum, auch wenn der [Kaufvertrag] platzt. Er hat dann nur noch einen [Anspruch] gegen den anderen.']})}
      ${gesetz(449)}
      ${blitzAufloesung(BLITZ)}`},
    {sozial:'klasse',titel:'Gekauft heißt gehört?',html:()=>`${L.rueckblick(WAND.drei.id,'Ab wann gehört Lea das Handy, ab wann gehört Max das Geld?')}
      <p class="task"><b>Auftrag:</b> Jetzt bist du Eigentums-Detektiv. Beantworte die Leitfrage „Gekauft heißt gehört?“ und vergleiche mit deiner Vermutung vom Anfang. Diskutiert dann: In Frankreich geht das Eigentum schon mit dem Kaufvertrag über. Welche Regel findet ihr besser?</p>
      ${schreibfeld(WAND.warum)}
      ${impuls(IMPULS.warum)}`}]});

/* ---------- Wissenscheck ---------- */
L.tool({id:'wissenscheck',ch:2,farben:['kv','ware','geld'],hinweise:HINWEISE.wissenscheck,title:'Wissenscheck',sub:`${WISSENSCHECK.aufgaben.length} Aufgaben in drei Stufen – Grundlagen, Anwenden, Beurteilen – mit Lösungen, Erwartungshorizont und Auswertung`,
html(){return `<p class="task"><b>Auftrag:</b> Prüf, was du kannst. Fang bei den Grundlagen an und arbeite dich bis zum Beurteilen vor. Die Lösung und bei offenen Aufgaben den Erwartungshorizont siehst du erst, nachdem du geantwortet hast. Am Ende zeigt dir die Auswertung, welche Lektion du wiederholen solltest.</p>
${wissenscheck(WISSENSCHECK)}
${schreibfeld(WAND.wissenscheck)}
${impuls(IMPULS.wissenscheck)}`},
init(){}});

/* ---------- Bereich Wissen ---------- */
function quellenHTML(){return `<section class="panel sources"><h3 class="title-m" style="color:var(--md-on-surface)">Quellen (Stand November 2026)</h3><ul>${QUELLEN.map(q=>`<li>${q}</li>`).join('')}</ul>
  <p>Merksätze, Antworten und Spielstände werden nur in diesem Browser gespeichert.</p>
  <div class="row"><button class="btn outlined small" id="reset" type="button"><span class="ms" aria-hidden="true">restart_alt</span>Merksätze zurücksetzen</button><span id="reset-confirm" class="row" hidden><button class="btn primary small" id="reset-yes" type="button">Ja, alles zurücksetzen</button><button class="btn text small" id="reset-no" type="button">Abbrechen</button></span></div></section>`}
function wissenHTML(){const alle=['kv','ware','geld'].map(dot).join('');
  return L.chapterHTML(2,`<button class="card" type="button" data-open="glossar"><span class="dots">${alle}</span><h3 class="title-m">Begriffe nachschlagen</h3><p>${GLOSS.length} Fachbegriffe mit Suche</p><span class="go">Öffnen<span class="ms sm" aria-hidden="true">arrow_forward</span></span></button><button class="card" type="button" data-open="wissen"><span class="dots">${alle}</span><h3 class="title-m">Mein Eigentums-Wissen</h3><p>Alle Merksätze als Hefteintrag sammeln und kopieren</p><span class="go">Öffnen<span class="ms sm" aria-hidden="true">arrow_forward</span></span></button>`)+quellenHTML()}

L.start();
