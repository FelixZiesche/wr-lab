// Lernwerkstatt Magisches Sechseck: Navigation, Werkstätten, Wissen.
import { test, expect, SECHSECK } from './helpers.mjs';

const BEREICHE = {
  start: ['grundlagen'],
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
  await expect(page.locator('#ms-count')).toHaveText('0/16');

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
  await page.locator('[data-erk-btn]').click();
  await expect(page.locator('[data-erk-body]')).toBeVisible();
  await expect(page.locator('#ms-count')).toHaveText('2/16');
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
  await expect(page.locator('#ms-count')).toHaveText('2/16');
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
