// Lernwerkstatt Anlagemöglichkeiten: Navigation, alle Werkstätten, Geldschmelze, Dreieck, Anlage-Check, Schneeball,
// Depot-Zeitmaschine, Anlageberatung, Chat-Abenteuer und der Lernraum (Wand, Lehrerpanel, Live-Abstimmung).
import { test, expect, device } from './helpers.mjs';

const GA = '/geldanlage/';
const TITEL = {
  bauchgefuehl: 'Stimmt das?', geldschmelze: 'Die Geldschmelze', dreieck: 'Das magische Dreieck', anlagecheck: 'Acht Anlagen im Check',
  beratung: 'Ihr seid die Anlageberater', schneeball: 'Der Schneeball-Rechner', zeitmaschine: 'Die Depot-Zeitmaschine',
  regeln: 'Die goldenen Regeln', sichern: 'Hefteintrag und Bauchgefühl-Check', wissenscheck: 'Wissenscheck'
};
// Wert eines Schiebereglers setzen und das input-Ereignis auslösen
const regler = (loc, v) => loc.evaluate((el, v) => { el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); }, String(v));

test('Startseite: Leitfrage, Wolf of Saale als fiktiver Beitrag, Bereiche in der Navigation', async ({ page }) => {
  await page.goto(GA);
  await expect(page).toHaveTitle('Lernwerkstatt Anlagemöglichkeiten');
  await expect(page.locator('.banner h2')).toContainText('Wie legst du dein Geld clever an?');
  await expect(page.locator('.banner .credit')).toContainText('CC BY 2.0');
  await expect(page.locator('.ga-post').first()).toContainText('fiktiver Beitrag');
  await expect(page.locator('.dest-cards .dest')).toHaveCount(5);
  for (const [bereich, karte] of [['grundlagen', 'dreieck'], ['anlagen', 'beratung'], ['strategie', 'zeitmaschine']]) {
    await page.locator(`#rail-items [data-dest="${bereich}"]`).click();
    await expect(page.locator(`#view [data-tool="${karte}"]`)).toBeVisible();
  }
  await page.locator('#rail-items [data-dest="wolf"]').click();
  await expect(page.locator('#view-title')).toHaveText('Der Wolf of Saale');
  await expect(page.locator('[data-chat="wolf-chat"]')).toBeVisible();
});

test('Alle Werkstätten öffnen sich über ihre Adresse', async ({ page }) => {
  for (const [id, titel] of Object.entries(TITEL)) {
    await page.goto('about:blank');
    await page.goto(`${GA}#${id}`);
    await expect(page.locator('#modal-title'), id).toHaveText(titel);
  }
});

test('Geldschmelze: Schätzung prüfen, Kaufkraft und Realzins mit den Reglern', async ({ page }) => {
  await page.goto(`${GA}#geldschmelze`);
  await page.locator('#gs-tipp').fill('90');
  await page.locator('#gs-pruefen').click();
  await expect(page.locator('#gs-fb')).toContainText('Sehr gut geschätzt!');
  await expect(page.locator('#gs-fb')).toContainText('92 Döner');
  // Nach 15 Jahren bei 2 % Inflation: 1.000 € / 1,02^15 ≈ 743 €
  await expect(page.locator('#gs-wert')).toHaveText('743 €');
  await expect(page.locator('#gs-real')).toHaveText('−2,0 %');
  await page.locator('[data-gs-preset="2.1,3.3"]').click();
  await expect(page.locator('#gs-real')).toHaveText('−1,2 %');
  await regler(page.locator('#gs-j'), 0);
  await expect(page.locator('#gs-wert')).toHaveText('1.000 €');
  await expect(page.locator('#gs-d')).toHaveText('125');
});

