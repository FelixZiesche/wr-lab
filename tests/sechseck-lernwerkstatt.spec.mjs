// Lernwerkstatt Magisches Sechseck: Navigation, Werkstätten, Wissen.
import { test, expect, SECHSECK } from './helpers.mjs';

const BEREICHE = {
  start: ['nachrichten', 'grundlagen'],
  ziele: ['preis', 'beschaeftigung', 'wachstum', 'aussen', 'verteilung', 'umwelt'],
  abwaegen: ['beziehungen', 'phillips', 'politik', 'check'],
  wissen: ['sichern', 'wissenscheck']
};

test('Startansicht mit Sechseck, Kennzahlen und Navigation', async ({ page }) => {
  await page.goto(SECHSECK);
  await expect(page).toHaveTitle('Lernwerkstatt Magisches Sechseck');
  await expect(page.locator('#view-title')).toHaveText('Lernwerkstatt Magisches Sechseck');
  await expect(page.locator('#hero-hex .hexcorner')).toHaveCount(6);
  await expect(page.locator('.lage .chip')).toHaveCount(6);
  await expect(page.locator('#ms-count')).toHaveText('0/17');

  // Steckbrief über eine Ecke des Sechsecks
  await page.locator('#hero-hex .hexcorner[data-k="P"]').click();
  await expect(page.locator('#modal')).toBeVisible();
  await expect(page.locator('#modal-title')).toContainText('Steckbrief: Preisniveau');
  await page.keyboard.press('Escape');
  await expect(page.locator('#modal')).toBeHidden();

  // Navigation Rail: jeder Bereich hat einen eigenen Titel
  for (const [id, title] of [['ziele', 'Die sechs Ziele messen'], ['abwaegen', 'Zielbeziehungen und Politik'], ['spiel', 'Planspiel Sechseck-Leben'], ['wissen', 'Sichern und wiederholen']]) {
    await page.locator(`#rail-items [data-dest="${id}"]`).click();
    await expect(page.locator('#view-title')).toHaveText(title);
    await expect(page).toHaveURL(new RegExp(`#${id}$`));
  }
});

test('Alle Werkstätten öffnen sich ohne Fehler', async ({ page }) => {
  await page.goto(SECHSECK);
  for (const [dest, tools] of Object.entries(BEREICHE)) {
    await page.locator(`#rail-items [data-dest="${dest}"]`).click();
    const ids = await page.locator('#view [data-tool]').evaluateAll(els => els.map(e => e.dataset.tool));
    expect(ids).toEqual(tools);
    for (const id of tools) {
      const card = page.locator(`#view [data-tool="${id}"]`);
      const title = (await card.locator('h3').textContent()).trim();
      await card.click();
      await expect(page.locator('#modal')).toBeVisible();
      await expect(page.locator('#modal-title')).toHaveText(title);
      await expect(page.locator('#modal-body .erk, #modal-body .panel').first()).toBeVisible();
      await page.locator('#modal-close').click();
      await expect(page.locator('#modal')).toBeHidden();
    }
  }
});

