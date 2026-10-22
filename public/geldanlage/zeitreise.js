// Depot-Zeitmaschine: echte Jahresrenditen 2018 bis 2025 in Euro (gerundet) und die Quellenliste des Themas.
// r: Veränderung im Kalenderjahr in % (Jahresende zu Jahresende). riskant: wird bei „Alles verkaufen“ aufs Tagesgeld umgeschichtet.
export const ZEIT={
  jahre:[2018,2019,2020,2021,2022,2023,2024,2025],
  anlagen:[
    {id:'tagesgeld',name:'Tagesgeld',icon:'account_balance',info:'Durchschnittszins aller Banken',
      r:[0.02,0.01,0,-0.01,0,0.37,0.58,0.47]},
    {id:'festgeld',name:'Festgeld',icon:'lock_clock',info:'Laufzeit ein Jahr, jedes Jahr neu angelegt',
      r:[0.29,0.18,0.13,0.02,0.53,2.75,3.02,1.91]},
    {id:'anleihen',name:'Bundesanleihen',icon:'receipt_long',info:'Fonds mit deutschen Staatsanleihen',
      r:[1.0,0.9,0.7,-1.8,-12.5,4.8,1.2,0.5]},
    {id:'etf',name:'ETF MSCI World',icon:'donut_large',info:'rund 1.300 Unternehmen aus 23 Ländern',riskant:true,
      r:[-4.1,30.0,6.3,31.1,-12.8,19.6,26.6,6.8]},
    {id:'jenoptik',name:'Aktie Jenoptik',icon:'show_chart',info:'ein einzelnes Unternehmen aus Jena (nur Kurs)',riskant:true,
      r:[-17.3,11.9,-1.4,47.9,-31.2,11.3,-21.1,-12.8]},
    {id:'bitcoin',name:'Bitcoin',icon:'currency_bitcoin',info:'Kryptowährung, Kurs in Euro',riskant:true,
      r:[-72.4,96.8,270.3,71.5,-62.1,148.2,135.7,-17.4]}],
  inflation:[1.8,1.4,0.5,3.1,6.9,5.9,2.2,2.2],
  ereignisse:{
    2018:{t:'Handelsstreit und geplatzte Krypto-Blase',d:'Die USA und China überziehen sich mit Zöllen, die Börsen fallen. Der DAX verliert 18 %. Bitcoin stürzt nach dem Hype von 2017 um mehr als 70 % ab.'},
    2019:{t:'Das große Comeback',d:'Die Börsen erholen sich kräftig. Wer 2018 durchgehalten hat, hat seine Verluste schnell wieder aufgeholt. Auf dem Tagesgeld gibt es praktisch keine Zinsen.'},
    2020:{t:'Corona-Pandemie',d:'Im März stürzen die Börsen innerhalb weniger Wochen um rund ein Drittel ab. Staaten und Zentralbanken helfen mit Milliarden, bis Jahresende erholen sich die Kurse. Bitcoin vervielfacht sich.'},
    2021:{t:'Rekorde und Hype',d:'Aktien und Kryptowährungen steigen auf Rekordstände, überall ist von Bitcoin die Rede. Gegen Jahresende ziehen die Preise an: Die Inflation steigt auf 3,1 %.'},
    2022:{t:'Krieg, Energiekrise, Zinswende',d:'Russland greift die Ukraine an, Energie wird teuer, die Inflation steigt auf 6,9 %. Die EZB erhöht die Zinsen. Aktien, Anleihen und Bitcoin fallen gleichzeitig.'},
    2023:{t:'Die Zinsen sind zurück',d:'Die Inflation sinkt langsam. Tagesgeld und Festgeld bringen wieder spürbar Zinsen. Der Boom rund um künstliche Intelligenz treibt die Börsen nach oben.'},
    2024:{t:'Jahr der Rekorde',d:'DAX und MSCI World erreichen neue Höchststände, Bitcoin steigt über 90.000 €. Die einzelne Jenoptik-Aktie fällt dagegen um ein Fünftel.'},
    2025:{t:'Zollschock und Achterbahn',d:'Im April lassen neue US-Zölle die Börsen weltweit einbrechen, danach erholen sie sich. Bitcoin erreicht im Herbst einen Rekord und fällt bis Jahresende wieder deutlich.'}},
  krise:{
    2018:'Die Börsen sind im Minus, Bitcoin ist eingebrochen. In den Nachrichten ist von einem Crash die Rede.',
    2022:'Krieg, Inflation, fallende Kurse: Viele Anleger verkaufen in Panik.'},
  fazit:'Bitcoin hat im Rückblick am meisten gebracht. Aber Ende 2018 lag er mehr als 70 % im Minus, Ende 2022 wieder, und viele andere Coins sind ganz verschwunden. Die Jenoptik-Aktie aus Jena lag Ende 2025 im Minus, 2026 hat sie sich bis Oktober mehr als verdoppelt. Der breit gestreute ETF hat geschwankt, sich aber mehr als verdoppelt. 2018 wusste niemand, wie es ausgeht. Deshalb gilt: breit streuen, langfristig anlegen, in Krisen durchhalten.',
  quellen:[
    'Inflationsrate: Destatis, Verbraucherpreisindex, Pressemitteilung Nr. 364 vom 13.10.2026 (September 2026: 3,3 %) und Nr. 019 vom 16.01.2026 (Jahreswerte 2021–2025), Lange Reihen (2016–2020) · Thüringer Landesamt für Statistik, Pressemitteilung 248/2026 vom 05.10.2026 (Thüringen September 2026: 3,4 %)',
    'Zinsen: Deutsche Bundesbank, MFI-Zinsstatistik (Neugeschäft private Haushalte: täglich fällig, Laufzeit bis 1 Jahr, Spareinlagen; Jahresdurchschnitte 2018–2025, Stand August 2026) · tagesgeldvergleich.net, Marktanalyse vom 01.10.2026 (Tagesgeld Ø 2,08 %, fünf beste Banken 4,04 %, Festgeld 1 Jahr Ø 2,53 %, 3 Jahre Ø 2,67 %) · EZB: Einlagenzins 2,50 % seit 16.09.2026',
    'Kurse 2018–2025 in Euro: MSCI World Net Return EUR (MSCI, Index-Level-Daten) · Bundesanleihen: iShares eb.rexx Government Germany UCITS ETF (extraETF, 2021–2025; 2018–2020 eigene Näherung aus Yahoo Finance) · Bitcoin in Euro und Jenoptik (Xetra, nur Kurs ohne Dividende): Yahoo Finance, Schlusskurse am Jahresende · Jenoptik 2026: rund +106 % bis 21.10.2026. Alle Werte gerundet, ohne Kosten und Steuern.',
    'MSCI World: rund 1.300 Unternehmen aus 23 Industrieländern (MSCI, Factsheet MSCI World Index) · DAX: 40 Unternehmen (Deutsche Börse) · ETF-Kosten: iShares Core MSCI World 0,20 % pro Jahr (justETF, Oktober 2026), aktive Aktienfonds weltweit rund 1,9 % pro Jahr (Stiftung Warentest)',
    'Einlagensicherungsgesetz: § 8 Abs. 1 EinSiG (100.000 € pro Kunde und Bank) · Wertpapierhandelsgesetz: § 64 WpHG (Geeignetheit der Anlageberatung) · MiCA-Verordnung (EU) 2023/1114, Regeln für Krypto-Dienstleister seit 30.12.2024 · Gesetz über digitale Dienste (EU) 2022/2065, Art. 16 (Meldeverfahren)',
    'BaFin: Memecoins – „Glücksspiel statt Geldanlage“, Anlagetipps in sozialen Medien, BaFinJournal 09/2024 zu Finfluencern (37 % der Befragten wussten nicht, dass Finfluencer meist bezahlt werden), Factsheet für Finfluencer vom 09.01.2026 · SCHUFA Jugend-Finanzmonitor 2025: 25 % der 16- bis 25-Jährigen informieren sich in sozialen Medien über Geld, nur 8 % vertrauen Influencern',
    'Juniordepot und Sparpläne: Finanztip, Juniordepot-Vergleich 2026 (Eltern eröffnen das Depot, Sparpläne ab 1 €) · Frühstart-Rente: Deutscher Bundestag, Beschluss vom 16.10.2026 (Drucksachen 21/7864, 21/8606), Zustimmung des Bundesrats ausstehend (Stand Oktober 2026), Deutsche Rentenversicherung, FAQ Frühstart-Rente',
    'Jugendweihe: rund 8.300 Anmeldungen in Thüringen 2026 (Verein Jugendweihe Thüringen, dpa, April 2026) · Döner in Jena 8,00 € (Beispielpreis wie in der Warenkorb-Werkstatt) · Deutschlandticket 63 € im Monat (2026)']
};
