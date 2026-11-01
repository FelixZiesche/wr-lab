// Abstraktionsprinzip: Gesetzestexte, die drei Fälle des Eigentums-Detektivs, Rechts-Navi (Übereignung nach § 929 BGB)
// und die Fälle der Fall-Akte. Gesetzestexte: BGB, amtliche Fassung von gesetze-im-internet.de, Stand Oktober 2026.
// Fälle nach den Unterrichtsmaterialien der Lehrkraft (Handy in drei Akten, Fahrrad-Fall, Doppelverkauf), nach Thüringen
// verlegt. Alle Personen sind erfunden.
import { FOTO, nachweis } from './fotos.js';

export const GESETZ={
  107:{p:'§ 107 BGB',titel:'Einwilligung des gesetzlichen Vertreters',t:'Der Minderjährige bedarf zu einer Willenserklärung, durch die er nicht lediglich einen rechtlichen Vorteil erlangt, der Einwilligung seines gesetzlichen Vertreters.'},
  108:{p:'§ 108 Abs. 1 BGB',titel:'Vertragsschluss ohne Einwilligung',t:'Schließt der Minderjährige einen Vertrag ohne die erforderliche Einwilligung des gesetzlichen Vertreters, so hängt die Wirksamkeit des Vertrags von der Genehmigung des Vertreters ab.'},
  110:{p:'§ 110 BGB',titel:'Bewirken der Leistung mit eigenen Mitteln',t:'Ein von dem Minderjährigen ohne Zustimmung des gesetzlichen Vertreters geschlossener Vertrag gilt als von Anfang an wirksam, wenn der Minderjährige die vertragsmäßige Leistung mit Mitteln bewirkt, die ihm zu diesem Zweck oder zu freier Verfügung von dem Vertreter oder mit dessen Zustimmung von einem Dritten überlassen worden sind.'},
  433:{p:'§ 433 BGB',titel:'Vertragstypische Pflichten beim Kaufvertrag',t:'(1) Durch den Kaufvertrag wird der Verkäufer einer Sache verpflichtet, dem Käufer die Sache zu übergeben und das Eigentum an der Sache zu verschaffen. Der Verkäufer hat dem Käufer die Sache frei von Sach- und Rechtsmängeln zu verschaffen. (2) Der Käufer ist verpflichtet, dem Verkäufer den vereinbarten Kaufpreis zu zahlen und die gekaufte Sache abzunehmen.'},
  449:{p:'§ 449 Abs. 1 BGB',titel:'Eigentumsvorbehalt',t:'Hat sich der Verkäufer einer beweglichen Sache das Eigentum bis zur Zahlung des Kaufpreises vorbehalten, so ist im Zweifel anzunehmen, dass das Eigentum unter der aufschiebenden Bedingung vollständiger Zahlung des Kaufpreises übertragen wird (Eigentumsvorbehalt).'},
  854:{p:'§ 854 Abs. 1 BGB',titel:'Erwerb des Besitzes',t:'Der Besitz einer Sache wird durch die Erlangung der tatsächlichen Gewalt über die Sache erworben.'},
  903:{p:'§ 903 S. 1 BGB',titel:'Befugnisse des Eigentümers',t:'Der Eigentümer einer Sache kann, soweit nicht das Gesetz oder Rechte Dritter entgegenstehen, mit der Sache nach Belieben verfahren und andere von jeder Einwirkung ausschließen.'},
  929:{p:'§ 929 S. 1 BGB',titel:'Einigung und Übergabe',t:'Zur Übertragung des Eigentums an einer beweglichen Sache ist erforderlich, dass der Eigentümer die Sache dem Erwerber übergibt und beide darüber einig sind, dass das Eigentum übergehen soll.'},
  935:{p:'§ 935 Abs. 1 S. 1 BGB',titel:'Kein Erwerb von abhanden gekommenen Sachen',t:'Der Erwerb des Eigentums auf Grund der §§ 932 bis 934 tritt nicht ein, wenn die Sache dem Eigentümer gestohlen worden, verloren gegangen oder sonst abhanden gekommen war.'}
};

/* ---------- Eigentums-Detektiv ----------
   Jeder Fall ist eine Folge von Szenen. Pro Szene beantworten die Schüler eine oder zwei Fragen, danach trägt der
   Detektiv das Rechtsgeschäft ins Schema ein und zeigt, wem was gehört (Eigentum) und wer was hat (Besitz).
   Fragen: ART (Welcher Teil des Kaufs?) und WIRK (Wirksam?) oder eigene {f, o, r, e, fehler}.
   dann: {zeile:{art, von, an, was, st, p}, status:{zeilenIndex: st}, eigentum:{sache: person}, besitz:{sache: person}} */
const ARTEN=['Kaufvertrag (Verpflichtungsgeschäft)','Übereignung der Ware (Verfügungsgeschäft)','Übereignung des Geldes (Verfügungsgeschäft)','Kein neuer Teil des Kaufs'];
const ART_HILFE={0:'Beim Kaufvertrag einigen sich beide nur darauf, was sie tun sollen: Ware gegen Geld. Übergeben wird dabei noch nichts.',
  1:'Bei der Übereignung der Ware wechselt die Ware den Besitzer, und beide wollen, dass sie jetzt dem Käufer gehört.',
  2:'Bei der Übereignung des Geldes wechselt das Geld den Besitzer, und beide wollen, dass es jetzt dem Verkäufer gehört.',
  3:'Prüf genau: Wird hier etwas vereinbart, übergeben oder bezahlt?'};