test('Barrierefreiheit: Phillips-Jahresleiste und Ecken des Sechsecks per Tastatur', async ({ page }) => {
  await page.goto(SECHSECK + '#phillips');
  // Jahresleiste statt winziger Punkte, Ansage über role=status, Fokus bleibt auf dem Knopf
  const jahr = page.getByRole('group', { name: 'Jahr wählen' }).getByRole('button', { name: '2022' });
  await jahr.focus();
  await page.keyboard.press(' ');
  await expect(jahr).toHaveAttribute('aria-pressed', 'true');
  await expect(jahr).toBeFocused();
  await expect(page.getByRole('status').filter({ hasText: 'Energiepreisschock' })).toBeVisible();
  // Punkt im Diagramm antippen markiert dasselbe Jahr in der Leiste
  await page.locator('#ph-svg .hexcorner[data-i="0"]').click();
  await expect(page.locator('#ph-info')).toContainText('2015');
  await expect(page.locator('#ph-jahre button[data-i="0"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(jahr).toHaveAttribute('aria-pressed', 'false');
  await page.keyboard.press('Escape');

  // Ecken tragen den sichtbaren Kurznamen im Namen, der Fokus bleibt nach dem Neuzeichnen auf der Ecke
  await page.goto('about:blank');
  await page.goto(SECHSECK + '#beziehungen');
  const ecke = page.getByRole('button', { name: 'U Umwelt auswählen' });
  await ecke.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#zb-svg .hexcorner[data-k="U"]')).toBeFocused();
  await expect(page.locator('#zb-svg .hexcorner[data-k="U"]')).toHaveAttribute('aria-pressed', 'true');
});

test('Erkenntnis aufdecken, Wissen sammeln, Glossar und große Schrift', async ({ page }) => {
  await page.goto(`${SECHSECK}#preis`);
  await expect(page.locator('#modal-title')).toHaveText('Warenkorb-Werkstatt');
  // Erst selbst formulieren, dann vergleichen: Der eigene Satz bleibt nur im Browser und steht neben dem Merksatz
  const erk = page.locator('[data-erk="preis"]');
  await expect(erk.locator('[data-erk-body]')).toBeHidden();
  await erk.getByLabel('Deine Erkenntnis in einem Satz').fill('Steigen die Preise schneller als mein Lohn, kann ich mir weniger leisten.');
  await expect(erk.locator('[data-erk-btn]')).toHaveText(/Mit dem Merksatz vergleichen/);
  await page.locator('[data-erk-btn]').click();
  await expect(page.locator('[data-erk-body]')).toBeVisible();
  await expect(erk.locator('[data-erk-eigen]')).toHaveValue('Steigen die Preise schneller als mein Lohn, kann ich mir weniger leisten.');
  const [links, rechts] = [await erk.locator('[data-erk-eigen]').boundingBox(), await erk.locator('[data-erk-body]').boundingBox()];
  expect(rechts.x).toBeGreaterThan(links.x + links.width - 1); // nebeneinander
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('ms6-erk-preis')))).toBe('Steigen die Preise schneller als mein Lohn, kann ich mir weniger leisten.');
  await expect(page.locator('#ms-count')).toHaveText('2/17');
  await page.locator('#modal-close').click();

  await page.locator('#btn-wissen').click();
  await expect(page.locator('#modal-title')).toHaveText('Mein Sechseck-Wissen');
  await expect(page.locator('#ws .ms-item:not(.locked)')).toHaveCount(2);
  await page.locator('#modal-close').click();

  await page.locator('#btn-glossar').click();
  await page.locator('#gs').fill('Inflation');
  expect(await page.locator('#gl dt').count()).toBeGreaterThan(0);
  await page.locator('#modal-close').click();

  await page.locator('#btn-fs').click();
  await expect(page.locator('html')).toHaveClass(/big/);
  await page.reload();
  await expect(page.locator('html')).toHaveClass(/big/);
  await expect(page.locator('#ms-count')).toHaveText('2/17');
  // Nach dem Neuladen: eigener Satz und Merksatz stehen weiter nebeneinander
  await page.goto(`${SECHSECK}#preis`);
  await expect(page.locator('[data-erk="preis"] [data-erk-eigen]')).toHaveValue('Steigen die Preise schneller als mein Lohn, kann ich mir weniger leisten.');
  await expect(page.locator('[data-erk="preis"] [data-erk-body]')).toBeVisible();
});

test('Leitfrage, Lernziele und Nachrichten-Blitzrunde mit Auflösung am Ende', async ({ page }) => {
  await page.goto(SECHSECK);
  await expect(page.locator('.banner h2')).toContainText('Warum kann die Politik nicht einfach alles gleichzeitig reparieren?');
  await expect(page.locator('.lernziele li')).toHaveCount(5);
  await page.locator('[data-gehzu="nachrichten"]').first().click();
  await expect(page.locator('#modal-title')).toHaveText('Gute Nachricht, schlechte Nachricht?');
  const box = page.locator('[data-blitz="news-blitz"]');
  await expect(box.locator('[data-blitz-n]')).toHaveText('Karte 1 von 8');
  // Verdeckt: keine Rückmeldung, immer „Kommt drauf an“ → richtig sind die Karten 3, 5, 6 und 8
  for (let i = 1; i <= 8; i++) await box.locator('[data-wahl="beides"]').click();
  await expect(box.locator('[data-blitz-ende]')).toContainText('Dein Bauchgefühl ist gespeichert');
  await page.goto('about:blank');
  await page.goto(`${SECHSECK}#sichern`);
  const aufl = page.locator('[data-blitz-aufl="news-blitz"]');
  await expect(aufl).toContainText('Dein Bauchgefühl: 4 von 8 richtig');
  await expect(aufl.locator('li.wrong').first()).toContainText('Ausbildungsvergütung');
  await page.locator('[data-schreib="sichern-wand"] summary', { hasText: 'So kannst du anfangen' }).click();
  await expect(page.locator('[data-schreib="sichern-wand"]')).toContainText('Zurück zur Leitfrage');
});

