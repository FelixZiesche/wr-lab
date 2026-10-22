// Lernwerkstatt Anlagemöglichkeiten: Steckbriefe der Anlageformen, Tabelle zum Dreieck der Geldanlage, Anleger,
// Daten der Depot-Zeitmaschine, Fotos und die Figur „Wolf of Saale“ (eigene Illustration, fiktiv).
// Zahlen gerundet, Stand und Quelle stehen in der Quellenliste (geldanlage.js, sourcesHTML).

/* ---------- Zinsen und Preise heute (Stand Oktober 2026) ---------- */
export const STAND='Oktober 2026';
export const ZINS={
  sparbuch:'im Schnitt rund 0,7 %',
  tagesgeld:'im Schnitt rund 2,1 %, Spitzenangebote bis 4 %, viele Hausbanken aber nur 0,5 % oder weniger',
  festgeld1:'im Schnitt rund 2,5 %',
  festgeld3:'im Schnitt rund 2,7 %',
  tagesgeldTyp:2.1,      // Durchschnitt der Vergleichsportale, für Rechnungen
  inflation:3.3,         // Deutschland, September 2026 (Destatis)
  inflationTh:3.4,       // Thüringen, September 2026 (TLS)
  ezb:2.5                // Einlagenzins der EZB seit 16.09.2026
};
export const PREIS={doener:8.00,dticket:63.00};

/* ---------- Die drei Ziele der Geldanlage ---------- */
// Farben: Sicherheit = grün, Liquidität = orange, Rendite = blau (wie im Dreieck der Geldanlage)
export const ZIELE={
  s:{name:'Sicherheit',icon:'shield',frage:'Wie hoch ist das Risiko, Geld zu verlieren?',
    text:'Je höher die Sicherheit einer Geldanlage, desto geringer ist das Risiko, dass du Geld verlierst.'},
  l:{name:'Liquidität',icon:'water_drop',frage:'Wie schnell komme ich an mein Geld?',
    text:'Liquidität kommt von „liquide“, also flüssig: Bargeld und Bankguthaben. Je höher die Liquidität, desto leichter kommst du an dein Geld, wenn du es brauchst.'},
  r:{name:'Rendite',icon:'trending_up',frage:'Wie viel kann ich damit verdienen?',
    text:'Rendite kommt vom italienischen „rendita“, also Einkünfte oder Gewinn. Je höher die Rendite (Zinsen, Kursgewinne, Dividenden), desto mehr Geld kannst du verdienen.'}
};
export const STUFE={1:'niedrig',2:'mittel',3:'hoch'};

/* ---------- Steckbriefe der Anlageformen ----------
   w: Werte im Dreieck (1 niedrig, 2 mittel, 3 hoch) wie in der Tabelle aus dem Unterricht.
   auch: weitere vertretbare Einstufungen (gelten in der Tabelle ebenfalls als richtig).
   warum: Begründung pro Ziel, erscheint nach dem Prüfen. */