const ART=(r,e,fehler={})=>({f:'Welcher Teil des Kaufs passiert in dieser Szene?',o:ARTEN,r,e,fehler:{...ART_HILFE,...fehler},art:true});
const WIRKUNG=['Wirksam','Schwebend unwirksam','Unwirksam'];
const WIRK=(r,e,fehler={})=>({f:'Ist dieses Rechtsgeschäft wirksam?',o:WIRKUNG,r,e,fehler:{0:'Prüf, ob alle Beteiligten das Geschäft allein abschließen durften.',1:'Schwebend unwirksam ist ein Vertrag, wenn noch die Genehmigung der Eltern fehlt.',2:'Unwirksam ist ein Geschäft nur, wenn etwas Entscheidendes fehlt, zum Beispiel die Zustimmung der Eltern.',...fehler}});
export const ST={wirksam:['ok','check_circle','wirksam'],schwebend:['amb','hourglass_top','schwebend unwirksam'],unwirksam:['bad','block','unwirksam'],fehlt:['neu','more_horiz','noch nicht passiert']};
export const ZEILE={kv:{icon:'receipt_long',t:'Kaufvertrag',p:'§ 433 BGB',pfeil:'⇄'},ware:{icon:'shopping_bag',t:'Übereignung der Ware',p:'§ 929 BGB',pfeil:'→'},geld:{icon:'payments',t:'Übereignung des Geldes',p:'§ 929 BGB',pfeil:'→'}};