test('Erst schätzen, dann schieben: BIP-Blitzrunde und Schätzfragen in den Regler-Werkstätten', async ({ page }) => {
  await page.goto(`${SECHSECK}#wachstum`);
  const bip = page.locator('[data-blitz="bip-blitz"]');
  await bip.locator('[data-wahl="nicht"]').click();
  await expect(bip.locator('[data-blitz-fb] .fb.bad')).toContainText('richtig ist: BIP steigt');
  await expect(bip.locator('[data-blitz-fb]')).toContainText('Reparatur');
  for (const [id, richtig] of [['umwelt', 'um rund 42 Mio. t'], ['aussen', 'Er steigt'], ['verteilung', 'mehr als die Hälfte']]) {
    await page.goto('about:blank');
    await page.goto(`${SECHSECK}#${id}`);
    const t = page.locator(`[data-test="${id}-schaetzen"]`);
    await t.locator('label', { hasText: richtig }).click();
    await t.locator('[data-pruefen]').click();
    await expect(t.locator('[data-ergebnis]')).toHaveText('1 von 1 richtig');
    await expect(t.locator('.test-erkl')).toBeVisible();
  }
});

test.describe('Handy (390 px)', () => {
  test.use({ viewport: { width: 390, height: 844 } });
  test('Diagramme: Schrift auf dem Handy mindestens 12 px groß', async ({ page }) => {
    // Gerenderte Größe = Schriftgröße im SVG × Maßstab (auch bei gedrehtem Text)
    const kleinste = sel => page.locator(sel).evaluate(el => Math.min(...[...el.querySelectorAll('svg text')].map(t => {
      const m = t.getScreenCTM(); return parseFloat(getComputedStyle(t).fontSize) * Math.hypot(m.a, m.b);
    })));
    for (const [id, sel] of [['umwelt', '#th-svg'], ['preis', '#pr-thermo'], ['phillips', '#ph-svg'], ['politik', '#ps-radar']]) {
      await page.goto('about:blank');
      await page.goto(`${SECHSECK}#${id}`);
      await expect(page.locator(`${sel} svg`)).toBeVisible();
      expect(await kleinste(sel), sel).toBeGreaterThanOrEqual(11.9);
    }
    await page.goto('about:blank');
    await page.goto(SECHSECK);
    expect(await kleinste('#hero-hex'), 'Sechseck auf der Startseite').toBeGreaterThanOrEqual(11.9);
    // Der Titel oben passt ganz hinein
    const h1 = await page.locator('#view-title').evaluate(h => h.dataset.kurz);
    expect(h1).toBe('Sechseck');
  });
});