export const ANLAGEN=[
  {id:'sparbuch',name:'Sparbuch',icon:'menu_book',w:{s:3,l:2,r:1},auch:{l:[3]},
    kurz:'Klassisches Sparkonto bei der Bank',
    text:`Das Sparbuch ist ein kostenloses Sparkonto. Es ist sicher, bringt aber kaum Zinsen: ${ZINS.sparbuch} im Jahr (August 2026). Meist kannst du pro Monat bis zu 2.000 € abheben. Für mehr gilt eine Kündigungsfrist, oft drei Monate.`,
    warum:{s:'Bis 100.000 € pro Kunde und Bank durch die Einlagensicherung geschützt.',l:'Bis 2.000 € im Monat kommst du sofort ran, für mehr musst du warten.',r:'Die Zinsen sind sehr niedrig, meist unter der Inflationsrate.'}},
  {id:'tagesgeld',name:'Tagesgeld',icon:'account_balance',w:{s:3,l:3,r:1},auch:{r:[2]},
    kurz:'Sparkonto, an das du jeden Tag rankommst',
    text:`Beim Tagesgeld kommst du jeden Tag an dein ganzes Geld. Die Zinsen sind meist höher als beim Sparbuch: ${ZINS.tagesgeld} (${STAND}). Die Bank darf sie aber jederzeit ändern.`,
    warum:{s:'Durch die Einlagensicherung bis 100.000 € geschützt.',l:'Du kannst jeden Tag über dein ganzes Geld verfügen.',r:'Mehr als beim Sparbuch, aber oft kaum mehr als die Inflation.'}},
  {id:'festgeld',name:'Festgeld',icon:'lock_clock',w:{s:3,l:1,r:1},auch:{r:[2]},
    kurz:'Geld für eine feste Zeit zum festen Zins',
    text:`Beim Festgeld legst du dein Geld für eine feste Laufzeit an, zum Beispiel für ein oder drei Jahre. So lange kommst du nicht heran. Dafür garantiert dir die Bank einen festen Zins: ${ZINS.festgeld1} für ein Jahr, ${ZINS.festgeld3} für drei Jahre (${STAND}). Meist gilt: Je länger die Laufzeit, desto höher der Zins.`,
    warum:{s:'Fester Zins und Einlagensicherung bis 100.000 €.',l:'Bis zum Ende der Laufzeit kommst du nicht an dein Geld.',r:'Etwas mehr als beim Tagesgeld, aber immer noch niedrig.'}},
  {id:'anleihe',name:'Anleihe',icon:'receipt_long',w:{s:2,l:2,r:2},auch:{s:[3],l:[3]},
    kurz:'Du leihst einem Staat oder einer Firma Geld',
    text:'Eine Anleihe ist ein Schuldschein. Du leihst einem Staat oder einem Unternehmen Geld für eine feste Laufzeit und bekommst dafür jedes Jahr feste Zinsen. Anleihen von Staaten mit gutem Ruf wie Deutschland gelten als sehr sicher. Unternehmensanleihen sind riskanter, denn eine Firma kann pleitegehen. Pfandbriefe sind besonders sichere Anleihen von Banken. Anleihen werden an der Börse gehandelt, ihr Kurs schwankt.',
    warum:{s:'Hängt davon ab, wie zahlungsfähig der Herausgeber ist: Bundesanleihen sehr sicher, Unternehmensanleihen weniger.',l:'Du kannst sie an der Börse verkaufen, aber vor dem Ende der Laufzeit nur zum aktuellen Kurs.',r:'Feste Zinsen, meist etwas mehr als beim Festgeld.'}},
  {id:'aktie',name:'Aktie',icon:'show_chart',w:{s:1,l:3,r:3},
    kurz:'Ein kleines Stück eines Unternehmens',
    text:'Mit einer Aktie kaufst du einen kleinen Anteil an einem Unternehmen, einer Aktiengesellschaft, zum Beispiel an Jenoptik aus Jena. Du wirst Miteigentümer: Du darfst auf der Hauptversammlung abstimmen und bekommst einen Teil vom Gewinn, die Dividende. Aktien werden an der Börse gehandelt. Ihr Preis, der Kurs, entsteht aus Angebot und Nachfrage und kann stark schwanken: Chance auf hohe Gewinne, aber auch Risiko hoher Verluste.',
    warum:{s:'Der Kurs kann stark fallen, geht die Firma pleite, ist das Geld weg.',l:'An der Börse kannst du an jedem Handelstag verkaufen.',r:'Langfristig die höchsten Chancen, durch Kursgewinne und Dividenden.'}},
  {id:'immobilie',name:'Immobilie',icon:'apartment',w:{s:3,l:1,r:2},auch:{s:[2]},
    kurz:'Grundstücke, Häuser und Wohnungen',
    text:'Eine Immobilie ist ein Sachwert: Grundstücke und Gebäude wie Wohnhäuser oder Büros. Sie gilt als wertbeständig. Vermietest du sie, bekommst du jeden Monat Miete. Oft steigt auch ihr Wert, das hängt stark von Lage und Zustand ab. Der große Nachteil: Ein Verkauf kann lange dauern. Außerdem gibt es Risiken wie Wertverlust, etwa durch Fluglärm, oder einen Brand.',
    warum:{s:'Ein Sachwert, der meist seinen Wert behält. Aber Lage, Schäden oder Leerstand können ihn senken.',l:'Bis eine Immobilie verkauft ist, vergehen oft Monate.',r:'Mieteinnahmen und oft steigender Wert, abzüglich Kosten für Kredit, Steuern und Reparaturen.'}},
  {id:'fonds',name:'Fonds und ETF',icon:'donut_large',w:{s:2,l:3,r:3},auch:{r:[2]},
    kurz:'Viele Anlagen in einem Paket',
    text:'Ein Investmentfonds sammelt das Geld vieler Anleger und steckt es breit gestreut in viele Anlagen, zum Beispiel in Hunderte Aktien. Diese Streuung (Diversifikation) senkt das Risiko. Bei aktiven Fonds wählt ein Fondsmanager aus, was gekauft wird. Dafür verlangt die Fondsgesellschaft Gebühren. ETFs (Exchange Traded Funds) bilden einfach einen Index nach, etwa den DAX mit den 40 größten deutschen Unternehmen oder den MSCI World mit rund 1.300 Unternehmen aus 23 Industrieländern. Sie sind meist viel günstiger. Verkaufen kannst du schnell, aber nur zum aktuellen Kurs.',
    warum:{s:'Die Streuung senkt das Risiko, trotzdem schwankt der Wert mit der Börse.',l:'An jedem Handelstag verkaufbar.',r:'Langfristig ähnliche Chancen wie Aktien, weil viele Aktien drinstecken.'}},
  {id:'krypto',name:'Kryptowährung',icon:'currency_bitcoin',w:{s:1,l:3,r:3},
    kurz:'Digitales Geld ohne Bank und Staat',
    text:'Kryptowährungen wie Bitcoin oder Ethereum sind digitales Geld, das ohne Banken und Staaten funktioniert. Gehandelt werden sie auf Online-Plattformen, bei deutschen Anbietern meist erst ab 18. Die Kurse schwanken extrem: Chance auf sehr hohe Gewinne, aber ein Totalverlust ist jederzeit möglich. Es gibt keine Einlagensicherung. Kryptowährungen gelten als hochspekulativ und sehr riskant.',
    warum:{s:'Extreme Schwankungen, keine Einlagensicherung, Totalverlust möglich.',l:'Rund um die Uhr handelbar.',r:'Chance auf sehr hohe Gewinne, aber genauso auf hohe Verluste.'}}
];
export const anlage=id=>ANLAGEN.find(a=>a.id===id);

