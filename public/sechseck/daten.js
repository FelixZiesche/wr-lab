// Grunddaten und Grafiken des magischen Sechsecks, gemeinsam für Werkstätten und Planspiel.
import { esc, clamp } from '../shared/js/ui.js';

/* ---------- Grunddaten ---------- */
export const ORDER=['P','B','W','A','U','V'];
export const G={
  P:{name:'Stabilität des Preisniveaus',short:'Preisniveau',since:'1967',law:'§ 1 StabG; für die EZB vorrangig: Art. 127 AEUV',
     ind:'Verbraucherpreisindex (VPI), im Euroraum der Harmonisierte VPI (HVPI); Veränderung zum Vorjahr = Inflationsrate',
     target:'Inflationsrate von 2 % auf mittlere Sicht (EZB-Strategie seit 2021, symmetrisch: Abweichungen nach oben und unten sind gleich unerwünscht)',
     now:'3,3 % im September 2026 (vorläufig), getrieben von Energie (+14,9 %); Kerninflation 2,4 %. Jahresdurchschnitt 2025: 2,2 %',
     who:'Vor allem die Europäische Zentralbank (Geldpolitik), daneben Tarifpartner (Löhne) und Staat (Steuern, Abgaben, administrierte Preise)',
     risk:'Inflation: Kaufkraftverlust, Umverteilung zulasten von Sparern und Geringverdienern, Gefahr einer Lohn-Preis-Spirale. Deflation: Kaufzurückhaltung, Investitionsstau, steigende reale Schuldenlast',
     tool:'preis', chip:'3,3 %', chipLab:'Inflation Sept. 2026'},
  B:{name:'Hoher Beschäftigungsstand',short:'Beschäftigung',since:'1967',law:'§ 1 StabG',
     ind:'Arbeitslosenquote der Bundesagentur für Arbeit (registrierte Arbeitslose bezogen auf alle zivilen Erwerbspersonen); ergänzend ILO-Erwerbslosenquote und Unterbeschäftigung',
     target:'Keine gesetzliche Zahl. Faustregel: Unter etwa 3 % spricht man von Vollbeschäftigung, weil Sucharbeitslosigkeit immer bleibt',
     now:'6,4 % im September 2026 (2,994 Mio. Arbeitslose); Unterbeschäftigung 3,6 Mio. Thüringen: 6,5 % (Juli 2026)',
     who:'Staat (Fiskal-, Bildungs-, Arbeitsmarktpolitik), Bundesagentur für Arbeit, Tarifpartner, Unternehmen',
     risk:'Einkommensverlust und Armutsrisiko, Ausfälle bei Steuern und Sozialbeiträgen, Entwertung von Qualifikationen, gesellschaftliche Folgen wie Ausgrenzung',
     tool:'beschaeftigung', chip:'6,4 %', chipLab:'Arbeitslosenquote Sept. 2026'},
  W:{name:'Stetiges und angemessenes Wirtschaftswachstum',short:'Wachstum',since:'1967',law:'§ 1 StabG',
     ind:'Veränderungsrate des realen (preisbereinigten) Bruttoinlandsprodukts gegenüber dem Vorjahr',
     target:'Keine feste Zahl. „Stetig“ heißt ohne starke Schwankungen, „angemessen“ heißt: das Produktionspotenzial auslasten. Das Potenzialwachstum liegt in Deutschland wegen der schrumpfenden Erwerbsbevölkerung derzeit deutlich unter 1 %',
     now:'2025: +0,2 % nach zwei Rezessionsjahren (2023: −0,9 %, 2024: −0,5 %). 2. Quartal 2026: +0,3 % zum Vorquartal. Prognose 2026: +1,3 %',
     who:'Staat (Investitionen, Steuern, Rahmenbedingungen), indirekt die EZB über Zinsen, Unternehmen und Haushalte über Investitionen und Konsum',
     risk:'Zu wenig: Rezession, Arbeitslosigkeit, sinkende Steuereinnahmen. Zu viel: Überhitzung, Inflation, Ressourcenverbrauch',
     tool:'wachstum', chip:'+1,3 %', chipLab:'BIP-Prognose 2026'},
  A:{name:'Außenwirtschaftliches Gleichgewicht',short:'Außenwirtschaft',since:'1967',law:'§ 1 StabG',
     ind:'Saldo der Leistungsbilanz in Prozent des BIP (Handel mit Waren und Dienstleistungen plus Primär- und Sekundäreinkommen)',
     target:'Annähernd ausgeglichene Leistungsbilanz. Die EU-Frühwarnschwellen liegen bei mehr als +6 % oder weniger als −4 % des BIP (Dreijahresdurchschnitt)',
     now:'2025: Überschuss von rund 200 Mrd. € bzw. 4,4 % des BIP; Prognose 2026: 4,7 %',
     who:'Bundesregierung, EU (Handelspolitik ist EU-Kompetenz), Wechselkurs des Euro (frei schwankend)',
     risk:'Überschuss: Abhängigkeit vom Export, Handelskonflikte und Zölle, Risiko für die im Ausland angelegten Ersparnisse. Defizit: wachsende Auslandsverschuldung',
     tool:'aussen', chip:'+4,4 %', chipLab:'Leistungsbilanz 2025 (in % BIP)'},
  U:{name:'Schutz der natürlichen Lebensgrundlagen',short:'Umwelt',since:'Erweiterung',law:'Art. 20a GG (seit 1994), Bundes-Klimaschutzgesetz',
     ind:'Treibhausgasemissionen in Mio. t CO₂-Äquivalente; ergänzend Anteil erneuerbarer Energien, Flächenverbrauch, Artenvielfalt',
     target:'Klimaschutzgesetz: −65 % bis 2030 und −88 % bis 2040 gegenüber 1990, Netto-Treibhausgasneutralität bis 2045',
     now:'2025: rund 649 Mio. t, das sind etwa 48 % weniger als 1990. Für 2030 sind rund 438 Mio. t erlaubt',
     who:'Bund und EU (Emissionshandel, CO₂-Preis, Ordnungsrecht), Länder und Kommunen, Unternehmen und Haushalte',
     risk:'Klimafolgeschäden, Kosten für künftige Generationen. Das Bundesverfassungsgericht hat 2021 geurteilt, dass zu spätes Handeln die Freiheit künftiger Generationen verletzt',
     tool:'umwelt', chip:'−48 %', chipLab:'Treibhausgase ggü. 1990'},
  V:{name:'Gerechte Einkommens- und Vermögensverteilung',short:'Verteilung',since:'Erweiterung',law:'Sozialstaatsprinzip, Art. 20 Abs. 1 GG',
     ind:'Gini-Koeffizient, Armutsgefährdungsquote (Anteil der Menschen mit weniger als 60 % des mittleren Einkommens), Verhältnis oberstes zu unterstem Fünftel (S80/S20)',
     target:'Politisch umstritten, denn „gerecht“ ist eine Wertfrage: Leistungs-, Bedarfs- oder Chancengerechtigkeit?',
     now:'Armutsgefährdungsquote 16,1 % (2025), Schwelle für Alleinlebende 1.446 € netto im Monat. Gini der verfügbaren Einkommen rund 0,29 bis 0,30, bei Vermögen über 0,7',
     who:'Staat (Steuer-, Sozial-, Bildungspolitik), Tarifpartner (Lohnpolitik), Mindestlohnkommission',
     risk:'Schwindender gesellschaftlicher Zusammenhalt, ungleiche Bildungs- und Aufstiegschancen, politische Polarisierung, schwache Binnennachfrage',
     tool:'verteilung', chip:'16,1 %', chipLab:'Armutsgefährdung 2025'}
};
export const gc = k => `var(--g-${k})`;

