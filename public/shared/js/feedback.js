// Feedback ohne KI für den Wissenscheck (aufgaben.js). Läuft komplett im Browser, kein Text verlässt das Gerät.
// Die Datei ist austauschbar: Eine KI (nach Freigabe durch die Schule) ersetzt textFeedback() durch eine
// asynchrone Variante mit derselben Rückgabe – aufgaben.js wartet schon mit await darauf.
//
//   OPERATOREN[op]                        → {afb, was}: was der Operator verlangt (für die Hilfe „Was heißt …?“)
//   textFeedback({text, op, erwartung})   → {treffer:[i…], fehlt:[i…], tipps:[Text…], woerter}
//       erwartung: [{t, w, tipp}]   w = Liste von Gruppen mit Wortstämmen, z. B. [['umwelt','klima'], ['wachstum','bip']]:
//                                   Jede Gruppe muss vorkommen, innerhalb einer Gruppe reicht ein Stamm.
//                                   w = 'urteil' | 'kausal' | 'abwaegung' prüft stattdessen die Satzbausteine des Operators.
//                                   ersetzt: 'beispiel' | … – dieser Punkt übernimmt den Operator-Check (kein doppelter Tipp).
//   zahl(text)                            → Zahl aus deutscher Schreibweise („2,4 %“, „1.234,5“) oder NaN
//   zahlFeedback(wert, {r, tol, fehler})  → {richtig, text}   fehler: [{wert, text}] typische Rechenfehler

export const OPERATOREN={
  'nennen':{afb:1,was:'Zähle Begriffe oder Fakten auf, ohne sie zu erklären.'},
  'beschreiben':{afb:1,was:'Gib einen Sachverhalt geordnet und mit eigenen Worten wieder.'},
  'erklären':{afb:2,was:'Mach einen Zusammenhang verständlich: Ursache und Wirkung, verbunden mit „weil“, „dadurch“ oder „deshalb“.'},
  'erläutern':{afb:2,was:'Erkläre den Zusammenhang und mach ihn an einem konkreten Beispiel anschaulich.'},
  'vergleichen':{afb:2,was:'Stell Gemeinsamkeiten und Unterschiede nach Kriterien gegenüber.'},
  'beurteilen':{afb:3,was:'Prüfe eine Aussage oder Maßnahme an fachlichen Kriterien: Was spricht dafür, was dagegen? Komm am Ende zu einem begründeten Urteil.'},
  'bewerten':{afb:3,was:'Wie beurteilen, aber mit deinem eigenen Wertmaßstab: Was ist dir wichtiger und warum? Nenne deinen Maßstab.'},
  'Stellung nehmen':{afb:3,was:'Wäge Argumente dafür und dagegen ab und vertritt am Ende deine eigene, begründete Meinung.'}
};