/* ---------- Anlageberatung: Anleger aus dem Unterrichtsmaterial, nach Thüringen verlegt ---------- */
export const ANLEGER=[
  {id:'berat-schmidt',titel:'Herr Schmidt',icon:'elderly',wer:'Herr Schmidt, 66 Jahre, Rentner aus Weimar',
    fall:'Herr Schmidt hat früh für den Ruhestand vorgesorgt und keine Geldsorgen. Jeden Monat bleibt Geld übrig, das er anlegen möchte. Ein Verlust würde ihn nicht sehr schmerzen. Er interessiert sich für die Börse und hat als Rentner viel Zeit.',
    optionen:['Sparbuch','Festgeld','Aktien','Tagesgeld'],r:2,
    e:'Herr Schmidt kann Verluste verkraften, braucht das Geld nicht sofort und hat Zeit, sich um seine Anlagen zu kümmern. Er kann mehr Risiko eingehen und auf Rendite setzen, am besten breit gestreut.'},
  {id:'berat-nayla',titel:'Nayla',icon:'face',wer:'Nayla, 14 Jahre, Schülerin aus Apolda',
    fall:'Nayla hat zur Jugendweihe 500 € geschenkt bekommen. Im Moment braucht sie kein Extra-Taschengeld. In drei Jahren möchte sie davon aber eine Reise nach Thailand bezahlen.',
    optionen:['Aktien eines einzelnen Unternehmens','Festgeld für drei Jahre','Bitcoin','Eine Immobilie'],r:1,
    e:'Nayla braucht das Geld sicher in drei Jahren. Festgeld bringt einen festen Zins und ist durch die Einlagensicherung geschützt. Aktien oder Bitcoin könnten genau dann im Minus sein, wenn sie das Geld braucht.'},
  {id:'berat-simon',titel:'Herr Simon',icon:'man',wer:'Herr Simon, 48 Jahre, Versicherungskaufmann aus Erfurt, zwei Kinder',
    fall:'Herr Simon hat 10.000 € auf dem Tagesgeldkonto gespart. Er braucht das Geld gerade nicht und möchte es für zehn Jahre fest anlegen. Es soll sich etwas mehr lohnen als Tagesgeld oder Festgeld, aber auch sicher sein, denn es ist für seine Altersvorsorge.',
    optionen:['Kryptowährung','Sparbuch','Aktien eines Start-ups','Bundesanleihen'],r:3,
    e:'Anleihen von Staaten mit gutem Ruf wie Deutschland gelten als sehr sicher und bringen feste Zinsen, meist etwas mehr als Festgeld. Die Laufzeit von zehn Jahren passt zu seinem Plan.'},
  {id:'berat-franka',titel:'Franka',icon:'woman',wer:'Franka, 19 Jahre, Auszubildende in Jena',
    fall:'Franka kommt mit ihrer Ausbildungsvergütung gerade so über die Runden. Jeden Monat schafft sie es, 50 € zu sparen. Andere Ersparnisse hat sie nicht. Das Geld soll jederzeit verfügbar sein, zum Beispiel für eine neue Waschmaschine oder eine Autoreparatur.',
    optionen:['Tagesgeld','Festgeld für fünf Jahre','Aktien','Eine Immobilie'],r:0,
    e:'Franka baut gerade ihren Notgroschen auf. Auf Tagesgeld kommt sie jeden Tag an ihr Geld, es ist sicher und bringt etwas Zinsen. Festgeld wäre gesperrt, Aktien könnten im falschen Moment im Minus sein.'},
  {id:'berat-schulz',titel:'Frau Schulz',icon:'elderly_woman',wer:'Frau Schulz, 51 Jahre, Physiotherapeutin aus Gera, verheiratet',
    fall:'Frau Schulz hat 200.000 € von ihren Eltern geerbt. Sie möchte das Geld dauerhaft in etwas Wertbeständiges anlegen und auf keinen Fall damit an der Börse spekulieren.',
    optionen:['Aktien','Eine Immobilie','Kryptowährung','Tagesgeld'],r:1,
    e:'Eine Immobilie ist ein Sachwert, der als wertbeständig gilt, und bringt Mieteinnahmen. Mit der Börse hat sie nichts zu tun. Dass ein Verkauf lange dauert, stört Frau Schulz nicht, denn sie will dauerhaft anlegen.'},
  {id:'berat-mostafa',titel:'Familie Mostafa',icon:'family_restroom',wer:'Herr Mostafa, 30 Jahre, Autoverkäufer, und Frau Mostafa, 28 Jahre, Tischlerin, aus Nordhausen',
    fall:'Die Mostafas sind vor Kurzem Eltern geworden. Für ihren Sohn möchten sie langfristig Geld anlegen, zum Beispiel für seine spätere Ausbildung oder das Studium. Sie verdienen nicht besonders viel, können aber jeden Monat 100 € einsetzen.',
    optionen:['Sparbuch','Bitcoin','Festgeld für ein Jahr','ETF-Sparplan'],r:3,
    e:'Bis der Sohn das Geld braucht, vergehen fast 20 Jahre. Ein ETF-Sparplan streut das Geld breit, kostet wenig und hat Zeit, Kursschwankungen auszusitzen. Schon kleine Monatsbeträge wachsen durch den Zinseszins.'}
];

