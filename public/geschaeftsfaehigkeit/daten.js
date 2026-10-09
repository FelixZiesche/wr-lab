// Geschäftsfähigkeit: Gesetzestexte, Rechts-Navi, Fälle, Altersgrenzen und Fotos.
// Gesetzestexte: Bürgerliches Gesetzbuch (BGB), amtliche Fassung von gesetze-im-internet.de, Stand Oktober 2026.

export const GESETZ={
  1:{p:'§ 1 BGB',titel:'Beginn der Rechtsfähigkeit',t:'Die Rechtsfähigkeit des Menschen beginnt mit der Vollendung der Geburt.'},
  2:{p:'§ 2 BGB',titel:'Eintritt der Volljährigkeit',t:'Die Volljährigkeit tritt mit der Vollendung des 18. Lebensjahres ein.'},
  104:{p:'§ 104 BGB',titel:'Geschäftsunfähigkeit',t:'Geschäftsunfähig ist: 1. wer nicht das siebente Lebensjahr vollendet hat, 2. wer sich in einem die freie Willensbestimmung ausschließenden Zustand krankhafter Störung der Geistestätigkeit befindet, sofern nicht der Zustand seiner Natur nach ein vorübergehender ist.'},
  105:{p:'§ 105 BGB',titel:'Nichtigkeit der Willenserklärung',t:'(1) Die Willenserklärung eines Geschäftsunfähigen ist nichtig. (2) Nichtig ist auch eine Willenserklärung, die im Zustand der Bewusstlosigkeit oder vorübergehender Störung der Geistestätigkeit abgegeben wird.'},
  106:{p:'§ 106 BGB',titel:'Beschränkte Geschäftsfähigkeit Minderjähriger',t:'Ein Minderjähriger, der das siebente Lebensjahr vollendet hat, ist nach Maßgabe der §§ 107 bis 113 in der Geschäftsfähigkeit beschränkt.'},
  107:{p:'§ 107 BGB',titel:'Einwilligung des gesetzlichen Vertreters',t:'Der Minderjährige bedarf zu einer Willenserklärung, durch die er nicht lediglich einen rechtlichen Vorteil erlangt, der Einwilligung seines gesetzlichen Vertreters.'},
  108:{p:'§ 108 BGB',titel:'Vertragsschluss ohne Einwilligung',t:'(1) Schließt der Minderjährige einen Vertrag ohne die erforderliche Einwilligung des gesetzlichen Vertreters, so hängt die Wirksamkeit des Vertrags von der Genehmigung des Vertreters ab. (2) Fordert der andere Teil den Vertreter zur Erklärung über die Genehmigung auf, so kann die Erklärung nur ihm gegenüber erfolgen; eine vor der Aufforderung dem Minderjährigen gegenüber erklärte Genehmigung oder Verweigerung der Genehmigung wird unwirksam. Die Genehmigung kann nur bis zum Ablauf von zwei Wochen nach dem Empfang der Aufforderung erklärt werden; wird sie nicht erklärt, so gilt sie als verweigert. (3) Ist der Minderjährige unbeschränkt geschäftsfähig geworden, so tritt seine Genehmigung an die Stelle der Genehmigung des Vertreters.'},
  110:{p:'§ 110 BGB',titel:'Bewirken der Leistung mit eigenen Mitteln',t:'Ein von dem Minderjährigen ohne Zustimmung des gesetzlichen Vertreters geschlossener Vertrag gilt als von Anfang an wirksam, wenn der Minderjährige die vertragsmäßige Leistung mit Mitteln bewirkt, die ihm zu diesem Zweck oder zu freier Verfügung von dem Vertreter oder mit dessen Zustimmung von einem Dritten überlassen worden sind.'},
  113:{p:'§ 113 BGB',titel:'Dienst- oder Arbeitsverhältnis',t:'(1) Ermächtigt der gesetzliche Vertreter den Minderjährigen, in Dienst oder in Arbeit zu treten, so ist der Minderjährige für solche Rechtsgeschäfte unbeschränkt geschäftsfähig, welche die Eingehung oder Aufhebung eines Dienst- oder Arbeitsverhältnisses der gestatteten Art oder die Erfüllung der sich aus einem solchen Verhältnis ergebenden Verpflichtungen betreffen. Ausgenommen sind Verträge, zu denen der Vertreter der Genehmigung des Familiengerichts bedarf. (2) Die Ermächtigung kann von dem Vertreter zurückgenommen oder eingeschränkt werden. (3) […] (4) Die für einen einzelnen Fall erteilte Ermächtigung gilt im Zweifel als allgemeine Ermächtigung zur Eingehung von Verhältnissen derselben Art.'}
};