/* ---------- Text vereinheitlichen ---------- */
// Klein, ä und ae gleich; Satzzeichen am Wortende werden abgetrennt („da,“ → „da ,“), Dezimalzahlen bleiben ganz
const klein=t=>String(t||'').toLowerCase().replace(/ä|ae/g,'a').replace(/ö|oe/g,'o').replace(/ü|ue/g,'u').replace(/ß/g,'ss');
export const norm=t=>' '+klein(t).replace(/[!?;:()"„“”'«»]/g,' ').replace(/([,.])(?=\s|$)/g,' $1').replace(/\s+/g,' ')+' ';
// Kurze Stämme nur am Wortanfang, längere überall (deutsche Komposita: „Windpark“, „Klimaschutzziel“)
function kommtVor(text,stamm){
  const s=klein(stamm).trim();if(!s)return false;
  if(s.length>=4)return text.includes(s);
  return new RegExp('[^a-z0-9]'+s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).test(text);
}

// Satzbausteine der Operatoren; Leerzeichen am Rand stehen für Wortgrenzen
const BAUSTEINE=Object.fromEntries(Object.entries({
  kausal:['weil','denn ',' da ','dadurch','deshalb','daher','deswegen','sodass','so dass','folglich','somit','führt','führen','bewirk','verursach','wodurch','aufgrund','infolge','wegen'],
  abwaegung:['einerseits','andererseits','jedoch','aber ','allerdings','dagegen','hingegen','zwar','trotzdem','dennoch','vorteil','nachteil',' pro ','contra','kontra','spricht'],
  urteil:['ich finde','ich meine','ich halte','meiner meinung','meiner ansicht','meines erachtens','insgesamt','abschließend','zusammenfassend','im ergebnis','fazit','sollte','überwieg','ich bin der meinung','ich bin überzeugt','ich würde','mir ist wichtig','für mich'],
  vergleich:['im gegensatz','während','dagegen','hingegen','beide','gemeinsam','unterschied','unterscheid','ähnlich','genauso','wohingegen'],
  beispiel:['zum beispiel','z . b','z.b','beispielsweise',' etwa ','wie bei','so wie']
}).map(([k,l])=>[k,l.map(klein)]));
const hat=(text,art)=>BAUSTEINE[art].some(b=>text.includes(b));

function erfuellt(text,w){
  if(typeof w==='string')return hat(text,w);
  return (w||[]).every(gruppe=>[].concat(gruppe).some(s=>kommtVor(text,s)));
}

const MIN_WOERTER={'nennen':3,'beschreiben':15,'erklären':20,'erläutern':25,'vergleichen':25,'beurteilen':40,'bewerten':40,'Stellung nehmen':40};

/** Automatische Hinweise zu einer offenen Antwort. Erkennt, ob etwas im Text steht – nicht, wie gut es ist. */
export function textFeedback({text,op,erwartung=[]}){
  const t=norm(text),woerter=String(text||'').trim().split(/\s+/).filter(Boolean).length;
  const treffer=[],fehlt=[];
  erwartung.forEach((e,i)=>(erfuellt(t,e.w)?treffer:fehlt).push(i));
  const tipps=[];
  if(woerter<(MIN_WOERTER[op]||10))tipps.push('Deine Antwort ist noch sehr kurz. Schreib in ganzen Sätzen und führe deine Gedanken aus.');
  // Was der Erwartungshorizont schon prüft, meldet der Operator-Check nicht doppelt
  const geprueft=new Set(erwartung.flatMap(e=>[typeof e.w==='string'?e.w:null,e.ersetzt]).filter(Boolean));
  const op2=(art,txt)=>{if(!geprueft.has(art)&&!hat(t,art))tipps.push(txt)};
  if(['erklären','erläutern','beurteilen','bewerten','Stellung nehmen'].includes(op))op2('kausal','Begründe deine Aussagen: Verbinde Ursache und Wirkung mit „weil“, „dadurch“ oder „deshalb“.');
  if(op==='erläutern')op2('beispiel','Mach den Zusammenhang an einem konkreten Beispiel anschaulich („zum Beispiel …“).');
  if(op==='vergleichen')op2('vergleich','Stell Gemeinsamkeiten und Unterschiede direkt gegenüber („während …“, „im Gegensatz zu …“).');
  if(['beurteilen','bewerten','Stellung nehmen'].includes(op)){
    op2('abwaegung','Wäge ab: Was spricht dafür, was dagegen? („Einerseits … andererseits …“)');
    op2('urteil','Am Ende fehlt dein eigenes Urteil, zum Beispiel: „Insgesamt halte ich … für …, weil …“.');
  }
  // Höchstens zwei Tipps aus dem Erwartungshorizont, damit niemand die Lösung abschreibt
  fehlt.slice(0,2).forEach(i=>tipps.push(erwartung[i].tipp||'Ein wichtiger Aspekt fehlt noch. Lies die Aufgabe noch einmal genau.'));
  return {treffer,fehlt,tipps:tipps.slice(0,4),woerter};
}

/* ---------- Zahlen ---------- */
export function zahl(text){
  let s=String(text||'').replace(/[\s%€]/g,'').replace(/[−–]/g,'-');
  if(s.includes(',')&&s.includes('.'))s=s.replace(/\./g,'');
  s=s.replace(',','.');
  return /^[+-]?\d*\.?\d+$/.test(s)?parseFloat(s):NaN;
}
const nah=(a,b,tol)=>Math.abs(a-b)<=tol+1e-9;
export function zahlFeedback(wert,{r,tol,fehler=[]}){
  if(Number.isNaN(wert))return {richtig:false,text:'Gib eine Zahl ein, zum Beispiel 2,4.'};
  const t=tol??Math.max(0.05,Math.abs(r)*0.01);
  if(nah(wert,r,t))return {richtig:true,text:''};
  const f=fehler.find(x=>nah(wert,x.wert,t));
  if(f)return {richtig:false,text:f.text};
  if(r!==0&&nah(wert,-r,t))return {richtig:false,text:'Prüfe das Vorzeichen: Steigt oder sinkt der Wert?'};
  if(r!==0&&(nah(wert,r/100,t/100)||nah(wert,r*100,t*100)))return {richtig:false,text:'Hast du Prozent und Dezimalzahl verwechselt? 0,05 sind 5 %.'};
  if(nah(wert,r,t*10))return {richtig:false,text:'Knapp daneben. Rechne noch einmal genau und prüfe die Rundung.'};
  return {richtig:false,text:'Deine Zahl liegt deutlich daneben. Schreib dir zuerst die Formel auf und setz dann die Werte ein.'};
}
