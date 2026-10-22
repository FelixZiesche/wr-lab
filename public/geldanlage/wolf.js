// Chat-Abenteuer „Der Wolf of Saale“: Ein erfundener Finfluencer will an das Jugendweihe-Geld. Aufbau und Felder:
// siehe shared/js/chat.js. Alle Personen, der Wolf of Saale und $SAALE-Coin sind erfunden.
export const WOLF_CHAT={id:'wolf-chat',titel:'Samstagabend in Weimar: 800 € von der Jugendweihe auf dem Konto. Dann schreibt dir der Wolf of Saale.',start:'start',
  check:{name:'Finanz-Check',icon:'savings'},
  kontakte:{
    wolf:{name:'@wolf.of.saale (fiktiv)',icon:'pets'},
    jonas:{name:'Jonas',icon:'person'},
    lea:{name:'Lea, deine Schwester (Azubi bei der Sparkasse)',icon:'woman'},
    mama:{name:'Mama',icon:'favorite'}},
  szenen:{
    start:{n:[
      {info:'Samstagabend, Weimar. Die Jugendweihe ist vorbei. Auf deinem Konto: 800 €.'},
      {von:'jonas',t:'Hast du das Video vom Wolf gesehen? Der hat mit einem Coin in zwei Wochen 1.000 % gemacht!'},
      {von:'wolf',t:'Yo, Glückwunsch zur Jugendweihe! Willst du aus deinem Geld richtig was machen? Mein $SAALE-Coin geht diese Woche durch die Decke. Aus 800 € werden 8.000 €. Garantiert.'},
      {von:'wolf',t:'Nur heute: meine VIP-Gruppe für 49 €. Da gibt es die Signale, wann du kaufen musst. Bist du dabei?'}],
      wahl:[
        {t:'Klingt krass, ich bin dabei!',sag:true,weiter:'vip'},
        {t:'Woher weißt du, dass der Kurs steigt?',sag:true,weiter:'nachfragen'},
        {t:'Erst mal Lea fragen. Sie macht eine Ausbildung bei der Sparkasse.',weiter:'lea'}]},
    nachfragen:{n:[
      {von:'wolf',t:'Vertrau mir, ich mach das seit Jahren. Guck dir meine Gewinne an!'},
      {info:'Der Wolf schickt einen Screenshot: +1.034 %.'},
      {von:'wolf',t:'Aber beeil dich, um Mitternacht ist das Angebot weg. Wer zögert, bleibt arm.'},
      {recht:'Zeitdruck, garantierte Gewinne und Screenshots sind typische Warnsignale. Ein Screenshot lässt sich in Sekunden fälschen. Die Finanzaufsicht BaFin warnt: Manche Finfluencer verdienen daran, dass ihre Follower kaufen.'}],
      wahl:[
        {t:'Okay, okay, ich bin dabei!',sag:true,weiter:'vip'},
        {t:'Den Wolf blockieren und das Profil melden',weiter:'melden'},
        {t:'Lea fragen, was sie davon hält',weiter:'lea'}]},
    vip:{n:[
      {von:'wolf',t:'Starke Entscheidung! Die 49 € schickst du mir am besten als Code von einer Gutscheinkarte. Geht schneller als Überweisen.'},
      {recht:'Warnsignal! Seriöse Anbieter wollen nie mit Gutscheinkarten bezahlt werden. Solche Zahlungen kann niemand zurückholen. Verbraucherzentralen und Polizei warnen: Wer Gutscheincodes verlangt, ist fast immer ein Betrüger.'}],
      wahl:[
        {t:'Eine Gutscheinkarte kaufen und den Code schicken',weiter:'kaufen'},
        {t:'Moment mal … ich frag doch erst Lea',weiter:'lea'}]},
    kaufen:{n:[
      {info:'Du schickst den Code. In der VIP-Gruppe: Hunderte Mitglieder, überall Raketen und Gewinnscreenshots.'},
      {von:'wolf',t:'Willkommen im Rudel! Jetzt schnell $SAALE kaufen, bevor es zu spät ist. Die großen Krypto-Börsen lassen dich erst ab 18 rein. Nimm einfach das Konto oder die Kreditkarte deiner Eltern, merkt keiner.'},
      {recht:'Krypto-Plattformen in der EU brauchen seit Ende 2024 eine Zulassung (MiCA-Verordnung) und lassen meist erst ab 18 handeln. Heimlich das Konto oder die Karte der Eltern zu benutzen, ist nicht erlaubt und gibt richtig Ärger. Und: Für Kryptowährungen gibt es keine Einlagensicherung.'}],
      wahl:[
        {t:'Heimlich Mamas Kreditkarte nehmen und 500 € investieren',n:[
          {info:'Zwei Tage später: Der Kurs von $SAALE stürzt innerhalb einer Stunde um 98 % ab. Die VIP-Gruppe ist gelöscht, @wolf.of.saale hat dich blockiert.'},
          {recht:'Das war ein Rug Pull: Die Macher eines Coins locken Käufer an, verkaufen dann alles auf einmal und verschwinden mit dem Geld. Die 500 € und die 49 € sind weg.'},
          {von:'mama',t:'Auf meiner Kreditkarte sind 500 € für eine Krypto-Börse abgebucht. Wir müssen reden. Sofort.'}],ende:'abgezockt'},
        {t:'Nur 50 € von meinem Geld, über das Konto von Jonas’ großem Bruder',n:[
          {info:'Jonas’ Bruder kauft für dich $SAALE für 50 €.'},
          {info:'Zwei Tage später: Der Kurs stürzt innerhalb einer Stunde um 98 % ab. Die VIP-Gruppe ist weg.'},
          {recht:'Das war ein Rug Pull: Die Macher verkaufen alles und verschwinden. Deine 50 € und die 49 € für die VIP-Gruppe sind weg. Immerhin hast du nicht alles auf eine Karte gesetzt.'}],ende:'lehrgeld'},
        {t:'Lass mal. Ich frag lieber Lea.',weiter:'lea'}]},
    melden:{n:[
      {info:'Du blockierst @wolf.of.saale und meldest das Profil wegen Betrugsverdachts.'},
      {von:'jonas',t:'Ey, warum meldest du den? Der hat doch einen Lambo!'},
      {recht:'Melden lohnt sich: Nach dem Gesetz über digitale Dienste der EU müssen Plattformen Meldungen über rechtswidrige Inhalte prüfen. Betrugsverdacht kannst du auch der Polizei oder der Verbraucherzentrale melden.'}],
      wahl:[
        {t:'Jonas, der Lambo ist bestimmt gemietet. Wer wirklich reich ist, verkauft dir keine VIP-Gruppe für 49 €.',sag:true,weiter:'lea'},
        {t:'Und jetzt? Ich lass die 800 € einfach auf dem Girokonto.',n:[
          {info:'Zwei Jahre später: Die 800 € sind noch da. Aber die Preise sind gestiegen, der Führerschein ist teurer geworden.'},
          {recht:'Auf dem Girokonto gibt es keine Zinsen. Bei 3 % Inflation verlieren 800 € in zwei Jahren rund 46 € an Kaufkraft. Sicher und liquide ja, Rendite nein.'}],ende:'sparschwein'}]},
    lea:{n:[
      {von:'lea',t:'Oh nein, nicht der Wolf. Der wirbt nur für sich selbst. Lass uns das in Ruhe angehen: Wofür willst du das Geld?'}],
      wahl:[
        {t:'Für den Führerschein in zwei Jahren. Und irgendwann für eine eigene Wohnung.',sag:true,weiter:'plan'},
        {t:'Keine Ahnung. Hauptsache sicher.',sag:true,weiter:'sicher'}]},
    sicher:{n:[
      {von:'lea',t:'Sicher ist gut. Aber auf dem Girokonto frisst die Inflation dein Geld. Tagesgeld ist genauso sicher, bringt aber Zinsen.'},
      {von:'lea',t:'Und Geld, das du viele Jahre nicht brauchst, könnte in einem ETF für dich arbeiten.'}],
      wahl:[
        {t:'Alles aufs Tagesgeld. Börse ist mir zu unheimlich.',n:[
          {info:'Zwei Jahre später: Dein Geld ist sicher und hat ein paar Zinsen gebracht.'},
          {recht:'Für kurzfristige Ziele eine solide Wahl: sicher und liquide. Für Ziele in vielen Jahren verschenkst du aber Rendite. Nach Abzug der Inflation bleibt vom Zins kaum etwas übrig.'}],ende:'sparschwein'},
        {t:'Na gut. Wie würdest du es aufteilen?',sag:true,weiter:'plan'}]},
    plan:{n:[
      {von:'lea',t:'500 € kommen aufs Tagesgeld. Da sind sie sicher, du kommst jederzeit ran, und für den Führerschein sind sie da.'},
      {von:'lea',t:'Die anderen 300 € brauchst du lange nicht. Mit Mama kannst du ein Junior-Depot eröffnen und einen ETF auf den MSCI World kaufen. Danach geht ein Sparplan schon mit 25 € im Monat.'},
      {recht:'Das ist das Dreieck der Geldanlage in der Praxis: Für das kurzfristige Ziel zählen Sicherheit und Liquidität (Tagesgeld), für das langfristige Ziel Rendite mit breiter Streuung (ETF). Ein Junior-Depot eröffnen die Eltern für dich.'}],
      wahl:[
        {t:'Mama fragen, ob sie mit mir ein Junior-Depot eröffnet',n:[
          {von:'mama',t:'Gute Idee! Lass uns am Montag zusammen zur Bank gehen. Und den Wolf blockierst du bitte.'},
          {info:'Drei Jahre später: Der Führerschein ist bezahlt. Dein ETF war mal im Plus, mal im Minus. Du bleibst ruhig, denn du brauchst das Geld erst viel später.'}],ende:'klug'},
        {t:'Doch lieber alles in $SAALE. Das geht schneller.',weiter:'vip'}]}
  },
  enden:{
    klug:{titel:'Clever aufgeteilt',art:'gut',t:'Das Geld für den Führerschein liegt sicher auf Tagesgeld, für später läuft ein ETF-Sparplan. Den Wolf hast du durchschaut.'},
    sparschwein:{titel:'Auf Nummer sicher',art:'mittel',t:'Dein Geld ist sicher, aber es wächst kaum. Auf dem Girokonto verliert es sogar an Kaufkraft. Für langfristige Ziele wäre ein Teil in einem breit gestreuten ETF sinnvoll.'},
    lehrgeld:{titel:'Teures Lehrgeld',art:'mittel',t:'99 € sind weg, aber 701 € hast du gerettet. Merke: Gewinnversprechen in sozialen Medien sind ein Warnsignal.'},
    abgezockt:{titel:'Abgezockt',art:'schlecht',t:'549 € sind weg, mit Mama gibt es Ärger, und der Wolf ist verschwunden. Wer garantierte Gewinne verspricht, will nur dein Geld.'}}
};
