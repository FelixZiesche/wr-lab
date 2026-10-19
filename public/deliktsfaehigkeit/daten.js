// Deliktsfähigkeit: Gesetzestexte, Rechts-Navi (Prüfschema Haftung) und die Fälle der Fall-Akte.
// Gesetzestexte: Bürgerliches Gesetzbuch (BGB), amtliche Fassung von gesetze-im-internet.de, Stand Oktober 2026.
// Fälle nach den Unterrichtsmaterialien der Lehrkraft (Ben, Michael, Lisa, Marie, Simson), nach Thüringen verlegt
// und um neue Fälle ergänzt. Alle Personen sind erfunden.
import { FOTO, nachweis } from './fotos.js';

export const GESETZ={
  276:{p:'§ 276 Abs. 2 BGB',titel:'Fahrlässigkeit',t:'Fahrlässig handelt, wer die im Verkehr erforderliche Sorgfalt außer Acht lässt.'},
  823:{p:'§ 823 Abs. 1 BGB',titel:'Schadensersatzpflicht',t:'Wer vorsätzlich oder fahrlässig das Leben, den Körper, die Gesundheit, die Freiheit, das Eigentum oder ein sonstiges Recht eines anderen widerrechtlich verletzt, ist dem anderen zum Ersatz des daraus entstehenden Schadens verpflichtet.'},
  827:{p:'§ 827 BGB',titel:'Ausschluss und Minderung der Verantwortlichkeit',t:'Wer im Zustand der Bewusstlosigkeit oder in einem die freie Willensbestimmung ausschließenden Zustand krankhafter Störung der Geistestätigkeit einem anderen Schaden zufügt, ist für den Schaden nicht verantwortlich. Hat er sich durch geistige Getränke oder ähnliche Mittel in einen vorübergehenden Zustand dieser Art versetzt, so ist er für einen Schaden, den er in diesem Zustand widerrechtlich verursacht, in gleicher Weise verantwortlich, wie wenn ihm Fahrlässigkeit zur Last fiele; die Verantwortlichkeit tritt nicht ein, wenn er ohne Verschulden in den Zustand geraten ist.'},
  828:{p:'§ 828 BGB',titel:'Minderjährige',t:'(1) Wer nicht das siebente Lebensjahr vollendet hat, ist für einen Schaden, den er einem anderen zufügt, nicht verantwortlich. (2) Wer das siebente, aber nicht das zehnte Lebensjahr vollendet hat, ist für den Schaden, den er bei einem Unfall mit einem Kraftfahrzeug, einer Schienenbahn oder einer Schwebebahn einem anderen zufügt, nicht verantwortlich. Dies gilt nicht, wenn er die Verletzung vorsätzlich herbeigeführt hat. (3) Wer das 18. Lebensjahr noch nicht vollendet hat, ist, sofern seine Verantwortlichkeit nicht nach Absatz 1 oder 2 ausgeschlossen ist, für den Schaden, den er einem anderen zufügt, nicht verantwortlich, wenn er bei der Begehung der schädigenden Handlung nicht die zur Erkenntnis der Verantwortlichkeit erforderliche Einsicht hat.'},
  832:{p:'§ 832 Abs. 1 BGB',titel:'Haftung des Aufsichtspflichtigen',t:'Wer kraft Gesetzes zur Führung der Aufsicht über eine Person verpflichtet ist, die wegen Minderjährigkeit oder wegen ihres geistigen oder körperlichen Zustands der Beaufsichtigung bedarf, ist zum Ersatz des Schadens verpflichtet, den diese Person einem Dritten widerrechtlich zufügt. Die Ersatzpflicht tritt nicht ein, wenn er seiner Aufsichtspflicht genügt oder wenn der Schaden auch bei gehöriger Aufsichtsführung entstanden sein würde.'}
};