/* ---------- Sechseck-Geometrie ---------- */
export function hexPts(cx,cy,r,n=6){return Array.from({length:n},(_,i)=>{const a=(-90+360/n*i)*Math.PI/180;return [cx+r*Math.cos(a),cy+r*Math.sin(a)]})}
export const ptsStr=p=>p.map(q=>q.map(v=>v.toFixed(1)).join(',')).join(' ');
export function hexDot(k){return `<svg class="hexdot" viewBox="0 0 12 12" aria-hidden="true"><polygon points="6,0.5 11,3.3 11,8.7 6,11.5 1,8.7 1,3.3" fill="${gc(k)}"/></svg>`}

/* ---------- Radar ---------- */
export function radar(series,opt={}){
  const W=opt.w||520,H=opt.h||380,cx=W/2,cy=H/2+4,r=opt.r||130;
  let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(opt.label||'Zielerreichung als Sechseck')}">`;
  [25,50,75,100].forEach(v=>{s+=`<polygon points="${ptsStr(hexPts(cx,cy,r*v/100))}" fill="none" class="s-line" stroke-width="1"/>`});
  s+=`<text x="${cx+4}" y="${cy-r-4}" class="t-mu" font-size="10">100</text><text x="${cx+4}" y="${cy-r/2-3}" class="t-mu" font-size="10">50</text>`;
  const outer=hexPts(cx,cy,r);
  outer.forEach(([x,y])=>{s+=`<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" class="s-line"/>`});
  series.forEach(se=>{
    const pts=ORDER.map((k,i)=>{const v=clamp(se.v[k],0,100)/100;const [x,y]=outer[i];return [cx+(x-cx)*v,cy+(y-cy)*v]});
    s+=`<polygon points="${ptsStr(pts)}" fill="${se.fill||'none'}" fill-opacity="${se.fo??0.18}" stroke="${se.stroke}" stroke-width="${se.sw||2.5}" ${se.dash?`stroke-dasharray="${se.dash}"`:''}/>`;
    if(!se.dash) pts.forEach(([x,y],i)=>{s+=`<circle cx="${x}" cy="${y}" r="4.5" fill="${gc(ORDER[i])}"/>`});
  });
  const lab=hexPts(cx,cy,r+20);
  ORDER.forEach((k,i)=>{const [x,y]=lab[i];const a=Math.abs(x-cx)<5?'middle':(x>cx?'start':'end');s+=`<text x="${x}" y="${y+(i===0?-2:i===3?10:4)}" text-anchor="${a}" fill="${gc(k)}" font-size="13" font-weight="700">${G[k].short}</text>`});
  return s+'</svg>';
}