/* ---------- Fotos ---------- */
export const FOTO={
  boerse:{src:'img/boerse.jpg',motiv:'Bulle und Bär vor der Frankfurter Börse',alt:'Die Bronzefiguren Bulle und Bär stehen sich vor dem Gebäude der Frankfurter Wertpapierbörse gegenüber. Der Bulle steht für steigende, der Bär für fallende Kurse.',
    credit:'giesing / Flickr, CC BY 2.0',link:'https://www.flickr.com/photos/46074423@N00/14842086960',lizenz:'https://creativecommons.org/licenses/by/2.0/'}
};

/* ---------- Figur: Wolf of Saale (fiktiv) ----------
   Eigene Illustration: Wolf im Nadelstreifenanzug mit Sonnenbrille und einem Fächer aus Geldscheinen.
   Farben aus geldanlage.css (Custom Colors --ga-…), hell und dunkel. */
export function wolfSVG(titel='Der Wolf of Saale, eine erfundene Figur: ein Wolf im Nadelstreifenanzug mit Sonnenbrille, breitem Grinsen und einem Fächer aus Geldscheinen'){
  const schein=(x,y,d)=>`<g transform="rotate(${d} ${x} ${y})"><rect x="${x-22}" y="${y-13}" width="44" height="26" rx="3" fill="var(--ga-geld)" stroke="var(--ga-geld-linie)" stroke-width="1.5"/><circle cx="${x}" cy="${y}" r="7" fill="none" stroke="var(--ga-geld-linie)" stroke-width="1.5"/><text x="${x}" y="${y+4}" text-anchor="middle" font-size="10" font-weight="700" fill="var(--ga-geld-linie)">€</text></g>`;
  return `<svg class="ga-wolf" viewBox="0 0 240 240" role="img" aria-label="${titel}">
  <circle cx="120" cy="120" r="116" fill="var(--ga-wolf-bg)"/>
  <!-- Anzug -->
  <path d="M38 240 C42 190 70 172 120 168 C170 172 198 190 202 240 Z" fill="var(--ga-anzug)"/>
  <g stroke="var(--ga-streifen)" stroke-width="1.2" opacity=".55"><path d="M62 236 L70 186"/><path d="M80 238 L86 178"/><path d="M160 238 L154 178"/><path d="M178 236 L170 186"/></g>
  <path d="M96 170 L120 230 L144 170 Z" fill="var(--ga-hemd)"/>
  <path d="M96 170 L120 212 L108 236 L78 182 Z" fill="var(--ga-revers)"/><path d="M144 170 L120 212 L132 236 L162 182 Z" fill="var(--ga-revers)"/>
  <path d="M113 178 L127 178 L124 188 L130 222 L120 232 L110 222 L116 188 Z" fill="var(--ga-krawatte)"/>
  <!-- Ohren -->
  <path d="M62 92 L58 30 L104 66 Z" fill="var(--ga-fell)"/><path d="M68 84 L66 46 L94 68 Z" fill="var(--ga-fell-innen)"/>
  <path d="M178 92 L182 30 L136 66 Z" fill="var(--ga-fell)"/><path d="M172 84 L174 46 L146 68 Z" fill="var(--ga-fell-innen)"/>
  <!-- Kopf -->
  <path d="M120 54 C160 54 186 82 184 116 C182 140 166 156 150 166 L120 178 L90 166 C74 156 58 140 56 116 C54 82 80 54 120 54 Z" fill="var(--ga-fell)"/>
  <path d="M120 100 C142 100 156 118 154 138 C152 156 138 170 120 172 C102 170 88 156 86 138 C84 118 98 100 120 100 Z" fill="var(--ga-fell-hell)"/>
  <path d="M72 128 L56 120 L74 140 Z" fill="var(--ga-fell)"/><path d="M168 128 L184 120 L166 140 Z" fill="var(--ga-fell)"/>
  <!-- Sonnenbrille -->
  <path d="M74 96 H112 C114 96 114 98 113 101 L108 116 C107 119 104 121 100 121 H84 C80 121 77 119 76 116 L73 101 C72 98 72 96 74 96 Z" fill="var(--ga-brille)"/>
  <path d="M128 96 H166 C168 96 168 98 167 101 L164 116 C163 119 160 121 156 121 H140 C136 121 133 119 132 116 L127 101 C126 98 126 96 128 96 Z" fill="var(--ga-brille)"/>
  <path d="M112 100 Q120 95 128 100" fill="none" stroke="var(--ga-brille)" stroke-width="4"/>
  <path d="M80 101 L90 101 L84 113 Z" fill="var(--ga-glanz)" opacity=".7"/><path d="M134 101 L144 101 L138 113 Z" fill="var(--ga-glanz)" opacity=".7"/>
  <!-- Nase und Grinsen -->
  <path d="M110 128 C110 122 130 122 130 128 C130 134 124 138 120 138 C116 138 110 134 110 128 Z" fill="var(--ga-brille)"/>
  <path d="M96 146 Q120 168 144 146 Q120 156 96 146 Z" fill="var(--ga-mund)"/>
  <path d="M100 148 L104 154 L108 150 L112 156 L116 151 L120 157 L124 151 L128 156 L132 150 L136 154 L140 148 Q120 156 100 148 Z" fill="var(--ga-hemd)"/>
  <!-- Geldfächer und Hand -->
  ${schein(186,186,-28)}${schein(196,176,-8)}${schein(202,168,14)}
  <ellipse cx="184" cy="200" rx="15" ry="11" fill="var(--ga-fell)"/>
  </svg>`;
}