/* ---------- Rechts-Navi: Haftet die Person für den Schaden? ---------- */
const HAFTET=(t,titel)=>({art:'haftet',titel:titel||'Haftet',t});
const FREI=(t,titel)=>({art:'haftetnicht',titel:titel||'Haftet nicht',t});
export const NAVI={start:'schaden',schritte:{
  schaden:{frage:'Ist bei einem anderen ein Schaden entstanden – an Körper, Gesundheit oder Eigentum?',hilfe:'Ohne Schaden gibt es nichts zu ersetzen. Eigentum ist zum Beispiel ein Handy, ein Zaun oder ein Auto.',gesetz:GESETZ[823],antworten:[
    {t:'Ja',weiter:'verursacht'},
    {t:'Nein',ergebnis:FREI('Ohne Schaden gibt es keinen Schadensersatz (§ 823 Abs. 1 BGB).')}]},
  verursacht:{frage:'Hat die Person den Schaden durch ihr Handeln verursacht?',hilfe:'Zum Beispiel geschossen, gefahren, geworfen, fallen gelassen.',antworten:[
    {t:'Ja',weiter:'alter'},
    {t:'Nein, jemand anderes oder etwas anderes war es',ergebnis:FREI('Wer den Schaden nicht verursacht hat, muss ihn auch nicht ersetzen.')}]},
  alter:{frage:'Wie alt ist die Person?',hilfe:'Das Alter entscheidet, auf welcher Stufe der Deliktsfähigkeit sie steht.',gesetz:GESETZ[828],antworten:[
    {t:'Unter 7 Jahren',ergebnis:FREI('Das Kind ist deliktsunfähig (§ 828 Abs. 1 BGB).')},
    {t:'7 bis 9 Jahre',weiter:'verkehr'},
    {t:'10 bis 17 Jahre',weiter:'einsicht'},
    {t:'18 Jahre oder älter',weiter:'zustand'}]},
  verkehr:{frage:'War es ein Unfall mit einem fahrenden Auto, Motorrad, einer Straßenbahn oder einem Zug – und keine Absicht?',
    hilfe:'Kinder unter 10 können Tempo und Abstand von Fahrzeugen noch nicht sicher einschätzen. Bei einem parkenden Auto greift die Sonderregel meistens nicht, bei Absicht nie.',gesetz:GESETZ[828],antworten:[
    {t:'Ja, ein Unfall mit einem fahrenden Fahrzeug, ohne Absicht',ergebnis:FREI('Sonderregel im Straßenverkehr: Kinder von 7 bis 9 Jahren haften bei einem Unfall mit einem Kraftfahrzeug oder einer Bahn nicht (§ 828 Abs. 2 S. 1 BGB).')},
    {t:'Nein (kein solcher Unfall, ein parkendes Auto oder Absicht)',weiter:'einsicht'}]},
  einsicht:{frage:'Konnte die Person verstehen, dass ihr Handeln gefährlich ist und sie dafür geradestehen muss?',
    hilfe:'Das heißt Einsicht. Die meisten Kinder ab 7 haben sie, Jugendliche fast immer. Fehlt sie, muss der Minderjährige das beweisen.',gesetz:GESETZ[828],antworten:[
    {t:'Ja, sie hatte die nötige Einsicht',weiter:'zustand'},
    {t:'Nein, dafür war sie noch nicht weit genug',ergebnis:FREI('Ohne die nötige Einsicht ist der Minderjährige nicht verantwortlich (§ 828 Abs. 3 BGB).')}]},
  zustand:{frage:'War die Person bewusstlos oder wegen einer krankhaften Störung nicht in der Lage, frei zu entscheiden?',hilfe:'Wer sich selbst betrinkt oder Drogen nimmt, kann sich darauf nicht berufen.',gesetz:GESETZ[827],antworten:[
    {t:'Nein',weiter:'verschulden'},
    {t:'Ja, ohne eigene Schuld, zum Beispiel ohnmächtig',ergebnis:FREI('Wer bewusstlos ist, ist nicht verantwortlich (§ 827 S. 1 BGB).')},
    {t:'Ja, weil sie sich selbst betrunken gemacht oder Drogen genommen hat',ergebnis:HAFTET('Wer sich selbst in einen Rausch versetzt, haftet, als hätte er fahrlässig gehandelt (§ 827 S. 2 BGB).')}]},
  verschulden:{frage:'Hat die Person mit Absicht (Vorsatz) oder unvorsichtig (Fahrlässigkeit) gehandelt?',
    hilfe:'Fahrlässig handelt, wer die nötige Sorgfalt außer Acht lässt. Bei Kindern zählt, was man von einem Kind in diesem Alter erwarten kann.',gesetz:GESETZ[276],antworten:[
    {t:'Ja, mit Absicht oder unvorsichtig',ergebnis:HAFTET('Schaden, Handlung, Deliktsfähigkeit und Verschulden liegen vor: Die Person muss den Schaden ersetzen (§ 823 Abs. 1 BGB).')},
    {t:'Nein, sie war so vorsichtig, wie man es erwarten kann',ergebnis:FREI('Ohne Vorsatz oder Fahrlässigkeit gibt es keine Haftung (§ 823 Abs. 1 BGB).')}]}
}};

