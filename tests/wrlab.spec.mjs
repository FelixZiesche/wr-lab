// WR-Lab: Startseite, Navigation zwischen Themen und themenübergreifender Live-Klassenraum.
import { test, expect, device, readDoc, writeDoc } from './helpers.mjs';

test('Startseite zeigt die Themen als Karten mit Foto und Bildnachweis', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('WR-Lab');
  const karte = page.locator('a.topic[href="sechseck/"]');
  await expect(karte).toContainText('Magisches Sechseck');
  await expect(karte.locator('img')).toHaveJSProperty('complete', true);
  expect(await karte.locator('img').evaluate(i => i.naturalWidth)).toBeGreaterThan(0);
  await expect(karte.locator('figcaption')).toHaveText('Foto: Lukas D. / Unsplash');
  await karte.click();
  await expect(page).toHaveURL(/\/sechseck\/(#start)?$/);
  await expect(page.locator('#view-title')).toHaveText('Lernwerkstatt Magisches Sechseck');

  // Zurück zur Startseite über das Logo in der Navigation Rail
  await page.locator('.rail-logo').click();
  await expect(page).toHaveTitle('WR-Lab');
});

test('Auf dem Handy führt das Symbol in der Kopfleiste zur Startseite', async ({ browser }) => {
  const handy = await device(browser, { viewport: { width: 390, height: 844 } });
  await handy.goto('/sechseck/');
  await expect(handy.locator('.rail-logo')).toBeHidden();
  await handy.locator('.home-link').click();
  await expect(handy).toHaveTitle('WR-Lab');
  expect(handy.errors).toEqual([]);
  await handy.context().close();
});

test('Adresse ohne Schrägstrich am Ende funktioniert', async ({ page }) => {
  await page.goto('/sechseck');
  await expect(page.locator('#hero-hex .hexcorner')).toHaveCount(6);
});

test('Live-Raum speichert das Thema, Codes aus anderen Themen werden erkannt', async ({ page, browser }) => {
  await page.goto('/sechseck/#spiel');
  await page.locator('.mode-card[data-m="lk"]').click();
  await page.locator('#mkroom').click();
  await expect(page.locator('.panel .code').first()).toHaveText(/^[A-Z2-9]{6}$/);
  const code = (await page.locator('.panel .code').first().textContent()).trim();
  const raum = await readDoc(`rooms/${code}`);
  expect(raum.fields.topic.stringValue).toBe('sechseck');

  // Ein Raum aus einem Thema, das es hier nicht gibt
  await writeDoc('rooms/FREMD2', { owner: 'x', open: true, topic: 'kaufvertrag', gameId: 'g', round: 0, phase: 'lobby', decisions: [] });
  const s = await device(browser);
  await s.goto('/sechseck/#join=FREMD2');
  await s.locator('#jn').fill('Testi');
  await s.locator('#jgo').click();
  await expect(s.locator('#jerr')).toHaveText('Dieser Code gehört zu einem anderen Thema.');
  // Der richtige Code funktioniert weiter
  await s.locator('#jc').fill(code);
  await s.locator('#jgo').click();
  await expect(s.locator('[data-f]')).toHaveCount(8);
  expect(s.errors).toEqual([]);
  await s.context().close();
});