export const DETEKTIV={
  handy:{id:'detektiv-handy',titel:'Das neue Handy: ein Kauf in drei Akten',
    personen:{max:{name:'Max (19)',icon:'man'},lea:{name:'Lea (18)',icon:'woman'}},
    sachen:{handy:{name:'iPhone',icon:'smartphone'},geld:{name:'350 €',icon:'payments'}},
    start:{eigentum:{handy:'max',geld:'lea'},besitz:{handy:'max',geld:'lea'}},
    szenen:[
      {szene:'Akt 1 · Große Pause, Schulhof in Jena',t:'Max (19) will sein altes iPhone loswerden. Lea (18) sagt: „Ich nehm’s für 350 €.“ Max: „Deal! Ich bring’s dir heute um 17 Uhr vorbei, das Geld gibst du mir morgen.“',
        fragen:[ART(0,'Max bietet das Handy an (Antrag, § 145 BGB), Lea nimmt an (Annahme, § 147 BGB). Beide verpflichten sich: Max zur Übergabe und Übereignung, Lea zur Zahlung (§ 433 BGB).'),
          WIRK(0,'Beide sind volljährig und einig. Der Kaufvertrag ist wirksam. Aber Achtung: Das Handy gehört immer noch Max!')],
        dann:{zeile:{art:'kv',von:'max',an:'lea',was:'iPhone gegen 350 €',st:'wirksam'}}},
      {szene:'Akt 1, kurz danach · Klassenzimmer',t:'Lea will das Handy schon mal testen. Max gibt es ihr bis zum Ende der Stunde: „Aber danach will ich’s zurück, da sind noch meine Fotos drauf.“',
        fragen:[ART(3,'Max leiht Lea das Handy nur aus. Er will nicht, dass es ihr jetzt schon gehört. Lea hat das Handy in der Hand, sie ist <b>Besitzerin</b> (§ 854 BGB). <b>Eigentümer</b> bleibt Max.',{1:'Lea bekommt das Handy zwar in die Hand. Aber will Max, dass es ihr jetzt schon gehört?'}),
          {f:'Wer ist jetzt Eigentümer, wer Besitzer des Handys?',o:['Lea ist Eigentümerin und Besitzerin','Max ist Eigentümer, Lea ist Besitzerin','Max ist Eigentümer und Besitzer'],r:1,
            e:'Besitz ist die tatsächliche Herrschaft: Wer etwas in der Hand hat, ist Besitzer. Eigentum ist die rechtliche Herrschaft: Wem etwas gehört, der ist Eigentümer (§ 903 BGB).',
            fehler:{0:'Lea hält das Handy nur in der Hand. Gehört es ihr deshalb schon?',2:'Wer hat das Handy gerade in der Hand?'}}],
        dann:{besitz:{handy:'lea'}}},
      {szene:'Akt 1, Ende der Stunde',t:'Es klingelt. Lea gibt Max das Handy zurück.',
        fragen:[],dann:{besitz:{handy:'max'}}},
      {szene:'Akt 2 · 17 Uhr, vor Leas Haustür',t:'Max steht mit dem Handy vor der Tür. Er drückt es Lea in die Hand: „Hier, gehört jetzt dir. Fotos sind gelöscht.“ Lea: „Danke!“',
        fragen:[ART(1,'Max und Lea sind sich einig, dass das Eigentum übergehen soll, und Max übergibt das Handy (§ 929 S. 1 BGB). Die Übergabe selbst ist ein Realakt.'),
          WIRK(0,'Max ist Eigentümer, beide sind volljährig, Einigung und Übergabe liegen vor. Lea ist jetzt Eigentümerin und Besitzerin, obwohl sie noch nicht bezahlt hat!')],
        dann:{zeile:{art:'ware',von:'max',an:'lea',was:'iPhone',st:'wirksam'},eigentum:{handy:'lea'},besitz:{handy:'lea'}}},
      {szene:'Akt 3 · Nächster Morgen, vor dem WR-Unterricht',t:'Lea gibt Max sieben 50-Euro-Scheine: „Hier sind die 350 €, wie versprochen.“ Max steckt sie ein.',
        fragen:[ART(2,'Lea übergibt das Geld, und beide wollen, dass die Scheine jetzt Max gehören. Auch das ist eine Übereignung nach § 929 S. 1 BGB.'),
          WIRK(0,'Lea ist Eigentümerin der Scheine und volljährig. Max ist jetzt Eigentümer und Besitzer des Geldes.')],
        dann:{zeile:{art:'geld',von:'lea',an:'max',was:'350 €',st:'wirksam'},eigentum:{geld:'max'},besitz:{geld:'max'}}}],
    fazit:'Ein Kauf, drei Rechtsgeschäfte: der Kaufvertrag (Verpflichtungsgeschäft) und zwei Übereignungen (Verfügungsgeschäfte). Das gilt auch, wenn alles in einer Sekunde passiert, wie beim Bäcker.'},

  fahrrad:{id:'detektiv-fahrrad',titel:'Kim und das Fahrrad',
    personen:{haendler:{name:'Fahrradladen',icon:'storefront'},kim:{name:'Kim (16)',icon:'woman'}},
    sachen:{rad:{name:'Fahrrad',icon:'pedal_bike'},geld:{name:'750 €',icon:'payments'}},
    start:{eigentum:{rad:'haendler',geld:'kim'},besitz:{rad:'haendler',geld:'kim'}},
    szenen:[
      {szene:'Samstag, 10 Uhr · Fahrradladen in Erfurt',t:'Kim (16) verliebt sich in ein Trekkingrad für 750 €. Ihre Eltern wissen nichts davon. Der Verkäufer: „Weil du so nett bist: Zahl einfach nächste Woche.“ Kim sagt zu.',
        fragen:[ART(0,'Kim und der Laden einigen sich: Fahrrad gegen 750 € (§ 433 BGB). Das ist der Kaufvertrag.'),
          WIRK(1,'Kim ist 16 und damit beschränkt geschäftsfähig. Der Kaufvertrag bringt ihr eine Pflicht: 750 € zahlen. Das ist kein lediglich rechtlicher Vorteil, also braucht sie die Einwilligung ihrer Eltern (§ 107 BGB). Die fehlt. Der Vertrag ist schwebend unwirksam, bis die Eltern ihn genehmigen oder ablehnen (§ 108 Abs. 1 BGB). Taschengeld hat sie dafür nicht eingesetzt (§ 110 BGB).',
            {0:'Kim ist 16. Darf sie einen Vertrag, der sie zur Zahlung von 750 € verpflichtet, allein abschließen?',2:'Endgültig unwirksam ist der Vertrag erst, wenn die Eltern Nein sagen. Bisher wissen sie noch gar nichts davon.'})],
        dann:{zeile:{art:'kv',von:'haendler',an:'kim',was:'Fahrrad gegen 750 €',st:'schwebend'}}},
      {szene:'Samstag, 10:05 Uhr · vor dem Laden',t:'Der Verkäufer schiebt das Rad nach draußen und gibt es Kim: „Gehört jetzt dir. Gute Fahrt!“ Kim radelt los.',
        fragen:[ART(1,'Der Laden übergibt das Rad, beide sind sich einig, dass es jetzt Kim gehören soll (§ 929 S. 1 BGB).'),
          WIRK(0,'Durch die Übereignung bekommt Kim nur etwas, nämlich Eigentum, und muss dafür nichts tun. Das ist ein <b>lediglich rechtlicher Vorteil</b>, dafür braucht sie ihre Eltern nicht (§ 107 BGB). Kim ist Eigentümerin und Besitzerin.',
            {1:'Bringt die Übereignung selbst Kim irgendeinen Nachteil? Die Zahlungspflicht kommt aus dem Kaufvertrag, nicht aus der Übereignung.',2:'Lies § 107 BGB: Wofür braucht Kim die Einwilligung ihrer Eltern – und wofür nicht?'})],
        dann:{zeile:{art:'ware',von:'haendler',an:'kim',was:'Fahrrad',st:'wirksam'},eigentum:{rad:'kim'},besitz:{rad:'kim'}}},
      {szene:'Samstag, 13 Uhr · zu Hause',t:'Kims Eltern sehen das Rad und erfahren von den 750 €. Ihr Vater: „Auf keinen Fall. Den Kauf genehmigen wir nicht!“',
        fragen:[ART(3,'Hier kommt kein neuer Teil des Kaufs dazu. Die Eltern verweigern aber die Genehmigung. Damit wird der schwebend unwirksame Kaufvertrag endgültig unwirksam (§ 108 Abs. 1 BGB).',{0:'Die Eltern schließen keinen neuen Vertrag. Sie sagen etwas zu einem Vertrag, den es schon gibt.'}),
          {f:'Was passiert mit dem Kaufvertrag?',o:['Er bleibt schwebend unwirksam','Er wird endgültig unwirksam','Er wird wirksam, weil Kim das Rad schon hat'],r:1,
            e:'Mit dem Nein der Eltern ist der Schwebezustand vorbei: Der Kaufvertrag ist endgültig unwirksam (§ 108 Abs. 1 BGB). Kim muss die 750 € nicht zahlen.',
            fehler:{0:'Schwebend heißt: Die Eltern haben noch nicht entschieden. Haben sie jetzt entschieden?',2:'Dass Kim das Rad schon hat, ersetzt die Genehmigung der Eltern nicht.'}}],
        dann:{status:{0:'unwirksam'}}},
      {szene:'Und das Geld?',t:'Kim hat noch keinen Cent bezahlt. Die Zahlung war ja erst für nächste Woche geplant.',
        fragen:[{f:'Hat eine Übereignung des Geldes stattgefunden?',o:['Ja, die Zahlung ist vereinbart','Nein, es wurde noch kein Geld übergeben'],r:1,
          e:'Für die Übereignung braucht es Einigung <b>und</b> Übergabe (§ 929 S. 1 BGB). Es wurde noch nichts übergeben. Die 750 € gehören weiter Kim, und weil der Kaufvertrag unwirksam ist, muss sie auch nicht mehr zahlen.',
          fehler:{0:'Vereinbart ist die Zahlung im Kaufvertrag. Ist aber schon Geld den Besitzer gewechselt?'}}],
        dann:{zeile:{art:'geld',von:'kim',an:'haendler',was:'750 €',st:'fehlt'}}},
      {szene:'Die große Frage',t:'Der Kaufvertrag ist geplatzt. Wem gehört das Fahrrad jetzt?',
        fragen:[{f:'Wer ist Eigentümer des Fahrrads?',o:['Der Fahrradladen, weil der Kaufvertrag unwirksam ist','Kim, weil die Übereignung wirksam ist','Niemand, bis der Streit geklärt ist'],r:1,
          e:'Überraschend, aber logisch: Die Übereignung ist ein eigenes Rechtsgeschäft und hängt nicht vom Kaufvertrag ab. Sie war wirksam, also bleibt Kim Eigentümerin. Das ist das <b>Abstraktionsprinzip</b>. Der Laden kann das Rad zwar zurückverlangen, Eigentümerin bleibt Kim aber, bis sie es ihm zurück übereignet.',
          fehler:{0:'Prüf das Schema: Welches Rechtsgeschäft ist unwirksam, und welches hat das Eigentum übertragen?',2:'Jede Sache hat einen Eigentümer. Schau, welche Übereignung wirksam war.'}}],
        dann:{}}],
    fazit:'Der Kaufvertrag ist unwirksam, die Übereignung des Fahrrads bleibt wirksam: Kim ist Eigentümerin. Ob ein Verfügungsgeschäft wirksam ist, prüft man getrennt vom Verpflichtungsgeschäft.'},

  simson:{id:'detektiv-simson',titel:'Eine Simson, zwei Käufer',
    personen:{uwe:{name:'Uwe (54)',icon:'man'},jens:{name:'Jens (35)',icon:'person'},bernd:{name:'Bernd (61)',icon:'elderly'}},
    sachen:{simson:{name:'Simson S51',icon:'two_wheeler'},geld1:{name:'3.000 € von Jens',icon:'payments'},geld2:{name:'6.000 € von Bernd',icon:'payments'}},
    start:{eigentum:{simson:'uwe',geld1:'jens',geld2:'bernd'},besitz:{simson:'uwe',geld1:'jens',geld2:'bernd'}},
    szenen:[
      {szene:'Freitag, 19 Uhr · Café in Jena',t:'Uwe (54) erzählt, dass er seine alte Simson S51 für 3.000 € verkaufen will. Jens (35) sucht gerade eine: „Ich nehm sie!“ Uwe schlägt ein.',
        fragen:[ART(0,'Antrag und Annahme: Uwe und Jens schließen einen Kaufvertrag über die Simson für 3.000 € (§ 433 BGB).'),
          WIRK(0,'Beide sind volljährig und einig. Der Kaufvertrag ist wirksam.')],
        dann:{zeile:{art:'kv',von:'uwe',an:'jens',was:'Simson gegen 3.000 €',st:'wirksam'}}},
      {szene:'Freitag, 19:05 Uhr',t:'Jens hat das Geld zufällig bar dabei und gibt Uwe sofort 3.000 €. „Die Simson hol ich morgen früh ab.“',
        fragen:[ART(2,'Jens übergibt das Geld, beide wollen, dass es Uwe gehört (§ 929 S. 1 BGB).'),
          WIRK(0,'Jens ist Eigentümer des Geldes und volljährig. Uwe ist jetzt Eigentümer der 3.000 €.')],
        dann:{zeile:{art:'geld',von:'jens',an:'uwe',was:'3.000 €',st:'wirksam'},eigentum:{geld1:'uwe'},besitz:{geld1:'uwe'}}},
      {szene:'Freitag, 19:10 Uhr',t:'Jens geht nach Hause. Die Simson steht weiter in Uwes Garage.',
        fragen:[{f:'Wem gehört die Simson jetzt?',o:['Jens, er hat ja schon bezahlt','Uwe, denn sie wurde noch nicht übergeben','Beiden zur Hälfte'],r:1,
          e:'Für das Eigentum braucht es Einigung und Übergabe (§ 929 S. 1 BGB). Übergeben ist die Simson noch nicht. Jens hat nur einen Anspruch aus dem Kaufvertrag: Uwe muss sie ihm übereignen (§ 433 Abs. 1 BGB).',
          fehler:{0:'Bezahlt hat Jens, das stimmt. Aber was braucht es nach § 929 S. 1 BGB, damit das Eigentum übergeht?',2:'Eigentum wird nicht nach Zahlung aufgeteilt. Wurde die Simson schon übereignet?'}}],
        dann:{zeile:{art:'ware',von:'uwe',an:'jens',was:'Simson',st:'fehlt'}}},
      {szene:'Freitag, 22 Uhr · Uwes Garage',t:'Uwes alter Klassenkamerad Bernd (61) kommt vorbei. Er sammelt Simsons, genau diese fehlt ihm noch: „Ich geb dir 6.000 €!“ Uwe kann nicht widerstehen und sagt Ja.',
        fragen:[ART(0,'Auch Uwe und Bernd schließen einen Kaufvertrag über dieselbe Simson (§ 433 BGB).'),
          WIRK(0,'Überraschung: Auch dieser Kaufvertrag ist wirksam! Ein Kaufvertrag verpflichtet nur. Man kann sich zweimal zu etwas verpflichten, auch wenn man am Ende nur einen Vertrag erfüllen kann. Das ist das <b>Trennungsprinzip</b>.',
            {2:'Ein Kaufvertrag verpflichtet nur. Darf man sich zweimal zu etwas verpflichten, auch wenn man es nur einmal erfüllen kann?'})],
        dann:{zeile:{art:'kv',von:'uwe',an:'bernd',was:'Simson gegen 6.000 €',st:'wirksam'}}},
      {szene:'Freitag, 22:05 Uhr',t:'Bernd schiebt die Simson sofort aus der Garage. Uwe: „Gehört jetzt dir.“ Bernd zahlt 6.000 € in bar.',
        fragen:[ART(1,'Uwe übergibt die Simson, beide sind sich einig: Bernd soll Eigentümer werden (§ 929 S. 1 BGB).',{2:'Es passieren hier zwei Dinge. Fang mit der Simson an.'}),
          WIRK(0,'Uwe ist immer noch Eigentümer der Simson, er darf sie also übereignen. Bernd ist jetzt Eigentümer und Besitzer.',{2:'Wer ist in diesem Moment Eigentümer der Simson? Schau in die Tabelle.'})],
        dann:{zeile:{art:'ware',von:'uwe',an:'bernd',was:'Simson',st:'wirksam'},eigentum:{simson:'bernd'},besitz:{simson:'bernd'}}},
      {szene:'Freitag, 22:06 Uhr',t:'Und das Geld von Bernd?',
        fragen:[ART(2,'Bernd übereignet Uwe die 6.000 € (§ 929 S. 1 BGB).'),WIRK(0,'Uwe ist jetzt auch Eigentümer der 6.000 €.')],
        dann:{zeile:{art:'geld',von:'bernd',an:'uwe',was:'6.000 €',st:'wirksam'},eigentum:{geld2:'uwe'},besitz:{geld2:'uwe'}}},
      {szene:'Samstag, 9 Uhr · Uwes Garage',t:'Jens kommt mit Helm unterm Arm: „Morgen! Ich hol meine Simson.“ Die Garage ist leer.',
        fragen:[{f:'Kann Jens die Simson noch bekommen?',o:['Ja, er war zuerst da','Ja, er kann sie bei Bernd abholen','Nein, Uwe kann sie ihm nicht mehr übereignen, sie gehört Bernd'],r:2,
          e:'Bernd ist wirksam Eigentümer geworden. Uwe kann seine Pflicht aus dem Kaufvertrag mit Jens nicht mehr erfüllen. Jens hat aber nicht verloren: Weil Uwe seinen Vertrag bricht, bekommt Jens die 3.000 € zurück und kann Schadensersatz verlangen, zum Beispiel wenn eine andere Simson teurer ist.',
          fehler:{0:'Wer zuerst kauft, wird nicht automatisch Eigentümer. Wer hat die Simson übereignet bekommen?',1:'Jens hat einen Vertrag mit Uwe, nicht mit Bernd. Und Bernd ist wirksam Eigentümer geworden.'}}],
        dann:{}}],
    fazit:'Sechs Rechtsgeschäfte, aber nur fünf sind passiert: zwei wirksame Kaufverträge, drei Übereignungen. Die Übereignung an Jens fehlt. Eigentümer der Simson ist Bernd, Jens bleibt nur sein Anspruch gegen Uwe.'}
};