/* ---------- Fall-Akte ---------- */
// Wege durch den Navi: Index der richtigen Antwort pro Frage
const A={u7:0,s7:1,s10:2,ab18:3};
const bis=(alter,extra)=>({schaden:0,verursacht:0,alter,...extra});
const mitBild=f=>FOTO[f.foto]?{...f,bild:{src:FOTO[f.foto].src,alt:FOTO[f.foto].alt,nachweis:nachweis(f.foto)}}:f;
export const FAELLE=[
  {titel:'Ben, der Fußballer',icon:'sports_soccer',foto:'zaun',
    fakten:[['Wer','Ben, 5, und sein Kindergartenfreund'],['Wo','Garten in Apolda'],['Was','Fußball „über Bande“ gegen den Zaun des Nachbarn'],['Schaden','eine Zaunlatte ist locker']],
    text:'Der fünfjährige Ben spielt im Garten seines Kindergartenfreunds in Apolda Fußball. Der Zaun des Nachbarn eignet sich hervorragend, um „über Bande“ zu spielen – bis eine Zaunlatte locker ist. Der Nachbar kommt wutentbrannt aus dem Haus: „Die Reparatur bezahlt ihr mir!“',
    frage:'Müssen Ben und sein Freund für den Schaden aufkommen?',weg:bis(A.u7),
    tipps:{alter:'Wie alt sind Ben und sein Freund? Schau in § 828 Abs. 1 BGB.'},
    loesung:['Ben und sein Freund könnten nach § 823 Abs. 1 BGB verpflichtet sein, den Schaden am Zaun zu ersetzen.',
      'Dazu müssten sie deliktsfähig sein.',
      'Nach § 828 Abs. 1 BGB ist nicht verantwortlich, wer das siebente Lebensjahr noch nicht vollendet hat.',
      'Ben und sein Freund sind fünf Jahre alt, also deliktsunfähig.',
      'Ergebnis: Ben und sein Freund müssen den Schaden nicht ersetzen.'],
    denkWeiter:'Und die Eltern des Freundes? Sie haften nur, wenn sie ihre Aufsichtspflicht verletzt haben (§ 832 BGB). Zwei Fünfjährige, die im eigenen Garten Fußball spielen, muss man nicht ununterbrochen beobachten. Dann bleibt der Nachbar auf dem Schaden sitzen – es sei denn, die Haftpflichtversicherung der Familie zahlt freiwillig. Viele Versicherungen bieten das für Schäden durch kleine Kinder an.'},
  {titel:'Der unvernünftige Michael',icon:'fence',foto:'zaun',
    fakten:[['Wer','Michael, 16, Bens großer Bruder'],['Vorwissen','hat den lockeren Zaun am Vortag gesehen'],['Was','spielt trotzdem Fußball gegen den Zaun'],['Schaden','die Zaunlatte bricht']],
    text:'Bens großer Bruder Michael (16) hat das Spektakel mitbekommen. Trotzdem spielt er am nächsten Tag mit seinem Kumpel Fußball gegen denselben Zaun. Diesmal ist nicht nur eine Latte locker, sondern sie bricht. Der Nachbar kann es nicht fassen: Michael müsse doch vernünftiger sein als Ben.',
    frage:'Kann Michael für den kaputten Zaun verantwortlich gemacht werden?',weg:bis(A.s10,{einsicht:0,zustand:0,verschulden:0}),
    tipps:{alter:'Michael ist 16.',einsicht:'Michael hat am Vortag gesehen, was mit dem Zaun passiert. Konnte er verstehen, dass er für den Schaden geradestehen muss?',verschulden:'Michael wusste, dass der Zaun schon locker ist, und hat trotzdem dagegen geschossen.'},
    loesung:['Michael könnte nach § 823 Abs. 1 BGB verpflichtet sein, den Schaden am Zaun zu ersetzen.',
      'Durch seine Schüsse hat er das Eigentum des Nachbarn verletzt.',
      'Mit 16 Jahren ist Michael nach § 828 Abs. 3 BGB beschränkt deliktsfähig. Er haftet, wenn er die nötige Einsicht hatte.',
      'Michael hat am Vortag gesehen, dass der Zaun Schaden nimmt. Er konnte also verstehen, dass er für einen weiteren Schaden geradestehen muss.',
      'Weil er trotzdem gegen den Zaun geschossen hat, hat er mindestens fahrlässig gehandelt.',
      'Ergebnis: Michael muss den Schaden am Zaun ersetzen.'],
    denkWeiter:'Wer die Folgen kommen sieht und es trotzdem darauf ankommen lässt, handelt vielleicht sogar mit Vorsatz. Für das Ergebnis spielt das keine Rolle: Schadensersatz schuldet man bei Vorsatz und bei Fahrlässigkeit.'},
  {titel:'Die eilige Lisa',icon:'pedal_bike',foto:'fahrrad',
    fakten:[['Wer','Lisa, gerade 9 geworden'],['Wo','Schulweg in Weimar'],['Was','nimmt mit dem neuen Fahrrad einem Auto die Vorfahrt'],['Schaden','das Auto weicht aus und rammt ein parkendes Auto: 1.500 €']],
    text:'Lisa hat zu ihrem 9. Geburtstag ein neues Fahrrad bekommen und radelt am nächsten Morgen damit zur Schule in Weimar. Sie ist spät dran und nimmt einem Auto die Vorfahrt. Der Autofahrer muss ausweichen und fährt dabei ein am Straßenrand geparktes Auto an. Schaden: 1.500 €.',
    frage:'Muss Lisa das Geld bezahlen?',weg:bis(A.s7,{verkehr:0}),
    tipps:{alter:'Lisa ist gerade 9 geworden.',verkehr:'Das Auto, dem Lisa die Vorfahrt genommen hat, war in Fahrt. Hat Lisa absichtlich gehandelt?'},
    loesung:['Lisa könnte nach § 823 Abs. 1 BGB verpflichtet sein, den Schaden von 1.500 € zu ersetzen.',
      'Lisa ist neun Jahre alt.',
      'Nach § 828 Abs. 2 BGB ist nicht verantwortlich, wer zwischen 7 und 9 Jahre alt ist und den Schaden bei einem Unfall mit einem Kraftfahrzeug verursacht, es sei denn mit Absicht.',
      'Lisa hat den Unfall mit einem fahrenden Auto verursacht, und zwar nicht mit Absicht.',
      'Ergebnis: Lisa muss den Schaden nicht bezahlen.'],
    denkWeiter:'Wäre Lisa schon 10 gewesen, hätte die Sonderregel nicht gegriffen. Dann käme es auf ihre Einsicht an (§ 828 Abs. 3 BGB) – und die hat eine Zehnjährige, die mit dem Rad zur Schule fährt, in aller Regel.'},
  {titel:'Die immer noch eilige Lisa',icon:'directions_car',foto:'nebel',
    fakten:[['Wer','Lisa, inzwischen 19, mit Autoführerschein'],['Wetter','dichter Nebel'],['Was','viel zu schnell, übersieht einen Radfahrer'],['Schaden','Unfall mit dem Radfahrer']],
    text:'Lisas Zeitmanagement ändert sich auch mit 19 Jahren und Autoführerschein nicht. Sie ist trotz dichten Nebels auf der Landstraße bei Weimar viel zu schnell unterwegs, übersieht einen Radfahrer und verursacht einen Unfall.',
    frage:'Muss Lisa jetzt die Verantwortung tragen?',weg:bis(A.ab18,{zustand:0,verschulden:0}),
    tipps:{alter:'Lisa ist inzwischen 19.',verschulden:'Wer bei Nebel viel zu schnell fährt, lässt die nötige Sorgfalt außer Acht.'},
    loesung:['Lisa könnte nach § 823 Abs. 1 BGB verpflichtet sein, den Schaden des Radfahrers zu ersetzen.',
      'Sie hat den Radfahrer und sein Fahrrad verletzt.',
      'Mit 19 Jahren greift keine Ausnahme aus §§ 827, 828 BGB, Lisa ist voll deliktsfähig.',
      'Bei Nebel viel zu schnell zu fahren, lässt die im Verkehr erforderliche Sorgfalt außer Acht. Lisa hat fahrlässig gehandelt (§ 276 Abs. 2 BGB).',
      'Ergebnis: Lisa muss den Schaden ersetzen.'],
    denkWeiter:'Bezahlen wird den Schaden die Kfz-Haftpflichtversicherung des Autos. Sie ist für jedes Auto Pflicht, damit Unfallopfer ihr Geld sicher bekommen.'},
  {titel:'Die hilfsbereite Marie',icon:'coffee',foto:'tassen',
    fakten:[['Wer','Marie, 8'],['Wo','Kaffeetrinken bei Freunden in Jena'],['Was','will beim Abräumen helfen und trägt einen Stapel Tassen'],['Schaden','die oberste Tasse zerbricht']],
    text:'Marie (8) ist mit ihrer Mutter bei Freunden in Jena zum Kaffeetrinken. Eifrig möchte sie beim Abräumen helfen. Wie ihre Mutter stapelt sie ein paar Tassen und will sie in die Küche tragen. Doch der Stapel ist für Marie zu hoch: Die oberste Tasse fällt zu Boden und zerbricht.',
    frage:'Muss Marie für die Tasse aufkommen?',weg:bis(A.s7,{verkehr:1,einsicht:0,zustand:0,verschulden:1}),
    tipps:{alter:'Marie ist 8.',verkehr:'Hat die Tasse etwas mit einem Unfall im Straßenverkehr zu tun?',einsicht:'Weiß eine Achtjährige, dass Tassen zerbrechen und dass man für Kaputtes geradestehen muss? Meistens schon. Die spannende Frage kommt erst danach.',
      verschulden:'Marie wollte helfen und hat es gemacht wie ihre Mutter. Kann man von einer Achtjährigen erwarten, dass sie die Höhe des Stapels richtig einschätzt?'},
    loesung:['Marie könnte nach § 823 Abs. 1 BGB verpflichtet sein, den Schaden an der Tasse zu ersetzen.',
      'Mit 8 Jahren ist Marie beschränkt deliktsfähig. Eine Achtjährige versteht in der Regel, dass Geschirr zerbrechen kann (§ 828 Abs. 3 BGB).',
      'Haften müsste sie aber nur, wenn sie fahrlässig gehandelt hat. Maßstab ist, was man von einem Kind in ihrem Alter erwarten kann.',
      'Marie hat es gut gemeint und es so gemacht wie ihre Mutter. Dass der Stapel für ihre Hände zu hoch ist, kann eine Achtjährige nicht sicher überblicken.',
      'Ergebnis: Marie muss für die Tasse nicht aufkommen.'],
    denkWeiter:'Hätte Marie aus Wut eine Tasse auf den Boden geworfen, wäre es anders: Das wäre Vorsatz – und für die Folgen kann eine Achtjährige geradestehen.'},
  {titel:'Party-Crash in Weimar',icon:'celebration',foto:'party',
    fakten:[['Wer','Tom, 17'],['Wo','Geburtstagsparty in Weimar'],['Was','hat sich betrunken, stolpert gegen die Musikbox'],['Schaden','Musikbox kaputt: 250 €']],
    text:'Tom (17) ist auf der Geburtstagsparty eines Kumpels in Weimar. Er trinkt sich mit Wodka-Energy betrunken, tanzt wild und stößt die Musikbox des Gastgebers vom Tisch. Am nächsten Tag sagt er: „Ich war doch total betrunken, ich weiß gar nichts mehr.“',
    frage:'Muss Tom die Musikbox bezahlen?',weg:bis(A.s10,{einsicht:0,zustand:2}),
    tipps:{einsicht:'Tom ist 17. Kann ein Siebzehnjähriger verstehen, dass er für einen Schaden geradestehen muss?',zustand:'Tom war nicht ohnmächtig, sondern betrunken – und zwar durch eigene Schuld. Lies § 827 Satz 2 BGB.'},
    loesung:['Tom könnte nach § 823 Abs. 1 BGB verpflichtet sein, die Musikbox zu ersetzen.',
      'Mit 17 Jahren ist Tom beschränkt deliktsfähig und hat die nötige Einsicht (§ 828 Abs. 3 BGB).',
      'Er war betrunken. Wer sich durch Alkohol selbst in einen Rausch versetzt, ist nach § 827 S. 2 BGB trotzdem verantwortlich, als hätte er fahrlässig gehandelt.',
      'Ergebnis: Tom muss die Musikbox bezahlen.'],
    denkWeiter:'Anders wäre es, wenn ihm jemand heimlich etwas ins Getränk gemischt hätte: Dann wäre Tom ohne eigene Schuld in den Rausch geraten und müsste nicht haften (§ 827 S. 2 Halbsatz 2 BGB). Übrigens: Branntwein wie Wodka darf an Jugendliche unter 18 gar nicht abgegeben werden (§ 9 JuSchG).'},
  {titel:'Böller im Briefkasten',icon:'local_fire_department',foto:'silvester',
    fakten:[['Wer','Noah, 13'],['Wann','Silvester, Jena'],['Was','steckt einen gezündeten Böller in den Briefkasten des Nachbarn'],['Schaden','Briefkasten und Post zerstört: 120 €']],
    text:'Silvester in Jena: Noah (13) findet es witzig, einen gezündeten Böller in den Briefkasten des Nachbarn zu stecken. Der Briefkasten fliegt auseinander, die Post darin verbrennt. Noahs Eltern waren auf einer Silvesterfeier zwei Häuser weiter.',
    frage:'Muss Noah den Briefkasten bezahlen?',weg:bis(A.s10,{einsicht:0,zustand:0,verschulden:0}),
    tipps:{einsicht:'Ein Dreizehnjähriger weiß, dass ein Böller einen Briefkasten zerfetzt. Hat er die nötige Einsicht?',verschulden:'Noah wollte, dass es knallt – mit Absicht.'},
    loesung:['Noah könnte nach § 823 Abs. 1 BGB verpflichtet sein, den Briefkasten zu ersetzen.',
      'Er hat das Eigentum des Nachbarn zerstört.',
      'Mit 13 Jahren ist Noah beschränkt deliktsfähig. Ein Dreizehnjähriger kann verstehen, dass ein Böller im Briefkasten Schaden anrichtet und er dafür geradestehen muss (§ 828 Abs. 3 BGB).',
      'Noah hat den Böller mit Absicht in den Briefkasten gesteckt, also vorsätzlich gehandelt.',
      'Ergebnis: Noah muss den Schaden ersetzen.'],
    denkWeiter:'Haften auch die Eltern? Einen Dreizehnjährigen muss man an Silvester nicht an der Hand halten. Haben sie ihm aber Böller gegeben und ihn ohne Absprache losziehen lassen, kann das ihre Aufsichtspflicht verletzen (§ 832 BGB). Dann haften Noah und seine Eltern nebeneinander.'},
  {titel:'E-Scooter auf dem Gehweg',icon:'electric_scooter',foto:'escooter',
    fakten:[['Wer','Mia, 15'],['Wo','Gehweg in der Innenstadt von Jena'],['Was','fährt mit dem E-Scooter auf dem Gehweg, schaut aufs Handy'],['Schaden','Fußgänger stürzt, Brille kaputt: 300 €']],
    text:'Mia (15) fährt mit ihrem eigenen E-Scooter durch die Innenstadt von Jena – auf dem Gehweg, weil es schneller geht. Dabei schaut sie aufs Handy und rammt einen Fußgänger. Er stürzt, seine Brille geht kaputt.',
    frage:'Muss Mia für den Schaden aufkommen?',weg:bis(A.s10,{einsicht:0,zustand:0,verschulden:0}),
    tipps:{einsicht:'E-Scooter fahren darf man ab 14. Wer fahren darf, kann auch verstehen, dass er für Unfälle geradestehen muss.',verschulden:'Auf dem Gehweg fahren und dabei aufs Handy schauen – ist das sorgfältig?'},
    loesung:['Mia könnte nach § 823 Abs. 1 BGB verpflichtet sein, den Schaden des Fußgängers zu ersetzen.',
      'Sie hat den Fußgänger verletzt und seine Brille beschädigt.',
      'Mit 15 Jahren ist Mia beschränkt deliktsfähig. Wer mit 14 E-Scooter fahren darf, kann verstehen, dass er für Unfälle verantwortlich ist (§ 828 Abs. 3 BGB).',
      'Auf dem Gehweg zu fahren und dabei aufs Handy zu schauen, lässt die nötige Sorgfalt außer Acht. Mia hat fahrlässig gehandelt (§ 276 Abs. 2 BGB).',
      'Ergebnis: Mia muss den Schaden ersetzen.'],
    denkWeiter:'Ein E-Scooter braucht eine Versicherungsplakette, so wie ein Moped ein Versicherungskennzeichen. Die Versicherung zahlt dem Fußgänger seinen Schaden – haften muss trotzdem Mia. Und auf dem Gehweg hat ein E-Scooter nichts zu suchen.'}
].map(mitBild);