/* ---------- Rechts-Navi: das Prüfschema ---------- */
export const NAVI={start:'person',schritte:{
  person:{frage:'Wer schließt das Geschäft ab?',hilfe:'Das Alter entscheidet, auf welcher Stufe der Geschäftsfähigkeit jemand steht.',gesetz:GESETZ[104],antworten:[
    {t:'Ein Kind unter 7 Jahren',ergebnis:{art:'unwirksam',titel:'Nichtig',t:'Das Kind ist geschäftsunfähig (§ 104 Nr. 1 BGB), seine Willenserklärung ist nichtig (§ 105 BGB).'}},
    {t:'Jemand, der dauerhaft geisteskrank ist',ergebnis:{art:'unwirksam',titel:'Nichtig',t:'Die Person ist geschäftsunfähig (§ 104 Nr. 2 BGB), ihre Willenserklärung ist nichtig (§ 105 BGB).'}},
    {t:'Jemand ab 18 Jahren',ergebnis:{art:'wirksam',t:'Die Person ist volljährig und voll geschäftsfähig (§ 2 BGB).'}},
    {t:'Jemand von 7 bis 17 Jahren',weiter:'vorteil'}]},
  vorteil:{frage:'Bringt das Geschäft nur einen rechtlichen Vorteil?',hilfe:'Nur Vorteil heißt: Man bekommt etwas und muss nichts zahlen oder tun – zum Beispiel ein Geschenk. Wirtschaftlich günstig reicht nicht.',gesetz:GESETZ[107],antworten:[
    {t:'Ja, nur Vorteil (zum Beispiel ein Geschenk)',ergebnis:{art:'wirksam',t:'Lediglich rechtlicher Vorteil, die Eltern müssen nicht zustimmen (§ 107 BGB).'}},
    {t:'Nein, es entstehen Pflichten (zum Beispiel zahlen)',weiter:'einwilligung'}]},
  einwilligung:{frage:'Haben die Eltern vorher zugestimmt (Einwilligung)?',hilfe:'Die Einwilligung gilt nur für das, wozu die Eltern Ja gesagt haben.',gesetz:GESETZ[107],antworten:[
    {t:'Ja, genau zu diesem Geschäft',ergebnis:{art:'wirksam',t:'Die Eltern als gesetzliche Vertreter haben eingewilligt (§ 107 BGB).'}},
    {t:'Nein',weiter:'taschengeld'}]},
  taschengeld:{frage:'Wird sofort und vollständig mit eigenem Geld bezahlt, das zur freien Verfügung oder genau für diesen Zweck überlassen wurde?',
    hilfe:'Zum Beispiel Taschengeld oder Lohn. Raten, Abos und „später bezahlen“ zählen nicht – und gegen das ausdrückliche Nein der Eltern hilft es auch nicht.',gesetz:GESETZ[110],antworten:[
    {t:'Ja, sofort bezahlt mit eigenem Geld',ergebnis:{art:'wirksam',t:'Taschengeldparagraf (§ 110 BGB).'}},
    {t:'Nein (Raten, Abo, fremdes Geld oder gegen den Willen der Eltern)',weiter:'job'}]},
  job:{frage:'Geht es um einen Job, den die Eltern erlaubt haben – etwa Arbeitsvertrag, Kündigung oder Lohnkonto?',hilfe:'Käufe vom Lohn gehören nicht dazu, die laufen über § 110 BGB.',gesetz:GESETZ[113],antworten:[
    {t:'Ja, es geht um den erlaubten Job',ergebnis:{art:'wirksam',t:'Für Geschäfte rund um den erlaubten Job ist die Person voll geschäftsfähig (§ 113 BGB).'}},
    {t:'Nein',weiter:'genehmigung'}]},
  genehmigung:{frage:'Ohne Zustimmung ist der Vertrag schwebend unwirksam. Wie geht es weiter?',hilfe:'Bis zur Entscheidung hängt der Vertrag in der Schwebe (§ 108 Abs. 1 BGB).',gesetz:GESETZ[108],antworten:[
    {t:'Die Eltern genehmigen nachträglich',ergebnis:{art:'wirksam',t:'Nachträgliche Genehmigung der Eltern (§ 108 Abs. 1 BGB).'}},
    {t:'Die Eltern verweigern die Genehmigung',ergebnis:{art:'unwirksam',titel:'Endgültig unwirksam',t:'Die Eltern haben die Genehmigung verweigert (§ 108 Abs. 1 BGB). Ware und Geld gehen zurück.'}},
    {t:'Die Person ist inzwischen 18 und entscheidet selbst',ergebnis:{art:'wirksam',t:'Genehmigt die nun volljährige Person den Vertrag, ist er wirksam (§ 108 Abs. 3 BGB).'}},
    {t:'Es hat noch niemand entschieden',ergebnis:{art:'schwebend',t:'Bis die Eltern entscheiden, bleibt der Vertrag schwebend unwirksam (§ 108 Abs. 1 BGB).'}}]}
}};

