// Lernwerkstatt Magisches Sechseck: Navigation, Werkstätten, Wissen.
import { test, expect, SECHSECK } from './helpers.mjs';

const BEREICHE = {
  start: ['grundlagen'],
  ziele: ['preis', 'beschaeftigung', 'wachstum', 'aussen', 'verteilung', 'umwelt'],
  abwaegen: ['beziehungen', 'phillips', 'politik', 'check'],
  wissen: ['quiz', 'sichern']
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
      const title = (await card.locator('h4').textContent()).trim();
      await card.click();
      await expect(page.locator('#modal')).toBeVisible();
      await expect(page.locator('#modal-title')).toHaveText(title);
      await expect(page.locator('#modal-body .erk, #modal-body .panel').first()).toBeVisible();
      await page.locator('#modal-close').click();
      await expect(page.locator('#modal')).toBeHidden();
    }
  }
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