/* ---------- Ihr seid das Gericht: Straßenverkehr ---------- */
export const GERICHT=[
  {id:'paul-gericht',titel:'Fahrrad gegen parkendes Auto',foto:'parkplatz',
    fall:'Paul (9) fährt mit dem Fahrrad über den Markt in Apolda und schaut sich nach seinem Freund um. Dabei kracht er gegen ein ordnungsgemäß geparktes Auto. Der Lack ist verkratzt: 800 €.',
    frage:'Muss Paul den Kratzer bezahlen?',optionen:['Nein, mit 9 ist er im Straßenverkehr geschützt','Ja, die Sonderregel greift hier nicht – Paul war unaufmerksam','Nein, seine Eltern müssen zahlen'],r:1,
    e:'Der Bundesgerichtshof hat 2004 entschieden: Die Sonderregel des § 828 Abs. 2 BGB soll Kinder vor der Überforderung durch den fließenden Verkehr schützen. Ein parkendes Auto überfordert ein Kind nicht. Also kommt es auf die Einsicht an (§ 828 Abs. 3 BGB), und die hat ein Neunjähriger in der Regel. Paul haftet.'},
  {id:'emma-gericht',titel:'Stein von der Brücke',foto:'bruecke',
    fall:'Emma (8) wirft von einer Fußgängerbrücke in Gera absichtlich einen Stein auf ein fahrendes Auto, „um zu sehen, was passiert“. Die Frontscheibe hat einen Riss: 900 €.',
    frage:'Muss Emma für die Scheibe aufkommen?',optionen:['Nein, mit 8 ist sie im Straßenverkehr geschützt','Nein, Kinder unter 10 haften nie','Ja, die Sonderregel gilt nicht bei Absicht'],r:2,
    e:'§ 828 Abs. 2 S. 2 BGB: Die Sonderregel gilt nicht, wenn das Kind die Verletzung vorsätzlich herbeigeführt hat. Dass ein Stein eine Scheibe zerschlägt, versteht eine Achtjährige (§ 828 Abs. 3 BGB). Emma haftet.'},
  {id:'jonas-gericht',titel:'Dem Ball hinterher',foto:'ball',
    fall:'Jonas (9) rennt in Jena hinter seinem Ball auf die Straße, ohne zu schauen. Ein Autofahrer weicht aus und kracht in eine Laterne. Am Auto und an der Laterne entsteht ein Schaden von 2.000 €.',
    frage:'Muss Jonas den Schaden bezahlen?',optionen:['Ja, er hätte schauen müssen','Nein, die Sonderregel im Straßenverkehr schützt ihn','Ja, aber nur die Hälfte'],r:1,
    e:'Jonas ist 9, und es war ein Unfall mit einem fahrenden Auto, keine Absicht. Genau dafür gilt § 828 Abs. 2 BGB: Kinder unter 10 können Tempo und Abstand eines Autos noch nicht sicher einschätzen. Jonas haftet nicht.'},
  {id:'lisa-gericht',titel:'Lisa mit 19',foto:'nebel',
    fall:'Lisa ist inzwischen 19 und hat den Autoführerschein. Trotz dichten Nebels fährt sie viel zu schnell, übersieht einen Radfahrer und verursacht einen Unfall.',
    frage:'Muss Lisa jetzt für den Schaden geradestehen?',optionen:['Nein, sie hat es nicht absichtlich gemacht','Ja, sie ist voll deliktsfähig und hat fahrlässig gehandelt','Nein, Unfälle zahlt immer die Versicherung'],r:1,
    e:'Mit 19 greift keine Ausnahme mehr: Lisa ist voll deliktsfähig. Bei Nebel zu schnell zu fahren ist fahrlässig (§ 276 Abs. 2 BGB). Sie haftet nach § 823 Abs. 1 BGB. Bezahlen wird ihre Kfz-Haftpflichtversicherung – haften muss trotzdem Lisa.'}
];