/* ---------- Fall-Akte (Fälle aus dem Unterricht, nach Thüringen verlegt) ----------
   weg: richtige Antwort pro Frage des Navis (Index in NAVI.schritte[...].antworten) */
const P={u7:0,krank:1,ab18:2,minder:3};
export const FAELLE=[
  {titel:'Der geisteskranke Franz',icon:'tv',
    text:'Der 30-jährige, gepflegt aussehende und unerkannt geisteskranke Franz kauft im Elektromarkt im Thüringen-Park Erfurt einen Fernseher für 2.000 €. Er bezahlt bar und beschädigt den Fernseher beim Aufbauen. Seine Betreuerin bringt den Fernseher zurück und möchte das Geld zurückhaben.',
    frage:'Kann sie das Geld zurückfordern?',weg:{person:P.krank},
    tipps:{person:'Franz ist zwar 30 – aber er ist dauerhaft geisteskrank. Was sagt § 104 Nr. 2 BGB?'},
    loesung:'Nach § 104 Nr. 2 BGB ist Franz geschäftsunfähig, weil er sich dauerhaft in einem Zustand krankhafter Störung der Geistestätigkeit befindet und seinen Willen nicht frei bilden kann. Seine Willenserklärung ist nach § 105 Abs. 1 BGB nichtig, ein Kaufvertrag ist nie entstanden. Die Betreuerin kann das Geld zurückfordern; dafür gibt sie den Fernseher zurück.',
    denkWeiter:'Dass Franz gesund aussah, spielt keine Rolle: Das Gesetz schützt Geschäftsunfähige, auch wenn der Händler nichts merken konnte. Kleine Alltagsgeschäfte eines volljährigen Geschäftsunfähigen, etwa ein Brötchen beim Bäcker, gelten dagegen als wirksam, sobald beide Seiten geleistet haben (§ 105a BGB).'},
  {titel:'Der kleine Max',icon:'sports_soccer',
    text:'Der 6-jährige Max tauscht auf dem Spielplatz in Apolda mit dem gleichaltrigen Moritz ein kleines Spielzeugauto gegen einen Original-Ball der Fußball-WM 2026.',
    frage:'Können die Eltern den ungleichen Tausch rückgängig machen?',weg:{person:P.u7},
    tipps:{person:'Wie alt sind Max und Moritz? Schau in § 104 Nr. 1 BGB.'},
    loesung:'Nach § 104 Nr. 1 BGB sind beide Sechsjährigen geschäftsunfähig. Ihre Willenserklärungen sind nach § 105 Abs. 1 BGB nichtig, der Tausch ist nie wirksam geworden. Die Eltern können Auto und Ball zurücktauschen lassen.',
    denkWeiter:'Selbst wenn Max bei dem Tausch nur gewinnt: Wer jünger als 7 ist, kann gar keine wirksame Willenserklärung abgeben – auch keine vorteilhafte. Geschenke für kleine Kinder nehmen die Eltern an.'},
  {titel:'Das Halloween-Kostüm',icon:'theater_comedy',
    text:'Herr Gutmütig, der Nachbar, schenkt der 10-jährigen Emma ein neues Halloween-Kostüm – ohne dass ihre Eltern davon wissen.',
    frage:'Darf Emma das Kostüm behalten?',weg:{person:P.minder,vorteil:0},
    tipps:{person:'Emma ist 10 Jahre alt.',vorteil:'Muss Emma für das Kostüm etwas zahlen oder sonst etwas tun?'},
    loesung:'Nach § 106 BGB ist Emma beschränkt geschäftsfähig. Eigentlich bräuchte sie die Einwilligung ihrer Eltern (§ 107 BGB). Die Schenkung bringt ihr aber lediglich einen rechtlichen Vorteil: Sie bekommt das Kostüm und muss nichts dafür tun. Deshalb ist das Geschäft ohne Zustimmung der Eltern wirksam (§ 107 BGB). Emma darf das Kostüm behalten.'},
  {titel:'Simon, der Kredithai',icon:'account_balance',
    text:'Dem sehr guten 17-jährigen Wirtschaft-und-Recht-Schüler Simon gelingt es, bei einer Sparkasse in Weimar einen zinslosen Kredit über 50.000 € zu bekommen. Seine Eltern sind entsetzt und sagen klar Nein.',
    frage:'Wie ist die Rechtslage?',weg:{person:P.minder,vorteil:1,einwilligung:1,taschengeld:1,job:1,genehmigung:1},
    tipps:{person:'Simon ist 17.',vorteil:'Ein zinsloser Kredit ist wirtschaftlich günstig. Aber muss Simon das Geld zurückzahlen?',einwilligung:'Wussten die Eltern vorher davon und waren einverstanden?',taschengeld:'Simon bezahlt hier nichts, er bekommt Geld – und muss es später zurückzahlen.',job:'Hat der Kredit etwas mit einem Job zu tun?',genehmigung:'Wie reagieren die Eltern?'},
    loesung:'Nach § 106 BGB ist Simon beschränkt geschäftsfähig. Der zinslose Kredit ist zwar wirtschaftlich günstig, bringt aber einen rechtlichen Nachteil: Simon muss das Geld zurückzahlen. Es ist also kein lediglich rechtlicher Vorteil (§ 107 BGB). Eine Einwilligung der Eltern fehlt, deshalb ist der Vertrag schwebend unwirksam (§ 108 Abs. 1 BGB). Weil die Eltern die Genehmigung verweigern, ist er endgültig unwirksam.',
    denkWeiter:'Selbst mit Zustimmung der Eltern ginge es nicht so einfach: Für einen Kredit eines Kindes brauchen sogar die Eltern die Genehmigung des Familiengerichts (§ 1643 Abs. 1 in Verbindung mit § 1854 Nr. 2 BGB).'},
  {titel:'Jeanskauf',icon:'shopping_bag',
    text:'Die 15-jährige Maya möchte sich in der Goethe Galerie in Jena eine neue Jeans kaufen. Ihre Mama ist damit einverstanden und gibt ihr 60 € dafür mit. Maya kauft sich eine Hose.',
    frage:'Ist der Kauf wirksam?',weg:{person:P.minder,vorteil:1,einwilligung:0},
    tipps:{person:'Maya ist 15.',vorteil:'Maya bekommt die Jeans – aber was muss sie dafür tun?',einwilligung:'Was hat Mama vorher gesagt?'},
    loesung:'Nach § 106 BGB ist Maya beschränkt geschäftsfähig. Der Kauf bringt ihr nicht nur einen Vorteil, denn sie muss bezahlen. Sie braucht deshalb die Einwilligung ihrer Mutter (§ 107 BGB). Die liegt vor: Die Mutter hat dem Jeanskauf vorher zugestimmt. Der Kauf ist wirksam.'},
  {titel:'Neue Nikes',icon:'steps',
    text:'In der Goethe Galerie sieht Maya im Schaufenster die neuen Nike Air Force 1. Sie kauft die Sneaker statt der Jeans – mit dem Geld, das ihr die Mutter für die Hose gegeben hat. Die alten Jeans kann man ja noch tragen. Ihre Mutter ist auch hinterher nicht einverstanden.',
    frage:'Ist der Kauf wirksam?',weg:{person:P.minder,vorteil:1,einwilligung:1,taschengeld:1,job:1,genehmigung:1},
    tipps:{vorteil:'Maya muss für die Sneaker bezahlen.',einwilligung:'Mama hat Ja gesagt – aber wozu genau?',taschengeld:'Das Geld war für die Jeans bestimmt, nicht zur freien Verfügung.',job:'Hat der Kauf etwas mit einem Job zu tun?',genehmigung:'Wie reagiert die Mutter hinterher?'},
    loesung:'Nach § 106 BGB ist Maya beschränkt geschäftsfähig und braucht für den Kauf die Einwilligung ihrer Mutter (§ 107 BGB). Die Mutter hat aber nur dem Jeanskauf zugestimmt, nicht den Sneakern. Auch § 110 BGB hilft nicht: Das Geld war für die Jeans bestimmt. Der Kauf ist deshalb schwebend unwirksam (§ 108 Abs. 1 BGB). Weil die Mutter die Genehmigung verweigert, ist er endgültig unwirksam.'},
  {titel:'Boombox I',icon:'speaker',
    text:'Finn (17) kauft im Elektromarkt in Erfurt eine große Boombox für 400 € auf Raten – für seine 18. Geburtstagsfeier, die er mit seinem Kumpel Max feiert. Zu Hause zeigt er seinen Eltern die Anlage. Sie sind erst nicht begeistert, einigen sich dann aber darauf, sie Finn zu schenken und die Raten zu übernehmen.',
    frage:'Ist der Kauf wirksam?',weg:{person:P.minder,vorteil:1,einwilligung:1,taschengeld:1,job:1,genehmigung:0},
    tipps:{vorteil:'Finn muss die Raten bezahlen.',einwilligung:'Wussten die Eltern vor dem Kauf davon?',taschengeld:'Raten sind nicht sofort bezahlt.',job:'Hat der Kauf etwas mit einem Job zu tun?',genehmigung:'Was beschließen die Eltern zu Hause?'},
    loesung:'Nach § 106 BGB ist Finn beschränkt geschäftsfähig. Für den Ratenkauf fehlt die Einwilligung der Eltern (§ 107 BGB), und § 110 BGB greift nicht, weil Finn nicht sofort bezahlt. Der Kauf ist zunächst schwebend unwirksam. Weil die Eltern ihn nachträglich genehmigen, wird er wirksam (§ 108 Abs. 1 BGB).'},
  {titel:'Boombox II',icon:'speaker',
    text:'Gleiche Boombox, gleicher Ratenkauf. Diesmal zeigt Finn seinen Eltern die Anlage erst nach der Feier – da ist er schon 18. Die Eltern sind überhaupt nicht einverstanden. Finn will die Box aber unbedingt behalten.',
    frage:'Ist der Kauf wirksam?',weg:{person:P.minder,vorteil:1,einwilligung:1,taschengeld:1,job:1,genehmigung:2},
    tipps:{person:'Entscheidend ist das Alter beim Kauf – da war Finn noch 17.',vorteil:'Finn muss die Raten bezahlen.',einwilligung:'Wussten die Eltern vor dem Kauf davon?',taschengeld:'Raten sind nicht sofort bezahlt.',job:'Hat der Kauf etwas mit einem Job zu tun?',genehmigung:'Wie alt ist Finn, als über den Vertrag entschieden wird – und wer entscheidet dann?'},
    loesung:'Beim Kauf war Finn 17 und damit beschränkt geschäftsfähig (§ 106 BGB). Ohne Einwilligung der Eltern war der Ratenkauf schwebend unwirksam (§ 108 Abs. 1 BGB). Inzwischen ist Finn 18 und voll geschäftsfähig. Jetzt entscheidet er selbst: Seine Genehmigung tritt an die Stelle der Genehmigung der Eltern (§ 108 Abs. 3 BGB). Weil er die Box behalten will, genehmigt er den Kauf. Der Kauf ist wirksam – was die Eltern sagen, spielt keine Rolle mehr.'}
];