/* ---------- Rechts-Navi: Wird der Erwerber Eigentümer? (§ 929 S. 1 BGB) ---------- */
const JA=(t,titel)=>({art:'wirksam',titel:titel||'Wird Eigentümer',t});
const NEIN=(t,titel)=>({art:'unwirksam',titel:titel||'Wird nicht Eigentümer',t});
export const NAVI={start:'einigung',schritte:{
  einigung:{frage:'Sind sich beide einig, dass das Eigentum jetzt übergehen soll?',hilfe:'Nicht nur „verkaufen“, sondern: „Ab jetzt gehört es dir.“ Ob der Kaufvertrag wirksam ist, spielt hier keine Rolle (Abstraktionsprinzip).',gesetz:GESETZ[929],antworten:[
    {t:'Ja',weiter:'uebergabe'},
    {t:'Nein, oder erst später (zum Beispiel mit der letzten Rate)',ergebnis:NEIN('Ohne Einigung geht das Eigentum nicht über. Beim Eigentumsvorbehalt wird man erst mit der letzten Rate Eigentümer (§ 449 BGB).','Noch nicht Eigentümer')}]},
  uebergabe:{frage:'Hat der Veräußerer die Sache übergeben, hat der Erwerber sie also in der Hand?',hilfe:'Die Übergabe ist ein Realakt: Der Erwerber bekommt den Besitz (§ 854 BGB).',gesetz:GESETZ[854],antworten:[
    {t:'Ja',weiter:'berechtigt'},
    {t:'Nein, noch nicht',ergebnis:NEIN('Ohne Übergabe kein Eigentum (§ 929 S. 1 BGB). Wer bezahlt hat, hat nur einen Anspruch aus dem Kaufvertrag.','Noch nicht Eigentümer')}]},
  berechtigt:{frage:'War der Veräußerer in diesem Moment Eigentümer der Sache?',hilfe:'Nur der Eigentümer kann Eigentum übertragen. Wer etwas schon an einen anderen übereignet oder gestohlen hat, ist es nicht.',gesetz:GESETZ[929],antworten:[
    {t:'Ja',weiter:'faehig'},
    {t:'Nein, die Sache gehörte jemand anderem, zum Beispiel weil sie gestohlen war',ergebnis:NEIN('Wer nicht Eigentümer ist, kann grundsätzlich kein Eigentum verschaffen. Bei gestohlenen Sachen gilt das immer (§ 935 BGB).')}]},
  faehig:{frage:'Wer ist beteiligt?',hilfe:'Hier prüfst du die Geschäftsfähigkeit. Bekommt ein Minderjähriger nur etwas, ist das ein lediglich rechtlicher Vorteil (§ 107 BGB).',gesetz:GESETZ[107],antworten:[
    {t:'Beide sind volljährig',ergebnis:JA('Einigung, Übergabe, Eigentümer: Die Übereignung ist wirksam (§ 929 S. 1 BGB).')},
    {t:'Ein Minderjähriger (ab 7) bekommt die Sache',ergebnis:JA('Eigentum zu bekommen ist ein lediglich rechtlicher Vorteil. Dafür braucht der Minderjährige seine Eltern nicht (§ 107 BGB).')},
    {t:'Ein Minderjähriger zahlt mit seinem Taschengeld',ergebnis:JA('Mit Mitteln, die ihm zur freien Verfügung überlassen sind, darf der Minderjährige zahlen (§ 110 BGB).')},
    {t:'Ein Minderjähriger gibt etwas her, ohne dass die Eltern eingewilligt haben',ergebnis:{art:'schwebend',titel:'Schwebend unwirksam',t:'Er verliert dadurch sein Eigentum, das ist ein rechtlicher Nachteil. Ob die Übereignung wirksam wird, hängt von der Genehmigung der Eltern ab (§§ 107, 108 BGB).'}}]}
}};