// Rechenwerkstätten mit bekannten Eingaben; die Erwartungswerte sind von Hand gerechnet (Rechnung im Kommentar)
test.describe('Rechnen in den Werkstätten', () => {
  test.use({ ohneLive: true });

  test('Warenkorb: Preisindex nach Laspeyres, Reallohn und Kaufkraft', async ({ page }) => {
    await page.goto(`${SECHSECK}#preis`);
    const zeile = i => page.locator('#pr-body tr').nth(i);
    await expect(page.locator('#pr-body tr')).toHaveCount(10);
    // Beispielkorb: 197,09 € (2025) und 221,29 € (2026) → 221,29 ÷ 197,09 × 100 = 112,28 → 112,3; Rate +12,3 %
    await expect(page.locator('#pr-idx')).toHaveText('112,3');
    await expect(page.locator('#pr-rate')).toHaveText('+12,3 %');
    await expect(page.locator('#pr-cost')).toHaveText('Warenkorb kostet 197,09 € (2025) und 221,29 € (2026) pro Monat: +24,20 €.');
    // Eigener Korb: nur zwei Güter, alle anderen Mengen 0
    for (let i = 2; i < 10; i++) await zeile(i).locator('[data-f="q"]').fill('0');
    for (const [i, q, p0, p1] of [[0, '2', '5', '5.5'], [1, '1', '40', '42']]) {
      await zeile(i).locator('[data-f="q"]').fill(q);
      await zeile(i).locator('[data-f="p0"]').fill(p0);
      await zeile(i).locator('[data-f="p1"]').fill(p1);
    }
    // 2 × 5 + 1 × 40 = 50 € (2025), 2 × 5,50 + 1 × 42 = 53 € (2026) → 53 ÷ 50 × 100 = 106,0; Rate +6,0 %
    await expect(page.locator('#pr-idx')).toHaveText('106,0');
    await expect(page.locator('#pr-rate')).toHaveText('+6,0 %');
    await expect(page.locator('#pr-cost')).toHaveText('Warenkorb kostet 50,00 € (2025) und 53,00 € (2026) pro Monat: +3,00 €.');
    // Änderung je Gut: 5,50 ÷ 5 − 1 = +10,0 %, 42 ÷ 40 − 1 = +5,0 %
    await expect(page.locator('[data-ch="0"]')).toHaveText('+10,0 %');
    await expect(page.locator('[data-ch="1"]')).toHaveText('+5,0 %');
    // Reallohn: (1 + 0,05) ÷ (1 + 0,02) − 1 = 0,029412 → +2,94 %; Faustregel 5 − 2 = +3,0 %
    // 1.100 € × 1,05 = 1.155 €; real 1.100 € × 1,029412 = 1.132,35 → 1.132 €
    await page.locator('#rl-n').fill('5');
    await page.locator('#rl-i').fill('2');
    await expect(page.locator('#rl-r')).toHaveText('+2,94 %');
    await expect(page.locator('#rl-t')).toContainText('Nach der Erhöhung 1.155 € – das entspricht real 1.132 € in heutiger Kaufkraft');
    await expect(page.locator('#rl-t')).toContainText('die Faustregel n − i ergibt +3,0 %');
    // Lohn steigt langsamer als die Preise: (1 + 0,02) ÷ (1 + 0,05) − 1 = −0,028571 → −2,86 %
    await page.locator('#rl-n').fill('2');
    await page.locator('#rl-i').fill('5');
    await expect(page.locator('#rl-r')).toHaveText('−2,86 %');
    // Kaufkraft: 1.000 € ÷ 1,02^10 = 1.000 ÷ 1,218994 = 820,35 → 820 €; 1.000 ÷ 1,05^20 = 1.000 ÷ 2,653298 = 376,89 → 377 €
    await page.locator('#kk-i').fill('2');
    await page.locator('#kk-y').fill('10');
    await expect(page.locator('#kk-r')).toHaveText('820 €');
    await page.locator('#kk-i').fill('5');
    await page.locator('#kk-y').fill('20');
    await expect(page.locator('#kk-r')).toHaveText('377 €');
  });

  test('Arbeitsmarkt: Arbeitslosenquote = Arbeitslose ÷ (Erwerbstätige + Arbeitslose) × 100', async ({ page }) => {
    await page.goto(`${SECHSECK}#beschaeftigung`);
    // Deutschland: 2.994 ÷ (43.790 + 2.994) × 100 = 2.994 ÷ 46.784 × 100 = 6,3996 → 6,4 %
    await page.locator('[data-preset="de"]').click();
    await expect(page.locator('#al-q')).toHaveText('6,4 %');
    // Thüringen: 69 ÷ (1.027 + 69) × 100 = 69 ÷ 1.096 × 100 = 6,2956 → 6,3 % (wie die amtliche Quote im Text)
    await page.locator('[data-preset="th"]').click();
    await expect(page.locator('#al-q')).toHaveText('6,3 %');
    await expect(page.locator('#al-ao')).toHaveText('69');
    await expect(page.locator('#al-eo')).toHaveText('1.027');
    // Eigene Werte: 2.000 ÷ (38.000 + 2.000) × 100 = 5,0 %; 1.500 ÷ (48.000 + 1.500) × 100 = 3,0303 → 3,0 %
    await page.locator('#al-a').fill('2000');
    await page.locator('#al-e').fill('38000');
    await expect(page.locator('#al-q')).toHaveText('5,0 %');
    await page.locator('#al-a').fill('1500');
    await page.locator('#al-e').fill('48000');
    await expect(page.locator('#al-q')).toHaveText('3,0 %');
  });

  test('Lorenzkurve: Gini-Koeffizient aus fünf Fünfteln', async ({ page }) => {
    await page.goto(`${SECHSECK}#verteilung`);
    // Gini = 1 − Σ (L(i−1) + L(i)) × 0,2 mit den kumulierten Anteilen L (Trapezregel, fünf gleich große Gruppen)
    // Verfügbare Einkommen 7,5/13/17,5/23/39: L = 0,075/0,205/0,38/0,61/1
    //   Σ = 0,075 + 0,28 + 0,585 + 0,99 + 1,61 = 3,54 → 1 − 0,708 = 0,292 → 0,29
    await expect(page.locator('#lz-g')).toHaveText('0,29');
    // Markteinkommen 1,5/8/16/25/49,5: L = 0,015/0,095/0,255/0,505/1
    //   Σ = 0,015 + 0,11 + 0,35 + 0,76 + 1,505 = 2,74 → 1 − 0,548 = 0,452 → 0,45
    await page.locator('[data-lz="markt"]').click();
    await expect(page.locator('#lz-g')).toHaveText('0,45');
    // Vermögen 0/1,5/6,5/18/74: L = 0/0,015/0,08/0,26/1 → Σ = 0 + 0,015 + 0,095 + 0,34 + 1,26 = 1,71 → 1 − 0,342 = 0,658 → 0,66
    await page.locator('[data-lz="verm"]').click();
    await expect(page.locator('#lz-g')).toHaveText('0,66');
    await page.locator('[data-lz="gleich"]').click();
    await expect(page.locator('#lz-g')).toHaveText('0,00');
    // Eigene Verteilung, unsortiert 40/10/20/20/10: sortiert 10/10/20/20/40, L = 0,1/0,2/0,4/0,6/1
    //   Σ = 0,1 + 0,3 + 0,6 + 1,0 + 1,6 = 3,6 → 1 − 0,72 = 0,28; Hinweis auf die neue Ordnung erscheint
    for (const [i, v] of [[1, '40'], [2, '10'], [3, '20'], [4, '20'], [5, '10']]) await page.locator(`#lz${i}`).fill(v);
    await expect(page.locator('#lz-g')).toHaveText('0,28');
    await expect(page.locator('#lz-sort')).toBeVisible();
    await expect(page.locator('#lz-sum')).toHaveText('Summe: 100 %');
    await expect(page.locator('#lz1o')).toHaveText('40,0 %');
    // Ein Fünftel hat alles: L = 0/0/0/0/1 → Σ = 1 → 1 − 0,2 = 0,80 (mehr geht mit fünf Gruppen nicht)
    for (const [i, v] of [[1, '0'], [2, '0'], [3, '0'], [4, '0'], [5, '100']]) await page.locator(`#lz${i}`).fill(v);
    await expect(page.locator('#lz-g')).toHaveText('0,80');
    await expect(page.locator('#lz-sort')).toBeHidden();
    // Regler ergeben zusammen nur 50: Die Werkstatt rechnet auf 100 % um, Gleichverteilung → 0,00
    for (const i of [1, 2, 3, 4, 5]) await page.locator(`#lz${i}`).fill('10');
    await expect(page.locator('#lz-g')).toHaveText('0,00');
    await expect(page.locator('#lz-sum')).toHaveText('Summe der Regler: 50,0 – die Werkstatt rechnet automatisch auf 100 % um.');
    await expect(page.locator('#lz3o')).toHaveText('20,0 %');
  });
});