/* ---------- Ausgangslage Deutschland (Simulator, Check, Planspiel) ---------- */
export const START={
  de:{n:'Deutschland, Herbst 2026',v:{P:74,B:49,W:89,A:44,V:68,U:74},t:'Inflation 3,3 %, Arbeitslosenquote 6,4 %, Wachstumsprognose 1,3 %, Leistungsbilanz +4,7 %, Treibhausgase −48 %. Staatsdefizit steigt.'},
  rez:{n:'Tiefe Rezession',v:{P:90,B:35,W:15,A:55,V:55,U:80},t:'Die Wirtschaft schrumpft um 2 %, die Arbeitslosigkeit steigt schnell, die Preise sind stabil, die Emissionen sinken – weil weniger produziert wird.'},
  boom:{n:'Überhitzung',v:{P:25,B:88,W:80,A:60,V:62,U:45},t:'Volle Auftragsbücher, Fachkräftemangel, Inflation bei 6 %. Die Emissionen steigen mit der Produktion.'}
};

/* ---------- Fotos der Ziele (Unsplash-Lizenz) ---------- */
export const GOAL_IMG={"P": {"src": "img/ziel-P.jpg", "alt": "Supermarktregal mit gelben Preisschildern", "credit": "Yosuke Ota"}, "B": {"src": "img/ziel-B.jpg", "alt": "Beschäftigte an einer Montagelinie in einer Fabrikhalle", "credit": "Remy Gieling"}, "W": {"src": "img/ziel-W.jpg", "alt": "Baukräne vor Abendhimmel", "credit": "Artem Labunsky"}, "A": {"src": "img/ziel-A.jpg", "alt": "Gestapelte Container von Hapag-Lloyd im Hamburger Hafen", "credit": "Wolfgang Weiser"}, "U": {"src": "img/ziel-U.jpg", "alt": "Windräder über einem Getreidefeld bei Sonnenuntergang", "credit": "Karsten Würth"}, "V": {"src": "img/ziel-V.jpg", "alt": "Münzstapel, die von links nach rechts immer höher werden", "credit": "Marcel Strauß"}};