test('Dreieck: 100 Punkte verteilen, passende Anlage, perfekte Anlage gibt es nicht', async ({ page }) => {
  await page.goto(`${GA}#dreieck`);
  await expect(page.locator('#dr-name')).toHaveText('Anleihe');
  await regler(page.locator('#dr-s'), 100);
  await expect(page.locator('#dr-lo')).toHaveText('0 Punkte');
  await expect(page.locator('#dr-name')).toHaveText('Festgeld');
  await expect(page.locator('#dr-alarm')).toContainText('Konflikt!');
  await regler(page.locator('#dr-l'), 50);
  await expect(page.locator('#dr-so')).toHaveText('50 Punkte');
  await expect(page.locator('#dr-name')).toHaveText('Tagesgeld');
  await page.locator('#dr-alles').click();
  await expect(page.locator('#dr-alarm .fb')).toContainText('Geht nicht!');
  await expect(page.locator('#dr-alarm .fb')).toBeFocused();
  // Tippen ins Dreieck: oben an der Spitze liegt die Rendite
  const svg = page.locator('#dr-svg svg');
  await svg.scrollIntoViewIfNeeded();
  const box = await svg.boundingBox();
  await page.mouse.click(box.x + box.width / 2, box.y + box.height * 0.18);
  await expect(page.locator('#dr-ro')).toHaveText(/^([89]\d|100) Punkte$/);
});

test('Anlage-Check: Tabelle prüfen und Lösung zeigen, Anlage-Duell bis zum Ergebnis', async ({ page }) => {
  await page.goto(`${GA}#anlagecheck`);
  await page.locator('.ga-brief summary').first().click();
  await expect(page.locator('.ga-brief').first()).toContainText('Kündigungsfrist');
  const tab = page.locator('#ac-tab');
  await tab.locator('select[data-a="aktie"][data-k="s"]').selectOption('3');
  await tab.locator('select[data-a="festgeld"][data-k="l"]').selectOption('1');
  await page.locator('#ac-pruefen').click();
  await expect(page.locator('#ac-erg')).toContainText('1 von 24 richtig, 22 noch leer');
  await expect(tab.locator('td[data-zelle="aktie-s"]')).toHaveClass(/wrong/);
  await expect(tab.locator('select[data-a="aktie"][data-k="s"]')).toHaveAttribute('aria-invalid', 'true');
  await page.locator('#ac-zeigen').click();
  await page.locator('#ac-pruefen').click();
  await expect(page.locator('#ac-erg')).toContainText('24 von 24 richtig');
  // Duell: zehnmal antworten
  const duell = page.locator('#ac-d');
  for (let i = 0; i < 10; i++) {
    await duell.locator('[data-w="g"]').click();
    await duell.locator('#ac-d-weiter').click();
  }
  await expect(duell).toContainText('von 10 Duellen richtig');
});

test('Anlageberatung allein: Empfehlung prüfen, Anlegertest auswerten', async ({ page }) => {
  await page.goto(`${GA}#beratung`);
  const franka = page.locator('[data-abst="berat-franka"]');
  await expect(franka).toContainText('Ihr seid die Anlageberater · Franka');
  await franka.locator('input[value="0"]').check();
  await franka.locator('[data-abst-urteil]').click();
  await expect(franka.locator('.fb')).toContainText('Richtig!');
  const typ = page.locator('#be-typ');
  for (let i = 0; i < 4; i++) await typ.locator(`input[name="be-typ-${i}"][value="3"]`).check();
  await page.locator('#be-auswerten').click();
  await expect(page.locator('#be-erg')).toContainText('Chancenorientiert');
  await expect(page.locator('#be-erg .fb')).toBeFocused();
});

test('Schneeball-Rechner: Rechenaufgabe aus dem Material, typischer Fehler, früher Start', async ({ page }) => {
  await page.goto(`${GA}#schneeball`);
  await page.locator('#sb-a1').fill('31000');
  await page.locator('#sb-a2').fill('761.225,50');
  await page.locator('#sb-pruefen').click();
  await expect(page.locator('#sb-fb .fb').first()).toContainText('einfache Zinsen');
  await expect(page.locator('#sb-fb .fb').nth(1)).toContainText('Richtig!');
  await page.locator('#sb-a1').fill('76.123');
  await page.locator('#sb-pruefen').click();
  await expect(page.locator('#sb-fb .fb.ok')).toHaveCount(2);
  await expect(page.locator('#sb-vgl')).toContainText('Lena hat');
  // Ohne Sparrate rechnet der Rechner genau nach der Formel: 1.000 € × 1,05^30
  await regler(page.locator('#sb-r'), 0);
  await expect(page.locator('#sb-end')).toHaveText('4.322 €');
  await expect(page.locator('#sb-frueh')).toContainText('1.440 €');
});