/* ---------- Altersschieber ---------- */
export const STUFEN=[
  {bis:6,id:'unfaehig',titel:'Geschäftsunfähig',p:'§ 104 Nr. 1, § 105 BGB',kurz:'Was du allein abschließt, ist nichtig – sogar der Kauf von Gummibärchen.',darf:'Allein gar nichts. Kaufen kannst du trotzdem: wenn deine Eltern dich als Botin oder Boten schicken.'},
  {bis:17,id:'beschraenkt',titel:'Beschränkt geschäftsfähig',p:'§§ 106–113 BGB',kurz:'Für Verträge brauchst du die Zustimmung deiner Eltern – mit drei Ausnahmen.',darf:'Geschenke annehmen, vom Taschengeld sofort bezahlen und Geschäfte rund um einen erlaubten Job. Alles andere nur mit Einwilligung oder Genehmigung der Eltern.'},
  {bis:200,id:'voll',titel:'Voll geschäftsfähig',p:'§ 2 BGB',kurz:'Du bist volljährig und schließt alle Verträge allein ab.',darf:'Alles: Handyvertrag, Kredit, Mietvertrag. Aber du trägst auch die volle Verantwortung – und die Schulden.'}
];
export const MEILENSTEINE=[
  {ab:0,icon:'child_care',titel:'Geburt: rechtsfähig',t:'Du hast Rechte und Pflichten. Schon ein Baby kann zum Beispiel ein Haus erben.',p:'§ 1 BGB'},
  {ab:7,icon:'shopping_basket',titel:'7: beschränkt geschäftsfähig',t:'Verträge mit Zustimmung der Eltern, Taschengeld ohne. Für Schäden haftest du, wenn du einsehen kannst, was du tust.',p:'§§ 106, 828 BGB'},
  {ab:10,icon:'directions_car',titel:'10: Haftung im Straßenverkehr',t:'Bei Unfällen mit Auto, Straßenbahn oder Zug haftest du erst ab 10 Jahren.',p:'§ 828 Abs. 2 BGB'},
  {ab:14,icon:'gavel',titel:'14: strafmündig',t:'Ab 14 kannst du für Straftaten bestraft werden – nach dem Jugendstrafrecht.',p:'§ 19 StGB'},
  {ab:16,icon:'how_to_vote',titel:'16: Kommunal- und Europawahl',t:'In Thüringen wählst du ab 16 bei Kommunalwahlen mit, dazu bei der Europawahl. Außerdem brauchst du einen Personalausweis und darfst beim Notar ein Testament machen.',p:'ThürKWG, § 2229 BGB'},
  {ab:17,icon:'directions_car',titel:'17: Begleitetes Fahren',t:'Mit dem Führerschein BF17 darfst du Auto fahren, wenn eine erfahrene Begleitperson dabei ist.',p:'Fahrerlaubnis-Verordnung'},
  {ab:18,icon:'celebration',titel:'18: volljährig',t:'Voll geschäftsfähig, Wahlrecht bei Landtags- und Bundestagswahl, alle Verträge allein.',p:'§ 2 BGB'}
];