/* ---------- Fall-Akte: Wer ist Eigentümer? ---------- */
const mitBild=f=>FOTO[f.foto]?{...f,bild:{src:FOTO[f.foto].src,alt:FOTO[f.foto].alt,nachweis:nachweis(f.foto)}}:f;
const bis=extra=>({einigung:0,uebergabe:0,berechtigt:0,...extra});
export const FAELLE=[
  {titel:'Kim und das Fahrrad',icon:'pedal_bike',foto:'fahrrad',
    fakten:[['Wer','Kim, 16, und ein Fahrradladen in Erfurt'],['Kaufvertrag','750 €, die Eltern verweigern die Genehmigung'],['Übergabe','„Gehört jetzt dir“, Kim fährt los'],['Geld','noch nicht gezahlt']],
    text:'Kim (16) kauft ohne Wissen ihrer Eltern ein Fahrrad für 750 €. Der Laden übergibt es ihr sofort: „Gehört jetzt dir.“ Bezahlen soll sie nächste Woche. Zu Hause verweigern ihre Eltern die Genehmigung des Kaufs.',
    frage:'Ist Kim Eigentümerin des Fahrrads geworden?',weg:bis({faehig:1}),
    tipps:{einigung:'Der Verkäufer sagt „Gehört jetzt dir.“ Und der Kaufvertrag? Der spielt bei dieser Prüfung keine Rolle.',faehig:'Kim ist 16 und bekommt das Fahrrad. Was gibt sie dabei her?'},
    loesung:['Kim könnte durch Einigung und Übergabe nach § 929 S. 1 BGB Eigentümerin des Fahrrads geworden sein.',
      'Der Laden und Kim waren sich einig, dass das Eigentum übergehen soll, und der Laden hat ihr das Rad übergeben.',
      'Der Laden war Eigentümer des Rads.',
      'Kim ist 16 und damit beschränkt geschäftsfähig. Durch die Übereignung erlangt sie aber lediglich einen rechtlichen Vorteil und braucht ihre Eltern nicht (§ 107 BGB).',
      'Dass der Kaufvertrag unwirksam ist, ändert daran nichts (Abstraktionsprinzip).',
      'Ergebnis: Kim ist Eigentümerin des Fahrrads.'],
    denkWeiter:'Der Laden ist trotzdem nicht machtlos: Er kann das Rad zurückverlangen, weil es keinen wirksamen Kaufvertrag mehr gibt. Kim muss es ihm dann zurück übereignen.'},
  {titel:'Jens wartet auf seine Simson',icon:'two_wheeler',foto:'simson',
    fakten:[['Wer','Jens, 35, und Uwe, 54'],['Kaufvertrag','Simson S51 für 3.000 €, wirksam'],['Geld','sofort bar bezahlt'],['Simson','steht noch in Uwes Garage']],
    text:'Jens (35) kauft im Café von Uwe (54) dessen Simson S51 für 3.000 € und zahlt sofort bar. „Die hol ich morgen früh ab“, sagt er. Die Simson bleibt über Nacht in Uwes Garage.',
    frage:'Ist Jens am Freitagabend schon Eigentümer der Simson?',weg:{einigung:0,uebergabe:1},
    tipps:{uebergabe:'Wo steht die Simson am Freitagabend? Und wer hat sie?'},
    loesung:['Jens könnte durch Einigung und Übergabe nach § 929 S. 1 BGB Eigentümer der Simson geworden sein.',
      'Jens und Uwe wollen, dass die Simson Jens gehören soll.',
      'Übergeben ist die Simson aber noch nicht, sie steht weiter in Uwes Garage.',
      'Dass Jens schon bezahlt hat, ändert daran nichts. Er hat nur einen Anspruch aus dem Kaufvertrag (§ 433 Abs. 1 BGB).',
      'Ergebnis: Jens ist noch nicht Eigentümer der Simson.'],
    denkWeiter:'Streng genommen einigt man sich über das Eigentum meist erst bei der Übergabe. Für das Ergebnis spielt das keine Rolle: Ohne Übergabe kein Eigentum.'},
  {titel:'Sammler Bernd schlägt zu',icon:'garage',foto:'simson',
    fakten:[['Wer','Bernd, 61, Sammler, und Uwe, 54'],['Kaufvertrag','dieselbe Simson für 6.000 €'],['Übergabe','Bernd schiebt sie sofort weg: „Gehört jetzt dir“'],['Vorher','Uwe hatte die Simson schon an Jens verkauft']],
    text:'Am selben Abend bietet Bernd (61) Uwe 6.000 € für die Simson. Uwe schlägt ein, obwohl er sie schon an Jens verkauft hat. Bernd zahlt bar und schiebt die Simson sofort aus der Garage. Uwe: „Gehört jetzt dir.“',
    frage:'Ist Bernd Eigentümer der Simson geworden?',weg:bis({faehig:0}),
    tipps:{berechtigt:'Uwe hat die Simson an Jens zwar verkauft, aber hat er sie ihm schon übereignet?',faehig:'Bernd und Uwe sind beide erwachsen.'},
    loesung:['Bernd könnte durch Einigung und Übergabe nach § 929 S. 1 BGB Eigentümer der Simson geworden sein.',
      'Uwe und Bernd waren sich einig, dass das Eigentum übergehen soll, und Uwe hat Bernd die Simson übergeben.',
      'Uwe war noch Eigentümer, denn an Jens hatte er sie nur verkauft, nicht übereignet.',
      'Beide sind volljährig.',
      'Ergebnis: Bernd ist Eigentümer der Simson.'],
    denkWeiter:'Jens bekommt die Simson nicht mehr. Er kann aber von Uwe seine 3.000 € zurückverlangen und Schadensersatz fordern, zum Beispiel, wenn er für eine vergleichbare Simson mehr bezahlen muss.'},
  {titel:'Gaming-PC auf Raten',icon:'computer',foto:'pc',
    fakten:[['Wer','Max, 20, und ein Elektronikmarkt in Erfurt'],['Kaufvertrag','Gaming-PC für 1.800 €, zwölf Raten'],['Im Vertrag','„Der PC bleibt bis zur letzten Rate Eigentum des Händlers.“'],['Stand','PC steht in Max’ Zimmer, drei Raten bezahlt']],
    text:'Max (20) kauft im Elektronikmarkt in Erfurt einen Gaming-PC für 1.800 € in zwölf Raten. Im Vertrag steht: „Der PC bleibt bis zur vollständigen Bezahlung Eigentum des Händlers.“ Der PC steht schon in seinem Zimmer, drei Raten sind bezahlt.',
    frage:'Ist Max Eigentümer des PCs?',weg:{einigung:1},
    tipps:{einigung:'Lies den Satz im Vertrag noch einmal: Wann soll das Eigentum übergehen?'},
    loesung:['Max könnte durch Einigung und Übergabe nach § 929 S. 1 BGB Eigentümer des PCs geworden sein.',
      'Max hat den PC zwar schon, er ist Besitzer.',
      'Max und der Händler haben aber vereinbart, dass das Eigentum erst mit der letzten Rate übergehen soll. Das ist ein Eigentumsvorbehalt (§ 449 Abs. 1 BGB).',
      'Ergebnis: Max ist noch nicht Eigentümer des PCs, sondern nur Besitzer.'],
    denkWeiter:'Der Eigentumsvorbehalt ist nur möglich, weil Kaufvertrag und Übereignung getrennt sind (Trennungsprinzip). Zahlt Max nicht weiter, kann der Händler vom Vertrag zurücktreten und den PC zurückholen, denn er gehört ja noch ihm.'},
  {titel:'Die Switch von Kleinanzeigen',icon:'videogame_asset',foto:'switch',
    fakten:[['Wer','Mia, 18, und Leon, 19, aus Weimar'],['Kaufvertrag','Nintendo Switch für 150 € über Kleinanzeigen'],['Übergabe','bezahlt und mitgenommen'],['Später','Die Switch war in Jena gestohlen worden']],
    text:'Mia (18) kauft über Kleinanzeigen von Leon (19) eine Nintendo Switch für 150 €. Sie treffen sich in Weimar, Mia zahlt, Leon gibt ihr die Konsole. Zwei Wochen später meldet sich die Polizei: Die Switch war bei einem Einbruch in Jena gestohlen worden.',
    frage:'Ist Mia Eigentümerin der Switch geworden?',weg:{einigung:0,uebergabe:0,berechtigt:1},
    tipps:{berechtigt:'Wem gehörte die Switch, als Leon sie verkauft hat?'},
    loesung:['Mia könnte durch Einigung und Übergabe nach § 929 S. 1 BGB Eigentümerin der Switch geworden sein.',
      'Mia und Leon waren sich einig, und Leon hat ihr die Switch übergeben.',
      'Leon war aber nicht Eigentümer, die Switch war gestohlen.',
      'An gestohlenen Sachen kann man auch dann kein Eigentum erwerben, wenn man nichts vom Diebstahl wusste (§ 935 Abs. 1 BGB).',
      'Ergebnis: Mia ist nicht Eigentümerin der Switch. Sie muss sie dem Eigentümer zurückgeben.'],
    denkWeiter:'Mia bleibt auf den 150 € nicht einfach sitzen: Sie hat einen Kaufvertrag mit Leon, und der muss ihr Eigentum verschaffen (§ 433 Abs. 1 BGB). Kann er das nicht, muss er ihr das Geld zurückzahlen. Das Problem: Diebe sind oft nicht mehr auffindbar.'},
  {titel:'Brötchen vom Taschengeld',icon:'bakery_dining',foto:'baeckerei',
    fakten:[['Wer','Ella, 14, und eine Bäckerei in Jena'],['Kauf','zwei Brötchen für 1,20 €'],['Geld','von ihrem Taschengeld'],['Eltern','wissen nichts davon']],
    text:'Ella (14) holt sich vor der Schule in einer Bäckerei in Jena zwei Brötchen für 1,20 €. Sie bezahlt mit einer Münze aus ihrem Taschengeld. Die Verkäuferin nimmt das Geld und legt es in die Kasse.',
    frage:'Ist die Bäckerei Eigentümerin des Geldes geworden?',weg:bis({faehig:2}),
    tipps:{faehig:'Ella gibt hier etwas her, nämlich ihr Geld. Aber woher stammt es?'},
    loesung:['Die Bäckerei könnte durch Einigung und Übergabe nach § 929 S. 1 BGB Eigentümerin des Geldes geworden sein.',
      'Ella und die Verkäuferin waren sich einig, und Ella hat das Geld übergeben.',
      'Das Geld gehörte Ella.',
      'Ella ist 14 und verliert durch die Übereignung ihr Geld, das ist ein rechtlicher Nachteil. Sie bezahlt aber mit Taschengeld, das ihr zur freien Verfügung überlassen wurde (§ 110 BGB).',
      'Ergebnis: Die Bäckerei ist Eigentümerin des Geldes.'],
    denkWeiter:'Auch die Brötchen gehören jetzt Ella. Sie zu bekommen ist ein lediglich rechtlicher Vorteil (§ 107 BGB). Ein Kauf mit drei Rechtsgeschäften – in drei Sekunden.'}
].map(mitBild);