test('Depot-Zeitmaschine: verteilen, durch die Krisen, Bilanz mit Vergleich; Verkaufen in der Krise', async ({ page }) => {
  await page.goto(`${GA}#zeitmaschine`);
  await regler(page.locator('#zm-etf'), 1000);
  await expect(page.locator('#zm-rest')).toHaveText('0 €');
  // Mehr als 1.000 € lassen sich nicht verteilen
  await regler(page.locator('#zm-bitcoin'), 500);
  await expect(page.locator('#zm-o-bitcoin')).toHaveText('0 €');
  await page.locator('#zm-start').click();
  await expect(page.locator('#zm-jahr')).toHaveText('Ende 2018');
  await expect(page.locator('#zm-jahr')).toBeFocused();
  await expect(page.locator('#zm')).toContainText('959 €');
  await page.locator('#zm-halten').click();
  for (const j of [2019, 2020, 2021]) { await expect(page.locator('#zm-jahr')).toHaveText(`Ende ${j}`); await page.locator('#zm-weiter').click(); }
  await expect(page.locator('#zm-jahr')).toHaveText('Ende 2022');
  await page.locator('#zm-halten').click();
  for (const j of [2023, 2024]) { await expect(page.locator('#zm-jahr')).toHaveText(`Ende ${j}`); await page.locator('#zm-weiter').click(); }
  await page.locator('#zm-ende').click();
  await expect(page.locator('#zm-jahr')).toHaveText('Bilanz Ende 2025');
  await expect(page.locator('#zm .big-num')).toHaveText('2.450 €');
  await expect(page.locator('.ga-strategie', { hasText: 'Alles Bitcoin' })).toContainText('6.317 €');
  await expect(page.locator('#zm')).toContainText('Hinterher ist man immer schlauer');
  // Nach dem Neuladen steht die Bilanz noch da
  await page.reload();
  await expect(page.locator('#zm-jahr')).toHaveText('Bilanz Ende 2025');
  // Neue Runde: Ende 2018 verkaufen
  await page.locator('#zm-neu').click();
  await page.locator('#zm-start').click();
  await page.locator('#zm-verkaufen').click();
  await expect(page.locator('#zm')).toContainText('Verkauft!');
  for (let i = 0; i < 7; i++) await page.locator('#zm-weiter').click();
  await page.locator('#zm-ende').click();
  await expect(page.locator('#zm .big-num')).toHaveText('973 €');
  await expect(page.locator('#zm')).toContainText('Hättest du durchgehalten, hättest du jetzt 2.450 €');
});

test.describe('Der Wolf of Saale', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } });
  test('Chat-Abenteuer: Finanz-Check, Enden werden gesammelt', async ({ page }) => {
    await page.goto(`${GA}#wolf`);
    const chat = page.locator('[data-chat="wolf-chat"]'), verlauf = chat.locator('[data-chat-verlauf]');
    const waehle = async t => { await chat.locator('[data-chat-wahl] button', { hasText: t }).click(); };
    await expect(verlauf).toContainText('Aus 800 € werden 8.000 €');
    await expect(chat.locator('[data-chat-n]')).toHaveText('0 von 4 entdeckt');
    await waehle('Woher weißt du');
    await expect(verlauf.locator('.chat-recht-kopf').last()).toContainText('Finanz-Check');
    await waehle('Lea fragen');
    await waehle('Für den Führerschein');
    await waehle('Junior-Depot');
    await expect(verlauf.locator('.chat-ende')).toContainText('Clever aufgeteilt');
    await chat.locator('[data-chat-nochmal]').click();
    await waehle('ich bin dabei');
    await waehle('Gutscheinkarte kaufen');
    await waehle('Mamas Kreditkarte');
    await expect(verlauf.locator('.chat-recht').last()).toContainText('Rug Pull');
    await expect(chat.locator('[data-chat-enden] li.bad')).toContainText('Abgezockt');
    await expect(chat.locator('[data-chat-n]')).toHaveText('2 von 4 entdeckt');
  });
});