/* ---------- Fotos (Wikimedia Commons, freie Lizenzen) ---------- */
export const FOTO={
  galerie:{src:'img/galerie.jpg',alt:'Blick in die Goethe Galerie in Jena: Glasdach, Rolltreppen und Geschäfte auf mehreren Etagen',credit:'Andreas Praefcke / Wikimedia Commons, CC BY 3.0',
    link:'https://commons.wikimedia.org/wiki/File:Jena_Goethe-Galerie_2010_1.jpg',lizenz:'https://creativecommons.org/licenses/by/3.0/'},
  simson:{src:'img/simson.jpg',alt:'Rote Simson S51 von 1987, ein Moped aus Suhl in Thüringen',credit:'Max schwalbe / Wikimedia Commons, CC BY-SA 4.0',
    link:'https://commons.wikimedia.org/wiki/File:Simson_S_51_B1-3_von_1987_Bild1.jpg',lizenz:'https://creativecommons.org/licenses/by-sa/4.0/'},
  zwergspitz:{src:'img/zwergspitz.jpg',alt:'Flauschiger Zwergspitz-Welpe mit hellbraunem Fell',credit:'Jiafei Slay Queen / Wikimedia Commons, CC0',
    link:'https://commons.wikimedia.org/wiki/File:Aww..._Cute_pomeranian!.jpg',lizenz:'https://creativecommons.org/publicdomain/zero/1.0/'}
};