test('Lernraum: Antwort an die Wand, Lehrerpanel nur für die Lehrkraft, Anlageberatung live', async ({ page: lk, browser }) => {
  test.setTimeout(120_000);
  await lk.goto(GA);
  await lk.locator('#btn-raum').click();
  await lk.locator('#lr-open').click();
  await expect(lk.locator('.lr-code')).toHaveText(/^[A-Z2-9]{6}$/);
  const code = (await lk.locator('.lr-code').textContent()).trim();
  const s = await device(browser, { viewport: { width: 390, height: 844 } });
  await s.goto(`${GA}#raum=${code}`);
  await s.locator('#lr-nick').fill('Kim');
  await s.locator('#lr-jgo').click();
  await expect(s.locator('#lr-dialog')).toContainText(`Du bist im Lernraum ${code} als Kim`);
  await s.locator('#modal-close').click();
  await lk.locator('#modal-close').click();

  // Schüler schickt eine Antwort an die Wand und sieht kein Lehrerpanel
  await s.goto(`${GA}#geldschmelze`);
  const feld = s.locator('[data-schreib="geld-giro-wand"]');
  await feld.locator('textarea').fill('Sicher ja, aber die Inflation frisst die Kaufkraft.');
  await feld.locator('[data-schreib-senden]').click();
  await expect(feld.locator('[data-schreib-status]')).toContainText('Deine Antwort hängt an der Wand');
  await expect(s.locator('.lehrerpanel')).toHaveCount(0);
  await expect(s.getByText('Lösung der Schätzfrage')).toHaveCount(0);

  // Lehrkraft: Lehrerpanel mit Hinweisen, Wand mit der Antwort
  await lk.goto(`${GA}#geldschmelze`);
  const panel = lk.locator('#modal-body > .lehrerpanel');
  await panel.locator('summary').click();
  await expect(panel).toContainText('Lösung der Schätzfrage');
  await expect(panel).toContainText('Für Alltagsgeld richtig');
  const wand = lk.locator('[data-schreib="geld-giro-wand"] [data-wand]');
  await expect(wand.locator('[data-wand-n]')).toHaveText('1');
  await wand.locator('[data-wand-zeigen]').click();
  await expect(wand.locator('.wand-karte')).toContainText('die Inflation frisst die Kaufkraft');

  // Anlageberatung live: Abstimmung auf dem Handy, ohne Wörter aus dem Gericht
  await lk.goto(`${GA}#beratung`);
  await lk.locator('[data-abst="berat-nayla"] [data-abst-start]').click();
  const fenster = s.locator('#lr-umfrage');
  await expect(fenster).toBeVisible();
  await expect(fenster).toContainText('Ihr seid die Anlageberater · Nayla');
  await expect(fenster.locator('[data-u-wahl]')).toHaveAttribute('aria-label', 'Deine Antwort');
  await fenster.locator('[data-u-w="1"]').click();
  await expect(lk.locator('[data-abst="berat-nayla"] [data-abst-n]')).toContainText('1 von 1');
  await lk.locator('[data-abst="berat-nayla"] [data-abst-auf]').click();
  await expect(fenster.locator('[data-u-urteil]')).toContainText('Richtig!');
  await expect(lk.locator('[data-abst="berat-nayla"]')).toContainText('Lösung: Festgeld für drei Jahre');
  expect(s.errors).toEqual([]);
  await s.context().close();
});
